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
from rclpy.duration import Duration
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.parameter import Parameter
from rclpy.qos import QoSDurabilityPolicy, QoSProfile, QoSReliabilityPolicy
from realman_msgs.action import CartesianVelocity
from realman_msgs.msg import InputModeState
from std_msgs.msg import Bool, Float32, Int32, String


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
    # Sessions opened since keyboard mode was last activated. One per
    # activation is the healthy steady state; more means something keeps
    # ending the session, and each restart costs a movev re-initialisation.
    sessions_started: int = 0
    # Do not request a new session before this monotonic time. A goal the
    # driver rejects or aborts is retried after a pause, never at the 10 ms
    # reconcile rate (a Pika router that did the latter logged 112k rejections).
    retry_after: float = 0.0


# Pause before re-requesting a session the driver rejected or ended on its own.
_RESTART_BACKOFF_SEC = 0.5


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
        # Two tiers: input older than input_timeout_ms stops the arm (zero
        # velocity) but keeps the session; input older than input_lost_ms means
        # the browser is gone, and only then is the session released.
        self.input_lost_ms = int(
            self.declare_parameter("input_lost_ms", 1000).value
        )
        if self.input_lost_ms <= self.input_timeout_ms:
            raise ValueError("input_lost_ms must exceed input_timeout_ms")
        profiles = parse_arm_profiles(
            list(self.declare_parameter("coordinate_references", Parameter.Type.STRING_ARRAY).value),
            list(self.declare_parameter("cartesian_velocity_profiles", Parameter.Type.STRING_ARRAY).value),
        )
        for profile in profiles.values():
            # Refuse at startup rather than raise inside the timer on the first
            # session request, which used to take the whole router down.
            self._goal(profile)
        self.mode = ""
        self._mode_epoch = -1
        self._mode_request_id = -1
        self._gripper_publishers: dict[str, Any] = {}
        self._gripper_states = {arm: {"connected": False, "alarm": None} for arm in ("l", "r")}
        self._gripper_last_stamp = {"l": 0, "r": 0}
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
            gripper = {"l": "gripper_left", "r": "gripper_right"}[arm]
            self._gripper_publishers[arm] = self.create_publisher(
                Float32, f"/{gripper}/percentage/command", 1
            )
            self.create_subscription(
                String, f"/keyboard/{arm}/gripper_command",
                lambda message, selected=arm: self._gripper_input(selected, message),
                QoSProfile(depth=1, lifespan=Duration(nanoseconds=self.input_timeout_ms * 1_000_000)),
            )
            for field, message_type in (("connected", Bool), ("alarm", Int32)):
                self.create_subscription(
                    message_type, f"/{gripper}/{field}",
                    lambda message, selected=arm, key=field: self._gripper_health(selected, key, message),
                    1,
                )
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
                QoSProfile(
                    depth=1,
                    reliability=QoSReliabilityPolicy.RELIABLE,
                    durability=QoSDurabilityPolicy.TRANSIENT_LOCAL,
                ),
            )
        period = min(profile.control_period_ms for profile in profiles.values())
        self.create_timer(period / 1000.0, self._reconcile)
        self.get_logger().info(
            "Keyboard router ready for l/r default WORK velocities and gripper targets"
        )

    def _mode_state(self, message: InputModeState) -> None:
        active = (
            message.active_mode
            if message.phase == InputModeState.ACTIVE
            and message.active_mode == "keyboard"
            else ""
        )
        epoch_changed = message.epoch != self._mode_epoch
        self._mode_epoch = message.epoch
        self._mode_request_id = message.request_id
        if active != self.mode or epoch_changed:
            self.mode = active
            if not active or epoch_changed:
                for arm in self._arms:
                    self._publish_zero(arm)
                    self._cancel(arm, "input mode left keyboard")
            for state in self._arms.values():
                state.sessions_started = 0
                state.retry_after = 0.0

    def _gripper_health(self, arm: str, field: str, message: Any) -> None:
        self._gripper_states[arm][field] = message.data

    def _gripper_input(self, arm: str, message: String) -> None:
        """Consume a fresh discrete target; never queue it for later activation."""
        try:
            event = json.loads(message.data)
            if not isinstance(event, dict) or event.get("command") not in ("open", "close"):
                raise ValueError("expected open or close")
            if any(type(event.get(key)) is not int for key in ("epoch", "request_id", "stamp_ns")):
                raise ValueError("epoch, request_id and stamp_ns must be integers")
            stamp = event["stamp_ns"]
            age_ns = self.get_clock().now().nanoseconds - stamp
            if stamp <= self._gripper_last_stamp[arm] or not 0 <= age_ns <= self.input_timeout_ms * 1_000_000:
                raise ValueError("stale or repeated gripper event")
            # Consume valid edges even if a gate rejects them, including dry-run.
            self._gripper_last_stamp[arm] = stamp
            if (self.mode != "keyboard" or event["epoch"] != self._mode_epoch
                    or event["request_id"] != self._mode_request_id):
                raise ValueError("keyboard mode epoch/request is not active")
            health = self._gripper_states[arm]
            if health["connected"] is not True or health["alarm"] != 0:
                raise ValueError("gripper is offline or alarmed")
            if not self.dry_run:
                self._gripper_publishers[arm].publish(
                    Float32(data=1.0 if event["command"] == "open" else 0.0)
                )
        except (ValueError, TypeError) as error:
            self.get_logger().warning(f"Ignoring keyboard gripper input for {arm}: {error}")

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
        # Neither releasing the keys nor changing direction touches the
        # session: they only change the command, which the driver ramps through
        # its acceleration limit. Ending the session here used to send an
        # unramped zero plus rm_set_arm_slow_stop, and the next press re-ran
        # rm_set_movev_canfd_init while the arm was still coasting.

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

    def _input_age(self, state: _ArmState, now: float) -> float:
        if state.last_input_at <= 0.0:
            return math.inf
        return now - state.last_input_at

    def _reconcile_arm(self, arm: str, now: float) -> None:
        """Hold one session for the whole keyboard activation.

        The session opens as soon as keyboard mode is active, WORK is verified
        and the browser heartbeat is alive, before any key is pressed, so the
        first press pays no goal/WORK/movev start-up. Keys only change the
        command. The session ends on mode loss, WORK loss, invalid input, a
        browser gone for input_lost_ms, or the driver ending it.
        """
        state = self._arms[arm]
        if self.mode != "keyboard" or not state.work_available:
            return
        age = self._input_age(state, now)
        if age >= self.input_lost_ms / 1000.0:
            self._publish_zero(arm)
            self._cancel(arm, "Web keyboard input lost")
            return
        fresh = age < self.input_timeout_ms / 1000.0
        if state.goal_handle is not None:
            if fresh and state.latest_command is not None:
                self._publish_driver_command(arm, state.latest_command)
            else:
                # A late heartbeat stops the arm but keeps the session, so a
                # short network stall does not cost a re-initialisation.
                self._publish_zero(arm)
            return
        if self.dry_run or now < state.retry_after:
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
        if profile.control_period_ms > 10:
            raise ValueError(
                "keyboard high-follow requires control_period_ms <= 10"
            )
        goal = CartesianVelocity.Goal()
        goal.reference_type = CartesianVelocity.Goal.WORK
        goal.reference_name = profile.reference_name
        goal.control_period_ms = profile.control_period_ms
        goal.watchdog_ms = profile.watchdog_ms
        goal.max_linear_speed_mps = profile.max_linear_speed_mps
        goal.max_angular_speed_radps = profile.max_angular_speed_radps
        goal.max_linear_accel_mps2 = profile.max_linear_accel_mps2
        goal.max_angular_accel_radps2 = profile.max_angular_accel_radps2
        # The router decouples the 50 ms browser ingress from the SDK stream
        # and refreshes the cached command at the configured <=10 ms period.
        goal.follow = True
        goal.trajectory_mode = 0
        goal.radio = 0
        return goal

    def _goal_response(self, arm: str, future: Any) -> None:
        state = self._arms[arm]
        if state.pending_goal is future:
            state.pending_goal = None
        now = time.monotonic()
        try:
            handle = future.result()
        except Exception as error:
            state.cancel_after_accept = False
            state.retry_after = now + _RESTART_BACKOFF_SEC
            self.get_logger().error(f"Keyboard velocity goal failed for {arm}: {error}")
            return
        if not handle.accepted:
            state.retry_after = now + _RESTART_BACKOFF_SEC
            self.get_logger().warning(
                f"Keyboard velocity session for {arm} was rejected by the driver; "
                f"retrying in {_RESTART_BACKOFF_SEC:.1f} s"
            )
        # A zero or slightly late command is normal for a session opened ahead
        # of the first key press; only a browser that is gone voids it.
        lost = self._input_age(state, now) >= self.input_lost_ms / 1000.0
        if (
            not handle.accepted
            or state.cancel_after_accept
            or self.mode != "keyboard"
            or not state.work_available
            or lost
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
        if state.latest_command is not None:
            self._publish_driver_command(arm, state.latest_command)
        else:
            self._publish_zero(arm)
        state.sessions_started += 1
        if state.sessions_started == 1:
            self.get_logger().info(f"Keyboard velocity session active for {arm}")
        else:
            # Healthy operation opens one session per keyboard activation, so
            # every restart is worth seeing: each one re-initialises movev.
            self.get_logger().warning(
                f"Keyboard velocity session active for {arm} "
                f"(restart #{state.sessions_started - 1} in this keyboard activation)"
            )

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
            if result.terminal_state != CartesianVelocity.Result.CANCELED:
                # The driver ended it (watchdog, command failure): reopen, but
                # not in a tight loop if the cause persists.
                state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
        except Exception as error:
            state.retry_after = time.monotonic() + _RESTART_BACKOFF_SEC
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
