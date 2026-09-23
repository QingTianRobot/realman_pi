# Cartesian Velocity Telemetry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the requested and measured Cartesian end-effector velocity for each arm and display both values in Web control without treating command echo as measurement.

**Architecture:** Add one `realman_msgs/msg/CartesianVelocityState` contract on `/<arm>/cartesian_velocity/state`. The driver combines the latest accepted and acceleration-limited session command with a pose-difference velocity estimate from the existing state/FK boundary; the Web node forwards the state as a WebSocket event and the browser renders explicit command/measured frames and freshness. The measurement boundary remains replaceable by the RealMan UDP callback later.

**Tech Stack:** ROS 2 Humble, `realman_msgs`, Python `rclpy`, existing RealMan SDK adapter/FK API, TypeScript/Vite Web control, pytest/colcon.

**Spec:** `docs/superpowers/specs/2026-09-23-cartesian-velocity-telemetry-design.md`

## Global Constraints

- Command and measured frames must remain explicit; command values use the active WORK frame and measured values use `<arm>/base_link`.
- Measured data is invalid when a pose sample or sample interval is unavailable; never publish command echo as measured data.
- Telemetry is read-only and must not change motion ownership, watchdog, velocity limits, input-mode routing, or gripper behavior.
- Configuration sources remain under repository-root `config/`; no production-only values may be embedded in Python or TypeScript.
- Preserve unrelated dirty worktree changes and use ROS 2 logging interfaces for failures.

### Task 1: Define the ROS message contract

**Files:**
- Create: `src/driver/realman_msgs/msg/CartesianVelocityState.msg`
- Modify: `src/driver/realman_msgs/CMakeLists.txt` and `src/driver/realman_msgs/package.xml` only if the existing message generation does not already include `std_msgs`.
- Test: `src/driver/realman_msgs/test/test_interface_files.py`

**Interfaces:**
- Produces generated `realman_msgs.msg.CartesianVelocityState` with constants `BASE=0`, `WORK=1`, `TOOL=2` and fields for session state, command vectors, frame IDs, measured vectors, validity, and ages.

- [ ] **Step 1: Write the failing exact interface test**

  Extend `test_motion_action_contracts_are_exact` with an exact section assertion for:

  ```text
  uint8 BASE=0
  uint8 WORK=1
  uint8 TOOL=2
  std_msgs/Header header
  bool session_active
  uint8 reference_type
  string reference_name
  string command_frame_id
  float64[3] commanded_linear_velocity_mps
  float64[3] commanded_angular_velocity_radps
  float64[3] limited_linear_velocity_mps
  float64[3] limited_angular_velocity_radps
  string measured_frame_id
  float64[3] measured_linear_velocity_mps
  float64[3] measured_angular_velocity_radps
  bool measured_valid
  uint32 command_age_ms
  uint32 measured_age_ms
  ```

  and assert the file has no brace syntax.

- [ ] **Step 2: Run the focused test and verify it fails**

  Run:

  ```bash
  python3 -m pytest src/driver/realman_msgs/test/test_interface_files.py -q
  ```

  Expected: failure because the message file does not exist.

- [ ] **Step 3: Add the message and wire generation dependencies**

  Add the exact fields above to `CartesianVelocityState.msg`, include it in the existing `rosidl_generate_interfaces` list, and add only the dependency required by the existing generator pattern.

- [ ] **Step 4: Run the focused contract test**

  Run the same pytest command and expect all interface assertions to pass.

- [ ] **Step 5: Commit the isolated message change**

  ```bash
  git add src/driver/realman_msgs/msg/CartesianVelocityState.msg src/driver/realman_msgs/CMakeLists.txt src/driver/realman_msgs/package.xml src/driver/realman_msgs/test/test_interface_files.py
  git commit -m "feat: add Cartesian velocity state message"
  ```

### Task 2: Add deterministic pose-difference velocity math

**Files:**
- Create: `src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_telemetry.py`
- Test: `src/driver/realman_robot_driver/test/test_cartesian_velocity_telemetry.py`

**Interfaces:**
- Produces `PoseVelocityEstimator.update(stamp_ns: int, pose_xyzrpy: Sequence[float]) -> PoseVelocitySample`.
- `PoseVelocitySample` contains `linear_mps`, `angular_radps`, `valid`, and `age_ms`.

- [ ] **Step 1: Write failing estimator tests**

  Cover first-sample invalidity, linear displacement divided by elapsed seconds, small-axis angular displacement, non-positive timestamps, non-finite poses, and reset after a gap larger than the configured maximum sample age.

- [ ] **Step 2: Run the focused tests and verify failure**

  ```bash
  python3 -m pytest src/driver/realman_robot_driver/test/test_cartesian_velocity_telemetry.py -q
  ```

- [ ] **Step 3: Implement the estimator**

  Store one previous finite pose and timestamp. Compute linear velocity by `(current_xyz - previous_xyz) / dt`; compute angular velocity from wrapped Euler deltas in the FK pose's base-frame radians. Return invalid for the first sample, bad `dt`, non-finite values, or `dt` above the configured freshness bound. Do not silently return zeros as valid output.

- [ ] **Step 4: Run the estimator tests**

  Expect all cases to pass, including boundary values around the freshness limit.

- [ ] **Step 5: Commit the estimator**

  ```bash
  git add src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_telemetry.py src/driver/realman_robot_driver/test/test_cartesian_velocity_telemetry.py
  git commit -m "feat: estimate measured Cartesian velocity"
  ```

### Task 3: Publish driver telemetry and command state

**Files:**
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py`
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py`
- Modify: `src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py` only if a read-only FK/state helper is needed.
- Test: `src/driver/realman_robot_driver/test/test_realman_driver_node.py`
- Test: `src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py`

**Interfaces:**
- Publishes `/<arm>/cartesian_velocity/state` as `CartesianVelocityState` with volatile keep-last depth 10.
- Adds a session state callback carrying `commanded` and `limited` six-vectors, active reference, and command age; the callback never calls SDK methods.

- [ ] **Step 1: Add failing topic-wiring and state tests**

  Assert the node creates the namespaced state publisher, publishes the active reference/frame, preserves the raw and limited command vectors, marks a first measurement invalid, and publishes a valid linear/angular sample after two FK poses.

- [ ] **Step 2: Run the focused driver tests and verify failure**

  ```bash
  python3 -m pytest src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py src/driver/realman_robot_driver/test/test_realman_driver_node.py -q
  ```

- [ ] **Step 3: Implement minimal driver wiring**

  Create the state publisher; pass a thread-safe callback into `CartesianVelocitySession`; update the latest command snapshot from the session tick after clipping; in `_publish_state`, read joints, call the existing adapter FK method, update `PoseVelocityEstimator`, and publish `CartesianVelocityState` with explicit command/measured frames and ages. Reset the estimator on disconnect and mark the measurement invalid on state/FK errors.

- [ ] **Step 4: Run focused driver tests**

  Expect the new tests and existing driver/session tests to pass with no SDK command emitted by telemetry code.

- [ ] **Step 5: Commit driver telemetry**

  ```bash
  git add src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py src/driver/realman_robot_driver/test/test_realman_driver_node.py src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py
  git commit -m "feat: publish commanded and measured Cartesian velocity"
  ```

### Task 4: Forward telemetry through Web control

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/realman_web_control/action_bridge.py` only if a shared serializer is needed.
- Test: `src/driver/realman_web_control/test/test_input_mode_node.py` or a new focused `test_velocity_telemetry.py`.

**Interfaces:**
- Consumes `/<arm>/cartesian_velocity/state`.
- Produces WebSocket event `{type: "cartesian_velocity_state", arm, state}` with numeric arrays, frame IDs, validity and ages.

- [ ] **Step 1: Add failing Web bridge tests**

  Build a generated `CartesianVelocityState` message, invoke the subscription callback, and assert the serialized event preserves command/limited/measured values, frame IDs, `measured_valid`, and ages.

- [ ] **Step 2: Run focused Web tests and verify failure**

  ```bash
  python3 -m pytest src/driver/realman_web_control/test/test_velocity_telemetry.py -q
  ```

- [ ] **Step 3: Implement the subscription and event serialization**

  Import the generated message, subscribe per arm with the existing callback group and depth-10 QoS, convert fixed arrays to JSON-safe lists, and send the event to connected browsers without changing motion dispatch.

- [ ] **Step 4: Run Web bridge tests**

  Expect the focused test and existing Web control tests to pass.

- [ ] **Step 5: Commit the Web bridge**

  ```bash
  git add src/driver/realman_web_control/realman_web_control/web_control_node.py src/driver/realman_web_control/realman_web_control/action_bridge.py src/driver/realman_web_control/test/test_velocity_telemetry.py
  git commit -m "feat: stream Cartesian velocity telemetry to Web control"
  ```

### Task 5: Render dual-arm command/measured feedback

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Test: `website/tests/web-control/web-control.spec.ts`

**Interfaces:**
- Consumes the `cartesian_velocity_state` WebSocket event and renders l/r telemetry without changing keyboard bindings or mode selection.

- [ ] **Step 1: Add failing browser assertions**

  Add a mock telemetry event and assert the panel contains command and measured values, both frame IDs, a valid state, and a stale state when `measured_valid=false`.

- [ ] **Step 2: Run the focused browser test and verify failure**

  ```bash
  cd website && npx playwright test tests/web-control/web-control.spec.ts --grep "velocity telemetry"
  ```

- [ ] **Step 3: Implement the panel and event handler**

  Add a compact two-arm feedback block below the keyboard card; format linear/angular vectors and norms with fixed units; show `STALE/NO DATA` for invalid samples and include command/measured frame labels. Keep stable dimensions and responsive layout.

- [ ] **Step 4: Run browser tests and build**

  ```bash
  cd website && npx playwright test tests/web-control/web-control.spec.ts --grep "velocity telemetry" && npm run build
  ```

- [ ] **Step 5: Commit the Web UI**

  ```bash
  git add src/driver/realman_web_control/web/src/main.ts src/driver/realman_web_control/web/src/style.css website/tests/web-control/web-control.spec.ts src/driver/realman_web_control/web/dist
  git commit -m "feat: display Cartesian velocity feedback"
  ```

### Task 6: Update developer documentation and validate the full graph

**Files:**
- Modify: `website/docs/development/realman-action-development.md`
- Modify: `website/docs/development/realman-web-control.md`
- Modify: `website/docs/development/behavior-tree-motion.md`
- Test: existing documentation/site tests and repository validation commands.

- [ ] **Step 1: Document the topic contract**

  Record the message fields, command/measured frame semantics, 10 Hz pose-difference source, invalid/stale behavior, Web event, and `ros2 topic echo` examples.

- [ ] **Step 2: Run focused and full validation**

  ```bash
  python3 -m pytest src/driver/realman_msgs/test/test_interface_files.py src/driver/realman_robot_driver/test/test_cartesian_velocity_telemetry.py src/driver/realman_web_control/test/test_velocity_telemetry.py -q
  cd website && npm run build
  cd .. && bash -n rm65 && zsh -n functions.zsh && docker compose config
  ```

- [ ] **Step 3: Run the Humble package suite**

  Use the production image build or the existing Humble workspace command and require zero test failures before deployment.

- [ ] **Step 4: Read-only production check**

  After image rebuild/restart, confirm:

  ```bash
  ros2 topic list | grep '/cartesian_velocity/state'
  ros2 topic info /l/cartesian_velocity/state -v
  ros2 topic echo --once /l/cartesian_velocity/state
  ```

  Do not start a real velocity session or send a motion command as part of this validation.

- [ ] **Step 5: Commit documentation**

  ```bash
  git add website/docs/development/realman-action-development.md website/docs/development/realman-web-control.md website/docs/development/behavior-tree-motion.md
  git commit -m "docs: document Cartesian velocity telemetry"
  ```
