"""ROS integration: a parked (synthetic) arm no longer blocks PREPARE/START (SJDrealman m arm).

Two arms are configured and only ``qa`` publishes, as on SJDrealman where the middle arm
is powered off. Without ``synthetic_arms`` PREPARE fails on the silent arm; with it,
PREPARE/START/STOP succeed and the session metadata carries the parked pose.
"""
from __future__ import annotations

import json
import math
import os
import threading
import time

import pytest

PARKED_DEG = [0.0, 17.997, 70.0, 0.0, 90.0, 8.997]


def _run(tmp_path, synthetic: bool):
    rclpy = pytest.importorskip("rclpy")
    try:
        from rclpy.executors import MultiThreadedExecutor
        from rclpy.node import Node
        from rclpy.parameter import Parameter
        from sensor_msgs.msg import JointState
        from std_msgs.msg import Bool
        from realman_recording.recorder_node import RecordingRecorderNode
        from realman_recording_msgs.srv import ManageRecording
    except ImportError as error:  # pragma: no cover - only available in Humble test images
        pytest.skip(f"ROS recording runtime is unavailable: {error}")

    previous_domain = os.environ.get("ROS_DOMAIN_ID")
    domain_id = (os.getpid() % 200) + 20
    os.environ["ROS_DOMAIN_ID"] = str(219 if domain_id == 65 else domain_id)
    rclpy.init(args=[])
    recorder = test_driver = executor = spin_thread = None
    results = {}
    try:
        parameters = [
            Parameter("recording_root", value=str(tmp_path / "sessions")),
            Parameter("lerobot_export_dir", value=str(tmp_path / "lerobot")),
            Parameter("arm_namespaces", value=["qa", "qb"]),
            Parameter("preflight_required_topics", value=["/qa/joint_states", "/qb/joint_states"]),
            Parameter("min_free_space_bytes", value=0),
            Parameter("auto_export_on_stop", value=False),
            Parameter("auto_record_enabled", value=False),
        ]
        if synthetic:
            parameters += [Parameter("synthetic_arms", value=["qb"]),
                           Parameter("synthetic_arm_joint_degrees", value=PARKED_DEG)]
        recorder = RecordingRecorderNode(parameter_overrides=parameters)
        test_driver = Node("synthetic_arm_test_driver")
        joint_pub = test_driver.create_publisher(JointState, "/qa/joint_states", 10)
        connected_pub = test_driver.create_publisher(Bool, "/qa/connected", 10)
        client = test_driver.create_client(ManageRecording, "/recording/manage")
        joint_message = JointState()
        joint_message.name = [f"joint_{index}" for index in range(1, 7)]
        joint_message.position = [0.0] * 6
        test_driver.create_timer(0.05, lambda: (joint_pub.publish(joint_message),
                                                connected_pub.publish(Bool(data=True))))
        executor = MultiThreadedExecutor(num_threads=3)
        executor.add_node(recorder)
        executor.add_node(test_driver)
        spin_thread = threading.Thread(target=executor.spin, daemon=True)
        spin_thread.start()
        assert client.wait_for_service(timeout_sec=5.0)
        deadline = time.monotonic() + 5.0
        while (recorder._arm_connected.get("qa") is not True
               or "/qa/joint_states" not in recorder._last_receipt_wall_ns) and time.monotonic() < deadline:
            time.sleep(0.01)
        assert recorder._arm_connected.get("qa") is True

        def call(command, **fields):
            request = ManageRecording.Request()
            request.command = command
            request.record_cameras = False
            for key, value in fields.items():
                setattr(request, key, value)
            future = client.call_async(request)
            end = time.monotonic() + 8.0
            while not future.done() and time.monotonic() < end:
                time.sleep(0.01)
            assert future.done()
            return future.result()

        results["prepare"] = call(ManageRecording.Request.PREPARE)
        if results["prepare"].success:
            started = call(ManageRecording.Request.START, profile="synthetic-test", task="parked arm")
            time.sleep(0.2)
            stopped = call(ManageRecording.Request.STOP)
            results["start"], results["stop"] = started, stopped
            manifest_path = tmp_path / "sessions" / started.session_id / "manifest.json"
            results["manifest"] = json.loads(manifest_path.read_text(encoding="utf-8"))
        return results
    finally:
        if executor is not None:
            executor.shutdown(timeout_sec=2.0)
        if spin_thread is not None:
            spin_thread.join(timeout=2.0)
        for node in (test_driver, recorder):
            if node is not None:
                node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
        if previous_domain is None:
            os.environ.pop("ROS_DOMAIN_ID", None)
        else:
            os.environ["ROS_DOMAIN_ID"] = previous_domain


def test_silent_arm_blocks_prepare_without_synthetic_arms(tmp_path):
    results = _run(tmp_path, synthetic=False)
    assert results["prepare"].success is False
    assert "arm_disconnected:qb" in results["prepare"].message
    assert "topic_stale:/qb/joint_states" in results["prepare"].message


def test_parked_arm_lets_prepare_start_and_stop_and_is_recorded_in_metadata(tmp_path):
    results = _run(tmp_path, synthetic=True)
    assert results["prepare"].success is True, results["prepare"].message
    assert results["start"].success is True and results["start"].state == "RECORDING"
    assert results["stop"].success is True and results["stop"].state == "READY"
    parked = results["manifest"]["metadata"]["synthetic_arms"]
    assert list(parked) == ["qb"]
    assert parked["qb"]["velocity"] == "zero"
    assert parked["qb"]["joint_positions_rad"] == pytest.approx([math.radians(v) for v in PARKED_DEG])
