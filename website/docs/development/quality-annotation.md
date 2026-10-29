# 策略运行偏离标注

pi05 自主运行时，操作员在 :8765 上实时标出"开始偏离 / 恢复正常 / 偏离原因"，录制服务把它们和这次尝试的录像存在同一个 session 里，之后可以在录制回放页逐帧修正，最后导出成逐帧标签给训练用。目标是积累"机械臂正在往好方向还是坏方向执行"的监督数据，用来评测和训练运行时的失败预警。

## 数据从哪里来

| 环节 | 谁做 | 结果 |
| --- | --- | --- |
| 每次尝试自动录制 | 行为树 PolicyRun 在 `/recording/attempt` 上发 `START`/`RESULT`，录制服务据此开录、停录 | 一次尝试一个 session，导出到 `realman/pi05-policy-rollouts`，带 `success`、`failure_reason`、`policy_task`、`attempt_id` 机器标签 |
| 现场打点 | :8765 行为树卡片里的打点条（`D`、数字键或按钮） | 偏离区间实时写进 session 的 manifest |
| 回放修正 | 录制回放页的"偏离"编辑器 | 改起止帧、补原因、删误标 |
| 导出 | 回放页"导出偏离标注"按钮或命令行 | `episode_quality_events.json` |

遥操作录制也可以在回放页事后补标，用于清洗示范数据；但要训练"预测 pi05 跑偏"的模型，标签必须来自 pi05 自己运行时的失败。

## 标注规范

开录前先统一"偏离"的标准，否则不同人、不同天标出来的不一致：

- **开始偏离**：你判断它已经在往错的方向走、再不纠正就会失败的那一刻。例如夹爪对准点明显偏出物体、走向错误目标、来回抖动或犹豫超过 1 秒、即将碰撞。
- **恢复正常**：它重新回到正确轨道的那一刻。一直没恢复就不用按，录制结束时这一段自动延续到结尾。
- **原因**：从下表选一个；现场来不及可以留空，回放时再补。

| 键 | 原因 id | 含义 |
| --- | --- | --- |
| `1` | `grasp_miss` | 抓偏 |
| `2` | `wrong_target` | 目标错 |
| `3` | `collision_risk` | 碰撞风险 |
| `4` | `stall` | 卡住犹豫 |
| `5` | `drop` | 掉落 |
| `6` | `other` | 其他 |

原因列表在 `config/recording/quality_reasons.yaml`，最多 9 条，顺序决定数字键；`id` 写进数据，改名会让旧标注失效，`label` 可以随时改。

人按键会比实际慢 0.3–1 秒。现场打粗点即可，精确的帧在回放里修。

## 现场打点（:8765）

行为树里 PolicyRun 在跑、录制服务也在为这次尝试录制时，行为树卡片里出现打点条。`D` 在正常时开始偏离、偏离中时恢复；数字键在正常时带原因开始偏离、偏离中时设原因。显示的"偏离中"状态来自录制服务本身，不是页面猜的。PolicyRun 在跑但打点条显示黄色的"本次尝试未录制"时，这次按键不会被保存，原因（例如相机预检失败）就写在提示里。按键和协议细节见 [Web 控制](./realman-web-control#偏离打点)。

## 回放修正

在录制回放页选中一个已导出的 episode，点时间轴下方的"偏离"进入编辑。时间轴下面的红色条是偏离区间，斜纹表示一直没恢复。

| 按键 | 作用 |
| --- | --- |
| `D` | 当前帧不在区间内：从这一帧开始一段（延续到下一段之前，或到结尾）；在区间内：把这一段的结束点设到这一帧 |
| `[` | 把当前帧所在区间的起点设到这一帧；不在区间里时改后面最近一段的起点 |
| `]` | 把当前帧所在区间的终点设到这一帧；不在区间里时改前面最近一段的终点（用来延长） |
| `Delete` | 删掉当前帧所在的区间 |

每次修改自动保存。别处同时改过时会提示并重新加载。修改过的区间来源从"现场"变成"回放"。

## 数据格式

session 的 `manifest.json` 里有一个 `quality` 块，时间是纳秒字符串：

```json
"quality": {
  "revision": 2,
  "attempt": {"attempt_id": "policy_attempt_20261029_031500_r", "task": "pick_only", "arm": "r",
              "outcome": "dropped", "succeeded": false, "reason": "the object slipped out of the closed jaws"},
  "intervals": [{"start_ns": "1792984500123000000", "end_ns": null, "reason": "grasp_miss", "source": "live"}],
  "rejected_marks": 0
}
```

- `attempt.outcome` 是 PolicyRun 的结果名；被 halt 是 `halted`，录制结束前没收到结果是 `no_result`。
- 标签编辑器里，尝试结果显示为"机器写入"的标签，人工修改仍然优先；`deviation_count`（区间条数）是只读的派生标签，训练端可以用 `--where deviation_count=0` 之类的条件筛选。

`episode_quality_events.json` 按数据集的 `episode_index` 给出每个 episode 的帧网格、尝试结果和区间（纳秒和帧号都有）。第 i 帧的时间是 `first_walltime_ns + i × round(1e9 / fps)`，与导出器的网格一致。在帧上展开成逐帧标签时：

- `deviating[i]`：第 i 帧落在某个区间里为 1，否则为 0；
- `frames_to_deviation[i]`：在区间里为 0，否则是离下一段偏离开始还有几帧，后面没有偏离为 -1。训练提前预警时用它。

`realman_recording.quality_events.frame_labels()` 实现了这两列。

导出方式：

- 回放页点"导出偏离标注"，下载当前 episode 所在数据集的文件；
- 或者在录制容器里运行：

```bash
python3 -m realman_recording.quality_events dump --recording-root /data/realman-recordings --repo-id realman/pi05-policy-rollouts -o episode_quality_events.json
```

## 排障

| 现象 | 原因与处理 |
| --- | --- |
| 打点条显示"本次尝试未录制" | 录制服务没启动、正在录别的 session（人工或 Pika 开的），或开录预检失败；提示里有录制服务给出的原因 |
| 按键没反应 | 焦点在输入框里、键盘遥操作模式开着、页面不可写，或打点条没显示 |
| 打点被忽略 | 顺序不对（没在偏离时按恢复、偏离中又按开始）或原因不在列表里；manifest 的 `rejected_marks` 会加 1 |
| 回放页提示"还没有导出" | episode 没有导出成功，只能等导出完成后按帧标注 |
