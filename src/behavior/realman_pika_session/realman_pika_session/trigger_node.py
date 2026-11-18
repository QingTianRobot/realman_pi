"""ROS shell around EpisodeMachine: keyboard edges -> recording START/STOP -> Pika branch restart (home)."""
from __future__ import annotations

import json
import time
from pathlib import Path

import rclpy
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
from std_msgs.msg import Bool, String
from std_srvs.srv import Trigger

from realman_msgs.msg import InputModeState
from realman_msgs.srv import SelectInputMode
from realman_recording_msgs.msg import RecordingStatus
from realman_recording_msgs.srv import ManageRecording

from realman_pika_session.branch_restart import BranchRestart, Effect, ModeView
from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose
from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig

SERVICE_TIMEOUT_SEC = 10.0
LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
BEST_EFFORT = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)
MODE_TOPIC = "/realman_bt_executor/input_mode_state"
SELECT_MODE_SERVICE = "/realman_bt_executor/select_input_mode"
REQUESTER_ID = "pika_episode"
PHASES = {InputModeState.ACTIVE: "ACTIVE", InputModeState.SWITCHING: "SWITCHING", InputModeState.FAILED: "FAILED"}
# The recorder holds or is about to hold a session: a key press must not open a second one.
RECORDER_BUSY = (
    RecordingStatus.SCHEDULED, RecordingStatus.ARMED, RecordingStatus.COUNTDOWN,
    RecordingStatus.RECORDING, RecordingStatus.FINALIZING,
)
# The session named in /recording/status is still running and a STOP would end it.
RECORDER_ACTIVE = (RecordingStatus.COUNTDOWN, RecordingStatus.RECORDING)


class TriggerNode(Node):
    def __init__(
        self,
        episode_config: EpisodeConfig,
        home_pose: dict[str, tuple[float, ...]],
        service_timeout_sec: float = SERVICE_TIMEOUT_SEC,
    ) -> None:
        super().__init__("pika_episode_trigger")
        self._config = episode_config
        self._service_timeout_sec = service_timeout_sec
        self._home_pose = home_pose
        arms = tuple(sorted(home_pose))
        self._machine = EpisodeMachine(MachineConfig(
            required_mode=episode_config.required_mode,
            keyboard_stale_sec=episode_config.keyboard_stale_sec,
            home_arms=arms,
        ))
        self._recording = self.create_client(ManageRecording, "/recording/manage")
        self._select_mode = self.create_client(SelectInputMode, SELECT_MODE_SERVICE)
        self._restart = BranchRestart(
            episode_config.required_mode, episode_config.restart_off_mode,
            episode_config.restart_off_timeout_sec, episode_config.restart_timeout_sec,
        )
        # Homing also releases the grippers (gripper_ros2 /<name>/open); arms that are not homed keep theirs.
        self._gripper_open = {
            arm: self.create_client(Trigger, f"/{name}/open")
            for arm, name in episode_config.home_open_grippers.items() if arm in home_pose
        }
        self._pending_call = None  # (kind, future, deadline)
        # START calls that timed out: a late success means the recorder did start, so that session is stopped.
        self._orphan_start_futures: set = set()
        self._state_pub = self.create_publisher(String, "/pika_episode/state", LATCHED)
        self._last_published: dict | None = None
        self._last_publish_time = 0.0
        # Last mode fed to the machine; "" also stands for "no BT executor publishing".
        self._fed_mode = ""
        # Latest /recording/status as (session_id, state); None until the first message.
        self._recorder_status: tuple[str, int] | None = None

        # Best effort matches both reliable and best-effort keyboard publishers; the machine compares levels.
        self.create_subscription(Bool, episode_config.keyboard_topic, self._on_keyboard, BEST_EFFORT)
        self.create_subscription(InputModeState, MODE_TOPIC, self._on_mode, LATCHED)
        self.create_subscription(RecordingStatus, "/recording/status", self._on_recording_status, 10)
        self.create_timer(0.1, self._on_timer)
        self.get_logger().info(
            f"pika episode trigger ready: keyboard={episode_config.keyboard_topic} "
            f"mode={episode_config.required_mode} home_arms={','.join(arms)} "
            f"open_grippers={','.join(sorted(self._gripper_open)) or 'none'} task='{episode_config.task}'"
        )
        self._publish_state(force=True)

    def interfaces_ready(self) -> bool:
        """True once the recorder service and the executor's mode selection service are discovered."""
        return self._recording.service_is_ready() and self._select_mode.service_is_ready()

    # ---- subscriptions ------------------------------------------------
    def _on_keyboard(self, message: Bool) -> None:
        self._apply(self._machine.on_keyboard(bool(message.data), time.monotonic()))

    def _on_mode(self, message: InputModeState) -> None:
        mode = message.active_mode if message.phase == InputModeState.ACTIVE else ""
        self._feed_mode(mode)
        view = ModeView(
            requested_mode=message.requested_mode, active_mode=message.active_mode,
            phase=PHASES.get(message.phase, "UNKNOWN"), request_id=int(message.request_id), detail=message.detail,
        )
        self._run_restart(self._restart.on_mode_state(view, time.monotonic()))

    def _feed_mode(self, mode: str) -> None:
        self._fed_mode = mode
        self._apply(self._machine.on_mode(mode, time.monotonic()))

    def _check_mode_publisher(self) -> None:
        """A stopped or crashed BT executor publishes no final state; its latched mode must not outlive it."""
        if self._fed_mode != "" and self.count_publishers(MODE_TOPIC) == 0:
            self.get_logger().warning(f"no publisher on {MODE_TOPIC}: treating the input mode as unknown")
            self._feed_mode("")

    def _on_recording_status(self, message: RecordingStatus) -> None:
        self._recorder_status = (message.session_id, message.state)
        self._machine.on_recording_status(message.state in RECORDER_BUSY, message.session_id)

    def _stop_blocker(self, session_id: str) -> str:
        """Why a STOP for `session_id` must not be sent ("" = send it).

        The recorder's STOP ends whatever session is active, so it is only sent while /recording/status
        names our session as active. With no status yet, or a status that still shows an older idle
        session (it can lag the START reply by a tick), nothing else is running and STOP is safe.
        """
        if self._recorder_status is None:
            return ""
        status_session, state = self._recorder_status
        if status_session == session_id:
            return "" if state in RECORDER_ACTIVE else "session already ended externally"
        if state in RECORDER_BUSY:
            return "session already ended externally"
        return ""

    def _on_timer(self) -> None:
        now = time.monotonic()
        if self._pending_call is not None and now > self._pending_call[2]:
            kind, future, _ = self._pending_call
            self._pending_call = None
            if kind == "start":
                self._orphan_start_futures.add(future)  # keep listening: a late success must be stopped
            else:
                future.cancel()
            self._service_result(kind, False, "", "recording service timed out")
        self._run_restart(self._restart.tick(now))
        self._check_mode_publisher()
        self._apply(self._machine.tick(now))  # _apply always publishes (on change or once a second)

    # ---- actions ------------------------------------------------------
    def _apply(self, actions: list[Action]) -> None:
        for action in actions:
            if action.kind in ("start", "stop"):
                self._call_recording(action.kind)
            elif action.kind == "restart":
                for arm in action.arms:
                    self._open_gripper(arm)
                self.get_logger().info(
                    f"restarting {self._config.required_mode}: {self._config.restart_off_mode} first, "
                    "then its entry MoveJ homes the arms")
                self._run_restart(self._restart.start(time.monotonic()))
        self._publish_state()

    def _call_recording(self, kind: str) -> None:
        request = ManageRecording.Request()
        if kind == "start":
            request.command = ManageRecording.Request.START
            request.profile = self._config.profile
            request.task = self._config.task
            request.duration_sec = 0
            request.record_cameras = self._config.record_cameras
            request.start_at_walltime_ns = 0
        else:
            request.command = ManageRecording.Request.STOP
            request.session_id = self._machine.snapshot()["session_id"]
            blocker = self._stop_blocker(request.session_id)
            if blocker:
                self.get_logger().warning(
                    f"not sending STOP for {request.session_id}: {blocker} (status={self._recorder_status})")
                self._service_result(kind, False, request.session_id, blocker)
                return
        if not self._recording.service_is_ready():
            self._service_result(kind, False, "", "/recording/manage is not available")
            return
        self.get_logger().info(f"recording {kind} requested")
        future = self._recording.call_async(request)
        self._pending_call = (kind, future, time.monotonic() + self._service_timeout_sec)
        future.add_done_callback(lambda done, kind=kind: self._on_service_done(kind, done))

    def _on_service_done(self, kind: str, future) -> None:
        if future in self._orphan_start_futures:
            self._orphan_start_futures.discard(future)
            self._on_late_start(future)
            return
        if self._pending_call is None or self._pending_call[1] is not future:
            return  # timed out already
        self._pending_call = None
        if future.cancelled() or future.exception() is not None:
            self._service_result(kind, False, "", f"recording {kind} call failed: {future.exception()}")
            return
        response = future.result()
        self._service_result(kind, response.success, response.session_id, response.message)

    def _on_late_start(self, future) -> None:
        """A START reply after the timeout; the machine already went back to IDLE, so stop the session here."""
        if future.cancelled() or future.exception() is not None:
            self.get_logger().warning(f"late START reply after timeout failed: {future.exception()}")
            return
        response = future.result()
        if not response.success or not response.session_id:
            self.get_logger().warning(f"late START reply after timeout, not started: {response.message}")
            return
        session_id = response.session_id
        self.get_logger().error(f"late START success after timeout, stopping orphan session {session_id}")
        blocker = self._stop_blocker(session_id)
        if blocker:
            self.get_logger().error(
                f"not stopping orphan session {session_id}: {blocker} (status={self._recorder_status})")
            return
        if not self._recording.service_is_ready():
            self.get_logger().error(f"cannot stop orphan session {session_id}: /recording/manage is not available")
            return
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.STOP
        request.session_id = session_id
        self._recording.call_async(request).add_done_callback(
            lambda done, session_id=session_id: self._on_orphan_stop_done(session_id, done))

    def _on_orphan_stop_done(self, session_id: str, future) -> None:
        if future.cancelled() or future.exception() is not None:
            self.get_logger().error(f"stopping orphan session {session_id} failed: {future.exception()}")
            return
        response = future.result()
        self._log_outcome(
            response.success, f"orphan session {session_id} stop {'ok' if response.success else 'failed'}: {response.message}")

    def _service_result(self, kind: str, success: bool, session_id: str, message: str) -> None:
        now = time.monotonic()
        self._log_outcome(
            success, f"recording {kind} {'ok' if success else 'failed'}: session={session_id} {message}", "warning")
        if kind == "start":
            self._apply(self._machine.on_start_result(success, session_id, message, now))
        else:
            self._apply(self._machine.on_stop_result(success, message, now))

    def _open_gripper(self, arm: str) -> None:
        """Release the gripper while the arm homes; a failure is logged and never blocks the homing."""
        client = self._gripper_open.get(arm)
        if client is None:
            return
        if not client.service_is_ready():
            self.get_logger().warning(f"not opening gripper of /{arm}: {client.srv_name} is not available")
            return
        self.get_logger().info(f"opening gripper of /{arm} ({client.srv_name})")
        client.call_async(Trigger.Request()).add_done_callback(
            lambda done, arm=arm: self._on_gripper_open_done(arm, done))

    def _on_gripper_open_done(self, arm: str, future) -> None:
        if future.cancelled() or future.exception() is not None:
            self.get_logger().warning(f"opening gripper of /{arm} failed: {future.exception()}")
            return
        response = future.result()
        self._log_outcome(
            response.success, f"gripper of /{arm} {'opened' if response.success else 'open failed'}: {response.message}",
            "warning")

    def _run_restart(self, effects: list[Effect]) -> None:
        for effect in effects:
            if effect.kind == "select":
                self._request_mode(effect.mode_id)
            else:
                self._log_outcome(effect.success, f"branch restart {'done' if effect.success else 'failed'}: {effect.message}")
                self._apply(self._machine.on_restart_result(effect.success, effect.message, time.monotonic()))

    def _request_mode(self, mode_id: str) -> None:
        if not self._select_mode.service_is_ready():
            self._run_restart(self._restart.on_select_response(
                mode_id, False, 0, f"{SELECT_MODE_SERVICE} is not available", time.monotonic()))
            return
        self.get_logger().info(f"selecting input mode {mode_id}")
        request = SelectInputMode.Request(mode_id=mode_id, requester_id=REQUESTER_ID)
        self._select_mode.call_async(request).add_done_callback(
            lambda done, mode_id=mode_id: self._on_select_done(mode_id, done))

    def _on_select_done(self, mode_id: str, future) -> None:
        now = time.monotonic()
        if future.cancelled() or future.exception() is not None:
            effects = self._restart.on_select_response(mode_id, False, 0, f"call failed: {future.exception()}", now)
        else:
            response = future.result()
            effects = self._restart.on_select_response(
                mode_id, response.accepted, int(response.request_id), response.message, now)
        self._run_restart(effects)

    def _log_outcome(self, success: bool, text: str, failure_level: str = "error") -> None:
        # rclpy rejects one call site logging at two severities ("Logger severity cannot be changed
        # between calls"), so each severity keeps its own call.
        if success:
            self.get_logger().info(text)
        elif failure_level == "warning":
            self.get_logger().warning(text)
        else:
            self.get_logger().error(text)

    # ---- state topic --------------------------------------------------
    def _publish_state(self, force: bool = False) -> None:
        snapshot = dict(self._machine.snapshot(), task=self._config.task)
        now = time.monotonic()
        if not force and snapshot == self._last_published and now - self._last_publish_time < 1.0:
            return
        if snapshot != self._last_published:
            self.get_logger().info(f"episode state: {snapshot['state']} {snapshot['detail']}")
        self._last_published = snapshot
        self._last_publish_time = now
        self._state_pub.publish(String(data=json.dumps(dict(snapshot, stamp_ns=time.time_ns()))))


def main() -> None:
    rclpy.init()
    loader = Node("pika_episode_trigger_params")
    episode_file = loader.declare_parameter("episode_config_file", "").value
    pika_file = loader.declare_parameter("pika_config_file", "").value
    loader.destroy_node()
    node = TriggerNode(load_episode_config(Path(episode_file)), load_home_pose(Path(pika_file)))
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
