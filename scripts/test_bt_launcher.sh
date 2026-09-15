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
grep -Fq 'http://127.0.0.1:8080/?tree=arm_move.xml' <<<"$output"

if REALMAN_BT_DRY_RUN=maybe "$ROOT/scripts/bt.sh" r >/dev/null 2>&1; then
  echo 'invalid dry-run value unexpectedly accepted' >&2
  exit 1
fi

printf 'behavior-tree launcher dry-run plan: PASS\n'
