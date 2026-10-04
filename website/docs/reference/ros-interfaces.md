---
title: ROS 2 接口总表
description: realman_pi 所有对外 ROS 2 节点、Action、Service 和 Topic 的速查表，并指向各自的契约页面。
---

# ROS 2 接口总表

本页是**速查表**：每一行只回答"接口叫什么、类型是什么、谁拥有它"，字段语义、单位、安全约束和失败方式见链接的专题页。接口以代码为准；新增或修改接口时，同一次提交必须更新本页和对应专题页。

约定：`<arm>` 为 `l`、`m`、`r`（左/中/右）；Action、Service、Topic 全部带该 namespace。`msg`/`srv`/`action` 类型来自 [`src/driver/realman_msgs/`](https://github.com/QingTianRobot/realman_pi/tree/main/src/driver/realman_msgs) 和 [`src/gripper/gripper_ros2_msgs/`](https://github.com/QingTianRobot/realman_pi/tree/main/src/gripper/gripper_ros2_msgs)。

## 机械臂驱动 `/<arm>/realman_driver`

拥有者：`realman_robot_driver`。契约：[三臂驱动与运动控制](../development/realman-driver-scaffold)、[Action 开发与测试](../development/realman-action-development)。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `/<arm>/joint_states` | `sensor_msgs/JointState` | 弧度；未连接时不发布 |
| `/<arm>/connected` | `std_msgs/Bool` | 连接生命周期，不等于"状态新鲜" |
| `/<arm>/coordinates/state` | `std_msgs/String`（JSON） | 坐标校验结果；reliable + transient-local，低频重发 |
| `/<arm>/cartesian_velocity/state` | `realman_msgs/CartesianVelocityState` | 指令速度与实测速度遥测 |
| `/<arm>/execute_motion` | Action `ExecuteMotion` | `MOVEJ` / `MOVEL` / `MOVEJ_P`，可取消 |
| `/<arm>/execute_trajectory` | Action `ExecuteTrajectory` | 2–256 个连续路点，整条队列占有 ownership |
| `/<arm>/cartesian_velocity` | Action `CartesianVelocity` | 开放式六轴速度 session（仅 WORK / TOOL） |
| `/<arm>/cartesian_velocity/command` | `geometry_msgs/TwistStamped`（订阅） | 刷新 session 的最新速度；非零且单调递增的 stamp |
| `/<arm>/cartesian_pose` | Action `CartesianPose` | 绝对位姿 session：IK + CANFD 关节透传 |
| `/<arm>/cartesian_pose/command` | `geometry_msgs/PoseStamped`（订阅） | 刷新位姿 session 的最新目标（base frame） |
| `/<arm>/connect` `disconnect` `stop` `status` | `std_srvs/Trigger` | 连接生命周期、软件受控停止、状态 |
| `/<arm>/recover_motion` | `realman_msgs/RecoverMotion` | 取消后重建事件通道；不发送运动 |
| `/<arm>/controller_info` | `std_srvs/Trigger` | 只读控制器信息（JSON），用于比对两台控制器 |
| `/<arm>/get_current_pose` | `realman_msgs/GetCurrentPose` | 关节 FK → 当前位姿（按已验证参考系） |
| `/<arm>/forward_kinematics` | `realman_msgs/ForwardKinematics` | 任意关节角的 FK |
| `/<arm>/solve_ik` | `realman_msgs/SolveIk` | 参考系目标 → 关节解（度） |
| `/<arm>/coordinates/verify` `apply` | `realman_msgs/VerifyCoordinates` | 只读回查 / 显式写入默认工具与工作坐标 |
| `/<arm>/coordinates/select_tool` `select_work` | `realman_msgs/SelectFrame` | 选择配置内的工具/工作坐标并回读 |

同一时刻一只臂只允许一个运动 owner；`stop` 抢占 ownership。`reference_type` 为 `BASE=0` / `WORK=1` / `TOOL=2`，速度 session 拒绝 BASE。

## 行为树与输入路由 `/realman_bt_executor`

拥有者：`realman_bt`。契约：[行为树控制权与 Mock 测试](../development/behavior-tree-control)、[Pika 遥操作](../development/pika-teleop)。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `/realman_bt_executor/list_input_modes` | `realman_msgs/ListInputModes` | 按 XML 顺序发现输入模式目录 |
| `/realman_bt_executor/select_input_mode` | `realman_msgs/SelectInputMode` | 请求模式（`mode_id` + 非空 `requester_id`） |
| `/realman_bt_executor/input_mode_state` | `realman_msgs/InputModeState` | `ACTIVE` / `SWITCHING` / `FAILED` 及 epoch |
| `/realman_bt_executor/bt_status` | `std_msgs/String` | 执行器状态 |
| `/realman_bt_executor/start` `stop` | `std_srvs/Trigger` | 执行器生命周期 |
| `/keyboard/<l\|r>/cartesian_velocity` | `geometry_msgs/TwistStamped` | Web 键盘 ingress（由 `realman_web_control` 发布） |
| `/keyboard/<l\|r>/gripper_command` | `std_msgs/String`（JSON） | 键盘夹爪事件（epoch / request 去重） |
| `/pika/<l\|r>/cartesian_pose` | `geometry_msgs/PoseStamped` | Pika 位姿 ingress（base frame） |
| `/pika/<l\|r>/cartesian_velocity` | `geometry_msgs/TwistStamped` | Pika 速度 ingress（`work/pikabase` frame） |
| `/pika/<l\|r>/gripper_percentage` | `std_msgs/Float32` | `0` 闭合 … `1` 张开 |

输入模式 ID（顺序以 [`control.xml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/behavior-trees/control.xml) 为准）：`web`（粘性、最高优先级、不可由浏览器选择）、`keyboard`、`policy`、`pikaposition`、`pikavelocity`、`pikamixed`、`none`。

## 夹爪 `gripper_manager`

拥有者：`gripper_ros2`，独占串口。契约：[Changingtek 夹爪控制](../development/gripper-control)。`<name>` 为 `gripper_right`、`gripper_left`、`gripper_mid`。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `/<name>/open` `close` `reset` `grasp_check` `calibrate` | `std_srvs/Trigger` | 同步动作 |
| `/<name>/enable` | `std_srvs/SetBool` | 使能 / 失能 |
| `/<name>/percentage` | `gripper_ros2_msgs/GripperPercentage` | 一次性同步目标（`0..1`） |
| `/<name>/percentage/command` | `std_msgs/Float32`（订阅） | 非阻塞连续目标；流式触发被限制为 4 Hz |
| `/<name>/position` `speed` `current` `torque_reached` `alarm` `connected` | `Float64` / `Int32` / `Int32` / `Bool` / `Int32` / `Bool` | 反馈；只有 `connected=true` 才表示 Modbus 反馈在成功 |

## Web 控制 `realman_web_control`

HTTP / WebSocket `:8765`，浏览器不直接访问 ROS。它调用上面的 Action / Service、订阅 `joint_states`、`coordinates/state`、夹爪状态、`camera_health` 和 `input_mode_state`，并发布键盘 ingress。契约：[WebSocket 浏览器控制与 URDF 影子](../development/realman-web-control)。

## 相机与标定

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `/camera_left` `camera_middle` `camera_right` `/color/image_raw`、`/color/camera_info` | `sensor_msgs/Image`、`CameraInfo` | 三路 Orbbec 腕部相机 |
| `/camera_global/d435/color/image_raw` | `sensor_msgs/Image` | 全局 RealSense D435 |
| `/camera_calibration/capture_sample` | `realman_msgs/CaptureCalibrationSample` | 原子采样：图像 + TF + 关节 |
| `/camera_calibration/solve` | `realman_msgs/SolveCalibration` | 求解手眼与相对位姿 |
| `/camera_calibration/camera_health` | `std_msgs/String`（JSON） | 每秒发布，供 Web 标定页面使用 |
| `/camera_calibration/diagnostics` | `diagnostic_msgs/DiagnosticArray` | 标定节点诊断 |

契约：[三臂 ChArUco 手眼标定](../development/camera-calibration)、[相机指南](../guide/cameras)。

## VLA 策略桥 `policy_bridge`

纯协议转换：OpenPI WebSocket ↔ ROS 2。契约：[VLA 策略桥接节点](../development/policy-bridge)。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `/pi05_policy/<l\|r>/cartesian_velocity` | `geometry_msgs/TwistStamped` | 50 Hz，仅在 active 且模式门控通过时发布 |
| `/pi05_policy/<l\|r>/gripper_percentage` | `std_msgs/Float32` | `0..1` |
| `/policy/activate` `deactivate` | `std_srvs/SetBool` | 生命周期；`emergency_stop` 与 `force_infer` 为 `Trigger` |
| `/policy/stats` | `diagnostic_msgs/DiagnosticArray` | 计数与实时指标；暂停时 `ERROR` |

## TF 与描述

`world → <arm>/world → <arm>/base_link → <arm>/link_1 … <arm>/link_6`，另有每臂 `<arm>/robot_description`（transient-local）。工作/工具坐标见 `config/ros/realman_coordinates.yaml`（`l/work/cell`、`l/work/pikabase` 等）。详见[完整 TF 树](../architecture/tf-tree)。

## 查询当前运行图

```bash
ros2 node list
ros2 action list -t | grep -E '/(l|m|r)/'
ros2 service list -t | grep -E '/(l|m|r)/'
ros2 topic info /l/joint_states -v      # 每个 joint_states 必须只有一个发布者
```

排查"同一 Action 出现多个 server"见[行为树机械臂移动 Demo](../development/behavior-tree-motion#重复执行与-unknown-排查)。
