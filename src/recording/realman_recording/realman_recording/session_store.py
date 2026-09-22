"""Crash-conscious local session layout for recording-first recording.

This file owns only session directories and manifests.  It deliberately does not know
about ROS, cameras, WebSockets, or the RealMan SDK, so a failed preview/export can never
hold the durable recording state hostage.  All runtime data lives outside ``config/``.
"""
from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any

from .json_io import atomic_json_write


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
        self._write_partial()
        partial = self.session.directory / "manifest.partial.json"
        final = self.session.directory / "manifest.json"
        os.replace(partial, final)
        return final

    def _write_partial(self) -> None:
        assert self.session is not None and self._manifest is not None
        atomic_json_write(self.session.directory / "manifest.partial.json", self._manifest)

    @staticmethod
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
        return payload

    @staticmethod
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
        payload.update(
            decision="ADOPTED",
            export={"state": "QUEUED", "requested_realtime_ns": requested_realtime_ns or time.time_ns()},
        )
        atomic_json_write(final, payload)
        return payload

    @staticmethod
    def discard_final_session(directory: str | Path, *, discarded_realtime_ns: int | None = None) -> dict[str, Any]:
        """Atomically discard one clean READY session without deleting raw artifacts."""
        final = Path(directory).resolve() / "manifest.json"
        if not final.is_file():
            raise ValueError("recording session has no finalized manifest.json")
        payload = json.loads(final.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != SessionState.READY.value:
            raise RuntimeError("only READY recording sessions can be discarded")
        if payload.get("decision") != "PENDING":
            raise RuntimeError("recording session was already adopted or discarded")
        payload.update(
            decision="DISCARDED",
            discarded_realtime_ns=discarded_realtime_ns or time.time_ns(),
        )
        atomic_json_write(final, payload)
        return payload
