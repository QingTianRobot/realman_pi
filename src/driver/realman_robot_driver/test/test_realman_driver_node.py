import ast
import importlib.util
import math
from pathlib import Path

import pytest


NODE_PATH = (
    Path(__file__).resolve().parents[1]
    / "realman_robot_driver"
    / "realman_driver_node.py"
)


def _has_module(name: str) -> bool:
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ModuleNotFoundError, ValueError):
        return False


ROS_ACTION_RUNTIME_AVAILABLE = all(
    _has_module(name)
    for name in ("rclpy", "sensor_msgs.msg", "realman_msgs.action")
)

if ROS_ACTION_RUNTIME_AVAILABLE:
    import rclpy

    from rclpy.callback_groups import ReentrantCallbackGroup
    from realman_robot_driver.realman_driver_node import RealManDriverNode
    from realman_robot_driver.realman_sdk_adapter import RobotState
    from sensor_msgs.msg import JointState
else:
    rclpy = None
    ReentrantCallbackGroup = None
    RealManDriverNode = None
    RobotState = None
    JointState = None


requires_ros_action_runtime = pytest.mark.skipif(
    not ROS_ACTION_RUNTIME_AVAILABLE,
    reason="generated realman_msgs and the ROS 2 Python runtime are required",
)


def test_main_uses_multithreaded_executor_instead_of_rclpy_spin():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    imported_names = {
        alias.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.Import, ast.ImportFrom))
        for alias in node.names
    }
    calls = [node.func for node in ast.walk(tree) if isinstance(node, ast.Call)]

    assert "MultiThreadedExecutor" in imported_names
    assert any(
        isinstance(function, ast.Name) and function.id == "MultiThreadedExecutor"
        for function in calls
    )
    assert not any(
        isinstance(function, ast.Attribute)
        and isinstance(function.value, ast.Name)
        and function.value.id == "rclpy"
        and function.attr == "spin"
        for function in calls
    )


def test_node_source_registers_execute_motion_action_with_all_lifecycle_callbacks():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "ActionServer(" in source
    assert '"execute_motion"' in source
    assert "execute_callback=self.motion_coordinator.execute" in source
    assert "goal_callback=self.motion_coordinator.goal_callback" in source
    assert "cancel_callback=self.motion_coordinator.cancel_callback" in source
    assert "handle_accepted_callback=self.motion_coordinator.accepted_callback" in source
    assert "callback_group=self.motion_callback_group" in source


def test_node_source_stops_coordinator_before_adapter_disconnect():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    destroy = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "destroy_node"
    )
    calls = [
        ast.unparse(node.func)
        for node in ast.walk(destroy)
        if isinstance(node, ast.Call)
    ]

    assert calls.index("self.motion_coordinator.shutdown") < calls.index(
        "self.adapter.disconnect"
    )


def test_stop_service_delegates_fast_stop_to_coordinator():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    stop = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "_stop"
    )
    calls = [ast.unparse(node.func) for node in ast.walk(stop) if isinstance(node, ast.Call)]

    assert "self.motion_coordinator.fast_stop" in calls
    assert "self.adapter.stop" not in calls


@requires_ros_action_runtime
def test_mock_node_constructs_and_exposes_services():
    rclpy.init()
    node = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="127.0.0.1"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ]
        )
        service_names = {service.srv_name for service in node.services}

        assert node.get_name() == "realman_driver"
        assert {"connect", "disconnect", "stop", "status"} <= service_names
        assert node.adapter.arm_id == "l"
        assert isinstance(node.motion_callback_group, ReentrantCallbackGroup)
        assert ("/l/execute_motion", ["realman_msgs/action/ExecuteMotion"]) in (
            node.get_action_names_and_types()
        )
    finally:
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()

@requires_ros_action_runtime
def test_vendor_degrees_are_published_as_ros_radians():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ]
        )
        listener = rclpy.create_node("joint_state_test_listener")
        received = []
        listener.create_subscription(
            JointState,
            "/joint_states",
            received.append,
            10,
        )
        node.adapter.get_state = lambda: RobotState(
            (0.0, 90.0, -90.0, 180.0, 45.0, -45.0),
            True,
            "RM65-B",
            0,
        )

        node._publish_state()
        for _ in range(10):
            rclpy.spin_once(listener, timeout_sec=0.1)
            if received:
                break

        assert received
        assert received[0].name == [f"joint_{index}" for index in range(1, 7)]
        assert received[0].position == pytest.approx(
            [0.0, math.pi / 2, -math.pi / 2, math.pi, math.pi / 4, -math.pi / 4]
        )
    finally:
        if listener is not None:
            listener.destroy_node()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()

@requires_ros_action_runtime
def test_auto_connect_mock_mode_publishes_zero_state():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=True),
            ]
        )
        listener = rclpy.create_node("mock_joint_state_test_listener")
        received = []
        listener.create_subscription(
            JointState,
            "/joint_states",
            received.append,
            10,
        )

        node._publish_state()
        for _ in range(10):
            rclpy.spin_once(listener, timeout_sec=0.1)
            if received:
                break

        assert node.adapter.connected
        assert node.adapter._event_callback == node.motion_coordinator.handle_event
        assert received
        assert received[0].position == pytest.approx([0.0] * 6)
    finally:
        if listener is not None:
            listener.destroy_node()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()


@requires_ros_action_runtime
def test_node_fails_closed_for_unknown_namespace_and_nontriple_thread_mode():
    rclpy.init()
    nodes = []
    try:
        with pytest.raises(ValueError, match="namespace"):
            nodes.append(
                RealManDriverNode(
                    namespace="unknown",
                    parameter_overrides=[
                        rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                        rclpy.parameter.Parameter("mock_mode", value=True),
                        rclpy.parameter.Parameter("auto_connect", value=False),
                    ],
                )
            )
        with pytest.raises(ValueError, match="RM_TRIPLE_MODE_E"):
            nodes.append(
                RealManDriverNode(
                    namespace="l",
                    parameter_overrides=[
                        rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                        rclpy.parameter.Parameter("thread_mode", value="RM_DUAL_MODE_E"),
                        rclpy.parameter.Parameter("mock_mode", value=True),
                        rclpy.parameter.Parameter("auto_connect", value=False),
                    ],
                )
            )
    finally:
        for node in nodes:
            node.destroy_node()
        rclpy.shutdown()
