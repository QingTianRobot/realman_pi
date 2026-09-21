---
title: 独立数据录制平台
description: RealMan 驱动输出的隔离录制、预检、低清展示与 LeRobot 导出边界。
---

# 独立数据录制平台

`realman_recording` 是一个独立 ROS 2 节点组：它只订阅已有的驱动与夹爪输出，不创建 `Robotic_Arm`/RealMan SDK 客户端，也不发布机械臂运动命令。网页端是只读展示，不发起任何录制控制；上游系统通过 `/recording/manage` Service 控制录制生命周期，不能复用或代理 `realman_web_control` 的运动面板。

录制和数据集转换是两个阶段：停止时只原子收尾原始 MCAP/视频 session；上游明确采用后才会请求独立 LeRobot worker。转换占用的 CPU、GPU、视频解码或失败均不得减慢下一次 ROS 数据录制。

MCAP 状态写入、ROS `CompressedImage` 有界 JPEG 录制、低清 JPEG 预览、夹爪/相机健康状态、Three.js/URDF 三臂展示、Rerun 离线逐帧回放、预检和预约控制已经接入；LeRobot 数据读取/落表仍未实现。当前 `ADOPT` 的异步导出入口会持久化任务状态，但在导出器实现前会明确标记为 `FAILED`，不会伪造成功的数据集。
MCAP 的 `accepted_samples` 仅在序列化并成功交给 writer 后递增；`enqueued_samples`
和 `dropped_samples` 留在 session manifest 的 summary 中，便于区分内存队列背压与真实落盘。
任何 MCAP 写入或关闭错误都会使 session 进入 `FAILED`，不得作为 LeRobot 导出输入。

## 边界与数据流

```text
既有 RealMan 驱动 / 夹爪话题
                 │ subscribe only
                 ▼
recording_recorder ───────► sessions/<id>/state.mcap
        │                         ├── videos/
        │                         ├── manifest.partial.json → manifest.json
        │                         └── export/lerobot/
        │
        └── recording/status（只读）◄── recording_web_bridge ◄── 浏览器（只读展示）
上游系统 ──► recording/manage Service ──► recording_recorder

ROS CompressedImage ──► bounded JPEG archive ──► videos/
   └─────► independent lossy preview ──► /preview/<camera>.jpg ──► 浏览器
```

持久化状态写入、原始相机录制、低清预览、浏览器 WebSocket 分别属于不同 worker。展示端只接收限频的小型状态快照；不得在 ROS 状态话题或该快照中传输 JPEG/WebP。浏览器断开、慢客户端、预览解码失败或相机单路失败均不应阻塞驱动订阅与状态归档。

网页三维部分后续应只提取 `realman_web_control` 已有的 Three.js/URDF 实时关节模型；不得带入运动控制按钮、动作协议或 SDK 调用。

## ROS 接口

节点名为 `/recording_recorder` 与 `/recording_web_bridge`。前者订阅如下已有输出：

- `/<arm>/joint_states` (`sensor_msgs/msg/JointState`)
- `/<arm>/connected` (`std_msgs/msg/Bool`)
- `/<arm>/coordinates/state` (`std_msgs/msg/String`)
- `arm_action_topics` 中配置的 `geometry_msgs/msg/TwistStamped` 控制目标（只读采集）
- `/tf` (`tf2_msgs/msg/TFMessage`)
- `gripper_*_topics` 中配置的夹爪位置、力矩到位与告警话题。

`/recording/manage` 是唯一的会话控制入口，类型为 `realman_recording_msgs/srv/ManageRecording`。录制平台不提供 `recording/manage_session` Action；网页也只读取状态，不发起录制控制：

| 命令 | 所需字段 | 行为 |
| --- | --- | --- |
| `PREPARE` | 可选 `record_cameras` | 返回所有设备预检诊断；只有成功结果才会在有效期内授权 `START`。 |
| `START` | `profile`，可选 `task`、`duration_sec`、`record_cameras`、`start_at_walltime_ns` | 需先通过 `PREPARE`；零时间戳只接受仍在有效期内的预检，非零时间戳预约到 ROS 2 `SYSTEM_TIME`，届时自动重新预检。 |
| `STOP` | 无 | 停止当前原始录制并收尾 MCAP。 |
| `ADOPT` | `session_id` | 仅接受 `READY` 且无 MCAP 写错误的 session；立刻返回，并异步请求 LeRobot 转换。导出器完成前，该任务会明确记录失败而非伪造数据集。 |
| `DISCARD` | `session_id` | 标记 session 为 `DISCARDED`，禁止导出；原始文件保留用于审计和人工复核。 |

Service 的采用返回表示“导出任务已接受”，不是“数据集已生成”。最终状态存于对应 `manifest.json` 的 `export.state`（`QUEUED`、`RUNNING`、`SUCCEEDED` 或 `FAILED`）。在 LeRobot 导出器落地前，`FAILED` 是预期且诚实的结果。

`/recording/status` (`RecordingStatus`) 是网页状态的唯一权威来源。倒计时由 recorder 的单调时钟计算，浏览器仅显示它，不能用前端定时器决定结束录制。

网页控制台采用深色工业控制台布局：顶部显示连接与 session 状态，上方为低清相机网格，下方按机械臂展示连接状态与关节值。预览图片按时间戳增量刷新，不会随每次状态快照重复重载；WebSocket 断开时只影响操作台，不影响录制节点。

## 配置和运行

权威配置是仓库根目录的 `config/ros/recording.yaml`，其中：

- `recording_root` 是运行时 session 根目录；容器默认 `/data/realman-recordings`；
- `max_state_queue` 是有界内存队列容量，满时必须计入丢失而不能阻塞订阅回调；
- `arm_namespaces` 与夹爪 topic 列表决定订阅集合；
- `preflight_required_topics` 决定非相机的 PREPARE 硬门限；可按任务加入力控、报警或 action topic，未列出的录制 topic 不会阻止开始；
- `preflight_alignment_trigger_sec` 是仅用于请求离线对齐的 receipt-walltime 差阈值；`alignment_enabled` 关闭时仍保留检测结论，但不请求后处理；
- `camera_ids` 和 `camera_image_topics` 必须一一对应；后者必须是 `sensor_msgs/msg/Image` 的绝对 topic 名称；
- `web_state_hz` 是网页快照上限，不是采样或图像帧率。
- `preflight_max_age_sec`、`preflight_valid_sec` 和 `min_free_space_bytes` 是开始录制前的硬性预检阈值；
- `preview_*` 是 Web 独立预览限制，`preview_enabled=true` 才启动低清 JPEG 重压缩 worker；
- Rerun 离线回放使用 `python3 -m realman_recording.replay --session ...`，不依赖 Web bridge 或实时 ROS 节点。

在已运行的驱动 ROS 图中单独启动：

```bash
source install/setup.bash
ros2 launch realman_recording recording.launch.py \
  recording_root:=/absolute/path/to/sessions
```

容器入口为：

```bash
docker compose up realman_recording
```

Compose 将仓库 `recordings/` 挂载为容器 `/data/realman-recordings`，同时保留 `logs/` 挂载。网页默认绑定 `127.0.0.1:8770`，在认证与反向代理完成前不要直接暴露到不可信网络。

独立 launch 会创建 `logs/YYYYMMDD_HHMMSS/` 并设置 ROS 2 官方节点日志目录；使用 rcutils 彩色输出，不应添加自定义日志重定向。

## 后续实现清单

下列位置已定义了函数边界与异常约束，具体实现应直接填入相应 `# ai TODO`：

1. `state_archive.py`（已接入）：用 `rosbag2_py` 的 `SequentialWriter` 以 `storage_id="mcap"` 建 topic、序列化消息并在收尾时关闭 writer；bag 记录时间取 receipt wall-clock 纳秒。session manifest 的成对 wall/monotonic 起始锚点供导出换算媒体时间轴；没有 `header.stamp` 的话题只可使用 receipt 时间。
2. `camera_workers.py`（已接入）：每路相机独立 ffmpeg 分段录制；暂停产生媒体间隙；低清预览使用另一个限 FPS、限分辨率、只保留最新 JPEG 的 worker。
3. `web_server.py` 与 `static/index.html`（已接入）：预览使用独立 endpoint；只读 Three.js/URDF 三臂 viewer 已实现（参考 web_control 的 urdf-loader 方案，把 `/l|m|r/joint_states` 实时套到 URDF 模型）。`/api/layout` 与 `/models` 由 `web_server.py` 提供，前端源在 `web/`，经 `npm run build:recording`（Vite，`config/recording/vite.config.mjs`）构建到 `static/`。
4. `lerobot_exporter.py`：ADOPT 后在 ROS executor 外读取 MCAP/JPEG，以固定 15Hz SYSTEM_TIME 网格对齐，使用 `lerobot==0.6.1` 的公开 `create/resume`、`add_frame`、`save_episode`、`finalize` API 追加一个 v3 episode。多个 adopted session 用数据集锁串行化；没有已配置的真实夹爪 command topic 时，action 保持 18D 机械臂命令，绝不从状态伪造夹爪 action。
5. `replay.py`（已并入 `realman_recording` 包）：Rerun 是离线分析适配器，不是 ROS 包或节点。正式回放仅接受 ADOPTED 且 LeRobot 导出成功的 session，并读取 `export/lerobot/`；原始 MCAP/媒体索引永不作为回放回退源。固定 LeRobot 版本后再接入 episode/frame、state/action 与视频字段。
6. 完成后补充真实相机、磁盘满、WebSocket 慢客户端、暂停/恢复、崩溃恢复、Service adopt/discard 和 LeRobot 读回的端到端测试。

## LeRobot 对齐策略（以图像为基准）

不同数据流频率不同，导出以图像曝光/到达时间戳为主轴，逐帧反推其余流。MCAP 的记录时间是 ROS 2 callback receipt wall time；session manifest 保存同一时刻的 wall/monotonic 锚点，导出器在需要媒体单调时间轴时从该映射换算：

| 数据种类 | 典型频率 | 对齐策略 |
| --- | --- | --- |
| 图像（RGB/Depth） | 30–60 Hz | 基准（anchor），导出帧时间轴 |
| 机械臂（State/Action） | 100–1000 Hz | 线性插值；仅在相邻样本间隔不超过 `max_gap_ns` 时允许。 |
| 夹爪（Gripper） | 20–100 Hz | 开关量默认 `FORWARD_FILL`（最后一个因果状态）；可显式选 `NEAREST`；连续力控夹爪用线性插值。 |

所有 anchor 和样本时间戳均为 ROS 2 `SYSTEM_TIME` wall-time 纳秒，必须非空且严格递增；重复、乱序、非整数时间戳会拒绝导出。线性流要求每个样本具有相同的有限数值维度，避免关节向量静默截断。`max_gap_ns` 由 exporter 按数据流配置：超过间隔的插值或保持会失败，调用方必须舍弃该图像帧或把它显式标为缺失，而不能伪造训练观测。

实现位于 `realman_recording/lerobot_align.py`：`align_series()` 对单流按策略对齐，
`align_streams()` 把多流对齐到同一组图像 anchor 生成逐帧行；`STREAM_POLICIES` 在
`lerobot_exporter.py` 中声明默认策略。

## 验证基线

实现 TODO 前只能验证接口与隔离边界：

```bash
python3 -m compileall src/recording
python3 -m pytest src/recording/realman_recording/test
docker compose config
```

实现完成后应在 Humble 容器运行 `colcon build`/`colcon test`，然后确认：MCAP 可由 rosbag2 读取、视频分段与 pause manifest 一致、关闭浏览器不会增加状态队列丢失、导出的 LeRobot 数据集可被目标版本加载。
