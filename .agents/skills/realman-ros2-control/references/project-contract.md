# RealMan ROS 2 项目控制契约

本参考文件是 `realman-ros2-control` 的项目速查表。实现前仍须读取 IDL、当前源码和相关配置；
以下值不得复制到业务代码中硬编码。

## 拓扑与配置

| 机械臂 namespace | 物理位置 | 控制接口 | 夹爪节点 |
| --- | --- | --- | --- |
| `/l` | 左 | `realman_robot_driver` | `/gripper_left` |
| `/m` | 中 | `realman_robot_driver` | 无 |
| `/r` | 右 | `realman_robot_driver` | `/gripper_right` |

权威配置：

| 内容 | 路径 |
| --- | --- |
| 控制器连接和 driver 参数 | `config/ros/realman_driver.yaml` |
| 运动安全与速度参数 | `config/ros/realman_motion.yaml` |
| 工具和工作坐标 | `config/ros/realman_coordinates.yaml` |
| 三臂 TF/布局 | `config/ros/three_robots.yaml` |
| Changingtek 夹爪参数 | `config/ros/gripper_params.yaml` |
| Compose 与夹爪设备映射 | `config/docker/compose.yaml` |
| 系统 bringup | `src/realman_bringup/launch/system.launch.py` |

IP、端口、坐标名、串口和 Docker 设备映射只能来自这些配置和运行环境。修改它们时使用
`$project-config-layout`。

## 运动 Action

所有机械臂都有相同端点，将 `{arm}` 替换为 `l`、`m` 或 `r`：

| Endpoint | 类型 | 适用场景 |
| --- | --- | --- |
| `/{arm}/execute_motion` | `realman_msgs/action/ExecuteMotion` | 单个 MOVEJ、MOVEL、MOVEJ_P |
| `/{arm}/execute_trajectory` | `realman_msgs/action/ExecuteTrajectory` | 2--256 个已知连续路点 |
| `/{arm}/cartesian_velocity` | `realman_msgs/action/CartesianVelocity` | 建立六轴末端速度 session |
| `/{arm}/cartesian_velocity/command` | `geometry_msgs/msg/TwistStamped` | 刷新活动速度 session 的命令 |
| `/{arm}/stop` | `std_srvs/srv/Trigger` | 抢占并快速停止当前 arm |
| `/{arm}/recover_motion` | `realman_msgs/srv/RecoverMotion` | 取消/异常后的事件通道恢复 |
| `/{arm}/get_current_pose` | `realman_msgs/srv/GetCurrentPose` | 当前位姿读取 |
| `/{arm}/forward_kinematics` | `realman_msgs/srv/ForwardKinematics` | FK |
| `/{arm}/solve_ik` | `realman_msgs/srv/SolveIk` | IK |
| `/{arm}/coordinates/verify` | `realman_msgs/srv/VerifyCoordinates` | 已配置坐标的只读验证 |
| `/{arm}/coordinates/select_tool` | `realman_msgs/srv/SelectFrame` | 选择工具坐标 |
| `/{arm}/coordinates/select_work` | `realman_msgs/srv/SelectFrame` | 选择工作坐标 |

### ExecuteMotion 重要字段

| 字段 | 约束 |
| --- | --- |
| `command` | `MOVEJ=0`，`MOVEL=1`，`MOVEJ_P=2` |
| `reference_type` | `BASE=0`，`WORK=1`，`TOOL=2` |
| `reference_name` | 非空、已配置、与已验证的激活控制器坐标一致 |
| `joint_degrees` | 仅 MOVEJ，恰好 6 个 finite degree 值 |
| `pose_position_m` | 仅 MOVEL/MOVEJ_P，3 个 finite metre 值 |
| `pose_quaternion_wxyz` | 仅位姿命令，4 个 finite 非零 WXYZ 值，须归一化 |
| `velocity_percent` | 1--100，SDK 百分比，非 m/s |
| `blend_radius_percent` | 0--100；单点普通运动中不可假定其产生连接轨迹 |
| `connect` | 普通 `ExecuteMotion` 当前必须为 `false` |
| `timeout_sec` | 正的有限秒数 |

`ExecuteMotion` terminal state：`SUCCEEDED=0`、`CANCELED=1`、`ABORTED=2`、`TIMEOUT=3`。
feedback phase：`VALIDATING=0`、`SUBMITTING=1`、`EXECUTING=2`、`STOPPING=3`。

`MotionCoordinator` 管理 reservation、单臂 ownership、generation、取消、停止、lockout 和事件
通道恢复。取消/停止后不能立刻以新 goal 覆盖旧动作，必须等待终态与必要的恢复。

### 速度 session

先发送 `CartesianVelocity` goal 创建 session，随后持续发布带合理 stamp 的
`TwistStamped` 到 command topic。线速度为 m/s，角速度为 rad/s，分别对应 XYZ 和 XYZ 旋转；
每一个 timer tick 只更新最新命令。命令过期由 watchdog 停止，业务层也应在故障、失焦或取消时
发送零速度/取消并等待 Action 终态。不要改用无限循环直接调用 SDK。

## Changingtek 夹爪接口

每个存在的 `/gripper_left`、`/gripper_right` 节点提供：

| Endpoint | 类型 | 语义 |
| --- | --- | --- |
| `~/open` | `std_srvs/srv/Trigger` | 移动到配置的打开位置 |
| `~/close` | `std_srvs/srv/Trigger` | 移动到配置的关闭位置 |
| `~/percentage` | `gripper_ros2_msgs/srv/GripperPercentage` | `0.0` 闭合，`1.0` 张开；需已标定 |
| `~/enable` | `std_srvs/srv/SetBool` | 使能或禁用驱动 |
| `~/reset` | `std_srvs/srv/Trigger` | 执行执行器复位 |
| `~/calibrate` | `std_srvs/srv/Trigger` | 后台行程标定；空载执行 |
| `~/grasp_check` | `std_srvs/srv/Trigger` | 基于力矩达到判断抓取 |
| `~/position` | `std_msgs/msg/Float64` | 设备位置单位，约 10 Hz |
| `~/torque_reached` | `std_msgs/msg/Bool` | 当前是否达到力矩限制 |
| `~/alarm` | `std_msgs/msg/Int32` | 底层报警值 |

夹爪标定会先找张开极限、再在空载下找闭合极限、最后回到张开位置。标定中和未标定时
percentage 服务会拒绝请求。close/percentage 的 Service 成功不等价于拿稳物体；抓取结论需要
结合 `grasp_check`、`torque_reached`、位置、报警和任务层超时。

## 代码、文档与验证位置

| 主题 | 先读位置 |
| --- | --- |
| Action IDL | `src/driver/realman_msgs/action/` |
| Motion lifecycle | `src/driver/realman_robot_driver/realman_robot_driver/motion_coordinator.py` |
| Velocity session | `src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py` |
| ROS server and coordinate services | `src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py` |
| SDK boundary | `src/driver/realman_robot_driver/realman_robot_driver/realman_sdk_adapter.py` |
| Gripper node | `src/gripper/gripper_ros2/gripper_ros2/gripper_node.py` |
| Gripper service definition | `src/gripper/gripper_ros2_msgs/srv/GripperPercentage.srv` |
| Action lifecycle and tests | `website/docs/development/realman-action-development.md` |
| Driver runtime and production checklist | `website/docs/development/realman-driver-scaffold.md` |
| Web protocol boundary | `website/docs/development/realman-web-control.md` |

新增或改变公开行为时使用 `$document-feature-updates`；改变 ROS runtime 行为时使用
`$ros2-logging-conventions`。对 RealMan Python SDK API、错误码、坐标或末端设备能力有疑问时，
必须使用 `$realman-python-driver`。
