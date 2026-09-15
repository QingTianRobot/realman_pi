#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_ROOT="$ROOT/third_party/behavior_tree_cpp"
BT_BUILD_DIR="${BT_BUILD_DIR:-$VENDOR_ROOT/build}"
BT_SERVER_BIN="${BT_SERVER_BIN:-$BT_BUILD_DIR/bin/bt_server}"
BT_SERVER_HOST="${BT_SERVER_HOST:-127.0.0.1}"
BT_SERVER_PORT="${BT_SERVER_PORT:-8080}"
BT_EDITOR_HOST="${BT_EDITOR_HOST:-127.0.0.1}"
BT_EDITOR_PORT="${BT_EDITOR_PORT:-5173}"
ARM_ID="${1:-${REALMAN_BT_ARM_ID:-r}}"
DRY_RUN="${REALMAN_BT_DRY_RUN:-true}"
TEST_MODE="${RM65_DRY_RUN:-0}"
WORKSPACE="${BT_TREE_WORKSPACE:-$(mktemp -d "${TMPDIR:-/tmp}/realman-bt-workspace.XXXXXX")}"
TREE_SOURCE="$ROOT/config/behavior-trees/arm_move.xml"

SERVER_PID=""
EDITOR_PID=""
ROS_PID=""

say() { printf 'rm65 bt: %s\n' "$*"; }
need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { printf 'rm65 bt: missing required command: %s\n' "$1" >&2; exit 1; }
}

cleanup() {
  local status=$?
  for pid in "$ROS_PID" "$EDITOR_PID" "$SERVER_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" >/dev/null 2>&1 || true
    fi
  done
  if [[ -z "${BT_TREE_WORKSPACE:-}" && -d "$WORKSPACE" ]]; then
    rm -rf "$WORKSPACE"
  fi
  exit "$status"
}
trap cleanup EXIT INT TERM

if [[ "$DRY_RUN" != "true" && "$DRY_RUN" != "false" ]]; then
  printf 'rm65 bt: REALMAN_BT_DRY_RUN must be true or false\n' >&2
  exit 2
fi

mkdir -p "$WORKSPACE"
cp "$TREE_SOURCE" "$WORKSPACE/arm_move.xml"

if [[ "$TEST_MODE" == "1" ]]; then
  say "preview workspace: $WORKSPACE/arm_move.xml"
  say "build bt_server in $BT_BUILD_DIR"
  say "start bt_server http://$BT_SERVER_HOST:$BT_SERVER_PORT"
  say "start editor http://$BT_EDITOR_HOST:$BT_EDITOR_PORT/?tree=arm_move.xml"
  say "ros2 launch realman_bt arm_move.launch.py arm_id:=$ARM_ID dry_run:=$DRY_RUN tree_file:=$WORKSPACE/arm_move.xml"
  exit 0
fi

need_cmd cmake
need_cmd curl
need_cmd npm
need_cmd ros2

if [[ "$DRY_RUN" == "false" ]]; then
  cat >&2 <<'EOF'
rm65 bt: WARNING: real motion is enabled (REALMAN_BT_DRY_RUN=false).
  Clear the robot workspace, use low speed, keep the emergency stop reachable,
  and confirm the target joint values before continuing.
EOF
fi

if [[ ! -x "$BT_SERVER_BIN" ]]; then
  say "building preview server"
  cmake -S "$VENDOR_ROOT" -B "$BT_BUILD_DIR" -DBT_BUILD_NODES=OFF -DBT_BUILD_SERVER=ON -DBT_BUILD_TESTS=OFF -DBT_BUILD_EXAMPLES=OFF
  cmake --build "$BT_BUILD_DIR" --target bt_server
fi

wait_http() {
  local url="$1" pid="$2"
  for _ in {1..100}; do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    kill -0 "$pid" >/dev/null 2>&1 || return 1
    sleep 0.1
  done
  return 1
}

BT_TREE_WORKSPACE="$WORKSPACE" "$BT_SERVER_BIN" "$BT_SERVER_HOST" "$BT_SERVER_PORT" &
SERVER_PID=$!
wait_http "http://$BT_SERVER_HOST:$BT_SERVER_PORT/api/health" "$SERVER_PID" || { say "bt_server failed to become ready" >&2; exit 1; }

pushd "$VENDOR_ROOT/bt_editor" >/dev/null
if [[ ! -d node_modules ]]; then npm install; fi
BT_BACKEND_URL="http://$BT_SERVER_HOST:$BT_SERVER_PORT" npm run dev -- --host "$BT_EDITOR_HOST" --port "$BT_EDITOR_PORT" &
EDITOR_PID=$!
popd >/dev/null
wait_http "http://$BT_EDITOR_HOST:$BT_EDITOR_PORT/" "$EDITOR_PID" || {
  say "bt_editor failed to become ready" >&2
  exit 1
}

say "preview backend: http://$BT_SERVER_HOST:$BT_SERVER_PORT"
say "editor: http://$BT_EDITOR_HOST:$BT_EDITOR_PORT/?tree=arm_move.xml"

ros2 launch realman_bt arm_move.launch.py \
  arm_id:="$ARM_ID" dry_run:="$DRY_RUN" tree_file:="$WORKSPACE/arm_move.xml" &
ROS_PID=$!
wait "$ROS_PID"
