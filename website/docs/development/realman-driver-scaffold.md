---
title: 睿尔曼三臂驱动与运动控制
description: RealMan Python SDK 的 ROS 2 Humble 三臂回读、运动 Action、坐标系和末端速度控制契约。
---

# 睿尔曼三臂驱动与运动控制

`realman_robot_driver` 是 `src/driver/` 下的 ROS 2 Humble Python 包。驱动通过睿尔曼 Python SDK 发布关节状态，并提供普通运动 Action 与六轴笛卡尔速度 session。离线测试使用独立的 mock 配置文件，不连接控制器。

需要扩展 Action、理解 reservation/generation/lockout 状态机或查找逐项测试用例时，先看
[睿尔曼 Action 开发与测试](./realman-action-development)；本页保留运行时 ROS 图、配置和真机放行清单。

运动接口已经实现，但尚未在真实 RM65 控制器上完成验证。真机使用必须经过本页末尾的运行门槛，不能把 mock 测试结果视为现场安全验证。

## 模块边界

```text
config/ros/realman_driver.yaml
config/ros/realman_coordinates.yaml
config/ros/realman_motion.yaml
                │
                ▼
     /l|m|r/realman_driver
        │             │
        │             ├── /l|m|r/joint_states
        ▼
RealManSdkAdapter
        │
        ├── mock_mode=true: 内存状态，不导入厂商 SDK
        └── mock_mode=false: Robotic_Arm.rm_robot_interface
                                  │
                                  ▼
                         robot_state_publisher -> TF -> RViz 2
```

| 路径 | 职责 |
| --- | --- |
| `realman_robot_driver/realman_driver_node.py` | 参数、ROS topic/service、日志、单位转换和节点清理 |
| `realman_robot_driver/realman_sdk_adapter.py` | SDK 导入、句柄、连接、状态、运动、停止、坐标和释放 |
| `realman_robot_driver/motion_coordinator.py` | 普通运动 Action 的 ownership、反馈、取消、完成确认和安全锁定 |
| `realman_robot_driver/cartesian_velocity_session.py` | 六轴速度 session、限速/限加速度、命令时序和 watchdog |
| `realman_robot_driver/coordinate_manager.py` | 工具/工作坐标期望状态、回读验证和 motion gate |
| `realman_msgs/action`、`realman_msgs/srv` | ROS 2 Action 与坐标 Service 的公开 IDL |
| `launch/realman_driver.launch.py` | 启动一台 namespaced 驱动 |
| `launch/three_realman_drivers.launch.py` | 启动 `l`、`m`、`r` 三台驱动 |
| `config/ros/realman_driver.yaml` | 三台实例的权威连接与运行参数 |
| `config/ros/realman_driver_mock.yaml` | 不连接真机的自动化测试参数 |
| `config/ros/realman_coordinates.yaml` | 三臂工具/工作坐标、四元数、负载和启动策略 |
| `config/ros/realman_motion.yaml` | 普通运动与末端速度的逐臂安全上限 |
| `config/python/realman-sdk-requirements.txt` | Docker 使用的 SDK 版本锁定 |

SDK 适配器保留厂商返回码。SDK 未安装且关闭 mock 时，连接返回驱动内部状态 `-100`；该值不是睿尔曼 API2 官方错误码，用于明确区分本地依赖缺失。

## ROS 图

三臂 launch 创建：

```text
/l/realman_driver
├── /l/joint_states       sensor_msgs/msg/JointState
├── /l/connected          std_msgs/msg/Bool
├── /l/execute_motion     realman_msgs/action/ExecuteMotion
├── /l/cartesian_velocity realman_msgs/action/CartesianVelocity
├── /l/cartesian_velocity/command geometry_msgs/msg/TwistStamped
├── /l/connect            std_srvs/srv/Trigger
├── /l/disconnect         std_srvs/srv/Trigger
├── /l/stop               std_srvs/srv/Trigger
├── /l/status             std_srvs/srv/Trigger
├── /l/coordinates/verify       realman_msgs/srv/VerifyCoordinates
├── /l/coordinates/apply        realman_msgs/srv/VerifyCoordinates
├── /l/coordinates/select_tool  realman_msgs/srv/SelectFrame
└── /l/coordinates/select_work  realman_msgs/srv/SelectFrame

/m/realman_driver         # 相同的 namespaced 接口
/r/realman_driver         # 相同的 namespaced 接口
```

`joint_states.position` 遵守 ROS 约定使用弧度。适配器从 `rm_get_joint_degree()` 读取厂商的度数，节点只在发布边界转换一次。RM65-B 的六个名称固定为 `joint_1` 到 `joint_6`，由配置中的 `joint_names` 显式声明。

未连接或 SDK 状态查询失败时不发布不可用的关节状态；mock 连接后发布六轴零位。通信错误 `-1/-2` 会将当前连接标记为失效，节点按 `reconnect_interval` 自动重连。`connected` 表示连接生命周期，调用方还应检查 `/status` 返回的 `last_error`。

`stop` 当前映射到官方 `rm_set_arm_stop()`，表示最快关节速度受控停止且轨迹不可恢复。它不是断电急停，也不替代现场安全回路。

## 普通运动 Action

每臂的 `execute_motion` Action 提供同一套可取消接口：

| `command` | 官方调用 | 目标字段与单位 |
| --- | --- | --- |
| `MOVEJ=0` | `rm_movej()` | `joint_degrees[6]`，度 |
| `MOVEL=1` | `rm_movel()` | `pose_position_m[3]`（m）和 `pose_quaternion_wxyz[4]` |
| `MOVEJ_P=2` | `rm_movej_p()` | `pose_position_m[3]`（m）和 `pose_quaternion_wxyz[4]` |

四元数顺序固定为 `w, x, y, z`，入口会检查有限值、非零模并归一化。ROS 接口和内部状态不使用 Euler 角；只有 SDK 确实只接受 Euler 的坐标写入边界才会进行一次转换。`velocity_percent` 范围为 `1..100`，`blend_radius_percent` 为 `0..100`，第一版只接受 `connect=false`，`timeout_sec` 必须为正有限数。

一个目标只有同时收到当前 generation 的成功事件、观察到轨迹曾为 active 后回到 inactive、连接仍有效时才成功；MOVEJ 还要求六个关节都落入 `joint_goal_tolerance_deg`。如果 MOVEJ 提交前回读关节已经在目标容差内，驱动直接返回 `motion already at target`，不再等待控制器产生一条空轨迹。反馈阶段依次为 `VALIDATING`、`SUBMITTING`、`EXECUTING`，停止时进入 `STOPPING`，并持续返回当前关节角、活动坐标、API2 状态和详情。Action cancel 使用 `rm_set_arm_slow_stop()` 并等待 inactive；`/l|m|r/stop` 抢占 ownership 并使用 `rm_set_arm_stop()`。

以下命令可在 mock 服务运行时验证完整 Action，不会连接真机：

```bash
ros2 action send_goal /l/execute_motion realman_msgs/action/ExecuteMotion \
  "{command: 0, reference_type: 0, reference_name: base, \
    joint_degrees: [0, 0, 0, 0, 0, 0], \
    pose_position_m: [0, 0, 0], \
    pose_quaternion_wxyz: [1, 0, 0, 0], \
    velocity_percent: 10, blend_radius_percent: 0, \
    connect: false, timeout_sec: 2.0}" --feedback
```

`reference_type` 为 `BASE=0`、`WORK=1` 或 `TOOL=2`；`reference_name` 使用控制器名称，例如 `base`、`cell` 或 `tcpgrip`。WORK/TOOL 必须与当前已回读验证的控制器选择一致。

## 坐标系与 motion gate

`config/ros/realman_coordinates.yaml` 是工具和工作坐标的权威期望状态。每个工具包含控制器名、namespaced ROS frame、位置（m）、`quaternion_wxyz`、负载（kg）和质心（m）；工作坐标包含控制器名、ROS frame、位置和四元数。默认三臂工具为 `tcpgrip`，工作坐标为 `cell`。

RealMan RM65 控制器的 `rm_get_current_tool_frame()` 回读中，`rm_frame_t.x/y/z` 质心字段使用毫米；驱动适配器在 SDK 边界将其转换为米后再交给坐标管理器。工具配置、`rm_set_manual_tool_frame()`/`rm_update_tool_frame()` 写入以及项目内部接口统一使用米。不要为了适配该回读值把 `config/ros/realman_coordinates.yaml` 中的质心改成毫米。

默认 `policy.on_start=verify`：每次连接只读取控制器当前工具/工作坐标并逐字段比较，不写入控制器。API2 读取失败或任一字段不匹配都会关闭该臂 motion gate；该 gate 拦截依赖控制器工具/工作坐标的 `MOVEL`、`MOVEJ_P` 和速度 session。关节空间 `MOVEJ` 只使用六轴关节角，不依赖当前工具/工作坐标，因此仍可用于低速回零、离开安全位置或后续重新校准。四个 Service 与普通运动共享单臂 ownership：

| Service | 行为 |
| --- | --- |
| `coordinates/verify` | 只读回查；完整匹配后开放 motion gate |
| `coordinates/apply` | 显式写入默认工具/工作坐标、选择并回读 |
| `coordinates/select_tool` | 选择配置内工具并回读完整坐标状态 |
| `coordinates/select_work` | 选择配置内工作坐标并回读完整坐标状态 |

```bash
ros2 service call /l/coordinates/verify realman_msgs/srv/VerifyCoordinates "{}"
ros2 service call /l/coordinates/select_tool realman_msgs/srv/SelectFrame \
  "{name: tcpgrip}"
ros2 service call /l/coordinates/select_work realman_msgs/srv/SelectFrame \
  "{name: cell}"
```

`coordinates/apply` 会修改真实控制器；只能在机械臂空闲、标定值已复核且现场安全条件满足时显式调用。所有 mutation 在写入后回读，返回 `api2_status`，失败时保持 motion gate 关闭。
当同名工具或工作坐标已经存在时，适配器会在新建接口返回 API2 状态 `1` 后改用
`rm_update_tool_frame()` 或 `rm_update_work_frame()` 覆盖该配置，再选择并回读；因此重复
执行 `coordinates/apply` 不需要人工先删除控制器中的同名坐标。

## 笛卡尔速度 session

`cartesian_velocity` Action 持有单臂运动 ownership，`cartesian_velocity/command` 只更新该 session 的最新六轴目标。`TwistStamped.twist` 的前三项是线速度 `vx/vy/vz`（m/s），后三项是角速度 `wx/wy/wz`（rad/s）；实现不使用 Euler 角。

BASE session 的 `header.frame_id` 必须是 namespaced `l/m/r/base_link`。WORK 和 TOOL session 必须使用当前已验证且激活的 ROS frame。目标还受 `config/ros/realman_motion.yaml` 的线速度、角速度和加速度限制。

命令订阅使用 `KEEP_LAST` depth 1、`VOLATILE`，DDS lifespan 等于该臂配置的 `velocity_watchdog_ms`。订阅拥有独立的 `MutuallyExclusiveCallbackGroup`，不与 Reentrant 的运动 Action callback group 共用。每条命令必须提供非零 `header.stamp`，并满足以下条件：

- 时间戳不得早于当前 Action session 的启动 epoch；
- 时间戳不得晚于节点 ROS clock，也不得比 Action watchdog 更旧；
- 同一 session 中必须严格晚于上一条已接受命令。

上述比较使用节点 ROS clock，因此 `use_sim_time` 测试可以控制时间来源。零时间戳、旧 session backlog、乱序或过期命令都在进入 SDK 控制循环前被拒绝，拒绝日志使用 DEBUG，避免高率无效输入刷 WARN。

控制线程按 `control_period_ms` 调用 SDK；SDK 调用超过 deadline 时跳过过期 tick，并从调用完成时间重排下一周期，不补发 0 ms 间隔的追赶命令。watchdog 由独立监督线程执行，命令时间戳的已有年龄也计入 watchdog。

`trajectory_mode` 为 `0/1/2` 时，`radio` 分别限制为 `0`、`0..100`、`0..1000`。Action IDL 使用 `uint16 radio`，可完整表达滤波模式的官方范围。

session 终止结果保留原始 API2 status 和 message 给 Action 调用方。已停止、无 ownership、无 lockout、无 worker 或 pending reservation 时，后续 `shutdown()` 返回 `0`；仍有停止失败 lockout 时继续返回真实非零状态。这样成功的 `/disconnect` 不会被历史 Action 错误误报为失败，同时当前未解决的物理安全状态仍会阻止成功结果。

先在一个终端启动 session；goal 的周期、watchdog 和加速度不能超过该臂配置：

```bash
ros2 action send_goal /l/cartesian_velocity \
  realman_msgs/action/CartesianVelocity \
  "{reference_type: 0, reference_name: base, control_period_ms: 20, \
    watchdog_ms: 100, max_linear_accel_mps2: 0.10, \
    max_angular_accel_radps2: 0.50, follow: false, \
    trajectory_mode: 0, radio: 0}" --feedback
```

在另一个同 domain 终端按固定频率发布 `TwistStamped`；Humble CLI 的 `stamp: now` 会为每条消息填写当前时间，frame 必须与 session 对应：

```bash
ros2 topic pub --rate 20 /l/cartesian_velocity/command \
  geometry_msgs/msg/TwistStamped \
  "{header: {stamp: now, frame_id: l/base_link}, \
    twist: {linear: {x: 0.01}, angular: {z: 0.05}}}"
```

BASE 的 ROS frame 由驱动固定为 `l/base_link`（中、右臂对应 `m/base_link`、`r/base_link`）；空 frame 或与 session 不一致的 frame 都会被拒绝。WORK/TOOL 使用 `config/ros/realman_coordinates.yaml` 中当前已验证坐标的 `ros_frame_id`。停止发布超过 watchdog 后，session 会发送一次受控停止并返回 `WATCHDOG_STOP`；也可取消 Action 进行受控停止。

## 参数

运行参数由根目录三个文件共同负责：`realman_driver.yaml` 包含 `/l/realman_driver`、`/m/realman_driver` 和 `/r/realman_driver` 三个完整节点名，坐标与运动上限分别由 `realman_coordinates.yaml` 和 `realman_motion.yaml` 负责。

| 参数 | 默认策略 | 约束 |
| --- | --- | --- |
| `robot_model` | `RM65-B` | 必须与控制器和 URDF 型号一致 |
| `robot_ip` | `l=192.168.30.123`、`m=192.168.30.125`、`r=192.168.30.124` | 必须与现场控制器网络一致 |
| `robot_port` | `8080` | 有效 TCP/SDK 端口范围 `1..65535` |
| `thread_mode` | `RM_TRIPLE_MODE_E` | 当前必须为三线程；普通运动完成事件依赖 SDK callback |
| `mock_mode` | `false` | `true` 时不导入 SDK，不访问任何控制器 |
| `auto_connect` | `true` | 启动时连接并开始回读；设为 `false` 可手动调用 `connect` |
| `reconnect_interval` | `5.0` 秒 | 连接失败或断线后的重连周期；`0.0` 禁用 |
| `state_publish_rate` | `10.0` Hz | 必须大于零；后续应按网络和控制器能力测定 |
| `joint_names` | `joint_1` 到 `joint_6` | 数量必须与 SDK 返回的自由度一致 |
| `coordinates_config_file` | `config/ros/realman_coordinates.yaml` | 工具/工作坐标和启动验证策略的权威配置 |
| `motion_config_file` | `config/ros/realman_motion.yaml` | 每臂速度、加速度、控制周期、watchdog 和停止超时的权威配置 |

`realman_motion.yaml` 对 `l/m/r` 分别定义下列上限，所有值必须为正且有限：

| 字段 | 当前值 | 单位/用途 |
| --- | --- | --- |
| `default_timeout_sec` | `10.0` | 普通运动默认 deadline，秒 |
| `max_linear_speed_mps` | `0.05` | 末端线速度上限，m/s |
| `max_angular_speed_radps` | `0.25` | 末端角速度上限，rad/s |
| `velocity_control_period_ms` | `20` | SDK 速度控制周期，ms |
| `velocity_watchdog_ms` | `100` | 最新有效命令超时，ms |
| `max_linear_accel_mps2` | `0.10` | 线加速度上限，m/s² |
| `max_angular_accel_radps2` | `0.50` | 角加速度上限，rad/s² |
| `joint_goal_tolerance_deg` | `0.25` | MOVEJ 每关节完成容差，度 |
| `stop_timeout_sec` | `2.0` | 等待轨迹确认 inactive 的上限，秒 |

真机地址只能在根目录 `config/ros/realman_driver.yaml` 修改。不要把 IP、端口或型号散落到 launch 文件、Dockerfile 或源代码中。

SDK 依赖由根目录 `config/python/realman-sdk-requirements.txt` 锁定为 `Robotic_Arm==1.1.6`，Docker 构建时安装。

真实三线程模式下，SDK 的 `rm_get_arm_event_call_back()` 要求
`rm_event_callback_ptr`（ctypes 回调指针），不能直接传入普通 Python callable。
`RealManSdkAdapter` 在硬件模式下负责创建并保留这个桥接指针，把
`rm_event_push_data_t` 转成 Action 协调器使用的字典；mock 模式仍使用普通 Python
回调。回调注册失败会保留 API2 状态并关闭连接，驱动随后按 `reconnect_interval` 重试，
不会把未确认的轨迹报告为成功。

## 独立启动

Docker mock 测试，不会访问 `192.168.30.*`：

```bash
docker compose build realman_driver_test
docker compose run --rm realman_driver_test
```

也可以加载 Zsh 函数后运行：

```zsh
source ./functions.zsh
rm65_docker_driver_test
```

独立启动真实三臂驱动：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select realman_robot_driver
source install/setup.bash
ros2 launch realman_robot_driver three_realman_drivers.launch.py \
  config_file:=/path/to/realman_pi/config/ros/realman_driver.yaml
```

真机回读话题：

```bash
ros2 topic echo /l/joint_states
ros2 topic echo /m/joint_states
ros2 topic echo /r/joint_states
ros2 service call /r/status std_srvs/srv/Trigger {}
```

`joint_states.position` 是弧度，不是睿尔曼 SDK 的角度制。三台驱动使用独立 SDK 句柄，分别对应 `l/m/r` 和上面的三个 IP。

## 单臂 SDK 最小探针

当需要区分控制器网络/SDK 连接问题与 ROS 2、TF 或 RViz 编排问题时，可运行驱动包内的
只读 Python 探针。它只执行 `rm_create_robot_arm()`、`rm_get_joint_degree()` 和资源释放，
不会发送运动、停止、IO 或配置指令。

在远程主机上先将目标控制器地址放入当前 shell，再使用无图形的 Compose 服务执行：

```bash
export REALMAN_ROBOT_IP='<controller-ip>'
docker compose run --rm --no-deps realman_bringup_remote \
  python3 -m realman_robot_driver.connection_probe \
  --robot-ip "$REALMAN_ROBOT_IP" \
  --robot-port 8080 \
  --connect-level 3 \
  --thread-mode 2 \
  --refresh-interval 0.05 \
  --print-every 4 \
  --samples 8
```

这里的 `--thread-mode 2` 是 SDK 的 `RM_TRIPLE_MODE_E` 数值，`--connect-level 3` 与
官方 `rm_create_robot_arm()` 默认连接等级一致。成功时应看到 `connected` 和若干
`joint_degrees` 样本；失败时命令以非零状态退出，并保留 API2 返回码。只需验证句柄和
一次状态读取时，将 `--samples` 设为 `1`。

`auto_connect` 对真实和 mock 模式都生效。mock 模式启动后立即建立内存连接并以
`state_publish_rate` 发布六轴零位，因此可以在没有控制器的情况下验证 ROS 图、单位转换和
TF 消费关系。

真实状态直接驱动 RViz 2：

```bash
docker compose build realman_driver_rviz
docker compose run --rm realman_driver_rviz
```

该服务启动三台驱动、三棵带前缀的 `robot_state_publisher` TF 树和 RViz 2，不启动手柄节点。RViz 的三个 RobotModel 分别使用 `/l/robot_description`、`/m/robot_description` 和 `/r/robot_description`，固定坐标系为 `world`。

离线验证完整数据链路：

```bash
docker compose run --rm -e ROS_DOMAIN_ID=168 realman_driver_test bash -lc '
  ros2 launch realman_bringup system.launch.py \
    start_driver:=true \
    driver_config_file:=/opt/rm65_ws/config/ros/realman_driver_mock.yaml \
    start_joy_driver:=false start_controller:=false \
    use_gui:=false use_rviz:=false
'
```

在另一个同一容器或同一 ROS domain 的终端检查：

```bash
ros2 node list
ros2 topic info /l/joint_states --verbose
ros2 topic info /m/joint_states --verbose
ros2 topic info /r/joint_states --verbose
ros2 run tf2_ros tf2_echo world l/link_6
ros2 run tf2_ros tf2_echo world m/link_6
ros2 run tf2_ros tf2_echo world r/link_6
```

预期每个 `joint_states` 只有对应 `realman_driver` 一个发布者，并由对应的
`robot_state_publisher` 订阅；`world -> l/m/r/link_6` 均可持续查询。节点列表中不应出现
`joint_state_publisher`，否则说明假关节状态源没有被驱动模式禁用。

运动接口的 mock graph 还应包含 6 个 Action、12 个坐标 Service 和 3 个速度命令 topic：

```bash
ros2 action list
ros2 service list | grep '/coordinates/'
ros2 topic list | grep '/cartesian_velocity/command'
```

mock 普通运动会依次报告 active、inactive 和成功完成事件，因此 MOVEJ、MOVEL、MOVEJ_P 使用各自目标字段时均应返回 `success: true`、`terminal_state: 0`、`api2_status: 0`。这是 ROS 协议和状态机验证，不代表真实机械臂执行或安全验证。

## 与描述 Bringup 的关系

`rm65_description/three_robots.launch.py` 支持两种互斥的关节状态源：

- 模型查看：默认使用 `joint_state_publisher` 的假状态；
- 真机运行：使用 `use_driver_joint_states:=true`，禁用假状态，接收 `realman_robot_driver` 发布的真实状态。

统一 `realman_bringup/system.launch.py` 默认启用第二种模式，并透传 `start_driver` 控制驱动和关节状态源。

## 日志

节点只使用 `rclpy` 官方日志接口。独立 launch 设置 `RCUTILS_COLORIZED_OUTPUT=1`，并在 `REALMAN_LOG_ROOT` 下创建 `YYYYMMDD_HHMMSS` 目录作为 `ROS_LOG_DIR`。launch 通过 namespace 设置进程 argv0，因此 Docker 继承的项目根目录 `logs/` 中会生成 `l_realman_driver_<pid>_<timestamp>.log`、`m_realman_driver_<pid>_<timestamp>.log` 和 `r_realman_driver_<pid>_<timestamp>.log`。

状态轮询错误只在错误码变化时打印，避免每个定时周期刷屏。连接失败日志保留 API2 状态和 SDK 异常详情，但不记录密码或凭据。

收到 launch 的 `SIGINT` 或 ROS context 外部关闭时，节点先释放 SDK 连接，再销毁 ROS
资源；重复关闭不会再次调用无效 context。正常 Ctrl-C 的三个驱动进程都应显示
`process has finished cleanly`，不应出现 Python traceback。

## 真机运行门槛

真机验收必须由现场操作人员执行，本轮自动化验证不包含任何真实连接、运动、停止或坐标写入。按以下顺序逐级放行，任一步的 API2 状态非零、回读不一致或停止无法确认时立即停止后续步骤：

1. 记录 Python、`Robotic_Arm`、控制器固件、控制层、规划层、算法和动力学版本；Docker 使用 `config/python/realman-sdk-requirements.txt` 固定客户端版本。
2. 核对工业交换机侧网卡路由和三臂映射：左臂 `192.168.30.123`、中臂 `192.168.30.125`、右臂 `192.168.30.124`，端口均为 `8080`。无线远程链路不能替代工控机到机械臂局域网的有线可达性。
3. 逐臂运行“单臂 SDK 最小探针”，只创建句柄并读取关节；确认返回型号、六轴角度和资源释放，不启动 ROS 运动接口。
4. 使用 `realman_driver_rviz` 只观察 `/l|m|r/joint_states`、连接状态、TF 和 RViz 姿态；核对厂商度数到 ROS 弧度的转换及左/中/右模型对应关系。
5. 对每臂调用 `coordinates/verify`，只读比对当前工具/工作坐标。发生 mismatch 时先核对标定和配置；未经复核不得用 `coordinates/apply` 覆盖控制器。
6. 清空工作区、限制负载、确认碰撞设置，安排一名人员保持可触达现场急停。一次只允许一个 arm namespace 取得 ownership，先以低 `velocity_percent` 执行经人工确认可达的小幅 MOVEJ。
7. 检查 Action 的 VALIDATING/SUBMITTING/EXECUTING 反馈、当前关节角、API2 状态以及最终 active-to-inactive 证据；随后单独验证 cancel 的缓停和 `/stop` 的最快受控停止。二者都不是断电急停。
8. MOVEL/MOVEJ_P 从已知安全位姿开始，先核对 `reference_type`、控制器 `reference_name`、位置单位 m 和四元数 `wxyz`，再使用低速度执行；不要在奇异位形、软件限位或共享工作区边界附近测试。
9. 末端速度 session 先持续发布六轴零速度，再只开放一个低幅线速度轴；验证加速度限制后停止发布，让 watchdog 自动停止。随后分别验证角速度、Action cancel 和显式 `/stop`，整个过程中保持固定 `control_period_ms`。
10. 最后验证通信中断、自动重连、旧时间戳命令拒绝、lockout、`disconnect` 清理和重新 `verify`。每次验收记录命令、目标、返回码、日志目录和现场观察，不以重复下发掩盖错误。

接口和版本依据见[睿尔曼 Python 驱动查询 Skill](./realman-python-driver)。后续每增加一个运动、力控或 IO 接口，都要同时补适配器测试、ROS 接口测试、失败路径和本页契约。

## 当前限制

- SDK 版本由 `config/python/realman-sdk-requirements.txt` 锁定；真实控制器、网络连通性和固件兼容性仍需现场确认。
- 连接和状态读取当前在 ROS executor 线程中同步执行；生产实现需要避免网络阻塞占用关键回调线程。
- 已实现基础连接重试和速度命令专项 QoS；尚未实现关节状态陈旧检测和诊断消息。
- 已实现普通运动 Action 和笛卡尔速度 session；尚未实现力控、IO、Modbus、UDP 和末端设备接口。
- 未验证真实 RM65 控制器；所有真机参数和固件兼容性仍需现场确认。
