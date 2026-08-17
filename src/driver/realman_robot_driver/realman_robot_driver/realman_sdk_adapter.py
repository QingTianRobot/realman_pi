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


@dataclass(frozen=True)
class _CallToken:
    generation: int
    robot: Any


class RealManSdkAdapter:
    """One SDK handle with state-safe, mock-friendly vendor call boundaries."""

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
        self._state_condition = threading.Condition(self._lock)
        self._lifecycle_lock = threading.RLock()
        # Serialize ordinary SDK operations without preventing preemption or state reads.
        self._sdk_lock = threading.Lock()
        self._robot: Any | None = None
        self._handle: Any | None = None
        self._connected = False
        self._disconnecting = False
        self._destroying = False
        self._generation = 0
        self._active_calls = 0
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
        # Hold the lifecycle gate over the complete create operation. This makes
        # concurrent connects share one handle and prevents disconnect from
        # detaching a robot while create is still in progress.
        with self._lifecycle_lock:
            with self._lock:
                if self._connected and not self._disconnecting:
                    return 0
                has_stale_robot = self._robot is not None
            if has_stale_robot:
                self._disconnect_locked()
            if self.mock_mode:
                with self._lock:
                    self._generation += 1
                    self._disconnecting = False
                    self._destroying = False
                    self._connected = True
                    self._set_success_locked()
                    return 0

            try:
                from Robotic_Arm.rm_robot_interface import RoboticArm, rm_thread_mode_e
            except ImportError:
                with self._lock:
                    self._generation += 1
                    self._set_failure_locked(-100, "Robotic_Arm Python SDK is not installed")
                return -100

            with self._lock:
                self._generation += 1
                generation = self._generation
                self._disconnecting = False
                self._destroying = False
                self._connected = False
                self._event_callback = None
            robot: Any | None = None
            try:
                mode = getattr(rm_thread_mode_e, self.thread_mode)
                robot = RoboticArm(mode)
                handle = robot.rm_create_robot_arm(self.ip, self.port)
                connected = _is_valid_handle(handle)
                with self._lock:
                    # The lifecycle lock guarantees no disconnect can supersede
                    # this create operation.
                    self._robot = robot
                    self._handle = handle
                    self._connected = connected
                    if connected:
                        self._set_success_locked()
                    else:
                        self._set_failure_locked(-1, "SDK returned an invalid robot handle")
                    return self._last_error
            except Exception as error:
                if robot is not None:
                    try:
                        robot.rm_destroy()
                    except Exception:
                        pass
                with self._lock:
                    if self._generation == generation:
                        self._robot = None
                        self._handle = None
                        self._connected = False
                        self._set_failure_locked(-1, str(error))
                return -1

    def disconnect(self) -> int:
        """Release the SDK handle and all SDK connections."""
        with self._lifecycle_lock:
            return self._disconnect_locked()

    def _disconnect_locked(self) -> int:
        """Drain calls for the current robot before deleting and destroying it."""
        with self._lock:
            robot = self._robot
            handle = self._handle
            mock_mode = self.mock_mode
            self._connected = False
            self._disconnecting = robot is not None
            self._destroying = False
            self._event_callback = None
            if mock_mode or robot is None:
                self._robot = None
                self._handle = None
                self._disconnecting = False
                self._destroying = False
                self._generation += 1
                self._set_success_locked()
                return 0

            # Preemptive stop calls may still enter while this wait is in
            # progress. Once the count reaches zero, close the state gate
            # before releasing the lock so no new call can race destroy.
            while self._active_calls:
                self._state_condition.wait()
            self._destroying = True

        delete_result = 0
        destroy_result = 0
        first_error: Exception | None = None
        try:
            if handle is not None:
                delete_result = robot.rm_delete_robot_arm()
        except Exception as error:
            first_error = error
        try:
            destroy_result = robot.rm_destroy()
        except Exception as error:
            first_error = first_error or error

        with self._lock:
            self._robot = None
            self._handle = None
            self._disconnecting = False
            self._destroying = False
            self._generation += 1
            if first_error is not None:
                self._set_failure_locked(-1, str(first_error))
                return -1
            status = _status_code(delete_result, destroy_result)
            if status == 0:
                self._set_success_locked()
            else:
                self._set_failure_locked(status, "SDK disconnect failed")
            return status

    def stop(self) -> int:
        """Request the SDK's immediate trajectory stop."""
        return self._command(
            "rm_set_arm_stop", "SDK stop request failed", bypass_sdk_lock=True
        )

    def slow_stop(self) -> int:
        """Request the SDK's controlled trajectory slow stop."""
        return self._command(
            "rm_set_arm_slow_stop", "SDK slow-stop request failed", bypass_sdk_lock=True
        )

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
        return self._query(
            "rm_get_arm_current_trajectory", "SDK trajectory query failed", mock_success={}
        )

    def current_arm_state(self) -> Any:
        return self._query("rm_get_current_arm_state", "SDK arm state query failed")

    def register_event_callback(self, callback: Callable[[Any], Any]) -> int:
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is not None:
                    return status
                self._event_callback = callback
                self._set_success_locked()
                return 0
        result, token, error, _, readiness_status = self._invoke_vendor(
            "rm_get_arm_event_call_back", (callback,)
        )
        if readiness_status is not None:
            return readiness_status
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1
        status = _status_code(result)
        with self._lock:
            # Re-check identity after the vendor call. A disconnect may have
            # drained this call and a reconnect may already own the adapter.
            if token is None or not self._call_matches_locked(token):
                return -1
            if status == 0:
                self._event_callback = callback
                self._set_success_locked()
            else:
                self._set_failure_locked(status, "SDK event callback registration failed")
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
            status = self._ready_status_locked()
            mock_mode = self.mock_mode
        if status is not None:
            return status
        if mock_mode:
            try:
                frame_name = str(frame.controller_name)
            except Exception as error:
                with self._lock:
                    self._set_failure_locked(-1, str(error))
                return -1
            with self._lock:
                if not self._connected:
                    self._set_failure_locked(-1, "robot is not connected")
                    return -1
                self._mock_tool_frame_name = frame_name
                self._set_success_locked()
                return 0
        try:
            vendor_frame = _vendor_tool_frame(frame)
            result, token, error, _, readiness_status = self._invoke_vendor(
                "rm_set_manual_tool_frame", (vendor_frame,)
            )
        except Exception as error:
            with self._lock:
                self._set_failure_locked(-1, str(error))
            return -1
        if readiness_status is not None:
            return readiness_status
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return _status_code(result)
            return self._finish_command_locked(result, "SDK tool frame update failed")

    def set_work_frame(self, frame: Any) -> int:
        with self._lock:
            status = self._ready_status_locked()
            mock_mode = self.mock_mode
        if status is not None:
            return status
        try:
            pose = [*frame.xyz_m, *frame.quaternion_wxyz]
            if mock_mode:
                frame_name = str(frame.controller_name)
                with self._lock:
                    if not self._connected:
                        self._set_failure_locked(-1, "robot is not connected")
                        return -1
                    self._mock_work_frame_name = frame_name
                    self._set_success_locked()
                    return 0
            result, token, error, _, readiness_status = self._invoke_vendor(
                "rm_set_manual_work_frame", (frame.controller_name, pose)
            )
        except Exception as error:
            with self._lock:
                self._set_failure_locked(-1, str(error))
            return -1
        if readiness_status is not None:
            return readiness_status
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return _status_code(result)
            return self._finish_command_locked(result, "SDK work frame update failed")

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

    def _command(
        self,
        method_name: str,
        failure_message: str,
        *args: Any,
        bypass_sdk_lock: bool = False,
    ) -> int:
        """Issue a vendor command with state snapshots outside the adapter lock."""
        with self._lock:
            if self.mock_mode:
                if bypass_sdk_lock and self._disconnecting and not self._destroying:
                    return 0
                status = self._ready_status_locked()
                if status is None:
                    self._set_success_locked()
                    return 0
                return status
        result, token, error, _, readiness_status = self._invoke_vendor(
            method_name,
            args,
            allow_disconnect=bypass_sdk_lock,
            bypass_sdk_lock=bypass_sdk_lock,
        )
        if readiness_status is not None:
            return readiness_status
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return _status_code(result)
            return self._finish_command_locked(result, failure_message)

    def _query(self, method_name: str, failure_message: str, *, mock_success: Any = None) -> Any:
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is not None:
                    return status, None
                return (0, {}) if mock_success is None else mock_success
        result, token, error, _, readiness_status = self._invoke_vendor(method_name, ())
        if readiness_status is not None:
            return readiness_status, None
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1, None
        result_status, _ = _unpack_result(result)
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return result
            if result_status == 0:
                self._set_success_locked()
            else:
                self._set_failure_locked(result_status, failure_message)
        return result

    def _invoke_vendor(
        self,
        method_name: str,
        args: tuple[Any, ...],
        *,
        allow_disconnect: bool = False,
        bypass_sdk_lock: bool = False,
    ) -> tuple[Any, _CallToken | None, Exception | None, bool, int | None]:
        """Run one SDK call while keeping destruction and state updates ordered."""
        token, robot, readiness_status = self._begin_sdk_call(
            allow_disconnect=allow_disconnect
        )
        if readiness_status is not None:
            return None, None, None, False, readiness_status

        result: Any = None
        error: Exception | None = None
        try:
            if bypass_sdk_lock:
                result = getattr(robot, method_name)(*args)
            else:
                with self._sdk_lock:
                    result = getattr(robot, method_name)(*args)
        except Exception as caught:
            error = caught
        finally:
            with self._lock:
                current = self._call_matches_locked(token)
                self._active_calls -= 1
                self._state_condition.notify_all()
        return result, token, error, current, None

    def _begin_sdk_call(
        self, *, allow_disconnect: bool = False
    ) -> tuple[_CallToken | None, Any | None, int | None]:
        with self._lock:
            if self._disconnecting:
                if not allow_disconnect or self._destroying:
                    self._set_failure_locked(-1, "robot is not connected")
                    return None, None, -1
            elif not self._connected:
                self._set_failure_locked(-1, "robot is not connected")
                return None, None, -1
            if self._robot is None:
                self._set_failure_locked(-1, "SDK robot instance is unavailable")
                return None, None, -1
            if self._handle is None:
                self._set_failure_locked(-1, "SDK robot handle is unavailable")
                return None, None, -1
            if not _is_valid_handle(self._handle):
                self._set_failure_locked(-1, "SDK returned an invalid robot handle")
                return None, None, -1
            token = _CallToken(self._generation, self._robot)
            self._active_calls += 1
            return token, self._robot, None

    def _call_matches_locked(self, token: _CallToken) -> bool:
        return (
            self._generation == token.generation
            and self._robot is token.robot
            and self._connected
            and not self._disconnecting
            and not self._destroying
        )

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
        result, token, error, _, readiness_status = self._invoke_vendor(
            "rm_get_joint_degree", ()
        )
        if readiness_status is not None:
            return RobotState((), False, self.robot_model, readiness_status)
        if error is not None:
            with self._lock:
                current = token is not None and self._call_matches_locked(token)
                if current:
                    self._set_failure_locked(-1, str(error))
                    return RobotState((), self._connected, self.robot_model, -1)
            return RobotState((), False, self.robot_model, -1)

        status, data = _unpack_result(result)
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return RobotState((), False, self.robot_model, -1)
            if status != 0:
                self._set_failure_locked(status, "SDK joint state request failed")
                if status in {-1, -2}:
                    self._connected = False
                return RobotState((), self._connected, self.robot_model, status)
            if not isinstance(data, (list, tuple)) or not data:
                self._set_failure_locked(-1, "SDK returned an invalid joint state")
                return RobotState((), self._connected, self.robot_model, -1)
            try:
                joint_degrees = tuple(float(value) for value in data)
            except (TypeError, ValueError) as conversion_error:
                self._set_failure_locked(-1, str(conversion_error))
                return RobotState((), self._connected, self.robot_model, -1)
            self._set_success_locked()
            return RobotState(joint_degrees, self._connected, self.robot_model, status)


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
    """Return whether an SDK handle exposes a safe, non-negative integer id."""
    try:
        handle_id = getattr(handle, "id", None)
    except Exception:
        return False
    if isinstance(handle_id, bool) or not isinstance(handle_id, int):
        return False
    try:
        return handle_id >= 0
    except Exception:
        return False


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
