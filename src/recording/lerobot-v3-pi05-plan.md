# LeRobot v3 / π₀.₅ 数据集迁移计划

## 目标

将已封存的原始录制 session（MCAP、JPEG 相机帧、manifest）异步转换为可由固定
LeRobot 运行时加载，并可直接用于 `policy.type=pi05` 微调的 LeRobot v3 数据集。

原始录制链路保持不变：recording 节点只读订阅驱动数据、持久化原始数据；LeRobot
转换失败不得影响已经完成的原始 session，也不得阻塞下一次录制。

## 当前实现不能用于 π₀.₅ 的原因

`realman_recording/lerobot_exporter.py` 当前手写的是 v2 风格布局：

- 写入 `codebase_version: v2.0`；
- 使用 `episode_000000.parquet`、`episodes.jsonl`、`tasks.jsonl` 和每 episode 视频；
- 未安装或固定 `lerobot` SDK，无法以 `LeRobotDataset` 重载验证；
- `stats.json` 使用 `p01` / `p999`，而 π₀.₅ 的量化归一化要求 `q01` / `q99`；
- 合并四路相机 receipt timestamp 作为 anchor，会把 N 路相机错误扩展为约 N 倍的
  数据帧率，数据行与按固定 FPS 写入的视频不能一一对应；
- action 仅含 Cartesian velocity，缺少夹爪的真实控制命令，不能作为完整策略监督信号。

## 不可变约束

1. 输入时间戳为 recorder 接收数据时记录的 ROS 2 `SYSTEM_TIME` epoch nanoseconds。
2. 每个输出 episode 使用单一、固定的 `dataset_fps` 时间网格；不重复图像来伪造更高 FPS。
3. 机械臂 state 线性插值；离散夹爪状态前向保持；action 的插值/保持策略必须由其
   控制语义定义并记录在 schema 中。
4. 缺失、过期或超过 `max_gap_sec` 的必需输入必须使导出失败，而不是悄悄填充坏标签。
5. 每个 ADOPTED session 对应长期 dataset 中一个 episode；不再为每个 session 创建一套
   独立训练 dataset。
6. 导出使用目标 LeRobot SDK 的公开 writer API。不得手写 v3 的 file/chunk、episode
   metadata offset、视频路径模板或 parquet schema。
7. 回放与浏览器可以保留加速缓存，但训练数据真相只能是 LeRobot dataset。

## 目标特征契约

初始三臂配置的特征命名固定如下。维度及 topic 映射来自权威
`config/ros/recording.yaml`，不得按 topic 字典序隐式推断。

| Feature | 初始 shape | 语义 |
| --- | ---: | --- |
| `observation.state` | 21 | `l/m/r` 六关节位置（18）+ 左/中/右夹爪位置（3） |
| `action` | 21（建议） | 三臂各 6D 实际下发 Cartesian 命令（18）+ 三夹爪实际下发命令（3） |
| `observation.images.orbbec-left` | CHW | 左侧 Gemini 305 RGB |
| `observation.images.orbbec-middle` | CHW | 中/腕部 Gemini 305 RGB |
| `observation.images.orbbec-right` | CHW | 右侧 Gemini 305 RGB |
| `observation.images.d435` | CHW | 全局 RealSense RGB |
| `task` | string | 该 episode 的人类可读任务描述 |

若实际控制接口不是 6D Cartesian 命令，必须先改变此表和 action extractor，再录制训练
数据。禁止用 observation state 伪装 action。

## 实施任务

### 1. 固定 LeRobot / π₀.₅ 运行时

**修改文件**

- `config/python/recording-requirements.txt`
- 新增 `src/recording/realman_recording/test/test_lerobot_runtime.py`

**工作**

1. 锁定一个可导入 `LeRobotDataset` 与 π₀.₅ policy 的 LeRobot revision，记录 package
   version 与 Git commit。
2. 增加运行时探测：验证 writer API、`LeRobotDataset` 重载和 π₀.₅ preprocessor 可用。
3. 明确 recorder Docker 与训练环境必须使用相同 lockfile。

**验收**

- 探测测试打印固定 revision；缺包或 API 漂移必须明确失败。

### 2. 引入显式 schema 和数据集仓库

**修改文件**

- 新增 `src/recording/realman_recording/realman_recording/lerobot_schema.py`
- 修改 `config/ros/recording.yaml`
- 新增 `src/recording/realman_recording/test/test_lerobot_schema.py`

**工作**

1. 用 dataclass 定义 feature names、arm/gripper/action 固定顺序、dataset repo ID 与 FPS。
2. 将需要的 action topic 配置化；当任一必需 action source 缺失时拒绝训练导出。
3. 明确长期 dataset root、repo ID 和 session-to-episode 映射持久化位置。

**验收**

- 三臂/三夹爪 topic 即使枚举顺序变化，state/action layout 仍完全相同。
- 缺失夹爪 action topic 的 session 不能标记为可训练导出成功。

### 3. 生成固定时间网格并对齐所有流

**修改文件**

- 修改 `realman_recording/lerobot_align.py`
- 修改 `realman_recording/lerobot_exporter.py`
- 修改 `test/test_lerobot_align.py`
- 新增 `test/test_lerobot_export_alignment.py`

**工作**

1. 在所有必需 state/action/camera 都有效的共同区间，以 `1 / dataset_fps` 生成 anchor。
2. 为每一路相机选择时间差不超过阈值的最近 JPEG；拒绝缺帧而不是补历史帧。
3. 对所有状态和 action 以显式策略进行对齐，并产出每流最大 skew、丢弃帧数等审计统计。

**验收**

- 四路各 15 Hz 输入产生 15 Hz 而非 60 Hz 的输出。
- 导出时间戳严格单调且间隔恒定。
- 任一 required 流超过 gap 阈值时导出明确失败。

### 4. 使用官方 writer 写入 LeRobot v3 episode

**修改文件**

- 重写 `realman_recording/lerobot_exporter.py`
- 新增 `realman_recording/lerobot_dataset_store.py`
- 新增 `test/test_lerobot_v3_export.py`

**工作**

1. 以目标 SDK `LeRobotDataset.create()` 创建 dataset，或安全打开已有 dataset。
2. 对一个对齐帧调用 `add_frame()`；session 完成后调用 `save_episode()`；按 SDK 要求调用
   `finalize()`，写入 metadata、stats 和视频 shard。
3. 使用临时工作目录和 dataset lock，导出失败不得污染已完成 episode。
4. manifest 记录 dataset root、repo ID、episode index、SDK revision、schema hash、对齐报告。

**验收**

- SDK 可重新加载输出；输出是 v3 file/chunk 布局而不是 `episode_000000.*`/JSONL v2 布局。
- `stats.json` 有正确维度的 `q01` 与 `q99`。

### 5. 接入异步录制生命周期

**修改文件**

- 修改 `realman_recording/recorder_node.py`
- 修改 `realman_recording/session_store.py`
- 修改 `realman_recording_msgs/msg/RecordingStatus.msg`（仅字段确有缺失时）
- 新增 `test/test_export_lifecycle.py`

**工作**

1. STOP 只完成原始数据封存；ADOPT 才提交导出任务，或将现有自动导出改为显式、单一语义。
2. 将 QUEUED/RUNNING/SUCCEEDED/FAILED、dataset episode 引用和错误持久化到 manifest。
3. Web status 仅观察进度，不能影响 exporter 或 recorder。

**验收**

- exporter 崩溃后原始 session 仍为 READY 且可重试。
- 重复 ADOPT 不创建重复 episode。

### 6. 让回放读取 LeRobot v3 episode

**修改文件**

- 修改 `realman_recording/replay.py`
- 修改 `realman_recording/web_server.py`
- 修改 `web/src/main.ts`
- 修改相关 Web/replay 测试

**工作**

1. 回放入口以 `dataset_root + episode_index` 打开 LeRobotDataset。
2. 私有 `replay.json` 若保留，只能从已导出的 dataset 生成，不能作为数据真相。
3. 通过 dataset frame 同步更新四路图像、三臂关节和夹爪状态。

**验收**

- 同一个 episode 在 SDK loader、Rerun 和 Web 中具有相同 frame count、timestamp 与状态。

### 7. π₀.₅ 端到端验证

**修改文件**

- 新增 `test/test_pi05_dataset_smoke.py`
- 更新 `src/recording/README.md`
- 更新 `website/docs/development/recording-platform.md`

**工作**

1. 用合成 MCAP/JPEG session 测试完整导出，不依赖真机。
2. 用同一 LeRobot runtime 重载 dataset，构造一个 π₀.₅ preprocessor batch。
3. 真机可用后补一条真实 session fixture，验证四路相机、三臂和三夹爪的完整链路。

**验收**

- 训练加载器能够取 batch；`observation.state`、`action`、所有视觉字段、`task` 完整存在。
- 量化归一化不因缺少 `q01`/`q99` 失败。

## 推荐实施顺序

先完成 1、2、3，再实现 4；随后接入 5、6，最后以 7 作为交付门槛。采集可靠性优先于
数据集功能；任何未经 SDK 重载和 π₀.₅ batch 验证的输出只能标记为实验产物，不能标记为
`SUCCEEDED`。
