"""The only way the web console builds step parameters: one whitelist per job kind.

Unknown keys are refused, dataset paths must be relative to data_root, new directories are names under data_root
that must not exist yet, and model/task/GPU/port values are checked before a job starts. The steps still do their
own checks (busy GPUs, behaviour-tree mode, refused targets) when they run.
"""

from __future__ import annotations

from pathlib import Path

import pyarrow

from . import linkcheck
from .catalog import BadRequest, NotFound, resolve_dataset, select_preview
from .config import ARMS, ConsoleConfig
from .datasets import summarize
from .jobs import STEPS, StepFailed
from .lerobot_io import NotALeRobotDataset
from .openpi import SAFE_NAME, parse_gpus
from .serving import resolve_model
from .steps import clean as clean_step
from .steps import pull as pull_step
from .steps import view as view_step

ALLOWED = {
    "pull": {"dataset", "name"},
    "clean": {"src", "drop", "reasons", "dst", "where"},
    "view": {"src", "task_prompts", "arm", "dst", "dry_run"},
    "norm": {"config_name", "view", "force", "dry_run"},
    "train": {"config_name", "view", "exp", "gpus", "batch", "steps", "resume", "dry_run"},
    "eval": {"config_name", "exp", "view", "gpu", "checkpoints", "stride", "prompt_swap", "dry_run"},
    "register": {"config_name", "exp", "status", "method", "force"},
    "serve": {"action", "model", "checkpoint", "gpu", "port", "task", "dry_run"},
    "linkcheck": {"only"},
    "tags_refresh": {"path"},
}
SETTINGS = {"model", "checkpoint", "gpu", "port", "task"}
_TEXT_MAX = 500


def _bool(raw: dict, key: str) -> bool:
    value = raw.get(key, False)
    if not isinstance(value, bool):
        raise BadRequest(f"{key} must be true or false")
    return value


def _int(raw: dict, key: str, low: int, high: int) -> int | None:
    value = raw.get(key)
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise BadRequest(f"{key} must be an integer in {low}..{high}")
    return value


def _text(raw: dict, key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, str) or len(value) > _TEXT_MAX:
        raise BadRequest(f"{key} must be text of at most {_TEXT_MAX} characters")
    return value.strip() or None


def _name(value, key: str) -> str:
    if not isinstance(value, str) or not SAFE_NAME.match(value):
        raise BadRequest(f"{key} {value!r}: use a plain name (letters, digits, _ . -)")
    return value


def _dataset(config: ConsoleConfig, raw: dict, key: str) -> Path:
    if not isinstance(raw.get(key), str):
        raise BadRequest(f"{key} is required: a dataset path relative to data_root")
    try:
        return resolve_dataset(config, raw[key])
    except NotFound as error:
        raise BadRequest(str(error)) from None


def _new_dir(config: ConsoleConfig, raw: dict, key: str, default: Path) -> str:
    target = config.data_root / _name(raw[key], key) if raw.get(key) else Path(default)
    if target.exists():
        raise BadRequest(f"{key} {target.name} exists under data_root: pick another name (nothing is overwritten)")
    return str(target)


def _summarize(path: Path, config: ConsoleConfig | None = None) -> object:
    """Wrap summarize() so dataset errors become BadRequest."""
    try:
        return summarize(path)
    except (NotALeRobotDataset, OSError, ValueError, KeyError, pyarrow.ArrowInvalid,
            TypeError, AttributeError) as error:
        from . import catalog as _catalog
        label = _catalog.relative(config, path) if config is not None else path.name
        raise BadRequest(f"{label}: {error}") from None


def _view(config: ConsoleConfig, raw: dict) -> str:
    path = _dataset(config, raw, "view")
    if _summarize(path, config).kind != "view":
        raise BadRequest(f"{raw['view']} is not a training view (no contract.json)")
    return str(path)


def _where(value) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or any(not isinstance(v, str) or "=" not in v or len(v) > _TEXT_MAX for v in value):
        raise BadRequest("where must be a list of key=v1,v2 texts")
    return [v.strip() for v in value]


def _episodes(value, key: str) -> list[int]:
    if not isinstance(value, list) or any(isinstance(v, bool) or not isinstance(v, int) or v < 0 for v in value):
        raise BadRequest(f"{key} must be a list of episode numbers")
    return sorted(set(value))


def _check_keys(raw: dict, allowed: set[str], what: str) -> None:
    if not isinstance(raw, dict):
        raise BadRequest(f"{what} must be an object")
    unknown = sorted(set(raw) - allowed)
    if unknown:
        raise BadRequest(f"unknown {what} keys {unknown}; allowed: {sorted(allowed)}")


def _model_checks(config: ConsoleConfig, model: str | None, checkpoint, task: str | None):
    try:
        resolved = resolve_model(config, model, checkpoint)
    except (StepFailed, ValueError) as error:
        raise BadRequest(str(error)) from None
    if task is not None and task not in resolved.prompts:
        raise BadRequest(f"task {task!r} is not one of {resolved.name}'s tasks: {', '.join(resolved.prompts)}")
    return resolved


def validate_settings(raw: dict, config: ConsoleConfig) -> dict:
    _check_keys(raw, SETTINGS, "settings")
    clean: dict = {}
    if raw.get("model") is not None:
        clean["model"] = _text(raw, "model")
    if "checkpoint" in raw:
        value = raw["checkpoint"]
        if value in (None, ""):
            clean["checkpoint"] = ""
        elif isinstance(value, bool) or not isinstance(value, (int, str)) or (isinstance(value, int) and value < 0):
            raise BadRequest("checkpoint must be a step number or empty (= the latest)")
        elif isinstance(value, str) and not (value.isascii() and value.isdigit()):
            raise BadRequest("checkpoint must be a step number or empty (= the latest)")
        else:
            try:
                clean["checkpoint"] = str(int(value))
            except ValueError:
                raise BadRequest("checkpoint must be a step number or empty (= the latest)") from None
    for key, low, high in (("gpu", 0, 15), ("port", 1, 65535)):
        value = _int(raw, key, low, high)
        if value is not None:
            clean[key] = value
    if "task" in raw:
        clean["task"] = _text(raw, "task")
    effective = {**{"model": config.serving.model, "checkpoint": config.serving.checkpoint}, **clean}
    _model_checks(config, effective["model"], effective["checkpoint"], effective.get("task"))
    return clean


def build(kind: str, raw: dict, config: ConsoleConfig, settings: dict | None = None) -> dict:
    if not isinstance(kind, str) or kind not in ALLOWED or kind not in STEPS:
        raise BadRequest(f"unknown job kind {kind!r}; one of {sorted(ALLOWED)}")
    raw = raw or {}
    _check_keys(raw, ALLOWED[kind], f"{kind} params")
    params: dict = {"config": str(config.source)}
    if kind == "pull":
        if raw.get("dataset") is not None:
            params["dataset"] = _name(raw["dataset"], "dataset")
        params["target"] = _new_dir(config, raw, "name", pull_step.default_target(config.data_root))
        return {"config": params["config"], "target": params["target"],
                **({"dataset": params["dataset"]} if "dataset" in params else {})}
    if kind == "clean":
        src = _dataset(config, raw, "src")
        drop = _episodes(raw.get("drop") or [], "drop")
        where = _where(raw.get("where"))
        tag_drops = select_preview(config, raw["src"], where)["drop"] if where else []
        if not drop and not tag_drops:
            raise BadRequest("nothing to drop: tick at least one episode, or a tag filter that some episode fails")
        reasons = raw.get("reasons") or {}
        if not isinstance(reasons, dict) or any(not isinstance(v, str) or len(v) > _TEXT_MAX for v in reasons.values()):
            raise BadRequest("reasons must map dropped episode numbers to text")
        stray = sorted(set(reasons) - {str(e) for e in drop})
        if stray:
            raise BadRequest(f"reasons for episodes that are not dropped: {stray}")
        params.update(src=str(src), drop=drop)
        if reasons:
            params["reasons"] = dict(reasons)
        if where:
            params["where"] = where
        params["dst"] = _new_dir(config, raw, "dst", clean_step.default_dst(config.data_root, src))
        return params
    if kind == "view":
        src = _dataset(config, raw, "src")
        if _summarize(src, config).kind == "view":
            raise BadRequest(f"{raw['src']} is already a training view: build a view from a raw or cleaned set")
        prompts = raw.get("task_prompts") or {}
        if not isinstance(prompts, dict) or any(not isinstance(k, str) or not isinstance(v, str) or not v.strip()
                                                or len(v) > _TEXT_MAX for k, v in prompts.items()):
            raise BadRequest("task_prompts must map task names to non-empty prompts")
        arm = raw.get("arm")
        if arm is not None and arm not in ARMS:
            raise BadRequest(f"arm must be one of {ARMS}")
        params.update(src=str(src), dst=_new_dir(config, raw, "dst", view_step.default_dst(config.data_root, src)),
                      task_prompts={k: v.strip() for k, v in prompts.items()}, dry_run=_bool(raw, "dry_run"))
        if arm is not None:
            params["arm"] = arm
        return params
    if kind == "tags_refresh":
        return {**params, "path": str(_dataset(config, raw, "path"))}
    if kind in ("norm", "train", "eval", "register"):
        params["config_name"] = _name(raw.get("config_name"), "config_name")
    if kind == "norm":
        return {**params, "view": _view(config, raw), "force": _bool(raw, "force"), "dry_run": _bool(raw, "dry_run")}
    if kind == "train":
        try:
            gpus = ",".join(map(str, parse_gpus(str(raw.get("gpus", "")))))
        except ValueError as error:
            raise BadRequest(f"gpus: {error}") from None
        return {**params, "view": _view(config, raw), "exp": _name(raw.get("exp"), "exp"), "gpus": gpus,
                "batch": _int(raw, "batch", 1, 1024), "steps": _int(raw, "steps", 1, 10_000_000),
                "resume": _bool(raw, "resume"), "attach": False, "dry_run": _bool(raw, "dry_run")}
    if kind == "eval":
        gpu = _int(raw, "gpu", 0, 15)
        if gpu is None:
            raise BadRequest("gpu is required")
        checkpoints = raw.get("checkpoints")
        swap = raw.get("prompt_swap", True)
        if not isinstance(swap, bool):
            raise BadRequest("prompt_swap must be true or false")
        return {**params, "exp": _name(raw.get("exp"), "exp"), "view": _view(config, raw), "gpu": str(gpu),
                "checkpoints": _episodes(checkpoints, "checkpoints") if checkpoints else None,
                "stride": _int(raw, "stride", 1, 1000), "prompt_swap": None if swap else False,
                "dry_run": _bool(raw, "dry_run")}
    if kind == "register":
        return {**params, "exp": _name(raw.get("exp"), "exp"), "status": _text(raw, "status"),
                "method": _text(raw, "method"), "force": _bool(raw, "force")}
    if kind == "serve":
        action = raw.get("action")
        if action not in ("start", "stop"):
            raise BadRequest("action must be start or stop")
        if action == "stop":
            extra = sorted(set(raw) - {"action", "dry_run"})
            if extra:
                raise BadRequest(f"stop takes no {extra}")
            return {**params, "action": "stop", "dry_run": _bool(raw, "dry_run")}
        merged = {**(settings or {}), **{k: v for k, v in raw.items() if k in SETTINGS}}
        clean = validate_settings({k: v for k, v in merged.items() if k in SETTINGS}, config)
        effective = {"model": config.serving.model, "checkpoint": "", "gpu": config.serving.gpu,
                     "port": config.serving.port, "task": None, **clean}
        return {**params, "action": "start", "model": effective["model"],
                "checkpoint": int(effective["checkpoint"]) if effective["checkpoint"] else None,
                "gpu": effective["gpu"], "port": effective["port"], "task": effective["task"],
                "dry_run": _bool(raw, "dry_run")}
    only = raw.get("only")
    if only is not None and (not isinstance(only, list) or not only or set(only) - set(linkcheck.ITEMS)):
        raise BadRequest(f"only must be a non-empty subset of {list(linkcheck.ITEMS)}")
    return {**params, "only": list(only) if only else None}
