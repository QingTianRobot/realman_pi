from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from lerobot_fixture import build_view, write_clean_manifest

from realman_training.jobs import StepFailed
from realman_training.steps import register

PLACE, PICK = "put it in the bin", "pick it up"
EXISTING = """# 模型登记表（server5090 openpi checkpoints）

| run | config | 训练时间 (CST) | 数据集 / 任务 | 状态 |
|---|---|---|---|---|
| `pi05_old/a` | pi05_old | 2026-10-14 01:09–06:12 | old | ✅ |

注：手写的说明。
"""


@pytest.fixture()
def env(tmp_path):
    clean = tmp_path / "data" / "x_clean"
    clean.mkdir(parents=True)
    write_clean_manifest(clean, source="/data/raw", removed={3: "starts closed"})
    view = build_view(
        tmp_path / "data" / "x_clean_view", source=str(clean), prompts={"pick_and_place": PLACE, "pick_only": PICK},
        lengths=[10, 10, 10], tasks=["pick_and_place", "pick_and_place", "pick_only"],
    )
    dd = tmp_path / "dd"
    run = dd / "checkpoints/pi05_x/e1"
    (run / "1000").mkdir(parents=True)
    (run / "2000").mkdir()
    (run / "eval").mkdir()
    (run / "console_train.json").write_text(json.dumps({
        "config": "pi05_x", "exp": "e1", "view": str(view), "gpus": [1, 2], "batch_size": 16, "num_train_steps": 2000,
        "holdout": [1, 2], "weights": "/w", "openpi_commit": "abc", "started": "2026-10-21T09:54:38+08:00",
        "ended": "2026-10-21T16:09:40+08:00", "exit_code": 0,
    }))
    (run / "eval/summary.json").write_text(json.dumps({"2000": {
        "pick_and_place": {"mae": 0.0962, "zero_baseline": 0.1941, "episodes": [1]},
        "pick_only": {"mae": 0.092, "zero_baseline": 0.1895, "episodes": [2]},
        "prompt_swap": {"pick_and_place": {"pick_and_place": 0.0962, "pick_only": 0.1121},
                        "pick_only": {"pick_and_place": 0.1164, "pick_only": 0.0923}},
    }}))
    (dd / "checkpoints/MODELS.md").write_text(EXISTING)
    config = tmp_path / "c.yaml"
    config.write_text(f"training_console:\n  openpi:\n    docker_data: {dd}\n")
    return {"run": run, "dd": dd, "config": str(config), "view": view}


def params(env, **extra):
    return {"config_name": "pi05_x", "exp": "e1", "config": env["config"], **extra}


def test_register_writes_the_card_json_markdown_and_a_registry_row(env):
    result = register.run(params(env), RecordingLog())
    card = json.loads((env["run"] / "model_card.json").read_text())
    assert card["exp_name"] == "e1" and card["config"] == "pi05_x" and card["batch_size"] == 16
    assert card["tasks"] == {
        "pick_and_place": {"prompt": PLACE, "episodes": [0, 1], "count": 2},
        "pick_only": {"prompt": PICK, "episodes": [2, 2], "count": 1},
    }
    assert card["holdout_episodes"] == [1, 2] and card["checkpoints"] == [1000, 2000]
    assert card["open_loop_eval"] == {"2000": {"pick_and_place": 0.0962, "pick_only": 0.092},
                                      "zero_baseline": {"pick_and_place": 0.1941, "pick_only": 0.1895}}
    assert card["prompt_swap_2000"] == {"pick_and_place_correct": 0.0962, "pick_and_place_swapped": 0.1121,
                                        "pick_only_correct": 0.0923, "pick_only_swapped": 0.1164}
    assert card["dataset_source"].startswith("/data/raw") and "removed 1" in card["dataset_source"]
    markdown = (env["run"] / "MODEL_CARD.md").read_text()
    assert markdown.startswith("# e1") and register.MARKER in markdown and PLACE in markdown and "0.0962" in markdown
    registry = (env["dd"] / "checkpoints/MODELS.md").read_text()
    assert "| `pi05_old/a` |" in registry and "注：手写的说明。" in registry  # other rows and notes kept
    row = [line for line in registry.splitlines() if line.startswith("| `pi05_x/e1` |")]
    assert len(row) == 1 and "2026-10-21 09:54–16:09" in row[0] and "已训练" in row[0]
    assert registry.index("`pi05_old/a`") < registry.index("`pi05_x/e1`") < registry.index("注：")
    assert result["registry"].endswith("MODELS.md")


def test_registering_again_replaces_the_row_and_keeps_one(env):
    register.run(params(env), RecordingLog())
    register.run(params(env, status="已部署"), RecordingLog())
    registry = (env["dd"] / "checkpoints/MODELS.md").read_text()
    rows = [line for line in registry.splitlines() if line.startswith("| `pi05_x/e1` |")]
    assert len(rows) == 1 and rows[0].rstrip().endswith("已部署 |")


def test_a_hand_written_card_is_not_overwritten_without_force(env):
    (env["run"] / "MODEL_CARD.md").write_text("# hand written\n")
    with pytest.raises(StepFailed, match="hand-written"):
        register.run(params(env), RecordingLog())
    register.run(params(env, force=True), RecordingLog())
    backups = list(env["run"].glob("MODEL_CARD.md.bak-*"))
    assert len(backups) == 1 and backups[0].read_text() == "# hand written\n"


def test_a_run_without_a_train_record_is_refused(env):
    (env["run"] / "console_train.json").unlink()
    with pytest.raises(StepFailed, match="console_train.json"):
        register.run(params(env), RecordingLog())


def test_a_missing_registry_is_created(env):
    (env["dd"] / "checkpoints/MODELS.md").unlink()
    register.run(params(env), RecordingLog())
    text = (env["dd"] / "checkpoints/MODELS.md").read_text()
    assert text.startswith("# 模型登记表") and "| `pi05_x/e1` |" in text


def test_bad_config_name_is_refused(env):
    with pytest.raises(StepFailed, match="config_name"):
        register.run({**params(env), "config_name": "bad name!"}, RecordingLog())
