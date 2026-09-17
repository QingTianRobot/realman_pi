#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="${BT_BUILD_DIR:-$REPO_ROOT/build}"
SERVER_HOST="${BT_SERVER_HOST:-127.0.0.1}"
SERVER_PORT="${BT_SERVER_PORT:-8080}"
FRONTEND_HOST="${BT_EDITOR_HOST:-127.0.0.1}"
FRONTEND_PORT="${BT_EDITOR_PORT:-5173}"
SERVER_BIN="${BT_SERVER_BIN:-$BUILD_DIR/bin/bt_server}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[dev] missing required command: $1" >&2
    exit 1
  fi
}

find_plugin() {
  local candidates=(
    "$BUILD_DIR/lib/libbt_nodes.dylib"
    "$BUILD_DIR/lib/libbt_nodes.so"
    "$BUILD_DIR/lib/libbt_nodes.dll"
    "$BUILD_DIR/bin/bt_nodes.dll"
    "$BUILD_DIR/lib/"*bt_nodes*
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local pid="$3"
  local ready=0
  for _ in {1..100}; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      ready=1
      break
    fi
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      echo "[dev] $label exited before becoming ready" >&2
      return 1
    fi
    sleep 0.1
  done
  if [[ "$ready" != "1" ]]; then
    echo "[dev] $label did not become ready: $url" >&2
    return 1
  fi
}

need_cmd cmake
need_cmd npm
need_cmd curl

if [[ "$SERVER_PORT" != "8080" ]]; then
  echo "[dev] warning: bt_editor Vite proxy is configured for http://localhost:8080." >&2
  echo "[dev] warning: use BT_SERVER_PORT=8080 unless you also update bt_editor/vite.config.ts." >&2
fi

echo "[dev] building bt_server and bt_nodes"
cmake -S "$REPO_ROOT" -B "$BUILD_DIR" \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=ON \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=ON
cmake --build "$BUILD_DIR" --target bt_server bt_nodes

PLUGIN="${BT_NODES_PLUGIN:-$(find_plugin || true)}"
if [[ ! -x "$SERVER_BIN" ]]; then
  echo "[dev] bt_server not found or not executable: $SERVER_BIN" >&2
  exit 1
fi
if [[ -z "$PLUGIN" || ! -f "$PLUGIN" ]]; then
  echo "[dev] bt_nodes plugin not found under $BUILD_DIR/lib" >&2
  exit 1
fi

cd "$REPO_ROOT/bt_editor"
if [[ ! -d node_modules ]]; then
  echo "[dev] installing frontend dependencies"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
fi

SERVER_PID=""
FRONTEND_PID=""

cleanup() {
  local status=$?
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
    wait "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  return "$status"
}
trap cleanup EXIT INT TERM

echo "[dev] starting bt_server: http://$SERVER_HOST:$SERVER_PORT"
"$SERVER_BIN" "$SERVER_HOST" "$SERVER_PORT" "$PLUGIN" &
SERVER_PID=$!
wait_for_http "http://$SERVER_HOST:$SERVER_PORT/api/health" "bt_server" "$SERVER_PID"

echo "[dev] starting editor: http://$FRONTEND_HOST:$FRONTEND_PORT"
npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

cat <<EOF
[dev] running
  backend:  http://$SERVER_HOST:$SERVER_PORT
  frontend: http://$FRONTEND_HOST:$FRONTEND_PORT

Press Ctrl-C to stop both processes.
EOF

while true; do
  if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    wait "$SERVER_PID"
    exit $?
  fi
  if ! kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    wait "$FRONTEND_PID"
    exit $?
  fi
  sleep 1
done
