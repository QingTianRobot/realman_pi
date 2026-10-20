"""realman-train: list the datasets and inspect one (summary + per-episode quality)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pyarrow
import yaml

from . import linkcheck, serving
from .config import load_config
from .datasets import DatasetSummary, discover, summarize
from .jobs import JobConflict, JobStore, StepFailed
from .lerobot_io import NotALeRobotDataset
from .quality import QualityUnavailable, inspect_dataset, suggested_drops
from .steps import clean as clean_step
from .steps import pull as pull_step
from .steps import view as view_step

STEP_COMMANDS = ("pull", "clean", "view", "norm", "train", "eval", "register")


def _size(n: int) -> str:
    for unit, scale in (("GB", 1 << 30), ("MB", 1 << 20), ("KB", 1 << 10)):
        if n >= scale:
            return f"{n / scale:.1f} {unit}"
    return f"{n} B"


def _summary_text(s: DatasetSummary) -> list[str]:
    lines = [
        f"{s.path}  [{s.kind}]",
        f"  episodes {s.episodes} · frames {s.frames} · {s.duration_sec / 60:.1f} min @ {s.fps:g} fps"
        f" · LeRobot {s.codebase_version} · {s.robot_type}",
        f"  files {s.first_file_time or '-'} -> {s.last_file_time or '-'} · disk {_size(s.disk_bytes)}",
        "  tasks: " + ", ".join(f"{task} {count} ({s.task_frames[task]} frames)" for task, count in s.tasks.items()),
        "  cameras: " + ", ".join(f"{c.key} {c.codec} {c.height}x{c.width}" for c in s.cameras),
    ]
    if s.source:
        lines.append(f"  source: {s.source}" + (f" · removed {s.removed_episodes}" if s.removed_episodes else ""))
    for task, prompt in s.prompts.items():
        lines.append(f"  prompt {task}: {prompt}")
    return lines


def parse_episodes(text: str) -> list[int]:
    episodes: list[int] = []
    for part in str(text).split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            low, high = (int(x) for x in part.split("-", 1))
            if high < low:
                raise ValueError(f"bad range {part!r}")
            episodes.extend(range(low, high + 1))
        else:
            episodes.append(int(part))
    return episodes


def parse_checkpoints(text: str) -> list[int]:
    """Parse --checkpoints: plain comma-separated ints only; ranges are not allowed."""
    checkpoints: list[int] = []
    for part in str(text).split(","):
        part = part.strip()
        if not part:
            continue
        try:
            checkpoints.append(int(part))
        except ValueError:
            raise ValueError(f"--checkpoints expects plain integers, got {part!r} (no ranges allowed)") from None
    return checkpoints


def _task_prompts(pairs: list[str] | None) -> dict[str, str]:
    prompts = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise ValueError(f"--task-prompt wants task=prompt, got {pair!r}")
        task, prompt = pair.split("=", 1)
        prompts[task.strip()] = prompt.strip()
    return prompts


def build_params(args, config) -> tuple[str, dict]:
    base = {"config": str(config.source)}
    command = args.command
    if command == "pull":
        target = config.data_root / args.name if args.name else pull_step.default_target(config.data_root)
        return "pull", {**base, "target": str(target), **({"dataset": args.dataset} if args.dataset else {})}
    if command == "clean":
        src = Path(args.src).expanduser().resolve()
        params = {**base, "src": str(src), "dst": str(Path(args.dst).expanduser() if args.dst else clean_step.default_dst(config.data_root, src))}
        if args.reasons:
            params["reasons"] = json.loads(Path(args.reasons).read_text(encoding="utf-8"))
        if args.suggested:
            quality = inspect_dataset(src, config.quality)
            params["drop"] = suggested_drops(quality)
            params["reasons"] = {
                str(q.episode): "; ".join(f.message for f in q.findings if f.severity == "drop")
                for q in quality if q.verdict == "suggest_drop"
            } | params.get("reasons", {})
        elif args.keep is not None:
            params["keep"] = parse_episodes(args.keep)
        else:
            params["drop"] = parse_episodes(args.drop)
        return "clean", params
    if command == "view":
        src = Path(args.src).expanduser().resolve()
        dst = Path(args.dst).expanduser() if args.dst else view_step.default_dst(config.data_root, src)
        return "view", {**base, "src": str(src), "dst": str(dst), "task_prompts": _task_prompts(args.task_prompt),
                        "dry_run": args.dry_run, **({"arm": args.arm} if args.arm else {})}
    if command == "norm":
        return "norm", {**base, "config_name": args.config_name, "view": str(Path(args.view).expanduser().resolve()),
                        "force": args.force, "dry_run": args.dry_run}
    if command == "train":
        return "train", {**base, "config_name": args.config_name, "view": str(Path(args.view).expanduser().resolve()),
                         "exp": args.exp, "gpus": args.gpus, "batch": args.batch, "steps": args.steps,
                         "resume": args.resume, "attach": args.attach, "dry_run": args.dry_run}
    if command == "eval":
        return "eval", {**base, "config_name": args.config_name, "exp": args.exp,
                        "view": str(Path(args.view).expanduser().resolve()), "gpu": args.gpu,
                        "checkpoints": parse_checkpoints(args.checkpoints) if args.checkpoints else None,
                        "stride": args.stride, "prompt_swap": False if args.no_prompt_swap else None,
                        "dry_run": args.dry_run}
    if command == "register":
        return "register", {**base, "config_name": args.config_name, "exp": args.exp, "status": args.status,
                            "method": args.method, "force": args.force}
    raise ValueError(f"not a step: {command}")


def _run_step(args, config) -> int:
    if args.command == "train" and not (args.yes or args.dry_run or args.attach):
        print("error: training occupies GPUs for hours; check the command with --dry-run, then add --yes", file=sys.stderr)
        return 2
    kind, params = build_params(args, config)
    return _run_job(kind, params, args, config)


def _run_job(kind: str, params: dict, args, config) -> int:
    store = JobStore(config.console_dir)
    store.recover()
    try:
        job = store.start(kind, params)
    except JobConflict as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    if args.background:
        print(job.id)
        return 0
    print(f"job {job.id}: log {job.dir / 'log.txt'}", file=sys.stderr)
    try:
        status = store.wait(job.id, lambda line: print(line, flush=True))
    except KeyboardInterrupt:
        print("cancelling…", file=sys.stderr)
        store.cancel(job.id)
        status = store.wait(job.id, lambda line: print(line, flush=True))
    if status["state"] != "succeeded":
        print(f"{kind} {status['state']}: {status.get('error')}", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(status.get("result"), ensure_ascii=False, indent=2))
    return 0


SERVE_CONFIRM = {
    "start": "starting takes a GPU on server5090 and (re)creates policy_bridge on realman_ts",
    "stop": "stopping takes the policy server and policy_bridge down",
}


def _serve_status_text(data: dict) -> list[str]:
    serve, bridge, record, gpu = data["serve"], data["bridge"], data.get("record") or {}, data.get("gpu") or {}
    lines = []
    if serve.get("running"):
        lines.append(f"openpi-serve: running since {serve.get('started')} · {serve.get('image')} {serve.get('image_id', '')}")
    else:
        lines.append("openpi-serve: not running")
    if record:
        lines.append(f"  model {record.get('model')} @ {record.get('step')} · GPU {record.get('gpu')} · port {record.get('port')}"
                     f" · task {record.get('task')}" + (f" · stopped {record['stopped']}" if record.get("stopped") else ""))
    if "used_mib" in gpu:
        lines.append(f"  GPU {gpu['index']}: {gpu['used_mib']} / {gpu['total_mib']} MiB")
    if "error" in bridge:
        lines.append(f"policy_bridge: {bridge['error']}")
    else:
        state = f"running since {bridge.get('started')}" if bridge.get("running") else "not running"
        lines.append(f"policy_bridge: {state} · {bridge.get('image', '')} · server {bridge.get('server') or '-'}")
        lines.append(f"  prompt {bridge.get('prompt')!r} · paused {bridge.get('paused')} · allow_publish {bridge.get('allow_publish')}")
    mode = data.get("bt_mode")
    lines.append(f"behaviour tree: {mode.get('active_mode') if mode else 'no input_mode_state (not running?)'}")
    return lines


def _cmd_serve(args, config) -> int:
    if args.serve_command == "status":
        data = serving.status(config)
        print(json.dumps(data, ensure_ascii=False, indent=2) if args.json else "\n".join(_serve_status_text(data)))
        return 0
    if not (args.yes or args.dry_run):
        print(f"error: {SERVE_CONFIRM[args.serve_command]}; check with --dry-run, then add --yes", file=sys.stderr)
        return 2
    params = {"config": str(config.source), "action": args.serve_command, "dry_run": args.dry_run}
    if args.serve_command == "start":
        for key in ("model", "checkpoint", "gpu", "port", "task"):
            value = getattr(args, key)
            if value is not None:
                params[key] = value
    return _run_job("serve", params, args, config)


def _cmd_linkcheck(args, config) -> int:
    only = [part.strip() for part in args.only.split(",") if part.strip()] if args.only else None
    unknown = sorted(set(only or ()) - set(linkcheck.ITEMS))
    if unknown:
        print(f"error: unknown items {unknown}; choose from {', '.join(linkcheck.ITEMS)}", file=sys.stderr)
        return 2
    checks = linkcheck.run_checks(config, only=only)
    history = linkcheck.save_history(config, checks)
    ok = all(c.ok for c in checks)
    if args.json:
        print(json.dumps({"ok": ok, "checks": [c.to_dict() for c in checks], "history": str(history)}, ensure_ascii=False, indent=2))
    else:
        print("\n".join(linkcheck.format_table(checks)))
        print(f"{'all checks passed' if ok else 'some checks FAILED'} · {history}")
    return 0 if ok else 1


def _job_row(job) -> dict:
    status = job.status()
    return {k: status.get(k) for k in ("id", "kind", "state", "created", "started", "ended", "error", "progress")}


def _cmd_jobs(args, config) -> int:
    store = JobStore(config.console_dir)
    store.recover()
    if args.command == "cancel":
        print("cancel sent" if store.cancel(args.id) else "not running")
        return 0
    if args.command == "job":
        job = store.get(args.id)
        print(job.log_text() if args.log else json.dumps(job.status(), ensure_ascii=False, indent=2))
        return 0
    rows = [_job_row(job) for job in store.list(kind=args.kind, limit=args.limit)]
    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return 0
    for row in rows:
        progress = row["progress"] or {}
        extra = progress.get("text") or row["error"] or ""
        print(f"{row['id']:34} {row['kind']:9} {row['state']:12} {extra}")
    return 0


def _cmd_list(args, config) -> int:
    root = Path(args.root).expanduser() if args.root else config.data_root
    results = []
    errors = []
    for path in discover(root):
        try:
            results.append(summarize(path))
        except (NotALeRobotDataset, OSError, ValueError, pyarrow.ArrowInvalid) as exc:
            errors.append((path, str(exc)))
    if args.json:
        rows = [s.to_dict() for s in results]
        rows += [{"path": str(p), "kind": "error", "error": msg} for p, msg in errors]
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return 0
    print(f"{'dataset':60} {'kind':5} {'episodes':>8} {'frames':>8}  updated")
    for s in results:
        name = str(Path(s.path).relative_to(root)) if Path(s.path).is_relative_to(root) else s.path
        print(f"{name:60} {s.kind:5} {s.episodes:>8} {s.frames:>8}  {s.last_file_time or '-'}")
    for path, msg in errors:
        name = str(path.relative_to(root)) if path.is_relative_to(root) else str(path)
        print(f"{name:60} {'error':5}  {msg}")
    return 0


def _cmd_inspect(args, config) -> int:
    summary = summarize(Path(args.path).expanduser())
    quality, unavailable = None, None
    if args.no_quality:
        unavailable = "skipped"
    else:
        try:
            quality = inspect_dataset(summary.path, config.quality)
        except QualityUnavailable as error:
            unavailable = str(error)
    drops = suggested_drops(quality) if quality is not None else []
    if args.json:
        print(
            json.dumps(
                {
                    "summary": summary.to_dict(),
                    "quality": None if quality is None else [q.to_dict() for q in quality],
                    "quality_unavailable": unavailable,
                    "suggested_drops": drops,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0
    print("\n".join(_summary_text(summary)))
    if quality is None:
        print(f"  quality: {unavailable}")
        return 0
    counts = {v: sum(q.verdict == v for q in quality) for v in ("ok", "suggest_drop", "warn")}
    print(f"  quality: {counts['ok']} ok, {counts['suggest_drop']} suggest drop, {counts['warn']} warn")
    for q in quality:
        for finding in q.findings:
            print(f"    {finding.severity:5} {q.episode:>3}  {q.task}  {finding.code}: {finding.message}")
    if drops:
        print("  suggested drops: " + ",".join(map(str, drops)))
    return 0


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="realman-train", description=__doc__)
    parser.add_argument("--config", help="console config (default: config/training/training_console.yaml)")
    sub = parser.add_subparsers(dest="command", required=True)
    listing = sub.add_parser("list", help="list the datasets under data_root")
    listing.add_argument("--root", help="search here instead of data_root")
    listing.add_argument("--json", action="store_true")
    inspecting = sub.add_parser("inspect", help="summary and per-episode quality of one dataset")
    inspecting.add_argument("path")
    inspecting.add_argument("--json", action="store_true")
    inspecting.add_argument("--no-quality", action="store_true", help="summary only")

    def step(name: str, help_text: str) -> argparse.ArgumentParser:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--background", action="store_true", help="start the job and return its id")
        p.add_argument("--json", action="store_true", help="print the result as JSON")
        return p

    p = step("pull", "copy the recording from realman_ts into a new raw_realman_ts_<datetime> directory")
    p.add_argument("--dataset", help="recording name (default: remote.dataset)")
    p.add_argument("--name", help="target directory name under data_root")
    p = step("clean", "write a new dataset without the given episodes")
    p.add_argument("src")
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--drop", help="episodes to drop, e.g. 13,28,40-44")
    group.add_argument("--keep", help="episodes to keep (a subset)")
    group.add_argument("--suggested", action="store_true", help="drop what the quality rules suggest")
    p.add_argument("--reasons", help="JSON file {episode: reason}")
    p.add_argument("--dst")
    p = step("view", "build a training view (openpi make_realman_view.py) and check its gripper labels")
    p.add_argument("src")
    p.add_argument("--dst")
    p.add_argument("--task-prompt", nargs="+", metavar="TASK=PROMPT")
    p.add_argument("--arm")
    p.add_argument("--dry-run", action="store_true")
    p = step("norm", "compute openpi norm stats for a config and its view")
    p.add_argument("config_name")
    p.add_argument("view")
    p.add_argument("--force", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p = step("train", "start an openpi training run (needs --yes)")
    p.add_argument("config_name")
    p.add_argument("view")
    p.add_argument("--exp", required=True)
    p.add_argument("--gpus", required=True, help="host GPU indices, e.g. 1,2")
    p.add_argument("--batch", type=int)
    p.add_argument("--steps", type=int)
    p.add_argument("--resume", action="store_true")
    p.add_argument("--attach", action="store_true", help="follow an already running training container")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--yes", action="store_true")
    p = step("eval", "open-loop eval per task (+ prompt swap)")
    p.add_argument("config_name")
    p.add_argument("exp")
    p.add_argument("--view", required=True)
    p.add_argument("--gpu", required=True)
    p.add_argument("--checkpoints", help="e.g. 10000,29999 (default: the latest)")
    p.add_argument("--stride", type=int)
    p.add_argument("--no-prompt-swap", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p = step("register", "write the model card and the registry row")
    p.add_argument("config_name")
    p.add_argument("exp")
    p.add_argument("--status")
    p.add_argument("--method")
    p.add_argument("--force", action="store_true", help="replace a hand-written card (kept as a backup)")
    serve = sub.add_parser("serve", help="start/stop/status of the inference chain (openpi-serve + policy_bridge)")
    serve_sub = serve.add_subparsers(dest="serve_command", required=True)
    p = serve_sub.add_parser("start", help="openpi-serve with a registered model, warm-up, policy_bridge (inactive), link checks")
    p.add_argument("--model", help="<openpi config>/<exp> (default: serving.model)")
    p.add_argument("--checkpoint", help="checkpoint step (default: the latest)")
    p.add_argument("--gpu", type=int)
    p.add_argument("--port", type=int)
    p.add_argument("--task", help="task whose prompt the bridge gets (default: the model's first task)")
    p.add_argument("--dry-run", action="store_true", help="run the checks and print the commands only")
    p.add_argument("--yes", action="store_true")
    p.add_argument("--background", action="store_true")
    p.add_argument("--json", action="store_true")
    p = serve_sub.add_parser("stop", help="stop policy_bridge, then openpi-serve (refused in policy mode)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--yes", action="store_true")
    p.add_argument("--background", action="store_true")
    p.add_argument("--json", action="store_true")
    p = serve_sub.add_parser("status", help="both containers, model, GPU memory, bridge prompt")
    p.add_argument("--json", action="store_true")
    check = sub.add_parser("linkcheck", help="the four data-path checks (Pika/Wi-Fi, bulk + ping, inference, bridge)")
    check.add_argument("--only", help="comma list of pika, link, inference, bridge")
    check.add_argument("--json", action="store_true")
    jobs = sub.add_parser("jobs", help="list jobs")
    jobs.add_argument("--kind")
    jobs.add_argument("--limit", type=int, default=20)
    jobs.add_argument("--json", action="store_true")
    job = sub.add_parser("job", help="one job's status (or --log)")
    job.add_argument("id")
    job.add_argument("--log", action="store_true")
    cancel = sub.add_parser("cancel", help="cancel a running job")
    cancel.add_argument("id")
    return parser


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if argv[:1] == ["_job-run"]:
        from .jobs import run_job

        if len(argv) < 2:
            print("usage: realman-train _job-run <job-dir>", file=sys.stderr)
            return 2
        return run_job(argv[1])
    args = make_parser().parse_args(argv)
    try:
        config = load_config(args.config)
        if args.command == "list":
            return _cmd_list(args, config)
        if args.command == "inspect":
            return _cmd_inspect(args, config)
        if args.command == "serve":
            return _cmd_serve(args, config)
        if args.command == "linkcheck":
            return _cmd_linkcheck(args, config)
        if args.command in STEP_COMMANDS:
            return _run_step(args, config)
        return _cmd_jobs(args, config)
    except (NotALeRobotDataset, FileNotFoundError, OSError, ValueError, KeyError, yaml.YAMLError, StepFailed) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
