"""Unit tests for velocity_follow.metrics."""

from __future__ import annotations

import math

import pytest

from velocity_follow.metrics import (
    analyze_run,
    analyze_segment,
    angle_between_deg,
    cross_axis_leakage,
    displacement_check,
    dominant_axis,
    estimate_lag_sec,
    rate_stats,
    rise_time_sec,
    rms,
    rms_error,
    series,
)
from velocity_follow.samples import Sample


PERIOD = 0.02


def _sample(index, commanded, measured, *, segment="s", valid=True, active=True):
    return Sample(
        t_sec=index * PERIOD,
        segment=segment,
        segment_elapsed_sec=index * PERIOD,
        commanded=(commanded, 0.0, 0.0, 0.0, 0.0, 0.0),
        accepted=(commanded, 0.0, 0.0, 0.0, 0.0, 0.0),
        limited=(commanded, 0.0, 0.0, 0.0, 0.0, 0.0),
        measured=(measured, 0.0, 0.0, 0.0, 0.0, 0.0),
        measured_valid=valid,
        session_active=active,
        telemetry_age_sec=0.0,
    )


def test_rms_and_rms_error_ignore_non_finite_values():
    assert rms([3.0, 4.0]) == pytest.approx(math.sqrt(12.5))
    assert rms([]) == 0.0
    assert rms([1.0, float("nan")]) == pytest.approx(1.0)
    assert rms_error([1.0, 1.0], [1.5, 0.5]) == pytest.approx(0.5)
    assert rms_error([], []) == 0.0


def test_rate_stats_reports_mean_rate_and_jitter():
    stats = rate_stats([0.0, 0.02, 0.04, 0.06])
    assert stats.count == 4
    assert stats.mean_hz == pytest.approx(50.0)
    assert stats.jitter_ms == pytest.approx(0.0, abs=1e-9)

    uneven = rate_stats([0.0, 0.02, 0.10])
    assert uneven.max_period_ms == pytest.approx(80.0)
    assert uneven.jitter_ms > 0.0


def test_rate_stats_handles_degenerate_inputs():
    assert rate_stats([]).mean_hz == 0.0
    assert rate_stats([1.0]).mean_hz == 0.0
    assert rate_stats([1.0, 1.0]).mean_hz == 0.0


def test_series_and_dominant_axis_pick_the_excited_axis():
    samples = [_sample(index, 0.02, 0.02) for index in range(10)]
    assert series(samples, "commanded", "vx") == [0.02] * 10
    assert dominant_axis(samples) == "vx"


def test_estimate_lag_recovers_a_known_delay():
    period = 0.02
    reference = [math.sin(2.0 * math.pi * 0.5 * index * period) for index in range(400)]
    shift = 5  # 100 ms
    response = [0.0] * shift + reference[: len(reference) - shift]
    assert estimate_lag_sec(reference, response, period) == pytest.approx(shift * period)


def test_estimate_lag_returns_none_for_a_constant_reference():
    assert estimate_lag_sec([0.02] * 100, [0.02] * 100, 0.02) is None


def test_estimate_lag_returns_none_for_too_few_samples():
    assert estimate_lag_sec([1.0, 2.0], [1.0, 2.0], 0.02) is None
    assert estimate_lag_sec([1.0] * 10, [1.0] * 10, 0.0) is None


def test_rise_time_finds_the_first_crossing_of_the_target_fraction():
    times = [index * 0.02 for index in range(11)]
    response = [index * 0.002 for index in range(11)]
    # 90% of 0.02 is 0.018, first reached at index 9 -> 0.18 s.
    assert rise_time_sec(times, response, 0.02) == pytest.approx(0.18)


def test_rise_time_handles_negative_targets_and_never_reaching_them():
    times = [index * 0.02 for index in range(5)]
    assert rise_time_sec(times, [-0.001, -0.01, -0.02, -0.02, -0.02], -0.02) == pytest.approx(0.04)
    assert rise_time_sec(times, [0.0] * 5, 0.02) is None
    assert rise_time_sec(times, [0.0] * 5, 0.0) is None


def test_cross_axis_leakage_reports_uncommanded_motion():
    samples = [
        Sample(
            t_sec=index * PERIOD,
            segment="s",
            commanded=(0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            measured=(0.02, 0.005, 0.0, 0.0, 0.0, 0.0),
            measured_valid=True,
            session_active=True,
        )
        for index in range(10)
    ]
    leakage = cross_axis_leakage(samples, "vx")
    assert "vx" not in leakage
    assert leakage["vy"] == pytest.approx(0.005)
    assert leakage["vz"] == pytest.approx(0.0)


def test_angle_between_deg_and_its_degenerate_cases():
    assert angle_between_deg((1.0, 0.0, 0.0), (0.0, 1.0, 0.0)) == pytest.approx(90.0)
    assert angle_between_deg((1.0, 0.0, 0.0), (2.0, 0.0, 0.0)) == pytest.approx(0.0, abs=1e-9)
    assert angle_between_deg((0.0, 0.0, 0.0), (1.0, 0.0, 0.0)) is None
    assert angle_between_deg((1.0,), (1.0, 0.0, 0.0)) is None


def test_displacement_check_scores_travel_and_direction():
    check = displacement_check((0.08, 0.0, 0.0), (0.06, 0.02, 0.0))
    assert check.commanded_distance_m == pytest.approx(0.08)
    assert check.follow_ratio == pytest.approx(math.hypot(0.06, 0.02) / 0.08)
    assert check.direction_error_deg == pytest.approx(math.degrees(math.atan2(0.02, 0.06)))
    assert check.shortfall_m == pytest.approx(0.08 - math.hypot(0.06, 0.02))


def test_displacement_check_without_a_commanded_move_has_no_ratio():
    check = displacement_check((0.0, 0.0, 0.0), (0.001, 0.0, 0.0))
    assert check.follow_ratio is None
    assert check.direction_error_deg is None


def test_analyze_segment_reports_a_perfect_follow_as_unit_gain():
    samples = [_sample(index, 0.02, 0.02) for index in range(100)]
    metrics = analyze_segment(samples, period_sec=PERIOD)
    assert metrics is not None
    assert metrics.axis == "vx"
    assert metrics.steady_gain == pytest.approx(1.0)
    assert metrics.steady_bias == pytest.approx(0.0)
    assert metrics.rms_error == pytest.approx(0.0)
    assert metrics.measured_valid_fraction == pytest.approx(1.0)


def test_analyze_segment_exposes_a_gain_shortfall():
    samples = [_sample(index, 0.02, 0.016) for index in range(100)]
    metrics = analyze_segment(samples, period_sec=PERIOD)
    assert metrics.steady_gain == pytest.approx(0.8)
    assert metrics.steady_bias == pytest.approx(-0.004)
    assert metrics.normalized_rms_error == pytest.approx(0.2)


def test_analyze_segment_ignores_samples_recorded_outside_a_session():
    samples = [_sample(index, 0.02, 0.02, active=False) for index in range(100)]
    assert analyze_segment(samples, period_sec=PERIOD) is None
    assert analyze_segment([], period_sec=PERIOD) is None


def test_analyze_run_groups_consecutive_segments():
    samples = [_sample(index, 0.02, 0.02, segment="a") for index in range(50)]
    samples += [_sample(50 + index, 0.03, 0.03, segment="b") for index in range(50)]
    run = analyze_run(samples, period_sec=PERIOD)
    assert [segment.segment for segment in run.segments] == ["a", "b"]
    assert run.sample_count == 100
    assert run.session_active_fraction == pytest.approx(1.0)
    assert run.command_rate.mean_hz == pytest.approx(50.0)


def test_analyze_run_on_no_samples_is_empty_but_well_formed():
    run = analyze_run([], period_sec=PERIOD)
    assert run.segments == ()
    assert run.sample_count == 0
    assert run.measured_valid_fraction == 0.0


def test_a_settle_window_is_skipped_rather_than_failed():
    # A settle tail commands zero by design; reporting it as a segment the arm
    # failed to follow would bury the real results.
    samples = [_sample(index, 0.0, 0.001, segment="x-step|settle") for index in range(50)]
    assert analyze_segment(samples, period_sec=PERIOD) is None
    run = analyze_run(
        [_sample(index, 0.02, 0.02, segment="x-step") for index in range(50)] + samples,
        period_sec=PERIOD,
    )
    assert [segment.segment for segment in run.segments] == ["x-step"]


def test_a_one_sided_command_is_classified_as_dc_and_gets_a_steady_gain():
    metrics = analyze_segment(
        [_sample(index, 0.02, 0.017) for index in range(100)], period_sec=PERIOD
    )
    assert metrics.is_dc is True
    assert metrics.steady_gain == pytest.approx(0.85)
    assert metrics.rise_time_sec is not None


def test_a_zero_mean_command_gets_an_amplitude_gain_instead():
    samples = [
        _sample(
            index,
            0.02 * math.sin(2.0 * math.pi * 0.5 * index * PERIOD),
            0.017 * math.sin(2.0 * math.pi * 0.5 * index * PERIOD),
        )
        for index in range(400)
    ]
    metrics = analyze_segment(samples, period_sec=PERIOD)
    assert metrics.is_dc is False
    # A mean-based gain would divide by an average of zero and mean nothing.
    assert metrics.steady_gain is None
    assert metrics.rise_time_sec is None
    assert metrics.overshoot_fraction is None
    assert metrics.amplitude_gain == pytest.approx(0.85, abs=0.01)


def test_rise_time_and_overshoot_are_measured_against_the_speed_actually_reached():
    # A first-order rise to 85% of the command has no overshoot; measuring it
    # against the command would report a 15% undershoot that the gain already says.
    measured = [0.017 * (1.0 - math.exp(-index * PERIOD / 0.1)) for index in range(200)]
    samples = [_sample(index, 0.02, measured[index]) for index in range(200)]
    metrics = analyze_segment(samples, period_sec=PERIOD)
    assert metrics.overshoot_fraction == pytest.approx(0.0, abs=0.01)
    assert metrics.rise_time_sec == pytest.approx(0.23, abs=0.03)


def test_lag_against_the_limited_command_separates_the_acceleration_ramp():
    period = PERIOD
    delay = 5
    count = 400
    # A square command through the driver's acceleration limiter: the limited
    # signal keeps varying, so the correlation has real timing information, and
    # it is already behind the command before the arm adds any lag of its own.
    commanded = [
        0.02 if int(index * period / 1.0) % 2 == 0 else -0.02 for index in range(count)
    ]
    limited, value = [], 0.0
    for target in commanded:
        value += max(-0.10 * period, min(0.10 * period, target - value))
        limited.append(value)
    measured = [0.0] * delay + limited[: count - delay]
    samples = [
        Sample(
            t_sec=index * period,
            segment="s",
            commanded=(commanded[index], 0.0, 0.0, 0.0, 0.0, 0.0),
            limited=(limited[index], 0.0, 0.0, 0.0, 0.0, 0.0),
            measured=(measured[index], 0.0, 0.0, 0.0, 0.0, 0.0),
            measured_valid=True,
            session_active=True,
        )
        for index in range(count)
    ]
    metrics = analyze_segment(samples, period_sec=period)
    assert metrics.lag_vs_limited_sec == pytest.approx(delay * period)
    # The command itself is a square, so the arm also trails it, by more: the
    # acceleration ramp is part of what the operator waits for.
    assert metrics.lag_sec > metrics.lag_vs_limited_sec


def test_lag_estimation_on_a_constant_command_reports_nothing_rather_than_guessing():
    samples = [_sample(index, 0.02, 0.017) for index in range(200)]
    metrics = analyze_segment(samples, period_sec=PERIOD)
    # A constant command carries no timing information; the rise time is the
    # honest latency number for a step.
    assert metrics.lag_sec is None
    assert metrics.rise_time_sec is not None
