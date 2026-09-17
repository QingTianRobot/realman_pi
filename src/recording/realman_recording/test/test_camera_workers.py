"""Camera recorder contracts without an RTSP server or ffmpeg binary."""
from __future__ import annotations

import json

from realman_recording.camera_workers import CameraRecordingWorker, CameraSource


def test_ros_image_archive_persists_jpeg_index(tmp_path):
    """Image callbacks offer JPEG bytes while the archive owns filesystem writes."""
    from realman_recording.camera_workers import RosImageArchive

    archive = RosImageArchive((CameraSource("front", image_topic="/front/color/image_raw/compressed"),), queue_size=1)
    archive.start(tmp_path)
    assert archive.offer("front", 100, b"first.jpg") is True
    summary = archive.stop()

    assert summary["front"]["state"] == "stopped"
    index = json.loads((tmp_path / "media-index.json").read_text(encoding="utf-8"))
    assert index["segments"][0]["format"] == "jpeg_frames"
    assert index["segments"][0]["started_wall_ns"] == 100


class _Process:
    def __init__(self) -> None:
        self.terminated = False
        self.waited = False
        self.exit_code = None

    def poll(self):
        return self.exit_code

    def terminate(self):
        self.terminated = True

    def wait(self, timeout):
        self.waited = True
        return 0


def test_camera_worker_creates_independent_segments_and_persists_index(tmp_path):
    process = _Process()
    commands = []
    worker = CameraRecordingWorker(
        (CameraSource("front", "rtsp://camera/front"),),
        popen=lambda command, **kwargs: commands.append((command, kwargs)) or process,
        wall_clock_ns=lambda: 100,
        monotonic_clock_ns=lambda: 200,
    )

    worker.start(tmp_path)
    summary = worker.stop()

    assert commands[0][0][:6] == ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-rtsp_transport", "tcp"]
    assert process.terminated is True
    assert summary["front"]["state"] == "stopped"
    index = json.loads((tmp_path / "media-index.json").read_text(encoding="utf-8"))
    assert index["segments"][0]["camera_id"] == "front"
    assert index["segments"][0]["started_wall_ns"] == 100


def test_preview_jpeg_parser_emits_complete_frames_only():
    from realman_recording.camera_workers import extract_jpeg_frames

    frames, remainder = extract_jpeg_frames(b"junk\xff\xd8one\xff\xd9tail\xff\xd8two")

    assert frames == [b"\xff\xd8one\xff\xd9"]
    assert remainder == b"\xff\xd8two"


def test_camera_worker_marks_an_unexpectedly_exited_camera_unhealthy(tmp_path):
    """A dead ffmpeg must be reflected before a session is finalized."""
    process = _Process()
    worker = CameraRecordingWorker(
        (CameraSource("front", "rtsp://camera/front"),),
        popen=lambda *_args, **_kwargs: process,
    )

    worker.start(tmp_path)
    process.exit_code = 23

    assert worker.healthy is False
    assert worker.health_summary()["front"]["state"] == "error"
    assert "exited" in worker.health_summary()["front"]["error"]
