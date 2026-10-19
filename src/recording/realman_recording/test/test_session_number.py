import json
import pytest
from realman_recording.session_store import SessionStore


def _finalized(directory, session_number):
    directory.mkdir(parents=True)
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY",
        "decision": "ADOPTED",
        "metadata": {"task": "pick_and_place", "session_number": session_number},
        "export": {"state": "SUCCEEDED"},
    }))


def test_next_session_number_empty(tmp_path):
    assert SessionStore.next_session_number(tmp_path) == 1


def test_next_session_number_is_max_plus_one(tmp_path):
    _finalized(tmp_path / "a", 3)
    _finalized(tmp_path / "b", 7)
    _finalized(tmp_path / "c", 5)
    assert SessionStore.next_session_number(tmp_path) == 8


def test_next_session_number_ignores_non_numeric(tmp_path):
    _finalized(tmp_path / "a", 3)
    d = tmp_path / "b"
    d.mkdir(parents=True)
    (d / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "metadata": {"task": "pick_and_place", "session_number": "not-an-int"},
        "export": {"state": "SUCCEEDED"},
    }))
    assert SessionStore.next_session_number(tmp_path) == 4


def test_create_auto_assigns_session_number(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"task": "pick_and_place"})
    partial = json.loads((session.directory / "manifest.partial.json").read_text())
    assert partial["metadata"]["session_number"] == 1


def test_create_respects_explicit_session_number(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"task": "pick_and_place", "session_number": 42})
    partial = json.loads((session.directory / "manifest.partial.json").read_text())
    assert partial["metadata"]["session_number"] == 42


def test_schema_declares_session_number_feature():
    from realman_recording.lerobot_schema import schema_from_parameters
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        cartesian_command_frames=["l/work/cell", "m/work/cell", "r/work/cell"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=["/gripper_left/command", "/gripper_mid/command", "/gripper_right/command"],
        camera_ids=["orbbec-left", "orbbec-middle", "orbbec-right", "d435"],
    )
    features = schema.features({camera: (240, 320, 3) for camera in schema.camera_ids})
    assert features["session_number"] == {"dtype": "int64", "shape": (1,)}

