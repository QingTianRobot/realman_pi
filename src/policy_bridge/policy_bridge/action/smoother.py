"""First-order low-pass smoothing helpers shared by arm and gripper output."""

from __future__ import annotations

import numpy as np


class LowPassSmoother:
    """``a_smooth = alpha * a_new + (1 - alpha) * a_last``.

    The first sample passes through unchanged so a freshly activated bridge does
    not ramp from zero. ``reset()`` clears the cache on activate / mode switch.
    """

    def __init__(self, alpha: float) -> None:
        if not 0.0 < alpha <= 1.0:
            raise ValueError("alpha must be in (0, 1]")
        self._alpha = float(alpha)
        self._last: np.ndarray | None = None

    def reset(self) -> None:
        self._last = None

    def apply(self, value) -> np.ndarray:
        current = np.asarray(value, dtype=np.float64)
        if self._last is None or self._last.shape != current.shape:
            self._last = current.copy()
        else:
            self._last = self._alpha * current + (1.0 - self._alpha) * self._last
        return self._last.copy()
