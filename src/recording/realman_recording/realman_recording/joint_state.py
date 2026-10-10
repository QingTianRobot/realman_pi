"""Canonical ordering and validation for recorded JointState observations."""
from __future__ import annotations
from math import isfinite
from typing import Iterable


def ordered_joint_position(names: Iterable[str], positions: Iterable[float], expected: Iterable[str]) -> tuple[float, ...]:
    names, positions, expected = tuple(names), tuple(float(x) for x in positions), tuple(expected)
    if len(names) != len(positions) or len(set(names)) != len(names):
        raise ValueError("JointState names and positions must be one-to-one")
    values = dict(zip(names, positions, strict=True))
    if set(values) != set(expected):
        raise ValueError("JointState names do not match configured joint order")
    result = tuple(values[name] for name in expected)
    if not all(isfinite(value) for value in result):
        raise ValueError("JointState positions must be finite")
    return result
