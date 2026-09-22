"""Unit tests for dispatcher and gripper_publisher."""

from __future__ import annotations

import math

from builtin_interfaces.msg import Time

from policy_bridge.action.dispatcher import Dispatcher, euler_to_quaternion, sides_for
from policy_bridge.action.smoother import LowPassSmoother
from policy_bridge.config_loader import (
    DownlinkConfig,
    GripperDownlink,
    PositionDownlink,
    TwistScale,
    VelocityDownlink,
)
from policy_bridge.gripper.gripper_publisher import GripperPublisher


class _FakePublisher:
    def __init__(self) -> None:
        self.messages: list = []

    def publish(self, msg) -> None:
        self.messages.append(msg)


class _FakeNode:
    def __init__(self) -> None:
        self.publishers: dict[tuple, _FakePublisher] = {}

    def create_publisher(self, msg_type, topic, qos) -> _FakePublisher:
        pub = _FakePublisher()
        self.publishers[(msg_type, topic)] = pub
        return pub


def _downlink_cfg() -> DownlinkConfig:
    return DownlinkConfig(
        command_namespace="/pi05_policy",
        publish_rate_hz=50.0,
        smoothing_alpha=0.6,
        velocity=VelocityDownlink(
            twist_scale=TwistScale(linear=0.2, angular=0.6),
            frame_ids={"left": "l_base_link", "right": "r_base_link"},
        ),
        position=PositionDownlink(
            pose_format="xyz_euler",
            position_unit="m",
            angle_unit="rad",
            frame_ids={"left": "l_base_link", "right": "r_base_link"},
        ),
        gripper=GripperDownlink(
            topic_left="/pi05_policy/l/gripper_percentage",
            topic_right="/pi05_policy/r/gripper_percentage",
            clamp=(0.0, 1.0),
            smoothing_alpha=0.3,
        ),
    )


def _stamp() -> Time:
    return Time(sec=12, nanosec=34)


def test_sides_for_maps_positionally():
    assert sides_for(("l", "r")) == {"left": "l", "right": "r"}


def test_velocity_publish_scales_and_sets_frame_and_stamp():
    node = _FakeNode()
    disp = Dispatcher(node, _downlink_cfg(), ("l", "r"))
    action6 = [1.0, -1.0, 0.5, 0.0, 0.5, -0.5]
    published = disp.publish_arm("velocity", "left", action6, _stamp())
    assert published is True
    from geometry_msgs.msg import TwistStamped

    msg = node.publishers[(TwistStamped, "/pi05_policy/l/cartesian_velocity")].messages[-1]
    assert msg.header.frame_id == "l_base_link"
    assert msg.header.stamp.sec == 12
    assert math.isclose(msg.twist.linear.x, 0.2)       # 1.0 * linear scale
    assert math.isclose(msg.twist.linear.y, -0.2)
    assert math.isclose(msg.twist.linear.z, 0.1)       # 0.5 * 0.2
    assert math.isclose(msg.twist.angular.y, 0.3)      # 0.5 * angular scale
    assert math.isclose(msg.twist.angular.z, -0.3)


def test_inactive_publishes_nothing():
    node = _FakeNode()
    disp = Dispatcher(node, _downlink_cfg(), ("l", "r"))
    assert disp.publish_arm("inactive", "left", [0] * 6, _stamp()) is False
    from geometry_msgs.msg import TwistStamped

    assert node.publishers[(TwistStamped, "/pi05_policy/l/cartesian_velocity")].messages == []


def test_position_pose_euler_to_quaternion():
    node = _FakeNode()
    disp = Dispatcher(node, _downlink_cfg(), ("l", "r"))
    # Pure yaw = pi/2 -> quaternion z ~ sin(pi/4), w ~ cos(pi/4)
    msg = disp.build_pose("right", [0.1, 0.2, 0.3, 0.0, 0.0, math.pi / 2], _stamp())
    assert msg.header.frame_id == "r_base_link"
    assert math.isclose(msg.pose.position.x, 0.1)
    assert math.isclose(msg.pose.orientation.z, math.sin(math.pi / 4), abs_tol=1e-6)
    assert math.isclose(msg.pose.orientation.w, math.cos(math.pi / 4), abs_tol=1e-6)


def test_euler_to_quaternion_identity():
    x, y, z, w = euler_to_quaternion(0.0, 0.0, 0.0)
    assert math.isclose(w, 1.0)
    assert math.isclose(x, 0.0, abs_tol=1e-9)


def test_gripper_clamps_and_publishes():
    node = _FakeNode()
    grip = GripperPublisher(node, _downlink_cfg().gripper)
    grip.publish("left", 2.0)   # over range -> clamp to 1.0
    from std_msgs.msg import Float32

    msg = node.publishers[(Float32, "/pi05_policy/l/gripper_percentage")].messages[-1]
    assert math.isclose(msg.data, 1.0)

    grip.publish("left", -3.0)  # below range -> clamp to 0.0 first, then smoothed
    assert 0.0 <= node.publishers[(Float32, "/pi05_policy/l/gripper_percentage")].messages[-1].data <= 1.0


def test_gripper_reset_cache_clears_smoothing():
    grip = GripperPublisher(None, _downlink_cfg().gripper)
    first = grip.publish("left", 1.0)
    assert math.isclose(first, 1.0)  # first sample passes through
    second = grip.publish("left", 0.0)
    assert second < 1.0              # smoothed toward 0
    grip.reset_cache()
    after_reset = grip.publish("left", 0.0)
    assert math.isclose(after_reset, 0.0)  # cache cleared -> passes through


def test_smoother_first_sample_passthrough():
    smoother = LowPassSmoother(0.5)
    assert smoother.apply([10.0]).tolist() == [10.0]
    out = smoother.apply([0.0]).tolist()
    assert math.isclose(out[0], 5.0)  # 0.5*0 + 0.5*10
