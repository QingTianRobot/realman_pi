"""Normalization stats for an openpi config + its training view (`opic-norm`), unless they already exist."""

from __future__ import annotations

import shlex
from pathlib import Path

from ..config import load_config
from ..jobs import StepFailed
from ..openpi import Compose, check_holdout, check_name, config_info, norm_stats_path, require_view
from ..runner import Runner, compact


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    view = Path(params["view"]).expanduser().resolve()
    name = check_name("config_name", params["config_name"])
    summary = require_view(view)
    compose = Compose(config.openpi, view)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    if not view.name.startswith(info.repo_id.split("/")[-1]):
        log(f"note: config {name} names its data {info.repo_id}; mounting {view.name}")
    path = norm_stats_path(config.openpi, info)
    if path.exists() and not params.get("force"):
        log(f"norm stats exist: {path}")
        return {"norm_stats": str(path), "computed": False}
    argv = compose.run(f"opic-norm --config-name {shlex.quote(name)}")
    log("$ " + shlex.join(argv))
    if params.get("dry_run"):
        return {"norm_stats": str(path), "computed": False, "dry_run": True, "command": argv}
    last = []
    code = runner.stream(argv, lambda line: last.append(compact(line)), env=compose.env())
    for line in last[-5:]:
        log(line)
    if code or not path.exists():
        raise StepFailed(f"opic-norm exited {code} and {path} is {'there' if path.exists() else 'missing'}")
    log(f"norm stats written: {path}")
    return {"norm_stats": str(path), "computed": True}
