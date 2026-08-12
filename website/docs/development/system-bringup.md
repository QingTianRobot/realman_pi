---
title: 系统 Bringup
description: 三臂、RViz 2、输入节点、远程调试和 ROS 2 运行日志的统一启动编排契约。
---

# 系统 Bringup

`realman_bringup` 是系统编排包。它只负责按参数组合三臂描述、RViz 2、标准 Joy 设备节点和 C++ 输入处理节点，不拥有机械臂 URDF、Xbox 按键语义或 TF 布局数值。

手柄设备和按键处理的详细契约见 [Xbox 手柄输入](./xbox-controller)，三臂位姿与 TF 契约见[三臂配置驱动可视化](./three-arm-visualization)。

## 所有权边界

| 模块 | Bringup 的处理方式 | 权威来源 |
| --- | --- | --- |
| 三臂描述与 TF | Include `three_robots.launch.py` | `rm65_description`、`config/ros/three_robots.yaml` |
| Xbox 设备读取 | 创建 `joy/game_controller_node` | `config/ros/xbox_controller.yaml` |
| 按键边沿处理 | 创建 `xbox_controller_node` | `xbox_controller_driver` |
| RViz 2 | 透传 `use_rviz` 给三臂 launch | `config/rviz/three_robots.rviz` |
| 运行日志 | 创建时间目录并设置 ROS 2 环境变量 | `REALMAN_LOG_ROOT`、`ROS_LOG_DIR` |

## 启动入口

```bash
ros2 launch realman_bringup system.launch.py \
  start_robots:=true \
  start_joy_driver:=true \
  start_controller:=true \
  use_gui:=false \
  use_rviz:=true
```

| 参数 | 默认值 | 创建的功能 |
| --- | --- | --- |
| `start_robots` | `true` | `/l`、`/m`、`/r` 描述、关节状态和完整 TF |
| `start_joy_driver` | `true` | `/input/joy_node`，读取实体 SDL 设备 |
| `start_controller` | `true` | `/input/xbox_controller`，处理 Joy 按键边沿 |
| `use_gui` | `false` | 每台机械臂使用 `joint_state_publisher_gui` |
| `use_rviz` | `true` | 使用三臂 RViz 配置启动 `rviz2` |

启动参数只决定节点是否创建，不修改 TF 位姿、机器人型号或手柄参数。

## 节点编排

当全部开关开启时，ROS 图包含：

```text
realman_bringup/system.launch.py
├── /l
│   ├── robot_state_publisher
│   ├── joint_state_publisher
│   └── world_transform
├── /m
│   ├── robot_state_publisher
│   ├── joint_state_publisher
│   └── world_transform
├── /r
│   ├── robot_state_publisher
│   ├── joint_state_publisher
│   └── world_transform
├── /input/joy_node
├── /input/xbox_controller
└── /rviz2
```

三臂使用命名空间和 TF 前缀避免冲突；`/input` 命名空间只管理操作输入节点。

## 典型启动组合

| 用途 | `start_robots` | `start_joy_driver` | `start_controller` | `use_rviz` |
| --- | --- | --- | --- | --- |
| 完整本地系统 | `true` | `true` | `true` | `true` |
| 远程 headless | `true` | `false` | `true` | `false` |
| 只验证输入处理 | `false` | `false` | `true` | `false` |
| 只看三臂模型 | `true` | `false` | `false` | `true` |

## Docker 服务

| Compose 服务 | 用途 | 显示环境 | 实体手柄 |
| --- | --- | --- | --- |
| `realman_bringup` | 完整本地系统 | 需要 `DISPLAY`、`XAUTHORITY` | 默认映射 `${REALMAN_JOY_DEVICE:-/dev/input/event0}` |
| `realman_bringup_remote` | 远程/headless 调试 | 不需要 X11 | 不映射设备，不启动 Joy 驱动 |

完整本地启动：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

远程目标启动：

```bash
ROS_DOMAIN_ID=65 docker compose run --rm realman_bringup_remote
```

所有服务使用 host network、`ROS_LOCALHOST_ONLY=0` 和默认 `ROS_DOMAIN_ID=65`。远程主机必须使用相同域；DDS 自动发现还要求网络允许组播和 UDP。跨网段部署需要额外的 DDS discovery 配置。

## 生产端代码部署

生产主机通过开发机的 SSH 别名 `realman_local` 访问，仓库固定检出到
`/home/administrator/realman_pi`。主机地址和密钥只保存在开发机的
`~/.ssh/config`，不写入仓库。

首次检出：

```bash
ssh realman_local \
  "git clone https://github.com/QingTianRobot/realman_pi.git \
  /home/administrator/realman_pi"
```

后续生产更新只接受 `main` 的快进更新，避免在生产目录自动合并分叉历史：

```bash
ssh realman_local \
  "cd /home/administrator/realman_pi && \
  git fetch origin main && \
  git merge --ff-only origin/main"
```

加载根目录 Zsh 函数后可以使用同一流程的快捷入口：

```zsh
source /path/to/realman_pi/functions.zsh
realman_deploy
```

默认主机是 `realman_local`，默认目录是 `/home/administrator/realman_pi`。其他环境可用
`REALMAN_PRODUCTION_HOST` 和 `REALMAN_PRODUCTION_DIR` 覆盖；函数仍只执行
`fetch` 和 `merge --ff-only`，不会覆盖生产端未提交文件。

部署后核对工作树和实际版本：

```bash
ssh realman_local \
  "cd /home/administrator/realman_pi && \
  git status --short --branch && \
  git log -1 --format='%H %s'"
```

生产主机必须预先安装 Git、Docker Engine 和 Docker Compose v2。代码同步不等于
容器已部署；缺少 `docker` 或 `docker compose` 时，应先完成运行时安装，再执行本页
的 headless Bringup 命令。生产目录中出现未提交修改时停止更新并先确认修改归属，
不要使用 `git reset --hard` 覆盖现场文件。

## 配置解析

Docker 设置 `REALMAN_CONFIG_ROOT=/opt/rm65_ws/config` 并只读挂载根 `config/`，因此修改 YAML 后重启容器即可生效，不需要重建镜像。本地安装没有该环境变量时，从 `realman_bringup` 的 package share 读取构建时安装的配置副本。

Bringup 当前读取：

- `config/ros/three_robots.yaml`
- `config/ros/xbox_controller.yaml`

配置字段的语义分别由三臂和 Xbox 功能页面维护，Bringup 不复制这些数值。

## ROS 2 运行日志

每次启动 `system.launch.py` 都在 `REALMAN_LOG_ROOT` 下创建 `YYYYMMDD_HHMMSS` 目录，然后设置：

| 环境变量 | 值/行为 |
| --- | --- |
| `ROS_LOG_DIR` | 本次运行的时间目录 |
| `RCUTILS_COLORIZED_OUTPUT` | `1`，启用 ROS 2 官方彩色终端日志 |
| `REALMAN_LOG_ROOT` | Docker 中为 `/opt/rm65_ws/logs`，本地默认是当前目录的 `logs/` |

Compose 把宿主机 `./logs` 挂载到容器日志根目录。ROS 2/rcutils 生成节点日志，例如：

```text
logs/20260812_084359/
├── robot_state_publisher_<pid>_<timestamp>.log
├── static_transform_publisher_<pid>_<timestamp>.log
└── xbox_controller_node_<pid>_<timestamp>.log
```

PID 和时间戳避免三臂同名可执行文件覆盖。ROS 节点必须使用 `RCLCPP_*` 或 ROS 2 官方 Python/launch 日志接口，不使用 shell 重定向替代节点日志。

## 远程验证

在远程 Humble 主机设置：

```bash
export ROS_DOMAIN_ID=65
export ROS_LOCALHOST_ONLY=0
ros2 node list
ros2 topic list
ros2 run tf2_ros tf2_echo world m/world
ros2 run tf2_ros tf2_echo world r/link_6
```

预期能看到三组 namespaced 节点；`world -> m/world` 的 yaw 是 `pi`，`world -> r/link_6` 可连续查询。Xbox 的模拟 Joy 验证见 [Xbox 手柄输入](./xbox-controller#无设备验证)。

## 构建与验证

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
source install/setup.bash
ros2 launch realman_bringup system.launch.py \
  start_joy_driver:=false use_rviz:=false
```

Docker 验证：

```bash
docker compose build realman_bringup_remote
docker compose config --quiet
find logs -maxdepth 2 -type f -name '*.log' -print
```

## 故障速查

| 症状 | 优先检查 |
| --- | --- |
| remote 服务解析时要求 X11 | 使用最新 Compose；headless 服务不应依赖 `DISPLAY` 或 `XAUTHORITY` |
| 远程主机看不到节点/TF | `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY`、DDS UDP、组播和防火墙 |
| 日志没有落在项目目录 | `REALMAN_LOG_ROOT` 是否可写，宿主 `logs/` 是否正确挂载 |
| RViz/GUI 报 Qt/X11 错误 | 图形服务需要有效 `DISPLAY`、`XAUTHORITY` 和 `/tmp/.X11-unix` |
| 修改 YAML 后行为未变化 | Docker 需重启服务；本地安装需重新构建 `realman_bringup` |

## 当前限制

- Bringup 只负责编排，不负责机械臂控制器生命周期或硬件驱动状态机。
- 当前远程模式依赖 DDS 自动发现，没有内置 discovery server 配置。
- 时间目录精度为秒；并发启动多个 Bringup 实例可能共享同一个秒级目录，但 ROS 节点文件仍由 PID/时间戳区分。
