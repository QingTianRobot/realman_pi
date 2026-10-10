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
