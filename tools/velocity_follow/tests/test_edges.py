"""Press/release transient metrics: what a keyboard operator actually feels."""

from __future__ import annotations

import math

import pytest

from velocity_follow.metrics import (
    DEFAULT_MOTION_THRESHOLD_MPS,
    press_release_responses,
)
from velocity_follow.report import (
    COAST_BUDGET_M,
    edge_verdict,
    format_edges,
    format_run,
    run_summary,
)
from velocity_follow.metrics import analyze_run
from velocity_follow.samples import Sample


DT = 0.02


def _axis_vector(axis_index, value):
    vector = [0.0] * 6
    vector[axis_index] = value
    return tuple(vector)


def _simulate(command, *, dead_steps=8, tau_sec=0.25, gain=1.0, accel=0.10, axis=0):
    """A first-order arm with dead time behind an acceleration-limited command.

    Defaults approximate the real RM65 step measured in low-follow mode:
    ~160 ms before it moves and about a second to reach speed.
    """
    samples = []
    limited = 0.0
    measured = 0.0
    history = []
    for index, value in enumerate(command):
        step = max(-accel * DT, min(accel * DT, value - limited))
        limited += step
        history.append(limited)
        # Nothing reaches the arm until the dead time has elapsed.
        target = gain * history[index - dead_steps] if index >= dead_steps else 0.0
        measured += (target - measured) * (DT / tau_sec)
        samples.append(
            Sample(
                t_sec=index * DT,
                segment="keyboard",
                commanded=_axis_vector(axis, value),
                accepted=_axis_vector(axis, value),
                limited=_axis_vector(axis, limited),
                measured=_axis_vector(axis, measured),
                measured_valid=True,
                session_active=True,
            )
        )
    return samples


def _hold(level, held_sec, rest_sec=3.0, lead_sec=0.0):
    return (
        [0.0] * int(round(lead_sec / DT))
        + [level] * int(round(held_sec / DT))
        + [0.0] * int(round(rest_sec / DT))
    )


def test_a_single_press_is_found_and_measured():
    edges = press_release_responses(_simulate(_hold(0.02, 4.0)))
    assert len(edges) == 1
    edge = edges[0]
    assert edge.axis == "vx"
    assert edge.command == pytest.approx(0.02)
    assert edge.held_sec == pytest.approx(4.0, abs=DT)
    # Dead time is 8 steps; the threshold is crossed a little after that.
    assert 0.15 <= edge.start_latency_sec <= 0.30
    # The ramp itself reaches 90% at 0.18 s; the arm takes much longer.
    assert edge.limited_rise_time_sec == pytest.approx(0.18, abs=DT)
    assert edge.rise_time_sec > 0.6
    # Slow at the start, so behind at release, and then it coasts.
    assert edge.behind_at_release > 0.005
    assert edge.coast > 0.004
    assert edge.stop_time_sec is not None and edge.stop_time_sec > 0.5


def test_start_shortfall_and_coast_nearly_cancel_over_the_whole_press():
    # The reason this metric exists: a whole-run displacement check reports a
    # near-perfect follow for an arm that is slow at both ends.
    edge = press_release_responses(_simulate(_hold(0.02, 4.0)))[0]
    total = edge.held_travel + edge.coast
    assert total == pytest.approx(edge.held_commanded, rel=0.05)
    assert edge.behind_at_release == pytest.approx(edge.coast, rel=0.25)


def test_a_crisp_arm_passes_and_a_slow_one_does_not():
    crisp = press_release_responses(
        _simulate(_hold(0.02, 2.0), dead_steps=1, tau_sec=0.02, accel=10.0)
    )[0]
    slow = press_release_responses(_simulate(_hold(0.02, 4.0)))[0]
    assert edge_verdict(crisp) == (True, ())
    passed, reasons = edge_verdict(slow)
    assert not passed
    assert any("to reach speed" in reason for reason in reasons)
    assert any("after the key was released" in reason for reason in reasons)


def test_a_tap_shorter_than_the_rise_never_reaches_speed():
    edge = press_release_responses(_simulate(_hold(0.02, 0.3)))[0]
    assert edge.rise_time_sec is None
    passed, reasons = edge_verdict(edge)
    assert not passed
    assert any("never reached 90%" in reason for reason in reasons)


def test_every_press_of_a_keyboard_session_is_measured_in_order():
    command = _hold(0.02, 1.5, rest_sec=2.5) + _hold(-0.02, 1.5, rest_sec=2.5)
    edges = press_release_responses(_simulate(command))
    assert [round(edge.command, 3) for edge in edges] == [0.02, -0.02]
    assert edges[0].press_t_sec < edges[1].press_t_sec
    # Direction is folded in: a negative press still reports positive travel.
    assert edges[1].held_travel > 0.0
    assert edges[1].coast > 0.0


def test_a_direct_reversal_is_two_presses_not_one():
    command = [0.02] * 100 + [-0.02] * 100 + [0.0] * 150
    edges = press_release_responses(_simulate(command))
    assert [edge.command > 0 for edge in edges] == [True, False]
    # The first press never saw a zero command, so it cannot claim a stop.
    assert edges[0].stop_time_sec is None


def test_a_run_that_ends_with_the_key_down_has_no_release():
    edge = press_release_responses(_simulate([0.0] * 5 + [0.02] * 100))[0]
    assert edge.stop_time_sec is None
    assert edge.coast == 0.0


def test_a_press_before_the_arm_stops_leaves_the_stop_time_unknown():
    command = _hold(0.02, 1.5, rest_sec=0.2) + _hold(0.02, 1.5, rest_sec=3.0)
    first = press_release_responses(_simulate(command))[0]
    # The gap was too short for the arm to settle; it must not invent a stop.
    assert first.stop_time_sec is None
    assert first.coast > 0.0


def test_angular_axes_are_measured_in_their_own_units():
    edges = press_release_responses(_simulate(_hold(0.10, 3.0), axis=5, accel=0.5))
    assert edges[0].axis == "wz"
    text = format_edges(edges)
    assert "mrad/s" in text
    # A millimetre coast budget has no meaning for a rotation.
    assert not any("mm after" in reason for reason in edge_verdict(edges[0])[1])


def test_samples_outside_a_session_are_ignored():
    samples = _simulate(_hold(0.02, 1.0))
    idle = [
        Sample(**{**{f: getattr(s, f) for f in s.__dataclass_fields__}, "session_active": False})
        for s in samples
    ]
    assert press_release_responses(idle) == ()


def test_a_measured_noise_floor_raises_the_motion_threshold():
    from velocity_follow.runner import NoiseFloor

    samples = _simulate(_hold(0.02, 3.0))
    quiet = press_release_responses(samples)[0]
    noisy = press_release_responses(
        samples,
        noise=NoiseFloor(samples=100, mean=(0.0,) * 6, stdev=(0.001,) * 6, duration_sec=1.0),
    )[0]
    # A 3 mm/s threshold is crossed later than the 0.5 mm/s default.
    assert noisy.start_latency_sec > quiet.start_latency_sec
    assert DEFAULT_MOTION_THRESHOLD_MPS == pytest.approx(0.0005)


def test_the_report_puts_transients_after_the_steady_state_verdict():
    samples = _simulate(_hold(0.02, 4.0))
    edges = press_release_responses(samples)
    text = format_run(analyze_run(samples, period_sec=DT), period_sec=DT, edges=edges)
    assert text.index("(steady-state speed)") < text.index("key press / release response")
    assert "transient verdict: 0/1 presses were crisp" in text
    assert "coast after release" in text


def test_the_report_summarises_many_presses_with_medians():
    command = []
    for _ in range(3):
        command += _hold(0.02, 1.5, rest_sec=2.5)
    text = format_edges(press_release_responses(_simulate(command)))
    assert "over 3 presses (median)" in text


def test_the_summary_records_each_press_and_its_verdict():
    import json

    samples = _simulate(_hold(0.02, 4.0))
    edges = press_release_responses(samples)
    summary = json.loads(json.dumps(run_summary(analyze_run(samples, period_sec=DT), edges=edges)))
    assert summary["presses_crisp"] == 0
    entry = summary["press_release"][0]
    assert entry["axis"] == "vx"
    assert entry["crisp"] is False
    assert entry["coast"] > COAST_BUDGET_M
