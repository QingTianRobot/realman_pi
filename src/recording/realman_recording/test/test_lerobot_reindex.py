"""Reindex keeps each LeRobot dataset to its own sessions' receipts."""
from __future__ import annotations

import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from realman_recording.lerobot_reindex import reindex_dataset

CAMERA = "observation.images.d435"


def _make_dataset(root: Path, lengths: list[int], tag: str) -> None:
    data_dir = root / "data" / "chunk-000"
    meta_dir = root / "meta" / "episodes" / "chunk-000"
    data_dir.mkdir(parents=True)
    meta_dir.mkdir(parents=True)
    offset = 0
    for index, length in enumerate(lengths):
        pq.write_table(
            pa.table({
                "episode_index": pa.array([index] * length, type=pa.int64()),
                "index": pa.array(range(offset, offset + length), type=pa.int64()),
                "origin": pa.array([f"{tag}{index}"] * length),
            }),
            data_dir / f"file-{index:03d}.parquet",
        )
        pq.write_table(
            pa.Table.from_pylist([{
                "episode_index": index,
                "length": length,
                "data/file_index": index,
                "meta/episodes/file_index": index,
                f"videos/{CAMERA}/file_index": index,
                "dataset_from_index": offset,
                "dataset_to_index": offset + length,
            }]),
            meta_dir / f"file-{index:03d}.parquet",
        )
        video_dir = root / "videos" / CAMERA / "chunk-000"
        video_dir.mkdir(parents=True, exist_ok=True)
        (video_dir / f"file-{index:03d}.mp4").write_text(f"{tag}{index}", encoding="utf-8")
        offset += length
    (root / "meta" / "info.json").write_text(
        json.dumps({"total_episodes": len(lengths), "total_frames": offset}), encoding="utf-8"
    )


def _make_session(recording_root: Path, name: str, dataset_root: Path, repo_id: str, index: int, start_ns: int) -> Path:
    session = recording_root / name
    (session / "export").mkdir(parents=True)
    (session / "manifest.json").write_text(
        json.dumps({"decision": "ADOPTED", "export": {"state": "SUCCEEDED"}}), encoding="utf-8"
    )
    receipt = session / "export" / "lerobot-v3.json"
    receipt.write_text(
        json.dumps({
            "dataset_root": str(dataset_root),
            "repo_id": repo_id,
            "episode_index": index,
            "first_walltime_ns": start_ns,
        }),
        encoding="utf-8",
    )
    return receipt


def _index(receipt: Path) -> int:
    return json.loads(receipt.read_text(encoding="utf-8"))["episode_index"]


def _origins(root: Path) -> list[str]:
    files = sorted((root / "data" / "chunk-000").glob("file-*.parquet"))
    return [pq.read_table(path).column("origin")[0].as_py() for path in files]


def test_single_dataset_reindex_keeps_the_result_shape(tmp_path: Path) -> None:
    export_root = (tmp_path / "export").resolve()
    recording_root = tmp_path / "sessions"
    teleop = export_root / "realman__teleop"
    _make_dataset(teleop, [2, 3, 4], "t")
    first = _make_session(recording_root, "s0", teleop, "realman/teleop", 0, 100)
    last = _make_session(recording_root, "s2", teleop, "realman/teleop", 2, 300)

    result = reindex_dataset(recording_root, export_root)

    assert result == {
        "dry_run": False,
        "total_episodes_before": 3,
        "total_episodes_after": 2,
        "total_frames": 6,
        "orphans_removed": 1,
    }
    assert (_index(first), _index(last)) == (0, 1)
    assert _origins(teleop) == ["t0", "t2"]


def test_two_datasets_with_colliding_indices_reindex_independently(tmp_path: Path) -> None:
    export_root = (tmp_path / "export").resolve()
    recording_root = tmp_path / "sessions"
    teleop = export_root / "realman__teleop"
    policy = export_root / "realman__pi05-policy-rollouts"
    _make_dataset(teleop, [2, 3, 4], "t")
    _make_dataset(policy, [5, 6], "p")
    teleop0 = _make_session(recording_root, "a-teleop0", teleop, "realman/teleop", 0, 100)
    teleop2 = _make_session(recording_root, "c-teleop2", teleop, "realman/teleop", 2, 300)
    policy0 = _make_session(recording_root, "b-policy0", policy, "realman/pi05-policy-rollouts", 0, 150)
    policy1 = _make_session(recording_root, "d-policy1", policy, "realman/pi05-policy-rollouts", 1, 250)

    result = reindex_dataset(recording_root, export_root)

    # Teleop drops its orphan episode 1; the policy dataset is untouched.
    assert (_index(teleop0), _index(teleop2)) == (0, 1)
    assert (_index(policy0), _index(policy1)) == (0, 1)
    assert _origins(teleop) == ["t0", "t2"]
    assert _origins(policy) == ["p0", "p1"]
    assert json.loads((teleop / "meta" / "info.json").read_text())["total_episodes"] == 2
    assert json.loads((policy / "meta" / "info.json").read_text())["total_episodes"] == 2
    assert (policy / "videos" / CAMERA / "chunk-000" / "file-001.mp4").read_text() == "p1"
    assert result["total_episodes_before"] == 5
    assert result["total_episodes_after"] == 4
    assert result["orphans_removed"] == 1
    assert result["total_frames"] == 6 + 11
    assert sorted(entry["dataset_root"] for entry in result["datasets"]) == sorted([str(policy), str(teleop)])
