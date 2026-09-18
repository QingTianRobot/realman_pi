"""Unit tests for policy_bridge.inference.ws_client."""

from __future__ import annotations

import base64
import json

import numpy as np

from policy_bridge.config_loader import NetworkConfig, ReconnectBackoff
from policy_bridge.inference.ws_client import (
    PolicyServiceError,
    WsClient,
    serialize_observation,
)


def _net_cfg() -> NetworkConfig:
    return NetworkConfig(
        server_host="127.0.0.1",
        server_port=8765,
        connect_timeout_s=2.0,
        infer_timeout_s=1.0,
        reconnect_backoff=ReconnectBackoff(initial_s=0.5, max_s=4.0, factor=2.0),
        inference_threads=1,
    )


class FakeTransport:
    def __init__(self, response=None, error=None) -> None:
        self._response = response
        self._error = error
        self.sent = []

    def request(self, payload):
        self.sent.append(payload)
        if self._error is not None:
            raise self._error
        return self._response


# --- serialization contract ----------------------------------------------


def test_serialize_state_and_prompt():
    payload = json.loads(serialize_observation({"state": np.arange(7), "prompt": "grab"}))
    assert payload["prompt"] == "grab"
    assert payload["state"] == [float(v) for v in range(7)]


def test_serialize_image_roundtrip():
    image = np.zeros((2, 3, 1), dtype=np.uint8)
    image[1, 2, 0] = 7
    payload = json.loads(serialize_observation({"wrist_image": image}))
    blob = payload["wrist_image"]
    assert blob["shape"] == [2, 3, 1]
    assert blob["dtype"] == "uint8"
    decoded = np.frombuffer(base64.b64decode(blob["b64"]), dtype=np.uint8).reshape(2, 3, 1)
    assert decoded[1, 2, 0] == 7


# --- infer ----------------------------------------------------------------


def test_infer_returns_decoded_response():
    transport = FakeTransport(response=json.dumps({"actions": [[0.0] * 7]}))
    client = WsClient(_net_cfg(), transport=transport)
    result = client.infer({"state": np.zeros(7), "prompt": "p"})
    assert result == {"actions": [[0.0] * 7]}
    assert len(transport.sent) == 1


def test_infer_accepts_bytes_response():
    transport = FakeTransport(response=json.dumps({"ok": True}).encode("utf-8"))
    client = WsClient(_net_cfg(), transport=transport)
    assert client.infer({}) == {"ok": True}


def test_infer_without_transport_raises():
    client = WsClient(_net_cfg(), transport=None)
    try:
        client.infer({})
    except PolicyServiceError:
        pass
    else:  # pragma: no cover - guard
        raise AssertionError("expected PolicyServiceError")


def test_transport_error_wrapped_as_policy_service_error():
    transport = FakeTransport(error=RuntimeError("socket closed"))
    client = WsClient(_net_cfg(), transport=transport)
    try:
        client.infer({})
    except PolicyServiceError as error:
        assert "socket closed" in str(error)
    else:  # pragma: no cover - guard
        raise AssertionError("expected PolicyServiceError")


def test_invalid_json_raises():
    transport = FakeTransport(response="not-json")
    client = WsClient(_net_cfg(), transport=transport)
    try:
        client.infer({})
    except PolicyServiceError:
        pass
    else:  # pragma: no cover - guard
        raise AssertionError("expected PolicyServiceError")


# --- backoff --------------------------------------------------------------


def test_backoff_grows_and_caps():
    client = WsClient(_net_cfg(), transport=None)
    assert client._next_backoff() == 0.5
    assert client._next_backoff() == 1.0
    assert client._next_backoff() == 2.0
    assert client._next_backoff() == 4.0
    assert client._next_backoff() == 4.0  # capped at max_s


def test_successful_infer_resets_backoff():
    transport = FakeTransport(response=json.dumps({"ok": True}))
    client = WsClient(_net_cfg(), transport=transport)
    client._next_backoff()  # advance to 1.0 next
    client.infer({})
    assert client._next_backoff() == 0.5  # reset to initial
