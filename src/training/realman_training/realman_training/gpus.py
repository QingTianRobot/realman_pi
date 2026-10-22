"""GPU memory and who holds it: nvidia-smi, then /proc for each compute process (the console container runs with
pid: host, so host processes are visible). A process inside a docker container is named by the container, any other
by `<user> <command>`; one that /proc does not show is named by its pid."""

from __future__ import annotations

import re
from pathlib import Path

from .runner import Runner

GPU_QUERY = ["nvidia-smi", "--query-gpu=index,uuid,name,memory.used,memory.total,utilization.gpu",
             "--format=csv,noheader,nounits"]
APP_QUERY = ["nvidia-smi", "--query-compute-apps=gpu_uuid,pid,used_memory", "--format=csv,noheader,nounits"]
_DOCKER_ID = re.compile(r"(?:docker-|/docker/)([0-9a-f]{64})")


def _int(text: str) -> int | None:
    try:
        return int(text.strip().split()[0])
    except (ValueError, IndexError):
        return None  # [N/A]


def _users(passwd: Path) -> dict[int, str]:
    try:
        lines = passwd.read_text(encoding="utf-8").splitlines()
    except OSError:
        return {}
    users = {}
    for line in lines:
        parts = line.split(":")
        if len(parts) > 2 and parts[2].isdigit():
            users[int(parts[2])] = parts[0]
    return users


def _containers(runner: Runner) -> dict[str, str]:
    try:
        done = runner.run(["docker", "ps", "--no-trunc", "--format", "{{.ID}} {{.Names}}"])
    except OSError:
        return {}
    if done.returncode:
        return {}
    return dict(line.split(" ", 1) for line in done.stdout.splitlines() if " " in line)


def _owner(pid: int, proc: Path, users: dict[int, str], containers: dict[str, str]) -> dict:
    base = proc / str(pid)
    try:
        cgroup = (base / "cgroup").read_text(encoding="utf-8")
    except OSError:
        return {"pid": pid, "who": f"pid {pid}", "container": None, "user": None, "command": None}
    match = _DOCKER_ID.search(cgroup)
    container = containers.get(match.group(1)) if match else None
    uid = None
    try:
        for line in (base / "status").read_text(encoding="utf-8").splitlines():
            if line.startswith("Uid:"):
                uid = int(line.split()[1])
                break
    except (OSError, ValueError, IndexError):
        pass
    try:
        command = (base / "comm").read_text(encoding="utf-8").strip()
    except OSError:
        command = ""
    user = users.get(uid, str(uid)) if uid is not None else None
    who = container or " ".join(part for part in (user, command) if part) or f"pid {pid}"
    return {"pid": pid, "who": who, "container": container, "user": user, "command": command or None}


def query(runner: Runner, *, busy_mib: int, passwd: Path = Path("/etc/passwd"), proc: Path = Path("/proc")) -> dict:
    try:
        done = runner.run(GPU_QUERY)
    except OSError as error:
        return {"available": False, "busy_mib": busy_mib, "gpus": [], "error": str(error)}
    if done.returncode:
        message = (done.stderr or done.stdout).strip()[-300:] or "nvidia-smi failed"
        return {"available": False, "busy_mib": busy_mib, "gpus": [], "error": message}
    gpus, by_uuid = [], {}
    for line in done.stdout.splitlines():
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 6:
            continue
        used = _int(parts[3])
        gpu = {"index": _int(parts[0]), "name": parts[2], "used_mib": used, "total_mib": _int(parts[4]),
               "util_pct": _int(parts[5]), "busy": (used or 0) > busy_mib, "users": []}
        gpus.append(gpu)
        by_uuid[parts[1]] = gpu
    try:
        apps = runner.run(APP_QUERY)
    except OSError:
        apps = None
    if apps is not None and apps.returncode == 0 and apps.stdout.strip():
        users, containers = _users(Path(passwd)), _containers(runner)
        for line in apps.stdout.splitlines():
            parts = [part.strip() for part in line.split(",")]
            if len(parts) < 3 or parts[0] not in by_uuid:
                continue
            pid = _int(parts[1])
            if pid is None:
                continue
            by_uuid[parts[0]]["users"].append({**_owner(pid, Path(proc), users, containers), "used_mib": _int(parts[2])})
    return {"available": True, "busy_mib": busy_mib, "gpus": gpus}
