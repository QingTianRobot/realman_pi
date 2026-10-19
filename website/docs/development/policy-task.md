---
title: Policy 任务（行为树监督）
description: 行为树中的 policy 任务：回位、激活、监督、判定、重试与停止，以及按 prompt 区分的任务、阈值和轨迹记录。
---

# Policy 任务（行为树监督）

策略已能在真机上完成抓取放置，但"回位、激活、监控、判定、重试、停止"过去全靠行为树之外的临时脚本完成。现在这些步骤都由行为树的 policy 分支负责：选择 `policy` 模式后，行为树会把三臂送到训练起点、激活桥接、监督每一次尝试，并按失败类型决定重试还是停止。控制权只归执行器一方所有：用户在 Web 中切换模式时，整个任务会经 `onHalted()` 干净地收尾。

设计依据与评审记录见 [`2026-10-14-policy-task-in-bt-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-14-policy-task-in-bt-design.md)。路由部分（会话转发、限速、漂移保护）没有变化，见 [VLA 策略桥接节点](./policy-bridge)。

## 树的结构

```xml
<Sequence name="policy_entry">
  <ThreeArmMoveJ name="policy_start_pose" .../>          <!-- 回位成功后才发布 ACTIVE/policy -->
  <ActivateInputMode mode="policy"/>
  <Fallback name="policy_task">
    <Sequence name="policy_cycles_ok">
      <Repeat num_cycles="{policy_cycles}">
        <RetryUnlessFault num_attempts="{policy_attempts}">
          <Sequence name="policy_attempt">
            <GripperReady arm_id="r" dry_run="{dry_run}"/>
            <ThreeArmMoveJ name="policy_rehome" .../>
            <PolicyRun arm_id="r" task="place" dry_run="{dry_run}"/>
          </Sequence>
        </RetryUnlessFault>
      </Repeat>
      <PolicyInputStub/>                                  <!-- 全部周期完成：保持 RUNNING，桥接已停止 -->
    </Sequence>
    <FailInputMode reason="{policy_failure_reason}"/>     <!-- 故障或次数耗尽：进入 FAILED，路由切到 none -->
  </Fallback>
</Sequence>
```

- `Repeat` 统计成功的周期数，`RetryUnlessFault` 统计一个周期内失败的尝试次数。每次重试前都会 `halt()` 整个 `policy_attempt`，因此每次重试都从"张开夹爪、回位"重新开始。
- 如需逐拍查看这棵子树的执行过程（重试、故障、周期计数），可以使用 [行为树节点参考](./behavior-tree-nodes#逐拍查看-policy-任务) 中的模拟。
- 周期数、尝试次数和全部阈值都在 [`config/ros/policy_task.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/policy_task.yaml) 中，XML 里只有 `{policy_cycles}` 这类黑板重映射。

## 任务与 prompt

多任务模型（`m_multitask_b16_2gpu`）通过 prompt 区分任务：同一个模型，收到放置的 prompt 就把物体放进收纳盒，收到抓起的 prompt 就抓起后保持。行为树并不为每个 prompt 单独编写叶节点，而是为 `PolicyRun` 提供一个 `task` 端口，指向 `policy_task.yaml` 中 `tasks` 下的某一项。每一项包含两个字段：

| 字段 | 作用 |
| --- | --- |
| `prompt` | 发送给桥接的任务文本，必须与训练数据视图中的任务文本逐字一致；哪怕相差一个字符，模型的输入也会偏离训练分布 |
| `completion` | 一次尝试的成功判定方式：`release_over_bin`（在收纳盒一侧放手，且曾夹住物体）或 `lift_and_hold`（抬起后仍夹住物体） |

目前有两项：`place`（`pick up the power adapter and put it in the blue bin`，`release_over_bin`）和 `pick`（`pick up the power adapter`，`lift_and_hold`）。生产树的 policy 分支使用 `task="place"`。纯抓起任务将有自己的树：抓起成功后夹爪仍夹着物体，在下一次尝试的 `GripperReady` 张开夹爪之前，需要先决定把物体放在哪里。

两种完成条件的阈值分别位于 `release` 和 `lift` 两个配置块中，由使用同一完成条件的所有任务共用。`lift_and_hold` 从策略第一次闭合夹爪（夹爪指令低于 `release.closed_below`）时开始判定：

- **成功**（`lifted_held`）：夹爪夹住了物体（位置低于 `verdict.empty_position_min`，且出现过力矩），累计闭合时间不少于 `lift.min_closed_sec`，并且 `lift.joint_index` 指定的关节（J2）相对闭合时刻移动了 `lift.joint_delta_deg`（负值表示角度减小；RM65 抬起时 J2 减小）。上述条件持续 `lift.hold_sec` 即判定成功。
- **掉落**（`dropped`，可重试）：曾夹住物体，但之后位置回到 `verdict.empty_position_min` 以上，而策略仍在指令夹爪闭合。
- **执行了错误的任务**（`wrong_task`，故障）：闭合之后，`lift.wrong_side_joint_index` 指定的关节（J1）低于 `lift.wrong_side_below_deg`，即手臂转向了收纳盒一侧，说明策略没有按 prompt 执行抓起。这类情况重试也无济于事，因此不会重试。

## 节点

| 节点 | 作用 | 失败时 |
| --- | --- | --- |
| `GripperReady` | 读取 `/gripper_<name>/position`；夹爪未张开时调用一次 `/gripper_<name>/open`，并等待位置回到阈值以内 | 服务缺失、没有位置数据、请求被拒绝或超时：判为故障 |
| `PolicyRun` | 预检、激活、监督一次尝试，并按固定顺序停止 | 见下表 |
| `FailInputMode` | 把任务级失败转为输入模式 `FAILED`，原因取自 `policy_failure_reason`；协调器随后切换到 `none` | — |
| `RetryUnlessFault` | 与 `Retry` 相同，但如果失败的叶节点已置位 `policy_fault`，会立即返回失败，不再消耗剩余次数 | — |

叶节点返回 `FAILURE` 并不会把输入模式标记为 `FAILED`，只有 `FailInputMode`（以及切换超时和 tick 异常）会这样做。因此"次数耗尽"必须经过它，否则持久路由会让失败的分支无限重来。

## 一次尝试

`PolicyRun` 依次执行以下步骤：

1. **预检**：确认 `/policy/activate`、`/policy/deactivate`、`/policy/emergency_stop`、`/policy_router/emergency_stop` 四个服务均已发现；三条臂的 `joint_states`、夹爪位置和 `/policy/stats` 都是最新数据；桥接报告自身处于 policy 模式且未暂停。与此同时，`PolicyRun` 把任务的 prompt 发布到 `prompt_topic`（`/policy/prompt`，等待期间每 0.5 s 重发一次），直到 `/policy/stats` 中的 `prompt` 值与之一致才继续。桥接切换 prompt 时会清空动作队列，并立即重新发布统计。任何一项不满足，等待 `service_wait_sec` 后即判为故障，此时不会启动任何动作。
2. **激活**：`activation: auto` 时由 `PolicyRun` 调用 `/policy/activate`；`activation: operator` 时只等待操作员调用，等待期间不会有任何运动。
3. **监督**：每个 tick 评估一次，判定规则见下表。
4. **停止**：无论成败，依次调用 `/policy/deactivate`（`data: true`；`false` 反而会激活桥接）、`/policy/emergency_stop`、`/policy_router/emergency_stop`，每一步都等待回应或超时。最后再等待 `router_release_sec`，让路由释放速度会话，避免与下一步的 `ThreeArmMoveJ` 冲突。被 `halt()` 时，同样的三个调用会立即发出，但不等待回应。

| 情况 | 结果 | 是否重试 |
| --- | --- | --- |
| 在收纳盒一侧放手，且曾夹住物体 | `SUCCESS`，`released_held` | — |
| 在收纳盒一侧放手，但夹爪合到底 | 失败，`released_empty` | 是 |
| `lift_and_hold`：抬起并保持，仍夹着物体 | `SUCCESS`，`lifted_held` | — |
| `lift_and_hold`：夹住后物体掉落 | 失败，`dropped` | 是 |
| 超过 `max_attempt_sec` 仍未完成（放手或抬起保持） | 失败，`timeout` | 是 |
| 夹爪闭合且指令几乎为零，持续 `stall.sec` | 失败，`stall` | 是 |
| 关节超出范围、关节速度过大、另外两臂漂移、`joint_states` 或桥接统计丢失、桥接自行暂停、服务缺失、夹爪无法张开 | 故障，`fault` | 否，经 `FailInputMode` 进入 `FAILED` |
| `lift_and_hold`：闭合后转向收纳盒一侧 | 故障，`wrong_task` | 否，经 `FailInputMode` 进入 `FAILED` |

以下关于放手和抓取的判定适用于 `release_over_bin`，`lift_and_hold` 的判定见上一节。**放手**指策略的夹爪指令在累计闭合足够久之后升到阈值以上，同时手臂位于收纳盒一侧（`release.joint_index` 对应的关节低于 `release.joint_below_deg`）。这一位置条件可以排除策略在垫子上为重新抓取而张开夹爪的情况。**抓取判定**依据放手前最后一段闭合期的夹爪位置：停在中间且出现过 `torque_reached`，说明夹住了物体；合到底且没有力矩，则是抓空。

每次尝试的结果会写入黑板键 `policy_attempt_result`、`policy_grasp_verdict`、`policy_attempt_sec`、`policy_failure_reason`，并作为事件记入运行快照，可在 Web 监视器中查看。

## 轨迹记录

每次尝试（包括预检失败的尝试）都会生成一个 CSV 文件，保存在主机的 `~/realman_pi/logs/policy-attempts/policy_attempt_<UTC 时间>_<臂>.csv`（容器内路径为 `/opt/rm65_ws/logs/policy-attempts/`；同一秒内的两次尝试会加上 `_2` 后缀）。它是分析"这次尝试为何结束"的依据：行为树自身的事件列表只保留最近 200 条，会被 Web 页面每秒一次的轮询冲掉；而这个文件逐行立即写盘，即使进程被终止也不会丢失。

文件开头几行以 `#` 开头，记录本次尝试的配置（`task=<名称> completion=<完成条件> prompt='<文本>'`、激活方式、关节范围、速度上限）；接着是列头，然后每个采样周期一行。数据行只在尝试进入监督阶段后才会出现：

| 列 | 含义 |
| --- | --- |
| `t_sec`、`phase` | 进入监督后经过的秒数；`running` 为监督阶段，`stopping` 为停止阶段 |
| `q1_deg` 到 `q6_deg` | 受监督机械臂的关节角 |
| `drift_<臂>_deg` | 另外两条臂相对于尝试开始时的最大关节变化 |
| `cmd_lin_mps`、`cmd_ang_radps` | 路由发给驱动的速度指令幅值（经限速钳制后） |
| `policy_gripper` | 策略的夹爪指令，0 为闭合，1 为张开 |
| `gripper_position`、`torque_reached` | 夹爪位置（设备单位）和力矩到达标志 |
| `closed_total_sec` | 夹爪指令累计闭合的时间（用于放手判定） |
| `allow_publish`、`paused` | 桥接的统计值 |

没有读数的单元格留空。文件末尾是 `# result=`、`# grasp=`、`# seconds=`、`# reason=` 四行；被 `halt()` 中断的尝试记为 `# result=halted`。可以在 `policy_task.trace` 中关闭记录、修改目录或采样周期；文件写入失败只会缺少这份记录，不影响尝试本身。

```bash
ssh realman_ts 'ls -t ~/realman_pi/logs/policy-attempts | head -3'     # 最近三次
```

## 配置与激活方式

各阈值的来源都写在 `policy_task.yaml` 的注释中；修改阈值时需要同时参考示教数据，改完后需重启 `./rm65 bt`。YAML 中写错的键不会被 ROS 报错（ROS 会忽略未声明的参数），因此 `test_policy_task_config_file` 要求文件中的键与加载器声明的键完全一致。

`activation` 决定选择 policy 模式之后会发生什么：

- `auto`（默认）：回位成功后，行为树自行激活并开始执行。**选择该模式就意味着机械臂会运动**，因此选择前要确认工作区已清空、有人手持急停。
- `operator`：回位后，行为树等待有人调用 `/policy/activate`，每次尝试都需要重新等待。是否运动仍由这一人工操作决定。

## 运行步骤

先在无硬件条件下验证：

```bash
REALMAN_BT_DRY_RUN=true ./scripts/bt.sh control     # 选择 policy：回位只做校验，GripperReady 和 PolicyRun 只做记录
```

在真机上按阶梯推进，每一级通过后再进入下一级，全程有人手持急停。开始前确认 Wi-Fi 链路干净、Pika 定位程序已关闭，并且夹爪处于张开状态。

1. `cycles: 1`、`attempts: 1`：执行一次尝试，验证监督、放手判定和停止顺序。
2. `cycles: 1`、`attempts: 3`：验证重试时会张开夹爪、回位并重新开始。
3. `cycles: 3` 及以上：验证周期和装饰节点的计数；每个周期前后拍照核对结果。

```bash
REALMAN_BT_DRY_RUN=false ./scripts/bt.sh control    # 然后在 Web 中选择 policy，或调用 select_input_mode
```

## 排障

| 现象 | 原因与处理 |
| --- | --- |
| 选择 policy 并回位后，长时间没有动作 | `PolicyRun` 正在预检中等待：查看运行快照事件或桥接日志，缺少的服务、数据或 `mode_active=0` 会写在原因中；如果是 `operator` 模式，则是在等待 `/policy/activate` |
| `FAILED`，原因含 `policy is not ready to start` | 预检超时：原因中会列出缺少的项，可能是四个服务、三条臂的 `joint_states`、夹爪位置或 `/policy/stats` |
| 原因含 `policy bridge prompt is '…', waiting for '…'` | 桥接没有切换到该任务的 prompt：确认桥接订阅了 `prompt_topic`，并且没有其他进程在向 `/policy/prompt` 发布别的文本 |
| 原因含 `does not report its prompt in /policy/stats (too old a bridge)` | 桥接容器仍是旧代码，统计中没有 `prompt`：重建桥接镜像或同步代码后重启。prompt 未确认前不会激活桥接 |
| `wrong_task` | 执行抓起任务时转向了收纳盒，说明策略没有按 prompt 区分任务：先核对 prompt 是否与训练视图逐字一致，再查看模型在离线 prompt 交换测试中的区分度 |
| `FAILED`，原因含 `paused itself` | 桥接连续推理失败后自行暂停，通常是 Wi-Fi 被占满（Pika 定位程序挤占链路时，往返延迟会从 100 ms 升到数秒） |
| 一轮结束后夹爪未张开就开始下一轮 | 不会发生：每次尝试的第一步都是 `GripperReady`，夹爪无法张开会判为故障 |
| 一直是 `released_empty` | 抓空：查看相机画面和 `policy_grasp_verdict`。这是策略精度问题，不是监督问题 |
| 想知道某次尝试为何结束 | 查看对应轨迹 CSV 末尾的四行，以及最后几行数据 |
| 夹着物体不动 | 判为 `stall`，下一次尝试会先张开夹爪；如果反复出现，说明策略在抓取后进入了训练分布之外的状态，见 [VLA 策略桥接节点](./policy-bridge) |

## 验证

```bash
colcon build --symlink-install --packages-select realman_bt
colcon test --packages-select realman_bt
colcon test-result --verbose
```

相关测试包括：`test_policy_supervisor`（判定逻辑，不依赖 ROS）；`test_policy_run_node` 和 `test_gripper_ready_node`（用模拟的桥接、路由、夹爪和三臂关节状态驱动，检查调用顺序）；`test_input_mode_executor`（树的结构、从 `FAILED` 到 `none` 的通路、计数经黑板传入树）；`test_control_router_tree`（XML 契约）。这些 C++ 测试开头都加了 `#undef NDEBUG`，因此 Release 构建也不会移除其中的 `assert`。
