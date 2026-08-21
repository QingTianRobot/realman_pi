---
title: 三臂 ChArUco 手眼标定
description: 通过 ROS service 原子采样三臂图像/末端 TF，并求解三套手眼和相对位姿。
---

# 三臂 ChArUco 手眼标定

`realman_camera_calibration` 位于 `src/sensor/`，与厂商相机驱动源码隔离。
它通过两个 service 提供一个小而稳定的标定接口，网页只负责发起任务和展示
结果；话题、TF、ChArUco 尺寸、样本门槛和误差阈值全部由
[`config/ros/camera_calibration.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/camera_calibration.yaml) 掌管。

当前实体标定板为 `CC200-15-11.25`：外形尺寸 200 x 150 mm，图案区域
180 x 135 mm，12 x 9 个棋盘格，大格边长 15 mm、小格（marker）边长
11.25 mm，字典为 `DICT_5X5_100`。配置中的长度统一使用米：
`square_length_m: 0.015`、`marker_length_m: 0.01125`。

## 数据流和坐标约定

每个相机配置一个 `arm_id`，每个机械臂配置 `base_frame` 和
`end_effector_frame`。采样时使用图像时间戳查询
`lookup_transform(base_frame, end_effector_frame, image_stamp)`，得到
`T_base_tool`；ChArUco `solvePnP` 得到 `T_camera_board`。求解阶段使用
OpenCV eye-in-hand 约定，求得 `T_tool_camera`，并计算：

```text
T_base_board = T_base_tool · T_tool_camera · T_camera_board
T_base_l_base_m = T_base_l_board · inverse(T_base_m_board)
```

结果中 `tool_to_camera`、`base_to_board` 和 `relative_base_poses` 都是 4×4
齐次矩阵，矩阵左乘列向量。当前只保存和返回结果，不自动发布静态 TF；审核
结果后再接入 TF 发布器，避免错误标定污染机器人 TF 树。

## 两个 ROS service

### `CaptureCalibrationSample`

服务名：`/camera_calibration/capture_sample`

```text
string session_id
bool start_new_session
string[] arm_ids       # 必须包含 l、m、r
---
bool success
string session_id
string batch_id
string[] captured_arm_ids
uint32[] sample_counts
string[] sample_ids
string[] image_paths
string[] preview_image_paths
string[] latest_image_paths
string[] detection_statuses
string[] detection_messages
string message
```

调用一次会同时检查三路最新图像和 `CameraInfo`、ChArUco 角点数、图像时间
偏差和三个末端 TF。每次尝试都会把三路最近画面保存到 session 的 `attempts/` 目录并返回
`latest_image_paths`、`detection_statuses`、`detection_messages`，即使检测失败也能在网页查看
哪一路没有看到标定板。任一路失败，整批不写入；全部通过后才保存三张原始 PNG、
三张检测预览 PNG 和对应 JSON 样本。预览图叠加 ChArUco 角点/ID、棋盘坐标轴和
重投影误差，便于确认板子确实被检测到。第一次调用设置 `start_new_session: true`，后续调用复用返回
的 `session_id`。节点重启后，填写磁盘中已有的 `session-...` ID 可以恢复该
会话的 JSON 样本并继续采样。

### `SolveCalibration`

服务名：`/camera_calibration/solve`

```text
string session_id
---
bool success
bool all_arms_solved
string session_id
string result_file
string result_json
float64 mean_reprojection_error_px
uint32[] sample_counts
bool layout_updated
string layout_backup_file
string message
```

响应会回显实际求解的 `session_id`，便于网页在重连后关联结果文件。求解强制 `l/m/r` 都达到 `minimum_samples_per_arm`，并检查手眼残差和相对
位姿离散度。任何一臂失败都会返回 `success: false`，不会生成“部分成功”的
结果。成功时 `result_json` 与 `result_file` 内容一致，包含三套手眼矩阵和
以左臂为参考的中、右臂相对位姿。默认最低数量为每臂 30 张，没有采样上限；
求解器使用会话中全部已接受样本，而不是只取前 30 张。最终 `base_to_board`
使用所有样本对应板位姿的均值，以降低随机测量误差。

默认情况下，求解成功后会自动更新 [`config/ros/three_robots.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/three_robots.yaml)：
左臂的布局保持不变，使用标定得到的左到中、左到右基座相对变换更新中臂和
右臂的 `x/y/z/roll/pitch/yaw`。原文件会保留为同目录的 `.bak` 文件，结果中
`layout_update` 记录实际写入路径和备份路径。写回失败时 service 返回失败，
不会报告“标定成功”。布局文件会影响下一次 bringup；当前运行中的
`static_transform_publisher` 不会被自动重启。

## 构建、启动和命令行验证

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install \
  --packages-up-to realman_camera_calibration realman_web_control
source install/setup.bash

run_dir="$PWD/logs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$run_dir"
REALMAN_CONFIG_ROOT="$PWD/config" ROS_LOG_DIR="$run_dir" \
  RCUTILS_COLORIZED_OUTPUT=1 \
  ros2 launch realman_camera_calibration camera_calibration.launch.py
```

如需只计算而不修改布局，可在启动时设置：

```bash
ros2 launch realman_camera_calibration camera_calibration.launch.py \
  update_layout_after_solve:=false
```

写回使用同目录临时文件和原子替换。Docker 生产服务把
`/opt/rm65_ws/config/ros/` 子目录单独挂载为可写，以便创建临时文件和 `.bak`；
标定节点只会修改其中的 `three_robots.yaml`。

手工调用：

```bash
ros2 service call /camera_calibration/capture_sample \
  realman_msgs/srv/CaptureCalibrationSample \
  "{session_id: '', start_new_session: true, arm_ids: [l, m, r]}"

ros2 service call /camera_calibration/solve \
  realman_msgs/srv/SolveCalibration "{session_id: 'session-...'}"
```

服务节点发布 `/camera_calibration/diagnostics`。结果和图像位于
`REALMAN_LOG_ROOT/camera_calibration/<session_id>/`，不写入只读 `config/`。
每一批先写入隐藏的临时目录，三个相机文件都成功后才提交到会话目录；因此
单路写盘失败不会增加样本计数。不要手动修改样本 JSON，否则恢复会话时该文件
会被跳过或导致请求失败。

### 相机输入健康状态

标定节点每秒发布 `/camera_calibration/camera_health`（`std_msgs/String` JSON），供
网页显示而不影响采样。每路输入包含 Image/`CameraInfo` 是否收到、接收后帧年龄、
源时间戳到节点时钟的延迟、Image 与 `CameraInfo` 的时间戳偏差及图像分辨率。状态定义为：

- `healthy`：两类消息都收到且通过新鲜度、延迟和时间偏差阈值；
- `missing`：尚未收到 Image 或 `CameraInfo`；
- `stale`：任一消息的接收年龄超过 `maximum_message_age_sec`；
- `delayed`：Image 时间戳延迟超过 `maximum_timestamp_delay_sec`；
- `unsynchronized`：Image 和 `CameraInfo` 时间偏差超过
  `maximum_inter_camera_skew_sec`。

这些阈值均位于 `config/ros/camera_calibration.yaml` 的 `sampling` 下。标定页面
实时显示三张状态卡；当任一输入不健康时应先排查相机、DDS、USB 带宽或系统时钟，再采样。

`missing` 表示标定节点从未收到相应的 Image 或 `CameraInfo`，并不等于相机未被枚举。生产端先在
宿主机执行 `rm65_camera_ros2 color`，再确认 `.env` 的 `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY=0`
和 `FASTDDS_BUILTIN_TRANSPORTS=UDPv4` 已被该 shell 和 Docker 服务共同加载。最后重启
`realman_bringup_remote`，使标定节点取得新环境。若主机 `ros2 topic hz /camera_left/color/image_raw`
有帧而网页仍是 `missing`，这是宿主 Orbbec overlay 与容器 Fast DDS 同机共享内存不兼容的典型
现象；保留 `UDPv4`，不要改为 `DEFAULT`。

## Web 标定页面

启动 `realman_web_control` 后访问：

```text
http://<工控机>:8765/calibration.html
```

页面通过同一个认证 WebSocket 发送 `capture_calibration_sample` 和
`solve_calibration` 消息，实时显示采样计数、失败原因、求解进度和最终 JSON。
每次点击采样后，“最近一次检测画面”区域都会显示左/中/右三路画面；成功时显示角点预览，
失败时显示原始最近画面，并明确标注哪一路“未检测到 ChArUco”。图片通过
`/api/calibration/preview/<relative-log-path>` 提供，只允许读取
`REALMAN_LOG_ROOT` 下的 PNG/JPEG 文件。
控制页面顶部的“相机标定”链接可直接进入该页面；它与机械臂运动控制页面
分离，不会在标定界面发送 MOVEJ/MOVEL。

“历史会话”下拉框通过 `GET /api/calibration/sessions` 读取
`REALMAN_LOG_ROOT/camera_calibration/` 下名称合法的 `session-*` 目录。每项显示 l/m/r
的已接受样本数以及是否已有 `calibration_result.json`；点击“加载所选会话”会将其填入
`Session ID`、关闭“新建会话”，此后“执行三臂手眼标定”只会把这个明确的 `session_id`
传给 `/camera_calibration/solve`。因此可以在节点或网页重启后复核并重新求解历史采样，
而不会误建一个空会话。列表不暴露绝对路径，也不会把历史图片自动下载到浏览器。

## 配置和已知限制

- `board.dictionary`、网格尺寸和两种边长必须与实体 ChArUco 板一致；
  `marker_length_m < square_length_m`。
- 默认末端帧为 `l/m/r/link_6`。如果真实 TF 使用法兰或工具帧，必须在配置中
  改为实际存在的帧，不能靠网页覆盖。
- 当前实现假定每个相机是对应机械臂的 eye-in-hand 相机；若相机固定在工作台，
  应改用独立的固定相机外参模型，不可直接套用本 service。
- 旋转/平移运动必须有足够可观测性；满足三十个样本不代表一定可解。不要在
  同一个静止姿态连续采三十帧，应改变末端平移和各轴旋转，并检查残差、覆盖率
  和实际点云/TF 方向。

测试：

```bash
PYTHONPATH=src/sensor/realman_camera_calibration \
  pytest -q src/sensor/realman_camera_calibration/test
PYTHONPATH=src/driver/realman_web_control \
  pytest -q src/driver/realman_web_control/test
npm run build:web-control
npm run test:web-control -- --project=desktop tests/web-control/calibration.spec.ts
npm run build
```
