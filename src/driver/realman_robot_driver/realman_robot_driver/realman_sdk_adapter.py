"""Thread-safe boundary around the optional RealMan Python SDK."""

from __future__ import annotations

from dataclasses import dataclass
import math
import threading
from typing import Any, Callable

from .coordinate_manager import ControllerFrame


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
        self._vendor_event_callback: Any | None = None
        self._pending_event_callback: Callable[[Any], Any] | None = None
        self._pending_event_callback_marker: object | None = None
        self._mock_tool_frames: dict[str, ControllerFrame] = {}
        self._mock_work_frames: dict[str, ControllerFrame] = {}
        self._mock_tool_frame: ControllerFrame | None = None
        self._mock_work_frame: ControllerFrame | None = None
        self._mock_trajectory_active = False
        self._mock_trajectory_reads_remaining = 0

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
                teardown_status = self._disconnect_locked()
                if teardown_status != 0:
                    return teardown_status
            if self.mock_mode:
                with self._lock:
                    self._generation += 1
                    self._disconnecting = False
                    self._destroying = False
                    self._connected = True
                    self._mock_trajectory_active = False
                    self._mock_trajectory_reads_remaining = 0
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
                self._vendor_event_callback = None
                self._pending_event_callback = None
                self._pending_event_callback_marker = None
            robot: Any | None = None
            try:
                mode = getattr(rm_thread_mode_e, self.thread_mode)
                robot = RoboticArm(mode)
                handle = robot.rm_create_robot_arm(self.ip, self.port)
                connected = _is_valid_handle(handle)
                if not connected:
                    # A create call may return an object even when the API2
                    # handle is invalid. Release that native object before
                    # exposing the failed connection to any later call.
                    try:
                        if handle is not None:
                            robot.rm_delete_robot_arm()
                    except Exception:
                        pass
                    try:
                        robot.rm_destroy()
                    except Exception:
                        pass
                    with self._lock:
                        if self._generation == generation:
                            self._robot = None
                            self._handle = None
                            self._connected = False
                            self._set_failure_locked(
                                -1, "SDK returned an invalid robot handle"
                            )
                    return -1
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
            if mock_mode or robot is None:
                self._robot = None
                self._handle = None
                self._event_callback = None
                self._vendor_event_callback = None
                self._pending_event_callback = None
                self._pending_event_callback_marker = None
                self._mock_trajectory_active = False
                self._mock_trajectory_reads_remaining = 0
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
            self._event_callback = None
            self._vendor_event_callback = None
            self._pending_event_callback = None
            self._pending_event_callback_marker = None
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
        if self.mock_mode:
            callback: Callable[[Any], Any] | None = None
            event: dict[str, Any] | None = None
            with self._lock:
                status = self._ready_status_locked()
                if status is not None:
                    return status, None
                if not self._mock_trajectory_active:
                    return {"trajectory_type": 0}
                if self._mock_trajectory_reads_remaining > 0:
                    self._mock_trajectory_reads_remaining -= 1
                    return {"trajectory_type": 1}
                self._mock_trajectory_active = False
                callback = self._event_callback
                event = {
                    "event_type": 1,
                    "device": 0,
                    "trajectory_state": True,
                    "trajectory_connect": 0,
                }
            if callback is not None and event is not None:
                try:
                    callback(event)
                except Exception:
                    pass
            return {"trajectory_type": 0}
        return self._query(
            "rm_get_arm_current_trajectory", "SDK trajectory query failed", mock_success={}
        )

    def current_arm_state(self) -> Any:
        return self._query("rm_get_current_arm_state", "SDK arm state query failed")

    def forward_kinematics(self, joint_degrees: list[float]) -> tuple[int, list[float]]:
        """Return the SDK FK pose as ``[x,y,z,rx,ry,rz]`` in m/rad."""
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is not None:
                    return status, []
                return 0, [0.0] * 6
        result, token, error, _, readiness_status = self._invoke_vendor(
            "rm_algo_forward_kinematics", (list(joint_degrees), 1)
        )
        if readiness_status is not None:
            return readiness_status, []
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1, []
        try:
            pose = [float(value) for value in result]
        except (TypeError, ValueError):
            pose = []
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return -1, []
            if len(pose) != 6 or not all(math.isfinite(value) for value in pose):
                self._set_failure_locked(-1, "SDK returned an invalid FK pose")
                return -1, []
            self._set_success_locked()
        return 0, pose

    def inverse_kinematics(
        self, seed_joint_degrees: list[float], pose_euler_rad: list[float]
    ) -> tuple[int, list[float]]:
        """Solve SDK IK from a degree seed and an m/rad Euler pose."""
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is not None:
                    return status, []
                return 0, list(seed_joint_degrees)
        try:
            from Robotic_Arm.rm_robot_interface import rm_inverse_kinematics_params_t

            params = rm_inverse_kinematics_params_t(
                list(seed_joint_degrees), list(pose_euler_rad), 1
            )
        except Exception as error:
            with self._lock:
                self._set_failure_locked(-1, str(error))
            return -1, []
        result, token, error, _, readiness_status = self._invoke_vendor(
            "rm_algo_inverse_kinematics", (params,)
        )
        if readiness_status is not None:
            return readiness_status, []
        if error is not None:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1, []
        try:
            status, joints = _unpack_result(result)
            values = [float(value) for value in joints]
        except (TypeError, ValueError):
            status, values = -1, []
        with self._lock:
            if token is None or not self._call_matches_locked(token):
                return -1, []
            if status != 0:
                self._set_failure_locked(status, "SDK inverse kinematics request failed")
                return status, []
            if len(values) != 6 or not all(math.isfinite(value) for value in values):
                self._set_failure_locked(-1, "SDK returned an invalid IK solution")
                return -1, []
            self._set_success_locked()
        return 0, values

    def register_event_callback(self, callback: Callable[[Any], Any]) -> int:
        with self._lock:
            if self.mock_mode:
                status = self._ready_status_locked()
                if status is not None:
                    return status
                self._event_callback = callback
                self._set_success_locked()
                return 0
            status = self._ready_status_locked()
            if status is not None:
                return status
            pending_marker = object()
            self._pending_event_callback = callback
            self._pending_event_callback_marker = pending_marker
            robot = self._robot
        try:
            vendor_callback = _vendor_event_callback(robot, callback)
        except Exception as error:
            with self._lock:
                self._clear_pending_event_callback_locked(pending_marker)
                self._set_failure_locked(-1, str(error))
            return -1
        result, token, error, _, readiness_status = self._invoke_vendor(
            "rm_get_arm_event_call_back", (vendor_callback,)
        )
        if readiness_status is not None:
            with self._lock:
                self._clear_pending_event_callback_locked(pending_marker)
            return readiness_status
        if error is not None:
            with self._lock:
                self._clear_pending_event_callback_locked(pending_marker)
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, str(error))
            return -1
        status = _status_code(result)
        with self._lock:
            # Re-check identity after the vendor call. A disconnect may have
            # drained this call and a reconnect may already own the adapter.
            if token is None or not self._call_matches_locked(token):
                self._clear_pending_event_callback_locked(pending_marker)
                return -1
            if status == 0:
                self._event_callback = callback
                self._vendor_event_callback = vendor_callback
                self._set_success_locked()
            else:
                self._set_failure_locked(status, "SDK event callback registration failed")
            self._clear_pending_event_callback_locked(pending_marker)
        return status

    def _clear_pending_event_callback_locked(self, marker: object) -> None:
        if self._pending_event_callback_marker is marker:
            self._pending_event_callback = None
            self._pending_event_callback_marker = None

    def current_tool_frame(self) -> Any:
        with self._lock:
            if self.mock_mode and self._connected:
                if self._mock_tool_frame is None:
                    self._set_failure_locked(-1, "mock tool coordinate profile is not configured")
                    return -1, None
                return 0, self._mock_tool_frame
        return self._coordinate_query(
            "rm_get_current_tool_frame", "SDK tool frame query failed", is_tool=True
        )

    def current_work_frame(self) -> Any:
        with self._lock:
            if self.mock_mode and self._connected:
                if self._mock_work_frame is None:
                    self._set_failure_locked(-1, "mock work coordinate profile is not configured")
                    return -1, None
                return 0, self._mock_work_frame
        return self._coordinate_query(
            "rm_get_current_work_frame", "SDK work frame query failed", is_tool=False
        )

    def configure_mock_coordinate_profile(self, profile: Any) -> None:
        """Seed deterministic full-frame readback for the selected arm profile."""
        tool_frames = {
            frame.controller_name: _controller_frame_from_profile(frame, is_tool=True)
            for frame in profile.tools.values()
        }
        work_frames = {
            frame.controller_name: _controller_frame_from_profile(frame, is_tool=False)
            for frame in profile.works.values()
        }
        default_tool = profile.tools[profile.tool_default].controller_name
        default_work = profile.works[profile.work_default].controller_name
        with self._lock:
            self._mock_tool_frames = tool_frames
            self._mock_work_frames = work_frames
            self._mock_tool_frame = tool_frames[default_tool]
            self._mock_work_frame = work_frames[default_work]

    def set_tool_frame(self, frame: Any) -> int:
        with self._lock:
            status = self._ready_status_locked()
            mock_mode = self.mock_mode
        if status is not None:
            return status
        try:
            controller_frame = _controller_frame_from_profile(frame, is_tool=True)
        except Exception as error:
            with self._lock:
                self._set_failure_locked(-1, str(error))
            return -1
        if mock_mode:
            with self._lock:
                if not self._connected:
                    self._set_failure_locked(-1, "robot is not connected")
                    return -1
                self._mock_tool_frames[controller_frame.controller_name] = controller_frame
                self._mock_tool_frame = controller_frame
                self._set_success_locked()
                return 0
        try:
            vendor_frame = _vendor_tool_frame(controller_frame)
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
            result_status = self._finish_command_locked(
                result, "SDK tool frame create failed"
            )
        if result_status == 1:
            return self._command(
                "rm_update_tool_frame",
                "SDK tool frame update failed",
                vendor_frame,
            )
        return result_status

    def set_work_frame(self, frame: Any) -> int:
        with self._lock:
            status = self._ready_status_locked()
            mock_mode = self.mock_mode
        if status is not None:
            return status
        try:
            controller_frame = _controller_frame_from_profile(frame, is_tool=False)
            pose = [
                *controller_frame.xyz_m,
                *_euler_from_quaternion(controller_frame.quaternion_wxyz),
            ]
            if mock_mode:
                with self._lock:
                    if not self._connected:
                        self._set_failure_locked(-1, "robot is not connected")
                        return -1
                    self._mock_work_frames[controller_frame.controller_name] = controller_frame
                    self._mock_work_frame = controller_frame
                    self._set_success_locked()
                    return 0
            result, token, error, _, readiness_status = self._invoke_vendor(
                "rm_set_manual_work_frame", (controller_frame.controller_name, pose)
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
            result_status = self._finish_command_locked(
                result, "SDK work frame create failed"
            )
        if result_status == 1:
            return self._command(
                "rm_update_work_frame",
                "SDK work frame update failed",
                controller_frame.controller_name,
                pose,
            )
        return result_status

    def change_tool_frame(self, controller_name: str) -> int:
        with self._lock:
            if self.mock_mode and controller_name not in self._mock_tool_frames:
                self._set_failure_locked(-1, f"unknown mock tool frame: {controller_name}")
                return -1
        status = self._command(
            "rm_change_tool_frame", "SDK tool frame selection failed", controller_name
        )
        with self._lock:
            if status == 0 and self.mock_mode:
                self._mock_tool_frame = self._mock_tool_frames[controller_name]
        return status

    def change_work_frame(self, controller_name: str) -> int:
        with self._lock:
            if self.mock_mode and controller_name not in self._mock_work_frames:
                self._set_failure_locked(-1, f"unknown mock work frame: {controller_name}")
                return -1
        status = self._command(
            "rm_change_work_frame", "SDK work frame selection failed", controller_name
        )
        with self._lock:
            if status == 0 and self.mock_mode:
                self._mock_work_frame = self._mock_work_frames[controller_name]
        return status

    def _coordinate_query(
        self, method_name: str, failure_message: str, *, is_tool: bool
    ) -> tuple[int, ControllerFrame | None]:
        result = self._query(method_name, failure_message)
        try:
            status, frame = _unpack_result(result)
        except Exception:
            with self._lock:
                self._set_failure_locked(-1, failure_message)
            return -1, None
        if status != 0:
            return status, None
        try:
            return 0, _controller_frame_from_vendor(frame, is_tool=is_tool)
        except (AttributeError, TypeError, ValueError) as error:
            with self._lock:
                self._set_failure_locked(-1, f"{failure_message}: {error}")
            return -1, None

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
                    if method_name in {"rm_movej", "rm_movel", "rm_movej_p"}:
                        self._mock_trajectory_active = True
                        self._mock_trajectory_reads_remaining = 1
                    elif method_name in {
                        "rm_set_arm_stop",
                        "rm_set_arm_slow_stop",
                        "rm_set_delete_current_trajectory",
                        "rm_set_arm_delete_trajectory",
                    }:
                        self._mock_trajectory_active = False
                        self._mock_trajectory_reads_remaining = 0
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
        try:
            result_status, _ = _unpack_result(result)
        except Exception:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, failure_message)
            return -1, None
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

        try:
            status, data = _unpack_result(result)
        except Exception:
            with self._lock:
                if token is not None and self._call_matches_locked(token):
                    self._set_failure_locked(-1, "SDK joint state request failed")
                    return RobotState((), self._connected, self.robot_model, -1)
            return RobotState((), False, self.robot_model, -1)
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


def _controller_frame_from_profile(frame: Any, *, is_tool: bool) -> ControllerFrame:
    if is_tool:
        controller_name = str(frame.controller_name)
    xyz_m = _finite_vector(frame.xyz_m, 3, "xyz_m")
    quaternion_wxyz = (
        _unit_quaternion(frame.quaternion_wxyz)
        if is_tool
        else _normalized_quaternion(frame.quaternion_wxyz)
    )
    if is_tool:
        payload_kg = _finite_scalar(frame.payload_kg, "payload", minimum=0.0)
        center_of_mass_m = _finite_vector(
            frame.center_of_mass_m, 3, "center_of_mass_m"
        )
    else:
        controller_name = str(frame.controller_name)
        payload_kg = None
        center_of_mass_m = None
    return ControllerFrame(
        controller_name=controller_name,
        xyz_m=xyz_m,
        quaternion_wxyz=quaternion_wxyz,
        payload_kg=payload_kg,
        center_of_mass_m=center_of_mass_m,
    )


def _controller_frame_from_vendor(frame: Any, *, is_tool: bool) -> ControllerFrame:
    name_value = _optional_field(frame, "frame_name")
    if name_value is None:
        name_value = _field(frame, "name")
    if isinstance(name_value, bytes):
        controller_name = name_value.split(b"\0", 1)[0].decode("ascii")
    elif isinstance(name_value, str):
        controller_name = name_value
    else:
        raise ValueError("frame_name must be an ASCII string")
    if not controller_name or not controller_name.isascii():
        raise ValueError("frame_name must be a non-empty ASCII string")

    pose = _field(frame, "pose")
    if isinstance(pose, (list, tuple)):
        values = _finite_vector(pose, 6, "pose")
        xyz_m = values[:3]
        quaternion_wxyz = _quaternion_from_euler(*values[3:])
    else:
        position = _field(pose, "position")
        xyz_m = _finite_vector(
            tuple(_field(position, axis) for axis in ("x", "y", "z")),
            3,
            "pose.position",
        )
        quaternion = _optional_field(pose, "quaternion")
        if quaternion is not None:
            quaternion_wxyz = _normalized_quaternion(
                tuple(_field(quaternion, axis) for axis in ("w", "x", "y", "z"))
            )
        else:
            euler = _field(pose, "euler")
            quaternion_wxyz = _quaternion_from_euler(
                *tuple(_field(euler, axis) for axis in ("rx", "ry", "rz"))
            )

    if is_tool:
        payload_kg = _finite_scalar(_field(frame, "payload"), "payload", minimum=0.0)
        center_of_mass_m = _finite_vector(
            tuple(_field(frame, axis) for axis in ("x", "y", "z")),
            3,
            "center_of_mass_m",
        )
    else:
        payload_kg = None
        center_of_mass_m = None
    return ControllerFrame(
        controller_name,
        xyz_m,
        quaternion_wxyz,
        payload_kg,
        center_of_mass_m,
    )


def _field(value: Any, name: str) -> Any:
    result = _optional_field(value, name)
    if result is None:
        raise ValueError(f"missing {name}")
    return result


def _optional_field(value: Any, name: str) -> Any:
    if isinstance(value, dict):
        return value.get(name)
    return getattr(value, name, None)


def _finite_scalar(value: Any, context: str, *, minimum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{context} must be a finite number")
    result = float(value)
    if not math.isfinite(result):
        raise ValueError(f"{context} must be a finite number")
    if minimum is not None and result < minimum:
        raise ValueError(f"{context} must be at least {minimum}")
    return result


def _finite_vector(value: Any, length: int, context: str) -> tuple[float, ...]:
    if not isinstance(value, (list, tuple)) or len(value) != length:
        raise ValueError(f"{context} must contain exactly {length} values")
    return tuple(_finite_scalar(item, context) for item in value)


def _normalized_quaternion(value: Any) -> tuple[float, float, float, float]:
    quaternion = _finite_vector(value, 4, "quaternion")
    scale = max(abs(component) for component in quaternion)
    if scale == 0.0:
        raise ValueError("quaternion must have non-zero norm")
    scaled = tuple(component / scale for component in quaternion)
    norm = math.sqrt(sum(component * component for component in scaled))
    return tuple(component / norm for component in scaled)  # type: ignore[return-value]


def _unit_quaternion(value: Any) -> tuple[float, float, float, float]:
    quaternion = _finite_vector(value, 4, "quaternion")
    norm = math.sqrt(sum(component * component for component in quaternion))
    if norm == 0.0:
        raise ValueError("quaternion must have non-zero norm")
    if not math.isclose(norm, 1.0, rel_tol=0.0, abs_tol=1.0e-6):
        raise ValueError("quaternion must be unit length")
    return tuple(component / norm for component in quaternion)  # type: ignore[return-value]


def _quaternion_from_euler(
    roll: Any, pitch: Any, yaw: Any
) -> tuple[float, float, float, float]:
    rx, ry, rz = (
        _finite_scalar(value, "pose.euler") for value in (roll, pitch, yaw)
    )
    cr, sr = math.cos(rx / 2.0), math.sin(rx / 2.0)
    cp, sp = math.cos(ry / 2.0), math.sin(ry / 2.0)
    cy, sy = math.cos(rz / 2.0), math.sin(rz / 2.0)
    return _normalized_quaternion(
        (
            cr * cp * cy + sr * sp * sy,
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
        )
    )


def _euler_from_quaternion(
    quaternion_wxyz: Any,
) -> tuple[float, float, float]:
    w, x, y, z = _normalized_quaternion(quaternion_wxyz)
    roll = math.atan2(2.0 * (w * x + y * z), 1.0 - 2.0 * (x * x + y * y))
    pitch_sine = 2.0 * (w * y - z * x)
    pitch = math.asin(max(-1.0, min(1.0, pitch_sine)))
    yaw = math.atan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z))
    return roll, pitch, yaw


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


def _vendor_event_callback(
    robot: Any | None, callback: Callable[[Any], Any]
) -> Any:
    """Adapt the Python callback to the SDK's ctypes callback ABI.

    The vendor wrapper declares ``rm_event_callback_ptr`` as the argument type;
    passing a regular bound method raises a ctypes ``TypeError`` at runtime.
    Keep fake SDKs and mock adapters on the direct callback path so tests remain
    independent of the optional vendor package.
    """
    module_name = getattr(type(robot), "__module__", "")
    if not module_name.startswith("Robotic_Arm"):
        return callback

    from Robotic_Arm.rm_ctypes_wrap import rm_event_callback_ptr

    def bridge(event: Any) -> None:
        try:
            callback(_event_to_mapping(event))
        except Exception:
            # Exceptions must not cross the ctypes callback boundary.
            pass

    return rm_event_callback_ptr(bridge)


def _event_to_mapping(event: Any) -> dict[str, Any]:
    """Convert the vendor event structure into the coordinator's neutral shape."""
    fields = (
        "handle_id",
        "event_type",
        "trajectory_state",
        "device",
        "trajectory_connect",
        "program_id",
    )
    return {field: getattr(event, field) for field in fields}


def _unpack_result(result: Any) -> tuple[int, Any]:
    if isinstance(result, (tuple, list)):
        if len(result) < 2:
            raise ValueError("SDK query result must contain status and data")
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
