from pathlib import Path

import pytest

from realman_web_control.keyboard_control import load_keyboard_control_config


ROOT = Path(__file__).parents[4]


def load_config():
    return load_keyboard_control_config(
        ROOT / "config/ros/keyboard_control.yaml",
        ROOT / "config/ros/realman_motion.yaml",
        ROOT / "config/ros/realman_coordinates.yaml",
    )


def test_config_maps_independent_physical_keys_to_bounded_work_commands():
    config = load_config()
    assert tuple(config.arms) == ("l", "r")
    assert config.heartbeat_period_ms == 50
    assert config.input_timeout_ms == 150
    command = config.command("l", frozenset({"KeyW", "KeyD", "KeyQ"}))
    assert command.linear == pytest.approx((0.02, -0.02, 0.0))
    assert command.angular == pytest.approx((0.10, 0.0, 0.0))
    assert command.reference_name == "cell"
    assert command.frame_id == "l/work/cell"


def test_opposite_keys_cancel_and_middle_arm_is_rejected():
    config = load_config()
    command = config.command("r", frozenset({"KeyI", "KeyK"}))
    assert command.linear == (0.0, 0.0, 0.0)
    with pytest.raises(ValueError, match="l or r"):
        config.command("m", frozenset())
