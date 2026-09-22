"""Pure filesystem tests for the recording session manifest boundary."""
from __future__ import annotations

import json

from realman_recording.session_store import SessionState, SessionStore


def test_session_store_creates_minimal_layout_and_finalizes(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.transition(SessionState.RECORDING)
    store.add_pause_interval(10, 20)
    final = store.finalize(True, accepted_samples=3)

    manifest = json.loads(final.read_text(encoding="utf-8"))
    assert manifest["state"] == "READY"
    assert manifest["annotations"]["success"] is None
    assert manifest["pause_intervals"] == [{"started_monotonic_ns": 10, "ended_monotonic_ns": 20}]
    assert (session.directory / "videos").is_dir()
    assert (session.directory / "export" / "lerobot").is_dir()


def test_finalized_manifest_accepts_atomic_adoption_decision(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.transition(SessionState.RECORDING)
    store.finalize(True, write_errors=0)

    updated = SessionStore.update_final_manifest(
        session.directory,
        decision="ADOPTED",
        export={"state": "QUEUED"},
    )

    assert updated["decision"] == "ADOPTED"
    assert json.loads((session.directory / "manifest.json").read_text(encoding="utf-8"))["export"]["state"] == "QUEUED"


def test_active_session_can_persist_urdf_snapshot_provenance(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.update_metadata(canonical={"urdf_snapshot": "metadata/robot.urdf", "urdf_sha256": "abc"})
    manifest = json.loads((session.directory / "manifest.partial.json").read_text(encoding="utf-8"))
    assert manifest["metadata"]["canonical"]["urdf_snapshot"] == "metadata/robot.urdf"


def test_adoption_is_atomic_and_rejects_repeat_or_write_errors(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.finalize(True, write_errors=0)
    adopted = SessionStore.adopt_final_session(session.directory)
    assert adopted["decision"] == "ADOPTED"
    assert adopted["export"]["state"] == "QUEUED"
    try:
        SessionStore.adopt_final_session(session.directory)
    except RuntimeError as error:
        assert "already" in str(error)
    else:
        raise AssertionError("repeated ADOPT was accepted")

    rejected = SessionStore(tmp_path)
    bad = rejected.create({"profile": "bad"})
    rejected.finalize(True, write_errors=1)
    try:
        SessionStore.adopt_final_session(bad.directory)
    except RuntimeError as error:
        assert "write errors" in str(error)
    else:
        raise AssertionError("MCAP write-error session was adopted")


def test_discard_is_atomic_and_excludes_adoption(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.finalize(True, write_errors=0)
    discarded = SessionStore.discard_final_session(session.directory, discarded_realtime_ns=123)
    assert discarded["decision"] == "DISCARDED"
    try:
        SessionStore.adopt_final_session(session.directory)
    except RuntimeError as error:
        assert "already" in str(error)
    else:
        raise AssertionError("discarded session was adopted")
