#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/third_party/behavior_tree_cpp"

for required in \
  "$VENDOR/bt_core/CMakeLists.txt" \
  "$VENDOR/bt_nodes/CMakeLists.txt" \
  "$VENDOR/bt_ros2/package.xml" \
  "$VENDOR/bt_server/CMakeLists.txt" \
  "$VENDOR/VENDOR_REVISION"; do
  test -f "$required" || {
    printf 'missing vendor file: %s\n' "$required" >&2
    exit 1
  }
done

grep -q 'COPY third_party/behavior_tree_cpp' \
  "$ROOT/config/docker/ros2-humble-rviz.Dockerfile" || {
  printf 'Dockerfile does not copy the behavior tree vendor snapshot\n' >&2
  exit 1
}

if grep -Rqs '/home/server5090/Downloads/behavior_tree_cpp' \
  "$ROOT/config/docker"; then
  printf 'vendor integration still references host Downloads path\n' >&2
  exit 1
fi

printf 'behavior tree vendor snapshot contract: PASS\n'
