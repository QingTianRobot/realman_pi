"""Load and validate the episode trigger config and the Pika home pose (no ROS imports)."""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ARM_NAMESPACES = {"left": "l", "middle": "m", "right": "r"}


@dataclass(frozen=True)
class EpisodeConfig:
    enabled: bool
    task: str
    profile: str
    record_cameras: bool
    keyboard_topic: str
    required_mode: str
    keyboard_stale_sec: float
    # A stop press restarts the BT branch: select restart_off_mode, then required_mode again (its entry
    # MoveJ homes the arms). Each selection must be ACTIVE within its timeout.
    restart_off_mode: str = "none"
    restart_off_timeout_sec: float = 10.0
    restart_timeout_sec: float = 150.0
    # arm namespace -> gripper device name; homing opens these grippers (an empty mapping opens none).
    home_open_grippers: dict[str, str] = field(default_factory=dict)


def _read(path: Path) -> dict:
    try:
        document = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    except OSError as error:
        raise ValueError(f"{path}: cannot read ({error.strerror or error})") from error
    except yaml.YAMLError as error:
        raise ValueError(f"{path}: invalid YAML ({error})") from error
    if not isinstance(document, dict):
        raise ValueError(f"{path}: expected a mapping")
    return document


def _bool(path: Path, doc: dict, key: str) -> bool:
    value = doc.get(key)
    if not isinstance(value, bool):
        raise ValueError(f"{path}: {key} must be true or false")
    return value


def _str(path: Path, doc: dict, key: str, allow_empty: bool = False) -> str:
    value = doc.get(key)
    if not isinstance(value, str) or (not allow_empty and not value):
        raise ValueError(f"{path}: {key} must be a {'string' if allow_empty else 'non-empty string'}")
    return value


def _positive(path: Path, doc: dict, key: str) -> float:
    value = doc.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
        raise ValueError(f"{path}: {key} must be a positive number")
    return float(value)


def _optional_positive(path: Path, doc: dict, key: str, default: float) -> float:
    return default if key not in doc else _positive(path, doc, key)


def _grippers(path: Path, doc: dict) -> dict[str, str]:
    key = "home_open_grippers"
    value = doc.get(key)
    if value is None and key in doc:
        return {}
    if not isinstance(value, dict):
        raise ValueError(f"{path}: {key} must be a mapping of arm (l/m/r) to gripper name")
    namespaces = set(ARM_NAMESPACES.values())
    for arm, name in value.items():
        if arm not in namespaces:
            raise ValueError(f"{path}: {key}.{arm}: arm must be one of l, m, r")
        if not isinstance(name, str) or not name:
            raise ValueError(f"{path}: {key}.{arm} must be a non-empty gripper name")
    return dict(value)


def load_episode_config(path: Path) -> EpisodeConfig:
    doc = _read(path)
    # release_timeout_sec / home_velocity_percent / home_timeout_sec belonged to the trigger's own homing
    # MoveJ; the branch entry MoveJ homes now, so older host files that still carry them load unchanged.
    off_mode = doc.get("restart_off_mode", "none")
    if not isinstance(off_mode, str) or not off_mode:
        raise ValueError(f"{path}: restart_off_mode must be a non-empty string")
    required_mode = _str(path, doc, "required_mode")
    if off_mode == required_mode:
        raise ValueError(f"{path}: restart_off_mode must differ from required_mode")
    return EpisodeConfig(
        enabled=_bool(path, doc, "enabled"),
        task=_str(path, doc, "task", allow_empty=True),
        profile=_str(path, doc, "profile"),
        record_cameras=_bool(path, doc, "record_cameras"),
        keyboard_topic=_str(path, doc, "keyboard_topic"),
        required_mode=required_mode,
        keyboard_stale_sec=_positive(path, doc, "keyboard_stale_sec"),
        home_open_grippers=_grippers(path, doc),
        restart_off_mode=off_mode,
        restart_off_timeout_sec=_optional_positive(path, doc, "restart_off_timeout_sec", 10.0),
        restart_timeout_sec=_optional_positive(path, doc, "restart_timeout_sec", 150.0),
    )


def load_home_pose(path: Path) -> dict[str, tuple[float, ...]]:
    pose = _read(path).get("pika_default_pose")
    if not isinstance(pose, dict):
        raise ValueError(f"{path}: missing pika_default_pose")
    result: dict[str, tuple[float, ...]] = {}
    for name, namespace in ARM_NAMESPACES.items():
        arm = pose.get(name)
        if not isinstance(arm, dict):
            raise ValueError(f"{path}: pika_default_pose.{name} is missing")
        skip = arm.get("skip", False)
        if not isinstance(skip, bool):
            raise ValueError(f"{path}: pika_default_pose.{name}.skip must be true or false")
        if skip:
            continue
        joints = arm.get("joint_degrees")
        if not isinstance(joints, list) or len(joints) != 6:
            raise ValueError(f"{path}: pika_default_pose.{name}.joint_degrees must contain six values")
        if any(isinstance(j, bool) or not isinstance(j, (int, float)) or not math.isfinite(j) for j in joints):
            raise ValueError(f"{path}: pika_default_pose.{name}.joint_degrees must be finite numbers")
        result[namespace] = tuple(float(j) for j in joints)
    if not result:
        raise ValueError(f"{path}: pika_default_pose must keep at least one arm (all are skip: true)")
    return result
