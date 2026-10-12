"""Validation for the JSON messages accepted by the WebSocket endpoint."""

from __future__ import annotations

import json
import math
import re
from typing import Any


ARMS = frozenset({"l", "m", "r"})
ACTION_NAMES = frozenset(
    {"execute_motion", "execute_trajectory", "cartesian_velocity"}
)
MAX_REQUEST_ID_LENGTH = 96
# Sanity cap only; gripper_manager enforces the real per-gripper travel.
MAX_GRIPPER_POSITION = 1_000_000
WRITE_LIMIT_COMMANDS = frozenset({"set_limits", "move_raw"})


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
    reference_type = _integer(goal.get("reference_type"), "goal.reference_type", 0, 3)
    reference_name = _string(goal.get("reference_name"), "goal.reference_name", maximum=128)
    return reference_type, reference_name


def _gripper_position(message: dict[str, Any], field: str, request_id: str) -> int:
    try:
        return _integer(message.get(field), field, 0, MAX_GRIPPER_POSITION)
    except ProtocolError as error:
        raise ProtocolError(error.code, error.message, request_id) from error


def reject_if_read_only(command: str, read_only: bool, request_id: str = "") -> None:
    """Refuse gripper travel writes at the server boundary in read-only mode."""
    if read_only and command in WRITE_LIMIT_COMMANDS:
        raise ProtocolError("read_only", "the server is read-only", request_id)


def _decode_message(raw: str | bytes, max_bytes: int) -> dict[str, Any]:
    """Decode one browser frame into a JSON object, enforcing UTF-8 and the size limit."""

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
    return message


def _parse_ping(message: dict[str, Any]) -> dict[str, Any]:
    return {"type": "ping"}


def _parse_select_input_mode(message: dict[str, Any]) -> dict[str, Any]:
    request_id = _request_id(message)
    mode_id = _string(message.get("mode_id"), "mode_id")
    if re.fullmatch(r"[a-z][a-z0-9]*", mode_id) is None:
        raise ProtocolError("invalid_field", "mode_id must be a lower-case ASCII identifier", request_id)
    return {"type": "select_input_mode", "request_id": request_id, "mode_id": mode_id}


def _parse_keyboard_state(message: dict[str, Any]) -> dict[str, Any]:
    arm = message.get("arm")
    if arm not in {"l", "r"}:
        raise ProtocolError("invalid_arm", "keyboard arm must be l or r")
    keys = message.get("keys")
    if (
        not isinstance(keys, list)
        or len(keys) > 14
        or not all(
            isinstance(code, str) and re.fullmatch(r"Key[A-Z]|Digit[0-9]", code)
            for code in keys
        )
        or len(set(keys)) != len(keys)
    ):
        raise ProtocolError(
            "invalid_field",
            "keys must be unique physical KeyA–KeyZ or Digit0–Digit9 codes",
        )
    sequence = _integer(
        message.get("sequence"), "sequence", 0, 9_007_199_254_740_991
    )
    return {
        "type": "keyboard_state",
        "arm": arm,
        "keys": keys,
        "sequence": sequence,
    }


def _parse_capture_calibration_sample(message: dict[str, Any]) -> dict[str, Any]:
    request_id = _request_id(message)
    session_id = _string(message.get("session_id", ""), "session_id", maximum=128, allow_empty=True)
    start_new_session = message.get("start_new_session", False)
    if not isinstance(start_new_session, bool):
        raise ProtocolError("invalid_field", "start_new_session must be a boolean", request_id)
    raw_arms = message.get("arm_ids", ["l", "m", "r"])
    if not isinstance(raw_arms, list) or set(raw_arms) != ARMS or len(raw_arms) != 3:
        raise ProtocolError("invalid_field", "arm_ids must contain l, m, and r", request_id)
    return {
        "type": "capture_calibration_sample",
        "request_id": request_id,
        "session_id": session_id,
        "start_new_session": start_new_session,
        "arm_ids": [str(arm) for arm in raw_arms],
    }


def _parse_solve_calibration(message: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "solve_calibration",
        "request_id": _request_id(message),
        "session_id": _string(message.get("session_id", ""), "session_id", maximum=128, allow_empty=True),
    }


def _parse_gripper_command(message: dict[str, Any]) -> dict[str, Any]:
    request_id = _request_id(message)
    name = _string(message.get("name"), "name", maximum=96)
    command = message.get("command")
    if command not in {
        "open", "close", "reset", "enable", "disable", "percentage", "grasp_check",
        "set_limits", "move_raw",
    }:
        raise ProtocolError("invalid_command", "unsupported gripper command", request_id)
    normalized = {"type": "gripper_command", "request_id": request_id, "name": name, "command": command}
    if command == "percentage":
        normalized["percentage"] = _number(message.get("percentage"), "percentage")
        if not 0.0 <= normalized["percentage"] <= 1.0:
            raise ProtocolError("invalid_field", "percentage must be from 0.0 through 1.0", request_id)
    if command == "set_limits":
        normalized["open_position"] = _gripper_position(message, "open_position", request_id)
        normalized["close_position"] = _gripper_position(message, "close_position", request_id)
    if command == "move_raw":
        normalized["position"] = _gripper_position(message, "position", request_id)
    return normalized


def _parse_get_current_pose(message: dict[str, Any], arm: str) -> dict[str, Any]:
    normalized = {
        "type": "get_current_pose",
        "request_id": _request_id(message),
        "arm": arm,
    }
    if "reference" in message:
        reference = _mapping(message.get("reference"), "reference")
        reference_type, reference_name = _reference(reference)
        normalized["reference"] = {
            "reference_type": reference_type,
            "reference_name": reference_name,
        }
    return normalized


def _parse_list_joint_records(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {
        "type": "list_joint_records",
        "request_id": _request_id(message, required=False),
        "arm": arm,
    }


def _parse_save_joint_record(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {
        "type": "save_joint_record",
        "request_id": _request_id(message),
        "arm": arm,
        "label": _string(message.get("label"), "label", maximum=64),
    }


def _parse_delete_joint_record(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {
        "type": "delete_joint_record",
        "request_id": _request_id(message),
        "arm": arm,
        "record_id": _string(message.get("record_id"), "record_id", maximum=64),
    }


def _parse_apply_joint_record(message: dict[str, Any], arm: str) -> dict[str, Any]:
    normalized = {
        "type": "apply_joint_record",
        "request_id": _request_id(message),
        "arm": arm,
        "record_id": _string(message.get("record_id"), "record_id", maximum=64),
        "command": _integer(message.get("command"), "command", 0, 2),
    }
    if "reference" in message:
        reference = _mapping(message.get("reference"), "reference")
        reference_type, reference_name = _reference(reference)
        normalized["reference"] = {
            "reference_type": reference_type,
            "reference_name": reference_name,
        }
    return normalized


def _parse_solve_ik(message: dict[str, Any], arm: str) -> dict[str, Any]:
    request_id = _request_id(message)
    goal = _mapping(message.get("goal"), "goal")
    reference_type, reference_name = _reference(goal)
    return {
        "type": "solve_ik",
        "request_id": request_id,
        "arm": arm,
        "goal": {
            "reference_type": reference_type,
            "reference_name": reference_name,
            "seed_joint_degrees": _vector(
                goal.get("seed_joint_degrees"), "goal.seed_joint_degrees", 6
            ),
            "pose_position_m": _vector(
                goal.get("pose_position_m"), "goal.pose_position_m", 3
            ),
            "pose_quaternion_wxyz": _vector(
                goal.get("pose_quaternion_wxyz"),
                "goal.pose_quaternion_wxyz",
                4,
            ),
        },
    }


def _parse_execute_motion(message: dict[str, Any], arm: str) -> dict[str, Any]:
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
    return {"type": "execute_motion", "request_id": request_id, "arm": arm, "goal": normalized_goal}


def _parse_execute_trajectory(message: dict[str, Any], arm: str) -> dict[str, Any]:
    request_id = _request_id(message)
    goal = _mapping(message.get("goal"), "goal")
    reference_type, reference_name = _reference(goal)
    raw_waypoints = goal.get("waypoints")
    if not isinstance(raw_waypoints, list) or not 2 <= len(raw_waypoints) <= 256:
        raise ProtocolError(
            "invalid_field",
            "goal.waypoints must contain from 2 through 256 points",
        )
    waypoints = []
    for index, raw_waypoint in enumerate(raw_waypoints):
        waypoint = _mapping(raw_waypoint, f"goal.waypoints[{index}]")
        prefix = f"goal.waypoints[{index}]"
        waypoints.append(
            {
                "command": _integer(
                    waypoint.get("command"), f"{prefix}.command", 0, 2
                ),
                "joint_degrees": _vector(
                    waypoint.get("joint_degrees", [0.0] * 6),
                    f"{prefix}.joint_degrees",
                    6,
                ),
                "pose_position_m": _vector(
                    waypoint.get("pose_position_m", [0.0] * 3),
                    f"{prefix}.pose_position_m",
                    3,
                ),
                "pose_quaternion_wxyz": _vector(
                    waypoint.get(
                        "pose_quaternion_wxyz",
                        [1.0, 0.0, 0.0, 0.0],
                    ),
                    f"{prefix}.pose_quaternion_wxyz",
                    4,
                ),
                "velocity_percent": _integer(
                    waypoint.get("velocity_percent"),
                    f"{prefix}.velocity_percent",
                    1,
                    100,
                ),
                "blend_radius_percent": _integer(
                    waypoint.get("blend_radius_percent", 0),
                    f"{prefix}.blend_radius_percent",
                    0,
                    100,
                ),
            }
        )
    return {
        "type": "execute_trajectory",
        "request_id": request_id,
        "arm": arm,
        "goal": {
            "reference_type": reference_type,
            "reference_name": reference_name,
            "waypoints": waypoints,
            "timeout_sec": _number(
                goal.get("timeout_sec"),
                "goal.timeout_sec",
                positive=True,
            ),
        },
    }


def _parse_start_cartesian_velocity(message: dict[str, Any], arm: str) -> dict[str, Any]:
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
    return {"type": "start_cartesian_velocity", "request_id": request_id, "arm": arm, "goal": normalized_goal}


def _parse_velocity_command(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {
        "type": "velocity_command",
        "arm": arm,
        "linear": _vector(message.get("linear"), "linear", 3),
        "angular": _vector(message.get("angular"), "angular", 3),
    }


def _parse_cancel_action(message: dict[str, Any], arm: str) -> dict[str, Any]:
    action = message.get("action")
    if action not in ACTION_NAMES:
        raise ProtocolError(
            "invalid_action",
            "action must be execute_motion, execute_trajectory, or cartesian_velocity",
        )
    return {
        "type": "cancel_action",
        "request_id": _request_id(message, required=False),
        "arm": arm,
        "action": action,
    }


def _parse_software_stop(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {"type": "software_stop", "request_id": _request_id(message, required=False), "arm": arm}


def _parse_recover_motion(message: dict[str, Any], arm: str) -> dict[str, Any]:
    return {
        "type": "recover_motion",
        "request_id": _request_id(message),
        "arm": arm,
    }

# Message types that do not target an arm, and the ones that do. The split keeps the original
# validation order: arm-less types never see the arm check, and every other type (including an
# unknown one) is checked for a valid `arm` before its own fields.
_ARMLESS_PARSERS = {
    "ping": _parse_ping,
    "select_input_mode": _parse_select_input_mode,
    "keyboard_state": _parse_keyboard_state,
    "capture_calibration_sample": _parse_capture_calibration_sample,
    "solve_calibration": _parse_solve_calibration,
    "gripper_command": _parse_gripper_command,
}

_ARM_PARSERS = {
    "get_current_pose": _parse_get_current_pose,
    "list_joint_records": _parse_list_joint_records,
    "save_joint_record": _parse_save_joint_record,
    "delete_joint_record": _parse_delete_joint_record,
    "apply_joint_record": _parse_apply_joint_record,
    "solve_ik": _parse_solve_ik,
    "execute_motion": _parse_execute_motion,
    "execute_trajectory": _parse_execute_trajectory,
    "start_cartesian_velocity": _parse_start_cartesian_velocity,
    "velocity_command": _parse_velocity_command,
    "cancel_action": _parse_cancel_action,
    "software_stop": _parse_software_stop,
    "recover_motion": _parse_recover_motion,
}


def parse_message(raw: str | bytes, *, max_bytes: int = 65536) -> dict[str, Any]:
    """Parse and normalize one browser message, rejecting ambiguous values."""

    message = _decode_message(raw, max_bytes)
    message_type = _string(message.get("type"), "type", maximum=48)

    armless = _ARMLESS_PARSERS.get(message_type)
    if armless is not None:
        return armless(message)

    arm = _arm(message)
    arm_parser = _ARM_PARSERS.get(message_type)
    if arm_parser is not None:
        return arm_parser(message, arm)
    raise ProtocolError("unsupported_type", f"unsupported message type: {message_type}")
