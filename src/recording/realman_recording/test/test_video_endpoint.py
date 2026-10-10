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
    catalog = LeRobotReplayCatalog(root, root / "ds")
    with pytest.raises(ValueError):
        catalog.video_path("s1", "../../escape")
