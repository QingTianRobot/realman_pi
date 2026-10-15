"""Verify every enabled production camera color stream is actually publishing.

Used by ``rm65_camera_ros2`` as its bringup health check: the Orbbec Gemini 305
wrapper occasionally starts a device with a live publisher but no frames (a
hot-swap quirk it already double-starts around), so after launching we confirm
every enabled stream delivers at least one frame within ``timeout`` seconds.

A wrist camera with ``enabled: false`` in ``cameras_ros2.yaml`` (or the local
override) is skipped entirely, so an intentionally uninstalled camera does not
keep the retry loop retrying. The global D435 is skipped only when
``global_camera.enabled`` is false.

Exit code 0 = all enabled streams publishing; 1 = one or more silent.
"""

import os
import sys
import time
from pathlib import Path

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image

TOPICS = {
    "left": "/camera_left/color/image_raw",
    "middle": "/camera_middle/color/image_raw",
    "right": "/camera_right/color/image_raw",
    "d435": "/camera_global/d435/color/image_raw",
}


def _deep_merge(base, override):
    """Recursively merge ``override`` onto ``base``; leaf values in override win."""
    if not isinstance(base, dict) or not isinstance(override, dict):
        return override if override is not None else base
    merged = dict(base)
    for key, value in override.items():
        merged[key] = _deep_merge(merged.get(key), value) if isinstance(value, dict) else value
    return merged


def _base_config_path():
    from ament_index_python.packages import get_package_share_directory

    return Path(get_package_share_directory("sensor_bringup")) / "config" / "cameras_ros2.yaml"


def _local_override_path(base_path):
    """Mirror the launch file's optional ``cameras_ros2.local.yaml`` lookup."""
    env_path = os.environ.get("RM65_CAMERAS_LOCAL_CONFIG")
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    candidates.append(base_path.resolve().parent / "cameras_ros2.local.yaml")
    candidates.append(base_path.parent / "cameras_ros2.local.yaml")
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def _load_config():
    import yaml

    base_path = _base_config_path()
    with base_path.open(encoding="utf-8") as config_file:
        config = yaml.safe_load(config_file) or {}

    local_path = _local_override_path(base_path)
    if local_path is not None:
        with local_path.open(encoding="utf-8") as local_file:
            local = yaml.safe_load(local_file) or {}
        config = _deep_merge(config, local)
    return config


def _enabled_topics(config):
    """Return the subset of TOPICS whose cameras are enabled in ``config``."""
    wrist = config.get("wrist_cameras", {}) or {}
    devices = wrist.get("devices", {}) or {}
    global_camera = config.get("global_camera", {}) or {}

    topics = {}
    for side in ("left", "middle", "right"):
        device_cfg = devices.get(side, {}) or {}
        if device_cfg.get("enabled", True):
            topics[side] = TOPICS[side]
    if global_camera.get("enabled", True):
        topics["d435"] = TOPICS["d435"]
    return topics


class HealthCheck(Node):
    def __init__(self, topics):
        super().__init__("camera_health_check")
        self.frames = {name: 0 for name in topics}
        for name, topic in topics.items():
            self.create_subscription(Image, topic, lambda msg, n=name: self.cb(n, msg), 10)

    def cb(self, name, msg):
        self.frames[name] += 1


def main():
    timeout = float(sys.argv[1]) if len(sys.argv) > 1 else 15.0
    topics = _enabled_topics(_load_config())
    rclpy.init()
    node = HealthCheck(topics)
    start = time.time()
    while time.time() - start < timeout:
        rclpy.spin_once(node, timeout_sec=0.1)
        if all(count > 0 for count in node.frames.values()):
            break
    print(f"camera health check after {time.time() - start:.1f}s:")
    silent = []
    for name in topics:
        status = "OK" if node.frames[name] > 0 else "SILENT"
        if node.frames[name] == 0:
            silent.append(name)
        print(f"  {name}: {status} ({node.frames[name]} frames)")
    node.destroy_node()
    rclpy.shutdown()
    if silent:
        print(f"RESULT: {len(silent)} silent -> {', '.join(silent)}")
        sys.exit(1)
    print(f"RESULT: all {len(topics)} cameras publishing")
    sys.exit(0)


if __name__ == "__main__":
    main()
