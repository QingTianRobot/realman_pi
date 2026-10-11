"""Small goal-field validators shared by the velocity and pose sessions.

Both sessions validate the same ``control_period_ms`` / ``watchdog_ms`` / acceleration fields
and must reject them with identical messages, so the checks live in one place. Booleans are
rejected explicitly because ``bool`` is a subclass of ``int`` in Python.
"""

from __future__ import annotations

import math
from typing import Any


def positive_int(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{field} must be a positive integer")
    return value


def positive_float(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be positive")
    value = float(value)
    if not math.isfinite(value) or value <= 0.0:
        raise ValueError(f"{field} must be positive")
    return value
