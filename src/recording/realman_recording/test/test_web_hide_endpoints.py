"""Endpoint tests for POST /api/lerobot/{session_id}/delete and /restore."""
import json

import pytest


def _make_session(root, session_id, export_state="SUCCEEDED"):
    directory = root / session_id
    directory.mkdir(parents=True)
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": export_state},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))
    return directory


def test_delete_and_restore_endpoints(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "rec"
    root.mkdir()
    session = _make_session(root, "s1")

    class _NullLogger:
        def warning(self, *_args, **_kwargs):
            pass

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._logger = _NullLogger()

    app = web.Application()
    app.router.add_post("/api/lerobot/{session_id}/delete", server._lerobot_delete)
    app.router.add_post("/api/lerobot/{session_id}/restore", server._lerobot_restore)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            deleted = await client.post("/api/lerobot/s1/delete")
            assert deleted.status == 200
            assert await deleted.json() == {"ok": True}
            assert json.loads((session / "manifest.json").read_text())["decision"] == "DELETED"

            restored = await client.post("/api/lerobot/s1/restore")
            assert restored.status == 200
            assert await restored.json() == {"ok": True}
            assert json.loads((session / "manifest.json").read_text())["decision"] == "ADOPTED"
        finally:
            await client.close()

    asyncio.run(run())


def test_delete_endpoint_rejects_unknown_session_with_404(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "rec"
    root.mkdir()

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._logger = type("_NullLogger", (), {"warning": lambda *a, **k: None})()

    app = web.Application()
    app.router.add_post("/api/lerobot/{session_id}/delete", server._lerobot_delete)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            missing = await client.post("/api/lerobot/nope/delete")
            assert missing.status == 404
        finally:
            await client.close()

    asyncio.run(run())


def test_delete_endpoint_rejects_unexported_session_with_409(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root, "s1", export_state="RUNNING")

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._logger = type("_NullLogger", (), {"warning": lambda *a, **k: None})()

    app = web.Application()
    app.router.add_post("/api/lerobot/{session_id}/delete", server._lerobot_delete)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            conflict = await client.post("/api/lerobot/s1/delete")
            assert conflict.status == 409
        finally:
            await client.close()

    asyncio.run(run())
