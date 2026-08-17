from __future__ import annotations

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
        self.stopped = False
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
        if self.stop_status == 0:
            self.stopped = True
        return self.stop_status

    def current_trajectory(self):
        self.calls.append(("current_trajectory",))
        return {"trajectory_type": 0 if self.stopped else 1}

    def get_state(self) -> RobotState:
        self.calls.append(("get_state",))
        return RobotState(tuple(self.joints), self.connected, "RM65-B", self.last_error)


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
    adapter.emit_event_on_move = True
    coordinator, adapter, _, _ = make_coordinator(adapter=adapter)
    adapter.event_callback = coordinator.handle_event

    result = coordinator.execute(FakeGoalHandle(movej_goal()))

    assert result.terminal_state == FakeResult.SUCCEEDED
    assert adapter.calls.count(("slow_stop",)) == 0


@pytest.mark.parametrize(
    ("command", "method_name"),
    [(CommandType.MOVEL, "movel"), (CommandType.MOVEJ_P, "movej_p")],
)
def test_pose_commands_forward_normalized_wxyz_pose(command: CommandType, method_name: str):
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
    assert result.terminal_state == FakeResult.SUCCEEDED


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
    coordinator, adapter, _, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    handle.is_cancel_requested = True

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.CANCELED
    assert adapter.calls.count(("slow_stop",)) == 1
    assert FakeFeedback.STOPPING in [feedback.phase for feedback in handle.feedback]
    assert handle.transitions == ["canceled"]
    assert ownership.is_busy("l") is False


def test_cancel_stop_failure_aborts_with_stop_api2_status():
    adapter = FakeAdapter()
    adapter.stop_status = 52
    coordinator, _, _, _ = make_coordinator(adapter=adapter)
    handle = FakeGoalHandle(movej_goal())
    handle.is_cancel_requested = True

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.ABORTED
    assert result.api2_status == 52
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
