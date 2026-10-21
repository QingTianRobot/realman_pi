#!/usr/bin/env python3
"""Restart whitelisted Compose services for the :8765 Web page.

Runs on the robot host (not in a container): the containers have no Docker
socket, and giving them one would hand them root on the host. Listens on
localhost only; realman_web_control (network_mode: host) proxies it. A restart is
`docker compose restart <service>` against the repo-root docker-compose.yml,
exactly what an operator would type, so the container keeps its current image
and environment. Only services listed in config/docker/restart_helper.json are
accepted and only one restart runs at a time.

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
DEFAULT_CONFIG = ROOT / "config" / "docker" / "restart_helper.json"
OUTPUT_TAIL_LINES = 12

Runner = Callable[[Sequence[str], float], tuple[int, str]]


class RestartRefused(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status


def load_config(path: str | Path) -> dict[str, Any]:
    document = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        raise ValueError("restart helper config must be a JSON object")
    missing = [key for key in ("bind_host", "port", "services", "timeout_sec") if key not in document]
    if missing:
        raise ValueError(f"restart helper config is missing {', '.join(missing)}")
    port = document["port"]
    if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ValueError("port must be from 1 through 65535")
    services = document["services"]
    if not isinstance(services, list) or not services or not all(isinstance(item, str) and item for item in services):
        raise ValueError("services must list one or more Compose service names")
    timeout = document["timeout_sec"]
    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or timeout <= 0:
        raise ValueError("timeout_sec must be positive")
    return document


def run_command(command: Sequence[str], timeout_sec: float) -> tuple[int, str]:
    try:
        completed = subprocess.run(  # noqa: S603 - fixed docker argv, whitelisted service
            list(command), cwd=ROOT, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT, timeout=timeout_sec, check=False,
        )
    except subprocess.TimeoutExpired as error:
        output = error.output.decode("utf-8", "replace") if isinstance(error.output, bytes) else ""
        return 124, f"{output}\ntimed out after {timeout_sec:g} s"
    except OSError as error:
        return 127, str(error)
    return completed.returncode, completed.stdout.decode("utf-8", "replace")


class Restarter:
    def __init__(self, config: dict[str, Any], runner: Runner = run_command,
                 compose_file: Path = ROOT / "docker-compose.yml") -> None:
        self.services = tuple(config["services"])
        self.timeout_sec = float(config["timeout_sec"])
        self.compose_file = compose_file
        self._runner = runner
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._last: dict[str, Any] = {}

    def restart(self, service: Any) -> dict[str, Any]:
        if not isinstance(service, str) or service not in self.services:
            raise RestartRefused(400, f"service must be one of: {', '.join(self.services)}")
        with self._lock:
            if self._thread is not None and self._thread.is_alive():
                raise RestartRefused(409, f"{self._last.get('service')} is already restarting")
            self._last = {"service": service, "started_at_ms": int(time.time() * 1000)}
            self._thread = threading.Thread(target=self._run, args=(service,), daemon=True)
            self._thread.start()
            return {"ok": True, **self._last}

    def _run(self, service: str) -> None:
        command = ["docker", "compose", "-f", str(self.compose_file), "restart", service]
        exit_code, output = self._runner(command, self.timeout_sec)
        lines = [line for line in output.splitlines() if line.strip()][-OUTPUT_TAIL_LINES:]
        with self._lock:
            self._last.update({"finished_at_ms": int(time.time() * 1000), "exit_code": exit_code, "output_tail": lines})
        print(f"[restart_helper] restart {service} -> exit {exit_code}", flush=True)

    def status(self) -> dict[str, Any]:
        with self._lock:
            running = self._thread is not None and self._thread.is_alive()
            return {"services": list(self.services), "restarting": running, **self._last}

    def wait(self, timeout_sec: float | None = None) -> None:
        thread = self._thread
        if thread is not None:
            thread.join(timeout_sec)


def make_handler(restarter: Restarter) -> type[BaseHTTPRequestHandler]:
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
                self._reply(200, restarter.status())
            elif self.path == "/health":
                self._reply(200, {"ok": True})
            else:
                self._reply(404, {"ok": False, "error": "not found"})

        def do_POST(self) -> None:  # noqa: N802 - http.server API
            if self.path != "/restart":
                self._reply(404, {"ok": False, "error": "not found"})
                return
            try:
                length = min(int(self.headers.get("Content-Length", "0")), 4096)
                request = json.loads(self.rfile.read(length) or b"{}")
                if not isinstance(request, dict):
                    raise RestartRefused(400, "request body must be a JSON object")
                self._reply(200, restarter.restart(request.get("service")))
            except RestartRefused as error:
                self._reply(error.status, {"ok": False, "error": str(error)})
            except ValueError as error:
                self._reply(400, {"ok": False, "error": str(error)})

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - http.server API
            sys.stderr.write(f"[restart_helper] {self.address_string()} {format % args}\n")

    return Handler


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--config", default=os.environ.get("REALMAN_RESTART_HELPER_CONFIG", str(DEFAULT_CONFIG)))
    args = parser.parse_args(argv)
    config = load_config(args.config)
    if config["bind_host"] not in ("127.0.0.1", "localhost", "::1"):
        raise SystemExit("restart helper must bind to localhost only")
    server = ThreadingHTTPServer((config["bind_host"], config["port"]), make_handler(Restarter(config)))
    print(f"[restart_helper] listening on http://{config['bind_host']}:{config['port']} "
          f"for {', '.join(config['services'])}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
