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
    assert p["episodes"]["1"]["task"] == "pick_only"
    _edit(raw, lambda d: d["episodes"][0].update(length=1))
    assert "does not match" in episode_tags.payload(raw)["error"]


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
