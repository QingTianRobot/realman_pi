import math

import pytest


rclpy = pytest.importorskip("rclpy")

from realman_robot_driver.realman_driver_node import RealManDriverNode
from realman_robot_driver.realman_sdk_adapter import RobotState
from sensor_msgs.msg import JointState


def test_mock_node_constructs_and_exposes_services():
    rclpy.init()
    node = None
    try:
        node = RealManDriverNode(
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="127.0.0.1"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ]
        )
        service_names = {service.srv_name for service in node.services}

        assert node.get_name() == "realman_driver"
        assert {"connect", "disconnect", "stop", "status"} <= service_names
    finally:
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()


def test_vendor_degrees_are_published_as_ros_radians():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
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


def test_auto_connect_mock_mode_publishes_zero_state():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
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
        assert received
        assert received[0].position == pytest.approx([0.0] * 6)
    finally:
        if listener is not None:
            listener.destroy_node()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()
