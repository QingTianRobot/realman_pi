from pathlib import Path

import pytest

from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose

REPO_CONFIG = Path(__file__).resolve().parents[4] / "config" / "ros"


def _write(tmp_path: Path, name: str, text: str) -> Path:
    path = tmp_path / name
    path.write_text(text, encoding="utf-8")
    return path


def test_repo_episode_config_defaults_to_disabled():
    config = load_episode_config(REPO_CONFIG / "pika_episode.yaml")
    assert config == EpisodeConfig(
        enabled=False,
        task="",
        profile="teleop_v1",
        record_cameras=True,
        keyboard_topic="/foot_pedal/enabled",
        required_mode="pikavelocity",
        keyboard_stale_sec=3.0,
        home_open_grippers={"l": "gripper_left", "r": "gripper_right"},
        restart_off_mode="none",
        restart_off_timeout_sec=10.0,
        restart_timeout_sec=150.0,
    )


def test_restart_settings_default_and_old_homing_keys_are_ignored(tmp_path):
    base = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    lines = [line for line in base.splitlines() if not line.startswith("restart_")]
    # A host file written before the branch restart still carries the trigger's own homing keys.
    old = _write(tmp_path, "old.yaml", "\n".join(lines + [
        "release_timeout_sec: 8.0", "home_velocity_percent: 30", "home_timeout_sec: 120.0"]) + "\n")
    config = load_episode_config(old)
    assert (config.restart_off_mode, config.restart_off_timeout_sec, config.restart_timeout_sec) == ("none", 10.0, 150.0)


def test_episode_config_rejects_bad_values(tmp_path):
    base = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    bad = _write(tmp_path, "e.yaml", base.replace("restart_timeout_sec: 150.0", "restart_timeout_sec: 0"))
    with pytest.raises(ValueError, match="restart_timeout_sec"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e1.yaml", base.replace("restart_off_mode: none", "restart_off_mode: pikavelocity"))
    with pytest.raises(ValueError, match="restart_off_mode must differ"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e2.yaml", base.replace("keyboard_stale_sec: 3.0", "keyboard_stale_sec: -1"))
    with pytest.raises(ValueError, match="keyboard_stale_sec"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e3.yaml", base.replace("enabled: false", "enabled: maybe"))
    with pytest.raises(ValueError, match="enabled"):
        load_episode_config(bad)


def test_home_open_grippers_is_validated(tmp_path):
    base = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    head = base.split("home_open_grippers:")[0]
    none = _write(tmp_path, "g0.yaml", head + "home_open_grippers: {}\n")
    assert load_episode_config(none).home_open_grippers == {}
    missing = _write(tmp_path, "g1.yaml", head)
    with pytest.raises(ValueError, match="home_open_grippers"):
        load_episode_config(missing)
    bad_arm = _write(tmp_path, "g2.yaml", head + "home_open_grippers:\n  left: gripper_left\n")
    with pytest.raises(ValueError, match="arm must be one of"):
        load_episode_config(bad_arm)
    bad_name = _write(tmp_path, "g3.yaml", head + "home_open_grippers:\n  l: ''\n")
    with pytest.raises(ValueError, match="non-empty gripper name"):
        load_episode_config(bad_name)


def test_repo_home_pose_has_three_arms():
    pose = load_home_pose(REPO_CONFIG / "pika_config.yaml")
    assert sorted(pose) == ["l", "m", "r"]
    assert pose["l"] == (12.172, 25.223, 73.054, -16.703, 80.307, 14.455)
    assert all(len(v) == 6 for v in pose.values())


POSE_TEMPLATE = """
pika_default_pose:
  left:
    joint_degrees: [1, 2, 3, 4, 5, 6]
  middle:
    joint_degrees: [0, 0, 0, 0, 0, 0]
    {middle_extra}
  right:
    joint_degrees: {right}
"""


def test_home_pose_skips_arm(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="skip: true", right="[1, 1, 1, 1, 1, 1]"))
    assert sorted(load_home_pose(path)) == ["l", "r"]


def test_home_pose_rejects_wrong_length_and_all_skipped(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="", right="[1, 2, 3]"))
    with pytest.raises(ValueError, match="right"):
        load_home_pose(path)
    all_skip = """
pika_default_pose:
  left: {skip: true}
  middle: {skip: true}
  right: {skip: true}
"""
    with pytest.raises(ValueError, match="at least one arm"):
        load_home_pose(_write(tmp_path, "s.yaml", all_skip))


def test_home_pose_rejects_non_finite(tmp_path):
    path = _write(tmp_path, "p.yaml", POSE_TEMPLATE.format(middle_extra="", right="[1, 2, 3, 4, 5, .nan]"))
    with pytest.raises(ValueError, match="finite"):
        load_home_pose(path)


def test_missing_file_is_a_value_error_naming_the_path(tmp_path):
    missing = tmp_path / "nope.yaml"
    with pytest.raises(ValueError, match="nope.yaml"):
        load_episode_config(missing)
    with pytest.raises(ValueError, match="nope.yaml"):
        load_home_pose(missing)


def test_invalid_yaml_is_a_value_error_naming_the_path(tmp_path):
    bad = _write(tmp_path, "broken.yaml", "enabled: [true\n")
    with pytest.raises(ValueError, match="broken.yaml"):
        load_episode_config(bad)
