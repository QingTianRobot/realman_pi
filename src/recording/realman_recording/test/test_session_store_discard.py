# test_session_store_discard.py
import json
import pytest
from realman_recording.session_store import SessionStore


def test_discard_cancels_a_queued_but_not_running_session(tmp_path):
    directory = tmp_path / "s"
    directory.mkdir()
    manifest = directory / "manifest.json"
    manifest.write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "QUEUED", "requested_realtime_ns": 1},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))
    SessionStore.discard_final_session(directory)
    payload = json.loads(manifest.read_text())
    assert payload["decision"] == "DISCARDED"


def test_discard_rejects_a_running_session(tmp_path):
    directory = tmp_path / "s"
    directory.mkdir()
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "RUNNING"},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))
    with pytest.raises(RuntimeError):
        SessionStore.discard_final_session(directory)
