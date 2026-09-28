"""Unit tests for velocity_follow.limits."""

from __future__ import annotations

import math

import pytest

from velocity_follow.limits import clip_speed, limit_vector_delta, shape_command


def test_clip_speed_leaves_a_vector_inside_the_limits_alone():
    vector = (0.01, 0.0, 0.0, 0.0, 0.0, 0.1)
    assert clip_speed(vector, 0.05, 0.25) == pytest.approx(vector)


def test_clip_speed_scales_the_whole_linear_vector_preserving_direction():
    # Clamping components independently would rotate the commanded direction.
    clipped = clip_speed((0.06, 0.08, 0.0, 0.0, 0.0, 0.0), 0.05, 0.25)
    assert math.hypot(*clipped[:3]) == pytest.approx(0.05)
    assert clipped[0] / clipped[1] == pytest.approx(0.06 / 0.08)


def test_clip_speed_scales_linear_and_angular_parts_independently():
    clipped = clip_speed((0.10, 0.0, 0.0, 0.0, 0.0, 0.50), 0.05, 0.25)
    assert clipped[0] == pytest.approx(0.05)
    assert clipped[5] == pytest.approx(0.25)


def test_clip_speed_handles_a_zero_vector():
    assert clip_speed((0.0,) * 6, 0.05, 0.25) == (0.0,) * 6


def test_limit_vector_delta_allows_a_small_change_through():
    assert limit_vector_delta((0.0, 0.0, 0.0), (0.001, 0.0, 0.0), 0.10, 0.01) == pytest.approx(
        (0.001, 0.0, 0.0)
    )


def test_limit_vector_delta_caps_a_large_change_at_acceleration_times_dt():
    limited = limit_vector_delta((0.0, 0.0, 0.0), (0.02, 0.0, 0.0), 0.10, 0.01)
    assert limited[0] == pytest.approx(0.001)


def test_limit_vector_delta_preserves_the_direction_of_the_change():
    limited = limit_vector_delta((0.0, 0.0, 0.0), (0.03, 0.04, 0.0), 0.10, 0.01)
    assert math.hypot(*limited) == pytest.approx(0.001)
    assert limited[0] / limited[1] == pytest.approx(0.03 / 0.04)


@pytest.mark.parametrize(
    "args",
    [
        ((0.0, 0.0), (0.0, 0.0, 0.0), 0.1, 0.01),
        ((float("nan"), 0.0, 0.0), (0.0, 0.0, 0.0), 0.1, 0.01),
        ((0.0, 0.0, 0.0), (0.0, 0.0, 0.0), -1.0, 0.01),
        ((0.0, 0.0, 0.0), (0.0, 0.0, 0.0), 0.1, -0.01),
    ],
)
def test_limit_vector_delta_rejects_malformed_input(args):
    with pytest.raises(ValueError):
        limit_vector_delta(*args)


def test_shape_command_reports_the_clip_and_the_ramp_separately():
    clipped, limited = shape_command(
        (0.0,) * 6,
        (0.20, 0.0, 0.0, 0.0, 0.0, 0.0),
        max_linear_speed_mps=0.05,
        max_angular_speed_radps=0.25,
        max_linear_accel_mps2=0.10,
        max_angular_accel_radps2=0.50,
        dt=0.01,
    )
    # The request was truncated by the speed ceiling, and what may be sent this
    # tick is further held back by the acceleration limit. Recording both is
    # what separates "the limit truncated me" from "the arm did not follow".
    assert clipped[0] == pytest.approx(0.05)
    assert limited[0] == pytest.approx(0.001)


def test_shape_command_converges_to_the_clipped_target_over_successive_ticks():
    limited = (0.0,) * 6
    for _ in range(300):
        _clipped, limited = shape_command(
            limited,
            (0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            max_linear_speed_mps=0.05,
            max_angular_speed_radps=0.25,
            max_linear_accel_mps2=0.10,
            max_angular_accel_radps2=0.50,
            dt=0.01,
        )
    assert limited[0] == pytest.approx(0.02)


def test_a_0_02_step_under_a_0_10_limit_needs_0_2_seconds():
    # This is the physical floor on rise time; a report that shows less is
    # measuring something other than the arm.
    limited = (0.0,) * 6
    ticks = 0
    while limited[0] < 0.02 - 1.0e-9 and ticks < 1000:
        _clipped, limited = shape_command(
            limited,
            (0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            max_linear_speed_mps=0.05,
            max_angular_speed_radps=0.25,
            max_linear_accel_mps2=0.10,
            max_angular_accel_radps2=0.50,
            dt=0.01,
        )
        ticks += 1
    assert ticks * 0.01 == pytest.approx(0.2, abs=0.011)
