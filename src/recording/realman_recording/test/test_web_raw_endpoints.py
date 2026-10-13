"""Endpoint tests for GET /api/lerobot/{session_id}/raw and /raw/image/..."""
import json

import pytest


def _make_raw_session(root, session_id):
    directory = root / session_id
    (directory / "videos" / "orbbec-left").mkdir(parents=True)
    (directory / "videos" / "d435").mkdir(parents=True)
    # Filenames are nanosecond timestamps; numeric sort must beat lexical sort.
    (directory / "videos" / "orbbec-left" / "20.jpg").write_bytes(b"\xff\xd8left20")
    (directory / "videos" / "orbbec-left" / "3.jpg").write_bytes(b"\xff\xd8left3")
    (directory / "videos" / "orbbec-left" / "100.jpg").write_bytes(b"\xff\xd8left100")
    (directory / "videos" / "d435" / "7.jpg").write_bytes(b"\xff\xd8d4357")
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY",
        "decision": "PENDING",
        "started_realtime_ns": 1_000_000_000,
        "ended_realtime_ns": 2_500_000_000,
        "metadata": {"session_number": 136, "task": "pick"},
        "summary": {"accepted_samples": 42},
    }))
    return directory


def _build_server(root):
    from realman_recording.web_server import RecordingWebServer

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._logger = type("_NullLogger", (), {"warning": lambda *a, **k: None})()
    return server


def test_raw_endpoint_returns_metadata_and_numerically_sorted_frames(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    root = tmp_path / "rec"
    root.mkdir()
    _make_raw_session(root, "s1")

    server = _build_server(root)
    app = web.Application()
    app.router.add_get("/api/lerobot/{session_id}/raw", server._lerobot_raw)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await client.get("/api/lerobot/s1/raw")
            assert response.status == 200
            payload = await response.json()
            assert payload["session_id"] == "s1"
            assert payload["session_number"] == 136
            assert payload["task"] == "pick"
            assert payload["state"] == "READY"
            assert payload["duration_s"] == 1.5
            # Numeric ordering: 3 < 20 < 100.
            assert payload["cameras"]["orbbec-left"] == ["3.jpg", "20.jpg", "100.jpg"]
            assert payload["cameras"]["d435"] == ["7.jpg"]
        finally:
            await client.close()

    asyncio.run(run())


def test_raw_image_endpoint_serves_one_frame(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    root = tmp_path / "rec"
    root.mkdir()
    _make_raw_session(root, "s1")

    server = _build_server(root)
    app = web.Application()
    app.router.add_get(
        "/api/lerobot/{session_id}/raw/image/{camera_id}/{filename}",
        server._lerobot_raw_image,
    )

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await client.get("/api/lerobot/s1/raw/image/orbbec-left/20.jpg")
            assert response.status == 200
            assert response.content_type == "image/jpeg"
            assert await response.read() == b"\xff\xd8left20"
        finally:
            await client.close()

    asyncio.run(run())


def test_raw_image_endpoint_rejects_traversal_and_bad_extension(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    root = tmp_path / "rec"
    root.mkdir()
    _make_raw_session(root, "s1")

    server = _build_server(root)
    app = web.Application()
    app.router.add_get(
        "/api/lerobot/{session_id}/raw/image/{camera_id}/{filename}",
        server._lerobot_raw_image,
    )

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            bad_camera = await client.get("/api/lerobot/s1/raw/image/..%2Fescape/20.jpg")
            assert bad_camera.status == 404
            bad_ext = await client.get("/api/lerobot/s1/raw/image/orbbec-left/20.png")
            assert bad_ext.status == 404
            missing = await client.get("/api/lerobot/s1/raw/image/orbbec-left/999.jpg")
            assert missing.status == 404
        finally:
            await client.close()

    asyncio.run(run())


def test_raw_endpoint_rejects_unknown_session_with_404(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    root = tmp_path / "rec"
    root.mkdir()

    server = _build_server(root)
    app = web.Application()
    app.router.add_get("/api/lerobot/{session_id}/raw", server._lerobot_raw)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await client.get("/api/lerobot/nope/raw")
            assert response.status == 404
        finally:
            await client.close()

    asyncio.run(run())
