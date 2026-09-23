# Changingtek 夹爪控制

`gripper_ros2` 的 `gripper_manager` 统一管理 Changingtek Modbus RTU/RS-485 夹爪。每条物理总线只创建一个 SDK 实例；同一总线的地址切换和所有事务由总线锁串行化，互相独立的串口可并行轮询，断线后按配置自动重连。

## 架构与所有权

```text
宿主机稳定设备别名
  /dev/realman/gripper_right|left|mid
    -> Compose devices 映射
    -> realman_bringup_remote / gripper_manager
       -> Changingtek RTU driver
       -> /gripper_*/{service,topic}
          -> realman_web_control ROS client/subscription
             -> 浏览器 WebSocket gripper_* 事件
```

串口只归 `realman_bringup_remote` 中的 `gripper_manager` 所有。独立的 `realman_web_control` 容器不映射、不打开串口；它通过同一 ROS domain 调用 service 和订阅 topic。因此 Web 页面可重启，而不抢占夹爪的 RS-485 端口。

实现入口：

- 协议与寄存器：`src/gripper/gripper_ros2/gripper_ros2/changingtek/rtu_psdk.py`
- 并行总线、互斥与重连：`src/gripper/gripper_ros2/gripper_ros2/gripper_driver.py`
- ROS facade：`src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py`
- Web 消息校验与桥接：`src/driver/realman_web_control/realman_web_control/{protocol.py,web_control_node.py}`

## 配置

权威配置是 [`config/ros/gripper.yaml`](../../../../config/ros/gripper.yaml)，容器映射在 [`config/docker/compose.yaml`](../../../../config/docker/compose.yaml)。不要在源码包或生产主机维护第二份夹爪 YAML。

| ROS 名称 | 宿主机和容器内稳定路径 | `slave_id` | 打开/闭合位置 |
| --- | --- | --- | --- |
| `gripper_right` | `/dev/realman/gripper_right` | `1` | `4000` / `12000` |
| `gripper_left` | `/dev/realman/gripper_left` | `1` | `400` / `949` |
| `gripper_mid` | `/dev/realman/gripper_mid` | `1` | `0` / `9000` |

`/dev/ttyUSB0`、`/dev/ttyUSB1`、`/dev/ttyUSB2` 会因重连或启动顺序变化，只能作为稳定别名当前指向的实现细节。开发机可用 `REALMAN_GRIPPER_RIGHT_DEVICE`、`REALMAN_GRIPPER_LEFT_DEVICE`、`REALMAN_GRIPPER_MID_DEVICE` 覆盖 Compose 的宿主路径；容器内路径仍保持 `/dev/realman/gripper_*`。

| 字段 | 单位/范围 | 作用 |
| --- | --- | --- |
| `baudrate` | bit/s；当前 `115200` | RTU 串口波特率 |
| `timeout` | 秒；当前 `0.3` | 单次串口/Modbus 等待上限 |
| `poll_hz` | Hz；当前 `20.0` | 后台反馈读取频率 |
| `auto_reconnect` | 布尔值 | 反馈事务失败后是否周期重连 |
| `reconnect_interval` | 秒；当前 `5.0` | 重连间隔 |
| `slave_id` | `1..247`；同一总线唯一 | Modbus 从站地址 |
| `min_position` / `max_position` | 设备位置整数 | 软件允许的目标范围 |
| `open_position` / `close_position` | 设备位置整数，常见分辨率为 `0.01 mm` | `open`、`close` 及百分比插值端点 |
| `speed_pct` / `force_pct` | `0..100` | 速度与力矩百分比 |
| `accel` / `decel` | 厂商设备单位 | 加速与减速参数 |

Web `percentage` 的范围是 `0.0..1.0`：`0` 映射到 `close_position`，`1` 映射到 `open_position`。修改行程、速度、力矩或加减速前必须确认对应物理夹爪的安全范围。

## ROS 接口

`realman_bringup/system.launch.py` 在 `start_gripper:=true` 时启动 `/gripper_manager`。对每个配置名称 `<name>`，它创建：

| 接口 | ROS 类型 | 语义 |
| --- | --- | --- |
| `/<name>/open`、`close`、`reset` | `std_srvs/srv/Trigger` | 打开、闭合、复位 |
| `/<name>/grasp_check` | `std_srvs/srv/Trigger` | 读取当前力矩到达状态 |
| `/<name>/calibrate` | `std_srvs/srv/Trigger` | 当前固定返回失败；默认禁用自动标定 |
| `/<name>/enable` | `std_srvs/srv/SetBool` | `true` 使能，`false` 禁用 |
| `/<name>/percentage` | `gripper_ros2_msgs/srv/GripperPercentage` | 按 `0.0..1.0` 移动 |
| `/<name>/percentage/command` | `std_msgs/msg/Float32` | 非阻塞持续目标；`0.0` 闭合，`1.0` 张开 |
| `/<name>/position` | `std_msgs/msg/Float64` | 反馈位置 |
| `/<name>/speed`、`current`、`alarm` | `std_msgs/msg/Int32` | 反馈速度、电流和报警码 |
| `/<name>/torque_reached`、`connected` | `std_msgs/msg/Bool` | 力矩到达和通信健康状态 |

服务在设备不可用时返回 `success=false`，manager 继续运行并尝试重连。除显式 `enable=false` 外，运动服务会在需要时先使能设备。

`/<name>/percentage/command` 是给连续控制器使用的非阻塞 topic。manager 只校验范围、确保设备已使能，
将百分比转换为配置中的设备位置并把最新目标交给总线线程，不等待夹爪到位反馈；同一总线上的新目标会覆盖尚未处理的旧目标。
它不改变同步 `/<name>/percentage` service 的等待和结果语义。

行为树的 Pika router 订阅 `/pika/l/gripper_percentage`、`/pika/r/gripper_percentage`，在
`pikaposition` 或 `pikavelocity` 为 `ACTIVE` 时分别转发到 `gripper_left`、`gripper_right` 的 command topic。
Pika 不控制 `gripper_mid`；切出 Pika 模式后不会自动发送开、合或停止命令。

## 键盘双夹爪全开／全闭

启动 `control.xml` 后，8765 网页会根据动态目录显示键盘卡片。选择 `keyboard` 并获得独占 WebSocket lease 后，
左侧 `1/2` 分别全开／全闭，右侧 `9/0` 分别全开／全闭；两侧可独立或同时操作，也可与机械臂速度键并用。
按键配置是 `config/ros/keyboard_control.yaml` 的 `grippers.l|r.open|close`（物理 `Digit*` 码）；
位置端点沿用本页的 `gripper.yaml`，不复制行程值，不新增中间夹爪键盘入口。

```text
:8765 keyboard_state（每侧完整按键集合、递增 sequence）
  -> Web KeyboardControlBridge（lease + 单次按下边沿）
  -> /keyboard/l|r/gripper_command（std_msgs/msg/String JSON）
  -> keyboard_control_router（ACTIVE/keyboard + epoch/request + 时效 + 健康 + dry_run）
  -> /gripper_left|right/percentage/command（std_msgs/msg/Float32）
  -> gripper_manager（1.0 = 全开；0.0 = 全闭）
```

ingress JSON 字段为 `command`（`open` 或 `close`）、`epoch`、`request_id`（当前 executor 状态中的整数）和
`stamp_ns`（Web ROS 时钟纳秒整数）。该 topic 是内部离散目标入口，不提供到位 Action/result；不得绕过 Web lease 使用它。
QoS 为可靠、volatile、depth=1，消息寿命与键盘 `input_timeout_ms` 一致（默认 150 ms）。router 拒绝未来时间、
超时或重复／倒序时间戳、错误 epoch/request 和非活动模式的事件；Web 与 router 应使用同步的 ROS 时钟。
旧事件不排队等待下次切入，也不会在从 dry-run 切换后重放。

浏览器、Web 和 router 都要求对应夹爪 `connected=true` 且 `alarm=0`。夹爪健康与机械臂 WORK 独立，
WORK 不可用不影响健康夹爪；一侧离线／报警也不影响另一侧。服务端识别新按下边沿，长按和 50 ms 心跳不会
重发目标，同侧同时按开／闭键不发送，全部松开才能重新触发。被健康检查拒绝的边沿不会在恢复时自动重放。

目标提交后正常执行；松键、窗口失焦、断网或离开 keyboard **不会取消已经提交的夹爪动作**，只阻止后续输入。
不能在松键时发送 `0.0`，因为它代表全闭而非停止。键盘不调用会等待到位的 `open/close` Trigger service，
而是复用非阻塞 percentage topic，避免左右夹爪在 Web/ROS 回调中等待彼此。此路径没有物理完成回执，需观察夹爪反馈。
`REALMAN_BT_DRY_RUN=true`（默认）禁止 router 发布夹爪 command；本页下方普通 Web 夹爪按钮的 service 路径保持不变。

无硬件回归覆盖配置／协议、单次边沿、控制权、健康门控、epoch/时效、dry-run 和桌面／移动端键盘交互：
在 Humble 环境运行 Web keyboard/input-mode、BT keyboard router 和 gripper_ros2 的 pytest；网页执行
`cd website && npm run test:web-control`。真实夹爪验收须另行确认工作区安全和运动授权。

## WebSocket 生命周期

浏览器连接后先收到 `gripper_list` 和每个夹爪的缓存 `gripper_state`，此后每个 ROS 状态更新都会广播新的 `gripper_state`。控制请求示例：

```json
{"type":"gripper_command","request_id":"req-1","name":"gripper_left","command":"percentage","percentage":0.5}
```

`command` 支持 `open`、`close`、`reset`、`enable`、`disable`、`grasp_check` 和 `percentage`；Web 协议目前不暴露 `calibrate`。输入通过 `protocol.py` 校验，未知名称、越界百分比或 service 不可用会返回协议错误。

接受请求后，Web control 先向发起客户端发送 `gripper_result`，其中 `state="requested"`；ROS future 完成后再发送 `state="completed"` 和 service 的 `success/message`，异常则发送 `state="failed"`。`request_id` 用于关联同一请求。当前 Web server 的 `/healthz` 报告 `read_only=false`，即 direct control enabled；如果部署方增加只读策略，必须在服务器入口拒绝 WebSocket 写命令，不能只依赖前端隐藏按钮。

## Docker 启动

生产 `./rm65 up` 启动 `realman_bringup_remote` 和独立 `realman_web_control`。前者通过 `REALMAN_START_GRIPPER`（默认 `true`）创建 manager，并用 `REALMAN_GRIPPER_CONFIG_FILE` 覆盖容器内配置路径；后者读取默认 `/opt/rm65_ws/config/ros/gripper.yaml` 并加入相同 ROS 图。

开发环境可在已构建并 source 的 ROS 2 工作区中运行：

```bash
ros2 launch realman_bringup system.launch.py \
  start_gripper:=true \
  gripper_config_file:=/opt/rm65_ws/config/ros/gripper.yaml \
  start_web_control:=true
```

## 健康判断与排障

`connect()` 或 `connect_all()==True` 只说明串口文件已经打开，不证明 Modbus 从站有响应。`/<name>/connected=true` 表示后台反馈寄存器读取当前成功，才是设备在线依据。

按以下顺序验证，避免在通信未知时直接运动：

1. 在宿主机解析三个 `/dev/realman/gripper_*` 别名，确认它们指向预期 USB 转串口设备。
2. 确认 `realman_bringup_remote` 内存在同名字符设备，并且没有其他进程占用串口。
3. 确认 `/gripper_manager`、service/topic 和实际加载的 YAML 路径。
4. 先读取 `connected`、`position`、`alarm` 等只读反馈；只有三路通信成功后才调用 `enable`。
5. 使用已验证的安全目标做有界运动，最后从 Web 页面核对请求/结果生命周期。

```bash
docker compose ps realman_bringup_remote realman_web_control
docker compose exec realman_bringup_remote \
  ls -l /dev/realman/gripper_right /dev/realman/gripper_left /dev/realman/gripper_mid
docker compose exec realman_bringup_remote ros2 node info /gripper_manager
docker compose exec realman_bringup_remote ros2 topic echo --once /gripper_right/connected
docker compose exec realman_bringup_remote ros2 topic echo --once /gripper_left/connected
docker compose exec realman_bringup_remote ros2 topic echo --once /gripper_mid/connected
docker compose exec realman_bringup_remote ros2 service list | grep gripper_
```

若当前驱动和参考 SDK 用相同配置执行同一组安全反馈读取都报告 `No communication with the instrument (no answer)`，应检查 `slave_id`、供电、A/B 线序、转接器和设备固件，而不是以“串口已打开”判断 ROS 驱动有问题。运行参考探针前先停止 manager 或其他串口用户，避免两个进程同时访问同一物理总线。

无硬件回归测试使用仓库 Fake SDK；真实硬件验证必须依次经过设备存在、ROS 图、只读反馈、使能、有界运动和 WebSocket 结果六个阶段。
