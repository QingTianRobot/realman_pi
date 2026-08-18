"""Build the Web UI model and safety manifest from root project configuration."""

from __future__ import annotations

import math
from pathlib import Path
import re
from typing import Any
import xml.etree.ElementTree as ET

import yaml


ARMS = ("l", "m", "r")
MODEL_PATTERN = re.compile(r"^[A-Za-z0-9-]+$")
TRANSFORM_FIELDS = ("x", "y", "z", "roll", "pitch", "yaw")


def _load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as stream:
        value = yaml.safe_load(stream)
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a YAML mapping")
    return value


def _finite(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise ValueError(f"{field} must be a finite number")
    return float(value)


def _child_mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{field} must be a mapping")
    return value


def _joint_limits(urdf_path: Path) -> list[dict[str, Any]]:
    root = ET.parse(urdf_path).getroot()
    joints: dict[str, dict[str, Any]] = {}
    for element in root.findall("joint"):
        name = element.attrib.get("name", "")
        if not re.fullmatch(r"joint_[1-6]", name):
            continue
        limit = element.find("limit")
        if limit is None or "lower" not in limit.attrib or "upper" not in limit.attrib:
            raise ValueError(f"{urdf_path}: {name} has no finite lower/upper limits")
        lower = _finite(float(limit.attrib["lower"]), f"{name}.lower")
        upper = _finite(float(limit.attrib["upper"]), f"{name}.upper")
        if lower >= upper:
            raise ValueError(f"{urdf_path}: {name} lower limit must be below upper limit")
        joints[name] = {
            "name": name,
            "lower_rad": lower,
            "upper_rad": upper,
            "lower_deg": math.degrees(lower),
            "upper_deg": math.degrees(upper),
        }
    expected = [f"joint_{index}" for index in range(1, 7)]
    if set(joints) != set(expected):
        raise ValueError(f"{urdf_path} must define finite limits for joint_1 through joint_6")
    return [joints[name] for name in expected]


def _default_frames(coordinates: dict[str, Any], arm: str) -> dict[str, Any]:
    robot = _child_mapping(_child_mapping(coordinates.get("robots"), "coordinates.robots").get(arm), f"coordinates.robots.{arm}")
    default_tool = robot.get("default_tool")
    default_work = robot.get("default_work")
    tools = _child_mapping(robot.get("tools"), f"coordinates.robots.{arm}.tools")
    works = _child_mapping(robot.get("work_frames"), f"coordinates.robots.{arm}.work_frames")
    if default_tool not in tools or default_work not in works:
        raise ValueError(f"coordinates.robots.{arm} defaults must name configured frames")
    tool = _child_mapping(tools[default_tool], f"coordinates.robots.{arm}.tools.{default_tool}")
    work = _child_mapping(works[default_work], f"coordinates.robots.{arm}.work_frames.{default_work}")
    return {
        "base": {"type": 0, "name": "base", "frame_id": f"{arm}/base_link"},
        "work": {"type": 1, "name": str(work["controller_name"]), "frame_id": str(work["ros_frame_id"])},
        "tool": {"type": 2, "name": str(tool["controller_name"]), "frame_id": str(tool["ros_frame_id"])},
    }


def build_manifest(
    layout_path: str | Path,
    motion_path: str | Path,
    coordinates_path: str | Path,
    description_root: str | Path,
) -> dict[str, Any]:
    """Return browser-safe layout data without copying model files."""

    layout_path = Path(layout_path).resolve()
    motion_path = Path(motion_path).resolve()
    coordinates_path = Path(coordinates_path).resolve()
    description_root = Path(description_root).resolve()
    layout = _load_yaml(layout_path)
    motion = _load_yaml(motion_path)
    coordinates = _load_yaml(coordinates_path)
    layout_robots = _child_mapping(layout.get("robots"), "layout.robots")
    motion_robots = _child_mapping(motion.get("robots"), "motion.robots")
    if set(layout_robots) != set(ARMS) or set(motion_robots) != set(ARMS):
        raise ValueError("layout and motion configs must define exactly l, m, and r")

    robots = []
    for arm in ARMS:
        robot = _child_mapping(layout_robots[arm], f"layout.robots.{arm}")
        model = robot.get("model")
        if not isinstance(model, str) or not MODEL_PATTERN.fullmatch(model):
            raise ValueError(f"layout.robots.{arm}.model is invalid")
        urdf_path = (description_root / "urdf" / f"{model}.urdf").resolve()
        if urdf_path.parent != (description_root / "urdf").resolve() or not urdf_path.is_file():
            raise ValueError(f"configured URDF does not exist: {model}")
        transform = {
            field: _finite(robot.get(field), f"layout.robots.{arm}.{field}")
            for field in TRANSFORM_FIELDS
        }
        settings = _child_mapping(motion_robots[arm], f"motion.robots.{arm}")
        motion_settings = {
            key: _finite(settings.get(key), f"motion.robots.{arm}.{key}")
            for key in (
                "default_timeout_sec",
                "max_linear_speed_mps",
                "max_angular_speed_radps",
                "max_linear_accel_mps2",
                "max_angular_accel_radps2",
            )
        }
        motion_settings["velocity_control_period_ms"] = int(settings["velocity_control_period_ms"])
        motion_settings["velocity_watchdog_ms"] = int(settings["velocity_watchdog_ms"])
        robots.append(
            {
                "id": arm,
                "model": model,
                "namespace": robot.get("namespace"),
                "parent_frame": robot.get("parent_frame"),
                "transform": transform,
                "urdf_url": f"/models/urdf/{model}.urdf",
                "package_root_url": "/models",
                "joints": _joint_limits(urdf_path),
                "frames": _default_frames(coordinates, arm),
                "motion": motion_settings,
            }
        )
    settings = _child_mapping(layout.get("settings", {}), "layout.settings")
    return {
        "version": 1,
        "source": {
            "layout": "config/ros/three_robots.yaml",
            "motion": "config/ros/realman_motion.yaml",
            "coordinates": "config/ros/realman_coordinates.yaml",
        },
        "root_frame": robots[0]["parent_frame"],
        "default_joint_position_rad": _finite(
            settings.get("default_joint_position", 0.0), "layout.settings.default_joint_position"
        ),
        "robots": robots,
    }


def resolve_model_asset(description_root: str | Path, relative_path: str) -> Path:
    """Resolve a model request below the package root and reject traversal."""

    root = Path(description_root).resolve()
    candidate = (root / relative_path).resolve()
    if candidate == root or root not in candidate.parents or not candidate.is_file():
        raise ValueError("model asset is outside rm65_description or does not exist")
    return candidate

