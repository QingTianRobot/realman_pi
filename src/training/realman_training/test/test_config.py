from __future__ import annotations

import dataclasses
from pathlib import Path

import pytest

from realman_training.config import DEFAULT_CONFIG, ENV_CONFIG, OpenpiConfig, QualityConfig, RemoteConfig, default_config_path, load_config


def _write(tmp_path: Path, body: str) -> Path:
    path = tmp_path / "console.yaml"
    path.write_text(body, encoding="utf-8")
    return path


def test_the_shipped_file_equals_the_reviewed_defaults():
    config = load_config(DEFAULT_CONFIG)
    assert config.quality == QualityConfig()
    assert config.remote == RemoteConfig()
    assert dataclasses.replace(config.openpi, compose_overlay=None) == dataclasses.replace(
        OpenpiConfig(), compose_overlay=None
    )
    assert config.openpi.compose_overlay == DEFAULT_CONFIG.parent / "openpi-console.compose.yaml"
    assert config.data_root == Path("~/data/realman").expanduser()
    assert config.prompts == {
        "pick_and_place": "pick up the power adapter and put it in the blue bin",
        "pick_only": "pick up the power adapter",
    }


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
        ("training_console:\n  quality:\n    release_tasks: pick_and_place\n", "release_tasks"),
        ("training_console:\n  remote:\n    ssh: x\n", "ssh"),
        ("training_console:\n  prompts: [a]\n", "prompts"),
    ],
)
def test_bad_values_name_the_key(tmp_path, body, fragment):
    with pytest.raises(ValueError, match=fragment):
        load_config(_write(tmp_path, body))


def test_a_null_data_root_keeps_the_default(tmp_path):
    config = load_config(_write(tmp_path, "training_console:\n  data_root: null\n"))
    assert config.data_root == Path("~/data/realman").expanduser()


def test_the_config_is_found_from_the_working_directory(tmp_path, monkeypatch):
    target = tmp_path / "config" / "training" / "training_console.yaml"
    target.parent.mkdir(parents=True)
    target.write_text("training_console:\n  data_root: /from/cwd\n")
    (tmp_path / "deeper").mkdir()
    monkeypatch.delenv(ENV_CONFIG, raising=False)
    monkeypatch.chdir(tmp_path / "deeper")
    assert default_config_path().resolve() == target.resolve()
    assert load_config().data_root == Path("/from/cwd")


def test_new_sections_have_the_server5090_defaults(tmp_path):
    config = load_config(_write(tmp_path, "training_console: {}\n"))
    assert config.remote == RemoteConfig()
    assert config.remote.recording_root == "/data/realman-recordings/lerobot"
    assert config.openpi.compose_project == "openpi-console"
    assert config.openpi.gpu_busy_mib == 2000
    assert config.prompts["pick_only"] == "pick up the power adapter"
    assert config.console_dir == config.data_root / "_console"
    assert config.source == (tmp_path / "console.yaml").resolve()
    # a relative overlay path is resolved next to the config file
    assert config.openpi.compose_overlay == (tmp_path / "openpi-console.compose.yaml").resolve()


def test_openpi_values_from_the_file(tmp_path):
    config = load_config(
        _write(tmp_path, "training_console:\n  state_dir: /s\n  openpi:\n    repo: /o\n    gpu_busy_mib: 500\n")
    )
    assert config.openpi.repo == Path("/o") and config.openpi.gpu_busy_mib == 500
    assert config.console_dir == Path("/s")
    assert OpenpiConfig().num_workers == 6
