# Task 5 report: container and operator workflow

Implemented the read-only behavior-tree runtime monitor workflow.

## Changes

- `bt-start` now exports `BT_READ_ONLY=true` and
  `BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json`, passes
  `runtime_snapshot_file` to `arm_move.launch.py`, and prints the monitor URL
  without a `?tree=` query.
- Compose propagates the read-only and snapshot settings to the driver
  container.
- The Docker Node build stage copies `config/behavior-tree/frontend.ts` into
  the path resolved by the editor's Vite config before `npm run build`.
- `scripts/bt.sh` retains Action-server readiness and the explicit
  `REALMAN_BT_DRY_RUN=false` safety warning while launching the read-only
  monitor at `http://<host>:8080/`.
- Shell contract tests and the developer manual now describe the snapshot API,
  stale-data behavior, and safety boundaries without editor Tick/Run steps.

## Validation

- `bash -n docker/bt_container_entrypoint.sh scripts/bt.sh scripts/test_bt_container_entrypoint.sh scripts/test_bt_launcher.sh`
- `scripts/test_bt_container_entrypoint.sh`
- `scripts/test_bt_launcher.sh`
- `docker compose -f docker-compose.yml config`
- `npm test -- --run` in `third_party/behavior_tree_cpp/bt_editor` (23 tests)
- `npm run build` in `third_party/behavior_tree_cpp/bt_editor`
- `npm run build` in `website`
- `git diff --check`
