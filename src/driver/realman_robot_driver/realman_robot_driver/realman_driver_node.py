"""ROS 2 joint-state driver for one namespaced RealMan arm."""

from __future__ import annotations

import math
import time
from pathlib import Path
from typing import Any

from ament_index_python.packages import get_package_share_directory
import rclpy
from rclpy.action import ActionServer
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import ExternalShutdownException, MultiThreadedExecutor
from rclpy.node import Node
from geometry_msgs.msg import TwistStamped
from realman_msgs.action import CartesianVelocity, ExecuteMotion
from realman_msgs.srv import SelectFrame, VerifyCoordinates
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool
from std_srvs.srv import Trigger

from .coordinate_manager import CoordinateManager
from .coordinate_services import (
    CoordinateOperation,
    CoordinateOperationResult,
    run_coordinate_operation,
    run_startup_coordinate_policy,
)
from .cartesian_velocity_session import CartesianVelocitySession
from .motion_coordinator import ArmOwnership, MotionCoordinator
from .motion_types import MotionSettings, ReferenceState, ReferenceType
from .realman_sdk_adapter import RealManSdkAdapter, RobotState


_ARMS = frozenset({"l", "m", "r"})


def _arm_from_namespace(namespace: str) -> str:
    parts = [part for part in namespace.split("/") if part]
    if len(parts) != 1 or parts[0] not in _ARMS:
        raise ValueError("node namespace must be exactly /l, /m, or /r")
    return parts[0]


def _config_path(filename: str) -> str:
    try:
        package_path = Path(get_package_share_directory("realman_robot_driver"))
        installed = package_path / "config" / "ros" / filename
        if installed.exists():
            return str(installed)
    except (KeyError, RuntimeError):
        pass
    source_root = Path(__file__).resolve().parents[4]
    return str(source_root / "config" / "ros" / filename)


class RealManDriverNode(Node):
    """Expose a small, safe ROS contract while SDK features are added."""

    def __init__(self, **kwargs: Any) -> None:
        super().__init__("realman_driver", **kwargs)
        self.arm_id = _arm_from_namespace(self.get_namespace())
        self.robot_model = self.declare_parameter("robot_model", "RM65-B").value
        self.robot_ip = self.declare_parameter("robot_ip", "").value
        self.robot_port = int(self.declare_parameter("robot_port", 8080).value)
        self.thread_mode = self.declare_parameter("thread_mode", "RM_TRIPLE_MODE_E").value
        self.mock_mode = bool(self.declare_parameter("mock_mode", False).value)
        self.auto_connect = bool(self.declare_parameter("auto_connect", True).value)
        self.reconnect_interval = float(
            self.declare_parameter("reconnect_interval", 5.0).value
        )
        self.state_publish_rate = float(self.declare_parameter("state_publish_rate", 10.0).value)
        self.coordinates_config_file = str(
            self.declare_parameter(
                "coordinates_config_file", _config_path("realman_coordinates.yaml")
            ).value
        )
        self.motion_config_file = str(
            self.declare_parameter(
                "motion_config_file", _config_path("realman_motion.yaml")
            ).value
        )
        self.joint_names = list(
            self.declare_parameter(
                "joint_names",
                [f"joint_{index}" for index in range(1, 7)],
            ).value
        )
        if not self.robot_ip:
            raise ValueError("robot_ip must be supplied by the root config/ros YAML")
        if self.robot_port < 1 or self.robot_port > 65535:
            raise ValueError("robot_port must be between 1 and 65535")
        if self.thread_mode not in {"RM_SINGLE_MODE_E", "RM_DUAL_MODE_E", "RM_TRIPLE_MODE_E"}:
            raise ValueError("thread_mode must be a documented rm_thread_mode_e name")
        if self.thread_mode != "RM_TRIPLE_MODE_E":
            raise ValueError(
                "ordinary motion actions require RM_TRIPLE_MODE_E for SDK event callbacks"
            )
        if self.state_publish_rate <= 0.0:
            raise ValueError("state_publish_rate must be positive")
        if self.reconnect_interval < 0.0:
            raise ValueError("reconnect_interval must not be negative")
        if not self.joint_names or any(not isinstance(name, str) or not name for name in self.joint_names):
            raise ValueError("joint_names must be a non-empty list of non-empty strings")

        self.arm_ownership = ArmOwnership()
        self.coordinate_manager = CoordinateManager.from_yaml(
            self.coordinates_config_file,
            is_arm_busy=self.arm_ownership.is_busy,
            acquire_arm=self.arm_ownership.acquire,
            release_arm=self.arm_ownership.release,
        )
        self.motion_settings = MotionSettings.from_yaml(
            self.motion_config_file,
            self.arm_id,
        )
        profile = self.coordinate_manager.profiles[self.arm_id]
        self._active_references = {
            ReferenceType.BASE: "base",
            ReferenceType.WORK: profile.works[profile.work_default].controller_name,
            ReferenceType.TOOL: profile.tools[profile.tool_default].controller_name,
        }
        self.adapter = RealManSdkAdapter(
            ip=self.robot_ip,
            port=self.robot_port,
            thread_mode=self.thread_mode,
            robot_model=self.robot_model,
            mock_mode=self.mock_mode,
            arm_id=self.arm_id,
        )
        if self.mock_mode:
            self.adapter.configure_mock_coordinate_profile(profile)
        self.motion_callback_group = ReentrantCallbackGroup()
        self.motion_coordinator = MotionCoordinator(
            arm_id=self.arm_id,
            adapter=self.adapter,
            coordinate_manager=self.coordinate_manager,
            ownership=self.arm_ownership,
            reference_resolver=ReferenceState(
                {
                    ReferenceType.BASE: frozenset({"base"}),
                    ReferenceType.WORK: frozenset(
                        frame.controller_name for frame in profile.works.values()
                    ),
                    ReferenceType.TOOL: frozenset(
                        frame.controller_name for frame in profile.tools.values()
                    ),
                }
            ),
            active_reference=lambda reference_type: self._active_references[reference_type],
            action_type=ExecuteMotion,
            stop_timeout_sec=self.motion_settings.stop_timeout_sec,
            joint_goal_tolerance_deg=self.motion_settings.joint_goal_tolerance_deg,
            logger=self.get_logger(),
        )
        self._active_velocity_frames = {
            ReferenceType.BASE: ("base", f"{self.arm_id}/base"),
            ReferenceType.WORK: (
                profile.works[profile.work_default].controller_name,
                profile.works[profile.work_default].ros_frame_id,
            ),
            ReferenceType.TOOL: (
                profile.tools[profile.tool_default].controller_name,
                profile.tools[profile.tool_default].ros_frame_id,
            ),
        }
        self.velocity_session = CartesianVelocitySession(
            arm_id=self.arm_id,
            adapter=self.adapter,
            ownership=self.arm_ownership,
            settings=self.motion_settings,
            active_frame=self._active_velocity_frames,
            coordinate_manager=self.coordinate_manager,
            logger=self.get_logger(),
            action_type=CartesianVelocity,
        )
        self.execute_motion_action_server = ActionServer(
            self,
            ExecuteMotion,
            "execute_motion",
            execute_callback=self.motion_coordinator.execute,
            goal_callback=self.motion_coordinator.goal_callback,
            cancel_callback=self.motion_coordinator.cancel_callback,
            handle_accepted_callback=self.motion_coordinator.accepted_callback,
            callback_group=self.motion_callback_group,
        )
        self.cartesian_velocity_action_server = ActionServer(
            self,
            CartesianVelocity,
            "cartesian_velocity",
            execute_callback=self.velocity_session.execute,
            goal_callback=self.velocity_session.goal_callback,
            cancel_callback=self.velocity_session.cancel_callback,
            handle_accepted_callback=self.velocity_session.accepted_callback,
            callback_group=self.motion_callback_group,
        )
        self.cartesian_velocity_command_subscription = self.create_subscription(
            TwistStamped,
            "cartesian_velocity/command",
            self._velocity_command,
            10,
            callback_group=self.motion_callback_group,
        )
        self.joint_state_publisher = self.create_publisher(JointState, "joint_states", 10)
        self.connected_publisher = self.create_publisher(Bool, "connected", 10)
        self._services = [
            self.create_service(Trigger, "connect", self._connect),
            self.create_service(Trigger, "disconnect", self._disconnect),
            self.create_service(Trigger, "stop", self._stop),
            self.create_service(Trigger, "status", self._status),
            self.create_service(
                VerifyCoordinates,
                "coordinates/verify",
                self._verify_coordinates,
            ),
            self.create_service(
                VerifyCoordinates,
                "coordinates/apply",
                self._apply_coordinates,
            ),
            self.create_service(
                SelectFrame,
                "coordinates/select_tool",
                self._select_tool_frame,
            ),
            self.create_service(
                SelectFrame,
                "coordinates/select_work",
                self._select_work_frame,
            ),
        ]
        period = 1.0 / self.state_publish_rate
        self.state_timer = self.create_timer(period, self._publish_state)
        self._last_state_error = 0
        self._last_joint_count_error = 0
        self._last_connect_attempt = 0.0

        self.get_logger().info(
            f"RealMan joint-state driver ready: model={self.robot_model} ip={self.robot_ip} "
            f"port={self.robot_port} thread_mode={self.thread_mode} mock_mode={self.mock_mode}"
        )
        if self.mock_mode:
            self.get_logger().warn(
                "mock_mode is enabled; no physical controller connection or motion will occur"
            )
        if self.auto_connect:
            self._connect_to_robot()

    def _connect(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        code = self._connect_to_robot()
        response.success = code == 0
        response.message = "connected" if code == 0 else f"connect failed with API2 status {code}"
        return response

    def _disconnect(
        self, _request: Trigger.Request, response: Trigger.Response
    ) -> Trigger.Response:
        velocity_shutdown_status = self.velocity_session.shutdown()
        motion_shutdown_status = self.motion_coordinator.shutdown()
        code = self.adapter.disconnect()
        if code == 0:
            self.motion_coordinator.clear_lockout_after_disconnect()
        response.success = (
            velocity_shutdown_status == 0
            and motion_shutdown_status == 0
            and code == 0
        )
        failures = []
        if velocity_shutdown_status != 0:
            failures.append(
                f"velocity shutdown failed with status {velocity_shutdown_status}"
            )
        if motion_shutdown_status != 0:
            failures.append(
                f"motion shutdown failed with status {motion_shutdown_status}"
            )
        if code != 0:
            failures.append(f"disconnect failed with status {code}")
        if failures:
            response.message = "; ".join(failures)
            self.get_logger().error(response.message)
        else:
            response.message = "disconnected"
        return response

    def _stop(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        velocity_status = self.velocity_session.fast_stop_if_owned()
        code = (
            self.motion_coordinator.fast_stop()
            if velocity_status is None
            else velocity_status
        )
        response.success = code == 0
        response.message = "stop requested" if code == 0 else f"stop failed with status {code}"
        if code != 0:
            self.get_logger().error(f"RealMan stop request failed with status {code}")
        return response

    def _status(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        response.success = self.adapter.connected
        response.message = (
            f"connected={self.adapter.connected} mock_mode={self.mock_mode} "
            f"last_error={self.adapter.last_error}"
        )
        if self.adapter.last_error_message:
            response.message += f" detail={self.adapter.last_error_message}"
        return response

    def _verify_coordinates(
        self,
        _request: VerifyCoordinates.Request,
        response: VerifyCoordinates.Response,
    ) -> VerifyCoordinates.Response:
        result = self._run_coordinate_operation(CoordinateOperation.VERIFY)
        return self._fill_verify_response(response, result)

    def _apply_coordinates(
        self,
        _request: VerifyCoordinates.Request,
        response: VerifyCoordinates.Response,
    ) -> VerifyCoordinates.Response:
        result = self._run_coordinate_operation(CoordinateOperation.APPLY)
        return self._fill_verify_response(response, result)

    def _select_tool_frame(
        self,
        request: SelectFrame.Request,
        response: SelectFrame.Response,
    ) -> SelectFrame.Response:
        result = self._run_coordinate_operation(
            CoordinateOperation.SELECT_TOOL, request.name
        )
        return self._fill_select_response(response, result)

    def _select_work_frame(
        self,
        request: SelectFrame.Request,
        response: SelectFrame.Response,
    ) -> SelectFrame.Response:
        result = self._run_coordinate_operation(
            CoordinateOperation.SELECT_WORK, request.name
        )
        return self._fill_select_response(response, result)

    def _run_coordinate_operation(
        self, operation: CoordinateOperation, name: str = ""
    ) -> CoordinateOperationResult:
        result = run_coordinate_operation(
            self.coordinate_manager,
            self.adapter,
            self.arm_ownership,
            self.arm_id,
            operation,
            name,
            publish_result=self._update_active_references,
        )
        if not result.success or not result.matched:
            self.get_logger().warn(
                f"RealMan coordinate {operation} did not establish a full match: "
                f"{result.message}"
            )
        else:
            self.get_logger().info(
                f"RealMan coordinate {operation} succeeded: {result.message}"
            )
        return result

    def _update_active_references(self, result: CoordinateOperationResult) -> None:
        if result.current_tool:
            self._active_references[ReferenceType.TOOL] = result.current_tool
            frame = self._frame_for_controller(ReferenceType.TOOL, result.current_tool)
            if frame is not None:
                self._active_velocity_frames[ReferenceType.TOOL] = frame
        if result.current_work:
            self._active_references[ReferenceType.WORK] = result.current_work
            frame = self._frame_for_controller(ReferenceType.WORK, result.current_work)
            if frame is not None:
                self._active_velocity_frames[ReferenceType.WORK] = frame

    def _frame_for_controller(
        self, reference_type: ReferenceType, controller_name: str
    ) -> tuple[str, str] | None:
        profile = self.coordinate_manager.profiles[self.arm_id]
        frames = profile.tools if reference_type == ReferenceType.TOOL else profile.works
        for frame in frames.values():
            if frame.controller_name == controller_name:
                return frame.controller_name, frame.ros_frame_id
        return None

    def _velocity_command(self, command: TwistStamped) -> None:
        try:
            self.velocity_session.accept_command(command)
        except (RuntimeError, ValueError) as error:
            self.get_logger().warn(f"Cartesian velocity command rejected: {error}")

    @staticmethod
    def _fill_verify_response(
        response: VerifyCoordinates.Response,
        result: CoordinateOperationResult,
    ) -> VerifyCoordinates.Response:
        response.success = result.success
        response.matched = result.matched
        response.api2_status = result.api2_status
        response.message = result.message
        return response

    @staticmethod
    def _fill_select_response(
        response: SelectFrame.Response,
        result: CoordinateOperationResult,
    ) -> SelectFrame.Response:
        response.success = result.success
        response.api2_status = result.api2_status
        response.active_name = result.active_name
        response.message = result.message
        return response

    def _connect_to_robot(self) -> int:
        self._last_connect_attempt = time.monotonic()
        was_connected = self.adapter.connected
        code = self.adapter.connect()
        if code == 0:
            callback_status = self.adapter.register_event_callback(
                self.motion_coordinator.handle_event
            )
            if callback_status != 0:
                self.get_logger().error(
                    "RealMan event callback registration failed with API2 status "
                    f"{callback_status}"
                )
                self.adapter.disconnect()
                return callback_status
            if not self.motion_coordinator.reconcile_after_connect(
                connection_reset=not was_connected
            ):
                self.get_logger().warn(
                    "RealMan trajectory reconciliation did not prove an inactive, "
                    "error-free trajectory; motion remains safety gated"
                )
            verification = run_startup_coordinate_policy(
                self.coordinate_manager,
                self.adapter,
                self.arm_ownership,
                self.arm_id,
                publish_result=self._update_active_references,
            )
            if verification.api2_status != 0:
                self.get_logger().error(
                    "RealMan coordinate startup failed with API2 status "
                    f"{verification.api2_status}: {verification.message}"
                )
                return verification.api2_status
            if not verification.matched:
                self.get_logger().warn(
                    f"RealMan coordinate verification blocked motion: {verification.message}"
                )
            self.get_logger().info("RealMan connection ready")
        else:
            detail = self.adapter.last_error_message or "no SDK detail"
            self.get_logger().error(
                f"RealMan connection failed with API2 status {code}: {detail}"
            )
        return code

    def _publish_state(self) -> None:
        if (
            not self.adapter.connected
            and self.auto_connect
            and self.reconnect_interval > 0.0
            and time.monotonic() - self._last_connect_attempt >= self.reconnect_interval
        ):
            self._connect_to_robot()

        state = self.adapter.get_state()
        connected = Bool()
        connected.data = state.connected
        self.connected_publisher.publish(connected)
        if not state.connected or state.error_code != 0 or not state.joint_degrees:
            self._report_state_error(state)
            return

        message = JointState()
        message.header.stamp = self.get_clock().now().to_msg()
        if len(state.joint_degrees) != len(self.joint_names):
            joint_count = len(state.joint_degrees)
            if joint_count != self._last_joint_count_error:
                self._last_joint_count_error = joint_count
                self.get_logger().warn(
                    f"Ignoring joint state with {joint_count} joints; "
                    f"configuration expects {len(self.joint_names)}"
                )
            return
        self._last_joint_count_error = 0
        message.name = self.joint_names
        # The vendor API reports degrees; sensor_msgs/JointState requires radians.
        message.position = [math.radians(float(value)) for value in state.joint_degrees]
        self.joint_state_publisher.publish(message)
        self._report_state_error(state)

    def _report_state_error(self, state: RobotState) -> None:
        if state.error_code == self._last_state_error:
            return
        self._last_state_error = state.error_code
        if state.error_code != 0:
            self.get_logger().warn(
                f"RealMan state unavailable or returned status {state.error_code}"
            )
        else:
            self.get_logger().info("RealMan state stream recovered")

    def destroy_node(self) -> bool:
        velocity_status = self.velocity_session.shutdown()
        if velocity_status != 0:
            self.get_logger().error(
                f"RealMan Cartesian velocity shutdown failed with status {velocity_status}"
            )
        shutdown_status = self.motion_coordinator.shutdown()
        if shutdown_status != 0:
            self.get_logger().error(
                f"RealMan shutdown failed with status {shutdown_status}; "
                "physical safety lockout is retained"
            )
        if self.execute_motion_action_server is not None:
            self.execute_motion_action_server.destroy()
        if self.cartesian_velocity_action_server is not None:
            self.cartesian_velocity_action_server.destroy()
        if self.adapter.disconnect() == 0:
            self.motion_coordinator.clear_lockout_after_disconnect()
        return super().destroy_node()


def main(args: Any = None) -> None:
    rclpy.init(args=args)
    node = RealManDriverNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except (KeyboardInterrupt, ExternalShutdownException):
        if rclpy.ok():
            node.get_logger().info("RealMan driver shutdown requested")
    finally:
        try:
            node.velocity_session.shutdown()
            node.motion_coordinator.shutdown()
            executor.shutdown()
            node.destroy_node()
        except (KeyboardInterrupt, ExternalShutdownException):
            pass
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
