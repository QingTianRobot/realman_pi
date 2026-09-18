"""Unit tests for policy_bridge.inference.ws_client.

The client speaks the OpenPI wire protocol: a dict-level transport
(``infer(obs: dict) -> dict``) with msgpack + raw NumPy bytes on the socket. The
tests cover the injected-transport contract, the vendored msgpack serialization,
a real localhost WebSocket round-trip, and the reconnect backoff.
"""

from __future__ import annotations

import socket
import threading

import numpy as np
import pytest
import websockets.sync.server as ws_server

from policy_bridge.config_loader import NetworkConfig, ReconnectBackoff
from policy_bridge.inference.openpi_client import msgpack_numpy
from policy_bridge.inference.ws_client import PolicyServiceError, WsClient


def _net_cfg(port: int = 18000) -> NetworkConfig:
    return NetworkConfig(
        server_host="127.0.0.1",
        server_port=port,
        connect_timeout_s=2.0,
        infer_timeout_s=1.0,
        reconnect_backoff=ReconnectBackoff(initial_s=0.5, max_s=4.0, factor=2.0),
        inference_threads=1,
    )


class FakeTransport:
    """Dict-level transport double mirroring WebsocketClientPolicy.infer."""

    def __init__(self, response=None, error=None) -> None:
        self._response = response
        self._error = error
        self.calls = 0
        self.last_obs = None
        self.closed = 0

    def infer(self, obs):
        self.calls += 1
        self.last_obs = obs
        if self._error is not None:
            raise self._error
        return self._response

    def close(self):
        self.closed += 1


# --- dict-level transport contract ---------------------------------------


def test_infer_delegates_and_returns_dict():
    transport = FakeTransport(response={"actions": np.zeros((16, 7), dtype=np.float32)})
    client = WsClient(_net_cfg(), transport=transport)
    obs = {"state": np.zeros(7, dtype=np.float32), "prompt": "grab"}
    result = client.infer(obs)
    assert set(result) == {"actions"}
    assert transport.calls == 1
    assert transport.last_obs is obs  # obs passed through untouched (no JSON)


def test_transport_error_wrapped_and_transport_dropped():
    transport = FakeTransport(error=RuntimeError("socket closed"))
    client = WsClient(_net_cfg(), transport=transport)
    assert client.is_connected is True
    with pytest.raises(PolicyServiceError) as info:
        client.infer({})
    assert "socket closed" in str(info.value)
    # the failed transport is dropped (and closed) so the next call reconnects
    assert client.is_connected is False
    assert transport.closed == 1


def test_non_dict_response_raises():
    client = WsClient(_net_cfg(), transport=FakeTransport(response=["not", "a", "dict"]))
    with pytest.raises(PolicyServiceError):
        client.infer({})


def test_autoconnect_disabled_without_transport_raises():
    client = WsClient(_net_cfg(), transport=None, autoconnect=False)
    with pytest.raises(PolicyServiceError):
        client.infer({})


def test_lazy_connect_to_absent_server_raises():
    # Port 1 is not an OpenPI server: the bounded connect attempt must surface as
    # a counted PolicyServiceError rather than blocking (no infinite retry).
    client = WsClient(_net_cfg(port=1), transport=None)
    with pytest.raises(PolicyServiceError):
        client.infer({"state": np.zeros(7, dtype=np.float32), "prompt": "p"})


# --- vendored msgpack serialization ---------------------------------------


def test_msgpack_observation_roundtrip():
    obs = {
        "state": np.arange(7, dtype=np.float32),
        "wrist_image": np.zeros((4, 5, 3), dtype=np.uint8),
        "global_image": np.ones((2, 3, 3), dtype=np.uint8) * 255,
        "prompt": "pick the red block",
    }
    back = msgpack_numpy.unpackb(msgpack_numpy.packb(obs))
    assert back["prompt"] == "pick the red block"
    assert back["state"].dtype == np.float32 and back["state"].shape == (7,)
    assert np.array_equal(back["state"], obs["state"])
    assert back["wrist_image"].dtype == np.uint8 and back["wrist_image"].shape == (4, 5, 3)
    assert np.array_equal(back["global_image"], obs["global_image"])


def test_msgpack_actions_roundtrip():
    actions = (np.arange(16 * 7, dtype=np.float32).reshape(16, 7) / 100.0)
    back = msgpack_numpy.unpackb(msgpack_numpy.packb({"actions": actions}))
    assert back["actions"].shape == (16, 7)
    assert np.allclose(back["actions"], actions)


# --- real localhost WebSocket round-trip ----------------------------------


def test_ws_client_real_socket_roundtrip():
    actions = np.arange(16 * 7, dtype=np.float32).reshape(16, 7) / 100.0

    def handler(conn):
        conn.send(msgpack_numpy.packb({"type": "openpi"}))  # metadata on connect
        obs = msgpack_numpy.unpackb(conn.recv())
        assert obs["state"].shape == (7,)
        conn.send(msgpack_numpy.packb({"actions": actions}))

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.listen()
    sock.setblocking(False)
    server = ws_server.serve(handler, sock=sock)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        client = WsClient(_net_cfg(port=port))  # autoconnect, lazy
        obs = {
            "state": np.zeros(7, dtype=np.float32),
            "wrist_image": np.zeros((4, 4, 3), dtype=np.uint8),
            "prompt": "p",
        }
        result = client.infer(obs)
        assert result["actions"].shape == (16, 7)
        assert np.allclose(result["actions"], actions)
        assert client.is_connected is True
        client.close()
        assert client.is_connected is False
    finally:
        server.shutdown()
        thread.join(timeout=3)
        sock.close()


# --- backoff --------------------------------------------------------------


def test_backoff_grows_and_caps():
    client = WsClient(_net_cfg(), transport=None, autoconnect=False)
    assert client._next_backoff() == 0.5
    assert client._next_backoff() == 1.0
    assert client._next_backoff() == 2.0
    assert client._next_backoff() == 4.0
    assert client._next_backoff() == 4.0  # capped at max_s


def test_successful_infer_resets_backoff():
    client = WsClient(_net_cfg(), transport=FakeTransport(response={"ok": True}))
    client._next_backoff()  # advance to 1.0 next
    client.infer({})
    assert client._next_backoff() == 0.5  # reset to initial
