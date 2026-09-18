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
from rclpy.qos import QoSDurabilityPolicy, QoSProfile
from realman_msgs.action import CartesianPose, CartesianVelocity
from realman_msgs.msg import InputModeState
from std_msgs.msg import Float32


GRIPPER_COMMAND_TOPICS = {
    "l": "/gripper_left/percentage/command",
    "r": "/gripper_right/percentage/command",
}


@dataclass
class _ArmState:
    pose_client: ActionClient
    velocity_client: ActionClient
    pose_publisher: Any
    velocity_publisher: Any
    gripper_publisher: Any
    goal_handle: Any = None
    pending_goal: Any = None
    active_kind: str = ""
    cancel_pending: Any = None
    last_input_at: float = 0.0


class PikaControlRouter(Node):
    """Bridge selected Pika topics to driver sessions without touching m."""

    def __init__(self) -> None:
        super().__init__("pika_control_router")
        self.control_period_ms = int(self.declare_parameter("control_period_ms", 20).value)
        self.watchdog_ms = int(self.declare_parameter("watchdog_ms", 100).value)
        self.dry_run = bool(self.declare_parameter("dry_run", True).value)
        self.max_linear_speed_mps = float(self.declare_parameter("max_linear_speed_mps", 0.05).value)
        self.max_angular_speed_radps = float(self.declare_parameter("max_angular_speed_radps", 0.25).value)
        self.max_linear_accel_mps2 = float(self.declare_parameter("max_linear_accel_mps2", 0.10).value)
        self.max_angular_accel_radps2 = float(self.declare_parameter("max_angular_accel_radps2", 0.50).value)
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
            )
            self.create_subscription(PoseStamped, f"/pika/{arm}/cartesian_pose", lambda message, arm=arm: self._pose(arm, message), 1)
            self.create_subscription(TwistStamped, f"/pika/{arm}/cartesian_velocity", lambda message, arm=arm: self._velocity(arm, message), 1)
            self.create_subscription(
                Float32,
                f"/pika/{arm}/gripper_percentage",
                lambda message, arm=arm: self._gripper(arm, message),
                10,
            )
        self.create_timer(0.05, self._reconcile)
        self.get_logger().info("Pika Cartesian router ready for l/r; middle arm is excluded")

    def _mode_state(self, message: InputModeState) -> None:
        active = str(message.active_mode) if int(message.phase) == InputModeState.ACTIVE else ""
        if active not in {"pikaposition", "pikavelocity"}:
            active = ""
        if active != self.mode:
            self.get_logger().info(f"Pika router mode changed: {self.mode or 'none'} -> {active or 'none'}")
            self.mode = active
            if not active:
                for state in self._arms.values():
                    self._cancel(state)

    def _reconcile(self) -> None:
        if self.dry_run or not self.mode:
            return
        kind = "position" if self.mode == "pikaposition" else "velocity"
        for arm, state in self._arms.items():
            if state.last_input_at <= 0.0 or time.monotonic() - state.last_input_at > self.watchdog_ms / 1000.0:
                continue
            if state.active_kind == kind and state.goal_handle is not None:
                continue
            if state.goal_handle is not None or state.pending_goal is not None or state.cancel_pending is not None:
                self._cancel(state)
                continue
            client = state.pose_client if kind == "position" else state.velocity_client
            if not client.server_is_ready():
                client.wait_for_server(timeout_sec=0.0)
                continue
            goal = self._pose_goal() if kind == "position" else self._velocity_goal()
            state.pending_goal = client.send_goal_async(goal)
            state.pending_goal.add_done_callback(lambda future, arm=arm, kind=kind: self._goal_response(arm, kind, future))

    def _goal_response(self, arm: str, kind: str, future: Any) -> None:
        state = self._arms[arm]
        state.pending_goal = None
        try:
            handle = future.result()
        except Exception as error:
            self.get_logger().error(f"Pika {kind} goal failed for {arm}: {error}")
            return
        expected_mode = "pikaposition" if kind == "position" else "pikavelocity"
        if not handle.accepted or self.mode != expected_mode:
            if handle.accepted:
                state.cancel_pending = handle.cancel_goal_async()
                state.cancel_pending.add_done_callback(lambda _future, arm=arm: self._clear_cancel(arm))
            return
        state.goal_handle = handle
        state.active_kind = kind

        result_future = handle.get_result_async()
        result_future.add_done_callback(lambda _future, arm=arm: self._goal_finished(arm))
        self.get_logger().info(f"Pika {kind} session active for {arm}")

    def _goal_finished(self, arm: str) -> None:
        state = self._arms[arm]
        state.goal_handle = None
        state.active_kind = ""
        state.cancel_pending = None

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
        if not self.dry_run and state.goal_handle is not None:
            state.pose_publisher.publish(message)
        else:
            self._reconcile()

    def _velocity(self, arm: str, message: TwistStamped) -> None:
        if self.mode != "pikavelocity":
            return
        state = self._arms[arm]
        state.last_input_at = time.monotonic()
        if not self.dry_run and state.goal_handle is not None:
            state.velocity_publisher.publish(message)
        else:
            self._reconcile()

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

    def _pose_goal(self) -> CartesianPose.Goal:
        goal = CartesianPose.Goal()
        goal.reference_type = CartesianPose.Goal.BASE
        goal.reference_name = "base"
        goal.control_period_ms = self.control_period_ms
        goal.watchdog_ms = self.watchdog_ms
        goal.max_linear_speed_mps = self.max_linear_speed_mps
        goal.max_angular_speed_radps = self.max_angular_speed_radps
        goal.max_linear_accel_mps2 = self.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = self.max_angular_accel_radps2
        goal.follow = True
        goal.trajectory_mode = 0
        goal.radio = 0
        return goal

    def _velocity_goal(self) -> CartesianVelocity.Goal:
        goal = CartesianVelocity.Goal()
        goal.reference_type = CartesianVelocity.Goal.BASE
        goal.reference_name = "base"
        goal.control_period_ms = self.control_period_ms
        goal.watchdog_ms = self.watchdog_ms
        goal.max_linear_accel_mps2 = self.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = self.max_angular_accel_radps2
        goal.follow = True
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
