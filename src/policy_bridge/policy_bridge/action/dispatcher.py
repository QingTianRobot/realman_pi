"""Build and publish downlink arm commands.

The dispatcher is a *pure formatter*: it never reads robot state and never does
control maths. It only maps a validated ``action[0:6]`` slice onto a
``TwistStamped`` (velocity) or ``PoseStamped`` (position) message, applying the
configured unit scale and an explicit ``frame_id`` / ``stamp`` supplied by the
node. In ``inactive`` mode it publishes nothing ("not publishing" is not the
same as "publishing zero" -- see the design spec watchdog contract).
"""

from __future__ import annotations

import math

from geometry_msgs.msg import PoseStamped, TwistStamped

from ..config_loader import DownlinkConfig


# Side order maps positionally onto arm_names (phase 1: [l, r] -> left, right).
_SIDE_ORDER = ("left", "right", "mid")


def euler_to_quaternion(roll: float, pitch: float, yaw: float) -> tuple[float, float, float, float]:
    """Convert XYZ euler (rad) to quaternion ``(x, y, z, w)`` (sxyz convention)."""
    cr, sr = math.cos(roll * 0.5), math.sin(roll * 0.5)
    cp, sp = math.cos(pitch * 0.5), math.sin(pitch * 0.5)
    cy, sy = math.cos(yaw * 0.5), math.sin(yaw * 0.5)
    x = sr * cp * cy - cr * sp * sy
    y = cr * sp * cy + sr * cp * sy
    z = cr * cp * sy - sr * sp * cy
    w = cr * cp * cy + sr * sp * sy
    return (x, y, z, w)


def sides_for(arm_names: tuple[str, ...]) -> dict[str, str]:
    """Map side name -> arm id, e.g. ``{"left": "l", "right": "r"}``."""
    return {side: arm for side, arm in zip(_SIDE_ORDER, arm_names)}


class Dispatcher:
    def __init__(self, node, downlink_cfg: DownlinkConfig, arm_names: tuple[str, ...]) -> None:
        self._cfg = downlink_cfg
        self._node = node
        self._side_to_arm = sides_for(arm_names)
        ns = downlink_cfg.command_namespace
        self._velocity_pubs: dict[str, object] = {}
        self._position_pubs: dict[str, object] = {}
        if node is not None:
            for side, arm in self._side_to_arm.items():
                self._velocity_pubs[side] = node.create_publisher(
                    TwistStamped, f"{ns}/{arm}/cartesian_velocity", 10
                )
                self._position_pubs[side] = node.create_publisher(
                    PoseStamped, f"{ns}/{arm}/cartesian_pose", 10
                )

    def build_twist(self, side: str, action6, stamp) -> TwistStamped:
        scale = self._cfg.velocity.twist_scale
        msg = TwistStamped()
        msg.header.stamp = stamp
        msg.header.frame_id = self._cfg.velocity.frame_ids[side]
        msg.twist.linear.x = float(action6[0]) * scale.linear
        msg.twist.linear.y = float(action6[1]) * scale.linear
        msg.twist.linear.z = float(action6[2]) * scale.linear
        msg.twist.angular.x = float(action6[3]) * scale.angular
        msg.twist.angular.y = float(action6[4]) * scale.angular
        msg.twist.angular.z = float(action6[5]) * scale.angular
        return msg

    def build_pose(self, side: str, action6, stamp) -> PoseStamped:
        pos_cfg = self._cfg.position
        msg = PoseStamped()
        msg.header.stamp = stamp
        msg.header.frame_id = pos_cfg.frame_ids[side]
        pos_scale = 0.001 if pos_cfg.position_unit == "mm" else 1.0
        msg.pose.position.x = float(action6[0]) * pos_scale
        msg.pose.position.y = float(action6[1]) * pos_scale
        msg.pose.position.z = float(action6[2]) * pos_scale
        angles = [float(v) for v in action6[3:6]]
        if pos_cfg.angle_unit == "deg":
            angles = [math.radians(a) for a in angles]
        if pos_cfg.pose_format == "xyz_euler":
            qx, qy, qz, qw = euler_to_quaternion(*angles)
        else:  # xyz_quat_xyzw: action6 carries only qx,qy,qz; recover qw from norm.
            qx, qy, qz = angles
            norm_sq = qx * qx + qy * qy + qz * qz
            qw = math.sqrt(max(0.0, 1.0 - norm_sq))
        msg.pose.orientation.x = qx
        msg.pose.orientation.y = qy
        msg.pose.orientation.z = qz
        msg.pose.orientation.w = qw
        return msg

    def publish_arm(self, internal_mode: str, side: str, action6, stamp) -> bool:
        """Publish one arm command. Return True if something was published."""
        if internal_mode == "velocity":
            self._velocity_pubs[side].publish(self.build_twist(side, action6, stamp))
            return True
        if internal_mode == "position":
            self._position_pubs[side].publish(self.build_pose(side, action6, stamp))
            return True
        return False  # inactive: publish nothing (never a zero command)
