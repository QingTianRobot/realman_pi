"""Map the behavior-tree ``InputModeState`` to the bridge's internal mode.

The set of legal ``active_mode`` strings is owned exclusively by
``config/behavior-trees/control_router.xml`` (its ``InputModeGuard`` literals).
This module never defines a mode enum: it only maps the XML-registered strings
carried by ``realman_msgs/msg/InputModeState`` onto the three internal states
``velocity`` / ``position`` / ``inactive``.

``phase`` is a ``uint8`` on the message (``ACTIVE=0``, ``SWITCHING=1``,
``FAILED=2``). Only ``ACTIVE`` may publish; during a switch the router passes
through ``none``, and the bridge falls to ``inactive`` so stale actions never
reach a new session.
"""

from __future__ import annotations

from typing import Callable

from ..config_loader import ModeConfig


# realman_msgs/msg/InputModeState.ACTIVE
ACTIVE_PHASE = 0

INTERNAL_MODES = ("velocity", "position", "inactive")


def resolve_internal_mode(
    active_mode: str,
    phase: int,
    mapping,
    default_when_unknown: str,
) -> tuple[str, bool]:
    """Return ``(internal_mode, is_known)`` for one InputModeState sample.

    Any non-ACTIVE phase collapses to ``inactive`` regardless of the mode string.
    Unknown mode strings fall back to ``default_when_unknown`` and report
    ``is_known=False`` so the caller can warn once.
    """
    if phase != ACTIVE_PHASE:
        return "inactive", True
    if active_mode in mapping.velocity_modes:
        return "velocity", True
    if active_mode in mapping.position_modes:
        return "position", True
    if active_mode in mapping.inactive_modes:
        return "inactive", True
    return default_when_unknown, False


class ModeWatcher:
    """Subscribe to InputModeState and notify on internal-mode transitions."""

    def __init__(self, node, mode_cfg: ModeConfig, on_state_change: Callable[[str], None]) -> None:
        self._node = node
        self._cfg = mode_cfg
        self._on_state_change = on_state_change
        self._internal = "inactive"
        self._warned_unknown: set[str] = set()
        self._subscription = None
        if node is not None and hasattr(node, "create_subscription"):
            try:
                from realman_msgs.msg import InputModeState
            except ImportError:  # pragma: no cover - only in dev shells without realman_msgs
                logger = getattr(node, "get_logger", lambda: None)()
                if logger:
                    logger.error(
                        "realman_msgs unavailable; ModeWatcher stays 'inactive' "
                        "(no InputModeState subscription)"
                    )
            else:
                self._subscription = node.create_subscription(
                    InputModeState, mode_cfg.topic, self._on_msg, 10
                )

    @property
    def internal_mode(self) -> str:
        return self._internal

    def _on_msg(self, msg) -> None:
        self.update(msg.active_mode, int(msg.phase))

    def update(self, active_mode: str, phase: int) -> str:
        """Pure entry point (also used by tests): apply one sample."""
        internal, known = resolve_internal_mode(
            active_mode, phase, self._cfg.mapping, self._cfg.default_when_unknown
        )
        if not known and active_mode not in self._warned_unknown:
            self._warned_unknown.add(active_mode)
            logger = getattr(self._node, "get_logger", lambda: None)()
            if logger:
                logger.warn(
                    f"unknown active_mode='{active_mode}', falling back to '{internal}'"
                )
        if internal != self._internal:
            previous = self._internal
            self._internal = internal
            logger = getattr(self._node, "get_logger", lambda: None)()
            if logger:
                logger.info(
                    f"mode: {previous} -> {internal} (active_mode='{active_mode}', phase={phase})"
                )
            self._on_state_change(internal)
        return self._internal
