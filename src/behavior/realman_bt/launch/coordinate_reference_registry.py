"""Build compact runtime registries from authoritative ROS configuration."""

from pathlib import Path
from typing import Any

import math
import yaml


_DELIMITER = "|"


def _mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{field} must be a mapping")
    return value


def _text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{field} must be a non-empty string")
    if _DELIMITER in value:
        raise ValueError(f"{field} must not contain registry delimiter {_DELIMITER!r}")
    return value


def _positive_number(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be a positive number")
    result = float(value)
    if not math.isfinite(result) or result <= 0.0:
        raise ValueError(f"{field} must be a positive finite number")
    return result


def _positive_integer(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{field} must be a positive integer")
    return value


def _format_number(value: float) -> str:
    return format(value, ".15g")


def _load(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as stream:
        return _mapping(yaml.safe_load(stream) or {}, str(path))


def load_runtime_registries(
    coordinates_file: Path, motion_file: Path
) -> tuple[list[str], list[str]]:
    """Return flat ROS parameters consumed by the C++ behavior-tree executor."""
    coordinates = _mapping(_load(coordinates_file).get("robots"), "coordinates.robots")
    motion = _mapping(_load(motion_file).get("robots"), "motion.robots")
    references: list[str] = []
    profiles: list[str] = []

    for arm in ("l", "m", "r"):
        coordinate = _mapping(coordinates.get(arm), f"coordinates.robots.{arm}")
        arm_motion = _mapping(motion.get(arm), f"motion.robots.{arm}")
        tools = _mapping(coordinate.get("tools"), f"coordinates.robots.{arm}.tools")
        works = _mapping(
            coordinate.get("work_frames"), f"coordinates.robots.{arm}.work_frames"
        )
        default_tool = _text(
            coordinate.get("default_tool"), f"coordinates.robots.{arm}.default_tool"
        )
        default_work = _text(
            coordinate.get("default_work"), f"coordinates.robots.{arm}.default_work"
        )
        if default_tool not in tools or default_work not in works:
            raise ValueError(f"coordinates.robots.{arm} default frame is not configured")

        entries: dict[str, tuple[int, str, str]] = {
            "base": (0, "base", f"{arm}/base_link")
        }
        for key, raw in tools.items():
            logical_key = _text(key, f"coordinates.robots.{arm}.tools key")
            frame = _mapping(raw, f"coordinates.robots.{arm}.tools.{logical_key}")
            entries[f"tool/{logical_key}"] = (
                2,
                _text(frame.get("controller_name"), f"tools.{logical_key}.controller_name"),
                _text(frame.get("ros_frame_id"), f"tools.{logical_key}.ros_frame_id"),
            )
        for key, raw in works.items():
            logical_key = _text(key, f"coordinates.robots.{arm}.work_frames key")
            frame = _mapping(raw, f"coordinates.robots.{arm}.work_frames.{logical_key}")
            entries[f"work/{logical_key}"] = (
                1,
                _text(frame.get("controller_name"), f"work_frames.{logical_key}.controller_name"),
                _text(frame.get("ros_frame_id"), f"work_frames.{logical_key}.ros_frame_id"),
            )
        entries["default_tool"] = entries[f"tool/{default_tool}"]
        entries["default_work"] = entries[f"work/{default_work}"]

        for logical_name, (reference_type, controller_name, ros_frame_id) in entries.items():
            references.append(
                _DELIMITER.join(
                    (arm, logical_name, str(reference_type), controller_name, ros_frame_id)
                )
            )

        profile_fields = (
            _positive_integer(
                arm_motion.get("velocity_control_period_ms"),
                f"motion.robots.{arm}.velocity_control_period_ms",
            ),
            _positive_integer(
                arm_motion.get("velocity_watchdog_ms"),
                f"motion.robots.{arm}.velocity_watchdog_ms",
            ),
            _positive_number(
                arm_motion.get("max_linear_speed_mps"),
                f"motion.robots.{arm}.max_linear_speed_mps",
            ),
            _positive_number(
                arm_motion.get("max_angular_speed_radps"),
                f"motion.robots.{arm}.max_angular_speed_radps",
            ),
            _positive_number(
                arm_motion.get("max_linear_accel_mps2"),
                f"motion.robots.{arm}.max_linear_accel_mps2",
            ),
            _positive_number(
                arm_motion.get("max_angular_accel_radps2"),
                f"motion.robots.{arm}.max_angular_accel_radps2",
            ),
            _positive_number(
                arm_motion.get("default_timeout_sec"),
                f"motion.robots.{arm}.default_timeout_sec",
            ),
            _positive_number(
                arm_motion.get("stop_timeout_sec"),
                f"motion.robots.{arm}.stop_timeout_sec",
            ),
        )
        profiles.append(
            _DELIMITER.join(
                (arm, str(profile_fields[0]), str(profile_fields[1]))
                + tuple(_format_number(value) for value in profile_fields[2:])
            )
        )
    return references, profiles
