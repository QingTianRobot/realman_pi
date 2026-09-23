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


def test_start_creates_cdr_topics_writes_and_closes_a_real_writer_boundary(monkeypatch, tmp_path):
    """Exercise the rosbag2 binding boundary without requiring a Humble installation."""
    serialization = types.ModuleType("rclpy.serialization")
    serialization.serialize_message = lambda message: f"cdr:{message}".encode()
    rclpy = types.ModuleType("rclpy")
    rclpy.serialization = serialization
    monkeypatch.setitem(sys.modules, "rclpy", rclpy)
    monkeypatch.setitem(sys.modules, "rclpy.serialization", serialization)

    writers = []

    class StorageOptions:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    class ConverterOptions:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    class TopicMetadata:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    class Writer:
        def __init__(self):
            self.opened = None
            self.topics = []
            self.writes = []
            self.closed = False
            writers.append(self)

        def open(self, storage, converter):
            self.opened = (storage, converter)

        def create_topic(self, metadata):
            self.topics.append(metadata)

        def write(self, topic, payload, timestamp):
            self.writes.append((topic, payload, timestamp))

        def close(self):
            self.closed = True

    class Info:
        def read_metadata(self, uri, storage_id):
            assert uri == str(tmp_path / "state.mcap")
            assert storage_id == "mcap"
            assert writers[0].closed is True
            return types.SimpleNamespace(message_count=len(writers[0].writes))

    rosbag2_py = types.ModuleType("rosbag2_py")
    rosbag2_py.Info = Info
    rosbag2_py.StorageOptions = StorageOptions
    rosbag2_py.ConverterOptions = ConverterOptions
    rosbag2_py.TopicMetadata = TopicMetadata
    rosbag2_py.SequentialWriter = Writer
    monkeypatch.setitem(sys.modules, "rosbag2_py", rosbag2_py)

    archive = McapStateArchive(max_queue=2)
    archive.start(tmp_path / "state.mcap", {"/joint": "sensor_msgs/msg/JointState"})
    archive.enqueue("/joint", "sample", 42)
    stats = archive.stop()

    writer = writers[0]
    assert writer.opened[0].kwargs == {"uri": str(tmp_path / "state.mcap"), "storage_id": "mcap"}
    assert writer.opened[1].kwargs == {
        "input_serialization_format": "cdr", "output_serialization_format": "cdr"
    }
    assert writer.topics[0].kwargs == {
        "name": "/joint", "type": "sensor_msgs/msg/JointState", "serialization_format": "cdr"
    }
    assert writer.writes == [("/joint", b"cdr:sample", 42)]
    assert writer.closed is True
    assert (stats.enqueued, stats.accepted, stats.dropped, stats.write_errors) == (1, 1, 0, 0)
