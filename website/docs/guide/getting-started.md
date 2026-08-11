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
| 显示变量 | `DISPLAY` 非空，`XAUTHORITY` 指向可读文件 |
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
Compose 会把 `XAUTHORITY` 指向的文件只读挂载到容器中。该路径必须存在并且当前用户可读。
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

## ROS 域设置

独立查看器默认使用 `ROS_DOMAIN_ID=65`，避免读取同一网络中其他机器人发布的 `/robot_description` 和 TF。

需要接入现有 ROS 2 图时，显式指定相同的域：

```bash
ROS_DOMAIN_ID=0 RM65_MODEL=RM65-B docker compose run --rm rm65_rviz
```

## 本地 Humble 工作空间

已经安装 ROS 2 Humble 时，也可以直接构建描述包：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select rm65_description
source install/setup.bash
ros2 launch rm65_description display.launch.py
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

下一步可以查看[型号差异](/models/)或[完整 TF 树](/architecture/tf-tree)。
