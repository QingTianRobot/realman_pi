"""WebSocket client for the VLA policy service.

The client is intentionally thin: it serializes an observation, sends one
request, and returns the decoded response within ``infer_timeout_s``. Reconnect
uses exponential backoff. The transport is created lazily and can be injected so
the scheduler can be tested without a network.

Observation serialization contract (field names fixed):
``{"state": [7 floats], "prompt": str, "<image_name>": {"shape": [H,W,C],
"dtype": "uint8", "b64": <base64 of raw C-order bytes>}}``.
"""

from __future__ import annotations

import base64
import json
import threading
import time

import numpy as np

from ..config_loader import NetworkConfig


def serialize_observation(obs: dict) -> str:
    """Convert an observation dict to the JSON wire payload."""
    payload: dict = {"prompt": obs.get("prompt", "")}
    state = obs.get("state")
    if state is not None:
        payload["state"] = [float(v) for v in np.asarray(state).reshape(-1)]
    for key, value in obs.items():
        if key in ("state", "prompt"):
            continue
        array = np.asarray(value)
        payload[key] = {
            "shape": list(array.shape),
            "dtype": str(array.dtype),
            "b64": base64.b64encode(np.ascontiguousarray(array).tobytes()).decode("ascii"),
        }
    return json.dumps(payload)


class PolicyServiceError(RuntimeError):
    """Raised on connect/transport failures so the scheduler can count them."""


class WsClient:
    def __init__(self, network_cfg: NetworkConfig, transport=None) -> None:
        self._cfg = network_cfg
        self._transport = transport  # injectable: object with request(payload:str)->str
        self._lock = threading.Lock()
        self._backoff = network_cfg.reconnect_backoff.initial_s
        self._last_attempt = 0.0

    @property
    def is_connected(self) -> bool:
        return self._transport is not None

    def _next_backoff(self) -> float:
        value = self._backoff
        self._backoff = min(
            self._cfg.reconnect_backoff.max_s,
            self._backoff * self._cfg.reconnect_backoff.factor,
        )
        return value

    def reset_backoff(self) -> None:
        self._backoff = self._cfg.reconnect_backoff.initial_s

    def infer(self, obs: dict) -> dict:
        """Send one observation and return the decoded response dict."""
        with self._lock:
            transport = self._transport
        if transport is None:
            raise PolicyServiceError("websocket transport not connected")
        payload = serialize_observation(obs)
        try:
            raw = transport.request(payload)
        except Exception as error:  # noqa: BLE001 - surfaced as a counted failure
            raise PolicyServiceError(f"inference request failed: {error}") from error
        self.reset_backoff()
        if isinstance(raw, (bytes, bytearray)):
            raw = raw.decode("utf-8")
        try:
            return json.loads(raw)
        except (TypeError, ValueError) as error:
            raise PolicyServiceError(f"invalid JSON response: {error}") from error

    def wait_backoff(self) -> None:
        """Sleep for the next backoff interval (used by the reconnect loop)."""
        delay = self._next_backoff()
        self._last_attempt = time.monotonic()
        time.sleep(delay)
