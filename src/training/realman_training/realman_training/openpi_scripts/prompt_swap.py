"""Run inside the openpi container: open-loop MAE of each task's held-out episodes with every task's prompt.

usage: uv run --no-sync python - CONFIG CHECKPOINT_DIR OUTPUT_JSON TASKS_JSON [STRIDE] < prompt_swap.py
TASKS_JSON = {"task": {"prompt": "...", "episodes": [9, 19]}, ...}
"""

import importlib.util
import json
import sys

from openpi.policies import policy_config as _policy_config
from openpi.training import config as _config
from openpi.training import lerobot_v3_dataset as _v3

_spec = importlib.util.spec_from_file_location("eval_open_loop", "/workspace/scripts/eval_open_loop.py")
eol = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(eol)

name, checkpoint, output, tasks_json = sys.argv[1:5]
stride = int(sys.argv[5]) if len(sys.argv) > 5 else 10
tasks = json.loads(tasks_json)
cfg = _config.get_config(name)
data_config = cfg.data.create(cfg.assets_dirs, cfg.model)
policy = _policy_config.create_trained_policy(cfg, checkpoint)
result = {}
for task, held_out in tasks.items():
    for prompt_task, prompt_spec in tasks.items():
        dataset = _v3.LocalLeRobotV3Dataset(
            data_config.dataset_root,
            action_horizon=cfg.model.action_horizon,
            video_keys=data_config.video_keys,
            episode_indices=held_out["episodes"],
            action_padding=data_config.action_padding,
            action_padding_hold_dims=data_config.action_padding_hold_dims,
            prompt_override=prompt_spec["prompt"],
        )
        r = eol.evaluate(policy, dataset, eol.make_repack(data_config), stride=stride)
        result.setdefault(task, {})[prompt_task] = {
            "prompt": prompt_spec["prompt"], "mae": r["mae"], "mae_per_dim": r["mae_per_dim"]
        }
        print(f"{task} with the {prompt_task} prompt: MAE {r['mae']:.4f}", flush=True)
with open(output, "w") as handle:
    json.dump(result, handle, indent=2)
