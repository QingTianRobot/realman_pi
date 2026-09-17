"""Tests for the LeRobot time-alignment policies (image-anchored)."""
from __future__ import annotations

import pytest

from realman_recording.lerobot_align import (
    AlignmentPolicy,
    TimedSample,
    align_series,
    align_streams,
)


def test_linear_interpolates_vector_state():
    samples = [
        TimedSample(0, (0.0, 0.0)),
        TimedSample(100, (1.0, 2.0)),
        TimedSample(200, (2.0, 4.0)),
    ]
    values = align_series([50, 150], samples, AlignmentPolicy.LINEAR)
    assert values[0] == (0.5, 1.0)
    assert values[1] == (1.5, 3.0)


def test_linear_clamps_outside_sample_range():
    samples = [TimedSample(100, 1.0), TimedSample(200, 2.0)]
    assert align_series([0, 150, 300], samples, AlignmentPolicy.LINEAR) == [1.0, 1.5, 2.0]


def test_forward_fill_holds_last_discrete_gripper_state():
    samples = [TimedSample(0, 0), TimedSample(100, 1), TimedSample(200, 0)]
    assert align_series([50, 150, 250], samples, AlignmentPolicy.FORWARD_FILL) == [0, 1, 0]


def test_nearest_selects_the_temporally_closest_sample():
    samples = [TimedSample(0, 0), TimedSample(100, 1)]
    assert align_series([60], samples, AlignmentPolicy.NEAREST) == [1]


def test_forward_fill_is_explicit_for_discrete_gripper_state():
    samples = [TimedSample(0, 0), TimedSample(100, 1)]
    assert align_series([60], samples, AlignmentPolicy.FORWARD_FILL) == [0]


def test_forward_fill_rejects_anchor_before_first_causal_state():
    with pytest.raises(ValueError):
        align_series(
            [50],
            [TimedSample(100, 1)],
            AlignmentPolicy.FORWARD_FILL,
        )


def test_align_streams_builds_anchor_frames():
    anchors = [0, 50, 100]
    streams = {
        "arm": ([TimedSample(0, (0.0,)), TimedSample(100, (2.0,))], AlignmentPolicy.LINEAR),
        "gripper": ([TimedSample(0, 0), TimedSample(100, 1)], AlignmentPolicy.NEAREST),
    }
    frames = align_streams(anchors, streams)

    assert [frame.timestamp_ns for frame in frames] == anchors
    assert frames[0].values["arm"] == (0.0,)
    assert frames[1].values["arm"] == (1.0,)  # interpolated at the midpoint
    assert frames[1].values["gripper"] == 0  # forward fill: last sample at-or-before 50
    assert frames[2].values["gripper"] == 1


def test_rejects_empty_and_unsorted_streams():
    with pytest.raises(ValueError):
        align_series([0], [], AlignmentPolicy.LINEAR)
    with pytest.raises(ValueError):
        align_series(
            [0],
            [TimedSample(100, 1.0), TimedSample(0, 0.0)],
            AlignmentPolicy.LINEAR,
        )


def test_rejects_empty_unsorted_and_duplicate_image_anchors():
    stream = [TimedSample(0, 0.0), TimedSample(100, 1.0)]
    with pytest.raises(ValueError):
        align_streams([], {"arm": (stream, AlignmentPolicy.LINEAR)})
    with pytest.raises(ValueError):
        align_streams([100, 0], {"arm": (stream, AlignmentPolicy.LINEAR)})
    with pytest.raises(ValueError):
        align_streams([0, 0], {"arm": (stream, AlignmentPolicy.LINEAR)})


def test_rejects_duplicate_sample_timestamps_and_mismatched_vector_dimensions():
    with pytest.raises(ValueError):
        align_series(
            [0],
            [TimedSample(0, 0.0), TimedSample(0, 1.0)],
            AlignmentPolicy.LINEAR,
        )
    with pytest.raises(ValueError):
        align_series(
            [50],
            [TimedSample(0, (0.0, 1.0)), TimedSample(100, (2.0,))],
            AlignmentPolicy.LINEAR,
        )


def test_rejects_alignment_when_a_sample_gap_exceeds_limit():
    samples = [TimedSample(0, (0.0,)), TimedSample(10_000, (10.0,))]
    with pytest.raises(ValueError):
        align_series([5_000], samples, AlignmentPolicy.LINEAR, max_gap_ns=1_000)
    with pytest.raises(ValueError):
        align_series([5_000], samples, AlignmentPolicy.FORWARD_FILL, max_gap_ns=1_000)
