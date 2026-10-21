"""Dataset summary + per-episode quality for the console, cached in <dataset>/.console/summary.json.

The cache is keyed by a fingerprint of every file under meta/ and data/ (path, size, mtime), the provenance files
(contract.json, clean manifests) and the quality thresholds, so it is rebuilt only when the data or the rules change.
A dataset the console cannot write to is cached in memory only.
"""

from __future__ import annotations

import dataclasses
import hashlib
import json
import threading
from pathlib import Path

from .config import QualityConfig
from .datasets import summarize
from .jobs import now, write_json
from .quality import QualityUnavailable, inspect_dataset, suggested_drops

CACHE_VERSION = 1
TRACE_POINTS = 60
CACHE_DIR = ".console"


def _stamp(digest, root: Path, path: Path) -> None:
    stat = path.stat()
    digest.update(f"{path.relative_to(root) if path.is_relative_to(root) else path}:{stat.st_size}:{stat.st_mtime_ns}\n".encode())


def fingerprint(root: Path, quality: QualityConfig) -> str:
    root = Path(root).resolve()
    digest = hashlib.sha256(json.dumps(dataclasses.asdict(quality), sort_keys=True).encode())
    for folder in ("meta", "data"):
        base = root / folder
        if base.is_dir():
            for path in sorted(base.rglob("*")):
                if path.is_file():
                    _stamp(digest, root, path)
    for path in (root / "contract.json", root / "clean_manifest.json", Path(f"{root}.clean_manifest.json")):
        if path.is_file():
            _stamp(digest, root, path)
    return digest.hexdigest()


def build(root: Path, quality: QualityConfig) -> dict:
    summary = summarize(root)
    traces: dict[int, list[float]] = {}
    results, unavailable = None, None
    try:
        results = inspect_dataset(root, quality, traces=traces, trace_points=TRACE_POINTS)
    except QualityUnavailable as error:
        unavailable = str(error)
    counts = None
    if results is not None:
        counts = {verdict: sum(q.verdict == verdict for q in results) for verdict in ("ok", "suggest_drop", "warn")}
    return {
        "version": CACHE_VERSION,
        "built": now(),
        "summary": summary.to_dict(),
        "quality": None if results is None else [q.to_dict() for q in results],
        "quality_unavailable": unavailable,
        "suggested_drops": suggested_drops(results) if results is not None else [],
        "quality_counts": counts,
        "traces": {str(episode): values for episode, values in traces.items()},
    }


class SummaryCache:
    def __init__(self, quality: QualityConfig):
        self._quality = quality
        self._memory: dict[Path, dict] = {}
        self._locks: dict[Path, threading.Lock] = {}
        self._guard = threading.Lock()

    def _lock(self, root: Path) -> threading.Lock:
        with self._guard:
            return self._locks.setdefault(root, threading.Lock())

    def get(self, root: str | Path) -> dict:
        root = Path(root).resolve()
        with self._lock(root):
            key = fingerprint(root, self._quality)
            hit = self._memory.get(root)
            if hit is not None and hit["fingerprint"] == key:
                return hit
            path = root / CACHE_DIR / "summary.json"
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if data.get("version") == CACHE_VERSION and data.get("fingerprint") == key:
                    self._memory[root] = data
                    return data
            except (OSError, ValueError):
                pass
            data = {**build(root, self._quality), "fingerprint": key}
            try:
                path.parent.mkdir(exist_ok=True)
                write_json(path, data)
            except OSError:
                pass  # read-only dataset: keep it in memory only
            self._memory[root] = data
            return data
