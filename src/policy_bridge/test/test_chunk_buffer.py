"""Unit tests for policy_bridge.action.chunk_buffer."""

from __future__ import annotations

import numpy as np
import pytest

from policy_bridge.action.chunk_buffer import ActionChunkBuffer


def test_fifo_order_and_popleft():
    buf = ActionChunkBuffer(maxlen=4)
    buf.extend([np.array([1, 2], dtype=np.float32), np.array([3, 4], dtype=np.float32)])
    assert buf.remaining == 2
    first = buf.popleft()
    assert first.tolist() == [1.0, 2.0]
    second = buf.popleft()
    assert second.tolist() == [3.0, 4.0]


def test_popleft_on_empty_returns_none():
    buf = ActionChunkBuffer(maxlen=2)
    assert buf.popleft() is None


def test_maxlen_caps_buffer():
    buf = ActionChunkBuffer(maxlen=3)
    buf.extend([np.array([i], dtype=np.float32) for i in range(5)])
    assert buf.remaining == 3
    # Oldest dropped; the retained values are the most recent three.
    assert buf.popleft().tolist() == [2.0]


def test_clear_records_reason():
    buf = ActionChunkBuffer(maxlen=4)
    buf.extend([np.array([1], dtype=np.float32)])
    buf.clear("mode_switch")
    assert buf.remaining == 0
    assert buf.last_clear_reason == "mode_switch"


def test_invalid_maxlen_rejected():
    with pytest.raises(ValueError):
        ActionChunkBuffer(maxlen=0)
