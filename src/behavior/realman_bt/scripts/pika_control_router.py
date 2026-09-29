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
from realman_msgs.srv import GetCurrentPose
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
    # Per-stream arrival times. Mixed mode reads both streams and judges each
    # one's freshness separately; last_input_at stays the newest of the two.
    velocity_input_at: float = 0.0
    pose_input_at: float = 0.0
    # Mixed mode: the integrated target, the pose it was anchored at, and the
    # most recent measured TCP position used to leash the target.
    current_pose_client: Any = None
    mixed: "MixedTarget | None" = None
    anchor_future: Any = None
    measure_future: Any = None
    measured_position: tuple[float, float, float] | None = None
    measured_at: float = 0.0
    next_measure_at: float = 0.0
    last_mixed_step_at: float = 0.0
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


MODES = ("pikaposition", "pikavelocity", "pikamixed")
_KIND_OF_MODE = {"pikaposition": "position", "pikavelocity": "velocity", "pikamixed": "mixed"}
_MODE_OF_KIND = {kind: mode for mode, kind in _KIND_OF_MODE.items()}
# A leash measurement older than this is not trusted: the target stops
# advancing until the arm's position is known again.
_MEASUREMENT_MAX_AGE_SEC = 1.0


def normalize_quaternion(quaternion: Any) -> tuple[float, float, float, float]:
    """Return a unit wxyz quaternion, rejecting non-finite or zero input."""
    values = tuple(float(value) for value in quaternion)
    if len(values) != 4 or not all(math.isfinite(value) for value in values):
        raise ValueError("quaternion must have four finite components")
    norm = math.sqrt(sum(value * value for value in values))
    if norm < 1.0e-9:
        raise ValueError("quaternion must be non-zero")
    return tuple(value / norm for value in values)


def rotate_towards(
    current: Any, target: Any, max_angle_rad: float
) -> tuple[float, float, float, float]:
    """Slerp from ``current`` toward ``target`` by at most ``max_angle_rad``.

    Takes the shorter of the two equivalent quaternion paths, so a target that
    differs only by sign never produces a full turn.
    """
    q0 = normalize_quaternion(current)
    q1 = normalize_quaternion(target)
    dot = sum(a * b for a, b in zip(q0, q1))
    if dot < 0.0:
        q1 = tuple(-value for value in q1)
        dot = -dot
    dot = min(1.0, dot)
    half_angle = math.acos(dot)
    angle = 2.0 * half_angle
    if angle <= max(0.0, max_angle_rad) or half_angle < 1.0e-9:
        return q1
    fraction = max(0.0, max_angle_rad) / angle
    sin_half = math.sin(half_angle)
    a = math.sin((1.0 - fraction) * half_angle) / sin_half
    b = math.sin(fraction * half_angle) / sin_half
    return normalize_quaternion(tuple(a * x + b * y for x, y in zip(q0, q1)))


def _norm3(vector: Any) -> float:
    return math.sqrt(sum(float(value) ** 2 for value in vector))


class MixedTarget:
    """Absolute pose target for Pika mixed mode.

    Position is the integral of the Pika linear velocity, speed-clamped and
    acceleration-limited, and leashed to the measured TCP so a target the arm
    cannot follow (IK failure, singularity) never runs away and then snaps.
    Orientation is the Pika absolute quaternion, approached at a bounded
    angular rate so an offset at session start becomes a smooth rotation.
    """

    def __init__(
        self,
        position: Any,
        orientation_wxyz: Any,
    ) -> None:
        values = tuple(float(value) for value in position)
        if len(values) != 3 or not all(math.isfinite(value) for value in values):
            raise ValueError("position must have three finite components")
        self.position: tuple[float, float, float] = values
        self.orientation: tuple[float, float, float, float] = normalize_quaternion(
            orientation_wxyz
        )
        self.velocity: tuple[float, float, float] = (0.0, 0.0, 0.0)

    def step(
        self,
        *,
        dt: float,
        commanded_velocity: Any,
        goal_orientation: Any | None,
        max_speed: float,
        max_accel: float,
        max_angular_speed: float,
        measured_position: Any | None,
        max_lead: float,
    ) -> None:
        if dt <= 0.0:
            return
        command = tuple(float(value) for value in commanded_velocity)
        speed = _norm3(command)
        if speed > max_speed > 0.0:
            command = tuple(value * max_speed / speed for value in command)
        delta = tuple(c - v for c, v in zip(command, self.velocity))
        delta_norm = _norm3(delta)
        max_delta = max_accel * dt
        if delta_norm > max_delta > 0.0:
            delta = tuple(value * max_delta / delta_norm for value in delta)
        self.velocity = tuple(v + d for v, d in zip(self.velocity, delta))

        if measured_position is None:
            # Without a recent measurement the leash cannot be enforced, so
            # the target holds and any motion restarts from rest.
            self.velocity = (0.0, 0.0, 0.0)
        else:
            candidate = tuple(p + v * dt for p, v in zip(self.position, self.velocity))
            measured = tuple(float(value) for value in measured_position)
            lead = tuple(c - m for c, m in zip(candidate, measured))
            lead_norm = _norm3(lead)
            if lead_norm > max_lead > 0.0:
                candidate = tuple(
                    m + value * max_lead / lead_norm for m, value in zip(measured, lead)
                )
            self.position = candidate

        if goal_orientation is not None:
            self.orientation = rotate_towards(
                self.orientation, goal_orientation, max_angular_speed * dt
            )


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
        # Mixed mode: XYZ integrated from Pika linear velocity, orientation
        # from the Pika absolute quaternion, executed as one pose session.
        self.mixed_stale_ms = int(self.declare_parameter("pika_mixed_stale_ms", 200).value)
        self.mixed_input_timeout_ms = int(
            self.declare_parameter("pika_mixed_input_timeout_ms", 3000).value
        )
        self.mixed_max_linear_speed_mps = float(
            self.declare_parameter("pika_mixed_max_linear_speed_mps", 0.15).value
        )
        self.mixed_max_linear_accel_mps2 = float(
            self.declare_parameter("pika_mixed_max_linear_accel_mps2", 0.10).value
        )
        self.mixed_max_angular_speed_radps = float(
            self.declare_parameter("pika_mixed_max_angular_speed_radps", 0.25).value
        )
        self.mixed_max_position_lead_m = float(
            self.declare_parameter("pika_mixed_max_position_lead_m", 0.05).value
        )
        self.mixed_pose_poll_hz = float(
            self.declare_parameter("pika_mixed_pose_poll_hz", 10.0).value
        )
        self._validate_mixed_parameters()
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
                current_pose_client=self.create_client(
                    GetCurrentPose, f"/{arm}/get_current_pose"
                ),
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

    def _validate_mixed_parameters(self) -> None:
        if self.mixed_stale_ms <= 0 or self.mixed_input_timeout_ms <= self.mixed_stale_ms:
            raise ValueError(
                "pika_mixed_stale_ms must be positive and below pika_mixed_input_timeout_ms"
            )
        for name in (
            "mixed_max_linear_speed_mps",
            "mixed_max_linear_accel_mps2",
            "mixed_max_angular_speed_radps",
            "mixed_max_position_lead_m",
            "mixed_pose_poll_hz",
        ):
            value = getattr(self, name)
            if not math.isfinite(value) or value <= 0.0:
                raise ValueError(f"pika_{name} must be positive and finite")
        # The pose goal carries the router-wide ceilings, which the driver
        # validates against realman_motion.yaml; mixed shaping must stay inside.
        if self.mixed_max_linear_speed_mps > self.max_linear_speed_mps:
            raise ValueError("pika_mixed_max_linear_speed_mps exceeds max_linear_speed_mps")
        if self.mixed_max_angular_speed_radps > self.max_angular_speed_radps:
            raise ValueError("pika_mixed_max_angular_speed_radps exceeds max_angular_speed_radps")

    def _mode_state(self, message: InputModeState) -> None:
        active = str(message.active_mode) if int(message.phase) == InputModeState.ACTIVE else ""
        if active not in MODES:
            active = ""
        if active != self.mode:
            self.get_logger().info(f"Pika router mode changed: {self.mode or 'none'} -> {active or 'none'}")
            self.mode = active
            for state in self._arms.values():
                if not active:
                    self._cancel(state)
                state.sessions_started = 0
                state.retry_after = 0.0
                self._reset_mixed(state)

    @staticmethod
    def _reset_mixed(state: _ArmState) -> None:
        state.mixed = None
        state.anchor_future = None
        state.measure_future = None
        state.measured_position = None
        state.measured_at = 0.0
        state.next_measure_at = 0.0
        state.last_mixed_step_at = 0.0

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
            elif self.mode == "pikamixed":
                self._reconcile_mixed(arm, state, now)
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

    @staticmethod
    def _age_of(stamp: float, now: float) -> float:
        return math.inf if stamp <= 0.0 else now - stamp

    def _reconcile_mixed(self, arm: str, state: _ArmState, now: float) -> None:
        """One pose session: XYZ from Pika velocity, orientation from Pika pose.

        Velocity older than stale_ms is treated as zero (the target holds) and
        a stale orientation is held; the session is released only when both
        streams are older than input_timeout_ms.
        """
        stale = self.mixed_stale_ms / 1000.0
        velocity_age = self._age_of(state.velocity_input_at, now)
        pose_age = self._age_of(state.pose_input_at, now)
        lost = min(velocity_age, pose_age) >= self.mixed_input_timeout_ms / 1000.0
        if state.active_kind == "mixed" and state.goal_handle is not None:
            if lost or state.mixed is None:
                self._cancel(state)
                self._reset_mixed(state)
                return
            self._poll_measured_pose(arm, state, now)
            dt = now - state.last_mixed_step_at if state.last_mixed_step_at > 0.0 else 0.0
            state.last_mixed_step_at = now
            velocity = (0.0, 0.0, 0.0)
            if velocity_age < stale and state.latest_velocity is not None:
                linear = state.latest_velocity.twist.linear
                velocity = (linear.x, linear.y, linear.z)
            goal_orientation = None
            if pose_age < stale and state.latest_pose is not None:
                orientation = state.latest_pose.pose.orientation
                goal_orientation = (orientation.w, orientation.x, orientation.y, orientation.z)
            measured = (
                state.measured_position
                if state.measured_position is not None
                and now - state.measured_at <= _MEASUREMENT_MAX_AGE_SEC
                else None
            )
            state.mixed.step(
                dt=min(max(dt, 0.0), 0.1),
                commanded_velocity=velocity,
                goal_orientation=goal_orientation,
                max_speed=self.mixed_max_linear_speed_mps,
                max_accel=self.mixed_max_linear_accel_mps2,
                max_angular_speed=self.mixed_max_angular_speed_radps,
                measured_position=measured,
                max_lead=self.mixed_max_position_lead_m,
            )
            self._publish_mixed_target(arm, state)
            return
        if lost:
            return
        if not self._can_request(state, now):
            return
        if state.mixed is None:
            # Anchor the integrated position at the arm's current TCP, so the
            # session starts exactly where the arm is.
            self._request_anchor(arm, state)
            return
        if not state.pose_client.server_is_ready():
            state.pose_client.wait_for_server(timeout_sec=0.0)
            return
        state.pending_goal = state.pose_client.send_goal_async(self._pose_goal(state.profile))
        state.pending_goal.add_done_callback(
            lambda future, selected=arm: self._goal_response(selected, "mixed", future)
        )

    def _current_pose_request(self) -> Any:
        request = GetCurrentPose.Request()
        request.reference_type = GetCurrentPose.Request.BASE
        request.reference_name = "base"
        return request

    def _request_anchor(self, arm: str, state: _ArmState) -> None:
        client = state.current_pose_client
        if client is None or state.anchor_future is not None:
            return
        if not client.service_is_ready():
            client.wait_for_service(timeout_sec=0.0)
            return
        state.anchor_future = client.call_async(self._current_pose_request())
        state.anchor_future.add_done_callback(
            lambda future, selected=arm: self._on_anchor(selected, future)
        )

    @staticmethod
    def _pose_from_response(response: Any) -> tuple[tuple[float, ...], tuple[float, ...]] | None:
        if response is None or not bool(getattr(response, "success", False)):
            return None
        try:
            position = tuple(float(value) for value in response.pose_position_m)
            orientation = normalize_quaternion(response.pose_quaternion_wxyz)
        except (TypeError, ValueError):
            return None
        if len(position) != 3 or not all(math.isfinite(value) for value in position):
            return None
        return position, orientation

    def _on_anchor(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        if future is None or state.anchor_future is not future:
            # The mode changed while the request was in flight; a pose read for
            # an earlier activation must not seed this one.
            return
        state.anchor_future = None
        try:
            pose = self._pose_from_response(future.result())
        except Exception as error:
            pose = None
            self.get_logger().error(f"Pika mixed anchor pose failed for {arm}: {error}")
        if pose is None:
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().warning(
                f"Pika mixed mode could not read the current pose of {arm}; "
                f"retrying in {_RESTART_BACKOFF_SEC:.1f} s"
            )
            return
        position, orientation = pose
        state.mixed = MixedTarget(position, orientation)
        state.measured_position = position
        state.measured_at = time.monotonic()

    def _poll_measured_pose(self, arm: str, state: _ArmState, now: float) -> None:
        client = state.current_pose_client
        if client is None or state.measure_future is not None or now < state.next_measure_at:
            return
        state.next_measure_at = now + 1.0 / self.mixed_pose_poll_hz
        if not client.service_is_ready():
            return
        state.measure_future = client.call_async(self._current_pose_request())
        state.measure_future.add_done_callback(
            lambda future, selected=arm: self._on_measured_pose(selected, future)
        )

    def _on_measured_pose(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        if future is None or state.measure_future is not future:
            return
        state.measure_future = None
        try:
            pose = self._pose_from_response(future.result())
        except Exception:
            pose = None
        if pose is not None:
            state.measured_position = pose[0]
            state.measured_at = time.monotonic()

    def _publish_mixed_target(self, arm: str, state: _ArmState) -> None:
        if state.mixed is None:
            return
        target = PoseStamped()
        (target.pose.position.x, target.pose.position.y, target.pose.position.z) = state.mixed.position
        w, x, y, z = state.mixed.orientation
        target.pose.orientation.w = w
        target.pose.orientation.x = x
        target.pose.orientation.y = y
        target.pose.orientation.z = z
        self._publish_pose(arm, state, target)

    def _goal_response(self, arm: str, kind: str, future: Any) -> None:
        state = self._arms[arm]
        state.pending_goal = None
        try:
            handle = future.result()
        except Exception as error:
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().error(f"Pika {kind} goal failed for {arm}: {error}")
            return
        expected_mode = _MODE_OF_KIND[kind]
        if not handle.accepted or self.mode != expected_mode:
            if kind == "mixed":
                # Re-anchor next time: the arm may move before the retry.
                self._reset_mixed(state)
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
        if kind == "mixed":
            # The first target is the anchor itself, so the session starts at
            # rest exactly where the arm is.
            state.last_mixed_step_at = time.monotonic()
            self._publish_mixed_target(arm, state)
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
        if kind == "mixed":
            self._reset_mixed(state)
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
        if self.mode != "pikaposition" and self.mode != "pikamixed":
            return
        state = self._arms[arm]
        if self.mode == "pikamixed":
            orientation = message.pose.orientation
            try:
                normalize_quaternion((orientation.w, orientation.x, orientation.y, orientation.z))
            except ValueError as error:
                self.get_logger().warning(f"Ignoring Pika mixed orientation for {arm}: {error}")
                return
        now = time.monotonic()
        state.last_input_at = now
        state.pose_input_at = now
        state.latest_pose = message
        if self.mode == "pikamixed":
            # Mixed mode uses only the orientation; the target is advanced by
            # _reconcile_mixed at the control period.
            if not self.dry_run and state.goal_handle is None:
                self._reconcile()
            return
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
        if self.mode != "pikavelocity" and self.mode != "pikamixed":
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
        now = time.monotonic()
        state.last_input_at = now
        state.velocity_input_at = now
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
        if self.mode not in MODES or self.dry_run:
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
