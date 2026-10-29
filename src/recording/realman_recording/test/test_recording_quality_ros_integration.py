"""ROS integration coverage for live deviation marks and per-attempt auto recording."""
from __future__ import annotations

import json
import os
import threading
import time
from contextlib import contextmanager

import pytest


def _wait(predicate, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.02)
    return predicate()


@contextmanager
def recorder_graph(tmp_path, extra=None):
    """A recorder plus a synthetic driver on an isolated domain; yields (recorder, driver)."""
    rclpy = pytest.importorskip("rclpy")
    try:
        from rclpy.executors import MultiThreadedExecutor
        from rclpy.node import Node
        from rclpy.parameter import Parameter
        from sensor_msgs.msg import JointState
        from std_msgs.msg import Bool
        from realman_recording.recorder_node import RecordingRecorderNode
    except ImportError as error:  # pragma: no cover - only available in Humble test images
        pytest.skip(f"ROS recording runtime is unavailable: {error}")
    previous_domain = os.environ.get("ROS_DOMAIN_ID")
    domain_id = (os.getpid() % 200) + 20
    os.environ["ROS_DOMAIN_ID"] = str(219 if domain_id == 65 else domain_id)
    rclpy.init(args=[])
    recorder = driver = executor = spin_thread = None
    try:
        reasons = tmp_path / "quality_reasons.yaml"
        reasons.write_text("reasons:\n  - {id: grasp_miss, label: x}\n  - {id: stall, label: y}\n", encoding="utf-8")
        values = {
            "recording_root": str(tmp_path / "sessions"),
            "lerobot_export_dir": str(tmp_path / "lerobot"),
            "arm_namespaces": ["qa"],
            "preflight_required_topics": ["/qa/joint_states"],
            "min_free_space_bytes": 0,
            "auto_export_on_stop": False,
            "quality_reasons_path": str(reasons),
            **(extra or {}),
        }
        recorder = RecordingRecorderNode(parameter_overrides=[Parameter(name, value=value) for name, value in values.items()])
        driver = Node("recording_quality_test_driver")
        joint_pub = driver.create_publisher(JointState, "/qa/joint_states", 10)
        connected_pub = driver.create_publisher(Bool, "/qa/connected", 10)
        joint_message = JointState()
        joint_message.name = [f"joint_{index}" for index in range(1, 7)]
        joint_message.position = [0.0] * 6

        def publish_sensor_state():
            joint_pub.publish(joint_message)
            connected_pub.publish(Bool(data=True))

        driver.create_timer(0.05, publish_sensor_state)
        executor = MultiThreadedExecutor(num_threads=3)
        executor.add_node(recorder)
        executor.add_node(driver)
        spin_thread = threading.Thread(target=executor.spin, name="recording-quality-test", daemon=True)
        spin_thread.start()
        assert _wait(lambda: "/qa/joint_states" in recorder._last_receipt_wall_ns
                     and recorder._arm_connected.get("qa") is True)
        yield recorder, driver
    finally:
        if executor is not None:
            executor.shutdown(timeout_sec=2.0)
        if spin_thread is not None:
            spin_thread.join(timeout=2.0)
        if driver is not None:
            driver.destroy_node()
        if recorder is not None:
            recorder.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
        if previous_domain is None:
            os.environ.pop("ROS_DOMAIN_ID", None)
        else:
            os.environ["ROS_DOMAIN_ID"] = previous_domain


def _manage(driver, command, **fields):
    from realman_recording_msgs.srv import ManageRecording
    client = getattr(driver, "_test_manage_client", None)
    if client is None:
        client = driver.create_client(ManageRecording, "/recording/manage")
        driver._test_manage_client = client
    assert client.wait_for_service(timeout_sec=5.0)
    future = client.call_async(ManageRecording.Request(command=command, **fields))
    assert _wait(future.done, timeout=8.0), f"service command {command} timed out"
    return future.result()


def _read_manifest(path):
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}


def test_live_marks_become_session_intervals_and_status(tmp_path):
    with recorder_graph(tmp_path) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import QualityMark
        from realman_recording_msgs.srv import ManageRecording
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        marks = driver.create_publisher(QualityMark, "/recording/quality_mark", 50)
        assert _wait(lambda: marks.get_subscription_count() >= 1)

        def mark(kind, reason=""):
            message = QualityMark(kind=kind, reason=reason)
            message.stamp = wall.now().to_msg()
            marks.publish(message)
            time.sleep(0.05)

        started = _manage(driver, ManageRecording.Request.START, profile="manual", task="marks", record_cameras=False)
        assert started.success, started.message
        mark(QualityMark.DEVIATE_START)
        assert _wait(lambda: recorder._quality_tracker is not None and recorder._quality_tracker.deviating)
        with recorder._lock:
            status = json.loads(recorder._diagnostics_json())["quality"]
        assert status["deviating"] is True
        assert status["profile"] == "manual"
        assert int(status["deviation_start_ns"]) > 0
        mark(QualityMark.REASON, "grasp_miss")
        mark(QualityMark.REASON, "not_a_reason")  # rejected
        mark(QualityMark.RECOVER)
        assert _wait(lambda: not recorder._quality_tracker.deviating)

        stopped = _manage(driver, ManageRecording.Request.STOP)
        assert stopped.success, stopped.message
        manifest = _read_manifest(tmp_path / "sessions" / started.session_id / "manifest.json")
        intervals = manifest["quality"]["intervals"]
        assert len(intervals) == 1
        assert intervals[0]["reason"] == "grasp_miss"
        assert intervals[0]["source"] == "live"
        assert int(intervals[0]["end_ns"]) > int(intervals[0]["start_ns"])
        assert manifest["quality"]["rejected_marks"] == 1
        assert manifest["metadata"]["topic_types"]["/recording/quality_mark"] == "realman_recording_msgs/msg/QualityMark"

        mark(QualityMark.DEVIATE_START)  # nothing records now
        assert _wait(lambda: recorder._dropped_marks == 1)


def test_a_failed_mark_write_does_not_stop_the_recording(tmp_path, monkeypatch):
    with recorder_graph(tmp_path) as (recorder, driver):
        from rclpy.clock import Clock, ClockType
        from realman_recording_msgs.msg import QualityMark
        from realman_recording_msgs.srv import ManageRecording
        wall = Clock(clock_type=ClockType.SYSTEM_TIME)
        marks = driver.create_publisher(QualityMark, "/recording/quality_mark", 50)
        assert _wait(lambda: marks.get_subscription_count() >= 1)

        def mark(kind, reason=""):
            message = QualityMark(kind=kind, reason=reason)
            message.stamp = wall.now().to_msg()
            marks.publish(message)
            time.sleep(0.05)

        started = _manage(driver, ManageRecording.Request.START, profile="manual", task="write_fail", record_cameras=False)
        assert started.success, started.message

        import realman_recording.session_store as ss_mod
        monkeypatch.setattr(ss_mod.SessionStore, "update_quality", lambda self, q: (_ for _ in ()).throw(OSError("disk full")))

        mark(QualityMark.DEVIATE_START)
        mark(QualityMark.RECOVER)
        assert _wait(lambda: recorder._quality_tracker is not None and not recorder._quality_tracker.deviating)

        with recorder._lock:
            status = json.loads(recorder._diagnostics_json())["quality"]
        assert status["quality_write_errors"] == 2

        monkeypatch.undo()

        stopped = _manage(driver, ManageRecording.Request.STOP)
        assert stopped.success, stopped.message
        manifest = _read_manifest(tmp_path / "sessions" / started.session_id / "manifest.json")
        intervals = manifest["quality"]["intervals"]
        assert len(intervals) == 1
