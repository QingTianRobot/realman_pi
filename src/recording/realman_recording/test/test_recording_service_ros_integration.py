"""ROS integration coverage for the recorder's upstream Service boundary."""
from __future__ import annotations

import json
import os
import threading
import time

import pytest


def test_real_recorder_service_prepare_start_stop_and_discard(tmp_path):
    """Use synthetic ROS publishers to exercise a state-only session without hardware."""
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
    # Keep this synthetic graph away from the robot's ordinary domain (normally 65).
    domain_id = (os.getpid() % 200) + 20
    os.environ["ROS_DOMAIN_ID"] = str(219 if domain_id == 65 else domain_id)
    rclpy.init(args=[])
    recorder = None
    test_driver = None
    executor = None
    spin_thread = None
    try:
        parameters = [
            Parameter("recording_root", value=str(tmp_path / "sessions")),
            Parameter("lerobot_export_dir", value=str(tmp_path / "lerobot")),
            Parameter("arm_namespaces", value=["qa"]),
            Parameter("preflight_required_topics", value=["/qa/joint_states"]),
            Parameter("min_free_space_bytes", value=0),
        ]
        recorder = RecordingRecorderNode(parameter_overrides=parameters)
        assert len(recorder._subscriptions) == len(recorder._topic_types)
        test_driver = Node("recording_service_test_driver")
        joint_pub = test_driver.create_publisher(JointState, "/qa/joint_states", 10)
        connected_pub = test_driver.create_publisher(Bool, "/qa/connected", 10)
        client = test_driver.create_client(ManageRecording, "/recording/manage")
        joint_message = JointState()
        joint_message.name = [f"joint_{index}" for index in range(1, 7)]
        joint_message.position = [0.0] * 6

        def publish_sensor_state():
            joint_pub.publish(joint_message)
            connected_pub.publish(Bool(data=True))

        test_driver.create_timer(0.05, publish_sensor_state)
        executor = MultiThreadedExecutor(num_threads=3)
        executor.add_node(recorder)
        executor.add_node(test_driver)
        spin_thread = threading.Thread(target=executor.spin, name="recording-ros-test", daemon=True)
        spin_thread.start()
        assert client.wait_for_service(timeout_sec=5.0)
        discovery_deadline = time.monotonic() + 5.0
        while (
            joint_pub.get_subscription_count() < 1
            or connected_pub.get_subscription_count() < 1
        ) and time.monotonic() < discovery_deadline:
            time.sleep(0.01)
        assert joint_pub.get_subscription_count() >= 1
        assert connected_pub.get_subscription_count() >= 1
        sensor_deadline = time.monotonic() + 3.0
        while (
            "/qa/joint_states" not in recorder._last_receipt_wall_ns
            or recorder._arm_connected.get("qa") is not True
        ) and time.monotonic() < sensor_deadline:
            time.sleep(0.01)
        assert "/qa/joint_states" in recorder._last_receipt_wall_ns
        assert recorder._arm_connected.get("qa") is True

        def call(request):
            future = client.call_async(request)
            deadline = time.monotonic() + 8.0
            while not future.done() and time.monotonic() < deadline:
                time.sleep(0.01)
            assert future.done(), f"service command {request.command} timed out"
            return future.result()

        prepare = ManageRecording.Request()
        prepare.command = ManageRecording.Request.PREPARE
        prepare.record_cameras = False
        prepared = call(prepare)
        assert prepared.success is True
        assert prepared.state == "ARMED"

        start = ManageRecording.Request()
        start.command = ManageRecording.Request.START
        start.profile = "ros-integration"
        start.task = "synthetic service test"
        start.record_cameras = False
        started = call(start)
        assert started.success is True
        assert started.state == "RECORDING"
        assert started.session_id
        time.sleep(0.2)

        stop = ManageRecording.Request()
        stop.command = ManageRecording.Request.STOP
        stopped = call(stop)
        assert stopped.success is True
        assert stopped.session_id == started.session_id
        assert stopped.state == "READY"
        session_dir = tmp_path / "sessions" / started.session_id
        manifest = json.loads((session_dir / "manifest.json").read_text(encoding="utf-8"))
        assert manifest["state"] == "READY"
        assert manifest["summary"]["accepted_samples"] > 0
        assert manifest["summary"]["write_errors"] == 0
        bag_uri = session_dir / "state.mcap"
        assert bag_uri.exists()
        if bag_uri.is_dir():
            assert list(bag_uri.glob("*.mcap"))

        repeated_stop = call(stop)
        assert repeated_stop.success is False
        assert "no active recording session" in repeated_stop.message
        assert len(list((tmp_path / "sessions").iterdir())) == 1

        discard = ManageRecording.Request()
        discard.command = ManageRecording.Request.DISCARD
        discard.session_id = started.session_id
        discarded = call(discard)
        assert discarded.success is True
        assert discarded.session_id == started.session_id
        manifest = json.loads((session_dir / "manifest.json").read_text(encoding="utf-8"))
        assert manifest["decision"] == "DISCARDED"
    finally:
        if executor is not None:
            executor.shutdown(timeout_sec=2.0)
        if spin_thread is not None:
            spin_thread.join(timeout=2.0)
        if test_driver is not None:
            test_driver.destroy_node()
        if recorder is not None:
            recorder.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
        if previous_domain is None:
            os.environ.pop("ROS_DOMAIN_ID", None)
        else:
            os.environ["ROS_DOMAIN_ID"] = previous_domain
