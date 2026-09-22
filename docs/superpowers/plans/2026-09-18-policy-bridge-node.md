# Policy Bridge Node Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增独立 ROS 2 Python 节点 `policy_bridge_node`，作为 VLA 策略服务与 realman_pi ROS 2 图之间的纯协议转换层：上行把图像/7 维 state/prompt 打包经 WebSocket 发起推理，下行把动作块 `(16,7)` 按模式原样包装为 ROS 2 消息发布。

**Architecture:** 节点是配置驱动的单向转换器。上行 `ObservationBuilder` 从配置的 topic 采集并组装 obs；`InferenceScheduler` 以滚动时域在线程池中调用 `WsClient`；下行 `ChunkBuffer` 缓存校验后的动作，`Dispatcher` 按 `ModeWatcher` 的内部状态构造 `TwistStamped`/`PoseStamped`，`GripperPublisher` 发 `Float32`。`ModeWatcher` 订阅既有 `InputModeState`，是唯一模式来源。节点不读机械臂状态做闭环、不积分、不管理 Action session。

**Tech Stack:** Python 3.10、ROS 2 Humble/rclpy、ament_python、`websockets`、`numpy`、`PyYAML`、pytest、Docker Compose host networking。

**Spec:** `docs/superpowers/specs/2026-09-18-policy-bridge-node-design.md`

## Global Constraints

- 权威配置只在 `config/ros/policy_bridge.yaml`；包内不放第二份运行配置（`project-config-layout`）。
- 所有运行日志只用 rclpy `get_logger()`，禁止 `print`；`RCUTILS_COLORIZED_OUTPUT=1`；日志落 `logs/YYYYMMDD_HHMMSS/`（`ros2-logging-conventions`）。
- `active_mode` 合法字符串唯一来源是 `config/behavior-trees/control_router.xml` 的 `InputModeGuard` 字面量（当前 `web/policy/pika/none`）；桥接节点不定义模式枚举。
- 桥接节点保持纯转换层：不开/关 `cartesian_velocity` Action session、不做 topic→service 适配、不直连串口（这些属于 Router/驱动，见风险登记表 R1/R3/R4）。
- 下行速度模式复用驱动既有 `/{arm}/cartesian_velocity/command`（`TwistStamped`，QoS `depth=1/VOLATILE/lifespan=velocity_watchdog_ms=100ms`）。`header.stamp` 必须为 ROS 时钟 `now()`，发布频率必须快于 100ms（默认 50Hz）。
- 队列空 / inactive / 急停时**停发**（不发零速），让驱动 `CartesianVelocitySession` 看门狗接管。
- 一期范围：速度模式下行 + `joint_states` 占位上行 + `arm_names=[l,r]` + 独立容器 `./rm65 up policy`。位置模式接口就绪但默认不启用（`position_modes: []`）。
- 每个 Task 遵循 TDD：先写失败测试（RED），再实现（GREEN），最后提交。

## 一期 ROS / WebSocket 接口契约汇总

**订阅（上行观测源，topic 名全部来自配置）**

| 用途 | 默认 topic | 类型 | 备注 |
|---|---|---|---|
| 腕部图像 | `/camera_left/color/image_raw` | `sensor_msgs/Image` | obs 字段 `wrist_image` |
| 全局图像 | `/camera_global/d435/color/image_raw` | `sensor_msgs/Image` | obs 字段 `global_image`（独立 RealSense D435） |
| 关节状态 | `/l/joint_states`、`/r/joint_states` | `sensor_msgs/JointState` | 一期占位 state[0:6] |
| 夹爪位置 | `/gripper_left/position`、`/gripper_right/position` | `std_msgs/Float64` | 设备单位，换算为 state[6] 0~1 |
| 模式状态 | `/realman_bt_executor/input_mode_state` | `realman_msgs/InputModeState` | `phase` 为 uint8：ACTIVE=0/SWITCHING=1/FAILED=2 |
| prompt 更新 | `/policy/prompt` | `std_msgs/String` | 可选，运行时更新 |

**发布（下行）**

| topic | 类型 | 模式 | 备注 |
|---|---|---|---|
| `/pi05_policy/{l,r}/cartesian_velocity` | `geometry_msgs/TwistStamped` | velocity | stamp=ROS now()，50Hz |
| `/pi05_policy/{l,r}/cartesian_pose` | `geometry_msgs/PoseStamped` | position | 一期不启用 |
| `/pi05_policy/{l,r}/gripper_percentage` | `std_msgs/Float32` | velocity+position | 0~1，0=闭合 |
| `/policy/stats` | `diagnostic_msgs/DiagnosticArray` | 始终 | 指标汇总 |

**服务（生命周期）**

| 服务 | 类型 | 行为 |
|---|---|---|
| `/policy/activate` | `std_srvs/SetBool` | 清队、重置失败计数、允许推理与发布 |
| `/policy/deactivate` | `std_srvs/SetBool` | 停止发布，观测继续 |
| `/policy/emergency_stop` | `std_srvs/Trigger` | 清队、立即停发 |
| `/policy/set_prompt` | `std_srvs/SetBool`（一期占位，prompt 走 topic）| 更新 prompt、清队 |
| `/policy/force_infer` | `std_srvs/Trigger` | 立即推理一次 |

**WebSocket 协议（与策略服务约定，字段名固定）**

- 请求 obs：`{"state": float[7], "wrist_image": <编码>, "global_image": <编码>, "prompt": str}`。
- 响应 actions：`{"actions": float[action_horizon][7]}`，形状必须 `(16,7)`。

---

### Task 1: 包骨架与配置加载器

**Files:**
- Create: `src/policy_bridge/package.xml`
- Create: `src/policy_bridge/setup.py`
- Create: `src/policy_bridge/setup.cfg`
- Create: `src/policy_bridge/resource/policy_bridge`
- Create: `src/policy_bridge/policy_bridge/__init__.py`
- Create: `src/policy_bridge/policy_bridge/config_loader.py`
- Create: `src/policy_bridge/test/test_config_loader.py`
- Create: `config/ros/policy_bridge.yaml`

**Interfaces:**
- `config_loader.load(path: str) -> PolicyBridgeConfig`：读 YAML、展开 `${ENV:-default}`、构造 dataclass、执行启动校验，失败抛 `ConfigError`。
- `PolicyBridgeConfig` dataclass 段：`arms(arm_names)`、`network`、`observation`、`prompt`、`action`、`downlink`、`mode`、`lifecycle`。
- 启动校验规则：至少一路 `image_topics.enabled`；`state_expected_dim == 7`；`command_namespace` 以 `/` 开头；`velocity_modes/position_modes/inactive_modes` 三类互不重叠；`smoothing_alpha ∈ (0,1]`；velocity/position `frame_ids` 左右非空；`publish_rate_hz > 0`。**topic 存在性不校验**。
- `arm_names` 一期固定 `[l, r]`。

- [ ] **Step 1: 写失败测试** 覆盖：合法配置加载、env 展开、缺 enabled 图像报错、维度≠7 报错、namespace 不以 `/` 开头报错、三类模式重叠报错、`smoothing_alpha` 越界报错、frame_ids 缺失报错。
- [ ] **Step 2: 运行 `pytest src/policy_bridge/test/test_config_loader.py` 确认 RED**（模块不存在）。
- [ ] **Step 3: 实现** `config_loader.py`（dataclass + `_expand_env` + `_validate`）与包骨架文件；写 `config/ros/policy_bridge.yaml` 权威配置并加解释性注释。
- [ ] **Step 4: 运行测试确认 GREEN**，`python -m compileall src/policy_bridge`。
- [ ] **Step 5: 提交** `feat: add policy_bridge package skeleton and config loader`。

### Task 2: ModeWatcher（订阅 InputModeState）

**Files:**
- Create: `src/policy_bridge/policy_bridge/mode/__init__.py`
- Create: `src/policy_bridge/policy_bridge/mode/mode_watcher.py`
- Create: `src/policy_bridge/test/test_mode_watcher.py`

**Interfaces:**
- `ModeWatcher(node, mode_cfg, on_state_change: Callable[[str], None])`：订阅 `InputModeState`。
- 映射：`active_mode ∈ velocity_modes` 且 `phase == InputModeState.ACTIVE`（uint8 0）→ `"velocity"`；`∈ position_modes` 且 ACTIVE → `"position"`；其余（含 `phase != ACTIVE`、`∈ inactive_modes`、未知）→ `"inactive"`。
- 未知 `active_mode` 首次 WARN 一次，走 `default_when_unknown`。
- 内部状态变化时调用 `on_state_change(new_internal)`（由节点清队）。

- [ ] **Step 1: 写失败测试** 用假 msg 覆盖：policy+ACTIVE(uint8 0)→velocity、policy+SWITCHING(1)→inactive、none→inactive、web/pika→inactive、未知字符串→inactive 且 WARN 一次、状态变化触发回调、相同状态不重复触发。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** `mode_watcher.py`。
- [ ] **Step 4: 运行确认 GREEN。**
- [ ] **Step 5: 提交** `feat: add policy_bridge mode watcher bound to InputModeState`。

### Task 3: 校验器与动作块缓冲

**Files:**
- Create: `src/policy_bridge/policy_bridge/inference/__init__.py`
- Create: `src/policy_bridge/policy_bridge/inference/validators.py`
- Create: `src/policy_bridge/policy_bridge/action/__init__.py`
- Create: `src/policy_bridge/policy_bridge/action/chunk_buffer.py`
- Create: `src/policy_bridge/test/test_validators.py`
- Create: `src/policy_bridge/test/test_chunk_buffer.py`

**Interfaces:**
- `validators.check(chunk, action_cfg) -> np.ndarray | None`：形状 `(action_horizon, 7)`、无 NaN/Inf、clip 到 `action_clip`；不合格返回 `None`。
- `ActionChunkBuffer(maxlen)`：`extend(steps)`、`popleft() -> np.ndarray | None`、`clear(reason)`、`__len__`、`remaining`。只入队前 `steps_per_inference` 步由调用方切片。

- [ ] **Step 1: 写失败测试** validators：正确形状通过、错误形状拒绝、NaN/Inf 拒绝、clip 生效；buffer：extend/popleft FIFO、空返回 None、clear 清空、maxlen 上限。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** `validators.py` 与 `chunk_buffer.py`。
- [ ] **Step 4: 运行确认 GREEN。**
- [ ] **Step 5: 提交** `feat: add policy_bridge action validators and chunk buffer`。

### Task 4: Dispatcher（速度模式）与 GripperPublisher

**Files:**
- Create: `src/policy_bridge/policy_bridge/action/dispatcher.py`
- Create: `src/policy_bridge/policy_bridge/gripper/__init__.py`
- Create: `src/policy_bridge/policy_bridge/gripper/gripper_publisher.py`
- Create: `src/policy_bridge/test/test_dispatcher.py`

**Interfaces:**
- `Dispatcher(node, downlink_cfg, arm_names)`：按内部模式创建发布者；`publish_arm(internal_mode, side, action6, stamp)` 构造 `TwistStamped`（velocity，`twist_scale` 还原，`frame_id` 显式，`header.stamp` 传入 ROS now()）；position 分支构造 `PoseStamped`（一期不启用但接口就绪，`xyz_euler`→四元数）；`inactive` 不发布。
- 一阶低通平滑 `a_smooth = α·a_new + (1-α)·a_last`，clip 到 SI 上限。
- `GripperPublisher(node, gripper_cfg)`：`publish(side, value)` clip `[0,1]`、独立平滑、发 `Float32`；`reset_cache()`；队列空/inactive 不发。

- [ ] **Step 1: 写失败测试** 用假 publisher 捕获消息：velocity 装填 linear/angular 与 scale、frame_id、stamp 透传；position 装填 euler→quat（接口测试）；inactive 不发；平滑系数生效；夹爪 clip 与平滑、reset_cache 清缓存。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** `dispatcher.py` 与 `gripper_publisher.py`。
- [ ] **Step 4: 运行确认 GREEN。**
- [ ] **Step 5: 提交** `feat: add policy_bridge velocity dispatcher and gripper publisher`。

### Task 5: ObservationBuilder（joint_states 占位上行）

**Files:**
- Create: `src/policy_bridge/policy_bridge/observation/__init__.py`
- Create: `src/policy_bridge/policy_bridge/observation/image_aggregator.py`
- Create: `src/policy_bridge/policy_bridge/observation/state_composer.py`
- Create: `src/policy_bridge/policy_bridge/observation/observation_builder.py`
- Create: `src/policy_bridge/policy_bridge/prompt_provider.py`
- Create: `src/policy_bridge/test/test_state_composer.py`

**Interfaces:**
- `ImageAggregator(node, image_cfg)`：多路 `ApproximateTimeSynchronizer`（`slop_s`）/ 单路 latest；返回 `{name: np.uint8[H,W,3]}` 或 `None`。
- `StateComposer(node, obs_cfg, gripper_yaml)`：订阅 `joint_states`（每臂取前 6 关节位置）与夹爪 `position`（`Float64` 设备单位，用 `open/close_position` 换算 0~1）；`compose(side) -> np.float32[7] | None`，任一必需源未就绪返回 `None`。
- `PromptProvider(node, prompt_cfg)`：`current() -> str`，订阅 `prompt.topic` 更新。
- `ObservationBuilder`：`build(side) -> dict | None`，字段名固定 `state/wrist_image/global_image/prompt`。

- [ ] **Step 1: 写失败测试** state_composer：joint+夹爪就绪返回 7 维、缺任一返回 None、夹爪设备单位→百分比换算正确、越界 clip。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** observation 子模块与 prompt_provider。
- [ ] **Step 4: 运行确认 GREEN。**
- [ ] **Step 5: 提交** `feat: add policy_bridge observation builder with joint_states placeholder`。

### Task 6: WsClient 与 InferenceScheduler

**Files:**
- Create: `src/policy_bridge/policy_bridge/inference/ws_client.py`
- Create: `src/policy_bridge/policy_bridge/inference/scheduler.py`
- Create: `src/policy_bridge/test/test_scheduler.py`

**Interfaces:**
- `WsClient(network_cfg)`：`connect()`、`infer(obs) -> dict`（超时 `infer_timeout_s`）、指数退避重连；断开时 `is_connected == False`。可注入 transport 以便测试用假实现。
- `InferenceScheduler(node, cfg, on_chunk, buffer, obs_builder)`：滚动时域触发（队列空 / 剩余 ≤ `inference_lead_steps` / force）；`ThreadPoolExecutor(inference_threads)`；防重入（正在推理忽略新触发）；结果经 `validators.check` 后回调 `on_chunk`；结果通过线程安全队列交由发布定时器消费，**不在 WS 线程直接 publish**。

- [ ] **Step 1: 写失败测试** 用假 WsClient：触发条件（空队列/lead 阈值/force）、防重入、超时丢弃不覆盖旧队列、连续失败计数达 5 暂停、恢复需 activate。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** `ws_client.py` 与 `scheduler.py`。
- [ ] **Step 4: 运行确认 GREEN。**
- [ ] **Step 5: 提交** `feat: add policy_bridge websocket client and rolling-horizon scheduler`。

### Task 7: 节点装配、生命周期服务与 Stats

**Files:**
- Create: `src/policy_bridge/policy_bridge/policy_bridge_node.py`
- Create: `src/policy_bridge/policy_bridge/lifecycle/__init__.py`
- Create: `src/policy_bridge/policy_bridge/lifecycle/services.py`
- Create: `src/policy_bridge/policy_bridge/stats.py`
- Create: `src/policy_bridge/test/test_node_smoke.py`

**Interfaces:**
- `PolicyBridgeNode(rclpy.Node)`：参数 `config_file`；装配上述子系统；`create_timer(1/publish_rate_hz)` 发布循环（inactive/队列空跳过；否则 pop→平滑→dispatcher+gripper）；`ModeWatcher` 回调清队。
- `LifecycleServices`：注册 5 个服务；activate 清队+重置失败计数+允许发布；deactivate 停发；emergency_stop 清队+停发；set_prompt 更新+清队；force_infer 触发一次。
- `Stats`：`bump(name)`、定时发布 `DiagnosticArray` 到 `/policy/stats`。
- `main()`：`MultiThreadedExecutor`，`RCUTILS_COLORIZED_OUTPUT` 由 launch 环境提供。

- [ ] **Step 1: 写失败测试** 冒烟：加载测试配置构造节点不崩溃；发布定时器在 inactive 不发、在 velocity 且队列非空时发；activate/deactivate/estop 服务改变发布行为；force_infer 触发调度。
- [ ] **Step 2: 运行确认 RED。**
- [ ] **Step 3: 实现** 节点、服务、stats。
- [ ] **Step 4: 运行确认 GREEN**，`python -m compileall`。
- [ ] **Step 5: 提交** `feat: assemble policy_bridge node with lifecycle services and stats`。

### Task 8: Launch、容器与 `./rm65 up policy` 入口

**Files:**
- Create: `src/policy_bridge/launch/policy_bridge.launch.py`
- Modify: `config/docker/compose.yaml`（新增 `policy_bridge` service）
- Modify: `rm65`（新增 `up policy` 子命令）
- Modify: `functions.zsh`（兼容提示，如需）
- Modify: `src/policy_bridge/setup.py`（安装 launch）

**Interfaces:**
- launch 参数 `config_file` 默认 `/opt/rm65_ws/config/ros/policy_bridge.yaml`；`SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT","1")`；`Node(package="policy_bridge", executable="policy_bridge_node", ...)`。
- compose service 与 `realman_web_control` 平级：共享 `ROS_DOMAIN_ID`、挂载 `logs/` 与 `config/`；默认不随 `up` 启动。
- `./rm65 up policy` 在生产图基础上追加启动 `policy_bridge` 容器。

- [ ] **Step 1: 写/更新校验** `bash -n rm65`、`zsh -n functions.zsh`、`docker compose config` 均通过。
- [ ] **Step 2: 实现** launch、compose service、`rm65 up policy` 分支。
- [ ] **Step 3: 验证** `docker compose config` 解析出新 service；`ros2 launch policy_bridge policy_bridge.launch.py --show-args`（ROS 环境可用时）列出 `config_file`。
- [ ] **Step 4: 提交** `feat: add policy_bridge launch, container service, and rm65 up policy`。

### Task 9: 构建、集成验证与文档

**Files:**
- Modify: `website/docs/development/index.md`（导航，如需）
- Create: `website/docs/development/policy-bridge.md`
- Modify: `website/tests/site.spec.ts`（新增路由）

**Interfaces:**
- 文档记录：目的/边界、ROS topic/service/参数、WS 协议、配置项与单位、模式映射、看门狗约定、风险登记表 R1–R5、诊断顺序、验证命令。

- [ ] **Step 1: 运行** `colcon build --packages-select policy_bridge` 与 `colcon test --packages-select policy_bridge`（ROS 环境可用时）。
- [ ] **Step 2: 冒烟联调（dry-run 优先）** mock WS + 假 chunk，确认 `/pi05_policy/...` 按模式发布、inactive/队列空停发、stamp 为 ROS 时钟、频率 50Hz。
- [ ] **Step 3: 编写** `website/docs/development/policy-bridge.md`，加入导航与 `site.spec.ts` 路由，`npm run build`。
- [ ] **Step 4: 日志验证** 终端彩色输出、`logs/<timestamp>/` 有节点官方日志、`rg 'print\(' src/policy_bridge` 无命中。
- [ ] **Step 5: 提交** `docs: add policy_bridge developer manual and finalize validation`。

## 被推迟的依赖与风险登记表（联调里程碑）

| 编号 | 依赖 | 后果 | 归属 | 里程碑 |
|---|---|---|---|---|
| R1 | velocity session 需 Router/`PolicyInputStub` 先发 `/{arm}/cartesian_velocity` Action goal 开门（当前叶为只发诊断的占位） | 桥接发 `TwistStamped` 但 session 未激活会拒绝命令，机械臂不动 | 行为树侧 | 一期联调 |
| R2 | 驱动无笛卡尔 state topic（位姿仅 `get_current_pose` 服务，速度无反馈） | 一期用 `joint_states` 占位；笛卡尔 state 待驱动补 topic | 驱动侧 | 二期 |
| R3 | position 模式无流式位姿消费者（驱动位置走 `execute_motion` Action 目标制） | `PoseStamped` 无人订阅，位置模式不驱动 | 驱动/Router | 二期 |
| R4 | 夹爪 manager 用 `GripperPercentage` 服务，非 topic | `Float32` topic 无消费者，夹爪不动 | 需 topic→service 适配 | 二期 |
| R5 | 只有 `cartesian_velocity/command` 带 100ms 看门狗 | 发到别的 topic 无看门狗保护 | Router/驱动 | 一期确认 |

## Validation Order

1. 各 Task 的 pytest 单元测试（RED→GREEN）。
2. `python -m compileall src/policy_bridge`。
3. `colcon build/test --packages-select policy_bridge`（ROS 环境可用时）。
4. `bash -n rm65`、`zsh -n functions.zsh`、`docker compose config`。
5. mock WS + 假 chunk 冒烟（dry-run，不接真机）。
6. 真机联调仅在 R1 开门后、显式操作决策、清空工作区、低速、急停可达时进行。
7. `website` `npm run build` 与相关 Web 测试。
