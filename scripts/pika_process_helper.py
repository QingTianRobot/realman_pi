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
