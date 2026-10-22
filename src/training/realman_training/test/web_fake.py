"""The console's real web server on a fixture world, with fake steps, serve status and GPUs (Playwright e2e).

    python src/training/realman_training/test/web_fake.py --port 4180     # token: e2e-token
"""

from __future__ import annotations

import argparse
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path[:0] = [str(HERE.parent), str(HERE)]

from aiohttp import web  # noqa: E402
from console_fixture import MODEL, PLACE, build_world  # noqa: E402

from realman_training.config import load_config  # noqa: E402
from realman_training.jobs import STEPS, JobStore  # noqa: E402
from realman_training.web_server import STATIC_ROOT, Console  # noqa: E402

SERVE = {
    "serve": {"running": True, "status": "running", "image": "openpi:dev", "image_id": "sha256:4f1c2a",
              "started": "2026-10-16T17:02:00+08:00"},
    "gpu": {"index": 2, "used_mib": 8850, "total_mib": 32607},
    "bridge": {"running": True, "status": "running", "image": "realman_pi:local", "started": "2026-10-20T23:39:10+08:00",
               "server": "set", "prompt": PLACE, "paused": "0", "allow_publish": "0", "mode_active": "0"},
    "bt_mode": {"requested_mode": "none", "selected_mode": "none", "active_mode": "none"},
    "record": {"model": MODEL, "step": 29999, "gpu": 2, "port": 18000, "task": "pick_and_place", "prompt": PLACE,
               "started": "2026-10-16T17:02:00+08:00", "warmup_ms": [26012.4, 95.3]},
}
GPUS = {"available": True, "busy_mib": 2000, "gpus": [
    {"index": 0, "name": "NVIDIA GeForce RTX 5090", "used_mib": 15627, "total_mib": 32607, "util_pct": 97, "busy": True,
     "users": [{"pid": 4242, "who": "alice python", "container": None, "user": "alice", "command": "python", "used_mib": 15571}]},
    {"index": 1, "name": "NVIDIA GeForce RTX 5090", "used_mib": 3, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []},
    {"index": 2, "name": "NVIDIA GeForce RTX 5090", "used_mib": 8850, "total_mib": 32607, "util_pct": 4, "busy": True,
     "users": [{"pid": 5151, "who": "openpi-serve-openpi-1", "container": "openpi-serve-openpi-1", "user": "server5090",
                "command": "python3", "used_mib": 8820}]},
    {"index": 3, "name": "NVIDIA GeForce RTX 5090", "used_mib": 5, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []},
]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4180)
    parser.add_argument("--token", default="e2e-token")
    parser.add_argument("--static", default=str(STATIC_ROOT))
    args = parser.parse_args()
    root = Path(tempfile.mkdtemp(prefix="training-console-e2e-"))
    paths = build_world(root)
    config = load_config(paths["config"])
    store = JobStore(config.console_dir, env={"PYTHONPATH": str(HERE)})
    console = Console(config, token=args.token, store=store, targets={k: f"web_fake_steps:{k}" for k in STEPS},
                      serve_status=lambda: SERVE, gpu_query=lambda: GPUS, static_root=args.static)
    print(f"fake training console on http://{args.host}:{args.port} · world {root}", flush=True)
    web.run_app(console.app(), host=args.host, port=args.port, print=None, access_log=None)


if __name__ == "__main__":
    main()
