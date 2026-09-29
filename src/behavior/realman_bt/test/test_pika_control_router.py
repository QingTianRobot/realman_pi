from pathlib import Path
import math
import sys
import time
from concurrent.futures import Future
from types import SimpleNamespace

import pytest


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "src/behavior/realman_bt/scripts/pika_control_router.py"
sys.path.insert(0, str(ROUTER.parent))


def test_pika_router_only_constructs_left_and_right_streams():
    source = ROUTER.read_text(encoding="utf-8")

    assert 'for arm in ("l", "r")' in source
    assert '"/pika/{arm}/cartesian_pose"' in source
    assert '"/pika/{arm}/cartesian_velocity"' in source
    assert '"/m/cartesian_pose/command"' not in source
    assert '"/m/cartesian_velocity/command"' not in source


def test_pika_router_requires_active_behavior_tree_mode_before_forwarding():
    source = ROUTER.read_text(encoding="utf-8")

    assert 'if self.mode != "pikaposition" and self.mode != "pikamixed":' in source
    assert 'if self.mode != "pikavelocity" and self.mode != "pikamixed":' in source
    assert 'InputModeState.ACTIVE' in source
    assert 'self._cancel(state)' in source
    assert 'self.dry_run' in source


def test_pika_router_uses_both_continuous_driver_actions():
    source = ROUTER.read_text(encoding="utf-8")

    assert "ActionClient(self, CartesianPose" in source
    assert "ActionClient(self, CartesianVelocity" in source
    assert "cartesian_pose/command" in source
    assert "cartesian_velocity/command" in source
    assert 'self.mode != expected_mode' in source


def test_pika_velocity_uses_configured_work_and_per_session_speed_limits():
    source = ROUTER.read_text(encoding="utf-8")

    assert "parse_arm_profiles" in source
    assert 'logical_name == work_reference' in source
    assert "CartesianVelocity.Goal.WORK" in source
    assert "goal.max_linear_speed_mps = profile.max_linear_speed_mps" in source
    assert "goal.max_angular_speed_radps = profile.max_angular_speed_radps" in source
    assert "message.header.frame_id != profile.frame_id" in source
    assert "linear speed exceeds Pika session limit" in source


def test_profile_parser_selects_configured_pikabase_work_reference():
    from pika_control_router import parse_arm_profiles

    profiles = parse_arm_profiles(
        [
            "l|default_work|1|cell|l/work/cell",
            "l|work/pikabase|1|pikabase|l/work/pikabase",
            "r|default_work|1|cell|r/work/cell",
            "r|work/pikabase|1|pikabase|r/work/pikabase",
        ],
        [
            "l|20|100|0.05|0.25|0.1|0.5|10|2",
            "r|20|100|0.05|0.25|0.1|0.5|10|2",
        ],
        "work/pikabase",
        1.0,
        2.0,
        4.0,
    )

    assert profiles["l"].reference_name == "pikabase"
    assert profiles["l"].frame_id == "l/work/pikabase"
    assert profiles["r"].reference_name == "pikabase"
    assert profiles["r"].frame_id == "r/work/pikabase"
    assert profiles["l"].max_angular_accel_radps2 == 4.0
    assert profiles["r"].max_angular_accel_radps2 == 4.0


def test_pika_angular_velocity_above_limit_is_scaled_without_changing_direction():
    """Catches discarding a usable high-rate rotation instead of norm-clamping it."""
    from geometry_msgs.msg import TwistStamped
    from pika_control_router import clamp_angular_velocity

    source = TwistStamped()
    source.header.frame_id = "l/work/pikabase"
    source.twist.linear.x = 0.2
    source.twist.angular.x = 3.0
    source.twist.angular.y = 4.0

    limited, was_clamped = clamp_angular_velocity(source, 2.0)

    assert was_clamped is True
    assert limited is not source
    assert limited.header.frame_id == "l/work/pikabase"
    assert limited.twist.linear.x == 0.2
    assert limited.twist.angular.x == pytest.approx(1.2)
    assert limited.twist.angular.y == pytest.approx(1.6)
    assert math.hypot(
        limited.twist.angular.x,
        limited.twist.angular.y,
        limited.twist.angular.z,
    ) == pytest.approx(2.0)


def test_pika_router_forwards_continuous_gripper_percentages_for_left_and_right():
    source = ROUTER.read_text(encoding="utf-8")

    assert "Float32" in source
    assert '"/pika/{arm}/gripper_percentage"' in source
    assert '"/gripper_left/percentage/command"' in source
    assert '"/gripper_right/percentage/command"' in source
    assert "self.mode not in MODES" in source
    assert 'MODES = ("pikaposition", "pikavelocity", "pikamixed")' in source
    assert "math.isfinite" in source
    assert "0.0 <= value <= 1.0" in source
    assert 'for arm in ("l", "r")' in source
    assert '"/pika/m/gripper_percentage"' not in source


def test_pika_velocity_refreshes_cached_input_through_short_upstream_jitter(monkeypatch):
    """A 175 ms Pika gap must not trip the driver's 100 ms watchdog."""
    from geometry_msgs.msg import TwistStamped
    from builtin_interfaces.msg import Time
    import pika_control_router
    from pika_control_router import PikaControlRouter, _ArmProfile, _ArmState

    published = []
    cancelled = []
    profile = _ArmProfile("pikabase", "l/work/pikabase", 20, 100, 1.0, 2.0, 0.1, 0.5)
    command = TwistStamped()
    command.header.frame_id = profile.frame_id
    command.twist.linear.x = 0.05
    state = _ArmState(
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(publish=published.append),
        SimpleNamespace(),
        profile,
        goal_handle=SimpleNamespace(
            cancel_goal_async=lambda: cancelled.append(True) or Future()
        ),
        active_kind="velocity",
        last_input_at=10.0,
    )
    state.latest_velocity = command
    router = PikaControlRouter.__new__(PikaControlRouter)
    router.dry_run = False
    router.mode = "pikavelocity"
    router.stale_ms = 200
    router.input_timeout_ms = 250
    router.watchdog_ms = 100
    router._arms = {"l": state}
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=12, nanosec=34))
    )

    monkeypatch.setattr(pika_control_router.time, "monotonic", lambda: 10.175)
    router._reconcile()

    assert len(published) == 1
    assert published[0].header.frame_id == "l/work/pikabase"
    assert published[0].header.stamp.sec == 12
    assert published[0].twist.linear.x == 0.05
    assert cancelled == []


def test_pika_velocity_stops_after_configured_upstream_timeout(monkeypatch):
    from geometry_msgs.msg import TwistStamped
    from builtin_interfaces.msg import Time
    import pika_control_router
    from pika_control_router import PikaControlRouter, _ArmProfile, _ArmState

    published = []
    cancel_future = Future()
    cancel_future.set_result(SimpleNamespace())
    profile = _ArmProfile("pikabase", "l/work/pikabase", 20, 100, 1.0, 2.0, 0.1, 0.5)
    command = TwistStamped()
    command.header.frame_id = profile.frame_id
    command.twist.linear.x = 0.05
    state = _ArmState(
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(publish=published.append),
        SimpleNamespace(),
        profile,
        goal_handle=SimpleNamespace(cancel_goal_async=lambda: cancel_future),
        active_kind="velocity",
        last_input_at=10.0,
    )
    state.latest_velocity = command
    router = PikaControlRouter.__new__(PikaControlRouter)
    router.dry_run = False
    router.mode = "pikavelocity"
    router.stale_ms = 200
    router.input_timeout_ms = 250
    router.watchdog_ms = 100
    router._arms = {"l": state}
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=12, nanosec=34))
    )

    monkeypatch.setattr(pika_control_router.time, "monotonic", lambda: 10.251)
    router._reconcile()

    assert len(published) == 1
    assert published[0].twist.linear.x == 0.0
    assert state.goal_handle is None


def test_pika_goal_acceptance_publishes_cached_velocity_after_frame_selection():
    from geometry_msgs.msg import TwistStamped
    from builtin_interfaces.msg import Time
    from pika_control_router import PikaControlRouter, _ArmProfile, _ArmState

    published = []
    result_future = Future()
    profile = _ArmProfile("pikabase", "l/work/pikabase", 20, 100, 1.0, 2.0, 0.1, 0.5)
    command = TwistStamped()
    command.header.frame_id = profile.frame_id
    command.twist.linear.y = 0.05
    handle = SimpleNamespace(
        accepted=True,
        get_result_async=lambda: result_future,
    )
    pending = Future()
    pending.set_result(handle)
    state = _ArmState(
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(),
        SimpleNamespace(publish=published.append),
        SimpleNamespace(),
        profile,
        pending_goal=pending,
        last_input_at=time.monotonic(),
    )
    state.latest_velocity = command
    router = PikaControlRouter.__new__(PikaControlRouter)
    router.dry_run = False
    router.mode = "pikavelocity"
    router.input_timeout_ms = 250
    router._monotonic = time.monotonic
    router._arms = {"l": state}
    router.get_logger = lambda: SimpleNamespace(info=lambda _message: None, warning=lambda _message: None)
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=12, nanosec=34))
    )

    router._goal_response("l", "velocity", pending)

    assert len(published) == 1
    assert published[0].header.frame_id == "l/work/pikabase"
    assert published[0].twist.linear.y == 0.05


# ------------------------------------------------------- session lifecycle


def _pika_router(*, mode, kind="", goal_active=False, input_ago=0.0, sends=None):
    """One l arm with fake transports; ``sends`` collects any session request."""
    from builtin_interfaces.msg import Time
    from geometry_msgs.msg import PoseStamped, TwistStamped
    from pika_control_router import PikaControlRouter, _ArmProfile, _ArmState

    published = {"pose": [], "velocity": []}
    cancelled = []
    sends = sends if sends is not None else []

    def cancel_goal_async():
        cancelled.append(True)
        return Future()

    def client():
        def send_goal_async(goal):
            sends.append(goal)
            return Future()
        return SimpleNamespace(server_is_ready=lambda: True, send_goal_async=send_goal_async)

    profile = _ArmProfile("pikabase", "l/work/pikabase", 10, 100, 0.15, 0.25, 0.1, 0.5)
    state = _ArmState(
        client(),
        client(),
        SimpleNamespace(publish=published["pose"].append),
        SimpleNamespace(publish=published["velocity"].append),
        SimpleNamespace(),
        profile,
        goal_handle=SimpleNamespace(cancel_goal_async=cancel_goal_async) if goal_active else None,
        active_kind=kind if goal_active else "",
        last_input_at=time.monotonic() - input_ago,
    )
    velocity = TwistStamped()
    velocity.header.frame_id = profile.frame_id
    velocity.twist.linear.x = 0.05
    state.latest_velocity = velocity
    pose = PoseStamped()
    pose.header.frame_id = "l/work/pikabase"
    pose.pose.position.x = 0.3
    pose.pose.orientation.w = 1.0
    state.latest_pose = pose

    router = PikaControlRouter.__new__(PikaControlRouter)
    router.dry_run = False
    router.mode = mode
    router.stale_ms = 200
    router.input_timeout_ms = 3000
    router.watchdog_ms = 3000
    router.control_period_ms = 20
    router.max_linear_speed_mps = 0.15
    router.max_angular_speed_radps = 0.25
    router.max_linear_accel_mps2 = 0.1
    router.max_angular_accel_radps2 = 0.5
    router._arms = {"l": state}
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=lambda _m: None, error=lambda _m: None
    )
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=42, nanosec=0))
    )
    return router, state, published, cancelled, sends


def test_a_paused_velocity_stream_stops_the_arm_but_keeps_the_session():
    # Replaying the last velocity for up to input_timeout_ms (3 s) kept the arm
    # moving after the hand stopped; past stale_ms it must command zero.
    router, state, published, cancelled, _ = _pika_router(
        mode="pikavelocity", kind="velocity", goal_active=True, input_ago=0.5
    )
    router._reconcile()
    assert cancelled == []
    assert published["velocity"][-1].twist.linear.x == 0.0


def test_fresh_velocity_input_is_replayed_between_pika_messages():
    router, state, published, cancelled, _ = _pika_router(
        mode="pikavelocity", kind="velocity", goal_active=True, input_ago=0.12
    )
    router._reconcile()
    assert published["velocity"][-1].twist.linear.x == pytest.approx(0.05)
    assert cancelled == []


def test_a_lost_velocity_stream_releases_the_session():
    router, state, published, cancelled, _ = _pika_router(
        mode="pikavelocity", kind="velocity", goal_active=True, input_ago=3.5
    )
    router._reconcile()
    assert cancelled == [True]
    assert published["velocity"][-1].twist.linear.x == 0.0


def test_a_velocity_session_is_never_opened_to_replay_stale_input():
    router, state, published, cancelled, sends = _pika_router(
        mode="pikavelocity", input_ago=0.5
    )
    router._reconcile()
    assert sends == []


def test_a_rejected_pika_session_is_retried_after_a_pause_not_every_tick():
    router, state, published, cancelled, sends = _pika_router(mode="pikavelocity")
    router._reconcile()
    assert len(sends) == 1
    pending = state.pending_goal
    pending.set_result(SimpleNamespace(accepted=False))
    router._goal_response("l", "velocity", pending)
    for _ in range(10):
        router._reconcile()
    assert len(sends) == 1
    assert state.retry_after > time.monotonic()


def test_a_pose_target_is_held_through_a_gap_longer_than_the_driver_watchdog():
    # Forwarding poses only on arrival let a >100 ms Pika gap trip the driver's
    # pose watchdog, which ended and later re-opened the session.
    router, state, published, cancelled, _ = _pika_router(
        mode="pikaposition", kind="position", goal_active=True, input_ago=0.4
    )
    router._reconcile()
    router._reconcile()
    assert cancelled == []
    assert len(published["pose"]) == 2
    message = published["pose"][-1]
    assert message.header.frame_id == "l/base_link"
    assert message.header.stamp.sec == 42
    assert message.pose.position.x == pytest.approx(0.3)


def test_a_lost_pose_stream_releases_the_session():
    router, state, published, cancelled, _ = _pika_router(
        mode="pikaposition", kind="position", goal_active=True, input_ago=3.5
    )
    router._reconcile()
    assert cancelled == [True]


def test_the_pose_goal_uses_the_driver_watchdog_not_the_input_loss_window():
    # The driver rejects a pose goal whose watchdog exceeds velocity_watchdog_ms.
    router, state, published, cancelled, sends = _pika_router(mode="pikaposition")
    router._reconcile()
    assert len(sends) == 1
    assert sends[0].watchdog_ms == 100


def test_a_pose_session_publishes_the_cached_target_on_acceptance():
    router, state, published, cancelled, sends = _pika_router(mode="pikaposition")
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=True, get_result_async=lambda: Future()))
    state.pending_goal = pending
    router._goal_response("l", "position", pending)
    assert state.active_kind == "position"
    assert len(published["pose"]) == 1


def test_a_driver_ended_pose_session_is_labelled_as_position_and_backs_off():
    router, state, published, cancelled, sends = _pika_router(
        mode="pikaposition", kind="position", goal_active=True
    )
    warnings = []
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=warnings.append, error=lambda _m: None
    )
    finished = Future()
    finished.set_result(SimpleNamespace(result=SimpleNamespace(
        success=False, message="pose command watchdog expired", terminal_state=3,
    )))
    router._goal_finished("l", "position", finished)
    assert any(message.startswith("Pika position session ended") for message in warnings)
    assert state.retry_after > time.monotonic()


def test_pika_restarts_are_counted_and_reset_when_the_mode_changes():
    from realman_msgs.msg import InputModeState

    router, state, published, cancelled, sends = _pika_router(mode="pikavelocity")
    warnings = []
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=warnings.append, error=lambda _m: None
    )
    for _ in range(2):
        pending = Future()
        pending.set_result(SimpleNamespace(accepted=True, get_result_async=lambda: Future()))
        router._goal_response("l", "velocity", pending)
    assert state.sessions_started == 2
    assert any("restart #1" in message for message in warnings)
    router._mode_state(InputModeState(active_mode="pikaposition", phase=InputModeState.ACTIVE))
    assert state.sessions_started == 0


# ------------------------------------------------------------ Pika / Mixed


def _axis_angle_quaternion(axis, angle):
    half = angle / 2.0
    norm = math.sqrt(sum(value * value for value in axis))
    return (math.cos(half), *(math.sin(half) * value / norm for value in axis))


def _angle_between(q0, q1):
    dot = abs(sum(a * b for a, b in zip(q0, q1)))
    return 2.0 * math.acos(min(1.0, dot))


def test_rotate_towards_is_bounded_and_reaches_a_near_target():
    from pika_control_router import rotate_towards

    start = (1.0, 0.0, 0.0, 0.0)
    goal = _axis_angle_quaternion((0.0, 0.0, 1.0), math.radians(90))
    step = rotate_towards(start, goal, math.radians(10))
    assert _angle_between(start, step) == pytest.approx(math.radians(10), abs=1e-9)
    # The step lies on the path to the goal, not beside it.
    assert _angle_between(step, goal) == pytest.approx(math.radians(80), abs=1e-9)
    assert rotate_towards(start, goal, math.radians(120)) == pytest.approx(goal)


def test_rotate_towards_takes_the_short_way_for_a_sign_flipped_target():
    from pika_control_router import rotate_towards

    start = (1.0, 0.0, 0.0, 0.0)
    goal = tuple(-value for value in _axis_angle_quaternion((1.0, 0.0, 0.0), math.radians(5)))
    step = rotate_towards(start, goal, math.radians(10))
    # -q is the same orientation: 5 degrees away, not 355.
    assert _angle_between(start, step) == pytest.approx(math.radians(5), abs=1e-9)


@pytest.mark.parametrize("bad", [(0.0, 0.0, 0.0, 0.0), (1.0, float("nan"), 0.0, 0.0), (1.0, 0.0)])
def test_normalize_quaternion_rejects_unusable_input(bad):
    from pika_control_router import normalize_quaternion

    with pytest.raises(ValueError):
        normalize_quaternion(bad)


def _target():
    from pika_control_router import MixedTarget

    return MixedTarget((0.3, 0.0, 0.4), (1.0, 0.0, 0.0, 0.0))


def _step(target, **overrides):
    settings = dict(
        dt=0.01,
        commanded_velocity=(0.0, 0.0, 0.0),
        pika_orientation=None,
        max_speed=0.15,
        max_accel=0.10,
        max_angular_speed=0.25,
        measured_position=target.position,
        max_lead=0.05,
        # The arm follows perfectly unless a test says otherwise.
        measured_orientation=target.orientation,
        max_orientation_lead=0.15,
    )
    settings.update(overrides)
    target.step(**settings)


def test_mixed_target_integrates_velocity_under_the_acceleration_limit():
    target = _target()
    for _ in range(300):
        _step(target, commanded_velocity=(0.05, 0.0, 0.0), measured_position=target.position)
    # 3 s: 0.5 s ramp to 0.05 m/s at 0.1 m/s^2, then cruise.
    assert target.velocity[0] == pytest.approx(0.05)
    assert target.position[0] - 0.3 == pytest.approx(0.05 * 3.0 - 0.5 * 0.05 * 0.5, abs=2e-3)
    assert target.position[1:] == pytest.approx((0.0, 0.4))


def test_mixed_target_clamps_speed_preserving_direction():
    target = _target()
    for _ in range(500):
        _step(target, commanded_velocity=(0.3, 0.4, 0.0), measured_position=target.position)
    assert math.hypot(*target.velocity) == pytest.approx(0.15)
    assert target.velocity[0] / target.velocity[1] == pytest.approx(0.3 / 0.4)


def test_mixed_target_is_leashed_to_the_measured_position():
    # The arm is stuck (IK failure): the target may not run more than 5 cm ahead.
    target = _target()
    stuck = (0.3, 0.0, 0.4)
    for _ in range(1000):
        _step(target, commanded_velocity=(0.15, 0.0, 0.0), measured_position=stuck)
    assert target.position[0] - stuck[0] == pytest.approx(0.05)


def test_mixed_target_holds_when_no_measurement_is_available():
    target = _target()
    for _ in range(100):
        _step(target, commanded_velocity=(0.15, 0.0, 0.0), measured_position=None)
    assert target.position == pytest.approx((0.3, 0.0, 0.4))
    assert target.velocity == (0.0, 0.0, 0.0)


def test_mixed_target_orientation_approaches_the_goal_at_the_angular_limit():
    target = _target()
    _step(target, pika_orientation=(1.0, 0.0, 0.0, 0.0))  # pairs Pika with the arm
    goal = _axis_angle_quaternion((0.0, 1.0, 0.0), math.radians(30))
    for _ in range(100):  # 1 s at 0.25 rad/s = 14.3 degrees
        _step(target, pika_orientation=goal, measured_orientation=target.orientation)
    assert _angle_between((1.0, 0.0, 0.0, 0.0), target.orientation) == pytest.approx(0.25, abs=1e-6)
    for _ in range(200):
        _step(target, pika_orientation=goal, measured_orientation=target.orientation)
    assert _angle_between(target.orientation, goal) == pytest.approx(0.0, abs=1e-6)


def test_mixed_target_holds_orientation_without_a_fresh_goal():
    target = _target()
    before = target.orientation
    for _ in range(50):
        _step(target, pika_orientation=None)
    assert target.orientation == pytest.approx(before)


def test_mixed_orientation_is_relative_so_an_offset_pika_does_not_turn_the_wrist():
    # The Pika frame is 40 degrees off the arm. Holding the Pika still must
    # hold the arm; only a later Pika rotation turns it, by the same amount.
    from pika_control_router import quaternion_multiply

    arm = _axis_angle_quaternion((1.0, 0.0, 0.0), math.radians(170))
    offset = _axis_angle_quaternion((0.3, 0.8, 0.5), math.radians(40))
    from pika_control_router import MixedTarget

    target = MixedTarget((0.3, 0.0, 0.4), arm)
    for _ in range(200):
        _step(target, pika_orientation=offset, measured_orientation=target.orientation)
    assert _angle_between(target.orientation, arm) == pytest.approx(0.0, abs=1e-9)

    # Turn the Pika 10 degrees about the base z axis: the arm follows by
    # exactly that rotation in the base frame.
    turn = _axis_angle_quaternion((0.0, 0.0, 1.0), math.radians(10))
    turned_pika = quaternion_multiply(turn, offset)
    for _ in range(200):
        _step(target, pika_orientation=turned_pika, measured_orientation=target.orientation)
    expected = quaternion_multiply(turn, arm)
    assert _angle_between(target.orientation, expected) == pytest.approx(0.0, abs=1e-6)


def test_mixed_orientation_is_leashed_to_the_measured_orientation():
    # IK fails and the arm stops: the orientation target must stop within the
    # lead instead of turning on, so turning the Pika back recovers at once.
    target = _target()
    stuck = target.orientation
    _step(target, pika_orientation=(1.0, 0.0, 0.0, 0.0), measured_orientation=stuck)
    away = _axis_angle_quaternion((0.0, 1.0, 0.0), math.radians(90))
    for _ in range(1000):
        _step(target, pika_orientation=away, measured_orientation=stuck)
    assert _angle_between(stuck, target.orientation) == pytest.approx(0.15, abs=1e-6)
    for _ in range(100):  # Pika turned back: the target returns to the arm.
        _step(target, pika_orientation=(1.0, 0.0, 0.0, 0.0), measured_orientation=stuck)
    assert _angle_between(stuck, target.orientation) == pytest.approx(0.0, abs=1e-6)


def test_mixed_orientation_holds_without_a_measured_orientation():
    target = _target()
    _step(target, pika_orientation=(1.0, 0.0, 0.0, 0.0))
    away = _axis_angle_quaternion((0.0, 1.0, 0.0), math.radians(30))
    for _ in range(100):
        _step(target, pika_orientation=away, measured_orientation=None)
    assert target.orientation == pytest.approx((1.0, 0.0, 0.0, 0.0))


def _mixed_router(*, goal_active=False, velocity_ago=0.0, pose_ago=0.0, anchor=True, sends=None):
    """Router in pikamixed with one l arm and fake transports."""
    router, state, published, cancelled, sends = _pika_router(
        mode="pikamixed", kind="mixed", goal_active=goal_active, sends=sends
    )
    from pika_control_router import MixedTarget

    now = time.monotonic()
    state.velocity_input_at = now - velocity_ago
    state.pose_input_at = now - pose_ago
    state.last_input_at = max(state.velocity_input_at, state.pose_input_at)
    router.mixed_stale_ms = 200
    router.mixed_input_timeout_ms = 3000
    router.mixed_max_linear_speed_mps = 0.15
    router.mixed_max_linear_accel_mps2 = 0.10
    router.mixed_max_angular_speed_radps = 0.25
    router.mixed_max_position_lead_m = 0.05
    router.mixed_max_orientation_lead_rad = 0.15
    router.mixed_pose_poll_hz = 10.0
    calls = []

    def call_async(request):
        calls.append(request)
        return Future()

    state.current_pose_client = SimpleNamespace(
        service_is_ready=lambda: True, call_async=call_async
    )
    if anchor:
        state.mixed = MixedTarget((0.3, 0.0, 0.4), (1.0, 0.0, 0.0, 0.0))
        state.measured_position = (0.3, 0.0, 0.4)
        state.measured_orientation = (1.0, 0.0, 0.0, 0.0)
        state.measured_at = now
    return router, state, published, cancelled, sends, calls


def test_mixed_mode_anchors_at_the_current_pose_before_requesting_a_session():
    router, state, published, cancelled, sends, calls = _mixed_router(anchor=False)
    router._reconcile()
    assert sends == []
    assert len(calls) == 1
    assert calls[0].reference_name == "base"
    response = SimpleNamespace(
        success=True, pose_position_m=[0.31, 0.02, 0.41], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    )
    # set_result fires the router's own done callback, as rclpy's future would.
    state.anchor_future.set_result(response)
    assert state.anchor_future is None
    assert state.mixed.position == pytest.approx((0.31, 0.02, 0.41))
    assert state.measured_orientation == pytest.approx((1.0, 0.0, 0.0, 0.0))
    router._reconcile()
    assert len(sends) == 1
    # A pose session: BASE reference with the driver watchdog.
    assert sends[0].reference_name == "base"
    assert sends[0].watchdog_ms == 100


def test_a_failed_anchor_read_backs_off_instead_of_starting_blind():
    router, state, published, cancelled, sends, calls = _mixed_router(anchor=False)
    router._reconcile()
    state.anchor_future.set_result(SimpleNamespace(success=False))
    router._on_anchor("l", state.anchor_future)
    assert state.mixed is None
    assert state.retry_after > time.monotonic()
    router._reconcile()
    assert sends == []


def test_a_late_anchor_from_a_previous_activation_is_ignored():
    from realman_msgs.msg import InputModeState

    router, state, published, cancelled, sends, calls = _mixed_router(anchor=False)
    router._reconcile()
    stale_future = state.anchor_future
    router._mode_state(InputModeState(active_mode="pikaposition", phase=InputModeState.ACTIVE))
    stale_future.set_result(SimpleNamespace(
        success=True, pose_position_m=[9.0, 9.0, 9.0], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    ))
    router._on_anchor("l", stale_future)
    assert state.mixed is None


def test_the_first_mixed_target_is_the_anchor_itself():
    router, state, published, cancelled, sends, calls = _mixed_router()
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=True, get_result_async=lambda: Future()))
    router._goal_response("l", "mixed", pending)
    assert state.active_kind == "mixed"
    message = published["pose"][-1]
    assert message.header.frame_id == "l/base_link"
    assert (message.pose.position.x, message.pose.position.y, message.pose.position.z) == pytest.approx(
        (0.3, 0.0, 0.4)
    )


def test_mixed_xyz_follows_velocity_while_orientation_follows_the_pika_rotation():
    from geometry_msgs.msg import PoseStamped
    from pika_control_router import quaternion_multiply

    router, state, published, cancelled, sends, calls = _mixed_router(goal_active=True)
    # The Pika frame is 40 degrees off the arm; only its later rotation counts.
    offset = _axis_angle_quaternion((1.0, 0.0, 0.0), math.radians(40))
    goal = _axis_angle_quaternion((0.0, 0.0, 1.0), math.radians(20))
    pose = PoseStamped()
    # Pika's absolute position is deliberately far away: mixed mode must use
    # only its orientation.
    pose.pose.position.x = 5.0

    def set_pika(orientation):
        (pose.pose.orientation.w, pose.pose.orientation.x,
         pose.pose.orientation.y, pose.pose.orientation.z) = orientation

    set_pika(offset)
    state.latest_pose = pose
    state.latest_velocity.twist.linear.x = 0.05
    state.latest_velocity.twist.angular.z = 3.0  # must be ignored

    def tick():
        state.velocity_input_at = state.pose_input_at = time.monotonic()
        state.last_mixed_step_at = time.monotonic() - 0.05
        state.measured_position = state.mixed.position
        state.measured_orientation = state.mixed.orientation
        state.measured_at = time.monotonic()
        router._reconcile()

    tick()  # pairs the offset Pika with the arm; the wrist does not turn
    assert _angle_between((1.0, 0.0, 0.0, 0.0), state.mixed.orientation) == pytest.approx(0.0, abs=1e-9)
    set_pika(quaternion_multiply(goal, offset))  # Pika turns 20 degrees about base z
    for _ in range(2):
        tick()
    message = published["pose"][-1]
    assert message.pose.position.x > 0.3
    assert message.pose.position.x < 0.31
    orientation = (
        message.pose.orientation.w, message.pose.orientation.x,
        message.pose.orientation.y, message.pose.orientation.z,
    )
    turned = _angle_between((1.0, 0.0, 0.0, 0.0), orientation)
    # Two 50 ms steps at 0.25 rad/s: bounded, toward the 20 degree base-z turn.
    assert turned == pytest.approx(2 * 0.05 * 0.25, abs=1e-6)
    assert _angle_between(orientation, goal) == pytest.approx(math.radians(20) - turned, abs=1e-6)


def test_a_stale_mixed_velocity_decelerates_and_holds_instead_of_replaying():
    router, state, published, cancelled, sends, calls = _mixed_router(
        goal_active=True, velocity_ago=0.5, pose_ago=0.0
    )
    state.mixed.velocity = (0.05, 0.0, 0.0)
    state.last_mixed_step_at = time.monotonic() - 0.05
    router._reconcile()
    assert state.mixed.velocity[0] < 0.05
    assert cancelled == []


def test_a_mixed_session_survives_while_either_stream_is_alive():
    router, state, published, cancelled, sends, calls = _mixed_router(
        goal_active=True, velocity_ago=5.0, pose_ago=0.05
    )
    router._reconcile()
    assert cancelled == []


def test_a_mixed_session_is_released_when_both_streams_are_lost():
    router, state, published, cancelled, sends, calls = _mixed_router(
        goal_active=True, velocity_ago=3.5, pose_ago=3.5
    )
    router._reconcile()
    assert cancelled == [True]
    assert state.mixed is None


def test_mixed_mode_polls_the_measured_pose_for_the_leash():
    router, state, published, cancelled, sends, calls = _mixed_router(goal_active=True)
    state.next_measure_at = 0.0
    router._reconcile()
    assert len(calls) == 1
    state.measure_future.set_result(SimpleNamespace(
        success=True, pose_position_m=[0.32, 0.0, 0.4], pose_quaternion_wxyz=[1.0, 0.0, 0.0, 0.0]
    ))
    router._on_measured_pose("l", state.measure_future)
    assert state.measured_position == pytest.approx((0.32, 0.0, 0.4))
    router._reconcile()
    # Polling is rate limited, not once per 10 ms tick.
    assert len(calls) == 1


def test_mixed_ingress_accepts_both_streams_and_rejects_a_bad_quaternion():
    from geometry_msgs.msg import PoseStamped, TwistStamped

    router, state, published, cancelled, sends, calls = _mixed_router(goal_active=True)
    router.dry_run = True  # ingress bookkeeping only
    router._last_unavailable_log = {}
    velocity = TwistStamped()
    velocity.header.frame_id = "l/work/pikabase"
    velocity.twist.linear.y = 0.02
    router._velocity("l", velocity)
    assert state.latest_velocity.twist.linear.y == pytest.approx(0.02)
    bad = PoseStamped()
    bad.pose.orientation.w = 0.0
    before = state.latest_pose
    router._pose("l", bad)
    assert state.latest_pose is before
    good = PoseStamped()
    good.pose.orientation.w = 1.0
    router._pose("l", good)
    assert state.latest_pose is good


def test_the_gripper_is_forwarded_in_mixed_mode():
    from std_msgs.msg import Float32

    router, state, published, cancelled, sends, calls = _mixed_router()
    forwarded = []
    state.gripper_publisher = SimpleNamespace(publish=forwarded.append)
    router._gripper("l", Float32(data=0.5))
    assert forwarded and forwarded[0].data == pytest.approx(0.5)


def test_mixed_limits_may_not_exceed_the_pose_goal_ceilings():
    from pika_control_router import PikaControlRouter

    router = PikaControlRouter.__new__(PikaControlRouter)
    router.max_linear_speed_mps = 0.15
    router.max_angular_speed_radps = 0.25
    router.mixed_stale_ms = 200
    router.mixed_input_timeout_ms = 3000
    router.mixed_max_linear_speed_mps = 0.15
    router.mixed_max_linear_accel_mps2 = 0.1
    router.mixed_max_angular_speed_radps = 0.25
    router.mixed_max_position_lead_m = 0.05
    router.mixed_max_orientation_lead_rad = 0.15
    router.mixed_pose_poll_hz = 10.0
    router._validate_mixed_parameters()
    router.mixed_max_angular_speed_radps = 0.5
    with pytest.raises(ValueError, match="max_angular_speed"):
        router._validate_mixed_parameters()
    router.mixed_max_angular_speed_radps = 0.25
    router.mixed_stale_ms = 3000
    with pytest.raises(ValueError, match="stale_ms"):
        router._validate_mixed_parameters()
