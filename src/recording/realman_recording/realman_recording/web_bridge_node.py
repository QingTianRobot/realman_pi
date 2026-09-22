"""Read-only ROS-to-Web bridge for recording operations and lightweight visualization.

It independently subscribes to the live driver/clipper outputs and sends only a
coalesced snapshot at ``web_state_hz``.  It is not on the recorder's write path: losing
this node, a WebSocket client, or a low-resolution preview must leave recording intact.
The Three.js visualization should reuse only the existing Web Control live URDF model.
"""
from __future__ import annotations

import os
import json
import threading
import time
from pathlib import Path
from typing import Any

from ament_index_python.packages import get_package_share_directory
import rclpy
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.clock import Clock, ClockType
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import Bool, Float64, Int32, String

from realman_recording_msgs.msg import RecordingStatus
from .camera_workers import LatestFramePreview, PreviewFrame, downscale_jpeg, image_to_jpeg, load_camera_sources
from .layout_manifest import build_recording_manifest
from .rerun_adapter import RerunVisualizationAdapter
from .web_server import RecordingWebServer
from .web_protocol import safe_coordinate_subset


# rclpy infers an empty Python list default as a byte_array parameter, so these
# string-array parameters use a one-element [""] default to pin the type to
# string_array. The params file supplies the real values at runtime.
class RecordingWebBridgeNode(Node):
    """Serve only recording controls and live read-only state to browser clients."""

    def __init__(self) -> None:
        super().__init__("recording_web_bridge")
        package_share = Path(get_package_share_directory("realman_recording"))
        config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", str(Path.cwd() / "config")))
        description_root = get_package_share_directory("rm65_description")
        self.declare_parameter("layout_config_file", str(config_root / "ros" / "three_robots.yaml"))
        self.declare_parameter("description_root", description_root)
        self.declare_parameter("bind_host", "127.0.0.1")
        self.declare_parameter("port", 8770)
        self.declare_parameter("web_state_hz", 10.0)
        self.declare_parameter("rerun_enabled", False)
        self.declare_parameter("rerun_hz", 10.0)
        self.declare_parameter("rerun_spawn", False)
        self.declare_parameter("rerun_application_id", "realman_recording")
        self.declare_parameter("preview_enabled", False)
        self.declare_parameter("preview_width", 640)
        self.declare_parameter("preview_height", 360)
        self.declare_parameter("preview_fps", 5.0)
        self.declare_parameter("camera_ids", [""])
        self.declare_parameter("camera_image_topics", [""])
        self.declare_parameter("arm_namespaces", ["l", "m", "r"])
        self.declare_parameter("gripper_position_topics", [""])
        self.declare_parameter("gripper_torque_topics", [""])
        self.declare_parameter("gripper_alarm_topics", [""])
        self.declare_parameter("static_root", str(package_share / "static"))

        self._callback_group = ReentrantCallbackGroup()
        # Explicitly retain the same ROS 2 SYSTEM_TIME domain used by the recorder.
        # This viewer timestamp is observability metadata only; it never enters MCAP.
        self._wall_clock = Clock(clock_type=ClockType.SYSTEM_TIME)
        self._arms = tuple(str(item) for item in self.get_parameter("arm_namespaces").value)
        self._joint_positions: dict[str, list[float]] = {}
        self._connections: dict[str, bool] = {}
        self._coordinates: dict[str, dict[str, Any]] = {}
        self._gripper: dict[str, dict[str, float | bool | int]] = {}
        self._recording_status: dict[str, Any] = {
            "state": "IDLE",
            "diagnostics_json": "{}",
            "scheduled_start_walltime_ns": 0,
        }
        self._preview_lock = threading.Lock()
        self._preview_frames: dict[str, PreviewFrame] = {}
        self._rerun_preview_wall_ns: dict[str, int] = {}
        self._subscriptions = []
        # Keep every configured camera visible in the dashboard, even when preview
        # decoding is disabled or a source has not produced its first frame yet.
        self._camera_sources = load_camera_sources(self)
        self._preview_worker: LatestFramePreview | None = self._create_preview_worker()
        # Full-resolution camera images are only needed for the lossy preview.
        # When preview is disabled, skip these subscriptions entirely: deserialising
        # ~4 x 640x480 frames per second would otherwise saturate the executor and
        # starve the snapshot timer.
        if self._preview_worker is not None:
            for source in self._camera_sources:
                self._subscriptions.append(self.create_subscription(
                    Image, source.image_topic,
                    lambda message, selected=source.camera_id: self._preview_image(selected, message),
                    10, callback_group=self._callback_group,
                ))
        self._rerun = RerunVisualizationAdapter(
            application_id=str(self.get_parameter("rerun_application_id").value),
            spawn=bool(self.get_parameter("rerun_spawn").value),
        ) if bool(self.get_parameter("rerun_enabled").value) else None
        if self._rerun is not None and not self._rerun.enabled:
            self.get_logger().warn(
                "Rerun is enabled in configuration but rerun-sdk is unavailable; "
                "continuing without Rerun visualization"
            )

        for arm in self._arms:
            self._subscriptions.append(self.create_subscription(
                JointState, f"/{arm}/joint_states", lambda message, selected=arm: self._joint_state(selected, message),
                10, callback_group=self._callback_group,
            ))
            self._subscriptions.append(self.create_subscription(
                Bool, f"/{arm}/connected", lambda message, selected=arm: self._connection(selected, message),
                10, callback_group=self._callback_group,
            ))
            self._subscriptions.append(self.create_subscription(
                String, f"/{arm}/coordinates/state", lambda message, selected=arm: self._coordinates_message(selected, message),
                10, callback_group=self._callback_group,
            ))
        self._register_gripper_subscriptions()
        self._subscriptions.append(self.create_subscription(
            RecordingStatus, "recording/status", self._recording_status_message,
            10, callback_group=self._callback_group,
        ))
        self._manifest = build_recording_manifest(self.get_parameter("layout_config_file").value)
        self._server = RecordingWebServer(
            bind_host=str(self.get_parameter("bind_host").value),
            port=int(self.get_parameter("port").value),
            static_root=str(self.get_parameter("static_root").value),
            manifest=self._manifest,
            description_root=self.get_parameter("description_root").value,
            logger=self.get_logger(),
        )
        self._server.start()
        if self._preview_worker is not None:
            self._preview_worker.start()
        rate = float(self.get_parameter("web_state_hz").value)
        if rate <= 0.0:
            raise ValueError("web_state_hz must be positive")
        self._snapshot_timer = self.create_timer(1.0 / rate, self._send_snapshot, callback_group=self._callback_group)
        self._rerun_timer = None
        if self._rerun is not None:
            rerun_rate = float(self.get_parameter("rerun_hz").value)
            if rerun_rate <= 0.0:
                raise ValueError("rerun_hz must be positive when rerun_enabled is true")
            self._rerun_timer = self.create_timer(
                1.0 / rerun_rate,
                self._send_rerun_snapshot,
                callback_group=self._callback_group,
            )
        self.get_logger().info("Recording Web bridge ready: read-only robot and recording status view")

    def destroy_node(self) -> bool:
        if self._preview_worker is not None:
            self._preview_worker.stop()
        if self._rerun is not None:
            self._rerun.close()
        self._server.stop()
        return super().destroy_node()

    def _create_preview_worker(self) -> LatestFramePreview | None:
        """Build a one-slot ROS-image preview compressor when enabled."""
        if not bool(self.get_parameter("preview_enabled").value):
            return None
        width = int(self.get_parameter("preview_width").value)
        height = int(self.get_parameter("preview_height").value)
        # Downscale on the raw frame before the JPEG encode (in _preview_image), so the
        # worker's transform is a no-op fallback for the already-sized frame.
        self._preview_width = width
        self._preview_height = height
        return LatestFramePreview(
            self._preview_frame,
            transform=lambda frame: downscale_jpeg(frame, width=width, height=height),
        )

    def _preview_image(self, camera_id: str, message: Image) -> None:
        """JPEG-encode a raw frame and offer it to the lossy preview worker."""
        if self._preview_worker is None:
            return
        try:
            jpeg = image_to_jpeg(
                message,
                width=getattr(self, "_preview_width", None),
                height=getattr(self, "_preview_height", None),
            )
        except ValueError:
            return
        self._preview_worker.offer(PreviewFrame(
            camera_id=camera_id,
            capture_monotonic_ns=time.monotonic_ns(),
            capture_wall_ns=self._wall_clock.now().nanoseconds,
            jpeg=jpeg,
        ))

    def _preview_frame(self, frame: PreviewFrame) -> None:
        """Accept the newest decoder output; no recorder or WebSocket work happens here."""
        with self._preview_lock:
            self._preview_frames[frame.camera_id] = frame
        self._server.set_preview(frame.camera_id, frame.jpeg)

    def _register_gripper_subscriptions(self) -> None:
        """Subscribe gripper position/torque/alarm topics into the per-topic cache."""
        for topic in self.get_parameter("gripper_position_topics").value:
            self._subscriptions.append(self.create_subscription(
                Float64, str(topic), lambda message, selected=str(topic): self._gripper_value(selected, "position", message.data),
                10, callback_group=self._callback_group,
            ))
        for topic in self.get_parameter("gripper_torque_topics").value:
            self._subscriptions.append(self.create_subscription(
                Bool, str(topic), lambda message, selected=str(topic): self._gripper_value(selected, "torque_reached", message.data),
                10, callback_group=self._callback_group,
            ))
        for topic in self.get_parameter("gripper_alarm_topics").value:
            self._subscriptions.append(self.create_subscription(
                Int32, str(topic), lambda message, selected=str(topic): self._gripper_value(selected, "alarm", message.data),
                10, callback_group=self._callback_group,
            ))

    def _joint_state(self, arm: str, message: JointState) -> None:
        """Cache joint_1..joint_6 positions only when the full set is present."""
        positions = dict(zip(message.name, message.position))
        expected = [f"joint_{index}" for index in range(1, 7)]
        if all(name in positions for name in expected):
            self._joint_positions[arm] = [float(positions[name]) for name in expected]

    def _connection(self, arm: str, message: Bool) -> None:
        self._connections[arm] = bool(message.data)

    def _coordinates_message(self, arm: str, message: String) -> None:
        """Cache only the documented numeric coordinate subset for read-only display."""
        self._coordinates[arm] = safe_coordinate_subset(message.data)

    def _gripper_value(self, topic: str, field: str, value: Any) -> None:
        self._gripper.setdefault(topic, {})[field] = value

    def _recording_status_message(self, message: RecordingStatus) -> None:
        self._recording_status = {
            "session_id": message.session_id,
            "state": int(message.state),
            "elapsed_sec": float(message.elapsed_sec),
            "remaining_sec": float(message.remaining_sec),
            "accepted_samples": int(message.accepted_samples),
            "dropped_samples": int(message.dropped_samples),
            "cameras_healthy": bool(message.cameras_healthy),
            "detail": message.detail,
            "diagnostics_json": message.diagnostics_json,
            "scheduled_start_walltime_ns": int(message.scheduled_start_walltime_ns),
            "export_progress": float(message.export_progress),
            "export_dir": message.export_dir,
            "export_error": message.export_error,
        }

    def _send_snapshot(self) -> None:
        """Emit at most one lightweight snapshot per timer tick, regardless of driver rate."""
        with self._preview_lock:
            preview_cameras = {
                source.camera_id: self._preview_frames[source.camera_id].capture_wall_ns
                if source.camera_id in self._preview_frames else 0
                for source in self._camera_sources
            }
        self._server.send_snapshot(
            {
                "type": "recording_snapshot",
                "recording": self._recording_status,
                "arms": {
                    arm: {
                        "positions_rad": self._joint_positions.get(arm, []),
                        "connected": self._connections.get(arm, False),
                        "coordinate_state": self._coordinates.get(arm, {}),
                    }
                    for arm in self._arms
                },
                "grippers": self._gripper,
                "preview_cameras": preview_cameras,
            }
        )

    def _send_rerun_snapshot(self) -> None:
        """Log only timer-coalesced numeric state; Rerun is outside recording's data path."""
        if self._rerun is None:
            return
        try:
            timestamp_ns = self._wall_clock.now().nanoseconds
            self._rerun.offer_snapshot(
                timestamp_ns=timestamp_ns,
                arms={arm: list(values) for arm, values in self._joint_positions.items()},
                grippers={topic: dict(values) for topic, values in self._gripper.items()},
            )
            self._rerun.offer_recording_status(
                timestamp_ns=timestamp_ns,
                state=int(self._recording_status.get("state", 0)),
                elapsed_sec=float(self._recording_status.get("elapsed_sec", 0.0)),
                remaining_sec=float(self._recording_status.get("remaining_sec", 0.0)),
                dropped_samples=int(self._recording_status.get("dropped_samples", 0)),
            )
            with self._preview_lock:
                previews = tuple(self._preview_frames.values())
            for preview in previews:
                if self._rerun_preview_wall_ns.get(preview.camera_id) == preview.capture_wall_ns:
                    continue
                self._rerun.offer_preview(
                    camera_id=preview.camera_id,
                    timestamp_ns=preview.capture_wall_ns,
                    jpeg=preview.jpeg,
                )
                self._rerun_preview_wall_ns[preview.camera_id] = preview.capture_wall_ns
        except Exception as error:  # noqa: BLE001 - Rerun must be a removable observer
            self.get_logger().error(f"Disabling Rerun after visualization error: {error}")
            self._rerun.close()
            self._rerun = None



def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = RecordingWebBridgeNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()
