---
title: 行为树机械臂移动 Demo
description: 使用 vendored BehaviorTree.CPP-X 行为树执行一次 RealMan MoveJ。
---

# 行为树机械臂移动 Demo

realman_bt 提供一个独立的 ROS 2 C++ 执行器，用于从 XML 加载最小行为树并执行一次关节移动。它参考
third_party/behavior_tree_cpp 的 NodeFactory -> XmlParser -> Tree::tickOnce() 链路，当前只注册
Sequence 和 MoveJ，不替换生产 ./rm65 up 编排，也不会自动启动机械臂驱动。

## 数据流

    arm_move.launch.py
      -> realman_bt_executor
           -> arm_move.xml: Sequence -> MoveJ
           -> /<arm_id>/execute_motion (realman_msgs/action/ExecuteMotion)

MoveJ 使用 command=MOVEJ、reference_type=BASE，joint_degrees 为六个角度（单位：度），
velocity_percent 和 blend_radius_percent 的范围分别为 1..100 和 0..100。当前示例目标是
0,0,0,0,0,0，速度为 10%，单次 Action 超时为 120 秒；仍需按实际 RM65 安装姿态和工作空间
确认该目标是否安全。

权威树文件为 config/behavior-trees/arm_move.xml，其中 arm_id 和 dry_run 通过黑板重映射，能被
launch 参数覆盖。

## 构建

在 ROS 2 Humble 工作区根目录执行：

    source /opt/ros/humble/setup.bash
    colcon build --symlink-install --packages-select realman_msgs realman_bt
    source install/setup.bash

## 最小启动

默认 dry_run=true，只解析 XML、校验关节目标和参数，不发送 Action goal：

ros2 launch realman_bt arm_move.launch.py \
      arm_id:=r \
      dry_run:=true

## 驱动测试与可视化

行为树的执行器、只读运行监视器和静态前端都运行在
`realman_bringup_remote` 驱动容器中。`./rm65 up` 只启动驱动及其他生产组件，不会自动执行行为树。
首次修改 Dockerfile 或行为树编辑器后，先重建一次镜像：

    docker compose build realman_bringup_remote

然后按顺序执行：

终端 1：

    ./rm65 up

终端 2：

    ./rm65 bt r

启动器会先在容器内启动只读监视器网页，再等待 `/r/execute_motion` Action Server
就绪；因此驱动尚未完成 ROS 图发现时，网页也能立即打开并显示等待状态，而执行器仍不会在
Action 未就绪时启动。可视化网页由同一容器在宿主网络监听 `0.0.0.0:8080`，地址为
`http://<host>:8080/`。这是运行监视器，不是行为树编辑器：页面从 `GET /api/runtime`
读取执行器原子写入的快照，不提供加载、保存、Tick 或 Run 控件，也不会向 ROS Action
发送请求。容器以 `BT_READ_ONLY=true` 启动 `bt_server`，所有 `/api/` 写入请求都会返回
`405`。执行器通过 `runtime_snapshot_file=/tmp/realman-bt-workspace/runtime.json`
发布快照；页面在快照尚不存在时显示 IDLE。

监视器每 500 ms 轮询，并使用快照序号的 `ETag`/`If-None-Match`：序号未变化时服务器返回
`304 Not Modified`，页面保留当前数据，减少重复传输。网络中断或快照暂时损坏时，页面保留最后一次有效树并标记
“连接中断/数据可能已过期”，恢复后自动重试；这类页面状态不会停止执行器。按 `Ctrl-C`
只清理行为树执行器和监视器服务，驱动容器继续运行；使用 `./rm65 down` 才停止驱动。

`./rm65 bt` 默认等价于 `REALMAN_BT_DRY_RUN=true`。只有在已清空工作区、低速运行、急停可达并
人工确认目标关节后，才允许显式开启真机执行：

    REALMAN_BT_DRY_RUN=false ./rm65 bt r

显式关闭 dry-run 后，容器启动日志会再次打印安全警告，执行器才会向 `/r/execute_motion`
发送真实 `ExecuteMotion` goal。可用 `REALMAN_BT_ARM_ID=l|m|r`、`BT_SERVER_PORT` 和
`BT_PUBLIC_HOST` 覆盖默认参数；运行监视器只读，容器临时 workspace 和快照不会覆盖
`config/behavior-trees/arm_move.xml`。

执行器发布根节点状态：

    /realman_bt_executor/bt_status  (std_msgs/msg/String)

## 运行诊断契约

节点失败时，运行快照会记录根节点或节点自己的 `failure_reason`（例如 Action 被拒绝、超时或驱动返回的错误消息）。
在网页中点击失败节点，可在右侧“失败原因”区域查看原始细节；如果底层没有提供消息，则显示
“未提供失败原因”。

运行快照使用 JSON `schema_version: 2`。除树节点状态外，它还包含 `tick_stats`（`running`、
`success`、`failure`、`total`）和 `events`。每个事件有
`timestamp_ms`、`severity`、`source`、`interface_name`、`phase`、`detail` 字段；事件历史最多保留
最新 200 条，溢出时淘汰最旧条目。未接入诊断记录器的既有调用仍会产生 v2 快照，其中统计值为
零且事件为空；快照仍通过同目录 `.tmp` 文件原子替换，读取方不会看到半写入 JSON。

监视器把累计 `SUCCESS` 和 `FAILURE` 显示为相对 `total` 的横向 Tick 图，并同时显示运行中和总 Tick
计数。它不是时间序列，也不能驱动或重置执行器。诊断日志按事件时间倒序显示，`ERROR` 事件以可访问的告警状态
呈现；前端会拒绝无效的可选统计或事件字段，但仍兼容不含诊断字段的旧快照。

执行器本身拥有诊断记录器，因此每次 tick（包括抛出异常后停止树的 tick）都会先计入唯一的
RUNNING、SUCCESS 或 FAILURE 计数，再写出快照。事件语义如下：

| `source` | 接口与阶段 | 细节规则 |
| --- | --- | --- |
| `ACTION` | `/<arm_id>/execute_motion`：`wait_server`、`send_goal`、`goal_accepted`、`goal_rejected`、`result`、`timeout`、`cancel` | MoveJ 的长时、可取消运动生命周期；失败原因优先使用 Action 返回消息，否则使用 ROS Action 结果码。dry-run 仅写入验证完成的 `result`，绝不创建或发送 Action goal。 |
| `SERVICE` | `/realman_bt_executor/start`、`/realman_bt_executor/stop`：`request`、`response` | 仅控制执行器短请求；响应消息原样保留在 `detail`。 |
| `ROS_LOG` | 已过滤的 `/rosout`：`rosout` | 只记录 logger 名称含 `realman_bt_executor` 或 `rclcpp_action` 的 WARN/ERROR；原始 `msg` 文本原样保留在 `detail`，不替代 ROS 2 节点日志。 |
| `EXECUTOR` | `realman_bt_executor`：`exception` | 记录执行器 tick 抛出的异常及原始错误文本。 |

`ExecuteMotion` Action 是唯一承载真实 MoveJ 的长时、可取消接口；`~/start` 和 `~/stop`
(`std_srvs/srv/Trigger`) 只启动或停止 executor 的 tick timer，不能替代运动 Action。每个 Service 的
`request`、`response` 事件以及终态树 halt 后的事件都会立即写出新的快照序号，无需等待下一次 tick。

超时不会在已发送 goal 仍等待响应时直接把树标记为 FAILURE：执行器保持 MoveJ 为 RUNNING，直到收到
拒绝响应，或在延迟接受后成功提交一次 cancel 请求。这样不会在机械臂仍可能执行已接受目标时过早丢弃
client。halt 只把 pending goal response 或已接受但未终态的 handle 交给 drain；它们会保留到响应被拒绝或
`async_cancel_goal()` 成功提交为止。取消提交抛出异常时不会标记为已取消，后续 drain/tick 会保留并重试；
提交成功后 drain 立即释放跟踪，不等待取消确认或 Action 终态结果。服务的 `request` 和 `response` 事件、
以及终态树 halt 后的事件，都会立即写出新的运行快照序号，无需等待下一次 tick。

`/stop` 或树 halt 恰好发生在 `send_goal` 与 goal 响应之间时，MoveJ 会把 Action client 和 pending
response 转交给 executor 拥有的 cancellation drain。该 drain 由独立 50 ms ROS timer 驱动，不会重新 tick
已停止的树。它等待 pending response；拒绝时记录并释放，延迟接受时尝试提交 cancel。已接受但未终态的 goal
也直接进入同一 drain。`async_cancel_goal()` 仅在成功提交后才让 drain 释放跟踪；其提交异常会记录并在后续
timer tick 重试，drain 不等待 cancel acknowledgement 或 Action terminal result。节点进程销毁会停止该
ROS timer，因此应在可用时让 cancel 提交完成并确认运行快照；进程退出后的机器人安全仍依赖驱动的软件停止
机制和可达的急停，不能由此 drain 保证。

如果 goal 已被接受但 `async_get_result` 建立结果监听时抛出异常，MoveJ 会记录 FAILURE；其已接受且没有
终态结果的 handle 仍被视为 in-flight。随后的 halt 会将该 handle 交给同一 cancellation drain，而不会因
无效 result future 丢弃 client 或遗漏 cancel。

执行器还订阅 `/rosout`（`rcl_interfaces/msg/Log`）。仅 logger 名称包含
`realman_bt_executor` 或 `rclcpp_action` 的 WARN/ERROR 消息会写入 `ROS_LOG` 事件；原始 `msg` 文本不作
修改地写入 `detail`。这只用于诊断快照，不替代 ROS 2 官方日志或其节点日志文件。

并提供手动控制服务：

    ros2 service call /realman_bt_executor/start std_srvs/srv/Trigger '{}'
    ros2 service call /realman_bt_executor/stop std_srvs/srv/Trigger '{}'

launch 每次运行都会在 REALMAN_LOG_ROOT（未设置时为当前目录下的 logs/）创建
YYYYMMDD_HHMMSS/，并启用彩色 ROS 2 日志。设置 REALMAN_CONFIG_ROOT 后，若其中存在
behavior-trees/arm_move.xml，launch 会优先使用该配置。

## 真机执行

先确保工作区清空、急停可达、速度和目标关节均已人工确认。先完成一次 dry-run，再启动驱动容器和行为树：

终端 1：

    source /opt/ros/humble/setup.bash
    source install/setup.bash
    ./rm65 up

终端 2：

    REALMAN_BT_DRY_RUN=false ./rm65 bt r

dry_run=false 会向 /r/execute_motion 发送真实 MoveJ goal。可用以下命令确认 Action 图和执行状态：

    ros2 action info /r/execute_motion
    ros2 topic echo /realman_bt_executor/bt_status

## 参数与限制

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| tree_file | 安装后的 behavior-trees/arm_move.xml | XML 绝对路径 |
| arm_id | r | 只能是 l、m 或 r |
| dry_run | true | true 只校验；false 发真实 goal |
| tick_rate_hz | 20.0 | 行为树 tick 频率（Hz） |
| autostart | true | 节点加载后立即 tick |
| stop_on_terminal | true | SUCCESS/FAILURE 后停止 timer |

当前实现只支持一个 MoveJ 示例节点，不支持 control_mode.xml 中的控制权节点，也不自动注册生产
任务树里的 SelectControlMode、ControlLeaseGuard 等自定义节点。需要扩展树时，应在执行器中显式
注册对应节点，并同步更新 XML 契约测试。节点、端口、Action/Service 接入、取消所有权或运行诊断变更时，
遵守项目 [行为树开发 Skill](https://github.com/QingTianRobot/realman_pi/blob/main/.agents/skills/developing-realman-behavior-trees/SKILL.md) 的 dry-run
边界和验证顺序。
