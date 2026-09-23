"""Vendored minimal OpenPI WebSocket policy client.

Copied from ``openpi/packages/openpi-client/src/openpi_client`` (openpi-client
0.1.0) and adapted for embedding in ``policy_bridge``:

- absolute ``from openpi_client import ...`` imports rewritten as relative;
- the ``typing_extensions.override`` dependency is dropped;
- ``WebsocketClientPolicy`` connects with a single bounded attempt (the embedding
  node owns retry/backoff) and supports a receive timeout.

Only the client side is vendored. The wire format (msgpack carrying raw NumPy
bytes via ``msgpack_numpy``) is left unchanged so it stays compatible with a
stock OpenPI ``WebsocketPolicyServer``. Requires ``msgpack`` and ``websockets``
(see ``config/python/policy-bridge-requirements.txt``).
"""

__version__ = "0.1.0"
