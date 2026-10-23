"""Small LeRobot v3 datasets on disk, shaped like the RealMan recordings, for the tests."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

_QUANTILES = {"q01": 0.01, "q10": 0.10, "q50": 0.50, "q90": 0.90, "q99": 0.99}


def _stats(values: np.ndarray, integer: bool = False) -> dict[str, list]:
    """Per-episode stats the way the recorder stores them (lists, count as [n])."""
    values = values.reshape(len(values), -1).astype(np.float64)
    cast = (lambda a: [int(round(v)) for v in a]) if integer else (lambda a: [float(v) for v in a])
    out = {
        "min": cast(values.min(0)),
        "max": cast(values.max(0)),
        "mean": cast(values.mean(0)),
        "std": [float(v) for v in values.std(0)],
        "count": [len(values)],
    }
    out.update({name: cast(np.quantile(values, q, axis=0)) for name, q in _QUANTILES.items()})
    return out


def _aggregate_json(per_episode: list[dict[str, dict[str, list]]]) -> dict:
    """meta/stats.json for the fixture: exact min/max/mean/std/count, count-weighted quantiles."""
    out = {}
    for feature in per_episode[0]:
        count = np.array([e[feature]["count"][0] for e in per_episode], dtype=np.float64)
        total = count.sum()
        mean = np.array([e[feature]["mean"] for e in per_episode])
        std = np.array([e[feature]["std"] for e in per_episode])
        weight = count[:, None]
        grand = (mean * weight).sum(0) / total
        var = (weight * (std**2 + (mean - grand) ** 2)).sum(0) / total
        stats = {
            "min": np.array([e[feature]["min"] for e in per_episode]).min(0).tolist(),
            "max": np.array([e[feature]["max"] for e in per_episode]).max(0).tolist(),
            "mean": grand.tolist(),
            "std": np.sqrt(var).tolist(),
            "count": [int(total)],
        }
        for name in _QUANTILES:
            stats[name] = ((np.array([e[feature][name] for e in per_episode]) * weight).sum(0) / total).tolist()
        out[feature] = stats
    return out

FPS = 30
HOME_DEG = (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)
CAMERAS = ("d435", "orbbec-right")
VIDEO_BYTES = 1024
_VIDEO_FEATURE = {
    "dtype": "video",
    "shape": [480, 640, 3],
    "names": ["height", "width", "channels"],
    "info": {"video.codec": "av1", "video.fps": FPS},
}
_INDEX_FEATURES = {key: {"dtype": "int64", "shape": [1]} for key in ("episode_index", "frame_index", "index", "task_index")}


def gripper(*segments: tuple[float, int]) -> list[float]:
    """Piecewise-constant right gripper readings: gripper((50, 60), (5700, 120)) = 60 open frames then 120 closed."""
    values: list[float] = []
    for value, frames in segments:
        values.extend([float(value)] * frames)
    return values


@dataclass
class Episode:
    task: str
    gripper: list[float]
    start_deg: tuple[float, ...] = HOME_DEG


def _info(features: dict, episodes: int, frames: int, tasks: int) -> dict:
    return {
        "codebase_version": "v3.0",
        "robot_type": "realman-rm65-b-three-arm-v1",
        "fps": FPS,
        "total_episodes": episodes,
        "total_frames": frames,
        "total_tasks": tasks,
        "data_path": "data/chunk-{chunk_index:03d}/file-{file_index:03d}.parquet",
        "video_path": "videos/{video_key}/chunk-{chunk_index:03d}/file-{file_index:03d}.mp4",
        "features": features,
    }


def _write_videos(root: Path, episode: int, row: dict) -> None:
    for camera in CAMERAS:
        folder = root / "videos" / f"observation.images.{camera}" / "chunk-000"
        folder.mkdir(parents=True, exist_ok=True)
        (folder / f"file-{episode:03d}.mp4").write_bytes(b"\0" * VIDEO_BYTES)
        row[f"videos/observation.images.{camera}/chunk_index"] = 0
        row[f"videos/observation.images.{camera}/file_index"] = episode


def _list_column(values: np.ndarray) -> pa.Array:
    return pa.array(values.astype(np.float32).tolist(), pa.list_(pa.float32()))


def build_dataset(root: Path, episodes: list[Episode], *, task_column: str = "__index_level_0__") -> Path:
    """A raw three-arm recording: right gripper in column 2, right arm joints 12-17 (radians)."""
    task_index = {task: i for i, task in enumerate(dict.fromkeys(e.task for e in episodes))}
    (root / "meta" / "episodes" / "chunk-000").mkdir(parents=True)
    (root / "data" / "chunk-000").mkdir(parents=True)
    features = {
        "observation.gripper_position": {"dtype": "float32", "shape": [3]},
        "observation.joint_position": {"dtype": "float32", "shape": [18]},
        "action.command_action": {"dtype": "float32", "shape": [18]},
        **{f"observation.images.{camera}": _VIDEO_FEATURE for camera in CAMERAS},
        **_INDEX_FEATURES,
        "timestamp": {"dtype": "float32", "shape": [1]},
    }
    frames = sum(len(e.gripper) for e in episodes)
    (root / "meta" / "info.json").write_text(json.dumps(_info(features, len(episodes), frames, len(task_index))))
    pq.write_table(
        pa.table({"task_index": list(task_index.values()), task_column: list(task_index)}),
        root / "meta" / "tasks.parquet",
    )
    start = 0
    all_stats: list[dict] = []
    for i, episode in enumerate(episodes):
        n = len(episode.gripper)
        grip = np.zeros((n, 3))
        grip[:, 2] = episode.gripper
        joints = np.zeros((n, 18))
        joints[:, 12:18] = np.radians(episode.start_deg)
        command = np.zeros((n, 18))
        index = np.arange(start, start + n, dtype=np.int64)
        pq.write_table(
            pa.table(
                {
                    "observation.gripper_position": _list_column(grip),
                    "observation.joint_position": _list_column(joints),
                    "action.command_action": _list_column(command),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(index),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task_index[episode.task], np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        stats = (
            {
                "observation.gripper_position": _stats(grip.astype(np.float32)),
                "index": _stats(index, integer=True),
                "episode_index": _stats(np.full(n, i), integer=True),
            }
            if n
            else {}
        )
        all_stats.append(stats)
        row = {
            "episode_index": i,
            "tasks": [episode.task],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
            **{f"stats/{feature}/{name}": value for feature, block in stats.items() for name, value in block.items()},
        }
        _write_videos(root, i, row)
        pq.write_table(pa.Table.from_pylist([row]), root / "meta" / "episodes" / "chunk-000" / f"file-{i:03d}.parquet")
        start += n
    kept = [s for s in all_stats if s]
    if kept:
        (root / "meta" / "stats.json").write_text(json.dumps(_aggregate_json(kept)))
    return root


def build_view(
    root: Path,
    *,
    source: str,
    prompts: dict[str, str],
    lengths: list[int],
    gripper_targets: list[list[float]] | None = None,
    tasks: list[str] | None = None,
) -> Path:
    """A training view as make_realman_view.py writes it: 7-dim state/action, prompts as tasks, contract.json."""
    names = list(prompts.values())
    (root / "meta" / "episodes" / "chunk-000").mkdir(parents=True)
    (root / "data" / "chunk-000").mkdir(parents=True)
    features = {
        "observation.state": {"dtype": "float32", "shape": [7]},
        "action": {"dtype": "float32", "shape": [7]},
        **{f"observation.images.{camera}": _VIDEO_FEATURE for camera in CAMERAS},
        **_INDEX_FEATURES,
        "timestamp": {"dtype": "float32", "shape": [1]},
    }
    (root / "meta" / "info.json").write_text(json.dumps(_info(features, len(lengths), sum(lengths), len(names))))
    pq.write_table(pa.table({"task_index": list(range(len(names))), "task": names}), root / "meta" / "tasks.parquet")
    start = 0
    for i, n in enumerate(lengths):
        task_name = tasks[i] if tasks else list(prompts)[i % len(prompts)]
        task = names.index(prompts[task_name])
        action = np.zeros((n, 7))
        if gripper_targets is not None:
            action[:, 6] = gripper_targets[i]
        pq.write_table(
            pa.table(
                {
                    "observation.state": _list_column(np.zeros((n, 7))),
                    "action": _list_column(action),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(np.arange(start, start + n, dtype=np.int64)),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task, np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        row = {
            "episode_index": i,
            "tasks": [names[task]],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
        }
        _write_videos(root, i, row)
        pq.write_table(pa.Table.from_pylist([row]), root / "meta" / "episodes" / "chunk-000" / f"file-{i:03d}.parquet")
        start += n
    (root / "contract.json").write_text(json.dumps({"source": source, "prompts": prompts, "arm": "r"}))
    return root


def write_tags(root: Path, tags: list[dict], *, sources: list[dict] | None = None,
               snapshot_at: str = "2026-10-23T09:30:00+08:00") -> Path:
    """episode_tags.json for a fixture dataset: one tags dict per episode; frames and task come from the dataset.
    tag_sources default to "manual" for every given key."""
    from realman_training.lerobot_io import read_episodes

    rows = read_episodes(root)
    assert len(rows) == len(tags), "one tags dict per episode"
    doc = {
        "schema_version": 1, "origin": "fixture", "dataset_path": f"lerobot/{Path(root).name}",
        "snapshot_at": snapshot_at, "remote_generated_at": None, "remote_errors": 0, "derived_from": None,
        "episodes": [
            {"episode_index": r.index, "session_id": f"S{r.index:03d}", "length": r.length, "task": r.task,
             "tags": dict(t), "tag_sources": dict(sources[r.index]) if sources else {k: "manual" for k in t}}
            for r, t in zip(rows, tags)
        ],
    }
    path = Path(root) / "episode_tags.json"
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def tag_index(root: Path, tags: list[dict], *, dataset_path: str | None = None) -> dict:
    """The recording platform's episode_meta.json for a fixture dataset (every episode adopted and exported)."""
    from realman_training.lerobot_io import read_episodes

    rows = read_episodes(root)
    return {
        "schema_version": 1, "generated_at": "2026-10-23T01:09:02+00:00", "path_base": ".", "errors": [],
        "episodes": [
            {"session_id": f"S{r.index:03d}", "episode_index": r.index, "decision": "ADOPTED",
             "export_state": "SUCCEEDED", "dataset_path": dataset_path or f"lerobot/{Path(root).name}",
             "raw_session_path": f"S{r.index:03d}", "recording_state": "READY",
             "tags": dict(t), "tag_sources": {k: "manual" for k in t}}
            for r, t in zip(rows, tags)
        ],
    }


def write_clean_manifest(root: Path, *, source: str, removed: dict[int, str],
                         old_to_new: dict[int, int] | None = None) -> Path:
    """The manifest drop_episodes.py writes next to the cleaned directory (<dir>.clean_manifest.json)."""
    path = Path(f"{root}.clean_manifest.json")
    manifest = {"source": source, "removed": {str(e): {"frames": 1, "reason": r} for e, r in removed.items()}}
    if old_to_new is not None:
        manifest["old_to_new"] = {str(k): v for k, v in old_to_new.items()}
    path.write_text(json.dumps(manifest))
    return path
