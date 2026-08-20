# camera_stream — 相机流抽离 + 局域网推流

把全局相机（RealSense D435）和手眼相机（Orbbec Gemini 305）的图像帧从 ROS2/DDS 里抽离，
改为 SDK 直读 + 局域网推流：彩色走 RTSP(H.264)，深度走独立 TCP 通道。ROS2 仅保留
CameraInfo/TF 元数据（由 `ros2_bridge.py` 发布），图像帧不再经过 ROS2。

```
RealSense D435 ──pyrealsense2──┐
                               ├─ 彩色 → libx264 H.264 → mediamtx RTSP :8554
Orbbec Gemini 305 ─pyorbbecsdk─┘          消费端 cv2.VideoCapture("rtsp://<ip>:8554/...")
                               └─ 深度 uint16 → TCP :8100 / :8101 / :8102 / :8103
ros2_bridge.py ── CameraInfo + 静态 TF（无图像）
```

## 1. 安装依赖（免 sudo）

```bash
cd src/camera_stream
./scripts/install_deps.sh
```

依赖说明：
- `pyrealsense2`：RealSense 的 Python 绑定（PyPI 直装）。
- `pyorbbecsdk2`（官方最新包名，模块名仍为 `pyorbbecsdk`）：Orbbec 的 Python 绑定，走 GitHub
  官方发布（PyPI 上只有旧版 1.3.2），且 wheel 声明了 open3d/pygame 等重依赖，故用 `--no-deps` 装本体。
- `av`（PyAV）：H.264 编码 + RTSP 推流。**注意：PyPI 的 av wheel 不含 NVENC**，默认用 `libx264`
  软件编码；要用 RTX 4080 的 NVENC 需自建 PyAV（`--enable-nvenc`）或改用 GStreamer
  `nvh264enc`（需 sudo 装 `gstreamer1.0-plugins-bad`）。
- `PyYAML`：读取 `config/*.yaml`；快捷入口会在启动前检查其模块名 `yaml`。
- `lz4`：可选，深度压缩。

mediamtx 单二进制由 `install_deps.sh` 下载到 `bin/`（需 curl + 可访问 github）。

## 2. 配置

- `config/realsense.yaml`：全局相机（串号、分辨率、RTSP 路径、深度端口）。
- `config/orbbec.yaml`：手眼相机。
- `config/camera_calibration.yaml`：内参/外参占位（桥发布用），标定后填入。

关键项：`camera.serial`（按串号锁定设备）、`color.*`（彩色分辨率/格式/编码/码率）、`depth.*`
（深度分辨率/端口/lz4）。Orbbec 支持多台：`orbbec.yaml` 里 `cameras` 下按 side 名
索引，`serial` 为空的 side 会自动跳过；共用参数在 `stream` 段。启动脚本会动态遍历
`cameras`，新增 side 只需在 YAML 中添加完整条目（包括唯一 `depth_port`）。默认彩色用
`format: MJPG`（压缩，兼容 USB 2.0），换 USB 3.0 后可改 `BGR`（无损）。

## 3. 启动 / 停止

从仓库任意目录加载根目录的 Zsh 快捷函数，也可以管理同一组脚本：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_camera_start
rm65_camera_status
rm65_camera_logs -f
rm65_camera_stop
```

这些函数运行在直接连接相机的宿主机上，不创建 Docker 容器；`rm65_camera_start` 会先
检查 `numpy`、`cv2`、`av`、`yaml`、`pyrealsense2` 和 `pyorbbecsdk`，缺少时提示执行
`scripts/install_deps.sh`。需要按组件查看日志时可使用：
`rm65_camera_logs mediamtx`、`rm65_camera_logs orbbec_left`、
`rm65_camera_logs orbbec_middle`、`rm65_camera_logs orbbec_right`、`rm65_camera_logs realsense_stream` 或
`rm65_camera_logs ros2_bridge`。

```bash
cd src/camera_stream
./scripts/start_streaming.sh    # 起 mediamtx + Orbbec + RealSense（错峰）+ 可选桥
./scripts/stop_streaming.sh  # 等待 SDK 退出；卡住时只强制停止相机进程
```

也可单独跑某个相机：

```bash
python3 -m camera_stream.realsense_stream config/realsense.yaml
python3 -m camera_stream.orbbec_stream   config/orbbec.yaml --side left   # 或 --side middle/right
python3 -m camera_stream.ros2_bridge     config/camera_calibration.yaml   # 需先 source ROS2
```

## 4. 消费端示例

```python
import cv2
from camera_stream.common.depth_client import DepthClient

# 彩色
cap = cv2.VideoCapture("rtsp://192.168.5.80:8554/realsense/color")
ok, frame = cap.read()

# 深度
cli = DepthClient("192.168.5.80", 8100)
depth, seq, ts_us = cli.recv()   # uint16 HxW ndarray
```

## 5. 注意事项

- **USB 带宽**：多台手眼 Gemini 305 在 USB 2.0（480M）上原始 BGR 彩色+深度会超带宽导致彩色饿死，
  所以默认用 `format: MJPG` 压缩彩色，并把三台并行深度降为 `320x240@15`。换 USB 3.0 口后可把
  `color.format` 改回 `BGR`（无损）并上调分辨率（1280x800@30 / 深度 640x400@30）。
- **设备独占**：推流进程直接打开 SDK，因此原来的 `realsense2_camera_node` / orbbec
  `component_container` 不能再同时运行。`sensor_bringup` 的 `cameras.launch.py` 应移除出图节点，
  只保留（或另起）`ros2_bridge.py` 出 CameraInfo/TF。
- **带宽**：多路彩色(H.264)+深度(uint16)满跑约数百 Mbps，走千兆网卡无压力；
  若带宽紧张可降深度分辨率或开 `depth.lz4_compress: true`。
