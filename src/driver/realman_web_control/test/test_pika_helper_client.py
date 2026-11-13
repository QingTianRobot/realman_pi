import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from realman_web_control.pika_helper_client import call_helper


def serve(status, payload):
    class Handler(BaseHTTPRequestHandler):
        def _reply(self):
            body = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            Handler.seen.append((self.command, self.path))

        do_GET = do_POST = _reply

        def log_message(self, *args):
            pass

    Handler.seen = []
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, Handler.seen, f"http://127.0.0.1:{server.server_address[1]}"


def test_status_is_get_and_start_is_post():
    server, seen, url = serve(200, {"running": True})
    try:
        assert call_helper(url, "status", 2.0) == (True, {"running": True})
        assert call_helper(url, "start", 2.0)[0] is True
        assert seen == [("GET", "/status"), ("POST", "/start")]
    finally:
        server.shutdown()


def test_error_status_returns_payload():
    server, _, url = serve(500, {"ok": False, "error": "start failed with exit 1"})
    try:
        assert call_helper(url, "start", 2.0) == (False, {"ok": False, "error": "start failed with exit 1"})
    finally:
        server.shutdown()


def test_unreachable_helper():
    ok, payload = call_helper("http://127.0.0.1:9", "status", 0.5)
    assert ok is False and "not reachable" in payload["error"]


def test_unknown_action_is_rejected():
    with pytest.raises(ValueError):
        call_helper("http://127.0.0.1:9", "restart", 0.5)


def test_malformed_http_answer_is_a_failed_call():
    import socket
    listener = socket.socket()
    listener.bind(("127.0.0.1", 0))
    listener.listen(1)

    def answer_garbage():
        connection, _ = listener.accept()
        connection.recv(4096)
        connection.sendall(b"garbage\r\n\r\n")
        connection.close()

    threading.Thread(target=answer_garbage, daemon=True).start()
    try:
        ok, payload = call_helper(f"http://127.0.0.1:{listener.getsockname()[1]}", "start", 2.0)
    finally:
        listener.close()
    assert ok is False and payload["ok"] is False
    assert payload["error"].startswith("Pika helper call failed: BadStatusLine")


def test_any_exception_is_a_failed_call(monkeypatch):
    import realman_web_control.pika_helper_client as client

    def boom(*_args, **_kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(client, "urlopen", boom)
    assert client.call_helper("http://127.0.0.1:9", "stop", 0.5) == (
        False, {"ok": False, "error": "Pika helper call failed: RuntimeError: boom"})
