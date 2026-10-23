from __future__ import annotations

import json

import pytest
from console_fixture import MODEL, PICK, PLACE, build_world

from realman_training import serve_dataset
from realman_training.catalog import BadRequest, NotFound
from realman_training.config import load_config


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    return paths, load_config(paths["config"])


def test_the_served_model_s_dataset_splits_by_task_and_holdout(world):
    _, config = world
    data = serve_dataset.model_dataset(config, MODEL)
    assert data["step"] == 29999 and data["view"] == "realman_right_arm_multitask_view"
    assert data["totals"] == {"episodes": 3, "frames": 90, "duration_sec": 3.0, "train": 2, "holdout": 1}
    tasks = {t["task"]: t for t in data["tasks"]}
    assert tasks["pick_and_place"]["prompt"] == PLACE and tasks["pick_only"]["prompt"] == PICK
    assert (tasks["pick_only"]["episodes"], tasks["pick_only"]["train"], tasks["pick_only"]["holdout"]) == (2, 1, 1)
    assert tasks["pick_only"]["length_sec"]["median"] == 1.0
    assert data["lengths"]["unit"] == "s" and sum(sum(c) for c in data["lengths"]["counts"].values()) == 3
    assert data["description"]["arm"] == "r" and data["description"]["fps"] == 30.0
    assert data["norm_stats"] is None


def test_lineage_walks_view_clean_raw_with_what_each_step_removed(world):
    _, config = world
    lineage = serve_dataset.model_dataset(config, MODEL)["lineage"]
    assert [row["kind"] for row in lineage] == ["view", "clean", "raw"]
    clean = lineage[1]
    assert clean["removed"] == 2 and clean["reasons"] == {"closed on nothing": 1, "re-grasp": 1}
    assert clean["removed_tasks"] == {"pick_only": 1, "pick_and_place": 1}
    assert lineage[2]["path"].startswith("raw_realman_ts_20261016")


def test_reasons_group_without_their_readings():
    assert serve_dataset.reason_keys("closed plateau 8550 >= 8300: the jaws met on nothing") == [
        "closed plateau N >= N: the jaws met on nothing"]
    assert serve_dataset.reason_keys("gripper closed in the first 1 s (max reading 5289); 2 closing events (re-grasp)") == [
        "gripper closed in the first N s", "N closing events"]
    assert serve_dataset.reason_keys(None) == ["人工剔除"]


def test_norm_stats_come_from_the_checkpoint_assets(world):
    paths, config = world
    stats = {"norm_stats": {k: {"mean": [0.1] * 7, "std": [0.2] * 7, "q01": [-1.0] * 7, "q99": [1.0] * 7}
                            for k in ("state", "actions")}}
    target = paths["run"] / "29999" / "assets" / "local" / "realman_right_arm" / "norm_stats.json"
    target.parent.mkdir(parents=True)
    target.write_text(json.dumps(stats))
    norm = serve_dataset.model_dataset(config, MODEL, 29999)["norm_stats"]
    assert norm["state"]["labels"][-1] == "夹爪" and norm["actions"]["labels"][0] == "vx"
    assert norm["actions"]["q99"] == [1.0] * 7
    assert norm["file"].endswith("29999/assets/local/realman_right_arm/norm_stats.json")
    assert serve_dataset.model_dataset(config, MODEL, 10000)["norm_stats"] is None


def test_a_moved_view_still_answers_with_the_reason(world):
    paths, config = world
    paths["view"].rename(paths["view"].with_name("moved"))
    data = serve_dataset.model_dataset(config, MODEL)
    assert "不在 server5090 上" in data["error"] and "tasks" not in data


def test_bad_names_and_steps(world):
    _, config = world
    with pytest.raises(BadRequest):
        serve_dataset.model_dataset(config, "no-slash")
    with pytest.raises(NotFound):
        serve_dataset.model_dataset(config, "pi05_realman_x/none")
    with pytest.raises(NotFound):
        serve_dataset.model_dataset(config, MODEL, 123)


def _write_tags(view, rows):
    (view / "episode_tags.json").write_text(json.dumps({"schema_version": 1, "snapshot_at": "2026-10-23T09:30:00+08:00",
                                                        "episodes": rows}))


def test_without_a_tag_file_the_card_says_so(world):
    _, config = world
    assert serve_dataset.model_dataset(config, MODEL)["tags"] == {"state": "missing", "file": "episode_tags.json"}


def test_lighting_and_date_split_by_task_holdout_and_source(world):
    paths, config = world
    _write_tags(paths["view"], [
        {"episode_index": 0, "length": 30, "tags": {"lighting_level": 2, "date": "2026-10-12"},
         "tag_sources": {"lighting_level": "manual", "date": "derived"}},
        {"episode_index": 1, "length": 30, "tags": {"lighting_level": 1, "date": "2026-10-21"},
         "tag_sources": {"lighting_level": "manual", "date": "derived"}},
        {"episode_index": 2, "length": 30, "tags": {"lighting_level": 2, "date": "2026-10-21"},
         "tag_sources": {"lighting_level": "default", "date": "derived"}},
    ])
    tags = serve_dataset.model_dataset(config, MODEL)["tags"]
    assert tags["state"] == "ok" and tags["snapshot_at"].startswith("2026-10-23")
    lighting = {s["value"]: s for s in tags["keys"]["lighting_level"]}
    assert [s["value"] for s in tags["keys"]["lighting_level"]] == [1, 2]
    assert lighting[1] == {"value": 1, "episodes": 1, "frames": 30, "by_task": {"pick_only": 1}, "holdout": 1, "manual": 1}
    assert lighting[2]["by_task"] == {"pick_and_place": 1, "pick_only": 1} and lighting[2]["manual"] == 1
    assert [(s["value"], s["episodes"]) for s in tags["keys"]["date"]] == [("2026-10-12", 1), ("2026-10-21", 2)]


def test_a_tag_file_that_does_not_match_the_view_is_not_shown(world):
    paths, config = world
    _write_tags(paths["view"], [{"episode_index": i, "length": 31, "tags": {}} for i in range(3)])
    tags = serve_dataset.model_dataset(config, MODEL)["tags"]
    assert tags["state"] == "mismatch" and "tags refresh" in tags["error"] and "keys" not in tags
