"""The :8770 bridge's own parameters must sit under /recording_web_bridge.

A parameter placed in the recorder's section is silently ignored by the bridge:
it keeps its [""] default and the dashboard loses that input with no error.
"""
from pathlib import Path

import yaml

ROOT = Path(__file__).parents[4]


def _bridge_params():
    config = yaml.safe_load((ROOT / "config" / "ros" / "recording.yaml").read_text(encoding="utf-8"))
    return config["/recording_web_bridge"]["ros__parameters"], config["/recording_recorder"]["ros__parameters"]


def test_gripper_limits_topics_configure_the_web_bridge():
    bridge, recorder = _bridge_params()
    assert bridge["gripper_limits_topics"] == ["/gripper_left/limits", "/gripper_mid/limits", "/gripper_right/limits"]
    assert "gripper_limits_topics" not in recorder


def test_pika_topics_configure_the_web_bridge():
    bridge, recorder = _bridge_params()
    assert bridge["pika_sides"] == ["l", "r"]
    assert len(bridge["pika_pose_topics"]) == len(bridge["pika_sides"])
    assert not any(key.startswith("pika_") for key in recorder)


def test_camera_rate_health_configures_the_web_bridge():
    bridge, recorder = _bridge_params()
    expected = bridge["camera_expected_fps"]
    assert all(isinstance(value, float) and value > 0 for value in expected)
    assert len(expected) in (1, len(bridge["camera_ids"]))
    assert bridge["camera_stale_after_sec"] > 0
    assert 0 < bridge["camera_low_fps_ratio"] <= 1
    assert not any(key.startswith("camera_rate") or key.startswith("camera_stale") for key in recorder)
