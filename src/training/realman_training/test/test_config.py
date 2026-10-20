from __future__ import annotations

from pathlib import Path

import pytest

from realman_training.config import DEFAULT_CONFIG, ENV_CONFIG, QualityConfig, load_config


def _write(tmp_path: Path, body: str) -> Path:
    path = tmp_path / "console.yaml"
    path.write_text(body, encoding="utf-8")
    return path


def test_the_shipped_file_equals_the_reviewed_defaults():
    config = load_config(DEFAULT_CONFIG)
    assert config.quality == QualityConfig()
    assert config.data_root == Path("~/data/realman").expanduser()


def test_the_reviewed_defaults():
    q = QualityConfig()
    assert q.arm == "r"
    assert (q.gripper_open_raw, q.closed_threshold_raw, q.gripper_close_raw) == (50.0, 4275.0, 8500.0)
    # Recordings carry no torque: held plateaus reached 7904 on 2026-10-16, empty grasps 8414-8550.
    assert q.empty_position_min == 8300.0
    # 2 s: raw 2026-10-16 #209 settled at 8448 only for its last ~2.5 s (3 s median 7802).
    assert q.plateau_window_sec == 2.0
    assert q.release_tasks == ("pick_and_place",)
    assert q.start_pose_deg == (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)


def test_values_from_the_file_override_the_defaults(tmp_path):
    path = _write(tmp_path, "training_console:\n  data_root: /data/x\n  quality:\n    empty_position_min: 8000\n    release_tasks: [place]\n")
    config = load_config(path)
    assert config.data_root == Path("/data/x")
    assert config.quality.empty_position_min == 8000.0
    assert config.quality.release_tasks == ("place",)
    assert config.quality.glitch_max_frames == 2  # untouched keys keep their default


def test_the_environment_variable_picks_the_file(tmp_path, monkeypatch):
    path = _write(tmp_path, "training_console:\n  data_root: /from/env\n")
    monkeypatch.setenv(ENV_CONFIG, str(path))
    assert load_config().data_root == Path("/from/env")


@pytest.mark.parametrize(
    "body, fragment",
    [
        ("other: {}\n", "training_console"),
        ("training_console:\n  quality:\n    empty_position: 1\n", "empty_position"),
        ("training_console:\n  quality:\n    arm: x\n", "arm"),
        ("training_console:\n  quality:\n    closed_threshold_raw: 9000\n", "closed_threshold_raw"),
        ("training_console:\n  quality:\n    start_pose_deg: [1, 2]\n", "start_pose_deg"),
        ("training_console:\n  quality:\n    glitch_max_frames: 0\n", "glitch_max_frames"),
    ],
)
def test_bad_values_name_the_key(tmp_path, body, fragment):
    with pytest.raises(ValueError, match=fragment):
        load_config(_write(tmp_path, body))
