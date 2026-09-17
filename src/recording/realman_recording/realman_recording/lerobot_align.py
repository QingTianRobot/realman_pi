"""Deterministic ROS 2 wall-time alignment for asynchronous LeRobot export.

All anchors and samples use ROS 2 SYSTEM_TIME/wall-clock nanoseconds.  An image frame is
the anchor; continuous arm streams use linear interpolation, while discrete gripper
streams must explicitly choose either temporal nearest-neighbour or causal forward-fill.
Malformed timelines and unsafe interpolation gaps are rejected instead of silently
creating training rows with truncated or fabricated observations.
"""
from __future__ import annotations

from bisect import bisect_right
from dataclasses import dataclass
from enum import Enum
from math import isfinite
from numbers import Number
from typing import Any, Sequence


class AlignmentPolicy(str, Enum):
    LINEAR = "linear"
    NEAREST = "nearest"
    FORWARD_FILL = "forward_fill"


@dataclass(frozen=True)
class TimedSample:
    """One scalar/vector observation at a ROS 2 SYSTEM_TIME nanosecond timestamp."""

    timestamp_ns: int
    value: Any


@dataclass(frozen=True)
class AlignedFrame:
    """One export frame: an image wall-time anchor plus every aligned stream value."""

    timestamp_ns: int
    values: dict[str, Any]


def _validate_timeline(timestamps: Sequence[int], *, name: str, allow_empty: bool = False) -> None:
    if not timestamps and not allow_empty:
        raise ValueError(f"{name} cannot be empty")
    if any(not isinstance(timestamp, int) or isinstance(timestamp, bool) for timestamp in timestamps):
        raise ValueError(f"{name} timestamps must be integer nanoseconds")
    if any(later <= earlier for earlier, later in zip(timestamps, timestamps[1:])):
        raise ValueError(f"{name} timestamps must be strictly increasing")


def _validate_max_gap(max_gap_ns: int | None) -> None:
    if max_gap_ns is not None and (isinstance(max_gap_ns, bool) or not isinstance(max_gap_ns, int) or max_gap_ns < 0):
        raise ValueError("max_gap_ns must be a non-negative integer or None")


def _numeric_vector(value: Any) -> tuple[float | int, ...] | None:
    if isinstance(value, Number) and not isinstance(value, bool):
        return None
    if isinstance(value, (str, bytes)):
        raise ValueError("linear values must be numeric scalars or numeric vectors")
    try:
        vector = tuple(value)
    except TypeError as error:
        raise ValueError("linear values must be numeric scalars or numeric vectors") from error
    if not vector or any(not isinstance(item, Number) or isinstance(item, bool) for item in vector):
        raise ValueError("linear vectors must be non-empty and contain only numbers")
    if any(not isfinite(float(item)) for item in vector):
        raise ValueError("linear vectors must contain finite values")
    return vector


def _validate_linear_values(samples: Sequence[TimedSample]) -> None:
    first = _numeric_vector(samples[0].value)
    if first is None:
        if not isfinite(float(samples[0].value)):
            raise ValueError("linear scalars must be finite")
        for sample in samples[1:]:
            if _numeric_vector(sample.value) is not None or not isfinite(float(sample.value)):
                raise ValueError("linear samples must have one numeric shape and finite values")
        return
    for sample in samples[1:]:
        vector = _numeric_vector(sample.value)
        if vector is None or len(vector) != len(first):
            raise ValueError("linear vectors must have identical dimensions")


def _lerp(a: Any, b: Any, fraction: float) -> Any:
    if isinstance(a, Number) and isinstance(b, Number) and not isinstance(a, bool) and not isinstance(b, bool):
        return a + (b - a) * fraction
    return tuple(x + (y - x) * fraction for x, y in zip(a, b, strict=True))


def _require_gap(distance_ns: int, max_gap_ns: int | None) -> None:
    if max_gap_ns is not None and distance_ns > max_gap_ns:
        raise ValueError("alignment exceeds max_gap_ns")


def _nearest(samples: Sequence[TimedSample], timestamps: Sequence[int], anchor_ns: int, max_gap_ns: int | None) -> Any:
    right = bisect_right(timestamps, anchor_ns)
    candidates = []
    if right:
        candidates.append(right - 1)
    if right < len(samples):
        candidates.append(right)
    index = min(candidates, key=lambda candidate: (abs(timestamps[candidate] - anchor_ns), candidate))
    _require_gap(abs(timestamps[index] - anchor_ns), max_gap_ns)
    return samples[index].value


def _forward_fill(samples: Sequence[TimedSample], timestamps: Sequence[int], anchor_ns: int, max_gap_ns: int | None) -> Any:
    index = bisect_right(timestamps, anchor_ns) - 1
    if index < 0:
        # A future state is not a valid causal gripper label, regardless of gap size.
        raise ValueError("forward fill requires a sample at or before the anchor")
    _require_gap(anchor_ns - timestamps[index], max_gap_ns)
    return samples[index].value


def _linear(samples: Sequence[TimedSample], timestamps: Sequence[int], anchor_ns: int, max_gap_ns: int | None) -> Any:
    index = bisect_right(timestamps, anchor_ns) - 1
    if index < 0:
        _require_gap(timestamps[0] - anchor_ns, max_gap_ns)
        return samples[0].value
    if index >= len(samples) - 1:
        _require_gap(anchor_ns - timestamps[-1], max_gap_ns)
        return samples[-1].value
    lo, hi = samples[index], samples[index + 1]
    span_ns = hi.timestamp_ns - lo.timestamp_ns
    _require_gap(span_ns, max_gap_ns)
    return _lerp(lo.value, hi.value, (anchor_ns - lo.timestamp_ns) / span_ns)


def align_series(
    anchors_ns: Sequence[int],
    samples: Sequence[TimedSample],
    policy: AlignmentPolicy,
    *,
    max_gap_ns: int | None = None,
) -> list[Any]:
    """Align a non-empty wall-time stream to strictly increasing image anchors.

    ``max_gap_ns`` bounds temporal distance for NEAREST/FORWARD_FILL and bracketing
    interval size for LINEAR. ``None`` leaves the policy unbounded for backward
    compatibility; production exporters should set a stream-appropriate value.
    """
    _validate_timeline(anchors_ns, name="anchor")
    timestamps = [sample.timestamp_ns for sample in samples]
    _validate_timeline(timestamps, name="sample")
    _validate_max_gap(max_gap_ns)

    if policy is AlignmentPolicy.LINEAR:
        _validate_linear_values(samples)
        return [_linear(samples, timestamps, anchor, max_gap_ns) for anchor in anchors_ns]
    if policy is AlignmentPolicy.NEAREST:
        return [_nearest(samples, timestamps, anchor, max_gap_ns) for anchor in anchors_ns]
    if policy is AlignmentPolicy.FORWARD_FILL:
        return [_forward_fill(samples, timestamps, anchor, max_gap_ns) for anchor in anchors_ns]
    raise ValueError(f"unknown alignment policy: {policy}")


def align_streams(
    anchors_ns: Sequence[int],
    streams: dict[str, tuple[Sequence[TimedSample], AlignmentPolicy]],
    *,
    max_gap_ns: int | None = None,
) -> list[AlignedFrame]:
    """Align several streams to strictly increasing image wall-time anchors."""
    _validate_timeline(anchors_ns, name="anchor")
    aligned_by_stream = {
        name: align_series(anchors_ns, samples, policy, max_gap_ns=max_gap_ns)
        for name, (samples, policy) in streams.items()
    }
    return [
        AlignedFrame(
            timestamp_ns=anchor_ns,
            values={name: series[index] for name, series in aligned_by_stream.items()},
        )
        for index, anchor_ns in enumerate(anchors_ns)
    ]
