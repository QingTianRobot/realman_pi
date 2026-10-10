"""Synthetic tests for offline replay helpers (no ROS, MCAP, Rerun or hardware)."""
from __future__ import annotations

import json

import pytest

from realman_recording.replay import (
    ReplayOptions,
    ReplayPlayer,
    validate_session,
)


def _write_manifest(session_dir, *, state="READY", decision="ADOPTED"):
    if decision == "ADOPTED":
        (session_dir / "export" / "lerobot").mkdir(parents=True, exist_ok=True)
    (session_dir / "manifest.json").write_text(
        json.dumps({"schema_version": 1, "session_id": "s", "state": state, "decision": decision,
                    "export": {"state": "SUCCEEDED"} if decision == "ADOPTED" else {"state": "FAILED"}}),
        encoding="utf-8",
    )


def test_validate_session_accepts_ready_adopted_export(tmp_path):
    _write_manifest(tmp_path, decision="ADOPTED")
    assert validate_session(tmp_path)["state"] == "READY"


def test_validate_session_rejects_non_ready_and_discarded(tmp_path):
    _write_manifest(tmp_path, state="FAILED", decision="ADOPTED")
    with pytest.raises(ValueError):
        validate_session(tmp_path)
    _write_manifest(tmp_path, decision="DISCARDED")
    with pytest.raises(ValueError):
        validate_session(tmp_path)


def test_validate_session_requires_finalized_manifest(tmp_path):
    with pytest.raises(ValueError):
        validate_session(tmp_path)


def test_replay_options_rejects_invalid_range_and_speed(tmp_path):
    with pytest.raises(ValueError):
        ReplayOptions(tmp_path, start_ns=200, end_ns=100)
    with pytest.raises(ValueError):
        ReplayOptions(tmp_path, speed=0.0)


class _FakeRerun:
    """Records log/set_time calls so emission paths can be asserted without the SDK."""

    def __init__(self):
        self.events = []

    def set_time_nanos(self, timeline, ns):
        self.events.append(("time", timeline, ns))

    def log(self, path, value):
        self.events.append(("log", path, value))

    def Scalars(self, values):
        return ("scalars", tuple(values))

    def Image(self, image):
        return ("image", image)


def test_emit_summary_logs_drop_error_counters(tmp_path):
    _write_manifest(tmp_path)
    manifest_path = tmp_path / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest.update(started_realtime_ns=1000, summary={"accepted_samples": 10, "dropped_samples": 2, "write_errors": 0})
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
    player = ReplayPlayer(ReplayOptions(tmp_path))
    rerun = _FakeRerun()
    player._emit_summary(rerun)
    assert ("log", "recording/status/accepted_samples", ("scalars", (10,))) in rerun.events
    assert ("log", "recording/status/dropped_samples", ("scalars", (2,))) in rerun.events
    assert ("log", "recording/status/write_errors", ("scalars", (0,))) in rerun.events


def test_emit_canonical_frame_logs_canonical_vectors_and_selected_images(tmp_path):
    _write_manifest(tmp_path)
    player = ReplayPlayer(ReplayOptions(tmp_path, cameras=("front",)))
    rerun = _FakeRerun()
    player._emit_canonical_frame(rerun, {
        "observation.joint_position": (0.1, 0.2),
        "observation.gripper_position": (0.3,),
        "quality.valid": (True,),
        "observation.images.front": "front-image",
        "observation.images.wrist": "wrist-image",
    })
    assert ("log", "recording/canonical/observation/joint_position", ("scalars", (0.1, 0.2))) in rerun.events
    assert ("log", "recording/canonical/quality/valid", ("scalars", (True,))) in rerun.events
    assert ("log", "recording/cameras/front/image", ("image", "front-image")) in rerun.events
    assert not any(path == "recording/cameras/wrist/image" for kind, path, _ in rerun.events if kind == "log")
