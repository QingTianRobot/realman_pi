from pathlib import Path

import yaml


ROOT = Path(__file__).parents[4]
CONFIG = ROOT / "config/ros/pika_config.yaml"
TREE = ROOT / "config/behavior-trees/control.xml"
LAUNCH = ROOT / "src/behavior/realman_bt/launch/control_router.launch.py"


def test_pika_config_uses_production_default_pose_joint_contract():
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    pose = document["pika_default_pose"]
    assert pose["left"]["joint_degrees"] == [12.172, 25.223, 73.054, -16.703, 80.307, 14.455]
    assert pose["middle"]["joint_degrees"] == [0.0, 17.997, 70.0, 0.0, 90.0, 8.997]
    assert pose["right"]["joint_degrees"] == [-9.89, 18.046, 79.074, 15.505, 79.606, -6.194]


def test_control_tree_reads_pika_joint_defaults_from_blackboard():
    source = TREE.read_text(encoding="utf-8")
    assert 'l_joint_degrees="{pika_l_joint_degrees}"' in source
    assert 'm_joint_degrees="{pika_m_joint_degrees}"' in source
    assert 'r_joint_degrees="{pika_r_joint_degrees}"' in source
    assert "12.172,25.223,73.054" not in source


def test_control_router_launch_loads_pika_config_and_injects_joint_defaults():
    source = LAUNCH.read_text(encoding="utf-8")
    assert "yaml.safe_load" in source
    assert 'config_root / "ros" / "pika_config.yaml"' in source
    assert '"pika_l_joint_degrees"' in source
    assert '"pika_m_joint_degrees"' in source
    assert '"pika_r_joint_degrees"' in source
