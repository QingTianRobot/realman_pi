"""Uniform-grid sample records and their CSV round trip.

One row is written per publish tick rather than per telemetry message, so the
recorded series sits on the control period's uniform grid. Lag estimation and
RMS error then need no resampling, and a telemetry stream slower than the
control loop shows up honestly as a repeated measurement with a rising age.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator, Sequence

from .axes import AXIS_NAMES, ZERO_COMMAND


_VECTOR_FIELDS: tuple[tuple[str, str], ...] = (
    ("cmd", "commanded"),
    ("acc", "accepted"),
    ("lim", "limited"),
    ("mea", "measured"),
)

CSV_COLUMNS: tuple[str, ...] = (
    "t_sec",
    "segment",
    "segment_elapsed_sec",
    *(f"{prefix}_{axis}" for prefix, _ in _VECTOR_FIELDS for axis in AXIS_NAMES),
    "measured_valid",
    "session_active",
    "command_age_ms",
    "measured_age_ms",
    "telemetry_age_sec",
)


def _vector(values: Sequence[float] | None) -> tuple[float, ...]:
    if values is None:
        return ZERO_COMMAND
    numbers = tuple(float(value) for value in values)
    if len(numbers) != 6:
        raise ValueError("velocity vectors must hold six components")
    return numbers


@dataclass(frozen=True)
class Sample:
    """One control-period snapshot of command and telemetry."""

    t_sec: float
    segment: str = ""
    segment_elapsed_sec: float = 0.0
    # What this node published on /<arm>/cartesian_velocity/command.
    commanded: tuple[float, ...] = ZERO_COMMAND
    # What the driver session reports it accepted, before acceleration limiting.
    accepted: tuple[float, ...] = ZERO_COMMAND
    # What the session actually handed to rm_movev_canfd after limiting.
    limited: tuple[float, ...] = ZERO_COMMAND
    # Pose-difference estimate of what the arm really did.
    measured: tuple[float, ...] = ZERO_COMMAND
    measured_valid: bool = False
    session_active: bool = False
    command_age_ms: int = 0
    measured_age_ms: int = 0
    telemetry_age_sec: float = 0.0

    def __post_init__(self) -> None:
        for name in ("commanded", "accepted", "limited", "measured"):
            object.__setattr__(self, name, _vector(getattr(self, name)))

    def as_row(self) -> dict[str, object]:
        row: dict[str, object] = {
            "t_sec": f"{self.t_sec:.6f}",
            "segment": self.segment,
            "segment_elapsed_sec": f"{self.segment_elapsed_sec:.6f}",
            "measured_valid": int(self.measured_valid),
            "session_active": int(self.session_active),
            "command_age_ms": int(self.command_age_ms),
            "measured_age_ms": int(self.measured_age_ms),
            "telemetry_age_sec": f"{self.telemetry_age_sec:.6f}",
        }
        for prefix, attribute in _VECTOR_FIELDS:
            for index, axis in enumerate(AXIS_NAMES):
                row[f"{prefix}_{axis}"] = f"{getattr(self, attribute)[index]:.9f}"
        return row

    @classmethod
    def from_row(cls, row: dict[str, str]) -> "Sample":
        vectors = {
            attribute: tuple(float(row[f"{prefix}_{axis}"]) for axis in AXIS_NAMES)
            for prefix, attribute in _VECTOR_FIELDS
        }
        return cls(
            t_sec=float(row["t_sec"]),
            segment=row.get("segment", ""),
            segment_elapsed_sec=float(row.get("segment_elapsed_sec", 0.0) or 0.0),
            measured_valid=bool(int(row.get("measured_valid", 0) or 0)),
            session_active=bool(int(row.get("session_active", 0) or 0)),
            command_age_ms=int(float(row.get("command_age_ms", 0) or 0)),
            measured_age_ms=int(float(row.get("measured_age_ms", 0) or 0)),
            telemetry_age_sec=float(row.get("telemetry_age_sec", 0.0) or 0.0),
            **vectors,
        )


class CsvRecorder:
    """Append samples to a CSV file and flush on every row.

    Flushing per row keeps a run analysable after a Ctrl-C or a watchdog abort,
    which is exactly when the recorded evidence matters most.
    """

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._handle = self.path.open("w", encoding="utf-8", newline="")
        self._writer = csv.DictWriter(self._handle, fieldnames=list(CSV_COLUMNS))
        self._writer.writeheader()
        self._handle.flush()
        self._count = 0

    @property
    def count(self) -> int:
        return self._count

    def write(self, sample: Sample) -> None:
        self._writer.writerow(sample.as_row())
        self._handle.flush()
        self._count += 1

    def close(self) -> None:
        if not self._handle.closed:
            self._handle.close()

    def __enter__(self) -> "CsvRecorder":
        return self

    def __exit__(self, *_exception) -> bool:
        self.close()
        return False


def load_samples(path: Path | str) -> list[Sample]:
    """Read a recorded run back for offline analysis."""
    with Path(path).open("r", encoding="utf-8", newline="") as handle:
        return [Sample.from_row(row) for row in csv.DictReader(handle)]


def group_by_segment(samples: Iterable[Sample]) -> Iterator[tuple[str, list[Sample]]]:
    """Yield consecutive runs of samples that share a segment name."""
    current_name: str | None = None
    current: list[Sample] = []
    for sample in samples:
        if sample.segment != current_name:
            if current_name is not None:
                yield current_name, current
            current_name = sample.segment
            current = []
        current.append(sample)
    if current_name is not None:
        yield current_name, current


__all__ = [
    "CSV_COLUMNS",
    "CsvRecorder",
    "Sample",
    "group_by_segment",
    "load_samples",
]
