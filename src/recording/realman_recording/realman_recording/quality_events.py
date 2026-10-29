"""Deviation annotation model: reason list, interval rules, live marks and frame mapping.

Shared by the recorder (live marks during a session), the recording Web API (replay edits)
and the sidecar export used by training. Pure Python with no ROS or aiohttp import, so every
rule here is unit-testable on a laptop.

Intervals live in the session manifest's ``quality`` block with nanosecond SYSTEM_TIME bounds
stored as decimal strings (JavaScript numbers lose epoch-nanosecond precision). An ``end_ns``
of ``None`` means the deviation never recovered before the recording ended.
"""
from __future__ import annotations

import argparse
import json
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import yaml

from .json_io import atomic_json_write

REASON_ID_RE = re.compile(r"^[a-z][a-z0-9_]{0,31}$")
MAX_REASONS = 9  # one digit key per reason on :8765
MAX_INTERVALS = 200
SOURCES = frozenset({"live", "replay"})
# Index = realman_recording_msgs/QualityMark.kind.
MARK_KINDS = ("deviate_start", "recover", "reason")
SIDECAR_SCHEMA = "realman.quality_events.v1"
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
            result["attempt"] = dict(block["attempt"])
        if isinstance(block.get("intervals"), list):
            result["intervals"] = list(block["intervals"])
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


def frame_step_ns(fps: float) -> int:
    """The exporter's integer policy-grid step (lerobot_exporter rounds the same way)."""
    if not fps or fps <= 0:
        raise QualityError("fps must be positive")
    return round(1_000_000_000 / fps)


def frame_time_ns(first_walltime_ns: int, fps: float, index: int) -> int:
    return first_walltime_ns + index * frame_step_ns(fps)


def interval_frames(
    interval: dict[str, Any], *, first_walltime_ns: int, fps: float, frame_count: int,
) -> tuple[int | None, int | None]:
    """Inclusive frame range an interval covers, or ``(None, None)`` outside the episode."""
    step = frame_step_ns(fps)
    begin = parse_ns(interval["start_ns"], "start_ns")
    start_frame = max(0, -(-(begin - first_walltime_ns) // step))
    if interval["end_ns"] is None:
        end_frame = frame_count - 1
    else:
        finish = parse_ns(interval["end_ns"], "end_ns")
        end_frame = min(frame_count - 1, -(-(finish - first_walltime_ns) // step) - 1)
    if frame_count <= 0 or start_frame > end_frame:
        return None, None
    return start_frame, end_frame


def frame_labels(
    intervals: list[dict[str, Any]], *, first_walltime_ns: int, fps: float, frame_count: int,
) -> tuple[list[int], list[int]]:
    """Per-frame ``deviating`` (0/1) and ``frames_to_deviation`` (0 inside, -1 none ahead)."""
    deviating = [0] * frame_count
    for interval in intervals:
        start, end = interval_frames(
            interval, first_walltime_ns=first_walltime_ns, fps=fps, frame_count=frame_count,
        )
        if start is not None and end is not None:
            for index in range(start, end + 1):
                deviating[index] = 1
    frames_to_deviation = [-1] * frame_count
    upcoming = -1
    for index in range(frame_count - 1, -1, -1):
        if deviating[index]:
            frames_to_deviation[index] = 0
            upcoming = index
        elif upcoming >= 0:
            frames_to_deviation[index] = upcoming - index
    return deviating, frames_to_deviation


def read_receipt(directory: Path) -> dict[str, Any] | None:
    path = Path(directory) / "export" / "lerobot-v3.json"
    if not path.is_file():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload if isinstance(payload, dict) else None


def receipt_frames(receipt: dict[str, Any] | None) -> dict[str, Any] | None:
    """``{fps, first_walltime_ns, frame_count}`` from an export receipt, or None."""
    if not receipt:
        return None
    try:
        fps = float(receipt["fps"])
        first = int(receipt["first_walltime_ns"])
        count = int(receipt["frame_count"])
    except (KeyError, TypeError, ValueError):
        return None
    if fps <= 0 or first < 0 or count < 0:
        return None
    return {"fps": fps, "first_walltime_ns": first, "frame_count": count}


def with_frames(intervals: list[dict[str, Any]], frames: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Copy of ``intervals`` with ``start_frame``/``end_frame`` (None without an export)."""
    result = []
    for interval in intervals:
        start = end = None
        if frames is not None:
            start, end = interval_frames(
                interval, first_walltime_ns=frames["first_walltime_ns"], fps=frames["fps"],
                frame_count=frames["frame_count"],
            )
        result.append({**interval, "start_frame": start, "end_frame": end})
    return result


def session_document(directory: Path, reasons: Iterable[QualityReason]) -> dict[str, Any]:
    """GET payload for one finalized session: quality block, frame grid and reason list."""
    manifest = json.loads((Path(directory) / "manifest.json").read_text(encoding="utf-8"))
    if not isinstance(manifest, dict):
        raise QualityError("recording manifest must be a JSON object")
    block = quality_block(manifest)
    frames = receipt_frames(read_receipt(directory))
    return {
        "session_id": Path(directory).name,
        "revision": block["revision"],
        "attempt": block["attempt"],
        "intervals": with_frames(block["intervals"], frames),
        "frames": None if frames is None else {**frames, "first_walltime_ns": str(frames["first_walltime_ns"])},
        "reasons": [{"id": reason.id, "label": reason.label} for reason in reasons],
    }


def build_sidecar(recording_root: Path, repo_id: str, *, generated_at_ns: int) -> dict[str, Any]:
    """``episode_quality_events.json`` for one dataset, keyed by its episode_index.

    Only exported (SUCCEEDED), not discarded or hidden sessions whose receipt names ``repo_id``
    count. A broken session or a duplicate episode_index goes to ``errors`` instead of failing.
    """
    root = Path(recording_root)
    episodes: dict[str, Any] = {}
    errors: list[dict[str, str]] = []
    for directory in (sorted(root.iterdir()) if root.is_dir() else []):
        if not directory.is_dir() or directory.name.startswith(".") or not (directory / "manifest.json").is_file():
            continue
        try:
            manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
            if not isinstance(manifest, dict):
                raise QualityError("recording manifest must be a JSON object")
            export = manifest.get("export") or {}
            if export.get("state") != "SUCCEEDED" or manifest.get("decision") in {"DISCARDED", "DELETED"}:
                continue
            receipt = read_receipt(directory)
            if not receipt or receipt.get("repo_id") != repo_id:
                continue
            frames = receipt_frames(receipt)
            if frames is None:
                raise QualityError("export receipt has no frame grid")
            index = receipt.get("episode_index")
            if type(index) is not int or index < 0:
                raise QualityError("export receipt has no episode_index")
            key = str(index)
            if key in episodes:
                raise QualityError(f"episode_index {index} already used by {episodes[key]['session_id']}")
            block = quality_block(manifest)
            episodes[key] = {
                "session_id": directory.name,
                "fps": frames["fps"],
                "first_walltime_ns": str(frames["first_walltime_ns"]),
                "frame_count": frames["frame_count"],
                "attempt": block["attempt"],
                "intervals": with_frames(block["intervals"], frames),
            }
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
            errors.append({"session_id": directory.name, "error": str(error)})
    return {
        "schema": SIDECAR_SCHEMA,
        "repo_id": repo_id,
        "generated_at_ns": str(generated_at_ns),
        "episodes": dict(sorted(episodes.items(), key=lambda item: int(item[0]))),
        "errors": errors,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python3 -m realman_recording.quality_events")
    commands = parser.add_subparsers(dest="command", required=True)
    dump = commands.add_parser("dump", help="write episode_quality_events.json for one dataset")
    dump.add_argument("--recording-root", required=True)
    dump.add_argument("--repo-id", required=True)
    dump.add_argument("-o", "--output", required=True)
    args = parser.parse_args(argv)
    sidecar = build_sidecar(Path(args.recording_root), args.repo_id, generated_at_ns=time.time_ns())
    atomic_json_write(Path(args.output), sidecar)
    print(f"wrote {len(sidecar['episodes'])} episodes ({len(sidecar['errors'])} errors) to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
