"""ROS 2 node bridging WebSocket commands to RealMan interfaces."""

from __future__ import annotations

import json
import math
import queue
from typing import Any

from ament_index_python.packages import get_package_share_directory
from geometry_msgs.msg import TwistStamped
import rclpy
from rclpy.action import ActionClient
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from realman_msgs.action import CartesianVelocity, ExecuteMotion
from realman_msgs.srv import GetCurrentPose, SolveIk
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool, String
from std_srvs.srv import Trigger

from .action_bridge import ActionRecord, action_event, assign_fields, message_to_json
from .model_manifest import build_manifest
from .protocol import ProtocolError
from .web_server import WebControlServer, load_server_config


ARMS = ("l", "m", "r")


class WebControlNode(Node):
    """Own ROS clients/subscriptions while aiohttp owns network sockets."""

    def __init__(self) -> None:
        super().__init__("realman_web_control")
        config_root = get_package_share_directory("realman_web_control")
        description_root = get_package_share_directory("rm65_description")
        self.declare_parameter(
            "web_control_config_file",
            f"{config_root}/config/ros/realman_web_control.yaml",
        )
        self.declare_parameter(
            "layout_config_file",
            f"{config_root}/config/ros/three_robots.yaml",
        )
        self.declare_parameter(
            "motion_config_file",
            f"{config_root}/config/ros/realman_motion.yaml",
        )
        self.declare_parameter(
            "coordinates_config_file",
            f"{config_root}/config/ros/realman_coordinates.yaml",
        )
        self.declare_parameter("description_root", description_root)
        self.declare_parameter("static_root", f"{config_root}/static")

        web_config_file = self._parameter("web_control_config_file")
        layout_file = self._parameter("layout_config_file")
        motion_file = self._parameter("motion_config_file")
        coordinates_file = self._parameter("coordinates_config_file")
        description_root = self._parameter("description_root")
        static_root = self._parameter("static_root")
        web_config = load_server_config(web_config_file)
        self._manifest = build_manifest(
            layout_file,
            motion_file,
            coordinates_file,
            description_root,
        )
        self._robots = {robot["id"]: robot for robot in self._manifest["robots"]}
        self._commands: queue.Queue[tuple[str, dict[str, Any]]] = queue.Queue(maxsize=2048)
        self._actions: dict[tuple[str, str], ActionRecord] = {}
        self._coordinate_state: dict[str, dict[str, Any]] = {}
        self._joint_degrees: dict[str, list[float]] = {}
        self._callback_group = ReentrantCallbackGroup()

        self._motion_clients = {
            arm: ActionClient(
                self,
                ExecuteMotion,
                f"/{arm}/execute_motion",
                callback_group=self._callback_group,
            )
            for arm in ARMS
        }
        self._velocity_clients = {
            arm: ActionClient(
                self,
                CartesianVelocity,
                f"/{arm}/cartesian_velocity",
                callback_group=self._callback_group,
            )
            for arm in ARMS
        }
        self._velocity_publishers = {
            arm: self.create_publisher(TwistStamped, f"/{arm}/cartesian_velocity/command", 1)
            for arm in ARMS
        }
        self._stop_clients = {
            arm: self.create_client(
                Trigger,
                f"/{arm}/stop",
                callback_group=self._callback_group,
            )
            for arm in ARMS
        }
        self._current_pose_clients = {
            arm: self.create_client(GetCurrentPose, f"/{arm}/get_current_pose", callback_group=self._callback_group)
            for arm in ARMS
        }
        self._ik_clients = {
            arm: self.create_client(SolveIk, f"/{arm}/solve_ik", callback_group=self._callback_group)
            for arm in ARMS
        }
        self._subscriptions = []
        for arm in ARMS:
            self._subscriptions.append(
                self.create_subscription(
                    JointState,
                    f"/{arm}/joint_states",
                    lambda message, selected=arm: self._joint_state(selected, message),
                    10,
                    callback_group=self._callback_group,
                )
            )
            self._subscriptions.append(
                self.create_subscription(
                    String,
                    f"/{arm}/coordinates/state",
                    lambda message, selected=arm: self._coordinate_state_message(selected, message),
                    10,
                    callback_group=self._callback_group,
                )
            )
            self._subscriptions.append(
                self.create_subscription(
                    Bool,
                    f"/{arm}/connected",
                    lambda message, selected=arm: self._connection(selected, message),
                    10,
                    callback_group=self._callback_group,
                )
            )

        self._server = WebControlServer(
            config=web_config,
            manifest=self._manifest,
            static_root=static_root,
            description_root=description_root,
            on_command=self._enqueue_command,
            on_client_connected=self._send_cached_state,
            logger=self.get_logger(),
        )
        self._server.start()
        self._command_timer = self.create_timer(
            0.02,
            self._drain_commands,
            callback_group=self._callback_group,
        )
        self.get_logger().info(
            f"RealMan Web control listening on {web_config.bind_host}:{web_config.port} "
            "(direct control enabled)"
        )

    def _parameter(self, name: str) -> str:
        value = self.get_parameter(name).value
        if not isinstance(value, str) or not value:
            raise ValueError(f"{name} must be a non-empty string")
        return value

    def _enqueue_command(self, client_id: str, message: dict[str, Any]) -> None:
        try:
            self._commands.put_nowait((client_id, message))
        except queue.Full:
            self._server.send_event(
                ProtocolError("server_busy", "command queue is full; try again").event(),
                client_id,
            )

    def _drain_commands(self) -> None:
        for _ in range(100):
            try:
                client_id, message = self._commands.get_nowait()
            except queue.Empty:
                return
            try:
                self._dispatch(client_id, message)
            except ProtocolError as error:
                self._server.send_event(error.event(), client_id)
            except Exception as error:
                self.get_logger().error(
                    f"Web command {message.get('type', '<unknown>')} failed: {error}"
                )
                self._server.send_event(
                    ProtocolError("internal_error", "command could not be processed").event(),
                    client_id,
                )

    def _dispatch(self, client_id: str, message: dict[str, Any]) -> None:
        message_type = message["type"]
        if message_type == "client_disconnected":
            self._client_disconnected(client_id)
        elif message_type == "get_current_pose":
            self._get_current_pose(client_id, message)
        elif message_type == "solve_ik":
            self._solve_ik(client_id, message)
        elif message_type == "execute_motion":
            self._execute_motion(client_id, message)
        elif message_type == "start_cartesian_velocity":
            self._start_velocity(client_id, message)
        elif message_type == "velocity_command":
            self._velocity_command(client_id, message)
        elif message_type == "cancel_action":
            self._cancel_action(client_id, message["arm"], message["action"])
        elif message_type == "software_stop":
            self._software_stop(client_id, message)
        else:
            raise ProtocolError("unsupported_type", f"unsupported message type: {message_type}")

    def _get_current_pose(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        client = self._current_pose_clients[arm]
        if not client.service_is_ready():
            raise ProtocolError(
                "kinematics_unavailable",
                f"/{arm}/get_current_pose is not available",
                message["request_id"],
            )
        reference_type, reference_name = self._default_reference(arm)
        request = GetCurrentPose.Request()
        request.reference_type = reference_type
        request.reference_name = reference_name
        future = client.call_async(request)
        future.add_done_callback(
            lambda completed: self._current_pose_response(
                client_id, arm, message["request_id"], completed
            )
        )

    def _solve_ik(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        goal = message["goal"]
        client = self._ik_clients[arm]
        if not client.service_is_ready():
            raise ProtocolError(
                "kinematics_unavailable",
                f"/{arm}/solve_ik is not available",
                message["request_id"],
            )
        reference_type, reference_name = self._default_reference(arm)
        goal["reference_type"] = reference_type
        goal["reference_name"] = reference_name
        self._validate_reference(arm, goal)
        request = assign_fields(SolveIk.Request(), goal)
        future = client.call_async(request)
        future.add_done_callback(
            lambda completed: self._ik_response(
                client_id, arm, message["request_id"], completed
            )
        )

    def _current_pose_response(
        self, client_id: str, arm: str, request_id: str, future: Any
    ) -> None:
        try:
            response = future.result()
            event = {
                "type": "kinematics_result",
                "operation": "get_current_pose",
                "arm": arm,
                "request_id": request_id,
                "success": bool(response.success),
                "api2_status": int(response.api2_status),
                "current_joint_degrees": message_to_json(response.current_joint_degrees),
                "pose_position_m": message_to_json(response.pose_position_m),
                "pose_quaternion_wxyz": message_to_json(response.pose_quaternion_wxyz),
                "message": response.message,
            }
        except Exception as error:
            self.get_logger().error(f"Web current pose failed for {arm}: {error}")
            event = {
                "type": "kinematics_result",
                "operation": "get_current_pose",
                "arm": arm,
                "request_id": request_id,
                "success": False,
                "api2_status": -1,
                "current_joint_degrees": [],
                "pose_position_m": [],
                "pose_quaternion_wxyz": [],
                "message": str(error),
            }
        self._server.send_event(event, client_id)

    def _ik_response(self, client_id: str, arm: str, request_id: str, future: Any) -> None:
        try:
            response = future.result()
            joints = [float(value) for value in response.joint_degrees]
            if response.success and len(joints) != 6:
                raise ValueError("IK service returned an invalid joint vector")
            if response.success:
                for joint, value in zip(self._robots[arm]["joints"], joints):
                    if not joint["lower_deg"] <= value <= joint["upper_deg"]:
                        raise ValueError(
                            f"{joint['name']} IK result {value:.3f} deg is outside "
                            f"[{joint['lower_deg']:.3f}, {joint['upper_deg']:.3f}]"
                        )
            event = {
                "type": "kinematics_result",
                "operation": "solve_ik",
                "arm": arm,
                "request_id": request_id,
                "success": bool(response.success),
                "api2_status": int(response.api2_status),
                "joint_degrees": joints,
                "message": response.message,
            }
        except Exception as error:
            self.get_logger().error(f"Web inverse kinematics failed for {arm}: {error}")
            event = {
                "type": "kinematics_result",
                "operation": "solve_ik",
                "arm": arm,
                "request_id": request_id,
                "success": False,
                "api2_status": -1,
                "joint_degrees": [],
                "message": str(error),
            }
        self._server.send_event(event, client_id)

    def _coordinate_state_message(self, arm: str, message: String) -> None:
        try:
            payload = json.loads(message.data)
        except json.JSONDecodeError as error:
            self.get_logger().warn(f"invalid coordinate state for {arm}: {error}")
            return
        if not isinstance(payload, dict):
            return
        self._coordinate_state[arm] = payload
        self._server.send_event(payload)

    def _send_cached_state(self, client_id: str) -> None:
        for arm in ARMS:
            state = self._coordinate_state.get(arm)
            if state is not None:
                self._server.send_event(state, client_id)

    def _default_reference(self, arm: str) -> tuple[int, str]:
        state = self._coordinate_state.get(arm, {})
        preferred = state.get("preferred_reference")
        if isinstance(preferred, dict):
            ref_type = preferred.get("type")
            ref_name = preferred.get("name")
            if isinstance(ref_type, int) and isinstance(ref_name, str) and ref_name:
                return ref_type, ref_name
        return 0, "base"

    def _execute_motion(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        goal_values = message["goal"]
        reference_type, reference_name = self._default_reference(arm)
        goal_values["reference_type"] = reference_type
        goal_values["reference_name"] = reference_name
        self._validate_reference(arm, goal_values)
        if goal_values["command"] == ExecuteMotion.Goal.MOVEJ:
            for joint, value in zip(self._robots[arm]["joints"], goal_values["joint_degrees"]):
                if not joint["lower_deg"] <= value <= joint["upper_deg"]:
                    raise ProtocolError(
                        "joint_limit",
                        f"{joint['name']} target {value:.3f} deg is outside "
                        f"[{joint['lower_deg']:.3f}, {joint['upper_deg']:.3f}]",
                        message["request_id"],
                    )
        quaternion = goal_values["pose_quaternion_wxyz"]
        if goal_values["command"] != ExecuteMotion.Goal.MOVEJ and math.sqrt(
            sum(value * value for value in quaternion)
        ) < 1.0e-9:
            raise ProtocolError("invalid_field", "pose quaternion magnitude must be non-zero")
        client = self._motion_clients[arm]
        if not client.server_is_ready():
            raise ProtocolError(
                "action_unavailable",
                f"/{arm}/execute_motion is not available",
                message["request_id"],
            )
        record = self._reserve_action(
            arm,
            "execute_motion",
            client_id,
            message["request_id"],
        )
        goal = assign_fields(ExecuteMotion.Goal(), goal_values)
        self._send_goal(client, goal, record)

    def _start_velocity(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        goal_values = message["goal"]
        reference_type, reference_name = self._default_reference(arm)
        goal_values["reference_type"] = reference_type
        goal_values["reference_name"] = reference_name
        frame = self._validate_reference(arm, goal_values)
        settings = self._robots[arm]["motion"]
        exact_fields = (
            "velocity_control_period_ms",
            "velocity_watchdog_ms",
        )
        goal_fields = ("control_period_ms", "watchdog_ms")
        for expected_key, goal_key in zip(exact_fields, goal_fields):
            if int(goal_values[goal_key]) != int(settings[expected_key]):
                raise ProtocolError(
                    "safety_limit",
                    f"goal.{goal_key} must equal configured {int(settings[expected_key])}",
                    message["request_id"],
                )
        for goal_key, setting_key in (
            ("max_linear_accel_mps2", "max_linear_accel_mps2"),
            ("max_angular_accel_radps2", "max_angular_accel_radps2"),
        ):
            if goal_values[goal_key] > settings[setting_key]:
                raise ProtocolError(
                    "safety_limit",
                    f"goal.{goal_key} exceeds configured {settings[setting_key]}",
                    message["request_id"],
                )
        radio_limit = {0: 0, 1: 100, 2: 1000}[goal_values["trajectory_mode"]]
        if goal_values["radio"] > radio_limit:
            raise ProtocolError(
                "invalid_field",
                f"goal.radio exceeds {radio_limit} for trajectory_mode",
                message["request_id"],
            )
        client = self._velocity_clients[arm]
        if not client.server_is_ready():
            raise ProtocolError(
                "action_unavailable",
                f"/{arm}/cartesian_velocity is not available",
                message["request_id"],
            )
        record = self._reserve_action(
            arm,
            "cartesian_velocity",
            client_id,
            message["request_id"],
            frame_id=frame["frame_id"],
        )
        goal = assign_fields(CartesianVelocity.Goal(), goal_values)
        self._send_goal(client, goal, record)

    def _validate_reference(self, arm: str, goal: dict[str, Any]) -> dict[str, Any]:
        frame = next(
            (
                value
                for value in self._robots[arm]["frames"].values()
                if value["type"] == goal["reference_type"]
            ),
            None,
        )
        if frame is None or frame["name"] != goal["reference_name"]:
            raise ProtocolError(
                "coordinate_mismatch",
                "reference type/name must match the configured active frame",
            )
        return frame

    def _reserve_action(
        self,
        arm: str,
        action: str,
        owner: str,
        request_id: str,
        *,
        frame_id: str = "",
    ) -> ActionRecord:
        key = (arm, action)
        if key in self._actions or any(existing.arm == arm for existing in self._actions.values()):
            raise ProtocolError("action_busy", f"{arm} already has an active Web goal", request_id)
        record = ActionRecord(arm, action, owner, request_id, frame_id=frame_id)
        self._actions[key] = record
        self._server.send_event(action_event(record, "submitting"))
        return record

    def _send_goal(self, client: Any, goal: Any, record: ActionRecord) -> None:
        future = client.send_goal_async(
            goal,
            feedback_callback=lambda message: self._action_feedback(record, message),
        )
        future.add_done_callback(lambda completed: self._goal_response(record, completed))

    def _goal_response(self, record: ActionRecord, future: Any) -> None:
        key = (record.arm, record.action)
        if self._actions.get(key) is not record:
            return
        try:
            goal_handle = future.result()
        except Exception as error:
            self._actions.pop(key, None)
            self.get_logger().error(
                f"Web goal submission failed for {record.arm}/{record.action}: {error}"
            )
            self._server.send_event(action_event(record, "error", message=str(error)))
            return
        if not goal_handle.accepted:
            self._actions.pop(key, None)
            self._server.send_event(action_event(record, "rejected"))
            return
        record.goal_handle = goal_handle
        self._server.send_event(action_event(record, "accepted"))
        result_future = goal_handle.get_result_async()
        result_future.add_done_callback(lambda completed: self._action_result(record, completed))
        if record.cancel_requested:
            self._request_cancel(record)

    def _action_feedback(self, record: ActionRecord, feedback_message: Any) -> None:
        if self._actions.get((record.arm, record.action)) is not record:
            return
        self._server.send_event(
            {
                "type": "action_feedback",
                "arm": record.arm,
                "action": record.action,
                "request_id": record.request_id,
                "feedback": message_to_json(feedback_message.feedback),
            }
        )

    def _action_result(self, record: ActionRecord, future: Any) -> None:
        key = (record.arm, record.action)
        if self._actions.get(key) is not record:
            return
        self._actions.pop(key, None)
        try:
            wrapped = future.result()
            event = {
                "type": "action_result",
                "arm": record.arm,
                "action": record.action,
                "request_id": record.request_id,
                "status": int(wrapped.status),
                "result": message_to_json(wrapped.result),
            }
        except Exception as error:
            self.get_logger().error(
                f"Web action result failed for {record.arm}/{record.action}: {error}"
            )
            event = action_event(record, "error", message=str(error))
        self._server.send_event(event)

    def _cancel_action(self, client_id: str, arm: str, action: str) -> None:
        record = self._actions.get((arm, action))
        if record is None:
            raise ProtocolError("no_active_goal", f"{arm} {action} has no active Web goal")
        if record.owner != client_id:
            raise ProtocolError("not_goal_owner", "only the client that started this goal may cancel it")
        record.cancel_requested = True
        self._server.send_event(action_event(record, "canceling"))
        if record.goal_handle is not None:
            self._request_cancel(record)

    def _request_cancel(self, record: ActionRecord) -> None:
        future = record.goal_handle.cancel_goal_async()
        future.add_done_callback(lambda completed: self._cancel_response(record, completed))

    def _cancel_response(self, record: ActionRecord, future: Any) -> None:
        try:
            response = future.result()
            accepted = bool(response.goals_canceling)
            self._server.send_event(
                action_event(record, "cancel_requested" if accepted else "cancel_rejected")
            )
        except Exception as error:
            self.get_logger().error(
                f"Web cancel failed for {record.arm}/{record.action}: {error}"
            )
            self._server.send_event(action_event(record, "error", message=str(error)))

    def _velocity_command(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        record = self._actions.get((arm, "cartesian_velocity"))
        if record is None or record.owner != client_id or record.goal_handle is None:
            raise ProtocolError(
                "velocity_not_owned",
                "start and own an accepted Cartesian velocity action before streaming commands",
            )
        settings = self._robots[arm]["motion"]
        if any(abs(value) > settings["max_linear_speed_mps"] for value in message["linear"]):
            raise ProtocolError("safety_limit", "linear velocity exceeds configured component limit")
        if any(abs(value) > settings["max_angular_speed_radps"] for value in message["angular"]):
            raise ProtocolError("safety_limit", "angular velocity exceeds configured component limit")
        self._publish_velocity(arm, record.frame_id, message["linear"], message["angular"])

    def _publish_velocity(
        self,
        arm: str,
        frame_id: str,
        linear: list[float] | tuple[float, float, float],
        angular: list[float] | tuple[float, float, float],
    ) -> None:
        command = TwistStamped()
        command.header.stamp = self.get_clock().now().to_msg()
        command.header.frame_id = frame_id
        command.twist.linear.x, command.twist.linear.y, command.twist.linear.z = linear
        command.twist.angular.x, command.twist.angular.y, command.twist.angular.z = angular
        self._velocity_publishers[arm].publish(command)

    def _software_stop(self, client_id: str, message: dict[str, Any]) -> None:
        arm = message["arm"]
        client = self._stop_clients[arm]
        if not client.service_is_ready():
            raise ProtocolError("stop_unavailable", f"/{arm}/stop is not available", message["request_id"])
        future = client.call_async(Trigger.Request())
        future.add_done_callback(
            lambda completed: self._software_stop_response(client_id, arm, message["request_id"], completed)
        )
        self._server.send_event(
            {
                "type": "software_stop_state",
                "arm": arm,
                "request_id": message["request_id"],
                "state": "requested",
            }
        )

    def _software_stop_response(
        self,
        client_id: str,
        arm: str,
        request_id: str,
        future: Any,
    ) -> None:
        try:
            response = future.result()
            event = {
                "type": "software_stop_result",
                "arm": arm,
                "request_id": request_id,
                "success": bool(response.success),
                "message": response.message,
            }
        except Exception as error:
            self.get_logger().error(f"Web software stop failed for {arm}: {error}")
            event = {
                "type": "software_stop_result",
                "arm": arm,
                "request_id": request_id,
                "success": False,
                "message": str(error),
            }
        self._server.send_event(event, client_id)

    def _client_disconnected(self, client_id: str) -> None:
        for record in list(self._actions.values()):
            if record.owner != client_id:
                continue
            if record.action == "cartesian_velocity":
                self._publish_velocity(record.arm, record.frame_id, [0.0] * 3, [0.0] * 3)
            record.cancel_requested = True
            if record.goal_handle is not None:
                self._request_cancel(record)
            self.get_logger().warn(
                f"Web client disconnected; cancel requested for {record.arm}/{record.action}"
            )

    def _joint_state(self, arm: str, message: JointState) -> None:
        positions = dict(zip(message.name, message.position))
        names = [f"joint_{index}" for index in range(1, 7)]
        if not all(name in positions for name in names):
            return
        self._joint_degrees[arm] = [math.degrees(float(positions[name])) for name in names]
        stamp = message.header.stamp
        self._server.send_event(
            {
                "type": "joint_state",
                "arm": arm,
                "names": names,
                "positions_rad": [float(positions[name]) for name in names],
                "stamp_ns": int(stamp.sec) * 1_000_000_000 + int(stamp.nanosec),
            }
        )

    def _connection(self, arm: str, message: Bool) -> None:
        self._server.send_event(
            {"type": "connection", "arm": arm, "connected": bool(message.data)}
        )

    def destroy_node(self) -> bool:
        self._server.stop()
        return super().destroy_node()


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node: WebControlNode | None = None
    executor = MultiThreadedExecutor(num_threads=4)
    try:
        node = WebControlNode()
        executor.add_node(node)
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
