"""Unit tests for velocity_follow.samples."""

from __future__ import annotations

import pytest

from velocity_follow.samples import (
    CSV_COLUMNS,
    CsvRecorder,
    Sample,
    group_by_segment,
    load_samples,
)


def _sample(index=0, segment="s"):
    return Sample(
        t_sec=index * 0.02,
        segment=segment,
        segment_elapsed_sec=index * 0.02,
        commanded=(0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
        accepted=(0.019, 0.0, 0.0, 0.0, 0.0, 0.0),
        limited=(0.018, 0.0, 0.0, 0.0, 0.0, 0.0),
        measured=(0.017, -0.001, 0.0, 0.0, 0.0, 0.0),
        measured_valid=True,
        session_active=True,
        command_age_ms=7,
        measured_age_ms=53,
        telemetry_age_sec=0.031,
    )


def test_csv_columns_cover_every_vector_and_flag():
    assert CSV_COLUMNS[0] == "t_sec"
    for prefix in ("cmd", "acc", "lim", "mea"):
        assert f"{prefix}_vx" in CSV_COLUMNS
        assert f"{prefix}_wz" in CSV_COLUMNS
    assert "measured_valid" in CSV_COLUMNS
    assert "telemetry_age_sec" in CSV_COLUMNS


def test_sample_rejects_vectors_that_are_not_six_components():
    with pytest.raises(ValueError):
        Sample(t_sec=0.0, commanded=(0.0, 0.0))


def test_recorder_round_trips_a_sample_through_csv(tmp_path):
    path = tmp_path / "run.csv"
    with CsvRecorder(path) as recorder:
        recorder.write(_sample())
        assert recorder.count == 1
    restored = load_samples(path)
    assert len(restored) == 1
    assert restored[0] == _sample()


def test_recorder_flushes_so_an_interrupted_run_is_still_readable(tmp_path):
    path = tmp_path / "run.csv"
    recorder = CsvRecorder(path)
    recorder.write(_sample(0))
    recorder.write(_sample(1))
    # No close(): a Ctrl-C mid-run must still leave analysable evidence.
    assert len(load_samples(path)) == 2
    recorder.close()
    recorder.close()


def test_recorder_creates_missing_parent_directories(tmp_path):
    path = tmp_path / "nested" / "deeper" / "run.csv"
    with CsvRecorder(path) as recorder:
        recorder.write(_sample())
    assert path.is_file()


def test_group_by_segment_splits_on_consecutive_names():
    samples = [_sample(0, "a"), _sample(1, "a"), _sample(2, "b"), _sample(3, "a")]
    grouped = [(name, len(window)) for name, window in group_by_segment(samples)]
    # A repeated name after a different one is a new group, which keeps a
    # restarted segment from being merged with its earlier run.
    assert grouped == [("a", 2), ("b", 1), ("a", 1)]
    assert list(group_by_segment([])) == []
