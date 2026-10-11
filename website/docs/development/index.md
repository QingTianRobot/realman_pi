---
title: 开发者手册
description: realman_pi 开发者入口：按任务找到对应页面，了解阅读顺序、模块边界、开发约定和文档完成标准。
---

# 开发者手册

本手册记录项目**当前有效**的功能契约、实现边界、配置来源和验证方法。它不是提交日志：功能、配置、运行方式或接口变化时，对应页面必须与代码在同一次提交中更新。

## 第一次读

1. [系统架构总览](../architecture/overview)——运行拓扑、分层所有权、关键不变量。
2. [仓库结构](../architecture/package)——目录与 ROS 2 包地图。
3. [ROS 2 接口总表](../reference/ros-interfaces)和[配置文件总表](../reference/configuration)——查名字、类型、谁拥有它。
4. [测试与验证](./testing)——怎么跑测试，提交前检查什么（项目没有 ROS CI，需要自己跑）。

## 我要做什么

| 任务 | 从这里开始 | 相关权威配置 |
| --- | --- | --- |
| 启动、构建、部署、选择启动入口 | [启动入口索引](./startup-entries)、[系统 Bringup](./system-bringup) | `rm65`、`config/docker/compose.yaml` |
| 登录生产机排查、部署、只重启一个组件、清日志 | [生产运维手册](./production-operations) | `config/docker/compose.yaml`、`.env` |
| 改机械臂运动、限速、取消/停止、坐标系 | [驱动与运动控制](./realman-driver-scaffold)、[Action 开发与测试](./realman-action-development) | `config/ros/realman_{driver,motion,coordinates}.yaml` |
| 查睿尔曼 Python API、核对版本与安全 | [Python 驱动查询](./realman-python-driver) | `config/python/realman-sdk-requirements.txt` |
| 改输入模式、键盘控制、Web override | [行为树控制权与 Mock 测试](./behavior-tree-control) | `config/behavior-trees/control.xml`、`config/ros/{behavior_tree,keyboard_control}.yaml` |
| 改 Pika 遥操作（位置 / 速度 / Mixed / replay） | [Pika 遥操作](./pika-teleop) | `config/ros/pika_config.yaml` |
| 写新的行为树节点或任务树 | [行为树机械臂移动 Demo](./behavior-tree-motion) | `config/behavior-trees/` |
| 改浏览器控制台、URDF 影子、WebSocket 协议 | [WebSocket 浏览器控制](./realman-web-control) | `config/ros/realman_web_control.yaml` |
| 改夹爪、串口、流式控制 | [Changingtek 夹爪控制](./gripper-control) | `config/ros/gripper.yaml` |
| 录制示教数据、导出 LeRobot、在网页回放与整理 episode | [独立数据录制平台](./recording-platform) | `config/ros/recording.yaml`、`config/python/recording-requirements.txt` |
| 接入 VLA 策略服务 | [VLA 策略桥接节点](./policy-bridge) | `config/ros/policy_bridge.yaml` |
| 相机配置、手眼标定 | [相机指南](../guide/cameras)、[三臂 ChArUco 手眼标定](./camera-calibration) | `config/ros/{cameras_ros2,camera_calibration}.yaml` |
| 测量速度跟随（增益、滞后、串轴） | [笛卡尔速度跟随测试](./velocity-follow-test) | `config/ros/{keyboard_control,realman_motion}.yaml` |
| 三臂布局、TF、RViz | [三臂配置驱动可视化](./three-arm-visualization)、[TF 树](../architecture/tf-tree) | `config/ros/three_robots.yaml` |
| Xbox 手柄输入 | [Xbox 手柄输入](./xbox-controller) | `config/ros/xbox_controller.yaml` |

## 模块与页面

| 模块 | 页面 | 关键内容 |
| --- | --- | --- |
| 运行与部署 | [启动入口索引](./startup-entries)、[系统 Bringup](./system-bringup)、[生产运维手册](./production-operations) | `functions.zsh` 每个入口的用途；launch 开关组合；镜像源；生产同步；日志 |
| 驱动 | [驱动与运动控制](./realman-driver-scaffold)、[Action 开发与测试](./realman-action-development)、[Python 驱动查询](./realman-python-driver) | 三臂 ROS 图；ownership / generation / lockout 状态机；速度与位姿 session；坐标 motion gate；`controller_info`；IK 回退 |
| 控制与输入 | [行为树控制权](./behavior-tree-control)、[行为树 Demo](./behavior-tree-motion)、[Pika 遥操作](./pika-teleop)、[Web 控制](./realman-web-control)、[Xbox](./xbox-controller)、[速度跟随测试](./velocity-follow-test) | 输入模式目录；键盘 lease；Pika 三种模式；one-shot 退出与 UNKNOWN 排查 |
| 末端与感知 | [夹爪](./gripper-control)、[手眼标定](./camera-calibration)、[三臂可视化](./three-arm-visualization) | 串口独占与 4 Hz 流式限速；原子采样；TF 与 3D 预览 |
| 数据 | [独立数据录制平台](./recording-platform) | 只订阅的 MCAP/JPEG 录制；预检；LeRobot v3 导出与自动导出队列；Web 回放、回收站、子任务标注 |
| 策略 | [VLA 策略桥接](./policy-bridge) | OpenPI WebSocket 协议；滚动时域；模式门控与看门狗 |
| 工程 | [测试与验证](./testing)、[功能文档同步](./documentation-workflow) | 测试矩阵；文档完成标准 |

## 开发约定

- **配置只有一份**：权威配置在根目录 `config/`，带注释说明用途、单位、取值范围（`project-config-layout` skill）。
- **Lint**：`ruff check --config config/python/ruff.toml src tools scripts docker` 必须通过（CI 会跑）；规则和 vendor 排除项见该配置的注释。
- **日志**：只用 `rclpy` / `rclcpp` 官方日志接口，保留彩色 rcutils 输出和 `logs/YYYYMMDD_HHMMSS/` 时间目录（`ros2-logging-conventions` skill）。
- **安全默认值**：行为树 router 默认 dry-run；限值分"普通会话"与"Pika 硬上限"两层；坐标失配会关闭 motion gate。
- **vendor 目录不改**：`src/sensor/OrbbecSDK_ROS2`、`src/sensor/realsense`、`third_party/behavior_tree_cpp` 是快照，差异通过配置与自己的包表达。
- **提交习惯**：功能分支 + PR 合入 `main`；提交说明写清验证了什么、没验证什么。`./rm65 sync` 只同步 clean 的 `main`。
- **AI 助手**：项目级 skill 位于 `.agents/skills/`（架构、驱动、行为树、夹爪、Pika 两端调试、日志、文档同步），与本手册同步维护，冲突时以仓库实现和本手册为准。

## 文档完成标准

一个功能只有在以下内容保持一致后才算完成：

- 功能契约与代码当前行为一致，页面不留已被取代的旧说法；
- `config/` 下的配置字段、单位、约束和默认值已在配置文件注释和对应页面说明；
- ROS 节点、命名空间、话题、Action/Service 已反映到[接口总表](../reference/ros-interfaces)；
- 构建、运行及验证命令可以从文档指定目录执行；
- 已知限制和失败方式没有被隐藏；
- `cd website && npm run build` 成功，相关页面测试通过。

## 维护方式

优先修改已有页面，使其始终描述当前系统；只有出现独立的功能边界时才新增页面，不为每次提交创建日期型记录。数值以配置文件为准——页面里复制的数值要么能被一眼对照（并标明出处），要么改写成"见某配置文件"，避免漂移。用户操作说明放在[快速开始](../guide/getting-started)和[故障排查](../troubleshooting)，开发者手册负责解释实现、接口和验证依据。

历史设计规格与实施计划保存在仓库 `docs/superpowers/specs|plans/`，它们记录当时的设计意图，**不随代码更新**；行为以代码和本手册为准。项目级 skill `document-feature-updates` 用于在功能完成前执行以上检查，细则见[功能文档同步](./documentation-workflow)。
