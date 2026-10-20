"""Behavior-tree files the :8765 page can start, and the operators' shared favorites."""

from __future__ import annotations

import os
from pathlib import Path
import re
import tempfile
from typing import Any
import xml.etree.ElementTree as ElementTree

import yaml

TREE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.xml$")
FAVORITES_SCHEMA = "realman_bt_favorites.v1"
MAX_TREES = 200


def _tree_summary(path: Path) -> dict[str, Any]:
    """Name plus the realman_* root attributes that decide what a start does."""
    summary: dict[str, Any] = {"name": path.name, "main_tree": "", "launch": "", "arms": [], "valid": True}
    try:
        root = next(ElementTree.iterparse(path, events=("start",)))[1]
    except (ElementTree.ParseError, StopIteration, OSError):
        summary["valid"] = False
        return summary
    summary["main_tree"] = root.get("main_tree_to_execute", "")
    summary["launch"] = root.get("realman_launch", "")
    arms = root.get("realman_required_arms") or root.get("realman_arm_id") or ""
    summary["arms"] = [arm for arm in arms.split(",") if arm]
    return summary


def read_favorites(path: Path) -> list[str]:
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return []
    favorites = document.get("favorites") if isinstance(document, dict) else None
    if not isinstance(favorites, list):
        return []
    seen: list[str] = []
    for name in favorites:
        if isinstance(name, str) and TREE_NAME.fullmatch(name) and name not in seen:
            seen.append(name)
    return seen


def list_trees(tree_dir: Path, favorites_file: Path) -> list[dict[str, Any]]:
    """Every *.xml in tree_dir: pinned ones first in pin order, then the rest by name."""
    try:
        files = sorted(path for path in tree_dir.iterdir() if path.is_file() and TREE_NAME.fullmatch(path.name))
    except OSError:
        return []
    favorites = [name for name in read_favorites(favorites_file) if (tree_dir / name).is_file()]
    trees = {path.name: _tree_summary(path) for path in files[:MAX_TREES]}
    ordered = [trees[name] for name in favorites if name in trees]
    ordered += [tree for name, tree in trees.items() if name not in favorites]
    for tree in ordered:
        tree["favorite"] = tree["name"] in favorites
    return ordered


def set_favorite(tree_dir: Path, favorites_file: Path, name: Any, favorite: Any) -> list[str]:
    if not isinstance(name, str) or not TREE_NAME.fullmatch(name) or not (tree_dir / name).is_file():
        raise ValueError("unknown behavior-tree file")
    if not isinstance(favorite, bool):
        raise ValueError("favorite must be true or false")
    favorites = read_favorites(favorites_file)
    if favorite and name not in favorites:
        favorites.append(name)
    elif not favorite and name in favorites:
        favorites.remove(name)
    favorites_file.parent.mkdir(parents=True, exist_ok=True)
    payload = yaml.safe_dump({"schema": FAVORITES_SCHEMA, "favorites": favorites}, allow_unicode=True)
    # Atomic replace so two browsers pinning at once never leave a torn file.
    descriptor, temporary = tempfile.mkstemp(dir=favorites_file.parent, prefix=".favorites-", suffix=".yaml")
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            stream.write(payload)
        os.replace(temporary, favorites_file)
    except BaseException:
        Path(temporary).unlink(missing_ok=True)
        raise
    return favorites
