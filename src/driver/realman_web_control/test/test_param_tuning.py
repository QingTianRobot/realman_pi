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
    # The node runs but did not declare it (e.g. an older executor build): not the same as "not running".
    assert rows["main/count"] == {"state": "undeclared", "value": None}
    assert rows["main/enabled"] == {"state": "undeclared", "value": None}
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
