"""Validated desired coordinate profiles and explicit controller-frame policy.

The adapter seam deliberately accepts simple duck-typed methods so this module
does not import the RealMan SDK. Adapter reads may return ``(status, frame)``
or a frame value; writes may return an API2 integer status. Missing methods and
exceptions become status ``-1``, an unmatched verification, and blocked motion.
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

    def current_tool_frame(self, arm: str) -> Any: ...

    def current_work_frame(self, arm: str) -> Any: ...

    def set_tool_frame(self, arm: str, frame: ToolFrame) -> Any: ...

    def set_work_frame(self, arm: str, frame: WorkFrame) -> Any: ...

    def change_tool_frame(self, arm: str, controller_name: str) -> Any: ...

    def change_work_frame(self, arm: str, controller_name: str) -> Any: ...


class CoordinateManager:
    """Own desired coordinate profiles and the read-before-motion safety state."""

    def __init__(
        self,
        policy: CoordinatePolicy,
        profiles: Mapping[str, ArmCoordinateDefaults],
        *,
        is_arm_busy: Callable[[str], bool] | None = None,
    ) -> None:
        self.policy = policy
        self.profiles = MappingProxyType(dict(profiles))
        self._is_arm_busy = is_arm_busy or (lambda _arm: False)
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
    ) -> "CoordinateManager":
        with Path(path).open(encoding="utf-8") as stream:
            data = yaml.safe_load(stream)
        if not isinstance(data, dict):
            raise ValueError("coordinate profile must be a YAML mapping")
        if data.get("version") != 1:
            raise ValueError("coordinate profile version must be 1")

        policy_data = _mapping(data.get("policy"), "policy")
        policy = CoordinatePolicy(
            on_start=_required_string(policy_data, "on_start", "policy"),
            on_mismatch=_required_string(policy_data, "on_mismatch", "policy"),
        )
        if policy.on_start != "verify":
            raise ValueError("policy.on_start must be 'verify'")
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
        return cls(policy, profiles, is_arm_busy=is_arm_busy)

    def verify(self, adapter: CoordinateAdapter, arm: str) -> CoordinateVerification:
        """Read controller frame selection and update the motion permission state."""
        profile = self._profile(arm)
        expected_tool = profile.tools[self._selected_tools[arm]].controller_name
        expected_work = profile.works[self._selected_works[arm]].controller_name
        tool_status, current_tool, tool_error = _read_frame(adapter, "current_tool_frame", arm)
        work_status, current_work, work_error = _read_frame(adapter, "current_work_frame", arm)
        status = _first_error(tool_status, work_status)
        tool_matched = tool_status == 0 and current_tool == expected_tool
        work_matched = work_status == 0 and current_work == expected_work
        matched = tool_matched and work_matched
        self._motion_allowed[arm] = matched
        if matched:
            message = "controller tool and work frames match the desired profile"
        elif status != 0:
            message = "; ".join(error for error in (tool_error, work_error) if error)
        else:
            message = (
                f"frame mismatch: expected tool={expected_tool} work={expected_work}; "
                f"current tool={current_tool} work={current_work}"
            )
        return CoordinateVerification(
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

    def apply(self, adapter: CoordinateAdapter, arm: str) -> CoordinateVerification:
        """Explicitly write and select the arm defaults, then read them back."""
        profile = self._profile(arm)
        self._selected_tools[arm] = profile.tool_default
        self._selected_works[arm] = profile.work_default
        operations = (
            ("set_tool_frame", profile.tools[profile.tool_default]),
            ("set_work_frame", profile.works[profile.work_default]),
            ("change_tool_frame", profile.tools[profile.tool_default].controller_name),
            ("change_work_frame", profile.works[profile.work_default].controller_name),
        )
        for method_name, value in operations:
            status, error = _write_frame(adapter, method_name, arm, value)
            if status != 0:
                self._motion_allowed[arm] = False
                return self._failure(arm, status, error)
        return self.verify(adapter, arm)

    def select_tool(
        self, adapter: CoordinateAdapter, arm: str, name: str
    ) -> CoordinateVerification:
        """Select a configured tool only while the ownership callback says arm is idle."""
        profile = self._profile(arm)
        if name not in profile.tools:
            return self._failure(arm, -1, f"unknown configured tool frame: {name}")
        if self._is_arm_busy(arm):
            return self._failure(arm, -1, f"arm {arm} is busy; tool frame selection refused")
        status, error = _write_frame(adapter, "change_tool_frame", arm, profile.tools[name].controller_name)
        if status != 0:
            return self._failure(arm, status, error)
        self._selected_tools[arm] = name
        return self.verify(adapter, arm)

    def select_work(
        self, adapter: CoordinateAdapter, arm: str, name: str
    ) -> CoordinateVerification:
        """Select a configured work frame only while the ownership callback says arm is idle."""
        profile = self._profile(arm)
        if name not in profile.works:
            return self._failure(arm, -1, f"unknown configured work frame: {name}")
        if self._is_arm_busy(arm):
            return self._failure(arm, -1, f"arm {arm} is busy; work frame selection refused")
        status, error = _write_frame(adapter, "change_work_frame", arm, profile.works[name].controller_name)
        if status != 0:
            return self._failure(arm, status, error)
        self._selected_works[arm] = name
        return self.verify(adapter, arm)

    def motion_allowed(self, arm: str) -> bool:
        """Return true only after a successful verification of current selections."""
        self._profile(arm)
        return self._motion_allowed[arm]

    def selected_tool(self, arm: str) -> str:
        """Return the configured tool name selected for the next verification."""
        self._profile(arm)
        return self._selected_tools[arm]

    def selected_work(self, arm: str) -> str:
        """Return the configured work-frame name selected for the next verification."""
        self._profile(arm)
        return self._selected_works[arm]

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
    tool_default = _required_string(data, "default_tool", f"robots.{arm}")
    work_default = _required_string(data, "default_work", f"robots.{arm}")
    tool_data = _mapping(data.get("tools"), f"robots.{arm}.tools")
    work_data = _mapping(data.get("work_frames"), f"robots.{arm}.work_frames")
    if not tool_data or not work_data:
        raise ValueError(f"robots.{arm} requires non-empty tools and work_frames")

    tools = {name: _tool_frame(arm, name, _mapping(value, name)) for name, value in tool_data.items()}
    works = {name: _work_frame(arm, name, _mapping(value, name)) for name, value in work_data.items()}
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
    pose = _mapping(data.get("pose"), f"tools.{name}.pose")
    return ToolFrame(
        _controller_name(data, arm, name),
        _ros_frame_id(data, arm, name),
        _finite_vector(pose.get("xyz_m"), 3, f"tools.{name}.pose.xyz_m"),
        _quaternion(pose.get("quaternion_wxyz"), f"tools.{name}.pose.quaternion_wxyz"),
        _finite_scalar(data.get("payload_kg"), f"tools.{name}.payload_kg", minimum=0.0),
        _finite_vector(data.get("center_of_mass_m"), 3, f"tools.{name}.center_of_mass_m"),
    )


def _work_frame(arm: str, name: str, data: Mapping[str, Any]) -> WorkFrame:
    pose = _mapping(data.get("pose"), f"work_frames.{name}.pose")
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


def _read_frame(adapter: Any, method_name: str, arm: str) -> tuple[int, str | None, str]:
    method = getattr(adapter, method_name, None)
    if not callable(method):
        return -1, None, f"adapter does not implement {method_name}"
    try:
        result = method(arm)
    except Exception as error:
        return -1, None, f"{method_name} failed: {error}"
    status, frame = _unpack_read_result(result)
    if status != 0:
        return status, None, f"{method_name} returned API2 status {status}"
    name = _frame_name(frame)
    if name is None:
        return -1, None, f"{method_name} returned no controller frame name"
    return 0, name, ""


def _unpack_read_result(result: Any) -> tuple[int, Any]:
    if isinstance(result, (tuple, list)) and len(result) >= 2 and _is_status(result[0]):
        return int(result[0]), result[1]
    if isinstance(result, Mapping) and _is_status(result.get("status")):
        return int(result["status"]), result.get("frame", result)
    return 0, result


def _frame_name(frame: Any) -> str | None:
    if isinstance(frame, str) and frame:
        return frame
    if isinstance(frame, Mapping):
        for key in ("controller_name", "name", "frame_name"):
            value = frame.get(key)
            if isinstance(value, str) and value:
                return value
    value = getattr(frame, "controller_name", None)
    return value if isinstance(value, str) and value else None


def _write_frame(adapter: Any, method_name: str, arm: str, value: Any) -> tuple[int, str]:
    method = getattr(adapter, method_name, None)
    if not callable(method):
        return -1, f"adapter does not implement {method_name}"
    try:
        result = method(arm, value)
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
