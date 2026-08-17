#!/usr/bin/env bash
# 一键安装 camera_stream 运行依赖（免 sudo）。
#   1) pip 依赖（pyrealsense2 / av / lz4 ...）
#   2) pyorbbecsdk2 wheel（GitHub 官方发布，--no-deps 跳过 open3d/pygame 等重依赖）
#   3) mediamtx 单二进制（RTSP 服务）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="${PY:-python3}"

# Orbbec Python SDK 版本（pyorbbecsdk2）
ORBBEC_VER="v2.1.2"
ORBBEC_WHEEL="pyorbbecsdk2-2.1.2-cp310-cp310-manylinux_2_27_x86_64.whl"
ORBBEC_URL="https://github.com/orbbec/pyorbbecsdk/releases/download/${ORBBEC_VER}/${ORBBEC_WHEEL}"

echo "[deps] 1/3 安装 pip 依赖..."
"$PY" -m pip install --user -r "$ROOT/requirements.txt"

echo "[deps] 2/3 安装 pyorbbecsdk2 (--no-deps)..."
if ! "$PY" -c "import pyorbbecsdk" >/dev/null 2>&1; then
  TMP="$(mktemp -d)"
  curl -fSL "$ORBBEC_URL" -o "$TMP/$ORBBEC_WHEEL"
  "$PY" -m pip install --user --no-deps "$TMP/$ORBBEC_WHEEL"
  rm -rf "$TMP"
else
  echo "[deps] pyorbbecsdk 已安装，跳过"
fi

echo "[deps] 3/3 下载 mediamtx..."
BIN="$ROOT/bin"
mkdir -p "$BIN"
if [ ! -x "$BIN/mediamtx" ]; then
  TAG="$(curl -s https://api.github.com/repos/bluenviron/mediamtx/releases/latest \
    | grep -oP '"tag_name":\s*"\K[^"]+' || true)"
  if [ -n "$TAG" ]; then
    URL="https://github.com/bluenviron/mediamtx/releases/download/${TAG}/mediamtx_${TAG}_linux_amd64.tar.gz"
    curl -fSL "$URL" -o /tmp/mediamtx.tar.gz
    tar xzf /tmp/mediamtx.tar.gz -C "$BIN" mediamtx
    chmod +x "$BIN/mediamtx"
    rm -f /tmp/mediamtx.tar.gz
  fi
fi

echo
echo "依赖安装完成。验证："
"$PY" -c "import pyrealsense2, av, numpy; print('  pyrealsense2/av/numpy OK')"
echo "  pyorbbecsdk: $("$PY" -c 'from camera_stream.orbbec_stream import _preload_orbbec_sdk; _preload_orbbec_sdk(); import pyorbbecsdk as o; print(getattr(o,"__version__","?"))' 2>/dev/null || echo '检查失败')"
echo "  mediamtx: $([ -x "$BIN/mediamtx" ] && echo OK || echo 缺失)"
echo "下一步: $ROOT/scripts/start_streaming.sh"
