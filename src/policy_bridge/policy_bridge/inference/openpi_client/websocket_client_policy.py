"""WebSocket client for a stock OpenPI ``WebsocketPolicyServer``.

Vendored and adapted from ``openpi_client.websocket_client_policy`` (see the
package ``__init__`` docstring for the full list of changes). The two behavioural
adaptations that matter here:

- ``__init__`` performs a **single bounded connect attempt** and lets connection
  errors propagate, instead of upstream's ``while True: sleep(5)`` retry loop.
  The embedding ``WsClient`` owns retry/backoff so a down service surfaces as a
  countable failure rather than blocking the node forever.
- ``infer`` accepts a ``timeout`` (seconds) applied to the blocking ``recv`` so a
  hung server cannot wedge the inference thread pool.

The wire format is unchanged: msgpack carrying raw NumPy bytes.
"""

import logging
from typing import Dict, Optional, Tuple

import websockets.sync.client

from . import base_policy as _base_policy
from . import msgpack_numpy


class WebsocketClientPolicy(_base_policy.BasePolicy):
    """Implements the Policy interface by communicating with a server over websocket."""

    def __init__(
        self,
        host: str = "0.0.0.0",
        port: Optional[int] = None,
        api_key: Optional[str] = None,
        timeout: Optional[float] = None,
        open_timeout: Optional[float] = None,
    ) -> None:
        if host.startswith("ws"):
            self._uri = host
        else:
            self._uri = f"ws://{host}"
        if port is not None:
            self._uri += f":{port}"
        self._packer = msgpack_numpy.Packer()
        self._api_key = api_key
        self._timeout = timeout
        self._open_timeout = open_timeout
        self._ws, self._server_metadata = self._connect()

    def get_server_metadata(self) -> Dict:
        return self._server_metadata

    def _connect(self) -> Tuple[websockets.sync.client.ClientConnection, Dict]:
        logging.info(f"Connecting to policy server at {self._uri}...")
        headers = {"Authorization": f"Api-Key {self._api_key}"} if self._api_key else None
        connect_kwargs = {"compression": None, "max_size": None, "additional_headers": headers}
        if self._open_timeout is not None:
            connect_kwargs["open_timeout"] = self._open_timeout
        conn = websockets.sync.client.connect(self._uri, **connect_kwargs)
        metadata = msgpack_numpy.unpackb(conn.recv(timeout=self._timeout))
        return conn, metadata

    def infer(self, obs: Dict, timeout: Optional[float] = None) -> Dict:  # noqa: UP006
        data = self._packer.pack(obs)
        self._ws.send(data)
        response = self._ws.recv(timeout=self._timeout if timeout is None else timeout)
        if isinstance(response, str):
            # we're expecting bytes; if the server sends a string, it's an error.
            raise RuntimeError(f"Error in inference server:\n{response}")
        return msgpack_numpy.unpackb(response)

    def reset(self) -> None:
        pass

    def close(self) -> None:
        """Best-effort socket close so the client can be dropped and rebuilt."""
        try:
            self._ws.close()
        except Exception:  # noqa: BLE001 - closing a broken socket is best effort
            pass
