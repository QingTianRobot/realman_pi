"""WebSocket client for the VLA policy service.

The client is a thin wrapper around a dict-level transport that implements
``infer(obs: dict) -> dict``. In production the transport is the vendored OpenPI
``WebsocketClientPolicy`` (msgpack carrying raw NumPy bytes over a WebSocket); it
is created lazily on first use and rebuilt after any failure, with exponential
backoff owned by this class. A transport can be injected so the scheduler can be
tested without a network.

The observation is passed through as a plain dict -- a float32 ``state`` array,
one uint8 ``[H, W, C]`` array per configured image, and a string ``prompt`` --
and serialization is entirely the transport's job (see
``openpi_client.msgpack_numpy``). The response dict must carry an ``actions``
entry consumable by ``inference.validators``.
"""

from __future__ import annotations

import threading
import time

from ..config_loader import NetworkConfig


class PolicyServiceError(RuntimeError):
    """Raised on connect/transport failures so the scheduler can count them."""


class WsClient:
    def __init__(
        self,
        network_cfg: NetworkConfig,
        transport=None,
        *,
        autoconnect: bool = True,
    ) -> None:
        self._cfg = network_cfg
        self._transport = transport  # injectable: object with infer(obs: dict) -> dict
        self._autoconnect = autoconnect and transport is None
        self._lock = threading.Lock()
        self._backoff = network_cfg.reconnect_backoff.initial_s
        self._last_attempt = 0.0

    @property
    def is_connected(self) -> bool:
        with self._lock:
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

    def _connect(self):
        """Build the real OpenPI transport (single bounded attempt)."""
        from .openpi_client.websocket_client_policy import WebsocketClientPolicy

        try:
            return WebsocketClientPolicy(
                host=self._cfg.server_host,
                port=self._cfg.server_port,
                timeout=self._cfg.infer_timeout_s,
                open_timeout=self._cfg.connect_timeout_s,
            )
        except Exception as error:  # noqa: BLE001 - surfaced as a counted failure
            raise PolicyServiceError(f"policy service connect failed: {error}") from error

    def _ensure_transport(self):
        with self._lock:
            transport = self._transport
        if transport is not None:
            return transport
        if not self._autoconnect:
            raise PolicyServiceError("websocket transport not connected")
        transport = self._connect()
        with self._lock:
            self._transport = transport
        return transport

    def _drop_transport(self) -> None:
        with self._lock:
            transport = self._transport
            self._transport = None
        close = getattr(transport, "close", None)
        if callable(close):
            close()

    def infer(self, obs: dict) -> dict:
        """Send one observation and return the decoded response dict."""
        transport = self._ensure_transport()
        try:
            response = transport.infer(obs)
        except Exception as error:  # noqa: BLE001 - surfaced as a counted failure
            self._drop_transport()
            raise PolicyServiceError(f"inference request failed: {error}") from error
        self.reset_backoff()
        if not isinstance(response, dict):
            raise PolicyServiceError(
                f"policy service returned non-dict response: {type(response).__name__}"
            )
        return response

    def wait_backoff(self) -> None:
        """Sleep for the next backoff interval (used by the reconnect loop)."""
        delay = self._next_backoff()
        self._last_attempt = time.monotonic()
        time.sleep(delay)

    def close(self) -> None:
        """Drop any live transport (called on node shutdown)."""
        self._drop_transport()
