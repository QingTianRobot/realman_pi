"""The session manifest's quality block: live writes, attempt outcome, replay edits."""
from __future__ import annotations

import json

import pytest

from realman_recording.quality_events import QualityConflict, QualityError
from realman_recording.session_store import SessionState, SessionStore

START = 1_790_000_000_000_000_000
SECOND = 1_000_000_000


def interval(start, end, reason=None, source="live"):
    return {"start_ns": str(start), "end_ns": None if end is None else str(end), "reason": reason, "source": source}


def live_quality():
    return {"revision": 0, "attempt": None, "intervals": [interval(START + SECOND, START + 2 * SECOND, "stall")],
            "rejected_marks": 1}


def test_live_quality_is_written_to_the_partial_and_kept_on_finalize(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.transition(SessionState.RECORDING)
    store.update_quality(live_quality())
    partial = json.loads((session.directory / "manifest.partial.json").read_text(encoding="utf-8"))
    assert partial["quality"] == live_quality()
    final = json.loads(store.finalize(True, ended_realtime_ns=START + 5 * SECOND).read_text(encoding="utf-8"))
    assert final["quality"] == live_quality()


def test_attempt_outcome_sets_tags_and_business_success(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    attempt = {"attempt_id": "policy_attempt_x", "task": "pick_only", "outcome": "dropped", "succeeded": False}
    tags = {"success": False, "policy_task": "pick_only", "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}
    store.record_attempt_outcome(attempt, auto_tags=tags)
    final = json.loads(store.finalize(True, ended_realtime_ns=START + 5 * SECOND).read_text(encoding="utf-8"))
    assert final["quality"]["attempt"] == attempt
    assert final["quality"]["intervals"] == live_quality()["intervals"]  # the live marks survive
    assert final["episode_tags"]["auto"] == tags
    assert final["annotations"]["success"] is False  # not overwritten by the default on finalize
    assert final["annotations"]["failure_reason"] == "dropped"
    assert session.session_id == final["session_id"]


def test_an_interrupted_session_keeps_its_quality_block(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    recovered = SessionStore.recover_orphaned_sessions(tmp_path, recovered_realtime_ns=START + 9 * SECOND)
    assert recovered == [{"session_id": session.session_id, "state": "FAILED"}]
    final = json.loads((session.directory / "manifest.json").read_text(encoding="utf-8"))
    assert final["quality"] == live_quality()


def finalized(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    store.update_quality(live_quality())
    store.finalize(True, ended_realtime_ns=START + 5 * SECOND)
    return session.directory


def test_replay_edits_bump_the_revision_and_mark_changed_intervals(tmp_path):
    directory = finalized(tmp_path)
    kept = interval(START + SECOND, START + 2 * SECOND, "stall", "replay")  # unchanged bounds and reason
    added = interval(START + 3 * SECOND, None, None, "live")  # new: the server marks it replay
    quality = SessionStore.update_quality_intervals(directory, [kept, added], 0, reasons=["stall"])
    assert quality["revision"] == 1
    assert [item["source"] for item in quality["intervals"]] == ["live", "replay"]
    assert quality["rejected_marks"] == 1
    stored = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))["quality"]
    assert stored == quality


def test_a_stale_revision_or_invalid_intervals_are_refused(tmp_path):
    directory = finalized(tmp_path)
    SessionStore.update_quality_intervals(directory, [], 0, reasons=["stall"])
    with pytest.raises(QualityConflict):
        SessionStore.update_quality_intervals(directory, [], 0, reasons=["stall"])
    with pytest.raises(QualityError):
        SessionStore.update_quality_intervals(directory, [interval(5, None)], 1, reasons=["stall"])
    with pytest.raises(ValueError):
        SessionStore.update_quality_intervals(directory, [], "1", reasons=["stall"])


def test_replay_edits_need_a_finalized_manifest(tmp_path):
    store = SessionStore(tmp_path)
    session = store.create({"profile": "policy_rollout"}, started_realtime_ns=START, started_monotonic_ns=1)
    with pytest.raises(ValueError):
        SessionStore.update_quality_intervals(session.directory, [], 0, reasons=[])
