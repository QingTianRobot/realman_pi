"""Unit tests for velocity_follow.report."""

from __future__ import annotations

import json

import pytest

from velocity_follow.metrics import analyze_run
from velocity_follow.report import (
    format_run,
    format_segment,
    main,
    run_summary,
    segment_verdict,
)
from velocity_follow.samples import CsvRecorder, Sample


PERIOD = 0.02


def _samples(measured_gain=1.0, leak=0.0, count=200, segment="x-step"):
    return [
        Sample(
            t_sec=index * PERIOD,
            segment=segment,
            segment_elapsed_sec=index * PERIOD,
            commanded=(0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            accepted=(0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            limited=(0.02, 0.0, 0.0, 0.0, 0.0, 0.0),
            measured=(0.02 * measured_gain, leak, 0.0, 0.0, 0.0, 0.0),
            measured_valid=True,
            session_active=True,
            telemetry_age_sec=0.0,
        )
        for index in range(count)
    ]


def _metrics(**overrides):
    return analyze_run(_samples(**overrides), period_sec=PERIOD)


def test_a_faithful_run_passes_its_verdict():
    segment = _metrics().segments[0]
    passed, reasons = segment_verdict(segment)
    assert passed
    assert reasons == ()


def test_a_gain_shortfall_fails_with_a_named_reason():
    segment = _metrics(measured_gain=0.5).segments[0]
    passed, reasons = segment_verdict(segment)
    assert not passed
    assert any("steady-state gain" in reason for reason in reasons)


def test_uncommanded_motion_on_another_axis_fails_the_verdict():
    segment = _metrics(leak=0.01).segments[0]
    passed, reasons = segment_verdict(segment)
    assert not passed
    assert any("uncommanded motion on vy" in reason for reason in reasons)


def test_a_mostly_invalid_measurement_fails_the_verdict():
    samples = _samples()
    for index, sample in enumerate(samples):
        if index % 4:
            samples[index] = Sample(
                **{
                    **{
                        field: getattr(sample, field)
                        for field in (
                            "t_sec",
                            "segment",
                            "segment_elapsed_sec",
                            "commanded",
                            "accepted",
                            "limited",
                            "measured",
                            "session_active",
                            "command_age_ms",
                            "measured_age_ms",
                            "telemetry_age_sec",
                        )
                    },
                    "measured_valid": False,
                }
            )
    segment = analyze_run(samples, period_sec=PERIOD).segments[0]
    passed, reasons = segment_verdict(segment)
    assert not passed
    assert any("valid measurement" in reason for reason in reasons)


def test_format_segment_names_the_axis_and_its_unit():
    text = format_segment(_metrics().segments[0])
    assert "x-step" in text
    assert "m/s" in text
    assert "FOLLOWS" in text


def test_format_run_reports_rates_and_a_verdict_line():
    text = format_run(_metrics(), period_sec=PERIOD)
    assert "command publish rate" in text
    assert "verdict: 1/1 segments followed the command" in text


def test_format_run_warns_when_telemetry_is_too_slow_to_judge_lag():
    samples = _samples(count=200)
    slowed = [
        Sample(
            **{
                **{
                    field: getattr(sample, field)
                    for field in (
                        "t_sec",
                        "segment",
                        "segment_elapsed_sec",
                        "commanded",
                        "accepted",
                        "limited",
                        "measured",
                        "measured_valid",
                        "session_active",
                        "command_age_ms",
                        "measured_age_ms",
                    )
                },
                # Five control periods share one telemetry sample: 10 Hz against
                # a 50 Hz command stream.
                "telemetry_age_sec": (index % 5) * PERIOD,
            }
        )
        for index, sample in enumerate(samples)
    ]
    text = format_run(analyze_run(slowed, period_sec=PERIOD), period_sec=PERIOD)
    assert "state_publish_rate" in text


def test_format_run_on_an_empty_run_says_so():
    text = format_run(analyze_run([], period_sec=PERIOD), period_sec=PERIOD)
    assert "nothing to measure" in text


def test_run_summary_is_json_serialisable_and_carries_the_verdict():
    summary = run_summary(_metrics(measured_gain=0.5))
    encoded = json.loads(json.dumps(summary))
    assert encoded["segments_following"] == 0
    assert encoded["segments"][0]["follows"] is False
    assert encoded["segments"][0]["reasons"]


def test_cli_analyses_a_recorded_file_and_reports_its_exit_code(tmp_path, capsys):
    path = tmp_path / "run.csv"
    with CsvRecorder(path) as recorder:
        for sample in _samples():
            recorder.write(sample)
    summary_path = tmp_path / "run.json"
    assert main([str(path), "--control-period-ms", "20", "--json", str(summary_path)]) == 0
    assert "verdict:" in capsys.readouterr().out
    assert json.loads(summary_path.read_text())["segments_following"] == 1

    bad = tmp_path / "bad.csv"
    with CsvRecorder(bad) as recorder:
        for sample in _samples(measured_gain=0.4):
            recorder.write(sample)
    assert main([str(bad)]) == 1


def test_cli_rejects_a_missing_file_and_a_non_positive_period(tmp_path):
    with pytest.raises(SystemExit):
        main([str(tmp_path / "absent.csv")])
    path = tmp_path / "run.csv"
    with CsvRecorder(path) as recorder:
        recorder.write(_samples(count=1)[0])
    with pytest.raises(SystemExit):
        main([str(path), "--control-period-ms", "0"])


def _zero_mean_metrics(gain=1.0, count=400):
    import math

    samples = [
        Sample(
            t_sec=index * PERIOD,
            segment="x-sine",
            segment_elapsed_sec=index * PERIOD,
            commanded=(0.02 * math.sin(2.0 * math.pi * 0.5 * index * PERIOD), 0, 0, 0, 0, 0),
            accepted=(0.02 * math.sin(2.0 * math.pi * 0.5 * index * PERIOD), 0, 0, 0, 0, 0),
            limited=(0.02 * math.sin(2.0 * math.pi * 0.5 * index * PERIOD), 0, 0, 0, 0, 0),
            measured=(
                0.02 * gain * math.sin(2.0 * math.pi * 0.5 * index * PERIOD),
                0,
                0,
                0,
                0,
                0,
            ),
            measured_valid=True,
            session_active=True,
        )
        for index in range(count)
    ]
    return analyze_run(samples, period_sec=PERIOD).segments[0]


def test_a_zero_mean_segment_is_judged_on_its_amplitude_gain():
    passed, reasons = segment_verdict(_zero_mean_metrics(gain=1.0))
    assert passed and reasons == ()
    passed, reasons = segment_verdict(_zero_mean_metrics(gain=0.5))
    assert not passed
    assert any("amplitude gain" in reason for reason in reasons)


def test_a_zero_mean_segment_omits_steady_state_and_rise_time_lines():
    text = format_segment(_zero_mean_metrics())
    assert "zero-mean" in text
    assert "steady-state gain" not in text
    assert "rise time" not in text
    assert "amplitude gain" in text


def test_a_one_sided_segment_reports_its_steady_state_and_rise_time():
    text = format_segment(_metrics().segments[0])
    assert "one-sided" in text
    assert "steady-state gain" in text
    assert "rise time to 90%" in text
    assert "lag vs limited cmd" in text


def _noise_floor(stdev_mps):
    from velocity_follow.runner import NoiseFloor

    return NoiseFloor(
        samples=200, mean=(0.0,) * 6, stdev=(stdev_mps,) * 6, duration_sec=1.0
    )


def test_drift_below_the_measurement_noise_is_not_called_a_veer():
    # 5 mm/s of apparent vy on a 20 mm/s command clears the 20% threshold, so
    # without a noise floor it is reported as the arm veering. With a 2 mm/s
    # floor it sits inside three sigma and is not evidence of anything.
    segment = _metrics(leak=0.005).segments[0]
    assert segment_verdict(segment)[0] is False
    assert segment_verdict(segment, _noise_floor(0.002))[0] is True


def test_drift_well_above_the_noise_floor_is_still_reported():
    segment = _metrics(leak=0.01).segments[0]
    passed, reasons = segment_verdict(segment, _noise_floor(0.001))
    assert not passed
    assert any("uncommanded motion on vy" in reason for reason in reasons)


def test_the_report_states_the_measurement_noise_and_what_it_does_not_affect():
    text = format_run(_metrics(), period_sec=PERIOD, noise=_noise_floor(0.0015))
    assert "measurement noise" in text
    assert "1.50 mm/s" in text
    # The reader must not conclude that every number is suspect.
    assert "zero-mean" in text
    assert "displacement check are unaffected" in text


def test_the_summary_carries_the_noise_floor_for_later_comparison():
    summary = run_summary(_metrics(), _noise_floor(0.0012))
    encoded = json.loads(json.dumps(summary))
    assert encoded["measurement_noise"]["samples"] == 200
    assert encoded["measurement_noise"]["stdev"][0] == pytest.approx(0.0012)
    assert run_summary(_metrics())["measurement_noise"] is None
