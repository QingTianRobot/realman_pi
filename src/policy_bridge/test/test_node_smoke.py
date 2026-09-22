"""Smoke tests for PolicyBridgeNode assembly, publish gating, and lifecycle.

These construct the real node under ``rclpy`` with the authoritative repo
config, then swap the dispatcher/gripper/scheduler for recording fakes so the
publish loop and lifecycle transitions can be asserted deterministically without
a policy service or a robot.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest
import rclpy

from policy_bridge.policy_bridge_node import PolicyBridgeNode

_CONFIG = Path(__file__).resolve().parents[3] / "config" / "ros" / "policy_bridge.yaml"


class FakeDispatcher:
    def __init__(self) -> None:
        self.published = []

    def publish_arm(self, mode, side, action6, stamp):
        if mode == "inactive":
            return False
        self.published.append((mode, side, np.asarray(action6).tolist(), stamp))
        return True


class FakeGripper:
    def __init__(self) -> None:
        self.published = []
        self.resets = 0

    def publish(self, side, value):
        self.published.append((side, value))
        return value

    def reset_cache(self):
        self.resets += 1


class FakeScheduler:
    def __init__(self) -> None:
        self.triggers = []
        self.paused = False
        self.resumed = 0

    def maybe_trigger(self, side, force=False):
        self.triggers.append((side, force))
        return True

    def resume(self):
        self.resumed += 1
        self.paused = False

    def shutdown(self):
        return None


@pytest.fixture()
def node():
    if not rclpy.ok():
        rclpy.init()
    bridge = PolicyBridgeNode(config_file=str(_CONFIG))
    # Swap in recording fakes for deterministic assertions.
    bridge._dispatcher = FakeDispatcher()
    bridge._gripper = FakeGripper()
    bridge._scheduler = FakeScheduler()
    yield bridge
    bridge.destroy_node()


def _feed(node, count=1, value=0.5):
    node._buffer.extend([np.full(7, value, dtype=np.float32) for _ in range(count)])


def test_node_constructs_and_defaults_inactive(node):
    assert node._mode.internal_mode == "inactive"
    assert node._allow_publish is False


def test_publish_loop_inactive_does_nothing(node):
    node.activate()
    _feed(node)
    node._publish_loop()  # mode still inactive
    assert node._dispatcher.published == []
    assert node._gripper.published == []


def test_publish_loop_velocity_pops_and_publishes(node):
    node.activate()
    node._mode.update("policy", 0)  # -> velocity
    _feed(node, count=2, value=0.25)
    node._publish_loop()
    assert len(node._dispatcher.published) == 1
    mode, side, action6, stamp = node._dispatcher.published[0]
    assert mode == "velocity"
    assert side == "left"
    assert len(action6) == 6
    assert stamp is not None
    assert node._gripper.published == [("left", pytest.approx(0.25, abs=1e-3))]
    # rolling-horizon trigger fired while active
    assert node._scheduler.triggers and node._scheduler.triggers[0][0] == "left"


def test_publish_loop_empty_queue_stops(node):
    node.activate()
    node._mode.update("policy", 0)
    node._publish_loop()  # nothing enqueued
    assert node._dispatcher.published == []


def test_deactivate_stops_publishing(node):
    node.activate()
    node._mode.update("policy", 0)
    node.deactivate()
    _feed(node)
    node._publish_loop()
    assert node._dispatcher.published == []


def test_activate_resets_scheduler_and_cache(node):
    node.activate()
    assert node._allow_publish is True
    assert node._scheduler.resumed == 1
    assert node._gripper.resets >= 1


def test_emergency_stop_clears_queue_and_stops(node):
    node.activate()
    node._mode.update("policy", 0)
    _feed(node, count=3)
    node.emergency_stop()
    assert node._buffer.remaining == 0
    assert node._allow_publish is False
    node._publish_loop()
    assert node._dispatcher.published == []


def test_mode_change_clears_queue(node):
    node.activate()
    _feed(node, count=3)
    node._mode.update("policy", 0)  # inactive -> velocity triggers clear
    assert node._buffer.remaining == 0


def test_force_infer_triggers_scheduler(node):
    assert node.force_infer() is True
    assert ("left", True) in node._scheduler.triggers


def test_lifecycle_services_registered(node):
    # five services wired on the node
    assert len(node._lifecycle._services) == 5


def test_stats_snapshot_reflects_state(node):
    node.activate()
    node._mode.update("policy", 0)
    _feed(node, count=2)
    snap = node._stats.snapshot()
    assert snap["allow_publish"] == 1.0
    assert snap["mode_active"] == 1.0
    assert snap["queue_remaining"] == 2.0
