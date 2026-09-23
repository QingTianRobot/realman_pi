"""Pose-difference estimation for read-only Cartesian velocity telemetry."""

from __future__ import annotations

from dataclasses import dataclass, replace
import math
from typing import Sequence


_NANOSECONDS_PER_SECOND = 1_000_000_000


@dataclass(frozen=True)
class PoseVelocitySample:
    """One estimated twist and its validity/freshness state."""

    linear_mps: tuple[float, float, float]
    angular_radps: tuple[float, float, float]
    valid: bool
    age_ms: int


def _invalid_sample(age_ms: int = 0) -> PoseVelocitySample:
    return PoseVelocitySample((0.0, 0.0, 0.0), (0.0, 0.0, 0.0), False, age_ms)


def _is_finite_pose(pose: Sequence[object]) -> bool:
    return len(pose) == 6 and all(
        isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value))
        for value in pose
    )


def _wrap_angle(angle: float) -> float:
    return (angle + math.pi) % (2.0 * math.pi) - math.pi


class PoseVelocityEstimator:
    """Estimate base-frame twist from consecutive FK pose samples."""

    def __init__(self, *, max_sample_gap_sec: float) -> None:
        if not isinstance(max_sample_gap_sec, (int, float)) or isinstance(max_sample_gap_sec, bool):
            raise ValueError("max_sample_gap_sec must be a positive finite number")
        if not math.isfinite(float(max_sample_gap_sec)) or float(max_sample_gap_sec) <= 0.0:
            raise ValueError("max_sample_gap_sec must be a positive finite number")
        self.max_sample_gap_sec = float(max_sample_gap_sec)
        self._previous_stamp_ns: int | None = None
        self._previous_pose: tuple[float, ...] | None = None
        self._latest_stamp_ns: int | None = None
        self._latest_sample = _invalid_sample()

    def reset(self) -> None:
        self._previous_stamp_ns = None
        self._previous_pose = None
        self._latest_stamp_ns = None
        self._latest_sample = _invalid_sample()

    def update(self, stamp_ns: int, pose_xyzrpy: Sequence[object]) -> PoseVelocitySample:
        if (
            isinstance(stamp_ns, bool)
            or not isinstance(stamp_ns, int)
            or stamp_ns <= 0
            or not _is_finite_pose(pose_xyzrpy)
        ):
            self.reset()
            return _invalid_sample()

        pose = tuple(float(value) for value in pose_xyzrpy)
        previous_stamp_ns = self._previous_stamp_ns
        previous_pose = self._previous_pose
        self._previous_stamp_ns = stamp_ns
        self._previous_pose = pose
        self._latest_stamp_ns = stamp_ns

        if previous_stamp_ns is None or previous_pose is None:
            self._latest_sample = _invalid_sample()
            return self._latest_sample

        dt_sec = (stamp_ns - previous_stamp_ns) / _NANOSECONDS_PER_SECOND
        if dt_sec <= 0.0 or dt_sec > self.max_sample_gap_sec:
            self._latest_sample = _invalid_sample()
            return self._latest_sample

        linear = tuple((pose[index] - previous_pose[index]) / dt_sec for index in range(3))
        angular = tuple(
            _wrap_angle(pose[index] - previous_pose[index]) / dt_sec
            for index in range(3, 6)
        )
        self._latest_sample = PoseVelocitySample(linear, angular, True, 0)
        return self._latest_sample

    def latest_age_ms(self, now_ns: int) -> int | None:
        if (
            self._latest_stamp_ns is None
            or isinstance(now_ns, bool)
            or not isinstance(now_ns, int)
            or now_ns < self._latest_stamp_ns
        ):
            return None
        age_ms = int((now_ns - self._latest_stamp_ns) / 1_000_000)
        if age_ms > int(self.max_sample_gap_sec * 1000.0):
            return None
        return age_ms

    def latest(self, now_ns: int) -> PoseVelocitySample:
        age_ms = self.latest_age_ms(now_ns)
        if age_ms is None:
            return _invalid_sample()
        return replace(self._latest_sample, age_ms=age_ms)


__all__ = ["PoseVelocityEstimator", "PoseVelocitySample"]
