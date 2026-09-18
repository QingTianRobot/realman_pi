# VLA 策略桥接节点

`policy_bridge` 的 `policy_bridge_node` 是 VLA（Vision-Language-Action）策略服务与 realman_pi ROS 2 图之间的**纯协议转换层**。它与 Pika、Web 等输入源平级：上行把图像、7 维 state 和 prompt 打包经 WebSocket 发给策略服务；下行把返回的动作块 `(16, 7)` 按当前模式原样包装成 ROS 2 消息发布。节点**不读机械臂状态做闭环、不积分、不开关 Action session、不直连夹爪串口**。

## 架构与所有权

```text
策略服务 (WebSocket)
   ▲  obs: {state[7], wrist_image, global_image, prompt}
   │  actions: (16,7)
   │
policy_bridge_node ── 上行 ObservationBuilder（订阅配置的 topic）
   │                 └ InferenceScheduler（滚动时域 + 线程池 + 防重入）
   │                 └ WsClient（序列化 + 超时 + 指数退避）
   │
   └── 下行 ChunkBuffer(deque) → Dispatcher → GripperPublisher
          ├ /pi05_policy/{l,r}/cartesian_velocity  (TwistStamped)
          ├ /pi05_policy/{l,r}/cartesian_pose      (PoseStamped, 一期不启用)
          └ /pi05_policy/{l,r}/gripper_percentage  (Float32)

realman_bt_executor ── /realman_bt_executor/input_mode_state ──▶ ModeWatcher（唯一模式来源）
```

模式只由 `ModeWatcher` 订阅的 `InputModeState` 决定；合法的 `active_mode` 字面量唯一来源是 [`config/behavior-trees/control_router.xml`](../../../../config/behavior-trees/control_router.xml) 的 `InputModeGuard`，桥接节点自身不定义模式枚举。

实现入口：

- 节点装配与发布循环：`src/policy_bridge/policy_bridge/policy_bridge_node.py`
- 配置加载与启动校验：`src/policy_bridge/policy_bridge/config_loader.py`
- 模式映射：`src/policy_bridge/policy_bridge/mode/mode_watcher.py`
- 上行观测：`src/policy_bridge/policy_bridge/observation/{image_aggregator,state_composer,observation_builder}.py`、`prompt_provider.py`
- 推理：`src/policy_bridge/policy_bridge/inference/{ws_client,scheduler,validators}.py`
- 下行：`src/policy_bridge/policy_bridge/action/{chunk_buffer,dispatcher,smoother}.py`、`gripper/gripper_publisher.py`
- 生命周期与指标：`src/policy_bridge/policy_bridge/lifecycle/services.py`、`stats.py`

## 配置

权威配置是 [`config/ros/policy_bridge.yaml`](../../../../config/ros/policy_bridge.yaml)，容器映射在 [`config/docker/compose.yaml`](../../../../config/docker/compose.yaml)。不要在源码包内维护第二份运行配置。所有 topic 名都是字符串配置，驱动缺少对应生产者/消费者时改配置即可，不改代码；启动时**不校验 topic 是否存在**。

| 段 | 字段 | 单位/范围 | 作用 |
| --- | --- | --- | --- |
| `network` | `server_host` | 字符串，`${POLICY_WS_HOST:-127.0.0.1}` | 策略服务地址，敏感值走环境变量 |
| `network` | `server_port` | `1..65535`；当前 `18000` | 策略服务端口（OpenPI 默认） |
| `network` | `infer_timeout_s` | 秒；当前 `1.5` | 单次推理超时，超时丢弃本次不覆盖旧队列 |
| `network` | `reconnect_backoff` | `initial_s/max_s/factor` | 断开后指数退避重连 |
| `network` | `inference_threads` | `>=1`；当前 `2` | 推理线程池大小，避免阻塞发布定时器 |
| `action` | `action_horizon` | 当前 `16` | 服务端返回 chunk 的步数 |
| `action` | `action_dim` | 必须 `7` | 6 维笛卡尔 + 1 维夹爪 |
| `action` | `steps_per_inference` | `<= horizon`；当前 `4` | 每块只取前 N 步入队（滚动时域） |
| `action` | `inference_lead_steps` | `>=0`；当前 `2` | 队列剩余 `<=` 此值时提前触发推理 |
| `action` | `action_clip` | `[min,max]`；当前 `[-1,1]` | 归一化动作限幅 |
| `downlink` | `command_namespace` | 以 `/` 开头；`/pi05_policy` | 下行命名空间，与 `/pika` 平级 |
| `downlink` | `publish_rate_hz` | `>0`；当前 `50.0` | 必须快于驱动 `velocity_watchdog_ms`（100ms） |
| `downlink` | `smoothing_alpha` | `(0,1]`；当前 `0.6` | 一阶低通 `a=α·new+(1-α)·last` |
| `downlink.velocity` | `twist_scale` | `linear 0.2 m/s`、`angular 0.6 rad/s` | 归一化 → SI 单位 |
| `downlink.velocity` | `frame_ids` | `l_base_link` / `r_base_link` | 各臂基座坐标系，须与 TF 树一致 |
| `downlink.gripper` | `clamp` | `[0,1]`；`0=闭合,1=张开` | 与 `gripper_manager` 语义一致 |
| `mode.mapping` | `velocity_modes` | 当前 `[policy]` | 映射为内部 `velocity` |
| `mode.mapping` | `inactive_modes` | `[web,pika,none]` | 映射为内部 `inactive` |
| `stats` | `failure_pause_threshold` | 当前 `5` | 连续失败 `>=N` 暂停，需显式 activate 恢复 |

一期 `arm_names` 固定 `[l, r]`，节点以单个 `active_side`（默认 `left`）驱动单臂动作流；双臂独立流为二期扩展。上行 `state[0:6]` 一期取每臂 `joint_states` 前 6 个关节位置占位，`state[6]` 由夹爪 `Float64` 设备单位经 `open/close_position` 换算为 `0..1`。

## ROS 接口

订阅（上行观测源，topic 名全部来自配置）：

| 用途 | 默认 topic | 类型 |
| --- | --- | --- |
| 腕部图像 | `/camera_left/color/image_raw` | `sensor_msgs/Image` |
| 全局图像 | `/camera_global/d435/color/image_raw` | `sensor_msgs/Image`（独立 RealSense D435，区别于三路 Orbbec 臂相机） |
| 关节状态 | `/l/joint_states`、`/r/joint_states` | `sensor_msgs/JointState` |
| 夹爪位置 | `/gripper_left/position`、`/gripper_right/position` | `std_msgs/Float64` |
| 模式状态 | `/realman_bt_executor/input_mode_state` | `realman_msgs/InputModeState`（`phase` 为 uint8：ACTIVE=0/SWITCHING=1/FAILED=2） |
| prompt 更新 | `/policy/prompt` | `std_msgs/String` |

发布（下行）：

| topic | 类型 | 模式 | 备注 |
| --- | --- | --- | --- |
| `/pi05_policy/{l,r}/cartesian_velocity` | `geometry_msgs/TwistStamped` | velocity | `stamp` 为 ROS 时钟 `now()`，50Hz |
| `/pi05_policy/{l,r}/cartesian_pose` | `geometry_msgs/PoseStamped` | position | 一期不启用（`position_modes: []`） |
| `/pi05_policy/{l,r}/gripper_percentage` | `std_msgs/Float32` | velocity+position | `0..1`，`0=闭合` |
| `/policy/stats` | `diagnostic_msgs/DiagnosticArray` | 始终 | 计数与实时指标；暂停时 level=ERROR |

服务（生命周期）：

| 服务 | 类型 | 行为 |
| --- | --- | --- |
| `/policy/activate` | `std_srvs/SetBool` | 清队、重置失败计数、允许推理与发布 |
| `/policy/deactivate` | `std_srvs/SetBool` | 停止发布，观测继续 |
| `/policy/emergency_stop` | `std_srvs/Trigger` | 清队、立即停发 |
| `/policy/set_prompt` | `std_srvs/SetBool` | 一期占位，prompt 走 topic |
| `/policy/force_infer` | `std_srvs/Trigger` | 立即推理一次 |

## WebSocket 协议

传输采用 **OpenPI `WebsocketPolicyServer` 协议**：msgpack 承载 NumPy 原始字节（**不是 JSON**），由包内 vendored 客户端 `src/policy_bridge/policy_bridge/inference/openpi_client/` 实现（`WebsocketClientPolicy` + `msgpack_numpy`）。`WsClient` 只负责惰性连接、`infer` 超时、指数退避与错误计数；obs 以 dict 原样交给 transport 打包，字段名即 obs 的 key。

obs 字段名固定，值为 NumPy 数组 / 字符串：

```python
# 请求（上行 obs）—— 由 ObservationBuilder 组装
{"state": np.float32[7],              # 6 维笛卡尔/关节 + 1 维夹爪
 "wrist_image": np.uint8[H, W, 3],    # key = observation.image_topics[].name
 "global_image": np.uint8[H, W, 3],
 "prompt": "pick the red block"}

# 响应（下行 actions）—— 服务端返回
{"actions": np.float32[16, 7]}        # 形状必须 (action_horizon, action_dim)
```

连接建立时服务端先发一帧 metadata，客户端 `recv` 后才进入请求-响应；每次 `infer` 发一帧 obs、收一帧 actions。响应经 `validators.check`：形状必须精确为 `(action_horizon, action_dim)`、全部有限，否则整块拒绝（绝不下发到机械臂）；合法值 clip 到 `action_clip`。只取前 `steps_per_inference` 步入队。

> `action_horizon` 必须与服务端实际返回的行数一致（如 pi0 常见 50 行），否则整块被 `validators.check` 按 shape 拒绝。上线前用 `mock_policy_server` 或 `get_server_metadata()` 核对。

## 安全与看门狗约定

- **不发布 ≠ 发零速**：队列空 / inactive / 急停时停发，让驱动的 `CartesianVelocitySession` 100ms 看门狗接管。
- 发布频率必须快于 100ms（默认 50Hz），`header.stamp` 必须为 ROS 时钟 `now()`。
- 推理在 WS/线程池线程完成，**绝不在该线程直接 publish**；发布只发生在定时器线程。
- 防重入：一次推理进行中忽略新触发；连续失败达 `failure_pause_threshold`（5）暂停，需 `/policy/activate` 恢复。
- 模式切换与 prompt 变更都会清队，防止旧任务动作污染新 session。

## Docker 启动

`./rm65 up policy` 在生产图（`realman_bringup_remote` + `realman_web_control`）基础上追加启动独立的 `policy_bridge` 容器。该容器与 Web control 平级，共享 `ROS_DOMAIN_ID`、只读挂载 `config/`、写入 `logs/`，通过 `POLICY_WS_HOST` 解析策略服务地址。桥接容器保持空闲，直到 Router 选择 policy 模式且调用 `/policy/activate`。

开发环境可在已构建并 source 的 ROS 2 工作区中运行（dev shell 用仓库内配置路径，容器路径 `/opt/rm65_ws/...` 在宿主机不存在）：

```bash
colcon build --packages-select realman_msgs policy_bridge
source install/setup.bash
ros2 launch policy_bridge policy_bridge.launch.py \
  config_file:=$PWD/config/ros/policy_bridge.yaml \
  active_side:=left
```

### 无模型联调：mock 策略服务

真实策略服务未就绪时，用包内 mock 服务在 `:18000` 顶替，验证连接、obs 字段与动作回流（不涉及模型与机械臂）：

```bash
# 终端 A：起 mock 服务（random 让发布的 Twist 数值可见变化）
ros2 run policy_bridge mock_policy_server --port 18000 --mode random
# 或免安装：python3 -m policy_bridge.tools.mock_policy_server --port 18000 --mode random

# 终端 B：起节点，指向同一端口（server_port 默认已是 18000）
ros2 launch policy_bridge policy_bridge.launch.py config_file:=$PWD/config/ros/policy_bridge.yaml
```

mock 服务日志会打印每次收到的 obs key 与 shape（`state (7,)`、`wrist_image (H,W,3)` …），据此确认上行契约；随后按下面「健康判断与排障」activate + force_infer 观察下行 topic。切到真实服务只改 `POLICY_WS_HOST`（及必要时 `server_port`），代码与配置结构不变。

## 健康判断与排障

按以下顺序验证，避免在链路未知时直接运动：

1. `ros2 lifecycle`/`ros2 node info /policy_bridge_node` 确认节点与 5 个服务已注册。
2. `ros2 topic echo --once /policy/stats` 查看 `queue_remaining`、`paused`、`mode_active`、`allow_publish` 指标。
3. `ros2 topic echo /realman_bt_executor/input_mode_state` 确认 `active_mode=policy` 且 `phase=0(ACTIVE)`，否则内部模式为 inactive，不会发布。
4. 先 `ros2 service call /policy/activate std_srvs/srv/SetBool "{data: true}"`，再 `ros2 service call /policy/force_infer std_srvs/srv/Trigger`。
5. `ros2 topic echo /pi05_policy/l/cartesian_velocity` 核对 `TwistStamped` 的 `frame_id`、`stamp` 与数值缩放。

```bash
docker compose ps policy_bridge
docker compose logs --tail=100 policy_bridge
docker compose exec policy_bridge ros2 topic echo --once /policy/stats
```

## 已知限制与风险登记表

桥接是纯发布层，以下缺口按里程碑归属其他模块，不在本节点内实现：

| 编号 | 依赖 | 后果 | 归属 | 里程碑 |
| --- | --- | --- | --- | --- |
| R1 | velocity session 需 Router 先发 `/{arm}/cartesian_velocity` Action goal 开门 | 桥接发 `TwistStamped` 但 session 未激活会拒绝命令 | 行为树侧 | 一期联调 |
| R2 | 驱动无笛卡尔 state topic | 一期用 `joint_states` 占位上行 | 驱动侧 | 二期 |
| R3 | position 模式无流式位姿消费者（驱动走 `execute_motion` Action） | `PoseStamped` 无人订阅 | 驱动/Router | 二期 |
| R4 | 夹爪 manager 用 `GripperPercentage` 服务而非 topic | `Float32` topic 暂无消费者 | 需 topic→service 适配 | 二期 |
| R5 | 只有 `cartesian_velocity/command` 带 100ms 看门狗 | 发到别的 topic 无看门狗保护 | Router/驱动 | 一期确认 |

## 验证

**无硬件回归测试**（`cd src/policy_bridge`）：

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 PYTHONPATH=".:$PYTHONPATH" \
  python3 -m pytest test/ -q          # 86 passed
```

- `test_integration_mock_ws.py`：dict 级 mock transport + 录制的假 chunk，覆盖模式门控发布、ROS 时钟 stamp、50Hz 周期、一块 → `steps_per_inference` 次发布、队列空/inactive 停发。
- `test_ws_client.py::test_ws_client_real_socket_roundtrip`：起一个真实 localhost WebSocket 服务，走 vendored `WebsocketClientPolicy` + msgpack 完整往返，断言收到 `(16,7)` actions、连接建立/关闭状态正确——**证明真实网络链路可用**。
- msgpack 序列化往返（state float32 / 图像 uint8 / actions）单测。

**无模型联调**：用上文 `mock_policy_server` 在 `:18000` 顶替真实服务，跑通节点上行 obs → 下行 topic 全链路。

**真机联调**：仅在 R1 开门后、显式操作决策、清空工作区、低速、急停可达时进行；`action_horizon` 需先与真实服务返回行数对齐。
