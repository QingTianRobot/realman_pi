import asyncio
import json
from pathlib import Path

import pytest
import yaml
from aiohttp import web

from realman_web_control.web_server import WebControlServer, WebServerConfig, load_server_config

ROOT = Path(__file__).resolve().parents[4]
ROOT_CONFIG = ROOT / "config/ros/realman_web_control.yaml"


def test_root_config_restarts_only_the_bringup_service():
    config = load_server_config(ROOT_CONFIG)
    assert config.docker_restart_url == "http://127.0.0.1:8782"
    assert config.docker_restart_service == "realman_bringup_remote"
    helper = json.loads((ROOT / "config/docker/restart_helper.json").read_text())
    assert helper["port"] == 8782 and helper["bind_host"] == "127.0.0.1"
    assert helper["services"] == ["realman_bringup_remote"]


@pytest.mark.parametrize("change, match", [
    ({"url": "ftp://x"}, "docker_restart.url"),
    ({"service": ""}, "docker_restart.service"),
    ({"timeout_sec": 0}, "docker_restart.timeout_sec"),
])
def test_restart_config_is_validated(tmp_path, change, match):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["docker_restart"].update(change)
    (tmp_path / "ros").mkdir()
    path = tmp_path / "ros" / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match=match):
        load_server_config(path)


class FakeLogger:
    def __init__(self):
        self.lines = []

    def error(self, message):
        self.lines.append(message)

    def warning(self, message):
        self.lines.append(message)


class FakeRequest:
    def __init__(self, origin=None):
        self.headers = {"Origin": origin} if origin else {}
        self.scheme = "http"
        self.host = "robot:8765"
        self.remote = "10.0.0.9"


def _server(tmp_path, url):
    config = WebServerConfig(
        bind_host="127.0.0.1", port=8765, allowed_origins=("same-origin",), max_clients=8,
        max_message_bytes=65536, discovery_period_sec=1.0, web_override_timeout_sec=5.0,
        docker_restart_url=url, docker_restart_service="realman_bringup_remote",
    )
    return WebControlServer(
        config=config, manifest={}, static_root=tmp_path, description_root=tmp_path,
        calibration_config_file=tmp_path / "c.yaml", calibration_log_root=tmp_path,
        on_command=lambda *_: None, on_client_connected=None, logger=FakeLogger(),
    )


def test_restart_is_proxied_with_the_configured_service_only(tmp_path):
    async def scenario():
        restarts = []

        async def status(_request):
            return web.json_response({"services": ["realman_bringup_remote"], "restarting": bool(restarts)})

        async def restart(request):
            body = await request.json()
            restarts.append(body)
            if len(restarts) > 1:
                return web.json_response({"ok": False, "error": "already restarting"}, status=409)
            return web.json_response({"ok": True, "service": body["service"], "started_at_ms": 1})

        app = web.Application()
        app.router.add_get("/status", status)
        app.router.add_post("/restart", restart)
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "127.0.0.1", 0)
        await site.start()
        port = site._server.sockets[0].getsockname()[1]
        server = _server(tmp_path, f"http://127.0.0.1:{port}")
        try:
            idle = json.loads((await server._docker_restart_status(None)).text)
            started = await server._docker_restart(FakeRequest("http://robot:8765"))
            busy = json.loads((await server._docker_restart_status(None)).text)
            refused = await server._docker_restart(FakeRequest())
            with pytest.raises(web.HTTPForbidden):
                await server._docker_restart(FakeRequest("http://evil.example"))
            await runner.cleanup()
            offline = json.loads((await server._docker_restart_status(None)).text)
            offline_post = await server._docker_restart(FakeRequest())
        finally:
            if server._bt_session is not None:
                await server._bt_session.close()
        return idle, started, busy, refused, offline, offline_post, restarts, server.logger.lines

    idle, started, busy, refused, offline, offline_post, restarts, logs = asyncio.run(scenario())
    assert idle == {"available": True, "service": "realman_bringup_remote",
                    "helper": {"services": ["realman_bringup_remote"], "restarting": False}}
    assert started.status == 200 and json.loads(started.text)["service"] == "realman_bringup_remote"
    assert busy["helper"]["restarting"] is True
    assert refused.status == 409
    assert restarts == [{"service": "realman_bringup_remote"}] * 2  # cross-origin never reached the helper
    assert offline["available"] is False and "restart-helper install" in offline["error"]
    assert offline_post.status == 503
    assert any("realman_bringup_remote" in line and "10.0.0.9" in line for line in logs)


def test_disabled_restart_hides_the_button_and_refuses_posts(tmp_path):
    server = _server(tmp_path, "")
    assert json.loads(asyncio.run(server._docker_restart_status(None)).text) == {"available": False}
    with pytest.raises(web.HTTPNotFound):
        asyncio.run(server._docker_restart(FakeRequest()))
