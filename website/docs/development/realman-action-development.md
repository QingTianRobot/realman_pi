---
title: 睿尔曼 Action 开发与测试
description: RealMan ROS 2 Action 的接口契约、生命周期、安全边界、扩展步骤和测试用例。
---

# 睿尔曼 Action 开发与测试

本页面向需要阅读、调用或扩展 `realman_robot_driver` 的开发者。驱动把 ROS 2
Action 作为运动控制的唯一异步入口：调用方可以在运动期间读取反馈、请求取消，并根据
最终结果判断动作停在什么阶段。驱动不把一个已经提交给控制器的 SDK 调用伪装成同步函数，
也不把“收到一次成功事件”单独当作运动完成。

当前实现包含三个 Action：

- `realman_msgs/action/ExecuteMotion.action`：`MOVEJ`、`MOVEL`、`MOVEJ_P` 三种一次性运动。
- `realman_msgs/action/ExecuteTrajectory.action`：一次提交 2--256 个连接路点，由控制器
  对相邻轨迹做连续规划和交融。
- `realman_msgs/action/CartesianVelocity.action`：六轴末端速度 session；目标建立 session，
  速度本身通过 `TwistStamped` 话题持续刷新。

三臂使用同一套实现，只通过 namespace 和配置选择控制器。完整的关节状态、坐标服务、
RViz 数据链路和真机门槛见[三臂驱动与运动控制](./realman-driver-scaffold)。

## 代码边界

```text
ROS 2 client
    │ Action goal / cancel / feedback
    ▼
realman_driver_node.py
    ├── rclpy ActionServer: execute_motion
    ├── rclpy ActionServer: execute_trajectory
    ├── rclpy ActionServer: cartesian_velocity
    └── TwistStamped command subscription
    ▼
motion_coordinator.py                 cartesian_velocity_session.py
    │ ordinary-motion lifecycle         │ control worker + watchdog
    └──────────────┬────────────────────┴──────────────┐
                   │ ArmOwnership + CoordinateManager  │
                   ▼                                   ▼
             realman_sdk_adapter.py ─────── RealMan Python SDK
```

| 模块 | 应该放什么 | 不应该放什么 |
| --- | --- | --- |
| `src/driver/realman_msgs/action/` | 稳定的 ROS 字段、常量和单位 | SDK 方法名、线程状态或 Python 对象 |
| `motion_types.py` | 枚举、纯数据类、输入校验、四元数归一化、配置解析 | ROS node、网络调用、隐式读取控制器状态 |
| `motion_coordinator.py` | 普通运动的 reservation、ownership、反馈、完成证据、取消和 lockout | 直接拼接 ROS 参数或重复实现 SDK 序列化 |
| `cartesian_velocity_session.py` | 速度 session、命令新鲜度、加速度限制、worker/watchdog 和停止 | 修改其他 arm 的状态或绕过 ownership |
| `realman_sdk_adapter.py` | 一个明确的 SDK 调用边界，原样保留 API2 status | 将错误码转成布尔值后丢失、阻塞等待整个轨迹 |
| `realman_driver_node.py` | ActionServer、callback group、topic/service wiring、ROS message 转换 | 把业务状态机塞进 callback，直接调用 vendor SDK |
| `test/` | 可重复的 mock、失败路径、竞态和接口契约 | 依赖真实 IP 的默认单元测试 |

`ArmOwnership` 是每个 arm 的单一写入锁。普通运动、连接轨迹、速度 session、坐标
`apply/select`、显式 `/stop` 和事件通道恢复共享它；一个 arm 被占用时，另一个入口
必须在调用 SDK 之前拒绝。
三臂之间不共享这把锁，因此 `l`、`m`、`r` 可以各自有一个活动操作。

## ROS 端点

每个 namespace 都提供相同端点。以下以 `/l` 为例，中、右臂只需替换为 `/m`、`/r`：

| 端点 | 类型 | 作用 |
| --- | --- | --- |
| `/l/execute_motion` | `realman_msgs/action/ExecuteMotion` | 一次性关节或笛卡尔运动 |
| `/l/execute_trajectory` | `realman_msgs/action/ExecuteTrajectory` | 一次提交并监督整条连接轨迹 |
| `/l/cartesian_velocity` | `realman_msgs/action/CartesianVelocity` | 建立并监督六轴速度 session |
| `/l/cartesian_velocity/command` | `geometry_msgs/msg/TwistStamped` | 更新活动速度 session 的最新命令 |
| `/l/stop` | `std_srvs/srv/Trigger` | 抢占当前 arm 并执行最快受控停止 |
| `/l/recover_motion` | `realman_msgs/srv/RecoverMotion` | 取消后显式重建被隔离的 SDK 事件通道 |
| `/l/coordinates/verify` | `realman_msgs/srv/VerifyCoordinates` | 只读回查工具/工作坐标 |
| `/l/coordinates/apply` | `realman_msgs/srv/VerifyCoordinates` | 显式写入并回读默认坐标 |
| `/l/coordinates/select_tool` | `realman_msgs/srv/SelectFrame` | 选择配置内工具并回读 |
| `/l/coordinates/select_work` | `realman_msgs/srv/SelectFrame` | 选择配置内工作坐标并回读 |

Action 名称没有 `l/realman_driver` 前缀，因为节点已经运行在 `/l` namespace 下。发布
`ros2 action list` 时应看到九个 Action：每个 arm 各一个 `execute_motion`、
`execute_trajectory` 和 `cartesian_velocity`。

## ExecuteMotion 契约

### Goal

IDL 文件是唯一权威来源，字段含义如下。数组长度错误、NaN/Inf、四元数零模或坐标不在
当前验证状态时，目标在提交 SDK 前被拒绝。

| 字段 | 值/单位 | 约束 |
| --- | --- | --- |
| `command` | `MOVEJ=0`、`MOVEL=1`、`MOVEJ_P=2` | 必须是定义的整数常量 |
| `reference_type` | `BASE=0`、`WORK=1`、`TOOL=2` | 必须与已激活坐标类型一致 |
| `reference_name` | 控制器坐标名称 | 非空；必须在配置中存在并与回读选择一致 |
| `joint_degrees` | 六个角度，degree | 仅 `MOVEJ` 使用；六个值必须有限 |
| `pose_position_m` | `[x,y,z]`，m | 仅 `MOVEL`/`MOVEJ_P` 使用；三个值必须有限 |
| `pose_quaternion_wxyz` | `[w,x,y,z]` | 仅位姿命令使用；有限、非零模，入口归一化 |
| `velocity_percent` | `1..100`，百分比 | SDK 速度参数；不得以 ROS 弧度或 m/s 填入 |
| `blend_radius_percent` | `0..100`，百分比 | 原样传给 SDK；官方说明 `connect=0` 时不生效 |
| `connect` | `false` | 版本一拒绝 `true`，避免 Action 隐式改变连接生命周期 |
| `timeout_sec` | 秒 | 正的有限数；超时进入 slow-stop 流程 |

当前版本只允许 `connect=false`，所以虽然 IDL 保留了 `blend_radius_percent`，实际运动
不会启用轨迹交融。未来支持连接轨迹前，必须先定义 cancel、timeout 和多段轨迹 ownership
如何作用于整条链，不能只把 `connect=true` 校验删除。

对于 `MOVEL` 和 `MOVEJ_P`，项目 Action 始终接收七值位姿 `[x, y, z, w, x, y, z]`；
`RealManSdkAdapter` 在调用 `rm_movel()`/`rm_movej_p()` 前将其转换为 SDK 要求的六值
`[x, y, z, rx, ry, rz]`，其中位置单位为米、Euler 姿态单位为弧度。调用 SDK 时不能把
四元数四项直接追加到位置后作为七值列表传入。

`MOVEJ` 不要求位姿字段有效，`MOVEL` 和 `MOVEJ_P` 不要求关节字段有效。这一行为由
`motion_types.validate_goal()` 的命令分支测试固定下来，新增字段时不要让无关字段产生
隐藏耦合。

### Result

| `terminal_state` | `success` | 语义 |
| --- | --- | --- |
| `SUCCEEDED=0` | `true` | 已提交、观察到 active 后回到 inactive，且完成证据满足命令类型 |
| `CANCELED=1` | `false` | Action cancel 被接受，SDK immediate stop 成功并确认停止 |
| `ABORTED=2` | `false` | 参数、连接、SDK、轨迹错误、停止失败或安全 lockout |
| `TIMEOUT=3` | `false` | deadline 到期，slow-stop 成功但未能在期限内完成正常目标 |

所有结果保留 `api2_status` 和人可读 `message`。`api2_status=0` 只表示对应 SDK 操作
返回成功，不代表机械臂已经到位；调用方必须同时检查 `terminal_state` 和 `success`。
`final_joint_degrees` 是最后一次有效关节回读，单位为 degree，与发布到
`JointState` 的 ROS 弧度有意不同。

### Feedback

| `phase` | 发生时间 | 重点字段 |
| --- | --- | --- |
| `VALIDATING=0` | Action execute 开始 | 已有 reservation/ownership，尚未提交 SDK |
| `SUBMITTING=1` | 即将调用 `rm_movej`/`rm_movel`/`rm_movej_p` | 说明正在发送非阻塞 SDK 请求 |
| `EXECUTING=2` | SDK 接受后轮询期间 | 当前关节、估计进度、活动坐标和 API2 status |
| `STOPPING=3` | cancel、timeout 或 shutdown | cancel/shutdown 发送 immediate stop，timeout 发送 slow-stop，并等待 inactive |

`progress` 是可用关节目标和当前关节之间的保守估计，不是控制器的真实轨迹百分比；
位姿命令不能从关节角可靠推导位置，因此不要把它当作笛卡尔误差。反馈中的
`active_reference_type/name` 是驱动实际通过坐标管理器验证过的活动坐标。

## ExecuteMotion 生命周期

一次普通运动必须经过下面的顺序。顺序是安全契约，重构时不能只保留“调用 SDK”而
省略中间证据：

1. `goal_callback` 做静态校验、连接检查、坐标名称检查、motion gate 检查和 arm busy 检查。
2. 成功接收后立即创建 reservation 并取得该 arm 的 ownership；尚未进入 `execute` 的
   goal 也已经阻止另一个运动越过它。
3. `execute` 再次消费 reservation 并发布 `VALIDATING`，防止 cancel/stop 在调度间隙被遗漏。
4. 调用 adapter 的非阻塞 `movej`、`movel` 或 `movej_p`。SDK 返回非零时直接 `ABORTED`，
   不等待一个没有提交成功的轨迹。
5. 只有 SDK 提交成功返回后，才打开当前 generation 的事件接收窗口。注册前到达的
   callback、其他 device 或其他 event type 必须丢弃。
6. 轮询 `current_trajectory`、`current_arm_state` 和关节状态，发布 `EXECUTING` feedback。
7. 只有同时满足以下条件才允许 `SUCCEEDED`：
   - 当前 generation 收到 trajectory success event；
   - 观察到轨迹曾经 active，之后又明确回到 inactive；
   - 连接没有丢失，且没有发生 stop/cancel/timeout；
   - `MOVEJ` 的六个最终关节都在 `joint_goal_tolerance_deg` 内；
   - `MOVEL`/`MOVEJ_P` 至少具备事件与 active-to-inactive 证据，不能用关节角冒充位姿到位。
8. cancel 和 driver shutdown 只调用一次 `rm_set_arm_stop()`，立即终止轨迹后进入 `STOPPING`
   并等待 inactive；timeout 仍调用一次 `rm_set_arm_slow_stop()`。显式 `/stop` 同样使用
   `rm_set_arm_stop()`，可以抢占普通运动或速度 session。
9. 已提交运动在监控、轨迹事件或内部执行中发生异常时，也先发送 `rm_set_arm_stop()`；
   stop 返回非零、等待线程超时、断线状态不明确或事件通道无法证明已清空时，进入
   fail-closed lockout。lockout 只能在确认 disconnect 后清理，不能由下一个 goal 覆盖。
10. 释放 generation 和 ownership；如果提交过但没有消费到当前 generation 的完整事件，
    对旧事件通道设置 quarantine。若 cancel/timeout 已经确认控制器轨迹 inactive，驱动会
    自动断开并重建该臂 SDK 连接、重新注册事件回调，再通过 reconciliation 清理 quarantine；
    重连或 inactive 证据失败时仍保持安全锁，不能由下一个 goal 强行覆盖。

## ExecuteTrajectory 契约

`ExecuteTrajectory` 用于已经知道后续路点的连续运动。一个 goal 包含统一的
`reference_type/reference_name`、总超时和 2--256 个 `MotionWaypoint`。每个路点包含
`command`、命令对应的关节或位姿目标、`velocity_percent` 和
`blend_radius_percent`。驱动先校验整组数据，再取得一次 `ArmOwnership`：

- 第一个到倒数第二个路点调用 SDK 时使用 `connect=1`；
- 最后一个路点固定使用 `connect=0`，闭合控制器队列；
- 中间点的非零交融半径才有连续通过目标点的意义，最后一点的交融半径不会生效；
- 所有位姿路点共享同一个已验证参考系，队列执行中不能切换 tool/work frame；
- 每个 SDK 提交之间重新检查 cancel 和 `/stop`，但不会在一次 SDK 调用中间释放锁；
- 任一路点提交失败时，只要已有路点进入控制器，就先 immediate stop 并确认 inactive；
- 整条轨迹只有在最终成功事件、active-to-inactive 和连接证据成立后返回成功；末点为
  `MOVEJ` 时还必须满足关节容差。

整个 goal 是一个取消边界。Action cancel 会停止并清空当前连续轨迹，不会把新 goal
无缝接到旧轨迹上；需要连续路径时应在取消前把后续路点放入同一个
`ExecuteTrajectory` goal。反馈中的 `submitted_waypoints` 只表示已被 SDK 接受的路点数，
`completed_waypoints` 只在整条轨迹成功后等于总数，因为厂商事件没有可靠的逐路点
generation/index。

低风险 mock 示例：

```bash
ros2 action send_goal /l/execute_trajectory \
  realman_msgs/action/ExecuteTrajectory \
  "{reference_type: 0, reference_name: base, timeout_sec: 20.0, waypoints: [
    {command: 0, joint_degrees: [0, 5, 0, 0, 0, 0],
     velocity_percent: 10, blend_radius_percent: 10},
    {command: 0, joint_degrees: [0, 0, 0, 0, 0, 0],
     velocity_percent: 10, blend_radius_percent: 0}
  ]}" --feedback
```

### 为什么需要 generation

RealMan 事件 payload 没有 ROS Action request ID。驱动为每次提交分配单调递增的
generation，并在提交前关闭事件窗口。这样可以阻止以下错误：

- 上一个目标的 delayed success callback 被下一个目标消费；
- SDK 返回提交失败，但随后到达的事件让目标看起来成功；
- cancel/stop 已经结束目标，但晚到的 inactive/active 事件改变终态；
- reconnect 后旧句柄的 callback 继续污染新连接。

因此，任何新 Action 若绕过 `MotionCoordinator` 自己注册 callback，都必须先解决同样的
身份关联问题；“回调里直接 `goal_handle.succeed()`”是不允许的实现。

### 取消后的事件通道恢复

RealMan 的 `rm_event_push_data_t` 不包含 ROS Action request ID 或 generation。取消一个已经
提交的目标时，`rm_set_arm_stop()` 成功且 `rm_get_arm_current_trajectory()` 返回 inactive，
只能证明物理轨迹已经停止，不能证明旧回调已经从 SDK 接收队列中消失。因此驱动不会直接把
旧 generation 的事件通道重新用于下一条运动，而是将该臂短暂置于 event-channel quarantine。

`RealManDriverNode` 通过 `MotionCoordinator.event_channel_recovery_required` 发现这种可恢复
状态，断开并重新创建 SDK handle，重新注册 `handle_event`，然后调用
`reconcile_after_connect(connection_reset=True)`。网页端或其他 ROS 客户端发送下一条 goal 时
也会触发同一恢复流程；状态定时器还会按 `reconnect_interval` 在后台重试，因此单次 SDK
重建失败不会让节点永久失去恢复能力。只有确认重连后的轨迹仍为 inactive 且 API2 状态为 0，
下一条 goal 才会获得 `ArmOwnership`。恢复失败期间该 arm 保持 `connected=false` 并拒绝运动，
其他 arm 不受影响。

调用方也可以在 Action 已返回 `CANCELED` 后主动恢复；服务幂等，通道已经健康时返回
`success=true, recovered=false`，实际执行了重建时返回 `recovered=true`：

```bash
ros2 service call /l/recover_motion realman_msgs/srv/RecoverMotion "{}"
```

恢复会原子取得该 arm 的 `ArmOwnership`，再执行 disconnect、1 秒冷却、connect、事件
callback 注册和 inactive reconciliation。若同一 arm 正在执行普通运动、连接轨迹、速度
session 或坐标写入，服务拒绝，不会在活动 SDK 调用旁边重连。

## Kinematics services

每个 namespaced driver 还提供只读的末端位姿和逆解服务：

| Service | Interface | Purpose |
| --- | --- | --- |
| `/l/get_current_pose`（以及 `/m`、`/r`） | `realman_msgs/srv/GetCurrentPose` | 从当前关节状态做 FK，并按已验证参考系返回当前 XYZ/WXYZ |
| `/l/solve_ik`（以及 `/m`、`/r`） | `realman_msgs/srv/SolveIk` | 将参考系目标转换到 base 后调用 SDK IK，返回 degree 关节解 |

它们只执行状态读取和算法计算，不拥有运动 Action，也不会提交 `rm_movej()`、`rm_movel()`
或 `rm_movej_p()`。调用方必须传入当前激活的参考系名称；逆解的 `seed_joint_degrees`
用于选择接近当前姿态的解。`GetCurrentPose` 和 `SolveIk` 的位置单位是米，四元数顺序是
WXYZ，算法使用的中间欧拉角单位是弧度。

## CartesianVelocity 契约

### 两阶段接口

速度控制不是每条 `TwistStamped` 都建立一个 Action。调用方先发送一个
`CartesianVelocity` goal 建立 session，再持续发布命令：

```text
Action goal accepted
        │  claim ArmOwnership, validate frame, initialize rm_set_movev_canfd_init
        ▼
/l/cartesian_velocity/command  --latest command--> control worker --rm_movev_canfd-->
        │                                                  │
        └── no fresh command ----------------------- watchdog -> zero + slow-stop
```

### Goal 与反馈

| 字段 | 单位/约束 |
| --- | --- |
| `reference_type/name` | 必须对应当前已验证的 BASE/WORK/TOOL 坐标 |
| `control_period_ms` | 必须等于配置周期，当前默认 20 ms |
| `watchdog_ms` | 正数且不超过配置上限，当前默认 100 ms |
| `max_linear_accel_mps2` | 正数且不超过逐臂配置上限 |
| `max_angular_accel_radps2` | 正数且不超过逐臂配置上限 |
| `follow` | 原样传给 `rm_movev_canfd` |
| `trajectory_mode` / `radio` | 模式 `0/1/2` 对应 `radio` 范围 `0`、`0..100`、`0..1000` |

`TwistStamped.twist` 的前三项是 `vx, vy, vz`（m/s），后三项是 `wx, wy, wz`（rad/s）。
实现只处理速度向量，不把角速度拆成 Euler 角，也不会在速度 session 内维护一个姿态
四元数。四元数只属于位姿 Action 和坐标配置边界。

速度 feedback 还会返回命令向量、经过速度/加速度限制后的向量、`command_age_ms`、
活动坐标和 API2 status。IDL 保留 `SUCCEEDED=0`，但当前速度 session 是开放式控制，
没有“到达终点后自然成功”的路径：调用方主动结束返回 `CANCELED`，命令断流返回
`WATCHDOG_STOP`，初始化/SDK/停止失败返回 `ABORTED`。`WATCHDOG_STOP` 不是成功到位。

### 命令新鲜度与 QoS

订阅为 `KEEP_LAST=1`、`VOLATILE`，DDS lifespan 等于 watchdog。每条命令必须满足：

- `header.stamp` 非零；
- 使用当前节点 ROS clock，不能晚于当前时间；
- 不早于本 session 的启动 epoch；
- 同一 session 内严格晚于上一条已接受命令；
- `header.frame_id` 与目标坐标一致，例如 `/l` 的 BASE 使用 `l/base_link`。

无效命令在进入 SDK 前拒绝，并以 DEBUG 记录，避免高频输入刷屏。control worker 每个
周期最多一次 `rm_movev_canfd`；如果 SDK 调用超过周期，下一次 tick 从调用完成时间
重新排程，绝不在一个周期内补发多次命令。独立 watchdog 线程负责在命令年龄超限时发送
一次零速度和一次 slow-stop。

### 速度停止语义

- Action cancel：停止发送普通命令，发送零速度，再调用 slow-stop，等待 worker 和 watchdog
  线程退出。
- watchdog：自动零速并返回 `WATCHDOG_STOP`；如果停止失败则返回 `ABORTED` 并 lockout。
- `/stop`：抢占 ownership，使用最快的 `rm_set_arm_stop()`，不会被普通 cancel 覆盖。
- `shutdown`/`disconnect`：先停止速度 session，再停止普通运动，最后才 disconnect SDK。

后续若加入新的连续控制 Action，必须复用这个 ownership 和停止顺序，不能为每个接口
单独建立“看起来空闲”的布尔变量。

## 坐标与 motion gate

`config/ros/realman_coordinates.yaml` 只描述期望状态，`CoordinateManager` 在连接后
按 `policy.on_start` 回读控制器。默认 `verify` 不写入控制器；工具、工作坐标任何字段
不匹配都会关闭 motion gate。该 gate 只拦截依赖控制器工具/工作坐标的 `MOVEL`、
`MOVEJ_P` 和速度 session；关节空间 `MOVEJ` 不读取位姿参考系，仍可在坐标 mismatch
时提交。

开发者新增一个坐标相关字段时必须同时更新：

1. YAML 解析和未知字段拒绝；
2. 控制器回读比较和四元数容差；
3. `VerifyCoordinates`/`SelectFrame` 的结果消息；
4. Action 目标校验中的 active frame 检查；
5. mismatch、apply、select、写后回读失败测试。

坐标写入是 mutation，只有显式 `coordinates/apply` 或 `select_*` 才能触发；任何 Action
goal 都不能隐式写入工具或工作坐标。

## 扩展一个新 Action

按以下顺序扩展，能把错误限制在最早的层：

1. **先定 IDL。** 在 `src/driver/realman_msgs/action/` 增加 goal/result/feedback，给每个
   常量固定数值、写清单位，更新 `CMakeLists.txt`。不要复用 `string status` 代替枚举，
   也不要把 vendor struct 直接暴露到 ROS。
2. **写纯校验。** 在 `motion_types.py` 增加不可变输入/输出类型和 `validate_*()`；拒绝
   非有限值、错误长度、错误 enum、未配置 frame、断线和超出 `realman_motion.yaml` 的值。
3. **加 adapter 边界。** 在 `realman_sdk_adapter.py` 增加一个最小方法，保留原始 API2
   status。单位转换只允许发生在这里或明确的 ROS 发布边界，并为每个 vendor 调用写 mock。
4. **实现生命周期协调器。** 复用 `ArmOwnership`，明确 reservation、generation、完成证据、
   cancel、timeout、fast stop、lockout 和 disconnect 的状态转换。不要在 `rclpy` callback
   里同步等待一个不受控的网络轨迹。
5. **接入节点。** 在 `realman_driver_node.py` 创建 `ActionServer`，普通动作放入运动
   callback group，连续命令使用独立的 `MutuallyExclusiveCallbackGroup`；补充 shutdown
   顺序和 namespace 测试。
6. **扩展 mock。** mock adapter 必须生成和真机相同的 active、success event、inactive
   序列，并允许测试 API2 错误、断线、事件延迟和 stop 失败。mock 不能直接把 goal 标记成功。
7. **补配置。** 逐臂安全上限放在 `config/ros/realman_motion.yaml`，坐标放在
   `config/ros/realman_coordinates.yaml`，不要散落到 launch、Dockerfile 或源代码。
8. **先跑自动化，再做真机门槛。** 通过接口、纯逻辑、协调器、adapter、节点和 mock graph
   测试后，才按[三臂驱动与运动控制](./realman-driver-scaffold)的真机清单放行。
9. **同步 Web 手册。** 在同一提交更新本页、总览页、导航、测试路由和相关 operator guide。

### 不允许的捷径

- 用 `time.sleep()` 代替可取消的状态等待；
- 用最后一帧关节状态推断 `MOVEL` 已到位；
- 收到任意 trajectory event 就完成当前 goal；
- stop API 返回后立即释放 ownership，而普通运动没有确认 inactive、连续控制没有确认线程退出；
- 把 vendor degree、ROS radian、m/s、rad/s 混在同一个字段里；
- 在测试默认配置中放入真实控制器 IP 或让单元测试访问现场网络；
- 仅测试成功路径，不测试 cancel、timeout、断线、旧事件、并发和停止失败。

## 测试金字塔

### 测试层与责任

| 层级 | 文件 | 至少覆盖的行为 |
| --- | --- | --- |
| ROS IDL | `src/driver/realman_msgs/test/test_interface_files.py` | 字段顺序、常量、数组长度、依赖和 CMake 注册 |
| 纯类型/配置 | `test_motion_types.py` | enum、四元数归一化、单位/范围、frame resolver、未知配置键 |
| 普通/连接轨迹状态机 | `test_motion_coordinator.py` | reservation、busy、连接路点、部分提交、event、完成、取消、超时、lockout |
| 速度 session | `test_cartesian_velocity_session.py` | stamp、frame、限速、限加速度、QoS 边界、周期 overrun、watchdog、线程竞态 |
| 坐标安全 | `test_coordinate_manager.py` | 读取匹配、mismatch gate、apply/select、写后回读、ownership 和四元数容差 |
| SDK 适配器 | `test_realman_sdk_adapter.py` | vendor 参数、原始 status、回调指针、句柄/断线、stop 和 mock 事件 |
| ROS node/launch | `test_realman_driver_node.py` | ActionServer 注册、topic/QoS、配置透传、停止顺序、服务响应和 shutdown |
| mock graph | `test_system_launch.py` 及驱动测试 | 三臂 namespaces、9 Action、坐标/恢复 services、3 command topics、TF 数据链路 |
| 真机验收 | 现场清单 | SDK 版本、网络、verify、低速目标、cancel、watchdog、断线和急停 |

### 推荐的最小回归集

在仓库根目录执行下面命令；`realman_driver_test` 镜像在构建阶段已经运行 colcon 测试，
下面的命令用于快速重复 Action 相关回归，不会连接真实控制器：

```bash
cd <repository-root>
docker compose build realman_driver_test
docker compose run --rm --no-deps realman_driver_test bash -lc '
  source /opt/ros/humble/setup.bash
  source /opt/rm65_ws/install/setup.bash
  cd /opt/rm65_ws
  PYTHONPATH=/opt/rm65_ws/src/driver/realman_robot_driver \
    python3 -m pytest -q \
      src/driver/realman_msgs/test/test_interface_files.py \
      src/driver/realman_robot_driver/test/test_motion_types.py \
      src/driver/realman_robot_driver/test/test_motion_coordinator.py \
      src/driver/realman_robot_driver/test/test_cartesian_velocity_session.py \
      src/driver/realman_robot_driver/test/test_coordinate_manager.py \
      src/driver/realman_robot_driver/test/test_realman_sdk_adapter.py \
      src/driver/realman_robot_driver/test/test_realman_driver_node.py
'
```

完整构建和包级结果：

```bash
docker compose build realman_driver_test
docker compose run --rm --no-deps realman_driver_test bash -lc '
  source /opt/ros/humble/setup.bash
  cd /opt/rm65_ws
  colcon test --packages-select realman_msgs realman_robot_driver realman_bringup
  colcon test-result --verbose
'
```

### 关键用例清单

新增或修改 Action 时，至少保留这些行为测试。函数名是当前实现中的可检索入口，重命名
时应在同一次提交更新本页：

普通运动：

- `test_invalid_execute_aborts_without_any_sdk_call`：校验失败不得触碰 SDK；
- `test_valid_movej_uses_exact_adapter_call_and_event_succeeds`：验证 MOVEJ 参数、事件和成功；
- `test_submission_callback_before_sdk_returns_is_ignored_as_stale`：提交返回前的 callback 无效；
- `test_success_event_without_observed_active_trajectory_fails_safe`：没有 active 证据不能成功；
- `test_movej_completion_requires_final_joints_to_converge_on_target`：六轴都必须满足容差；
- `test_cancel_stops_once_waits_for_stopped_state_and_returns_canceled`：cancel 只 immediate stop 一次且等 inactive；
- `test_execution_exception_fast_stops_submitted_motion_before_aborting`：执行异常先 immediate stop 再返回；
- `test_timeout_slow_stops_once_and_returns_timeout`：deadline 进入 timeout，不伪造 success；
- `test_fast_stop_without_inactive_trajectory_aborts_and_locks_out_arm`：最快停止不确定时保持 lockout；
- `test_event_received_before_submission_cannot_succeed_later_goal`：旧事件不能污染新 goal；
- `test_goal_callback_rejects_busy_arm_atomically`：并发 goal 只能一个取得 ownership。

速度 session：

- `test_stamp_is_required_and_stale_commands_cannot_refresh_watchdog`：缺 stamp/旧 stamp 拒绝；
- `test_older_stamp_cannot_overwrite_newer_command_in_same_session`：乱序命令不得覆盖最新值；
- `test_tick_limits_linear_and_angular_delta_norms_independently`：线/角速度限制独立生效；
- `test_run_loop_rebases_after_overrun_instead_of_catching_up_ticks`：SDK 慢调用不追赶补发；
- `test_watchdog_sends_zero_then_stops_once_and_rejects_commands`：watchdog 零速、stop、终态完整；
- `test_safety_supervisor_stops_blocked_movev_without_terminal_overwrite`：阻塞 SDK 仍能被监督线程停止；
- `test_motion_coordinator_and_velocity_session_share_real_arm_ownership`：两种运动不能并发；
- `test_fast_stop_is_issued_while_control_movev_is_blocked`：`/stop` 可以抢占阻塞速度调用；
- `test_confirmed_disconnect_clears_velocity_lockout_and_releases_ownership`：只在确认断开后清理；
- `test_base_velocity_uses_namespaced_base_link_frame`：三臂 BASE frame 不串 namespace。

接口和节点：

- `test_motion_action_contracts_are_exact`：IDL 变更必须显式更新契约测试；
- `test_connected_trajectory_submits_connected_points_and_completes_once`：中间点
  `connect=true`、末点 `false`，整条轨迹只返回一次终态；
- `test_connected_trajectory_partial_submission_is_fast_stopped`：部分入队失败必须先快停；
- `test_connected_trajectory_observes_cancel_between_waypoint_submissions`：路点之间响应取消，
  不再提交剩余队列；
- `test_node_source_registers_execute_motion_action_with_all_lifecycle_callbacks`：必须接入
  goal/cancel/accepted/execute 四个 callback；
- `test_node_source_registers_cartesian_velocity_action_and_command_topic`：速度 Action 和命令 topic
  必须同时存在；
- `test_node_source_registers_connected_trajectory_and_recovery_interfaces`：连续轨迹和恢复
  service 必须同时注册；
- `test_velocity_command_uses_dedicated_serial_qos_and_freshness_boundary`：QoS 与 freshness
  不能被普通 topic 默认值替代；
- `test_node_shutdown_stops_velocity_before_disconnect`：shutdown 顺序必须保持；
- `test_node_source_clears_lockouts_only_after_successful_disconnect`：断开失败时不清除安全状态。

### 用例写法

协调器测试应使用假的 adapter、假的时间函数和假的 Action handle，把每一次 SDK 调用
记录为列表，再断言“调用顺序 + 参数 + 终态”，而不是只断言 `success`：

```python
def test_cancel_stops_once_waits_for_stopped_state_and_returns_canceled():
    coordinator, adapter, clock, ownership = make_coordinator()
    handle = FakeGoalHandle(movej_goal())
    clock.on_sleep = lambda: setattr(handle, "is_cancel_requested", True)

    result = coordinator.execute(handle)

    assert result.terminal_state == FakeResult.CANCELED
    assert adapter.calls.count(("stop",)) == 1
    assert adapter.calls.count(("slow_stop",)) == 0
    assert FakeFeedback.STOPPING in [item.phase for item in handle.feedback]
    assert handle.transitions == ["canceled"]
    assert ownership.is_busy("l") is False
```

实际测试可以使用项目已有的 `FakeAdapter`、`FakeGoalHandle` 和可控 clock；不要在单元测试
中启动真实 `ActionServer` 或等待 wall clock，否则 cancel/timeout 竞态会变得不可重复。
对 `rclpy` wiring 的检查放在 `test_realman_driver_node.py`，对 ROS graph 的检查再放到
mock launch 层。

### Mock graph 验证

启动 mock 三臂驱动后，确认接口数量和终态，而不触碰现场网络：

```bash
docker compose run --rm --no-deps realman_driver_test
# 另一个同一 ROS_DOMAIN_ID 的终端
ros2 action list
ros2 service list | grep '/coordinates/'
ros2 topic list | grep '/cartesian_velocity/command'
ros2 action send_goal /l/execute_motion realman_msgs/action/ExecuteMotion \
  "{command: 0, reference_type: 0, reference_name: base, \
    joint_degrees: [0, 0, 0, 0, 0, 0], pose_position_m: [0, 0, 0], \
    pose_quaternion_wxyz: [1, 0, 0, 0], velocity_percent: 10, \
    blend_radius_percent: 0, connect: false, timeout_sec: 2.0}" --feedback
```

mock 普通运动必须经历 active、success event、inactive，然后返回 `success: true`、
`terminal_state: 0`、`api2_status: 0`。这只证明 ROS 协议和状态机，没有证明真实控制器
会以相同速度或在相同空间路径运动。

## 真机放行边界

自动化测试永远不替代现场安全验收。第一次在真机使用新 Action 时：

1. 先用只读 SDK 探针确认句柄、型号、版本和关节回读；
2. 对每个 arm 执行 `coordinates/verify`，不匹配时不得调用 `apply`；
3. 清空工作区，限制速度和负载，确保现场急停可触达；
4. 只放行一个 namespace 的低速 `MOVEJ`，观察完整 feedback、active/inactive 和 final joints；
5. 单独验证 cancel、timeout、`/stop`、watchdog 和断线，不要把多个失败原因混在一次测试中；
6. 记录目标、坐标、版本、API2 status、日志目录和现场观察，再扩大到位姿和角速度。

`/stop`、普通运动 Action cancel 和 driver shutdown 都使用最快的 SDK 受控停止，不是断电
急停。速度 Action cancel 仍先发零速度再 slow-stop。任何 stop 失败、线程无法退出、坐标
回读不一致或事件身份不确定，都必须保持 lockout，先断开并人工检查。

## SDK 兼容依据

项目 Docker 当前锁定 `Robotic_Arm==1.1.6`，本页 API 语义核对自项目 `doc/` 中基于
官方开发站 `V1.7.13` 整理的快照：

- `doc/02-motion-and-teaching.md`：`rm_movej`、`rm_movel`、`rm_movej_p`、
  `rm_set_movev_canfd_init`、`rm_movev_canfd` 和停止方法；
- `doc/04-coordinate-and-algorithm.md`：`rm_pose_t`、工具/工作坐标和四元数约定；
- `doc/09-types-and-structures.md`：位置 m、关节 degree、Euler rad、四元数 `w,x,y,z`；
- `doc/10-api-index.md`：方法签名、`rm_get_arm_current_trajectory` 和事件 callback；
- `doc/11-examples-errors-and-versions.md`：API2 通用返回码和版本记录要求。

普通运动使用 SDK 多线程非阻塞 `block=0`，完成依赖
`rm_get_arm_event_call_back()`。官方说明单线程不支持该 callback，因此当前 driver 配置
要求 `RM_TRIPLE_MODE_E`；回调对象必须在连接生命周期内保留。`rm_set_arm_stop()` 是保持
动力的最快关节速度受控停止，轨迹不可恢复，它仍然不能替代硬件急停。

目标控制器固件、规划层或 SDK 版本变化时，先复核官方方法页面和 API2 错误表，再更新
adapter 测试与本页。不能仅凭 mock 行为推断不同固件的事件字段和完成时序一致。
