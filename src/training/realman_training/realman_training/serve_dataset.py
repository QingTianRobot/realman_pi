"""The data a served model was trained on, for the serve page: what the view is (arm, cameras, state/action, prompts),
where it came from (view -> cleaned -> raw, with what each step removed), how it splits by task and train/holdout,
how long its episodes are, and the state/action distribution openpi normalized with (the checkpoint's norm_stats).

Read only. Tasks that share a prompt are told apart through the view's source (steps.view.episode_tasks)."""

from __future__ import annotations

import json
import math
import re
import statistics
from pathlib import Path

from .catalog import BadRequest, NotFound, _checkpoints, _read_json, _run_folder, card_path, relative
from .config import ConsoleConfig
from .lerobot_io import is_dataset, read_episodes, read_info
from .steps.view import episode_tasks

# make_realman_view.py's layout (contract.json "state" / "action"): 6 joints or Cartesian velocities, then the gripper.
STATE_LABELS = ("J1", "J2", "J3", "J4", "J5", "J6", "夹爪")
ACTION_LABELS = ("vx", "vy", "vz", "wx", "wy", "wz", "夹爪")
LENGTH_BINS = 12
# The recording tags shown on the card, from <view>/episode_tags.json (written by `realman-train tags refresh`, see
# docs/superpowers/specs/2026-10-23-training-episode-tags-design.md).
TAGS_FILE = "episode_tags.json"
TAGS_SCHEMA = 1
TAG_KEYS = ("lighting_level", "date")
LINEAGE_DEPTH = 6


def _labels(names: tuple[str, ...], width: int) -> list[str]:
    return list(names) if width == len(names) else [str(i) for i in range(width)]


def _manifest(path: Path) -> dict | None:
    for candidate in (Path(f"{path}.clean_manifest.json"), path / "clean_manifest.json"):
        data = _read_json(candidate)
        if isinstance(data, dict):
            return data
    return None


# "closed plateau 8550 >= 8300: ... (max reading 5289)" -> one reason, whatever the readings were.
_DETAIL = re.compile(r"\s*\([^)]*\)")
_NUMBER = re.compile(r"\d+(\.\d+)?")


def reason_keys(text) -> list[str]:
    """The reasons in one clean_manifest entry ("a; b"), each without its readings."""
    return [_NUMBER.sub("N", _DETAIL.sub("", part)).strip() or "人工剔除" for part in str(text or "").split(";")]


def _removed_tasks(source, removed: dict) -> dict[str, int] | None:
    """Task -> how many episodes a clean step removed, from the task names of the directory it cleaned."""
    path = Path(str(source or ""))
    if not removed or not path.name or not is_dataset(path):
        return None
    try:
        task_of = {e.index: e.task for e in read_episodes(path)}
    except (OSError, ValueError, KeyError):
        return None
    counts: dict[str, int] = {}
    for index in removed:
        task = task_of.get(int(index), "?") if str(index).isdigit() else "?"
        counts[task] = counts.get(task, 0) + 1
    return dict(sorted(counts.items(), key=lambda kv: -kv[1]))


def lineage(config: ConsoleConfig, view: Path, contract: dict) -> list[dict]:
    """view -> cleaned -> ... -> raw: one row per directory, newest first, with the counts each step wrote down."""
    rows = [{"path": relative(config, view), "kind": "view", "episodes": contract.get("episodes"),
             "frames": contract.get("frames"), "created": contract.get("created"), "removed": None, "reasons": None,
             "removed_tasks": None}]
    source = contract.get("source")
    for _ in range(LINEAGE_DEPTH):
        if not source:
            break
        path = Path(str(source))
        manifest = _manifest(path)
        if manifest is None:
            row = {"path": relative(config, path), "kind": "raw", "episodes": None, "frames": None, "created": None,
                   "removed": None, "reasons": None, "removed_tasks": None}
            if rows[-1]["kind"] == "clean":
                row["episodes"], row["frames"] = rows[-1].pop("_source_episodes"), rows[-1].pop("_source_frames")
            rows.append(row)
            break
        removed = manifest.get("removed") or {}
        reasons: dict[str, int] = {}
        for entry in removed.values():
            text = entry.get("reason") if isinstance(entry, dict) else entry
            for key in reason_keys(text):
                reasons[key] = reasons.get(key, 0) + 1
        rows.append({"path": relative(config, path), "kind": "clean", "episodes": manifest.get("kept_episodes"),
                     "frames": manifest.get("kept_frames"), "created": manifest.get("created"), "removed": len(removed),
                     "reasons": dict(sorted(reasons.items(), key=lambda kv: -kv[1])),
                     "removed_tasks": _removed_tasks(manifest.get("source"), removed),
                     "_source_episodes": manifest.get("source_episodes_at_copy"),
                     "_source_frames": manifest.get("source_frames_at_copy")})
        source = manifest.get("source")
    for row in rows:
        row.pop("_source_episodes", None)
        row.pop("_source_frames", None)
    return rows


def _histogram(lengths_by_task: dict[str, list[float]]) -> dict:
    values = [v for vs in lengths_by_task.values() for v in vs]
    if not values:
        return {"edges": [], "counts": {}}
    lo, hi = math.floor(min(values)), math.ceil(max(values))
    width = max(1, math.ceil((hi - lo) / LENGTH_BINS)) if hi > lo else 1
    bins = max(1, math.ceil((hi - lo) / width)) if hi > lo else 1
    edges = [lo + i * width for i in range(bins + 1)]
    counts = {}
    for task, vs in lengths_by_task.items():
        row = [0] * bins
        for v in vs:
            row[min(bins - 1, int((v - lo) // width))] += 1
        counts[task] = row
    return {"edges": edges, "counts": counts}


def _norm_stats(config: ConsoleConfig, step_dir: Path) -> dict | None:
    found = sorted((step_dir / "assets").glob("**/norm_stats.json")) if step_dir.is_dir() else []
    data = _read_json(found[0]) if found else None
    stats = (data or {}).get("norm_stats") if isinstance(data, dict) else None
    if not isinstance(stats, dict):
        return None
    out = {"file": str(found[0].relative_to(config.openpi.docker_data)) if found[0].is_relative_to(config.openpi.docker_data)
           else str(found[0])}
    for key, names in (("state", STATE_LABELS), ("actions", ACTION_LABELS)):
        block = stats.get(key)
        if isinstance(block, dict) and isinstance(block.get("mean"), list):
            out[key] = {"labels": _labels(names, len(block["mean"])),
                        **{k: block.get(k) for k in ("mean", "std", "q01", "q99")}}
    return out


def tag_distribution(view: Path, lengths: dict[int, int], tasks_of: dict[int, tuple[str, str]],
                     holdout: set[int]) -> dict:
    """Per value of each TAG_KEYS tag: episodes, by task, held out, and how many were set by hand. A file whose rows do
    not match the view's episodes (index and frame count) is reported, never shown."""
    path = view / TAGS_FILE
    if not path.is_file():
        return {"state": "missing", "file": TAGS_FILE}
    doc = _read_json(path)
    if not isinstance(doc, dict) or doc.get("schema_version") != TAGS_SCHEMA:
        return {"state": "mismatch", "error": f"{TAGS_FILE}: not schema_version {TAGS_SCHEMA}"}
    rows = {int(r["episode_index"]): r for r in doc.get("episodes") or [] if isinstance(r, dict) and "episode_index" in r}
    bad = [i for i, n in lengths.items() if i not in rows or rows[i].get("length") != n]
    if bad or set(rows) - set(lengths):
        return {"state": "mismatch", "error": f"{TAGS_FILE} 与数据集对不上（例如 episode {(bad or sorted(set(rows) - set(lengths)))[:5]}），"
                                             "请重新 realman-train tags refresh"}
    keys = {}
    for key in TAG_KEYS:
        slots: dict[str, dict] = {}
        for index in sorted(lengths):
            value = (rows[index].get("tags") or {}).get(key)
            slot = slots.setdefault(json.dumps(value), {"value": value, "episodes": 0, "frames": 0, "by_task": {},
                                                        "holdout": 0, "manual": 0})
            task = tasks_of[index][0]
            slot["episodes"] += 1
            slot["frames"] += lengths[index]
            slot["by_task"][task] = slot["by_task"].get(task, 0) + 1
            slot["holdout"] += index in holdout
            slot["manual"] += (rows[index].get("tag_sources") or {}).get(key) == "manual"
        keys[key] = sorted(slots.values(), key=lambda s: (s["value"] is None, str(s["value"])))
    return {"state": "ok", "snapshot_at": doc.get("snapshot_at"), "keys": keys}


def model_dataset(config: ConsoleConfig, model: str, step: int | None = None) -> dict:
    config_name, _, exp = model.partition("/")
    if not exp:
        raise BadRequest(f"model {model!r}: give config/exp")
    folder = _run_folder(config, config_name, exp)
    card = _read_json(folder / "model_card.json") or {}
    record = _read_json(folder / "console_train.json") or {}
    view_text = record.get("view") or card_path(card.get("dataset_dir"))
    if not view_text:
        raise NotFound(f"{model}: no training dataset recorded (console_train.json view / model_card dataset_dir)")
    view = Path(view_text)
    checkpoints = _checkpoints(folder)
    if step is None:
        step = checkpoints[-1] if checkpoints else None
    elif step not in checkpoints:
        raise NotFound(f"{model}: no checkpoint {step}")
    base = {"model": model, "step": step, "view": relative(config, view), "method": card.get("method"),
            "batch_size": record.get("batch_size") or card.get("batch_size"),
            "num_train_steps": record.get("num_train_steps") or card.get("num_train_steps"),
            "norm_stats": _norm_stats(config, folder / str(step)) if step is not None else None}
    if not is_dataset(view):
        return {**base, "error": f"训练数据集 {base['view']} 不在 server5090 上了（已删除或移走）"}

    contract = _read_json(view / "contract.json") or {}
    info = read_info(view)
    fps = float(info.get("fps") or contract.get("fps") or 0) or None
    lengths = {e.index: e.length for e in read_episodes(view)}
    tasks_of = episode_tasks(view)
    holdout = set(record.get("holdout") or card.get("holdout_episodes") or [])
    prompts = contract.get("prompts") or {}

    tasks: dict[str, dict] = {}
    lengths_sec: dict[str, list[float]] = {}
    for index, (task, prompt) in sorted(tasks_of.items()):
        row = tasks.setdefault(task, {"task": task, "prompt": prompts.get(task, prompt), "episodes": 0, "frames": 0,
                                      "train": 0, "holdout": 0, "first": index, "last": index})
        row["episodes"] += 1
        row["frames"] += lengths[index]
        row["holdout" if index in holdout else "train"] += 1
        row["last"] = index
        lengths_sec.setdefault(task, []).append(lengths[index] / fps if fps else float(lengths[index]))
    for task, row in tasks.items():
        vs = lengths_sec[task]
        row["duration_sec"] = sum(vs)
        row["length_sec"] = {"min": min(vs), "median": statistics.median(vs), "mean": statistics.fmean(vs), "max": max(vs)}

    cameras = [name.removeprefix("observation.images.") for name, f in (info.get("features") or {}).items()
               if f.get("dtype") == "video"]
    params = contract.get("params") or {}
    frames = sum(lengths.values())
    return {
        **base,
        "description": {
            "arm": contract.get("arm") or params.get("arm"), "cameras": cameras, "fps": fps,
            "state": contract.get("state"), "action": contract.get("action"),
            "gripper_target": contract.get("gripper_target"), "created": contract.get("created"),
            "params": {k: params[k] for k in ("linear_scale", "angular_scale", "command_latency_frames", "smoothing_window")
                       if k in params},
        },
        "totals": {"episodes": len(lengths), "frames": frames, "duration_sec": frames / fps if fps else None,
                   "train": len(lengths) - len(holdout & set(lengths)), "holdout": len(holdout & set(lengths))},
        "holdout_episodes": sorted(holdout),
        "tasks": list(tasks.values()),
        "lengths": {"unit": "s" if fps else "frames", **_histogram(lengths_sec)},
        "lineage": lineage(config, view, contract),
        "tags": tag_distribution(view, lengths, tasks_of, holdout),
    }
