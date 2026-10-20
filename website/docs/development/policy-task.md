---
title: Policy 任务（行为树监督）
description: 行为树中的 policy 任务：回位、激活、监督、判定、重试与停止，策略服务超时重试，以及按 prompt 区分的任务、阈值和轨迹记录。
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
        <RetryUnlessFault num_attempts="{policy_attempts}"
                          timeout_attempts="{policy_timeout_attempts}"
                          timeout_backoff_sec="{policy_timeout_backoff_sec}">
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
- 策略服务超时（`policy_timeout`）另算一份次数 `{policy_timeout_attempts}`，不占用 `{policy_attempts}`，重试前先等待 `{policy_timeout_backoff_sec}`，详见 [策略服务超时重试](#策略服务超时重试)。
- 如需逐拍查看这棵子树的执行过程（重试、故障、周期计数），可以使用 [行为树节点参考](./behavior-tree-nodes#逐拍查看-policy-任务) 中的模拟。
- 周期数、尝试次数和全部阈值都在 [`config/ros/policy_task.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/policy_task.yaml) 中，XML 里只有 `{policy_cycles}` 这类黑板重映射。

## 任务与 prompt

多任务模型（`m_multitask_b16_2gpu`）通过 prompt 区分任务：同一个模型，收到放置的 prompt 就把物体放进收纳盒，收到抓起的 prompt 就抓起后保持。行为树并不为每个 prompt 单独编写叶节点，而是为 `PolicyRun` 提供一个 `task` 端口，指向 `policy_task.yaml` 中 `tasks` 下的某一项。每一项包含两个字段：

| 字段 | 作用 |
| --- | --- |
| `prompt` | 发送给桥接的任务文本，必须与训练数据视图中的任务文本逐字一致；哪怕相差一个字符，模型的输入也会偏离训练分布 |
| `completion` | 一次尝试的成功判定方式：`release_over_bin`（在收纳盒一侧放手，且曾夹住物体）或 `lift_and_hold`（抬起后仍夹住物体） |

目前有两项：`place`（`pick up the power adapter and put it in the blue bin`，`release_over_bin`）和 `pick`（`pick up the power adapter`，`lift_and_hold`）。生产树 `control.xml` 的 policy 分支使用 `task="place"`。纯抓起任务用的是 `control_pick.xml`（见下文[抓取清台树](#抓取清台树-control-pick-xml)）：抓起成功后由树把物体送到放置位置再松开，然后用全局相机判断桌上还有没有物体。

两种完成条件的阈值分别位于 `release` 和 `lift` 两个配置块中，由使用同一完成条件的所有任务共用。`lift_and_hold` 从策略第一次闭合夹爪（夹爪指令低于 `release.closed_below`）时开始判定：

- **成功**（`lifted_held`）：夹爪夹住了物体（位置低于 `verdict.empty_position_min`，且出现过力矩），累计闭合时间不少于 `lift.min_closed_sec`，并且 `lift.joint_index` 指定的关节（J2）相对闭合时刻移动了 `lift.joint_delta_deg`（负值表示角度减小；RM65 抬起时 J2 减小）。上述条件持续 `lift.hold_sec` 即判定成功。
- **掉落**（`dropped`，可重试）：曾夹住物体，但之后位置回到 `verdict.empty_position_min` 以上，而策略仍在指令夹爪闭合。
- **执行了错误的任务**（`wrong_task`，故障）：闭合之后，`lift.wrong_side_joint_index` 指定的关节（J1）低于 `lift.wrong_side_below_deg`，即手臂转向了收纳盒一侧，**且夹爪里有东西**（位置低于 `verdict.empty_position_min`），或者读不到夹爪位置。这说明策略在 pick 的 prompt 下仍把物体往收纳盒搬，没有按 prompt 执行抓起，重试也无济于事，因此不会重试。
- **抓空后转向收纳盒**（`wrong_side_empty`，可重试）：同样越过 J1 的限制，但夹爪已合到底（位置不低于 `verdict.empty_position_min`），什么也没夹住。2026-10-20 真机上出现过：策略抓空后抬起并转向收纳盒。此时没有物体被带走，下一次尝试会张开夹爪、回位后重新开始。

## 抓取清台树（control_pick.xml）

`config/behavior-trees/control_pick.xml` 是 `control.xml` 的副本，除 policy 分支外，其余分支逐字相同（有测试检查）。它的 policy 分支用纯抓起策略把桌上的电源适配器一个个拿走，直到桌面清空：

```xml
<Fallback name="pick_task">
  <Sequence name="pick_task_ok">
    <SetBool key="pick_table_clear" value="false"/>
    <Fallback name="pick_until_clear">
      <Repeat num_cycles="-1">
        <Sequence name="pick_cycle">
          <RetryUnlessFault ...>  <!-- GripperReady → 回位 → PolicyRun task="pick" -->
          <MoveJ name="pick_lift_pose" arm_id="r" joint_degrees="{pick_lift_joint_degrees}" .../>
          <MoveJointTo name="pick_turn_to_release" arm_id="r" joint="{pick_release_joint}"
                       target_degrees="{pick_release_joint_deg}" .../>
          <GripperReady name="pick_release" arm_id="r" .../>
          <WhiteObjectsRemain name="objects_remain" table_clear="{pick_table_clear}" .../>
        </Sequence>
      </Repeat>
      <CheckBool key="pick_table_clear" expected="true"/>
    </Fallback>
    <ThreeArmMoveJ name="pick_done_home" .../>  <!-- 清空后三臂回起始位姿 -->
    <PolicyInputStub/>
  </Sequence>
  <FailInputMode reason="{policy_failure_reason}"/>
</Fallback>
```

每个周期依次执行：

1. **抓起**：与 `control.xml` 相同的尝试结构（张开夹爪、三臂回位、`PolicyRun`），只是 `task="pick"`，以 `lift_and_hold` 判定成功：夹住物体并抬起后保持，夹爪仍然闭合。重试、故障和超时规则与上文相同。
2. **抬升到固定位姿**：右臂 `MoveJ` 到 `pick_cycle.lift_joint_degrees`。目前取右臂起始位姿（`pika_config.yaml`），等测出专门的抬升位姿后在配置里修改即可，不用改 XML。
3. **转到放置侧**：`MoveJointTo` 只把 J1（`pick_cycle.release_joint`）转到 `pick_cycle.release_joint_deg`（-135°），其余关节保持不动。从上往下看是顺时针转动（J1 角度减小约 125°）。2026-10-20 在真机上空载、以 5% 速度从抬升位姿转到 -135° 再转回，现场确认路径上没有障碍。
4. **松开**：`GripperReady` 张开右夹爪，物体落在放置侧。
5. **检测**：`WhiteObjectsRemain` 读一帧全局相机（D435）图像，判断垫子上是否还有白色物体。有物体就返回 `SUCCESS`，`Repeat` 开始下一个周期；没有物体就写入 `pick_table_clear=true` 并返回失败，以此结束 `Repeat`。

`Repeat` 结束后由 `CheckBool` 判断结束原因：如果是桌面已清空，先由 `pick_done_home` 让三臂回到起始位姿，再停在 `PolicyInputStub`（policy 模式空闲，桥接已停止）。回位这一步不能省：进入 policy 模式的第一步回位受输入模式切换超时（`behavior_tree.yaml` 的 `switch_timeout_ms`，5 s）限制，如果右臂停在 -135°，回位约需 8 s，会超时并退回 none（2026-10-20 真机上出现过）。其他原因（尝试次数用完、故障、某个 MoveJ 失败、相机没有图像）都不会写入 `pick_table_clear`，于是经 `FailInputMode` 进入 `FAILED`；这条路径不会自动回位，再次进入前如果右臂不在起始位姿附近，需要先手动回位（见下文操作流程）。注意抬升、转动这两步的 MoveJ 失败不会更新 `policy_failure_reason`，此时 `FAILED` 的说明可能是上一次失败尝试留下的原因（如果没有，就是默认的 `policy task failed`），具体原因需查看诊断事件。

### 白色物体检测（WhiteObjectsRemain）

检测在 `object_detection.roi_xywh` 所框出的绿色垫子区域内进行，桌外白色的地面和机械臂不计入。`exclude_xywh` 中的矩形（每 4 个数为一组：x、y、宽、高）内的像素一律不算白色，用来去掉顶灯在光面垫子上的反光，因为反光和适配器一样白，亮度上无法区分。落在排除区里的物体看不到，循环可能会在它还没被抓走时就结束。

- 一个像素的 RGB 三个通道中，最小值不低于 `min_channel`、最大值与最小值之差不超过 `max_chroma`，就算作白色。
- 做一次 `erode_px`×`erode_px` 的方形腐蚀：只有整个方块都是白色的像素才保留。适配器的白色线缆只有几个像素宽，会被这一步去掉。
- 保留下来的像素数不少于 `min_pixels`，就认为桌上还有物体。

图像必须在检测开始 `settle_sec` 之后收到，以确保拍到的是手臂已停在放置侧时的画面；`timeout_sec` 内没有图像则判为失败。

标定（2026-10-20）：

- 录制画面中适配器每个通道约 110–170；重新部署后的实时画面更亮，为 215–250。垫子低于 70。
- 腐蚀后单个适配器保留 245–650 个像素，一团卷起的线缆最多残留 73 个，因此 `min_pixels` 取 150。
- 实时画面中，三个适配器计数为 1709，只剩一个时约 620；抹掉适配器、保留线缆时为 91，判为已清空。
- 光斑腐蚀后的范围约为 x 388–460、y 176–350，排除区取 `[392, 170, 75, 185]`，与最近的适配器（右边缘 x 391）不重叠。

检测时手臂必须离开垫子区域：右臂停在 J1=-135° 时应位于画面之外，这一点尚待带物体运行时确认。相机、垫子或灯光挪动后，需要重新标定 ROI 和排除区。

dry-run 时不读相机，直接报告桌面已清空，因此 dry-run 只跑一个周期就结束。

### 操作流程

**1. 准备（每次重建容器后都要做）**

- 确认机器人栈正常：三条臂的 `joint_states` 都在约 10 Hz，`/l|m|r/execute_motion` 都在线，全局相机 `/camera_global/d435/color/image_raw` 有图像（`rgb8`）。
- 检查右夹爪：读 `/gripper_right/position` 和 `/gripper_right/alarm`。重建容器后，夹爪常会停在半开的位置（如 900）且报警为 32（0x20），不响应指令。依次调用 `/gripper_right/reset` 和 `/gripper_right/enable` 即可恢复（必要时再调用 `open`）。报警值会一直保持 32，但 policy 链路上的任何环节都不检查它，不影响运行。
- 布置场景：适配器放在绿色垫子上，避开右侧的反光排除区（`object_detection.exclude_xywh`）；收纳盒放在放置侧；清空工作区；有人手持急停。
- 确认右臂在起始位姿附近。进入 policy 模式的第一步回位受 5 s 的切换超时限制。正常结束时 `pick_done_home` 会自动回位；如果上一次以 `FAILED` 结束、手臂停在远处（例如 J1 = -135°），需要先在 :8765 的运动面板把右臂移回起始位姿。

**2. 先跑一遍 dry-run**

```bash
REALMAN_BT_DRY_RUN=true ./rm65 bt control_pick
```

也可以在 :8765 的"行为树"卡片中选择 `control_pick`，不勾选真实运动后点"启动"。然后选择"Policy / 抓取清台"：一轮中所有步骤都只做校验，检测直接报告桌面已清空，随后停在 policy 空闲。确认没有 `FAILED` 后，终止这次 dry-run。

**3. 真机运行**

```bash
REALMAN_BT_DRY_RUN=false ./rm65 bt control_pick
```

在 :8765 上，勾选真实运动后启动也可以。然后选择"Policy / 抓取清台"。`activation: auto` 下，选择即开始运动：三臂回到起始位姿，然后每轮依次执行抓取（约 10–15 s）、抬升、J1 转到 -135°、松爪、检测，有物体就继续下一轮；桌面清空后三臂回到起始位姿，停在 policy 空闲。

**4. 结束**

在 :8765 点"终止行为树"，或在终端按 Ctrl-C。终止不会让手臂移动。也可以先选择 `none` 停止当前动作，行为树保持运行。运行中需要紧急停下时，拍急停，**不要用"重启 Docker"**：重启会直接杀掉 `PolicyRun`，来不及执行停止流程，策略桥接会停在激活状态（见下表）。

**5. 出现 FAILED 时**

`FAILED` 后输入模式会自动切到 `none`。可以从以下几处查看原因：:8765 上显示的 FAILED 说明、`logs/behavior-trees/<时间>/runtime.json`，以及每次尝试的轨迹 `logs/policy-attempts/policy_attempt_*.csv`。常见原因：

| 现象 | 原因与处理 |
| --- | --- |
| `input mode switch timed out` | 手臂离起始位姿太远，回位超过 5 s。先手动回位，再选择 policy |
| 回位被拒（`goal rejected`，驱动日志 `arm r is busy`），尝试次数很快用完 | 策略桥接停在激活状态（`/policy/stats` 的 `allow_publish = 1`），进入 policy 后 router 立刻占用右臂。通常是运行中途重启了容器。调用 `/policy/deactivate`（`std_srvs/SetBool`，`data: true`）后再试 |
| 重启容器后右夹爪不动、报警 32 | 依次调用 `/gripper_right/reset` 和 `enable` |
| `wrong_task` | 夹着物体转向收纳盒，策略没有按 pick 的 prompt 执行。核对 prompt 与模型 |
| 尝试次数用完 | 连续抓空、超时或卡住。检查物体位置是否在训练分布内，必要时调整摆放 |
| `no image on /camera_global/...` | 全局相机没有画面。检查相机进程 |
| 循环一直不停 | 检测误判。抓一帧图像，核对 ROI、排除区和阈值（`policy_task.yaml` 的 `object_detection`） |

修改 `policy_task.yaml`（例如 `attempts`、`pick_cycle`、`object_detection`）后，需要重启 `./rm65 bt control_pick` 才会生效。

转动路径于 2026-10-20 在空载下确认无障碍。同日真机运行：单个物体一轮完整成功（28 s）。三个物体的那次，3 次尝试都是抓空后转向收纳盒（`wrong_side_empty`），合爪时 J2 只有 54–62°，成功那轮是 65.6°，即在物体上方合了爪。重试和失败流程都按设计执行，但"还有物体 → 下一轮"这条路径尚未在真机上走通。

## 节点

| 节点 | 作用 | 失败时 |
| --- | --- | --- |
| `GripperReady` | 读取 `/gripper_<name>/position`；夹爪未张开时调用一次 `/gripper_<name>/open`，并等待位置回到阈值以内 | 服务缺失、没有位置数据、请求被拒绝或超时：判为故障 |
| `PolicyRun` | 预检、激活、监督一次尝试，并按固定顺序停止 | 见下表 |
| `MoveJointTo` | 读取当前关节角，只把一个关节转到绝对角度，再作为普通 MoveJ 执行（`control_pick.xml` 用它把 J1 转到放置侧） | 读角度失败、MoveJ 失败或超时 |
| `WhiteObjectsRemain` | 用全局相机检测垫子上是否还有白色物体，结果写入 `table_clear` | 有物体返回 `SUCCESS`；桌面已清空时返回失败并写入 `table_clear=true`；没有图像、编码不支持或 ROI 超出图像范围时返回失败，并写入 `policy_failure_reason` |
| `FailInputMode` | 把任务级失败转为输入模式 `FAILED`，原因取自 `policy_failure_reason`；协调器随后切换到 `none` | — |
| `RetryUnlessFault` | 与 `Retry` 相同，但如果失败的叶节点已置位 `policy_fault`，会立即返回失败，不再消耗剩余次数；置位 `policy_timeout` 的失败按 `timeout_attempts` 单独计数，等待 `timeout_backoff_sec` 后再重试 | 超时次数耗尽时，在 `policy_failure_reason` 前加上 `policy server timed out N times; last: `；运行开始、每次重试前和成功时清空 `policy_failure_reason`，失败结束时保留最后一次尝试的原因 |

叶节点返回 `FAILURE` 并不会把输入模式标记为 `FAILED`，只有 `FailInputMode`（以及切换超时和 tick 异常）会这样做。因此"次数耗尽"必须经过它，否则持久路由会让失败的分支无限重来。

## 一次尝试

`PolicyRun` 依次执行以下步骤：

1. **预检**：确认 `/policy/activate`、`/policy/deactivate`、`/policy/emergency_stop`、`/policy_router/emergency_stop` 四个服务均已发现；三条臂的 `joint_states`、夹爪位置和 `/policy/stats` 都是最新数据；桥接报告自身处于 policy 模式。与此同时，`PolicyRun` 把任务的 prompt 发布到 `prompt_topic`（`/policy/prompt`，等待期间每 0.5 s 重发一次），直到 `/policy/stats` 中的 `prompt` 值与之一致才继续。桥接切换 prompt 时会清空动作队列，并立即重新发布统计。桥接处于暂停状态不会阻塞预检：下一步的 `/policy/activate` 会解除暂停。等待 `service_wait_sec` 后仍有项目不满足时，此时不会启动任何动作：如果缺的只是桥接本身（三个 `/policy/*` 服务或 `/policy/stats`），判为 `policy_timeout`；其余情况（机械臂或夹爪数据、路由服务、桥接不在 policy 模式、prompt 不一致、桥接版本过旧）判为故障。
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
| 桥接因推理连续超时而自行暂停、桥接统计中断超过 `stats_stale_sec`、预检时桥接迟迟未就绪、`/policy/activate` 无回应 | 失败，`policy_timeout` | 是，按 `timeout_retry` 单独计数，先等待 `backoff_sec` |
| 关节超出范围、关节速度过大、另外两臂漂移、`joint_states` 丢失、路由服务缺失、夹爪无法张开 | 故障，`fault` | 否，经 `FailInputMode` 进入 `FAILED` |
| `lift_and_hold`：夹着物体转向收纳盒一侧 | 故障，`wrong_task` | 否，经 `FailInputMode` 进入 `FAILED` |
| `lift_and_hold`：抓空后转向收纳盒一侧 | 失败，`wrong_side_empty` | 是 |

以下关于放手和抓取的判定适用于 `release_over_bin`，`lift_and_hold` 的判定见上一节。**放手**指策略的夹爪指令在累计闭合足够久之后升到阈值以上，同时手臂位于收纳盒一侧（`release.joint_index` 对应的关节低于 `release.joint_below_deg`）。这一位置条件可以排除策略在垫子上为重新抓取而张开夹爪的情况。**抓取判定**依据放手前最后一段闭合期的夹爪位置：停在中间且出现过 `torque_reached`，说明夹住了物体；合到底且没有力矩，则是抓空。

每次尝试的结果会写入黑板键 `policy_attempt_result`、`policy_grasp_verdict`、`policy_attempt_sec`、`policy_failure_reason`，并作为事件记入运行快照，可在 Web 监视器中查看。

## 策略服务超时重试

真机上最常见的中断并非策略本身出错，而是策略服务暂时没有响应：serve 容器重启后，第一次推理要 JIT 编译约 26 s，这期间 WebSocket 循环被阻塞；Wi-Fi 被 Pika 定位程序挤占时，一次请求的往返时间会从 100 ms 升到数秒。桥接的单次推理在 `infer_timeout_s`（1.5 s）后超时，连续 `failure_pause_threshold`（5）次后会自行暂停，直到下一次 `/policy/activate` 才恢复。这类问题过一会儿通常会自行消失，所以不按故障处理，而是单独计数，稍等片刻后重试。

**哪些算超时**（`PolicyRun` 判为 `policy_timeout`，并在黑板上置位 `policy_timeout`）：

- 监督阶段，桥接报告 `paused=1`，即推理连续超时后自行暂停。尝试开始前收到的暂停状态不算，因为激活已经将其解除。
- 监督阶段，`/policy/stats` 中断超过 `stats_stale_sec`。
- 预检阶段，等待 `service_wait_sec` 后缺的只是桥接本身：`/policy/activate`、`/policy/deactivate`、`/policy/emergency_stop` 或 `/policy/stats`。
- `/policy/activate` 在 `service_call_timeout_sec` 内没有回应。

桥接虽然在线但与预期不一致（不在 policy 模式、prompt 不对、版本过旧），以及机械臂、夹爪或路由出现问题，仍然判为故障：这些情况重试无济于事。

**两次尝试之间**：已激活的尝试照常按顺序停止（`/policy/deactivate`、两个急停、等待路由释放）。随后 `RetryUnlessFault` 等待 `timeout_retry.backoff_sec`，期间返回 `RUNNING`，不 tick 子树，桥接保持停止状态。等待结束后从 `GripperReady` 重新开始，即张开夹爪、回位，再执行 `PolicyRun`。在等待期间切换模式，会经 `halt()` 立即结束，不会残留状态。

**次数与最终失败**：超时不占用 `attempts`，否则一次服务重启就可能耗尽抓取的重试次数。每个周期内允许 `timeout_retry.attempts` 次超时（首次计入，`-1` 不限），下一个周期重新计数。第 N 次超时后不再重试，`policy_failure_reason` 改为 `policy server timed out N times; last: <最后一次的原因>`，并经 `FailInputMode` 进入 `FAILED`，路由切换到 `none`。`policy_timeout` 标志保持置位，供父节点读取。

```yaml
# config/ros/policy_task.yaml
timeout_retry:
  attempts: 3        # 每个周期允许的超时次数，首次计入；-1 不限
  backoff_sec: 20.0  # 每次超时重试前的等待时间
```

20 s 的取值依据：桥接要经过约 8 s 的连续超时（5 × 1.5 s）才会暂停，再加上 20 s 的等待，足以覆盖约 26 s 的 JIT 编译；短时的 Wi-Fi 拥塞也能在此期间恢复。如果是服务进程本身挂掉，三次超时后进入 `FAILED`，大约需要一分半。

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
| `FAILED`，原因含 `policy is not ready to start` | 预检超时：原因中会列出缺少的项，可能是四个服务、三条臂的 `joint_states`、夹爪位置或 `/policy/stats`。如果缺的只是桥接，会先按超时重试，原因前面会加上 `policy server timed out N times` |
| 原因含 `policy bridge prompt is '…', waiting for '…'` | 桥接没有切换到该任务的 prompt：确认桥接订阅了 `prompt_topic`，并且没有其他进程在向 `/policy/prompt` 发布别的文本 |
| 原因含 `does not report its prompt in /policy/stats (too old a bridge)` | 桥接容器仍是旧代码，统计中没有 `prompt`：重建桥接镜像或同步代码后重启。prompt 未确认前不会激活桥接 |
| `wrong_side_empty` | 抓空后转向收纳盒，会自动重试；如果频繁出现，检查物体位置是否在训练分布内、夹爪是否张开充分 |
| `wrong_task` | 执行抓起任务时夹着物体转向了收纳盒，说明策略没有按 prompt 区分任务：先核对 prompt 是否与训练视图逐字一致，再查看模型在离线 prompt 交换测试中的区分度 |
| `FAILED`，原因以 `policy server timed out N times` 开头 | 策略服务在一个周期内超时了 `timeout_retry.attempts` 次，最后一次的原因跟在 `last:` 之后。`paused itself` 表示桥接连续推理失败后自行暂停，通常是 Wi-Fi 被占满（Pika 定位程序挤占链路时，往返延迟会从 100 ms 升到数秒），或 serve 容器刚重启、尚未预热：先在 serve 容器内做一次推理预热，再选择 policy |
| 一次尝试结束后，约 20 s 没有动作 | `policy_timeout` 之后的 `backoff_sec` 等待：运行快照中会有一条 `WARN` 级别的 `attempt_end ... result=policy_timeout` 事件 |
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

相关测试包括：`test_policy_supervisor`（判定逻辑，不依赖 ROS）；`test_policy_run_node` 和 `test_gripper_ready_node`（用模拟的桥接、路由、夹爪和三臂关节状态驱动，检查调用顺序，以及哪些情况判为 `policy_timeout`）；`test_retry_unless_fault_node`（故障立即停止、超时单独计数、等待、原因前缀）；`test_input_mode_executor`（树的结构、从 `FAILED` 到 `none` 的通路、计数经黑板传入树）；`test_control_router_tree`（XML 契约）。这些 C++ 测试开头都加了 `#undef NDEBUG`，因此 Release 构建也不会移除其中的 `assert`。
