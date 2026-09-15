# Changingtek 夹爪控制

夹爪由 `gripper_ros2` manager 节点负责。底层采用 Modbus RTU/RS-485；每条串口总线只创建一个 SDK 实例，同一总线上的多个 slave 通过总线锁串行访问，断线后按配置周期自动重连。

## 配置

权威配置是 [`config/ros/gripper.yaml`](../../../../config/ros/gripper.yaml)。位置使用设备单位（通常为 0.01 mm），`percentage` 使用 `0.0..1.0`，其中 `0` 为闭合、`1` 为打开。每个设备需要唯一 `name`、`port` 和 `slave_id`。

生产环境三路串口使用宿主机稳定别名 `/dev/realman/gripper_right`、`/dev/realman/gripper_left` 和 `/dev/realman/gripper_mid`，并由 Compose 映射到容器内同名路径。不要依赖会在重连后变化的 `/dev/ttyUSB0`、`/dev/ttyUSB1`、`/dev/ttyUSB2` 编号；开发机可通过 `REALMAN_GRIPPER_*_DEVICE` 覆盖宿主路径。

## ROS service/topic

启动 manager 后，每个设备提供：

- `/<name>/open`、`/<name>/close`、`/<name>/reset`、`/<name>/grasp_check`、`/<name>/calibrate`（`std_srvs/Trigger`）
- `/<name>/enable`（`std_srvs/SetBool`）
- `/<name>/percentage`（`gripper_ros2_msgs/GripperPercentage`）

状态话题为 `position`、`speed`、`current`、`torque_reached`、`alarm`、`connected`。设备未连接时服务返回失败，但 manager 保持运行并尝试重连。

## Web control

`realman_web_control` 读取同一份夹爪 YAML，订阅上述状态话题并创建 service client。浏览器发送：

```json
{"type":"gripper_command","request_id":"req-1","name":"gripper_left","command":"percentage","percentage":0.5}
```

`command` 支持 `open`、`close`、`reset`、`enable`、`disable`、`grasp_check` 和 `percentage`。服务结果通过 `gripper_result` 返回，实时反馈通过 `gripper_state` 推送。Web control 的只读模式仍禁止写入。

## 启动与验证

生产 Docker 配置通过 `REALMAN_START_GRIPPER`（默认 `true`）启动 manager，并使用 `REALMAN_GRIPPER_CONFIG_FILE` 覆盖配置路径。开发环境可运行：

```bash
ros2 launch realman_bringup system.launch.py start_gripper:=true gripper_config_file:=/opt/rm65_ws/config/ros/gripper.yaml start_web_control:=true
```

无硬件测试使用仓库 Fake SDK 测试；硬件验证前确认串口、slave 地址、行程和力矩参数。

生产验证：

```bash
docker exec realman_pi-realman_bringup_remote-1 \
  ls -l /dev/realman/gripper_right /dev/realman/gripper_left /dev/realman/gripper_mid
ros2 topic echo --once /gripper_right/connected
ros2 topic echo --once /gripper_left/connected
ros2 topic echo --once /gripper_mid/connected
```
