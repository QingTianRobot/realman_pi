#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
case "${1:-all}" in
  build) colcon build --symlink-install --packages-up-to realman_bt realman_bt_mock realman_msgs ;;
  mock) exec ros2 launch realman_bt_mock behavior_tree_mock.launch.py ;;
  web) exec docker compose run --rm realman_bt_web ;;
  all) python3 "$ROOT/src/behavior/realman_bt/test/test_tree_contract.py"; python3 "$ROOT/src/behavior/realman_bt_mock/test/test_scenario.py" ;;
  *) echo "usage: bt-test.sh build|mock|web|all" >&2; exit 2 ;;
esac
