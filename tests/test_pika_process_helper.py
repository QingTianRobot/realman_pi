"""Host-side Pika process helper behind the :8765 Pika switch (no tmux needed)."""

import importlib.util
import json
from pathlib import Path
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("pika_process_helper", ROOT / "scripts/pika_process_helper.py")
helper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(helper)

CONFIG = {
    "bind_host": "127.0.0.1", "port": 8783, "timeout_sec": 20,
    "start": ["tmux", "new-session", "-d", "-s", "pika", "~/start.sh"],
    "status": ["tmux", "has-session", "-t", "=pika"],
    "stop": ["tmux", "send-keys", "-t", "=pika", "C-c"],
    "stop_grace_sec": 1,
    "kill": ["tmux", "kill-session", "-t", "=pika"],
}


class FakeTmux:
    """Status exit code follows the fake session; send-keys stops it after `stops_after` polls."""

    def __init__(self, running=False, stops_after=0, start_exit=0, start_races=False,
                 send_keys_exit=0, kill_survives=False):
        self.running = running
        self.stops_after = stops_after
        self.start_exit = start_exit
        self.start_races = start_races  # new-session fails but someone else created the session
        self.send_keys_exit = send_keys_exit
        self.kill_survives = kill_survives
        self.calls = []
        self.block = None
        self.first_call = threading.Event()

    def __call__(self, command, timeout_sec):
        self.calls.append(list(command))
        self.first_call.set()
        if self.block is not None:
            self.block.wait(5)
        verb = command[1]
        if verb == "has-session":
            if self.running and self.stops_after == 0 and self._stop_sent():
                self.running = False
            elif self._stop_sent() and self.stops_after > 0:
                self.stops_after -= 1
            return (0 if self.running else 1), ""
        if verb == "new-session":
            if self.start_races:
                self.running = True
                return 1, "duplicate session: pika"
            if self.start_exit == 0:
                self.running = True
            return self.start_exit, "" if self.start_exit == 0 else "no server"
        if verb == "kill-session":
            if not self.kill_survives:
                self.running = False
            return 0, ""
        if verb == "send-keys":
            return self.send_keys_exit, "" if self.send_keys_exit == 0 else "can't find pane"
        return 0, ""

    def _stop_sent(self):
        return any(call[1] == "send-keys" for call in self.calls)


class FakeSleep:
    def __init__(self):
        self.total = 0.0

    def __call__(self, seconds):
        self.total += seconds


def make(tmux, sleep=None):
    return helper.PikaProcess(CONFIG, runner=tmux, sleep=sleep or FakeSleep(), home="/home/op")


class PikaProcessTest(unittest.TestCase):
    def test_repo_config_loads(self):
        config = helper.load_config(ROOT / "config/docker/pika_helper.json")
        self.assertEqual(config["port"], 8783)
        self.assertEqual(config["status"], ["tmux", "has-session", "-t", "=pika"])
        self.assertEqual(config["stop"], ["tmux", "send-keys", "-t", "=pika", "C-c"])
        self.assertEqual(config["kill"], ["tmux", "kill-session", "-t", "=pika"])

    def test_load_config_rejects_missing_and_bad_commands(self):
        for broken in ({k: v for k, v in CONFIG.items() if k != "kill"}, {**CONFIG, "start": []},
                       {**CONFIG, "stop": "tmux kill"}, {**CONFIG, "port": 0}):
            with self.assertRaises(ValueError):
                helper.validate_config(broken)

    def test_start_runs_start_with_home_expanded(self):
        tmux = FakeTmux(running=False)
        result = make(tmux).start()
        self.assertTrue(result["ok"])
        self.assertIn(["tmux", "new-session", "-d", "-s", "pika", "/home/op/start.sh"], tmux.calls)
        self.assertTrue(make(tmux).status()["running"])

    def test_start_when_running_is_success_without_starting(self):
        tmux = FakeTmux(running=True)
        self.assertTrue(make(tmux).start()["ok"])
        self.assertFalse(any(call[1] == "new-session" for call in tmux.calls))

    def test_failed_start_raises_with_output(self):
        with self.assertRaises(helper.ActionFailed) as failed:
            make(FakeTmux(start_exit=1)).start()
        self.assertIn("no server", failed.exception.output_tail)

    def test_start_that_loses_a_race_but_ends_running_is_success(self):
        tmux = FakeTmux(running=False, start_races=True)
        result = make(tmux).start()
        self.assertTrue(result["ok"])
        self.assertEqual(result["exit_code"], 0)
        self.assertIn("duplicate session: pika", result["output_tail"])

    def test_stop_sends_ctrl_c_then_returns_once_session_is_gone(self):
        tmux = FakeTmux(running=True, stops_after=0)
        self.assertTrue(make(tmux).stop()["ok"])
        self.assertFalse(any(call[1] == "kill-session" for call in tmux.calls))

    def test_stop_kills_after_grace(self):
        tmux = FakeTmux(running=True, stops_after=10_000)
        sleep = FakeSleep()
        self.assertTrue(make(tmux, sleep).stop()["ok"])
        self.assertIn(["tmux", "kill-session", "-t", "=pika"], tmux.calls)
        self.assertGreaterEqual(sleep.total, CONFIG["stop_grace_sec"])

    def test_stop_with_failed_send_keys_but_session_gone_is_success(self):
        tmux = FakeTmux(running=True, stops_after=0, send_keys_exit=1)
        self.assertTrue(make(tmux).stop()["ok"])

    def test_stop_fails_when_session_survives_kill(self):
        tmux = FakeTmux(running=True, stops_after=10_000, kill_survives=True)
        with self.assertRaises(helper.ActionFailed) as failed:
            make(tmux).stop()
        self.assertIn("pika session still running after kill", failed.exception.output_tail)

    def test_stop_when_not_running_is_success(self):
        tmux = FakeTmux(running=False)
        self.assertTrue(make(tmux).stop()["ok"])
        self.assertEqual([call[1] for call in tmux.calls], ["has-session"])

    def test_second_action_while_busy_is_refused(self):
        tmux = FakeTmux(running=False)
        tmux.block = threading.Event()
        process = make(tmux)
        results = []
        worker = threading.Thread(target=lambda: results.append(process.start()))
        worker.start()
        self.assertTrue(tmux.first_call.wait(5))
        with self.assertRaises(helper.Busy):
            process.stop()
        tmux.block.set()
        worker.join(5)
        self.assertFalse(worker.is_alive())
        self.assertEqual(len(results), 1)
        self.assertTrue(results[0]["ok"])


class HttpTest(unittest.TestCase):
    def setUp(self):
        self.tmux = FakeTmux(running=False)
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), helper.make_handler(make(self.tmux)))
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.server.server_address[1]}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()

    def call(self, method, path, body=b"{}"):
        request = Request(self.base + path, data=body if method == "POST" else None, method=method)
        try:
            with urlopen(request, timeout=5) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            return error.code, json.loads(error.read())

    def test_start_status_stop(self):
        self.assertEqual(self.call("GET", "/status")[1]["running"], False)
        status, payload = self.call("POST", "/start")
        self.assertEqual((status, payload["ok"]), (200, True))
        self.assertEqual(self.call("GET", "/status")[1]["running"], True)
        self.assertEqual(self.call("POST", "/stop")[0], 200)

    def test_body_cannot_choose_a_command(self):
        self.call("POST", "/start", json.dumps({"command": ["rm", "-rf", "/"]}).encode())
        self.assertFalse(any(call[0] == "rm" for call in self.tmux.calls))

    def test_unknown_path_is_404(self):
        self.assertEqual(self.call("POST", "/restart")[0], 404)


if __name__ == "__main__":
    unittest.main()
