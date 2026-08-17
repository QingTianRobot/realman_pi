"""ROS-neutral six-axis Cartesian velocity session.

The session owns one arm for its whole lifetime.  A daemon thread drives the
controller from monotonic deadlines; incoming DDS messages only replace the
latest command and never determine the control period.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
import math
import threading
import time
from typing import Any, Callable, Mapping, Sequence

from .motion_types import MotionSettings, ReferenceType, limit_vector_delta


class VelocityTerminalState(IntEnum):
    SUCCEEDED = 0
    CANCELED = 1
    ABORTED = 2
    WATCHDOG_STOP = 3


class VelocityFeedbackPhase(IntEnum):
    VALIDATING = 0
    EXECUTING = 1
    STOPPING = 2


@dataclass(frozen=True)
class VelocityResult:
    success: bool
    terminal_state: VelocityTerminalState
    api2_status: int
    message: str


@dataclass(frozen=True)
class _ValidatedGoal:
    reference_type: ReferenceType
    reference_name: str
    ros_frame_id: str
    control_period_ms: int
    watchdog_ms: int
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float
    follow: bool
    trajectory_mode: int
    radio: int


@dataclass
class _Reservation:
    request: Any
    result: VelocityResult | None = None


_ZERO = (0.0,) * 6
_ARMS = frozenset({"l", "m", "r"})


class CartesianVelocitySession:
    """One cancellable velocity session for one namespaced arm."""

    def __init__(
        self,
        *,
        arm_id: str,
        adapter: Any,
        ownership: Any,
        settings: MotionSettings,
        active_frame: Callable[[ReferenceType], Any] | Mapping[Any, Any] | None = None,
        active_reference: Callable[[ReferenceType], Any] | Mapping[Any, Any] | None = None,
        motion_allowed: Callable[[str], bool] | None = None,
        coordinate_manager: Any | None = None,
        monotonic: Callable[[], float] = time.monotonic,
        logger: Any | None = None,
        action_type: Any | None = None,
        avoid_singularity_flag: int = 1,
    ) -> None:
        if arm_id not in _ARMS:
            raise ValueError("arm_id must be one of l, m, or r")
        if not isinstance(settings, MotionSettings):
            raise TypeError("settings must be MotionSettings")
        if active_frame is None:
            active_frame = active_reference
        if active_frame is None:
            raise ValueError("active_frame is required")
        if not isinstance(avoid_singularity_flag, int) or avoid_singularity_flag < 0:
            raise ValueError("avoid_singularity_flag must be a non-negative integer")
        self.arm_id = arm_id
        self.adapter = adapter
        self.ownership = ownership
        self.settings = settings
        self._active_frame = active_frame
        self._motion_allowed = motion_allowed
        self._coordinate_manager = coordinate_manager
        self._monotonic = monotonic
        self._logger = logger
        self.action_type = action_type
        self._avoid_singularity_flag = avoid_singularity_flag

        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        self._stop_event = threading.Event()
        self._done_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._running = False
        self._owns_ownership = False
        self._reservation: _Reservation | None = None
        self._active_request: Any | None = None
        self._fast_stop_in_progress = False
        self._last_fast_stop_status: int | None = None
        self._goal: _ValidatedGoal | None = None
        self._command = _ZERO
        self._limited_command = _ZERO
        self._command_received_at = 0.0
        self._last_tick_at = 0.0
        self._stop_sent = False
        self._result: VelocityResult | None = None
        self._last_api2_status = 0
        self._phase = VelocityFeedbackPhase.VALIDATING
        self._last_feedback_at = 0.0

    @property
    def running(self) -> bool:
        with self._lock:
            return self._running

    @property
    def result(self) -> VelocityResult:
        with self._lock:
            if self._result is None:
                return VelocityResult(False, VelocityTerminalState.ABORTED, 0, "not started")
            return self._result

    @property
    def thread(self) -> threading.Thread | None:
        with self._lock:
            return self._thread

    def start(self, goal: Any) -> bool:
        """Validate and start a session; return false for an ownership/API failure."""
        with self._condition:
            if self._fast_stop_in_progress:
                reservation = self._reservation
                if reservation is None or goal is not reservation.request:
                    return False
                while self._fast_stop_in_progress:
                    self._condition.wait()
            if self._running:
                self._set_result_locked(False, VelocityTerminalState.ABORTED, -1, "session is already running")
                return False
            reservation = self._reservation
            if reservation is not None and goal is not reservation.request:
                return False
            if reservation is not None and reservation.result is not None:
                self._reservation = None
                self._result = reservation.result
                self._condition.notify_all()
                return False
            if reservation is None:
                try:
                    acquired = bool(self.ownership.acquire(self.arm_id))
                except Exception as error:
                    self._set_result_locked(
                        False,
                        VelocityTerminalState.ABORTED,
                        -1,
                        f"arm ownership acquire failed: {error}",
                    )
                    return False
                if not acquired:
                    self._set_result_locked(
                        False,
                        VelocityTerminalState.ABORTED,
                        -1,
                        "arm is busy",
                    )
                    return False
                self._owns_ownership = True
            try:
                validated = self._validate_owned_goal(goal)
            except Exception as error:
                if reservation is not None:
                    self._reservation = None
                self._release_ownership_locked()
                self._condition.notify_all()
                if reservation is not None:
                    self._set_result_locked(
                        False,
                        VelocityTerminalState.ABORTED,
                        -1,
                        f"velocity goal revalidation failed: {error}",
                    )
                    return False
                raise
            if reservation is not None:
                self._reservation = None
            try:
                init_status = _status(self.adapter.set_movev_init(
                    self._avoid_singularity_flag,
                    int(validated.reference_type),
                    validated.control_period_ms,
                ))
            except Exception as error:
                self._release_ownership_locked()
                self._set_result_locked(False, VelocityTerminalState.ABORTED, -1, f"velocity initialization failed: {error}")
                return False
            if init_status != 0:
                self._release_ownership_locked()
                self._set_result_locked(False, VelocityTerminalState.ABORTED, init_status, "velocity initialization failed")
                return False
            try:
                zero_status = _status(self.adapter.movev(
                    list(_ZERO), validated.follow, validated.trajectory_mode, validated.radio
                ))
            except Exception as error:
                self._release_ownership_locked()
                self._set_result_locked(False, VelocityTerminalState.ABORTED, -1, f"zero velocity initialization failed: {error}")
                return False
            if zero_status != 0:
                self._release_ownership_locked()
                self._set_result_locked(False, VelocityTerminalState.ABORTED, zero_status, "zero velocity initialization failed")
                return False
            now = self._monotonic()
            self._goal = validated
            self._active_request = goal
            self._command = _ZERO
            self._limited_command = _ZERO
            self._command_received_at = now
            self._last_tick_at = now
            self._last_api2_status = 0
            self._phase = VelocityFeedbackPhase.EXECUTING
            self._stop_sent = False
            self._result = None
            self._last_fast_stop_status = None
            self._done_event.clear()
            self._stop_event.clear()
            self._running = True
            self._thread = threading.Thread(
                target=self._run_loop,
                name=f"realman-{self.arm_id}-cartesian-velocity",
                daemon=True,
            )
            self._thread.start()
            return True

    def accept_command(self, command: Any) -> bool:
        """Accept a finite, frame-matched TwistStamped command."""
        vector, frame_id = _twist_vector(command)
        with self._lock:
            if not self._running or self._goal is None:
                if self._result is not None:
                    raise RuntimeError("session has terminated; commands are rejected")
                raise RuntimeError("session is not running")
            if frame_id != self._goal.ros_frame_id:
                raise ValueError(
                    f"TwistStamped header.frame_id must equal active frame_id {self._goal.ros_frame_id!r}"
                )
            linear_speed = math.hypot(*vector[:3])
            angular_speed = math.hypot(*vector[3:])
            if linear_speed > self.settings.max_linear_speed_mps + 1.0e-12:
                raise ValueError("linear speed exceeds configured limit")
            if angular_speed > self.settings.max_angular_speed_radps + 1.0e-12:
                raise ValueError("angular speed exceeds configured limit")
            self._command = vector
            self._command_received_at = self._monotonic()
            return True

    def tick(self) -> VelocityResult | None:
        """Send one bounded command, or terminate safely when the watchdog expires."""
        with self._lock:
            if not self._running or self._goal is None:
                return self._result
            now = self._monotonic()
            if now - self._command_received_at >= self._goal.watchdog_ms / 1000.0:
                return self._terminate_locked(
                    VelocityTerminalState.WATCHDOG_STOP,
                    "velocity command watchdog expired",
                )
            dt = max(0.0, now - self._last_tick_at)
            self._last_tick_at = now
            target = _clip_speed(self._command, self.settings)
            linear = limit_vector_delta(
                self._limited_command[:3], target[:3], self._goal.max_linear_accel_mps2, dt
            )
            angular = limit_vector_delta(
                self._limited_command[3:], target[3:], self._goal.max_angular_accel_radps2, dt
            )
            limited = tuple(linear + angular)
            status = _status(self.adapter.movev(
                list(limited), self._goal.follow, self._goal.trajectory_mode, self._goal.radio
            ))
            self._limited_command = limited
            self._last_api2_status = status
            if status != 0:
                return self._terminate_locked(
                    VelocityTerminalState.ABORTED,
                    "Cartesian velocity command failed",
                    api2_status=status,
                )
            return None

    def cancel(self) -> VelocityResult:
        """Stop a running session and return CANCELED unless slow-stop fails."""
        return self._stop_and_join(VelocityTerminalState.CANCELED, "velocity session canceled")

    def shutdown(self) -> int:
        """Stop the loop before releasing ownership; return the stop API status."""
        result = self._stop_and_join(VelocityTerminalState.CANCELED, "velocity session shutdown")
        return result.api2_status

    def fast_stop_if_owned(self) -> int | None:
        """Claim and fast-stop an active/reserved velocity session, else return none."""
        with self._condition:
            if self._fast_stop_in_progress:
                while self._fast_stop_in_progress:
                    self._condition.wait()
                return self._last_fast_stop_status
            reservation = self._reservation
            reserved = (
                reservation is not None
                and reservation.result is None
                and self._owns_ownership
            )
            active = self._running and self._owns_ownership
            if not reserved and not active:
                return None
            self._fast_stop_in_progress = True
            self._last_fast_stop_status = None
            initialized = active and self._goal is not None
            goal = self._goal if initialized else None
            thread = self._thread if active else None
            self._running = False
            self._stop_event.set()

        if thread is not None and thread is not threading.current_thread():
            thread.join()

        zero_status = 0
        if goal is not None:
            try:
                zero_status = _status(
                    self.adapter.movev(
                        list(_ZERO),
                        goal.follow,
                        goal.trajectory_mode,
                        goal.radio,
                    )
                )
            except Exception:
                zero_status = -1
        try:
            stop_status = _status(self.adapter.stop())
        except Exception:
            stop_status = -1
        status = zero_status or stop_status
        result = VelocityResult(
            False,
            VelocityTerminalState.ABORTED,
            status,
            "velocity session fast-stopped"
            if status == 0
            else f"velocity fast stop failed with API2 status {status}",
        )

        with self._condition:
            if reserved and self._reservation is reservation:
                self._reservation.result = result
            self._result = result
            self._active_request = None
            self._stop_sent = True
            self._done_event.set()
            self._last_fast_stop_status = status
            self._fast_stop_in_progress = False
            self._release_ownership_locked()
            self._condition.notify_all()
        return status

    # rclpy ActionServer lifecycle callbacks ---------------------------------
    def goal_callback(self, goal_request: Any) -> Any:
        with self._condition:
            if (
                self._running
                or self._reservation is not None
                or self._fast_stop_in_progress
            ):
                return _goal_reject()
            try:
                acquired = bool(self.ownership.acquire(self.arm_id))
            except Exception as error:
                self._log("error", f"velocity ownership acquire failed: {error}")
                return _goal_reject()
            if not acquired:
                return _goal_reject()
            self._owns_ownership = True
            try:
                self._validate_owned_goal(goal_request)
            except Exception as error:
                self._release_ownership_locked()
                self._log("warn", f"Rejecting Cartesian velocity goal: {error}")
                return _goal_reject()
            self._reservation = _Reservation(goal_request)
            self._last_fast_stop_status = None
        return _goal_accept()

    def cancel_callback(self, goal_handle: Any) -> Any:
        request = getattr(goal_handle, "request", None)
        with self._condition:
            if (
                self._reservation is not None
                and request is self._reservation.request
            ):
                if self._fast_stop_in_progress:
                    return _cancel_accept()
                if self._reservation.result is None:
                    self._reservation.result = VelocityResult(
                        True,
                        VelocityTerminalState.CANCELED,
                        0,
                        "velocity session canceled before execution",
                    )
                    self._release_ownership_locked()
                self._condition.notify_all()
                return _cancel_accept()
            if request is not self._active_request:
                return _cancel_reject()
        return _cancel_accept()

    def accepted_callback(self, goal_handle: Any) -> None:
        goal_handle.execute()

    def execute(self, goal_handle: Any) -> Any:
        if not self.start(goal_handle.request):
            result = self.result
            if result.terminal_state == VelocityTerminalState.CANCELED:
                goal_handle.canceled()
            else:
                goal_handle.abort()
            return self._ros_result(result)
        while self.running:
            if getattr(goal_handle, "is_cancel_requested", False):
                self.cancel()
                break
            self._publish_feedback(goal_handle)
            self._done_event.wait(timeout=min(0.1, self._goal.watchdog_ms / 1000.0 if self._goal else 0.1))
        with self._condition:
            while self._fast_stop_in_progress:
                self._condition.wait()
        result = self.result
        if result.terminal_state == VelocityTerminalState.CANCELED:
            goal_handle.canceled()
        elif result.terminal_state in (VelocityTerminalState.ABORTED, VelocityTerminalState.WATCHDOG_STOP):
            goal_handle.abort()
        else:
            goal_handle.succeed()
        return self._ros_result(result)

    # Internals ---------------------------------------------------------------
    def _validate_owned_goal(self, goal: Any) -> _ValidatedGoal:
        if not self._owns_ownership:
            raise RuntimeError("velocity goal validation requires arm ownership")
        if self._coordinate_manager is not None:
            allowed = bool(self._coordinate_manager.motion_allowed(self.arm_id))
        elif self._motion_allowed is not None:
            allowed = bool(self._motion_allowed(self.arm_id))
        else:
            allowed = True
        if not allowed:
            raise ValueError("active coordinates are not verified")
        return self._validate_goal(goal)

    def _validate_goal(self, goal: Any) -> _ValidatedGoal:
        reference_type = _enum_value(_field(goal, "reference_type"), ReferenceType, "reference_type")
        reference_name = _field(goal, "reference_name")
        if not isinstance(reference_name, str) or not reference_name:
            raise ValueError("reference_name must be a non-empty string")
        controller_name, ros_frame_id = self._frame_for(reference_type)
        if reference_name != controller_name:
            raise ValueError(
                f"reference_name must equal active verified frame {controller_name!r}"
            )
        period = _positive_int(_field(goal, "control_period_ms"), "control_period_ms")
        watchdog = _positive_int(_field(goal, "watchdog_ms"), "watchdog_ms")
        linear_accel = _positive_float(
            _field(goal, "max_linear_accel_mps2"), "max_linear_accel_mps2"
        )
        angular_accel = _positive_float(
            _field(goal, "max_angular_accel_radps2"), "max_angular_accel_radps2"
        )
        follow = _field(goal, "follow")
        if not isinstance(follow, bool):
            raise ValueError("follow must be a boolean")
        trajectory_mode = _integer(_field(goal, "trajectory_mode"), "trajectory_mode")
        radio = _integer(_field(goal, "radio"), "radio")
        return _ValidatedGoal(
            reference_type,
            reference_name,
            ros_frame_id,
            period,
            watchdog,
            linear_accel,
            angular_accel,
            follow,
            trajectory_mode,
            radio,
        )

    def _frame_for(self, reference_type: ReferenceType) -> tuple[str, str]:
        source = self._active_frame
        value = source(reference_type) if callable(source) else _mapping_get(source, reference_type)
        if isinstance(value, str):
            return value, value
        if isinstance(value, Sequence) and not isinstance(value, (str, bytes)) and len(value) == 2:
            controller, ros = value
            if isinstance(controller, str) and isinstance(ros, str) and controller and ros:
                return controller, ros
        controller = getattr(value, "controller_name", None)
        ros = getattr(value, "ros_frame_id", None)
        if isinstance(controller, str) and isinstance(ros, str) and controller and ros:
            return controller, ros
        raise ValueError("active frame mapping must provide controller_name and ros_frame_id")

    def _run_loop(self) -> None:
        with self._lock:
            goal = self._goal
        if goal is None:
            return
        period = goal.control_period_ms / 1000.0
        deadline = self._monotonic()
        try:
            while not self._stop_event.is_set():
                deadline += period
                wait = max(0.0, deadline - self._monotonic())
                if self._stop_event.wait(wait):
                    break
                self.tick()
        except Exception as error:
            with self._lock:
                if self._running:
                    self._terminate_locked(VelocityTerminalState.ABORTED, f"velocity loop failed: {error}")
        finally:
            with self._condition:
                if self._thread is threading.current_thread():
                    self._thread = None
                if not self._running and not self._fast_stop_in_progress:
                    self._release_ownership_locked()
                self._condition.notify_all()

    def _stop_and_join(self, state: VelocityTerminalState, message: str) -> VelocityResult:
        with self._condition:
            while self._fast_stop_in_progress:
                self._condition.wait()
            if self._reservation is not None and not self._running:
                if self._reservation.result is None:
                    self._reservation.result = VelocityResult(True, state, 0, message)
                self._result = self._reservation.result
                self._release_ownership_locked()
                self._condition.notify_all()
                return self._result
            running = self._running
            thread = self._thread
            self._stop_event.set()
        if thread is not None and thread is not threading.current_thread():
            thread.join(timeout=max(1.0, self.settings.watchdog_sec * 2.0))
        with self._condition:
            if running and self._running:
                self._terminate_locked(state, message)
            elif self._result is None:
                self._set_result_locked(True, state, 0, message)
            self._release_ownership_locked()
            self._condition.notify_all()
            return self._result or VelocityResult(True, state, 0, message)

    def _terminate_locked(
        self,
        state: VelocityTerminalState,
        message: str,
        *,
        api2_status: int = 0,
    ) -> VelocityResult:
        if self._result is not None and not self._running:
            return self._result
        self._phase = VelocityFeedbackPhase.STOPPING
        self._stop_event.set()
        stop_status = 0
        if not self._stop_sent and self._goal is not None:
            self._stop_sent = True
            try:
                zero_status = _status(self.adapter.movev(
                    list(_ZERO), self._goal.follow, self._goal.trajectory_mode, self._goal.radio
                ))
            except Exception:
                zero_status = -1
            try:
                stop_status = _status(self.adapter.slow_stop())
            except Exception:
                stop_status = -1
            stop_status = zero_status or stop_status
            if api2_status == 0:
                api2_status = stop_status
        self._last_api2_status = api2_status
        terminal_state = state
        if state == VelocityTerminalState.CANCELED and stop_status != 0:
            terminal_state = VelocityTerminalState.ABORTED
        success = terminal_state in (
            VelocityTerminalState.CANCELED,
            VelocityTerminalState.WATCHDOG_STOP,
        ) and stop_status == 0
        if terminal_state == VelocityTerminalState.ABORTED:
            success = False
        self._running = False
        self._active_request = None
        self._set_result_locked(success, terminal_state, api2_status, message)
        self._done_event.set()
        if self._thread is None or self._thread is threading.current_thread():
            self._release_ownership_locked()
        return self._result

    def _set_result_locked(self, success: bool, state: VelocityTerminalState, status: int, message: str) -> None:
        self._result = VelocityResult(bool(success), state, int(status), message)
        self._done_event.set()

    def _release_ownership_locked(self) -> None:
        if not self._owns_ownership:
            return
        self._owns_ownership = False
        try:
            self.ownership.release(self.arm_id)
        except Exception as error:
            self._log("error", f"arm ownership release failed: {error}")

    def _publish_feedback(self, goal_handle: Any) -> None:
        publish = getattr(goal_handle, "publish_feedback", None)
        if publish is None or self.action_type is None:
            return
        try:
            feedback = self.action_type.Feedback()
            with self._lock:
                feedback.commanded_linear_velocity_mps = list(self._command[:3])
                feedback.commanded_angular_velocity_radps = list(self._command[3:])
                feedback.limited_linear_velocity_mps = list(self._limited_command[:3])
                feedback.limited_angular_velocity_radps = list(self._limited_command[3:])
                feedback.phase = int(self._phase)
                feedback.active_reference_type = int(self._goal.reference_type) if self._goal else 0
                feedback.active_reference_name = self._goal.reference_name if self._goal else ""
                feedback.command_age_ms = int(max(0.0, self._monotonic() - self._command_received_at) * 1000.0)
                feedback.api2_status = self._last_api2_status
                feedback.detail = self._result.message if self._result else "executing"
            publish(feedback)
        except Exception as error:
            self._log("warn", f"velocity feedback publication failed: {error}")

    def _ros_result(self, result: VelocityResult) -> Any:
        if self.action_type is None:
            return result
        message = self.action_type.Result()
        message.success = result.success
        message.terminal_state = int(result.terminal_state)
        message.api2_status = result.api2_status
        message.message = result.message
        return message

    def _log(self, level: str, message: str) -> None:
        method = getattr(self._logger, level, None) if self._logger is not None else None
        if method is not None:
            method(message)


def _twist_vector(command: Any) -> tuple[tuple[float, ...], str]:
    header = getattr(command, "header", None)
    frame_id = getattr(header, "frame_id", None)
    if not isinstance(frame_id, str):
        raise ValueError("TwistStamped header.frame_id must be a string")
    twist = getattr(command, "twist", None)
    linear = getattr(twist, "linear", None)
    angular = getattr(twist, "angular", None)
    try:
        values = tuple(
            float(getattr(item, axis))
            for item, axis in (
                (linear, "x"), (linear, "y"), (linear, "z"),
                (angular, "x"), (angular, "y"), (angular, "z"),
            )
        )
    except (AttributeError, TypeError, ValueError):
        raise ValueError("TwistStamped values must be finite numbers") from None
    if not all(math.isfinite(value) for value in values):
        raise ValueError("TwistStamped values must be finite")
    return values, frame_id


def _clip_speed(vector: Sequence[float], settings: MotionSettings) -> tuple[float, ...]:
    linear_norm = math.hypot(*vector[:3])
    angular_norm = math.hypot(*vector[3:])
    linear_scale = min(1.0, settings.max_linear_speed_mps / linear_norm) if linear_norm else 1.0
    angular_scale = min(1.0, settings.max_angular_speed_radps / angular_norm) if angular_norm else 1.0
    return tuple(
        value * (linear_scale if index < 3 else angular_scale)
        for index, value in enumerate(vector)
    )


def _field(value: Any, name: str) -> Any:
    if isinstance(value, Mapping):
        return value.get(name)
    return getattr(value, name, None)


def _mapping_get(value: Mapping[Any, Any], key: ReferenceType) -> Any:
    if key in value:
        return value[key]
    if int(key) in value:
        return value[int(key)]
    return value[key.name] if key.name in value else None


def _enum_value(value: Any, enum_type: type[IntEnum], field: str) -> IntEnum:
    if isinstance(value, bool):
        raise ValueError(f"{field} must be a valid enum")
    try:
        return enum_type(int(value))
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be BASE, WORK, or TOOL") from None


def _positive_float(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be positive")
    value = float(value)
    if not math.isfinite(value) or value <= 0.0:
        raise ValueError(f"{field} must be positive")
    return value


def _positive_int(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{field} must be a positive integer")
    return value


def _integer(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{field} must be an integer")
    return value


def _status(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError, OverflowError):
        return -1


def _goal_accept() -> Any:
    try:
        from rclpy.action import GoalResponse

        return GoalResponse.ACCEPT
    except ImportError:
        return True


def _goal_reject() -> Any:
    try:
        from rclpy.action import GoalResponse

        return GoalResponse.REJECT
    except ImportError:
        return False


def _cancel_accept() -> Any:
    try:
        from rclpy.action import CancelResponse

        return CancelResponse.ACCEPT
    except ImportError:
        return True


def _cancel_reject() -> Any:
    try:
        from rclpy.action import CancelResponse

        return CancelResponse.REJECT
    except ImportError:
        return False


__all__ = [
    "CartesianVelocitySession",
    "VelocityFeedbackPhase",
    "VelocityResult",
    "VelocityTerminalState",
]
