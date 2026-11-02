import json
from pathlib import Path

import pytest

from realman_web_control.quality_marks import load_quality_reasons, recording_view, view_changed

ROOT = Path(__file__).parents[4]


def test_the_repository_reasons_load_in_key_order():
    reasons = load_quality_reasons(ROOT / "config/recording/quality_reasons.yaml")
    assert reasons[0] == {"id": "grasp_miss", "label": "抓偏"}
    assert len(reasons) == 6


def test_no_reason_file_means_no_reasons(tmp_path):
    assert load_quality_reasons(tmp_path / "absent.yaml") == []
    assert load_quality_reasons(None) == []


def test_only_the_shape_of_the_reason_file_is_checked_here(tmp_path):
    # The recorder validates ids, duplicates and the 9-entry limit (realman_recording.quality_events);
    # here a malformed file is refused and anything well-shaped is passed through to the page.
    path = tmp_path / "reasons.yaml"
    path.write_text("reasons: {id: a}\n", encoding="utf-8")
    with pytest.raises(ValueError):
        load_quality_reasons(path)
    path.write_text("reasons:\n  - {id: Bad, label: x}\n", encoding="utf-8")
    assert load_quality_reasons(path) == [{"id": "Bad", "label": "x"}]


def test_the_recording_view_condenses_the_recorder_status():
    diagnostics = json.dumps({"checked_wall_ns": 1, "diagnostics": [], "quality": {
        "profile": "policy_rollout", "attempt_id": "policy_attempt_x", "deviating": True,
        "deviation_start_ns": "1790000000000000000", "reason": "stall", "rejected_marks": 1,
        "dropped_marks": 2, "auto_record_last_error": "", "auto_record": {"ignored_busy": 0},
    }})
    view = recording_view(state=2, session_id="s1", elapsed_sec=3.14159, diagnostics_json=diagnostics)
    assert view == {"state": "RECORDING", "session_id": "s1", "elapsed_sec": 3.1, "profile": "policy_rollout",
                    "attempt_id": "policy_attempt_x", "deviating": True,
                    "deviation_start_ns": "1790000000000000000", "reason": "stall",
                    "rejected_marks": 1, "dropped_marks": 2, "last_error": ""}


def test_the_recording_view_tolerates_an_old_recorder():
    view = recording_view(state=0, session_id="", elapsed_sec=0.0, diagnostics_json="not json")
    assert view["state"] == "IDLE"
    assert view["deviating"] is False
    assert view["profile"] == ""


def test_elapsed_time_alone_is_not_a_change():
    first = recording_view(state=2, session_id="s1", elapsed_sec=1.0, diagnostics_json="{}")
    later = recording_view(state=2, session_id="s1", elapsed_sec=2.0, diagnostics_json="{}")
    assert view_changed(None, first)
    assert not view_changed(first, later)
    assert view_changed(first, {**later, "deviating": True})
