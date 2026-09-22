---
title: 独立数据录制平台
description: RealMan 驱动输出的隔离录制、预检、低清展示与 LeRobot 导出边界。
---

# 独立数据录制平台

`realman_recording` 是一个独立 ROS 2 节点组：它只订阅已有的驱动与夹爪输出，不创建 `Robotic_Arm`/RealMan SDK 客户端，也不发布机械臂运动命令。网页端是只读展示，不发起任何录制控制；上游系统通过 `/recording/manage` Service 控制录制生命周期，不能复用或代理 `realman_web_control` 的运动面板。

录制和数据集转换是两个阶段：停止时只原子收尾原始 MCAP/视频 session；上游明确采用后才会请求独立 LeRobot worker。转换占用的 CPU、GPU、视频解码或失败均不得减慢下一次 ROS 数据录制。

MCAP 状态写入、ROS `Image` 有界 JPEG 录制、低清 JPEG 预览、夹爪/相机健康状态、Three.js/URDF 三臂展示、预检和预约控制已经接入。`ADOPT` 会在 ROS executor 外把完成 session 异步转换为 `lerobot==0.6.1` 的 canonical v3 episode；失败会持久化为 `FAILED`，不会伪造成功的数据集。
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

ROS Image ──► bounded JPEG archive ──► videos/
   └─────► independent lossy preview ──► /preview/<camera>.jpg ──► 浏览器
```

持久化状态写入、原始相机录制、低清预览、浏览器 WebSocket 分别属于不同 worker。展示端只接收限频的小型状态快照；不得在 ROS 状态话题或该快照中传输 JPEG/WebP。浏览器断开、慢客户端、预览解码失败或相机单路失败均不应阻塞驱动订阅与状态归档。

录制可选配置 `calibration_snapshot_path` 指向已解算的相机标定结果。配置后，START 会将该文件复制入 session metadata 并写入 SHA-256/version；未配置时 metadata 明确标为 `UNAVAILABLE`，不会把占位内参/外参当成真实几何数据。

网页三维部分只提取 `realman_web_control` 的 Three.js/URDF 实时关节模型；不得带入运动控制按钮、动作协议、SDK 调用或历史数据回放。Web bridge 仅提供实时 `/api/layout`、`/preview/<camera>.jpg`、`/models/*` 和 `/ws`；不存在 `/api/lerobot*` 或 `replay.json` Web API。正式离线回放统一执行 `python3 -m realman_recording.replay --session <session_dir>`，由 Rerun 读取成功导出的 canonical LeRobot episode。

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

网页控制台采用深色工业控制台布局：顶部显示连接与 session 状态，上方为低清相机网格，下方按机械臂展示连接状态与关节值。坐标状态只允许有限的数值字段进入浏览器，非法 JSON、未知字段和非有限值会被丢弃。预览图片按时间戳增量刷新，不会随每次状态快照重复重载；WebSocket 断开时只影响操作台，不影响录制节点。

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

## 实现状态与后续清单

下列核心边界已经实现；剩余条目是必须在 Humble、Rerun、LeRobot SDK 和真实设备
环境完成的集成验证，不应通过伪造依赖标记为成功：

1. `state_archive.py`（已接入）：用 `rosbag2_py` 的 `SequentialWriter` 以 `storage_id="mcap"` 建 topic、序列化消息并在收尾时关闭 writer；bag 记录时间取 receipt wall-clock 纳秒。session manifest 的成对 wall/monotonic 起始锚点供导出换算媒体时间轴；没有 `header.stamp` 的话题只可使用 receipt 时间。
2. `camera_workers.py`（已接入）：每路 ROS `Image` 回调只把原始消息放入独立有界队列，JPEG 编码和落盘均在 archive worker 中执行；暂停产生媒体间隙并写入 `media-index.json`。低清预览使用另一个限 FPS、限分辨率、只保留最新 JPEG 的 worker。遗留 RTSP/ffmpeg helper 仅用于迁移，不是 recorder 的运行路径。
3. `web_server.py` 与 `static/index.html`（已接入）：预览使用独立 endpoint；只读 Three.js/URDF 三臂 viewer 已实现（参考 web_control 的 urdf-loader 方案，把 `/l|m|r/joint_states` 实时套到 URDF 模型）。它只提供 `/api/layout`、`/preview/<camera>.jpg`、`/models/*` 与 `/ws`，不提供 dataset/replay API；前端源在 `web/`，经 `npm run build:recording`（Vite，`config/recording/vite.config.mjs`）构建到 `static/`。
4. `lerobot_exporter.py`：ADOPT 后在 ROS executor 外读取 MCAP/JPEG，以配置的 SYSTEM_TIME 网格对齐，使用 `lerobot==0.6.1` 追加 canonical v3 episode。它保存关节位置/派生速度、URDF FK EE pose/velocity、夹爪位置、真实 Cartesian command 和 quality；不会把 π0.5 的 state/action 向量当作原始事实。SDK 读回仍需容器验证。
5. `replay.py`（已并入 `realman_recording` 包）：Rerun 从 receipt 指定的 canonical LeRobot 单 episode 读取低维数据和视频，而不是回退 raw MCAP/JPEG；它展示 canonical field，不假设某一模型的 state/action layout。
6. 待完成集成验证：真实相机、磁盘满、WebSocket 慢客户端、暂停/恢复、崩溃恢复、Service adopt/discard 和 LeRobot 读回。

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

## 真实 ROS 图只读探针

在工控机或 Humble 容器中可用 `recording_runtime_probe` 检查录制服务是否存在、图像/机械臂/夹爪 topic 是否持续到达及其接收频率。该命令只创建订阅和 service client，从不发送 `ManageRecording` 请求，因此不会改变录制状态：

```bash
source /opt/ros/humble/setup.bash
source /opt/rm65_ws/install/setup.bash
ROS_DOMAIN_ID=65 recording_runtime_probe --duration-sec 5 \
  --image-topic /camera_left/color/image_raw \
  --image-topic /camera_middle/color/image_raw \
  --image-topic /camera_right/color/image_raw \
  --image-topic /camera_global/d435/color/image_raw \
  --arm-topic /l/joint_states --arm-topic /m/joint_states --arm-topic /r/joint_states \
  --gripper-topic /gripper_left/position \
  --gripper-topic /gripper_mid/position \
  --gripper-topic /gripper_right/position
```

输出为 JSON，包含 `/recording/manage` 是否可用、最近的 `RecordingStatus`、每个 topic 的样本数和接收频率；服务不可用时退出码为 `2`。实际 topic 名称应以 `ros2 topic list` 和 `config/ros/recording.yaml` 为准。该探针不能替代 PREPARE：PREPARE 仍负责新鲜度、连接状态、磁盘、MCAP backend 和配置化 `preflight_required_topics` 的准入判断。

真机部署还必须确认运行中的节点已经切换到当前接口。执行 `ros2 node info
/recording_recorder` 时应看到 `/recording/manage` Service，不能再看到旧的
`/recording/manage_session` Action；若旧 Action 仍存在，表示工控机仍在运行旧的
install，需要重新构建并 source `realman_recording` 与 `realman_recording_msgs`。
相机健康也不能只依据 publisher 数量：应同时读取每路 Orbbec 的
`/<camera>/device_status`，确认 `device_online=true` 且
`color_frame_rate_cur>0`，再确认 `color/image_raw` 能收到真实帧。多路相机全部降为
USB2 480M 时可能出现节点存在但某一路实际帧率为 0 的带宽问题；应先恢复独立 USB3
链路，再运行 recorder PREPARE。
