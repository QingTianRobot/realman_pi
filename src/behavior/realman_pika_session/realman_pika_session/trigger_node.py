"""ROS shell around EpisodeMachine: keyboard edges -> recording START/STOP -> MoveJ home."""
from __future__ import annotations

import json
import time
from pathlib import Path

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
from std_msgs.msg import Bool, String

from realman_msgs.action import ExecuteMotion
from realman_msgs.msg import CartesianVelocityState, InputModeState
from realman_recording_msgs.msg import RecordingStatus
from realman_recording_msgs.srv import ManageRecording

from realman_pika_session.config_loader import EpisodeConfig, load_episode_config, load_home_pose
from realman_pika_session.episode_machine import Action, EpisodeMachine, MachineConfig

SERVICE_TIMEOUT_SEC = 10.0
RESULT_MARGIN_SEC = 5.0
LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
BEST_EFFORT = QoSProfile(depth=10, reliability=ReliabilityPolicy.BEST_EFFORT)


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
            release_timeout_sec=episode_config.release_timeout_sec,
            home_arms=arms,
        ))
        self._recording = self.create_client(ManageRecording, "/recording/manage")
        self._movej = {arm: ActionClient(self, ExecuteMotion, f"/{arm}/execute_motion") for arm in arms}
        self._pending_call = None  # (kind, future, deadline)
        # START calls that timed out: a late success means the recorder did start, so that session is stopped.
        self._orphan_start_futures: set = set()
        # arm -> (home episode, deadline); the episode token drops late results from an older homing.
        self._home_episode = 0
        self._home_deadlines: dict[str, tuple[int, float]] = {}
        self._state_pub = self.create_publisher(String, "/pika_episode/state", LATCHED)
        self._last_published: dict | None = None
        self._last_publish_time = 0.0

        self.create_subscription(Bool, episode_config.keyboard_topic, self._on_keyboard, 10)
        self.create_subscription(InputModeState, "/realman_bt_executor/input_mode_state", self._on_mode, LATCHED)
        self.create_subscription(RecordingStatus, "/recording/status", self._on_recording_status, 10)
        for arm in arms:
            self.create_subscription(
                CartesianVelocityState, f"/{arm}/cartesian_velocity/state",
                lambda msg, arm=arm: self._apply(self._machine.on_velocity_session(arm, msg.session_active, time.monotonic())),
                BEST_EFFORT,
            )
        self.create_timer(0.1, self._on_timer)
        self.get_logger().info(
            f"pika episode trigger ready: keyboard={episode_config.keyboard_topic} "
            f"mode={episode_config.required_mode} home_arms={','.join(arms)} task='{episode_config.task}'"
        )
        self._publish_state(force=True)

    def interfaces_ready(self) -> bool:
        """True once the recorder service and every home arm's MoveJ server are discovered."""
        return self._recording.service_is_ready() and all(c.server_is_ready() for c in self._movej.values())

    # ---- subscriptions ------------------------------------------------
    def _on_keyboard(self, message: Bool) -> None:
        self._apply(self._machine.on_keyboard(bool(message.data), time.monotonic()))

    def _on_mode(self, message: InputModeState) -> None:
        mode = message.active_mode if message.phase == InputModeState.ACTIVE else ""
        self._apply(self._machine.on_mode(mode, time.monotonic()))

    def _on_recording_status(self, message: RecordingStatus) -> None:
        recording = message.state in (RecordingStatus.COUNTDOWN, RecordingStatus.RECORDING)
        self._machine.on_recording_status(recording, message.session_id)

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
        for arm, (episode, deadline) in list(self._home_deadlines.items()):
            if now > deadline:
                self._finish_home(arm, episode, False, "no MoveJ result in time")
        self._apply(self._machine.tick(now))  # _apply always publishes (on change or once a second)

    # ---- actions ------------------------------------------------------
    def _apply(self, actions: list[Action]) -> None:
        for action in actions:
            if action.kind in ("start", "stop"):
                self._call_recording(action.kind)
            elif action.kind == "home":
                self._home_episode += 1
                self._home_deadlines.clear()  # older episodes' results are ignored anyway; no stale timeouts
                for arm in action.arms:
                    self._send_home(arm, self._home_episode)
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
        log = self.get_logger().info if response.success else self.get_logger().error
        log(f"orphan session {session_id} stop {'ok' if response.success else 'failed'}: {response.message}")

    def _service_result(self, kind: str, success: bool, session_id: str, message: str) -> None:
        now = time.monotonic()
        log = self.get_logger().info if success else self.get_logger().warning
        log(f"recording {kind} {'ok' if success else 'failed'}: session={session_id} {message}")
        if kind == "start":
            self._apply(self._machine.on_start_result(success, session_id, message, now))
        else:
            self._apply(self._machine.on_stop_result(success, message, now))

    def _send_home(self, arm: str, episode: int) -> None:
        client = self._movej[arm]
        now = time.monotonic()
        if not client.server_is_ready():
            self._apply(self._machine.on_home_result(arm, False, f"/{arm}/execute_motion is not available", now))
            return
        goal = ExecuteMotion.Goal()
        goal.command = ExecuteMotion.Goal.MOVEJ
        goal.reference_type = ExecuteMotion.Goal.BASE
        goal.reference_name = ""
        goal.joint_degrees = list(self._home_pose[arm])
        goal.velocity_percent = self._config.home_velocity_percent
        goal.blend_radius_percent = 0
        goal.connect = False
        goal.timeout_sec = float(self._config.home_timeout_sec)
        self.get_logger().info(f"homing /{arm} to pika_default_pose {list(self._home_pose[arm])}")
        self._home_deadlines[arm] = (episode, now + self._config.home_timeout_sec + RESULT_MARGIN_SEC)
        client.send_goal_async(goal).add_done_callback(
            lambda done, arm=arm, episode=episode: self._on_goal_response(arm, episode, done))

    def _on_goal_response(self, arm: str, episode: int, future) -> None:
        goal_handle = future.result() if future.exception() is None else None
        if goal_handle is None or not goal_handle.accepted:
            self._finish_home(arm, episode, False, "MoveJ goal rejected")
            return
        goal_handle.get_result_async().add_done_callback(
            lambda done, arm=arm, episode=episode: self._on_home_done(arm, episode, done))

    def _on_home_done(self, arm: str, episode: int, future) -> None:
        if future.exception() is not None:
            self._finish_home(arm, episode, False, f"MoveJ result failed: {future.exception()}")
            return
        result = future.result().result
        self._finish_home(arm, episode, result.success, result.message)

    def _finish_home(self, arm: str, episode: int, success: bool, message: str) -> None:
        if self._home_deadlines.get(arm, (None,))[0] != episode:
            return  # timed out already, or a late result from an older homing
        del self._home_deadlines[arm]
        log = self.get_logger().info if success else self.get_logger().error
        log(f"homing /{arm} {'done' if success else 'failed'}: {message}")
        self._apply(self._machine.on_home_result(arm, success, message, time.monotonic()))

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
