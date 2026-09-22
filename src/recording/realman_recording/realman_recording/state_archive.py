"""Bounded MCAP state archive with a loss-aware, non-blocking ROS callback edge.

Only ``enqueue`` is called from ROS subscription callbacks; it never waits for storage.
One worker owns rosbag2 serialization and I/O, then explicitly closes the writer during
``stop`` so the bag metadata/index has a chance to be finalized. Browser and camera
code must not import or call this module.
"""
from __future__ import annotations

import queue
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ArchiveStats:
    """Archive counters with distinct queue-admission and durable-write meanings."""

    enqueued: int = 0
    accepted: int = 0
    dropped: int = 0
    write_errors: int = 0


class McapStateArchive:
    """One bounded state writer; ``accepted`` means successfully written, not queued."""

    def __init__(self, max_queue: int) -> None:
        if max_queue < 1:
            raise ValueError("max_queue must be positive")
        self._queue: queue.Queue[tuple[str, Any, int]] = queue.Queue(maxsize=max_queue)
        self._lock = threading.RLock()
        self._thread: threading.Thread | None = None
        self._accepting = False
        self._stop_requested = threading.Event()
        self._stats = ArchiveStats()
        self._writer: Any | None = None

    def start(self, output: Path, topic_types: dict[str, str]) -> None:
        """Create an MCAP rosbag and start its sole serialization/write worker.

        Bag record time is the recorder callback's ROS 2 ``SYSTEM_TIME`` receipt
        nanoseconds, which keeps rosbag2/MCAP metadata and standard readers on their
        expected epoch-based timeline. Headerless messages have no source timestamp;
        they must use receipt time rather than pretending a source-vs-receipt skew
        exists.
        """
        with self._lock:
            if self._accepting or self._thread is not None or self._writer is not None:
                raise RuntimeError("state archive cannot be started more than once")
            if self._stop_requested.is_set():
                raise RuntimeError("stopped state archive cannot be restarted")

        from rosbag2_py import (  # type: ignore[import-not-found]
            ConverterOptions,
            SequentialWriter,
            StorageOptions,
            TopicMetadata,
        )

        output.parent.mkdir(mode=0o750, parents=True, exist_ok=True)
        writer = SequentialWriter()
        try:
            writer.open(
                StorageOptions(uri=str(output), storage_id="mcap"),
                ConverterOptions(
                    input_serialization_format="cdr",
                    output_serialization_format="cdr",
                ),
            )
            for topic, type_name in topic_types.items():
                writer.create_topic(
                    TopicMetadata(name=topic, type=type_name, serialization_format="cdr")
                )
        except Exception:
            self._close_writer(writer)
            raise

        with self._lock:
            self._writer = writer
            self._accepting = True
            self._thread = threading.Thread(
                target=self._write_loop, name="recording-mcap", daemon=True
            )
            self._thread.start()

    def enqueue(self, topic: str, message: Any, receipt_realtime_ns: int) -> None:
        """Try to queue one sample without ever waiting in a ROS callback."""
        with self._lock:
            if not self._accepting:
                return
            try:
                self._queue.put_nowait((topic, message, receipt_realtime_ns))
            except queue.Full:
                self._increment_locked(dropped=1)
            else:
                self._increment_locked(enqueued=1)

    def stop(self) -> ArchiveStats:
        """Stop admission, drain accepted work, then close the rosbag writer once."""
        with self._lock:
            if self._thread is None and self._writer is None:
                return self.stats
            # Holding the same lock as enqueue establishes a strict cutoff: no sample
            # can be accepted after shutdown begins, so every accepted sample precedes
            # the worker's drain-and-exit condition.
            self._accepting = False
            self._stop_requested.set()
            thread, writer = self._thread, self._writer

        if thread is not None:
            thread.join()
        try:
            self._close_writer(writer)
        except Exception:
            self._increment(write_errors=1)
        finally:
            with self._lock:
                self._thread = None
                self._writer = None
        return self.stats

    @property
    def stats(self) -> ArchiveStats:
        with self._lock:
            return self._stats

    def _increment(
        self, *, enqueued: int = 0, accepted: int = 0, dropped: int = 0, write_errors: int = 0
    ) -> None:
        with self._lock:
            self._increment_locked(
                enqueued=enqueued, accepted=accepted, dropped=dropped, write_errors=write_errors
            )

    def _increment_locked(
        self, *, enqueued: int = 0, accepted: int = 0, dropped: int = 0, write_errors: int = 0
    ) -> None:
        current = self._stats
        self._stats = ArchiveStats(
            enqueued=current.enqueued + enqueued,
            accepted=current.accepted + accepted,
            dropped=current.dropped + dropped,
            write_errors=current.write_errors + write_errors,
        )

    def _write_loop(self) -> None:
        try:
            from rclpy.serialization import serialize_message  # type: ignore[import-not-found]
        except ImportError:
            # Do not leave a dead worker while callbacks keep filling the queue.
            with self._lock:
                self._accepting = False
            self._increment(write_errors=1)
            return

        while not self._stop_requested.is_set() or not self._queue.empty():
            try:
                topic, message, receipt_realtime_ns = self._queue.get(timeout=0.1)
            except queue.Empty:
                continue
            try:
                writer = self._writer
                if writer is None:
                    raise RuntimeError("MCAP writer disappeared before queue drain")
                writer.write(topic, serialize_message(message), receipt_realtime_ns)
            except Exception:
                # Aggregate failures instead of flooding ROS logs from a hot path.
                self._increment(write_errors=1)
            else:
                self._increment(accepted=1)

    @staticmethod
    def _close_writer(writer: Any | None) -> None:
        """Close explicitly where the installed rosbag2 Python binding exposes it.

        Early Humble builds did not expose ``SequentialWriter.close`` to Python. Their
        binding still finalizes through object destruction; keeping this fallback makes
        the package launchable there, while newer Humble updates use explicit close.
        """
        if writer is None:
            return
        close = getattr(writer, "close", None)
        if callable(close):
            close()
