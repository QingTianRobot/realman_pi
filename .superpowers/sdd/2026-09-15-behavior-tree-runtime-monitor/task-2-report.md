# Task 2 report: publish behavior-tree runtime snapshots

Implemented the ROS executor snapshot integration.

## Changes

- Added the `runtime_snapshot_file` launch argument. Its default is
  `BT_TREE_WORKSPACE/runtime.json`, falling back to
  `/tmp/realman-bt-workspace/runtime.json`.
- Wired that launch configuration into `realman_bt_executor` and linked the
  executor against the Task 1 `runtime_snapshot` library.
- Added executor state for a stable tree ID, snapshot writer, and monotonic
  per-tick sequence.
- The executor writes an `IDLE` snapshot immediately after XML loading, then
  writes a complete snapshot after every `tickOnce()` (including terminal and
  running results) before publishing the compatibility `bt_status` message.
- Added launch/executor contract tests covering the argument/default path,
  idle write, sequence increment, and write ordering.

## Verification

- The focused contract functions all pass when invoked directly with Python
  (the environment has no `pytest` module): 5 passed.
- `python3 -m py_compile` passes for the launch and test modules.
- The Task 1 C++ runtime snapshot test was compiled and executed directly with
  `g++ -std=c++17`; it passed.
- Full ROS/colcon executor build was unavailable because this environment does
  not provide `colcon`, ROS 2 headers, or the `pytest` package.
