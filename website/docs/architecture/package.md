---
title: 仓库与 ROS 图
description: realman_pi 的网站、Docker 环境、ROS 2 描述包和运行节点结构。
---

# 仓库与 ROS 图

仓库把运行环境、ROS 2 包和文档网站分开管理。前端依赖不会进入 ROS 工作空间，容器构建也不会安装网站依赖。

## 代码仓库结构

```text
realman_pi/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml       # GitHub Pages 自动部署
├── config/
│   ├── docker/                    # Compose 与 Humble 镜像配置
│   ├── ros/                       # 三机械臂 TF 布局
│   ├── rviz/                      # 单臂和三臂显示配置
│   └── website/                   # VitePress 实质配置
├── docker/
│   └── ros_entrypoint.sh          # 容器运行入口脚本
├── src/
│   ├── driver/
│   │   └── xbox_controller_driver/ # C++ Xbox 输入处理包
│   ├── realman_bringup/            # 系统级启动编排包
│   └── rm65_description/           # 机器人描述与可视化包
│       ├── launch/
│       ├── meshes/
│       └── urdf/
├── website/                       # VitePress 文档站
│   ├── docs/
│   │   ├── .vitepress/
│   │   ├── architecture/
│   │   ├── development/          # 功能契约与开发者手册
│   │   ├── guide/
│   │   ├── models/
│   │   └── troubleshooting.md
│   ├── package.json
│   └── playwright.config.ts
├── docker-compose.yml
├── functions.zsh                 # 可选 Zsh 开发与部署函数
└── README.md
```

## ROS 2 包结构

| 包 | 职责 | 主要入口 |
| --- | --- | --- |
| `rm65_description` | RM65 URDF、mesh、单臂/三臂 TF 与 RViz 2 | `display.launch.py`、`three_robots.launch.py` |
| `xbox_controller_driver` | 订阅标准 Joy 消息并输出 Xbox 按键状态变化 | `xbox_controller_node` |
| `realman_bringup` | 统一组合三臂、RViz、`game_controller_node` 与输入处理节点 | `system.launch.py` |

资源和配置职责如下：

| 路径 | 用途 |
| --- | --- |
| `launch/display.launch.py` | 校验型号并启动三个可视化节点 |
| `launch/three_robots.launch.py` | 从根配置创建 `/l`、`/m`、`/r` 三组节点与 TF |
| `urdf/*.urdf` | 五个型号的机器人描述与完整 TF 关系 |
| `meshes/<model>/*.STL` | 每个 link 的视觉与碰撞网格 |
| `config/ros/three_robots.yaml` | 三台机械臂的位置、朝向、型号和命名配置 |
| `config/ros/xbox_controller.yaml` | Linux 手柄读取参数、按键名称和日志策略 |
| `config/rviz/*.rviz` | Fixed Frame、视角、RobotModel 与 TF 配置 |
| `config/website/vitepress.config.mts` | 网站导航、侧栏、搜索和构建路径配置 |
| `CMakeLists.txt` | 安装 launch、URDF、mesh 与 RViz 资源 |
| `package.xml` | Humble 运行依赖和 ament 包元数据 |

URDF 使用标准 ROS 包 URI 引用网格：

```xml
<mesh filename="package://rm65_description/meshes/RM65-B/link_1.STL" />
```

安装后由 ament 索引定位 `rm65_description` 的共享目录，因此工作空间可以放在任意绝对路径。

## 运行节点

```text
joint_state_publisher_gui ── /joint_states ──▶ robot_state_publisher
                                                     │
                                   /tf + /tf_static  │
                                                     ▼
                                                   rviz2

robot_state_publisher ── /robot_description ────────▶ rviz2

/dev/input/*-event-joystick ──▶ game_controller_node ── /input/joy ──▶ xbox_controller_node
                                                         └──▶ 按键边沿日志
```

`display.launch.py` 在创建节点前读取所选 URDF，并把文本作为 `robot_description` 参数交给 `robot_state_publisher`。RViz 使用该描述加载相同的模型资源。

## Docker 边界

Compose 使用 host network 和 host IPC，并挂载两个只读/受限的显示资源：

| 主机资源 | 容器路径 | 模式 |
| --- | --- | --- |
| `/tmp/.X11-unix` | `/tmp/.X11-unix` | 读写 socket |
| `$XAUTHORITY` | `/tmp/.Xauthority` | 只读 |

容器默认设置 `ROS_DOMAIN_ID=65` 和 `ROS_LOCALHOST_ONLY=0`。使用 host network 后，同一网络中的 Humble 主机可以加入该 ROS 图进行远程调试；主机防火墙必须允许 DDS UDP 流量。带 RViz 的服务额外设置 `QT_X11_NO_MITSHM=1` 和 `LIBGL_ALWAYS_SOFTWARE=1`，降低主机与容器的 OpenGL 驱动冲突概率。

`realman_bringup` 把主机 `/dev/input` 只读映射到容器，并等待
`*-event-joystick` 设备出现后启动 Joy 驱动。`realman_bringup_remote` 不启动设备驱动和 GUI，
只保留 ROS 节点供远程 Joy 发布者调试。设备和按键契约见 [Xbox 手柄输入](../development/xbox-controller)，
系统组合方式见[系统 Bringup](../development/system-bringup)。

`xbox_controller_test` 是独立的实体手柄验证服务，只启动 `/input/joy_node` 和
`/input/xbox_controller`，不创建机械臂、TF 或 RViz 节点。

Bringup 同时设置 `RCUTILS_COLORIZED_OUTPUT=1` 和 `ROS_LOG_DIR`。每次运行在宿主机 `logs/YYYYMMDD_HHMMSS/` 下保存 ROS 2 官方日志；官方文件名包含节点名、进程号和时间戳。日志规范由项目 skill `.agents/skills/ros2-logging-conventions/SKILL.md` 维护。
