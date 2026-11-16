"""Per-camera receive rate and freshness for the :8770 live camera tiles.

The Web bridge calls ``record`` from each ROS image subscription callback with the
monotonic receive time, before any JPEG work, so the numbers describe what the
bridge actually received from the image topic rather than how many preview frames a
browser managed to draw.  This module is ROS-neutral so it is unit-testable.
"""
from __future__ import annotations

import threading
from collections import deque
from typing import Iterable, Mapping, Sequence

SECOND_NS = 1_000_000_000
# A camera that (re)starts publishing needs a few frames before a rate means anything;
# during this time it is reported as "warming" instead of a misleading low rate.
WARMUP_NS = 500_000_000


def expected_fps_by_camera(camera_ids: Sequence[str], values: Sequence[float]) -> dict[str, float]:
    """Pair configured nominal rates with camera ids.

    One value applies to every camera; otherwise the list must match ``camera_ids``.
    Non-positive values mean "unknown", so that camera is never flagged as low rate.
    """
    rates = [float(value) for value in values]
    if not rates:
        return {}
    if len(rates) == 1:
        rates = rates * len(camera_ids)
    if len(rates) != len(camera_ids):
        raise ValueError("camera_expected_fps must have one value or match camera_ids length")
    return {camera_id: rate for camera_id, rate in zip(camera_ids, rates) if rate > 0.0}


class CameraRateTracker:
    """Thread-safe sliding-window frame rate and last-frame age per camera."""

    def __init__(
        self,
        camera_ids: Iterable[str],
        *,
        expected_fps: Mapping[str, float],
        window_sec: float = 2.0,
        stale_after_sec: float = 1.0,
        low_fps_ratio: float = 0.7,
    ) -> None:
        if window_sec <= 0.0:
            raise ValueError("camera_rate_window_sec must be positive")
        if stale_after_sec <= 0.0:
            raise ValueError("camera_stale_after_sec must be positive")
        if not 0.0 < low_fps_ratio <= 1.0:
            raise ValueError("camera_low_fps_ratio must be in (0, 1]")
        self._ids = tuple(camera_ids)
        self._expected = {camera_id: float(expected_fps[camera_id]) for camera_id in self._ids if camera_id in expected_fps}
        self._window_ns = int(window_sec * SECOND_NS)
        self._stale_ns = int(stale_after_sec * SECOND_NS)
        self._low_ratio = float(low_fps_ratio)
        self._lock = threading.Lock()
        self._times: dict[str, deque[int]] = {camera_id: deque() for camera_id in self._ids}
        self._totals = {camera_id: 0 for camera_id in self._ids}
        self._run_start: dict[str, int] = {}
        self._last: dict[str, int] = {}

    def record(self, camera_id: str, received_ns: int) -> None:
        """Count one received frame; unknown camera ids are ignored."""
        with self._lock:
            times = self._times.get(camera_id)
            if times is None:
                return
            # A frame after a stale gap starts a new run, so a recovering camera gets
            # a fresh warm-up instead of a rate diluted by the gap.
            last = self._last.get(camera_id)
            if last is None or received_ns - last > self._stale_ns:
                self._run_start[camera_id] = received_ns
            self._last[camera_id] = received_ns
            times.append(received_ns)
            self._totals[camera_id] += 1
            self._trim(times, received_ns)

    def _trim(self, times: deque[int], now_ns: int) -> None:
        while times and times[0] <= now_ns - self._window_ns:
            times.popleft()

    def snapshot(self, now_ns: int) -> dict[str, dict[str, object]]:
        """Return ``{camera_id: {state, fps, age_ms, expected_fps, frames_total}}``.

        ``state`` is one of ``no_data`` (never received), ``stale`` (no frame for
        ``stale_after_sec``), ``warming`` (first ``WARMUP_NS`` of a run), ``low_fps``
        (below ``low_fps_ratio`` x expected) or ``ok``.
        """
        result: dict[str, dict[str, object]] = {}
        with self._lock:
            for camera_id in self._ids:
                times = self._times[camera_id]
                total = self._totals[camera_id]
                expected = self._expected.get(camera_id)
                entry: dict[str, object] = {
                    "state": "no_data", "fps": None, "age_ms": None,
                    "expected_fps": expected, "frames_total": total,
                }
                result[camera_id] = entry
                if total == 0:
                    continue
                last_ns = self._last[camera_id]
                self._trim(times, now_ns)
                age_ns = max(0, now_ns - last_ns)
                entry["age_ms"] = age_ns // 1_000_000
                if len(times) >= 2:
                    span_ns = max(1, now_ns - times[0])
                    fps = (len(times) - 1) * SECOND_NS / span_ns
                else:
                    fps = 0.0
                if age_ns > self._stale_ns:
                    entry["fps"] = round(fps, 1)
                    entry["state"] = "stale"
                elif now_ns - self._run_start.get(camera_id, now_ns) < WARMUP_NS:
                    entry["state"] = "warming"
                else:
                    entry["fps"] = round(fps, 1)
                    entry["state"] = "low_fps" if expected is not None and fps < expected * self._low_ratio else "ok"
        return result
