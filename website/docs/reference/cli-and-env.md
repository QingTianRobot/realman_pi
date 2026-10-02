---
title: CLI 与环境变量
description: ./rm65 统一入口、行为树启动器、.env 与 Compose 环境变量、服务端口和日志位置的速查表。
---

# CLI 与环境变量

## `./rm65` 统一入口

在仓库根目录执行。它把宿主机上的 ROS 2 相机进程和 Docker 里的机械臂/Web 服务合并成一个生命周期；日常生产操作优先使用它，`functions.zsh` 中的 `rm65_*` 函数用于专项调试（[启动入口索引](../development/startup-entries)）。

| 命令 | 作用 |
| --- | --- |
| `./rm65 build` | 重建 `realman_bringup_remote` 与 `realman_web_control` 镜像；不改变容器状态 |
| `./rm65 up` | 生产默认：ROS 2 彩色相机 + 三臂真实驱动 + Web control + 标定健康诊断；无 RViz，不需要 `DISPLAY` |
| `./rm65 up desktop` | 同上，并启动 RViz-only 的远程查看服务 `realman_remote_rviz` |
| `./rm65 up policy` | 生产图 + VLA 策略桥容器 `policy_bridge`（等待模式路由选中 `policy` 并调用 `/policy/activate`） |
| `./rm65 up model` | 离线三臂模型 + RViz，不连接真机 |
| `./rm65 down` / `status` / `logs` | 停止、查看状态、查看最近日志（含相机日志） |
| `./rm65 bt <l\|m\|r\|three\|control\|name>` | 在**已运行**的 `realman_bringup_remote` 容器内执行行为树；默认 dry-run |
| `./rm65 bt-test build\|mock\|web\|all` | 构建、运行或校验隔离的行为树 mock 场景 |
| `./rm65 sync` | 校验 `main` 与 clean worktree 后 push，并 rsync 已跟踪文件到生产端 |
| `./rm65 camera` | 旧 RTSP/TCP 相机助手（已弃用，与 ROS 2 相机互斥） |

`./rm65 up` 在 `realman_driver_rviz` 仍运行时拒绝启动：两个服务都会连真机，会让同一 namespace 出现重复驱动和多个 `cartesian_velocity` Action server。`./rm65 up` 的内置 usage 文本目前没有列出 `policy`，以本表为准。

### 行为树启动器 `./rm65 bt`

| 形式 | 解析到 |
| --- | --- |
| `l` / `m` / `r` | `move.xml`，对单臂 `l`/`m`/`r` 执行 MoveJ |
| `three` | `three.xml`，三臂分阶段 |
| `control` | `control.xml`，**持久**输入路由器，Ctrl-C 前一直运行 |
| `<name>` 或 `<name>.xml` | `config/behavior-trees/<name>.xml` |

启动器通过 Docker 标签 `com.docker.compose.service=realman_bringup_remote` 找到**唯一**运行中的容器，找不到或有多个都会拒绝。常用环境变量：

| 变量 | 默认 | 作用 |
| --- | --- | --- |
| `REALMAN_BT_DRY_RUN` | `true` | `false` 才会发真实 Action / command，启动时会打印醒目警告 |
| `REALMAN_BT_ARM_ID` | `r` | 单臂树的臂 |
| `BT_EXIT_ON_TERMINAL` | 树自己的声明 | `true`/`false` 覆盖终态后是否退出；one-shot 树默认退出 |
| `BT_SERVER_PORT` / `BT_PUBLIC_HOST` | `8080` / `127.0.0.1` | 只读监视器端口与打印出来的访问地址 |
| `BT_RUNTIME_ARCHIVE_ROOT` | `/opt/rm65_ws/logs/behavior-trees` | 终态后归档 XML 与 `runtime.json` |

## `.env`

仓库根目录的 `.env` 被 Docker Compose 自动读取，`functions.zsh` 加载时也会读取其中的简单 `KEY=value`（终端里已设置的非空变量优先）。文件里每个变量都带候选值注释，**不要写入密钥**。修改后需要重建容器环境（`docker compose restart` 不会加载新的 `.env`）。

| 变量 | 作用 |
| --- | --- |
| `ROS_DOMAIN_ID` | 同一系统的 driver、Web、相机和远程查看器必须一致；生产使用独立 domain（当前 `65`）。Compose 缺省为 `0` |
| `ROS_LOCALHOST_ONLY` | 需要跨主机发现时为 `0`，并放行 DDS UDP |
| `FASTDDS_BUILTIN_TRANSPORTS` | `UDPv4`：避免宿主与容器 Fast DDS 版本不同导致共享内存不兼容 |
| `ROS_BASE_IMAGE`、`UBUNTU_APT_MIRROR`、`ROS2_APT_MIRROR`、`PYPI_INDEX_URL`、`NPM_REGISTRY` | 构建镜像源，默认国内镜像，可改回官方；需重建镜像 |
| `REALMAN_START_ROBOTS` `START_DRIVER` `START_JOY_DRIVER` `START_CONTROLLER` `START_WEB_CONTROL` | `realman_bringup_custom` 透传给 `system.launch.py` 的开关 |
| `REALMAN_USE_RVIZ` / `REALMAN_USE_GUI` | RViz 与关节状态 GUI |
| `REALMAN_DRIVER_CONFIG_FILE` `COORDINATES_` `MOTION_` `WEB_CONTROL_` `CAMERA_CALIBRATION_` `…_CONFIG_FILE` | 覆盖对应 YAML 的**容器内路径**；`*mock.yaml` 会让 `./rm65` 自动关闭夹爪 |
| `REALMAN_START_GRIPPER`、`REALMAN_GRIPPER_{RIGHT,LEFT,MID}_DEVICE` | 夹爪 manager 开关与宿主设备路径（默认 `/dev/realman/gripper_*`） |
| `REALMAN_JOY_DEVICE`、`REALMAN_WAIT_FOR_JOY_DEVICE`、`REALMAN_JOY_POLL_INTERVAL` | Xbox 手柄设备与等待策略 |
| `POLICY_WS_HOST`、`POLICY_BRIDGE_CONFIG_FILE`、`POLICY_BRIDGE_ACTIVE_SIDE` | 策略服务地址、配置文件、当前驱动的一侧（`left`/`right`） |
| `DISPLAY`、`XAUTHORITY`、`LIBGL_ALWAYS_SOFTWARE` | 带 RViz 的服务需要；headless 服务不需要 |
| `REALMAN_LOG_ROOT` | 日志根目录（容器内 `/opt/rm65_ws/logs`，映射到仓库 `logs/`） |

::: warning Web 控制没有认证
`.env` 中的 `REALMAN_WEB_CONTROL_TOKEN` 目前**没有任何消费者**，Web control 不做 token 校验。`:8765` 能被访问的浏览器就能发送运动和停止命令，所以必须只放在受信任的机器人局域网内，不要暴露到公网或经 NAT 映射。
:::

## 端口与日志

| 端口 | 服务 | 说明 |
| --- | --- | --- |
| `8765` | `realman_web_control` | 控制页 `/`、标定页 `/calibration.html`、WebSocket |
| `8080` | 行为树只读监视器 | 仅在 `./rm65 bt …` 运行期间；所有 `/api/` 写请求返回 `405` |
| `18000` | 外部 VLA 策略服务 | `policy_bridge` 作为客户端连接，不由本仓库启动 |
| `8554`、`8100–8103` | 旧 RTSP/TCP 相机推流 | 已弃用 |

日志：每次 launch 在 `logs/YYYYMMDD_HHMMSS/` 下写 ROS 官方节点日志（彩色 `RCUTILS_COLORIZED_OUTPUT=1`）；相机在 `logs/rm65-camera.log`，PID 在 `logs/.rm65-camera.pid`；行为树终态归档在 `logs/behavior-trees/<时间>_<PID>/`。
