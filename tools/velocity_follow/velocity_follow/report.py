"""Render recorded runs as an operator-readable verdict and a machine summary.

``velocity_follow_report <run.csv>`` re-derives every number from the CSV, so a
run captured on the industrial host can be re-analysed anywhere without a ROS
installation.
"""

from __future__ import annotations

import argparse
from dataclasses import asdict
import json
from pathlib import Path
import sys
from typing import Sequence

from typing import Any

from .axes import AXIS_NAMES, is_angular
from .metrics import (
    EdgeResponse,
    RunMetrics,
    SegmentMetrics,
    analyze_run,
    press_release_responses,
)
from .samples import load_samples


# A run is called good only when the arm reaches most of the commanded speed,
# does so promptly, and does not wander onto axes nobody commanded. The values
# are deliberately loose: they separate "roughly following" from "not
# following", not one tuning from another.
GAIN_TOLERANCE = 0.20
LAG_BUDGET_SEC = 0.30
LEAKAGE_FRACTION = 0.20
# Transient budgets for keyboard use. The rise budget is charged only for time
# beyond what the driver's own acceleration ramp needed, so a conservative
# acceleration limit is not blamed on the arm. A coast of a few millimetres is
# invisible to an operator; one of a centimetre means the tool ends up visibly
# past where the key was released.
RISE_EXCESS_BUDGET_SEC = 0.30
COAST_BUDGET_M = 0.005


def _format_optional(value: float | None, unit: str, digits: int = 4) -> str:
    if value is None:
        return "n/a"
    return f"{value:.{digits}f} {unit}".strip()


def _axis_unit(axis: str) -> str:
    return "rad/s" if is_angular(axis) else "m/s"


def segment_verdict(metrics: SegmentMetrics, noise: Any = None) -> tuple[bool, tuple[str, ...]]:
    """Return whether a segment followed acceptably, plus the reasons it did not."""
    reasons: list[str] = []
    if metrics.measured_valid_fraction < 0.5:
        reasons.append(
            f"only {metrics.measured_valid_fraction:.0%} of samples carried a valid measurement"
        )
    # A step is judged on its settled speed; a square or sine has no settled
    # speed, so it is judged on how much of the commanded amplitude it reached.
    gain = metrics.steady_gain if metrics.is_dc else metrics.amplitude_gain
    label = "steady-state gain" if metrics.is_dc else "amplitude gain"
    if gain is None:
        reasons.append("no usable command amplitude to compare against")
    elif abs(gain - 1.0) > GAIN_TOLERANCE:
        reasons.append(f"{label} {gain:.2f} is off by more than {GAIN_TOLERANCE:.0%}")
    if metrics.lag_sec is not None and metrics.lag_sec > LAG_BUDGET_SEC:
        reasons.append(f"measured motion lags the command by {metrics.lag_sec * 1000:.0f} ms")
    # Compare leakage against the command's RMS so a zero-mean waveform is
    # checked on the same footing as a step.
    reference = metrics.commanded_rms
    if reference > 1.0e-9:
        for axis, value in metrics.cross_axis_leakage.items():
            if is_angular(axis) != is_angular(metrics.axis):
                # Comparing rad/s against m/s would be meaningless.
                continue
            if abs(value) <= LEAKAGE_FRACTION * reference:
                continue
            # Pose differencing has its own spread; drift smaller than the
            # measured noise floor is not evidence that the arm veered.
            if noise is not None and not noise.is_significant(AXIS_NAMES.index(axis), value):
                continue
            reasons.append(
                f"uncommanded motion on {axis} reached {value:+.4f} {_axis_unit(axis)}"
            )
    return (not reasons, tuple(reasons))


def format_segment(metrics: SegmentMetrics, noise: Any = None) -> str:
    """Render one segment block."""
    unit = _axis_unit(metrics.axis)
    passed, reasons = segment_verdict(metrics, noise)
    shape = "one-sided" if metrics.is_dc else "zero-mean"
    lines = [
        f"segment {metrics.segment!r} on {metrics.axis} ({shape}) "
        f"[{'FOLLOWS' if passed else 'DOES NOT FOLLOW'}]",
        f"  samples            : {metrics.sample_count} "
        f"({metrics.measured_valid_fraction:.0%} with a valid measurement)",
        f"  commanded          : mean {metrics.commanded_mean:+.5f}, "
        f"rms {metrics.commanded_rms:.5f} {unit}",
        f"  accepted mean      : {metrics.accepted_mean:+.5f} {unit} (driver-side view of the command)",
        f"  limited mean       : {metrics.limited_mean:+.5f} {unit} (after acceleration limiting)",
        f"  measured mean      : {metrics.measured_mean:+.5f} {unit}",
        f"  amplitude gain     : "
        + ("n/a" if metrics.amplitude_gain is None else f"{metrics.amplitude_gain:.3f}"),
    ]
    if metrics.is_dc:
        lines.append(
            "  steady-state gain  : "
            + ("n/a" if metrics.steady_gain is None else f"{metrics.steady_gain:.3f}")
        )
        lines.append(f"  steady-state bias  : {metrics.steady_bias:+.5f} {unit}")
    lines.extend(
        [
            f"  RMS error          : {metrics.rms_error:.5f} {unit}"
            + (
                ""
                if metrics.normalized_rms_error is None
                else f" ({metrics.normalized_rms_error:.1%} of the command)"
            ),
            f"  lag vs command     : {_format_optional(metrics.lag_sec, 's', 3)}",
            f"  lag vs limited cmd : {_format_optional(metrics.lag_vs_limited_sec, 's', 3)}"
            " (excludes the driver's acceleration ramp)",
        ]
    )
    if metrics.is_dc:
        lines.append(
            "  rise time to 90%   : "
            f"{_format_optional(metrics.rise_time_sec, 's', 3)} (of the speed actually reached)"
        )
    lines.append(
        f"  peak measured      : {metrics.peak_measured:+.5f} {unit}"
        + (
            ""
            if metrics.overshoot_fraction is None
            else f" (overshoot {metrics.overshoot_fraction:+.1%})"
        )
    )
    lines.append(f"  max command age    : {metrics.max_command_age_ms} ms")
    lines.append(
        f"  telemetry rate     : {metrics.telemetry.mean_hz:.1f} Hz "
        f"(jitter {metrics.telemetry.jitter_ms:.1f} ms)"
    )
    leakage = {
        axis: value
        for axis, value in metrics.cross_axis_leakage.items()
        if abs(value) > 1.0e-6
    }
    if leakage:
        rendered = ", ".join(
            f"{axis} {value:+.5f} {_axis_unit(axis)}" for axis, value in sorted(leakage.items())
        )
        lines.append(f"  uncommanded motion : {rendered}")
    for reason in reasons:
        lines.append(f"  ! {reason}")
    return "\n".join(lines)


def edge_verdict(edge: EdgeResponse) -> tuple[bool, tuple[str, ...]]:
    """Judge one press/release against the keyboard transient budgets."""
    reasons: list[str] = []
    linear = not is_angular(edge.axis)
    if edge.rise_time_sec is None:
        reasons.append(
            f"never reached 90% of the command in the {edge.held_sec:.2f} s the key was held"
        )
    else:
        floor = edge.limited_rise_time_sec or 0.0
        excess = edge.rise_time_sec - floor
        if excess > RISE_EXCESS_BUDGET_SEC:
            reasons.append(
                f"took {edge.rise_time_sec * 1000:.0f} ms to reach speed, "
                f"{excess * 1000:.0f} ms more than the acceleration ramp needed"
            )
    if linear and abs(edge.coast) > COAST_BUDGET_M:
        reasons.append(f"kept moving {abs(edge.coast) * 1000:.1f} mm after the key was released")
    return (not reasons, tuple(reasons))


def _edge_scale(axis: str) -> tuple[float, str, str]:
    """Display scale and units: mm for linear axes, mrad for angular ones."""
    return (1000.0, "mm/s", "mm") if not is_angular(axis) else (1000.0, "mrad/s", "mrad")


def format_edges(edges: Sequence[EdgeResponse]) -> str:
    """Render the press/release section a keyboard operator actually feels."""
    if not edges:
        return ""
    lines = [
        "key press / release response",
        "----------------------------",
        "  (a whole-run displacement can look perfect while the arm is slow at both",
        "   ends: distance lost while it builds speed is repaid by coasting after",
        "   release. These are the transients themselves.)",
    ]

    def ms(value: float | None) -> str:
        return "n/a" if value is None else f"{value * 1000:.0f} ms"

    shown = edges if len(edges) <= 8 else edges[:8]
    for edge in shown:
        scale, rate_unit, distance_unit = _edge_scale(edge.axis)
        passed, reasons = edge_verdict(edge)
        lines.append("")
        lines.append(
            f"  {edge.axis} {edge.command * scale:+.1f} {rate_unit}, held {edge.held_sec:.2f} s "
            f"at t={edge.press_t_sec:.2f} s [{'CRISP' if passed else 'SLOW'}]"
        )
        lines.append(f"    press -> first motion   : {ms(edge.start_latency_sec)}")
        lines.append(
            f"    press -> 90% of command : {ms(edge.rise_time_sec)} "
            f"(acceleration ramp alone: {ms(edge.limited_rise_time_sec)})"
        )
        lines.append(
            f"    travelled while held    : {edge.held_travel * scale:.1f} of "
            f"{edge.held_commanded * scale:.1f} {distance_unit} "
            f"({edge.behind_at_release * scale:.1f} {distance_unit} behind at release)"
        )
        lines.append(f"    release -> stopped      : {ms(edge.stop_time_sec)}")
        lines.append(
            f"    coast after release     : {edge.coast * scale:.1f} {distance_unit}"
        )
        for reason in reasons:
            lines.append(f"    ! {reason}")
    if len(edges) > len(shown):
        lines.append(f"\n  ... {len(edges) - len(shown)} more presses in the JSON summary")

    if len(edges) > 1:
        def median(values):
            ordered = sorted(values)
            middle = len(ordered) // 2
            if not ordered:
                return None
            return ordered[middle] if len(ordered) % 2 else 0.5 * (ordered[middle - 1] + ordered[middle])

        linear = [edge for edge in edges if not is_angular(edge.axis)]
        rises = [edge.rise_time_sec for edge in edges if edge.rise_time_sec is not None]
        stops = [edge.stop_time_sec for edge in edges if edge.stop_time_sec is not None]
        lines.append("")
        lines.append(f"  over {len(edges)} presses (median):")
        lines.append(f"    press -> 90% of command : {ms(median(rises))}")
        lines.append(f"    release -> stopped      : {ms(median(stops))}")
        if linear:
            coast = median([abs(edge.coast) for edge in linear])
            lines.append(f"    coast after release     : {coast * 1000:.1f} mm")
        never = sum(1 for edge in edges if edge.rise_time_sec is None)
        if never:
            lines.append(
                f"    {never} of {len(edges)} presses ended before the arm reached speed"
            )
    crisp = sum(1 for edge in edges if edge_verdict(edge)[0])
    lines.append("")
    lines.append(f"  transient verdict: {crisp}/{len(edges)} presses were crisp")
    return "\n".join(lines)


def format_run(
    metrics: RunMetrics,
    *,
    period_sec: float,
    title: str = "",
    noise: Any = None,
    edges: Sequence[EdgeResponse] = (),
) -> str:
    """Render the whole run, stream health first, then each segment."""
    header = title or "Cartesian velocity following report"
    lines = [
        header,
        "=" * len(header),
        f"samples              : {metrics.sample_count}",
        f"command publish rate : {metrics.command_rate.mean_hz:.1f} Hz "
        f"(target {1.0 / period_sec:.1f} Hz, jitter {metrics.command_rate.jitter_ms:.1f} ms, "
        f"worst gap {metrics.command_rate.max_period_ms:.1f} ms)",
        f"telemetry rate       : {metrics.telemetry_rate.mean_hz:.1f} Hz "
        f"(jitter {metrics.telemetry_rate.jitter_ms:.1f} ms)",
        f"session active       : {metrics.session_active_fraction:.0%} of samples",
        f"valid measurement    : {metrics.measured_valid_fraction:.0%} of samples",
    ]
    if noise is not None:
        lines.append(
            f"measurement noise    : {noise.linear_stdev_mps * 1000:.2f} mm/s and "
            f"{noise.angular_stdev_radps * 1000:.2f} mrad/s (1 sigma, {noise.samples} "
            "samples of the arm standing still)"
        )
        lines.append(
            "                       pose differencing turns encoder quantisation into "
            "apparent velocity. It is\n                       zero-mean, so gain, bias "
            "and the displacement check are unaffected; only a\n                       "
            "single-sample reading and a small cross-axis drift are limited by it."
        )
    telemetry_hz = metrics.telemetry_rate.mean_hz
    if 0.0 < telemetry_hz < 0.5 * metrics.command_rate.mean_hz:
        lines.append(
            f"note: timing is resolved no finer than the telemetry period "
            f"({1000.0 / telemetry_hz:.0f} ms at {telemetry_hz:.1f} Hz), so lag, rise "
            "time and overshoot are quantised by the measurement rather than by the "
            "arm. Raise state_publish_rate in config/ros/realman_driver.yaml when "
            "those numbers matter; gain and the displacement check are unaffected."
        )
    if not metrics.segments:
        lines.append("")
        lines.append("no segment carried an active session; nothing to measure")
        return "\n".join(lines)
    for segment in metrics.segments:
        lines.append("")
        lines.append(format_segment(segment, noise))
    passed = sum(1 for segment in metrics.segments if segment_verdict(segment, noise)[0])
    lines.append("")
    lines.append(
        f"verdict: {passed}/{len(metrics.segments)} segments followed the command "
        "(steady-state speed)"
    )
    if edges:
        lines.append("")
        lines.append(format_edges(edges))
    return "\n".join(lines)


def run_summary(
    metrics: RunMetrics, noise: Any = None, edges: Sequence[EdgeResponse] = ()
) -> dict[str, object]:
    """Build the JSON-serialisable summary written next to the CSV."""
    segments = []
    for segment in metrics.segments:
        passed, reasons = segment_verdict(segment, noise)
        entry = asdict(segment)
        entry["follows"] = passed
        entry["reasons"] = list(reasons)
        segments.append(entry)
    return {
        "sample_count": metrics.sample_count,
        "command_rate": asdict(metrics.command_rate),
        "telemetry_rate": asdict(metrics.telemetry_rate),
        "session_active_fraction": metrics.session_active_fraction,
        "measured_valid_fraction": metrics.measured_valid_fraction,
        "segments": segments,
        "segments_following": sum(1 for segment in segments if segment["follows"]),
        "press_release": [
            {
                **asdict(edge),
                "behind_at_release": edge.behind_at_release,
                "crisp": edge_verdict(edge)[0],
                "reasons": list(edge_verdict(edge)[1]),
            }
            for edge in edges
        ],
        "presses_crisp": sum(1 for edge in edges if edge_verdict(edge)[0]),
        "measurement_noise": (
            None
            if noise is None
            else {
                "samples": noise.samples,
                "duration_sec": noise.duration_sec,
                "mean": list(noise.mean),
                "stdev": list(noise.stdev),
            }
        ),
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="velocity_follow_report",
        description="Analyse a recorded Cartesian velocity following run.",
    )
    parser.add_argument("csv", type=Path, help="Run CSV written by velocity_follow_test_node.")
    parser.add_argument(
        "--control-period-ms",
        type=float,
        default=20.0,
        help="Control period the run was published at; sets the lag resolution.",
    )
    parser.add_argument(
        "--steady-fraction",
        type=float,
        default=0.5,
        help="Trailing fraction of each segment used as the steady-state window.",
    )
    parser.add_argument(
        "--max-lag-sec",
        type=float,
        default=1.0,
        help="Largest delay the cross-correlation search considers.",
    )
    parser.add_argument(
        "--json",
        type=Path,
        default=None,
        help="Also write the machine-readable summary to this path.",
    )
    arguments = parser.parse_args(argv)

    if arguments.control_period_ms <= 0.0:
        parser.error("--control-period-ms must be positive")
    if not arguments.csv.is_file():
        parser.error(f"{arguments.csv} is not a readable file")

    period_sec = arguments.control_period_ms / 1000.0
    samples = load_samples(arguments.csv)
    metrics = analyze_run(
        samples,
        period_sec=period_sec,
        steady_fraction=arguments.steady_fraction,
        max_lag_sec=arguments.max_lag_sec,
    )
    edges = press_release_responses(samples)
    print(
        format_run(
            metrics,
            period_sec=period_sec,
            title=f"Run report: {arguments.csv.name}",
            edges=edges,
        )
    )
    if arguments.json is not None:
        arguments.json.parent.mkdir(parents=True, exist_ok=True)
        arguments.json.write_text(
            json.dumps(run_summary(metrics, edges=edges), indent=2, sort_keys=True),
            encoding="utf-8",
        )
        print(f"\nsummary written to {arguments.json}")
    if not metrics.segments:
        return 2
    steady = all(segment_verdict(segment)[0] for segment in metrics.segments)
    transient = all(edge_verdict(edge)[0] for edge in edges)
    return 0 if steady and transient else 1


if __name__ == "__main__":
    sys.exit(main())
