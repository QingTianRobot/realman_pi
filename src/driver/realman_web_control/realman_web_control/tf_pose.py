"""Small, dependency-free pose operations used at the Web/TF boundary."""

from __future__ import annotations

import math
from typing import Any


def _quaternion(value: Any) -> tuple[float, float, float, float]:
    if len(value) != 4:
        raise ValueError("quaternion must contain four values")
    q = tuple(float(item) for item in value)
    norm = math.sqrt(sum(item * item for item in q))
    if not math.isfinite(norm) or norm < 1.0e-12:
        raise ValueError("quaternion magnitude must be non-zero")
    return tuple(item / norm for item in q)  # type: ignore[return-value]


def quaternion_multiply(
    left: tuple[float, float, float, float],
    right: tuple[float, float, float, float],
) -> tuple[float, float, float, float]:
    lw, lx, ly, lz = left
    rw, rx, ry, rz = right
    return (
        lw * rw - lx * rx - ly * ry - lz * rz,
        lw * rx + lx * rw + ly * rz - lz * ry,
        lw * ry - lx * rz + ly * rw + lz * rx,
        lw * rz + lx * ry - ly * rx + lz * rw,
    )


def rotate_vector(
    quaternion: tuple[float, float, float, float],
    vector: tuple[float, float, float],
) -> tuple[float, float, float]:
    q = _quaternion(quaternion)
    pure = (0.0, vector[0], vector[1], vector[2])
    inverse = (q[0], -q[1], -q[2], -q[3])
    rotated = quaternion_multiply(quaternion_multiply(q, pure), inverse)
    return rotated[1:]


def compose_pose(
    transform_position: tuple[float, float, float],
    transform_quaternion_wxyz: tuple[float, float, float, float],
    pose_position: tuple[float, float, float],
    pose_quaternion_wxyz: tuple[float, float, float, float],
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Compose ``T_target_source`` with a pose expressed in source."""

    transform_q = _quaternion(transform_quaternion_wxyz)
    pose_q = _quaternion(pose_quaternion_wxyz)
    rotated = rotate_vector(transform_q, pose_position)
    position = tuple(
        float(transform_position[index]) + rotated[index] for index in range(3)
    )
    quaternion = _quaternion(quaternion_multiply(transform_q, pose_q))
    return position, quaternion


def transform_stamped_pose(
    transform: Any,
    pose_position: Any,
    pose_quaternion_wxyz: Any,
) -> tuple[tuple[float, float, float], tuple[float, float, float, float]]:
    """Compose a geometry_msgs TransformStamped with a WXYZ pose."""

    translation = transform.transform.translation
    rotation = transform.transform.rotation
    return compose_pose(
        (float(translation.x), float(translation.y), float(translation.z)),
        (float(rotation.w), float(rotation.x), float(rotation.y), float(rotation.z)),
        tuple(float(value) for value in pose_position),
        tuple(float(value) for value in pose_quaternion_wxyz),
    )
