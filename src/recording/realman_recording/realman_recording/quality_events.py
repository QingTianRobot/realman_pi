"""Deviation annotation model: reason list, interval rules, live marks and frame mapping.

Shared by the recorder (live marks during a session), the recording Web API (replay edits)
and the sidecar export used by training. Pure Python with no ROS or aiohttp import, so every
rule here is unit-testable on a laptop.

Intervals live in the session manifest's ``quality`` block with nanosecond SYSTEM_TIME bounds
stored as decimal strings (JavaScript numbers lose epoch-nanosecond precision). An ``end_ns``
of ``None`` means the deviation never recovered before the recording ended.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import yaml

REASON_ID_RE = re.compile(r"^[a-z][a-z0-9_]{0,31}$")
MAX_REASONS = 9  # one digit key per reason on :8765
MAX_INTERVALS = 200
SOURCES = frozenset({"live", "replay"})
# Index = realman_recording_msgs/QualityMark.kind.
MARK_KINDS = ("deviate_start", "recover", "reason")
# Slack for interval bounds against the session's start/end wall time.
BOUND_TOLERANCE_NS = 1_000_000_000
# A live mark stamped further than this after its receipt is a clock problem, not a mark.
FUTURE_TOLERANCE_NS = 500_000_000


class QualityError(ValueError):
    """An interval list, reason file or mark breaks the annotation rules."""


class QualityConflict(RuntimeError):
    """An editor submitted a stale quality revision."""


@dataclass(frozen=True)
class QualityReason:
    id: str
    label: str


def load_quality_reasons(path: str | Path) -> tuple[QualityReason, ...]:
    """Read ``config/recording/quality_reasons.yaml``; a missing file means no reasons."""
    source = Path(path)
    if not source.is_file():
        return ()
    payload = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    items = payload.get("reasons") if isinstance(payload, dict) else None
    if not isinstance(items, list) or len(items) > MAX_REASONS:
        raise QualityError(f"{source}: reasons must be a list of at most {MAX_REASONS} entries")
    reasons: list[QualityReason] = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise QualityError(f"{source}: reasons[{index}] must be a mapping")
        reason_id, label = item.get("id"), item.get("label")
        if not isinstance(reason_id, str) or not REASON_ID_RE.fullmatch(reason_id):
            raise QualityError(f"{source}: reasons[{index}].id must match {REASON_ID_RE.pattern}")
        if any(existing.id == reason_id for existing in reasons):
            raise QualityError(f"{source}: duplicate reason id {reason_id}")
        if not isinstance(label, str) or not label.strip() or len(label.strip()) > 32:
            raise QualityError(f"{source}: reasons[{index}].label must be 1-32 characters")
        reasons.append(QualityReason(reason_id, label.strip()))
    return tuple(reasons)


def parse_ns(value: Any, field: str) -> int:
    """Accept a non-negative int or decimal string; reject bools, floats and signs."""
    if isinstance(value, bool):
        raise QualityError(f"{field} must be nanoseconds")
    if isinstance(value, int):
        number = value
    elif isinstance(value, str) and value.isdigit():
        number = int(value)
    else:
        raise QualityError(f"{field} must be nanoseconds as an integer or decimal string")
    if number < 0:
        raise QualityError(f"{field} must be non-negative")
    return number


def empty_quality() -> dict[str, Any]:
    return {"revision": 0, "attempt": None, "intervals": [], "rejected_marks": 0}


def quality_block(manifest: dict[str, Any]) -> dict[str, Any]:
    """The manifest's ``quality`` block, with defaults for sessions recorded before it existed."""
    block = manifest.get("quality") if isinstance(manifest, dict) else None
    result = empty_quality()
    if isinstance(block, dict):
        if type(block.get("revision")) is int and block["revision"] >= 0:
            result["revision"] = block["revision"]
        if isinstance(block.get("attempt"), dict):
            result["attempt"] = block["attempt"]
        if isinstance(block.get("intervals"), list):
            result["intervals"] = block["intervals"]
        if type(block.get("rejected_marks")) is int:
            result["rejected_marks"] = block["rejected_marks"]
    return result


def validate_intervals(
    intervals: Any,
    *,
    start_ns: int,
    end_ns: int | None,
    reasons: Iterable[str],
) -> list[dict[str, Any]]:
    """Return a normalized copy of ``intervals`` or raise ``QualityError``.

    Rules: sorted by start, no overlap, start < end, only the last interval may stay open
    (``end_ns`` null), every bound inside the session (with ``BOUND_TOLERANCE_NS``), reason
    from the configured list or null, source ``live`` or ``replay``, no other keys.
    """
    if not isinstance(intervals, list) or len(intervals) > MAX_INTERVALS:
        raise QualityError(f"intervals must be a list of at most {MAX_INTERVALS} entries")
    allowed = set(reasons)
    lower = start_ns - BOUND_TOLERANCE_NS
    upper = None if end_ns is None else end_ns + BOUND_TOLERANCE_NS
    result: list[dict[str, Any]] = []
    previous_end: int | None = None
    for index, item in enumerate(intervals):
        if not isinstance(item, dict) or set(item) != {"start_ns", "end_ns", "reason", "source"}:
            raise QualityError(f"intervals[{index}] must have exactly start_ns, end_ns, reason, source")
        begin = parse_ns(item["start_ns"], f"intervals[{index}].start_ns")
        finish = None if item["end_ns"] is None else parse_ns(item["end_ns"], f"intervals[{index}].end_ns")
        reason = item["reason"]
        if reason is not None and reason not in allowed:
            raise QualityError(f"intervals[{index}].reason is not a configured reason")
        if item["source"] not in SOURCES:
            raise QualityError(f"intervals[{index}].source must be live or replay")
        if begin < lower or (upper is not None and begin > upper):
            raise QualityError(f"intervals[{index}] starts outside the recording")
        if finish is not None and (finish <= begin or (upper is not None and finish > upper)):
            raise QualityError(f"intervals[{index}] must end after it starts and inside the recording")
        if result and previous_end is None:
            raise QualityError("only the last interval may stay open")
        if previous_end is not None and begin < previous_end:
            raise QualityError(f"intervals[{index}] overlaps the previous interval")
        result.append({
            "start_ns": str(begin),
            "end_ns": None if finish is None else str(finish),
            "reason": reason,
            "source": item["source"],
        })
        previous_end = finish
    return result


class LiveQualityTracker:
    """Turn live QualityMark events into intervals while one session records.

    The recorder owns one tracker per session and calls ``apply`` for every mark it receives;
    a rejected mark only bumps ``rejected``. ``intervals()`` is what the recorder writes to
    ``manifest.partial.json`` after every mark.
    """

    def __init__(self, *, session_start_ns: int, reasons: Iterable[str]) -> None:
        self._session_start_ns = session_start_ns
        self._reasons = frozenset(reasons)
        self._intervals: list[dict[str, Any]] = []
        self.rejected = 0

    @property
    def deviating(self) -> bool:
        return bool(self._intervals) and self._intervals[-1]["end_ns"] is None

    def open_interval(self) -> dict[str, Any] | None:
        return dict(self._intervals[-1]) if self.deviating else None

    def apply(self, kind: str, stamp_ns: int, reason: str, *, now_ns: int) -> bool:
        """Apply one mark; return whether it was accepted."""
        accepted = self._apply(kind, stamp_ns, reason or None, now_ns)
        if not accepted:
            self.rejected += 1
        return accepted

    def _apply(self, kind: str, stamp_ns: int, reason: str | None, now_ns: int) -> bool:
        if kind not in MARK_KINDS:
            return False
        if reason is not None and reason not in self._reasons:
            return False
        if stamp_ns < self._session_start_ns - BOUND_TOLERANCE_NS or stamp_ns > now_ns + FUTURE_TOLERANCE_NS:
            return False
        if self._intervals:
            last = self._intervals[-1]
            boundary = last["start_ns"] if last["end_ns"] is None else last["end_ns"]
            if stamp_ns < boundary:
                return False
        if kind == "deviate_start":
            if self.deviating:
                return False
            self._intervals.append({"start_ns": stamp_ns, "end_ns": None, "reason": reason, "source": "live"})
            return True
        if not self.deviating:
            return False
        current = self._intervals[-1]
        if kind == "recover":
            if stamp_ns <= current["start_ns"]:
                return False
            current["end_ns"] = stamp_ns
            return True
        if reason is None:  # kind == "reason"
            return False
        current["reason"] = reason
        return True

    def intervals(self) -> list[dict[str, Any]]:
        """Manifest form: nanosecond bounds as decimal strings."""
        return [
            {
                "start_ns": str(item["start_ns"]),
                "end_ns": None if item["end_ns"] is None else str(item["end_ns"]),
                "reason": item["reason"],
                "source": item["source"],
            }
            for item in self._intervals
        ]
