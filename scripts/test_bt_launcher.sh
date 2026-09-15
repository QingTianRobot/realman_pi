#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output="$(RM65_DRY_RUN=1 REALMAN_BT_DRY_RUN=true "$ROOT/scripts/bt.sh" r)"

grep -Fq 'start bt_server http://127.0.0.1:8080' <<<"$output"
grep -Fq 'start editor http://127.0.0.1:5173/?tree=arm_move.xml' <<<"$output"
grep -Fq 'ros2 launch realman_bt arm_move.launch.py arm_id:=r dry_run:=true' <<<"$output"
grep -Fq 'arm_move.xml' <<<"$output"

printf 'behavior-tree launcher dry-run plan: PASS\n'
