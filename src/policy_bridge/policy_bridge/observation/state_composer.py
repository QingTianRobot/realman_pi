"""Compose the 7-dim uplink state vector for one arm.

Phase 1 uses ``joint_states`` as the placeholder for ``state[0:6]`` (the design
spec's Cartesian state awaits a driver topic -- risk R2). ``state[6]`` is the
gripper opening 0..1, converted from the ``gripper_manager`` device-unit
``Float64`` position using the ``open_position``/``close_position`` from
``gripper.yaml`` (0=close, 1=open, matching the manager's own mapping).

The composer never does control maths: it only reads latest samples and packs
them. If a required joint sample has not arrived, ``compose`` returns ``None``
so the observation builder skips the cycle instead of sending stale data.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import yaml

from ..config_loader import StateConfig


def load_gripper_limits(path: str | Path) -> dict[str, tuple[int, int]]:
    """Return ``{gripper_name: (open_position, close_position)}`` from gripper.yaml.

    Missing or malformed files yield an empty mapping; the caller degrades rather
    than crashing so the bridge can start before the gripper stack is up.
    """
    limits: dict[str, tuple[int, int]] = {}
    file_path = Path(path)
    if not file_path.is_file():
        return limits
    try:
        document = yaml.safe_load(file_path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError:
        return limits
    for bus in document.get("buses", []) or []:
        for gripper in (bus.get("grippers", []) or []):
            name = gripper.get("name")
            if not isinstance(name, str):
                continue
            try:
                limits[name] = (int(gripper["open_position"]), int(gripper["close_position"]))
            except (KeyError, TypeError, ValueError):
                continue
    return limits


def position_to_percentage(position: float, open_position: int, close_position: int) -> float:
    """Convert a device-unit position to 0..1 (0=close, 1=open), clipped."""
    span = float(open_position - close_position)
    if span == 0.0:
        return 0.0
    pct = (float(position) - float(close_position)) / span
    return float(min(1.0, max(0.0, pct)))


def gripper_name_from_topic(topic: str) -> str:
    """``/gripper_left/position`` -> ``gripper_left``."""
    parts = [p for p in topic.split("/") if p]
    return parts[0] if parts else ""


class StateComposer:
    def __init__(self, node, state_cfg: StateConfig) -> None:
        self._cfg = state_cfg
        self._node = node
        self._joint: dict[str, list[float]] = {}
        self._gripper_pct: dict[str, float] = {}
        self._limits = load_gripper_limits(state_cfg.gripper_config)
        self._warned_missing_gripper: set[str] = set()
        self._subscriptions = []
        if node is not None:
            from sensor_msgs.msg import JointState
            from std_msgs.msg import Float64

            for side, topic in state_cfg.joint_state_topics.items():
                self._subscriptions.append(
                    node.create_subscription(
                        JointState, topic, lambda m, s=side: self._on_joint(s, m), 10
                    )
                )
            for side, topic in state_cfg.gripper_position_topics.items():
                self._subscriptions.append(
                    node.create_subscription(
                        Float64, topic, lambda m, s=side: self._on_gripper(s, m), 10
                    )
                )

    def _on_joint(self, side: str, msg) -> None:
        self.update_joint(side, list(msg.position))

    def _on_gripper(self, side: str, msg) -> None:
        self.update_gripper_position(side, float(msg.data))

    def update_joint(self, side: str, positions) -> None:
        self._joint[side] = [float(p) for p in positions][:6]

    def update_gripper_position(self, side: str, device_position: float) -> None:
        name = gripper_name_from_topic(self._cfg.gripper_position_topics.get(side, ""))
        limits = self._limits.get(name)
        if limits is None:
            self._gripper_pct[side] = 0.0
            return
        open_position, close_position = limits
        self._gripper_pct[side] = position_to_percentage(device_position, open_position, close_position)

    def set_gripper_percentage(self, side: str, percentage: float) -> None:
        """Direct percentage injection (used when a percentage source exists)."""
        self._gripper_pct[side] = float(min(1.0, max(0.0, percentage)))

    def compose(self, side: str) -> np.ndarray | None:
        """Return the 7-dim float32 state for ``side`` or ``None`` if not ready."""
        joints = self._joint.get(side)
        if joints is None or len(joints) < 6:
            return None
        gripper = self._gripper_pct.get(side)
        if gripper is None:
            if side not in self._warned_missing_gripper:
                self._warned_missing_gripper.add(side)
                logger = getattr(self._node, "get_logger", lambda: None)()
                if logger:
                    logger.warn(f"gripper state not ready for '{side}', using 0.0 placeholder")
            gripper = 0.0
        state = np.zeros(7, dtype=np.float32)
        state[0:6] = np.asarray(joints[:6], dtype=np.float32)
        state[6] = np.float32(gripper)
        return state
