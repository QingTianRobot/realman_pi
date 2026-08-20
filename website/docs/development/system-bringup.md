---
title: 系统 Bringup
description: 三臂、RViz 2、输入节点、远程调试和 ROS 2 运行日志的统一启动编排契约。
---

# 系统 Bringup

`realman_bringup` 是系统编排包。它按参数组合三臂描述、RealMan 只读状态驱动、RViz 2、标准 Joy 设备节点和 C++ 输入处理节点，不拥有机械臂 URDF、Xbox 按键语义或 TF 布局数值。

手柄设备和按键处理的详细契约见 [Xbox 手柄输入](./xbox-controller)，三臂位姿与 TF 契约见[三臂配置驱动可视化](./three-arm-visualization)。

## 所有权边界

| 模块 | Bringup 的处理方式 | 权威来源 |
| --- | --- | --- |
| 三臂描述与 TF | Include `three_robots.launch.py` | `rm65_description`、`config/ros/three_robots.yaml` |
| RealMan 状态回读 | Include `three_realman_drivers.launch.py` | `config/ros/realman_driver.yaml` |
| Xbox 设备读取 | 创建 `joy/game_controller_node` | `config/ros/xbox_controller.yaml` |
| 按键边沿处理 | 创建 `xbox_controller_node` | `xbox_controller_driver` |
| RViz 2 | 透传 `use_rviz` 给三臂 launch | `config/rviz/three_robots.rviz` |
| 运行日志 | 创建时间目录并设置 ROS 2 环境变量 | `REALMAN_LOG_ROOT`、`ROS_LOG_DIR` |

## 启动入口

```bash
ros2 launch realman_bringup system.launch.py \
  start_robots:=true \
  start_driver:=true \
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
| `use_gui` | `false` | 仅在 `start_driver:=false` 时选择假关节状态的 GUI 版本 |
| `use_rviz` | `true` | 使用三臂 RViz 配置启动 `rviz2` |
| `start_driver` | `true` | 启动三台真实关节状态驱动，并禁用三臂假关节状态源 |
| `driver_config_file` | `config/ros/realman_driver.yaml` | 指定根目录下的真实或 mock 驱动配置 |
| `coordinates_config_file` | `config/ros/realman_coordinates.yaml` | 指定 BASE/WORK/TOOL 坐标配置 |
| `motion_config_file` | `config/ros/realman_motion.yaml` | 指定运动速度、加速度和 watchdog 限制 |
| `start_web_control` | `false` | 启动认证 WebSocket、Action 和 URDF 控制桥 |
| `web_control_config_file` | `config/ros/realman_web_control.yaml` | 指定浏览器控制桥配置 |
| `wait_for_joy_device` | `false` | 输入设备不存在时持续轮询；Docker 输入服务设为 `true` |
| `joy_device_path` | `${REALMAN_JOY_DEVICE:-auto}` | 设备路径、glob，或自动扫描 `/dev/input` |
| `joy_poll_interval` | `1.0` | 轮询间隔，单位秒，最小 `0.1` |

启动参数只决定节点是否创建和设备等待策略，不修改 TF 位姿、机器人型号或手柄参数。

## 节点编排

当全部开关开启时，ROS 图包含：

```text
realman_bringup/system.launch.py
├── /l
│   ├── realman_driver
│   ├── robot_state_publisher
│   └── world_transform
├── /m
│   ├── realman_driver
│   ├── robot_state_publisher
│   └── world_transform
├── /r
│   ├── realman_driver
│   ├── robot_state_publisher
│   └── world_transform
├── /input/joy_node
├── /input/xbox_controller
└── /rviz2
```

三臂使用命名空间和 TF 前缀避免冲突；`/input` 命名空间只管理操作输入节点。

## 典型启动组合

| 用途 | `start_robots` | `start_driver` | `start_joy_driver` | `start_controller` | `use_rviz` |
| --- | --- | --- | --- | --- | --- |
| 完整本地系统 | `true` | `true` | `true` | `true` | `true` |
| 远程 headless | `true` | `true` | `false` | `true` | `false` |
| 只验证输入处理 | `false` | `false` | `false` | `true` | `false` |
| 只看三臂模型 | `true` | `false` | `false` | `false` | `true` |
| 只看真实关节回读和 RViz | `true` | `true` | `false` | `false` | `true` |

## Docker 服务

| Compose 服务 | 用途 | 显示环境 | 实体手柄 |
| --- | --- | --- | --- |
| `realman_bringup` | 完整本地系统 | 需要 `DISPLAY`、`XAUTHORITY` | 等待并读取 `${REALMAN_JOY_DEVICE:-auto}` |
| `realman_bringup_remote` | 远程/headless 调试 | 不需要 X11 | 不映射设备，不启动 Joy 驱动 |
| `realman_bringup_custom` | `.env` 参数化组合 | 可选 X11 | 按 `.env` 开关映射并启动 |
| `realman_remote_rviz` | 只在本机显示远程 ROS 图 | 需要 X11 | 不启动驱动或手柄 |
| `xbox_controller_test` | 独立手柄测试 | 不需要 X11 | 等待并读取 `${REALMAN_JOY_DEVICE:-auto}` |
| `realman_driver_rviz` | 三臂真实关节回读与 RViz | 需要 X11 | 不启动手柄 |
| `realman_driver_test` | 三臂 mock 驱动测试 | 不需要 X11 | 不访问真机 |

完整本地启动：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

只启动真实关节回读和 RViz：

```bash
docker compose build realman_driver_rviz
docker compose run --rm realman_driver_rviz
```

### 参数化组合

参数化组合使用 `realman_bringup_custom`。它把下列 launch 参数映射到根目录 `.env`，修改
`.env` 后重新启动即可生效，不需要编辑 Compose：

模板默认只启动描述和 TF，不连接真实机械臂、不启动 RViz 或输入节点；这样首次验证参数
不会触发 SDK 连接。需要真机、RViz 或输入时，使用下方预设，或在 `.env` 中明确打开对应开关。

| `.env` 变量 | 传给 launch 的参数 | 常用值 |
| --- | --- | --- |
| `REALMAN_START_ROBOTS` | `start_robots` | `true` / `false` |
| `REALMAN_START_DRIVER` | `start_driver` | `true` / `false` |
| `REALMAN_START_JOY_DRIVER` | `start_joy_driver` | `true` / `false` |
| `REALMAN_START_CONTROLLER` | `start_controller` | `true` / `false` |
| `REALMAN_USE_GUI` | `use_gui` | `true` / `false` |
| `REALMAN_USE_RVIZ` | `use_rviz` | `true` / `false` |
| `REALMAN_START_WEB_CONTROL` | `start_web_control` | `true` / `false` |
| `REALMAN_JOINT_RECORD_DIR` | `joint_record_dir` | 默认 `/opt/rm65_ws/config/web-control/joint-records` |
| `REALMAN_WAIT_FOR_JOY_DEVICE` | `wait_for_joy_device` | `true` / `false` |
| `REALMAN_JOY_POLL_INTERVAL` | `joy_poll_interval` | `0.1` 以上的秒数 |

前台运行和后台运行：

```bash
docker compose run --rm realman_bringup_custom
docker compose up -d realman_bringup_custom
docker compose ps realman_bringup_custom
docker compose logs -f realman_bringup_custom
docker compose stop realman_bringup_custom
```

常用模式已经封装在 `functions.zsh` 中：

| 函数 | 参数组合 |
| --- | --- |
| `rm65_docker_bringup_model` | 只启动三臂描述和 RViz，不连接真机、不启动输入 |
| `rm65_docker_bringup_hardware` | 连接三台真机并显示 RViz，不启动输入 |
| `rm65_docker_bringup_headless` | 连接三台真机和 Xbox 处理节点，不启动 GUI |
| `rm65_docker_bringup_input` | 只启动 Joy/Xbox 输入，并等待设备出现 |
| `rm65_docker_bringup_web` | 连接三台真机并启动 Web 控制，不启动 RViz |

需要临时传入任意 launch 参数时，使用：

```zsh
rm65_docker_bringup_custom_args \
  start_driver:=false start_joy_driver:=false start_controller:=false \
  use_gui:=true use_rviz:=true
```

该函数使用图形版 Compose 服务的挂载，但只把参数直接交给
`realman_bringup/system.launch.py`；不会修改当前 shell 或 `.env`。

### 国内镜像与官方源切换

Compose 默认通过国内镜像加速首次构建，具体值都以 Docker build argument 传入，权威配置在
`config/docker/compose.yaml` 和 `config/docker/ros2-humble-rviz.Dockerfile`：

| 变量 | 默认值 | 下载内容 |
| --- | --- | --- |
| `ROS_BASE_IMAGE` | `docker.m.daocloud.io/library/ros:humble-ros-base` | Docker Hub 的 ROS Humble 基础镜像代理 |
| `UBUNTU_APT_MIRROR` | `https://mirrors.aliyun.com/ubuntu` | amd64 Ubuntu Jammy 软件包 |
| `UBUNTU_PORTS_APT_MIRROR` | `https://mirrors.aliyun.com/ubuntu-ports` | arm64 Ubuntu Jammy 软件包 |
| `ROS2_APT_MIRROR` | `https://mirrors.tuna.tsinghua.edu.cn/ros2/ubuntu` | ROS 2 Humble 软件包 |
| `PYPI_INDEX_URL` | `https://pypi.tuna.tsinghua.edu.cn/simple` | `Robotic_Arm` Python SDK |

镜像 URL 不要带末尾 `/`。若某个公共镜像暂时不可用，可只覆盖该项；需要完全使用官方源时：

```bash
ROS_BASE_IMAGE=ros:humble-ros-base \
UBUNTU_APT_MIRROR=https://archive.ubuntu.com/ubuntu \
UBUNTU_PORTS_APT_MIRROR=http://ports.ubuntu.com/ubuntu-ports \
ROS2_APT_MIRROR=http://packages.ros.org/ros2/ubuntu \
PYPI_INDEX_URL=https://pypi.org/simple \
docker compose build realman_bringup
```

这些变量只影响镜像构建，不进入机械臂运行配置。公共镜像属于第三方基础设施；发布到生产前
应核对最终基础镜像 digest，或改用组织内部已审计的 registry/软件仓库。

### 项目 `.env` 自动加载

从仓库根目录执行 `docker compose` 时，Compose 会自动读取根目录 `.env`。`functions.zsh`
加载时也读取同一文件，因此 `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY` 等运行变量可以在一个
地方统一维护。项目已提供一份无密钥模板，变量旁边的注释列出常用候选值；修改后重新 source
函数并执行构建或启动命令即可：

```bash
${EDITOR:-vi} .env
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

命令行显式写入的变量优先级高于 `.env`，只建议用于一次性调试。日常切换 ROS 域时仍应修改
`.env`，保证宿主机相机节点、Docker 服务和远程 RViz 一致：

```bash
${EDITOR:-vi} .env
source /path/to/realman_pi/functions.zsh
```

Web 控制台不再读取 token；浏览器打开后即可通过 `realman_web_control` 提交动作。该服务
必须只部署在受信任、隔离的机器人局域网，动作仍然经过 driver 的 ownership、坐标 gate、
watchdog 和 lockout。

远程目标启动：

```bash
docker compose run --rm realman_bringup_remote
```

在另一台同网段的桌面机显示远程真实状态时，工控机只启动 headless bringup，桌面机只启动
RViz。两端使用同一个未被其他 ROS 图占用的 `ROS_DOMAIN_ID`，推荐在两端 `.env` 中写相同值：

```bash
# 工控机
docker compose up -d realman_bringup_remote

# 桌面机
source /path/to/realman_pi/functions.zsh
rm65_docker_build realman_remote_rviz
rm65_docker_remote_rviz_start
rm65_docker_remote_rviz_status
```

`realman_bringup_remote` 是 headless 生产端服务，Compose 配置了
`restart: unless-stopped`。用 `docker compose up -d realman_bringup_remote`
创建或重建容器后，Docker 会在主机重启、Docker daemon 重启或容器异常退出后自动恢复该
ROS 图；如果运维人员显式执行 `docker compose stop realman_bringup_remote`，则不会自动重启。

后台方式会立即归还终端，但 RViz 节点和窗口会持续运行。`rm65_docker_remote_rviz_logs -f`
跟踪容器日志，`rm65_docker_remote_rviz_stop` 停止节点。需要让 RViz 生命周期跟随当前终端时，
使用 `rm65_docker_remote_rviz`；关闭窗口或按 `Ctrl-C` 即停止前台容器。

启动函数会验证 domain 范围，并从当前桌面环境获取 `DISPLAY` 与 `XAUTHORITY`；若 GNOME
Wayland 没有导出 `XAUTHORITY`，函数会自动查找运行时目录下的
`.mutter-Xwaylandauth.*`。domain 参数缺省时使用当前环境或 `.env` 中的 `ROS_DOMAIN_ID`；
仍可传入 `rm65_docker_remote_rviz 42` 做临时覆盖。

`realman_remote_rviz` 只启动 `rviz2`，直接订阅远程的 `/l|m|r/robot_description`、TF 和
`/l|m|r/joint_states`；它不会在桌面机创建 RealMan SDK 连接，也不会启动假关节状态源。
两台主机必须能互相发现 DDS 的 UDP 流量；跨 NAT 或只允许单播的网络需要额外的 DDS
discovery 配置。具体的 Zsh 函数参数、生命周期和故障判断见[快速开始：远程 RViz 函数详解](../guide/getting-started#远程-rviz-函数详解)。

所有服务使用 host network、`.env` 中的 `ROS_DOMAIN_ID` 和 `ROS_LOCALHOST_ONLY=0`。远程主机必须使用相同域；DDS 自动发现还要求网络允许组播和 UDP。跨网段部署需要额外的 DDS discovery 配置。

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

后续生产更新的首选流程是：本地 `main` 完成提交并推送 GitHub，然后从开发机用 `rsync`
同步当前工作树到生产目录。这样生产端不依赖 GitHub 拉取速度，且本地提交始终是权威版本：

```zsh
git status --short --branch
git commit -m "..."
git push origin main
source /path/to/realman_pi/functions.zsh
rm65_deploy_sync
```

`rm65_deploy_sync` 默认从本地仓库根目录同步到 `realman_local:/home/administrator/realman_pi/`，
并复用 `REALMAN_PRODUCTION_HOST`、`REALMAN_PRODUCTION_DIR` 覆盖目标。函数要求当前分支是
`main` 且工作区干净；它会排除 `.git/`、`build/`、`install/`、`log/`、`logs/`、
`website/node_modules/`、VitePress 构建产物、测试结果和 Python 缓存。同步不会删除远端
runtime 数据，也不会更新远端 `.git` 元数据；远端工作树文件才是生产运行使用的内容。

需要查看或复用底层命令时，等价 rsync 形态是：

```bash
rsync -avz --progress \
  --exclude '.git/' \
  --exclude '.claude/' \
  --exclude '.worktrees/' \
  --exclude 'build/' \
  --exclude 'install/' \
  --exclude 'log/' \
  --exclude 'logs/' \
  --exclude 'website/node_modules/' \
  --exclude 'website/docs/.vitepress/dist/' \
  --exclude 'website/test-results/' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache/' \
  --exclude '.venv*/' \
  ./ realman_local:/home/administrator/realman_pi/
```

保留远端 Git 快进入口用于兼容场景：当生产主机可以稳定访问 GitHub，并且需要让远端
checkout 的 Git 元数据也快进到 `origin/main` 时使用它。该入口仍只执行 `fetch` 和
`merge --ff-only`，不会覆盖生产端未提交文件：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_deploy_update
```

部署后核对工作树和生产文件版本：

```bash
ssh realman_local \
  "cd /home/administrator/realman_pi && \
  git status --short --branch && \
  git log -1 --format='%H %s'"
```

使用 `rm65_deploy_sync` 时，`git log -1` 可能仍显示远端 checkout 原来的提交；这是因为
rsync 保留 `.git/`。以 GitHub 上本地刚推送的 commit 和生产目录文件内容为准。

开发机必须有 `git`、`ssh` 和 `rsync`；生产主机必须预先安装 Git、rsync、Docker Engine
和 Docker Compose v2。代码同步不等于
容器已部署；缺少 `docker` 或 `docker compose` 时，应先完成运行时安装，再执行本页
的 headless Bringup 命令。生产目录中出现未提交修改或远端专有文件时，先确认修改归属；
不要使用 `git reset --hard` 覆盖现场文件。

## 配置解析

Docker 设置 `REALMAN_CONFIG_ROOT=/opt/rm65_ws/config` 并只读挂载根 `config/`，因此修改 YAML 后重启容器即可生效，不需要重建镜像。本地安装没有该环境变量时，从 `realman_bringup` 的 package share 读取构建时安装的配置副本。

Bringup 当前读取：

- `config/ros/three_robots.yaml`
- `config/ros/realman_driver.yaml`
- `config/ros/xbox_controller.yaml`
- `config/python/realman-sdk-requirements.txt`

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

在远程 Humble 主机设置与生产端相同的 ROS 域：

```bash
source /path/to/realman_pi/functions.zsh
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
  start_joy_driver:=false start_controller:=false use_rviz:=true
```

验证真实关节状态：

```bash
ros2 topic echo /l/joint_states
ros2 topic echo /m/joint_states
ros2 topic echo /r/joint_states
ros2 service call /r/status std_srvs/srv/Trigger '{}'
```

没有控制器时使用 mock 配置验证完整 ROS 图。该模式会自动连接内存适配器，发布三组六轴
零位关节状态，不会访问真实 IP：

```bash
docker compose run --rm -e ROS_DOMAIN_ID=168 realman_driver_test bash -lc '
  ros2 launch realman_bringup system.launch.py \
    start_driver:=true \
    driver_config_file:=/opt/rm65_ws/config/ros/realman_driver_mock.yaml \
    start_joy_driver:=false start_controller:=false \
    use_gui:=false use_rviz:=false
'
```

检查每个关节状态话题的发布者数量以及三条末端 TF：

```bash
ros2 topic info /l/joint_states --verbose
ros2 topic info /m/joint_states --verbose
ros2 topic info /r/joint_states --verbose
ros2 run tf2_ros tf2_echo world l/link_6
ros2 run tf2_ros tf2_echo world m/link_6
ros2 run tf2_ros tf2_echo world r/link_6
```

预期节点包括 `/l|m|r/realman_driver`、`/l|m|r/robot_state_publisher` 和
`/l|m|r/world_transform`；每个 `joint_states` 只有一个驱动发布者、一个 RSP 订阅者，且
`world -> l/m/r/link_6` 都能查询。驱动模式下不应启动 `joint_state_publisher`。

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
| 手柄未连接时服务退出 | 使用带 `wait_for_joy_device:=true` 的输入服务；它会持续等待设备出现 |
| 远程主机看不到节点/TF | `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY`、DDS UDP、组播和防火墙 |
| 驱动连接失败 | 核对 `config/ros/realman_driver.yaml` 的 IP/端口、控制器网络和 Docker host network；查看 `/l|m|r/status` |
| RViz 模型不随关节角变化 | 确认 `start_driver:=true`，且每个 `/l|m|r/joint_states` 只有一个发布源 |
| 日志没有落在项目目录 | `REALMAN_LOG_ROOT` 是否可写，宿主 `logs/` 是否正确挂载 |
| RViz/GUI 报 Qt/X11 错误 | 图形服务需要有效 `DISPLAY`、`XAUTHORITY` 和 `/tmp/.X11-unix` |
| 修改 YAML 后行为未变化 | Docker 需重启服务；本地安装需重新构建 `realman_bringup` |
| Docker 拉取基础镜像或 APT 超时 | 检查上表镜像变量；单独切换故障源，或临时恢复官方源后重建 |

## 当前限制

- Bringup 只负责编排，不负责机械臂控制器生命周期或硬件驱动状态机。
- 当前远程模式依赖 DDS 自动发现，没有内置 discovery server 配置。
- 时间目录精度为秒；并发启动多个 Bringup 实例可能共享同一个秒级目录，但 ROS 节点文件仍由 PID/时间戳区分。
