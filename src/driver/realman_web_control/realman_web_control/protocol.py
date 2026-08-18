"""Validation for the JSON messages accepted by the WebSocket endpoint."""

from __future__ import annotations

import json
import math
from typing import Any


ARMS = frozenset({"l", "m", "r"})
ACTION_NAMES = frozenset({"execute_motion", "cartesian_velocity"})
MUTATING_TYPES = frozenset(
    {
        "execute_motion",
        "start_cartesian_velocity",
        "velocity_command",
        "cancel_action",
        "software_stop",
    }
)
MAX_REQUEST_ID_LENGTH = 96


class ProtocolError(ValueError):
    """A stable browser-facing protocol failure."""

    def __init__(self, code: str, message: str, request_id: str = "") -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.request_id = request_id

    def event(self) -> dict[str, Any]:
        event: dict[str, Any] = {
            "type": "error",
            "code": self.code,
            "message": self.message,
        }
        if self.request_id:
            event["request_id"] = self.request_id
        return event


def _mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ProtocolError("invalid_field", f"{field} must be an object")
    return value


def _string(value: Any, field: str, *, maximum: int = 96, allow_empty: bool = False) -> str:
    if not isinstance(value, str) or len(value) > maximum or (not allow_empty and not value):
        qualifier = "a string" if allow_empty else "a non-empty string"
        raise ProtocolError("invalid_field", f"{field} must be {qualifier} up to {maximum} characters")
    return value


def _integer(value: Any, field: str, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise ProtocolError("invalid_field", f"{field} must be an integer from {minimum} through {maximum}")
    return value


def _number(value: Any, field: str, *, positive: bool = False) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ProtocolError("invalid_field", f"{field} must be a finite number")
    result = float(value)
    if not math.isfinite(result) or (positive and result <= 0.0):
        suffix = " positive" if positive else ""
        raise ProtocolError("invalid_field", f"{field} must be a{suffix} finite number")
    return result


def _vector(value: Any, field: str, length: int) -> list[float]:
    if not isinstance(value, list) or len(value) != length:
        raise ProtocolError("invalid_field", f"{field} must contain exactly {length} values")
    return [_number(item, f"{field}[{index}]") for index, item in enumerate(value)]


def _arm(message: dict[str, Any]) -> str:
    arm = message.get("arm")
    if arm not in ARMS:
        raise ProtocolError("invalid_arm", "arm must be one of l, m, or r")
    return arm


def _request_id(message: dict[str, Any], *, required: bool = True) -> str:
    value = message.get("request_id", "")
    if not value and not required:
        return ""
    return _string(value, "request_id", maximum=MAX_REQUEST_ID_LENGTH)


def _reference(goal: dict[str, Any]) -> tuple[int, str]:
    reference_type = _integer(goal.get("reference_type"), "goal.reference_type", 0, 2)
    reference_name = _string(goal.get("reference_name"), "goal.reference_name", maximum=32)
    return reference_type, reference_name


def parse_message(raw: str | bytes, *, max_bytes: int = 65536) -> dict[str, Any]:
    """Parse and normalize one browser message, rejecting ambiguous values."""

    if isinstance(raw, bytes):
        size = len(raw)
        try:
            raw = raw.decode("utf-8")
        except UnicodeDecodeError as error:
            raise ProtocolError("invalid_json", "message must be UTF-8 JSON") from error
    elif isinstance(raw, str):
        size = len(raw.encode("utf-8"))
    else:
        raise ProtocolError("invalid_json", "message must be text JSON")
    if size > max_bytes:
        raise ProtocolError("message_too_large", f"message exceeds {max_bytes} bytes")
    try:
        message = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as error:
        raise ProtocolError("invalid_json", "message must be valid JSON") from error
    if not isinstance(message, dict):
        raise ProtocolError("invalid_message", "message must be a JSON object")

    message_type = _string(message.get("type"), "type", maximum=48)
    if message_type == "authenticate":
        return {"type": message_type, "token": _string(message.get("token"), "token", maximum=512)}
    if message_type == "ping":
        return {"type": "ping"}

    arm = _arm(message)
    if message_type == "execute_motion":
        request_id = _request_id(message)
        goal = _mapping(message.get("goal"), "goal")
        command = _integer(goal.get("command"), "goal.command", 0, 2)
        reference_type, reference_name = _reference(goal)
        normalized_goal: dict[str, Any] = {
            "command": command,
            "reference_type": reference_type,
            "reference_name": reference_name,
            "joint_degrees": _vector(goal.get("joint_degrees", [0.0] * 6), "goal.joint_degrees", 6),
            "pose_position_m": _vector(goal.get("pose_position_m", [0.0] * 3), "goal.pose_position_m", 3),
            "pose_quaternion_wxyz": _vector(
                goal.get("pose_quaternion_wxyz", [1.0, 0.0, 0.0, 0.0]),
                "goal.pose_quaternion_wxyz",
                4,
            ),
            "velocity_percent": _integer(goal.get("velocity_percent"), "goal.velocity_percent", 1, 100),
            "blend_radius_percent": _integer(
                goal.get("blend_radius_percent", 0), "goal.blend_radius_percent", 0, 100
            ),
            "connect": False,
            "timeout_sec": _number(goal.get("timeout_sec"), "goal.timeout_sec", positive=True),
        }
        return {"type": message_type, "request_id": request_id, "arm": arm, "goal": normalized_goal}

    if message_type == "start_cartesian_velocity":
        request_id = _request_id(message)
        goal = _mapping(message.get("goal"), "goal")
        reference_type, reference_name = _reference(goal)
        follow = goal.get("follow")
        if not isinstance(follow, bool):
            raise ProtocolError("invalid_field", "goal.follow must be a boolean")
        normalized_goal = {
            "reference_type": reference_type,
            "reference_name": reference_name,
            "control_period_ms": _integer(goal.get("control_period_ms"), "goal.control_period_ms", 1, 10000),
            "watchdog_ms": _integer(goal.get("watchdog_ms"), "goal.watchdog_ms", 1, 60000),
            "max_linear_accel_mps2": _number(
                goal.get("max_linear_accel_mps2"), "goal.max_linear_accel_mps2", positive=True
            ),
            "max_angular_accel_radps2": _number(
                goal.get("max_angular_accel_radps2"), "goal.max_angular_accel_radps2", positive=True
            ),
            "follow": follow,
            "trajectory_mode": _integer(goal.get("trajectory_mode", 0), "goal.trajectory_mode", 0, 2),
            "radio": _integer(goal.get("radio", 0), "goal.radio", 0, 1000),
        }
        return {"type": message_type, "request_id": request_id, "arm": arm, "goal": normalized_goal}

    if message_type == "velocity_command":
        return {
            "type": message_type,
            "arm": arm,
            "linear": _vector(message.get("linear"), "linear", 3),
            "angular": _vector(message.get("angular"), "angular", 3),
        }
    if message_type == "cancel_action":
        action = message.get("action")
        if action not in ACTION_NAMES:
            raise ProtocolError("invalid_action", "action must be execute_motion or cartesian_velocity")
        return {
            "type": message_type,
            "request_id": _request_id(message, required=False),
            "arm": arm,
            "action": action,
        }
    if message_type == "software_stop":
        return {"type": message_type, "request_id": _request_id(message, required=False), "arm": arm}
    raise ProtocolError("unsupported_type", f"unsupported message type: {message_type}")


def require_control(message: dict[str, Any], *, authenticated: bool, enabled: bool) -> None:
    if message.get("type") not in MUTATING_TYPES:
        return
    if not enabled:
        raise ProtocolError("control_disabled", "web control is read-only on this server")
    if not authenticated:
        raise ProtocolError("authentication_required", "authenticate before sending control commands")

