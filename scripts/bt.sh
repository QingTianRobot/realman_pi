#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SELECTOR="${1:-${REALMAN_BT_ARM_ID:-r}}"
DRY_RUN="${REALMAN_BT_DRY_RUN:-true}"
BT_PORT="${BT_SERVER_PORT:-8080}"
BT_PUBLIC_HOST="${BT_PUBLIC_HOST:-127.0.0.1}"
RM65_DRY_RUN="${RM65_DRY_RUN:-0}"
BT_EXIT_ON_TERMINAL_OVERRIDE="${BT_EXIT_ON_TERMINAL:-}"
BT_RUNTIME_ARCHIVE_ROOT="${BT_RUNTIME_ARCHIVE_ROOT:-/opt/rm65_ws/logs/behavior-trees}"

if (( $# > 1 )); then
  printf 'rm65 bt: expected one tree name (got %s arguments)\n' "$#" >&2
  exit 2
fi

TREE_NAME=""
BT_ARM_ID_OVERRIDE="${REALMAN_BT_ARM_ID:-}"
BT_REQUIRED_ARMS_OVERRIDE=""
case "$SELECTOR" in
  l|m|r)
    TREE_NAME="move.xml"
    BT_ARM_ID_OVERRIDE="$SELECTOR"
    BT_REQUIRED_ARMS_OVERRIDE="$SELECTOR"
    ;;
  three)
    TREE_NAME="three.xml"
    ;;
  control)
    TREE_NAME="control.xml"
    ;;
  arm_move|arm_move.xml)
    TREE_NAME="move.xml"
    ;;
  three_arm_staged_move|three_arm_staged_move.xml)
    TREE_NAME="three.xml"
    ;;
  control_router|control_router.xml)
    TREE_NAME="control.xml"
    ;;
  *.xml)
    TREE_NAME="$SELECTOR"
    ;;
  *)
    TREE_NAME="$SELECTOR.xml"
    ;;
esac

if [[ ! "$TREE_NAME" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*\.xml$ ]]; then
  printf 'rm65 bt: tree name must be a simple XML filename (got %s)\n' "$SELECTOR" >&2
  exit 2
fi
if [[ ! -f "$ROOT/config/behavior-trees/$TREE_NAME" ]]; then
  printf 'rm65 bt: behavior-tree XML not found: config/behavior-trees/%s\n' "$TREE_NAME" >&2
  exit 1
fi
BT_TREE_FILE="/opt/rm65_ws/config/behavior-trees/$TREE_NAME"
case "$DRY_RUN" in
  true|false) ;;
  *) printf 'rm65 bt: REALMAN_BT_DRY_RUN must be true or false\n' >&2; exit 2 ;;
esac
if [[ -n "$BT_EXIT_ON_TERMINAL_OVERRIDE" ]]; then
  case "$BT_EXIT_ON_TERMINAL_OVERRIDE" in
    true|false) ;;
    *) printf 'rm65 bt: BT_EXIT_ON_TERMINAL must be true or false\n' >&2; exit 2 ;;
  esac
fi

say() { printf 'rm65 bt: %s\n' "$*"; }
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
  run docker ps \
    --filter label=com.docker.compose.service=realman_bringup_remote \
    --filter status=running \
    --format '{{.ID}}'
  container_id="dry-run"
else
  # Resolve the running container from Docker's service label instead of the
  # current Compose project. Production hosts may start bringup with
  # `docker compose run --rm` or another project name, but the container still
  # carries the authoritative service label.
  container_ids="$(docker ps \
    --filter label=com.docker.compose.service=realman_bringup_remote \
    --filter status=running \
    --format '{{.ID}}')" || {
      printf 'rm65 bt: unable to query Docker for a running realman_bringup_remote container\n' >&2
      exit 1
    }
  mapfile -t running_containers <<<"$container_ids"
  if [[ -z "$container_ids" || "${#running_containers[@]}" -ne 1 ]]; then
    if [[ -z "$container_ids" ]]; then
      printf 'rm65 bt: no running Docker container has service label realman_bringup_remote; start the bringup container first\n' >&2
    else
      printf 'rm65 bt: expected exactly one running realman_bringup_remote container, found %s\n' "${#running_containers[@]}" >&2
    fi
    exit 1
  fi
  container_id="${running_containers[0]}"
  if [[ "$(docker inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)" != "true" ]]; then
    printf 'rm65 bt: resolved realman_bringup_remote container is no longer running\n' >&2
    exit 1
  fi
fi

exec_args=(
  docker exec -i
  -e BT_AUTOSTART=true
  -e "BT_ARM_ID_OVERRIDE=$BT_ARM_ID_OVERRIDE"
  -e "REALMAN_BT_DRY_RUN=$DRY_RUN"
  -e "BT_TREE_FILE=$BT_TREE_FILE"
  -e "BT_REQUIRED_ARMS=$BT_REQUIRED_ARMS_OVERRIDE"
  -e BT_REQUIRED_ACTIONS=
  -e BT_LAUNCH_FILE=
  -e BT_STOP_ON_TERMINAL=
  -e "BT_EXIT_ON_TERMINAL=${BT_EXIT_ON_TERMINAL_OVERRIDE}"
  -e "BT_SERVER_HOST=${BT_SERVER_HOST:-0.0.0.0}"
  -e "BT_SERVER_PORT=$BT_PORT"
  -e BT_READ_ONLY=true
  -e BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json
  -e "BT_RUNTIME_ARCHIVE_ROOT=$BT_RUNTIME_ARCHIVE_ROOT"
  "$container_id" /usr/local/bin/bt-start
)

if [[ "$RM65_DRY_RUN" == "1" ]]; then
  run "${exec_args[@]}"
  exit 0
fi

say "loading ${TREE_NAME}; waiting for Action servers declared by the XML"
# Give this invocation an identity and signal only its registered wrapper in
# the already-resolved container (never a process-name or shared-lock PID
# match).
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
  wait "$exec_pid" 2>/dev/null || true
  exit "$status"
}
trap 'forward_interrupt 130' INT
trap 'forward_interrupt 143' TERM
"${exec_args[@]}" <&0 &
exec_pid=$!
wait "$exec_pid"
