"""Typed motion values, goal validation, and motion-limit configuration."""

from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
import math
from pathlib import Path
from typing import Mapping, Sequence

import yaml

from .quaternion_math import normalize


class CommandType(IntEnum):
    MOVEJ = 0
    MOVEL = 1
    MOVEJ_P = 2


class ReferenceType(IntEnum):
    BASE = 0
    WORK = 1
    TOOL = 2


class TerminalState(IntEnum):
    SUCCEEDED = 0
    CANCELED = 1
    ABORTED = 2
    TIMEOUT = 3


class FeedbackPhase(IntEnum):
    VALIDATING = 0
    SUBMITTING = 1
    EXECUTING = 2
    STOPPING = 3


# These aliases make the action vocabulary available without coupling this
# module to generated ROS messages.
TerminalPhase = TerminalState
MotionTerminalState = TerminalState
MotionFeedbackPhase = FeedbackPhase
TerminalStatus = TerminalState
ResultState = TerminalState
MotionPhase = FeedbackPhase


@dataclass(frozen=True)
class Goal:
    """ROS-action-compatible goal value used by unit tests and coordinators."""

    command: CommandType | int = CommandType.MOVEJ
    reference_type: ReferenceType | int = ReferenceType.BASE
    reference_name: str = "base"
    joint_degrees: Sequence[float] = ()
    pose_position_m: Sequence[float] = ()
    pose_quaternion_wxyz: Sequence[float] = ()
    velocity_percent: int = 100
    blend_radius_percent: int = 0
    connect: bool = False
    timeout_sec: float = 1.0


MotionGoal = Goal


@dataclass(frozen=True)
class ValidatedGoal:
    command: CommandType
    reference_type: ReferenceType
    reference_name: str
    joint_degrees: tuple[float, ...]
    pose_position_m: tuple[float, ...]
    pose_quaternion_wxyz: tuple[float, ...]
    velocity_percent: int
    blend_radius_percent: int
    connect: bool
    timeout_sec: float


@dataclass(frozen=True)
class GoalValidationResult:
    """Immutable validation result with an optional normalized goal."""

    valid: bool
    errors: tuple[str, ...] = ()
    goal: ValidatedGoal | None = None

    @property
    def ok(self) -> bool:
        return self.valid

    @property
    def error(self) -> str:
        return self.errors[0] if self.errors else ""

    @property
    def message(self) -> str:
        return "; ".join(self.errors)

    @property
    def normalized_goal(self) -> ValidatedGoal | None:
        return self.goal


ValidationResult = GoalValidationResult


def _field(goal: object, name: str, default: object = None) -> object:
    if isinstance(goal, Mapping):
        return goal.get(name, default)
    return getattr(goal, name, default)


def _finite_number(value: object, field: str) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    result = float(value)
    return result if math.isfinite(result) else None


def _vector(value: object, expected_length: int, field: str) -> tuple[tuple[float, ...] | None, str | None]:
    length_text = {3: "three", 4: "four", 6: "six"}.get(expected_length, str(expected_length))
    if isinstance(value, (str, bytes)) or not isinstance(value, Sequence):
        return None, f"{field} must contain exactly {length_text} values"
    if len(value) != expected_length:
        return None, f"{field} must contain exactly {length_text} values"
    result: list[float] = []
    for item in value:
        finite = _finite_number(item, field)
        if finite is None:
            return None, f"{field} must contain finite values"
        result.append(finite)
    return tuple(result), None


def _enum(value: object, enum_type: type[IntEnum], field: str) -> tuple[IntEnum | None, str | None]:
    try:
        if isinstance(value, bool):
            raise ValueError
        return enum_type(value), None
    except (TypeError, ValueError):
        allowed = ", ".join(member.name for member in enum_type)
        return None, f"{field} must be one of {allowed}"


def validate_goal(
    goal: object,
    *,
    connected: bool | None = True,
    active_reference_type: ReferenceType | int | None = None,
    active_reference_name: str | None = None,
    reference_config: object | None = None,
) -> GoalValidationResult:
    """Validate an action-like goal without reaching into a ROS node.

    ``active_reference_*`` and ``reference_config`` are explicit seams for
    controller/coordinate state.  Omitting them skips that state check; the
    validator never guesses or mutates controller state.
    """

    errors: list[str] = []
    command_value, command_error = _enum(_field(goal, "command"), CommandType, "command")
    if command_error:
        errors.append(command_error)
    reference_value, reference_error = _enum(
        _field(goal, "reference_type"), ReferenceType, "reference_type"
    )
    if reference_error:
        errors.append(reference_error)
    reference_name = _field(goal, "reference_name", "")
    if not isinstance(reference_name, str) or not reference_name:
        errors.append("reference_name must be a non-empty string")
        reference_name = ""

    if connected is False:
        errors.append("arm is not connected")
    elif connected is not None and not isinstance(connected, bool):
        errors.append("connected must be a boolean or None")

    active_type: ReferenceType | None = None
    if active_reference_type is not None:
        active_type_value, _ = _enum(active_reference_type, ReferenceType, "active_reference_type")
        if active_type_value is None:
            errors.append("active_reference_type is invalid")
        else:
            active_type = active_type_value  # type: ignore[assignment]
            if reference_value is not None and active_type != reference_value:
                errors.append("reference_type does not match active frame")
    if active_reference_name is not None and reference_name != active_reference_name:
        errors.append("reference_name does not match active frame")

    if reference_value is not None and reference_config is not None:
        configured = _configured_reference_names(reference_config, reference_value)
        if configured is not None and reference_name not in configured:
            errors.append("reference_name is not configured for reference_type")

    joints: tuple[float, ...] = ()
    position: tuple[float, ...] = ()
    quaternion: tuple[float, ...] = ()
    if command_value == CommandType.MOVEJ:
        joints, joint_error = _vector(_field(goal, "joint_degrees"), 6, "joint_degrees")
        if joint_error:
            errors.append(joint_error)
        assert joints is not None or joint_error
    elif command_value in (CommandType.MOVEL, CommandType.MOVEJ_P):
        position, position_error = _vector(
            _field(goal, "pose_position_m"), 3, "pose_position_m"
        )
        if position_error:
            errors.append(position_error)
        raw_quaternion, quaternion_error = _vector(
            _field(goal, "pose_quaternion_wxyz"), 4, "pose_quaternion_wxyz"
        )
        if quaternion_error:
            errors.append(quaternion_error)
        elif raw_quaternion is not None:
            try:
                quaternion = normalize(raw_quaternion)
            except ValueError as error:
                detail = str(error)
                if detail.startswith("quaternion "):
                    detail = detail[len("quaternion ") :]
                errors.append(f"pose_quaternion_wxyz {detail}")
    else:
        # Keep a stable shape if command validation failed before selecting a
        # command-specific payload.
        joints = ()
        position = ()
        quaternion = ()

    velocity = _field(goal, "velocity_percent")
    if isinstance(velocity, bool) or not isinstance(velocity, int) or not 1 <= velocity <= 100:
        errors.append("velocity_percent must be between 1 and 100")
        velocity = 0

    blend = _field(goal, "blend_radius_percent")
    if isinstance(blend, bool) or not isinstance(blend, int) or not 0 <= blend <= 100:
        errors.append("blend_radius_percent must be between 0 and 100")
        blend = 0

    connect = _field(goal, "connect")
    if connect is True:
        errors.append("connect=true is not supported in version one")
    elif not isinstance(connect, bool):
        errors.append("connect must be a boolean")
        connect = False

    timeout = _finite_number(_field(goal, "timeout_sec"), "timeout_sec")
    if timeout is None or timeout <= 0.0:
        errors.append("timeout_sec must be a positive finite number")
        timeout = 0.0

    if errors:
        return GoalValidationResult(False, tuple(errors), None)
    assert command_value is not None
    assert reference_value is not None
    assert isinstance(reference_name, str)
    assert isinstance(connect, bool)
    return GoalValidationResult(
        True,
        (),
        ValidatedGoal(
            command=command_value,
            reference_type=reference_value,
            reference_name=reference_name,
            joint_degrees=joints,
            pose_position_m=position,
            pose_quaternion_wxyz=quaternion,
            velocity_percent=velocity,
            blend_radius_percent=blend,
            connect=connect,
            timeout_sec=timeout,
        ),
    )


def _configured_reference_names(config: object, reference_type: ReferenceType) -> set[str] | None:
    """Read a small explicit mapping used by tests or a coordinate seam."""

    if not isinstance(config, Mapping):
        return None
    value: object = None
    for key in (reference_type, int(reference_type), reference_type.name, reference_type.name.lower()):
        if key in config:
            value = config[key]
            break
    if value is None:
        return None
    if isinstance(value, str):
        return {value}
    if isinstance(value, Mapping):
        for key in ("names", "allowed", "frames"):
            if key in value:
                value = value[key]
                break
        else:
            name = value.get("name")
            if isinstance(name, str):
                return {name}
            frame_names = {key for key in value if isinstance(key, str)}
            if frame_names:
                return frame_names
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        return {item for item in value if isinstance(item, str)}
    if isinstance(value, set):
        return {item for item in value if isinstance(item, str)}
    return None


def limit_vector_delta(
    previous: Sequence[object], target: Sequence[object], max_acceleration: object, dt: object
) -> tuple[float, ...]:
    """Limit a vector change by ``max_acceleration * dt`` preserving direction."""

    if isinstance(previous, (str, bytes)) or isinstance(target, (str, bytes)):
        raise ValueError("vectors must contain finite values")
    if not isinstance(previous, Sequence) or not isinstance(target, Sequence):
        raise ValueError("vectors must contain finite values")
    if len(previous) != len(target):
        raise ValueError("vectors must have the same length")
    old: list[float] = []
    new: list[float] = []
    for old_value, new_value in zip(previous, target):
        old_finite = _finite_number(old_value, "vector")
        new_finite = _finite_number(new_value, "vector")
        if old_finite is None or new_finite is None:
            raise ValueError("vectors must contain finite values")
        old.append(old_finite)
        new.append(new_finite)
    acceleration = _finite_number(max_acceleration, "max_acceleration")
    duration = _finite_number(dt, "dt")
    if acceleration is None or acceleration < 0.0:
        raise ValueError("max_acceleration must be a finite non-negative number")
    if duration is None or duration < 0.0:
        raise ValueError("dt must be a finite non-negative number")
    delta = [new_value - old_value for old_value, new_value in zip(old, new)]
    if not all(math.isfinite(value) for value in delta):
        raise ValueError("vectors must contain finite values")
    norm = math.hypot(*delta)
    max_delta = acceleration * duration
    if not math.isfinite(max_delta):
        raise ValueError("vector limit must be finite")
    if norm == 0.0 or norm <= max_delta:
        return tuple(new)
    scale = max_delta / norm
    return tuple(old_value + scale * difference for old_value, difference in zip(old, delta))


_ARMS = frozenset({"l", "m", "r"})
_MOTION_FIELDS = frozenset(
    {
        "default_timeout_sec",
        "max_linear_speed_mps",
        "max_angular_speed_radps",
        "velocity_control_period_ms",
        "velocity_watchdog_ms",
        "max_linear_accel_mps2",
        "max_angular_accel_radps2",
    }
)


@dataclass(frozen=True)
class MotionSettings:
    default_timeout_sec: float
    max_linear_speed_mps: float
    max_angular_speed_radps: float
    velocity_control_period_ms: float
    velocity_watchdog_ms: float
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float

    @property
    def control_period_sec(self) -> float:
        return self.velocity_control_period_ms / 1000.0

    @property
    def watchdog_sec(self) -> float:
        return self.velocity_watchdog_ms / 1000.0

    # Short aliases are useful to non-ROS control code while preserving the
    # names in the YAML schema as the authoritative fields.
    @property
    def period_ms(self) -> float:
        return self.velocity_control_period_ms

    @property
    def period_sec(self) -> float:
        return self.control_period_sec

    @property
    def velocity_control_period_sec(self) -> float:
        return self.control_period_sec

    @property
    def velocity_watchdog_sec(self) -> float:
        return self.watchdog_sec

    @classmethod
    def from_yaml(cls, config_path: str | Path, arm: str) -> "MotionSettings":
        if arm not in _ARMS:
            raise ValueError(f"unknown arm: {arm}")
        with Path(config_path).open(encoding="utf-8") as stream:
            data = yaml.safe_load(stream)
        if not isinstance(data, Mapping):
            raise ValueError("motion config must be a YAML mapping")
        _expect_keys(data, {"robots"}, "root")
        robots = data.get("robots")
        if not isinstance(robots, Mapping):
            raise ValueError("robots must be a mapping")
        robot_ids = set(robots)
        if robot_ids != _ARMS:
            missing = sorted(_ARMS - robot_ids)
            extra = sorted(robot_ids - _ARMS)
            raise ValueError(f"robots must contain exactly l, m, r; missing={missing} extra={extra}")
        parsed: dict[str, dict[str, float]] = {}
        for robot in sorted(_ARMS):
            values = robots[robot]
            if not isinstance(values, Mapping):
                raise ValueError(f"robots.{robot} must be a mapping")
            _expect_keys(values, set(_MOTION_FIELDS), f"robots.{robot}")
            missing = sorted(_MOTION_FIELDS - set(values))
            if missing:
                raise ValueError(f"robots.{robot} missing required key(s): {', '.join(missing)}")
            parsed[robot] = {
                field: _positive_finite(values[field], f"robots.{robot}.{field}")
                for field in _MOTION_FIELDS
            }
        return cls(**parsed[arm])


def _expect_keys(data: Mapping[Any, Any], allowed: set[str], context: str) -> None:
    unknown = sorted(repr(key) for key in data if key not in allowed)
    if unknown:
        raise ValueError(f"{context} contains unknown key(s): {', '.join(unknown)}")


def _positive_finite(value: object, context: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{context} must be a positive finite number")
    result = float(value)
    if not math.isfinite(result) or result <= 0.0:
        raise ValueError(f"{context} must be a positive finite number")
    return result


__all__ = [
    "CommandType",
    "FeedbackPhase",
    "Goal",
    "GoalValidationResult",
    "MotionFeedbackPhase",
    "MotionGoal",
    "MotionPhase",
    "MotionSettings",
    "MotionTerminalState",
    "ReferenceType",
    "ResultState",
    "TerminalPhase",
    "TerminalStatus",
    "TerminalState",
    "ValidatedGoal",
    "ValidationResult",
    "limit_vector_delta",
    "validate_goal",
]
