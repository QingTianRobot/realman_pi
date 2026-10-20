import asyncio
import json
from pathlib import Path

import pytest
import yaml
from aiohttp import web

from realman_web_control.bt_runtime import compact_runtime_snapshot
from realman_web_control.web_server import WebControlServer, WebServerConfig, load_server_config

ROOT_CONFIG = Path(__file__).resolve().parents[4] / "config/ros/realman_web_control.yaml"


def _snapshot(timestamp_ms=10_000, **overrides):
    document = {
        "schema_version": 2, "tree_id": "control", "sequence": 42, "timestamp_ms": timestamp_ms,
        "root_status": "RUNNING", "pending_cancellations": 0,
        "tick_stats": {"running": 1, "success": 0, "failure": 0, "total": 1},
        "events": [{"timestamp_ms": 1, "severity": "INFO", "detail": "noise"}],
        "nodes": [
            {"key": "n0", "name": "input_control", "registration_name": "ReactiveSequence",
             "kind": "Control", "path": "0", "status": "RUNNING"},
            {"key": "n1", "name": "PolicyRun", "registration_name": "PolicyRun", "kind": "Action",
             "path": "0/0", "status": "FAILURE", "failure_reason": "policy server timeout"},
        ],
    }
    document.update(overrides)
    return document


def test_compact_snapshot_keeps_tree_and_drops_event_log():
    payload = compact_runtime_snapshot(_snapshot(), now_ms=10_500, stale_after_ms=5000)
    assert payload["available"] is True
    assert payload["tree_id"] == "control"
    assert payload["root_status"] == "RUNNING"
    assert "events" not in payload and "tick_stats" not in payload
    assert payload["nodes"][1] == {
        "path": "0/0", "name": "PolicyRun", "registration_name": "PolicyRun", "kind": "Action",
        "status": "FAILURE", "failure_reason": "policy server timeout",
    }


@pytest.mark.parametrize("document", [
    None,
    [],
    _snapshot(nodes=[]),  # bt_server before a tree is loaded
    _snapshot(timestamp_ms=True),
    _snapshot(nodes=[{"name": "no path"}]),
])
def test_compact_snapshot_reads_malformed_or_empty_as_unavailable(document):
    assert compact_runtime_snapshot(document, now_ms=10_000, stale_after_ms=5000) == {"available": False}


def test_compact_snapshot_hides_a_tree_the_executor_stopped_writing():
    assert compact_runtime_snapshot(_snapshot(timestamp_ms=1000), now_ms=7000, stale_after_ms=5000) == {
        "available": False
    }


def test_unknown_status_is_shown_as_idle():
    document = _snapshot()
    document["nodes"][0]["status"] = "WEIRD"
    document["root_status"] = "WEIRD"
    payload = compact_runtime_snapshot(document, now_ms=10_000, stale_after_ms=5000)
    assert payload["nodes"][0]["status"] == "IDLE"
    assert payload["root_status"] == "IDLE"


def test_monitor_settings_come_from_root_config(tmp_path):
    config = load_server_config(ROOT_CONFIG)
    assert config.bt_monitor_url == "http://127.0.0.1:8080"
    assert config.bt_monitor_timeout_sec > 0
    assert config.bt_monitor_stale_after_sec > 0


@pytest.mark.parametrize("monitor", [
    {"url": "ftp://127.0.0.1:8080"},
    {"url": 8080},
    {"url": "http://127.0.0.1:8080", "timeout_sec": 0},
    {"url": "http://127.0.0.1:8080", "stale_after_sec": float("nan")},
    "http://127.0.0.1:8080",
])
def test_monitor_settings_are_validated(tmp_path, monitor):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["behavior_tree_monitor"] = monitor
    path = tmp_path / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match="behavior_tree_monitor"):
        load_server_config(path)


class FakeLogger:
    def error(self, _message):
        pass


def _server(tmp_path: Path, monitor_url: str) -> WebControlServer:
    config = WebServerConfig(
        bind_host="127.0.0.1", port=8765, allowed_origins=("same-origin",), max_clients=8,
        max_message_bytes=65536, discovery_period_sec=1.0, web_override_timeout_sec=5.0,
        bt_monitor_url=monitor_url, bt_monitor_timeout_sec=0.5, bt_monitor_stale_after_sec=3600.0,
    )
    return WebControlServer(
        config=config, manifest={"robots": []}, static_root=tmp_path, description_root=tmp_path,
        calibration_config_file=tmp_path / "calibration.yaml", calibration_log_root=tmp_path / "logs",
        on_command=lambda *_args: None, on_client_connected=None, logger=FakeLogger(),
    )


def test_runtime_route_proxies_the_monitor_and_reports_a_stopped_tree_as_unavailable(tmp_path):
    async def scenario():
        import time

        snapshot = _snapshot(timestamp_ms=int(time.time() * 1000))

        async def runtime(_request):
            return web.json_response(snapshot)

        app = web.Application()
        app.router.add_get("/api/runtime", runtime)
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "127.0.0.1", 0)
        await site.start()
        port = site._server.sockets[0].getsockname()[1]
        server = _server(tmp_path, f"http://127.0.0.1:{port}")
        try:
            live = json.loads((await server._bt_runtime(None)).text)
            await runner.cleanup()  # bt-start stops the monitor when the tree exits
            stopped = json.loads((await server._bt_runtime(None)).text)
        finally:
            if server._bt_session is not None:
                await server._bt_session.close()
        disabled = json.loads((await _server(tmp_path, "")._bt_runtime(None)).text)
        return live, stopped, disabled

    live, stopped, disabled = asyncio.run(scenario())
    assert live["available"] is True
    assert [node["path"] for node in live["nodes"]] == ["0", "0/0"]
    assert stopped == {"available": False}
    assert disabled == {"available": False}
