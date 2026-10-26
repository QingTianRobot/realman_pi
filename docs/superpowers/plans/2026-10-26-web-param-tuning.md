# :8765 Parameter Tuning Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/params.html` to the :8765 web control: a golf-style spreadsheet of whitelisted parameters from `config/ros/*.yaml` that stages values in the browser, writes them back in place after a dry-run diff, reads runtime values back from the running ROS nodes, and keeps history, revert, a baseline and an exportable patch.

**Architecture:** A ROS-free module `param_tuning.py` owns the catalog (`config/web-control/param_catalog.yaml`), locating values with `yaml.compose` marks, exact-span rewriting with a re-parse check, validation, atomic owner-preserving writes, history/backup/baseline/patch under `<log_root>/param-tuning`. A ROS-free `param_readback.py` sends `GetParameters` requests through clients the node injects. `web_server.py` exposes `/api/params*`; `web_control_node.py` only wires the store and the readback. The page is a third Vite entry (`params.html` + `params.ts` + `params.css`).

**Tech Stack:** Python 3.10, PyYAML, aiohttp, pytest; TypeScript + Vite (web control UI), Playwright; VitePress docs.

Spec: `docs/superpowers/specs/2026-10-26-web-param-tuning-design.md`.

## Global Constraints

- Work in the worktree `/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/a3e26529-6741-434c-9bb5-c443a418d019/scratchpad/wt`, branch `feat/web-param-tuning` (based on `origin/main` `f6b2e6a3`). Never touch the main checkout `/Users/miakho/Organizations/realman_pi`: it is on another branch with 69 uncommitted files that are not yours.
- No new Python dependencies: only `pytest pyyaml numpy aiohttp pyarrow` (what CI installs). CI runs Python 3.10. `param_tuning.py`, `param_readback.py` and their tests must import without rclpy.
- Only catalog entries are readable or writable through the page, and only files under `config/ros/` (catalog `file` must be `ros/*.yaml`).
- A write replaces only the target scalar's characters and is refused unless a re-parse differs from the old document in exactly the requested values. Floats are always written with a decimal point (`0.2`, `8.0`, `1.0e-05`) because rclpy declares parameters with the YAML type.
- Gripper `open_position` / `close_position` and every `hard_max_*` stay out of the catalog.
- Write endpoints use the existing same-origin check only (like `/api/bt/start` and `/api/docker/restart`); no token.
- The committed web bundle (`src/driver/realman_web_control/realman_web_control/static/`) is rebuilt with `npm run build:web-control` and committed with the UI change, as the repo already does.
- Docs are part of the feature: Chinese, under `website/docs/development/`; no IPs, host names or tokens; no config numbers hard-coded as facts.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (check the trailer: subagents tend to write their own model name).

## Test setup (used by every task)

```bash
WT=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/a3e26529-6741-434c-9bb5-c443a418d019/scratchpad/wt
PY=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/a3e26529-6741-434c-9bb5-c443a418d019/scratchpad/venv310/bin/python
RUFF=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/a3e26529-6741-434c-9bb5-c443a418d019/scratchpad/venv310/bin/ruff
# If $PY is missing: uv venv --python 3.10 <scratchpad>/venv310 && VIRTUAL_ENV=<scratchpad>/venv310 uv pip install pytest pyyaml numpy aiohttp pyarrow ruff
cd $WT/src/driver/realman_web_control
PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider      # baseline before Task 1: 176 passed, 1 skipped
```

Run one file with `PYTHONPATH=. $PY -m pytest -q test/<file>.py -p no:cacheprovider` from the same directory. Lint with `$RUFF check --config $WT/config/python/ruff.toml <paths>` from `$WT`.

Web UI (Tasks 5–6), from `$WT/website`:

```bash
npm ci                                   # once per worktree (node_modules is gitignored)
export PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run build:web-control                # rewrites the committed static bundle
npm run test:web-control                 # baseline before Task 5: 92 passed (desktop + mobile)
```

Playwright starts `npm run dev:web-control` on 127.0.0.1:4174 and reuses a server already listening there; check `lsof -nP -iTCP:4174 -sTCP:LISTEN` first so you do not test another checkout's dev server.

## File Structure

| File | Responsibility |
| --- | --- |
| `config/web-control/param_catalog.yaml` (new) | Whitelist: groups, files, prefixes, types, ranges, refs, units, notes, applies, readback |
| `src/driver/realman_web_control/realman_web_control/param_tuning.py` (new) | Catalog parsing/expansion, path parsing, `yaml.compose` location, exact-span edit + re-parse check, validation, atomic writes, history/backup/baseline/patch/pending, readback comparison |
| `src/driver/realman_web_control/realman_web_control/param_readback.py` (new) | `GetParameters` calls with one deadline, `ParameterValue` conversion; no rclpy import |
| `src/driver/realman_web_control/realman_web_control/web_server.py` | `param_tuning` config section, `/api/params*` handlers, clearing pending after a successful bringup restart |
| `src/driver/realman_web_control/realman_web_control/web_control_node.py` | Builds `ParamStore` + `ParameterReadback` with pre-created clients, passes them to the server |
| `src/driver/realman_web_control/package.xml` | `exec_depend rcl_interfaces` |
| `config/ros/realman_web_control.yaml` | `param_tuning:` section |
| `config/docker/compose.yaml` | `./config/ros` read-write in `realman_web_control` |
| `src/driver/realman_web_control/web/params.html`, `web/src/params.ts`, `web/src/params.css` (new) | The page |
| `config/web-control/vite.config.mjs` | Third build input `params` |
| `src/driver/realman_web_control/web/src/main.ts` | Top-bar link 参数调试 |
| `src/driver/realman_web_control/test/test_param_tuning.py`, `test_param_readback.py`, `test_param_api.py` (new) | pytest, no ROS |
| `website/tests/web-control/params.spec.ts` (new) | Playwright |
| `website/docs/development/web-parameter-tuning.md` (new), `realman-web-control.md`, `index.md`, `config/website/vitepress.config.mts`, `website/tests/site.spec.ts` | Docs and routes |

---

### Task 1: Catalog and the core tuning module

**Files:**
- Create: `config/web-control/param_catalog.yaml`
- Create: `src/driver/realman_web_control/realman_web_control/param_tuning.py`
- Test: `src/driver/realman_web_control/test/test_param_tuning.py`

**Interfaces:**
- Produces (used by Tasks 3 and 4):
  - `class CatalogError(ValueError)`, `class ChangeError(ValueError)` with `.errors: list[{"id", "error"}]`, `class ConflictError(RuntimeError)` with `.files: list[str]`, `class ParamWriteError(RuntimeError)`.
  - `parse_path(text) -> tuple[tuple, ...]`, `format_scalar(value, kind) -> str`, `edit_text(text, [(segments, value, kind)]) -> str`, `load_catalog(path) -> {"applies", "groups"}`.
  - `ParamStore(catalog_path, config_root, state_root)` with `snapshot() -> dict`, `apply(changes, expected_sha, dry_run=False) -> dict`, `revert(entry_id, expected_sha, dry_run=False) -> dict`, `history(limit=100) -> list[dict]`, `export_patch() -> str`, `reset_baseline() -> {"archived", "files"}`, `clear_pending() -> {"cleared"}`, `readback_requests() -> {node: [param]}`, `readback(reader) -> {"nodes", "rows": {row_id: {"state": "applied"|"pending"|"offline", "value"}}}`.
  - Row ids: `<group>/<key>`, `<group>@<instance>/<key>`, plus `[n]` for array elements (e.g. `motion@r/max_linear_speed_mps`, `policy_safety/joint_envelope_deg.lo[4]`, `gripper@left/grippers[name=gripper_left].force_pct`).
  - Snapshot row fields: `id key element label kind min max special unit note applies file value baseline readback max_ref min_ref` (refs are `{key, id|null, value, strict}` or `null`); snapshot top level: `applies groups files{file: {sha, baseline, external_change}} writable writable_error errors pending_restart`.
  - Write result: `{changes: [{id, label, file, applies, before, after}], diff, applies}`; a real write returns the history entry `{id, time, reverts, changes, files{file: {before_sha, after_sha}}, diff}`; `revert` adds `changed_since: [row_id]`.

- [ ] **Step 1: Write the failing tests**

Create `src/driver/realman_web_control/test/test_param_tuning.py`:

```python
import json
import os
from pathlib import Path
import stat
import subprocess
import textwrap

import pytest
import yaml

from realman_web_control.param_tuning import (
    CatalogError,
    ChangeError,
    ConflictError,
    ParamStore,
    edit_text,
    format_scalar,
    load_catalog,
    parse_path,
)

ROOT = Path(__file__).resolve().parents[4]
CATALOG = ROOT / "config/web-control/param_catalog.yaml"

SAMPLE = textwrap.dedent("""\
    # header comment
    node:
      ros__parameters:
        # speed comment
        speed: 0.10   # inline comment
        count: 3
        enabled: true
        limits: [4000, 7000, 8000]
        envelope:
          lo: [-73.4, 5.0, 3.5]
          hi: [40.1, 107.0, 108.2]
        stale_ms: 100
        timeout_ms: 500
        hard_max: 0.25
    buses:
      - port: /dev/a
        interval: 0.25
        grippers:
          - name: g_a
            force: 60
      - port: /dev/b
        interval: 0.5
        grippers:
          - name: g_b
            force: 100
    """)

CATALOG_TEXT = textwrap.dedent("""\
    schema_version: 1
    applies: {bt_start: 下次启动行为树生效, bringup_restart: 重启 bringup 后生效}
    groups:
      - id: main
        title: 主参数
        file: ros/sample.yaml
        prefix: node.ros__parameters
        applies: bt_start
        readback: {node: /sample_node, param: "{key}"}
        params:
          - {key: speed, type: float, min: 0.01, max: 1.0, max_ref: hard_max, unit: m/s, note: 速度}
          - {key: count, type: int, min: 1, max: 10, special: [-1], note: 次数}
          - {key: enabled, type: bool, note: 开关}
          - {key: limits, type: "int[]", labels: [J1, J2, J3], min: 500, max: 20000, unit: mA, note: 电流}
          - {key: envelope.lo, type: "float[]", labels: [J1, J2, J3], min: -180, max: 180,
             max_ref: envelope.hi, note: 下限}
          - {key: envelope.hi, type: "float[]", labels: [J1, J2, J3], min: -180, max: 180,
             min_ref: envelope.lo, note: 上限}
          - {key: stale_ms, type: int, min: 10, max: 1000, max_ref: {key: timeout_ms, strict: true}, note: 丢弃}
          - {key: timeout_ms, type: int, min: 50, max: 5000, min_ref: {key: stale_ms, strict: true}, note: 超时}
      - id: grip
        title: 夹爪
        file: ros/sample.yaml
        prefix: "buses[port=/dev/{i}]"
        instances: [a, b]
        applies: bringup_restart
        params:
          - {key: "grippers[name=g_{i}].force", label: force, type: int, min: 20, max: 100, note: 力}
          - {key: interval, type: float, min: 0.05, max: 2.0, note: 间隔}
    """)


@pytest.fixture
def store(tmp_path):
    (tmp_path / "config/ros").mkdir(parents=True)
    (tmp_path / "config/web-control").mkdir(parents=True)
    (tmp_path / "config/ros/sample.yaml").write_text(SAMPLE, encoding="utf-8")
    (tmp_path / "config/web-control/catalog.yaml").write_text(CATALOG_TEXT, encoding="utf-8")
    return ParamStore(tmp_path / "config/web-control/catalog.yaml", tmp_path / "config", tmp_path / "logs/param-tuning")


def rows_of(snapshot):
    return {row["id"]: row for group in snapshot["groups"] for row in group["rows"]}


def sha(store):
    return {file: info["sha"] for file, info in store.snapshot()["files"].items()}


def changed_lines(before, after):
    return [(a, b) for a, b in zip(before.splitlines(), after.splitlines()) if a != b]


# --------------------------------------------------------------------------- paths and formatting


def test_parse_path_understands_keys_indexes_and_selectors():
    assert parse_path("a.b[2].c[name=g_a].d") == (
        ("key", "a"), ("key", "b"), ("index", 2), ("key", "c"), ("match", "name", "g_a"), ("key", "d"),
    )
    assert parse_path("buses[port=/dev/realman/gripper_right]") == (
        ("key", "buses"), ("match", "port", "/dev/realman/gripper_right"),
    )
    for bad in ("", "a..b", "a[", "a[x]", "a b"):
        with pytest.raises(CatalogError):
            parse_path(bad)


@pytest.mark.parametrize("value, kind, text", [
    (0.1, "float", "0.1"), (8, "float", "8.0"), (1e-05, "float", "1.0e-05"), (2.5e20, "float", "2.5e+20"),
    (3, "int", "3"), (3.0, "int", "3"), (True, "bool", "true"), (False, "bool", "false"),
])
def test_format_scalar_keeps_the_catalog_type(value, kind, text):
    assert format_scalar(value, kind) == text
    parsed = yaml.safe_load(f"v: {text}")["v"]
    assert type(parsed) is {"float": float, "int": int, "bool": bool}[kind]


# --------------------------------------------------------------------------- text edits


def test_edit_replaces_only_the_target_characters():
    after = edit_text(SAMPLE, [(parse_path("node.ros__parameters.speed"), 0.2, "float")])
    assert changed_lines(SAMPLE, after) == [
        ("    speed: 0.10   # inline comment", "    speed: 0.2   # inline comment"),
    ]


def test_edit_changes_one_element_of_a_flow_list_and_several_places_at_once():
    after = edit_text(SAMPLE, [
        (parse_path("node.ros__parameters.envelope.lo[2]"), 4, "float"),
        (parse_path("node.ros__parameters.limits[0]"), 4500, "int"),
        (parse_path("buses[port=/dev/b].grippers[name=g_b].force"), 80, "int"),
        (parse_path("node.ros__parameters.enabled"), False, "bool"),
    ])
    assert changed_lines(SAMPLE, after) == [
        ("    enabled: true", "    enabled: false"),
        ("    limits: [4000, 7000, 8000]", "    limits: [4500, 7000, 8000]"),
        ("      lo: [-73.4, 5.0, 3.5]", "      lo: [-73.4, 5.0, 4.0]"),
        ("        force: 100", "        force: 80"),
    ]


def test_edit_rejects_ambiguous_selectors_and_non_scalars():
    with pytest.raises(KeyError):
        edit_text(SAMPLE, [(parse_path("buses[port=/dev/c].interval"), 0.3, "float")])
    with pytest.raises(ValueError):
        edit_text(SAMPLE, [(parse_path("node.ros__parameters.limits"), 1, "int")])


# --------------------------------------------------------------------------- catalog


def test_catalog_expands_instances_arrays_and_readback(store):
    snapshot = store.snapshot()
    assert [group["id"] for group in snapshot["groups"]] == ["main", "grip@a", "grip@b"]
    rows = rows_of(snapshot)
    assert rows["main/limits[1]"]["label"] == "limits · J2" and rows["main/limits[1]"]["value"] == 7000
    assert rows["main/limits[1]"]["readback"] == {"node": "/sample_node", "param": "limits", "element": 1}
    assert rows["grip@b/grippers[name=g_b].force"]["label"] == "force"
    assert rows["grip@b/grippers[name=g_b].force"]["value"] == 100
    assert rows["grip@a/interval"]["readback"] is None
    assert rows["main/speed"]["max_ref"] == {"key": "hard_max", "id": None, "value": 0.25, "strict": False}
    assert rows["main/envelope.lo[2]"]["max_ref"]["id"] == "main/envelope.hi[2]"
    assert snapshot["errors"] == [] and snapshot["writable"] is True
    assert store.readback_requests() == {
        "/sample_node": ["count", "enabled", "envelope.hi", "envelope.lo", "limits", "speed", "stale_ms",
                         "timeout_ms"],
    }


def test_rows_missing_from_their_file_are_reported_not_shown(tmp_path, store):
    text = (tmp_path / "config/ros/sample.yaml").read_text().replace("    count: 3\n", "    count: 3.5\n")
    (tmp_path / "config/ros/sample.yaml").write_text(text.replace("    stale_ms: 100\n", ""))
    snapshot = store.snapshot()
    rows = rows_of(snapshot)
    assert "main/count" not in rows and "main/stale_ms" not in rows
    assert any(error.startswith("main/count:") for error in snapshot["errors"])
    assert any(error.startswith("main/stale_ms:") for error in snapshot["errors"])


@pytest.mark.parametrize("change, message", [
    ("schema_version: 1", "schema_version"),
    ("file: ros/sample.yaml", "file must"),
    ("note: 速度", "note is required"),
    ('type: "int[]", labels: [J1, J2, J3]', "labels"),
])
def test_broken_catalogs_are_refused(tmp_path, change, message):
    replacement = {
        "schema_version: 1": "schema_version: 2",
        "file: ros/sample.yaml": "file: ../secrets.yaml",
        "note: 速度": "note: ''",
        'type: "int[]", labels: [J1, J2, J3]': 'type: "int[]"',
    }[change]
    path = tmp_path / "catalog.yaml"
    path.write_text(CATALOG_TEXT.replace(change, replacement, 1), encoding="utf-8")
    with pytest.raises(CatalogError, match=message):
        load_catalog(path)


def test_root_catalog_matches_the_root_config():
    """Every catalog row exists in its file with the right type, in range and within its refs."""
    store = ParamStore(CATALOG, ROOT / "config", ROOT / "logs/param-tuning-test-unused")
    snapshot = store.snapshot()
    assert snapshot["errors"] == []
    rows = rows_of(snapshot)
    expanded = sum(len(group["rows"]) for group in load_catalog(CATALOG)["groups"])
    assert len(rows) == expanded
    for row in rows.values():
        if row["kind"] == "bool" or row["value"] in row["special"]:
            continue
        assert row["min"] <= row["value"] <= row["max"], row["id"]
        for name, sign in (("max_ref", 1), ("min_ref", -1)):
            ref = row[name]
            if ref:
                delta = sign * (ref["value"] - row["value"])
                assert delta > 0 if ref["strict"] else delta >= 0, row["id"]
    files = {group["file"] for group in load_catalog(CATALOG)["groups"]}
    assert files == {"ros/policy_task.yaml", "ros/behavior_tree.yaml", "ros/realman_motion.yaml",
                     "ros/policy_router.yaml", "ros/pika_config.yaml", "ros/gripper.yaml"}
    # Gripper travel endpoints belong to gripper_overrides.yaml (main page), never to this catalog.
    assert not any(row["key"].rsplit(".", 1)[-1] in ("open_position", "close_position") for row in rows.values())


# --------------------------------------------------------------------------- validation


def test_validation_reports_every_bad_value(store):
    with pytest.raises(ChangeError) as caught:
        store.apply([
            {"id": "main/speed", "value": 0.3},          # above hard_max 0.25
            {"id": "main/count", "value": 0},            # below min, not special
            {"id": "main/enabled", "value": 1},          # not a bool
            {"id": "main/limits[0]", "value": 4500.5},   # not an integer
            {"id": "main/nope", "value": 1},
            {"id": "main/stale_ms", "value": 500},       # must stay < timeout_ms
        ], sha(store), dry_run=True)
    errors = {item["id"]: item["error"] for item in caught.value.errors}
    assert errors["main/speed"] == "must be ≤ hard_max (0.25)"
    assert errors["main/count"] == "below the minimum 1"
    assert errors["main/enabled"] == "must be true or false"
    assert errors["main/limits[0]"] == "must be an integer"
    assert errors["main/nope"] == "not in the parameter catalog"
    assert errors["main/stale_ms"] == "must be < timeout_ms (500)"
    assert errors["main/timeout_ms"] == "must be > stale_ms (500)"


def test_special_values_and_refs_use_the_staged_side(store):
    result = store.apply([
        {"id": "main/count", "value": -1},
        {"id": "main/stale_ms", "value": 600},
        {"id": "main/timeout_ms", "value": 700},
        {"id": "main/envelope.lo[0]", "value": 50},
        {"id": "main/envelope.hi[0]", "value": 60},
    ], sha(store), dry_run=True)
    assert {change["id"]: change["after"] for change in result["changes"]}["main/count"] == -1


# --------------------------------------------------------------------------- writing


def test_dry_run_returns_the_diff_without_touching_the_file(tmp_path, store):
    result = store.apply([{"id": "main/speed", "value": 0.2}], sha(store), dry_run=True)
    assert "-    speed: 0.10   # inline comment\n+    speed: 0.2   # inline comment\n" in result["diff"]
    assert result["diff"].startswith("--- a/config/ros/sample.yaml\n+++ b/config/ros/sample.yaml\n")
    assert result["applies"] == ["bt_start"]
    assert (tmp_path / "config/ros/sample.yaml").read_text() == SAMPLE
    assert not (tmp_path / "logs").exists()


def test_apply_writes_in_place_keeps_mode_and_records_history(tmp_path, store):
    path = tmp_path / "config/ros/sample.yaml"
    os.chmod(path, 0o640)
    entry = store.apply([{"id": "main/speed", "value": 0.2}, {"id": "grip@a/interval", "value": 0.3}], sha(store))
    text = path.read_text()
    assert "    speed: 0.2   # inline comment\n" in text and "    interval: 0.3\n" in text
    assert stat.S_IMODE(path.stat().st_mode) == 0o640
    assert not [p for p in path.parent.iterdir() if p.name.endswith(".tmp")]
    state = tmp_path / "logs/param-tuning"
    assert (state / "backups" / entry["id"] / "ros/sample.yaml").read_text() == SAMPLE
    assert (state / "baseline/ros/sample.yaml").read_text() == SAMPLE
    history = [json.loads(line) for line in (state / "history.jsonl").read_text().splitlines()]
    assert [change["id"] for change in history[0]["changes"]] == ["main/speed", "grip@a/interval"]
    snapshot = store.snapshot()
    rows = rows_of(snapshot)
    assert rows["main/speed"]["value"] == 0.2 and rows["main/speed"]["baseline"] == 0.10
    assert snapshot["pending_restart"] == ["grip@a/interval"]
    assert snapshot["files"]["ros/sample.yaml"] == {
        "sha": snapshot["files"]["ros/sample.yaml"]["sha"], "baseline": True, "external_change": False,
    }


def test_stale_sha_is_a_conflict(tmp_path, store):
    before = sha(store)
    (tmp_path / "config/ros/sample.yaml").write_text(SAMPLE.replace("count: 3", "count: 4"))
    with pytest.raises(ConflictError) as caught:
        store.apply([{"id": "main/speed", "value": 0.2}], before)
    assert caught.value.files == ["ros/sample.yaml"]


def test_read_only_config_is_a_conflict(tmp_path, store):
    os.chmod(tmp_path / "config/ros", 0o555)
    try:
        if os.access(tmp_path / "config/ros", os.W_OK):
            pytest.skip("running as root: chmod does not make the directory read-only")
        assert store.snapshot()["writable"] is False
        with pytest.raises(ConflictError, match="read-only"):
            store.apply([{"id": "main/speed", "value": 0.2}], sha(store))
    finally:
        os.chmod(tmp_path / "config/ros", 0o755)


def test_external_edits_are_flagged(tmp_path, store):
    store.apply([{"id": "main/speed", "value": 0.2}], sha(store))
    path = tmp_path / "config/ros/sample.yaml"
    path.write_text(path.read_text().replace("count: 3", "count: 4"))
    assert store.snapshot()["files"]["ros/sample.yaml"]["external_change"] is True


def test_revert_restores_the_before_values_as_a_new_entry(tmp_path, store):
    first = store.apply([{"id": "main/speed", "value": 0.2}, {"id": "main/limits[2]", "value": 9000}], sha(store))
    store.apply([{"id": "main/speed", "value": 0.22}], sha(store))
    preview = store.revert(first["id"], sha(store), dry_run=True)
    assert preview["changed_since"] == ["main/speed"]
    entry = store.revert(first["id"], sha(store))
    assert entry["reverts"] == first["id"]
    reverted = (tmp_path / "config/ros/sample.yaml").read_text()
    assert yaml.safe_load(reverted) == yaml.safe_load(SAMPLE)
    assert changed_lines(SAMPLE, reverted) == [
        ("    speed: 0.10   # inline comment", "    speed: 0.1   # inline comment"),
    ]
    assert [item["id"] for item in store.history()] == [entry["id"], store.history()[1]["id"], first["id"]]
    with pytest.raises(ChangeError):
        store.revert("missing", sha(store))


def test_export_patch_applies_to_the_baseline_and_reset_archives_it(tmp_path, store):
    store.apply([{"id": "main/speed", "value": 0.2}], sha(store))
    store.apply([{"id": "main/count", "value": 5}], sha(store))
    patch = store.export_patch()
    repo = tmp_path / "repo"
    (repo / "config/ros").mkdir(parents=True)
    (repo / "config/ros/sample.yaml").write_text(SAMPLE)
    subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
    (repo / "p.patch").write_text(patch)
    subprocess.run(["git", "apply", "p.patch"], cwd=repo, check=True)
    assert (repo / "config/ros/sample.yaml").read_text() == (tmp_path / "config/ros/sample.yaml").read_text()
    reset = store.reset_baseline()
    assert reset["files"] == ["ros/sample.yaml"]
    assert store.export_patch() == ""
    assert Path(reset["archived"], "baseline/ros/sample.yaml").read_text() == SAMPLE
    assert rows_of(store.snapshot())["main/speed"]["baseline"] == 0.2


def test_write_failure_restores_every_file(tmp_path, store, monkeypatch):
    from realman_web_control import param_tuning

    (tmp_path / "config/ros/other.yaml").write_text("x: 1.0\n")
    catalog = tmp_path / "config/web-control/catalog.yaml"
    catalog.write_text(CATALOG_TEXT + (
        "  - id: other\n"
        "    title: 其他\n"
        "    file: ros/other.yaml\n"
        "    applies: bt_start\n"
        "    params:\n"
        "      - {key: x, type: float, min: 0, max: 10, note: x}\n"
    ))
    store = ParamStore(catalog, tmp_path / "config", tmp_path / "logs/param-tuning")
    real = param_tuning.write_preserving

    def failing(path, text):
        if path.name == "sample.yaml":
            raise OSError("disk full")
        real(path, text)

    monkeypatch.setattr(param_tuning, "write_preserving", failing)
    with pytest.raises(param_tuning.ParamWriteError, match="disk full"):
        store.apply([{"id": "other/x", "value": 2.0}, {"id": "main/speed", "value": 0.2}], sha(store))
    assert (tmp_path / "config/ros/other.yaml").read_text() == "x: 1.0\n"
    assert (tmp_path / "config/ros/sample.yaml").read_text() == SAMPLE
    assert not (tmp_path / "logs/param-tuning/history.jsonl").exists()


def test_readback_states(store):
    def reader(requests):
        assert "/sample_node" in requests
        return {"/sample_node": {"available": True, "values": {"speed": 0.10, "limits": [4000, 7100, 8000],
                                                                "count": None}}}

    rows = store.readback(reader)["rows"]
    assert rows["main/speed"] == {"state": "applied", "value": 0.10}
    assert rows["main/limits[1]"] == {"state": "pending", "value": 7100}
    assert rows["main/count"] == {"state": "offline", "value": None}
    assert "grip@a/interval" not in rows
    offline = store.readback(lambda requests: {"/sample_node": {"available": False, "values": {}}})["rows"]
    assert offline["main/speed"]["state"] == "offline"


def test_clear_pending(store):
    store.apply([{"id": "grip@b/interval", "value": 0.6}], sha(store))
    assert store.clear_pending() == {"cleared": ["grip@b/interval"]}
    assert store.snapshot()["pending_restart"] == []


def test_logs_dir_is_not_created_by_reading(tmp_path, store):
    store.snapshot()
    store.history()
    assert store.export_patch() == ""
    assert not (tmp_path / "logs").exists()
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_tuning.py -p no:cacheprovider`
Expected: collection error `ModuleNotFoundError: No module named 'realman_web_control.param_tuning'`.

- [ ] **Step 3: Write the module**

Create `src/driver/realman_web_control/realman_web_control/param_tuning.py`:

```python
"""Catalog-driven tuning of root config YAML values for the :8765 parameter page.

Only values listed in ``config/web-control/param_catalog.yaml`` are shown or written. A write
replaces exactly the characters of the target scalar (located with ``yaml.compose`` marks), so
comments, key order and formatting stay as the operator wrote them, and is rejected unless a
re-parse differs from the old document in the target values only. Every write keeps a backup and
a history line under ``<log_root>/param-tuning``; the first write to a file snapshots it as the
baseline the export patch is made against.
"""

from __future__ import annotations

import contextlib
import copy
import difflib
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import stat
import tempfile
import threading
from typing import Any

import yaml

CATALOG_SCHEMA = 1
KINDS = ("int", "float", "bool", "int[]", "float[]")
APPLIES = ("bt_start", "bringup_restart")
HISTORY_LIMIT = 100
_SEGMENT = re.compile(r"^([A-Za-z0-9_]+)((?:\[[^\[\].]+\])*)$")
_SELECTOR = re.compile(r"\[([^\[\].]+)\]")
_FIELD = re.compile(r"^([A-Za-z0-9_]+)=(.+)$")


class CatalogError(ValueError):
    """The catalog file itself is unusable."""


class ChangeError(ValueError):
    """One or more requested values are not acceptable; ``errors`` lists them per row."""

    def __init__(self, message: str, errors: list[dict[str, str]] | None = None) -> None:
        super().__init__(message)
        self.errors = errors or []


class ConflictError(RuntimeError):
    """The files changed since the page read them, or they cannot be written here."""

    def __init__(self, message: str, files: list[str] | None = None) -> None:
        super().__init__(message)
        self.files = files or []


class ParamWriteError(RuntimeError):
    """A file could not be written; every file of the request was restored."""


# --------------------------------------------------------------------------- paths


def parse_path(text: str) -> tuple[tuple, ...]:
    """``a.b[2].c[name=x]`` -> (("key","a"), ("key","b"), ("index",2), ("key","c"), ("match","name","x"))."""
    if not isinstance(text, str) or not text:
        raise CatalogError("path must be a non-empty string")
    segments: list[tuple] = []
    for part in text.split("."):
        match = _SEGMENT.match(part)
        if not match:
            raise CatalogError(f"invalid path segment {part!r} in {text!r}")
        segments.append(("key", match.group(1)))
        for selector in _SELECTOR.findall(match.group(2)):
            if selector.isdigit():
                segments.append(("index", int(selector)))
                continue
            field = _FIELD.match(selector)
            if not field:
                raise CatalogError(f"invalid selector [{selector}] in {text!r}")
            segments.append(("match", field.group(1), field.group(2)))
    return tuple(segments)


def _node_child(node: yaml.Node, segment: tuple, where: str) -> yaml.Node:
    kind = segment[0]
    if kind == "key":
        if not isinstance(node, yaml.MappingNode):
            raise KeyError(f"{where}: {segment[1]!r} is not inside a mapping")
        found = [value for key, value in node.value if isinstance(key, yaml.ScalarNode) and key.value == segment[1]]
    elif kind == "index":
        if not isinstance(node, yaml.SequenceNode) or segment[1] >= len(node.value):
            raise KeyError(f"{where}: no list item [{segment[1]}]")
        return node.value[segment[1]]
    else:
        if not isinstance(node, yaml.SequenceNode):
            raise KeyError(f"{where}: [{segment[1]}={segment[2]}] is not applied to a list")
        found = []
        for item in node.value:
            if not isinstance(item, yaml.MappingNode):
                continue
            for key, value in item.value:
                if (isinstance(key, yaml.ScalarNode) and key.value == segment[1]
                        and isinstance(value, yaml.ScalarNode) and value.value == segment[2]):
                    found.append(item)
    if len(found) != 1:
        label = segment[1] if kind == "key" else f"[{segment[1]}={segment[2]}]"
        raise KeyError(f"{where}: {label} matches {len(found)} entries, expected exactly one")
    return found[0]


def locate_node(root: yaml.Node, segments: tuple[tuple, ...], where: str = "path") -> yaml.Node:
    node = root
    for segment in segments:
        node = _node_child(node, segment, where)
    return node


def _data_child(data: Any, segment: tuple) -> Any:
    if segment[0] == "key":
        return data[segment[1]]
    if segment[0] == "index":
        return data[segment[1]]
    matches = [item for item in data if isinstance(item, dict) and str(item.get(segment[1])) == segment[2]]
    return matches[0]


def get_value(data: Any, segments: tuple[tuple, ...]) -> Any:
    for segment in segments:
        data = _data_child(data, segment)
    return data


def set_value(data: Any, segments: tuple[tuple, ...], value: Any) -> None:
    parent = get_value(data, segments[:-1])
    last = segments[-1]
    if last[0] in ("key", "index"):
        parent[last[1]] = value
    else:
        raise KeyError("a path cannot end with a [field=value] selector")


# --------------------------------------------------------------------------- values


def format_scalar(value: Any, kind: str) -> str:
    """YAML text that parses back to ``value`` with the catalog type (floats always carry a dot)."""
    if kind == "bool":
        return "true" if value else "false"
    if kind == "int":
        return str(int(value))
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("value must be finite")
    text = repr(number)
    if "e" in text:
        mantissa, exponent = text.split("e")
        if "." not in mantissa:
            mantissa += ".0"
        if exponent[0] not in "+-":
            exponent = "+" + exponent
        text = f"{mantissa}e{exponent}"
    elif "." not in text:
        text += ".0"
    return text


def coerce_value(value: Any, kind: str) -> Any:
    """Typed value for ``kind`` or ``ValueError`` (JSON numbers arrive as int or float)."""
    if kind == "bool":
        if not isinstance(value, bool):
            raise ValueError("must be true or false")
        return value
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("must be a number")
    if not math.isfinite(float(value)):
        raise ValueError("must be finite")
    if kind == "int":
        if isinstance(value, float) and not value.is_integer():
            raise ValueError("must be an integer")
        return int(value)
    return float(value)


def same_value(left: Any, right: Any) -> bool:
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return math.isclose(float(left), float(right), rel_tol=1e-9, abs_tol=1e-12)
    return left == right


def _file_kind_ok(value: Any, kind: str) -> bool:
    if kind == "bool":
        return isinstance(value, bool)
    if isinstance(value, bool):
        return False
    if kind == "int":
        return isinstance(value, int)
    return isinstance(value, (int, float))


# --------------------------------------------------------------------------- text edits


def edit_text(text: str, edits: list[tuple[tuple[tuple, ...], Any, str]]) -> str:
    """Replace each target scalar's characters; ``edits`` are (segments, value, kind)."""
    root = yaml.compose(text)
    spans = []
    for segments, value, kind in edits:
        node = locate_node(root, segments)
        if not isinstance(node, yaml.ScalarNode):
            raise ValueError("target is not a scalar")
        spans.append((node.start_mark.index, node.end_mark.index, format_scalar(value, kind)))
    spans.sort()
    for (_, end, _), (start, _, _) in zip(spans, spans[1:]):
        if start < end:
            raise ValueError("two edits overlap")
    result = text
    for start, end, replacement in reversed(spans):
        result = result[:start] + replacement + result[end:]
    expected = copy.deepcopy(yaml.safe_load(text))
    for segments, value, kind in edits:
        set_value(expected, segments, coerce_value(value, kind))
    reparsed = yaml.safe_load(result)
    if reparsed != expected:
        raise ValueError("the edited file does not parse to the requested values only")
    for segments, _value, kind in edits:
        if not _file_kind_ok(get_value(reparsed, segments), kind.rstrip("[]")):
            raise ValueError("the edited value changed type")
    return result


def unified_diff(before: str, after: str, file: str) -> str:
    """Diff with ``a/config/<file>`` headers so ``git apply`` works from the repository root."""
    lines = difflib.unified_diff(
        before.splitlines(True), after.splitlines(True), f"a/config/{file}", f"b/config/{file}",
    )
    out = []
    for line in lines:
        out.append(line if line.endswith("\n") else line + "\n\\ No newline at end of file\n")
    return "".join(out)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def write_preserving(path: Path, text: str) -> None:
    """Atomic replace that keeps the original owner and mode (the host user owns config/ros)."""
    info = path.stat()
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(text)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, stat.S_IMODE(info.st_mode))
        with contextlib.suppress(PermissionError):
            os.chown(temporary, info.st_uid, info.st_gid)
        os.replace(temporary, path)
    except BaseException:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(temporary)
        raise


# --------------------------------------------------------------------------- catalog


def _number_or_none(value: Any, where: str) -> float | int | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
        raise CatalogError(f"{where} must be a finite number")
    return value


def _ref(value: Any, where: str, instance: str) -> dict[str, Any] | None:
    if value is None:
        return None
    if isinstance(value, str):
        value = {"key": value}
    if isinstance(value, dict) and isinstance(value.get("key"), str) and isinstance(value.get("strict", False), bool):
        key = value["key"].replace("{i}", instance)
        parse_path(key)
        return {"key": key, "strict": value.get("strict", False)}
    raise CatalogError(f"{where} must be a key or {{key, strict}}")


def load_catalog(path: str | Path) -> dict[str, Any]:
    """Parse and expand the catalog; returns {applies, groups: [{id, title, file, applies, rows}]}."""
    try:
        document = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as error:
        raise CatalogError(f"cannot read parameter catalog {path}: {error}") from error
    if not isinstance(document, dict) or document.get("schema_version") != CATALOG_SCHEMA:
        raise CatalogError(f"parameter catalog must have schema_version: {CATALOG_SCHEMA}")
    applies = document.get("applies")
    if not isinstance(applies, dict) or set(applies) != set(APPLIES):
        raise CatalogError(f"applies must label exactly {', '.join(APPLIES)}")
    groups_in = document.get("groups")
    if not isinstance(groups_in, list) or not groups_in:
        raise CatalogError("groups must be a non-empty list")
    groups, seen = [], set()
    for group in groups_in:
        groups.extend(_expand_group(group, seen))
    return {"applies": {key: str(applies[key]) for key in APPLIES}, "groups": groups}


def _expand_group(group: Any, seen: set[str]) -> list[dict[str, Any]]:
    if not isinstance(group, dict):
        raise CatalogError("every group must be a mapping")
    group_id = group.get("id")
    where = f"group {group_id!r}"
    if not isinstance(group_id, str) or not re.match(r"^[a-z0-9_]+$", group_id):
        raise CatalogError(f"{where}: id must be lowercase letters, digits and _")
    file = group.get("file")
    if not isinstance(file, str) or not file.startswith("ros/") or ".." in Path(file).parts or not file.endswith(".yaml"):
        raise CatalogError(f"{where}: file must be a ros/*.yaml path under the config root")
    if group.get("applies") not in APPLIES:
        raise CatalogError(f"{where}: applies must be one of {', '.join(APPLIES)}")
    title, prefix = group.get("title"), group.get("prefix", "")
    if not isinstance(title, str) or not title or not isinstance(prefix, str):
        raise CatalogError(f"{where}: title and prefix must be strings")
    instances = group.get("instances")
    if instances is not None and (not isinstance(instances, list) or not instances
                                  or not all(isinstance(i, str) and re.match(r"^[a-z0-9_]+$", i) for i in instances)):
        raise CatalogError(f"{where}: instances must be a list of short names")
    readback = group.get("readback")
    if readback is not None and not (isinstance(readback, dict) and isinstance(readback.get("node"), str)
                                     and readback["node"].startswith("/") and isinstance(readback.get("param"), str)):
        raise CatalogError(f"{where}: readback must be {{node: /name, param: template}}")
    params = group.get("params")
    if not isinstance(params, list) or not params:
        raise CatalogError(f"{where}: params must be a non-empty list")
    expanded = []
    for instance in instances or [None]:
        rows = []
        for param in params:
            rows.extend(_expand_param(param, group, instance, readback, seen))
        expanded.append({
            "id": group_id if instance is None else f"{group_id}@{instance}",
            "group": group_id,
            "instance": instance,
            "title": group["title"] if instance is None else f"{group['title']}（{instance}）",
            "file": file,
            "applies": group["applies"],
            "rows": rows,
        })
    return expanded


def _expand_param(param: Any, group: dict, instance: str | None, readback: dict | None, seen: set[str]) -> list[dict]:
    if not isinstance(param, dict) or not isinstance(param.get("key"), str):
        raise CatalogError(f"group {group['id']!r}: every param needs a key")
    key = param["key"]
    where = f"{group['id']}/{key}"
    kind = param.get("type")
    if kind not in KINDS:
        raise CatalogError(f"{where}: type must be one of {', '.join(KINDS)}")
    note = param.get("note")
    if not isinstance(note, str) or not note.strip():
        raise CatalogError(f"{where}: note is required")
    labels = param.get("labels")
    is_array = kind.endswith("[]")
    if is_array != isinstance(labels, list) or (is_array and (not labels or not all(isinstance(x, str) for x in labels))):
        raise CatalogError(f"{where}: array types need labels, scalars must not have them")
    count = len(labels) if is_array else 1

    def per_element(name: str) -> list:
        value = param.get(name)
        if isinstance(value, list):
            if not is_array or len(value) != count:
                raise CatalogError(f"{where}: {name} list must match labels")
            return [_number_or_none(item, f"{where}.{name}") for item in value]
        return [_number_or_none(value, f"{where}.{name}")] * count

    minimum, maximum = per_element("min"), per_element("max")
    special = param.get("special", [])
    if not isinstance(special, list):
        raise CatalogError(f"{where}: special must be a list")
    special = [_number_or_none(item, f"{where}.special") for item in special]
    instance_text = instance or ""
    prefix = group.get("prefix", "").replace("{i}", instance_text)
    full_key = key.replace("{i}", instance_text)
    prefix_segments = parse_path(prefix) if prefix else ()
    base_segments = prefix_segments + parse_path(full_key)
    template = param.get("readback", readback)
    group_id = group["id"] if instance is None else f"{group['id']}@{instance}"
    rows = []
    for element in range(count) if is_array else [None]:
        row_id = f"{group_id}/{full_key}" + ("" if element is None else f"[{element}]")
        if row_id in seen:
            raise CatalogError(f"duplicate parameter {row_id}")
        seen.add(row_id)
        label = param.get("label", key).replace("{i}", instance_text)
        if element is not None:
            label = f"{label} · {labels[element]}"
        index = 0 if element is None else element
        rows.append({
            "id": row_id,
            "key": full_key,
            "instance": instance,
            "element": element,
            "label": label,
            "kind": kind.rstrip("[]"),
            "prefix_segments": prefix_segments,
            "segments": base_segments + ((("index", element),) if element is not None else ()),
            "min": minimum[index],
            "max": maximum[index],
            "special": special,
            "max_ref": _ref(param.get("max_ref"), f"{where}.max_ref", instance_text),
            "min_ref": _ref(param.get("min_ref"), f"{where}.min_ref", instance_text),
            "unit": str(param.get("unit", "")),
            "note": note.strip(),
            "applies": group["applies"],
            "file": group["file"],
            "readback": None if template is None else {
                "node": template["node"],
                "param": template["param"].replace("{key}", full_key),
                "element": element,
            },
        })
    return rows


# --------------------------------------------------------------------------- store


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ParamStore:
    """Read, validate and write catalog values; all public methods are thread-safe."""

    def __init__(self, catalog_path: str | Path, config_root: str | Path, state_root: str | Path) -> None:
        self.catalog = load_catalog(catalog_path)
        self.config_root = Path(config_root).resolve()
        self.state_root = Path(state_root)
        self._lock = threading.Lock()
        self._sequence = 0

    # -- reading ------------------------------------------------------------

    def _path(self, file: str) -> Path:
        return self.config_root / file

    def _read_files(self) -> dict[str, dict[str, Any]]:
        files: dict[str, dict[str, Any]] = {}
        for group in self.catalog["groups"]:
            file = group["file"]
            if file in files:
                continue
            try:
                text = self._path(file).read_text(encoding="utf-8")
                files[file] = {"text": text, "sha": sha256_text(text), "data": yaml.safe_load(text),
                               "root": yaml.compose(text), "error": ""}
            except (OSError, yaml.YAMLError) as error:
                files[file] = {"text": "", "sha": "", "data": None, "root": None, "error": str(error)}
        return files

    def _resolve_rows(self, files: dict) -> tuple[dict[str, dict], list[dict], list[str]]:
        """Rows that exist in their file with the catalog type, plus per-row errors."""
        rows, groups, errors = {}, [], []
        for group in self.catalog["groups"]:
            loaded = files[group["file"]]
            kept = []
            for row in group["rows"]:
                if loaded["error"]:
                    errors.append(f"{row['id']}: {group['file']} unreadable: {loaded['error']}")
                    continue
                try:
                    node = locate_node(loaded["root"], row["segments"], row["id"])
                    value = get_value(loaded["data"], row["segments"])
                except (KeyError, IndexError, TypeError) as error:
                    errors.append(f"{row['id']}: {error}")
                    continue
                if not isinstance(node, yaml.ScalarNode) or not _file_kind_ok(value, row["kind"]):
                    errors.append(f"{row['id']}: {group['file']} has {value!r}, expected {row['kind']}")
                    continue
                resolved = dict(row, value=value)
                rows[row["id"]] = resolved
                kept.append(resolved)
            groups.append({key: group[key] for key in ("id", "title", "file", "applies")} | {"rows": kept})
        return rows, groups, errors

    def _ref_info(self, row: dict, ref: dict | None, rows: dict, files: dict) -> dict | None:
        """Where a max_ref/min_ref points: a catalog row (its staged value counts) or a plain file value."""
        if ref is None:
            return None
        prefix = row["id"].split("/", 1)[0]
        suffix = "" if row["element"] is None else f"[{row['element']}]"
        target_id = f"{prefix}/{ref['key']}{suffix}"
        if target_id in rows:
            return {"key": ref["key"], "id": target_id, "value": rows[target_id]["value"], "strict": ref["strict"]}
        segments = row["prefix_segments"] + parse_path(ref["key"]) + (
            (("index", row["element"]),) if row["element"] is not None else ()
        )
        try:
            value = get_value(files[row["file"]]["data"], segments)
        except (KeyError, IndexError, TypeError):
            return None  # e.g. arm m has no hard_max_linear_accel_mps2: no constraint there
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return None
        return {"key": ref["key"], "id": None, "value": value, "strict": ref["strict"]}

    def _state(self) -> dict[str, Any]:
        try:
            state = json.loads((self.state_root / "state.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            state = {}
        state.setdefault("written", {})
        state.setdefault("pending_restart", [])
        return state

    def _save_state(self, state: dict[str, Any]) -> None:
        self.state_root.mkdir(parents=True, exist_ok=True)
        (self.state_root / "state.json").write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")

    def _baselines(self) -> dict[str, Any]:
        try:
            return json.loads((self.state_root / "baseline.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}

    def _baseline_data(self, file: str) -> Any:
        try:
            return yaml.safe_load((self.state_root / "baseline" / file).read_text(encoding="utf-8"))
        except (OSError, yaml.YAMLError):
            return None

    def writable(self) -> tuple[bool, str]:
        directory = self.config_root / "ros"
        if not os.access(directory, os.W_OK):
            return False, f"{directory} is read-only here (mount ./config/ros read-write into this container)"
        for file in {group["file"] for group in self.catalog["groups"]}:
            if not os.access(self._path(file), os.W_OK):
                return False, f"{self._path(file)} is not writable"
        return True, ""

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            files = self._read_files()
            rows, groups, errors = self._resolve_rows(files)
            state, baselines = self._state(), self._baselines()
            baseline_data = {file: self._baseline_data(file) for file in baselines}
            for group in groups:
                public = []
                for row in group["rows"]:
                    data = baseline_data.get(row["file"])
                    baseline = row["value"]
                    if data is not None:
                        with contextlib.suppress(KeyError, IndexError, TypeError):
                            baseline = get_value(data, row["segments"])
                    public.append({
                        key: row[key] for key in (
                            "id", "key", "element", "label", "kind", "min", "max", "special",
                            "unit", "note", "applies", "file", "value", "readback",
                        )
                    } | {
                        "baseline": baseline,
                        "max_ref": self._ref_info(row, row["max_ref"], rows, files),
                        "min_ref": self._ref_info(row, row["min_ref"], rows, files),
                    })
                group["rows"] = public
            writable, reason = self.writable()
            return {
                "applies": self.catalog["applies"],
                "groups": [group for group in groups if group["rows"]],
                "files": {
                    file: {
                        "sha": loaded["sha"],
                        "baseline": file in baselines,
                        "external_change": file in state["written"] and state["written"][file] != loaded["sha"],
                    }
                    for file, loaded in files.items()
                },
                "writable": writable,
                "writable_error": reason,
                "errors": errors,
                "pending_restart": [row_id for row_id in state["pending_restart"] if row_id in rows],
            }

    # -- validation ---------------------------------------------------------

    def _validate(self, changes: Any, rows: dict, files: dict) -> dict[str, Any]:
        if not isinstance(changes, list) or not changes:
            raise ChangeError("changes must be a non-empty list")
        values, errors = {}, []
        for change in changes:
            row_id = change.get("id") if isinstance(change, dict) else None
            if row_id not in rows:
                errors.append({"id": str(row_id), "error": "not in the parameter catalog"})
                continue
            if row_id in values:
                errors.append({"id": row_id, "error": "listed twice"})
                continue
            row = rows[row_id]
            try:
                value = coerce_value(change.get("value"), row["kind"])
            except ValueError as error:
                errors.append({"id": row_id, "error": str(error)})
                continue
            if row["kind"] != "bool" and not any(same_value(value, item) for item in row["special"]):
                if row["min"] is not None and value < row["min"]:
                    errors.append({"id": row_id, "error": f"below the minimum {row['min']}"})
                    continue
                if row["max"] is not None and value > row["max"]:
                    errors.append({"id": row_id, "error": f"above the maximum {row['max']}"})
                    continue
            values[row_id] = value
        for row_id, row in rows.items():
            for name in ("max_ref", "min_ref"):
                info = self._ref_info(row, row[name], rows, files)
                if info is None:
                    continue
                if row_id not in values and info["id"] not in values:
                    continue
                own = values.get(row_id, row["value"])
                other = values.get(info["id"], info["value"]) if info["id"] else info["value"]
                if any(same_value(own, item) for item in row["special"]):
                    continue
                if name == "max_ref":
                    bad = own >= other if info["strict"] else own > other
                    sign = "<" if info["strict"] else "≤"
                else:
                    bad = own <= other if info["strict"] else own < other
                    sign = ">" if info["strict"] else "≥"
                if bad:
                    errors.append({"id": row_id, "error": f"must be {sign} {info['key']} ({other})"})
        if errors:
            raise ChangeError("some values are not acceptable", errors)
        return values

    # -- writing ------------------------------------------------------------

    def _entry_id(self) -> str:
        self._sequence += 1
        return _now().strftime("%Y%m%dT%H%M%S%fZ") + f"-{self._sequence}"

    def _write(self, values: dict, rows: dict, files: dict, expected_sha: Any, dry_run: bool,
               reverts: str | None) -> dict[str, Any]:
        by_file: dict[str, list] = {}
        for row_id, value in values.items():
            row = rows[row_id]
            by_file.setdefault(row["file"], []).append((row["segments"], value, row["kind"]))
        if not isinstance(expected_sha, dict):
            expected_sha = {}
        stale = sorted(file for file in by_file if expected_sha.get(file) != files[file]["sha"])
        if stale:
            raise ConflictError("files changed since the page read them; reload", stale)
        new_texts, diffs = {}, []
        for file, edits in sorted(by_file.items()):
            try:
                new_texts[file] = edit_text(files[file]["text"], edits)
            except (ValueError, KeyError) as error:
                raise ChangeError(f"{file}: {error}") from error
            diffs.append(unified_diff(files[file]["text"], new_texts[file], file))
        changes = [{
            "id": row_id,
            "label": rows[row_id]["label"],
            "file": rows[row_id]["file"],
            "applies": rows[row_id]["applies"],
            "before": rows[row_id]["value"],
            "after": value,
        } for row_id, value in values.items()]
        result = {"changes": changes, "diff": "".join(diffs),
                  "applies": sorted({change["applies"] for change in changes})}
        if dry_run:
            return result
        writable, reason = self.writable()
        if not writable:
            raise ConflictError(reason)
        entry_id = self._entry_id()
        backups = self.state_root / "backups" / entry_id
        baselines = self._baselines()
        for file in new_texts:
            (backups / file).parent.mkdir(parents=True, exist_ok=True)
            (backups / file).write_text(files[file]["text"], encoding="utf-8")
            if file not in baselines:
                (self.state_root / "baseline" / file).parent.mkdir(parents=True, exist_ok=True)
                (self.state_root / "baseline" / file).write_text(files[file]["text"], encoding="utf-8")
                baselines[file] = {"sha": files[file]["sha"], "saved_at": _now().isoformat()}
        (self.state_root / "baseline.json").write_text(json.dumps(baselines, indent=2), encoding="utf-8")
        written = []
        try:
            for file, text in new_texts.items():
                write_preserving(self._path(file), text)
                written.append(file)
        except OSError as error:
            for file in written:
                with contextlib.suppress(OSError):
                    write_preserving(self._path(file), files[file]["text"])
            raise ParamWriteError(f"could not write {self._path(file)}: {error}; nothing was changed") from error
        entry = {
            "id": entry_id,
            "time": _now().isoformat(),
            "reverts": reverts,
            "changes": changes,
            "files": {file: {"before_sha": files[file]["sha"], "after_sha": sha256_text(text)}
                      for file, text in new_texts.items()},
            "diff": result["diff"],
        }
        with (self.state_root / "history.jsonl").open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(entry, ensure_ascii=False) + "\n")
        state = self._state()
        for file, info in entry["files"].items():
            state["written"][file] = info["after_sha"]
        for change in changes:
            if change["applies"] == "bringup_restart" and change["id"] not in state["pending_restart"]:
                state["pending_restart"].append(change["id"])
        self._save_state(state)
        return entry

    def apply(self, changes: Any, expected_sha: Any, dry_run: bool = False) -> dict[str, Any]:
        with self._lock:
            files = self._read_files()
            rows, _, _ = self._resolve_rows(files)
            values = self._validate(changes, rows, files)
            return self._write(values, rows, files, expected_sha, dry_run, None)

    def revert(self, entry_id: Any, expected_sha: Any, dry_run: bool = False) -> dict[str, Any]:
        with self._lock:
            entry = next((item for item in self._history() if item["id"] == entry_id), None)
            if entry is None:
                raise ChangeError(f"no history entry {entry_id!r}")
            files = self._read_files()
            rows, _, _ = self._resolve_rows(files)
            changes = [{"id": change["id"], "value": change["before"]} for change in entry["changes"]]
            values = self._validate(changes, rows, files)
            result = self._write(values, rows, files, expected_sha, dry_run, entry["id"])
            result["changed_since"] = [
                change["id"] for change in entry["changes"]
                if change["id"] in rows and not same_value(rows[change["id"]]["value"], change["after"])
            ]
            return result

    # -- history, baseline, pending ------------------------------------------

    def _history(self) -> list[dict[str, Any]]:
        try:
            lines = (self.state_root / "history.jsonl").read_text(encoding="utf-8").splitlines()
        except OSError:
            return []
        entries = []
        for line in lines:
            with contextlib.suppress(ValueError):
                entries.append(json.loads(line))
        return entries

    def history(self, limit: int = HISTORY_LIMIT) -> list[dict[str, Any]]:
        with self._lock:
            return list(reversed(self._history()))[:limit]

    def export_patch(self) -> str:
        with self._lock:
            patches = []
            for file in sorted(self._baselines()):
                try:
                    before = (self.state_root / "baseline" / file).read_text(encoding="utf-8")
                    after = self._path(file).read_text(encoding="utf-8")
                except OSError:
                    continue
                patches.append(unified_diff(before, after, file))
            return "".join(patches)

    def reset_baseline(self) -> dict[str, Any]:
        with self._lock:
            baselines = self._baselines()
            if not baselines:
                return {"archived": None, "files": []}
            archive = self.state_root / "baseline-archive" / _now().strftime("%Y%m%dT%H%M%SZ")
            archive.mkdir(parents=True, exist_ok=True)
            if (self.state_root / "baseline").exists():
                shutil.move(str(self.state_root / "baseline"), str(archive / "baseline"))
            shutil.move(str(self.state_root / "baseline.json"), str(archive / "baseline.json"))
            return {"archived": str(archive), "files": sorted(baselines)}

    def clear_pending(self) -> dict[str, Any]:
        with self._lock:
            state = self._state()
            cleared = state["pending_restart"]
            state["pending_restart"] = []
            self._save_state(state)
            return {"cleared": cleared}

    # -- readback -------------------------------------------------------------

    def readback_requests(self) -> dict[str, list[str]]:
        requests: dict[str, set[str]] = {}
        for group in self.catalog["groups"]:
            for row in group["rows"]:
                if row["readback"]:
                    requests.setdefault(row["readback"]["node"], set()).add(row["readback"]["param"])
        return {node: sorted(names) for node, names in sorted(requests.items())}

    def readback(self, reader: Any) -> dict[str, Any]:
        """Run ``reader(requests)`` and compare every read-back row with its file value."""
        requests = self.readback_requests()
        nodes = reader(requests) if (reader is not None and requests) else {}
        with self._lock:
            rows, _, _ = self._resolve_rows(self._read_files())
        states = {}
        for row_id, row in rows.items():
            target = row["readback"]
            if not target:
                continue
            node = nodes.get(target["node"]) or {"available": False, "values": {}}
            value = node.get("values", {}).get(target["param"]) if node.get("available") else None
            if target["element"] is not None and isinstance(value, list):
                value = value[target["element"]] if target["element"] < len(value) else None
            if not node.get("available") or value is None:
                states[row_id] = {"state": "offline", "value": None}
            else:
                states[row_id] = {"state": "applied" if same_value(value, row["value"]) else "pending", "value": value}
        return {"nodes": {node: {"available": bool(info.get("available"))} for node, info in nodes.items()},
                "rows": states}
```

- [ ] **Step 4: Write the catalog**

Create `config/web-control/param_catalog.yaml` (ranges contain every current value; `test_root_catalog_matches_the_root_config` enforces it):

```yaml
# Parameters the :8765 parameter page (/params.html) may show and write. Values are never stored here:
# the page reads them from the files below and writes them back in place (comments and layout kept).
# Design: docs/superpowers/specs/2026-10-26-web-param-tuning-design.md; manual:
# website/docs/development/web-parameter-tuning.md. test_param_tuning.py checks every entry against the real files.
#
# Group: id, title, file (ros/*.yaml under the config root), prefix (dotted path to the parameters), applies
# (bt_start | bringup_restart), optional instances ({i} in prefix/key), optional readback {node, param: "..{key}.."}.
# Param: key, type (int | float | bool | int[] | float[]), labels (arrays: one per element), min / max (closed range,
# scalar or per element), special (values allowed outside the range, e.g. -1 = no limit), max_ref / min_ref (another
# key of the same group and instance: "key" = <= / >=, {key, strict: true} = < / >), unit, label (display name),
# note (required, shown in the 备注 column).
schema_version: 1
applies:
  bt_start: 下次启动行为树生效
  bringup_restart: 重启 bringup 后生效（行为树随之停止，需要重新启动）
groups:
  - id: policy_attempt
    title: 策略任务 · 尝试与重试
    file: ros/policy_task.yaml
    prefix: realman_bt_executor.ros__parameters.policy_task
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "policy_task.{key}"}
    params:
      - {key: cycles, type: int, min: 1, max: 1000, special: [-1], unit: 次,
         note: 需要成功的循环数；-1 = 不限。}
      - {key: attempts, type: int, min: 1, max: 20, special: [-1], unit: 次,
         note: 一个循环里允许失败的尝试次数（首次也算）；-1 = 不限。}
      - {key: timeout_retry.attempts, type: int, min: 1, max: 20, special: [-1], unit: 次,
         note: 策略服务超时的重试预算，不占 attempts；-1 = 不限。}
      - {key: timeout_retry.backoff_sec, type: float, min: 0.0, max: 120.0, unit: s,
         note: 超时重试前停桥等待的时间；要盖过服务重启后首次推理的 JIT 编译。}
      - {key: max_attempt_sec, type: float, min: 5.0, max: 300.0, unit: s,
         note: 单次尝试在这段时间内没有成功即判超时（可重试）。}
      - {key: service_wait_sec, type: float, min: 1.0, max: 60.0, unit: s,
         note: 预检等待停止 / 启动服务和数据的上限，超时算故障。}
      - {key: service_call_timeout_sec, type: float, min: 0.1, max: 30.0, unit: s,
         note: 单次服务调用等回复的上限；停止流程超时后继续往下走。}
      - {key: router_release_sec, type: float, min: 0.0, max: 10.0, unit: s,
         note: 停止后等路由释放速度会话的时间，避免下一次 MoveJ 被拒。}
  - id: policy_safety
    title: 策略任务 · 安全监督
    file: ros/policy_task.yaml
    prefix: realman_bt_executor.ros__parameters.policy_task
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "policy_task.{key}"}
    params:
      - {key: joint_envelope_deg.lo, type: "float[]", labels: [J1, J2, J3, J4, J5, J6], min: -180.0, max: 180.0,
         max_ref: joint_envelope_deg.hi, unit: deg,
         note: 策略运行时各关节下限，越界即故障停止（不重试）；来自示教数据 p1 再放宽 10°。}
      - {key: joint_envelope_deg.hi, type: "float[]", labels: [J1, J2, J3, J4, J5, J6], min: -180.0, max: 180.0,
         min_ref: joint_envelope_deg.lo, unit: deg,
         note: 策略运行时各关节上限，越界即故障停止（不重试）；来自示教数据 p99 再放宽 10°。}
      - {key: max_joint_speed_dps, type: float, min: 5.0, max: 180.0, unit: deg/s,
         note: 相邻 joint_states 折算的关节速度上限，超过即故障。}
      - {key: lm_drift_limit_deg, type: float, min: 0.1, max: 10.0, unit: deg,
         note: 未被驱动的两条手臂允许偏离起始位置的角度。}
      - {key: joint_state_stale_sec, type: float, min: 0.1, max: 10.0, unit: s,
         note: 任一手臂 joint_states 超过这么久没更新即故障。}
      - {key: stats_stale_sec, type: float, min: 1.0, max: 60.0, unit: s,
         note: /policy/stats（1 Hz）超过这么久没更新即判策略服务超时。}
      - {key: stall.cmd_lin_mps_below, type: float, min: 0.0, max: 0.1, unit: m/s,
         note: 停滞判定：夹爪闭合且命令线速度低于它（角速度也低于下一项）持续 stall.sec。}
      - {key: stall.cmd_ang_radps_below, type: float, min: 0.0, max: 0.5, unit: rad/s,
         note: 停滞判定的命令角速度阈值。}
      - {key: stall.sec, type: float, min: 1.0, max: 60.0, unit: s,
         note: 停滞持续这么久即停下重试。}
      - {key: current_guard.enabled, type: bool,
         note: 关节电流保护开关；false 只记录电流，不因过流停止。}
      - {key: current_guard.limits_ma, type: "int[]", labels: [J1, J2, J3, J4, J5, J6], min: 500, max: 20000,
         unit: mA, note: 被监督手臂任一关节电流持续 sustain_sec 超过它即停下重试（overcurrent）。}
      - {key: current_guard.sustain_sec, type: float, min: 0.1, max: 5.0, unit: s,
         note: 过流要连续保持这么久才判定。}
  - id: policy_verdict
    title: 策略任务 · 成功判定
    file: ros/policy_task.yaml
    prefix: realman_bt_executor.ros__parameters.policy_task
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "policy_task.{key}"}
    params:
      - {key: release.open_above, type: float, min: 0.0, max: 1.0,
         note: 释放判定：策略夹爪命令高于它算张开。}
      - {key: release.closed_below, type: float, min: 0.0, max: 1.0,
         max_ref: {key: release.open_above, strict: true}, note: 策略夹爪命令低于它算闭合。}
      - {key: release.min_closed_sec, type: float, min: 0.0, max: 30.0, unit: s,
         note: 释放前夹爪累计闭合至少这么久。}
      - {key: release.joint_below_deg, type: float, min: -180.0, max: 180.0, unit: deg,
         note: 释放时 release.joint_index 关节须低于它（料箱一侧），防止在桌垫上方张开被当成完成。}
      - {key: release.settle_sec, type: float, min: 0.0, max: 10.0, unit: s,
         note: 释放命令后继续监督这么久，确认夹爪真的张开。}
      - {key: lift.min_closed_sec, type: float, min: 0.0, max: 30.0, unit: s,
         note: 抬起判定：夹爪命令闭合至少这么久。}
      - {key: lift.joint_delta_deg, type: float, min: -90.0, max: 90.0, unit: deg,
         note: 抬起判定：lift.joint_index 关节相对闭合时的变化量（负数 = 减小；J2 抬起时减小）。}
      - {key: lift.hold_sec, type: float, min: 0.0, max: 30.0, unit: s,
         note: 抬起状态保持这么久算成功。}
      - {key: lift.wrong_side_below_deg, type: float, min: -180.0, max: 180.0, unit: deg,
         note: 闭合后 wrong_side_joint_index 关节低于它算拿错任务（故障，不重试）。}
      - {key: verdict.window_sec, type: float, min: 0.5, max: 10.0, unit: s,
         note: 抓取判定取闭合阶段最后这么久的夹爪位置中位数。}
      - {key: verdict.empty_position_min, type: float, min: 0.0, max: 10000.0, unit: 设备单位,
         note: 位置中位数不低于它（且没有到达力矩）算空抓。}
      - {key: gripper_ready.open_position_max, type: float, min: 0.0, max: 10000.0, unit: 设备单位,
         note: GripperReady：夹爪位置不高于它算已张开。}
      - {key: gripper_ready.timeout_sec, type: float, min: 1.0, max: 120.0, unit: s,
         note: GripperReady 等夹爪张开的上限。}
      - {key: gripper_ready.position_stale_sec, type: float, min: 0.1, max: 10.0, unit: s,
         note: 夹爪位置超过这么久没更新即不可信。}
  - id: policy_detection
    title: 策略任务 · 清台检测
    file: ros/policy_task.yaml
    prefix: realman_bt_executor.ros__parameters.policy_task.object_detection
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "policy_task.object_detection.{key}"}
    params:
      - {key: roi_xywh, type: "int[]", labels: [x, y, w, h], min: 0, max: 640, unit: px,
         note: 全局 D435 图像（640×480）里桌垫的区域；挪过相机要重新量。}
      - {key: min_channel, type: int, min: 0, max: 255,
         note: 像素最小 RGB 通道不低于它才可能算白色。}
      - {key: max_chroma, type: int, min: 0, max: 255,
         note: 像素 RGB 通道最大减最小不超过它才算白色。}
      - {key: erode_px, type: int, min: 1, max: 31, unit: px,
         note: 腐蚀窗口边长，去掉细白线缆。}
      - {key: min_pixels, type: int, min: 1, max: 100000, unit: px,
         note: 腐蚀后白色像素不少于它即认为桌上还有物体。}
      - {key: settle_sec, type: float, min: 0.0, max: 10.0, unit: s,
         note: 开始检测后等这么久再取图（手臂先停稳）。}
      - {key: timeout_sec, type: float, min: 0.5, max: 30.0, unit: s,
         note: 之后这么久还没有图像即任务失败。}
  - id: bt_executor
    title: 行为树执行器
    file: ros/behavior_tree.yaml
    prefix: realman_bt_executor.ros__parameters
    applies: bt_start
    readback: {node: /realman_bt_executor, param: "{key}"}
    params:
      - {key: tick_rate_hz, type: float, min: 1.0, max: 50.0, unit: Hz,
         note: 每秒 tick 次数；每次 tick 重新评估输入模式选择。}
      - {key: switch_timeout_ms, type: int, min: 500, max: 30000, unit: ms,
         note: 等网页 / 选择器切换的上限，超时 FAILED 并回到安全模式。}
      - {key: shutdown_drain_timeout_sec, type: float, min: 1.0, max: 60.0, unit: s,
         note: ~/shutdown 等 MoveJ 和速度会话取消完成的上限。}
  - id: motion
    title: 运动限速 · 驱动
    file: ros/realman_motion.yaml
    prefix: "robots.{i}"
    instances: [l, m, r]
    applies: bringup_restart
    params:
      - {key: max_linear_speed_mps, type: float, min: 0.005, max: 0.25, max_ref: hard_max_linear_speed_mps, unit: m/s,
         note: 笛卡尔平移速度上限，普通运动和速度会话都受它限制。}
      - {key: max_angular_speed_radps, type: float, min: 0.01, max: 0.6, max_ref: hard_max_angular_speed_radps,
         unit: rad/s, note: 笛卡尔旋转速度上限。}
      - {key: max_linear_accel_mps2, type: float, min: 0.01, max: 2.0, max_ref: hard_max_linear_accel_mps2,
         unit: m/s², note: 笛卡尔平移加速度上限，限制负载冲击。}
      - {key: max_angular_accel_radps2, type: float, min: 0.05, max: 4.0, max_ref: hard_max_angular_accel_radps2,
         unit: rad/s², note: 笛卡尔旋转加速度上限，限制腕部冲击。}
      - {key: velocity_watchdog_ms, type: int, min: 20, max: 1000, unit: ms,
         note: 速度控制超过这么久没有刷新即停止（失效保护）。}
      - {key: joint_goal_tolerance_deg, type: float, min: 0.01, max: 5.0, unit: deg,
         note: 关节运动到位判定的容差。}
      - {key: pose_max_joint_speed_dps, type: float, min: 1.0, max: 180.0, unit: deg/s,
         note: 位姿运动折算的关节速度上限。}
      - {key: default_timeout_sec, type: float, min: 1.0, max: 120.0, unit: s,
         note: 动作的默认截止时间，避免卡住的操作无限等待。}
      - {key: stop_timeout_sec, type: float, min: 0.5, max: 30.0, unit: s,
         note: 停止请求等待机械臂停稳的上限。}
  - id: policy_router
    title: 运动限速 · 策略路由
    file: ros/policy_router.yaml
    prefix: policy_control_router.ros__parameters
    applies: bt_start
    readback: {node: /policy_control_router, param: "{key}"}
    params:
      - {key: max_linear_speed_mps, type: float, min: 0.005, max: 0.25, unit: m/s,
         note: 策略速度会话的平移速度上限，独立于策略本身的第二道保护。}
      - {key: max_angular_speed_radps, type: float, min: 0.01, max: 0.6, unit: rad/s,
         note: 策略速度会话的旋转速度上限。}
      - {key: max_linear_accel_mps2, type: float, min: 0.01, max: 2.0, unit: m/s², note: 策略速度会话的平移加速度上限。}
      - {key: max_angular_accel_radps2, type: float, min: 0.05, max: 4.0, unit: rad/s², note: 策略速度会话的旋转加速度上限。}
      - {key: stale_ms, type: int, min: 10, max: 1000, max_ref: {key: input_timeout_ms, strict: true}, unit: ms,
         note: 时间戳早于它的命令被丢弃；数据流中断这么久后归零。}
      - {key: input_timeout_ms, type: int, min: 50, max: 5000, min_ref: {key: stale_ms, strict: true}, unit: ms,
         note: 数据流中断这么久后释放速度会话。}
      - {key: drift_limit_deg, type: float, min: 0.1, max: 10.0, unit: deg,
         note: 会话开始后窗口内任一关节自行移动超过它即取消会话。}
      - {key: drift_window_sec, type: float, min: 0.1, max: 10.0, unit: s, note: 上一项的检测窗口。}
      - {key: gripper_max_hz, type: float, min: 0.5, max: 20.0, unit: Hz, note: 转发夹爪命令的最高频率。}
  - id: pika_velocity
    title: 运动限速 · Pika 速度
    file: ros/pika_config.yaml
    prefix: pika_velocity
    applies: bt_start
    readback: {node: /pika_control_router, param: "pika_velocity_{key}"}
    params:
      - {key: stale_ms, type: int, min: 10, max: 2000, max_ref: {key: input_timeout_ms, strict: true}, unit: ms,
         note: Pika 命令早于它被丢弃；中断这么久后归零。}
      - {key: input_timeout_ms, type: int, min: 50, max: 10000, min_ref: {key: stale_ms, strict: true}, unit: ms,
         note: Pika 数据流中断这么久后释放速度会话。}
      - {key: max_linear_speed_mps, type: float, min: 0.005, max: 0.25, unit: m/s, note: Pika 速度会话的平移速度上限。}
      - {key: max_angular_speed_radps, type: float, min: 0.01, max: 0.6, unit: rad/s, note: Pika 速度会话的旋转速度上限。}
      - {key: max_linear_accel_mps2, type: float, min: 0.01, max: 2.0, unit: m/s², note: Pika 速度会话的平移加速度上限。}
      - {key: max_angular_accel_radps2, type: float, min: 0.05, max: 4.0, unit: rad/s², note: Pika 速度会话的旋转加速度上限。}
  - id: pika_mixed
    title: 运动限速 · Pika 混合
    file: ros/pika_config.yaml
    prefix: pika_mixed
    applies: bt_start
    readback: {node: /pika_control_router, param: "pika_mixed_{key}"}
    params:
      - {key: stale_ms, type: int, min: 10, max: 2000, max_ref: {key: input_timeout_ms, strict: true}, unit: ms,
         note: 混合模式命令早于它被丢弃。}
      - {key: input_timeout_ms, type: int, min: 50, max: 10000, min_ref: {key: stale_ms, strict: true}, unit: ms,
         note: 混合模式数据流中断这么久后释放会话。}
      - {key: max_linear_speed_mps, type: float, min: 0.005, max: 0.25, unit: m/s, note: 混合模式平移速度上限。}
      - {key: max_linear_accel_mps2, type: float, min: 0.01, max: 2.0, unit: m/s², note: 混合模式平移加速度上限。}
      - {key: max_angular_speed_radps, type: float, min: 0.01, max: 0.6, unit: rad/s, note: 混合模式旋转速度上限。}
      - {key: max_position_lead_m, type: float, min: 0.005, max: 0.5, unit: m, note: 目标位置最多领先当前位置这么多。}
      - {key: max_orientation_lead_rad, type: float, min: 0.01, max: 1.0, unit: rad, note: 目标姿态最多领先当前姿态这么多。}
      - {key: pose_poll_hz, type: float, min: 1.0, max: 50.0, unit: Hz, note: 读取当前位姿的频率。}
  - id: gripper
    title: 夹爪
    file: ros/gripper.yaml
    prefix: "buses[port=/dev/realman/gripper_{i}]"
    instances: [right, left, mid]
    applies: bringup_restart
    params:
      - {key: "grippers[name=gripper_{i}].speed_pct", label: speed_pct, type: int, min: 1, max: 100, unit: "%",
         note: 夹爪运动速度百分比。}
      - {key: "grippers[name=gripper_{i}].force_pct", label: force_pct, type: int, min: 20, max: 100, unit: "%",
         note: 夹持力百分比。}
      - {key: "grippers[name=gripper_{i}].accel", label: accel, type: int, min: 100, max: 10000, note: 加速度（设备单位）。}
      - {key: "grippers[name=gripper_{i}].decel", label: decel, type: int, min: 100, max: 10000, note: 减速度（设备单位）。}
      - {key: min_command_interval_s, type: float, min: 0.05, max: 2.0, unit: s,
         note: 连续目标的最小触发间隔；实测 20 Hz 触发夹爪不动，4 Hz 最快。}
      - {key: command_deadband, type: float, min: 0.0, max: 0.2,
         note: 与上次目标相差小于行程的这个比例就不重发（全开 / 全闭端点除外）。}
      - {key: streaming_poll_interval, type: float, min: 0.05, max: 5.0, unit: s,
         note: 连续控制期间的反馈轮询周期，越大下发越稳。}
      - {key: command_quiet_s, type: float, min: 0.05, max: 2.0, unit: s, note: 目标持续到达的判定间隔。}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_tuning.py -p no:cacheprovider`
Expected: `32 passed` (one of them, `test_read_only_config_is_a_conflict`, skips only when run as root).

Then the whole suite: `PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider` → `208 passed, 1 skipped`.

Lint from `$WT`: `$RUFF check --config config/python/ruff.toml src/driver/realman_web_control` → `All checks passed!`

- [ ] **Step 6: Commit**

```bash
cd $WT
git add config/web-control/param_catalog.yaml \
  src/driver/realman_web_control/realman_web_control/param_tuning.py \
  src/driver/realman_web_control/test/test_param_tuning.py
git commit -m "feat(web-control): catalog-driven in-place tuning of config/ros values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: ROS-free parameter readback

**Files:**
- Create: `src/driver/realman_web_control/realman_web_control/param_readback.py`
- Test: `src/driver/realman_web_control/test/test_param_readback.py`

**Interfaces:**
- Produces (used by Task 4): `ParameterReadback(clients: dict[node, client], request_factory: Callable[[], request], timeout_sec: float)` with `read({node: [names]}) -> {node: {"available": bool, "values": {name: value}}}`; `parameter_value(msg) -> bool|int|float|list|None`. A client needs `service_is_ready()`, `call_async(request) -> future` (`add_done_callback`, `done`, `result`) and optionally `remove_pending_request(future)` — exactly the rclpy `Client` surface.

- [ ] **Step 1: Write the failing tests**

Create `src/driver/realman_web_control/test/test_param_readback.py`:

```python
from types import SimpleNamespace

from realman_web_control.param_readback import ParameterReadback, parameter_value


class FakeFuture:
    def __init__(self, response=None, error=None, complete=True):
        self.response, self.error, self.complete, self.callbacks = response, error, complete, []

    def add_done_callback(self, callback):
        if self.complete:
            callback(self)
        else:
            self.callbacks.append(callback)

    def done(self):
        return self.complete

    def result(self):
        if self.error:
            raise self.error
        return self.response


class FakeClient:
    def __init__(self, ready=True, future=None):
        self.ready, self.future, self.requests, self.removed = ready, future, [], []

    def service_is_ready(self):
        return self.ready

    def call_async(self, request):
        self.requests.append(list(request.names))
        return self.future

    def remove_pending_request(self, future):
        self.removed.append(future)


def value(kind, **fields):
    defaults = dict(bool_value=False, integer_value=0, double_value=0.0,
                    bool_array_value=[], integer_array_value=[], double_array_value=[])
    return SimpleNamespace(type=kind, **(defaults | fields))


def request():
    return SimpleNamespace(names=[])


def test_parameter_values_convert_by_type():
    assert parameter_value(value(1, bool_value=True)) is True
    assert parameter_value(value(2, integer_value=7)) == 7
    assert parameter_value(value(3, double_value=0.5)) == 0.5
    assert parameter_value(value(7, integer_array_value=[1, 2])) == [1, 2]
    assert parameter_value(value(8, double_array_value=[1.5])) == [1.5]
    assert parameter_value(value(6, bool_array_value=[True])) == [True]
    assert parameter_value(value(0)) is None
    assert parameter_value(value(4)) is None  # strings are not tunable


def test_read_returns_values_per_node_and_unavailable_nodes():
    response = SimpleNamespace(values=[value(3, double_value=0.1), value(8, double_array_value=[1.0, 2.0])])
    ready = FakeClient(future=FakeFuture(response))
    reader = ParameterReadback({"/a": ready, "/b": FakeClient(ready=False)}, request, 0.2)
    result = reader.read({"/a": ["x", "y"], "/b": ["z"], "/c": ["w"]})
    assert result["/a"] == {"available": True, "values": {"x": 0.1, "y": [1.0, 2.0]}}
    assert result["/b"] == {"available": False, "values": {}}
    assert result["/c"] == {"available": False, "values": {}}
    assert ready.requests == [["x", "y"]]


def test_timeouts_and_failed_calls_read_as_unavailable():
    slow = FakeClient(future=FakeFuture(complete=False))
    broken = FakeClient(future=FakeFuture(error=RuntimeError("gone")))
    reader = ParameterReadback({"/slow": slow, "/broken": broken}, request, 0.05)
    result = reader.read({"/slow": ["x"], "/broken": ["y"]})
    assert result == {"/slow": {"available": False, "values": {}}, "/broken": {"available": False, "values": {}}}
    assert slow.removed == [slow.future]
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_readback.py -p no:cacheprovider`
Expected: `ModuleNotFoundError: No module named 'realman_web_control.param_readback'`.

- [ ] **Step 3: Write the module**

Create `src/driver/realman_web_control/realman_web_control/param_readback.py`:

```python
"""Read ROS parameters of running nodes for the parameter page, without importing rclpy.

``web_control_node`` builds one ``rcl_interfaces/srv/GetParameters`` client per node at startup and
hands them in; this module only sends the requests, waits with one shared deadline and converts
``ParameterValue`` messages by their ``type`` number.
"""

from __future__ import annotations

import contextlib
import threading
import time
from typing import Any, Callable

# rcl_interfaces/msg/ParameterType constants.
PARAMETER_BOOL = 1
PARAMETER_INTEGER = 2
PARAMETER_DOUBLE = 3
PARAMETER_BOOL_ARRAY = 6
PARAMETER_INTEGER_ARRAY = 7
PARAMETER_DOUBLE_ARRAY = 8


def parameter_value(value: Any) -> Any:
    """Python value of a ParameterValue message; ``None`` for unset or unsupported types."""
    kind = getattr(value, "type", 0)
    if kind == PARAMETER_BOOL:
        return bool(value.bool_value)
    if kind == PARAMETER_INTEGER:
        return int(value.integer_value)
    if kind == PARAMETER_DOUBLE:
        return float(value.double_value)
    if kind == PARAMETER_BOOL_ARRAY:
        return [bool(item) for item in value.bool_array_value]
    if kind == PARAMETER_INTEGER_ARRAY:
        return [int(item) for item in value.integer_array_value]
    if kind == PARAMETER_DOUBLE_ARRAY:
        return [float(item) for item in value.double_array_value]
    return None


class ParameterReadback:
    """``read({node: [names]})`` -> ``{node: {"available": bool, "values": {name: value}}}``."""

    def __init__(self, clients: dict[str, Any], request_factory: Callable[[], Any], timeout_sec: float) -> None:
        self._clients = dict(clients)
        self._request_factory = request_factory
        self._timeout_sec = float(timeout_sec)

    def read(self, requests: dict[str, list[str]]) -> dict[str, dict[str, Any]]:
        result: dict[str, dict[str, Any]] = {}
        pending = []
        for node, names in requests.items():
            client = self._clients.get(node)
            if client is None or not client.service_is_ready():
                result[node] = {"available": False, "values": {}}
                continue
            request = self._request_factory()
            request.names = list(names)
            done = threading.Event()
            future = client.call_async(request)
            future.add_done_callback(lambda _future, event=done: event.set())
            pending.append((node, list(names), future, done))
        deadline = time.monotonic() + self._timeout_sec
        for node, names, future, done in pending:
            response = None
            if done.wait(max(0.0, deadline - time.monotonic())):
                try:
                    response = future.result()
                except Exception:  # noqa: BLE001 - a failed call only means "not readable now"
                    response = None
            if response is None:
                # Do not let unanswered requests pile up in the client while the page keeps polling.
                remove = getattr(self._clients[node], "remove_pending_request", None)
                if remove is not None and not future.done():
                    with contextlib.suppress(Exception):
                        remove(future)
                result[node] = {"available": False, "values": {}}
                continue
            values = list(getattr(response, "values", []))
            result[node] = {
                "available": True,
                "values": {name: parameter_value(value) for name, value in zip(names, values)},
            }
        return result
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_readback.py -p no:cacheprovider` → `3 passed`.
Lint: `$RUFF check --config config/python/ruff.toml src/driver/realman_web_control` (from `$WT`) → clean.

- [ ] **Step 5: Commit**

```bash
cd $WT
git add src/driver/realman_web_control/realman_web_control/param_readback.py \
  src/driver/realman_web_control/test/test_param_readback.py
git commit -m "feat(web-control): read ROS parameters back without importing rclpy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: HTTP API and the `param_tuning` config section

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/web_server.py`
- Modify: `config/ros/realman_web_control.yaml` (append a section)
- Test: `src/driver/realman_web_control/test/test_param_api.py`

**Interfaces:**
- Consumes: `ParamStore`, `ChangeError`, `ConflictError`, `ParamWriteError` from Task 1.
- Produces (used by Tasks 4 and 5): `WebServerConfig.param_catalog_file: Path | None`, `WebServerConfig.param_readback_timeout_sec: float`; `WebControlServer(..., param_store=None, param_store_error="", param_reader=None)`; routes `GET /api/params`, `GET /api/params/readback`, `GET /api/params/history` (`{"entries": [...]}`), `GET /api/params/export` (text/x-diff attachment), `POST /api/params/apply` and `POST /api/params/revert` (200 result, 400 `{"error", "errors"}`, 409 `{"error", "files"}`, 500 `{"error"}`), `POST /api/params/baseline/reset`, `POST /api/params/pending/clear`. Disabled catalog → 404; broken catalog → 503 with the reason as text.

- [ ] **Step 1: Write the failing tests**

Create `src/driver/realman_web_control/test/test_param_api.py`:

```python
import asyncio
import json
from pathlib import Path

import pytest
import yaml
from aiohttp import web

from realman_web_control.param_tuning import ParamStore
from realman_web_control.web_server import WebControlServer, WebServerConfig, load_server_config

ROOT = Path(__file__).resolve().parents[4]
ROOT_CONFIG = ROOT / "config/ros/realman_web_control.yaml"

SAMPLE = "node:\n  speed: 0.10  # m/s\n  count: 3\n"
CATALOG = """\
schema_version: 1
applies: {bt_start: 下次启动行为树生效, bringup_restart: 重启 bringup 后生效}
groups:
  - id: main
    title: 主参数
    file: ros/sample.yaml
    prefix: node
    applies: bringup_restart
    readback: {node: /sample_node, param: "{key}"}
    params:
      - {key: speed, type: float, min: 0.01, max: 1.0, unit: m/s, note: 速度}
      - {key: count, type: int, min: 1, max: 10, note: 次数}
"""


class FakeLogger:
    def __init__(self):
        self.lines = []

    def error(self, message):
        self.lines.append(message)

    def warning(self, message):
        self.lines.append(message)


class FakeRequest:
    def __init__(self, body=None, origin=None):
        self.headers = {"Origin": origin} if origin else {}
        self.scheme = "http"
        self.host = "robot:8765"
        self.remote = "10.0.0.9"
        self._body = body

    async def json(self):
        if self._body is None:
            raise ValueError("no body")
        return self._body


def _server(tmp_path, *, enabled=True, store=True, reader=None):
    (tmp_path / "config/ros").mkdir(parents=True, exist_ok=True)
    (tmp_path / "config/web-control").mkdir(parents=True, exist_ok=True)
    (tmp_path / "config/ros/sample.yaml").write_text(SAMPLE, encoding="utf-8")
    catalog = tmp_path / "config/web-control/param_catalog.yaml"
    catalog.write_text(CATALOG, encoding="utf-8")
    config = WebServerConfig(
        bind_host="127.0.0.1", port=8765, allowed_origins=("same-origin",), max_clients=8,
        max_message_bytes=65536, discovery_period_sec=1.0, web_override_timeout_sec=5.0,
        param_catalog_file=catalog if enabled else None,
    )
    param_store = ParamStore(catalog, tmp_path / "config", tmp_path / "logs/param-tuning") if store else None
    return WebControlServer(
        config=config, manifest={}, static_root=tmp_path, description_root=tmp_path,
        calibration_config_file=tmp_path / "c.yaml", calibration_log_root=tmp_path,
        on_command=lambda *_: None, on_client_connected=None, logger=FakeLogger(),
        param_store=param_store, param_store_error="" if store else "catalog broken", param_reader=reader,
    )


def body(response):
    return json.loads(response.text)


def shas(server):
    return {file: info["sha"] for file, info in body(asyncio.run(server._params(None)))["files"].items()}


def test_root_config_enables_the_page_with_the_root_catalog():
    config = load_server_config(ROOT_CONFIG)
    assert config.param_catalog_file == ROOT / "config/web-control/param_catalog.yaml"
    assert config.param_readback_timeout_sec == 0.5


@pytest.mark.parametrize("change, match", [
    ({"readback_timeout_sec": 0}, "readback_timeout_sec"),
    ({"readback_timeout_sec": 9}, "readback_timeout_sec"),
    ({"catalog_file": 3}, "catalog_file"),
])
def test_param_tuning_config_is_validated(tmp_path, change, match):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["param_tuning"].update(change)
    (tmp_path / "ros").mkdir()
    path = tmp_path / "ros" / "web.yaml"
    path.write_text(yaml.safe_dump(document))
    with pytest.raises(ValueError, match=match):
        load_server_config(path)


def test_empty_catalog_file_disables_the_routes(tmp_path):
    document = yaml.safe_load(ROOT_CONFIG.read_text())
    document["param_tuning"]["catalog_file"] = ""
    (tmp_path / "ros").mkdir()
    (tmp_path / "ros" / "web.yaml").write_text(yaml.safe_dump(document))
    assert load_server_config(tmp_path / "ros" / "web.yaml").param_catalog_file is None
    server = _server(tmp_path, enabled=False)
    with pytest.raises(web.HTTPNotFound):
        asyncio.run(server._params(None))
    with pytest.raises(web.HTTPNotFound):
        asyncio.run(server._params_apply(FakeRequest({"changes": []})))


def test_broken_catalog_is_a_503_with_the_reason(tmp_path):
    server = _server(tmp_path, store=False)
    with pytest.raises(web.HTTPServiceUnavailable) as caught:
        asyncio.run(server._params(None))
    assert caught.value.text == "catalog broken"


def test_snapshot_is_not_cached(tmp_path):
    response = asyncio.run(_server(tmp_path)._params(None))
    assert response.headers["Cache-Control"] == "no-store"
    assert [row["id"] for row in body(response)["groups"][0]["rows"]] == ["main/speed", "main/count"]


def test_dry_run_then_apply(tmp_path):
    server = _server(tmp_path)
    request = {"changes": [{"id": "main/speed", "value": 0.2}], "expected_sha": shas(server)}
    preview = asyncio.run(server._params_apply(FakeRequest(request | {"dry_run": True}, "http://robot:8765")))
    assert preview.status == 200 and "+  speed: 0.2  # m/s" in body(preview)["diff"]
    assert (tmp_path / "config/ros/sample.yaml").read_text() == SAMPLE
    applied = asyncio.run(server._params_apply(FakeRequest(request)))
    assert applied.status == 200 and body(applied)["changes"][0]["after"] == 0.2
    assert "  speed: 0.2  # m/s\n" in (tmp_path / "config/ros/sample.yaml").read_text()
    assert any("main/speed=0.1->0.2" in line and "10.0.0.9" in line for line in server.logger.lines)
    entries = body(asyncio.run(server._params_history(None)))["entries"]
    assert [entry["id"] for entry in entries] == [body(applied)["id"]]


def test_bad_values_conflicts_and_bodies(tmp_path):
    server = _server(tmp_path)
    bad = asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/count", "value": 0}],
                                                        "expected_sha": shas(server)})))
    assert bad.status == 400 and body(bad)["errors"] == [{"id": "main/count", "error": "below the minimum 1"}]
    stale = asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/count", "value": 2}],
                                                          "expected_sha": {"ros/sample.yaml": "old"}})))
    assert stale.status == 409 and body(stale)["files"] == ["ros/sample.yaml"]
    with pytest.raises(web.HTTPForbidden):
        asyncio.run(server._params_apply(FakeRequest({"changes": []}, "http://evil.example")))
    with pytest.raises(web.HTTPBadRequest):
        asyncio.run(server._params_apply(FakeRequest(None)))


def test_revert_export_baseline_and_pending(tmp_path):
    server = _server(tmp_path)
    applied = body(asyncio.run(server._params_apply(FakeRequest({
        "changes": [{"id": "main/speed", "value": 0.2}], "expected_sha": shas(server)}))))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == ["main/speed"]
    export = asyncio.run(server._params_export(None))
    assert export.content_type == "text/x-diff"
    assert export.headers["Content-Disposition"] == 'attachment; filename="param-tuning.patch"'
    assert export.text.startswith("--- a/config/ros/sample.yaml")
    reverted = asyncio.run(server._params_revert(FakeRequest({"entry": applied["id"], "expected_sha": shas(server)})))
    assert reverted.status == 200 and body(reverted)["reverts"] == applied["id"]
    assert body(asyncio.run(server._params_pending_clear(FakeRequest({}))))["cleared"] == ["main/speed"]
    reset = body(asyncio.run(server._params_baseline_reset(FakeRequest({}))))
    assert reset["files"] == ["ros/sample.yaml"]


def test_readback_uses_the_reader_or_reports_offline(tmp_path):
    def reader(requests):
        assert requests == {"/sample_node": ["count", "speed"]}
        return {"/sample_node": {"available": True, "values": {"speed": 0.1, "count": 4}}}

    rows = body(asyncio.run(_server(tmp_path, reader=reader)._params_readback(None)))["rows"]
    assert rows == {"main/speed": {"state": "applied", "value": 0.1}, "main/count": {"state": "pending", "value": 4}}
    offline = body(asyncio.run(_server(tmp_path / "x")._params_readback(None)))["rows"]
    assert offline["main/speed"] == {"state": "offline", "value": None}


def test_successful_bringup_restart_clears_pending(tmp_path):
    server = _server(tmp_path)
    server.config = WebServerConfig(**{**server.config.__dict__, "docker_restart_url": "http://helper",
                                       "docker_restart_service": "realman_bringup_remote"})
    asyncio.run(server._params_apply(FakeRequest({"changes": [{"id": "main/speed", "value": 0.2}],
                                                  "expected_sha": shas(server)})))
    replies = iter([(409, {"ok": False, "error": "busy"}), (200, {"ok": True})])

    async def fake_call(method, path, payload=None):
        return next(replies)

    server._docker_restart_call = fake_call
    asyncio.run(server._docker_restart(FakeRequest({})))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == ["main/speed"]
    asyncio.run(server._docker_restart(FakeRequest({})))
    assert body(asyncio.run(server._params(None)))["pending_restart"] == []
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_api.py -p no:cacheprovider`
Expected: failures with `TypeError: WebServerConfig.__init__() got an unexpected keyword argument 'param_catalog_file'` and `KeyError: 'param_tuning'`.

- [ ] **Step 3: Add the config section**

Append to `config/ros/realman_web_control.yaml` (after the `docker_restart:` block, keep one blank line between):

```yaml

param_tuning:
  catalog_file: web-control/param_catalog.yaml  # The /params.html page; empty string disables it. Writes need ./config/ros mounted read-write.
  readback_timeout_sec: 0.5  # Per-node GetParameters wait for the 运行值 column.
```

- [ ] **Step 4: Change `web_server.py`**

Make these exact replacements in `src/driver/realman_web_control/realman_web_control/web_server.py`.

4a. Import (after the `model_manifest` import):

```python
from .model_manifest import resolve_model_asset
from .param_tuning import ChangeError, ConflictError, ParamWriteError
```

4b. Two new `WebServerConfig` fields after `docker_restart_service: str = ""`:

```python
    docker_restart_service: str = ""
    # Catalog of the /params.html parameter page; None disables the page and its /api/params* routes.
    param_catalog_file: Path | None = None
    param_readback_timeout_sec: float = 0.5
```

4c. In `load_server_config`, insert directly before `bind_host = server.get("bind_host")`:

```python
    tuning = document.get("param_tuning", {})
    if not isinstance(tuning, dict):
        raise ValueError("param_tuning must be a mapping")
    catalog_file = tuning.get("catalog_file", "")
    if not isinstance(catalog_file, str):
        raise ValueError("param_tuning.catalog_file must be a path or empty")
    readback_timeout = tuning.get("readback_timeout_sec", 0.5)
    if (isinstance(readback_timeout, bool) or not isinstance(readback_timeout, (int, float))
            or not math.isfinite(readback_timeout) or not 0 < readback_timeout <= 5):
        raise ValueError("param_tuning.readback_timeout_sec must be above 0 and at most 5")
```

and in the `WebServerConfig(...)` call, after `docker_restart_service=...,`:

```python
        param_catalog_file=(config_root / catalog_file) if catalog_file else None,
        param_readback_timeout_sec=float(readback_timeout),
```

(`config_root` is already defined above for the launcher paths: `Path(path).resolve().parent.parent`.)

4d. `WebControlServer.__init__` gets three keyword arguments after `logger: Any,`:

```python
        logger: Any,
        param_store: Any = None,
        param_store_error: str = "",
        param_reader: Callable[[dict[str, list[str]]], dict[str, Any]] | None = None,
    ) -> None:
```

and stores them after `self.logger = logger`:

```python
        # param_tuning.ParamStore (None when the catalog is disabled or broken) and the ROS readback.
        self.param_store = param_store
        self.param_store_error = param_store_error
        self.param_reader = param_reader
```

4e. Routes in `_start_async`, directly before `app.router.add_get("/api/calibration", self._calibration)`:

```python
        app.router.add_get("/api/params", self._params)
        app.router.add_get("/api/params/readback", self._params_readback)
        app.router.add_get("/api/params/history", self._params_history)
        app.router.add_get("/api/params/export", self._params_export)
        app.router.add_post("/api/params/apply", self._params_apply)
        app.router.add_post("/api/params/revert", self._params_revert)
        app.router.add_post("/api/params/baseline/reset", self._params_baseline_reset)
        app.router.add_post("/api/params/pending/clear", self._params_pending_clear)
```

4f. In `_docker_restart`, right after `status_code, payload = await self._docker_restart_call("POST", "/restart", {"service": service})`:

```python
        if status_code == 200 and self.param_store is not None:
            # The parameter page's "needs a bringup restart" list is satisfied by this restart.
            await asyncio.to_thread(self.param_store.clear_pending)
```

4g. Handlers, inserted directly before `async def _calibration(self, _request: Any) -> Any:`:

```python
    def _param_store_or_raise(self) -> Any:
        from aiohttp import web

        if self.config.param_catalog_file is None:
            raise web.HTTPNotFound(text="parameter tuning is disabled")
        if self.param_store is None:
            raise web.HTTPServiceUnavailable(text=self.param_store_error or "parameter catalog unavailable")
        return self.param_store

    async def _params(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        snapshot = await asyncio.to_thread(store.snapshot)
        return web.json_response(snapshot, headers={"Cache-Control": "no-store"})

    async def _params_readback(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        result = await asyncio.to_thread(store.readback, self.param_reader)
        return web.json_response(result, headers={"Cache-Control": "no-store"})

    async def _params_history(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        entries = await asyncio.to_thread(store.history)
        return web.json_response({"entries": entries}, headers={"Cache-Control": "no-store"})

    async def _params_export(self, _request: Any) -> Any:
        from aiohttp import web

        store = self._param_store_or_raise()
        patch = await asyncio.to_thread(store.export_patch)
        return web.Response(
            text=patch,
            content_type="text/x-diff",
            headers={"Content-Disposition": 'attachment; filename="param-tuning.patch"', "Cache-Control": "no-store"},
        )

    async def _params_body(self, request: Any) -> tuple[Any, dict[str, Any]]:
        from aiohttp import web

        if not self._origin_allowed(request):
            raise web.HTTPForbidden(text="origin is not allowed")
        store = self._param_store_or_raise()
        try:
            body = await request.json()
        except ValueError:
            body = None
        if not isinstance(body, dict):
            raise web.HTTPBadRequest(text="request body must be a JSON object")
        return store, body

    async def _params_write(self, request: Any, action: str, call: Callable[[], dict[str, Any]], dry_run: bool) -> Any:
        from aiohttp import web

        try:
            result = await asyncio.to_thread(call)
        except ChangeError as error:
            return web.json_response({"error": str(error), "errors": error.errors}, status=400)
        except ConflictError as error:
            return web.json_response({"error": str(error), "files": error.files}, status=409)
        except ParamWriteError as error:
            self.logger.error(f"Parameter page {action} failed: {error}")
            return web.json_response({"error": str(error)}, status=500)
        if not dry_run:
            summary = ", ".join(f"{c['id']}={c['before']!r}->{c['after']!r}" for c in result.get("changes", []))
            log = getattr(self.logger, "warning", None) or self.logger.error
            log(f"Parameter page {action} {result.get('id')} from {request.remote}: {summary}")
        return web.json_response(result)

    async def _params_apply(self, request: Any) -> Any:
        store, body = await self._params_body(request)
        dry_run = body.get("dry_run") is True
        return await self._params_write(
            request, "write", lambda: store.apply(body.get("changes"), body.get("expected_sha"), dry_run), dry_run,
        )

    async def _params_revert(self, request: Any) -> Any:
        store, body = await self._params_body(request)
        dry_run = body.get("dry_run") is True
        return await self._params_write(
            request, "revert", lambda: store.revert(body.get("entry"), body.get("expected_sha"), dry_run), dry_run,
        )

    async def _params_baseline_reset(self, request: Any) -> Any:
        from aiohttp import web

        store, _body = await self._params_body(request)
        result = await asyncio.to_thread(store.reset_baseline)
        log = getattr(self.logger, "warning", None) or self.logger.error
        log(f"Parameter page baseline reset from {request.remote}: {result['files']}")
        return web.json_response(result)

    async def _params_pending_clear(self, request: Any) -> Any:
        from aiohttp import web

        store, _body = await self._params_body(request)
        return web.json_response(await asyncio.to_thread(store.clear_pending))
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_api.py -p no:cacheprovider` → `12 passed`.
Whole suite → `223 passed, 1 skipped`. Lint clean.

- [ ] **Step 6: Commit**

```bash
cd $WT
git add config/ros/realman_web_control.yaml \
  src/driver/realman_web_control/realman_web_control/web_server.py \
  src/driver/realman_web_control/test/test_param_api.py
git commit -m "feat(web-control): /api/params endpoints for the parameter page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Node wiring, package dependency and the compose mount

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/package.xml`
- Modify: `config/docker/compose.yaml`
- Test: `src/driver/realman_web_control/test/test_param_api.py` (one more test)

**Interfaces:**
- Consumes: `ParamStore`, `CatalogError` (Task 1), `ParameterReadback` (Task 2), `WebServerConfig.param_catalog_file` / `param_readback_timeout_sec` and the `WebControlServer` keyword arguments (Task 3).

- [ ] **Step 1: Write the failing test**

Append to `src/driver/realman_web_control/test/test_param_api.py`:

```python


def test_compose_mounts_config_ros_read_write_into_web_control():
    compose = yaml.safe_load((ROOT / "config/docker/compose.yaml").read_text())
    volumes = compose["services"]["realman_web_control"]["volumes"]
    assert "./config/ros:/opt/rm65_ws/config/ros:rw" in volumes
```

- [ ] **Step 2: Run it to verify it fails**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_api.py -p no:cacheprovider -k compose`
Expected: `AssertionError` (the mount is missing).

- [ ] **Step 3: Change the compose service**

In `config/docker/compose.yaml`, the `realman_web_control` service's `volumes` become:

```yaml
  realman_web_control:
    <<: *realman-common
    volumes:
      # Joint records are operator-created config/web-control YAML files and the
      # parameter page writes config/ros; the rest of the root config tree
      # remains read-only.
      - ./config:/opt/rm65_ws/config:ro
      - ./config/web-control/joint-records:/opt/rm65_ws/config/web-control/joint-records:rw
      # Shared behavior-tree favorites written by the :8765 page.
      - ./config/web-control/behavior-trees:/opt/rm65_ws/config/web-control/behavior-trees:rw
      # The /params.html page writes catalog values back into config/ros/*.yaml
      # (same mount as the bringup container).
      - ./config/ros:/opt/rm65_ws/config/ros:rw
      - ./logs:/opt/rm65_ws/logs
```

(Only the comment and the new `./config/ros` line change; `command:` below stays.)

- [ ] **Step 4: Run it to verify it passes**

Run: `PYTHONPATH=. $PY -m pytest -q test/test_param_api.py -p no:cacheprovider` → `13 passed`.

- [ ] **Step 5: Wire the node**

In `src/driver/realman_web_control/realman_web_control/web_control_node.py`:

5a. Imports — add `GetParameters` directly before `import rclpy`, and the two modules after the `model_manifest` import:

```python
from rcl_interfaces.srv import GetParameters
import rclpy
```

```python
from .model_manifest import build_manifest
from .param_readback import ParameterReadback
from .param_tuning import CatalogError, ParamStore
```

5b. Directly before `self._server = WebControlServer(`:

```python
        param_store, param_store_error, param_reader = None, "", None
        if web_config.param_catalog_file is not None:
            try:
                # Same config root load_server_config resolves the catalog against.
                param_store = ParamStore(
                    web_config.param_catalog_file,
                    Path(web_config_file).resolve().parent.parent,
                    Path(calibration_log_root) / "param-tuning",
                )
            except CatalogError as error:
                param_store_error = str(error)
                self.get_logger().error(f"Parameter page disabled: {error}")
            else:
                param_reader = ParameterReadback(
                    {
                        node: self.create_client(
                            GetParameters, f"{node}/get_parameters", callback_group=self._callback_group,
                        )
                        for node in param_store.readback_requests()
                    },
                    GetParameters.Request,
                    web_config.param_readback_timeout_sec,
                ).read
```

(Clients are created here, on the node's thread, for the fixed set of catalog nodes; the aiohttp thread never creates ROS entities.)

5c. Add the three arguments at the end of the `WebControlServer(...)` call:

```python
            logger=self.get_logger(),
            param_store=param_store,
            param_store_error=param_store_error,
            param_reader=param_reader,
        )
```

5d. `package.xml`: add `<exec_depend>rcl_interfaces</exec_depend>` directly before `<exec_depend>rclpy</exec_depend>`.

- [ ] **Step 6: Verify what can be verified without ROS**

```bash
cd $WT
$PY -m py_compile src/driver/realman_web_control/realman_web_control/web_control_node.py && echo compiled
$RUFF check --config config/python/ruff.toml src/driver/realman_web_control
cd src/driver/realman_web_control && PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider
```

Expected: `compiled`, `All checks passed!`, `224 passed, 1 skipped` (the node itself needs rclpy; it is exercised on the robot image, see Task 7).

- [ ] **Step 7: Commit**

```bash
cd $WT
git add config/docker/compose.yaml src/driver/realman_web_control/package.xml \
  src/driver/realman_web_control/realman_web_control/web_control_node.py \
  src/driver/realman_web_control/test/test_param_api.py
git commit -m "feat(web-control): wire the parameter store and readback into the node

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The page

**Files:**
- Create: `src/driver/realman_web_control/web/params.html`
- Create: `src/driver/realman_web_control/web/src/params.ts`
- Create: `src/driver/realman_web_control/web/src/params.css`
- Modify: `config/web-control/vite.config.mjs`
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Test: `website/tests/web-control/params.spec.ts`
- Rebuild: `src/driver/realman_web_control/realman_web_control/static/` (committed bundle)

**Interfaces:**
- Consumes: the `/api/params*` routes and payloads from Task 3 (snapshot rows, readback `rows`, write results, history `entries`), plus existing `GET /api/bt/trees` (`launcher.running`, `launcher.tree`) and `GET|POST /api/docker/restart`.
- Staged values live in `localStorage["realman.params.staged.v1"]` as `{row_id: value}`.

- [ ] **Step 1: Write the failing Playwright spec**

Create `website/tests/web-control/params.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

const SHA = { "ros/policy_task.yaml": "sha-policy", "ros/realman_motion.yaml": "sha-motion" };

function row(fields: Record<string, unknown>) {
  return { element: null, special: [], unit: "", max_ref: null, min_ref: null, readback: null, ...fields };
}

const EXECUTOR = "/realman_bt_executor";
const SNAPSHOT = {
  applies: { bt_start: "下次启动行为树生效", bringup_restart: "重启 bringup 后生效（行为树随之停止，需要重新启动）" },
  groups: [
    {
      id: "policy_safety", title: "策略任务 · 安全监督", file: "ros/policy_task.yaml", applies: "bt_start",
      rows: [
        row({ id: "policy_safety/joint_envelope_deg.lo[4]", key: "joint_envelope_deg.lo", element: 4,
          label: "joint_envelope_deg.lo · J5", kind: "float", min: -180, max: 180, unit: "deg",
          note: "策略运行时各关节下限", applies: "bt_start", file: "ros/policy_task.yaml", value: 3.5, baseline: 3.5,
          readback: { node: EXECUTOR, param: "policy_task.joint_envelope_deg.lo", element: 4 },
          max_ref: { key: "joint_envelope_deg.hi", id: "policy_safety/joint_envelope_deg.hi[4]", value: 108.2, strict: false } }),
        row({ id: "policy_safety/joint_envelope_deg.hi[4]", key: "joint_envelope_deg.hi", element: 4,
          label: "joint_envelope_deg.hi · J5", kind: "float", min: -180, max: 180, unit: "deg",
          note: "策略运行时各关节上限", applies: "bt_start", file: "ros/policy_task.yaml", value: 108.2, baseline: 108.2,
          readback: { node: EXECUTOR, param: "policy_task.joint_envelope_deg.hi", element: 4 },
          min_ref: { key: "joint_envelope_deg.lo", id: "policy_safety/joint_envelope_deg.lo[4]", value: 3.5, strict: false } }),
        row({ id: "policy_safety/stall.sec", key: "stall.sec", label: "stall.sec", kind: "float", min: 1, max: 60,
          unit: "s", note: "停滞持续这么久即停下重试。", applies: "bt_start", file: "ros/policy_task.yaml", value: 8,
          baseline: 10, readback: { node: EXECUTOR, param: "policy_task.stall.sec", element: null } }),
        row({ id: "policy_safety/current_guard.enabled", key: "current_guard.enabled", label: "current_guard.enabled",
          kind: "bool", min: null, max: null, note: "关节电流保护开关", applies: "bt_start", file: "ros/policy_task.yaml",
          value: true, baseline: true, readback: { node: EXECUTOR, param: "policy_task.current_guard.enabled", element: null } }),
        row({ id: "policy_safety/attempts", key: "attempts", label: "attempts", kind: "int", min: 1, max: 20,
          special: [-1], unit: "次", note: "允许失败的尝试次数；-1 = 不限。", applies: "bt_start",
          file: "ros/policy_task.yaml", value: 3, baseline: 3,
          readback: { node: EXECUTOR, param: "policy_task.attempts", element: null } }),
      ],
    },
    {
      id: "motion@r", title: "运动限速 · 驱动（r）", file: "ros/realman_motion.yaml", applies: "bringup_restart",
      rows: [
        row({ id: "motion@r/max_linear_speed_mps", key: "max_linear_speed_mps", label: "max_linear_speed_mps",
          kind: "float", min: 0.005, max: 0.25, unit: "m/s", note: "笛卡尔平移速度上限", applies: "bringup_restart",
          file: "ros/realman_motion.yaml", value: 0.15, baseline: 0.15,
          max_ref: { key: "hard_max_linear_speed_mps", id: null, value: 0.2, strict: false } }),
      ],
    },
  ],
  files: {
    "ros/policy_task.yaml": { sha: "sha-policy", baseline: true, external_change: false },
    "ros/realman_motion.yaml": { sha: "sha-motion", baseline: false, external_change: false },
  },
  writable: true, writable_error: "", errors: [], pending_restart: [] as string[],
};

const READBACK = {
  "policy_safety/joint_envelope_deg.lo[4]": { state: "applied", value: 3.5 },
  "policy_safety/joint_envelope_deg.hi[4]": { state: "applied", value: 108.2 },
  "policy_safety/stall.sec": { state: "pending", value: 10 },
  "policy_safety/current_guard.enabled": { state: "offline", value: null },
  "policy_safety/attempts": { state: "applied", value: 3 },
};

type Api = {
  snapshot: any; readback: any; history: any[]; launcher: any; snapshotHits: number;
  posts: { url: string; body: any }[]; reply: (url: string, body: any) => { status: number; json: any };
};

async function mockApi(page: any, setup: (api: Api) => void = () => {}): Promise<Api> {
  const api: Api = {
    snapshot: structuredClone(SNAPSHOT), readback: structuredClone(READBACK), history: [], launcher: { running: false },
    snapshotHits: 0, posts: [],
    reply: (_url, body) => ({ status: 200, json: { id: "e2", changes: (body.changes ?? []).map((change: any) => ({
      ...change, label: change.id, file: "ros/policy_task.yaml", applies: "bt_start", before: 0, after: change.value })),
      diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n@@ -1 +1 @@\n-x\n+y\n",
      applies: ["bt_start"] } }),
  };
  setup(api);
  await page.route("**/api/params", (route: any) => {
    api.snapshotHits += 1;
    return route.fulfill({ json: api.snapshot });
  });
  await page.route("**/api/params/readback", (route: any) => route.fulfill({ json: { nodes: {}, rows: api.readback } }));
  await page.route("**/api/params/history", (route: any) => route.fulfill({ json: { entries: api.history } }));
  await page.route("**/api/params/pending/clear", (route: any) => {
    api.posts.push({ url: "pending/clear", body: route.request().postDataJSON() });
    const cleared = api.snapshot.pending_restart;
    api.snapshot.pending_restart = [];
    return route.fulfill({ json: { cleared } });
  });
  for (const path of ["apply", "revert", "baseline/reset"]) {
    await page.route(`**/api/params/${path}`, (route: any) => {
      const body = route.request().postDataJSON();
      api.posts.push({ url: path, body });
      const { status, json } = api.reply(path, body);
      return route.fulfill({ status, json });
    });
  }
  await page.route("**/api/bt/trees", (route: any) => route.fulfill({ json: { available: true, launcher: api.launcher, trees: [] } }));
  await page.route("**/api/docker/restart", (route: any) => {
    if (route.request().method() === "POST") {
      api.posts.push({ url: "docker/restart", body: route.request().postDataJSON() });
      api.snapshot.pending_restart = [];  // the server clears the list after a restart it accepted
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { available: true, service: "realman_bringup_remote", helper: { restarting: false } } });
  });
  return api;
}

const rowOf = (page: any, id: string) => page.locator(`tr[data-id="${id}"]`);
const cell = (page: any, id: string, column: number) => rowOf(page, id).locator("td").nth(column);

test("renders the catalog as a sheet with file, baseline and runtime values", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  await expect(page.locator(".sheet th")).toHaveText(["#", "参数", "备注", "文件", "基线值", "文件值", "运行值", "暂存", "新值", "最小", "最大", "单位", "生效"]);
  await expect(page.locator("tr.group-band")).toHaveText(["策略任务 · 安全监督（5）", "运动限速 · 驱动（r）（1）"]);
  await expect(page.locator("#param-count")).toHaveText("共 6 项");
  const stall = "policy_safety/stall.sec";
  await expect(cell(page, stall, 4)).toHaveText("10.0");
  await expect(cell(page, stall, 5)).toHaveText("8.0");
  await expect(cell(page, stall, 5)).toHaveClass(/differs/);
  await expect(cell(page, stall, 6)).toHaveText("10.0");
  await expect(cell(page, stall, 12)).toContainText("待生效");
  await expect(cell(page, "policy_safety/joint_envelope_deg.lo[4]", 12)).toContainText("已生效");
  await expect(cell(page, "policy_safety/current_guard.enabled", 6)).toHaveText("未运行");
  const speed = "motion@r/max_linear_speed_mps";
  await expect(cell(page, speed, 6)).toHaveText("—");
  await expect(cell(page, speed, 10)).toHaveText("0.2");
  await expect(cell(page, speed, 10)).toHaveAttribute("title", /hard_max_linear_speed_mps/);
  await expect(cell(page, speed, 12)).toHaveText("重启 bringup");
  await page.locator("#param-filter").fill("停滞");
  await expect(page.locator("#param-count")).toHaveText("1 / 6 项");
  await expect(page.locator("tr.group-band").nth(1)).toBeHidden();
});

test("keyboard staging: Enter stages and moves on, bad values stay out, Delete unstages", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  const lo = rowOf(page, "policy_safety/joint_envelope_deg.lo[4]").locator("input");
  const hi = rowOf(page, "policy_safety/joint_envelope_deg.hi[4]").locator("input");
  await lo.fill("4");
  await lo.press("Enter");
  await expect(cell(page, "policy_safety/joint_envelope_deg.lo[4]", 7)).toContainText("4.0");
  await expect(hi).toBeFocused();
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  await hi.fill("200");
  await hi.press("Enter");
  await expect(hi).toHaveClass(/invalid/);
  await expect(hi).toHaveAttribute("title", "高于最大值 180.0");
  await hi.fill("2");
  await expect(hi).toHaveAttribute("title", "必须 ≥ joint_envelope_deg.lo（4.0）");
  await hi.press("Escape");
  await expect(hi).toHaveValue("");
  const attempts = rowOf(page, "policy_safety/attempts").locator("input");
  await attempts.fill("-1");
  await attempts.press("Enter");
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await rowOf(page, "policy_safety/current_guard.enabled").locator("select").selectOption("false");
  await expect(cell(page, "policy_safety/current_guard.enabled", 7)).toContainText("false");
  await lo.focus();
  await lo.press("Delete");
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await page.reload();
  await expect(page.locator("#staged-count")).toHaveText("暂存 2 项");
  await page.locator("#clear-staged").click();
  await expect(page.locator("#staged-count")).toHaveText("暂存 0 项");
  await expect(page.locator("#write-config")).toBeDisabled();
});

test("writing shows the dry-run diff, then sends the staged values with the file hashes", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  const speed = rowOf(page, "motion@r/max_linear_speed_mps").locator("input");
  await speed.fill("0.18");
  await speed.press("Enter");
  api.reply = (_url, body) => ({ status: 200, json: {
    id: body.dry_run ? undefined : "20261026T010203Z-1",
    changes: [
      { id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 8, after: 9 },
      { id: "motion@r/max_linear_speed_mps", label: "max_linear_speed_mps", file: "ros/realman_motion.yaml",
        applies: "bringup_restart", before: 0.15, after: 0.18 },
    ],
    diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n@@ -1 +1 @@\n-        sec: 8.0\n+        sec: 9.0\n",
    applies: ["bringup_restart", "bt_start"],
  } });
  await page.locator("#write-config").click();
  const dialog = page.locator("#confirm-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".confirm-changes tr").nth(1).locator("td")).toHaveText(["stall.sec", "policy_task.yaml", "8.0", "9.0", "下次启动行为树"]);
  await expect(dialog.locator(".diff .add")).toHaveText("+        sec: 9.0\n");
  await expect(dialog.locator(".confirm-summary")).toContainText("重启 bringup 才生效的有 1 项");
  expect(api.posts[0]).toEqual({ url: "apply", body: {
    changes: [{ id: "policy_safety/stall.sec", value: 9 }, { id: "motion@r/max_linear_speed_mps", value: 0.18 }],
    expected_sha: SHA, dry_run: true,
  } });
  api.snapshot.groups[0].rows[2].value = 9;
  api.snapshot.groups[1].rows[0].value = 0.18;
  api.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
  await dialog.locator("#confirm-ok").click();
  await expect(page.locator("#param-message")).toHaveText("已写入 2 项（记录 20261026T010203Z-1）。");
  expect(api.posts[1].body.dry_run).toBe(false);
  await expect(page.locator("#staged-count")).toHaveText("暂存 0 项");
  await expect(cell(page, "policy_safety/stall.sec", 5)).toHaveText("9.0");
  await expect(page.locator(".notice")).toContainText("有 1 项改动需要重启 bringup 才生效：max_linear_speed_mps");
  await expect(cell(page, "motion@r/max_linear_speed_mps", 12)).toContainText("待重启");
});

test("cancelling the dialog writes nothing", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await page.locator("#write-config").click();
  await page.locator("#confirm-dialog button[value=cancel]").click();
  await expect(page.locator("#confirm-dialog")).toBeHidden();
  expect(api.posts.map((post) => post.body.dry_run)).toEqual([true]);
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
});

test("a conflict reloads the files and keeps the staged values; refused values mark their rows", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.reply = () => ({ status: 409, json: { error: "files changed since the page read them; reload", files: ["ros/policy_task.yaml"] } });
  });
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  const hitsBefore = api.snapshotHits;
  await page.locator("#write-config").click();
  await expect(page.locator("#param-error")).toContainText("写入没有执行：files changed since the page read them");
  await expect.poll(() => api.snapshotHits).toBeGreaterThan(hitsBefore);
  await expect(page.locator("#staged-count")).toHaveText("暂存 1 项");
  api.reply = () => ({ status: 400, json: { error: "some values are not acceptable",
    errors: [{ id: "policy_safety/stall.sec", error: "above the maximum 60" }] } });
  await page.locator("#write-config").click();
  await expect(page.locator("#param-error")).toContainText("stall.sec：above the maximum 60");
  await expect(rowOf(page, "policy_safety/stall.sec")).toHaveClass(/row-error/);
});

test("notices: running tree, pending restart with restart and dismiss", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
    setup.launcher = { running: true, tree: "control_pick.xml" };
  });
  await page.goto("params.html");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await expect(page.locator(".notice").filter({ hasText: "control_pick.xml" })).toContainText("不会使用新写入的值");
  const pending = page.locator(".notice").filter({ hasText: "需要重启 bringup" });
  await pending.getByRole("button", { name: "重启 bringup" }).click();
  await pending.getByRole("button", { name: "确认重启？" }).click();
  await expect.poll(() => api.posts.map((post) => post.url)).toContain("docker/restart");
  await expect(page.locator("#param-message")).toContainText("已请求重启 bringup");
  await expect(page.locator(".notice").filter({ hasText: "需要重启 bringup" })).toHaveCount(0);
  api.snapshot.pending_restart = ["motion@r/max_linear_speed_mps"];
  await page.reload();
  await page.locator(".notice").filter({ hasText: "需要重启 bringup" }).getByRole("button", { name: "知道了" }).click();
  await expect.poll(() => api.posts.map((post) => post.url)).toContain("pending/clear");
  await expect(page.locator(".notice").filter({ hasText: "需要重启 bringup" })).toHaveCount(0);
});

test("read-only containers and a disabled page", async ({ page }) => {
  await mockApi(page, (setup) => {
    setup.snapshot.writable = false;
    setup.snapshot.writable_error = "/opt/rm65_ws/config/ros is read-only here";
  });
  await page.goto("params.html");
  await expect(page.locator(".notice.danger")).toContainText("只读：/opt/rm65_ws/config/ros is read-only here");
  const stall = rowOf(page, "policy_safety/stall.sec").locator("input");
  await stall.fill("9");
  await stall.press("Enter");
  await expect(page.locator("#write-config")).toBeDisabled();
  await page.route("**/api/params", (route: any) => route.fulfill({ status: 404, body: "parameter tuning is disabled" }));
  await page.reload();
  await expect(page.locator("#sheet")).toContainText("参数调试已关闭");
});

test("history lists writes and reverts through the same dry-run dialog", async ({ page }) => {
  const api = await mockApi(page, (setup) => {
    setup.history = [{ id: "20261026T000000Z-1", time: "2026-10-26T00:00:00+00:00", reverts: null,
      changes: [{ id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 10, after: 8 }],
      diff: "--- a/config/ros/policy_task.yaml\n+++ b/config/ros/policy_task.yaml\n" }];
    setup.reply = (_url, body) => ({ status: 200, json: { id: body.dry_run ? undefined : "e3", reverts: "20261026T000000Z-1",
      changes: [{ id: "policy_safety/stall.sec", label: "stall.sec", file: "ros/policy_task.yaml", applies: "bt_start", before: 8, after: 10 }],
      diff: "", changed_since: body.dry_run ? ["policy_safety/stall.sec"] : [] } });
  });
  await page.goto("params.html");
  await expect(page.locator("#history-count")).toHaveText("1 条");
  await page.locator(".history-entry").getByRole("button", { name: "撤回" }).click();
  await expect(page.locator("#confirm-title")).toHaveText("撤回这次修改");
  await expect(page.locator(".confirm-summary")).toContainText("之后又被改过，也会被改回：stall.sec");
  await page.locator("#confirm-ok").click();
  await expect(page.locator("#param-message")).toHaveText("已撤回 20261026T000000Z-1（新记录 e3）。");
  expect(api.posts.map((post) => [post.url, post.body.entry, post.body.dry_run])).toEqual([
    ["revert", "20261026T000000Z-1", true], ["revert", "20261026T000000Z-1", false],
  ]);
});

test("the page never scrolls sideways; the sheet scrolls inside its frame", async ({ page }) => {
  await mockApi(page);
  await page.goto("params.html");
  await expect(page.locator(".sheet")).toBeVisible();
  const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, view: window.innerWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.view + 1);
});

test("the control page links to the parameter page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.topbar a[href="/params.html"]')).toHaveText("参数调试");
});
```

- [ ] **Step 2: Run it to verify it fails**

From `$WT/website`: `npx playwright test --config ../config/web-control/playwright.config.mjs tests/web-control/params.spec.ts`
Expected: every test fails (`params.html` is a 404 page without `.sheet`; the control page has no 参数调试 link).

- [ ] **Step 3: Add the page entry**

Create `src/driver/realman_web_control/web/params.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#eef1f6" />
    <title>RealMan 参数调试</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/params.ts"></script>
  </body>
</html>
```

In `config/web-control/vite.config.mjs`, add the third input:

```js
      input: {
        control: resolve(webDirectory, "index.html"),
        calibration: resolve(webDirectory, "calibration.html"),
        params: resolve(webDirectory, "params.html"),
      },
```

In `src/driver/realman_web_control/web/src/main.ts`, add the link right after the 相机标定 link in the top bar:

```ts
    <a href="/calibration.html" class="button ghost">相机标定</a>
    <a href="/params.html" class="button ghost">参数调试</a>
```

- [ ] **Step 4: Write the stylesheet**

Create `src/driver/realman_web_control/web/src/params.css`:

```css
/* Parameter page layout; colors and shared primitives come from theme.css. */
.topbar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px 18px; align-items: center; padding: 14px clamp(16px, 3vw, 42px); border-bottom: 1px solid var(--line); background: oklch(1 0 0 / 0.86); backdrop-filter: blur(12px); }
.topbar h1 { margin: 6px 0 4px; font-size: clamp(19px, 2.4vw, 24px); }
.topbar p { margin: 0; padding-left: 12px; color: var(--text-3); font-size: 12px; }
.top-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.top-actions > .button { min-height: 36px; }
.params-main { display: grid; gap: 16px; max-width: 1680px; margin: 0 auto; padding: 20px clamp(16px, 3vw, 42px) 36px; }
.panel { min-width: 0; padding: 18px; }
.panel-title { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.panel-title h2 { margin: 5px 0 0; font-size: 15px; }
.sheet-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sheet-tools input[type="search"] { width: min(280px, 100%); border: 1px solid var(--line-strong); border-radius: var(--radius-control); background: var(--card-bg); color: var(--text); padding: 8px 9px; }
.status { padding: 5px 10px; border-radius: 999px; background: var(--btn-bg); color: var(--btn-content); font-size: 10px; font-weight: 700; letter-spacing: .08em; white-space: nowrap; }
.status.warn { color: var(--warn); background: var(--warn-bg); }
.muted { color: var(--text-3); font-size: 11px; }
.hint { color: var(--text-3); font-size: 12px; line-height: 1.6; }
.error { margin: 0 0 12px; padding: 9px 12px; border-radius: var(--radius-control); background: var(--danger-bg); color: var(--danger); font-size: 12px; white-space: pre-line; }
.message { margin: 0 0 12px; padding: 9px 12px; border-radius: var(--radius-control); background: var(--ok-bg); color: var(--ok); font-size: 12px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.notices { display: grid; gap: 8px; margin-bottom: 12px; }
.notice { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 9px 12px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--card-sub); color: var(--text-2); font-size: 12px; line-height: 1.5; }
.notice.warn { border-color: oklch(0.85 0.08 75); background: var(--warn-bg); color: oklch(0.42 0.1 65); }
.notice.danger { border-color: oklch(0.85 0.08 25); background: var(--danger-bg); color: var(--danger); }
.notice span { flex: 1 1 320px; }
.sheet-wrap { overflow: auto; max-height: calc(100vh - 230px); border: 1px solid var(--line); border-radius: 12px; }
.sheet { width: 100%; min-width: 1240px; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.sheet th { position: sticky; top: 0; z-index: 2; padding: 8px 9px; border-bottom: 1px solid var(--line-strong); background: var(--card-sub); color: var(--text-3); font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-align: left; white-space: nowrap; }
.sheet td { padding: 6px 9px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.sheet tr.group-band td { position: sticky; top: 33px; z-index: 1; padding: 9px; background: var(--btn-bg); color: var(--primary-strong); font-weight: 800; letter-spacing: .02em; }
.sheet tr.hidden { display: none; }
.sheet tr:not(.group-band):hover td { background: var(--card-hover); }
.sheet tr.is-staged td { background: oklch(0.97 0.03 var(--hue)); }
.sheet tr.row-error td { background: var(--danger-bg); }
.sheet .rownum { width: 36px; color: var(--text-3); text-align: right; }
.sheet .name b { font-weight: 700; white-space: nowrap; }
.sheet .note { min-width: 220px; max-width: 360px; color: var(--text-2); line-height: 1.45; }
.sheet .file { color: var(--text-3); white-space: nowrap; }
.sheet .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sheet .differs { color: var(--primary-strong); font-weight: 700; }
.sheet .runtime-pending { color: var(--warn); font-weight: 700; }
.sheet .staged-cell { color: var(--text-3); }
.sheet tr.is-staged .staged-cell { color: var(--primary-strong); font-weight: 700; }
.sheet .edit input, .sheet .edit select { width: 104px; padding: 6px 7px; border: 1px solid var(--line-strong); border-radius: 6px; background: var(--card-bg); color: var(--text); font-size: 12px; }
.sheet .edit input.invalid { border-color: var(--danger); background: var(--danger-bg); }
.sheet .unstage { margin-left: 6px; padding: 0 6px; border: 0; border-radius: 6px; background: var(--btn-bg); color: var(--btn-content); font-weight: 800; }
.sheet .applies { white-space: nowrap; color: var(--text-2); }
.badge { display: inline-block; margin-left: 6px; padding: 2px 7px; border-radius: 999px; background: var(--btn-bg); color: var(--btn-content); font-size: 10px; font-weight: 700; }
.badge.ok { background: var(--ok-bg); color: var(--ok); }
.badge.warn { background: var(--warn-bg); color: var(--warn); }
.history-list { display: grid; gap: 8px; }
.history-entry { border: 1px solid var(--line); border-radius: 10px; background: var(--card-sub); }
.history-entry summary { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 9px 12px; cursor: pointer; font-size: 12px; }
.history-entry summary .button { margin-left: auto; padding: 6px 10px; }
.history-entry table, .confirm-changes { width: 100%; border-collapse: collapse; font-size: 12px; }
.history-entry table { margin: 0 12px 8px; width: calc(100% - 24px); }
.history-entry td, .confirm-changes td, .confirm-changes th { padding: 5px 8px; border-bottom: 1px solid var(--line); text-align: left; }
.diff { max-height: 320px; margin: 0; padding: 10px 12px; overflow: auto; border-radius: 8px; background: oklch(0.2 0.02 var(--hue)); color: oklch(0.9 0.01 var(--hue)); font: 11.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
.history-entry .diff { margin: 0 12px 12px; }
.diff .add { color: oklch(0.82 0.13 150); }
.diff .del { color: oklch(0.75 0.15 25); }
.diff .hunk { color: oklch(0.75 0.1 250); }
.confirm-dialog { width: min(920px, calc(100vw - 32px)); max-height: calc(100vh - 48px); padding: 0; border: 1px solid var(--line); border-radius: var(--radius-card); box-shadow: var(--shadow-card-hover); color: var(--text); }
.confirm-dialog::backdrop { background: oklch(0.2 0.02 var(--hue) / 0.35); }
.confirm-dialog form { display: grid; gap: 12px; padding: 18px; }
.confirm-dialog h2 { font-size: 16px; }
.confirm-summary { margin: 0; padding-left: 18px; color: var(--text-2); font-size: 12px; line-height: 1.7; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
@media (max-width: 560px) {
  .topbar { position: static; }
  .sheet-tools > * { flex: 1 1 auto; }
  .sheet-wrap { max-height: none; }
}
```

- [ ] **Step 5: Write the page script**

Create `src/driver/realman_web_control/web/src/params.ts`:

```typescript
import "./theme.css";
import "./params.css";

// Parameter page: catalog rows from /api/params, staged in this browser, written to config/ros/*.yaml after a
// dry-run diff, with runtime values read back from the running ROS nodes.

type Kind = "int" | "float" | "bool";
type Value = number | boolean;
type Ref = { key: string; id: string | null; value: number; strict: boolean } | null;
type Row = {
  id: string; key: string; element: number | null; label: string; kind: Kind;
  min: number | null; max: number | null; special: number[]; unit: string; note: string;
  applies: "bt_start" | "bringup_restart"; file: string; value: Value; baseline: Value;
  readback: { node: string; param: string; element: number | null } | null; max_ref: Ref; min_ref: Ref;
};
type Group = { id: string; title: string; file: string; applies: string; rows: Row[] };
type Snapshot = {
  applies: Record<string, string>; groups: Group[];
  files: Record<string, { sha: string; baseline: boolean; external_change: boolean }>;
  writable: boolean; writable_error: string; errors: string[]; pending_restart: string[];
};
type RuntimeState = { state: "applied" | "pending" | "offline"; value: unknown };
type Change = { id: string; label: string; file: string; applies: string; before: Value; after: Value };
type WriteResult = { id?: string; time?: string; reverts?: string | null; changes: Change[]; diff: string;
  applies?: string[]; changed_since?: string[] };
type Reply = { ok: boolean; status: number; data: any };
type RowCells = {
  tr: HTMLTableRowElement; baseline: HTMLElement; value: HTMLElement; runtime: HTMLElement; staged: HTMLElement;
  input: HTMLInputElement | HTMLSelectElement; min: HTMLElement; max: HTMLElement; applies: HTMLElement;
  unstage: HTMLButtonElement;
};

const STAGED_KEY = "realman.params.staged.v1";
const READBACK_PERIOD_MS = 2000;
const BT_PERIOD_MS = 5000;
const ARM_MS = 4000;
const COLUMNS = ["#", "参数", "备注", "文件", "基线值", "文件值", "运行值", "暂存", "新值", "最小", "最大", "单位", "生效"];
const APPLIES_SHORT: Record<string, string> = { bt_start: "下次启动行为树", bringup_restart: "重启 bringup" };

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div><span class="eyebrow">REALMAN / PARAMETERS</span><h1>参数调试</h1><p>白名单参数 · 暂存后写入配置 · 运行值读回</p></div>
    <div class="top-actions"><a href="/" class="button ghost">运动控制</a><a href="/calibration.html" class="button ghost">相机标定</a></div>
  </header>
  <main class="params-main">
    <section class="panel sheet-panel">
      <div class="panel-title">
        <div><span class="eyebrow">CATALOG / CONFIG</span><h2>参数表</h2></div>
        <div class="sheet-tools">
          <input id="param-filter" type="search" placeholder="筛选参数 / 备注 / 文件 / 单位" autocomplete="off" />
          <span id="param-count" class="muted"></span>
          <span id="staged-count" class="status">暂存 0 项</span>
          <button id="write-config" class="button primary" type="button" disabled>写入配置</button>
          <button id="clear-staged" class="button ghost" type="button" disabled>清空暂存</button>
          <a id="export-patch" class="button ghost" href="/api/params/export" download="param-tuning.patch">导出补丁</a>
          <button id="reset-baseline" class="button ghost" type="button">重置基线</button>
        </div>
      </div>
      <div id="notices" class="notices"></div>
      <p id="param-message" class="message" hidden></p>
      <p id="param-error" class="error" hidden></p>
      <div id="sheet" class="sheet-wrap"><p class="hint">读取参数清单…</p></div>
    </section>
    <section class="panel history-panel">
      <div class="panel-title"><div><span class="eyebrow">HISTORY</span><h2>修改历史</h2></div><span id="history-count" class="status">—</span></div>
      <div id="history" class="history-list"><p class="hint">还没有修改记录。</p></div>
    </section>
  </main>
  <dialog id="confirm-dialog" class="confirm-dialog">
    <form method="dialog">
      <h2 id="confirm-title">写入配置</h2>
      <div id="confirm-body"></div>
      <div class="dialog-actions">
        <button value="cancel" class="button ghost">取消</button>
        <button id="confirm-ok" value="ok" class="button primary">确认写入</button>
      </div>
    </form>
  </dialog>
`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const filterInput = $<HTMLInputElement>("#param-filter");
const countLabel = $("#param-count");
const stagedLabel = $("#staged-count");
const writeButton = $<HTMLButtonElement>("#write-config");
const clearButton = $<HTMLButtonElement>("#clear-staged");
const resetButton = $<HTMLButtonElement>("#reset-baseline");
const noticesBox = $("#notices");
const messageBox = $("#param-message");
const errorBox = $("#param-error");
const sheetBox = $("#sheet");
const historyBox = $("#history");
const historyCount = $("#history-count");
const dialog = $<HTMLDialogElement>("#confirm-dialog");
const dialogTitle = $("#confirm-title");
const dialogBody = $("#confirm-body");
const dialogOk = $<HTMLButtonElement>("#confirm-ok");

let snapshot: Snapshot | null = null;
let rowsById = new Map<string, Row>();
let cellsById = new Map<string, RowCells>();
let signature = "";
let runtime: Record<string, RuntimeState> = {};
let launcher: { running?: boolean; tree?: string } = {};
let restartAvailable = false;
let rowErrors = new Map<string, string>();
let armed: { action: string; until: number } | null = null;
let busy = false;
let noticeKey = "";
const staged = loadStaged();

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function loadStaged(): Map<string, Value> {
  try {
    const raw = JSON.parse(localStorage.getItem(STAGED_KEY) || "{}");
    return new Map(Object.entries(raw).filter(([, value]) => typeof value === "number" || typeof value === "boolean") as [string, Value][]);
  } catch {
    return new Map();
  }
}

function saveStaged(): void {
  try {
    localStorage.setItem(STAGED_KEY, JSON.stringify(Object.fromEntries(staged)));
  } catch {
    // Private windows may refuse storage; staging still works for this tab.
  }
}

function same(left: unknown, right: unknown): boolean {
  if (typeof left === "number" && typeof right === "number") {
    return Math.abs(left - right) <= 1e-9 * Math.max(1, Math.abs(left), Math.abs(right));
  }
  return left === right;
}

function fmt(row: Row | null, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    const text = String(Number(value.toPrecision(12)));
    return row?.kind === "float" && Number.isInteger(value) ? `${text}.0` : text;
  }
  return String(value);
}

function refValue(ref: NonNullable<Ref>): number {
  const value = ref.id ? staged.get(ref.id) : undefined;
  return typeof value === "number" ? value : ref.value;
}

function problem(row: Row, value: Value): string {
  if (row.kind === "bool") return typeof value === "boolean" ? "" : "必须是 true 或 false";
  if (typeof value !== "number" || !Number.isFinite(value)) return "必须是数字";
  if (row.kind === "int" && !Number.isInteger(value)) return "必须是整数";
  if (row.special.some((item) => same(item, value))) return "";
  if (row.min !== null && value < row.min) return `低于最小值 ${fmt(row, row.min)}`;
  if (row.max !== null && value > row.max) return `高于最大值 ${fmt(row, row.max)}`;
  for (const [ref, upper] of [[row.max_ref, true], [row.min_ref, false]] as const) {
    if (!ref) continue;
    const other = refValue(ref);
    const bad = upper ? (ref.strict ? value >= other : value > other) : (ref.strict ? value <= other : value < other);
    const sign = upper ? (ref.strict ? "<" : "≤") : (ref.strict ? ">" : "≥");
    if (bad) return `必须 ${sign} ${ref.key}（${fmt(row, other)}）`;
  }
  return "";
}

function setMessage(text: string): void {
  messageBox.textContent = text;
  messageBox.hidden = !text;
}

function setError(text: string): void {
  errorBox.textContent = text;
  errorBox.hidden = !text;
}

async function request(url: string, body?: unknown): Promise<Reply> {
  const response = await fetch(url, body === undefined
    ? { cache: "no-store" }
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  return { ok: response.ok, status: response.status, data };
}

function expectedSha(): Record<string, string> {
  return Object.fromEntries(Object.entries(snapshot?.files ?? {}).map(([file, info]) => [file, info.sha]));
}

// ------------------------------------------------------------------------------------------------ table

function moveFocus(from: HTMLElement, step: number): void {
  const inputs = Array.from(sheetBox.querySelectorAll<HTMLElement>("tr:not(.hidden) .edit input, tr:not(.hidden) .edit select"));
  const next = inputs[inputs.indexOf(from) + step];
  if (next) {
    next.focus();
    if (next instanceof HTMLInputElement) next.select();
  }
}

function stage(row: Row, value: Value): void {
  if (same(value, row.value)) staged.delete(row.id);
  else staged.set(row.id, value);
  rowErrors.delete(row.id);
  saveStaged();
  refresh();
}

function unstage(id: string): void {
  staged.delete(id);
  rowErrors.delete(id);
  saveStaged();
  refresh();
}

function markInput(input: HTMLInputElement, reason: string): void {
  input.classList.toggle("invalid", Boolean(reason));
  input.title = reason || "回车暂存并跳到下一行；Shift+回车上一行；Esc 清空；↑/↓ 换行；空格内按 Delete 取消暂存";
}

function buildRow(row: Row, index: number): RowCells {
  const tr = el("tr");
  tr.dataset.id = row.id;
  tr.append(el("td", String(index), "rownum"));
  const name = el("td", undefined, "name");
  name.append(el("b", row.label));
  tr.append(name, el("td", row.note, "note"), el("td", row.file.replace(/^ros\//, ""), "file mono"));
  const baseline = el("td", undefined, "num");
  const value = el("td", undefined, "num");
  const runtimeCell = el("td", undefined, "num");
  const stagedCell = el("td", undefined, "num staged-cell");
  const edit = el("td", undefined, "edit");
  let input: HTMLInputElement | HTMLSelectElement;
  if (row.kind === "bool") {
    const select = el("select");
    select.append(new Option("—", ""), new Option("true", "true"), new Option("false", "false"));
    select.addEventListener("change", () => {
      if (select.value) stage(row, select.value === "true");
      select.value = "";
    });
    select.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") unstage(row.id);
    });
    input = select;
  } else {
    const field = el("input");
    field.type = "number";
    field.step = row.kind === "int" ? "1" : "any";
    if (row.min !== null) field.min = String(row.min);
    if (row.max !== null) field.max = String(row.max);
    markInput(field, "");
    field.addEventListener("input", () => markInput(field, field.value === "" ? "" : problem(row, Number(field.value))));
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (field.value !== "") {
          const reason = problem(row, Number(field.value));
          markInput(field, reason);
          if (reason) return;
          stage(row, Number(field.value));
          field.value = "";
        }
        moveFocus(field, event.shiftKey ? -1 : 1);
      } else if (event.key === "Escape") {
        field.value = "";
        markInput(field, "");
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        moveFocus(field, event.key === "ArrowDown" ? 1 : -1);
      } else if ((event.key === "Delete" || event.key === "Backspace") && field.value === "" && staged.has(row.id)) {
        unstage(row.id);
      }
    });
    input = field;
  }
  edit.append(input);
  const unstageButton = el("button", "×", "unstage");
  unstageButton.type = "button";
  unstageButton.title = "取消暂存";
  unstageButton.addEventListener("click", () => unstage(row.id));
  const min = el("td", undefined, "num muted");
  const max = el("td", undefined, "num muted");
  const applies = el("td", undefined, "applies");
  tr.append(baseline, value, runtimeCell, stagedCell, edit, min, max, el("td", row.unit, "muted"), applies);
  return { tr, baseline, value, runtime: runtimeCell, staged: stagedCell, input, min, max, applies, unstage: unstageButton };
}

function updateRow(row: Row, cells: RowCells): void {
  cells.baseline.textContent = fmt(row, row.baseline);
  const differs = !same(row.value, row.baseline);
  cells.value.textContent = fmt(row, row.value);
  cells.value.classList.toggle("differs", differs);
  cells.value.title = differs ? "与基线不同" : "";
  const live = runtime[row.id];
  cells.runtime.classList.remove("runtime-pending");
  if (!row.readback) {
    cells.runtime.textContent = "—";
    cells.runtime.title = "这个参数没有运行值（节点不把它声明成 ROS 参数）";
  } else if (!live) {
    cells.runtime.textContent = "…";
    cells.runtime.title = "";
  } else if (live.state === "offline") {
    cells.runtime.textContent = "未运行";
    cells.runtime.title = `${row.readback.node} 没有运行或没有应答`;
  } else {
    cells.runtime.textContent = fmt(row, live.value);
    cells.runtime.title = `${row.readback.node} ${row.readback.param}`;
    cells.runtime.classList.toggle("runtime-pending", live.state === "pending");
  }
  const stagedValue = staged.get(row.id);
  cells.staged.textContent = stagedValue === undefined ? "—" : fmt(row, stagedValue);
  if (stagedValue !== undefined) cells.staged.append(cells.unstage);
  cells.tr.classList.toggle("is-staged", stagedValue !== undefined);
  if (cells.input instanceof HTMLInputElement) cells.input.placeholder = stagedValue === undefined ? "" : fmt(row, stagedValue);
  let minimum: number | null = row.min;
  let maximum: number | null = row.max;
  const titles: string[] = [];
  if (row.min_ref) {
    const other = refValue(row.min_ref);
    minimum = minimum === null ? other : Math.max(minimum, other);
    titles.push(`${row.min_ref.strict ? ">" : "≥"} ${row.min_ref.key} = ${fmt(row, other)}`);
  }
  if (row.max_ref) {
    const other = refValue(row.max_ref);
    maximum = maximum === null ? other : Math.min(maximum, other);
    titles.push(`${row.max_ref.strict ? "<" : "≤"} ${row.max_ref.key} = ${fmt(row, other)}`);
  }
  cells.min.textContent = row.kind === "bool" ? "" : fmt(row, minimum);
  cells.max.textContent = row.kind === "bool" ? "" : fmt(row, maximum);
  cells.min.title = cells.max.title = titles.join("；");
  cells.applies.textContent = APPLIES_SHORT[row.applies] ?? row.applies;
  cells.applies.title = snapshot?.applies[row.applies] ?? "";
  let badge: [string, string] | null = null;
  if (live?.state === "applied") badge = ["已生效", "ok"];
  else if (live?.state === "pending") badge = ["待生效", "warn"];
  else if (live?.state === "offline") badge = ["未运行", ""];
  if (snapshot?.pending_restart.includes(row.id)) badge = ["待重启", "warn"];
  if (badge) cells.applies.append(el("span", badge[0], `badge ${badge[1]}`.trim()));
  const error = rowErrors.get(row.id);
  cells.tr.classList.toggle("row-error", Boolean(error));
  cells.tr.title = error ?? "";
}

function buildSheet(groups: Group[]): void {
  cellsById = new Map();
  const table = el("table", undefined, "sheet");
  const head = el("thead");
  const headRow = el("tr");
  COLUMNS.forEach((title) => headRow.append(el("th", title)));
  head.append(headRow);
  const body = el("tbody");
  let index = 0;
  for (const group of groups) {
    const band = el("tr", undefined, "group-band");
    const bandCell = el("td", `${group.title}（${group.rows.length}）`);
    bandCell.colSpan = COLUMNS.length;
    band.append(bandCell);
    body.append(band);
    for (const row of group.rows) {
      index += 1;
      const cells = buildRow(row, index);
      cellsById.set(row.id, cells);
      body.append(cells.tr);
    }
  }
  table.append(head, body);
  sheetBox.replaceChildren(table);
}

function applyFilter(): void {
  const query = filterInput.value.trim().toLowerCase();
  let shown = 0;
  for (const [id, cells] of cellsById) {
    const row = rowsById.get(id)!;
    const hit = !query || `${row.label} ${row.key} ${row.note} ${row.file} ${row.unit}`.toLowerCase().includes(query);
    cells.tr.classList.toggle("hidden", !hit);
    if (hit) shown += 1;
  }
  sheetBox.querySelectorAll<HTMLTableRowElement>("tr.group-band").forEach((band) => {
    let next = band.nextElementSibling;
    let any = false;
    while (next && !next.classList.contains("group-band")) {
      if (!next.classList.contains("hidden")) any = true;
      next = next.nextElementSibling;
    }
    band.classList.toggle("hidden", !any);
  });
  countLabel.textContent = query ? `${shown} / ${cellsById.size} 项` : `共 ${cellsById.size} 项`;
}

// ------------------------------------------------------------------------------------------------ notices

function armButton(button: HTMLButtonElement, action: string, idle: string, confirmText: string): boolean {
  if (armed?.action === action && armed.until > Date.now()) {
    armed = null;
    button.textContent = idle;
    button.classList.remove("danger");
    return true;
  }
  armed = { action, until: Date.now() + ARM_MS };
  button.textContent = confirmText;
  button.classList.add("danger");
  window.setTimeout(() => {
    if (armed?.action === action && armed.until <= Date.now()) {
      armed = null;
      button.textContent = idle;
      button.classList.remove("danger");
    }
  }, ARM_MS + 50);
  return false;
}

function notice(kind: string, text: string, ...actions: HTMLElement[]): HTMLElement {
  const box = el("div", undefined, `notice ${kind}`.trim());
  box.append(el("span", text), ...actions);
  return box;
}

function renderNotices(): void {
  if (!snapshot) return;
  const items: HTMLElement[] = [];
  const restartArmed = armed?.action === "restart" && armed.until > Date.now();
  if (!snapshot.writable) items.push(notice("danger", `只读：${snapshot.writable_error}`));
  if (snapshot.errors.length) {
    items.push(notice("warn", `清单里有 ${snapshot.errors.length} 项在配置文件里对不上，未显示：\n${snapshot.errors.join("\n")}`));
  }
  const external = Object.entries(snapshot.files).filter(([, info]) => info.external_change).map(([file]) => file);
  if (external.length) {
    items.push(notice("warn", `这些文件在页面外改过：${external.join("、")}。导出补丁仍以基线为准；要从现在的内容重新开始，点「重置基线」。`));
  }
  const pending = snapshot.pending_restart.filter((id) => rowsById.has(id));
  if (pending.length) {
    const labels = pending.map((id) => rowsById.get(id)!.label);
    const restart = el("button", restartArmed ? "确认重启？" : "重启 bringup", restartArmed ? "button danger" : "button ghost");
    restart.type = "button";
    restart.disabled = !restartAvailable;
    restart.title = restartAvailable ? "重启 realman_bringup_remote 容器（行为树会随之停止）" : "宿主机重启助手不可用";
    restart.addEventListener("click", () => void restartBringup(restart));
    const dismiss = el("button", "知道了", "button ghost");
    dismiss.type = "button";
    dismiss.addEventListener("click", () => void clearPending());
    items.push(notice("warn", `有 ${pending.length} 项改动需要重启 bringup 才生效：${labels.join("、")}`, restart, dismiss));
  }
  const btStaged = [...staged.keys()].some((id) => rowsById.get(id)?.applies === "bt_start");
  const btPending = Object.values(runtime).some((item) => item.state === "pending");
  if (launcher.running && (btStaged || btPending)) {
    items.push(notice("warn", `行为树 ${launcher.tree || ""} 正在运行，它不会使用新写入的值；停止后重新启动生效。`));
  }
  // Rebuild only on change: the readback tick refreshes every 2 s and must not swallow a click on these buttons.
  const key = `${restartArmed}|${restartAvailable}|${items.map((item) => item.textContent).join("|")}`;
  if (key === noticeKey) return;
  noticeKey = key;
  noticesBox.replaceChildren(...items);
}

function refresh(): void {
  if (!snapshot) return;
  for (const [id, cells] of cellsById) updateRow(rowsById.get(id)!, cells);
  const count = [...staged.keys()].filter((id) => rowsById.has(id)).length;
  stagedLabel.textContent = `暂存 ${count} 项`;
  stagedLabel.classList.toggle("warn", count > 0);
  writeButton.disabled = busy || count === 0 || !snapshot.writable;
  clearButton.disabled = count === 0;
  resetButton.disabled = busy || !Object.values(snapshot.files).some((info) => info.baseline);
  renderNotices();
}

// ------------------------------------------------------------------------------------------------ data

async function loadSnapshot(): Promise<void> {
  let reply: Reply;
  try {
    reply = await request("/api/params");
  } catch (error) {
    setError(`参数接口不可用：${(error as Error).message}`);
    return;
  }
  if (reply.status === 404) {
    snapshot = null;
    sheetBox.replaceChildren(el("p", "参数调试已关闭（realman_web_control.yaml 的 param_tuning.catalog_file 为空），或者服务端版本还没有这一页。", "hint"));
    writeButton.disabled = clearButton.disabled = resetButton.disabled = true;
    return;
  }
  if (!reply.ok || !Array.isArray(reply.data?.groups)) {
    setError(`参数清单不可用：${reply.data?.error || reply.status}`);
    return;
  }
  snapshot = reply.data as Snapshot;
  rowsById = new Map(snapshot.groups.flatMap((group) => group.rows.map((row) => [row.id, row] as [string, Row])));
  for (const [id, value] of [...staged]) {
    const row = rowsById.get(id);
    if (row && same(row.value, value)) staged.delete(id);
  }
  saveStaged();
  const next = snapshot.groups.map((group) => `${group.id}:${group.rows.map((row) => row.id).join(",")}`).join("|");
  if (next !== signature) {
    signature = next;
    buildSheet(snapshot.groups);
    applyFilter();
  }
  refresh();
}

async function readbackTick(): Promise<void> {
  if (!snapshot || document.hidden) return;
  try {
    const reply = await request("/api/params/readback");
    if (reply.ok) {
      runtime = reply.data.rows ?? {};
      refresh();
    }
  } catch {
    // The next tick retries; the column keeps its last values.
  }
}

async function launcherTick(): Promise<void> {
  if (document.hidden) return;
  try {
    const reply = await request("/api/bt/trees");
    launcher = reply.ok && reply.data.available ? (reply.data.launcher ?? {}) : {};
    renderNotices();
  } catch {
    launcher = {};
  }
}

async function loadRestartStatus(): Promise<void> {
  try {
    const reply = await request("/api/docker/restart");
    restartAvailable = reply.ok && Boolean(reply.data.available) && !reply.data.helper?.restarting;
  } catch {
    restartAvailable = false;
  }
  renderNotices();
}

// ------------------------------------------------------------------------------------------------ writes

function diffBlock(diff: string): HTMLElement {
  const pre = el("pre", undefined, "diff");
  for (const line of diff.split("\n")) {
    const kind = line.startsWith("@@") ? "hunk" : line.startsWith("+") && !line.startsWith("+++") ? "add"
      : line.startsWith("-") && !line.startsWith("---") ? "del" : "";
    pre.append(el("span", `${line}\n`, kind));
  }
  return pre;
}

function changesTable(changes: Change[]): HTMLTableElement {
  const table = el("table", undefined, "confirm-changes");
  const head = el("tr");
  ["参数", "文件", "旧值", "新值", "生效"].forEach((title) => head.append(el("th", title)));
  table.append(head);
  for (const change of changes) {
    const row = rowsById.get(change.id) ?? null;
    const tr = el("tr");
    tr.append(
      el("td", change.label), el("td", change.file.replace(/^ros\//, ""), "mono"),
      el("td", fmt(row, change.before)), el("td", fmt(row, change.after)),
      el("td", APPLIES_SHORT[change.applies] ?? change.applies),
    );
    table.append(tr);
  }
  return table;
}

function confirmWrite(title: string, okText: string, result: WriteResult): Promise<boolean> {
  dialogTitle.textContent = title;
  dialogOk.textContent = okText;
  const summary = el("ul", undefined, "confirm-summary");
  const applies = new Set(result.changes.map((change) => change.applies));
  if (applies.has("bringup_restart")) summary.append(el("li", `重启 bringup 才生效的有 ${result.changes.filter((c) => c.applies === "bringup_restart").length} 项（重启时行为树也会停止）。`));
  if (applies.has("bt_start")) summary.append(el("li", `下次启动行为树生效的有 ${result.changes.filter((c) => c.applies === "bt_start").length} 项。`));
  if (launcher.running && applies.has("bt_start")) summary.append(el("li", `行为树 ${launcher.tree || ""} 正在运行，它不会使用新值。`));
  if (result.changed_since?.length) {
    summary.append(el("li", `这些参数在那次修改之后又被改过，也会被改回：${result.changed_since.map((id) => rowsById.get(id)?.label ?? id).join("、")}`));
  }
  dialogBody.replaceChildren(changesTable(result.changes), summary, diffBlock(result.diff));
  dialog.returnValue = "";
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true });
    dialog.showModal();
  });
}

function reportFailure(action: string, reply: Reply): void {
  if (reply.status === 409) {
    setError(`${action}没有执行：${reply.data.error || "文件已被修改"}。已重新读取配置，暂存保留，请再确认一次。`);
    void loadSnapshot();
  } else if (reply.status === 400 && Array.isArray(reply.data.errors) && reply.data.errors.length) {
    rowErrors = new Map(reply.data.errors.map((item: { id: string; error: string }) => [item.id, item.error]));
    setError(`${action}没有执行，有 ${rowErrors.size} 项不能写入：\n${reply.data.errors
      .map((item: { id: string; error: string }) => `${rowsById.get(item.id)?.label ?? item.id}：${item.error}`).join("\n")}`);
    refresh();
  } else {
    setError(`${action}失败：${reply.data.error || reply.status}`);
  }
}

async function runWrite(action: string, url: string, body: Record<string, unknown>, title: string, okText: string): Promise<WriteResult | null> {
  setError("");
  setMessage("");
  busy = true;
  refresh();
  try {
    const preview = await request(url, { ...body, expected_sha: expectedSha(), dry_run: true });
    if (!preview.ok) {
      reportFailure(action, preview);
      return null;
    }
    if (!(await confirmWrite(title, okText, preview.data as WriteResult))) return null;
    const reply = await request(url, { ...body, expected_sha: expectedSha(), dry_run: false });
    if (!reply.ok) {
      reportFailure(action, reply);
      return null;
    }
    return reply.data as WriteResult;
  } catch (error) {
    setError(`${action}失败：${(error as Error).message}`);
    return null;
  } finally {
    busy = false;
    refresh();
  }
}

async function writeConfig(): Promise<void> {
  const changes = [...staged].filter(([id]) => rowsById.has(id)).map(([id, value]) => ({ id, value }));
  if (!changes.length) return;
  const result = await runWrite("写入", "/api/params/apply", { changes }, "写入配置", "确认写入");
  if (!result) return;
  for (const change of result.changes) staged.delete(change.id);
  rowErrors = new Map();
  saveStaged();
  setMessage(`已写入 ${result.changes.length} 项（记录 ${result.id}）。`);
  await Promise.all([loadSnapshot(), loadHistory()]);
  void readbackTick();
}

async function revertEntry(id: string): Promise<void> {
  const result = await runWrite("撤回", "/api/params/revert", { entry: id }, "撤回这次修改", "确认撤回");
  if (!result) return;
  setMessage(`已撤回 ${id}（新记录 ${result.id}）。`);
  await Promise.all([loadSnapshot(), loadHistory()]);
  void readbackTick();
}

async function restartBringup(button: HTMLButtonElement): Promise<void> {
  if (!armButton(button, "restart", "重启 bringup", "确认重启？")) return;
  button.disabled = true;
  const reply = await request("/api/docker/restart", {}).catch((error) => ({ ok: false, status: 0, data: { error: String(error) } }));
  if (reply.ok) setMessage("已请求重启 bringup；行为树随之停止，重启完成后需要重新启动。");
  else setError(`重启没有执行：${reply.data.error || reply.status}`);
  await Promise.all([loadSnapshot(), loadRestartStatus()]);
}

async function clearPending(): Promise<void> {
  const reply = await request("/api/params/pending/clear", {});
  if (!reply.ok) setError(`没有清除：${reply.data.error || reply.status}`);
  await loadSnapshot();
}

async function resetBaseline(): Promise<void> {
  if (!armButton(resetButton, "baseline", "重置基线", "确认重置基线？")) return;
  const reply = await request("/api/params/baseline/reset", {});
  if (reply.ok) setMessage(reply.data.archived ? `基线已归档到 ${reply.data.archived}，以后从当前文件重新开始。` : "没有基线需要重置。");
  else setError(`没有重置：${reply.data.error || reply.status}`);
  await loadSnapshot();
}

// ------------------------------------------------------------------------------------------------ history

async function loadHistory(): Promise<void> {
  let reply: Reply;
  try {
    reply = await request("/api/params/history");
  } catch {
    return;
  }
  if (!reply.ok) return;
  const entries = (reply.data.entries ?? []) as (WriteResult & { id: string; time: string })[];
  historyCount.textContent = `${entries.length} 条`;
  if (!entries.length) {
    historyBox.replaceChildren(el("p", "还没有修改记录。", "hint"));
    return;
  }
  historyBox.replaceChildren(...entries.map((entry) => {
    const details = el("details", undefined, "history-entry");
    const summary = el("summary");
    summary.append(
      el("strong", new Date(entry.time).toLocaleString("zh-CN", { hour12: false })),
      el("span", `改了 ${entry.changes.length} 项：${entry.changes.map((change) => change.label).join("、")}`),
    );
    if (entry.reverts) summary.append(el("span", `撤回 ${entry.reverts}`, "badge"));
    const revert = el("button", "撤回", "button ghost");
    revert.type = "button";
    revert.addEventListener("click", (event) => {
      event.preventDefault();
      void revertEntry(entry.id);
    });
    summary.append(revert);
    details.append(summary, changesTable(entry.changes), diffBlock(entry.diff));
    return details;
  }));
}

// ------------------------------------------------------------------------------------------------ start

filterInput.addEventListener("input", applyFilter);
writeButton.addEventListener("click", () => void writeConfig());
clearButton.addEventListener("click", () => {
  staged.clear();
  rowErrors = new Map();
  saveStaged();
  refresh();
});
resetButton.addEventListener("click", () => void resetBaseline());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void readbackTick();
});

void (async () => {
  await loadSnapshot();
  await Promise.all([loadHistory(), readbackTick(), launcherTick(), loadRestartStatus()]);
})();
window.setInterval(() => void readbackTick(), READBACK_PERIOD_MS);
window.setInterval(() => void launcherTick(), BT_PERIOD_MS);
```

- [ ] **Step 6: Run the spec to verify it passes, then the whole web-control suite**

From `$WT/website`:

```bash
npx playwright test --config ../config/web-control/playwright.config.mjs tests/web-control/params.spec.ts   # 20 passed
npm run test:web-control                                                                                  # 112 passed
```

- [ ] **Step 7: Rebuild the committed bundle and look at the page**

```bash
npm run build:web-control    # emits static/params.html and static/assets/params-<hash>.{js,css}; control-<hash>.js changes too
git -C $WT status --short src/driver/realman_web_control/realman_web_control/static
```

Expected: old `control-*.js` / `control-*.css` deleted, new ones plus `params.html`, `params-*.js`, `params-*.css` added, `index.html` / `calibration.html` updated. Open the page against the Playwright mocks once (or take a screenshot in a throwaway spec) and check: the 暂存 column's `—` is grey, a staged row is tinted, the top bar is not sticky at phone width, and the sheet scrolls inside its frame.

- [ ] **Step 8: Commit**

```bash
cd $WT
git add config/web-control/vite.config.mjs src/driver/realman_web_control/web \
  src/driver/realman_web_control/realman_web_control/static website/tests/web-control/params.spec.ts
git commit -m "feat(web-control): /params.html parameter sheet with dry-run writes, readback and history

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Developer manual

**Files:**
- Create: `website/docs/development/web-parameter-tuning.md`
- Modify: `config/website/vitepress.config.mts`
- Modify: `website/tests/site.spec.ts`
- Modify: `website/docs/development/index.md`
- Modify: `website/docs/development/realman-web-control.md`

- [ ] **Step 1: Add the route to the site test (fails first)**

In `website/tests/site.spec.ts`, add `"development/web-parameter-tuning",` right after `"development/realman-web-control",` in the route list near line 141 (the list every page must render), and also in the phone no-horizontal-scroll list near line 510.

Run from `$WT/website`: `npm run build && npx playwright test --config ../config/website/playwright.config.mjs -g "documentation routes render"` — expected to fail on `development/web-parameter-tuning` (the page does not exist yet).

- [ ] **Step 2: Write the page**

Create `website/docs/development/web-parameter-tuning.md`:

```markdown
---
title: 网页参数调试
description: :8765 的 /params.html：按白名单清单查看和写入 config/ros 里的参数，读回运行值，留历史、可撤回、可导出补丁。
---

# 网页参数调试

:8765 顶栏的「参数调试」打开 `/params.html`。页面把常调的参数排成一张表：策略任务（`policy_task.yaml`）、行为树执行器
（`behavior_tree.yaml`）、运动限速（`realman_motion.yaml`、`policy_router.yaml`、`pika_config.yaml`）和夹爪
（`gripper.yaml`）。新值先在浏览器里暂存，确认 diff 后写回 `config/ros/*.yaml`。写入时只替换那个值本身，注释和格式
都不动。能读回的参数还会显示运行中节点实际在用的值。

做法参考 golf-course-robot 测试台控制台的「阈值」表。设计见
`docs/superpowers/specs/2026-10-26-web-param-tuning-design.md`。

## 能调哪些参数

只有 [`config/web-control/param_catalog.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/web-control/param_catalog.yaml)
里列出的参数才会显示，也只有它们能写。清单不存数值：数值来自配置文件本身，运行值从节点读。

| 组 | 文件 | 生效时机 | 运行值 |
| --- | --- | --- | --- |
| 策略任务（尝试与重试、安全监督、成功判定、清台检测） | `policy_task.yaml` | 下次启动行为树 | `/realman_bt_executor` |
| 行为树执行器 | `behavior_tree.yaml` | 下次启动行为树 | `/realman_bt_executor` |
| 运动限速 · 驱动（l / m / r） | `realman_motion.yaml` | 重启 bringup | 无 |
| 运动限速 · 策略路由 | `policy_router.yaml` | 下次启动行为树 | `/policy_control_router` |
| 运动限速 · Pika 速度 / 混合 | `pika_config.yaml` | 下次启动行为树 | `/pika_control_router` |
| 夹爪（right / left / mid） | `gripper.yaml` | 重启 bringup | 无 |

这几张表之所以生效时机不同：行为树由 `bt-start` 启动，`control_router.launch.py` 在每次启动时重新读
`policy_task`、`behavior_tree`、`policy_router`、`pika_config`；驱动和 `gripper_manager` 只在 bringup 容器启动时读
`realman_motion.yaml` 和 `gripper.yaml`（`realman_motion.yaml` 也会在行为树启动时转给路由，所以改它要重启 bringup，
重启后行为树需要重新启动）。

刻意不放进清单的：

- 夹爪开合位置 `open_position` / `close_position`：控制页的夹爪卡片在运行时就能改，改动存在 `gripper_overrides.yaml`，
  会盖过 `gripper.yaml`。
- `hard_max_*`：SDK 硬上限，只作为对应参数的「最大」显示。
- 字符串、话题名、提示词、可变长度的列表（比如 `object_detection.exclude_xywh`）。

## 怎么用

1. 在「新值」列输入，回车暂存并跳到下一行（Shift+回车上一行，Esc 清空，↑/↓ 换行，空单元格按 Delete 取消暂存）。
   布尔值用下拉框，选了就暂存。超出范围或违反约束（比如关节下限不能高于上限）的值会标红，不进暂存。暂存只保存在
   这个浏览器里，刷新不丢。
2. 点「写入配置」。服务端先演练一遍（`dry_run`），弹窗列出每项旧值 → 新值、要重启 bringup 的项数和 unified diff；
   确认后才真正写入。
3. 看「生效」列：
   - 能读回的参数：运行值等于文件值显示「已生效」，不等显示「待生效」，节点没在运行显示「未运行」。
   - 驱动和夹爪参数：写入后显示「待重启」，页面顶部出现「重启 bringup」按钮（和控制页的重启按钮是同一个接口，
     两次点击确认）。用别的方式重启过的，点「知道了」清掉提示。
   - 行为树正在运行时，暂存或待生效的参数会提示「运行中的树不会使用新值」。

表格列：`# | 参数 | 备注 | 文件 | 基线值 | 文件值 | 运行值 | 暂存 | 新值 | 最小 | 最大 | 单位 | 生效`。「最大」「最小」
已经算上了引用的另一个参数（悬停可以看到是哪一个，它暂存的新值也算在内）。

## 写入的保护措施

- 只接受清单里的 id；类型、范围、`special`（例如 `-1` = 不限）和 `max_ref` / `min_ref` 约束在浏览器和服务端各查一遍。
- 浮点参数写回时总带小数点（`0.2`、`8.0`）。rclpy 路由按 YAML 里的类型声明参数，浮点写成整数会让它启动失败。
- 写入前用 `yaml.compose` 找到目标值的精确字符位置，只替换那一段；替换后重新解析，和原文档对比必须**只有**目标值变了，
  否则拒绝。
- 请求带上页面读到的文件 sha256，文件在这期间被别人改过就返回 409，页面重新读取，暂存保留。
- 同目录临时文件 + `os.replace`，并把属主和权限改回原文件的（宿主机上 `config/ros` 属于普通用户，容器里是 root）。
  一次写多个文件时，任何一个失败都会把已经写的文件恢复原样。
- 接口和 :8765 其他写操作一样只做同源校验，不需要口令。服务端日志里会记一行谁在什么时候改了什么。

## 历史、基线和补丁

状态都在 `logs/param-tuning/`（容器里 `/opt/rm65_ws/logs/param-tuning/`）：

| 文件 | 内容 |
| --- | --- |
| `history.jsonl` | 每次写入一行：时间、逐项旧值 / 新值、每个文件写入前后的 sha、diff；撤回的记录带 `reverts` |
| `backups/<记录 id>/ros/*.yaml` | 每次写入前的原文件 |
| `baseline/ros/*.yaml`、`baseline.json` | 页面第一次改某个文件之前的副本 |
| `state.json` | 每个文件最后一次由页面写出的 sha、「待重启」列表 |

- **撤回**：「修改历史」里每条都有「撤回」。它把那条记录里的每一项改回旧值，走同样的演练和确认，记成一条新记录。
  如果某项之后又被改过，确认框会列出来（照样改回）。
- **基线值**：有基线时显示基线里的值，否则就是当前文件值；文件值和基线不同的单元格会高亮。
- **导出补丁**：基线到当前文件的 unified diff，路径头是 `a/config/ros/...`，在仓库根目录 `git apply` 后提 PR。
- **重置基线**：改动合进仓库并重新部署后点它（两次确认），旧基线挪到 `baseline-archive/<时间>/`，以后从当前文件重新开始。
- 某个文件在页面外被改过（手改、重新部署）时，页面会标出来；补丁仍以基线为准。

## 加一个参数

1. 在清单对应的组里加一行：`key`（相对组 `prefix` 的点分路径）、`type`（`int` / `float` / `bool` / `int[]` / `float[]`）、
   `min` / `max`、`unit`、`note`（必填，中文）。数组还要 `labels`（每个元素一行）。需要时加 `special`、
   `max_ref` / `min_ref`（`{key: ..., strict: true}` 表示严格小于 / 大于）、`label`（显示名）。
2. 路径语法：映射键 `a.b`、列表下标 `a[2]`、按字段选列表项 `buses[port=/dev/realman/gripper_{i}]`；`{i}` 换成组的
   `instances` 里的每个名字。
3. 能读回就给组写 `readback: {node: /节点名, param: "模板{key}"}`；参数名在 launch 文件里被改过的，在参数上单独写
   `readback` 覆盖。
4. 跑 `test_param_tuning.py`：`test_root_catalog_matches_the_root_config` 会检查每一行在文件里存在、类型对、当前值在
   范围内、满足引用约束。
5. 重启 `realman_web_control` 容器（清单只在启动时读）。

## 部署要求

- `config/docker/compose.yaml` 的 `realman_web_control` 服务要把 `./config/ros` 以读写方式挂进去（和 bringup 一样）。
  这个挂载是创建容器时定的，所以第一次部署要**重建** web_control 容器，`restart` 不够。没重建的容器里页面是只读的，
  顶部会说明原因，其他功能不受影响。
- `config/ros/realman_web_control.yaml` 的 `param_tuning.catalog_file` 置空即关闭这一页（`/api/params*` 返回 404）。

## 接口

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/params` | 清单展开后的行、文件 sha、是否可写、清单错误、页面外修改、待重启 |
| GET | `/api/params/readback` | 每行的运行值和「已生效 / 待生效 / 未运行」 |
| POST | `/api/params/apply` | `{changes: [{id, value}], expected_sha, dry_run}`；400 逐项原因，409 文件已变或只读 |
| POST | `/api/params/revert` | `{entry, expected_sha, dry_run}` |
| GET | `/api/params/history` | 最近 100 条记录 |
| GET | `/api/params/export` | 补丁（下载） |
| POST | `/api/params/baseline/reset` | 归档基线 |
| POST | `/api/params/pending/clear` | 清掉待重启（通过 `/api/docker/restart` 重启成功时自动清） |

## 排错

- **页面只读**：web_control 容器没有以读写方式挂 `./config/ros`，见「部署要求」。
- **某些参数不见了，顶部提示清单对不上**：配置文件里删了或改了那个键、类型变了；改清单或配置，让清单测试通过。
- **一直「待生效」**：写入后还没重启行为树。停止当前的树再启动。
- **运行值一直「未运行」**：对应节点没起来（行为树没在运行时三个节点都不在），或者 `GetParameters` 超过
  `param_tuning.readback_timeout_sec` 没应答。
- **写入时提示文件已被修改**：别人刚改过同一个文件（另一个浏览器、手改）。页面已经重新读取，确认 diff 后再写一次。

## 代码在哪

| 位置 | 内容 |
| --- | --- |
| `src/driver/realman_web_control/realman_web_control/param_tuning.py` | 清单解析、精确改写、校验、写入、历史、基线、补丁（不依赖 ROS） |
| `src/driver/realman_web_control/realman_web_control/param_readback.py` | `GetParameters` 读回（不依赖 rclpy，节点注入客户端） |
| `src/driver/realman_web_control/realman_web_control/web_server.py` | `/api/params*` 接口 |
| `src/driver/realman_web_control/web/params.html`、`web/src/params.ts`、`web/src/params.css` | 页面 |
| `src/driver/realman_web_control/test/test_param_tuning.py`、`test_param_readback.py`、`test_param_api.py` | pytest（无 ROS，CI 运行） |
| `website/tests/web-control/params.spec.ts` | Playwright |
```

- [ ] **Step 3: Link it**

`config/website/vitepress.config.mts`, in the 控制与输入 sidebar group, right after the Web 控制 entry:

```ts
          { text: "Web 控制与 URDF 影子", link: "/development/realman-web-control" },
          { text: "网页参数调试", link: "/development/web-parameter-tuning" },
```

`website/docs/development/index.md`, in the 按任务进入 table, right after the 浏览器控制台 row:

```markdown
| 在网页上调参数（策略任务阈值、限速、夹爪）、看运行值、导出补丁 | [网页参数调试](./web-parameter-tuning) | `config/web-control/param_catalog.yaml` |
```

`website/docs/development/realman-web-control.md`, a new subsection directly before `## WebSocket 协议`:

```markdown
### 参数调试页

顶栏的「参数调试」打开 `/params.html`：按白名单清单 `config/web-control/param_catalog.yaml` 列出策略任务、行为树执行器、
运动限速和夹爪参数，暂存后确认 diff 再写回 `config/ros/*.yaml`，并从运行中的节点读回实际值。用法、生效时机、历史和
补丁见 [网页参数调试](./web-parameter-tuning)。写入需要 web_control 容器以读写方式挂载 `./config/ros`。
```

- [ ] **Step 4: Build, style gate and site tests**

From `$WT/website`:

```bash
npm run build
node ../.agents/skills/realman-site-design-system/scripts/check-site-style.mjs   # site style check passed
npm run test:e2e
```

Expected: build complete, style check passed, e2e all green (record the count).

- [ ] **Step 5: Commit**

```bash
cd $WT
git add website/docs/development/web-parameter-tuning.md website/docs/development/index.md \
  website/docs/development/realman-web-control.md config/website/vitepress.config.mts website/tests/site.spec.ts
git commit -m "docs: web parameter tuning page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Final verification

- [ ] **Step 1: Whole Python suite and lint, as CI runs them**

```bash
cd $WT && $RUFF check --config config/python/ruff.toml src tools scripts docker
cd $WT/src/driver/realman_web_control && PYTHONPATH=. $PY -m pytest -q test -p no:cacheprovider   # 224 passed, 1 skipped
```

- [ ] **Step 2: Whole web-control and site suites**

From `$WT/website`: `npm run test:web-control` (112 passed) and `npm run test:e2e`.

- [ ] **Step 3: The bundle matches the sources**

```bash
cd $WT/website && npm run build:web-control && git -C $WT status --short
```

Expected: nothing to commit (the committed bundle is what the sources build to).

- [ ] **Step 4: Node smoke test in the robot image (optional, needs the robot or server5090)**

The node wiring cannot run on macOS. When a ROS Humble image with the workspace is available, run the package tests there (`colcon test --packages-select realman_web_control`, or the throwaway-container recipe in the project memory: `--network none`, `-p no:anyio`) and start the node once with `REALMAN_CONFIG_ROOT` pointing at a copy of `config/` to see `/api/params` answer and `/api/params/readback` report `offline` for nodes that are not running. Report it as not run if no image is available.

- [ ] **Step 5: Report**

List the commits, the test counts, what was not verified (node on ROS, writes inside a real container with the read-write mount), and the deployment note: the web_control container must be **recreated** (not restarted) for the new `./config/ros` mount; until then the page is read-only.
