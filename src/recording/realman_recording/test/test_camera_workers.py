"""ROS Image camera archive contracts without a running camera device."""
from __future__ import annotations

import json

from realman_recording.camera_workers import CameraSource


def test_camera_sources_require_only_ros_image_configuration():
    """The ROS-image recorder has no delayed RTSP compatibility parameter."""
    from realman_recording.camera_workers import load_camera_sources

    class Parameter:
        def __init__(self, value):
            self.value = value

    class Node:
        values = {
            "camera_ids": ["front"],
            "camera_image_topics": ["/front/color/image_raw"],
        }

        def get_parameter(self, name):
            return Parameter(self.values[name])

    assert load_camera_sources(Node()) == (CameraSource("front", "/front/color/image_raw"),)


def test_ros_image_archive_persists_jpeg_index(tmp_path):
    """Image callbacks offer JPEG bytes while the archive owns filesystem writes."""
    from realman_recording.camera_workers import RosImageArchive

    archive = RosImageArchive((CameraSource("front", image_topic="/front/color/image_raw"),), queue_size=1)
    archive.start(tmp_path)
    assert archive.offer("front", 100, b"first.jpg") is True
    summary = archive.stop()

    assert summary["front"]["state"] == "stopped"
    index = json.loads((tmp_path / "media-index.json").read_text(encoding="utf-8"))
    assert index["segments"][0]["format"] == "jpeg_frames"
    assert index["segments"][0]["started_wall_ns"] == 100
    assert index["stats"]["front"] == {"accepted": 1, "dropped": 0, "errors": 0}


def test_native_image_is_encoded_on_archive_worker_not_offer_call(tmp_path):
    import realman_recording.camera_workers as workers
    from realman_recording.camera_workers import RosImageArchive

    calls = []
    original = workers.image_to_jpeg
    workers.image_to_jpeg = lambda image: calls.append(image) or b"encoded.jpg"
    try:
        archive = RosImageArchive((CameraSource("front", image_topic="/front/image_raw"),), queue_size=1)
        archive.start(tmp_path)
        image = object()
        assert archive.offer_image("front", 101, image) is True
        assert calls == []
        archive.stop()
        assert calls == [image]
        assert (tmp_path / "front" / "101.jpg").read_bytes() == b"encoded.jpg"
    finally:
        workers.image_to_jpeg = original
