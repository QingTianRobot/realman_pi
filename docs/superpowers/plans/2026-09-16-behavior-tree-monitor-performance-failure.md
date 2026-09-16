# Behavior Tree Monitor Theme, Performance, and Failure Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the runtime monitor with the golf-course reference, make the page available before Action readiness, reduce unchanged polling traffic, and show failure reasons.

**Architecture:** The executor writes optional failure metadata into the atomic snapshot. `bt_server` serves the snapshot with sequence-based ETags and starts independently of ROS readiness. The React monitor adopts the reference's compact panel layout and displays failure metadata in its inspector.

**Tech Stack:** C++17/cpp-httplib, ROS 2 Humble, Bash, React 18/TypeScript/Vite, Vitest, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-09-16-behavior-tree-monitor-performance-failure-design.md`

## Global Constraints

- The webpage remains read-only and cannot issue robot actions.
- `REALMAN_BT_DRY_RUN=true` remains the default; no real-motion behavior changes.
- `realman_bt_executor` remains the sole behavior-tree ticker and Action client.
- Snapshot files remain atomically replaced under `/tmp/realman-bt-workspace`.
- Production monitor remains served at `http://<host>:8080/`.

### Task 1: Extend snapshot and failure-reason contracts

**Files:**
- Modify: `src/behavior/realman_bt/include/realman_bt/runtime_snapshot.hpp`
- Modify: `src/behavior/realman_bt/src/runtime_snapshot.cpp`
- Modify: `src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/include/realman_bt/move_j_node.hpp`
- Modify: `src/behavior/realman_bt/src/move_j_node.cpp`
- Modify: `src/behavior/realman_bt/test/test_runtime_snapshot.cpp`
- Modify: `src/behavior/realman_bt/test/test_tree_contract.py`

**Interfaces:** Add optional `failure_reason` to node/root snapshot data and a MoveJ accessor/state path that preserves the latest actionable failure text.

- [ ] Add failing serialization tests for escaped node/root reasons.
- [ ] Run the focused test and observe failure.
- [ ] Implement optional reason fields and executor propagation.
- [ ] Add MoveJ reason capture for validation, timeout, rejection, result message, and exception paths.
- [ ] Run package tests and commit.

### Task 2: Decouple monitor startup and add conditional HTTP responses

**Files:**
- Modify: `docker/bt_container_entrypoint.sh`
- Modify: `third_party/behavior_tree_cpp/bt_server/src/main.cpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/src/runtime_snapshot_service.hpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/src/runtime_snapshot_service.cpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/test/runtime_snapshot_service_test.cpp`
- Modify: `third_party/behavior_tree_cpp/bt_server/test/runtime_http_test.py`
- Modify: `scripts/test_bt_container_entrypoint.sh`

**Interfaces:** `GET /api/runtime` accepts `If-None-Match` and returns 304 when sequence is unchanged; successful responses include `ETag`.

- [ ] Add failing tests for ETag/304 and startup ordering.
- [ ] Run tests and observe failure.
- [ ] Start `bt_server` in the entrypoint before the Action readiness loop while keeping executor gating intact.
- [ ] Implement bounded ETag extraction from snapshot sequence and conditional response handling.
- [ ] Run server and shell tests; commit.

### Task 3: Match reference monitor UI and display failure reasons

**Files:**
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/App.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/api/client.ts`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/types.ts`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeDetails.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeTree.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/index.css`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/RuntimeMonitor.test.tsx`

- [ ] Add failing tests for failure reason rendering, 304 no-change polling, and reference palette/layout markers.
- [ ] Run Vitest and observe failure.
- [ ] Implement client conditional polling and inspector failure block.
- [ ] Replace current all-dark tokens/layout with the reference's topbar/status-strip/panel/tree tokens while preserving read-only controls.
- [ ] Run Vitest and production build; commit.

### Task 4: Update documentation and production verification

**Files:**
- Modify: `website/docs/development/behavior-tree-motion.md`
- Modify: `website/docs/development/startup-entries.md`
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `.superpowers/sdd/2026-09-15-behavior-tree-runtime-monitor/progress.md`

- [ ] Document startup ordering, conditional polling, reference theme, and failure details.
- [ ] Run shell syntax, Compose config, frontend tests/build, website build, and behavior-tree tests.
- [ ] Rebuild production image, recreate only required services, and curl health/runtime plus a 405 mutation probe without starting the behavior tree.
- [ ] Record evidence and commit documentation.
