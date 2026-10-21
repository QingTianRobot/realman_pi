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


class FakeSocket:
    def __init__(self, fail=False):
        self.closed = False
        self.fail = fail
        self.sent: list[dict] = []

    async def send_str(self, payload):
        if self.fail:
            raise ConnectionResetError("socket closed mid-send")
        self.sent.append(json.loads(payload))


def _pushing_server(tmp_path: Path, reads: list[dict]) -> tuple[WebControlServer, list[int]]:
    """Server whose monitor returns ``reads`` in order (the last one repeats)."""
    server = _server(tmp_path, "http://127.0.0.1:1")
    server.config = WebServerConfig(**{**server.config.__dict__, "bt_monitor_poll_period_sec": 0.001})
    calls = [0]

    async def read():
        calls[0] += 1
        return reads[min(calls[0], len(reads)) - 1]

    server._read_bt_runtime = read
    return server, calls


def _live(sequence, status="RUNNING"):
    payload = compact_runtime_snapshot(_snapshot(sequence=sequence), now_ms=10_000, stale_after_ms=5000)
    payload["nodes"][1]["status"] = status
    return payload


def test_push_sends_only_visible_changes_to_every_socket(tmp_path):
    reads = [_live(1), _live(2), _live(3), _live(4, "SUCCESS"), _live(5, "SUCCESS"), {"available": False}]

    async def scenario():
        server, calls = _pushing_server(tmp_path, reads)
        good, broken, other = FakeSocket(), FakeSocket(fail=True), FakeSocket()
        server._clients = {"a": good, "b": broken, "c": other}
        server._bt_clients_present = asyncio.Event()
        task = asyncio.create_task(server._push_bt_runtime())
        while calls[0] < len(reads) + 2:
            await asyncio.sleep(0.001)
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        return server, good, other

    server, good, other = asyncio.run(scenario())
    # The sequence changes every tick; only the node status change and the stop are new views.
    pushed = [event["runtime"] for event in good.sent]
    assert all(event["type"] == "bt_runtime" for event in good.sent)
    assert [(item["available"], item.get("sequence")) for item in pushed] == [(True, 1), (True, 4), (False, None)]
    # A socket that fails mid-send costs the others nothing and does not end the watcher.
    assert other.sent == good.sent
    assert server._bt_runtime_latest == {"available": False}


def test_push_stops_reading_without_pages_and_forgets_the_last_tree(tmp_path):
    async def scenario():
        server, calls = _pushing_server(tmp_path, [_live(1)])
        socket = FakeSocket()
        server._clients = {"a": socket}
        server._bt_clients_present = asyncio.Event()
        task = asyncio.create_task(server._push_bt_runtime())
        while not socket.sent:
            await asyncio.sleep(0.001)
        assert server._bt_runtime_latest["available"] is True
        server._clients = {}
        await asyncio.sleep(0.02)
        idle_calls = calls[0]
        await asyncio.sleep(0.02)
        assert calls[0] == idle_calls  # no monitor reads while nobody is watching
        assert server._bt_runtime_latest == {"available": False}
        # The next page gets the current tree again, even though it did not change.
        server._clients = {"b": (fresh := FakeSocket())}
        server._bt_clients_present.set()
        while not fresh.sent:
            await asyncio.sleep(0.001)
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        return fresh

    fresh = asyncio.run(scenario())
    assert fresh.sent[0]["runtime"]["available"] is True


def test_poll_period_comes_from_root_config_and_is_validated(tmp_path):
    assert 0 < load_server_config(ROOT_CONFIG).bt_monitor_poll_period_sec <= 0.1
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["behavior_tree_monitor"]["poll_period_sec"] = 0
    path = tmp_path / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match="behavior_tree_monitor.poll_period_sec"):
        load_server_config(path)
