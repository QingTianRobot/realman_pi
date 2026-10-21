from __future__ import annotations

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, build_world

from realman_training import job_params
from realman_training.catalog import BadRequest
from realman_training.config import load_config

RAW = "raw_realman_ts_20261016/realman__pi05-three-arm"
VIEW = "realman_right_arm_multitask_view"


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    return paths, load_config(paths["config"])


def test_clean_resolves_paths_and_keeps_reasons_for_dropped_episodes_only(world):
    paths, config = world
    params = job_params.build("clean", {"src": RAW, "drop": [2, 1, 2], "reasons": {"1": "empty", "2": "re-grasp"},
                                        "dst": "my_clean"}, config)
    assert params == {"config": str(config.source), "src": str(paths["raw"]), "drop": [1, 2],
                      "reasons": {"1": "empty", "2": "re-grasp"}, "dst": str(paths["data"] / "my_clean")}
    default = job_params.build("clean", {"src": RAW, "drop": [1]}, config)
    assert default["dst"].startswith(str(paths["data"])) and "_clean_" in default["dst"]


@pytest.mark.parametrize("raw, fragment", [
    ({"src": RAW, "drop": []}, "nothing to drop"),
    ({"src": RAW, "drop": [-1]}, "episode"),
    ({"src": RAW, "drop": ["1"]}, "episode"),
    ({"src": RAW, "drop": [1], "reasons": {"3": "x"}}, "not dropped"),
    ({"src": RAW, "drop": [1], "dst": "../evil"}, "name"),
    ({"src": RAW, "drop": [1], "dst": "realman__multitask_clean"}, "exists"),
    ({"src": "/etc", "drop": [1]}, "relative"),
    ({"src": RAW, "drop": [1], "rm": True}, "unknown"),
])
def test_clean_refuses_bad_input(world, raw, fragment):
    _, config = world
    with pytest.raises(BadRequest, match=fragment):
        job_params.build("clean", raw, config)


def test_view_norm_train_eval_register(world):
    paths, config = world
    view = job_params.build("view", {"src": "realman__multitask_clean", "task_prompts": {"pick_only": "pick it"},
                                     "arm": "r", "dry_run": True}, config)
    assert view["src"] == str(paths["clean"]) and view["task_prompts"] == {"pick_only": "pick it"}
    assert view["arm"] == "r" and view["dry_run"] is True and view["dst"].endswith("_view")
    with pytest.raises(BadRequest, match="training view"):
        job_params.build("view", {"src": VIEW}, config)
    norm = job_params.build("norm", {"config_name": CONFIG_NAME, "view": VIEW}, config)
    assert norm == {"config": str(config.source), "config_name": CONFIG_NAME, "view": str(paths["view"]),
                    "force": False, "dry_run": False}
    with pytest.raises(BadRequest, match="not a training view"):
        job_params.build("norm", {"config_name": CONFIG_NAME, "view": RAW}, config)
    train = job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "1, 2",
                                       "batch": 16, "steps": 30000}, config)
    assert (train["gpus"], train["batch"], train["steps"], train["resume"], train["attach"]) == ("1,2", 16, 30000, False, False)
    with pytest.raises(BadRequest, match="gpus"):
        job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "x"}, config)
    with pytest.raises(BadRequest, match="batch"):
        job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "1", "batch": 0}, config)
    evaluation = job_params.build("eval", {"config_name": CONFIG_NAME, "exp": EXP, "view": VIEW, "gpu": 3,
                                           "checkpoints": [29999]}, config)
    assert (evaluation["gpu"], evaluation["checkpoints"], evaluation["prompt_swap"]) == ("3", [29999], None)
    no_swap = job_params.build("eval", {"config_name": CONFIG_NAME, "exp": EXP, "view": VIEW, "gpu": 3,
                                        "prompt_swap": False}, config)
    assert no_swap["prompt_swap"] is False and no_swap["checkpoints"] is None
    register = job_params.build("register", {"config_name": CONFIG_NAME, "exp": EXP, "status": "ok"}, config)
    assert register == {"config": str(config.source), "config_name": CONFIG_NAME, "exp": EXP, "status": "ok",
                        "method": None, "force": False}


def test_pull_and_linkcheck(world):
    paths, config = world
    pull = job_params.build("pull", {"name": "raw_x"}, config)
    assert pull == {"config": str(config.source), "target": str(paths["data"] / "raw_x")}
    with pytest.raises(BadRequest, match="exists"):
        job_params.build("pull", {"name": "realman__multitask_clean"}, config)
    assert job_params.build("linkcheck", {"only": ["link", "pika"]}, config)["only"] == ["link", "pika"]
    assert job_params.build("linkcheck", {}, config)["only"] is None
    with pytest.raises(BadRequest, match="only"):
        job_params.build("linkcheck", {"only": ["wifi"]}, config)


def test_serve_start_fills_from_the_settings_and_checks_the_model(world):
    _, config = world
    params = job_params.build("serve", {"action": "start", "gpu": 3}, config,
                              settings={"model": MODEL, "checkpoint": "", "gpu": 2, "port": 18000, "task": "pick_only"})
    assert params == {"config": str(config.source), "action": "start", "model": MODEL, "checkpoint": None, "gpu": 3,
                      "port": 18000, "task": "pick_only", "dry_run": False}
    with pytest.raises(BadRequest, match="no run"):
        job_params.build("serve", {"action": "start", "model": "pi05_x/none"}, config, settings={})
    with pytest.raises(BadRequest, match="task"):
        job_params.build("serve", {"action": "start", "task": "dance"}, config, settings={"model": MODEL})
    assert job_params.build("serve", {"action": "stop"}, config) == {"config": str(config.source), "action": "stop",
                                                                     "dry_run": False}
    with pytest.raises(BadRequest, match="action"):
        job_params.build("serve", {"action": "restart"}, config)


def test_settings_are_validated(world):
    _, config = world
    assert job_params.validate_settings({"model": MODEL, "checkpoint": 29999, "gpu": 1, "port": 18000,
                                         "task": "pick_and_place"}, config) == {
        "model": MODEL, "checkpoint": "29999", "gpu": 1, "port": 18000, "task": "pick_and_place"}
    with pytest.raises(BadRequest, match="checkpoint"):
        job_params.validate_settings({"model": MODEL, "checkpoint": 5}, config)
    with pytest.raises(BadRequest, match="port"):
        job_params.validate_settings({"port": 0}, config)
    with pytest.raises(BadRequest, match="unknown"):
        job_params.validate_settings({"colour": "x"}, config)


def test_unknown_kind(world):
    _, config = world
    with pytest.raises(BadRequest, match="kind"):
        job_params.build("delete", {}, config)
