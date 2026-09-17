---
name: realman-pi-architecture
description: Use when working on the realman_pi repository's startup flow, ROS 2 graph, camera/robot/gripper/Web control integration, production deployment, or architecture questions.
---

# realman_pi 项目架构与运行入口

## 适用范围

加载本 skill 后，先把它当作项目运行契约，再阅读具体源文件。涉及启动、部署、相机、机械臂、夹爪、Web control、标定或 ROS 图时必须遵守其中的边界；涉及 RealMan Python SDK 细节时另用 `realman-python-driver`，涉及 Changingtek Modbus RTU 事务、重连或硬件诊断时必须另用 `developing-changingtek-grippers`。涉及行为树节点、三臂阶段编排、执行退出或失败诊断时使用 `developing-realman-behavior-trees`。

## 架构总览

```text
宿主机 USB 相机
  └─ sensor_bringup/cameras_ros2.launch.py
       └─ /camera_left|middle|right/color/{image_raw,camera_info}

Docker Compose / ROS 2 Humble
  ├─ realman_bringup_remote
  │    ├─ /l /m /r realman_driver
  │    ├─ robot_state_publisher + world_transform
  │    ├─ camera_calibration（发布 camera_health）
  │    ├─ gripper_manager
  │    │    └─ /dev/realman/gripper_{right,left,mid} -> ROS service/topic
  │    └─ ./rm65 bt 显式启动的 one-shot executor + 只读监视器 :8080
  │         └─ MoveJ / ThreeArmMoveJ -> /l|m|r/execute_motion
  └─ realman_web_control（HTTP/WebSocket :8765）
       ├─ 订阅 camera_health、joint_states、TF/坐标和夹爪状态
       └─ 通过 ROS service 调用 gripper_manager，不直接访问串口
```

- `config/` 是权威配置源；不要在源码包或生产主机创建第二份运行配置。
- `realman_bringup` 只做 ROS launch 编排，不拥有 URDF、TF 数值或硬件 SDK 状态机。
- 机械臂底层动作使用 ROS 2 Action 和 `motion_coordinator` 状态机；行为树在其上编排 MoveJ，不直接拥有 SDK 连接，也不替代底层运动仲裁。
- TF 树是 `world -> l/m/r -> base_link -> link_1...link_6`，与行为树无关。

## 推荐启动方式

从仓库根目录执行统一入口：

```bash
./rm65 up                 # 生产默认：ROS2 彩色相机 + 三臂真实驱动 + Web control，无 RViz
./rm65 up desktop         # 生产图 + 远程 ROS 图 RViz
./rm65 up model           # 离线三臂模型 + RViz，不连接真机
./rm65 status
./rm65 logs
./rm65 down
```

`./rm65 up` 的启动顺序是：先启动宿主机 `rm65_camera_ros2 color`，成功后启动 Docker
`realman_bringup_remote` 和 `realman_web_control`。相机失败时不启动 Docker；Docker 失败时清理相机。
默认不启动 RViz，不需要 `DISPLAY`/`XAUTHORITY`。

`./rm65 bt r` 或 `./rm65 bt three` 在已运行的 driver 容器内执行单臂/三臂树，默认 dry-run。
三臂树由两个 ThreeArmMoveJ 阶段组成，全部成功后才进入下一阶段。终态且 cancellation drain 清空后，
executor、launcher 和监视器退出，XML 与快照归档到 `logs/behavior-trees/`；driver 保持运行。
`BT_EXIT_ON_TERMINAL=false` 显式保留常驻模式。详细退出码、取消所有权和重复执行约定见行为树 skill。

兼容入口仍存在：`functions.zsh` 中的 `rm65_docker_*`、`rm65_camera_*` 可以用于专项调试；
旧 RTSP/TCP 推流链路通过 `./rm65 camera`，不要与 ROS2 相机链路同时占用 USB 设备。

## 相机与标定契约

- 标定配置：`config/ros/camera_calibration.yaml`。
- 三路图像：`/camera_left/color/image_raw`、`/camera_middle/color/image_raw`、`/camera_right/color/image_raw`。
- 三路 CameraInfo 使用对应 `.../color/camera_info`。
- `realman_camera_calibration` 订阅图像/CameraInfo，并每秒发布 `std_msgs/msg/String`
  `/camera_calibration/camera_health`；Web control 订阅该话题后推送给标定页面。
- ROS2 彩色/深度模式互斥；旧 RTSP/TCP 模式也与 ROS2 模式互斥，因为都直接打开 USB 相机。

## Web control 契约

- 服务：`realman_web_control`，监听 `0.0.0.0:8765`，静态页面和 WebSocket 均由该节点提供。
- 控制页面：`http://<production-host>:8765/`；标定页面：`/calibration.html`。
- Web control 不负责启动相机或机械臂；它依赖同一 ROS domain 中的节点和话题。
- 看不到相机状态时，先检查：

  ```bash
  ros2 topic info /camera_calibration/camera_health -v
  ros2 topic list | grep camera
  docker compose ps realman_bringup_remote realman_web_control
  ```

  健康话题必须至少有 `camera_calibration` 一个发布者和 `realman_web_control` 一个订阅者。

## Changingtek 夹爪契约

- 权威拓扑是 `config/ros/gripper.yaml`。宿主机稳定别名
  `/dev/realman/gripper_right`、`/dev/realman/gripper_left`、`/dev/realman/gripper_mid`
  由 Compose 映射到 `realman_bringup_remote` 容器内同名路径；不要把易变的 `/dev/ttyUSB*`
  编号写入生产配置。
- `realman_bringup/system.launch.py` 在 `start_gripper:=true` 时创建 `gripper_manager`。该节点独占
  串口并为每个 `gripper_*` 名称提供 `open`、`close`、`reset`、`enable`、`grasp_check`、
  `percentage`、`calibrate` service，以及 `position`、`speed`、`current`、`torque_reached`、
  `alarm`、`connected` topic。
- 独立 `realman_web_control` 容器不映射夹爪设备。它读取同一份 YAML，订阅夹爪状态 topic、调用
  manager service，并以 `gripper_list`、`gripper_state`、`gripper_result` WebSocket 事件连接浏览器。
- 串口 `connect()` 成功只表示文件已打开；只有 `/<name>/connected=true` 才表示后台 Modbus
  反馈读取正在成功。生产诊断先确认别名和容器设备，再确认 ROS 图与只读反馈，最后才执行使能和
  有界运动。

## 配置、日志与生产同步

- Compose 权威文件：`config/docker/compose.yaml`；根 `docker-compose.yml` 只是 discovery adapter。
- ROS 日志根目录：`logs/`；每次 launch 创建 `logs/YYYYMMDD_HHMMSS/`。
- 统一入口相机状态：`logs/.rm65-camera.pid`、`logs/rm65-camera.log`。
- ROS domain 来自根目录 `.env` 的 `ROS_DOMAIN_ID`，同一系统的 driver、Web control、相机与远程查看器必须一致；独立机器人栈应隔离 domain。更换后需重启相关进程并重建容器环境，`docker compose restart` 不会加载新环境。排查行为树 UNKNOWN 时，先在实际运行 domain 确认目标 Action 各只有一个 server。
- 生产同步：`./rm65 sync` → 校验 `main` 和 clean worktree → 尝试 GitHub push → rsync **仅 Git 已跟踪文件**。
- rsync 排除构建目录、安装目录、日志、缓存、网站生成物和本地虚拟环境；不要用 `--delete` 覆盖生产端未提交配置。
- GitHub HTTPS 不可用时，SSH remote `git@github.com:QingTianRobot/realman_pi.git` 是推荐方式。

## 修改规则

1. 改启动行为时同步更新 `rm65`、Compose、`functions.zsh` 兼容提示和 Web 手册。
2. 改 ROS 节点/launch/日志时遵守 `ros2-logging-conventions`，保留彩色 rcutils 和官方节点日志。
3. 改配置时只在根 `config/` 增加或修改权威文件，并补充解释性注释。
4. 改用户可见行为后更新 `website/docs/development/` 或对应 guide，并运行 `npm run build`。
5. 完成前至少验证 `bash -n rm65`、`zsh -n functions.zsh`、`docker compose config` 和相关测试。
