"""Pure rules for deviation reasons, intervals and live marks (no ROS)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from realman_recording.quality_events import (
    LiveQualityTracker,
    QualityError,
    QualityReason,
    build_sidecar,
    frame_labels,
    interval_frames,
    load_quality_reasons,
    main,
    parse_ns,
    quality_block,
    session_document,
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


@pytest.mark.parametrize("value", ["\u0661\u0662\u0663", "\u00b2", "1\uff10"])  # Arabic-Indic, superscript, fullwidth
def test_non_ascii_digit_strings_are_not_nanoseconds(value):
    with pytest.raises(QualityError):
        parse_ns(value, "start_ns")


def test_ascii_decimal_strings_and_ints_are_nanoseconds():
    assert parse_ns("123", "start_ns") == 123
    assert parse_ns(123, "start_ns") == 123


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


FIRST = 1_790_000_000_000_000_000
STEP = 100_000_000  # 10 fps


def test_interval_frames_follow_the_exporter_grid():
    grid = {"first_walltime_ns": FIRST, "fps": 10.0, "frame_count": 8}
    # [1.15 s, 1.35 s) covers frames at 1.2 s and 1.3 s.
    assert interval_frames(interval(FIRST + 150_000_000, FIRST + 350_000_000), **grid) == (2, 3)
    assert interval_frames(interval(FIRST + 6 * STEP, None), **grid) == (6, 7)
    assert interval_frames(interval(FIRST - 5 * STEP, FIRST + STEP), **grid) == (0, 0)
    assert interval_frames(interval(FIRST - 5 * STEP, FIRST - STEP), **grid) == (None, None)
    assert interval_frames(interval(FIRST + 20 * STEP, None), **grid) == (None, None)


def test_frame_labels_mark_deviation_and_count_down_to_the_next_one():
    intervals = [interval(FIRST + 150_000_000, FIRST + 350_000_000), interval(FIRST + 6 * STEP, None)]
    deviating, ahead = frame_labels(intervals, first_walltime_ns=FIRST, fps=10.0, frame_count=8)
    assert deviating == [0, 0, 1, 1, 0, 0, 1, 1]
    assert ahead == [2, 1, 0, 0, 2, 1, 0, 0]
    assert frame_labels([], first_walltime_ns=FIRST, fps=10.0, frame_count=3) == ([0, 0, 0], [-1, -1, -1])


def make_session(root, session_id, *, repo_id="realman/pi05-policy-rollouts", episode_index=3,
                 decision="ADOPTED", export_state="SUCCEEDED", receipt=True):
    directory = root / session_id
    (directory / "export").mkdir(parents=True)
    manifest = {
        "session_id": session_id, "state": "READY", "decision": decision,
        "started_realtime_ns": FIRST - 500_000_000, "ended_realtime_ns": FIRST + 3 * SECOND,
        "export": {"state": export_state},
        "quality": {
            "revision": 0,
            "attempt": {"attempt_id": "policy_attempt_20261029_031500_r", "outcome": "dropped", "succeeded": False},
            "intervals": [interval(str(FIRST + 150_000_000), str(FIRST + 450_000_000), "grasp_miss")],
            "rejected_marks": 0,
        },
    }
    (directory / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    if receipt:
        (directory / "export" / "lerobot-v3.json").write_text(json.dumps({
            "repo_id": repo_id, "fps": 10, "episode_index": episode_index,
            "first_walltime_ns": FIRST, "frame_count": 20,
        }), encoding="utf-8")
    return directory


def test_session_document_adds_frames_and_reasons(tmp_path):
    directory = make_session(tmp_path, "s1")
    document = session_document(directory, (QualityReason("grasp_miss", "抓偏"),))
    assert document["session_id"] == "s1"
    assert document["revision"] == 0
    assert document["attempt"]["outcome"] == "dropped"
    assert document["frames"] == {"fps": 10.0, "first_walltime_ns": str(FIRST), "frame_count": 20}
    assert document["intervals"][0]["start_frame"] == 2
    assert document["intervals"][0]["end_frame"] == 4
    assert document["reasons"] == [{"id": "grasp_miss", "label": "抓偏"}]


def test_session_document_without_export_has_no_frames(tmp_path):
    directory = make_session(tmp_path, "s1", receipt=False)
    document = session_document(directory, ())
    assert document["frames"] is None
    assert document["intervals"][0]["start_frame"] is None


def test_sidecar_keeps_exported_episodes_of_one_dataset(tmp_path):
    make_session(tmp_path, "a", episode_index=3)
    make_session(tmp_path, "b", episode_index=1)
    make_session(tmp_path, "c", repo_id="realman/pi05-three-arm", episode_index=0)
    make_session(tmp_path, "d", episode_index=7, decision="DISCARDED")
    make_session(tmp_path, "e", episode_index=8, export_state="FAILED")
    make_session(tmp_path, "f", episode_index=3)  # duplicate index -> error, first one kept
    sidecar = build_sidecar(tmp_path, "realman/pi05-policy-rollouts", generated_at_ns=42)
    assert sidecar["schema"] == "realman.quality_events.v1"
    assert sidecar["generated_at_ns"] == "42"
    assert list(sidecar["episodes"]) == ["1", "3"]
    episode = sidecar["episodes"]["3"]
    assert episode["session_id"] == "a"
    assert episode["fps"] == 10.0 and episode["frame_count"] == 20
    assert episode["first_walltime_ns"] == str(FIRST)
    assert episode["intervals"][0]["start_frame"] == 2
    assert [error["session_id"] for error in sidecar["errors"]] == ["f"]


def test_the_dump_command_writes_the_sidecar(tmp_path, capsys):
    make_session(tmp_path / "recordings", "a")
    output = tmp_path / "episode_quality_events.json"
    assert main(["dump", "--recording-root", str(tmp_path / "recordings"),
                 "--repo-id", "realman/pi05-policy-rollouts", "-o", str(output)]) == 0
    assert list(json.loads(output.read_text(encoding="utf-8"))["episodes"]) == ["3"]
    assert "1 episodes" in capsys.readouterr().out
