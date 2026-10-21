"""Open-loop evaluation of checkpoints per task on the config's held-out episodes, plus a prompt-swap test for
multi-task runs (every task's held-out frames with every task's prompt). One GPU, refused when someone holds it."""

from __future__ import annotations

import json
import shlex
from pathlib import Path

from ..config import load_config
from ..jobs import JobCancelled, StepFailed, write_json
from ..lerobot_io import read_episodes
from ..openpi import (
    Compose,
    busy_gpus,
    check_holdout,
    check_name,
    config_info,
    parse_gpus,
    require_view,
    run_dir,
    script,
)
from ..runner import Runner, compact

ENV = {"XLA_PYTHON_CLIENT_PREALLOCATE": "false"}


def holdout_by_task(view: str | Path, holdout: tuple[int, ...]) -> dict[str, dict]:
    view = Path(view)
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items()}
    episodes = read_episodes(view)
    # Tasks that share a prompt (pick_only and pick_only_light-weak_1021) are told apart by the source's task names;
    # the view keeps the source's episode numbering.
    source_task: dict[int, str] = {}
    source = Path(str(contract.get("source") or ""))
    if source.name and (source / "meta" / "info.json").is_file():
        rows = read_episodes(source)
        if len(rows) == len(episodes):
            source_task = {row.index: row.task for row in rows}
    tasks: dict[str, dict] = {}
    for episode in episodes:
        if episode.index in holdout:
            task = source_task.get(episode.index) or task_of_prompt.get(episode.task, episode.task)
            tasks.setdefault(task, {"prompt": episode.task, "episodes": []})["episodes"].append(episode.index)
    return dict(sorted(tasks.items()))


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    oc = config.openpi
    name = check_name("config_name", params["config_name"])
    exp = check_name("exp", str(params["exp"]))
    view = Path(params["view"]).expanduser().resolve()
    gpus = parse_gpus(params["gpu"])
    if len(gpus) != 1:
        raise StepFailed("eval uses one GPU")
    folder = run_dir(oc, name, exp)
    if not folder.is_dir():
        raise StepFailed(f"no run directory {folder}")
    available = sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())
    steps = [int(s) for s in params.get("checkpoints") or available[-1:]]
    for step in steps:
        if step not in available:
            raise StepFailed(f"checkpoint {step} not in {folder} (have {available})")
    summary = require_view(view)
    compose = Compose(oc, view, gpus)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    busy = busy_gpus(runner, gpus, oc.gpu_busy_mib)
    if busy:
        held = " ".join(f"gpu{g}={mib}MiB" for g, mib in sorted(busy.items()))
        raise StepFailed(f"GPU in use by someone else ({held}); pick a free GPU")
    tasks = holdout_by_task(view, info.holdout)
    if not tasks:
        raise StepFailed(f"config {name} has no held-out episodes in {view.name}")
    stride = int(params.get("stride") or oc.eval_stride)
    swap = params.get("prompt_swap")
    swap = len(tasks) > 1 if swap is None else bool(swap)
    inside = f"/workspace/checkpoints/{name}/{exp}"
    if not params.get("dry_run"):
        (folder / "eval").mkdir(exist_ok=True)
    def _run_container(cname: str, argv: list[str], on_line, **kwargs) -> tuple[int, list[str]]:
        exists = runner.run(["docker", "container", "inspect", cname]).returncode == 0
        if exists:
            raise StepFailed(f"container {cname} already exists; remove it by hand or wait for it to finish")
        last: list[str] = []

        def capture(line: str) -> None:
            last.append(compact(line))
            on_line(line)

        try:
            code = runner.stream(argv, capture, **kwargs)
        except JobCancelled:
            log(f"cancelled: stopping {cname}")
            result = runner.run(["docker", "stop", "-t", "30", cname])
            if result.returncode:
                log(f"could not stop {cname}: {result.stderr}")
            raise
        return code, last

    commands, results = [], {}
    total = len(steps) * (len(tasks) + int(swap))
    done = 0
    for step in steps:
        checkpoint = f"checkpoints/{name}/{exp}/{step}"
        for task, held_out in tasks.items():
            cname = f"{oc.compose_project}-eval-{exp}-{step}"
            args = ["--config-name", name, "--checkpoint-dir", checkpoint, "--episodes", *map(str, held_out["episodes"]),
                    "--stride", str(stride), "--output", f"{inside}/eval/{step}_{task}.json"]
            argv = compose.run("uv run --no-sync scripts/eval_open_loop.py " + shlex.join(args), env=ENV, name=cname)
            commands.append(argv)
            log(f"checkpoint {step}, task {task}: episodes {held_out['episodes']}")
            if params.get("dry_run"):
                log("$ " + shlex.join(argv))
                continue
            code, last_lines = _run_container(cname, argv,
                                              lambda line: log(compact(line)) if "MAE" in line or "Error" in line else None,
                                              env=compose.env())
            if code:
                for line in last_lines[-15:]:
                    log(line)
                raise StepFailed(f"eval of {step}/{task} exited {code}")
            data = json.loads((folder / "eval" / f"{step}_{task}.json").read_text(encoding="utf-8"))
            results.setdefault(str(step), {})[task] = {
                "mae": data["mae"], "zero_baseline": data["baseline_zeros"]["mae"], "episodes": held_out["episodes"]
            }
            done += 1
            log.progress(done, total, f"{step} {task}: MAE {data['mae']:.4f}")
        if swap:
            cname_swap = f"{oc.compose_project}-eval-{exp}-{step}-swap"
            args = [name, checkpoint, f"{inside}/eval/prompt_swap_{step}.json", json.dumps(tasks), str(stride)]
            argv = compose.run("uv run --no-sync python - " + shlex.join(args), env=ENV, name=cname_swap)
            commands.append(argv)
            if params.get("dry_run"):
                log("$ " + shlex.join(argv))
                continue
            code, last_lines = _run_container(cname_swap, argv, lambda line: log(compact(line)),
                                              input=script("prompt_swap"), env=compose.env())
            if code:
                for line in last_lines[-15:]:
                    log(line)
                raise StepFailed(f"prompt swap of {step} exited {code}")
            data = json.loads((folder / "eval" / f"prompt_swap_{step}.json").read_text(encoding="utf-8"))
            results[str(step)]["prompt_swap"] = {t: {o: v["mae"] for o, v in row.items()} for t, row in data.items()}
            done += 1
            log.progress(done, total, f"{step} prompt swap")
    if params.get("dry_run"):
        return {"dry_run": True, "commands": commands}
    summary_path = folder / "eval" / "summary.json"
    merged = json.loads(summary_path.read_text(encoding="utf-8")) if summary_path.exists() else {}
    for step, block in results.items():
        merged.setdefault(step, {}).update(block)
    write_json(summary_path, merged)
    return {"run_dir": str(folder), "results": results}
