"""Bounded FIFO buffer of validated action steps.

Only the first ``steps_per_inference`` rows of a validated chunk are enqueued by
the caller; the buffer itself just caps total length and supports the "clear on
mode switch / prompt change / activate / estop" rule from the design spec.
"""

from __future__ import annotations

from collections import deque

import numpy as np


class ActionChunkBuffer:
    def __init__(self, maxlen: int) -> None:
        if maxlen < 1:
            raise ValueError("maxlen must be >= 1")
        self._buffer: deque[np.ndarray] = deque(maxlen=maxlen)
        self._last_clear_reason = "init"

    @property
    def maxlen(self) -> int:
        return int(self._buffer.maxlen)

    @property
    def remaining(self) -> int:
        return len(self._buffer)

    @property
    def last_clear_reason(self) -> str:
        return self._last_clear_reason

    def __len__(self) -> int:
        return len(self._buffer)

    def extend(self, steps) -> None:
        """Append steps (each a 1-D array); oldest drop when over capacity."""
        for step in steps:
            self._buffer.append(np.asarray(step, dtype=np.float32))

    def popleft(self) -> np.ndarray | None:
        if not self._buffer:
            return None
        return self._buffer.popleft()

    def clear(self, reason: str = "unspecified") -> None:
        self._buffer.clear()
        self._last_clear_reason = reason
