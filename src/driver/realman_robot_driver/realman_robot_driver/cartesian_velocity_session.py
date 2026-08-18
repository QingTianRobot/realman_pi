"""ROS-neutral six-axis Cartesian velocity session.

The session owns one arm for its whole lifetime.  A daemon thread drives the
controller from monotonic deadlines; incoming DDS messages only replace the
latest command and never determine the control period.
"""

from __future__ import annotations

from collections import OrderedDict
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
    request: Any | None
    request_id: int
    result: VelocityResult | None = None


_ZERO = (0.0,) * 6
_ARMS = frozenset({"l", "m", "r"})
_COMPLETED_ACTION_RESULT_LIMIT = 128
_MIN_FEEDBACK_PERIOD_SEC = 0.1


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
        ros_time_now_ns: Callable[[], int] | None = None,
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
        self._ros_time_now_ns = ros_time_now_ns
        self._avoid_singularity_flag = avoid_singularity_flag

        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        self._stop_event = threading.Event()
        self._done_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._safety_thread: threading.Thread | None = None
        self._running = False
        self._owns_ownership = False
        self._reservation: _Reservation | None = None
        self._completed_action_results: OrderedDict[int, VelocityResult] = OrderedDict()
        self._active_request: Any | None = None
        self._fast_stop_in_progress = False
        self._last_fast_stop_status: int | None = None
        self._goal: _ValidatedGoal | None = None
        self._command = _ZERO
        self._limited_command = _ZERO
        self._command_received_at = 0.0
        self._session_epoch_ns: int | None = None
        self._last_command_stamp_ns: int | None = None
        self._last_tick_at = 0.0
        self._stop_sent = False
        self._result: VelocityResult | None = None
        self._last_api2_status = 0
        self._phase = VelocityFeedbackPhase.VALIDATING
        self._starting = False
        self._start_token = 0
        self._velocity_initialized = False
        self._movev_in_progress = False
        self._slow_stop_in_progress = False
        self._slow_stop_call_in_progress = False
        self._lockout = False
        self._thread_join_timeout_sec = settings.stop_timeout_sec

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
        return self._start(goal, require_reservation=False)

    def _start(self, goal: Any, *, require_reservation: bool) -> bool:
        with self._condition:
            if self._fast_stop_in_progress:
                reservation = self._reservation
                if (
                    not require_reservation
                    or reservation is None
                    or goal is not reservation.request
                ):
                    return False
                while self._fast_stop_in_progress:
                    self._condition.wait()
            if (
                self._running
                or self._starting
                or self._slow_stop_in_progress
                or self._lockout
            ):
                return False
            reservation = self._reservation
            if require_reservation:
                if reservation is None or goal is not reservation.request:
                    return False
            elif reservation is not None:
                return False
            if reservation is not None and reservation.result is not None:
                self._complete_reservation_locked(reservation, reservation.result)
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
                result = VelocityResult(
                    False,
                    VelocityTerminalState.ABORTED,
                    -1,
                    f"velocity goal revalidation failed: {error}",
                )
                if reservation is not None:
                    self._complete_reservation_locked(reservation, result)
                self._release_ownership_locked()
                self._condition.notify_all()
                if reservation is not None:
                    self._result = result
                    return False
                raise
            self._start_token += 1
            token = self._start_token
            self._starting = True
            self._goal = validated
            self._velocity_initialized = False
            self._movev_in_progress = False
            self._phase = VelocityFeedbackPhase.VALIDATING
            self._stop_sent = False
            self._result = None
            self._last_fast_stop_status = None
            self._done_event.clear()
            self._stop_event.clear()

        init_error: Exception | None = None
        try:
            init_status = _status(
                self.adapter.set_movev_init(
                    self._avoid_singularity_flag,
                    int(validated.reference_type),
                    validated.control_period_ms,
                )
            )
        except Exception as error:
            init_status = -1
            init_error = error

        finish_canceled_start = False
        with self._condition:
            if token != self._start_token:
                canceled = self._canceled_start_result_locked(reservation)
                self._starting = False
                self._condition.notify_all()
                if canceled is None:
                    return False
                if init_status == 0:
                    self._velocity_initialized = True
                    finish_canceled_start = True
                else:
                    self._finish_start_failure_locked(reservation, canceled)
                    return False
            if init_status != 0:
                result = VelocityResult(
                    False,
                    VelocityTerminalState.ABORTED,
                    init_status,
                    f"velocity initialization failed: {init_error}"
                    if init_error is not None
                    else "velocity initialization failed",
                )
                self._finish_start_failure_locked(reservation, result)
                return False
            if not finish_canceled_start:
                self._velocity_initialized = True
                self._movev_in_progress = True

        if finish_canceled_start:
            self._stop_and_join(
                VelocityTerminalState.CANCELED,
                "velocity session canceled during initialization",
            )
            return False

        zero_error: Exception | None = None
        try:
            zero_status = _status(
                self.adapter.movev(
                    list(_ZERO),
                    validated.follow,
                    validated.trajectory_mode,
                    validated.radio,
                )
            )
        except Exception as error:
            zero_status = -1
            zero_error = error

        finish_canceled_start = False
        recover_initial_zero = False
        thread_start_error: Exception | None = None
        failed_thread_name = ""
        with self._condition:
            self._movev_in_progress = False
            if token != self._start_token:
                canceled = self._canceled_start_result_locked(reservation)
                self._starting = False
                self._condition.notify_all()
                if canceled is None:
                    return False
                finish_canceled_start = True
            if zero_status != 0:
                self._starting = False
                recover_initial_zero = True
            if finish_canceled_start:
                pass
            if not finish_canceled_start and not recover_initial_zero:
                now = self._monotonic()
                self._active_request = goal
                self._command = _ZERO
                self._limited_command = _ZERO
                self._command_received_at = now
                self._session_epoch_ns = self._read_ros_time_ns()
                self._last_command_stamp_ns = None
                self._last_tick_at = now
                self._last_api2_status = 0
                self._phase = VelocityFeedbackPhase.EXECUTING
                self._starting = False
                self._running = True
                self._thread = threading.Thread(
                    target=self._run_loop,
                    name=f"realman-{self.arm_id}-cartesian-velocity",
                    daemon=True,
                )
                self._safety_thread = threading.Thread(
                    target=self._run_safety_supervisor,
                    name=f"realman-{self.arm_id}-cartesian-velocity-safety",
                    daemon=True,
                )
                try:
                    self._thread.start()
                except Exception as error:
                    thread_start_error = error
                    failed_thread_name = "control"
                if thread_start_error is None:
                    try:
                        self._safety_thread.start()
                    except Exception as error:
                        thread_start_error = error
                        failed_thread_name = "safety supervisor"
                if self._thread.ident is None:
                    self._thread = None
                if self._safety_thread.ident is None:
                    self._safety_thread = None
                if thread_start_error is not None:
                    self._stop_event.set()
                self._condition.notify_all()
                if thread_start_error is None:
                    if reservation is not None and self._reservation is reservation:
                        self._reservation = None
                    return True

        if thread_start_error is not None:
            self._stop_and_join(
                VelocityTerminalState.ABORTED,
                f"velocity {failed_thread_name} thread start failed: "
                f"{thread_start_error}",
                api2_status=-1,
            )
            return False

        if recover_initial_zero:
            self._stop_and_join(
                VelocityTerminalState.CANCELED
                if finish_canceled_start
                else VelocityTerminalState.ABORTED,
                f"zero velocity initialization failed: {zero_error}"
                if zero_error is not None
                else "zero velocity initialization failed",
                initial_zero_status=zero_status,
                send_zero_command=False,
            )
            return False
        self._stop_and_join(
            VelocityTerminalState.CANCELED,
            "velocity session canceled during zero initialization",
        )
        return False

    def accept_command(self, command: Any) -> bool:
        """Accept a finite, frame-matched TwistStamped command."""
        vector, frame_id = _twist_vector(command)
        stamp_ns = _twist_stamp_ns(command)
        with self._condition:
            if not self._running or self._goal is None:
                if self._result is not None:
                    raise RuntimeError("session has terminated; commands are rejected")
                raise RuntimeError("session is not running")
            if frame_id != self._goal.ros_frame_id:
                raise ValueError(
                    f"TwistStamped header.frame_id must equal active frame_id {self._goal.ros_frame_id!r}"
                )
            command_age_sec = 0.0
            if self._ros_time_now_ns is not None:
                if stamp_ns is None or stamp_ns <= 0:
                    raise ValueError("TwistStamped header.stamp must be set")
                now_ns = self._read_ros_time_ns()
                epoch_ns = self._session_epoch_ns
                if epoch_ns is None:
                    raise ValueError("TwistStamped stamp has no active session epoch")
                if stamp_ns < epoch_ns:
                    raise ValueError("TwistStamped stamp belongs to a previous session")
                age_ns = now_ns - stamp_ns
                if age_ns < 0:
                    raise ValueError("TwistStamped stamp is in the future")
                if age_ns > self._goal.watchdog_ms * 1_000_000:
                    raise ValueError("TwistStamped command is stale")
                if (
                    self._last_command_stamp_ns is not None
                    and stamp_ns <= self._last_command_stamp_ns
                ):
                    raise ValueError(
                        "TwistStamped stamp must be newer than the last accepted command"
                    )
                command_age_sec = age_ns / 1_000_000_000.0
            linear_speed = math.hypot(*vector[:3])
            angular_speed = math.hypot(*vector[3:])
            if linear_speed > self.settings.max_linear_speed_mps + 1.0e-12:
                raise ValueError("linear speed exceeds configured limit")
            if angular_speed > self.settings.max_angular_speed_radps + 1.0e-12:
                raise ValueError("angular speed exceeds configured limit")
            self._command = vector
            self._command_received_at = self._monotonic() - command_age_sec
            if self._ros_time_now_ns is not None:
                self._last_command_stamp_ns = stamp_ns
            self._condition.notify_all()
            return True

    def tick(self) -> VelocityResult | None:
        """Send one bounded command, or terminate safely when the watchdog expires."""
        with self._condition:
            if not self._running or self._goal is None:
                return self._result
            now = self._monotonic()
            if now - self._command_received_at >= self._goal.watchdog_ms / 1000.0:
                watchdog_expired = True
            else:
                watchdog_expired = False
            if not watchdog_expired:
                if self._movev_in_progress:
                    return None
                goal = self._goal
                token = self._start_token
                dt = max(0.0, now - self._last_tick_at)
                self._last_tick_at = now
                target = _clip_speed(self._command, self.settings)
                linear = limit_vector_delta(
                    self._limited_command[:3],
                    target[:3],
                    goal.max_linear_accel_mps2,
                    dt,
                )
                angular = limit_vector_delta(
                    self._limited_command[3:],
                    target[3:],
                    goal.max_angular_accel_radps2,
                    dt,
                )
                limited = tuple(linear + angular)
                self._movev_in_progress = True

        if watchdog_expired:
            return self._stop_and_join(
                VelocityTerminalState.WATCHDOG_STOP,
                "velocity command watchdog expired",
            )

        try:
            status = _status(
                self.adapter.movev(
                    list(limited), goal.follow, goal.trajectory_mode, goal.radio
                )
            )
        except Exception:
            status = -1

        with self._condition:
            self._movev_in_progress = False
            self._condition.notify_all()
            if (
                token != self._start_token
                or not self._running
                or self._goal is not goal
            ):
                return self._result
            self._limited_command = limited
            self._last_api2_status = status

        if status != 0:
            return self._stop_and_join(
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
        with self._condition:
            if (
                not self._owns_ownership
                and not self._lockout
                and self._thread is None
                and self._safety_thread is None
                and not self._running
                and not self._starting
                and not self._movev_in_progress
                and not self._slow_stop_call_in_progress
                and not self._slow_stop_in_progress
                and not self._fast_stop_in_progress
                and self._reservation is None
                and not self._velocity_initialized
            ):
                return 0
        result = self._stop_and_join(VelocityTerminalState.CANCELED, "velocity session shutdown")
        return result.api2_status

    def clear_lockout_after_disconnect(self) -> bool:
        """Release retained safety ownership after a confirmed SDK disconnect."""
        with self._condition:
            if (
                self._thread is not None
                or self._safety_thread is not None
                or self._running
                or self._starting
                or self._movev_in_progress
                or self._slow_stop_call_in_progress
                or self._slow_stop_in_progress
                or self._fast_stop_in_progress
                or self._reservation is not None
            ):
                return False
            self._velocity_initialized = False
            self._lockout = False
            self._goal = None
            self._active_request = None
            self._release_ownership_locked()
            self._condition.notify_all()
            return True

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
            active = self._owns_ownership and (
                self._running
                or self._starting
                or self._velocity_initialized
                or self._movev_in_progress
                or self._lockout
            )
            if not reserved and not active:
                return None
            self._fast_stop_in_progress = True
            self._last_fast_stop_status = None
            self._start_token += 1
            thread = self._thread
            safety_thread = self._safety_thread
            self._running = False
            self._stop_event.set()
            self._stop_sent = True
            self._phase = VelocityFeedbackPhase.STOPPING
            self._condition.notify_all()

        try:
            stop_status = _status(self.adapter.stop())
        except Exception:
            stop_status = -1

        timed_out = self._wait_for_calls_to_stop(thread, safety_thread)
        unsafe = timed_out or stop_status != 0
        status = _stop_result_status(
            timed_out=timed_out,
            fast_stop_status=stop_status,
        )
        result = VelocityResult(
            False,
            VelocityTerminalState.ABORTED,
            status,
            _stop_result_message(
                "velocity session fast-stopped",
                timed_out=timed_out,
                fast_stop_status=stop_status,
            ),
        )

        with self._condition:
            if reserved and self._reservation is reservation:
                self._complete_reservation_locked(reservation, result)
            self._result = result
            self._active_request = None
            self._stop_sent = True
            self._done_event.set()
            self._last_fast_stop_status = status
            self._fast_stop_in_progress = False
            if not unsafe:
                self._velocity_initialized = False
            self._lockout = unsafe
            self._release_ownership_if_idle_locked()
            self._condition.notify_all()
        return status

    # rclpy ActionServer lifecycle callbacks ---------------------------------
    def goal_callback(self, goal_request: Any) -> Any:
        with self._condition:
            if (
                self._running
                or self._starting
                or self._reservation is not None
                or self._fast_stop_in_progress
                or self._slow_stop_in_progress
                or self._lockout
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
            request_id = id(goal_request)
            self._completed_action_results.pop(request_id, None)
            self._reservation = _Reservation(goal_request, request_id)
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
                if self._starting:
                    if self._slow_stop_in_progress or self._lockout:
                        return _cancel_accept()
                    result = VelocityResult(
                        False,
                        VelocityTerminalState.CANCELED,
                        0,
                        "velocity session canceled during startup",
                    )
                    self._reservation.result = result
                    self._result = result
                    self._start_token += 1
                    self._phase = VelocityFeedbackPhase.STOPPING
                    self._done_event.set()
                    self._condition.notify_all()
                    return _cancel_accept()
                if self._reservation.result is None:
                    result = VelocityResult(
                        False,
                        VelocityTerminalState.CANCELED,
                        0,
                        "velocity session canceled before execution",
                    )
                    reservation = self._reservation
                    self._complete_reservation_locked(reservation, result)
                    self._result = result
                    self._release_ownership_locked()
                self._condition.notify_all()
                return _cancel_accept()
            if request is not self._active_request:
                return _cancel_reject()
        return _cancel_accept()

    def accepted_callback(self, goal_handle: Any) -> None:
        goal_handle.execute()

    def execute(self, goal_handle: Any) -> Any:
        result = self._consume_action_result(goal_handle.request)
        if result is not None:
            return self._finish_action(goal_handle, result)
        if not self._start(goal_handle.request, require_reservation=True):
            result = self._consume_action_result(goal_handle.request)
            if result is None:
                result = VelocityResult(
                    False,
                    VelocityTerminalState.ABORTED,
                    -1,
                    "velocity Action request is no longer executable",
                )
            return self._finish_action(goal_handle, result)
        with self._lock:
            feedback_period_sec = max(
                _MIN_FEEDBACK_PERIOD_SEC,
                2.0 * self._goal.control_period_ms / 1000.0
                if self._goal is not None
                else _MIN_FEEDBACK_PERIOD_SEC,
            )
        while self.running:
            if getattr(goal_handle, "is_cancel_requested", False):
                self.cancel()
                break
            self._publish_feedback(goal_handle)
            self._done_event.wait(timeout=feedback_period_sec)
        with self._condition:
            while (
                self._fast_stop_in_progress
                or self._slow_stop_in_progress
                or self._result is None
            ):
                self._condition.wait()
            assert self._result is not None
            result = self._result
        return self._finish_action(goal_handle, result)

    def _finish_action(self, goal_handle: Any, result: VelocityResult) -> Any:
        if result.terminal_state == VelocityTerminalState.CANCELED:
            goal_handle.canceled()
        elif result.terminal_state in (
            VelocityTerminalState.ABORTED,
            VelocityTerminalState.WATCHDOG_STOP,
        ):
            goal_handle.abort()
        else:
            goal_handle.succeed()
        return self._ros_result(result)

    def _consume_action_result(self, request: Any) -> VelocityResult | None:
        request_id = id(request)
        with self._condition:
            return self._completed_action_results.pop(request_id, None)

    # Internals ---------------------------------------------------------------
    def _finish_start_failure_locked(
        self, reservation: _Reservation | None, result: VelocityResult
    ) -> None:
        self._starting = False
        self._goal = None
        self._velocity_initialized = False
        self._movev_in_progress = False
        if reservation is not None and self._reservation is reservation:
            self._complete_reservation_locked(reservation, result)
        self._result = result
        self._release_ownership_locked()
        self._condition.notify_all()

    def _canceled_start_result_locked(
        self, reservation: _Reservation | None
    ) -> VelocityResult | None:
        if (
            reservation is None
            or self._reservation is not reservation
            or reservation.result is None
            or reservation.result.terminal_state != VelocityTerminalState.CANCELED
            or self._fast_stop_in_progress
            or self._slow_stop_in_progress
            or self._lockout
        ):
            return None
        return reservation.result

    def _complete_reservation_locked(
        self, reservation: _Reservation, result: VelocityResult
    ) -> None:
        reservation.result = result
        if self._reservation is reservation:
            self._reservation = None
        self._completed_action_results[reservation.request_id] = result
        self._completed_action_results.move_to_end(reservation.request_id)
        while len(self._completed_action_results) > _COMPLETED_ACTION_RESULT_LIMIT:
            self._completed_action_results.popitem(last=False)
        reservation.request = None

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
        if period != self.settings.velocity_control_period_ms:
            raise ValueError(
                "control_period_ms must equal the configured control period"
            )
        watchdog = _positive_int(_field(goal, "watchdog_ms"), "watchdog_ms")
        if watchdog > self.settings.velocity_watchdog_ms:
            raise ValueError("watchdog_ms exceeds the configured watchdog")
        linear_accel = _positive_float(
            _field(goal, "max_linear_accel_mps2"), "max_linear_accel_mps2"
        )
        if linear_accel > self.settings.max_linear_accel_mps2:
            raise ValueError(
                "max_linear_accel_mps2 exceeds configured linear acceleration"
            )
        angular_accel = _positive_float(
            _field(goal, "max_angular_accel_radps2"), "max_angular_accel_radps2"
        )
        if angular_accel > self.settings.max_angular_accel_radps2:
            raise ValueError(
                "max_angular_accel_radps2 exceeds configured angular acceleration"
            )
        follow = _field(goal, "follow")
        if not isinstance(follow, bool):
            raise ValueError("follow must be a boolean")
        trajectory_mode = _integer(_field(goal, "trajectory_mode"), "trajectory_mode")
        radio = _integer(_field(goal, "radio"), "radio")
        if trajectory_mode not in {0, 1, 2}:
            raise ValueError("trajectory_mode must be 0, 1, or 2")
        radio_limit = {0: 0, 1: 100, 2: 1000}[trajectory_mode]
        if not 0 <= radio <= radio_limit:
            raise ValueError(
                f"radio must be between 0 and {radio_limit} for trajectory_mode "
                f"{trajectory_mode}"
            )
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
                completed_at = self._monotonic()
                if completed_at > deadline:
                    deadline = completed_at
        except Exception as error:
            with self._condition:
                abort = (
                    self._running
                    and not self._fast_stop_in_progress
                    and not self._slow_stop_in_progress
                )
            if abort:
                self._stop_and_join(
                    VelocityTerminalState.ABORTED,
                    f"velocity loop failed: {error}",
                    api2_status=-1,
                )
        finally:
            with self._condition:
                if self._thread is threading.current_thread():
                    self._thread = None
                self._release_ownership_if_idle_locked()
                self._condition.notify_all()

    def _run_safety_supervisor(self) -> None:
        """Supervise command age without issuing regular velocity commands."""
        try:
            while True:
                with self._condition:
                    if (
                        self._stop_event.is_set()
                        or not self._running
                        or self._goal is None
                    ):
                        return
                    deadline = (
                        self._command_received_at + self._goal.watchdog_ms / 1000.0
                    )
                    remaining = deadline - self._monotonic()
                    if remaining > 0.0:
                        self._condition.wait(timeout=remaining)
                        continue
                self._stop_and_join(
                    VelocityTerminalState.WATCHDOG_STOP,
                    "velocity command watchdog expired",
                )
                return
        except Exception as error:
            with self._condition:
                abort = (
                    self._running
                    and not self._fast_stop_in_progress
                    and not self._slow_stop_in_progress
                )
            if abort:
                self._stop_and_join(
                    VelocityTerminalState.ABORTED,
                    f"velocity safety supervisor failed: {error}",
                    api2_status=-1,
                )
        finally:
            with self._condition:
                if self._safety_thread is threading.current_thread():
                    self._safety_thread = None
                self._release_ownership_if_idle_locked()
                self._condition.notify_all()

    def _stop_and_join(
        self,
        state: VelocityTerminalState,
        message: str,
        *,
        api2_status: int = 0,
        initial_zero_status: int = 0,
        send_zero_command: bool = True,
    ) -> VelocityResult:
        with self._condition:
            if self._fast_stop_in_progress:
                if self._caller_is_session_worker_locked():
                    return self._result or VelocityResult(
                        False, state, -1, message
                    )
                while self._fast_stop_in_progress:
                    self._condition.wait()
            if self._slow_stop_in_progress:
                if self._caller_is_session_worker_locked():
                    return self._result or VelocityResult(
                        False, state, -1, message
                    )
                while self._slow_stop_in_progress:
                    self._condition.wait()
                result = self._result or VelocityResult(False, state, -1, message)
                return self._join_completed_safety_stop_locked(
                    self._safety_thread, result
                )
            if self._lockout:
                return self._result or VelocityResult(
                    False, VelocityTerminalState.ABORTED, -1, message
                )
            if (
                self._reservation is not None
                and not self._running
                and not self._starting
                and not self._velocity_initialized
            ):
                reservation = self._reservation
                if reservation.result is None:
                    self._complete_reservation_locked(
                        reservation,
                        VelocityResult(False, state, 0, message),
                    )
                self._result = reservation.result
                self._release_ownership_locked()
                self._condition.notify_all()
                return self._result
            active = self._owns_ownership and (
                self._running
                or self._starting
                or self._velocity_initialized
                or self._movev_in_progress
            )
            if not active:
                if self._result is None:
                    self._set_result_locked(False, state, api2_status, message)
                self._release_ownership_if_idle_locked()
                return self._result

            reservation = self._reservation
            thread = self._thread
            safety_thread = self._safety_thread
            goal = self._goal
            zero_requested = send_zero_command and (
                self._velocity_initialized
                and goal is not None
            )
            zero_skipped = zero_requested and self._movev_in_progress
            send_zero = zero_requested and not zero_skipped
            self._slow_stop_in_progress = True
            self._start_token += 1
            stop_token = self._start_token
            self._running = False
            self._stop_event.set()
            self._stop_sent = True
            self._phase = VelocityFeedbackPhase.STOPPING
            self._slow_stop_call_in_progress = send_zero
            self._condition.notify_all()

        zero_status = 0
        if send_zero:
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
        with self._condition:
            self._slow_stop_call_in_progress = False
            self._condition.notify_all()
            if stop_token != self._start_token:
                return self._yield_to_fast_stop_locked(state, message)
            self._slow_stop_call_in_progress = True
        try:
            stop_status = _status(self.adapter.slow_stop())
        except Exception:
            stop_status = -1
        with self._condition:
            self._slow_stop_call_in_progress = False
            self._condition.notify_all()
            if stop_token != self._start_token:
                return self._yield_to_fast_stop_locked(state, message)

        timed_out = self._wait_for_calls_to_stop(thread, safety_thread)
        with self._condition:
            if stop_token != self._start_token:
                return self._yield_to_fast_stop_locked(state, message)
            stop_api2_status = zero_status or stop_status
            terminal_state = state
            unsafe = timed_out or stop_api2_status != 0
            if unsafe:
                terminal_state = VelocityTerminalState.ABORTED
            status = _stop_result_status(
                timed_out=timed_out,
                command_status=api2_status,
                initial_zero_status=initial_zero_status,
                zero_status=zero_status,
                slow_stop_status=stop_status,
            )
            result = VelocityResult(
                False,
                terminal_state,
                status,
                _stop_result_message(
                    message,
                    timed_out=timed_out,
                    command_status=api2_status,
                    initial_zero_status=initial_zero_status,
                    zero_status=zero_status,
                    zero_skipped=zero_skipped,
                    slow_stop_status=stop_status,
                ),
            )
            if reservation is not None and self._reservation is reservation:
                self._complete_reservation_locked(reservation, result)
            self._result = result
            self._active_request = None
            if not unsafe:
                self._velocity_initialized = False
            self._lockout = unsafe
            self._slow_stop_in_progress = False
            self._done_event.set()
            self._release_ownership_if_idle_locked()
            self._condition.notify_all()
            return result

    def _yield_to_fast_stop_locked(
        self, state: VelocityTerminalState, message: str
    ) -> VelocityResult:
        self._slow_stop_in_progress = False
        self._condition.notify_all()
        if self._caller_is_session_worker_locked():
            return self._result or VelocityResult(False, state, -1, message)
        while self._fast_stop_in_progress:
            self._condition.wait()
        return self._result or VelocityResult(False, state, -1, message)

    def _caller_is_session_worker_locked(self) -> bool:
        current = threading.current_thread()
        return current is self._thread or current is self._safety_thread

    def _wait_for_calls_to_stop(
        self, *threads: threading.Thread | None
    ) -> bool:
        deadline = time.monotonic() + max(0.0, self._thread_join_timeout_sec)
        current = threading.current_thread()
        joined: set[int] = set()
        for thread in threads:
            if thread is None or thread is current or id(thread) in joined:
                continue
            joined.add(id(thread))
            thread.join(timeout=max(0.0, deadline - time.monotonic()))
        with self._condition:
            while (
                self._starting
                or self._movev_in_progress
                or self._slow_stop_call_in_progress
            ):
                remaining = deadline - time.monotonic()
                if remaining <= 0.0:
                    break
                self._condition.wait(timeout=remaining)
            thread_alive = any(
                thread is not None
                and thread is not current
                and thread.is_alive()
                for thread in threads
            )
            return (
                thread_alive
                or self._starting
                or self._movev_in_progress
                or self._slow_stop_call_in_progress
            )

    def _join_completed_safety_stop_locked(
        self, thread: threading.Thread | None, result: VelocityResult
    ) -> VelocityResult:
        if thread is None or thread is threading.current_thread():
            return result
        self._condition.release()
        try:
            thread.join(timeout=max(0.0, self._thread_join_timeout_sec))
        finally:
            self._condition.acquire()
        if not thread.is_alive():
            return self._result or result
        status = result.api2_status or -1
        timed_out = VelocityResult(
            False,
            VelocityTerminalState.ABORTED,
            status,
            f"{result.message}; timeout waiting for safety supervisor to stop",
        )
        self._result = timed_out
        self._lockout = True
        self._done_event.set()
        return timed_out

    def _set_result_locked(self, success: bool, state: VelocityTerminalState, status: int, message: str) -> None:
        self._result = VelocityResult(
            bool(success) and state == VelocityTerminalState.SUCCEEDED,
            state,
            int(status),
            message,
        )
        self._done_event.set()

    def _release_ownership_if_idle_locked(self) -> None:
        if (
            self._thread is None
            and self._safety_thread is None
            and not self._running
            and not self._starting
            and not self._movev_in_progress
            and not self._slow_stop_call_in_progress
            and not self._slow_stop_in_progress
            and not self._fast_stop_in_progress
            and not self._lockout
        ):
            self._release_ownership_locked()

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

    def _read_ros_time_ns(self) -> int | None:
        if self._ros_time_now_ns is None:
            return None
        try:
            value = int(self._ros_time_now_ns())
        except (TypeError, ValueError, OverflowError):
            raise ValueError("ROS clock must return an integer nanosecond timestamp") from None
        if value < 0:
            raise ValueError("ROS clock timestamp must not be negative")
        return value


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


def _twist_stamp_ns(command: Any) -> int | None:
    header = getattr(command, "header", None)
    stamp = getattr(header, "stamp", None)
    if stamp is None:
        return None
    try:
        seconds = int(getattr(stamp, "sec"))
        nanoseconds = int(getattr(stamp, "nanosec"))
    except (AttributeError, TypeError, ValueError, OverflowError):
        raise ValueError("TwistStamped header.stamp must contain sec/nanosec") from None
    if seconds < 0 or not 0 <= nanoseconds < 1_000_000_000:
        raise ValueError("TwistStamped header.stamp must be a valid ROS time")
    return seconds * 1_000_000_000 + nanoseconds


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


def _stop_result_status(
    *,
    timed_out: bool,
    command_status: int = 0,
    initial_zero_status: int = 0,
    zero_status: int = 0,
    slow_stop_status: int = 0,
    fast_stop_status: int = 0,
) -> int:
    for status in (
        fast_stop_status,
        slow_stop_status,
        zero_status,
        initial_zero_status,
    ):
        if status != 0:
            return int(status)
    if timed_out:
        return -1
    return int(command_status)


def _stop_result_message(
    message: str,
    *,
    timed_out: bool,
    command_status: int = 0,
    initial_zero_status: int = 0,
    zero_status: int = 0,
    zero_skipped: bool = False,
    slow_stop_status: int = 0,
    fast_stop_status: int = 0,
) -> str:
    details = [
        f"{name} status {status}"
        for name, status in (
            ("command", command_status),
            ("initial_zero", initial_zero_status),
            ("zero", zero_status),
            ("slow_stop", slow_stop_status),
            ("fast_stop", fast_stop_status),
        )
        if status != 0
    ]
    if zero_skipped:
        details.append(
            "zero velocity command skipped because movev call is in progress"
        )
    if timed_out:
        details.append("timeout waiting for velocity control to stop")
    return f"{message}; {'; '.join(details)}" if details else message


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
