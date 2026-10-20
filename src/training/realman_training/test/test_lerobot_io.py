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
