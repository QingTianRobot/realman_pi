"""Single source of truth for the topics and ROS types the recorder archives to MCAP.

The recorder subscribes to a fixed set of driver/gripper outputs and must hand rosbag2
the *ROS type string* of every topic it records.  Keeping that name→type→type-name
mapping here — rather than inline in ``recorder_node`` — makes the recording contract
explicit, unit-testable without hardware, and impossible for the two consumers to
drift apart when an input is added or renamed.

The read-only Web bridge subscribes to a display-relevant subset of these same topics;
see its module docstring for why it does not consume this catalog.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

from geometry_msgs.msg import TwistStamped
from realman_msgs.msg import CartesianVelocityState
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool, Float64, Int32, String
from tf2_msgs.msg import TFMessage


# type_name → message class, for offline readers (e.g. ``replay``) that must deserialize
# a recorded message by its ROS type string rather than a statically known import.
TYPE_REGISTRY: dict[str, Any] = {
    "sensor_msgs/msg/JointState": JointState,
    "std_msgs/msg/Bool": Bool,
    "std_msgs/msg/String": String,
    "std_msgs/msg/Float64": Float64,
    "std_msgs/msg/Int32": Int32,
    "tf2_msgs/msg/TFMessage": TFMessage,
    "geometry_msgs/msg/TwistStamped": TwistStamped,
    "realman_msgs/msg/CartesianVelocityState": CartesianVelocityState,
}


@dataclass(frozen=True)
class TopicSpec:
    """One recording input: its topic name, message class, and ROS type string."""

    topic: str
    message_type: Any
    type_name: str


def build_topic_catalog(
    arm_namespaces: Iterable[str],
    *,
    arm_action_topics: Iterable[str] = (),
    arm_velocity_topics: Iterable[str] = (),
    gripper_position_topics: Iterable[str] = (),
    gripper_action_topics: Iterable[str] = (),
    gripper_torque_topics: Iterable[str] = (),
    gripper_alarm_topics: Iterable[str] = (),
) -> dict[str, TopicSpec]:
    """Build the ordered topic→spec map for one set of recording inputs.

    Every arm contributes ``/{arm}/joint_states``, ``/{arm}/connected`` and
    ``/{arm}/coordinates/state``, plus the shared ``/tf`` transform feed.  Cartesian
    command and gripper topics are taken verbatim from configuration, so they are
    never hard-coded to a fixed arm or gripper count.
    """
    catalog: dict[str, TopicSpec] = {}

    def add(topic: str, message_type: Any, type_name: str) -> None:
        if not topic.startswith("/") or topic == "/" or any(part in {"", ".", ".."} for part in topic.split("/")[1:]):
            raise ValueError(f"recording topic must be an absolute normalized name: {topic!r}")
        previous = catalog.get(topic)
        if previous is not None and previous.type_name != type_name:
            raise ValueError(f"topic {topic!r} configured with conflicting message types")
        if previous is not None:
            return
        catalog[topic] = TopicSpec(topic, message_type, type_name)

    for arm in arm_namespaces:
        if not isinstance(arm, str) or not arm or "/" in arm:
            raise ValueError(f"arm namespace must be a non-empty path segment: {arm!r}")
        add(f"/{arm}/joint_states", JointState, "sensor_msgs/msg/JointState")
        add(f"/{arm}/connected", Bool, "std_msgs/msg/Bool")
        add(f"/{arm}/coordinates/state", String, "std_msgs/msg/String")
    add("/tf", TFMessage, "tf2_msgs/msg/TFMessage")
    for topic in arm_action_topics:
        if str(topic):
            add(str(topic), TwistStamped, "geometry_msgs/msg/TwistStamped")
    for topic in arm_velocity_topics:
        if str(topic):
            add(str(topic), CartesianVelocityState, "realman_msgs/msg/CartesianVelocityState")
    for topic in gripper_position_topics:
        if str(topic):
            add(str(topic), Float64, "std_msgs/msg/Float64")
    # Command observations are recorded only when explicitly configured.  They are
    # never published by this read-only recorder, and must not be inferred from a
    # position feedback stream during LeRobot export.
    for topic in gripper_action_topics:
        if str(topic):
            add(str(topic), Float64, "std_msgs/msg/Float64")
    for topic in gripper_torque_topics:
        if str(topic):
            add(str(topic), Bool, "std_msgs/msg/Bool")
    for topic in gripper_alarm_topics:
        if str(topic):
            add(str(topic), Int32, "std_msgs/msg/Int32")
    return catalog
