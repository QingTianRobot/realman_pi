"""Tests for subtask annotation: v3 schema feature, store write, exporter mapping,
and the GET/POST endpoints.

The pure frame->subtask mapping and coverage-validation functions (Task 3) and the
store write (Task 2) are ROS-free and always run.  The aiohttp endpoint tests are
skipped locally where aiohttp is absent and run in Docker.
"""
import json

import pytest

from realman_recording.lerobot_exporter import (
    _assert_single_annotated_episode,
    _frame_subtask_index,
    _subtasks_table,
    _validate_subtask_coverage,
)
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


# --- Task 3: pure frame->subtask mapping and coverage validation ------------------


def test_frame_subtask_index_maps_segments_and_leaves_uncovered():
    subtasks = [
        {"index": 0, "label": "a", "start_frame": 0, "end_frame": 2},
        {"index": 1, "label": "b", "start_frame": 4, "end_frame": 4},
    ]
    assert _frame_subtask_index(subtasks, 6) == [0, 0, 0, -1, 1, -1]


def test_frame_subtask_index_empty_returns_all_uncovered():
    assert _frame_subtask_index([], 4) == [-1, -1, -1, -1]


def test_frame_subtask_index_includes_end_frame():
    subtasks = [{"index": 7, "label": "x", "start_frame": 2, "end_frame": 3}]
    assert _frame_subtask_index(subtasks, 5) == [-1, -1, 7, 7, -1]


def test_validate_subtask_coverage_rejects_uncovered_frame():
    with pytest.raises(ValueError):
        _validate_subtask_coverage(
            [0, -1, 0],
            [{"index": 0, "label": "a", "start_frame": 0, "end_frame": 2}],
        )


def test_validate_subtask_coverage_rejects_empty_label():
    with pytest.raises(ValueError):
        _validate_subtask_coverage(
            [0, 0],
            [{"index": 0, "label": "", "start_frame": 0, "end_frame": 1}],
        )


def test_validate_subtask_coverage_accepts_full_coverage():
    _validate_subtask_coverage(
        [0, 0, 1],
        [
            {"index": 0, "label": "a", "start_frame": 0, "end_frame": 1},
            {"index": 1, "label": "b", "start_frame": 2, "end_frame": 2},
        ],
    )


def test_subtasks_table_returns_label_and_index_columns():
    subtasks = [
        {"index": 0, "label": "pick", "start_frame": 0, "end_frame": 2},
        {"index": 3, "label": "place", "start_frame": 3, "end_frame": 5},
    ]
    assert _subtasks_table(subtasks) == (["pick", "place"], [0, 3])


def test_write_subtasks_parquet_uses_string_and_int64_columns(tmp_path, monkeypatch):
    import sys
    import types

    from realman_recording.lerobot_exporter import LeRobotExporter

    captured = {}

    def fake_array(value, type):
        return (value, type)

    def fake_write_table(table, path):
        captured["path"] = path

    fake_pq = types.SimpleNamespace(write_table=fake_write_table)
    fake_pa = types.SimpleNamespace(
        array=fake_array,
        string=lambda: "string",
        int64=lambda: "int64",
        table=lambda data: captured.update(data) or object(),
        parquet=fake_pq,
    )
    monkeypatch.setitem(sys.modules, "pyarrow", fake_pa)
    monkeypatch.setitem(sys.modules, "pyarrow.parquet", fake_pq)

    root = tmp_path / "dataset"
    LeRobotExporter._write_subtasks_parquet(
        root, [{"index": 3, "label": "place", "start_frame": 0, "end_frame": 1}]
    )

    assert set(captured) == {"subtask", "subtask_index", "path"}
    assert captured["subtask"] == (["place"], "string")
    assert captured["subtask_index"] == ([3], "int64")
    assert captured["path"] == root / "meta" / "subtasks.parquet"


def test_single_annotated_episode_guard_rejects_existing_label_table(tmp_path):
    root = tmp_path / "dataset"
    (root / "meta").mkdir(parents=True)
    (root / "meta" / "subtasks.parquet").write_bytes(b"not-empty")
    with pytest.raises(ValueError):
        _assert_single_annotated_episode(root)


def test_single_annotated_episode_guard_allows_fresh_dataset(tmp_path):
    _assert_single_annotated_episode(tmp_path / "dataset")


def test_single_annotated_episode_guard_ignores_empty_table(tmp_path):
    root = tmp_path / "dataset"
    (root / "meta").mkdir(parents=True)
    (root / "meta" / "subtasks.parquet").write_bytes(b"")
    _assert_single_annotated_episode(root)


# --- Task 4: GET/POST /api/lerobot/{session_id}/subtasks --------------------------


def _endpoint_server(root):
    from realman_recording.web_server import RecordingWebServer

    class _NullLogger:
        def warning(self, *_args, **_kwargs):
            pass

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._logger = _NullLogger()
    return server


def _endpoint_app(server):
    from aiohttp import web

    app = web.Application()
    app.router.add_get("/api/lerobot/{session_id}/subtasks", server._lerobot_subtasks)
    app.router.add_post("/api/lerobot/{session_id}/subtasks", server._lerobot_subtasks_update)
    return app


async def _request(app, method, url, **kwargs):
    from aiohttp.test_utils import TestClient, TestServer

    client = TestClient(TestServer(app))
    await client.start_server()
    try:
        response = await getattr(client, method)(url, **kwargs)
        status = response.status
        try:
            body = await response.json()
        except Exception:
            body = None
        return status, body
    finally:
        await client.close()


def test_subtasks_endpoint_get_returns_current_subtasks(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    segment = {"index": 0, "label": "pick", "start_frame": 0, "end_frame": 9}
    _make_session(root / "s1", frame_count=10, subtasks=[segment])
    server = _endpoint_server(root)

    async def run():
        status, body = await _request(_endpoint_app(server), "get", "/api/lerobot/s1/subtasks")
        assert status == 200
        assert body == {"subtasks": [segment]}

    asyncio.run(run())


def test_subtasks_endpoint_get_returns_empty_when_absent(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root / "s1", frame_count=10)
    server = _endpoint_server(root)

    async def run():
        status, body = await _request(_endpoint_app(server), "get", "/api/lerobot/s1/subtasks")
        assert status == 200
        assert body == {"subtasks": []}

    asyncio.run(run())


def test_subtasks_endpoint_post_writes_segments(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    session = root / "s1"
    _make_session(session, frame_count=10)
    server = _endpoint_server(root)
    segments = [{"index": 0, "label": "pick", "start_frame": 0, "end_frame": 9}]

    async def run():
        status, body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/subtasks", json={"subtasks": segments}
        )
        assert status == 200
        assert body == {"ok": True}
        assert json.loads((session / "manifest.json").read_text())["subtasks"] == segments

    asyncio.run(run())


def test_subtasks_endpoint_rejects_invalid_segments_with_404(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root / "s1", frame_count=10)
    server = _endpoint_server(root)

    async def run():
        status, _body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/subtasks",
            json={"subtasks": [{"index": 0, "label": "a", "start_frame": 0, "end_frame": 99}]},
        )
        assert status == 404

    asyncio.run(run())


def test_subtasks_endpoint_rejects_unknown_session_with_404(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    server = _endpoint_server(root)

    async def run():
        status, _body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/nope/subtasks", json={"subtasks": []}
        )
        assert status == 404

    asyncio.run(run())


def test_subtasks_endpoint_rejects_unexported_session_with_409(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root / "s1", export_state="RUNNING")
    server = _endpoint_server(root)

    async def run():
        status, _body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/subtasks", json={"subtasks": []}
        )
        assert status == 409

    asyncio.run(run())
