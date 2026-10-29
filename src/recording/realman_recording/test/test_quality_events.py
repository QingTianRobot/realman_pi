"""Pure rules for deviation reasons, intervals and live marks (no ROS)."""
from __future__ import annotations

from pathlib import Path

import pytest

from realman_recording.quality_events import (
    LiveQualityTracker,
    QualityError,
    load_quality_reasons,
    quality_block,
    validate_intervals,
)

ROOT = Path(__file__).parents[4]
REASONS = ("grasp_miss", "stall")
START = 1_790_000_000_000_000_000
SECOND = 1_000_000_000


def test_the_repository_reason_list_loads_in_key_order():
    reasons = load_quality_reasons(ROOT / "config/recording/quality_reasons.yaml")
    assert [reason.id for reason in reasons] == [
        "grasp_miss", "wrong_target", "collision_risk", "stall", "drop", "other",
    ]
    assert reasons[0].label == "抓偏"


def test_a_missing_reason_file_means_no_reasons(tmp_path):
    assert load_quality_reasons(tmp_path / "absent.yaml") == ()


@pytest.mark.parametrize("body", [
    "reasons: {id: a}\n",
    "reasons:\n  - {id: Bad, label: x}\n",
    "reasons:\n  - {id: a, label: x}\n  - {id: a, label: y}\n",
    "reasons:\n  - {id: a, label: ''}\n",
    "reasons:\n" + "".join(f"  - {{id: r{index}, label: x}}\n" for index in range(10)),
])
def test_a_broken_reason_file_is_refused(tmp_path, body):
    path = tmp_path / "reasons.yaml"
    path.write_text(body, encoding="utf-8")
    with pytest.raises(QualityError):
        load_quality_reasons(path)


def interval(start, end, reason=None, source="live"):
    return {"start_ns": start, "end_ns": end, "reason": reason, "source": source}


def test_valid_intervals_are_normalized_to_decimal_strings():
    result = validate_intervals(
        [interval(START + SECOND, START + 2 * SECOND, "stall"), interval(str(START + 3 * SECOND), None)],
        start_ns=START, end_ns=START + 10 * SECOND, reasons=REASONS,
    )
    assert result == [
        {"start_ns": str(START + SECOND), "end_ns": str(START + 2 * SECOND), "reason": "stall", "source": "live"},
        {"start_ns": str(START + 3 * SECOND), "end_ns": None, "reason": None, "source": "live"},
    ]


@pytest.mark.parametrize("intervals", [
    "not a list",
    [interval(START + 2 * SECOND, START + 3 * SECOND), interval(START + SECOND, START + 4 * SECOND)],  # overlap
    [interval(START + SECOND, None), interval(START + 3 * SECOND, START + 4 * SECOND)],  # open not last
    [interval(START + SECOND, START + SECOND)],  # empty
    [interval(START + SECOND, START + 2 * SECOND, "unknown")],
    [interval(START + SECOND, START + 2 * SECOND, None, "guess")],
    [{**interval(START + SECOND, START + 2 * SECOND), "start_frame": 1}],
    [interval(START - 5 * SECOND, START + SECOND)],  # before the recording
    [interval(START + SECOND, START + 20 * SECOND)],  # after the recording
    [interval(True, None)],
])
def test_invalid_intervals_are_refused(intervals):
    with pytest.raises(QualityError):
        validate_intervals(intervals, start_ns=START, end_ns=START + 10 * SECOND, reasons=REASONS)


def test_quality_block_defaults_for_sessions_without_one():
    assert quality_block({}) == {"revision": 0, "attempt": None, "intervals": [], "rejected_marks": 0}
    block = {"revision": 3, "attempt": {"attempt_id": "a"}, "intervals": [], "rejected_marks": 1}
    assert quality_block({"quality": block}) == block


def test_live_marks_build_one_interval_with_its_reason():
    tracker = LiveQualityTracker(session_start_ns=START, reasons=REASONS)
    now = START + 10 * SECOND
    assert tracker.apply("deviate_start", START + SECOND, "", now_ns=now)
    assert tracker.deviating
    assert tracker.open_interval() == {"start_ns": START + SECOND, "end_ns": None, "reason": None, "source": "live"}
    assert tracker.apply("reason", START + 2 * SECOND, "stall", now_ns=now)
    assert tracker.apply("recover", START + 3 * SECOND, "", now_ns=now)
    assert not tracker.deviating
    assert tracker.intervals() == [
        {"start_ns": str(START + SECOND), "end_ns": str(START + 3 * SECOND), "reason": "stall", "source": "live"},
    ]
    assert tracker.rejected == 0


def test_live_marks_that_break_the_rules_are_counted_and_ignored():
    tracker = LiveQualityTracker(session_start_ns=START, reasons=REASONS)
    now = START + 10 * SECOND
    assert not tracker.apply("recover", START + SECOND, "", now_ns=now)  # nothing to recover
    assert not tracker.apply("reason", START + SECOND, "stall", now_ns=now)  # nothing to label
    assert tracker.apply("deviate_start", START + 2 * SECOND, "grasp_miss", now_ns=now)
    assert not tracker.apply("deviate_start", START + 3 * SECOND, "", now_ns=now)  # already deviating
    assert not tracker.apply("reason", START + 3 * SECOND, "unknown", now_ns=now)
    assert not tracker.apply("recover", START + SECOND, "", now_ns=now)  # before the open start
    assert not tracker.apply("recover", now + SECOND, "", now_ns=now)  # stamped in the future
    assert not tracker.apply("jump", START + 4 * SECOND, "", now_ns=now)
    assert tracker.rejected == 7
    assert tracker.deviating


def test_quality_block_returns_copies_not_the_manifest_lists():
    """Ensure quality_block() doesn't return references that mutate the manifest."""
    manifest = {
        "quality": {
            "revision": 1,
            "attempt": {"attempt_id": "test_attempt", "other_key": "initial"},
            "intervals": [{"start_ns": str(START), "end_ns": str(START + SECOND), "reason": "stall", "source": "live"}],
            "rejected_marks": 0,
        }
    }
    result = quality_block(manifest)

    # Mutate the returned structures
    result["intervals"].append({"start_ns": str(START + 2 * SECOND), "end_ns": None, "reason": None, "source": "live"})
    result["attempt"]["new_key"] = "mutated_value"

    # Verify the original manifest is unchanged
    assert len(manifest["quality"]["intervals"]) == 1
    assert "new_key" not in manifest["quality"]["attempt"]
    assert manifest["quality"]["attempt"]["other_key"] == "initial"
