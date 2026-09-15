"""Exercise the production server routes against an isolated snapshot workspace."""

import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SERVER = sys.argv.pop(1)


class RuntimeHttpTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="bt-runtime-http-")
        self.addCleanup(self.directory.cleanup)
        self.workspace = Path(self.directory.name)
        self.snapshot = self.workspace / "executor.json"
        (self.workspace / "demo.xml").write_text(
            '<root main_tree_to_execute="MainTree">'
            '<BehaviorTree ID="MainTree"><AlwaysSuccess/>'
            '</BehaviorTree></root>'
        )
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        self.url = f"http://127.0.0.1:{port}"
        self.process = subprocess.Popen(
            [SERVER, "127.0.0.1", str(port)],
            env={**os.environ, "BT_READ_ONLY": "true",
                 "BT_TREE_WORKSPACE": str(self.workspace),
                 "BT_RUNTIME_SNAPSHOT": str(self.snapshot), "BT_EDITOR_DIST": ""},
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.addCleanup(self.stop_server)
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            try:
                self.request("/api/health")
                break
            except (URLError, ConnectionError):
                if self.process.poll() is not None:
                    self.fail("server exited before listening")
                time.sleep(0.02)
        else:
            self.fail("server did not start within 10 seconds")

    def stop_server(self):
        self.process.terminate()
        try:
            self.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait()

    def request(self, path, body=None):
        request = Request(self.url + path, data=body,
                          headers={"Content-Type": "application/json"})
        try:
            response = urlopen(request, timeout=2)
        except HTTPError as error:
            response = error
        with response:
            data = response.read()
            return response.status, response.headers.get_content_type(), data

    def test_runtime_reads_current_snapshot_without_writing(self):
        status, content_type, body = self.request("/api/runtime")
        self.assertEqual(status, 200)
        self.assertEqual(content_type, "application/json")
        self.assertEqual(json.loads(body)["state"], "IDLE")
        self.assertFalse(self.snapshot.exists())
        for sequence in (1, 2):
            expected = {"root_status": "RUNNING", "sequence": sequence, "nodes": []}
            pending = self.workspace / "pending.json"
            pending.write_text(json.dumps(expected))
            pending.replace(self.snapshot)
            status, _, body = self.request("/api/runtime")
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body), expected)
        self.snapshot.write_text("{bad json")
        status, content_type, body = self.request("/api/runtime")
        self.assertEqual(status, 503)
        self.assertEqual(content_type, "application/json")
        self.assertFalse(json.loads(body)["ok"])

    def test_mutations_rejected_and_read_routes_remain_available(self):
        original_xml = (self.workspace / "demo.xml").read_bytes()
        for action in ("load", "validate", "format", "tick", "run", "save"):
            with self.subTest(action=action):
                status, content_type, body = self.request(
                    "/api/tree/" + action,
                    b'{"name":"demo.xml","xml":"overwrite attempt"}',
                )
                self.assertEqual(status, 405)
                self.assertEqual(content_type, "application/json")
                self.assertEqual(json.loads(body), {
                    "ok": False, "error": "read-only runtime monitor"})
        for path in ("/api/health", "/api/trees", "/api/tree/open?name=demo.xml"):
            with self.subTest(path=path):
                self.assertEqual(self.request(path)[0], 200)
        # A read-only monitor has no server-owned loaded tree; structure still
        # serves its existing JSON error contract instead of a mutation guard.
        status, content_type, _ = self.request("/api/tree/structure")
        self.assertEqual(status, 404)
        self.assertEqual(content_type, "application/json")
        self.assertEqual((self.workspace / "demo.xml").read_bytes(), original_xml)


if __name__ == "__main__":
    unittest.main()
