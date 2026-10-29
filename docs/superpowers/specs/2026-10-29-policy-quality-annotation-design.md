# 策略运行偏离标注

日期：2026-10-29。状态：设计已确认，待写实现计划。基线：main a1acf902。

## 问题

想做"预测机械臂正在往好的方向还是坏的方向执行"（运行时失败预警、进度估计），需要逐帧的好坏标签，而且标签必须来自
pi05 自己运行时的失败，不能拿遥操作的人为失误代替。现状缺三样东西：

- pi05 运行时不录相机。PolicyRun 每次尝试只写一份关节 CSV（`PolicyTraceWriter`），录制平台只在 Pika
  Session Manager 双击/三击时开录、停录。
- 录制平台只有整条 episode 的标签（`success`、`failure_reason` 等）和回放里事后标的 subtask 分段，
  没有"从哪一刻开始偏、哪一刻恢复"的记录，也不能在录制过程中实时打点。
- 所有 session 都导出到同一个 LeRobot 数据集 `realman/pi05-three-arm`。如果把策略运行也录进去，
  就会混进遥操作示范，污染 BC 训练数据。

## 目标与非目标

目标：

1. pi05 每次尝试自动录成一个 session，导出到单独的数据集，尝试结果自动变成标签。
2. 操作员在 :8765 用快捷键或按钮实时标出"开始偏离 / 恢复正常 / 偏离原因"。
3. 在录制回放页可以微调、补标、删改偏离区间。遥操作 episode 也能用同一套功能事后补标，用于清洗数据。
4. 标签能换算成逐帧的 `deviating` 和 `frames_to_deviation`，以 sidecar JSON 交给训练侧。

非目标：

- 训练控制台（:8780）拉取和使用 sidecar、SAFE 式探针、VLAC/STAC 评测，以后各自单独设计。
- 不录人接管后的纠正轨迹（RECAP / HG-DAgger 用），因为接管会结束本次尝试。
- 不记 checkpoint：policy_bridge 现在只把 prompt 发到 `/policy/stats`，拿不到模型版本。
- 不改 `ManageRecording.srv` 和 `RecordingStatus.msg`。Pika 那台机器也调用 `/recording/manage`，
  而 Humble 不校验消息类型，改了 srv，Pika 那边不重新编译就会解析出错。
- 不把逐帧标签写进 LeRobot parquet，也不改已导出的数据。

## 已定的选择（2026-10-29 与用户确认）

- 场景：主场景是 pi05 自主运行时现场打点；遥操作数据只在回放里补标。
- 输入：:8765 页面的快捷键加按钮（USB 脚踏模拟键盘也能用），不用 Xbox 手柄。
- 录制粒度：每次尝试一个 session，尝试之间回位的 MoveJ 不录。
- 数据集：单独的数据集，按 profile 选 repo_id（`policy_rollout` → `realman/pi05-policy-rollouts`）。
- 架构用方案 A：ROS 话题采集，manifest 里存纳秒时间的区间并作为唯一权威，训练侧用 sidecar 快照。
  改标注不用重新导出。
- 录制逻辑全部放在现有的 recorder 节点：`PolicyRunNode` 只发尝试事件，开录、停录、兜底、写标签都由 recorder 做。
- 两个话题、两种消息：控制信号（尝试事件）和标注数据（打点）分开，只有前者能触发开录。

## 数据流

```text
PolicyRunNode ── AttemptEvent START / RESULT ──▶ /recording/attempt ──────┐
:8765 浏览器 ─WS quality_mark─▶ web_control ─QualityMark─▶ /recording/quality_mark ─┤
                                                                           ▼
                         recording_recorder（现有节点，唯一管录制的地方）
                           ├─ START → 内部 _start_session(profile=policy_rollout)
                           ├─ RESULT → 写 quality.attempt → _stop_session → auto 标签 → ADOPT
                           ├─ 打点 → 合成区间 → manifest.partial 的 quality 块；原始消息进 MCAP
                           └─ /recording/status 的 diagnostics_json 带上尝试和偏离状态 → web_control → :8765
回放页 ── PUT /api/recording/{sid}/quality_events ──▶ final manifest 的 quality.intervals
回放页 / CLI ── 导出 ──▶ episode_quality_events.json（sidecar）
```

## 消息（`realman_recording_msgs`）

```text
# msg/AttemptEvent.msg —— 话题 /recording/attempt，reliable，depth 10，volatile
uint8 START=0
uint8 RESULT=1
uint8 kind
builtin_interfaces/Time stamp   # 发布方的 SYSTEM_TIME
string attempt_id               # 与 policy trace CSV 文件名（去掉 .csv）相同
string task                     # policy_task.tasks 里的任务名
string arm
string prompt
uint32 max_duration_sec         # 仅 START：本次尝试最长会持续多久（准备 + 运行）
string result                   # 仅 RESULT：SUCCESS / FAILURE / HALTED
string failure_reason           # 仅 RESULT：PolicyRunNode 的 policy_failure_reason，成功时为空

# msg/QualityMark.msg —— 话题 /recording/quality_mark，reliable，depth 50，volatile
uint8 DEVIATE_START=0
uint8 RECOVER=1
uint8 REASON=2                  # 给当前还没恢复的区间设置原因
uint8 kind
builtin_interfaces/Time stamp   # web_control 收到 WS 消息时的 SYSTEM_TIME
string reason                   # quality_reasons 里的 id，或空
```

## PolicyRunNode（realman_bt）

- 新增一个 `AttemptEvent` publisher。`dry_run=true` 时不创建，也不发布。
- 准备检查通过、进入 arming 阶段时发 `START`（也就是切 prompt、等 `/policy/stats` 确认之前）。
  这样 recorder 有一秒以上的时间完成预检和开录。准备检查就失败的尝试不发任何事件。
- `attempt_id`：trace 打开成功时用 trace 文件名去掉 `.csv`（`policy_attempt_<UTC>_<arm>[_n]`）；
  trace 打开失败时用 `policy_attempt_<UTC>_<arm>`。
- `max_duration_sec` = ceil(`service_wait_sec` + `max_attempt_sec`)。
- 在写 trace 结尾行的同一个位置发 `RESULT`：成功或失败时 `result` 用 outcome 名，`failure_reason`
  取自黑板上的 `policy_failure_reason`。`halt()` 发 `RESULT result=HALTED`。
- 发布不等待、不抛异常，失败只记日志，不影响尝试本身。

## recorder 的行为

新增参数（`config/ros/recording.yaml` 的 recorder 段）：

| 参数 | 默认 | 说明 |
|---|---|---|
| `auto_record_enabled` | `true` | 关掉后不订阅 `/recording/attempt`，打点仍然照收 |
| `auto_record_profile` | `policy_rollout` | 自动开录时用的 profile |
| `auto_record_stop_margin_sec` | `10` | 兜底停录时间 = `max_duration_sec` + 这个余量 |
| `auto_record_adopt_on_stop` | `true` | 自动 session 干净停录后立即 ADOPT；全局 `auto_export_on_stop` 不变 |
| `lerobot_profile_repo_ids` | `["policy_rollout=realman/pi05-policy-rollouts"]` | `profile=repo_id` 字符串数组；没列出的 profile 用 `lerobot_repo_id` |
| `quality_reasons_path` | 容器内挂载的 `config/recording/quality_reasons.yaml` | 偏离原因列表 |

尝试事件：

- 所有尝试事件按到达顺序放进同一个串行 worker 处理，跟 `/recording/manage` 用同一把生命周期锁，
  不在订阅回调线程里做预检。
- `START`：worker 处理到它时，如果没有 session 在 RECORDING，就构造一个跟服务请求等价的 goal
  （profile=`auto_record_profile`，task=`AttemptEvent.task`，`duration_sec` = `max_duration_sec` + 余量，
  `record_cameras=true`，立即开始），调用 `_start_session`。成功后把 `quality.attempt`（不含 result）写进
  `manifest.partial`。如果上一次的 STOP 还在收尾，START 拿不到生命周期锁，会排在它后面，等收尾完成再开录。
  `_stop_session` 在持锁期间同步完成 FINALIZING → READY；导出由独立的 `SerialExportWorker` 做，不会让 recorder
  停在 EXPORTING，所以导出不挡下一次开录。如果 `_start_session` 因为已经有 session（手动开的、Pika 开的或预约中的）
  抛出 "already active"，就忽略这次 START，计数 `auto_record_ignored_busy`。
  预检失败记 WARN，原因写进 status 的 `auto_record_last_error`，计数 `auto_record_start_failed`。
- `RESULT`：只在当前 session 是自动 session 并且 `attempt_id` 一致时处理，否则忽略并计数 `attempt_result_ignored`。
  处理顺序：把 result 和 failure_reason 写进 `quality.attempt`，用 `_stop_session` 停录（这里的 success 表示
  收尾是否干净，不是任务成败），finalize 后写 auto 标签。`auto_record_adopt_on_stop` 打开时，自动 session 跟
  `auto_export_on_stop` 走同一条 ADOPT 入队路径（`should_auto_export` 的判断里加上这个开关），FAILED 的 session 照旧不导出。
- 兜底：到了 `duration_sec` 还没收到 RESULT，由现有的自动结束逻辑停录，finalize 时写
  `quality.attempt.result = "TIMEOUT_NO_RESULT"`，auto 标签 `success=false`、`failure_reason=no_result`。

打点（只要有 session 在 RECORDING 就收，不限于自动 session）：

- 每条 QualityMark 原样写进 MCAP，topic 登记在 `topic_catalog.py`。
- 按当前区间状态处理：
  - 没有未恢复的区间时收到 `DEVIATE_START`：新开一段，start_ns 取消息的 stamp，reason 取消息里的值；
  - 有未恢复的区间时收到 `RECOVER`：结束这一段，end_ns 取 stamp，必须大于 start_ns；
  - 有未恢复的区间时收到 `REASON`：设置这一段的原因；
  - 其他组合，或者 stamp 早于上一个区间边界、不在 [session 开始, 当前时间 + 1 s] 范围内，都忽略，计数 `rejected_marks`。
  - reason 不在列表里也算 rejected。
- 每条被接受的打点都会触发一次 `manifest.partial` 原子更新，所以录制中途崩溃也不丢标注。
  没有 session 在录时收到的打点只计入 recorder 诊断的 `dropped_marks`。
- 停录时如果还有未恢复的区间，它的 `end_ns` 保持 `null`。

状态（不改 `RecordingStatus.msg`）：在 `diagnostics_json` 里加一个 `quality` 对象：
`{"profile", "attempt_id", "deviating": bool, "deviation_start_ns", "reason", "rejected_marks", "dropped_marks", "auto_record_last_error"}`。

## manifest 的 `quality` 块

纳秒时间一律用十进制字符串（跟回放现有约定一致，避免 JavaScript 丢精度）。

```json
"quality": {
  "revision": 0,
  "attempt": {"attempt_id": "policy_attempt_20261029_031500_r", "task": "pick_only", "arm": "r",
              "prompt": "pick up the white object", "result": "FAILURE", "failure_reason": "dropped"},
  "intervals": [
    {"start_ns": "1792984500123000000", "end_ns": "1792984503456000000", "reason": "grasp_miss", "source": "live"},
    {"start_ns": "1792984507000000000", "end_ns": null, "reason": null, "source": "live"}
  ],
  "rejected_marks": 0
}
```

- `intervals` 是唯一能编辑的、权威的标注。规则：按 start 排序、互不重叠、start < end（end 为 null 表示一直持续到录制结束）、
  都在 session 的时间范围内、reason 在列表里或为 null、`source` 只能是 `live` 或 `replay`。
- 非策略 session 没有 `attempt`。没有任何打点的 session 可以没有 `quality` 块，按空区间处理。
- 回放页的修改写进 final `manifest.json`，带 revision 检查和录制根目录文件锁，跟 `episode_tags` 一样。
  修改过的区间 `source` 改为 `replay`。

## 标签

- `episode_tags` 新增 `auto` 层，effective = defaults 快照 → auto → manual，最后去掉 removed。
  `tag_sources` 里 auto 层的键显示为 `auto`。
- recorder 在 RESULT 或兜底停录时写：`success`（result == SUCCESS）、`failure_reason`（成功时不写）、
  `policy_task`、`attempt_id`。
- 新增派生标签 `deviation_count` = `quality.intervals` 的条数，`tag_sources` 显示为 `derived`。
  区间改了就跟着重算，并刷新 `episode_meta.json`。跟 `date` 一样，`deviation_count` 不能手动改，也不能设为全局默认值，
  `validate_tags` 遇到会拒绝。

## 逐帧换算与 sidecar（新模块 `quality_events.py`）

纯函数，不依赖 ROS，回放接口、sidecar 导出和测试共用：

- 第 i 帧的时间 `t_i = first_walltime_ns + round(i × 1e9 / fps)`，两个值取自导出回执。
- `deviating[i] = 1`：存在某个区间满足 `start_ns ≤ t_i < end_ns`（end 为 null 时按 +∞）。
- `frames_to_deviation[i]`：在区间内为 0；否则是到下一个区间第一帧的帧数；后面没有区间为 -1。
- 区间对应的帧：`start_frame` 是第一个满足 `t_i ≥ start_ns` 的 i；`end_frame` 是最后一个满足 `t_i < end_ns` 的 i
  （end 为 null 时取最后一帧）。区间完全落在帧范围之外时，两个帧号都是 null，照常输出，不报错。
- 回放里按帧编辑时反向换算：起点在第 f 帧 → `start_ns = t_f`；终点包含第 f 帧 → `end_ns = t_{f+1}`。
  超出范围时夹到 `[t_0, t_{last+1}]`。

sidecar `episode_quality_events.json`：

```json
{"schema": "realman.quality_events.v1", "repo_id": "realman/pi05-policy-rollouts", "generated_at_ns": "...",
 "episodes": {"12": {"session_id": "...", "fps": 15, "first_walltime_ns": "...", "frame_count": 270,
                     "attempt": {"attempt_id": "...", "result": "FAILURE", "failure_reason": "dropped"},
                     "intervals": [{"start_ns": "...", "end_ns": "...", "start_frame": 40, "end_frame": 88,
                                    "reason": "grasp_miss", "source": "replay"}]}}}
```

- 接口：`GET /api/lerobot/quality_events?repo_id=<id>`，CLI：
  `python3 -m realman_recording.quality_events dump --recording-root <dir> --repo-id <id> -o <file>`。
- 逐帧数组不放进 sidecar，由模块里的 `frame_labels(episode)` 按需算出 `(deviating, frames_to_deviation)`。

## :8765（realman_web_control）

- **WS 指令** `quality_mark {kind: "deviate_start" | "recover" | "reason", reason?: string}`：
  - 在 `protocol.py` 里校验：kind 只能是三者之一；reason 必须是列表里的 id 或省略；`reason` 这个 kind 必须带 reason。
  - 需要写权限（`REALMAN_WEB_CONTROL_TOKEN`）。
  - web_control 用节点时钟盖戳后发 `QualityMark`，并给浏览器回执。
- **状态**：web_control 订阅 `/recording/status`，把 `state`、`session_id`、`elapsed_sec` 和 `diagnostics_json.quality`
  精简成 `recording` 状态推给浏览器。原因列表从 `quality_reasons_path` 读，放进页面 manifest。
- **打点条**放在行为树面板的运行区：
  - 显示条件：recorder 在 RECORDING 并且 profile 是 `policy_rollout`。
  - 黄色警告：:8765 现有的行为树推送里有 PolicyRun 节点处于 RUNNING，但 recorder 没在录，就显示"本次尝试未录制"
    和 `auto_record_last_error`。dry-run（没勾"真实运动"）时不显示，因为 dry-run 本来就不录。
  - 内容：录制中 · attempt_id · 已录时长；状态牌"正常 / 偏离中 Ns"（以 recorder 的状态为准）；
    原因按钮（按列表顺序编号 1–9）；本次尝试最近 5 条打点。
- **快捷键**：
  - `D`：正常时发 `deviate_start`，偏离中发 `recover`；
  - 数字键 n：正常时发带第 n 个原因的 `deviate_start`，偏离中发 `reason`；
  - 每个键都有对应的按钮。
  - 以下情况快捷键不生效：焦点在 input/textarea/select 里、键盘遥操作模式开着、没有写权限、打点条没显示。

## 录制回放页（realman_recording web）

- **时间轴**：叠加红色区间，`end_ns=null` 的那段用斜纹延伸到最后一帧。
- **右侧面板**：列出每段的起止帧和时间、原因下拉框、来源。
- **按键**：现有的 Q/R 留给 subtask，不改。
  - `D`：当前帧不在区间内就新开一段（结束点暂时为 null）；在区间内就把结束点设到包含当前帧；
  - `[` `]`：把选中的边界挪一帧；
  - `Delete`：删掉选中的区间。
- **保存**：
  - `GET /api/recording/{sid}/quality_events` 返回 `{intervals, attempt, revision, frames}`，其中
    `frames = {fps, first_walltime_ns, frame_count}` 来自导出回执，每段区间额外带上算好的 `start_frame`/`end_frame`；
  - `PUT` 时提交完整的区间列表和 revision；
  - 校验失败返回 400，revision 冲突返回 409，前端提示重新加载。
- **侧栏**：尝试结果和 `deviation_count` 走现有的标签显示。
- **导出**：数据集视图加"导出偏离标注"按钮，调用 sidecar 接口并下载文件。

## 配置

- `config/recording/quality_reasons.yaml`：唯一的原因列表，带注释说明用途和编号规则，最多 9 条。

  ```yaml
  # 偏离原因。顺序决定 :8765 的数字快捷键（第 1 条 = 键 1）。id 写进 manifest，改名会让旧标注失效。
  reasons:
    - {id: grasp_miss, label: 抓偏}
    - {id: wrong_target, label: 目标错}
    - {id: collision_risk, label: 碰撞风险}
    - {id: stall, label: 卡住犹豫}
    - {id: drop, label: 掉落}
    - {id: other, label: 其他}
  ```

- `config/ros/recording.yaml`：recorder 段加上面的 `auto_record_*`、`lerobot_profile_repo_ids`、`quality_reasons_path`；
  web server 段加 `quality_reasons_path`。
- `config/ros/realman_web_control.yaml`：加 `quality_reasons_path`。
- Compose：recorder、recording web、web_control 三个容器挂载 `config/recording`（只读）。

## 异常处理汇总

| 情况 | 处理 |
|---|---|
| 自动开录预检失败 | WARN，`auto_record_last_error`，计数；尝试照常进行，:8765 显示黄色"未录制" |
| 已经有 session 在 RECORDING | 忽略 START，计数 `auto_record_ignored_busy` |
| 上一次 STOP 还在收尾 | START 在串行 worker 里排队，收尾完成后开录 |
| RESULT 的 attempt_id 对不上，或当前不是自动 session | 忽略，计数 `attempt_result_ignored` |
| 没收到 RESULT | 到 `duration_sec` 自动停录，`TIMEOUT_NO_RESULT`，`success=false` |
| 打点顺序、时间或原因不合法 | 忽略，计数 `rejected_marks` |
| 不在录制中时收到打点 | 计入 recorder 诊断的 `dropped_marks` |
| 停录时还在偏离 | `end_ns = null` |
| recorder 中途重启 | 现有 orphan 恢复，`manifest.partial` 里的 quality 块保留 |
| PolicyRunNode 发布失败 | 只记日志，不影响尝试 |
| 回放保存 | 400 校验失败 / 409 revision 冲突 |

所有时间都是 realman_ts 主机的 SYSTEM_TIME，web_control、BT、recorder 跑在同一台机器上。

## 测试

- **pytest（realman_recording）**：
  - `quality_events.py`：区间合成规则、校验、逐帧换算、帧号与纳秒互转、sidecar 格式；
  - auto_record：START 开录、忙时忽略、STOP 收尾时 START 排队、RESULT 写标签后停录再 ADOPT、attempt_id 不一致、兜底超时；
  - `SessionStore` 的 quality 块：partial 实时更新、finalize 带过去、orphan 恢复、final 编辑的 revision；
  - `EpisodeTagStore`：auto 层优先级、`deviation_count` 派生和重算；
  - 导出时按 profile 选 repo_id；
  - web server 的 GET/PUT quality_events 和 sidecar 接口。
- **ROS 集成测试**（沿用 `test_recording_service_ros_integration.py` 的隔离 graph）：发 AttemptEvent START、几条
  QualityMark、RESULT，检查生成了 session、MCAP 里有打点、manifest 的 quality 块和 auto 标签正确。
- **pytest（realman_web_control）**：`quality_mark` 的协议校验和写权限、盖戳发布 QualityMark、`recording` 状态转发。
- **gtest（realman_bt）**：
  - arming 时发 START，`max_duration_sec` 和 `attempt_id` 正确；
  - 成功、失败、halt 三条路径都发 RESULT；
  - 准备失败和 dry_run 不发任何事件。
- **Playwright**：
  - `config/web-control/`：打点条的显示和"未录制"警告、D 和数字键发出的 WS 消息、快捷键不生效的各种条件；
  - `config/recording/`：回放页 D、`[` `]`、Delete 的编辑、保存和 409 提示。
- **真机验收（realman_ts）**：从 :8765 跑一次真实策略尝试并打两段偏离，检查：
  - `realman/pi05-policy-rollouts` 里多了一个 episode；
  - 区间和 auto 标签正确；
  - 回放能改；
  - sidecar 的帧号跟回放时间轴一致。

## 文档

- `src/recording/README.md` 和 `website/docs/development/recording-platform.md`：录制入口从"只有 Service"改为
  "Service + 配置开关控制的尝试事件自动触发（同一条内部路径）"，补上 quality 块、auto 标签层和 profile → 数据集映射。
- 行为树文档：PolicyRun 会发尝试事件，以及 `attempt_id` 与 trace 的对应关系。
- web-control 文档：打点条和快捷键。
- `website/docs/reference/ros-interfaces.md`：两种新消息、两个新话题。
- 新页面 `website/docs/development/quality-annotation.md`：标注规范（什么算"偏离"、什么时候按）、操作流程、sidecar 格式。
  路由加进 `website/tests/site.spec.ts`。

## 部署

- 新消息要求重建所有带 `realman_recording_msgs` 的镜像：recorder、recording web、bringup（realman_bt）、web_control。
  Pika 那台机器不用动。
- 部署前在 realman_ts 上确认 compose 已经挂载 `config/recording`，并确认新数据集目录可写。
