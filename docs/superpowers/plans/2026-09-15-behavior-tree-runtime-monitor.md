# Behavior Tree Runtime Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the editable behavior-tree web editor with a Golf Course Robot-style read-only runtime monitor backed by live executor snapshots.

**Architecture:** `realman_bt_executor` remains the sole tree owner and writes an atomically replaced JSON snapshot after every tick. `bt_server` serves that snapshot through read-only HTTP endpoints and exposes a production read-only mode. The bundled frontend becomes a static monitor that polls `/api/runtime`, renders a collapsible tree and details panel, and has no tree mutation controls.

**Tech Stack:** C++17, bt_core, cpp-httplib, ROS 2 Humble/rclcpp, React 18 + TypeScript + Vite, Vitest/Playwright, Docker Compose host networking.

**Spec:** `docs/superpowers/specs/2026-09-15-behavior-tree-runtime-monitor-design.md`

## Global Constraints

- `realman_bt_executor` is the only process allowed to tick the production tree.
- `REALMAN_BT_DRY_RUN=true` remains the default; only explicit `false` may send `/<arm_id>/execute_motion` goals.
- The webpage is read-only: it cannot edit, save, load, tick, run, or send robot motion commands.
- Runtime snapshots are written atomically under `/tmp/realman-bt-workspace/runtime.json`.
- Production HTTP keeps only read APIs and returns `405` for editor mutation APIs.
- Runtime monitoring remains available at `http://<host>:8080/` in the driver container.

---

### Task 1: Define and test the runtime snapshot contract

**Files:**
- Create: `src/behavior/realman_bt/include/realman_bt/runtime_snapshot.hpp`
- Create: `src/behavior/realman_bt/src/runtime_snapshot.cpp`
- Create: `src/behavior/realman_bt/test/test_runtime_snapshot.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`

**Interfaces:**
- Produces `realman_bt::RuntimeSnapshotWriter(std::filesystem::path)`,
  `write(const bt_core::Tree&, std::string tree_id, uint64_t sequence)` and
  `writeIdle(std::string tree_id)`.
- Snapshot JSON fields are `schema_version`, `tree_id`, `sequence`, `timestamp_ms`,
  `root_status`, and `nodes[]`; each node contains `key`, `name`, `registration_name`,
  `kind`, `path`, and `status`.
- Later tasks consume the fixed file path and JSON schema; no ROS messages are added.

- [ ] **Step 1: Write failing contract tests** for empty/idle snapshots, stable DFS keys,
  status values, JSON escaping, and atomic replacement without a partially written file.
- [ ] **Step 2: Run the focused test and verify it fails** because the writer does not exist.
- [ ] **Step 3: Implement the writer** using `Tree::visitNodes`, `TreeNode` metadata/status,
  explicit JSON escaping, a sibling `.tmp` file, and `std::filesystem::rename`.
- [ ] **Step 4: Register the source and test in CMake** and run the focused CTest target.
- [ ] **Step 5: Commit** with `feat: add behavior tree runtime snapshot contract`.

### Task 2: Publish snapshots from the ROS executor

**Files:**
- Modify: `src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/launch/arm_move.launch.py`
- Modify: `src/behavior/realman_bt/test/test_tree_contract.py`

**Interfaces:**
- Adds launch parameter `runtime_snapshot_file`, defaulting to
  `os.environ.get("BT_TREE_WORKSPACE", "/tmp/realman-bt-workspace") + "/runtime.json"`.
- Executor writes an idle snapshot after loading, then increments `sequence` and writes
  the complete tree snapshot after each `tickOnce()`.
- The existing `/realman_bt_executor/bt_status` topic remains for compatibility.

- [ ] **Step 1: Add failing tests** asserting the launch argument, default path, sequence
  increments, and snapshot write on SUCCESS/FAILURE/RUNNING ticks.
- [ ] **Step 2: Run the focused Python/C++ tests and verify failure.**
- [ ] **Step 3: Inject `RuntimeSnapshotWriter` into the executor**, initialize it from the
  launch parameter, write idle state after XML load, and write snapshots in `onTick()`.
- [ ] **Step 4: Build and run `realman_bt` tests** with a dry-run tree; verify the JSON file
  contains the expected node statuses and never sends an Action goal.
- [ ] **Step 5: Commit** with `feat: publish behavior tree runtime snapshots`.

### Task 3: Add production read-only HTTP APIs

**Files:**
- Create: `third_party/behavior_tree_cpp/bt_server/src/runtime_snapshot_service.hpp`
- Create: `third_party/behavior_tree_cpp/bt_server/src/runtime_snapshot_service.cpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/src/main.cpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/CMakeLists.txt`
- Create: `third_party/behavior_tree_cpp/bt_server/test/runtime_snapshot_service_test.cpp`

**Interfaces:**
- Adds `GET /api/runtime`, returning the latest valid snapshot; a missing file returns HTTP 200
  with `state: "IDLE"`, while malformed or oversized JSON returns HTTP 503 with a JSON error.
- Adds `BT_READ_ONLY=true`; in that mode POST mutation routes return status `405` with
  `{"ok":false,"error":"read-only runtime monitor"}`.
- Read-only mode still serves `/api/health`, `/api/tree/open`, `/api/tree/structure`,
  `/api/trees`, and `/api/runtime`.

- [ ] **Step 1: Add failing HTTP/service tests** for valid JSON, missing-file idle state,
  malformed-file error state, and `405` mutation responses.
- [ ] **Step 2: Run the focused server tests and verify failure.**
- [ ] **Step 3: Implement snapshot file reads** with bounded file size, JSON content type,
  and no writes from GET handlers; gate mutation routes on `BT_READ_ONLY`.
- [ ] **Step 4: Build `bt_server` and manually verify** `/api/runtime` and all read-only
  routes with curl.
- [ ] **Step 5: Commit** with `feat: expose read-only behavior tree runtime API`.

### Task 4: Replace the editor frontend with a runtime monitor

**Files:**
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/App.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/api/client.ts`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/types.ts`
- Create/replace: `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeTree.tsx`
- Create/replace: `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeDetails.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/index.css`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/api/client.test.ts`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/utils/xml.test.ts`
- Create: `third_party/behavior_tree_cpp/bt_editor/src/RuntimeMonitor.test.tsx`
- Add: `third_party/behavior_tree_cpp/bt_editor/e2e/runtime-monitor.spec.ts`

**Interfaces:**
- Adds `fetchRuntime(): Promise<RuntimeSnapshot>` and `fetchStructure()` client calls.
- `RuntimeSnapshot` mirrors the server schema and uses `IDLE | RUNNING | SUCCESS | FAILURE`.
- The page renders connection state, tree/tick/root status, a filterable collapsible tree,
  selected-node details, status counts, and pause/resume polling only.

- [ ] **Step 1: Write failing component/API tests** proving no palette, property editor,
  XML editor, load/save/tick/run buttons, or drag handlers render; prove all four statuses
  and stale-connection messaging render from fixtures.
- [ ] **Step 2: Run Vitest and verify the new monitor tests fail.**
- [ ] **Step 3: Replace the React Flow editor composition** with read-only components and a
  500 ms polling loop that preserves the last good snapshot on transient failures.
- [ ] **Step 4: Add Playwright coverage** for initial idle state, loaded tree, collapse/filter,
  status colors, pause/resume, and read-only controls.
- [ ] **Step 5: Run `npm test`, `npm run build`, and the focused Playwright suite.**
- [ ] **Step 6: Commit** with `feat: replace behavior tree editor with runtime monitor`.

### Task 5: Wire the container and document the operator workflow

**Files:**
- Modify: `docker/bt_container_entrypoint.sh`
- Modify: `config/docker/ros2-humble-rviz.Dockerfile`
- Modify: `config/docker/compose.yaml`
- Modify: `scripts/bt.sh`
- Modify: `scripts/test_bt_container_entrypoint.sh`
- Modify: `scripts/test_bt_launcher.sh`
- Modify: `website/docs/development/behavior-tree-motion.md`
- Modify: `website/docs/development/startup-entries.md`

**Interfaces:**
- Container exports `BT_READ_ONLY=true`, `BT_RUNTIME_SNAPSHOT=/tmp/realman-bt-workspace/runtime.json`,
  and passes `runtime_snapshot_file` to `arm_move.launch.py`.
- `bt-start` starts the monitor server with no preview mutation controls and keeps the existing
  Action readiness and dry-run safety checks.
- Operator docs describe `./rm65 up`, `./rm65 bt r`, `http://<host>:8080/`, and the explicit
  `REALMAN_BT_DRY_RUN=false` warning.

- [ ] **Step 1: Add failing shell/config tests** for read-only env propagation, snapshot path,
  correct monitor URL, and unchanged Action readiness behavior.
- [ ] **Step 2: Implement Compose/entrypoint wiring** and remove `?tree=` as a required
  editor behavior; the monitor loads its structure from read-only API endpoints.
- [ ] **Step 3: Update the developer manual** to remove editor/Tick/Run instructions and add
  read-only monitor behavior, stale-data handling, and safety boundaries.
- [ ] **Step 4: Run `bash -n`, `docker compose config`, `git diff --check`, website build,
  and the full behavior-tree/editor test suites.**
- [ ] **Step 5: Commit** with `docs/runtime: document read-only behavior monitor workflow`.

### Task 6: Production image and smoke verification

**Files:**
- No source files; production image and runtime only.

- [ ] **Step 1: Build `realman_bringup_remote` with the production Dockerfile.**
- [ ] **Step 2: Verify image contents** include `bt-start`, `bt_server`, editor assets, and
  `realman_bt_executor`.
- [ ] **Step 3: Restart only the behavior-tree process after confirming the driver is healthy;
  do not restart the robot driver implicitly.**
- [ ] **Step 4: Run dry-run smoke:** `./rm65 up`, `REALMAN_BT_DRY_RUN=true ./rm65 bt r`,
  curl `/api/health` and `/api/runtime`, and confirm the page has no mutation controls.
- [ ] **Step 5: If the user explicitly authorizes a real-motion smoke**, run the zero-joint
  target at the configured low speed, capture SUCCESS and final snapshot, then stop only
  behavior-tree processes.
- [ ] **Step 6: Record image ID, API responses, and any remaining limitations.**
