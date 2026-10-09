"""Pure analysis of a recorded run: is the arm actually following the command?

Every function here takes plain sequences so the numbers can be reproduced from
a CSV without a ROS graph, and so each answer to "does it keep up" is separately
testable:

* gain and bias answer "is the speed right";
* lag and rise time answer "is it late";
* cross-axis leakage answers "is it going the right way";
* the displacement check answers "did the tool end up where the integral of the
  command says it should", independently of the telemetry sample rate.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Sequence

from .axes import AXIS_NAMES, axis_index
from .samples import Sample, group_by_segment


def _finite(values: Sequence[float]) -> list[float]:
    return [float(value) for value in values if math.isfinite(float(value))]


def mean(values: Sequence[float]) -> float:
    numbers = _finite(values)
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)


def rms(values: Sequence[float]) -> float:
    numbers = _finite(values)
    if not numbers:
        return 0.0
    return math.sqrt(sum(value * value for value in numbers) / len(numbers))


def rms_error(reference: Sequence[float], response: Sequence[float]) -> float:
    count = min(len(reference), len(response))
    if count == 0:
        return 0.0
    return rms([float(response[i]) - float(reference[i]) for i in range(count)])


def series(samples: Sequence[Sample], attribute: str, axis: str) -> list[float]:
    """Extract one axis of one vector field across a sample window."""
    index = axis_index(axis)
    return [float(getattr(sample, attribute)[index]) for sample in samples]


def dominant_axis(samples: Sequence[Sample], attribute: str = "commanded") -> str:
    """Return the axis the segment actually excited, by commanded RMS."""
    best_axis = AXIS_NAMES[0]
    best_value = -1.0
    for axis in AXIS_NAMES:
        value = rms(series(samples, attribute, axis))
        if value > best_value:
            best_axis, best_value = axis, value
    return best_axis


@dataclass(frozen=True)
class RateStats:
    """Timing regularity of a stream, in hertz and milliseconds."""

    count: int
    mean_hz: float
    min_period_ms: float
    max_period_ms: float
    jitter_ms: float


def rate_stats(times_sec: Sequence[float]) -> RateStats:
    """Summarise how regular a timestamp series is."""
    ordered = _finite(times_sec)
    if len(ordered) < 2:
        return RateStats(len(ordered), 0.0, 0.0, 0.0, 0.0)
    periods = [
        (ordered[index] - ordered[index - 1]) * 1000.0
        for index in range(1, len(ordered))
        if ordered[index] > ordered[index - 1]
    ]
    if not periods:
        return RateStats(len(ordered), 0.0, 0.0, 0.0, 0.0)
    average = mean(periods)
    deviation = math.sqrt(mean([(value - average) ** 2 for value in periods]))
    return RateStats(
        count=len(ordered),
        mean_hz=1000.0 / average if average > 0.0 else 0.0,
        min_period_ms=min(periods),
        max_period_ms=max(periods),
        jitter_ms=deviation,
    )


def estimate_lag_sec(
    reference: Sequence[float],
    response: Sequence[float],
    period_sec: float,
    *,
    max_lag_sec: float = 1.0,
) -> float | None:
    """Delay of ``response`` behind ``reference`` by normalised cross-correlation.

    Returns None when the reference barely varies, because a constant command
    carries no timing information; use :func:`rise_time_sec` on a step instead.
    """
    count = min(len(reference), len(response))
    if count < 4 or period_sec <= 0.0:
        return None
    reference_window = [float(value) for value in reference[:count]]
    response_window = [float(value) for value in response[:count]]
    reference_mean = mean(reference_window)
    response_mean = mean(response_window)
    centered_reference = [value - reference_mean for value in reference_window]
    centered_response = [value - response_mean for value in response_window]
    reference_energy = math.sqrt(sum(value * value for value in centered_reference))
    response_energy = math.sqrt(sum(value * value for value in centered_response))
    if reference_energy <= 1.0e-12 or response_energy <= 1.0e-12:
        return None

    max_shift = min(count - 4, int(round(max_lag_sec / period_sec)))
    if max_shift < 1:
        return None
    best_shift = 0
    best_score = -math.inf
    for shift in range(0, max_shift + 1):
        overlap = count - shift
        # Normalise per shift so a shorter overlap is not automatically better.
        left = centered_reference[:overlap]
        right = centered_response[shift:]
        left_energy = math.sqrt(sum(value * value for value in left))
        right_energy = math.sqrt(sum(value * value for value in right))
        if left_energy <= 1.0e-12 or right_energy <= 1.0e-12:
            continue
        score = sum(a * b for a, b in zip(left, right)) / (left_energy * right_energy)
        if score > best_score:
            best_shift, best_score = shift, score
    if best_score <= 0.0:
        return None
    return best_shift * period_sec


def rise_time_sec(
    times_sec: Sequence[float],
    response: Sequence[float],
    target: float,
    *,
    fraction: float = 0.9,
) -> float | None:
    """Seconds from the window start until the response first reaches ``fraction``.

    This is the honest latency number for a step command, and it also exposes
    the driver's acceleration limit: a 0.02 m/s step under a 0.10 m/s^2 limit
    cannot physically rise in less than 0.2 s.
    """
    count = min(len(times_sec), len(response))
    if count == 0 or target == 0.0 or not math.isfinite(target):
        return None
    threshold = fraction * target
    start = float(times_sec[0])
    for index in range(count):
        value = float(response[index])
        reached = value >= threshold if target > 0.0 else value <= threshold
        if reached:
            return float(times_sec[index]) - start
    return None


def cross_axis_leakage(samples: Sequence[Sample], commanded_axis: str) -> dict[str, float]:
    """Mean measured speed on every axis the command left at zero.

    A non-zero entry is a real direction offset: the tool is drifting on an axis
    nobody asked for, which is what an operator perceives as the arm "veering".
    """
    leakage: dict[str, float] = {}
    for axis in AXIS_NAMES:
        if axis == commanded_axis:
            continue
        leakage[axis] = mean(series(samples, "measured", axis))
    return leakage


def angle_between_deg(left: Sequence[float], right: Sequence[float]) -> float | None:
    """Angle between two 3-vectors, or None when either is effectively zero."""
    if len(left) < 3 or len(right) < 3:
        return None
    left_norm = math.sqrt(sum(float(value) ** 2 for value in left[:3]))
    right_norm = math.sqrt(sum(float(value) ** 2 for value in right[:3]))
    if left_norm <= 1.0e-9 or right_norm <= 1.0e-9:
        return None
    dot = sum(float(a) * float(b) for a, b in zip(left[:3], right[:3]))
    cosine = max(-1.0, min(1.0, dot / (left_norm * right_norm)))
    return math.degrees(math.acos(cosine))


@dataclass(frozen=True)
class DisplacementCheck:
    """Sample-rate independent verdict from integrated command versus real motion."""

    commanded_m: tuple[float, float, float]
    actual_m: tuple[float, float, float]
    commanded_distance_m: float
    actual_distance_m: float
    follow_ratio: float | None
    direction_error_deg: float | None
    shortfall_m: float


def displacement_check(
    commanded_integral_m: Sequence[float], actual_delta_m: Sequence[float]
) -> DisplacementCheck:
    """Compare the integral of the command with the measured pose change."""
    commanded = tuple(float(value) for value in commanded_integral_m[:3])
    actual = tuple(float(value) for value in actual_delta_m[:3])
    commanded_distance = math.sqrt(sum(value * value for value in commanded))
    actual_distance = math.sqrt(sum(value * value for value in actual))
    ratio = actual_distance / commanded_distance if commanded_distance > 1.0e-9 else None
    return DisplacementCheck(
        commanded_m=commanded,
        actual_m=actual,
        commanded_distance_m=commanded_distance,
        actual_distance_m=actual_distance,
        follow_ratio=ratio,
        direction_error_deg=angle_between_deg(commanded, actual),
        shortfall_m=commanded_distance - actual_distance,
    )


# A command whose mean is most of its own RMS is a one-sided hold or step: its
# steady-state mean is meaningful. A square or a sine averages to zero, so only
# an amplitude ratio says whether the arm reached the commanded speed.
DC_RATIO_THRESHOLD = 0.7


@dataclass(frozen=True)
class SegmentMetrics:
    """Everything one scripted segment says about following performance."""

    segment: str
    axis: str
    sample_count: int
    # True for a hold or step, False for a zero-mean waveform such as a square
    # or a sine. It decides which gain, and whether a rise time, means anything.
    is_dc: bool
    measured_valid_fraction: float
    commanded_mean: float
    commanded_rms: float
    accepted_mean: float
    limited_mean: float
    measured_mean: float
    # Mean ratio over the trailing steady window; None for a zero-mean waveform.
    steady_gain: float | None
    # RMS ratio over the whole excitation; the amplitude answer that also works
    # for a square or a sine.
    amplitude_gain: float | None
    steady_bias: float
    rms_error: float
    normalized_rms_error: float | None
    # Delay behind what this node asked for; what the operator feels.
    lag_sec: float | None
    # Delay behind the acceleration-limited command the driver actually sent.
    # A large lag_sec with a small lag_vs_limited_sec means the driver's own
    # acceleration limit, not the controller, is the slow part.
    lag_vs_limited_sec: float | None
    # Seconds to reach 90% of the speed the arm settles at, not 90% of the
    # command; the gain fields carry the shortfall separately.
    rise_time_sec: float | None
    peak_measured: float
    overshoot_fraction: float | None
    cross_axis_leakage: dict[str, float]
    max_command_age_ms: int
    telemetry: RateStats


def analyze_segment(
    samples: Sequence[Sample],
    *,
    period_sec: float,
    steady_fraction: float = 0.5,
    max_lag_sec: float = 1.0,
) -> SegmentMetrics | None:
    """Summarise one segment, or return None when it commanded nothing.

    A settle window carries a zero command by design, so it is skipped rather
    than reported as a segment the arm failed to follow.
    """
    active = [sample for sample in samples if sample.session_active]
    if len(active) < 4:
        return None
    axis = dominant_axis(active)
    commanded = series(active, "commanded", axis)
    accepted = series(active, "accepted", axis)
    limited = series(active, "limited", axis)
    measured = series(active, "measured", axis)
    times = [sample.t_sec for sample in active]

    commanded_rms = rms(commanded)
    if commanded_rms <= 1.0e-9:
        return None
    commanded_mean = mean(commanded)
    is_dc = abs(commanded_mean) >= DC_RATIO_THRESHOLD * commanded_rms

    valid_fraction = sum(1 for sample in active if sample.measured_valid) / len(active)

    steady_start = int(len(active) * (1.0 - max(0.0, min(1.0, steady_fraction))))
    commanded_steady_mean = mean(commanded[steady_start:])
    measured_steady_mean = mean(measured[steady_start:])
    steady_gain = (
        measured_steady_mean / commanded_steady_mean
        if is_dc and abs(commanded_steady_mean) > 1.0e-9
        else None
    )
    measured_rms = rms(measured)
    amplitude_gain = measured_rms / commanded_rms

    error = rms_error(commanded, measured)
    peak = max(measured, key=abs, default=0.0)
    # Rise time and overshoot are measured against the speed the arm actually
    # settles at, not against the command. Judging them against the command
    # would fold the gain shortfall in twice: an arm that only ever reaches 85%
    # would report "never rose" and "15% undershoot" when what it really did was
    # rise promptly to a speed that is too low. The gain fields say that already.
    overshoot = (
        abs(peak) / abs(measured_steady_mean) - 1.0
        if is_dc and abs(measured_steady_mean) > 1.0e-9
        else None
    )

    telemetry_times = sorted(
        set(
            round(sample.t_sec - sample.telemetry_age_sec, 6)
            for sample in active
            if sample.measured_valid
        )
    )

    return SegmentMetrics(
        segment=active[0].segment,
        axis=axis,
        sample_count=len(active),
        is_dc=is_dc,
        measured_valid_fraction=valid_fraction,
        commanded_mean=commanded_mean,
        commanded_rms=commanded_rms,
        accepted_mean=mean(accepted),
        limited_mean=mean(limited),
        measured_mean=mean(measured),
        steady_gain=steady_gain,
        amplitude_gain=amplitude_gain,
        steady_bias=measured_steady_mean - commanded_steady_mean if is_dc else 0.0,
        rms_error=error,
        normalized_rms_error=error / commanded_rms,
        lag_sec=estimate_lag_sec(commanded, measured, period_sec, max_lag_sec=max_lag_sec),
        lag_vs_limited_sec=estimate_lag_sec(
            limited, measured, period_sec, max_lag_sec=max_lag_sec
        ),
        rise_time_sec=(
            rise_time_sec(times, measured, measured_steady_mean) if is_dc else None
        ),
        peak_measured=peak,
        overshoot_fraction=overshoot,
        cross_axis_leakage=cross_axis_leakage(active, axis),
        max_command_age_ms=max((sample.command_age_ms for sample in active), default=0),
        telemetry=rate_stats(telemetry_times),
    )


# ------------------------------------------------------ press / release


# Default "is it moving" thresholds when no measured noise floor is available.
# They sit a few times above the windowed-fit noise seen on a stationary RM65.
DEFAULT_MOTION_THRESHOLD_MPS = 0.0005
DEFAULT_MOTION_THRESHOLD_RADPS = 0.002
# The arm counts as stopped once it has stayed below the threshold this long.
STOPPED_HOLD_SEC = 0.1


@dataclass(frozen=True)
class EdgeResponse:
    """How the arm answered one key press and its release on one axis.

    A whole-run displacement check can report a near-perfect follow ratio for
    an arm that is slow at both ends, because the distance lost while it builds
    speed is repaid by the distance it coasts after the key is released. For a
    keyboard operator those two transients *are* the experience, so they are
    measured here directly.
    """

    axis: str
    press_t_sec: float
    command: float
    held_sec: float
    # Press to the first sample above the motion threshold.
    start_latency_sec: float | None
    # Press to 90% of the commanded speed; None if it never got there.
    rise_time_sec: float | None
    # The same for the acceleration-limited command, i.e. the fastest rise the
    # driver's own ramp allowed. The gap between the two is the arm's share.
    limited_rise_time_sec: float | None
    held_commanded: float
    held_travel: float
    # Release to the arm staying below the motion threshold; None if the run
    # ended, or the axis was pressed again, before it settled.
    stop_time_sec: float | None
    coast: float

    @property
    def behind_at_release(self) -> float:
        """How far short of the commanded travel the arm was on release."""
        return self.held_commanded - self.held_travel


def _motion_threshold(axis: str, noise: object | None) -> float:
    index = axis_index(axis)
    default = DEFAULT_MOTION_THRESHOLD_MPS if index < 3 else DEFAULT_MOTION_THRESHOLD_RADPS
    stdev = getattr(noise, "stdev", None) if noise is not None else None
    if stdev and len(stdev) == 6 and getattr(noise, "samples", 0) >= 8:
        return max(3.0 * float(stdev[index]), 0.5 * default)
    return default


def press_release_responses(
    samples: Sequence[Sample], *, noise: object | None = None
) -> tuple[EdgeResponse, ...]:
    """Find every press/release on every axis and measure the transients.

    Works on the whole run rather than per segment, because the release of a
    scripted segment lands in its separately-named settle tail, and a keyboard
    session is one long segment containing many presses.
    """
    ordered = [sample for sample in samples if sample.session_active]
    if len(ordered) < 4:
        return ()
    times = [sample.t_sec for sample in ordered]
    responses: list[EdgeResponse] = []

    for axis in AXIS_NAMES:
        index = axis_index(axis)
        commanded = [sample.commanded[index] for sample in ordered]
        limited = [sample.limited[index] for sample in ordered]
        measured = [
            sample.measured[index] if sample.measured_valid else math.nan
            for sample in ordered
        ]
        threshold = _motion_threshold(axis, noise)

        position = 0
        while position < len(ordered):
            if commanded[position] == 0.0:
                position += 1
                continue
            press = position
            direction = 1.0 if commanded[press] > 0.0 else -1.0
            release = press
            while release < len(ordered) and commanded[release] != 0.0 and (
                (commanded[release] > 0.0) == (direction > 0.0)
            ):
                release += 1
            # ``release`` is the first sample after the hold, or len() when the
            # run ended with the key still down.
            level = mean([abs(value) for value in commanded[press:release]])

            def signed(values, start, end):
                return [direction * value for value in values[start:end]]

            def first_reaching(values, start, end, target):
                for offset, value in enumerate(signed(values, start, end)):
                    if math.isfinite(value) and value >= target:
                        return times[start + offset] - times[press]
                return None

            def travel(start, end):
                total = 0.0
                for step in range(max(start, 1), end):
                    value = measured[step]
                    if math.isfinite(value):
                        total += direction * value * (times[step] - times[step - 1])
                return total

            held_commanded = sum(
                abs(commanded[step]) * (times[step] - times[step - 1])
                for step in range(max(press, 1), release)
            )

            stop_time = None
            coast = 0.0
            if release < len(ordered):
                next_press = release
                while next_press < len(ordered) and commanded[next_press] == 0.0:
                    next_press += 1
                settle = None
                for step in range(release, next_press):
                    window_end = step
                    while (
                        window_end < next_press
                        and times[window_end] - times[step] < STOPPED_HOLD_SEC
                    ):
                        window_end += 1
                    if times[window_end - 1] - times[step] < 0.5 * STOPPED_HOLD_SEC:
                        break
                    if all(
                        math.isfinite(measured[k]) and abs(measured[k]) < threshold
                        for k in range(step, window_end)
                    ):
                        settle = step
                        break
                if settle is not None:
                    stop_time = times[settle] - times[release]
                    coast = travel(release, settle + 1)
                else:
                    coast = travel(release, next_press)

            responses.append(
                EdgeResponse(
                    axis=axis,
                    press_t_sec=times[press],
                    command=direction * level,
                    held_sec=times[min(release, len(ordered) - 1)] - times[press],
                    start_latency_sec=first_reaching(measured, press, release, threshold),
                    rise_time_sec=first_reaching(measured, press, release, 0.9 * level),
                    limited_rise_time_sec=first_reaching(limited, press, release, 0.9 * level),
                    held_commanded=held_commanded,
                    held_travel=travel(press, release),
                    stop_time_sec=stop_time,
                    coast=coast,
                )
            )
            position = release
    responses.sort(key=lambda response: response.press_t_sec)
    return tuple(responses)


@dataclass(frozen=True)
class RunMetrics:
    """Whole-run view: per-segment results plus the stream health behind them."""

    segments: tuple[SegmentMetrics, ...]
    command_rate: RateStats
    telemetry_rate: RateStats
    sample_count: int
    session_active_fraction: float
    measured_valid_fraction: float


def analyze_run(
    samples: Sequence[Sample],
    *,
    period_sec: float,
    steady_fraction: float = 0.5,
    max_lag_sec: float = 1.0,
) -> RunMetrics:
    """Analyse a full recorded run segment by segment."""
    if not samples:
        return RunMetrics((), rate_stats([]), rate_stats([]), 0, 0.0, 0.0)
    segment_metrics = []
    for _name, window in group_by_segment(samples):
        result = analyze_segment(
            window,
            period_sec=period_sec,
            steady_fraction=steady_fraction,
            max_lag_sec=max_lag_sec,
        )
        if result is not None:
            segment_metrics.append(result)
    telemetry_times = sorted(
        set(
            round(sample.t_sec - sample.telemetry_age_sec, 6)
            for sample in samples
            if sample.measured_valid
        )
    )
    active = sum(1 for sample in samples if sample.session_active)
    valid = sum(1 for sample in samples if sample.measured_valid)
    return RunMetrics(
        segments=tuple(segment_metrics),
        command_rate=rate_stats([sample.t_sec for sample in samples]),
        telemetry_rate=rate_stats(telemetry_times),
        sample_count=len(samples),
        session_active_fraction=active / len(samples),
        measured_valid_fraction=valid / len(samples),
    )


__all__ = [
    "DC_RATIO_THRESHOLD",
    "EdgeResponse",
    "press_release_responses",
    "DisplacementCheck",
    "RateStats",
    "RunMetrics",
    "SegmentMetrics",
    "analyze_run",
    "analyze_segment",
    "angle_between_deg",
    "cross_axis_leakage",
    "displacement_check",
    "dominant_axis",
    "estimate_lag_sec",
    "mean",
    "rate_stats",
    "rise_time_sec",
    "rms",
    "rms_error",
    "series",
]
