import gc
import math
import threading
from types import SimpleNamespace
import weakref

import pytest

from realman_robot_driver.cartesian_velocity_session import (
    CartesianVelocitySession,
    VelocityTerminalState,
)
from realman_robot_driver.motion_coordinator import ArmOwnership
from realman_robot_driver.motion_types import MotionSettings, ReferenceType


class Clock:
    def __init__(self) -> None:
        self.value = 0.0

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


class FakeAdapter:
    def __init__(
        self,
        init_status: int = 0,
        move_status: int = 0,
        stop_status: int = 0,
        fast_stop_status: int = 0,
    ) -> None:
        self.init_status = init_status
        self.move_status = move_status
        self.stop_status = stop_status
        self.fast_stop_status = fast_stop_status
        self.init_calls = []
        self.velocity_calls = []
        self.slow_stop_calls = 0
        self.fast_stop_calls = 0

    def set_movev_init(self, avoid_singularity_flag, frame_type, period_ms):
        self.init_calls.append((avoid_singularity_flag, frame_type, period_ms))
        return self.init_status

    def movev(self, vector, follow, trajectory_mode, radio):
        self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
        return self.move_status

    def slow_stop(self):
        self.slow_stop_calls += 1
        return self.stop_status

    def stop(self):
        self.fast_stop_calls += 1
        return self.fast_stop_status


class FakeGoalHandle:
    def __init__(self, request, *, cancel_requested=False):
        self.request = request
        self.is_cancel_requested = cancel_requested
        self.terminal = None

    def canceled(self):
        self.terminal = "canceled"

    def abort(self):
        self.terminal = "aborted"

    def succeed(self):
        self.terminal = "succeeded"

    def publish_feedback(self, _feedback):
        pass


def settings(
    *,
    max_linear_speed_mps=1.0,
    max_angular_speed_radps=2.0,
    velocity_watchdog_ms=100,
) -> MotionSettings:
    return MotionSettings(
        default_timeout_sec=10.0,
        max_linear_speed_mps=max_linear_speed_mps,
        max_angular_speed_radps=max_angular_speed_radps,
        velocity_control_period_ms=20,
        velocity_watchdog_ms=velocity_watchdog_ms,
        max_linear_accel_mps2=1.0,
        max_angular_accel_radps2=2.0,
        joint_goal_tolerance_deg=0.25,
        stop_timeout_sec=1.0,
    )


def twist(frame: str, linear=(0.0, 0.0, 0.0), angular=(0.0, 0.0, 0.0)):
    return SimpleNamespace(
        header=SimpleNamespace(frame_id=frame),
        twist=SimpleNamespace(
            linear=SimpleNamespace(x=linear[0], y=linear[1], z=linear[2]),
            angular=SimpleNamespace(x=angular[0], y=angular[1], z=angular[2]),
        ),
    )


def valid_goal(**changes):
    values = dict(
        reference_type=int(ReferenceType.TOOL),
        reference_name="tcpgrip",
        control_period_ms=20,
        watchdog_ms=100,
        max_linear_accel_mps2=1.0,
        max_angular_accel_radps2=2.0,
        follow=True,
        trajectory_mode=0,
        radio=0,
    )
    values.update(changes)
    return SimpleNamespace(**values)


def make_session(adapter=None, clock=None, ownership=None, session_settings=None):
    return CartesianVelocitySession(
        arm_id="l",
        adapter=adapter or FakeAdapter(),
        ownership=ownership or ArmOwnership(),
        settings=session_settings or settings(),
        active_frame=lambda reference_type: ("tcpgrip", "l/tool/tcpgrip"),
        motion_allowed=lambda arm: True,
        monotonic=clock or Clock(),
    )


def test_start_initializes_zero_command_and_claims_arm():
    adapter = FakeAdapter()
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)

    assert session.start(valid_goal()) is True
    assert adapter.init_calls == [(1, int(ReferenceType.TOOL), 20)]
    assert adapter.velocity_calls[0][0] == [0.0] * 6
    assert ownership.is_busy("l") is True
    session.shutdown()


def test_tick_limits_linear_and_angular_delta_norms_independently():
    clock = Clock()
    adapter = FakeAdapter()
    session = make_session(
        adapter=adapter,
        clock=clock,
        session_settings=settings(
            max_linear_speed_mps=10.0,
            max_angular_speed_radps=10.0,
            velocity_watchdog_ms=2000,
        ),
    )
    session.start(valid_goal(watchdog_ms=2000))
    session.accept_command(twist("l/tool/tcpgrip", linear=(3.0, 4.0, 0.0), angular=(0.0, 3.0, 4.0)))

    clock.advance(1.0)
    session.tick()
    vector = adapter.velocity_calls[-1][0]
    assert math.hypot(*vector[:3]) == pytest.approx(1.0)
    assert math.hypot(*vector[3:]) == pytest.approx(2.0)
    session.shutdown()


def test_rejects_frame_mismatch_and_non_finite_command():
    session = make_session()
    session.start(valid_goal())
    with pytest.raises(ValueError, match="frame_id"):
        session.accept_command(twist("wrong", linear=(0.1, 0.0, 0.0)))
    with pytest.raises(ValueError, match="finite"):
        session.accept_command(twist("l/tool/tcpgrip", linear=(math.nan, 0.0, 0.0)))
    session.shutdown()


def test_watchdog_sends_zero_then_stops_once_and_rejects_commands():
    clock = Clock()
    adapter = FakeAdapter()
    session = make_session(adapter=adapter, clock=clock)
    session.start(valid_goal())
    clock.advance(0.101)
    session.tick()

    assert adapter.velocity_calls[-1][0] == [0.0] * 6
    assert adapter.slow_stop_calls == 1
    assert session.result.terminal_state == VelocityTerminalState.WATCHDOG_STOP
    assert session.result.success is False
    with pytest.raises(RuntimeError, match="terminated"):
        session.accept_command(twist("l/tool/tcpgrip"))


def test_cancel_sends_zero_and_slow_stop():
    adapter = FakeAdapter()
    session = make_session(adapter=adapter)
    session.start(valid_goal())

    result = session.cancel()

    assert adapter.velocity_calls[-1][0] == [0.0] * 6
    assert adapter.slow_stop_calls == 1
    assert result.terminal_state == VelocityTerminalState.CANCELED
    assert session.result.success is False


def test_cancel_reports_aborted_when_slow_stop_fails():
    adapter = FakeAdapter(stop_status=17)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())

    result = session.cancel()

    assert result.terminal_state == VelocityTerminalState.ABORTED
    assert result.success is False
    assert result.api2_status == 17
    assert ownership.is_busy("l") is True


def test_command_and_stop_failures_report_every_status_and_retain_ownership():
    adapter = FakeAdapter()
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())
    adapter.move_status = 11
    adapter.stop_status = 17

    result = session.tick()

    assert result.terminal_state == VelocityTerminalState.ABORTED
    assert result.api2_status == 17
    assert "command status 11" in result.message
    assert "zero status 11" in result.message
    assert "slow_stop status 17" in result.message
    assert ownership.is_busy("l") is True


def test_sdk_initialization_failure_aborts_without_ownership_leak():
    adapter = FakeAdapter(init_status=23)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)

    assert session.start(valid_goal()) is False
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 23
    assert ownership.is_busy("l") is False


def test_initial_zero_failure_attempts_slow_stop_before_releasing_ownership():
    adapter = FakeAdapter(move_status=19)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)

    assert session.start(valid_goal()) is False

    assert adapter.slow_stop_calls == 1
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 19
    assert "initial_zero status 19" in session.result.message
    assert ownership.is_busy("l") is False


def test_initial_zero_and_recovery_stop_failure_retain_safety_lockout():
    adapter = FakeAdapter(move_status=19, stop_status=23)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)

    assert session.start(valid_goal()) is False

    assert adapter.slow_stop_calls == 1
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 23
    assert "initial_zero status 19" in session.result.message
    assert "slow_stop status 23" in session.result.message
    assert ownership.is_busy("l") is True


def test_rejects_goal_while_arm_is_owned_by_ordinary_motion():
    ownership = ArmOwnership()
    assert ownership.acquire("l") is True
    session = make_session(ownership=ownership)

    assert session.start(valid_goal()) is False
    assert session.result.terminal_state == VelocityTerminalState.ABORTED


def test_rejects_goal_settings_that_are_not_positive():
    session = make_session()
    with pytest.raises(ValueError, match="control_period_ms"):
        session.start(valid_goal(control_period_ms=0))


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("control_period_ms", 10, "configured control period"),
        ("watchdog_ms", 101, "configured watchdog"),
        ("max_linear_accel_mps2", 1.01, "configured linear acceleration"),
        ("max_angular_accel_radps2", 2.01, "configured angular acceleration"),
    ],
)
def test_goal_safety_settings_cannot_exceed_configuration(field, value, message):
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)

    with pytest.raises(ValueError, match=message):
        session.start(valid_goal(**{field: value}))

    assert ownership.is_busy("l") is False


@pytest.mark.parametrize(
    ("trajectory_mode", "radio"),
    [(-1, 0), (3, 0), (0, 1), (1, -1), (1, 101), (2, -1), (2, 1001)],
)
def test_goal_rejects_invalid_trajectory_mode_and_radio(trajectory_mode, radio):
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)

    with pytest.raises(ValueError, match="trajectory_mode|radio"):
        session.start(valid_goal(trajectory_mode=trajectory_mode, radio=radio))

    assert ownership.is_busy("l") is False


def test_commands_are_rejected_above_configured_speed_limits():
    session = make_session()
    session.start(valid_goal())
    with pytest.raises(ValueError, match="linear speed"):
        session.accept_command(twist("l/tool/tcpgrip", linear=(1.1, 0.0, 0.0)))
    with pytest.raises(ValueError, match="angular speed"):
        session.accept_command(twist("l/tool/tcpgrip", angular=(0.0, 0.0, 2.1)))
    session.shutdown()


def test_direct_start_validates_frame_only_after_claiming_ownership_and_releases_on_error():
    ownership = ArmOwnership()
    observed_busy = []

    def active_frame(_reference_type):
        observed_busy.append(ownership.is_busy("l"))
        return "other", "l/tool/other"

    session = CartesianVelocitySession(
        arm_id="l",
        adapter=FakeAdapter(),
        ownership=ownership,
        settings=settings(),
        active_frame=active_frame,
        motion_allowed=lambda _arm: True,
        monotonic=Clock(),
    )

    with pytest.raises(ValueError, match="active verified frame"):
        session.start(valid_goal())

    assert observed_busy == [True]
    assert ownership.is_busy("l") is False


def test_concurrent_goal_callbacks_reserve_exactly_one_request():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    barrier = threading.Barrier(3)
    results = []

    def submit(goal):
        barrier.wait()
        results.append(session.goal_callback(goal))

    threads = [threading.Thread(target=submit, args=(valid_goal(),)) for _ in range(2)]
    for thread in threads:
        thread.start()
    barrier.wait()
    for thread in threads:
        thread.join(timeout=1.0)

    assert sorted(bool(result) for result in results) == [False, True]
    assert ownership.is_busy("l") is True
    session.shutdown()
    assert ownership.is_busy("l") is False


def test_goal_reservation_holds_ownership_during_definitive_frame_validation():
    ownership = ArmOwnership()
    mutation_attempts = []

    def active_frame(_reference_type):
        mutation_attempts.append(ownership.acquire("l"))
        return "tcpgrip", "l/tool/tcpgrip"

    session = CartesianVelocitySession(
        arm_id="l",
        adapter=FakeAdapter(),
        ownership=ownership,
        settings=settings(),
        active_frame=active_frame,
        motion_allowed=lambda _arm: True,
        monotonic=Clock(),
    )

    assert bool(session.goal_callback(valid_goal())) is True
    assert mutation_attempts == [False]
    session.shutdown()


def test_direct_start_never_consumes_an_action_reservation():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    reserved = valid_goal()
    impostor = valid_goal()

    assert bool(session.goal_callback(reserved)) is True
    assert session.start(impostor) is False
    assert ownership.is_busy("l") is True
    assert session.start(reserved) is False

    handle = FakeGoalHandle(reserved, cancel_requested=True)
    result = session.execute(handle)

    assert handle.terminal == "canceled"
    assert result.terminal_state == VelocityTerminalState.CANCELED
    assert ownership.is_busy("l") is False


def test_canceling_reserved_goal_releases_ownership_without_sdk_stop():
    ownership = ArmOwnership()
    adapter = FakeAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    goal = valid_goal()
    handle = SimpleNamespace(request=goal)

    assert bool(session.goal_callback(goal)) is True
    assert bool(session.cancel_callback(handle)) is True
    assert ownership.is_busy("l") is False
    assert adapter.slow_stop_calls == 0
    action_handle = FakeGoalHandle(goal)
    result = session.execute(action_handle)
    assert action_handle.terminal == "canceled"
    assert result.terminal_state == VelocityTerminalState.CANCELED


def test_cancel_reserved_cleanup_allows_new_goal_and_rejects_late_old_execute():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert bool(session.cancel_callback(SimpleNamespace(request=old_goal))) is True

    assert bool(session.goal_callback(new_goal)) is True
    old_handle = FakeGoalHandle(old_goal)
    old_result = session.execute(old_handle)
    assert old_handle.terminal == "canceled"
    assert old_result.terminal_state == VelocityTerminalState.CANCELED
    new_handle = FakeGoalHandle(new_goal, cancel_requested=True)
    session.execute(new_handle)
    assert new_handle.terminal == "canceled"


def test_shutdown_reserved_cleanup_allows_a_new_goal():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert session.shutdown() == 0

    assert bool(session.goal_callback(new_goal)) is True
    old_handle = FakeGoalHandle(old_goal)
    assert session.execute(old_handle).terminal_state == VelocityTerminalState.CANCELED
    assert old_handle.terminal == "canceled"
    new_handle = FakeGoalHandle(new_goal, cancel_requested=True)
    session.execute(new_handle)
    assert new_handle.terminal == "canceled"


def test_fast_stop_reserved_cleanup_allows_a_new_goal():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert session.fast_stop_if_owned() == 0

    assert bool(session.goal_callback(new_goal)) is True
    old_handle = FakeGoalHandle(old_goal)
    assert session.execute(old_handle).terminal_state == VelocityTerminalState.ABORTED
    assert old_handle.terminal == "aborted"
    new_handle = FakeGoalHandle(new_goal, cancel_requested=True)
    session.execute(new_handle)
    assert new_handle.terminal == "canceled"


def test_fast_stop_active_session_sends_zero_then_calls_adapter_stop_once():
    ownership = ArmOwnership()
    adapter = FakeAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())

    status = session.fast_stop_if_owned()

    assert status == 0
    assert adapter.velocity_calls[-1][0] == [0.0] * 6
    assert adapter.fast_stop_calls == 1
    assert adapter.slow_stop_calls == 0
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership.is_busy("l") is False


def test_fast_stop_reserved_failure_retains_ownership_lockout():
    ownership = ArmOwnership()
    adapter = FakeAdapter(fast_stop_status=29)
    session = make_session(adapter=adapter, ownership=ownership)
    goal = valid_goal()
    assert bool(session.goal_callback(goal)) is True

    status = session.fast_stop_if_owned()

    assert status == 29
    assert adapter.velocity_calls == []
    assert adapter.fast_stop_calls == 1
    assert ownership.is_busy("l") is True
    assert session.start(goal) is False
    assert session.result.api2_status == 29


def test_fast_stop_timeout_preserves_stop_failure_status():
    move_entered = threading.Event()
    allow_move = threading.Event()

    class BlockingMoveAdapter(FakeAdapter):
        def __init__(self):
            super().__init__(fast_stop_status=31)
            self.block_movev = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_movev:
                move_entered.set()
                assert allow_move.wait(timeout=1.0)
            return self.move_status

    ownership = ArmOwnership()
    adapter = BlockingMoveAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session._thread_join_timeout_sec = 0.02
    session.start(valid_goal())
    adapter.block_movev = True
    tick_thread = threading.Thread(target=session.tick)
    tick_thread.start()
    assert move_entered.wait(timeout=1.0)

    status = session.fast_stop_if_owned()
    allow_move.set()
    tick_thread.join(timeout=1.0)

    assert status == 31
    assert session.result.api2_status == 31
    assert "fast_stop status 31" in session.result.message
    assert "timeout" in session.result.message
    assert ownership.is_busy("l") is True


def test_fast_stop_returns_none_when_velocity_does_not_own_arm():
    adapter = FakeAdapter()
    session = make_session(adapter=adapter)

    assert session.fast_stop_if_owned() is None
    assert adapter.fast_stop_calls == 0


def test_shutdown_releases_reserved_goal_without_calling_sdk_stop():
    ownership = ArmOwnership()
    adapter = FakeAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    assert bool(session.goal_callback(valid_goal())) is True

    assert session.shutdown() == 0

    assert ownership.is_busy("l") is False
    assert adapter.velocity_calls == []
    assert adapter.slow_stop_calls == 0
    assert adapter.fast_stop_calls == 0


def test_shutdown_waits_for_claimed_fast_stop_before_releasing_ownership():
    ownership = ArmOwnership()
    stop_entered = threading.Event()
    allow_stop = threading.Event()

    class BlockingStopAdapter(FakeAdapter):
        def stop(self):
            self.fast_stop_calls += 1
            stop_entered.set()
            assert allow_stop.wait(timeout=1.0)
            return self.fast_stop_status

    adapter = BlockingStopAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())
    fast_thread = threading.Thread(target=session.fast_stop_if_owned)
    fast_thread.start()
    assert stop_entered.wait(timeout=1.0)

    shutdown_done = threading.Event()
    shutdown_thread = threading.Thread(
        target=lambda: (session.shutdown(), shutdown_done.set())
    )
    shutdown_thread.start()

    assert shutdown_done.wait(timeout=0.02) is False
    assert ownership.is_busy("l") is True
    allow_stop.set()
    fast_thread.join(timeout=1.0)
    shutdown_thread.join(timeout=1.0)
    assert shutdown_done.is_set()
    assert ownership.is_busy("l") is False
    assert adapter.fast_stop_calls == 1


def test_reserved_start_waits_for_claimed_fast_stop_result():
    stop_entered = threading.Event()
    allow_stop = threading.Event()

    class BlockingStopAdapter(FakeAdapter):
        def stop(self):
            self.fast_stop_calls += 1
            stop_entered.set()
            assert allow_stop.wait(timeout=1.0)
            return 31

    adapter = BlockingStopAdapter()
    session = make_session(adapter=adapter)
    goal = valid_goal()
    assert bool(session.goal_callback(goal)) is True
    fast_thread = threading.Thread(target=session.fast_stop_if_owned)
    fast_thread.start()
    assert stop_entered.wait(timeout=1.0)

    execute_result = []
    handle = FakeGoalHandle(goal)
    start_thread = threading.Thread(
        target=lambda: execute_result.append(session.execute(handle))
    )
    start_thread.start()

    start_thread.join(timeout=0.02)
    assert start_thread.is_alive()
    allow_stop.set()
    fast_thread.join(timeout=1.0)
    start_thread.join(timeout=1.0)
    assert execute_result[0].terminal_state == VelocityTerminalState.ABORTED
    assert handle.terminal == "aborted"
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 31


def test_canceled_request_cannot_resurrect_after_more_than_32_completions():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert bool(session.cancel_callback(SimpleNamespace(request=old_goal))) is True

    for _ in range(40):
        goal = valid_goal()
        assert bool(session.goal_callback(goal)) is True
        assert bool(session.cancel_callback(SimpleNamespace(request=goal))) is True

    handle = FakeGoalHandle(old_goal)
    assert session.execute(handle).terminal_state == VelocityTerminalState.CANCELED
    assert handle.terminal == "canceled"
    assert ownership.is_busy("l") is False


def test_completed_action_does_not_retain_request_object():
    class Goal:
        pass

    goal = Goal()
    for name, value in vars(valid_goal()).items():
        setattr(goal, name, value)
    request_ref = weakref.ref(goal)
    session = make_session()
    assert bool(session.goal_callback(goal)) is True
    assert bool(session.cancel_callback(SimpleNamespace(request=goal))) is True

    del goal
    gc.collect()

    assert request_ref() is None


def test_delayed_action_completion_is_consumed_once_without_touching_new_reservation():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert bool(session.cancel_callback(SimpleNamespace(request=old_goal))) is True
    assert bool(session.goal_callback(new_goal)) is True

    first_handle = FakeGoalHandle(old_goal)
    first_result = session.execute(first_handle)
    second_handle = FakeGoalHandle(old_goal)
    second_result = session.execute(second_handle)

    assert first_handle.terminal == "canceled"
    assert first_result.terminal_state == VelocityTerminalState.CANCELED
    assert second_handle.terminal == "aborted"
    assert second_result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership.is_busy("l") is True
    new_handle = FakeGoalHandle(new_goal, cancel_requested=True)
    session.execute(new_handle)
    assert new_handle.terminal == "canceled"


def test_fast_stop_invalidates_start_while_velocity_init_is_blocked():
    init_entered = threading.Event()
    allow_init = threading.Event()
    stop_called = threading.Event()

    class BlockingInitAdapter(FakeAdapter):
        def set_movev_init(self, avoid_singularity_flag, frame_type, period_ms):
            self.init_calls.append((avoid_singularity_flag, frame_type, period_ms))
            init_entered.set()
            assert allow_init.wait(timeout=1.0)
            return self.init_status

        def stop(self):
            self.fast_stop_calls += 1
            stop_called.set()
            return self.fast_stop_status

    ownership = ArmOwnership()
    adapter = BlockingInitAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    start_results = []
    start_thread = threading.Thread(
        target=lambda: start_results.append(session.start(valid_goal()))
    )
    start_thread.start()
    assert init_entered.wait(timeout=1.0)

    stop_results = []
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(session.fast_stop_if_owned())
    )
    stop_thread.start()
    issued_while_blocked = stop_called.wait(timeout=0.05)
    allow_init.set()
    start_thread.join(timeout=1.0)
    stop_thread.join(timeout=1.0)

    assert issued_while_blocked is True
    assert start_results == [False]
    assert stop_results == [0]
    assert adapter.velocity_calls == []
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership.is_busy("l") is False


def test_shutdown_timeout_invalidates_blocked_start_and_retains_ownership():
    init_entered = threading.Event()
    allow_init = threading.Event()

    class BlockingInitAdapter(FakeAdapter):
        def set_movev_init(self, avoid_singularity_flag, frame_type, period_ms):
            self.init_calls.append((avoid_singularity_flag, frame_type, period_ms))
            init_entered.set()
            assert allow_init.wait(timeout=1.0)
            return self.init_status

    ownership = ArmOwnership()
    session = make_session(adapter=BlockingInitAdapter(), ownership=ownership)
    session._thread_join_timeout_sec = 0.02
    start_results = []
    start_thread = threading.Thread(
        target=lambda: start_results.append(session.start(valid_goal()))
    )
    start_thread.start()
    assert init_entered.wait(timeout=1.0)

    statuses = []
    shutdown_thread = threading.Thread(target=lambda: statuses.append(session.shutdown()))
    shutdown_thread.start()
    shutdown_thread.join(timeout=0.1)
    returned_before_init = not shutdown_thread.is_alive()
    ownership_retained = ownership.is_busy("l")
    allow_init.set()
    start_thread.join(timeout=1.0)
    shutdown_thread.join(timeout=1.0)

    assert returned_before_init is True
    assert statuses == [-1]
    assert start_results == [False]
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership_retained is True
    assert ownership.is_busy("l") is True
    ownership.release("l")


def test_cancel_callback_during_init_invalidates_start_and_defers_release():
    init_entered = threading.Event()
    allow_init = threading.Event()

    class BlockingInitAdapter(FakeAdapter):
        def set_movev_init(self, avoid_singularity_flag, frame_type, period_ms):
            self.init_calls.append((avoid_singularity_flag, frame_type, period_ms))
            init_entered.set()
            assert allow_init.wait(timeout=1.0)
            return self.init_status

    ownership = ArmOwnership()
    session = make_session(adapter=BlockingInitAdapter(), ownership=ownership)
    goal = valid_goal()
    assert bool(session.goal_callback(goal)) is True
    start_results = []
    start_thread = threading.Thread(
        target=lambda: start_results.append(
            session._start(goal, require_reservation=True)
        )
    )
    start_thread.start()
    assert init_entered.wait(timeout=1.0)

    cancel_accepted = session.cancel_callback(SimpleNamespace(request=goal))
    ownership_retained = ownership.is_busy("l")
    allow_init.set()
    start_thread.join(timeout=1.0)

    assert bool(cancel_accepted) is True
    assert ownership_retained is True
    assert start_results == [False]
    assert session.thread is None
    assert session.result.terminal_state == VelocityTerminalState.CANCELED
    with pytest.raises(RuntimeError, match="terminated"):
        session.accept_command(twist("l/tool/tcpgrip"))
    assert ownership.is_busy("l") is False


def test_cancel_callback_during_initial_zero_invalidates_start_and_defers_release():
    zero_entered = threading.Event()
    allow_zero = threading.Event()

    class BlockingInitialZeroAdapter(FakeAdapter):
        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if len(self.velocity_calls) == 1:
                zero_entered.set()
                assert allow_zero.wait(timeout=1.0)
            return self.move_status

    ownership = ArmOwnership()
    adapter = BlockingInitialZeroAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    goal = valid_goal()
    assert bool(session.goal_callback(goal)) is True
    start_results = []
    start_thread = threading.Thread(
        target=lambda: start_results.append(
            session._start(goal, require_reservation=True)
        )
    )
    start_thread.start()
    assert zero_entered.wait(timeout=1.0)

    cancel_accepted = session.cancel_callback(SimpleNamespace(request=goal))
    ownership_retained = ownership.is_busy("l")
    allow_zero.set()
    start_thread.join(timeout=1.0)

    assert bool(cancel_accepted) is True
    assert ownership_retained is True
    assert start_results == [False]
    assert session.thread is None
    assert session.result.terminal_state == VelocityTerminalState.CANCELED
    assert adapter.slow_stop_calls == 1
    with pytest.raises(RuntimeError, match="terminated"):
        session.accept_command(twist("l/tool/tcpgrip"))
    assert ownership.is_busy("l") is False


def test_overlapping_ticks_do_not_duplicate_velocity_sdk_calls():
    move_entered = threading.Event()
    allow_move = threading.Event()

    class BlockingMoveAdapter(FakeAdapter):
        def __init__(self):
            super().__init__()
            self.block_movev = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_movev:
                move_entered.set()
                assert allow_move.wait(timeout=1.0)
            return self.move_status

    adapter = BlockingMoveAdapter()
    session = make_session(adapter=adapter)
    session.start(valid_goal())
    session._stop_event.set()
    session.thread.join(timeout=1.0)
    adapter.block_movev = True

    first_tick = threading.Thread(target=session.tick)
    first_tick.start()
    assert move_entered.wait(timeout=1.0)
    calls_during_first_tick = len(adapter.velocity_calls)

    second_tick = threading.Thread(target=session.tick)
    second_tick.start()
    second_tick.join(timeout=0.05)
    second_tick_returned = not second_tick.is_alive()
    calls_before_unblock = len(adapter.velocity_calls)
    allow_move.set()
    first_tick.join(timeout=1.0)
    second_tick.join(timeout=1.0)
    session.cancel()

    assert second_tick_returned is True
    assert calls_before_unblock == calls_during_first_tick


def test_fast_stop_is_issued_while_control_movev_is_blocked():
    move_entered = threading.Event()
    allow_move = threading.Event()
    stop_called = threading.Event()

    class BlockingMoveAdapter(FakeAdapter):
        def __init__(self):
            super().__init__()
            self.block_movev = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_movev:
                move_entered.set()
                assert allow_move.wait(timeout=1.0)
            return self.move_status

        def stop(self):
            self.fast_stop_calls += 1
            stop_called.set()
            return self.fast_stop_status

    adapter = BlockingMoveAdapter()
    session = make_session(adapter=adapter)
    session.start(valid_goal(watchdog_ms=100))
    adapter.block_movev = True
    tick_thread = threading.Thread(target=session.tick)
    tick_thread.start()
    assert move_entered.wait(timeout=1.0)

    stop_thread = threading.Thread(target=session.fast_stop_if_owned)
    stop_thread.start()
    issued_while_blocked = stop_called.wait(timeout=0.05)
    allow_move.set()
    tick_thread.join(timeout=1.0)
    stop_thread.join(timeout=1.0)

    assert issued_while_blocked is True
    assert adapter.fast_stop_calls == 1


def test_fast_stop_preempts_blocked_controlled_stop_zero():
    zero_entered = threading.Event()
    allow_zero = threading.Event()
    stop_called = threading.Event()

    class BlockingZeroAdapter(FakeAdapter):
        def __init__(self):
            super().__init__()
            self.block_zero = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_zero and list(vector) == [0.0] * 6:
                zero_entered.set()
                assert allow_zero.wait(timeout=1.0)
            return self.move_status

        def stop(self):
            self.fast_stop_calls += 1
            stop_called.set()
            return self.fast_stop_status

    ownership = ArmOwnership()
    adapter = BlockingZeroAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())
    adapter.block_zero = True

    cancel_results = []
    cancel_thread = threading.Thread(target=lambda: cancel_results.append(session.cancel()))
    cancel_thread.start()
    assert zero_entered.wait(timeout=1.0)

    stop_results = []
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(session.fast_stop_if_owned())
    )
    stop_thread.start()
    issued_while_zero_blocked = stop_called.wait(timeout=0.05)
    allow_zero.set()
    cancel_thread.join(timeout=1.0)
    stop_thread.join(timeout=1.0)

    assert issued_while_zero_blocked is True
    assert adapter.fast_stop_calls == 1
    assert adapter.slow_stop_calls == 0
    assert stop_results == [0]
    assert cancel_results == [session.result]
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership.is_busy("l") is False


def test_fast_stop_preempts_blocked_slow_stop_without_terminal_overwrite():
    slow_stop_entered = threading.Event()
    allow_slow_stop = threading.Event()
    stop_called = threading.Event()

    class BlockingSlowStopAdapter(FakeAdapter):
        def slow_stop(self):
            self.slow_stop_calls += 1
            slow_stop_entered.set()
            assert allow_slow_stop.wait(timeout=1.0)
            return self.stop_status

        def stop(self):
            self.fast_stop_calls += 1
            stop_called.set()
            return self.fast_stop_status

    ownership = ArmOwnership()
    adapter = BlockingSlowStopAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session.start(valid_goal())

    cancel_results = []
    cancel_thread = threading.Thread(target=lambda: cancel_results.append(session.cancel()))
    cancel_thread.start()
    assert slow_stop_entered.wait(timeout=1.0)

    stop_results = []
    stop_thread = threading.Thread(
        target=lambda: stop_results.append(session.fast_stop_if_owned())
    )
    stop_thread.start()
    issued_while_slow_stop_blocked = stop_called.wait(timeout=0.05)
    allow_slow_stop.set()
    cancel_thread.join(timeout=1.0)
    stop_thread.join(timeout=1.0)

    assert issued_while_slow_stop_blocked is True
    assert adapter.fast_stop_calls == 1
    assert adapter.slow_stop_calls == 1
    assert stop_results == [0]
    assert cancel_results == [session.result]
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership.is_busy("l") is False


def test_shutdown_timeout_retains_ownership_while_control_thread_is_alive():
    move_entered = threading.Event()
    allow_move = threading.Event()

    class BlockingMoveAdapter(FakeAdapter):
        def __init__(self):
            super().__init__()
            self.block_movev = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_movev:
                move_entered.set()
                assert allow_move.wait(timeout=1.0)
            return self.move_status

    ownership = ArmOwnership()
    adapter = BlockingMoveAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session._thread_join_timeout_sec = 0.02
    session.start(valid_goal())
    adapter.block_movev = True
    assert move_entered.wait(timeout=1.0)

    statuses = []
    shutdown_thread = threading.Thread(target=lambda: statuses.append(session.shutdown()))
    shutdown_thread.start()
    shutdown_thread.join(timeout=0.1)
    returned_before_move = not shutdown_thread.is_alive()
    ownership_retained = ownership.is_busy("l")
    allow_move.set()
    shutdown_thread.join(timeout=1.0)

    assert returned_before_move is True
    assert statuses == [-1]
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert ownership_retained is True
    assert ownership.is_busy("l") is True
    ownership.release("l")


def test_shutdown_timeout_preserves_slow_stop_failure_status():
    move_entered = threading.Event()
    allow_move = threading.Event()

    class BlockingMoveAdapter(FakeAdapter):
        def __init__(self):
            super().__init__(stop_status=23)
            self.block_movev = False

        def movev(self, vector, follow, trajectory_mode, radio):
            self.velocity_calls.append((list(vector), follow, trajectory_mode, radio))
            if self.block_movev:
                move_entered.set()
                assert allow_move.wait(timeout=1.0)
            return self.move_status

    ownership = ArmOwnership()
    adapter = BlockingMoveAdapter()
    session = make_session(adapter=adapter, ownership=ownership)
    session._thread_join_timeout_sec = 0.02
    session.start(valid_goal())
    adapter.block_movev = True
    assert move_entered.wait(timeout=1.0)

    status = session.shutdown()
    allow_move.set()

    assert status == 23
    assert session.result.api2_status == 23
    assert "slow_stop status 23" in session.result.message
    assert "timeout" in session.result.message
    assert ownership.is_busy("l") is True


def test_confirmed_disconnect_clears_velocity_lockout_and_releases_ownership():
    adapter = FakeAdapter(stop_status=23)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)
    assert session.start(valid_goal()) is True
    assert session.shutdown() == 23
    assert ownership.is_busy("l") is True

    cleared = session.clear_lockout_after_disconnect()

    assert cleared is True
    assert ownership.is_busy("l") is False
    assert session.fast_stop_if_owned() is None
    assert session.start(valid_goal()) is True
    session.shutdown()


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("_thread", threading.current_thread()),
        ("_starting", True),
        ("_movev_in_progress", True),
        ("_slow_stop_call_in_progress", True),
        ("_slow_stop_in_progress", True),
        ("_fast_stop_in_progress", True),
    ],
)
def test_disconnect_cleanup_rejects_live_velocity_work_and_retains_lockout(
    field, value
):
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    assert ownership.acquire("l") is True
    session._owns_ownership = True
    session._lockout = True
    session._velocity_initialized = True
    setattr(session, field, value)

    cleared = session.clear_lockout_after_disconnect()

    assert cleared is False
    assert session._lockout is True
    assert session._owns_ownership is True
    assert ownership.is_busy("l") is True


def test_base_velocity_uses_namespaced_base_link_frame():
    session = CartesianVelocitySession(
        arm_id="l",
        adapter=FakeAdapter(),
        ownership=ArmOwnership(),
        settings=settings(),
        active_frame={ReferenceType.BASE: ("base", "l/base_link")},
        motion_allowed=lambda _arm: True,
        monotonic=Clock(),
    )
    goal = valid_goal(reference_type=int(ReferenceType.BASE), reference_name="base")

    assert session.start(goal) is True
    assert session.accept_command(twist("l/base_link")) is True
    session.shutdown()
