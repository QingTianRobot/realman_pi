#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT/docker-compose.yml"
SELECTOR="${1:-${REALMAN_BT_ARM_ID:-r}}"
DRY_RUN="${REALMAN_BT_DRY_RUN:-true}"
BT_PORT="${BT_SERVER_PORT:-8080}"
BT_PUBLIC_HOST="${BT_PUBLIC_HOST:-127.0.0.1}"
RM65_DRY_RUN="${RM65_DRY_RUN:-0}"
BT_EXIT_ON_TERMINAL="${BT_EXIT_ON_TERMINAL:-true}"
BT_RUNTIME_ARCHIVE_ROOT="${BT_RUNTIME_ARCHIVE_ROOT:-/opt/rm65_ws/logs/behavior-trees}"

case "$SELECTOR" in
  l|m|r)
    ARM_ID="$SELECTOR"
    BT_TREE_FILE="/opt/rm65_ws/config/behavior-trees/arm_move.xml"
    BT_REQUIRED_ARMS="$SELECTOR"
    BT_LAUNCH_FILE="arm_move.launch.py"
    BT_STOP_ON_TERMINAL="true"
    ;;
  three)
    ARM_ID="r"
    BT_TREE_FILE="/opt/rm65_ws/config/behavior-trees/three_arm_staged_move.xml"
    BT_REQUIRED_ARMS="l,m,r"
    BT_LAUNCH_FILE="arm_move.launch.py"
    BT_STOP_ON_TERMINAL="true"
    ;;
  control)
    ARM_ID="r"
    BT_TREE_FILE="/opt/rm65_ws/config/behavior-trees/control_router.xml"
    BT_REQUIRED_ARMS="l,m,r"
    BT_LAUNCH_FILE="control_router.launch.py"
    BT_STOP_ON_TERMINAL="false"
    BT_EXIT_ON_TERMINAL="false"
    ;;
  *) printf 'rm65 bt: selector must be l, m, r, three, or control (got %s)\n' "$SELECTOR" >&2; exit 2 ;;
esac
case "$DRY_RUN" in
  true|false) ;;
  *) printf 'rm65 bt: REALMAN_BT_DRY_RUN must be true or false\n' >&2; exit 2 ;;
esac
case "$BT_EXIT_ON_TERMINAL" in
  true|false) ;;
  *) printf 'rm65 bt: BT_EXIT_ON_TERMINAL must be true or false\n' >&2; exit 2 ;;
esac

say() { printf 'rm65 bt: %s\n' "$*"; }
compose() { docker compose -f "$COMPOSE_FILE" "$@"; }
run() {
  if [[ "$RM65_DRY_RUN" == "1" ]]; then
    printf '+ '
    printf '%q ' "$@"
    printf '\n'
  else
    "$@"
  fi
}

if [[ "$DRY_RUN" == "false" ]]; then
  cat >&2 <<'EOF'
rm65 bt: WARNING: real motion is enabled (REALMAN_BT_DRY_RUN=false).
  Clear the robot workspace, use low speed, keep the emergency stop reachable,
  and confirm the target joint values before continuing.
EOF
fi

say "monitor: http://${BT_PUBLIC_HOST}:${BT_PORT}/"
say "behavior tree runs inside the realman_bringup_remote driver container"

if [[ "$RM65_DRY_RUN" == "1" ]]; then
  run docker compose -f "$COMPOSE_FILE" ps -q realman_bringup_remote
  container_id="dry-run"
else
  container_id="$(compose ps -q realman_bringup_remote)"
  if [[ -z "$container_id" ]]; then
    printf 'rm65 bt: realman_bringup_remote is not running; run ./rm65 up first\n' >&2
    exit 1
  fi
  if [[ "$(docker inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)" != "true" ]]; then
    printf 'rm65 bt: realman_bringup_remote is not running; run ./rm65 up first\n' >&2
    exit 1
  fi
fi

exec_args=(
  docker compose -f "$COMPOSE_FILE" exec -T
  -e BT_AUTOSTART=true
  -e "REALMAN_BT_ARM_ID=$ARM_ID"
  -e "REALMAN_BT_DRY_RUN=$DRY_RUN"
  -e "BT_TREE_FILE=$BT_TREE_FILE"
  -e "BT_REQUIRED_ARMS=$BT_REQUIRED_ARMS"
  -e "BT_LAUNCH_FILE=$BT_LAUNCH_FILE"
  -e "BT_STOP_ON_TERMINAL=$BT_STOP_ON_TERMINAL"
  -e "BT_SERVER_HOST=${BT_SERVER_HOST:-0.0.0.0}"
  -e "BT_SERVER_PORT=$BT_PORT"
  -e BT_READ_ONLY=true
  -e BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json
  -e "BT_EXIT_ON_TERMINAL=$BT_EXIT_ON_TERMINAL"
  -e "BT_RUNTIME_ARCHIVE_ROOT=$BT_RUNTIME_ARCHIVE_ROOT"
  realman_bringup_remote /usr/local/bin/bt-start
)

if [[ "$RM65_DRY_RUN" == "1" ]]; then
  run "${exec_args[@]}"
  exit 0
fi

say "waiting for /${ARM_ID}/execute_motion and starting behavior tree"
# Compose exec -T does not proxy terminal signals to its remote process. Give
# this invocation an identity and signal only its registered wrapper in the
# already-resolved container (never a process-name or shared-lock PID match).
client_workspace="$(mktemp -d "${TMPDIR:-/tmp}/rm65-bt-client.XXXXXXXX")"
client_token="${client_workspace##*/}"
trap 'rmdir "$client_workspace"' EXIT
exec_args=("${exec_args[@]:0:${#exec_args[@]}-2}" -e "BT_CLIENT_TOKEN=$client_token" "${exec_args[@]: -2}")
forward_interrupt() {
  local status="$1"
  trap '' INT TERM
  docker exec "$container_id" bash -c '
    control="/tmp/realman-bt-client.$1"
    # Remember interruption even if bt-start has not installed its trap yet.
    touch "$control.stop"
  ' -- "$client_token" || true
  # Ask the persistent executor to halt its tree while ROS is still spinning.
  # This gives accepted MoveJ goals a chance to submit cancellation requests;
  # killing the launch process first can destroy that ownership too early.
  docker exec "$container_id" bash -lc '
    source /opt/ros/humble/setup.bash
    source /opt/rm65_ws/install/setup.bash
    timeout 3s ros2 service call /realman_bt_executor/stop std_srvs/srv/Trigger "{}"
  ' >/dev/null 2>&1 || true
  local deadline=$((SECONDS + 10))
  local pending=""
  while (( SECONDS < deadline )); do
    pending="$(docker exec "$container_id" python3 -c '
import json
from pathlib import Path
path = Path("/tmp/realman-bt-workspace/runtime.json")
try:
    print(json.loads(path.read_text()).get("pending_cancellations", -1))
except (OSError, ValueError, TypeError):
    print(-1)
' 2>/dev/null || true)"
    if [[ "$pending" == "0" ]]; then
      break
    fi
    sleep 0.1
  done
  if [[ "$pending" != "0" ]]; then
    printf 'rm65 bt: cancellation drain did not clear before forced shutdown\n' >&2
  fi
  docker exec "$container_id" bash -c '
    control="/tmp/realman-bt-client.$1"
    if [[ -r "$control.pid" ]]; then
      read -r pid < "$control.pid"
      if [[ "$pid" =~ ^[0-9]+$ ]] &&
          grep -zFxq "BT_CLIENT_TOKEN=$1" "/proc/$pid/environ" 2>/dev/null; then
        kill -TERM "$pid" 2>/dev/null || true
      fi
    fi
  ' -- "$client_token" || true
  wait "$compose_pid" 2>/dev/null || true
  exit "$status"
}
trap 'forward_interrupt 130' INT
trap 'forward_interrupt 143' TERM
"${exec_args[@]}" <&0 &
compose_pid=$!
wait "$compose_pid"
