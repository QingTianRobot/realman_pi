"""Configuration validation and stable ROS interface naming for grippers."""

from __future__ import annotations

from pathlib import Path
import re

import yaml


NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")
SERVICE_SUFFIXES = ("open", "close", "reset", "enable", "grasp_check", "percentage", "calibrate")
TOPIC_SUFFIXES = ("position", "speed", "current", "torque_reached", "alarm", "connected")


def interface_names(name: str) -> dict[str, str]:
    if not NAME_PATTERN.fullmatch(name):
        raise ValueError(f"invalid gripper name: {name!r}")
    return {suffix: f"/{name}/{suffix}" for suffix in SERVICE_SUFFIXES + TOPIC_SUFFIXES}


def percentage_to_position(percentage: float, *, open_position: int,
                           close_position: int) -> int:
    value = float(percentage)
    if not 0.0 <= value <= 1.0:
        raise ValueError("percentage must be in 0.0..1.0")
    return int(round(close_position + value * (open_position - close_position)))


def load_gripper_config(path: str | Path) -> dict:
    path = Path(path)
    document = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    buses = document.get("buses")
    if not isinstance(buses, list) or not buses:
        raise ValueError("gripper config must contain a non-empty buses list")
    names = set()
    for bus in buses:
        if not isinstance(bus, dict) or not isinstance(bus.get("port"), str) or not bus["port"]:
            raise ValueError("each gripper bus requires a non-empty port")
        grippers = bus.get("grippers")
        if not isinstance(grippers, list) or not grippers:
            raise ValueError(f"gripper bus {bus['port']} requires at least one gripper")
        slave_ids = set()
        for gripper in grippers:
            name = gripper.get("name")
            interface_names(name)
            if name in names:
                raise ValueError(f"duplicate gripper name: {name}")
            names.add(name)
            slave_id = gripper.get("slave_id")
            if isinstance(slave_id, bool) or not isinstance(slave_id, int) or not 1 <= slave_id <= 247:
                raise ValueError(f"{name}.slave_id must be in 1..247")
            if slave_id in slave_ids:
                raise ValueError(f"duplicate slave_id {slave_id} on {bus['port']}")
            slave_ids.add(slave_id)
            for field in ("min_position", "max_position", "open_position", "close_position"):
                if isinstance(gripper.get(field), bool) or not isinstance(gripper.get(field), int):
                    raise ValueError(f"{name}.{field} must be an integer")
            minimum, maximum = gripper["min_position"], gripper["max_position"]
            if minimum > maximum:
                raise ValueError(f"{name}.min_position must not exceed max_position")
            if not minimum <= gripper["open_position"] <= maximum:
                raise ValueError(f"{name}.open_position is outside configured limits")
            if not minimum <= gripper["close_position"] <= maximum:
                raise ValueError(f"{name}.close_position is outside configured limits")
    return document
