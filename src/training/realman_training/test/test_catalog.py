from __future__ import annotations

import json

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, PICK, PLACE, TRAINING, build_world

from realman_training import catalog
from realman_training.config import load_config
from realman_training.jobs import JobStore
from realman_training.summary_cache import SummaryCache


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    config = load_config(paths["config"])
    return paths, config, SummaryCache(config.quality)


def test_datasets_are_listed_with_kind_counts_and_quality(world):
    paths, config, cache = world
    rows = {row["path"]: row for row in catalog.list_datasets(config, cache)}
    assert set(rows) == {"raw_realman_ts_20261016/realman__pi05-three-arm", "realman__multitask_clean",
                         "realman_right_arm_multitask_view"}
    raw = rows["raw_realman_ts_20261016/realman__pi05-three-arm"]
    assert (raw["kind"], raw["episodes"], raw["name"]) == ("raw", 5, "realman__pi05-three-arm")
    assert raw["quality_counts"] == {"ok": 2, "suggest_drop": 2, "warn": 1}
    assert rows["realman__multitask_clean"]["kind"] == "clean"
    assert rows["realman__multitask_clean"]["removed_episodes"] == 2
    view = rows["realman_right_arm_multitask_view"]
    assert view["kind"] == "view" and view["quality_counts"] is None
    assert view["prompts"] == {"pick_and_place": PLACE, "pick_only": PICK}


def test_datasets_are_listed_newest_first_and_same_named_pulls_stay_apart(world):
    import os
    import shutil

    paths, config, cache = world
    newer = paths["data"] / "raw_realman_ts_20261021_152817" / "realman__pi05-three-arm"
    shutil.copytree(paths["raw"], newer)
    later = max(p.stat().st_mtime for p in paths["data"].rglob("*.parquet")) + 3600
    for path in (newer / "data").rglob("*"):
        os.utime(path, (later, later))
    rows = catalog.list_datasets(config, cache)
    assert rows[0]["path"] == "raw_realman_ts_20261021_152817/realman__pi05-three-arm"
    times = [catalog._instant(row["last_file_time"]) for row in rows]
    assert times == sorted(times, reverse=True)


def test_newest_first_compares_instants_not_text():
    # 09:53 UTC is 17:53 at +08:00: later than 15:48 +08:00 although it sorts lower as text.
    assert catalog._instant("2026-10-16T09:53:08+00:00") > catalog._instant("2026-10-16T15:48:23+08:00")


def test_openpi_configs_come_from_the_checkout_and_the_checkpoints(world):
    paths, config, cache = world
    source = paths["root"] / "openpi" / "src" / "openpi" / "training" / "config.py"
    source.parent.mkdir(parents=True)
    source.write_text('TrainConfig(\n    name="pi05_realman_multitask_v2_action_only",\n)\nTrainConfig(name="pi0_aloha")\n')
    names = catalog.openpi_configs(config)
    assert "pi05_realman_multitask_v2_action_only" in names and CONFIG_NAME in names
    assert "pi0_aloha" not in names


def test_a_broken_dataset_is_a_row_not_a_crash(world):
    paths, config, cache = world
    broken = paths["data"] / "broken"
    (broken / "meta").mkdir(parents=True)
    (broken / "meta" / "info.json").write_text('{"codebase_version": "v2.1"}')
    rows = {row["path"]: row for row in catalog.list_datasets(config, cache)}
    assert rows["broken"]["kind"] == "error" and "v2.1" in rows["broken"]["error"]


def test_dataset_detail_and_path_rules(world):
    paths, config, cache = world
    detail = catalog.dataset_detail(config, cache, "raw_realman_ts_20261016/realman__pi05-three-arm")
    assert detail["path"] == "raw_realman_ts_20261016/realman__pi05-three-arm"
    assert detail["suggested_drops"] == [1, 2]
    assert set(detail["traces"]) == {"0", "1", "2", "3", "4"}
    assert "fingerprint" not in detail
    for bad in ("/etc", "../x", "raw_realman_ts_20261016/../../x", ""):
        with pytest.raises(catalog.BadRequest):
            catalog.resolve_dataset(config, bad)
    with pytest.raises(catalog.NotFound):
        catalog.resolve_dataset(config, "raw_realman_ts_20261016")  # a folder, not a dataset


def test_runs_list_both_runs_with_their_state(world):
    _, config, _ = world
    runs = {row["name"]: row for row in catalog.list_runs(config)}
    done = runs[MODEL]
    assert done["checkpoints"] == [10000, 29999] and done["registered"] is True
    assert done["last_loss"] == pytest.approx(0.5 * 2.718281828 ** (-29900 / 8000) + 0.02, abs=1e-4)
    assert done["eval_latest"] == {"step": 29999, "tasks": {"pick_and_place": 0.096, "pick_only": 0.092}}
    assert done["view"] == "realman_right_arm_multitask_view"
    training = runs["/".join(TRAINING)]
    assert training["registered"] is False and training["ended"] is None and training["last_loss"] == pytest.approx(0.46)


def test_run_detail_has_metrics_eval_and_card(world):
    _, config, _ = world
    detail = catalog.run_detail(config, CONFIG_NAME, EXP, max_points=50)
    assert len(detail["metrics"]["step"]) <= 50 and detail["metrics"]["step"][-1] == 29900
    assert set(detail["metrics"]) == {"step", "grad_norm", "loss", "param_norm"}
    assert detail["eval"]["29999"]["prompt_swap"]["pick_only"]["pick_and_place"] == 0.187
    assert detail["card"]["method"] == "pi0.5 action-only fine-tune"
    assert "generated by" in detail["card_markdown"]
    live = catalog.run_detail(config, *TRAINING)
    assert live["metrics"]["step"][:2] == [0, 100] and live["metrics"]["loss"][0] == pytest.approx(0.6)
    with pytest.raises(catalog.NotFound):
        catalog.run_detail(config, CONFIG_NAME, "nope")
    with pytest.raises(catalog.BadRequest):
        catalog.run_detail(config, "../x", EXP)


def test_models_are_the_registered_runs(world):
    _, config, _ = world
    data = catalog.list_models(config)
    assert [m["name"] for m in data["models"]] == [MODEL]
    model = data["models"][0]
    assert model["serving"] is True and model["dataset"] == "realman_right_arm_multitask_view"
    assert model["open_loop"] == {"step": 29999, "tasks": {"pick_and_place": 0.096, "pick_only": 0.092},
                                  "zero_baseline": {"pick_and_place": 0.41, "pick_only": 0.39}}
    assert model["tasks"]["pick_only"]["prompt"] == PICK
    assert "模型登记表" in data["registry_markdown"]


def test_linkcheck_history_is_newest_first(world):
    _, config, _ = world
    history = catalog.linkcheck_history(config, limit=10)
    assert [h["ok"] for h in history] == [False, True]
    assert catalog.linkcheck_history(config, limit=1)[0]["at"].startswith("2026-10-21")


def test_serve_settings_overlay_the_defaults(world):
    _, config, _ = world
    assert catalog.serve_defaults(config) == {"model": MODEL, "checkpoint": "", "gpu": 2, "port": 18000, "task": None}
    assert catalog.load_settings(config) == {}
    catalog.save_settings(config, {"gpu": 3, "task": "pick_only"})
    assert catalog.effective_settings(config) == {"model": MODEL, "checkpoint": "", "gpu": 3, "port": 18000,
                                                  "task": "pick_only"}
    models = catalog.serve_models(config)
    assert models == [{"name": MODEL, "checkpoints": [10000, 29999],
                       "prompts": {"pick_and_place": PLACE, "pick_only": PICK}}]


def test_job_row_drops_the_config_path(tmp_path):
    store = JobStore(tmp_path / "c")
    folder = tmp_path / "c" / "jobs" / "20261021-100000-clean-abcd"
    folder.mkdir(parents=True)
    (folder / "params.json").write_text('{"kind": "clean", "target": "x:y", "params": {"config": "/c.yaml", "src": "/d/a"}}')
    (folder / "status.json").write_text('{"id": "20261021-100000-clean-abcd", "kind": "clean", "state": "succeeded", "result": {"dst": "/d/b"}}')
    row = catalog.job_row(store.get("20261021-100000-clean-abcd"))
    assert row["params"] == {"src": "/d/a"} and row["result"] == {"dst": "/d/b"} and row["state"] == "succeeded"


def test_run_detail_with_nan_loss_row(world):
    import math
    paths, config, _ = world
    # Append a row with NaN loss to the metrics CSV
    run = paths["run"]
    csv_path = run / "metrics.csv"
    csv_path.write_text(csv_path.read_text(encoding="utf-8") + "99999,nan,nan,nan\n", encoding="utf-8")
    detail = catalog.run_detail(config, CONFIG_NAME, EXP)
    # Non-finite floats must become None, never actual NaN/Inf
    losses = detail["metrics"].get("loss", [])
    assert all(v is None or (isinstance(v, float) and math.isfinite(v)) for v in losses), losses
    # The last entry (step 99999) should have None for loss
    step_idx = detail["metrics"]["step"].index(99999)
    assert detail["metrics"]["loss"][step_idx] is None


def test_dataset_detail_on_broken_dataset_raises_bad_request(world):
    paths, config, cache = world
    broken = paths["data"] / "broken_detail"
    (broken / "meta").mkdir(parents=True)
    (broken / "meta" / "info.json").write_text('{"codebase_version": "v2.1"}', encoding="utf-8")
    with pytest.raises(catalog.BadRequest):
        catalog.dataset_detail(config, cache, "broken_detail")


def test_a_hand_evaluated_run_shows_the_eval_from_its_card(world):
    paths, config, _ = world
    (paths["run"] / "eval" / "summary.json").unlink()
    card = json.loads((paths["run"] / "model_card.json").read_text())
    card["prompt_swap_29999"] = {"pick_and_place_correct": 0.0962, "pick_and_place_swapped": 0.1121,
                                 "pick_only_correct": 0.0923, "pick_only_swapped": 0.1164}
    (paths["run"] / "model_card.json").write_text(json.dumps(card))
    evals = catalog.run_detail(config, CONFIG_NAME, EXP)["eval"]
    assert evals["29999"]["pick_only"] == {"mae": 0.092, "zero_baseline": 0.39}
    assert evals["10000"]["pick_and_place"]["mae"] == 0.121
    assert evals["29999"]["prompt_swap"]["pick_only"] == {"pick_only": 0.0923, "其他任务的 prompt": 0.1164}


def test_a_hand_trained_run_takes_its_facts_from_the_card(world, monkeypatch):
    paths, config, _ = world
    monkeypatch.setenv("HOME", str(paths["root"]))
    (paths["run"] / "console_train.json").unlink()
    card = json.loads((paths["run"] / "model_card.json").read_text())
    card["dataset_dir"] = "server5090:~/data/realman_right_arm_multitask_view"
    card["gpus"] = "2x RTX 5090 (server5090 GPU 1,2), data parallel"
    (paths["run"] / "model_card.json").write_text(json.dumps(card))
    row = catalog.run_detail(config, CONFIG_NAME, EXP)
    assert (row["view"], row["gpus"], row["batch_size"]) == ("realman_right_arm_multitask_view", [1, 2], 16)
    assert row["started"] == "2026-10-16T09:54:38+08:00" and row["ended"] == "2026-10-16T16:09:40+08:00"
    assert catalog.list_models(config)["models"][0]["dataset"] == "realman_right_arm_multitask_view"
    assert catalog.card_path("/abs/x") == "/abs/x" and catalog.card_path(None) is None


def _training_log(world, text, age_sec):
    import os
    import time

    paths, config, _ = world
    log = paths["docker_data"] / "wandb" / f"{TRAINING[1]}.log"
    log.write_text(log.read_text(encoding="utf-8") + text, encoding="utf-8")
    stamp = time.time() - age_sec
    os.utime(log, (stamp, stamp))
    return {row["name"]: row for row in catalog.list_runs(config)}["/".join(TRAINING)]["pace"], stamp


def test_a_live_run_reports_speed_and_eta_from_the_tqdm_line(world):
    from datetime import datetime

    line = "07:33:17.111 [I] Progress on: 1.69kit/30.0kit rate:1.3it/s remaining:5:50:20 elapsed:21:29 postfix:- (215:tqdm_logging.py:145)\n"
    pace, stamp = _training_log(world, line, age_sec=20)
    assert pace["source"] == "tqdm" and pace["rate"] == pytest.approx(1.3) and pace["remaining_sec"] == 5 * 3600 + 50 * 60 + 20
    assert pace["stale"] is False
    assert datetime.fromisoformat(pace["eta"]).timestamp() == pytest.approx(stamp + pace["remaining_sec"], abs=1)
    assert datetime.fromisoformat(pace["updated"]).timestamp() == pytest.approx(stamp, abs=1)


def test_a_slow_run_in_seconds_per_step_and_a_quiet_log_is_stale(world):
    line = "Progress on: 120it/5.00kit rate:2.50s/it remaining:3:23:20 elapsed:5:00 postfix:-\n"
    pace, _ = _training_log(world, line, age_sec=3600)
    assert pace["rate"] == pytest.approx(0.4) and pace["remaining_sec"] == 3 * 3600 + 23 * 60 + 20
    assert pace["stale"] is True


def test_without_a_tqdm_line_the_pace_is_the_average_since_start():
    from datetime import datetime

    started = "2026-10-21T08:00:00+08:00"
    updated = datetime.fromisoformat(started).timestamp() + 1400
    pace = catalog.pace_of({"started": started, "num_train_steps": 5000}, last_step=1400, log=None,
                           updated=updated, now=updated + 10)
    assert pace["source"] == "average" and pace["rate"] == pytest.approx(1.0) and pace["remaining_sec"] == pytest.approx(3600)


def test_a_finished_run_reports_its_average_speed(world):
    _, config, _ = world
    pace = {row["name"]: row for row in catalog.list_runs(config)}[MODEL]["pace"]
    assert pace["rate"] == pytest.approx(29999 / 22502, rel=1e-3) and pace["eta"] is None and pace["remaining_sec"] is None
