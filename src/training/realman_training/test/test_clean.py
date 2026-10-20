from __future__ import annotations

import json
import os
from pathlib import Path

import pyarrow.parquet as pq
import pytest
from fake_runner import RecordingLog
from lerobot_fixture import Episode, build_dataset, gripper

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
