"""What a LeRobot v3 dataset contains: counts, time span, format, tasks, cameras, size, provenance."""

from __future__ import annotations

import dataclasses
import json
import os
from collections import Counter
from datetime import datetime
from pathlib import Path

from .lerobot_io import read_episodes, read_info, is_dataset

_VIDEO_PREFIX = "observation.images."


@dataclasses.dataclass(frozen=True)
class Camera:
    key: str
    codec: str | None
    height: int | None
    width: int | None


@dataclasses.dataclass(frozen=True)
class DatasetSummary:
    path: str
    name: str
    kind: str  # raw | clean | view
    codebase_version: str
    robot_type: str
    fps: float
    episodes: int
    frames: int
    duration_sec: float
    tasks: dict[str, int]  # episodes per task
    task_frames: dict[str, int]
    features: dict[str, dict]  # non-video features: name -> {"dtype", "shape"}
    cameras: tuple[Camera, ...]
    disk_bytes: int
    first_file_time: str | None  # oldest / newest episode data file, local time with UTC offset, ISO 8601
    last_file_time: str | None
    source: str | None
    removed_episodes: int | None
    prompts: dict[str, str]

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


def _manifest(root: Path) -> dict | None:
    for path in (Path(f"{root}.clean_manifest.json"), root / "clean_manifest.json"):
        if path.is_file():
            return json.loads(path.read_text(encoding="utf-8"))
    return None


def _disk_bytes(root: Path) -> int:
    total = 0
    for folder, _, files in os.walk(root):
        for name in files:
            path = Path(folder) / name
            if not path.is_symlink():
                total += path.stat().st_size
    return total


def _iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp).astimezone().isoformat(timespec="seconds")


def summarize(root: str | Path) -> DatasetSummary:
    root = Path(root).resolve()
    info = read_info(root)
    episodes = read_episodes(root)
    fps = float(info.get("fps", 0) or 0)
    frames = sum(e.length for e in episodes)
    tasks = Counter(e.task for e in episodes)
    task_frames: Counter[str] = Counter()
    for episode in episodes:
        task_frames[episode.task] += episode.length

    features, cameras = {}, []
    for name, feature in info.get("features", {}).items():
        if feature.get("dtype") == "video":
            shape = feature.get("shape") or [None, None]
            cameras.append(
                Camera(
                    key=name.removeprefix(_VIDEO_PREFIX),
                    codec=(feature.get("info") or {}).get("video.codec"),
                    height=shape[0],
                    width=shape[1],
                )
            )
        else:
            features[name] = {"dtype": feature.get("dtype"), "shape": feature.get("shape")}

    times = [e.data_file.stat().st_mtime for e in episodes if e.data_file.is_file()]
    contract_path = root / "contract.json"
    contract = json.loads(contract_path.read_text(encoding="utf-8")) if contract_path.is_file() else None
    manifest = None if contract else _manifest(root)
    if contract is not None:
        kind, source = "view", contract.get("source")
        prompts = contract.get("prompts") or ({"*": contract["prompt"]} if contract.get("prompt") else {})
    elif manifest is not None:
        kind, source, prompts = "clean", manifest.get("source"), {}
    else:
        kind, source, prompts = "raw", None, {}

    return DatasetSummary(
        path=str(root),
        name=root.name,
        kind=kind,
        codebase_version=str(info["codebase_version"]),
        robot_type=str(info.get("robot_type", "")),
        fps=fps,
        episodes=len(episodes),
        frames=frames,
        duration_sec=frames / fps if fps else 0.0,
        tasks=dict(sorted(tasks.items())),
        task_frames=dict(sorted(task_frames.items())),
        features=features,
        cameras=tuple(cameras),
        disk_bytes=_disk_bytes(root),
        first_file_time=_iso(min(times)) if times else None,
        last_file_time=_iso(max(times)) if times else None,
        source=None if source is None else str(source),
        removed_episodes=len(manifest.get("removed") or {}) if manifest is not None else None,
        prompts={str(k): str(v) for k, v in prompts.items()},
    )


def discover(data_root: str | Path, max_depth: int = 2) -> list[Path]:
    """Dataset directories under data_root (a dataset's own subdirectories are not searched)."""
    found: list[Path] = []

    def walk(folder: Path, depth: int) -> None:
        if is_dataset(folder):
            found.append(folder)
            return
        if depth == max_depth:
            return
        for child in sorted(folder.iterdir()):
            if child.is_dir() and not child.name.startswith((".", "_")) and not child.name.endswith(".partial"):
                walk(child, depth + 1)

    walk(Path(data_root), 0)
    return sorted(found)
