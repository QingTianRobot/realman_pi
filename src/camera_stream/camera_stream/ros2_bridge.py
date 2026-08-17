"""轻量 ROS2 桥：只发布 CameraInfo（内参）与静态 TF（手眼外参），不发图像帧。

图像帧改走局域网推流，此节点把标定元数据补回 ROS2 图，供下游标定/检测节点使用。

用法（需先 source ROS2）:
    python -m camera_stream.ros2_bridge [calibration.yaml]

calibration.yaml 结构见 config/camera_calibration.yaml。
"""
from __future__ import annotations

import argparse
import logging
import sys

import numpy as np
import yaml

log = logging.getLogger("ros2_bridge")


def _build_camera_info(cam: dict):
    from sensor_msgs.msg import CameraInfo

    msg = CameraInfo()
    msg.header.frame_id = cam.get("frame_id", "camera_optical_frame")
    msg.width = int(cam.get("width", 0))
    msg.height = int(cam.get("height", 0))
    fx, fy, cx, cy = cam.get("intrinsics", [0.0, 0.0, 0.0, 0.0])
    msg.k = [fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0]
    d = cam.get("distortion", [])
    msg.d = list(d) if d else [0.0, 0.0, 0.0, 0.0, 0.0]
    msg.r = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
    msg.p = [fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0]
    return msg


def _build_transform(cam: dict):
    from geometry_msgs.msg import TransformStamped

    ex = cam.get("extrinsics", {}) or {}
    t = ex.get("translation", []) or [0.0, 0.0, 0.0]
    q = ex.get("quaternion", []) or [0.0, 0.0, 0.0, 1.0]
    msg = TransformStamped()
    msg.header.frame_id = "base_link"  # 手眼外参基准帧，按需改
    msg.child_frame_id = cam.get("frame_id", "camera_optical_frame")
    msg.transform.translation.x = float(t[0])
    msg.transform.translation.y = float(t[1])
    msg.transform.translation.z = float(t[2])
    msg.transform.rotation.x = float(q[0])
    msg.transform.rotation.y = float(q[1])
    msg.transform.rotation.z = float(q[2])
    msg.transform.rotation.w = float(q[3])
    return msg


def main() -> int:
    parser = argparse.ArgumentParser(description="CameraInfo/TF 桥")
    parser.add_argument(
        "calibration", nargs="?", default="config/camera_calibration.yaml",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    )

    try:
        import rclpy
        from rclpy.node import Node
        from rclpy.qos import DurabilityPolicy, QoSProfile
        from tf2_ros import StaticTransformBroadcaster
    except ImportError as e:
        log.error("rclpy 不可用，请先 source /opt/ros/humble/setup.bash: %s", e)
        return 1

    with open(args.calibration, "r", encoding="utf-8") as f:
        cams = yaml.safe_load(f) or {}

    rclpy.init()
    node = Node("camera_info_bridge")
    tf_broadcaster = StaticTransformBroadcaster(node)
    transient_local = QoSProfile(depth=1, durability=DurabilityPolicy.TRANSIENT_LOCAL)

    pubs = {}
    for name, cam in cams.items():
        topic = cam.get("camera_info_topic", f"/{name}/camera_info")
        pubs[topic] = node.create_publisher(
            __import__("sensor_msgs.msg", fromlist=["CameraInfo"]).CameraInfo,
            topic,
            transient_local,
        )
        # 发布内参
        pubs[topic].publish(_build_camera_info(cam))
        # 发布静态 TF（外参）
        tf_broadcaster.sendTransform(_build_transform(cam))
        log.info("发布 CameraInfo %s + TF %s", topic, cam.get("frame_id"))

    log.info("桥节点运行中，Ctrl-C 退出")
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()
    return 0


if __name__ == "__main__":
    sys.exit(main())
