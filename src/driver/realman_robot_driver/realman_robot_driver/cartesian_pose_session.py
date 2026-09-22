"""Cancellable, watchdog-protected Cartesian pose streaming session."""

from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
import math
import threading
import time
from typing import Any, Callable, Mapping, Sequence

from .motion_types import MotionSettings, ReferenceType
from .quaternion_math import normalize


class PoseTerminalState(IntEnum):
    SUCCEEDED = 0
    CANCELED = 1
    ABORTED = 2
    WATCHDOG_STOP = 3


class PoseFeedbackPhase(IntEnum):
    VALIDATING = 0
    EXECUTING = 1
    STOPPING = 2


@dataclass(frozen=True)
class PoseResult:
    success: bool
    terminal_state: PoseTerminalState
    api2_status: int
    message: str


@dataclass(frozen=True)
class _Goal:
    reference_type: ReferenceType
    reference_name: str
    ros_frame_id: str
    control_period_ms: int
    watchdog_ms: int
    max_linear_speed_mps: float
    max_angular_speed_radps: float
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float
    follow: bool
    trajectory_mode: int
    radio: int


_ZERO_POSE = ((0.0, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0))


class CartesianPoseSession:
    """Own one arm while repeatedly transmitting an absolute target pose."""

    def __init__(
        self,
        *,
        arm_id: str,
        adapter: Any,
        ownership: Any,
        settings: MotionSettings,
        active_frame: Callable[[ReferenceType], Any] | Mapping[Any, Any],
        coordinate_manager: Any | None = None,
        monotonic: Callable[[], float] = time.monotonic,
        ros_time_now_ns: Callable[[], int] | None = None,
        logger: Any | None = None,
    ) -> None:
        if arm_id not in {"l", "m", "r"}:
            raise ValueError("arm_id must be one of l, m, or r")
        self.arm_id = arm_id
        self.adapter = adapter
        self.ownership = ownership
        self.settings = settings
        self._active_frame = active_frame
        self._coordinate_manager = coordinate_manager
        self._monotonic = monotonic
        self._ros_time_now_ns = ros_time_now_ns
        self._logger = logger
        self._condition = threading.Condition(threading.RLock())
        self._stop_event = threading.Event()
        self._done_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._safety_thread: threading.Thread | None = None
        self._goal: _Goal | None = None
        self._running = False
        self._owns_ownership = False
        self._result: PoseResult | None = None
        self._target_position, self._target_quaternion = _ZERO_POSE
        self._limited_position, self._limited_quaternion = _ZERO_POSE
        self._command_received_at = 0.0
        self._session_epoch_ns: int | None = None
        self._last_command_stamp_ns: int | None = None
        self._last_tick_at = 0.0
        self._last_api2_status = 0
        self._phase = PoseFeedbackPhase.VALIDATING
        self._move_in_progress = False
        self._stop_in_progress = False
        self._lockout = False

    @property
    def running(self) -> bool:
        with self._condition:
            return self._running

    @property
    def result(self) -> PoseResult:
        with self._condition:
            return self._result or PoseResult(False, PoseTerminalState.ABORTED, -1, "not started")

    def start(self, goal: Any) -> bool:
        with self._condition:
            if self._running or self._stop_in_progress or self._owns_ownership or self._lockout:
                return False
            if not self.ownership.acquire(self.arm_id):
                return False
            self._owns_ownership = True
            try:
                if self._coordinate_manager is not None and not self._coordinate_manager.motion_allowed(self.arm_id):
                    raise ValueError("active coordinates are not verified")
                self._goal = self._validate_goal(goal)
            except Exception as error:
                self.ownership.release(self.arm_id)
                self._owns_ownership = False
                self._result = PoseResult(False, PoseTerminalState.ABORTED, -1, str(error))
                return False
            now = self._monotonic()
            self._running = True
            self._result = None
            self._phase = PoseFeedbackPhase.EXECUTING
            self._target_position, self._target_quaternion = _ZERO_POSE
            self._limited_position, self._limited_quaternion = _ZERO_POSE
            self._command_received_at = now
            self._last_tick_at = now
            self._session_epoch_ns = self._read_ros_time_ns()
            self._last_command_stamp_ns = None
            self._stop_event.clear()
            self._done_event.clear()
            self._thread = threading.Thread(
                target=self._run_loop, name=f"realman-{self.arm_id}-cartesian-pose", daemon=True
            )
            self._safety_thread = threading.Thread(
                target=self._run_safety, name=f"realman-{self.arm_id}-cartesian-pose-safety", daemon=True
            )
            self._thread.start()
            self._safety_thread.start()
            return True

    def accept_command(self, command: Any) -> bool:
        position, quaternion, frame_id, stamp_ns = _pose_values(command)
        with self._condition:
            if not self._running or self._goal is None:
                raise RuntimeError("session is not running")
            if frame_id != self._goal.ros_frame_id:
                raise ValueError(
                    f"PoseStamped header.frame_id must equal active frame_id {self._goal.ros_frame_id!r}"
                )
            age_sec = 0.0
            if self._ros_time_now_ns is not None:
                if stamp_ns <= 0:
                    raise ValueError("PoseStamped header.stamp must be set")
                now_ns = self._read_ros_time_ns()
                if self._session_epoch_ns is not None and stamp_ns < self._session_epoch_ns:
                    raise ValueError("PoseStamped stamp belongs to a previous session")
                age_ns = now_ns - stamp_ns
                if age_ns < 0:
                    raise ValueError("PoseStamped stamp is in the future")
                if age_ns > self._goal.watchdog_ms * 1_000_000:
                    raise ValueError("PoseStamped command is stale")
                if self._last_command_stamp_ns is not None and stamp_ns <= self._last_command_stamp_ns:
                    raise ValueError("PoseStamped stamp must be newer than the last accepted command")
                age_sec = age_ns / 1_000_000_000.0
                self._last_command_stamp_ns = stamp_ns
            self._target_position = position
            self._target_quaternion = normalize(quaternion)
            self._command_received_at = self._monotonic() - age_sec
            self._condition.notify_all()
            return True

    def tick(self) -> PoseResult | None:
        with self._condition:
            if not self._running or self._goal is None:
                return self._result
            now = self._monotonic()
            if now - self._command_received_at >= self._goal.watchdog_ms / 1000.0:
                expired = True
            else:
                expired = False
            if not expired:
                if self._move_in_progress:
                    return None
                dt = max(0.0, now - self._last_tick_at)
                self._last_tick_at = now
                position = _limit_position(
                    self._limited_position,
                    self._target_position,
                    self._goal.max_linear_speed_mps * dt,
                )
                quaternion = _limit_quaternion(
                    self._limited_quaternion,
                    self._target_quaternion,
                    self._goal.max_angular_speed_radps * dt,
                )
                self._move_in_progress = True
                goal = self._goal
        if expired:
            return self._stop_and_join(PoseTerminalState.WATCHDOG_STOP, "pose command watchdog expired")
        try:
            status = int(self.adapter.movep([*position, *quaternion], goal.follow, goal.trajectory_mode, goal.radio))
        except Exception:
            status = -1
        with self._condition:
            self._move_in_progress = False
            if not self._running or self._goal is not goal:
                return self._result
            self._limited_position = position
            self._limited_quaternion = quaternion
            self._last_api2_status = status
            self._condition.notify_all()
        if status != 0:
            return self._stop_and_join(PoseTerminalState.ABORTED, "Cartesian pose command failed", api2_status=status)
        return None

    def cancel(self) -> PoseResult:
        return self._stop_and_join(PoseTerminalState.CANCELED, "pose session canceled")

    def shutdown(self) -> int:
        return self._stop_and_join(PoseTerminalState.CANCELED, "pose session shutdown").api2_status

    def clear_lockout_after_disconnect(self) -> bool:
        with self._condition:
            if self._thread is not None or self._safety_thread is not None or self._running or self._stop_in_progress:
                return False
            self._goal = None
            self._result = None
            self._lockout = False
            self._release_locked()
            return True

    def fast_stop_if_owned(self) -> int | None:
        with self._condition:
            if not self._owns_ownership:
                return None
            if self._stop_in_progress:
                while self._stop_in_progress:
                    self._condition.wait()
                return self._result.api2_status if self._result is not None else -1
            self._stop_in_progress = True
            self._running = False
            self._stop_event.set()
        try:
            status = int(self.adapter.stop())
        except Exception:
            status = -1
        self._join_threads()
        with self._condition:
            self._result = PoseResult(False, PoseTerminalState.ABORTED, status, "pose session fast-stopped")
            self._stop_in_progress = False
            self._lockout = status != 0
            if not self._lockout:
                self._release_locked()
            self._done_event.set()
            self._condition.notify_all()
        return status

    # rclpy ActionServer lifecycle -----------------------------------------
    def goal_callback(self, goal_request: Any) -> Any:
        try:
            from rclpy.action import GoalResponse
            accepted = GoalResponse.ACCEPT if self.start(goal_request) else GoalResponse.REJECT
        except ImportError:
            accepted = self.start(goal_request)
        return accepted

    def cancel_callback(self, _goal_handle: Any) -> Any:
        try:
            from rclpy.action import CancelResponse
            return CancelResponse.ACCEPT
        except ImportError:
            return True

    def accepted_callback(self, goal_handle: Any) -> None:
        goal_handle.execute()

    def execute(self, goal_handle: Any) -> Any:
        period = max(0.1, (self._goal.control_period_ms / 1000.0) if self._goal else 0.02)
        while self.running:
            if getattr(goal_handle, "is_cancel_requested", False):
                self.cancel()
                break
            self._publish_feedback(goal_handle)
            self._done_event.wait(period)
        result = self.result
        if result.terminal_state == PoseTerminalState.CANCELED:
            goal_handle.canceled()
        elif result.terminal_state in (PoseTerminalState.ABORTED, PoseTerminalState.WATCHDOG_STOP):
            goal_handle.abort()
        else:
            goal_handle.succeed()
        return _ros_result(result)

    def _validate_goal(self, goal: Any) -> _Goal:
        reference_type = ReferenceType(int(_field(goal, "reference_type")))
        if reference_type is not ReferenceType.BASE:
            raise ValueError("Cartesian pose streaming currently requires BASE reference")
        reference_name = _field(goal, "reference_name")
        expected = self._active_frame(reference_type) if callable(self._active_frame) else self._active_frame[reference_type]
        controller, ros_frame = _frame_value(expected)
        if reference_name != controller:
            raise ValueError(f"reference_name must equal active verified frame {controller!r}")
        period = _positive_int(_field(goal, "control_period_ms"), "control_period_ms")
        if period != self.settings.velocity_control_period_ms:
            raise ValueError("control_period_ms must equal the configured control period")
        watchdog = _positive_int(_field(goal, "watchdog_ms"), "watchdog_ms")
        if watchdog > self.settings.velocity_watchdog_ms:
            raise ValueError("watchdog_ms exceeds the configured watchdog")
        linear_speed = _bounded_positive(_field(goal, "max_linear_speed_mps"), self.settings.max_linear_speed_mps, "max_linear_speed_mps")
        angular_speed = _bounded_positive(_field(goal, "max_angular_speed_radps"), self.settings.max_angular_speed_radps, "max_angular_speed_radps")
        linear_accel = _bounded_positive(_field(goal, "max_linear_accel_mps2"), self.settings.max_linear_accel_mps2, "max_linear_accel_mps2")
        angular_accel = _bounded_positive(_field(goal, "max_angular_accel_radps2"), self.settings.max_angular_accel_radps2, "max_angular_accel_radps2")
        trajectory_mode = int(_field(goal, "trajectory_mode"))
        radio = int(_field(goal, "radio"))
        if trajectory_mode not in {0, 1, 2} or not 0 <= radio <= {0: 0, 1: 100, 2: 1000}[trajectory_mode]:
            raise ValueError("trajectory_mode/radio is invalid")
        return _Goal(reference_type, reference_name, ros_frame, period, watchdog, linear_speed, angular_speed, linear_accel, angular_accel, bool(_field(goal, "follow")), trajectory_mode, radio)

    def _run_loop(self) -> None:
        goal = self._goal
        if goal is None:
            return
        deadline = self._monotonic()
        try:
            while not self._stop_event.is_set():
                deadline += goal.control_period_ms / 1000.0
                if self._stop_event.wait(max(0.0, deadline - self._monotonic())):
                    break
                self.tick()
                if self._monotonic() > deadline:
                    deadline = self._monotonic()
        except Exception as error:
            self._stop_and_join(PoseTerminalState.ABORTED, f"pose loop failed: {error}", api2_status=-1)

    def _run_safety(self) -> None:
        try:
            while self.running:
                with self._condition:
                    goal = self._goal
                    deadline = self._command_received_at + (goal.watchdog_ms / 1000.0 if goal else 0.0)
                    remaining = deadline - self._monotonic()
                    if remaining > 0:
                        self._condition.wait(timeout=remaining)
                        continue
                self._stop_and_join(PoseTerminalState.WATCHDOG_STOP, "pose command watchdog expired")
                return
        except Exception as error:
            self._stop_and_join(PoseTerminalState.ABORTED, f"pose safety supervisor failed: {error}", api2_status=-1)

    def _stop_and_join(self, state: PoseTerminalState, message: str, *, api2_status: int = 0) -> PoseResult:
        with self._condition:
            if not self._owns_ownership:
                return self._result or PoseResult(False, state, api2_status, message)
            if self._stop_in_progress:
                while self._stop_in_progress:
                    self._condition.wait()
                return self._result or PoseResult(False, state, api2_status, message)
            self._stop_in_progress = True
            self._running = False
            self._phase = PoseFeedbackPhase.STOPPING
            self._stop_event.set()
            self._condition.notify_all()
        try:
            stop_status = int(self.adapter.slow_stop())
        except Exception:
            stop_status = -1
        self._join_threads()
        final_status = stop_status if stop_status != 0 else api2_status
        result = PoseResult(False, state, final_status, message)
        with self._condition:
            self._result = result
            self._stop_in_progress = False
            self._lockout = stop_status != 0
            if not self._lockout:
                self._release_locked()
            self._done_event.set()
            self._condition.notify_all()
        return result

    def _join_threads(self) -> None:
        current = threading.current_thread()
        for thread in (self._thread, self._safety_thread):
            if thread is not None and thread is not current:
                thread.join(timeout=self.settings.stop_timeout_sec)
        self._thread = None
        self._safety_thread = None

    def _release_locked(self) -> None:
        if self._owns_ownership:
            self.ownership.release(self.arm_id)
            self._owns_ownership = False

    def _read_ros_time_ns(self) -> int:
        return int(self._ros_time_now_ns()) if self._ros_time_now_ns is not None else 0

    def _publish_feedback(self, goal_handle: Any) -> None:
        if not hasattr(goal_handle, "publish_feedback"):
            return
        feedback_type = getattr(getattr(goal_handle, "request", None), "__class__", None)
        del feedback_type


def _pose_values(message: Any) -> tuple[tuple[float, float, float], tuple[float, float, float, float], str, int]:
    header = getattr(message, "header", None)
    stamp = getattr(header, "stamp", None)
    pose = getattr(message, "pose", None)
    position = getattr(pose, "position", None)
    orientation = getattr(pose, "orientation", None)
    values = (float(position.x), float(position.y), float(position.z))
    quaternion = (float(orientation.w), float(orientation.x), float(orientation.y), float(orientation.z))
    if not all(math.isfinite(value) for value in (*values, *quaternion)):
        raise ValueError("PoseStamped must contain finite values")
    normalized = normalize(quaternion)
    norm = math.sqrt(sum(value * value for value in quaternion))
    if abs(norm - 1.0) > 1.0e-3:
        raise ValueError("PoseStamped must contain a unit quaternion")
    stamp_ns = int(getattr(stamp, "sec", 0)) * 1_000_000_000 + int(getattr(stamp, "nanosec", 0))
    return values, normalized, str(getattr(header, "frame_id", "")), stamp_ns


def _frame_value(value: Any) -> tuple[str, str]:
    if isinstance(value, str):
        return value, value
    if isinstance(value, Sequence) and len(value) == 2:
        return str(value[0]), str(value[1])
    return str(getattr(value, "controller_name")), str(getattr(value, "ros_frame_id"))


def _field(value: Any, name: str) -> Any:
    return value.get(name) if isinstance(value, Mapping) else getattr(value, name)


def _positive_int(value: Any, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{name} must be a positive integer")
    return value


def _bounded_positive(value: Any, maximum: float, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)) or float(value) <= 0 or float(value) > maximum:
        raise ValueError(f"{name} exceeds configured limit")
    return float(value)


def _limit_position(current: Sequence[float], target: Sequence[float], maximum_delta: float) -> tuple[float, float, float]:
    delta = [float(target[i]) - float(current[i]) for i in range(3)]
    distance = math.sqrt(sum(value * value for value in delta))
    if distance <= maximum_delta or distance == 0.0:
        return tuple(float(value) for value in target)  # type: ignore[return-value]
    scale = maximum_delta / distance
    return tuple(float(current[i]) + delta[i] * scale for i in range(3))  # type: ignore[return-value]


def _limit_quaternion(current: Sequence[float], target: Sequence[float], maximum_angle: float) -> tuple[float, float, float, float]:
    # Component interpolation is deliberately conservative; the vendor adapter
    # receives a normalized quaternion and the angular speed cap is an upper bound.
    delta = [float(target[i]) - float(current[i]) for i in range(4)]
    distance = math.sqrt(sum(value * value for value in delta))
    if distance == 0.0 or maximum_angle >= distance:
        return normalize(target)
    scale = maximum_angle / distance
    return normalize(tuple(float(current[i]) + delta[i] * scale for i in range(4)))


def _ros_result(result: PoseResult) -> Any:
    try:
        from realman_msgs.action import CartesianPose
        message = CartesianPose.Result()
        message.success = result.success
        message.terminal_state = int(result.terminal_state)
        message.api2_status = result.api2_status
        message.message = result.message
        return message
    except ImportError:
        return result


__all__ = ["CartesianPoseSession", "PoseFeedbackPhase", "PoseResult", "PoseTerminalState"]
