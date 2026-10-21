"""Start an openpi training run in its own detached container and follow it to the end.

Container `<project>-train-<exp>` (docker compose run -d on the openpi repo's compose files + the console overlay),
log in openpi-docker-data/wandb/<exp>.log as before. GPUs held by someone else are refused; norm stats are computed
first when missing. Cancelling the job stops the container. `attach` follows a container that is already running
(after the job process itself was lost).
"""

from __future__ import annotations

import csv
import datetime
import re
import shlex
import time
from pathlib import Path

from ..config import load_config
from ..jobs import JobCancelled, StepFailed, now, write_json
from ..openpi import (
    Compose,
    busy_gpus,
    check_holdout,
    check_name,
    config_info,
    init_weights,
    norm_stats_path,
    parse_gpus,
    repo_commit,
    require_view,
    run_dir,
    short_gpus,
    train_env,
)
from ..runner import Runner, compact
from . import norm

STEP_LINE = re.compile(r"Step (\d+): (.*?)(?: \(\d+:train\.py:\d+\))?$")


def _normalize_docker_time(raw: str) -> str:
    """Convert Docker's nanosecond Z timestamp (2026-10-20T08:12:34.123456789Z) to a local isoformat string.

    Python 3.10 fromisoformat cannot parse nanoseconds or a bare 'Z' suffix, so we strip them first.
    Falls back to the raw string on any parse error.
    """
    try:
        s = raw.rstrip("Z")
        # Drop the sub-second part if present
        if "." in s:
            s = s[:s.index(".")]
        parsed = datetime.datetime.fromisoformat(s).replace(tzinfo=datetime.timezone.utc)
        return parsed.astimezone().isoformat(timespec="seconds")
    except (ValueError, OverflowError):
        return raw


def container_name(project: str, exp: str) -> str:
    return f"{project}-train-{exp}"


def parse_metrics(text: str) -> list[dict]:
    rows = []
    for line in text.splitlines():
        match = STEP_LINE.search(compact(line))
        if not match:
            continue
        row: dict = {"step": int(match.group(1))}
        for pair in match.group(2).split(", "):
            key, _, value = pair.partition("=")
            try:
                v = float(value)
                if v == v and v != float("inf") and v != float("-inf"):
                    row[key.strip()] = v
            except ValueError:
                pass
        rows.append(row)
    return rows


def _follow(runner: Runner, container: str, log_path: Path, total: int, log, poll: float, sleep, offset: int = 0) -> int | None:
    pending, last = "", None
    while True:
        running = runner.check(["docker", "inspect", "-f", "{{.State.Running}}", container]).strip() == "true"
        if log_path.exists():
            with log_path.open("rb") as handle:
                handle.seek(offset)
                chunk = handle.read()
            offset += len(chunk)
            pending += chunk.decode(errors="replace")
            *lines, pending = pending.split("\n")
            for raw in lines:
                line = compact(raw)
                match = STEP_LINE.search(line)
                if match:
                    last = int(match.group(1))
                    log.progress(last, total, match.group(2))
                if match or "Traceback" in line or "Error" in line:
                    log(line)
        if not running:
            return last
        sleep(poll)


def run(params: dict, log, runner: Runner | None = None, sleep=time.sleep) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    oc = config.openpi
    exp = check_name("exp name", str(params["exp"]))
    name = check_name("config_name", params["config_name"])
    view = Path(params["view"]).expanduser().resolve()
    gpus = parse_gpus(params["gpus"])
    container = container_name(oc.compose_project, exp)
    compose = Compose(oc, view, gpus)
    summary = require_view(view)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    folder = run_dir(oc, name, exp)
    host_log = oc.docker_data / "wandb" / f"{exp}.log"
    total = int(params.get("steps") or info.num_train_steps)
    attach = bool(params.get("attach"))
    init_from = params.get("init_from")
    weights = init_weights(oc, str(init_from)) if init_from else oc.weights
    exists = runner.run(["docker", "container", "inspect", container]).returncode == 0
    record = {
        "config": name,
        "exp": exp,
        "view": str(view),
        "gpus": list(gpus),
        "batch_size": int(params.get("batch") or info.batch_size),
        "num_train_steps": total,
        "holdout": list(info.holdout),
        "weights": weights,
        **({"init_from": str(init_from)} if init_from else {}),
        "container": container,
    }

    # argv is set in the non-attach path; log_offset is 0 for attach (show existing history)
    argv = None
    log_offset = 0

    if attach:
        if not exists:
            raise StepFailed(f"no container {container} to attach to")
        log(f"attaching to {container}")
        try:
            started_raw = runner.check(["docker", "inspect", "-f", "{{.State.StartedAt}}", container]).strip()
            record["started"] = _normalize_docker_time(started_raw)
        except Exception:  # noqa: BLE001
            pass  # keep record without "started" rather than failing
    else:
        if folder.exists() and not params.get("resume"):
            raise StepFailed(f"{folder} exists: pass resume to continue it, or pick another exp name")
        if exists:
            raise StepFailed(f"container {container} exists (running or left over); attach, or remove it by hand")
        if params.get("share_gpus"):
            short = short_gpus(runner, gpus, oc.train_need_mib)
            if short:
                free = " ".join(f"gpu{g}={mib}MiB free" for g, mib in sorted(short.items()))
                raise StepFailed(f"not enough free memory to share ({free}, need {oc.train_need_mib} MiB)")
        else:
            busy = busy_gpus(runner, gpus, oc.gpu_busy_mib)
            if busy:
                held = " ".join(f"gpu{g}={mib}MiB" for g, mib in sorted(busy.items()))
                raise StepFailed(f"GPUs in use by someone else ({held}); pick free GPUs or pass share_gpus")
        norm_result = None
        if not norm_stats_path(oc, info).exists():
            log("norm stats missing: computing them first")
            norm_result = norm.run(
                {"config_name": name, "view": str(view), "config": params.get("config"), "dry_run": params.get("dry_run")},
                log,
                runner,
            )
        args = [
            f"--exp-name={exp}",
            f"--num-workers={int(params.get('num_workers') or oc.num_workers)}",
            f"--weight-loader.params-path={weights}",
        ]
        if params.get("batch"):
            args.append(f"--batch-size={int(params['batch'])}")
        if params.get("steps"):
            args.append(f"--num-train-steps={int(params['steps'])}")
        if params.get("resume"):
            args.append("--resume")
        command = f"opic-train {shlex.quote(name)} {shlex.join(args)} >> /workspace/wandb/{exp}.log 2>&1"
        argv = compose.run(command, env=train_env(gpus), name=container, detach=True)
        log("$ " + shlex.join(argv))
        if params.get("dry_run"):
            return {"dry_run": True, "command": argv, "container": container, "norm": norm_result}
        record["openpi_commit"] = repo_commit(runner, oc.repo)
        record["started"] = now()
        log_offset = host_log.stat().st_size if host_log.exists() else 0

    if "openpi_commit" not in record:
        record["openpi_commit"] = repo_commit(runner, oc.repo)

    try:
        if argv is not None:
            runner.check(argv, env=compose.env())
            log(f"training started in {container}; log {host_log}")
        last = _follow(runner, container, host_log, total, log, float(params.get("poll_sec", 15)), sleep, log_offset)
    except JobCancelled:
        log(f"cancelled: stopping {container}")
        result = runner.run(["docker", "stop", "-t", "60", container])
        if result.returncode:
            log(f"could not stop {container}: {result.stderr}; the GPUs may still be held")
        raise

    exit_code = int(runner.check(["docker", "inspect", "-f", "{{.State.ExitCode}}", container]).strip())
    runner.run(["docker", "rm", container])
    metrics = parse_metrics(host_log.read_text(encoding="utf-8", errors="replace")) if host_log.exists() else []
    folder.mkdir(parents=True, exist_ok=True)
    if metrics:
        keys = list(dict.fromkeys(k for row in metrics for k in row))
        with (folder / "metrics.csv").open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=keys)
            writer.writeheader()
            writer.writerows(metrics)
    record.update(ended=now(), exit_code=exit_code, last_step=last)
    write_json(folder / "console_train.json", record)
    if exit_code:
        if host_log.exists():
            tail = host_log.read_text(encoding="utf-8", errors="replace").splitlines()[-15:]
            for line in tail:
                log(compact(line))
        raise StepFailed(f"training exited {exit_code}; see {host_log}")
    log(f"training finished at step {last}: {folder}")
    return {"run_dir": str(folder), "container": container, "last_step": last, "exit_code": exit_code}
