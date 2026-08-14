"""Small boundary around the optional RealMan Python SDK.

The ROS node depends on this boundary instead of importing the vendor SDK in
callbacks. That keeps mock-mode tests independent from a controller and makes
the SDK version/model assumptions explicit before real motion is added.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class RobotState:
    """ROS-neutral state returned by the adapter."""

    joint_degrees: tuple[float, ...]
    connected: bool
    robot_model: str
    error_code: int = 0


class RealManSdkAdapter:
    """Optional RealMan SDK client with a deterministic mock mode."""

    def __init__(
        self,
        *,
        ip: str,
        port: int,
        thread_mode: str,
        robot_model: str,
        mock_mode: bool,
    ) -> None:
        self.ip = ip
        self.port = port
        self.thread_mode = thread_mode
        self.robot_model = robot_model
        self.mock_mode = mock_mode
        self._robot: Any | None = None
        self._handle: Any | None = None
        self._connected = False
        self._last_error = 0
        self._last_error_message = ""

    @property
    def connected(self) -> bool:
        return self._connected

    @property
    def last_error(self) -> int:
        return self._last_error

    @property
    def last_error_message(self) -> str:
        return self._last_error_message

    def connect(self) -> int:
        """Connect without issuing motion; return the vendor-style status code."""
        if self._connected:
            return 0
        if self._robot is not None:
            self.disconnect()
        if self.mock_mode:
            self._connected = True
            self._last_error = 0
            self._last_error_message = ""
            return 0

        try:
            from Robotic_Arm.rm_robot_interface import RoboticArm, rm_thread_mode_e
        except ImportError:
            self._last_error = -100
            self._last_error_message = "Robotic_Arm Python SDK is not installed"
            return self._last_error

        try:
            mode = getattr(rm_thread_mode_e, self.thread_mode)
            self._robot = RoboticArm(mode)
            self._handle = self._robot.rm_create_robot_arm(self.ip, self.port)
            handle_id = getattr(self._handle, "id", -1)
            self._connected = (
                self._handle is not None
                and isinstance(handle_id, int)
                and handle_id >= 0
            )
            self._last_error = 0 if self._connected else -1
            self._last_error_message = (
                "" if self._connected else "SDK returned an invalid robot handle"
            )
        except Exception as error:
            self._robot = None
            self._handle = None
            self._connected = False
            self._last_error = -1
            self._last_error_message = str(error)
        return self._last_error

    def disconnect(self) -> int:
        """Release the SDK handle and all SDK connections."""
        if self.mock_mode:
            self._connected = False
            self._last_error = 0
            self._last_error_message = ""
            return 0

        if self._robot is None:
            self._connected = False
            self._last_error = 0
            self._last_error_message = ""
            return 0

        try:
            if self._handle is not None:
                result = self._robot.rm_delete_robot_arm()
            else:
                result = 0
            destroy_result = self._robot.rm_destroy()
            self._robot = None
            self._handle = None
            self._connected = False
            self._last_error = _status_code(result, destroy_result)
            self._last_error_message = "" if self._last_error == 0 else "SDK disconnect failed"
            return self._last_error
        except Exception as error:
            self._robot = None
            self._handle = None
            self._connected = False
            self._last_error = -1
            self._last_error_message = str(error)
            return -1

    def stop(self) -> int:
        """Request a controlled stop when a real SDK connection exists."""
        if not self._connected:
            self._last_error = -1
            self._last_error_message = "robot is not connected"
            return -1
        if self.mock_mode:
            self._last_error = 0
            self._last_error_message = ""
            return 0
        if self._robot is None:
            self._last_error = -1
            self._last_error_message = "SDK robot instance is unavailable"
            return -1
        try:
            result = self._robot.rm_set_arm_stop()
        except Exception as error:
            self._last_error = -1
            self._last_error_message = str(error)
            return self._last_error
        self._last_error = _status_code(result)
        self._last_error_message = (
            "" if self._last_error == 0 else "SDK stop request failed"
        )
        return self._last_error

    def get_state(self) -> RobotState:
        """Read joint state when available, otherwise return a safe placeholder."""
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
                self._last_error = status
                self._last_error_message = "SDK joint state request failed"
                if status in {-1, -2}:
                    self._connected = False
                return RobotState((), self._connected, self.robot_model, status)
            if not isinstance(data, (list, tuple)) or not data:
                self._last_error = -1
                self._last_error_message = "SDK returned an invalid joint state"
                return RobotState((), True, self.robot_model, self._last_error)
            self._last_error = 0
            self._last_error_message = ""
            return RobotState(
                tuple(float(value) for value in data),
                True,
                self.robot_model,
                status,
            )
        except Exception as error:
            self._last_error = -1
            self._last_error_message = str(error)
            return RobotState((), True, self.robot_model, self._last_error)


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
