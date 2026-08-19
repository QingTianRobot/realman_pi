"""Small rigid-pose conversions for kinematics service boundaries."""

from __future__ import annotations

import math
from typing import Sequence

from .quaternion_math import conjugate, multiply, normalize, rotate_vector


def euler_to_quaternion(roll: float, pitch: float, yaw: float) -> tuple[float, float, float, float]:
    """Convert the SDK's roll/pitch/yaw radians to a wxyz quaternion."""
    cr, sr = math.cos(roll / 2.0), math.sin(roll / 2.0)
    cp, sp = math.cos(pitch / 2.0), math.sin(pitch / 2.0)
    cy, sy = math.cos(yaw / 2.0), math.sin(yaw / 2.0)
    return normalize((
        cr * cp * cy + sr * sp * sy,
        sr * cp * cy - cr * sp * sy,
        cr * sp * cy + sr * cp * sy,
        cr * cp * sy - sr * sp * cy,
    ))


def quaternion_to_euler(quaternion: Sequence[float]) -> tuple[float, float, float]:
    """Convert a wxyz quaternion to the SDK's roll/pitch/yaw radians."""
    w, x, y, z = normalize(quaternion)
    roll = math.atan2(2.0 * (w * x + y * z), 1.0 - 2.0 * (x * x + y * y))
    pitch_sine = 2.0 * (w * y - z * x)
    pitch = math.asin(max(-1.0, min(1.0, pitch_sine)))
    yaw = math.atan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z))
    return roll, pitch, yaw


def compose_pose(
    first: Sequence[float], first_quaternion: Sequence[float],
    second: Sequence[float], second_quaternion: Sequence[float],
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Compose ``T_first * T_second`` using metres and wxyz quaternions."""
    rotation = normalize(first_quaternion)
    position = tuple(
        float(first[index]) + rotate_vector(rotation, second)[index]
        for index in range(3)
    )
    return position, normalize(multiply(rotation, normalize(second_quaternion)))


def invert_pose(
    position: Sequence[float], quaternion: Sequence[float]
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Return the inverse transform for a frame pose."""
    inverse_rotation = normalize(conjugate(quaternion))
    inverse_position = tuple(-value for value in rotate_vector(inverse_rotation, position))
    return inverse_position, inverse_rotation


def pose_to_reference(
    base_position: Sequence[float],
    base_quaternion: Sequence[float],
    reference_position: Sequence[float],
    reference_quaternion: Sequence[float],
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Express a base-frame pose in a fixed work-frame reference."""
    inverse_position, inverse_quaternion = invert_pose(reference_position, reference_quaternion)
    return compose_pose(
        inverse_position,
        inverse_quaternion,
        base_position,
        base_quaternion,
    )


def pose_from_reference(
    reference_position: Sequence[float],
    reference_quaternion: Sequence[float],
    target_position: Sequence[float],
    target_quaternion: Sequence[float],
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Express a reference-frame pose in the robot base frame."""
    return compose_pose(
        reference_position,
        reference_quaternion,
        target_position,
        target_quaternion,
    )
