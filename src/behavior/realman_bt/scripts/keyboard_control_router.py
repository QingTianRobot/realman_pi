#!/usr/bin/env python3
"""Own l/r driver velocity sessions for selected Web keyboard input."""

from __future__ import annotations

from dataclasses import dataclass
import json
import math
import time
from typing import Any

import rclpy
from geometry_msgs.msg import TwistStamped
from rclpy.action import ActionClient
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import QoSDurabilityPolicy, QoSProfile
from realman_msgs.action import CartesianVelocity
from realman_msgs.msg import InputModeState
from std_msgs.msg import String


@dataclass(frozen=True)
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
    action_client: Any
    command_publisher: Any
    profile: _ArmProfile
    goal_handle: Any = None
    pending_goal: Any = None
    cancel_pending: Any = None
    latest_command: TwistStamped | None = None
    last_input_at: float = 0.0
    work_available: bool = False
    cancel_after_accept: bool = False


def _positive_float(value: str, field: str) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be numeric") from error
    if not math.isfinite(parsed) or parsed <= 0.0:
        raise ValueError(f"{field} must be positive and finite")
    return parsed


def _positive_int(value: str, field: str) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be an integer") from error
    if parsed <= 0:
        raise ValueError(f"{field} must be positive")
    return parsed


def parse_arm_profiles(
    coordinate_references: list[str], velocity_profiles: list[str]
) -> dict[str, _ArmProfile]:
    """Resolve exactly one default WORK and one motion profile for l/r."""

    references: dict[str, tuple[str, str]] = {}
    for index, entry in enumerate(coordinate_references):
        parts = entry.split("|")
        if len(parts) != 5:
            raise ValueError(f"coordinate reference {index} is malformed")
        arm, logical_name, reference_type, controller_name, frame_id = parts
        if arm not in {"l", "r"} or logical_name != "default_work":
            continue
        if arm in references:
            raise ValueError(f"duplicate default WORK for {arm}")
        if reference_type != "1" or not controller_name or not frame_id:
            raise ValueError(f"{arm} default WORK reference is invalid")
        references[arm] = (controller_name, frame_id)

    motion: dict[str, tuple[int, int, float, float, float, float]] = {}
    for index, entry in enumerate(velocity_profiles):
        parts = entry.split("|")
        if len(parts) != 9:
            raise ValueError(f"velocity profile {index} is malformed")
        arm = parts[0]
        if arm not in {"l", "r"}:
            continue
        if arm in motion:
            raise ValueError(f"duplicate velocity profile for {arm}")
        motion[arm] = (
            _positive_int(parts[1], f"{arm}.control_period_ms"),
            _positive_int(parts[2], f"{arm}.watchdog_ms"),
            _positive_float(parts[3], f"{arm}.max_linear_speed_mps"),
            _positive_float(parts[4], f"{arm}.max_angular_speed_radps"),
            _positive_float(parts[5], f"{arm}.max_linear_accel_mps2"),
            _positive_float(parts[6], f"{arm}.max_angular_accel_radps2"),
        )

    if set(references) != {"l", "r"}:
        raise ValueError("l and r default WORK references are required")
    if set(motion) != {"l", "r"}:
        raise ValueError("l and r velocity profiles are required")
    return {
        arm: _ArmProfile(references[arm][0], references[arm][1], *motion[arm])
        for arm in ("l", "r")
    }


class KeyboardControlRouter(Node):
    """Gate Web keyboard input and own independent l/r velocity sessions."""

    def __init__(self) -> None:
        super().__init__("keyboard_control_router")
        self.dry_run = bool(self.declare_parameter("dry_run", True).value)
        self.input_timeout_ms = int(
            self.declare_parameter("input_timeout_ms", 150).value
        )
        if self.input_timeout_ms <= 0:
            raise ValueError("input_timeout_ms must be positive")
        profiles = parse_arm_profiles(
            list(self.declare_parameter("coordinate_references", []).value),
            list(self.declare_parameter("cartesian_velocity_profiles", []).value),
        )
        self.mode = ""
        self._arms: dict[str, _ArmState] = {}
        state_qos = QoSProfile(
            depth=1, durability=QoSDurabilityPolicy.TRANSIENT_LOCAL
        )
        self.create_subscription(
            InputModeState,
            "/realman_bt_executor/input_mode_state",
            self._mode_state,
            state_qos,
        )
        for arm in ("l", "r"):
            state = _ArmState(
                ActionClient(self, CartesianVelocity, f"/{arm}/cartesian_velocity"),
                self.create_publisher(
                    TwistStamped, f"/{arm}/cartesian_velocity/command", 1
                ),
                profiles[arm],
            )
            self._arms[arm] = state
            self.create_subscription(
                TwistStamped,
                f"/keyboard/{arm}/cartesian_velocity",
                lambda message, selected=arm: self._velocity_input(selected, message),
                1,
            )
            self.create_subscription(
                String,
                f"/{arm}/coordinates/state",
                lambda message, selected=arm: self._coordinate_state(selected, message),
                1,
            )
        period = min(profile.control_period_ms for profile in profiles.values())
        self.create_timer(period / 1000.0, self._reconcile)
        self.get_logger().info(
            "Keyboard velocity router ready for l/r default WORK sessions"
        )

    def _mode_state(self, message: InputModeState) -> None:
        active = (
            message.active_mode
            if message.phase == InputModeState.ACTIVE
            and message.active_mode == "keyboard"
            else ""
        )
        if active != self.mode:
            self.mode = active
            if not active:
                for arm in ("l", "r"):
                    self._publish_zero(arm)
                    self._cancel(arm, "input mode left keyboard")

    def _coordinate_state(self, arm: str, message: String) -> None:
        try:
            payload = json.loads(message.data)
        except (json.JSONDecodeError, TypeError) as error:
            self.get_logger().warning(
                f"Ignoring invalid coordinate state for {arm}: {error}"
            )
            payload = {}
        state = self._arms[arm]
        state.work_available = self._work_matches(arm, payload)
        if not state.work_available:
            self._publish_zero(arm)
            self._cancel(arm, "default WORK reference unavailable")

    def _work_matches(self, arm: str, state: Any) -> bool:
        if not isinstance(state, dict):
            return False
        profile = self._arms[arm].profile
        work = state.get("work")
        return bool(
            state.get("work_matched") is True
            and state.get("motion_allowed") is True
            and state.get("current_work") == profile.reference_name
            and state.get("expected_work") == profile.reference_name
            and isinstance(work, dict)
            and work.get("name") == profile.reference_name
            and work.get("frame_id") == profile.frame_id
        )

    def _velocity_input(self, arm: str, message: TwistStamped) -> None:
        try:
            self._validate_input(arm, message)
        except ValueError as error:
            self.get_logger().warning(f"Ignoring keyboard input for {arm}: {error}")
            self._publish_zero(arm)
            self._cancel(arm, "invalid keyboard input")
            return
        state = self._arms[arm]
        state.latest_command = message
        state.last_input_at = time.monotonic()
        if not self._nonzero(message):
            self._publish_zero(arm)
            self._cancel(arm, "keyboard keys released")

    def _validate_input(self, arm: str, message: TwistStamped) -> None:
        state = self._arms[arm]
        profile = state.profile
        if self.mode != "keyboard":
            raise ValueError("keyboard mode is not active")
        if message.header.frame_id != profile.frame_id:
            raise ValueError("command frame does not match default WORK")
        linear = (message.twist.linear.x, message.twist.linear.y, message.twist.linear.z)
        angular = (
            message.twist.angular.x,
            message.twist.angular.y,
            message.twist.angular.z,
        )
        if not all(math.isfinite(value) for value in (*linear, *angular)):
            raise ValueError("velocity components must be finite")
        if any(abs(value) > profile.max_linear_speed_mps for value in linear):
            raise ValueError("linear velocity exceeds configured maximum")
        if any(abs(value) > profile.max_angular_speed_radps for value in angular):
            raise ValueError("angular velocity exceeds configured maximum")

    @staticmethod
    def _nonzero(message: TwistStamped) -> bool:
        return any(
            value != 0.0
            for value in (
                message.twist.linear.x,
                message.twist.linear.y,
                message.twist.linear.z,
                message.twist.angular.x,
                message.twist.angular.y,
                message.twist.angular.z,
            )
        )

    def _reconcile(self) -> None:
        now = time.monotonic()
        for arm in ("l", "r"):
            self._reconcile_arm(arm, now)

    def _reconcile_arm(self, arm: str, now: float) -> None:
        state = self._arms[arm]
        if self.mode != "keyboard" or not state.work_available:
            return
        if (
            state.last_input_at <= 0.0
            or now - state.last_input_at >= self.input_timeout_ms / 1000.0
        ):
            self._publish_zero(arm)
            self._cancel(arm, "Web keyboard input timed out")
            return
        command = state.latest_command
        if command is None:
            return
        if state.goal_handle is not None:
            self._publish_driver_command(arm, command)
            return
        if not self._nonzero(command) or self.dry_run:
            return
        if state.pending_goal is not None or state.cancel_pending is not None:
            return
        if not state.action_client.server_is_ready():
            state.action_client.wait_for_server(timeout_sec=0.0)
            return
        state.cancel_after_accept = False
        future = state.action_client.send_goal_async(self._goal(state.profile))
        state.pending_goal = future
        future.add_done_callback(
            lambda completed, selected=arm: self._goal_response(selected, completed)
        )

    @staticmethod
    def _goal(profile: _ArmProfile) -> CartesianVelocity.Goal:
        goal = CartesianVelocity.Goal()
        goal.reference_type = CartesianVelocity.Goal.WORK
        goal.reference_name = profile.reference_name
        goal.control_period_ms = profile.control_period_ms
        goal.watchdog_ms = profile.watchdog_ms
        goal.max_linear_accel_mps2 = profile.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = profile.max_angular_accel_radps2
        goal.follow = True
        goal.trajectory_mode = 0
        goal.radio = 0
        return goal

    def _goal_response(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        if state.pending_goal is future:
            state.pending_goal = None
        try:
            handle = future.result()
        except Exception as error:
            state.cancel_after_accept = False
            self.get_logger().error(f"Keyboard velocity goal failed for {arm}: {error}")
            return
        stale = (
            state.last_input_at <= 0.0
            or time.monotonic() - state.last_input_at
            >= self.input_timeout_ms / 1000.0
        )
        if (
            not handle.accepted
            or state.cancel_after_accept
            or self.mode != "keyboard"
            or not state.work_available
            or stale
        ):
            state.cancel_after_accept = False
            if handle.accepted:
                try:
                    state.cancel_pending = handle.cancel_goal_async()
                    state.cancel_pending.add_done_callback(
                        lambda _completed, selected=arm: self._clear_cancel(selected)
                    )
                except Exception as error:
                    self.get_logger().error(
                        f"Late keyboard goal cancellation failed for {arm}: {error}"
                    )
            return
        state.goal_handle = handle
        result = handle.get_result_async()
        result.add_done_callback(
            lambda completed, selected=arm: self._goal_finished(selected, completed)
        )
        self.get_logger().info(f"Keyboard velocity session active for {arm}")

    def _goal_finished(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        state.goal_handle = None
        state.cancel_pending = None
        try:
            response = future.result()
            result = response.result
            if not result.success:
                self.get_logger().warning(
                    f"Keyboard velocity session ended for {arm}: {result.message}"
                )
        except Exception as error:
            self.get_logger().error(
                f"Keyboard velocity result failed for {arm}: {error}"
            )

    def _publish_driver_command(self, arm: str, command: TwistStamped) -> None:
        state = self._arms[arm]
        if self.dry_run or state.goal_handle is None:
            return
        outgoing = TwistStamped()
        outgoing.header.stamp = self.get_clock().now().to_msg()
        outgoing.header.frame_id = state.profile.frame_id
        outgoing.twist = command.twist
        state.command_publisher.publish(outgoing)

    def _publish_zero(self, arm: str) -> None:
        zero = TwistStamped()
        zero.header.frame_id = self._arms[arm].profile.frame_id
        self._publish_driver_command(arm, zero)

    def _cancel(self, arm: str, reason: str) -> None:
        state = self._arms[arm]
        if state.pending_goal is not None:
            state.cancel_after_accept = True
        if state.goal_handle is None or state.cancel_pending is not None:
            return
        self.get_logger().warning(f"Stopping keyboard control for {arm}: {reason}")
        self._request_cancel_if_owned(arm)

    def _request_cancel_if_owned(self, arm: str) -> None:
        state = self._arms[arm]
        if state.goal_handle is None:
            return
        try:
            state.cancel_pending = state.goal_handle.cancel_goal_async()
            state.cancel_pending.add_done_callback(
                lambda _completed, selected=arm: self._clear_cancel(selected)
            )
        except Exception as error:
            self.get_logger().error(
                f"Keyboard velocity cancellation failed for {arm}: {error}"
            )

    def _clear_cancel(self, arm: str) -> None:
        state = self._arms[arm]
        state.goal_handle = None
        state.cancel_pending = None
        state.cancel_after_accept = False

    def destroy_node(self) -> bool:
        for arm in ("l", "r"):
            self._publish_zero(arm)
            self._cancel(arm, "keyboard router shutdown")
        return super().destroy_node()


def main(args: Any = None) -> None:
    rclpy.init(args=args)
    node = KeyboardControlRouter()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        node.get_logger().info("Keyboard router shutdown requested")
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
