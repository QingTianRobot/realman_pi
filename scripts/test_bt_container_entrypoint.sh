#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRYPOINT="$ROOT/docker/bt_container_entrypoint.sh"

[[ -x "$ENTRYPOINT" ]]
grep -Fq ': "${BT_AUTOSTART:=false}"' "$ENTRYPOINT"
grep -Fq 'source /opt/ros/humble/setup.bash' "$ENTRYPOINT"
grep -Fq 'source /opt/rm65_ws/install/setup.bash' "$ENTRYPOINT"
grep -Fq 'action_name="/${REALMAN_BT_ARM_ID}/execute_motion"' "$ENTRYPOINT"
grep -Fq 'ros2 action info "$action_name"' "$ENTRYPOINT"
grep -Fq 'Action ${action_name} is not ready; behavior tree not started' "$ENTRYPOINT"
grep -Fq '"$BT_TREE_WORKSPACE" in' "$ENTRYPOINT"
grep -Fq '/tmp/realman-bt-workspace*' "$ENTRYPOINT"
grep -Fq 'BT_EDITOR_DIST' "$ENTRYPOINT"
grep -Fq 'BT_TREE_WORKSPACE' "$ENTRYPOINT"
grep -Fq 'ros2 launch realman_bt arm_move.launch.py' "$ENTRYPOINT"
grep -Fq 'trap cleanup EXIT INT TERM' "$ENTRYPOINT"
grep -Fq 'kill -TERM "$executor_pid"' "$ENTRYPOINT"
grep -Fq 'kill -TERM "$server_pid"' "$ENTRYPOINT"

printf '%s\n' 'container behavior-tree entrypoint contract: PASS'
