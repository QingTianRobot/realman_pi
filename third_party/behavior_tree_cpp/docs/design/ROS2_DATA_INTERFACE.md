# ROS2 数据接入接口契约（已验证，文档/测试 agent 必读）

> bt_ros2 新增的"在状态里接收 ROS2 数据"可复用接口。默认 gate 用 mock rclcpp
> 验证模板形状 + 分派逻辑；ROS2 Humble 环境按回充教程验证 colcon build、launch
> 和真实 topic pub/echo。

## 新增文件
- `bt_ros2/include/bt_ros2/data_freshness.hpp` — **ROS-free 纯逻辑**，数据新鲜度判定，本机可单测
- `bt_ros2/include/bt_ros2/ros_subscriber_node.hpp` — 可复用**订阅**基类（ROS2 → 状态）
- `bt_ros2/include/bt_ros2/ros_publisher_node.hpp` — 可复用**发布**基类（状态 → ROS2，对称设计；mock rclcpp 验证通过）
- `bt_ros2/include/bt_ros2/recharge_task.hpp` / `bt_ros2/src/recharge_task.cpp` — 完整回充 Action 状态机
- `bt_ros2/include/bt_ros2/example_data_nodes.hpp` — 开箱即用范例节点与回充节点（需真实 ROS2 msg）
- `bt_ros2/include/bt_ros2/node_registration.hpp` — 默认注册器，使用单例目录与注册函数引用列表统一注册 bt_nodes、ROS topic、数据和回充节点
- `bt_ros2/trees/recharge.xml` — 外部 BatteryState 驱动回充的完整示例树

## data_freshness.hpp（纯逻辑，可本机测）
```cpp
namespace bt_ros2 {
  using SteadyTime = std::chrono::steady_clock::time_point;
  // received: 是否收到过; timeout_ms<=0 表示永不过期; 防时钟回拨
  bool isFresh(bool received, SteadyTime last_recv, SteadyTime now, int timeout_ms);
  long dataAgeMs(bool received, SteadyTime last_recv, SteadyTime now); // 从未收到返回 -1
}
```
已验证：从未收到→不新鲜；timeout<=0→收到过即新鲜；窗口边界（age==timeout 仍算新鲜）；窗口外过期；时钟回拨视为刚收到。

## ros_subscriber_node.hpp（核心可复用基类）
三个模板，用户**只继承别名基类、只实现一个方法**：

```cpp
// 用法 A：把 ROS2 数据当条件
template <typename MsgT>
class RosConditionNode : public ... {
  virtual bool evaluate(const MsgT& msg) = 0;   // ← 用户只写这个
};

// 用法 B：把 ROS2 数据录入黑板
template <typename MsgT>
class RosInputNode : public ... {
  virtual void onData(const MsgT& msg) = 0;     // ← 用户只写这个，里面 setOutput
};
```

**公共端口**（所有子类自动拥有，来自 `subscriberPorts()`）：
- `topic` (input) 订阅话题名
- `timeout_ms` (input) 数据时效窗口，<=0 永不过期
- `qos_depth` (input) QoS 队列深度，默认 10
- `qos_profile` (input) QoS 配置，默认 `default`；可选 `default` / `sensor_data`

**追加自定义端口**的模式（已验证）：
```cpp
static PortsList providedPorts() {
  auto p = subscriberPorts();                           // 复用公共端口
  p.insert(InputPort<double>("threshold","0.5","阈值")); // 追加自有
  return p;
}
```

**钩子语义**：
- 有新鲜数据 → RosConditionNode 走 evaluate→SUCCESS/FAILURE；RosInputNode 走 onData→SUCCESS
- 无新鲜数据（从未收到 or 已过期）→ `onNoFreshData()`，默认 FAILURE；可覆盖为 RUNNING 实现"阻塞等首帧"

`ReadBattery` 正是一个重要覆盖：首条新鲜消息到达前、以及缓存消息过期后，它返回 `RUNNING` 且不重写黑板，避免事件驱动的回充树因为等待传感器首帧而提前失败。

**线程模型前提**：BtExecutorNode 用**单线程 executor**，tick 与订阅回调同线程交替，无竞争、无需锁。多线程 executor 需自行加锁。

**句柄获取**：复用现有 `ros_blackboard_keys.hpp` 的 `getRosNodeHandle(blackboard)`；BtExecutorNode 建树前 `setRosNodeHandle(bb, this)`。首次 tick 惰性 create_subscription。

## example_data_nodes.hpp（范例，照抄模板）
- `IsObstacleClose`（RosConditionNode<Range>，带 threshold 端口）
- `IsFlagTrue`（RosConditionNode<Bool>）
- `ReadBattery`（RosInputNode<BatteryState>，输出端口 level）
- `ReadScalar`（RosInputNode<Float64>，输出端口 value）
- `IsDocked`（RosConditionNode<Bool>，充电桩对接状态）
- `PublishRechargeCommand`（RosOutputNode<String>，发布 `start_recharge:main_dock`）
- `TaskDoneNotifier`（RosOutputNode<String>，发布 `task_done:<task>`）

所有 `RosOutputNode` 子类还拥有 `subscriber_wait_timeout_ms` 公共端口。默认 `0`，任何 `<=0` 值都立即发布；正数时先等待至少一个订阅者匹配，等待期间返回 `RUNNING`，到期仍发布，避免监控端缺席永久阻塞。

`RechargeTask` 把“发布一次回充命令 + 跨 tick 等待 dock”收敛为一个七端口 Action：

- `command_topic=/robot/command`、`dock_topic=/dock/is_docked`、`target=main_dock`
- `timeout_ms=30000`（`<=0` 禁用超时）
- `command_qos_depth=10`、`dock_qos_depth=10`、`dock_qos_profile=default`

每次尝试的首拍只发布一条 `start_recharge:<target>` 并返回 `RUNNING`；`dock=true` 时成功，超时时失败，终态锁存到 `halt()`。父级 `Retry` halt 后开始新尝试并再发布一条命令，但复用 ROS 端点。

## node_registration.hpp（注册器）
`BtExecutorNode` 调用 `registerDefaultNodes(factory)`。默认注册组：
- `registerBtNodes`
- `registerRosTopicNodes`
- `registerRosDataNodes`
- `registerRechargeNodes`

这满足“单例 + 工厂 + 注册函数引用”的扩展方式：`NodeRegistrationCatalog::instance()` 保存注册函数列表，最终仍由 `bt_core::NodeFactory` 创建节点。

默认目录共注册 35 种节点：bt_nodes 25、ROS topic 2、ROS data 4、recharge 4。打包的 `recharge.xml` 固定为 8 个节点，并使用 `RechargeTask`；`PublishRechargeCommand` 和 `IsDocked` 仅为旧 XML 兼容保留。

## 已验证（exit=0，mock rclcpp + 纯逻辑单测）
1. data_freshness 全部边界
2. RosConditionNode：无数据→FAILURE；evaluate 真→SUCCESS/假→FAILURE；多次数据更新
3. RosInputNode：onData 写黑板 + SUCCESS
4. providedPorts 合并订阅公共端口（含 `qos_profile`）+ 自定义阈值读取
5. `RechargeTask` 七端口、单次发布、dock 成功、超时、成功优先、终态锁存、halt/retry 和端点复用
6. ROS2 Humble 端到端验证：35 个注册、8 节点安装树、幂等 start/stop、单次 battery/command/dock/notifier、最终 `SUCCESS`

Jazzy 环境状态：**unverified: ROS 2 Jazzy is not installed on this machine.**
