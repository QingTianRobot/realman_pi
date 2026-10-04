---
name: debugging-pika-teleop-two-ends
description: Use when debugging or tuning Pika teleoperation of realman_pi arms/grippers (lag, stutter, dropped commands, wrong motion), or when deciding whether a problem lives on the message producer (PikaRemote) or the consumer (realman_ts industrial PC).
---

# Pika 遥操作：生产端 / 消费端两端排查

## 系统模型

由于接口有限，系统分成两部分，问题只可能出在这两端或两端之间的链路上：

| 角色 | 主机 | 作用 |
| --- | --- | --- |
| 消息生产端 | `ssh PikaRemote` | 用手持 Pika 生产末端位置、速度、夹爪开合命令 |
| 消息消费端 | `ssh realman_ts`（机械臂工控机） | 机械臂驱动 + 行为树 router 接收命令，实时控制机械臂和夹爪 |

```
Pika 手持 → PikaRemote (pika_teleop_ws: bridge → mapper)
   → /pika/{l,r}/cartesian_pose | cartesian_velocity | gripper_percentage   (ROS_DOMAIN_ID=65, 20 Hz)
   → realman_ts 容器 realman_pi-realman_bringup_remote-1
   → pika_control_router (control.xml 行为树带起)
   → /{l,r}/cartesian_* 机械臂驱动；/gripper_{left,right}/percentage/command → gripper_manager → Modbus RTU
```

生产端细节见 `pika-remote-teleop` skill；夹爪总线细节见 `developing-changingtek-grippers`；行为树/router 细节见 `developing-realman-behavior-trees`。

## 排查方法：同时在两端量同一个话题

不要凭一端的现象下结论。对同一话题在两端各测一次频率和最大间隔，再对比：

- 生产端本机发布频率（在 PikaRemote 上 `ros2 topic hz`，该机 CLI 不支持 `--no-daemon`）。
- 消费端收到的频率（在容器内订阅，统计每秒条数、变化次数、最大间隔）。
- 两端一致 → 问题在消费端下游（router 限速、驱动、设备）；发布端抖动而本机稳定 → 网络；本机就抖 → 发布端负载（rviz 等占 CPU）。

链路四段依次比：Pika 输入 → router 输出（`/gripper_*/percentage/command`）→ 驱动实际下发 → 夹爪位置反馈。第一段不等于第二段说明 router 在丢/限；第三段与第四段不符说明设备没有响应。

## 生产端 realman_ts 操作要点

- 容器：`realman_pi-realman_bringup_remote-1`，`ROS_DOMAIN_ID=65`。容器内 `ros2` 命令加 `--no-daemon`，否则会报 `!rclpy.ok()`。
- `./config` 是挂载的，改 YAML 立即在容器可见；**`src` 是镜像内的**，`colcon --symlink-install` 指向容器内 `/opt/rm65_ws/src/...`。纯 Python 改动可用 `docker cp` 覆盖后重启单个节点，不需要编译，但容器重建后会丢失，需重建镜像才固化。
- 只重启需要的节点：`gripper_manager`、`pika_control_router` 可单独 kill 后用 `ros2 run` / 原参数文件重新启动，launch 没有 respawn，也不会连带其他节点。**不要为夹爪问题 `./rm65 down/up`**，那会重启机械臂驱动。
- 手动起的节点不受 launch 管理：下次重启行为树或容器会回到默认参数，要固化必须改 launch 文件或提交代码。
- 生产端仓库有未提交的本地改动（`gripper.yaml` 的 accel、`pika_config.yaml` 的角速度、router 的夹爪限速 `gripper_deadband`/`gripper_max_rate_hz` 等），与 main 已分叉。同步文件前先 `git diff`，只改需要的键，改前备份，不要整文件覆盖。
- 生产端写操作（重启、覆盖文件）先取得用户确认；被系统权限拦下的操作让用户在自己终端执行。

## 已验证的事实（夹爪）

- 输入链路本身稳定：PikaRemote 本机与生产端收到的 `gripper_percentage` 都是约 20 Hz。
- router 的 `gripper_max_rate_hz`（默认 10）会把 20 Hz 输入限成约 8 Hz。
- 驱动总线线程原来每周期 2 次写 + 3 次读反馈，共用一把总线锁，反馈读取会挤占目标写入；连续目标期间已把反馈降到约每 0.5 s 一次（`streaming_poll_interval`）。
- 实测稳定 20 Hz（甚至 40 Hz 限速下）触发时夹爪几乎不动；输入间隔较大或限到 8 Hz 时能动。推断：每次触发都重新规划运动，触发过密夹爪走不出去（**推断，未做单次触发对照验证**）。对应驱动侧改动是最小触发间隔 `min_command_interval_s` 加死区 `command_deadband`。
- 手册（Changingtek 闭环步进执行器操作手册）确认：Modbus 只支持 03/06/10；推荐临时区控制；`0x010F` 指令更新模式只对多段点位（`0x0110–0x0117`）生效，对临时区无效；报警 `0x20` 是夹取掉落。手册没有写重复触发的行为或最小触发间隔，上述机理仍是推断。
- 两端都限频到 4 Hz：驱动 `min_command_interval_s=0.25`，PikaRemote `pika_realman_mapper` 参数 `gripper_publish_rate_hz=4.0`。PikaRemote 的 mapper 是 develop 安装（egg-link），改源码后重启 launch 即生效，不需要 colcon build。
- 连续控制期间位置反馈话题只有约 2 次/秒变化，因此**无法用它判断平滑度**；判断平滑度要临时提高反馈频率。

## 常见陷阱

- 只看目标话题不看位置反馈，会误以为夹爪在动。
- 改高频率不一定更好：先量再改，改完在真机上对比同一动作。
- 生产端存在多套 workspace（`pika_teleop_ws` 正在运行；`pika_joint_ws` 里的 `gripper_bridge_node` 走夹爪 service，当前未运行），确认实际运行的进程再改。
- 左夹爪出现过 `alarm=32`，属于设备状态问题，排查夹爪不动时先看 `connected`、`alarm`、`torque_reached`。
- Pika 速度话题出现过 `Ignoring Pika velocity for r: frame_id must be 'r/work/pikabase'`，与夹爪无关，是速度控制链路的 frame 问题。
