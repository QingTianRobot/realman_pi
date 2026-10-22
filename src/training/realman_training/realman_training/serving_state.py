"""What `serve start` started (model, checkpoint, GPU, port, prompt): <console_dir>/serving.json."""

from __future__ import annotations

import json
from pathlib import Path

from .config import ConsoleConfig
from .jobs import write_json


def path(config: ConsoleConfig) -> Path:
    return config.console_dir / "serving.json"


def load(config: ConsoleConfig) -> dict:
    try:
        return json.loads(path(config).read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        return {}


def save(config: ConsoleConfig, data: dict) -> None:
    path(config).parent.mkdir(parents=True, exist_ok=True)
    write_json(path(config), data)
