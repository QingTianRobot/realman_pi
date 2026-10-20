"""realman-train: list the datasets and inspect one (summary + per-episode quality)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .config import load_config
from .datasets import DatasetSummary, discover, summarize
from .lerobot_io import NotALeRobotDataset
from .quality import QualityUnavailable, inspect, suggested_drops


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


def _cmd_list(args, config) -> int:
    root = Path(args.root).expanduser() if args.root else config.data_root
    summaries = [summarize(path) for path in discover(root)]
    if args.json:
        print(json.dumps([s.to_dict() for s in summaries], ensure_ascii=False, indent=2))
        return 0
    print(f"{'dataset':60} {'kind':5} {'episodes':>8} {'frames':>8}  updated")
    for s in summaries:
        name = str(Path(s.path).relative_to(root)) if Path(s.path).is_relative_to(root) else s.path
        print(f"{name:60} {s.kind:5} {s.episodes:>8} {s.frames:>8}  {s.last_file_time or '-'}")
    return 0


def _cmd_inspect(args, config) -> int:
    summary = summarize(Path(args.path).expanduser())
    quality, unavailable = None, None
    if args.no_quality:
        unavailable = "skipped"
    else:
        try:
            quality = inspect(summary.path, config.quality)
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


def main(argv: list[str] | None = None) -> int:
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
    args = parser.parse_args(argv)
    config = load_config(args.config)
    try:
        return _cmd_list(args, config) if args.command == "list" else _cmd_inspect(args, config)
    except (NotALeRobotDataset, FileNotFoundError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
