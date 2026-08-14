---
title: 睿尔曼 Python 驱动查询 Skill
description: 使用项目内睿尔曼 Python API 文档设计、实现和排查 ROS 2 驱动。
---

# 睿尔曼 Python 驱动查询 Skill

`realman-python-driver` 是面向后续睿尔曼驱动开发的项目级 Skill。它把根目录 `doc/` 中的官方 Python API 整理作为查询源，引导开发者按接口、结构体、枚举、错误码和固件限制定位资料，再将睿尔曼 SDK 能力映射为 ROS 2 驱动接口。

## 触发范围

以下任务应使用该 Skill：

- 连接 RM65 或其他睿尔曼机械臂，管理 SDK 句柄和线程模式；
- 实现运动、状态、坐标算法、力控、安全、末端执行器或在线编程接口；
- 接入控制器/工具端 IO、RS485、Modbus 或 UDP 主动上报；
- 查询 `Robotic_Arm` 方法签名、结构体字段、枚举和 API2 错误码；
- 排查 SDK、机械臂固件、控制器版本或末端硬件的兼容性问题；
- 将睿尔曼 Python SDK 能力设计成 ROS 2 topic、service、action 或 parameter。

## 文档数据流

```text
睿尔曼官方 Python 文档 V1.7.13
                │
                ▼
         realman_pi/doc/
     主题指南、API、类型、错误码
                │
                ▼
.agents/skills/realman-python-driver/SKILL.md
       按任务检索与驱动开发约束
                │
                ▼
       src/driver/ ROS 2 驱动实现
```

本地快照整理于 2026-08-13，覆盖 1 个快速开始页面、30 个功能类中的 298 个方法章节、61 个结构体和 15 组枚举。官方在线文档与目标控制器固件仍是最终依据。

## 查询方式

在项目根目录使用精确接口名或类型名搜索：

```bash
rg -n "rm_movej|rm_movel|CANFD" doc/10-api-index.md doc/02-motion-and-teaching.md
rg -n "rm_pose_t|rm_current_arm_state_t" doc/09-types-and-structures.md
rg -n "RM_TRIPLE_MODE_E|-5|-6|Modbus RTU" doc
```

Skill 会先选择主题文件，再查询完整方法和类型索引。涉及精确参数范围、返回对象、硬件要求或固件差异时，还必须打开文档中链接的睿尔曼官方页面。

主要入口：

| 本地路径 | 内容 |
| --- | --- |
| `doc/README.md` | 覆盖范围和阅读入口 |
| `doc/01-getting-started.md` | SDK 安装、连接、线程模式和资源释放 |
| `doc/02-motion-and-teaching.md` | 运动规划、透传、跟随和示教 |
| `doc/03-state-and-configuration.md` | 状态、关节、控制器和系统配置 |
| `doc/04-coordinate-and-algorithm.md` | 坐标系、正逆运动学、DH 和自碰撞 |
| `doc/05-force-and-safety.md` | 力控、围栏、虚拟墙和碰撞保护 |
| `doc/06-end-effectors-and-expansion.md` | 夹爪、灵巧手、升降和 RM Plus |
| `doc/07-io-and-protocols.md` | IO、RS485、Modbus 和 UDP |
| `doc/08-project-and-waypoints.md` | 在线编程和全局路点 |
| `doc/09-types-and-structures.md` | 61 个结构体和 15 组枚举 |
| `doc/10-api-index.md` | 30 个功能类和 298 个方法章节 |
| `doc/11-examples-errors-and-versions.md` | 官方示例、错误码和版本兼容性 |

## 驱动开发约束

- 睿尔曼 SDK 调用集中在驱动实现内部，句柄的连接、停止、断开和异常清理必须明确。
- 多机械臂使用独立句柄和 ROS 命名空间，不在未确认线程安全的情况下共享 SDK 可变状态。
- 连续状态使用 topic，短请求/响应配置使用 service，长时间且可取消的运动或程序执行优先使用 action；最终接口仍需服从项目已有契约。
- 厂商单位只在边界转换一次，并明确记录度/弧度、米/毫米、N/Nm 和厂商缩放整数。
- UDP 实时状态需要三线程模式，同时核对目标 IP、端口、推送使能、防火墙和回调生命周期。
- CANFD 等透传接口要求稳定周期和平滑轨迹，不能把透传接口当作安全规划器。
- 真实运动按“只读连接、仿真、低速真机、专项硬件功能”的顺序验证，并保留可触达的急停。

新增连接或行为配置时，应用 `project-config-layout` Skill，把带单位、范围和硬件假设注释的权威配置放到根目录 `config/`。ROS 2 节点同时应用 `ros2-logging-conventions`，功能完成后应用 `document-feature-updates` 更新本手册。

## 使用和验证

Skill 位于 `.agents/skills/realman-python-driver/`，随仓库版本控制。显式调用示例：

```text
使用 $realman-python-driver 查询 rm_movej 的参数和错误处理，并设计对应 ROS 2 action。
```

修改 Skill 或 `doc/` 后执行：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/realman-python-driver
git diff --check
cd website
npm run build
```

验证还应确认 `SKILL.md` 引用的本地 Markdown 文件存在，API 文档更新后覆盖统计仍与官方 sitemap 一致。
