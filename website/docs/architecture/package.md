---
title: 仓库结构
description: realman_pi 仓库的目录职责、ROS 2 包清单、文档来源和 Docker 边界。
---

# 仓库结构

仓库把运行环境、ROS 2 包、文档和权威配置分开管理：前端依赖不会进入 ROS 工作空间，容器构建也不会安装网站依赖。组件之间的关系先看[系统架构总览](./overview)。

## 目录

```text
realman_pi/
├── .agents/skills/           项目级 AI 开发 skill（架构、驱动、行为树、夹爪、日志、文档同步…）
├── .github/workflows/        GitHub Pages 部署（只做 website/ 的构建与发布）
├── config/                   全部权威配置：ros/、behavior-trees/、docker/、python/、rviz/、web-control/、website/
├── doc/                      睿尔曼官方 Python API 的中文整理（厂商 API 速查，不是本项目文档）
├── docker/                   容器入口脚本：ros_entrypoint.sh、行为树容器入口
├── docs/superpowers/         历史设计规格（specs/）与实施计划（plans/），记录"为什么这样设计"
├── scripts/                  行为树启动器 bt.sh、bt-test.sh 及其 shell 测试、Pika 位姿模拟
├── src/
│   ├── behavior/             realman_bt（执行器与 router）、realman_bt_mock
│   ├── driver/               realman_robot_driver、realman_msgs、realman_web_control、xbox_controller_driver
│   ├── gripper/              gripper_ros2、gripper_ros2_msgs（Changingtek 夹爪）
│   ├── policy_bridge/        VLA 策略 WebSocket ⇄ ROS 2 协议桥
│   ├── recording/            数据录制与回放：realman_recording、realman_recording_msgs
│   ├── realman_bringup/      系统 launch 编排
│   ├── rm65_description/     URDF、mesh、TF、RViz launch
│   ├── sensor/               realman_camera_calibration + Orbbec / RealSense 厂商驱动（vendor）
│   ├── sensor_bringup/       相机 launch
│   └── camera_stream/        已弃用的 RTSP/TCP 相机推流
├── tests/                    行为树启动器、容器入口、./rm65 入口的集成测试
├── third_party/              behavior_tree_cpp 快照（行为树库 + 只读编辑器前端）
├── tools/                    velocity_follow：不依赖 ROS 的速度跟随测量工具
├── website/                  VitePress 文档站与网页端测试
├── docker-compose.yml        指向 config/docker/compose.yaml 的 discovery adapter
├── functions.zsh             可选的 Zsh 开发与部署函数（rm65_* 前缀）
├── rm65                      统一入口（up / down / bt / sync …）
├── start_sensors.sh          宿主机相机启动脚本
└── README.md
```

`.env`（仓库根，已纳入版本控制）只放非机密的运行时变量；见 [CLI 与环境变量](../reference/cli-and-env)。

## ROS 2 包

| 包 | 语言 | 职责 | 主要入口 |
| --- | --- | --- | --- |
| `realman_msgs` | IDL | Action / Service / Msg：运动、坐标、输入模式、标定 | — |
| `realman_robot_driver` | Python | 三臂连接、回读、运动协调、速度/位姿 session、坐标管理、IK、`controller_info` | `three_realman_drivers.launch.py`、`realman_driver_node` |
| `realman_web_control` | Python | 浏览器 ⇄ ROS 桥、URDF 影子、键盘 lease、标定页 | `web_control.launch.py`、`web_control_node` |
| `realman_bt` | C++ / Python | 行为树执行器、输入模式、`keyboard_control_router`、`pika_control_router` | `control_router.launch.py`、`arm_move.launch.py` |
| `realman_bt_mock` | Python | 无硬件 mock 图 | `behavior_tree_mock.launch.py` |
| `gripper_ros2`、`gripper_ros2_msgs` | Python / IDL | 夹爪 manager：串口独占、service/topic | `gripper_manager` |
| `realman_recording`、`realman_recording_msgs` | Python / IDL | 只订阅的数据录制：recorder、预检、LeRobot v3 导出、Web 实时与回放页 | `recording.launch.py`、`recording_runtime_probe` |
| `policy_bridge` | Python | 策略 WebSocket 桥与 mock 策略服务 | `policy_bridge_node`、`mock_policy_server` |
| `realman_camera_calibration` | Python | ChArUco 采样与手眼求解 | `camera_calibration_node` |
| `sensor_bringup` | launch | Orbbec ×3 + D435 的 ROS 2 出图 | `cameras_ros2.launch.py` |
| `xbox_controller_driver` | C++ | 订阅 `/input/joy`，输出按键边沿日志 | `xbox_controller_node` |
| `realman_bringup` | launch | 统一组合驱动、TF、RViz、夹爪、Web、标定 | `system.launch.py`、`remote_rviz.launch.py` |
| `rm65_description` | 资源 / launch | RM65 URDF、mesh、三臂 TF、RViz | `display.launch.py`、`three_robots.launch.py` |

`src/sensor/OrbbecSDK_ROS2`、`src/sensor/realsense/*` 和 `third_party/behavior_tree_cpp` 是 vendor 快照，**不要在其中做项目改动**；需要的差异通过配置、launch 参数或本项目自己的包表达。

## 文档来源

| 位置 | 内容 | 是否权威 |
| --- | --- | --- |
| `website/docs/` | 本站：用户指南、架构、开发者手册、参考 | **是**：描述当前行为 |
| `.agents/skills/` | 给 AI 助手的操作规则和代码地图 | 与本站同步维护，以仓库实现为准 |
| `docs/superpowers/specs|plans/` | 历史设计与实施计划 | 否：记录当时的设计意图，行为以代码和本站为准 |
| `.superpowers/sdd/` | 子任务实施报告 | 否：过程记录 |
| `doc/` | RealMan 官方 Python API 中文整理 | 厂商接口速查，驱动开发时配合 `realman-python-driver` skill 使用 |

## Docker 边界

Compose 使用 host network 与 host IPC；`./config` 以只读方式挂到 `/opt/rm65_ws/config`，`./logs` 可写。需要写入的目录（`config/web-control/joint-records`、`realman_bringup_remote` 的 `config/ros`）单独声明为可写。完整服务列表见[系统 Bringup](../development/system-bringup#docker-服务)。

- 容器从 `.env` 读取 `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY`、`FASTDDS_BUILTIN_TRANSPORTS=UDPv4`。host network 下，同网络的 Humble 主机可加入该 ROS 图；防火墙必须放行 DDS UDP。
- 带 RViz 的服务额外挂载 `/tmp/.X11-unix` 与 `$XAUTHORITY`；`realman_bringup_remote`、`realman_web_control` 不需要显示变量。
- `realman_bringup_remote` 额外映射 `/dev/realman/gripper_{right,left,mid}` 稳定别名，不要把易变的 `/dev/ttyUSB*` 写进生产配置。
- Bringup 设置 `RCUTILS_COLORIZED_OUTPUT=1` 和 `ROS_LOG_DIR`，每次运行在 `logs/YYYYMMDD_HHMMSS/` 保存官方节点日志。规范见 `ros2-logging-conventions` skill。

## 运行节点（描述与关节状态）

```text
RealMan SDK ──▶ /l|m|r/realman_driver
                         │
                         └── /l|m|r/joint_states ──▶ /l|m|r/robot_state_publisher
                                                               │
                                             /tf + /tf_static  │
                                                               ▼
                                                     rviz2 / Web URDF 影子

/l|m|r/robot_state_publisher ── /l|m|r/robot_description ──▶ rviz2
```

`system.launch.py` 默认启动三台真实驱动，并让每个 namespaced `robot_state_publisher` 只订阅对应驱动的 `joint_states`；设置 `start_driver:=false` 才改用 `joint_state_publisher`（模型查看模式）。

## 描述包资源

| 路径 | 用途 |
| --- | --- |
| `launch/display.launch.py` | 校验型号并启动单臂可视化 |
| `launch/three_robots.launch.py` | 从 `config/ros/three_robots.yaml` 创建 `/l`、`/m`、`/r` 三组节点与 TF |
| `urdf/*.urdf` | 五个型号的描述与完整 TF 关系 |
| `meshes/<model>/*.STL` | 每个 link 的视觉与碰撞网格 |
| `urdf/ctag2f90c.urdf`、`meshes/ctag2f90c/` | Changingtek AG2F90-C 夹爪（厂商模型，本地有两处修改），挂载配置见 `config/ros/end_effectors.yaml` |

URDF 使用标准 ROS 包 URI 引用网格，安装后由 ament 索引定位共享目录，工作空间可放在任意绝对路径：

```xml
<mesh filename="package://rm65_description/meshes/RM65-B/link_1.STL" />
```
