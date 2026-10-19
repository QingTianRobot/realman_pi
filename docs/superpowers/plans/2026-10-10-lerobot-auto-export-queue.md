# LeRobot Auto-Export Queue + Web Status — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recordings auto-enqueue LeRobot conversion on successful STOP, run conversions strictly one-at-a-time (FIFO), and expose a per-session conversion queue in the web dashboard, with DISCARD able to cancel a not-yet-started conversion.

**Architecture:** Replace the per-ADOPT `threading.Thread` with one `queue.Queue` + a single daemon worker thread in `recorder_node.py`. STOP success auto-calls the existing `adopt_final_session` (which already writes `decision=ADOPTED` + `export.state=QUEUED` + `requested_realtime_ns`) and enqueues. The worker re-checks the manifest `decision` before running and skips `DISCARDED` sessions. The web bridge gains `/api/lerobot/queue`, which scans `recording_root/*/manifest.json` (the existing source of truth) and returns the queue; live progress of the single running job still flows via the already-relayed `/recording/status`.

**Tech Stack:** Python 3.10, rclpy (Humble), `queue.Queue` + `threading`, aiohttp (web_server.py), pytest. No new dependencies.

**Spec:** The design decisions live in the preceding section of this file's git history and were confirmed by the user: auto-export with DISCARD as a cancel-before-run safety valve, and a full queue-panorama web view.

## Global Constraints

- Recorder (`recording_recorder`) and web bridge (`recording_web_bridge`) are separate ROS nodes in one container; they share state only through disk (manifests) and ROS topics.
- `manifest.json` is the durable source of truth for per-session `decision` and `export.state`; never add a second competing store.
- The exporter is already invoked off the ROS executor; the change must preserve that (recording START/STOP must never block on conversion).
- Only `READY` sessions with zero `write_errors`/`camera_write_errors` are exportable; FAILED sessions must never auto-export.
- `auto_export_on_stop` defaults to `true`; DISCARD of a session whose export is already `RUNNING` must not crash the worker (skip-while-running is out of scope; let it finish).

## Review Focus

1. A session adopted then discarded before its turn must export nothing and leave `decision=DISCARDED` — the worker's re-check, not queue removal alone, is what guarantees this.
2. Two rapid STOPs must enqueue two jobs and run them in FIFO order with zero overlap (no two `RUNNING` at once).
3. STOP of a session with write errors must enqueue nothing (state FAILED).
4. `auto_export_on_stop=false` must reproduce the old behavior (STOP seals READY, manual ADOPT required).
5. `/api/lerobot/queue` must tolerate a session directory with a corrupt/missing `manifest.json` by skipping it, not 500-ing the whole list.

## File Structure

- Create `src/recording/realman_recording/realman_recording/export_queue.py` — ROS-free FIFO worker (serializes export jobs, testable without ROS).
- Modify `src/recording/realman_recording/realman_recording/recorder_node.py` — declare `auto_export_on_stop`, build the `SerialExportWorker`, auto-adopt on STOP, replace `_queue_export`, skip DISCARDED in the worker.
- Modify `src/recording/realman_recording/realman_recording/session_store.py` — let `discard_final_session` also cancel a `QUEUED` (adopted, not-yet-running) session.
- Modify `src/recording/realman_recording/realman_recording/web_server.py` — add `/api/lerobot/queue`.
- Modify `src/recording/realman_recording/web/` — queue panel (frontend).
- Modify `config/ros/recording.yaml` — add `auto_export_on_stop`.
- Test `src/recording/realman_recording/test/test_export_queue.py`, `test_recorder_auto_export.py`, `test_session_store_discard.py`, `test_web_queue_endpoint.py`.

---

### Task 1: ROS-free serialized export queue

**Files:**
- Create: `src/recording/realman_recording/realman_recording/export_queue.py`
- Test: `src/recording/realman_recording/test/test_export_queue.py`

**Interfaces:**
- Produces: `class SerialExportWorker`, constructor `SerialExportWorker(run_one: Callable[[str], None])`, methods `.enqueue(session_id: str) -> None`, `.start() -> None`, `.stop() -> None`, `.drain() -> None`. `run_one` is called strictly sequentially, one `session_id` at a time, FIFO order.

- [ ] **Step 1: Write the failing test**

```python
# test_export_queue.py
import threading
import time
from realman_recording.export_queue import SerialExportWorker


def test_worker_runs_jobs_one_at_a_time_in_fifo_order():
    order: list[str] = []
    active = 0
    max_active = 0
    lock = threading.Lock()
    cond = threading.Condition(lock)

    def run_one(session_id: str) -> None:
        nonlocal active, max_active
        with cond:
            active += 1
            max_active = max(max_active, active)
        time.sleep(0.02)
        with cond:
            order.append(session_id)
            active -= 1

    worker = SerialExportWorker(run_one)
    worker.start()
    for sid in ("a", "b", "c"):
        worker.enqueue(sid)
    worker.drain()
    worker.stop()

    assert order == ["a", "b", "c"]
    assert max_active == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_export_queue.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_recording.export_queue'`

- [ ] **Step 3: Write minimal implementation**

```python
# export_queue.py
"""ROS-free FIFO worker that runs export jobs strictly one at a time."""
from __future__ import annotations

import queue
import threading
from typing import Callable


class SerialExportWorker:
    """Serialize arbitrary one-session-at-a-time jobs in FIFO order."""

    def __init__(self, run_one: Callable[[str], None]) -> None:
        self._run_one = run_one
        self._queue: "queue.Queue[str]" = queue.Queue()
        self._thread: threading.Thread | None = None
        self._stopping = threading.Event()

    def start(self) -> None:
        if self._thread is None or not self._thread.is_alive():
            self._thread = threading.Thread(target=self._loop, name="recording-export-worker", daemon=True)
            self._thread.start()

    def enqueue(self, session_id: str) -> None:
        self._queue.put(session_id)

    def drain(self) -> None:
        self._queue.join()

    def stop(self) -> None:
        self._stopping.set()
        if self._thread is not None:
            self._thread.join(timeout=5.0)

    def _loop(self) -> None:
        while not self._stopping.is_set():
            try:
                session_id = self._queue.get(timeout=0.2)
            except queue.Empty:
                continue
            try:
                self._run_one(session_id)
            finally:
                self._queue.task_done()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_export_queue.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/recording/realman_recording/realman_recording/export_queue.py src/recording/realman_recording/test/test_export_queue.py
git commit -m "feat(recording): add ROS-free serialized export worker"
```

---

### Task 2: `discard_final_session` cancels a queued (adopted, not-running) session

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/session_store.py:268-285`
- Test: `src/recording/realman_recording/test/test_session_store_discard.py`

**Interfaces:**
- Consumes: `SessionStore.finalize(...)` (produces `manifest.json` with `state=READY`, `decision=PENDING`), `SessionStore.adopt_final_session(...)` (sets `decision=ADOPTED`, `export.state=QUEUED`).
- Produces: `SessionStore.discard_final_session(directory, discarded_realtime_ns=None)` now accepts a session whose `decision=ADOPTED` **and** `export.state=QUEUED`, flipping `decision=DISCARDED`; still rejects `RUNNING`/`SUCCEEDED`/`FAILED`.

- [ ] **Step 1: Write the failing test**

```python
# test_session_store_discard.py
import json
import pytest
from realman_recording.session_store import SessionStore


def test_discard_cancels_a_queued_but_not_running_session(tmp_path):
    directory = tmp_path / "s"
    directory.mkdir()
    manifest = directory / "manifest.json"
    manifest.write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "QUEUED", "requested_realtime_ns": 1},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))
    SessionStore.discard_final_session(directory)
    payload = json.loads(manifest.read_text())
    assert payload["decision"] == "DISCARDED"


def test_discard_rejects_a_running_session(tmp_path):
    directory = tmp_path / "s"
    directory.mkdir()
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "RUNNING"},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))
    with pytest.raises(RuntimeError):
        SessionStore.discard_final_session(directory)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_session_store_discard.py -v`
Expected: FAIL — `discard_final_session` raises `RuntimeError` for the `ADOPTED`/`QUEUED` case.

- [ ] **Step 3: Write minimal implementation**

Replace the decision gate in `discard_final_session` (currently `if payload.get("decision") != "PENDING": raise`):

```python
export_state = (payload.get("export") or {}).get("state")
decision = payload.get("decision")
cancellable = decision == "ADOPTED" and export_state == "QUEUED"
if decision != "PENDING" and not cancellable:
    raise RuntimeError("recording session was already adopted or discarded")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_session_store_discard.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/recording/realman_recording/realman_recording/session_store.py src/recording/realman_recording/test/test_session_store_discard.py
git commit -m "feat(recording): let DISCARD cancel a queued (not running) export"
```

---

### Task 3: Wire the worker + auto-adopt-on-STOP into the recorder

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/recorder_node.py`
- Test: `src/recording/realman_recording/test/test_recorder_auto_export.py`

**Interfaces:**
- Consumes: `SerialExportWorker` (Task 1), `SessionStore` (existing), `_adopt_session`, `_export_adopted_session`.
- Produces: `recorder_node` now owns a single `SerialExportWorker`; STOP on a READY session auto-adopts+enqueues when `auto_export_on_stop` is true.

- [ ] **Step 1: Write the failing test** (pure decision logic, no live ROS)

Extract the decision into a tiny pure helper so it is testable without spinning rclpy:

```python
# test_recorder_auto_export.py
from realman_recording.recorder_node import should_auto_export


def test_auto_export_only_for_clean_ready_sessions():
    assert should_auto_export(auto_export_on_stop=True, final_success=True) is True
    assert should_auto_export(auto_export_on_stop=True, final_success=False) is False
    assert should_auto_export(auto_export_on_stop=False, final_success=True) is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_recorder_auto_export.py -v`
Expected: FAIL with `ImportError: cannot import name 'should_auto_export'`

- [ ] **Step 3: Write minimal implementation**

In `recorder_node.py`:

```python
def should_auto_export(*, auto_export_on_stop: bool, final_success: bool) -> bool:
    return auto_export_on_stop and final_success
```

In `__init__`, declare the parameter and build the worker:

```python
self.declare_parameter("auto_export_on_stop", True)
self._export_worker = SerialExportWorker(self._run_export_job)
self._export_worker.start()
```

Add a thin wrapper that adapts the worker's `session_id` callback to the existing `directory`-based exporter, and replace `_queue_export`:

```python
def _run_export_job(self, session_id: str) -> None:
    """Worker callback: resolve the session id and run one export."""
    self._export_adopted_session(self._session_directory(session_id))

def _queue_export(self, directory: Path, session_id: str) -> None:
    self._export_worker.enqueue(session_id)
```

In `_stop_session`, after the `READY/FAILED` assignment, auto-adopt:

```python
if final_success and bool(self.get_parameter("auto_export_on_stop").value):
    self._adopt_session(session_id)
```

In `_export_adopted_session`, before marking `RUNNING`, re-check the manifest and skip `DISCARDED`:

```python
def _export_adopted_session(self, directory: Path) -> None:
    try:
        decision = json.loads((directory / "manifest.json").read_text(encoding="utf-8")).get("decision")
    except (OSError, json.JSONDecodeError):
        decision = None
    if decision == "DISCARDED":
        self.get_logger().info(f"LeRobot export skipped: {directory.name} was discarded")
        return
    # ... existing export body unchanged ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_recorder_auto_export.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/recording/realman_recording/realman_recording/recorder_node.py src/recording/realman_recording/test/test_recorder_auto_export.py
git commit -m "feat(recording): auto-enqueue export on STOP via serialized worker"
```

---

### Task 4: `/api/lerobot/queue` endpoint

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/web_server.py` (add route)
- Modify: `src/recording/realman_recording/realman_recording/lerobot_web_replay.py` (add a manifest-scan helper)
- Test: `src/recording/realman_recording/test/test_web_queue_endpoint.py`

**Interfaces:**
- Consumes: `recording_root` (web_server already receives it), `manifest.json` layout (`state`, `decision`, `export.state`, `export.requested_realtime_ns`).
- Produces: `GET /api/lerobot/queue` returns `{"jobs": [{"session_id", "decision", "export_state", "requested_realtime_ns", "error"}]}` sorted by `requested_realtime_ns`.

- [ ] **Step 1: Write the failing test**

```python
# test_web_queue_endpoint.py
from realman_recording.lerobot_web_replay import queue_from_manifests


def test_queue_skips_missing_manifest_and_orders_by_request_time(tmp_path):
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "manifest.json").write_text('{"state":"READY","decision":"ADOPTED","export":{"state":"QUEUED","requested_realtime_ns":2}}')
    (tmp_path / "b").mkdir()
    (tmp_path / "b" / "manifest.json").write_text('{"state":"READY","decision":"ADOPTED","export":{"state":"QUEUED","requested_realtime_ns":1}}')
    (tmp_path / "corrupt").mkdir()  # no manifest.json
    jobs = queue_from_manifests(tmp_path)
    assert [j["session_id"] for j in jobs] == ["b", "a"]
    assert jobs[0]["export_state"] == "QUEUED"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_web_queue_endpoint.py -v`
Expected: FAIL with `ImportError: cannot import name 'queue_from_manifests'`

- [ ] **Step 3: Write minimal implementation**

In `lerobot_web_replay.py` add a pure helper:

```python
def queue_from_manifests(recording_root: Path) -> list[dict]:
    jobs = []
    for directory in recording_root.iterdir():
        manifest = directory / "manifest.json"
        if not manifest.is_file():
            continue
        try:
            payload = json.loads(manifest.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        export = payload.get("export") or {}
        jobs.append({
            "session_id": directory.name,
            "decision": payload.get("decision"),
            "export_state": export.get("state"),
            "requested_realtime_ns": export.get("requested_realtime_ns") or 0,
            "error": export.get("message", ""),
        })
    jobs.sort(key=lambda j: j["requested_realtime_ns"])
    return jobs
```

In `web_server.py`, register the route and handler (returns `web.json_response({"jobs": queue_from_manifests(self._recording_root)})`).

- [ ] **Step 4: Run test to verify it passes**

Run: `PYTHONPATH=src/recording/realman_recording /usr/bin/python3 -m pytest src/recording/realman_recording/test/test_web_queue_endpoint.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/recording/realman_recording/realman_recording/lerobot_web_replay.py src/recording/realman_recording/realman_recording/web_server.py src/recording/realman_recording/test/test_web_queue_endpoint.py
git commit -m "feat(recording): add /api/lerobot/queue endpoint"
```

---

### Task 5: Config default + frontend queue panel

**Files:**
- Modify: `config/ros/recording.yaml` (add `auto_export_on_stop: true`)
- Modify: `src/recording/realman_recording/web/` (queue panel, consumes `/api/lerobot/queue` + websocket `export_progress`)

**Interfaces:**
- Consumes: `/api/lerobot/queue` (Task 4), websocket snapshot's `export_progress`/`export_dir`/`export_error`.

- [ ] **Step 1: Add config** — append `auto_export_on_stop: true` under `/recording_recorder` ros__parameters with a comment explaining FAILED sessions never auto-export.

- [ ] **Step 2: Add the frontend panel** — a queue list grouped by state (排队中 / 转换中 / 已完成 / 失败), each row showing `session_id`, `export_state`, and (for the running row) the live `export_progress` percentage. Poll `/api/lerobot/queue` on load and on a 5s interval; overlay live progress from the websocket snapshot.

- [ ] **Step 3: Build the frontend**

Run: `cd website && npm run build:recording` (or the project's recording-asset build) and confirm the bundle compiles.

- [ ] **Step 4: Commit**

```bash
git add config/ros/recording.yaml src/recording/realman_recording/web/
git commit -m "feat(recording): auto_export_on_stop default and queue panel"
```

---

## Self-Review Notes

- Spec coverage: auto-trigger (Task 3), serialization (Task 1 + Task 3), DISCARD cancel (Task 2 + Task 3 skip), web queue panorama (Task 4 + Task 5). All four requirements map to tasks.
- Review Focus items are pinned: #1 → Task 2/Task 3 re-check, #2 → Task 1 test, #3 → Task 3 `should_auto_export(final_success=False)`, #4 → Task 3 `auto_export_on_stop=False`, #5 → Task 4 corrupt-dir skip.
- Task 1 must land first (Task 3 imports `SerialExportWorker`); Tasks 2, 4 are independent and can run in any order relative to each other.
