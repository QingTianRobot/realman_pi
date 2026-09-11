#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRY="$ROOT/rm65"

output="$(RM65_DRY_RUN=1 "$ENTRY" up 2>&1)"
grep -Fq "camera_ros2 color" <<<"$output"
grep -Fq "realman_bringup_remote" <<<"$output"
if grep -Fq "realman_remote_rviz" <<<"$output"; then
  echo "default up unexpectedly starts RViz" >&2
  exit 1
fi

output="$(RM65_DRY_RUN=1 "$ENTRY" up desktop 2>&1)"
grep -Fq "realman_remote_rviz" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" up model 2>&1)"
grep -Fq "rm65_three_rviz" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" down 2>&1)"
grep -Fq "realman_bringup_remote" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" status 2>&1)"
grep -Fq "status" <<<"$output"

output="$("$ENTRY" help 2>&1)"
grep -Fq "up [desktop|model]" <<<"$output"

if "$ENTRY" does-not-exist >/dev/null 2>&1; then
  echo "invalid command unexpectedly succeeded" >&2
  exit 1
fi

echo "rm65 entry tests passed"
