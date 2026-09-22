"""Unit tests for policy_bridge.config_loader."""

from __future__ import annotations

import copy

import pytest

from policy_bridge.config_loader import ConfigError, load, parse_config, _expand_env


def _valid_document() -> dict:
    return {
        "arm_names": ["l", "r"],
        "network": {
            "server_host": "127.0.0.1",
            "server_port": 8766,
            "connect_timeout_s": 3.0,
            "infer_timeout_s": 1.5,
            "reconnect_backoff": {"initial_s": 0.5, "max_s": 8.0, "factor": 2.0},
            "inference_threads": 2,
        },
        "observation": {
            "image_topics": [
                {"name": "wrist_image", "topic": "/camera_left/color/image_raw",
                 "encoding": "rgb8", "resize": [480, 640], "enabled": True},
                {"name": "global_image", "topic": "/camera_middle/color/image_raw",
                 "encoding": "rgb8", "resize": [480, 640], "enabled": True},
            ],
            "image_sync": {"mode": "approximate", "slop_s": 0.05},
            "state": {
                "joint_state_topics": {"left": "/l/joint_states", "right": "/r/joint_states"},
                "gripper_position_topics": {"left": "/gripper_left/position", "right": "/gripper_right/position"},
                "gripper_config": "/opt/rm65_ws/config/ros/gripper.yaml",
            },
            "state_expected_dim": 7,
        },
        "prompt": {"initial": "pick", "topic": "/policy/prompt", "on_change_clear_queue": True},
        "action": {
            "action_horizon": 16, "action_dim": 7, "steps_per_inference": 4,
            "inference_lead_steps": 2, "action_clip": [-1.0, 1.0],
        },
        "downlink": {
            "command_namespace": "/pi05_policy",
            "publish_rate_hz": 50.0,
            "smoothing_alpha": 0.6,
            "velocity": {
                "twist_scale": {"linear": 0.2, "angular": 0.6},
                "frame_ids": {"left": "l_base_link", "right": "r_base_link"},
            },
            "position": {
                "pose_format": "xyz_euler", "position_unit": "m", "angle_unit": "rad",
                "frame_ids": {"left": "l_base_link", "right": "r_base_link"},
            },
            "gripper": {
                "topic_left": "/pi05_policy/l/gripper_percentage",
                "topic_right": "/pi05_policy/r/gripper_percentage",
                "clamp": [0.0, 1.0], "smoothing_alpha": 0.3,
            },
        },
        "mode": {
            "topic": "/realman_bt_executor/input_mode_state",
            "mapping": {
                "velocity_modes": ["policy"], "position_modes": [],
                "inactive_modes": ["web", "pika", "none"],
            },
            "default_when_unknown": "inactive",
        },
        "lifecycle": {
            "services": {
                "activate": "/policy/activate", "deactivate": "/policy/deactivate",
                "emergency_stop": "/policy/emergency_stop", "set_prompt": "/policy/set_prompt",
                "force_infer": "/policy/force_infer",
            }
        },
        "stats": {"topic": "/policy/stats", "publish_period_s": 1.0, "failure_pause_threshold": 5},
    }


def test_valid_document_parses():
    cfg = parse_config(_valid_document())
    assert cfg.arm_names == ("l", "r")
    assert cfg.network.url == "ws://127.0.0.1:8766"
    assert cfg.action.action_dim == 7
    assert cfg.downlink.command_namespace == "/pi05_policy"
    assert cfg.mode.mapping.velocity_modes == frozenset({"policy"})
    assert cfg.stats.failure_pause_threshold == 5


def test_env_expansion_uses_default_and_environment(monkeypatch):
    assert _expand_env("${MISSING_VAR:-fallback}") == "fallback"
    monkeypatch.setenv("POLICY_TEST_VAR", "from-env")
    assert _expand_env("${POLICY_TEST_VAR:-fallback}") == "from-env"
    assert _expand_env({"host": "${POLICY_TEST_VAR:-x}"}) == {"host": "from-env"}


def test_no_enabled_image_is_rejected():
    doc = _valid_document()
    for image in doc["observation"]["image_topics"]:
        image["enabled"] = False
    with pytest.raises(ConfigError, match="enabled=true"):
        parse_config(doc)


def test_state_expected_dim_must_be_seven():
    doc = _valid_document()
    doc["observation"]["state_expected_dim"] = 13
    with pytest.raises(ConfigError, match="state_expected_dim"):
        parse_config(doc)


def test_action_dim_must_be_seven():
    doc = _valid_document()
    doc["action"]["action_dim"] = 14
    with pytest.raises(ConfigError, match="action_dim"):
        parse_config(doc)


def test_namespace_must_start_with_slash():
    doc = _valid_document()
    doc["downlink"]["command_namespace"] = "pi05_policy"
    with pytest.raises(ConfigError, match="command_namespace"):
        parse_config(doc)


def test_overlapping_mode_sets_rejected():
    doc = _valid_document()
    doc["mode"]["mapping"]["inactive_modes"] = ["policy", "none"]
    with pytest.raises(ConfigError, match="must not overlap"):
        parse_config(doc)


def test_smoothing_alpha_out_of_range_rejected():
    for bad in (0.0, 1.5, -0.2):
        doc = _valid_document()
        doc["downlink"]["smoothing_alpha"] = bad
        with pytest.raises(ConfigError, match="smoothing_alpha"):
            parse_config(doc)


def test_missing_frame_id_rejected():
    doc = _valid_document()
    doc["downlink"]["velocity"]["frame_ids"] = {"left": "l_base_link"}
    with pytest.raises(ConfigError, match="frame_ids.right"):
        parse_config(doc)


def test_publish_rate_must_be_positive():
    doc = _valid_document()
    doc["downlink"]["publish_rate_hz"] = 0
    with pytest.raises(ConfigError, match="publish_rate_hz"):
        parse_config(doc)


def test_steps_per_inference_within_horizon():
    doc = _valid_document()
    doc["action"]["steps_per_inference"] = 32
    with pytest.raises(ConfigError, match="steps_per_inference"):
        parse_config(doc)


def test_backoff_max_below_initial_rejected():
    doc = _valid_document()
    doc["network"]["reconnect_backoff"] = {"initial_s": 5.0, "max_s": 1.0, "factor": 2.0}
    with pytest.raises(ConfigError, match="max_s"):
        parse_config(doc)


def test_load_missing_file_raises(tmp_path):
    with pytest.raises(ConfigError, match="not found"):
        load(tmp_path / "does_not_exist.yaml")


def test_load_roundtrips_yaml(tmp_path):
    import yaml

    path = tmp_path / "policy_bridge.yaml"
    path.write_text(yaml.safe_dump(_valid_document()), encoding="utf-8")
    cfg = load(path)
    assert cfg.source_path == str(path)
    assert cfg.mode.default_when_unknown == "inactive"
