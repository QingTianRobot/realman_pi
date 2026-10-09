"""Shared Cartesian axis vocabulary for commands, profiles and reports."""

from __future__ import annotations


# Index order matches geometry_msgs/Twist and realman_msgs velocity vectors:
# linear x/y/z first, then angular x/y/z.
AXIS_NAMES: tuple[str, ...] = ("vx", "vy", "vz", "wx", "wy", "wz")

LINEAR_AXES: tuple[str, ...] = AXIS_NAMES[:3]
ANGULAR_AXES: tuple[str, ...] = AXIS_NAMES[3:]

ZERO_COMMAND: tuple[float, ...] = (0.0,) * 6


def axis_index(axis: str) -> int:
    """Return the 0..5 vector slot for an axis name."""
    try:
        return AXIS_NAMES.index(axis)
    except ValueError as error:
        raise ValueError(
            f"unknown axis {axis!r}; expected one of {', '.join(AXIS_NAMES)}"
        ) from error


def is_angular(axis: str) -> bool:
    """Report whether an axis carries rad/s instead of m/s."""
    return axis_index(axis) >= 3


__all__ = [
    "AXIS_NAMES",
    "ANGULAR_AXES",
    "LINEAR_AXES",
    "ZERO_COMMAND",
    "axis_index",
    "is_angular",
]
