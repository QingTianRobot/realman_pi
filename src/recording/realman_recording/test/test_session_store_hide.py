# test_session_store_hide.py
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


def test_hide_then_restore(tmp_path):
    d = tmp_path / "s"
    _manifest(d)
    SessionStore.hide_final_session(d)
    assert json.loads((d / "manifest.json").read_text())["decision"] == "DELETED"
    SessionStore.restore_final_session(d)
    assert json.loads((d / "manifest.json").read_text())["decision"] == "ADOPTED"


def test_hide_rejects_not_succeeded(tmp_path):
    d = tmp_path / "s"
    _manifest(d, export_state="RUNNING")
    with pytest.raises(RuntimeError):
        SessionStore.hide_final_session(d)
