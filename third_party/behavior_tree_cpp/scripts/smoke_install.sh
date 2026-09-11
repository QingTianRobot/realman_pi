#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SMOKE_ROOT="${BT_INSTALL_SMOKE_ROOT:-$REPO_ROOT/.codex/tmp}"

# shellcheck source=install_smoke_loader_path.sh
source "$SCRIPT_DIR/install_smoke_loader_path.sh"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[install-smoke] missing required command: $1" >&2
    exit 1
  fi
}

need_cmd cmake
need_cmd mktemp

mkdir -p "$SMOKE_ROOT"
WORK_DIR="$(mktemp -d "$SMOKE_ROOT/bt install smoke.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT

PRODUCER_BUILD="$WORK_DIR/producer build"
INSTALL_PREFIX="$WORK_DIR/install prefix"
CONSUMER_BUILD="$WORK_DIR/consumer build"

echo "[install-smoke] stage 1/5: configure Release producer"
cmake -S "$REPO_ROOT" -B "$PRODUCER_BUILD" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX="$INSTALL_PREFIX" \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=OFF \
  -DBT_BUILD_ROS2=OFF \
  -DBT_BUILD_TESTS=OFF \
  -DBT_BUILD_EXAMPLES=OFF

echo "[install-smoke] stage 2/5: build and install producer"
cmake --build "$PRODUCER_BUILD" --config Release --target install --parallel

echo "[install-smoke] stage 3/5: configure external Release consumer"
cmake -S "$REPO_ROOT/tests/install_consumer" -B "$CONSUMER_BUILD" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_PREFIX_PATH="$INSTALL_PREFIX"

echo "[install-smoke] stage 4/5: build external consumer"
cmake --build "$CONSUMER_BUILD" --config Release --parallel

PATHS_FILE="$CONSUMER_BUILD/install_consumer_paths-Release.txt"
if [[ ! -f "$PATHS_FILE" ]]; then
  echo "[install-smoke] generated target-path file not found: $PATHS_FILE" >&2
  exit 1
fi

consumer_executable=""
plugin_path=""
runtime_dirs=()
while IFS='=' read -r key value; do
  case "$key" in
    executable) consumer_executable="$value" ;;
    plugin) plugin_path="$value" ;;
    runtime_dir) runtime_dirs+=("$value") ;;
  esac
done < "$PATHS_FILE"

if [[ ! -x "$consumer_executable" ]]; then
  echo "[install-smoke] generated consumer path is not executable: $consumer_executable" >&2
  exit 1
fi
if [[ ! -f "$plugin_path" ]]; then
  echo "[install-smoke] generated plugin path is not a file: $plugin_path" >&2
  exit 1
fi

platform="$(uname -s)"
case "$platform" in
  Darwin)
    existing_path="${DYLD_LIBRARY_PATH:-}"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    existing_path="${PATH:-}"
    ;;
  *)
    existing_path="${LD_LIBRARY_PATH:-}"
    ;;
esac

bt_install_smoke_prepare_loader \
  "$platform" \
  "$existing_path" \
  "${runtime_dirs[@]}"

echo "[install-smoke] stage 5/5: run installed plugin consumer"
env "${BT_INSTALL_SMOKE_LOADER_VARIABLE}=${BT_INSTALL_SMOKE_RUNTIME_PATH}" \
  "$consumer_executable" "$plugin_path"

echo "[install-smoke] result: SUCCESS"
