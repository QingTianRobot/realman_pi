"""The GPU host (compute.ssh_host) that runs clean/view/norm/train/eval/register for a console on another machine.

The console keeps its jobs; each such step runs on the compute host as
`python -m realman_training _remote-step <kind> <token>` with the same step code and that host's own config (the same
yaml, its own environment from env.sh). Paths cross as @data_root/… and @docker_data/… so each side expands them
under its own roots. Plain lines are the step's log; @@progress/@@result/@@failed/@@cancelled lines carry the rest.
After a step the console's data_root and docker_data are refreshed with rsync, without videos and checkpoint weights:
a metadata mirror that the web pages read as before.
"""

from __future__ import annotations

import importlib
import json
import os
import secrets
import shlex
import signal
import sys
import threading
import time
import traceback
from pathlib import Path

from .config import REPO_ROOT, ConsoleConfig, load_config
from .jobs import STEPS, JobCancelled, StepFailed, StepLog
from .openpi import RUN_DIR_NAME
from .runner import Runner

REMOTE_KINDS = ("clean", "view", "norm", "train", "eval", "register")
REMOTE_DATA_ROOT = "data/realman"
REMOTE_OPENPI = "src/openpi"
REMOTE_REPO = "src/realman_pi"
PACKAGE = "src/training/realman_training"
MIRROR_EXCLUDES = ("videos/", "*.mp4", "params/", "train_state/", "_console/", "*.partial/", f"{RUN_DIR_NAME}/")
PROGRESS, RESULT, FAILED, CANCELLED = "@@progress ", "@@result ", "@@failed ", "@@cancelled"
SSH_LOST = 255
RSYNC_IO_TIMEOUT = "--timeout=120"  # a stalled mirror rsync gives up instead of hanging the step
SYNC_JOIN_SEC = 300.0  # how long the final mirror refresh waits for a periodic one still running


def enabled(config: ConsoleConfig) -> bool:
    return bool(config.compute.ssh_host)


def ssh_base(config: ConsoleConfig) -> list[str]:
    c = config.compute
    argv = ["ssh"]
    if c.ssh_config:
        path = Path(c.ssh_config).expanduser()
        argv += ["-F", str(path if path.is_absolute() else REPO_ROOT / path)]
    return argv + ["-o", "BatchMode=yes", "-o", f"ConnectTimeout={c.connect_timeout_sec}",
                   "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=4"]


def ssh_argv(config: ConsoleConfig, command: str) -> list[str]:
    return [*ssh_base(config), config.compute.ssh_host, command]


def remote_path(config: ConsoleConfig, sub: str) -> str:
    return f"{config.compute.workdir.rstrip('/')}/{sub}"


def remote_python(config: ConsoleConfig, args: list[str]) -> str:
    q = shlex.quote
    script = (f"source {q(remote_path(config, 'env.sh'))} && cd {q(remote_path(config, REMOTE_REPO))} && "
              f"PYTHONPATH={q(remote_path(config, REMOTE_REPO + '/' + PACKAGE))} "
              f"exec {q(remote_path(config, REMOTE_OPENPI + '/.venv/bin/python'))} -m realman_training "
              + shlex.join(args))
    return shlex.join(["bash", "-c", script])


def _roots(config: ConsoleConfig) -> list[tuple[str, str]]:
    roots = [("@data_root", str(config.data_root)), ("@docker_data", str(config.openpi.docker_data))]
    return sorted(roots, key=lambda pair: -len(pair[1]))  # a root nested in the other is matched first


def _convert(value, swap):
    if isinstance(value, str):
        return swap(value)
    if isinstance(value, dict):
        return {key: _convert(item, swap) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_convert(item, swap) for item in value]
    return value


def to_wire(value, config: ConsoleConfig):
    roots = _roots(config)

    def swap(text: str) -> str:
        for tag, root in roots:
            if text == root or text.startswith(root + "/"):
                return tag + text[len(root):]
        return text

    return _convert(value, swap)


def from_wire(value, config: ConsoleConfig):
    roots = _roots(config)

    def swap(text: str) -> str:
        for tag, root in roots:
            if text == tag or text.startswith(tag + "/"):
                return root + text[len(tag):]
        return text

    return _convert(value, swap)


def rsync_from(config: ConsoleConfig, remote: str, local: Path, excludes=MIRROR_EXCLUDES) -> list[str]:
    return ["rsync", "-a", "--partial", RSYNC_IO_TIMEOUT, "-e", shlex.join(ssh_base(config)), *[f"--exclude={e}" for e in excludes],
            f"{config.compute.ssh_host}:{remote.rstrip('/')}/", f"{local}/"]


def sync_mirror(config: ConsoleConfig, runner: Runner, log) -> bool:
    """Refresh data_root and docker_data/{checkpoints,wandb} from the compute host, metadata only."""
    pairs = [
        (remote_path(config, REMOTE_DATA_ROOT), config.data_root),
        (remote_path(config, REMOTE_OPENPI + "/checkpoints"), config.openpi.docker_data / "checkpoints"),
        (remote_path(config, REMOTE_OPENPI + "/wandb"), config.openpi.docker_data / "wandb"),
    ]
    ok = True
    for remote, local in pairs:
        local.mkdir(parents=True, exist_ok=True)
        done = runner.run(rsync_from(config, remote, local))
        if done.returncode:
            ok = False
            log(f"mirror: {remote} not refreshed ({(done.stderr or done.stdout).strip()[-200:]})")
    # The web lists the RealMan configs found in the openpi checkout (catalog.openpi_configs).
    training = config.openpi.repo / "src" / "openpi" / "training"
    training.mkdir(parents=True, exist_ok=True)
    source = f"{config.compute.ssh_host}:{remote_path(config, REMOTE_OPENPI + '/src/openpi/training/config.py')}"
    done = runner.run(["rsync", "-a", RSYNC_IO_TIMEOUT, "-e", shlex.join(ssh_base(config)), source, f"{training}/"])
    if done.returncode:
        ok = False
        log(f"mirror: {source} not refreshed ({(done.stderr or done.stdout).strip()[-200:]})")
    return ok


def run_remote(kind: str, params: dict, log, runner: Runner | None = None, clock=time.monotonic,
               load=load_config) -> dict:
    runner = runner or Runner()
    config = load(params.get("config"))
    host = config.compute.ssh_host
    token = secrets.token_hex(4)
    wire = to_wire({key: value for key, value in params.items() if key != "config"}, config)
    state = {"result": None, "failed": None, "cancelled": False, "synced": clock(), "sync": None}

    def periodic_sync() -> None:
        """Refresh the mirror off the ssh reader thread, never two at a time."""
        running = state["sync"]
        if running is not None and running.is_alive():
            return
        state["synced"] = clock()
        state["sync"] = threading.Thread(target=sync_mirror, args=(config, runner, log), daemon=True,
                                         name=f"mirror-{token}")
        state["sync"].start()

    def on_line(line: str) -> None:
        if line.startswith(PROGRESS):
            try:
                data = json.loads(line[len(PROGRESS):])
                log.progress(data["done"], data.get("total"), data.get("text", ""))
            except (json.JSONDecodeError, KeyError, TypeError):
                log(line)
                return
            if clock() - state["synced"] >= config.compute.mirror_sync_sec:
                periodic_sync()
        elif line.startswith(RESULT):
            try:
                state["result"] = json.loads(line[len(RESULT):])
            except json.JSONDecodeError:
                log(line)
        elif line.startswith(FAILED):
            state["failed"] = line[len(FAILED):]
        elif line == CANCELLED:
            state["cancelled"] = True
        else:
            log(line)

    def stop_remote() -> None:
        stop = runner.run(ssh_argv(config, remote_python(config, ["_remote-cancel", token])))
        if stop.returncode:
            log(f"could not stop it on {host}: {(stop.stderr or stop.stdout).strip()[-300:]}")

    log(f"{kind} runs on {host}")
    try:
        code = runner.stream(ssh_argv(config, remote_python(config, ["_remote-step", kind, token])), on_line,
                             input=json.dumps(wire))
    except JobCancelled:
        log(f"cancelled: stopping {kind} on {host}")
        stop_remote()
        raise
    if state["sync"] is not None:
        state["sync"].join(SYNC_JOIN_SEC)
    sync_mirror(config, runner, log)
    if state["failed"] is not None:
        raise StepFailed(state["failed"])
    if state["cancelled"]:
        raise StepFailed(f"{kind} was cancelled on {host}")
    if state["result"] is None:
        if code == SSH_LOST:
            if kind != "train":  # training must survive a dropped link; any other step is stopped, best effort
                log(f"lost the connection: stopping {kind} on {host}")
                stop_remote()
            hint = "; training goes on there: start train again with attach" if kind == "train" else ""
            raise StepFailed(f"lost the connection to {host}{hint}")
        raise StepFailed(f"{kind} on {host} exited {code} without a result")
    return from_wire(state["result"], config)


def _step(kind: str):
    module, function = STEPS[kind].split(":")
    return getattr(importlib.import_module(module), function)


def _pid_file(config: ConsoleConfig, token: str) -> Path:
    return config.openpi.docker_data / RUN_DIR_NAME / f"step-{token}.pid"


def _cancel_file(config: ConsoleConfig, token: str) -> Path:
    """Written by a cancel that arrived before the step wrote its pid file; the step honours it at start."""
    return _pid_file(config, token).with_suffix(".cancel")


def remote_step_main(kind: str, token: str) -> int:
    """On the compute host: params (wire JSON) on stdin, the step's log on stdout, last line the outcome."""
    if kind not in REMOTE_KINDS:
        print(f"usage: realman-train _remote-step {{{','.join(REMOTE_KINDS)}}} <token>", file=sys.stderr)
        return 2
    config = load_config()
    params = from_wire(json.loads(sys.stdin.read() or "{}"), config)
    pid_file, cancel_file = _pid_file(config, token), _cancel_file(config, token)
    pid_file.parent.mkdir(parents=True, exist_ok=True)
    pid_file.write_text(str(os.getpid()), encoding="utf-8")

    def emit(text: str) -> None:
        try:
            print(text, flush=True)
        except OSError:
            pass  # the ssh session is gone: keep going (train keeps following its run)

    def on_signal(signum, frame):
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        raise JobCancelled()

    previous = {sig: signal.getsignal(sig) for sig in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP)}
    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    def progress(done, total, text) -> None:
        emit(PROGRESS + json.dumps({"done": done, "total": total, "text": text}, ensure_ascii=False))

    try:
        if cancel_file.exists():
            cancel_file.unlink(missing_ok=True)
            raise JobCancelled()
        result = _step(kind)(params, StepLog(emit, progress))
        emit(RESULT + json.dumps(to_wire(result, config), ensure_ascii=False))
        return 0
    except JobCancelled:
        emit(CANCELLED)
        return 1
    except StepFailed as error:
        emit(FAILED + str(error))
        return 1
    except Exception as error:  # noqa: BLE001 - every crash ends as a failed step
        for line in traceback.format_exc().splitlines():
            emit(line)
        emit(FAILED + f"{type(error).__name__}: {error}")
        return 1
    finally:
        pid_file.unlink(missing_ok=True)
        cancel_file.unlink(missing_ok=True)
        for sig, handler in previous.items():
            signal.signal(sig, handler)


def remote_cancel_main(token: str) -> int:
    config = load_config()
    pid_file, cancel_file = _pid_file(config, token), _cancel_file(config, token)

    def kill() -> bool:
        try:
            pid = int(pid_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return False
        try:
            os.kill(pid, signal.SIGTERM)
        except OSError as error:
            print(f"could not stop step {token} (pid {pid}): {error}", file=sys.stderr)
        return True

    if kill():
        return 0
    # The step has not written its pid yet: leave a marker it checks at start, then look once more in case the pid
    # file appeared in between (the step may already be past its marker check).
    cancel_file.parent.mkdir(parents=True, exist_ok=True)
    cancel_file.write_text("", encoding="utf-8")
    if kill():
        cancel_file.unlink(missing_ok=True)
        return 0
    print(f"step {token} not started yet: cancel recorded", file=sys.stderr)
    return 0
