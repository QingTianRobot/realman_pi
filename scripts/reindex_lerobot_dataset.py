#!/usr/bin/env python3
"""Re-index a LeRobot v3 dataset so ``episode_index`` is contiguous after deletions.

Removes orphan episodes (those whose raw recording session no longer exists) and
re-numbers the survivors ``0..N-1`` in recording-time order.  Touches, per episode:

* ``data/chunk-000/file-NNN.parquet`` (rename + ``episode_index`` + ``index`` columns)
* ``meta/episodes/chunk-000/file-NNN.parquet`` (rename + index/location columns)
* ``videos/<camera>/chunk-000/file-NNN.mp4`` (rename)
* ``meta/info.json`` (``total_episodes``, ``total_frames``, ``splits``)
* each session's ``export/lerobot-v3.json`` (its ``episode_index``)
* ``meta/stats.json`` (removed; lerobot recomputes it lazily on load)

Run with ``--dry-run`` to print the planned remapping without touching anything.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

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


def atomic_json_write(path: Path, payload: dict) -> None:
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def session_receipts(recording_root: Path, dataset_root: Path) -> dict[int, dict]:
    """Return ``{episode_index: receipt}`` for every session exported into ``dataset_root``.

    A receipt is read from ``<session>/export/lerobot-v3.json``.  Only sessions whose
    manifest is still ADOPTED/DELETED and whose export succeeded are considered valid;
    hard-deleted sessions (no directory) simply contribute nothing.  Receipts for other
    datasets in the same recording root (teleop vs policy rollouts) are ignored, since
    episode indices collide across datasets.
    """
    wanted = dataset_root.expanduser().resolve()
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
        root = receipt.get("dataset_root")
        if not isinstance(root, str) or not root or Path(root).expanduser().resolve() != wanted:
            continue
        index = receipt.get("episode_index")
        if isinstance(index, int):
            receipts[index] = {
                "receipt": receipt,
                "receipt_path": directory / "export" / "lerobot-v3.json",
                "first_walltime_ns": receipt.get("first_walltime_ns", 0),
            }
    return receipts


def plan_remap(
    total_episodes: int, receipts: dict[int, dict]
) -> tuple[dict[int, int], list[int]]:
    """Return ``(old_to_new, orphans)``.

    Survivors are the episode indices present in ``receipts``; they are ordered by
    recording start time (``first_walltime_ns``), with the existing episode index as a
    stable tie-breaker, then re-numbered ``0..N-1``.  Anything else is an orphan.
    """
    ordered = sorted(
        receipts.keys(),
        key=lambda idx: (receipts[idx]["first_walltime_ns"], idx),
    )
    old_to_new = {old: new for new, old in enumerate(ordered)}
    orphans = [idx for idx in range(total_episodes) if idx not in old_to_new]
    return old_to_new, orphans


def _rewrite_data_parquet(
    source: Path, target: Path, new_episode_index: int, frame_offset: int
) -> int:
    """Rewrite one episode's data parquet with the new ``episode_index`` and ``index``.

    ``frame_offset`` is the dataset-wide frame index of this episode's first frame.
    Returns the episode's frame count.
    """
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
    rewritten = pa.Table.from_arrays(list(arrays.values()), names=list(arrays.keys()))
    pq.write_table(rewritten, target)
    return length


def _rewrite_meta_parquet(
    source: Path,
    target: Path,
    new_episode_index: int,
    frame_offset: int,
    cameras: list[str],
) -> int:
    """Rewrite one episode's metadata row with the new index/location columns."""
    table = pq.read_table(source)
    assert table.num_rows == 1, f"expected one metadata row, got {table.num_rows}"
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
    new_table = pa.Table.from_pylist([row])
    pq.write_table(new_table, target)
    return length


def reindex(
    dataset_root: Path,
    recording_root: Path,
    *,
    cameras: list[str] | None = None,
    dry_run: bool = False,
) -> dict:
    """Re-index the dataset in place.  Returns a summary dict."""
    cameras = cameras or DEFAULT_CAMERAS
    data_dir = dataset_root / "data" / "chunk-000"
    meta_dir = dataset_root / "meta" / "episodes" / "chunk-000"
    videos_root = dataset_root / "videos"
    info_path = dataset_root / "meta" / "info.json"

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
            "remap": {str(k): v for k, v in sorted(old_to_new.items())},
        }

    # 1. Rewrite kept episodes to temporary names (collision-free), tracking frame
    #    offsets so the dataset-wide ``index`` column stays contiguous.  Kept videos
    #    are moved to temporary names too; the originals are cleaned up in step 2.
    temps: list[tuple[Path, Path]] = []
    frame_offset = 0
    total_frames = 0
    for old, new in sorted(old_to_new.items()):
        length = _rewrite_data_parquet(
            data_dir / f"file-{old:03d}.parquet",
            data_dir / f".tmp-file-{new:03d}.parquet",
            new,
            frame_offset,
        )
        _rewrite_meta_parquet(
            meta_dir / f"file-{old:03d}.parquet",
            meta_dir / f".tmp-file-{new:03d}.parquet",
            new,
            frame_offset,
            cameras,
        )
        temps.append((data_dir / f".tmp-file-{new:03d}.parquet", data_dir / f"file-{new:03d}.parquet"))
        temps.append((meta_dir / f".tmp-file-{new:03d}.parquet", meta_dir / f"file-{new:03d}.parquet"))
        # Videos: move old -> temp (a rename, so the old name disappears immediately).
        for camera in cameras:
            old_video = videos_root / camera / "chunk-000" / f"file-{old:03d}.mp4"
            if old_video.is_file():
                temp_video = videos_root / camera / "chunk-000" / f".tmp-file-{new:03d}.mp4"
                old_video.rename(temp_video)
                temps.append((temp_video, videos_root / camera / "chunk-000" / f"file-{new:03d}.mp4"))
        frame_offset += length
        total_frames += length

    # 2. Delete every original file under the old index scheme (kept episodes were
    #    already moved to temporary names, so this removes both orphans and the stale
    #    old files of survivors in one pass).  Temporary names are untouched.
    for idx in range(total_episodes):
        for path in (data_dir / f"file-{idx:03d}.parquet", meta_dir / f"file-{idx:03d}.parquet"):
            if path.is_file():
                path.unlink()
        for camera in cameras:
            video = videos_root / camera / "chunk-000" / f"file-{idx:03d}.mp4"
            if video.is_file():
                video.unlink()

    # 3. Promote temporary files to their final names.
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
        "remap": {str(k): v for k, v in sorted(old_to_new.items())},
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset_root", type=Path)
    parser.add_argument("recording_root", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    result = reindex(
        args.dataset_root,
        args.recording_root,
        dry_run=args.dry_run,
    )
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
