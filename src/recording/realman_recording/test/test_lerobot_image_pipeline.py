"""Parallel JPEG decode / PNG staging used by the LeRobot v3 exporter."""
from __future__ import annotations

import threading
import time
from pathlib import Path

import pytest

from realman_recording.lerobot_image_pipeline import (
    iter_decoded_frames,
    managed_image_writer,
    verify_episode_images,
    wait_for_writer_capacity,
)


def _images(cameras: dict[str, int]) -> dict[str, list[Path]]:
    return {camera: [Path(f"{camera}-{index}.jpg") for index in range(count)] for camera, count in cameras.items()}


@pytest.mark.parametrize("workers", [0, 1, 4])
def test_iter_decoded_frames_keeps_frame_and_camera_order(workers):
    images = _images({"left": 25, "right": 25})

    def load(path: Path) -> str:
        # Later frames finish first, so out-of-order completion must not reorder output.
        time.sleep(0.001 * (30 - int(path.stem.split("-")[1])) / 30)
        return path.stem

    frames = list(iter_decoded_frames(images, 25, load, workers=workers))

    assert frames == [{"left": f"left-{index}", "right": f"right-{index}"} for index in range(25)]


def test_iter_decoded_frames_bounds_in_flight_decodes():
    images = _images({"cam": 200})
    lock = threading.Lock()
    state = {"active": 0, "peak": 0, "started": 0}

    def load(path: Path) -> str:
        with lock:
            state["active"] += 1
            state["started"] += 1
            state["peak"] = max(state["peak"], state["active"])
        time.sleep(0.0005)
        with lock:
            state["active"] -= 1
        return path.stem

    iterator = iter_decoded_frames(images, 200, load, workers=4)
    next(iterator)
    time.sleep(0.05)
    # Nothing consumed past frame 0: the pipeline must not run ahead unboundedly.
    assert state["started"] <= 1 + 2 * 4
    list(iterator)
    assert state["peak"] <= 4


def test_iter_decoded_frames_propagates_decode_error():
    images = _images({"cam": 10})

    def load(path: Path) -> str:
        if path.stem == "cam-3":
            raise OSError("truncated JPEG")
        return path.stem

    iterator = iter_decoded_frames(images, 10, load, workers=3)
    assert [next(iterator) for _ in range(3)] == [{"cam": f"cam-{index}"} for index in range(3)]
    with pytest.raises(OSError, match="truncated JPEG"):
        next(iterator)


def test_iter_decoded_frames_rejects_short_camera_list():
    with pytest.raises(ValueError, match="cam"):
        list(iter_decoded_frames(_images({"cam": 2}), 3, lambda path: path, workers=0))


def test_iter_decoded_frames_rejects_negative_workers():
    with pytest.raises(ValueError, match="workers"):
        list(iter_decoded_frames(_images({"cam": 1}), 1, lambda path: path, workers=-1))


class _FakeQueue:
    def __init__(self, sizes):
        self._sizes = list(sizes)
        self.calls = 0

    def qsize(self):
        self.calls += 1
        return self._sizes.pop(0) if len(self._sizes) > 1 else self._sizes[0]


class _FakeWriter:
    def __init__(self, sizes=(0,)):
        self.queue = _FakeQueue(sizes)


class _FakeDataset:
    def __init__(self):
        self.image_writer = None
        self.started = []
        self.stopped = 0

    def start_image_writer(self, num_processes=0, num_threads=4):
        self.started.append((num_processes, num_threads))
        self.image_writer = _FakeWriter()

    def stop_image_writer(self):
        self.stopped += 1
        self.image_writer = None


def test_managed_image_writer_starts_threads_and_always_stops():
    dataset = _FakeDataset()
    with pytest.raises(RuntimeError):
        with managed_image_writer(dataset, workers=6):
            assert dataset.started == [(0, 6)]
            raise RuntimeError("boom")
    assert dataset.stopped == 1
    assert dataset.image_writer is None


def test_managed_image_writer_zero_workers_stays_synchronous():
    dataset = _FakeDataset()
    with managed_image_writer(dataset, workers=0):
        pass
    assert dataset.started == [] and dataset.stopped == 0


def test_managed_image_writer_tolerates_sdk_without_async_writer():
    dataset = object()
    with managed_image_writer(dataset, workers=4):
        pass


def test_wait_for_writer_capacity_blocks_until_queue_drains():
    dataset = _FakeDataset()
    dataset.image_writer = _FakeWriter(sizes=(50, 40, 30, 5))
    wait_for_writer_capacity(dataset, max_pending=10, poll_sec=0)
    assert dataset.image_writer.queue.calls == 4


def test_wait_for_writer_capacity_is_noop_without_writer():
    wait_for_writer_capacity(_FakeDataset(), max_pending=1, poll_sec=0)


class _BufferDataset:
    def __init__(self, buffer):
        self.episode_buffer = buffer
        self.image_writer = None


def test_verify_episode_images_accepts_complete_staging(tmp_path):
    paths = []
    for index in range(3):
        path = tmp_path / f"frame-{index}.png"
        path.write_bytes(b"png")
        paths.append(str(path))
    verify_episode_images(_BufferDataset({"observation.images.cam": paths}), ["observation.images.cam"])


def test_verify_episode_images_rejects_missing_or_empty_png(tmp_path):
    good = tmp_path / "frame-0.png"
    good.write_bytes(b"png")
    empty = tmp_path / "frame-1.png"
    empty.write_bytes(b"")
    missing = tmp_path / "frame-2.png"
    dataset = _BufferDataset({"observation.images.cam": [str(good), str(empty), str(missing)]})
    with pytest.raises(RuntimeError, match="2 of 3"):
        verify_episode_images(dataset, ["observation.images.cam"])


def test_verify_episode_images_skips_streaming_placeholders():
    dataset = _BufferDataset({"observation.images.cam": [None, None]})
    verify_episode_images(dataset, ["observation.images.cam"])


def _exporter_inputs(tmp_path, frame_count):
    import numpy as np

    image_module = pytest.importorskip("PIL.Image")
    from realman_recording.canonical_features import CanonicalFrame
    from realman_recording.lerobot_schema import schema_from_parameters

    schema = schema_from_parameters(
        repo_id="test/parallel", fps=30, arms=["l"],
        arm_action_topics=["/l/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position"], gripper_action_topics=[],
        camera_ids=["left", "right"], base_frames=["l/base_link"], ee_links=["link_6"],
        cartesian_command_frames=["l/base_link"],
    )
    images = {}
    for camera_number, camera in enumerate(("left", "right")):
        images[camera] = []
        for index in range(frame_count):
            path = tmp_path / f"{camera}-{index}.jpg"
            pixels = np.full((8, 12, 3), (index * 9 + camera_number * 100) % 256, dtype=np.uint8)
            image_module.fromarray(pixels).save(path, quality=95)
            images[camera].append((index, path))
    canonical = [
        CanonicalFrame(
            joint_position=(float(index),) * 6, joint_velocity=(0.0,) * 6,
            ee_pose_base=(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0), ee_velocity_base=(0.0,) * 6,
            gripper_position=(0.5,), command_cartesian_velocity=(0.0,) * 6,
            command_gripper=None, valid=True, sync_error_ns=(0,) * 4,
        )
        for index in range(frame_count)
    ]
    return schema, images, canonical


class _RecordingDataset:
    def __init__(self):
        self.frames = []
        self.episode_buffer = {}

    def add_frame(self, payload):
        self.frames.append(payload)


@pytest.mark.parametrize("workers", [1, 4])
def test_exporter_parallel_frames_match_serial(tmp_path, workers):
    import numpy as np
    from types import SimpleNamespace

    from realman_recording.lerobot_exporter import LeRobotExporter

    schema, images, canonical = _exporter_inputs(tmp_path, 12)
    results = {}
    for mode in (0, workers):
        dataset = _RecordingDataset()
        progress = []
        request = SimpleNamespace(image_workers=mode, progress_callback=lambda done, total: progress.append(done))
        LeRobotExporter()._add_v3_frames(dataset, request, schema, canonical, images, "pick", [0] * 12, 3, 12)
        results[mode] = dataset.frames
        assert progress == list(range(1, 13))

    serial, parallel = results[0], results[workers]
    assert len(serial) == len(parallel) == 12
    for expected, actual in zip(serial, parallel):
        assert expected.keys() == actual.keys()
        for key in expected:
            if isinstance(expected[key], np.ndarray):
                assert np.array_equal(expected[key], actual[key]), key
            else:
                assert expected[key] == actual[key], key
    # Frame order is preserved: each frame carries its own joint value and image.
    assert [float(frame["observation.joint_position"][0]) for frame in parallel] == [float(i) for i in range(12)]


def test_exporter_rejects_negative_image_workers(tmp_path):
    from types import SimpleNamespace

    from realman_recording.lerobot_exporter import LeRobotExporter

    schema, images, canonical = _exporter_inputs(tmp_path, 1)
    request = SimpleNamespace(image_workers=-1, progress_callback=None)
    with pytest.raises(ValueError, match="image_workers"):
        LeRobotExporter()._add_v3_frames(_RecordingDataset(), request, schema, canonical, images, "pick", None, None, 1)
