---
title: 相机
description: 三路 Orbbec 腕部相机与全局 RealSense D435 的 ROS 2 出图、四路 RViz 查看、本地覆盖配置和已弃用的 RTSP 推流。
---

# 相机

生产相机运行在**连接 USB 相机的宿主机**上，不在 Docker 里：`./rm65 up` 会先启动宿主机的 `rm65_camera_ros2 color`，成功后才启动 Docker 服务（相机失败则不启动 Docker）。ROS 2 彩色图像是标定、Web 标定页面和策略桥的共同输入。相机配置的权威文件是 `config/ros/cameras_ros2.yaml`；现场差异（串号等）写入被 `.gitignore` 忽略的 `config/ros/cameras_ros2.local.yaml`，与 base 深合并，优先级 `local > base`。

| 相机 | ROS 命名空间 | 来源 |
| --- | --- | --- |
| 左 / 中 / 右腕部 Orbbec Gemini 305 | `/camera_left`、`/camera_middle`、`/camera_right` | 官方 Orbbec ROS 2 驱动 |
| 全局 RealSense D435 | `/camera_global/d435` | 官方 RealSense ROS 2 驱动；宿主机缺少 `realsense2_camera` 时启动直接失败，不会降级为仅三路 |

## ROS2 相机与 RViz2

相机出图主线使用官方 Orbbec ROS2 驱动加 RealSense ROS2 驱动。`rm65_camera_ros2` 会先停止
已弃用的 SDK 推流以释放 USB，source ROS2 Humble、Orbbec、RealSense 和本仓库工作区，然后从
`config/ros/cameras_ros2.yaml` 按串号启动三路 Gemini 305，并在 24s 错峰后启动全局 RealSense
D435；宿主机缺少 `realsense2_camera` 驱动时 `rm65_camera_ros2` / `start_sensors.sh` / `./rm65 up`
直接失败，禁止降级为仅三路 Orbbec。默认使用 USB2 兼容的
`640x480@10 YUYV` 彩色；YUYV 用于规避右侧
设备在 USB2/MJPEG 下的持续帧撕裂；深度向驱动传入
`640x480@15 Y16` 和硬件抽取系数 `2`，实际发布 `320x240@15`。点云关闭；每次运行的
官方节点日志写入 `logs/<timestamp>/`。三台相机是独立设备，配置默认关闭帧同步、触发输出和
软件触发；启用 wrapper 默认同步参数会导致后启动的 USB2 设备只有 publisher 而没有图像帧。
三台 Orbbec 与 D435 共用 USB2 root hub 时，还需将生产机 `usbfs_memory_mb` 调到至少 `256`；
启动函数会检查该值并在过小时打印临时和持久化修复命令。
`wrist_cameras.devices.left.streams.color` 固定左侧相机为 3 ms 曝光，以避免反光标定板在自动曝光下过曝；当现场光照
改变时应调整该配置，而不是降低 ChArUco 的最小角点数。现场串号等差异可写进被 `.gitignore` 忽略的
`config/ros/cameras_ros2.local.yaml`（与 base 深合并、优先级 `local > base`，详见
[开发者手册](../development/startup-entries.md#ros2-图像节点与-rviz2)）。
生产机的 Orbbec 工作区与 Docker 镜像可能使用不同的 Fast DDS 补丁版本；项目默认从 `.env`
加载 `FASTDDS_BUILTIN_TRANSPORTS=UDPv4`，避免 DDS 发现到 topic 后选择不兼容的同机共享内存。
不要将它改回 `DEFAULT`，除非已验证宿主与容器能稳定互收 Image 和 `CameraInfo`。
wrapper 2.7.6 不能直接用 `320x240` 作为 Gemini 305 的原始深度 profile，否则即使设备枚举
列表显示该档也会报告 profile 不匹配。

生产端（通常无桌面）执行：

```zsh
source /home/administrator/realman_pi/functions.zsh
rm65_camera_ros2
ros2 topic list | grep camera
rm65_camera_ros2_status
```

默认会看到 `/camera_left`、`/camera_middle`、`/camera_right` 下的 `color/image_raw` 和
对应 `camera_info`，以及全局
`/camera_global/d435/color/image_raw`。需要深度时使用互斥的深度模式：

```zsh
rm65_camera_ros2 depth
```

它使用 `640x480@15 Y16` 加硬件抽取 `2`，发布 `320x240@15` 的 `depth/image_raw`。
官方 wrapper 2.7.6 在当前 USB2/libuvc 拓扑下不支持同一设备同时打开彩色和深度连续出帧，
所以不要把 `enable_color` 和 `enable_depth` 同时设为 true。有图形桌面时可直接：

```zsh
rm65_camera_ros2 color rviz
```

`rviz` 参数要求当前会话有 `DISPLAY`；生产端无 GUI 时，让生产端保持
`rm65_camera_ros2 color`，在笔记本使用同一份 `.env` 中的 `ROS_DOMAIN_ID` 启动远程查看器。
需要更换 DDS 域时，优先修改 `.env` 的 `ROS_DOMAIN_ID`，然后重新 source 函数并重启相关节点。
停止 ROS2 相机、释放三路 Orbbec 与 D435 的 USB 设备时：

```zsh
rm65_camera_ros2_stop
```

RTSP/TCP SDK 推流已弃用，不再是相机出图主线；仅在历史排障需要时才在停止 ROS2 相机后
执行 `rm65_camera_start`，两者互斥、不可同时占用 USB 设备。

## 查看四路实拍画面

生产机启动 `rm65_camera_ros2 color` 后，笔记本不需要连接 USB 相机，只需加入相同的 ROS domain
并启动专用相机 RViz。它只订阅图像 topic，不启动 RealMan SDK、机械臂驱动或本地相机节点：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_camera_rviz  # 首次使用或镜像更新后执行
rm65_docker_camera_rviz                 # 前台打开 RViz，关闭窗口或 Ctrl-C 停止
```

RViz 中会显示（前三路由 Orbbec 提供，第四路由 RealSense D435 提供；宿主机缺少
`realsense2_camera` 驱动时 `rm65_camera_ros2` 直接失败，不会到达 RViz 阶段）：

```text
/camera_left/color/image_raw
/camera_middle/color/image_raw
/camera_right/color/image_raw
/camera_global/d435/color/image_raw
```

也可以让 RViz 在后台运行：

```zsh
rm65_docker_camera_rviz_start
rm65_docker_camera_rviz_status
rm65_docker_camera_rviz_logs -f
rm65_docker_camera_rviz_stop
```

生产机和笔记本必须使用完全相同的 `ROS_DOMAIN_ID`；日常只改 `.env`，不需要在每条命令后
追加 domain 参数。`rm65_docker_camera_rviz [domain]` 仍保留临时覆盖能力。若 RViz 窗口打开但
图像为空，先在笔记本执行 `ros2 topic list | grep '/camera_.*color/image_raw'`，再检查两端
`ROS_LOCALHOST_ONLY=0`、`FASTDDS_BUILTIN_TRANSPORTS=UDPv4`、DDS UDP/组播和防火墙设置。专用相机 RViz 只显示四路彩色图像（三路 Orbbec + 一路 D435），不加载
深度 topic。不要在笔记本执行 `rm65_camera_ros2`，否则它会尝试直接占用笔记本的 USB 相机设备。

两套相机节点不能同时打开 USB 设备。RealSense D435 在现有 USB2 拓扑下仍无法稳定出帧，
因此没有加入这个 ROS2 三相机默认 launch。
## 相机推流（已弃用）

::: warning 已弃用，不再是相机出图主线
生产已回归 ROS2 节点出图，请直接使用下方 [ROS2 相机与 RViz2](#ros2-相机与-rviz2) 一节
（入口 `rm65_camera_ros2` 或 `bash start_sensors.sh`）。以下 RTSP/TCP SDK 推流方案仅作
历史参考；它与 ROS2 节点都独占 USB 设备、互斥运行，`rm65_camera_ros2` / `start_sensors.sh`
会在启动前调用 `stop_streaming.sh` 停掉本推流。
:::

相机功能包直接运行在连接 USB 相机的宿主机上，不通过 `realman_bringup` Docker 服务。它用
RealSense/Orbbec SDK 读取设备：彩色图像经 PyAV 推送到 `mediamtx` RTSP，深度图像通过独立
TCP 端口发送；可选 `ros2_bridge` 只发布 `CameraInfo` 和静态 TF，不发布 ROS image topic。

首次使用在相机宿主机安装依赖：

```bash
cd /path/to/realman_pi/src/camera_stream
./scripts/install_deps.sh
```

然后从任意目录加载快捷函数并管理生命周期：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_camera_start
rm65_camera_status
rm65_camera_logs -f
rm65_camera_stop
```

`rm65_camera_start` 启动 `mediamtx`、`realsense_stream`、`config/orbbec.yaml` 中
配置的所有 side（serial 为空的 side 会自行退出），主机检测到 `ros2` 时再启动
`ros2_bridge`。
`rm65_camera_stop` 会停止这些进程，`rm65_camera_status` 会检查进程和 `8554`、`8100-8103`
监听端口，`rm65_camera_logs` 支持 `all`、`mediamtx`、`orbbec_left`、`orbbec_middle`、`orbbec_right`、
`realsense_stream`、`ros2_bridge` 组件名。

彩色流地址为：

```text
rtsp://<host>:8554/realsense/color
rtsp://<host>:8554/orbbec/left/color
rtsp://<host>:8554/orbbec/middle/color
rtsp://<host>:8554/orbbec/right/color
```

深度服务监听 `<host>:8100`（RealSense）、`<host>:8101`（Orbbec left）、`<host>:8102`
（Orbbec middle）和 `<host>:8103`（Orbbec right）。启动前必须核对并按现场设备更新
`src/camera_stream/config/realsense.yaml`、`src/camera_stream/config/orbbec.yaml` 的
serial；空的 Orbbec serial 会跳过该 side。SDK 会独占 USB 设备，请勿与旧的
`realsense2_camera_node` 或 Orbbec ROS 图像节点同时运行。

若提示 Python 模块缺失，先执行 `install_deps.sh`；该脚本安装 `numpy`、`av`、`PyYAML`、
`pyrealsense2`、`pyorbbecsdk` 等依赖，并下载仓库本地的 `bin/mediamtx`。生产主机没有
这些依赖或串号不匹配时，入口会拒绝启动或在对应日志中报告设备不可用。
启动脚本会从 `orbbec.yaml` 动态读取所有 side。生产机当前三台 Orbbec 和一台 D435 都在
USB2 总线上；三路 Orbbec 使用 `320x240@15` 深度低带宽档可正常推流和返回深度帧，但 D435
当前 SDK/V4L2 均无帧，需更换 USB3 线或端口后再恢复 RealSense 深度和高分辨率。

