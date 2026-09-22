"""Pure browser-facing payload sanitizers shared by the ROS Web bridge."""
from __future__ import annotations

import json
import math
from typing import Any


_COORDINATE_FIELDS = frozenset(
    {"x", "y", "z", "roll", "pitch", "yaw", "position", "orientation", "pose"}
)


def safe_coordinate_subset(payload: str) -> dict[str, Any]:
    """Parse a driver coordinate JSON into a bounded browser-safe numeric subset."""
    try:
        value = json.loads(payload)
    except (TypeError, json.JSONDecodeError):
        return {"valid": False, "error": "invalid_json"}
    if not isinstance(value, dict):
        return {"valid": False, "error": "object_required"}
    result: dict[str, Any] = {"valid": True}
    for key, item in value.items():
        if str(key) not in _COORDINATE_FIELDS:
            continue
        if isinstance(item, (int, float)) and not isinstance(item, bool):
            if math.isfinite(float(item)):
                result[str(key)] = float(item)
        elif isinstance(item, (list, tuple)) and len(item) <= 16:
            numbers = [
                float(number)
                for number in item
                if isinstance(number, (int, float)) and not isinstance(number, bool)
            ]
            if len(numbers) == len(item) and all(math.isfinite(number) for number in numbers):
                result[str(key)] = numbers
    return result
