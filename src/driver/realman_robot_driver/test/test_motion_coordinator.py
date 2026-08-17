from __future__ import annotations

import threading
from dataclasses import replace
from enum import IntEnum
from types import SimpleNamespace

import pytest

from realman_robot_driver.motion_coordinator import ArmOwnership, MotionCoordinator
from realman_robot_driver.motion_types import (
    CommandType,
    FeedbackPhase,
    Goal,
    ReferenceState,
    ReferenceType,
    TerminalState,
)
from realman_robot_driver.realman_sdk_adapter import RobotState


class FakeGoalResponse(IntEnum):
    REJECT = 0
    ACCEPT = 1


class FakeCancelResponse(IntEnum):
    REJECT = 0
    ACCEPT = 1


class FakeResult:
    SUCCEEDED = int(TerminalState.SUCCEEDED)
    CANCELED = int(TerminalState.CANCELED)
    ABORTED = int(TerminalState.ABORTED)
    TIMEOUT = int(TerminalState.TIMEOUT)

    def __init__(self) -> None:
        self.success = False
        self.terminal_state = self.ABORTED
        self.api2_status = 0
        self.final_joint_degrees = [0.0] * 6
        self.message = ""


class FakeFeedback:
    VALIDATING = int(FeedbackPhase.VALIDATING)
    SUBMITTING = int(FeedbackPhase.SUBMITTING)
    EXECUTING = int(FeedbackPhase.EXECUTING)
    STOPPING = int(FeedbackPhase.STOPPING)

    def __init__(self) -> None:
        self.phase = self.VALIDATING
        self.progress = 0.0
        self.current_joint_degrees = [0.0] * 6
        self.active_reference_type = int(ReferenceType.BASE)
        self.active_reference_name = ""
        self.api2_status = 0
        self.detail = ""


class FakeExecuteMotion:
    Result = FakeResult
    Feedback = FakeFeedback


class FakeClock:
    def __init__(self) -> None:
        self.now = 0.0
        self.on_sleep = None

    def monotonic(self) -> float:
        return self.now

    def sleep(self, duration: float) -> None:
        self.now += duration
        if self.on_sleep is not None:
            self.on_sleep()


class FakeAdapter:
    def __init__(self) -> None:
        self.connected = True
        self.last_error = 0
        self.last_error_message = ""
        self.calls: list[tuple[object, ...]] = []
        self.move_status = 0
        self.stop_status = 0
        self.fast_stop_status = 0
        self.fast_stop_completes_trajectory = True
        self.slow_stop_completes_trajectory = True
        self.stopped = False
        self.state_error_when_stopped = 0
        self.trajectory_error_when_stopped = 0
        self.joints = (0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        self.event_callback = None
        self.emit_event_on_move = False

    def movej(
        self,
        joint_degrees: list[float],
        velocity_percent: int,
        blend_radius_percent: int,
        *,
        connect: bool,
    ) -> int:
        self.calls.append(
            (
                "movej",
                list(joint_degrees),
                velocity_percent,
                blend_radius_percent,
                connect,
            )
        )
        if self.emit_event_on_move and self.event_callback is not None:
            self.stopped = True
            self.joints = tuple(joint_degrees)
            self.event_callback(
                SimpleNamespace(event_type=1, trajectory_state=True, device=0)
            )
        return self.move_status

    def movel(
        self,
        pose: list[float],
        velocity_percent: int,
        blend_radius_percent: int,
        *,
        connect: bool,
    ) -> int:
        self.calls.append(
            ("movel", list(pose), velocity_percent, blend_radius_percent, connect)
        )
        return self.move_status

    def movej_p(
        self,
        pose: list[float],
        velocity_percent: int,
        blend_radius_percent: int,
        *,
        connect: bool,
    ) -> int:
        self.calls.append(
            ("movej_p", list(pose), velocity_percent, blend_radius_percent, connect)
        )
        return self.move_status

    def slow_stop(self) -> int:
        self.calls.append(("slow_stop",))
        if self.stop_status == 0 and self.slow_stop_completes_trajectory:
            self.stopped = True
        return self.stop_status

    def stop(self) -> int:
        self.calls.append(("stop",))
        if self.fast_stop_status == 0 and self.fast_stop_completes_trajectory:
            self.stopped = True
        return self.fast_stop_status

    def current_trajectory(self):
        self.calls.append(("current_trajectory",))
        return {
            "error_code": self.trajectory_error_when_stopped if self.stopped else 0,
            "trajectory_type": 0 if self.stopped else 1,
        }

    def get_state(self) -> RobotState:
        self.calls.append(("get_state",))
        error_code = self.state_error_when_stopped if self.stopped else self.last_error
        return RobotState(tuple(self.joints), self.connected, "RM65-B", error_code)


class FakeCoordinateManager:
    def __init__(self, allowed: bool = True) -> None:
        self.allowed = allowed

    def motion_allowed(self, arm: str) -> bool:
        assert arm == "l"
        return self.allowed


class FakeGoalHandle:
    def __init__(self, request: Goal) -> None:
        self.request = request
        self.is_cancel_requested = False
        self.feedback: list[FakeFeedback] = []
        self.execute_calls = 0
        self.transitions: list[str] = []

    def execute(self) -> None:
        self.execute_calls += 1

    def publish_feedback(self, feedback: FakeFeedback) -> None:
        self.feedback.append(feedback)

    def succeed(self) -> None:
        self.transitions.append("succeeded")

    def canceled(self) -> None:
        self.transitions.append("canceled")

    def abort(self) -> None:
        self.transitions.append("aborted")


def movej_goal(**changes: object) -> Goal:
    return replace(
        Goal(
            command=CommandType.MOVEJ,
            reference_type=ReferenceType.BASE,
            reference_name="base",
            joint_degrees=(1.0, 2.0, 3.0, 4.0, 5.0, 6.0),
            velocity_percent=20,
            blend_radius_percent=0,
            timeout_sec=1.0,
        ),
        **changes,
    )


def pose_goal(command: CommandType) -> Goal:
    return Goal(
        command=command,
        reference_type=ReferenceType.WORK,
        reference_name="cell",
        pose_position_m=(0.1, 0.2, 0.3),
        pose_quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        velocity_percent=30,
        blend_radius_percent=4,
        timeout_sec=1.0,
    )


def make_coordinator(
    *,
    adapter: FakeAdapter | None = None,
    clock: FakeClock | None = None,
    coordinates: FakeCoordinateManager | None = None,
    ownership: ArmOwnership | None = None,
    active_reference=None,
    stop_timeout_sec: float = 2.0,
) -> tuple[MotionCoordinator, FakeAdapter, FakeClock, ArmOwnership]:
    adapter = adapter or FakeAdapter()
    clock = clock or FakeClock()
    ownership = ownership or ArmOwnership()
    resolver = ReferenceState(
        {
            ReferenceType.BASE: frozenset({"base"}),
            ReferenceType.WORK: frozenset({"cell"}),
            ReferenceType.TOOL: frozenset({"tcpgrip"}),
        }
    )
    coordinator = MotionCoordinator(
        arm_id="l",
        adapter=adapter,
        coordinate_manager=coordinates or FakeCoordinateManager(),
        ownership=ownership,
        reference_resolver=resolver,
        active_reference=active_reference
        or (lambda reference_type: {
            ReferenceType.BASE: "base",
            ReferenceType.WORK: "cell",
            ReferenceType.TOOL: "tcpgrip",
        }[reference_type]),
        action_type=FakeExecuteMotion,
        goal_response_type=FakeGoalResponse,
        cancel_response_type=FakeCancelResponse,
        monotonic=clock.monotonic,
        sleep=clock.sleep,
        poll_period_sec=0.01,
        stop_timeout_sec=stop_timeout_sec,
    )
    return coordinator, adapter, clock, ownership


def complete_after_first_poll(
    coordinator: MotionCoordinator,
    adapter: FakeAdapter,
    clock: FakeClock,
    *,
    success: bool = True,
) -> None:
    emitted = False

    def finish() -> None:
        nonlocal emitted
        if emitted:
            return
        emitted = True
        adapter.stopped = True
        adapter.joints = (1.0, 2.0, 3.0, 4.0, 5.0, 6.0)
        coordinator.handle_event(
            SimpleNamespace(event_type=1, trajectory_state=success, device=0)
        )

    clock.on_sleep = finish


def test_invalid_execute_aborts_without_any_sdk_call():
    coordinator, adapter, _, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal(velocity_percent=0))

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.success is False
    assert handle.transitions == ["aborted"]
    assert adapter.calls == []
    assert ownership.is_busy("l") is False


def test_goal_callback_rejects_busy_arm_atomically():
    coordinator, _, _, ownership = make_coordinator()

    assert coordinator.goal_callback(movej_goal()) == FakeGoalResponse.ACCEPT
    assert ownership.is_busy("l") is True
    assert coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6)) == FakeGoalResponse.REJECT


def test_accepted_callback_starts_goal_execution():
    coordinator, _, _, _ = make_coordinator()
    handle = FakeGoalHandle(movej_goal())

    coordinator.accepted_callback(handle)

    assert handle.execute_calls == 1


def test_cancel_callback_accepts_only_the_active_or_reserved_goal():
    coordinator, _, _, _ = make_coordinator()
    active = FakeGoalHandle(movej_goal())
    other = FakeGoalHandle(movej_goal(joint_degrees=(2.0,) * 6))
    assert coordinator.goal_callback(active.request) == FakeGoalResponse.ACCEPT

    assert coordinator.cancel_callback(active) == FakeCancelResponse.ACCEPT
    assert coordinator.cancel_callback(other) == FakeCancelResponse.REJECT


def test_canceling_reserved_goal_prevents_submission_and_reports_canceled():
    coordinator, adapter, _, ownership = make_coordinator()
    reserved = FakeGoalHandle(movej_goal())

    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    assert coordinator.cancel_callback(reserved) == FakeCancelResponse.ACCEPT

    result = coordinator.execute(reserved)

    assert result.terminal_state == FakeResult.CANCELED
    assert result.success is False
    assert reserved.transitions == ["canceled"]
    assert [call for call in adapter.calls if call[0] == "movej"] == []
    assert ownership.is_busy("l") is False


def test_valid_movej_uses_exact_adapter_call_and_event_succeeds():
    coordinator, adapter, clock, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    assert coordinator.goal_callback(handle.request) == FakeGoalResponse.ACCEPT
    complete_after_first_poll(coordinator, adapter, clock)

    result = coordinator.execute(handle)

    assert (
        "movej",
        [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
        20,
        0,
        False,
    ) in adapter.calls
    assert result.success is True
    assert result.terminal_state == FakeResult.SUCCEEDED
    assert result.api2_status == 0
    assert result.final_joint_degrees == [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
    assert handle.transitions == ["succeeded"]
    assert [item.phase for item in handle.feedback[:3]] == [
        FakeFeedback.VALIDATING,
        FakeFeedback.SUBMITTING,
        FakeFeedback.EXECUTING,
    ]
    assert ownership.is_busy("l") is False


def test_completion_callback_returned_by_sdk_submission_is_current_goal_event():
    adapter = FakeAdapter()
    coordinator, adapter, clock, _ = make_coordinator(adapter=adapter)
    adapter.event_callback = coordinator.handle_event

    def emit_after_submit() -> None:
        adapter.stopped = True
        adapter.joints = (1.0, 2.0, 3.0, 4.0, 5.0, 6.0)
        adapter.event_callback(
            SimpleNamespace(event_type=1, trajectory_state=True, device=0)
        )

    clock.on_sleep = emit_after_submit

    result = coordinator.execute(FakeGoalHandle(movej_goal()))

    assert result.terminal_state == FakeResult.SUCCEEDED
    assert adapter.calls.count(("slow_stop",)) == 0


def test_submission_callback_before_sdk_returns_is_ignored_as_stale():
    adapter = FakeAdapter()
    adapter.emit_event_on_move = True
    coordinator, adapter, _, _ = make_coordinator(adapter=adapter)
    adapter.event_callback = coordinator.handle_event

    result = coordinator.execute(FakeGoalHandle(movej_goal(timeout_sec=0.02)))

    assert result.terminal_state == FakeResult.TIMEOUT
    assert adapter.calls.count(("slow_stop",)) == 1


@pytest.mark.parametrize(
    ("state_status", "trajectory_status", "expected_status"),
    [(23, 0, 23), (0, 47, 47), (23, 47, 23)],
)
def test_nonzero_monitor_status_aborts_and_locks_arm_without_reporting_success(
    state_status: int,
    trajectory_status: int,
    expected_status: int,
):
    adapter = FakeAdapter()
    adapter.last_error = state_status
    if trajectory_status:
        adapter.current_trajectory = lambda: {
            "error_code": trajectory_status,
            "trajectory_type": 0,
        }
    coordinator, adapter, _, ownership = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.success is False
    assert result.api2_status == expected_status
    assert handle.transitions == ["aborted"]
    assert ownership.is_busy("l") is True
    assert coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6)) == FakeGoalResponse.REJECT


def test_revalidation_failure_after_acceptance_releases_reservation_for_next_goal():
    adapter = FakeAdapter()
    coordinator, adapter, _, ownership = make_coordinator(adapter=adapter)
    accepted = FakeGoalHandle(movej_goal())

    assert coordinator.goal_callback(accepted.request) == FakeGoalResponse.ACCEPT
    adapter.connected = False
    result = coordinator.execute(accepted)

    assert result.terminal_state == FakeResult.ABORTED
    assert ownership.is_busy("l") is False
    adapter.connected = True
    assert (
        coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6))
        == FakeGoalResponse.ACCEPT
    )


def test_activation_failure_does_not_release_another_goal_reservation():
    coordinator, adapter, _, ownership = make_coordinator()
    reserved = FakeGoalHandle(movej_goal())
    unaccepted = FakeGoalHandle(movej_goal(joint_degrees=(2.0,) * 6))

    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    result = coordinator.execute(unaccepted)

    assert result.terminal_state == FakeResult.ABORTED
    assert adapter.calls == []
    assert ownership.is_busy("l") is True
    assert coordinator.cancel_callback(reserved) == FakeCancelResponse.ACCEPT


@pytest.mark.parametrize(
    ("command", "method_name"),
    [(CommandType.MOVEL, "movel"), (CommandType.MOVEJ_P, "movej_p")],
)
def test_pose_commands_submit_wxyz_pose_but_fail_closed_without_frame_proof(
    command: CommandType, method_name: str
):
    coordinator, adapter, clock, _ = make_coordinator()
    handle = FakeGoalHandle(pose_goal(command))
    complete_after_first_poll(coordinator, adapter, clock)

    result = coordinator.execute(handle)

    assert (
        method_name,
        [0.1, 0.2, 0.3, 1.0, 0.0, 0.0, 0.0],
        30,
        4,
        False,
    ) in adapter.calls
    assert result.terminal_state == FakeResult.TIMEOUT
    assert result.success is False


def test_vendor_submission_error_aborts_and_preserves_api2_status():
    adapter = FakeAdapter()
    adapter.move_status = 37
    coordinator, _, _, ownership = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 37
    assert handle.transitions == ["aborted"]
    assert ownership.is_busy("l") is False


def test_failed_trajectory_event_aborts_active_goal():
    coordinator, adapter, clock, _ = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    complete_after_first_poll(coordinator, adapter, clock, success=False)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert handle.transitions == ["aborted"]


def test_cancel_stops_once_waits_for_stopped_state_and_returns_canceled():
    coordinator, adapter, clock, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    clock.on_sleep = lambda: setattr(handle, "is_cancel_requested", True)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.CANCELED
    assert adapter.calls.count(("slow_stop",)) == 1
    assert FakeFeedback.STOPPING in [feedback.phase for feedback in handle.feedback]
    assert handle.transitions == ["canceled"]
    assert ownership.is_busy("l") is False


def test_cancel_stop_failure_aborts_with_stop_api2_status():
    adapter = FakeAdapter()
    adapter.stop_status = 52
    coordinator, _, clock, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())
    clock.on_sleep = lambda: setattr(handle, "is_cancel_requested", True)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 52
    assert adapter.calls.count(("slow_stop",)) == 1
    assert handle.transitions == ["aborted"]


def test_controlled_stop_does_not_accept_an_event_in_place_of_inactive_trajectory():
    adapter = FakeAdapter()
    adapter.slow_stop_completes_trajectory = False
    coordinator, _, clock, ownership = make_coordinator(
        adapter=adapter, stop_timeout_sec=0.02
    )
    handle = FakeGoalHandle(movej_goal(timeout_sec=10.0))
    emitted = False

    def cancel_and_emit_success() -> None:
        nonlocal emitted
        if emitted:
            return
        emitted = True
        handle.is_cancel_requested = True
        coordinator.handle_event(
            SimpleNamespace(event_type=1, trajectory_state=True, device=0)
        )

    clock.on_sleep = cancel_and_emit_success

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status != 0
    assert ownership.is_busy("l") is True


@pytest.mark.parametrize(
    ("state_status", "trajectory_status", "expected_status"),
    [(23, 0, 23), (0, 47, 47), (23, 47, 23)],
)
def test_cancel_stop_confirmation_status_aborts_before_canceled(
    state_status: int,
    trajectory_status: int,
    expected_status: int,
):
    adapter = FakeAdapter()
    adapter.state_error_when_stopped = state_status
    adapter.trajectory_error_when_stopped = trajectory_status
    coordinator, _, clock, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())
    clock.on_sleep = lambda: setattr(handle, "is_cancel_requested", True)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == expected_status
    assert adapter.calls.count(("slow_stop",)) == 1
    assert handle.transitions == ["aborted"]


def test_timeout_slow_stops_once_and_returns_timeout():
    coordinator, adapter, _, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.TIMEOUT
    assert adapter.calls.count(("slow_stop",)) == 1
    assert handle.transitions == ["aborted"]
    assert ownership.is_busy("l") is False


@pytest.mark.parametrize(
    ("state_status", "trajectory_status", "expected_status"),
    [(23, 0, 23), (0, 47, 47), (23, 47, 23)],
)
def test_timeout_stop_confirmation_status_aborts_before_timeout(
    state_status: int,
    trajectory_status: int,
    expected_status: int,
):
    adapter = FakeAdapter()
    adapter.state_error_when_stopped = state_status
    adapter.trajectory_error_when_stopped = trajectory_status
    coordinator, _, _, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == expected_status
    assert adapter.calls.count(("slow_stop",)) == 1
    assert handle.transitions == ["aborted"]


def test_fast_stop_marks_active_generation_aborted_without_slow_stop_or_timeout():
    adapter = FakeAdapter()
    coordinator, adapter, clock, ownership = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal(timeout_sec=10.0))
    polling = threading.Event()
    resume = threading.Event()
    result_holder = []

    def block_poll() -> None:
        polling.set()
        resume.wait(timeout=1.0)

    clock.on_sleep = block_poll
    execute_thread = threading.Thread(
        target=lambda: result_holder.append(coordinator.execute(handle))
    )
    execute_thread.start()
    try:
        assert polling.wait(timeout=1.0)
        assert coordinator.fast_stop() == 0
    finally:
        resume.set()
    execute_thread.join(timeout=1.0)

    assert execute_thread.is_alive() is False
    assert len(result_holder) == 1
    result = result_holder[0]
    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 0
    assert adapter.calls.count(("stop",)) == 1
    assert adapter.calls.count(("slow_stop",)) == 0
    assert clock.now < 10.0
    assert ownership.is_busy("l") is False


def test_fast_stop_failure_still_aborts_active_generation_with_status():
    adapter = FakeAdapter()
    adapter.fast_stop_status = 73
    coordinator, adapter, clock, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal(timeout_sec=10.0))
    clock.on_sleep = coordinator.fast_stop

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 73
    assert adapter.calls.count(("stop",)) == 1
    assert adapter.calls.count(("slow_stop",)) == 0


def test_fast_stop_without_inactive_trajectory_aborts_and_locks_out_arm():
    adapter = FakeAdapter()
    adapter.fast_stop_completes_trajectory = False
    coordinator, adapter, clock, ownership = make_coordinator(
        adapter=adapter, stop_timeout_sec=0.02
    )
    handle = FakeGoalHandle(movej_goal(timeout_sec=10.0))
    clock.on_sleep = coordinator.fast_stop

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status != 0
    assert adapter.calls.count(("stop",)) == 1
    assert ownership.is_busy("l") is True
    assert coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6)) == FakeGoalResponse.REJECT


def test_successful_disconnect_notification_releases_fast_stop_lockout():
    adapter = FakeAdapter()
    adapter.fast_stop_completes_trajectory = False
    coordinator, _, clock, ownership = make_coordinator(
        adapter=adapter, stop_timeout_sec=0.02
    )
    clock.on_sleep = coordinator.fast_stop

    result = coordinator.execute(FakeGoalHandle(movej_goal(timeout_sec=10.0)))

    assert result.terminal_state == FakeResult.ABORTED
    assert ownership.is_busy("l") is True
    coordinator.clear_lockout_after_disconnect()
    assert ownership.is_busy("l") is False
    assert coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6)) == FakeGoalResponse.ACCEPT


def test_fast_stop_keeps_reserved_goal_ownership_until_execution_consumes_abort():
    coordinator, _, _, ownership = make_coordinator()
    reserved = FakeGoalHandle(movej_goal())

    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    assert coordinator.fast_stop() == 0
    assert ownership.is_busy("l") is True
    assert (
        coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6))
        == FakeGoalResponse.REJECT
    )

    result = coordinator.execute(reserved)

    assert result.terminal_state == FakeResult.ABORTED
    assert ownership.is_busy("l") is False
    assert (
        coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6))
        == FakeGoalResponse.ACCEPT
    )


def test_reserved_goal_cannot_submit_while_fast_stop_command_is_in_progress():
    coordinator, adapter, _, _ = make_coordinator()
    reserved = FakeGoalHandle(movej_goal(timeout_sec=10.0))
    stop_started = threading.Event()
    release_stop = threading.Event()
    move_attempted = threading.Event()
    original_stop = adapter.stop
    original_movej = adapter.movej
    results = []

    def blocking_stop() -> int:
        stop_started.set()
        assert release_stop.wait(timeout=1.0)
        return original_stop()

    def tracked_movej(*args, **kwargs) -> int:
        move_attempted.set()
        return original_movej(*args, **kwargs)

    adapter.stop = blocking_stop
    adapter.movej = tracked_movej
    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    stop_thread = threading.Thread(target=coordinator.fast_stop)
    stop_thread.start()
    assert stop_started.wait(timeout=1.0)
    execute_thread = threading.Thread(
        target=lambda: results.append(coordinator.execute(reserved))
    )
    execute_thread.start()
    try:
        assert move_attempted.wait(timeout=0.05) is False
    finally:
        release_stop.set()
    stop_thread.join(timeout=1.0)
    execute_thread.join(timeout=1.0)

    assert stop_thread.is_alive() is False
    assert execute_thread.is_alive() is False
    assert len(results) == 1
    assert results[0].terminal_state == FakeResult.ABORTED
    assert not any(call[0] == "movej" for call in adapter.calls)


def test_pre_submit_shutdown_slow_stop_failure_aborts_with_original_status():
    adapter = FakeAdapter()
    adapter.stop_status = 61
    coordinator, adapter, _, ownership = make_coordinator(adapter=adapter)
    reserved = FakeGoalHandle(movej_goal())

    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    assert coordinator.shutdown(timeout_sec=0.0) == 61
    assert ownership.is_busy("l") is True

    result = coordinator.execute(reserved)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 61
    assert adapter.calls.count(("slow_stop",)) == 1
    assert ownership.is_busy("l") is False


def test_activated_pre_submit_shutdown_failure_aborts_with_original_status():
    adapter = FakeAdapter()
    adapter.stop_status = 67
    coordinator, adapter, _, ownership = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())
    activated = threading.Event()
    resume = threading.Event()
    results = []
    original_activate = coordinator._activate

    def pause_after_activation(goal_handle: object, request: object) -> int | None:
        generation = original_activate(goal_handle, request)
        activated.set()
        assert resume.wait(timeout=1.0)
        return generation

    coordinator._activate = pause_after_activation
    execute_thread = threading.Thread(
        target=lambda: results.append(coordinator.execute(handle))
    )
    execute_thread.start()
    try:
        assert activated.wait(timeout=1.0)
        assert coordinator.shutdown(timeout_sec=0.0) == 67
    finally:
        resume.set()
    execute_thread.join(timeout=1.0)

    assert execute_thread.is_alive() is False
    assert len(results) == 1
    assert results[0].terminal_state == FakeResult.ABORTED
    assert results[0].api2_status == 67
    assert not any(call[0] == "movej" for call in adapter.calls)
    assert ownership.is_busy("l") is False


@pytest.mark.parametrize(
    ("interrupt", "stop_call", "terminal_state"),
    [
        ("fast_stop", ("stop",), FakeResult.ABORTED),
        ("shutdown", ("slow_stop",), FakeResult.CANCELED),
    ],
)
def test_stop_before_submission_never_allows_a_later_movej(
    interrupt: str, stop_call: tuple[str], terminal_state: int,
):
    coordinator, adapter, _, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    activated = threading.Event()
    resume = threading.Event()
    result_holder = []
    original_activate = coordinator._activate

    def pause_after_activation(goal_handle: object, request: object) -> int | None:
        generation = original_activate(goal_handle, request)
        activated.set()
        assert resume.wait(timeout=1.0)
        return generation

    coordinator._activate = pause_after_activation
    execute_thread = threading.Thread(
        target=lambda: result_holder.append(coordinator.execute(handle))
    )
    execute_thread.start()
    try:
        assert activated.wait(timeout=1.0)
        if interrupt == "shutdown":
            assert coordinator.shutdown(timeout_sec=0.0) == 0
        else:
            assert coordinator.fast_stop() == 0
    finally:
        resume.set()
    execute_thread.join(timeout=1.0)

    assert execute_thread.is_alive() is False
    assert len(result_holder) == 1
    assert result_holder[0].terminal_state == terminal_state
    assert stop_call in adapter.calls
    assert [call for call in adapter.calls if call[0] == "movej"] == []
    assert ownership.is_busy("l") is False


def test_cancel_before_submission_never_allows_a_later_movej():
    coordinator, adapter, _, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    activated = threading.Event()
    resume = threading.Event()
    result_holder = []
    original_activate = coordinator._activate

    def pause_after_activation(goal_handle: object, request: object) -> int | None:
        generation = original_activate(goal_handle, request)
        activated.set()
        assert resume.wait(timeout=1.0)
        return generation

    coordinator._activate = pause_after_activation
    execute_thread = threading.Thread(
        target=lambda: result_holder.append(coordinator.execute(handle))
    )
    execute_thread.start()
    try:
        assert activated.wait(timeout=1.0)
        assert coordinator.cancel_callback(handle) == FakeCancelResponse.ACCEPT
    finally:
        resume.set()
    execute_thread.join(timeout=1.0)

    assert execute_thread.is_alive() is False
    assert len(result_holder) == 1
    assert result_holder[0].terminal_state == FakeResult.CANCELED
    assert [call for call in adapter.calls if call[0] == "movej"] == []
    assert adapter.calls.count(("slow_stop",)) == 0
    assert ownership.is_busy("l") is False


def test_reserved_goal_invalidations_are_consumed_before_the_next_reservation():
    coordinator, adapter, _, ownership = make_coordinator()

    for joint_degrees in ((1.0,) * 6, (2.0,) * 6):
        reserved = FakeGoalHandle(movej_goal(joint_degrees=joint_degrees))
        assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
        assert coordinator.fast_stop() == 0

        result = coordinator.execute(reserved)

        assert result.terminal_state == FakeResult.ABORTED
        assert ownership.is_busy("l") is False

    assert adapter.calls.count(("stop",)) == 2
    assert adapter.calls.count(("current_trajectory",)) == 2
    assert [call for call in adapter.calls if call[0] == "movej"] == []


def test_failed_idle_fast_stop_locks_arm_after_returning_adapter_status():
    adapter = FakeAdapter()
    adapter.fast_stop_status = 19
    coordinator, adapter, _, ownership = make_coordinator(adapter=adapter)

    status = coordinator.fast_stop()

    assert status == 19
    assert adapter.calls == [("stop",)]
    assert ownership.is_busy("l") is True
    assert coordinator.goal_callback(movej_goal()) == FakeGoalResponse.REJECT


def test_idle_fast_stop_reserves_arm_until_stop_is_confirmed_before_goal_can_submit():
    coordinator, adapter, _, _ = make_coordinator()
    stop_started = threading.Event()
    release_stop = threading.Event()
    move_attempted = threading.Event()
    stop_results = []
    goal_results = []
    original_stop = adapter.stop
    original_movej = adapter.movej

    def blocking_stop() -> int:
        stop_started.set()
        assert release_stop.wait(timeout=1.0)
        return original_stop()

    def tracked_movej(*args, **kwargs) -> int:
        move_attempted.set()
        return original_movej(*args, **kwargs)

    def submit_goal_during_stop() -> None:
        handle = FakeGoalHandle(movej_goal(timeout_sec=10.0))
        if coordinator.goal_callback(handle.request) == FakeGoalResponse.ACCEPT:
            goal_results.append(coordinator.execute(handle))

    adapter.stop = blocking_stop
    adapter.movej = tracked_movej
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(coordinator.fast_stop())
    )
    stop_thread.start()
    assert stop_started.wait(timeout=1.0)
    goal_thread = threading.Thread(target=submit_goal_during_stop)
    goal_thread.start()
    try:
        assert move_attempted.wait(timeout=0.05) is False
    finally:
        release_stop.set()
    stop_thread.join(timeout=1.0)
    goal_thread.join(timeout=1.0)

    assert stop_thread.is_alive() is False
    assert goal_thread.is_alive() is False
    assert stop_results == [0]
    assert goal_results == []
    assert not any(call[0] == "movej" for call in adapter.calls)


def test_idle_fast_stop_cannot_cross_goal_ownership_reservation_gap():
    coordinator, adapter, _, ownership = make_coordinator()
    ownership_acquired = threading.Event()
    release_acquire = threading.Event()
    stop_results = []
    goal_results = []
    original_acquire = ownership.acquire

    def blocked_first_acquire(arm: str) -> bool:
        ownership_acquired.set()
        assert release_acquire.wait(timeout=1.0)
        return original_acquire(arm)

    ownership.acquire = blocked_first_acquire
    goal = FakeGoalHandle(movej_goal())
    goal_thread = threading.Thread(
        target=lambda: goal_results.append(coordinator.goal_callback(goal.request))
    )
    goal_thread.start()
    assert ownership_acquired.wait(timeout=1.0)
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(coordinator.fast_stop())
    )
    stop_thread.start()
    try:
        assert stop_thread.is_alive() is True
    finally:
        release_acquire.set()
    goal_thread.join(timeout=1.0)
    stop_thread.join(timeout=1.0)

    assert goal_thread.is_alive() is False
    assert stop_thread.is_alive() is False
    assert goal_results == [FakeGoalResponse.ACCEPT]
    assert stop_results == [0]
    assert adapter.calls.count(("stop",)) == 1
    assert ownership.is_busy("l") is True


def test_concurrent_idle_fast_stops_share_the_confirmed_result():
    coordinator, adapter, _, ownership = make_coordinator()
    stop_started = threading.Event()
    release_stop = threading.Event()
    original_stop = adapter.stop
    results = []

    def blocking_stop() -> int:
        stop_started.set()
        assert release_stop.wait(timeout=1.0)
        return original_stop()

    adapter.stop = blocking_stop
    first = threading.Thread(target=lambda: results.append(coordinator.fast_stop()))
    second = threading.Thread(target=lambda: results.append(coordinator.fast_stop()))
    first.start()
    assert stop_started.wait(timeout=1.0)
    second.start()
    release_stop.set()
    first.join(timeout=1.0)
    second.join(timeout=1.0)

    assert first.is_alive() is False
    assert second.is_alive() is False
    assert sorted(results) == [0, 0]
    assert adapter.calls.count(("stop",)) == 1
    assert ownership.is_busy("l") is False


def test_shutdown_waits_for_inflight_idle_fast_stop_and_times_out_fail_closed():
    coordinator, adapter, _, ownership = make_coordinator(stop_timeout_sec=0.2)
    trajectory_started = threading.Event()
    release_trajectory = threading.Event()
    stop_results = []
    original_trajectory = adapter.current_trajectory

    def blocking_trajectory():
        trajectory_started.set()
        assert release_trajectory.wait(timeout=1.0)
        return original_trajectory()

    adapter.current_trajectory = blocking_trajectory
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(coordinator.fast_stop())
    )
    stop_thread.start()
    assert trajectory_started.wait(timeout=1.0)

    status = coordinator.shutdown(timeout_sec=0.01)

    assert status != 0
    assert stop_thread.is_alive() is True
    assert ownership.is_busy("l") is True
    release_trajectory.set()
    stop_thread.join(timeout=1.0)

    assert stop_thread.is_alive() is False
    assert stop_results == [0]
    coordinator.clear_lockout_after_disconnect()
    assert ownership.is_busy("l") is False


def test_reserved_fast_stop_requires_inactive_trajectory_before_releasing_arm():
    adapter = FakeAdapter()
    adapter.fast_stop_completes_trajectory = False
    coordinator, adapter, _, ownership = make_coordinator(
        adapter=adapter, stop_timeout_sec=0.02
    )
    reserved = FakeGoalHandle(movej_goal())

    assert coordinator.goal_callback(reserved.request) == FakeGoalResponse.ACCEPT
    assert coordinator.fast_stop() != 0

    result = coordinator.execute(reserved)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status != 0
    assert ownership.is_busy("l") is True
    assert (
        coordinator.goal_callback(movej_goal(joint_degrees=(2.0,) * 6))
        == FakeGoalResponse.REJECT
    )


def test_timeout_without_a_consumed_event_quarantines_stale_event_channel():
    coordinator, adapter, clock, ownership = make_coordinator()
    first = FakeGoalHandle(movej_goal(timeout_sec=0.02))

    first_result = coordinator.execute(first)

    assert first_result.terminal_state == FakeResult.TIMEOUT
    assert ownership.is_busy("l") is False

    target = (2.0,) * 6
    stale_event_emitted = False
    original_movej = adapter.movej

    def start_second_motion(*args, **kwargs) -> int:
        status = original_movej(*args, **kwargs)
        adapter.stopped = False
        adapter.joints = target
        return status

    def deliver_first_goal_success_after_second_goal_submits() -> None:
        nonlocal stale_event_emitted
        if stale_event_emitted:
            return
        stale_event_emitted = True
        adapter.stopped = True
        coordinator.handle_event(
            SimpleNamespace(event_type=1, trajectory_state=True, device=0)
        )

    adapter.movej = start_second_motion
    clock.on_sleep = deliver_first_goal_success_after_second_goal_submits
    second = FakeGoalHandle(movej_goal(joint_degrees=target, timeout_sec=10.0))

    second_response = coordinator.goal_callback(second.request)
    result = coordinator.execute(second)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.success is False
    assert second_response == FakeGoalResponse.REJECT
    assert stale_event_emitted is False
    assert [call for call in adapter.calls if call[0] == "movej"] == [
        ("movej", [1.0, 2.0, 3.0, 4.0, 5.0, 6.0], 20, 0, False)
    ]


def test_frame_mismatch_rejects_before_motion_and_invalid_execute_aborts_without_sdk_calls():
    coordinator, adapter, _, _ = make_coordinator(
        active_reference=lambda _reference_type: "fixture"
    )
    goal = pose_goal(CommandType.MOVEL)

    assert coordinator.goal_callback(goal) == FakeGoalResponse.REJECT
    result = coordinator.execute(FakeGoalHandle(goal))

    assert result.terminal_state == FakeResult.ABORTED
    assert "active frame" in result.message
    assert adapter.calls == []


def test_active_frame_resolver_failure_rejects_before_motion():
    coordinator, adapter, _, _ = make_coordinator(
        active_reference=lambda _reference_type: (_ for _ in ()).throw(
            RuntimeError("frame state unavailable")
        )
    )

    assert coordinator.goal_callback(movej_goal()) == FakeGoalResponse.REJECT
    assert adapter.calls == []


def test_coordinate_mismatch_and_connection_loss_reject_goal():
    disconnected = FakeAdapter()
    disconnected.connected = False
    coordinator, _, _, _ = make_coordinator(adapter=disconnected)
    assert coordinator.goal_callback(movej_goal()) == FakeGoalResponse.REJECT

    coordinator, adapter, _, _ = make_coordinator(
        coordinates=FakeCoordinateManager(allowed=False)
    )
    assert coordinator.goal_callback(movej_goal()) == FakeGoalResponse.REJECT
    assert adapter.calls == []


@pytest.mark.parametrize(
    "event",
    [
        SimpleNamespace(event_type=2, trajectory_state=True, device=0),
        SimpleNamespace(event_type=1, trajectory_state=True, device=1),
        {"event_type": 0, "trajectory_state": True, "device": 0},
    ],
)
def test_wrong_event_type_or_device_is_ignored(event: object):
    coordinator, adapter, clock, _ = make_coordinator()
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))
    clock.on_sleep = lambda: coordinator.handle_event(event)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.TIMEOUT
    assert adapter.calls.count(("slow_stop",)) == 1


def test_event_received_before_submission_cannot_succeed_later_goal():
    coordinator, adapter, _, _ = make_coordinator()
    coordinator.handle_event(
        SimpleNamespace(event_type=1, trajectory_state=True, device=0)
    )

    result = coordinator.execute(FakeGoalHandle(movej_goal(timeout_sec=0.02)))

    assert result.terminal_state == FakeResult.TIMEOUT
    assert adapter.calls.count(("slow_stop",)) == 1


def test_success_event_during_active_trajectory_cannot_complete_later_inactive_poll():
    coordinator, adapter, clock, _ = make_coordinator()
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))
    sleeps = 0

    def emit_success_then_stop() -> None:
        nonlocal sleeps
        sleeps += 1
        if sleeps == 1:
            coordinator.handle_event(
                SimpleNamespace(event_type=1, trajectory_state=True, device=0)
            )
        elif sleeps == 2:
            adapter.stopped = True

    clock.on_sleep = emit_success_then_stop

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.TIMEOUT
    assert result.success is False
    assert adapter.calls.count(("slow_stop",)) == 1


def test_success_event_without_observed_active_trajectory_fails_safe():
    coordinator, adapter, clock, _ = make_coordinator()
    adapter.stopped = True
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))
    emitted = False

    def emit_success() -> None:
        nonlocal emitted
        if emitted:
            return
        emitted = True
        coordinator.handle_event(
            SimpleNamespace(event_type=1, trajectory_state=True, device=0)
        )

    clock.on_sleep = emit_success

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.TIMEOUT
    assert result.success is False
    assert adapter.calls.count(("slow_stop",)) == 1


def test_movej_completion_requires_final_joints_to_converge_on_target():
    coordinator, adapter, clock, _ = make_coordinator()
    handle = FakeGoalHandle(movej_goal(timeout_sec=0.02))
    emitted = False

    def stop_short_of_target() -> None:
        nonlocal emitted
        if emitted:
            return
        emitted = True
        adapter.stopped = True
        coordinator.handle_event(
            SimpleNamespace(event_type=1, trajectory_state=True, device=0)
        )

    clock.on_sleep = stop_short_of_target

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.TIMEOUT
    assert result.success is False
    assert adapter.calls.count(("slow_stop",)) == 1


def test_connection_loss_aborts_and_releases_ownership():
    coordinator, adapter, clock, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    clock.on_sleep = lambda: setattr(adapter, "connected", False)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert "connection" in result.message
    assert handle.transitions == ["aborted"]
    assert ownership.is_busy("l") is False


def test_invalid_current_joint_state_does_not_create_estimated_progress():
    adapter = FakeAdapter()
    adapter.joints = (float("nan"),) * 6
    coordinator, adapter, clock, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())
    complete_after_first_poll(coordinator, adapter, clock)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.SUCCEEDED
    assert all(feedback.progress == 0.0 for feedback in handle.feedback)


def test_arm_ownership_is_atomic_and_release_is_idempotent():
    ownership = ArmOwnership()

    assert ownership.acquire("l") is True
    assert ownership.acquire("l") is False
    assert ownership.is_busy("l") is True
    ownership.release("l")
    ownership.release("l")
    assert ownership.is_busy("l") is False
