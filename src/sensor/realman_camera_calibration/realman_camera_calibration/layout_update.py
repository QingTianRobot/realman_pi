"""Safe write-back of calibrated three-arm base poses to the layout YAML."""

from __future__ import annotations

from pathlib import Path
import re
import shutil
import tempfile
from typing import Any

import numpy as np
import yaml

from .calibration_math import matrix_to_rpy, rpy_transform


LAYOUT_FIELDS = ("x", "y", "z", "roll", "pitch", "yaw")
ARMS = ("l", "m", "r")


def _format_float(value: float) -> str:
    if not np.isfinite(value):
        raise ValueError("layout transform contains a non-finite value")
    return f"{float(value):.12g}"


def _layout_transform(robot: dict[str, Any]) -> np.ndarray:
    return rpy_transform(
        float(robot["roll"]),
        float(robot["pitch"]),
        float(robot["yaw"]),
        [float(robot["x"]), float(robot["y"]), float(robot["z"])],
    )


def calibrated_layout_values(
    layout: dict[str, Any], relative_base_poses: dict[str, Any]
) -> dict[str, dict[str, float]]:
    """Return world-layout fields while keeping the configured left arm fixed."""
    robots = layout.get("robots")
    if not isinstance(robots, dict) or any(arm not in robots for arm in ARMS):
        raise ValueError("layout must contain robots l, m and r")
    anchor = _layout_transform(robots["l"])
    values: dict[str, dict[str, float]] = {}
    for arm in ARMS:
        if arm == "l":
            # Preserve the configured anchor exactly; only the other arms are
            # derived from calibrated relative transforms.
            values[arm] = {field: float(robots[arm][field]) for field in LAYOUT_FIELDS}
            continue
        if arm not in relative_base_poses:
            raise ValueError(f"calibration result has no relative pose for {arm}")
        pose = anchor @ np.asarray(relative_base_poses[arm], dtype=np.float64).reshape(4, 4)
        roll, pitch, yaw = matrix_to_rpy(pose)
        values[arm] = {
            "x": float(pose[0, 3]),
            "y": float(pose[1, 3]),
            "z": float(pose[2, 3]),
            "roll": roll,
            "pitch": pitch,
            "yaw": yaw,
        }
    return values


def update_layout_file(
    path: str | Path,
    relative_base_poses: dict[str, Any],
    *,
    create_backup: bool = True,
) -> Path | None:
    """Atomically update only transform scalars, preserving comments and formatting."""
    layout_path = Path(path).expanduser().resolve()
    source = layout_path.read_text(encoding="utf-8")
    layout = yaml.safe_load(source)
    values = calibrated_layout_values(layout, relative_base_poses)
    lines = source.splitlines(keepends=True)
    arm_ranges: dict[str, tuple[int, int]] = {}
    robot_start: int | None = None
    robot_indent = ""
    for index, line in enumerate(lines):
        match = re.match(r"^(\s*)([lmr]):\s*(?:#.*)?$", line.rstrip("\n"))
        if match and (robot_start is None or len(match.group(1)) <= len(robot_indent)):
            if robot_start is not None:
                arm_ranges[current_arm] = (robot_start, index)
            robot_start = index
            current_arm = match.group(2)
            robot_indent = match.group(1)
    if robot_start is not None:
        arm_ranges[current_arm] = (robot_start, len(lines))
    if set(arm_ranges) != set(ARMS):
        raise ValueError("layout robots section must contain exactly l, m and r")

    updated = list(lines)
    scalar_pattern = re.compile(r"^(\s*)(x|y|z|roll|pitch|yaw)(\s*:\s*)([^#\n]*)(.*)$")
    for arm in ARMS:
        start, end = arm_ranges[arm]
        seen: set[str] = set()
        for index in range(start + 1, end):
            match = scalar_pattern.match(updated[index].rstrip("\n"))
            if not match or match.group(2) not in LAYOUT_FIELDS:
                continue
            field = match.group(2)
            newline = "\n" if updated[index].endswith("\n") else ""
            updated[index] = (
                f"{match.group(1)}{field}{match.group(3)}{_format_float(values[arm][field])}"
                f"{match.group(5)}{newline}"
            )
            seen.add(field)
        if seen != set(LAYOUT_FIELDS):
            raise ValueError(f"layout robot {arm} is missing a transform field")

    backup_path = layout_path.with_suffix(layout_path.suffix + ".bak") if create_backup else None
    if backup_path is not None:
        shutil.copy2(layout_path, backup_path)
    temp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=layout_path.parent, prefix=f".{layout_path.name}.", suffix=".tmp", delete=False
        ) as stream:
            stream.write("".join(updated))
            stream.flush()
            temp_path = stream.name
        Path(temp_path).replace(layout_path)
    finally:
        if temp_path is not None:
            Path(temp_path).unlink(missing_ok=True)
    return backup_path
