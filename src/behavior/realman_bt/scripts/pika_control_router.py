#!/usr/bin/env python3
"""Route Pika's l/r Cartesian streams through the behavior-tree selection."""

from __future__ import annotations

from dataclasses import dataclass
import math
import time
from typing import Any

import rclpy
from geometry_msgs.msg import PoseStamped, TwistStamped
from rclpy.action import ActionClient
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.parameter import Parameter
from rclpy.qos import QoSDurabilityPolicy, QoSProfile
from realman_msgs.action import CartesianPose, CartesianVelocity
from realman_msgs.msg import InputModeState
from std_msgs.msg import Float32


GRIPPER_COMMAND_TOPICS = {
    "l": "/gripper_left/percentage/command",
    "r": "/gripper_right/percentage/command",
}


@dataclass
class _ArmProfile:
    reference_name: str
    frame_id: str
    control_period_ms: int
    watchdog_ms: int
    max_linear_speed_mps: float
    max_angular_speed_radps: float
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float


@dataclass
class _ArmState:
    pose_client: ActionClient
    velocity_client: ActionClient
    pose_publisher: Any
    velocity_publisher: Any
    gripper_publisher: Any
    profile: _ArmProfile
    goal_handle: Any = None
    pending_goal: Any = None
    active_kind: str = ""
    cancel_pending: Any = None
    last_input_at: float = 0.0
    latest_velocity: TwistStamped | None = None
    latest_pose: PoseStamped | None = None
    # Sessions opened since the current Pika mode was activated; one is the
    # healthy steady state, and each restart re-initialises the controller.
    sessions_started: int = 0
    # No new session request before this monotonic time (driver rejected or
    # ended the previous one); prevents retrying at the 10 ms reconcile rate.
    retry_after: float = 0.0


# Pause before re-requesting a session the driver rejected or ended on its own.
_RESTART_BACKOFF_SEC = 0.5


def _positive_float(value: Any, field: str) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be numeric") from error
    if not math.isfinite(parsed) or parsed <= 0.0:
        raise ValueError(f"{field} must be positive and finite")
    return parsed


def clamp_angular_velocity(
    source: TwistStamped, max_angular_speed_radps: float
) -> tuple[TwistStamped, bool]:
    """Norm-clamp angular velocity while preserving direction and metadata."""
    limit = _positive_float(max_angular_speed_radps, "max_angular_speed_radps")
    angular = (
        source.twist.angular.x,
        source.twist.angular.y,
        source.twist.angular.z,
    )
    norm = math.hypot(*angular)
    if norm <= limit:
        return source, False
    scale = limit / norm
    limited = TwistStamped()
    limited.header.frame_id = source.header.frame_id
    limited.header.stamp.sec = source.header.stamp.sec
    limited.header.stamp.nanosec = source.header.stamp.nanosec
    limited.twist.linear.x = source.twist.linear.x
    limited.twist.linear.y = source.twist.linear.y
    limited.twist.linear.z = source.twist.linear.z
    limited.twist.angular.x = angular[0] * scale
    limited.twist.angular.y = angular[1] * scale
    limited.twist.angular.z = angular[2] * scale
    return limited, True


def clamp_linear_velocity(
    source: TwistStamped, max_linear_speed_mps: float
) -> tuple[TwistStamped, bool]:
    """Norm-clamp linear velocity while preserving direction and metadata."""
    limit = _positive_float(max_linear_speed_mps, "max_linear_speed_mps")
    linear = (
        source.twist.linear.x,
        source.twist.linear.y,
        source.twist.linear.z,
    )
    norm = math.hypot(*linear)
    if norm <= limit:
        return source, False
    scale = limit / norm
    limited = TwistStamped()
    limited.header.frame_id = source.header.frame_id
    limited.header.stamp.sec = source.header.stamp.sec
    limited.header.stamp.nanosec = source.header.stamp.nanosec
    limited.twist.linear.x = linear[0] * scale
    limited.twist.linear.y = linear[1] * scale
    limited.twist.linear.z = linear[2] * scale
    limited.twist.angular.x = source.twist.angular.x
    limited.twist.angular.y = source.twist.angular.y
    limited.twist.angular.z = source.twist.angular.z
    return limited, True


def parse_arm_profiles(
    coordinate_references: list[str],
    velocity_profiles: list[str],
    work_reference: str,
    max_linear_speed_mps: float,
    max_angular_speed_radps: float,
    max_angular_accel_radps2: float,
) -> dict[str, _ArmProfile]:
    references: dict[str, tuple[str, str]] = {}
    for entry in coordinate_references:
        parts = entry.split("|")
        if len(parts) != 5:
            raise ValueError("coordinate reference is malformed")
        arm, logical_name, reference_type, controller_name, frame_id = parts
        if arm in {"l", "r"} and logical_name == work_reference:
            if arm in references or reference_type != "1" or not controller_name or not frame_id:
                raise ValueError(f"{arm} configured Pika WORK reference is invalid or duplicated")
            references[arm] = (controller_name, frame_id)

    motion: dict[str, tuple[int, int, float, float]] = {}
    for entry in velocity_profiles:
        parts = entry.split("|")
        if len(parts) != 9:
            raise ValueError("Cartesian velocity profile is malformed")
        arm = parts[0]
        if arm not in {"l", "r"}:
            continue
        if arm in motion:
            raise ValueError(f"duplicate Cartesian velocity profile for {arm}")
        try:
            period = int(parts[1])
            watchdog = int(parts[2])
        except ValueError as error:
            raise ValueError(f"{arm} period/watchdog must be integers") from error
        if period <= 0 or watchdog <= 0:
            raise ValueError(f"{arm} period/watchdog must be positive")
        motion[arm] = (
            period,
            watchdog,
            _positive_float(parts[5], f"{arm}.max_linear_accel_mps2"),
            _positive_float(parts[6], f"{arm}.max_angular_accel_radps2"),
        )

    if set(references) != {"l", "r"} or set(motion) != {"l", "r"}:
        raise ValueError("l and r configured Pika WORK references and velocity profiles are required")
    linear_limit = _positive_float(max_linear_speed_mps, "max_linear_speed_mps")
    angular_limit = _positive_float(max_angular_speed_radps, "max_angular_speed_radps")
    angular_accel_limit = _positive_float(
        max_angular_accel_radps2, "max_angular_accel_radps2"
    )
    return {
        arm: _ArmProfile(
            references[arm][0],
            references[arm][1],
            motion[arm][0],
            motion[arm][1],
            linear_limit,
            angular_limit,
            motion[arm][2],
            angular_accel_limit,
        )
        for arm in ("l", "r")
    }


class PikaControlRouter(Node):
    """Bridge selected Pika topics to driver sessions without touching m."""

    def __init__(self) -> None:
        super().__init__("pika_control_router")
        self.control_period_ms = int(self.declare_parameter("control_period_ms", 20).value)
        self.watchdog_ms = int(self.declare_parameter("watchdog_ms", 250).value)
        self.dry_run = bool(self.declare_parameter("dry_run", True).value)
        self.max_linear_speed_mps = float(self.declare_parameter("max_linear_speed_mps", 0.15).value)
        self.max_angular_speed_radps = float(self.declare_parameter("max_angular_speed_radps", 0.25).value)
        self.max_linear_accel_mps2 = float(self.declare_parameter("max_linear_accel_mps2", 0.10).value)
        self.max_angular_accel_radps2 = float(self.declare_parameter("max_angular_accel_radps2", 0.50).value)
        # Velocity input older than stale_ms is no longer replayed: the arm is
        # commanded to zero instead, so a paused Pika stream stops the arm
        # within ~stale_ms rather than repeating the last velocity for seconds.
        # Only input older than input_timeout_ms releases the session.
        self.stale_ms = int(
            self.declare_parameter("pika_velocity_stale_ms", 200).value
        )
        self.input_timeout_ms = int(
            self.declare_parameter("pika_velocity_input_timeout_ms", 250).value
        )
        if self.stale_ms <= 0 or self.input_timeout_ms <= self.stale_ms:
            raise ValueError(
                "pika_velocity_stale_ms must be positive and below "
                "pika_velocity_input_timeout_ms"
            )
        profiles = parse_arm_profiles(
            list(self.declare_parameter("coordinate_references", Parameter.Type.STRING_ARRAY).value),
            list(self.declare_parameter("cartesian_velocity_profiles", Parameter.Type.STRING_ARRAY).value),
            self.declare_parameter("pika_velocity_work_reference", "work/pikabase").value,
            self.declare_parameter("pika_velocity_max_linear_speed_mps", 1.0).value,
            self.declare_parameter("pika_velocity_max_angular_speed_radps", 0.25).value,
            self.declare_parameter(
                "pika_velocity_max_angular_accel_radps2", 4.0
            ).value,
        )
        self.mode = ""
        self._arms: dict[str, _ArmState] = {}
        self._last_unavailable_log: dict[tuple[str, str], float] = {}
        state_qos = QoSProfile(depth=1, durability=QoSDurabilityPolicy.TRANSIENT_LOCAL)
        self.create_subscription(InputModeState, "/realman_bt_executor/input_mode_state", self._mode_state, state_qos)
        for arm in ("l", "r"):
            pose_client = ActionClient(self, CartesianPose, f"/{arm}/cartesian_pose")
            velocity_client = ActionClient(self, CartesianVelocity, f"/{arm}/cartesian_velocity")
            pose_publisher = self.create_publisher(PoseStamped, f"/{arm}/cartesian_pose/command", 1)
            velocity_publisher = self.create_publisher(TwistStamped, f"/{arm}/cartesian_velocity/command", 1)
            gripper_publisher = self.create_publisher(Float32, GRIPPER_COMMAND_TOPICS[arm], 10)
            self._arms[arm] = _ArmState(
                pose_client,
                velocity_client,
                pose_publisher,
                velocity_publisher,
                gripper_publisher,
                profiles[arm],
            )
            self.create_subscription(PoseStamped, f"/pika/{arm}/cartesian_pose", lambda message, arm=arm: self._pose(arm, message), 1)
            self.create_subscription(TwistStamped, f"/pika/{arm}/cartesian_velocity", lambda message, arm=arm: self._velocity(arm, message), 1)
            self.create_subscription(
                Float32,
                f"/pika/{arm}/gripper_percentage",
                lambda message, arm=arm: self._gripper(arm, message),
                10,
            )
        period_ms = min(profile.control_period_ms for profile in profiles.values())
        self.create_timer(period_ms / 1000.0, self._reconcile)
        self.get_logger().info("Pika Cartesian router ready for l/r; middle arm is excluded")

    def _mode_state(self, message: InputModeState) -> None:
        active = str(message.active_mode) if int(message.phase) == InputModeState.ACTIVE else ""
        if active not in {"pikaposition", "pikavelocity"}:
            active = ""
        if active != self.mode:
            self.get_logger().info(f"Pika router mode changed: {self.mode or 'none'} -> {active or 'none'}")
            self.mode = active
            for state in self._arms.values():
                if not active:
                    self._cancel(state)
                state.sessions_started = 0
                state.retry_after = 0.0

    @staticmethod
    def _age(state: _ArmState, now: float) -> float:
        if state.last_input_at <= 0.0:
            return math.inf
        return now - state.last_input_at

    def _reconcile(self) -> None:
        if self.dry_run or not self.mode:
            return
        now = time.monotonic()
        for arm, state in self._arms.items():
            if self.mode == "pikavelocity":
                self._reconcile_velocity(arm, state, now)
            else:
                self._reconcile_position(arm, state, now)

    def _can_request(self, state: _ArmState, now: float) -> bool:
        """Clear the way for a new session request, if one is allowed now."""
        if state.pending_goal is not None or state.cancel_pending is not None:
            return False
        if state.goal_handle is not None:
            # A session of the other kind is still open; release it first.
            self._cancel(state)
            return False
        return now >= state.retry_after

    def _reconcile_velocity(self, arm: str, state: _ArmState, now: float) -> None:
        """Hold one velocity session while the Pika stream is alive.

        Fresh input (younger than stale_ms) is replayed at the control period
        so DDS jitter above the driver's 100 ms watchdog never ends the
        session. Older input commands zero but keeps the session; only input
        older than input_timeout_ms releases it.
        """
        age = self._age(state, now)
        if state.active_kind == "velocity" and state.goal_handle is not None:
            if age < self.stale_ms / 1000.0 and state.latest_velocity is not None:
                self._publish_velocity(state, state.latest_velocity)
            elif age < self.input_timeout_ms / 1000.0:
                self._publish_velocity(state, TwistStamped())
            else:
                self._publish_velocity(state, TwistStamped())
                state.latest_velocity = None
                self._cancel(state)
            return
        if age >= self.stale_ms / 1000.0 or state.latest_velocity is None:
            # Never open a session to replay a velocity that is already stale.
            return
        if not self._can_request(state, now):
            return
        if not state.velocity_client.server_is_ready():
            state.velocity_client.wait_for_server(timeout_sec=0.0)
            return
        state.pending_goal = state.velocity_client.send_goal_async(
            self._velocity_goal(state.profile)
        )
        state.pending_goal.add_done_callback(
            lambda future, selected=arm: self._goal_response(
                selected, "velocity", future
            )
        )

    def _reconcile_position(self, arm: str, state: _ArmState, now: float) -> None:
        """Hold one pose session while the Pika stream is alive.

        The latest target is re-sent at the control period, so a Pika gap
        longer than the driver's 100 ms pose watchdog holds the arm at its
        last target instead of ending (and later re-opening) the session.
        """
        age = self._age(state, now)
        lost = age >= self.watchdog_ms / 1000.0
        if state.active_kind == "position" and state.goal_handle is not None:
            if lost or state.latest_pose is None:
                self._cancel(state)
            else:
                self._publish_pose(arm, state, state.latest_pose)
            return
        if lost or state.latest_pose is None:
            return
        if not self._can_request(state, now):
            return
        if not state.pose_client.server_is_ready():
            state.pose_client.wait_for_server(timeout_sec=0.0)
            return
        state.pending_goal = state.pose_client.send_goal_async(self._pose_goal(state.profile))
        state.pending_goal.add_done_callback(
            lambda future, selected=arm: self._goal_response(selected, "position", future)
        )

    def _goal_response(self, arm: str, kind: str, future: Any) -> None:
        state = self._arms[arm]
        state.pending_goal = None
        try:
            handle = future.result()
        except Exception as error:
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().error(f"Pika {kind} goal failed for {arm}: {error}")
            return
        expected_mode = "pikaposition" if kind == "position" else "pikavelocity"
        if not handle.accepted or self.mode != expected_mode:
            if not handle.accepted:
                state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
                self.get_logger().warning(
                    f"Pika {kind} session for {arm} was rejected by the driver; "
                    f"retrying in {_RESTART_BACKOFF_SEC:.1f} s"
                )
            if handle.accepted:
                state.cancel_pending = handle.cancel_goal_async()
                state.cancel_pending.add_done_callback(lambda _future, arm=arm: self._clear_cancel(arm))
            return
        state.goal_handle = handle
        state.active_kind = kind

        result_future = handle.get_result_async()
        result_future.add_done_callback(
            lambda completed, arm=arm, kind=kind: self._goal_finished(arm, kind, completed)
        )
        if kind == "velocity" and state.latest_velocity is not None:
            self._publish_velocity(state, state.latest_velocity)
        if kind == "position" and state.latest_pose is not None:
            self._publish_pose(arm, state, state.latest_pose)
        state.sessions_started += 1
        if state.sessions_started == 1:
            self.get_logger().info(f"Pika {kind} session active for {arm}")
        else:
            self.get_logger().warning(
                f"Pika {kind} session active for {arm} "
                f"(restart #{state.sessions_started - 1} in this Pika activation)"
            )

    def _goal_finished(self, arm: str, kind: str, future: Any) -> None:
        state = self._arms[arm]
        state.goal_handle = None
        state.active_kind = ""
        state.cancel_pending = None
        try:
            response = future.result()
            result = response.result
            if not result.success:
                self.get_logger().warning(
                    f"Pika {kind} session ended for {arm}: {result.message}"
                )
            # 1 is CANCELED in both CartesianPose and CartesianVelocity results.
            if int(getattr(result, "terminal_state", 1)) != 1:
                state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
        except Exception as error:
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().error(
                f"Pika {kind} result failed for {arm}: {error}"
            )

    def _cancel(self, state: _ArmState) -> None:
        if state.goal_handle is None:
            state.active_kind = ""
            return
        if state.cancel_pending is None:
            state.cancel_pending = state.goal_handle.cancel_goal_async()
            state.cancel_pending.add_done_callback(lambda _future, state=state: self._clear_state_cancel(state))

    @staticmethod
    def _clear_state_cancel(state: _ArmState) -> None:
        state.goal_handle = None
        state.active_kind = ""
        state.cancel_pending = None

    def _clear_cancel(self, arm: str) -> None:
        self._clear_state_cancel(self._arms[arm])

    def _pose(self, arm: str, message: PoseStamped) -> None:
        if self.mode != "pikaposition":
            return
        state = self._arms[arm]
        state.last_input_at = time.monotonic()
        state.latest_pose = message
        if not self.dry_run and state.active_kind == "position" and state.goal_handle is not None:
            # Forward immediately for latency; _reconcile_position keeps
            # re-sending it between Pika messages.
            self._publish_pose(arm, state, message)
        else:
            self._reconcile()

    def _publish_pose(self, arm: str, state: _ArmState, target: PoseStamped) -> None:
        if self.dry_run or state.goal_handle is None:
            return
        outgoing = PoseStamped()
        # Always the router's clock: the driver requires strictly increasing
        # stamps, and re-sent targets interleave with forwarded Pika ones.
        outgoing.header.stamp = self.get_clock().now().to_msg()
        # The pose session uses BASE reference and validates the active base
        # frame id, so re-stamp the identity WORK ingress label.
        outgoing.header.frame_id = f"{arm}/base_link"
        outgoing.pose = target.pose
        state.pose_publisher.publish(outgoing)

    def _velocity(self, arm: str, message: TwistStamped) -> None:
        if self.mode != "pikavelocity":
            return
        state = self._arms[arm]
        profile = state.profile
        linear = (message.twist.linear.x, message.twist.linear.y, message.twist.linear.z)
        angular = (message.twist.angular.x, message.twist.angular.y, message.twist.angular.z)
        if message.header.frame_id != profile.frame_id:
            self.get_logger().warning(
                f"Ignoring Pika velocity for {arm}: frame_id must be {profile.frame_id!r}"
            )
            return
        if not all(math.isfinite(value) for value in (*linear, *angular)):
            self.get_logger().warning(f"Ignoring Pika velocity for {arm}: components must be finite")
            return
        limited_message, linear_clamped = clamp_linear_velocity(
            message, profile.max_linear_speed_mps
        )
        if linear_clamped:
            now = time.monotonic()
            log_key = (arm, "linear_clamp")
            if now - self._last_unavailable_log.get(log_key, 0.0) >= 1.0:
                self._last_unavailable_log[log_key] = now
                self.get_logger().warning(
                    f"Clamping Pika velocity for {arm}: linear speed exceeds Pika session limit"
                )
        limited_message, angular_clamped = clamp_angular_velocity(
            limited_message, profile.max_angular_speed_radps
        )
        if angular_clamped:
            now = time.monotonic()
            log_key = (arm, "angular_clamp")
            if now - self._last_unavailable_log.get(log_key, 0.0) >= 1.0:
                self._last_unavailable_log[log_key] = now
                self.get_logger().warning(
                    f"Clamping Pika velocity for {arm}: angular speed exceeds "
                    "Pika session limit"
                )
        state.last_input_at = time.monotonic()
        state.latest_velocity = limited_message
        if not self.dry_run and state.goal_handle is None:
            self._reconcile()

    def _publish_velocity(self, state: _ArmState, command: TwistStamped) -> None:
        if self.dry_run or state.goal_handle is None:
            return
        outgoing = TwistStamped()
        outgoing.header.stamp = self.get_clock().now().to_msg()
        outgoing.header.frame_id = state.profile.frame_id
        outgoing.twist = command.twist
        state.velocity_publisher.publish(outgoing)

    def _gripper(self, arm: str, message: Float32) -> None:
        if self.mode not in {"pikaposition", "pikavelocity"} or self.dry_run:
            return
        value = float(message.data)
        if not math.isfinite(value) or not 0.0 <= value <= 1.0:
            self.get_logger().warning(
                f"Ignoring invalid Pika gripper percentage for {arm}: {value!r}"
            )
            return
        self._arms[arm].gripper_publisher.publish(Float32(data=value))

    def _pose_goal(self, profile: _ArmProfile) -> CartesianPose.Goal:
        goal = CartesianPose.Goal()
        goal.reference_type = CartesianPose.Goal.BASE
        goal.reference_name = "base"
        goal.control_period_ms = self.control_period_ms
        # The driver's own command watchdog (<= velocity_watchdog_ms). The
        # router's watchdog_ms is the Pika input loss window, which is far
        # longer and which the driver rejects as a goal watchdog.
        goal.watchdog_ms = profile.watchdog_ms
        goal.max_linear_speed_mps = self.max_linear_speed_mps
        goal.max_angular_speed_radps = self.max_angular_speed_radps
        goal.max_linear_accel_mps2 = self.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = self.max_angular_accel_radps2
        goal.follow = False
        goal.trajectory_mode = 0
        goal.radio = 0
        # MoveJ (official IK) streaming: moderate speed and full blend radius so
        # successive joint targets fuse into a smooth continuous motion.
        goal.velocity_percent = 50
        goal.blend_radius_percent = 100
        return goal

    @staticmethod
    def _velocity_goal(profile: _ArmProfile) -> CartesianVelocity.Goal:
        goal = CartesianVelocity.Goal()
        goal.reference_type = CartesianVelocity.Goal.WORK
        goal.reference_name = profile.reference_name
        goal.control_period_ms = profile.control_period_ms
        goal.watchdog_ms = profile.watchdog_ms
        goal.max_linear_speed_mps = profile.max_linear_speed_mps
        goal.max_angular_speed_radps = profile.max_angular_speed_radps
        goal.max_linear_accel_mps2 = profile.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = profile.max_angular_accel_radps2
        goal.follow = False
        goal.trajectory_mode = 0
        goal.radio = 0
        return goal


def main(args: Any = None) -> None:
    rclpy.init(args=args)
    node = PikaControlRouter()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        node.get_logger().info("Pika router shutdown requested")
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
