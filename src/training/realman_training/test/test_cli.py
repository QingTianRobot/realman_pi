from __future__ import annotations

import json
from pathlib import Path

import pytest
from lerobot_fixture import Episode, build_dataset, build_view, gripper, write_tags

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


def test_one_bad_dataset_does_not_break_list(tmp_path, capsys):
    import json as _json

    good = build_dataset(
        tmp_path / "data" / "good",
        [Episode("pick_only", gripper((50, 60), (5700, 100)))],
    )
    bad = tmp_path / "data" / "bad"
    bad.mkdir(parents=True)
    (bad / "meta").mkdir()
    (bad / "meta" / "info.json").write_text('{"codebase_version": "v2.1", "fps": 30, "features": {}}')
    (bad / "meta" / "tasks.parquet").write_bytes(b"")  # not a valid parquet -> ArrowInvalid or similar
    config = tmp_path / "console.yaml"
    config.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n")
    code = main(["--config", str(config), "list", "--json"])
    assert code == 0
    rows = _json.loads(capsys.readouterr().out)
    kinds = {r["path"]: r["kind"] for r in rows}
    assert kinds[str(good)] != "error"
    assert kinds[str(bad)] == "error"


def test_config_with_unknown_quality_key_exits_2(tmp_path, capsys):
    config = tmp_path / "bad.yaml"
    config.write_text("training_console:\n  quality:\n    unknown_key_xyz: 1\n")
    ds = build_dataset(
        tmp_path / "ds",
        [Episode("pick_only", gripper((50, 60), (5700, 100)))],
    )
    code = main(["--config", str(config), "inspect", str(ds)])
    assert code == 2
    err = capsys.readouterr().err
    assert "unknown_key_xyz" in err
    assert "Traceback" not in err


def test_nonexistent_config_path_exits_2(tmp_path, capsys):
    code = main(["--config", str(tmp_path / "nosuchfile.yaml"), "list"])
    assert code == 2
    assert "error:" in capsys.readouterr().err


from realman_training.cli import build_params, parse_checkpoints, parse_episodes
from realman_training.config import load_config
from realman_training.jobs import JobStore


def test_parse_episodes():
    assert parse_episodes("1,2,5-7") == [1, 2, 5, 6, 7]
    assert parse_episodes(" 3 ") == [3]
    with pytest.raises(ValueError):
        parse_episodes("7-5")


def test_parse_checkpoints_rejects_ranges():
    assert parse_checkpoints("1000,2000") == [1000, 2000]
    assert parse_checkpoints(" 500 ") == [500]
    with pytest.raises(ValueError, match="integers"):
        parse_checkpoints("1000-2000")
    with pytest.raises(ValueError, match="integers"):
        parse_checkpoints("abc")


def cli_args(argv):
    from realman_training.cli import make_parser

    return make_parser().parse_args(argv)


def test_build_params_for_each_step(setup, tmp_path):
    raw, view, config_path = setup
    config = load_config(config_path)
    kind, params = build_params(cli_args(["pull"]), config)
    assert kind == "pull" and params["target"].startswith(str(tmp_path / "data" / "raw_realman_ts_"))
    assert params["config"] == str(config_path.resolve())
    kind, params = build_params(cli_args(["clean", str(raw), "--drop", "1"]), config)
    assert (kind, params["drop"]) == ("clean", [1]) and "_clean_" in params["dst"]
    _, params = build_params(cli_args(["clean", str(raw), "--suggested"]), config)
    assert params["drop"] == [1] and "closed plateau" in params["reasons"]["1"]
    kind, params = build_params(cli_args(["view", str(raw), "--task-prompt", "pick_only=hold it", "--dry-run"]), config)
    assert params["task_prompts"] == {"pick_only": "hold it"} and params["dry_run"] is True
    assert params["dst"].endswith("realman__pi05-three-arm_view")
    kind, params = build_params(cli_args(["train", "pi05_x", str(view), "--exp", "e1", "--gpus", "1,2", "--batch", "16", "--yes"]), config)
    assert (kind, params["gpus"], params["batch"], params["exp"]) == ("train", "1,2", 16, "e1")
    assert params["init_from"] is None and params["share_gpus"] is False
    _, params = build_params(cli_args(["train", "pi05_x", str(view), "--exp", "e1", "--gpus", "2", "--yes",
                                       "--init-from", "pi05_old/e0/29999", "--share-gpus"]), config)
    assert (params["init_from"], params["share_gpus"]) == ("pi05_old/e0/29999", True)
    kind, params = build_params(cli_args(["eval", "pi05_x", "e1", "--view", str(view), "--gpu", "2", "--checkpoints", "1000,2000", "--no-prompt-swap"]), config)
    assert params["checkpoints"] == [1000, 2000] and params["prompt_swap"] is False
    kind, params = build_params(cli_args(["register", "pi05_x", "e1", "--status", "已部署"]), config)
    assert (kind, params["status"]) == ("register", "已部署")


def test_train_without_yes_is_refused_and_starts_nothing(setup, capsys):
    _, view, config_path = setup
    code = main(["--config", str(config_path), "train", "pi05_x", str(view), "--exp", "e1", "--gpus", "1"])
    assert code == 2 and "--yes" in capsys.readouterr().err
    assert JobStore(load_config(config_path).console_dir).list() == []


def test_clean_runs_as_a_job_in_the_foreground_and_shows_up_in_jobs(setup, tmp_path, capsys):
    raw, _, config_path = setup
    dst = tmp_path / "data" / "cleaned"
    assert main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(dst)]) == 0
    assert dst.is_dir()
    capsys.readouterr()
    assert main(["--config", str(config_path), "jobs", "--json"]) == 0
    jobs = json.loads(capsys.readouterr().out)
    assert jobs[0]["kind"] == "clean" and jobs[0]["state"] == "succeeded"
    assert main(["--config", str(config_path), "job", jobs[0]["id"], "--log"]) == 0
    assert "built" in capsys.readouterr().out


def test_a_failed_step_exits_1_with_the_reason(setup, tmp_path, capsys):
    raw, _, config_path = setup
    (tmp_path / "data" / "exists").mkdir()
    code = main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(tmp_path / "data" / "exists")])
    assert code == 1 and "exists" in capsys.readouterr().err


def test_background_returns_the_job_id(setup, tmp_path, capsys):
    raw, _, config_path = setup
    code = main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(tmp_path / "data" / "bg"), "--background"])
    assert code == 0
    job_id = capsys.readouterr().out.strip()
    store = JobStore(load_config(config_path).console_dir)
    assert store.wait(job_id, lambda line: None)["state"] == "succeeded"


def test_serve_start_needs_yes(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "serve", "start"]) == 2
    assert "--yes" in capsys.readouterr().err


def test_serve_stop_needs_yes(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "serve", "stop"]) == 2
    assert "--yes" in capsys.readouterr().err


def test_serve_start_runs_a_serve_job_with_the_options(setup, monkeypatch):
    _, _, config = setup
    seen = {}

    def fake_run_job(kind, params, args, cfg):
        seen.update(kind=kind, params=params)
        return 0

    monkeypatch.setattr("realman_training.cli._run_job", fake_run_job)
    assert main(["--config", str(config), "serve", "start", "--gpu", "3", "--task", "pick_only", "--dry-run"]) == 0
    assert seen["kind"] == "serve"
    assert seen["params"]["action"] == "start" and seen["params"]["gpu"] == 3 and seen["params"]["task"] == "pick_only"
    assert seen["params"]["dry_run"] is True and "port" not in seen["params"]


def test_serve_status_prints_json(setup, monkeypatch, capsys):
    _, _, config = setup
    data = {"serve": {"running": False}, "gpu": {"index": 2}, "bridge": {"error": "realman_ts unreachable"},
            "bt_mode": None, "record": {}}
    monkeypatch.setattr("realman_training.serving.status", lambda cfg: data)
    assert main(["--config", str(config), "serve", "status", "--json"]) == 0
    assert json.loads(capsys.readouterr().out) == data
    assert main(["--config", str(config), "serve", "status"]) == 0
    out = capsys.readouterr().out
    assert "openpi-serve: not running" in out and "policy_bridge: realman_ts unreachable" in out


def test_linkcheck_exit_code_follows_the_checks(setup, monkeypatch, capsys):
    from realman_training.linkcheck import Check

    _, _, config = setup
    results = [Check("pika", "pika_nodes", True, "0", "0"), Check("link", "ping", False, "avg 80 ms", "avg <= 50 ms")]
    seen = {}

    def fake_checks(cfg, runner=None, only=None, **kw):
        seen["only"] = only
        return results

    monkeypatch.setattr("realman_training.linkcheck.run_checks", fake_checks)
    assert main(["--config", str(config), "linkcheck", "--only", "pika,link"]) == 1
    out = capsys.readouterr().out
    assert "PASS  pika_nodes" in out and "FAIL  ping" in out
    assert seen["only"] == ["pika", "link"]
    assert main(["--config", str(config), "linkcheck", "--json"]) == 1
    assert json.loads(capsys.readouterr().out)["ok"] is False


def test_linkcheck_refuses_unknown_items(setup, capsys):
    _, _, config = setup
    assert main(["--config", str(config), "linkcheck", "--only", "wifi"]) == 2
    assert "pika, link, inference, bridge" in capsys.readouterr().err


def test_web_is_a_subcommand():
    from realman_training.cli import make_parser

    args = make_parser().parse_args(["web", "--port", "9999"])
    assert (args.command, args.port, args.host) == ("web", 9999, None)


def test_clean_where_needs_tags_and_then_filters(setup, tmp_path, capsys):
    raw, _, config_path = setup
    args = ["--config", str(config_path), "clean", str(raw), "--where", "success=true"]
    assert main([*args, "--dst", str(tmp_path / "data" / "c1")]) == 1
    assert "tags refresh" in capsys.readouterr().err
    write_tags(raw, [{"success": True}, {"success": False, "failure_reason": "closed on nothing"}])
    assert main([*args, "--dst", str(tmp_path / "data" / "c2")]) == 0
    manifest = json.loads(Path(f"{tmp_path / 'data' / 'c2'}.clean_manifest.json").read_text())
    assert manifest["where"] == ["success=true"]
    assert manifest["removed"]["1"]["reason"] == "tag success=false (closed on nothing)"


def test_clean_needs_some_selection(setup, capsys):
    raw, _, config_path = setup
    assert main(["--config", str(config_path), "clean", str(raw)]) == 2
    assert "--where" in capsys.readouterr().err


def test_clean_refuses_keep_with_where(setup, capsys):
    raw, _, config_path = setup
    assert main(["--config", str(config_path), "clean", str(raw), "--keep", "0", "--where", "success=true"]) == 2
    assert "--keep and --where" in capsys.readouterr().err


def test_inspect_shows_tag_counts(setup, capsys):
    raw, _, config_path = setup
    write_tags(raw, [{"success": True}, {"success": False}], sources=[{"success": "default"}, {"success": "manual"}])
    assert main(["--config", str(config_path), "inspect", str(raw), "--no-quality"]) == 0
    out = capsys.readouterr().out
    assert "tags: snapshot 2026-10-23T09:30:00+08:00" in out
    assert "success: false 1 (manual 1), true 1 (default 1)" in out
    assert main(["--config", str(config_path), "inspect", str(raw), "--no-quality", "--json"]) == 0
    assert json.loads(capsys.readouterr().out)["tags"]["episodes"]["1"]["tags"]["success"] is False


def test_tags_refresh_of_a_cleaned_set_runs_as_a_job(setup, tmp_path, capsys):
    raw, _, config_path = setup
    write_tags(raw, [{"success": True}, {"success": False}])
    dst = tmp_path / "data" / "c3"
    assert main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(dst)]) == 0
    (dst / "episode_tags.json").unlink()
    assert main(["--config", str(config_path), "tags", "refresh", str(dst)]) == 0
    assert (dst / "episode_tags.json").is_file()


def test_tags_status_prints_the_change(setup, monkeypatch, capsys):
    raw, _, config_path = setup
    monkeypatch.setattr("realman_training.cli.tags_step.status", lambda config, path, runner: {
        "state": "changed", "raw": str(raw), "snapshot_at": "2026-10-23T09:30:00+08:00",
        "episodes_changed": 2, "keys": {"success": 2}})
    assert main(["--config", str(config_path), "tags", "status", str(raw)]) == 0
    assert "2 episode(s) changed" in capsys.readouterr().out
