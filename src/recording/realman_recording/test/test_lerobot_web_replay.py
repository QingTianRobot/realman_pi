"""Pure tests for the read-only LeRobot dashboard replay catalog."""
from __future__ import annotations

import json
import io
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import pytest

from realman_recording.lerobot_web_replay import LeRobotReplayCatalog


class _FakeDataset:
    features = {
        "observation.joint_position": {
            "dtype": "float32", "shape": [2], "names": ["l.joint_1", "l.joint_2"]
        },
        "observation.gripper_position": {},
        "action.command.cartesian_velocity": {},
        "action.command.gripper": {"dtype": "float32", "shape": [3]},
        "observation.user_added_scalar": {"dtype": "float32", "shape": []},
        "quality.valid": {"dtype": "bool", "shape": []},
        "quality.sync_error_ns": {"dtype": "int64", "shape": [1]},
        "observation.images.front": {},
    }

    def __init__(self) -> None:
        self.hf_dataset = [
            {
                "frame_index": 0,
                "timestamp": 0.0,
                "observation.joint_position": [1.0, 2.0],
                "observation.gripper_position": [0.25],
                "action.command.cartesian_velocity": [0.1],
                "action.command.gripper": [0.0, 0.5, 1.0],
                "observation.user_added_scalar": 2.5,
                "quality.valid": True,
                "quality.sync_error_ns": [3],
            },
            {
                "frame_index": 1,
                "timestamp": 0.1,
                "observation.joint_position": [3.0, 4.0],
                "observation.gripper_position": [0.5],
                "action.command.cartesian_velocity": [0.2],
                "action.command.gripper": [0.1, 0.6, 0.9],
                "observation.user_added_scalar": 3.5,
                "quality.valid": False,
                "quality.sync_error_ns": [-7],
            },
        ]

    def __len__(self):
        return len(self.hf_dataset)

    def __getitem__(self, index):
        import numpy as np

        row = dict(self.hf_dataset[index])
        row["observation.images.front"] = np.zeros((3, 2, 2), dtype=np.uint8)
        return row


def _catalog(tmp_path, *, decision="ADOPTED", export_state="SUCCEEDED"):
    recording_root = tmp_path / "recordings"
    export_root = recording_root / "lerobot"
    dataset_root = export_root / "realman__test"
    session = recording_root / "session-1"
    (session / "export").mkdir(parents=True)
    dataset_root.mkdir(parents=True)
    (session / "manifest.json").write_text(
        json.dumps({"decision": decision, "export": {"state": export_state}}), encoding="utf-8"
    )
    (session / "export" / "lerobot-v3.json").write_text(
        json.dumps(
            {
                "dataset_root": str(dataset_root),
                "repo_id": "realman/test",
                "fps": 10.0,
                "episode_index": 2,
                "first_walltime_ns": 100,
                "canonical": {"quality_sync_source_ids": ["image:front"]},
            }
        ),
        encoding="utf-8",
    )
    return LeRobotReplayCatalog(
        recording_root,
        export_root,
        dataset_factory=lambda _reference: _FakeDataset(),
    )


def _add_valid_session(recording_root, export_root, session_id):
    session = recording_root / session_id
    dataset_root = export_root / session_id
    (session / "export").mkdir(parents=True)
    dataset_root.mkdir(parents=True)
    (session / "manifest.json").write_text(
        json.dumps({"decision": "ADOPTED", "export": {"state": "SUCCEEDED"}}), encoding="utf-8"
    )
    (session / "export" / "lerobot-v3.json").write_text(
        json.dumps(
            {
                "dataset_root": str(dataset_root),
                "repo_id": f"realman/{session_id}",
                "fps": 10.0,
                "episode_index": 0,
                "first_walltime_ns": 100,
            }
        ),
        encoding="utf-8",
    )


def test_catalog_lists_only_successfully_adopted_exports(tmp_path):
    catalog = _catalog(tmp_path)
    listed = catalog.list_datasets()
    assert listed == [
        {
            "session_id": "session-1",
            "repo_id": "realman/test",
            "episode_index": 2,
            "frames": 2,
            "fps": 10.0,
            "task": "",
            "quality": {"valid_frames": 1, "invalid_frames": 1, "max_sync_error_ns": 7},
        }
    ]


def test_catalog_builds_canonical_frame_metadata_and_jpeg(tmp_path):
    catalog = _catalog(tmp_path)
    # LeRobot's float timestamp is an encoding detail; replay time is the fixed
    # policy grid anchored by the exact first walltime and FPS in the receipt.
    receipt_path = tmp_path / "recordings" / "session-1" / "export" / "lerobot-v3.json"
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    receipt["fps"] = 15.0
    receipt_path.write_text(json.dumps(receipt), encoding="utf-8")
    frames = catalog.frames("session-1")
    assert frames[0]["state"] == [1.0, 2.0, 0.25]
    assert frames[1]["timestamp_ns"] == 66_666_767
    assert frames[0]["source_timestamps_ns"] == {"image:front": "103"}
    assert frames[1]["source_timestamps_ns"] == {"image:front": "66666760"}
    assert frames[0]["cameras"] == {"front": True}
    jpeg = catalog.image("session-1", 0, "front")
    assert jpeg[:2] == b"\xff\xd8"


def test_catalog_summary_exposes_features_and_quality_without_image_decode(tmp_path):
    summary = _catalog(tmp_path).summary("session-1")
    assert summary["frames"] == 2
    assert summary["features"]["observation.joint_position"] == {
        "dtype": "float32", "shape": [2], "names": ["l.joint_1", "l.joint_2"]
    }
    assert summary["quality"] == {"valid_frames": 1, "invalid_frames": 1, "max_sync_error_ns": 7}
    assert summary["canonical"]["quality_sync_source_ids"] == ["image:front"]


def test_catalog_rejects_sync_error_source_layout_mismatch(tmp_path):
    catalog = _catalog(tmp_path)
    receipt_path = tmp_path / "recordings" / "session-1" / "export" / "lerobot-v3.json"
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    receipt["canonical"]["quality_sync_source_ids"] = []
    receipt_path.write_text(json.dumps(receipt), encoding="utf-8")

    with pytest.raises(ValueError, match="sync error source ids"):
        catalog.frames("session-1")


def test_catalog_frames_expose_optional_and_new_scalar_features(tmp_path):
    frame = _catalog(tmp_path).frames("session-1")[0]
    assert frame["features"]["action.command.gripper"] == [0.0, 0.5, 1.0]
    assert frame["features"]["observation.user_added_scalar"] == 2.5


def test_catalog_rejects_path_traversal_and_incomplete_sessions(tmp_path):
    catalog = _catalog(tmp_path, decision="DISCARDED")
    assert catalog.list_datasets() == []
    with pytest.raises(ValueError, match="invalid session id"):
        catalog.frames("../session-1")


def test_catalog_enforces_frame_limit_and_does_not_expose_dataset_path(tmp_path):
    catalog = _catalog(tmp_path)
    limited = LeRobotReplayCatalog(
        catalog._recording_root,
        catalog._export_root,
        max_frames=1,
        dataset_factory=lambda _reference: _FakeDataset(),
    )
    with pytest.raises(ValueError, match="replay limit"):
        limited.frames("session-1")
    summary = catalog.summary("session-1")
    assert "dataset_root" not in json.dumps(summary)


def test_replay_jpeg_is_downscaled_to_browser_preview_size():
    import numpy as np
    from PIL import Image

    original = np.zeros((3, 720, 1280), dtype=np.uint8)
    encoded = LeRobotReplayCatalog._jpeg(original)

    with Image.open(io.BytesIO(encoded)) as image:
        assert image.size == (640, 360)


def test_catalog_bounds_open_dataset_cache_and_reopens_evicted_dataset(tmp_path):
    recording_root = tmp_path / "recordings"
    export_root = recording_root / "lerobot"
    for session_id in ("session-1", "session-2", "session-3"):
        _add_valid_session(recording_root, export_root, session_id)

    opened = {}

    def factory(reference):
        opened[reference.session_id] = opened.get(reference.session_id, 0) + 1
        return _FakeDataset()

    catalog = LeRobotReplayCatalog(
        recording_root,
        export_root,
        max_cached_datasets=2,
        dataset_factory=factory,
    )

    assert len(catalog.list_datasets()) == 3
    assert len(catalog._datasets) == 2
    catalog.summary("session-1")
    assert opened["session-1"] == 2
    assert len(catalog._datasets) == 2


def test_catalog_serializes_concurrent_reads_of_one_dataset(tmp_path):
    active = 0
    maximum_active = 0
    counter_lock = threading.Lock()

    class SlowDataset(_FakeDataset):
        def __getitem__(self, index):
            nonlocal active, maximum_active
            with counter_lock:
                active += 1
                maximum_active = max(maximum_active, active)
            try:
                time.sleep(0.03)
                return {"observation.images.front": object()}
            finally:
                with counter_lock:
                    active -= 1

    catalog = _catalog(tmp_path)
    catalog._dataset_factory = lambda _reference: SlowDataset()
    catalog._jpeg = lambda _frame: b"jpeg"
    start = threading.Barrier(3)

    def read_image(frame_index):
        start.wait()
        return catalog.image("session-1", frame_index, "front")

    with ThreadPoolExecutor(max_workers=2) as pool:
        reads = [pool.submit(read_image, index) for index in (0, 1)]
        start.wait()
        assert [read.result() for read in reads] == [b"jpeg", b"jpeg"]

    assert maximum_active == 1


def test_catalog_does_not_evict_a_dataset_while_its_reader_is_active(tmp_path):
    recording_root = tmp_path / "recordings"
    export_root = recording_root / "lerobot"
    _add_valid_session(recording_root, export_root, "session-1")
    _add_valid_session(recording_root, export_root, "session-2")
    started = threading.Event()
    release = threading.Event()
    opened = {}
    active = 0
    maximum_active = 0
    counter_lock = threading.Lock()

    class PinnedDataset(_FakeDataset):
        def __getitem__(self, index):
            nonlocal active, maximum_active
            with counter_lock:
                active += 1
                maximum_active = max(maximum_active, active)
            started.set()
            try:
                assert release.wait(timeout=2)
                return {"observation.images.front": object()}
            finally:
                with counter_lock:
                    active -= 1

    def factory(reference):
        opened[reference.session_id] = opened.get(reference.session_id, 0) + 1
        return PinnedDataset()

    catalog = LeRobotReplayCatalog(
        recording_root,
        export_root,
        max_cached_datasets=1,
        dataset_factory=factory,
    )
    catalog._jpeg = lambda _frame: b"jpeg"

    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(catalog.image, "session-1", 0, "front")
        assert started.wait(timeout=2)
        catalog.summary("session-2")
        second = pool.submit(catalog.image, "session-1", 1, "front")
        release.set()
        assert first.result() == b"jpeg"
        assert second.result() == b"jpeg"

    assert opened["session-1"] == 1
    assert maximum_active == 1
    assert len(catalog._datasets) == 1


def test_catalog_rejects_non_positive_dataset_cache_limit(tmp_path):
    with pytest.raises(ValueError, match="max_cached_datasets must be positive"):
        LeRobotReplayCatalog(tmp_path / "recordings", tmp_path / "exports", max_cached_datasets=0)
