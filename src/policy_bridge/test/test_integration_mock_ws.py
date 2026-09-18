"""End-to-end smoke test with a mock policy service (Task 9).

This exercises the *real* downlink chain -- InferenceScheduler + WsClient +
validators + ChunkBuffer + Dispatcher + GripperPublisher -- driven by a mock
WebSocket transport that returns a legal ``(16, 7)`` chunk. Only the outermost
DDS publishers and the scheduler executor are swapped (for recording and
determinism), so the assertions check real ``TwistStamped`` / ``Float32``
content, ROS-clock stamps, mode gating, queue-empty stop, and the 50 Hz period.

No policy service, robot, or motion is involved.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest
import rclpy

from policy_bridge.inference.scheduler import _InlineExecutor
from policy_bridge.policy_bridge_node import PolicyBridgeNode

_CONFIG = Path(__file__).resolve().parents[3] / "config" / "ros" / "policy_bridge.yaml"

# config/ros/policy_bridge.yaml values relied on below.
_TWIST_LINEAR_SCALE = 0.2
_FRAME_ID = "l_base_link"
_STEPS_PER_INFERENCE = 4


class RecordingPub:
    def __init__(self) -> None:
        self.msgs = []

    def publish(self, msg) -> None:
        self.msgs.append(msg)


class MockTransport:
    """Stands in for the WebSocket transport: returns a fixed action chunk."""

    def __init__(self, chunk: np.ndarray) -> None:
        self._chunk = chunk
        self.calls = 0

    def request(self, payload: str) -> str:
        self.calls += 1
        # payload must be valid JSON carrying the fixed obs contract
        decoded = json.loads(payload)
        assert len(decoded["state"]) == 7
        assert "prompt" in decoded
        return json.dumps({"actions": self._chunk.tolist()})


@pytest.fixture()
def bridge():
    if not rclpy.ok():
        rclpy.init()
    node = PolicyBridgeNode(config_file=str(_CONFIG))
    # Deterministic, synchronous inference.
    node._scheduler.shutdown()
    node._scheduler._executor = _InlineExecutor()
    # Record instead of publishing over DDS.
    node._velocity_rec = {s: RecordingPub() for s in node._dispatcher._velocity_pubs}
    node._dispatcher._velocity_pubs = node._velocity_rec
    node._gripper_rec = {s: RecordingPub() for s in node._gripper._pubs}
    node._gripper._pubs = node._gripper_rec
    yield node
    node.destroy_node()


def _install_mock_ws(node, chunk):
    node._ws._transport = MockTransport(chunk)
    return node._ws._transport


def _feed_observation(node):
    node._state.update_joint("left", [0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
    node._images.set_latest("wrist_image", np.zeros((4, 4, 3), dtype=np.uint8))
    node._images.set_latest("global_image", np.zeros((4, 4, 3), dtype=np.uint8))


def test_publish_timer_runs_at_50hz(bridge):
    # 1/50 s == 20 ms; allow a tiny float rounding window.
    assert 19_999_000 < bridge._publish_timer.timer_period_ns < 20_001_000


def test_end_to_end_mock_ws_velocity_publish(bridge):
    node = bridge
    chunk = np.zeros((16, 7), dtype=np.float32)
    chunk[:, 0] = 0.5   # vx -> twist.linear.x = 0.5 * 0.2 = 0.1
    chunk[:, 6] = 0.8   # gripper opening
    transport = _install_mock_ws(node, chunk)
    _feed_observation(node)

    node.activate()
    node._mode.update("policy", 0)  # -> velocity
    assert node.force_infer() is True

    # One synchronous inference produced one request and a full step slice.
    assert transport.calls == 1
    assert node._buffer.remaining == _STEPS_PER_INFERENCE

    # Publish one step: real TwistStamped content + ROS-clock stamp.
    node._publish_loop()
    twists = node._velocity_rec["left"].msgs
    assert len(twists) == 1
    msg = twists[0]
    assert msg.header.frame_id == _FRAME_ID
    assert msg.twist.linear.x == pytest.approx(0.5 * _TWIST_LINEAR_SCALE)
    assert msg.twist.angular.z == pytest.approx(0.0)
    # stamp comes from the ROS clock (non-zero, current epoch).
    assert msg.header.stamp.sec > 1_600_000_000

    # Gripper published on the same tick, first sample passes through smoothing.
    grips = node._gripper_rec["left"].msgs
    assert len(grips) == 1
    assert grips[0].data == pytest.approx(0.8, abs=1e-3)

    # Cut the transport so the rolling-horizon re-trigger cannot refill the
    # queue: one chunk maps to exactly steps_per_inference publishes.
    node._ws._transport = None
    for _ in range(_STEPS_PER_INFERENCE - 1):
        node._publish_loop()
    assert len(node._velocity_rec["left"].msgs) == _STEPS_PER_INFERENCE
    assert node._buffer.remaining == 0


def test_queue_empty_stops_publishing(bridge):
    node = bridge
    chunk = np.zeros((16, 7), dtype=np.float32)
    _install_mock_ws(node, chunk)
    _feed_observation(node)
    node.activate()
    node._mode.update("policy", 0)
    node.force_infer()
    # Prevent refill so the queue truly drains to empty.
    node._ws._transport = None
    for _ in range(_STEPS_PER_INFERENCE):
        node._publish_loop()
    assert node._buffer.remaining == 0
    before = len(node._velocity_rec["left"].msgs)
    # Nothing left: the loop must stop (no zero command), watchdog takes over.
    node._publish_loop()
    node._publish_loop()
    assert len(node._velocity_rec["left"].msgs) == before


def test_inactive_mode_publishes_nothing(bridge):
    node = bridge
    chunk = np.zeros((16, 7), dtype=np.float32)
    chunk[:, 0] = 0.5
    _install_mock_ws(node, chunk)
    _feed_observation(node)
    node.activate()
    node._mode.update("policy", 0)
    node.force_infer()
    # Router switches away from policy -> inactive clears the queue and stops.
    node._mode.update("none", 0)
    assert node._mode.internal_mode == "inactive"
    assert node._buffer.remaining == 0
    node._publish_loop()
    assert node._velocity_rec["left"].msgs == []
    assert node._gripper_rec["left"].msgs == []
