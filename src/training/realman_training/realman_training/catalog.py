"""What the console shows, read from disk: datasets (through the summary cache), jobs, training runs, registered
models, link-check history and the serve settings the web page saved. Nothing here writes data except the settings
file in the console state directory."""

from __future__ import annotations

import csv
import json
import re
import time
from datetime import datetime
from pathlib import Path

import pyarrow

from . import serving_state
from .config import ConsoleConfig
from .datasets import discover
from .jobs import Job, StepFailed, write_json
from .lerobot_io import NotALeRobotDataset, is_dataset
from .openpi import check_name, run_dir
from .serving import model_prompts
from .steps.train import parse_metrics
from .summary_cache import SummaryCache

SETTINGS_KEYS = ("model", "checkpoint", "gpu", "port", "task")
_ROW_KEYS = ("name", "kind", "episodes", "frames", "duration_sec", "fps", "first_file_time", "last_file_time",
             "disk_bytes", "tasks", "source", "removed_episodes", "prompts")


class NotFound(LookupError):
    pass


class BadRequest(ValueError):
    pass


def _read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def relative(config: ConsoleConfig, path: str | Path) -> str:
    path, root = Path(path).resolve(), config.data_root.resolve()
    return str(path.relative_to(root)) if path.is_relative_to(root) else str(path)


def resolve_dataset(config: ConsoleConfig, rel: str) -> Path:
    if not rel or Path(rel).is_absolute() or ".." in Path(rel).parts:
        raise BadRequest(f"dataset path {rel!r}: give a path relative to data_root, without ..")
    root = config.data_root.resolve()
    path = (root / rel).resolve()
    if not path.is_relative_to(root):
        raise BadRequest(f"dataset path {rel!r} leaves data_root")
    if not is_dataset(path):
        raise NotFound(f"no dataset at {rel}")
    return path


def list_datasets(config: ConsoleConfig, cache: SummaryCache) -> list[dict]:
    rows = []
    for path in discover(config.data_root):
        rel = relative(config, path)
        try:
            entry = cache.get(path)
        except (NotALeRobotDataset, OSError, ValueError, KeyError, pyarrow.ArrowInvalid) as error:
            rows.append({"path": rel, "name": path.name, "kind": "error", "error": str(error)})
            continue
        summary = entry["summary"]
        rows.append({"path": rel, **{k: summary[k] for k in _ROW_KEYS}, "quality_counts": entry["quality_counts"]})
    # Newest first: several pulls share the recording's name, so the latest one must not hide in the middle.
    rows.sort(key=lambda row: row["path"])
    rows.sort(key=lambda row: _instant(row.get("last_file_time")), reverse=True)
    return rows


def _instant(iso: str | None) -> float:
    """Seconds since the epoch; files report local time with differing UTC offsets, so text order is not time order."""
    try:
        return datetime.fromisoformat(iso).timestamp() if iso else float("-inf")
    except ValueError:
        return float("-inf")


_CONFIG_NAME = re.compile(r"""\bname\s*=\s*["']([A-Za-z0-9_.-]*realman[A-Za-z0-9_.-]*)["']""")


def openpi_configs(config: ConsoleConfig) -> list[str]:
    """RealMan training configs: those defined in the openpi checkout plus those that already have checkpoints."""
    names: set[str] = set()
    source = config.openpi.repo / "src" / "openpi" / "training" / "config.py"
    try:
        names.update(_CONFIG_NAME.findall(source.read_text(encoding="utf-8")))
    except OSError:
        pass
    base = config.openpi.docker_data / "checkpoints"
    if base.is_dir():
        names.update(p.name for p in base.iterdir() if p.is_dir())
    return sorted(names)


def dataset_detail(config: ConsoleConfig, cache: SummaryCache, rel: str) -> dict:
    try:
        entry = cache.get(resolve_dataset(config, rel))
    except (NotALeRobotDataset, OSError, ValueError, KeyError, TypeError, pyarrow.ArrowInvalid) as error:
        raise BadRequest(str(error)) from error
    return {"path": rel, **{k: v for k, v in entry.items() if k not in ("fingerprint", "version")}}


def job_row(job: Job) -> dict:
    status = job.status()
    try:
        params = dict(job.params().get("params") or {})
    except (OSError, ValueError):
        params = {}
    params.pop("config", None)
    row = {k: status.get(k) for k in ("id", "kind", "state", "created", "started", "ended", "error", "progress", "result")}
    return {**row, "params": params}


def _metrics(folder: Path, exp: str, docker_data: Path) -> list[dict]:
    path = folder / "metrics.csv"
    if path.is_file():
        rows = []
        with path.open(newline="", encoding="utf-8") as handle:
            for raw in csv.DictReader(handle):
                row = {}
                for key, value in raw.items():
                    try:
                        v = int(value) if key == "step" else float(value)
                        row[key] = v if key == "step" or (v == v and v != float("inf") and v != float("-inf")) else None
                    except (TypeError, ValueError):
                        pass
                rows.append(row)
        return rows
    log = docker_data / "wandb" / f"{exp}.log"
    return parse_metrics(log.read_text(encoding="utf-8", errors="replace")) if log.is_file() else []


def _eval_latest(evals: dict | None) -> dict | None:
    steps = sorted((int(s) for s in (evals or {}) if s.isdigit()), reverse=True)
    for step in steps:
        tasks = {t: r["mae"] for t, r in evals[str(step)].items() if t != "prompt_swap" and isinstance(r, dict) and "mae" in r}
        if tasks:
            return {"step": step, "tasks": tasks}
    return None


def _checkpoints(folder: Path) -> list[int]:
    return sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())


def card_path(text: str | None) -> str | None:
    """A hand-written card's dataset_dir may read `server5090:~/data/...`: drop the host and expand ~."""
    if not text:
        return None
    host, sep, rest = text.partition(":")
    if sep and "/" not in host and rest.startswith(("/", "~")):
        text = rest
    return str(Path(text).expanduser())


def _record_from_card(card: dict | None) -> dict:
    """What console_train.json would hold, for a run trained by hand (it has only a model card)."""
    if not card:
        return {}
    match = re.search(r"GPU ([0-9][0-9,]*)", str(card.get("gpus") or ""))
    return {"view": card_path(card.get("dataset_dir")), "started": card.get("trained_start"),
            "ended": card.get("trained_end"), "batch_size": card.get("batch_size"),
            "num_train_steps": card.get("num_train_steps"),
            "gpus": [int(g) for g in match.group(1).split(",") if g] if match else None}


# openpi's tqdm logger, every ~10 s: "Progress on: 1.69kit/30.0kit rate:1.3it/s remaining:5:50:20 elapsed:21:29".
_PROGRESS = re.compile(r"Progress on: \S+ rate:([0-9.]+)(it/s|s/it) remaining:((?:\d+d ?)?[0-9:]+)")
_PACE_TAIL_BYTES = 16384
# A live run whose log has been quiet this long is shown as stalled (tqdm writes every ~10 s; a checkpoint save
# pauses it for about a minute).
STALE_SEC = 300


def _clock_sec(text: str) -> float:
    days, _, clock = text.rpartition("d")
    total = 0.0
    for part in clock.strip().split(":"):
        total = total * 60 + int(part)
    return total + (int(days) * 86400 if days else 0)


def _iso(stamp: float) -> str:
    return datetime.fromtimestamp(stamp).astimezone().isoformat(timespec="seconds")


def _log_tail(path: Path) -> tuple[str | None, float | None]:
    try:
        with path.open("rb") as handle:
            size = handle.seek(0, 2)
            handle.seek(max(0, size - _PACE_TAIL_BYTES))
            return handle.read().decode(errors="replace"), path.stat().st_mtime
    except OSError:
        return None, None


def pace_of(record: dict, last_step: int | None, log: str | None, updated: float | None, now: float) -> dict | None:
    """Training speed (steps/s) and, while it runs, the time left and the finish time. A live run uses the last
    tqdm line of its log (timed by the log's mtime); without one, and for a finished run, the average since start."""
    total = record.get("num_train_steps")
    if record.get("started") and record.get("ended"):
        span = _instant(record["ended"]) - _instant(record["started"])
        rate = last_step / span if last_step and 0 < span < float("inf") else None
        return {"source": "average", "rate": rate, "remaining_sec": None, "eta": None, "updated": record["ended"],
                "stale": False}
    if not record.get("started") or updated is None:
        return None
    matches = _PROGRESS.findall(log) if log else []
    if matches:
        value, unit, remaining = matches[-1]
        rate = float(value) if unit == "it/s" else (1 / float(value) if float(value) > 0 else None)
        remaining_sec: float | None = _clock_sec(remaining)
        source = "tqdm"
    else:
        span = updated - _instant(record["started"])
        rate = last_step / span if last_step and 0 < span < float("inf") else None
        remaining_sec = (total - last_step) / rate if rate and total and last_step is not None else None
        source = "average"
    return {"source": source, "rate": rate, "remaining_sec": remaining_sec,
            "eta": _iso(updated + remaining_sec) if remaining_sec is not None else None,
            "updated": _iso(updated), "stale": now - updated > STALE_SEC}


def _run_row(config: ConsoleConfig, folder: Path, metrics: list[dict],
             docker_data: Path | None = None) -> dict:
    card = _read_json(folder / "model_card.json")
    record = _read_json(folder / "console_train.json") or _record_from_card(card)
    losses = [row["loss"] for row in metrics if "loss" in row]
    view = record.get("view")
    last_step = record.get("last_step") or (metrics[-1]["step"] if metrics else None)
    log, updated = (None, None)
    if record.get("started") and not record.get("ended") and docker_data is not None:
        log, updated = _log_tail(docker_data / "wandb" / f"{folder.name}.log")
    return {
        "name": f"{folder.parent.name}/{folder.name}",
        "config": folder.parent.name,
        "exp": folder.name,
        "checkpoints": _checkpoints(folder),
        "view": relative(config, view) if view else None,
        "gpus": record.get("gpus"),
        "batch_size": record.get("batch_size"),
        "num_train_steps": record.get("num_train_steps"),
        "last_step": last_step,
        "started": record.get("started"),
        "ended": record.get("ended"),
        "exit_code": record.get("exit_code"),
        "registered": card is not None,
        "status": (card or {}).get("status"),
        "last_loss": losses[-1] if losses else None,
        "eval_latest": _eval_latest(_read_json(folder / "eval" / "summary.json") or _eval_from_card(card)),
        "pace": pace_of(record, last_step, log, updated, time.time()),
    }


def _run_folders(config: ConsoleConfig) -> list[Path]:
    base = config.openpi.docker_data / "checkpoints"
    if not base.is_dir():
        return []
    folders = []
    for config_dir in sorted(p for p in base.iterdir() if p.is_dir()):
        for folder in sorted(p for p in config_dir.iterdir() if p.is_dir()):
            if (folder / "console_train.json").is_file() or (folder / "model_card.json").is_file() or _checkpoints(folder):
                folders.append(folder)
    return folders


def list_runs(config: ConsoleConfig) -> list[dict]:
    docker_data = config.openpi.docker_data
    rows = [_run_row(config, f, _metrics(f, f.name, docker_data), docker_data) for f in _run_folders(config)]
    return sorted(rows, key=lambda row: row["started"] or "", reverse=True)


def _downsample(rows: list[dict], max_points: int) -> list[dict]:
    if len(rows) <= max_points:
        return rows
    stride = -(-len(rows) // max_points)
    picked = rows[::stride]
    return picked if picked[-1] is rows[-1] else [*picked[:-1], rows[-1]]


def _run_folder(config: ConsoleConfig, config_name: str, exp: str) -> Path:
    try:
        check_name("config_name", config_name)
        check_name("exp", exp)
    except StepFailed as error:
        raise BadRequest(str(error)) from None
    folder = run_dir(config.openpi, config_name, exp)
    if not folder.is_dir():
        raise NotFound(f"no run {config_name}/{exp}")
    return folder


def _eval_from_card(card: dict | None) -> dict | None:
    """Eval results of a run evaluated by hand: only its model card has them (no eval/summary.json)."""
    loops = (card or {}).get("open_loop_eval") or {}
    baseline = loops.get("zero_baseline") or {}
    evals = {str(step): {task: {"mae": mae, "zero_baseline": baseline.get(task)} for task, mae in tasks.items()}
             for step, tasks in loops.items() if str(step).isdigit() and isinstance(tasks, dict)}
    for key, swap in (card or {}).items():
        step = key.removeprefix("prompt_swap_")
        if key.startswith("prompt_swap_") and step in evals and isinstance(swap, dict):
            tasks = sorted({k.rsplit("_", 1)[0] for k in swap if k.endswith(("_correct", "_swapped"))})
            evals[step]["prompt_swap"] = {t: {t: swap.get(f"{t}_correct"), "其他任务的 prompt": swap.get(f"{t}_swapped")}
                                          for t in tasks}
    return evals or None


def run_detail(config: ConsoleConfig, config_name: str, exp: str, max_points: int = 1000) -> dict:
    folder = _run_folder(config, config_name, exp)
    metrics = _metrics(folder, exp, config.openpi.docker_data)
    picked = _downsample(metrics, max_points)
    keys = list(dict.fromkeys(k for row in picked for k in row))
    series = {key: [row.get(key) for row in picked] for key in keys} if picked else {"step": []}
    markdown = folder / "MODEL_CARD.md"
    card = _read_json(folder / "model_card.json")
    return {
        **_run_row(config, folder, metrics, config.openpi.docker_data),
        "record": _read_json(folder / "console_train.json"),
        "metrics": series,
        "eval": _read_json(folder / "eval" / "summary.json") or _eval_from_card(card),
        "card": card,
        "card_markdown": markdown.read_text(encoding="utf-8") if markdown.is_file() else None,
    }


_FROM_RECORD = object()


def list_models(config: ConsoleConfig, serving_name: str | None | object = _FROM_RECORD) -> dict:
    """serving_name: the model the live serve status reports (None = nothing served); default = serving.json."""
    if serving_name is _FROM_RECORD:
        record = serving_state.load(config)
        serving_name = record.get("model") if record and not record.get("stopped") else None
    models = []
    for folder in _run_folders(config):
        card = _read_json(folder / "model_card.json")
        if card is None:
            continue
        name = f"{folder.parent.name}/{folder.name}"
        loops = card.get("open_loop_eval") or {}
        steps = sorted((int(s) for s in loops if str(s).isdigit()), reverse=True)
        open_loop = None
        if steps:
            open_loop = {"step": steps[0], "tasks": loops[str(steps[0])], "zero_baseline": loops.get("zero_baseline") or {}}
        dataset_dir = card_path(card.get("dataset_dir"))
        models.append({
            "name": name, "config": folder.parent.name, "exp": folder.name,
            "method": card.get("method"), "trained_start": card.get("trained_start"), "trained_end": card.get("trained_end"),
            "dataset": relative(config, dataset_dir) if dataset_dir else None, "dataset_dir": dataset_dir,
            "tasks": card.get("tasks") or {}, "episodes": card.get("episodes"),
            "holdout_episodes": card.get("holdout_episodes") or [], "checkpoints": _checkpoints(folder),
            "open_loop": open_loop, "status": card.get("status"), "serving": name == serving_name,
        })
    models.sort(key=lambda m: m["trained_end"] or "", reverse=True)
    registry = config.openpi.docker_data / "checkpoints" / "MODELS.md"
    return {"models": models, "registry_markdown": registry.read_text(encoding="utf-8") if registry.is_file() else None}


def linkcheck_history(config: ConsoleConfig, limit: int) -> list[dict]:
    folder = config.console_dir / "linkcheck"
    if not folder.is_dir():
        return []
    entries = []
    for path in sorted(folder.glob("*.json"), reverse=True)[:limit]:
        data = _read_json(path)
        if isinstance(data, dict):
            entries.append(data)
    return entries


def _settings_path(config: ConsoleConfig) -> Path:
    return config.console_dir / "serve_settings.json"


def serve_defaults(config: ConsoleConfig) -> dict:
    sc = config.serving
    return {"model": sc.model, "checkpoint": sc.checkpoint, "gpu": sc.gpu, "port": sc.port, "task": None}


def load_settings(config: ConsoleConfig) -> dict:
    data = _read_json(_settings_path(config))
    return {k: data[k] for k in SETTINGS_KEYS if k in data} if isinstance(data, dict) else {}


def save_settings(config: ConsoleConfig, data: dict) -> None:
    _settings_path(config).parent.mkdir(parents=True, exist_ok=True)
    write_json(_settings_path(config), {k: data[k] for k in SETTINGS_KEYS if k in data})


def effective_settings(config: ConsoleConfig) -> dict:
    return {**serve_defaults(config), **load_settings(config)}


def serve_models(config: ConsoleConfig) -> list[dict]:
    models = []
    for folder in _run_folders(config):
        if not (folder / "model_card.json").is_file():
            continue
        steps = _checkpoints(folder)
        prompts = model_prompts(folder)
        if steps and prompts:
            models.append({"name": f"{folder.parent.name}/{folder.name}", "checkpoints": steps, "prompts": prompts})
    return models
