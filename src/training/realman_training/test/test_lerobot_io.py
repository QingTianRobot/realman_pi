from __future__ import annotations

import json

import numpy as np
import pytest
from lerobot_fixture import HOME_DEG, Episode, build_dataset, build_view, gripper

from realman_training.lerobot_io import (
    NotALeRobotDataset,
    is_dataset,
    read_episode_columns,
    read_episodes,
    read_info,
    read_task_names,
)


@pytest.fixture()
def raw(tmp_path):
    return build_dataset(
        tmp_path / "raw",
        [
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 30))),
            Episode("pick_only", gripper((50, 20), (5700, 40))),
        ],
    )


def test_info_and_detection(raw, tmp_path):
    assert is_dataset(raw)
    assert not is_dataset(tmp_path)
    assert read_info(raw)["fps"] == 30


def test_a_directory_without_info_is_rejected(tmp_path):
    with pytest.raises(NotALeRobotDataset, match="meta/info.json"):
        read_info(tmp_path)


def test_another_codebase_version_is_rejected(raw):
    info = json.loads((raw / "meta" / "info.json").read_text())
    info["codebase_version"] = "v2.1"
    (raw / "meta" / "info.json").write_text(json.dumps(info))
    with pytest.raises(NotALeRobotDataset, match="v2.1"):
        read_info(raw)


def test_task_names_from_the_pandas_index_and_from_a_task_column(raw, tmp_path):
    assert read_task_names(raw) == {0: "pick_and_place", 1: "pick_only"}
    view = build_view(tmp_path / "view", source="x", prompts={"a": "do a", "b": "do b"}, lengths=[10, 10])
    assert read_task_names(view) == {0: "do a", 1: "do b"}


def test_episode_rows(raw):
    rows = read_episodes(raw)
    assert [(r.index, r.task, r.length) for r in rows] == [(0, "pick_and_place", 120), (1, "pick_only", 60)]
    assert rows[1].data_file == raw / "data" / "chunk-000" / "file-001.parquet"
    assert (rows[1].from_index, rows[1].to_index) == (120, 180)


def test_episode_columns_are_float_arrays_of_the_episode_only(raw):
    episode = read_episodes(raw)[1]
    columns = read_episode_columns(episode, ["observation.gripper_position", "observation.joint_position"])
    assert columns["observation.gripper_position"].shape == (60, 3)
    assert columns["observation.gripper_position"][25, 2] == pytest.approx(5700.0)
    np.testing.assert_allclose(np.degrees(columns["observation.joint_position"][0, 12:18]), HOME_DEG, atol=1e-4)


import pyarrow as pa
import pyarrow.parquet as pq

from realman_training.lerobot_io import read_columns, video_files


def test_read_columns_reads_a_shared_data_file_once_and_splits_it(tmp_path, monkeypatch):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5), (6000, 5))), Episode("a", gripper((50, 7)))])
    # Put both episodes into one data file, as LeRobot does when files are not split per episode.
    first = pq.read_table(root / "data/chunk-000/file-000.parquet")
    second = pq.read_table(root / "data/chunk-000/file-001.parquet")
    pq.write_table(pa.concat_tables([first, second]), root / "data/chunk-000/file-000.parquet")
    (root / "data/chunk-000/file-001.parquet").unlink()
    meta = root / "meta/episodes/chunk-000/file-001.parquet"
    table = pq.read_table(meta)
    i = table.schema.get_field_index("data/file_index")
    pq.write_table(table.set_column(i, table.schema.field(i), pa.array([0], pa.int64())), meta)
    calls = []
    original = pq.read_table
    monkeypatch.setattr(pq, "read_table", lambda path, **kw: calls.append(str(path)) or original(path, **kw))
    columns = read_columns(root, ["observation.gripper_position"])
    assert [str(p).endswith("file-000.parquet") for p in calls if "/data/" in str(p)] == [True]
    assert list(columns) == [0, 1]
    assert columns[0]["observation.gripper_position"].shape == (10, 3)
    assert columns[1]["observation.gripper_position"][:, 2].tolist() == [50.0] * 7


def test_a_missing_column_is_not_a_lerobot_dataset(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5)))])
    with pytest.raises(NotALeRobotDataset, match="observation.nope"):
        read_columns(root, ["observation.nope"])


def test_video_files_follow_the_video_path_template(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5))), Episode("a", gripper((50, 5)))])
    files = video_files(root)
    assert sorted(files) == [0, 1]
    assert [p.relative_to(root).as_posix() for p in files[1]] == [
        "videos/observation.images.d435/chunk-000/file-001.mp4",
        "videos/observation.images.orbbec-right/chunk-000/file-001.mp4",
    ]
    assert all(p.is_file() for p in files[0] + files[1])


def test_the_fixture_writes_every_declared_column_and_per_episode_stats(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5), (6000, 5)))])
    info = json.loads((root / "meta/info.json").read_text())
    table = pq.read_table(root / "data/chunk-000/file-000.parquet")
    declared = {k for k, v in info["features"].items() if v["dtype"] != "video"}
    assert declared <= set(table.column_names)
    row = pq.read_table(root / "meta/episodes/chunk-000/file-000.parquet").to_pylist()[0]
    assert row["stats/observation.gripper_position/max"] == [0.0, 0.0, 6000.0]
    assert row["stats/index/count"] == [10]
    assert json.loads((root / "meta/stats.json").read_text())["observation.gripper_position"]["max"] == [0.0, 0.0, 6000.0]
