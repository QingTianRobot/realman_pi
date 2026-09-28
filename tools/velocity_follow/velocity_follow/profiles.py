"""Repeatable scripted velocity waveforms used instead of a human key hold.

A human key hold is not reproducible, so quantitative "does the arm keep up"
numbers come from scripted segments. Every waveform is a pure function of the
elapsed time inside its own segment, which keeps the node loop stateless and
makes the shapes directly unit-testable.
"""

from __future__ import annotations

from dataclasses import dataclass
import math

from .axes import ZERO_COMMAND, axis_index


WAVEFORMS: tuple[str, ...] = ("hold", "step", "ramp", "square", "sine", "chirp")


@dataclass(frozen=True)
class Segment:
    """One scripted excitation on a single axis."""

    axis: str
    waveform: str
    amplitude: float
    duration_sec: float
    # Hz for square/sine, the end frequency for chirp, and unused for hold/ramp.
    frequency_hz: float = 0.0
    # Seconds of zero command appended after the segment so the arm settles and
    # the next segment starts from a known standstill.
    settle_sec: float = 0.0
    label: str = ""

    def __post_init__(self) -> None:
        axis_index(self.axis)
        if self.waveform not in WAVEFORMS:
            raise ValueError(
                f"unknown waveform {self.waveform!r}; expected one of {', '.join(WAVEFORMS)}"
            )
        for name in ("amplitude", "duration_sec", "frequency_hz", "settle_sec"):
            value = getattr(self, name)
            if not isinstance(value, (int, float)) or isinstance(value, bool):
                raise ValueError(f"{name} must be numeric")
            if not math.isfinite(float(value)):
                raise ValueError(f"{name} must be finite")
        if self.amplitude == 0.0:
            raise ValueError("amplitude must be non-zero")
        if self.duration_sec <= 0.0:
            raise ValueError("duration_sec must be positive")
        if self.settle_sec < 0.0:
            raise ValueError("settle_sec must not be negative")
        if self.waveform in ("square", "sine", "chirp") and self.frequency_hz <= 0.0:
            raise ValueError(f"{self.waveform} requires a positive frequency_hz")

    @property
    def total_sec(self) -> float:
        """Excitation plus settle time, which is what the runner schedules."""
        return self.duration_sec + self.settle_sec

    @property
    def name(self) -> str:
        if self.label:
            return self.label
        return f"{self.axis}-{self.waveform}"

    def phase_at(self, elapsed_sec: float) -> str:
        """Return ``excite``, ``settle`` or ``done`` for a time inside the segment.

        The settle tail carries a zero command, so analysing it together with the
        excitation would drag every mean toward zero and invent an overshoot that
        is really just the arm coasting to a stop. Naming it separately keeps the
        two windows apart in the recording.
        """
        if elapsed_sec < 0.0 or elapsed_sec >= self.total_sec:
            return "done"
        return "excite" if elapsed_sec < self.duration_sec else "settle"

    def label_at(self, elapsed_sec: float) -> str:
        """Return the recorded segment name, suffixed while settling."""
        phase = self.phase_at(elapsed_sec)
        if phase == "settle":
            return f"{self.name}|settle"
        return self.name

    def scalar_at(self, elapsed_sec: float) -> float:
        """Return the commanded value on this segment's axis."""
        if self.phase_at(elapsed_sec) != "excite":
            return 0.0
        return self._waveform_at(elapsed_sec)

    def _waveform_at(self, elapsed_sec: float) -> float:
        if self.waveform in ("hold", "step"):
            return self.amplitude
        if self.waveform == "ramp":
            return self.amplitude * (elapsed_sec / self.duration_sec)
        if self.waveform == "square":
            half_period = 0.5 / self.frequency_hz
            index = int(elapsed_sec / half_period)
            return self.amplitude if index % 2 == 0 else -self.amplitude
        if self.waveform == "sine":
            return self.amplitude * math.sin(2.0 * math.pi * self.frequency_hz * elapsed_sec)
        # chirp: sweep 0.1 Hz up to frequency_hz across the excitation window so
        # one segment shows where the follow bandwidth collapses.
        start_hz = 0.1
        rate = (self.frequency_hz - start_hz) / self.duration_sec
        phase = 2.0 * math.pi * (start_hz * elapsed_sec + 0.5 * rate * elapsed_sec**2)
        return self.amplitude * math.sin(phase)

    def command_at(self, elapsed_sec: float) -> tuple[float, ...]:
        """Return the full six-axis command vector for this segment."""
        value = self.scalar_at(elapsed_sec)
        if value == 0.0:
            return ZERO_COMMAND
        command = list(ZERO_COMMAND)
        command[axis_index(self.axis)] = value
        return tuple(command)


def parse_segment(spec: str, *, default_settle_sec: float = 0.0) -> Segment:
    """Parse ``axis|waveform|amplitude|duration_sec[|frequency_hz[|settle_sec[|label]]]``.

    The pipe-delimited string form keeps the whole profile expressible as a ROS
    string array parameter, matching how the keyboard router already declares
    its per-arm profiles.
    """
    if not isinstance(spec, str):
        raise ValueError("segment specification must be a string")
    parts = spec.split("|")
    if not 4 <= len(parts) <= 7:
        raise ValueError(
            f"segment {spec!r} must have 4 to 7 pipe-separated fields"
        )
    axis, waveform = parts[0].strip(), parts[1].strip()
    numbers: list[float] = []
    for index, field in enumerate(("amplitude", "duration_sec", "frequency_hz", "settle_sec")):
        position = index + 2
        if position >= len(parts) or parts[position].strip() == "":
            numbers.append(default_settle_sec if field == "settle_sec" else 0.0)
            continue
        try:
            numbers.append(float(parts[position]))
        except ValueError as error:
            raise ValueError(f"segment {spec!r} field {field} must be numeric") from error
    label = parts[6].strip() if len(parts) == 7 else ""
    return Segment(
        axis=axis,
        waveform=waveform,
        amplitude=numbers[0],
        duration_sec=numbers[1],
        frequency_hz=numbers[2],
        settle_sec=numbers[3],
        label=label,
    )


def parse_profile(
    specs: list[str], *, default_settle_sec: float = 0.0
) -> tuple[Segment, ...]:
    """Parse a whole profile and reject an empty one early."""
    segments = tuple(
        parse_segment(spec, default_settle_sec=default_settle_sec) for spec in specs
    )
    if not segments:
        raise ValueError("velocity profile must contain at least one segment")
    return segments


class ProfileRunner:
    """Walk a profile in wall-clock order and expose the active command."""

    def __init__(self, segments: tuple[Segment, ...]) -> None:
        if not segments:
            raise ValueError("ProfileRunner requires at least one segment")
        self.segments = segments
        self._index = 0
        self._segment_started_at: float | None = None
        self._label = segments[0].name

    @property
    def finished(self) -> bool:
        return self._index >= len(self.segments)

    @property
    def active_segment(self) -> Segment | None:
        if self.finished:
            return None
        return self.segments[self._index]

    @property
    def label(self) -> str:
        """Segment name recorded with the most recent command, plus its phase."""
        return self._label

    def command_at(self, now: float) -> tuple[float, ...]:
        """Advance the schedule to ``now`` and return the command to publish."""
        if self.finished:
            self._label = "done"
            return ZERO_COMMAND
        if self._segment_started_at is None:
            self._segment_started_at = now
        while not self.finished:
            segment = self.segments[self._index]
            elapsed = now - self._segment_started_at
            if elapsed < segment.total_sec:
                self._label = segment.label_at(elapsed)
                return segment.command_at(elapsed)
            self._index += 1
            self._segment_started_at += segment.total_sec
        self._label = "done"
        return ZERO_COMMAND

    def segment_elapsed(self, now: float) -> float:
        """Return seconds inside the active segment, or 0.0 before the start."""
        if self.finished or self._segment_started_at is None:
            return 0.0
        return max(0.0, now - self._segment_started_at)

    @property
    def total_sec(self) -> float:
        return sum(segment.total_sec for segment in self.segments)


__all__ = ["ProfileRunner", "Segment", "WAVEFORMS", "parse_profile", "parse_segment"]
