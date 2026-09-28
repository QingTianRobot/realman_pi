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

    assert 'if self.mode != "pikaposition":' in source
    assert 'if self.mode != "pikavelocity":' in source
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
    assert 'self.mode not in {"pikaposition", "pikavelocity"}' in source
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
