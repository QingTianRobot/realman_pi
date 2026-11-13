# :8765 Pika 速度控制开关 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One button on :8765 starts the Pika teleop stack on the host and switches the control tree to `pikavelocity`, and turns both off again.

**Architecture:** A localhost-only host helper (`scripts/pika_process_helper.py`) runs fixed tmux commands from `config/docker/pika_helper.json`. Inside `realman_web_control`, a ROS-neutral state machine (`pika_switch.py`) sequences helper start → Pika input freshness → input-mode selection (via the existing `InputModeBridge`), and the reverse for off. `web_control_node.py` wires it to ROS topics, the helper (HTTP via `pika_helper_client.py`) and the WebSocket; the page shows one toggle in the 输入模式 card.

**Tech Stack:** Python 3.10 stdlib (helper), rclpy + aiohttp (web control), TypeScript + Vite (page), pytest/unittest, Playwright.

Spec: `docs/superpowers/specs/2026-11-13-web-pika-switch-design.md`.

## Global Constraints

- Work in worktree `/Users/miakho/Organizations/realman_pi-pika-switch`, branch `feat/web-pika-switch` (from `origin/main` 5eacb409). Never touch the main checkout `/Users/miakho/Organizations/realman_pi` (it has unrelated WIP).
- All config under repo-root `config/`; helper config `config/docker/pika_helper.json`, web config block `pika_switch:` in `config/ros/realman_web_control.yaml`.
- Helper: standard library only, binds `127.0.0.1` only, port `8783`, one operation at a time (409 when busy), commands never taken from the HTTP request.
- Mode ids: on = `pikavelocity`, off = `none`. Topics: `/pika/l/cartesian_velocity`, `/pika/r/cartesian_velocity` (`geometry_msgs/TwistStamped`).
- Pika input age uses the local monotonic clock at receipt, never message stamps.
- Page copy is Chinese: 未启动 / 启动中 / 等待 Pika 数据 / 切换模式 / 运行中 / 关闭中 / 失败. Button: `启动 Pika` / `关闭 Pika`.
- No ROS on the Mac: tests that import rclpy are not run locally. Pure modules (`pika_switch.py`, `pika_helper_client.py`, `protocol.py`, `web_server.py` config) must not import rclpy.
- Commits: Conventional Commit, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Local test commands (from the worktree root):
  - web control: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/<file> -p no:cacheprovider`
  - helper: `PYTHONPATH=. python3 -m pytest -q tests/test_pika_process_helper.py -p no:cacheprovider`
  - page: `cd website && npm ci` (once), then `npm run build:web-control` and `npx playwright test --config ../config/web-control/playwright.config.mjs -g "Pika switch"`

## File Structure

| File | Responsibility |
|---|---|
| `scripts/pika_process_helper.py` (new) | Host HTTP helper: `/status`, `/start`, `/stop` running configured argv |
| `config/docker/pika_helper.json` (new) | SJDrealman tmux commands, port, timeouts |
| `config/docker/realman-pika-helper.service` (new) | systemd **user** unit template |
| `rm65` (modify) | `./rm65 pika-helper install\|uninstall\|status\|run` |
| `tests/test_pika_process_helper.py` (new) | helper unit tests |
| `.github/workflows/ci.yml` (modify) | run the helper tests |
| `src/driver/realman_web_control/realman_web_control/protocol.py` (modify) | parse `pika_switch` |
| `src/driver/realman_web_control/realman_web_control/web_server.py` (modify) | load `pika_switch:` config |
| `config/ros/realman_web_control.yaml` (modify) | `pika_switch:` block |
| `src/driver/realman_web_control/realman_web_control/pika_switch.py` (new) | ROS-neutral state machine |
| `src/driver/realman_web_control/realman_web_control/pika_helper_client.py` (new) | blocking JSON HTTP call to the helper |
| `src/driver/realman_web_control/realman_web_control/input_mode_bridge.py` (modify) | read-only accessors `snapshot`, `is_selectable()` |
| `src/driver/realman_web_control/realman_web_control/web_control_node.py` (modify) | wiring |
| `src/driver/realman_web_control/web/src/main.ts`, `style.css` (modify) | toggle UI |
| `src/driver/realman_web_control/realman_web_control/static/**` (rebuilt) | built page |
| `website/tests/web-control/web-control.spec.ts` (modify) | Playwright |
| `website/docs/development/realman-web-control.md`, `startup-entries.md` (modify) | docs |

---

### Task 1: Host helper

**Files:**
- Create: `scripts/pika_process_helper.py`, `config/docker/pika_helper.json`, `config/docker/realman-pika-helper.service`, `tests/test_pika_process_helper.py`
- Modify: `rm65` (add `pika_helper()` next to `restart_helper()` ~line 184, dispatch next to `restart-helper)` ~line 241, usage text), `.github/workflows/ci.yml` (add `.:tests/test_pika_process_helper.py \` after `.:tests/test_docker_restart_helper.py \`)

**Interfaces:**
- Produces HTTP API on `127.0.0.1:8783`:
  - `GET /status` → 200 `{"running": bool, "busy": bool, "last": {"action", "started_at_ms", "finished_at_ms"?, "exit_code"?, "output_tail"?}}`
  - `POST /start`, `POST /stop` (body ignored) → 200 `{"ok": true, "action": ..., "exit_code": 0, "output_tail": [...]}` when the action finished with exit 0; 500 `{"ok": false, "error": "...", "output_tail": [...]}` on failure; 409 `{"ok": false, "error": "<action> is already running"}` when busy. Calls are synchronous (the action completes before the reply).

- [ ] **Step 1: Write the config**

`config/docker/pika_helper.json`:

```json
{
  "bind_host": "127.0.0.1",
  "port": 8783,
  "timeout_sec": 20,
  "start": ["tmux", "new-session", "-d", "-s", "pika", "~/pika_teleop_ws/start_pika_bag.sh"],
  "status": ["tmux", "has-session", "-t", "=pika"],
  "stop": ["tmux", "send-keys", "-t", "=pika", "C-c"],
  "stop_grace_sec": 8,
  "kill": ["tmux", "kill-session", "-t", "=pika"]
}
```

- [ ] **Step 2: Write the failing tests**

`tests/test_pika_process_helper.py`:

```python
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `PYTHONPATH=. python3 -m pytest -q tests/test_pika_process_helper.py -p no:cacheprovider`
Expected: FAIL (`FileNotFoundError` / no module `scripts/pika_process_helper.py`).

- [ ] **Step 4: Implement the helper**

`scripts/pika_process_helper.py`:

```python
#!/usr/bin/env python3
"""Start and stop the Pika teleop stack for the :8765 Pika switch.

Runs on the robot host as the desktop user (systemd --user), because the Pika
stack is a native install that needs the user's tmux server, USB serial ports
and DISPLAY. Listens on localhost only; realman_web_control (network_mode: host)
calls it. Every command is a fixed argv from config/docker/pika_helper.json; the
HTTP request never carries a command. Only one action runs at a time.

Standard library only so it runs on the host's system Python.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable, Sequence

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "docker" / "pika_helper.json"
OUTPUT_TAIL_LINES = 12
COMMAND_KEYS = ("start", "status", "stop", "kill")
STOP_POLL_SEC = 0.5

Runner = Callable[[Sequence[str], float], tuple[int, str]]


class Busy(Exception):
    pass


class ActionFailed(Exception):
    def __init__(self, message: str, output_tail: list[str]) -> None:
        super().__init__(message)
        self.output_tail = output_tail


def validate_config(document: Any) -> dict[str, Any]:
    if not isinstance(document, dict):
        raise ValueError("pika helper config must be a JSON object")
    missing = [key for key in ("bind_host", "port", "timeout_sec", "stop_grace_sec", *COMMAND_KEYS) if key not in document]
    if missing:
        raise ValueError(f"pika helper config is missing {', '.join(missing)}")
    port = document["port"]
    if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ValueError("port must be from 1 through 65535")
    for key in ("timeout_sec", "stop_grace_sec"):
        value = document[key]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{key} must be positive")
    for key in COMMAND_KEYS:
        command = document[key]
        if not isinstance(command, list) or not command or not all(isinstance(part, str) and part for part in command):
            raise ValueError(f"{key} must be a non-empty argv list of strings")
    return document


def load_config(path: str | Path) -> dict[str, Any]:
    return validate_config(json.loads(Path(path).read_text(encoding="utf-8")))


def run_command(command: Sequence[str], timeout_sec: float) -> tuple[int, str]:
    try:
        completed = subprocess.run(  # noqa: S603 - fixed argv from the helper config
            list(command), stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT, timeout=timeout_sec, check=False,
        )
    except subprocess.TimeoutExpired as error:
        output = error.output.decode("utf-8", "replace") if isinstance(error.output, bytes) else ""
        return 124, f"{output}\ntimed out after {timeout_sec:g} s"
    except OSError as error:
        return 127, str(error)
    return completed.returncode, completed.stdout.decode("utf-8", "replace")


def _tail(output: str) -> list[str]:
    return [line for line in output.splitlines() if line.strip()][-OUTPUT_TAIL_LINES:]


class PikaProcess:
    def __init__(self, config: dict[str, Any], runner: Runner = run_command,
                 sleep: Callable[[float], None] = time.sleep, home: str | None = None) -> None:
        home = home if home is not None else os.path.expanduser("~")
        # Only a leading "~/" is expanded; nothing else in the argv is interpreted.
        self.commands = {
            key: [home + part[1:] if part.startswith("~/") else part for part in config[key]]
            for key in COMMAND_KEYS
        }
        self.timeout_sec = float(config["timeout_sec"])
        self.stop_grace_sec = float(config["stop_grace_sec"])
        self._runner = runner
        self._sleep = sleep
        self._lock = threading.Lock()
        self._busy: str | None = None
        self._last: dict[str, Any] = {}

    def _run(self, key: str) -> tuple[int, str]:
        return self._runner(self.commands[key], self.timeout_sec)

    def _running(self) -> bool:
        return self._run("status")[0] == 0

    def _begin(self, action: str) -> None:
        with self._lock:
            if self._busy is not None:
                raise Busy(f"{self._busy} is already running")
            self._busy = action
            self._last = {"action": action, "started_at_ms": int(time.time() * 1000)}

    def _finish(self, exit_code: int, output: str) -> dict[str, Any]:
        with self._lock:
            self._busy = None
            self._last.update({"finished_at_ms": int(time.time() * 1000), "exit_code": exit_code,
                               "output_tail": _tail(output)})
            result = dict(self._last)
        print(f"[pika_helper] {result['action']} -> exit {exit_code}", flush=True)
        if exit_code != 0:
            raise ActionFailed(f"{result['action']} failed with exit {exit_code}", result["output_tail"])
        return {"ok": True, **result}

    def start(self) -> dict[str, Any]:
        self._begin("start")
        try:
            if self._running():
                return self._finish(0, "already running")
            exit_code, output = self._run("start")
            # Judge by the end state: a lost race ("duplicate session") still leaves Pika running.
            if exit_code != 0 and self._running():
                exit_code = 0
        except BaseException:
            self._finish_quietly()
            raise
        return self._finish(exit_code, output)

    def stop(self) -> dict[str, Any]:
        self._begin("stop")
        try:
            if not self._running():
                return self._finish(0, "not running")
            exit_code, output = self._run("stop")
            waited = 0.0
            while self._running() and waited < self.stop_grace_sec:
                self._sleep(STOP_POLL_SEC)
                waited += STOP_POLL_SEC
            if self._running():
                exit_code, output = self._run("kill")
                output = f"{output}\nkilled after {self.stop_grace_sec:g} s"
            # Judge by the end state, not by the last command's exit code.
            if self._running():
                exit_code = exit_code or 1
                output = f"{output}\npika session still running after kill"
            else:
                exit_code = 0
        except BaseException:
            self._finish_quietly()
            raise
        return self._finish(exit_code, output)

    def _finish_quietly(self) -> None:
        with self._lock:
            self._busy = None

    def status(self) -> dict[str, Any]:
        with self._lock:
            busy = self._busy is not None
            last = dict(self._last)
        # A status probe during an action is fine: tmux has-session is read-only.
        return {"running": self._running(), "busy": busy, "last": last}


def make_handler(process: PikaProcess) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        def _reply(self, status: int, payload: dict[str, Any]) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:  # noqa: N802 - http.server API
            if self.path == "/status":
                self._reply(200, process.status())
            elif self.path == "/health":
                self._reply(200, {"ok": True})
            else:
                self._reply(404, {"ok": False, "error": "not found"})

        def do_POST(self) -> None:  # noqa: N802 - http.server API
            actions = {"/start": process.start, "/stop": process.stop}
            action = actions.get(self.path)
            if action is None:
                self._reply(404, {"ok": False, "error": "not found"})
                return
            # The body is drained and ignored: the request cannot choose a command.
            self.rfile.read(min(int(self.headers.get("Content-Length", "0") or 0), 4096))
            try:
                self._reply(200, action())
            except Busy as error:
                self._reply(409, {"ok": False, "error": str(error)})
            except ActionFailed as error:
                self._reply(500, {"ok": False, "error": str(error), "output_tail": error.output_tail})

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - http.server API
            sys.stderr.write(f"[pika_helper] {self.address_string()} {format % args}\n")

    return Handler


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--config", default=os.environ.get("REALMAN_PIKA_HELPER_CONFIG", str(DEFAULT_CONFIG)))
    args = parser.parse_args(argv)
    config = load_config(args.config)
    if config["bind_host"] not in ("127.0.0.1", "localhost", "::1"):
        raise SystemExit("pika helper must bind to localhost only")
    server = ThreadingHTTPServer((config["bind_host"], config["port"]), make_handler(PikaProcess(config)))
    print(f"[pika_helper] listening on http://{config['bind_host']}:{config['port']}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `PYTHONPATH=. python3 -m pytest -q tests/test_pika_process_helper.py -p no:cacheprovider`
Expected: all PASS. If `test_stop_sends_ctrl_c_then_returns_once_session_is_gone` fails, fix `FakeTmux`, not the helper: the fake must report the session gone on the first `has-session` after `send-keys` when `stops_after == 0`.

- [ ] **Step 6: Service template, rm65 subcommand, CI**

`config/docker/realman-pika-helper.service`:

```ini
# Host-side helper behind the :8765 "Pika 速度控制" switch.
# Installed by `./rm65 pika-helper install` as a systemd --user unit (fills in @ROOT@):
# the Pika stack needs the desktop user's tmux server and DISPLAY, and no sudo is required.
# Run `loginctl enable-linger $USER` once so it keeps running without a login session.
[Unit]
Description=RealMan Pika process helper for the :8765 Web page

[Service]
Type=simple
WorkingDirectory=@ROOT@
Environment=DISPLAY=:0
ExecStart=/usr/bin/python3 @ROOT@/scripts/pika_process_helper.py --config @ROOT@/config/docker/pika_helper.json
Restart=on-failure
RestartSec=3
# Only kill the helper: the tmux server it forked lives in this cgroup and must keep Pika alive.
KillMode=process

[Install]
WantedBy=default.target
```

In `rm65`, after `restart_helper() { ... }`:

```bash
pika_helper() {
  # Host-side helper behind the :8765 Pika switch (scripts/pika_process_helper.py), as a user unit.
  local unit="$HOME/.config/systemd/user/realman-pika-helper.service"
  case "${1:-}" in
    run) exec python3 "$ROOT/scripts/pika_process_helper.py" --config "$ROOT/config/docker/pika_helper.json" ;;
    install)
      if [[ "$DRY_RUN" == "1" ]]; then
        printf '+ install %s\n' "$unit"
        return 0
      fi
      mkdir -p "$(dirname "$unit")"
      sed -e "s#@ROOT@#$ROOT#g" "$ROOT/config/docker/realman-pika-helper.service" >"$unit"
      systemctl --user daemon-reload
      systemctl --user enable --now realman-pika-helper.service
      systemctl --user --no-pager status realman-pika-helper.service | head -n 5
      ;;
    uninstall)
      run systemctl --user disable --now realman-pika-helper.service || true
      run rm -f "$unit"
      run systemctl --user daemon-reload
      ;;
    status) run systemctl --user --no-pager status realman-pika-helper.service ;;
    *) printf 'usage: rm65 pika-helper install|uninstall|status|run\n' >&2; return 2 ;;
  esac
}
```

Dispatch line after `restart-helper) restart_helper "$@" ;;`:

```bash
  pika-helper) pika_helper "$@" ;;
```

In `usage()`, after the `restart-helper` line add (match the existing column alignment):

```
  pika-helper install|uninstall|status|run  Host helper behind the :8765 Pika switch (systemd --user).
```

In `.github/workflows/ci.yml` after `.:tests/test_docker_restart_helper.py \` add `.:tests/test_pika_process_helper.py \`.

Run: `bash -n rm65 && DRY_RUN=1 ./rm65 pika-helper install`
Expected: `+ install /Users/.../.config/systemd/user/realman-pika-helper.service`. (If `DRY_RUN` is set differently in `rm65`, use whatever `restart-helper` dry run uses: `grep -n DRY_RUN= rm65`.)

- [ ] **Step 7: Commit**

```bash
git add scripts/pika_process_helper.py config/docker/pika_helper.json config/docker/realman-pika-helper.service tests/test_pika_process_helper.py rm65 .github/workflows/ci.yml
git commit -m "feat(pika): host helper that starts and stops the Pika teleop stack"
```

---

### Task 2: Protocol message and web config

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py` (new parser near `_parse_select_input_mode` ~line 137; register in `_ARMLESS_PARSERS` ~line 485)
- Modify: `src/driver/realman_web_control/realman_web_control/web_server.py` (`WebServerConfig` fields ~line 50, loader ~line 106-152)
- Modify: `config/ros/realman_web_control.yaml` (append block after `docker_restart:`)
- Test: `src/driver/realman_web_control/test/test_protocol.py`, `src/driver/realman_web_control/test/test_web_server.py`

**Interfaces:**
- Produces: parsed message `{"type": "pika_switch", "request_id": str, "enabled": bool}`.
- Produces: `WebServerConfig` fields `pika_helper_url: str = ""`, `pika_helper_timeout_sec: float = 40.0`, `pika_input_fresh_ms: float = 500.0`, `pika_input_wait_timeout_sec: float = 30.0`, `pika_status_poll_sec: float = 2.0`, `pika_mode_switch_timeout_sec: float = 150.0`, `pika_mode: str = "pikavelocity"`, `pika_off_mode: str = "none"`.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_protocol.py`:

```python
def test_pika_switch_needs_request_id_and_boolean_enabled():
    assert parse_message('{"type":"pika_switch","request_id":"p-1","enabled":true}') == {
        "type": "pika_switch", "request_id": "p-1", "enabled": True,
    }
    assert parse_message('{"type":"pika_switch","request_id":"p-2","enabled":false}')["enabled"] is False
    for bad in ({"request_id": "p-3"}, {"request_id": "p-3", "enabled": 1}, {"enabled": True},
                {"request_id": "p-3", "enabled": "true"}):
        with pytest.raises(ProtocolError):
            parse_message(json.dumps({"type": "pika_switch", **bad}))
```

Append to `test/test_web_server.py` (it already imports `load_server_config`; if not, add `from realman_web_control.web_server import load_server_config`):

```python
def _write_config(tmp_path, extra):
    document = {
        "server": {"bind_host": "127.0.0.1", "port": 8765, "allowed_origins": ["same-origin"]},
        "input_mode": {"discovery_period_sec": 1.0, "web_override_timeout_sec": 5.0},
        **extra,
    }
    path = tmp_path / "web.yaml"
    path.write_text(yaml.safe_dump(document), encoding="utf-8")
    return path


def test_pika_switch_is_hidden_without_a_block(tmp_path):
    assert load_server_config(_write_config(tmp_path, {})).pika_helper_url == ""


def test_pika_switch_block_is_loaded(tmp_path):
    config = load_server_config(_write_config(tmp_path, {"pika_switch": {
        "helper_url": "http://127.0.0.1:8783/", "helper_timeout_sec": 40.0, "input_fresh_ms": 400,
        "input_wait_timeout_sec": 30.0, "status_poll_sec": 2.0, "mode_switch_timeout_sec": 150.0,
        "mode": "pikavelocity", "off_mode": "none",
    }}))
    assert config.pika_helper_url == "http://127.0.0.1:8783"
    assert config.pika_input_fresh_ms == 400.0
    assert (config.pika_mode, config.pika_off_mode) == ("pikavelocity", "none")


@pytest.mark.parametrize("bad", [
    {"helper_url": "ftp://x"}, {"helper_url": "http://127.0.0.1:8783", "input_fresh_ms": 0},
    {"helper_url": "http://127.0.0.1:8783", "mode": "Pika Velocity"},
])
def test_pika_switch_block_is_validated(tmp_path, bad):
    with pytest.raises(ValueError, match="pika_switch"):
        load_server_config(_write_config(tmp_path, {"pika_switch": bad}))


def test_repo_config_enables_the_pika_switch():
    from pathlib import Path
    root = Path(__file__).resolve().parents[4]
    config = load_server_config(root / "config/ros/realman_web_control.yaml")
    assert config.pika_helper_url == "http://127.0.0.1:8783"
    assert config.pika_helper_timeout_sec > 28  # helper timeout_sec 20 + stop_grace_sec 8
```

Make sure `import pytest` is at the top of `test_web_server.py`. Check the root-config test path by looking at how the existing test at line 12 (`test_input_mode_timing_is_loaded_from_root_config_without_runtime_defaults`) locates the repo config and copy that instead of `parents[4]` if it differs.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_protocol.py test/test_web_server.py -p no:cacheprovider -k "pika"`
Expected: FAIL (`unknown message type` / `AttributeError: pika_helper_url`).

- [ ] **Step 3: Implement the parser**

In `protocol.py` after `_parse_select_input_mode`:

```python
def _parse_pika_switch(message: dict[str, Any]) -> dict[str, Any]:
    request_id = _request_id(message)
    enabled = message.get("enabled")
    if not isinstance(enabled, bool):
        raise ProtocolError("invalid_field", "enabled must be true or false", request_id)
    return {"type": "pika_switch", "request_id": request_id, "enabled": enabled}
```

Register in `_ARMLESS_PARSERS`: `"pika_switch": _parse_pika_switch,` after `"select_input_mode"`.

- [ ] **Step 4: Implement the config**

In `WebServerConfig`, after `docker_restart_service`:

```python
    # Host-side pika_process_helper starts/stops the Pika stack; empty URL hides the switch.
    pika_helper_url: str = ""
    pika_helper_timeout_sec: float = 40.0
    pika_input_fresh_ms: float = 500.0
    pika_input_wait_timeout_sec: float = 30.0
    pika_status_poll_sec: float = 2.0
    pika_mode_switch_timeout_sec: float = 150.0
    pika_mode: str = "pikavelocity"
    pika_off_mode: str = "none"
```

In `load_server_config`, after the `docker_restart` block and before `config = WebServerConfig(`:

```python
    pika = document.get("pika_switch", {})
    if not isinstance(pika, dict):
        raise ValueError("pika_switch must be a mapping")
    pika_url = pika.get("helper_url", "")
    if not isinstance(pika_url, str) or (pika_url and urlsplit(pika_url).scheme not in ("http", "https")):
        raise ValueError("pika_switch.helper_url must be an http(s) URL or empty")
    pika_numbers: dict[str, float] = {}
    for field, default in (("helper_timeout_sec", 40.0), ("input_fresh_ms", 500.0),
                           ("input_wait_timeout_sec", 30.0), ("status_poll_sec", 2.0),
                           ("mode_switch_timeout_sec", 150.0)):
        value = pika.get(field, default)
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
            raise ValueError(f"pika_switch.{field} must be finite and positive")
        pika_numbers[field] = float(value)
    pika_modes: dict[str, str] = {}
    for field, default in (("mode", "pikavelocity"), ("off_mode", "none")):
        value = pika.get(field, default)
        if not isinstance(value, str) or re.fullmatch(r"[a-z][a-z0-9]*", value) is None:
            raise ValueError(f"pika_switch.{field} must be a lower-case input mode id")
        pika_modes[field] = value
```

Add `import re` at the top of `web_server.py` if missing. In the `WebServerConfig(...)` call add:

```python
        pika_helper_url=pika_url.rstrip("/"),
        pika_helper_timeout_sec=pika_numbers["helper_timeout_sec"],
        pika_input_fresh_ms=pika_numbers["input_fresh_ms"],
        pika_input_wait_timeout_sec=pika_numbers["input_wait_timeout_sec"],
        pika_status_poll_sec=pika_numbers["status_poll_sec"],
        pika_mode_switch_timeout_sec=pika_numbers["mode_switch_timeout_sec"],
        pika_mode=pika_modes["mode"],
        pika_off_mode=pika_modes["off_mode"],
```

Append to `config/ros/realman_web_control.yaml` after the `docker_restart:` block:

```yaml

# "Pika 速度控制" switch on :8765. scripts/pika_process_helper.py runs on the robot host
# (./rm65 pika-helper install) with the commands in config/docker/pika_helper.json.
# On: start the Pika stack, wait for /pika/{l,r}/cartesian_velocity, select `mode`.
# Off: select `off_mode`, then stop the Pika stack.
pika_switch:
  helper_url: http://127.0.0.1:8783  # Empty string hides the switch.
  helper_timeout_sec: 40.0  # Above the helper's timeout_sec 20 + stop_grace_sec 8, with room for the status checks during stop.
  input_fresh_ms: 500  # Both l and r Pika velocity must be newer than this.
  input_wait_timeout_sec: 30.0  # Stack started but no Pika data from an arm -> failed (stack stays up).
  status_poll_sec: 2.0  # Helper status poll; shows a stack started or stopped by hand.
  mode_switch_timeout_sec: 150.0  # Covers the entry MoveJ (pika_default_pose.timeout_sec 120).
  mode: pikavelocity
  off_mode: none
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_protocol.py test/test_web_server.py -p no:cacheprovider`
Expected: all PASS (existing tests included).

- [ ] **Step 6: Commit**

```bash
git add src/driver/realman_web_control/realman_web_control/protocol.py src/driver/realman_web_control/realman_web_control/web_server.py config/ros/realman_web_control.yaml src/driver/realman_web_control/test/test_protocol.py src/driver/realman_web_control/test/test_web_server.py
git commit -m "feat(web-control): pika_switch message and config"
```

---

### Task 3: Pika switch state machine

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/pika_switch.py`
- Test: `src/driver/realman_web_control/test/test_pika_switch.py`

**Interfaces:**
- Consumes: nothing from earlier tasks at runtime (config values are passed in).
- Produces:

```python
@dataclass(frozen=True)
class PikaSwitchConfig:
    input_fresh_ms: float; input_wait_timeout_sec: float; status_poll_sec: float
    mode_switch_timeout_sec: float; mode: str; off_mode: str

@dataclass(frozen=True)
class ModeView:            # what the switch needs from InputModeBridge
    available: bool        # router discovered
    selectable: bool       # PikaSwitchConfig.mode is a selectable option
    phase: str | None      # "ACTIVE" | "SWITCHING" | "FAILED" | None
    requested_mode: str
    active_mode: str
    detail: str = ""

@dataclass(frozen=True)
class PikaEffect:
    kind: str              # "helper" | "select_mode" | "send_event" | "reply_error"
    payload: dict[str, Any]
    client_id: str | None = None

class PikaSwitch:
    def __init__(self, config: PikaSwitchConfig, *, enabled: bool, clock=time.monotonic) -> None
    def command(self, client_id: str, request_id: str, enabled: bool, mode: ModeView) -> list[PikaEffect]
    def helper_result(self, action: str, ok: bool, payload: dict[str, Any]) -> list[PikaEffect]
    def input_received(self, arm: str) -> None
    def tick(self, mode: ModeView) -> list[PikaEffect]
    def state_event(self) -> dict[str, Any]
```

Effects: `helper` payload `{"action": "start"|"stop"|"status"}`; `select_mode` payload `{"mode_id": str, "request_id": "pika-<n>"}` with `client_id` set to the requester; `send_event` payload = `state_event()` (broadcast, `client_id=None`); `reply_error` payload `{"type": "error", "code": ..., "message": ..., "request_id": ...}` to `client_id`.

`helper_result(action="status", ok, payload)` uses `payload["running"]`; `ok=False` for status means the helper is unreachable → `available: False`.

- [ ] **Step 1: Write the failing tests**

`test/test_pika_switch.py`:

```python
from realman_web_control.pika_switch import ModeView, PikaSwitch, PikaSwitchConfig

CONFIG = PikaSwitchConfig(input_fresh_ms=500, input_wait_timeout_sec=30, status_poll_sec=2,
                          mode_switch_timeout_sec=150, mode="pikavelocity", off_mode="none")


class Clock:
    def __init__(self):
        self.now = 100.0

    def __call__(self):
        return self.now


def mode(active="none", phase="ACTIVE", requested=None, selectable=True, available=True, detail=""):
    return ModeView(available, selectable, phase, requested or active, active, detail)


def kinds(effects):
    return [(e.kind, e.payload.get("action") or e.payload.get("mode_id") or e.payload.get("code") or e.payload.get("phase"))
            for e in effects]


def make(running=False):
    clock = Clock()
    switch = PikaSwitch(CONFIG, enabled=True, clock=clock)
    switch.helper_result("status", True, {"running": running})
    return switch, clock


def feed(switch, clock, arms=("l", "r")):
    for arm in arms:
        switch.input_received(arm)


def test_disabled_switch_is_unavailable_and_refuses():
    switch = PikaSwitch(CONFIG, enabled=False, clock=Clock())
    assert switch.state_event()["available"] is False
    assert kinds(switch.command("c1", "p1", True, mode())) == [("reply_error", "pika_switch_unavailable")]


def test_unreachable_helper_is_unavailable():
    switch, _ = make()
    switch.helper_result("status", False, {"error": "down"})
    assert switch.state_event()["available"] is False


def test_on_refused_when_mode_not_selectable_and_stack_not_started():
    switch, _ = make()
    effects = switch.command("c1", "p1", True, mode(selectable=False))
    assert kinds(effects) == [("reply_error", "pika_mode_unavailable")]
    assert switch.state_event()["phase"] == "off"


def test_full_on_sequence():
    switch, clock = make()
    effects = switch.command("c1", "p1", True, mode())
    assert ("helper", "start") in kinds(effects)
    assert switch.state_event()["phase"] == "starting"
    switch.helper_result("start", True, {"ok": True})
    assert switch.state_event()["phase"] == "waiting_input"
    assert kinds(switch.tick(mode())) == []  # no input yet, nothing new
    feed(switch, clock, ("l",))
    switch.tick(mode())
    assert switch.state_event()["input_age_ms"]["r"] is None
    feed(switch, clock)
    effects = switch.tick(mode())
    select = [e for e in effects if e.kind == "select_mode"]
    assert select[0].payload["mode_id"] == "pikavelocity" and select[0].client_id == "c1"
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="none", phase="SWITCHING", requested="pikavelocity"))
    assert switch.state_event()["phase"] == "selecting"
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"


def test_waiting_input_times_out_naming_missing_arm_and_leaves_stack():
    switch, clock = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    for _ in range(31):
        clock.now += 1
        switch.input_received("l")
        effects = switch.tick(mode())
    state = switch.state_event()
    assert state["phase"] == "failed"
    assert "/pika/r" in state["detail"] and "/pika/l" not in state["detail"]
    assert ("helper", "stop") not in kinds(effects)


def test_stale_input_does_not_count():
    switch, clock = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    feed(switch, clock)
    clock.now += 1.0  # older than 500 ms
    assert not [e for e in switch.tick(mode()) if e.kind == "select_mode"]


def test_start_failure_reports_output():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", False, {"error": "start failed with exit 1", "output_tail": ["no server"]})
    state = switch.state_event()
    assert state["phase"] == "failed" and "no server" in state["detail"]


def test_mode_failure_and_timeout():
    for final, advance in ((mode(active="none", phase="FAILED", requested="pikavelocity", detail="MoveJ failed"), 0),
                           (mode(active="none", phase="SWITCHING", requested="pikavelocity"), 151)):
        switch, clock = make()
        switch.command("c1", "p1", True, mode())
        switch.helper_result("start", True, {})
        feed(switch, clock)
        switch.tick(mode())
        clock.now += advance
        switch.tick(final)
        assert switch.state_event()["phase"] == "failed"


def test_busy_during_transition():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    assert kinds(switch.command("c2", "p2", False, mode())) == [("reply_error", "pika_switch_busy")]


def _turn_on(switch, clock):
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", True, {})
    feed(switch, clock)
    switch.tick(mode())
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"


def test_off_selects_none_then_stops_stack():
    switch, clock = make()
    _turn_on(switch, clock)
    effects = switch.command("c1", "p9", False, mode(active="pikavelocity"))
    assert [e.payload["mode_id"] for e in effects if e.kind == "select_mode"] == ["none"]
    assert ("helper", "stop") not in kinds(effects)
    effects = switch.tick(mode(active="none"))
    assert ("helper", "stop") in kinds(effects)
    assert switch.state_event()["phase"] == "stopping"
    switch.helper_result("stop", True, {})
    assert switch.state_event()["phase"] == "off"
    assert switch.state_event()["stack_running"] is False


def test_off_stops_stack_even_if_none_is_refused_or_router_gone():
    for final in (mode(active="pikavelocity", phase="FAILED", requested="none", detail="busy"),
                  mode(available=False, phase=None, active="")):
        switch, clock = make()
        _turn_on(switch, clock)
        switch.command("c1", "p9", False, mode(active="pikavelocity"))
        effects = switch.tick(final)
        assert ("helper", "stop") in kinds(effects)


def test_off_skips_mode_when_not_in_pika_mode():
    switch, _ = make(running=True)
    effects = switch.command("c1", "p1", False, mode(active="keyboard"))
    assert ("helper", "stop") in kinds(effects)
    assert not [e for e in effects if e.kind == "select_mode"]


def test_status_poll_and_external_changes():
    switch, clock = make()
    assert kinds(switch.tick(mode())) == []
    clock.now += 2.1
    assert ("helper", "status") in kinds(switch.tick(mode()))
    switch.helper_result("status", True, {"running": True})
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "on"  # started elsewhere and already in Pika mode
    switch.helper_result("status", True, {"running": False})
    switch.tick(mode(active="pikavelocity"))
    assert switch.state_event()["phase"] == "off"


def test_mode_lost_is_shown_while_on():
    switch, clock = make()
    _turn_on(switch, clock)
    switch.tick(mode(active="keyboard"))
    state = switch.state_event()
    assert state["phase"] == "on" and state["mode_lost"] is True


def test_failed_retry_on_and_off():
    switch, _ = make()
    switch.command("c1", "p1", True, mode())
    switch.helper_result("start", False, {"error": "x"})
    assert ("helper", "start") in kinds(switch.command("c1", "p2", True, mode()))
    switch.helper_result("start", False, {"error": "x"})
    switch.helper_result("status", True, {"running": True})
    assert ("helper", "stop") in kinds(switch.command("c1", "p3", False, mode()))


def test_every_phase_change_broadcasts_state():
    switch, _ = make()
    effects = switch.command("c1", "p1", True, mode())
    assert any(e.kind == "send_event" and e.client_id is None and e.payload["type"] == "pika_switch_state"
               for e in effects)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_pika_switch.py -p no:cacheprovider`
Expected: FAIL (`ModuleNotFoundError: realman_web_control.pika_switch`).

- [ ] **Step 3: Implement**

`realman_web_control/pika_switch.py`:

```python
"""ROS-independent sequencing for the :8765 Pika velocity switch.

On:  helper start -> both /pika/{l,r}/cartesian_velocity fresh -> select `mode`.
Off: select `off_mode` (only when `mode` is active) -> helper stop.
The owner serializes all calls and applies the returned effects in order.
"""

from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable

PIKA_ARMS = ("l", "r")
TRANSITIONS = frozenset({"starting", "waiting_input", "selecting", "stopping"})


@dataclass(frozen=True)
class PikaSwitchConfig:
    input_fresh_ms: float
    input_wait_timeout_sec: float
    status_poll_sec: float
    mode_switch_timeout_sec: float
    mode: str
    off_mode: str


@dataclass(frozen=True)
class ModeView:
    available: bool
    selectable: bool
    phase: str | None
    requested_mode: str
    active_mode: str
    detail: str = ""


@dataclass(frozen=True)
class PikaEffect:
    kind: str
    payload: dict[str, Any]
    client_id: str | None = None


class PikaSwitch:
    def __init__(self, config: PikaSwitchConfig, *, enabled: bool,
                 clock: Callable[[], float] = time.monotonic) -> None:
        self._config = config
        self._enabled = enabled
        self._clock = clock
        self._reachable = False
        self._stack_running = False
        self._phase = "off"
        self._detail = ""
        self._mode_lost = False
        self._client_id: str | None = None
        self._deadline = 0.0
        self._stop_after_mode = False
        self._next_request = 0
        self._last_input: dict[str, float] = {}
        self._helper_in_flight: str | None = None
        # The owner sends one status probe at start-up (Task 4); polling resumes after one period.
        self._next_poll = clock() + config.status_poll_sec
        self._published: dict[str, Any] | None = None

    # ---- inputs -------------------------------------------------------
    def input_received(self, arm: str) -> None:
        if arm in PIKA_ARMS:
            self._last_input[arm] = self._clock()

    def command(self, client_id: str, request_id: str, enabled: bool, mode: ModeView) -> list[PikaEffect]:
        if not self._enabled or not self._reachable:
            return [self._error(client_id, request_id, "pika_switch_unavailable", "Pika helper is not available")]
        if self._phase in TRANSITIONS or self._helper_in_flight in ("start", "stop"):
            return [self._error(client_id, request_id, "pika_switch_busy", f"Pika switch is {self._phase}")]
        self._client_id = client_id
        if enabled:
            if not (mode.available and mode.selectable):
                return [self._error(client_id, request_id, "pika_mode_unavailable",
                                    f"{self._config.mode} mode is not available; start the control tree first")]
            self._last_input.clear()
            return self._enter("starting", "") + [self._helper("start")]
        if mode.available and mode.active_mode == self._config.mode and mode.phase is not None:
            self._stop_after_mode = True
            self._deadline = self._clock() + self._config.mode_switch_timeout_sec
            return self._enter("stopping", "") + [self._select(self._config.off_mode)]
        return self._enter("stopping", "") + [self._helper("stop")]

    def helper_result(self, action: str, ok: bool, payload: dict[str, Any]) -> list[PikaEffect]:
        if self._helper_in_flight == action:
            self._helper_in_flight = None
        if action == "status":
            self._reachable = ok
            if ok:
                self._stack_running = bool(payload.get("running"))
            return self._publish()
        self._reachable = self._reachable or ok
        if not ok:
            tail = payload.get("output_tail") or []
            detail = "; ".join([str(payload.get("error", f"{action} failed")), *[str(line) for line in tail[-3:]]])
            return self._enter("failed", detail)
        if action == "start" and self._phase == "starting":
            self._stack_running = True
            self._deadline = self._clock() + self._config.input_wait_timeout_sec
            return self._enter("waiting_input", "")
        if action == "stop" and self._phase == "stopping":
            self._stack_running = False
            return self._enter("off", self._detail)
        return self._publish()

    def tick(self, mode: ModeView) -> list[PikaEffect]:
        now = self._clock()
        effects: list[PikaEffect] = []
        if self._phase == "waiting_input":
            if all(self._fresh(arm, now) for arm in PIKA_ARMS):
                self._deadline = now + self._config.mode_switch_timeout_sec
                effects += self._enter("selecting", "") + [self._select(self._config.mode)]
            elif now >= self._deadline:
                missing = ", ".join(f"/pika/{arm}" for arm in PIKA_ARMS if not self._fresh(arm, now))
                effects += self._enter("failed", f"no {missing} input for {self._config.input_wait_timeout_sec:g} s")
        elif self._phase == "selecting":
            if mode.phase == "ACTIVE" and mode.active_mode == self._config.mode:
                effects += self._enter("on", "")
            elif mode.phase == "FAILED" and mode.requested_mode == self._config.mode:
                effects += self._enter("failed", mode.detail or f"switch to {self._config.mode} failed")
            elif not mode.available:
                effects += self._enter("failed", "input mode router is unavailable")
            elif now >= self._deadline:
                effects += self._enter("failed", f"{self._config.mode} not active after {self._config.mode_switch_timeout_sec:g} s")
        elif self._phase == "stopping" and self._stop_after_mode:
            reached = mode.phase == "ACTIVE" and mode.active_mode == self._config.off_mode
            refused = mode.phase == "FAILED" and mode.requested_mode == self._config.off_mode
            if reached or refused or not mode.available or now >= self._deadline:
                self._stop_after_mode = False
                if refused:
                    self._detail = f"{self._config.off_mode} refused: {mode.detail}"
                effects += self._publish() + [self._helper("stop")]
        elif self._phase in ("off", "on") and self._helper_in_flight is None:
            in_mode = mode.phase == "ACTIVE" and mode.active_mode == self._config.mode
            if self._phase == "off" and self._stack_running and in_mode:
                effects += self._enter("on", "")
            elif self._phase == "on" and not self._stack_running:
                effects += self._enter("off", "Pika stack stopped outside :8765")
            self._mode_lost = self._phase == "on" and not in_mode
        if (self._enabled and self._helper_in_flight is None and self._phase not in TRANSITIONS
                and now >= self._next_poll):
            self._next_poll = now + self._config.status_poll_sec
            effects.append(self._helper("status"))
        return effects + self._publish()

    # ---- outputs ------------------------------------------------------
    def state_event(self) -> dict[str, Any]:
        now = self._clock()
        ages = {arm: (round((now - self._last_input[arm]) * 1000) if arm in self._last_input else None)
                for arm in PIKA_ARMS}
        return {
            "type": "pika_switch_state",
            "available": self._enabled and self._reachable,
            "phase": self._phase,
            "stack_running": self._stack_running,
            "input_age_ms": ages,
            "mode_lost": self._mode_lost,
            "detail": self._detail,
        }

    # ---- helpers ------------------------------------------------------
    def _fresh(self, arm: str, now: float) -> bool:
        received = self._last_input.get(arm)
        return received is not None and (now - received) * 1000 < self._config.input_fresh_ms

    def _enter(self, phase: str, detail: str) -> list[PikaEffect]:
        self._phase = phase
        self._detail = detail
        if phase != "on":
            self._mode_lost = False
        return self._publish()

    def _publish(self) -> list[PikaEffect]:
        state = self.state_event()
        # Input ages change every tick; only broadcast them while waiting for input.
        comparable = {**state, "input_age_ms": state["input_age_ms"] if self._phase == "waiting_input" else None}
        if comparable == self._published:
            return []
        self._published = comparable
        return [PikaEffect("send_event", state)]

    def _helper(self, action: str) -> PikaEffect:
        self._helper_in_flight = action
        return PikaEffect("helper", {"action": action})

    def _select(self, mode_id: str) -> PikaEffect:
        self._next_request += 1
        return PikaEffect("select_mode", {"mode_id": mode_id, "request_id": f"pika-{self._next_request}"},
                          self._client_id)

    @staticmethod
    def _error(client_id: str, request_id: str, code: str, message: str) -> PikaEffect:
        return PikaEffect("reply_error", {"type": "error", "code": code, "message": message,
                                          "request_id": request_id}, client_id)
```

Note on `waiting_input` broadcasting: `_publish` compares `input_age_ms` only while waiting, so the page sees ages rise (l ✓ / r …) during that phase but receives no event per tick otherwise. During waiting it may broadcast every tick (ages change); the node ticks at 5 Hz (Task 4), which is acceptable.

Check against the existing `ProtocolError(...).event()` shape in `protocol.py` (`grep -n "def event" -A8 protocol.py`); if its keys differ from `{"type": "error", "code", "message", "request_id"}`, change `_error` to produce the same keys and update `kinds()` in the test only if the key holding the code differs.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_pika_switch.py -p no:cacheprovider`
Expected: all PASS. When a test fails, decide by the spec table which side is wrong; do not loosen a test to match code that contradicts the spec.

- [ ] **Step 5: Commit**

```bash
git add src/driver/realman_web_control/realman_web_control/pika_switch.py src/driver/realman_web_control/test/test_pika_switch.py
git commit -m "feat(web-control): Pika switch state machine"
```

---

### Task 4: Node wiring (bridge accessors, helper client, web_control_node)

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/pika_helper_client.py`
- Modify: `src/driver/realman_web_control/realman_web_control/input_mode_bridge.py` (add accessors after `generation` property ~line 90)
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Test: `src/driver/realman_web_control/test/test_pika_helper_client.py`, `src/driver/realman_web_control/test/test_input_mode_bridge.py`

**Interfaces:**
- Consumes: `PikaSwitch`, `PikaSwitchConfig`, `ModeView`, `PikaEffect` (Task 3); `WebServerConfig.pika_*` (Task 2); `{"type":"pika_switch",...}` (Task 2).
- Produces: `call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[bool, dict]`; `InputModeBridge.snapshot -> InputModeSnapshot | None`; `InputModeBridge.is_selectable(mode_id: str) -> bool`.

- [ ] **Step 1: Write the failing tests**

`test/test_pika_helper_client.py`:

```python
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

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
    import pytest
    with pytest.raises(ValueError):
        call_helper("http://127.0.0.1:9", "restart", 0.5)
```

Append to `test/test_input_mode_bridge.py` (it already builds catalogs with `InputModeOption`; reuse its imports):

```python
def test_snapshot_and_is_selectable_accessors():
    bridge = InputModeBridge(web_override_timeout_sec=5.0)
    assert bridge.snapshot is None and bridge.is_selectable("pikavelocity") is False
    bridge.update_catalog((InputModeOption("web", "Web", False),
                           InputModeOption("pikavelocity", "Pika / 速度控制", True)))
    assert bridge.is_selectable("pikavelocity") is True
    assert bridge.is_selectable("web") is False
    bridge.update_state(InputModeSnapshot("none", "none", "none", "ACTIVE", 1, 1))
    assert bridge.snapshot.active_mode == "none"
```

(Add `InputModeSnapshot` to that file's import from `realman_web_control.input_mode_bridge` if missing.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_pika_helper_client.py test/test_input_mode_bridge.py -p no:cacheprovider`
Expected: FAIL (`ModuleNotFoundError`, `AttributeError: snapshot`).

- [ ] **Step 3: Implement the client and accessors**

`realman_web_control/pika_helper_client.py`:

```python
"""Blocking JSON call to the host pika_process_helper; run it off the control thread."""

from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

_METHODS = {"status": "GET", "start": "POST", "stop": "POST"}


def call_helper(base_url: str, action: str, timeout_sec: float) -> tuple[bool, dict[str, Any]]:
    method = _METHODS.get(action)
    if method is None:
        raise ValueError(f"unknown Pika helper action: {action}")
    request = Request(f"{base_url}/{action}", data=b"{}" if method == "POST" else None, method=method,
                      headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=timeout_sec) as response:  # noqa: S310 - configured localhost URL
            return True, _payload(response.read())
    except HTTPError as error:
        return False, _payload(error.read())
    except (URLError, OSError, TimeoutError, ValueError):
        return False, {"ok": False, "error": "Pika helper is not reachable (./rm65 pika-helper install)"}


def _payload(body: bytes) -> dict[str, Any]:
    try:
        payload = json.loads(body or b"{}")
    except ValueError:
        return {"ok": False, "error": "Pika helper returned invalid JSON"}
    return payload if isinstance(payload, dict) else {}
```

In `input_mode_bridge.py`, after the `generation` property:

```python
    @property
    def snapshot(self) -> InputModeSnapshot | None:
        return self._snapshot

    def is_selectable(self, mode_id: str) -> bool:
        return any(option.id == mode_id and option.selectable for option in self._catalog or ())
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test/test_pika_helper_client.py test/test_input_mode_bridge.py -p no:cacheprovider`
Expected: all PASS.

- [ ] **Step 5: Wire web_control_node.py**

Imports (top, with the other package imports; `TwistStamped` with the other `geometry_msgs` imports — add the line if `geometry_msgs.msg` is not imported yet):

```python
from geometry_msgs.msg import TwistStamped
from .pika_helper_client import call_helper
from .pika_switch import ModeView, PikaEffect, PikaSwitch, PikaSwitchConfig
```

In `__init__`, right after `self._input_modes = InputModeBridge(...)`:

```python
        self._pika_helper_url = web_config.pika_helper_url
        self._pika_helper_timeout = web_config.pika_helper_timeout_sec
        self._pika = PikaSwitch(PikaSwitchConfig(
            input_fresh_ms=web_config.pika_input_fresh_ms,
            input_wait_timeout_sec=web_config.pika_input_wait_timeout_sec,
            status_poll_sec=web_config.pika_status_poll_sec,
            mode_switch_timeout_sec=web_config.pika_mode_switch_timeout_sec,
            mode=web_config.pika_mode,
            off_mode=web_config.pika_off_mode,
        ), enabled=bool(web_config.pika_helper_url))
```

After `self._server.start()` and the existing timers:

```python
        if self._pika_helper_url:
            for arm in ("l", "r"):
                self._web_subscriptions.append(self.create_subscription(
                    TwistStamped, f"/pika/{arm}/cartesian_velocity",
                    lambda _message, arm=arm: self._pika.input_received(arm), 1,
                    callback_group=self._callback_group,
                ))
            self._pika_timer = self.create_timer(0.2, self._pika_tick, callback_group=self._callback_group)
            # First status probe now, so the switch is shown (and `on` is derived) without waiting a poll period.
            self._apply_pika_effects([PikaEffect("helper", {"action": "status"})])
```

(`input_received` only stores a float under the GIL; it intentionally skips the control lock so the 20 Hz stream never waits on it.)

In `_dispatch`, after the `select_input_mode` branch:

```python
        elif message_type == "pika_switch":
            self._apply_pika_effects(self._pika.command(
                client_id, message["request_id"], message["enabled"], self._pika_mode_view(),
            ))
```

In `_send_cached_state`, after `self._apply_input_mode_effects(self._input_modes.cached_events(client_id))`:

```python
        self._server.send_event(self._pika.state_event(), client_id)
```

New methods (place after `_apply_input_mode_effects`):

```python
    def _pika_mode_view(self) -> ModeView:
        snapshot = self._input_modes.snapshot
        return ModeView(
            available=self._input_modes.available,
            selectable=self._input_modes.is_selectable(self._pika_mode_id),
            phase=snapshot.phase if snapshot is not None else None,
            requested_mode=snapshot.requested_mode if snapshot is not None else "",
            active_mode=snapshot.active_mode if snapshot is not None else "",
            detail=snapshot.detail if snapshot is not None else "",
        )

    @_serialized_control
    def _pika_tick(self) -> None:
        self._apply_pika_effects(self._pika.tick(self._pika_mode_view()))

    @_serialized_control
    def _pika_helper_done(self, action: str, ok: bool, payload: dict[str, Any]) -> None:
        if not ok and action != "status":
            self.get_logger().warning(f"Pika helper {action} failed: {payload.get('error', '')}")
        self._apply_pika_effects(self._pika.helper_result(action, ok, payload))

    def _apply_pika_effects(self, effects: list[PikaEffect]) -> None:
        for effect in effects:
            if effect.kind == "send_event":
                self._server.send_event(effect.payload)
            elif effect.kind == "reply_error":
                self._server.send_event(effect.payload, effect.client_id)
            elif effect.kind == "helper":
                action = effect.payload["action"]
                if action != "status":
                    self.get_logger().info(f"Pika switch: helper {action}")
                threading.Thread(
                    target=lambda action=action: self._pika_helper_done(
                        action, *call_helper(self._pika_helper_url, action, self._pika_helper_timeout)),
                    name=f"pika-helper-{action}", daemon=True,
                ).start()
            elif effect.kind == "select_mode":
                self.get_logger().info(f"Pika switch: select input mode {effect.payload['mode_id']}")
                self._apply_input_mode_effects(self._input_modes.select_mode(
                    effect.client_id or "pika_switch",
                    {"mode_id": effect.payload["mode_id"], "request_id": effect.payload["request_id"]},
                ))
```

Also store `self._pika_mode_id = web_config.pika_mode` next to `self._pika_helper_url`. Confirm `threading` is imported (it is: `threading.RLock` is used).

Check `self._server.send_event(event)` with no client broadcasts (`web_server.py:242`, `client_id: str | None = None`). If the server suppresses unknown event types, no change is needed: `send_event` forwards any dict.

- [ ] **Step 6: Syntax and import check (no ROS on the Mac)**

Run: `python3 -m py_compile src/driver/realman_web_control/realman_web_control/web_control_node.py && cd src/driver/realman_web_control && PYTHONPATH=. python3 -m pytest -q test -p no:cacheprovider`
Expected: compile OK; the full web-control suite passes (tests that need rclpy skip as they do today). Note in the task report that the node wiring itself is only verified on the robot (Task 6).

- [ ] **Step 7: Commit**

```bash
git add src/driver/realman_web_control/realman_web_control/pika_helper_client.py src/driver/realman_web_control/realman_web_control/input_mode_bridge.py src/driver/realman_web_control/realman_web_control/web_control_node.py src/driver/realman_web_control/test/test_pika_helper_client.py src/driver/realman_web_control/test/test_input_mode_bridge.py
git commit -m "feat(web-control): run the Pika switch from web_control_node"
```

---

### Task 5: Page toggle

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts` (card HTML ~line 180, element refs ~line 318, state ~line 414, render near `renderInputModeCard` ~line 664, message handler near `input_mode_list` ~line 1741)
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Rebuild: `src/driver/realman_web_control/realman_web_control/static/**`
- Test: `website/tests/web-control/web-control.spec.ts`

**Interfaces:**
- Consumes: event `pika_switch_state` `{available, phase, stack_running, input_age_ms: {l, r}, mode_lost, detail}`; sends `{"type":"pika_switch","request_id","enabled"}`.
- Produces: DOM ids `#pika-switch-row`, `#pika-switch`, `#pika-switch-state`.

- [ ] **Step 1: Write the failing Playwright test**

Append to `website/tests/web-control/web-control.spec.ts`:

```ts
test("Pika switch starts and stops Pika velocity control", async ({ page }) => {
  await page.goto("/");
  const sent = () => page.evaluate(() =>
    ((window as any).__webMessages as string[]).map((value) => JSON.parse(value))
      .filter((message) => message.type === "pika_switch"),
  );
  const pika = (overrides: Record<string, unknown>) => emitWebSocketEvent(page, {
    type: "pika_switch_state", available: true, phase: "off", stack_running: false,
    input_age_ms: { l: null, r: null }, mode_lost: false, detail: "", ...overrides,
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [{ id: "pikavelocity", label: "Pika / 速度控制", selectable: true }, { id: "none", label: "无输入", selectable: true }],
  });
  const row = page.locator("#pika-switch-row");
  const button = page.locator("#pika-switch");
  const state = page.locator("#pika-switch-state");

  await pika({ available: false });
  await expect(row).toBeHidden();

  await pika({});
  await expect(row).toBeVisible();
  await expect(button).toHaveText("启动 Pika");
  await expect(state).toHaveText("未启动");
  await button.click();
  expect((await sent()).at(-1)).toMatchObject({ type: "pika_switch", enabled: true });

  await pika({ phase: "waiting_input", stack_running: true, input_age_ms: { l: 20, r: null } });
  await expect(button).toBeDisabled();
  await expect(state).toHaveText("等待 Pika 数据 l✓ r…");

  await pika({ phase: "on", stack_running: true });
  await expect(button).toBeEnabled();
  await expect(button).toHaveText("关闭 Pika");
  await expect(state).toHaveText("运行中");
  await button.click();
  expect((await sent()).at(-1)).toMatchObject({ type: "pika_switch", enabled: false });

  await pika({ phase: "failed", stack_running: true, detail: "no /pika/r input for 30 s" });
  await expect(state).toHaveText("失败: no /pika/r input for 30 s");
  await expect(button).toHaveText("关闭 Pika");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd website && npm run build:web-control && npx playwright test --config ../config/web-control/playwright.config.mjs -g "Pika switch"`
Expected: FAIL (`#pika-switch-row` not found).

- [ ] **Step 3: Implement**

In the input-mode card HTML, inside `<div class="input-mode-body">` after the `input-mode-detail` div:

```html
<div id="pika-switch-row" class="pika-switch-row" hidden><span class="pika-switch-label">Pika 速度控制</span><span id="pika-switch-state" class="mini-state">未启动</span><button id="pika-switch" class="button ghost" type="button" title="启动：开启 Pika 并切到 Pika / 速度控制；关闭：先切到无输入，再关闭 Pika">启动 Pika</button></div>
```

Element refs after `inputModeRestart`:

```ts
const pikaSwitchRow = $("#pika-switch-row") as HTMLElement;
const pikaSwitchButton = $("#pika-switch") as HTMLButtonElement;
const pikaSwitchState = $("#pika-switch-state");
```

State after `let inputModeResultDetail = "";`:

```ts
type PikaSwitchState = {
  available: boolean; phase: string; stack_running: boolean;
  input_age_ms: { l: number | null; r: number | null }; mode_lost: boolean; detail: string;
};
let pikaSwitch: PikaSwitchState | undefined;
let pikaSwitchRequest = 0;
const PIKA_TRANSITIONS = new Set(["starting", "waiting_input", "selecting", "stopping"]);
```

Render function after `renderInputModeCard`:

```ts
function pikaSwitchText(state: PikaSwitchState) {
  const mark = (age: number | null) => (age !== null && age < 500 ? "✓" : "…");
  switch (state.phase) {
    case "starting": return "启动中";
    case "waiting_input": return `等待 Pika 数据 l${mark(state.input_age_ms.l)} r${mark(state.input_age_ms.r)}`;
    case "selecting": return "切换模式";
    case "on": return state.mode_lost ? "运行中（当前不是 Pika 模式）" : "运行中";
    case "stopping": return "关闭中";
    case "failed": return `失败: ${state.detail}`;
    default: return state.stack_running ? "Pika 已运行（未切换模式）" : "未启动";
  }
}
function pikaSwitchTurnsOn(state: PikaSwitchState) {
  return state.phase === "off" && !state.stack_running || state.phase === "failed" && !state.stack_running;
}
function renderPikaSwitch() {
  const state = pikaSwitch;
  pikaSwitchRow.hidden = !state?.available;
  if (!state?.available) return;
  pikaSwitchState.textContent = pikaSwitchText(state);
  pikaSwitchState.className = `mini-state pika-${state.phase}`;
  pikaSwitchButton.textContent = pikaSwitchTurnsOn(state) ? "启动 Pika" : "关闭 Pika";
  pikaSwitchButton.disabled = !canWrite() || PIKA_TRANSITIONS.has(state.phase);
}
pikaSwitchButton.addEventListener("click", () => {
  if (!pikaSwitch || pikaSwitchButton.disabled) return;
  pikaSwitchRequest += 1;
  send({ type: "pika_switch", request_id: `pika-switch-${pikaSwitchRequest}`, enabled: pikaSwitchTurnsOn(pikaSwitch) });
});
```

Message handler, next to the `input_mode_list` branch:

```ts
  } else if (message.type === "pika_switch_state") {
    pikaSwitch = {
      available: Boolean(message.available),
      phase: typeof message.phase === "string" ? message.phase : "off",
      stack_running: Boolean(message.stack_running),
      input_age_ms: {
        l: typeof message.input_age_ms?.l === "number" ? message.input_age_ms.l : null,
        r: typeof message.input_age_ms?.r === "number" ? message.input_age_ms.r : null,
      },
      mode_lost: Boolean(message.mode_lost),
      detail: typeof message.detail === "string" ? message.detail : "",
    };
    renderPikaSwitch();
```

Also call `renderPikaSwitch()` wherever `renderInputModeCard()` is called after a socket open/close or `read_only` change, so `canWrite()` changes are reflected: add it at the end of `renderInputModeCard()` itself (one place covers all callers).

`style.css` (next to the existing `.input-mode-row` rules; reuse existing tokens, no new colors):

```css
.pika-switch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.pika-switch-label { font-weight: 600; }
.pika-switch-row .mini-state { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
```

The failed/on colors come from `.mini-state.failed`/`.active` if they exist; if `grep -n "mini-state\." style.css` shows such classes, map `pika-failed` → reuse by setting the class to `mini-state failed` for phase `failed` and `mini-state active` for `on` instead of `pika-${phase}`.

- [ ] **Step 4: Build and run**

Run: `cd website && npm run build:web-control && npx playwright test --config ../config/web-control/playwright.config.mjs`
Expected: the new test and all existing web-control tests PASS. The build rewrites `static/index.html` and `static/assets/*` with new hashes; old asset files it replaced must be deleted (`git status` should show the old hashed files as deleted and new ones as untracked).

- [ ] **Step 5: Commit**

```bash
git add src/driver/realman_web_control/web/src/main.ts src/driver/realman_web_control/web/src/style.css src/driver/realman_web_control/realman_web_control/static website/tests/web-control/web-control.spec.ts
git commit -m "feat(web-control): Pika 速度控制 toggle in the input-mode card"
```

---

### Task 6: Docs, spec sync and robot check

**Files:**
- Modify: `website/docs/development/realman-web-control.md`, `website/docs/development/startup-entries.md`, `docs/superpowers/specs/2026-11-13-web-pika-switch-design.md`

- [ ] **Step 1: Developer manual**

In `realman-web-control.md`, add a section `## Pika 速度控制开关` after the section describing the "重启 Docker" button (`grep -n "重启 Docker" website/docs/development/realman-web-control.md`). Content (Chinese, matching the page's style):

- what the button does on / off (sequence from the spec "Goal");
- the phase list with their page texts (未启动 … 失败);
- that it needs the host helper (`./rm65 pika-helper install`, systemd user unit, `loginctl enable-linger` once) and the control tree running (otherwise `pikavelocity mode is not available; start the control tree first`);
- the `pika_switch:` config keys (copy the YAML block from Task 2) and `config/docker/pika_helper.json` keys;
- failure behaviour table from the spec "Error handling summary";
- realman_ts: Pika runs on PikaRemote, switch hidden (`helper_url: ""` there).

In `startup-entries.md`, add `./rm65 pika-helper install|uninstall|status|run` next to the `restart-helper` entry with one line on what it is.

- [ ] **Step 2: Sync the spec**

In the spec's config block, add `mode_switch_timeout_sec: 150.0  # Covers the entry MoveJ (pika_default_pose.timeout_sec 120).`, and in the `selecting` row replace "bridge error/timeout" with "`FAILED` for the requested mode, router lost, or `mode_switch_timeout_sec`". Note the user-unit file name `config/docker/realman-pika-helper.service` (already there).

- [ ] **Step 3: Docs build**

Run: `cd website && npm run build`
Expected: VitePress build succeeds (no dead links).

- [ ] **Step 4: Commit**

```bash
git add website/docs/development/realman-web-control.md website/docs/development/startup-entries.md docs/superpowers/specs/2026-11-13-web-pika-switch-design.md
git commit -m "docs(web-control): Pika 速度控制 switch and pika-helper entry"
```

- [ ] **Step 5: Robot check on SJDrealman (with the user, after PR review)**

Deployment follows the user's normal hot-deploy flow and needs their go-ahead; not part of the automated tasks. Checklist to hand over:

1. `./rm65 pika-helper install`; `curl -s 127.0.0.1:8783/status` → `{"running": false, ...}` while tmux `pika` is not running.
2. Deploy web_control (code + rebuilt static) and restart only the web_control container.
3. Start the control tree from :8765 (real motion), press 启动 Pika → phases 启动中 → 等待 Pika 数据 → 切换模式 → 运行中; arms go to the Pika default pose and follow.
4. Press 关闭 Pika → 关闭中 → 未启动; arms stop; `tmux has-session -t pika` fails.
5. With the right tracker unplugged: 启动 Pika → `失败: no /pika/r input for 30 s`, tmux `pika` still running; 关闭 Pika stops it.
```

## Self-review notes

- Spec coverage: helper (T1), config + protocol (T2), state machine incl. off order / failure-leaves-stack / busy / external changes / mode lost / node-start derivation via status poll (T3), node wiring + input ages + helper off-thread (T4), page (T5), docs + robot check (T6).
- Spec deviation recorded in T6 Step 2: added `mode_switch_timeout_sec` (the entry MoveJ means ACTIVE can arrive up to ~120 s after selection, longer than the bridge's 5 s override timeout).
