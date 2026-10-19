"""config/ros/motion_monitor.yaml: the MotionDwellMonitor defaults and how they reach the executor."""
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).parents[4]
CONFIG = ROOT / "config/ros/motion_monitor.yaml"
LAUNCH = ROOT / "src/behavior/realman_bt/launch/control_router.launch.py"
LOADER = ROOT / "src/behavior/realman_bt/src/motion_dwell_monitor_node.cpp"


def _parameters():
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    assert list(document) == ["realman_bt_executor"]
    return document["realman_bt_executor"]["ros__parameters"]["motion_monitor"]


def test_every_key_the_loader_declares_is_in_the_file_and_nothing_else():
    # ROS silently ignores a parameter nobody declared, so a typo would fall back to the default.
    declared = set(re.findall(r'read\("motion_monitor\.([a-z_]+)"', LOADER.read_text(encoding="utf-8")))
    assert set(_parameters()) == declared


def test_the_defaults_are_the_reviewed_values():
    assert _parameters() == {"dwell_sec": 30.0, "tolerance_deg": 0.5, "joint_state_stale_sec": 1.0}


def test_the_control_router_launch_loads_the_file():
    assert 'str(config_root / "ros" / "motion_monitor.yaml")' in LAUNCH.read_text(encoding="utf-8")
