"""Publish gripper opening percentage as ``std_msgs/Float32``.

The bridge only publishes a topic; it never talks to the gripper serial bus.
The 0..1 semantics match ``gripper_manager`` (0=close, 1=open). Values are
clamped to the configured range and low-pass smoothed with a dedicated, more
conservative coefficient. On activate / mode switch the per-side cache is reset
so the first published value is not dragged from a stale session.
"""

from __future__ import annotations

from std_msgs.msg import Float32

from ..action.smoother import LowPassSmoother
from ..config_loader import GripperDownlink


class GripperPublisher:
    def __init__(self, node, gripper_cfg: GripperDownlink) -> None:
        self._cfg = gripper_cfg
        self._low, self._high = gripper_cfg.clamp
        self._smoothers = {
            "left": LowPassSmoother(gripper_cfg.smoothing_alpha),
            "right": LowPassSmoother(gripper_cfg.smoothing_alpha),
        }
        self._pubs: dict[str, object] = {}
        if node is not None:
            self._pubs = {
                "left": node.create_publisher(Float32, gripper_cfg.topic_left, 10),
                "right": node.create_publisher(Float32, gripper_cfg.topic_right, 10),
            }

    def reset_cache(self) -> None:
        for smoother in self._smoothers.values():
            smoother.reset()

    def clamp(self, value: float) -> float:
        return max(self._low, min(self._high, float(value)))

    def publish(self, side: str, value: float) -> float:
        """Clamp, smooth, and publish one gripper percentage. Return the sent value."""
        smoothed = float(self._smoothers[side].apply(self.clamp(value))[()])
        smoothed = self.clamp(smoothed)
        if side in self._pubs:
            msg = Float32()
            msg.data = smoothed
            self._pubs[side].publish(msg)
        return smoothed
