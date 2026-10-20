from __future__ import annotations

import json

import pytest
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.cli import main


@pytest.fixture()
def setup(tmp_path):
    raw = build_dataset(
        tmp_path / "data" / "raw_realman_ts_20261016" / "realman__pi05-three-arm",
        [
            Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
            Episode("pick_only", gripper((50, 60), (8450, 100))),
        ],
    )
    view = build_view(tmp_path / "data" / "right_arm_view", source="clean", prompts={"a": "do a"}, lengths=[30])
    config = tmp_path / "console.yaml"
    config.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n")
    return raw, view, config


def test_inspect_json_has_the_summary_the_verdicts_and_the_drops(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw), "--json"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["summary"]["episodes"] == 2 and data["summary"]["kind"] == "raw"
    assert [q["verdict"] for q in data["quality"]] == ["ok", "suggest_drop"]
    assert data["suggested_drops"] == [1]
    assert data["quality_unavailable"] is None


def test_inspect_text_is_readable(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw)]) == 0
    out = capsys.readouterr().out
    assert "realman__pi05-three-arm  [raw]" in out
    assert "episodes 2" in out and "LeRobot v3.0" in out
    assert "pick_and_place 1" in out and "pick_only 1" in out
    assert "d435 av1 480x640" in out
    assert "quality: 1 ok, 1 suggest drop, 0 warn" in out
    # severity padded to 5, a space, then the episode right-aligned in 3: "drop " + " " + "  1"
    assert "drop    1  pick_only  closed_on_nothing" in out


def test_inspect_of_a_view_explains_why_there_is_no_quality(setup, capsys):
    _, view, config = setup
    assert main(["--config", str(config), "inspect", str(view), "--json"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["quality"] is None and "observation.gripper_position" in data["quality_unavailable"]
    assert data["summary"]["prompts"] == {"a": "do a"}


def test_inspect_can_skip_quality(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw), "--json", "--no-quality"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["quality"] is None and data["quality_unavailable"] == "skipped"


def test_list_uses_data_root_from_the_config(setup, capsys):
    raw, view, config = setup
    assert main(["--config", str(config), "list", "--json"]) == 0
    assert [s["path"] for s in json.loads(capsys.readouterr().out)] == sorted([str(raw), str(view)])
    assert main(["--config", str(config), "list"]) == 0
    out = capsys.readouterr().out
    assert "realman__pi05-three-arm" in out and "right_arm_view" in out and "view" in out


def test_a_bad_path_is_an_error_not_a_traceback(setup, capsys, tmp_path):
    _, _, config = setup
    assert main(["--config", str(config), "inspect", str(tmp_path / "missing")]) == 2
    assert "error:" in capsys.readouterr().err
