#!/usr/bin/env bash
set -euo pipefail

TEST_ROOT="/tmp/realman-bt-entrypoint-test-$$"
TREE_FILE="/opt/rm65_ws/config/behavior-trees/arm_move.xml"
mkdir -p "$TEST_ROOT"

ros2() {
  if [[ "${1:-} ${2:-}" == "action info" ]]; then
    printf 'Action clients: 0\nAction servers: 1\n'
    return 0
  fi
  if [[ "${1:-} ${2:-}" == "launch realman_bt" ]]; then
    case "${FAKE_BT_RESULT:-SUCCESS}" in
      SUCCESS) success=1; failure=0 ;;
      FAILURE) success=0; failure=1 ;;
      NONE) success=0; failure=0 ;;
      *) return 2 ;;
    esac
    printf '{"schema_version":2,"tick_stats":{"running":1,"success":%s,"failure":%s,"total":2}}\n' \
      "$success" "$failure" >"$BT_RUNTIME_SNAPSHOT"
    sleep "${FAKE_LAUNCH_SLEEP:-0}"
    return 0
  fi
  return 2
}
export -f ros2

run_bt() {
  local name="$1"
  local port="$2"
  local archive_root="${BT_RUNTIME_ARCHIVE_ROOT_OVERRIDE:-$TEST_ROOT/$name/archive}"
  BT_AUTOSTART=true \
  REALMAN_BT_DRY_RUN=true \
  BT_SERVER_PORT="$port" \
  BT_TREE_FILE="$TREE_FILE" \
  BT_TREE_WORKSPACE="/tmp/realman-bt-workspace-$name-$$" \
  BT_RUNTIME_SNAPSHOT="/tmp/realman-bt-workspace-$name-$$/runtime.json" \
  BT_RUNTIME_ARCHIVE_ROOT="$archive_root" \
    /usr/local/bin/bt-start >"$TEST_ROOT/$name.log" 2>&1
}

FAKE_BT_RESULT=SUCCESS run_bt success 18110
grep -q 'archived final runtime snapshot' "$TEST_ROOT/success.log"
test -n "$(find "$TEST_ROOT/success/archive" -name runtime.json -type f -print -quit)"
test -n "$(find "$TEST_ROOT/success/archive" -name arm_move.xml -type f -print -quit)"

set +e
FAKE_BT_RESULT=FAILURE run_bt failure 18111
failure_status=$?
set -e
test "$failure_status" -eq 1
grep -q 'behavior tree reached FAILURE' "$TEST_ROOT/failure.log"
test -n "$(find "$TEST_ROOT/failure/archive" -name runtime.json -type f -print -quit)"

set +e
FAKE_BT_RESULT=SUCCESS \
BT_RUNTIME_ARCHIVE_ROOT_OVERRIDE=/proc/realman-bt-archive-denied \
  run_bt archive_failure 18112
archive_status=$?
set -e
test "$archive_status" -eq 74

FAKE_BT_RESULT=SUCCESS FAKE_LAUNCH_SLEEP=2 run_bt lock_owner 18113 &
owner_pid=$!
for _ in {1..50}; do
  if ! flock -n /tmp/realman-bt.lock -c true; then
    break
  fi
  sleep 0.1
done
set +e
FAKE_BT_RESULT=SUCCESS run_bt lock_contender 18114
lock_status=$?
set -e
test "$lock_status" -eq 73
grep -q 'another behavior-tree run is active' "$TEST_ROOT/lock_contender.log"
wait "$owner_pid"

printf '%s\n' 'behavior-tree entrypoint runtime lifecycle: PASS'
