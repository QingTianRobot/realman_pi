#!/usr/bin/env python3
"""Start behavior trees from the :8765 Web page without a terminal.

Runs inside the realman_bringup_remote container (bt-start only exists there) and
listens on localhost only; realman_web_control proxies it. A start is exactly what
`./scripts/bt.sh <tree>` does through `docker exec`: bt-start with the tree file and
the XML's own arm/launch attributes. Stopping stays with the executor's ~/shutdown
service, so this process never kills anything.
"""

from __future__ import annotations

import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

import yaml

TREE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.xml$")
DEFAULT_CONFIG = "/opt/rm65_ws/config/ros/bt_launcher.yaml"
LOG_TAIL_LINES = 12


class LaunchRefused(Exception):
    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status


def load_config(path: str | Path) -> dict[str, Any]:
    document = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    section = document.get("bt_launcher")
    if not isinstance(section, dict):
        raise ValueError("bt_launcher config must contain a bt_launcher mapping")
    required = ("bind_host", "port", "tree_dir", "bt_start", "log_dir", "instance_lock", "env")
    missing = [key for key in required if key not in section]
    if missing:
        raise ValueError(f"bt_launcher config is missing {', '.join(missing)}")
    if not isinstance(section["env"], dict) or not all(
        isinstance(key, str) and isinstance(value, (str, int, float, bool))
        for key, value in section["env"].items()
    ):
        raise ValueError("bt_launcher.env must map names to scalar values")
    port = section["port"]
    if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ValueError("bt_launcher.port must be from 1 through 65535")
    return section


def lock_is_held(lock_path: Path) -> bool:
    """True while any bt-start (ours or `./rm65 bt` from a terminal) owns the instance lock."""
    try:
        handle = open(lock_path, "a")  # noqa: SIM115 - closed below after the probe
    except OSError:
        return False
    try:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        return True
    else:
        fcntl.flock(handle, fcntl.LOCK_UN)
        return False
    finally:
        handle.close()


def _env_value(value: str | int | float | bool) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


class Launcher:
    def __init__(self, config: dict[str, Any]) -> None:
        self.tree_dir = Path(config["tree_dir"])
        self.bt_start = str(config["bt_start"])
        self.log_dir = Path(config["log_dir"])
        self.instance_lock = Path(config["instance_lock"])
        self.env = {key: _env_value(value) for key, value in config["env"].items()}
        self._lock = threading.Lock()
        self._process: subprocess.Popen[bytes] | None = None
        self._last: dict[str, Any] = {}

    def start(self, tree: Any, dry_run: Any) -> dict[str, Any]:
        if not isinstance(tree, str) or not TREE_NAME.fullmatch(tree):
            raise LaunchRefused(400, "tree must be a simple .xml file name")
        if not isinstance(dry_run, bool):
            raise LaunchRefused(400, "dry_run must be true or false")
        tree_file = self.tree_dir / tree
        if not tree_file.is_file():
            raise LaunchRefused(404, f"behavior-tree XML not found: {tree}")
        with self._lock:
            if (self._process and self._process.poll() is None) or lock_is_held(self.instance_lock):
                raise LaunchRefused(409, "a behavior tree is already running; stop it first")
            self.log_dir.mkdir(parents=True, exist_ok=True)
            stamp = time.strftime("%Y%m%d_%H%M%S", time.gmtime())
            log_path = self.log_dir / f"{stamp}_{tree[:-4]}.log"
            env = dict(os.environ)
            env.update(self.env)
            env.update({
                "BT_AUTOSTART": "true",
                "BT_TREE_FILE": str(tree_file),
                "REALMAN_BT_DRY_RUN": "true" if dry_run else "false",
            })
            with open(log_path, "wb") as log:
                # Own session: the tree outlives this launcher's restarts like a terminal run does.
                self._process = subprocess.Popen(  # noqa: S603 - fixed executable, validated tree name
                    [self.bt_start], env=env, stdin=subprocess.DEVNULL, stdout=log,
                    stderr=subprocess.STDOUT, start_new_session=True,
                )
            self._last = {"tree": tree, "dry_run": dry_run, "log": str(log_path),
                          "started_at_ms": int(time.time() * 1000), "pid": self._process.pid}
            return {"ok": True, **self._last}

    def status(self) -> dict[str, Any]:
        with self._lock:
            process = self._process
            exit_code = process.poll() if process else None
            running = bool(process and exit_code is None)
            result: dict[str, Any] = {
                "running": running or lock_is_held(self.instance_lock),
                "launched_here": running,
                **self._last,
            }
            if process and exit_code is not None:
                result["exit_code"] = exit_code
                result["log_tail"] = _tail(Path(self._last["log"]), LOG_TAIL_LINES)
            return result


def _tail(path: Path, lines: int) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []
    return [re.sub(r"\x1b\[[0-9;]*m", "", line) for line in text.splitlines()[-lines:]]


def make_handler(launcher: Launcher) -> type[BaseHTTPRequestHandler]:
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
                self._reply(200, launcher.status())
            elif self.path == "/health":
                self._reply(200, {"ok": True})
            else:
                self._reply(404, {"ok": False, "error": "not found"})

        def do_POST(self) -> None:  # noqa: N802 - http.server API
            if self.path != "/start":
                self._reply(404, {"ok": False, "error": "not found"})
                return
            try:
                length = min(int(self.headers.get("Content-Length", "0")), 4096)
                request = json.loads(self.rfile.read(length) or b"{}")
                if not isinstance(request, dict):
                    raise LaunchRefused(400, "request body must be a JSON object")
                self._reply(200, launcher.start(request.get("tree"), request.get("dry_run")))
            except LaunchRefused as error:
                self._reply(error.status, {"ok": False, "error": str(error)})
            except (ValueError, OSError) as error:
                self._reply(400 if isinstance(error, ValueError) else 500, {"ok": False, "error": str(error)})

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - http.server API
            sys.stderr.write(f"[bt_launcher] {self.address_string()} {format % args}\n")

    return Handler


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default=os.environ.get("BT_LAUNCHER_CONFIG", DEFAULT_CONFIG))
    # Started from a ROS launch file, so ignore the --ros-args it appends.
    args, _ = parser.parse_known_args(argv)
    config = load_config(args.config)
    server = ThreadingHTTPServer((config["bind_host"], config["port"]), make_handler(Launcher(config)))
    print(f"[bt_launcher] listening on http://{config['bind_host']}:{config['port']}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
