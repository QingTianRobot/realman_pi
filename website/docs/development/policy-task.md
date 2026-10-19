# Policy 任务（行为树监督）

策略已经能在真机上完成抓取放置，但"回位、激活、监控、判定、重试、停止"曾经全靠行为树外面的临时脚本。现在这些都在行为树的 policy 分支里完成：选择 `policy` 模式，行为树自己把三臂送到训练起点，激活桥接，监督每一次尝试，按失败类型重试或停下。控制权只有一个主人，就是执行器：用户在 Web 里切走模式，整个任务经 `onHalted()` 干净收尾。

设计依据与评审记录：[`2026-10-14-policy-task-in-bt-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-14-policy-task-in-bt-design.md)。路由（会话转发、限速、漂移保护）不变，见 [VLA 策略桥接节点](./policy-bridge)。

## 树的形状

```xml
<Sequence name="policy_entry">
  <ThreeArmMoveJ name="policy_start_pose" .../>          <!-- 回位成功才发布 ACTIVE/policy -->
  <ActivateInputMode mode="policy"/>
  <Fallback name="policy_task">
    <Sequence name="policy_cycles_ok">
      <Repeat num_cycles="{policy_cycles}">
        <RetryUnlessFault num_attempts="{policy_attempts}">
          <Sequence name="policy_attempt">
            <GripperReady arm_id="r" dry_run="{dry_run}"/>
            <ThreeArmMoveJ name="policy_rehome" .../>
            <PolicyRun arm_id="r" dry_run="{dry_run}"/>
          </Sequence>
        </RetryUnlessFault>
      </Repeat>
      <PolicyInputStub/>                                  <!-- 全部周期完成：保持 RUNNING，桥接已停 -->
    </Sequence>
    <FailInputMode reason="{policy_failure_reason}"/>     <!-- 故障或次数耗尽：FAILED，路由走 none -->
  </Fallback>
</Sequence>
```

- `Repeat` 数成功的周期，`RetryUnlessFault` 数一个周期内失败的尝试。重试前会 `halt()` 整个 `policy_attempt`，所以每次重试都从"张开夹爪、回位"重新开始。
- 周期数、尝试数和所有阈值都在 [`config/ros/policy_task.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/policy_task.yaml)，XML 里只有 `{policy_cycles}` 这样的黑板重映射。

## 节点

| 节点 | 做什么 | 失败时 |
| --- | --- | --- |
| `GripperReady` | 读 `/gripper_<name>/position`；未张开就调一次 `/gripper_<name>/open`，等到位置回到阈值内 | 服务缺失、没有位置数据、被拒绝或超时：故障 |
| `PolicyRun` | 预检、激活、监督一次尝试、按固定顺序停止 | 见下表 |
| `FailInputMode` | 把任务级失败变成输入模式 `FAILED`，原因是 `policy_failure_reason`；协调器随后走 `none` | — |
| `RetryUnlessFault` | 同 `Retry`，但失败的叶节点已置 `policy_fault` 时立即失败，不再消耗次数 | — |

一个叶节点返回 `FAILURE` 本身不会把输入模式标成 `FAILED`；只有 `FailInputMode`（以及切换超时和 tick 异常）会。所以"次数耗尽"一定要经过它，否则持久路由会把失败的分支无限重来。

## 一次尝试

`PolicyRun` 依次做：

1. **预检**：`/policy/activate`、`/policy/deactivate`、`/policy/emergency_stop`、`/policy_router/emergency_stop` 四个服务都已发现；三条臂的 `joint_states`、夹爪位置和 `/policy/stats` 都是新的；桥接报告自己在 policy 模式且没有暂停。缺任何一项，等到 `service_wait_sec` 后判为故障，什么都不会启动。
2. **激活**：`activation: auto` 时由 `PolicyRun` 调 `/policy/activate`；`activation: operator` 时只等待操作员调用（等待期间没有任何运动）。
3. **监督**：每个 tick 评估，下表是判定。
4. **停止**：不论成败，先 `/policy/deactivate`（`data: true`，`false` 会反过来激活），再 `/policy/emergency_stop`，再 `/policy_router/emergency_stop`，每一步等回应或超时，最后等 `router_release_sec` 让路由释放速度会话，下一步的 `ThreeArmMoveJ` 才不会和它争抢。`halt()` 时同样的三个调用会立即发出，不等回应。

| 情况 | 结果 | 重试 |
| --- | --- | --- |
| 在收纳盒一侧放手，夹住过东西 | `SUCCESS`，`released_held` | — |
| 在收纳盒一侧放手，夹爪合到底 | 失败，`released_empty` | 是 |
| 超过 `max_attempt_sec` 没有放手 | 失败，`timeout` | 是 |
| 夹爪闭合且指令几乎为零，持续 `stall.sec` | 失败，`stall` | 是 |
| 关节超出范围、关节速度过大、另外两臂漂移、`joint_states` 或桥接统计丢失、桥接自己暂停、服务缺失、夹爪张不开 | 故障，`fault` | 否，经 `FailInputMode` 进入 `FAILED` |

**放手**指策略的夹爪指令在累计闭合足够久之后升到阈值以上，并且手臂在收纳盒一侧（`release.joint_index` 对应的关节低于 `release.joint_below_deg`）。位置条件把策略在垫子上的重试式张开排除在外。**抓取判定**看放手前最后一段闭合期的夹爪位置：停在中间并出现过 `torque_reached` 是夹住了东西，合到底且没有力矩是抓空。

每次尝试的结果写入黑板键 `policy_attempt_result`、`policy_grasp_verdict`、`policy_attempt_sec`、`policy_failure_reason`，并作为事件进入运行快照，Web 监视器可见。

## 轨迹记录

每次尝试（包括预检失败的）都会写一个 CSV，到主机的 `~/realman_pi/logs/policy-attempts/policy_attempt_<UTC 时间>_<臂>.csv`（容器里是 `/opt/rm65_ws/logs/policy-attempts/`，同一秒内的两次尝试会加 `_2` 后缀）。它是"这次为什么结束"的依据：行为树自己的事件列表只留最近 200 条，Web 页面每秒的轮询会把它冲掉，而这个文件每一行都立即落盘，进程被杀也不会丢。

开头几行 `#` 是尝试的配置（激活方式、关节范围、速度上限），然后是列头，之后每个采样周期一行，只在尝试被武装之后才有：

| 列 | 含义 |
| --- | --- |
| `t_sec`、`phase` | 武装后的秒数；`running` 是监督期，`stopping` 是停止顺序期 |
| `q1_deg` 到 `q6_deg` | 受监督那条臂的关节角 |
| `drift_<臂>_deg` | 另外两条臂相对尝试开始时的最大关节变化 |
| `cmd_lin_mps`、`cmd_ang_radps` | 路由发给驱动的速度指令幅度（被限速钳住之后的） |
| `policy_gripper` | 策略的夹爪指令，0 闭合、1 张开 |
| `gripper_position`、`torque_reached` | 夹爪位置（设备单位）和力矩到达标志 |
| `closed_total_sec` | 夹爪指令累计闭合的时间（放手判定用） |
| `allow_publish`、`paused` | 桥接的统计 |

没有读数的单元格留空。结尾是 `# result=`、`# grasp=`、`# seconds=`、`# reason=`；被 `halt()` 打断的写 `# result=halted`。`policy_task.trace` 里可以关掉、改目录或改采样周期；写不了文件只会少一份记录，不会影响尝试。

```bash
ssh realman_ts 'ls -t ~/realman_pi/logs/policy-attempts | head -3'     # 最近三次
```

## 配置与激活方式

阈值的来源都写在 `policy_task.yaml` 的注释里；改阈值要同时看示教数据。改完需要重启 `./rm65 bt`。YAML 里写错的键不会被 ROS 报错（它会忽略没人声明的参数），所以 `test_policy_task_config_file` 要求文件里的键与加载器声明的完全一致。

`activation` 决定"选择 policy 模式"之后会发生什么：

- `auto`（默认）：回位成功后行为树自己激活并开始跑。**选择这个模式就意味着手臂会动**，所以选之前要确认工作区已清空、手在急停上。
- `operator`：回位后行为树等待有人调用 `/policy/activate`，每次尝试都要重新等。运动的开关仍是那个人为动作。

## 怎么跑

先无硬件：

```bash
REALMAN_BT_DRY_RUN=true ./scripts/bt.sh control     # 选 policy：回位只校验，GripperReady 和 PolicyRun 只记录
```

真机按阶梯推进，每一级通过才进下一级，全程有人持急停；开跑前确认 Wi-Fi 干净、Pika 定位程序已关闭，并且夹爪处于张开状态。

1. `cycles: 1`、`attempts: 1`：一次尝试，验证监督、放手判定和停止顺序。
2. `cycles: 1`、`attempts: 3`：验证重试会张开夹爪、回位、重新开始。
3. `cycles: 3` 以上：验证周期和装饰器计数；每个周期前后拍照核对结果。

```bash
REALMAN_BT_DRY_RUN=false ./scripts/bt.sh control    # 然后在 Web 里选 policy，或调用 select_input_mode
```

## 排障

| 现象 | 原因 |
| --- | --- |
| 选了 policy，回位后很久没有动静 | `PolicyRun` 在预检里等：看运行快照事件或桥接日志，缺的服务、数据或 `mode_active=0` 会写在原因里；`operator` 模式则是在等 `/policy/activate` |
| `FAILED`，原因含 `policy is not ready to start` | 预检超时：四个服务、三条臂的 `joint_states`、夹爪位置、`/policy/stats` 里缺哪个就写哪个 |
| `FAILED`，原因含 `paused itself` | 桥接连续推理失败自己暂停了，通常是 Wi-Fi 被占满（Pika 定位程序在淹没链路时往返会从 100 ms 涨到几秒） |
| 一轮结束后夹爪没张开就又开始 | 不会：每次尝试第一步是 `GripperReady`，张不开是故障 |
| 一直是 `released_empty` | 抓空。看相机和 `policy_grasp_verdict`，这是策略精度问题，不是监督问题 |
| 想知道一次尝试为什么这样结束 | 看对应的轨迹 CSV 的结尾四行和最后的几行数据 |
| 夹着东西不动 | `stall`，下一次尝试会先张开夹爪；反复出现说明策略在抓后分布外，见 [VLA 策略桥接节点](./policy-bridge) |

## 验证

```bash
colcon build --symlink-install --packages-select realman_bt
colcon test --packages-select realman_bt
colcon test-result --verbose
```

`test_policy_supervisor`（判定逻辑，无 ROS）、`test_policy_run_node` 和 `test_gripper_ready_node`（用假的桥接、路由、夹爪和三臂关节状态驱动，检查调用顺序）、`test_input_mode_executor`（树形状、`FAILED` 到 `none` 的通路、计数通过黑板进入树）、`test_control_router_tree`（XML 合同）。这些 C++ 测试开头都有 `#undef NDEBUG`，Release 构建里 `assert` 也不会被删掉。
