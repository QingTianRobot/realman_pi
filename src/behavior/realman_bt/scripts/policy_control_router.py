#!/usr/bin/env python3
"""Route policy_bridge's Cartesian velocity stream to the drivers while the behavior tree is in policy mode.

The bridge publishes ``/pi05_policy/{arm}/cartesian_velocity`` and ``.../gripper_percentage``. This node is the only
consumer: it opens one ``CartesianVelocity`` session per arm and replays the stream into the driver, like the Pika
router does for Pika. The single gate for motion is the bridge itself (``/policy/activate``): nothing arrives until it
publishes, and a stale or stopped stream zeroes and then releases the session.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
import time
from typing import Any

import rclpy
from geometry_msgs.msg import TwistStamped
from rclpy.action import ActionClient
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.parameter import Parameter
from rclpy.qos import QoSDurabilityPolicy, QoSProfile
from realman_msgs.action import CartesianVelocity
from realman_msgs.msg import InputModeState
from router_common import (
    ArmProfile,
    clamp_angular_velocity,
    clamp_linear_velocity,
    parse_arm_profiles,
    velocity_goal,
)
from sensor_msgs.msg import JointState
from std_msgs.msg import Float32
from std_srvs.srv import Trigger

MODE = "policy"
ARMS = ("l", "r")
GRIPPER_COMMAND_TOPICS = {
    "l": "/gripper_left/percentage/command",
    "r": "/gripper_right/percentage/command",
}
# Pause before re-requesting a session the driver rejected or ended on its own.
_RESTART_BACKOFF_SEC = 0.5
_ZERO_EPSILON = 1.0e-9


def validate_command(message: Any, profile: ArmProfile, now_ns: int, stale_ms: float) -> str | None:
    """Return why a velocity command must be dropped, or None if it is acceptable."""
    if message.header.frame_id != profile.frame_id:
        return f"frame_id must be {profile.frame_id!r}, got {message.header.frame_id!r}"
    values = (
        message.twist.linear.x,
        message.twist.linear.y,
        message.twist.linear.z,
        message.twist.angular.x,
        message.twist.angular.y,
        message.twist.angular.z,
    )
    if not all(math.isfinite(v) for v in values):
        return "components must be finite"
    stamp_ns = message.header.stamp.sec * 1_000_000_000 + message.header.stamp.nanosec
    if stamp_ns <= 0:
        return "header.stamp is required"
    age_ms = (now_ns - stamp_ns) / 1.0e6
    if age_ms > stale_ms:
        return f"stamp is {age_ms:.0f} ms old (limit {stale_ms:.0f} ms)"
    return None


def is_zero_command(message: Any) -> bool:
    twist = message.twist
    return all(
        abs(v) <= _ZERO_EPSILON
        for v in (twist.linear.x, twist.linear.y, twist.linear.z, twist.angular.x, twist.angular.y, twist.angular.z)
    )


def gripper_value_ok(value: float) -> bool:
    return math.isfinite(value) and 0.0 <= value <= 1.0


class DriftGuard:
    """Detects arm motion nobody commanded right after a session starts.

    Known failure: at velocity-session start the controller can pull the arm toward a stale target even with a zero
    command. For ``window_sec`` after the session opens, while every command sent so far was zero, any joint moving
    more than ``limit_deg`` from where it was at the start trips the guard. Once a non-zero command has been sent the
    guard stands down: motion is then expected and cannot be told apart from drift.
    """

    def __init__(self, limit_deg: float, window_sec: float) -> None:
        self._limit_rad = math.radians(limit_deg)
        self._window = window_sec
        self._baseline: list[float] | None = None
        self._started_at = 0.0
        self._commanded = False

    def start(self, joints: list[float] | None, now: float) -> None:
        self._baseline = list(joints) if joints else None
        self._started_at = now
        self._commanded = False

    def note_command(self, message: Any) -> None:
        if not is_zero_command(message):
            self._commanded = True

    def drift_deg(self, joints: list[float] | None, now: float) -> float | None:
        """Largest joint deviation in degrees while the guard is armed, otherwise None."""
        if self._baseline is None or self._commanded or not joints or len(joints) != len(self._baseline):
            return None
        if now - self._started_at > self._window:
            return None
        return math.degrees(max(abs(a - b) for a, b in zip(joints, self._baseline, strict=True)))

    def tripped(self, joints: list[float] | None, now: float) -> bool:
        drift = self.drift_deg(joints, now)
        return drift is not None and math.radians(drift) > self._limit_rad


@dataclass
class _Arm:
    client: ActionClient
    velocity_publisher: Any
    gripper_publisher: Any
    profile: ArmProfile
    guard: DriftGuard
    goal_handle: Any = None
    pending_goal: Any = None
    cancel_pending: Any = None
    latest: TwistStamped | None = None
    last_input_at: float = 0.0
    # Newest raw arrival, even while faulted: a fault only clears once the stream has really gone quiet.
    last_seen_at: float = 0.0
    retry_after: float = 0.0
    last_gripper_at: float = 0.0
    joints: list[float] | None = None
    # Latched by the drift guard or the emergency stop: no new session until the stream has gone quiet once, i.e.
    # until the operator has deactivated and re-activated the bridge.
    fault: str = ""
    sessions_started: int = 0


class PolicyControlRouter(Node):
    def __init__(self) -> None:
        super().__init__("policy_control_router")
        self.dry_run = bool(self.declare_parameter("dry_run", True).value)
        self.stale_ms = int(self.declare_parameter("stale_ms", 100).value)
        self.input_timeout_ms = int(self.declare_parameter("input_timeout_ms", 500).value)
        self.follow = bool(self.declare_parameter("follow", False).value)
        self.gripper_min_period = 1.0 / float(self.declare_parameter("gripper_max_hz", 10.0).value)
        namespace = str(self.declare_parameter("command_namespace", "/pi05_policy").value)
        drift_limit_deg = float(self.declare_parameter("drift_limit_deg", 1.0).value)
        drift_window_sec = float(self.declare_parameter("drift_window_sec", 2.0).value)
        if self.stale_ms >= self.input_timeout_ms:
            raise ValueError("stale_ms must be below input_timeout_ms")
        arms = tuple(self.declare_parameter("arms", list(ARMS)).value)
        if not arms or not set(arms) <= set(ARMS):
            raise ValueError(f"arms must be a non-empty subset of {ARMS}")
        profiles = parse_arm_profiles(
            list(self.declare_parameter("coordinate_references", Parameter.Type.STRING_ARRAY).value),
            list(self.declare_parameter("cartesian_velocity_profiles", Parameter.Type.STRING_ARRAY).value),
            str(self.declare_parameter("work_reference", "work/pikabase").value),
            float(self.declare_parameter("max_linear_speed_mps", 0.10).value),
            float(self.declare_parameter("max_angular_speed_radps", 0.25).value),
            float(self.declare_parameter("max_angular_accel_radps2", 0.50).value),
            float(self.declare_parameter("max_linear_accel_mps2", 0.10).value),
            label="policy",
        )
        self.mode_active = False
        self._last_log: dict[tuple[str, str], float] = {}
        self._arms: dict[str, _Arm] = {}
        state_qos = QoSProfile(depth=1, durability=QoSDurabilityPolicy.TRANSIENT_LOCAL)
        self.create_subscription(InputModeState, "/realman_bt_executor/input_mode_state", self._mode_state, state_qos)
        for arm in arms:
            self._arms[arm] = _Arm(
                client=ActionClient(self, CartesianVelocity, f"/{arm}/cartesian_velocity"),
                velocity_publisher=self.create_publisher(TwistStamped, f"/{arm}/cartesian_velocity/command", 1),
                gripper_publisher=self.create_publisher(Float32, GRIPPER_COMMAND_TOPICS[arm], 10),
                profile=profiles[arm],
                guard=DriftGuard(drift_limit_deg, drift_window_sec),
            )
            self.create_subscription(
                TwistStamped, f"{namespace}/{arm}/cartesian_velocity", lambda m, a=arm: self._velocity(a, m), 1
            )
            self.create_subscription(
                Float32, f"{namespace}/{arm}/gripper_percentage", lambda m, a=arm: self._gripper(a, m), 10
            )
            self.create_subscription(JointState, f"/{arm}/joint_states", lambda m, a=arm: self._joints(a, m), 1)
        self.create_service(Trigger, "/policy_router/emergency_stop", self._emergency_stop)
        period_ms = min(p.control_period_ms for p in profiles.values())
        self.create_timer(period_ms / 1000.0, self._reconcile)
        self.get_logger().info(
            f"policy_control_router ready: arms={list(arms)} dry_run={self.dry_run} "
            f"stale={self.stale_ms}ms timeout={self.input_timeout_ms}ms"
        )

    def _log_throttled(self, level: str, key: tuple[str, str], text: str, every: float = 1.0) -> None:
        now = time.monotonic()
        if now - self._last_log.get(key, 0.0) >= every:
            self._last_log[key] = now
            getattr(self.get_logger(), level)(text)

    def _joints(self, arm: str, message: JointState) -> None:
        self._arms[arm].joints = [float(p) for p in message.position][:6]

    def _mode_state(self, message: InputModeState) -> None:
        active = int(message.phase) == InputModeState.ACTIVE and str(message.active_mode) == MODE
        if active == self.mode_active:
            return
        self.get_logger().info(f"policy router mode: {'policy' if self.mode_active else 'other'} -> {'policy' if active else 'other'}")
        self.mode_active = active
        if not active:
            for arm, state in self._arms.items():
                self._release(arm, state, zero_first=True)
                state.fault = ""
        for state in self._arms.values():
            state.sessions_started = 0
            state.retry_after = 0.0

    def _release(self, arm: str, state: _Arm, *, zero_first: bool) -> None:
        if zero_first:
            self._publish(state, TwistStamped())
        state.latest = None
        if state.goal_handle is not None and state.cancel_pending is None:
            state.cancel_pending = state.goal_handle.cancel_goal_async()
            state.cancel_pending.add_done_callback(lambda _f, s=state: setattr(s, "cancel_pending", None))

    def _publish(self, state: _Arm, command: TwistStamped) -> None:
        if self.dry_run or state.goal_handle is None:
            return
        outgoing = TwistStamped()
        outgoing.header.stamp = self.get_clock().now().to_msg()
        outgoing.header.frame_id = state.profile.frame_id
        outgoing.twist = command.twist
        state.velocity_publisher.publish(outgoing)

    def _velocity(self, arm: str, message: TwistStamped) -> None:
        if not self.mode_active:
            return
        state = self._arms[arm]
        state.last_seen_at = time.monotonic()
        if state.fault:
            return
        reason = validate_command(message, state.profile, self.get_clock().now().nanoseconds, self.stale_ms)
        if reason is not None:
            self._log_throttled("warning", (arm, "drop"), f"Dropping policy velocity for {arm}: {reason}")
            return
        limited, linear_clamped = clamp_linear_velocity(message, state.profile.max_linear_speed_mps)
        limited, angular_clamped = clamp_angular_velocity(limited, state.profile.max_angular_speed_radps)
        if linear_clamped or angular_clamped:
            self._log_throttled("warning", (arm, "clamp"), f"Clamping policy velocity for {arm} to the router limits")
        state.guard.note_command(limited)
        state.last_input_at = time.monotonic()
        state.latest = limited
        if state.goal_handle is None:
            self._reconcile()

    def _gripper(self, arm: str, message: Float32) -> None:
        state = self._arms[arm]
        if not self.mode_active or self.dry_run or state.fault:
            return
        value = float(message.data)
        if not gripper_value_ok(value):
            self._log_throttled("warning", (arm, "grip"), f"Ignoring invalid policy gripper value for {arm}: {value!r}")
            return
        now = time.monotonic()
        if now - state.last_gripper_at < self.gripper_min_period:
            return
        state.last_gripper_at = now
        state.gripper_publisher.publish(Float32(data=value))

    def _emergency_stop(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        for arm, state in self._arms.items():
            self._release(arm, state, zero_first=True)
            state.fault = "emergency stop"
        self.get_logger().warning("Policy emergency stop: velocity zeroed, sessions cancelled")
        response.success = True
        response.message = "emergency_stop: ok"
        return response

    def _trip(self, arm: str, state: _Arm, drift: float) -> None:
        self.get_logger().error(
            f"Uncommanded motion on {arm}: {drift:.2f} deg after the session started; cancelling the session. "
            "Deactivate and re-activate the policy bridge to retry."
        )
        self._release(arm, state, zero_first=True)
        state.fault = "uncommanded motion at session start"

    def _reconcile(self) -> None:
        if self.dry_run or not self.mode_active:
            return
        now = time.monotonic()
        for arm, state in self._arms.items():
            self._reconcile_arm(arm, state, now)

    def _reconcile_arm(self, arm: str, state: _Arm, now: float) -> None:
        age = now - state.last_input_at if state.last_input_at > 0.0 else math.inf
        if state.fault:
            quiet = now - state.last_seen_at if state.last_seen_at > 0.0 else math.inf
            if quiet >= self.input_timeout_ms / 1000.0:
                state.fault = ""  # the stream went quiet: the operator stopped the bridge, allow a fresh start
            return
        if state.goal_handle is not None:
            drift = state.guard.drift_deg(state.joints, now)
            if state.guard.tripped(state.joints, now):
                self._trip(arm, state, drift if drift is not None else 0.0)
            elif age < self.stale_ms / 1000.0 and state.latest is not None:
                self._publish(state, state.latest)
            elif age < self.input_timeout_ms / 1000.0:
                self._publish(state, TwistStamped())
            else:
                self._release(arm, state, zero_first=True)
            return
        if age >= self.stale_ms / 1000.0 or state.latest is None:
            return  # never open a session to replay a stale command
        if state.pending_goal is not None or state.cancel_pending is not None or now < state.retry_after:
            return
        if not state.client.server_is_ready():
            state.client.wait_for_server(timeout_sec=0.0)
            return
        state.pending_goal = state.client.send_goal_async(velocity_goal(state.profile, self.follow))
        state.pending_goal.add_done_callback(lambda future, a=arm: self._goal_response(a, future))

    def _goal_response(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        state.pending_goal = None
        try:
            handle = future.result()
        except Exception as error:  # noqa: BLE001
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().error(f"Policy velocity goal failed for {arm}: {error}")
            return
        if not handle.accepted or not self.mode_active:
            if handle.accepted:
                state.cancel_pending = handle.cancel_goal_async()
                state.cancel_pending.add_done_callback(lambda _f, s=state: setattr(s, "cancel_pending", None))
            else:
                state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
                self.get_logger().warning(f"Policy velocity session for {arm} rejected by the driver; retrying")
            return
        state.goal_handle = handle
        state.guard.start(state.joints, time.monotonic())
        handle.get_result_async().add_done_callback(lambda done, a=arm: self._goal_finished(a, done))
        if state.latest is not None:
            state.guard.note_command(state.latest)
            self._publish(state, state.latest)
        state.sessions_started += 1
        self.get_logger().info(f"Policy velocity session active for {arm} (#{state.sessions_started})")

    def _goal_finished(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        state.goal_handle = None
        state.cancel_pending = None
        try:
            result = future.result().result
            if not result.success:
                self.get_logger().warning(f"Policy velocity session ended for {arm}: {result.message}")
            if int(getattr(result, "terminal_state", 1)) != 1:  # 1 is CANCELED
                state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
        except Exception as error:  # noqa: BLE001
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
            self.get_logger().error(f"Policy velocity result failed for {arm}: {error}")


def main(args: Any = None) -> None:
    rclpy.init(args=args)
    node = PolicyControlRouter()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        node.get_logger().info("Policy router shutdown requested")
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
