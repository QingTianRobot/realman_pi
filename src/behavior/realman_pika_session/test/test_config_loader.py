import re
from pathlib import Path

import pytest

from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose

REPO_CONFIG = Path(__file__).resolve().parents[4] / "config" / "ros"


def _write(tmp_path: Path, name: str, text: str) -> Path:
    path = tmp_path / name
    path.write_text(text, encoding="utf-8")
    return path


def _set(text: str, key: str, value: str) -> str:
    """Replace one top-level `key: value` line, whatever value the host config has."""
    result, count = re.subn(rf"^{key}: .*$", f"{key}: {value}", text, flags=re.M)
    assert count == 1, key
    return result


# The repo config files are copied from the host into the image build, and a robot
# host may enable the trigger, change the task or skip an arm. Tests that read them
# therefore check validity only; exact values are asserted on tmp copies.


def test_repo_episode_config_is_valid():
    config = load_episode_config(REPO_CONFIG / "pika_episode.yaml")
    assert isinstance(config, EpisodeConfig)
    assert config.keyboard_topic == "/foot_pedal/enabled"
    assert config.required_mode == "pikavelocity"


def test_episode_config_values_are_parsed(tmp_path):
    text = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    text = _set(_set(text, "enabled", "false"), "task", '""')
    config = load_episode_config(_write(tmp_path, "e.yaml", text))
    assert config.enabled is False and config.task == ""
    text = _set(_set(text, "enabled", "true"), "task", "pick_and_place")
    config = load_episode_config(_write(tmp_path, "e.yaml", text))
    assert config.enabled is True and config.task == "pick_and_place"


def test_episode_config_rejects_bad_values(tmp_path):
    base = (REPO_CONFIG / "pika_episode.yaml").read_text(encoding="utf-8")
    bad = _write(tmp_path, "e.yaml", _set(base, "home_velocity_percent", "0"))
    with pytest.raises(ValueError, match="home_velocity_percent"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e2.yaml", _set(base, "keyboard_stale_sec", "-1"))
    with pytest.raises(ValueError, match="keyboard_stale_sec"):
        load_episode_config(bad)
    bad = _write(tmp_path, "e3.yaml", _set(base, "enabled", "maybe"))
    with pytest.raises(ValueError, match="enabled"):
        load_episode_config(bad)


def test_repo_home_pose_is_valid():
    pose = load_home_pose(REPO_CONFIG / "pika_config.yaml")
    assert pose and set(pose) <= {"l", "m", "r"}
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
