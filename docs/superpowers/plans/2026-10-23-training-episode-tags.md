# Training Episode Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the recording platform's episode tags into the training pipeline: snapshot them on pull, refresh them later, carry them through clean/view, and let `clean` (CLI and :8780) select episodes by tag.

**Architecture:** A dependency-free module `realman_training/episode_tags.py` owns the `<dataset>/episode_tags.json` format: load-with-check, remote conversion, renumbering, `--where` parsing and selection, summaries. A new step module `steps/tags.py` talks to realman_ts (tag index under the recording platform's shared lock, plus the recording's own episode list to prove alignment) and derives tags for cleaned sets and views from their source. `pull`, `clean`, `view`, the CLI, `job_params`, `catalog`, `web_server` and the data page call into these two modules.

**Tech Stack:** Python 3.10, pyarrow, aiohttp, pytest; TypeScript + Vite (training console UI), Playwright.

Spec: `docs/superpowers/specs/2026-10-23-training-episode-tags-design.md`.

## Global Constraints

- Work in the worktree `/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/4d87d63d-ef99-4a1f-9306-ac5b4be58ca4/scratchpad/wt-tags`, branch `feat/training-episode-tags` (based on the deployed console commit `f85f3d16`, which already contains PR #63 and #64).
- No new Python dependencies: only `pytest pyyaml numpy aiohttp pyarrow` (what CI installs). CI runs Python 3.10.
- Tags are read-only on the training side; nothing in this plan writes to realman_ts.
- Exported LeRobot files (Parquet, MP4, `meta/info.json`) are never rewritten; the only new file in a dataset is `episode_tags.json`, written atomically (temp file + `os.replace`).
- Only rows with `decision == "ADOPTED"`, `export_state == "SUCCEEDED"`, the dataset's `dataset_path` and a non-null `episode_index` are used (the recording platform README's rule for training).
- `--where key=v1,v2` may repeat: different keys AND, values of one key OR. Values parse by the key's type (`true`/`false`, integers, `null`, otherwise exact text).
- `--keep` and `--where` are mutually exclusive; `--where` combines with `--drop`/`--suggested` as a union of drops.
- The committed console bundle (`src/training/realman_training/realman_training/static`) must match the sources (CI checks `git diff --exit-code` after `npm run build:training`).
- Docs are part of the feature (Chinese, `website/docs/development/`). No private IPs, hostnames beyond ssh aliases, or tokens in docs/config.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (check the trailer: earlier subagents wrote their own model name).

## Test setup (used by every task)

```bash
WT=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/4d87d63d-ef99-4a1f-9306-ac5b4be58ca4/scratchpad/wt-tags
PY=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/4d87d63d-ef99-4a1f-9306-ac5b4be58ca4/scratchpad/venv310/bin/python
# If $PY is missing: uv venv --python 3.10 <scratchpad>/venv310 && VIRTUAL_ENV=<scratchpad>/venv310 uv pip install pytest pyyaml numpy aiohttp pyarrow
cd $WT/src/training/realman_training
PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider      # baseline before Task 1: 345 passed, 2 skipped
```

Run single files with `PYTHONPATH=. $PY -m pytest -q test/<file>.py -p no:cacheprovider` from the same directory.

## File Structure

| File | Responsibility |
|---|---|
| `realman_training/episode_tags.py` (new) | `episode_tags.json` format: load/check/write, `from_remote`, `remap`/`derive`, `parse_where`/`select`/`unseen`, `summary`, `changes`, `payload` |
| `realman_training/steps/tags.py` (new) | realman_ts reads (tag index, recording episode list), `refresh` job, `status` check, source chain |
| `realman_training/datasets.py` | public `clean_manifest_path`/`read_clean_manifest` (was private `_manifest`) |
| `realman_training/config.py`, `config/training/training_console.yaml` | `remote.tags_root` |
| `realman_training/jobs.py` | `tags_refresh` job kind |
| `realman_training/steps/pull.py` | snapshot tags into the pull |
| `realman_training/steps/clean.py` | `where`, union of drops, manifest fields, tags into the new set |
| `realman_training/steps/view.py` | tags into the view |
| `realman_training/cli.py` | `clean --where`, `tags refresh/status`, tag lines in `inspect` |
| `realman_training/catalog.py`, `job_params.py`, `web_server.py` | `/api/dataset` tags, `/api/dataset/select`, `/api/dataset/tags-status`, `tags_refresh` and `clean.where` jobs |
| `web/src/api.ts`, `web/src/pages/data.ts`, `web/src/style.css`, `realman_training/static/` | tag facet, tag column, tag filter, refresh/check buttons; rebuilt bundle |
| `test/lerobot_fixture.py`, `test/console_fixture.py`, `test/web_fake_steps.py`, `test/web_server tests`, `website/tests/training-console/console.spec.ts` | fixtures and tests |
| `website/docs/development/{training-cli-walkthrough,training-console-web,recording-platform}.md` | docs |

---

### Task 1: The tag file (`episode_tags.py` core)

**Files:**
- Create: `src/training/realman_training/realman_training/episode_tags.py`
- Modify: `src/training/realman_training/test/lerobot_fixture.py` (add `write_tags`, `tag_index`; `write_clean_manifest` gets `old_to_new`)
- Test: `src/training/realman_training/test/test_episode_tags.py` (new)

**Interfaces:**
- Consumes: `lerobot_io.read_episodes(root) -> list[EpisodeRow]` (`.index`, `.length`, `.task`).
- Produces (later tasks use exactly these):
  - `FILE_NAME = "episode_tags.json"`, `SCHEMA_VERSION = 1`, `TASK_KEY = "task"`
  - `class TagsMismatch(ValueError)`
  - `tags_path(root) -> Path`, `now_iso() -> str`
  - `local_episodes(root) -> dict[int, tuple[int, str | None]]` (view → task `None`)
  - `check(doc: dict, root) -> None` (raises `TagsMismatch`)
  - `load(root) -> dict | None`, `write(root, doc) -> Path`
  - `from_remote(meta: dict, dataset_path: str, local: dict, remote: dict, *, origin: str) -> dict`
  - `remap(doc, old_to_new: dict[int, int], derived_from: dict) -> dict`
  - `derive(source_doc, root, mapping: dict[int, int], *, source, via: str) -> dict`
  - `value_text(value) -> str`, `tag_keys(doc) -> list[str]`, `episode_value(row, key)`
  - `summary(doc) -> dict[str, list[dict]]` (each item `{"value","text","count","sources"}`)
  - `changes(old: dict | None, new: dict) -> {"episodes": int, "keys": dict[str, int]}`
  - `payload(root) -> None | {"error": str} | {"snapshot_at","derived_from","keys","summary","episodes"}`
  - Fixture helpers: `write_tags(root, tags: list[dict], *, sources: list[dict] | None = None, snapshot_at="2026-10-23T09:30:00+08:00") -> Path`, `tag_index(root, tags: list[dict], *, dataset_path=None) -> dict`, `write_clean_manifest(root, *, source, removed, old_to_new=None)`

- [ ] **Step 1: Add the fixture helpers**

Append to `test/lerobot_fixture.py` (it already imports `json` and `Path`; check the top and add `import json` if missing):

```python
def write_tags(root: Path, tags: list[dict], *, sources: list[dict] | None = None,
               snapshot_at: str = "2026-10-23T09:30:00+08:00") -> Path:
    """episode_tags.json for a fixture dataset: one tags dict per episode; frames and task come from the dataset.
    tag_sources default to "manual" for every given key."""
    from realman_training.lerobot_io import read_episodes

    rows = read_episodes(root)
    assert len(rows) == len(tags), "one tags dict per episode"
    doc = {
        "schema_version": 1, "origin": "fixture", "dataset_path": f"lerobot/{Path(root).name}",
        "snapshot_at": snapshot_at, "remote_generated_at": None, "remote_errors": 0, "derived_from": None,
        "episodes": [
            {"episode_index": r.index, "session_id": f"S{r.index:03d}", "length": r.length, "task": r.task,
             "tags": dict(t), "tag_sources": dict(sources[r.index]) if sources else {k: "manual" for k in t}}
            for r, t in zip(rows, tags)
        ],
    }
    path = Path(root) / "episode_tags.json"
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def tag_index(root: Path, tags: list[dict], *, dataset_path: str | None = None) -> dict:
    """The recording platform's episode_meta.json for a fixture dataset (every episode adopted and exported)."""
    from realman_training.lerobot_io import read_episodes

    rows = read_episodes(root)
    return {
        "schema_version": 1, "generated_at": "2026-10-23T01:09:02+00:00", "path_base": ".", "errors": [],
        "episodes": [
            {"session_id": f"S{r.index:03d}", "episode_index": r.index, "decision": "ADOPTED",
             "export_state": "SUCCEEDED", "dataset_path": dataset_path or f"lerobot/{Path(root).name}",
             "raw_session_path": f"S{r.index:03d}", "recording_state": "READY",
             "tags": dict(t), "tag_sources": {k: "manual" for k in t}}
            for r, t in zip(rows, tags)
        ],
    }
```

Replace `write_clean_manifest` with:

```python
def write_clean_manifest(root: Path, *, source: str, removed: dict[int, str],
                         old_to_new: dict[int, int] | None = None) -> Path:
    """The manifest drop_episodes.py writes next to the cleaned directory (<dir>.clean_manifest.json)."""
    path = Path(f"{root}.clean_manifest.json")
    manifest = {"source": source, "removed": {str(e): {"frames": 1, "reason": r} for e, r in removed.items()}}
    if old_to_new is not None:
        manifest["old_to_new"] = {str(k): v for k, v in old_to_new.items()}
    path.write_text(json.dumps(manifest))
    return path
```

- [ ] **Step 2: Write the failing tests**

Create `test/test_episode_tags.py`:

```python
from __future__ import annotations

import json

import pytest
from lerobot_fixture import Episode, build_dataset, build_view, gripper, tag_index, write_tags

from realman_training import episode_tags
from realman_training.episode_tags import TagsMismatch

TAGS = [
    {"success": True, "arm": "right", "lighting_level": 2},
    {"success": False, "arm": "right", "lighting_level": 2, "failure_reason": "re-grasp"},
    {"success": True, "arm": "right", "lighting_level": 1},
]
DATASET_PATH = "lerobot/realman__pi05-three-arm"


@pytest.fixture()
def raw(tmp_path):
    return build_dataset(tmp_path / "raw" / "realman__pi05-three-arm", [
        Episode("pick_and_place", gripper((50, 40), (5700, 60), (50, 40))),  # 140 frames
        Episode("pick_only", gripper((50, 40), (5700, 50))),                 # 90 frames
        Episode("pick_only", gripper((50, 30), (5700, 30))),                 # 60 frames
    ])


def _edit(raw, change):
    doc = json.loads(episode_tags.tags_path(raw).read_text())
    change(doc)
    episode_tags.write(raw, doc)


def test_no_file_is_none(raw):
    assert episode_tags.load(raw) is None
    assert episode_tags.payload(raw) is None


def test_load_checks_frames_task_and_extra_rows(raw):
    write_tags(raw, TAGS)
    assert [r["episode_index"] for r in episode_tags.load(raw)["episodes"]] == [0, 1, 2]
    _edit(raw, lambda d: d["episodes"][1].update(length=91))
    with pytest.raises(TagsMismatch, match="1: 91 frames tagged, 90 in the dataset"):
        episode_tags.load(raw)
    write_tags(raw, TAGS)
    _edit(raw, lambda d: d["episodes"][2].update(task="pick_and_place"))
    with pytest.raises(TagsMismatch, match="task 'pick_and_place' tagged"):
        episode_tags.load(raw)
    write_tags(raw, TAGS)
    _edit(raw, lambda d: d["episodes"].append({**d["episodes"][2], "episode_index": 3}))
    with pytest.raises(TagsMismatch, match=r"episodes \[3\] are not in the dataset"):
        episode_tags.load(raw)
    write_tags(raw, TAGS)
    _edit(raw, lambda d: d.update(schema_version=2))
    with pytest.raises(TagsMismatch, match="schema_version"):
        episode_tags.load(raw)


def test_write_is_atomic_and_leaves_no_temp_file(raw):
    write_tags(raw, TAGS)
    doc = episode_tags.load(raw)
    episode_tags.write(raw, doc)
    assert not (raw / "episode_tags.json.tmp").exists()
    assert episode_tags.load(raw) == doc


def test_from_remote_keeps_only_adopted_exported_rows_of_this_dataset(raw):
    local = episode_tags.local_episodes(raw)
    meta = tag_index(raw, TAGS)
    meta["episodes"].append({"session_id": "X", "episode_index": None, "decision": "ADOPTED",
                             "export_state": "FAILED", "dataset_path": None, "tags": {}})
    meta["episodes"].append({"session_id": "late", "episode_index": 3, "decision": "ADOPTED",
                             "export_state": "SUCCEEDED", "dataset_path": DATASET_PATH, "tags": {}})
    meta["episodes"].append({"session_id": "other", "episode_index": 0, "decision": "ADOPTED",
                             "export_state": "SUCCEEDED", "dataset_path": "lerobot/other", "tags": {}})
    doc = episode_tags.from_remote(meta, DATASET_PATH, local, local, origin="o")
    assert [r["episode_index"] for r in doc["episodes"]] == [0, 1, 2]
    assert doc["episodes"][1]["tags"]["failure_reason"] == "re-grasp"
    assert (doc["episodes"][1]["length"], doc["episodes"][1]["task"]) == (90, "pick_only")
    assert doc["remote_generated_at"] == "2026-10-23T01:09:02+00:00" and doc["derived_from"] is None
    episode_tags.write(raw, doc)
    assert episode_tags.load(raw) is not None


def test_from_remote_refuses_a_renumbered_recording_or_missing_rows(raw):
    local = episode_tags.local_episodes(raw)
    with pytest.raises(TagsMismatch, match="no longer matches"):
        episode_tags.from_remote(tag_index(raw, TAGS), DATASET_PATH, local, {**local, 1: (77, "pick_only")}, origin="o")
    meta = tag_index(raw, TAGS)
    del meta["episodes"][2]
    with pytest.raises(TagsMismatch, match="2: not in the tag index"):
        episode_tags.from_remote(meta, DATASET_PATH, local, local, origin="o")


def test_remap_renumbers_and_derive_checks_against_the_target(raw, tmp_path):
    write_tags(raw, TAGS)
    doc = episode_tags.load(raw)
    new = episode_tags.remap(doc, {0: 0, 2: 1}, {"path": str(raw)})
    assert [(r["episode_index"], r["session_id"]) for r in new["episodes"]] == [(0, "S000"), (1, "S002")]
    assert new["derived_from"] == {"path": str(raw)} and new["snapshot_at"] == doc["snapshot_at"]
    with pytest.raises(TagsMismatch, match="lack episodes"):
        episode_tags.remap(doc, {5: 0}, {})
    clean = build_dataset(tmp_path / "clean", [
        Episode("pick_and_place", gripper((50, 40), (5700, 60), (50, 40))),
        Episode("pick_only", gripper((50, 30), (5700, 30))),
    ])
    derived = episode_tags.derive(doc, clean, {0: 0, 2: 1}, source=raw, via="m.json")
    assert derived["derived_from"]["path"] == str(raw) and derived["derived_from"]["via"] == "m.json"
    with pytest.raises(TagsMismatch):
        episode_tags.derive(doc, clean, {0: 0, 1: 1}, source=raw, via="m.json")  # 90 frames vs 60


def test_a_views_tasks_are_not_checked(raw, tmp_path):
    view = build_view(tmp_path / "view", source=str(raw), prompts={"pick_and_place": "put", "pick_only": "pick"},
                      lengths=[140, 90, 60], tasks=["pick_and_place", "pick_only", "pick_only"])
    assert {task for _, task in episode_tags.local_episodes(view).values()} == {None}


def test_summary_counts_values_and_sources(raw):
    write_tags(raw, TAGS, sources=[{"success": "default"}, {"success": "manual"}, {"success": "default"}])
    s = episode_tags.summary(episode_tags.load(raw))
    assert list(s) == ["task", "arm", "failure_reason", "lighting_level", "success"]
    assert s["success"] == [
        {"value": True, "text": "true", "count": 2, "sources": {"default": 2}},
        {"value": False, "text": "false", "count": 1, "sources": {"manual": 1}},
    ]
    assert [(v["text"], v["count"]) for v in s["failure_reason"]] == [("null", 2), ("re-grasp", 1)]
    assert [(v["text"], v["count"]) for v in s["task"]] == [("pick_only", 2), ("pick_and_place", 1)]
    assert s["task"][0]["sources"] == {"dataset": 2}


def test_changes_counts_episodes_and_keys(raw):
    write_tags(raw, TAGS)
    old = episode_tags.load(raw)
    new = json.loads(json.dumps(old))
    new["episodes"][0]["tags"]["success"] = False
    new["episodes"][2]["tags"]["lighting_level"] = 2
    assert episode_tags.changes(old, new) == {"episodes": 2, "keys": {"lighting_level": 1, "success": 1}}
    assert episode_tags.changes(old, old) == {"episodes": 0, "keys": {}}
    assert episode_tags.changes(None, new) == {"episodes": 0, "keys": {}}
    new["episodes"][1]["tags"]["lighting_level"] = True  # True == 1 in Python, not here
    assert episode_tags.changes(old, new)["keys"]["lighting_level"] == 2


def test_payload_for_the_console(raw):
    write_tags(raw, TAGS)
    p = episode_tags.payload(raw)
    assert p["keys"][0] == "task" and p["episodes"]["1"]["tags"]["success"] is False
    assert p["episodes"]["1"]["session_id"] == "S001" and p["snapshot_at"] == "2026-10-23T09:30:00+08:00"
    _edit(raw, lambda d: d["episodes"][0].update(length=1))
    assert "does not match" in episode_tags.payload(raw)["error"]
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_episode_tags.py -p no:cacheprovider`
Expected: collection error `ImportError: cannot import name 'episode_tags'`.

- [ ] **Step 4: Write `episode_tags.py`**

```python
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_episode_tags.py -p no:cacheprovider`
Expected: all pass. Then the whole suite: `PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider` → 345 + the new ones passed, 2 skipped (the `write_clean_manifest` change must not break `test_catalog`/`test_datasets`).

- [ ] **Step 6: Commit**

```bash
git add src/training/realman_training/realman_training/episode_tags.py src/training/realman_training/test/test_episode_tags.py src/training/realman_training/test/lerobot_fixture.py
git commit -m "feat(training): episode_tags.json format with per-episode alignment checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `--where` parsing and selection

**Files:**
- Modify: `src/training/realman_training/realman_training/episode_tags.py` (append)
- Test: `src/training/realman_training/test/test_episode_tags.py` (append)

**Interfaces:**
- Consumes: Task 1 (`tag_keys`, `episode_value`, `value_text`).
- Produces: `parse_where(items: list[str], doc) -> dict[str, list]` (raises `ValueError`), `matches(value, wanted) -> bool`, `select(doc, where) -> dict[int, str]` (dropped episode -> reason), `unseen(doc, where) -> list[str]` (`"key=value"` texts no episode has).
  Reason format: `tag success=false (<failure_reason>)` when the failing key is `success` and the episode has a `failure_reason`; otherwise `tag <key>=<value> not in {<v1>, <v2>}`; several failing keys joined with `; `.

- [ ] **Step 1: Write the failing tests** (append to `test/test_episode_tags.py`)

```python
def _doc(raw):
    write_tags(raw, TAGS)
    return episode_tags.load(raw)


def test_where_parses_values_by_the_tags_type(raw):
    doc = _doc(raw)
    where = episode_tags.parse_where(["success=true", "lighting_level=1,2", "arm=right", "task=pick_only"], doc)
    assert where == {"success": [True], "lighting_level": [1, 2], "arm": ["right"], "task": ["pick_only"]}
    assert episode_tags.parse_where(["failure_reason=null"], doc) == {"failure_reason": [None]}
    assert episode_tags.parse_where([" arm = right , left "], doc) == {"arm": ["right", "left"]}


@pytest.mark.parametrize("items, fragment", [
    (["success"], "key=v1,v2"),
    (["colour=red"], "unknown tag 'colour'"),
    (["success=yes"], "true/false"),
    (["lighting_level=bright"], "is a number"),
    (["success=true", "success=false"], "given twice"),
    (["arm="], "no values"),
])
def test_where_refuses_bad_items(raw, items, fragment):
    with pytest.raises(ValueError, match=fragment):
        episode_tags.parse_where(items, _doc(raw))


def test_select_keeps_matches_and_explains_drops(raw):
    doc = _doc(raw)
    assert episode_tags.select(doc, episode_tags.parse_where(["success=true"], doc)) == {1: "tag success=false (re-grasp)"}
    assert episode_tags.select(doc, episode_tags.parse_where(["lighting_level=2", "task=pick_only"], doc)) == {
        0: "tag task=pick_and_place not in {pick_only}",
        2: "tag lighting_level=1 not in {2}",
    }
    assert episode_tags.select(doc, episode_tags.parse_where(["success=true", "lighting_level=1"], doc)) == {
        0: "tag lighting_level=2 not in {1}",
        1: "tag success=false (re-grasp); tag lighting_level=2 not in {1}",
    }
    assert episode_tags.select(doc, {}) == {}


def test_booleans_and_integers_do_not_mix(raw):
    doc = _doc(raw)
    for row in doc["episodes"]:
        row["tags"]["flag"] = 1
    assert episode_tags.parse_where(["flag=1"], doc) == {"flag": [1]}
    assert episode_tags.select(doc, {"flag": [1]}) == {}
    assert len(episode_tags.select(doc, {"flag": [True]})) == 3


def test_unseen_values_are_listed(raw):
    doc = _doc(raw)
    where = episode_tags.parse_where(["lighting_level=3,2", "arm=left"], doc)
    assert episode_tags.unseen(doc, where) == ["lighting_level=3", "arm=left"]
```

- [ ] **Step 2: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_episode_tags.py -p no:cacheprovider`
Expected: the new tests fail with `AttributeError: module 'realman_training.episode_tags' has no attribute 'parse_where'`.

- [ ] **Step 3: Append the implementation to `episode_tags.py`**

```python
def _kind(doc: dict, key: str) -> str:
    if key == TASK_KEY:
        return "str"
    types = {type(v) for row in doc["episodes"] if (v := (row.get("tags") or {}).get(key)) is not None}
    if types == {bool}:
        return "bool"
    if types == {int}:
        return "int"
    if types and types <= {int, float}:
        return "number"
    return "str"


def _parse(text: str, kind: str, key: str):
    if text == "null":
        return None
    if kind == "bool":
        if text not in ("true", "false"):
            raise ValueError(f"{key} is true/false, got {text!r}")
        return text == "true"
    if kind in ("int", "number"):
        try:
            return int(text) if kind == "int" else float(text)
        except ValueError:
            raise ValueError(f"{key} is a number, got {text!r}") from None
    return text


def matches(value, wanted) -> bool:
    if wanted is None or value is None:
        return value is None and wanted is None
    if isinstance(wanted, str):
        return value_text(value) == wanted
    if isinstance(wanted, bool) or isinstance(value, bool):
        return type(value) is type(wanted) and value == wanted
    return value == wanted


def parse_where(items: list[str], doc: dict) -> dict[str, list]:
    """["k=v1,v2", ...] -> {k: [values]}: keys AND, values of one key OR."""
    keys = tag_keys(doc)
    where: dict[str, list] = {}
    for item in items:
        key, sep, text = str(item).partition("=")
        key = key.strip()
        if not sep or not key:
            raise ValueError(f"where wants key=v1,v2, got {item!r}")
        if key not in keys:
            raise ValueError(f"unknown tag {key!r}; known: {', '.join(keys)}")
        if key in where:
            raise ValueError(f"{key} is given twice: list its values once, {key}=a,b")
        values = [v.strip() for v in text.split(",") if v.strip()]
        if not values:
            raise ValueError(f"{key}= has no values")
        kind = _kind(doc, key)
        where[key] = [_parse(v, kind, key) for v in values]
    return where


def select(doc: dict, where: dict[str, list]) -> dict[int, str]:
    """Episodes that fail the filter -> why."""
    dropped: dict[int, str] = {}
    for row in doc["episodes"]:
        reasons = []
        for key, wanted in where.items():
            value = episode_value(row, key)
            if any(matches(value, w) for w in wanted):
                continue
            failure = (row.get("tags") or {}).get("failure_reason")
            if key == "success" and failure:
                reasons.append(f"tag success={value_text(value)} ({failure})")
            else:
                reasons.append(f"tag {key}={value_text(value)} not in {{{', '.join(value_text(w) for w in wanted)}}}")
        if reasons:
            dropped[int(row["episode_index"])] = "; ".join(reasons)
    return dropped


def unseen(doc: dict, where: dict[str, list]) -> list[str]:
    out = []
    for key, wanted in where.items():
        present = [episode_value(row, key) for row in doc["episodes"]]
        out += [f"{key}={value_text(w)}" for w in wanted if not any(matches(v, w) for v in present)]
    return out
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_episode_tags.py -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/episode_tags.py src/training/realman_training/test/test_episode_tags.py
git commit -m "feat(training): --where filter on episode tags (keys AND, values OR)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Reading tags from realman_ts (`steps/tags.py`, pull snapshot, config, job kind)

**Files:**
- Create: `src/training/realman_training/realman_training/steps/tags.py`
- Modify: `src/training/realman_training/realman_training/config.py` (`RemoteConfig.tags_root`)
- Modify: `config/training/training_console.yaml` (`remote.tags_root`)
- Modify: `src/training/realman_training/realman_training/datasets.py` (`_manifest` -> public `clean_manifest_path`/`read_clean_manifest`)
- Modify: `src/training/realman_training/realman_training/jobs.py` (`STEPS["tags_refresh"]`)
- Modify: `src/training/realman_training/realman_training/steps/pull.py`
- Test: `src/training/realman_training/test/test_tags_step.py` (new), `src/training/realman_training/test/test_pull.py`

**Interfaces:**
- Consumes: Task 1 (`local_episodes`, `from_remote`, `derive`, `load`, `write`, `changes`, `summary`, `tags_path`, `TagsMismatch`, `FILE_NAME`); `steps.pull.remote(config: RemoteConfig, argv) -> list[str]`; `Runner.check(argv, timeout=)`, `Runner.pipe(producer, consumer, on_bytes)`.
- Produces:
  - `RemoteConfig.tags_root: str = "/data/realman-recordings"`
  - `datasets.clean_manifest_path(root) -> Path | None`, `datasets.read_clean_manifest(root) -> dict | None`
  - `steps.tags.dataset_path(config: RemoteConfig, dataset: str) -> str`
  - `steps.tags.read_index(config: RemoteConfig, runner, *, timeout: float | None = None) -> dict`
  - `steps.tags.read_remote_episodes(config: RemoteConfig, dataset: str, runner) -> dict[int, tuple[int, str]]`
  - `steps.tags.remote_doc(config: RemoteConfig, root: Path, runner, *, remote_episodes=None, timeout=None) -> dict`
  - `steps.tags.kind_of(root: Path) -> tuple[str, Path | None, dict | None]` (`"raw" | "clean" | "view"`, source, manifest)
  - `steps.tags.derived_doc(root: Path) -> dict`
  - `steps.tags.refresh(params: {"path", "config"?}, log, runner=None) -> {"path","kind","episodes","snapshot_at","changed","previous"}` (job target `tags_refresh`)
  - `steps.tags.status(config: ConsoleConfig, root, runner, *, timeout=None) -> {"state": "current"|"changed"|"no_tags"|"unknown"|"error", "raw"?, "snapshot_at"?, "episodes_changed"?, "keys"?, "error"?}`
  - `pull.run` result gains `"tags_episodes"`; `pull.json` gains `"tags_snapshot_at"`.

- [ ] **Step 1: Config, manifest helper, job kind**

In `config.py`, `RemoteConfig`, after `lock_wait_sec`:

```python
    tags_root: str = "/data/realman-recordings"  # inside the container: episode_meta.json + .episode_tags.lock
```

In `config/training/training_console.yaml`, under `remote:` after `lock_wait_sec`:

```yaml
    # The recording platform's tag index (episode_meta.json) and its lock; recording_root must lie under it.
    tags_root: /data/realman-recordings
```

In `datasets.py`, replace `_manifest` with:

```python
def clean_manifest_path(root: Path) -> Path | None:
    for path in (Path(f"{root}.clean_manifest.json"), Path(root) / "clean_manifest.json"):
        if path.is_file():
            return path
    return None


def read_clean_manifest(root: Path) -> dict | None:
    path = clean_manifest_path(root)
    return json.loads(path.read_text(encoding="utf-8")) if path else None
```

and in `summarize()` change `manifest = None if contract else _manifest(root)` to `manifest = None if contract else read_clean_manifest(root)`.

In `jobs.py` `STEPS`, add after `"linkcheck"`:

```python
    "tags_refresh": "realman_training.steps.tags:refresh",
```

- [ ] **Step 2: Write the failing step tests**

Create `test/test_tags_step.py`:

```python
from __future__ import annotations

import json
import shlex
import subprocess

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, build_view, gripper, tag_index, write_clean_manifest, write_tags

from realman_training import episode_tags
from realman_training.config import RemoteConfig, load_config
from realman_training.jobs import StepFailed
from realman_training.steps import tags

REMOTE = RemoteConfig()
TAGS = [
    {"success": True, "arm": "right", "lighting_level": 2},
    {"success": False, "arm": "right", "lighting_level": 2, "failure_reason": "re-grasp"},
    {"success": True, "arm": "right", "lighting_level": 1},
]
EPISODES = [
    Episode("pick_and_place", gripper((50, 40), (5700, 60), (50, 40))),
    Episode("pick_only", gripper((50, 40), (5700, 50))),
    Episode("pick_only", gripper((50, 30), (5700, 30))),
]


@pytest.fixture()
def raw(tmp_path):
    return build_dataset(tmp_path / "data" / "raw_x" / REMOTE.dataset, EPISODES)


def fake_robot(recording, meta) -> FakeRunner:
    """Answers the tag index read and runs the remote tar of the recording's meta locally against `recording`."""
    runner = FakeRunner().on("episode_meta.json", stdout=json.dumps(meta))
    source = f"{REMOTE.recording_root}/{recording.name}"

    def pipe_impl(producer, consumer, on_bytes):
        inner = shlex.split(producer[-1])
        assert inner[:3] == ["docker", "exec", REMOTE.recording_container]
        argv = inner[3:]
        assert argv[:5] == ["flock", "-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.recording_root}/.{recording.name}.lock"]
        argv = [str(recording) if a == source else a for a in argv[5:]]
        data = subprocess.run(argv, capture_output=True, check=True).stdout
        subprocess.run(consumer, input=data, check=True)
        on_bytes(len(data))
        return len(data)

    runner.pipe_impl = pipe_impl
    return runner


def test_dataset_path_is_relative_to_the_tag_root():
    assert tags.dataset_path(REMOTE, "realman__pi05-three-arm") == "lerobot/realman__pi05-three-arm"


def test_refresh_a_raw_copy_reads_the_index_under_a_shared_lock(raw):
    runner = fake_robot(raw, tag_index(raw, TAGS))
    result = tags.refresh({"path": str(raw)}, RecordingLog(), runner=runner)
    assert (result["kind"], result["episodes"], result["previous"]) == ("raw", 3, False)
    doc = episode_tags.load(raw)
    assert doc["origin"] == f"{REMOTE.ssh_host}:{REMOTE.recording_container}:{REMOTE.tags_root}/episode_meta.json"
    assert doc["episodes"][1]["tags"]["failure_reason"] == "re-grasp"
    inner = shlex.split(runner.commands("episode_meta.json")[0][-1])
    assert inner[3:9] == ["flock", "-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.tags_root}/.episode_tags.lock", "cat"]


def test_refresh_reports_what_changed(raw):
    write_tags(raw, TAGS)
    moved = [dict(t) for t in TAGS]
    moved[2]["lighting_level"] = 2
    result = tags.refresh({"path": str(raw)}, RecordingLog(), runner=fake_robot(raw, tag_index(raw, moved)))
    assert result["previous"] is True and result["changed"] == {"episodes": 1, "keys": {"lighting_level": 1}}


def test_a_renumbered_recording_is_refused_and_the_old_file_kept(raw, tmp_path):
    write_tags(raw, TAGS)
    before = episode_tags.tags_path(raw).read_bytes()
    other = build_dataset(tmp_path / "remote" / REMOTE.dataset, [EPISODES[0], EPISODES[2], EPISODES[1]])
    with pytest.raises(StepFailed, match="no longer matches"):
        tags.refresh({"path": str(raw)}, RecordingLog(), runner=fake_robot(other, tag_index(raw, TAGS)))
    assert episode_tags.tags_path(raw).read_bytes() == before


def test_an_unreachable_robot_fails_and_names_it(raw):
    runner = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    with pytest.raises(StepFailed, match="realman_local"):
        tags.refresh({"path": str(raw)}, RecordingLog(), runner=runner)
    assert not episode_tags.tags_path(raw).exists()


def _clean_of(raw, tmp_path):
    clean = build_dataset(tmp_path / "data" / "c", [EPISODES[0], EPISODES[2]])
    write_clean_manifest(clean, source=str(raw), removed={1: "re-grasp"}, old_to_new={0: 0, 2: 1})
    return clean


def test_a_clean_set_is_derived_from_its_source_without_the_robot(raw, tmp_path):
    write_tags(raw, TAGS)
    clean = _clean_of(raw, tmp_path)
    runner = FakeRunner()
    result = tags.refresh({"path": str(clean)}, RecordingLog(), runner=runner)
    assert result["kind"] == "clean" and runner.calls == []
    doc = episode_tags.load(clean)
    assert [r["session_id"] for r in doc["episodes"]] == ["S000", "S002"]
    assert doc["derived_from"]["path"] == str(raw) and doc["derived_from"]["via"].endswith("c.clean_manifest.json")


def test_a_clean_set_needs_tags_on_its_source(raw, tmp_path):
    clean = _clean_of(raw, tmp_path)
    with pytest.raises(StepFailed, match="tags refresh"):
        tags.refresh({"path": str(clean)}, RecordingLog(), runner=FakeRunner())


def test_a_view_copies_its_source_rows(raw, tmp_path):
    write_tags(raw, TAGS)
    view = build_view(tmp_path / "data" / "v", source=str(raw), prompts={"pick_and_place": "put", "pick_only": "pick"},
                      lengths=[140, 90, 60], tasks=["pick_and_place", "pick_only", "pick_only"])
    assert tags.refresh({"path": str(view)}, RecordingLog(), runner=FakeRunner())["kind"] == "view"
    assert episode_tags.load(view)["episodes"][1]["tags"]["success"] is False


def test_status_compares_the_raw_ancestor(raw, tmp_path):
    write_tags(raw, TAGS)
    clean = _clean_of(raw, tmp_path)
    config = load_config(None)
    moved = [dict(t) for t in TAGS]
    moved[1] = {"success": True, "arm": "right", "lighting_level": 2}
    result = tags.status(config, clean, fake_robot(raw, tag_index(raw, moved)))
    assert (result["state"], result["episodes_changed"], result["raw"]) == ("changed", 1, str(raw.resolve()))
    assert result["keys"] == {"failure_reason": 1, "success": 1}
    assert tags.status(config, raw, fake_robot(raw, tag_index(raw, TAGS)))["state"] == "current"
    down = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    assert tags.status(config, raw, down)["state"] == "unknown"
    episode_tags.tags_path(raw).unlink()
    assert tags.status(config, clean, FakeRunner())["state"] == "no_tags"
```

- [ ] **Step 3: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_tags_step.py -p no:cacheprovider`
Expected: `ImportError: cannot import name 'tags' from 'realman_training.steps'`.

- [ ] **Step 4: Write `steps/tags.py`**

```python
"""Episode tags from realman_ts: refresh a dataset's episode_tags.json, or check whether the recording's tags moved on.

A raw copy reads the recording platform's tag index (episode_meta.json, under a shared flock on its
.episode_tags.lock) and the recording's own episode list (meta/ only, under the recorder's append lock) to prove the
copy still lines up. A cleaned set or a view is re-derived from its source without the robot.
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path, PurePosixPath

from .. import episode_tags
from ..config import ConsoleConfig, RemoteConfig, load_config
from ..datasets import clean_manifest_path, read_clean_manifest
from ..jobs import StepFailed
from ..lerobot_io import read_episodes
from ..runner import CommandFailed, Runner
from .pull import remote


def dataset_path(config: RemoteConfig, dataset: str) -> str:
    try:
        return str(PurePosixPath(config.recording_root).relative_to(config.tags_root) / dataset)
    except ValueError:
        raise StepFailed(f"remote.recording_root {config.recording_root} is not under remote.tags_root {config.tags_root}") from None


def read_index(config: RemoteConfig, runner: Runner, *, timeout: float | None = None) -> dict:
    lock = f"{config.tags_root}/.episode_tags.lock"
    argv = remote(config, ["flock", "-s", "-w", str(config.lock_wait_sec), lock, "cat", f"{config.tags_root}/episode_meta.json"])
    try:
        return json.loads(runner.check(argv, timeout=timeout or config.lock_wait_sec + 60))
    except (CommandFailed, ValueError, subprocess.TimeoutExpired) as error:
        raise StepFailed(f"cannot read the tag index from {config.ssh_host}: {error}") from None


def read_remote_episodes(config: RemoteConfig, dataset: str, runner: Runner) -> dict[int, tuple[int, str]]:
    source = f"{config.recording_root}/{dataset}"
    lock = f"{config.recording_root}/.{dataset}.lock"
    argv = remote(config, ["flock", "-s", "-w", str(config.lock_wait_sec), lock,
                           "tar", "-C", source, "-cf", "-", "meta/info.json", "meta/tasks.parquet", "meta/episodes"])
    with tempfile.TemporaryDirectory(prefix="realman-tags-") as tmp:
        try:
            runner.pipe(argv, ["tar", "-C", tmp, "-xf", "-"], lambda n: None)
        except CommandFailed as error:
            raise StepFailed(f"cannot read the episode list of {source} on {config.ssh_host}: {error}") from None
        return {e.index: (e.length, e.task) for e in read_episodes(tmp)}


def remote_doc(config: RemoteConfig, root: Path, runner: Runner, *, remote_episodes: dict | None = None,
               timeout: float | None = None) -> dict:
    """Fresh rows for a raw copy at root (its directory name is the recording's dataset name)."""
    dataset = Path(root).name
    meta = read_index(config, runner, timeout=timeout)
    if remote_episodes is None:
        remote_episodes = read_remote_episodes(config, dataset, runner)
    origin = f"{config.ssh_host}:{config.recording_container}:{config.tags_root}/episode_meta.json"
    try:
        return episode_tags.from_remote(meta, dataset_path(config, dataset), episode_tags.local_episodes(root),
                                        remote_episodes, origin=origin)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None


def kind_of(root: Path) -> tuple[str, Path | None, dict | None]:
    contract = Path(root) / "contract.json"
    if contract.is_file():
        source = json.loads(contract.read_text(encoding="utf-8")).get("source")
        return "view", Path(source) if source else None, None
    manifest = read_clean_manifest(Path(root))
    if manifest is not None:
        return "clean", Path(manifest["source"]) if manifest.get("source") else None, manifest
    return "raw", None, None


def derived_doc(root: Path) -> dict:
    kind, source, manifest = kind_of(root)
    if source is None:
        raise StepFailed(f"{root}: its {'contract.json' if kind == 'view' else 'clean manifest'} names no source")
    if not episode_tags.tags_path(source).is_file():
        raise StepFailed(f"{source} has no {episode_tags.FILE_NAME}: run realman-train tags refresh {source} first")
    try:
        source_doc = episode_tags.load(source)
        if kind == "view":
            mapping, via = {i: i for i in episode_tags.local_episodes(root)}, str(Path(root) / "contract.json")
        else:
            if "old_to_new" not in manifest:
                raise StepFailed(f"{root}: the clean manifest has no old_to_new numbering")
            mapping = {int(k): int(v) for k, v in manifest["old_to_new"].items()}
            via = str(clean_manifest_path(Path(root)))
        return episode_tags.derive(source_doc, root, mapping, source=source, via=via)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None


def refresh(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    root = Path(params["path"]).expanduser().resolve()
    kind, source, _ = kind_of(root)
    try:
        old = episode_tags.load(root)
    except episode_tags.TagsMismatch as error:
        log(f"replacing tags that no longer match: {error}")
        old = None
    if kind == "raw":
        log(f"{root.name}: reading the tag index from {config.remote.ssh_host}")
        doc = remote_doc(config.remote, root, runner)
    else:
        log(f"{root.name}: deriving the tags of this {kind} set from {source}")
        doc = derived_doc(root)
    path = episode_tags.write(root, doc)
    changed = episode_tags.changes(old, doc)
    log(f"wrote {path}: {len(doc['episodes'])} episodes, snapshot {doc['snapshot_at']}"
        + (f", {changed['episodes']} changed {changed['keys']}" if old is not None else ""))
    for key, values in episode_tags.summary(doc).items():
        if key != episode_tags.TASK_KEY:
            log(f"  {key}: " + ", ".join(f"{v['text']} {v['count']}" for v in values))
    return {"path": str(root), "kind": kind, "episodes": len(doc["episodes"]), "snapshot_at": doc["snapshot_at"],
            "changed": changed, "previous": old is not None}


def raw_root(root: Path) -> Path:
    seen: set[Path] = set()
    root = Path(root).resolve()
    while True:
        kind, source, _ = kind_of(root)
        if kind == "raw":
            return root
        if source is None or root in seen:
            raise StepFailed(f"{root}: no raw source to compare with")
        seen.add(root)
        root = Path(source).resolve()


def status(config: ConsoleConfig, root, runner: Runner, *, timeout: float | None = None) -> dict:
    """Read-only: have the recording's tags changed since the snapshot of root's raw ancestor?"""
    try:
        raw = raw_root(Path(root).expanduser())
        local = episode_tags.load(raw)
    except (StepFailed, episode_tags.TagsMismatch) as error:
        return {"state": "error", "error": str(error)}
    if local is None:
        return {"state": "no_tags", "raw": str(raw)}
    try:
        fresh = remote_doc(config.remote, raw, runner, timeout=timeout)
    except StepFailed as error:
        return {"state": "unknown", "raw": str(raw), "snapshot_at": local.get("snapshot_at"), "error": str(error)}
    changed = episode_tags.changes(local, fresh)
    return {"state": "changed" if changed["episodes"] else "current", "raw": str(raw),
            "snapshot_at": local.get("snapshot_at"), "episodes_changed": changed["episodes"], "keys": changed["keys"]}
```

- [ ] **Step 5: Run the step tests**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_tags_step.py -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 6: Write the failing pull tests**

In `test/test_pull.py`, add `tag_index` to the `lerobot_fixture` import, and make `fake_remote` answer the tag index **before** the existing `cat` rule (the first matching rule wins). Replace the first lines of `fake_remote`:

```python
def fake_remote(recording, *, drop_video=False, meta=None):
    """Answers the remote du/cat/find and runs the remote tar locally against the fixture."""
    runner = FakeRunner()
    size = sum(p.stat().st_size for p in recording.rglob("*") if p.is_file())
    if meta is None:
        meta = tag_index(recording, [{"success": True}, {"success": True}])
    runner.on("episode_meta.json", stdout=json.dumps(meta))
    runner.on("du -sb", stdout=f"{size}\t{SOURCE}\n")
```

(the rest of `fake_remote` stays). Append:

```python
def test_pull_snapshots_the_tags(recording, tmp_path):
    target = tmp_path / "data" / "t"
    result = pull.run({"target": str(target)}, RecordingLog(), runner=fake_remote(recording))
    dataset = target / REMOTE.dataset
    doc = json.loads((dataset / "episode_tags.json").read_text())
    assert result["tags_episodes"] == 2 and [r["episode_index"] for r in doc["episodes"]] == [0, 1]
    assert json.loads((target / "pull.json").read_text())["tags_snapshot_at"] == doc["snapshot_at"]


def test_pull_fails_when_the_tag_index_lacks_an_episode(recording, tmp_path):
    meta = tag_index(recording, [{"success": True}, {"success": True}])
    del meta["episodes"][1]
    with pytest.raises(StepFailed, match="not in the tag index"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=fake_remote(recording, meta=meta))
    assert not (tmp_path / "t").exists() and not (tmp_path / "t.partial").exists()
```

- [ ] **Step 7: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_pull.py -p no:cacheprovider`
Expected: the two new tests fail (`KeyError: 'tags_episodes'` / no exception); the old ones pass.

- [ ] **Step 8: Snapshot tags in `pull.run`**

Add `from .. import episode_tags` to the imports. In `run()`, right after the `if missing: raise StepFailed(...)` block and before `record = {`:

```python
        from .tags import remote_doc  # tags imports pull.remote: import here to avoid a cycle

        log("tags: reading the recording's tag index")
        tags_doc = remote_doc(config, dest, runner, remote_episodes=episode_tags.local_episodes(dest))
        episode_tags.write(dest, tags_doc)
        log(f"tags: {len(tags_doc['episodes'])} episodes, snapshot {tags_doc['snapshot_at']}")
```

Add `"tags_snapshot_at": tags_doc["snapshot_at"],` to `record`, and `"tags_episodes": len(tags_doc["episodes"]),` to the returned dict. (The copy and the recording are the same files at this moment, so the copy's own episode list is the remote list.)

- [ ] **Step 9: Run the whole suite**

Run: `PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider`
Expected: all pass (if `test_config.py` compares YAML keys with dataclass fields, `tags_root` is now in both).

- [ ] **Step 10: Commit**

```bash
git add config/training/training_console.yaml src/training/realman_training/realman_training/{config,datasets,jobs}.py src/training/realman_training/realman_training/steps/{tags,pull}.py src/training/realman_training/test/test_tags_step.py src/training/realman_training/test/test_pull.py
git commit -m "feat(training): pull snapshots episode tags; tags refresh/status against realman_ts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `clean --where` and tags through clean and view

**Files:**
- Modify: `src/training/realman_training/realman_training/steps/clean.py`
- Modify: `src/training/realman_training/realman_training/steps/view.py`
- Test: `src/training/realman_training/test/test_clean.py`, `src/training/realman_training/test/test_view.py`

**Interfaces:**
- Consumes: Task 1/2 (`load`, `parse_where`, `select`, `unseen`, `derive`, `write`, `local_episodes`, `TagsMismatch`, `FILE_NAME`).
- Produces: clean params accept `"where": list[str]`; manifest gains `"where": list[str]` and `"tags_snapshot_at": str | None`; result gains `"where"` and `"tags": bool`; a cleaned set or view whose source has valid tags gets `episode_tags.json`.

- [ ] **Step 1: Write the failing clean tests** (append to `test/test_clean.py`; add `write_tags` to the `lerobot_fixture` import and `from realman_training import episode_tags`)

```python
TAGS5 = [
    {"success": True, "lighting_level": 2},
    {"success": True, "lighting_level": 2},
    {"success": False, "lighting_level": 2, "failure_reason": "never closed"},
    {"success": True, "lighting_level": 1},
    {"success": True, "lighting_level": 2},
]


def test_where_drops_by_tag_and_carries_renumbered_tags(raw, tmp_path):
    write_tags(raw, TAGS5)
    dst = tmp_path / "c"
    result = clean.run({"src": str(raw), "dst": str(dst), "where": ["success=true", "lighting_level=2"]}, RecordingLog())
    assert result["removed"] == {"2": "tag success=false (never closed)", "3": "tag lighting_level=1 not in {2}"}
    assert result["tags"] is True and result["where"] == ["success=true", "lighting_level=2"]
    manifest = json.loads(Path(f"{dst}.clean_manifest.json").read_text())
    assert manifest["where"] == ["success=true", "lighting_level=2"]
    assert manifest["tags_snapshot_at"] == "2026-10-23T09:30:00+08:00"
    doc = episode_tags.load(dst)
    assert [r["session_id"] for r in doc["episodes"]] == ["S000", "S001", "S004"]
    assert doc["derived_from"]["path"] == str(raw.resolve())


def test_where_and_drop_are_a_union_with_both_reasons(raw, tmp_path):
    write_tags(raw, TAGS5)
    result = clean.run({"src": str(raw), "dst": str(tmp_path / "a"), "drop": [3], "reasons": {"3": "by hand"},
                        "where": ["success=true"]}, RecordingLog())
    assert result["removed"] == {"2": "tag success=false (never closed)", "3": "by hand"}
    result = clean.run({"src": str(raw), "dst": str(tmp_path / "b"), "drop": [2], "reasons": {"2": "re-grasp seen"},
                        "where": ["success=true"]}, RecordingLog())
    assert result["removed"] == {"2": "re-grasp seen; tag success=false (never closed)"}


@pytest.mark.parametrize("params, fragment", [
    ({"where": ["success=true"]}, "tags refresh"),                          # no episode_tags.json
    ({"keep": [0], "where": ["success=true"]}, "either keep or where"),
])
def test_where_needs_tags_and_excludes_keep(raw, tmp_path, params, fragment):
    with pytest.raises(StepFailed, match=fragment):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), **params}, RecordingLog())


@pytest.mark.parametrize("where, fragment", [
    (["lighting_level=1,2"], "nothing to drop"),
    (["colour=red"], "unknown tag"),
])
def test_bad_or_empty_where_is_refused(raw, tmp_path, where, fragment):
    write_tags(raw, TAGS5)
    with pytest.raises(StepFailed, match=fragment):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), "where": where}, RecordingLog())
    assert not (tmp_path / "x").exists()


def test_unseen_values_are_warned_about(raw, tmp_path):
    write_tags(raw, TAGS5)
    log = RecordingLog()
    clean.run({"src": str(raw), "dst": str(tmp_path / "w"), "where": ["lighting_level=2,3"]}, log)
    assert any("no episode has lighting_level=3" in line for line in log.lines)


def test_a_plain_clean_carries_tags_and_stale_tags_do_not_block_it(raw, tmp_path):
    write_tags(raw, TAGS5)
    clean.run({"src": str(raw), "dst": str(tmp_path / "p"), "drop": [1]}, RecordingLog())
    assert len(episode_tags.load(tmp_path / "p")["episodes"]) == 4
    doc = json.loads(episode_tags.tags_path(raw).read_text())
    doc["episodes"][0]["length"] = 1
    episode_tags.write(raw, doc)
    log = RecordingLog()
    result = clean.run({"src": str(raw), "dst": str(tmp_path / "q"), "drop": [1]}, log)
    assert result["tags"] is False and not episode_tags.tags_path(tmp_path / "q").exists()
    assert any("tags not copied" in line for line in log.lines)
```

- [ ] **Step 2: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_clean.py -p no:cacheprovider`
Expected: the new tests fail (`nothing to drop` raised for where-only runs, `KeyError: 'tags'`).

- [ ] **Step 3: Change `steps/clean.py`**

Add `from .. import episode_tags` to the imports. Replace `_selection` with:

```python
def _selection(params: dict, indices: list[int], tag_drops: set[int] = frozenset()) -> set[int]:
    if "drop" in params and "keep" in params:
        raise StepFailed("pass either drop or keep, not both")
    if "keep" in params and params.get("where"):
        raise StepFailed("pass either keep or where, not both")
    known = set(indices)
    if "keep" in params:
        keep = {int(e) for e in params["keep"]}
        if not keep:
            raise StepFailed("keep at least one episode")
        unknown = keep - known
        if unknown:
            raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset")
        return known - keep
    drop = {int(e) for e in params.get("drop") or []}
    unknown = drop - known
    if unknown:
        raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset (0..{max(known)})")
    drop |= set(tag_drops)
    if not drop:
        raise StepFailed("nothing to drop: pass drop (or keep) episodes, or a where filter that some episode fails")
    if drop == known:
        raise StepFailed("that drops every episode")
    return drop
```

Add after `_reasons`:

```python
def _tag_drops(params: dict, src: Path, log) -> tuple[dict | None, dict[int, str]]:
    """The source's tags (None when it has none or they are stale and no where was asked) and the where drops."""
    items = list(params.get("where") or [])
    if not items:
        try:
            return episode_tags.load(src), {}
        except episode_tags.TagsMismatch as error:
            log(f"tags not copied: {error}")
            return None, {}
    if "keep" in params:
        raise StepFailed("pass either keep or where, not both")
    try:
        doc = episode_tags.load(src)
    except episode_tags.TagsMismatch as error:
        raise StepFailed(str(error)) from None
    if doc is None:
        raise StepFailed(f"{src} has no {episode_tags.FILE_NAME}: run realman-train tags refresh {src} first")
    try:
        where = episode_tags.parse_where(items, doc)
    except ValueError as error:
        raise StepFailed(f"where: {error}") from None
    for item in episode_tags.unseen(doc, where):
        log(f"warning: no episode has {item}")
    drops = episode_tags.select(doc, where)
    log(f"where {' '.join(items)}: drops {sorted(drops)}")
    return doc, drops
```

In `run()`, replace

```python
    drop = _selection(params, indices)
    reasons = _reasons(params, src, drop, log)
```

with

```python
    tags_doc, tag_drops = _tag_drops(params, src, log)
    drop = _selection(params, indices, set(tag_drops))
    explicit = drop if "keep" in params else {int(e) for e in params.get("drop") or []}
    reasons = _reasons(params, src, explicit, log)
    for episode, why in tag_drops.items():
        reasons[episode] = f"{reasons[episode]}; {why}" if episode in reasons else why
    reasons = dict(sorted(reasons.items()))
```

In the `manifest` dict, after `"old_to_new"`, add:

```python
        "where": list(params.get("where") or []),
        "tags_snapshot_at": tags_doc.get("snapshot_at") if tags_doc else None,
```

After `manifest_path.write_text(...)` add:

```python
    if tags_doc is not None:
        episode_tags.write(dst, episode_tags.derive(tags_doc, dst, mapping, source=src, via=str(manifest_path)))
```

and in the returned dict add `"where": list(params.get("where") or []), "tags": tags_doc is not None,`.

- [ ] **Step 4: Run the clean tests**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_clean.py -p no:cacheprovider`
Expected: all pass, including the old `test_bad_selections_are_refused` (`"nothing to drop"` still leads the message).

- [ ] **Step 5: Write the failing view tests** (append to `test/test_view.py`; add `write_tags` to the fixture import, `from realman_training import episode_tags`)

```python
def test_a_view_carries_its_sources_tags(clean, tmp_path):
    write_tags(clean, [{"success": True}, {"success": False}])
    dst = tmp_path / "data" / "v"
    view.run({"src": str(clean), "dst": str(dst)}, RecordingLog(), runner=fake_make_view([GOOD_PLACE, GOOD_PICK]))
    doc = episode_tags.load(dst)
    assert doc["episodes"][1]["tags"]["success"] is False and doc["derived_from"]["path"] == str(clean.resolve())


def test_stale_source_tags_are_skipped_with_a_note(clean, tmp_path):
    write_tags(clean, [{"success": True}, {"success": False}])
    doc = json.loads(episode_tags.tags_path(clean).read_text())
    doc["episodes"][0]["length"] = 1
    episode_tags.write(clean, doc)
    log, dst = RecordingLog(), tmp_path / "data" / "v2"
    view.run({"src": str(clean), "dst": str(dst)}, log, runner=fake_make_view([GOOD_PLACE, GOOD_PICK]))
    assert not episode_tags.tags_path(dst).exists() and any("tags not copied" in line for line in log.lines)
```

(`fake_make_view` writes 30-frame episodes and the `clean` fixture has 30-frame episodes, so the frames line up.)

- [ ] **Step 6: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_view.py -p no:cacheprovider`
Expected: the two new tests fail (no `episode_tags.json` in the view; no "tags not copied" line).

- [ ] **Step 7: Copy tags in `steps/view.py`**

Add `from .. import episode_tags` to the imports and, above `run`:

```python
def _copy_tags(src: Path, partial: Path, log) -> None:
    """The view keeps its source's numbering, so its tags are the source's rows, checked by frames."""
    try:
        doc = episode_tags.load(src)
        if doc is None:
            return
        mapping = {i: i for i in episode_tags.local_episodes(partial)}
        new = episode_tags.derive(doc, partial, mapping, source=src, via="contract.json")
    except episode_tags.TagsMismatch as error:
        log(f"tags not copied: {error}")
        return
    episode_tags.write(partial, new)
```

In `run()`, call `_copy_tags(src, partial, log)` right before `partial.rename(dst)`.

- [ ] **Step 8: Run the whole suite**

Run: `PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/training/realman_training/realman_training/steps/{clean,view}.py src/training/realman_training/test/test_clean.py src/training/realman_training/test/test_view.py
git commit -m "feat(training): clean --where drops by tag; cleaned sets and views carry renumbered tags

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: CLI (`clean --where`, `tags refresh|status`, tag lines in `inspect`)

**Files:**
- Modify: `src/training/realman_training/realman_training/cli.py`
- Test: `src/training/realman_training/test/test_cli.py`

**Interfaces:**
- Consumes: Task 1 (`payload`), Task 3 (`steps.tags.status`, job kind `tags_refresh`), Task 4 (clean `where`).
- Produces: `realman-train clean <src> [--drop|--keep|--suggested] [--where K=V1,V2 ...]`, `realman-train tags refresh <path> [--background] [--json]`, `realman-train tags status <path> [--json]` (exit 0 for current/changed, 1 otherwise), `inspect` prints/returns `tags`.

- [ ] **Step 1: Write the failing tests** (append to `test/test_cli.py`; add `write_tags` to the `lerobot_fixture` import and `from pathlib import Path` if missing)

```python
def test_clean_where_needs_tags_and_then_filters(setup, tmp_path, capsys):
    raw, _, config_path = setup
    args = ["--config", str(config_path), "clean", str(raw), "--where", "success=true"]
    assert main([*args, "--dst", str(tmp_path / "data" / "c1")]) == 1
    assert "tags refresh" in capsys.readouterr().err
    write_tags(raw, [{"success": True}, {"success": False, "failure_reason": "closed on nothing"}])
    assert main([*args, "--dst", str(tmp_path / "data" / "c2")]) == 0
    manifest = json.loads(Path(f"{tmp_path / 'data' / 'c2'}.clean_manifest.json").read_text())
    assert manifest["where"] == ["success=true"]
    assert manifest["removed"]["1"]["reason"] == "tag success=false (closed on nothing)"


def test_clean_needs_some_selection(setup, capsys):
    raw, _, config_path = setup
    assert main(["--config", str(config_path), "clean", str(raw)]) == 2
    assert "--where" in capsys.readouterr().err


def test_inspect_shows_tag_counts(setup, capsys):
    raw, _, config_path = setup
    write_tags(raw, [{"success": True}, {"success": False}], sources=[{"success": "default"}, {"success": "manual"}])
    assert main(["--config", str(config_path), "inspect", str(raw), "--no-quality"]) == 0
    out = capsys.readouterr().out
    assert "tags: snapshot 2026-10-23T09:30:00+08:00" in out
    assert "success: false 1 (manual 1), true 1 (default 1)" in out
    assert main(["--config", str(config_path), "inspect", str(raw), "--no-quality", "--json"]) == 0
    assert json.loads(capsys.readouterr().out)["tags"]["episodes"]["1"]["tags"]["success"] is False


def test_tags_refresh_of_a_cleaned_set_runs_as_a_job(setup, tmp_path, capsys):
    raw, _, config_path = setup
    write_tags(raw, [{"success": True}, {"success": False}])
    dst = tmp_path / "data" / "c3"
    assert main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(dst)]) == 0
    (dst / "episode_tags.json").unlink()
    assert main(["--config", str(config_path), "tags", "refresh", str(dst)]) == 0
    assert (dst / "episode_tags.json").is_file()


def test_tags_status_prints_the_change(setup, monkeypatch, capsys):
    raw, _, config_path = setup
    monkeypatch.setattr("realman_training.cli.tags_step.status", lambda config, path, runner: {
        "state": "changed", "raw": str(raw), "snapshot_at": "2026-10-23T09:30:00+08:00",
        "episodes_changed": 2, "keys": {"success": 2}})
    assert main(["--config", str(config_path), "tags", "status", str(raw)]) == 0
    assert "2 episode(s) changed" in capsys.readouterr().out
```

- [ ] **Step 2: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_cli.py -p no:cacheprovider`
Expected: argparse errors (`unrecognized arguments: --where`, `invalid choice: 'tags'`), missing tag lines.

- [ ] **Step 3: Change `cli.py`**

Imports: add `from . import episode_tags`, `from .runner import Runner`, `from .steps import tags as tags_step`.

In `build_params`, the `clean` branch becomes:

```python
    if command == "clean":
        src = Path(args.src).expanduser().resolve()
        params = {**base, "src": str(src), "dst": str(Path(args.dst).expanduser() if args.dst else clean_step.default_dst(config.data_root, src))}
        if args.reasons:
            params["reasons"] = json.loads(Path(args.reasons).read_text(encoding="utf-8"))
        if args.where:
            params["where"] = list(args.where)
        if args.suggested:
            quality = inspect_dataset(src, config.quality)
            params["drop"] = suggested_drops(quality)
            params["reasons"] = {
                str(q.episode): "; ".join(f.message for f in q.findings if f.severity == "drop")
                for q in quality if q.verdict == "suggest_drop"
            } | params.get("reasons", {})
        elif args.keep is not None:
            params["keep"] = parse_episodes(args.keep)
        elif args.drop is not None:
            params["drop"] = parse_episodes(args.drop)
        elif not args.where:
            raise ValueError("clean needs --drop, --keep, --suggested or --where")
        return "clean", params
```

Add the helpers (next to `_summary_text`):

```python
def _tags_text(payload: dict | None) -> list[str]:
    if payload is None:
        return ["  tags: none (realman-train tags refresh <path>)"]
    if "error" in payload:
        return [f"  tags: {payload['error']}"]
    derived = payload.get("derived_from")
    lines = [f"  tags: snapshot {payload['snapshot_at']}" + (f" · derived from {derived['path']}" if derived else "")]
    for key, values in payload["summary"].items():
        if key == episode_tags.TASK_KEY:
            continue
        lines.append(f"    {key}: " + ", ".join(
            f"{v['text']} {v['count']} (" + ", ".join(f"{s} {n}" for s, n in v["sources"].items()) + ")" for v in values))
    return lines


def _status_text(result: dict) -> str:
    state = result["state"]
    if state == "current":
        return f"{result['raw']}: tags are current (snapshot {result['snapshot_at']})"
    if state == "changed":
        keys = ", ".join(f"{k} {n}" for k, n in result["keys"].items())
        return (f"{result['raw']}: {result['episodes_changed']} episode(s) changed on realman_ts since "
                f"{result['snapshot_at']} ({keys}); run realman-train tags refresh")
    if state == "no_tags":
        return f"{result['raw']}: no episode_tags.json yet; run realman-train tags refresh {result['raw']}"
    return f"tags status {state}: {result.get('error')}"


def _cmd_tags(args, config) -> int:
    path = Path(args.path).expanduser().resolve()
    if args.tags_command == "refresh":
        return _run_job("tags_refresh", {"config": str(config.source), "path": str(path)}, args, config)
    result = tags_step.status(config, path, Runner())
    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else _status_text(result))
    return 0 if result["state"] in ("current", "changed") else 1
```

In `_cmd_inspect`: after `drops = ...` add `tags = episode_tags.payload(summary.path)`; add `"tags": tags,` to the JSON dict; change `print("\n".join(_summary_text(summary)))` to `print("\n".join(_summary_text(summary) + _tags_text(tags)))`.

In `make_parser`, for `clean`: change `group = p.add_mutually_exclusive_group(required=True)` to `required=False` and add after `--reasons`:

```python
    p.add_argument("--where", action="append", metavar="KEY=V1,V2",
                   help="keep episodes whose tag KEY is one of the values (repeat for more keys: all must hold)")
```

Before `check = sub.add_parser("linkcheck", ...)` add:

```python
    tags_cmd = sub.add_parser("tags", help="episode tags of a dataset (episode_tags.json from realman_ts)")
    tags_sub = tags_cmd.add_subparsers(dest="tags_command", required=True)
    p = tags_sub.add_parser("refresh", help="re-read a raw copy's tags from realman_ts, or re-derive a cleaned set/view")
    p.add_argument("path")
    p.add_argument("--background", action="store_true", help="start the job and return its id")
    p.add_argument("--json", action="store_true", help="print the result as JSON")
    p = tags_sub.add_parser("status", help="have the recording's tags changed since the snapshot? (read-only)")
    p.add_argument("path")
    p.add_argument("--json", action="store_true")
```

In `main`, after the `inspect` dispatch: `if args.command == "tags": return _cmd_tags(args, config)`.

- [ ] **Step 4: Run the tests**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_cli.py -p no:cacheprovider` then the whole suite.
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/cli.py src/training/realman_training/test/test_cli.py
git commit -m "feat(training): realman-train clean --where, tags refresh|status, tag counts in inspect

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Console API (tags in `/api/dataset`, select preview, tags status, jobs)

**Files:**
- Modify: `src/training/realman_training/realman_training/catalog.py`
- Modify: `src/training/realman_training/realman_training/job_params.py`
- Modify: `src/training/realman_training/realman_training/web_server.py`
- Modify: `src/training/realman_training/test/console_fixture.py` (tags on the world's raw set)
- Modify: `src/training/realman_training/test/web_fake_steps.py` (`tags_refresh`)
- Test: `src/training/realman_training/test/test_web_server.py`

**Interfaces:**
- Consumes: Task 1/2 (`payload`, `load`, `parse_where`, `select`, `unseen`), Task 3 (`steps.tags.status`, job kind `tags_refresh`).
- Produces:
  - `/api/dataset` adds `"tags": payload | null`.
  - `GET /api/dataset/select?path=<rel>&where=<k=v>[&where=…]` → `{"path","where","drop": [int],"reasons": {str: str},"keep_count","unseen": [str]}` (400 for no tags / bad where).
  - `GET /api/dataset/tags-status?path=<rel>` → `steps.tags.status` result (15 s index timeout).
  - Jobs: `tags_refresh` `{"path": rel}`; `clean` accepts `"where": [str]` and an empty `drop` when `where` drops something.
  - `catalog.select_preview(config, rel, where: list[str]) -> dict`.
  - Fixture constant `RAW_TAGS` in `console_fixture.py` (5 rows; episode 2 `success=false`, episodes 3–4 `lighting_level=1`).

- [ ] **Step 1: Fixture tags and fake step**

In `test/console_fixture.py`, add `write_tags` to the `lerobot_fixture` import and, at module level:

```python
RAW_TAGS = [
    {"success": True, "arm": "right", "lighting_level": 2, "date": "2026-10-16"},
    {"success": True, "arm": "right", "lighting_level": 2, "date": "2026-10-16"},
    {"success": False, "arm": "right", "lighting_level": 2, "date": "2026-10-16", "failure_reason": "2 closing events (re-grasp)"},
    {"success": True, "arm": "right", "lighting_level": 1, "date": "2026-10-16"},
    {"success": True, "arm": "right", "lighting_level": 1, "date": "2026-10-16"},
]
RAW_TAG_SOURCES = [
    {"success": "manual" if t["success"] is False else "default", "arm": "manual", "lighting_level": "manual",
     "date": "derived", **({"failure_reason": "manual"} if "failure_reason" in t else {})}
    for t in RAW_TAGS
]
```

and in `build_world`, right after `raw = build_dataset(...)`: `write_tags(raw, RAW_TAGS, sources=RAW_TAG_SOURCES)`.

In `test/web_fake_steps.py` append:

```python
def tags_refresh(params, log):
    return _fake("tags_refresh", params, log)
```

In `test/test_web_server.py`, add `"tags_refresh"` to the `targets` tuple in the `world` fixture.

- [ ] **Step 2: Write the failing API tests** (append to `test/test_web_server.py`; add `from fake_runner import FakeRunner`)

```python
def test_dataset_detail_carries_tags(world):
    async def scenario(client):
        raw = await get_json(client, f"/api/dataset?path={RAW}")
        view = await get_json(client, "/api/dataset?path=realman_right_arm_multitask_view")
        return raw, view

    raw, view = call(world["make"](), scenario)
    assert raw["tags"]["keys"][0] == "task" and raw["tags"]["episodes"]["2"]["tags"]["success"] is False
    assert raw["tags"]["episodes"]["2"]["tag_sources"]["success"] == "manual"
    assert view["tags"] is None


def test_select_previews_tag_drops(world):
    async def scenario(client):
        ok = await get_json(client, f"/api/dataset/select?path={RAW}&where=lighting_level%3D2&where=success%3Dtrue")
        bad = await get_json(client, f"/api/dataset/select?path={RAW}&where=colour%3Dred", status=400)
        none = await get_json(client, "/api/dataset/select?path=realman__multitask_clean&where=success%3Dtrue", status=400)
        return ok, bad, none

    ok, bad, none = call(world["make"](), scenario)
    assert ok["drop"] == [2, 3, 4] and ok["keep_count"] == 2
    assert ok["reasons"]["2"] == "tag success=false (2 closing events (re-grasp))"
    assert ok["reasons"]["3"] == "tag lighting_level=1 not in {2}"
    assert "unknown tag" in bad["error"] and "no episode tags" in none["error"]


def test_tags_status_reports_unknown_when_the_robot_is_away(world):
    down = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")

    async def scenario(client):
        return await get_json(client, f"/api/dataset/tags-status?path={RAW}")

    data = call(world["make"](runner=down), scenario)
    assert data["state"] == "unknown" and "realman_local" in data["error"]


def test_tag_jobs_are_validated(world):
    async def scenario(client):
        headers = {TOKEN_HEADER: TOKEN}

        async def post(kind, params, status):
            response = await client.post("/api/jobs", json={"kind": kind, "params": params, "confirm": True}, headers=headers)
            assert response.status == status, await response.text()
            return await response.json()

        refresh = await post("tags_refresh", {"path": RAW}, 201)
        where_only = await post("clean", {"src": RAW, "where": ["lighting_level=2"]}, 201)
        unknown = await post("clean", {"src": RAW, "where": ["colour=red"]}, 400)
        nothing = await post("clean", {"src": RAW, "where": ["lighting_level=1,2"]}, 400)
        return refresh, where_only, unknown, nothing

    refresh, where_only, unknown, nothing = call(world["make"](), scenario)
    assert refresh["job"]["params"]["path"].endswith(RAW)
    assert where_only["job"]["params"]["where"] == ["lighting_level=2"] and where_only["job"]["params"]["drop"] == []
    assert "unknown tag" in unknown["error"] and "nothing to drop" in nothing["error"]
```

- [ ] **Step 3: Run them to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_web_server.py -p no:cacheprovider`
Expected: the new tests fail (`KeyError: 'tags'`, 404 on the new routes, 400 `unknown job kind 'tags_refresh'`).

- [ ] **Step 4: `catalog.py`**

Add `from . import episode_tags` to the imports. Replace `dataset_detail` with:

```python
def dataset_detail(config: ConsoleConfig, cache: SummaryCache, rel: str) -> dict:
    try:
        root = resolve_dataset(config, rel)
        entry = cache.get(root)
        tags = episode_tags.payload(root)
    except (NotALeRobotDataset, OSError, ValueError, KeyError, TypeError, pyarrow.ArrowInvalid) as error:
        raise BadRequest(str(error)) from error
    return {"path": rel, **{k: v for k, v in entry.items() if k not in ("fingerprint", "version")}, "tags": tags}


def select_preview(config: ConsoleConfig, rel: str, where: list[str]) -> dict:
    """What a where filter would drop from a dataset, without starting anything."""
    root = resolve_dataset(config, rel)
    try:
        doc = episode_tags.load(root)
    except episode_tags.TagsMismatch as error:
        raise BadRequest(str(error)) from None
    if doc is None:
        raise BadRequest(f"{rel} has no episode tags yet: refresh its tags first")
    try:
        parsed = episode_tags.parse_where(where, doc)
    except ValueError as error:
        raise BadRequest(str(error)) from None
    drops = episode_tags.select(doc, parsed)
    return {"path": rel, "where": list(where), "drop": sorted(drops),
            "reasons": {str(e): why for e, why in sorted(drops.items())},
            "keep_count": len(doc["episodes"]) - len(drops), "unseen": episode_tags.unseen(doc, parsed)}
```

(`BadRequest` subclasses `ValueError`, so an existing `resolve_dataset` `BadRequest` raised inside the `try` is re-raised as `BadRequest` with the same text; `NotFound` is a `LookupError` and passes through as a 404, as before.)

- [ ] **Step 5: `job_params.py`**

`ALLOWED`: `"clean": {"src", "drop", "reasons", "dst", "where"},` and add `"tags_refresh": {"path"},`. Import `select_preview` from `.catalog` (next to `BadRequest, NotFound, resolve_dataset`). Add the validator next to `_episodes`:

```python
def _where(value) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or any(not isinstance(v, str) or "=" not in v or len(v) > _TEXT_MAX for v in value):
        raise BadRequest("where must be a list of key=v1,v2 texts")
    return [v.strip() for v in value]
```

Replace the start of the `clean` branch (up to the `reasons` checks) with:

```python
    if kind == "clean":
        src = _dataset(config, raw, "src")
        drop = _episodes(raw.get("drop") or [], "drop")
        where = _where(raw.get("where"))
        tag_drops = select_preview(config, raw["src"], where)["drop"] if where else []
        if not drop and not tag_drops:
            raise BadRequest("nothing to drop: tick at least one episode, or a tag filter that some episode fails")
```

and after `params.update(src=str(src), drop=drop)` add `if where: params["where"] = where`.

After the `view` branch (before `if kind in ("norm", ...)`), add:

```python
    if kind == "tags_refresh":
        return {**params, "path": str(_dataset(config, raw, "path"))}
```

- [ ] **Step 6: `web_server.py`**

Add `from .steps import tags as tags_step` to the imports and a module constant `TAGS_STATUS_TIMEOUT_SEC = 15`. In `Console.__init__`, after `runner = runner or Runner()`, add `self.runner = runner`. In the route table, after `r.add_get("/api/dataset", self.dataset)`:

```python
        r.add_get("/api/dataset/select", self.dataset_select)
        r.add_get("/api/dataset/tags-status", self.dataset_tags_status)
```

Handlers after `dataset`:

```python
    async def dataset_select(self, request):
        rel = request.query.get("path", "")
        where = list(request.query.getall("where", []))
        return _json(await self._blocking(catalog.select_preview, self.config, rel, where))

    async def dataset_tags_status(self, request):
        root = catalog.resolve_dataset(self.config, request.query.get("path", ""))
        return _json(await self._blocking(lambda: tags_step.status(self.config, root, self.runner,
                                                                   timeout=TAGS_STATUS_TIMEOUT_SEC)))
```

Mention the two read routes in the module docstring's list of reads if it lists them.

- [ ] **Step 7: Run the whole suite**

Run: `PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider`
Expected: all pass (catalog/summary tests see one more file in the world's raw dataset; the summary cache fingerprint covers only `meta/`, `data/` and provenance files, so nothing else changes).

- [ ] **Step 8: Commit**

```bash
git add src/training/realman_training/realman_training/{catalog,job_params,web_server}.py src/training/realman_training/test/{console_fixture,web_fake_steps,test_web_server}.py
git commit -m "feat(training): console API for episode tags, tag filter preview and tags_refresh jobs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Data page (tag facet, tag column, tag filter) and bundle

**Files:**
- Modify: `src/training/realman_training/web/src/api.ts`
- Modify: `src/training/realman_training/web/src/pages/data.ts`
- Modify: `src/training/realman_training/web/src/style.css`
- Modify (generated): `src/training/realman_training/realman_training/static/**`
- Test: `website/tests/training-console/console.spec.ts`

**Interfaces:**
- Consumes: Task 6 API and the `RAW_TAGS` world (episode 2 failed, episodes 3–4 `lighting_level=1`; quality pre-checks 1 and 2).
- Produces: DOM ids/classes the e2e test uses: `#tags-facet`, `#tags-refresh`, `#tags-check`, `#tags-status`, `#tag-filter input[data-key][value]`, `#tag-filter-note`, `td.tags`, `tr.failed`, `tr.tag-drop`; `#drop-count` text `已选 N 条（其中按标签 M 条）` when a filter is active.

- [ ] **Step 1: Install website deps in the worktree (once)**

```bash
cd $WT/website && npm ci
```

- [ ] **Step 2: Write the failing e2e tests** (append to `console.spec.ts`; `RAW` and `TOKEN` already exist in the file)

```ts
test("data: tags show per episode and a tag filter joins the cleaned set", async ({ page, request }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await expect(page.locator("#tags-facet")).toContainText("lighting_level");
  await expect(page.locator(`#quality-table tr[data-episode="2"]`)).toHaveClass(/failed/);
  await expect(page.locator(`#quality-table tr[data-episode="2"] td.tags`)).toContainText("失败");
  await page.locator(`#tag-filter input[data-key="lighting_level"][value="2"]`).check();
  await expect(page.locator("#drop-count")).toHaveText("已选 4 条（其中按标签 2 条）");
  await expect(page.locator(`#quality-table tr[data-episode="3"]`)).toHaveClass(/tag-drop/);
  await page.locator("#make-clean").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toContainText("剔除 4 条：1, 2, 3, 4");
  await expect(dialog).toContainText("lighting_level=2");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake clean done");
  const jobs = await (await request.get("/api/jobs?kind=clean")).json();
  expect(jobs.jobs[0].params.where).toEqual(["lighting_level=2"]);
  expect(jobs.jobs[0].params.drop).toEqual([1, 2]);
});

test("data: refreshing tags goes through the confirm dialog", async ({ page }) => {
  await page.goto(`/#/data?path=${encodeURIComponent(RAW)}`);
  await page.locator("#tags-refresh").click();
  await expect(page.locator("#confirm-dialog")).toContainText("episode_meta.json");
  await page.locator("#confirm-token").fill(TOKEN);
  await page.locator("#confirm-start").click();
  await expect(page.locator("#drawer-log")).toContainText("fake tags_refresh done");
});
```

- [ ] **Step 3: Run them to verify they fail**

```bash
cd $WT/website
PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" REALMAN_TRAINING_PYTHON=$PY \
  npx playwright test --config ../config/training/playwright.config.mjs -g "tags"
```

Expected: both fail (`#tags-facet` not found). If port 4180 is held by another worktree's server (`lsof -i :4180`), copy the config next to the original so its relative paths still resolve: `sed 's/4180/4183/g' ../config/training/playwright.config.mjs > ../config/training/playwright.4183.config.mjs`, run with `--config ../config/training/playwright.4183.config.mjs`, and delete that copy before committing.

- [ ] **Step 4: `api.ts`**

Add the types after `DatasetDetail` and the `tags` field to `DatasetDetail`:

```ts
export interface TagValue { value: unknown; text: string; count: number; sources: Record<string, number> }
export interface TagRow { tags: Record<string, unknown>; tag_sources: Record<string, string>; session_id?: string | null }
export interface TagsPayload {
  snapshot_at?: string | null; derived_from?: { path: string; snapshot_at?: string | null; via?: string } | null;
  keys?: string[]; summary?: Record<string, TagValue[]>; episodes?: Record<string, TagRow>; error?: string;
}
export interface TagSelect { path: string; where: string[]; drop: number[]; reasons: Record<string, string>; keep_count: number; unseen: string[] }
export interface TagStatus {
  state: "current" | "changed" | "no_tags" | "unknown" | "error"; raw?: string; snapshot_at?: string | null;
  episodes_changed?: number; keys?: Record<string, number>; error?: string;
}
```

In `DatasetDetail` add `tags: TagsPayload | null;`. In `api`, after `dataset`:

```ts
  selectByTags: (path: string, where: string[]) =>
    request<TagSelect>("GET", `/api/dataset/select?path=${q(path)}${where.map((w) => `&where=${q(w)}`).join("")}`),
  tagsStatus: (path: string) => request<TagStatus>("GET", `/api/dataset/tags-status?path=${q(path)}`),
```

- [ ] **Step 5: `pages/data.ts`**

Import the new types: `import { api, type DatasetDetail, type DatasetRow, type EpisodeQuality, type Options, type TagRow, type TagsPayload } from "../api";`.

Add after `VERDICT`:

```ts
const TAG_SOURCE: Record<string, string> = { manual: "人工", default: "默认", derived: "自动", missing: "缺省", dataset: "数据集" };
const TAG_COLUMNS = ["success", "arm", "lighting_level"];
// Free text (and any value containing a comma) cannot be written as key=v1,v2: filter those from the CLI.
const FILTER_SKIP = new Set(["failure_reason"]);

function tagsFacet(detail: DatasetDetail, ctx: Ctx): HTMLElement {
  const tags = detail.tags;
  const raw = detail.summary.kind === "raw";
  const refresh = h("button", { class: "button secondary", id: "tags-refresh", type: "button" }, "刷新标签");
  refresh.addEventListener("click", () => void confirmJob(ctx, {
    title: "刷新标签", kind: "tags_refresh", params: { path: detail.path },
    lines: raw
      ? ["通过 ssh realman_local 读取录制平台的标签索引（episode_meta.json）", "逐条核对帧数和任务，对不上就不写",
        `只改 ${detail.path}/episode_tags.json，数据和视频不动`]
      : [`从来源 ${detail.summary.source ?? "?"} 的标签按编号映射重新推导`, "不连机器人",
        `只改 ${detail.path}/episode_tags.json`],
  }));
  const status = h("span", { id: "tags-status", class: "muted" });
  const check = h("button", { class: "button ghost", id: "tags-check", type: "button" }, "检查更新");
  check.addEventListener("click", async () => {
    status.textContent = "正在读取 realman_ts…";
    try {
      const s = await api.tagsStatus(detail.path);
      status.textContent = s.state === "current" ? "已是最新"
        : s.state === "changed"
          ? `realman_ts 上有 ${s.episodes_changed} 条的标签已变化（${Object.entries(s.keys ?? {}).map(([k, n]) => `${k} ${n}`).join("，")}），可以刷新`
          : s.state === "no_tags" ? "原始数据还没有标签，先刷新" : `无法确认：${s.error ?? s.state}`;
    } catch (error) {
      status.textContent = errorText(error);
    }
  });
  const actions = h("div", { class: "actions" }, check, refresh);
  if (!tags) return h("div", { id: "tags-facet" }, h("p", { class: "muted" }, "没有标签（episode_tags.json）。"), actions, status);
  if (tags.error) return h("div", { id: "tags-facet" }, h("p", { class: "error" }, tags.error), actions, status);
  const rows: [string, string][] = [["快照", fmtTime(tags.snapshot_at)]];
  if (tags.derived_from) rows.push(["推导自", tags.derived_from.path]);
  for (const [key, values] of Object.entries(tags.summary ?? {})) {
    if (key === "task") continue;
    rows.push([key, values.map((v) =>
      `${v.text} ${v.count}（${Object.entries(v.sources).map(([s, n]) => `${TAG_SOURCE[s] ?? s} ${n}`).join("，")}）`).join(" · ")]);
  }
  return h("div", { id: "tags-facet" }, kv(rows), actions, status);
}

function tagCell(row: TagRow | undefined): HTMLElement {
  if (!row) return h("td", { class: "tags muted" }, "–");
  const chips = TAG_COLUMNS.filter((key) => key in row.tags).map((key) => {
    const value = row.tags[key];
    const text = key === "success" ? (value === false ? "失败" : "成功")
      : key === "lighting_level" ? `光照 ${value ?? "?"}` : String(value ?? "?");
    const c = chip(text, key === "success" && value === false ? "bad" : "");
    const source = row.tag_sources[key];
    c.classList.add(source === "manual" ? "tag-manual" : "tag-default");
    c.title = `${key} · ${TAG_SOURCE[source] ?? source ?? "?"}`;
    return c;
  });
  const reason = row.tags.failure_reason;
  return h("td", { class: "tags", title: typeof reason === "string" ? reason : "" }, chips);
}

function tagFilter(tags: TagsPayload, onChange: (where: string[]) => void): HTMLElement {
  const boxes: HTMLInputElement[] = [];
  const where = (): string[] => {
    const picked = new Map<string, string[]>();
    for (const box of boxes) if (box.checked) picked.set(box.dataset.key!, [...(picked.get(box.dataset.key!) ?? []), box.value]);
    return [...picked].map(([key, values]) => `${key}=${values.join(",")}`);
  };
  const groups = Object.entries(tags.summary ?? {}).filter(([key]) => !FILTER_SKIP.has(key)).map(([key, values]) =>
    h("fieldset", { class: "tag-group", "data-key": key }, h("legend", {}, key),
      values.filter((v) => !v.text.includes(",")).map((v) => {
        const box = h("input", { type: "checkbox", "data-key": key, value: v.text }) as HTMLInputElement;
        box.addEventListener("change", () => onChange(where()));
        boxes.push(box);
        return h("label", { class: "check" }, box, `${v.text} · ${v.count}`);
      })));
  return h("div", { id: "tag-filter" },
    h("h3", {}, "按标签保留"),
    h("p", { class: "muted" }, "勾选要保留的值：同一组里满足任意一个即可，不同组必须同时满足；不勾的组不限制。按标签剔除的行会划掉。"),
    h("div", { class: "groups" }, groups));
}
```

In `qualitySection`, after `const fps = ...`:

```ts
  const tagRows = detail.tags?.episodes;
  let tagDrops = new Map<number, string>();
  let where: string[] = [];
  let latest = 0;
  const filterNote = h("p", { id: "tag-filter-note", class: "muted" });
  const filter = detail.tags?.summary ? tagFilter(detail.tags, async (next) => {
    where = next;
    const mine = ++latest;
    if (!next.length) {
      tagDrops = new Map();
      filterNote.textContent = "";
      update();
      return;
    }
    try {
      const s = await api.selectByTags(detail.path, next);
      if (mine !== latest) return;
      tagDrops = new Map(s.drop.map((e) => [e, s.reasons[String(e)]]));
      filterNote.textContent = s.unseen.length ? `没有任何条目是：${s.unseen.join("，")}` : `保留 ${s.keep_count} 条`;
    } catch (error) {
      if (mine !== latest) return;
      tagDrops = new Map();
      filterNote.textContent = errorText(error);
    }
    update();
  }) : null;
```

In the row builder, add the tag cell after the task cell and mark failed rows:

```ts
    const tagRow = tagRows?.[String(q.episode)];
    return h("tr", { "data-episode": q.episode, class: tagRow?.tags.success === false ? "failed" : "" },
      h("td", {}, box), h("td", { class: "num" }, q.episode), h("td", { class: "nowrap" }, q.task),
      tagCell(tagRow),
      h("td", { class: "num" }, `${q.frames} · ${fmtDuration(q.frames / fps)}`),
      h("td", {}, sparkline(detail.traces[String(q.episode)])), h("td", {}, chip(label, tone)),
      h("td", {}, q.findings.map((f) => f.message).join("；")));
```

Replace `update` and the `makeClean` click handler:

```ts
  function update(): void {
    const all = new Set([...checked(), ...tagDrops.keys()]);
    for (const tr of body.querySelectorAll<HTMLTableRowElement>("tr")) tr.classList.toggle("tag-drop", tagDrops.has(Number(tr.dataset.episode)));
    count.textContent = tagDrops.size ? `已选 ${all.size} 条（其中按标签 ${tagDrops.size} 条）` : `已选 ${all.size} 条`;
    makeClean.textContent = `生成清洗版（剔除 ${all.size} 条）`;
    makeClean.disabled = all.size === 0;
  }
  makeClean.addEventListener("click", () => {
    const drop = checked();
    const reasons = Object.fromEntries(drop.map((ep) => [String(ep), reasonFor(byEpisode.get(ep))]));
    const all = [...new Set([...drop, ...tagDrops.keys()])].sort((a, b) => a - b);
    const params: Record<string, unknown> = { src: detail.path, drop, reasons };
    if (where.length) params.where = where;
    void confirmJob(ctx, {
      title: "生成清洗版", kind: "clean", params,
      lines: [`来源：${detail.path}`, `剔除 ${all.length} 条：${all.join(", ")}`,
        ...(where.length ? [`按标签保留：${where.join(" 且 ")}（按标签剔除 ${tagDrops.size} 条）`] : []),
        `新目录：${detail.summary.name}_clean_<日期时间>（原数据不动，视频用硬链接）`, "剔除清单和原因写进新目录的 clean_manifest.json"],
    });
  });
```

The header row becomes `["剔除", "#", "任务", "标签", "帧数 · 时长", "夹爪", "结论", "原因"]`, and the returned section inserts `filter, filterNote,` between the muted paragraph and the table wrapper.

In `renderDetail`, add a fourth facet: `h("div", { class: "sub" }, h("h3", {}, "标签"), tagsFacet(detail, ctx))`. In `renderData`'s `onEnded`, add `"tags_refresh"` to the kinds that reload the page.

- [ ] **Step 6: `style.css`** (append)

```css
#tag-filter { display: grid; gap: 8px; margin: 4px 0 12px; }
#tag-filter .groups { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.tag-group { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 0; padding: 6px 10px; border: 1px solid var(--line); border-radius: 10px; min-width: 0; }
.tag-group legend { padding: 0 4px; color: var(--text-3); font-size: 11px; }
td.tags { white-space: nowrap; }
td.tags .chip + .chip { margin-left: 4px; }
.chip.tag-default { opacity: .6; }
tr.failed td { background: var(--danger-bg); }
tr.tag-drop td { color: var(--text-3); text-decoration: line-through; }
```

- [ ] **Step 7: Build, run the e2e suite, check phones**

```bash
cd $WT/website && npm run build:training
PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" REALMAN_TRAINING_PYTHON=$PY \
  npx playwright test --config ../config/training/playwright.config.mjs
```

Expected: all tests pass on desktop and mobile, including the two new ones and the existing `no page scrolls sideways @mobile` (the filter groups wrap; the table scrolls inside `.table-wrap`). If the existing clean test fails on the dialog text, the cause is the drop list: without a tag filter `all` equals `drop`, so `剔除 2 条：1, 4` must still show.

- [ ] **Step 8: Commit (sources + rebuilt bundle)**

```bash
cd $WT
git add src/training/realman_training/web/src src/training/realman_training/realman_training/static website/tests/training-console/console.spec.ts
git status --short   # the old bundle files must show as deleted and the new ones as added
git commit -m "feat(training): tags on the :8780 data page, tag filter for cleaned sets, refresh/check buttons

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Docs

**Files:**
- Modify: `website/docs/development/training-cli-walkthrough.md`
- Modify: `website/docs/development/training-console-web.md`
- Modify: `website/docs/development/recording-platform.md`
- Modify: `docs/superpowers/specs/2026-10-23-training-episode-tags-design.md` (one line, see Step 4)

- [ ] **Step 1: CLI walkthrough**

In `training-cli-walkthrough.md`, at the end of `## 1. 拉取`, add:

````markdown
拉取会把录制平台的 Episode 标签一起写进 `<数据集>/episode_tags.json`（快照，每条按帧数和任务核对过）。
之后在 realman_ts 上改了标签，不用重拉，只更新标签：

```bash
realman-train tags status ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm   # 只读，看有没有变化
realman-train tags refresh ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm  # 重新读取并核对
```

清洗版和训练视图也能 `tags refresh`：按清洗记录的编号映射从来源推导，不连机器人（来源要先有标签）。
````

In `## 3. 清洗`, add:

````markdown
按标签选数据用 `--where 标签=值1,值2`，可以写多个：不同标签之间是"且"，同一标签的多个值之间是"或"；
`task` 也能当条件。它可以和 `--suggested`、`--drop` 一起用（剔除取并集），不能和 `--keep` 一起用。

```bash
# 只要成功、正常光照的 pick_only 两类数据，同时剔除质检规则建议的
realman-train clean ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm \
  --suggested --where success=true --where lighting_level=2 \
  --where task=pick_only,pick_only_light-weak_1021
```

值按标签的类型解析：`true`/`false`、整数、`null`（匹配空值），其余按文字精确匹配。光照 `lighting_level`：1 较暗、2 正常、3 较亮。
剔除原因写成 `tag success=false (<failure_reason>)` 或 `tag lighting_level=1 not in {2}`；清洗记录多出 `where` 和
`tags_snapshot_at`，新数据集带上按新编号重写的 `episode_tags.json`。`realman-train inspect` 会打印每个标签的取值和来源（人工/默认/自动）分布。
注意：`success` 的默认值是 true，只有人工标过的才可信，看 inspect 里的来源计数。
````

- [ ] **Step 2: Console page**

In `training-console-web.md` `## 页面`, in the data page entry (find the line describing 数据), add a sentence:

```markdown
数据页显示每条的标签（成功/失败、手臂、光照；人工值实色，默认值淡色，失败行标红，悬停看失败原因）和标签分布、快照时间；
"检查更新"只读比对 realman_ts，"刷新标签"走确认和令牌。清洗区的"按标签保留"勾选框实时预览会剔除哪些条目（划掉），
和手动勾选合在一起生成清洗版，条件写进清洗记录。
```

- [ ] **Step 3: Recording platform page**

In `recording-platform.md`, `## 回放与整理（Phase 2）`, after the paragraph on tags (or at the end of the section), add:

```markdown
训练端（server5090 的 `realman-train`）只读这些标签：pull 时把 `episode_meta.json` 里本数据集的行快照成
`episode_tags.json`，`realman-train tags refresh` 更新，`clean --where` 按标签选数据。见[训练命令行](./training-cli-walkthrough.md)。
```

- [ ] **Step 4: Spec touch-up**

In the spec's 控制台 section the `select` endpoint line ends with `，也可以同时带上 \`suggested=1\`。`; the page combines quality ticks and tag drops itself, so replace that ending with `；质检勾选和按标签剔除在页面上合并。`

- [ ] **Step 5: Build the site to catch broken links**

```bash
cd $WT/website && npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
cd $WT
git add website/docs/development/{training-cli-walkthrough,training-console-web,recording-platform}.md docs/superpowers/specs/2026-10-23-training-episode-tags-design.md
git commit -m "docs(training): episode tags in the training CLI, console and recording pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Real-data acceptance on server5090 (read-only except new files)

No code changes. Needs `ssh server5090` and, from server5090, `ssh realman_local`. Writes only `episode_tags.json` files into existing datasets and new cleaned sets under `~/data/realman/_tags_accept/` (same filesystem, so hard links work).

- [ ] **Step 1: Ship the branch as a scratch copy**

```bash
cd $WT && git archive --format=tar HEAD | ssh server5090 'rm -rf ~/scratch/tags_accept && mkdir -p ~/scratch/tags_accept && tar -C ~/scratch/tags_accept -xf -'
```

On server5090 define (zsh: a function, not a string variable):

```bash
rt() { (cd ~/scratch/tags_accept/src/training/realman_training && ~/.local/bin/uv run -q --no-project --with pyyaml --with numpy --with pyarrow python -m realman_training "$@"); }
```

- [ ] **Step 2: Refresh the 10-21 raw copy**

```bash
rt tags refresh ~/data/realman/raw_realman_ts_20261021_152817/realman__pi05-three-arm
```

Expected: 342 episodes; the summary line `success: true 328, false 14`; `lighting_level: 2 230, 1 112`; `arm: right 342`.
(The recording has 343 sessions; one export FAILED and has no episode index.)

- [ ] **Step 3: `--where success=true` reproduces `multitask_v2_clean`**

```bash
mkdir -p ~/data/realman/_tags_accept
rt clean ~/data/realman/raw_realman_ts_20261021_152817/realman__pi05-three-arm --where success=true --dst ~/data/realman/_tags_accept/v2_by_tags
python3 - <<'EOF'
import json, os
d = os.path.expanduser("~/data/realman")
new = json.load(open(f"{d}/_tags_accept/v2_by_tags.clean_manifest.json"))
old = json.load(open(f"{d}/realman__multitask_v2_clean.clean_manifest.json"))
print("removed", sorted(map(int, new["removed"])))
print("same old_to_new:", new["old_to_new"] == old["old_to_new"])
EOF
```

Expected: `removed [13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216, 290]` and `same old_to_new: True`.

- [ ] **Step 4: Tag filter reproduces `pick_v2_clean`**

```bash
rt clean ~/data/realman/raw_realman_ts_20261021_152817/realman__pi05-three-arm --where success=true --where task=pick_only,pick_only_light-weak_1021 --dst ~/data/realman/_tags_accept/pick_by_tags
python3 - <<'EOF'
import json, os
d = os.path.expanduser("~/data/realman")
new = json.load(open(f"{d}/_tags_accept/pick_by_tags.clean_manifest.json"))
v2 = json.load(open(f"{d}/realman__multitask_v2_clean.clean_manifest.json"))
pick = json.load(open(f"{d}/realman__pick_v2_clean.clean_manifest.json"))
# pick_v2_clean was cut from multitask_v2_clean (--keep 114-327): map both back to raw episode numbers
v2_new_to_raw = {v: int(k) for k, v in v2["old_to_new"].items()}
pick_raw = sorted(v2_new_to_raw[int(k)] for k in pick["old_to_new"])
print("kept", new["kept_episodes"], "same as pick_v2_clean:", sorted(map(int, new["old_to_new"])) == pick_raw)
EOF
```

Expected: `kept 214 same as pick_v2_clean: True`.

- [ ] **Step 5: Derive tags for an existing cleaned set and check status**

```bash
rt tags refresh ~/data/realman/realman__multitask_v2_clean
rt inspect ~/data/realman/realman__multitask_v2_clean --no-quality | grep -A6 'tags:'
rt tags status ~/data/realman/realman__multitask_v2_clean
```

Expected: 328 episodes, `success: true 328 (default 328)` (the 14 manual `false` ones were removed), and status `tags are current`.

- [ ] **Step 6: Clean up the scratch outputs (only what this task made)**

```bash
rm -rf ~/data/realman/_tags_accept ~/scratch/tags_accept
```

Keep the new `episode_tags.json` files in the raw copy and `realman__multitask_v2_clean` (they are what the console will show). Record the results for the PR description.

---

### Task 10: PR and deploy to :8780 (ask the user before deploying)

- [ ] **Step 1: Push and open the PR**

```bash
cd $WT && git push -u origin feat/training-episode-tags
gh pr create --repo QingTianRobot/realman_pi --base main --title "feat(training): select training data by episode tags" --body "<summary of Tasks 1-8, Task 9 results, note that the branch sits on the deployed f85f3d16 (PR #63 + #64 + the floating job log), so those commits show until they merge>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Then bind it with the ccd_pr tools (`get_status`, `bind_pr` if needed) and read CI.

- [ ] **Step 2: Deploy only after the user says so**

On server5090 the console worktree `~/organization/realman_pi-console` is on `deploy/training-console-20261022` = `f85f3d16`, which is this branch's base, so the update is a fast-forward:

```bash
cd $WT && git bundle create /tmp/tags.bundle f85f3d16..feat/training-episode-tags && scp /tmp/tags.bundle server5090:/tmp/tags.bundle
ssh server5090 'curl -s localhost:8780/api/jobs?limit=20 | python3 -c "import json,sys; print([j[\"id\"] for j in json.load(sys.stdin)[\"jobs\"] if j[\"state\"] in (\"starting\",\"running\")])"'
```

Stop if the list is not empty (recreating the container marks running console jobs `interrupted`). Otherwise:

```bash
ssh server5090 'cd ~/organization/realman_pi-console && git tag -f pre-redeploy-20261023c HEAD && git fetch /tmp/tags.bundle feat/training-episode-tags && git merge --ff-only FETCH_HEAD && ./rm65_server up --build'
```

Verify: `curl -s localhost:8780/api/dataset?path=raw_realman_ts_20261021_152817/realman__pi05-three-arm | python3 -c "import json,sys; print(json.load(sys.stdin)['tags']['summary']['success'])"` shows the 328/14 split, and the data page shows the tag column (screenshot through the built-in browser if the user has the console open). Rollback: `git reset --hard pre-redeploy-20261023c && ./rm65_server up --build`.
