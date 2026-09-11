#!/usr/bin/env bash
#
# smoke_ros2.sh — 在隔离 ROS2 域中验证回充树的服务与单事件闭环
#
# @author pony
# @date 2026-07-12
# @version v2.0.2
# @last_modified 2026-07-13
# @changelog
#   - v2.0.2 (2026-07-13): 显式可靠订阅，配合发布端匹配门禁消除完成通知首包竞态
#   - v2.0.1 (2026-07-12): 增加进程组清理、空目录门禁、超时和域占用保护
#   - v2.0.0 (2026-07-12): 改为服务驱动、图状态轮询和单次回充事件验证
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ros2-smoke] missing required command: $1" >&2
    exit 1
  fi
}

if [[ -z "${ROS_DISTRO:-}" ]]; then
  if [[ ! -f /opt/ros/humble/setup.bash ]]; then
    echo "[ros2-smoke] ROS_DISTRO is unset and /opt/ros/humble/setup.bash is unavailable" >&2
    exit 1
  fi
  # shellcheck disable=SC1091
  set +u
  source /opt/ros/humble/setup.bash
  set -u
fi

need_cmd colcon
need_cmd find
need_cmd flock
need_cmd grep
need_cmd mktemp
need_cmd ros2
need_cmd setsid
need_cmd tail
need_cmd timeout

if [[ -n "${BT_ROS2_SMOKE_ROOT:-}" ]]; then
  SMOKE_ROOT="$BT_ROS2_SMOKE_ROOT"
  if [[ -e "$SMOKE_ROOT" && ! -d "$SMOKE_ROOT" ]]; then
    echo "[ros2-smoke] caller root is not a directory: $SMOKE_ROOT" >&2
    exit 1
  fi
  mkdir -p "$SMOKE_ROOT"
  if [[ -n "$(find "$SMOKE_ROOT" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    echo "[ros2-smoke] caller root must be empty: $SMOKE_ROOT" >&2
    exit 1
  fi
else
  SMOKE_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/bt_ros2_smoke.XXXXXX")"
fi
SMOKE_ROOT="$(cd "$SMOKE_ROOT" && pwd)"

BUILD_BASE="$SMOKE_ROOT/build"
INSTALL_BASE="$SMOKE_ROOT/install"
LOG_BASE="$SMOKE_ROOT/colcon_log"
ROS_HOME="$SMOKE_ROOT/ros_home"
ROS_LOG_DIR="$ROS_HOME/log"
mkdir -p "$ROS_LOG_DIR"

export ROS_HOME
export ROS_LOG_DIR
export ROS_DOMAIN_ID="${BT_ROS2_SMOKE_DOMAIN_ID:-${ROS_DOMAIN_ID:-$((100 + $$ % 100))}}"
export FASTDDS_BUILTIN_TRANSPORTS="${FASTDDS_BUILTIN_TRANSPORTS:-UDPv4}"
if [[ ! "$ROS_DOMAIN_ID" =~ ^[0-9]+$ ]] ||
  (( ROS_DOMAIN_ID < 0 || ROS_DOMAIN_ID > 232 )); then
  echo "[ros2-smoke] ROS_DOMAIN_ID must be an integer in 0..232: $ROS_DOMAIN_ID" >&2
  exit 1
fi

# 同机并行 smoke 必须独占域；flock 随进程退出自动释放，不留下陈旧锁。
DOMAIN_LOCK_FILE="${TMPDIR:-/tmp}/bt_ros2_smoke_domain_${ROS_DOMAIN_ID}.lock"
exec {DOMAIN_LOCK_FD}>"$DOMAIN_LOCK_FILE"
if ! flock -n "$DOMAIN_LOCK_FD"; then
  echo "[ros2-smoke] ROS_DOMAIN_ID=$ROS_DOMAIN_ID is reserved by another smoke run" >&2
  exit 1
fi

LAUNCH_LOG="$SMOKE_ROOT/launch.log"
COMMAND_LOG="$SMOKE_ROOT/command_echo.log"
DONE_LOG="$SMOKE_ROOT/done_echo.log"
STATUS_LOG="$SMOKE_ROOT/status_echo.log"
BATTERY_LOG="$SMOKE_ROOT/battery_pub.log"
DOCK_LOG="$SMOKE_ROOT/dock_pub.log"
START_FIRST_LOG="$SMOKE_ROOT/start_first.log"
START_SECOND_LOG="$SMOKE_ROOT/start_second.log"
STOP_FIRST_LOG="$SMOKE_ROOT/stop_first.log"
STOP_SECOND_LOG="$SMOKE_ROOT/stop_second.log"
RESTART_LOG="$SMOKE_ROOT/restart.log"
TERMINAL_STOP_FIRST_LOG="$SMOKE_ROOT/terminal_stop_first.log"
TERMINAL_STOP_SECOND_LOG="$SMOKE_ROOT/terminal_stop_second.log"
DOMAIN_PROBE_LOG="$SMOKE_ROOT/domain_probe.log"

for run_log in \
  "$LAUNCH_LOG" "$COMMAND_LOG" "$DONE_LOG" "$STATUS_LOG" \
  "$BATTERY_LOG" "$DOCK_LOG" "$START_FIRST_LOG" "$START_SECOND_LOG" \
  "$STOP_FIRST_LOG" "$STOP_SECOND_LOG" "$RESTART_LOG" \
  "$TERMINAL_STOP_FIRST_LOG" "$TERMINAL_STOP_SECOND_LOG" \
  "$DOMAIN_PROBE_LOG"; do
  : >"$run_log"
done

LAUNCH_PID=""
BACKGROUND_GROUPS=()

stop_background_processes() {
  local group
  local deadline
  local failed=0

  for group in "${BACKGROUND_GROUPS[@]}"; do
    if kill -0 -- "-$group" >/dev/null 2>&1; then
      kill -TERM -- "-$group" >/dev/null 2>&1 || true
    fi
  done

  # 每个后台命令都由 setsid 建立独立进程组，强杀时不会遗留 executor 子进程。
  for group in "${BACKGROUND_GROUPS[@]}"; do
    deadline=$((SECONDS + 5))
    while kill -0 -- "-$group" >/dev/null 2>&1 &&
      (( SECONDS < deadline )); do
      sleep 0.2
    done
    if kill -0 -- "-$group" >/dev/null 2>&1; then
      kill -KILL -- "-$group" >/dev/null 2>&1 || true
    fi
    deadline=$((SECONDS + 2))
    while kill -0 -- "-$group" >/dev/null 2>&1 &&
      (( SECONDS < deadline )); do
      sleep 0.2
    done
    if kill -0 -- "-$group" >/dev/null 2>&1; then
      echo "[ros2-smoke] process group $group survived SIGKILL" >&2
      failed=1
    fi
    wait "$group" >/dev/null 2>&1 || true
  done

  if (( failed == 0 )); then
    BACKGROUND_GROUPS=()
    LAUNCH_PID=""
  fi
  return "$failed"
}

cleanup() {
  local status=$?
  trap - EXIT
  if ! stop_background_processes; then
    status=1
  fi
  if (( status != 0 )) && [[ -s "$LAUNCH_LOG" ]]; then
    echo "[ros2-smoke] launch log tail:" >&2
    tail -n 80 "$LAUNCH_LOG" >&2 || true
  fi
  echo "[ros2-smoke] logs retained at: $SMOKE_ROOT" >&2
  return "$status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

wait_until() {
  local label="$1"
  local timeout_s="$2"
  shift 2
  local deadline=$((SECONDS + timeout_s))
  until "$@"; do
    if [[ -z "$LAUNCH_PID" ]] || ! kill -0 "$LAUNCH_PID" >/dev/null 2>&1; then
      echo "[ros2-smoke] launch exited while waiting for $label" >&2
      return 1
    fi
    if (( SECONDS >= deadline )); then
      echo "[ros2-smoke] timeout waiting for $label" >&2
      return 1
    fi
    sleep 0.2
  done
}

bounded_ros2() {
  timeout --kill-after=2s 4s ros2 "$@"
}

fixed_line_count() {
  local file="$1"
  local line="$2"
  grep -cFx -- "$line" "$file" 2>/dev/null || true
}

fragment_count() {
  local file="$1"
  local fragment="$2"
  grep -cF -- "$fragment" "$file" 2>/dev/null || true
}

fixed_line_count_is() {
  local file="$1"
  local line="$2"
  local expected="$3"
  [[ "$(fixed_line_count "$file" "$line")" -eq "$expected" ]]
}

launch_contract_ready() {
  [[ "$(fragment_count "$LAUNCH_LOG" "已注册 35 种节点类型。")" -eq 1 ]] &&
    [[ "$(fragment_count "$LAUNCH_LOG" "加载行为树，共 8 个节点。")" -eq 1 ]]
}

trigger_service_ready() {
  local service_name="$1"
  bounded_ros2 service list --no-daemon --spin-time 0.2 --show-types \
    2>/dev/null |
    grep -Fqx -- "$service_name [std_srvs/srv/Trigger]"
}

subscription_count_is() {
  local topic="$1"
  local expected="$2"
  bounded_ros2 topic info --no-daemon --spin-time 0.2 "$topic" \
    2>/dev/null |
    grep -Fqx -- "Subscription count: $expected"
}

log_has_line() {
  local file="$1"
  local line="$2"
  grep -Fqx -- "$line" "$file" 2>/dev/null
}

last_status_is() {
  local expected="$1"
  local last_status
  last_status="$(grep -E '^(IDLE|RUNNING|SUCCESS|FAILURE)$' "$STATUS_LOG" 2>/dev/null |
    tail -n 1 || true)"
  [[ "$last_status" == "$expected" ]]
}

require_fixed_line_count() {
  local file="$1"
  local line="$2"
  local expected="$3"
  local actual
  actual="$(fixed_line_count "$file" "$line")"
  if [[ "$actual" -ne "$expected" ]]; then
    echo "[ros2-smoke] expected $expected '$line' line(s) in $file, got $actual" >&2
    return 1
  fi
}

call_trigger() {
  local service_name="$1"
  local expected_message="$2"
  local output_file="$3"

  timeout --kill-after=2s 8s ros2 service call \
    "$service_name" std_srvs/srv/Trigger '{}' >"$output_file" 2>&1
  if ! grep -Fq "success=True" "$output_file" ||
    ! grep -Fq "message='$expected_message'" "$output_file"; then
    echo "[ros2-smoke] unexpected response from $service_name; expected '$expected_message'" >&2
    cat "$output_file" >&2 || true
    return 1
  fi
}

echo "[ros2-smoke] root: $SMOKE_ROOT"
echo "[ros2-smoke] ROS_DOMAIN_ID=$ROS_DOMAIN_ID"

if ! DOMAIN_NODES="$(bounded_ros2 node list --no-daemon \
  2>"$DOMAIN_PROBE_LOG")"; then
  echo "[ros2-smoke] failed to probe ROS_DOMAIN_ID=$ROS_DOMAIN_ID" >&2
  cat "$DOMAIN_PROBE_LOG" >&2 || true
  exit 1
fi
if [[ -n "$DOMAIN_NODES" ]]; then
  echo "[ros2-smoke] ROS_DOMAIN_ID=$ROS_DOMAIN_ID is not empty:" >&2
  printf '%s\n' "$DOMAIN_NODES" >&2
  exit 1
fi

echo "[ros2-smoke] build bt_ros2 in isolated colcon roots"
timeout --kill-after=10s "${BT_ROS2_SMOKE_BUILD_TIMEOUT:-180s}" \
  colcon --log-base "$LOG_BASE" build \
  --base-paths "$REPO_ROOT/bt_ros2" \
  --packages-select bt_ros2 \
  --build-base "$BUILD_BASE" \
  --install-base "$INSTALL_BASE" \
  --cmake-args -DBT_CORE_DIR="$REPO_ROOT/bt_core"

# shellcheck disable=SC1091
set +u
source "$INSTALL_BASE/setup.bash"
set -u

TREE_FILE="$(ros2 pkg prefix bt_ros2)/share/bt_ros2/trees/recharge.xml"

echo "[ros2-smoke] launch recharge executor with autostart disabled"
setsid ros2 launch bt_ros2 bt_executor.launch.py \
  tree_file:="$TREE_FILE" \
  tick_rate_hz:=10.0 \
  autostart:=false \
  stop_on_terminal:=true >"$LAUNCH_LOG" 2>&1 &
LAUNCH_PID=$!
BACKGROUND_GROUPS+=("$LAUNCH_PID")

# 三个 echo 必须先进入图，再允许任何服务调用或外部事件，避免遗漏瞬时消息。
setsid env PYTHONUNBUFFERED=1 ros2 topic echo --no-daemon --field data \
  /robot/command std_msgs/msg/String >"$COMMAND_LOG" 2>&1 &
BACKGROUND_GROUPS+=("$!")
setsid env PYTHONUNBUFFERED=1 ros2 topic echo --no-daemon --field data \
  --qos-reliability reliable \
  /bt/task_done std_msgs/msg/String >"$DONE_LOG" 2>&1 &
BACKGROUND_GROUPS+=("$!")
setsid env PYTHONUNBUFFERED=1 ros2 topic echo --no-daemon --field data \
  /bt_executor/bt_status std_msgs/msg/String >"$STATUS_LOG" 2>&1 &
BACKGROUND_GROUPS+=("$!")

wait_until "registration catalog 35 and recharge tree node count 8" 12 \
  launch_contract_ready
wait_until "one /robot/command echo subscriber" 12 \
  subscription_count_is /robot/command 1
wait_until "one /bt/task_done echo subscriber" 12 \
  subscription_count_is /bt/task_done 1
wait_until "one /bt_executor/bt_status echo subscriber" 12 \
  subscription_count_is /bt_executor/bt_status 1

wait_until "/bt_executor/start" 12 \
  trigger_service_ready /bt_executor/start
wait_until "/bt_executor/stop" 12 \
  trigger_service_ready /bt_executor/stop

echo "[ros2-smoke] verify idempotent start and pre-event stop"
call_trigger /bt_executor/start "started" "$START_FIRST_LOG"
call_trigger /bt_executor/start "already running" "$START_SECOND_LOG"
wait_until "RUNNING root status" 12 log_has_line "$STATUS_LOG" RUNNING
wait_until "one /battery_state subscriber" 12 \
  subscription_count_is /battery_state 1
call_trigger /bt_executor/stop "stopped" "$STOP_FIRST_LOG"
call_trigger /bt_executor/stop "already stopped" "$STOP_SECOND_LOG"

call_trigger /bt_executor/start "started" "$RESTART_LOG"

echo "[ros2-smoke] publish exactly one low-battery event"
timeout --kill-after=2s 12s ros2 topic pub --once \
  --wait-matching-subscriptions 1 \
  /battery_state sensor_msgs/msg/BatteryState \
  '{percentage: 0.18}' >"$BATTERY_LOG" 2>&1

wait_until "one start_recharge:main_dock command" 12 \
  fixed_line_count_is "$COMMAND_LOG" "start_recharge:main_dock" 1
wait_until "one /dock/is_docked subscriber" 12 \
  subscription_count_is /dock/is_docked 1

echo "[ros2-smoke] publish exactly one dock event"
timeout --kill-after=2s 12s ros2 topic pub --once \
  --wait-matching-subscriptions 1 \
  /dock/is_docked std_msgs/msg/Bool \
  '{data: true}' >"$DOCK_LOG" 2>&1

wait_until "one task_done:recharge notification" 12 \
  fixed_line_count_is "$DONE_LOG" "task_done:recharge" 1
wait_until "terminal SUCCESS" 12 last_status_is SUCCESS

echo "[ros2-smoke] verify stop remains idempotent after terminal SUCCESS"
call_trigger /bt_executor/stop "already stopped" "$TERMINAL_STOP_FIRST_LOG"
call_trigger /bt_executor/stop "already stopped" "$TERMINAL_STOP_SECOND_LOG"

if ! stop_background_processes; then
  exit 1
fi

require_fixed_line_count "$COMMAND_LOG" "start_recharge:main_dock" 1
require_fixed_line_count "$DONE_LOG" "task_done:recharge" 1
if ! last_status_is SUCCESS; then
  echo "[ros2-smoke] final root status is not SUCCESS" >&2
  exit 1
fi

echo "[ros2-smoke] result: SUCCESS"
