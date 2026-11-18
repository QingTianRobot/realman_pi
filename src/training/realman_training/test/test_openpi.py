from __future__ import annotations

import dataclasses
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
    UvOpenpi,
    busy_gpus,
    check_holdout,
    check_name,
    config_info,
    make_backend,
    norm_stats_path,
    normalize_docker_time,
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
    detached = compose.run("x", name="openpi-console-train-e", detach=True)
    assert "--rm" not in detached and detached[detached.index("-d") + 1 : detached.index("-d") + 3] == ["--name", "openpi-console-train-e"]
    named_rm = compose.run("x", name="openpi-console-norm-pi05_x")
    assert "--rm" in named_rm and "-d" not in named_rm and "--name" in named_rm
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


def test_check_name_rejects_trailing_newline():
    """SAFE_NAME must not match names with a trailing newline ($ matches before a newline, \\Z does not)."""
    # Valid names must pass
    assert check_name("label", "good_name-1.0") == "good_name-1.0"
    # A trailing newline must be refused
    with pytest.raises(StepFailed):
        check_name("label", "good_name\n")
    with pytest.raises(StepFailed):
        check_name("label", "a\n")
    # Empty and other invalid names still refused
    with pytest.raises(StepFailed):
        check_name("label", "")
    with pytest.raises(StepFailed):
        check_name("label", "has space")


def uv_config(tmp_path) -> OpenpiConfig:
    repo = tmp_path / "openpi"
    return dataclasses.replace(OpenpiConfig(), backend="uv", repo=repo, docker_data=repo, env_file="/w/env.sh")


def test_make_backend_picks_by_config(tmp_path):
    assert isinstance(make_backend(OpenpiConfig(), tmp_path), Compose)
    assert isinstance(make_backend(uv_config(tmp_path), tmp_path), UvOpenpi)


def test_uv_env_points_openpi_at_the_view_and_the_gpus(tmp_path):
    backend = UvOpenpi(uv_config(tmp_path), tmp_path / "v_view", (2, 5))
    assert backend.env() == {"OPENPI_REALMAN_DATASET_DIR": str(tmp_path / "v_view"), "CUDA_VISIBLE_DEVICES": "2,5"}
    cpu = UvOpenpi(uv_config(tmp_path), tmp_path / "v_view")
    assert cpu.env()["CUDA_VISIBLE_DEVICES"] == "" and cpu.env()["JAX_PLATFORMS"] == "cpu"


def test_uv_run_without_name_is_a_plain_bash(tmp_path):
    config = uv_config(tmp_path)
    argv = UvOpenpi(config, tmp_path).run("uv run --no-sync python - x", env={"A": "1"})
    assert argv[:3] == ["env", "A=1", "bash"] and argv[3] == "-c"
    assert argv[4].startswith(f"source /w/env.sh && cd {config.repo} && ")
    assert argv[4].endswith("uv run --no-sync python - x")


def test_uv_run_maps_workspace_and_records_pid_and_exit(tmp_path):
    config = uv_config(tmp_path)
    argv = UvOpenpi(config, tmp_path).run("opic-train c >> /workspace/wandb/e.log 2>&1", name="t-e", detach=True)
    assert argv[:4] == ["env", "setsid", "-f", "bash"]
    script = argv[-1]
    run = config.docker_data / "console_run"
    assert f"echo $$ > {run}/t-e.pid" in script
    assert f">> {config.repo}/wandb/e.log" in script and "/workspace" not in script
    assert "exec </dev/null >/dev/null 2>&1" in script
    assert f"echo $c > {run}/t-e.exit" in script
    assert "opic-train() {" in script


def test_uv_run_attached_waits(tmp_path):
    argv = UvOpenpi(uv_config(tmp_path), tmp_path).run("opic-norm --config-name c", name="n-c")
    assert argv[1:4] == ["setsid", "-w", "bash"] and "exec </dev/null" not in argv[-1]


def test_uv_detached_needs_a_name(tmp_path):
    with pytest.raises(ValueError):
        UvOpenpi(uv_config(tmp_path), tmp_path).run("x", detach=True)


def test_uv_lifecycle_commands(tmp_path):
    config = uv_config(tmp_path)
    backend = UvOpenpi(config, tmp_path)
    pid = config.docker_data / "console_run" / "t.pid"
    runner = FakeRunner().on("test -e", returncode=0).on("kill -0", returncode=1).on("cat", stdout="3\n")
    assert backend.exists(runner, "t") is True
    assert runner.calls[-1] == ["test", "-e", str(pid)]
    assert backend.running(runner, "t") is False
    assert backend.exit_code(runner, "t") == 3
    backend.stop(runner, "t", 60)
    assert "kill -TERM -- -$p" in runner.calls[-1][-1] and "seq 60" in runner.calls[-1][-1]
    backend.remove(runner, "t")
    assert runner.calls[-1][:2] == ["rm", "-f"]


def test_uv_missing_exit_file_is_a_failure(tmp_path):
    runner = FakeRunner().on("cat", returncode=1)
    with pytest.raises(StepFailed, match="without writing"):
        UvOpenpi(uv_config(tmp_path), tmp_path).exit_code(runner, "t")


def test_compose_lifecycle_keeps_the_docker_commands(tmp_path):
    compose = Compose(OpenpiConfig(), tmp_path)
    runner = (FakeRunner().on("container inspect", returncode=1).on("{{.State.Running}}", stdout="true\n")
              .on("{{.State.ExitCode}}", stdout="0\n").on("{{.State.StartedAt}}", stdout="2026-10-20T08:12:34.5Z\n"))
    assert compose.exists(runner, "c") is False
    assert compose.running(runner, "c") is True
    assert compose.exit_code(runner, "c") == 0
    compose.stop(runner, "c", 30)
    assert runner.calls[-1] == ["docker", "stop", "-t", "30", "c"]
    compose.remove(runner, "c")
    assert runner.calls[-1] == ["docker", "rm", "c"]
    assert compose.started_at(runner, "c") == normalize_docker_time("2026-10-20T08:12:34.5Z")
