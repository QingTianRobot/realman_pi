#!/usr/bin/env bash
# 停止相机推流相关进程（mediamtx + 配置中的推流进程 + ROS2 桥）。
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

stop_matching() {
  local pattern="$1"
  local label="$2"
  local pids remaining

  pids="$(pgrep -f "$pattern" 2>/dev/null || true)"
  if [ -z "$pids" ]; then
    return 0
  fi

  kill $pids 2>/dev/null || true
  for _ in $(seq 1 30); do
    remaining="$(pgrep -f "$pattern" 2>/dev/null || true)"
    [ -z "$remaining" ] && break
    sleep 0.1
  done

  if [ -n "$remaining" ]; then
    echo "$remaining" | xargs -r kill -KILL 2>/dev/null || true
    echo "已强制停止 $label（SDK 进程未响应 SIGTERM）"
  else
    echo "已停 $label"
  fi
}

# 方括号避免 pgrep 将当前匹配命令自身计入结果；等待 SDK 释放 USB 后再返回。
stop_matching '[c]amera_stream\.orbbec_stream' 'orbbec_stream'
stop_matching '[c]amera_stream\.realsense_stream' 'realsense_stream'
stop_matching '[c]amera_stream\.ros2_bridge' 'ros2_bridge'
stop_matching "$ROOT/bin/mediamtx" 'mediamtx'

echo "完成。"
