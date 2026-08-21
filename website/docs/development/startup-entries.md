---
title: 启动入口索引
description: functions.zsh 中每个项目启动、构建、测试和部署入口的当前用途、组件范围和权威配置。
---

# 启动入口索引

本页同步根目录 `functions.zsh` 的当前入口，面向需要选择启动方式、定位组件边界或维护 GitHub Pages 文档的开发者。这里记录**当前 main 分支的有效行为**，不按 commit 追加历史说明；每次修改 helper、Compose 服务、launch 参数或运行配置时，应在同一次提交中更新本页、`rm65_project_help` 和相关专题页。

::: tip 时效性
`functions.zsh` 只是快捷入口。最终行为以根目录 `config/`、ROS 2 launch 文件和 Compose 服务为准。本页优先链接到权威专题页，避免复制容易过期的参数细节。
:::

## 使用方式

```zsh
source /path/to/realman_pi/functions.zsh
rm65_project_help
```

所有 helper 都从 `functions.zsh` 所在位置定位仓库根目录，因此可以在任意目录调用。函数加载时会读取仓库根目录 `.env` 中的简单 `KEY=value` 配置，并保留当前终端已经显式设置的非空变量。函数不会自动写入 `~/.zshrc`，也不会隐藏底层 Docker、colcon、npm、SSH 命令；遇到未覆盖的参数时，继续直接调用底层命令。

## 项目入口

| 函数 | 当前用途 | 适用场景 | 权威来源 |
| --- | --- | --- | --- |
| `rm65_project_cd` | 切回仓库根目录。 | 在多个终端目录之间切换后，快速回到 `realman_pi` 执行 Compose、colcon 或网站命令。 | `functions.zsh` 中的 `RM65_PROJECT_ROOT` |
| `rm65_project_help` | 打印分组后的 helper 索引，并指向本页。 | 忘记入口名称或需要快速判断哪个服务适合当前任务时先运行。 | `functions.zsh` 本身与本页 |

## Docker 构建和模型查看

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_build [service ...]` | 从仓库根目录构建一个或多个 Compose 服务；不传参数时构建 `realman_bringup`。 | 只执行 Docker build，不启动 ROS 图。 | 首次运行、Dockerfile/依赖变化后，或切换镜像源后。 | `config/docker/compose.yaml`、`config/docker/ros2-humble-rviz.Dockerfile`、[系统 Bringup](./system-bringup#国内镜像与官方源切换) |
| `rm65_docker_rviz [model]` | 前台启动单臂 RViz 查看器，默认型号为 `RM65-B` 或当前 `RM65_MODEL`。 | `rm65_description/display.launch.py`、`rviz2`、单台 URDF/TF。 | 只检查某个 RM65 型号的 URDF、网格和关节树，不需要三臂布局。 | `src/rm65_description/urdf/`、[支持型号](../models/) |
| `rm65_docker_three_rviz` | 前台启动三臂 RViz 场景。 | `three_robots.launch.py`、三组 `/l` `/m` `/r` 描述、TF 和 RViz。 | 验证 `three_robots.yaml` 中三台机械臂的位置、朝向、命名空间和 TF 前缀。 | `config/ros/three_robots.yaml`、[三臂配置驱动可视化](./three-arm-visualization) |

## 独立测试入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_xbox_test` | 前台启动独立 Xbox 输入测试。 | SDL `game_controller_node`、`/input/joy`、`xbox_controller_node`；不启动三臂、驱动或 RViz。 | 先确认实体手柄、Linux input 权限、SDL 映射和按键边沿日志是否正常。 | `config/ros/xbox_controller.yaml`、[Xbox 手柄输入](./xbox-controller#独立实体手柄测试) |
| `rm65_docker_driver_test` | 前台启动三臂 mock 驱动测试。 | `/l` `/m` `/r` 三个 `realman_driver` mock 实例；不访问真实控制器。 | 没有机械臂时验证 ROS topic/service、mock 连接和关节状态发布。 | `config/ros/realman_driver_mock.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold#独立启动) |
| `rm65_docker_driver_rviz` | 前台启动真实三臂驱动和 RViz。 | 三台真实 `realman_driver`、三臂描述/TF、RViz；不启动 Joy 或 Xbox 输入。 | 已连接控制器网络时，只观察真实关节回读和模型姿态，不引入操作输入。 | `config/ros/realman_driver.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold) |

## Bringup 固定入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup` | 前台启动完整本地系统。 | 三臂描述/TF、真实驱动、RViz、SDL Joy、Xbox 输入；等待实体手柄。 | 本机同时连接显示环境、控制器网络和实体 Xbox 手柄时的完整联调。 | `config/docker/compose.yaml`、[系统 Bringup](./system-bringup#docker-服务) |
| `rm65_docker_bringup_remote` | 前台启动 headless 远程目标。 | 三臂描述/TF、真实驱动、Xbox 处理节点；不启动 Joy 设备读取和 RViz，可选 Web 控制。 | 工控机作为 ROS 图和真实 SDK 连接的运行端，桌面机另行启动远程 RViz。 | `realman_bringup_remote` 服务、[系统 Bringup](./system-bringup#远程验证) |

## Bringup 配置入口

`realman_bringup_custom` 把 `.env` 中的开关透传给 `realman_bringup/system.launch.py`。这些函数用于快速切换当前有效组合；每个 profile 都在子 shell 中设置变量，执行结束后不会污染当前终端环境。

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup_custom` | 前台运行 `.env` 参数化 bringup。 | 按 `REALMAN_START_*`、`REALMAN_USE_*` 和 `REALMAN_*_CONFIG_FILE` 创建组件。 | 需要试验 launch 组合，但不想编辑 Compose 文件时。 | `.env`、`config/docker/compose.yaml`、[系统 Bringup：参数化组合](./system-bringup#参数化组合) |
| `rm65_docker_bringup_custom_start` | 后台启动 `.env` 参数化 bringup 并打印服务状态。 | `docker compose up -d realman_bringup_custom`。 | 需要让组合在终端返回后继续运行，并通过 status/logs 管理生命周期。 | `realman_bringup_custom` 服务 |
| `rm65_docker_bringup_custom_stop` | 停止后台参数化 bringup。 | `docker compose stop realman_bringup_custom`。 | 结束后台 ROS 图；不会删除镜像或修改配置。 | `realman_bringup_custom` 服务 |
| `rm65_docker_bringup_custom_status` | 查看后台参数化 bringup 状态。 | `docker compose ps realman_bringup_custom`。 | 判断容器是否仍在运行。 | Docker Compose |
| `rm65_docker_bringup_custom_logs [-f]` | 查看最近 100 行或持续跟踪参数化 bringup 日志。 | `docker compose logs --tail=100 ... realman_bringup_custom`。 | 排查 launch、驱动、Web 控制或 DDS 连接问题；`-f` 只跟踪日志，不停止服务。 | Docker Compose 与 ROS 日志 |
| `rm65_docker_bringup_custom_args launch_arg:=value ...` | 临时把 launch 参数直接交给 `system.launch.py`。 | 使用图形版服务的挂载和设备配置，但不读取 `.env` profile。 | 一次性验证 `start_driver:=false use_rviz:=true` 等组合，不想改 `.env`。 | `realman_bringup/system.launch.py`、[系统 Bringup：启动入口](./system-bringup#启动入口) |

## Bringup profiles

| 函数 | 当前用途 | 组件组合 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_bringup_model` | 只显示配置中的机器人模型。 | `start_robots=true`、`start_driver=false`、`use_rviz=true`、输入和 Web 关闭。 | 离线检查三臂模型、TF 和 RViz，不连接真实机械臂。 | `config/ros/three_robots.yaml`、[三臂配置驱动可视化](./three-arm-visualization) |
| `rm65_docker_bringup_hardware` | 连接真实驱动并显示 RViz，不启用输入。 | `start_robots=true`、`start_driver=true`、`use_rviz=true`、Joy/Xbox/Web 关闭。 | 已接入控制器网络时，先验证真实关节回读与 RViz 显示。 | `config/ros/realman_driver.yaml`、[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold) |
| `rm65_docker_bringup_headless` | 启动真实驱动和 Xbox 处理节点，不显示 GUI。 | `start_robots=true`、`start_driver=true`、`start_controller=true`、`use_rviz=false`、Joy/Web 关闭。 | 远程主机上运行 headless ROS 图，并允许其他节点发布 `/input/joy`。 | [系统 Bringup](./system-bringup#典型启动组合) |
| `rm65_docker_bringup_input` | 只启动 Joy 和 Xbox 输入链。 | `start_robots=false`、`start_driver=false`、`start_joy_driver=true`、`start_controller=true`，等待设备。 | 独立验证实体手柄输入，不触碰机械臂或 RViz。 | `config/ros/xbox_controller.yaml`、[Xbox 手柄输入](./xbox-controller) |
| `rm65_docker_bringup_web` | 启动真实驱动和 Web 控制，不显示 RViz。 | `start_robots=true`、`start_driver=true`、`start_web_control=true`、RViz/Joy/Xbox 关闭。 | 工控机上提供浏览器 Action 控制和 URDF 状态影子。 | `config/ros/realman_web_control.yaml`、[WebSocket 浏览器控制与 URDF 影子](./realman-web-control) |

## Camera streaming

相机推流入口运行在**直接连接 USB 相机的宿主机**上，不是 Docker Compose 服务，也不属于
`realman_bringup` 容器。脚本直接调用 RealSense/Orbbec SDK，启动 `mediamtx`、配置中已填写
序列号的相机进程以及可选的 `ros2_bridge`。因此，同一台设备不能同时被旧的
`realsense2_camera_node` 或 Orbbec ROS 图像节点打开。

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_camera_start` | 检查 Python SDK 依赖后调用 `src/camera_stream/scripts/start_streaming.sh`。 | `mediamtx`、`realsense_stream`、`orbbec.yaml` 中所有 side；若主机有 `ros2`，还启动 `ros2_bridge`。 | 首次运行依赖安装完成、且需要向局域网提供相机彩色/深度流时。重复启动会被拒绝。 | `src/camera_stream/config/realsense.yaml`、`src/camera_stream/config/orbbec.yaml`、[相机流 README](https://github.com/QingTianRobot/realman_pi/blob/main/src/camera_stream/README.md) |
| `rm65_camera_stop` | 调用 `stop_streaming.sh` 停止相机流相关进程。 | 停止 Orbbec/RealSense 推流、`ros2_bridge` 和仓库 `bin/mediamtx`。 | 释放 USB 相机、修改配置或切换到其他相机节点前。 | `src/camera_stream/scripts/stop_streaming.sh` |
| `rm65_camera_status` | 打印配置路径、匹配的进程和监听端口。 | 只读检查相机进程、`mediamtx`、`ros2_bridge`，以及 RTSP `8554`/深度 `8100-8103`。 | 启动后确认服务是否真正监听，或排查端口/残留进程。 | `src/camera_stream/scripts/start_streaming.sh` |
| `rm65_camera_logs [-f] [component]` | 查看最近 100 行，或用 `-f` 持续跟踪 `src/camera_stream/log/*.log`。 | `all`、`mediamtx`、`orbbec_left`、`orbbec_middle`、`orbbec_right`、`realsense_stream`、`ros2_bridge`。 | 排查 SDK 初始化、串号不匹配、USB 带宽和推流错误。 | `src/camera_stream/log/` |
| `rm65_camera_ros2 [color|depth] [rviz]` | 停止 SDK 推流后，按串号启动三台 Orbbec 的单一 ROS2 图像流；默认 `color`，传入 `depth` 切换深度流，传入 `rviz` 时额外启动 RViz2。 | `sensor_bringup/cameras_ros2.launch.py`、`orbbec_camera/gemini305.launch.py`；发布所选 Image、CameraInfo 和 TF；`ROS_DOMAIN_ID` 和 `ROS_LOCALHOST_ONLY` 来自 `.env` 或当前环境。 | 需要原生 ROS image topic、`image_view` 或 RViz2 调试时；生产端无 GUI 时省略 `rviz`。 | `.env`、`config/ros/cameras_ros2.yaml`、`config/rviz/cameras.rviz` |
| `rm65_camera_ros2_stop` | 停止 ROS2 相机 launch、Orbbec 节点和组件容器。 | 释放三台 Orbbec USB 设备；不会启动或停止 RealMan 驱动。 | 在切回 `rm65_camera_start` SDK 推流或重新构建前。 | `src/sensor_bringup/launch/cameras_ros2.launch.py` |
| `rm65_camera_ros2_status` | 查看 ROS2 相机 launch、Orbbec 节点和日志根目录。 | 只读检查，不改变运行状态。 | 排查节点是否仍占用 USB 或确认 headless 启动是否成功。 | `logs/<timestamp>/` |
| `rm65_camera_ros2_logs` | 查看最近一次 ROS2 相机运行目录中的官方 ROS 日志。 | 读取 `ROS_LOG_DIR` 下节点日志，不做 shell 重定向。 | 排查串号匹配、depth profile 和 DDS 发现问题。 | `logs/<timestamp>/` |

首次使用先在宿主机安装依赖，再加载函数：

```bash
cd src/camera_stream
./scripts/install_deps.sh
```

日常操作：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_camera_start
rm65_camera_status
rm65_camera_logs -f
rm65_camera_stop
```

彩色帧由 `mediamtx` 提供 RTSP：

```text
rtsp://<host>:8554/realsense/color
rtsp://<host>:8554/orbbec/left/color
rtsp://<host>:8554/orbbec/middle/color
rtsp://<host>:8554/orbbec/right/color
```

深度帧通过 TCP `8100`（RealSense）、`8101`（Orbbec left）、`8102`（Orbbec middle）和
`8103`（Orbbec right）发送；
它们不是 ROS image topic。`ros2_bridge` 仅发布标定中的 `CameraInfo` 和静态 TF。
启动前应根据 `udevadm`、`lsusb` 或 `/dev/v4l/by-id` 的实际串号更新两个 YAML；空的
Orbbec `serial` 会跳过对应 side，错误串号则会在日志中报告找不到设备。

如果 `rm65_camera_start` 提示 `av`、`yaml`、`pyrealsense2` 或 `pyorbbecsdk` 缺失，先运行
`install_deps.sh`。脚本需要宿主机有 `python3`、`bash`、`curl`，并从官方发布地址下载
Orbbec wheel 和 `mediamtx`；它不会启动 Docker 容器。

启动脚本现在从 `orbbec.yaml` 动态遍历所有 side。当前生产配置按 USB 物理端口记录为
`left=CV2L36000037`、`middle=CV2T661000DC`、`right=CV2L360000HS`。这些是物理安装位置的
映射，不是 USB 端口号；如果现场重新插拔或更换相机，必须重新核对物理位置和串号，并同时更新
`config/ros/cameras_ros2.yaml` 与 `src/camera_stream/config/orbbec.yaml`。
生产机四个相机共用 USB2 总线；三路 Orbbec 使用 `320x240@15` 深度低带宽档并可正常返回深度帧，
D435 当前无法稳定出帧，因此配置暂时只启用 RealSense 彩色低分辨率流。接入 USB3 后再恢复
RealSense 深度、更高分辨率和 Orbbec 的 `640x400@30` 深度档。

### ROS2 图像节点与 RViz2

`rm65_camera_ros2` 使用官方 `orbbec_camera` ROS2 驱动，不使用旧 USB port 路径，而是从
`config/ros/cameras_ros2.yaml` 读取三台 Gemini 305 的串号。默认彩色档为 `640x480@10 YUYV`，
深度档使用 `640x480@15 Y16` 原始 profile 和硬件抽取系数 `2`，实际发布
`320x240@15`，并关闭点云以适应生产机 USB2 总线。三台相机按独立设备运行，配置默认关闭
`enable_frame_sync`、`trigger_out_enabled` 和 `software_trigger_enabled`；官方默认同步参数会导致
后启动的设备只有 publisher 而没有图像帧。默认只打开彩色流，每次启动都会创建
`logs/YYYYMMDD_HHMMSS/` 并设置 `ROS_LOG_DIR`，节点日志由 rcutils 官方机制生成。
左侧相机在反光标定板下使用固定彩色曝光 `30`（3 ms）并关闭自动曝光；该值由
`cameras_ros2.yaml` 的 `cameras.left.color` 管理。若更换光源或相机位置，应先通过
`/camera_left/get_color_exposure` 验证画面，再调整该值，不能为了通过采样降低 ChArUco 角点门槛。
三台 Orbbec 与 D435 共用一条 USB2 root hub 时，生产机的
`/sys/module/usbcore/parameters/usbfs_memory_mb` 应至少为 `256`；函数会在低于该值时告警。
临时修复和持久化设置分别为：

```bash
sudo sh -c 'echo 256 > /sys/module/usbcore/parameters/usbfs_memory_mb'
echo 'options usbcore usbfs_memory_mb=256' | sudo tee /etc/modprobe.d/usbcore.conf
```

先停止 SDK 推流，再在连接 USB 相机的生产机上 source 函数并启动 headless ROS2 图：

```zsh
source /home/administrator/realman_pi/functions.zsh
rm65_camera_ros2 color
rm65_camera_ros2_status
```

默认 `color` 模式预期 topic 包括：

```text
/camera_left/color/image_raw
/camera_middle/color/image_raw
/camera_right/color/image_raw
```

默认模式实际发布三个 `color/image_raw`、三个 `color/camera_info` 和 TF；深度路径只有显式
使用 `rm65_camera_ros2 depth` 时才会发布。wrapper 2.7.6 在当前 USB2/libuvc 拓扑下同时
打开同一设备的彩色和深度会创建 publisher 但不连续出帧，因此两种流是互斥模式。三台彩色
在 `640x480@10 YUYV` 下预期约 10 Hz；YUYV 用于规避右侧设备在 USB2/MJPEG 下的持续帧撕裂，
实际帧率应以 `ros2 topic hz` 验证。

有图形桌面的机器可以直接启动 RViz2：

```zsh
rm65_camera_ros2 color rviz
# 需要深度时改为：rm65_camera_ros2 depth rviz
```

生产端通常没有 `DISPLAY`，这时在生产端只运行 `rm65_camera_ros2 color`，在笔记本使用与生产端
相同的 `.env` 启动远程 RViz。需要更换 DDS 域时，优先修改两端 `.env` 的 `ROS_DOMAIN_ID`，
然后重新 source 函数并重启相关节点。
不要在笔记本运行会直接连接机械臂 SDK 的
`realman_driver_rviz`。切换回 SDK/RTSP 推流前执行：

```zsh
rm65_camera_ros2_stop
rm65_camera_start
```

`rm65_camera_ros2_logs` 可检查串号不匹配、`OB_FORMAT_UNKNOWN` 或 USB 带宽错误。当前生产
机已验证 Orbbec 使用 `Y16` 和硬件二倍抽取；直接传 `320x240` 会被 wrapper 2.7.6 拒绝。
RealSense D435 仍不作为 ROS2 相机默认路径，
因为它在现有 USB2 连接下无法稳定输出首帧。

## Web 控制入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_web_control` | 前台启动独立 Web 控制服务。 | `realman_web_control/web_control.launch.py`；加入已有 ROS 图，但不启动驱动。 | 已有 `realman_bringup_remote` 或其他驱动图运行时，单独观察 WebSocket 协议和页面日志。 | `config/ros/realman_web_control.yaml`、[WebSocket 浏览器控制与 URDF 影子](./realman-web-control) |
| `rm65_docker_web_control_start` | 后台启动独立 Web 控制服务并打印状态。 | `docker compose up -d realman_web_control`。 | 工控机长期提供 `http://<host>:8765/` 浏览器入口。 | `realman_web_control` Compose 服务 |
| `rm65_docker_web_control_stop` | 停止后台 Web 控制服务。 | `docker compose stop realman_web_control`。 | 关闭浏览器控制桥；不停止真实驱动容器。 | Docker Compose |
| `rm65_docker_web_control_status` | 查看 Web 控制服务状态。 | `docker compose ps realman_web_control`。 | 判断 Web 服务是否仍在后台运行。 | Docker Compose |
| `rm65_docker_web_control_logs [-f]` | 查看或跟踪 Web 控制服务日志。 | `docker compose logs --tail=100 ... realman_web_control`。 | 排查 WebSocket、Action client、URDF 资源或授权配置。 | Docker Compose 与 `realman_web_control` 日志 |
| `rm65_web_control_url [host]` | 打印浏览器控制台 URL。 | 不启动服务，只根据 host 和 `REALMAN_WEB_CONTROL_PORT` 输出 `http://host:port/`。 | 启动 Web 控制后，把正确地址复制给同网段开发机浏览器。 | `config/ros/realman_web_control.yaml` 中的端口配置 |

## 远程 RViz 入口

| 函数 | 当前用途 | 启动/影响的组件 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_docker_remote_rviz [domain]` | 前台启动 RViz-only 远程查看器；省略 `domain` 时读取 `.env` 的 `ROS_DOMAIN_ID`。 | `remote_rviz.launch.py` 和 `rviz2`；不启动本地 driver、robot_state_publisher 或假关节状态源。 | 首次排查远程 DDS、X11 授权或 RViz 配置时，保留终端日志。 | `.env`、[快速开始：远程 RViz 函数详解](../guide/getting-started#远程-rviz-函数详解) |
| `rm65_docker_remote_rviz_start [domain]` | 后台启动 RViz-only 远程查看器并打印状态；省略 `domain` 时读取 `.env`。 | `docker compose up -d realman_remote_rviz`。 | 日常在桌面机持续观察工控机 `realman_bringup_remote` 发布的三臂状态。 | `.env`、`realman_remote_rviz` Compose 服务 |
| `rm65_docker_remote_rviz_stop` | 停止后台远程 RViz。 | `docker compose stop realman_remote_rviz`。 | 关闭桌面机 RViz-only 服务，不影响工控机驱动和机械臂。 | Docker Compose |
| `rm65_docker_remote_rviz_status` | 查看后台远程 RViz 状态。 | `docker compose ps realman_remote_rviz`。 | 确认 RViz 容器是否仍在运行。 | Docker Compose |
| `rm65_docker_remote_rviz_logs [-f]` | 查看或跟踪远程 RViz 日志。 | `docker compose logs --tail=100 ... realman_remote_rviz`。 | 排查 DDS 发现、TF、joint state 或显示授权问题。 | Docker Compose、[故障排查](../troubleshooting) |
| `rm65_docker_camera_rviz [domain]` | 前台显示生产机三路 Orbbec 彩色图像；省略 `domain` 时读取 `.env` 的 `ROS_DOMAIN_ID`。 | `realman_camera_rviz` 和只含彩色 Image display 的 `config/rviz/cameras.rviz`；不启动驱动、本地相机或深度显示。 | 笔记本查看生产机的 `/camera_left`、`/camera_middle`、`/camera_right` 实拍画面。 | `.env`、[快速开始：查看三路实拍画面](../guide/getting-started#查看三路实拍画面) |
| `rm65_docker_camera_rviz_start [domain]` | 后台启动三路相机 RViz；省略 `domain` 时读取 `.env`。 | `docker compose up -d realman_camera_rviz`。 | 日常持续查看相机画面。 | `.env`、`realman_camera_rviz` Compose 服务 |
| `rm65_docker_camera_rviz_stop` | 停止后台相机 RViz。 | `docker compose stop realman_camera_rviz`。 | 关闭笔记本上的相机查看器，不影响生产机相机。 | Docker Compose |
| `rm65_docker_camera_rviz_status` | 查看后台相机 RViz 状态。 | `docker compose ps realman_camera_rviz`。 | 确认相机 RViz 容器是否运行。 | Docker Compose |
| `rm65_docker_camera_rviz_logs [-f]` | 查看或跟踪相机 RViz 日志。 | `docker compose logs --tail=100 ... realman_camera_rviz`。 | 排查 X11、DDS domain 或图像订阅问题。 | Docker Compose |

## 本机构建、网站和部署入口

| 函数 | 当前用途 | 影响范围 | 适用场景 | 权威配置与文档 |
| --- | --- | --- | --- | --- |
| `rm65_ros_build [args ...]` | 加载本机 ROS 2 Humble 后执行 `colcon build --symlink-install --packages-up-to realman_bringup realman_robot_driver`。 | 本机 `install/`、`build/`、`log/`。 | 不使用 Docker 时构建 ROS 包，或给 `colcon` 追加调试参数。 | `src/` 下 ROS packages、[系统 Bringup：构建与验证](./system-bringup#构建与验证) |
| `rm65_web_build` | 在 `website/` 中构建 VitePress 网站。 | 先同步三臂模型资源，再输出 `website/docs/.vitepress/dist`。 | push 前确认开发者手册、模型资源和 GitHub Pages 构建不会失败。 | `website/package.json`、`website/scripts/sync-three-robots.mjs` |
| `rm65_web_test` | 在 `website/` 中运行 Playwright 网站测试。 | 桌面和移动端文档路由、首页 WebGL 场景和生成 JSON。 | 修改网站页面、导航、生成资源或 docs 结构后。 | `website/tests/`、`config/website/playwright.config.mjs` |
| `rm65_deploy_sync` | 本地 `main` 提交并 `git push origin main` 后，用 `rsync` 同步当前干净工作树到生产主机。 | 更新生产目录文件；排除 `.git/`、构建产物、日志、Node 依赖、测试结果和 Python 缓存；不自动重建或重启容器。 | GitHub 已有最新提交，但生产主机拉取 GitHub 不稳定或希望以本地文件为同步源时。 | `REALMAN_PRODUCTION_HOST`、`REALMAN_PRODUCTION_DIR`、[系统 Bringup：生产端代码部署](./system-bringup#生产端代码部署) |
| `rm65_deploy_update` | 兼容入口：通过 SSH 到生产主机执行 `git fetch origin main` 和 `git merge --ff-only origin/main`。 | 更新生产端 Git checkout 元数据和文件；不自动重建或重启容器。 | 生产主机可稳定访问 GitHub，且需要让远端 checkout 的 `main` 快进到 `origin/main` 时。 | `REALMAN_PRODUCTION_HOST`、`REALMAN_PRODUCTION_DIR`、[系统 Bringup：生产端代码部署](./system-bringup#生产端代码部署) |

## 维护规则

- 修改 `functions.zsh` 新增、重命名或删除入口时，同步更新本页、`rm65_project_help`、`website/docs/development/index.md` 和 `website/tests/site.spec.ts` 路由列表。
- 修改 Compose 服务、launch 参数或 `.env` 变量时，优先更新对应专题页，再让本页链接到新的权威说明。涉及 ROS 通信时，确认相机、机械臂、Web 控制和远程 RViz 的 `ROS_DOMAIN_ID` 仍来自同一配置源。
- 不把真实 token、临时 IP、现场 SSH 密钥或未验证的真机行为写入文档。真实硬件行为应标明验证状态。
- 运行文档验证：

```bash
cd website
npm run build
npm run test:e2e
```
