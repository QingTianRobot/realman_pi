from concurrent.futures import Future
from pathlib import Path
import sys
import json
import time
from types import SimpleNamespace

import pytest


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "src/behavior/realman_bt/scripts/keyboard_control_router.py"
sys.path.insert(0, str(ROUTER.parent))


def test_router_constructs_only_left_and_right_resources():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'for arm in ("l", "r")' in source
    assert 'f"/keyboard/{arm}/cartesian_velocity"' in source
    assert 'f"/{arm}/cartesian_velocity/command"' in source
    assert '"/keyboard/m/cartesian_velocity"' not in source


def test_router_requires_active_keyboard_and_verified_default_work():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'message.active_mode == "keyboard"' in source
    assert 'state.get("work_matched") is True' in source
    assert 'state.get("motion_allowed") is True' in source
    assert "CartesianVelocity.Goal.WORK" in source
    assert "CartesianVelocity.Goal.BASE" not in source
    assert "goal.max_linear_speed_mps = profile.max_linear_speed_mps" in source
    assert "goal.max_angular_speed_radps = profile.max_angular_speed_radps" in source


def test_keyboard_velocity_goal_uses_high_follow_at_ten_milliseconds():
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile

    profile = _ArmProfile("cell", "r/work/cell", 10, 100, 0.05, 0.25, 0.1, 0.5)

    goal = KeyboardControlRouter._goal(profile)

    assert goal.follow is True
    assert goal.control_period_ms == 10
    assert goal.watchdog_ms == 100


def test_keyboard_velocity_goal_rejects_period_above_high_follow_limit():
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile

    profile = _ArmProfile("cell", "r/work/cell", 11, 100, 0.05, 0.25, 0.1, 0.5)

    with pytest.raises(ValueError, match="high-follow requires control_period_ms <= 10"):
        KeyboardControlRouter._goal(profile)


def test_router_stops_on_timeout_mode_loss_and_shutdown():
    source = ROUTER.read_text(encoding="utf-8")
    assert "input_timeout_ms" in source
    assert "_publish_zero" in source
    assert "_cancel" in source
    assert "cancel_after_accept" in source
    assert "destroy_node" in source
    assert "self.dry_run" in source


def test_profile_parser_resolves_only_l_r_default_work_and_motion_limits():
    from keyboard_control_router import parse_arm_profiles

    profiles = parse_arm_profiles(
        [
            "l|default_work|1|cell|l/work/cell",
            "m|default_work|1|cell|m/work/cell",
            "r|default_work|1|cell|r/work/cell",
        ],
        [
            "l|10|100|0.05|0.25|0.1|0.5|10|2",
            "m|20|100|0.05|0.25|0.1|0.5|10|2",
            "r|10|100|0.05|0.25|0.1|0.5|10|2",
        ],
    )
    assert set(profiles) == {"l", "r"}
    assert profiles["l"].reference_name == "cell"
    assert profiles["l"].frame_id == "l/work/cell"
    assert profiles["r"].control_period_ms == 10


def test_profile_parser_rejects_base_or_missing_default_work():
    from keyboard_control_router import parse_arm_profiles

    with pytest.raises(ValueError, match="default WORK"):
        parse_arm_profiles(
            ["l|base|0|base|l/base_link", "r|default_work|1|cell|r/work/cell"],
            [
                "l|20|100|0.05|0.25|0.1|0.5|10|2",
                "r|20|100|0.05|0.25|0.1|0.5|10|2",
            ],
        )


def test_late_router_receives_latest_transient_coordinate_state():
    from rclpy.executors import SingleThreadedExecutor
    from rclpy.node import Node
    from rclpy.qos import QoSDurabilityPolicy, QoSProfile, QoSReliabilityPolicy
    from std_msgs.msg import String
    import rclpy

    rclpy.init(args=[
        "--ros-args",
        "-p", "coordinate_references:=['l|default_work|1|cell|l/work/cell','r|default_work|1|cell|r/work/cell']",
        "-p", "cartesian_velocity_profiles:=['l|10|100|0.05|0.25|0.1|0.5|10|2','r|10|100|0.05|0.25|0.1|0.5|10|2']",
    ])
    peer = Node("coordinate_state_replay_peer")
    publisher = peer.create_publisher(
        String,
        "/l/coordinates/state",
        QoSProfile(
            depth=1,
            reliability=QoSReliabilityPolicy.RELIABLE,
            durability=QoSDurabilityPolicy.TRANSIENT_LOCAL,
        ),
    )
    publisher.publish(String(data=json.dumps({
        "motion_allowed": True,
        "work_matched": True,
        "current_work": "cell",
        "expected_work": "cell",
        "work": {"name": "cell", "frame_id": "l/work/cell"},
    })))
    router = None
    executor = SingleThreadedExecutor()
    try:
        from keyboard_control_router import KeyboardControlRouter

        router = KeyboardControlRouter()
        executor.add_node(peer)
        executor.add_node(router)
        deadline = time.monotonic() + 3.0
        while time.monotonic() < deadline and not router._arms["l"].work_available:
            executor.spin_once(timeout_sec=0.02)

        assert router._arms["l"].work_available is True
    finally:
        for node in (router, peer):
            if node is not None:
                executor.remove_node(node)
                node.destroy_node()
        executor.shutdown()
        if rclpy.ok():
            rclpy.shutdown()


def test_late_accepted_goal_is_cancelled_after_mode_loss():
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile, _ArmState

    class Handle:
        accepted = True

        def __init__(self):
            self.cancelled = False

        def cancel_goal_async(self):
            self.cancelled = True
            future = Future()
            future.set_result(SimpleNamespace())
            return future

    router = KeyboardControlRouter.__new__(KeyboardControlRouter)
    router.mode = ""
    router.input_timeout_ms = 150
    router.input_lost_ms = 1000
    router.get_logger = lambda: SimpleNamespace(error=lambda _message: None, warning=lambda _message: None, info=lambda _message: None)
    profile = _ArmProfile("cell", "l/work/cell", 20, 100, 0.05, 0.25, 0.1, 0.5)
    pending = Future()
    state = _ArmState(SimpleNamespace(), SimpleNamespace(), profile, pending_goal=pending,
                      last_input_at=1.0, work_available=True, cancel_after_accept=True)
    router._arms = {"l": state}
    handle = Handle()
    pending.set_result(handle)

    router._goal_response("l", pending)

    assert handle.cancelled
    assert state.goal_handle is None


def test_keyboard_goal_acceptance_immediately_publishes_cached_work_command():
    """The first driver command must be sent only after WORK selection succeeds."""
    from geometry_msgs.msg import TwistStamped
    from builtin_interfaces.msg import Time
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile, _ArmState

    published = []
    result_future = Future()
    handle = SimpleNamespace(
        accepted=True,
        get_result_async=lambda: result_future,
    )
    pending = Future()
    pending.set_result(handle)
    profile = _ArmProfile("cell", "l/work/cell", 20, 100, 0.05, 0.25, 0.1, 0.5)
    command = TwistStamped()
    command.header.frame_id = profile.frame_id
    command.twist.linear.y = 0.03
    state = _ArmState(
        SimpleNamespace(),
        SimpleNamespace(publish=published.append),
        profile,
        pending_goal=pending,
        latest_command=command,
        last_input_at=time.monotonic(),
        work_available=True,
    )
    router = KeyboardControlRouter.__new__(KeyboardControlRouter)
    router.dry_run = False
    router.mode = "keyboard"
    router.input_timeout_ms = 150
    router.input_lost_ms = 1000
    router._arms = {"l": state}
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _message: None,
        warning=lambda _message: None,
        error=lambda _message: None,
    )
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=12, nanosec=34))
    )

    router._goal_response("l", pending)

    assert len(published) == 1
    assert published[0].header.frame_id == "l/work/cell"
    assert published[0].header.stamp.sec == 12
    assert published[0].twist.linear.y == 0.03


@pytest.fixture
def router_node(request):
    from keyboard_control_router import KeyboardControlRouter
    import rclpy
    from rclpy.node import Node

    rclpy.init(args=["--ros-args", "-p", "coordinate_references:=['l|default_work|1|cell|l/work/cell','r|default_work|1|cell|r/work/cell']",
                     "-p", "cartesian_velocity_profiles:=['l|10|100|0.05|0.25|0.1|0.5|10|2','r|10|100|0.05|0.25|0.1|0.5|10|2']"])
    request.addfinalizer(rclpy.shutdown)
    router = KeyboardControlRouter()
    request.addfinalizer(lambda: Node.destroy_node(router))
    return router


@pytest.fixture
def gripper_router(router_node):
    from std_msgs.msg import Bool, Int32
    from realman_msgs.msg import InputModeState
    router = router_node
    router.dry_run = False
    outputs = {"l": [], "r": []}
    # Replace only external output transport; all mode/readiness gates stay real.
    router._gripper_publishers = {arm: SimpleNamespace(publish=messages.append)
                                   for arm, messages in outputs.items()}
    for arm in outputs:
        router._gripper_health(arm, "connected", Bool(data=True))
        router._gripper_health(arm, "alarm", Int32(data=0))
    router._mode_state(InputModeState(active_mode="keyboard", phase=InputModeState.ACTIVE,
                                     epoch=2, request_id=50))
    yield router, outputs


def gripper_event(router, **changes):
    from std_msgs.msg import String
    payload = {"command": "open", "epoch": 2, "request_id": 50,
               "stamp_ns": router.get_clock().now().nanoseconds}
    payload.update(changes)
    return String(data=json.dumps(payload))


def test_gripper_router_forwards_independent_targets_once_without_work(gripper_router):
    router, outputs = gripper_router
    event = gripper_event(router)
    router._gripper_input("l", event)
    router._gripper_input("l", event)
    router._gripper_input("r", gripper_event(router, command="close"))
    assert [msg.data for msg in outputs["l"]] == [1.0]
    assert [msg.data for msg in outputs["r"]] == [0.0]
    assert not router._arms["l"].work_available
    assert set(router._gripper_publishers) == {"l", "r"}


def test_gripper_router_dry_run_consumes_event_without_later_replay(gripper_router):
    router, outputs = gripper_router
    event = gripper_event(router)
    router.dry_run = True
    router._gripper_input("l", event)
    router.dry_run = False
    router._gripper_input("l", event)
    assert outputs == {"l": [], "r": []}


@pytest.mark.parametrize("changes", [{"command": "stop"}, {"epoch": 1}, {"epoch": True},
                                     {"request_id": 49}, {"stamp_ns": 0}, {"stamp_ns": True},
                                     {"stamp_ns": 9999999999999999999}])
def test_gripper_router_rejects_invalid_or_stale_event(gripper_router, changes):
    router, outputs = gripper_router
    router._gripper_input("l", gripper_event(router, **changes))
    assert outputs["l"] == []


def test_gripper_router_rejects_expired_event_and_malformed_json(gripper_router):
    from std_msgs.msg import String
    router, outputs = gripper_router
    router._gripper_input("l", gripper_event(router,
        stamp_ns=router.get_clock().now().nanoseconds - 151_000_000))
    for invalid in ("not json", "null", "[]", '{}'):
        router._gripper_input("l", String(data=invalid))
    assert outputs["l"] == []


@pytest.mark.parametrize("field,value", [("connected", False), ("alarm", 1)])
def test_gripper_router_checks_health_and_drops_unhealthy_events(gripper_router, field, value):
    from std_msgs.msg import Bool, Int32
    router, outputs = gripper_router
    message_type = Bool if field == "connected" else Int32
    router._gripper_health("l", field, message_type(data=value))
    event = gripper_event(router)
    router._gripper_input("l", event)
    router._gripper_health("l", field, message_type(data=True if field == "connected" else 0))
    router._gripper_input("l", event)
    assert outputs["l"] == []


def test_gripper_router_mode_loss_and_reentry_do_not_replay_or_close(gripper_router):
    from realman_msgs.msg import InputModeState
    router, outputs = gripper_router
    old = gripper_event(router)
    router._mode_state(InputModeState(active_mode="none", phase=InputModeState.ACTIVE,
                                     epoch=3, request_id=51))
    router._gripper_input("l", old)
    router._mode_state(InputModeState(active_mode="keyboard", phase=InputModeState.ACTIVE,
                                     epoch=4, request_id=52))
    router._gripper_input("l", old)
    assert outputs == {"l": [], "r": []}
    router._gripper_input("l", gripper_event(router, epoch=4, request_id=52))
    assert [msg.data for msg in outputs["l"]] == [1.0]


def test_gripper_topics_route_real_dds_messages_and_suppress_dry_run(router_node):
    """Isolated ROS domain/container only; no driver or gripper manager exists."""
    from rclpy.node import Node
    from rclpy.executors import SingleThreadedExecutor
    from rclpy.qos import QoSProfile, QoSDurabilityPolicy
    from realman_msgs.msg import InputModeState
    from std_msgs.msg import Bool, Float32, Int32, String

    router = router_node
    peer = Node("keyboard_gripper_test_peer")
    executor = SingleThreadedExecutor()
    executor.add_node(router)
    executor.add_node(peer)
    outputs = {"l": [], "r": []}
    mode = peer.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state",
        QoSProfile(depth=1, durability=QoSDurabilityPolicy.TRANSIENT_LOCAL))
    ingress, health = {}, []
    for arm, name in (("l", "gripper_left"), ("r", "gripper_right")):
        peer.create_subscription(Float32, f"/{name}/percentage/command",
                                 lambda msg, side=arm: outputs[side].append(msg.data), 1)
        ingress[arm] = peer.create_publisher(String, f"/keyboard/{arm}/gripper_command", 1)
        health.extend((
            (peer.create_publisher(Bool, f"/{name}/connected", 1), Bool(data=True)),
            (peer.create_publisher(Int32, f"/{name}/alarm", 1), Int32(data=0)),
        ))

    def spin_until(predicate):
        deadline = time.monotonic() + 5.0
        while not predicate() and time.monotonic() < deadline:
            executor.spin_once(timeout_sec=0.01)
        assert predicate(), "isolated ROS graph did not reach expected state"

    try:
        spin_until(lambda: all(pub.get_subscription_count() for pub in [mode, *ingress.values(), *(p for p, _ in health)])
                   and all(pub.get_subscription_count() for pub in router._gripper_publishers.values()))
        mode.publish(InputModeState(active_mode="keyboard", phase=InputModeState.ACTIVE, epoch=2, request_id=50))
        for publisher, message in health:
            publisher.publish(message)
        spin_until(lambda: router.mode == "keyboard" and all(s == {"connected": True, "alarm": 0}
                    for s in router._gripper_states.values()))
        assert router.dry_run is True
        ingress["l"].publish(gripper_event(router))
        spin_until(lambda: router._gripper_last_stamp["l"] > 0)
        assert outputs == {"l": [], "r": []}
        router.dry_run = False
        ingress["l"].publish(gripper_event(router))
        ingress["r"].publish(gripper_event(router, command="close"))
        spin_until(lambda: outputs == {"l": [1.0], "r": [0.0]})
    finally:
        executor.remove_node(peer)
        executor.remove_node(router)
        executor.shutdown()
        peer.destroy_node()


# ------------------------------------------------------- session lifecycle


def _session_router(*, goal_active=True, linear_x=0.0, input_ago=0.0, sends=None):
    """A router with one l arm, faking only the ROS transports.

    ``sends`` collects goals if the router asks for a session; when it is None
    the action client has no send_goal_async, so an unexpected second session
    request fails the test.
    """
    from builtin_interfaces.msg import Time
    from geometry_msgs.msg import TwistStamped
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile, _ArmState

    published = []
    cancelled = []

    def cancel_goal_async():
        cancelled.append(True)
        return Future()

    if sends is None:
        client = SimpleNamespace()
    else:
        def send_goal_async(goal):
            sends.append(goal)
            return Future()
        client = SimpleNamespace(server_is_ready=lambda: True, send_goal_async=send_goal_async)

    profile = _ArmProfile("cell", "l/work/cell", 10, 100, 0.05, 0.25, 0.1, 0.5)
    command = TwistStamped()
    command.header.frame_id = profile.frame_id
    command.twist.linear.x = linear_x
    state = _ArmState(
        client,
        SimpleNamespace(publish=published.append),
        profile,
        goal_handle=SimpleNamespace(cancel_goal_async=cancel_goal_async) if goal_active else None,
        latest_command=command,
        last_input_at=time.monotonic() - input_ago,
        work_available=True,
    )
    router = KeyboardControlRouter.__new__(KeyboardControlRouter)
    router.dry_run = False
    router.mode = "keyboard"
    router.input_timeout_ms = 150
    router.input_lost_ms = 1000
    router._arms = {"l": state}
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=lambda _m: None, error=lambda _m: None
    )
    router.get_clock = lambda: SimpleNamespace(
        now=lambda: SimpleNamespace(to_msg=lambda: Time(sec=1, nanosec=0))
    )
    return router, state, published, cancelled


def _twist(frame_id, linear_x=0.0, linear_y=0.0):
    from geometry_msgs.msg import TwistStamped

    message = TwistStamped()
    message.header.frame_id = frame_id
    message.twist.linear.x = linear_x
    message.twist.linear.y = linear_y
    return message


def _is_zero(message):
    twist = message.twist
    return all(
        value == 0.0
        for value in (
            twist.linear.x, twist.linear.y, twist.linear.z,
            twist.angular.x, twist.angular.y, twist.angular.z,
        )
    )


def test_the_session_opens_before_any_key_is_pressed():
    # An empty heartbeat in keyboard mode is enough: the first press must not
    # wait for goal acceptance, WORK selection and movev initialisation.
    sends = []
    router, state, published, cancelled = _session_router(
        goal_active=False, linear_x=0.0, sends=sends
    )
    router._reconcile_arm("l", time.monotonic())
    assert len(sends) == 1
    assert sends[0].follow is True


def test_releasing_the_keys_keeps_the_session_and_streams_zero():
    router, state, published, cancelled = _session_router(linear_x=0.02)
    router._velocity_input("l", _twist("l/work/cell"))
    router._reconcile_arm("l", time.monotonic())
    assert cancelled == []
    assert published and _is_zero(published[-1])


def test_a_long_pause_does_not_end_the_session():
    # There is no idle timeout: however long the keys stay up, a browser that
    # keeps sending empty heartbeats holds the session open.
    router, state, published, cancelled = _session_router(linear_x=0.0)
    state.sessions_started = 1
    for _ in range(50):
        router._velocity_input("l", _twist("l/work/cell"))
        router._reconcile_arm("l", time.monotonic())
    assert cancelled == []
    assert state.goal_handle is not None
    assert all(_is_zero(message) for message in published)


def test_changing_direction_only_changes_the_command():
    router, state, published, cancelled = _session_router(linear_x=0.02)
    router._velocity_input("l", _twist("l/work/cell", 0.0, -0.02))
    router._reconcile_arm("l", time.monotonic())
    router._velocity_input("l", _twist("l/work/cell", -0.02, 0.0))
    router._reconcile_arm("l", time.monotonic())
    assert cancelled == []
    assert published[-2].twist.linear.y == pytest.approx(-0.02)
    assert published[-1].twist.linear.x == pytest.approx(-0.02)


def test_a_late_heartbeat_stops_the_arm_but_keeps_the_session():
    # 150 ms < age < 1 s: a network stall, not a lost browser.
    router, state, published, cancelled = _session_router(linear_x=0.02, input_ago=0.4)
    router._reconcile_arm("l", time.monotonic())
    assert cancelled == []
    assert published and _is_zero(published[-1])


def test_a_lost_browser_releases_the_session():
    router, state, published, cancelled = _session_router(linear_x=0.02, input_ago=1.5)
    router._reconcile_arm("l", time.monotonic())
    assert cancelled == [True]
    assert published and _is_zero(published[-1])


def test_invalid_input_still_stops_the_arm_immediately():
    router, state, published, cancelled = _session_router(linear_x=0.02)
    router._velocity_input("l", _twist("l/work/wrong"))
    assert cancelled == [True]


def test_a_rejected_session_is_retried_after_a_pause_not_every_tick():
    sends = []
    router, state, published, cancelled = _session_router(goal_active=False, sends=sends)
    pending = Future()
    pending.set_result(SimpleNamespace(accepted=False))
    state.pending_goal = pending
    router._goal_response("l", pending)
    router._reconcile_arm("l", time.monotonic())
    assert sends == []
    state.retry_after = 0.0
    router._reconcile_arm("l", time.monotonic())
    assert len(sends) == 1


def test_a_driver_ended_session_is_reopened_after_a_pause():
    from realman_msgs.action import CartesianVelocity

    sends = []
    router, state, published, cancelled = _session_router(sends=sends)
    finished = Future()
    finished.set_result(SimpleNamespace(result=SimpleNamespace(
        success=False,
        message="velocity command watchdog expired",
        terminal_state=CartesianVelocity.Result.WATCHDOG_STOP,
    )))
    router._goal_finished("l", finished)
    assert state.goal_handle is None
    router._reconcile_arm("l", time.monotonic())
    assert sends == []
    assert state.retry_after > time.monotonic()


def test_restarts_within_one_activation_are_counted_and_reset_on_reactivation():
    from realman_msgs.msg import InputModeState

    router, state, published, cancelled = _session_router(goal_active=False)
    warnings = []
    router.get_logger = lambda: SimpleNamespace(
        info=lambda _m: None, warning=warnings.append, error=lambda _m: None
    )
    for _ in range(2):
        pending = Future()
        pending.set_result(SimpleNamespace(
            accepted=True, get_result_async=lambda: Future()
        ))
        state.pending_goal = pending
        router._goal_response("l", pending)
    assert state.sessions_started == 2
    assert any("restart #1" in message for message in warnings)
    router._mode_epoch = 1
    router._mode_request_id = 1
    router._mode_state(InputModeState(active_mode="keyboard", phase=InputModeState.ACTIVE,
                                     epoch=2, request_id=2))
    assert state.sessions_started == 0


def test_input_lost_must_exceed_the_input_timeout():
    from keyboard_control_router import KeyboardControlRouter
    import rclpy

    rclpy.init(args=[
        "--ros-args",
        "-p", "coordinate_references:=['l|default_work|1|cell|l/work/cell','r|default_work|1|cell|r/work/cell']",
        "-p", "cartesian_velocity_profiles:=['l|10|100|0.05|0.25|0.1|0.5|10|2','r|10|100|0.05|0.25|0.1|0.5|10|2']",
        "-p", "input_timeout_ms:=150",
        "-p", "input_lost_ms:=100",
    ])
    try:
        with pytest.raises(ValueError, match="input_lost_ms must exceed"):
            KeyboardControlRouter()
    finally:
        rclpy.shutdown()


def test_a_period_above_high_follow_is_refused_at_startup_not_on_first_press():
    from keyboard_control_router import KeyboardControlRouter
    import rclpy

    rclpy.init(args=[
        "--ros-args",
        "-p", "coordinate_references:=['l|default_work|1|cell|l/work/cell','r|default_work|1|cell|r/work/cell']",
        "-p", "cartesian_velocity_profiles:=['l|20|100|0.05|0.25|0.1|0.5|10|2','r|20|100|0.05|0.25|0.1|0.5|10|2']",
    ])
    try:
        with pytest.raises(ValueError, match="high-follow requires"):
            KeyboardControlRouter()
    finally:
        rclpy.shutdown()
