"""Validate and derive dual-arm Web keyboard velocity settings."""

from __future__ import annotations

from dataclasses import dataclass
import math
from pathlib import Path
import re
from typing import Any

import yaml


_ARMS = ("l", "r")
_AXES = ("vx", "vy", "vz", "wx", "wy", "wz")
_CODE = re.compile(r"Key[A-Z]|Digit[0-9]")


@dataclass(frozen=True)
class KeyboardArmCommand:
    arm: str
    linear: tuple[float, float, float]
    angular: tuple[float, float, float]
    reference_name: str
    frame_id: str
    gripper_command: str | None = None


@dataclass(frozen=True)
class KeyboardArmConfig:
    bindings: dict[str, tuple[str, str]]
    allowed_codes: frozenset[str]
    linear_speed_mps: float
    angular_speed_radps: float
    reference_name: str
    frame_id: str


@dataclass(frozen=True)
class KeyboardControlConfig:
    heartbeat_period_ms: int
    input_timeout_ms: int
    arms: dict[str, KeyboardArmConfig]
    grippers: dict[str, dict[str, str]]

    def command(self, arm: str, keys: frozenset[str]) -> KeyboardArmCommand:
        arm_config = self.arms.get(arm)
        if arm_config is None:
            raise ValueError("keyboard arm must be l or r")
        unknown = keys - arm_config.allowed_codes
        if unknown:
            raise ValueError(f"unknown keyboard codes for {arm}: {sorted(unknown)}")
        values = []
        for axis in _AXES:
            positive, negative = arm_config.bindings[axis]
            values.append(float(positive in keys) - float(negative in keys))
        linear = tuple(value * arm_config.linear_speed_mps for value in values[:3])
        angular = tuple(value * arm_config.angular_speed_radps for value in values[3:])
        return KeyboardArmCommand(
            arm, linear, angular, arm_config.reference_name, arm_config.frame_id
        )

    def public_manifest(self) -> dict[str, object]:
        return {
            "heartbeat_period_ms": self.heartbeat_period_ms,
            "input_timeout_ms": self.input_timeout_ms,
            "grippers": {arm: dict(bindings) for arm, bindings in self.grippers.items()},
            "arms": {
                arm: {
                    "bindings": {
                        axis: {"positive": pair[0], "negative": pair[1]}
                        for axis, pair in config.bindings.items()
                    },
                    "linear_speed_mps": config.linear_speed_mps,
                    "angular_speed_radps": config.angular_speed_radps,
                    "work_reference_name": config.reference_name,
                    "work_frame_id": config.frame_id,
                }
                for arm, config in self.arms.items()
            },
        }


def _mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{field} must be a mapping")
    return value


def _load(path: str | Path) -> dict[str, Any]:
    source = Path(path)
    with source.open("r", encoding="utf-8") as stream:
        return _mapping(yaml.safe_load(stream), str(source))


def _positive_fraction(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be a number")
    result = float(value)
    if not math.isfinite(result) or not 0.0 < result <= 1.0:
        raise ValueError(f"{field} must be within (0, 1]")
    return result


def _positive_speed(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be a positive finite number")
    result = float(value)
    if not math.isfinite(result) or result <= 0.0:
        raise ValueError(f"{field} must be a positive finite number")
    return result


def load_keyboard_control_config(
    keyboard_path: str | Path,
    motion_path: str | Path,
    coordinates_path: str | Path,
) -> KeyboardControlConfig:
    """Validate root YAML sources and derive immutable l/r settings."""

    document = _load(keyboard_path)
    motion = _load(motion_path)
    coordinates = _load(coordinates_path)
    arms_document = _mapping(document.get("arms"), "keyboard.arms")
    if set(arms_document) != set(_ARMS):
        raise ValueError("keyboard.arms must define exactly l and r")
    grippers_document = _mapping(document.get("grippers"), "keyboard.grippers")
    if set(grippers_document) != set(_ARMS):
        raise ValueError("keyboard.grippers must define exactly l and r")

    heartbeat = document.get("heartbeat_period_ms")
    timeout = document.get("input_timeout_ms")
    if (isinstance(heartbeat, bool) or not isinstance(heartbeat, int) or
            isinstance(timeout, bool) or not isinstance(timeout, int) or
            not 10 <= heartbeat < timeout):
        raise ValueError("keyboard timing must satisfy 10 <= heartbeat < input timeout")
    linear_fraction = _positive_fraction(
        document.get("linear_speed_fraction"), "linear_speed_fraction"
    )
    angular_fraction = _positive_fraction(
        document.get("angular_speed_fraction"), "angular_speed_fraction"
    )
    motion_robots = _mapping(motion.get("robots"), "motion.robots")
    coordinate_robots = _mapping(coordinates.get("robots"), "coordinates.robots")

    seen_codes: set[str] = set()
    grippers: dict[str, dict[str, str]] = {}
    for arm in _ARMS:
        pair = _mapping(grippers_document[arm], f"keyboard.grippers.{arm}")
        if set(pair) != {"open", "close"}:
            raise ValueError(f"keyboard.grippers.{arm} must define open and close")
        codes = (pair["open"], pair["close"])
        if not all(isinstance(code, str) and _CODE.fullmatch(code) for code in codes):
            raise ValueError("keyboard codes must match physical KeyA–KeyZ or Digit0–Digit9")
        if codes[0] == codes[1] or seen_codes.intersection(codes):
            raise ValueError("keyboard physical codes must be globally unique")
        seen_codes.update(codes)
        grippers[arm] = dict(pair)
    arms: dict[str, KeyboardArmConfig] = {}
    for arm in _ARMS:
        bindings_document = _mapping(arms_document[arm], f"keyboard.arms.{arm}")
        if set(bindings_document) != set(_AXES):
            raise ValueError(f"keyboard.arms.{arm} must define exactly {_AXES}")
        bindings: dict[str, tuple[str, str]] = {}
        for axis in _AXES:
            pair = _mapping(bindings_document[axis], f"keyboard.arms.{arm}.{axis}")
            if set(pair) != {"positive", "negative"}:
                raise ValueError(f"keyboard.arms.{arm}.{axis} must define positive and negative")
            codes = (pair["positive"], pair["negative"])
            if not all(isinstance(code, str) and _CODE.fullmatch(code) for code in codes):
                raise ValueError("keyboard codes must match physical KeyA–KeyZ or Digit0–Digit9")
            if codes[0] == codes[1] or seen_codes.intersection(codes):
                raise ValueError("keyboard physical codes must be globally unique")
            seen_codes.update(codes)
            bindings[axis] = codes

        motion_arm = _mapping(motion_robots.get(arm), f"motion.robots.{arm}")
        coordinate_arm = _mapping(
            coordinate_robots.get(arm), f"coordinates.robots.{arm}"
        )
        default_work = coordinate_arm.get("default_work")
        works = _mapping(
            coordinate_arm.get("work_frames"),
            f"coordinates.robots.{arm}.work_frames",
        )
        if not isinstance(default_work, str) or default_work not in works:
            raise ValueError(f"coordinates.robots.{arm} default_work is missing")
        work = _mapping(works[default_work], f"coordinates.robots.{arm}.work_frames.{default_work}")
        controller_name = work.get("controller_name")
        frame_id = work.get("ros_frame_id")
        if not isinstance(controller_name, str) or not controller_name or not isinstance(frame_id, str) or not frame_id:
            raise ValueError(f"coordinates.robots.{arm} default WORK names are missing")
        arms[arm] = KeyboardArmConfig(
            bindings=bindings,
            allowed_codes=frozenset(code for pair in bindings.values() for code in pair)
            | frozenset(grippers[arm].values()),
            linear_speed_mps=linear_fraction * _positive_speed(
                motion_arm.get("max_linear_speed_mps"),
                f"motion.robots.{arm}.max_linear_speed_mps",
            ),
            angular_speed_radps=angular_fraction * _positive_speed(
                motion_arm.get("max_angular_speed_radps"),
                f"motion.robots.{arm}.max_angular_speed_radps",
            ),
            reference_name=controller_name,
            frame_id=frame_id,
        )
    return KeyboardControlConfig(heartbeat, timeout, arms, grippers)
