#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" r)"

grep -Fq 'docker compose -f ' <<<"$output"
grep -Fq 'ps -q realman_bringup_remote' <<<"$output"
grep -Fq 'exec -T' <<<"$output"
grep -Fq 'BT_AUTOSTART=true' <<<"$output"
grep -Fq 'REALMAN_BT_ARM_ID=r' <<<"$output"
grep -Fq 'REALMAN_BT_DRY_RUN=true' <<<"$output"
grep -Fq '/usr/local/bin/bt-start' <<<"$output"
grep -Fq 'monitor: http://127.0.0.1:8080/' <<<"$output"
grep -Fq 'BT_READ_ONLY=true' <<<"$output"
grep -Fq 'BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json' <<<"$output"
grep -Fq 'BT_EXIT_ON_TERMINAL=true' <<<"$output"
grep -Fq 'BT_RUNTIME_ARCHIVE_ROOT=/opt/rm65_ws/logs/behavior-trees' <<<"$output"

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
grep -Fq 'BT_TREE_FILE=/opt/rm65_ws/config/behavior-trees/three_arm_staged_move.xml' <<<"$three_output"
grep -Fq 'BT_REQUIRED_ARMS=l\,m\,r' <<<"$three_output"

printf 'three-arm behavior-tree launcher dry-run plan: PASS\n'
