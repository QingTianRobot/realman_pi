"""Re-index a LeRobot v3 dataset so ``episode_index`` is contiguous after deletions.

Removes orphan episodes (those whose raw recording session no longer exists) and
re-numbers the survivors ``0..N-1`` in recording-time order.  The operation runs
under the dataset's process-wide append lock so it can never race a running export.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pyarrow as pa
import pyarrow.parquet as pq

from .json_io import atomic_json_write
from .lerobot_dataset_store import dataset_lock

# Camera video sub-directories written by the exporter (schema.camera_ids).
DEFAULT_CAMERAS = [
    "observation.images.orbbec-left",
    "observation.images.orbbec-right",
    "observation.images.d435",
]


def load_json(path: Path) -> dict | None:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def _resolve(root: str | Path) -> Path:
    return Path(root).expanduser().resolve()


def discover_dataset_roots(recording_root: Path) -> list[Path]:
    """Return every distinct dataset root named by a session receipt, sorted.

    One recording root can feed several LeRobot datasets (teleop and policy
    rollouts); each is re-indexed separately against its own sessions.
    """
    roots: set[Path] = set()
    if not recording_root.is_dir():
        return []
    for directory in recording_root.iterdir():
        if not directory.is_dir() or directory.name.startswith("."):
            continue
        receipt = load_json(directory / "export" / "lerobot-v3.json")
        if not receipt:
            continue
        root = receipt.get("dataset_root")
        if isinstance(root, str) and root:
            roots.add(_resolve(root))
    return sorted(roots)


def discover_dataset_root(recording_root: Path) -> Path | None:
    """Return the first dataset root named by a session receipt, if any."""
    roots = discover_dataset_roots(recording_root)
    return roots[0] if roots else None


def session_receipts(recording_root: Path, dataset_root: Path | None = None) -> dict[int, dict]:
    """Return ``{episode_index: receipt}`` for every session with a completed export.

    Only sessions whose manifest is still ADOPTED/DELETED and whose export succeeded
    are considered valid; hard-deleted sessions (no directory) contribute nothing.
    With ``dataset_root``, only receipts exported into that dataset count: episode
    indices are per dataset and collide across datasets.
    """
    wanted = _resolve(dataset_root) if dataset_root is not None else None
    receipts: dict[int, dict] = {}
    if not recording_root.is_dir():
        return receipts
    for directory in recording_root.iterdir():
        if not directory.is_dir() or directory.name.startswith("."):
            continue
        manifest = load_json(directory / "manifest.json")
        if not manifest or manifest.get("decision") not in ("ADOPTED", "DELETED"):
            continue
        export = manifest.get("export") or {}
        if export.get("state") != "SUCCEEDED":
            continue
        receipt = load_json(directory / "export" / "lerobot-v3.json")
        if not receipt:
            continue
        if wanted is not None:
            root = receipt.get("dataset_root")
            if not isinstance(root, str) or not root or _resolve(root) != wanted:
                continue
        index = receipt.get("episode_index")
        if isinstance(index, int):
            receipts[index] = {
                "receipt": receipt,
                "receipt_path": directory / "export" / "lerobot-v3.json",
                "first_walltime_ns": receipt.get("first_walltime_ns", 0),
            }
    return receipts


def plan_remap(total_episodes: int, receipts: dict[int, dict]) -> tuple[dict[int, int], list[int]]:
    """Return ``(old_to_new, orphans)``.

    Survivors are ordered by recording start time, then re-numbered ``0..N-1``.
    """
    ordered = sorted(receipts.keys(), key=lambda idx: (receipts[idx]["first_walltime_ns"], idx))
    old_to_new = {old: new for new, old in enumerate(ordered)}
    orphans = [idx for idx in range(total_episodes) if idx not in old_to_new]
    return old_to_new, orphans


def _rewrite_data_parquet(source: Path, target: Path, new_episode_index: int, frame_offset: int) -> int:
    table = pq.read_table(source)
    length = table.num_rows
    arrays = {}
    for name in table.column_names:
        if name == "episode_index":
            arrays[name] = pa.array([new_episode_index] * length, type=pa.int64())
        elif name == "index":
            arrays[name] = pa.array(range(frame_offset, frame_offset + length), type=pa.int64())
        else:
            arrays[name] = table.column(name)
    pq.write_table(pa.Table.from_arrays(list(arrays.values()), names=list(arrays.keys())), target)
    return length


def _rewrite_meta_parquet(
    source: Path, target: Path, new_episode_index: int, frame_offset: int, cameras: list[str]
) -> int:
    table = pq.read_table(source)
    row = table.to_pylist()[0]
    length = int(row["length"])
    row["episode_index"] = new_episode_index
    row["data/file_index"] = new_episode_index
    row["meta/episodes/file_index"] = new_episode_index
    for camera in cameras:
        video_file_key = f"videos/{camera}/file_index"
        if video_file_key in row:
            row[video_file_key] = new_episode_index
    row["dataset_from_index"] = frame_offset
    row["dataset_to_index"] = frame_offset + length
    pq.write_table(pa.Table.from_pylist([row]), target)
    return length


def reindex(
    dataset_root: Path,
    recording_root: Path,
    *,
    cameras: list[str] | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Re-index the dataset in place, under the dataset's append lock."""
    cameras = cameras or DEFAULT_CAMERAS
    data_dir = dataset_root / "data" / "chunk-000"
    meta_dir = dataset_root / "meta" / "episodes" / "chunk-000"
    videos_root = dataset_root / "videos"
    info_path = dataset_root / "meta" / "info.json"

    with dataset_lock(dataset_root):
        info = load_json(info_path)
        if not info:
            raise RuntimeError(f"missing info.json in {dataset_root}")
        total_episodes = int(info.get("total_episodes", 0))

        receipts = session_receipts(recording_root, dataset_root)
        old_to_new, orphans = plan_remap(total_episodes, receipts)

        if dry_run:
            return {
                "dry_run": True,
                "total_episodes_before": total_episodes,
                "total_episodes_after": len(old_to_new),
                "orphans": orphans,
            }

        # 1. Rewrite kept episodes to temporary names.
        temps: list[tuple[Path, Path]] = []
        frame_offset = 0
        total_frames = 0
        for old, new in sorted(old_to_new.items()):
            length = _rewrite_data_parquet(
                data_dir / f"file-{old:03d}.parquet", data_dir / f".tmp-file-{new:03d}.parquet", new, frame_offset
            )
            _rewrite_meta_parquet(
                meta_dir / f"file-{old:03d}.parquet", meta_dir / f".tmp-file-{new:03d}.parquet", new, frame_offset, cameras
            )
            temps.append((data_dir / f".tmp-file-{new:03d}.parquet", data_dir / f"file-{new:03d}.parquet"))
            temps.append((meta_dir / f".tmp-file-{new:03d}.parquet", meta_dir / f"file-{new:03d}.parquet"))
            for camera in cameras:
                old_video = videos_root / camera / "chunk-000" / f"file-{old:03d}.mp4"
                if old_video.is_file():
                    temp_video = videos_root / camera / "chunk-000" / f".tmp-file-{new:03d}.mp4"
                    old_video.rename(temp_video)
                    temps.append((temp_video, videos_root / camera / "chunk-000" / f"file-{new:03d}.mp4"))
            frame_offset += length
            total_frames += length

        # 2. Delete every original file under the old index scheme.
        for idx in range(total_episodes):
            for path in (data_dir / f"file-{idx:03d}.parquet", meta_dir / f"file-{idx:03d}.parquet"):
                if path.is_file():
                    path.unlink()
            for camera in cameras:
                video = videos_root / camera / "chunk-000" / f"file-{idx:03d}.mp4"
                if video.is_file():
                    video.unlink()

        # 3. Promote temporary files to final names.
        for temp, final in temps:
            temp.rename(final)

        # 4. Update info.json.
        info["total_episodes"] = len(old_to_new)
        info["total_frames"] = total_frames
        info["splits"] = {"train": f"0:{len(old_to_new)}"}
        atomic_json_write(info_path, info)

        # 5. Update each surviving session's receipt episode_index.
        for old, new in old_to_new.items():
            entry = receipts.get(old)
            if not entry:
                continue
            receipt = entry["receipt"]
            receipt["episode_index"] = new
            atomic_json_write(entry["receipt_path"], receipt)

        # 6. Drop the aggregate stats cache; lerobot recomputes it lazily.
        stats_path = dataset_root / "meta" / "stats.json"
        if stats_path.is_file():
            stats_path.unlink()

        return {
            "dry_run": False,
            "total_episodes_before": total_episodes,
            "total_episodes_after": len(old_to_new),
            "total_frames": total_frames,
            "orphans_removed": len(orphans),
        }


def reindex_dataset(recording_root: str | Path, export_root: str | Path) -> dict[str, Any]:
    """Discover every dataset root and re-index each; the web endpoint's entry point.

    With one dataset the result is that dataset's ``reindex`` result.  With several,
    the counters are summed and ``datasets`` lists each dataset's own result.
    """
    recording_root = Path(recording_root)
    export_root = _resolve(export_root)
    dataset_roots = discover_dataset_roots(recording_root)
    if not dataset_roots:
        raise RuntimeError("no exported LeRobot dataset found to re-index")
    for dataset_root in dataset_roots:
        if export_root not in dataset_root.parents:
            raise RuntimeError(f"dataset root {dataset_root} is outside export dir {export_root}")
    results = [reindex(dataset_root, recording_root) for dataset_root in dataset_roots]
    if len(results) == 1:
        return results[0]
    summed = ("total_episodes_before", "total_episodes_after", "total_frames", "orphans_removed")
    combined: dict[str, Any] = {"dry_run": False}
    combined.update({key: sum(int(result[key]) for result in results) for key in summed})
    combined["datasets"] = [
        {"dataset_root": str(dataset_root), **result} for dataset_root, result in zip(dataset_roots, results)
    ]
    return combined
