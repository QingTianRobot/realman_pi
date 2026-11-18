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
    # the compute host's rules: no forwarded local temp dirs, known host keys only, every command inside the work dir
    assert argv[:8] == ["env", "-u", "TMPDIR", "-u", "TEMP", "-u", "TMP", "ssh"]
    assert argv[8] == "-F" and argv[9].endswith("Traning_area/.ssh/config")
    assert "BatchMode=yes" in argv and "StrictHostKeyChecking=yes" in argv and argv[-2:] == ["EI", "cd /w && true"]


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


def test_gpu_query_failure_is_reported_not_raised(config):
    runner = FakeRunner().on("nvidia-smi", returncode=255, stdout="timeout")
    data = compute.gpu_query(config, runner)
    assert data["available"] is False and "EI" in data["error"]


def test_sync_code_sends_the_package_and_the_training_config(config):
    runner = FakeRunner()
    compute.sync_code(config, runner, RecordingLog())
    sent = runner.commands("rsync")
    assert any(c[-1] == "EI:/w/src/realman_pi/src/training/realman_training/" for c in sent)
    assert any(c[-1] == "EI:/w/src/realman_pi/config/training/" for c in sent)
    package = [c for c in sent if c[-1].endswith("realman_training/")]
    assert package and all({"--exclude=/test/", "--exclude=/web/", "--exclude=/realman_training/static/",
                            "--exclude=__pycache__/"} <= set(c) for c in package)
    assert all(compute.RSYNC_IO_TIMEOUT in c for c in sent)  # the link to the compute host is slow and lossy


def test_sync_code_checks_the_package_runs_on_the_compute_host(config):
    runner = FakeRunner()
    log = RecordingLog()
    compute.sync_code(config, runner, log)
    smoke = runner.calls[-1]
    assert "ssh" in smoke and "_gpus" in smoke[-1] and "/w/src/openpi/.venv/bin/python" in smoke[-1]
    assert "remote package ok" in log.text()
    from realman_training.runner import CommandFailed

    with pytest.raises(CommandFailed):
        compute.sync_code(config, FakeRunner().on("_gpus", returncode=1, stdout="ModuleNotFoundError: yaml"),
                          RecordingLog())


def test_setup_checks_the_openpi_ref_reads_the_console_dataset_dir():
    script = compute.SETUP_SCRIPT.read_text(encoding="utf-8")
    check = script.index("grep -q OPENPI_REALMAN_DATASET_DIR src/openpi/training/config.py")
    assert script.index("git checkout --detach FETCH_HEAD") < check < script.index("uv sync")
    assert "QingTianRobot/openpi#6" in script[check:script.index("uv sync")]


def test_setup_host_streams_the_script_over_ssh(config):
    runner = FakeRunner().on("bash -s", lines=["ok"])
    compute.setup_host(config, runner, RecordingLog(), openpi_ref="abc123")
    call = runner.commands("bash -s")[0]
    assert call[-1] == "cd /w && bash -s -- /w abc123"
    assert runner.inputs[-1].startswith("#!/usr/bin/env bash")  # the script itself goes over stdin


def test_gpu_query_timeout_is_reported_not_raised(config):
    import subprocess

    def hang(argv, input):
        raise subprocess.TimeoutExpired(argv, 30)

    data = compute.gpu_query(config, FakeRunner().on("nvidia-smi", action=hang))
    assert data["available"] is False and "EI" in data["error"] and data["gpus"] == []


def test_gpu_query_empty_answer_is_reported_not_raised(config):
    data = compute.gpu_query(config, FakeRunner().on("nvidia-smi", stdout=""))
    assert data["available"] is False and "EI" in data["error"]


@pytest.fixture()
def checkout_config(tmp_path):
    """A config loaded from a repo checkout other than this package's (the container's bind-mounted TRAINING_REPO)."""
    repo = tmp_path / "checkout"
    path = repo / "config" / "training" / "training_console.yaml"
    path.parent.mkdir(parents=True)
    path.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        "  compute:\n    ssh_host: EI\n    ssh_config: Traning_area/.ssh/config\n    workdir: /w\n",
        encoding="utf-8",
    )
    return repo.resolve(), load_config(path)


def test_checkout_root_is_the_repo_that_holds_the_config(checkout_config, config):
    repo, cfg = checkout_config
    assert compute.checkout_root(cfg) == repo
    assert compute.checkout_root(config) == compute.REPO_ROOT  # not under config/training: this package's repo


def test_a_relative_ssh_config_resolves_under_the_config_checkout(checkout_config):
    repo, cfg = checkout_config
    argv = compute.ssh_argv(cfg, "true")
    i = argv.index("-F")
    assert argv[i:i + 2] == ["-F", str(repo / "Traning_area/.ssh/config")]


def test_sync_code_sends_the_config_checkout_training_dir_and_this_package(checkout_config):
    repo, cfg = checkout_config
    runner = FakeRunner()
    compute.sync_code(cfg, runner, RecordingLog())
    sent = runner.commands("rsync")
    config_rsync = [c for c in sent if c[-1] == "EI:/w/src/realman_pi/config/training/"]
    assert config_rsync and config_rsync[0][-2] == f"{repo / 'config' / 'training'}/"
    package = [c for c in sent if c[-1] == "EI:/w/src/realman_pi/src/training/realman_training/"]
    assert package and package[0][-2] == f"{compute.REPO_ROOT / compute.PACKAGE}/"  # the code actually running


def _orphan_env(monkeypatch, config, step, grace=None):
    """_remote-step train whose ssh pipe is broken: every print raises; os._exit is recorded (raises SystemExit only
    on the main thread, where the step would see it)."""
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO("{}"))
    monkeypatch.setattr(compute, "_step", lambda kind: step)
    monkeypatch.setattr(compute, "print", lambda *a, **k: (_ for _ in ()).throw(BrokenPipeError()), raising=False)
    if grace is not None:
        monkeypatch.setattr(compute, "orphan_grace_sec", lambda config: grace)
    exits = []
    pid_file = config.openpi.docker_data / "console_run" / "step-gone.pid"
    monkeypatch.setattr(compute.os, "_exit", lambda code: exits.append((code, pid_file.exists())))
    return exits, pid_file


def test_a_cancel_after_the_pipe_broke_still_stops_the_training(monkeypatch, config):
    """JobStore.cancel kills the local ssh client first: the pipe breaks, then _remote-cancel SIGTERMs the step."""
    reached = []

    def step(params, log):
        log("following")                      # the pipe is already broken
        try:
            signal_handler = __import__("signal").getsignal(__import__("signal").SIGTERM)
            signal_handler(15, None)          # _remote-cancel's SIGTERM
        except JobCancelled:
            log("cancelled: stopping the run")  # train logs before compose.stop
            reached.append("stop")
            log.progress(1, 2, "late")
            raise

    exits, pid_file = _orphan_env(monkeypatch, config, step)
    assert compute.remote_step_main("train", "gone") == 1
    assert reached == ["stop"] and exits == [] and not pid_file.exists()


def test_an_orphaned_train_follower_leaves_after_the_grace(monkeypatch, config):
    import time

    after = []

    def step(params, log):
        log("following")
        time.sleep(0.3)  # the follower would poll on; the timer fires meanwhile
        after.append("still here")
        return {}

    exits, pid_file = _orphan_env(monkeypatch, config, step, grace=0.05)
    compute.remote_step_main("train", "gone")
    assert exits == [(0, False)]


def test_a_cancel_during_the_grace_keeps_the_follower_for_its_cleanup(monkeypatch, config):
    import signal
    import time

    reached = []

    def step(params, log):
        log("following")  # orphaned: the timer starts
        try:
            signal.getsignal(signal.SIGTERM)(15, None)
        except JobCancelled:
            time.sleep(0.3)  # stop + remove take a while; the timer fires meanwhile
            reached.append("stopped")
            raise

    exits, pid_file = _orphan_env(monkeypatch, config, step, grace=0.05)
    assert compute.remote_step_main("train", "gone") == 1
    assert reached == ["stopped"] and exits == [] and not pid_file.exists()


def test_other_steps_keep_going_when_their_ssh_is_gone(monkeypatch, config):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO("{}"))
    monkeypatch.setattr(compute, "_step", lambda kind: (lambda params, log: (log("x"), {})[1]))
    monkeypatch.setattr(compute, "print", lambda *a, **k: (_ for _ in ()).throw(BrokenPipeError()), raising=False)
    monkeypatch.setattr(compute.os, "_exit", lambda code: pytest.fail("view must not leave"))
    assert compute.remote_step_main("view", "v") == 0


def test_tags_refresh_also_updates_the_compute_host(config, monkeypatch):
    """The mirror sync copies the compute host's data_root over the console's: a refresh made here must reach it."""
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    dataset = config.data_root / "raw_x" / "ds"
    dataset.mkdir(parents=True)

    def refresh(params, log, runner=None):
        (Path(params["path"]) / "episode_tags.json").write_text("{}", encoding="utf-8")
        return {"path": str(Path(params["path"]).resolve()), "episodes": 3}

    routed = compute.route("tags_refresh", STEPS["tags_refresh"], refresh, {})
    assert routed is not refresh
    runner = FakeRunner()
    result = routed({"path": str(dataset)}, RecordingLog(), runner=runner)
    assert result["episodes"] == 3
    push = runner.commands("rsync")
    assert len(push) == 1 and compute.RSYNC_IO_TIMEOUT in push[0]
    assert push[0][-2] == str(dataset.resolve() / "episode_tags.json")
    assert push[0][-1] == "EI:/w/data/realman/raw_x/ds/episode_tags.json"
    assert runner.commands("test -d /w/data/realman/raw_x/ds")


def test_tags_of_a_dataset_not_on_the_compute_host_stay_here(config, monkeypatch):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    dataset = config.data_root / "local_only"
    dataset.mkdir(parents=True)
    routed = compute.route("tags_refresh", STEPS["tags_refresh"],
                           lambda params, log, runner=None: {"path": str(dataset.resolve())}, {})
    runner = FakeRunner().on("test -d", returncode=1)
    log = RecordingLog()
    assert routed({"path": str(dataset)}, log, runner=runner) == {"path": str(dataset.resolve())}
    assert not runner.commands("rsync") and "local_only is not on EI; tags kept here only" in log.text()


def test_tags_push_fails_when_the_compute_host_cannot_be_asked(config, monkeypatch):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    dataset = config.data_root / "raw_x"
    dataset.mkdir(parents=True)
    routed = compute.route("tags_refresh", STEPS["tags_refresh"],
                           lambda params, log, runner=None: {"path": str(dataset.resolve())}, {})
    with pytest.raises(StepFailed, match="EI"):
        routed({"path": str(dataset)}, RecordingLog(), runner=FakeRunner().on("test -d", returncode=255))


def test_tags_refresh_fails_when_the_compute_host_is_not_updated(config, monkeypatch):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    dataset = config.data_root / "raw_x"
    dataset.mkdir(parents=True)
    routed = compute.route("tags_refresh", STEPS["tags_refresh"],
                           lambda params, log, runner=None: {"path": str(dataset.resolve())}, {})
    with pytest.raises(StepFailed, match="EI"):
        routed({"path": str(dataset)}, RecordingLog(), runner=FakeRunner().on("rsync", returncode=12, stdout="boom"))


def test_tags_refresh_is_local_only_without_a_compute_host(tmp_path, monkeypatch):
    path = tmp_path / "c.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path}\n", encoding="utf-8")
    monkeypatch.setattr(compute, "load_config", lambda p=None: load_config(path))
    real = object()
    assert compute.route("tags_refresh", STEPS["tags_refresh"], real, {}) is real


def test_cancelling_the_push_removes_the_local_copy_and_stays_a_cancel(config, monkeypatch):
    calls = []
    _fake_pull(monkeypatch, config, calls)
    target = config.data_root / "raw_x"

    def cancel(argv, input):
        raise JobCancelled()

    runner = FakeRunner().on("rsync", action=cancel)
    with pytest.raises(JobCancelled):
        compute.pull_and_push({"target": str(target)}, RecordingLog(), runner)
    assert calls == ["pull"] and not target.exists()


def test_mirror_reports_a_directory_it_cannot_create_instead_of_raising(config, tmp_path):
    import dataclasses

    blocker = tmp_path / "not_a_dir"
    blocker.write_text("x")
    broken = dataclasses.replace(config, openpi=dataclasses.replace(config.openpi, repo=blocker / "openpi"))
    log = RecordingLog()
    assert compute.sync_mirror(broken, FakeRunner(), log) is False
    assert any("mirror:" in line and "openpi" in line for line in log.lines)


def test_a_remote_failure_names_this_consoles_paths(config):
    lines = ["@@failed view written to /w/data/realman/v_view, but 3 episode(s) are bad; log /w/src/openpi/wandb/e.log"]
    runner = FakeRunner().on("_remote-step", lines=lines, returncode=1)
    with pytest.raises(StepFailed) as failure:
        compute.run_remote("view", {}, RecordingLog(), runner=runner, load=lambda _: config)
    message = str(failure.value)
    assert f"{config.data_root}/v_view," in message and f"{config.openpi.docker_data}/wandb/e.log" in message
    assert "/w/" not in message


def test_local_text_leaves_other_paths_alone(config):
    assert compute.local_text(config, "/w/data/realmanX and /etc/w/data/realman") == "/w/data/realmanX and /etc/w/data/realman"
    assert compute.local_text(config, "at /w/data/realman") == f"at {config.data_root}"


def test_every_rsync_runs_inside_the_work_dir(config, tmp_path):
    """rsync starts its own remote process: --rsync-path puts it behind the same `cd <workdir> &&` guard."""
    runner = FakeRunner()
    compute.sync_mirror(config, runner, RecordingLog())
    compute.sync_code(config, runner, RecordingLog())
    sent = runner.commands("rsync")
    assert sent and all("--rsync-path=cd /w && rsync" in c for c in sent)
    assert all(c[c.index("-e") + 1].startswith("env -u TMPDIR -u TEMP -u TMP ssh ") for c in sent)
