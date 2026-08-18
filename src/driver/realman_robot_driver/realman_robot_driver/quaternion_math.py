"""Finite, wxyz-ordered quaternion operations used by motion control.

The module intentionally contains no Euler-angle conversion.  Angular
velocity integration uses a quaternion exponential and keeps the
body/spatial multiplication convention explicit at the call site.
"""

from __future__ import annotations

import math
from typing import Sequence


Quaternion = tuple[float, float, float, float]
Vector3 = tuple[float, float, float]
Twist6 = tuple[float, float, float, float, float, float]


def _finite_number(value: object, context: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{context} must contain finite values")
    result = float(value)
    if not math.isfinite(result):
        raise ValueError(f"{context} must contain finite values")
    return result


def _finite_sequence(value: Sequence[object], length: int, context: str) -> tuple[float, ...]:
    if isinstance(value, (str, bytes)) or not isinstance(value, Sequence) or len(value) != length:
        raise ValueError(f"{context} must contain exactly {length} values")
    return tuple(_finite_number(item, context) for item in value)


def _quaternion(value: Sequence[object], context: str = "quaternion") -> Quaternion:
    components = _finite_sequence(value, 4, context)
    return components  # type: ignore[return-value]


def _vector3(value: Sequence[object], context: str = "vector") -> Vector3:
    components = _finite_sequence(value, 3, context)
    return components  # type: ignore[return-value]


def _twist(value: Sequence[object], context: str = "twist") -> Twist6:
    components = _finite_sequence(value, 6, context)
    return components  # type: ignore[return-value]


def normalize(quaternion: Sequence[object]) -> Quaternion:
    """Return a unit quaternion in ``(w, x, y, z)`` order.

    Scaling before computing the norm avoids overflow for otherwise finite
    values.  A zero norm is rejected because it has no meaningful rotation.
    """

    components = _quaternion(quaternion)
    scale = max(abs(component) for component in components)
    if scale == 0.0:
        raise ValueError("quaternion must have a non-zero norm")
    scaled = tuple(component / scale for component in components)
    norm = math.sqrt(sum(component * component for component in scaled))
    result = tuple(component / norm for component in scaled)
    return result  # type: ignore[return-value]


def multiply(first: Sequence[object], second: Sequence[object]) -> Quaternion:
    """Hamilton product of two wxyz quaternions."""

    w1, x1, y1, z1 = _quaternion(first, "first quaternion")
    w2, x2, y2, z2 = _quaternion(second, "second quaternion")
    result = (
        w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
        w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
        w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
        w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
    )
    if not all(math.isfinite(component) for component in result):
        raise ValueError("quaternion multiplication result must contain finite values")
    return result


def conjugate(quaternion: Sequence[object]) -> Quaternion:
    """Return the conjugate of a wxyz quaternion."""

    w, x, y, z = _quaternion(quaternion)
    return (w, -x, -y, -z)


def quaternion_exp(angular_velocity: Sequence[object], dt: object) -> Quaternion:
    """Exponential map of angular velocity over ``dt`` seconds.

    ``angular_velocity`` is a 3-vector in radians per second.  ``dt`` may be
    negative for reverse integration, but must be finite.
    """

    wx, wy, wz = _vector3(angular_velocity, "angular_velocity")
    duration = _finite_number(dt, "dt")
    speed = math.hypot(wx, wy, wz)
    if not math.isfinite(speed):
        raise ValueError("angular_velocity must have a finite norm")
    angle = speed * duration
    if not math.isfinite(angle):
        raise ValueError("angular_velocity and dt must produce a finite angle")
    half_angle = angle * 0.5
    if speed == 0.0:
        return (1.0, 0.0, 0.0, 0.0)
    scale = math.sin(half_angle) / speed
    return normalize((math.cos(half_angle), wx * scale, wy * scale, wz * scale))


def integrate_body_quaternion(
    current: Sequence[object], angular_velocity: Sequence[object], dt: object
) -> Quaternion:
    """Integrate body/tool angular velocity by right multiplication."""

    increment = quaternion_exp(angular_velocity, dt)
    return normalize(multiply(normalize(current), increment))


def integrate_spatial_quaternion(
    current: Sequence[object], angular_velocity: Sequence[object], dt: object
) -> Quaternion:
    """Integrate spatial/base angular velocity by left multiplication."""

    increment = quaternion_exp(angular_velocity, dt)
    return normalize(multiply(increment, normalize(current)))


def rotate_vector(quaternion: Sequence[object], vector: Sequence[object]) -> Vector3:
    """Rotate a vector by an explicit frame quaternion."""

    rotation = normalize(quaternion)
    vx, vy, vz = _vector3(vector)
    rotated = multiply(multiply(rotation, (0.0, vx, vy, vz)), conjugate(rotation))
    return rotated[1], rotated[2], rotated[3]


def transform_twist(quaternion: Sequence[object], twist: Sequence[object]) -> Twist6:
    """Rotate linear and angular components for an explicit frame transform.

    This helper is only for callers that explicitly request a frame
    conversion.  TOOL/WORK controller commands remain in their selected
    controller frame and should not pass through this function implicitly.
    """

    values = _twist(twist)
    linear = rotate_vector(quaternion, values[:3])
    angular = rotate_vector(quaternion, values[3:])
    return (*linear, *angular)


def is_finite_quaternion(value: object) -> bool:
    """Return whether ``value`` is a finite four-element quaternion."""

    try:
        _quaternion(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return False
    return True


def is_finite_vector(value: object, length: int = 3) -> bool:
    """Return whether ``value`` is a finite vector of ``length`` values."""

    try:
        _finite_sequence(value, length, "vector")  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return False
    return True


__all__ = [
    "Quaternion",
    "Twist6",
    "Vector3",
    "conjugate",
    "integrate_body_quaternion",
    "integrate_spatial_quaternion",
    "is_finite_quaternion",
    "is_finite_vector",
    "multiply",
    "normalize",
    "quaternion_exp",
    "rotate_vector",
    "transform_twist",
]
