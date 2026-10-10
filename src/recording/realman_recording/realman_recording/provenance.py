"""Immutable source-file snapshots attached to a recording session."""
from __future__ import annotations

import shutil
from hashlib import sha256
from pathlib import Path


def snapshot_optional_file(
    source: str | Path, destination_dir: Path, filename: str, *, version: str = "",
) -> dict[str, str]:
    """Copy an optional configured fact source into session metadata with a hash.

    An empty source means the deployment has no authoritative file for this fact;
    callers must preserve that explicit state rather than inventing calibration data.
    A non-empty but missing source is configuration corruption and must stop the
    session before raw data is accepted.
    """
    if not str(source):
        return {"state": "UNAVAILABLE", "version": str(version)}
    candidate = Path(source).expanduser().resolve()
    if not candidate.is_file():
        raise ValueError(f"configured provenance source does not exist: {candidate}")
    if not filename or Path(filename).name != filename:
        raise ValueError("provenance filename must be a plain basename")
    destination_dir.mkdir(mode=0o750, parents=True, exist_ok=True)
    target = destination_dir / filename
    shutil.copy2(candidate, target)
    return {
        "state": "SNAPSHOT",
        "path": f"metadata/{filename}",
        "sha256": sha256(target.read_bytes()).hexdigest(),
        "version": str(version),
    }


def verify_optional_snapshot(session_dir: Path, record: object) -> None:
    """Verify a snapshot record before derived data uses its physical convention."""
    if not isinstance(record, dict):
        raise ValueError("snapshot provenance record must be an object")
    state = record.get("state")
    if state == "UNAVAILABLE":
        return
    if state != "SNAPSHOT":
        raise ValueError("snapshot provenance has an unknown state")
    relative, expected = record.get("path"), record.get("sha256")
    if not isinstance(relative, str) or not isinstance(expected, str):
        raise ValueError("snapshot provenance is missing path or hash")
    target = (session_dir / relative).resolve()
    root = session_dir.resolve()
    if root not in target.parents or not target.is_file():
        raise ValueError("snapshot provenance path is missing or escapes the session")
    if sha256(target.read_bytes()).hexdigest() != expected:
        raise ValueError("snapshot provenance hash does not match session data")
