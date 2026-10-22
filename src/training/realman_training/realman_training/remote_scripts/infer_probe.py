"""infer_probe: time real-size inferences against an openpi policy server; print one JSON line.

usage: python3 - HOST PORT ROUNDS PROMPT < infer_probe.py
Runs in the openpi-serve container (openpi_client) or in the policy_bridge container (its vendored copy). The request
has the bridge's own keys and sizes: two 224x224 RGB images, a 7-dim state, the prompt.
"""

import json
import sys
import time

import numpy as np

try:
    from openpi_client.websocket_client_policy import WebsocketClientPolicy
except ImportError:
    from policy_bridge.inference.openpi_client.websocket_client_policy import WebsocketClientPolicy

host, port, rounds, prompt = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
rng = np.random.default_rng(0)
start = time.monotonic()
client = WebsocketClientPolicy(host, port)
connect_ms = round((time.monotonic() - start) * 1000, 1)
times = []
action = {}
for _ in range(rounds):
    obs = {
        "wrist_image": rng.integers(0, 256, (224, 224, 3), dtype=np.uint8),
        "global_image": rng.integers(0, 256, (224, 224, 3), dtype=np.uint8),
        "state": np.zeros(7, dtype=np.float32),
        "prompt": prompt,
    }
    began = time.monotonic()
    action = client.infer(obs)
    times.append(round((time.monotonic() - began) * 1000, 1))
shape = list(np.asarray(action.get("actions", [])).shape)
print(json.dumps({"ms": times, "connect_ms": connect_ms, "actions_shape": shape}))
