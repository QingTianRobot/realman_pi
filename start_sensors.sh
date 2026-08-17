#!/usr/bin/env bash
# 统一启动 RealSense + Orbbec 相机
# 用法: bash start_sensors.sh
set -e

WS_MAIN="$(cd "$(dirname "$0")" && pwd)"
WS_BU="$WS_MAIN/src/sensor_bringup"
WS_RS="$WS_MAIN/src/sensor/realsense/realsense_ws"
WS_OB="$WS_MAIN/src/sensor/OrbbecSDK_ROS2"

# 依次 source：ROS → 主工作区 → realsense → orbbec
source /opt/ros/humble/setup.bash
# source "$WS_MAIN/install/setup.bash"
source "$WS_BU/install/setup.bash"
source "$WS_RS/install/setup.bash"
source "$WS_OB/install/setup.bash"

export ROS_DOMAIN_ID=0

echo "=== 启动统一相机 launch ==="
exec ros2 launch sensor_bringup cameras.launch.py "$@"
