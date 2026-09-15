#!/usr/bin/env bash
set -euo pipefail

# This is intentionally invoked through `docker compose exec` after the
# long-lived driver launch is ready. It never starts automatically with `up`.
: "${BT_AUTOSTART:=false}"
: "${REALMAN_BT_ARM_ID:=r}"
: "${REALMAN_BT_DRY_RUN:=true}"
: "${BT_ACTION_TIMEOUT_SEC:=30}"
: "${BT_ACTION_POLL_SEC:=1}"
: "${BT_SERVER_HOST:=0.0.0.0}"
: "${BT_SERVER_PORT:=8080}"
: "${BT_EDITOR_DIST:=/opt/rm65_ws/behavior_tree/editor-dist}"
: "${BT_SERVER_BIN:=/opt/rm65_ws/behavior_tree/bin/bt_server}"
: "${BT_TREE_FILE:=/opt/rm65_ws/config/behavior-trees/arm_move.xml}"
: "${BT_TREE_WORKSPACE:=/tmp/realman-bt-workspace}"

if [[ "${BT_AUTOSTART,,}" != "true" && "${BT_AUTOSTART}" != "1" ]]; then
  echo "[bt-start] disabled (set BT_AUTOSTART=true to start behavior tree)" >&2
  exit 0
fi

source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash

action_name="/${REALMAN_BT_ARM_ID}/execute_motion"
deadline=$((SECONDS + BT_ACTION_TIMEOUT_SEC))
echo "[bt-start] waiting for ${action_name} (timeout ${BT_ACTION_TIMEOUT_SEC}s)"
until ros2 action info "$action_name" 2>/dev/null | grep -Eq 'Action servers:[[:space:]]*[1-9][0-9]*'; do
  if (( SECONDS >= deadline )); then
    echo "[bt-start] Action ${action_name} is not ready; behavior tree not started" >&2
    exit 1
  fi
  sleep "$BT_ACTION_POLL_SEC"
done

if [[ ! -x "$BT_SERVER_BIN" ]]; then
  echo "[bt-start] bt_server not found: $BT_SERVER_BIN" >&2
  exit 1
fi
if [[ ! -f "$BT_TREE_FILE" ]]; then
  echo "[bt-start] behavior-tree XML not found: $BT_TREE_FILE" >&2
  exit 1
fi
if [[ ! -f "$BT_EDITOR_DIST/index.html" ]]; then
  echo "[bt-start] editor assets not found: $BT_EDITOR_DIST/index.html" >&2
  exit 1
fi

case "$BT_TREE_WORKSPACE" in
  /tmp/realman-bt-workspace*) ;;
  *)
    echo "[bt-start] BT_TREE_WORKSPACE must remain under /tmp/realman-bt-workspace" >&2
    exit 2
    ;;
esac

rm -rf "$BT_TREE_WORKSPACE"
mkdir -p "$BT_TREE_WORKSPACE"
cp "$BT_TREE_FILE" "$BT_TREE_WORKSPACE/arm_move.xml"
runtime_tree_file="$BT_TREE_WORKSPACE/arm_move.xml"

server_pid=""
executor_pid=""
cleanup() {
  local status=$?
  trap - EXIT INT TERM
  if [[ -n "$executor_pid" ]] && kill -0 "$executor_pid" 2>/dev/null; then
    kill -TERM "$executor_pid" 2>/dev/null || true
    wait "$executor_pid" 2>/dev/null || true
  fi
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill -TERM "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  rm -rf "$BT_TREE_WORKSPACE"
  exit "$status"
}
trap cleanup EXIT INT TERM

if [[ "${REALMAN_BT_DRY_RUN,,}" == "false" || "${REALMAN_BT_DRY_RUN}" == "0" ]]; then
  echo "[bt-start] REAL MOTION ENABLED: clear workspace, use low speed, keep E-stop reachable, confirm target joints" >&2
fi

echo "[bt-start] starting preview server at http://${BT_SERVER_HOST}:${BT_SERVER_PORT}"
BT_TREE_WORKSPACE="$BT_TREE_WORKSPACE" BT_EDITOR_DIST="$BT_EDITOR_DIST" \
  "$BT_SERVER_BIN" "$BT_SERVER_HOST" "$BT_SERVER_PORT" &
server_pid=$!

for _ in {1..100}; do
  if curl -fsS "http://127.0.0.1:${BT_SERVER_PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "[bt-start] bt_server exited before becoming ready" >&2
    exit 1
  fi
  sleep 0.1
done

if ! curl -fsS "http://127.0.0.1:${BT_SERVER_PORT}/api/health" >/dev/null 2>&1; then
  echo "[bt-start] bt_server did not become ready" >&2
  exit 1
fi

echo "[bt-start] starting ROS executor for arm ${REALMAN_BT_ARM_ID} (dry_run=${REALMAN_BT_DRY_RUN})"
ros2 launch realman_bt arm_move.launch.py \
  arm_id:="$REALMAN_BT_ARM_ID" \
  dry_run:="$REALMAN_BT_DRY_RUN" \
  tree_file:="$runtime_tree_file" &
executor_pid=$!

echo "[bt-start] editor: http://<host>:${BT_SERVER_PORT}/?tree=arm_move.xml"
echo "[bt-start] press Ctrl-C to stop behavior-tree processes (driver continues)"
wait "$executor_pid"
