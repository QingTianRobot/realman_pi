"""Tests for the episode video path resolver and the Range video endpoint."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from realman_recording.lerobot_web_replay import LeRobotReplayCatalog


def _make_session(root: Path, session: str, episode: int, cameras: list[str]) -> None:
    sdir = root / session
    (sdir / "export").mkdir(parents=True)
    (sdir / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "SUCCEEDED", "result": str(root / "ds")},
        "metadata": {"task": "t"},
    }))
    (sdir / "export" / "lerobot-v3.json").write_text(json.dumps({
        "dataset_root": str(root / "ds"),
        "episode_index": episode, "first_walltime_ns": 0, "fps": 15.0,
        "repo_id": "x", "schema_fingerprint": "s",
    }))
    for cam in cameras:
        vdir = root / "ds" / "videos" / f"observation.images.{cam}" / "chunk-000"
        vdir.mkdir(parents=True)
        (vdir / f"file-{episode:03d}.mp4").write_bytes(b"mp4")


def test_video_path_resolves_episode_mp4(tmp_path):
    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root, "s1", 2, ["orbbec-left"])
    catalog = LeRobotReplayCatalog(root, root / "ds")
    path = catalog.video_path("s1", "orbbec-left")
    assert path.name == "file-002.mp4"
    assert path.is_file()


def test_video_path_rejects_unknown_camera(tmp_path):
    root = tmp_path / "rec"; root.mkdir()
    _make_session(root, "s1", 0, ["orbbec-left"])
    catalog = LeRobotReplayCatalog(root, root / "ds")
    with pytest.raises(ValueError):
        catalog.video_path("s1", "nonexistent")


def test_video_path_rejects_camera_path_traversal(tmp_path):
    root = tmp_path / "rec"; root.mkdir()
    _make_session(root, "s1", 0, ["orbbec-left"])
    ds = root / "ds"
    # The first `..` of the camera id merges with the trailing `.` of
    # `observation.images.` into the literal directory `observation.images...`.
    # It must exist on disk so the kernel can resolve the remaining `..` past it;
    # otherwise is_file() is False and the traversal guard never discriminates.
    (ds / "videos" / "observation.images...").mkdir(parents=True)
    escaped = root / "escape" / "chunk-000"
    escaped.mkdir(parents=True)
    (escaped / "file-000.mp4").write_bytes(b"mp4")
    catalog = LeRobotReplayCatalog(root, ds)
    with pytest.raises(ValueError):
        catalog.video_path("s1", "../../../../escape")


def test_parse_range_full_and_partial():
    from realman_recording.web_server import _parse_range
    assert _parse_range("bytes=0-", 1000) == (0, 999)
    assert _parse_range("bytes=100-199", 1000) == (100, 199)
    assert _parse_range("bytes=-100", 1000) == (900, 999)
    assert _parse_range(None, 1000) is None


def test_parse_range_rejects_invalid_and_multi_specs():
    from realman_recording.web_server import _parse_range
    assert _parse_range("bytes=1000-", 1000) is None
    assert _parse_range("bytes=500-100", 1000) is None
    assert _parse_range("bytes=", 1000) is None
    assert _parse_range("items=0-10", 1000) is None
    # Only the first range of a multi-range header is honored.
    assert _parse_range("bytes=0-199, 300-399", 1000) == (0, 199)


def test_parse_range_rejects_negative_start():
    from realman_recording.web_server import _parse_range
    assert _parse_range("bytes=-5-10", 1000) is None


def test_video_endpoint_serves_full_and_range_content(tmp_path):
    pytest.importorskip("aiohttp")
    import asyncio

    from aiohttp import web
    from aiohttp.test_utils import TestClient, TestServer

    from realman_recording.web_server import RecordingWebServer

    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root, "s1", 0, ["cam"])
    video = root / "ds" / "videos" / "observation.images.cam" / "chunk-000" / "file-000.mp4"
    video.write_bytes(b"0123456789abcdef")

    class _NullLogger:
        def warning(self, *_args, **_kwargs):
            pass

    server = object.__new__(RecordingWebServer)
    server._recording_root = root
    server._replay = LeRobotReplayCatalog(root, root / "ds")
    server._logger = _NullLogger()

    app = web.Application()
    app.router.add_get("/api/lerobot/{session_id}/video/{camera_id}", server._lerobot_video)

    async def run():
        client = TestClient(TestServer(app))
        await client.start_server()
        try:
            partial = await client.get(
                "/api/lerobot/s1/video/cam", headers={"Range": "bytes=2-5"}
            )
            assert partial.status == 206
            assert partial.headers["Content-Range"] == "bytes 2-5/16"
            assert partial.headers["Accept-Ranges"] == "bytes"
            assert await partial.read() == b"2345"

            full = await client.get("/api/lerobot/s1/video/cam")
            assert full.status == 200
            assert await full.read() == b"0123456789abcdef"

            missing = await client.get("/api/lerobot/s1/video/nope")
            assert missing.status == 404
        finally:
            await client.close()

    asyncio.run(run())
