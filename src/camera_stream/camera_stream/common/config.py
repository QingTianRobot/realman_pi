"""读取相机推流配置 YAML，提供点号访问的命名空间对象。"""
from __future__ import annotations

from types import SimpleNamespace

import yaml


def _to_namespace(obj):
    if isinstance(obj, dict):
        return SimpleNamespace(**{k: _to_namespace(v) for k, v in obj.items()})
    if isinstance(obj, list):
        return [_to_namespace(x) for x in obj]
    return obj


def load(path: str) -> SimpleNamespace:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return _to_namespace(data or {})
