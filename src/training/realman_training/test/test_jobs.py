from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path

import pytest

from realman_training.jobs import JobConflict, JobStore

TEST_DIR = Path(__file__).resolve().parent


@pytest.fixture()
def store(tmp_path):
    return JobStore(tmp_path / "console", env={"PYTHONPATH": str(TEST_DIR)})


def wait_for(path: Path, timeout=10.0):
    end = time.time() + timeout
    while not path.exists():
        assert time.time() < end, f"{path} never appeared"
        time.sleep(0.05)


def test_a_job_runs_in_the_background_and_records_everything(store):
    job = store.start("pull", {"a": 1}, target="fake_steps:ok")
    status = store.wait(job.id, lambda line: None)
    assert status["state"] == "succeeded"
    assert status["result"] == {"echo": {"a": 1}}
    assert status["progress"]["text"] == "half way"
    assert "hello" in job.log_text()
    assert job.params() == {"kind": "pull", "target": "fake_steps:ok", "params": {"a": 1}}
    assert {p.name for p in job.dir.iterdir()} >= {"params.json", "status.json", "log.txt"}


def test_wait_streams_the_log_lines(store):
    lines = []
    job = store.start("pull", {}, target="fake_steps:ok")
    store.wait(job.id, lines.append)
    assert any(line.endswith("hello") for line in lines)


def test_an_expected_failure_and_a_crash_are_failed_with_the_reason(store):
    failed = store.wait(store.start("clean", {}, target="fake_steps:fail").id, lambda line: None)
    assert failed["state"] == "failed" and failed["error"] == "nope, and here is why"
    crashed = store.wait(store.start("clean", {}, target="fake_steps:crash").id, lambda line: None)
    assert crashed["state"] == "failed" and "ZeroDivisionError: boom" in crashed["error"]
    assert "Traceback" in store.get(crashed["id"]).log_text()


def test_one_job_of_a_kind_at_a_time(store, tmp_path):
    first = store.start("train", {"flag": str(tmp_path / "f1")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f1")
    with pytest.raises(JobConflict, match=first.id):
        store.start("train", {"flag": str(tmp_path / "f2")}, target="fake_steps:sleep")
    other = store.start("pull", {}, target="fake_steps:ok")  # another kind is fine
    assert store.wait(other.id, lambda line: None)["state"] == "succeeded"
    assert store.cancel(first.id)
    assert store.wait(first.id, lambda line: None)["state"] == "cancelled"
    again = store.start("train", {"flag": str(tmp_path / "f3")}, target="fake_steps:sleep")
    store.cancel(again.id)
    store.wait(again.id, lambda line: None)


def test_a_restarted_store_reattaches_a_live_job(store, tmp_path):
    job = store.start("train", {"flag": str(tmp_path / "f")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f")
    fresh = JobStore(store.root)
    assert fresh.recover() == []
    assert fresh.running("train").id == job.id
    fresh.cancel(job.id)
    assert fresh.wait(job.id, lambda line: None)["state"] == "cancelled"


def test_a_killed_job_is_marked_interrupted_and_frees_its_kind(store, tmp_path):
    job = store.start("train", {"flag": str(tmp_path / "f")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f")
    os.killpg(job.status()["pid"], signal.SIGKILL)
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            os.kill(job.status()["pid"], 0)
        except ProcessLookupError:
            break
        store.list()  # reaps finished children
        time.sleep(0.05)
    assert JobStore(store.root).recover() == [job.id]
    status = job.status()
    assert status["state"] == "interrupted" and status["ended"]
    assert store.running("train") is None
    ok = store.start("train", {}, target="fake_steps:ok")
    assert store.wait(ok.id, lambda line: None)["state"] == "succeeded"


def test_a_job_whose_starter_died_before_spawning_is_interrupted(store):
    folder = store.root / "jobs" / "20261020-000000-pull-dead"
    folder.mkdir(parents=True)
    (folder / "status.json").write_text(json.dumps({"id": folder.name, "kind": "pull", "state": "starting", "pid": None}))
    (folder / "params.json").write_text(json.dumps({"kind": "pull", "target": "x:y", "params": {}}))
    assert store.recover() == [folder.name]


def test_a_recorded_pid_that_was_reused_is_not_the_job(store):
    proc = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(30)"])
    try:
        folder = store.root / "jobs" / "20261020-000001-pull-reuse"
        folder.mkdir(parents=True)
        status = {"id": folder.name, "kind": "pull", "state": "running", "pid": proc.pid, "proc_start": "1"}
        (folder / "status.json").write_text(json.dumps(status))
        (folder / "params.json").write_text(json.dumps({"kind": "pull", "target": "x:y", "params": {}}))
        expected = [folder.name] if Path("/proc").is_dir() else []  # macOS has no /proc start time to compare
        assert store.recover() == expected
    finally:
        proc.kill()
        proc.wait()


def test_list_is_newest_first_and_filters_by_kind(store):
    a = store.start("pull", {}, target="fake_steps:ok")
    store.wait(a.id, lambda line: None)
    time.sleep(1.1)
    b = store.start("clean", {}, target="fake_steps:ok")
    store.wait(b.id, lambda line: None)
    assert [j.id for j in store.list()][:2] == [b.id, a.id]
    assert [j.id for j in store.list(kind="pull")] == [a.id]
    assert store.list(limit=1)[0].id == b.id


def test_unknown_kinds_are_refused(store):
    with pytest.raises(KeyError):
        store.start("format_disk", {})


def test_cancel_before_pid_written_still_completes_as_cancelled(store):
    job = store.start("pull", {}, target="fake_steps:ok")
    assert store.cancel(job.id)  # may fire before child writes its pid
    status = store.wait(job.id, lambda line: None)
    assert status["state"] == "cancelled"


def test_cancel_twice_still_ends_cancelled(store, tmp_path):
    job = store.start("train", {"flag": str(tmp_path / "f")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f")
    assert store.cancel(job.id)
    assert store.cancel(job.id)  # second cancel; fire-once handler means SIG_IGN, no exception on cleanup
    status = store.wait(job.id, lambda line: None)
    assert status["state"] == "cancelled"
