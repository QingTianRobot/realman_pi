# 函数手册：节点、端口、工厂与 ROS2 数据流

本文是开发/使用手册。目标是让一个常用业务功能可以从普通 C++ 函数、插件节点、XML 树、ROS2 topic 四个入口接入。

## 1. 核心调用模型

行为树执行时只认三件事：

| 概念 | 代码入口 | 作用 |
|---|---|---|
| 工厂 | `bt_core::NodeFactory` | 注册类型名，按 XML 标签创建节点 |
| 黑板 | `bt_core::Blackboard` | 节点之间共享数据，支持类型安全读写 |
| 端口 | `providedPorts()` + `getInput/setOutput` | 把 XML 属性和黑板 key 解耦 |

XML 属性有两种语义：

```xml
<PrintMessage message="hello"/>      <!-- 字面量，属于当前节点私有端口值 -->
<PrintMessage message="{greeting}"/> <!-- 重映射，读取黑板 key greeting -->
```

严格 XML 模式下，除保留的 `name` 外，每个可配置属性都必须由节点的
`providedPorts()` 声明。字面量只保存在节点自己的 `NodeConfig::port_values`；只有
`{key}` 重映射会访问共享黑板。旧插件若曾依赖“任意 XML 属性”或“字面量写共享黑板”，
升级时必须补齐端口声明并改为显式黑板重映射。

## 2. 内置节点速查

当前 `bt_nodes` 插件共注册 25 个内置节点。完整端口表、失败语义和新增节点细节见 Sphinx 版 [`docs/node_catalog.rst`](../node_catalog.rst)。

| 节点 | 类型 | 用途 |
|---|---|---|
| `Sequence` | Control | 子节点从左到右全部成功才成功 |
| `Fallback` | Control | 子节点从左到右遇到第一个成功即成功 |
| `Parallel` | Control | 逻辑并行 tick 子节点，按成功/失败阈值判定 |
| `Inverter` | Decorator | 反转 SUCCESS/FAILURE |
| `Retry` | Decorator | 失败后重试指定次数 |
| `Repeat` | Decorator | 成功后重复指定次数 |
| `ForceSuccess` | Decorator | 子节点结束后强制 SUCCESS |
| `ForceFailure` | Decorator | 子节点结束后强制 FAILURE |
| `AlwaysSuccess` | Condition | 恒 SUCCESS，用于测试桩/兜底 |
| `AlwaysFailure` | Condition | 恒 FAILURE，用于测试失败分支 |
| `PrintMessage` | Action | 打印字符串，用于调试和示例 |
| `SetBlackboard` | Action | 写字符串到指定黑板 key |
| `SetBool` | Action | 写 bool 到指定黑板 key |
| `CompareBlackboard` | Condition | 比较黑板值，支持数值和字符串 |
| `CheckBool` | Condition | 检查黑板 bool 或字符串布尔值 |
| `Counter` | Action | 对黑板 int 计数累加 |
| `CooldownCondition` | Condition | 冷却期门控，适合限制命令频率 |
| `BlackboardExists` | Condition | 判断黑板中是否存在指定 key |
| `ClearBlackboard` | Action | 幂等删除指定黑板 key |
| `ScalarThreshold` | Condition | 读取黑板数值并按阈值比较 |
| `Delay` | Action（异步） | 首拍开始计时，未到时返回 `RUNNING`，到时 `SUCCESS` |
| `WaitUntilElapsed` | Condition | 自首拍起达到指定时长后放行 |
| `LogEvent` | Action | 按 `info`/`warn`/`error` 输出诊断日志，恒 `SUCCESS` |
| `FunctionAction` | Action | 调用 `FunctionRegistry` 中的 C++ 动作函数 |
| `FunctionCondition` | Condition | 调用 `FunctionRegistry` 中的 C++ 条件函数 |

## 3. 用单例函数注册表接入高频业务函数

适用场景：业务功能已经是普通 C++ 函数/lambda，不想为每个函数都写一个类。

```cpp
#include "function/function_registry.hpp"

bt_nodes::FunctionRegistry::instance().registerAction(
    "robot.recharge.command",
    [](const bt_nodes::FunctionContext& ctx) {
      ctx.blackboard->set<std::string>(ctx.output_key, "start_recharge");
      return bt_core::NodeStatus::SUCCESS;
    });
```

XML 调用：

```xml
<FunctionAction function="robot.recharge.command"
                input="main_dock"
                output_key="last_command"/>
```

端口与失败语义：

| 端口 | 方向 | 默认 | 说明 |
|---|---|---|---|
| `function` | input | `""` | `FunctionRegistry` 中的动作函数名，空字符串直接 `FAILURE` |
| `input` | input | `""` | 可选字符串输入，复杂输入建议从 `ctx.blackboard` 读 |
| `output_key` | input | `""` | 可选输出 key，业务函数写入前应判断是否为空 |

`registerAction` 使用同名注册会覆盖旧回调；未知动作函数返回 `FAILURE`，不会抛异常。

更稳妥的写法：

```cpp
bt_nodes::FunctionRegistry::instance().registerAction(
    "robot.recharge.command",
    [](const bt_nodes::FunctionContext& ctx) {
      if (!ctx.output_key.empty()) {
        ctx.blackboard->set<std::string>(ctx.output_key, "start_recharge");
      }
      return bt_core::NodeStatus::SUCCESS;
    });
```

条件函数：

```cpp
bt_nodes::FunctionRegistry::instance().registerCondition(
    "robot.battery.low",
    [](const bt_nodes::FunctionContext& ctx) {
      return ctx.blackboard->get<double>("battery_level").value_or(1.0) < 0.20;
    });
```

XML 调用：

```xml
<FunctionCondition function="robot.battery.low"/>
```

`FunctionCondition` 端口同 `FunctionAction`。空 `function` 或未知条件函数都会返回 `FAILURE`；注册表内部的条件回调返回 `false` 时也映射为 `FAILURE`。

设计要点：

| 机制 | 落地 |
|---|---|
| 单例 | `FunctionRegistry::instance()` 统一保存函数表 |
| 工厂模式 | `FunctionAction/FunctionCondition` 仍由 `NodeFactory` 创建 |
| 函数引用 | 注册表保存 `std::function`，XML 只传函数名 |
| 黑板数据 | 复杂输入/输出通过 `ctx.blackboard` 传递 |

## 4. 写一个新的 C++ 节点

最常见的 Action：

```cpp
class RequestDockNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("target", "main_dock", "目标充电桩"));
  }

  bt_core::NodeStatus tick() override {
    auto target = getInput<std::string>("target").value_or("main_dock");
    blackboard()->set<std::string>("last_dock_target", target);
    return bt_core::NodeStatus::SUCCESS;
  }
};
```

注册：

```cpp
factory.registerNodeType<RequestDockNode>("RequestDock");
```

XML：

```xml
<RequestDock target="main_dock"/>
```

## 5. ROS2 数据节点手册

`bt_ros2` 提供三个模板基类，把 ROS2 topic 胶水收敛成一两个函数。

| 基类 | 用户只需要实现 | 语义 |
|---|---|---|
| `RosConditionNode<MsgT>` | `bool evaluate(const MsgT&)` | 最新消息满足条件则 SUCCESS |
| `RosInputNode<MsgT>` | `void onData(const MsgT&)` | 最新消息写入黑板后 SUCCESS |
| `RosOutputNode<MsgT>` | `bool buildMsg(MsgT&)` | 构造并发布消息，成功则 SUCCESS |

公共订阅端口：

| 端口 | 默认 | 说明 |
|---|---|---|
| `topic` | 空 | 必填，订阅 topic |
| `timeout_ms` | `0` | `<=0` 表示收到过就不过期 |
| `qos_depth` | `10` | QoS 队列深度 |
| `qos_profile` | `default` | `default` 或 `sensor_data`；未知值是配置错误 |

公共发布端口：

| 端口 | 默认 | 说明 |
|---|---|---|
| `topic` | 空 | 必填，发布 topic |
| `qos_depth` | `10` | QoS 队列深度 |
| `subscriber_wait_timeout_ms` | `0` | `<=0` 立即发布；正数时先等待订阅者匹配，超时后仍发布 |

当前开箱节点：

| 节点 | ROS2 消息 | 功能 |
|---|---|---|
| `ReadBattery` | `sensor_msgs/msg/BatteryState` | 读 `percentage` 到输出端口 `level` |
| `ReadScalar` | `std_msgs/msg/Float64` | 读 `data` 到输出端口 `value` |
| `IsFlagTrue` | `std_msgs/msg/Bool` | `data=true` 时 SUCCESS |
| `IsObstacleClose` | `sensor_msgs/msg/Range` | `range<threshold` 时 SUCCESS |
| `IsDocked` | `std_msgs/msg/Bool` | 充电桩对接状态 |
| `PublishRechargeCommand` | `std_msgs/msg/String` | 发布 `start_recharge:main_dock` 形式命令 |
| `RechargeTask` | `std_msgs/msg/String` + `std_msgs/msg/Bool` | 每次尝试只发一条命令，跨 tick 等待 dock、超时并锁存终态 |
| `TaskDoneNotifier` | `std_msgs/msg/String` | 发布 `task_done:<task>` 完成通知 |

`ReadBattery` 在首条新鲜消息到达前、以及上一条消息过期后返回 `RUNNING`，不会重写黑板；这与订阅基类默认的无新鲜数据 `FAILURE` 不同，适合等待一次性电池事件。

## 6. ROS2 执行器默认注册

`BtExecutorNode` 使用 `bt_ros2::registerDefaultNodes(factory)`，它通过单例 `NodeRegistrationCatalog` 持有注册函数引用列表：

```cpp
{ registerBtNodes, registerRosTopicNodes, registerRosDataNodes, registerRechargeNodes }
```

这意味着 ROS2 XML 可以直接使用控制节点、数据节点、函数节点和回充节点，不需要用户手动修改 executor。默认目录共注册 35 个类型；打包的 8 节点回充树使用 `RechargeTask`，`PublishRechargeCommand` 与 `IsDocked` 仅作为兼容节点继续保留。

## 7. 推荐开发流程

1. 先用 `FunctionAction/FunctionCondition` 快速接普通函数，验证业务流程。
2. 高频且稳定的逻辑再沉淀成专用节点类，声明端口和文档。
3. ROS2 输入统一继承 `RosInputNode<MsgT>`，先把消息字段写黑板，再用普通数据节点判断。
4. 一拍即完成的通知节点继承 `RosOutputNode<MsgT>`；需要“发一次、跨 tick 等结果、超时、halt/retry”的完整动作应实现为 `ActionNode` 状态机，可参考 `RechargeTask`。
5. 每个新节点至少补一个非 ROS 单测；真实 ROS2 topic 行为在 Humble 按回充教程验证。Jazzy 状态必须如实记录：unverified: ROS 2 Jazzy is not installed on this machine.
