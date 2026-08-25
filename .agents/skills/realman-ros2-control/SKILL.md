---
name: realman-ros2-control
description: Develop, review, or debug RealMan ROS 2 arm motion, Action, coordinate, velocity, and existing Modbus gripper control in realman_pi. Use whenever a change can command, cancel, observe, configure, or test the arms or grippers.
---

# RealMan ROS 2 控制

将本 Skill 用于 `realman_pi` 中所有会控制、停止、观测、配置或测试机械臂和夹爪的工作，
包括新的 ROS 2 节点、Action/Service、Web 控制、坐标系、末端速度、夹爪，以及对这类问题的
调试和代码审查。它定义项目控制边界；厂商 Python SDK 的具体 API、数据结构和兼容性问题，
同时使用 `$realman-python-driver` 查询。

先阅读 [项目控制契约](references/project-contract.md)，再按下面流程工作。接口 IDL 和代码是
最终权威来源，文档用于定位和解释，不能用记忆替代当前代码。

## 不可跨越的边界

- SDK 仅能在 `realman_robot_driver` 的 adapter/driver 边界内调用。Web、标定、规划和业务节点
  只能调用 ROS Action、Service 或订阅 Topic，绝不能直接创建 `Robotic_Arm`、直连控制器，或
  绕过 `MotionCoordinator`。
- 普通运动必须复用 `/l`、`/m`、`/r` 下的 `execute_motion` 或 `execute_trajectory`；六轴末端
  速度必须复用 `cartesian_velocity` session。业务 Action 如需组合多个步骤，应编排这些 Action，
  而不是新增一个会直调 SDK 的平行通道。
- 每个可移动操作都必须提供可观察的反馈、明确终态和取消路径。只有 `result.success == true`
  且 `terminal_state == SUCCEEDED` 才代表完成；SDK `api2_status == 0` 仅代表某次调用成功。
- 不硬编码 IP、端口、机械臂布局、工具/工作坐标、串口或夹爪左右关系。它们属于项目根
  `config/`；新增或修改配置时使用 `$project-config-layout`。
- 操作中的坐标必须经过 driver 的坐标 gate 验证。任意 TF frame 必须在业务层转换到该 arm 的
  `base_link`，再按 `BASE/base` 提交；不能把普通 TF frame 冒充为控制器的 WORK 或 TOOL。
- 实体 URDF 姿态只来源于 `/joint_states`。Action `VALIDATING` feedback 的关节值可能是零填充，
  不可据此驱动实体或覆盖实际状态。

## 开发流程

1. 先明确控制对象、命名空间、坐标、单位、速度/超时和停止语义。使用 `l`、`m`、`r`，不要把
   左中右的物理位置推断为固定网络/夹爪名称；从配置和既有启动图确认。
2. 先查现有端点是否已经满足需求。单点关节/位姿用 `ExecuteMotion`，预先确定的连续路点用
   `ExecuteTrajectory`，连续六轴笛卡尔速度用 `CartesianVelocity`。仅当现有 ROS 契约确实
   无法表达需求时才扩展 `realman_msgs`，并同时更新测试与开发文档。
3. 调用 Action 时严格走：等待 server -> 发送 goal -> 消费 feedback -> 必要时 cancel -> 等待
   terminal result -> 检查 `success`、`terminal_state`、`api2_status` 和 `message`。不要将
   `send_goal_async()` 完成、一次 SDK 受理或单个 event 当作运动完成。
4. 在发送可动 goal 前确认连接、当前坐标选择、motion gate、目标可达性和 arm ownership。每个
   arm 只能有一个写入操作；不要用多线程或新的 client 绕过这一约束。
5. 取消必须等待 Action 的取消结果；若动作已提交，驱动会停止、确认 inactive，并可能重建事件
   通道。结果提示 recover/lockout 时调用对应 `recover_motion`，在恢复成功前不重发运动。
6. 新控制功能先完成纯单元测试和 mock/read-only 验证，再在真机低速、无遮挡、急停可达的条件下
   验证正常完成、取消、超时、断连/错误和停止恢复。测试不得默认连接真实控制器。

## Action 与坐标规则

`ExecuteMotion` 的 `MOVEJ` 只接收六个 `joint_degrees`；`MOVEL` 与 `MOVEJ_P` 接收
`pose_position_m` 和 `pose_quaternion_wxyz`。四元数必须是有限、非零的 WXYZ，入口要归一化。
执行前确认数组长度与模式匹配，不能为了复用表单传入无效的另一类字段。

单位是高风险边界：ROS `JointState` 使用 rad，`ExecuteMotion.joint_degrees`、结果中的
`final_joint_degrees` 使用 degree，位置使用 m，姿态使用 WXYZ；SDK 的位姿欧拉角为 rad。末端
速度是六维 `[linear.x, linear.y, linear.z, angular.x, angular.y, angular.z]`，线速度为 m/s、
角速度为 rad/s。外部 Euler 输入须先变为归一化四元数，内部若需 SDK Euler 转换须显式处理，
避免把 Euler 三元组错误当作 ROS 姿态。

WORK/TOOL 名称必须在 `config/ros/realman_coordinates.yaml` 中配置并已通过控制器回读验证；选择、
应用或切换坐标系时复用对应 Service，且不能在执行中的 trajectory 内切换坐标。

## 夹爪流程

项目现有夹爪不是 RealMan SDK 末端设备 API，而是 Changingtek/知行 RS-485 Modbus RTU ROS 节点。
`/l` 使用 `/gripper_left`，`/r` 使用 `/gripper_right`；`/m` 当前没有夹爪，必须明确返回不支持。
不要从节点名、USB 编号或 SDK 经验推断映射。

1. 启动前确认 `REALMAN_START_GRIPPERS`、udev 稳定设备名和
   `config/ros/gripper_params.yaml`。没有硬件时关闭夹爪启动，不要把容器中的临时 `/dev/ttyUSB*`
   当成永久配置。
2. 调用前等待服务，读取 `position`、`torque_reached`、`alarm` 状态，拒绝或上报持续报警、无数据
   和连接失败。需要时先 `enable`；复位后重新确认状态。百分比定位前必须等待行程标定结束。
3. 使用 `open`/`close` 执行端点动作，使用 `percentage` 执行中间开合度（`0.0` 为闭合，`1.0`
   为张开）。Service 成功只说明该命令流程成功，不能单独宣称抓取成功。
4. 抓取结果通过 `grasp_check` 与 `torque_reached`、位置、报警联合判断，并设置超时和应用级
   失败语义。新硬件或 RealMan 原厂 tool IO/RM Plus 设备必须先查 `$realman-python-driver` 的
   官方参考，另行定义 ROS 契约，不能复用本夹爪服务假装兼容。

## 改动清单

- ROS 接口、坐标/单位、安全门槛、Action 反馈和取消语义发生变化时，使用
  `$document-feature-updates` 更新 `website/docs/development/`；接口 IDL、实现、网页协议和测试
  必须保持一致。
- 新增或改变 ROS node、launch、bringup 或诊断时，使用 `$ros2-logging-conventions`，保留 node
  名、命名空间、结构化错误和可定位的日志。
- 每项 Action 至少测试：静态输入拒绝、成功结果、SDK/API 错误、cancel、timeout、并发 ownership
  和停止后恢复。速度 session 还测试 command freshness/watchdog、重复 tick 和零速度停止。
- 每项夹爪流程至少测试：服务不存在/失败、未标定 percentage、左右/中臂路由、状态/报警反馈和
  抓取判断。硬件测试必须有 timeout，不能无限等待串口或运动完成。
- 进行真机实验时，记录目标 arm、参考系、速度、运行配置、操作人和恢复结果；先从低速、单臂、
  空载开始。发现状态不确定时先停止并恢复，不要重试覆盖。

## 工作前定位

优先读取 `src/driver/realman_msgs/action/`、
`src/driver/realman_robot_driver/realman_robot_driver/motion_coordinator.py`、
`src/driver/realman_robot_driver/realman_robot_driver/cartesian_velocity_session.py` 和
`src/driver/realman_robot_driver/realman_robot_driver/realman_driver_node.py`。夹爪读取
`src/gripper/gripper_ros2/gripper_ros2/gripper_node.py` 与
`src/gripper/gripper_ros2_msgs/srv/GripperPercentage.srv`。完整项目端点、配置位置和开发命令见
[项目控制契约](references/project-contract.md)；逐项 Action 生命周期和测试语义见
`website/docs/development/realman-action-development.md`。
