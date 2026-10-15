# Policy 任务监督进入行为树（重试、周期与判定由叶节点负责）

> 状态：设计草案（未实现）。2026-10-14。依据：同日对真机的多次单次运行和自动循环（数据在主机 `~/deploy-backups/policy-*`）、`config/behavior-trees/control.xml`、`input_mode*.cpp`、`realman_bt_executor_node.cpp`、vendored 行为树库的 `bt_nodes/decorator/{retry,repeat}_node.hpp`，以及 `developing-realman-behavior-trees` 技能的节点规范。前置设计：[`2026-10-13-policy-input-router-design.md`](2026-10-13-policy-input-router-design.md)（路由）、PR #39（入场回位）。

## 问题

策略已经能在真机上跑完整的抓取放置动作，但**让它"重复跑、失败重试、判断成败"的全部逻辑在行为树外面**：我为了联调写的 shell 和 Python 脚本，放在主机和容器的 `/tmp` 里（`stage_a/b/c5.sh`、`cycles3.sh`、`policy_run5.py`、`entry_live.py`）。行为树只负责"选了 policy 模式并回位"，之后就是占位叶 `PolicyInputStub`。这违反了仓库的边界："行为树编排，驱动负责 SDK、仲裁、看门狗和物理停止；运动与控制权的所有者是执行器"。

当天暴露的问题都是这个结构带来的：

| 现象 | 根因 |
| --- | --- |
| 10:47 容器被重建后，热部署的路由、测试脚本和监视脚本全部消失 | 不在仓库里，没有版本，没有评审 |
| 10:39 Web 控制台（`requester_id=web:…`）把模式从 policy 切走，我的脚本不知道 | 两个控制者：执行器管输入模式，脚本同时在调 `select_input_mode`、`/policy/activate`、急停 |
| 监视脚本刚启动就调 `/policy/activate`，服务还没发现，无回应 | 竞争条件，在真机上才撞出来 |
| 第 2 轮结束时夹爪没张开，第 3 轮从半闭的夹爪开始，策略直接去收纳盒放手 | 轮与轮之间没有"夹爪必须张开"的前置条件 |
| "闭合 3 秒后张开"被策略的重试式张开误触发，在垫子上提前结束了一轮 | 放手判定太粗，没有位置条件 |
| 夹着东西却不动（第 2 轮），45 秒超时后整个循环中止 | 所有失败都等价于"中止"，没有可重试和不可重试之分 |
| 关节范围、速度、左中臂漂移、兜底 deactivate（一个 shell `sleep`）都在行为树的 halt 之外 | 安全监督不受行为树 halt 和输入模式协调器保护，也没有单元测试 |

## 目标与非目标

目标：

1. 每一次尝试的**判定**（越界、超时、卡死、放手、抓取结果）由行为树叶节点完成。
2. **重试和周期**用行为树的装饰器表达，失败类型决定重试还是锁定。
3. 控制权只有一个主人：执行器。用户在 Web 里切走模式，整个任务经 `onHalted()` 干净收尾。
4. 所有阈值在 `config/ros/`，XML 里没有数值；节点有单元测试和 `dry_run` 语义。
5. 每次尝试的结果进入运行快照和 Web 监视器，不再只有 `/tmp` 日志。

非目标：不在行为树里做视觉判断（"垫子上还有没有东西"）；不改路由（会话转发、限速、漂移保护）；不改桥接的协议。

## 现状盘点

仓库里已有的"重试"，没有一个是任务级的：

| 位置 | 重试什么 | 层级 |
| --- | --- | --- |
| 三个 router | 驱动拒绝速度会话后 0.5 秒退避再开；漂移保护触发后锁定，需 deactivate 再 activate | 会话级，Python |
| 桥接 | 连续 5 次推理失败暂停，需再次 `/policy/activate` | 推理级 |
| `MoveJ` 节点 | 超时后重试**取消**，不是重试运动 | 取消级 |
| 执行器 | 只注册了 `Sequence`、`ReactiveSequence`、`ReactiveFallback`；切模式超时或 tick 抛异常时调 `InputModeCoordinator::fail()`，协调器走安全模式 `none` | 无任务重试 |

vendored 库已经提供 `RetryNode`（`num_attempts`，子节点失败时先 `halt()` 再重跑，`RUNNING` 不消耗次数）、`RepeatNode`（`num_cycles`，只数成功，子节点失败立即向上）、`FallbackNode`、`ForceSuccessNode`、`InverterNode`，只是没有注册。技能文档要求"先实现并注册，再使用"，所以注册它们需要测试。

一个关键细节：**叶节点返回 `FAILURE` 不会把输入模式标成 `FAILED`**。只有切换超时和 tick 抛异常会调用 `InputModeCoordinator::fail()`。持久路由里，一个失败的分支下一拍会从头再来。所以任务级故障必须由节点显式上报，否则"次数耗尽"会变成无限重启。

## 方案选择

| 方案 | 做法 | 结论 |
| --- | --- | --- |
| A. policy 分支内的监督叶加重试装饰器 | 在 `control.xml` 的 policy 分支里放 `GripperReady`、`ThreeArmMoveJ`、`PolicyRun`，外面套 `Repeat` 和重试装饰器 | **采用**。控制权单一，Web 切模式即 halt，沿用节点规范 |
| B. 单独的 `policy_task.xml` 一次性树 | 另起执行器跑任务树 | 否决：它不能选输入模式，会出现两个执行器 |
| C. 继续用外部脚本，但放进仓库 | 脚本版本化 | 否决：仍然是双主人，安全监督仍在 halt 之外 |
| D. 放进 `policy_control_router`（Python） | 路由里加监督逻辑 | 否决：路由只管会话转发，不在行为树的协调器和 halt 之下，也混淆了"转发"和"任务" |

## 树的形状

```xml
<ReactiveSequence name="policy_branch">
  <InputModeGuard mode="policy" label="Policy" selectable="true" selected_mode="{selected_mode}"/>
  <Sequence name="policy_entry">
    <ThreeArmMoveJ name="policy_start_pose" .../>            <!-- 保留（PR #39）：回位成功才 ACTIVE -->
    <ActivateInputMode mode="policy"/>
    <Fallback name="policy_task">
      <Sequence name="policy_cycles_ok">
        <Repeat num_cycles="{policy_cycles}">
          <RetryUnlessFault num_attempts="{policy_attempts}">
            <Sequence name="policy_attempt">
              <GripperReady arm_id="r" .../>
              <ThreeArmMoveJ name="policy_rehome" .../>
              <PolicyRun arm_id="r" .../>
            </Sequence>
          </RetryUnlessFault>
        </Repeat>
        <PolicyInputStub/>                                    <!-- 全部周期完成：保持 RUNNING，已解除武装 -->
      </Sequence>
      <FailInputMode reason="{policy_failure_reason}"/>        <!-- 故障或次数耗尽：FAILED，协调器走 none -->
    </Fallback>
  </Sequence>
</ReactiveSequence>
```

说明：

- 入口的 `policy_start_pose` 保留，因此"回位成功才发布 `ACTIVE/policy`"的契约不变。每次尝试开头的 `policy_rehome` 在第一次通常是空操作（手臂已在起点），之后的尝试靠它回到起点。
- `Retry` 在子节点失败时先 `halt()` 整个 `policy_attempt`，所以每次重试都会经过 `PolicyRun::onHalted()`（停发布、等路由释放会话），再从 `GripperReady` 重新开始：张开夹爪、回位、再跑。
- 外层 `Repeat` 数成功的周期；内层装饰器数一个周期内失败的尝试。
- `Fallback` 的第二个分支 `FailInputMode` 是"次数耗尽或故障"的唯一出口：它调用 `InputModeCoordinator::fail(reason)`，协调器随后走安全模式 `none`。

## 新节点

在 `RealmanBtExecutorNode` 里显式注册（技能文档的规则 3），XML 标签用 PascalCase，不带 `Node` 后缀。

### 注册现成的控制节点和装饰器

`Repeat`、`Retry`、`Fallback`，加上下面新增的 `RetryUnlessFault`。每个都要有注册、端口、行为的单元测试。

### `RetryUnlessFault`（装饰器）

语义同 `RetryNode`，区别是：子节点失败后检查黑板键 `policy_fault`；若已设置，**不重试**，立即返回 `FAILURE`。`policy_failure_reason` 由失败的叶节点写入。端口：`num_attempts`（int，默认 1）。

### `GripperReady`（动作叶）

| 项 | 内容 |
| --- | --- |
| 端口 | `arm_id`、`open_position_max`（默认来自配置）、`timeout_sec`、`dry_run` |
| 输入 | 话题 `/gripper_<name>/position`（`Float64`）；臂到夹爪的映射在配置里（`r` 对应 `gripper_right`） |
| 行为 | 位置已张开则 `SUCCESS`。否则异步调用服务 `/gripper_<name>/open`（`Trigger`），`RUNNING` 直到位置回到阈值内；超时 `FAILURE` 并写 `policy_failure_reason`，同时设 `policy_fault`（夹爪张不开属于故障） |
| 今天暴露的缺陷 | 第 3 轮从半闭夹爪起步 |

### `PolicyRun`（动作叶，监督一次尝试）

**启动前检查**：`/policy/activate`、`/policy/deactivate`、`/policy/emergency_stop`、`/policy_router/emergency_stop` 都已发现（等待上限 `service_wait_sec`），`/r/joint_states`、`/l|m/joint_states` 和夹爪话题都有新鲜数据。缺任何一项：设 `policy_fault`，`FAILURE`。（今天的"激活前服务没发现"竞争由此消除。）

**武装与激活**（见下一节）。

**监督（`RUNNING` 期间每个 tick）**：

| 检查 | 条件 | 结果 |
| --- | --- | --- |
| 关节范围 | 右臂任一关节超出配置的范围 | 故障 |
| 关节速度 | 相邻采样推出的关节速度超过上限 | 故障 |
| 左中臂漂移 | 相对本次尝试开始的角度偏移超过上限 | 故障 |
| 数据丢失 | 右臂 `joint_states` 超过 `joint_state_stale_sec` 没有更新 | 故障 |
| 桥接暂停 | `/policy/stats` 的 `paused` 为 1 | 故障（推理链路坏了，例如 Wi-Fi 被占满） |
| 超时 | 超过 `max_attempt_sec` 没有放手 | 可重试失败 |
| 卡死 | 夹爪闭合期间指令幅度低于阈值持续 `stall_sec` | 可重试失败 |
| 放手 | 见"判定规则" | `SUCCESS` 或可重试失败（取决于抓取判定） |

**结束与 halt**：不论成败，先 `/policy/deactivate`，再 `/policy/emergency_stop` 和 `/policy_router/emergency_stop`，再等待 `router_release_sec`（路由的 `input_timeout_ms` 是 500 毫秒，留出余量）让会话释放，之后才返回，这样下一步的 `ThreeArmMoveJ` 不会和速度会话争抢。`onHalted()` 做同样的事。安全停止的顺序与技能文档"停发布、发中性命令、移交取消所有权"一致。

**输出到黑板**：`policy_attempt_result`（`released_held`、`released_empty`、`timeout`、`stall`、`fault`）、`policy_grasp_verdict`、`policy_attempt_sec`、`policy_failure_reason`。同时通过 `recordEvent` 写进运行快照，Web 监视器可见。

**`dry_run=true`**：只校验端口和配置，记录"将会监督什么"，不创建服务客户端，不调任何服务，立即 `SUCCESS`。

### `FailInputMode`（动作叶）

读 `reason` 端口，调用 `InputModeCoordinator::fail(reason)`，之后保持 `RUNNING`，直到模式切换把分支 halt。这是任务级故障到 `FAILED` 的显式通路。

## 判定规则

**放手信号**：策略的夹爪指令（`/pi05_policy/<arm>/gripper_percentage`）在已经累计闭合 `min_closed_sec` 秒之后升到 `release_open_above` 以上，**并且**手臂在收纳盒一侧（`release_joint_index` 对应的关节低于 `release_joint_below_deg`）。检测到后再等 `release_settle_sec`，让夹爪真的张开，然后结束本次尝试。位置条件用来排除策略在垫子上的重试式张开（今天第 2 轮的误触发）。

**抓取判定**：放手前最后 `verdict_window_sec` 秒闭合期的夹爪位置取中位数。大于等于 `empty_position_min`（接近全闭 8500）为"抓空"；小于它且 `torque_reached` 出现为"夹住了东西"。今天的数据：夹住时停在约 5700 到 5800，力矩持续到达；抓空时合到 8380 到 8480，力矩没有到达。

**结果分类**：

| 结果 | 处理 |
| --- | --- |
| 收纳盒一侧放手，判定"夹住" | `SUCCESS`，写 `released_held` |
| 收纳盒一侧放手，判定"抓空" | 可重试 `FAILURE`，写 `released_empty` |
| 超时没有放手（今天第 2 轮：夹着东西却不动） | 可重试 `FAILURE`，写 `timeout`；下一次尝试的 `GripperReady` 会先张开 |
| 卡死 | 可重试 `FAILURE`，写 `stall` |
| 关节越界、关节速度、左中臂漂移、数据丢失、桥接暂停、服务缺失、夹爪张不开 | **故障**：设 `policy_fault`，不重试，经 `FailInputMode` 进入 `FAILED`，协调器走 `none`，需要操作员处理 |

## 武装语义

今天"选择 policy 模式"是安全的：它只回位，真正开始运动是另一个人为动作 `/policy/activate`。2026-10-13 的路由设计确定"运动的唯一开关是 `/policy/activate`，没有第二道开关"。本设计**不新增开关**，也不移走这道人为确认：

| 状态 | 行为 |
| --- | --- |
| 未武装 | `PolicyRun` 等待桥接 `/policy/stats` 的 `allow_publish` 变为 1，也就是**操作员调用了 `/policy/activate`**。等待期间 `RUNNING`，没有任何运动。默认无限等待，等待本身可见于快照 |
| 武装 | 一旦看到操作员激活，黑板置 `policy_armed=true`，本次尝试立即开始监督 |
| 同一次武装内的后续尝试 | `PolicyRun` 自己重新调用 `/policy/activate`（上一次尝试结束时 deactivate 过） |
| 解除武装 | 任何故障、用户切走模式（halt）、全部周期完成，`policy_armed` 清除；下一次进入 policy 模式必须由操作员重新激活 |

这样选择 policy 模式仍然不会自己开始运动；而一次人为激活可以带动整个周期序列。

## 配置

新增 `config/ros/policy_task.yaml`，由 `control_router.launch.py` 读取，作为执行器参数传入并写入黑板，方式同 Pika 入场位姿（`pika_config.yaml` → 参数 `pika_*_joint_degrees` → 黑板）。XML 通过黑板重映射引用（`{policy_cycles}` 等），不含数值。

```yaml
policy_task:
  cycles: 1                     # Repeat：需要成功完成的周期数
  attempts: 3                   # 每个周期内允许的失败尝试数（含首次）
  arm: r
  gripper_for_arm: {l: gripper_left, m: gripper_mid, r: gripper_right}
  # 关节范围（度）：示教数据 130 条所有帧的 1% 与 99% 分位，各放宽 10 度；J5 下限取 20（示教最低 5.6，离腕部奇异点太近不放行）。2026-10-14 由训练集统计得到。
  joint_envelope_deg:
    lo: [-73.4, 5.0, -16.2, -28.4, 20.0, -125.1]
    hi: [40.1, 107.0, 124.3, 70.8, 108.2, 49.0]
  max_joint_speed_dps: 50
  lm_drift_limit_deg: 1.0
  joint_state_stale_sec: 1.0
  service_wait_sec: 10
  max_attempt_sec: 45
  stall: {cmd_lin_mps_below: 0.01, cmd_ang_radps_below: 0.04, sec: 8}
  release:
    open_above: 0.8
    min_closed_sec: 3.0
    joint_index: 0              # J1
    joint_below_deg: -35.0      # 收纳盒一侧
    settle_sec: 1.0
  verdict: {window_sec: 3.0, empty_position_min: 7800}
  gripper_ready: {open_position_max: 500, timeout_sec: 20}
  router_release_sec: 1.5
```

阈值来源都写在注释里；改阈值要同时看示教数据，不要凭感觉。

## 与现有安全层的关系

`PolicyRun` 是**额外**的一层监督，不替换其他层：

1. 路由：限速（0.10 m/s、0.25 rad/s）、过期命令丢弃（100 毫秒）、会话开始的漂移保护。
2. 驱动：100 毫秒速度看门狗。
3. 桥接：连续推理失败暂停。
4. 行为树：本设计的监督，加上输入模式协调器的 `FAILED` 到 `none`。
5. 物理急停：最终兜底，不依赖软件。

监督的检查频率是执行器的 tick（默认 `tick_rate_hz` 20 Hz，路由的 launch 可以覆盖）。`joint_states` 本身是 10 Hz，所以检查频率不会比数据更慢。服务调用必须是异步的（沿用 `MoveJ` 的模式），不能阻塞 tick。

## 可观测性

- 每次尝试开始和结束写一条运行快照事件，带 `policy_attempt_result`、`policy_grasp_verdict`、`policy_attempt_sec`、当前周期和尝试序号。
- 黑板键 `policy_cycle`、`policy_attempt` 由装饰器外的计数叶或 `PolicyRun` 维护，Web 监视器直接显示。
- 取消 `/tmp` 日志作为唯一记录。

## 测试与验证阶梯

按技能文档的验证顺序。每个节点按"端口、注册、XML、失败、`dry_run`、生命周期"补测试，参考 `test_three_arm_move_j_node.cpp`。

**单元测试**：

- `RetryUnlessFault`：成功不重试；可重试失败按次数重试并在每次重试前 `halt()` 子节点；`policy_fault` 设置后不重试；次数耗尽返回 `FAILURE`；`halt()` 复位计数。
- `Repeat`、`Retry`、`Fallback` 的注册和端口。
- `GripperReady`：已张开立即成功；未张开调用服务并等待；服务缺失、超时、`dry_run`；`halt` 期间有待处理调用。
- `PolicyRun`：服务缺失不启动；未武装时等待且不调任何服务；武装后监督；越界、速度、左中臂漂移、数据丢失、桥接暂停各自触发故障；超时和卡死是可重试失败；放手位置条件（在垫子上张开不触发，在收纳盒一侧触发）；抓取判定的两个分支；结束时的停止顺序；`halt` 的清理；`dry_run`。
- `FailInputMode`：调用 `fail()`，协调器随后走 `none`。
- XML 合同（`test_control_router_tree.py`）：policy 分支的新结构、新标签的端口名和黑板重映射。
- 启动元数据测试：新参数注入。

**无硬件**：`RM65_DRY_RUN=1 ./rm65 bt control` 看包装计划；`REALMAN_BT_DRY_RUN=true` 用真实执行器跑，确认不发任何服务调用和目标。

**真机阶梯**（每一级通过才进下一级，全程有人持急停，开跑前链路检查：Wi-Fi 干净、Pika 定位程序关闭）：

1. `cycles=1`、`attempts=1`：一次尝试，验证监督、放手判定、停止顺序。
2. `cycles=1`、`attempts=3`：验证重试会张开夹爪、回位、重新开始。
3. `cycles=3` 以上：验证周期和装饰器计数；每个周期前后拍照核对结果。

## 迁移与清理

- 外部脚本不再使用；它们的行为已经写进上面的规则。它们从未在仓库里，所以没有删除动作，只在 memory 里记录教训。
- PR #39 的合同测试（入场位姿表）需要更新：policy 分支的内部结构变了，入场回位保持。
- 文档：`behavior-tree-control.md`、`behavior-tree-motion.md`、`policy-bridge.md`、`troubleshooting.md`、`ModeExplorer.vue`、BT 技能参考，以及路由设计里"没有第二道开关"一节的交叉引用。

## 风险与未决

1. **"垫子上还有没有东西"无法在行为树里判断**（没有视觉）。周期数和尝试数有上限，不会无限重试；如果需要"跑到垫子空为止"，应作为单独设计引入视觉叶，不在本设计内。
2. **链路健康**：今天最大的非软件问题是 Pika 定位程序把 Wi-Fi 占满，推理往返从 100 毫秒涨到 4 秒。本设计把"桥接暂停"当作故障，但推理变慢到暂停之前不会被发现。建议第二阶段给桥接增加 `last_infer_ms` 指标，`PolicyRun` 用它做每次尝试前的链路门控，取代我现在用的外部 Wi-Fi 和 TCP 测试。
3. **`FAILED` 通路**：节点调用 `InputModeCoordinator::fail()` 之后，协调器走 `none` 的行为需要在第一个测试里确认（文档说明如此，但持久路由里"运行中分支故障"的路径还没有单元测试覆盖）。
4. **`Retry` 的 halt**：重试前会 `halt()` 整个尝试子树，所以 `PolicyRun::onHalted()` 必须幂等，且在 `ThreeArmMoveJ` 的取消排空之后才允许下一步。
5. **夹爪报警 `alarm=32`** 是一个不影响动作的残留位（复位和重新使能都清不掉）。本设计不检查它；如果以后需要，应作为配置项。

## 已定的默认值与待确认项

按 2026-10-14 评审的建议采用，需要你否决或调整的在这里：

| 决定 | 默认 |
| --- | --- |
| 超时且夹着东西 | 可重试失败，下一次尝试先张开 |
| 武装语义 | 第一次由操作员 `/policy/activate`，同一次武装内自动续跑 |
| 周期数和尝试数 | `cycles=1`、`attempts=3` |
| "跑到垫子空为止" | 不在行为树里做 |

## 实施顺序

1. 注册 `Repeat`、`Retry`、`Fallback`，实现 `RetryUnlessFault` 和测试。
2. `FailInputMode`，确认 `FAILED` 通路。
3. `GripperReady`。
4. `PolicyRun`：先做 `dry_run` 和启动前检查，再做监督，再做放手、判定和停止顺序。
5. `control.xml`、`policy_task.yaml`、launch 注入、合同测试。
6. 文档。
7. 主机上 `REALMAN_BT_DRY_RUN=true` 验证，然后真机阶梯。
