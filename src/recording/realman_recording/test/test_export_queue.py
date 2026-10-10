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


def test_worker_survives_a_raising_job():
    processed: list[str] = []

    def run_one(session_id: str) -> None:
        if session_id == "boom":
            raise RuntimeError("boom")
        processed.append(session_id)

    worker = SerialExportWorker(run_one)
    worker.start()
    worker.enqueue("boom")
    worker.enqueue("ok")
    deadline = time.monotonic() + 2.0
    while "ok" not in processed and time.monotonic() < deadline:
        time.sleep(0.01)
    worker.stop()

    assert processed == ["ok"]


def test_worker_reports_a_job_error_without_stopping():
    processed: list[str] = []
    errors: list[tuple[str, BaseException]] = []

    def run_one(session_id: str) -> None:
        if session_id == "boom":
            raise RuntimeError("boom")
        processed.append(session_id)

    def on_error(session_id: str, error: BaseException) -> None:
        errors.append((session_id, error))

    worker = SerialExportWorker(run_one, on_error=on_error)
    worker.start()
    worker.enqueue("boom")
    worker.enqueue("ok")
    deadline = time.monotonic() + 2.0
    while "ok" not in processed and time.monotonic() < deadline:
        time.sleep(0.01)
    worker.stop()

    assert processed == ["ok"]
    assert len(errors) == 1
    assert errors[0][0] == "boom"
    assert isinstance(errors[0][1], RuntimeError)
