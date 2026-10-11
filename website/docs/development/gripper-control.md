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

权威配置是 [`config/ros/gripper.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/gripper.yaml)，容器映射在 [`config/docker/compose.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/docker/compose.yaml)。不要在源码包或生产主机维护第二份夹爪 YAML。

| ROS 名称 | 宿主机和容器内稳定路径 | `slave_id` | 打开/闭合位置 |
| --- | --- | --- | --- |
| `gripper_right` | `/dev/realman/gripper_right` | `1` | `50` / `8500` |
| `gripper_left` | `/dev/realman/gripper_left` | `1` | `20` / `900` |
| `gripper_mid` | `/dev/realman/gripper_mid` | `1` | `0` / `9000` |

上表的打开/闭合位置是 `gripper.yaml` 中的默认值；实际生效的开位和闭位可以在网页"行程设置"面板里于运行时覆盖（见[在网页上设置开位和闭位](#在网页上设置开位和闭位)），`gripper_manager` 把生效值发布在 `/<name>/limits` 上。

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
| `/<name>/set_limits` | `gripper_ros2_msgs/srv/SetGripperLimits` | 校验、保存并立即应用开位和闭位 |
| `/<name>/move_raw` | `gripper_ros2_msgs/srv/MoveGripperRaw` | 把夹爪点动到 `min..max` 内的原始位置，越界直接拒绝 |
| `/<name>/limits` | `gripper_ros2_msgs/msg/GripperLimits` | 当前生效的开位、闭位和 `min/max`；可靠、`transient_local`、深度 1 |
| `/<name>/position` | `std_msgs/msg/Float64` | 反馈位置 |
| `/<name>/speed`、`current`、`alarm` | `std_msgs/msg/Int32` | 反馈速度、电流和报警码 |
| `/<name>/torque_reached`、`connected` | `std_msgs/msg/Bool` | 力矩到达和通信健康状态 |

服务在设备不可用时返回 `success=false`，manager 继续运行并尝试重连。除显式 `enable=false` 外，运动服务会在需要时先使能设备。

`/<name>/percentage/command` 是给连续控制器使用的非阻塞 topic。manager 只校验范围、确保设备已使能，
将百分比转换为配置中的设备位置并把最新目标交给总线线程，不等待夹爪到位反馈；同一总线上的新目标会覆盖尚未处理的旧目标。
它不改变同步 `/<name>/percentage` service 的等待和结果语义。

总线线程对连续目标优先：收到新目标会立即唤醒总线线程，且目标持续到达（间隔小于 `command_quiet_s`=0.2 s）时，
反馈轮询降为每 `streaming_poll_interval`=0.5 s 一次（两者均可在 `gripper.yaml` 的 bus 下配置），避免 Modbus 半双工上的反馈读取（每次 3 个事务）挤占目标写入，
造成夹爪运动顿挫。

连续目标还受 `min_command_interval_s`（默认 0.25 s）和 `command_deadband`（默认 0.01，占开合行程的比例）限制：
每次触发都会让夹爪重新规划运动，实测（右夹爪，24 mm 行程）单次服务阶跃 0.81 s 到位；连续 topic 以 20 Hz 触发几乎不动（+9 单位），8 Hz 约 3.4 s，4 Hz 约 1.3 s，因此同一夹爪的触发间隔不小于该值，
间隔内到达的新目标只保留最新一个，到期后发送，保证最终位置一定下发；与上次目标差异小于死区的目标被丢弃，
但恰好等于全开或全闭位置的目标不会被丢弃。目标停止后恢复按 `poll_hz` 轮询，因此 `position` 等反馈话题在连续控制期间更新较慢。

行为树的 Pika router 订阅 `/pika/l/gripper_percentage`、`/pika/r/gripper_percentage`，在
`pikaposition`、`pikavelocity` 或 `pikamixed` 为 `ACTIVE` 时分别转发到 `gripper_left`、`gripper_right` 的 command topic。
Pika 不控制 `gripper_mid`；切出 Pika 模式后不会自动发送开、合或停止命令。

夹爪端限频为 4 Hz（`min_command_interval_s: 0.25`）。生产端 PikaRemote 的 `pika_realman_mapper`
同样按 `gripper_publish_rate_hz`（默认 4.0）发布 `/pika/{l,r}/gripper_percentage`，其余位姿和速度话题仍按
`command_rate_hz` 发布；两端保持一致，避免夹爪端丢弃中间目标。router 不再需要额外限速。

## 在网页上设置开位和闭位

夹爪面板的"行程设置"折叠区可以查看并修改所选夹爪的 `open_position` 和 `close_position`：

- 直接输入数值，或点"开位=当前位置"／"闭位=当前位置"把实时读数填入输入框（仅在夹爪在线且速度为 0 时可用，只填入，不保存）。
- 用"原始位置"滑块点动夹爪到 `min_position..max_position` 内的任意位置；松手时才发送一次 `move_raw`。
- 点"应用行程"，确认弹窗会显示"旧值 → 新值"；确认后发送 `set_limits`。

`gripper_manager` 按以下规则校验，不满足时返回 `success=false` 和原因，状态不变：

1. 两个值都是整数，且都在该夹爪的 `[min_position, max_position]` 内；
2. `open_position < close_position`；
3. `close_position − open_position` 不小于 `max_position − min_position` 的 5%；
4. 该夹爪有待发目标，或最近 2 秒内通过 `request_move` 收到过连续控制（Pika、键盘）的目标（即使目标因重复或死区未被下发）时拒绝，返回"忙"。

通过后依次：原子写入覆盖文件、更新内存中的端点（同时清掉该夹爪待发目标）、发布 `/<name>/limits`。Web 节点订阅该话题并向所有浏览器广播 `gripper_list`，所以网页的开合百分比和 3D 夹爪不需要重启就会跟上。

覆盖文件是 `gripper.yaml` 同目录下的 `gripper_overrides.yaml`（可用节点参数 `overrides_file` 指定其他路径），只包含开位和闭位：

```yaml
grippers:
  gripper_right:
    open_position: 50
    close_position: 8500
```

它是这台机器的运行时状态，被 `config/ros/.gitignore` 忽略，不进 git；容器以 root 写入，主机上手工修改需要 `sudo`。`gripper_manager` 启动时在 `gripper.yaml` 之上叠加该文件。无法读取或解析的文件整体被忽略；夹爪名不存在，或数值不满足上述规则 1–3（忙检查只在运行时 `set_limits` 时适用）的条目单独被忽略。两种情况都会打 ERROR 日志，节点照常用 `gripper.yaml` 启动。要恢复默认，删除该文件并重启 `gripper_manager`。`min_position` / `max_position` 只能在 `gripper.yaml` 中修改，网页无法越过。

## 键盘双夹爪全开／全闭

启动 `control.xml` 后，8765 网页会根据动态目录显示键盘卡片。选择 `keyboard` 并获得独占 WebSocket lease 后，
左侧 `1/2` 分别全开／全闭，右侧 `9/0` 分别全开／全闭；两侧可独立或同时操作，也可与机械臂速度键并用。
按键配置是 `config/ros/keyboard_control.yaml` 的 `grippers.l|r.open|close`（物理 `Digit*` 码）；
位置端点来自 `gripper.yaml` 加上运行时覆盖（见[在网页上设置开位和闭位](#在网页上设置开位和闭位)），不在键盘配置里复制行程值，不新增中间夹爪键盘入口。

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

## AG2F90-C 夹爪模型

AG2F90-C（厂商包名 `ctag2f90c`）是 Changingtek 的两指平行夹爪。厂商 ROS 可视化包已收进描述包，和机械臂模型放在一起：

| 内容 | 位置 |
| --- | --- |
| URDF | `src/rm65_description/urdf/ctag2f90c.urdf` |
| 9 个 STL 网格 | `src/rm65_description/meshes/ctag2f90c/` |
| 厂商许可（BSD，ROS-Industrial） | `src/rm65_description/meshes/ctag2f90c/LICENSE` |
| 安装位置（挂在哪一节、位姿）与开合端点 | [`config/ros/end_effectors.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/end_effectors.yaml) |

拖动"夹爪"滑块：下方读数把开合度换算成驱动关节角和三个夹爪各自的设备位置（端点取自 `gripper.yaml`），所以不同行程单位的夹爪在这里一目了然。

<UrdfFigure model="arm-gripper" controls animate caption="AG2F90-C 挂在 link_6 上：开合度 → 驱动关节 Left_1_Joint → 各夹爪的设备位置" />

**模型结构**：`base_link` 是安装面，指尖朝 `+z`，指垫在 `base_link` 前方约 `0.18–0.20 m` 处。**只有 `Left_1_Joint`（`0..1 rad`）是驱动关节**，其余可动关节（`Left_Support`、`Left_2`、`Right_1`、`Right_2`、`Right_Support`）都用 `mimic` 跟随它；两个指垫是固定关节。对 URDF 做正运动学，`0 rad` 时指垫间距约 `2.5 mm`（闭合），`1 rad` 时约 `99 mm`（全开，指垫坐标系中心间距）。

**对厂商文件的两处本地修改**（URDF 头部注释里也有说明）：

1. 网格 URI 改为 `package://rm65_description/meshes/ctag2f90c/…`；
2. 厂商导出的 mimic 关节限位是 `0..0`，会让按限位截断 mimic 值的加载器（网页 `urdf-loader`、MoveIt）把手指冻住，已改为 mimic 倍率实际产生的范围（`Left_2_Joint` 为 `-1..0`，其余为 `0..1`）。`robot_state_publisher` 不受影响。

**与真实夹爪的对应**：厂商示例脚本把驱动关节线性映射为设备位置 `p = (1 − q) × 9000`（`q` 为 `Left_1_Joint` 弧度，单位 `0.01 mm`），即全开 `q=1` ↔ 位置 `0`，闭合 `q=0` ↔ 位置 `9000`。其寄存器（使能 `0x0100`、位置 `0x0102/0x0103`、速度 `0x0104`、力 `0x0105`、加减速 `0x0106/0x0107`、触发 `0x0108`）与本项目 `rtu_psdk.py` 一致，波特率 `115200`、从站 `1`。本项目的 `percentage` 约定（`0` 闭合、`1` 张开）与模型的 `q`（`0` 闭合、`1` 全开）方向相同。三台机械臂末端的夹爪均为 AG2F90-C，因此网页场景给 `l/m/r` 各挂一个。注意 `gripper.yaml` 中三个夹爪的行程并不一致：`gripper_mid` 是 `0..9000`（与上面的 `9000` 映射吻合），`gripper_right` 是 `50..8500`，`gripper_left` 是 `20..900`。后两个数值来自 2026-09-28 对机械限位的实测标定（右：全开 ≈ 8、全闭 ≈ 8668，堵转到力矩；左：全开 ≈ 1、全闭 ≈ 919），两端各留约 2% 余量避免顶到硬限位。此前开位误设为右 `4000`、左 `400`，会让 `percentage=1`（以及键盘和 Pika 的全开）只张开约 55%，闭位 `12000`／`949` 又超出机械极限，使百分比下端出现一段落在全闭的死区；2026-10-09 已改正。左夹爪量级只有右夹爪的约十分之一，单位可能不同（待确认）。若三者确为同一型号，这些差异要么是单位不同，要么是配置有误，改 `gripper.yaml` 前请现场核对机械限位，本页和网页场景不依赖这些数值。

**当前集成范围**：模型用于两处——文档站首页的三维场景（每臂 `link_6` 末端各挂一个，带开合滑块，见[三臂配置驱动可视化](./three-arm-visualization#末端夹爪与关节滑块)），以及 `:8765` Web 控制页的 URDF 视图（随真实夹爪的位置反馈实时开合，见[WebSocket 浏览器控制](./realman-web-control#夹爪模型与实时开合反馈)）。驱动侧的 `robot_state_publisher` / RViz 的 TF 树**还没有**包含夹爪，真实夹爪仍通过 `gripper_manager` 驱动；要在 RViz 里显示并跟随真实开合，需要另外把 `/<name>/position` 转成夹爪关节状态，这是后续工作。安装位姿 `xyz` / `rpy` 的默认值是"夹爪 `base_link` 原点沿 `link_6` 的 `+z` 方向偏移 `0.014 m`（夹爪底座网格在自身原点后方延伸 `14 mm`，这样底面刚好贴在法兰面上而不与腕部重叠）、无转角"，如果现场有转接板或绕轴向转了角度，请按实物修改 `end_effectors.yaml`。

## WebSocket 生命周期

浏览器连接后先收到 `gripper_list` 和每个夹爪的缓存 `gripper_state`，此后每个 ROS 状态更新都会广播新的 `gripper_state`。控制请求示例：

```json
{"type":"gripper_command","request_id":"req-1","name":"gripper_left","command":"percentage","percentage":0.5}
```

`command` 支持 `open`、`close`、`reset`、`enable`、`disable`、`grasp_check`、`percentage`、`set_limits`（字段 `open_position`、`close_position`，整数）和 `move_raw`（字段 `position`，整数）；Web 协议目前不暴露 `calibrate`。服务器处于 `read_only` 时，`set_limits` 和 `move_raw` 在服务端被拒绝（错误码 `read_only`）。输入通过 `protocol.py` 校验，未知名称、越界百分比或 service 不可用会返回协议错误。

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
