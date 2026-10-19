# Pika 位置控制的相对锚点启用设计

## 背景与目标

`pikaposition` 现在把 `/pika/{l,r}/cartesian_pose` 当作绝对基座系目标原样转发给 driver（`_reconcile_position`，见 2026-09-18 的 Pika Cartesian 设计）。Pika 侧 mapper 的零位是 YAML 里的默认 TCP 位姿，router 对臂的当前位置一无所知。因此只要 session 启动时臂不在默认 TCP 上（手势异常停止后不会自动回零，或入口 MoveJ 有残差），第一条目标就会让臂以 driver 的关节限速（`pose_max_joint_speed_dps`，30°/s）冲向 mapper 的零位。router 对位置模式也没有 leash，IK 失败后恢复可达时没有任何兜底。

参考仓库 `QingTianRobot/lerobot-realman-vla` 的遥操作（`scripts/collect_data.py` 的 `ViveController.enable()`）在启用时把臂的当前位姿作为锚点，手的相对运动叠加在锚点上，所以启用瞬间臂原地不动。`pikamixed` 已经在 router 侧实现了同样的锚定、姿态配对和 leash。

目标：让 `pikaposition` 采用"启用时以臂的当前位姿为锚点"的语义，启用瞬间无跳变，并在 Pika 位姿流不连续（mapper 重新清零）时原地重新锚定，同时加上与 mixed 相同形式的 leash。

## 范围

做：`pikaposition` 的相对锚点、会话内重新锚定、位置与姿态 leash、对应配置、测试、文档，以及依赖绝对位姿语义的 `scripts/simulate_pika_pose.py`。

不做：
- `pikamixed`、`pikavelocity`、keyboard router 的行为；
- driver、`.action`、话题契约（`/<arm>/cartesian_pose/command` 仍是绝对基座系目标，由 router 计算后发布）；
- 控制器侧滤波与高跟随（`follow`、`trajectory_mode`、`radio`），输入端 One Euro 滤波；这是参考仓库中关于"手感"的部分，单独评估；
- 笛卡尔工作空间盒（需要逐臂实机标定，是独立的一件事）；
- 切换到 `rm_movep_canfd`，位置 session 继续用 driver 内 IK 加 `rm_movej_canfd`；
- 启动时的"非指令运动"保护（用户此前对类似的启动保护持保留态度）。

## 方案选择

在 router 侧新增 `PositionTarget`，与 `MixedTarget` 并列，复用锚点读取和实测轮询（方案 A）。放弃的方案：
- 把 `MixedTarget` 泛化为可插拔位置源：重复最少，但要改动已在实机上调过的 mixed 路径，与"只改 pikaposition"的范围相悖。
- 在 driver 的 `CartesianPoseSession` 里锚定：`/cartesian_pose/command` 的契约是绝对目标，mixed 已在 router 侧锚定，driver 再锚定一次会双重偏移。

启用语义选相对锚点而不是"绝对位姿加软启用"：后者保持手和臂的绝对对应，但启用后臂要自己走一段，期间手无法同步。

## 行为

### 锚定与配对

进入 `pikaposition` 且收到有效 Pika 位姿后，router 调 `/<arm>/get_current_pose`（BASE，`base`）读臂的当前位姿 `A = (A_pos, A_q)`，读成功之前不开 session。读失败或服务未就绪时按 0.5 s 退避重试，不盲目启动。

session 被接受后第一条发布的目标就是 `A`，臂原地起步。第一帧 Pika 位姿 `(p0, q0)` 在首次计算目标时惰性配对（与 `MixedTarget.goal_orientation` 捕获 `pika_reference` 的方式一致）。之后：

- `target_pos = A_pos + (p − p0)`；
- `target_q = (q ⊗ q0⁻¹) ⊗ A_q`，数学与 `MixedTarget.goal_orientation` 相同，四元数为 wxyz、基座系。

Pika 位姿的 frame 是 `{l,r}/base_link`，位置增量与臂基座系同轴，无需外参换基。

### 会话内重新锚定

对每一帧新到的 Pika 位姿（不是每次 10 ms 重发），满足任一条件就重新锚定：

1. 与上一帧**有效**位姿（被忽略的坏帧不算）相比，位置变化超过 `jump_position_m`，或姿态变化超过 `jump_orientation_rad`；
2. 与上一帧有效位姿的到达时间相隔超过 `rebase_gap_ms`。

第 2 条针对 mapper 手势停止后再启动：该过程一定有静默，位移小的判据会漏检；而实测 Wi-Fi 最大空档约 414 ms，低于默认的 1000 ms，不会误触发。

重新锚定时 `A` 取 router **上一条已发布的目标**，`(p0, q0)` 取新到的位姿。指令流保持连续，不需要等臂静止，也不需要再读一次状态。代价是跳变期间的手部位移被丢弃，类似离合器；误触发的后果仅是丢一段位移。

### Leash

router 以 `pose_poll_hz` 轮询实测 TCP 位姿（沿用 mixed 的 `_poll_measured_pose`）。每次算出的目标，位置被夹持在实测 TCP 的 `max_position_lead_m` 内，姿态被夹持在实测姿态的 `max_orientation_lead_rad` 内（与 `MixedTarget.step` 的姿态夹持同样用 `rotate_towards`）。

与 mixed 不同，位置目标是手位姿的无状态函数，leash 只是输出夹持，不累积漂移。IK 失败时目标停在臂旁，恢复可达后不会猛追。实测超过 `_MEASUREMENT_MAX_AGE_SEC`（1 s）没有刷新时，目标保持上一条已发布值。

### 不变的部分

输入丢失 3 s（launch 里的 `watchdog_ms: 3000`）才释放 session，释放时清空锚点。pose goal（`_pose_goal`：`follow=False`、20 ms、driver 看门狗）与 driver 的 30°/s 关节限速不变。到达时立刻转发加 10 ms 重发的发布方式保留。

## 组件与配置

### `PositionTarget`（`pika_control_router.py`，纯 Python）

- `accept(position, orientation, now)`：每帧到达调用一次；首帧配对；检测跳变与静默并重锚；存最新手位姿。
- `target(measured_position, measured_orientation, measured_fresh)`：由最新手位姿计算目标并套 leash，返回要发布的位姿，并记录为"上一条已发布目标"。每次发布（到达立刻转发、10 ms 重发）都调用它。

时间由调用方传入，便于测试。

### router 接线

- `_ArmState` 增加 `position` 字段，锚点读取与实测轮询复用现有字段。
- `_on_anchor` 按当前模式分发：`pikamixed` 建 `MixedTarget`（不变），`pikaposition` 建 `PositionTarget`。
- `_reconcile_position` 按 `_reconcile_mixed` 的结构重写：锚定，开 session，session 内取目标并发布。
- `_goal_response` 增加 `position` 分支：被拒绝则清锚点，接受后发布 `A`。
- `_pose()` 对 position 校验：位置各分量有限，四元数可归一化，否则忽略并节流告警，且不刷新输入时间戳。
- `_reset_mixed` 同时清空 `position`，机械地改名为 `_reset_target`；这是对 mixed 代码唯一的改动，mixed 行为不变。

### 配置

`config/ros/pika_config.yaml` 新增：

```yaml
pika_position:
  rebase_gap_ms: 1000
  jump_position_m: 0.10
  jump_orientation_rad: 0.5
  max_position_lead_m: 0.05
  max_orientation_lead_rad: 0.15
  pose_poll_hz: 10.0
```

`control_router.launch.py` 新增 `_load_pika_position_config`（仿 `_load_pika_mixed_config`：缺段报错，数值须有限且为正，`rebase_gap_ms` 须为正整数），以 `pika_position_*` 传给 router。router 启动时校验 `rebase_gap_ms < watchdog_ms`，否则该规则永不触发。

`jump_position_m`、`jump_orientation_rad` 是没有数据支撑的初值，见"上线与验证"。

## 异常与边界

- 锚点读失败：0.5 s 退避；属于上一次激活的迟到锚点响应被 `anchor_future` 防护丢弃。
- session 结束（driver 中止、看门狗、被拒绝、模式切换）：清空 `position`，下次重新读臂位姿锚定，不回到旧目标。
- 非法 Pika 消息：忽略，不刷新输入时间戳。
- 手位姿变旧：重发同一目标，臂停在原处，无需额外处理。
- 重锚发生在 leash 夹持期间：`A` 是已被夹持的已发布目标，重锚后仍在 leash 范围内。

## 测试

- 现有编码"绝对直通"的位置测试要改：持有目标穿过空档、丢失释放、接受时发布缓存目标（现应发布锚点）。
- 新增 `PositionTarget` 纯逻辑测试，与 mixed 的测试对应：首个目标等于锚点；位置增量；手整体偏移不会转动腕部；跳变与长静默各自触发重锚且发布目标连续；低于阈值不重锚；位置与姿态 leash；无实测时保持；惰性配对。
- router 层测试：开 session 前先锚定；读失败退避；迟到锚点被忽略；被拒绝后清锚点；session 结束后重新锚定；坏帧被忽略且不刷新输入时间戳；position 模式轮询实测位姿。
- 配置测试（`test_pika_config.py`）：`pika_position` 段已声明；加载器传出每个参数并拒绝非法值；launch 传参；router 拒绝 `rebase_gap_ms ≥ watchdog_ms`。
- 测试命令按仓库现有方式（容器内）执行，计划阶段核实。

## 文档与连带影响

- `website/docs/development/pika-teleop.md` 的模式表（`pikaposition` 一行）与对比表把位置模式写成"绝对位姿、末端绝对位置跟随"，改为"相对启用时臂位姿的增量跟随"，并补一节讲锚点、重锚与 leash；`troubleshooting.md`、`getting-started.md` 中提到位置模式处同步核对。
- `scripts/simulate_pika_pose.py` 向 `/pika/<arm>/cartesian_pose` 发的是固定的绝对位姿（`x = 0.2 + delta`）。新语义下首帧成为 `p0`，偏移被当作零，臂不会动，会误导排障。改为先发一段基线再阶跃偏移。
- 本 spec 取代 2026-09-18 spec 中位置模式"绝对目标"的 router 侧语义；该 spec 不改。

## 上线与验证

- 先在 mock 后端和 `dry_run` 下验证。真机验证需要明确批准、低速、操作者在急停旁。
- 真机零指令台架：左臂、左 Pika 已启用但不动，进入 `pikaposition` 后记录前 2 秒关节角，期望相对锚点的变化接近 0。记忆中的 `pika-velocity-start-pull` 发现速度 session 启动时控制器会朝陈旧透传目标拉动臂；位置 session 走 `rm_movej_canfd`，首条命令是绝对关节目标，预期会覆盖陈旧目标，但**尚未测量**，以此台架确认。
- 在真机上记录相邻帧位姿差的分布后，再确定 `jump_position_m` 与 `jump_orientation_rad`。
- 部署时容器内的 `src/` 落后于仓库，只能按 hunk 打补丁，不能整文件覆盖；部署后需重启 router。

## 风险

1. `get_current_pose`（关节读取加 FK）现在在 position 模式下也有 10 Hz 轮询，与 mixed 一样会与 CANFD 流竞争适配器的 `_sdk_lock`；读状态变慢会影响透传。本次不解决。
2. Pika 流 20 Hz 且丢包，leash 的实测最多滞后约 100 ms，跟随速度上限大致为 `max_position_lead_m / 滞后`，约 0.5 m/s 量级；这是估算，需看真机日志。
3. 跳变阈值 0.10 m、0.5 rad 是初值，可能误触发（丢一段位移）或漏检（由 leash 与关节限速兜底）。
4. 手与臂的绝对对应关系在每次启用时都会改变，Pika 侧 YAML 默认 TCP 不再决定臂的绝对落点；操作者需要知道这一点。
