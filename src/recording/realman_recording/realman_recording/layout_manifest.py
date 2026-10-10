"""Build the minimal, display-only layout manifest for the recording 3D viewer.

The recording dashboard renders the three arms' URDF meshes in real time, so it only
needs each arm's model, world transform and URDF URL.  Unlike ``realman_web_control``
there is no motion/coordinates/frames contract to serve, so this manifest is much
smaller than that package's ``model_manifest``.
"""
from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import yaml


ARMS = ("l", "m", "r")
TRANSFORM_FIELDS = ("x", "y", "z", "roll", "pitch", "yaw")


def _finite(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise ValueError(f"{field} must be a finite number")
    return float(value)


def build_recording_manifest(layout_path: str | Path) -> dict[str, Any]:
    """Return the browser-safe arm layout (model + world transform + URDF URL)."""
    layout_path = Path(layout_path).resolve()
    with layout_path.open("r", encoding="utf-8") as stream:
        layout = yaml.safe_load(stream)
    if not isinstance(layout, dict) or not isinstance(layout.get("robots"), dict):
        raise ValueError(f"{layout_path} must contain a robots mapping")
    robots_yaml = layout["robots"]
    if set(robots_yaml) != set(ARMS):
        raise ValueError("three_robots.yaml must define exactly l, m, and r")

    robots: list[dict[str, Any]] = []
    for arm in ARMS:
        robot = robots_yaml[arm]
        if not isinstance(robot, dict):
            raise ValueError(f"layout.robots.{arm} must be a mapping")
        model = robot.get("model")
        if not isinstance(model, str) or not model:
            raise ValueError(f"layout.robots.{arm}.model is invalid")
        robots.append(
            {
                "id": arm,
                "model": model,
                "transform": {
                    field: _finite(robot.get(field), f"layout.robots.{arm}.{field}")
                    for field in TRANSFORM_FIELDS
                },
                "urdf_url": f"/models/urdf/{model}.urdf",
                "package_root_url": "/models",
            }
        )

    settings = layout.get("settings") or {}
    return {
        "version": 1,
        "default_joint_position_rad": _finite(
            settings.get("default_joint_position", 0.0),
            "layout.settings.default_joint_position",
        ),
        "robots": robots,
    }
