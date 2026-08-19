---
title: 开发者手册
description: realman_pi 功能契约、实现边界、配置来源和验证方法的维护入口。
---

# 开发者手册

本手册记录项目当前有效的功能行为和开发约束。功能实现、配置、运行方式或接口发生变化时，对应文档必须与代码在同一次提交中更新。

## 功能文档

| 功能 | 主要内容 | 权威配置 |
| --- | --- | --- |
| [功能文档同步](./documentation-workflow) | 功能完成门槛、Web 手册结构和验证流程 | `.agents/skills/document-feature-updates/SKILL.md` |
| [睿尔曼 Python 驱动查询 Skill](./realman-python-driver) | Python API 文档检索、驱动开发约束、版本与安全核对流程 | `.agents/skills/realman-python-driver/SKILL.md` |
| [睿尔曼三臂驱动与运动控制](./realman-driver-scaffold) | 三臂关节回读、可取消运动、坐标系、末端速度、RViz 和 mock 验证 | `config/ros/realman_driver.yaml`、`config/ros/realman_coordinates.yaml`、`config/ros/realman_motion.yaml` |
| [睿尔曼 Action 开发与测试](./realman-action-development) | Action IDL、生命周期、安全状态机、速度 session、扩展步骤和测试矩阵 | `src/driver/realman_msgs/action/`、`config/ros/realman_motion.yaml` |
| [WebSocket 浏览器控制与 URDF 影子](./realman-web-control) | WebSocket 直连控制、坐标状态、Action feedback/result、滑轨影子和软件停止 | `config/ros/realman_web_control.yaml`、`src/driver/realman_web_control/` |
| [三臂配置驱动可视化](./three-arm-visualization) | ROS 2 三臂命名空间、完整 TF、RViz 2 和 Web 三维场景的数据流 | `config/ros/three_robots.yaml` |
| [Xbox 手柄输入](./xbox-controller) | SDL event 设备、`/input/joy`、C++ 按键边沿和输入测试 | `config/ros/xbox_controller.yaml` |
| [系统 Bringup](./system-bringup) | 三臂、RViz、输入节点、远程运行和日志的启动编排 | `config/docker/compose.yaml` |

ROS 节点日志统一遵守项目 skill [`ros2-logging-conventions`](https://github.com/QingTianRobot/realman_pi/blob/main/.agents/skills/ros2-logging-conventions/SKILL.md)：官方 ROS 2 打印接口、彩色 rcutils 输出、时间目录和节点日志文件。

## 文档完成标准

一个功能只有在以下内容保持一致后才算完成：

- 功能契约与代码当前行为一致；
- 根目录 `config/` 下的配置字段、单位、约束和默认值已说明；
- ROS 节点、命名空间、话题和 TF 数据流已说明；
- 构建、运行及验证命令可以从文档指定目录执行；
- 已知限制和失败方式没有被隐藏；
- `website/` 下执行 `npm run build` 成功，相关页面测试通过。

## 维护方式

优先修改已有功能页，使其始终描述当前系统。只有出现独立的功能边界时才新增页面，不为每次提交创建重复的日期型记录。用户操作说明仍放在[快速开始](../guide/getting-started)和[故障排查](../troubleshooting)中，开发者手册负责解释实现、接口和验证依据。

项目级 Skill `document-feature-updates` 位于 `.agents/skills/document-feature-updates/`，用于在每次功能完成前执行以上检查。
