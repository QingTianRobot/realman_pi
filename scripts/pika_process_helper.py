#!/usr/bin/env python3
"""Start and stop the Pika teleop stack for the :8765 Pika switch.

Runs on the robot host as the desktop user (systemd --user), because the Pika
stack is a native install that needs the user's tmux server, USB serial ports
and DISPLAY. Listens on localhost only; realman_web_control (network_mode: host)
calls it. Every command is a fixed argv from config/docker/pika_helper.json; the
HTTP request never carries a command. Only one action runs at a time.
`POST /recalibrate` (only when `libsurvive_config` is set) stops the stack,
renames the libsurvive calibration to `<name>.bak-<timestamp>` and starts again,
so libsurvive re-solves the base stations (the :8770 重标定 button).

Leftover processes: the Pika stack runs the official launch in its own process
group (pika_teleop's official_stack_supervisor), outside the tmux session. If
the supervisor dies before it has stopped that group, the locator and gripper
nodes keep running (and keep publishing /pika_pose_*), and a later start opens
the trackers a second time. So `leftover_processes` names those processes:
the helper counts them as running, a stop sends SIGINT/SIGTERM/SIGKILL to their
process groups after the session is gone, and a start clears them first. Only
processes of the helper's own user are considered.

Standard library only so it runs on the host's system Python.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import signal
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
DEFAULT_STATUS_TIMEOUT_SEC = 5.0
DEFAULT_LEFTOVER_GRACE_SEC = 5.0
LEFTOVER_TERM_WAIT_SEC = 1.0
# `tmux has-session` exits 1 when the session is missing; any other non-zero exit
# (124 timeout, 127 no tmux, ...) is no answer about the session.
NOT_RUNNING_EXIT = 1

Runner = Callable[[Sequence[str], float], tuple[int, str]]
# (pid, process group id, argv) of one process of the helper's user.
ProcessInfo = tuple[int, int, list[str]]
Scanner = Callable[[], list[ProcessInfo]]
GroupSignal = Callable[[int, int], None]


class Busy(Exception):
    pass


class NotConfigured(Exception):
    pass


class ActionFailed(Exception):
    def __init__(self, message: str, output_tail: list[str]) -> None:
        super().__init__(message)
        self.output_tail = output_tail


class StatusError(Exception):
    def __init__(self, exit_code: int, output: str) -> None:
        super().__init__(f"status failed with exit {exit_code}")
        self.exit_code = exit_code
        self.output = output


def validate_config(document: Any) -> dict[str, Any]:
    if not isinstance(document, dict):
        raise ValueError("pika helper config must be a JSON object")
    missing = [key for key in ("bind_host", "port", "timeout_sec", "stop_grace_sec", *COMMAND_KEYS) if key not in document]
    if missing:
        raise ValueError(f"pika helper config is missing {', '.join(missing)}")
    port = document["port"]
    if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ValueError("port must be from 1 through 65535")
    for key in ("timeout_sec", "stop_grace_sec", "status_timeout_sec", "leftover_grace_sec"):
        if key not in document:
            continue  # status_timeout_sec and leftover_grace_sec are optional
        value = document[key]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{key} must be positive")
    for key in COMMAND_KEYS:
        command = document[key]
        if not isinstance(command, list) or not command or not all(isinstance(part, str) and part for part in command):
            raise ValueError(f"{key} must be a non-empty argv list of strings")
    names = document.get("leftover_processes", [])
    if not isinstance(names, list) or not all(isinstance(name, str) and name and "/" not in name for name in names):
        raise ValueError("leftover_processes must be a list of process names (no paths)")
    if "libsurvive_config" in document:
        path = document["libsurvive_config"]
        if (not isinstance(path, str) or not (path.startswith("/") or path.startswith("~/"))
                or not path.endswith(".json")):
            raise ValueError("libsurvive_config must be an absolute or ~/ path to a .json file")
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


def scan_processes(proc: Path = Path("/proc")) -> list[ProcessInfo]:
    """Processes of this user from /proc (Linux); empty where /proc is missing."""
    uid = os.getuid()
    found: list[ProcessInfo] = []
    try:
        entries = list(proc.iterdir())
    except OSError:
        return found
    for entry in entries:
        if not entry.name.isdigit():
            continue
        try:
            if entry.stat().st_uid != uid:
                continue
            argv = [part.decode("utf-8", "replace") for part in (entry / "cmdline").read_bytes().split(b"\0") if part]
            # Field 5 of /proc/<pid>/stat; the command name in parentheses may contain spaces.
            pgid = int((entry / "stat").read_text(encoding="utf-8", errors="replace").rsplit(")", 1)[1].split()[2])
        except (OSError, ValueError, IndexError):
            continue  # exited meanwhile, or a kernel thread
        if argv:
            found.append((int(entry.name), pgid, argv))
    return found


def signal_group(pgid: int, signal_number: int) -> None:
    try:
        os.killpg(pgid, signal_number)
    except (ProcessLookupError, PermissionError):
        pass


def is_leftover(argv: Sequence[str], names: frozenset[str]) -> bool:
    """The executable is a listed name, or an interpreter (python*, ros2) runs one.

    Other commands that only mention a name (an editor, `strings <binary>`, a shell
    one-liner) do not count, so the helper never signals an operator's shell.
    """
    if not argv or not names:
        return False
    bases = [os.path.basename(part) for part in argv]
    if bases[0] in names:
        return True
    if bases[0].startswith("python") or bases[0] == "ros2":
        return any(base in names for base in bases[1:])
    return False


class PikaProcess:
    def __init__(self, config: dict[str, Any], runner: Runner = run_command,
                 sleep: Callable[[float], None] = time.sleep, home: str | None = None,
                 scan: Scanner = scan_processes, kill_group: GroupSignal = signal_group,
                 own_pgid: int | None = None, now: Callable[[], float] = time.time) -> None:
        home = home if home is not None else os.path.expanduser("~")
        # Only a leading "~/" is expanded; nothing else in the argv is interpreted.
        self.commands = {
            key: [home + part[1:] if part.startswith("~/") else part for part in config[key]]
            for key in COMMAND_KEYS
        }
        self.timeout_sec = float(config["timeout_sec"])
        self.stop_grace_sec = float(config["stop_grace_sec"])
        self.status_timeout_sec = float(config.get("status_timeout_sec", DEFAULT_STATUS_TIMEOUT_SEC))
        self.leftover_names = frozenset(config.get("leftover_processes", []))
        self.leftover_grace_sec = float(config.get("leftover_grace_sec", DEFAULT_LEFTOVER_GRACE_SEC))
        self._runner = runner
        self._sleep = sleep
        self._scan = scan
        self._kill_group = kill_group
        self._own_pgid = own_pgid if own_pgid is not None else os.getpgid(0)
        self._now = now
        calibration = config.get("libsurvive_config")
        self.calibration_path = (
            Path(home + calibration[1:] if calibration.startswith("~/") else calibration) if calibration else None
        )
        self._lock = threading.Lock()
        self._busy: str | None = None
        self._last: dict[str, Any] = {}

    def _run(self, key: str) -> tuple[int, str]:
        timeout = self.status_timeout_sec if key == "status" else self.timeout_sec
        return self._runner(self.commands[key], timeout)

    def _session(self) -> bool:
        exit_code, output = self._run("status")
        if exit_code not in (0, NOT_RUNNING_EXIT):
            raise StatusError(exit_code, output)
        return exit_code == 0

    def _leftover_groups(self) -> list[int]:
        if not self.leftover_names:
            return []
        groups = {pgid for _pid, pgid, argv in self._scan()
                  if pgid > 1 and pgid != self._own_pgid and is_leftover(argv, self.leftover_names)}
        return sorted(groups)

    def _running(self) -> bool:
        return self._session() or bool(self._leftover_groups())

    def _wait_leftovers(self, seconds: float) -> list[int]:
        waited = 0.0
        groups = self._leftover_groups()
        while groups and waited < seconds:
            self._sleep(STOP_POLL_SEC)
            waited += STOP_POLL_SEC
            groups = self._leftover_groups()
        return groups

    def _stop_leftovers(self, groups: list[int]) -> str:
        """SIGINT, then SIGTERM, then SIGKILL to each group; returns a log of what was sent."""
        lines = []
        for signal_number, wait in ((signal.SIGINT, self.leftover_grace_sec),
                                    (signal.SIGTERM, LEFTOVER_TERM_WAIT_SEC),
                                    (signal.SIGKILL, LEFTOVER_TERM_WAIT_SEC)):
            if not groups:
                break
            lines.append(f"{signal.Signals(signal_number).name} to leftover Pika process groups "
                         + " ".join(str(group) for group in groups))
            for group in groups:
                self._kill_group(group, signal_number)
            groups = self._wait_leftovers(wait)
        if groups:
            lines.append("leftover Pika processes still running: groups " + " ".join(str(g) for g in groups))
        return "\n".join(lines)

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

    def _start_locked(self) -> tuple[int, str]:
        if self._session():
            return 0, "already running"
        # Leftovers of an earlier stack hold the trackers; a second locator would crash-loop on them.
        note = ""
        groups = self._leftover_groups()
        if groups:
            note = self._stop_leftovers(groups) + "\n"
            if self._leftover_groups():
                return 1, note + "not started"
        exit_code, output = self._run("start")
        # Judge by the end state: a lost race ("duplicate session") still leaves Pika running.
        if exit_code != 0 and self._session():
            exit_code = 0
        return exit_code, note + output

    def _stop_locked(self) -> tuple[int, str]:
        if not self._running():
            return 0, "not running"
        exit_code, output = 0, ""
        if self._session():
            exit_code, output = self._run("stop")
            # Give the session time to stop the official group itself (its supervisor needs
            # SIGINT + SIGTERM timeouts), so leftovers are only the fallback.
            waited = 0.0
            while self._running() and waited < self.stop_grace_sec:
                self._sleep(STOP_POLL_SEC)
                waited += STOP_POLL_SEC
            if self._session():
                exit_code, output = self._run("kill")
                output = f"{output}\nkilled after {self.stop_grace_sec:g} s"
            if self._session():
                return exit_code or 1, f"{output}\npika session still running after kill"
        groups = self._leftover_groups()
        if groups:
            output = f"{output}\n{self._stop_leftovers(groups)}"
        # Judge by the end state, not by the last command's exit code.
        return ((exit_code or 1) if self._leftover_groups() else 0), output

    def _guarded(self, action: str, body: Callable[[], tuple[int, str]]) -> dict[str, Any]:
        self._begin(action)
        try:
            exit_code, output = body()
        except StatusError as error:
            return self._finish(error.exit_code, f"{error.output}\n{error}")
        except BaseException:
            self._finish_quietly()
            raise
        return self._finish(exit_code, output)

    def start(self) -> dict[str, Any]:
        return self._guarded("start", self._start_locked)

    def stop(self) -> dict[str, Any]:
        return self._guarded("stop", self._stop_locked)

    def _move_calibration(self) -> str | None:
        path = self.calibration_path
        assert path is not None
        if not path.exists():
            return None
        stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime(self._now()))
        backup = path.with_name(f"{path.name}.bak-{stamp}")
        suffix = 0
        while backup.exists():
            suffix += 1
            backup = path.with_name(f"{path.name}.bak-{stamp}-{suffix}")
        os.replace(path, backup)
        return str(backup)

    def _recalibrate_locked(self) -> tuple[int, str]:
        exit_code, output = self._stop_locked()
        if exit_code != 0 or self._running():
            return exit_code or 1, f"{output}\nnot recalibrated: Pika stack still running"
        try:
            backup = self._move_calibration()
        except OSError as error:
            return 1, f"{output}\nnot recalibrated: cannot move {self.calibration_path}: {error}"
        with self._lock:
            self._last["backup"] = backup
        note = (f"calibration moved to {backup}" if backup
                else f"no calibration at {self.calibration_path}; restarting only")
        start_exit, start_output = self._start_locked()
        return start_exit, f"{output}\n{note}\n{start_output}"

    def recalibrate(self) -> dict[str, Any]:
        """Stop, move the libsurvive calibration aside, start: libsurvive re-solves the base stations."""
        if self.calibration_path is None:
            raise NotConfigured("recalibrate not configured")
        return self._guarded("recalibrate", self._recalibrate_locked)

    def _finish_quietly(self) -> None:
        with self._lock:
            self._busy = None

    def status(self) -> dict[str, Any]:
        with self._lock:
            busy = self._busy is not None
            last = dict(self._last)
        # A status probe during an action is fine: tmux has-session and /proc are read-only.
        leftovers = self._leftover_groups()
        try:
            session = self._session()
        except StatusError as error:
            tail = _tail(error.output)
            return {"running": bool(leftovers), "session": False, "leftover_groups": leftovers,
                    "busy": busy, "last": last, "error": "; ".join([str(error), *tail[-3:]])}
        return {"running": session or bool(leftovers), "session": session, "leftover_groups": leftovers,
                "busy": busy, "last": last}


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
            actions = {"/start": process.start, "/stop": process.stop, "/recalibrate": process.recalibrate}
            action = actions.get(self.path)
            if action is None:
                self._reply(404, {"ok": False, "error": "not found"})
                return
            # The body is drained and ignored: the request cannot choose a command.
            self.rfile.read(min(int(self.headers.get("Content-Length", "0") or 0), 4096))
            try:
                self._reply(200, action())
            except NotConfigured as error:
                self._reply(404, {"ok": False, "error": str(error)})
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
