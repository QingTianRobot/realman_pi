---
title: WebSocket 浏览器控制与 URDF 影子
description: realman_web_control 的 WebSocket 协议、Action 反馈、软件停止、URDF 预览和测试方法。
---

# WebSocket 浏览器控制与 URDF 影子

`realman_web_control` 是一个 ROS 2 功能包：它把浏览器同源 WebSocket 消息转换成现有的
`ExecuteMotion`、`ExecuteTrajectory`、`CartesianVelocity` Action、速度命令、FK/IK 查询、
`/stop` 和 `/recover_motion` 服务。页面同一端口会同时
渲染三台机械臂的实时 URDF 和坐标状态，但控制指令始终只作用于当前选中的 arm。浏览器永远
不直接加载 RealMan SDK，也不绕过 `realman_robot_driver` 的 ownership、坐标 gate、
watchdog 或 lockout。网页保存的关节记录写入 `config/web-control/joint-records/<arm>/`，
按 `l`、`m`、`r` 分目录存放。

三臂 URDF 画布的显示原点固定为中间臂 `m` 的基座：网页仅在 Three.js 渲染时减去中臂的
平移，绝不修改 `config/ros/three_robots.yaml` 的世界/TF 布局或任何 Action 的运动坐标。
这让标定后左右臂位置改变时，中臂仍保持在画面中心。

页面启动时直接创建 Three.js WebGL 渲染器，并使用完整 URDF 实体/影子模型。WebGL 是三维机械臂
预览的必要能力；浏览器禁用 GPU、软件光栅化不可用或上下文创建失败时，页面明确显示
`WebGL 渲染失败` 和底层错误，不伪造二维机械臂或布局加载成功。恢复浏览器 WebGL 后刷新页面，
即可重新加载完整 URDF 网格显示。

```text
笔记本浏览器
    │ http://工控机:8765/ + /ws
    ▼
realman_web_control (aiohttp 线程 + ROS 2 executor)
    │ ActionClient / Trigger client / TwistStamped publisher
    ▼
/l、/m、/r realman_robot_driver
    ▼
RealMan SDK / 三台控制器
```

## 启动

配置在 `config/ros/realman_web_control.yaml`。Web 服务默认监听 `0.0.0.0:8765`，所以
笔记本访问：

```bash
source functions.zsh
rm65_docker_web_control_start
rm65_web_control_url 192.168.30.10
```

`192.168.30.10` 应替换为工控机连接路由器的地址。也可以前台运行并观察日志：

```bash
rm65_docker_web_control
rm65_docker_web_control_logs -f
```

`realman_web_control` 是独立服务，加入与驱动相同的 `ROS_DOMAIN_ID`。它不会启动驱动；
如果要在一个 Compose 命令中同时启动驱动和 Web 控制，可设置：

```bash
export REALMAN_START_WEB_CONTROL=true
docker compose run --rm realman_bringup_remote
```

浏览器连接 `/ws` 后即可发送运动、取消和软件停止消息，不需要额外输入 token。该服务应
只部署在受信任、隔离的机器人局域网；它仍然经过既有 driver 的 ownership、坐标 gate、
watchdog 和 lockout，不会直接调用 SDK。

## 全局输入模式路由

输入路由器是可选的独立进程：`./rm65 up` 启动长期 driver 与本服务，但**不会**启动它。要启用
全局路由，在 driver 容器已运行后执行 `./rm65 bt control`；它加载
[`config/behavior-trees/control.xml`](../../../config/behavior-trees/control.xml)，并在 Ctrl-C
前保持 executor 和 :8080 只读监视器运行。Ctrl-C 不会停止 driver 或本服务，`./rm65 down` 才停止
统一运行时。路由和本服务必须使用同一个 `ROS_DOMAIN_ID`。

本服务每 `config/ros/realman_web_control.yaml` 的 `input_mode.discovery_period_sec: 1.0` 秒探测
`/realman_bt_executor/list_input_modes` 和 `/realman_bt_executor/select_input_mode`，随后可靠、
transient-local 订阅 `/realman_bt_executor/input_mode_state`。同一 YAML 的
`web_override_timeout_sec: 5.0`（秒）是等待 Web override 激活的上限；服务监听配置为
`server.bind_host: 0.0.0.0`、`port: 8765`、`allowed_origins: [same-origin]`、`max_clients: 8` 和
`max_message_bytes: 65536`（bytes）。行为树自身的 `config/ros/behavior_tree.yaml` 使用 10.0 Hz tick、
5000 ms 切换超时及 `safe_fallback_mode: none`。

`list_input_modes`（`realman_msgs/srv/ListInputModes`）响应 `success`、`message` 和并行的
`mode_ids`、`labels`、`selectable` 数组；`select_input_mode`（`realman_msgs/srv/SelectInputMode`）请求
`mode_id`、`requester_id`，响应 `accepted`、`request_id`、`message`。上述 topic 使用
`realman_msgs/msg/InputModeState`，字段为 `requested_mode`、`selected_mode`、`active_mode`、`phase`、
`request_id`、`epoch`、`detail`。

目录完全由 XML 的字面 `InputModeGuard` 项发现，浏览器不会维护模式名单。当前 picker 显示一个
“GLOBAL INPUT / 输入模式”卡片，带一个动态 select：`none`、`keyboard`、`policy`、`pikaposition`、
`pikavelocity` 都可选；`web` 虽会由
状态显示为 active，却保持隐藏且不可选。没有正在运行的路由器或 discovery 不健康时，卡片隐藏；
既有直接 Action 控制继续兼容，仅在两项 router service 都确认为不可用时启用。服务只短暂失联或
catalog probe 超时不是“路由器不存在”，此时会丢弃运动并返回 `input_mode_unavailable`，而不是绕过仲裁。
若 service 在等待 Web override 的已排队运动期间消失，该命令失败并被永久丢弃；即使之后确认 router
不存在，也只有一个后续、独立的新请求才可走 direct control。

浏览器请求为 `{"type":"select_input_mode","request_id":"<non-empty up to 96 chars>","mode_id":"policy"}`；
`mode_id` 必须为 lower-case ASCII identifier。输入模式相关服务端事件恰有三种：

| 事件 | 字段 |
| --- | --- |
| `input_mode_list` | `available`、`modes[]`，每项为 `id`、`label`、`selectable` |
| `input_mode_result` | `request_id`、`executor_request_id`、`accepted`、`message` |
| `input_mode_state` | `requested_mode`、`selected_mode`、`active_mode`、`phase`（`ACTIVE`/`SWITCHING`/`FAILED`）、`request_id`、`epoch`、`detail` |

对非 Web picker 选择，桥总是先取消它持有的 Web Action，再请求 router。切换到不同模式时，router
先运行一 tick 的 `none` 中性分支，下一 tick 才激活目标模式；重选 active 模式直接返回已有 request ID，
没有中性 tick，`epoch` 不变。路由仅拦截 `execute_motion`、`execute_trajectory` 和
`start_cartesian_velocity`：这些浏览器运动先请求 `web`，只在同一请求的 `ACTIVE/web` 状态到达后才会转发。
`software_stop` 绕过路由；夹爪、恢复、标定、运动学、位姿和记录操作均是 mode-neutral（包括
`gripper_command`、`recover_motion`、`capture_calibration_sample`、`solve_calibration`、
`get_current_pose`、`solve_ik`、`list_joint_records`、`save_joint_record`、`delete_joint_record` 与
`apply_joint_record`）。Policy 输入叶目前只是 RUNNING 占位；Pika 和 keyboard 输入叶记录行为树控制权，
实际 robot session 分别由 `pika_control_router` 和 `keyboard_control_router` 管理。
排查卡片缺失或停留在 SWITCHING 时，先检查 router 是否显式运行、三个 ROS 名称是否在同一 domain，
以及 `input_mode_state.detail` 或 `type: "error"` 事件的 `code` 字段
（`input_mode_timeout` / `input_mode_failed`）；这些 code 不是独立事件类型。不要添加硬编码选项。

软件停止仍直接调用对应 arm 的 stop service，同时丢弃该 arm 等待 `ACTIVE/web` 的运动请求；
Action 取消也会丢弃匹配 arm/action 且由该浏览器拥有的排队请求，返回
`type: "error", code: "input_mode_cancelled"`，并保留原运动 `request_id`。
这些操作不改变输入模式。迟到的模式回调不会重新发送已丢弃的运动。
后端通过状态发布者的 ROS endpoint identity 识别路由器重启，即使两次探测之间 service
一直显示 ready，也会清空旧目录、状态和请求关联并重新订阅。`FAILED` 后同一 request ID
的更高 epoch 回退状态可以刷新页面，但不会恢复已失败的原运动请求。

### 双臂键盘末端速度与夹爪

只有动态目录包含可选的 `keyboard` 时，8765 页面才显示“双臂键盘速度与夹爪”卡片；切换状态必须达到
`ACTIVE/keyboard` 后才捕获运动键。每个新的 keyboard `epoch` 首次进入活动态时，页面会短暂高亮该
说明卡片，但不会滚动页面或移走三臂 3D、MoveJ 等工作区域；重复状态消息不会反复触发，刷新页面后收到
当前活动态也会引导一次。只有当前页面发起的模式请求进入匹配的 `ACTIVE` 或 `FAILED` 终态时，页面才会
释放模式选择框焦点，使操作员不必额外点击空白区域即可使用控制键；后台重复状态不会抢走焦点。浏览器使用物理
位置稳定的 `KeyboardEvent.code`，不使用会受输入法、
Shift 或键盘布局影响的 `event.key`，并忽略 `input`、`textarea`、`select` 和 `contenteditable` 中的输入。
自动重复、输入法组合事件，以及带 Ctrl/Alt/Meta/Shift 的快捷键不触发新控制输入。
`ACTIVE/keyboard` 是全局行为树状态；页面还必须收到本页的 `keyboard_lease: {active: true}` 才拥有控制权。
其他浏览器持有 lease 时显示 `REMOTE`，不发送键盘心跳；收到 `keyboard_lease` 错误也不会覆盖 MoveJ
运行反馈，需在当前页面重新选择键盘模式取得 lease。
键盘说明和右侧控制卡片的增减不得改变左侧三臂 3D viewer 的高度。桌面、窄屏和手机布局分别使用
有界的 viewer 面板高度，避免 WebGL canvas 被右栏总高度拉伸后压缩相机水平视场。
桌面端左列由纵向 \`visualization-column\` 组成：上方是 WebGL 三臂展示，下方是
\`velocity-telemetry-panel\`；右列继续承载坐标、一次性运动、速度 Action、夹爪和运行反馈。
窄屏和手机端按 WebGL 展示、速度遥测、控制卡片的顺序单列排列。
左右臂按键完全独立，可同时按住：

| 末端轴 | 左臂正/负 | 右臂正/负 |
| --- | --- | --- |
| X | `W` / `S` | `I` / `K` |
| Y | `A` / `D` | `J` / `L` |
| Z | `R` / `F` | `U` / `O` |
| RX | `Q` / `E` | `Y` / `P` |
| RY | `Z` / `C` | `N` / `M` |
| RZ | `X` / `V` | `B` / `G` |

| 夹爪单次目标 | 左夹爪 | 右夹爪 |
| --- | --- | --- |
| 全开 | `1`（`Digit1`） | `9`（`Digit9`） |
| 全闭 | `2`（`Digit2`） | `0`（`Digit0`） |

数字键使用主键盘物理码，不是小键盘 `Numpad*`。每侧显示独立的 `READY`、`OFFLINE` 或 `ALARM`。
夹爪只要求连接正常且无报警，不依赖 WORK；机械臂 WORK 不可用时，健康夹爪仍可使用。
夹爪按一次提交一次目标，长按／心跳不重复发送；同侧开闭键同时按下不发送，必须全部松开后才重新接收。
**松键、失焦、离开模式和断网只阻止新夹爪目标，不撤销已提交的全开／全闭动作。**
目标沿 keyboard router 转发，`dry_run=true` 不输出夹爪命令；键盘路径没有到位完成回执，按键高亮不代表物理完成。
完整数据流和端点语义见[夹爪控制](./gripper-control#键盘双夹爪全开-全闭)。

浏览器对每臂发送完整按键集合，而不是单独的 keydown/keyup 边沿：

```json
{"type":"keyboard_state","arm":"l","keys":["KeyW","KeyQ","Digit1"],"sequence":42}
```

`arm` 只能是 `l` 或 `r`；`keys` 最多 14 项，只能包含该侧配置的、互不重复的 `KeyA`..`KeyZ` 或 `Digit0`..`Digit9` 物理码；`sequence`
必须在每臂范围内严格递增。成功进入 keyboard 后，一个 WebSocket 获得独占 lease，竞争连接、旧 sequence、
未知键、重复键和 m 输入均被拒绝。同一 owner 重选 keyboard 不重置 sequence 或夹爪按键边沿。
外部模式切换、epoch 改变、目录移除 keyboard 也会释放旧 lease，不能靠缓存控制权继续发送。
每 `50 ms` 心跳都会发送左右臂各自的完整集合，包括空集合；
后端 `150 ms` 未收到该臂新输入就清零并取消该臂 session。

键位、`50 ms` 心跳、`150 ms` Web 输入超时和 `0.4` 速度比例来自
[`config/ros/keyboard_control.yaml`](../../../config/ros/keyboard_control.yaml)。比例乘以
[`config/ros/realman_motion.yaml`](../../../config/ros/realman_motion.yaml) 的逐臂上限；当前 l/r 都派生为
`0.02 m/s` 线速度和 `0.10 rad/s` 角速度。WORK 名称和 frame ID 仍来自
[`config/ros/realman_coordinates.yaml`](../../../config/ros/realman_coordinates.yaml)，键盘配置不会复制
运动上限或坐标定义。`grippers.l|r.open|close` 定义夹爪物理键；全部机械臂和夹爪键码必须全局唯一。
实际全开／全闭位置仍只由 `config/ros/gripper.yaml` 管理。

每臂速度必须独立满足默认 WORK gate；一侧失配只清空该侧速度键，不清除健康夹爪键。卡片状态含义是：
`READY`（活动模式下至少一侧 WORK 可用且没有速度键按下）、`MOVING`（浏览器存在速度键）、`RELEASED`（未处于活动
keyboard）、`GRIPPER ONLY`（WORK 均不可用但有健康夹爪）和 `WORK UNAVAILABLE`（WORK 均不可用且无健康夹爪）。这些标签只描述浏览器输入状态，
不证明机械臂已经产生物理运动。

驱动以 reliable、transient-local、depth 1 QoS 发布 `/<arm>/coordinates/state`，Web control 和
`keyboard_control_router` 使用兼容订阅。驱动还按 `config/ros/realman_driver.yaml` 的
`coordinate_state_publish_rate`（生产默认 `1.0 Hz`）重发最近一次完整校验结果，保留当前/预期坐标、
匹配状态和失败详情。这覆盖首个样本早于 DDS endpoint discovery 的启动时序；Web 或行为树晚于驱动启动
时无需人工再次调用 `coordinates/verify`，即可解除页面的 `WORK UNAVAILABLE` 安全门。

`keyup` 会立即发送该侧更新后的完整集合；松开某一臂的全部速度键只停止该臂。对应臂 WORK 失配时也只
清空该臂速度键并发送，另一臂、健康夹爪键和活动心跳继续。夹爪离线／报警只清空该侧夹爪键。
窗口 `blur`、页面隐藏、目录不再包含 keyboard 或离开
`ACTIVE/keyboard` 时，浏览器清空两臂并停止心跳；WebSocket 已关闭时不能再发送消息，因此服务端通过
disconnect 处理释放 lease、发布两臂零值并请求 `none`。服务端输入超时和 driver watchdog 是浏览器事件
之外的独立保护，不能用前端状态替代。

以下验证不访问输入设备或真实机械臂：

```bash
./rm65 bt-test all
RM65_DRY_RUN=1 ./rm65 bt control
```

第二条仅输出持久 router 的容器执行计划；默认 `REALMAN_BT_DRY_RUN=true` 不会发送 Action goal。

## WebSocket 协议

连接 `/ws` 后首先收到 `hello`，其中包含 `read_only=false`、`client_id` 和完整的 `layout`。

服务端会广播以下状态事件：

| 事件 | 关键字段 | 用途 |
| --- | --- | --- |
| `joint_state` | `arm`, `positions_rad`, `stamp_ns` | 各 arm 的实体 URDF 姿态唯一来源，以及未编辑时的滑轨值 |
| `connection` | `arm`, `connected` | 控制器在线状态 |
| `coordinate_state` | `arm`, `motion_allowed`, `preferred_reference`, `tool`, `work` | 各 arm 的激活坐标、可运动状态和默认参考系 |
| `action_state` | `action`, `request_id`, `state` | submitting/accepted/canceling；`stopped` 表示 Action 结果通道在运动中断后不可用 |
| `action_feedback` | `feedback` | 原 Action feedback 的 JSON 映射 |
| `action_result` | `status`, `result` | 原 Action result 和 rclpy 状态 |
| `software_stop_result` | `success`, `message` | `/arm/stop` 的结果 |
| `motion_recovery_state` | `arm`, `request_id`, `state` | 网页恢复按钮发起的恢复请求状态 |
| `motion_recovery_result` | `success`, `recovered`, `api2_status` | 取消后的事件通道恢复结果 |
| `joint_records` | `arm`, `records` | 该 arm 可填入运动面板的已保存关节记录 |
| `joint_record_saved` | `record` | “记录当前”写入 YAML 后的结果 |
| `joint_record_deleted` | `record` | MOVEJ 页面确认删除当前选择记录后的结果 |
| `joint_record_applied` | `command`, `joint_degrees`, `pose_position_m`, `pose_quaternion_wxyz` | 选择记录填入当前 MOVEJ/MOVEL/MOVEP 表单 |
| `tf_frames` | `arm`, `frames[]` | TF 缓存中与该 arm `base_link` 连通的可选参考坐标 |

### MOVEJ、MOVEL 与 MOVEP

一次性运动面板直接映射现有的 `ExecuteMotion.action`：

| 网页模式 | `command` | SDK 方法 | 目标输入 |
| --- | ---: | --- | --- |
| `MOVEJ` | `0` | `rm_movej()` | 六轴关节角，degree |
| `MOVEL` | `1` | `rm_movel()` | XYZ 位置（m）和 WXYZ 四元数 |
| `MOVEP` | `2`（ROS 常量 `MOVEJ_P`） | `rm_movej_p()` | XYZ 位置（m）和 WXYZ 四元数 |

`MOVEP` 是网页对“按位姿做关节空间运动”的操作名称，不代表 CANFD 的
`rm_movep_canfd()`。MoveS 需要至少三个连续点，MoveC 还需要途经点和终点；当前单目标
Action 没有这两类多点契约，因此网页不会把它们伪装成单次按钮。

MOVEJ 目标关节使用 degree；Web 后端会从 URDF limit 再检查一次。
左侧三块 `L`、`M`、`R` 会同时显示三台机械臂的连接和坐标状态；点击其中一个块即可切换
当前控制对象，右侧滑条随之控制该 arm。页面会优先使用当前 `coordinate_state` 给出的默认参考系发送目标：
右侧关节面板标题会显示当前激活的 arm，便于确认选择是否已经切换。
实时状态只会原位更新三块卡片的文本和选中状态，不会替换按钮节点；三台驱动高频发布
`joint_state` 时，点击切换仍保持可用。Action feedback 只用于显示阶段、进度与结果，不能覆盖实体
URDF；Action 的 validating 阶段没有可用关节读数，序列化为零值会造成模型瞬间跳动。
Web 控制桥和浏览器都会校验 `joint_state` 的六轴有限数值及单调递增的 `stamp_ns`。检测到
驱动已经提供过非零姿态后，来自重复/假发布者的全零样本会被丢弃，实体 URDF 和关节面板保留
最后一个有效姿态；收到更新的真实样本后会自动继续更新。该保护只作用于可视化数据链路，不能
推断或锁定机械臂真实位置。生产 `start_driver:=true` 启动时必须禁用 `joint_state_publisher`，
否则应先检查 `ros2 topic info /<arm>/joint_states --verbose` 并停止重复发布源。

关节面板提供“复制当前角度”按钮。它只复制当前选中 arm 最近一次有效 `joint_state`，将弧度转换为
degree 并固定为三位小数，例如 `[5.730, 11.459, 17.189, 22.918, 28.648, 34.377]`。没有收到有效
六轴状态前按钮保持禁用；剪贴板被浏览器拒绝时，页面会显示权限错误，不会发送 ROS 指令或改变运动目标。
发送 MOVEL 后如果驱动返回 rejected/error，反馈区会立即显示错误并清零进度，不会继续显示“等待
feedback”。如果 8 秒内没有收到任何该请求的 Action feedback，页面会提示“运行状态未知”，但仍
保持发送按钮禁用、保留取消/软件停止路径；这不会自动重发命令。此时应检查 `/{arm}/execute_motion`
Action 服务和驱动日志，确认轨迹是否仍在控制器中运行。
如果控制柜物理急停使 ROS Action 服务端先于客户端清理 goal，结果回调可能收到
`Goal handle is not known to this client`。Web 后端会把这个传输层异常记录到 ROS 日志，但对浏览器发送
`action_state` 的 `state=stopped`、`code=goal_handle_unknown`，并显示“运动已中断，请检查急停状态并恢复机械臂”；
不会把底层英文异常作为用户提示，也会释放该 Web Action 的占用。这个状态不代表急停已经解除，恢复后仍需按现场流程确认控制柜状态。
驱动对非阻塞 MOVEL/MOVEJ_P 会保留“提交调用返回前就到达”的成功事件；因此极短位姿运动不会因回调竞态被误判为超时。MOVEJ 仍要求提交返回后再接受事件，以避免复用旧轨迹回调。
在没有人工改动目标之前，右侧滑条会跟随该 arm 的实时 `joint_state`；一旦人工拖动滑条，该 arm
的目标值就会保持用户输入，直到再次切换或重置。

MOVEL/MOVEP 面板有独立的“参考坐标系”选择器。列表由 Web 节点的 `tf2_ros.Buffer` 从
`/tf` 和 `/tf_static` 发现，只保留能与当前 arm 的 `/{arm}/base_link` 连通的 frame；
因此 `world`、其它机械臂的 link、相机和工装 frame 只要在同一 TF 树中连通，理论上都能
作为参考系。列表为空时保留 BASE/WORK/TOOL 配置项作为启动过渡状态；发送时后端仍会
再次查询 TF，frame 不存在或断链会返回 `coordinate_unavailable`。
XYZ 是该参考系下的绝对目标位置，单位为米；姿态使用 `[w,x,y,z]` 四元数。每个 arm
分别保留自己的位姿输入，位置未填满、四元数为零或速度/超时越界时发送按钮保持禁用。
进入 MOVEL/MOVEP 或切换参考系时，网页会自动调用 `get_current_pose` 填入当前 XYZ/WXYZ；
XYZ 数值有效后会出现以当前值为中心、每轴上下 0.2 m 的滑轨，滑轨与数值输入双向同步。

MOVEL/MOVEP 都提供“填入当前位置”动作。点击后会调用
`/{arm}/get_current_pose`，驱动使用当前关节状态做 FK，并把结果按所选参考系填入
XYZ 和 WXYZ。MOVEL 还提供“计算逆解”：修改目标后点击它会通过 WebSocket 的 `solve_ik` 消息调用
`/{arm}/solve_ik`；请求种子使用该 arm 的当前实体关节角，驱动将参考系目标转换到算法
需要的 base 位姿后调用 `rm_algo_inverse_kinematics()`。成功的六个 degree 结果会先经过
Web 后端的 URDF 关节限位检查，再只更新当前 arm 的关节滑条和橙色 URDF 影子。这个过程
不会发送 `ExecuteMotion`，需要用户另外点击“发送 MOVEL”才会提交真实运动。

位姿滑轨本身只能修改 XYZ，不包含从位姿到六轴关节角的逆解结果。因此，MOVEL 修改后会明确提示
影子须等待“计算逆解”成功才更新；MOVEP 当前不提供逆解或影子预览，修改后会明确提示影子不会跟随
滑轨，但仍可直接发送 `MOVEJ_P` Action。

对于配置的 WORK/TOOL，驱动会在连接时自动将可读的激活坐标失配修复为配置值，并仍要求 `reference_type`/`reference_name` 与已验证的激活坐标
完全一致。对于任意 TF frame，Web 节点先把位姿转换到 `/{arm}/base_link`，再以
`BASE/base` 调用驱动；它不会把任意 TF 名称伪装成 RealMan controller 的 WORK/TOOL。
TF 查询失败、坐标验证失败、控制器状态不可读、目标不可达、SDK API2 非零或结果超限都会
返回失败消息。服务边界的单位固定为：关节 degree、位置 m、四元数 WXYZ；SDK 算法内部的
FK/IK 姿态欧拉角为 rad。MOVEL/MOVEP 的真实发送仍经过驱动的 ownership 和坐标 gate；
任意 TF frame 的目标则在 Web 层先转换为 base 位姿。

### 关节记录

一次性运动面板的“关节记录”区用于把当前真实回读的六轴关节角保存成 YAML。浏览器只发送
记录名称；后端从最近一次 `/{arm}/joint_states` 缓存取值，写入
`config/web-control/joint-records/<arm>/<record-id>.yaml`。每个文件使用
`realman_joint_record.v1` schema，关节单位为 degree；空目录由
`config/web-control/joint-records/README.md` 和 `l/`、`m/`、`r/` 子目录约定。
在 MOVEJ 页面中，选择记录后可点“删除”，浏览器确认后才会删除该 arm 下对应的单个 YAML 文件；
删除不可撤销，且不会影响其它记录或当前真实机械臂姿态。
保存、填入或删除请求在 8 秒内没有收到对应终态事件时，网页会自动解除按钮锁定并提示检查连接后重试；
这不会重复发送命令或影响机械臂运动。

选择记录并点击“填入”不会提交真实运动，只会更新当前表单和橙色影子：

| 当前模式 | 填入行为 |
| --- | --- |
| `MOVEJ` | 直接把记录的六轴 degree 转成滑条目标，并更新影子 |
| `MOVEL` | 调用 `/{arm}/forward_kinematics`，把记录关节正解为当前激活参考系下的 XYZ/WXYZ，再填入位姿输入 |
| `MOVEP` | 同样调用 `/{arm}/forward_kinematics`，填入 `MOVEJ_P` 所需的目标位姿 |

`forward_kinematics` 与 `get_current_pose` 使用同一套参考系规则：配置的参考系必须匹配
驱动已验证的激活坐标，任意 TF 参考系则先转换到/从 `base_link`；坐标 gate 关闭时，只有
配置 WORK/TOOL 的驱动查询会被 gate 拒绝，TF 转换本身不绕过控制器运动 gate。
Web 控制相关 Compose 服务把 `./config` 以可写方式挂到容器内，默认记录目录为
`/opt/rm65_ws/config/web-control/joint-records`，可用 `REALMAN_JOINT_RECORD_DIR` 覆盖。

```json
{
  "type":"execute_motion", "request_id":"move-001", "arm":"l",
  "goal": {
    "command":0, "reference_type":1, "reference_name":"cell",
    "joint_degrees":[0,10,0,-20,0,0],
    "pose_position_m":[0,0,0], "pose_quaternion_wxyz":[1,0,0,0],
    "velocity_percent":30, "blend_radius_percent":0, "timeout_sec":10
  }
}
```

`action_feedback.feedback.current_joint_degrees` 到达时，网页只更新当前 arm 的实体模型；三台
机械臂的 live URDF 会保留在同一画布中，选中 arm 的滑轨编辑目标保持为橙色半透明影子，
不会被回读覆盖。点击“发送 MOVEJ”才提交影子目标；切换到 MOVEL/MOVEP 时隐藏关节影子，
避免将旧关节目标误认为位姿预览。当前坐标面板会显示 tool/work 名称、
控制器回读值，以及工具坐标的位姿、payload 和重心。

### 连续路点轨迹

主界面目前仍以单点编辑为主，但同一个 `/ws` 已提供 `execute_trajectory` 协议。它把
2--256 个路点映射到 `ExecuteTrajectory` Action；Web 后端逐点检查有限值、速度、交融
半径、四元数和 MOVEJ 的 URDF 关节限位，再由驱动把非末点设为 `connect=1`、末点设为
`connect=0`。整条轨迹只占用当前 arm 一次，其他 Web goal 会收到 `action_busy`。

```json
{
  "type": "execute_trajectory",
  "request_id": "trajectory-001",
  "arm": "m",
  "goal": {
    "reference_type": 0,
    "reference_name": "base",
    "timeout_sec": 20,
    "waypoints": [
      {
        "command": 0,
        "joint_degrees": [0, 5, 0, 0, 0, 0],
        "velocity_percent": 10,
        "blend_radius_percent": 10
      },
      {
        "command": 0,
        "joint_degrees": [0, 0, 0, 0, 0, 0],
        "velocity_percent": 10,
        "blend_radius_percent": 0
      }
    ]
  }
}
```

未使用的关节或位姿字段可以省略，协议会填入固定长度默认值。后端会在提交前重新校验
浏览器传入的参考系；配置 WORK/TOOL 仍受驱动 active frame 校验，任意 TF 参考系会在
提交前转换为 `BASE/base`。
取消消息使用 `action: "execute_trajectory"`；取消意味着 immediate stop，不是无缝替换
后续目标。

### 末端六轴速度

先建立速度 Action，再以 20 ms 左右的周期发送 `vx, vy, vz, wx, wy, wz`。页面会默认选中
当前 `coordinate_state` 提供的参考系：

```json
{"type":"start_cartesian_velocity","request_id":"vel-001","arm":"l","goal":{
  "reference_type":1,"reference_name":"cell","control_period_ms":20,"watchdog_ms":100,
  "max_linear_accel_mps2":0.10,"max_angular_accel_radps2":0.50,
  "follow":false,"trajectory_mode":0,"radio":0}}
```

```json
{"type":"velocity_command","arm":"l","linear":[0.01,0,0],"angular":[0,0,0]}
```

参考系名称来自 `realman_coordinates.yaml`，不能由网页任意拼接。角速度是轴角速度，
不是 Euler 姿态；位姿 Action 的四元数仍使用 `[w,x,y,z]`，从而不会在浏览器控制面板中
引入万向锁。

### 命令与实际末端速度反馈

驱动为每个 arm 发布只读话题 `/<arm>/cartesian_velocity/state`，类型为
`realman_msgs/msg/CartesianVelocityState`。Web bridge 将其转成 WebSocket 事件
`{type: "cartesian_velocity_state", arm, state}`，页面同时显示 l/r 两臂，不受当前运动编辑器
选中 arm 的切换影响。反馈卡片明确区分：

- `commanded_*`：浏览器/键盘/Pika 最近接受的原始速度命令，以及 `command_frame_id`；
- `limited_*`：经过 session 速度上限和加速度限制后实际送入 SDK 的速度；
- `measured_*`：现有状态轮询和 FK 位姿差分得到的末端速度，固定使用
  `<arm>/base_link` 的 `measured_frame_id`，不回显命令值；
- `measured_valid`、`command_age_ms`、`measured_age_ms`：新鲜度和有效性。无有效 FK 样本时页面显示
  `STALE / NO DATA`，不会把零向量当作有效实测速度。

检查 ROS 图和一次反馈：

```bash
ros2 topic info /l/cartesian_velocity/state -v
ros2 topic info /r/cartesian_velocity/state -v
ros2 topic echo --once /l/cartesian_velocity/state
```

命令速度仍保留当前控制帧（例如 `l/work/cell` 或 `l/work/pikabase`）；实测速度的
`l/base_link`/`r/base_link` 是独立的测量坐标约定，调用方不能把两者的分量直接相加。第一版测量频率
由驱动状态轮询决定（默认约 10 Hz），后续可替换为 RealMan UDP 实时状态回调而不改变消息契约。

## 取消与软件停止

“取消 Action”只对发起该 Action 的 WebSocket 客户端有效，调用 `cancel_goal_async()`，
普通运动和连续轨迹驱动随后执行 `rm_set_arm_stop()` 并等待 inactive；速度 Action 则先
发送零速度再 slow-stop。网页红色“软件停止”按钮单独调用 `/{arm}/stop`，可以直接抢占
任一 Action。
这些都是保持动力的受控停止，不替代控制柜或现场物理急停。

取消结果返回后，客户端可以主动请求事件通道恢复：

```json
{"type":"recover_motion","request_id":"recover-001","arm":"m"}
```

响应为 `motion_recovery_result`。`success=true, recovered=false` 表示通道本来已经可用；
`recovered=true` 表示驱动完成了 SDK handle 重建。恢复期间该 arm 被
`ArmOwnership` 独占；正在运动或执行坐标写入时请求会失败。即使客户端不显式调用，
下一条普通或连续运动 goal 仍会触发同一恢复流程。

网页顶部的“恢复机械臂”按钮会对当前选中的 arm 发送同一请求。按钮在 arm 显示离线时仍可用，
因为事件通道失效正是需要恢复的场景；恢复成功后必须等待该 arm 重新发布
`connection=true`，再发送运动。按钮不会执行运动，也不能替代控制柜或现场物理急停。

客户端断开时，后端按以下顺序清理：速度通道发布零速度、请求速度 Action cancel、请求普通
Action cancel。浏览器刷新不会留下仍由网页拥有的速度命令。

## URDF 与影子模型

后端启动时读取：

- `config/ros/three_robots.yaml`：arm、model、world transform；
- `config/ros/realman_motion.yaml`：速度、加速度、watchdog 默认值；
- `config/ros/realman_coordinates.yaml`：BASE/WORK/TOOL 当前配置名称；
- `rm65_description/urdf/<model>.urdf`：六个关节的 lower/upper limit 和 mesh。
- `config/ros/camera_calibration.yaml`：独立标定页面展示的 ChArUco 配置；标定
  service 仍由 `realman_camera_calibration` 节点实际执行。

服务端只允许 `/models/urdf/<model>.urdf` 和 `/models/meshes/...` 解析到
`rm65_description` package 内，`..` 路径会被拒绝。前端为三台机械臂分别加载两份 URDF
实例：每台 arm 都有一个实体模型和一个影子模型。实体模型使用各自的
`joint_states.position`，影子模型只跟随当前选中 arm 的滑轨目标；不 clone 实例，避免
URDFLoader 的关节映射共享。切换 l/m/r 只会切换控制焦点，不会重建整个三臂视图。

## 测试和开发

Python 协议、URDF limit、路径穿越和消息 JSON 映射测试：

```bash
PYTHONPATH=src/driver/realman_web_control \
  python3 -m pytest -q src/driver/realman_web_control/test
```

前端源代码在 `src/driver/realman_web_control/web/src/`，控制页面和
`calibration.html` 标定页面共用一个 WebSocket 服务；配置在
`config/web-control/vite.config.mjs`。普通 ROS 镜像不依赖 Node，提交的 `static/` 是可复现
构建产物；源码变更后在仓库 `website/` 目录执行：

```bash
npm run build:web-control
npm run test:web-control
```

Playwright 测试应覆盖桌面和移动视口、WebGL canvas 非空、实体/影子同时存在、滑轨后画布改变、
WebGL 不可用时的明确渲染错误、速度遥测的命令/限速/实测与 stale 状态、feedback/result 实时更新、
cancel 和 software stop 的协议消息。
真机测试前先用 mock driver
启动同一 Web 服务验证 ownership 和断开清理，再在低速率和明确物理安全员在场时切换
到实际控制器。
