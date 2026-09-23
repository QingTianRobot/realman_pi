"""Verify all four production camera color streams are actually publishing frames.

Used by ``rm65_camera_ros2`` as its bringup health check: the Orbbec Gemini 305
wrapper occasionally starts a device with a live publisher but no frames (a
hot-swap quirk it already double-starts around), so after launching we confirm
every stream delivers at least one frame within ``timeout`` seconds.

Exit code 0 = all four streams publishing; 1 = one or more silent.
"""

import sys
import time

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image

TOPICS = {
    "left": "/camera_left/color/image_raw",
    "middle": "/camera_middle/color/image_raw",
    "right": "/camera_right/color/image_raw",
    "d435": "/camera_global/d435/color/image_raw",
}

TIMEOUT = float(sys.argv[1]) if len(sys.argv) > 1 else 15.0


class HealthCheck(Node):
    def __init__(self):
        super().__init__("camera_health_check")
        self.frames = {name: 0 for name in TOPICS}
        for name, topic in TOPICS.items():
            self.create_subscription(Image, topic, lambda msg, n=name: self.cb(n, msg), 10)

    def cb(self, name, msg):
        self.frames[name] += 1


def main():
    rclpy.init()
    node = HealthCheck()
    start = time.time()
    while time.time() - start < TIMEOUT:
        rclpy.spin_once(node, timeout_sec=0.1)
        if all(count > 0 for count in node.frames.values()):
            break
    print(f"camera health check after {time.time() - start:.1f}s:")
    silent = []
    for name in TOPICS:
        status = "OK" if node.frames[name] > 0 else "SILENT"
        if node.frames[name] == 0:
            silent.append(name)
        print(f"  {name}: {status} ({node.frames[name]} frames)")
    node.destroy_node()
    rclpy.shutdown()
    if silent:
        print(f"RESULT: {len(silent)} silent -> {', '.join(silent)}")
        sys.exit(1)
    print("RESULT: all 4 cameras publishing")
    sys.exit(0)


if __name__ == "__main__":
    main()
