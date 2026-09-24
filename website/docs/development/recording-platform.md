---
title: 独立数据录制平台
description: RealMan 驱动输出的隔离录制、预检、低清展示与 LeRobot 导出边界。
---

# 独立数据录制平台

`realman_recording` 是一个**订阅式数据录制与回放** ROS 2 节点组：它只订阅已有的驱动与夹爪输出，不创建 `Robotic_Arm`/RealMan SDK 客户端，也不发布机械臂运动命令。`./rm65 up` 通过 `realman_recording` 容器随生产 ROS 图一起启动它（默认开启）；正常实时展示继续由 `realman_web_control` 提供。recording 自带网页仅用于录制与已导出 episode 的只读回放，不发起任何录制控制；上游系统通过 `/recording/manage` Service 控制录制生命周期，不能复用或代理 `realman_web_control` 的运动面板。

录制和数据集转换是两个阶段：停止时只原子收尾原始 MCAP/JPEG 帧 session；上游明确采用后才会请求独立 LeRobot worker。转换占用的 CPU、GPU、图像解码或失败均不得减慢下一次 ROS 数据录制。

MCAP 状态写入、ROS `Image` 有界 JPEG 录制、低清 JPEG 预览、夹爪/相机健康状态、Three.js/URDF 三臂展示、预检和预约控制已经接入。`ADOPT` 会在 ROS executor 外把完成 session 异步转换为 `lerobot==0.4.4` 的 canonical v3 episode；失败会持久化为 `FAILED`，不会伪造成功的数据集。
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

网页三维部分只提取 `realman_web_control` 的 Three.js/URDF 实时关节模型；不得带入运动控制按钮、动作协议或 SDK 调用。实时页只读订阅 ROS 快照；回放页采用 LeRobot Studio 风格的工作台布局：左侧 episode 侧栏、中央同步相机拼图与播放时间轴、右侧 Canonical 字段图表/raw inspector，下方显示与帧同步的 3D、关节和夹爪组件。采用深色中性底色与蓝色交互强调；实时监控页布局不变。回放通过 `/api/lerobot`、`/api/lerobot/<session>/summary`、`/api/lerobot/<session>/frames` 和相机 JPEG endpoint 读取已导出的 LeRobot v3 episode。回放绝对时间根据 receipt 的 `first_walltime_ns`、帧索引和固定 `fps` 网格重建，不以 LeRobot 浮点 `timestamp` 反推；单个源时间戳可用该帧策略时间加 `quality.sync_error_ns` 中对应 source 的偏差恢复。摘要将 receipt 的 `quality_sync_source_ids` 暴露给字段检视器，为同步误差向量显示相机/topic 名；帧 API 提供 `source_timestamps_ns` 十进制字符串映射，保留 Unix epoch 纳秒的整数精度。source ID 与向量宽度不一致时拒绝返回猜测结果。Rerun 离线回放不属于当前验收范围。
向量字段检视器提供独立分量选择，时间序列和当前帧 selected value 同步更新；joint、EE pose/velocity、Cartesian command 优先用 receipt 中的关节名和 frame 为分量命名，其他向量显示索引。
帧 API 根据数据集 schema 动态返回所有非图像标量/向量字段，包含可选 `action.command.gripper`，因此后续追加数值或布尔 Canonical feature 时不需再为每个字段修改 API；图像仍通过独立的按需 JPEG endpoint 读取。

LeRobot v3 的每个向量 feature 都在 `features.<key>.names` 中声明分量名，作为 Studio 风格检视器的维度标签唯一优先来源：关节按配置的机械臂顺序展开为 `<arm>.<joint>`，末端位姿按 `x/y/z/qx/qy/qz/qw` 展开，末端速度与笛卡尔速度按 `vx/vy/vz/wx/wy/wz` 展开，夹爪使用 topic namespace 名称，同步误差使用 `quality_sync_source_ids` 顺序。回放前端先读 feature metadata；旧数据没有 `names` 时才从 receipt canonical metadata 推导兼容标签。布尔质量字段在原始值检视器中仍显示 `true/false`，图表按 `1/0` 绘制。

此行为参考 [LeRobot Studio 的图表数据模型](https://github.com/ioai-tech/lerobot-studio/blob/main/src/react/components/panels/ChartPanel/chartPanelModel.ts)：保留其 feature metadata 驱动维度命名、任意 observation/action 数值字段进入检视器的做法，但沿用本项目现有 Web 工作台和 `/api/lerobot` 只读 API，不引入 Studio 的 React 应用或额外服务。
回放相机 JPEG 按请求生成并缩放至 640×360、quality 65；这只影响 Web 预览传输，不修改 LeRobot 原视频。

## ROS 接口

节点名为 `/recording_recorder` 与 `/recording_web_bridge`。前者订阅如下已有输出：

- `/<arm>/joint_states` (`sensor_msgs/msg/JointState`)
- `/<arm>/connected` (`std_msgs/msg/Bool`)
- `/<arm>/coordinates/state` (`std_msgs/msg/String`)
- `arm_action_topics` 中配置的 `geometry_msgs/msg/TwistStamped` 控制目标（只读采集）
- `/tf` (`tf2_msgs/msg/TFMessage`)
- `gripper_*_topics` 中配置的夹爪位置、力矩到位与告警话题。

两个 ROS 节点的订阅实体由 `rclpy.Node` 自身登记和销毁；不要覆盖或重复 append
`self._subscriptions`。在 Humble 中重复登记同一个 Subscription 会导致节点退出时二次销毁并抛出异常。

`/recording/manage` 是唯一的会话控制入口，类型为 `realman_recording_msgs/srv/ManageRecording`。录制平台不提供 `recording/manage_session` Action；网页也只读取状态，不发起录制控制：

| 命令 | 所需字段 | 行为 |
| --- | --- | --- |
| `PREPARE` | 可选 `record_cameras`（默认应为 `true`） | 只返回所有设备预检诊断，不创建 session；供上游在 START 前展示/诊断。 |
| `START` | `profile`，可选 `task`、`duration_sec`、`record_cameras`、`start_at_walltime_ns` | 服务端始终自行执行与本次请求相符的预检；独立 `PREPARE` 不是强制前置。零时间戳立即开始，非零时间戳预约到 ROS 2 `SYSTEM_TIME`，届时自动重新预检。 |
| `STOP` | 无 | 停止当前原始录制并收尾 MCAP。 |
| `ADOPT` | `session_id` | 仅接受 `READY` 且无 MCAP 写错误的 session；立刻返回，并异步请求 LeRobot 转换。导出器完成前，该任务会明确记录失败而非伪造数据集。 |
| `DISCARD` | `session_id` | 标记 session 为 `DISCARDED`，禁止导出；原始文件保留用于审计和人工复核。 |

Service 的采用返回表示“导出任务已接受”，不是“数据集已生成”。最终状态存于对应 `manifest.json` 的 `export.state`（`QUEUED`、`RUNNING`、`SUCCEEDED` 或 `FAILED`）。在 LeRobot 导出器落地前，`FAILED` 是预期且诚实的结果。

所有 raw receipt、MCAP record time，以及 session 创建/结束、ADOPT 和导出审计字段都使用 ROS 2 `SYSTEM_TIME` epoch nanoseconds；仅倒计时使用本地单调时钟，不能用于跨传感器或离线数据对齐。

相机 JPEG 有界队列的 `dropped` 是可审计的质量指标，不会阻塞采集；但 JPEG 编码或文件写入的 `errors` 是 durability failure。任一路出现该错误，STOP 会将 session 标记为 `FAILED`，因而不能 ADOPT/export。

session manifest、相机 `media-index.json` 和 LeRobot `lerobot-v3.json` receipt 都采用原子 JSON 替换；掉电或进程中断不会留下被回放器当作有效结果的截断 JSON。

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
- `cartesian_command_frames` 必须与上游 `TwistStamped.header.frame_id` 一致；当前三臂控制器使用
  `l/m/r/work/cell`，若控制器切换 base/tool frame，必须同步修改配置，导出器会拒绝混用；
- `preview_*` 是 Web 独立预览限制，`preview_enabled=true` 才启动低清 JPEG 重压缩 worker；
- LeRobot Web 回放已接入；Rerun 离线回放暂缓，不影响实时展示、原始数据录制或 LeRobot 导出。

默认随 `./rm65 up` 一起启动（`realman_recording` 容器）；回放页在 `http://127.0.0.1:8770/`。Compose 将仓库
`recordings/` 挂载为容器 `/data/realman-recordings`，同时保留 `logs/` 挂载。网页默认绑定 `127.0.0.1:8770`，
在认证与反向代理完成前不要直接暴露到不可信网络。

仅需录制测试、且已有驱动 ROS 图运行时，也可单独启动：

```bash
source install/setup.bash
ros2 launch realman_recording recording.launch.py \
  recording_root:=/absolute/path/to/sessions
```

独立容器入口为：

```bash
docker compose up realman_recording
```

独立 launch 会创建 `logs/YYYYMMDD_HHMMSS/` 并设置 ROS 2 官方节点日志目录；使用 rcutils 彩色输出，不应添加自定义日志重定向。

## 实现状态与后续清单

下列核心边界已经实现；剩余条目是必须在 Humble、LeRobot SDK 和真实设备
环境完成的集成验证，不应通过伪造依赖标记为成功：

1. `state_archive.py`（已接入）：用 `rosbag2_py` 的 `SequentialWriter` 以 `storage_id="mcap"` 建 topic、序列化消息并在收尾时关闭 writer；bag 记录时间取 receipt wall-clock 纳秒。session manifest 的成对 wall/monotonic 起始锚点供导出换算媒体时间轴；没有 `header.stamp` 的话题只可使用 receipt 时间。
2. `camera_workers.py`（已接入）：每路 ROS `Image` 回调只把原始消息放入独立有界队列，JPEG 编码和落盘均在 archive worker 中执行；STOP 时按每帧 receipt 及每路 `accepted/dropped/errors` 统计写入 `media-index.json`。低清预览使用另一个限 FPS、限分辨率、只保留最新 JPEG 的 worker。录制平台不支持 RTSP/ffmpeg 输入。
3. `web_server.py` 与 `static/index.html`（已接入）：预览使用独立 endpoint；只读 Three.js/URDF 三臂 viewer 已实现（参考 web_control 的 urdf-loader 方案，把 `/l|m|r/joint_states` 实时套到 URDF 模型）。回放页只读取已完成的 LeRobot v3，前端源在 `web/`，经 `npm run build:recording`（Vite，`config/recording/vite.config.mjs`）构建到 `static/`。
4. `lerobot_exporter.py`：ADOPT 后在 ROS executor 外读取 MCAP/JPEG，以配置的 SYSTEM_TIME 网格对齐，使用 `lerobot==0.4.4` 追加 canonical v3 episode。它保存关节位置/派生速度、URDF FK EE pose/velocity、夹爪位置、真实 Cartesian command 和 quality；不会把 π0.5 的 state/action 向量当作原始事实。集合导出目录会按 `repo_id` 选择稳定子目录，已初始化的 `meta/info.json` 则原地续写。训练读取图像时应显式选择 `video_backend=\"pyav\"`；当前容器已验证 SDK reload 和 π0.5 adapter smoke，OpenPI one-batch 仍待训练环境。
5. `lerobot_web_replay.py`：提供只读 LeRobot episode catalog 和按需图像解码；默认最多缓存 4 个空闲 dataset 句柄，按 LRU 淘汰；同一 episode 的 SDK 读取经独立锁串行化，正在使用的句柄固定到读取结束。高并发时活跃句柄可令缓存暂时超过 4 个，读操作结束后重新收敛。Web handler 将 SDK 读取和 JPEG 解码移到工作线程，避免慢回放请求阻塞实时快照；`replay.py`（已并入 `realman_recording` 包）仍是后续 Rerun 回放实验骨架，当前不作为验收路径。
6. 已在工控机临时 recording 容器完成 colcon、recorder/Web bridge 启动、`/healthz`、空数据集 `/api/lerobot`、失败 PREPARE 边界和 Domain 65 下 3 秒 state-only MCAP 录制（819 条消息、无 drop/write error）；另有隔离 ROS graph 的合成 Service→MCAP→DISCARD 集成测试、SIGKILL 活跃 recorder 后由新 recorder ROS 节点恢复 manifest 的进程级测试，以及用 LeRobot SDK fixture 完成 HTTP list/summary/frame/JPEG 回读。WebSocket 慢客户端自动回归使用独立 asyncio loop 和阻塞 client，验证 producer 非阻塞、快照合并及超时清理。待真机验收包括四路相机成功录制和真实 episode ADOPT/导出/回放；待故障注入包括真实磁盘耗尽（当前仅有 writer `OSError` 注入）。

`recording-test` 增量镜像的权威构建定义为仓库根目录 `config/docker/recording-test.Dockerfile`，
它基于已有 `rm65-humble-rviz:local`，安装 MCAP storage plugin、CPU PyTorch、LeRobot、Pillow 与 PyArrow，
并只构建 recording ROS 包。构建命令：

```bash
docker build --network=host -f config/docker/recording-test.Dockerfile -t rm65-recording:verified .
```

大型 PyTorch/LeRobot wheel 的单连接读取超时默认为 300 秒；受限网络可用
`--build-arg PIP_NETWORK_TIMEOUT=<秒>` 调整。构建完成后，容器中 `ros2 bag list storage`
必须包含 `mcap`，并且 recording 测试通过后才更新 `rm65-recording:test` tag。

当工控机上的 `rm65-recording:test` 已有上述依赖、只需要同步本地 recording 源码时，可用
`config/docker/recording-test-refresh.Dockerfile` 做快速源码刷新：它以当前测试镜像为 base，复制 recording
源码与 ROS 配置后重建两个 recording 包，不重新安装系统/ML 依赖。该 refresh 镜像不独立可复现，不能替代完整构建；
新 tag 必须通过完整 recording 测试后才能更新为 `rm65-recording:test`。

```bash
docker build --network=host \
  -f config/docker/recording-test-refresh.Dockerfile \
  -t rm65-recording:verified .
```

启动前用 `ros2 bag list storage | grep -x mcap` 检查插件；回放/导出环境还需确认 Python 能导入
`lerobot`、`PIL` 和 `pyarrow`。如果宿主 Docker 网络能够正常解析镜像域名，可省略 `--network=host`。

在安装了 `website/` npm 依赖和 Playwright Chromium 的开发机上，可运行回放浏览器回归（桌面与窄屏各一例）：

```bash
cd website
node_modules/.bin/playwright test --config ../config/recording/playwright.config.mjs
```

## LeRobot 对齐策略（以图像为基准）

不同数据流频率不同，导出以图像曝光/到达时间戳为主轴，逐帧反推其余流。MCAP 的记录时间是 ROS 2 callback receipt wall time；session manifest 保存同一时刻的 wall/monotonic 锚点，导出器在需要媒体单调时间轴时从该映射换算：

| 数据种类 | 典型频率 | 对齐策略 |
| --- | --- | --- |
| 图像（RGB） | 每路 15 Hz（当前配置） | 基准（anchor），导出帧时间轴；四路相机不会合并成 60 Hz。 |
| 机械臂（State/Action） | 约 10 Hz（当前驱动） | 线性插值；仅在相邻样本间隔不超过 `max_gap_ns` 时允许。 |
| 夹爪（Gripper） | 约 20 Hz（当前驱动） | 开关量默认 `FORWARD_FILL`（最后一个因果状态）；可显式选 `NEAREST`；连续力控夹爪用线性插值。 |

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

实现完成后应在 Humble 容器运行 `colcon build`/`colcon test`，然后确认：MCAP 可由 rosbag2 读取、JPEG 帧与 media-index receipt 一致、关闭浏览器不会增加状态队列丢失、导出的 LeRobot 数据集可被目标版本加载。

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
  --gripper-topic /gripper_right/position \
  --device-status-topic /camera_left/device_status \
  --device-status-topic /camera_middle/device_status \
  --device-status-topic /camera_right/device_status
```

输出为 JSON，包含 `/recording/manage` 是否可用、最近的 `RecordingStatus`、每个 topic 的样本数和接收频率；服务不可用时退出码为 `2`。实际 topic 名称应以 `ros2 topic list` 和 `config/ros/recording.yaml` 为准。该探针不能替代 PREPARE：PREPARE 仍负责新鲜度、连接状态、磁盘、MCAP backend 和配置化 `preflight_required_topics` 的准入判断。

`--device-status-topic` 仅用于 Orbbec 的可选诊断，输出每路 `device_online`、
`connection_type` 和 `color_frame_rate_cur`；D435 不提供该消息时不要传此参数。

真机部署还必须确认运行中的节点已经切换到当前接口。执行 `ros2 node info
/recording_recorder` 时应看到 `/recording/manage` Service，不能再看到旧的
`/recording/manage_session` Action；若旧 Action 仍存在，表示工控机仍在运行旧的
install，需要重新构建并 source `realman_recording` 与 `realman_recording_msgs`。
相机健康也不能只依据 publisher 数量：应同时读取每路 Orbbec 的
`/<camera>/device_status`，确认 `device_online=true` 且
`color_frame_rate_cur>0`，再确认 `color/image_raw` 能收到真实帧。多路相机全部降为
USB2 480M 时可能出现节点存在但某一路实际帧率为 0 的带宽问题；应先恢复独立 USB3
链路，再运行 recorder PREPARE。
