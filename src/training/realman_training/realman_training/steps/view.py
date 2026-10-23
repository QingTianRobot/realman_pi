"""Training view of a cleaned recording: openpi's make_realman_view.py (multi-task --task-prompt) in the openpi
image, then a check that every episode's gripper target has the shape its task needs.

The view hard-links the videos, so src and dst must share a filesystem; the container mounts their common parent
once (separate bind mounts would make the links cross-device).
"""

from __future__ import annotations

import json
import os
import shlex
import shutil
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


def episode_tasks(view: str | Path) -> dict[int, tuple[str, str]]:
    """Episode index -> (task, prompt) of a training view. The view keeps only prompts, so tasks that share one
    (pick_only and pick_only_light-weak_1021) are told apart by the task names of the source it was made from;
    the view keeps the source's episode numbering."""
    view = Path(view)
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items()}
    episodes = read_episodes(view)
    source_task: dict[int, str] = {}
    source = Path(str(contract.get("source") or ""))
    if source.name and (source / "meta" / "info.json").is_file():
        rows = read_episodes(source)
        if len(rows) == len(episodes):
            source_task = {row.index: row.task for row in rows}
    return {e.index: (source_task.get(e.index) or task_of_prompt.get(e.task, e.task), e.task) for e in episodes}


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
    partial = dst.parent / f"{dst.name}.partial"
    if partial.exists():
        raise StepFailed(f"refusing: {partial} exists (a previous interrupted run?); remove it by hand")
    # Refuse when src and dst.parent are on different devices or share only the root "/"
    # Stat the nearest existing ancestor to avoid creating directories before the device check.
    try:
        ancestor = dst.parent
        while not ancestor.exists() and ancestor != ancestor.parent:
            ancestor = ancestor.parent
        src_dev = os.stat(src).st_dev
        dst_dev = os.stat(ancestor).st_dev
    except OSError:
        src_dev = dst_dev = None
    if src_dev is not None and dst_dev is not None and src_dev != dst_dev:
        raise StepFailed(f"must be on the same filesystem as {src}; {dst.parent} is on a different device")
    common = os.path.commonpath([str(src), str(dst.parent)])
    if common == "/":
        raise StepFailed(f"must be on the same filesystem as {src}; {dst.parent} shares only '/' with it")
    summary = summarize(src)
    if summary.kind == "view":
        raise StepFailed(f"{src} is already a training view; build views from a raw or cleaned recording")
    prompts = {**config.prompts, **{str(k): str(v) for k, v in (params.get("task_prompts") or {}).items()}}
    missing = [task for task in summary.tasks if task not in prompts]
    if missing:
        raise StepFailed(f"no prompt for task(s) {missing}: add them to prompts in the config or pass task=prompt")
    prompts = {task: prompts[task] for task in summary.tasks}
    # Pass partial as --dst so make_realman_view writes there; rename to dst at the end.
    argv = view_command(config.openpi, src, partial, params.get("arm") or config.quality.arm, prompts)
    log("$ " + shlex.join(argv))
    if params.get("dry_run"):
        return {"dry_run": True, "command": argv}
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        code = runner.stream(argv, lambda line: log(compact(line)))
        if code:
            raise StepFailed(f"make_realman_view.py exited {code}")
        failures = check_gripper_labels(partial, config.quality.release_tasks)
        (partial / "label_check.json").write_text(
            json.dumps({"checked": now(), "failures": failures}, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        partial.rename(dst)
    except BaseException:
        if partial.exists():
            shutil.rmtree(partial, ignore_errors=True)
        raise
    if failures:
        listed = ", ".join(f"{f['episode']} ({f['task']}: {f['found']})" for f in failures[:10])
        raise StepFailed(f"view written to {dst}, but {len(failures)} episode(s) have wrong gripper labels: {listed}")
    episodes = summarize(dst).episodes
    log(f"view {dst}: {episodes} episodes, gripper labels ok")
    return {"dst": str(dst), "episodes": episodes, "prompts": prompts, "label_failures": []}
