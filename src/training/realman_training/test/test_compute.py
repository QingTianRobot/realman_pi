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


def test_cancel_before_the_step_starts_is_recorded_and_honoured(monkeypatch, capsys, config):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    assert compute.remote_cancel_main("early") == 0
    marker = config.openpi.docker_data / "console_run" / "step-early.cancel"
    assert marker.exists()
    ran = []
    monkeypatch.setattr(compute, "_step", lambda kind: (lambda params, log: ran.append(kind) or {}))
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO("{}"))
    assert compute.remote_step_main("train", "early") == 1
    assert ran == [] and not marker.exists()
    assert capsys.readouterr().out.splitlines()[-1] == "@@cancelled"
    assert not (config.openpi.docker_data / "console_run" / "step-early.pid").exists()


def test_cancel_with_a_pid_sends_sigterm(monkeypatch, config):
    import signal

    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    pid_file = config.openpi.docker_data / "console_run" / "step-live.pid"
    pid_file.parent.mkdir(parents=True)
    pid_file.write_text("4242", encoding="utf-8")
    killed = []
    monkeypatch.setattr(compute.os, "kill", lambda pid, sig: killed.append((pid, sig)))
    assert compute.remote_cancel_main("live") == 0
    assert killed == [(4242, signal.SIGTERM)]
    assert not (config.openpi.docker_data / "console_run" / "step-live.cancel").exists()


def _ticking_clock():
    now = [0.0]

    def clock():
        now[0] += 100.0
        return now[0]

    return clock


def test_periodic_mirror_sync_runs_in_the_background_one_at_a_time(config):
    import threading

    release, order = threading.Event(), []
    periodic_started = []

    def rsync(argv, input):
        if not periodic_started:
            periodic_started.append(argv)
            order.append("sync waiting")
            assert release.wait(5), "the stream never finished while the periodic sync was held"
            order.append("sync done")

    progress = ['@@progress {"done": %d, "total": 5}' % i for i in range(1, 6)]
    runner = FakeRunner().on("rsync", action=rsync).on(
        "_remote-step", lines=[*progress, '@@result {"ok": 1}'])
    inner_stream = runner.stream

    def stream(argv, on_line, **kwargs):
        code = inner_stream(argv, on_line, **kwargs)
        order.append("stream done")
        release.set()
        return code

    runner.stream = stream
    result = compute.run_remote("norm", {}, RecordingLog(), runner=runner, clock=_ticking_clock(),
                                load=lambda _: config)
    assert result == {"ok": 1}
    # the stream finished while the periodic sync was still held, and the final sync waited for it
    assert "sync waiting" in order and order.index("stream done") < order.index("sync done")
    # one periodic sync (4 rsyncs) despite 5 due progress lines, then the final sync (4 rsyncs)
    assert len(runner.commands("rsync")) == 8


def test_mirror_rsyncs_have_an_io_timeout(config):
    runner = FakeRunner()
    compute.sync_mirror(config, runner, RecordingLog())
    assert all("--timeout=120" in c for c in runner.commands("rsync")) and len(runner.commands("rsync")) == 4


def test_malformed_progress_or_result_lines_do_not_abort_the_stream(config):
    runner = FakeRunner().on("_remote-step", lines=["@@progress {oops", "after", "@@result {bad"])
    log = RecordingLog()
    with pytest.raises(StepFailed, match="without a result"):
        compute.run_remote("view", {}, log, runner=runner, load=lambda _: config)
    assert "@@progress {oops" in log.lines and "after" in log.lines and "@@result {bad" in log.lines


def test_lost_connection_cancels_orphans_but_not_train(config):
    lost = FakeRunner().on("_remote-step", returncode=255).on("_remote-cancel", returncode=1)
    with pytest.raises(StepFailed, match="lost the connection"):
        compute.run_remote("norm", {}, RecordingLog(), runner=lost, load=lambda _: config)
    assert lost.commands("_remote-cancel")
    train = FakeRunner().on("_remote-step", returncode=255)
    with pytest.raises(StepFailed, match="attach"):
        compute.run_remote("train", {}, RecordingLog(), runner=train, load=lambda _: config)
    assert not train.commands("_remote-cancel")


def test_failed_config_py_rsync_is_logged(config):
    runner = FakeRunner().on("config.py", returncode=23, stdout="denied")
    log = RecordingLog()
    assert compute.sync_mirror(config, runner, log) is False
    assert any("config.py" in line and "denied" in line for line in log.lines)


from realman_training.jobs import STEPS


def test_route_keeps_local_steps_and_fakes(config, monkeypatch):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    real = object()
    assert compute.route("serve", STEPS["serve"], real, {}) is real          # not a remote kind
    assert compute.route("train", "tests.fake:run", real, {}) is real        # a fake target is never rerouted
    routed = compute.route("train", STEPS["train"], real, {})
    assert routed.func is compute.run_remote and routed.args == ("train",)
    assert compute.route("pull", STEPS["pull"], real, {}) is compute.pull_and_push


def test_route_is_a_no_op_without_a_compute_host(tmp_path, monkeypatch):
    path = tmp_path / "c.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path}\n", encoding="utf-8")
    monkeypatch.setattr(compute, "load_config", lambda p=None: load_config(path))
    real = object()
    assert compute.route("train", STEPS["train"], real, {}) is real


def test_push_dataset_copies_then_drops_local_videos(config):
    target = config.data_root / "raw_x"
    (target / "ds" / "videos").mkdir(parents=True)
    (target / "ds" / "meta").mkdir()
    runner = FakeRunner().on("test ! -e", returncode=0)
    remote = compute.push_dataset(config, runner, RecordingLog(), target)
    assert remote == "/w/data/realman/raw_x"
    rsync = runner.commands("rsync")[0]
    assert rsync[-2] == f"{target}/" and rsync[-1] == "EI:/w/data/realman/raw_x.partial/"
    assert compute.RSYNC_IO_TIMEOUT in rsync
    assert runner.commands("mv /w/data/realman/raw_x.partial /w/data/realman/raw_x")
    assert not (target / "ds" / "videos").exists() and (target / "ds" / "meta").exists()


def test_push_dataset_refuses_an_existing_remote(config):
    target = config.data_root / "raw_x"
    target.mkdir(parents=True)
    with pytest.raises(StepFailed, match="exists on EI"):
        compute.push_dataset(config, FakeRunner().on("test ! -e", returncode=1), RecordingLog(), target)


def _index(runner, needle):
    return next(i for i, call in enumerate(runner.calls) if needle in " ".join(call))


def test_push_dataset_clears_a_stale_partial_before_the_rsync(config):
    target = config.data_root / "raw_x"
    target.mkdir(parents=True)
    runner = FakeRunner()
    compute.push_dataset(config, runner, RecordingLog(), target)
    rm = _index(runner, "rm -rf /w/data/realman/raw_x.partial")
    assert rm < _index(runner, "rsync") < _index(runner, "mv /w/data/realman/raw_x.partial")


def _fake_pull(monkeypatch, config, calls):
    from realman_training.steps import pull

    def run(params, log, runner=None):
        calls.append("pull")
        target = Path(params["target"])
        (target / "ds" / "videos").mkdir(parents=True)
        return {"target": str(target), "episodes": 3}

    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    monkeypatch.setattr(pull, "run", run)


@pytest.mark.parametrize("fail", ["rsync", "mv /w"])
def test_pull_and_push_removes_the_local_copy_when_the_push_fails(config, monkeypatch, fail):
    calls = []
    _fake_pull(monkeypatch, config, calls)
    target = config.data_root / "raw_x"
    runner = FakeRunner().on(fail, returncode=12, stdout="boom")
    with pytest.raises(StepFailed, match="pulled 3 episodes but the copy to EI failed: .*run the pull again"):
        compute.pull_and_push({"target": str(target)}, RecordingLog(), runner)
    assert calls == ["pull"] and not target.exists()


def test_pull_and_push_refuses_a_target_outside_data_root(config, monkeypatch, tmp_path):
    calls = []
    _fake_pull(monkeypatch, config, calls)
    runner = FakeRunner()
    with pytest.raises(StepFailed, match="data_root"):
        compute.pull_and_push({"target": str(tmp_path / "elsewhere")}, RecordingLog(), runner)
    assert calls == [] and runner.calls == []


def test_pull_and_push_refreshes_the_mirror_and_returns_the_compute_path(config, monkeypatch):
    calls = []
    _fake_pull(monkeypatch, config, calls)
    synced = []
    monkeypatch.setattr(compute, "sync_mirror", lambda c, r, log: synced.append(c) or True)
    target = config.data_root / "raw_x"
    result = compute.pull_and_push({"target": str(target)}, RecordingLog(), FakeRunner())
    assert result["compute_path"] == "/w/data/realman/raw_x" and result["episodes"] == 3
    assert synced == [config] and not (target / "ds" / "videos").exists()
