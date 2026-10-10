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
