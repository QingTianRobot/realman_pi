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


def test_pika_velocity_has_an_isolated_one_meter_per_second_limit():
    document = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    velocity = document["pika_velocity"]
    assert velocity["work_reference"] == "work/pikabase"
    # Replay the last velocity only while it is fresh; a paused stream must
    # stop the arm long before the session itself is released.
    assert velocity["stale_ms"] == 200
    assert velocity["input_timeout_ms"] == 3000
    assert velocity["max_linear_speed_mps"] == 0.15
    assert velocity["max_angular_speed_radps"] == 0.25
    assert velocity["max_angular_accel_radps2"] == 0.5


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
    assert '"pika_velocity_work_reference"' in source
    assert '"pika_velocity_input_timeout_ms"' in source
    assert '"pika_velocity_max_linear_speed_mps"' in source
    assert '"pika_velocity_max_angular_accel_radps2"' in source
    assert '"coordinate_references": coordinate_references' in source
    assert '"cartesian_velocity_profiles": velocity_profiles' in source


def test_pika_velocity_loader_passes_the_stale_window_and_rejects_an_inverted_one(tmp_path):
    import importlib.util
    import sys

    import pytest

    sys.path.insert(0, str(LAUNCH.parent))
    spec = importlib.util.spec_from_file_location("control_router_launch", LAUNCH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    loaded = module._load_pika_velocity_config(CONFIG)
    assert loaded["pika_velocity_stale_ms"] == 200
    assert loaded["pika_velocity_input_timeout_ms"] == 3000

    inverted = tmp_path / "pika_config.yaml"
    inverted.write_text(
        "pika_velocity:\n"
        "  work_reference: work/pikabase\n"
        "  stale_ms: 3000\n"
        "  input_timeout_ms: 200\n"
        "  max_linear_speed_mps: 0.15\n"
        "  max_angular_speed_radps: 0.25\n"
        "  max_angular_accel_radps2: 0.5\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="stale_ms must be below"):
        module._load_pika_velocity_config(inverted)
