"""Validated desired coordinate profiles and explicit controller-frame policy.

The adapter seam deliberately accepts simple duck-typed methods so this module
does not import the RealMan SDK. An adapter declares one ``arm_id`` and never
accepts an arm argument for controller calls. Reads may return ``(status,
frame)`` or a frame value; writes may return an API2 integer status. Missing
methods and exceptions become status ``-1``, an unmatched verification, and
blocked motion.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from pathlib import Path
import re
from types import MappingProxyType
from typing import Any, Callable, Mapping, Protocol

import yaml


_ARMS = frozenset({"l", "m", "r"})
_CONTROLLER_NAME = re.compile(r"^[A-Za-z0-9_-]{1,9}$")
_ROS_FRAME_ID = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(?:/[A-Za-z][A-Za-z0-9_]*)*$")
_LINEAR_TOLERANCE_M = 1.0e-5
_TOOL_ORIENTATION_TOLERANCE_RAD = 1.0e-5
# The controller's documented Euler readback precision is about 0.001 rad.
_WORK_ORIENTATION_TOLERANCE_RAD = 1.5e-3
_PAYLOAD_TOLERANCE_KG = 1.0e-4


@dataclass(frozen=True)
class CoordinatePolicy:
    on_start: str
    on_mismatch: str


@dataclass(frozen=True)
class ToolFrame:
    controller_name: str
    ros_frame_id: str
    xyz_m: tuple[float, float, float]
    quaternion_wxyz: tuple[float, float, float, float]
    payload_kg: float
    center_of_mass_m: tuple[float, float, float]


@dataclass(frozen=True)
class WorkFrame:
    controller_name: str
    ros_frame_id: str
    xyz_m: tuple[float, float, float]
    quaternion_wxyz: tuple[float, float, float, float]


@dataclass(frozen=True)
class ControllerFrame:
    """Canonical, SDK-neutral coordinate frame returned by an adapter."""

    controller_name: str
    xyz_m: tuple[float, float, float]
    quaternion_wxyz: tuple[float, float, float, float]
    payload_kg: float | None
    center_of_mass_m: tuple[float, float, float] | None


@dataclass(frozen=True)
class ArmCoordinateDefaults:
    tool_default: str
    work_default: str
    tools: Mapping[str, ToolFrame]
    works: Mapping[str, WorkFrame]


@dataclass(frozen=True)
class CoordinateVerification:
    arm: str
    expected_tool: str
    current_tool: str | None
    expected_work: str
    current_work: str | None
    tool_matched: bool
    work_matched: bool
    matched: bool
    status: int
    message: str


class CoordinateAdapter(Protocol):
    """Minimal seam to be implemented by the node's controller adapter."""

    arm_id: str

    def current_tool_frame(self) -> Any: ...

    def current_work_frame(self) -> Any: ...

    def set_tool_frame(self, frame: ToolFrame) -> Any: ...

    def set_work_frame(self, frame: WorkFrame) -> Any: ...

    def change_tool_frame(self, controller_name: str) -> Any: ...

    def change_work_frame(self, controller_name: str) -> Any: ...


class CoordinateManager:
    """Own desired coordinate profiles and the read-before-motion safety state."""

    def __init__(
        self,
        policy: CoordinatePolicy,
        profiles: Mapping[str, ArmCoordinateDefaults],
        *,
        is_arm_busy: Callable[[str], bool] | None = None,
        acquire_arm: Callable[[str], bool] | None = None,
        release_arm: Callable[[str], None] | None = None,
    ) -> None:
        if (acquire_arm is None) != (release_arm is None):
            raise ValueError("acquire_arm and release_arm must be configured together")
        self.policy = policy
        self.profiles = MappingProxyType(dict(profiles))
        self._is_arm_busy = is_arm_busy or (lambda _arm: False)
        self._acquire_arm = acquire_arm
        self._release_arm = release_arm
        self._selected_tools = {arm: profile.tool_default for arm, profile in profiles.items()}
        self._selected_works = {arm: profile.work_default for arm, profile in profiles.items()}
        # Every arm starts blocked until a successful readback proves its profile.
        self._motion_allowed = {arm: False for arm in profiles}

    @classmethod
    def from_yaml(
        cls,
        path: str | Path,
        *,
        is_arm_busy: Callable[[str], bool] | None = None,
        acquire_arm: Callable[[str], bool] | None = None,
        release_arm: Callable[[str], None] | None = None,
    ) -> "CoordinateManager":
        with Path(path).open(encoding="utf-8") as stream:
            data = yaml.safe_load(stream)
        if not isinstance(data, dict):
            raise ValueError("coordinate profile must be a YAML mapping")
        _expect_keys(data, {"version", "policy", "robots"}, "root")
        if data.get("version") != 1:
            raise ValueError("coordinate profile version must be 1")

        policy_data = _mapping(data.get("policy"), "policy")
        _expect_keys(policy_data, {"on_start", "on_mismatch"}, "policy")
        policy = CoordinatePolicy(
            on_start=_required_string(policy_data, "on_start", "policy"),
            on_mismatch=_required_string(policy_data, "on_mismatch", "policy"),
        )
        if policy.on_start not in {"verify", "apply"}:
            raise ValueError("policy.on_start must be 'verify' or 'apply'")
        if policy.on_mismatch != "block_motion":
            raise ValueError("policy.on_mismatch must be 'block_motion'")

        robots = _mapping(data.get("robots"), "robots")
        robot_ids = set(robots)
        if robot_ids != _ARMS:
            missing = sorted(_ARMS - robot_ids)
            extra = sorted(robot_ids - _ARMS)
            raise ValueError(f"robots must contain exactly l, m, r; missing={missing} extra={extra}")

        profiles: dict[str, ArmCoordinateDefaults] = {}
        ros_frame_ids: set[str] = set()
        for arm in sorted(_ARMS):
            profile, frame_ids = _profile_from_data(arm, _mapping(robots[arm], f"robots.{arm}"))
            duplicate_ids = ros_frame_ids.intersection(frame_ids)
            if duplicate_ids:
                raise ValueError(f"ros_frame_id values must be unique: {sorted(duplicate_ids)}")
            ros_frame_ids.update(frame_ids)
            profiles[arm] = profile
        return cls(
            policy,
            profiles,
            is_arm_busy=is_arm_busy,
            acquire_arm=acquire_arm,
            release_arm=release_arm,
        )

    def verify(
        self,
        adapter: CoordinateAdapter,
        arm: str,
        *,
        verified_result_callback: Callable[[CoordinateVerification], None] | None = None,
    ) -> CoordinateVerification:
        """Read controller frame selection and update the motion permission state."""
        profile = self._profile(arm)
        desired_tool = profile.tools[self._selected_tools[arm]]
        desired_work = profile.works[self._selected_works[arm]]
        expected_tool = desired_tool.controller_name
        expected_work = desired_work.controller_name
        identity_error = _adapter_identity_error(adapter, arm)
        if identity_error:
            return self._failure(arm, -1, identity_error)
        tool_status, tool_frame, tool_error = _read_frame(
            adapter, "current_tool_frame", "tool"
        )
        work_status, work_frame, work_error = _read_frame(
            adapter, "current_work_frame", "work"
        )
        status = _first_error(tool_status, work_status)
        current_tool = tool_frame.controller_name if tool_frame is not None else None
        current_work = work_frame.controller_name if work_frame is not None else None
        tool_mismatches = (
            _frame_mismatches("tool", desired_tool, tool_frame, include_payload=True)
            if tool_status == 0 and tool_frame is not None
            else []
        )
        work_mismatches = (
            _frame_mismatches("work", desired_work, work_frame, include_payload=False)
            if work_status == 0 and work_frame is not None
            else []
        )
        tool_matched = tool_status == 0 and not tool_mismatches
        work_matched = work_status == 0 and not work_mismatches
        matched = tool_matched and work_matched
        self._motion_allowed[arm] = matched
        if matched:
            message = "controller tool and work frames match the desired profile"
        elif status != 0:
            message = "; ".join(error for error in (tool_error, work_error) if error)
        else:
            mismatch_fields = ", ".join((*tool_mismatches, *work_mismatches))
            message = (
                f"frame mismatch ({mismatch_fields}): expected tool={expected_tool} "
                f"work={expected_work}; current tool={current_tool} work={current_work}"
            )
        result = CoordinateVerification(
            arm,
            expected_tool,
            current_tool,
            expected_work,
            current_work,
            tool_matched,
            work_matched,
            matched,
            status,
            message,
        )
        return self._publish_verified_result(arm, result, verified_result_callback)

    def apply(
        self,
        adapter: CoordinateAdapter,
        arm: str,
        *,
        verified_result_callback: Callable[[CoordinateVerification], None] | None = None,
    ) -> CoordinateVerification:
        """Explicitly write and select the arm defaults, then read them back."""
        profile = self._profile(arm)
        def operation() -> CoordinateVerification:
            identity_error = _adapter_identity_error(adapter, arm)
            if identity_error:
                return self._failure(arm, -1, identity_error)
            self._selected_tools[arm] = profile.tool_default
            self._selected_works[arm] = profile.work_default
            operations = (
                ("set_tool_frame", profile.tools[profile.tool_default]),
                ("set_work_frame", profile.works[profile.work_default]),
                ("change_tool_frame", profile.tools[profile.tool_default].controller_name),
                ("change_work_frame", profile.works[profile.work_default].controller_name),
            )
            for method_name, value in operations:
                status, error = _write_frame(adapter, method_name, value)
                if status != 0:
                    self._motion_allowed[arm] = False
                    return self._failure(arm, status, error)
            return self.verify(adapter, arm)

        return self._run_mutation(arm, operation, verified_result_callback)

    def select_tool(
        self,
        adapter: CoordinateAdapter,
        arm: str,
        name: str,
        *,
        verified_result_callback: Callable[[CoordinateVerification], None] | None = None,
    ) -> CoordinateVerification:
        """Select a configured tool only while the ownership callback says arm is idle."""
        profile = self._profile(arm)
        if name not in profile.tools:
            return self._failure(arm, -1, f"unknown configured tool frame: {name}")
        def operation() -> CoordinateVerification:
            identity_error = _adapter_identity_error(adapter, arm)
            if identity_error:
                return self._failure(arm, -1, identity_error)
            status, error = _write_frame(adapter, "change_tool_frame", profile.tools[name].controller_name)
            if status != 0:
                return self._failure(arm, status, error)
            self._selected_tools[arm] = name
            return self.verify(adapter, arm)

        return self._run_mutation(arm, operation, verified_result_callback)

    def select_work(
        self,
        adapter: CoordinateAdapter,
        arm: str,
        name: str,
        *,
        verified_result_callback: Callable[[CoordinateVerification], None] | None = None,
    ) -> CoordinateVerification:
        """Select a configured work frame only while the ownership callback says arm is idle."""
        profile = self._profile(arm)
        if name not in profile.works:
            return self._failure(arm, -1, f"unknown configured work frame: {name}")
        def operation() -> CoordinateVerification:
            identity_error = _adapter_identity_error(adapter, arm)
            if identity_error:
                return self._failure(arm, -1, identity_error)
            status, error = _write_frame(adapter, "change_work_frame", profile.works[name].controller_name)
            if status != 0:
                return self._failure(arm, status, error)
            self._selected_works[arm] = name
            return self.verify(adapter, arm)

        return self._run_mutation(arm, operation, verified_result_callback)

    def motion_allowed(self, arm: str) -> bool:
        """Return true only after a successful verification of current selections."""
        self._profile(arm)
        return self._motion_allowed[arm]

    def fail_closed(
        self, arm: str, message: str, *, status: int = -1
    ) -> CoordinateVerification:
        """Invalidate an arm after an ownership or publication boundary failure."""
        return self._failure(arm, status, message)

    def _acquire_mutation(self, arm: str) -> str:
        if self._acquire_arm is None or self._release_arm is None:
            if self._is_arm_busy(arm):
                return f"arm {arm} is busy; coordinate mutation refused"
            return f"arm {arm} atomic ownership is not configured; coordinate mutation refused"
        try:
            acquired = self._acquire_arm(arm)
        except Exception as error:
            return f"arm {arm} ownership acquire failed: {error}"
        if not acquired:
            return f"arm {arm} is busy; coordinate mutation refused"
        return ""

    def _run_mutation(
        self,
        arm: str,
        operation: Callable[[], CoordinateVerification],
        verified_result_callback: Callable[[CoordinateVerification], None] | None,
    ) -> CoordinateVerification:
        ownership_error = self._acquire_mutation(arm)
        if ownership_error:
            return self._failure(arm, -1, ownership_error)

        release_error: Exception | None = None
        try:
            try:
                result = operation()
            except Exception as error:
                result = self._failure(arm, -1, f"coordinate mutation failed: {error}")
            result = self._publish_verified_result(
                arm, result, verified_result_callback
            )
        finally:
            try:
                self._release_mutation(arm)
            except Exception as error:
                release_error = error

        if release_error is not None:
            return self._failure(arm, -1, f"ownership release failed: {release_error}")
        return result

    def _publish_verified_result(
        self,
        arm: str,
        result: CoordinateVerification,
        callback: Callable[[CoordinateVerification], None] | None,
    ) -> CoordinateVerification:
        if callback is None:
            return result
        try:
            callback(result)
        except Exception as error:
            return self._failure(
                arm, -1, f"coordinate result publication failed: {error}"
            )
        return result

    def _release_mutation(self, arm: str) -> None:
        assert self._release_arm is not None
        self._release_arm(arm)

    def _profile(self, arm: str) -> ArmCoordinateDefaults:
        if arm not in self.profiles:
            raise ValueError(f"unknown arm: {arm}")
        return self.profiles[arm]

    def _failure(self, arm: str, status: int, message: str) -> CoordinateVerification:
        profile = self._profile(arm)
        self._motion_allowed[arm] = False
        return CoordinateVerification(
            arm,
            profile.tools[self._selected_tools[arm]].controller_name,
            None,
            profile.works[self._selected_works[arm]].controller_name,
            None,
            False,
            False,
            False,
            status,
            message,
        )


def _profile_from_data(
    arm: str, data: Mapping[str, Any]
) -> tuple[ArmCoordinateDefaults, set[str]]:
    _expect_keys(
        data,
        {"default_tool", "default_work", "tools", "work_frames"},
        f"robots.{arm}",
    )
    tool_default = _required_string(data, "default_tool", f"robots.{arm}")
    work_default = _required_string(data, "default_work", f"robots.{arm}")
    tool_data = _mapping(data.get("tools"), f"robots.{arm}.tools")
    work_data = _mapping(data.get("work_frames"), f"robots.{arm}.work_frames")
    if not tool_data or not work_data:
        raise ValueError(f"robots.{arm} requires non-empty tools and work_frames")
    _expect_frame_aliases(tool_data, f"robots.{arm}.tools")
    _expect_frame_aliases(work_data, f"robots.{arm}.work_frames")

    tools = {
        name: _tool_frame(arm, name, _mapping(value, f"robots.{arm}.tools.{name}"))
        for name, value in tool_data.items()
    }
    works = {
        name: _work_frame(arm, name, _mapping(value, f"robots.{arm}.work_frames.{name}"))
        for name, value in work_data.items()
    }
    _expect_unique_controller_names(tools, f"robots.{arm}.tools")
    _expect_unique_controller_names(works, f"robots.{arm}.work_frames")
    if tool_default not in tools:
        raise ValueError(f"robots.{arm}.default_tool is not a configured tool frame")
    if work_default not in works:
        raise ValueError(f"robots.{arm}.default_work is not a configured work frame")
    frame_ids = [frame.ros_frame_id for frame in (*tools.values(), *works.values())]
    if len(frame_ids) != len(set(frame_ids)):
        raise ValueError(f"robots.{arm} ros_frame_id values must be unique")
    return (
        ArmCoordinateDefaults(
            tool_default,
            work_default,
            MappingProxyType(tools),
            MappingProxyType(works),
        ),
        set(frame_ids),
    )


def _tool_frame(arm: str, name: str, data: Mapping[str, Any]) -> ToolFrame:
    _expect_keys(
        data,
        {"controller_name", "ros_frame_id", "pose", "payload_kg", "center_of_mass_m"},
        f"tools.{name}",
    )
    pose = _mapping(data.get("pose"), f"tools.{name}.pose")
    _expect_keys(pose, {"xyz_m", "quaternion_wxyz"}, f"tools.{name}.pose")
    return ToolFrame(
        _controller_name(data, arm, name),
        _ros_frame_id(data, arm, name),
        _finite_vector(pose.get("xyz_m"), 3, f"tools.{name}.pose.xyz_m"),
        _quaternion(pose.get("quaternion_wxyz"), f"tools.{name}.pose.quaternion_wxyz"),
        _finite_scalar(data.get("payload_kg"), f"tools.{name}.payload_kg", minimum=0.0),
        _finite_vector(data.get("center_of_mass_m"), 3, f"tools.{name}.center_of_mass_m"),
    )


def _work_frame(arm: str, name: str, data: Mapping[str, Any]) -> WorkFrame:
    _expect_keys(data, {"controller_name", "ros_frame_id", "pose"}, f"work_frames.{name}")
    pose = _mapping(data.get("pose"), f"work_frames.{name}.pose")
    _expect_keys(pose, {"xyz_m", "quaternion_wxyz"}, f"work_frames.{name}.pose")
    return WorkFrame(
        _controller_name(data, arm, name),
        _ros_frame_id(data, arm, name),
        _finite_vector(pose.get("xyz_m"), 3, f"work_frames.{name}.pose.xyz_m"),
        _quaternion(pose.get("quaternion_wxyz"), f"work_frames.{name}.pose.quaternion_wxyz"),
    )


def _controller_name(data: Mapping[str, Any], arm: str, name: str) -> str:
    value = _required_string(data, "controller_name", name)
    if not _CONTROLLER_NAME.fullmatch(value):
        raise ValueError(
            f"{arm}.{name}.controller_name must be 1-9 ASCII letters, digits, '_' or '-'"
        )
    return value


def _ros_frame_id(data: Mapping[str, Any], arm: str, name: str) -> str:
    value = _required_string(data, "ros_frame_id", name)
    if not _ROS_FRAME_ID.fullmatch(value) or not value.startswith(f"{arm}/"):
        raise ValueError(f"{arm}.{name}.ros_frame_id must be namespaced as '{arm}/...'")
    return value


def _mapping(value: Any, context: str) -> Mapping[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{context} must be a mapping")
    return value


def _expect_keys(data: Mapping[Any, Any], allowed: set[str], context: str) -> None:
    unknown = [repr(key) for key in data if key not in allowed]
    if unknown:
        raise ValueError(f"{context} contains unknown key(s): {', '.join(sorted(unknown))}")


def _expect_frame_aliases(data: Mapping[Any, Any], context: str) -> None:
    for alias in data:
        if not isinstance(alias, str) or not _CONTROLLER_NAME.fullmatch(alias):
            raise ValueError(
                f"{context} frame alias must be a non-empty 1-9 character ASCII string"
            )


def _expect_unique_controller_names(
    frames: Mapping[str, ToolFrame] | Mapping[str, WorkFrame],
    context: str,
) -> None:
    controller_names = [frame.controller_name for frame in frames.values()]
    duplicates = sorted(
        {name for name in controller_names if controller_names.count(name) > 1}
    )
    if duplicates:
        raise ValueError(
            f"{context} controller_name values must be unique: {', '.join(duplicates)}"
        )


def _required_string(data: Mapping[str, Any], key: str, context: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value:
        raise ValueError(f"{context}.{key} must be a non-empty string")
    return value


def _finite_scalar(value: Any, context: str, *, minimum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError(f"{context} must be a finite number")
    result = float(value)
    if minimum is not None and result < minimum:
        raise ValueError(f"{context} must be at least {minimum}")
    return result


def _finite_vector(value: Any, length: int, context: str) -> tuple[float, ...]:
    if not isinstance(value, (list, tuple)) or len(value) != length:
        raise ValueError(f"{context} must contain exactly {length} values")
    return tuple(_finite_scalar(item, context) for item in value)


def _quaternion(value: Any, context: str) -> tuple[float, float, float, float]:
    quaternion = _finite_vector(value, 4, context)
    scale = max(abs(component) for component in quaternion)
    if scale == 0.0:
        raise ValueError(f"{context} quaternion must have non-zero norm")
    scaled = tuple(component / scale for component in quaternion)
    norm = math.sqrt(sum(component * component for component in scaled))
    return tuple(component / norm for component in scaled)  # type: ignore[return-value]


def _adapter_identity_error(adapter: Any, arm: str) -> str:
    actual = getattr(adapter, "arm_id", None)
    if actual != arm:
        return f"adapter arm_id {actual!r} does not match requested arm {arm!r}"
    return ""


def _read_frame(
    adapter: Any, method_name: str, frame_kind: str
) -> tuple[int, ControllerFrame | None, str]:
    method = getattr(adapter, method_name, None)
    if not callable(method):
        return -1, None, f"adapter does not implement {method_name}"
    try:
        result = method()
    except Exception as error:
        return -1, None, f"{method_name} failed: {error}"
    status, frame = _unpack_read_result(result)
    if status != 0:
        return status, None, f"{method_name} returned API2 status {status}"
    try:
        return 0, _controller_frame(frame, frame_kind), ""
    except ValueError as error:
        return -1, None, f"{method_name} returned invalid {frame_kind} frame: {error}"


def _unpack_read_result(result: Any) -> tuple[int, Any]:
    if isinstance(result, (tuple, list)) and len(result) >= 2 and _is_status(result[0]):
        return int(result[0]), result[1]
    if isinstance(result, Mapping) and _is_status(result.get("status")):
        return int(result["status"]), result.get("frame", result)
    return 0, result


def _controller_frame(frame: Any, frame_kind: str) -> ControllerFrame:
    controller_name = getattr(frame, "controller_name", None)
    if not isinstance(controller_name, str) or not controller_name:
        raise ValueError("controller_name must be a non-empty string")
    xyz_m = _finite_vector(getattr(frame, "xyz_m", None), 3, f"{frame_kind}.xyz_m")
    quaternion_wxyz = _quaternion(
        getattr(frame, "quaternion_wxyz", None),
        f"{frame_kind}.quaternion_wxyz",
    )
    if frame_kind == "tool":
        payload_kg = _finite_scalar(
            getattr(frame, "payload_kg", None),
            "tool.payload_kg",
            minimum=0.0,
        )
        center_of_mass_m = _finite_vector(
            getattr(frame, "center_of_mass_m", None),
            3,
            "tool.center_of_mass_m",
        )
    else:
        payload_kg = None
        center_of_mass_m = None
    return ControllerFrame(
        controller_name,
        xyz_m,  # type: ignore[arg-type]
        quaternion_wxyz,
        payload_kg,
        center_of_mass_m,  # type: ignore[arg-type]
    )


def _frame_mismatches(
    frame_kind: str,
    desired: ToolFrame | WorkFrame,
    current: ControllerFrame,
    *,
    include_payload: bool,
) -> list[str]:
    mismatches = []
    if current.controller_name != desired.controller_name:
        mismatches.append(f"{frame_kind}.controller_name")
    if not _vectors_close(current.xyz_m, desired.xyz_m, _LINEAR_TOLERANCE_M):
        mismatches.append(f"{frame_kind}.xyz_m")
    orientation_tolerance = (
        _TOOL_ORIENTATION_TOLERANCE_RAD
        if frame_kind == "tool"
        else _WORK_ORIENTATION_TOLERANCE_RAD
    )
    if not _orientations_close(
        current.quaternion_wxyz, desired.quaternion_wxyz, orientation_tolerance
    ):
        mismatches.append(f"{frame_kind}.quaternion_wxyz")
    if include_payload:
        assert isinstance(desired, ToolFrame)
        assert current.payload_kg is not None
        assert current.center_of_mass_m is not None
        if not math.isclose(
            current.payload_kg,
            desired.payload_kg,
            rel_tol=0.0,
            abs_tol=_PAYLOAD_TOLERANCE_KG,
        ):
            mismatches.append("tool.payload_kg")
        if not _vectors_close(
            current.center_of_mass_m,
            desired.center_of_mass_m,
            _LINEAR_TOLERANCE_M,
        ):
            mismatches.append("tool.center_of_mass_m")
    return mismatches


def _vectors_close(
    current: tuple[float, ...], desired: tuple[float, ...], tolerance: float
) -> bool:
    return all(
        math.isclose(actual, expected, rel_tol=0.0, abs_tol=tolerance)
        for actual, expected in zip(current, desired)
    )


def _orientations_close(
    current: tuple[float, float, float, float],
    desired: tuple[float, float, float, float],
    tolerance: float,
) -> bool:
    dot = abs(sum(actual * expected for actual, expected in zip(current, desired)))
    angular_error = 2.0 * math.acos(min(1.0, dot))
    return angular_error <= tolerance


def _write_frame(adapter: Any, method_name: str, value: Any) -> tuple[int, str]:
    method = getattr(adapter, method_name, None)
    if not callable(method):
        return -1, f"adapter does not implement {method_name}"
    try:
        result = method(value)
    except Exception as error:
        return -1, f"{method_name} failed: {error}"
    status = _status_from_write(result)
    if status != 0:
        return status, f"{method_name} returned API2 status {status}"
    return 0, ""


def _status_from_write(result: Any) -> int:
    if _is_status(result):
        return int(result)
    if isinstance(result, (tuple, list)) and result and _is_status(result[0]):
        return int(result[0])
    if isinstance(result, Mapping) and _is_status(result.get("status")):
        return int(result["status"])
    return -1


def _is_status(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _first_error(*statuses: int) -> int:
    return next((status for status in statuses if status != 0), 0)
