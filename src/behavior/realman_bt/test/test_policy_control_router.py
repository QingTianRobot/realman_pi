from concurrent.futures import Future
from pathlib import Path
import sys
from types import SimpleNamespace

import pytest

ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "src/behavior/realman_bt/scripts/policy_control_router.py"
sys.path.insert(0, str(ROUTER.parent))

FRAME = "r/work/pikabase"
NOW_NS = 100 * 1_000_000_000


def _profile():
    from router_common import ArmProfile

    return ArmProfile("pikabase", FRAME, 20, 100, 0.10, 0.25, 0.10, 0.50)


def _command(*, linear=(0.0, 0.0, 0.0), angular=(0.0, 0.0, 0.0), age_ms=10.0, frame=FRAME):
    from geometry_msgs.msg import TwistStamped

    message = TwistStamped()
    message.header.frame_id = frame
    stamp_ns = NOW_NS - int(age_ms * 1e6)
    message.header.stamp.sec, message.header.stamp.nanosec = divmod(stamp_ns, 1_000_000_000)
    message.twist.linear.x, message.twist.linear.y, message.twist.linear.z = (float(v) for v in linear)
    message.twist.angular.x, message.twist.angular.y, message.twist.angular.z = (float(v) for v in angular)
    return message


# --- source contract -------------------------------------------------------------------------------------------


def test_router_consumes_only_the_policy_namespace_and_the_existing_driver_topics():
    source = ROUTER.read_text(encoding="utf-8")

    assert "/{arm}/cartesian_velocity/command" in source
    assert 'ActionClient(self, CartesianVelocity, f"/{arm}/cartesian_velocity")' in source
    assert "/gripper_right/percentage/command" in source
    assert "{namespace}/{arm}/cartesian_velocity" in source
    assert "{namespace}/{arm}/gripper_percentage" in source
    assert '"/pika/' not in source


def test_router_is_gated_by_the_policy_mode_and_the_active_phase():
    source = ROUTER.read_text(encoding="utf-8")

    assert 'MODE = "policy"' in source
    assert "InputModeState.ACTIVE" in source
    assert "if not self.mode_active:" in source


def test_both_arms_are_routed_by_default_and_the_node_is_installed_and_launched():
    cmake = (ROOT / "src/behavior/realman_bt/CMakeLists.txt").read_text(encoding="utf-8")
    launch = (ROOT / "src/behavior/realman_bt/launch/control_router.launch.py").read_text(encoding="utf-8")
    config = (ROOT / "config/ros/policy_router.yaml").read_text(encoding="utf-8")

    assert "RENAME policy_control_router" in cmake
    assert "scripts/router_common.py" in cmake
    assert 'executable="policy_control_router"' in launch
    assert "policy_router," in launch
    assert 'arms: ["l", "r"]' in config
    assert "stale_ms: 100" in config


# --- command validation ----------------------------------------------------------------------------------------


def test_fresh_command_in_the_right_frame_is_accepted():
    from policy_control_router import validate_command

    assert validate_command(_command(linear=(0.05, 0, 0)), _profile(), NOW_NS, 100) is None


@pytest.mark.parametrize(
    ("kwargs", "text"),
    [
        ({"frame": "r_base_link"}, "frame_id"),
        ({"age_ms": 150.0}, "old"),
        ({"linear": (float("nan"), 0, 0)}, "finite"),
        ({"angular": (0, float("inf"), 0)}, "finite"),
    ],
)
def test_bad_commands_are_dropped_with_a_reason(kwargs, text):
    from policy_control_router import validate_command

    reason = validate_command(_command(**kwargs), _profile(), NOW_NS, 100)

    assert reason is not None and text in reason


def test_command_without_a_stamp_is_dropped():
    from geometry_msgs.msg import TwistStamped
    from policy_control_router import validate_command

    message = TwistStamped()
    message.header.frame_id = FRAME

    assert "stamp" in validate_command(message, _profile(), NOW_NS, 100)


def test_gripper_values_must_be_finite_and_in_range():
    from policy_control_router import gripper_value_ok

    assert gripper_value_ok(0.0) and gripper_value_ok(1.0) and gripper_value_ok(0.4)
    assert not any(gripper_value_ok(v) for v in (-0.01, 1.01, float("nan"), float("inf")))


# --- uncommanded-motion guard -----------------------------------------------------------------------------------


def _guard():
    from policy_control_router import DriftGuard

    return DriftGuard(limit_deg=1.0, window_sec=2.0)


def test_drift_guard_trips_on_motion_after_a_zero_command_session_start():
    guard = _guard()
    guard.start([0.0] * 6, now=10.0)
    guard.note_command(_command())

    assert not guard.tripped([0.005] + [0.0] * 5, now=10.5)  # 0.29 deg
    assert guard.tripped([0.02] + [0.0] * 5, now=10.5)  # 1.15 deg


def test_drift_guard_stands_down_once_a_motion_command_was_sent_or_the_window_ended():
    guard = _guard()
    guard.start([0.0] * 6, now=10.0)
    guard.note_command(_command(linear=(0.05, 0, 0)))
    assert not guard.tripped([0.5] + [0.0] * 5, now=10.5)

    guard = _guard()
    guard.start([0.0] * 6, now=10.0)
    assert not guard.tripped([0.5] + [0.0] * 5, now=12.5)  # after the 2 s window


def test_drift_guard_without_joint_data_does_not_trip():
    guard = _guard()
    guard.start(None, now=10.0)
    assert not guard.tripped([0.5] * 6, now=10.1)


# --- node behaviour ----------------------------------------------------------------------------------------------


def _router(monkeypatch, *, goal_handle=None, last_input_at=10.0, latest=None, cancelled=None, published=None, now=10.05):
    import policy_control_router
    from builtin_interfaces.msg import Time
    from policy_control_router import DriftGuard, PolicyControlRouter, _Arm

    published = published if published is not None else []
    cancel_future = Future()
    cancel_future.set_result(SimpleNamespace())
    handle = goal_handle
    if handle is None and cancelled is not None:
        handle = SimpleNamespace(cancel_goal_async=lambda: cancelled.append(True) or cancel_future)
    arm = _Arm(
        client=SimpleNamespace(),
        velocity_publisher=SimpleNamespace(publish=published.append),
        gripper_publisher=SimpleNamespace(publish=published.append),
        profile=_profile(),
        guard=DriftGuard(1.0, 2.0),
        goal_handle=handle,
        latest=latest,
        last_input_at=last_input_at,
        last_seen_at=last_input_at,
    )
    router = PolicyControlRouter.__new__(PolicyControlRouter)
    router.dry_run = False
    router.mode_active = True
    router.stale_ms = 100
    router.input_timeout_ms = 500
    router.gripper_min_period = 0.1
    router._last_log = {}
    router._arms = {"r": arm}
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=7, nanosec=8), nanoseconds=NOW_NS)
    )
    router.get_logger = lambda: SimpleNamespace(
        info=lambda *_: None, warning=lambda *_: None, error=lambda *_: None
    )
    monkeypatch.setattr(policy_control_router.time, "monotonic", lambda: now)
    return router, arm, published


def test_fresh_input_is_replayed_to_the_driver_in_the_arm_frame(monkeypatch):
    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(linear=(0.05, 0, 0)), now=10.05)

    router._reconcile()

    assert len(published) == 1
    assert published[0].header.frame_id == FRAME
    assert published[0].twist.linear.x == 0.05
    assert cancelled == []


def test_stale_input_commands_zero_but_keeps_the_session(monkeypatch):
    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(linear=(0.05, 0, 0)), now=10.3)

    router._reconcile()

    assert len(published) == 1 and published[0].twist.linear.x == 0.0
    assert cancelled == []


def test_input_older_than_the_timeout_releases_the_session(monkeypatch):
    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(linear=(0.05, 0, 0)), now=10.6)

    router._reconcile()

    assert published[-1].twist.linear.x == 0.0
    assert cancelled == [True]
    assert arm.latest is None


def test_leaving_policy_mode_zeroes_and_cancels_every_session(monkeypatch):
    from realman_msgs.msg import InputModeState

    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(linear=(0.05, 0, 0)))
    message = InputModeState()
    message.active_mode, message.phase = "none", InputModeState.ACTIVE

    router._mode_state(message)

    assert router.mode_active is False
    assert published[-1].twist.linear.x == 0.0
    assert cancelled == [True]


def test_a_non_active_phase_counts_as_leaving_policy_mode(monkeypatch):
    from realman_msgs.msg import InputModeState

    cancelled = []
    router, _, _ = _router(monkeypatch, cancelled=cancelled)
    message = InputModeState()
    message.active_mode, message.phase = "policy", InputModeState.SWITCHING

    router._mode_state(message)

    assert router.mode_active is False and cancelled == [True]


def test_commands_are_ignored_outside_policy_mode(monkeypatch):
    router, arm, _ = _router(monkeypatch)
    router.mode_active = False

    router._velocity("r", _command(linear=(0.05, 0, 0)))

    assert arm.latest is None


def test_velocity_is_clamped_to_the_router_limits(monkeypatch):
    router, arm, _ = _router(monkeypatch, goal_handle=SimpleNamespace())
    router._reconcile = lambda: None

    router._velocity("r", _command(linear=(0.5, 0, 0), angular=(0, 0, 2.0)))

    assert arm.latest.twist.linear.x == pytest.approx(0.10)
    assert arm.latest.twist.angular.z == pytest.approx(0.25)


def test_dropped_command_does_not_refresh_the_input_age(monkeypatch):
    router, arm, _ = _router(monkeypatch, goal_handle=SimpleNamespace(), last_input_at=5.0)
    router._reconcile = lambda: None

    router._velocity("r", _command(frame="r_base_link"))

    assert arm.last_input_at == 5.0 and arm.latest is None


def test_emergency_stop_zeroes_cancels_and_latches_a_fault(monkeypatch):
    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(linear=(0.05, 0, 0)))
    response = SimpleNamespace(success=False, message="")

    result = router._emergency_stop(None, response)

    assert result.success
    assert published[-1].twist.linear.x == 0.0
    assert cancelled == [True]
    assert arm.fault == "emergency stop"
    router._velocity("r", _command(linear=(0.05, 0, 0)))
    assert arm.latest is None  # input is refused while the fault is latched


def test_fault_clears_only_after_the_stream_has_gone_quiet(monkeypatch):
    router, arm, _ = _router(monkeypatch, last_input_at=10.0, now=10.2)
    arm.fault = "emergency stop"
    arm.last_seen_at = 10.1  # the bridge is still publishing

    router._reconcile()
    assert arm.fault == "emergency stop"

    import policy_control_router

    monkeypatch.setattr(policy_control_router.time, "monotonic", lambda: 10.7)  # 0.6 s of silence
    router._reconcile()
    assert arm.fault == ""


def test_drift_after_session_start_cancels_and_latches(monkeypatch):
    cancelled = []
    router, arm, published = _router(monkeypatch, cancelled=cancelled, latest=_command(), now=10.1)
    arm.guard.start([0.0] * 6, now=10.0)
    arm.joints = [0.05] + [0.0] * 5  # 2.9 deg with only zero commands sent

    router._reconcile()

    assert cancelled == [True]
    assert arm.fault == "uncommanded motion at session start"
    assert published[-1].twist.linear.x == 0.0


def test_gripper_is_range_checked_and_rate_limited(monkeypatch):
    router, arm, published = _router(monkeypatch, now=10.0)

    router._gripper("r", SimpleNamespace(data=0.8))
    router._gripper("r", SimpleNamespace(data=0.2))  # inside the 0.1 s minimum period
    router._gripper("r", SimpleNamespace(data=1.7))  # invalid

    assert [m.data for m in published] == pytest.approx([0.8])


def test_dry_run_sends_nothing(monkeypatch):
    router, arm, published = _router(monkeypatch, goal_handle=SimpleNamespace(), latest=_command(linear=(0.05, 0, 0)))
    router.dry_run = True

    router._reconcile()
    router._gripper("r", SimpleNamespace(data=0.5))

    assert published == []


def test_goal_acceptance_publishes_the_cached_command_and_starts_the_guard(monkeypatch):
    result_future = Future()
    router, arm, published = _router(monkeypatch, latest=_command(linear=(0.05, 0, 0)))
    arm.joints = [0.1] * 6
    handle = SimpleNamespace(accepted=True, get_result_async=lambda: result_future)
    future = Future()
    future.set_result(handle)

    router._goal_response("r", future)

    assert arm.goal_handle is handle
    assert len(published) == 1 and published[0].twist.linear.x == 0.05
    # A non-zero command was already queued, so the drift guard stands down.
    assert not arm.guard.tripped([5.0] * 6, now=10.06)


def test_rejected_goal_backs_off_instead_of_retrying_every_tick(monkeypatch):
    router, arm, _ = _router(monkeypatch, latest=_command(linear=(0.05, 0, 0)))
    future = Future()
    future.set_result(SimpleNamespace(accepted=False))

    router._goal_response("r", future)

    assert arm.goal_handle is None
    assert arm.retry_after > 10.05
