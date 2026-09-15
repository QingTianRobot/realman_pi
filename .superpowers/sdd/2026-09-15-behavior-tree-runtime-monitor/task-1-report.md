# Task 1 report: runtime snapshot contract

Status: complete

Implemented `realman_bt::RuntimeSnapshotWriter` with the requested `write()` and
`writeIdle()` APIs. Snapshots contain schema version, tree identity, sequence,
millisecond timestamp, root status, and depth-first node metadata (stable `n0`,
`n1`, ... keys, paths, kinds, statuses). String values use explicit JSON
escaping. Files are written to a sibling `.tmp` and atomically replaced with
`std::filesystem::rename`; temporary files are removed on write/rename errors.

Added the runtime snapshot library and focused CTest executable to
`src/behavior/realman_bt/CMakeLists.txt`, and installed/exported the library
target with the package.

Verification:

```text
g++ -std=c++17 -Wall -Wextra ... runtime_snapshot.cpp test_runtime_snapshot.cpp \
  .../bt_core/src/*.cpp .../third_party/tinyxml2.cpp -ldl -o /tmp/test_runtime_snapshot
/tmp/test_runtime_snapshot   # exit 0
```

The repository does not contain a configured ROS/ament build directory, so the
full package CTest invocation was not available in this environment. The
standalone focused contract test passed, covering idle output, DFS keys/paths,
status/kind values, escaping, and replacement cleanup.

Commit: `feat: add behavior tree runtime snapshot contract`
