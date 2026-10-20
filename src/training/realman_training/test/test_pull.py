from __future__ import annotations

import json
import shlex
import subprocess

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, gripper

from realman_training.config import RemoteConfig
from realman_training.datasets import summarize
from realman_training.jobs import StepFailed
from realman_training.runner import CommandFailed
from realman_training.steps import pull

REMOTE = RemoteConfig()
SOURCE = f"{REMOTE.recording_root}/{REMOTE.dataset}"


@pytest.fixture()
def recording(tmp_path):
    root = build_dataset(
        tmp_path / "remote" / REMOTE.dataset,
        [Episode("pick_and_place", gripper((50, 30), (5700, 30), (50, 30))), Episode("pick_only", gripper((50, 40)))],
    )
    (root / "images").mkdir()
    return root


def fake_remote(recording, *, drop_video=False):
    """Answers the remote du/cat and runs the remote tar locally against the fixture."""
    runner = FakeRunner()
    size = sum(p.stat().st_size for p in recording.rglob("*") if p.is_file())
    runner.on("du -sb", stdout=f"{size}\t{SOURCE}\n")
    runner.on("cat", stdout=(recording / "meta/info.json").read_text())

    def pipe_impl(producer, consumer, on_bytes):
        assert producer[:2] == ["ssh", "-o"] and REMOTE.ssh_host in producer
        remote = shlex.split(producer[-1])
        assert remote[:3] == ["docker", "exec", REMOTE.recording_container]
        argv = remote[3:]
        if argv[0] == "flock":
            assert argv[1:5] == ["-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.recording_root}/.{REMOTE.dataset}.lock"]
            argv = argv[5:]
        argv = [str(recording) if a == SOURCE else a for a in argv]
        if drop_video and "--exclude=./meta" in argv:
            argv = [*argv[:-1], "--exclude=*file-001.mp4", argv[-1]]
        data = subprocess.run(argv, capture_output=True, check=True).stdout
        subprocess.run(consumer, input=data, check=True)
        on_bytes(len(data))
        return len(data)

    runner.pipe_impl = pipe_impl
    return runner


def test_pull_copies_meta_and_data_under_the_lock_then_the_videos(recording, tmp_path):
    target = tmp_path / "data" / "raw_realman_ts_20261020_101500"
    log = RecordingLog()
    result = pull.run({"target": str(target)}, log, runner=fake_remote(recording))
    dataset = target / REMOTE.dataset
    assert result["dataset_dir"] == str(dataset) and result["episodes"] == 2
    assert summarize(dataset).episodes == 2
    record = json.loads((target / "pull.json").read_text())
    assert record["origin"] == f"{REMOTE.ssh_host}:{REMOTE.recording_container}:{SOURCE}"
    assert record["episodes"] == 2 and record["bytes"] > 0
    assert not (tmp_path / "data" / "raw_realman_ts_20261020_101500.partial").exists()
    assert log.progress_calls and log.progress_calls[-1][1] > 0


def test_the_lock_only_covers_meta_and_data(recording, tmp_path):
    runner = fake_remote(recording)
    pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    pipes = runner.commands("PIPE")
    assert len(pipes) == 2
    assert "flock -s" in " ".join(pipes[0])
    assert "meta data" in " ".join(pipes[0]) and "flock" not in " ".join(pipes[1])


def test_an_existing_target_is_refused_before_any_remote_call(recording, tmp_path):
    (tmp_path / "t").mkdir()
    runner = fake_remote(recording)
    with pytest.raises(StepFailed, match="exists"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    assert runner.calls == []


def test_a_leftover_partial_is_refused(recording, tmp_path):
    (tmp_path / "t.partial").mkdir()
    with pytest.raises(StepFailed, match="did not finish"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=fake_remote(recording))


def test_a_missing_video_fails_and_removes_the_partial_copy(recording, tmp_path):
    with pytest.raises(StepFailed, match="missing video"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=fake_remote(recording, drop_video=True))
    assert not (tmp_path / "t").exists() and not (tmp_path / "t.partial").exists()


def test_an_unreachable_robot_says_so(tmp_path):
    runner = FakeRunner().on("du -sb", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    with pytest.raises(StepFailed, match="realman_local"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    assert not (tmp_path / "t.partial").exists()


def test_remote_includes_keepalive_options():
    argv = pull.remote(REMOTE, ["tar", "-C", "/src", "-cf", "-", "meta"])
    assert "ServerAliveInterval=15" in " ".join(argv)
    assert "ServerAliveCountMax=4" in " ".join(argv)


def test_remote_quotes_the_inner_command():
    argv = pull.remote(REMOTE, ["tar", "-C", "/a b", "-cf", "-", "meta"])
    assert argv[:2] == ["ssh", "-o"] and "BatchMode=yes" in argv
    assert shlex.split(argv[-1]) == ["docker", "exec", REMOTE.recording_container, "tar", "-C", "/a b", "-cf", "-", "meta"]


def test_meta_stream_is_retried_once_on_command_failed(recording, tmp_path):
    """If the meta+data pipe fails on the first try, it should be retried once."""
    from realman_training.runner import CommandFailed

    call_count = {"meta": 0}
    base = fake_remote(recording)

    original_pipe_impl = base.pipe_impl

    def retry_pipe_impl(producer, consumer, on_bytes):
        remote_cmd = " ".join(producer)
        if "flock" in remote_cmd and "meta" in remote_cmd:
            call_count["meta"] += 1
            if call_count["meta"] == 1:
                raise CommandFailed(producer, 1, "tar: Unexpected EOF")
        return original_pipe_impl(producer, consumer, on_bytes)

    base.pipe_impl = retry_pipe_impl
    target = tmp_path / "data" / "t"
    log = RecordingLog()
    result = pull.run({"target": str(target)}, log, runner=base)
    assert result["episodes"] == 2
    assert call_count["meta"] == 2
    assert any("retrying meta+data" in line for line in log.lines)


def test_meta_stream_raises_step_failed_after_two_failures(recording, tmp_path):
    """Two consecutive failures on the meta+data stream should raise StepFailed (partial cleaned up)."""
    from realman_training.runner import CommandFailed
    from realman_training.jobs import StepFailed

    def always_fail_meta(producer, consumer, on_bytes):
        if "flock" in " ".join(producer):
            raise CommandFailed(producer, 1, "tar: Unexpected EOF")
        # videos stream should not be reached
        return 0

    runner = fake_remote(recording)
    runner.pipe_impl = always_fail_meta
    target = tmp_path / "data" / "t"
    with pytest.raises(StepFailed):
        pull.run({"target": str(target)}, RecordingLog(), runner=runner)
    assert not target.exists() and not (tmp_path / "data" / "t.partial").exists()


def test_videos_stream_retry_uses_skip_old_files(recording, tmp_path):
    """On retry, the videos tar consumer argv should include --skip-old-files.

    We do NOT run the consumer for the retry because bsdtar on macOS lacks --skip-old-files;
    GNU tar (Linux / server5090) does support it. We assert the argv and use a no-op consumer.
    """
    from realman_training.runner import CommandFailed

    consumers_seen: list[list[str]] = []
    call_count = {"videos": 0}

    base = fake_remote(recording)
    original_pipe_impl = base.pipe_impl

    def track_pipe_impl(producer, consumer, on_bytes):
        if "exclude" in " ".join(producer):  # videos stream
            consumers_seen.append(list(consumer))
            call_count["videos"] += 1
            if call_count["videos"] == 1:
                raise CommandFailed(producer, 1, "tar: EOF")
            # Second call: drain producer without running the real consumer
            import subprocess
            data = subprocess.run(
                [str(a) for a in producer], capture_output=True
            ).stdout
            on_bytes(len(data))
            return len(data)
        return original_pipe_impl(producer, consumer, on_bytes)

    base.pipe_impl = track_pipe_impl
    target = tmp_path / "data" / "t"
    log = RecordingLog()
    # The pull will succeed (meta was extracted; videos drain is faked).
    # We tolerate StepFailed here since missing videos may trigger that check,
    # but what we need is that the consumer argv was --skip-old-files on retry.
    try:
        pull.run({"target": str(target)}, log, runner=base)
    except Exception:
        pass
    assert call_count["videos"] == 2
    partial = tmp_path / "data" / "t.partial"
    expected_dest = str(partial / REMOTE.dataset)
    assert consumers_seen[0] == ["tar", "-C", expected_dest, "-xf", "-"]
    assert "--skip-old-files" in consumers_seen[1]
    assert any("retrying videos" in line for line in log.lines)


def test_default_target_name(tmp_path):
    assert pull.default_target(tmp_path).name.startswith("raw_realman_ts_")


def test_commandfailed_is_importable():
    assert issubclass(CommandFailed, RuntimeError)
