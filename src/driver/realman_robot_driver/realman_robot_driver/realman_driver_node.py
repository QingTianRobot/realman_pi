"""ROS 2 joint-state driver for one namespaced RealMan arm."""

from __future__ import annotations

import math
import json
import threading
import time
from pathlib import Path
from typing import Any

from ament_index_python.packages import get_package_share_directory
import rclpy
from rclpy.action import ActionServer
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup
from rclpy.duration import Duration
from rclpy.executors import ExternalShutdownException, MultiThreadedExecutor
from rclpy.node import Node
from rclpy.qos import QoSDurabilityPolicy, QoSHistoryPolicy, QoSProfile
from geometry_msgs.msg import TwistStamped
from realman_msgs.action import CartesianVelocity, ExecuteMotion
from realman_msgs.srv import GetCurrentPose, SelectFrame, SolveIk, VerifyCoordinates
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool, String
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
from .pose_math import (
    euler_to_quaternion,
    pose_from_reference,
    pose_to_reference,
    quaternion_to_euler,
)
from .realman_sdk_adapter import RealManSdkAdapter, RobotState


_ARMS = frozenset({"l", "m", "r"})


def _unpack_frame_result(result: Any) -> tuple[int, Any | None]:
    if isinstance(result, (tuple, list)) and len(result) >= 2:
        return int(result[0]), result[1]
    return int(result), None


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
        self._event_recovery_lock = threading.Lock()
        self._last_event_recovery_attempt = 0.0
        self._event_recovery_delay_sec = 1.0
        self._event_recovery_retry_interval_sec = 1.0
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
            recover_event_channel=lambda: self._recover_event_channel(),
            stop_timeout_sec=self.motion_settings.stop_timeout_sec,
            joint_goal_tolerance_deg=self.motion_settings.joint_goal_tolerance_deg,
            logger=self.get_logger(),
        )
        self._active_velocity_frames = {
            ReferenceType.BASE: ("base", f"{self.arm_id}/base_link"),
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
            ros_time_now_ns=lambda: self.get_clock().now().nanoseconds,
        )
        self._coordinate_state_publisher = self.create_publisher(
            String,
            f"/{self.arm_id}/coordinates/state",
            10,
        )
        self.velocity_command_callback_group = MutuallyExclusiveCallbackGroup()
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
            QoSProfile(
                history=QoSHistoryPolicy.KEEP_LAST,
                depth=1,
                durability=QoSDurabilityPolicy.VOLATILE,
                lifespan=Duration(
                    nanoseconds=self.motion_settings.velocity_watchdog_ms * 1_000_000
                ),
            ),
            callback_group=self.velocity_command_callback_group,
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
            self.create_service(GetCurrentPose, "get_current_pose", self._get_current_pose),
            self.create_service(SolveIk, "solve_ik", self._solve_ik),
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
        velocity_clear_ok = True
        if code == 0:
            velocity_clear_ok = (
                self.velocity_session.clear_lockout_after_disconnect()
            )
            self.motion_coordinator.clear_lockout_after_disconnect()
        response.success = (
            velocity_shutdown_status == 0
            and motion_shutdown_status == 0
            and code == 0
            and velocity_clear_ok
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
        if not velocity_clear_ok:
            failures.append("velocity lockout cleanup failed after disconnect")
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

    def _get_current_pose(
        self,
        request: GetCurrentPose.Request,
        response: GetCurrentPose.Response,
    ) -> GetCurrentPose.Response:
        """Read current joints, run FK, and express the pose in the active frame."""
        try:
            reference_type, frame = self._kinematics_reference(
                request.reference_type, request.reference_name
            )
            state = self.adapter.get_state()
            if state.error_code != 0 or not state.joint_degrees:
                return self._fill_current_pose_response(
                    response,
                    False,
                    state.error_code or -1,
                    (),
                    (),
                    (),
                    "current joint state is unavailable",
                )
            status, base_pose = self.adapter.forward_kinematics(list(state.joint_degrees))
            if status != 0:
                return self._fill_current_pose_response(
                    response, False, status, state.joint_degrees, (), (),
                    f"forward kinematics failed with API2 status {status}",
                )
            position, quaternion = self._pose_in_reference(
                reference_type, frame, base_pose
            )
            return self._fill_current_pose_response(
                response, True, 0, state.joint_degrees, position, quaternion, "current pose read"
            )
        except (TypeError, ValueError) as error:
            return self._fill_current_pose_response(
                response, False, -1, (), (), (), str(error)
            )
        except Exception as error:
            self.get_logger().error(f"RealMan current pose service failed: {error}")
            return self._fill_current_pose_response(
                response, False, -1, (), (), (), "current pose query failed"
            )

    def _solve_ik(
        self,
        request: SolveIk.Request,
        response: SolveIk.Response,
    ) -> SolveIk.Response:
        """Solve IK for a pose in the active reference without submitting motion."""
        try:
            reference_type, frame = self._kinematics_reference(
                request.reference_type, request.reference_name
            )
            seed = [float(value) for value in request.seed_joint_degrees]
            if len(seed) != 6 or not all(math.isfinite(value) for value in seed):
                raise ValueError("seed_joint_degrees must contain six finite values")
            target_quaternion = tuple(float(value) for value in request.pose_quaternion_wxyz)
            target_position = tuple(float(value) for value in request.pose_position_m)
            if len(target_position) != 3 or not all(math.isfinite(value) for value in target_position):
                raise ValueError("pose_position_m must contain three finite values")
            if len(target_quaternion) != 4 or not all(math.isfinite(value) for value in target_quaternion):
                raise ValueError("pose_quaternion_wxyz must contain four finite values")
            base_position, base_quaternion = self._target_in_base(
                reference_type, frame, target_position, target_quaternion
            )
            pose_euler = [
                *base_position,
                *quaternion_to_euler(base_quaternion),
            ]
            status, joints = self.adapter.inverse_kinematics(seed, pose_euler)
            if status != 0:
                response.success = False
                response.api2_status = status
                response.message = f"inverse kinematics failed with API2 status {status}"
                return response
            if len(joints) != 6 or not all(math.isfinite(value) for value in joints):
                raise ValueError("SDK returned an invalid six-joint IK solution")
            response.success = True
            response.api2_status = 0
            response.joint_degrees = joints
            response.message = "inverse kinematics solved; shadow preview only"
            return response
        except (TypeError, ValueError) as error:
            response.success = False
            response.api2_status = -1
            response.message = str(error)
            return response
        except Exception as error:
            self.get_logger().error(f"RealMan inverse kinematics service failed: {error}")
            response.success = False
            response.api2_status = -1
            response.message = "inverse kinematics query failed"
            return response

    def _kinematics_reference(
        self, reference_type_value: int, reference_name: str
    ) -> tuple[ReferenceType, Any | None]:
        try:
            reference_type = ReferenceType(int(reference_type_value))
        except (TypeError, ValueError) as error:
            raise ValueError("reference_type must be BASE, WORK, or TOOL") from error
        if not isinstance(reference_name, str) or not reference_name:
            raise ValueError("reference_name must be non-empty")
        if reference_type is ReferenceType.BASE:
            if reference_name != "base":
                raise ValueError("BASE reference_name must be base")
            return reference_type, None
        if not self.coordinate_manager.motion_allowed(self.arm_id):
            raise ValueError("coordinate verification blocks kinematics")
        if self._active_references[reference_type] != reference_name:
            raise ValueError("reference does not match the active controller frame")
        raw_frame = (
            self.adapter.current_work_frame()
            if reference_type is ReferenceType.WORK
            else self.adapter.current_tool_frame()
        )
        status, frame = _unpack_frame_result(raw_frame)
        if status != 0 or frame is None:
            raise ValueError(f"active {reference_type.name.lower()} frame is unavailable")
        return reference_type, frame

    @staticmethod
    def _pose_in_reference(
        reference_type: ReferenceType, frame: Any | None, base_pose: list[float]
    ) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
        base_position = tuple(base_pose[:3])
        base_quaternion = euler_to_quaternion(*base_pose[3:])
        if reference_type is ReferenceType.BASE:
            return base_position, base_quaternion
        if frame is None:
            raise ValueError("reference frame is unavailable")
        return pose_to_reference(
            base_position,
            base_quaternion,
            frame.xyz_m,
            frame.quaternion_wxyz,
        )

    @staticmethod
    def _target_in_base(
        reference_type: ReferenceType,
        frame: Any | None,
        target_position: tuple[float, float, float],
        target_quaternion: tuple[float, float, float, float],
    ) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
        if reference_type is ReferenceType.BASE:
            return target_position, target_quaternion
        if frame is None:
            raise ValueError("reference frame is unavailable")
        return pose_from_reference(
            frame.xyz_m,
            frame.quaternion_wxyz,
            target_position,
            target_quaternion,
        )

    @staticmethod
    def _fill_current_pose_response(
        response: GetCurrentPose.Response,
        success: bool,
        status: int,
        joints: Any,
        position: Any,
        quaternion: Any,
        message: str,
    ) -> GetCurrentPose.Response:
        response.success = success
        response.api2_status = int(status)
        if len(joints) == 6:
            response.current_joint_degrees = list(joints)
        if len(position) == 3:
            response.pose_position_m = list(position)
        if len(quaternion) == 4:
            response.pose_quaternion_wxyz = list(quaternion)
        response.message = message
        return response

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
        self._publish_coordinate_state(result)
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

    def _publish_coordinate_state(
        self, result: CoordinateOperationResult | None = None
    ) -> None:
        profile = self.coordinate_manager.profiles[self.arm_id]
        motion_allowed = bool(self.coordinate_manager.motion_allowed(self.arm_id))
        tool_name = result.current_tool if result and result.current_tool else self._active_references[ReferenceType.TOOL]
        work_name = result.current_work if result and result.current_work else self._active_references[ReferenceType.WORK]
        tool_frame = self._frame_for_controller(ReferenceType.TOOL, tool_name)
        work_frame = self._frame_for_controller(ReferenceType.WORK, work_name)
        payload = {
            "type": "coordinate_state",
            "arm": self.arm_id,
            "motion_allowed": motion_allowed,
            "preferred_reference_type": int(
                ReferenceType.WORK if work_frame is not None else ReferenceType.TOOL if tool_frame is not None else ReferenceType.BASE
            ),
            "preferred_reference_name": work_name if work_frame is not None else tool_name if tool_frame is not None else "base",
            "preferred_reference": self._frame_payload(
                ReferenceType.WORK if work_frame is not None else ReferenceType.TOOL if tool_frame is not None else ReferenceType.BASE,
                work_name if work_frame is not None else tool_name if tool_frame is not None else "base",
                work_frame if work_frame is not None else tool_frame,
            ),
            "tool": self._frame_payload(ReferenceType.TOOL, tool_name, tool_frame),
            "work": self._frame_payload(ReferenceType.WORK, work_name, work_frame),
            "current_tool": tool_name,
            "current_work": work_name,
            "expected_tool": result.expected_tool if result else profile.tool_default,
            "expected_work": result.expected_work if result else profile.work_default,
            "matched": result.matched if result else motion_allowed,
            "tool_matched": result.tool_matched if result else tool_frame is not None,
            "work_matched": result.work_matched if result else work_frame is not None,
            "api2_status": result.api2_status if result else 0,
            "message": result.message if result else "",
        }
        message = String()
        message.data = json.dumps(payload, ensure_ascii=True, separators=(",", ":"))
        self._coordinate_state_publisher.publish(message)

    def _frame_for_controller(
        self, reference_type: ReferenceType, controller_name: str
    ) -> tuple[str, str] | None:
        profile = self.coordinate_manager.profiles[self.arm_id]
        frames = profile.tools if reference_type == ReferenceType.TOOL else profile.works
        for frame in frames.values():
            if frame.controller_name == controller_name:
                return frame.controller_name, frame.ros_frame_id
        return None

    def _frame_payload(
        self,
        reference_type: ReferenceType,
        controller_name: str,
        frame: tuple[str, str] | None,
    ) -> dict[str, Any] | None:
        if reference_type is ReferenceType.BASE:
            return {
                "type": int(reference_type),
                "name": controller_name,
                "frame_id": f"{self.arm_id}/base_link",
            }
        profile = self.coordinate_manager.profiles[self.arm_id]
        frames = profile.tools if reference_type is ReferenceType.TOOL else profile.works
        for candidate in frames.values():
            if candidate.controller_name != controller_name:
                continue
            payload = {
                "type": int(reference_type),
                "name": candidate.controller_name,
                "frame_id": candidate.ros_frame_id,
                "controller_name": candidate.controller_name,
                "xyz_m": list(candidate.xyz_m),
                "quaternion_wxyz": list(candidate.quaternion_wxyz),
            }
            if reference_type is ReferenceType.TOOL:
                payload["payload_kg"] = candidate.payload_kg
                payload["center_of_mass_m"] = list(candidate.center_of_mass_m)
            return payload
        if frame is None:
            return None
        return {
            "type": int(reference_type),
            "name": controller_name,
            "frame_id": frame[1],
        }

    def _velocity_command(self, command: TwistStamped) -> None:
        try:
            stamp = getattr(getattr(command, "header", None), "stamp", None)
            if stamp is None or (stamp.sec == 0 and stamp.nanosec == 0):
                raise ValueError("TwistStamped header.stamp must be set")
            self.velocity_session.accept_command(command)
        except (RuntimeError, ValueError) as error:
            self.get_logger().debug(f"Cartesian velocity command rejected: {error}")

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
            self._publish_coordinate_state(verification)
            self.get_logger().info("RealMan connection ready")
        else:
            detail = self.adapter.last_error_message or "no SDK detail"
            self.get_logger().error(
                f"RealMan connection failed with API2 status {code}: {detail}"
            )
        return code

    def _recover_event_channel(self) -> bool:
        """Reset a stale callback channel after a confirmed inactive stop."""
        if not self.motion_coordinator.event_channel_recovery_required:
            return True
        if not self._event_recovery_lock.acquire(blocking=False):
            return False
        try:
            now = time.monotonic()
            if (
                now - self._last_event_recovery_attempt
                < self._event_recovery_retry_interval_sec
            ):
                return False
            self._last_event_recovery_attempt = now
            # The controller can keep the old TCP session briefly after the
            # SDK handle is destroyed. Give it a bounded quiet interval before
            # creating a replacement handle.
            time.sleep(self._event_recovery_delay_sec)
            if not self.motion_coordinator.event_channel_recovery_required:
                return True
            self.get_logger().warn(
                "Resetting RealMan SDK connection after a clean stop left the "
                "trajectory event channel without a generation marker"
            )
            if self.adapter.connected:
                disconnect_status = self.adapter.disconnect()
                if disconnect_status != 0:
                    self.get_logger().error(
                        "RealMan event channel reset disconnect failed with API2 "
                        f"status {disconnect_status}"
                    )
                    return False
            connect_status = self._connect_to_robot()
            if connect_status != 0:
                self.get_logger().error(
                    "RealMan event channel reset reconnect failed with API2 "
                    f"status {connect_status}"
                )
                return False
            return not self.motion_coordinator.event_channel_recovery_required
        finally:
            self._event_recovery_lock.release()

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
            velocity_clear_ok = (
                self.velocity_session.clear_lockout_after_disconnect()
            )
            self.motion_coordinator.clear_lockout_after_disconnect()
            if not velocity_clear_ok:
                self.get_logger().error(
                    "RealMan velocity lockout cleanup failed after disconnect"
                )
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
