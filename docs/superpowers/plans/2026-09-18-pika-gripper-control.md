# Pika Continuous Gripper Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-blocking continuous Pika gripper control for the left and right Changingtek grippers through the existing behavior-tree router.

**Architecture:** The gripper manager will expose a `std_msgs/msg/Float32` command topic beside its existing synchronous percentage service. The Pika router will subscribe to `/pika/l|r/gripper_percentage` and publish only to the corresponding manager command topic while `pikaposition` or `pikavelocity` is ACTIVE. The middle arm remains excluded and the Web service contract remains unchanged.

**Tech Stack:** ROS 2 Humble, `rclpy`, `std_msgs/msg/Float32`, `gripper_ros2_msgs/srv/GripperPercentage`, pytest/ament tests, VitePress.

**Spec:** `docs/superpowers/specs/2026-09-18-pika-gripper-control-design.md`

## Global Constraints

- Pika values are normalized floats in the inclusive range `0.0..1.0`; `0.0` is closed and `1.0` is open.
- Only `l` and `r` are routed; no `/pika/m/gripper_percentage` subscription or middle-gripper command is created.
- Router forwarding requires `pikaposition` or `pikavelocity` `ACTIVE` state and is suppressed in dry-run.
- The manager command callback is non-blocking and must not replace the existing synchronous `/percentage` service behavior.
- Configuration remains authoritative under `config/`; no serial paths or machine secrets are added.
- Real hardware motion is not part of validation; use focused tests and Docker/mock checks.

### Task 1: Add the manager continuous command topic

**Files:**
- Modify: `src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py`
- Test: `src/gripper/gripper_ros2/test/test_gripper_manager_node.py` (create if no manager-node unit exists)
- Modify: `src/gripper/gripper_ros2/package.xml` only if the existing runtime dependencies do not cover `std_msgs`

**Interfaces:**
- Consumes `std_msgs.msg.Float32` on `/<name>/percentage/command`.
- Produces a non-blocking `move_to` request using the configured `percentage_to_position` conversion.

- [x] **Step 1: Write the failing manager callback test**

  Add a unit fixture for a fake manager/device and assert that a valid `Float32(data=0.25)` calls `move_to` with the configured converted position, while invalid values (`nan`, `-0.1`, `1.1`) do not call it.

- [x] **Step 2: Run the focused test to verify it fails**

  Run `pytest -q src/gripper/gripper_ros2/test/test_gripper_manager_node.py`.
  Expected: FAIL because the manager node does not yet create or handle the command topic.

- [x] **Step 3: Implement the non-blocking topic**

  Create a `Float32` subscription at `/{name}/percentage/command`. Validate finite range, call `_ready`, convert with `percentage_to_position`, and call `device.move_to(target)` without `wait_until_pos_or_torque` or feedback polling. Log rejected/offline commands with the existing ROS logger.

- [x] **Step 4: Run focused gripper tests**

  Run `pytest -q src/gripper/gripper_ros2/test/test_gripper_manager_node.py src/gripper/gripper_ros2/test/test_gripper_config.py src/gripper/gripper_ros2/test/test_gripper_driver.py`.
  Expected: PASS.

- [x] **Step 5: Commit the manager slice**

  Commit with `git add src/gripper/gripper_ros2 src/gripper/gripper_ros2_msgs && git commit -m "feat: add nonblocking gripper command topic"`.

### Task 2: Route Pika gripper percentages for l/r

**Files:**
- Modify: `src/behavior/realman_bt/scripts/pika_control_router.py`
- Modify: `src/behavior/realman_bt/package.xml`
- Modify: `src/behavior/realman_bt/CMakeLists.txt` only if Python package installation/tests need an explicit dependency
- Test: `src/behavior/realman_bt/test/test_pika_control_router.py`

**Interfaces:**
- Consumes `/pika/l/gripper_percentage` and `/pika/r/gripper_percentage` as `std_msgs/msg/Float32`.
- Produces `/gripper_left/percentage/command` and `/gripper_right/percentage/command` as `std_msgs/msg/Float32`.

- [x] **Step 1: Extend the router source-contract tests**

  Assert the two Pika topic templates, the left/right manager mapping, `Float32`, the shared active-mode gate, dry-run suppression, and absence of `/pika/m/gripper_percentage`.

- [x] **Step 2: Run the router tests to verify the new assertions fail**

  Run `pytest -q src/behavior/realman_bt/test/test_pika_control_router.py`.
  Expected: FAIL because the router has no gripper subscribers or publishers.

- [x] **Step 3: Implement minimal continuous forwarding**

  Add `Float32` subscriptions and per-arm command publishers. In the callback, ignore values unless the current mode is `pikaposition` or `pikavelocity`, ignore dry-run, validate finite `0.0..1.0`, and publish the normalized value to the mapped manager topic. Keep pose/velocity action state independent from gripper topic forwarding.

- [x] **Step 4: Run router tests and Python compilation**

  Run `pytest -q src/behavior/realman_bt/test/test_pika_control_router.py` and `python3 -m py_compile src/behavior/realman_bt/scripts/pika_control_router.py`.
  Expected: PASS with no syntax errors.

- [x] **Step 5: Commit the router slice**

  Commit with `git add src/behavior/realman_bt && git commit -m "feat: route continuous Pika gripper commands"`.

### Task 3: Document the ROS graph and operator boundaries

**Files:**
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/gripper-control.md`
- Modify: `website/docs/development/realman-action-development.md` only where the Pika ROS contract is listed

- [x] **Step 1: Document the exact topics and units**

  Add Pika input topics, manager command topics, the `0.0` closed/`1.0` open convention, l/r-only scope, active-mode gate, and the distinction between non-blocking command topics and synchronous Web percentage services.

- [x] **Step 2: Verify documentation links and wording**

  Search the edited pages for stale statements that Pika controls only Cartesian pose/velocity or that all gripper commands are synchronous.

- [x] **Step 3: Commit documentation**

  Commit with `git add website/docs/development && git commit -m "docs: describe Pika gripper routing"`.

### Task 4: Full verification and deployment readiness

**Files:**
- Modify only files required by failing verification.

- [x] **Step 1: Run focused and existing gripper/router tests**

  Run the Task 1 and Task 2 commands plus `pytest -q src/driver/realman_web_control/test/test_gripper_protocol.py`.

- [x] **Step 2: Run repository checks**

  Run `git diff --check`, `docker compose config`, `python3 -m compileall -q src/gripper/gripper_ros2 src/behavior/realman_bt`, and `npm run build` from `website/`.

- [x] **Step 3: Build the ROS image and inspect the result**

  Run `docker compose build realman_bringup_remote` and confirm the manager topic is present in the built source/install tree. Do not send real gripper commands.

- [x] **Step 4: Review the final diff and runtime contract**

  Confirm no middle-arm Pika topic, no synchronous service call in the continuous callback, and no production `.env` changes. Report any hardware validation not performed.
