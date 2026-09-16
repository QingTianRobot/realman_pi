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

节点失败时，运行快照会记录 `failure_reason`（例如 Action 被拒绝、超时或驱动返回的错误消息）。
在网页中点击失败节点，可在右侧“失败原因”区域查看该文本；如果底层没有提供消息，则显示
“未提供失败原因”。

运行快照使用 JSON `schema_version: 2`。除树节点状态外，它还包含 `tick_stats`（`running`、
`success`、`failure`、`total`）和 `events`。执行器可将事件写入
`timestamp_ms`、`severity`、`source`、`interface_name`、`phase`、`detail` 字段；事件历史最多保留
最近 200 条，新的事件会淘汰最旧条目。未接入诊断记录器的现有调用仍会产生 v2 快照，其中统计值为
零且事件为空；快照仍通过同目录 `.tmp` 文件原子替换，读取方不会看到半写入 JSON。

执行器本身拥有诊断记录器，因此每次 tick（包括抛出异常后停止树的 tick）都会先计入唯一的
RUNNING、SUCCESS 或 FAILURE 计数，再写出快照。`/realman_bt_executor/start` 和
`/realman_bt_executor/stop` 分别写入 `SERVICE` 的 `request`、`response` 事件，响应消息原样放入
`detail`。MoveJ 写入 `ACTION` 事件，接口名为 `/<arm_id>/execute_motion`，阶段包括
`wait_server`、`send_goal`、`goal_accepted`、`goal_rejected`、`result`、`timeout` 和 `cancel`；失败原因
优先使用 Action 返回消息，否则记录 ROS Action 结果码。dry-run 只写入验证完成的 `result` 事件，绝不
创建或发送 Action goal。

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
注册对应节点，并同步更新 XML 契约测试。
