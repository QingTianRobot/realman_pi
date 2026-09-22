"""Synthetic tests for offline replay helpers (no ROS, MCAP, Rerun or hardware)."""
from __future__ import annotations

import json

import pytest

from realman_recording.replay import (
    MediaSegment,
    ReplayOptions,
    ReplayPlayer,
    classify_topic,
    parse_media_index,
    select_segments,
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


def test_parse_media_index_returns_empty_without_index(tmp_path):
    assert parse_media_index(tmp_path) == []


def test_parse_media_index_reads_segments(tmp_path):
    videos = tmp_path / "videos"
    videos.mkdir()
    (videos / "media-index.json").write_text(
        json.dumps(
            {
                "segments": [
                    {"camera_id": "realsense", "path": "realsense/segment-000000.mkv",
                     "started_wall_ns": 0, "ended_wall_ns": 100},
                    {"camera_id": "orbbec-left", "path": "orbbec-left/segment-000000.mkv",
                     "started_wall_ns": 50, "ended_wall_ns": 150},
                ]
            }
        )
    )
    segments = parse_media_index(tmp_path)
    assert [s.camera_id for s in segments] == ["realsense", "orbbec-left"]
    assert segments[0].ended_wall_ns == 100


def test_parse_media_index_rejects_invalid_segment_range_and_path(tmp_path):
    videos = tmp_path / "videos"
    videos.mkdir()
    (videos / "media-index.json").write_text(json.dumps({"segments": [
        {"camera_id": "cam", "path": "../outside.mkv", "started_wall_ns": 100, "ended_wall_ns": 50},
    ]}))
    with pytest.raises(ValueError):
        parse_media_index(tmp_path)


def test_media_segment_path_is_confined_to_session_videos(tmp_path):
    with pytest.raises(ValueError):
        MediaSegment("cam", "../outside.mkv", 0, 100)


def test_select_segments_filters_by_range_and_camera():
    segments = [
        MediaSegment("a", "a/0.mkv", 0, 100),
        MediaSegment("b", "b/0.mkv", 200, 300),
        MediaSegment("a", "a/1.mkv", 400, 500),
    ]
    assert [s.camera_id for s in select_segments(segments)] == ["a", "b", "a"]
    assert [s.camera_id for s in select_segments(segments, cameras=["a"])] == ["a", "a"]
    # [150, 350] overlaps only b [200, 300]
    assert [s.camera_id for s in select_segments(segments, start_ns=150, end_ns=350)] == ["b"]
    # [250, 450] overlaps b and the later a segment
    assert [s.camera_id for s in select_segments(segments, start_ns=250, end_ns=450)] == ["b", "a"]
    assert select_segments(segments, start_ns=600) == []


def test_classify_topic_recognizes_arm_and_gripper_topics():
    assert classify_topic("/l/joint_states", "sensor_msgs/msg/JointState") == ("joint", "l")
    assert classify_topic("/m/connected", "std_msgs/msg/Bool") == ("connection", "m")
    assert classify_topic("/r/coordinates/state", "std_msgs/msg/String") == ("coordinates", "r")
    assert classify_topic("/tf", "tf2_msgs/msg/TFMessage") == ("tf", "")
    assert classify_topic("/gripper_left/position", "std_msgs/msg/Float64") == (
        "gripper_position", "/gripper_left/position")
    assert classify_topic("/gripper_left/torque_reached", "std_msgs/msg/Bool") == (
        "gripper_torque", "/gripper_left/torque_reached")
    assert classify_topic("/gripper_left/alarm", "std_msgs/msg/Int32") == (
        "gripper_alarm", "/gripper_left/alarm")
    assert classify_topic("/l/cartesian_velocity/command", "geometry_msgs/msg/TwistStamped") == (
        "arm_action", "/l/cartesian_velocity/command")


def test_classify_topic_skips_unknown():
    assert classify_topic("/some/unknown/topic", "std_msgs/msg/String") is None
    assert classify_topic("relative/topic", "std_msgs/msg/String") is None


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

    def TextLog(self, text):
        return ("text", text)


class _Msg:
    def __init__(self, **fields):
        self.__dict__.update(fields)


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


def test_emit_state_logs_joint_connection_and_gripper_curves(tmp_path):
    _write_manifest(tmp_path)
    player = ReplayPlayer(ReplayOptions(tmp_path))
    rerun = _FakeRerun()

    joint = _Msg(name=[f"joint_{index}" for index in range(1, 7)],
                 position=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
    player._emit_state(rerun, "joint", "l", joint)
    assert ("log", "recording/arms/l/joints_rad", ("scalars", (0.1, 0.2, 0.3, 0.4, 0.5, 0.6))) in rerun.events

    player._emit_state(rerun, "connection", "l", _Msg(data=True))
    assert ("log", "recording/arms/l/connected", ("scalars", (1,))) in rerun.events

    player._emit_state(rerun, "gripper_position", "/gripper_left/position", _Msg(data=0.5))
    assert ("log", "recording/grippers/gripper_left/position", ("scalars", (0.5,))) in rerun.events
