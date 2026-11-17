# Pika 键盘一键采集：W/A/S/D 启停录制与归位

日期：2026-11-17 · 状态：设计已确认，待实现计划

## 目标

操作员只用一块外接 W/A/S/D 小键盘（enine 上的 MyDIYKB，`pika_foot_pedal` 节点读取）完成一条示教 episode：

1. 按一次 W/A/S/D：左右两侧 Pika 遥操作开始（已有行为），**同时开始录制**。
2. 再按一次：遥操作停止（已有行为），**录制结束**，l、r 臂 **MoveJ 回 `pika_default_pose`**（与 pikavelocity 入口同一位姿；`skip: true` 的臂跳过，SJD 上是 m）。

不需要在 `:8770` 或命令行手动 START/STOP。

## 背景与约束

- enine 上的 Pika 栈运行在私有 domain 75，只经 `domain_bridge`（Humble 0.5.0）把**话题**转到 SJDrealman 的 domain 65。Humble 版 domain_bridge 不能转 service/action。
- pika_teleop 的正式模式 `pika_session_manager` 已实现“START→录制、STOP→录制结束+回零”，但它要调用 `/recording/manage`（service）和 `/l|r/execute_motion`（action），跨不过这道桥；把 enine 改回 domain 65 会重现 11-16 的 SEDP 发现风暴（两臂掉线），不采用。
- 键盘节点名叫 `foot_pedal`，只是沿用历史名称；它发布 `/foot_pedal/enabled`（`std_msgs/Bool`，20 Hz，边沿立即补发），`true` 表示键盘当前处于“已请求启动”。下文称“键盘启停状态”。
- 录制平台（`realman_recording`）的边界是“只订阅、不发运动命令”，因此归位逻辑不能放进录制包。
- BT `control_pick.xml` 的 pikavelocity 分支只在进入时做一次 `ThreeArmMoveJ pika_default_pose`，之后由 `PikaVelocityInput` 接管；键盘停止后速度会话在 router 的 input timeout（约 3 s）后自行结束，此后驱动接受外部 MoveJ。

## 方案

在 SJD 一侧（domain 65）新增一个小节点 `pika_episode_trigger`，只消费桥过来的键盘启停状态，在本地调用录制服务和 MoveJ。enine 只在桥配置中多转一个话题，继续跑 Bag 模式。

被否决的方案：

- 改 BT：在 pikavelocity 分支里加归位和录制调用。把录制生命周期混进运动树，树重启会丢失录制状态。
- 恢复正式模式：需要自写跨 domain 的 service/action 中继，成本最高。

## 数据流

```text
enine (domain 75)
  MyDIYKB W/A/S/D ─► pika_foot_pedal ─► /foot_pedal/enabled (Bool)
                                   └─► Bridge set_enabled（已有：启停左右遥操作）
        │ domain_bridge（新增这一个话题，reliable）
        ▼
SJDrealman (domain 65)
  pika_episode_trigger
    ├─ 订阅 /foot_pedal/enabled
    ├─ 订阅 /realman_bt_executor/input_mode_state（realman_msgs/InputModeState）
    ├─ 订阅 /<arm>/cartesian_velocity/state（realman_msgs/CartesianVelocityState.session_active）
    ├─ 订阅 /recording/status（启动时判断是否已有别人开的 session）
    ├─ 客户端 /recording/manage（START / STOP）
    ├─ Action 客户端 /<arm>/execute_motion（MOVEJ, BASE）
    └─ 发布 /pika_episode/state（std_msgs/String，JSON，reliable + transient_local）
```

## 组件

### 包 `realman_pika_session`（新，ament_python，`src/behavior/realman_pika_session`）

- `episode_machine.py`：纯 Python 状态机，不 import rclpy。输入是事件（键盘边沿、模式变化、速度会话状态、服务/Action 结果、时间推进），输出是要执行的动作（START、STOP、MoveJ 某臂）和新状态。可直接 pytest。
- `pose_config.py`：读取 `config/ros/pika_config.yaml` 的 `pika_default_pose`，校验规则与 `control_router.launch.py` 一致（每臂 6 个有限角度或 `skip: true`，至少保留一臂）。
- `trigger_node.py`：ROS 外壳，负责订阅、调用和发布，把回调转换成状态机事件；单线程 executor，所有 service/action 调用都是异步的，回调不阻塞。
- `launch/pika_episode.launch.py`：读取配置，`enabled: false` 时不启动节点。

### 配置 `config/ros/pika_episode.yaml`（新）

| 键 | 默认 | 含义 |
| --- | --- | --- |
| `enabled` | `false` | 仓库默认关闭；SJD 主机配置打开 |
| `task` | `""` | 写入 session 的任务标签（训练 prompt），换任务时改配置并重启节点 |
| `profile` | `teleop_v1` | START 的 profile |
| `record_cameras` | `true` | START 是否录相机 |
| `keyboard_topic` | `/foot_pedal/enabled` | 键盘启停状态话题 |
| `required_mode` | `pikavelocity` | 只在该输入模式下响应键盘 |
| `keyboard_stale_sec` | `3.0` | 录制中多久收不到键盘状态视为链路断开 |
| `release_timeout_sec` | `8.0` | STOP 后等待各臂 `session_active=false` 的上限 |
| `home_velocity_percent` | `30` | 归位 MoveJ 速度（与入口 MoveJ 相同） |
| `home_timeout_sec` | `120` | 每臂 MoveJ 超时 |

归位位姿不在这里重复，统一来自 `pika_config.yaml` 的 `pika_default_pose`。

### 启动位置

`realman_bringup` 的 `system.launch.py` 包含 `pika_episode.launch.py`（`remote_rviz.launch.py` 不包含）；配置读不到或不合法时该 launch 只打一条 `pika_episode_trigger NOT started: ...` 日志，不让整个 bringup 失败；`enabled: false` 时等于不存在。Dockerfile 的 colcon 清单加入新包。

### enine 侧（主机文件，不在本仓库）

`~/pika_teleop_ws/pika_domain_bridge.yaml` 增加：

```yaml
  /foot_pedal/enabled:
    type: std_msgs/msg/Bool
```

然后重启 `realman-pika-bridge` 用户单元。仓库文档记录这一步。

## 状态机

```text
IDLE ──键盘 false→true 且 active_mode==required_mode──► STARTING
STARTING ──START 成功──► RECORDING（若 STARTING 期间键盘已回到 false，立即转 STOPPING）
STARTING ──START 失败/服务不可用──► IDLE（state.detail 写原因；遥操作照常，本条不录）
RECORDING ──键盘 true→false──► STOPPING
STOPPING ──STOP 返回（成功或失败）──► RELEASING
RELEASING ──所有待归位臂 session_active=false，或 release_timeout 到──► HOMING（各臂发 MoveJ）
HOMING ──所有臂 MoveJ 成功──► IDLE
HOMING ──任一臂 MoveJ 失败/被拒/超时──► FAILED
RECORDING ──键盘状态 keyboard_stale_sec 未更新──► STOP 录制 ──► FAILED（不归位）
RECORDING ──active_mode 离开 required_mode──► STOP 录制 ──► FAILED（不归位）
FAILED ──键盘 false→true──► IDLE（只清除故障，不开录、不运动；下一次按键才开新一条）
```

规则：

- 非 `required_mode` 时键盘边沿只记日志，不开录、不运动，保证策略运行等其它模式下不会被键盘触发 MoveJ。
- STARTING 期间模式被切走：START 成功后立即按异常停止处理（STOP、FAILED、不归位）。
- 进入 HOMING 前再检查一次模式：已不是 `required_mode` 时不发 MoveJ，直接 FAILED，`detail` 写 `home skipped: mode changed to <x>`。覆盖 STOPPING、RELEASING 及释放超时三条路径。
- 节点给每次归位的 MoveJ 结果带上 episode 编号，上一条 episode 迟到的结果不计入当前 episode。
- STARTING 期间键盘回到 false 不丢弃：记住它，START 成功后直接 STOP 并归位，避免录制无人收尾。
- STOPPING / RELEASING / HOMING 期间的键盘边沿忽略并记日志。HOMING 期间驱动本来就拒绝新的速度会话。
- STOP 失败（录制服务报错或不可用）仍执行归位，但 HOMING 完成后进入 FAILED 而不是 IDLE，录制状态不伪造为成功。
- `release_timeout` 到时仍有臂 `session_active=true`：照常发 MoveJ；驱动若因忙拒绝，按 MoveJ 失败进入 FAILED。
- 链路断开或模式被切走属于异常停止，不自动归位，与旧正式模式一致。
- 节点启动时不运动，进入 IDLE。若 `/recording/status` 显示已有活动 session（不是本节点开的，例如策略尝试自动录制），不接管、不 STOP；此时按键不调用 START，`detail` 写 `ignored: recording busy (<id>)`。
- 录制结束后的导出沿用录制平台的 `auto_export_on_stop`；坏 episode 在 `:8770` 回放页隐藏或 DISCARD。
- 归位时不动夹爪：enine 的 Pika 夹爪流持续发布，SJD 侧发“全开”会立刻被覆盖。

`/pika_episode/state` JSON 字段：`state`、`session_id`、`task`、`detail`（最近一次失败或忽略原因）、`stamp_ns`。

## 测试

- `episode_machine` pytest：上面每条转移、每个超时、忽略的边沿、模式不符、STOP 失败后仍归位且终态 FAILED、FAILED 清除。
- `pose_config` pytest：合法配置、skip 臂、全部 skip 拒绝、非 6 值/非有限数拒绝。
- 隔离 ROS graph 集成测试：假 `/recording/manage` 服务、假 `execute_motion` action server、假 InputModeState 与 cartesian_velocity/state 发布端，验证一次完整按键 → START → 按键 → STOP → MoveJ（m 跳过）。
- 现场验收（SJD + enine）：pikavelocity 下按 W，确认 `:8770` 显示 RECORDING；遥操作后再按，确认录制收尾、l/r 回入口位姿、episode 自动导出并能回放；再按一次能开下一条。另测非 pikavelocity 模式按键无动作。

## 文档

- `website/docs/development/pika-teleop.md`：新增“键盘一键采集”一节（流程、配置、enine 桥配置、状态话题、故障处理）。
- `website/docs/development/recording-platform.md`：上游控制方说明中加入 `pika_episode_trigger`。
- 不新增页面，`website/tests/site.spec.ts` 无需新路由。

## 部署（SJDrealman）

1. 主机配置：`pika_episode.yaml` 设 `enabled: true` 和当前 `task`。
2. 重建 `rm65-humble-rviz:local`，只重建 bringup 容器；重建后 BT 树是 STOPPED，需从 `:8765` 重新启动 control_pick。
3. enine：桥配置加话题，重启 `realman-pika-bridge`。
4. 按部署惯例打回滚 tag，并先确认 m 停放、夹爪 `.env` 设备号当前有效。

## 不在范围内

- 夹爪归位动作。
- 网页上选择任务标签（已选：配置固定）。
- pikamixed / pikaposition 模式（`required_mode` 只取一个值；以后需要再扩成列表）。
- 正式模式的跨 domain 中继。
