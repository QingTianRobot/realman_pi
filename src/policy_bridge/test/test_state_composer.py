"""Unit tests for policy_bridge.observation.state_composer."""

from __future__ import annotations

import numpy as np
import pytest
import yaml

from policy_bridge.config_loader import StateConfig
from policy_bridge.observation.state_composer import (
    StateComposer,
    gripper_name_from_topic,
    load_gripper_limits,
    position_to_percentage,
)


def _state_cfg(gripper_config: str) -> StateConfig:
    return StateConfig(
        joint_state_topics={"left": "/l/joint_states", "right": "/r/joint_states"},
        gripper_position_topics={"left": "/gripper_left/position", "right": "/gripper_right/position"},
        gripper_config=gripper_config,
        expected_dim=7,
    )


def _write_gripper_yaml(tmp_path) -> str:
    path = tmp_path / "gripper.yaml"
    path.write_text(
        yaml.safe_dump(
            {
                "buses": [
                    {"port": "/dev/x", "grippers": [
                        {"name": "gripper_left", "open_position": 400, "close_position": 949},
                        {"name": "gripper_right", "open_position": 4000, "close_position": 12000},
                    ]}
                ]
            }
        ),
        encoding="utf-8",
    )
    return str(path)


def test_position_to_percentage_maps_close_zero_open_one():
    # left: open=400, close=949
    assert position_to_percentage(949, 400, 949) == 0.0
    assert position_to_percentage(400, 400, 949) == 1.0
    assert abs(position_to_percentage(674.5, 400, 949) - 0.5) < 1e-6


def test_position_to_percentage_clips_out_of_range():
    assert position_to_percentage(2000, 400, 949) == 0.0   # beyond close
    assert position_to_percentage(0, 400, 949) == 1.0       # beyond open


def test_gripper_name_from_topic():
    assert gripper_name_from_topic("/gripper_left/position") == "gripper_left"


def test_load_gripper_limits(tmp_path):
    limits = load_gripper_limits(_write_gripper_yaml(tmp_path))
    assert limits["gripper_left"] == (400, 949)
    assert limits["gripper_right"] == (4000, 12000)


def test_load_gripper_limits_missing_file_returns_empty(tmp_path):
    assert load_gripper_limits(tmp_path / "nope.yaml") == {}


def test_compose_returns_none_without_joints(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    assert composer.compose("left") is None


def test_compose_returns_none_with_short_joints(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_joint("left", [0.1, 0.2, 0.3])  # fewer than 6
    assert composer.compose("left") is None


def test_compose_packs_seven_dims(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_joint("left", [1, 2, 3, 4, 5, 6, 7])  # extra joints ignored
    composer.update_gripper_position("left", 949.0)        # close -> 0.0
    state = composer.compose("left")
    assert state is not None
    assert state.shape == (7,)
    assert state.dtype == np.float32
    assert state[0:6].tolist() == [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
    assert float(state[6]) == 0.0


def test_compose_gripper_percentage_from_device_units(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_joint("right", [0, 0, 0, 0, 0, 0])
    composer.update_gripper_position("right", 4000.0)  # open -> 1.0
    state = composer.compose("right")
    assert abs(float(state[6]) - 1.0) < 1e-6


def test_compose_defaults_gripper_when_limits_missing(tmp_path):
    # No gripper.yaml -> limits empty; gripper sample still maps to 0.0 placeholder.
    composer = StateComposer(None, _state_cfg(str(tmp_path / "missing.yaml")))
    composer.update_joint("left", [0, 0, 0, 0, 0, 0])
    state = composer.compose("left")
    assert state is not None
    assert float(state[6]) == 0.0


def test_update_limits_changes_the_percentage_mapping(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_joint("left", [0, 0, 0, 0, 0, 0])
    composer.update_gripper_position("left", 674.5)  # gripper.yaml: 400..949 -> 0.5
    assert abs(float(composer.compose("left")[6]) - 0.5) < 1e-6
    composer.update_limits("gripper_left", 20, 900)  # endpoints edited from the web UI
    composer.update_gripper_position("left", 460.0)  # (460 - 900) / (20 - 900) = 0.5
    assert abs(float(composer.compose("left")[6]) - 0.5) < 1e-6
    composer.update_gripper_position("left", 20.0)   # new open position -> 1.0
    assert abs(float(composer.compose("left")[6]) - 1.0) < 1e-6


def test_update_limits_works_without_a_gripper_yaml(tmp_path):
    composer = StateComposer(None, _state_cfg(str(tmp_path / "missing.yaml")))
    composer.update_joint("right", [0, 0, 0, 0, 0, 0])
    composer.update_limits("gripper_right", 50, 8500)
    composer.update_gripper_position("right", 50.0)
    assert abs(float(composer.compose("right")[6]) - 1.0) < 1e-6


def test_update_limits_ignores_a_degenerate_span(tmp_path):
    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer.update_limits("gripper_left", 500, 500)
    assert composer._limits["gripper_left"] == (400, 949)  # yaml endpoints untouched
    composer.update_joint("left", [0, 0, 0, 0, 0, 0])
    composer.update_gripper_position("left", 674.5)  # yaml 400..949 -> 0.5 (degenerate span would give 0.0)
    assert abs(float(composer.compose("left")[6]) - 0.5) < 1e-6


def test_on_limits_forwards_the_message_fields(tmp_path):
    from types import SimpleNamespace

    composer = StateComposer(None, _state_cfg(_write_gripper_yaml(tmp_path)))
    composer._on_limits(
        "gripper_left",
        SimpleNamespace(open_position=20, close_position=900, min_position=0, max_position=900),
    )
    assert composer._limits["gripper_left"] == (20, 900)


def test_composer_subscribes_to_latched_limits_topics(tmp_path):
    pytest.importorskip("rclpy")
    pytest.importorskip("gripper_ros2_msgs")
    from gripper_ros2_msgs.msg import GripperLimits
    from rclpy.qos import QoSDurabilityPolicy, QoSReliabilityPolicy

    class RecordingNode:
        def __init__(self):
            self.subscriptions = []

        def create_subscription(self, msg_type, topic, callback, qos):
            self.subscriptions.append((msg_type, topic, callback, qos))
            return object()

    node = RecordingNode()
    composer = StateComposer(node, _state_cfg(_write_gripper_yaml(tmp_path)))
    limits = {topic: (msg_type, callback, qos) for msg_type, topic, callback, qos in node.subscriptions
              if topic.endswith("/limits")}
    assert set(limits) == {"/gripper_left/limits", "/gripper_right/limits"}
    msg_type, callback, qos = limits["/gripper_left/limits"]
    assert msg_type is GripperLimits
    assert qos.durability == QoSDurabilityPolicy.TRANSIENT_LOCAL
    assert qos.reliability == QoSReliabilityPolicy.RELIABLE
    assert qos.depth == 1
    callback(GripperLimits(open_position=20, close_position=900, min_position=0, max_position=900))
    assert composer._limits["gripper_left"] == (20, 900)
