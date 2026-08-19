---
title: 快速开始
description: 使用 Docker Compose 或本地 ROS 2 Humble 工作空间启动 RM65 RViz 2。
---

# 快速开始

默认启动 `RM65-B`。Docker 镜像包含 ROS 2 Humble、描述包、`robot_state_publisher`、关节状态 GUI 和 RViz 2。

## 环境要求

| 组件 | 要求 |
| --- | --- |
| 操作系统 | 提供 X11 或 XWayland 的 Linux 桌面 |
| 容器运行时 | Docker Engine 与 Docker Compose v2 |
| 显示变量 | 带 RViz 的服务要求 `DISPLAY` 非空且 `XAUTHORITY` 指向可读文件；headless 服务不需要 |
| 项目目录 | 在包含 `docker-compose.yml` 的仓库根目录执行命令 |

先确认当前终端继承了桌面会话：

```bash
printf 'DISPLAY=%s\nXAUTHORITY=%s\n' "$DISPLAY" "$XAUTHORITY"
```

普通 Xorg 会话中，如果 `XAUTHORITY` 为空，可以使用：

```bash
export XAUTHORITY="$HOME/.Xauthority"
```

::: warning
带 RViz 的 Compose 服务会把 `XAUTHORITY` 指向的文件只读挂载到容器中。该路径必须存在并且当前用户可读。`realman_bringup_remote` 不创建 Qt 窗口，可以在没有 `DISPLAY` 和 `XAUTHORITY` 的远程终端运行。
:::

## Zsh 快捷函数

根目录 `functions.zsh` 提供可选的开发与运行函数。在 Zsh 中加载一次即可从任意
目录调用：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_project_help
```

| 函数 | 等价用途 |
| --- | --- |
| `rm65_docker_build [service ...]` | 构建指定 Compose 服务 |
| `rm65_docker_rviz [model]` | 启动单臂 RViz，型号默认 `RM65-B` |
| `rm65_docker_three_rviz` | 启动配置驱动的三臂 RViz |
| `rm65_docker_xbox_test` | 只启动实体手柄输入链路 |
| `rm65_docker_driver_test` / `rm65_docker_driver_rviz` | 使用 mock 驱动测试，或显示真实关节状态 |
| `rm65_docker_bringup` | 启动三臂、RViz、Joy 和 Xbox 输入 |
| `rm65_docker_bringup_custom` | 按 `.env` 中的 launch 开关启动参数化 bringup |
| `rm65_docker_bringup_model` / `hardware` / `headless` | 启动模型、真机 RViz 或无 GUI 预设 |
| `rm65_docker_bringup_input` / `web` | 只启动输入链路，或启动真机与 Web 控制 |
| `rm65_docker_bringup_custom_args ...` | 临时透传 `system.launch.py` 参数 |
| `rm65_camera_start` / `stop` | 在宿主机启动或停止 SDK 直读相机推流 |
| `rm65_camera_status` / `logs [-f]` | 查看相机进程、端口或跟踪推流日志 |
| `rm65_docker_web_control[_start]` | 前台或后台启动浏览器 Action 控制台 |
| `rm65_docker_web_control_status` / `logs` / `stop` | 查看、跟踪或停止 Web 控制台 |
| `rm65_web_control_url [host]` | 输出浏览器访问地址，默认端口 `8765` |
| `rm65_docker_bringup_remote` | 启动远程 headless 目标 |
| `rm65_docker_remote_rviz [domain]` | 在当前桌面前台显示远程 ROS 图 |
| `rm65_docker_remote_rviz_start [domain]` | 在当前桌面后台持续运行远程 RViz |
| `rm65_docker_remote_rviz_status` / `logs [-f]` / `stop` | 查看、跟踪或停止后台 RViz |
| `rm65_ros_build` | 使用本机 Humble 构建到 `realman_bringup` |
| `rm65_web_build` / `rm65_web_test` | 构建或测试文档网站 |
| `rm65_deploy_sync` | 本地提交并 push 后，用 `rsync` 同步到生产端 |

这些函数不会自动写入 `~/.zshrc`，也不会隐藏底层参数。需要函数未覆盖的 Compose、
colcon 或 launch 选项时，继续使用本页的原始命令。`rm65_docker_xbox_test` 不启动
三臂和 RViz，适合先验证实体手柄是否能产生 Joy 消息和按键日志。

所有 `functions.zsh` 入口的当前用途、组件范围和权威配置见
[启动入口索引](../development/startup-entries)；参数化 bringup 的完整开关和组合说明见
[系统 Bringup：参数化组合](../development/system-bringup#参数化组合)。每个函数在子 shell
中覆盖对应变量，执行结束后不会改变当前终端的环境变量。

### 相机推流

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
`left/right` 两个 side（serial 为空的 side 会自行退出），主机检测到 `ros2` 时再启动
`ros2_bridge`。
`rm65_camera_stop` 会停止这些进程，`rm65_camera_status` 会检查进程和 `8554`、`8100-8102`
监听端口，`rm65_camera_logs` 支持 `all`、`mediamtx`、`orbbec_left`、`orbbec_right`、
`realsense_stream`、`ros2_bridge` 组件名。

彩色流地址为：

```text
rtsp://<host>:8554/realsense/color
rtsp://<host>:8554/orbbec/left/color
rtsp://<host>:8554/orbbec/right/color
```

深度服务监听 `<host>:8100`（RealSense）、`<host>:8101`（Orbbec left）和 `<host>:8102`
（Orbbec right）。启动前必须核对并按现场设备更新
`src/camera_stream/config/realsense.yaml`、`src/camera_stream/config/orbbec.yaml` 的
serial；空的 Orbbec serial 会跳过该 side。SDK 会独占 USB 设备，请勿与旧的
`realsense2_camera_node` 或 Orbbec ROS 图像节点同时运行。

若提示 Python 模块缺失，先执行 `install_deps.sh`；该脚本安装 `numpy`、`av`、`PyYAML`、
`pyrealsense2`、`pyorbbecsdk` 等依赖，并下载仓库本地的 `bin/mediamtx`。生产主机没有
这些依赖或串号不匹配时，入口会拒绝启动或在对应日志中报告设备不可用。
当前启动脚本不会自动发现第三台 Orbbec；增加第四路相机时，需同时扩展
`orbbec.yaml`、`scripts/start_streaming.sh` 的 side/端口/RTSP 配置。

### 远程 RViz 函数详解

下面的函数只在有图形桌面的笔记本上运行。真实机械臂驱动仍应在连接工业交换机的工控机上
运行 `realman_bringup_remote`；笔记本不能使用 `realman_driver_rviz` 去直接连接
`192.168.30.x` 控制器。所有函数的可选 `domain` 参数必须与工控机一致，取值范围是 `0` 到
`232`；省略时沿用当前 `ROS_DOMAIN_ID`，如果环境中没有设置则默认使用 `166`。

| 函数 | 使用方式 | 生命周期和适用场景 |
| --- | --- | --- |
| `rm65_docker_build` | `rm65_docker_build realman_remote_rviz` | 首次使用或代码更新后构建 RViz 镜像；不会启动节点。 |
| `rm65_docker_remote_rviz_start` | `rm65_docker_remote_rviz_start 166` | 后台启动 `realman_remote_rviz`；命令返回后 RViz 窗口和容器继续运行，适合日常使用。 |
| `rm65_docker_remote_rviz` | `rm65_docker_remote_rviz 166` | 前台启动；当前终端持续显示 launch 日志，关闭窗口或按 `Ctrl-C` 停止。适合首次排错。 |
| `rm65_docker_remote_rviz_status` | `rm65_docker_remote_rviz_status` | 只查看 Compose 服务状态，不改变运行状态。看到 `Up` 才表示容器仍在运行。 |
| `rm65_docker_remote_rviz_logs` | `rm65_docker_remote_rviz_logs` 或 `rm65_docker_remote_rviz_logs -f` | 查看最近 100 行日志；`-f` 持续跟踪日志，按 `Ctrl-C` 只退出跟踪，不停止 RViz。 |
| `rm65_docker_remote_rviz_stop` | `rm65_docker_remote_rviz_stop` | 停止笔记本上的 RViz-only 服务，不停止工控机驱动和机械臂。 |

推荐的笔记本操作顺序如下：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_remote_rviz  # 第一次或代码更新后执行
rm65_docker_remote_rviz_start 166
rm65_docker_remote_rviz_status
```

后台服务不会因为关闭当前终端而停止，但目前没有配置开机自动重启；电脑或 Docker 服务重启
后需要再次执行 `rm65_docker_remote_rviz_start 166`。函数会自动读取 `DISPLAY` 和
`XAUTHORITY`，并兼容 GNOME Wayland 的 `.mutter-Xwaylandauth.*` 文件。

常见问题的判断方式：

| 现象 | 检查方向 |
| --- | --- |
| `no readable Xauthority file` | 从当前图形桌面终端加载 `functions.zsh`，确认 `DISPLAY` 和 `XAUTHORITY` 指向当前会话。 |
| RViz 窗口出现但没有 `/l`、`/m`、`/r` 数据 | 工控机和笔记本的 `ROS_DOMAIN_ID` 是否相同，且两端 `ROS_LOCALHOST_ONLY=0`、DDS UDP/组播未被防火墙阻断。 |
| `socket connect err` 或 `invalid robot handle` 出现在笔记本 | 误用了 `realman_driver_rviz`；笔记本应使用 `realman_remote_rviz`，SDK 连接只在工控机完成。 |
| `permission denied while trying to connect to the Docker API` | 当前用户没有 Docker socket 权限；先修复 Docker 用户组或使用有权限的终端，再重试函数。 |

## `.env` 与 Bringup 预设

从仓库根目录执行 `docker compose` 时会自动读取根目录 `.env`。文件中的每个变量都带有候选值
注释，模板默认不会启用真实运动控制，也不会包含密钥。命令行显式设置的变量优先级更高：

```bash
${EDITOR:-vi} .env
ROS_DOMAIN_ID=166 docker compose config --quiet
```

`realman_bringup_custom` 会把 `.env` 中的开关透传给 `system.launch.py`。常用变量如下：

| 变量 | 作用 |
| --- | --- |
| `REALMAN_START_ROBOTS` | 启动或关闭 `/l`、`/m`、`/r` 描述和 TF |
| `REALMAN_START_DRIVER` | 启动真实 RealMan 状态驱动；离线测试可改用 mock 配置 |
| `REALMAN_USE_RVIZ` / `REALMAN_USE_GUI` | 启动三臂 RViz 或关节状态 GUI |
| `REALMAN_START_JOY_DRIVER` / `REALMAN_START_CONTROLLER` | 启用 SDL Joy 和 Xbox 按键节点 |
| `REALMAN_START_WEB_CONTROL` | 在同一 ROS 图中启动 WebSocket、Action 和 URDF 控制桥 |
| `REALMAN_*_CONFIG_FILE` | 覆盖驱动、坐标、运动和 Web 控制配置路径 |
| `ROS_DOMAIN_ID` / `REALMAN_JOY_DEVICE` | 设置 DDS 域和手柄设备路径 |

修改运行时 `.env` 变量后重新启动服务即可生效，不需要重新构建镜像；修改 Docker/ROS/PyPI
镜像变量时需要重新构建对应服务。常用预设已经在
`functions.zsh` 中封装，并在子 shell 中覆盖变量，不会污染当前终端：

| 函数 | 启动内容 |
| --- | --- |
| `rm65_docker_bringup_model` | 三臂描述、TF 和 RViz；不连接真机 |
| `rm65_docker_bringup_hardware` | 三台真实驱动和 RViz；不启动输入 |
| `rm65_docker_bringup_headless` | 三台真实驱动和 Xbox 处理；无 GUI |
| `rm65_docker_bringup_input` | 只测试 Joy/Xbox 输入，并等待设备出现 |
| `rm65_docker_bringup_web` | 三台真实驱动和 Web 控制；不启动 RViz |

需要后台运行或查看日志时，使用：

```zsh
rm65_docker_bringup_custom_start
rm65_docker_bringup_custom_status
rm65_docker_bringup_custom_logs -f
rm65_docker_bringup_custom_stop
```

需要临时传入 launch 参数时，不修改 `.env`：

```zsh
rm65_docker_bringup_custom_args \
  start_driver:=false start_joy_driver:=false start_controller:=false \
  use_gui:=true use_rviz:=true
```

## Docker 启动

克隆仓库并构建镜像：

```bash
git clone git@github.com:QingTianRobot/realman_pi.git
cd realman_pi
docker compose build rm65_rviz
```

默认构建使用国内 Docker Hub、Ubuntu、ROS 2 和 PyPI 镜像。镜像地址及切回官方源的方法见
[系统 Bringup：国内镜像与官方源切换](../development/system-bringup#国内镜像与官方源切换)。

启动默认型号：

```bash
docker compose run --rm rm65_rviz
```

启动后将出现两个窗口：关节状态调节界面和加载了 RobotModel、TF 的 RViz 2。

## 切换型号

通过 `RM65_MODEL` 选择模型：

```bash
RM65_MODEL=RM65-6FB-V docker compose run --rm rm65_rviz
```

有效值为：

```text
RM65-B
RM65-B-V
RM65-6F
RM65-6FB
RM65-6FB-V
```

无效型号会在启动阶段直接报错，并输出完整的可选列表。

## 三机械臂启动

三机械臂环境使用根目录 `config/ros/three_robots.yaml` 作为唯一布局配置：

```bash
docker compose build rm65_three_rviz
docker compose run --rm rm65_three_rviz
```

默认使用以下名称和布局：

| 名称 | ROS 命名空间 | TF 前缀 | X 位置 | yaw | 朝向 |
| --- | --- | --- | ---: | ---: | --- |
| 左臂 `l` | `/l` | `l/` | `-1.0` | `0` | 正向 |
| 中臂 `m` | `/m` | `m/` | `0.0` | `π` | 反向 |
| 右臂 `r` | `/r` | `r/` | `1.0` | `0` | 正向 |

修改 YAML 中的 `x`、`y`、`z`、`roll`、`pitch`、`yaw` 后重启容器即可，
无需重建镜像。每台机械臂也可以独立选择五个受支持的 RM65 型号。

本地工作空间使用：

```bash
ros2 launch rm65_description three_robots.launch.py
```

默认使用无窗口的 `joint_state_publisher`。需要交互调节关节时可启动三个命名空间下的 GUI：

```bash
RM65_USE_GUI=true docker compose run --rm rm65_three_rviz
```

## ROS 域设置

独立查看器默认使用 `ROS_DOMAIN_ID=65`，避免读取同一网络中其他机器人发布的 `/robot_description` 和 TF。

需要接入现有 ROS 2 图时，显式指定相同的域：

```bash
ROS_DOMAIN_ID=0 RM65_MODEL=RM65-B docker compose run --rm rm65_rviz
```

## Xbox 手柄与统一启动

将 Xbox Series 手柄连接到 Linux，并确认设备节点：

```bash
ls -l /dev/input/by-id/*-event-joystick
```

启动三臂、RViz 2、手柄驱动和 C++ 输入节点：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

服务会自动扫描主机的 `*-event-joystick` 设备；建议使用稳定的 `by-id` event 路径覆盖：

```bash
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm realman_bringup
```

按下 A 键后，终端应出现类似日志：

```text
button[0] a PRESSED
button[0] a RELEASED
```

无桌面的远程端可以启动 headless 调试目标：

```bash
ROS_DOMAIN_ID=65 docker compose run --rm realman_bringup_remote
```

远程 Humble 主机设置相同的 `ROS_DOMAIN_ID=65` 和 `ROS_LOCALHOST_ONLY=0`，向 `/input/joy` 发布 `sensor_msgs/msg/Joy` 即可驱动输入节点。两台主机之间还需要允许 DDS UDP 网络通信。

### 浏览器 Web 控制台

Web 控制台运行在连接机械臂的工控机上，浏览器只通过 WebSocket 访问它，不会在笔记本上创建
RealMan SDK 连接。先确认真实驱动已经运行，再构建并启动独立的 Web 服务：

```bash
docker compose build realman_web_control
docker compose up -d realman_web_control
docker compose ps realman_web_control
```

控制台默认监听 `0.0.0.0:8765`。使用浏览器打开下面的地址，`<industrial-host>` 替换为工控机
在路由器局域网中的地址：

```text
http://<industrial-host>:8765/
```

页面会显示三臂连接状态、当前坐标面板、实时关节角和 URDF，并按当前激活参考系直接发
`MOVEJ`、`MOVEL`、`MOVEP` 或速度 Action，不再需要 token 输入。也可以使用 Zsh 快捷函数：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_docker_web_control_start
rm65_web_control_url <industrial-host>
rm65_docker_web_control_status
rm65_docker_web_control_logs -f
```

页面支持以下操作：

| 操作 | 行为 |
| --- | --- |
| 关节滑轨 | 生成橙色半透明的目标影子，实体 URDF 继续显示真实回读位置 |
| `MOVEJ` | 使用当前激活参考系提交六轴关节角 Action，并实时显示阶段、进度、feedback 和 result |
| `MOVEL` | 显示当前激活参考系，支持填入当前位置、计算逆解影子预览，再按 XYZ 米制位置和 WXYZ 四元数提交笛卡尔直线运动 |
| `MOVEP` | 显示当前激活参考系，以 `MOVEJ_P` 命令提交目标位姿的关节空间运动 |
| 末端速度 | 使用当前激活参考系建立六轴 `vx, vy, vz, wx, wy, wz` 速度 Action，按周期发送最新命令 |
| 取消 Action | 取消当前浏览器发起的 Action，并由驱动执行受控 slow-stop |
| 软件停止 | 直接调用当前机械臂的 `/stop` 服务；它不是控制柜物理急停 |

Action、坐标系、四元数和安全边界的开发契约见[Action 开发与测试](../development/realman-action-development)，
WebSocket 消息与 URDF 影子实现见[WebSocket 浏览器控制与 URDF 影子](../development/realman-web-control)。

### 在本机显示远程机械臂

如果真实驱动运行在另一台工控机，而 RViz 要显示在当前桌面机上，请让工控机只运行
`realman_bringup_remote`，当前桌面机运行 RViz-only 服务。两端需要使用同一个未占用的
ROS domain；下面使用 `166` 作为示例。

工控机：

```bash
ROS_DOMAIN_ID=166 docker compose up -d realman_bringup_remote
```

`realman_bringup_remote` 是无 GUI 的生产端 ROS 图，Compose 配置会让它在主机重启、
Docker daemon 重启或异常退出后自动恢复。只有显式执行
`docker compose stop realman_bringup_remote` 时，Docker 才会把它视为人工停止。

当前桌面机：

```bash
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_remote_rviz
rm65_docker_remote_rviz_start 166
rm65_docker_remote_rviz_status
```

`rm65_docker_remote_rviz_start` 会从当前桌面会话读取 `DISPLAY` 和 `XAUTHORITY`，在 GNOME
Wayland 下也会查找 `.mutter-Xwaylandauth.*`。命令返回后容器和 RViz 窗口继续运行；查看日志
或停止时使用：

```zsh
rm65_docker_remote_rviz_logs -f
rm65_docker_remote_rviz_stop
```

需要让日志留在当前终端并在 `Ctrl-C` 时同时停止 RViz，可改用前台命令
`rm65_docker_remote_rviz 166`。参数缺省时函数沿用当前 `ROS_DOMAIN_ID`，环境中也未设置时
默认使用 `166`。

该服务只启动 RViz 2，不连接机械臂、不启动 `robot_state_publisher`，也不发布假关节状态。
桌面机和工控机需要在可互通并允许 DDS UDP/组播的网络中；如果连接经过 NAT 或 VPN 不支持
组播，应改用 DDS discovery server 或在工控机上运行 RViz。

## 本地 Humble 工作空间

已经安装 ROS 2 Humble 时，也可以直接构建描述包：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
source install/setup.bash
ros2 launch realman_bringup system.launch.py
```

切换型号使用 launch 参数：

```bash
ros2 launch rm65_description display.launch.py model:=RM65-B-V
```

## 启动内容

`display.launch.py` 同时创建三个节点：

| 节点 | 职责 |
| --- | --- |
| `robot_state_publisher` | 发布 `robot_description` 和 TF |
| `joint_state_publisher_gui` | 调节并发布六个旋转关节状态 |
| `rviz2` | 使用仓库内的 `rm65.rviz` 显示模型和 TF |

下一步可以查看[型号差异](/models/)、[完整 TF 树](/architecture/tf-tree)、[Xbox 手柄输入](/development/xbox-controller)或[系统 Bringup](/development/system-bringup)。
