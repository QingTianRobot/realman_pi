---
title: 配置文件总表
description: 仓库根目录 config/ 下每个配置文件的职责、消费者、修改后的生效方式，以及配置之间的约束关系。
---

# 配置文件总表

所有运行配置都在仓库根目录 [`config/`](https://github.com/QingTianRobot/realman_pi/tree/main/config)，源码包里**不允许**再放第二份。这是项目约定（`project-config-layout` skill）：配置文件必须带注释，说明用途、单位、取值范围和与其它配置的关系。Docker 把 `./config` 以只读方式挂载到容器的 `/opt/rm65_ws/config`，所以**修改 YAML 后重启对应服务即可生效，不需要重建镜像**。

本页只回答"哪个文件管什么、谁读它、改了怎么生效"。字段的具体含义和单位以文件内注释为准，不在这里复制数值，以免漂移。

## ROS 运行配置 `config/ros/`

| 文件 | 管什么 | 消费者 | 专题页 |
| --- | --- | --- | --- |
| `realman_driver.yaml` | 三臂控制器 IP / 端口 / SDK 线程模式 / 重连与回读周期 | `realman_robot_driver` | [驱动与运动控制](../development/realman-driver-scaffold) |
| `realman_driver_mock.yaml` | 离线 mock 驱动（TEST-NET 地址，永不连接真机） | `realman_driver_test` 服务 | [驱动与运动控制](../development/realman-driver-scaffold) |
| `realman_coordinates.yaml` | 每臂工具/工作坐标的**期望状态**（`tcpgrip`、`cell`、`pikabase`），启动时校验并自动修复失配 | 驱动 `CoordinateManager`、BT、Web | [Action 开发与测试](../development/realman-action-development) |
| `realman_motion.yaml` | 每臂运动限值：普通会话 `max_*`、Pika 专用 `hard_max_*`、控制周期、watchdog、`pose_max_joint_speed_dps` | 驱动、Web、键盘/Pika router | [驱动与运动控制](../development/realman-driver-scaffold#参数) |
| `keyboard_control.yaml` | 键位、心跳/超时、速度比例（`linear_speed_fraction`）、键盘夹爪键 | `realman_web_control`、`keyboard_control_router` | [行为树控制权](../development/behavior-tree-control) |
| `pika_config.yaml` | Pika 入场姿态 `pika_default_pose`、`pika_velocity`、`pika_mixed` | `pika_control_router`、`control_router.launch.py` | [Pika 遥操作](../development/pika-teleop) |
| `behavior_tree.yaml` | 持久输入路由器参数（tick 频率、切换超时、安全回退模式） | `realman_bt_executor` | [行为树控制权](../development/behavior-tree-control) |
| `gripper.yaml` | 夹爪串口拓扑（稳定别名）、行程、速度/力、流式限速 | `gripper_manager`、Web | [夹爪控制](../development/gripper-control) |
| `realman_web_control.yaml` | Web 服务监听地址/端口、允许来源、客户端数、模式发现与 override 超时 | `realman_web_control` | [Web 控制](../development/realman-web-control) |
| `three_robots.yaml` | 三臂在 `world` 中的位姿与型号（**标定结果**） | 描述包、RViz、网站 3D 预览 | [三臂可视化](../development/three-arm-visualization) |
| `end_effectors.yaml` | 末端夹爪定义（AG2F90-C）与每臂安装位姿；被文档站三维场景和 `:8765` Web 控制页读取（后者随夹爪位置反馈实时开合），RViz/驱动 TF 尚未包含 | `website/scripts/sync-three-robots.mjs`、`model_manifest.py` | [夹爪控制](../development/gripper-control#ag2f90-c-夹爪模型) |
| `cameras_ros2.yaml` | 三路 Orbbec + D435 的串号、分辨率、帧率、同步策略；可被 `cameras_ros2.local.yaml` 深合并覆盖 | `sensor_bringup`、`rm65_camera_ros2` | [相机指南](../guide/cameras) |
| `camera_calibration.yaml` | ChArUco 板参数、话题、帧、阈值、服务名 | `realman_camera_calibration` | [手眼标定](../development/camera-calibration) |
| `policy_bridge.yaml` | 策略服务地址、观测/动作 topic、滚动时域、看门狗 | `policy_bridge` | [策略桥接](../development/policy-bridge) |
| `xbox_controller.yaml` | SDL 手柄去抖、按键名称、日志策略 | `game_controller_node`、`xbox_controller_driver` | [Xbox 手柄](../development/xbox-controller) |

`pika_config.yaml` 和 `keyboard_control.yaml` 不能越过 `realman_motion.yaml` 的限值：router 在启动时校验，超限直接拒绝启动，而不是在第一次运动时才失败。

## 行为树 `config/behavior-trees/` 与 `config/behavior-tree/`

| 文件 | 说明 |
| --- | --- |
| `control.xml` | 持久输入路由树（`./rm65 bt control`）：模式目录、分支、`ReactiveSequence` 结构 |
| `move.xml` / `three.xml` | 单臂 / 三臂分阶段 MoveJ（`./rm65 bt l|m|r|three`） |
| `tool_x.xml` / `pick_task.xml` / `approach_and_grasp.xml` | 定时笛卡尔速度和任务示例 |
| `config/behavior-tree/frontend.ts` | 行为树只读监视器前端的共享设置 |

按 XML 文件名启动：`./rm65 bt <name>`（扩展名可省略）。

## Docker 与 Python `config/docker/`、`config/python/`

| 文件 | 说明 |
| --- | --- |
| `docker/compose.yaml` | 全部 Compose 服务；根目录 `docker-compose.yml` 只是 discovery adapter |
| `docker/ros2-humble-rviz.Dockerfile` | 多阶段镜像：Node 构建 BT 编辑器静态文件 → ROS 2 Humble 运行镜像 |
| `python/realman-sdk-requirements.txt` | 固定 `Robotic_Arm==1.1.6`（只有官方 PyPI 提供，镜像源需回退） |
| `python/ik-requirements.txt` | 自定义 IK 依赖 `casadi`；**刻意不含 pinocchio**（见驱动页） |
| `python/gripper-requirements.txt` / `policy-bridge-requirements.txt` | 夹爪 Modbus 与策略桥传输依赖 |

## 其它

| 路径 | 说明 |
| --- | --- |
| `config/rviz/*.rviz` | 单臂 / 三臂 / 相机 RViz 布局 |
| `config/web-control/joint-records/` | Web 保存的关节记录，按 `l/ m/ r/` 分目录（运行时可写） |
| `config/web-control/*.mjs`、`config/website/*` | Web 前端 / 文档站的 Vite、Playwright、VitePress 配置 |
| `.env`（仓库根） | Docker Compose 和 `functions.zsh` 的运行时变量，见[CLI 与环境变量](./cli-and-env) |

## 修改配置后如何生效

| 修改的内容 | 生效方式 |
| --- | --- |
| `config/ros/*.yaml`、`config/behavior-trees/*.xml` | 重启使用它的服务（`docker compose restart <service>` 不会重新读取 `.env`；改 `.env` 需重建容器环境，见 CLI 页） |
| `config/python/*.txt`、`ros2-humble-rviz.Dockerfile` | 需要 `./rm65 build` 重新构建镜像 |
| `config/ros/three_robots.yaml` | 重启驱动/RViz；网站在下一次构建时自动同步 3D 预览 |
| `config/web-control/joint-records/` | 立即生效（运行时可写） |

## 改配置时的约束

1. 只在 `config/` 增删权威文件，并带有解释"为什么是这个值"的注释，而不是复述键名。
2. 限值有两层：普通会话上限（`max_*`）与 Pika 专用硬上限（`hard_max_*`）；调高前者会放宽键盘、Web 和行为树，调高后者只影响 Pika。
3. 坐标配置是**期望状态**：驱动启动时若回读与配置不一致，会自动写入控制器并回读确认，写失败会关闭该臂的 motion gate。改质心、位姿前确认现场安全。
4. 同一 ROS domain 内，`config/ros/` 中的话题名是契约；改名要同步更新[接口总表](./ros-interfaces)和消费者测试。
