"""Episode tags of a dataset: <dataset>/episode_tags.json.

A raw pull gets a snapshot of the recording's tag index (realman_ts <recording root>/episode_meta.json, written by
src/recording's EpisodeTagStore); cleaned sets and views get the same rows renumbered through their clean manifest
(views keep their source's numbering). Every reader checks the rows against the dataset (frames and task of every
episode), so tags never land on the wrong episode.
Design: docs/superpowers/specs/2026-10-23-training-episode-tags-design.md
"""

from __future__ import annotations

import datetime
import json
import os
from collections import Counter
from pathlib import Path

from .lerobot_io import read_episodes

FILE_NAME = "episode_tags.json"
SCHEMA_VERSION = 1
TASK_KEY = "task"  # filterable like a tag, but taken from the dataset itself


class TagsMismatch(ValueError):
    """episode_tags.json does not describe this dataset, or the recording no longer matches the copy."""


def tags_path(root: str | Path) -> Path:
    return Path(root) / FILE_NAME


def now_iso() -> str:
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def local_episodes(root: str | Path) -> dict[int, tuple[int, str | None]]:
    """Episode index -> (frames, task). A view stores prompts as tasks and two tasks may share a prompt, so a view's
    task is None: only its frames are checked (its rows come from its source, which is checked by task)."""
    root = Path(root)
    is_view = (root / "contract.json").is_file()
    return {e.index: (e.length, None if is_view else e.task) for e in read_episodes(root)}


def check(doc: dict, root: str | Path) -> None:
    local = local_episodes(root)
    rows = {int(row["episode_index"]): row for row in doc.get("episodes") or []}
    problems = []
    for index, (length, task) in sorted(local.items()):
        row = rows.get(index)
        if row is None:
            problems.append(f"{index}: missing")
        elif row.get("length") != length:
            problems.append(f"{index}: {row.get('length')} frames tagged, {length} in the dataset")
        elif task is not None and row.get("task") != task:
            problems.append(f"{index}: task {row.get('task')!r} tagged, {task!r} in the dataset")
    extra = sorted(set(rows) - set(local))
    if extra:
        problems.append(f"episodes {extra[:10]} are not in the dataset")
    if problems:
        raise TagsMismatch(f"{tags_path(root)} does not match the dataset ({len(problems)} problem(s), e.g. "
                           f"{'; '.join(problems[:5])}): run realman-train tags refresh")


def load(root: str | Path) -> dict | None:
    path = tags_path(root)
    if not path.is_file():
        return None
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as error:
        raise TagsMismatch(f"{path}: not JSON ({error})") from None
    version = doc.get("schema_version") if isinstance(doc, dict) else None
    if version != SCHEMA_VERSION:
        raise TagsMismatch(f"{path}: schema_version {version!r}, expected {SCHEMA_VERSION}")
    check(doc, root)
    return doc


def write(root: str | Path, doc: dict) -> Path:
    path = tags_path(root)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, path)
    return path


def from_remote(meta: dict, dataset_path: str, local: dict, remote: dict, *, origin: str) -> dict:
    """Rows for a local copy from the recording's tag index. local/remote: index -> (frames, task) of the copy and of
    the recording as it is now; a changed frame count or task means the recording was renumbered since the copy."""
    top = max(local, default=-1)
    rows: dict[int, dict] = {}
    for entry in meta.get("episodes") or []:
        index = entry.get("episode_index")
        if (entry.get("decision") != "ADOPTED" or entry.get("export_state") != "SUCCEEDED"
                or entry.get("dataset_path") != dataset_path or index is None or int(index) > top):
            continue  # not for training, another dataset, or recorded after this copy
        if int(index) in rows:
            raise TagsMismatch(f"episode {index} appears twice in the recording's tag index")
        rows[int(index)] = entry
    problems = []
    for index, (length, task) in sorted(local.items()):
        if index not in rows:
            problems.append(f"{index}: not in the tag index")
        elif tuple(remote.get(index) or ()) != (length, task):
            problems.append(f"{index}: {length} frames/{task} here, {remote.get(index)} on the recording")
    if problems:
        raise TagsMismatch(f"the recording's {dataset_path} no longer matches this copy ({len(problems)} problem(s), "
                           f"e.g. {'; '.join(problems[:5])})")
    return {
        "schema_version": SCHEMA_VERSION,
        "origin": origin,
        "dataset_path": dataset_path,
        "snapshot_at": now_iso(),
        "remote_generated_at": meta.get("generated_at"),
        "remote_errors": len(meta.get("errors") or []),
        "derived_from": None,
        "episodes": [
            {"episode_index": i, "session_id": rows[i].get("session_id"), "length": local[i][0], "task": local[i][1],
             "tags": dict(rows[i].get("tags") or {}), "tag_sources": dict(rows[i].get("tag_sources") or {})}
            for i in sorted(local)
        ],
    }


def remap(doc: dict, old_to_new: dict[int, int], derived_from: dict) -> dict:
    rows = {int(row["episode_index"]): row for row in doc["episodes"]}
    missing = sorted(set(old_to_new) - set(rows))
    if missing:
        raise TagsMismatch(f"the source's tags lack episodes {missing[:10]}")
    episodes = [{**rows[old], "episode_index": new} for old, new in sorted(old_to_new.items(), key=lambda kv: kv[1])]
    return {**doc, "derived_from": derived_from, "episodes": episodes}


def derive(source_doc: dict, root: str | Path, mapping: dict[int, int], *, source: str | Path, via: str) -> dict:
    """Tags for a cleaned set or view (root) from its source's tags, checked against root."""
    doc = remap(source_doc, mapping, {"path": str(source), "snapshot_at": source_doc.get("snapshot_at"),
                                      "via": via, "derived_at": now_iso()})
    check(doc, root)
    return doc


def value_text(value) -> str:
    """How a value is written in --where and shown in the console: true/false/null, numbers, plain text."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    return str(value)


def tag_keys(doc: dict) -> list[str]:
    return [TASK_KEY, *sorted({key for row in doc["episodes"] for key in row.get("tags") or {}})]


def episode_value(row: dict, key: str):
    """A missing custom key reads as null."""
    return row.get("task") if key == TASK_KEY else (row.get("tags") or {}).get(key)


def summary(doc: dict) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    for key in tag_keys(doc):
        slots: dict[str, dict] = {}
        for row in doc["episodes"]:
            value = episode_value(row, key)
            text = value_text(value)
            slot = slots.setdefault(text, {"value": value, "text": text, "count": 0, "sources": Counter()})
            slot["count"] += 1
            slot["sources"]["dataset" if key == TASK_KEY else (row.get("tag_sources") or {}).get(key, "missing")] += 1
        out[key] = sorted(({**s, "sources": dict(s["sources"])} for s in slots.values()),
                          key=lambda s: (-s["count"], s["text"]))
    return out


def _same(a, b) -> bool:
    return json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)  # keeps True and 1 apart


def changes(old: dict | None, new: dict) -> dict:
    if old is None:
        return {"episodes": 0, "keys": {}}
    before = {int(row["episode_index"]): row for row in old.get("episodes") or []}
    keys: Counter = Counter()
    episodes = 0
    for row in new["episodes"]:
        prev = before.get(int(row["episode_index"]))
        old_tags, new_tags = (prev or {}).get("tags") or {}, row.get("tags") or {}
        moved = [k for k in set(old_tags) | set(new_tags) if not _same(old_tags.get(k), new_tags.get(k))]
        if prev is None or moved:
            episodes += 1
        keys.update(moved)
    return {"episodes": episodes, "keys": dict(sorted(keys.items()))}


def payload(root: str | Path) -> dict | None:
    """What the console shows: None (no file), {"error"} (file does not match), or the rows and their summary."""
    try:
        doc = load(root)
    except TagsMismatch as error:
        return {"error": str(error)}
    if doc is None:
        return None
    return {
        "snapshot_at": doc.get("snapshot_at"),
        "derived_from": doc.get("derived_from"),
        "keys": tag_keys(doc),
        "summary": summary(doc),
        "episodes": {str(row["episode_index"]): {"tags": row.get("tags") or {}, "tag_sources": row.get("tag_sources") or {},
                                                 "session_id": row.get("session_id")} for row in doc["episodes"]},
    }
