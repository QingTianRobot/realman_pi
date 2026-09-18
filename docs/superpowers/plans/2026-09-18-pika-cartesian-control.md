# Pika Cartesian Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add continuous Cartesian pose control and expose Pika position/velocity routing for l/r through the behavior-tree mode selector.

**Architecture:** The driver owns a cancellable Cartesian pose session backed by `rm_movep_canfd`, parallel to the existing velocity session. A small ROS router follows the behavior-tree executor's active mode, starts the selected session for l/r, and forwards only the matching Pika topic; the Web UI remains dynamically discovered from XML.

**Tech Stack:** ROS 2 Humble, rclpy/rclcpp, BehaviorTree C++, geometry_msgs, realman_msgs, pytest/ament tests, VitePress.

**Spec:** `docs/superpowers/specs/2026-09-18-pika-cartesian-control-design.md`

## Global Constraints

- Pika publishes base-frame `PoseStamped`/`TwistStamped` messages in metres, m/s, and rad/s.
- Only l/r are routed; m never receives Pika commands.
- The behavior-tree XML is the authoritative mode catalog; no static Web/Python mode enum. The selectable IDs are `pikaposition` and `pikavelocity` because router IDs accept lower-case ASCII letters and digits only.
- Every continuous session uses `ArmOwnership`, timestamp validation, watchdog, cancel, stop, disconnect, and official ROS logging.
- Validate in mock/dry-run before any physical motion.

### Task 1: Add the Cartesian pose ROS contract and driver session

**Files:**
- Create: `src/driver/realman_msgs/action/CartesianPose.action`
- Create: `src/driver/realman_robot_driver/realman_robot_driver/cartesian_pose_session.py`
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py`
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py`
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/motion_types.py`
- Modify: `config/ros/realman_motion.yaml`
- Test: `src/driver/realman_robot_driver/test/test_cartesian_pose_session.py`
- Test: `src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py`
- Test: `src/driver/realman_robot_driver/test/test_realman_driver_node.py`

**Interfaces:** `CartesianPose` mirrors the velocity session lifecycle and exposes pose command freshness/feedback. The adapter adds `movep(pose, follow, trajectory_mode, radio)`. The node advertises `cartesian_pose` and `cartesian_pose/command` per arm.

- [ ] Write failing tests for valid base-frame WXYZ commands, stale/out-of-order rejection, watchdog stop, ownership release, and adapter Euler conversion.
- [ ] Run the focused tests and confirm they fail because the action/session/adapter methods are absent.
- [ ] Add the Action definition, update message build/install lists, and implement the minimal session worker with fixed period, normalized quaternions, configured delta limits, watchdog, slow-stop, and Action callbacks.
- [ ] Add the adapter method and node ActionServer/subscription with the same QoS and shutdown ordering as velocity.
- [ ] Run focused driver tests and then the existing velocity/motion tests.

### Task 2: Implement the Pika l/r ROS router

**Files:**
- Create: `src/behavior/realman_bt/scripts/pika_control_router.py`
- Modify: `src/behavior/realman_bt/launch/control_router.launch.py`
- Modify: `src/behavior/realman_bt/package.xml`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Test: `src/behavior/realman_bt/test/test_pika_control_router.py`

**Interfaces:** Subscribes to `/realman_bt_executor/input_mode_state` and the four `/pika/{l,r}/...` topics; creates `CartesianPose`/`CartesianVelocity` clients; publishes per-arm driver command topics. It starts/cancels sessions on active mode transitions and ignores m.

- [ ] Write failing node-level tests for mode filtering, l/r forwarding, m silence, and cancel-before-switch behavior.
- [ ] Run the focused test and confirm the router executable is absent.
- [ ] Implement asynchronous Action goal management, configured goal values, latest-message forwarding, watchdog-safe cancellation, and official logger calls.
- [ ] Launch the router beside the persistent executor and install it with the package.
- [ ] Run the router tests with a mock action backend and inspect recorded commands.

### Task 3: Update the behavior-tree catalog and Web-facing documentation

**Files:**
- Modify: `config/behavior-trees/control_router.xml`
- Modify: `src/behavior/realman_bt/include/realman_bt/input_mode_nodes.hpp`
- Modify: `src/behavior/realman_bt/src/input_mode_nodes.cpp`
- Modify: `src/behavior/realman_bt/test/test_control_router_tree.py`
- Modify: `src/behavior/realman_bt/test/test_input_mode_executor.cpp`
- Modify: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/realman-action-development.md`
- Modify: `website/docs/development/realman-web-control.md`
- Modify: `website/docs/development/index.md` when navigation requires it

- [ ] Add failing XML/catalog tests for `pika_position` and `pika_velocity` labels and branch structure.
- [ ] Run the XML tests and confirm the old single `pika` catalog fails the new assertions.
- [ ] Add the two guarded branches and distinct diagnostic leaves while keeping XML-discovered mode registration.
- [ ] Document topics, Action lifecycle, units, frame rules, watchdog, l/r-only routing, and mock/dry-run commands.
- [ ] Run `./rm65 bt-test all`, relevant driver tests, and `npm run build`.

### Task 4: Full verification and deployment readiness

**Files:**
- Modify only files required by failing verification or generated build metadata.

- [ ] Run `git diff --check`, `bash -n rm65`, `zsh -n functions.zsh`, `docker compose config`, focused pytest/ament tests, and Web build.
- [ ] Run mock/dry-run router validation and verify no `/m/cartesian_pose/command` or `/m/cartesian_velocity/command` traffic is emitted.
- [ ] Review safety logs and Action cancellation behavior before reporting completion.
