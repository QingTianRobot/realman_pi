---
title: 行为树控制权与 Mock 测试
description: RealMan 控制模式切换、工业任务树和隔离 mock 验证。
---

# 行为树控制权与 Mock 测试

行为树运行时位于 `realman_bt`，底层仍使用 RealMan Action 和
`motion_coordinator`。持久输入路由器的权威定义是
[`config/behavior-trees/control.xml`](../../../config/behavior-trees/control.xml)：
当前目录顺序为 `web`、`keyboard`、`policy`、`pikaposition`、`pikavelocity`、`none`。其中
`keyboard`、`policy`、`pikaposition`、`pikavelocity` 和 `none` 可由浏览器选择器请求；`web`
是粘性且最高优先级的覆盖，不出现在浏览器选择器中。
ROS selection service 接受任何已注册模式（包括 `web`），只要求调用者提供非空 `requester_id`；
该字段用于请求关联，并非 service 层的身份验证或授权。
`keyboard` 分支固定为 `InputModeGuard` → `ActivateInputMode` → `KeyboardVelocityInput`。该叶节点和
Policy/Pika 输入叶一样保持 `RUNNING` 并记录控制权；实际键盘速度 session 由同一 launch 中的
`keyboard_control_router` 管理，Pika topic 转发由 `pika_control_router` 管理。两个 router 都只为 l/r
建立 session，绝不为 m 建立 goal、订阅或 command publisher。

选择器显示 `Pika / 位置控制`（模式 ID `pikaposition`）和 `Pika / 速度控制`（模式 ID
`pikavelocity`）两个独立选项。Pika 生产 topic 为 `/pika/l|r/cartesian_pose`（`PoseStamped`）
和 `/pika/l|r/cartesian_velocity`（`TwistStamped`）；位置数据是基座坐标系下的米和四元数。
夹爪开合度由 `/pika/l|r/gripper_percentage`（`std_msgs/msg/Float32`）持续发布，范围是
`0.0..1.0`（`0` 闭合，`1` 张开）。Pika 只控制 l/r，绝不订阅或发送 m 的夹爪信号。

`InputModeGuard` 的 `mode`、`label`、`selectable` 字面量在 XML 构造时注册目录，
因此新增模式只改 XML 和相应叶注册，不能在 Web 或 Python 写静态枚举。路由根节点必须保留
`ReactiveSequence` 和 `ReactiveFallback`，使 guard 每个 10 Hz tick 都重算并 halt 离开的
RUNNING 分支。普通分支是 `InputModeGuard` → `ActivateInputMode` → 输入叶；Pika 分支在激活前
额外运行一次有状态 `Sequence` 中的 `ThreeArmMoveJ` 准备动作，准备成功后才发布 Pika `ACTIVE`。
准备动作成功后，后续 tick 会从该 `Sequence` 的 Pika 输入叶继续，不会重新进入准备动作；只有离开
Pika 分支后再次进入，才会重新执行准备动作。

键盘 Web ingress 是 `/keyboard/l/cartesian_velocity` 和 `/keyboard/r/cartesian_velocity`
（`geometry_msgs/msg/TwistStamped`）。`keyboard_control_router` 为左右臂分别拥有
`/l|r/cartesian_velocity` Action，并在 session 接受后向
`/l|r/cartesian_velocity/command` 刷新命令。两臂互不绑定：一侧没有按键、WORK 不可用或输入超时，
只释放该侧，不影响另一侧仍满足条件的 session。

键盘只允许每臂当前已验证的默认 WORK 坐标：坐标状态必须同时确认 `motion_allowed=true`、
`work_matched=true`、当前/预期 WORK 名称及 frame ID 都与
[`config/ros/realman_coordinates.yaml`](../../../config/ros/realman_coordinates.yaml) 一致。Goal 固定使用
`CartesianVelocity.Goal.WORK`；BASE 被拒绝，也不会在 WORK 不可用时自动回退到 TOOL。
`/<arm>/coordinates/state` 使用 reliable、transient-local、depth 1 QoS，驱动保留最近一次校验结果，
因此晚启动的 Web control 和 `keyboard_control_router` 也能立即恢复 WORK gate；publisher/subscriber
任一侧改回 volatile 都会破坏这个启动顺序契约。

切换到不同模式时，选择先进入 `SWITCHING` 并选择 `none`。下一 tick 必须激活/运行这个中性分支，
下一 tick 才选择并激活目标模式；这让 Policy/Pika 不必自行结束即可交接。重选已经 active 的模式会
立即返回已有 request ID，不经过中性 tick，`epoch` 也不会递增。Web 离开到非 Web 模式时，桥先取消
所有 Web-owned Action：等待尚未返回的 goal response 被拒绝、Action 已终结，或取消成功提交，
再请求全局模式。取消提交异常会重试；不等待取消确认或机械臂物理停止。
Web 运动也只有收到同一请求的 `ACTIVE/web` 后才会转发。键盘模式同样经过 `none` 中性交接，并且只有
请求它的 WebSocket 在收到匹配的 `ACTIVE/keyboard` 后取得独占 lease；其它浏览器的按键消息会被拒绝。

## 输入路由 ROS 契约

路由器运行时由 `realman_bt_executor` 提供两个 service 和一个可靠、transient-local topic：

| 名称 | 类型与字段 | 用途 |
| --- | --- | --- |
| `/realman_bt_executor/list_input_modes` | `realman_msgs/srv/ListInputModes`：响应 `success`、`message`、并行的 `mode_ids`、`labels`、`selectable` 数组 | 以 XML 声明顺序发现目录。 |
| `/realman_bt_executor/select_input_mode` | `realman_msgs/srv/SelectInputMode`：请求 `mode_id`、`requester_id`；响应 `accepted`、`request_id`、`message` | 请求一个已注册模式。 |
| `/realman_bt_executor/input_mode_state` | `realman_msgs/msg/InputModeState`：`requested_mode`、`selected_mode`、`active_mode`、`phase`、`request_id`、`epoch`、`detail` | 发布 `ACTIVE`、`SWITCHING` 或 `FAILED` 的路由状态。 |

配置在 [`config/ros/behavior_tree.yaml`](../../../config/ros/behavior_tree.yaml)：
`tick_rate_hz: 10.0`（Hz）、`switch_timeout_ms: 5000`（ms），以及必须是已注册且可选模式的
`safe_fallback_mode: none`。`none` 既是安全回退也是中性 tick，不能删除或改成 Web。

键盘按键、速度比例和 Web 输入时序的权威配置是
[`config/ros/keyboard_control.yaml`](../../../config/ros/keyboard_control.yaml)。浏览器每 `50 ms` 发送一次
左右臂各自的完整按键集合；Web bridge 对每臂要求严格递增的 sequence，并拒绝未知物理键码、重复键码、
非 lease owner 和任何 m 输入。Web 输入超过 `150 ms` 未刷新时，keyboard router 对该臂发布零速度并
取消 session。driver 仍按 `config/ros/realman_motion.yaml` 的 `20 ms` 周期和 `100 ms` watchdog
执行第二层失效保护。

离开 `keyboard`、WORK 失配、按键全部释放、Web 输入超时、owner WebSocket 关闭或 router 关闭时，
相关臂先收敛到零速度，再取消其 Action session。浏览器 owner 断开还会释放 lease 并请求安全模式
`none`。如果停止条件发生在 Action goal response 返回之前，router 设置 `cancel_after_accept`；迟到接受的
goal 会立即取消，不能成为 active session。`dry_run=true` 时仍校验模式、WORK、配置和输入，但不发送
driver Goal，也不发布 driver command。

同一 keyboard 分支还支持左右夹爪的单次全开／全闭：左 `1/2`、右 `9/0`，与速度键独立。
Web bridge 检查 lease/sequence 并识别新按下边沿，发布 `/keyboard/l|r/gripper_command`
（`std_msgs/msg/String` JSON：`command`、`epoch`、`request_id`、`stamp_ns`）。router 只在
`ACTIVE/keyboard`、epoch/request 匹配、事件未重复且在 `input_timeout_ms` 内、对应夹爪在线且无报警时，
转发 `Float32` 到 `/gripper_left|right/percentage/command`；`1.0` 全开、`0.0` 全闭。
夹爪不依赖 WORK，也不建立机械臂 Action。`dry_run=true` 消费事件但不输出；非活动、旧 epoch、健康拒绝事件不重放。
松键／模式离开不会取消已提交夹爪目标，更不能向夹爪发送零值来模拟停止。详见
[键盘夹爪契约](./gripper-control#键盘双夹爪全开-全闭)。原 ReactiveFallback 和 `KeyboardVelocityInput` 无需新分支。

同一 launch 还启动 `pika_control_router`。它接收 executor 的 active mode，并只为 l/r 管理 Pika
Action session，同时将夹爪百分比转发到 `/gripper_left/percentage/command` 和
`/gripper_right/percentage/command`。只有 `pikaposition` 或 `pikavelocity` 处于 `ACTIVE` 时才转发；
其它模式会丢弃输入，不自动开合。夹爪 command topic 是非阻塞的连续控制路径，`dry_run=true`
（默认）时不发送机器人 Action 或夹爪 command。需要真实 Pika 运动时必须显式设置
`REALMAN_BT_DRY_RUN=false`，并完成低速、急停和工作区检查。

切入任一 Pika 模式时，行为树先用 `ThreeArmMoveJ` 将 l/m/r 移动到
[`config/ros/pika_config.yaml`](../../../config/ros/pika_config.yaml) 中
`pika_default_pose.left|middle|right.joint_degrees` 指定的关节角（单位：度），再激活 Pika。
`control_router.launch.py` 启动时读取这三组关节角并注入行为树黑板；同一配置中的 `tcp_pose` 不参与
这次初始 MoveJ。修改默认姿态只需更新该 YAML 并重启控制树，不要再修改 `control.xml`。准备动作失败
或切换期间被取消时，不会进入 Pika `ACTIVE`。

## 生命周期和无硬件验证

`./rm65 up` 只拥有长期 driver 和 :8765 Web 服务；它不启动行为树。先启动该运行时，再显式执行
`./rm65 bt control`，该命令使用 `control_router.launch.py` 和 `exit_on_terminal=false`，连同 :8080
只读监视器持续到 Ctrl-C。Ctrl-C 不停止 driver；`./rm65 down` 才停止统一运行时。

## 独立测试

```bash
./rm65 bt-test all       # 无 ROS 依赖的 XML 与 mock 契约
./rm65 bt-test build     # 构建 realman_msgs/realman_bt/realman_bt_mock
./rm65 bt-test mock      # 启动 /realman/mock/* 隔离 ROS 图
./rm65 bt-test web       # 启动 Compose 行为树调试服务
```

`./rm65 bt control` 的 Ctrl-C（非交互运行也可向 CLI 发送 SIGINT）按本次调用的唯一 token
通知对应容器 wrapper。wrapper 先调用 `/realman_bt_executor/stop`，让 executor halt 行为树并由独立
timer 提交所有未完成 Action 的取消请求；快照中的 `pending_cancellations` 归零后才终止本次 ROS
launch/executor 进程组、停止监视器、归档 runtime snapshot 并释放锁。若取消在 10 秒内未清空，wrapper
会打印警告并强制清理；CLI 返回 130。其他 driver 和其他容器保持运行。

mock 节点不会连接 SDK/CAN，也不会发布生产控制命令。可通过 ROS 参数注入模式、owner
和后端健康状态；命令记录器可将 mock 输出写为 JSONL。

路由器改动先执行 XML/unit/mock 检查，不接手柄且不启动真机运动：

```bash
./rm65 bt-test all
RM65_DRY_RUN=1 ./rm65 bt control
```

后一个命令只打印容器启动计划；默认 `REALMAN_BT_DRY_RUN=true` 也不会发送 Action goal。

## 网页调试

生产端使用 `behavior_tree_cpp` 的只读 `bt_server + bt_editor` 运行监视器，页面显示活动节点、
Action 状态、失败原因、累计 Tick 成功/失败比例图和最新诊断事件，但不加载 XML、校验、格式化、单拍 tick
或连续 run。诊断事件来自 schema-v2 快照：最多显示执行器保留的最新 200 条，并可区分 `ACTION`、
`SERVICE`、`ROS_LOG` 和 `EXECUTOR` 来源；`/rosout` 仅纳入 `realman_bt_executor` 与 `rclcpp_action`
logger 的 WARN/ERROR。详细字段、失败细节和 cancellation drain 约束见
[行为树机械臂移动 Demo](./behavior-tree-motion#运行诊断契约)。

MoveJ 使用 `/<arm_id>/execute_motion` Action 承载长时、可取消的运动；`/realman_bt_executor/start`
和 `/realman_bt_executor/stop` 是只管理 tick timer 的短 `std_srvs/srv/Trigger` Service，不能用于替代
运动 Action。停止或 halt 遇到尚未终态的 goal 时，executor 继续用独立 timer drain 该 goal 的取消流程，
不会通过恢复 tree tick 来处理它。`./rm65 bt` 默认是单实例 one-shot：终态且 drain 清空后 executor 与
launcher 正常退出，最终快照归档到 `logs/behavior-trees/`；显式设置 `exit_on_terminal:=false` 才保留
Service 常驻模式。

新增或调整行为树节点、端口、Action/Service 接入、取消或运行诊断时，使用项目
[行为树开发 Skill](https://github.com/QingTianRobot/realman_pi/blob/main/.agents/skills/developing-realman-behavior-trees/SKILL.md)。
该 skill 也覆盖三臂阶段屏障、one-shot 退出、快照归档和生产 domain 排障；调用方式见
[在 Codex 中复用行为树 Skill](./behavior-tree-motion#在-codex-中复用行为树-skill)。重复执行时出现
`UNKNOWN`，先按[排查步骤](./behavior-tree-motion#重复执行与-unknown-排查)核对实际 domain 中的服务器数量。
生产 Web 控制页面只请求模式，不绕过仲裁层发送动作。

编辑器支持通过 URL 直接打开工作区树：访问 `bt_editor/?tree=move.xml` 后，前端先拉取
`/api/nodes`，再请求 `GET /api/tree/open?name=move.xml`，将返回的 XML 导入画布并同步到
`/api/tree/load`。文件名会进行 URL 编码；打开失败会显示错误 toast。该 URL 参数只在启动时消费一次，
因此后续编辑不会因 React 状态更新而重复打开或覆盖画布。

相关配置：[`config/ros/behavior_tree.yaml`](../../../config/ros/behavior_tree.yaml)。
