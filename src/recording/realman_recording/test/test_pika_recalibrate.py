"""Guard and helper client behind the :8770 Pika 重标定 button (no ROS needed)."""
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from realman_recording.pika_recalibrate import BUSY_RECORDING_STATES, call_helper, recalibrate, validate_helper_url

IDLE_PIKA = {"sides": {"l": {"command_active": False}, "r": {"command_active": False}}}


class _Calls:
    def __init__(self, answer):
        self.answer = answer
        self.calls = []

    def __call__(self, url, action, timeout):
        self.calls.append((url, action, timeout))
        return self.answer


@pytest.mark.parametrize("state", sorted(BUSY_RECORDING_STATES))
def test_busy_recorder_is_refused_without_calling_the_helper(state):
    calls = _Calls((200, {"ok": True}))
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, state, IDLE_PIKA, call=calls)
    assert (status, body["error"]) == (409, "录制进行中，不能重标定")
    assert calls.calls == []


def test_active_pika_command_is_refused():
    calls = _Calls((200, {"ok": True}))
    pika = {"sides": {"l": {"command_active": True}, "r": {"command_active": False}}}
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, pika, call=calls)
    assert (status, body["error"]) == (409, "Pika 速度指令进行中（l），不能重标定")
    assert calls.calls == []


@pytest.mark.parametrize("state", [0, 6, 9, "IDLE", None])
def test_idle_states_call_the_helper(state):
    calls = _Calls((200, {"ok": True, "backup": "/h/config.json.bak-x"}))
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, state, IDLE_PIKA, call=calls)
    assert (status, body["backup"]) == (200, "/h/config.json.bak-x")
    assert calls.calls == [("http://127.0.0.1:8783", "recalibrate", 90.0)]


def test_missing_snapshot_is_not_active():
    status, _body = recalibrate("http://127.0.0.1:8783", 90.0, 0, None, call=_Calls((200, {"ok": True})))
    assert status == 200


@pytest.mark.parametrize("answer,expected", [
    ((409, {"ok": False, "error": "start is already running"}), (409, "start is already running")),
    ((500, {"ok": False, "error": "recalibrate failed with exit 1", "output_tail": ["x"]}),
     (502, "recalibrate failed with exit 1")),
    ((0, {"ok": False, "error": "Pika helper is not reachable"}), (502, "Pika helper is not reachable")),
    ((200, {"ok": False}), (502, "Pika helper answered HTTP 200")),
])
def test_helper_failures_are_mapped(answer, expected):
    status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, IDLE_PIKA, call=_Calls(answer))
    assert (status, body["error"]) == expected
    assert body["ok"] is False


def test_output_tail_is_passed_through():
    answer = (500, {"ok": False, "error": "e", "output_tail": ["a", "b"]})
    _status, body = recalibrate("http://127.0.0.1:8783", 90.0, 0, IDLE_PIKA, call=_Calls(answer))
    assert body["output_tail"] == ["a", "b"]


@pytest.mark.parametrize("value,expected", [
    ("", ""), ("  ", ""), ("http://127.0.0.1:8783/", "http://127.0.0.1:8783"),
    ("http://localhost:8783", "http://localhost:8783"), ("http://[::1]:8783", "http://[::1]:8783"),
])
def test_valid_helper_urls(value, expected):
    assert validate_helper_url(value) == expected


@pytest.mark.parametrize("value", ["https://127.0.0.1:8783", "http://192.168.5.49:8783", "ftp://localhost", "127.0.0.1:8783"])
def test_invalid_helper_urls(value):
    with pytest.raises(ValueError):
        validate_helper_url(value)


def _serve(status, payload):
    class Handler(BaseHTTPRequestHandler):
        def _send(self):
            body = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        do_GET = do_POST = _send

        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def test_call_helper_returns_status_and_json():
    server, url = _serve(200, {"ok": True, "action": "recalibrate"})
    try:
        assert call_helper(url, "recalibrate", 2.0) == (200, {"ok": True, "action": "recalibrate"})
    finally:
        server.shutdown()


def test_call_helper_passes_http_errors_through():
    server, url = _serve(409, {"ok": False, "error": "busy"})
    try:
        assert call_helper(url, "recalibrate", 2.0) == (409, {"ok": False, "error": "busy"})
    finally:
        server.shutdown()


def test_call_helper_unreachable():
    status, body = call_helper("http://127.0.0.1:9", "status", 0.5)
    assert status == 0 and body["error"] == "Pika helper is not reachable"


def test_call_helper_rejects_unknown_action():
    with pytest.raises(ValueError):
        call_helper("http://127.0.0.1:8783", "start", 1.0)
