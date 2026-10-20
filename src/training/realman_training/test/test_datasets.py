from __future__ import annotations

import pytest
from lerobot_fixture import VIDEO_BYTES, Episode, build_dataset, build_view, gripper, write_clean_manifest

from realman_training.datasets import discover, summarize
from realman_training.lerobot_io import NotALeRobotDataset


def _raw(root, task_column="__index_level_0__"):
    return build_dataset(
        root,
        [
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 30))),
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 60))),
            Episode("pick_only", gripper((50, 30), (5700, 60))),
        ],
        task_column=task_column,
    )


def test_a_raw_recording_is_summarized(tmp_path):
    summary = summarize(_raw(tmp_path / "raw_realman_ts_20261016" / "realman__pi05-three-arm"))
    assert summary.kind == "raw"
    assert summary.name == "realman__pi05-three-arm"
    assert (summary.episodes, summary.frames, summary.fps) == (3, 360, 30)
    assert summary.duration_sec == pytest.approx(12.0)
    assert summary.tasks == {"pick_and_place": 2, "pick_only": 1}
    assert summary.task_frames == {"pick_and_place": 270, "pick_only": 90}
    assert summary.codebase_version == "v3.0"
    assert summary.robot_type == "realman-rm65-b-three-arm-v1"
    assert summary.features["observation.gripper_position"] == {"dtype": "float32", "shape": [3]}
    assert "observation.images.d435" not in summary.features  # cameras are listed separately
    assert [(c.key, c.codec, c.height, c.width) for c in summary.cameras] == [
        ("d435", "av1", 480, 640),
        ("orbbec-right", "av1", 480, 640),
    ]
    assert summary.disk_bytes > 3 * 2 * VIDEO_BYTES
    assert summary.first_file_time is not None and summary.first_file_time <= summary.last_file_time
    assert (summary.source, summary.removed_episodes, summary.prompts) == (None, None, {})


def test_a_task_column_works_like_the_pandas_index(tmp_path):
    assert summarize(_raw(tmp_path / "d", task_column="task")).tasks == {"pick_and_place": 2, "pick_only": 1}


def test_a_cleaned_set_reports_its_source_and_how_many_were_removed(tmp_path):
    root = _raw(tmp_path / "realman__multitask_clean")
    write_clean_manifest(root, source="raw_realman_ts_20261016", removed={13: "starts closed", 28: "re-grasp"})
    summary = summarize(root)
    assert (summary.kind, summary.source, summary.removed_episodes) == ("clean", "raw_realman_ts_20261016", 2)


def test_a_training_view_reports_its_prompts(tmp_path):
    prompts = {"pick_and_place": "pick up the power adapter and put it in the blue bin", "pick_only": "pick up the power adapter"}
    view = build_view(tmp_path / "realman_right_arm_multitask_view", source="clean", prompts=prompts, lengths=[30, 30, 30])
    summary = summarize(view)
    assert (summary.kind, summary.source, summary.prompts) == ("view", "clean", prompts)
    assert summary.tasks == {prompts["pick_and_place"]: 2, prompts["pick_only"]: 1}
    assert summary.features["action"] == {"dtype": "float32", "shape": [7]}


def test_to_dict_is_plain_json_data(tmp_path):
    data = summarize(_raw(tmp_path / "d")).to_dict()
    assert data["cameras"][0] == {"key": "d435", "codec": "av1", "height": 480, "width": 640}
    assert data["tasks"] == {"pick_and_place": 2, "pick_only": 1}


def test_discover_finds_nested_datasets_and_skips_everything_else(tmp_path):
    raw = _raw(tmp_path / "raw_realman_ts_20261016" / "realman__pi05-three-arm")
    clean = _raw(tmp_path / "realman__multitask_clean")
    (tmp_path / "_a0").mkdir()
    (tmp_path / ".hidden" / "x" / "meta").mkdir(parents=True)
    (tmp_path / "notes.txt").write_text("not a dataset")
    assert discover(tmp_path) == sorted([raw, clean])


def test_a_non_dataset_is_rejected(tmp_path):
    with pytest.raises(NotALeRobotDataset):
        summarize(tmp_path)
