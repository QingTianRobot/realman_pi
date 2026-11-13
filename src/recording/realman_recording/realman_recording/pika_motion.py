"""ROS-neutral cache of the two Pika trackers for the :8770 live dashboard.

The bridge feeds it two independent sources per side:

* the tracker pose (``/pika_pose_l`` / ``/pika_pose_r``, PoseStamped, ~125 Hz while the
  tracker is localized), which exists whether or not teleop is running;
* the teleop velocity command (``/pika/<side>/cartesian_velocity``, TwistStamped), which
  the Pika sender publishes only while that side is STARTed.

Nothing here enters a recording.  ``snapshot`` returns a small JSON-safe dict, and it
reports *why* a side has nothing to show (never received vs. stale) so the browser can
say so instead of drawing a frozen marker.
"""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
import math
from typing import Any, Iterable, Sequence

# A localized tracker publishes at ~125 Hz; a second of silence means it lost tracking.
POSE_STALE_NS = 1_000_000_000
# The Pika command stream is 20 Hz; half a second without one means teleop stopped.
COMMAND_STALE_NS = 500_000_000
# Finite-difference speed is taken over at least this window to keep 125 Hz jitter out.
SPEED_WINDOW_NS = 100_000_000
HISTORY_STEP_NS = 20_000_000


@dataclass
class _Side:
    pose_topic: str
    command_topic: str
    frame_id: str = ""
    position: tuple[float, float, float] | None = None
    orientation_xyzw: tuple[float, float, float, float] | None = None
    pose_received_ns: int = 0
    pose_count: int = 0
    history: deque = field(default_factory=lambda: deque(maxlen=64))
    history_slot_ns: int = 0
    command_linear: tuple[float, float, float] | None = None
    command_angular: tuple[float, float, float] | None = None
    command_frame_id: str = ""
    command_received_ns: int = 0


def _vector(values: Iterable[float], length: int) -> tuple[float, ...] | None:
    items = tuple(float(value) for value in values)
    if len(items) != length or not all(math.isfinite(value) for value in items):
        return None
    return items


class PikaMotionCache:
    """Latest Pika pose/command per side plus a short history for a speed estimate."""

    def __init__(
        self,
        sides: Sequence[str],
        pose_topics: Sequence[str],
        command_topics: Sequence[str] = (),
    ) -> None:
        sides = tuple(str(side) for side in sides if str(side))
        pose_topics = tuple(str(topic) for topic in pose_topics if str(topic))
        command_topics = tuple(str(topic) for topic in command_topics if str(topic))
        if len(pose_topics) != len(sides):
            raise ValueError("pika_pose_topics must match pika_sides length")
        if command_topics and len(command_topics) != len(sides):
            raise ValueError("pika_command_velocity_topics must be empty or match pika_sides length")
        self._sides = {
            side: _Side(pose_topic=pose_topic, command_topic=command_topics[index] if command_topics else "")
            for index, (side, pose_topic) in enumerate(zip(sides, pose_topics))
        }

    @property
    def sides(self) -> dict[str, tuple[str, str]]:
        """Side -> (pose topic, command topic); the bridge subscribes from this."""
        return {side: (item.pose_topic, item.command_topic) for side, item in self._sides.items()}

    def update_pose(
        self,
        side: str,
        *,
        frame_id: str,
        position: Iterable[float],
        orientation_xyzw: Iterable[float],
        received_ns: int,
    ) -> None:
        item = self._sides.get(side)
        if item is None:
            return
        point = _vector(position, 3)
        quaternion = _vector(orientation_xyzw, 4)
        if point is None or quaternion is None:
            return
        item.frame_id = str(frame_id)
        item.position = point  # type: ignore[assignment]
        item.orientation_xyzw = quaternion  # type: ignore[assignment]
        item.pose_received_ns = int(received_ns)
        item.pose_count += 1
        # Thin the speed history so 64 slots always span > SPEED_WINDOW_NS at any rate.
        # The newest slot always holds the latest sample; a new slot opens every step.
        if not item.history or received_ns - item.history_slot_ns >= HISTORY_STEP_NS:
            item.history.append((int(received_ns), point))
            item.history_slot_ns = int(received_ns)
        else:
            item.history[-1] = (int(received_ns), point)

    def update_command(
        self,
        side: str,
        *,
        frame_id: str,
        linear: Iterable[float],
        angular: Iterable[float],
        received_ns: int,
    ) -> None:
        item = self._sides.get(side)
        if item is None:
            return
        linear_vector = _vector(linear, 3)
        angular_vector = _vector(angular, 3)
        if linear_vector is None or angular_vector is None:
            return
        item.command_linear = linear_vector  # type: ignore[assignment]
        item.command_angular = angular_vector  # type: ignore[assignment]
        item.command_frame_id = str(frame_id)
        item.command_received_ns = int(received_ns)

    @staticmethod
    def _speed(item: _Side) -> float | None:
        """Tracker speed (m/s) from the newest sample and one at least SPEED_WINDOW_NS older."""
        if len(item.history) < 2:
            return None
        newest_ns, newest = item.history[-1]
        for sample_ns, sample in reversed(item.history):
            elapsed = newest_ns - sample_ns
            if elapsed >= SPEED_WINDOW_NS:
                return math.dist(newest, sample) / (elapsed / 1e9)
        return None

    def snapshot(self, now_ns: int) -> dict[str, Any]:
        sides: dict[str, Any] = {}
        for side, item in self._sides.items():
            pose_age_ns = now_ns - item.pose_received_ns if item.pose_count else None
            if pose_age_ns is None:
                state = "no_data"
            elif pose_age_ns > POSE_STALE_NS:
                state = "stale"
            else:
                state = "live"
            command_age_ns = now_ns - item.command_received_ns if item.command_received_ns else None
            command_active = command_age_ns is not None and command_age_ns <= COMMAND_STALE_NS
            sides[side] = {
                "state": state,
                "pose_topic": item.pose_topic,
                "frame_id": item.frame_id,
                "position_m": list(item.position) if item.position else None,
                "orientation_xyzw": list(item.orientation_xyzw) if item.orientation_xyzw else None,
                "pose_age_ms": None if pose_age_ns is None else int(pose_age_ns / 1e6),
                "speed_mps": self._speed(item) if state == "live" else None,
                "command_topic": item.command_topic,
                "command_active": command_active,
                "command_frame_id": item.command_frame_id if command_active else "",
                "command_linear_mps": list(item.command_linear) if command_active and item.command_linear else None,
                "command_angular_radps": list(item.command_angular) if command_active and item.command_angular else None,
                "command_age_ms": None if command_age_ns is None else int(command_age_ns / 1e6),
            }
        return {"sides": sides}
