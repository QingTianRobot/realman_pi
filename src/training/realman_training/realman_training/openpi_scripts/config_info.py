"""Run inside the openpi container: print one JSON line describing a training config.

usage: uv run --no-sync python - CONFIG_NAME < config_info.py
"""

import json
import sys

from openpi.training import config as _config

cfg = _config.get_config(sys.argv[1])
data = cfg.data
assets = getattr(data, "assets", None)
print(
    json.dumps(
        {
            "repo_id": data.repo_id,
            "asset_id": getattr(assets, "asset_id", None) or data.repo_id,
            "exclude_episode_indices": list(getattr(data, "exclude_episode_indices", ()) or ()),
            "batch_size": cfg.batch_size,
            "num_train_steps": cfg.num_train_steps,
        }
    )
)
