"""Speed clipping and acceleration limiting, matching the ROS driver exactly.

The production driver clips the requested twist to the session speed limits and
then limits how far the vector may move per tick. Reproducing both here means a
run measures the same shaping an operator gets through the Web page, so a
difference in the result points at the controller rather than at this tool.

Both operations preserve direction: they scale the whole linear or angular
3-vector rather than clamping components independently, which would rotate the
commanded direction.
"""

from __future__ import annotations

import math
from typing import Sequence


def clip_speed(
    vector: Sequence[float],
    max_linear_speed_mps: float,
    max_angular_speed_radps: float,
) -> tuple[float, ...]:
    """Scale the linear and angular parts down to their limits."""
    linear_norm = math.hypot(*vector[:3])
    angular_norm = math.hypot(*vector[3:])
    linear_scale = min(1.0, max_linear_speed_mps / linear_norm) if linear_norm else 1.0
    angular_scale = min(1.0, max_angular_speed_radps / angular_norm) if angular_norm else 1.0
    return tuple(
        value * (linear_scale if index < 3 else angular_scale)
        for index, value in enumerate(vector)
    )


def limit_vector_delta(
    previous: Sequence[float],
    target: Sequence[float],
    max_acceleration: float,
    dt: float,
) -> tuple[float, ...]:
    """Limit a vector change to ``max_acceleration * dt``, preserving direction."""
    if len(previous) != len(target):
        raise ValueError("vectors must have the same length")
    old = [float(value) for value in previous]
    new = [float(value) for value in target]
    if not all(math.isfinite(value) for value in old + new):
        raise ValueError("vectors must contain finite values")
    if not math.isfinite(max_acceleration) or max_acceleration < 0.0:
        raise ValueError("max_acceleration must be a finite non-negative number")
    if not math.isfinite(dt) or dt < 0.0:
        raise ValueError("dt must be a finite non-negative number")
    delta = [new_value - old_value for old_value, new_value in zip(old, new)]
    norm = math.hypot(*delta)
    max_delta = max_acceleration * dt
    if norm == 0.0 or norm <= max_delta:
        return tuple(new)
    scale = max_delta / norm
    return tuple(old_value + scale * difference for old_value, difference in zip(old, delta))


def shape_command(
    previous_limited: Sequence[float],
    requested: Sequence[float],
    *,
    max_linear_speed_mps: float,
    max_angular_speed_radps: float,
    max_linear_accel_mps2: float,
    max_angular_accel_radps2: float,
    dt: float,
) -> tuple[tuple[float, ...], tuple[float, ...]]:
    """Return ``(clipped, limited)`` for one tick.

    ``clipped`` is what was asked for after the speed ceiling; ``limited`` is
    what may actually be sent this tick. Recording both is what separates "the
    limit truncated my request" from "the arm did not follow".
    """
    clipped = clip_speed(requested, max_linear_speed_mps, max_angular_speed_radps)
    linear = limit_vector_delta(previous_limited[:3], clipped[:3], max_linear_accel_mps2, dt)
    angular = limit_vector_delta(previous_limited[3:], clipped[3:], max_angular_accel_radps2, dt)
    return clipped, tuple(linear + angular)


__all__ = ["clip_speed", "limit_vector_delta", "shape_command"]
