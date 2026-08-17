"""Thread-safe boundary around the optional RealMan Python SDK."""

from __future__ import annotations

from dataclasses import dataclass
import threading
from typing import Any, Callable


@dataclass(frozen=True)
class RobotState:
    """ROS-neutral state returned by the adapter."""

    joint_degrees: tuple[float, ...]
    connected: bool
    robot_model: str
    error_code: int = 0


class RealManSdkAdapter:
    """One SDK handle, serialized behind a deterministic mock-friendly seam."""

    def __init__(
        self,
        *,
        ip: str,
        port: int,
        thread_mode: str,
        robot_model: str,
        mock_mode: bool,
        arm_id: str = "",
    ) -> None:
        self.ip = ip
        self.port = port
        self.thread_mode = thread_mode
        self.robot_model = robot_model
        self.mock_mode = mock_mode
        self.arm_id = arm_id
        self._lock = threading.RLock()
        self._robot: Any | None = None
        self._handle: Any | None = None
        self._connected = False
        self._last_error = 0
        self._last_error_message = ""
        # The SDK may keep only a native callback pointer, so retain Python ownership.
        self._event_callback: Callable[[Any], Any] | None = None
        self._mock_tool_frame_name = ""
        self._mock_work_frame_name = ""

    @property
    def connected(self) -> bool:
        with self._lock:
            return self._connected

    @property
    def last_error(self) -> int:
        with self._lock:
            return self._last_error

    @property
    def last_error_message(self) -> str:
        with self._lock:
            return self._last_error_message

    def connect(self) -> int:
        """Connect without issuing motion; return the vendor-style status code."""
        with self._lock:
            if self._connected:
                return 0
            if self._robot is not None:
                self._disconnect_locked()
            if self.mock_mode:
                self._connected = True
                self._set_success_locked()
                return 0

            try:
                from Robotic_Arm.rm_robot_interface import RoboticArm, rm_thread_mode_e
            except ImportError:
                self._set_failure_locked(-100, "Robotic_Arm Python SDK is not installed")
                return -100

            try:
                mode = getattr(rm_thread_mode_e, self.thread_mode)
                self._robot = RoboticArm(mode)
                self._handle = self._robot.rm_create_robot_arm(self.ip, self.port)
                handle_id = getattr(self._handle, "id", -1)
                self._connected = isinstance(handle_id, int) and handle_id >= 0
                if self._connected:
                    self._set_success_locked()
                else:
                    self._set_failure_locked(-1, "SDK returned an invalid robot handle")
            except Exception as error:
                self._robot = None
                self._handle = None
                self._connected = False
                self._set_failure_locked(-1, str(error))
            return self._last_error

    def disconnect(self) -> int:
        """Release the SDK handle and all SDK connections."""
        with self._lock:
            return self._disconnect_locked()

    def _disconnect_locked(self) -> int:
        if self.mock_mode:
            self._connected = False
            self._set_success_locked()
            return 0
        if self._robot is None:
            self._connected = False
            self._set_success_locked()
            return 0

        try:
            result = self._robot.rm_delete_robot_arm() if self._handle is not None else 0
            destroy_result = self._robot.rm_destroy()
            self._robot = None
            self._handle = None
            self._connected = False
            status = _status_code(result, destroy_result)
            if status == 0:
                self._set_success_locked()
            else:
                self._set_failure_locked(status, "SDK disconnect failed")
            return status
        except Exception as error:
            self._robot = None
            self._handle = None
            self._connected = False
            self._set_failure_locked(-1, str(error))
            return -1

    def stop(self) -> int:
        """Request the SDK's immediate trajectory stop."""
        return self._command("rm_set_arm_stop", "SDK stop request failed")

    def slow_stop(self) -> int:
        """Request the SDK's controlled trajectory slow stop."""
        return self._command("rm_set_arm_slow_stop", "SDK slow-stop request failed")

    def movej(
        self,
        joint_degrees: list[float],
        velocity_percent: int,
        blend_radius_percent: int,
        connect: bool,
    ) -> int:
        return self._command(
            "rm_movej",
            "SDK movej request failed",
            list(joint_degrees),
            velocity_percent,
            blend_radius_percent,
            int(connect),
            0,
        )

    def movel(
        self,
        pose: Any,
        velocity_percent: int,
        blend_radius_percent: int,
        connect: bool,
    ) -> int:
        return self._command(
            "rm_movel",
            "SDK movel request failed",
            pose if not isinstance(pose, tuple) else list(pose),
            velocity_percent,
            blend_radius_percent,
            int(connect),
            0,
        )

    def movej_p(
        self,
        pose: Any,
        velocity_percent: int,
        blend_radius_percent: int,
        connect: bool,
    ) -> int:
        return self._command(
            "rm_movej_p",
            "SDK movej_p request failed",
            pose if not isinstance(pose, tuple) else list(pose),
            velocity_percent,
            blend_radius_percent,
            int(connect),
            0,
        )

    def set_movev_init(self, avoid_singularity_flag: int, frame_type: int, period_ms: int) -> int:
        return self._command(
            "rm_set_movev_canfd_init",
            "SDK velocity initialization failed",
            avoid_singularity_flag,
            frame_type,
            period_ms,
        )

    def movev(
        self,
        cartesian_velocity: list[float],
        follow: bool,
        trajectory_mode: int,
        radio: int,
    ) -> int:
        return self._command(
            "rm_movev_canfd",
            "SDK Cartesian velocity request failed",
            list(cartesian_velocity),
            follow,
            trajectory_mode,
            radio,
        )

    def current_trajectory(self) -> Any:
        return self._query("rm_get_arm_current_trajectory", "SDK trajectory query failed")

    def current_arm_state(self) -> Any:
        return self._query("rm_get_current_arm_state", "SDK arm state query failed")

    def register_event_callback(self, callback: Callable[[Any], Any]) -> int:
        with self._lock:
            status = self._command(
                "rm_get_arm_event_call_back", "SDK event callback registration failed", callback
            )
            if status == 0:
                self._event_callback = callback
            return status

    def current_tool_frame(self) -> Any:
        with self._lock:
            if self.mock_mode and self._connected:
                return 0, {"frame_name": self._mock_tool_frame_name}
        return self._query("rm_get_current_tool_frame", "SDK tool frame query failed")

    def current_work_frame(self) -> Any:
        with self._lock:
            if self.mock_mode and self._connected:
                return 0, {"frame_name": self._mock_work_frame_name}
        return self._query("rm_get_current_work_frame", "SDK work frame query failed")

    def set_tool_frame(self, frame: Any) -> int:
        with self._lock:
            if self.mock_mode and self._connected:
                self._mock_tool_frame_name = str(frame.controller_name)
                self._set_success_locked()
                return 0
            status = self._ready_status_locked()
            if status is not None:
                return status
            try:
                vendor_frame = _vendor_tool_frame(frame)
                result = self._robot.rm_set_manual_tool_frame(vendor_frame)
            except Exception as error:
                self._set_failure_locked(-1, str(error))
                return -1
            return self._finish_command_locked(result, "SDK tool frame update failed")

    def set_work_frame(self, frame: Any) -> int:
        pose = [*frame.xyz_m, *frame.quaternion_wxyz]
        with self._lock:
            if self.mock_mode and self._connected:
                self._mock_work_frame_name = str(frame.controller_name)
                self._set_success_locked()
                return 0
        return self._command(
            "rm_set_manual_work_frame",
            "SDK work frame update failed",
            frame.controller_name,
            pose,
        )

    def change_tool_frame(self, controller_name: str) -> int:
        status = self._command(
            "rm_change_tool_frame", "SDK tool frame selection failed", controller_name
        )
        with self._lock:
            if status == 0 and self.mock_mode:
                self._mock_tool_frame_name = controller_name
        return status

    def change_work_frame(self, controller_name: str) -> int:
        status = self._command(
            "rm_change_work_frame", "SDK work frame selection failed", controller_name
        )
        with self._lock:
            if status == 0 and self.mock_mode:
                self._mock_work_frame_name = controller_name
        return status

    def _command(self, method_name: str, failure_message: str, *args: Any) -> int:
        """Serialize a single nonblocking vendor request and preserve its status."""
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is None:
                    self._set_success_locked()
                    return 0
                return status
            status = self._ready_status_locked()
            if status is not None:
                return status
            try:
                result = getattr(self._robot, method_name)(*args)
            except Exception as error:
                self._set_failure_locked(-1, str(error))
                return -1
            return self._finish_command_locked(result, failure_message)

    def _query(self, method_name: str, failure_message: str) -> Any:
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                return (status, None) if status is not None else (0, {})
            status = self._ready_status_locked()
            if status is not None:
                return status, None
            try:
                result = getattr(self._robot, method_name)()
            except Exception as error:
                self._set_failure_locked(-1, str(error))
                return -1, None
            result_status, _ = _unpack_result(result)
            if result_status == 0:
                self._set_success_locked()
            elif isinstance(result, (tuple, list)):
                self._set_failure_locked(result_status, failure_message)
            return result

    def _ready_status_locked(self) -> int | None:
        if not self._connected:
            self._set_failure_locked(-1, "robot is not connected")
            return -1
        if self.mock_mode:
            return None
        if self._robot is None:
            self._set_failure_locked(-1, "SDK robot instance is unavailable")
            return -1
        if self._handle is None:
            self._set_failure_locked(-1, "SDK robot handle is unavailable")
            return -1
        if not _is_valid_handle(self._handle):
            self._set_failure_locked(-1, "SDK returned an invalid robot handle")
            return -1
        return None

    def _finish_command_locked(self, result: Any, failure_message: str) -> int:
        status = _status_code(result)
        if status == 0:
            self._set_success_locked()
        else:
            self._set_failure_locked(status, failure_message)
        return status

    def _set_success_locked(self) -> None:
        self._last_error = 0
        self._last_error_message = ""

    def _set_failure_locked(self, status: int, message: str) -> None:
        self._last_error = status
        self._last_error_message = message

    def get_state(self) -> RobotState:
        """Read joint state when available, otherwise return a safe placeholder."""
        with self._lock:
            if not self._connected:
                return RobotState((), False, self.robot_model, self._last_error or -1)
            if self.mock_mode:
                return RobotState((0.0,) * 6, True, self.robot_model, 0)
            if self._robot is None:
                return RobotState((), False, self.robot_model, -1)

            try:
                result = self._robot.rm_get_joint_degree()
                status, data = _unpack_result(result)
                if status != 0:
                    self._set_failure_locked(status, "SDK joint state request failed")
                    if status in {-1, -2}:
                        self._connected = False
                    return RobotState((), self._connected, self.robot_model, status)
                if not isinstance(data, (list, tuple)) or not data:
                    self._set_failure_locked(-1, "SDK returned an invalid joint state")
                    return RobotState((), True, self.robot_model, -1)
                self._set_success_locked()
                return RobotState(
                    tuple(float(value) for value in data), True, self.robot_model, status
                )
            except Exception as error:
                self._set_failure_locked(-1, str(error))
                return RobotState((), True, self.robot_model, -1)


def _vendor_tool_frame(frame: Any) -> Any:
    """Build the only SDK-specific coordinate type used by this adapter."""
    from Robotic_Arm.rm_robot_interface import rm_frame_t, rm_pose_t

    pose = rm_pose_t()
    position = getattr(pose, "position", None)
    quaternion = getattr(pose, "quaternion", None)
    if position is None or quaternion is None:
        from Robotic_Arm.rm_robot_interface import rm_position_t, rm_quat_t

        position = position or rm_position_t()
        quaternion = quaternion or rm_quat_t()
        pose.position = position
        pose.quaternion = quaternion
    position.x, position.y, position.z = frame.xyz_m
    quaternion.w, quaternion.x, quaternion.y, quaternion.z = frame.quaternion_wxyz

    vendor_frame = rm_frame_t()
    vendor_frame.frame_name = frame.controller_name.encode("ascii")
    vendor_frame.pose = pose
    vendor_frame.payload = frame.payload_kg
    vendor_frame.x, vendor_frame.y, vendor_frame.z = frame.center_of_mass_m
    return vendor_frame


def _is_valid_handle(handle: Any) -> bool:
    handle_id = getattr(handle, "id", -1)
    return isinstance(handle_id, int) and handle_id >= 0


def _unpack_result(result: Any) -> tuple[int, Any]:
    if isinstance(result, tuple) and len(result) >= 2:
        return int(result[0]), result[1]
    if isinstance(result, list) and len(result) >= 2:
        return int(result[0]), result[1]
    return _status_code(result), None


def _status_code(*results: Any) -> int:
    for result in results:
        if isinstance(result, bool):
            if not result:
                return -1
            continue
        if isinstance(result, int) and result != 0:
            return result
    return 0
