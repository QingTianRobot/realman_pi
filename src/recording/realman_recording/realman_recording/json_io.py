"""Durability helpers for the small JSON documents the recording subsystem persists.

``session_store``, the camera worker and the exporter all write JSON that must never
be observable in a half-written state: a crash that truncates a manifest, a
``media-index.json`` or an export marker would make the raw session unreadable or
ambiguous.  This module is the single stdlib-only implementation of that guarantee.
"""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any


def atomic_json_write(path: Path, payload: dict[str, Any]) -> None:
    """Durably replace a small JSON document without exposing a half-written file.

    The payload is written to a temporary file in the destination directory, flushed
    and ``fsync``-ed, then atomically renamed over ``path``.  A crash at any point
    leaves either the previous complete file or the new complete file, never a
    truncated intermediate.
    """
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", delete=False
        ) as stream:
            json.dump(payload, stream, ensure_ascii=False, indent=2, sort_keys=True)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
            temporary = Path(stream.name)
        os.replace(temporary, path)
    finally:
        # A full disk, permissions change, or injected replace failure can happen
        # after the temporary file is fsync-ed.  Never leave a misleading orphan
        # beside a session manifest; the previous destination remains untouched when
        # replace itself fails.
        if temporary is not None:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
