---
title: 快速开始
description: 用 ./rm65 启动生产运行时、打开 Web 控制台，或在没有机器人时用 Docker 查看三臂模型。
---

# 快速开始

本页按"你手上有什么"组织。先看[系统架构总览](../architecture/overview)了解各组件，再选一条路径：

<Cards>
<Card kicker="01" title="运行三臂真实系统" href="#启动生产运行时">相机 + 驱动 + Web 控制 + 数据录制，一条 ./rm65 up。</Card>
<Card kicker="02" title="键盘 / Pika / 策略控制" href="#启动行为树">先运行生产运行时，再启动行为树输入路由。</Card>
<Card kicker="03" title="没有机器人" href="#离线模型与-mock">看三臂模型，或跑 mock 驱动。</Card>
<Card kicker="04" title="查看相机画面" href="/guide/cameras">四路彩色画面与 RViz。</Card>
<Card kicker="05" title="远程 RViz" href="/guide/remote-rviz">在笔记本上看生产机的 ROS 图。</Card>
<Card kicker="06" title="开发并本地构建" href="/development/">本地 Humble 工作空间与开发者手册。</Card>
</Cards>

## 环境要求

| 组件 | 要求 |
| --- | --- |
| 操作系统 | Linux（生产为工控机）；仅查看模型时可用任意提供 X11/XWayland 的桌面 |
| 容器运行时 | Docker Engine 与 Docker Compose v2 |
| 机器人网络 | 工控机经工业交换机有线直连三台控制器：`l=192.168.30.123`、`m=192.168.30.125`、`r=192.168.30.124`，端口 `8080`（见 `config/ros/realman_driver.yaml`）。无线链路不能替代这一跳 |
| 相机 | 宿主机 USB（Orbbec ×3、RealSense D435），详见[相机](./cameras) |
| 显示变量 | **只有**带 RViz 的服务需要 `DISPLAY` 和可读的 `XAUTHORITY`；`./rm65 up` 的默认生产模式不需要 |
| 项目目录 | 在包含 `docker-compose.yml` 的仓库根目录执行命令 |

首次使用先检查根目录 `.env`（`ROS_DOMAIN_ID` 等，见 [CLI 与环境变量](../reference/cli-and-env#env)），再构建镜像：

```bash
git clone git@github.com:QingTianRobot/realman_pi.git
cd realman_pi
./rm65 build            # 重建 realman_bringup_remote 与 realman_web_control
```

默认构建使用国内 Docker Hub、Ubuntu、ROS 2 和 PyPI 镜像；切回官方源见[系统 Bringup：国内镜像与官方源切换](../development/system-bringup#国内镜像与官方源切换)。`./rm65 build` 不会停止或启动现有容器；要切换到新镜像，应在安全停机后依次执行 `./rm65 down`、`./rm65 build`、`./rm65 up`。

## 启动生产运行时

在仓库根目录执行：

```bash
./rm65 up
```

它按下面的顺序启动，任何一步失败都会清理已经启动的部分；默认不启动 RViz，生产机不需要桌面：

<Steps>

1. **宿主机 ROS 2 彩色相机**——相机失败则不启动 Docker。
2. **`realman_bringup_remote`**——三臂真实驱动、TF、标定健康诊断、夹爪 manager；失败则清理相机。
3. **`realman_web_control`**——`:8765` 控制页。
4. **`realman_recording`**——数据录制与回放网页 `http://127.0.0.1:8770/`，见[独立数据录制平台](../development/recording-platform)。

</Steps>

| 命令 | 用途 |
| --- | --- |
| `./rm65 status` | 相机进程与 Compose 服务状态 |
| `./rm65 logs` | 最近的相机、bringup、Web 日志 |
| `./rm65 down` | 停止服务和相机（机械臂驱动随之停止） |
| `./rm65 up desktop` | 额外启动 RViz-only 的 `realman_remote_rviz` |
| `./rm65 up policy` | 额外启动 VLA 策略桥（见[策略桥接](../development/policy-bridge)） |

启动后用下面几条确认系统正常：

```bash
./rm65 status
docker compose exec realman_bringup_remote bash -lc '
  source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash
  ros2 service call /l/status std_srvs/srv/Trigger "{}"
  ros2 topic echo --once /l/joint_states
  ros2 topic list | grep camera
'
```

`/l|m|r/status` 报告连接和 `last_error`；`/l|m|r/connected` 只表示连接生命周期。比对两台控制器配置时用 `/l/controller_info` 与 `/r/controller_info`（只读）。ROS domain 来自 `.env`，笔记本上的调试终端必须使用相同的值。

::: warning 行为树默认不运行
`./rm65 up` 只拥有长期的 driver 和 Web 服务，不启动行为树。键盘、Pika、策略输入需要另行[启动行为树](#启动行为树)，并且默认处于 dry-run。
:::

## 浏览器 Web 控制台

Web 控制台运行在连接机械臂的工控机上，浏览器只通过 WebSocket 访问它，不会在笔记本上创建
RealMan SDK 连接。先确认真实驱动已经运行，再构建并启动独立的 Web 服务：

```bash
docker compose build realman_web_control
docker compose up -d realman_web_control
docker compose ps realman_web_control
```

控制台默认监听 `0.0.0.0:8765`。使用浏览器打开下面的地址，`<industrial-host>` 替换为工控机
在路由器局域网中的地址：

```text
http://<industrial-host>:8765/
```

页面会显示三臂连接状态、当前坐标面板、实时关节角和 URDF，并按当前激活参考系直接发
`MOVEJ`、`MOVEL`、`MOVEP` 或速度 Action，不再需要 token 输入。也可以使用 Zsh 快捷函数：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_docker_web_control_start
rm65_web_control_url <industrial-host>
rm65_docker_web_control_status
rm65_docker_web_control_logs -f
```

页面支持以下操作：

| 操作 | 行为 |
| --- | --- |
| 关节滑轨 | 生成橙色半透明的目标影子，实体 URDF 继续显示真实回读位置 |
| `MOVEJ` | 使用当前激活参考系提交六轴关节角 Action，并实时显示阶段、进度、feedback 和 result |
| `MOVEL` | 显示当前激活参考系，支持填入当前位置、计算逆解影子预览，再按 XYZ 米制位置和 WXYZ 四元数提交笛卡尔直线运动 |
| `MOVEP` | 显示当前激活参考系，支持填入当前位置；位姿滑轨不提供逆解/影子预览，确认目标后以 `MOVEJ_P` 提交关节空间运动 |
| 关节记录 | 把当前真实关节角保存到 `config/web-control/joint-records/<arm>/`；选择记录可填入 MOVEJ，或经 FK 填入 MOVEL/MOVEP 位姿；在 MOVEJ 下可确认删除当前选择的记录 |
| 末端速度 | 使用当前激活参考系建立六轴 `vx, vy, vz, wx, wy, wz` 速度 Action，按周期发送最新命令 |
| 键盘坐标轴 | 输入模式为键盘时，在 URDF 区显示左右臂当前可用 WORK 的红/绿/蓝 XYZ 轴；模式离开或 WORK 不可用即隐藏 |
| 取消 Action | 取消当前浏览器发起的 Action；普通运动立即停止，速度 session 零速后 slow-stop |
| 恢复机械臂 | 对当前选中的机械臂重建取消后失效的运动事件通道；不发送运动指令 |
| 软件停止 | 直接调用当前机械臂的 `/stop` 服务；它不是控制柜物理急停 |

Action、坐标系、四元数和安全边界的开发契约见[Action 开发与测试](../development/realman-action-development)，
WebSocket 消息与 URDF 影子实现见[WebSocket 浏览器控制与 URDF 影子](../development/realman-web-control)。

连续通过多个路点时不要在单点 Action 中途点击取消再发送下一点。应使用
`/{arm}/execute_trajectory`，或通过 WebSocket 发送 `execute_trajectory` 消息；取消后的
事件通道可显式恢复：

```bash
ros2 service call /l/recover_motion realman_msgs/srv/RecoverMotion "{}"
```


## 启动行为树

行为树不随 `./rm65 up` 启动，需要在 `./rm65 up` 已经运行的前提下**另开一个终端**手动启动。入口是 `./rm65 bt <树>`：它在已运行的 `realman_bringup_remote` 容器里执行行为树，并启动只读监视器。容器必须**恰好有一个**（由 `./rm65 up` 或 `docker compose up -d realman_bringup_remote` 启动都可以）。

| 命令 | 树文件 | 用途 | 结束方式 |
| --- | --- | --- | --- |
| `./rm65 bt control` | `control.xml` | **持久输入路由器**：让 Web 键盘、Pika、策略输入按"输入模式"取得控制权 | 一直运行，`Ctrl-C` 结束 |
| `./rm65 bt three` | `three.xml` | 三臂分阶段 MoveJ（每阶段三臂全部成功才进入下一阶段） | one-shot：到达终态后自动退出 |
| `./rm65 bt l`（或 `m` / `r`） | `move.xml` | 单臂 MoveJ 演示 | one-shot |
| `./rm65 bt <名称>` | `config/behavior-trees/<名称>.xml` | 任意树，扩展名可省略 | 取决于树 |

### 默认是 dry-run

行为树默认 **dry-run**：执行器只走流程、校验参数，**不会向机械臂或夹爪发送任何真实运动**。真实运动必须显式设置环境变量，启动时会打印醒目警告：

```bash
# 终端 1：生产运行时已在运行
./rm65 up

# 终端 2：先 dry-run 检查（默认），再决定是否真实运动
./rm65 bt control
REALMAN_BT_DRY_RUN=false ./rm65 bt control      # 真实运动
```

真实运动前先确认：工作区已清空、急停可达、速度和目标已人工核对。键盘和 Pika 的速度/位姿 session 只有在 `REALMAN_BT_DRY_RUN=false` 时才会真正驱动机械臂。

### 用键盘 / Pika 控制（`control`）

1. 启动 `./rm65 bt control`（真实运动加上 `REALMAN_BT_DRY_RUN=false`），等待终端打印监视器地址 `http://<host>:8080/`。
2. 浏览器打开 Web 控制台 `http://<工控机地址>:8765/`，在 **"GLOBAL INPUT / 输入模式"** 卡片的下拉框里选择：
   `keyboard`（Web 键盘速度控制）、`pikaposition` / `pikavelocity` / `pikamixed`（Pika 三种模式）、`policy`（策略桥）或 `none`（不控制）。
3. 选择键盘或 Pika 后，行为树会先做准备（键盘校验默认 WORK 坐标；Pika 先把三臂移到 `pika_default_pose`），成功后状态变为 `ACTIVE`，此时对应输入才会生效。
4. 没有正在运行的路由器时，输入模式卡片是隐藏的；这是正常现象，说明 `./rm65 bt control` 还没启动。

键位、安全限值和 Pika 各模式的行为见[行为树控制权](../development/behavior-tree-control)和[Pika 遥操作](../development/pika-teleop)。

### 运行分阶段任务（`three` / `l` `m` `r`）

```bash
./rm65 bt three                                   # dry-run：只检查流程
REALMAN_BT_DRY_RUN=false ./rm65 bt three          # 真实 MoveJ
```

启动器先等待所需的 Action server 就绪（三臂树等 `/l|m|r/execute_motion`，每路最多约 30 秒），再执行。到达终态后执行器和监视器退出，最终 XML 与快照归档到 `logs/behavior-trees/<时间>_<PID>/`，驱动继续运行。

### 确认与排查

| 想确认 | 方法 |
| --- | --- |
| 树在跑、状态如何 | 浏览器打开监视器 `http://<host>:8080/`（只读，不能编辑或触发）；或 `ros2 topic echo /realman_bt_executor/bt_status` |
| 当前输入模式 | `ros2 topic echo --once /realman_bt_executor/input_mode_state` |
| 退出码 | `0` 成功；`1` 树失败/终态无效/启动失败；`73` 同一容器已有行为树在运行或清理；`74` 成功但归档失败 |
| 提示找不到或有多个 bringup 容器 | 先 `./rm65 status`；容器必须恰好一个 |
| Action 返回 `UNKNOWN` | 同一 ROS domain 有多套同名 driver，见[故障排查](../troubleshooting#行为树) |

`./rm65 bt` 启动器不依赖 `./rm65 up` 的相机/Web 生命周期；停止驱动用 `./rm65 down`，`Ctrl-C` 只结束行为树，不会停掉驱动。更多参数（`BT_EXIT_ON_TERMINAL`、`BT_SERVER_PORT` 等）见 [CLI 与环境变量](../reference/cli-and-env#行为树启动器-rm65-bt)，详细机制见[行为树机械臂移动 Demo](../development/behavior-tree-motion)。

## 离线模型与 mock

没有机器人时，用 Docker 查看三臂模型或跑 mock 驱动。这些服务都不会访问 `192.168.30.*`。

```bash
./rm65 up model                          # 三臂模型 + RViz（需要 DISPLAY/XAUTHORITY）
docker compose build realman_driver_test
docker compose run --rm realman_driver_test   # mock 三臂驱动，发布六轴零位
```

带 RViz 的服务要求当前桌面会话提供 `DISPLAY` 和可读的 `XAUTHORITY`：

```bash
printf 'DISPLAY=%s\nXAUTHORITY=%s\n' "$DISPLAY" "$XAUTHORITY"
export XAUTHORITY="$HOME/.Xauthority"   # 普通 Xorg 会话中 XAUTHORITY 为空时
```

::: warning
带 RViz 的 Compose 服务会把 `XAUTHORITY` 指向的文件只读挂载进容器，该路径必须存在且当前用户可读。`realman_bringup_remote` 与 `realman_web_control` 不创建 Qt 窗口，可以在没有显示变量的远程终端运行。
:::

### 单臂模型

构建 RViz 镜像（首次，或代码更新后）：

```bash
docker compose build rm65_rviz
```

启动默认型号：

```bash
docker compose run --rm rm65_rviz
```

启动后将出现两个窗口：关节状态调节界面和加载了 RobotModel、TF 的 RViz 2。

### 切换型号

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

### 三臂场景

三机械臂环境使用根目录 `config/ros/three_robots.yaml` 作为唯一布局配置：

```bash
docker compose build rm65_three_rviz
docker compose run --rm rm65_three_rviz
```

默认使用以下名称和布局：

| 名称 | ROS 命名空间 | TF 前缀 | X 位置 | yaw | 朝向 |
| --- | --- | --- | ---: | ---: | --- |
| 左臂 `l` | `/l` | `l/` | `-1.0` | `0` | 正向 |
| 中臂 `m` | `/m` | `m/` | `0.0` | `π` | 反向 |
| 右臂 `r` | `/r` | `r/` | `1.0` | `0` | 正向 |

修改 YAML 中的 `x`、`y`、`z`、`roll`、`pitch`、`yaw` 后重启容器即可，
无需重建镜像。每台机械臂也可以独立选择五个受支持的 RM65 型号。

### ROS domain

所有 Docker 服务和 Zsh helper 默认读取仓库根目录 `.env` 中的 `ROS_DOMAIN_ID`。生产机、
笔记本和调试终端需要互相发现时，保持同一个值；需要隔离调试时，再临时覆盖。

接入现有 ROS 2 图时，先在 `.env` 中设置相同的域，再启动查看器：

```bash
RM65_MODEL=RM65-B docker compose run --rm rm65_rviz
```


## Xbox 手柄（可选）

将 Xbox Series 手柄连接到 Linux，并确认设备节点：

```bash
ls -l /dev/input/by-id/*-event-joystick
```

启动三臂、RViz 2、手柄驱动和 C++ 输入节点：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

服务会自动扫描主机的 `*-event-joystick` 设备；建议使用稳定的 `by-id` event 路径覆盖：

```bash
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm realman_bringup
```

按下 A 键后，终端应出现类似日志：

```text
button[0] a PRESSED
button[0] a RELEASED
```

无桌面的远程端可以启动 headless 调试目标：

```bash
docker compose run --rm realman_bringup_remote
```

远程 Humble 主机加载同一份 `.env` 或手动设置相同的 `ROS_DOMAIN_ID`，并保持
`ROS_LOCALHOST_ONLY=0`，向 `/input/joy` 发布 `sensor_msgs/msg/Joy` 即可驱动输入节点。
两台主机之间还需要允许 DDS UDP 网络通信。


## 相机与远程查看

- 相机出图、四路 RViz 画面、本地覆盖配置：[相机](./cameras)。
- 在笔记本上显示生产机的 ROS 图：[远程 RViz](./remote-rviz)。

## `.env` 与 Bringup 预设

从仓库根目录执行 `docker compose` 时会自动读取根目录 `.env`；`functions.zsh` 加载时也会读取
同一文件。`ROS_DOMAIN_ID` 和 `ROS_LOCALHOST_ONLY` 应在这里统一配置，保证机械臂节点、相机
ROS2 节点、Web 控制和远程 RViz 在同一个 ROS 图中。文件中的每个变量都带有候选值注释，
模板默认不会启用真实运动控制，也不会包含密钥。命令行显式设置的变量优先级更高：

```bash
${EDITOR:-vi} .env
docker compose config --quiet
```

`realman_bringup_custom` 会把 `.env` 中的开关透传给 `system.launch.py`。常用变量如下：

| 变量 | 作用 |
| --- | --- |
| `REALMAN_START_ROBOTS` | 启动或关闭 `/l`、`/m`、`/r` 描述和 TF |
| `REALMAN_START_DRIVER` | 启动真实 RealMan 状态驱动；离线测试可改用 mock 配置 |
| `REALMAN_USE_RVIZ` / `REALMAN_USE_GUI` | 启动三臂 RViz 或关节状态 GUI |
| `REALMAN_START_JOY_DRIVER` / `REALMAN_START_CONTROLLER` | 启用 SDL Joy 和 Xbox 按键节点 |
| `REALMAN_START_WEB_CONTROL` | 在同一 ROS 图中启动 WebSocket、Action 和 URDF 控制桥 |
| `REALMAN_*_CONFIG_FILE` | 覆盖驱动、坐标、运动和 Web 控制配置路径 |
| `ROS_DOMAIN_ID` / `REALMAN_JOY_DEVICE` | 设置 DDS 域和手柄设备路径 |

修改运行时 `.env` 变量后重新启动服务即可生效，不需要重新构建镜像；修改 Docker/ROS/PyPI
镜像变量时需要重新构建对应服务。常用预设已经在
`functions.zsh` 中封装，并在子 shell 中覆盖变量，不会污染当前终端：

| 函数 | 启动内容 |
| --- | --- |
| `rm65_docker_bringup_model` | 三臂描述、TF 和 RViz；不连接真机 |
| `rm65_docker_bringup_hardware` | 三台真实驱动和 RViz；不启动输入 |
| `rm65_docker_bringup_headless` | 三台真实驱动和 Xbox 处理；无 GUI |
| `rm65_docker_bringup_input` | 只测试 Joy/Xbox 输入，并等待设备出现 |
| `rm65_docker_bringup_web` | 三台真实驱动和 Web 控制；不启动 RViz |

需要后台运行或查看日志时，使用：

```zsh
rm65_docker_bringup_custom_start
rm65_docker_bringup_custom_status
rm65_docker_bringup_custom_logs -f
rm65_docker_bringup_custom_stop
```

需要临时传入 launch 参数时，不修改 `.env`：

```zsh
rm65_docker_bringup_custom_args \
  start_driver:=false start_joy_driver:=false start_controller:=false \
  use_gui:=true use_rviz:=true
```


## Zsh 快捷函数

根目录 `functions.zsh` 提供可选的开发与运行函数。在 Zsh 中加载一次即可从任意
目录调用：

```zsh
source /path/to/realman_pi/functions.zsh
rm65_project_help
```

| 函数 | 等价用途 |
| --- | --- |
| `rm65_docker_build [service ...]` | 构建指定 Compose 服务 |
| `rm65_docker_rviz [model]` | 启动单臂 RViz，型号默认 `RM65-B` |
| `rm65_docker_three_rviz` | 启动配置驱动的三臂 RViz |
| `rm65_docker_xbox_test` | 只启动实体手柄输入链路 |
| `rm65_docker_driver_test` / `rm65_docker_driver_rviz` | 使用 mock 驱动测试，或显示真实关节状态 |
| `rm65_docker_bringup` | 启动三臂、RViz、Joy 和 Xbox 输入 |
| `rm65_docker_bringup_custom` | 按 `.env` 中的 launch 开关启动参数化 bringup |
| `rm65_docker_bringup_model` / `hardware` / `headless` | 启动模型、真机 RViz 或无 GUI 预设 |
| `rm65_docker_bringup_input` / `web` | 只启动输入链路，或启动真机与 Web 控制 |
| `rm65_docker_bringup_custom_args ...` | 临时透传 `system.launch.py` 参数 |
| `rm65_camera_ros2 [color|depth] [rviz]` | **相机出图主线**：按串号启动三路 Orbbec + 全局 RealSense D435 的单一 ROS2 图像流；默认彩色，传入 `depth` 切换深度，传入 `rviz` 时同时启动 RViz2 |
| `rm65_camera_ros2_stop` / `status` / `logs` | 停止、检查或查看 ROS2 相机节点日志 |
| `rm65_camera_start` / `stop`（已弃用） | 启动或停止 RTSP/TCP SDK 推流；已被 ROS2 出图取代，仅作历史备选 |
| `rm65_camera_status` / `logs [-f]`（已弃用） | 查看已弃用推流进程、`8554`/`8100-8103` 端口或跟踪推流日志 |
| `rm65_docker_web_control[_start]` | 前台或后台启动浏览器 Action 控制台 |
| `rm65_docker_web_control_status` / `logs` / `stop` | 查看、跟踪或停止 Web 控制台 |
| `rm65_web_control_url [host]` | 输出浏览器访问地址，默认端口 `8765` |
| `rm65_docker_bringup_remote` | 启动远程 headless 目标 |
| `rm65_docker_remote_rviz [domain]` | 在当前桌面前台显示远程 ROS 图 |
| `rm65_docker_remote_rviz_start [domain]` | 在当前桌面后台持续运行远程 RViz |
| `rm65_docker_remote_rviz_status` / `logs [-f]` / `stop` | 查看、跟踪或停止后台 RViz |
| `rm65_docker_camera_rviz [domain]` | 在当前桌面直接查看生产机左、中、右三路 Orbbec 加全局 RealSense D435 共四路彩色画面（缺少 `realsense2_camera` 时第四格为空） |
| `rm65_docker_camera_rviz_start [domain]` / `stop` / `status` / `logs` | 后台启动、停止、检查或查看相机 RViz |
| `rm65_ros_build` | 使用本机 Humble 构建到 `realman_bringup` |
| `rm65_web_build` / `rm65_web_test` | 构建或测试文档网站 |
| `rm65_deploy_sync` | 本地提交并 push 后，用 `rsync` 同步到生产端 |

这些函数不会自动写入 `~/.zshrc`，也不会隐藏底层参数。加载时会读取仓库根目录 `.env`
中的简单 `KEY=value` 配置；当前终端已经设置的非空变量优先，因此可以临时覆盖。需要函数未
覆盖的 Compose、colcon 或 launch 选项时，继续使用本页的原始命令。`rm65_docker_xbox_test`
不启动三臂和 RViz，适合先验证实体手柄是否能产生 Joy 消息和按键日志。

所有 `functions.zsh` 入口的当前用途、组件范围和权威配置见
[启动入口索引](../development/startup-entries)；参数化 bringup 的完整开关和组合说明见
[系统 Bringup：参数化组合](../development/system-bringup#参数化组合)。每个函数在子 shell
中覆盖对应变量，执行结束后不会改变当前终端的环境变量。

## 本地 Humble 工作空间

已经安装 ROS 2 Humble 时，也可以直接构建描述包：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
source install/setup.bash
ros2 launch realman_bringup system.launch.py
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

下一步可以查看[型号差异](/models/)、[完整 TF 树](/architecture/tf-tree)、[Xbox 手柄输入](/development/xbox-controller)或[系统 Bringup](/development/system-bringup)。
