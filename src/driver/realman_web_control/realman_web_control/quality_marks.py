"""Live deviation marks at the :8765 boundary (no ROS import, unit-tested in CI).

The operator's ``quality_mark`` commands become realman_recording_msgs/QualityMark on
/recording/quality_mark; the recorder's /recording/status becomes the page's compact recording
state. The reason list is config/recording/quality_reasons.yaml. The recorder validates that file
and refuses marks with an unknown reason (realman_recording.quality_events); this module only
passes the list to the page.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

# Index = realman_recording_msgs/QualityMark.kind.
MARK_KINDS = {"deviate_start": 0, "recover": 1, "reason": 2}
# realman_recording_msgs/RecordingStatus state constants.
RECORDING_STATES = {0: "IDLE", 1: "COUNTDOWN", 2: "RECORDING", 4: "FINALIZING", 5: "EXPORTING", 6: "READY",
                    7: "FAILED", 8: "PREPARING", 9: "ARMED", 10: "SCHEDULED", 11: "EXPORTED"}


def load_quality_reasons(path: str | Path | None) -> list[dict[str, str]]:
    """``[{"id", "label"}]`` in key order for the page; a missing file means no reasons.

    Only the shape is checked: ids, duplicates and the entry limit are the recorder's to enforce.
    """
    if path is None or not Path(path).is_file():
        return []
    payload = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    items = payload.get("reasons") if isinstance(payload, dict) else None
    if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
        raise ValueError(f"{path}: reasons must be a list of id/label mappings")
    return [{"id": str(item.get("id", "")), "label": str(item.get("label", ""))} for item in items]


def recording_view(*, state: int, session_id: str, elapsed_sec: float, diagnostics_json: str) -> dict[str, Any]:
    """The page's recording state from one RecordingStatus (an older recorder has no quality key)."""
    try:
        diagnostics = json.loads(diagnostics_json) if diagnostics_json else {}
    except json.JSONDecodeError:
        diagnostics = {}
    quality = diagnostics.get("quality") if isinstance(diagnostics, dict) else None
    quality = quality if isinstance(quality, dict) else {}
    return {
        "state": RECORDING_STATES.get(int(state), "UNKNOWN"),
        "session_id": session_id,
        "elapsed_sec": round(max(0.0, float(elapsed_sec)), 1),
        "profile": str(quality.get("profile", "")),
        "attempt_id": str(quality.get("attempt_id", "")),
        "deviating": bool(quality.get("deviating", False)),
        "deviation_start_ns": str(quality.get("deviation_start_ns", "")),
        "reason": str(quality.get("reason", "")),
        "rejected_marks": int(quality.get("rejected_marks", 0) or 0),
        "dropped_marks": int(quality.get("dropped_marks", 0) or 0),
        "last_error": str(quality.get("auto_record_last_error", "")),
    }


def view_changed(previous: dict[str, Any] | None, current: dict[str, Any]) -> bool:
    """Elapsed time alone is not a change: the page counts it up from the last push."""
    if previous is None:
        return True
    return ({key: value for key, value in previous.items() if key != "elapsed_sec"}
            != {key: value for key, value in current.items() if key != "elapsed_sec"})
