# Task 1 report: preview-only MoveJ

## Status

Implemented and locally validated. `registerDemoNodes()` now registers the built-in `MoveJ` preview action. Its `tick()` always returns `SUCCESS` and performs no ROS, network, or hardware operations.

The authoritative `config/behavior-trees/arm_move.xml` contract uses six ports, so the manifest exposes exactly: `arm_id`, `dry_run`, `joint_degrees`, `velocity_percent`, `blend_radius_percent`, and `timeout_sec`. This supersedes the four generic ports listed in the initial task wording to preserve XML compatibility.

## Tests

- Focused `PreviewNodes` GoogleTest binary: 2 tests passed.
  - Verifies `MoveJ` registration and the six XML ports.
  - Verifies a configured `MoveJ` instance ticks to `SUCCESS` without an execution environment.
- C++17 syntax checks passed for `bt_server` sources with vendored `httplib.h` include path.
- Full CMake configure/build could not run: `cmake` is not installed in the environment (`command not found`).

## Concerns

- The focused test is registered in the vendored top-level `tests/CMakeLists.txt` under `BT_BUILD_SERVER`; a future server-specific test target could move it if the build layout changes.
- Port values are intentionally declared as strings because preview execution does not parse or act on motion data; XML literals and blackboard remappings remain accepted without introducing ROS/network dependencies.
