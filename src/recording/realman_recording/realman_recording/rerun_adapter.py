"""Lossy, read-only Rerun visualization adapter for live recording observability.

The adapter accepts only timer-coalesced joint/gripper snapshots from the recording Web
bridge. It never receives ROS messages, images at camera rate, session writers, or MCAP
queues. Missing Rerun is a visualization-only degradation.
"""
from __future__ import annotations

from typing import Any


class RerunVisualizationAdapter:
    """Emit bounded numeric snapshots to a Rerun recording/viewer when SDK is available."""

    def __init__(
        self,
        *,
        application_id: str,
        spawn: bool = False,
        rerun_module: Any | None = None,
    ) -> None:
        if rerun_module is None:
            try:
                import rerun as rerun_module  # type: ignore[import-not-found]
            except ImportError:
                rerun_module = None
        self._rerun = rerun_module
        if self._rerun is not None:
            self._rerun.init(application_id, spawn=spawn)

    @property
    def enabled(self) -> bool:
        return self._rerun is not None

    def offer_snapshot(
        self,
        *,
        timestamp_ns: int,
        arms: dict[str, list[float]],
        grippers: dict[str, dict[str, float | bool | int]],
    ) -> None:
        """Log one bounded wall-time snapshot; callers invoke this at visualization rate."""
        rerun = self._rerun
        if rerun is None:
            return
        rerun.set_time_nanos("wall_time", timestamp_ns)
        for arm, positions in arms.items():
            rerun.log(f"recording/arms/{arm}/joints_rad", rerun.Scalars(positions))
        for gripper, values in grippers.items():
            for name, value in values.items():
                if isinstance(value, bool):
                    value = int(value)
                if isinstance(value, (int, float)):
                    rerun.log(f"recording/grippers/{gripper}/{name}", rerun.Scalars([value]))

    def offer_preview(self, *, camera_id: str, timestamp_ns: int, jpeg: bytes) -> None:
        """Log an already-compressed, low-resolution preview without decoding it."""
        rerun = self._rerun
        if rerun is None or not jpeg:
            return
        rerun.set_time_nanos("wall_time", timestamp_ns)
        encoded = getattr(rerun, "EncodedImage", None)
        if callable(encoded):
            rerun.log(
                f"recording/cameras/{camera_id}/preview",
                encoded(contents=jpeg, media_type="image/jpeg"),
            )

    def offer_recording_status(
        self,
        *,
        timestamp_ns: int,
        state: int,
        elapsed_sec: float,
        remaining_sec: float,
        dropped_samples: int,
    ) -> None:
        """Show the recorder lifecycle and loss counters without accessing its state machine."""
        rerun = self._rerun
        if rerun is None:
            return
        rerun.set_time_nanos("wall_time", timestamp_ns)
        for name, value in {
            "state": state,
            "elapsed_sec": elapsed_sec,
            "remaining_sec": remaining_sec,
            "dropped_samples": dropped_samples,
        }.items():
            rerun.log(f"recording/status/{name}", rerun.Scalars([value]))

    def close(self) -> None:
        """Release optional viewer resources; no recording state is owned here."""
        rerun = self._rerun
        self._rerun = None
        disconnect = getattr(rerun, "disconnect", None) if rerun is not None else None
        if callable(disconnect):
            disconnect()
