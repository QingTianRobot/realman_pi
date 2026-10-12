# realman_pi

ROS 2 Humble 控制平台，面向三台 RealMan RM65 机械臂（左 `l`、中 `m`、右 `r`）：

- **驱动与运动**：RealMan Python SDK 三臂驱动，可取消的 MoveJ / MoveL / 连续轨迹，笛卡尔速度与位姿 session，坐标 motion gate，断线原地重连。
- **遥操作**：Web 键盘、Pika 手持设备（位置 / 速度 / Mixed）、Xbox 手柄，由行为树输入模式统一选择控制权。
- **行为树**：常驻输入路由器、分阶段 MoveJ 任务树、只读运行监视器。
- **末端与感知**：Changingtek 夹爪（Modbus RTU）、三路 Orbbec 腕部相机 + RealSense D435、ChArUco 手眼标定。
- **策略**：OpenPI WebSocket ⇄ ROS 2 的 VLA 策略桥。
- **数据**：只订阅驱动输出的录制平台（MCAP/JPEG、预检、LeRobot v3 导出）和 Web 回放整理页。
- **底座**：RM65 URDF、三臂 TF 与 RViz 2；Web 控制台带 URDF 影子。

所有组件运行在可复现的 Docker 环境中，权威配置只有一份：根目录 `config/`。

## 文档

**https://qingtianrobot.github.io/realman_pi/**（VitePress 源码在 `website/`，由 `.github/workflows/deploy-pages.yml` 部署）

| 想做什么 | 入口 |
| --- | --- |
| 启动系统 | [快速开始](https://qingtianrobot.github.io/realman_pi/guide/getting-started) |
| 理解整体设计 | [系统架构总览](https://qingtianrobot.github.io/realman_pi/architecture/overview) |
| 改代码 / 加功能 | [开发者手册](https://qingtianrobot.github.io/realman_pi/development/) |
| 查接口、配置、命令 | [ROS 2 接口](https://qingtianrobot.github.io/realman_pi/reference/ros-interfaces)、[配置](https://qingtianrobot.github.io/realman_pi/reference/configuration)、[CLI 与环境变量](https://qingtianrobot.github.io/realman_pi/reference/cli-and-env) |
| 现场出问题 | [故障排查](https://qingtianrobot.github.io/realman_pi/troubleshooting) |

## 快速开始

在连接三台控制器（`192.168.30.123/125/124`，端口 `8080`）的工控机上，从仓库根目录：

```bash
./rm65 build          # 首次或代码更新后：重建驱动与 Web 控制镜像
./rm65 up             # ROS 2 彩色相机 + 三臂驱动 + Web 控制台（:8765）+ 数据录制/回放（:8770），默认无 RViz
./rm65 status         # 查看相机与服务状态
./rm65 logs
./rm65 down
```

键盘 / Pika / 策略输入需要另行启动持久输入路由器（默认 dry-run，不会真的运动）：

```bash
./rm65 bt control                            # 路由器 + :8080 只读监视器，Ctrl-C 结束
REALMAN_BT_DRY_RUN=false ./rm65 bt control   # 真实运动；先完成低速、急停和工作区检查
```

没有机器人时：

```bash
./rm65 up model                                   # 三臂模型 + RViz（需要 DISPLAY/XAUTHORITY）
docker compose run --rm realman_driver_test       # mock 三臂驱动，不访问任何控制器
```

`./rm65` 的完整命令、`.env` 变量和端口见[CLI 与环境变量](https://qingtianrobot.github.io/realman_pi/reference/cli-and-env)。`functions.zsh` 提供可选的 `rm65_*` Zsh 函数（`source functions.zsh && rm65_project_help`），用于专项调试。

> **安全提示**：Web 控制台没有认证，任何能访问 `:8765` 的浏览器都能发送运动和停止命令，只能部署在受信任的机器人局域网内。软件"停止"不是控制柜物理急停。

## 仓库结构

```text
realman_pi/
├── config/        权威配置：ros/、behavior-trees/、docker/、python/、rviz/、web-control/、website/
├── src/
│   ├── driver/    realman_robot_driver、realman_msgs、realman_web_control、xbox_controller_driver
│   ├── behavior/  realman_bt（执行器 + 键盘/Pika router）、realman_bt_mock
│   ├── gripper/   gripper_ros2、gripper_ros2_msgs
│   ├── policy_bridge/  VLA 策略桥
│   ├── recording/      数据录制与回放（realman_recording、realman_recording_msgs）
│   ├── sensor/ sensor_bringup/  相机、标定与 launch（含 vendor 驱动）
│   ├── realman_bringup/  系统 launch 编排
│   └── rm65_description/ URDF、mesh、TF、RViz
├── website/       VitePress 文档站
├── scripts/ tests/ tools/  启动器与其测试、速度跟随测量工具
├── doc/           睿尔曼官方 Python API 中文整理（厂商 API 速查）
├── docs/superpowers/  历史设计规格与实施计划
├── third_party/   behavior_tree_cpp 快照
├── rm65  functions.zsh  docker-compose.yml  .env
```

详细的包职责、文档来源与 Docker 边界见[仓库结构](https://qingtianrobot.github.io/realman_pi/architecture/package)。

## 开发

```bash
# 文档站
cd website && npm ci && npm run dev        # 本地预览
npm run build && npm run test:e2e           # 提交文档改动前

# 本地 ROS 2 构建（已安装 Humble）
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
source install/setup.bash
```

CI（`.github/workflows/ci.yml`）只跑不需要 ROS 的检查：ruff、shell 语法、无 rclpy 的单元测试、文档站构建与端到端测试；ROS 相关测试没有 CI，提交前请按[测试与验证](https://qingtianrobot.github.io/realman_pi/development/testing)自行运行对应组件的测试。约定：权威配置只放根 `config/` 并写清注释；功能变化与文档在同一次提交中更新；`src/sensor/OrbbecSDK_ROS2`、`src/sensor/realsense`、`third_party/behavior_tree_cpp` 为 vendor 快照，不在其中做项目改动。

## 模型来源

转换后的 RM65 URDF 与 mesh 资源来自 RealMan 官方模型仓库：https://gitee.com/RealManRobot/rm_models/tree/main/RM65
