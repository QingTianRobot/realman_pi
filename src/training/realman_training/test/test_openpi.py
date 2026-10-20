from __future__ import annotations

import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.config import OpenpiConfig
from realman_training.jobs import StepFailed
from realman_training.openpi import (
    CONTAINER_PREFIX,
    MULTI_GPU_ENV,
    Compose,
    ConfigInfo,
    busy_gpus,
    check_holdout,
    config_info,
    norm_stats_path,
    parse_gpus,
    repo_commit,
    require_view,
    run_dir,
    script,
    train_env,
)

OC = OpenpiConfig(repo=Path("/o/openpi"), docker_data=Path("/o/data"), compose_overlay=Path("/cfg/overlay.yaml"))
INFO_JSON = json.dumps(
    {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1, 3], "batch_size": 8, "num_train_steps": 30000}
)


def test_parse_gpus():
    assert parse_gpus("1,2") == (1, 2) and parse_gpus(3) == (3,) and parse_gpus(" 0 , 3 ") == (0, 3)
    for bad in ("", "1,1", "-1", "a"):
        with pytest.raises(ValueError):
            parse_gpus(bad)


def test_train_env_adds_the_nccl_recipe_only_for_several_gpus():
    assert train_env((2,)) == {"XLA_PYTHON_CLIENT_PREALLOCATE": "false"}
    env = train_env((1, 2))
    assert env["NCCL_CUMEM_ENABLE"] == "0" and env["XLA_FLAGS"] == "--xla_gpu_enable_command_buffer="
    assert set(MULTI_GPU_ENV) == {
        "NCCL_P2P_DISABLE", "NCCL_SHM_DISABLE", "NCCL_NET", "NCCL_CUMEM_ENABLE", "XLA_FLAGS", "NCCL_ALGO", "NCCL_PROTO"
    }


def test_compose_run_uses_the_repo_files_the_overlay_and_the_view():
    compose = Compose(OC, Path("/d/view"), (1, 2))
    env = compose.env()
    assert env == {
        "OPENPI_DOCKER_DATA_DIR": "/o/data",
        "OPENPI_REALMAN_DATASET_DIR": "/d/view",
        "OPENPI_COMPOSE_PROJECT_NAME": "openpi-console",
        "OPENPI_DOCKER_IMAGE": "openpi:dev",
        "CONSOLE_GPUS": "1,2",
    }
    argv = compose.run("opic-norm --config-name x", env={"A": "1"})
    assert argv[:4] == ["docker", "compose", "-p", "openpi-console"]
    assert argv[argv.index("-f") + 1] == "/o/openpi/compose.yaml"
    assert "/o/openpi/compose.realman.yaml" in argv and "/cfg/overlay.yaml" in argv
    assert argv[argv.index("run") :][:5] == ["run", "-T", "--no-deps", "--rm", "-e"]
    assert argv[-4:] == ["openpi", "zsh", "-lc", CONTAINER_PREFIX + "opic-norm --config-name x"]
    detached = compose.run("x", name="openpi-console-train-e")
    assert "--rm" not in detached and detached[detached.index("-d") + 1 : detached.index("-d") + 3] == ["--name", "openpi-console-train-e"]
    assert Compose(OC, Path("/d")).env()["CONSOLE_GPUS"] == "none"


def test_config_info_runs_the_shipped_script_in_the_container():
    runner = FakeRunner().on("python -", stdout="noise\n" + INFO_JSON + "\n")
    info = config_info(runner, Compose(OC, Path("/d/view")), "pi05_x")
    assert info == ConfigInfo("pi05_x", "local/v", "local/v", (1, 3), 8, 30000)
    assert runner.inputs[0] == script("config_info")
    assert runner.envs[0]["OPENPI_REALMAN_DATASET_DIR"] == "/d/view"
    assert "uv run --no-sync python - pi05_x" in runner.calls[0][-1]


def test_paths():
    info = ConfigInfo("pi05_x", "local/v", "local/v", (), 8, 10)
    assert norm_stats_path(OC, info) == Path("/o/data/assets/pi05_x/local/v/norm_stats.json")
    assert run_dir(OC, "pi05_x", "e1") == Path("/o/data/checkpoints/pi05_x/e1")


def test_busy_gpus_lists_gpus_over_the_threshold():
    runner = FakeRunner().on("nvidia-smi", stdout="1, 16000\n2, 3\n")
    assert busy_gpus(runner, (1, 2), 2000) == {1: 16000}
    assert runner.calls[0][:3] == ["nvidia-smi", "-i", "1,2"]


def test_repo_commit_marks_uncommitted_changes():
    runner = FakeRunner().on("rev-parse", stdout="abc123\n").on("status --porcelain", stdout=" M x.py\n")
    assert repo_commit(runner, Path("/o/openpi")) == "abc123 (+ uncommitted changes)"
    clean = FakeRunner().on("rev-parse", stdout="abc123\n")
    assert repo_commit(clean, Path("/o/openpi")) == "abc123"


def test_require_view_and_check_holdout(tmp_path):
    raw = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5)))])
    with pytest.raises(StepFailed, match="not a training view"):
        require_view(raw)
    view = build_view(tmp_path / "view", source="c", prompts={"a": "do a"}, lengths=[5, 5, 5])
    summary = require_view(view)
    check_holdout(ConfigInfo("n", "r", "r", (0, 2), 8, 10), summary)
    with pytest.raises(StepFailed, match="holdout"):
        check_holdout(ConfigInfo("n", "r", "r", (9,), 8, 10), summary)
