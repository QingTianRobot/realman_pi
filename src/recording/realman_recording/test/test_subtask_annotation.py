"""Tests for subtask annotation: v3 schema feature, store write, exporter mapping,
and the GET/POST endpoints.

The pure frame->subtask mapping and coverage-validation functions (Task 3) and the
store write (Task 2) are ROS-free and always run.  The aiohttp endpoint tests are
skipped locally where aiohttp is absent and run in Docker.
"""
import json

import pytest

from realman_recording.lerobot_schema import schema_from_parameters
from realman_recording.session_store import SessionStore


def _schema():
    return schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=[],
    )


# --- Task 1: LeRobotV3Schema.features() declares subtask_index --------------------


def test_schema_declares_subtask_index_feature():
    features = _schema().features({})
    assert features["subtask_index"] == {"dtype": "int64", "shape": (1,)}


# --- Task 2: SessionStore.update_subtasks() --------------------------------------


def _make_session(directory, *, state="READY", export_state="SUCCEEDED", frame_count=100, subtasks=None):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "export").mkdir(parents=True, exist_ok=True)
    manifest = {"state": state, "decision": "ADOPTED", "export": {"state": export_state}}
    if subtasks is not None:
        manifest["subtasks"] = subtasks
    (directory / "manifest.json").write_text(json.dumps(manifest))
    (directory / "export" / "lerobot-v3.json").write_text(json.dumps({"frame_count": frame_count}))


def test_update_subtasks_writes_segments(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10)
    subtasks = [
        {"index": 0, "label": "pick", "start_frame": 0, "end_frame": 4},
        {"index": 1, "label": "place", "start_frame": 5, "end_frame": 9},
    ]
    payload = SessionStore.update_subtasks(directory, subtasks)
    assert payload["subtasks"] == subtasks
    assert json.loads((directory / "manifest.json").read_text())["subtasks"] == subtasks


def test_update_subtasks_rejects_overlapping_segments(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10)
    subtasks = [
        {"index": 0, "label": "a", "start_frame": 0, "end_frame": 4},
        {"index": 1, "label": "b", "start_frame": 4, "end_frame": 9},
    ]
    with pytest.raises(ValueError):
        SessionStore.update_subtasks(directory, subtasks)


def test_update_subtasks_rejects_empty_label(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10)
    for label in ("", "   "):
        with pytest.raises(ValueError):
            SessionStore.update_subtasks(
                directory, [{"index": 0, "label": label, "start_frame": 0, "end_frame": 1}]
            )


def test_update_subtasks_rejects_out_of_bounds(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10)
    with pytest.raises(ValueError):
        SessionStore.update_subtasks(
            directory, [{"index": 0, "label": "a", "start_frame": 0, "end_frame": 10}]
        )


def test_update_subtasks_rejects_non_ascending_index(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10)
    subtasks = [
        {"index": 1, "label": "a", "start_frame": 0, "end_frame": 1},
        {"index": 0, "label": "b", "start_frame": 2, "end_frame": 3},
    ]
    with pytest.raises(ValueError):
        SessionStore.update_subtasks(directory, subtasks)


def test_update_subtasks_rejects_not_ready(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, state="FAILED")
    with pytest.raises(RuntimeError):
        SessionStore.update_subtasks(directory, [])


def test_update_subtasks_rejects_not_succeeded(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, export_state="RUNNING")
    with pytest.raises(RuntimeError):
        SessionStore.update_subtasks(directory, [])


def test_update_subtasks_clears_existing_segments(tmp_path):
    directory = tmp_path / "s"
    _make_session(directory, frame_count=10, subtasks=[{"index": 0, "label": "a", "start_frame": 0, "end_frame": 1}])
    payload = SessionStore.update_subtasks(directory, [])
    assert payload["subtasks"] == []
