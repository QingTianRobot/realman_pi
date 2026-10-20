from __future__ import annotations

import json
import shlex

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import build_view

from realman_training.jobs import StepFailed
from realman_training.steps import eval as eval_step

PLACE, PICK = "put it in the bin", "pick it up"
INFO = {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1, 2, 3], "batch_size": 8, "num_train_steps": 10}


@pytest.fixture()
def env(tmp_path):
    view = build_view(
        tmp_path / "v", source="c", prompts={"pick_and_place": PLACE, "pick_only": PICK}, lengths=[10] * 4,
        tasks=["pick_and_place", "pick_and_place", "pick_only", "pick_only"],
    )
    docker_data = tmp_path / "dd"
    run = docker_data / "checkpoints/pi05_x/e1"
    for step in ("1000", "2000", "assets_not_a_step"):
        (run / step).mkdir(parents=True)
    config = tmp_path / "c.yaml"
    config.write_text(f"training_console:\n  openpi:\n    repo: {tmp_path / 'o'}\n    docker_data: {docker_data}\n")
    return {"view": view, "run": run, "config": str(config)}


def fake_eval(env):
    def write_eval(argv, input):
        inner = argv[-1]
        out = shlex.split(inner.split("eval_open_loop.py", 1)[1])
        path = out[out.index("--output") + 1].replace("/workspace/checkpoints/pi05_x/e1", str(env["run"]))
        mae = 0.1 if "1000" in path else 0.09
        open(path, "w").write(json.dumps({"mae": mae, "baseline_zeros": {"mae": 0.19}}))

    def write_swap(argv, input):
        args = shlex.split(argv[-1].split("python - ", 1)[1])
        path = args[2].replace("/workspace/checkpoints/pi05_x/e1", str(env["run"]))
        tasks = json.loads(args[3])
        open(path, "w").write(
            json.dumps({t: {o: {"prompt": tasks[o]["prompt"], "mae": 0.09 if t == o else 0.12} for o in tasks} for t in tasks})
        )

    return (
        FakeRunner()
        .on("container inspect", returncode=1)
        .on("eval_open_loop.py", action=write_eval)
        .on("python - pi05_x checkpoints", action=write_swap)
        .on("python -", stdout=json.dumps(INFO))
        .on("nvidia-smi", stdout="2, 4\n")
    )


def test_holdout_by_task_splits_the_configs_holdout(env):
    assert eval_step.holdout_by_task(env["view"], (1, 2, 3)) == {
        "pick_and_place": {"prompt": PLACE, "episodes": [1]},
        "pick_only": {"prompt": PICK, "episodes": [2, 3]},
    }


def test_eval_runs_each_task_then_the_prompt_swap_and_merges_a_summary(env):
    runner = fake_eval(env)
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    result = eval_step.run(params, RecordingLog(), runner=runner)
    assert result["results"]["2000"]["pick_only"] == {"mae": 0.09, "zero_baseline": 0.19, "episodes": [2, 3]}
    assert result["results"]["2000"]["prompt_swap"]["pick_only"] == {"pick_and_place": 0.12, "pick_only": 0.09}
    evals = runner.commands("eval_open_loop.py")
    assert len(evals) == 2  # latest checkpoint only, one per task
    inner = shlex.split(evals[1][-1].split("eval_open_loop.py", 1)[1])
    assert inner[inner.index("--episodes") + 1 : inner.index("--episodes") + 3] == ["2", "3"]
    assert inner[inner.index("--checkpoint-dir") + 1] == "checkpoints/pi05_x/e1/2000"
    assert runner.inputs[runner.calls.index(runner.commands("python - pi05_x checkpoints")[0])] == eval_step.script("prompt_swap")
    assert runner.envs[-1]["CONSOLE_GPUS"] == "2"
    eval_step.run({**params, "checkpoints": [1000], "prompt_swap": False}, RecordingLog(), runner=fake_eval(env))
    summary = json.loads((env["run"] / "eval/summary.json").read_text())
    assert sorted(summary) == ["1000", "2000"] and summary["1000"]["pick_and_place"]["mae"] == 0.1


def test_eval_refuses_a_busy_gpu_a_missing_checkpoint_and_several_gpus(env):
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    busy = FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="2, 20000\n")
    with pytest.raises(StepFailed, match="gpu2=20000"):
        eval_step.run(params, RecordingLog(), runner=busy)
    with pytest.raises(StepFailed, match="checkpoint 5000"):
        eval_step.run({**params, "checkpoints": [5000]}, RecordingLog(), runner=fake_eval(env))
    with pytest.raises(StepFailed, match="one GPU"):
        eval_step.run({**params, "gpu": "1,2"}, RecordingLog(), runner=fake_eval(env))


def test_eval_refuses_bad_names(env):
    runner = fake_eval(env)
    params = {"config_name": "../../evil", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    with pytest.raises(StepFailed, match="config_name"):
        eval_step.run(params, RecordingLog(), runner=runner)
    assert not runner.calls  # no runner calls before the check


def test_eval_dry_run_lists_the_commands_only(env):
    runner = fake_eval(env)
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"], "dry_run": True}
    result = eval_step.run(params, RecordingLog(), runner=runner)
    assert result["dry_run"] is True and len(result["commands"]) == 3
    assert not (env["run"] / "eval" / "summary.json").exists()


def test_eval_uses_predictable_container_names_with_rm(env):
    """Containers for eval/swap use <project>-eval-<exp>-<step>[-swap] and --rm, not -d."""
    runner = fake_eval(env)
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    eval_step.run(params, RecordingLog(), runner=runner)
    eval_cmds = runner.commands("eval_open_loop.py")
    assert any("openpi-console-eval-e1-2000" in " ".join(c) for c in eval_cmds)
    swap_cmds = runner.commands("python - pi05_x checkpoints")
    assert any("openpi-console-eval-e1-2000-swap" in " ".join(c) for c in swap_cmds)
    for c in eval_cmds + swap_cmds:
        assert "--rm" in c and "-d" not in c


def test_eval_refuses_when_container_already_exists(env):
    runner = (
        FakeRunner()
        .on("container inspect", returncode=0)  # container exists
        .on("eval_open_loop.py")
        .on("python -", stdout=json.dumps(INFO))
        .on("nvidia-smi", stdout="2, 4\n")
    )
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    with pytest.raises(eval_step.StepFailed, match="already exists"):
        eval_step.run(params, RecordingLog(), runner=runner)


def test_eval_cancel_stops_the_container(env):
    from realman_training.jobs import JobCancelled as _JobCancelled

    def raise_cancel(argv, input):
        raise _JobCancelled()

    runner = (
        FakeRunner()
        .on("container inspect", returncode=1)
        .on("eval_open_loop.py", action=raise_cancel)
        .on("python -", stdout=json.dumps(INFO))
        .on("nvidia-smi", stdout="2, 4\n")
    )
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    with pytest.raises(_JobCancelled):
        eval_step.run(params, RecordingLog(), runner=runner)
    stops = runner.commands("docker stop")
    assert stops and "openpi-console-eval-e1" in " ".join(stops[0])
