from __future__ import annotations

import numpy as np
import pytest
from lerobot_fixture import FPS, HOME_DEG, Episode, build_dataset, build_view, gripper

from realman_training.config import QualityConfig
from realman_training.quality import QualityUnavailable, check_episode, inspect, suggested_drops

CONFIG = QualityConfig()


def codes(task, readings, start_deg=HOME_DEG):
    joints = np.tile(np.asarray(start_deg, dtype=float), (len(readings), 1))
    return {f.code for f in check_episode(task, np.asarray(readings, dtype=float), joints, FPS, CONFIG)}


def test_a_clean_pick_and_place_has_no_findings():
    assert codes("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))) == set()


def test_a_clean_pick_only_ends_closed_without_findings():
    assert codes("pick_only", gripper((50, 60), (5700, 120))) == set()


def test_a_thin_held_object_is_not_closed_on_nothing():
    # 2026-10-16 kept pick_only episodes whose plateau reached 7904.
    assert codes("pick_only", gripper((50, 60), (7904, 120))) == set()


def test_starting_closed():
    # e.g. raw #13: closed for the first 17 frames.
    assert "start_closed" in codes("pick_and_place", gripper((6000, 17), (50, 60), (5700, 100), (50, 40)))


def test_closing_twice_is_a_regrasp():
    # e.g. raw #130: two closing events.
    found = codes("pick_and_place", gripper((50, 60), (5700, 60), (50, 30), (5700, 60), (50, 30)))
    assert "regrasp" in found and "glitch" not in found


def test_never_closing():
    # raw #216: maximum reading 3931, below the closed threshold.
    assert codes("pick_only", gripper((50, 60), (3931, 100))) == {"never_closed"}


def test_closing_on_nothing():
    # raw #181/#189/#209: plateaus 8414-8550.
    assert codes("pick_only", gripper((50, 60), (8450, 100))) == {"closed_on_nothing"}


def test_closing_on_nothing_is_judged_on_the_last_closed_run_before_the_release():
    assert "closed_on_nothing" in codes("pick_and_place", gripper((50, 60), (8450, 100), (50, 60)))


def test_a_place_task_that_never_releases():
    # raw #78/#121: pick_and_place ending with the adapter still held.
    assert codes("pick_and_place", gripper((50, 60), (5700, 100))) == {"no_release"}


def test_a_short_open_reading_inside_a_grasp_is_a_glitch():
    # raw #69: one open frame splits one grasp into two.
    found = codes("pick_and_place", gripper((50, 60), (5700, 50), (50, 1), (5700, 50), (50, 30)))
    assert {"glitch", "regrasp"} <= found


def test_a_slightly_closed_first_reading_is_only_a_warning():
    findings = check_episode(
        "pick_only",
        np.asarray(gripper((560, 5), (50, 55), (5700, 100)), dtype=float),
        np.tile(np.asarray(HOME_DEG), (160, 1)),
        FPS,
        CONFIG,
    )
    assert [(f.code, f.severity) for f in findings] == [("start_partial", "warn")]


def test_a_start_away_from_the_training_pose_is_only_a_warning():
    off = (HOME_DEG[0] + 5.0, *HOME_DEG[1:])
    assert codes("pick_only", gripper((50, 60), (5700, 120)), start_deg=off) == {"start_pose"}


def test_messages_carry_the_numbers():
    findings = check_episode(
        "pick_only",
        np.asarray(gripper((50, 60), (8450, 100)), dtype=float),
        np.tile(np.asarray(HOME_DEG), (160, 1)),
        FPS,
        CONFIG,
    )
    assert "8450" in findings[0].message and "8300" in findings[0].message


def test_inspect_gives_one_verdict_per_episode_and_the_drop_list(tmp_path):
    root = build_dataset(
        tmp_path / "raw",
        [
            Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
            Episode("pick_only", gripper((50, 60), (8450, 100))),
            Episode("pick_only", gripper((560, 5), (50, 55), (5700, 100))),
            Episode("pick_and_place", gripper((50, 60), (5700, 100))),
        ],
    )
    results = inspect(root, CONFIG)
    assert [(r.episode, r.task, r.verdict) for r in results] == [
        (0, "pick_and_place", "ok"),
        (1, "pick_only", "suggest_drop"),
        (2, "pick_only", "warn"),
        (3, "pick_and_place", "suggest_drop"),
    ]
    assert suggested_drops(results) == [1, 3]
    assert results[1].to_dict()["findings"][0]["code"] == "closed_on_nothing"
    assert results[0].frames == 270


def test_a_training_view_has_no_raw_gripper_readings(tmp_path):
    view = build_view(tmp_path / "view", source="x", prompts={"a": "do a"}, lengths=[30])
    with pytest.raises(QualityUnavailable, match="observation.gripper_position"):
        inspect(view, CONFIG)
