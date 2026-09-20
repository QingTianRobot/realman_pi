#!/usr/bin/env bash
# ROS 2's generated setup scripts read optional variables (for example
# AMENT_TRACE_SETUP_FILES) without guarding them against nounset.  Load the
# environments before enabling `set -u`, then keep strict mode for the actual
# behavior-tree launcher.
set -eo pipefail

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
: "${BT_TREE_FILE:=/opt/rm65_ws/config/behavior-trees/move.xml}"
: "${BT_ARM_ID_OVERRIDE:=}"
: "${BT_REQUIRED_ARMS:=}"
: "${BT_LAUNCH_FILE:=}"
: "${BT_TREE_WORKSPACE:=/tmp/realman-bt-workspace}"
: "${BT_READ_ONLY:=true}"
: "${BT_RUNTIME_SNAPSHOT:=$BT_TREE_WORKSPACE/runtime.json}"
: "${BT_STOP_ON_TERMINAL:=}"
: "${BT_EXIT_ON_TERMINAL:=}"
: "${BT_RUNTIME_ARCHIVE_ROOT:=${REALMAN_LOG_ROOT:-/opt/rm65_ws/logs}/behavior-trees}"
: "${BT_CLIENT_TOKEN:=}"
readonly BT_INSTANCE_LOCK=/tmp/realman-bt.lock

if [[ "${BT_AUTOSTART,,}" != "true" && "${BT_AUTOSTART}" != "1" ]]; then
  echo "[bt-start] disabled (set BT_AUTOSTART=true to start behavior tree)" >&2
  exit 0
fi

source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash
set -u

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

tree_metadata_script=/opt/rm65_ws/src/behavior/realman_bt/scripts/tree_metadata.py
if [[ ! -f "$tree_metadata_script" ]]; then
  echo "[bt-start] behavior-tree metadata reader not found: $tree_metadata_script" >&2
  exit 1
fi
if ! metadata="$(python3 "$tree_metadata_script" "$BT_TREE_FILE")"; then
  echo "[bt-start] invalid behavior-tree startup metadata" >&2
  exit 2
fi
IFS=$'\t' read -r metadata_arm_id metadata_required_arms metadata_launch_file \
  metadata_stop_on_terminal metadata_exit_on_terminal <<<"$metadata"
[[ -n "$BT_ARM_ID_OVERRIDE" ]] && metadata_arm_id="$BT_ARM_ID_OVERRIDE"
[[ -n "$BT_REQUIRED_ARMS" ]] && metadata_required_arms="$BT_REQUIRED_ARMS"
[[ -n "$BT_LAUNCH_FILE" ]] && metadata_launch_file="$BT_LAUNCH_FILE"
[[ -n "$BT_STOP_ON_TERMINAL" ]] && metadata_stop_on_terminal="$BT_STOP_ON_TERMINAL"
[[ -n "$BT_EXIT_ON_TERMINAL" ]] && metadata_exit_on_terminal="$BT_EXIT_ON_TERMINAL"
REALMAN_BT_ARM_ID="$metadata_arm_id"
BT_REQUIRED_ARMS="$metadata_required_arms"
BT_LAUNCH_FILE="$metadata_launch_file"
BT_STOP_ON_TERMINAL="$metadata_stop_on_terminal"
BT_EXIT_ON_TERMINAL="$metadata_exit_on_terminal"

case "$BT_TREE_WORKSPACE" in
  /tmp/realman-bt-workspace*) ;;
  *)
    echo "[bt-start] BT_TREE_WORKSPACE must remain under /tmp/realman-bt-workspace" >&2
    exit 2
    ;;
esac
case "$BT_LAUNCH_FILE" in
  arm_move.launch.py|control_router.launch.py) ;;
  *) echo "[bt-start] unsupported BT_LAUNCH_FILE: $BT_LAUNCH_FILE" >&2; exit 2 ;;
esac
case "$BT_STOP_ON_TERMINAL" in
  true|false) ;;
  *) echo "[bt-start] BT_STOP_ON_TERMINAL must be true or false" >&2; exit 2 ;;
esac
case "$BT_EXIT_ON_TERMINAL" in
  true|false) ;;
  *) echo "[bt-start] BT_EXIT_ON_TERMINAL must be true or false" >&2; exit 2 ;;
esac
if [[ -n "$BT_CLIENT_TOKEN" && ! "$BT_CLIENT_TOKEN" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "[bt-start] invalid BT_CLIENT_TOKEN" >&2
  exit 2
fi
exec 9>"$BT_INSTANCE_LOCK"
if ! flock -n 9; then
  echo "[bt-start] another behavior-tree run is active; wait for it to exit or stop it first" >&2
  exit 73
fi

rm -rf "$BT_TREE_WORKSPACE"
mkdir -p "$BT_TREE_WORKSPACE"
runtime_tree_file="$BT_TREE_WORKSPACE/$(basename "$BT_TREE_FILE")"
cp "$BT_TREE_FILE" "$runtime_tree_file"
run_id="$(date +%Y%m%d_%H%M%S)_$$"

server_pid=""
executor_pid=""
client_control=""
archive_runtime() {
  local archive_dir="$BT_RUNTIME_ARCHIVE_ROOT/$run_id"
  if ! mkdir -p "$archive_dir"; then
    echo "[bt-start] cannot create runtime archive: $archive_dir" >&2
    return 74
  fi
  if ! cp "$runtime_tree_file" "$archive_dir/$(basename "$runtime_tree_file")"; then
    echo "[bt-start] cannot archive behavior-tree XML" >&2
    return 74
  fi
  if [[ ! -f "$BT_RUNTIME_SNAPSHOT" ]]; then
    echo "[bt-start] runtime snapshot was not produced: $BT_RUNTIME_SNAPSHOT" >&2
    return 74
  fi
  if ! cp "$BT_RUNTIME_SNAPSHOT" "$archive_dir/runtime.json"; then
    echo "[bt-start] cannot archive runtime snapshot" >&2
    return 74
  fi
  echo "[bt-start] archived final runtime snapshot: $archive_dir/runtime.json"
}
cleanup() {
  local status=$?
  local archive_status=0
  trap - EXIT INT TERM
  if [[ -n "$executor_pid" ]] && kill -0 "$executor_pid" 2>/dev/null; then
    # ros2 launch and its executor own this session. Signal both: terminating
    # only the launcher can orphan an executor that still holds the BT lock.
    kill -INT -- "-$executor_pid" 2>/dev/null || true
    wait "$executor_pid" 2>/dev/null || true
  fi
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill -TERM "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  archive_runtime || archive_status=$?
  rm -rf "$BT_TREE_WORKSPACE"
  if [[ -n "$client_control" ]]; then
    rm -f "$client_control.pid" "$client_control.stop"
  fi
  if (( status == 0 && archive_status != 0 )); then
    status=$archive_status
  fi
  exit "$status"
}
trap cleanup EXIT INT TERM
if [[ -n "$BT_CLIENT_TOKEN" ]]; then
  client_control="/tmp/realman-bt-client.$BT_CLIENT_TOKEN"
  printf '%s\n' "$$" > "$client_control.pid"
  if [[ -e "$client_control.stop" ]]; then
    exit 130
  fi
fi

if [[ "${REALMAN_BT_DRY_RUN,,}" == "false" || "${REALMAN_BT_DRY_RUN}" == "0" ]]; then
  echo "[bt-start] REAL MOTION ENABLED: clear workspace, use low speed, keep E-stop reachable, confirm target joints" >&2
fi

echo "[bt-start] starting read-only runtime monitor at http://${BT_SERVER_HOST}:${BT_SERVER_PORT}"
BT_READ_ONLY="$BT_READ_ONLY" BT_RUNTIME_SNAPSHOT="$BT_RUNTIME_SNAPSHOT" \
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

IFS="," read -r -a required_arms <<<"$BT_REQUIRED_ARMS"
for arm_id in "${required_arms[@]}"; do
  case "$arm_id" in l|m|r) ;; *) echo "[bt-start] invalid arm id: $arm_id" >&2; exit 2 ;; esac
  action_name="/${arm_id}/execute_motion"
  deadline=$((SECONDS + BT_ACTION_TIMEOUT_SEC))
  echo "[bt-start] waiting for ${action_name} (timeout ${BT_ACTION_TIMEOUT_SEC}s)"
  until ros2 action info "$action_name" 2>/dev/null | grep -Eq 'Action servers:[[:space:]]*[1-9][0-9]*'; do
    if (( SECONDS >= deadline )); then
      echo "[bt-start] Action ${action_name} is not ready; behavior tree not started" >&2
      exit 1
    fi
    sleep "$BT_ACTION_POLL_SEC"
  done
done

echo "[bt-start] starting ROS executor for arm ${REALMAN_BT_ARM_ID} (dry_run=${REALMAN_BT_DRY_RUN})"
setsid ros2 launch realman_bt "$BT_LAUNCH_FILE" \
  arm_id:="$REALMAN_BT_ARM_ID" \
  dry_run:="$REALMAN_BT_DRY_RUN" \
  tree_file:="$runtime_tree_file" \
  stop_on_terminal:="$BT_STOP_ON_TERMINAL" \
  exit_on_terminal:="$BT_EXIT_ON_TERMINAL" \
  runtime_snapshot_file:="$BT_RUNTIME_SNAPSHOT" &
  executor_pid=$!

echo "[bt-start] monitor: http://<host>:${BT_SERVER_PORT}/"
echo "[bt-start] press Ctrl-C to stop behavior-tree processes (driver continues)"
wait "$executor_pid"
executor_pid=""

if [[ "$BT_EXIT_ON_TERMINAL" == "true" ]]; then
  if ! terminal_result="$(/usr/local/libexec/bt-runtime-result "$BT_RUNTIME_SNAPSHOT")"; then
    echo "[bt-start] behavior-tree launch exited without a valid terminal result" >&2
    exit 1
  fi
  if [[ "$terminal_result" == "FAILURE" ]]; then
    echo "[bt-start] behavior tree reached FAILURE" >&2
    exit 1
  fi
fi
