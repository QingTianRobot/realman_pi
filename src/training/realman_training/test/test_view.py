from __future__ import annotations

import json
import os
import shlex
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.config import load_config
from realman_training.jobs import StepFailed
from realman_training.steps import view

PLACE = "pick up the power adapter and put it in the blue bin"
PICK = "pick up the power adapter"
GOOD_PLACE = [1.0] * 10 + [0.0] * 10 + [1.0] * 10
GOOD_PICK = [1.0] * 10 + [0.0] * 20


@pytest.fixture()
def clean(tmp_path):
    return build_dataset(
        tmp_path / "data" / "realman__pi05-three-arm_clean_20261020",
        [Episode("pick_and_place", gripper((50, 30))), Episode("pick_only", gripper((50, 30)))],
    )


def fake_make_view(targets):
    """Plays make_realman_view.py: writes a view with the given gripper targets at --dst."""

    def action(argv, input):
        inner = shlex.split(argv[-1].split("make_realman_view.py", 1)[1])
        dst = inner[inner.index("--dst") + 1]
        pairs = inner[inner.index("--task-prompt") + 1 :]
        prompts = dict(pair.split("=", 1) for pair in pairs)
        build_view(
            Path(dst), source="src", prompts=prompts, lengths=[len(t) for t in targets],
            gripper_targets=targets, tasks=["pick_and_place", "pick_only"],
        )

    return FakeRunner().on("make_realman_view.py", action=action, lines=["view written"])


def test_view_runs_make_realman_view_in_the_openpi_image_and_checks_labels(clean, tmp_path):
    dst = tmp_path / "data" / "v"
    runner = fake_make_view([GOOD_PLACE, GOOD_PICK])
    result = view.run({"src": str(clean), "dst": str(dst)}, RecordingLog(), runner=runner)
    assert result["label_failures"] == [] and result["episodes"] == 2
    assert result["prompts"] == {"pick_and_place": PLACE, "pick_only": PICK}
    argv = runner.calls[0]
    assert argv[:3] == ["docker", "run", "--rm"] and "--network" in argv
    data_root = str(tmp_path / "data")
    assert f"{data_root}:{data_root}" in argv  # one common mount, so hard links work inside the container
    inner = shlex.split(argv[-1].split("make_realman_view.py", 1)[1])
    assert inner[inner.index("--task-prompt") + 1 :] == [f"pick_and_place={PLACE}", f"pick_only={PICK}"]
    assert json.loads((dst / "label_check.json").read_text())["failures"] == []


def test_wrong_gripper_labels_fail_the_job_and_name_the_episodes(clean, tmp_path):
    runner = fake_make_view([GOOD_PICK, GOOD_PICK])  # the place episode never releases
    with pytest.raises(StepFailed, match=r"1 episode\(s\).*\b0\b"):
        view.run({"src": str(clean), "dst": str(tmp_path / "data" / "v")}, RecordingLog(), runner=runner)
    failures = json.loads((tmp_path / "data" / "v" / "label_check.json").read_text())["failures"]
    assert failures == [{"episode": 0, "task": "pick_and_place", "found": "open>closed", "expected": "open>closed>open"}]


def test_a_task_without_a_prompt_is_refused_before_docker(clean, tmp_path):
    config = tmp_path / "c.yaml"
    config.write_text("training_console:\n  prompts:\n    pick_and_place: x\n")
    runner = FakeRunner()
    with pytest.raises(StepFailed, match="pick_only"):
        view.run({"src": str(clean), "dst": str(tmp_path / "v"), "config": str(config)}, RecordingLog(), runner=runner)
    assert runner.calls == []


def test_given_prompts_override_the_config(clean, tmp_path):
    result = view.run(
        {"src": str(clean), "dst": str(tmp_path / "data" / "v"), "task_prompts": {"pick_only": "hold it"}, "dry_run": True},
        RecordingLog(),
        runner=FakeRunner(),
    )
    assert "pick_only=hold it" in result["command"][-1] and f"pick_and_place={PLACE}" in result["command"][-1]


def test_an_existing_target_and_a_view_source_are_refused(clean, tmp_path):
    (tmp_path / "exists").mkdir()
    with pytest.raises(StepFailed, match="exists"):
        view.run({"src": str(clean), "dst": str(tmp_path / "exists")}, RecordingLog(), runner=FakeRunner())
    v = build_view(tmp_path / "data" / "already", source="s", prompts={"a": "b"}, lengths=[3])
    with pytest.raises(StepFailed, match="already a training view"):
        view.run({"src": str(v), "dst": str(tmp_path / "data" / "v2")}, RecordingLog(), runner=FakeRunner())


def test_a_failing_script_fails_the_step(clean, tmp_path):
    runner = FakeRunner().on("make_realman_view.py", returncode=1, lines=["Traceback", "ValueError: x"])
    with pytest.raises(StepFailed, match="exited 1"):
        view.run({"src": str(clean), "dst": str(tmp_path / "data" / "v")}, RecordingLog(), runner=runner)


def test_check_gripper_labels_on_a_built_view(tmp_path):
    root = build_view(
        tmp_path / "v", source="s", prompts={"pick_and_place": PLACE, "pick_only": PICK}, lengths=[30, 30, 30],
        gripper_targets=[GOOD_PLACE, GOOD_PICK, [1.0] * 30], tasks=["pick_and_place", "pick_only", "pick_only"],
    )
    failures = view.check_gripper_labels(root, ("pick_and_place",))
    assert [f["episode"] for f in failures] == [2] and failures[0]["found"] == "open"


def test_default_dst(tmp_path):
    assert view.default_dst(tmp_path, tmp_path / "x_clean_1") == tmp_path / "x_clean_1_view"


def test_uid_is_used_for_the_container(clean, tmp_path):
    argv = view.view_command(load_config().openpi, clean, tmp_path / "data" / "v", "r", {"a": "b"})
    assert argv[argv.index("--user") + 1] == f"{os.getuid()}:{os.getgid()}"
