# RealMan Behavior Tree Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** 将参考 `behavior_tree_cpp` 集成到 `realman_pi`，实现可动态切换控制权的行为树执行器、工业任务 mock 节点、独立测试入口和 Docker/网页调试链路。

**Architecture:** 保留现有 `motion_coordinator`/RealMan Action 作为底层执行器，新增 `realman_bt` 行为树适配包和 `realman_bt_mock` 隔离仿真包。控制模式由仲裁层以 owner/epoch/lease 管理；任务逻辑通过 XML SubTree、Fallback 和有限 Retry 编排。

**Tech Stack:** ROS 2 Humble、ament/colcon、C++17、参考 `behavior_tree_cpp`（bt_core/bt_nodes/bt_ros2/bt_server/bt_editor）、rclcpp/rclcpp_action、Python rclpy、GoogleTest/ament pytest、Docker Compose、VitePress。

**Spec:** `docs/superpowers/specs/2026-09-11-realman-behavior-tree-control-design.md`

## Global Constraints

- `bt_core` 保持零 ROS 依赖；RealMan 专属节点只放在 `src/behavior/realman_bt`。
- mock 节点只使用 `/realman/mock/*` 命名空间，不发布生产控制命令，不连接 RealMan SDK/CAN。
- 所有长耗时节点首拍返回 `RUNNING`，后续 tick 等反馈；`halt()` 必须取消未完成 Action。
- 控制模式固定为 `none`、`web`、`policy`、`teleop`；旧 owner/epoch 的命令必须 fail-closed。
- 配置源只能新增到根 `config/`；ROS 日志使用官方 rcutils 并挂载宿主 `logs/`。
- 每个任务完成独立测试后提交；实现前使用 TDD，先写失败测试再写最小实现。

### Task 1: Vendor BehaviorTree.CPP-X and make it buildable

**Files:**
- Create: `third_party/behavior_tree_cpp/` (copy the reference `bt_core`, `bt_nodes`, `bt_ros2`, `bt_server`, `cmake`, `third_party` sources and required licenses)
- Create: `third_party/behavior_tree_cpp/VENDOR_REVISION`
- Modify: `config/docker/ros2-humble-rviz.Dockerfile`
- Modify: `.dockerignore`
- Test: `tests/test_behavior_tree_vendor.sh`

**Interfaces:**
- Produces an in-tree `bt_ros2` ament package and installable `bt::core`/`bt::nodes` targets for downstream packages.
- The vendor revision file records the source path, upstream commit hash, and license notice; builds must not reference `/home/.../Downloads`.

- [ ] Step 1: Add a shell test that fails when `third_party/behavior_tree_cpp/bt_core/CMakeLists.txt`, `bt_nodes/CMakeLists.txt`, `bt_ros2/package.xml`, or `bt_server/CMakeLists.txt` is missing, and when the Dockerfile does not copy the vendor tree.
- [ ] Step 2: Run `bash tests/test_behavior_tree_vendor.sh`; expect failure before the vendor snapshot exists.
- [ ] Step 3: Copy the reference sources, preserve `THIRD_PARTY_NOTICES.md`, add `VENDOR_REVISION`, and update the Docker build context so colcon sees `bt_ros2` and CMake can build `bt_core`/`bt_nodes`.
- [ ] Step 4: Run `bash tests/test_behavior_tree_vendor.sh`; expect PASS, then run `docker compose config` to verify the build context and mounts.
- [ ] Step 5: Commit with `git add third_party config/docker tests/test_behavior_tree_vendor.sh && git commit -m "build: vendor behavior tree runtime"`.

### Task 2: Add typed control-mode interfaces

**Files:**
- Create: `src/driver/realman_msgs/msg/ControlMode.msg`
- Create: `src/driver/realman_msgs/msg/ControlModeRequest.msg`
- Create: `src/driver/realman_msgs/msg/ControlModeState.msg`
- Create: `src/driver/realman_msgs/action/SwitchControlMode.action`
- Create: `src/driver/realman_msgs/srv/RequestControlMode.srv`
- Modify: `src/driver/realman_msgs/CMakeLists.txt`
- Modify: `src/driver/realman_msgs/package.xml`
- Modify: `src/driver/realman_msgs/test/test_interface_files.py`

**Interfaces:**
- `ControlMode.msg`: constants `NONE=0`, `WEB=1`, `POLICY=2`, `TELEOP=3`; fields `uint8 mode`, `string owner_id`, `uint64 epoch`, `builtin_interfaces/Time stamp`.
- `ControlModeRequest.msg`: `uint8 requested_mode`, `string owner_id`, `string reason`, `uint32 lease_timeout_ms`, `uint64 request_id`.
- `ControlModeState.msg`: constants for `IDLE`, `REQUESTED`, `STOPPING_CURRENT`, `CANCELING_MOTION`, `VERIFYING_SAFE`, `ACTIVATING_BACKEND`, `CONFIRMING_LEASE`, `ACTIVE`, `FAILED`; fields `uint8 current_mode`, `uint8 requested_mode`, `uint8 phase`, `string owner_id`, `uint64 epoch`, `uint32 lease_remaining_ms`, `bool healthy`, `string failure_code`, `string detail`.
- `SwitchControlMode.action`: goal `uint8 requested_mode`, `string owner_id`, `string reason`, `uint32 timeout_ms`, `uint32 lease_timeout_ms`; result `bool success`, `uint8 terminal_state`, `uint64 epoch`, `string message`; feedback `uint8 phase`, `uint8 current_mode`, `uint8 requested_mode`, `uint64 epoch`, `float32 progress`, `string detail`.
- `RequestControlMode.srv`: request `uint8 requested_mode`, `string owner_id`, `string reason`, `uint32 lease_timeout_ms`; response `bool accepted`, `uint64 request_id`, `string message`.

- [ ] Step 1: Extend `test_interface_files.py` with exact section assertions for every new message/action/service and enum values.
- [ ] Step 2: Run `python3 -m pytest src/driver/realman_msgs/test/test_interface_files.py -q`; expect failure for missing files.
- [ ] Step 3: Add the IDL files, generator entries, `builtin_interfaces` dependency, and package metadata.
- [ ] Step 4: Run the same pytest plus `colcon build --packages-select realman_msgs`; expect PASS and generated Python/C++ types.
- [ ] Step 5: Commit with `git add src/driver/realman_msgs && git commit -m "feat: add control mode interfaces"`.

### Task 3: Implement ROS-free control-mode state machine

**Files:**
- Create: `src/behavior/realman_bt/include/realman_bt/control_mode_types.hpp`
- Create: `src/behavior/realman_bt/include/realman_bt/control_mode_state_machine.hpp`
- Create: `src/behavior/realman_bt/src/control_mode_state_machine.cpp`
- Create: `src/behavior/realman_bt/test/test_control_mode_state_machine.cpp`
- Create: `src/behavior/realman_bt/CMakeLists.txt`
- Create: `src/behavior/realman_bt/package.xml`

**Interfaces:**
- `enum class ControlMode { NONE, WEB, POLICY, TELEOP }` with strict string conversion.
- `enum class SwitchPhase` matching `ControlModeState` phases.
- `ControlModeStateMachine::request(mode, owner, lease_timeout_ms, now)` returns a request id or a typed rejection.
- `advance(event, now)` returns a transition record; `cancel()` transitions to safe `NONE`; `leaseValid(now)` rejects expired owners.

- [ ] Step 1: Write tests for valid mode parsing, unknown mode rejection, request sequencing, owner/epoch increment, lease expiry, stale epoch rejection, cancel-to-none, and failure rollback.
- [ ] Step 2: Run `colcon test --packages-select realman_bt --ctest-args -R test_control_mode_state_machine`; expect failure because the package and implementation are absent.
- [ ] Step 3: Implement the deterministic state machine without rclcpp, sleeping, or ROS logging; inject a monotonic clock value into every transition.
- [ ] Step 4: Run the focused test and `colcon test-result --verbose`; expect PASS.
- [ ] Step 5: Commit with `git add src/behavior/realman_bt && git commit -m "feat: add control mode state machine"`.

### Task 4: Implement arbiter node and behavior-tree plugin nodes

**Files:**
- Create: `src/behavior/realman_bt/src/control_mode_arbiter_node.cpp`
- Create: `src/behavior/realman_bt/src/realman_bt_nodes.cpp`
- Create: `src/behavior/realman_bt/include/realman_bt/control_mode_arbiter_node.hpp`
- Create: `src/behavior/realman_bt/include/realman_bt/action_client_node.hpp`
- Create: `src/behavior/realman_bt/launch/realman_bt.launch.py`
- Create: `src/behavior/realman_bt/config/` only for package metadata; runtime values go in `config/ros/behavior_tree.yaml`
- Create: `src/behavior/realman_bt/test/test_realman_bt_nodes.cpp`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`
- Modify: `src/behavior/realman_bt/package.xml`

**Interfaces:**
- Arbiter publishes `/realman/control/state`, serves `/realman/control/request_mode`, and exposes `SwitchControlMode` on `/realman/control/switch_mode`.
- Arbiter calls existing per-arm motion cancellation/stop interfaces before activating a new owner.
- Plugin nodes register `SelectControlMode`, `SwitchControlMode`, `ControlLeaseGuard`, `ExecuteMotion`, `ExecuteTrajectory`, `CheckSafetyState`, and `RecordTaskFailure` through the reference `NodeFactory`.
- Every Action node maps `SUCCEEDED` to `SUCCESS`, `CANCELED/TIMEOUT/ABORTED` to `FAILURE`, writes `failure_code`, and cancels in `onHalted()`.

- [ ] Step 1: Add unit tests using fake action clients and fake arbiter responses; assert one goal per attempt, RUNNING feedback propagation, halt cancellation, owner/epoch guard, and failure blackboard fields.
- [ ] Step 2: Run the focused C++ tests; expect failure before node implementation.
- [ ] Step 3: Implement the ROS node, blackboard handle injection, action-client leaf base, plugin registration, and launch parameters `tree_file`, `tick_rate_hz`, `status_topic`, `stop_on_terminal`.
- [ ] Step 4: Run `colcon build --packages-select realman_bt` and `colcon test --packages-select realman_bt`; expect PASS.
- [ ] Step 5: Commit with `git add src/behavior/realman_bt && git commit -m "feat: add realman behavior tree nodes"`.

### Task 5: Add control-mode and grasp-retry XML trees

**Files:**
- Create: `config/ros/behavior_tree.yaml`
- Create: `config/behavior-trees/control_mode.xml`
- Create: `config/behavior-trees/pick_task.xml`
- Create: `config/behavior-trees/approach_and_grasp.xml`
- Create: `src/behavior/realman_bt/test/test_tree_contract.py`
- Modify: `src/behavior/realman_bt/CMakeLists.txt`

**Interfaces:**
- `control_mode.xml` contains `SelectControlMode → SwitchControlMode → ControlLeaseGuard` and a supervisor subtree for re-evaluation after preemption.
- `pick_task.xml` uses `Fallback` for top/side viewpoints, bounded `Retry`, `CheckSafetyState`, `RecordTaskFailure`, and explicit recovery.
- YAML fields: `tree_file`, `tick_rate_hz`, `switch_timeout_ms`, `default_lease_timeout_ms`, `safe_fallback_mode`, `workspace_dir`.

- [ ] Step 1: Add Python contract tests that assert unique `main_tree_to_execute`, required subtrees/nodes, bounded retry values, no production topic names in mock trees, and no absolute `/home/...` paths.
- [ ] Step 2: Run `python3 -m pytest src/behavior/realman_bt/test/test_tree_contract.py -q`; expect failure for missing trees/config.
- [ ] Step 3: Add the XML trees and install rules; keep all runtime configuration in root `config/` with explanatory comments.
- [ ] Step 4: Run the contract test and the vendor XML parser/validation command inside the built workspace; expect PASS.
- [ ] Step 5: Commit with `git add config/ros/behavior_tree.yaml config/behavior-trees src/behavior/realman_bt && git commit -m "feat: add control and grasp behavior trees"`.

### Task 6: Implement isolated mock package and scenario controls

**Files:**
- Create: `src/behavior/realman_bt_mock/package.xml`
- Create: `src/behavior/realman_bt_mock/setup.py`
- Create: `src/behavior/realman_bt_mock/realman_bt_mock/mock_control_mode_source_node.py`
- Create: `src/behavior/realman_bt_mock/realman_bt_mock/mock_control_backend_node.py`
- Create: `src/behavior/realman_bt_mock/realman_bt_mock/mock_motion_action_server_node.py`
- Create: `src/behavior/realman_bt_mock/realman_bt_mock/motion_command_recorder_node.py`
- Create: `src/behavior/realman_bt_mock/launch/behavior_tree_mock.launch.py`
- Create: `src/behavior/realman_bt_mock/config/mock_behavior.yaml`
- Create: `src/behavior/realman_bt_mock/test/test_mock_nodes.py`

**Interfaces:**
- All nodes use `/realman/mock/*` topics/services/actions and `rclpy` official logging.
- `MockControlModeSourceNode` provides `/realman/mock/set_mode` and atomic JSON facts updates; invalid updates preserve previous state.
- `MockControlBackendNode` parameters: `start_delay_sec`, `health`, `reject_switch`, `lease_timeout_ms`.
- `MockMotionActionServerNode` implements existing `ExecuteMotion` and `ExecuteTrajectory` actions with `success`, `reject`, `timeout`, `blocked`, `safety_blocked`, `cancel` modes.
- Recorder writes JSONL fields `stamp`, `mode`, `owner_id`, `epoch`, `action`, `sequence`, `result`, `failure_code`.

- [ ] Step 1: Write pytest tests for atomic mode updates, invalid mode rejection, deterministic feedback, cancel result, backend health failure, and recorder JSONL schema.
- [ ] Step 2: Run `pytest src/behavior/realman_bt_mock/test/test_mock_nodes.py -q`; expect failure before package code exists.
- [ ] Step 3: Implement nodes, setup entry points, launch arguments `tree_file`, `action_result_mode`, `motion_duration_sec`, `switch_result_mode`, `record_file`, `ros_domain_id`.
- [ ] Step 4: Run the focused pytest and `colcon build --packages-select realman_bt_mock`; expect PASS.
- [ ] Step 5: Commit with `git add src/behavior/realman_bt_mock && git commit -m "test: add isolated behavior tree mocks"`.

### Task 7: Add launch-testing integration scenarios

**Files:**
- Create: `src/behavior/realman_bt_mock/test/test_behavior_tree_mock_runtime.py`
- Create: `src/behavior/realman_bt_mock/test/scenarios.yaml`
- Modify: `src/behavior/realman_bt_mock/CMakeLists.txt` or `setup.py` test metadata

**Interfaces:**
- Runtime test launches an isolated ROS domain with mock source/backend/action server, arbiter, executor, and recorder.
- Scenarios: `happy_web`, `policy_preempts_web`, `teleop_preempts_policy`, `grasp_top_then_side`, `retry_exhausted`, `safety_blocked_fail_closed`, `lease_expired`, `cancel_on_halt`.

- [ ] Step 1: Write launch tests that wait for services/actions, inject each scenario, and assert root state, active node, mode/owner/epoch, cancel/stop events, failure code, and recorder entries.
- [ ] Step 2: Run `colcon test --packages-select realman_bt_mock --ctest-args -R test_behavior_tree_mock_runtime`; expect failure before runtime graph is complete.
- [ ] Step 3: Implement scenario loading and deterministic assertions; ensure no test depends on fixed sleeps when a service/action readiness check is available.
- [ ] Step 4: Run all launch tests twice with two ROS domains; expect both runs PASS and no leaked nodes/files.
- [ ] Step 5: Commit with `git add src/behavior/realman_bt_mock && git commit -m "test: cover behavior tree switching and retry scenarios"`.

### Task 8: Integrate Docker, Compose, and bringup entry points

**Files:**
- Modify: `config/docker/ros2-humble-rviz.Dockerfile`
- Modify: `config/docker/compose.yaml`
- Modify: `src/realman_bringup/launch/system.launch.py`
- Modify: `src/realman_bringup/CMakeLists.txt`
- Modify: `src/realman_bringup/package.xml`
- Modify: `rm65`
- Modify: `functions.zsh`
- Test: `tests/test_rm65_entry.sh`

**Interfaces:**
- Add Compose services `realman_bt_executor`, `realman_bt_mock`, and optional `realman_bt_web`; mock service is isolated from production services.
- Add launch switches `start_behavior_tree`, `start_control_mode_arbiter`, `behavior_tree_config_file`, `behavior_tree_file`.
- Add `./rm65 bt-test build|mock|web|all`; `build` only builds behavior packages, `mock` starts the isolated graph, `web` starts graph plus HTTP/editor, `all` runs the scenario matrix.
- Preserve `REALMAN_LOG_ROOT`, `ROS_LOG_DIR`, `RCUTILS_COLORIZED_OUTPUT=1`, config mounts, and host networking conventions.

- [ ] Step 1: Extend `tests/test_rm65_entry.sh` with dry-run assertions for every `bt-test` subcommand and unknown-subcommand failure.
- [ ] Step 2: Run the focused shell test; expect failure for missing command paths/services.
- [ ] Step 3: Update Docker build package list, Compose commands/volumes/profiles, bringup launch arguments, and shell entry points.
- [ ] Step 4: Run `bash tests/test_rm65_entry.sh`, `bash -n rm65`, `zsh -n functions.zsh`, and `docker compose config`; expect PASS.
- [ ] Step 5: Commit with `git add config/docker src/realman_bringup rm65 functions.zsh tests/test_rm65_entry.sh && git commit -m "build: integrate behavior tree runtime and mock bringup"`.

### Task 9: Add Web developer manual and validation commands

**Files:**
- Create: `website/docs/development/behavior-tree-control.md`
- Modify: `website/docs/development/index.md`
- Modify: `website/docs/.vitepress/config.mts` or authoritative config under `config/website/` according to existing adapter layout
- Modify: `website/tests/site.spec.ts`

**Interfaces:**
- Document package boundaries, mode/owner/epoch/lease contracts, ROS topics/actions/services, XML trees, mock scenarios, Docker services, web debugging, failure modes, and exact commands.
- Add the new page to the developer navigation and route smoke test.

- [ ] Step 1: Add a route assertion and page-content assertions for `/development/behavior-tree-control`.
- [ ] Step 2: Run the focused site test; expect failure because the route/page is absent.
- [ ] Step 3: Write the page using current behavior, link the design/spec and existing RealMan Action documentation, and update navigation.
- [ ] Step 4: Run `cd website && npm run build` and the relevant Playwright site test; expect PASS.
- [ ] Step 5: Commit with `git add website && git commit -m "docs: document behavior tree control and mock testing"`.

### Task 10: Full verification and release checkpoint

**Files:**
- Modify: `docs/superpowers/specs/2026-09-11-realman-behavior-tree-control-design.md` only if implementation behavior requires a documented correction
- Modify: `website/docs/development/behavior-tree-control.md` for any verified command/output change

- [ ] Step 1: Run `git diff --check`, `bash -n rm65`, `zsh -n functions.zsh`, and `docker compose config`.
- [ ] Step 2: Build and test all affected ROS packages with `colcon build --symlink-install --packages-up-to realman_bt_mock realman_bt realman_msgs` and `colcon test --packages-select realman_msgs realman_bt realman_bt_mock realman_bringup`.
- [ ] Step 3: Run `./rm65 bt-test all` in an isolated ROS domain and retain the JSONL recorder plus launch logs as evidence.
- [ ] Step 4: Run `cd website && npm run build` and relevant site tests.
- [ ] Step 5: Review the final ROS graph to prove mock nodes are absent from production Compose services and verify logs contain timestamped ROS node files.
- [ ] Step 6: Commit any final documentation/test-only corrections with `git commit -m "test: verify behavior tree control integration"`.
