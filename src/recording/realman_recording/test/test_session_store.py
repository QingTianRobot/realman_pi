"""Pure filesystem tests for the recording session manifest boundary."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

from realman_recording.session_store import SessionState, SessionStore
from realman_recording.json_io import atomic_json_write


def test_session_store_creates_minimal_layout_and_finalizes(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.transition(SessionState.RECORDING)
    final = store.finalize(True, accepted_samples=3)

    manifest = json.loads(final.read_text(encoding="utf-8"))
    assert manifest["state"] == "READY"
    assert manifest["annotations"]["success"] is None
    assert "pause_intervals" not in manifest
    assert (session.directory / "videos").is_dir()
    assert (session.directory / "export" / "lerobot").is_dir()


def test_session_store_accepts_explicit_ros_walltime_for_auditable_manifest_timestamps(tmp_path):
    """The recorder, not the filesystem helper, owns the ROS SYSTEM_TIME clock."""
    store = SessionStore(tmp_path)
    session = store.create(
        {"profile": "default"},
        started_realtime_ns=1_700_000_000_123_456_789,
        started_monotonic_ns=456,
    )
    final = store.finalize(True, ended_realtime_ns=1_700_000_001_123_456_789)

    manifest = json.loads(final.read_text(encoding="utf-8"))
    assert session.started_realtime_ns == 1_700_000_000_123_456_789
    assert session.started_monotonic_ns == 456
    assert manifest["started_realtime_ns"] == 1_700_000_000_123_456_789
    assert manifest["ended_realtime_ns"] == 1_700_000_001_123_456_789


def test_session_lifecycle_exposes_only_service_reachable_states():
    """PAUSED is not a ManageRecording command and must not leak into manifests."""
    assert not hasattr(SessionState, "PAUSED")


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
    adopted = SessionStore.adopt_final_session(session.directory, requested_realtime_ns=0)
    assert adopted["decision"] == "ADOPTED"
    assert adopted["export"]["state"] == "QUEUED"
    assert adopted["export"]["requested_realtime_ns"] == 0
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

    camera_failed = SessionStore(tmp_path)
    bad_camera = camera_failed.create({"profile": "camera-failed"})
    camera_failed.finalize(True, write_errors=0, camera_write_errors=1)
    try:
        SessionStore.adopt_final_session(bad_camera.directory)
    except RuntimeError as error:
        assert "camera write errors" in str(error)
    else:
        raise AssertionError("camera write-error session was adopted")


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


def test_decision_timestamps_reject_negative_values(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "default"})
    store.finalize(True, write_errors=0)
    try:
        SessionStore.adopt_final_session(session.directory, requested_realtime_ns=-1)
    except ValueError as error:
        assert "non-negative" in str(error)
    else:
        raise AssertionError("negative ADOPT timestamp was accepted")


def test_atomic_json_replace_failure_preserves_previous_document_and_cleans_temp(monkeypatch, tmp_path):
    destination = tmp_path / "manifest.json"
    destination.write_text('{"state":"READY"}\n', encoding="utf-8")

    def fail_replace(_source, _destination):
        raise OSError("simulated disk/rename failure")

    monkeypatch.setattr(os, "replace", fail_replace)
    try:
        atomic_json_write(destination, {"state": "FAILED"})
    except OSError as error:
        assert "simulated" in str(error)
    else:
        raise AssertionError("replace failure was swallowed")

    assert destination.read_text(encoding="utf-8") == '{"state":"READY"}\n'
    assert list(tmp_path.glob(".manifest.json.*")) == []


def test_recover_orphaned_recording_marks_subprocess_crash_failed(tmp_path):
    package_root = Path(__file__).parents[1] / "realman_recording"
    crash_script = (
        "import os, sys; "
        "from realman_recording.session_store import SessionState, SessionStore; "
        "store = SessionStore(sys.argv[1]); "
        "store.create({'profile': 'interrupted'}); "
        "store.transition(SessionState.RECORDING); "
        "os._exit(23)"
    )
    environment = os.environ.copy()
    existing_pythonpath = environment.get("PYTHONPATH", "")
    environment["PYTHONPATH"] = os.pathsep.join(
        item for item in (str(package_root), existing_pythonpath) if item
    )
    crashed = subprocess.run(
        [sys.executable, "-c", crash_script, str(tmp_path)],
        env=environment,
        check=False,
    )
    assert crashed.returncode == 23

    recovered = SessionStore.recover_orphaned_sessions(tmp_path, recovered_realtime_ns=123)
    session_directories = [path for path in tmp_path.iterdir() if path.is_dir()]
    assert len(session_directories) == 1
    manifest_path = session_directories[0] / "manifest.json"
    assert recovered == [{"session_id": session_directories[0].name, "state": "FAILED"}]
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["state"] == "FAILED"
    assert manifest["summary"]["write_errors"] == 1
    assert not (session_directories[0] / "manifest.partial.json").exists()


def test_recover_orphaned_ready_manifest_promotes_without_marking_write_error(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "ready-before-rename"})
    store.finalize(True, ended_realtime_ns=99, write_errors=0, camera_write_errors=0)
    # Simulate the narrow crash window by moving the completed manifest back to the
    # partial name and removing the final name.
    os.replace(session.directory / "manifest.json", session.directory / "manifest.partial.json")
    recovered = SessionStore.recover_orphaned_sessions(tmp_path, recovered_realtime_ns=123)
    assert recovered == [{"session_id": session.session_id, "state": "READY"}]
    manifest = json.loads((session.directory / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["state"] == "READY"
    assert manifest["summary"]["write_errors"] == 0
    assert manifest["recovery"]["state"] == "FINALIZED_AFTER_PROCESS_INTERRUPTION"
