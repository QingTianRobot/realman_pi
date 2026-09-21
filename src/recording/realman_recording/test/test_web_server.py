"""Regression tests for the browser-safe LeRobot replay index."""
from __future__ import annotations

import json

import pytest

from realman_recording.web_server import load_replay_index


def test_load_replay_index_returns_only_relative_camera_jpegs(tmp_path):
    replay = {
        "schema_version": 1,
        "frames": [{"timestamp_ns": 100, "cameras": {"left": "videos/left/000001.jpg"}}],
    }
    (tmp_path / "replay.json").write_text(json.dumps(replay), encoding="utf-8")

    assert load_replay_index(tmp_path)["frames"][0]["cameras"] == {"left": "videos/left/000001.jpg"}


@pytest.mark.parametrize("camera_path", ["../outside.jpg", "/etc/passwd", "videos/../../outside.jpg"])
def test_load_replay_index_rejects_camera_paths_outside_dataset(tmp_path, camera_path):
    (tmp_path / "replay.json").write_text(
        json.dumps({"schema_version": 1, "frames": [{"timestamp_ns": 100, "cameras": {"left": camera_path}}]}),
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="camera path"):
        load_replay_index(tmp_path)
