"""Dependency-light URDF forward kinematics for derived recording features."""
from __future__ import annotations

from dataclasses import dataclass
from math import acos, cos, isfinite, pi, sin, sqrt
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET

Matrix = tuple[tuple[float, float, float, float], tuple[float, float, float, float], tuple[float, float, float, float], tuple[float, float, float, float]]


def _matmul(left: Matrix, right: Matrix) -> Matrix:
    return tuple(tuple(sum(left[row][k] * right[k][column] for k in range(4)) for column in range(4)) for row in range(4))  # type: ignore[return-value]


def _rpy(x: float, y: float, z: float) -> Matrix:
    cx, sx, cy, sy, cz, sz = cos(x), sin(x), cos(y), sin(y), cos(z), sin(z)
    return ((cy * cz, cz * sx * sy - cx * sz, sx * sz + cx * cz * sy, 0.0),
            (cy * sz, cx * cz + sx * sy * sz, cx * sy * sz - cz * sx, 0.0),
            (-sy, cy * sx, cx * cy, 0.0), (0.0, 0.0, 0.0, 1.0))


def _origin(xyz: tuple[float, float, float], rpy: tuple[float, float, float]) -> Matrix:
    matrix = [list(row) for row in _rpy(*rpy)]
    matrix[0][3], matrix[1][3], matrix[2][3] = xyz
    return tuple(tuple(row) for row in matrix)  # type: ignore[return-value]


def _axis_angle(axis: tuple[float, float, float], angle: float) -> Matrix:
    x, y, z = axis
    norm = sqrt(x * x + y * y + z * z)
    if norm == 0:
        raise ValueError("URDF joint axis must be non-zero")
    x, y, z = x / norm, y / norm, z / norm
    c, s, one_minus_c = cos(angle), sin(angle), 1 - cos(angle)
    return ((c + x*x*one_minus_c, x*y*one_minus_c-z*s, x*z*one_minus_c+y*s, 0.0),
            (y*x*one_minus_c+z*s, c+y*y*one_minus_c, y*z*one_minus_c-x*s, 0.0),
            (z*x*one_minus_c-y*s, z*y*one_minus_c+x*s, c+z*z*one_minus_c, 0.0), (0.0, 0.0, 0.0, 1.0))


def _quaternion(matrix: Matrix) -> tuple[float, float, float, float]:
    trace = matrix[0][0] + matrix[1][1] + matrix[2][2]
    if trace > 0:
        scale = sqrt(trace + 1.0) * 2
        return ((matrix[2][1] - matrix[1][2]) / scale, (matrix[0][2] - matrix[2][0]) / scale,
                (matrix[1][0] - matrix[0][1]) / scale, 0.25 * scale)
    index = max(range(3), key=lambda item: matrix[item][item])
    if index == 0:
        scale = sqrt(1 + matrix[0][0] - matrix[1][1] - matrix[2][2]) * 2
        return (0.25 * scale, (matrix[0][1] + matrix[1][0]) / scale, (matrix[0][2] + matrix[2][0]) / scale, (matrix[2][1] - matrix[1][2]) / scale)
    if index == 1:
        scale = sqrt(1 + matrix[1][1] - matrix[0][0] - matrix[2][2]) * 2
        return ((matrix[0][1] + matrix[1][0]) / scale, 0.25 * scale, (matrix[1][2] + matrix[2][1]) / scale, (matrix[0][2] - matrix[2][0]) / scale)
    scale = sqrt(1 + matrix[2][2] - matrix[0][0] - matrix[1][1]) * 2
    return ((matrix[0][2] + matrix[2][0]) / scale, (matrix[1][2] + matrix[2][1]) / scale, 0.25 * scale, (matrix[1][0] - matrix[0][1]) / scale)


@dataclass(frozen=True)
class _Joint:
    name: str
    kind: str
    parent: str
    child: str
    origin: Matrix
    axis: tuple[float, float, float]


class UrdfKinematics:
    def __init__(self, path: Path, base_link: str, ee_link: str, joint_names: Iterable[str]) -> None:
        joints = self._parse(path)
        chain: list[_Joint] = []
        child = ee_link
        while child != base_link:
            joint = next((item for item in joints if item.child == child), None)
            if joint is None:
                raise ValueError(f"URDF has no chain from {base_link} to {ee_link}")
            chain.append(joint)
            child = joint.parent
        self._chain = tuple(reversed(chain))
        self._joint_names = tuple(joint_names)
        if tuple(joint.name for joint in self._chain if joint.kind != "fixed") != self._joint_names:
            raise ValueError("URDF chain joints do not match configured joint_names")

    @staticmethod
    def _parse(path: Path) -> list[_Joint]:
        root = ET.parse(path).getroot()
        out = []
        for node in root.findall("joint"):
            origin = node.find("origin")
            xyz = tuple(float(value) for value in (origin.get("xyz", "0 0 0").split() if origin is not None else ("0", "0", "0")))
            rpy = tuple(float(value) for value in (origin.get("rpy", "0 0 0").split() if origin is not None else ("0", "0", "0")))
            axis_node = node.find("axis")
            axis = tuple(float(value) for value in (axis_node.get("xyz", "0 0 1").split() if axis_node is not None else ("0", "0", "1")))
            out.append(_Joint(node.attrib["name"], node.attrib.get("type", "fixed"), node.find("parent").attrib["link"], node.find("child").attrib["link"], _origin(xyz, rpy), axis))
        return out

    def pose(self, positions: Iterable[float]) -> tuple[float, float, float, float, float, float, float]:
        values = tuple(float(value) for value in positions)
        if len(values) != len(self._joint_names) or not all(isfinite(value) for value in values):
            raise ValueError("joint positions must be finite and match configured joint_names")
        by_name = dict(zip(self._joint_names, values, strict=True))
        transform: Matrix = ((1.0, 0.0, 0.0, 0.0), (0.0, 1.0, 0.0, 0.0), (0.0, 0.0, 1.0, 0.0), (0.0, 0.0, 0.0, 1.0))
        for joint in self._chain:
            transform = _matmul(transform, joint.origin)
            if joint.kind in {"revolute", "continuous"}:
                transform = _matmul(transform, _axis_angle(joint.axis, by_name[joint.name]))
        quaternion = _quaternion(transform)
        return (transform[0][3], transform[1][3], transform[2][3], *quaternion)


def ee_velocity(previous: tuple[float, ...], current: tuple[float, ...], dt_sec: float) -> tuple[float, float, float, float, float, float]:
    if len(previous) != 7 or len(current) != 7 or dt_sec <= 0:
        raise ValueError("poses must be xyz+xyzw and dt_sec must be positive")
    if not all(isfinite(value) for value in (*previous, *current)):
        raise ValueError("poses must contain finite values")
    for quaternion in (previous[3:], current[3:]):
        norm = sqrt(sum(value * value for value in quaternion))
        if abs(norm - 1.0) > 1e-6:
            raise ValueError("poses must contain unit quaternion xyzw rotations")
    linear = tuple((current[index] - previous[index]) / dt_sec for index in range(3))
    x1, y1, z1, w1 = previous[3:]
    x2, y2, z2, w2 = current[3:]
    # q_current * conjugate(q_previous), choose the shortest equivalent arc.
    x, y, z, w = (-w2*x1 + x2*w1 - y2*z1 + z2*y1, -w2*y1 + x2*z1 + y2*w1 - z2*x1,
                   -w2*z1 - x2*y1 + y2*x1 + z2*w1, w2*w1 + x2*x1 + y2*y1 + z2*z1)
    if w < 0: x, y, z, w = -x, -y, -z, -w
    angle = 2 * acos(max(-1.0, min(1.0, w)))
    magnitude = sqrt(x*x + y*y + z*z)
    angular = (0.0, 0.0, 0.0) if magnitude < 1e-12 else (x/magnitude*angle/dt_sec, y/magnitude*angle/dt_sec, z/magnitude*angle/dt_sec)
    return (*linear, *angular)


def finite_difference(samples: list[tuple[int, tuple[float, ...]]]) -> list[tuple[float, ...]]:
    """Differentiate fixed-width vectors using central interior differences."""
    if len(samples) < 2:
        raise ValueError("at least two timestamped samples are required")
    width = len(samples[0][1])
    if not width or any(len(value) != width for _, value in samples):
        raise ValueError("sample vectors must have one non-zero dimension")
    result = []
    for index, (timestamp, _value) in enumerate(samples):
        left = max(0, index - 1)
        right = min(len(samples) - 1, index + 1)
        dt = (samples[right][0] - samples[left][0]) / 1e9
        if dt <= 0:
            raise ValueError("sample timestamps must be strictly increasing")
        result.append(tuple((samples[right][1][axis] - samples[left][1][axis]) / dt for axis in range(width)))
    return result
