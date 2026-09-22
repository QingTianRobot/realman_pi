"""Recording-first ROS 2 node: subscribe, persist locally, and expose session control.

This node is the only owner of recording session state.  It never opens a RealMan SDK,
never commands a robot, never decodes preview images, and never serves browser traffic.
The intentional separation means a browser/client/camera-preview failure cannot block
driver subscriptions or the durable state writer.
"""
from __future__ import annotations

import importlib.util
import json
import shutil
import threading
import time
from hashlib import sha256
from pathlib import Path
from typing import Any

import rclpy
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.clock import Clock, ClockType
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import Image

from realman_recording_msgs.msg import RecordingStatus
from realman_recording_msgs.srv import ManageRecording as ManageRecordingService

from .camera_workers import CameraSource, RosImageArchive, image_to_jpeg, load_camera_sources
from .lerobot_exporter import ExportRequest, LeRobotExporter
from .kinematics import urdf_joint_limits
from .lerobot_schema import schema_from_parameters
from .preflight import PreflightChecker, PreflightRequirements, PreflightResult
from .provenance import snapshot_optional_file
from .session_store import SessionState, SessionStore
from .state_archive import McapStateArchive
from .topic_catalog import build_topic_catalog


# rclpy infers an empty Python list default as a byte_array parameter, so these
# string-array parameters use a one-element [""] default to pin the type to
# string_array. The params file supplies the real values at runtime.
_STATUS_CODE = {
    SessionState.IDLE: RecordingStatus.IDLE,
    SessionState.PREPARING: RecordingStatus.PREPARING,
    SessionState.ARMED: RecordingStatus.ARMED,
    SessionState.SCHEDULED: RecordingStatus.SCHEDULED,
    SessionState.COUNTDOWN: RecordingStatus.COUNTDOWN,
    SessionState.RECORDING: RecordingStatus.RECORDING,
    SessionState.PAUSED: RecordingStatus.PAUSED,
    SessionState.FINALIZING: RecordingStatus.FINALIZING,
    SessionState.EXPORTING: RecordingStatus.EXPORTING,
    SessionState.EXPORTED: RecordingStatus.EXPORTED,
    SessionState.READY: RecordingStatus.READY,
    SessionState.FAILED: RecordingStatus.FAILED,
}


class RecordingRecorderNode(Node):
    """Record selected existing ROS observations into an isolated local session."""

    def __init__(self) -> None:
        super().__init__("recording_recorder")
        self.declare_parameter("recording_root", "/data/realman-recordings")
        self.declare_parameter("lerobot_export_dir", "/data/realman-recordings/lerobot")
        self.declare_parameter("max_state_queue", 10_000)
        self.declare_parameter("arm_namespaces", ["l", "m", "r"])
        self.declare_parameter("arm_action_topics", [""])
        self.declare_parameter("gripper_action_topics", [""])
        self.declare_parameter("lerobot_repo_id", "realman/pi05-three-arm")
        self.declare_parameter("embodiment_id", "realman-rm65-b-three-arm-v1")
        self.declare_parameter("urdf_package", "rm65_description")
        self.declare_parameter("urdf_relative_path", "urdf/RM65-B.urdf")
        self.declare_parameter("urdf_base_link", "base_link")
        self.declare_parameter("base_frames", ["l/base_link", "m/base_link", "r/base_link"])
        self.declare_parameter("ee_links", ["link_6", "link_6", "link_6"])
        self.declare_parameter("joint_names", ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"])
        self.declare_parameter("cartesian_command_representation", "velocity")
        self.declare_parameter("cartesian_command_frames", ["l/base_link", "m/base_link", "r/base_link"])
        # Path to a solved, immutable calibration result. It is optional for 2D
        # behavior-cloning capture, but must be supplied for geometric datasets.
        self.declare_parameter("calibration_snapshot_path", "")
        self.declare_parameter("calibration_version", "")
        self.declare_parameter("gripper_position_topics", [""])
        self.declare_parameter("gripper_torque_topics", [""])
        self.declare_parameter("gripper_alarm_topics", [""])
        # Explicit PREPARE gate. Keep optional force/alarm/action topics out unless a
        # recording profile genuinely requires them to be live before START.
        self.declare_parameter("preflight_required_topics", [""])
        self.declare_parameter("camera_ids", [""])
        self.declare_parameter("camera_image_topics", [""])
        # Per-recorder bounded queue for raw ROS image messages; frames are
        # JPEG-encoded in the subscription callback before entering this queue.
        # Full queues drop frames and count the loss; callbacks never wait for disk I/O.
        self.declare_parameter("max_camera_image_queue", 64)
        self.declare_parameter("camera_rtsp_urls", [""])
        self.declare_parameter("export_target_fps", 10.0)
        self.declare_parameter("export_max_gap_sec", 2.0)
        self.declare_parameter("preflight_max_age_sec", 2.0)
        # A larger fresh-data skew requests asynchronous post-record alignment; it
        # never masks a stale/disconnected sensor, which remains a hard PREPARE fail.
        self.declare_parameter("preflight_alignment_trigger_sec", 0.2)
        self.declare_parameter("alignment_enabled", True)
        self.declare_parameter("preflight_valid_sec", 10.0)
        self.declare_parameter("min_free_space_bytes", 5_000_000_000)
        self.declare_parameter("camera_probe_timeout_sec", 3.0)

        self._root = Path(str(self.get_parameter("recording_root").value)).expanduser().resolve()
        # Explicit SYSTEM_TIME ignores simulated ROS time: bag records have one stable
        # wall-time domain for cross-process data alignment and ordinary rosbag tooling.
        self._receipt_wall_clock = Clock(clock_type=ClockType.SYSTEM_TIME)
        self._arms = tuple(str(item) for item in self.get_parameter("arm_namespaces").value)
        self._lock = threading.RLock()
        self._callback_group = ReentrantCallbackGroup()
        self._store: SessionStore | None = None
        self._archive: McapStateArchive | None = None
        self._camera_worker: RosImageArchive | None = None
        self._cameras_requested = False
        self._state = SessionState.IDLE
        self._deadline_monotonic_ns: int | None = None
        self._paused_remaining_sec: float | None = None
        self._pause_started_monotonic_ns: int | None = None
        self._recorded_topics: set[str] = set()
        # Keep a completed session visible to status consumers after ownership of
        # its writers has been released.  This is metadata only, never a writer.
        self._last_session_id = ""
        self._last_archive_stats = None
        # Preserve the terminal camera result after writers are released.  The
        # status timer must not report a healthy session as unhealthy merely
        # because ``_camera_worker`` has been cleared during finalization.
        self._last_camera_summary: dict[str, dict[str, Any]] = {}
        self._decision_lock = threading.RLock()
        self._last_receipt_wall_ns: dict[str, int] = {}
        self._arm_connected: dict[str, bool] = {}
        self._last_preflight: PreflightResult | None = None
        self._last_alignment_required = False
        self._preflight_valid_until_wall_ns = 0
        self._prepared_cameras = False
        self._scheduled_goal: Any | None = None
        self._scheduled_start_wall_ns = 0
        self._scheduled_starting = False
        # LeRobot export state relayed through /recording/status for the web dashboard.
        self._export_progress = 0.0
        self._export_dir = ""
        self._export_error = ""

        self._topic_types: dict[str, str] = {}
        self._subscriptions = []
        self._register_subscriptions()
        self._register_camera_subscriptions()
        self._status_publisher = self.create_publisher(RecordingStatus, "recording/status", 10)
        self._status_timer = self.create_timer(0.1, self._tick, callback_group=self._callback_group)
        self._upstream_service = self.create_service(
            ManageRecordingService,
            "recording/manage",
            self._manage_service,
            callback_group=self._callback_group,
        )
        self.get_logger().info(
            "Recording recorder ready: subscribes only to existing ROS outputs; no RealMan SDK ownership."
        )

    def destroy_node(self) -> bool:
        self._stop_session(success=False, reason="recording node shutdown")
        return super().destroy_node()

    def _manage_service(
        self, request: ManageRecordingService.Request, response: ManageRecordingService.Response
    ) -> ManageRecordingService.Response:
        """Handle bounded upstream lifecycle requests; export work remains asynchronous."""
        try:
            if request.command == ManageRecordingService.Request.PREPARE:
                session_id = self._prepare(request)
            elif request.command == ManageRecordingService.Request.START:
                # START runs admission checks internally; no separate PREPARE is required.
                self._prepare(request)
                if self._last_preflight is None or not self._last_preflight.ready:
                    summary = self._last_preflight.summary if self._last_preflight else "preflight unavailable"
                    raise RuntimeError(f"preflight failed: {summary}")
                session_id = self._start_session(request)
            elif request.command == ManageRecordingService.Request.STOP:
                session_id = self._stop_or_cancel(reason="upstream stopped recording")
                if session_id is None:
                    raise RuntimeError("no active recording session to stop")
            elif request.command == ManageRecordingService.Request.ADOPT:
                session_id = self._adopt_session(request.session_id)
            elif request.command == ManageRecordingService.Request.DISCARD:
                session_id = self._discard_session(request.session_id)
            else:
                raise ValueError("unsupported recording service command")
            response.success = not (
                request.command == ManageRecordingService.Request.PREPARE
                and (self._last_preflight is None or not self._last_preflight.ready)
            )
            response.session_id = session_id
            response.state = self._state.value
            if request.command == ManageRecordingService.Request.PREPARE and self._last_preflight:
                response.message = self._last_preflight.summary
            elif request.command == ManageRecordingService.Request.STOP:
                response.message = "recording stopped; LeRobot conversion started"
            else:
                response.message = "accepted"
        except Exception as error:  # noqa: BLE001 - ROS service callers need a stable error payload
            self.get_logger().error(f"Recording service request failed: {error}")
            response.success = False
            response.session_id = request.session_id
            response.state = self._state.value
            response.message = str(error)
        return response

    def _register_subscriptions(self) -> None:
        """Subscribe to every configured input; one callback archives samples to MCAP."""
        catalog = build_topic_catalog(
            self._arms,
            arm_action_topics=self.get_parameter("arm_action_topics").value,
            gripper_position_topics=self.get_parameter("gripper_position_topics").value,
            gripper_action_topics=self.get_parameter("gripper_action_topics").value,
            gripper_torque_topics=self.get_parameter("gripper_torque_topics").value,
            gripper_alarm_topics=self.get_parameter("gripper_alarm_topics").value,
        )
        self._topic_types = {spec.topic: spec.type_name for spec in catalog.values()}
        for spec in catalog.values():
            connected_arm = _connected_arm_from_topic(spec.topic)
            self._subscriptions.append(
                self.create_subscription(
                    spec.message_type,
                    spec.topic,
                    lambda message, selected=spec.topic, arm=connected_arm: self._record_message(
                        selected, message, arm
                    ),
                    10,
                    callback_group=self._callback_group,
                )
            )
        # ai TODO: decide whether /tf_static and CameraInfo are required by the first
        # LeRobot export profile; add them only when their storage/replay contract is clear.

    def _register_camera_subscriptions(self) -> None:
        """Subscribe the driver's raw image topics without entering the state MCAP path."""
        for source in self._camera_sources():
            self._subscriptions.append(
                self.create_subscription(
                    Image,
                    source.image_topic,
                    lambda message, selected=source: self._record_camera_image(selected, message),
                    10,
                    callback_group=self._callback_group,
                )
            )

    def _record_camera_image(self, source: CameraSource, message: Image) -> None:
        """JPEG-encode a raw frame and queue it only while recording.

        Only the small JPEG encode runs here; file I/O stays on the archive worker.
        A frame whose encoding is unsupported is dropped rather than aborting the
        subscription callback.
        """
        receipt_wall_ns = self._receipt_wall_clock.now().nanoseconds
        with self._lock:
            self._last_receipt_wall_ns[source.image_topic] = receipt_wall_ns
            archive = self._camera_worker if self._state is SessionState.RECORDING else None
        if archive is not None:
            try:
                jpeg = image_to_jpeg(message)
            except ValueError:
                return
            archive.offer(source.camera_id, receipt_wall_ns, jpeg)

    def _prepare(self, request: Any, *, preserve_scheduled_state: bool = False) -> str:
        """Run admission checks without creating a session or opening a writer."""
        with self._lock:
            if self._store is not None or self._state in {SessionState.FINALIZING, SessionState.EXPORTING}:
                raise RuntimeError("cannot preflight while a recording lifecycle is active")
            if self._state is SessionState.SCHEDULED and not preserve_scheduled_state:
                raise RuntimeError("cannot preflight while a recording lifecycle is active")
            if not preserve_scheduled_state:
                self._state = SessionState.PREPARING
            record_cameras = bool(request.record_cameras)
            requirements = self._preflight_requirements(record_cameras)
            now_wall_ns = self._receipt_wall_clock.now().nanoseconds
            last_receipt_wall_ns = dict(self._last_receipt_wall_ns)
            arm_connected = dict(self._arm_connected)

        # Disk inspection is external work. Do not hold the node lock while it runs:
        # driver callbacks must continue updating freshness observations during PREPARE.
        result = PreflightChecker(requirements).evaluate(
            now_wall_ns=now_wall_ns,
            last_receipt_wall_ns=last_receipt_wall_ns,
            arm_connected=arm_connected,
            free_space_bytes=self._free_space_bytes(),
            mcap_available=importlib.util.find_spec("rosbag2_py") is not None,
            camera_available=self._probe_cameras() if record_cameras else {},
        )
        with self._lock:
            if preserve_scheduled_state and self._state is not SessionState.SCHEDULED:
                return ""  # reservation was cancelled while external checks ran
            self._last_preflight = result
            self._last_alignment_required = result.alignment_required
            self._prepared_cameras = record_cameras
            if result.ready:
                valid_sec = float(self.get_parameter("preflight_valid_sec").value)
                if valid_sec <= 0.0:
                    raise ValueError("preflight_valid_sec must be positive")
                self._preflight_valid_until_wall_ns = now_wall_ns + int(valid_sec * 1e9)
                if not preserve_scheduled_state:
                    self._state = SessionState.ARMED
            else:
                self._preflight_valid_until_wall_ns = 0
                if not preserve_scheduled_state:
                    self._state = SessionState.IDLE
            return ""

    def _start_session(self, goal: Any, *, scheduled_execution: bool = False) -> str:
        """Open a session/MCAP writer now, or park a future start as SCHEDULED.

        ``scheduled_execution`` marks a re-entry after the requested wall-time, when a
        reservation already exists; otherwise a positive ``start_at_walltime_ns`` only
        arms the SCHEDULED state and returns without opening any writer.
        """
        with self._lock:
            if self._store is not None:
                raise RuntimeError("a recording session is already active")
            if self._state in {SessionState.FINALIZING, SessionState.EXPORTING}:
                raise RuntimeError("previous recording session is still finalizing")
            now_wall_ns = self._receipt_wall_clock.now().nanoseconds
            scheduled_at = int(getattr(goal, "start_at_walltime_ns", 0))
            if scheduled_execution and (
                self._state is not SessionState.SCHEDULED or self._scheduled_goal is not goal
            ):
                raise RuntimeError("scheduled recording was cancelled before writers started")
            self._require_valid_preflight(now_wall_ns, record_cameras=bool(goal.record_cameras))
            if not scheduled_execution:
                if scheduled_at > now_wall_ns:
                    self._scheduled_goal = goal
                    self._scheduled_start_wall_ns = scheduled_at
                    self._scheduled_starting = False
                    self._state = SessionState.SCHEDULED
                    return ""
                if scheduled_at and scheduled_at < now_wall_ns:
                    raise ValueError("start_at_walltime_ns is in the past")
            # Validate camera configuration before allocating a session/MCAP writer.
            camera_sources = self._camera_sources() if goal.record_cameras else ()
            store = SessionStore(self._root)
            session = store.create(
                {
                    "profile": goal.profile.strip(),
                    "task": goal.task.strip(),
                    "record_cameras": bool(goal.record_cameras),
                    "duration_sec": int(goal.duration_sec),
                    "start_at_walltime_ns": scheduled_at,
                    "topic_types": self._topic_types,
                    "preflight": self._preflight_payload(),
                    "alignment": {
                        "enabled": bool(self.get_parameter("alignment_enabled").value),
                        "required": self._last_alignment_required,
                        "state": (
                            "REQUESTED" if self._last_alignment_required and bool(self.get_parameter("alignment_enabled").value)
                            else "NOT_REQUIRED"
                        ),
                    },
                    "canonical_config": {
                        "repo_id": str(self.get_parameter("lerobot_repo_id").value),
                        "arms": list(self._arms),
                        "arm_action_topics": [str(item) for item in self.get_parameter("arm_action_topics").value if str(item)],
                        "gripper_position_topics": [str(item) for item in self.get_parameter("gripper_position_topics").value if str(item)],
                        "gripper_action_topics": [str(item) for item in self.get_parameter("gripper_action_topics").value if str(item)],
                        "camera_ids": [str(item) for item in self.get_parameter("camera_ids").value if str(item)],
                    },
                }
            )
            try:
                # FK must use the exact robot model that applied when raw data was
                # recorded.  A later package upgrade must not silently alter export.
                urdf_source = self._resolve_urdf_source()
                snapshot = session.directory / "metadata" / "robot.urdf"
                snapshot.parent.mkdir(mode=0o750)
                shutil.copy2(urdf_source, snapshot)
                calibration = snapshot_optional_file(
                    str(self.get_parameter("calibration_snapshot_path").value),
                    session.directory / "metadata", "camera_calibration.yaml",
                    version=str(self.get_parameter("calibration_version").value),
                )
                store.update_metadata(canonical={
                    "embodiment_id": str(self.get_parameter("embodiment_id").value),
                    "urdf_package": str(self.get_parameter("urdf_package").value),
                    "urdf_relative_path": str(self.get_parameter("urdf_relative_path").value),
                    "urdf_base_link": str(self.get_parameter("urdf_base_link").value),
                    "urdf_snapshot": "metadata/robot.urdf",
                    "urdf_sha256": sha256(snapshot.read_bytes()).hexdigest(),
                    "joint_names": list(self.get_parameter("joint_names").value),
                    "joint_limits": urdf_joint_limits(
                        snapshot, self.get_parameter("joint_names").value
                    ),
                    "base_frames": list(self.get_parameter("base_frames").value),
                    "ee_links": list(self.get_parameter("ee_links").value),
                    "cartesian_command_representation": str(self.get_parameter("cartesian_command_representation").value),
                    "cartesian_command_frames": list(self.get_parameter("cartesian_command_frames").value),
                    "calibration": calibration,
                    "capabilities": {
                        "joint_velocity": "derived_from_position",
                        "joint_effort": "not_recorded_by_current_driver",
                        "action_executed": "not_available",
                    },
                })
            except Exception as error:
                store.finalize(False, reason=f"canonical URDF snapshot failed: {error}")
                raise
            archive = McapStateArchive(int(self.get_parameter("max_state_queue").value))
            try:
                archive.start(session.directory / "state.mcap", self._topic_types)
            except Exception as error:
                # Session creation precedes bag opening, so close its manifest on a
                # storage/plugin/permission failure instead of leaving COUNTDOWN data.
                store.finalize(False, reason=f"MCAP archive startup failed: {error}")
                raise
            self._store = store
            self._archive = archive
            self._cameras_requested = bool(goal.record_cameras)
            self._recorded_topics = set(self._topic_types)
            self._state = SessionState.RECORDING
            store.transition(self._state)
            self._deadline_monotonic_ns = (
                time.monotonic_ns() + int(goal.duration_sec) * 1_000_000_000
                if goal.duration_sec > 0
                else None
            )
            self._paused_remaining_sec = None
            self._pause_started_monotonic_ns = None
            self._scheduled_goal = None
            self._scheduled_start_wall_ns = 0
            self._scheduled_starting = False
            self._last_camera_summary = {}
            if goal.record_cameras:
                camera_worker = RosImageArchive(
                    camera_sources,
                    queue_size=int(self.get_parameter("max_camera_image_queue").value),
                )
                self._camera_worker = camera_worker
                try:
                    camera_worker.start(session.directory / "videos")
                except Exception as error:  # noqa: BLE001 - close every writer on admission failure
                    camera_summary = camera_worker.stop()
                    self._camera_worker = None
                    archive_stats = archive.stop()
                    store.finalize(
                        False,
                        reason=f"camera writer startup failed: {error}",
                        enqueued_samples=archive_stats.enqueued,
                        accepted_samples=archive_stats.accepted,
                        dropped_samples=archive_stats.dropped,
                        write_errors=archive_stats.write_errors,
                        cameras=camera_summary,
                    )
                    self._store = None
                    self._archive = None
                    self._state = SessionState.FAILED
                    raise
        return session.session_id

    def _preflight_requirements(self, record_cameras: bool) -> PreflightRequirements:
        """Assemble the admission inputs (topics, arms, cameras, limits) from parameters."""
        max_age_sec = float(self.get_parameter("preflight_max_age_sec").value)
        if max_age_sec <= 0.0:
            raise ValueError("preflight_max_age_sec must be positive")
        max_skew_sec = float(self.get_parameter("preflight_alignment_trigger_sec").value)
        if max_skew_sec < 0.0:
            raise ValueError("preflight_alignment_trigger_sec must be non-negative")
        configured_topics = tuple(
            str(topic) for topic in self.get_parameter("preflight_required_topics").value
        )
        # An empty parameter preserves safe legacy behavior for deployments which
        # have not yet supplied a profile-specific gate configuration.
        base_topics = configured_topics or (
            tuple(f"/{arm}/joint_states" for arm in self._arms)
            + tuple(str(topic) for topic in self.get_parameter("gripper_position_topics").value)
        )
        required_topics = base_topics + (
            tuple(source.image_topic for source in self._camera_sources()) if record_cameras else ()
        )
        camera_ids = tuple(str(item) for item in self.get_parameter("camera_ids").value) if record_cameras else ()
        return PreflightRequirements(
            required_topics=required_topics,
            required_arms=self._arms,
            required_cameras=camera_ids,
            max_age_ns=int(max_age_sec * 1e9),
            min_free_space_bytes=int(self.get_parameter("min_free_space_bytes").value),
            alignment_trigger_ns=int(max_skew_sec * 1e9),
        )

    def _free_space_bytes(self) -> int:
        """Report free space on the nearest existing ancestor of ``recording_root``."""
        candidate = self._root
        while not candidate.exists() and candidate != candidate.parent:
            candidate = candidate.parent
        return shutil.disk_usage(candidate).free

    def _probe_cameras(self) -> dict[str, bool]:
        """Use recent ROS image receipts as camera readiness; never open an RTSP client."""
        now_wall_ns = self._receipt_wall_clock.now().nanoseconds
        max_age_ns = int(float(self.get_parameter("preflight_max_age_sec").value) * 1e9)
        with self._lock:
            return {
                source.camera_id: now_wall_ns - self._last_receipt_wall_ns.get(source.image_topic, 0) <= max_age_ns
                for source in self._camera_sources()
            }

    def _require_valid_preflight(self, now_wall_ns: int, *, record_cameras: bool) -> None:
        """Enforce that a recent, camera-compatible PREPARE preceded this START."""
        if self._last_preflight is None or not self._last_preflight.ready:
            raise RuntimeError("PREPARE must succeed before START")
        if now_wall_ns > self._preflight_valid_until_wall_ns:
            raise RuntimeError("successful PREPARE has expired; run PREPARE again")
        if record_cameras and not self._prepared_cameras:
            raise RuntimeError("START requests cameras but the successful PREPARE did not probe cameras")

    def _preflight_payload(self) -> dict[str, Any]:
        result = self._last_preflight
        return {
            "checked_wall_ns": result.checked_wall_ns if result else 0,
            "diagnostics": [item.__dict__ for item in result.diagnostics] if result else [],
        }

    def _diagnostics_json(self) -> str:
        return json.dumps(self._preflight_payload(), separators=(",", ":"))

    def _pause_session(self) -> str:
        """Freeze the countdown and close camera segments without finalizing the session."""
        with self._lock:
            self._require_state(SessionState.RECORDING)
            self._paused_remaining_sec = self._remaining_sec()
            self._pause_started_monotonic_ns = time.monotonic_ns()
            self._deadline_monotonic_ns = None
            self._state = SessionState.PAUSED
            assert self._store and self._store.session
            self._store.transition(self._state)
            if self._camera_worker is not None:
                self._camera_worker.pause()
            return self._store.session.session_id

    def _resume_session(self) -> str:
        """Record a pause interval, restore the countdown, and reopen camera segments."""
        with self._lock:
            self._require_state(SessionState.PAUSED)
            now = time.monotonic_ns()
            assert self._store and self._store.session
            if self._pause_started_monotonic_ns is not None:
                self._store.add_pause_interval(self._pause_started_monotonic_ns, now)
            if self._paused_remaining_sec is not None:
                self._deadline_monotonic_ns = now + int(self._paused_remaining_sec * 1e9)
            self._paused_remaining_sec = None
            self._pause_started_monotonic_ns = None
            self._state = SessionState.RECORDING
            self._store.transition(self._state)
            if self._camera_worker is not None:
                self._camera_worker.resume(self._store.session.directory / "videos")
            return self._store.session.session_id

    def _stop_session(self, *, success: bool, reason: str) -> str | None:
        """Finalize the session: stop archive/camera writers and write the final manifest.

        The durable writers are stopped outside the lock so a slow ffmpeg/rosbag close
        cannot block subscription callbacks.  The final READY/FAILED state reflects both
        the requested ``success`` and whether the archive reported write errors.
        """
        with self._lock:
            store, archive, camera_worker = self._store, self._archive, self._camera_worker
            if store is None or store.session is None:
                return None
            session_id = store.session.session_id
            if self._state is SessionState.PAUSED and self._pause_started_monotonic_ns is not None:
                store.add_pause_interval(self._pause_started_monotonic_ns, time.monotonic_ns())
            self._state = SessionState.FINALIZING
            store.transition(self._state)
            self._store = None
            self._archive = None
            self._camera_worker = None
            self._deadline_monotonic_ns = None
            self._paused_remaining_sec = None
            self._pause_started_monotonic_ns = None
        archive_stats = archive.stop() if archive is not None else None
        camera_summary = camera_worker.stop() if camera_worker is not None else {}
        archive_write_errors = archive_stats.write_errors if archive_stats else 1
        final_success = success and archive_write_errors == 0
        final_reason = reason if final_success else f"{reason}; MCAP write/close errors: {archive_write_errors}"
        directory = store.session.directory
        store.finalize(
            final_success,
            reason=final_reason,
            enqueued_samples=archive_stats.enqueued if archive_stats else 0,
            accepted_samples=archive_stats.accepted if archive_stats else 0,
            dropped_samples=archive_stats.dropped if archive_stats else 0,
            write_errors=archive_write_errors,
            cameras=camera_summary,
        )
        with self._lock:
            self._last_session_id = session_id
            self._last_archive_stats = archive_stats
            self._last_camera_summary = camera_summary
            self._state = SessionState.READY if final_success else SessionState.FAILED
        # STOP only seals raw data.  The upstream ADOPT request is the single explicit
        # authorization to spend CPU and append an episode to the training dataset.
        return session_id

    def _stop_or_cancel(self, *, reason: str) -> str | None:
        """Stop durable writers, or cancel a scheduled start before any writer exists."""
        with self._lock:
            if self._state is SessionState.SCHEDULED:
                self._scheduled_goal = None
                self._scheduled_start_wall_ns = 0
                self._scheduled_starting = False
                self._state = SessionState.ARMED
                self.get_logger().info(f"scheduled recording cancelled: {reason}")
                return ""
        return self._stop_session(success=True, reason=reason)

    def _session_directory(self, session_id: str) -> Path:
        """Resolve one generated ID beneath recording_root without path traversal."""
        if not session_id or Path(session_id).name != session_id:
            raise ValueError("session_id must be one recording session directory name")
        directory = (self._root / session_id).resolve()
        if directory.parent != self._root or not directory.is_dir():
            raise ValueError("recording session does not exist beneath recording_root")
        return directory

    def _adopt_session(self, session_id: str) -> str:
        """Mark a clean finalized session adopted and queue its exporter worker."""
        directory = self._session_directory(session_id)
        with self._decision_lock:
            manifest = SessionStore.update_final_manifest(directory)
            if manifest.get("state") != SessionState.READY.value:
                raise RuntimeError("only READY recording sessions can be adopted")
            if manifest.get("decision") != "PENDING":
                raise RuntimeError("recording session was already adopted or discarded")
            summary = manifest.get("summary", {})
            if not isinstance(summary, dict) or int(summary.get("write_errors", 0)) != 0:
                raise RuntimeError("recording session has MCAP write errors and cannot be adopted")
        self._queue_export(directory, session_id)
        return session_id

    def _queue_export(self, directory: Path, session_id: str) -> None:
        """Mark a finalized session adopted and start its LeRobot export worker."""
        with self._decision_lock:
            SessionStore.update_final_manifest(
                directory,
                decision="ADOPTED",
                export={"state": "QUEUED", "requested_realtime_ns": time.time_ns()},
            )
        threading.Thread(
            target=self._export_adopted_session,
            args=(directory,),
            name=f"recording-export-{session_id}",
            daemon=True,
        ).start()

    def _discard_session(self, session_id: str) -> str:
        """Logically discard a finalized session while retaining raw artifacts for audit."""
        directory = self._session_directory(session_id)
        with self._decision_lock:
            manifest = SessionStore.update_final_manifest(directory)
            if manifest.get("state") != SessionState.READY.value:
                raise RuntimeError("only READY recording sessions can be discarded")
            if manifest.get("decision") != "PENDING":
                raise RuntimeError("recording session was already adopted or discarded")
            SessionStore.update_final_manifest(
                directory,
                decision="DISCARDED",
                discarded_realtime_ns=time.time_ns(),
            )
        return session_id

    def _export_adopted_session(self, directory: Path) -> None:
        """Run expensive LeRobot conversion away from every ROS callback/executor thread."""
        export_root = Path(str(self.get_parameter("lerobot_export_dir").value))
        # This is one append-only v3 dataset.  A session becomes one episode, rather
        # than creating a v2-shaped dataset directory per session.
        output_dir = export_root
        with self._decision_lock:
            self._export_progress = 0.0
            self._export_dir = ""
            self._export_error = ""
            SessionStore.update_final_manifest(
                directory,
                export={"state": "RUNNING", "started_realtime_ns": time.time_ns()},
            )
        try:
            result = LeRobotExporter().export(
                ExportRequest(
                    session_dir=directory,
                    output_dir=output_dir,
                    target_fps=float(self.get_parameter("export_target_fps").value),
                    max_gap_sec=float(self.get_parameter("export_max_gap_sec").value),
                    schema=schema_from_parameters(
                        repo_id=str(self.get_parameter("lerobot_repo_id").value),
                        fps=float(self.get_parameter("export_target_fps").value),
                        arms=self._arms,
                        arm_action_topics=self.get_parameter("arm_action_topics").value,
                        gripper_position_topics=self.get_parameter("gripper_position_topics").value,
                        gripper_action_topics=self.get_parameter("gripper_action_topics").value,
                        camera_ids=self.get_parameter("camera_ids").value,
                        joint_names=self.get_parameter("joint_names").value,
                        embodiment_id=str(self.get_parameter("embodiment_id").value),
                        urdf_package=str(self.get_parameter("urdf_package").value),
                        urdf_relative_path=str(self.get_parameter("urdf_relative_path").value),
                        urdf_base_link=str(self.get_parameter("urdf_base_link").value),
                        base_frames=self.get_parameter("base_frames").value,
                        ee_links=self.get_parameter("ee_links").value,
                        cartesian_command_representation=str(self.get_parameter("cartesian_command_representation").value),
                        cartesian_command_frames=self.get_parameter("cartesian_command_frames").value,
                    ),
                    progress_callback=self._export_progress_callback,
                )
            )
        except Exception as error:  # noqa: BLE001 - failure is persisted for upstream polling
            with self._decision_lock:
                self._export_progress = 0.0
                self._export_error = str(error)
                SessionStore.update_final_manifest(
                    directory,
                    export={"state": "FAILED", "message": str(error), "ended_realtime_ns": time.time_ns()},
                )
            self.get_logger().error(f"LeRobot export failed for {directory.name}: {error}")
        else:
            with self._decision_lock:
                self._export_progress = 1.0
                self._export_dir = str(result)
                self._export_error = ""
                SessionStore.update_final_manifest(
                    directory,
                    export={"state": "SUCCEEDED", "result": str(result), "ended_realtime_ns": time.time_ns()},
                )

    def _resolve_urdf_source(self) -> Path:
        """Resolve the installed description package before a session is opened."""
        try:
            from ament_index_python.packages import get_package_share_directory
        except ImportError as error:
            raise RuntimeError("ament_index_python is required to snapshot the configured URDF") from error
        package = str(self.get_parameter("urdf_package").value)
        relative = str(self.get_parameter("urdf_relative_path").value)
        candidate = Path(get_package_share_directory(package)) / relative
        if not candidate.is_file():
            raise RuntimeError(f"configured URDF does not exist: {candidate}")
        return candidate.resolve()

    def _export_progress_callback(self, done: int, total: int) -> None:
        """Relay exporter frame progress to the status publisher (and web dashboard)."""
        with self._decision_lock:
            self._export_progress = (done / total) if total > 0 else 1.0

    def _record_message(self, topic: str, message: Any, connected_arm: str | None = None) -> None:
        """Freshness/receipt bookkeeping plus a non-blocking archive enqueue."""
        receipt_wall_ns = self._receipt_wall_clock.now().nanoseconds
        with self._lock:
            self._last_receipt_wall_ns[topic] = receipt_wall_ns
            if connected_arm is not None:
                self._arm_connected[connected_arm] = bool(message.data)
            archive = self._archive
            should_record = self._state is SessionState.RECORDING and topic in self._recorded_topics
        if archive is not None and should_record:
            # MCAP/rosbag2 record time is epoch-based receipt time. Paired session
            # wall/monotonic anchors let the LeRobot exporter derive media alignment.
            archive.enqueue(topic, message, receipt_wall_ns)

    def _tick(self) -> None:
        """Periodic timer: fire due scheduled starts and countdown stops, then publish.

        Heavy work (session stop/start) is pushed to daemon threads so the timer callback
        itself never blocks the executor.
        """
        scheduled_goal = None
        with self._lock:
            if (
                self._state is SessionState.SCHEDULED
                and self._scheduled_goal is not None
                and not self._scheduled_starting
            ):
                if self._receipt_wall_clock.now().nanoseconds >= self._scheduled_start_wall_ns:
                    scheduled_goal = self._scheduled_goal
                    self._scheduled_starting = True
            if self._state is SessionState.RECORDING and self._deadline_monotonic_ns is not None:
                if time.monotonic_ns() >= self._deadline_monotonic_ns:
                    # Timer callback is the authoritative countdown; browser timers are display-only.
                    self._deadline_monotonic_ns = None
                    threading.Thread(
                        target=self._stop_session,
                        kwargs={"success": True, "reason": "countdown elapsed"},
                        daemon=True,
                    ).start()
            self._publish_status_locked()
        if scheduled_goal is not None:
            threading.Thread(
                target=self._start_scheduled_session,
                args=(scheduled_goal,),
                name="recording-scheduled-start",
                daemon=True,
            ).start()

    def _start_scheduled_session(self, goal: Any) -> None:
        """Re-check health at the requested wall-time without blocking ROS callbacks."""
        try:
            self._prepare(goal, preserve_scheduled_state=True)
            with self._lock:
                if self._state is not SessionState.SCHEDULED or self._scheduled_goal is not goal:
                    return  # STOP cancelled the reservation while PREPARE was running.
                if self._last_preflight is None or not self._last_preflight.ready:
                    raise RuntimeError("scheduled PREPARE failed")
            self._start_session(goal, scheduled_execution=True)
        except Exception as error:  # noqa: BLE001 - publish lifecycle failure to every client
            with self._lock:
                if self._state is SessionState.SCHEDULED and self._scheduled_goal is goal:
                    self._scheduled_goal = None
                    self._scheduled_start_wall_ns = 0
                    self._state = SessionState.FAILED
            self.get_logger().error(f"scheduled recording start failed: {error}")
        finally:
            with self._lock:
                self._scheduled_starting = False

    def _publish_status_locked(self) -> None:
        """Publish one RecordingStatus snapshot; callers hold ``self._lock``."""
        status = RecordingStatus()
        status.header.stamp = self._receipt_wall_clock.now().to_msg()
        status.state = _STATUS_CODE[self._state]
        if self._store is not None and self._store.session is not None:
            status.session_id = self._store.session.session_id
            status.elapsed_sec = max(0.0, (time.monotonic_ns() - self._store.session.started_monotonic_ns) / 1e9)
            archive_stats = self._archive.stats if self._archive is not None else None
            status.accepted_samples = archive_stats.accepted if archive_stats else 0
            status.dropped_samples = archive_stats.dropped if archive_stats else 0
        else:
            status.session_id = self._last_session_id
            status.accepted_samples = self._last_archive_stats.accepted if self._last_archive_stats else 0
            status.dropped_samples = self._last_archive_stats.dropped if self._last_archive_stats else 0
        status.remaining_sec = self._remaining_sec()
        if not self._cameras_requested:
            status.cameras_healthy = True
        elif self._camera_worker is not None:
            status.cameras_healthy = self._camera_worker.healthy
        else:
            # A finalized session has no live worker; use its persisted per
            # camera summary instead of treating normal STOP as unhealthy.
            status.cameras_healthy = not self._last_camera_summary or all(
                str(item.get("state", "")) == "stopped"
                for item in self._last_camera_summary.values()
            )
        status.detail = self._state.value
        status.diagnostics_json = self._diagnostics_json()
        status.scheduled_start_walltime_ns = self._scheduled_start_wall_ns
        status.export_progress = self._export_progress
        status.export_dir = self._export_dir
        status.export_error = self._export_error
        self._status_publisher.publish(status)

    def _remaining_sec(self) -> float:
        """Seconds until the countdown deadline, or the frozen remainder while paused."""
        if self._paused_remaining_sec is not None:
            return self._paused_remaining_sec
        if self._deadline_monotonic_ns is None:
            return 0.0
        return max(0.0, (self._deadline_monotonic_ns - time.monotonic_ns()) / 1e9)

    def _camera_sources(self) -> tuple[CameraSource, ...]:
        return load_camera_sources(self)

    def _require_state(self, expected: SessionState) -> None:
        """Raise unless the node is in exactly ``expected``."""
        if self._state is not expected:
            raise RuntimeError(f"expected {expected.value}, current state is {self._state.value}")


def _connected_arm_from_topic(topic: str) -> str | None:
    """Return the arm name for a ``/{arm}/connected`` topic, else ``None``."""
    parts = topic.split("/")
    if len(parts) == 3 and parts[0] == "" and parts[2] == "connected":
        return parts[1]
    return None


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = RecordingRecorderNode()
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
