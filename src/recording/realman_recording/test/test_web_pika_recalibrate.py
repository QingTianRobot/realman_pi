"""aiohttp routes for the :8770 Pika 重标定 button (run where aiohttp is installed)."""
import asyncio
import threading

import pytest

from realman_recording.web_server import RecordingWebServer


class _NullLogger:
    def warning(self, *_args):
        pass


def _server(recalibrate=None, helper_status=None):
    server = object.__new__(RecordingWebServer)
    server._pika_recalibrate = recalibrate
    server._pika_helper_status = helper_status
    server._logger = _NullLogger()
    return server


def _app(server):
    from aiohttp import web

    app = web.Application()
    app.router.add_post("/api/pika/recalibrate", server._pika_recalibrate_route)
    app.router.add_get("/api/pika/helper", server._pika_helper_route)
    return app


def _request(app, method, url):
    from aiohttp.test_utils import TestClient, TestServer

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            response = await getattr(client, method)(url)
            return response.status, await response.json()
        finally:
            await client.close()

    return asyncio.run(run())


def test_recalibrate_passes_status_and_body_through_off_the_loop():
    pytest.importorskip("aiohttp")
    seen = {}

    def recalibrate():
        seen["thread"] = threading.current_thread().name
        return 409, {"ok": False, "error": "录制进行中，不能重标定"}

    status, body = _request(_app(_server(recalibrate=recalibrate)), "post", "/api/pika/recalibrate")
    assert (status, body["error"]) == (409, "录制进行中，不能重标定")
    assert seen["thread"] != threading.main_thread().name


def test_recalibrate_not_configured_is_404():
    pytest.importorskip("aiohttp")
    status, body = _request(_app(_server()), "post", "/api/pika/recalibrate")
    assert (status, body["error"]) == (404, "Pika 重标定未配置")


def test_helper_status_routes():
    pytest.importorskip("aiohttp")
    assert _request(_app(_server()), "get", "/api/pika/helper") == (200, {"configured": False})
    status, body = _request(_app(_server(helper_status=lambda: (200, {"running": True, "busy": False}))),
                            "get", "/api/pika/helper")
    assert status == 200
    assert body == {"configured": True, "reachable": True, "running": True, "busy": False}
    _status, body = _request(_app(_server(helper_status=lambda: (0, {"ok": False, "error": "x"}))),
                             "get", "/api/pika/helper")
    assert body["reachable"] is False
