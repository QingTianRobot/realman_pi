"""Metrics collection published as ``diagnostic_msgs/DiagnosticArray``.

``Stats`` keeps simple monotonic counters (``bump``) plus optional live gauges
registered as zero-arg callables (``gauge``). A timer republishes the whole
snapshot to ``/policy/stats`` so operators can watch inference/publish health
without touching the node internals.
"""

from __future__ import annotations

import threading
from typing import Callable

from diagnostic_msgs.msg import DiagnosticArray, DiagnosticStatus, KeyValue

from .config_loader import StatsConfig


class Stats:
    def __init__(self, node, stats_cfg: StatsConfig) -> None:
        self._cfg = stats_cfg
        self._node = node
        self._counters: dict[str, int] = {}
        self._gauges: dict[str, Callable[[], float]] = {}
        self._lock = threading.Lock()
        self._pub = None
        self._timer = None
        if node is not None and hasattr(node, "create_publisher"):
            self._pub = node.create_publisher(DiagnosticArray, stats_cfg.topic, 10)
            self._timer = node.create_timer(stats_cfg.publish_period_s, self.publish)

    def bump(self, name: str, amount: int = 1) -> None:
        with self._lock:
            self._counters[name] = self._counters.get(name, 0) + amount

    def gauge(self, name: str, provider: Callable[[], float]) -> None:
        with self._lock:
            self._gauges[name] = provider

    def reset(self, name: str | None = None) -> None:
        with self._lock:
            if name is None:
                self._counters.clear()
            else:
                self._counters.pop(name, None)

    def snapshot(self) -> dict[str, float]:
        with self._lock:
            values: dict[str, float] = dict(self._counters)
            gauges = dict(self._gauges)
        for name, provider in gauges.items():
            try:
                values[name] = float(provider())
            except Exception:  # noqa: BLE001 - a broken gauge must not kill stats
                continue
        return values

    def build_message(self) -> DiagnosticArray:
        msg = DiagnosticArray()
        if self._node is not None and hasattr(self._node, "get_clock"):
            msg.header.stamp = self._node.get_clock().now().to_msg()
        status = DiagnosticStatus()
        status.name = "policy_bridge"
        status.hardware_id = "policy_bridge_node"
        values = self.snapshot()
        paused = values.get("paused", 0.0)
        status.level = (
            DiagnosticStatus.ERROR if paused else DiagnosticStatus.OK
        )
        status.message = "paused" if paused else "ok"
        for key in sorted(values):
            status.values.append(KeyValue(key=key, value=str(values[key])))
        msg.status.append(status)
        return msg

    def publish(self) -> None:
        if self._pub is not None:
            self._pub.publish(self.build_message())
