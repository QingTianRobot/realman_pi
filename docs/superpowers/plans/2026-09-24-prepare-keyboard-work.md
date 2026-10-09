# Prepare Keyboard WORK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `keyboard` input mode select and verify each controlled arm's configured default WORK frame before the mode becomes `ACTIVE`.

**Architecture:** Add an asynchronous `PrepareKeyboardWork` behavior-tree leaf that resolves `l|default_work` and `r|default_work` from the existing coordinate registry, calls each driver's `coordinates/select_work` service, and succeeds only after both responses confirm the expected controller frame. Place the leaf in a stateful keyboard entry sequence before `ActivateInputMode`, so failures leave the coordinator in `FAILED` and trigger the existing `none` fallback.

**Tech Stack:** C++17, ROS 2 Humble `rclcpp`, BehaviorTree.CPP-compatible local `bt_core`, `realman_msgs/srv/SelectFrame`, pytest, CTest/colcon.

**Spec:** Approved keyboard-mode behavior discussed in this session; authoritative coordinate data remains in `config/ros/realman_coordinates.yaml`.

## Global Constraints

- Do not access the RealMan SDK from the behavior-tree leaf.
- Do not hard-code `cell`; resolve both controller names from the coordinate registry.
- `dry_run=true` validates configuration without creating service clients or changing hardware.
- Do not deploy to production or run real robot motion.
- Preserve unrelated dirty-worktree changes.

---

### Task 1: Lock the tree and node contract with failing tests

**Files:**
- Modify: `src/behavior/realman_bt/test/test_control_router_tree.py`
- Create: `src/behavior/realman_bt/test/test_prepare_keyboard_work_node.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`

**Interfaces:**
- Consumes: `CoordinateReferenceRegistry`, `InputModeCoordinator`, and `realman_msgs/srv/SelectFrame`.
- Produces: executable contract for `PrepareKeyboardWorkNode` and keyboard branch ordering.

- [ ] **Step 1: Write the XML contract test**

  Assert that the keyboard branch is guard, then a `keyboard_entry` sequence containing `PrepareKeyboardWork dry_run="{dry_run}"`, `ActivateInputMode mode="keyboard"`, and `KeyboardVelocityInput`.

- [ ] **Step 2: Write the node integration test**

  Cover dry-run validation, two successful service responses, service response failure, and active-name mismatch. Assert that failures set the input-mode coordinator phase to `FAILED`.

- [ ] **Step 3: Run the focused tests and observe RED**

  Run the Python contract test and the new C++ target. The expected failures are the missing XML node and missing `PrepareKeyboardWorkNode` implementation.

### Task 2: Implement and register asynchronous WORK preparation

**Files:**
- Create: `src/behavior/realman_bt/include/realman_bt/prepare_keyboard_work_node.hpp`
- Create: `src/behavior/realman_bt/src/prepare_keyboard_work_node.cpp`
- Modify: `src/behavior/realman_bt/src/realman_bt_executor_node.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`

**Interfaces:**
- Consumes: blackboard keys `kRosNodeBlackboardKey`, `kCoordinateReferenceRegistryBlackboardKey`, and `kInputModeCoordinatorBlackboardKey`.
- Produces: XML tag `PrepareKeyboardWork` with input port `dry_run`.

- [ ] **Step 1: Implement validation and dry-run behavior**

  Resolve `default_work` for l/r, require WORK type, and return success without obtaining the ROS node or creating clients when dry-run is enabled.

- [ ] **Step 2: Implement non-blocking service polling**

  Wait for both services without blocking, submit each request once, poll shared futures, and require `success=true` plus exact `active_name` equality.

- [ ] **Step 3: Implement failure and halt behavior**

  Preserve a useful `failureReason`, emit ROS/runtime diagnostics, call `InputModeCoordinator::fail`, and clear client/future state on halt.

- [ ] **Step 4: Register and link the node**

  Register `PrepareKeyboardWork` in the executor and link the new source/test target with existing `realman_msgs` and `rclcpp` dependencies.

- [ ] **Step 5: Run focused tests and observe GREEN**

  Run the XML contract, node integration test, executor tests, and tree contract tests.

### Task 3: Update the production tree contract and developer manual

**Files:**
- Modify: `config/behavior-trees/control.xml`
- Modify: `website/docs/development/behavior-tree-control.md`

**Interfaces:**
- Consumes: XML tag `PrepareKeyboardWork` and existing `coordinates/select_work` services.
- Produces: keyboard transition contract visible to operators and developers.

- [ ] **Step 1: Insert the keyboard entry sequence**

  Put WORK preparation before activation and keep the long-lived keyboard leaf last.

- [ ] **Step 2: Document activation, failure, and dry-run semantics**

  Explain that both l/r default WORK selections must be verified before `ACTIVE/keyboard`, and that a failure enters `FAILED` then falls back to `none`.

- [ ] **Step 3: Build the Web manual**

  Run `npm run build` in `website/`.

### Task 4: Verify without hardware motion

**Files:**
- Verify only; no production deployment.

**Interfaces:**
- Consumes: completed implementation and tests.
- Produces: fresh verification evidence.

- [ ] **Step 1: Run focused pytest and CTest/colcon tests**

  Build and test `realman_bt` in the ROS 2 Humble environment.

- [ ] **Step 2: Run repository behavior-tree checks**

  Run `./rm65 bt-test all`, launcher/entrypoint script tests where available, and `git diff --check`.

- [ ] **Step 3: Review the final diff**

  Confirm only intended files changed and all pre-existing unrelated edits remain intact.
