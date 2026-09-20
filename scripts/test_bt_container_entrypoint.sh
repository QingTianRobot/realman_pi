#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRYPOINT="$ROOT/docker/bt_container_entrypoint.sh"

[[ -x "$ENTRYPOINT" ]]
grep -Fq ': "${BT_AUTOSTART:=false}"' "$ENTRYPOINT"
grep -Fq ': "${BT_READ_ONLY:=true}"' "$ENTRYPOINT"
grep -Fq ': "${BT_RUNTIME_SNAPSHOT:=$BT_TREE_WORKSPACE/runtime.json}"' "$ENTRYPOINT"
grep -Fq ': "${BT_REQUIRED_ARMS:=}"' "$ENTRYPOINT"
grep -Fq ': "${BT_LAUNCH_FILE:=}"' "$ENTRYPOINT"
grep -Fq ': "${BT_STOP_ON_TERMINAL:=}"' "$ENTRYPOINT"
grep -Fq ': "${BT_EXIT_ON_TERMINAL:=}"' "$ENTRYPOINT"
grep -Fq 'readonly BT_INSTANCE_LOCK=/tmp/realman-bt.lock' "$ENTRYPOINT"
grep -Fq 'source /opt/ros/humble/setup.bash' "$ENTRYPOINT"
grep -Fq 'source /opt/rm65_ws/install/setup.bash' "$ENTRYPOINT"
ros_setup_line="$(grep -nF 'source /opt/ros/humble/setup.bash' "$ENTRYPOINT" | head -n1 | cut -d: -f1)"
nounset_line="$(grep -nF 'set -u' "$ENTRYPOINT" | tail -n1 | cut -d: -f1)"
[[ -n "$ros_setup_line" && -n "$nounset_line" && "$ros_setup_line" -lt "$nounset_line" ]]
grep -Fq 'IFS="," read -r -a required_arms <<<"$BT_REQUIRED_ARMS"' "$ENTRYPOINT"
grep -Fq 'action_name="/${arm_id}/execute_motion"' "$ENTRYPOINT"
grep -Fq 'ros2 action info "$action_name"' "$ENTRYPOINT"
grep -Fq 'Action ${action_name} is not ready; behavior tree not started' "$ENTRYPOINT"
grep -Fq '"$BT_TREE_WORKSPACE" in' "$ENTRYPOINT"
grep -Fq '/tmp/realman-bt-workspace*' "$ENTRYPOINT"
grep -Fq 'BT_EDITOR_DIST' "$ENTRYPOINT"
grep -Fq 'BT_TREE_WORKSPACE' "$ENTRYPOINT"
grep -Fq 'runtime_tree_file="$BT_TREE_WORKSPACE/$(basename "$BT_TREE_FILE")"' "$ENTRYPOINT"
grep -Fq 'tree_file:="$runtime_tree_file"' "$ENTRYPOINT"
grep -Fq 'runtime_snapshot_file:="$BT_RUNTIME_SNAPSHOT"' "$ENTRYPOINT"
grep -Fq 'stop_on_terminal:="$BT_STOP_ON_TERMINAL"' "$ENTRYPOINT"
grep -Fq 'exit_on_terminal:="$BT_EXIT_ON_TERMINAL"' "$ENTRYPOINT"
grep -Fq 'tree_metadata_script=/opt/rm65_ws/src/behavior/realman_bt/scripts/tree_metadata.py' "$ENTRYPOINT"
grep -Fq 'python3 "$tree_metadata_script" "$BT_TREE_FILE"' "$ENTRYPOINT"
grep -Fq 'ros2 launch realman_bt "$BT_LAUNCH_FILE"' "$ENTRYPOINT"
grep -Fq 'case "$BT_STOP_ON_TERMINAL" in' "$ENTRYPOINT"
grep -Fq 'BT_STOP_ON_TERMINAL must be true or false' "$ENTRYPOINT"
grep -Fq 'case "$BT_EXIT_ON_TERMINAL" in' "$ENTRYPOINT"
grep -Fq 'BT_EXIT_ON_TERMINAL must be true or false' "$ENTRYPOINT"
grep -Fq 'BT_READ_ONLY="$BT_READ_ONLY" BT_RUNTIME_SNAPSHOT="$BT_RUNTIME_SNAPSHOT"' "$ENTRYPOINT"
grep -Fq 'monitor: http://<host>:${BT_SERVER_PORT}/' "$ENTRYPOINT"
grep -Fq 'trap cleanup EXIT INT TERM' "$ENTRYPOINT"
# Executor process-group shutdown is exercised through the real CLI in
# tests/test_bt_cli_interrupt.py, rather than asserting a particular signal.
grep -Fq 'kill -TERM "$server_pid"' "$ENTRYPOINT"
grep -Fq 'flock -n 9' "$ENTRYPOINT"
grep -Fq 'archive_runtime' "$ENTRYPOINT"
grep -Fq '/usr/local/libexec/bt-runtime-result "$BT_RUNTIME_SNAPSHOT"' "$ENTRYPOINT"
server_line="$(grep -nF 'starting read-only runtime monitor' "$ENTRYPOINT" | head -n1 | cut -d: -f1)"
wait_line="$(grep -nF 'waiting for ${action_name}' "$ENTRYPOINT" | head -n1 | cut -d: -f1)"
[[ -n "$server_line" && -n "$wait_line" && "$server_line" -lt "$wait_line" ]]

printf '%s\n' 'container behavior-tree entrypoint contract: PASS'
