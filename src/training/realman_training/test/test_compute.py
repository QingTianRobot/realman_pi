from __future__ import annotations

import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog

from realman_training import compute
from realman_training.config import load_config
from realman_training.jobs import JobCancelled, StepFailed


@pytest.fixture()
def config(tmp_path):
    path = tmp_path / "c.yaml"
    path.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        f"  openpi:\n    repo: {tmp_path / 'mirror/openpi'}\n    docker_data: {tmp_path / 'mirror/openpi'}\n"
        "  compute:\n    ssh_host: EI\n    ssh_config: Traning_area/.ssh/config\n    workdir: /w\n    mirror_sync_sec: 60\n",
        encoding="utf-8",
    )
    return load_config(path)


def test_enabled_only_with_a_host(config):
    assert compute.enabled(config)


def test_ssh_argv_uses_the_repo_relative_config(config):
    argv = compute.ssh_argv(config, "true")
    assert argv[0] == "ssh" and argv[1] == "-F" and argv[2].endswith("Traning_area/.ssh/config")
    assert "BatchMode=yes" in argv and argv[-2:] == ["EI", "true"]


def test_remote_python_runs_the_package_in_the_openpi_venv(config):
    command = compute.remote_python(config, ["_remote-step", "train", "ab12"])
    assert command.startswith("bash -c ")
    assert "source /w/env.sh" in command and "cd /w/src/realman_pi" in command
    assert "PYTHONPATH=/w/src/realman_pi/src/training/realman_training" in command
    assert "/w/src/openpi/.venv/bin/python -m realman_training _remote-step train ab12" in command


def test_wire_round_trip(config):
    local = {"view": str(config.data_root / "v_view"), "init": str(config.openpi.docker_data / "checkpoints/c/e/1"),
             "list": [str(config.data_root)], "other": "/etc/x", "n": 3}
    wire = compute.to_wire(local, config)
    assert wire["view"] == "@data_root/v_view" and wire["init"] == "@docker_data/checkpoints/c/e/1"
    assert wire["list"] == ["@data_root"] and wire["other"] == "/etc/x" and wire["n"] == 3
    assert compute.from_wire(wire, config) == local


def test_run_remote_streams_log_progress_and_result(config):
    lines = ["hello", '@@progress {"done": 1, "total": 2, "text": "half"}',
             '@@result {"dst": "@data_root/v_view", "episodes": 3}']
    runner = FakeRunner().on("_remote-step", lines=lines)
    log = RecordingLog()
    result = compute.run_remote("view", {"src": str(config.data_root / "c"), "config": "/local.yaml"}, log,
                                runner=runner, load=lambda _: config)
    assert result == {"dst": str(config.data_root / "v_view"), "episodes": 3}
    sent = json.loads(runner.inputs[0])
    assert sent == {"src": "@data_root/c"}  # the local config path stays local
    assert "hello" in log.lines and log.progress_calls[0][:2] == (1, 2)
    assert runner.commands("rsync")  # mirror refreshed after the step


def test_run_remote_failure_and_lost_connection(config):
    failing = FakeRunner().on("_remote-step", lines=["@@failed GPUs in use"], returncode=1)
    with pytest.raises(StepFailed, match="GPUs in use"):
        compute.run_remote("train", {}, RecordingLog(), runner=failing, load=lambda _: config)
    lost = FakeRunner().on("_remote-step", lines=["Step 5: loss=1"], returncode=255)
    with pytest.raises(StepFailed, match="lost the connection.*attach"):
        compute.run_remote("train", {}, RecordingLog(), runner=lost, load=lambda _: config)


def test_run_remote_cancel_stops_the_remote_step(config):
    def cancel(argv, input):
        raise JobCancelled()

    runner = FakeRunner().on("_remote-step", action=cancel)
    with pytest.raises(JobCancelled):
        compute.run_remote("norm", {}, RecordingLog(), runner=runner, load=lambda _: config)
    assert runner.commands("_remote-cancel")


def test_mirror_excludes_videos_and_weights(config):
    runner = FakeRunner()
    assert compute.sync_mirror(config, runner, RecordingLog()) is True
    data = [c for c in runner.commands("rsync") if c[-1] == f"{config.data_root}/"][0]
    assert "--exclude=videos/" in data and "--exclude=params/" in data and "--exclude=train_state/" in data
    assert data[-2] == "EI:/w/data/realman/"
    targets = {c[-1] for c in runner.commands("rsync")}
    assert f"{config.openpi.docker_data / 'checkpoints'}/" in targets
    assert f"{config.openpi.docker_data / 'wandb'}/" in targets


def test_remote_step_main_reports_result_and_failure(monkeypatch, capsys, tmp_path, config):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    monkeypatch.setattr(compute, "_step", lambda kind: (lambda params, log: (log("working"), {"dst": params["dst"]})[1]))
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO(json.dumps({"dst": "@data_root/x"})))
    assert compute.remote_step_main("view", "t1") == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0] == "working" and out[-1] == '@@result {"dst": "@data_root/x"}'

    def fail(params, log):
        raise StepFailed("nope")

    monkeypatch.setattr(compute, "_step", lambda kind: fail)
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO("{}"))
    assert compute.remote_step_main("view", "t2") == 1
    assert capsys.readouterr().out.splitlines()[-1] == "@@failed nope"


def test_remote_step_refuses_local_kinds(config):
    assert compute.remote_step_main("pull", "t") == 2
