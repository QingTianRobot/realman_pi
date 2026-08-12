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

## Docker 启动

克隆仓库并构建镜像：

```bash
git clone git@github.com:QingTianRobot/realman_pi.git
cd realman_pi
docker compose build rm65_rviz
```

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

默认映射主机 `/dev/input/event0`。建议使用稳定的 `by-id` event 路径覆盖：

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
