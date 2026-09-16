# Behavior Tree Runtime Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show behavior-tree Action/Service/ROS errors and cumulative tick success/failure statistics in the read-only monitor, and document the node-authoring contract as a reusable project skill.

**Architecture:** `realman_bt_executor` owns a bounded diagnostic recorder, updates tick counters and lifecycle events, and atomically writes them with the existing tree snapshot. It subscribes to `/rosout` for relevant executor/action diagnostics; `bt_server` continues to serve the snapshot read-only and unchanged through `/api/runtime`. The React monitor validates optional v2 fields, renders a bar chart and event log, and preserves existing failure inspector behavior.

**Tech Stack:** ROS 2 Humble/rclcpp C++17, `rcl_interfaces/msg/Log`, BehaviorTree.CPP-X, cpp-httplib, React 18 + TypeScript + Vitest, VitePress.

**Spec:** `docs/superpowers/specs/2026-09-16-behavior-tree-runtime-diagnostics-design.md`

## Global Constraints

- Keep the monitor read-only; do not expose XML mutation, Tick, or Run controls.
- Mechanical motion is ROS 2 Action `/<arm_id>/execute_motion`; executor control endpoints are services `/realman_bt_executor/start` and `/realman_bt_executor/stop`.
- Retain at most 200 diagnostic events in memory and in each snapshot.
- Preserve existing snapshot fields and accept snapshots that omit new optional fields.
- Do not send real motion during tests or verification; use dry-run/mock paths.
- Follow `realman-pi-architecture`, `ros2-logging-conventions`, and `document-feature-updates`.

## File Map

- `src/behavior/realman_bt/include/realman_bt/runtime_snapshot.hpp`, `src/behavior/realman_bt/src/runtime_snapshot.cpp`: snapshot schema, tick counters, event ring buffer, JSON serialization.
- `src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp`, `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`: recorder ownership, `/rosout` subscription, MoveJ/service event hooks, tick accounting.
- `src/behavior/realman_bt/src/move_j_node.cpp`: Action lifecycle event callbacks and exact failure propagation.
- `src/behavior/realman_bt/test/test_runtime_snapshot.cpp`, `src/behavior/realman_bt/test/test_tree_contract.py`: C++ and contract coverage.
- `third_party/behavior_tree_cpp/bt_editor/src/types.ts`, `src/api/client.ts`, `src/App.tsx`, `src/components/RuntimeDetails.tsx`, `src/index.css`: DTO validation, chart, event log, layout.
- `third_party/behavior_tree_cpp/bt_editor/src/RuntimeMonitor.test.tsx`, `src/api/client.test.ts`: frontend tests.
- `.agents/skills/developing-realman-behavior-trees/SKILL.md` plus focused `references/*.md`: reusable node design guidance.
- `website/docs/development/behavior-tree-motion.md`, `website/docs/development/behavior-tree-control.md`, `website/docs/development/startup-entries.md`: operator/developer contract updates.

### Task 1: Define the diagnostic snapshot contract (RED → GREEN)

**Files:**
- Modify: `src/behavior/realman_bt/include/realman_bt/runtime_snapshot.hpp`
- Modify: `src/behavior/realman_bt/src/runtime_snapshot.cpp`
- Test: `src/behavior/realman_bt/test/test_runtime_snapshot.cpp`

**Interfaces:**
- Add `RuntimeEvent { timestamp_ms, severity, source, interface_name, phase, detail }` and `TickStats { running, success, failure, total }`.
- Add `RuntimeDiagnostics` with `recordTick(NodeStatus)`, `recordEvent(RuntimeEvent)`, and `snapshot()` accessors; cap events at 200.
- Change `write(...)`/`writeIdle(...)` to accept optional diagnostics while retaining overloads for existing callers.
- Emit `schema_version:2`, `tick_stats`, and `events`; escape all event strings as existing fields do.

- [ ] Write failing tests for v2 fields, counter increments, 200-event retention, and escaped event text.
- [ ] Run `colcon test --packages-select realman_bt --ctest-args -R test_runtime_snapshot`; confirm failure because fields/API are absent.
- [ ] Implement the minimal recorder and serializer; keep atomic replacement unchanged.
- [ ] Re-run the focused C++ test and then the existing runtime snapshot tests; expect PASS.
- [ ] Commit `feat: add behavior tree diagnostic snapshot contract`.

### Task 2: Record executor, Action, Service, and ROS log diagnostics

**Files:**
- Modify: `src/behavior/realman_bt/include/realman_bt/realman_bt_executor_node.hpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/src/move_j_node.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`, `src/behavior/realman_bt/package.xml`
- Test: `src/behavior/realman_bt/test/test_tree_contract.py`

**Interfaces:**
- Executor owns `RuntimeDiagnostics diagnostics_` and passes a recorder callback/blackboard handle to MoveJ.
- Subscribe to `/rosout` with `rcl_interfaces::msg::Log`; record WARN/ERROR messages whose name contains `realman_bt_executor` or `rclcpp_action`, preserving `msg` verbatim as `ROS_LOG`.
- Record service calls as `SERVICE` with `/realman_bt_executor/start` or `/realman_bt_executor/stop`, phase `request`/`response` and response message.
- Record MoveJ Action phases (`wait_server`, `send_goal`, `goal_accepted`/`goal_rejected`, `result`, `timeout`, `cancel`) with interface `/<arm_id>/execute_motion`; set node failure reason from result message or Action code.
- Publish/write diagnostics after every tick, including exception ticks, and increment exactly one tick status counter.

- [ ] Add contract tests asserting the source declares `/rosout`, `rcl_interfaces`, `RuntimeDiagnostics`, Action/Service source labels, and records exceptions.
- [ ] Run the contract test before implementation and verify the new assertions fail.
- [ ] Implement recorder wiring and dependency declarations using official `RCLCPP_*` logging only.
- [ ] Run C++ build/tests and Python contract tests in dry-run/mock mode; expect no real Action goal.
- [ ] Commit `feat: capture behavior tree action and ros diagnostics`.

### Task 3: Serve and validate the extended runtime DTO

**Files:**
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/types.ts`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/api/client.ts`
- Modify: `third_party/behavior_tree_cpp/bt_server/test/runtime_http_test.py` only if response contract needs coverage
- Test: `third_party/behavior_tree_cpp/bt_editor/src/api/client.test.ts`

**Interfaces:**
- Add TypeScript `TickStats`, `RuntimeEvent`, and optional `RuntimeSnapshot.tick_stats/events` fields.
- Validate event severity/source strings and numeric stats when present; reject malformed optional fields without discarding the prior valid snapshot.
- Keep `/api/runtime` ETag and `304` behavior unchanged.

- [ ] Add failing Vitest cases for valid diagnostics, malformed event/stat rejection, and legacy snapshots without optional fields.
- [ ] Run `npm test -- --run src/api/client.test.ts`; confirm RED.
- [ ] Implement DTOs and validation.
- [ ] Re-run focused and full editor tests; expect GREEN.
- [ ] Commit `feat: extend runtime monitor diagnostics types`.

### Task 4: Add tick outcome chart and diagnostic event panel

**Files:**
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/App.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/components/RuntimeDetails.tsx`
- Modify: `third_party/behavior_tree_cpp/bt_editor/src/index.css`
- Test: `third_party/behavior_tree_cpp/bt_editor/src/RuntimeMonitor.test.tsx`

**Interfaces:**
- Render `aria-label="Tick 统计"` with SUCCESS and FAILURE horizontal bars whose widths are calculated from cumulative stats; show numeric totals and total tick count.
- Render `aria-label="诊断日志"` with newest-first events, source badge (`ACTION`/`SERVICE`/`ROS_LOG`), severity, interface, phase, detail; errors use `role="alert"` styling.
- Keep selected-node failure reason and connection/stale-state behavior unchanged.

- [ ] Add failing component tests for chart totals/widths, Action vs Service labels, and verbatim `unknown result response, ignoring...` rendering.
- [ ] Run focused Vitest and confirm RED.
- [ ] Implement components and dark/light reference palette styles without adding mutation controls.
- [ ] Run full editor Vitest and `npm run build`; expect GREEN.
- [ ] Commit `feat: visualize tick outcomes and diagnostics`.

### Task 5: Create the project behavior-tree authoring skill

**Files:**
- Create: `.agents/skills/developing-realman-behavior-trees/SKILL.md`
- Create: `.agents/skills/developing-realman-behavior-trees/references/node-authoring.md`
- Create: `.agents/skills/developing-realman-behavior-trees/references/runtime-diagnostics.md`

**Interfaces:**
- Skill description starts with `Use when...` and triggers on adding/reviewing/debugging RealMan behavior-tree nodes, ports, Action/Service integration, or runtime monitor diagnostics.
- Document exact port validation rules, `failureReason()` requirements, Action-vs-Service boundary, snapshot/event schema, dry-run safety, and required tests.
- Keep entrypoint concise; route detailed schemas/checklists to references.

- [ ] Draft a pressure checklist from the observed `unknown result response` failure and blend/timeout validation pitfalls.
- [ ] Write the skill and references with no placeholders or machine secrets.
- [ ] Run `/home/server5090/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/developing-realman-behavior-trees` and fix all reported issues.
- [ ] Commit `docs: add behavior tree authoring skill`.

### Task 6: Update developer documentation and verification

**Files:**
- Modify: `website/docs/development/behavior-tree-motion.md`
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/startup-entries.md`
- Test: existing website site/startup tests as applicable

- [ ] Document `schema_version:2`, tick stats, 200-event retention, event source semantics, `/rosout` diagnostics, and the distinction between Action and service endpoints.
- [ ] Add the new skill to the development manual/index links if project convention requires discoverability.
- [ ] Run `npm run build` from `website/`, relevant Playwright/Vitest tests, `docker compose config`, `bash -n rm65 scripts/bt.sh docker/bt_container_entrypoint.sh`, `zsh -n functions.zsh`, and `git diff --check`.
- [ ] Perform a dry-run monitor smoke using the packaged server; verify the page shows a failure event and chart without sending a real goal.
- [ ] Commit `docs: document behavior tree diagnostics`.

## Self-Review Checklist

- [ ] Every spec requirement maps to Tasks 1–6: snapshot fields, bounded history, Action/Service/ROS sources, chart, failure details, skill, and docs.
- [ ] No task relies on an undefined function or field; optional frontend fields preserve legacy snapshots.
- [ ] No real-motion command is used in tests or smoke verification.

