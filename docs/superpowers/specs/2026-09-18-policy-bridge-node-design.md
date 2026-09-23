# Policy Bridge 节点设计（VLA 策略服务 ↔ ROS 2 协议桥接）

**Status:** 设计定稿（2026-09-18）。所有关键决策已确认，可进入实现。基于 2026-09-18 仓库现状核对。

## 目标

新增一个独立的 ROS 2 Python 节点 `policy_bridge_node`，作为 VLA 策略服务与 realman_pi ROS 2 图之间的**纯协议转换层**：

- **上行**：把 ROS 2 观测（多路图像、7 维拼合 state、文本 prompt）按策略服务约定的 schema 打包，通过 WebSocket 发起推理。
- **下行**：把策略服务返回的动作块 `(action_horizon, 7)`，按当前模式**原样包装**为 ROS 2 消息发布到配置指定的 topic。

节点与行为树输入路由中的 `policy` 分支对应，是继 `web`、`pika` 之后的第三个输入源，与它们平级、互不感知。

## 范围

**做**：

1. 按 YAML 配置的 topic 名订阅图像与 state，构建上行 observation 并通过 WebSocket 调用策略服务。
2. 订阅既有 `realman_msgs/msg/InputModeState`，把 `active_mode` 映射为内部 `velocity / position / inactive` 状态。
3. 把动作块缓冲、校验、平滑后，按模式发布 `TwistStamped`（速度）、`PoseStamped`（位置）、`Float32`（夹爪）。
4. 提供 activate / deactivate / emergency_stop / set_prompt / force_infer 生命周期服务。
5. 汇总诊断指标，遵守仓库 ROS 2 日志规范。
6. 以独立容器运行，`./rm65 up policy` 显式启用，共享 `ROS_DOMAIN_ID` 与 `logs/` 挂载。

**不做（明确移出本节点范围）**：

- 不读机械臂状态做闭环、不做速度/位姿积分、不做漂移补偿。
- 不开启/取消 `cartesian_velocity` Action session，不做底层运动仲裁。
- 不直连夹爪串口，不做 topic→service 适配。
- 不管理 session 生命周期、不切换行为树模式、不感知 Pika 内部结构。
- 不做数据采集与模型训练。
- **驱动侧缺少 state 生产者 topic、或下行命令缺少消费者时，不属于本节点职责**（见"被推迟的依赖与风险登记表"）。

## 系统上下文

节点在既有 ROS 2 图中的位置（以下为 2026-09-18 核对的仓库事实）：

```text
sensor_bringup            realman_driver (每臂 /l /m /r)         gripper_manager
  │ /camera_*/color/          │ /{arm}/joint_states (发布)          │ /{name}/position (发布, Float64)
  │   image_raw               │ /{arm}/connected (发布)             │ /{name}/percentage (服务)
  │ /camera_*/color/          │ /{arm}/coordinates/state (发布)     │
  │   camera_info             │                                     │
  ▼                           │ /{arm}/cartesian_velocity/command   │
┌──────────────────────────┐  │   (订阅, TwistStamped, 看门狗)       │
│   policy_bridge_node     │  │ /{arm}/cartesian_velocity (Action)  │
│  订阅 obs topic           │◄─┤ /{arm}/execute_motion (Action)      │
│  发布 /pi05_policy/...    │  │ /{arm}/get_current_pose (服务)      │
└───────────┬──────────────┘  └─────────────────────────────────────┘
            │  订阅 /realman_bt_executor/input_mode_state (InputModeState)
            │  发布 /pi05_policy/{l,r}/cartesian_velocity | cartesian_pose | gripper_percentage
            ▼
     [Router / PolicyInputStub —— 本设计不实现，见风险登记表 R1/R3/R4]
            ▼
     底层驱动 / gripper_manager
```

**关键事实（已核对源码）**：

- `realman_driver` **发布**的状态 topic 只有 `/{arm}/joint_states`、`/{arm}/connected`、`/{arm}/coordinates/state`（`String`）。**没有**笛卡尔位姿 topic，**没有**笛卡尔速度反馈 topic。当前位姿仅通过 `get_current_pose`（`GetCurrentPose` 服务）和 `forward_kinematics` 服务获取。
- `realman_driver` **订阅** `/{arm}/cartesian_velocity/command`（`TwistStamped`），QoS 为 `KEEP_LAST depth=1 / VOLATILE / lifespan = velocity_watchdog_ms`。`velocity_watchdog_ms` 默认 **100 ms**，`velocity_control_period_ms` 默认 **20 ms**（50 Hz），定义于 `config/ros/realman_motion.yaml`。
- `CartesianVelocitySession` 看门狗行为（有单测覆盖）：命令超时后**发一次零速 → `slow_stop` → 进入 `WATCHDOG_STOP` 终态 → 拒绝后续命令**；且**陈旧 `header.stamp` 不能刷新看门狗**（stamp 为必需字段）。session 未激活时 `accept_command` 抛 `RuntimeError`。
- 模式来源 `config/behavior-trees/control_router.xml` 已注册 `InputModeGuard` 字面量 `web / policy / pika / none`；执行器通过 `realman_msgs/msg/InputModeState` 在 `/realman_bt_executor/input_mode_state` 广播，字段含 `requested_mode / selected_mode / active_mode / phase / request_id / epoch / detail`，`phase` 为 `uint8` 常量 `ACTIVE=0 / SWITCHING=1 / FAILED=2`。
- `control_router.xml` 的 `PolicyInputStub` 当前是"只发一次入场诊断、不发 goal"的 RUNNING 占位叶（见 `node-authoring`）。因此 velocity session 的开门属于未来 Router 工作（风险 R1）。
- 夹爪 `gripper_manager` 暴露的是**服务** `/{name}/percentage`（`gripper_ros2_msgs/GripperPercentage`），设备名为 `gripper_left / gripper_right / gripper_mid`；语义 `0.0 = close_position, 1.0 = open_position`；状态 topic `/{name}/position` 为 `std_msgs/Float64`（设备单位）。`gripper.yaml` 提供各设备 `open_position/close_position`（如 left 400/949，right 4000/12000）。

## 架构

```text
┌────────────────────────────────────────────────────────────┐
│                      policy_bridge_node                      │
│                                                              │
│  Observation Builder ── obs ──► Inference Scheduler          │
│   · ImageAggregator                 · 滚动时域触发            │
│   · StateComposer (7维)             · 线程池调用 + 防重入      │
│   · PromptProvider                  · 结果校验                │
│         ▲                                  │ chunk(16,7)      │
│         │ 订阅 obs topic                    ▼                 │
│                                    Action Executor            │
│                                     · ChunkBuffer (deque)     │
│                                     · Dispatcher              │
│                                     · GripperPublisher        │
│         ┌──────────────┐                 │                    │
│         │ ModeWatcher  │── 切换发布类型 + 清队 ─┘                 │
│         │ (InputMode)  │                                       │
│         └──────────────┘                                       │
│                     │                                          │
│                     ▼                                          │
│   /pi05_policy/{l,r}/cartesian_velocity | cartesian_pose      │
│   /pi05_policy/{l,r}/gripper_percentage                       │
│                                                              │
│  Lifecycle Services · Stats(DiagnosticArray)                 │
└────────────────────────────────────────────────────────────┘
```

| 子系统 | 职责 |
|---|---|
| Observation Builder | 图像同步、7 维 state 拼合、prompt 管理、obs 组装 |
| Inference Scheduler | 滚动时域触发、线程池调用、防重入、结果校验 |
| Action Executor | 动作块缓冲、按模式构造消息、平滑限幅、发布调度 |
| ModeWatcher | 订阅 `InputModeState`，映射内部状态，切换时清队 |
| Lifecycle Services | activate / deactivate / estop / set_prompt / force_infer |
| Stats | 指标汇总，`diagnostic_msgs/DiagnosticArray` 上报 |

**没有 integrator、没有机械臂状态反馈订阅、没有闭环路径。**

## 模式契约（对齐 XML，不新造枚举）

`active_mode` 的合法字符串**唯一来源**是 `control_router.xml` 的 `InputModeGuard` 字面量。桥接节点不定义模式枚举，只做映射：

| 内部状态 | 触发条件 | 臂下行 | 夹爪下行 |
|---|---|---|---|
| `velocity` | `active_mode ∈ velocity_modes` 且 `phase == ACTIVE`(0) | 发 `TwistStamped` | 发 `Float32` |
| `position` | `active_mode ∈ position_modes` 且 `phase == ACTIVE`(0) | 发 `PoseStamped` | 发 `Float32` |
| `inactive` | `active_mode ∈ inactive_modes`、`phase != ACTIVE`、或未知 | 不发 | 不发 |

- 当前 XML 只有 `policy` 一个可用字面量，因此一期 `velocity_modes: [policy]`、`inactive_modes: [web, pika, none]`、`position_modes: []`。
- `phase != ACTIVE`（即 `SWITCHING / FAILED`）一律归 `inactive`，与行为树"切换必经 none"约定协同，保证旧动作不打到新 session。
- 未知 `active_mode`：按 `default_when_unknown = inactive` 处理，首次 WARN 一次。
- 若未来要用行为树区分速度/位置，须在 `control_router.xml` 新增 `InputModeGuard mode="policy_position"` 等字面量并在执行器注册对应叶节点，走 `developing-realman-behavior-trees` 评审；**不得**在桥接节点内维护隐式模式状态机。

## 上行链路：ROS 2 → WebSocket

### 观测 schema（字段名固定）

| 字段 | 类型 | 来源 |
|---|---|---|
| `state` | `float32[7]` | 见下表，按模式语义 |
| `wrist_image` | `uint8[H,W,3]` | 配置的腕部相机 topic |
| `global_image` | `uint8[H,W,3]` | 配置的全局相机 topic |
| `prompt` | `string` | 参数 / 话题 / 服务 |

state 7 维语义（上行为观测、下行为动作，两者维度与语义一致）：

| 模式 | `state[0:6]` | `state[6]` |
|---|---|---|
| velocity | 笛卡尔速度 `(vx,vy,vz,wx,wy,wz)` | 夹爪开合 0~1 |
| position | 位姿 `(x,y,z,roll,pitch,yaw)` | 夹爪开合 0~1 |

> **一期已确认**：上行 state 用 `/{arm}/joint_states` 占位跑通链路（取 6 关节位置作 `state[0:6]`、夹爪作 `state[6]`）；笛卡尔语义待驱动补 topic 后二期切换（风险 R2）。state 各分量 topic 名全部来自 YAML。**若配置的 topic 不存在或无发布者，StateComposer 返回未就绪，本周期跳过，不崩溃、不退出**。

### 观测构建流程

1. **图像同步**：多路用 `ApproximateTimeSynchronizer`（`slop_s` 默认 0.05）；单路退化为普通订阅；未同步上则跳过本周期。
2. **图像预处理**：编码统一（`rgb8`/`bgr8`）、可选缩放。
3. **state 拼合**：StateComposer 按配置顺序 append 各来源最新值；夹爪分量来源为 `Float64` 设备单位，用 `gripper.yaml` 的 `open_position/close_position` 换算为 0~1。任一必需来源未就绪返回 `None`。
4. **prompt 获取**：PromptProvider 提供当前文本。
5. **组装 observation**：字段名固定为 `state/wrist_image/global_image/prompt`。

### 推理调度（滚动时域）

**触发条件**（任一）：策略激活且动作队列为空；队列剩余 ≤ `inference_lead_steps`；`/policy/force_infer` 手动触发。

**执行约束**：防重入（正在推理时再次触发直接忽略）；线程池调用（不阻塞发布定时器）；单次超时放弃本次。WebSocket 回调线程不得直接 `publish`，结果经线程安全队列交由发布定时器消费。

### 响应校验

| 检查 | 失败处理 |
|---|---|
| 形状 == `(action_horizon, 7)` | 丢弃整块，失败计数 +1 |
| 无 NaN / Inf | 丢弃整块，失败计数 +1 |
| clip 到 `action_clip` | 直接裁剪 |
| 连续失败 ≥ N（**N=5**） | 告警并暂停，需显式 activate 恢复 |

## 下行链路：ROS 2 发布

**节点不读任何机械臂状态、不做控制数学运算。** 发布完全由内部模式决定：

| 内部模式 | `action[0:6]` 语义 | 发布消息 | 默认 topic |
|---|---|---|---|
| velocity | 笛卡尔速度 | `TwistStamped` | `/pi05_policy/{l,r}/cartesian_velocity` |
| position | 位姿（见下） | `PoseStamped` | `/pi05_policy/{l,r}/cartesian_pose` |
| inactive | — | 不发布 | — |

夹爪维度在 velocity 和 position 模式下**都发布**到 `/pi05_policy/{l,r}/gripper_percentage`（`std_msgs/Float32`，0~1）。

**position 格式**由 `position.pose_format` 决定：`xyz_euler`（角度转四元数装填）/ `xyz_quat_xyzw`（补 `qw` 或直接 7 维）。euler→quat 是消息装填必需的**格式转换**，不属于控制数学运算。

**动作块缓冲**：校验后的 chunk 只取前 `steps_per_inference` 步入 deque；队列容量上限 `2 × steps_per_inference`；模式切换 / prompt 变更 / 激活 / 急停时整队清空。

**发布循环**（`publish_rate_hz` 定时器，默认 50 Hz）：

1. 读当前内部状态；`inactive` → 跳过不发。
2. 从 deque 头部 pop 一个 action；队列空 → 跳过不发（触发下游看门狗）。
3. 一阶低通平滑 + clip；按模式构造臂指令并发布。
4. 构造并发布夹爪百分比（独立平滑系数）。

**速度模式时间戳硬约束**：`TwistStamped.header.stamp` 必须为 **ROS 时钟 `now()`**，且发布周期必须**快于 `velocity_watchdog_ms`（100 ms）**，否则驱动 session 看门狗不刷新会触发停止。50 Hz（20 ms）满足要求。

**"不发布" ≠ "发零速"**：队列空 / inactive / 急停时**停发**，让驱动侧 `CartesianVelocitySession` 看门狗按预期"发一次零速 → slow_stop → WATCHDOG_STOP"。桥接节点自己**不发零速**。

## 夹爪控制

| 项 | 约定 |
|---|---|
| topic | `/pi05_policy/{l,r}/gripper_percentage`，`std_msgs/Float32` |
| 范围 | clip 到 `0.0~1.0`，`0=闭合, 1=张开`（与 `gripper_manager` 语义一致） |
| 维度 | `action[6]`（单臂）；双臂扩展时另配 |
| 发布 | 与臂同拍（同周期同 action 切片）、一阶低通平滑（可更保守，如 0.3） |
| 队列空 / inactive | 不发布 |

> 桥接节点**只发 topic**。`gripper_manager` 实际消费的是 `GripperPercentage` **服务**，二者之间的 topic→service 适配不在本设计范围（风险 R4）。

## 生命周期与安全

| 服务 | 类型 | 行为 |
|---|---|---|
| `/policy/activate` | `std_srvs/SetBool` | 清空队列，重置失败计数，允许推理与发布 |
| `/policy/deactivate` | `std_srvs/SetBool` | 停止发布，观测采集继续 |
| `/policy/emergency_stop` | `std_srvs/Trigger` | 清空队列，立即停止发布 |
| `/policy/set_prompt` | `std_srvs/SetBool`（一期占位，prompt 主要走 topic） | 更新 prompt，清空队列 |
| `/policy/force_infer` | `std_srvs/Trigger` | 立即推理一次 |

**安全机制**：看门狗协同（停发让驱动接管）；`action_clip` + SI 上限限幅；连续失败触发暂停；模式切换 / prompt 变更 / 激活 / 急停均清空队列。

> 急停除了清队停发，**建议**由上层 Router 取消 velocity session，把停止责任交给驱动 `slow_stop`（风险 R1，非本节点实现）。

## 失败与降级

| 异常 | 处理 |
|---|---|
| WebSocket 断开 | 指数退避重连，内部强制 inactive（清队 + 停发），保留观测采集；不重发旧 chunk |
| 推理超时 | 丢弃本次，**不覆盖旧队列**；旧队列按 `publish_rate_hz` 消耗完后自然进入停发 |
| 响应形状错误 / NaN / Inf | 丢弃整块，失败计数 +1；连续 ≥ 5 暂停待显式 activate |
| 图像同步失败 | 跳过本周期，不影响下行发布 |
| state topic 缺失 / 维度不符 | 启动**不**校验 topic 存在性；运行期未就绪则跳过本周期 |
| `active_mode` 未知 | 按 `default_when_unknown=inactive`，WARN 一次 |
| 下行 topic 无订阅者 | 正常发布，不阻塞 |
| 队列空 / inactive / 急停 | 停止发布 |

## 可观测性与日志

**指标**（`/policy/stats`，**使用 `diagnostic_msgs/DiagnosticArray`**，便于 rqt_runtime_monitor 直接查看，不引入自定义 msg 包）：推理请求/成功/超时/校验失败计数、平均推理延迟（滑窗）、动作队列长度、发布频率实测值、观测同步成功率、当前内部状态、最近 N 次失败原因。

**日志分级**（遵守 `ros2-logging-conventions`：只用 `get_logger()`，禁止 `print`，`RCUTILS_COLORIZED_OUTPUT=1`，日志落 `logs/YYYYMMDD_HHMMSS/`）：

| 级别 | 事件 |
|---|---|
| INFO | 模式切换、prompt 变更、服务调用、WS 连接建立/断开 |
| WARN | 推理超时、校验失败、重连、未知 mode |
| ERROR | 连续失败暂停、配置校验失败、维度不匹配 |
| DEBUG | 每次推理 obs 摘要（只打 shape 与统计量，**不打图像数据**） |

## 配置设计

权威配置 `config/ros/policy_bridge.yaml`（唯一真源，遵守 `project-config-layout`；所有 topic 名为可配字符串，驱动缺 topic 时改配置不改代码）。

| 段 | 字段 | 说明 |
|---|---|---|
| arms | `arm_names` | **一期 = `[l, r]`**；下行 topic 与 frame_ids 按此列表展开，二期加 `m` 只改此处 |
| network | `server_host` / `server_port` | 策略服务地址，支持 `${ENV:-default}` 展开 |
| | `connect_timeout_s` / `infer_timeout_s` | 连接与单次推理超时 |
| | `reconnect_backoff{initial_s,max_s,factor}` | 指数退避 |
| | `inference_threads` | 线程池大小（建议 1~2） |
| observation | `image_topics[]{name,topic,encoding,resize,enabled}` | 至少一路 enabled |
| | `image_sync{mode,slop_s}` | `approximate`/`latest`/`exact`，默认 slop 0.05 |
| | `state.joint_state_topics{left,right}` | 一期占位 state[0:6] 来源 |
| | `state.gripper_position_topics{left,right}` | 夹爪设备单位来源，换算 state[6] |
| | `state.gripper_config` | `gripper.yaml` 路径，取 open/close_position |
| | `state_expected_dim` | = 7 |
| prompt | `initial` / `topic` / `on_change_clear_queue` | 运行时更新入口 |
| action | `action_horizon` | chunk 步数（16） |
| | `action_dim` | = 7 |
| | `steps_per_inference` | 每块执行步数（如 4） |
| | `inference_lead_steps` | 提前触发阈值（如 2） |
| | `action_clip` | 数值限幅范围 |
| downlink | `command_namespace` | 默认 `/pi05_policy`，须以 `/` 开头 |
| | `publish_rate_hz` | 默认 50，须快于看门狗 100 ms |
| | `smoothing_alpha` | 一阶低通系数 ∈ (0,1] |
| | `velocity.twist_scale{linear,angular}` | 归一化 → m/s、rad/s |
| | `velocity.frame_ids{left,right}` | 臂基座 frame |
| | `position.pose_format` | `xyz_euler`/`xyz_quat_xyzw` |
| | `position.position_unit` / `angle_unit` | `m`/`mm`，`rad`/`deg` |
| | `position.frame_ids{left,right}` | 臂基座 frame |
| | `gripper.topic_left` / `topic_right` | 夹爪 topic |
| | `gripper.clamp` / `smoothing_alpha` | 范围与平滑 |
| mode | `topic` | `/realman_bt_executor/input_mode_state` |
| | `mapping.{velocity_modes,position_modes,inactive_modes}` | 引用 XML 字面量，三类不重叠 |
| | `default_when_unknown` | 默认 `inactive` |
| lifecycle | `services.{activate,deactivate,emergency_stop,set_prompt,force_infer}` | 服务名 |

**启动校验**：至少一路图像 enabled；state 维度 == 7；`command_namespace` 以 `/` 开头；三类模式不重叠；位置模式 `pose_format`/单位组合合法且 `frame_ids` 非空；`smoothing_alpha ∈ (0,1]`。**topic 存在性不进启动校验**（避免驱动未起时桥接起不来）。

## 包结构与模块划分

ament_python 包 `src/policy_bridge/`，与 `src/driver/realman_web_control/` 同级：

```text
src/policy_bridge/
├── package.xml / setup.py / setup.cfg / resource/policy_bridge
├── policy_bridge/
│   ├── policy_bridge_node.py          # 装配 + 发布定时器 + MultiThreadedExecutor
│   ├── config_loader.py               # YAML→dataclass + 启动校验 + env 展开
│   ├── observation/
│   │   ├── image_aggregator.py        # ApproximateTimeSynchronizer / latest
│   │   ├── state_composer.py          # 7 维 state 拼合（含夹爪单位换算）
│   │   └── observation_builder.py
│   ├── prompt_provider.py
│   ├── inference/
│   │   ├── ws_client.py               # WebSocket 封装 + 指数退避重连
│   │   ├── scheduler.py               # 滚动时域 + 防重入 + 线程池
│   │   └── validators.py              # shape / NaN / clip
│   ├── mode/mode_watcher.py           # 订阅 InputModeState → 内部状态
│   ├── action/
│   │   ├── chunk_buffer.py            # deque + 清队
│   │   └── dispatcher.py              # Twist/Pose 构造（纯格式转换）
│   ├── gripper/gripper_publisher.py   # Float32 clip + 平滑
│   ├── lifecycle/services.py
│   └── stats.py                       # DiagnosticArray
├── launch/policy_bridge.launch.py     # 指向 /opt/rm65_ws/config/ros/policy_bridge.yaml
└── test/                              # config_loader / mode_watcher / dispatcher / validators
```

**删除**：`integrator.py`（不做积分）。

## 容器与部署

- `config/docker/compose.yaml` 新增独立 service，与 `realman_web_control` 平级：共享 `.env` 的 `ROS_DOMAIN_ID`，挂载宿主机 `logs/` 与 `config/`（容器内 `/opt/rm65_ws/config`）。
- Python 依赖（`websockets`、`numpy`、图像编码所需 `opencv`）隔离在本容器，不污染 bringup。
- `./rm65 up` 默认**不启动**本节点；**通过 `./rm65 up policy` 子命令显式启用**（与既有 `./rm65 up desktop`/`model` 一致的入口风格）。改动 `rm65` 时同步更新 `functions.zsh` 兼容提示与 Web 手册，并验证 `bash -n rm65`。
- 日志目录、彩色输出、节点日志文件命名遵守 `ros2-logging-conventions`。

## 被推迟的依赖与风险登记表

以下为讨论中明确"先不管"、但联调时会真实挡路的项，记录在案而非遗忘：

| 编号 | 被推迟的依赖 | 后果（桥接正常，但系统层面） | 归属 | 里程碑 |
|---|---|---|---|---|
| R1 | velocity session 需 Router/`PolicyInputStub` 先发 `/{arm}/cartesian_velocity` Action goal 开门（当前叶为只发诊断的占位） | 桥接发了 `TwistStamped`，但 session 未激活会拒绝命令，机械臂不动 | 行为树侧 | 一期联调 |
| R2 | 驱动无笛卡尔 state topic（位姿仅 `get_current_pose` 服务，速度无反馈） | 一期用 `joint_states` 占位；笛卡尔 state 待驱动补 topic | 驱动侧 | 二期 |
| R3 | position 模式无流式位姿消费者（驱动位置走 `execute_motion` Action 目标制） | 桥接发的 `PoseStamped` 无人订阅，位置模式不驱动机械臂 | 驱动/Router | 二期 |
| R4 | 夹爪 manager 用 `GripperPercentage` 服务，非 topic | 桥接发的 `Float32` topic 无消费者，夹爪不动 | 需 topic→service 适配 | 二期 |
| R5 | 只有 `cartesian_velocity/command` 带 100 ms 看门狗 | 若桥接发到别的 topic，无看门狗保护，停发不等于安全停止 | Router/驱动 | 一期确认 |

## 分期实施计划

详见 `docs/superpowers/plans/2026-09-18-policy-bridge-node.md`（Task 1–9，含每任务 Files/Interfaces/TDD Steps）。一期落地 Task 1–8 的速度模式最小可行路径，位置模式接口就绪但默认不启用。

## 验证策略

1. 单元测试：`config_loader`（env 展开与启动校验）、`mode_watcher`（policy/none/SWITCHING/未知映射，phase uint8）、`dispatcher`（Twist/Pose 装填、stamp、frame_id、平滑限幅）、`validators`（shape/NaN/clip）、`chunk_buffer`、`state_composer`。
2. `python -m compileall src/policy_bridge`；`colcon build/test --packages-select policy_bridge`（ROS 环境可用时）。
3. `docker compose config` 校验新增 service；`bash -n rm65`、`zsh -n functions.zsh`。
4. 冒烟：mock WS + 假 chunk，确认 `/pi05_policy/...` 按模式发布、inactive/队列空停发、stamp 为 ROS 时钟、频率 50Hz。
5. 联调（dry-run 优先）：真机低速、清空工作区、急停可达；确认 velocity session 开门后命令被接受、停发后 100 ms 触发 `WATCHDOG_STOP`。
6. 日志验证：终端彩色输出、`logs/<timestamp>/` 有本节点官方日志、`rg 'print\(' src/policy_bridge` 无命中。

## 关键设计决策

| 编号 | 决策 | 理由 |
|---|---|---|
| D1 | 节点是纯协议转换层，只按配置读/发 topic | 职责解耦，驱动缺口不阻塞本节点 |
| D2 | 内部模式由 `InputModeState.active_mode` + `phase`(uint8) 决定，字符串来自 XML | 行为树是模式唯一来源，不新造枚举 |
| D3 | state 与 action 均 7 维、语义一致（6 维笛卡尔 + 1 维夹爪） | 上下行共用维度定义 |
| D4 | 速度模式复用驱动既有 `cartesian_velocity/command` + 100 ms 看门狗 | 无需自建看门狗，停发即安全停止 |
| D5 | `header.stamp` 用 ROS 时钟、发布快于看门狗 | 陈旧 stamp 不刷新看门狗，会被误停 |
| D6 | 队列空 / inactive / 急停时**不发布**（不发零速） | 让驱动看门狗按预期触发 |
| D7 | 模式切换 / prompt 变更 / 激活 / 急停清空队列 | 防旧任务污染新 session |
| D8 | 夹爪只发 `Float32` topic，语义对齐 manager（0=闭,1=开） | 保持纯发布；service 适配另置 |
| D9 | 独立容器 + `./rm65 up policy` 显式启用 | 依赖隔离，不污染默认生产路径 |
| D10 | 一期只做速度模式 + joint_states 占位上行 + arm_names=[l,r] | 最小可行、绕开 R2/R3 阻塞 |

## 已确认决策（2026-09-18）

1. **一期上行 state**：用 `/{arm}/joint_states` 占位跑通链路（冒烟优先）；笛卡尔 state 待驱动补 topic 后二期切换（R2）。
2. **`/policy/stats` 消息类型**：`diagnostic_msgs/DiagnosticArray`，不新增自定义 msg 包。
3. **连续失败暂停阈值**：`N = 5`，暂停后需显式 `/policy/activate` 恢复。
4. **容器启用方式**：`./rm65 up policy` 子命令，`./rm65 up` 默认不启动本节点。
5. **上行 obs 字段名**：固定为 `wrist_image` / `global_image` / `state` / `prompt`，非配置项。
6. **`arm_names`**：一期 `[l, r]`；下行 topic、frame_ids、夹爪左右均按此展开，三臂 `m` 二期只改配置一处。
