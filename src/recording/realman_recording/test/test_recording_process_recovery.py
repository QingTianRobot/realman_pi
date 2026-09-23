"""Process-level recovery test for a recorder killed during an active session."""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

import pytest


def test_killed_recording_node_is_recovered_as_failed_on_full_node_restart(tmp_path):
    pytest.importorskip("rclpy")

    recording_root = tmp_path / "sessions"
    export_root = tmp_path / "lerobot"
    started_file = tmp_path / "started-session-id"
    child_log = tmp_path / "recorder-child.log"
    domain_id = (os.getpid() % 200) + 20
    environment = os.environ.copy()
    environment["ROS_DOMAIN_ID"] = str(219 if domain_id == 65 else domain_id)
    environment["PYTHONUNBUFFERED"] = "1"

    recording_process_script = r"""
import sys
import time
from pathlib import Path

import rclpy
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from rclpy.parameter import Parameter
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool
from realman_recording.recorder_node import RecordingRecorderNode
from realman_recording_msgs.srv import ManageRecording

recording_root = sys.argv[1]
export_root = sys.argv[2]
started_file = Path(sys.argv[3])
rclpy.init(args=[])
recorder = RecordingRecorderNode(parameter_overrides=[
    Parameter("recording_root", value=recording_root),
    Parameter("lerobot_export_dir", value=export_root),
    Parameter("arm_namespaces", value=["qa"]),
    Parameter("preflight_required_topics", value=["/qa/joint_states"]),
    Parameter("min_free_space_bytes", value=0),
])
driver = Node("recording_crash_test_driver")
joint_publisher = driver.create_publisher(JointState, "/qa/joint_states", 10)
connected_publisher = driver.create_publisher(Bool, "/qa/connected", 10)
client = driver.create_client(ManageRecording, "/recording/manage")
joint_state = JointState()
joint_state.name = [f"joint_{index}" for index in range(1, 7)]
joint_state.position = [0.0] * 6

def publish_state():
    joint_publisher.publish(joint_state)
    connected_publisher.publish(Bool(data=True))

driver.create_timer(0.05, publish_state)
executor = MultiThreadedExecutor(num_threads=3)
executor.add_node(recorder)
executor.add_node(driver)
spin_thread = __import__("threading").Thread(target=executor.spin, daemon=True)
spin_thread.start()

if not client.wait_for_service(timeout_sec=8.0):
    raise RuntimeError("recorder Service did not become available")
deadline = time.monotonic() + 8.0
while (joint_publisher.get_subscription_count() < 1
       or "/qa/joint_states" not in recorder._last_receipt_wall_ns
       or recorder._arm_connected.get("qa") is not True):
    if time.monotonic() >= deadline:
        raise RuntimeError("synthetic sensor state did not reach the recorder")
    time.sleep(0.01)

def call(request):
    future = client.call_async(request)
    deadline = time.monotonic() + 8.0
    while not future.done() and time.monotonic() < deadline:
        time.sleep(0.01)
    if not future.done():
        raise RuntimeError(f"recording Service command {request.command} timed out")
    result = future.result()
    if not result.success:
        raise RuntimeError(result.message)
    return result

prepare = ManageRecording.Request()
prepare.command = ManageRecording.Request.PREPARE
prepare.record_cameras = False
call(prepare)

start = ManageRecording.Request()
start.command = ManageRecording.Request.START
start.profile = "process-crash-test"
start.task = "synthetic process recovery test"
start.record_cameras = False
started = call(start)
if not started.session_id:
    raise RuntimeError("START returned no session id")

deadline = time.monotonic() + 5.0
while recorder._archive is None or recorder._archive.stats.accepted == 0:
    if time.monotonic() >= deadline:
        raise RuntimeError("no MCAP sample was written before the crash point")
    time.sleep(0.01)
started_file.write_text(started.session_id, encoding="utf-8")
while True:
    time.sleep(1.0)
"""

    recovery_process_script = r"""
import sys
import rclpy
from rclpy.parameter import Parameter
from realman_recording.recorder_node import RecordingRecorderNode

rclpy.init(args=[])
node = RecordingRecorderNode(parameter_overrides=[
    Parameter("recording_root", value=sys.argv[1]),
    Parameter("lerobot_export_dir", value=sys.argv[2]),
    Parameter("arm_namespaces", value=["qa"]),
    Parameter("preflight_required_topics", value=["/qa/joint_states"]),
    Parameter("min_free_space_bytes", value=0),
])
node.destroy_node()
rclpy.shutdown()
"""

    process = None
    with child_log.open("wb") as output:
        process = subprocess.Popen(
            [
                sys.executable,
                "-c",
                recording_process_script,
                str(recording_root),
                str(export_root),
                str(started_file),
            ],
            env=environment,
            stdout=output,
            stderr=subprocess.STDOUT,
        )
        try:
            deadline = time.monotonic() + 20.0
            while not started_file.is_file() and time.monotonic() < deadline:
                if process.poll() is not None:
                    break
                time.sleep(0.02)
            if not started_file.is_file():
                log = child_log.read_text(encoding="utf-8", errors="replace")
                pytest.fail(f"recorder child did not enter RECORDING; exit={process.poll()}\n{log}")

            session_id = started_file.read_text(encoding="utf-8").strip()
            process.kill()  # SIGKILL: skip recorder shutdown and writer finalization.
            process.wait(timeout=5.0)
            assert process.returncode != 0
        finally:
            if process.poll() is None:
                process.kill()
                process.wait(timeout=5.0)

    session_dir = recording_root / session_id
    partial_manifest = session_dir / "manifest.partial.json"
    assert json.loads(partial_manifest.read_text(encoding="utf-8"))["state"] == "RECORDING"
    assert not (session_dir / "manifest.json").exists()

    recovered = subprocess.run(
        [sys.executable, "-c", recovery_process_script, str(recording_root), str(export_root)],
        env=environment,
        capture_output=True,
        text=True,
        timeout=20.0,
        check=False,
    )
    assert recovered.returncode == 0, recovered.stdout + recovered.stderr

    final_manifest = session_dir / "manifest.json"
    manifest = json.loads(final_manifest.read_text(encoding="utf-8"))
    assert manifest["state"] == "FAILED"
    assert manifest["summary"]["write_errors"] >= 1
    assert manifest["recovery"]["state"] == "FAILED_AFTER_PROCESS_INTERRUPTION"
    assert not partial_manifest.exists()
