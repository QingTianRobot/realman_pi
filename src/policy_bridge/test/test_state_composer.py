"""Unit tests for policy_bridge.observation.state_composer."""

from __future__ import annotations

import numpy as np
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
