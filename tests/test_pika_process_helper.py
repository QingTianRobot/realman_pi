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
    "stop": ["tmux", "send-keys", "-t", "=pika:", "C-c"],
    "stop_grace_sec": 1,
    "kill": ["tmux", "kill-session", "-t", "=pika"],
}


class FakeTmux:
    """Status exit code follows the fake session; send-keys stops it after `stops_after` polls."""

    def __init__(self, running=False, stops_after=0, start_exit=0, start_races=False,
                 send_keys_exit=0, kill_survives=False, status_exit=None):
        self.running = running
        self.status_exit = status_exit  # e.g. 124 (timeout) or 127 (no tmux): not an answer about the session
        self.stops_after = stops_after
        self.start_exit = start_exit
        self.start_races = start_races  # new-session fails but someone else created the session
        self.send_keys_exit = send_keys_exit
        self.kill_survives = kill_survives
        self.calls = []
        self.timeouts = []
        self.block = None
        self.first_call = threading.Event()

    def __call__(self, command, timeout_sec):
        self.calls.append(list(command))
        self.timeouts.append((command[1], timeout_sec))
        self.first_call.set()
        if self.block is not None:
            self.block.wait(5)
        verb = command[1]
        if verb == "has-session":
            if self.status_exit is not None:
                return self.status_exit, "error connecting to /tmp/tmux-1000/default"
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
        self.assertEqual(config["stop"], ["tmux", "send-keys", "-t", "=pika:", "C-c"])
        self.assertEqual(config["kill"], ["tmux", "kill-session", "-t", "=pika"])
        # send-keys needs a pane: tmux 3.2a rejects "=pika" ("can't find pane"), so Ctrl-C was
        # never sent and every stop fell through to kill-session, orphaning the official stack.
        self.assertTrue(config["stop"][3].endswith(":"))

    def test_load_config_rejects_missing_and_bad_commands(self):
        for broken in ({k: v for k, v in CONFIG.items() if k != "kill"}, {**CONFIG, "start": []},
                       {**CONFIG, "stop": "tmux kill"}, {**CONFIG, "port": 0},
                       {**CONFIG, "status_timeout_sec": 0}):
            with self.assertRaises(ValueError):
                helper.validate_config(broken)

    def test_repo_config_limits_the_status_probe(self):
        config = helper.load_config(ROOT / "config/docker/pika_helper.json")
        self.assertEqual(config["status_timeout_sec"], 5)
        # Worst start (status + start + status) stays below web control's helper_timeout_sec 40.
        self.assertLess(2 * config["status_timeout_sec"] + config["timeout_sec"], 40)

    def test_status_probe_uses_its_own_timeout(self):
        tmux = FakeTmux(running=False)
        process = helper.PikaProcess({**CONFIG, "status_timeout_sec": 5}, runner=tmux, sleep=FakeSleep(), home="/h")
        process.start()
        self.assertEqual({verb: timeout for verb, timeout in tmux.timeouts},
                         {"has-session": 5.0, "new-session": 20.0})

    def test_status_timeout_defaults_to_five_seconds(self):
        tmux = FakeTmux(running=False)
        make(tmux).status()
        self.assertEqual(tmux.timeouts, [("has-session", 5.0)])

    def test_status_probe_error_is_not_running_with_error(self):
        for code in (124, 127, 2):
            status = make(FakeTmux(running=True, status_exit=code)).status()
            self.assertFalse(status["running"])
            self.assertIn(f"exit {code}", status["error"])

    def test_start_and_stop_fail_when_the_status_probe_errors(self):
        for action in ("start", "stop"):
            tmux = FakeTmux(running=True, status_exit=127)
            process = make(tmux)
            with self.assertRaises(helper.ActionFailed) as failed:
                getattr(process, action)()
            self.assertIn("exit 127", str(failed.exception))
            self.assertIn("error connecting to /tmp/tmux-1000/default", failed.exception.output_tail)
            self.assertFalse(any(call[1] in ("new-session", "send-keys", "kill-session") for call in tmux.calls))
            self.assertFalse(process.status()["busy"])

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


LOCATOR = ["/home/op/pika_ros/install/pika_locator/lib/pika_locator/pika_double_locator_node", "--ros-args"]
OFFICIAL_LAUNCH = ["/usr/bin/python3", "/opt/ros/humble/bin/ros2", "launch", "sensor_tools",
                   "open_multi_sensor_with_teleop.launch.py", "l_serial_port:=/dev/tty_pika_left"]
LEFTOVER_CONFIG = {**CONFIG, "leftover_processes": ["open_multi_sensor_with_teleop.launch.py", "pika_double_locator_node"],
                   "leftover_grace_sec": 2}


class FakeProcs:
    """Process table; a group exits on the first signal in its `dies_on` set."""

    def __init__(self, processes=(), dies_on=None):
        self.processes = list(processes)
        self.dies_on = dies_on or {}
        self.sent = []

    def scan(self):
        return list(self.processes)

    def kill_group(self, pgid, signal_number):
        self.sent.append((pgid, signal_number))
        if signal_number in self.dies_on.get(pgid, {helper.signal.SIGINT}):
            self.processes = [p for p in self.processes if p[1] != pgid]


def make_leftover(tmux, procs, sleep=None, own_pgid=500):
    return helper.PikaProcess(LEFTOVER_CONFIG, runner=tmux, sleep=sleep or FakeSleep(), home="/home/op",
                              scan=procs.scan, kill_group=procs.kill_group, own_pgid=own_pgid)


class LeftoverTest(unittest.TestCase):
    def test_repo_config_outlasts_the_official_supervisor(self):
        config = helper.load_config(ROOT / "config/docker/pika_helper.json")
        # pika_teleop's official_stack_supervisor waits 10 s after SIGINT and 3 s after SIGTERM;
        # a kill-session before that kills it mid-cleanup and orphans the official group.
        self.assertGreater(config["stop_grace_sec"], 13)
        for name in ("pika_double_locator_node", "serial_gripper_imu", "open_multi_sensor_with_teleop.launch.py"):
            self.assertIn(name, config["leftover_processes"])
        # Worst stop (grace + leftover INT/TERM/KILL + status probes) stays below helper_timeout_sec 40.
        self.assertLess(config["stop_grace_sec"] + config["leftover_grace_sec"] + 2 * helper.LEFTOVER_TERM_WAIT_SEC
                        + 2 * config["status_timeout_sec"], 40)
        # Worst start clears leftovers first.
        self.assertLess(2 * config["status_timeout_sec"] + config["timeout_sec"] + config["leftover_grace_sec"]
                        + 2 * helper.LEFTOVER_TERM_WAIT_SEC, 40)

    def test_leftover_names_must_be_plain_names(self):
        for broken in ({**CONFIG, "leftover_processes": "pika"}, {**CONFIG, "leftover_processes": ["/bin/x"]},
                       {**CONFIG, "leftover_processes": [""]}, {**CONFIG, "leftover_grace_sec": 0}):
            with self.assertRaises(ValueError):
                helper.validate_config(broken)

    def test_is_leftover_matches_executables_and_interpreted_launches_only(self):
        names = frozenset(LEFTOVER_CONFIG["leftover_processes"])
        self.assertTrue(helper.is_leftover(LOCATOR, names))
        self.assertTrue(helper.is_leftover(OFFICIAL_LAUNCH, names))
        self.assertFalse(helper.is_leftover(["strings", LOCATOR[0]], names))
        self.assertFalse(helper.is_leftover(["bash", "-c", "pgrep -f pika_double_locator_node"], names))
        self.assertFalse(helper.is_leftover(["vim", "open_multi_sensor_with_teleop.launch.py"], names))
        self.assertFalse(helper.is_leftover(LOCATOR, frozenset()))

    def test_status_counts_leftovers_without_a_session_as_running(self):
        procs = FakeProcs([(10, 10, OFFICIAL_LAUNCH), (11, 10, LOCATOR)])
        status = make_leftover(FakeTmux(running=False), procs).status()
        self.assertEqual((status["running"], status["session"], status["leftover_groups"]), (True, False, [10]))
        self.assertEqual(procs.sent, [])

    def test_own_group_and_init_are_never_leftovers(self):
        procs = FakeProcs([(10, 500, LOCATOR), (11, 1, LOCATOR), (12, 0, LOCATOR)])
        self.assertFalse(make_leftover(FakeTmux(running=False), procs).status()["running"])

    def test_stop_without_session_interrupts_leftover_groups(self):
        procs = FakeProcs([(10, 10, OFFICIAL_LAUNCH), (11, 10, LOCATOR), (20, 20, ["/usr/bin/bash"])])
        tmux = FakeTmux(running=False)
        process = make_leftover(tmux, procs)
        result = process.stop()
        self.assertTrue(result["ok"])
        self.assertEqual(procs.sent, [(10, helper.signal.SIGINT)])
        self.assertIn("SIGINT to leftover Pika process groups 10", result["output_tail"])
        self.assertFalse(any(call[1] in ("send-keys", "kill-session") for call in tmux.calls))
        self.assertFalse(process.status()["running"])

    def test_stop_escalates_to_sigterm_then_sigkill(self):
        procs = FakeProcs([(11, 10, LOCATOR)], dies_on={10: {helper.signal.SIGKILL}})
        sleep = FakeSleep()
        self.assertTrue(make_leftover(FakeTmux(running=False), procs, sleep).stop()["ok"])
        self.assertEqual([sig for _group, sig in procs.sent],
                         [helper.signal.SIGINT, helper.signal.SIGTERM, helper.signal.SIGKILL])
        self.assertGreaterEqual(sleep.total, LEFTOVER_CONFIG["leftover_grace_sec"])

    def test_stop_fails_when_leftovers_survive_sigkill(self):
        procs = FakeProcs([(11, 10, LOCATOR)], dies_on={10: set()})
        with self.assertRaises(helper.ActionFailed) as failed:
            make_leftover(FakeTmux(running=False), procs).stop()
        self.assertIn("leftover Pika processes still running: groups 10", failed.exception.output_tail)

    def test_stop_waits_for_the_session_to_clean_its_own_group(self):
        procs = FakeProcs([(11, 10, LOCATOR)])
        tmux = FakeTmux(running=True, stops_after=0)
        polls = []

        def sleep(seconds):
            polls.append(seconds)
            if len(polls) == 2:  # within stop_grace_sec 1 (two 0.5 s polls)
                procs.processes = []  # the supervisor finished its SIGINT cleanup

        result = make_leftover(tmux, procs, sleep).stop()
        self.assertTrue(result["ok"])
        self.assertEqual(procs.sent, [])
        self.assertFalse(any(call[1] == "kill-session" for call in tmux.calls))

    def test_stop_cleans_leftovers_after_kill_session(self):
        procs = FakeProcs([(11, 10, LOCATOR)])
        tmux = FakeTmux(running=True, stops_after=10_000)
        result = make_leftover(tmux, procs).stop()
        self.assertTrue(result["ok"])
        self.assertIn(["tmux", "kill-session", "-t", "=pika"], tmux.calls)
        self.assertEqual(procs.sent, [(10, helper.signal.SIGINT)])

    def test_start_clears_leftovers_before_starting(self):
        procs = FakeProcs([(11, 10, LOCATOR)])
        tmux = FakeTmux(running=False)
        result = make_leftover(tmux, procs).start()
        self.assertTrue(result["ok"])
        self.assertEqual(procs.sent, [(10, helper.signal.SIGINT)])
        self.assertIn(["tmux", "new-session", "-d", "-s", "pika", "/home/op/start.sh"], tmux.calls)

    def test_start_refuses_when_leftovers_survive(self):
        procs = FakeProcs([(11, 10, LOCATOR)], dies_on={10: set()})
        tmux = FakeTmux(running=False)
        with self.assertRaises(helper.ActionFailed):
            make_leftover(tmux, procs).start()
        self.assertFalse(any(call[1] == "new-session" for call in tmux.calls))

    def test_scan_processes_reads_proc(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            proc = Path(tmp)
            (proc / "self").mkdir()
            (proc / "42").mkdir()
            (proc / "42" / "cmdline").write_bytes(b"/usr/bin/python3\0/opt/ros/humble/bin/ros2\0launch\0")
            (proc / "42" / "stat").write_text("42 (ros2 (launch)) S 1 4242 4242 0 -1", encoding="utf-8")
            (proc / "43").mkdir()  # exited between listing and reading
            self.assertEqual(helper.scan_processes(proc),
                             [(42, 4242, ["/usr/bin/python3", "/opt/ros/humble/bin/ros2", "launch"])])


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
