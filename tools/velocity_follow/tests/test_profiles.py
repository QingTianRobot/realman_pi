"""Unit tests for velocity_follow.profiles."""

from __future__ import annotations

import math

import pytest

from velocity_follow.profiles import (
    ProfileRunner,
    Segment,
    parse_profile,
    parse_segment,
)


def test_parse_segment_reads_every_field():
    segment = parse_segment("vx|square|0.02|8.0|0.5|2.0|x-square")
    assert segment.axis == "vx"
    assert segment.waveform == "square"
    assert segment.amplitude == pytest.approx(0.02)
    assert segment.duration_sec == pytest.approx(8.0)
    assert segment.frequency_hz == pytest.approx(0.5)
    assert segment.settle_sec == pytest.approx(2.0)
    assert segment.name == "x-square"


def test_parse_segment_applies_the_default_settle_time():
    segment = parse_segment("vx|step|0.02|4.0", default_settle_sec=1.5)
    assert segment.settle_sec == pytest.approx(1.5)
    assert segment.total_sec == pytest.approx(5.5)
    assert segment.name == "vx-step"


@pytest.mark.parametrize(
    "spec",
    [
        "vx|step|0.02",
        "vq|step|0.02|4.0",
        "vx|triangle|0.02|4.0",
        "vx|step|0|4.0",
        "vx|step|0.02|0",
        "vx|sine|0.02|4.0|0",
        "vx|step|abc|4.0",
        "vx|step|0.02|4.0|0|-1.0",
    ],
)
def test_parse_segment_rejects_malformed_specifications(spec):
    with pytest.raises(ValueError):
        parse_segment(spec)


def test_parse_profile_rejects_an_empty_profile():
    with pytest.raises(ValueError):
        parse_profile([])


def test_step_holds_the_amplitude_then_settles_at_zero():
    segment = Segment("vx", "step", 0.02, 4.0, settle_sec=2.0)
    assert segment.scalar_at(0.0) == pytest.approx(0.02)
    assert segment.scalar_at(3.9) == pytest.approx(0.02)
    assert segment.scalar_at(4.0) == pytest.approx(0.0)
    assert segment.scalar_at(5.9) == pytest.approx(0.0)
    assert segment.scalar_at(6.0) == pytest.approx(0.0)


def test_ramp_reaches_the_amplitude_at_the_end_of_the_excitation():
    segment = Segment("vz", "ramp", 0.04, 2.0)
    assert segment.scalar_at(0.0) == pytest.approx(0.0)
    assert segment.scalar_at(1.0) == pytest.approx(0.02)
    assert segment.scalar_at(1.999) == pytest.approx(0.04, abs=1e-4)


def test_square_alternates_sign_every_half_period():
    segment = Segment("vx", "square", 0.02, 4.0, frequency_hz=0.5)
    assert segment.scalar_at(0.1) == pytest.approx(0.02)
    assert segment.scalar_at(1.1) == pytest.approx(-0.02)
    assert segment.scalar_at(2.1) == pytest.approx(0.02)


def test_sine_completes_one_cycle_per_period():
    segment = Segment("wz", "sine", 0.1, 4.0, frequency_hz=0.25)
    assert segment.scalar_at(0.0) == pytest.approx(0.0, abs=1e-12)
    assert segment.scalar_at(1.0) == pytest.approx(0.1)
    assert segment.scalar_at(2.0) == pytest.approx(0.0, abs=1e-9)
    assert segment.scalar_at(3.0) == pytest.approx(-0.1)


def test_chirp_frequency_increases_across_the_segment():
    segment = Segment("vx", "chirp", 0.02, 10.0, frequency_hz=2.0)
    early = [segment.scalar_at(t / 100.0) for t in range(0, 100)]
    late = [segment.scalar_at(9.0 + t / 100.0) for t in range(0, 100)]

    def crossings(values):
        return sum(
            1
            for index in range(1, len(values))
            if values[index - 1] <= 0.0 < values[index]
            or values[index - 1] >= 0.0 > values[index]
        )

    assert crossings(late) > crossings(early)


def test_command_at_places_the_value_on_the_right_vector_slot():
    assert Segment("wy", "hold", 0.2, 1.0).command_at(0.5) == (0.0, 0.0, 0.0, 0.0, 0.2, 0.0)
    assert Segment("vy", "hold", -0.01, 1.0).command_at(0.5) == (0.0, -0.01, 0.0, 0.0, 0.0, 0.0)


def test_runner_walks_segments_in_order_and_finishes():
    runner = ProfileRunner(
        (
            Segment("vx", "hold", 0.02, 1.0, label="first"),
            Segment("vy", "hold", 0.03, 1.0, label="second"),
        )
    )
    assert runner.total_sec == pytest.approx(2.0)
    assert runner.command_at(0.0)[0] == pytest.approx(0.02)
    assert runner.active_segment.name == "first"
    assert runner.command_at(0.5)[0] == pytest.approx(0.02)
    assert runner.command_at(1.2)[1] == pytest.approx(0.03)
    assert runner.active_segment.name == "second"
    assert runner.segment_elapsed(1.2) == pytest.approx(0.2)
    assert runner.command_at(2.5) == (0.0,) * 6
    assert runner.finished
    assert runner.active_segment is None


def test_runner_skips_segments_that_a_stalled_loop_jumped_over():
    runner = ProfileRunner(
        (
            Segment("vx", "hold", 0.02, 1.0, label="first"),
            Segment("vy", "hold", 0.03, 1.0, label="second"),
            Segment("vz", "hold", 0.04, 1.0, label="third"),
        )
    )
    runner.command_at(0.0)
    # A blocked executor can deliver the next tick long after the deadline; the
    # runner must land on the segment that is actually current, not the next one.
    assert runner.command_at(2.5)[2] == pytest.approx(0.04)
    assert runner.active_segment.name == "third"


def test_runner_requires_at_least_one_segment():
    with pytest.raises(ValueError):
        ProfileRunner(())


def test_waveform_values_stay_finite_across_a_whole_segment():
    for waveform, frequency in (("sine", 1.0), ("chirp", 3.0), ("square", 2.0), ("ramp", 0.0)):
        segment = Segment("vx", waveform, 0.05, 5.0, frequency_hz=frequency)
        for step in range(0, 500):
            assert math.isfinite(segment.scalar_at(step / 100.0))


def test_phase_and_label_separate_the_excitation_from_the_settle_tail():
    segment = Segment("vx", "step", 0.02, 4.0, settle_sec=2.0, label="x-step")
    assert segment.phase_at(0.0) == "excite"
    assert segment.phase_at(3.99) == "excite"
    assert segment.phase_at(4.0) == "settle"
    assert segment.phase_at(5.99) == "settle"
    assert segment.phase_at(6.0) == "done"
    assert segment.label_at(1.0) == "x-step"
    assert segment.label_at(5.0) == "x-step|settle"


def test_runner_label_follows_the_active_phase():
    runner = ProfileRunner(
        (
            Segment("vx", "step", 0.02, 1.0, settle_sec=1.0, label="first"),
            Segment("vy", "step", 0.03, 1.0, label="second"),
        )
    )
    runner.command_at(0.0)
    assert runner.label == "first"
    runner.command_at(1.5)
    # The settle tail must not be recorded under the excitation's own name, or
    # its zero command would be analysed as a failure to follow.
    assert runner.label == "first|settle"
    runner.command_at(2.5)
    assert runner.label == "second"
    runner.command_at(9.0)
    assert runner.label == "done"
    assert runner.finished
