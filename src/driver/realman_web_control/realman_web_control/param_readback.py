"""Read ROS parameters of running nodes for the parameter page, without importing rclpy.

``web_control_node`` builds one ``rcl_interfaces/srv/GetParameters`` client per node at startup and
hands them in; this module only sends the requests, waits with one shared deadline and converts
``ParameterValue`` messages by their ``type`` number.
"""

from __future__ import annotations

import contextlib
import threading
import time
from typing import Any, Callable

# rcl_interfaces/msg/ParameterType constants.
PARAMETER_BOOL = 1
PARAMETER_INTEGER = 2
PARAMETER_DOUBLE = 3
PARAMETER_BOOL_ARRAY = 6
PARAMETER_INTEGER_ARRAY = 7
PARAMETER_DOUBLE_ARRAY = 8


def parameter_value(value: Any) -> Any:
    """Python value of a ParameterValue message; ``None`` for unset or unsupported types."""
    kind = getattr(value, "type", 0)
    if kind == PARAMETER_BOOL:
        return bool(value.bool_value)
    if kind == PARAMETER_INTEGER:
        return int(value.integer_value)
    if kind == PARAMETER_DOUBLE:
        return float(value.double_value)
    if kind == PARAMETER_BOOL_ARRAY:
        return [bool(item) for item in value.bool_array_value]
    if kind == PARAMETER_INTEGER_ARRAY:
        return [int(item) for item in value.integer_array_value]
    if kind == PARAMETER_DOUBLE_ARRAY:
        return [float(item) for item in value.double_array_value]
    return None


class ParameterReadback:
    """``read({node: [names]})`` -> ``{node: {"available": bool, "values": {name: value}}}``."""

    def __init__(self, clients: dict[str, Any], request_factory: Callable[[], Any], timeout_sec: float) -> None:
        self._clients = dict(clients)
        self._request_factory = request_factory
        self._timeout_sec = float(timeout_sec)

    def read(self, requests: dict[str, list[str]]) -> dict[str, dict[str, Any]]:
        result: dict[str, dict[str, Any]] = {}
        pending = []
        for node, names in requests.items():
            client = self._clients.get(node)
            if client is None or not client.service_is_ready():
                result[node] = {"available": False, "values": {}}
                continue
            request = self._request_factory()
            request.names = list(names)
            done = threading.Event()
            future = client.call_async(request)
            future.add_done_callback(lambda _future, event=done: event.set())
            pending.append((node, list(names), future, done))
        deadline = time.monotonic() + self._timeout_sec
        for node, names, future, done in pending:
            response = None
            if done.wait(max(0.0, deadline - time.monotonic())):
                try:
                    response = future.result()
                except Exception:  # noqa: BLE001 - a failed call only means "not readable now"
                    response = None
            if response is None:
                # Do not let unanswered requests pile up in the client while the page keeps polling.
                remove = getattr(self._clients[node], "remove_pending_request", None)
                if remove is not None and not future.done():
                    with contextlib.suppress(Exception):
                        remove(future)
                result[node] = {"available": False, "values": {}}
                continue
            values = list(getattr(response, "values", []))
            result[node] = {
                "available": True,
                "values": {name: parameter_value(value) for name, value in zip(names, values)},
            }
        return result
