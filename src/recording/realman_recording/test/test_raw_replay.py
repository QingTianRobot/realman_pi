"""Inline replay of pending (待转换) sessions: raw MCAP streams + JPEG names -> replay frames."""
import json

import pytest

from realman_recording.raw_replay import build_raw_replay, camera_frames

S = 1_000_000_000


def _manifest(**extra):
    payload = {
        "state": "READY",
        "started_realtime_ns": 10 * S,
        "ended_realtime_ns": 11 * S,
        "metadata": {
            "session_number": 7,
            "task": "pick",
            "canonical": {"joint_names": ["joint_1", "joint_2"]},
            "canonical_config": {
                "arms": ["l", "r"],
                "arm_action_topics": ["/l/cartesian_velocity/command", "/r/cartesian_velocity/command"],
                "arm_velocity_topics": [],
                "gripper_position_topics": ["/gripper_left/position", "/gripper_right/position"],
                "gripper_action_topics": [],
            },
        },
    }
    payload.update(extra)
    return payload


def test_sample_and_hold_grid_with_gaps_before_first_sample():
    streams = {
        "/l/joint_states": [(10 * S, [0.1, 0.2]), (int(10.5 * S), [0.3, 0.4])],
        # The right arm starts publishing late: its slots stay None until then.
        "/r/joint_states": [(int(10.6 * S), [1.0, 2.0])],
        "/gripper_left/position": [(10 * S, [500.0])],
        "/l/cartesian_velocity/command": [(int(10.2 * S), [0.01, 0, 0, 0, 0, 0.02])],
    }
    cameras = {
        "d435": [(int(10.05 * S), "a.jpg"), (int(10.55 * S), "b.jpg")],
        "orbbec-left": [(int(10.3 * S), "c.jpg")],
    }
    payload = build_raw_replay(_manifest(), streams, cameras, fps=2)

    assert payload["fps"] == pytest.approx(2)
    assert [frame["timestamp_ns"] for frame in payload["frames"]] == [0, S // 2, S]
    first, middle, last = payload["frames"]
    assert first["features"]["observation.joint_position"] == [0.1, 0.2, None, None]
    assert middle["features"]["observation.joint_position"] == [0.3, 0.4, None, None]
    assert last["features"]["observation.joint_position"] == [0.3, 0.4, 1.0, 2.0]
    # state = joints then grippers, the layout the 3D arms and gripper bars read.
    assert last["state"] == [0.3, 0.4, 1.0, 2.0, 500.0, None]
    # No command sample yet at t=0: the whole feature is None, never zeros.
    assert first["features"]["action.command_action"] is None
    assert middle["features"]["action.command_action"][:6] == [0.01, 0, 0, 0, 0, 0.02]
    # Each camera shows its latest frame at or before the tick (its first frame before that).
    assert first["camera_frames"] == {"d435": "a.jpg", "orbbec-left": "c.jpg"}
    assert last["camera_frames"] == {"d435": "b.jpg", "orbbec-left": "c.jpg"}
    names = payload["summary"]["features"]
    assert names["observation.joint_position"]["names"] == ["l.joint_1", "l.joint_2", "r.joint_1", "r.joint_2"]
    assert names["observation.gripper_position"]["names"] == ["gripper_left", "gripper_right"]
    assert names["action.command_action"]["names"][:2] == ["l.vx", "l.vy"]
    assert payload["cameras"] == ["d435", "orbbec-left"]


def test_window_extends_to_cover_data_outside_the_manifest_window():
    streams = {"/l/joint_states": [(int(9.5 * S), [0.0, 0.0])]}
    payload = build_raw_replay(_manifest(), streams, {}, fps=2)
    assert payload["frames"][0]["walltime_ns"] == str(int(9.5 * S))
    assert payload["duration_s"] == pytest.approx(1.5)


def test_camera_frames_prefers_media_index_and_falls_back_to_filenames(tmp_path):
    videos = tmp_path / "videos"
    (videos / "d435").mkdir(parents=True)
    for stamp in (30, 4, 100):
        (videos / "d435" / f"{stamp}.jpg").write_bytes(b"\xff\xd8")
    assert camera_frames(tmp_path) == {"d435": [(4, "4.jpg"), (30, "30.jpg"), (100, "100.jpg")]}

    (videos / "media-index.json").write_text(json.dumps({"segments": [
        {"camera_id": "d435", "frames": [{"walltime_ns": 30, "path": "d435/30.jpg"}, {"walltime_ns": 4, "path": "d435/4.jpg"}]},
    ]}))
    assert camera_frames(tmp_path) == {"d435": [(4, "4.jpg"), (30, "30.jpg")]}


def test_raw_replay_endpoint_returns_frames_and_survives_unreadable_mcap(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "rec"
    session = root / "s1"
    (session / "videos" / "d435").mkdir(parents=True)
    (session / "videos" / "d435" / f"{10 * S}.jpg").write_bytes(b"\xff\xd8")
    (session / "manifest.json").write_text(json.dumps(_manifest()))

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    warnings = []
    server._logger = type("_Log", (), {"warning": lambda self, message: warnings.append(message)})()

    def broken_reader(_directory, _manifest):
        raise RuntimeError("no rosbag2_py here")

    server._raw_stream_reader = broken_reader
    app = web.Application()
    app.router.add_get("/api/lerobot/{session_id}/raw/replay", server._lerobot_raw_replay)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await client.get("/api/lerobot/s1/raw/replay?fps=4")
            assert response.status == 200
            payload = await response.json()
            assert payload["session_number"] == 7
            assert payload["state_error"] == "no rosbag2_py here"
            assert len(payload["frames"]) == 5
            assert payload["frames"][0]["camera_frames"] == {"d435": f"{10 * S}.jpg"}
            assert payload["frames"][0]["features"]["observation.joint_position"] is None
            missing = await client.get("/api/lerobot/..%2Fetc/raw/replay")
            assert missing.status == 404
        finally:
            await client.close()

    asyncio.run(run())
    assert warnings
