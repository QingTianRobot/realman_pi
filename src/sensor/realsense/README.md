# src/sensor/realsense — 全局 RealSense D435 的 ROS2 vendor

本目录提供全局相机 RealSense D435 的**原生 ROS2 节点**驱动（`realsense2_camera`），
供 `sensor_bringup/launch/cameras_ros2.launch.py` 通过薄包装
`realsense_d435.launch.py` 调用，与三路 Orbbec 一起走 ROS2 节点出图。

相机出图主线是 ROS2 节点（非 `src/camera_stream` 的 RTSP 推流，后者已弃用）。

## 目录结构（源码 vendor）

- `librealsense/`：Intel RealSense SDK 源码（v2.58.3），需从源码编译安装。
- `realsense_ws/src/realsense-ros/`：ROS2 驱动源码，colcon 构建后提供 `realsense2_camera`。
- `realsense_ws/install/setup.{sh,bash}`：colcon 构建产物 overlay，由启动入口 source。

> **注意**：`realsense2_camera` 的 CMakeLists 通过 `find_package(realsense2 2.58.0)`
> 查找**系统已安装**的 librealsense2，因此必须先完成 SDK 的编译安装。

## 构建

### 1. 编译安装 librealsense（SDK）

按照官方文档从源码编译，安装到系统路径（默认 `/usr/local`）：

```bash
cd src/sensor/realsense/librealsense

# 安装编译依赖（参考官方文档）
sudo apt-get install git cmake libssl-dev libusb-1.0-0-dev \
  libudev-dev pkg-config libgtk-3-dev libglfw3-dev libgl1-mesa-dev libglu1-mesa-dev

mkdir -p build && cd build
cmake .. -DBUILD_EXAMPLES=true -DBUILD_GRAPHICAL_EXAMPLES=false \
  -DBUILD_PYTHON_BINDINGS=false
make -j$(nproc)
sudo make install
sudo ldconfig
```

验证安装：

```bash
realsense-viewer --version   # 应输出 2.58.x
ls /usr/local/lib/librealsense2.so
```

> 官方编译文档：https://github.com/IntelRealSense/librealsense/blob/master/doc/installation.md
> 官方 Linux 构建指南：https://github.com/IntelRealSense/librealsense/blob/master/doc/build.md

### 2. 编译 realsense-ros（ROS2 驱动）

```bash
cd src/sensor/realsense/realsense_ws
source /opt/ros/humble/setup.bash
colcon build --symlink-install
```

构建产物位于 `realsense_ws/install/`，包含 `realsense2_camera`、
`realsense2_camera_msgs`、`realsense2_description` 三个包。

## 单独启动验证（确认出图）

构建完成后，建议先单独跑一次 RealSense 节点，确认硬件连接和驱动正常出图：

```bash
# 1. source ROS2 和 realsense_ws overlay
source /opt/ros/humble/setup.bash
source src/sensor/realsense/realsense_ws/install/local_setup.sh

# 2. 启动 D435 节点（默认彩色流 424x240x15，深度关闭）
ros2 launch realsense2_camera rs_launch.py \
  camera_namespace:=camera_global \
  camera_name:=d435 \
  enable_color:=true \
  enable_depth:=false \
  rgb_camera.color_profile:=424x240x15
```

在另一个终端验证 topic 有数据：

```bash
source /opt/ros/humble/setup.bash
source src/sensor/realsense/realsense_ws/install/setup.bash

# 查看 topic 列表
ros2 topic list | grep camera_global

# 检查彩色图像帧率（应接近 15 Hz）
ros2 topic hz /camera_global/d435/color/image_raw
```

看到稳定的帧率输出即说明 SDK 安装正确、相机硬件正常。确认无误后 `Ctrl+C` 停止，
再使用下方统一入口启动全部相机。

> **排障**：若提示 "No RealSense devices were found"，检查 USB 连接及
> `lsusb | grep Intel` 是否可见设备；若 `find_package(realsense2)` 报错，
> 说明步骤 1 的 SDK 未安装成功，重新执行 `sudo make install && sudo ldconfig`。

## 启动（推荐用统一入口，勿单独起）

统一入口会自动 source 本 overlay，./rm65 up 要求全局 D435 通道必须可用，缺少 overlay 时直接失败：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_camera_ros2 color          # 三路 Orbbec + 全局 D435（缺 realsense2_camera 时拒绝启动）
```

或等价的 bash 入口：`bash start_sensors.sh`。

D435 的串号、profile、命名空间（默认 `camera_global/d435`）和安装位姿（world→`d435_link`
静态 TF）在 `config/ros/cameras_ros2.yaml` 的 `global_camera` 段配置。

## 降级与排障

- 未编译安装 librealsense 或未构建 realsense_ws 时，`ros2 pkg prefix realsense2_camera` 失败，
  `rm65_camera_ros2` / `start_sensors.sh` / `./rm65 up` 会直接以非零退出，拒绝降级为仅 Orbbec，
  以免生产环境默默丢失全局 D435 通道。
- 也可用环境变量 `REALMAN_REALSENSE_ROS2_SETUP` 指定自定义的 `install/setup.sh`。
- 当前生产为 USB2 拓扑，D435 默认彩色 `424x240x15`、深度关闭；接入 USB3 后可在
  `global_camera` 段上调 profile 并开启深度。

## 参考

- librealsense 安装：https://github.com/IntelRealSense/librealsense#installation-guide
- realsense-ros：https://github.com/IntelRealSense/realsense-ros
