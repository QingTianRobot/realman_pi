"""The GPU host (compute.ssh_host) that runs clean/view/norm/train/eval/register for a console on another machine.

The console keeps its jobs; each such step runs on the compute host as
`python -m realman_training _remote-step <kind> <token>` with the same step code and that host's own config (the same
yaml, its own environment from env.sh). Paths cross as @data_root/… and @docker_data/… so each side expands them
under its own roots. Plain lines are the step's log; @@progress/@@result/@@failed/@@cancelled lines carry the rest.
After a step the console's data_root and docker_data are refreshed with rsync, without videos and checkpoint weights:
a metadata mirror that the web pages read as before.
"""

from __future__ import annotations

import datetime
import functools
import importlib
import json
import re
import os
import secrets
import shlex
import shutil
import signal
import subprocess
import sys
import threading
import time
import traceback
from pathlib import Path

from .config import REPO_ROOT, ConsoleConfig, load_config
from .episode_tags import FILE_NAME as TAGS_FILE
from .jobs import STEPS, JobCancelled, StepFailed, StepLog
from .openpi import RUN_DIR_NAME
from .runner import CommandFailed, Runner

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


def checkout_root(config: ConsoleConfig) -> Path:
    """The repo checkout that holds the loaded config file (<repo>/config/training/<file>), else this package's repo.
    In the console image the package lives at /opt/realman_pi while the checkout is bind-mounted at TRAINING_REPO."""
    source = config.source
    if source is not None and source.parent.name == "training" and source.parent.parent.name == "config":
        return source.parents[2]
    return REPO_ROOT


def ssh_base(config: ConsoleConfig) -> list[str]:
    c = config.compute
    # The compute host's rules: never forward this host's temp dirs (its ssh config has SendEnv TMPDIR TEMP TMP),
    # accept known host keys only.
    argv = ["env", "-u", "TMPDIR", "-u", "TEMP", "-u", "TMP", "ssh"]
    if c.ssh_config:
        path = Path(c.ssh_config).expanduser()
        argv += ["-F", str(path if path.is_absolute() else checkout_root(config) / path)]
    return argv + ["-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=yes", "-o", f"ConnectTimeout={c.connect_timeout_sec}",
                   "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=4"]


def in_workdir(config: ConsoleConfig, command: str) -> str:
    """Every remote command starts by entering the work dir and stops if that fails (the compute host's rule)."""
    workdir = config.compute.workdir
    return f"cd {shlex.quote(workdir)} && {command}" if workdir else command


def ssh_argv(config: ConsoleConfig, command: str) -> list[str]:
    return [*ssh_base(config), config.compute.ssh_host, in_workdir(config, command)]


def rsync_ssh(config: ConsoleConfig) -> list[str]:
    """rsync's transport options: the same ssh, and its remote rsync started behind the work-dir guard."""
    return ["-e", shlex.join(ssh_base(config)), f"--rsync-path={in_workdir(config, 'rsync')}"]


def remote_path(config: ConsoleConfig, sub: str) -> str:
    return f"{config.compute.workdir.rstrip('/')}/{sub}"


def remote_python(config: ConsoleConfig, args: list[str]) -> str:
    q = shlex.quote
    script = (f"source {q(remote_path(config, 'env.sh'))} && cd {q(remote_path(config, REMOTE_REPO))} && "
              f"PYTHONPATH={q(remote_path(config, REMOTE_REPO + '/' + PACKAGE))} "
              f"exec {q(remote_path(config, REMOTE_OPENPI + '/.venv/bin/python'))} -m realman_training "
              + shlex.join(args))
    return shlex.join(["bash", "-c", script])


def local_path(config: ConsoleConfig, text: str) -> str:
    """A path the compute host wrote into a mirrored JSON file (<workdir>/data/realman/…, <workdir>/src/openpi/…) as
    the same file in this console's mirror (data_root/…, docker_data/…). Whole path components only; unchanged
    without a compute host or when no compute root prefixes it."""
    if not isinstance(text, str) or not enabled(config):
        return text
    pairs = sorted([(remote_path(config, REMOTE_DATA_ROOT), str(config.data_root)),
                    (remote_path(config, REMOTE_OPENPI), str(config.openpi.docker_data))],
                   key=lambda pair: -len(pair[0]))
    for remote, local in pairs:
        if text == remote or text.startswith(remote + "/"):
            return local + text[len(remote):]
    return text


def local_text(config: ConsoleConfig, text: str) -> str:
    """local_path for every compute-host path inside a message (a remote step's failure), so the operator reads
    this console's paths. Matches whole path components only."""
    if not enabled(config):
        return text
    pairs = sorted([(remote_path(config, REMOTE_DATA_ROOT), str(config.data_root)),
                    (remote_path(config, REMOTE_OPENPI), str(config.openpi.docker_data))],
                   key=lambda pair: -len(pair[0]))
    for remote, local in pairs:
        text = re.sub(r"(?<![\w./-])" + re.escape(remote) + r"(?![\w.-])", lambda _m, local=local: local, text)
    return text


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
    return ["rsync", "-a", "--partial", RSYNC_IO_TIMEOUT, *rsync_ssh(config), *[f"--exclude={e}" for e in excludes],
            f"{config.compute.ssh_host}:{remote.rstrip('/')}/", f"{local}/"]


def _mirror_dir(path: Path, log) -> bool:
    """Create a mirror directory; a failure (read-only mount, a file in the way) is logged, not raised."""
    try:
        path.mkdir(parents=True, exist_ok=True)
        return True
    except OSError as error:
        log(f"mirror: cannot create {path} ({error})")
        return False


def sync_mirror(config: ConsoleConfig, runner: Runner, log) -> bool:
    """Refresh data_root and docker_data/{checkpoints,wandb} from the compute host, metadata only."""
    pairs = [
        (remote_path(config, REMOTE_DATA_ROOT), config.data_root),
        (remote_path(config, REMOTE_OPENPI + "/checkpoints"), config.openpi.docker_data / "checkpoints"),
        (remote_path(config, REMOTE_OPENPI + "/wandb"), config.openpi.docker_data / "wandb"),
    ]
    ok = True
    for remote, local in pairs:
        if not _mirror_dir(local, log):
            ok = False
            continue
        done = runner.run(rsync_from(config, remote, local))
        if done.returncode:
            ok = False
            log(f"mirror: {remote} not refreshed ({(done.stderr or done.stdout).strip()[-200:]})")
    # The web lists the RealMan configs found in the openpi checkout (catalog.openpi_configs).
    training = config.openpi.repo / "src" / "openpi" / "training"
    if not _mirror_dir(training, log):
        return False
    source = f"{config.compute.ssh_host}:{remote_path(config, REMOTE_OPENPI + '/src/openpi/training/config.py')}"
    done = runner.run(["rsync", "-a", RSYNC_IO_TIMEOUT, *rsync_ssh(config), source, f"{training}/"])
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
        raise StepFailed(local_text(config, state["failed"]))
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


def orphan_grace_sec(config: ConsoleConfig) -> float:
    """How long a train follower whose ssh link broke stays cancellable before it leaves: long enough for the
    console's _remote-cancel (one ssh connect, retried once) to reach it."""
    return 2 * config.compute.connect_timeout_sec + 30


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

    state = {"cancelling": False, "orphaned": False, "timer": None}

    def leave() -> None:
        """The orphaned train follower goes away (the training's own setsid group keeps running and `train --attach`
        follows it again) unless a cancel arrived meanwhile: then the cancel path stops and removes the run."""
        if state["cancelling"]:
            return
        pid_file.unlink(missing_ok=True)
        cancel_file.unlink(missing_ok=True)
        os._exit(0)

    def emit(text: str) -> None:
        if state["orphaned"]:
            return
        try:
            print(text, flush=True)
        except OSError:
            if kind != "train":
                return  # any other step finishes its work; the console stops it, best effort
            # The ssh session is gone, maybe because the job is being cancelled (JobStore.cancel kills the local ssh
            # client before _remote-cancel arrives). Stay cancellable (pid file kept) for a grace period, then leave
            # so a later attach is the only follower of the run.
            state["orphaned"] = True
            timer = threading.Timer(orphan_grace_sec(config), leave)
            timer.daemon = True
            state["timer"] = timer
            timer.start()

    def on_signal(signum, frame):
        state["cancelling"] = True
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
        state["cancelling"] = True
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
        if state["timer"] is not None:
            state["timer"].cancel()
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


def push_dataset(config: ConsoleConfig, runner: Runner, log, target: Path) -> str:
    """Copy a pulled dataset to the compute host (rsync to <name>.partial, then rename), then drop the local videos:
    the console keeps meta and parquet only, like the rest of its mirror."""
    rel = Path(target).relative_to(config.data_root).as_posix()
    remote = remote_path(config, f"{REMOTE_DATA_ROOT}/{rel}")
    host = config.compute.ssh_host
    q = shlex.quote
    if runner.run(ssh_argv(config, f"test ! -e {q(remote)}")).returncode:
        raise StepFailed(f"{remote} exists on {host}: pick another name (nothing is overwritten)")
    log(f"copying {target.name} to {host}")
    # a .partial left by an earlier failed copy (only ever under our workdir's data/realman) is stale: start clean
    runner.check(ssh_argv(config, f"rm -rf {q(remote + '.partial')}"))
    runner.check(["rsync", "-a", "--partial", RSYNC_IO_TIMEOUT, *rsync_ssh(config), f"{target}/",
                  f"{host}:{remote}.partial/"])
    runner.check(ssh_argv(config, f"mv {q(remote + '.partial')} {q(remote)}"))
    for videos in Path(target).glob("*/videos"):
        shutil.rmtree(videos)
    log(f"on {host}: {remote}")
    return remote


def pull_and_push(params: dict, log, runner: Runner | None = None) -> dict:
    from .steps import pull

    runner = runner or Runner()
    config = load_config(params.get("config"))
    root = Path(config.data_root).expanduser().absolute()
    if not Path(params["target"]).expanduser().absolute().is_relative_to(root):
        raise StepFailed(f"{params['target']} is outside data_root {root}: the compute host mirrors data_root only")
    result = pull.run(params, log, runner)
    target = Path(result["target"])
    try:
        remote = push_dataset(config, runner, log, target)
    except BaseException as error:
        # never leave a half state (nor a full local copy, videos included, on a tight disk): a retry simply pulls
        # again from the recorder
        shutil.rmtree(target, ignore_errors=True)
        if not isinstance(error, (CommandFailed, StepFailed, OSError)):
            raise  # a cancel stays a cancel
        raise StepFailed(f"pulled {result.get('episodes', '?')} episodes but the copy to {config.compute.ssh_host} "
                         f"failed: {error}; the local copy was removed — run the pull again") from None
    sync_mirror(config, runner, log)
    return {**result, "compute_path": remote}


def refresh_tags_and_push(step, params: dict, log, runner: Runner | None = None) -> dict:
    """tags refresh runs here (it reads the robot's tag index), then its episode_tags.json goes to the same dataset
    on the compute host: the next mirror sync copies the compute host's data_root over this one."""
    runner = runner or Runner()
    config = load_config(params.get("config"))
    result = step(params, log, runner)
    root = Path(result["path"]).resolve()
    data_root = Path(config.data_root).expanduser().resolve()
    host = config.compute.ssh_host
    if not root.is_relative_to(data_root):
        log(f"{root} is outside data_root {data_root}: not copied to {host}")
        return result
    remote_dir = remote_path(config, f"{REMOTE_DATA_ROOT}/{root.relative_to(data_root).as_posix()}")
    remote = f"{remote_dir}/{TAGS_FILE}"
    there = runner.run(ssh_argv(config, f"test -d {shlex.quote(remote_dir)}"))
    if there.returncode == 1:  # `test` says no; any other code is ssh failing
        log(f"{root.name} is not on {host}; tags kept here only")
        return result
    if there.returncode:
        raise StepFailed(f"tags written here, but could not check {host}:{remote_dir} "
                         f"({(there.stderr or there.stdout).strip()[-300:] or f'exit {there.returncode}'}); refresh again")
    done = runner.run(["rsync", "-a", RSYNC_IO_TIMEOUT, *rsync_ssh(config), str(root / TAGS_FILE),
                       f"{host}:{remote}"])
    if done.returncode:
        raise StepFailed(f"tags written here but not copied to {host}:{remote} "
                         f"({(done.stderr or done.stdout).strip()[-300:]}); the next mirror sync will undo them — "
                         "refresh again")
    log(f"copied to {host}:{remote}")
    return result


def route(kind: str, target: str, step, params: dict):
    """The callable run_job runs: the step itself, or its remote form when this console has a compute host.
    Only the real step targets are rerouted (tests and fakes pass their own)."""
    if target != STEPS.get(kind) or (kind not in REMOTE_KINDS and kind not in ("pull", "tags_refresh")):
        return step
    if not enabled(load_config(params.get("config"))):
        return step
    if kind == "tags_refresh":
        return functools.partial(refresh_tags_and_push, step)
    return pull_and_push if kind == "pull" else functools.partial(run_remote, kind)


SETUP_SCRIPT = Path(__file__).resolve().parent / "remote_scripts" / "setup_uv_host.sh"


# One plain shell query (no remote package or venv needed): GPUs, memory, the work dir's disk, load and cores.
# Other users' GPU processes are not listed (the compute host's rules: read nothing unrelated).
HOST_QUERY = ("{ nvidia-smi --query-gpu=index,uuid,name,memory.used,memory.total,utilization.gpu "
              "--format=csv,noheader,nounits 2>&1 || echo @@gpu-error; }; echo @@mem; free -m; echo @@disk; df -Pk .; "
              "echo @@load; cat /proc/loadavg; nproc")


def _int(text: str) -> int | None:
    try:
        return int(float(text.strip()))
    except (ValueError, AttributeError):
        return None


def parse_host_resources(text: str, busy_mib: int) -> tuple[list[dict], dict | None, str | None]:
    sections: dict[str, list[str]] = {"gpu": []}
    current = "gpu"
    for line in text.splitlines():
        if line.startswith("@@") and line[2:] in ("gpu-error", "mem", "disk", "load"):
            current = line[2:]
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)
    gpus, error = [], None
    if "gpu-error" in sections or not sections["gpu"]:
        error = "nvidia-smi: " + (" ".join(sections["gpu"]).strip()[-200:] or "no answer")
    else:
        for line in sections["gpu"]:
            parts = [p.strip() for p in line.split(",")]
            if len(parts) < 6 or _int(parts[0]) is None:
                continue
            used = _int(parts[3])
            gpus.append({"index": _int(parts[0]), "name": parts[2], "used_mib": used, "total_mib": _int(parts[4]),
                         "util_pct": _int(parts[5]), "busy": (used or 0) > busy_mib, "users": []})
    host: dict = {}
    for line in sections.get("mem", []):
        fields = line.split()
        if fields[:1] == ["Mem:"] and len(fields) >= 7:
            host.update(mem_total_mib=_int(fields[1]), mem_used_mib=_int(fields[2]), mem_available_mib=_int(fields[6]))
    disk = [line.split() for line in sections.get("disk", []) if line.strip()]
    if len(disk) >= 2 and len(disk[-1]) >= 4:
        host.update(disk_total_kib=_int(disk[-1][1]), disk_used_kib=_int(disk[-1][2]), disk_avail_kib=_int(disk[-1][3]))
    load = [line.split() for line in sections.get("load", []) if line.strip()]
    if load:
        try:
            host["load1"] = float(load[0][0])
        except (ValueError, IndexError):
            pass
        if len(load) > 1:
            host["cores"] = _int(load[1][0])
    return gpus, (host or None), error


def host_resources(config: ConsoleConfig, runner: Runner) -> dict:
    """The compute host's GPUs and machine resources for the web panel (gpus.query's shape plus host, host_name,
    at). Never raises."""
    name = config.compute.ssh_host
    base = {"available": False, "busy_mib": config.openpi.gpu_busy_mib, "gpus": [], "host": None, "host_name": name,
            "at": datetime.datetime.now().astimezone().isoformat(timespec="seconds")}
    try:
        done = runner.run(ssh_argv(config, HOST_QUERY), timeout=30)
    except (OSError, subprocess.TimeoutExpired) as error:
        return {**base, "error": f"{name}: {str(error)[-300:] or type(error).__name__}"}
    if done.returncode:
        return {**base, "error": f"{name}: {(done.stderr or done.stdout).strip()[-300:] or f'exit {done.returncode}'}"}
    gpus, host, error = parse_host_resources(done.stdout, config.openpi.gpu_busy_mib)
    result = {**base, "available": bool(gpus), "gpus": gpus, "host": host}
    if error or host is None:
        result["error"] = f"{name}: {error or 'no answer'}"
    return result


def gpu_query(config: ConsoleConfig, runner: Runner) -> dict:
    """The web GPU panel on a console with a compute host: host_resources (no remote package needed)."""
    return host_resources(config, runner)


def sync_code(config: ConsoleConfig, runner: Runner, log) -> None:
    """This package (the code actually running) and the config checkout's config/training to <workdir>/src/realman_pi
    (the remote side of _remote-step), then a smoke run of the package there."""
    ssh = rsync_ssh(config)
    host = config.compute.ssh_host
    base = remote_path(config, REMOTE_REPO)
    dirs = shlex.join([f"{base}/{PACKAGE}", f"{base}/config/training"])
    runner.check(ssh_argv(config, f"mkdir -p {dirs}"))
    runner.check(["rsync", "-a", "--delete", RSYNC_IO_TIMEOUT, *ssh, "--exclude=/test/", "--exclude=/web/",
                  "--exclude=__pycache__/", "--exclude=/realman_training/static/", f"{REPO_ROOT / PACKAGE}/", f"{host}:{base}/{PACKAGE}/"])
    runner.check(["rsync", "-a", RSYNC_IO_TIMEOUT, *ssh, f"{checkout_root(config) / 'config' / 'training'}/",
                  f"{host}:{base}/config/training/"])
    log(f"code synced to {host}:{base}")
    # The package must import and load its config in the compute host's venv (yaml, numpy, a broken file...).
    runner.check(ssh_argv(config, remote_python(config, ["_gpus"])))
    log("remote package ok")


def setup_host(config: ConsoleConfig, runner: Runner, log, openpi_ref: str = "main") -> None:
    """Run remote_scripts/setup_uv_host.sh on the compute host (streamed over ssh stdin; idempotent there)."""
    argv = ssh_argv(config, shlex.join(["bash", "-s", "--", config.compute.workdir, openpi_ref]))
    code = runner.stream(argv, log, input=SETUP_SCRIPT.read_text(encoding="utf-8"))
    if code:
        raise StepFailed(f"setup on {config.compute.ssh_host} exited {code}")
