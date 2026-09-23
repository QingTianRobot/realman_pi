---
title: 行为树机械臂移动 Demo
description: 使用 vendored BehaviorTree.CPP-X 执行单臂或三臂同步分阶段 RealMan MoveJ。
---

# 行为树机械臂移动 Demo

realman_bt 提供一个独立的 ROS 2 C++ 执行器，用于从 XML 加载行为树并执行关节移动。它参考
third_party/behavior_tree_cpp 的 NodeFactory -> XmlParser -> Tree::tickOnce() 链路，注册
Sequence、MoveJ、ThreeArmMoveJ 和 CartesianVelocityForDuration，不替换生产 ./rm65 up 编排，也不会
自动启动机械臂驱动。

同一执行器还支持持久输入路由树，但不与本页的 one-shot MoveJ 生命周期混淆：`./rm65 up` 后另行执行
`./rm65 bt control`，它持续到 Ctrl-C。其 XML 目录、Web override 和无硬件验证见
[行为树控制权与 Mock 测试](./behavior-tree-control)。

## 数据流

    arm_move.launch.py
      -> realman_bt_executor
           -> move.xml: Sequence -> MoveJ
           -> three.xml: Sequence -> ThreeArmMoveJ -> ThreeArmMoveJ
           -> tool_x.xml: Sequence -> CartesianVelocityForDuration
           -> /l|m|r/execute_motion (realman_msgs/action/ExecuteMotion)
           -> /l|m|r/cartesian_velocity (realman_msgs/action/CartesianVelocity)
              + /l|m|r/cartesian_velocity/command (geometry_msgs/msg/TwistStamped)

`./rm65 bt` 使用 one-shot 生命周期。执行器到达 `SUCCESS` 或 `FAILURE` 后停止 tick、halt 树，并等待
所有 cancellation drain 成功提交取消请求；快照中的 `pending_cancellations` 归零后，随后写出最终快照、退出 executor，`ros2 launch` 和只读
监视器也随之退出。三臂 driver 及其 RealMan SDK 连接不退出，下一棵行为树继续复用原有 Action Server。

MoveJ 使用 command=MOVEJ、reference_type=BASE，joint_degrees 为六个角度（单位：度），
velocity_percent 和 blend_radius_percent 的范围分别为 1..100 和 0..100。当前示例目标是
0,0,0,0,0,0，速度为 10%，单次 Action 超时为 120 秒；仍需按实际 RM65 安装姿态和工作空间
确认该目标是否安全。

单臂权威树文件为 config/behavior-trees/move.xml，其中 arm_id 和 dry_run 通过黑板重映射，能被
launch 参数覆盖。三臂权威树文件为 config/behavior-trees/three.xml；每个
ThreeArmMoveJ 叶节点先确认三路 Action Server 都可用，在同一行为树 tick 中依次提交 l/m/r 三个异步
goal，并在三路都成功后返回 SUCCESS。任一路失败或超时会使叶节点失败，并取消或移交仍未完成的 goal。

三臂树由有状态 Sequence 编排两个阶段：

| 阶段 | L（度） | M（度） | R（度） |
| --- | --- | --- | --- |
| `all_zero` | `0,0,0,0,0,0` | `0,0,0,0,0,0` | `0,0,0,0,0,0` |
| `requested_pose` | `24,20,66,24,84,14.5` | `0,18,70,0,90,9` | `15,22,65,23,82,-7.5` |

只有 `all_zero` 的三台机械臂全部完成后，Sequence 才开始 `requested_pose`。两个阶段均使用 10% 速度、
0% 交融半径和 120 秒 Action 超时。“同时”表示三个 goal 在同一次 tick 中提交并共同等待，不保证三台
机械臂在物理上完全同一时刻到达。

`ThreeArmMoveJ` 的三个目标端口是 `l_joint_degrees`、`m_joint_degrees`、`r_joint_degrees`，每个
端口接收六个逗号分隔的有限角度值，默认均为零；该节点固定控制三臂，没有 `arm_id` 端口。公共参数
`dry_run`、`velocity_percent`、`blend_radius_percent`、`timeout_sec` 默认分别为 `true`、`10`、`0`、
`120`。成功要求三路 Action 均返回 `SUCCEEDED`，且每个结果消息的 `success=true`。超时从节点初始化
开始计算，包含等待服务器就绪的时间。

## 定时笛卡尔速度节点

`CartesianVelocityForDuration` 用于“沿指定坐标方向以固定速度运动一段时间”。XML 只使用统一的逻辑
坐标名，不同时暴露容易冲突的 `reference_type`、`reference_name` 和 `frame_id`：

```xml
<CartesianVelocityForDuration
    arm_id="l"
    dry_run="{dry_run}"
    reference="default_tool"
    linear_velocity_mps="0.02,0,0"
    angular_velocity_radps="0,0,0"
    duration_sec="0.5"/>
```

该示例表示左臂沿默认工具坐标系的 +X 方向以 `0.02 m/s` 运行 `0.5 s`。完整示例位于
`config/behavior-trees/tool_x.xml`，可用文件名直接启动：

```bash
./rm65 bt tool_x
```

树根的 `realman_required_actions="cartesian_velocity"` 会让容器入口等待
`/l/cartesian_velocity`，而不是沿用 MoveJ 默认的 `/l/execute_motion`。未声明时默认仍为
`execute_motion`；可用逗号同时声明 `execute_motion,cartesian_velocity`。该元数据和
`realman_required_arms` 共同确定启动前只读就绪检查，不会由节点名做隐式猜测。

默认仍为 dry-run，只校验引用、速度和时长，不创建 Action client，也不发布速度。真机命令必须在清空
工作区、确认工具方向和速度、急停可达后显式执行：

```bash
REALMAN_BT_DRY_RUN=false ./rm65 bt tool_x
```

`reference` 的权威映射来自 `config/ros/realman_coordinates.yaml`：

| 逻辑名称 | 含义 |
| --- | --- |
| `base` | 当前臂的 BASE；定时笛卡尔速度不支持该引用，会在发送 Goal 前失败。 |
| `default_tool` | 当前臂配置的默认工具。 |
| `default_work` | 当前臂配置的默认工作坐标。 |
| `tool/<key>` | `tools` 中指定配置键，例如 `tool/tcpgrip`。 |
| `work/<key>` | `work_frames` 中指定配置键，例如 `work/cell`。 |

例如左臂的 `default_tool` 当前映射为驱动目标 `reference_type=TOOL`、
`reference_name=tcpgrip` 和话题帧 `l/tool/tcpgrip`。控制周期、watchdog、线/角速度上限、线/角加速度
上限以及停止超时统一读取 `config/ros/realman_motion.yaml`，XML 不能绕过这些逐臂限制。

驱动不会把项目内部的 `BASE=0 / WORK=1 / TOOL=2` 数值直接传入厂商接口。
`rm_set_movev_canfd_init` 使用独立枚举：`TOOL` 显式映射为厂商 `frame_type=0`，`WORK`
映射为 `frame_type=1`。厂商速度初始化没有独立 BASE 选项，因此 `reference="base"` 会被明确拒绝，
调用方应选择已配置的工具坐标或工作坐标。

节点在 Action 接受后通过独立 ROS timer 按配置周期发布 `TwistStamped`，因此命令刷新频率不依赖行为树
tick 频率。publisher 使用 `KEEP_LAST=1`、`VOLATILE`，DDS lifespan 等于配置 watchdog；每条消息使用
ROS clock 的新时间戳以及映射后的 `frame_id`。时长到达后节点进入停止等待状态：立即请求取消开放式
`CartesianVelocity` session，并继续按控制周期刷新零速度，直到 Action 返回终态或超过配置的停止超时。
这样取消处理即使超过一个 watchdog 周期，也不会把正常的定时停止误报为
`velocity command watchdog expired`；非零速度刷新意外中断时，驱动 watchdog 仍会执行故障停止。节点会在
发布任何速度前通过 `/<arm>/get_current_pose` 保存真机关节角和
末端位姿，并在驱动返回预期的 `CANCELED` 终态后再次读取。只有平移至少 `0.001 m`、旋转至少
`0.5°`，或任一关节变化至少 `0.1°` 时才返回 `SUCCESS`。三项变化都低于阈值时返回 `FAILURE`，事件中
记录 `translation_m`、`rotation_rad` 和 `max_joint_change_deg`；因此 Action 正常取消不再等同于真机运动
成功。前后状态读取失败或超时、Action 提前结束、引用未知、输入超限或停止超时也都会返回
`FAILURE` 并保留诊断。

树被 `/stop`、分支切换或 Ctrl-C halt 时，节点先停止周期 timer 并发布一次零速度，再把 pending goal
response 或 accepted goal 移交给 executor 的 cancellation drain。`pending_cancellations` 同时统计 MoveJ
和笛卡尔速度 session；one-shot executor 要等两类 drain 都完成取消提交后才退出。

## 键盘连续速度 session

`control.xml` 的 `keyboard` 分支不直接发送机器人命令；`KeyboardVelocityInput` 只是长驻控制权叶节点，
同一 `control_router.launch.py` 中的 `keyboard_control_router` 分别拥有 l/r 两个连续速度 session：

```text
:8765 keyboard_state
  -> /keyboard/l|r/cartesian_velocity
  -> keyboard_control_router
  -> /l|r/cartesian_velocity Action
     + /l|r/cartesian_velocity/command
```

l/r 的 pending goal、accepted handle、最新命令、输入时间和取消状态完全独立，m 不参与键盘控制。
某一侧按键为空、WORK 不可用或超时，只发布并取消该侧的 session；另一侧可以继续按自己的按键和状态运行。

每个 Goal 固定使用 `CartesianVelocity.Goal.WORK`，名称和 frame ID 必须匹配该臂已验证的
`default_work`。BASE 不允许，WORK 不可用时也不会自动改用 TOOL。模式离开 keyboard、坐标失配、按键释放、
输入超时或节点关闭时，router 先对已接受 session 发布零速度，再提交取消。如果 goal response 尚未返回，
`cancel_after_accept` 会阻止迟到接受的 goal 成为 active session，并立即对其发起取消。

失效保护分两层：浏览器按 `config/ros/keyboard_control.yaml` 每 `50 ms` 发送完整按键集合，keyboard router
在 `150 ms` 没有新输入时释放该臂；已接受 session 的 driver command 按
`config/ros/realman_motion.yaml` 的 `20 ms` 周期刷新，而 driver 自身 `100 ms` watchdog 对命令流再次检查。
前一层处理 Web/网络停更，后一层处理 router 到 driver 的刷新中断。`dry_run=true` 时 router 仍执行目录、
WORK、frame、速度上限和 timeout 校验，但不发送 Action Goal，也不向 driver command topic 发布消息。
键盘 Action goal 显式携带普通会话上限 `0.05 m/s`；Pika 单独申请 `1.0 m/s` 不会改变键盘值。
键盘 Goal 使用 `follow=false` 的低跟随模式；RealMan SDK 的高跟随模式要求稳定的 `<=10 ms` 透传，不能
仅因需要更快响应就把键盘会话改成高跟随。
进入 `ACTIVE/keyboard` 时，:8765 Web 页还会把 l/r 已验证 WORK 的红/绿/蓝 XYZ 轴绘制在 URDF 场景中；
模式离开或坐标失配即隐藏。

同一个 keyboard router 还接收左右夹爪的全开／全闭边沿（左 `1/2`、右 `9/0`）。它们不属于速度 session，
不依赖 WORK，按次经 `/keyboard/l|r/gripper_command` 转发到 `/gripper_left|right/percentage/command`。
模式、epoch/request、时效、夹爪健康和 dry-run 都在 router 检查；松键不撤销已提交目标，不发送“零值停止夹爪”。
详细键位、JSON 契约和验证见[键盘双夹爪](./gripper-control#键盘双夹爪全开-全闭)。

### 速度遥测与控制坐标

键盘、Pika 或其它速度 session 运行时，驱动为每个 arm 发布
`/<arm>/cartesian_velocity/state`（`realman_msgs/msg/CartesianVelocityState`）。
`commanded_*` 是输入源提交的速度，`limited_*` 是经过 session 上限/加速度限制后真正送入 SDK 的速度，
两者的 `command_frame_id` 保持输入控制帧；`measured_*` 是状态轮询 + FK 位姿差分估计，并固定使用
`l/base_link` 或 `r/base_link`。因此不能把 WORK/Pika 控制向量和 BASE 实测向量按分量直接比较或混合，
必须先做明确的 TF 变换。`measured_valid=false` 或 `measured_age_ms` 过大时，遥测只能作为无效/过期诊断。

行为树调试时可直接查看：

```bash
ros2 topic info /l/cartesian_velocity/state -v
ros2 topic echo --once /l/cartesian_velocity/state
ros2 topic echo --once /r/cartesian_velocity/state
```

Web control 的“命令与实际末端速度”区域会同时显示左右臂的原始命令、限速后命令、实测线/角速度、
两个 frame ID 以及 command/measured age；这部分是观测，不改变 ReactiveFallback 的输入模式仲裁、
看门狗或停止顺序。

## Pika rosbag replay 边界

独立的 `pika_realman_replay` 项目只连接已经运行的 ROS 图，不启动 driver 或行为树。bag 速度记录的
坐标是 `l/base_link`、`r/base_link`，桥接后只进入 `/pika/l/cartesian_velocity` 和
`/pika/r/cartesian_velocity`；夹爪记录只进入 `/pika/l/gripper_percentage` 和
`/pika/r/gripper_percentage`，类型为 `std_msgs/msg/Float32`，归一化值 `0` 表示闭合、`1` 表示打开。
RealMan 速度模式没有 BASE 初始化选项，所以 replay 在执行前选择 identity WORK aliases
`l/work/pikabase`、`r/work/pikabase`，并将速度消息 frame 改为相应的 `l/work/pikabase`、
`r/work/pikabase`。Pika router 的 `pika_velocity.work_reference` 固定引用这组单位 WORK；键盘与默认
WORK 会话继续使用 `l/work/cell`、`r/work/cell`，其它客户端保留各自的配置引用。

Replay 的 Pika 会话上限为 `1.0 m/s` 线速度和 `0.25 rad/s` 角速度。桥接器按 bag 顺序发布新时间戳，
执行尝试选择 WORK 之后，结束或任何运行时安全条件失败时先向左右速度 ingress 发送零向量，等待超过
`100 ms` watchdog，再将已选择或可能已选择的 WORK 恢复为 `cell`（`l/work/cell`、`r/work/cell`）。
只读预检不会改坐标或发送 cleanup 零速；夹爪的 `0` 是闭合指令，不能用作停止。
恢复失败时保持控制树在中性模式，检查
`/<arm>/coordinates/state` 后通过 `/<arm>/coordinates/select_work`（`realman_msgs/srv/SelectFrame`，
`{name: cell}`）人工恢复并重新验证。

操作员必须先运行 `REALMAN_BT_DRY_RUN=false ./rm65 bt control`，在 Web 控制页手动选择
**Pika / 速度控制** 并等待 `ACTIVE`。该选择会执行三臂准备动作，必须先确认工作区和急停。
再执行独立项目的 `./replay.sh run <bag>` 只读预检；只有明确输入 `--execute` 才会选择 `pikabase` 并
发布真实 ingress。生产 control router 必须以 `REALMAN_BT_DRY_RUN=false` 运行。自动化测试只做
`inspect`、构建、隔离 fake 测试和 no-motion preflight，永远不启动真实 `--execute`。

该 replay 使用内部 `ReplayNode.spin_once()` 处理 ROS 回调和时间调度；这是组合 API 的实现细节，
操作者只使用独立项目的 `replay.sh` 命令，不直接运行 Python 节点。
项目部署到独立的 `$HOME/pika_realman_replay`，不复用生产 Compose project，也不重启生产容器。
模式与帧配置见 [Pika rosbag replay](./behavior-tree-control#pika-rosbag-replay)，
接口映射见 [ingress 与坐标桥接](./realman-action-development#pika-rosbag-replay-的-ingress-与坐标桥接)。

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

三臂分阶段树使用：

    ./rm65 bt three

单臂启动器会先在容器内启动只读监视器网页，再等待所选 `/l|m|r/execute_motion` Action Server；
`three` 模式会等待 `/l/execute_motion`、`/m/execute_motion`、`/r/execute_motion` 三路 Action Server
就绪；因此驱动尚未完成 ROS 图发现时，网页也能立即打开并显示等待状态，而执行器仍不会在
Action 未就绪时启动。可视化网页由同一容器在宿主网络监听 `0.0.0.0:8080`，地址为
`http://<host>:8080/`。这是运行监视器，不是行为树编辑器：页面从 `GET /api/runtime`
读取执行器原子写入的快照，不提供加载、保存、Tick 或 Run 控件，也不会向 ROS Action
发送请求。容器以 `BT_READ_ONLY=true` 启动 `bt_server`，所有 `/api/` 写入请求都会返回
`405`。执行器通过 `runtime_snapshot_file=/tmp/realman-bt-workspace/runtime.json`
发布快照；页面在快照尚不存在时显示 IDLE。

启动器的就绪检查只要求每路至少存在一个 Action Server，默认每路等待最多 30 秒；它不会拒绝重复服务器。
即使 `dry_run=true`，容器入口也会执行这个就绪检查。真实运动前还应按下文
[重复执行与 UNKNOWN 排查](#重复执行与-unknown-排查)确认每路恰好一个服务器。

监视器每 500 ms 轮询，并使用快照序号的 `ETag`/`If-None-Match`：序号未变化时服务器返回
`304 Not Modified`，页面保留当前数据，减少重复传输。网络中断或快照暂时损坏时，页面保留最后一次有效树并标记
“连接中断/数据可能已过期”，恢复后自动重试；这类页面状态不会停止执行器。树到达终态后监视器随 one-shot
进程退出，最终 `runtime.json` 和本次 XML 会归档到
`logs/behavior-trees/<YYYYMMDD_HHMMSS_PID>/`。按 `Ctrl-C` 也只清理行为树执行器和监视器服务，驱动容器
继续运行；使用 `./rm65 down` 才停止驱动。

归档发生在终态 halt 之后，因此 `root_status` 和节点状态会按树复位契约显示为 `IDLE`；本次真实终态保留在
`tick_stats.success`/`tick_stats.failure` 计数和 `events` 详情中。判断运行结果时不要只检查最终
`root_status`。

可从项目根目录读取一次执行的结果：

```bash
python3 docker/bt_runtime_result.py logs/behavior-trees/<run-id>/runtime.json
```

该工具要求 `tick_stats.success + tick_stats.failure == 1`，打印 `SUCCESS` 或 `FAILURE`；两种有效
结果的工具退出码都是 `0`，格式或计数无效时为 `2`。`./rm65 bt` 会进一步把树的失败映射到非零退出码：

| `./rm65 bt` 退出码 | 含义 |
| --- | --- |
| `0` | 树成功并完成归档。 |
| `1` | 树失败、终态结果缺失/无效，或启动失败。 |
| `73` | 同一容器已有行为树运行或清理中。 |
| `74` | 原运行本应成功，但最终 XML/快照归档失败；已有非零错误优先保留。 |

不能只用 `ros2 launch` 的退出码判断树是否成功：它可能在 executor 失败后仍返回零，因此容器入口还会
检查终态计数。常驻模式可能累计多次终态，不适用上述“一次终态”结果工具。

容器内使用 `/tmp/realman-bt.lock` 做非阻塞单实例仲裁。前一棵树尚未完成清理时再次运行 `./rm65 bt`，
第二次启动会以状态码 73 拒绝，不会删除共享 workspace，也不会启动第二个同名 executor。前一实例完全退出并
释放锁后即可执行另一棵树。

这个锁只限制同一容器内通过入口启动的实例，不隔离其他主机上的 driver，也不拦截绕过入口直接 launch
的 executor。正常结束后可再次运行 `./rm65 bt three`，无需断开三臂 driver 的 SDK 连接。

`./rm65 bt` 默认等价于 `REALMAN_BT_DRY_RUN=true`。单臂和三臂模式都只校验目标，不发送 Action goal。
只有在已清空三台机械臂的工作区、急停可达并人工确认目标关节后，才允许显式开启真机执行：

    REALMAN_BT_DRY_RUN=false ./rm65 bt r

三臂真实运动命令为：

    REALMAN_BT_DRY_RUN=false ./rm65 bt three

显式关闭 dry-run 后，容器启动日志会再次打印安全警告，执行器才会发送真实 `ExecuteMotion` goal。
可用 `REALMAN_BT_ARM_ID=l|m|r`、`BT_SERVER_PORT` 和
`BT_PUBLIC_HOST` 覆盖默认参数；运行监视器只读，容器临时 workspace 和快照不会覆盖
`config/behavior-trees/move.xml`。

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
默认 `exit_on_terminal=true`，所以这些 Service 只在本次树运行期间存在；需要由 Service 常驻控制同一棵树时，
直接 launch 并显式设置 `exit_on_terminal:=false`。

例如，在已 source ROS 和工作区环境的终端启动等待 Service 的常驻执行器：

```bash
ros2 launch realman_bt arm_move.launch.py \
  dry_run:=true autostart:=false exit_on_terminal:=false
```

需要同时保留容器里的监视器时，使用 `BT_EXIT_ON_TERMINAL=false ./rm65 bt three`；此入口仍会自动开始
执行。`~/stop` 会停止 tick、halt 树并处理取消，但不会将用户停止计为终态，也不会自动触发进程退出。
`exit_on_terminal=true` 时，即使 `stop_on_terminal=false`，到达终态仍会停止并退出。

单臂 MoveJ 超时不会在已发送 goal 仍等待响应时直接把树标记为 FAILURE：执行器保持 MoveJ 为 RUNNING，直到收到
拒绝响应，或在延迟接受后成功提交一次 cancel 请求。这样不会在机械臂仍可能执行已接受目标时过早丢弃
client。halt 只把 pending goal response 或已接受但未终态的 handle 交给 drain；它们会保留到响应被拒绝或
`async_cancel_goal()` 成功提交为止。取消提交抛出异常时不会标记为已取消，后续 drain/tick 会保留并重试；
提交成功后 drain 立即释放跟踪，不等待取消确认或 Action 终态结果。三臂 ThreeArmMoveJ 超时可以在移交
未完成请求给 drain 后立即返回 FAILURE；executor 仍需等 drain 清空才能按 one-shot 流程退出。

`/stop` 或树 halt 恰好发生在 `send_goal` 与 goal 响应之间时，MoveJ 会把 Action client 和 pending
response 转交给 executor 拥有的 cancellation drain。该 drain 由独立 50 ms ROS timer 驱动，不会重新 tick
已停止的树。它等待 pending response；拒绝时记录并释放，延迟接受时尝试提交 cancel。已接受但未终态的 goal
也直接进入同一 drain。`async_cancel_goal()` 仅在成功提交后才让 drain 释放跟踪；其提交异常会记录并在后续
timer tick 重试，drain 不等待 cancel acknowledgement 或 Action terminal result。节点进程销毁会停止该
ROS timer，因此应在可用时让 cancel 提交完成并确认运行快照；进程退出后的机器人安全仍依赖驱动的软件停止
机制和可达的急停，不能由此 drain 保证。

因此，“终态后退出”不是固定时限保证：如果 goal 响应一直未返回，或 cancel 提交持续抛出异常，executor
会继续保留 drain。Ctrl-C 或进程销毁的清理也不能等同于正常终态完成取消处理；释放叶节点的 Action client
不能代替这套所有权移交，且 SDK 连接属于 driver。

如果 goal 已被接受但 `async_get_result` 建立结果监听时抛出异常，MoveJ 会记录 FAILURE；其已接受且没有
终态结果的 handle 仍被视为 in-flight。随后的 halt 会将该 handle 交给同一 cancellation drain，而不会因
无效 result future 丢弃 client 或遗漏 cancel。

执行器还订阅 `/rosout`（`rcl_interfaces/msg/Log`）。仅 logger 名称包含
`realman_bt_executor` 或 `rclcpp_action` 的 WARN/ERROR 消息会写入 `ROS_LOG` 事件；原始 `msg` 文本不作
修改地写入 `detail`。过滤后的日志会立即推进快照序号并落盘；终态后若仍有 cancellation drain，executor
继续 spin，因此退出前到达的 Action 日志仍会进入最终快照。`exit_on_terminal=false` 的常驻模式继续保留
所有终态后的晚到日志。这只用于诊断快照，不替代 ROS 2 官方日志或其节点日志文件。

并提供手动控制服务：

    ros2 service call /realman_bt_executor/start std_srvs/srv/Trigger '{}'
    ros2 service call /realman_bt_executor/stop std_srvs/srv/Trigger '{}'

launch 每次运行都会在 REALMAN_LOG_ROOT（未设置时为当前目录下的 logs/）创建
YYYYMMDD_HHMMSS/，并启用彩色 ROS 2 日志。设置 REALMAN_CONFIG_ROOT 后，若其中存在
behavior-trees/move.xml，launch 会优先使用该配置。

## 真机执行

先确保工作区清空、急停可达、速度和目标关节均已人工确认。先完成一次 dry-run，再启动驱动容器和行为树：

终端 1：

    source /opt/ros/humble/setup.bash
    source install/setup.bash
    ./rm65 up

终端 2：

    REALMAN_BT_DRY_RUN=false ./rm65 bt r

三臂任务把最后一行替换为 `REALMAN_BT_DRY_RUN=false ./rm65 bt three`。`dry_run=false` 会发送真实
MoveJ goal。可用以下命令确认 Action 图和执行状态：

    ros2 action info /l/execute_motion
    ros2 action info /m/execute_motion
    ros2 action info /r/execute_motion
    ros2 topic echo /realman_bt_executor/bt_status

## 重复执行与 UNKNOWN 排查

“同一棵树执行两次”本身不能确定失败原因。先保留本次归档的 `events`、终态计数及 driver 日志，区分
入口拒绝（如退出码 `73`）和 Action 返回的失败。在项目根目录、实际 driver 容器中执行只读检查：

```bash
docker compose exec -T realman_bringup_remote bash -lc '
  source /opt/ros/humble/setup.bash
  source /opt/rm65_ws/install/setup.bash
  printenv ROS_DOMAIN_ID
  for arm in l m r; do
    ros2 action info /$arm/execute_motion
    timeout 5 ros2 topic echo --once /$arm/connected std_msgs/msg/Bool
  done
  ros2 node list
'
```

目标三路 Action 的 `Action servers` 必须各为 `1`，连接反馈应为 `true`。同一 DDS domain 内若有两套
同名 driver，goal 与 result 的 Service 请求可能由不同服务器处理：客户端收到 `UNKNOWN`，其中一套
driver 却随后记录 `SUCCEEDED`。这时不能把 UNKNOWN 改成成功，也不能仅在叶节点析构函数释放 client
来解决；应定位并隔离重复的 ROS 图。尽可能按 goal ID 和时间对照两端日志。

如果服务器数量正常，继续检查结果监听异常、driver 重启或结果保留、目标超时和取消所有权。
`unknown result response, ignoring...` 等原始日志应保留；UNKNOWN 本身不是重复服务器的充分证据。

## 用 .env 隔离 ROS domain

在生产项目根目录 `.env` 中设置统一的 domain，例如 `ROS_DOMAIN_ID=65`。这是示例值，需要确认未与
其他独立机器人运行时冲突；同一系统的 driver、Web control、宿主机相机和远程 RViz 必须使用相同值。
模板默认值与每台机器的部署值可以不同，不应为部署差异硬编码 Compose。

在允许重启的情况下，先 `./rm65 down` 停止旧运行时，再编辑 `.env`，最后执行：

```bash
unset ROS_DOMAIN_ID
./rm65 up
docker compose exec -T realman_bringup_remote printenv ROS_DOMAIN_ID
docker compose exec -T realman_web_control printenv ROS_DOMAIN_ID
```

`unset` 用于清除可能覆盖 `.env` 的旧 shell 导出值；使用 Zsh helper 的终端还需重新
`source functions.zsh`。仅 `docker compose restart` 不会更新已有容器的环境。核对 `.env` 中该项、
Compose 展开值及实际容器/宿主机相机进程环境，并让远程查看器同步；若 CLI 发现结果疑似缓存，刷新目标
domain 的 ROS 2 daemon 后重查。容器名由 Compose 生成，需要 ID 时用
`docker compose ps -q realman_bringup_remote` 获取。

最后重查每路恰好一个 Action Server、连接反馈和 `REALMAN_BT_DRY_RUN=true ./rm65 bt three`。
dry-run 成功证明参数与执行退出链路通过，不证明真实运动成功。

## 参数与限制

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| tree_file | 安装后的 behavior-trees/move.xml | XML 绝对路径；`three` 入口改用 three.xml |
| arm_id | r | 只能是 l、m 或 r |
| dry_run | true | true 只校验；false 发真实 goal |
| tick_rate_hz | 20.0 | 行为树 tick 频率（Hz） |
| autostart | true | 节点加载后立即 tick |
| stop_on_terminal | true | SUCCESS/FAILURE 后停止 timer |
| exit_on_terminal | true | 终态且 cancellation drain 清空后退出 executor；false 保留 Service 常驻模式 |

当前实现支持单臂 MoveJ、三臂 ThreeArmMoveJ、定时笛卡尔速度，以及 `control.xml` 的
`SelectInputMode`、`InputModeGuard`、`ActivateInputMode`、`KeyboardVelocityInput` 和其它输入叶。切入
`keyboard` 时，ReactiveFallback 激活键盘叶并由独立 router 管理 l/r WORK 速度 session；切入
`pikaposition` 或 `pikavelocity` 时，输入树会先执行一次有状态 Sequence 中的三臂 ThreeArmMoveJ 默认姿态准备动作，
成功后才激活 Pika；该姿态来自 `config/ros/pika_config.yaml` 的 `joint_degrees`，由
`control_router.launch.py` 启动时注入，不是每次切换时动态读取。Pika 分支保持运行时，
准备动作不会被 ReactiveSequence 的后续 tick 重复执行；离开后重新进入才会再次准备。新增节点仍须在执行器中显式
注册，并同步更新 XML 契约测试。控制路由的 reactive 交接规则见
[行为树控制权与 Mock 测试](./behavior-tree-control)。节点、端口、Action/Service 接入、取消所有权或运行诊断变更时，
遵守项目 [行为树开发 Skill](https://github.com/QingTianRobot/realman_pi/blob/main/.agents/skills/developing-realman-behavior-trees/SKILL.md) 的 dry-run
边界和验证顺序。

`./rm65 bt <tree-name>` 接受 `config/behavior-trees/` 下的简单 XML 文件名，`.xml` 后缀可省略；例如
`./rm65 bt move`、`./rm65 bt three`、`./rm65 bt control` 或 `./rm65 bt custom_tree.xml`。
新建树只需将 XML 放入该目录，并在 `<root>` 上声明 `realman_arm_id`、`realman_required_arms`、
`realman_launch`、`realman_stop_on_terminal` 和 `realman_exit_on_terminal`。缺省值依次为 `r`、当前 arm、
`arm_move`、`true`、`true`；`realman_launch` 只允许 `arm_move` 或 `control_router`，不会执行 XML 中的任意 shell 命令。
旧入口 `arm_move.xml`、`three_arm_staged_move.xml` 和 `control_router.xml` 仍映射到新短名，便于已有脚本迁移。
直接 ROS launch 不包含容器入口提供的单实例锁、监视器和归档功能。

## 在 Codex 中复用行为树 Skill

项目 skill 位于 `.agents/skills/developing-realman-behavior-trees/`，可直接请求：

```text
使用 $developing-realman-behavior-trees，扩展三臂分阶段树，
要求上一阶段全部成功后才进入下一阶段，并完成 dry-run 与退出归档验证。
```

`SKILL.md` 负责选择所需参考：`references/node-authoring.md` 说明节点端口、三臂阶段屏障和 Action
所有权；`references/runtime-diagnostics.md` 说明快照和监视器契约；
`references/execution-and-deployment.md` 说明启动、终态退出、归档、重复执行与 domain 排查。
这些文件与本页共同维护，技能内容以仓库实现为准。

不连接硬件的快速验证命令为：

```bash
./rm65 bt-test all
bash scripts/test_bt_launcher.sh
bash scripts/test_bt_container_entrypoint.sh
python3 -m unittest discover -s tests -p test_bt_runtime_result.py
```

C++ 节点或生命周期代码有变化时，还需在 Humble 测试环境构建并运行 `realman_bt` 测试；容器入口的
成功/失败退出码、归档失败和锁竞争由 `tests/test_bt_entrypoint_runtime.sh` 在隔离测试容器内验证。
