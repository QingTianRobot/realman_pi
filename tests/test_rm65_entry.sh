#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRY="$ROOT/rm65"

output="$(RM65_DRY_RUN=1 "$ENTRY" up 2>&1)"
grep -Fq "camera_ros2 color" <<<"$output"
grep -Fq "realman_bringup_remote" <<<"$output"
grep -Fq "realman_web_control" <<<"$output"
if grep -Fq "realman_remote_rviz" <<<"$output"; then
  echo "default up unexpectedly starts RViz" >&2
  exit 1
fi

output="$(RM65_DRY_RUN=1 "$ENTRY" up desktop 2>&1)"
grep -Fq "realman_remote_rviz" <<<"$output"
grep -Fq "realman_web_control" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" up model 2>&1)"
grep -Fq "rm65_three_rviz" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" down 2>&1)"
grep -Fq "realman_bringup_remote" <<<"$output"
grep -Fq "realman_web_control" <<<"$output"

output="$(RM65_DRY_RUN=1 "$ENTRY" build 2>&1)"
grep -Fq "build realman_bringup_remote realman_web_control" <<<"$output"
if grep -Eq " (up|stop|restart) " <<<"$output"; then
  echo "build unexpectedly starts services" >&2
  exit 1
fi

output="$(RM65_DRY_RUN=1 "$ENTRY" status 2>&1)"
grep -Fq "status" <<<"$output"

output="$("$ENTRY" help 2>&1)"
grep -Fq "build" <<<"$output"
grep -Fq "up [desktop|model]" <<<"$output"

if "$ENTRY" does-not-exist >/dev/null 2>&1; then
  echo "invalid command unexpectedly succeeded" >&2
  exit 1
fi

echo "rm65 entry tests passed"

# Production bringup must publish camera health consumed by Web control.
grep -Fq "start_camera_calibration:=true" "$ROOT/config/docker/compose.yaml"

# The production graph must refuse to start beside the legacy local-driver
# RViz service, which would create duplicate realman_driver nodes.
grep -Fq 'com.docker.compose.service=realman_driver_rviz' "$ROOT/rm65"
grep -Fq 'refusing to start while realman_driver_rviz is running' "$ROOT/rm65"

# A running legacy driver/RViz container must block startup before camera or
# production services are touched. The exported shell function stands in for
# `docker ps` without connecting to a Docker daemon.
conflict_output="$({
  docker() { printf 'legacy-driver-rviz-id\n'; }
  export -f docker
  bash -c 'source "$0"; check_driver_rviz_conflict' "$ROOT/rm65"
} 2>&1 || true)"
grep -Fq 'refusing to start while realman_driver_rviz is running' <<<"$conflict_output"
