"""Read ROS parameters of running nodes for the parameter page, without importing rclpy.

``web_control_node`` builds one ``rcl_interfaces/srv/GetParameters`` and one ``ListParameters`` client
per node at startup and hands them in; this module only sends the requests, waits with one shared
deadline and converts ``ParameterValue`` messages by their ``type`` number.

GetParameters answers with no values at all when any requested name is undeclared (rclcpp and rclpy
both drop the whole request), so one parameter an older node build lacks would blank all of them.
After such an answer the node's declared names are listed once and only those are asked for, until
the node disappears.
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
    """``read({node: [names]})`` -> ``{node: {"available": bool, "values": {name: value | None}}}``."""

    def __init__(
        self,
        get_clients: dict[str, Any],
        get_request: Callable[[], Any],
        list_clients: dict[str, Any],
        list_request: Callable[[], Any],
        timeout_sec: float,
    ) -> None:
        self._get_clients = dict(get_clients)
        self._get_request = get_request
        self._list_clients = dict(list_clients)
        self._list_request = list_request
        self._timeout_sec = float(timeout_sec)
        # Declared names per node, learned after an answer dropped by an undeclared name.
        self._declared: dict[str, set[str]] = {}

    @staticmethod
    def _call(client: Any, request: Any) -> tuple[Any, threading.Event]:
        done = threading.Event()
        future = client.call_async(request)
        future.add_done_callback(lambda _future: done.set())
        return future, done

    @staticmethod
    def _wait(client: Any, future: Any, done: threading.Event, deadline: float) -> Any:
        response = None
        if done.wait(max(0.0, deadline - time.monotonic())):
            try:
                response = future.result()
            except Exception:  # noqa: BLE001 - a failed call only means "not readable now"
                response = None
        if response is None and not future.done():
            # Do not let unanswered requests pile up in the client while the page keeps polling.
            remove = getattr(client, "remove_pending_request", None)
            if remove is not None:
                with contextlib.suppress(Exception):
                    remove(future)
        return response

    def _ask(self, node: str, names: list[str]) -> tuple[Any, threading.Event]:
        request = self._get_request()
        request.names = list(names)
        return self._call(self._get_clients[node], request)

    @staticmethod
    def _values(names: list[str], asked: list[str], response: Any) -> dict[str, Any] | None:
        values = list(getattr(response, "values", []) if response is not None else [])
        if response is None or len(values) != len(asked):
            return None
        found = {name: parameter_value(item) for name, item in zip(asked, values)}
        return {name: found.get(name) for name in names}

    def read(self, requests: dict[str, list[str]]) -> dict[str, dict[str, Any]]:
        deadline = time.monotonic() + self._timeout_sec
        result: dict[str, dict[str, Any]] = {}
        asked: dict[str, list[str]] = {}
        pending = {}
        for node, names in requests.items():
            client = self._get_clients.get(node)
            if client is None or not client.service_is_ready():
                self._declared.pop(node, None)
                result[node] = {"available": False, "values": {}}
                continue
            known = self._declared.get(node)
            asked[node] = [name for name in names if known is None or name in known]
            pending[node] = self._ask(node, asked[node])
        listing = {}
        for node, (future, done) in pending.items():
            response = self._wait(self._get_clients[node], future, done, deadline)
            if response is None:
                result[node] = {"available": False, "values": {}}
                continue
            values = self._values(requests[node], asked[node], response)
            if values is not None:
                result[node] = {"available": True, "values": values}
                continue
            # The node answered but dropped the request: some name is undeclared there.
            result[node] = {"available": True, "values": {name: None for name in requests[node]}}
            client = self._list_clients.get(node)
            if client is not None and client.service_is_ready():
                request = self._list_request()
                request.prefixes = []
                request.depth = 0  # ListParameters.Request.DEPTH_RECURSIVE
                listing[node] = (client, *self._call(client, request))
        again = {}
        for node, (client, future, done) in listing.items():
            response = self._wait(client, future, done, deadline)
            if response is None:
                continue
            self._declared[node] = set(response.result.names)
            asked[node] = [name for name in requests[node] if name in self._declared[node]]
            again[node] = self._ask(node, asked[node])
        for node, (future, done) in again.items():
            values = self._values(requests[node], asked[node], self._wait(self._get_clients[node], future, done, deadline))
            if values is not None:
                result[node] = {"available": True, "values": values}
        return result
