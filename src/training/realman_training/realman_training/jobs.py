"""Background jobs: one directory per job (params.json, status.json, log.txt), one running job per kind.

The child process (`python -m realman_training _job-run <dir>`) holds an flock on locks/<kind>.lock for its whole
life, so a second job of the same kind is refused and a crashed child frees the slot by itself. The child writes
its own status; after a restart, active jobs whose process is gone are marked interrupted.
"""

from __future__ import annotations

import datetime
import fcntl
import importlib
import json
import os
import secrets
import signal
import subprocess
import sys
import time
import traceback
from pathlib import Path
from typing import Callable

STEPS = {
    kind: f"realman_training.steps.{kind}:run"
    for kind in ("pull", "clean", "view", "norm", "train", "eval", "register")
}
ACTIVE = ("starting", "running")
FINAL = ("succeeded", "failed", "cancelled", "interrupted")
PACKAGE_PARENT = str(Path(__file__).resolve().parents[1])
_LOCK_WAIT_DEADLINE = 5.0  # seconds to wait for an exiting child to release its kind lock


class StepFailed(RuntimeError):
    """A step's expected failure (refused target, busy GPU, bad labels): shown without a traceback."""


class JobCancelled(BaseException):
    """Raised inside the step when the job is cancelled; steps catch it only to clean up, then re-raise."""


class JobConflict(RuntimeError):
    pass


def now() -> str:
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def write_json(path: Path, data: dict) -> None:
    tmp = path.with_name(f"{path.name}.{os.getpid()}.{secrets.token_hex(2)}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, path)


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _proc_stat(pid: int) -> list[str] | None:
    try:
        return Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()
    except OSError:
        return None


def process_start(pid: int) -> str | None:
    """Kernel start time of a process (Linux), so a reused pid is not mistaken for the job."""
    fields = _proc_stat(pid)
    return fields[19] if fields else None


def _alive(pid: int, start: str | None) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        pass
    fields = _proc_stat(pid)
    if fields is None:
        return True  # no /proc (macOS): trust the pid
    return fields[0] != "Z" and (start is None or fields[19] == start)


class StepLog:
    def __init__(self, write_line: Callable[[str], None], set_progress: Callable[[float, float | None, str], None]):
        self._write_line, self._set_progress = write_line, set_progress

    def __call__(self, message: str) -> None:
        self._write_line(message)

    def progress(self, done: float, total: float | None = None, text: str = "") -> None:
        self._set_progress(done, total, text)


class Job:
    def __init__(self, folder: Path):
        self.dir = Path(folder)
        self.id = self.dir.name

    @property
    def kind(self) -> str:
        return self.status().get("kind", "")

    def status(self) -> dict:
        return _read_json(self.dir / "status.json")

    def params(self) -> dict:
        return _read_json(self.dir / "params.json")

    def log_text(self, tail_lines: int | None = None) -> str:
        path = self.dir / "log.txt"
        text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
        if tail_lines is None:
            return text
        return "\n".join(text.splitlines()[-tail_lines:]) if tail_lines > 0 else ""


class JobStore:
    def __init__(self, root: str | Path, *, env: dict[str, str] | None = None):
        self.root = Path(root)
        (self.root / "jobs").mkdir(parents=True, exist_ok=True)
        (self.root / "locks").mkdir(parents=True, exist_ok=True)
        self._env = env or {}
        self._children: list[subprocess.Popen] = []

    def _lock_path(self, kind: str) -> Path:
        return self.root / "locks" / f"{kind}.lock"

    def _child_env(self, lock_fd: int) -> dict[str, str]:
        env = {**os.environ, **self._env}
        env["PYTHONPATH"] = os.pathsep.join(p for p in (PACKAGE_PARENT, env.get("PYTHONPATH", "")) if p)
        env["REALMAN_JOB_LOCK_FD"] = str(lock_fd)
        return env

    def start(self, kind: str, params: dict, *, target: str | None = None) -> Job:
        if kind not in STEPS:
            raise KeyError(kind)
        target = target or STEPS[kind]
        fd = os.open(self._lock_path(kind), os.O_CREAT | os.O_RDWR, 0o644)
        try:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                # Retry loop: the lock may be held by a child that just wrote its final status
                # but hasn't exited yet (sub-second window), OR by a genuinely running job.
                deadline = time.monotonic() + _LOCK_WAIT_DEADLINE
                while True:
                    running = self.running(kind)
                    if running is not None:
                        raise JobConflict(f"a {kind} job is already running: {running.id}") from None
                    if time.monotonic() >= deadline:
                        raise JobConflict(
                            f"a {kind} job is finishing or something else holds locks/{kind}.lock"
                        ) from None
                    time.sleep(0.05)
                    try:
                        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        break
                    except BlockingIOError:
                        pass
            job_id = f"{datetime.datetime.now():%Y%m%d-%H%M%S}-{kind}-{secrets.token_hex(2)}"
            folder = self.root / "jobs" / job_id
            folder.mkdir()
            write_json(folder / "params.json", {"kind": kind, "target": target, "params": params})
            write_json(
                folder / "status.json",
                {"id": job_id, "kind": kind, "state": "starting", "created": now(), "pid": None},
            )
            with open(folder / "log.txt", "ab") as log:
                proc = subprocess.Popen(
                    [sys.executable, "-m", "realman_training", "_job-run", str(folder)],
                    stdin=subprocess.DEVNULL,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    start_new_session=True,
                    pass_fds=(fd,),
                    env=self._child_env(fd),
                )
            self._children.append(proc)
            return Job(folder)
        finally:
            os.close(fd)  # the child keeps its inherited copy, and with it the lock

    def _reap(self) -> None:
        self._children = [proc for proc in self._children if proc.poll() is None]

    def get(self, job_id: str) -> Job:
        folder = self.root / "jobs" / job_id
        if not (folder / "status.json").is_file():
            raise KeyError(f"no job {job_id}")
        return Job(folder)

    def list(self, kind: str | None = None, limit: int | None = None) -> list[Job]:
        self._reap()
        jobs = [Job(p) for p in sorted((self.root / "jobs").iterdir(), reverse=True) if (p / "status.json").is_file()]
        if kind:
            jobs = [j for j in jobs if j.status().get("kind") == kind]
        return jobs[:limit] if limit else jobs

    def _dead(self, status: dict) -> bool:
        if status.get("state") not in ACTIVE:
            return False
        pid = status.get("pid")
        if pid:
            return not _alive(int(pid), status.get("proc_start"))
        fd = os.open(self._lock_path(status["kind"]), os.O_CREAT | os.O_RDWR, 0o644)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return True  # nobody holds the kind's lock: the starter died before the child ran
        except BlockingIOError:
            return False
        finally:
            os.close(fd)

    def running(self, kind: str) -> Job | None:
        for job in self.list(kind=kind):
            status = job.status()
            if status.get("state") in ACTIVE and not self._dead(status):
                return job
        return None

    def recover(self) -> list[str]:
        interrupted = []
        for job in self.list():
            status = job.status()
            if self._dead(status):
                # Re-read right before writing to avoid a race with the child finishing
                fresh = job.status()
                if fresh.get("state") not in ACTIVE:
                    continue
                fresh.update(state="interrupted", ended=now(), error="the job process ended without a final status")
                write_json(job.dir / "status.json", fresh)
                interrupted.append(job.id)
        return interrupted

    def cancel(self, job_id: str) -> bool:
        job = self.get(job_id)
        status = job.status()
        if status.get("state") not in ACTIVE:
            return False
        if self._dead(status):
            return False
        # Write marker so the child sees it even if it has not yet registered a pid
        (job.dir / "cancel").touch()
        # Re-read: a pid may have appeared between our first read and touching the marker
        status = job.status()
        pid = status.get("pid")
        if pid and not self._dead(status):
            try:
                os.killpg(int(pid), signal.SIGTERM)
            except ProcessLookupError:
                pass
        return True

    def wait(self, job_id: str, on_line: Callable[[str], None], poll: float = 0.3) -> dict:
        job = self.get(job_id)
        offset = 0
        pending = b""
        while True:
            status = job.status()
            path = job.dir / "log.txt"
            if path.exists():
                with path.open("rb") as handle:
                    handle.seek(offset)
                    chunk = handle.read()
                offset += len(chunk)
                pending += chunk
                *complete, pending = pending.split(b"\n")
                for line in complete:
                    on_line(line.decode(errors="replace"))
            if status.get("state") in FINAL:
                if pending:
                    on_line(pending.decode(errors="replace"))
                return status
            if self._dead(status):
                self.recover()
                continue
            self._reap()
            time.sleep(poll)


def run_job(folder: str | Path) -> int:
    folder = Path(folder)

    # Mark the inherited lock fd non-inheritable so grandchildren don't hold it
    lock_fd_str = os.environ.get("REALMAN_JOB_LOCK_FD")
    if lock_fd_str is not None:
        try:
            os.set_inheritable(int(lock_fd_str), False)
        except OSError:
            pass

    status_path = folder / "status.json"
    spec = _read_json(folder / "params.json")
    status = _read_json(status_path)

    # Install signal handlers BEFORE writing the running status so a cancel
    # arriving in that window uses the handler rather than the default action.
    def on_signal(signum, frame):
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        raise JobCancelled()

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)

    status.update(state="running", pid=os.getpid(), proc_start=process_start(os.getpid()), started=now())
    write_json(status_path, status)

    def line(message: str) -> None:
        print(f"{datetime.datetime.now():%H:%M:%S} {message}", flush=True)

    def progress(done: float, total: float | None, text: str) -> None:
        status["progress"] = {"done": done, "total": total, "text": text, "at": now()}
        write_json(status_path, status)

    try:
        # Check cancel file before running the step (handles cancels in starting state)
        if (folder / "cancel").exists():
            raise JobCancelled()
        module, function = spec["target"].split(":")
        step = getattr(importlib.import_module(module), function)
        status.update(state="succeeded", result=step(spec["params"], StepLog(line, progress)))
    except JobCancelled:
        line("cancelled")
        status.update(state="cancelled", error="cancelled")
    except StepFailed as error:
        line(f"FAILED: {error}")
        status.update(state="failed", error=str(error))
    except Exception as error:  # noqa: BLE001 - every crash must end as a failed status
        traceback.print_exc()
        sys.stdout.flush()
        status.update(state="failed", error=f"{type(error).__name__}: {error}")
    # Ignore late signals so a second cancel cannot corrupt the final status write.
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    status["ended"] = now()
    write_json(status_path, status)
    # Release the lock fd explicitly so the kind slot is freed before Python runtime teardown.
    if lock_fd_str is not None:
        try:
            os.close(int(lock_fd_str))
        except OSError:
            pass
    return 0 if status["state"] == "succeeded" else 1
