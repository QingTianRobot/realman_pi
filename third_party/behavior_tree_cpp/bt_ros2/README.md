# bt_ros2：bt_core 的可选 ROS2 wrapper

`bt_ros2` 把零 ROS 依赖的 `bt_core` 行为树接到 ROS2 的参数、topic、service、timer 上。核心库不依赖 ROS2；本包只在 ROS2/ament 环境编译。

## 1. 设计边界

```text
ROS2 topic/service/timer/param
  -> bt_ros2::BtExecutorNode
  -> bt_core::NodeFactory + XmlParser + Tree
  -> bt_nodes / bt_ros2 adapter nodes
```

ROS 句柄进入行为树的方式：

1. `BtExecutorNode` 创建共享黑板。
2. 建树前调用 `setRosNodeHandle(blackboard, this)`，把非拥有 `rclcpp::Node*` 写入保留 key。
3. ROS2 适配节点首次 tick 时调用 `getRosNodeHandle(blackboard)`，惰性创建 subscription/publisher。

这样不会让 `bt_core` 依赖 rclcpp，也避免 `Node -> Tree -> Blackboard -> Node` 的 shared_ptr 循环引用。

## 2. 主要文件

| 文件 | 职责 |
|---|---|
| `include/bt_ros2/bt_executor_node.hpp` / `src/bt_executor_node.cpp` | ROS2 执行器：参数、注册、加载树、周期 tick、发布根状态 |
| `include/bt_ros2/node_registration.hpp` | 单例注册目录 + 注册函数引用列表，统一注册默认节点 |
| `include/bt_ros2/ros_subscriber_node.hpp` | `RosConditionNode<MsgT>` / `RosInputNode<MsgT>` 订阅基类 |
| `include/bt_ros2/ros_publisher_node.hpp` | `RosOutputNode<MsgT>` 发布基类 |
| `include/bt_ros2/example_data_nodes.hpp` | `ReadBattery`、`ReadScalar`、`TaskDoneNotifier` 等开箱节点，以及兼容用旧回充节点 |
| `include/bt_ros2/recharge_task.hpp` / `src/recharge_task.cpp` | `RechargeTask`：一次发布、跨 tick 等待、超时与 halt/retry 状态机 |
| `include/bt_ros2/ros_qos.hpp` | 统一解析 `default` / `sensor_data` 订阅 QoS |
| `trees/example.xml` | 最小 topic 条件/动作示例 |
| `trees/recharge.xml` | 外部 BatteryState 消息驱动回充的完整示例 |
| `launch/bt_executor.launch.py` | launch 参数入口 |

## 3. BtExecutorNode 参数

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `tree_file` | string | `""` | 必填，行为树 XML 文件路径 |
| `tick_rate_hz` | double | `10.0` | tick 频率 |
| `status_topic` | string | `~/bt_status` | 根状态发布 topic |
| `autostart` | bool | `true` | 构造后是否自动 tick |
| `stop_on_terminal` | bool | `false` | 根节点 SUCCESS/FAILURE 后是否停止 tick |

对持续处理事件流的树，通常保留 `autostart=true`、`stop_on_terminal=false`。对本 README 的“一次回充尝试”教程，使用 `autostart=false`、`stop_on_terminal=true`：先把观察者接入 ROS graph，再通过 service 开始；根节点到达 `SUCCESS` 或 `FAILURE` 后自动停止 tick。

执行器始终提供两个幂等的 `std_srvs/srv/Trigger` service：

```bash
ros2 service call /bt_executor/start std_srvs/srv/Trigger '{}'
ros2 service call /bt_executor/stop  std_srvs/srv/Trigger '{}'
```

- 第一次 start 返回 `success=True, message='started'`；运行中再次 start 返回 `already running`。
- 运行中 stop 返回 `success=True, message='stopped'`；已停止时再次 stop 返回 `already stopped`。
- stop 无论计时器是否已停止都会 halt 行为树，因此也能清理 `RUNNING` 或已锁存的任务状态，为下一次 start 做准备。

注意默认值来源有两层：`BtExecutorNode` 节点参数默认 `tick_rate_hz=10.0`；仓库提供的 `bt_executor.launch.py` 为演示更易观察，launch 参数默认覆盖为 `tick_rate_hz=2.0`。命令行传入 `tick_rate_hz:=5.0` 时以 launch 参数为准。

## 4. 默认注册节点

`BtExecutorNode` 调用：

```cpp
bt_ros2::registerDefaultNodes(factory_);
```

默认目录合计注册 **35** 种节点：

| 注册函数 | 数量 | 节点 |
|---|---:|---|
| `registerBtNodes` | 25 | `Sequence`、`Fallback`、`Parallel`、`Inverter`、`Retry`、`Repeat`、`ForceSuccess`、`ForceFailure`、`AlwaysSuccess`、`AlwaysFailure`、`PrintMessage`、`SetBlackboard`、`CompareBlackboard`、`CheckBool`、`Counter`、`CooldownCondition`、`SetBool`、`BlackboardExists`、`ClearBlackboard`、`ScalarThreshold`、`Delay`、`WaitUntilElapsed`、`LogEvent`、`FunctionAction`、`FunctionCondition` |
| `registerRosTopicNodes` | 2 | `RosTopicCondition`、`RosTopicAction` |
| `registerRosDataNodes` | 4 | `ReadBattery`、`ReadScalar`、`IsFlagTrue`、`IsObstacleClose` |
| `registerRechargeNodes` | 4 | `RechargeTask`、`TaskDoneNotifier`、`IsDocked`、`PublishRechargeCommand` |

打包的 `trees/recharge.xml` 使用 `RechargeTask` 完成“发命令 + 等对接”的整体动作，不再使用旧的 cooldown / `PublishRechargeCommand` / `IsDocked` 编排。后三个旧节点仍保留注册，已有源码和 XML 不会因升级而失效。

如果项目要追加节点，可复用 `NodeRegistrationCatalog::instance().add(yourRegisterFn)`，或在自定义 executor 中直接调用 `factory.registerNodeType<T>()`。

## 5. 构建

### 独立 colcon 工作区

```bash
mkdir -p ~/bt_ws/src
cp -r /path/to/behavior_tree_cpp ~/bt_ws/src/
source /opt/ros/$ROS_DISTRO/setup.bash
cd ~/bt_ws
colcon build --packages-select bt_ros2
source install/setup.bash
```

`bt_core` 当前已安装/导出 `bt_coreConfig.cmake` 和 `bt::core` target；`bt_ros2/CMakeLists.txt` 会优先 `find_package(bt_core)`，找不到时再回退到源码子目录方式。

### 主仓库 CMake 子目录方式

```bash
source /opt/ros/$ROS_DISTRO/setup.bash
cmake -S . -B build -DBT_BUILD_ROS2=ON
cmake --build build -j
```

这种方式适合本地编译检查；要用 `ros2 launch` 找包，仍推荐 colcon 安装布局。

## 6. 最小示例

```bash
ros2 launch bt_ros2 bt_executor.launch.py
ros2 topic echo /bt_executor/bt_status
ros2 topic echo /bt/chatter
ros2 topic pub /robot/ready std_msgs/msg/Bool "{data: true}"
```

## 7. 完整回充功能

### 7.1 打包树与单条消息数据流

`trees/recharge.xml` 固定为 8 个节点：1 个 `Fallback`、2 个 `Sequence`、1 个 `ReadBattery`、2 个 `CompareBlackboard`、1 个 `RechargeTask`、1 个 `TaskDoneNotifier`。

一次低电量事件按以下路径执行：

1. 唯一的 `ReadBattery` 订阅 `/battery_state`，用 `sensor_data` QoS 把 `BatteryState.percentage` 写入 `{battery_level}`。
2. `enough_power` 和 `needs_recharge` 先后读取同一个黑板值；不会为两个分支各建一个电池订阅。
3. 低于 `0.20` 时，`RechargeTask` 向 `/robot/command` 发布一次 `start_recharge:main_dock`，随后跨 tick 返回 `RUNNING`。
4. 收到一次 `/dock/is_docked=true` 后，`RechargeTask` 返回 `SUCCESS`。
5. `TaskDoneNotifier` 向 `/bt/task_done` 发布一次 `task_done:recharge`，整棵树返回 `SUCCESS`。

`Sequence` 和 `Fallback` 都保留正在运行的子节点游标，因此进入 `RechargeTask` 后不会每拍退回 `ReadBattery`，一条电池消息足以驱动这一轮回充。

`RosOutputNode` 额外提供 `subscriber_wait_timeout_ms` 公共端口，默认 `0` 表示保持原有的立即发布语义。打包树只给 `TaskDoneNotifier` 设置 `3000`：首次到达通知节点时先创建 publisher；若 DDS 订阅尚未匹配则返回 `RUNNING`，匹配后发布一次；3 秒内仍无观察者则照常发布并完成，避免监控端缺席永久阻塞业务树。

### 7.2 RechargeTask 的 7 个端口

| 端口 | 类型 | 默认值 | 契约 |
|---|---|---|---|
| `command_topic` | string | `/robot/command` | 发布回充命令的 topic；空字符串是配置错误 |
| `dock_topic` | string | `/dock/is_docked` | 订阅 `std_msgs/msg/Bool` 对接状态的 topic；空字符串是配置错误 |
| `target` | string | `main_dock` | 命令目标，示例消息为 `start_recharge:<target>` |
| `timeout_ms` | int | `30000` | 等待对接的超时毫秒数；`<=0` 表示禁用超时 |
| `command_qos_depth` | int | `10` | 命令发布队列深度；必须大于 0 |
| `dock_qos_depth` | int | `10` | 对接订阅队列深度；必须大于 0 |
| `dock_qos_profile` | string | `default` | 对接订阅 QoS，只接受 `default` 或 `sensor_data` |

状态机语义：

- `IDLE` 的首拍惰性创建并保留 publisher/subscription，清除可能滞留的 dock 状态，发布**一条**命令，然后返回 `RUNNING`。
- `RUNNING` 阶段先检查 dock 成功，再检查超时；因此 dock 消息与超时同时满足时以 `SUCCESS` 为准。未 dock 且未超时时继续返回 `RUNNING`。
- `SUCCESS` / `FAILURE` 会锁存到 `halt()`，终态后的重复 tick 不会重发命令。
- `halt()` 清理本次 phase、dock 状态和计时起点，但保留 ROS publisher/subscription。父级 `Retry` 在下一次尝试前会 halt 子节点，因此每次尝试恰好再发布一条命令，同时避免重复创建 ROS 端点。

### 7.3 QoS 选择

所有 `RosSubscriberNode` 子类都支持 `qos_depth` 和 `qos_profile`；`RechargeTask` 对 dock 订阅提供对应的 `dock_qos_*` 端口。

| profile | rclcpp 构造 | 适合场景 |
|---|---|---|
| `default` | `rclcpp::QoS(KeepLast(depth))` | 可靠控制状态、命令确认等常规 topic |
| `sensor_data` | `rclcpp::SensorDataQoS().keep_last(depth)` | 允许丢旧帧、优先低延迟的传感器流 |

打包树明确让 `/battery_state` 使用 `sensor_data`，让 `/dock/is_docked` 使用 `default`。发布端只有 `command_qos_depth`，没有 `command_qos_profile` 端口。

### 7.4 可复制的一电池、一对接演示

以下步骤故意先启动观察者，再发布一次性事件，避免漏掉瞬时消息。每个“终端”代码块都在一个独立终端运行，并先加载同一 colcon 工作区。

终端 1：以手动启动、终态自动停止模式加载安装后的 8 节点树。

```bash
source /opt/ros/humble/setup.bash
source ~/bt_ws/install/setup.bash
TREE_FILE="$(ros2 pkg prefix bt_ros2)/share/bt_ros2/trees/recharge.xml"
ros2 launch bt_ros2 bt_executor.launch.py \
  tree_file:="$TREE_FILE" \
  tick_rate_hz:=10.0 \
  autostart:=false \
  stop_on_terminal:=true
```

终端 2：先观察本轮唯一的回充命令；收到一条后自动退出。

```bash
source /opt/ros/humble/setup.bash
source ~/bt_ws/install/setup.bash
ros2 topic echo --once --field data /robot/command std_msgs/msg/String
```

终端 3：先观察完成通知；收到一条后自动退出。

```bash
source /opt/ros/humble/setup.bash
source ~/bt_ws/install/setup.bash
ros2 topic echo --once --field data --qos-reliability reliable \
  /bt/task_done std_msgs/msg/String
```

终端 4：观察根状态，最终应看到 `SUCCESS`。

```bash
source /opt/ros/humble/setup.bash
source ~/bt_ws/install/setup.bash
ros2 topic echo --field data /bt_executor/bt_status std_msgs/msg/String
```

终端 5：开始 tick，并只发布一条低电量消息。`--wait-matching-subscriptions 1` 会等 `ReadBattery` 订阅就绪，不依赖固定 sleep。

```bash
source /opt/ros/humble/setup.bash
source ~/bt_ws/install/setup.bash
ros2 service call /bt_executor/start std_srvs/srv/Trigger '{}'
ros2 topic pub --once --wait-matching-subscriptions 1 \
  /battery_state sensor_msgs/msg/BatteryState '{percentage: 0.18}'
```

终端 2 输出 `start_recharge:main_dock` 后，在终端 5 只发布一条 dock 消息：

```bash
ros2 topic pub --once --wait-matching-subscriptions 1 \
  /dock/is_docked std_msgs/msg/Bool '{data: true}'
```

随后终端 3 输出 `task_done:recharge`，终端 4 的末状态为 `SUCCESS`；`stop_on_terminal=true` 已取消 tick timer。显式 stop 仍可安全调用，并会 halt 树、返回 `already stopped`：

```bash
ros2 service call /bt_executor/stop std_srvs/srv/Trigger '{}'
```

完整教程见 [`docs/tutorial/ROS2_RECHARGE_TUTORIAL.md`](../docs/tutorial/ROS2_RECHARGE_TUTORIAL.md)。

## 8. 从演示协议升级到生产协议

`RechargeTask` 当前用 `std_msgs/msg/String` 发布 `start_recharge:<target>`，这是为了让示例不依赖厂商接口。一次 `publish()` 只表示消息已交给 ROS2 middleware，**不表示底盘已接收、接受或执行回充**，也不是执行确认。

生产机器人，尤其是安全关键系统，应替换为以下任一协议：

1. 类型化 ROS2 Action：goal 包含目标桩和唯一 attempt ID，feedback 报告导航/对接阶段，result 明确成功、拒绝、取消或故障；`onHalted()` 取消未完成 goal。
2. 类型化、幂等的 command/ack：命令携带唯一 operation ID，控制器按 ID 去重，行为树等待同一 ID 的明确 ack/result，超时重试不会重复触发物理动作。

无论采用哪种方式，仍保持本节点的公开状态机形状：首拍发送并返回 `RUNNING`，后续 tick 等反馈，终态锁存，halt 负责取消/复位。

## 9. 验证状态

非 ROS mock gate：

```bash
cmake --build build --target test_ros_bases --parallel
./build/bin/test_ros_bases
```

`test_ros_bases` 覆盖 subscriber/publisher 基类、两种 QoS、`ReadBattery` 等待语义，以及 `RechargeTask` 的端口、单次发布、dock 成功、超时、成功优先、终态锁存、halt/retry 和端点复用。

ROS2 Humble 已用隔离 colcon 构建和真实 ROS graph smoke 验证：

```bash
source /opt/ros/humble/setup.bash
ROS_DOMAIN_ID=173 BT_ROS2_SMOKE_ROOT="$(mktemp -d)" ./scripts/smoke_ros2.sh
```

smoke 会验证 35 个注册类型、8 节点安装树、幂等 start/stop、恰好一条 battery / command / dock / notifier，以及最终 `SUCCESS`。

Jazzy 环境状态：**unverified: ROS 2 Jazzy is not installed on this machine.**
