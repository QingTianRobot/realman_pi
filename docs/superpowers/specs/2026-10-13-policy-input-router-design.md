# Policy 输入路由设计（PolicyInputStub 的落地）

> 状态：已实现（未上机）。2026-10-13 按评审意见定稿：两只臂同时做、去掉武装开关、保守限速、先抽共享模块。依据：2026-10-13 的假策略联调（bridge、模式切换、软件急停均已验证，机械臂未动，见 `policy-bridge.md`）以及对 `pika_control_router.py`、`control.xml`、`input_mode_nodes.cpp` 的阅读。

## 问题

`control.xml` 的 `policy` 分支只有占位叶 `PolicyInputStub`（只记一次诊断）。`policy_bridge` 发布的 `/pi05_policy/{l,r}/cartesian_velocity` 与 `gripper_percentage` 没有任何消费者，所以进入 policy 模式后手臂不会动，这对应 `policy-bridge-node-design` 的 R1、R4、R5。

现有的 Pika 和键盘模式也是同样的结构：BT 叶只是占位，真正的转发由独立的 Python 路由节点完成（`pika_control_router.py`、`keyboard_control_router.py`），它们订阅 `/realman_bt_executor/input_mode_state`，只在自己的模式下开 `CartesianVelocity` 会话并转发。

## 方案选择

| 方案 | 做法 | 结论 |
| --- | --- | --- |
| A. 新增 `policy_control_router.py` | 与 Pika、键盘路由并列，只在 `active_mode == policy` 时工作 | **采用**。风险与遥操隔离，沿用既有模式 |
| B. 在 Pika 路由里加 policy 分支 | 复用现成会话逻辑 | 否决：1000 行、已有 pikamixed，把策略的风险耦合进遥操路径 |
| C. bridge 直连驱动 | bridge 自己开会话 | 否决：破坏"bridge 是纯协议层"和模式所有权 |

BT 叶 `PolicyInputStub` 保持占位，只把诊断文字改为"policy stream is routed by policy_control_router"。

## 数据流

```text
policy_bridge ──/pi05_policy/r/cartesian_velocity──▶ policy_control_router ──/r/cartesian_velocity/command──▶ driver
              ──/pi05_policy/r/gripper_percentage──▶                        ──/gripper_right/percentage/command──▶ gripper_manager
control.xml(policy 分支) ──/realman_bt_executor/input_mode_state──▶ policy_control_router（唯一的模式来源）
```

夹爪这条路已存在：`/gripper_{left,right}/percentage/command`（`Float32`）被 Pika、键盘路由使用，所以 R4（"夹爪只有服务"）已不成立。

## 路由职责

1. **模式门**：只有 `active_mode == policy` 且 `phase == ACTIVE` 才处理输入；离开 policy 模式立即发零速并取消会话。
2. **两只臂同时路由**：参数 `arms` 默认 `[l, r]`。某只臂没有策略流就不会开会话，所以训练数据只有右臂也不受影响；bridge 一期仍只驱动 `active_side` 一只臂，双臂独立流是 bridge 的二期。
3. **输入校验**（每条速度）：
   - `header.frame_id == <arm>/work/pikabase`，否则丢弃并限频告警（与 Pika 路由一致）。
   - 分量全为有限值。
   - **按 `header.stamp` 判断新鲜度**：stamp 比当前时钟旧超过 `stale_ms` 的丢弃（bridge 用 ROS 时钟 now() 打 stamp）。
4. **限幅**：对线速度、角速度分别做范数限幅，上限独立于 bridge 的 `twist_scale`，是第二道保险。
5. **会话生命周期**（照 `_reconcile_velocity`）：有新鲜输入才开会话；新鲜输入按控制周期（20 ms）重发，避免 DDS 抖动越过驱动 100 ms 看门狗；输入过期则发零速并保留会话；超过 `input_timeout_ms` 才取消会话；绝不为过期输入开会话。会话目标用 WORK 参考 `work/pikabase`、`follow=false`（低跟随，与 Pika 一致）。
6. **没有第二道开关**：运动的唯一开关是 bridge 的 `/policy/activate`（不发布就没有输入）。路由不设武装开关；`dry_run` 沿用整个 launch 的约定（默认 true，上机时显式关闭）。
7. **夹爪**：转发 `gripper_percentage` 到 `/gripper_<side>/percentage/command`，要求值在 `[0,1]` 且有限，上限 10 Hz（gripper_manager 自己有死区和最小指令间隔）。
8. **急停**：服务 `/policy_router/emergency_stop`（`Trigger`）：立即发零速、取消会话并锁定；锁定在 bridge 停发满 `input_timeout_ms` 后自动解除，即操作员停掉再重新激活 bridge 才能重试。
9. **漂移保护（自动，不是开关）**：会话开始后 2 s 内，只要发出的命令都是零，任一关节偏移超过 1° 就取消并锁定，规则同急停。

## 停止路径与延迟

| 路径 | 触发 | 生效 |
| --- | --- | --- |
| bridge 停发（队列空、`/policy/emergency_stop`、`/policy/deactivate`） | bridge | `stale_ms` 内路由发零速；`input_timeout_ms` 后取消会话 |
| 路由急停服务、漂移保护 | 操作员 / 自动 | 下一个控制周期（20 ms）发零速并取消，驱动 `slow_stop` |
| 模式切换到 `none` 或其他模式 | 操作员 / Web | 路由收到模式消息即取消会话 |
| 驱动看门狗 | 驱动 | 命令停发 100 ms 后零速并终止会话 |
| 物理急停 | 现场 | 最终兜底，不依赖软件 |

建议默认值（待实测）：`stale_ms=100`（策略流 30 Hz，周期 33 ms，比 Pika 的 200 ms 更严）、`input_timeout_ms=500`、线速度上限 0.10 m/s、角速度上限 0.25 rad/s、线加速度 0.10 m/s²。联调通过后再逐步放开到 bridge 的 0.25 / 0.6。

## 需要先解决的风险

1. **会话开始时的拉动**。已测量：低跟随模式下，每次速度会话开始，手臂会向上一次会话的末端位姿漂移，即使命令为零；目前靠驱动的 `passthrough_reanchor_mode: canfd_current` 压住，而它挂在 MoveJ 之前。Pika 入场有 `ThreeArmMoveJ`，policy 入场没有，所以这个保护**不一定生效**。已做：路由内置漂移保护（见上）。待做：上机先用零速会话量漂移；确有漂移再给驱动加"速度会话开始前重新锚定"，而不是给 policy 加 MoveJ。
2. **坐标系**。训练数据的命令坐标系是 `r/work/pikabase`（`recording.yaml` 的 `cartesian_command_frames`），而 Pika 的 WORK 参考是单位变换，方向与基座一致，所以两者几何等价。bridge 现在发 `r_base_link`，路由会因 frame_id 不符丢弃。**已把 `policy_bridge.yaml` 的 `downlink.velocity.frame_ids` 改成 `l/work/pikabase`、`r/work/pikabase`**，契约里"坐标系是否等价"这一未决项就此关闭。
3. **两个路由共用 `/r/cartesian_velocity/command`**。Pika 路由和 policy 路由都会向它发布，QoS 深度 1。靠模式互斥保证同一时刻只有一个在发；测试要覆盖 pikavelocity ↔ policy 来回切换时没有残留会话。
4. **夹爪告警**。gripper_manager 在 `alarm != 0` 时拒绝命令，且告警可能一直锁存；路由应把拒绝记入日志并在统计里暴露，不要静默吞掉。

## 配置与接入（已完成）

- `config/ros/policy_router.yaml`，所有非默认值写了注释；`control_router.launch.py` 在 Pika 路由旁启动本节点，`dry_run` 沿用全局参数。
- `scripts/router_common.py`：把 Pika 路由里通用的 `ArmProfile`、`parse_arm_profiles`、范数限幅抽出来共享，另加 `velocity_goal`；Pika 路由行为不变（`velocity_follow` 那个旧测试在 main 上本来就失败，与此无关）。
- 不新增 Docker 服务，不改 `rm65` 命令。

## 测试与验证阶梯

**单元测试**（22 个，在 realman_ts 镜像里跑过）：新鲜度、frame_id、限幅、会话保持/置零/超时释放、模式切换取消、急停与锁定、漂移保护、夹爪限频、`dry_run`、目标被拒后退避。

**上机阶梯**（每一级通过才进下一级；全程有人持急停）：

1. `dry_run=true`：路由不发 goal。
2. 零速会话：假策略（速度 0），量会话开始的漂移，核对漂移保护。
3. 极小常速（0.02 m/s、1 s）：核对每个轴的方向和坐标系。
4. 脚本化重放：把留出集 episode 的 action 当作"策略"以 0.5 倍幅值重放，核对时间尺度（30 Hz）、符号和夹爪动作。
5. 接真实 checkpoint，从 action-only 的版本开始。
