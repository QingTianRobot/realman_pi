"""Load and validate the episode trigger config and the Pika home pose (no ROS imports)."""
from __future__ import annotations

import math
from dataclasses import dataclass
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
    release_timeout_sec: float
    home_velocity_percent: int
    home_timeout_sec: float


def _read(path: Path) -> dict:
    document = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
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


def load_episode_config(path: Path) -> EpisodeConfig:
    doc = _read(path)
    velocity = doc.get("home_velocity_percent")
    if isinstance(velocity, bool) or not isinstance(velocity, int) or not 1 <= velocity <= 100:
        raise ValueError(f"{path}: home_velocity_percent must be an integer in 1..100")
    return EpisodeConfig(
        enabled=_bool(path, doc, "enabled"),
        task=_str(path, doc, "task", allow_empty=True),
        profile=_str(path, doc, "profile"),
        record_cameras=_bool(path, doc, "record_cameras"),
        keyboard_topic=_str(path, doc, "keyboard_topic"),
        required_mode=_str(path, doc, "required_mode"),
        keyboard_stale_sec=_positive(path, doc, "keyboard_stale_sec"),
        release_timeout_sec=_positive(path, doc, "release_timeout_sec"),
        home_velocity_percent=velocity,
        home_timeout_sec=_positive(path, doc, "home_timeout_sec"),
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
