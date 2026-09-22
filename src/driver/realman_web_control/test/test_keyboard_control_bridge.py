from pathlib import Path

import pytest

from realman_web_control.keyboard_control import load_keyboard_control_config
from realman_web_control.keyboard_control_bridge import KeyboardControlBridge
from realman_web_control.protocol import ProtocolError

ROOT = Path(__file__).parents[4]


@pytest.fixture
def config():
    return load_keyboard_control_config(
        ROOT / "config/ros/keyboard_control.yaml",
        ROOT / "config/ros/realman_motion.yaml",
        ROOT / "config/ros/realman_coordinates.yaml",
    )


def test_only_active_owner_can_advance_each_arm_sequence(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("browser-a")
    command = bridge.command("browser-a", {"arm": "l", "keys": ["KeyW"], "sequence": 5})
    assert command.linear == pytest.approx((0.02, 0.0, 0.0))
    with pytest.raises(ProtocolError, match="lease"):
        bridge.command("browser-b", {"arm": "l", "keys": [], "sequence": 6})
    with pytest.raises(ProtocolError, match="sequence"):
        bridge.command("browser-a", {"arm": "l", "keys": [], "sequence": 5})


def test_deactivate_clears_the_owner_and_sequence_state(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("browser-a")
    bridge.command("browser-a", {"arm": "l", "keys": ["KeyW"], "sequence": 5})
    bridge.deactivate()
    assert bridge.owner is None
    with pytest.raises(ProtocolError, match="lease"):
        bridge.command("browser-a", {"arm": "l", "keys": [], "sequence": 6})


def test_gripper_edges_fire_once_until_release_independently_per_arm(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("owner")
    def send(arm, keys, sequence, client="owner"):
        return bridge.command(client, {"arm": arm, "keys": keys, "sequence": sequence})

    assert send("l", ["Digit1"], 1).gripper_command == "open"
    assert send("r", ["Digit0"], 1).gripper_command == "close"
    bridge.activate("owner")  # Repeated ACTIVE must not re-arm held keys.
    assert send("l", ["Digit1", "KeyW"], 2).gripper_command is None
    with pytest.raises(ProtocolError, match="lease"):
        send("l", ["Digit2"], 3, "other")
    with pytest.raises(ProtocolError, match="sequence"):
        send("l", ["Digit2"], 2)
    assert send("l", [], 3).gripper_command is None
    assert send("l", ["Digit2"], 4).gripper_command == "close"


def test_conflicting_gripper_keys_require_full_release_before_rearming(config):
    bridge = KeyboardControlBridge(config)
    bridge.activate("owner")
    def send(keys, sequence):
        return bridge.command("owner", {"arm": "l", "keys": keys, "sequence": sequence})
    assert send(["Digit1", "Digit2"], 1).gripper_command is None
    assert send(["Digit1"], 2).gripper_command is None
    assert send([], 3).gripper_command is None
    assert send(["Digit1"], 4).gripper_command == "open"
