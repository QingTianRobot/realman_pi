"""Recorder batch adopt-all: one bad session must not abort the rest."""
from __future__ import annotations

import json

import pytest


def _manifest(directory, decision="PENDING"):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY",
        "decision": decision,
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))


def test_adopt_all_adopts_every_pending_and_skips_failures(tmp_path):
    pytest.importorskip("rclpy")
    from realman_recording.recorder_node import RecordingRecorderNode

    class Logger:
        def __init__(self):
            self.warnings: list[str] = []

        def warning(self, message: str) -> None:
            self.warnings.append(message)

    class Harness:
        pass

    harness = Harness()
    harness._root = tmp_path
    logger = Logger()
    harness.get_logger = lambda: logger

    adopted: list[str] = []

    def _adopt_session(session_id: str) -> str:
        if session_id == "bad":
            raise RuntimeError("MCAP write errors")
        adopted.append(session_id)
        return session_id

    harness._adopt_session = _adopt_session

    _manifest(tmp_path / "good-a", "PENDING")
    _manifest(tmp_path / "bad", "PENDING")
    _manifest(tmp_path / "good-b", "PENDING")
    _manifest(tmp_path / "already", "ADOPTED")

    count = RecordingRecorderNode._adopt_all_sessions(harness)

    assert count == 2
    assert adopted == ["good-a", "good-b"]
    assert len(logger.warnings) == 1
    assert "bad" in logger.warnings[0]
