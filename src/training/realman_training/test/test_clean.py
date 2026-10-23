from __future__ import annotations

import json
import os
from pathlib import Path

import pyarrow.parquet as pq
import pytest
from fake_runner import RecordingLog
from lerobot_fixture import Episode, build_dataset, gripper, write_tags

from realman_training import episode_tags

from realman_training.datasets import summarize
from realman_training.jobs import StepFailed
from realman_training.lerobot_io import read_episodes, video_files
from realman_training.quality import inspect_dataset
from realman_training.config import QualityConfig
from realman_training.steps import clean


@pytest.fixture()
def raw(tmp_path):
    good = gripper((50, 40), (5700, 60), (50, 40))
    episodes = [
        Episode("pick_and_place", good),
        Episode("pick_and_place", gripper((5700, 40), (50, 100))),  # starts closed -> suggested drop
        Episode("pick_only", gripper((50, 40), (5700, 50))),
        Episode("pick_only", gripper((50, 40), (8450, 50))),  # closed on nothing -> suggested drop
        Episode("pick_and_place", good),
    ]
    root = build_dataset(tmp_path / "raw_realman_ts_20261020_101500" / "realman__pi05-three-arm", episodes)
    (root.parent / "pull.json").write_text(json.dumps({"origin": "realman_local:rec:/data/x"}))
    return root


def test_drop_renumbers_hard_links_and_writes_the_manifest(raw, tmp_path):
    dst = tmp_path / "clean"
    log = RecordingLog()
    result = clean.run({"src": str(raw), "dst": str(dst), "drop": [1, 3], "reasons": {"1": "starts closed"}}, log)
    assert result["kept_episodes"] == 3
    rows = read_episodes(dst)
    assert [r.index for r in rows] == [0, 1, 2]
    assert [r.task for r in rows] == ["pick_and_place", "pick_only", "pick_and_place"]
    assert [(r.from_index, r.to_index) for r in rows] == [(0, 140), (140, 230), (230, 370)]
    table = pq.read_table(dst / "data/chunk-000/file-001.parquet")
    assert set(table.column("episode_index").to_pylist()) == {1}
    assert table.column("index").to_pylist() == list(range(140, 230))
    old, new = video_files(raw), video_files(dst)
    assert os.stat(new[1][0]).st_ino == os.stat(old[2][0]).st_ino  # hard link, no copy
    manifest = json.loads(Path(f"{dst}.clean_manifest.json").read_text())
    assert manifest["old_to_new"] == {"0": 0, "2": 1, "4": 2}
    assert manifest["removed"]["1"] == {"frames": 140, "reason": "starts closed"}
    assert "closed plateau" in manifest["removed"]["3"]["reason"]  # missing reasons come from the quality rules
    assert manifest["source"] == str(raw) and manifest["origin"] == "realman_local:rec:/data/x"
    assert (manifest["kept_episodes"], manifest["kept_frames"]) == (3, 370)
    info = json.loads((dst / "meta/info.json").read_text())
    assert (info["total_episodes"], info["total_frames"], info["splits"]) == (3, 370, {"train": "0:3"})
    summary = summarize(dst)
    assert summary.kind == "clean" and summary.removed_episodes == 2
    assert [q.verdict for q in inspect_dataset(dst, QualityConfig())] == ["ok", "ok", "ok"]


def test_stats_are_reaggregated_and_index_stats_shifted(raw, tmp_path):
    dst = tmp_path / "clean"
    clean.run({"src": str(raw), "dst": str(dst), "drop": [0]}, RecordingLog())
    stats = json.loads((dst / "meta/stats.json").read_text())
    assert stats["index"]["min"] == [0] and stats["index"]["max"] == [summarize(dst).frames - 1]
    assert stats["episode_index"]["max"] == [3]
    assert stats["observation.gripper_position"]["count"] == [summarize(dst).frames]
    worst = clean.verify_stats(dst)
    assert max(worst[s] for s in ("min", "max", "mean", "std", "count")) < 1e-6


def test_verify_stats_reproduces_the_recorders_stats(raw):
    worst = clean.verify_stats(raw)
    assert max(worst[s] for s in ("min", "max", "mean", "std", "count")) < 1e-6


def test_keep_is_the_complement_of_drop(raw, tmp_path):
    result = clean.run({"src": str(raw), "dst": str(tmp_path / "sub"), "keep": [0, 2]}, RecordingLog())
    assert result["kept_episodes"] == 2 and sorted(result["removed"]) == ["1", "3", "4"]


@pytest.mark.parametrize(
    "params, fragment",
    [
        ({"drop": []}, "nothing to drop"),
        ({"drop": [9]}, "not in the dataset"),
        ({"keep": []}, "keep at least one"),
        ({"drop": [1], "keep": [0]}, "either drop or keep"),
    ],
)
def test_bad_selections_are_refused(raw, tmp_path, params, fragment):
    with pytest.raises(StepFailed, match=fragment):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), **params}, RecordingLog())
    assert not (tmp_path / "x").exists() and not (tmp_path / "x.partial").exists()


def test_an_existing_target_is_refused_and_left_alone(raw, tmp_path):
    (tmp_path / "x").mkdir()
    (tmp_path / "x" / "keep.txt").write_text("mine")
    with pytest.raises(StepFailed, match="exists"):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), "drop": [1]}, RecordingLog())
    assert (tmp_path / "x" / "keep.txt").read_text() == "mine"


def test_a_failure_halfway_removes_only_the_partial_target(raw, tmp_path, monkeypatch):
    def broken_link(src, dst):
        raise OSError(18, "Invalid cross-device link")

    monkeypatch.setattr(os, "link", broken_link)
    with pytest.raises(StepFailed, match="same filesystem"):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), "drop": [1]}, RecordingLog())
    assert not (tmp_path / "x.partial").exists() and summarize(raw).episodes == 5


def test_default_dst_is_under_data_root(tmp_path):
    dst = clean.default_dst(tmp_path, tmp_path / "raw_x" / "realman__pi05-three-arm")
    assert dst.parent == tmp_path and dst.name.startswith("realman__pi05-three-arm_clean_")


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
