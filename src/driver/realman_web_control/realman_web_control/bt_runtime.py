"""Read-only view of the behavior-tree executor's runtime snapshot for the Web UI.

The executor writes a JSON snapshot after every tick and ``bt_server`` (the :8080
monitor started by ``bt-start``) serves it at ``/api/runtime``. The Web server
proxies it so browsers need no second origin, and trims it to what the tree view
draws: the event log is dropped and stale or empty snapshots read as "no tree".
"""

from __future__ import annotations

from typing import Any

STATUSES = frozenset({"IDLE", "RUNNING", "SUCCESS", "FAILURE", "SKIPPED"})
NODE_FIELDS = ("path", "name", "registration_name", "kind", "status", "failure_reason")
MAX_NODES = 2000

UNAVAILABLE: dict[str, Any] = {"available": False}


def compact_runtime_snapshot(document: Any, now_ms: int, stale_after_ms: int) -> dict[str, Any]:
    """Return the browser payload for one ``/api/runtime`` document.

    ``available`` is true only for a well-formed snapshot that has a loaded tree
    and was written within ``stale_after_ms``; anything else hides the tree view.
    """
    if not isinstance(document, dict):
        return dict(UNAVAILABLE)
    nodes = document.get("nodes")
    timestamp = document.get("timestamp_ms")
    if (not isinstance(nodes, list) or not nodes or len(nodes) > MAX_NODES
            or isinstance(timestamp, bool) or not isinstance(timestamp, int)):
        return dict(UNAVAILABLE)
    if now_ms - timestamp > stale_after_ms:
        return dict(UNAVAILABLE)
    compact_nodes = []
    for node in nodes:
        if not isinstance(node, dict) or not isinstance(node.get("path"), str):
            return dict(UNAVAILABLE)
        entry = {field: str(node.get(field, "")) for field in NODE_FIELDS}
        if entry["status"] not in STATUSES:
            entry["status"] = "IDLE"
        compact_nodes.append(entry)
    root_status = str(document.get("root_status", "IDLE"))
    return {
        "available": True,
        "tree_id": str(document.get("tree_id", "")),
        "sequence": document.get("sequence") if isinstance(document.get("sequence"), int) else 0,
        "timestamp_ms": timestamp,
        "root_status": root_status if root_status in STATUSES else "IDLE",
        "failure_reason": str(document.get("failure_reason", "")),
        "nodes": compact_nodes,
    }
