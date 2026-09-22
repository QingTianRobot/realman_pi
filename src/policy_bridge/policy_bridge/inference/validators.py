"""Validation of policy-service action chunks.

The bridge trusts nothing from the network: a chunk must have the exact
``(action_horizon, action_dim)`` shape and be entirely finite. Anything else is
rejected wholesale so a malformed frame can never reach the robot. Valid values
are clipped into ``action_clip`` rather than rejected.
"""

from __future__ import annotations

import numpy as np

from ..config_loader import ActionConfig


def check(chunk, action_cfg: ActionConfig) -> np.ndarray | None:
    """Validate and clip a raw chunk. Return a float32 array or ``None``."""
    try:
        array = np.asarray(chunk, dtype=np.float32)
    except (TypeError, ValueError):
        return None
    expected = (action_cfg.action_horizon, action_cfg.action_dim)
    if array.shape != expected:
        return None
    if not np.all(np.isfinite(array)):
        return None
    low, high = action_cfg.action_clip
    return np.clip(array, float(low), float(high))
