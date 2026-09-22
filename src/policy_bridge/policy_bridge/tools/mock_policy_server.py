"""Mock OpenPI policy server for link validation (no model, no robot).

Speaks the same wire protocol as a stock OpenPI ``WebsocketPolicyServer``
(msgpack + raw NumPy bytes via the vendored ``openpi_client.msgpack_numpy``) so
``policy_bridge`` can be exercised end to end before a real policy service is
available. On each request it logs the received observation keys/shapes and
returns a fixed-shape action chunk.

Run it, then point the node at it (``server_port`` in
``config/ros/policy_bridge.yaml`` or ``POLICY_WS_HOST``):

    ros2 run policy_bridge mock_policy_server --port 18000
    # or, from a sourced checkout without installing:
    python3 -m policy_bridge.tools.mock_policy_server --port 18000

The default chunk shape is ``(16, 7)`` to match ``action.action_horizon`` /
``action_dim``; override with ``--horizon`` / ``--dim`` to probe the validator's
shape rejection. ``--mode random`` returns uniform values in ``[-1, 1]`` so the
published TwistStamped visibly changes; ``--mode zeros`` returns all zeros.
"""

from __future__ import annotations

import argparse
import logging

import numpy as np
import websockets.exceptions
import websockets.sync.server as ws_server

from ..inference.openpi_client import msgpack_numpy


def _make_handler(horizon: int, dim: int, mode: str):
    def handler(conn) -> None:
        conn.send(
            msgpack_numpy.packb(
                {"type": "mock-openpi", "action_horizon": horizon, "action_dim": dim}
            )
        )
        logging.info("client connected; sent metadata (horizon=%d dim=%d)", horizon, dim)
        try:
            while True:
                obs = msgpack_numpy.unpackb(conn.recv())
                summary = {
                    key: (getattr(value, "shape", None) or type(value).__name__)
                    for key, value in obs.items()
                }
                logging.info("obs recv: %s prompt=%r", summary, obs.get("prompt"))
                if mode == "random":
                    actions = np.random.uniform(-1.0, 1.0, (horizon, dim)).astype(np.float32)
                else:
                    actions = np.zeros((horizon, dim), dtype=np.float32)
                conn.send(msgpack_numpy.packb({"actions": actions}))
        except websockets.exceptions.ConnectionClosed:
            logging.info("client disconnected")

    return handler


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Mock OpenPI policy WebSocket server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=18000)
    parser.add_argument("--horizon", type=int, default=16, help="action chunk rows")
    parser.add_argument("--dim", type=int, default=7, help="action chunk columns")
    parser.add_argument(
        "--mode", choices=("zeros", "random"), default="zeros", help="action fill"
    )
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    handler = _make_handler(args.horizon, args.dim, args.mode)
    logging.info("mock policy server listening on ws://%s:%d", args.host, args.port)
    with ws_server.serve(handler, args.host, args.port) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:  # pragma: no cover - interactive
            logging.info("shutting down")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
