"""Tests for hidden-episode listing and task relabeling (trash + task endpoints).

The catalog and store tests are ROS-free and always run.  The aiohttp endpoint
tests are skipped locally where aiohttp is absent and run in Docker.
"""
import json

import pytest

from realman_recording.lerobot_web_replay import LeRobotReplayCatalog
from realman_recording.session_store import SessionStore


class _FakeDataset:
    def __len__(self):
        return 7


def _make_catalog_session(root, export_root, session_id, decision="ADOPTED", export_state="SUCCEEDED", task=None):
    session = root / session_id
    dataset_root = export_root / session_id
    (session / "export").mkdir(parents=True)
    dataset_root.mkdir(parents=True)
    manifest = {
        "state": "READY",
        "decision": decision,
        "export": {"state": export_state, "result": str(dataset_root)},
    }
    if task is not None:
        manifest["metadata"] = {"task": task}
    (session / "manifest.json").write_text(json.dumps(manifest))
    (session / "export" / "lerobot-v3.json").write_text(json.dumps({
        "dataset_root": str(dataset_root),
        "repo_id": f"realman/{session_id}",
        "fps": 10.0,
        "episode_index": 0,
        "first_walltime_ns": 100,
    }))
    return session


def _make_store_manifest(directory, state="READY", export_state="SUCCEEDED", metadata=None):
    directory.mkdir(parents=True, exist_ok=True)
    payload = {"state": state, "decision": "ADOPTED", "export": {"state": export_state}}
    if metadata is not None:
        payload["metadata"] = metadata
    (directory / "manifest.json").write_text(json.dumps(payload))


def _catalog(tmp_path):
    recording_root = tmp_path / "rec"
    export_root = recording_root / "lerobot"
    recording_root.mkdir()
    export_root.mkdir(parents=True)
    return recording_root, export_root


# --- Task 1: LeRobotReplayCatalog.list_hidden() -----------------------------------


def test_list_hidden_returns_only_deleted(tmp_path):
    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "visible", decision="ADOPTED")
    _make_catalog_session(root, export_root, "deleted-session", decision="DELETED", task="pick cup")
    # A DELETED session whose export never succeeded must not be listed.
    _make_catalog_session(root, export_root, "deleted-running", decision="DELETED", export_state="RUNNING")
    catalog = LeRobotReplayCatalog(root, export_root, dataset_factory=lambda _reference: _FakeDataset())
    hidden = catalog.list_hidden()
    assert [h["session_id"] for h in hidden] == ["deleted-session"]
    assert hidden[0]["task"] == "pick cup"
    assert hidden[0]["frames"] == 7
    assert hidden[0]["fps"] == 10.0


def test_list_hidden_degrades_frames_when_dataset_is_unavailable(tmp_path):
    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "deleted-session", decision="DELETED")

    def broken_factory(_reference):
        raise RuntimeError("dataset unavailable")

    catalog = LeRobotReplayCatalog(root, export_root, dataset_factory=broken_factory)
    hidden = catalog.list_hidden()
    assert [h["session_id"] for h in hidden] == ["deleted-session"]
    assert hidden[0]["frames"] == 0
    assert hidden[0]["fps"] == 10.0


def test_list_hidden_survives_nonstandard_dataset_open_failure(tmp_path):
    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "deleted-session", decision="DELETED", task="pick")

    def corrupt_factory(_reference):
        # A truncated parquet typically surfaces as pyarrow ArrowInvalid/KeyError,
        # which is outside the manifest-validation exception tuple and must not
        # turn the whole /trash list into a 503.
        raise KeyError("corrupt parquet")

    catalog = LeRobotReplayCatalog(root, export_root, dataset_factory=corrupt_factory)
    hidden = catalog.list_hidden()
    assert [h["session_id"] for h in hidden] == ["deleted-session"]
    assert hidden[0]["frames"] == 0
    assert hidden[0]["task"] == "pick"
    assert hidden[0]["fps"] == 10.0


# --- Task 2: SessionStore.update_task() -------------------------------------------


def test_update_task_updates_manifest(tmp_path):
    directory = tmp_path / "s"
    _make_store_manifest(directory)
    payload = SessionStore.update_task(directory, "pick cup")
    assert payload["metadata"]["task"] == "pick cup"
    assert json.loads((directory / "manifest.json").read_text())["metadata"]["task"] == "pick cup"


def test_update_task_preserves_existing_metadata(tmp_path):
    directory = tmp_path / "s"
    _make_store_manifest(directory, metadata={"task": "old", "foo": "bar"})
    payload = SessionStore.update_task(directory, "new")
    assert payload["metadata"] == {"task": "new", "foo": "bar"}


def test_update_task_rejects_empty(tmp_path):
    directory = tmp_path / "s"
    _make_store_manifest(directory)
    for task in ("", "   ", None, 3):
        with pytest.raises(ValueError):
            SessionStore.update_task(directory, task)


def test_update_task_rejects_not_succeeded(tmp_path):
    directory = tmp_path / "s"
    _make_store_manifest(directory, export_state="RUNNING")
    with pytest.raises(RuntimeError):
        SessionStore.update_task(directory, "pick")


def test_update_task_rejects_not_ready(tmp_path):
    directory = tmp_path / "s"
    _make_store_manifest(directory, state="FAILED")
    with pytest.raises(RuntimeError):
        SessionStore.update_task(directory, "pick")


# --- Task 3: GET /api/lerobot/trash + POST /api/lerobot/{session_id}/task ----------


def _endpoint_server(root, export_root):
    from realman_recording.web_server import RecordingWebServer

    class _NullLogger:
        def warning(self, *_args, **_kwargs):
            pass

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._replay = LeRobotReplayCatalog(root, export_root, dataset_factory=lambda _r: _FakeDataset())
    server._logger = _NullLogger()
    return server


def _endpoint_app(server):
    from aiohttp import web

    app = web.Application()
    app.router.add_get("/api/lerobot/trash", server._lerobot_trash)
    app.router.add_post("/api/lerobot/{session_id}/task", server._lerobot_task)
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


def test_trash_endpoint_lists_hidden_sessions(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "visible", decision="ADOPTED")
    _make_catalog_session(root, export_root, "hidden-session", decision="DELETED", task="pick")
    server = _endpoint_server(root, export_root)

    async def run():
        status, body = await _request(_endpoint_app(server), "get", "/api/lerobot/trash")
        assert status == 200
        assert [s["session_id"] for s in body["sessions"]] == ["hidden-session"]
        assert body["sessions"][0]["task"] == "pick"

    asyncio.run(run())


def test_task_endpoint_updates_manifest(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root, export_root = _catalog(tmp_path)
    session = _make_catalog_session(root, export_root, "hidden-session", decision="DELETED")
    server = _endpoint_server(root, export_root)

    async def run():
        status, body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/hidden-session/task", json={"task": "pick cup"}
        )
        assert status == 200
        assert body == {"ok": True}
        assert json.loads((session / "manifest.json").read_text())["metadata"]["task"] == "pick cup"

    asyncio.run(run())


def test_task_endpoint_rejects_unknown_session_with_404(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root, export_root = _catalog(tmp_path)
    server = _endpoint_server(root, export_root)

    async def run():
        status, _body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/nope/task", json={"task": "x"}
        )
        assert status == 404

    asyncio.run(run())


def test_task_endpoint_rejects_unexported_session_with_409(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "s1", export_state="RUNNING")
    server = _endpoint_server(root, export_root)

    async def run():
        status, _body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/task", json={"task": "x"}
        )
        assert status == 409

    asyncio.run(run())


def test_task_endpoint_rejects_empty_task_with_400(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    root, export_root = _catalog(tmp_path)
    _make_catalog_session(root, export_root, "s1")
    server = _endpoint_server(root, export_root)

    async def run():
        empty_status, _empty_body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/task", json={"task": ""}
        )
        assert empty_status == 400
        missing_status, _missing_body = await _request(
            _endpoint_app(server), "post", "/api/lerobot/s1/task", json={"foo": 1}
        )
        assert missing_status == 400

    asyncio.run(run())
