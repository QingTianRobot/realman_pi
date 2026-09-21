#!/usr/bin/env bash
# 以 ROS2 节点方式统一启动三路 Orbbec Gemini 305 + 全局 RealSense D435。
# 这是相机出图的生产主线；src/camera_stream 的 RTSP 推流方案已弃用（[DEPRECATED]）。
# 用法: bash start_sensors.sh [ros2 launch 参数, 例如 enable_depth:=true use_rviz:=true]
# 说明: 推荐用 functions.zsh 里的 rm65_camera_ros2 [color|depth] [rviz]，本脚本是不依赖
#       zsh 的等价 bash 入口。
set -e

WS_MAIN="$(cd "$(dirname "$0")" && pwd)"
WS_RS="$WS_MAIN/src/sensor/realsense/realsense_ws"
WS_OB="$WS_MAIN/src/sensor/OrbbecSDK_ROS2"
STOP_STREAMING="$WS_MAIN/src/camera_stream/scripts/stop_streaming.sh"

# ROS2 相机节点与推流进程都独占 USB 设备，先停掉弃用的 RTSP 推流再启动，避免设备冲突。
if [ -x "$STOP_STREAMING" ]; then
  bash "$STOP_STREAMING" >/dev/null 2>&1 || true
fi

# 依次 source：ROS → Orbbec overlay → RealSense overlay(可选) → 主工作区。
source /opt/ros/humble/setup.bash
[ -r "$WS_OB/install/setup.bash" ] && source "$WS_OB/install/setup.bash"
# realsense_ws 是 git 子模块；未初始化/未构建时跳过，下面会自动降级 use_realsense:=false。
[ -r "$WS_RS/install/setup.bash" ] && source "$WS_RS/install/setup.bash"
[ -r "$WS_MAIN/install/setup.bash" ] && source "$WS_MAIN/install/setup.bash"

export ROS_DOMAIN_ID="${ROS_DOMAIN_ID:-0}"
export ROS_LOCALHOST_ONLY="${ROS_LOCALHOST_ONLY:-0}"
# Orbbec/RealSense overlay 在宿主机、标定在 Docker，Fast DDS 共享内存 ABI 可能不同，
# 强制 UDP 保证 Image 数据互通。
export FASTDDS_BUILTIN_TRANSPORTS="${FASTDDS_BUILTIN_TRANSPORTS:-UDPv4}"

# 缺少 realsense2_camera（子模块未构建）时降级为仅 Orbbec，避免整个 launch 失败。
if ! ros2 pkg prefix realsense2_camera >/dev/null 2>&1; then
  echo "[start_sensors] realsense2_camera 未构建，降级 use_realsense:=false（仅三路 Orbbec）" >&2
  set -- "$@" use_realsense:=false
fi

echo "=== 启动 ROS2 相机节点 (Orbbec x3 + RealSense D435) ==="
exec ros2 launch sensor_bringup cameras_ros2.launch.py "$@"
