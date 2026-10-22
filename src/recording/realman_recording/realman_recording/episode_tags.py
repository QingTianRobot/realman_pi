"""Episode tags and the rebuildable recording-root index.

The finalized manifest is authoritative.  This module never opens or rewrites
LeRobot media or SDK metadata.  Every read/modify/write is serialized across
the recorder and Web processes by a small recording-root file lock.
"""
from __future__ import annotations

import json
import math
import os
import re
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator

from .json_io import atomic_json_write

CORE = ("success", "arm", "date", "lighting_level")
RESERVED = set(CORE) | {"session_id", "dataset_path", "episode_index", "raw_session_path",
                        "recording_state", "decision", "export_state", "tag_sources", "revision",
                        "default_snapshot", "path_base", "complete"}
KEY_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_.-]{0,63}$")
SESSION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$")
INITIAL = {"success": True, "arm": None, "lighting_level": None}
SHANGHAI = timezone(timedelta(hours=8), "Asia/Shanghai")
_LOCAL_LOCK = threading.RLock()


class TagConflict(RuntimeError):
    """An editor submitted a stale revision."""


def validate_tags(tags: Any, *, defaults: bool = False) -> dict[str, Any]:
    if not isinstance(tags, dict) or len(tags) > 64:
        raise ValueError("tags must be an object with at most 64 keys")
    clean: dict[str, Any] = {}
    for key, value in tags.items():
        if not isinstance(key, str) or not KEY_RE.fullmatch(key) or key in RESERVED - set(CORE):
            raise ValueError(f"invalid or reserved tag key: {key!r}")
        if defaults and key == "date":
            raise ValueError("date is derived and cannot be a global default")
        if key == "success":
            if type(value) is not bool:
                raise ValueError("success must be true or false")
        elif key == "arm":
            if value not in (None, "left", "right", "both"):
                raise ValueError("arm must be left, right, both or null")
        elif key == "lighting_level":
            if value is not None and (type(value) is not int or value not in (1, 2, 3)):
                raise ValueError("lighting_level must be 1, 2, 3 or null")
        elif key == "date":
            if value is not None:
                if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                    raise ValueError("date must be YYYY-MM-DD or null")
                try:
                    datetime.strptime(value, "%Y-%m-%d")
                except ValueError as error:
                    raise ValueError("date is invalid") from error
        elif type(value) not in (str, bool, int, float, type(None)):
            raise ValueError("custom tag values must be string, boolean, number or null")
        if isinstance(value, str) and len(value) > 512:
            raise ValueError("tag value is too long")
        if type(value) is float and not math.isfinite(value):
            raise ValueError("tag number must be finite")
        clean[key] = value
    return clean


def apply_declared_types(tags: Any, types: Any) -> dict[str, Any]:
    """Preserve a user-selected float such as 2.0 across JavaScript JSON encoding."""
    if not isinstance(tags, dict) or not isinstance(types, dict) or not set(types).issubset(tags):
        raise ValueError("set_types must name keys in tags")
    values = dict(tags)
    for key, kind in types.items():
        value = values[key]
        if key in CORE:
            raise ValueError("set_types is only for custom tags")
        if kind == "float" and type(value) in (int, float):
            values[key] = float(value)
        elif kind == "int" and type(value) is int:
            pass
        elif kind == "bool" and type(value) is bool:
            pass
        elif kind == "string" and type(value) is str:
            pass
        elif kind == "null" and value is None:
            pass
        else:
            raise ValueError(f"declared type does not match {key}")
    return values


def tag_types(tags: dict[str, Any]) -> dict[str, str]:
    return {key: "null" if value is None else "bool" if type(value) is bool else
            "int" if type(value) is int else "float" if type(value) is float else "string"
            for key, value in tags.items() if key not in CORE}


def derived_date(manifest: dict[str, Any]) -> str | None:
    stamp = manifest.get("started_realtime_ns")
    if type(stamp) is not int or stamp <= 0:
        return None
    try:
        return datetime.fromtimestamp(stamp // 1_000_000_000, SHANGHAI).date().isoformat()
    except (OverflowError, OSError, ValueError):
        return None


@contextmanager
def _file_lock(root: Path) -> Iterator[None]:
    root.mkdir(parents=True, exist_ok=True)
    with _LOCAL_LOCK, (root / ".episode_tags.lock").open("a+b") as stream:
        stream.seek(0)
        stream.write(b"\0")
        stream.flush()
        if os.name == "nt":
            import msvcrt
            for _ in range(100):
                try:
                    stream.seek(0)
                    msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
                    break
                except OSError:
                    time.sleep(0.05)
            else:
                raise TimeoutError("episode tag lock is busy")
        else:
            import fcntl
            fcntl.flock(stream.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            if os.name == "nt":
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)


class EpisodeTagStore:
    def __init__(self, recording_root: str | Path):
        self.root = Path(recording_root).expanduser().resolve()

    def defaults(self) -> dict[str, Any]:
        path = self.root / "episode_tag_defaults.json"
        if not path.exists():
            return dict(INITIAL)
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("tag defaults file must contain an object")
        values = validate_tags(payload.get("tags"), defaults=True)
        if "success" not in values:
            raise ValueError("tag defaults file is missing success")
        return {**INITIAL, **values}

    def save_defaults(self, tags: Any, types: Any = None) -> dict[str, Any]:
        clean = validate_tags(apply_declared_types(tags, types or {}), defaults=True)
        if "success" not in clean:
            raise ValueError("success is required in defaults")
        with _file_lock(self.root):
            atomic_json_write(self.root / "episode_tag_defaults.json", {"schema_version": 1, "tags": {**INITIAL, **clean}})
            values = self.defaults()
            return {"tags": values, "tag_types": tag_types(values), **self._sync_result()}

    def _session(self, session_id: str) -> tuple[Path, dict[str, Any]]:
        if not isinstance(session_id, str) or not SESSION_RE.fullmatch(session_id):
            raise ValueError("invalid session id")
        directory = (self.root / session_id).resolve()
        if directory.parent != self.root or not directory.is_dir():
            raise ValueError("session does not exist")
        path = directory / "manifest.json"
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("session_id") != session_id:
            raise ValueError("finalized manifest is invalid")
        return path, payload

    def _state(self, manifest: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any], int]:
        state = manifest.get("episode_tags")
        if not isinstance(state, dict):
            state = {}
        snapshot = state.get("defaults")
        if not isinstance(snapshot, dict):
            snapshot = dict(INITIAL)
        snapshot = {**INITIAL, **validate_tags(snapshot, defaults=True)}
        manual = state.get("manual")
        manual = validate_tags(manual) if isinstance(manual, dict) else {}
        annotations = manifest.get("annotations")
        legacy = annotations.get("success") if isinstance(annotations, dict) else None
        if "success" not in manual and type(legacy) is bool and (
            not isinstance(manifest.get("episode_tags"), dict) or legacy != snapshot["success"]
        ):
            manual["success"] = legacy
        revision = state.get("revision", 0)
        return snapshot, manual, revision if type(revision) is int else 0

    def _effective(self, manifest: dict[str, Any]) -> dict[str, Any]:
        snapshot, manual, revision = self._state(manifest)
        tags = {**snapshot, "date": derived_date(manifest)}
        sources = {key: "default" for key in snapshot}
        sources["date"] = "derived"
        state = manifest.get("episode_tags") or {}
        removed = state.get("removed", []) if isinstance(state, dict) else []
        if isinstance(removed, list):
            for key in removed:
                if isinstance(key, str) and key not in CORE:
                    tags.pop(key, None)
                    sources.pop(key, None)
        tags.update(manual)
        sources.update({key: "manual" for key in manual})
        return {"tags": tags, "tag_sources": sources, "revision": revision,
                "complete": tags.get("arm") is not None and tags.get("lighting_level") is not None and tags.get("date") is not None}

    def get(self, session_id: str) -> dict[str, Any]:
        _, manifest = self._session(session_id)
        snapshot, _, _ = self._state(manifest)
        state = manifest.get("episode_tags") or {}
        removed = state.get("removed", []) if isinstance(state, dict) else []
        return {"session_id": session_id, **self._effective(manifest),
                "default_snapshot": snapshot, "removed": removed if isinstance(removed, list) else [],
                "tag_types": tag_types(self._effective(manifest)["tags"])}

    def update(self, session_id: str, revision: Any, changes: Any, reset: Any,
               delete: Any = None, types: Any = None) -> dict[str, Any]:
        if type(revision) is not int or revision < 0:
            raise ValueError("revision must be a non-negative integer")
        changes = validate_tags(apply_declared_types(changes, types or {}))
        if not isinstance(reset, list) or any(not isinstance(key, str) or not KEY_RE.fullmatch(key) for key in reset):
            raise ValueError("reset must be a list of tag keys")
        if len(reset) != len(set(reset)) or set(reset) & set(changes):
            raise ValueError("duplicate tag operation")
        delete = [] if delete is None else delete
        if not isinstance(delete, list) or any(not isinstance(key, str) or not KEY_RE.fullmatch(key) or key in RESERVED for key in delete):
            raise ValueError("delete must contain only custom tag keys")
        if len(delete) != len(set(delete)) or set(delete) & (set(reset) | set(changes)):
            raise ValueError("duplicate tag operation")
        with _file_lock(self.root):
            path, manifest = self._session(session_id)
            snapshot, manual, current = self._state(manifest)
            old_state = manifest.get("episode_tags") or {}
            removed = set(old_state.get("removed", [])) if isinstance(old_state, dict) else set()
            if current != revision:
                raise TagConflict("tags changed in another editor; reload before saving")
            for key in reset:
                manual.pop(key, None)
                removed.discard(key)
            for key in delete:
                manual.pop(key, None)
                removed.add(key)
            manual.update(changes)
            removed.difference_update(changes)
            manifest["episode_tags"] = {"defaults": snapshot, "manual": manual, "removed": sorted(removed), "revision": current + 1}
            annotations = manifest.get("annotations")
            if not isinstance(annotations, dict):
                annotations = {}
            annotations["success"] = self._effective(manifest)["tags"]["success"]
            manifest["annotations"] = annotations
            atomic_json_write(path, manifest)
            effective = self._effective(manifest)
            return {"session_id": session_id, **effective, "tag_types": tag_types(effective["tags"]),
                    **self._sync_result()}

    def snapshot(self, session_id: str) -> dict[str, Any]:
        """Bind current defaults once after finalization; safe to retry."""
        with _file_lock(self.root):
            path, manifest = self._session(session_id)
            if not isinstance(manifest.get("episode_tags"), dict):
                old_success = (manifest.get("annotations") or {}).get("success")
                manual = {"success": old_success} if type(old_success) is bool else {}
                manifest["episode_tags"] = {"defaults": self.defaults(), "manual": manual, "removed": [], "revision": 0}
                manifest.setdefault("annotations", {})["success"] = self._effective(manifest)["tags"]["success"]
                atomic_json_write(path, manifest)
            return self._sync_result()

    def backfill(self, *, dry_run: bool) -> dict[str, Any]:
        with _file_lock(self.root):
            defaults = self.defaults()
            changes: list[dict[str, Any]] = []
            for directory in sorted(self.root.iterdir()):
                if not directory.is_dir() or not SESSION_RE.fullmatch(directory.name) or not (directory / "manifest.json").is_file():
                    continue
                try:
                    path, manifest = self._session(directory.name)
                    snapshot, manual, revision = self._state(manifest)
                    removed = set((manifest.get("episode_tags") or {}).get("removed", []))
                    fields = {key: {"from": snapshot.get(key), "to": value} for key, value in defaults.items()
                              if key not in manual and key not in removed and snapshot.get(key) != value}
                    if not fields:
                        continue
                    changes.append({"session_id": directory.name, "fields": fields})
                    if not dry_run:
                        snapshot.update({key: value["to"] for key, value in fields.items()})
                        manifest["episode_tags"] = {"defaults": snapshot, "manual": manual, "removed": sorted(removed), "revision": revision + 1}
                        manifest.setdefault("annotations", {})["success"] = self._effective(manifest)["tags"]["success"]
                        atomic_json_write(path, manifest)
                except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
                    changes.append({"session_id": directory.name, "error": str(error)})
            result = {"affected": sum("fields" in item for item in changes), "changes": changes,
                      "errors": [item for item in changes if "error" in item], "dry_run": dry_run}
            return result if dry_run else {**result, **self._sync_result()}

    def _sync_result(self) -> dict[str, Any]:
        try:
            index = self._rebuild_unlocked()
            return {"meta_synced": True, "index_count": len(index["episodes"]), "errors": index["errors"]}
        except Exception as error:  # Manifest/default write has already succeeded.
            return {"meta_synced": False, "meta_error": str(error)}

    def rebuild(self) -> dict[str, Any]:
        with _file_lock(self.root):
            return self._rebuild_unlocked()

    def migrate_missing(self) -> dict[str, Any]:
        """Explicit, repeatable migration of legacy manifests; never touches media."""
        with _file_lock(self.root):
            defaults = self.defaults()
            migrated = 0
            errors: list[dict[str, str]] = []
            for directory in sorted(self.root.iterdir()):
                if not directory.is_dir() or not (directory / "manifest.json").is_file():
                    continue
                try:
                    path, manifest = self._session(directory.name)
                    if isinstance(manifest.get("episode_tags"), dict):
                        continue
                    legacy = (manifest.get("annotations") or {}).get("success")
                    manual = {"success": legacy} if type(legacy) is bool else {}
                    manifest["episode_tags"] = {"defaults": dict(defaults), "manual": manual, "removed": [], "revision": 0}
                    manifest.setdefault("annotations", {})["success"] = self._effective(manifest)["tags"]["success"]
                    atomic_json_write(path, manifest)
                    migrated += 1
                except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
                    errors.append({"session_id": directory.name, "error": str(error)})
            return {"migrated": migrated, "migration_errors": errors, **self._sync_result()}

    def _rebuild_unlocked(self) -> dict[str, Any]:
        episodes: list[dict[str, Any]] = []
        errors: list[dict[str, str]] = []
        seen: dict[tuple[str, int], str] = {}
        conflicted: set[str] = set()
        for directory in sorted(self.root.iterdir()):
            if not directory.is_dir() or directory.name.startswith(".") or not (directory / "manifest.json").exists():
                continue
            session_id = directory.name
            try:
                _, manifest = self._session(session_id)
                effective = self._effective(manifest)
                if effective["tags"]["date"] is None:
                    errors.append({"session_id": session_id, "error": "invalid or missing started_realtime_ns"})
                export = manifest.get("export") or {}
                export_state = export.get("state") if isinstance(export, dict) else None
                dataset_path = None
                episode_index = None
                if export_state == "SUCCEEDED":
                    receipt_path = directory / "export" / "lerobot-v3.json"
                    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
                    if not isinstance(receipt, dict):
                        raise ValueError("export receipt is invalid")
                    raw_root = receipt.get("dataset_root") or export.get("result")
                    if not isinstance(raw_root, str):
                        raise ValueError("export receipt has no dataset_root")
                    resolved = Path(raw_root).expanduser().resolve()
                    if not resolved.is_dir() or not resolved.is_relative_to(self.root):
                        raise ValueError("dataset_root is missing or outside recording_root")
                    dataset_path = resolved.relative_to(self.root).as_posix()
                    raw_index = receipt.get("episode_index")
                    if type(raw_index) is not int or raw_index < 0:
                        raise ValueError("export receipt has invalid episode_index")
                    episode_index = raw_index
                    identity = (dataset_path, episode_index)
                    if identity in seen:
                        first = seen[identity]
                        episodes = [item for item in episodes if item["session_id"] != first]
                        if first not in conflicted:
                            errors.append({"session_id": first, "error": "duplicate dataset_path and episode_index"})
                            conflicted.add(first)
                        raise ValueError("duplicate dataset_path and episode_index")
                    seen[identity] = session_id
                episodes.append({"session_id": session_id, "dataset_path": dataset_path,
                                 "episode_index": episode_index, "raw_session_path": session_id,
                                 "recording_state": manifest.get("state"), "decision": manifest.get("decision"),
                                 "export_state": export_state, "tags": effective["tags"],
                                 "tag_sources": effective["tag_sources"]})
            except (OSError, ValueError, TypeError, KeyError, json.JSONDecodeError) as error:
                errors.append({"session_id": session_id, "error": str(error)})
        index_path = self.root / "episode_meta.json"
        if index_path.is_file():
            try:
                previous = json.loads(index_path.read_text(encoding="utf-8"))
                if (isinstance(previous, dict) and previous.get("schema_version") == 1
                    and previous.get("path_base") == "." and previous.get("episodes") == episodes
                    and previous.get("errors") == errors):
                    return previous
            except (OSError, ValueError, TypeError, json.JSONDecodeError):
                pass
        result = {"schema_version": 1, "generated_at": datetime.now(timezone.utc).isoformat(),
                  "path_base": ".", "episodes": episodes, "errors": errors}
        atomic_json_write(index_path, result)
        return result
