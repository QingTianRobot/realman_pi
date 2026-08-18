"""ROS-neutral lifecycle coordinator for one arm's ordinary motions."""

from __future__ import annotations

import math
import threading
import time
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from typing import Any, Protocol

from .motion_types import (
    CommandType,
    FeedbackPhase,
    GoalValidationResult,
    ReferenceResolver,
    ReferenceType,
    TerminalState,
    ValidatedGoal,
    validate_goal,
)


_CURRENT_TRAJECTORY_EVENT = 1
_ARM_DEVICE = 0
_STOP_IN_PROGRESS = object()


class CoordinateMotionGate(Protocol):
    def motion_allowed(self, arm: str) -> bool: ...


class ArmOwnership:
    """Atomic per-arm ownership shared by motion, velocity, and coordinates."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._owned: set[str] = set()

    def acquire(self, arm: str) -> bool:
        with self._lock:
            if arm in self._owned:
                return False
            self._owned.add(arm)
            return True

    def release(self, arm: str) -> None:
        with self._lock:
            self._owned.discard(arm)

    def is_busy(self, arm: str) -> bool:
        with self._lock:
            return arm in self._owned


# Keep a descriptive alias for later modules without multiplying ownership APIs.
ArmOwnershipManager = ArmOwnership


@dataclass
class _Reservation:
    """One accepted goal that still owns the arm before activation."""

    request: object
    terminal_state: TerminalState | None = None
    api2_status: int = 0
    message: str = ""
    stop_status: int | object | None = None


@dataclass
class _IdleFastStop:
    """An idle stop that owns the arm until trajectory inactivity is proven."""

    status: int | object = _STOP_IN_PROGRESS


class MotionCoordinator:
    """Coordinate validation, submission, feedback, stop, and terminal state."""

    def __init__(
        self,
        *,
        arm_id: str,
        adapter: Any,
        coordinate_manager: CoordinateMotionGate,
        ownership: ArmOwnership,
        reference_resolver: ReferenceResolver,
        active_reference: Callable[[ReferenceType], str | tuple[ReferenceType, str]],
        action_type: Any | None = None,
        goal_response_type: Any | None = None,
        cancel_response_type: Any | None = None,
        monotonic: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
        poll_period_sec: float = 0.02,
        stop_timeout_sec: float = 2.0,
        joint_goal_tolerance_deg: float = 0.25,
        logger: Any | None = None,
    ) -> None:
        if arm_id not in {"l", "m", "r"}:
            raise ValueError("arm_id must be one of l, m, or r")
        if not math.isfinite(poll_period_sec) or poll_period_sec <= 0.0:
            raise ValueError("poll_period_sec must be a positive finite number")
        if not math.isfinite(stop_timeout_sec) or stop_timeout_sec <= 0.0:
            raise ValueError("stop_timeout_sec must be a positive finite number")
        if (
            not math.isfinite(joint_goal_tolerance_deg)
            or joint_goal_tolerance_deg <= 0.0
        ):
            raise ValueError(
                "joint_goal_tolerance_deg must be a positive finite number"
            )
        if action_type is None:
            from realman_msgs.action import ExecuteMotion

            action_type = ExecuteMotion
        if goal_response_type is None or cancel_response_type is None:
            from rclpy.action import CancelResponse, GoalResponse

            goal_response_type = goal_response_type or GoalResponse
            cancel_response_type = cancel_response_type or CancelResponse

        self.arm_id = arm_id
        self.adapter = adapter
        self.coordinate_manager = coordinate_manager
        self.ownership = ownership
        self.reference_resolver = reference_resolver
        self.active_reference = active_reference
        self.action_type = action_type
        self.goal_response_type = goal_response_type
        self.cancel_response_type = cancel_response_type
        self._monotonic = monotonic
        self._sleep = sleep
        self._poll_period_sec = poll_period_sec
        self._stop_timeout_sec = stop_timeout_sec
        self._joint_goal_tolerance_deg = joint_goal_tolerance_deg
        self._logger = logger

        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        self._reservation: _Reservation | None = None
        self._active_goal: object | None = None
        self._active_generation: int | None = None
        self._idle_fast_stop: _IdleFastStop | None = None
        self._generation = 0
        self._accept_events = False
        self._event: tuple[int, bool] | None = None
        self._submitted_generation: int | None = None
        self._confirmed_event_generation: int | None = None
        self._event_channel_quarantined = False
        self._event_channel_cleared_through_generation = 0
        self._terminal_generation: int | None = None
        self._terminal_result: Any | None = None
        self._stop_generation: int | None = None
        self._stop_status: int | object | None = None
        self._fast_stop_generation: int | None = None
        self._fast_stop_status: int | object | None = None
        self._shutdown_generation: int | None = None
        self._cancel_generation: int | None = None
        self._lockout = False
        self._owns_ownership = False

    @property
    def active_generation(self) -> int | None:
        with self._lock:
            return self._active_generation

    def is_busy(self) -> bool:
        return self.ownership.is_busy(self.arm_id)

    def goal_callback(self, goal_request: object) -> Any:
        with self._lock:
            if self._lockout or self._event_channel_quarantined:
                self._log(
                    "error",
                    f"Rejecting motion goal: arm {self.arm_id} is safety locked",
                )
                return self.goal_response_type.REJECT
        validation = self._validate(goal_request)
        if not validation.valid:
            self._log("warn", f"Rejecting motion goal: {validation.message}")
            return self.goal_response_type.REJECT
        with self._condition:
            if (
                self._lockout
                or self._event_channel_quarantined
                or self._idle_fast_stop is not None
                or self._reservation is not None
                or self._active_goal is not None
            ):
                return self.goal_response_type.REJECT
            # Linearize ownership acquisition with reservation publication so
            # an idle fast stop cannot cross a half-accepted goal.
            if not self.ownership.acquire(self.arm_id):
                self._log("warn", f"Rejecting motion goal: arm {self.arm_id} is busy")
                return self.goal_response_type.REJECT
            self._owns_ownership = True
            self._reservation = _Reservation(goal_request)
        return self.goal_response_type.ACCEPT

    def cancel_callback(self, goal_handle: object) -> Any:
        request = getattr(goal_handle, "request", None)
        with self._condition:
            active = goal_handle is self._active_goal
            reserved = (
                request is not None
                and self._reservation is not None
                and request is self._reservation.request
            )
            if reserved:
                self._reservation.terminal_state = TerminalState.CANCELED
                self._reservation.api2_status = 0
                self._reservation.message = "motion canceled before execution"
                self._condition.notify_all()
            elif active:
                self._cancel_generation = self._active_generation
            else:
                return self.cancel_response_type.REJECT
        return self.cancel_response_type.ACCEPT

    def accepted_callback(self, goal_handle: object) -> None:
        goal_handle.execute()

    def handle_event(self, event: object) -> None:
        parsed = _trajectory_event(event)
        if parsed is None:
            return
        event_generation, trajectory_state = parsed
        with self._lock:
            generation = self._active_generation
            if generation is None or not self._accept_events:
                return
            if event_generation is not None and event_generation != generation:
                return
            if self._terminal_generation == generation:
                return
            self._event = (generation, trajectory_state)
            self._condition.notify_all()

    def execute(self, goal_handle: object) -> Any:
        request = getattr(goal_handle, "request", None)
        self._publish_feedback(
            goal_handle,
            FeedbackPhase.VALIDATING,
            None,
            (),
            0.0,
            0,
            "validating motion goal",
        )
        reserved_terminal = self._consume_reservation_terminal(request, goal_handle)
        if reserved_terminal is not None:
            terminal_state, api2_status, message = reserved_terminal
            return self._finish_unowned(
                goal_handle,
                terminal_state,
                api2_status,
                message,
            )
        validation = self._validate(request)
        if not validation.valid or validation.goal is None:
            return self._finish_unowned(
                goal_handle,
                TerminalState.ABORTED,
                -1,
                validation.message or "motion goal validation failed",
            )

        generation = self._activate(goal_handle, request)
        if generation is None:
            reserved_terminal = self._consume_reservation_terminal(request, goal_handle)
            if reserved_terminal is not None:
                terminal_state, api2_status, message = reserved_terminal
                return self._finish_unowned(
                    goal_handle,
                    terminal_state,
                    api2_status,
                    message,
                )
            return self._finish_unowned(
                goal_handle,
                TerminalState.ABORTED,
                -1,
                f"arm {self.arm_id} is busy",
            )

        goal = validation.goal
        current_joints: tuple[float, ...] = ()
        initial_joints: tuple[float, ...] = ()
        try:
            self._publish_feedback(
                goal_handle,
                FeedbackPhase.SUBMITTING,
                goal,
                current_joints,
                0.0,
                0,
                "submitting non-blocking motion",
            )
            # The SDK event payload has no generation; ignore callbacks until
            # this submission has returned success to avoid stale completion.
            submit_status, interrupted_terminal = self._submit_if_permitted(
                goal_handle, generation, goal
            )
            if interrupted_terminal is not None:
                terminal_state, api2_status, reason = interrupted_terminal
                return self._finish(
                    goal_handle,
                    generation,
                    terminal_state,
                    api2_status,
                    current_joints,
                    reason,
                )
            assert submit_status is not None
            if submit_status != 0:
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    submit_status,
                    current_joints,
                    f"motion submission failed with API2 status {submit_status}",
                )
            with self._lock:
                if self._active_generation == generation:
                    self._accept_events = True
                    self._submitted_generation = generation

            self._publish_feedback(
                goal_handle,
                FeedbackPhase.EXECUTING,
                goal,
                current_joints,
                0.0,
                0,
                "motion executing",
            )
            deadline = self._monotonic() + goal.timeout_sec
            observed_active_trajectory = False
            while True:
                if self._fast_stop_requested(generation):
                    return self._finish_after_fast_stop(
                        goal_handle, generation, current_joints
                    )
                shutdown_requested = self._shutdown_requested(generation)
                cancel_requested = bool(getattr(goal_handle, "is_cancel_requested", False))
                if shutdown_requested or cancel_requested:
                    reason = "driver shutdown requested" if shutdown_requested and not cancel_requested else "cancel requested"
                    return self._controlled_stop(
                        goal_handle,
                        generation,
                        goal,
                        TerminalState.CANCELED if cancel_requested else TerminalState.ABORTED,
                        current_joints,
                        reason,
                    )
                if not bool(getattr(self.adapter, "connected", False)):
                    status = _nonzero_status(getattr(self.adapter, "last_error", -1))
                    return self._finish(
                        goal_handle,
                        generation,
                        TerminalState.ABORTED,
                        status,
                        current_joints,
                        "robot connection lost during motion",
                    )

                state_status, observed_joints, state_connected = self._read_state()
                trajectory_status, trajectory_active = self._read_trajectory()
                if self._fast_stop_requested(generation):
                    return self._finish_after_fast_stop(
                        goal_handle, generation, current_joints
                    )
                if observed_joints:
                    current_joints = observed_joints
                    if not initial_joints:
                        initial_joints = observed_joints
                api2_status = _first_nonzero(state_status, trajectory_status)
                if api2_status != 0:
                    self._enter_lockout()
                    return self._finish(
                        goal_handle,
                        generation,
                        TerminalState.ABORTED,
                        api2_status,
                        current_joints,
                        "motion monitor reported an API2 error",
                    )
                if state_connected is False:
                    return self._finish(
                        goal_handle,
                        generation,
                        TerminalState.ABORTED,
                        _nonzero_status(state_status),
                        current_joints,
                        "robot connection lost during state monitoring",
                    )
                if trajectory_active is True:
                    observed_active_trajectory = True
                completion_event = self._take_event(generation)
                if self._fast_stop_requested(generation):
                    return self._finish_after_fast_stop(
                        goal_handle, generation, current_joints
                    )
                progress = _estimated_progress(goal, initial_joints, current_joints)
                self._publish_feedback(
                    goal_handle,
                    FeedbackPhase.EXECUTING,
                    goal,
                    current_joints,
                    progress,
                    api2_status,
                    "waiting for correlated trajectory completion",
                )

                if completion_event is False:
                    return self._finish(
                        goal_handle,
                        generation,
                        TerminalState.ABORTED,
                        api2_status,
                        current_joints,
                        "controller reported trajectory failure",
                    )
                if (
                    completion_event is True
                    and observed_active_trajectory
                    and trajectory_active is False
                    and state_connected is True
                    and (
                        goal.command != CommandType.MOVEJ
                        or (
                            bool(current_joints)
                            and self._goal_has_converged(goal, current_joints)
                        )
                    )
                ):
                    self._confirm_completion_event(generation)
                    return self._finish(
                        goal_handle,
                        generation,
                        TerminalState.SUCCEEDED,
                        0,
                        current_joints,
                        "motion completed",
                    )
                if self._monotonic() >= deadline:
                    return self._controlled_stop(
                        goal_handle,
                        generation,
                        goal,
                        TerminalState.TIMEOUT,
                        current_joints,
                        "motion timeout",
                    )
                self._sleep(self._poll_period_sec)
        except Exception as error:
            status = _nonzero_status(getattr(self.adapter, "last_error", -1))
            if self._logger is not None:
                try:
                    self._logger.error(
                        f"motion execution failed for {goal.command.name}: {error}"
                    )
                except Exception:
                    pass
            return self._finish(
                goal_handle,
                generation,
                TerminalState.ABORTED,
                status,
                current_joints,
                f"motion coordinator failed: {error}",
            )
        finally:
            self._release_generation(generation)

    def shutdown(self, timeout_sec: float | None = None) -> int:
        """Request one controlled stop and wait briefly for active execution to unwind."""
        idle_stop = None
        with self._condition:
            generation = self._active_generation
            if generation is None:
                reservation = self._reservation
                if reservation is not None:
                    if reservation.stop_status is _STOP_IN_PROGRESS:
                        wait_for_reservation = True
                    else:
                        reservation.stop_status = _STOP_IN_PROGRESS
                        wait_for_reservation = False
                else:
                    idle_stop = self._idle_fast_stop
                    wait_for_reservation = False
            else:
                reservation = None
                wait_for_reservation = False
                self._shutdown_generation = generation
        if reservation is not None:
            if wait_for_reservation:
                status = self._wait_for_reservation_stop_status(reservation)
                if status is None:
                    self._enter_lockout()
                    return -1
                return status
            try:
                status = int(self.adapter.slow_stop())
            except Exception as error:
                status = _nonzero_status(getattr(self.adapter, "last_error", -1))
                self._log(
                    "error",
                    f"pre-submit shutdown slow_stop adapter call failed: {error}",
                )
            with self._condition:
                if self._reservation is reservation:
                    if reservation.stop_status is _STOP_IN_PROGRESS:
                        reservation.stop_status = status
                        reservation.terminal_state = TerminalState.ABORTED
                        reservation.api2_status = status
                        reservation.message = (
                            "driver shutdown requested before execution"
                            if status == 0
                            else "pre-submit controlled stop failed "
                            f"with API2 status {status}"
                        )
                    self._condition.notify_all()
            return status
        if idle_stop is not None:
            status = self._wait_for_idle_fast_stop_status(idle_stop, timeout_sec)
            if status is None:
                self._enter_lockout()
                return -1
            return status
        if generation is None:
            return 0
        status = self._request_stop_once(generation)
        wait_duration = self._stop_timeout_sec if timeout_sec is None else max(0.0, timeout_sec)
        deadline = time.monotonic() + wait_duration
        with self._condition:
            while self._active_generation == generation:
                remaining = deadline - time.monotonic()
                if remaining <= 0.0:
                    break
                self._condition.wait(remaining)
            still_active = self._active_generation == generation
        if still_active:
            self._enter_lockout()
            return status if status != 0 else -1
        return status

    def _validate(self, request: object) -> GoalValidationResult:
        active_type: ReferenceType | None = None
        active_name: str | None = None
        active_error = ""
        try:
            raw_type = _field(request, "reference_type")
            if isinstance(raw_type, int) and not isinstance(raw_type, bool):
                active_type = ReferenceType(raw_type)
                resolved = self.active_reference(active_type)
                if isinstance(resolved, tuple):
                    active_type, active_name = resolved
                else:
                    active_name = resolved
        except (KeyError, TypeError, ValueError) as error:
            active_type = None
            active_name = None
            active_error = f"active frame is unavailable: {error}"
        except Exception as error:
            active_type = None
            active_name = None
            active_error = f"active frame is unavailable: {error}"
        try:
            validation = validate_goal(
                request,
                connected=bool(getattr(self.adapter, "connected", False)),
                active_reference_type=active_type,
                active_reference_name=active_name,
                reference_resolver=self.reference_resolver,
            )
        except Exception as error:
            return GoalValidationResult(False, (f"goal validation failed: {error}",), None)
        if active_error:
            return GoalValidationResult(
                False,
                (*validation.errors, active_error),
                None,
            )
        try:
            motion_allowed = self.coordinate_manager.motion_allowed(self.arm_id)
        except Exception as error:
            return GoalValidationResult(
                False,
                (*validation.errors, f"coordinate motion gate failed: {error}"),
                None,
            )
        if not motion_allowed:
            return GoalValidationResult(
                False,
                (*validation.errors, "coordinate verification blocks motion"),
                None,
            )
        return validation

    def _activate(self, goal_handle: object, request: object) -> int | None:
        with self._lock:
            if (
                self._active_goal is not None
                or self._lockout
                or self._event_channel_quarantined
                or self._idle_fast_stop is not None
            ):
                return None
            if (
                self._reservation is not None
                and request is self._reservation.request
                and (
                    self._reservation.terminal_state is not None
                    or self._reservation.stop_status is _STOP_IN_PROGRESS
                )
            ):
                return None
            if self._reservation is not None and request is self._reservation.request:
                self._reservation = None
            elif self._reservation is not None:
                return None
            else:
                if not self.ownership.acquire(self.arm_id):
                    return None
                self._owns_ownership = True
            self._generation += 1
            generation = self._generation
            self._active_goal = goal_handle
            self._active_generation = generation
            self._accept_events = False
            self._event = None
            self._submitted_generation = None
            self._confirmed_event_generation = None
            self._terminal_generation = None
            self._terminal_result = None
            self._stop_generation = None
            self._stop_status = None
            self._fast_stop_generation = None
            self._fast_stop_status = None
            self._shutdown_generation = None
            self._cancel_generation = None
            return generation

    def _submit_if_permitted(
        self,
        goal_handle: object,
        generation: int,
        goal: ValidatedGoal,
    ) -> tuple[int | None, tuple[TerminalState, int, str] | None]:
        """Atomically exclude stop/cancel requests from SDK motion submission."""
        with self._condition:
            interruption = self._submission_interruption_locked(
                goal_handle, generation
            )
            if interruption is not None:
                return None, interruption
            try:
                submit_status = self._submit(goal)
            except Exception as error:
                submit_status = _nonzero_status(
                    getattr(self.adapter, "last_error", -1)
                )
                self._log("error", f"motion submission adapter call failed: {error}")
            return submit_status, None

    def _submission_interruption_locked(
        self, goal_handle: object, generation: int
    ) -> tuple[TerminalState, int, str] | None:
        while True:
            if self._fast_stop_generation == generation:
                status = self._wait_for_fast_stop_status(generation)
                if status is None:
                    self._enter_lockout()
                    return (
                        TerminalState.ABORTED,
                        -1,
                        "fast stop status did not arrive before motion submission",
                    )
                if status != 0:
                    self._enter_lockout()
                return (
                    TerminalState.ABORTED,
                    status,
                    "fast stop requested before motion submission",
                )
            if self._shutdown_generation == generation:
                status = self._wait_for_slow_stop_status(generation)
                if status is None:
                    self._enter_lockout()
                    return (
                        TerminalState.ABORTED,
                        -1,
                        "controlled stop status did not arrive before motion submission",
                    )
                if status != 0:
                    return (
                        TerminalState.ABORTED,
                        status,
                        "controlled stop failed before motion submission "
                        f"with API2 status {status}",
                    )
                return (
                    TerminalState.ABORTED,
                    0,
                    "driver shutdown requested before motion submission",
                )
            if (
                self._cancel_generation == generation
                or bool(getattr(goal_handle, "is_cancel_requested", False))
            ):
                if not bool(getattr(goal_handle, "is_cancel_requested", False)):
                    if not self._wait_for_canceling_witness_locked(goal_handle):
                        return (
                            TerminalState.ABORTED,
                            -1,
                            "cancel request was not acknowledged before motion submission",
                        )
                    # Condition.wait() releases the coordinator lock. Recheck
                    # higher-priority safety interrupts before transitioning.
                    continue
                return (
                    TerminalState.CANCELED,
                    0,
                    "motion canceled before submission",
                )
            return None

    def _wait_for_canceling_witness_locked(self, goal_handle: object) -> bool:
        """Wait briefly for rclpy to expose the goal's CANCELING state."""
        deadline = time.monotonic() + self._stop_timeout_sec
        while not bool(getattr(goal_handle, "is_cancel_requested", False)):
            remaining = deadline - time.monotonic()
            if remaining <= 0.0:
                return False
            self._condition.wait(min(remaining, self._poll_period_sec))
        return True

    def _submit(self, goal: ValidatedGoal) -> int:
        if goal.command == CommandType.MOVEJ:
            return int(
                self.adapter.movej(
                    list(goal.joint_degrees),
                    goal.velocity_percent,
                    goal.blend_radius_percent,
                    connect=False,
                )
            )
        pose = [*goal.pose_position_m, *goal.pose_quaternion_wxyz]
        if goal.command == CommandType.MOVEL:
            return int(
                self.adapter.movel(
                    pose,
                    goal.velocity_percent,
                    goal.blend_radius_percent,
                    connect=False,
                )
            )
        return int(
            self.adapter.movej_p(
                pose,
                goal.velocity_percent,
                goal.blend_radius_percent,
                connect=False,
            )
        )

    def _controlled_stop(
        self,
        goal_handle: object,
        generation: int,
        goal: ValidatedGoal,
        requested_terminal: TerminalState,
        current_joints: tuple[float, ...],
        reason: str,
    ) -> Any:
        if self._fast_stop_requested(generation):
            return self._finish_after_fast_stop(
                goal_handle, generation, current_joints
            )
        self._publish_feedback(
            goal_handle,
            FeedbackPhase.STOPPING,
            goal,
            current_joints,
            0.0,
            0,
            reason,
        )
        stop_status = self._request_stop_once(generation)
        if self._fast_stop_requested(generation):
            return self._finish_after_fast_stop(
                goal_handle, generation, current_joints
            )
        if stop_status != 0:
            self._enter_lockout()
            return self._finish(
                goal_handle,
                generation,
                TerminalState.ABORTED,
                stop_status,
                current_joints,
                f"controlled stop failed with API2 status {stop_status}",
            )

        deadline = self._monotonic() + self._stop_timeout_sec
        while True:
            state_status, observed_joints, state_connected = self._read_state()
            trajectory_status, trajectory_active = self._read_trajectory()
            if self._fast_stop_requested(generation):
                return self._finish_after_fast_stop(
                    goal_handle, generation, current_joints
                )
            if observed_joints:
                current_joints = observed_joints
            api2_status = _first_nonzero(state_status, trajectory_status)
            if api2_status != 0:
                self._enter_lockout()
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    api2_status,
                    current_joints,
                    "controlled stop confirmation reported an API2 error",
                )
            if state_connected is False:
                self._enter_lockout()
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    _nonzero_status(state_status),
                    current_joints,
                    "robot connection lost while confirming stop",
                )
            # Only the controller's trajectory query can confirm a completed
            # stop. An event can describe a prior trajectory and has no
            # stop-generation identity.
            if trajectory_active is False:
                if requested_terminal == TerminalState.ABORTED:
                    message = "motion aborted after driver shutdown stop"
                elif requested_terminal == TerminalState.TIMEOUT:
                    message = "motion timed out and stopped"
                else:
                    message = "motion canceled after controlled stop"
                return self._finish(
                    goal_handle,
                    generation,
                    requested_terminal,
                    0,
                    current_joints,
                    message,
                )
            if self._monotonic() >= deadline:
                status = _first_nonzero(state_status, trajectory_status, -1)
                self._enter_lockout()
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    status,
                    current_joints,
                    "controlled stop could not be confirmed",
                )
            self._sleep(self._poll_period_sec)

    def _request_stop_once(self, generation: int) -> int:
        with self._condition:
            if self._stop_generation == generation:
                status = self._wait_for_slow_stop_status(generation)
                if status is None:
                    self._enter_lockout()
                    return -1
                return status
            self._stop_generation = generation
            self._stop_status = _STOP_IN_PROGRESS
        try:
            status = int(self.adapter.slow_stop())
        except Exception as error:
            status = _nonzero_status(getattr(self.adapter, "last_error", -1))
            self._log("error", f"active slow_stop adapter call failed: {error}")
        with self._condition:
            self._stop_status = status
            self._condition.notify_all()
        return status

    def fast_stop(self) -> int:
        """Request a fast stop while retaining ownership through confirmation."""
        with self._condition:
            generation = self._active_generation
            if self._terminal_generation == generation:
                generation = None
            reserved = None
            idle_stop = None
            if generation is not None:
                if self._fast_stop_generation == generation:
                    status = self._wait_for_fast_stop_status(generation)
                    if status is None:
                        self._enter_lockout()
                        return -1
                    return status
                self._fast_stop_generation = generation
                self._fast_stop_status = _STOP_IN_PROGRESS
            elif self._reservation is not None:
                reserved = self._reservation
                if reserved.stop_status is _STOP_IN_PROGRESS:
                    status = self._wait_for_reservation_stop_status(reserved)
                    if status is None:
                        self._enter_lockout()
                        return -1
                    return status
                reserved.stop_status = _STOP_IN_PROGRESS
            else:
                idle_stop = self._idle_fast_stop
                if idle_stop is not None:
                    status = self._wait_for_idle_fast_stop_status(idle_stop)
                    if status is None:
                        self._enter_lockout()
                        return -1
                    return status
                if self._lockout or not self.ownership.acquire(self.arm_id):
                    return -1
                self._owns_ownership = True
                idle_stop = _IdleFastStop()
                self._idle_fast_stop = idle_stop

        try:
            status = int(self.adapter.stop())
        except Exception as error:
            status = _nonzero_status(getattr(self.adapter, "last_error", -1))
            self._log("error", f"fast_stop adapter call failed: {error}")

        if generation is None:
            if reserved is not None:
                if status != 0:
                    self._complete_reserved_fast_stop(
                        reserved,
                        status,
                        "fast stop failed before execution",
                    )
                    self._enter_lockout()
                    return status
                confirmation_status = self._confirm_fast_stop_inactive()
                if confirmation_status != 0:
                    self._enter_lockout()
                    self._complete_reserved_fast_stop(
                        reserved,
                        confirmation_status,
                        "fast stop could not be confirmed inactive before execution",
                    )
                    return confirmation_status
                self._complete_reserved_fast_stop(
                    reserved,
                    0,
                    "fast stop confirmed before execution",
                )
                return 0
            if idle_stop is not None:
                if status != 0:
                    self._enter_lockout()
                    self._complete_idle_fast_stop(idle_stop, status)
                    return status
                confirmation_status = self._confirm_fast_stop_inactive()
                if confirmation_status != 0:
                    self._enter_lockout()
                    self._complete_idle_fast_stop(idle_stop, confirmation_status)
                    return confirmation_status
                self._complete_idle_fast_stop(idle_stop, 0)
            return status
        with self._condition:
            if self._fast_stop_generation == generation:
                self._fast_stop_status = status
                self._condition.notify_all()
            return status

    def _confirm_fast_stop_inactive(self) -> int:
        deadline = self._monotonic() + self._stop_timeout_sec
        while True:
            trajectory_status, trajectory_active = self._read_trajectory()
            if trajectory_status != 0:
                return trajectory_status
            if trajectory_active is False:
                return 0
            if self._monotonic() >= deadline:
                return -1
            self._sleep(self._poll_period_sec)

    def _complete_reserved_fast_stop(
        self, reservation: _Reservation, status: int, message: str
    ) -> None:
        with self._condition:
            if self._reservation is reservation:
                reservation.stop_status = status
                reservation.terminal_state = TerminalState.ABORTED
                reservation.api2_status = status
                reservation.message = message
                self._condition.notify_all()

    def _complete_idle_fast_stop(self, idle_stop: _IdleFastStop, status: int) -> None:
        release = False
        with self._condition:
            if self._idle_fast_stop is idle_stop:
                idle_stop.status = status
                self._idle_fast_stop = None
                release = status == 0 and not self._lockout and self._owns_ownership
                if release:
                    self._owns_ownership = False
                self._condition.notify_all()
        if release:
            self.ownership.release(self.arm_id)

    def _wait_for_idle_fast_stop_status(
        self, idle_stop: _IdleFastStop, timeout_sec: float | None = None
    ) -> int | None:
        if timeout_sec is None:
            clock = self._monotonic
            duration = self._stop_timeout_sec
        else:
            clock = time.monotonic
            duration = max(0.0, timeout_sec)
        deadline = clock() + duration
        with self._condition:
            while True:
                status = idle_stop.status
                if status is not _STOP_IN_PROGRESS:
                    return int(status or 0)
                if self._idle_fast_stop is not idle_stop:
                    return None
                remaining = deadline - clock()
                if remaining <= 0.0:
                    return None
                self._condition.wait(min(remaining, self._poll_period_sec))

    def _fast_stop_requested(self, generation: int) -> bool:
        with self._condition:
            return self._fast_stop_generation == generation

    def _finish_after_fast_stop(
        self,
        goal_handle: object,
        generation: int,
        current_joints: Sequence[float],
    ) -> Any:
        """Abort only after a fast stop is known to have reached idle."""
        status = self._wait_for_fast_stop_status(generation)
        if status is None:
            self._enter_lockout()
            return self._finish(
                goal_handle,
                generation,
                TerminalState.ABORTED,
                -1,
                current_joints,
                "fast stop status did not arrive before the safety deadline",
            )
        if status != 0:
            self._enter_lockout()
            return self._finish(
                goal_handle,
                generation,
                TerminalState.ABORTED,
                status,
                current_joints,
                f"fast stop failed with API2 status {status}",
            )

        deadline = self._monotonic() + self._stop_timeout_sec
        while True:
            trajectory_status, trajectory_active = self._read_trajectory()
            if trajectory_status != 0:
                self._enter_lockout()
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    trajectory_status,
                    current_joints,
                    "fast stop confirmation reported an API2 error",
                )
            if trajectory_active is False:
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    0,
                    current_joints,
                    "fast stop confirmed by inactive trajectory",
                )
            if self._monotonic() >= deadline:
                self._enter_lockout()
                return self._finish(
                    goal_handle,
                    generation,
                    TerminalState.ABORTED,
                    -1,
                    current_joints,
                    "fast stop could not be confirmed by an inactive trajectory",
                )
            self._sleep(self._poll_period_sec)

    def _wait_for_fast_stop_status(self, generation: int) -> int | None:
        deadline = self._monotonic() + self._stop_timeout_sec
        with self._condition:
            while self._fast_stop_generation == generation:
                status = self._fast_stop_status
                if status is not _STOP_IN_PROGRESS:
                    return int(status or 0)
                remaining = deadline - self._monotonic()
                if remaining <= 0.0:
                    return None
                self._condition.wait(min(remaining, self._poll_period_sec))
        return None

    def _wait_for_slow_stop_status(self, generation: int) -> int | None:
        deadline = self._monotonic() + self._stop_timeout_sec
        with self._condition:
            while self._stop_generation == generation:
                status = self._stop_status
                if status is not _STOP_IN_PROGRESS:
                    return int(status or 0)
                remaining = deadline - self._monotonic()
                if remaining <= 0.0:
                    return None
                self._condition.wait(min(remaining, self._poll_period_sec))
        return None

    def _wait_for_reservation_stop_status(
        self, reservation: _Reservation
    ) -> int | None:
        deadline = self._monotonic() + self._stop_timeout_sec
        with self._condition:
            while self._reservation is reservation:
                status = reservation.stop_status
                if status is not _STOP_IN_PROGRESS:
                    return int(status or 0)
                remaining = deadline - self._monotonic()
                if remaining <= 0.0:
                    return None
                self._condition.wait(min(remaining, self._poll_period_sec))
        return None

    def _enter_lockout(self) -> None:
        with self._lock:
            self._lockout = True

    def clear_lockout_after_disconnect(self) -> None:
        """Clear stale callbacks after confirmed disconnect, never physical lockout."""
        release = False
        with self._lock:
            if not self._lockout and not self._event_channel_quarantined:
                return
            self._event_channel_quarantined = False
            self._event = None
            self._event_channel_cleared_through_generation = self._generation
            release = (
                not self._lockout
                and self._active_goal is None
                and self._reservation is None
                and self._idle_fast_stop is None
                and self._owns_ownership
            )
            if release:
                self._owns_ownership = False
        if release:
            self.ownership.release(self.arm_id)

    def reconcile_after_connect(self, *, connection_reset: bool = False) -> bool:
        """Reconcile safety state after a newly created SDK connection."""
        status, trajectory_active = self._read_trajectory()
        if status != 0 or trajectory_active is not False:
            return False
        release = False
        with self._lock:
            if (
                self._active_goal is not None
                or self._reservation is not None
                or self._idle_fast_stop is not None
            ):
                return False
            if not self._owns_ownership and self.ownership.is_busy(self.arm_id):
                return False
            if self._lockout and not self._owns_ownership:
                return False
            if self._lockout:
                self._lockout = False
                release = True
                self._owns_ownership = False
            if connection_reset:
                self._event_channel_quarantined = False
                self._event = None
                self._event_channel_cleared_through_generation = self._generation
        if release:
            self.ownership.release(self.arm_id)
        return True

    def _read_state(self) -> tuple[int, tuple[float, ...], bool | None]:
        try:
            state = self.adapter.get_state()
        except Exception as error:
            self._log("error", f"get_state adapter call failed: {error}")
            return _nonzero_status(getattr(self.adapter, "last_error", -1)), (), None
        status = _int_value(_field(state, "error_code", 0), default=-1)
        connected = _field(state, "connected", None)
        connected_value = connected if isinstance(connected, bool) else None
        joints = _finite_vector(_field(state, "joint_degrees", ()), 6)
        return status, joints, connected_value

    def _goal_has_converged(
        self, goal: ValidatedGoal, current_joints: Sequence[float]
    ) -> bool:
        """Verify joints, while pose commands rely on event/trajectory evidence."""
        if goal.command != CommandType.MOVEJ:
            # The vendor reference does not establish that current-arm-state
            # poses share WORK/TOOL target frames. Completion therefore uses
            # only the controller success event and inactive trajectory query.
            return True
        target = _finite_vector(goal.joint_degrees, 6)
        observed = _finite_vector(current_joints, 6)
        return bool(target) and bool(observed) and all(
            abs(actual - expected) <= self._joint_goal_tolerance_deg
            for actual, expected in zip(observed, target)
        )

    def _read_trajectory(self) -> tuple[int, bool | None]:
        try:
            raw = self.adapter.current_trajectory()
        except Exception as error:
            self._log("error", f"current_trajectory adapter call failed: {error}")
            return _nonzero_status(getattr(self.adapter, "last_error", -1)), None
        status = 0
        payload = raw
        if isinstance(raw, (tuple, list)):
            if len(raw) < 2:
                return -1, None
            status = _int_value(raw[0], default=-1)
            payload = raw[1]
        if isinstance(payload, Mapping):
            for key in ("err_code", "error_code", "status"):
                if key in payload:
                    status = _int_value(payload[key], default=-1)
                    break
            trajectory_type = None
            for key in (
                "trajectory_type",
                "trajectory_state",
                "current_trajectory",
                "trajectory",
            ):
                if key in payload:
                    trajectory_type = payload[key]
                    break
            if trajectory_type is None:
                return status, None
            value = _int_value(trajectory_type, default=-1)
            return status, value != 0 if value >= 0 else None
        if isinstance(payload, int) and not isinstance(payload, bool):
            return status, payload != 0
        return status, None

    def _take_event(self, generation: int) -> bool | None:
        with self._lock:
            if self._event is None or self._event[0] != generation:
                return None
            _, state = self._event
            if not state:
                self._event = None
            return state

    def _confirm_completion_event(self, generation: int) -> None:
        """Record the only event state safe enough to reuse the channel."""
        with self._lock:
            if self._active_generation == generation:
                self._confirmed_event_generation = generation

    def _shutdown_requested(self, generation: int) -> bool:
        with self._lock:
            return self._shutdown_generation == generation

    def _publish_feedback(
        self,
        goal_handle: object,
        phase: FeedbackPhase,
        goal: ValidatedGoal | None,
        current_joints: Sequence[float],
        progress: float,
        api2_status: int,
        detail: str,
    ) -> None:
        feedback = self.action_type.Feedback()
        feedback.phase = int(phase)
        feedback.progress = float(progress) if math.isfinite(progress) else 0.0
        feedback.current_joint_degrees = list(current_joints) if len(current_joints) == 6 else [0.0] * 6
        if goal is None:
            feedback.active_reference_type = int(ReferenceType.BASE)
            feedback.active_reference_name = ""
        else:
            feedback.active_reference_type = int(goal.reference_type)
            feedback.active_reference_name = goal.reference_name
        feedback.api2_status = int(api2_status)
        feedback.detail = detail
        goal_handle.publish_feedback(feedback)

    def _finish_unowned(
        self,
        goal_handle: object,
        terminal_state: TerminalState,
        api2_status: int,
        message: str,
    ) -> Any:
        self._release_reservation(getattr(goal_handle, "request", None))
        result = self._make_result(terminal_state, api2_status, (), message)
        self._transition(goal_handle, terminal_state)
        return result

    def _release_reservation(self, request: object | None) -> None:
        release = False
        with self._lock:
            if (
                request is not None
                and self._reservation is not None
                and request is self._reservation.request
            ):
                self._reservation = None
                release = not self._lockout and self._owns_ownership
                if release:
                    self._owns_ownership = False
        if release:
            self.ownership.release(self.arm_id)

    def _consume_reservation_terminal(
        self, request: object | None, goal_handle: object
    ) -> tuple[TerminalState, int, str] | None:
        if request is None:
            return None
        with self._condition:
            reservation = self._reservation
            if (
                reservation is None
                or request is not reservation.request
            ):
                return None
            if reservation.stop_status is _STOP_IN_PROGRESS:
                status = self._wait_for_reservation_stop_status(reservation)
                if status is None:
                    self._enter_lockout()
                    reservation.stop_status = -1
                    reservation.terminal_state = TerminalState.ABORTED
                    reservation.api2_status = -1
                    reservation.message = (
                        "pre-submit stop status did not arrive before the safety deadline"
                    )
                    self._condition.notify_all()
                elif reservation.terminal_state is None:
                    return None
            if reservation.terminal_state is None:
                return None
            if (
                reservation.terminal_state == TerminalState.CANCELED
                and not self._wait_for_canceling_witness_locked(goal_handle)
            ):
                reservation.terminal_state = TerminalState.ABORTED
                reservation.api2_status = -1
                reservation.message = (
                    "cancel request was not acknowledged before execution"
                )
            return (
                reservation.terminal_state,
                reservation.api2_status,
                reservation.message,
            )

    def _finish(
        self,
        goal_handle: object,
        generation: int,
        terminal_state: TerminalState,
        api2_status: int,
        current_joints: Sequence[float],
        message: str,
    ) -> Any:
        with self._condition:
            if self._terminal_generation == generation:
                return self._terminal_result
            result = self._make_result(
                terminal_state, api2_status, current_joints, message
            )
            self._terminal_generation = generation
            self._terminal_result = result
            self._accept_events = False
        self._transition(goal_handle, terminal_state)
        self._log(
            "info" if terminal_state == TerminalState.SUCCEEDED else "warn",
            f"Motion goal finished: state={terminal_state.name} "
            f"api2_status={api2_status} detail={message}",
        )
        return result

    def _make_result(
        self,
        terminal_state: TerminalState,
        api2_status: int,
        current_joints: Sequence[float],
        message: str,
    ) -> Any:
        result = self.action_type.Result()
        result.success = terminal_state == TerminalState.SUCCEEDED
        result.terminal_state = int(terminal_state)
        result.api2_status = int(api2_status)
        result.final_joint_degrees = (
            list(current_joints) if len(current_joints) == 6 else [0.0] * 6
        )
        result.message = message
        return result

    @staticmethod
    def _transition(goal_handle: object, terminal_state: TerminalState) -> None:
        if terminal_state == TerminalState.SUCCEEDED:
            goal_handle.succeed()
        elif terminal_state == TerminalState.CANCELED:
            goal_handle.canceled()
        else:
            goal_handle.abort()

    def _release_generation(self, generation: int) -> None:
        release = False
        with self._condition:
            if self._active_generation == generation:
                if (
                    self._submitted_generation == generation
                    and self._confirmed_event_generation != generation
                    and generation > self._event_channel_cleared_through_generation
                ):
                    self._event_channel_quarantined = True
                self._active_goal = None
                self._active_generation = None
                self._accept_events = False
                self._event = None
                self._submitted_generation = None
                self._confirmed_event_generation = None
                self._fast_stop_generation = None
                self._fast_stop_status = None
                self._shutdown_generation = None
                # A confirmed physical stop can release arm ownership even if
                # a generation-less callback channel remains quarantined.
                # goal_callback still refuses ordinary motion until disconnect.
                release = not self._lockout and self._owns_ownership
                if release:
                    self._owns_ownership = False
                self._condition.notify_all()
        if release:
            self.ownership.release(self.arm_id)

    def _log(self, level: str, message: str) -> None:
        if self._logger is None:
            return
        method = getattr(self._logger, level, None)
        if method is not None:
            method(message)


def _trajectory_event(event: object) -> tuple[int | None, bool] | None:
    event_type = _int_value(_field(event, "event_type", None), default=-1)
    device = _int_value(_field(event, "device", None), default=-1)
    if event_type != _CURRENT_TRAJECTORY_EVENT or device != _ARM_DEVICE:
        return None
    connect = _field(event, "trajectory_connect", 0)
    if _int_value(connect, default=-1) != 0:
        return None
    raw_state = _field(event, "trajectory_state", None)
    if isinstance(raw_state, bool):
        state = raw_state
    elif isinstance(raw_state, int) and raw_state in {0, 1}:
        state = bool(raw_state)
    else:
        return None
    raw_generation = _field(
        event, "generation", _field(event, "goal_generation", None)
    )
    generation = None
    if raw_generation is not None:
        generation = _int_value(raw_generation, default=-1)
        if generation < 0:
            return None
    return generation, state


def _estimated_progress(
    goal: ValidatedGoal,
    initial_joints: Sequence[float],
    current_joints: Sequence[float],
) -> float:
    if goal.command != CommandType.MOVEJ:
        return 0.0
    start = _finite_vector(initial_joints, 6)
    current = _finite_vector(current_joints, 6)
    target = _finite_vector(goal.joint_degrees, 6)
    if not start or not current or not target:
        return 0.0
    total = math.dist(start, target)
    if not math.isfinite(total) or total <= 0.0:
        return 0.0
    remaining = math.dist(current, target)
    if not math.isfinite(remaining):
        return 0.0
    return min(1.0, max(0.0, 1.0 - remaining / total))


def _finite_vector(value: object, length: int) -> tuple[float, ...]:
    if isinstance(value, (str, bytes)) or not isinstance(value, Sequence):
        return ()
    if len(value) != length:
        return ()
    try:
        result = tuple(float(item) for item in value)
    except (TypeError, ValueError, OverflowError):
        return ()
    return result if all(math.isfinite(item) for item in result) else ()


def _field(value: object, name: str, default: object = None) -> object:
    if isinstance(value, Mapping):
        return value.get(name, default)
    return getattr(value, name, default)


def _int_value(value: object, *, default: int) -> int:
    if isinstance(value, bool):
        return default
    try:
        return int(getattr(value, "value", value))
    except (TypeError, ValueError, OverflowError):
        return default


def _nonzero_status(value: object) -> int:
    status = _int_value(value, default=-1)
    return status if status != 0 else -1


def _first_nonzero(*values: int) -> int:
    for value in values:
        if value != 0:
            return value
    return 0


__all__ = ["ArmOwnership", "ArmOwnershipManager", "MotionCoordinator"]
