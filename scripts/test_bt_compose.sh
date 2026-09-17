#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOCK_DRIVER_CONFIG=/opt/rm65_ws/config/ros/realman_driver_mock.yaml
PRODUCTION_DRIVER_CONFIG=/opt/rm65_ws/config/ros/realman_driver.yaml

mock_plan="$(
  RM65_DRY_RUN=1 \
  REALMAN_DRIVER_CONFIG_FILE="$MOCK_DRIVER_CONFIG" \
    "$ROOT/rm65" up
)"
grep -Fq 'env REALMAN_START_GRIPPER=false docker compose' <<<"$mock_plan"

mock_remote="$(
  REALMAN_DRIVER_CONFIG_FILE="$MOCK_DRIVER_CONFIG" \
  REALMAN_START_GRIPPER=false \
    docker compose -f "$ROOT/docker-compose.yml" config |
    sed -n '/^  realman_bringup_remote:/,/^  realman_remote_rviz:/p'
)"
grep -Fq "driver_config_file:=$MOCK_DRIVER_CONFIG" <<<"$mock_remote"
grep -Fq 'start_gripper:=false' <<<"$mock_remote"
if grep -Fq 'start_gripper:=true' <<<"$mock_remote"; then
  printf 'mock bringup unexpectedly enables gripper hardware\n' >&2
  exit 1
fi

production_remote="$(
  docker compose -f "$ROOT/docker-compose.yml" config |
    sed -n '/^  realman_bringup_remote:/,/^  realman_remote_rviz:/p'
)"
grep -Fq "driver_config_file:=$PRODUCTION_DRIVER_CONFIG" <<<"$production_remote"
grep -Fq 'start_gripper:=true' <<<"$production_remote"

printf 'behavior-tree mock Compose safety contract: PASS\n'
