"""Crash-conscious local session layout for recording-first recording.

This file owns only session directories and manifests.  It deliberately does not know
about ROS, cameras, WebSockets, or the RealMan SDK, so a failed preview/export can never
hold the durable recording state hostage.  All runtime data lives outside ``config/``.
"""
from __future__ import annotations

import json
import os
import shutil
import threading
from functools import wraps
import time
import uuid
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Iterable

from .json_io import atomic_json_write


def _episode_serialized(function):
    """Serialize finalized-manifest mutations with episode tag edits."""
    @wraps(function)
    def wrapped(directory, *args, **kwargs):
        from .episode_tags import _file_lock
        with _file_lock(Path(directory).resolve().parent):
            return function(directory, *args, **kwargs)
    return wrapped


def _timestamp_or_now(value: int | None, *, name: str) -> int:
    """Return an explicit epoch timestamp, preserving zero and rejecting ambiguity."""
    if value is None:
        return time.time_ns()
    if not isinstance(value, int) or isinstance(value, bool) or value < 0:
        raise ValueError(f"{name} must be non-negative integer nanoseconds")
    return value


def _validate_subtask_segments(subtasks: list[dict[str, Any]], frame_count: int) -> None:
    """Reject subtask segments that are malformed, overlapping, or out of bounds.

    Each segment must be ``{"index": int, "label": str, "start_frame": int,
    "end_frame": int}`` with ``0 <= start_frame <= end_frame < frame_count``.
    ``index`` must be strictly ascending and segments must not overlap in frame
    space, so the per-frame ``subtask_index`` mapping is unambiguous.
    """
    previous_end = -1
    previous_index: int | None = None
    for segment in subtasks:
        if not isinstance(segment, dict):
            raise ValueError("each subtask segment must be an object")
        index = segment.get("index")
        label = segment.get("label")
        start = segment.get("start_frame")
        end = segment.get("end_frame")
        if not isinstance(index, int) or isinstance(index, bool):
            raise ValueError("subtask index must be an integer")
        if not isinstance(label, str) or not label.strip():
            raise ValueError("subtask label must be a non-empty string")
        if (not isinstance(start, int) or isinstance(start, bool)
                or not isinstance(end, int) or isinstance(end, bool)):
            raise ValueError("subtask frame bounds must be integers")
        if not 0 <= start <= end < frame_count:
            raise ValueError("subtask frame bounds must be within the exported frame count")
        if previous_index is not None and index <= previous_index:
            raise ValueError("subtask indices must be strictly ascending")
        if start <= previous_end:
            raise ValueError("subtask segments must not overlap")
        previous_index = index
        previous_end = end


class SessionState(str, Enum):
    IDLE = "IDLE"
    PREPARING = "PREPARING"
    ARMED = "ARMED"
    SCHEDULED = "SCHEDULED"
    COUNTDOWN = "COUNTDOWN"
    RECORDING = "RECORDING"
    FINALIZING = "FINALIZING"
    EXPORTING = "EXPORTING"
    EXPORTED = "EXPORTED"
    READY = "READY"
    FAILED = "FAILED"


@dataclass(frozen=True)
class RecordingSession:
    session_id: str
    directory: Path
    started_realtime_ns: int
    started_monotonic_ns: int


class SessionStore:
    """Atomically update one session manifest while media/state writers run elsewhere."""

    def __init__(self, root: str | Path):
        self.root = Path(root).expanduser().resolve()
        self.session: RecordingSession | None = None
        self.state = SessionState.IDLE
        self._manifest: dict[str, Any] | None = None

    @staticmethod
    def next_session_number(root: str | Path) -> int:
        """Return the next available session number: max existing ``session_number`` + 1.

        Only finalized manifests are considered; a corrupt manifest or a non-integer
        ``session_number`` is skipped.  Returns 1 for an empty/absent root.
        """
        maximum = 0
        root_path = Path(root)
        if root_path.is_dir():
            for directory in root_path.iterdir():
                if not directory.is_dir():
                    continue
                manifest = directory / "manifest.json"
                if not manifest.is_file():
                    continue
                try:
                    payload = json.loads(manifest.read_text(encoding="utf-8"))
                except (OSError, json.JSONDecodeError):
                    continue
                if not isinstance(payload, dict):
                    continue
                number = payload.get("metadata", {}).get("session_number")
                if isinstance(number, int) and number > maximum:
                    maximum = number
        return maximum + 1

    @staticmethod
    def pending_session_ids(root: str | Path) -> list[str]:
        """Return sorted session ids whose finalized manifest still has ``decision=PENDING``.

        A directory without a manifest, a corrupt manifest, or a hidden directory is
        skipped rather than failing the whole scan.  ``PENDING`` is the durable state a
        finalized session holds until it is adopted (queued for export) or discarded.
        """
        root_path = Path(root)
        if not root_path.is_dir():
            return []
        pending: list[str] = []
        for directory in root_path.iterdir():
            if not directory.is_dir() or directory.name.startswith("."):
                continue
            manifest = directory / "manifest.json"
            if not manifest.is_file():
                continue
            try:
                payload = json.loads(manifest.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if isinstance(payload, dict) and payload.get("decision") == "PENDING":
                pending.append(directory.name)
        pending.sort()
        return pending

    def create(
        self,
        metadata: dict[str, Any],
        *,
        started_realtime_ns: int | None = None,
        started_monotonic_ns: int | None = None,
    ) -> RecordingSession:
        """Create a session using recorder-supplied clocks when available.

        Production callers pass ROS 2 ``SYSTEM_TIME`` for the epoch timestamp and
        ``time.monotonic_ns`` for duration accounting.  The local fallbacks retain
        this class's standalone filesystem-test usability; they must not be used by
        the recorder's data path.
        """
        if self.session is not None:
            raise RuntimeError("a recording session is already active")
        self.root.mkdir(mode=0o750, parents=True, exist_ok=True)
        realtime_ns = time.time_ns() if started_realtime_ns is None else int(started_realtime_ns)
        monotonic_ns = time.monotonic_ns() if started_monotonic_ns is None else int(started_monotonic_ns)
        if realtime_ns < 0 or monotonic_ns < 0:
            raise ValueError("session timestamps must be non-negative nanoseconds")
        session_id = f"{time.strftime('%Y%m%dT%H%M%SZ', time.gmtime(realtime_ns / 1e9))}-{uuid.uuid4().hex[:10]}"
        directory = self.root / session_id
        directory.mkdir(mode=0o750)
        (directory / "videos").mkdir(mode=0o750)
        (directory / "export" / "lerobot").mkdir(mode=0o750, parents=True)
        self.session = RecordingSession(session_id, directory, realtime_ns, monotonic_ns)
        self.state = SessionState.COUNTDOWN
        if "session_number" not in metadata:
            metadata["session_number"] = self.next_session_number(self.root)
        self._manifest = {
            "schema_version": 2,
            "session_id": session_id,
            "state": self.state.value,
            "started_realtime_ns": realtime_ns,
            "started_monotonic_ns": monotonic_ns,
            "metadata": metadata,
            # Labels are intentionally nullable facts until an upstream evaluator
            # writes them; RL reward/log-prob data is a separate extension.
            "annotations": {
                "success": None,
                "terminated": None,
                "truncated": None,
                "failure_reason": None,
                "human_intervention_count": None,
            },
            # A finalized raw session is deliberately pending until an upstream system
            # explicitly adopts or discards it; recording never auto-exports data.
            "decision": "PENDING",
            "files": {"state": "state.mcap", "videos": "videos/", "lerobot": "export/lerobot/"},
        }
        # Bind defaults at session creation.  A corrupt optional defaults file
        # must never stop the recorder from creating its raw session.
        try:
            from .episode_tags import EpisodeTagStore
            defaults = EpisodeTagStore(self.root).defaults()
        except Exception:
            defaults = {"success": True, "arm": None, "lighting_level": None}
        self._manifest["episode_tags"] = {"defaults": defaults, "manual": {}, "removed": [], "revision": 0}
        self._write_partial()
        return self.session

    def transition(self, target: SessionState, **updates: Any) -> None:
        if self.session is None or self._manifest is None:
            raise RuntimeError("no active recording session")
        self.state = target
        self._manifest["state"] = target.value
        self._manifest.update(updates)
        self._write_partial()

    def update_metadata(self, **updates: Any) -> None:
        """Atomically add immutable-source details discovered after directory creation."""
        if self._manifest is None:
            raise RuntimeError("no active recording session")
        metadata = self._manifest.get("metadata")
        if not isinstance(metadata, dict):
            raise RuntimeError("recording metadata is malformed")
        metadata.update(updates)
        self._write_partial()

    def update_quality(self, quality: dict[str, Any]) -> None:
        """Atomically replace the active session's ``quality`` block (live marks, attempt)."""
        if self._manifest is None:
            raise RuntimeError("no active recording session")
        self._manifest["quality"] = quality
        self._write_partial()

    def record_attempt_outcome(self, attempt: dict[str, Any], *, auto_tags: dict[str, Any]) -> None:
        """Store the finished policy attempt, its machine-written tags and its business success.

        ``finalize`` keeps ``annotations.success`` once it is set, so the attempt's verdict
        wins over the saved default.
        """
        if self._manifest is None:
            raise RuntimeError("no active recording session")
        from .episode_tags import validate_tags
        from .quality_events import quality_block
        # Validate first so bad tags leave quality.attempt and annotations untouched.
        clean_tags = validate_tags(auto_tags)
        quality = quality_block(self._manifest)
        quality["attempt"] = attempt
        self._manifest["quality"] = quality
        self._manifest["episode_tags"]["auto"] = clean_tags
        annotations = self._manifest["annotations"]
        annotations["success"] = bool(attempt.get("succeeded"))
        annotations["failure_reason"] = None if attempt.get("succeeded") else attempt.get("outcome")
        self._write_partial()

    def finalize(self, success: bool, *, ended_realtime_ns: int | None = None, **summary: Any) -> Path:
        """Seal the manifest, preserving the recorder's ROS wall-time if supplied."""
        if self.session is None or self._manifest is None:
            raise RuntimeError("no active recording session")
        self.state = SessionState.READY if success else SessionState.FAILED
        ended_ns = time.time_ns() if ended_realtime_ns is None else int(ended_realtime_ns)
        if ended_ns < 0:
            raise ValueError("session end timestamp must be non-negative nanoseconds")
        self._manifest.update(
            state=self.state.value,
            ended_realtime_ns=ended_ns,
            summary=summary,
        )
        # Business success comes from the saved default, never from the STOP
        # operation's transport/recording success argument above.
        if self._manifest["annotations"].get("success") is None:
            self._manifest["annotations"]["success"] = self._manifest["episode_tags"]["defaults"]["success"]
        self._write_partial()
        partial = self.session.directory / "manifest.partial.json"
        final = self.session.directory / "manifest.json"
        os.replace(partial, final)
        # Indexing is recoverable work after the finalized manifest is durable;
        # it must not delay or fail STOP/MCAP finalization.
        self._refresh_episode_index_async(self.root)
        return final

    @staticmethod
    def _refresh_episode_index_async(root: str | Path) -> None:
        def refresh() -> None:
            try:
                from .episode_tags import EpisodeTagStore
                EpisodeTagStore(root).rebuild()
            except Exception:
                pass  # Explicit /episode-meta/rebuild reports and repairs failures.
        threading.Thread(target=refresh, name="episode-meta-refresh", daemon=True).start()

    def _write_partial(self) -> None:
        assert self.session is not None and self._manifest is not None
        atomic_json_write(self.session.directory / "manifest.partial.json", self._manifest)

    @staticmethod
    def recover_orphaned_sessions(root: str | Path, *, recovered_realtime_ns: int | None = None) -> list[dict[str, Any]]:
        """Close manifests left by a recorder process that died before ``finalize``.

        A partial manifest is never silently discarded.  A session whose persisted
        state is already READY and whose writer counters are clean is promoted to the
        final name (the crash happened after writing the complete manifest but before
        ``os.replace``).  All other partial sessions become FAILED with at least one
        write error, so an incomplete MCAP can never be adopted.  Raw files remain in
        place for forensic inspection.
        """
        base = Path(root).expanduser().resolve()
        if not base.is_dir():
            return []
        now_ns = time.time_ns() if recovered_realtime_ns is None else _timestamp_or_now(
            recovered_realtime_ns, name="recovered_realtime_ns"
        )
        recovered: list[dict[str, Any]] = []
        for directory in sorted(base.iterdir()):
            if not directory.is_dir() or directory.name.startswith("."):
                continue
            partial = directory / "manifest.partial.json"
            final = directory / "manifest.json"
            if final.is_file() or not partial.is_file():
                continue
            try:
                payload = json.loads(partial.read_text(encoding="utf-8"))
                if not isinstance(payload, dict):
                    raise ValueError("manifest must be an object")
                summary = payload.get("summary")
                clean_ready = (
                    payload.get("state") == SessionState.READY.value
                    and isinstance(summary, dict)
                    and int(summary.get("write_errors", 1)) == 0
                    and int(summary.get("camera_write_errors", 0)) == 0
                )
                if clean_ready:
                    payload["recovery"] = {
                        "state": "FINALIZED_AFTER_PROCESS_INTERRUPTION",
                        "recovered_realtime_ns": now_ns,
                    }
                else:
                    payload["state"] = SessionState.FAILED.value
                    payload["ended_realtime_ns"] = int(payload.get("ended_realtime_ns", now_ns))
                    if not isinstance(summary, dict):
                        summary = {}
                    summary["write_errors"] = max(1, int(summary.get("write_errors", 0)))
                    summary["recovery_reason"] = "recorder process interrupted before finalization"
                    payload["summary"] = summary
                    payload["recovery"] = {
                        "state": "FAILED_AFTER_PROCESS_INTERRUPTION",
                        "recovered_realtime_ns": now_ns,
                    }
                atomic_json_write(partial, payload)
                os.replace(partial, final)
                recovered.append(
                    {
                        "session_id": str(payload.get("session_id", directory.name)),
                        "state": str(payload.get("state", SessionState.FAILED.value)),
                    }
                )
            except (OSError, ValueError, TypeError, json.JSONDecodeError):
                # A malformed/locked partial is retained for manual recovery; startup
                # must not make the recorder unavailable because of one bad session.
                continue
        return recovered

    @staticmethod
    @_episode_serialized
    def update_final_manifest(directory: str | Path, **updates: Any) -> dict[str, Any]:
        """Atomically update decision/export metadata of a finalized session only.

        The recording node uses this after it has released raw writers.  It must not
        rewrite active ``manifest.partial.json`` files, because that would race MCAP
        finalization.  Callers validate ``directory`` against their recording root.
        """
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("recording manifest must be a JSON object")
        payload.update(updates)
        atomic_json_write(final, payload)
        SessionStore._refresh_episode_index_async(final.parent.parent)
        return payload

    @staticmethod
    @_episode_serialized
    def adopt_final_session(directory: str | Path, *, requested_realtime_ns: int | None = None) -> dict[str, Any]:
        """Atomically make one clean READY session eligible for asynchronous export."""
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != SessionState.READY.value:
            raise RuntimeError("only READY recording sessions can be adopted")
        if payload.get("decision") != "PENDING":
            raise RuntimeError("recording session was already adopted or discarded")
        summary = payload.get("summary", {})
        if not isinstance(summary, dict) or int(summary.get("write_errors", 0)) != 0:
            raise RuntimeError("recording session has MCAP write errors and cannot be adopted")
        if int(summary.get("camera_write_errors", 0)) != 0:
            raise RuntimeError("recording session has camera write errors and cannot be adopted")
        payload.update(
            decision="ADOPTED",
            export={
                "state": "QUEUED",
                "requested_realtime_ns": _timestamp_or_now(
                    requested_realtime_ns, name="requested_realtime_ns"
                ),
            },
        )
        atomic_json_write(final, payload)
        return payload

    @staticmethod
    @_episode_serialized
    def discard_final_session(directory: str | Path, *, discarded_realtime_ns: int | None = None) -> dict[str, Any]:
        """Atomically discard one clean READY session without deleting raw artifacts."""
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != SessionState.READY.value:
            raise RuntimeError("only READY recording sessions can be discarded")
        export_state = (payload.get("export") or {}).get("state")
        decision = payload.get("decision")
        cancellable = decision == "ADOPTED" and export_state == "QUEUED"
        if decision != "PENDING" and not cancellable:
            raise RuntimeError("recording session was already adopted or discarded")
        payload.update(
            decision="DISCARDED",
            discarded_realtime_ns=_timestamp_or_now(
                discarded_realtime_ns, name="discarded_realtime_ns"
            ),
        )
        atomic_json_write(final, payload)
        return payload

    @staticmethod
    def hide_final_session(directory: str | Path, *, hidden_realtime_ns: int | None = None) -> dict[str, Any]:
        """Soft-delete one exported session without removing any raw artifacts."""
        return SessionStore._set_decision(directory, "DELETED", "hidden_realtime_ns", hidden_realtime_ns)

    @staticmethod
    def restore_final_session(directory: str | Path) -> dict[str, Any]:
        """Re-adopt one previously hidden exported session."""
        return SessionStore._set_decision(directory, "ADOPTED", None, None)

    @staticmethod
    @_episode_serialized
    def remove_final_session(directory: str | Path) -> None:
        """Permanently delete one finalized session directory and its raw artifacts.

        Unlike ``hide_final_session`` (soft delete), this removes the session
        directory — MCAP, manifest, receipt and videos — from disk. The corresponding
        episode in the exported LeRobot dataset is intentionally left untouched:
        re-indexing that dataset is a separate dataset-wide operation, not a
        per-session delete.
        """
        final = Path(directory).resolve()
        if not final.is_dir():
            raise ValueError("recording session does not exist")
        if not (final / "manifest.json").is_file():
            raise ValueError("recording session has no finalized manifest.json")
        shutil.rmtree(final)

    @staticmethod
    @_episode_serialized
    def update_task(directory: str | Path, task: str) -> dict[str, Any]:
        """Atomically relabel one successfully exported session's ``metadata.task``.

        Relabeling is a deliberate reviewer action on finalized data, so like
        ``hide``/``restore`` it only requires READY + a successful export.  The
        label is a nested ``metadata`` field, so the shallow top-level
        ``update_final_manifest`` must not be reused here.
        """
        if not isinstance(task, str) or not task.strip():
            raise ValueError("task must be a non-empty string")
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != "READY":
            raise RuntimeError("only READY recording sessions can be relabeled")
        export = payload.get("export") or {}
        if export.get("state") != "SUCCEEDED":
            raise RuntimeError("only successfully exported sessions can be relabeled")
        metadata = payload.setdefault("metadata", {})
        if not isinstance(metadata, dict):
            raise RuntimeError("recording metadata is malformed")
        metadata["task"] = task
        atomic_json_write(final, payload)
        return payload

    @staticmethod
    def _export_frame_count(directory: Path) -> int:
        """Read the exported frame count from the finalized v3 export receipt."""
        receipt_path = directory / "export" / "lerobot-v3.json"
        if not receipt_path.is_file():
            raise RuntimeError("recording session has no export receipt")
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        if not isinstance(receipt, dict) or not isinstance(receipt.get("frame_count"), int):
            raise RuntimeError("recording export receipt has no frame_count")
        return int(receipt["frame_count"])

    @staticmethod
    @_episode_serialized
    def update_subtasks(directory: str | Path, subtasks: list[dict[str, Any]]) -> dict[str, Any]:
        """Atomically annotate one successfully exported session with subtask segments.

        Subtask annotation is a deliberate reviewer action on finalized data, so like
        ``update_task`` it only requires READY + a successful export.  Segments are
        validated against the exported frame count before they replace any previous
        annotation; the empty list clears the annotation.
        """
        if not isinstance(subtasks, list):
            raise ValueError("subtasks must be a list of segments")
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != "READY":
            raise RuntimeError("only READY recording sessions can be subtask-annotated")
        export = payload.get("export") or {}
        if export.get("state") != "SUCCEEDED":
            raise RuntimeError("only successfully exported sessions can be subtask-annotated")
        frame_count = SessionStore._export_frame_count(final.parent)
        _validate_subtask_segments(subtasks, frame_count)
        payload["subtasks"] = subtasks
        atomic_json_write(final, payload)
        return payload

    @staticmethod
    @_episode_serialized
    def update_quality_intervals(
        directory: str | Path, intervals: Any, revision: Any, *, reasons: Iterable[str],
    ) -> dict[str, Any]:
        """Replace a finalized session's deviation intervals from a replay edit.

        ``revision`` must match the stored one (compare-and-set, like episode tags). An interval
        whose bounds and reason equal a stored live one stays ``live``; anything else becomes
        ``replay``, whatever the client sent.
        """
        from .quality_events import QualityConflict, quality_block, validate_intervals
        if type(revision) is not int or revision < 0:
            raise ValueError("revision must be a non-negative integer")
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("recording manifest must be a JSON object")
        quality = quality_block(payload)
        if quality["revision"] != revision:
            raise QualityConflict("deviation intervals changed in another editor; reload before saving")
        started = payload.get("started_realtime_ns")
        if type(started) is not int:
            raise ValueError("recording manifest has no started_realtime_ns")
        ended = payload.get("ended_realtime_ns")
        normalized = validate_intervals(
            intervals, start_ns=started, end_ns=ended if type(ended) is int else None, reasons=reasons,
        )
        live = {
            (item.get("start_ns"), item.get("end_ns"), item.get("reason"))
            for item in quality["intervals"]
            if isinstance(item, dict) and item.get("source") == "live"
        }
        for item in normalized:
            item["source"] = "live" if (item["start_ns"], item["end_ns"], item["reason"]) in live else "replay"
        quality.update(intervals=normalized, revision=revision + 1)
        payload["quality"] = quality
        atomic_json_write(final, payload)
        SessionStore._refresh_episode_index_async(final.parent.parent)
        return quality

    @staticmethod
    @_episode_serialized
    def _set_decision(
        directory: str | Path,
        decision: str,
        ts_field: str | None,
        ts_value: int | None,
    ) -> dict[str, Any]:
        """Flip the decision of a successfully exported READY session.

        Hiding and restoring are deliberate reviewer actions on finalized data, so
        unlike ``adopt``/``discard`` they do not require a PENDING or ADOPTED+QUEUED
        precondition: any successfully exported session may be hidden, and a hidden
        one is restored back to ADOPTED.  Files are never deleted.
        """
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != "READY":
            raise RuntimeError("only READY recording sessions can be hidden/restored")
        export = payload.get("export") or {}
        if export.get("state") != "SUCCEEDED":
            raise RuntimeError("only successfully exported sessions can be hidden/restored")
        payload["decision"] = decision
        if ts_field:
            payload[ts_field] = _timestamp_or_now(ts_value, name=ts_field)
        atomic_json_write(final, payload)
        return payload
