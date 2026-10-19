# export_queue.py
"""ROS-free worker that runs export jobs, one or more at a time."""
from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Callable


def should_auto_export(*, auto_export_on_stop: bool, final_success: bool) -> bool:
    """Auto-enqueue export only for a cleanly finalized session when enabled.

    ``final_success`` is the recorder's verdict that the raw session finalized with
    zero MCAP and camera write errors; ``auto_export_on_stop`` is the operator's
    opt-in.  A FAILED session (write errors) must never auto-export.
    """
    return auto_export_on_stop and final_success


class SerialExportWorker:
    """Run one-session export jobs in FIFO submission order.

    ``max_workers`` controls concurrency: ``1`` (the default) runs strictly one job
    at a time; a larger value lets several exports overlap their read/align phases
    before the dataset's own process-wide append lock serializes the final write.
    """

    def __init__(
        self,
        run_one: Callable[[str], None],
        *,
        on_error: Callable[[str, BaseException], None] | None = None,
        max_workers: int = 1,
    ) -> None:
        if max_workers < 1:
            raise ValueError("max_workers must be positive")
        self._run_one = run_one
        self._on_error = on_error
        self._executor = ThreadPoolExecutor(
            max_workers=max_workers, thread_name_prefix="recording-export-worker"
        )
        self._pending = 0
        self._lock = threading.Lock()
        self._all_done = threading.Condition(self._lock)

    def start(self) -> None:
        # The thread pool accepts jobs eagerly; ``start`` exists so callers keep the
        # same explicit lifecycle as the previous single-thread implementation.
        return None

    def enqueue(self, session_id: str) -> None:
        with self._lock:
            self._pending += 1
        self._executor.submit(self._run_job, session_id)

    def _run_job(self, session_id: str) -> None:
        try:
            self._run_one(session_id)
        except Exception as error:  # noqa: BLE001 - one bad job must not kill the worker
            if self._on_error is not None:
                self._on_error(session_id, error)
        finally:
            with self._all_done:
                self._pending -= 1
                if self._pending == 0:
                    self._all_done.notify_all()

    def drain(self) -> None:
        """Block until every enqueued job has finished (successfully or not)."""
        with self._all_done:
            while self._pending > 0:
                self._all_done.wait()

    def stop(self) -> None:
        """Stop accepting jobs and wait for running ones to finish."""
        self._executor.shutdown(wait=True)
