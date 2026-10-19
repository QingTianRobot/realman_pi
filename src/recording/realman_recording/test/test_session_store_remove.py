import json
import pytest
from realman_recording.session_store import SessionStore


def _manifest(directory, decision="ADOPTED", export_state="SUCCEEDED"):
    directory.mkdir()
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": decision,
        "export": {"state": export_state},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))


def test_remove_deletes_session_directory(tmp_path):
    d = tmp_path / "s"
    _manifest(d)
    (d / "state.mcap").write_text("mcap")
    SessionStore.remove_final_session(d)
    assert not d.exists()


def test_remove_rejects_missing_manifest(tmp_path):
    d = tmp_path / "s"
    d.mkdir()
    with pytest.raises(ValueError):
        SessionStore.remove_final_session(d)


def test_remove_rejects_nonexistent(tmp_path):
    d = tmp_path / "does-not-exist"
    with pytest.raises(ValueError):
        SessionStore.remove_final_session(d)
