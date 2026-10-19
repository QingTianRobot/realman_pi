"""Pure tests for locating finalized sessions that still await adopt/export."""
from __future__ import annotations

import json


from realman_recording.session_store import SessionStore


def _manifest(directory, decision="PENDING", state="READY"):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "manifest.json").write_text(json.dumps({
        "state": state,
        "decision": decision,
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))


def test_pending_session_ids_returns_only_pending_sorted(tmp_path):
    for name, decision in (
        ("a", "ADOPTED"),
        ("b", "PENDING"),
        ("c", "DELETED"),
        ("d", "PENDING"),
        ("e", "DISCARDED"),
    ):
        _manifest(tmp_path / name, decision)
    # A stray directory without a manifest must be ignored, not crash the scan.
    (tmp_path / "f").mkdir()
    (tmp_path / ".hidden").mkdir()

    assert SessionStore.pending_session_ids(tmp_path) == ["b", "d"]


def test_pending_session_ids_ignores_corrupt_manifest(tmp_path):
    _manifest(tmp_path / "good", "PENDING")
    (tmp_path / "bad").mkdir()
    (tmp_path / "bad" / "manifest.json").write_text("{not json", encoding="utf-8")

    assert SessionStore.pending_session_ids(tmp_path) == ["good"]


def test_pending_session_ids_returns_empty_for_missing_root(tmp_path):
    assert SessionStore.pending_session_ids(tmp_path / "nope") == []
