#!/usr/bin/env python3
"""Simulate Pika pose input and verify the full chain: mapper -> router -> driver -> arm.

Why: isolate whether "pika moves but the arm doesn't" is an upstream problem
(mapper/router on 143/184) or a downstream one (driver session). It plays the
role of `pika_realman_mapper` on 143 by streaming a PoseStamped to
`/pika/l/cartesian_pose`, then watches the rest of the chain on 184.

What it reports:
  1. `/l/cartesian_pose/command`     — did pika_control_router forward the pose?
  2. `/l/cartesian_pose/_action/status` — did the driver accept a CartesianPose goal?
  3. `/l/joint_states`               — did the arm actually move?

Usage (on the arm host 184, rm65 workspace sourced):
  python3 simulate_pika_pose.py [arm] [delta_mm]

  arm       one of l/m/r (default l)
  delta_mm  how far to offset the current tool pose (default 5.0 mm). The pose is
            only offset on the axis with the largest reach; use a small value.

Safety: this publishes a real target pose, so the arm WILL move if the chain is
healthy. Run it with the e-stop / operator aware, and keep delta_mm small.
"""
import sys
import time

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from sensor_msgs.msg import JointState
from action_msgs.msg import GoalStatusArray


class ChainProbe(Node):
    def __init__(self, arm: str, delta_mm: float) -> None:
        super().__init__("simulate_pika_pose")
        self.arm = arm
        self.delta = delta_mm / 1000.0
        self.forwarded = 0
        self.forward_frame = ""
        self.last_goal_status = ""
        self.joint_before: list[float] | None = None
        self.joint_after: list[float] | None = None
        self.t0 = time.monotonic()

        self.pub = self.create_publisher(PoseStamped, f"/pika/{arm}/cartesian_pose", 1)
        self.create_subscription(
            PoseStamped, f"/{arm}/cartesian_pose/command", self._on_forwarded, 1
        )
        self.create_subscription(
            GoalStatusArray, f"/{arm}/cartesian_pose/_action/status", self._on_status, 1
        )
        self.create_subscription(
            JointState, f"/{arm}/joint_states", self._on_joints, 1
        )

    def _on_forwarded(self, msg: PoseStamped) -> None:
        self.forwarded += 1
        self.forward_frame = msg.header.frame_id

    def _on_status(self, msg: GoalStatusArray) -> None:
        if msg.status_list:
            goal = msg.status_list[-1]
            self.last_goal_status = f"id={goal.goal_info.goal_id.uuid[:8]} status={goal.status}"

    def _on_joints(self, msg: JointState) -> None:
        if self.joint_before is None:
            self.joint_before = list(msg.position)
        self.joint_after = list(msg.position)

    def run(self) -> None:
        # A nominal pose in the arm's base frame; the driver accepts only
        # frame_id == "<arm>/base_link". Real position is irrelevant here: the
        # point is to see whether the stream is accepted and forwarded.
        target = PoseStamped()
        target.header.frame_id = f"{self.arm}/base_link"
        target.pose.position.x = 0.2 + self.delta
        target.pose.position.y = 0.0
        target.pose.position.z = 0.4
        target.pose.orientation.w = 1.0

        self.get_logger().info(
            f"streaming PoseStamped -> /pika/{self.arm}/cartesian_pose for 5s "
            f"(frame={target.header.frame_id})"
        )
        period = 0.02  # 50 Hz, matching pika's streaming cadence
        while time.monotonic() - self.t0 < 5.0:
            target.header.stamp = self.get_clock().now().to_msg()
            self.pub.publish(target)
            rclpy.spin_once(self, timeout_sec=period)

        if self.joint_before is not None and self.joint_after is not None:
            moved = sum(
                abs(b - a) for b, a in zip(self.joint_before, self.joint_after)
            )
        else:
            moved = 0.0

        print("\n=== chain report ===")
        print(f"forwarded to /{self.arm}/cartesian_pose/command: {self.forwarded} msgs "
              f"(frame={self.forward_frame or 'n/a'})")
        print(f"cartesian_pose goal status: {self.last_goal_status or 'no goal observed'}")
        print(f"joint delta sum: {moved:.5f} rad")
        print("verdict: ", end="")
        if self.forwarded == 0:
            print("ROUTER DID NOT FORWARD (upstream: mapper/router)")
        elif not self.last_goal_status:
            print("NO GOAL (driver never started a session)")
        elif moved < 1e-4:
            print("COMMAND FLOWED BUT ARM DID NOT MOVE (session watchdog / rejected)")
        else:
            print("ARM MOVED (chain healthy)")


def main() -> None:
    rclpy.init(args=sys.argv)
    arm = sys.argv[1] if len(sys.argv) > 1 else "l"
    delta_mm = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
    if arm not in {"l", "m", "r"}:
        print("arm must be l/m/r", file=sys.stderr)
        sys.exit(2)
    node = ChainProbe(arm, delta_mm)
    try:
        node.run()
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
