---
title: 故障排查
description: 按症状排查机械臂连接与运动、坐标 gate、键盘与 Pika 输入、夹爪、相机、行为树，以及 RViz / X11 显示问题。
---

# 故障排查

先判断问题属于哪一层（见[系统架构总览](./architecture/overview)），再按症状找对应一节。通用起点：

```bash
./rm65 status && ./rm65 logs                 # 相机进程与服务状态、最近日志
docker compose exec realman_bringup_remote bash -lc '
  source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash
  ros2 node list; ros2 service call /l/status std_srvs/srv/Trigger "{}"'
```

节点日志在 `logs/YYYYMMDD_HHMMSS/`。ROS domain 来自 `.env` 的 `ROS_DOMAIN_ID`，**所有**调试终端必须使用相同的值；改 `.env` 后需重建容器环境（`docker compose restart` 不会加载新的 `.env`）。

## 机械臂与运动

### 某只臂 `connected=false` 或没有 `joint_states`

1. 调 `/<arm>/status`，看 `last_error`；`connected` 只表示连接生命周期。
2. 核对 `config/ros/realman_driver.yaml` 的 IP / 端口，以及工控机到交换机的**有线**可达性（无线不能替代）。`socket connect err`、`invalid robot handle` 出现在笔记本上，说明误用了 `realman_driver_rviz`，SDK 连接只能在工控机完成。
3. 驱动在断线后按 `reconnect_interval`（默认 `5 s`）自动重连：先在原对象上重建句柄，连续 3 次失败才升级为完整重置；单臂失败不会退出整个驱动。
4. 需要比对两台控制器配置（安装位姿、DH、限位、运行模式、当前工具/工作坐标），调用只读的 `/<arm>/controller_info`，两臂各调一次对比 JSON：

```bash
ros2 service call /l/controller_info std_srvs/srv/Trigger "{}"
ros2 service call /r/controller_info std_srvs/srv/Trigger "{}"
```

5. 只想区分"网络/SDK"与"ROS 编排"问题，用[单臂 SDK 最小探针](./development/realman-driver-scaffold#单臂-sdk-最小探针)。

### 运动被拒绝：motion blocked / 坐标不匹配

`MOVEL`、`MOVEJ_P`、速度和位姿 session 依赖控制器的工具/工作坐标。驱动连接后会回读并自动修复失配，修复失败则关闭该臂的 motion gate。检查 `/<arm>/coordinates/state` 的 `motion_allowed`、`work_matched`，再：

```bash
ros2 service call /l/coordinates/verify realman_msgs/srv/VerifyCoordinates "{}"
ros2 service call /l/coordinates/select_work realman_msgs/srv/SelectFrame "{name: cell}"
```

关节空间 `MOVEJ` 不依赖该 gate，可用来低速回零。`coordinates/apply` 会改写真实控制器，只在机械臂空闲、标定值已复核时显式调用。

### 取消或停止之后无法再发运动

取消后事件通道可能被隔离。驱动会在确认 inactive 后自动恢复；需要立即恢复时调 `/<arm>/recover_motion`（不发送运动）。软件 `/stop` 不是物理急停。

### 同一个 Action 有多个 server / 结果 `UNKNOWN`

同一 ROS domain 里有两套同名 driver（例如同时运行 `realman_bringup_remote` 与 `realman_driver_rviz`）。`ros2 action info /l/execute_motion` 应只有一个 server；见下方[行为树](#行为树)一节。

## 输入与遥操作

### 键盘没有反应

按顺序排除：①输入模式是否为 `keyboard` 且 `ACTIVE`（`ros2 topic echo --once /realman_bt_executor/input_mode_state`）；②`./rm65 bt control` 是否在运行，且**是否仍是 dry-run**（`dry_run=true` 时 router 只校验、不发 Goal）；③该臂的默认 WORK（`l/work/cell`、`r/work/cell`）已验证——回到上一节；④浏览器标签页在前台（页面不可见会停发心跳，约 `1 s` 后释放 session）；⑤只有 `l`/`r` 有键盘控制，`m` 没有。详见[行为树控制权](./development/behavior-tree-control)。

### Pika 无响应，或 session 反复重开

- 模式必须是 `pikaposition` / `pikavelocity` / `pikamixed` 且 `ACTIVE`；切入时先运行 `ThreeArmMoveJ` 准备动作，失败或被取消则不会进入 `ACTIVE`。
- 默认 dry-run：真实运动需 `REALMAN_BT_DRY_RUN=false`。
- 确认发送端在发布：`ros2 topic hz /pika/l/cartesian_velocity`（标称 20 Hz）。输入晚于 `stale_ms`（`200 ms`）机械臂会被指令为零速；晚于 `3000 ms` 才释放 session。
- 日志出现 `restart #N` 表示 session 被重开；`pose command watchdog expired` 表示位姿命令间隔超过 driver 的 `100 ms`。
- Mixed 模式必须**同时**收到 `cartesian_velocity` 和 `cartesian_pose`。
- 日志里的 `Custom CasADi IK unavailable, falling back to the RealMan SDK IK` 是已知状态（生产镜像没有 `pinocchio.casadi`），不是故障。
- **手臂一顿一顿**：先在两端量 `/pika/*` 到达率。Pika 流走 Wi‑Fi，实测入站丢包可达约 25%（`ping` 看不出来），间隔超过 `stale_ms` 会被指令为零速，见[链路与已知问题](./development/pika-teleop#链路与已知问题)。
- **每次进入速度控制手臂先动一下**：控制器残留的 CANFD 透传目标导致，driver 已在每次普通运动前重新锚定来修复（`passthrough_reanchor_mode: canfd_current`）。如果仍然出现，确认运行的镜像包含该修复，并开 `velocity_start_trace` 诊断，见同一节。
- 两端（Pika 主机和机械臂侧）联合排查见 `debugging-pika-teleop-two-ends` skill；机制见[Pika 遥操作](./development/pika-teleop)。

### 夹爪不动或显示离线

`gripper_manager` 独占串口。串口 `connect()` 成功只表示文件已打开，只有 `/<name>/connected=true` 才表示 Modbus 反馈在成功。依次检查：宿主机别名 `/dev/realman/gripper_{right,left,mid}` 存在 → 容器内同名路径存在 → `ros2 topic echo /gripper_right/connected` → 无 `alarm`。告警可能锁存（如掉电位 `0x20` 在恢复供电后仍保持），键盘和 Web 控制会拒绝 `alarm != 0` 的夹爪，需要对该夹爪执行一次 `reset`；告警位含义见[生产运维手册](./development/production-operations#夹爪)。连续目标被限制为 `4 Hz`（实测 20 Hz 触发夹爪不动），所以高频目标不会更快。详见[夹爪控制](./development/gripper-control)。

## 相机

- 没有图像：`ros2 topic list | grep camera`；`./rm65 up` 在宿主机缺少 `realsense2_camera` 时直接失败，不会降级。
- 有 publisher 但无帧：三台 Orbbec 与 D435 共用 USB2 root hub 时，`usbfs_memory_mb` 必须至少 `256`；启动函数会检查并打印修复命令。彩色与深度模式互斥，不能同时启用。
- 容器能发现 topic 却收不到图：保持 `FASTDDS_BUILTIN_TRANSPORTS=UDPv4`，不要改回 `DEFAULT`。
- Web 标定页看不到相机状态：`ros2 topic info /camera_calibration/camera_health -v` 必须有 `camera_calibration` 一个发布者和 `realman_web_control` 一个订阅者。
- 旧 RTSP 推流与 ROS 2 节点互斥，不要同时占用 USB 设备。详见[相机](./guide/cameras)。

## 行为树

先确认是行为树失败还是入口拒绝：`./rm65 bt` 返回 `73` 表示同一容器已有实例运行或清理中；正常结束
后可以再次运行。最终快照在 `logs/behavior-trees/<run-id>/runtime.json`，halt 后 `root_status` 可能为
`IDLE`，应结合 `tick_stats` 和 `events` 判断本次结果。

客户端收到 `UNKNOWN`、driver 却报告 `SUCCEEDED` 时，在实际 driver 容器中检查
`/l|m|r/execute_motion` 的 Action Server 数量。同一 ROS domain 中存在多套同名 driver 会干扰结果路由，
需要隔离运行图；仅释放叶节点 client 或将 UNKNOWN 当作成功无法解决问题。检查命令、其他可能原因和
`.env` 域切换流程见[行为树诊断](./development/behavior-tree-motion#重复执行与-unknown-排查)。

`CartesianVelocityForDuration` 的 Action 正常取消不代表真机一定运动。当前节点会比较运行前后的
`/<arm>/get_current_pose`：若平移、旋转和关节角变化均低于容差，树会以
`no observable robot motion` 返回 `FAILURE`。在归档 `runtime.json` 中查看
`translation_m`、`rotation_rad` 和 `max_joint_change_deg`，不要仅凭 `goal_accepted` 或
`velocity session canceled` 判断真机成功。

## RViz 与显示

RViz、Qt 和 X11 只影响桌面查看，不影响 `./rm65 up` 的生产运行。手柄设备、SDL 映射和按键边沿问题见 [Xbox 手柄输入](/development/xbox-controller)；启动组合、远程 DDS 和运行日志问题见[系统 Bringup](/development/system-bringup)。

### Qt 无法连接 display

典型日志如下：

```text
Authorization required, but no authorization protocol specified
qt.qpa.xcb: could not connect to display :0
Could not load the Qt platform plugin "xcb"
```

这组信息通常表示 Qt 已经找到 `xcb` 插件，但容器没有获得当前桌面的 X11 授权，并不代表需要重新安装 Qt。

先在启动 Compose 的同一个终端检查：

```bash
printf 'DISPLAY=%s\nXAUTHORITY=%s\n' "$DISPLAY" "$XAUTHORITY"
test -S /tmp/.X11-unix/X0 && echo "X11 socket exists"
test -r "$XAUTHORITY" && echo "Xauthority is readable"
```

如果是 Xorg 且 `XAUTHORITY` 为空：

```bash
export DISPLAY=:0
export XAUTHORITY="$HOME/.Xauthority"
docker compose run --rm rm65_rviz
```

Wayland 桌面需要启用 XWayland，并使用桌面会话实际提供的 `DISPLAY` 和 `XAUTHORITY`。不要在 SSH 登录或未继承图形会话变量的 shell 中直接启动 GUI 容器。

::: danger
不建议使用 `xhost +`。它会放宽整个 X server 的访问控制；当前 Compose 已支持通过 Xauthority cookie 做精确授权。
:::

### RViz 进程退出，代码为 -6

如果退出前紧邻 `xcb`、`could not connect to display` 或授权错误，先解决上一节的 X11 问题。RViz 和关节状态 GUI 都依赖同一套 Qt 显示连接，通常会一起退出。

如果显示授权正常，保留默认的软件渲染设置再启动：

```bash
LIBGL_ALWAYS_SOFTWARE=1 docker compose run --rm rm65_rviz
```

### Compose 提示 XAUTHORITY 未设置

Compose 文件主动要求该变量，避免容器在没有授权文件时静默启动：

```text
XAUTHORITY must point to the active X11 authority file
```

普通 Xorg 会话可以设置：

```bash
export XAUTHORITY="$HOME/.Xauthority"
```

设置前确认文件存在。某些桌面管理器会把授权文件放在 `/run/user/<uid>/` 下，此时应保留桌面会话已经给出的路径。

### 型号不受支持

型号名称必须和 URDF 文件名一致：

```text
Unsupported RM65 model '...'. Choose one of: ...
```

使用[型号列表](/models/)中的值，并注意大小写和连字符。

### RobotModel 可见但 TF 不完整

先确认当前终端和容器使用同一个 ROS 域：

```bash
echo "$ROS_DOMAIN_ID"
```

容器默认读取仓库根目录 `.env` 中的 `ROS_DOMAIN_ID`。连接外部节点时，先确认两端 `.env`
或当前环境变量一致；需要一次性覆盖时再显式传入对应值：

```bash
ROS_DOMAIN_ID=0 docker compose run --rm rm65_rviz
```

然后检查末端变换：

```bash
ros2 run tf2_ros tf2_echo world link_6
```

### 网格无法加载

URDF 中的 `package://rm65_description/...` 路径依赖 ament 索引。进行本地构建后必须 source 当前工作空间：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select rm65_description
source install/setup.bash
ros2 launch rm65_description display.launch.py
```

如果跳过 `source install/setup.bash`，RViz 可能无法解析包共享目录中的 STL 文件。
