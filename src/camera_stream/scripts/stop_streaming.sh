#!/usr/bin/env bash
# 停止相机推流相关进程（mediamtx + 两个推流进程 + ROS2 桥）。
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pkill -f "camera_stream.orbbec_stream" 2>/dev/null && echo "已停 orbbec_stream" || true
pkill -f "camera_stream.realsense_stream" 2>/dev/null && echo "已停 realsense_stream" || true
pkill -f "camera_stream.ros2_bridge" 2>/dev/null && echo "已停 ros2_bridge" || true
pkill -f "$ROOT/bin/mediamtx" 2>/dev/null && echo "已停 mediamtx" || true

echo "完成。"
