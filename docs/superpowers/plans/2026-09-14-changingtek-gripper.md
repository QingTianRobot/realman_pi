# Changingtek Gripper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将远程 changingtek_rtu_sdk 的并行多总线夹爪实现接入当前仓库的 ROS 2 service 和 Web control。

**Architecture:** 复制远程 SDK 的无副作用底层包与 `GripperBus/GripperDevice/GripperManager`，由单个 ROS manager 节点按根目录 YAML 暴露每个夹爪的兼容 service；Web control 通过异步 service client 和状态订阅提供浏览器控制。

**Tech Stack:** Python 3、minimalmodbus、pyserial、ROS 2 Humble/rclpy、ROS service、VitePress、TypeScript/Vite。

**Spec:** `docs/superpowers/specs/2026-09-14-changingtek-gripper-design.md`

## Global Constraints

- 根目录 `config/ros/gripper.yaml` 是运行时权威配置；包内 YAML 只保留兼容默认值或删除。
- ROS 节点使用官方 `rclpy` logger，不使用 stdout 重定向；串口操作始终经过总线锁。
- 不在导入 SDK 时打开串口或启动示例动作；默认不执行物理自动标定。
- 保留 `/gripper_left/*`、`/gripper_right/*` 现有 service 名称。

### Task 1: 移植底层 SDK 与并行驱动

**Files:**
- Create: `src/gripper/gripper_ros2/gripper_ros2/changingtek/__init__.py`
- Create: `src/gripper/gripper_ros2/gripper_ros2/changingtek/rtu_psdk.py`
- Create: `src/gripper/gripper_ros2/gripper_ros2/gripper_driver.py`
- Create: `src/gripper/gripper_ros2/test/test_gripper_driver.py`

**Interfaces:**
- `Changingtek_rtu_psdk(port, slave_id=1, baudrate=115200, timeout=0.3)` with `connect`, `disconnect`, `enable`, `temp_move`, `set_temp_position_mm`, `trigger_temp_move`, feedback methods and `griger_reset`.
- `GripperManager.add_bus`, `add_gripper`, `connect_all`, `start_all`, `stop_all`, `disconnect_all`, `request_move`, `snapshot`, `from_config`.
- `GripperDevice.enable`, `move_to`, `read_feedback`, `snapshot`.

- [ ] Write Fake SDK tests for shared bus/address switching, batch feedback, clamp/short write, reconnect, and manager routing.
- [ ] Run `python -m pytest src/gripper/gripper_ros2/test/test_gripper_driver.py -q` and confirm failure before implementation.
- [ ] Implement the SDK and driver from the remote reference without demo code or import-time serial access.
- [ ] Re-run the focused tests and then `python -m compileall src/gripper/gripper_ros2/gripper_ros2`.

### Task 2: ROS manager node and configuration

**Files:**
- Create: `config/ros/gripper.yaml`
- Create: `src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py`
- Modify: `src/gripper/gripper_ros2/launch/gripper.launch.py`
- Modify: `src/gripper/gripper_ros2/setup.py`
- Modify: `src/gripper/gripper_ros2/package.xml`
- Create: `src/gripper/gripper_ros2/test/test_gripper_manager_node.py`

**Interfaces:**
- Services under `/<device_name>/open`, `/close`, `/reset`, `/enable`, `/grasp_check`, `/percentage`, `/calibrate`.
- Topics under `/<device_name>/position`, `/speed`, `/current`, `/torque_reached`, `/alarm`, `/connected`.
- Config keys `buses`, `devices`, device fields `name`, `port`, `slave_id`, `open_position`, `close_position`, `min_position`, `max_position`, `speed_pct`, `force_pct`, `accel`, `decel`.

- [ ] Add node tests for percentage mapping, service error responses and configured names.
- [ ] Run focused node tests and verify failure before implementation.
- [ ] Implement manager lifecycle, callbacks, polling timer, service compatibility, and clean shutdown.
- [ ] Update launch to pass `config_file` from `REALMAN_CONFIG_ROOT` and preserve `side`, port, and open/close overrides.
- [ ] Run node tests, YAML parse, and package syntax checks.

### Task 3: Web control protocol and ROS bridge

**Files:**
- Modify: `src/driver/realman_web_control/realman_web_control/protocol.py`
- Modify: `src/driver/realman_web_control/realman_web_control/web_control_node.py`
- Modify: `src/driver/realman_web_control/realman_web_control/setup.py`
- Create or modify: `src/driver/realman_web_control/test/test_gripper_protocol.py`

**Interfaces:**
- Browser message `{type:"gripper_command", request_id, name, command, percentage?}`.
- Events `{type:"gripper_list", grippers:[...]}`, `{type:"gripper_state", ...}`, `{type:"gripper_result", ...}`.

- [ ] Add protocol tests for valid commands and invalid name/command/percentage.
- [ ] Run focused protocol tests and verify failure before implementation.
- [ ] Add YAML-driven service clients, topic subscriptions, async callbacks and result events.
- [ ] Emit cached gripper list/state on WebSocket client connect.
- [ ] Run all Web control Python tests.

### Task 4: Web UI, bringup wiring, and documentation

**Files:**
- Modify: `src/driver/realman_web_control/web/src/main.ts`
- Modify: `src/driver/realman_web_control/web/src/style.css`
- Modify: `src/driver/realman_web_control/package.xml`
- Modify: `src/realman_bringup/launch/system.launch.py`
- Modify: `config/docker/compose.yaml`
- Create or modify: `website/docs/development/gripper-control.md`
- Modify: `website/docs/development/index.md`

- [ ] Add frontend state/events and controls without changing robot motion behavior.
- [ ] Add launch/Compose parameters for `gripper_config_file` and optional manager startup.
- [ ] Document service/topic/WebSocket contracts, configuration units, startup, failure modes and validation.
- [ ] Run `npm run build`, launch/config syntax checks and relevant site tests.

### Task 5: Full verification

- [ ] Run focused and full Python tests, `git diff --check`, and `python -m compileall`.
- [ ] Run `colcon test` for affected packages when ROS dependencies are available.
- [ ] Run `npm run build` from `website/`.
- [ ] Review the final diff against the spec and report any hardware-only validation not run.
