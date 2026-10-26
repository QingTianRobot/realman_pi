import asyncio
import json
from pathlib import Path

import pytest
import yaml
from aiohttp import web

from realman_web_control.param_tuning import ParamStore
from realman_web_control.web_server import WebControlServer, WebServerConfig, load_server_config

ROOT = Path(__file__).resolve().parents[4]
ROOT_CONFIG = ROOT / "config/ros/realman_web_control.yaml"

SAMPLE = "node:\n  speed: 0.10  # m/s\n  count: 3\n"
CATALOG = """\
schema_version: 1
applies: {bt_start: 下次启动行为树生效, bringup_restart: 重启 bringup 后生效}
groups:
  - id: main
    title: 主参数
    file: ros/sample.yaml
    prefix: node
    applies: bringup_restart
    readback: {node: /sample_node, param: "{key}"}
    params:
      - {key: speed, type: float, min: 0.01, max: 1.0, unit: m/s, note: 速度}
      - {key: count, type: int, min: 1, max: 10, note: 次数}
"""


class FakeLogger:
    def __init__(self):
        self.lines = []

    def error(self, message):
        self.lines.append(message)

    def warning(self, message):
        self.lines.append(message)


class FakeRequest:
    def __init__(self, body=None, origin=None):
        self.headers = {"Origin": origin} if origin else {}
        self.scheme = "http"
        self.host = "robot:8765"
        self.remote = "10.0.0.9"
        self._body = body

    async def json(self):
        if self._body is None:
            raise ValueError("no body")
        return self._body


def _server(tmp_path, *, enabled=True, store=True, reader=None):
    (tmp_path / "config/ros").mkdir(parents=True, exist_ok=True)
    (tmp_path / "config/web-control").mkdir(parents=True, exist_ok=True)
    (tmp_path / "config/ros/sample.yaml").write_text(SAMPLE, encoding="utf-8")
    catalog = tmp_path / "config/web-control/param_catalog.yaml"
    catalog.write_text(CATALOG, encoding="utf-8")
    config = WebServerConfig(
        bind_host="127.0.0.1", port=8765, allowed_origins=("same-origin",), max_clients=8,
        max_message_bytes=65536, discovery_period_sec=1.0, web_override_timeout_sec=5.0,
        param_catalog_file=catalog if enabled else None,
    )
    param_store = ParamStore(catalog, tmp_path / "config", tmp_path / "logs/param-tuning") if store else None
    return WebControlServer(
        config=config, manifest={}, static_root=tmp_path, description_root=tmp_path,
        calibration_config_file=tmp_path / "c.yaml", calibration_log_root=tmp_path,
        on_command=lambda *_: None, on_client_connected=None, logger=FakeLogger(),
        param_store=param_store, param_store_error="" if store else "catalog broken", param_reader=reader,
    )


def body(response):
    return json.loads(response.text)


def shas(server):
    return {file: info["sha"] for file, info in body(asyncio.run(server._params(None)))["files"].items()}


def test_root_config_enables_the_page_with_the_root_catalog():
    config = load_server_config(ROOT_CONFIG)
    assert config.param_catalog_file == ROOT / "config/web-control/param_catalog.yaml"
    assert config.param_readback_timeout_sec == 0.5


@pytest.mark.parametrize("change, match", [
    ({"readback_timeout_sec": 0}, "readback_timeout_sec"),
    ({"readback_timeout_sec": 9}, "readback_timeout_sec"),
    ({"catalog_file": 3}, "catalog_file"),
])
def test_param_tuning_config_is_validated(tmp_path, change, match):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["param_tuning"].update(change)
    (tmp_path / "ros").mkdir()
    path = tmp_path / "ros" / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match=match):
        load_server_config(path)


def test_empty_catalog_file_disables_the_routes(tmp_path):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["param_tuning"]["catalog_file"] = ""
    (tmp_path / "ros").mkdir()
    (tmp_path / "ros" / "web.yaml").write_text(yaml.safe_dump(document))
    assert load_server_config(tmp_path / "ros" / "web.yaml").param_catalog_file is None
    server = _server(tmp_path, enabled=False)
    with pytest.raises(web.HTTPNotFound):
        asyncio.run(server._params(None))
    with pytest.raises(web.HTTPNotFound):
        asyncio.run(server._params_apply(FakeRequest({"changes": []})))


def test_broken_catalog_is_a_503_with_the_reason(tmp_path):
    server = _server(tmp_path, store=False)
    with pytest.raises(web.HTTPServiceUnavailable) as caught:
        asyncio.run(server._params(None))
    assert caught.value.text == "catalog broken"


def test_snapshot_is_not_cached(tmp_path):
    response = asyncio.run(_server(tmp_path)._params(None))
    assert response.headers["Cache-Control"] == "no-store"
    assert [row["id"] for row in body(response)["groups"][0]["rows"]] == ["main/speed", "main/count"]


def test_dry_run_then_apply(tmp_path):
    server = _server(tmp_path)
    request = {"changes": [{"id": "main/speed", "value": 0.2}], "expected_sha": shas(server)}
    preview = asyncio.run(server._params_apply(FakeRequest(request | {"dry_run": True}, "http://robot:8765")))
    assert preview.status == 200 and "+  speed: 0.2  # m/s" in body(preview)["diff"]
    assert (tmp_path / "config/ros/sample.yaml").read_text() == SAMPLE
    applied = asyncio.run(server._params_apply(FakeRequest(request)))
    assert applied.status == 200 and body(applied)["changes"][0]["after"] == 0.2
    assert "  speed: 0.2  # m/s\n" in (tmp_path / "config/ros/sample.yaml").read_text()
    assert any("main/speed=0.1->0.2" in line and "10.0.0.9" in line for line in server.logger.lines)
    entries = body(asyncio.run(server._params_history(None)))["entries"]
    assert [entry["id"] for entry in entries] == [body(applied)["id"]]


def test_bad_values_conflicts_and_bodies(tmp_path):
    server = _server(tmp_path)
    bad = asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/count", "value": 0}],
                                                        "expected_sha": shas(server)})))
    assert bad.status == 400 and body(bad)["errors"] == [{"id": "main/count", "error": "below the minimum 1"}]
    stale = asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/count", "value": 2}],
                                                          "expected_sha": {"ros/sample.yaml": "old"}})))
    assert stale.status == 409 and body(stale)["files"] == ["ros/sample.yaml"]
    with pytest.raises(web.HTTPForbidden):
        asyncio.run(server._params_apply(FakeRequest({"changes": []}, "http://evil.example")))
    with pytest.raises(web.HTTPBadRequest):
        asyncio.run(server._params_apply(FakeRequest(None)))


def test_revert_export_baseline_and_pending(tmp_path):
    server = _server(tmp_path)
    applied = body(asyncio.run(server._params_apply(FakeRequest({
        "changes": [{"id": "main/speed", "value": 0.2}], "expected_sha": shas(server)}))))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == ["main/speed"]
    export = asyncio.run(server._params_export(None))
    assert export.content_type == "text/x-diff"
    assert export.headers["Content-Disposition"] == 'attachment; filename="param-tuning.patch"'
    assert export.text.startswith("--- a/config/ros/sample.yaml")
    reverted = asyncio.run(server._params_revert(FakeRequest({"entry": applied["id"], "expected_sha": shas(server)})))
    assert reverted.status == 200 and body(reverted)["reverts"] == applied["id"]
    assert body(asyncio.run(server._params_pending_clear(FakeRequest({}))))["cleared"] == ["main/speed"]
    reset = body(asyncio.run(server._params_baseline_reset(FakeRequest({}))))
    assert reset["files"] == ["ros/sample.yaml"]


def test_readback_uses_the_reader_or_reports_offline(tmp_path):
    def reader(requests):
        assert requests == {"/sample_node": ["count", "speed"]}
        return {"/sample_node": {"available": True, "values": {"speed": 0.1, "count": 4}}}

    rows = body(asyncio.run(_server(tmp_path, reader=reader)._params_readback(None)))["rows"]
    assert rows == {"main/speed": {"state": "applied", "value": 0.1}, "main/count": {"state": "pending", "value": 4}}
    offline = body(asyncio.run(_server(tmp_path / "x")._params_readback(None)))["rows"]
    assert offline["main/speed"] == {"state": "offline", "value": None}


def test_successful_bringup_restart_clears_pending(tmp_path):
    server = _server(tmp_path)
    server.config = WebServerConfig(**{**server.config.__dict__, "docker_restart_url": "http://helper",
                                       "docker_restart_service": "realman_bringup_remote"})
    asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/speed", "value": 0.2}],
                                                  "expected_sha": shas(server)})))
    replies = iter([(409, {"ok": False, "error": "busy"}), (200, {"ok": True})])

    async def fake_call(method, path, payload=None):
        return next(replies)

    server._docker_restart_call = fake_call
    asyncio.run(server._docker_restart(FakeRequest({})))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == ["main/speed"]
    asyncio.run(server._docker_restart(FakeRequest({})))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == []


def test_compose_mounts_config_ros_read_write_into_web_control():
    compose = yaml.safe_load((ROOT / "config/docker/compose.yaml").read_text())
    volumes = compose["services"]["realman_web_control"]["volumes"]
    assert "./config/ros:/opt/rm65_ws/config/ros:rw" in volumes
