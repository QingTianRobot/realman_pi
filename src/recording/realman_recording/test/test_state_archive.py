"""Tests for the bounded MCAP state archive queue contract (no rosbag2 backend needed)."""
from __future__ import annotations

import sys
import threading
import types

import pytest

from realman_recording.state_archive import McapStateArchive


def test_enqueue_counts_accepted_then_drops_when_full():
    archive = McapStateArchive(max_queue=2)
    # Set admission directly to isolate the queue contract from the rosbag2_py
    # backend, which is only exercised on-device.
    archive._accepting = True
    archive.enqueue("a", "m1", 0)
    archive.enqueue("b", "m2", 1)
    archive.enqueue("c", "m3", 2)  # queue full -> dropped, never blocks the callback

    assert archive.stats.enqueued == 2
    # accepted means successfully handed to MCAP, not merely placed in the queue.
    assert archive.stats.accepted == 0
    assert archive.stats.dropped == 1
    assert archive.stats.write_errors == 0


def test_enqueue_is_a_noop_when_stopped():
    archive = McapStateArchive(max_queue=2)
    archive.enqueue("a", "m1", 0)
    assert archive.stats.enqueued == 0


def test_stop_before_start_returns_zero_stats():
    archive = McapStateArchive(max_queue=2)
    assert archive.stop().enqueued == 0


def test_rejects_nonpositive_queue():
    with pytest.raises(ValueError):
        McapStateArchive(max_queue=0)


def test_stop_drains_then_closes_and_counts_only_successful_writes(monkeypatch):
    """The shutdown cutoff must not strand a queued, already-admitted sample."""
    serialization = types.ModuleType("rclpy.serialization")
    serialization.serialize_message = lambda message: f"cdr:{message}".encode()
    rclpy = types.ModuleType("rclpy")
    rclpy.serialization = serialization
    monkeypatch.setitem(sys.modules, "rclpy", rclpy)
    monkeypatch.setitem(sys.modules, "rclpy.serialization", serialization)

    class Writer:
        def __init__(self):
            self.writes = []
            self.closed = False

        def write(self, topic, payload, timestamp):
            self.writes.append((topic, payload, timestamp))

        def close(self):
            self.closed = True

    archive = McapStateArchive(max_queue=2)
    writer = Writer()
    archive._writer = writer
    archive._accepting = True
    archive._thread = threading.Thread(target=archive._write_loop)
    archive._thread.start()
    archive.enqueue("joint", "sample", 42)

    stats = archive.stop()

    assert writer.writes == [("joint", b"cdr:sample", 42)]
    assert writer.closed is True
    assert (stats.enqueued, stats.accepted, stats.write_errors) == (1, 1, 0)


def test_write_failure_is_not_reported_as_accepted(monkeypatch):
    serialization = types.ModuleType("rclpy.serialization")
    serialization.serialize_message = lambda message: b"cdr"
    rclpy = types.ModuleType("rclpy")
    rclpy.serialization = serialization
    monkeypatch.setitem(sys.modules, "rclpy", rclpy)
    monkeypatch.setitem(sys.modules, "rclpy.serialization", serialization)

    class FailingWriter:
        def write(self, _topic, _payload, _timestamp):
            raise OSError("disk full")

        def close(self):
            return None

    archive = McapStateArchive(max_queue=1)
    archive._writer = FailingWriter()
    archive._accepting = True
    archive._thread = threading.Thread(target=archive._write_loop)
    archive._thread.start()
    archive.enqueue("joint", "sample", 42)

    stats = archive.stop()

    assert (stats.enqueued, stats.accepted, stats.write_errors) == (1, 0, 1)
