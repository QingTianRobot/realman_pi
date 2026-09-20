#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" r)"

grep -Fq 'docker compose -f ' <<<"$output"
grep -Fq 'ps -q realman_bringup_remote' <<<"$output"
grep -Fq 'exec -T' <<<"$output"
grep -Fq 'BT_AUTOSTART=true' <<<"$output"
grep -Fq 'BT_ARM_ID_OVERRIDE=r' <<<"$output"
grep -Fq 'BT_REQUIRED_ARMS=r' <<<"$output"
grep -Fq 'REALMAN_BT_DRY_RUN=true' <<<"$output"
grep -Fq '/usr/local/bin/bt-start' <<<"$output"
grep -Fq 'monitor: http://127.0.0.1:8080/' <<<"$output"
grep -Fq 'BT_READ_ONLY=true' <<<"$output"
grep -Fq 'BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json' <<<"$output"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/move.xml' <<<"$output"
grep -Fq 'BT_EXIT_ON_TERMINAL=' <<<"$output"
grep -Fq 'BT_RUNTIME_ARCHIVE_ROOT=/opt/rm65_ws/logs/behavior-trees' <<<"$output"
grep -Fq 'realman_bt_executor/stop' "$ROOT/scripts/bt.sh"
grep -Fq 'pending_cancellations' "$ROOT/scripts/bt.sh"

if REALMAN_BT_DRY_RUN=maybe "$ROOT/scripts/bt.sh" r >/dev/null 2>&1; then
  echo 'invalid dry-run value unexpectedly accepted' >&2
  exit 1
fi
if BT_EXIT_ON_TERMINAL=maybe "$ROOT/scripts/bt.sh" r >/dev/null 2>&1; then
  echo 'invalid terminal-exit value unexpectedly accepted' >&2
  exit 1
fi

printf 'behavior-tree launcher dry-run plan: PASS\n'

three_output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" three)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/three.xml' <<<"$three_output"

named_output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" three.xml)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/three.xml' <<<"$named_output"

move_named_output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" move)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/move.xml' <<<"$move_named_output"

left_output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" l)"
grep -Fq 'BT_ARM_ID_OVERRIDE=l' <<<"$left_output"
grep -Fq 'BT_REQUIRED_ARMS=l' <<<"$left_output"

printf 'three-arm behavior-tree launcher dry-run plan: PASS\n'

control_output="$(RM65_DRY_RUN=1 "$ROOT/scripts/bt.sh" control)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/control.xml' <<<"$control_output"
grep -Fq 'BT_EXIT_ON_TERMINAL=' <<<"$control_output"

old_name_output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" arm_move.xml)"
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/move.xml' <<<"$old_name_output"

printf 'persistent control-router launcher dry-run plan: PASS\n'

help_output="$("$ROOT/rm65" help)"
grep -Fq 'bt [tree-name|l|m|r|three|control]' <<<"$help_output"
grep -Fq 'Run a behavior tree from config/behavior-trees; .xml may be omitted.' <<<"$help_output"
grep -Fq 'bt control' <<<"$help_output"
grep -Fq 'Run the persistent input router and :8080 monitor until Ctrl-C.' <<<"$help_output"

functions_help_output="$(zsh -fc 'source "$1/functions.zsh"; rm65_project_help' _ "$ROOT")"
grep -Fq '从 config/behavior-trees 启动行为树；.xml 可省略' <<<"$functions_help_output"
grep -Fq './rm65 bt [tree-name|l|m|r|three|control]' <<<"$functions_help_output"
grep -Fq './rm65 bt control' <<<"$functions_help_output"
grep -Fq '常驻运行全局输入路由；按 Ctrl-C 后执行器和 :8080 监视器退出' <<<"$functions_help_output"

printf 'behavior-tree executable help contract: PASS\n'
