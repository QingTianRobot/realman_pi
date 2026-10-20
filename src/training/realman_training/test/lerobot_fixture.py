"""Small LeRobot v3 datasets on disk, shaped like the RealMan recordings, for the tests."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

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
    for i, episode in enumerate(episodes):
        n = len(episode.gripper)
        grip = np.zeros((n, 3))
        grip[:, 2] = episode.gripper
        joints = np.zeros((n, 18))
        joints[:, 12:18] = np.radians(episode.start_deg)
        pq.write_table(
            pa.table(
                {
                    "observation.gripper_position": _list_column(grip),
                    "observation.joint_position": _list_column(joints),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(np.arange(start, start + n, dtype=np.int64)),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task_index[episode.task], np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        row = {
            "episode_index": i,
            "tasks": [episode.task],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
        }
        _write_videos(root, i, row)
        pq.write_table(pa.Table.from_pylist([row]), root / "meta" / "episodes" / "chunk-000" / f"file-{i:03d}.parquet")
        start += n
    return root


def build_view(root: Path, *, source: str, prompts: dict[str, str], lengths: list[int]) -> Path:
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
        task = i % len(names)
        pq.write_table(
            pa.table(
                {
                    "observation.state": _list_column(np.zeros((n, 7))),
                    "action": _list_column(np.zeros((n, 7))),
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


def write_clean_manifest(root: Path, *, source: str, removed: dict[int, str]) -> Path:
    """The manifest drop_episodes.py writes next to the cleaned directory (<dir>.clean_manifest.json)."""
    path = Path(f"{root}.clean_manifest.json")
    path.write_text(
        json.dumps({"source": source, "removed": {str(e): {"frames": 1, "reason": r} for e, r in removed.items()}})
    )
    return path
