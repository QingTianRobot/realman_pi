#!/usr/bin/env bash
# 启动 mediamtx(RTSP) + YAML 中配置的相机推流进程（错峰）。可选启动 ROS2 CameraInfo/TF 桥。
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT/bin"
LOGDIR="$ROOT/log"
mkdir -p "$LOGDIR"

PY="${PY:-python3}"

# ---------- 1. 确保 mediamtx 存在（不存在则尝试自动下载） ----------
MEDIAMTX="$BIN/mediamtx"
if [ ! -x "$MEDIAMTX" ]; then
  echo "[start] 未找到 $MEDIAMTX，尝试下载 mediamtx ..."
  mkdir -p "$BIN"
  if command -v curl >/dev/null 2>&1; then
    TAG="$(curl -s https://api.github.com/repos/bluenviron/mediamtx/releases/latest \
      | grep -oP '"tag_name":\s*"\K[^"]+' || true)"
    if [ -n "$TAG" ]; then
      URL="https://github.com/bluenviron/mediamtx/releases/download/${TAG}/mediamtx_${TAG}_linux_amd64.tar.gz"
      if curl -fsSL "$URL" -o /tmp/mediamtx.tar.gz; then
        tar xzf /tmp/mediamtx.tar.gz -C "$BIN" mediamtx 2>/dev/null || tar xzf /tmp/mediamtx.tar.gz -C "$BIN"
        chmod +x "$MEDIAMTX" 2>/dev/null || true
        rm -f /tmp/mediamtx.tar.gz
        echo "[start] mediamtx 下载完成: $MEDIAMTX"
      fi
    fi
  fi
  if [ ! -x "$MEDIAMTX" ]; then
    echo "[start] 自动下载失败。请手动下载 mediamtx 到 $MEDIAMTX："
    echo "        https://github.com/bluenviron/mediamtx/releases/latest"
    echo "        解压出 mediamtx 单文件放入 $BIN/ 后重新运行。"
    exit 1
  fi
fi

# ---------- 2. 启动 mediamtx ----------
if pgrep -f "$MEDIAMTX" >/dev/null 2>&1; then
  echo "[start] mediamtx 已在运行"
else
  nohup "$MEDIAMTX" "$ROOT/config/mediamtx.yml" >"$LOGDIR/mediamtx.log" 2>&1 &
  echo "[start] mediamtx 启动 pid=$!"
fi

# 等待 RTSP 端口就绪
for i in $(seq 1 20); do
  if (exec 3<>/dev/tcp/127.0.0.1/8554) 2>/dev/null; then exec 3>&- 3<&-; break; fi
  sleep 0.3
done

# ---------- 3. 启动相机推流进程（Orbbec 各 side 先、RealSense 后，错峰） ----------
cd "$ROOT"

# Orbbec 各 side（配置里 serial 为空的 side 会自动跳过）。从 YAML 读取 side，
# 这样新增第三台/第四台相机时不需要再改这个脚本。
ORBBEC_CONFIG="${RM65_CAMERA_ORBBEC_CONFIG:-config/orbbec.yaml}"
ORBBEC_SIDES="$($PY - "$ORBBEC_CONFIG" <<'PY'
import sys
import yaml

with open(sys.argv[1], encoding="utf-8") as stream:
    cameras = (yaml.safe_load(stream) or {}).get("cameras", {})
for side in cameras:
    print(side)
PY
)"
while IFS= read -r SIDE; do
  [ -n "$SIDE" ] || continue
  nohup "$PY" -m camera_stream.orbbec_stream "$ORBBEC_CONFIG" --side "$SIDE" \
    >"$LOGDIR/orbbec_${SIDE}.log" 2>&1 &
  echo "[start] orbbec[$SIDE] pid=$!"
  sleep 2
done <<< "$ORBBEC_SIDES"

REALSENSE_CONFIG="${RM65_CAMERA_REALSENSE_CONFIG:-config/realsense.yaml}"
nohup "$PY" -m camera_stream.realsense_stream "$REALSENSE_CONFIG" \
  >"$LOGDIR/realsense_stream.log" 2>&1 &
echo "[start] realsense_stream pid=$!"

# ---------- 4. 可选：ROS2 CameraInfo/TF 桥 ----------
if command -v ros2 >/dev/null 2>&1; then
  CALIBRATION_CONFIG="${RM65_CAMERA_CALIBRATION_CONFIG:-config/camera_calibration.yaml}"
  nohup "$PY" -m camera_stream.ros2_bridge "$CALIBRATION_CONFIG" \
    >"$LOGDIR/ros2_bridge.log" 2>&1 &
  echo "[start] ros2_bridge pid=$!"
else
  echo "[start] 未检测到 ros2，跳过 ros2_bridge"
fi

echo
echo "推流地址（消费端用 <本机IP> 替换）："
echo "  彩色:  rtsp://<本机IP>:8554/realsense/color"
echo "  彩色:  rtsp://<本机IP>:8554/orbbec/left/color"
echo "  彩色:  rtsp://<本机IP>:8554/orbbec/middle/color"
echo "  彩色:  rtsp://<本机IP>:8554/orbbec/right/color"
echo "  深度:  TCP <本机IP>:8100 (realsense) / :8101 (orbbec left) / :8102 (orbbec middle) / :8103 (orbbec right)"
echo "日志目录: $LOGDIR"
echo "停止: $ROOT/scripts/stop_streaming.sh"
