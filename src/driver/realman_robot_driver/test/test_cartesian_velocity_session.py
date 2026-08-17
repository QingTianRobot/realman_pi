import math
import threading
from types import SimpleNamespace

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


def settings(*, max_linear_speed_mps=1.0, max_angular_speed_radps=2.0) -> MotionSettings:
    return MotionSettings(
        default_timeout_sec=10.0,
        max_linear_speed_mps=max_linear_speed_mps,
        max_angular_speed_radps=max_angular_speed_radps,
        velocity_control_period_ms=20,
        velocity_watchdog_ms=100,
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
        session_settings=settings(max_linear_speed_mps=10.0, max_angular_speed_radps=10.0),
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
    assert session.result.success is True


def test_cancel_reports_aborted_when_slow_stop_fails():
    adapter = FakeAdapter(stop_status=17)
    session = make_session(adapter=adapter)
    session.start(valid_goal())

    result = session.cancel()

    assert result.terminal_state == VelocityTerminalState.ABORTED
    assert result.success is False
    assert result.api2_status == 17


def test_sdk_initialization_failure_aborts_without_ownership_leak():
    adapter = FakeAdapter(init_status=23)
    ownership = ArmOwnership()
    session = make_session(adapter=adapter, ownership=ownership)

    assert session.start(valid_goal()) is False
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 23
    assert ownership.is_busy("l") is False


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


def test_start_consumes_only_the_exact_reserved_request():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    reserved = valid_goal()
    impostor = valid_goal()

    assert bool(session.goal_callback(reserved)) is True
    assert session.start(impostor) is False
    assert ownership.is_busy("l") is True
    assert session.start(reserved) is True
    session.shutdown()


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
    assert session.start(goal) is False
    assert session.result.terminal_state == VelocityTerminalState.CANCELED


def test_cancel_reserved_cleanup_allows_new_goal_and_rejects_late_old_execute():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert bool(session.cancel_callback(SimpleNamespace(request=old_goal))) is True

    assert bool(session.goal_callback(new_goal)) is True
    assert session.start(old_goal) is False
    assert session.start(new_goal) is True
    session.shutdown()


def test_shutdown_reserved_cleanup_allows_a_new_goal():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert session.shutdown() == 0

    assert bool(session.goal_callback(new_goal)) is True
    assert session.start(old_goal) is False
    assert session.start(new_goal) is True
    session.shutdown()


def test_fast_stop_reserved_cleanup_allows_a_new_goal():
    ownership = ArmOwnership()
    session = make_session(ownership=ownership)
    old_goal = valid_goal()
    new_goal = valid_goal()
    assert bool(session.goal_callback(old_goal)) is True
    assert session.fast_stop_if_owned() == 0

    assert bool(session.goal_callback(new_goal)) is True
    assert session.start(old_goal) is False
    assert session.start(new_goal) is True
    session.shutdown()


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


def test_fast_stop_reserved_goal_skips_uninitialized_zero_and_releases():
    ownership = ArmOwnership()
    adapter = FakeAdapter(fast_stop_status=29)
    session = make_session(adapter=adapter, ownership=ownership)
    goal = valid_goal()
    assert bool(session.goal_callback(goal)) is True

    status = session.fast_stop_if_owned()

    assert status == 29
    assert adapter.velocity_calls == []
    assert adapter.fast_stop_calls == 1
    assert ownership.is_busy("l") is False
    assert session.start(goal) is False
    assert session.result.api2_status == 29


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

    start_result = []
    start_thread = threading.Thread(target=lambda: start_result.append(session.start(goal)))
    start_thread.start()

    start_thread.join(timeout=0.02)
    assert start_thread.is_alive()
    allow_stop.set()
    fast_thread.join(timeout=1.0)
    start_thread.join(timeout=1.0)
    assert start_result == [False]
    assert session.result.terminal_state == VelocityTerminalState.ABORTED
    assert session.result.api2_status == 31
