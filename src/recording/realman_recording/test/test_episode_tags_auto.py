"""Machine-written (auto) episode tags and the derived deviation_count."""
from __future__ import annotations

import json

import pytest

from realman_recording.episode_tags import EpisodeTagStore

AUTO = {"success": False, "policy_task": "pick_only", "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}


def write_session(root, *, auto=AUTO, intervals=None):
    directory = root / "s1"
    directory.mkdir(parents=True)
    episode_tags = {"defaults": {"success": True, "arm": None, "lighting_level": None},
                    "manual": {}, "removed": [], "revision": 0}
    if auto is not None:
        episode_tags["auto"] = dict(auto)
    manifest = {
        "session_id": "s1", "state": "READY", "decision": "PENDING",
        "started_realtime_ns": 1_790_091_000_000_000_000,
        # The recorder writes the attempt verdict into annotations too.
        "annotations": {"success": False if auto is not None else None},
        "metadata": {"task": "pick_only"},
        "episode_tags": episode_tags,
        "quality": {"revision": 0, "attempt": None, "intervals": intervals or [], "rejected_marks": 0},
    }
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    return directory


def stored(directory):
    return json.loads((directory / "manifest.json").read_text(encoding="utf-8"))


def test_auto_tags_override_defaults_and_say_so(tmp_path):
    write_session(tmp_path)
    result = EpisodeTagStore(tmp_path).get("s1")
    assert result["tags"]["success"] is False
    assert result["tag_sources"]["success"] == "auto"  # not mistaken for a manual edit
    assert result["tags"]["failure_reason"] == "dropped"
    assert result["tag_sources"]["policy_task"] == "auto"


def test_manual_tags_win_over_auto_and_auto_survives_edits(tmp_path):
    directory = write_session(tmp_path)
    store = EpisodeTagStore(tmp_path)
    result = store.update("s1", 0, {"success": True}, [], ["policy_task"])
    assert result["tags"]["success"] is True
    assert result["tag_sources"]["success"] == "manual"
    assert "policy_task" not in result["tags"]
    assert stored(directory)["episode_tags"]["auto"] == AUTO
    assert stored(directory)["annotations"]["success"] is True


def test_backfill_keeps_auto_tags(tmp_path):
    directory = write_session(tmp_path)
    store = EpisodeTagStore(tmp_path)
    store.save_defaults({"success": True, "lighting_level": 2})
    store.backfill(dry_run=False)
    assert stored(directory)["episode_tags"]["auto"] == AUTO
    assert stored(directory)["episode_tags"]["defaults"]["lighting_level"] == 2


def test_deviation_count_is_derived_and_read_only(tmp_path):
    intervals = [
        {"start_ns": "1790091001000000000", "end_ns": "1790091002000000000", "reason": None, "source": "live"},
        {"start_ns": "1790091003000000000", "end_ns": None, "reason": None, "source": "live"},
    ]
    write_session(tmp_path, auto=None, intervals=intervals)
    store = EpisodeTagStore(tmp_path)
    result = store.get("s1")
    assert result["tags"]["deviation_count"] == 2
    assert result["tag_sources"]["deviation_count"] == "derived"
    with pytest.raises(ValueError):
        store.update("s1", 0, {"deviation_count": 0}, [])
    with pytest.raises(ValueError):
        store.update("s1", 0, {}, [], ["deviation_count"])
    episode = store.rebuild()["episodes"][0]
    assert episode["tags"]["deviation_count"] == 2


def test_sessions_without_quality_count_zero_deviations(tmp_path):
    directory = write_session(tmp_path, auto=None)
    manifest = stored(directory)
    del manifest["quality"]
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    assert EpisodeTagStore(tmp_path).get("s1")["tags"]["deviation_count"] == 0
