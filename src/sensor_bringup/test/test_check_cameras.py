"""Tests for enabled-side filtering in check_cameras.py.

Only the pure config-to-topic mapping is exercised; no ROS node is started.
Needs a sourced ROS 2 environment (rclpy, sensor_msgs); skipped elsewhere.
"""

import importlib.util
from pathlib import Path

import pytest

pytest.importorskip("rclpy")
pytest.importorskip("sensor_msgs")

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check_cameras.py"


@pytest.fixture(scope="module")
def mod():
    spec = importlib.util.spec_from_file_location("check_cameras", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_enabled_topics_drops_disabled_side(mod):
    config = {
        "wrist_cameras": {
            "devices": {
                "left": {"serial": "L"},
                "middle": {"serial": "M", "enabled": False},
                "right": {"serial": "R"},
            },
        },
        "global_camera": {"enabled": True},
    }
    topics = mod._enabled_topics(config)
    assert set(topics) == {"left", "right", "d435"}
    assert "middle" not in topics


def test_enabled_topics_defaults_every_camera_on(mod):
    config = {"wrist_cameras": {"devices": {}}, "global_camera": {}}
    assert set(mod._enabled_topics(config)) == {"left", "middle", "right", "d435"}


def test_enabled_topics_respects_global_camera_off(mod):
    config = {"wrist_cameras": {"devices": {}}, "global_camera": {"enabled": False}}
    topics = mod._enabled_topics(config)
    assert "d435" not in topics
    assert set(topics) == {"left", "middle", "right"}
