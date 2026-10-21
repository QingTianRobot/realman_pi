"""What the console shows, read from disk: datasets (through the summary cache), jobs, training runs, registered
models, link-check history and the serve settings the web page saved. Nothing here writes data except the settings
file in the console state directory."""

from __future__ import annotations

import csv
import json
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
    return rows


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


def _run_row(config: ConsoleConfig, folder: Path, metrics: list[dict]) -> dict:
    record = _read_json(folder / "console_train.json") or {}
    card = _read_json(folder / "model_card.json")
    losses = [row["loss"] for row in metrics if "loss" in row]
    view = record.get("view")
    return {
        "name": f"{folder.parent.name}/{folder.name}",
        "config": folder.parent.name,
        "exp": folder.name,
        "checkpoints": _checkpoints(folder),
        "view": relative(config, view) if view else None,
        "gpus": record.get("gpus"),
        "batch_size": record.get("batch_size"),
        "num_train_steps": record.get("num_train_steps"),
        "last_step": record.get("last_step") or (metrics[-1]["step"] if metrics else None),
        "started": record.get("started"),
        "ended": record.get("ended"),
        "exit_code": record.get("exit_code"),
        "registered": card is not None,
        "status": (card or {}).get("status"),
        "last_loss": losses[-1] if losses else None,
        "eval_latest": _eval_latest(_read_json(folder / "eval" / "summary.json")),
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
    rows = [_run_row(config, f, _metrics(f, f.name, config.openpi.docker_data)) for f in _run_folders(config)]
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


def run_detail(config: ConsoleConfig, config_name: str, exp: str, max_points: int = 1000) -> dict:
    folder = _run_folder(config, config_name, exp)
    metrics = _metrics(folder, exp, config.openpi.docker_data)
    picked = _downsample(metrics, max_points)
    keys = list(dict.fromkeys(k for row in picked for k in row))
    series = {key: [row.get(key) for row in picked] for key in keys} if picked else {"step": []}
    markdown = folder / "MODEL_CARD.md"
    return {
        **_run_row(config, folder, metrics),
        "record": _read_json(folder / "console_train.json"),
        "metrics": series,
        "eval": _read_json(folder / "eval" / "summary.json"),
        "card": _read_json(folder / "model_card.json"),
        "card_markdown": markdown.read_text(encoding="utf-8") if markdown.is_file() else None,
    }


def list_models(config: ConsoleConfig) -> dict:
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
        dataset_dir = card.get("dataset_dir")
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
