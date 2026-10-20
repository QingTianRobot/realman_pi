"""Host-side Docker restart helper behind the :8765 restart button (no Docker needed)."""

import importlib.util
import json
import tempfile
from pathlib import Path
import threading
import time
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("docker_restart_helper", ROOT / "scripts/docker_restart_helper.py")
helper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(helper)


class FakeRunner:
    def __init__(self, exit_code=0, output="Container realman_bringup_remote  Restarting\n"):
        self.calls = []
        self.release = threading.Event()
        self.exit_code = exit_code
        self.output = output

    def __call__(self, command, timeout_sec):
        self.calls.append((list(command), timeout_sec))
        self.release.wait(5)
        return self.exit_code, self.output


CONFIG = {"bind_host": "127.0.0.1", "port": 8782, "services": ["realman_bringup_remote"], "timeout_sec": 120}


class RestarterTest(unittest.TestCase):
    def test_repo_config_loads(self):
        config = helper.load_config(ROOT / "config/docker/restart_helper.json")
        self.assertEqual(config["services"], ["realman_bringup_remote"])

    def test_restart_runs_compose_once_and_reports_the_result(self):
        runner = FakeRunner()
        restarter = helper.Restarter(CONFIG, runner=runner, compose_file=Path("/repo/docker-compose.yml"))
        started = restarter.restart("realman_bringup_remote")
        self.assertTrue(started["ok"])
        self.assertTrue(restarter.status()["restarting"])
        with self.assertRaises(helper.RestartRefused) as busy:
            restarter.restart("realman_bringup_remote")
        self.assertEqual(busy.exception.status, 409)
        runner.release.set()
        restarter.wait(5)
        status = restarter.status()
        self.assertFalse(status["restarting"])
        self.assertEqual(status["exit_code"], 0)
        self.assertEqual(status["output_tail"], ["Container realman_bringup_remote  Restarting"])
        self.assertEqual(runner.calls, [(
            ["docker", "compose", "-f", "/repo/docker-compose.yml", "restart", "realman_bringup_remote"], 120.0,
        )])

    def test_only_whitelisted_services_are_accepted(self):
        runner = FakeRunner()
        restarter = helper.Restarter(CONFIG, runner=runner)
        for service in ("realman_web_control", "realman_bringup_remote; rm -rf /", None, ""):
            with self.assertRaises(helper.RestartRefused) as refused:
                restarter.restart(service)
            self.assertEqual(refused.exception.status, 400)
        self.assertEqual(runner.calls, [])

    def test_config_is_validated(self):
        for change in ({"port": 0}, {"services": []}, {"services": [""]}, {"timeout_sec": 0}):
            with self.subTest(change=change), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "helper.json"
                path.write_text(json.dumps({**CONFIG, **change}))
                with self.assertRaises(ValueError):
                    helper.load_config(path)

    def test_main_refuses_a_non_localhost_bind(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "helper.json"
            path.write_text(json.dumps({**CONFIG, "bind_host": "0.0.0.0"}))
            with self.assertRaises(SystemExit):
                helper.main(["--config", str(path)])


class HttpTest(unittest.TestCase):
    def test_http_status_and_restart(self):
        runner = FakeRunner(exit_code=1, output="no such service\n")
        runner.release.set()
        restarter = helper.Restarter(CONFIG, runner=runner)
        server = ThreadingHTTPServer(("127.0.0.1", 0), helper.make_handler(restarter))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}"
        try:
            def post(body):
                request = Request(f"{base}/restart", data=json.dumps(body).encode(), method="POST",
                                  headers={"Content-Type": "application/json"})
                try:
                    with urlopen(request, timeout=5) as response:
                        return response.status, json.loads(response.read())
                except HTTPError as error:
                    return error.code, json.loads(error.read())

            self.assertEqual(post({"service": "other"})[0], 400)
            status, payload = post({"service": "realman_bringup_remote"})
            self.assertEqual((status, payload["ok"]), (200, True))
            restarter.wait(5)
            deadline = time.time() + 5
            while time.time() < deadline:
                with urlopen(f"{base}/status", timeout=5) as response:
                    current = json.loads(response.read())
                if "exit_code" in current:
                    break
            self.assertEqual(current["exit_code"], 1)
            self.assertEqual(current["output_tail"], ["no such service"])
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
