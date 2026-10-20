"""Training view of a cleaned recording: openpi's make_realman_view.py (multi-task --task-prompt) in the openpi
image, then a check that every episode's gripper target has the shape its task needs.

The view hard-links the videos, so src and dst must share a filesystem; the container mounts their common parent
once (separate bind mounts would make the links cross-device).
"""

from __future__ import annotations

import json
import os
import shlex
from pathlib import Path

from ..config import OpenpiConfig, load_config
from ..datasets import summarize
from ..jobs import StepFailed, now
from ..lerobot_io import read_columns, read_episodes
from ..quality import runs
from ..runner import Runner, compact


def default_dst(data_root: str | Path, src: str | Path) -> Path:
    return Path(data_root).expanduser() / f"{Path(src).name}_view"


def view_command(openpi: OpenpiConfig, src: Path, dst: Path, arm: str, prompts: dict[str, str]) -> list[str]:
    shared = os.path.commonpath([str(src), str(dst.parent)])
    args = ["--src", str(src), "--dst", str(dst), "--arm", arm, "--task-prompt", *[f"{t}={p}" for t, p in prompts.items()]]
    return [
        "docker", "run", "--rm", "--network", "none", "--user", f"{os.getuid()}:{os.getgid()}",
        "-e", "HOME=/tmp", "-e", "UV_PROJECT_ENVIRONMENT=/.venv",
        "-e", "PYTHONPATH=/workspace/src:/workspace/packages/openpi-client/src",
        "-v", f"{openpi.repo}:/workspace", "-v", f"{shared}:{shared}", "-w", "/workspace",
        "--entrypoint", "zsh", openpi.image, "-lc",
        "uv run --no-sync scripts/make_realman_view.py " + shlex.join(args),
    ]


def _label(states: list[bool]) -> str:
    return ">".join("open" if s else "closed" for s in states)


def check_gripper_labels(root: str | Path, release_tasks: tuple[str, ...]) -> list[dict]:
    root = Path(root)
    contract = json.loads((root / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items() if task != "*"}
    columns = read_columns(root, ["action"])
    failures = []
    for episode in read_episodes(root):
        task = task_of_prompt.get(episode.task)
        if task is None:
            continue  # single-prompt views ("*") carry no task name to judge by
        action = columns[episode.index]["action"]
        found = [value for value, _, _ in runs(action[:, 6] > 0.5)] if len(action) else []
        expected = [True, False, True] if task in release_tasks else [True, False]
        if found != expected:
            failures.append({"episode": episode.index, "task": task, "found": _label(found), "expected": _label(expected)})
    return failures


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    src = Path(params["src"]).expanduser().resolve()
    dst = Path(params["dst"]).expanduser().absolute()
    if dst.exists():
        raise StepFailed(f"refusing: {dst} exists (view never overwrites)")
    summary = summarize(src)
    if summary.kind == "view":
        raise StepFailed(f"{src} is already a training view; build views from a raw or cleaned recording")
    prompts = {**config.prompts, **{str(k): str(v) for k, v in (params.get("task_prompts") or {}).items()}}
    missing = [task for task in summary.tasks if task not in prompts]
    if missing:
        raise StepFailed(f"no prompt for task(s) {missing}: add them to prompts in the config or pass task=prompt")
    prompts = {task: prompts[task] for task in summary.tasks}
    argv = view_command(config.openpi, src, dst, params.get("arm") or config.quality.arm, prompts)
    log("$ " + shlex.join(argv))
    if params.get("dry_run"):
        return {"dry_run": True, "command": argv}
    code = runner.stream(argv, lambda line: log(compact(line)))
    if code:
        raise StepFailed(f"make_realman_view.py exited {code}")
    failures = check_gripper_labels(dst, config.quality.release_tasks)
    (dst / "label_check.json").write_text(
        json.dumps({"checked": now(), "failures": failures}, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    if failures:
        listed = ", ".join(f"{f['episode']} ({f['task']}: {f['found']})" for f in failures[:10])
        raise StepFailed(f"view written to {dst}, but {len(failures)} episode(s) have wrong gripper labels: {listed}")
    episodes = summarize(dst).episodes
    log(f"view {dst}: {episodes} episodes, gripper labels ok")
    return {"dst": str(dst), "episodes": episodes, "prompts": prompts, "label_failures": []}
