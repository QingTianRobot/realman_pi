# src/sensor/realsense — 全局 RealSense D435 的 ROS2 vendor

本目录提供全局相机 RealSense D435 的**原生 ROS2 节点**驱动（`realsense2_camera`），
供 `sensor_bringup/launch/cameras_ros2.launch.py` 通过薄包装
`realsense_d435.launch.py` 调用，与三路 Orbbec 一起走 ROS2 节点出图。

相机出图主线是 ROS2 节点（非 `src/camera_stream` 的 RTSP 推流，后者已弃用）。

## 目录结构（git 子模块）

- `librealsense/`：Intel RealSense SDK（子模块，需先构建/安装 `librealsense2`）。
- `realsense_ws/src/realsense-ros/`：ROS2 驱动（子模块），构建后提供 `realsense2_camera`。
- `realsense_ws/install/setup.{sh,bash}`：colcon 构建产物 overlay，由启动入口 source。

## 构建

```bash
cd src/sensor/realsense
git submodule update --init --recursive          # 拉取 librealsense 与 realsense-ros
# 按 librealsense 官方文档安装 SDK（提供 librealsense2）：
#   https://github.com/IntelRealSense/librealsense/blob/master/doc/installation.md
cd realsense_ws
source /opt/ros/humble/setup.bash
colcon build --symlink-install
```

## 启动（推荐用统一入口，勿单独起）

统一入口会自动 source 本 overlay，并在缺包时优雅降级：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_camera_ros2 color          # 三路 Orbbec + 全局 D435（缺 realsense2_camera 时自动仅 Orbbec）
```

或等价的 bash 入口：`bash start_sensors.sh`。

D435 的串号、profile、命名空间（默认 `camera_global/d435`）和安装位姿（world→`d435_link`
静态 TF）在 `config/ros/cameras_ros2.yaml` 的 `global_camera` 段配置。

## 降级与排障

- 未初始化/未构建子模块时，`ros2 pkg prefix realsense2_camera` 失败，
  `rm65_camera_ros2` / `start_sensors.sh` 会自动追加 `use_realsense:=false`，
  三路 Orbbec 仍正常启动，不会导致整个 launch 失败。
- 也可用环境变量 `REALMAN_REALSENSE_ROS2_SETUP` 指定自定义的 `install/setup.sh`。
- 当前生产为 USB2 拓扑，D435 默认彩色 `424x240x15`、深度关闭；接入 USB3 后可在
  `global_camera` 段上调 profile 并开启深度。

## 参考

- librealsense 安装：https://github.com/IntelRealSense/librealsense#installation-guide
- realsense-ros：https://github.com/IntelRealSense/realsense-ros
