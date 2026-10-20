from __future__ import annotations

import csv
import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import build_view

from realman_training.jobs import JobCancelled, StepFailed
from realman_training.steps import norm, train

INFO = {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1], "batch_size": 8, "num_train_steps": 300}
LOG = """\
02:00:04.856 [I] Step 0: grad_norm=0.2538, loss=0.0836821, param_norm=1801.99, learning_rate=4.99494e-08 (1162:train.py:333)
02:01:20.602 [I] Step 100: grad_norm=0.218596, loss=0.0646374, param_norm=1801.99, learning_rate=5.04496e-06 (1162:train.py:333)
02:02:35.564 [I] Step 200: grad_norm=0.151241, loss=0.0420924, param_norm=1801.99, learning_rate=1.004e-05 (1162:train.py:333)
"""


@pytest.fixture()
def env(tmp_path):
    view = build_view(tmp_path / "data" / "v_view", source="c", prompts={"a": "do a"}, lengths=[10, 10, 10])
    docker_data = tmp_path / "openpi-docker-data"
    (docker_data / "wandb").mkdir(parents=True)
    config = tmp_path / "console.yaml"
    config.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        f"  openpi:\n    repo: {tmp_path / 'openpi'}\n    docker_data: {docker_data}\n"
    )
    return {"view": view, "docker_data": docker_data, "config": str(config)}


def base_runner():
    return FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="1, 3\n2, 5\n")


def stats_path(env):
    return env["docker_data"] / "assets/pi05_x/local/v/norm_stats.json"


def test_norm_computes_missing_stats_once(env):
    def write_stats(argv, input):
        stats_path(env).parent.mkdir(parents=True)
        stats_path(env).write_text("{}")

    runner = base_runner().on("opic-norm", action=write_stats, lines=["Computing stats: 100%"])
    params = {"config_name": "pi05_x", "view": str(env["view"]), "config": env["config"]}
    assert norm.run(params, RecordingLog(), runner=runner) == {"norm_stats": str(stats_path(env)), "computed": True}
    assert runner.envs[-1]["OPENPI_REALMAN_DATASET_DIR"] == str(env["view"])
    again = base_runner()
    assert norm.run(params, RecordingLog(), runner=again)["computed"] is False
    assert again.commands("opic-norm") == []


def test_norm_fails_when_the_stats_do_not_appear(env):
    runner = base_runner().on("opic-norm", returncode=0)
    with pytest.raises(StepFailed, match="norm_stats.json"):
        norm.run({"config_name": "pi05_x", "view": str(env["view"]), "config": env["config"]}, RecordingLog(), runner=runner)


def train_params(env, **extra):
    return {"config_name": "pi05_x", "view": str(env["view"]), "exp": "e1", "gpus": "1,2", "config": env["config"],
            "poll_sec": 0, **extra}


def test_train_dry_run_shows_the_command_and_touches_nothing(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = base_runner().on("container inspect", returncode=1)
    result = train.run(train_params(env, batch=16, steps=30000, dry_run=True), RecordingLog(), runner=runner)
    command = result["command"]
    assert result["container"] == "openpi-console-train-e1"
    assert command[command.index("-d") + 1 : command.index("-d") + 3] == ["--name", "openpi-console-train-e1"]
    assert "NCCL_CUMEM_ENABLE=0" in command and "XLA_PYTHON_CLIENT_PREALLOCATE=false" in command
    inner = command[-1]
    assert "opic-train pi05_x" in inner and "--exp-name=e1" in inner and "--batch-size=16" in inner
    assert "--num-train-steps=30000" in inner and "--weight-loader.params-path=/home/openpi/" in inner
    assert "> /workspace/wandb/e1.log 2>&1" in inner
    assert runner.commands("compose") and not [c for c in runner.commands("compose") if "-d" in c]  # only config_info
    assert not (env["docker_data"] / "checkpoints").exists()


def test_train_refuses_gpus_held_by_someone_else(env):
    runner = FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="1, 16000\n2, 5\n")
    runner.on("container inspect", returncode=1)
    with pytest.raises(StepFailed, match="gpu1=16000"):
        train.run(train_params(env), RecordingLog(), runner=runner)
    assert not [c for c in runner.calls if "-d" in c]


def test_train_refuses_an_existing_run_or_container(env):
    run_dir = env["docker_data"] / "checkpoints/pi05_x/e1"
    run_dir.mkdir(parents=True)
    with pytest.raises(StepFailed, match="resume"):
        train.run(train_params(env), RecordingLog(), runner=base_runner().on("container inspect", returncode=1))
    run_dir.rmdir()
    with pytest.raises(StepFailed, match="container openpi-console-train-e1 exists"):
        train.run(train_params(env), RecordingLog(), runner=base_runner().on("container inspect", returncode=0))


def test_train_refuses_a_view_that_lacks_the_holdout(env):
    info = {**INFO, "exclude_episode_indices": [7]}
    runner = FakeRunner().on("python -", stdout=json.dumps(info)).on("container inspect", returncode=1)
    with pytest.raises(StepFailed, match="holdout"):
        train.run(train_params(env), RecordingLog(), runner=runner)


def test_train_computes_norm_first_follows_the_log_and_writes_metrics(env):
    log_path = env["docker_data"] / "wandb/e1.log"
    run_dir = env["docker_data"] / "checkpoints/pi05_x/e1"
    states = iter(["true", "false"])

    def write_stats(argv, input):
        stats_path(env).parent.mkdir(parents=True)
        stats_path(env).write_text("{}")

    def start(argv, input):
        run_dir.mkdir(parents=True)
        log_path.write_text(LOG)

    runner = (
        base_runner()
        .on("container inspect", returncode=1)
        .on("opic-norm", action=write_stats)
        .on("opic-train", action=start, stdout="container-id\n")
        .on("{{.State.Running}}", stdout=lambda argv, input: next(states, "false") + "\n")
        .on("{{.State.ExitCode}}", stdout="0\n")
        .on("git -C", stdout="abc\n")
    )
    log = RecordingLog()
    result = train.run(train_params(env), log, runner=runner)
    assert result == {"run_dir": str(run_dir), "container": "openpi-console-train-e1", "last_step": 200, "exit_code": 0}
    assert runner.commands("opic-norm") and runner.commands("docker rm openpi-console-train-e1")
    assert log.progress_calls[-1][:2] == (200, 300)
    rows = list(csv.DictReader((run_dir / "metrics.csv").open()))
    assert [r["step"] for r in rows] == ["0", "100", "200"] and rows[2]["loss"] == "0.0420924"
    record = json.loads((run_dir / "console_train.json").read_text())
    assert record["gpus"] == [1, 2] and record["batch_size"] == 8 and record["num_train_steps"] == 300
    assert record["holdout"] == [1] and record["exit_code"] == 0 and record["view"] == str(env["view"])


def test_train_failure_exit_code_fails_the_step(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = (
        base_runner().on("container inspect", returncode=1).on("opic-train", stdout="id\n")
        .on("{{.State.Running}}", stdout="false\n").on("{{.State.ExitCode}}", stdout="1\n").on("git -C", stdout="abc\n")
    )
    with pytest.raises(StepFailed, match="exited 1"):
        train.run(train_params(env), RecordingLog(), runner=runner)


def test_cancelling_stops_the_container(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = (
        base_runner().on("container inspect", returncode=1).on("opic-train", stdout="id\n")
        .on("{{.State.Running}}", stdout="true\n").on("git -C", stdout="abc\n")
    )

    def cancel(_seconds):
        raise JobCancelled()

    with pytest.raises(JobCancelled):
        train.run(train_params(env), RecordingLog(), runner=runner, sleep=cancel)
    assert runner.commands("docker stop")


def test_attach_follows_an_existing_container_without_starting_one(env):
    log_path = env["docker_data"] / "wandb/e1.log"
    log_path.write_text(LOG)
    (env["docker_data"] / "checkpoints/pi05_x/e1").mkdir(parents=True)
    runner = (
        base_runner().on("{{.State.Running}}", stdout="false\n").on("{{.State.ExitCode}}", stdout="0\n")
        .on("container inspect", returncode=0).on("git -C", stdout="abc\n")
    )
    result = train.run(train_params(env, attach=True), RecordingLog(), runner=runner)
    assert result["last_step"] == 200 and runner.commands("opic-train") == []


def test_parse_metrics():
    rows = train.parse_metrics(LOG + "noise\n")
    assert rows[0] == {"step": 0, "grad_norm": 0.2538, "loss": 0.0836821, "param_norm": 1801.99, "learning_rate": 4.99494e-08}
    assert len(rows) == 3


def test_bad_experiment_names_are_refused(env):
    with pytest.raises(StepFailed, match="exp"):
        train.run(train_params(env, exp="a b;rm"), RecordingLog(), runner=base_runner())


def test_paths_do_not_leak():
    assert Path(train.__file__).name == "train.py"
