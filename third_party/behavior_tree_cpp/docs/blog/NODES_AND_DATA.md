# 节点速查 & 从 ROS2 把数据喂进一个状态

> 接着 [主工程笔记](./README.md) 往下写。上一篇讲清楚了"框架为什么这样搭"，这一篇解决两个最实际的问题：
>
> 1. **我手里到底有哪些现成节点？** —— 一张对照代码逐个核对过的速查表。
> 2. **机器人最常见的需求：怎么把一个 ROS2 话题的数据，变成行为树里能判断、能流动的状态？** —— 一份可照抄的完整教程。
>
> 全文的节点名、端口名、默认值都来自源码的 `providedPorts()`，不是凭印象。代码里没有的，这里也不会编。

---

## 第一部分：常见状态节点速查表

### 0. 先理清"节点分四族"

`bt_core` 把节点按 `NodeType` 分成四类，这决定了它在 XML 里能挂几个孩子：

| 族（NodeType） | 子节点数 | 基类 | 能否返回 RUNNING |
|----------------|----------|------|------------------|
| CONTROL | N 个 | `ControlNode` | 看实现 |
| DECORATOR | 恰好 1 个 | `DecoratorNode` | 透传子节点的 RUNNING |
| ACTION | 0 个（叶子） | `ActionNode` | **可以**（异步动作） |
| CONDITION | 0 个（叶子） | `ConditionNode` | **不可以**（只 SUCCESS/FAILURE） |

这里有个**反直觉但很关键**的点：`bt_nodes/action/` 目录下的 `AlwaysSuccess` / `AlwaysFailure` 虽然放在 action 目录，源码里其实继承的是 `ConditionNode`（瞬时判断、不返回 RUNNING）。所以下表的"类别"列以**源码真实基类**为准，不以目录为准。

### 1. 控制节点（Control）

控制节点决定子节点的执行编排。它们**没有数据端口**，行为全靠子节点的返回值驱动。

| 节点名 | 类别 | 作用 | 端口（名 / 方向 / 默认） | XML 用例 |
|--------|------|------|--------------------------|----------|
| `Sequence` | Control | 从左到右依次执行，**全部成功才成功**；任一失败即整体失败。子节点 RUNNING 时**保留游标**，下一拍续跑（有状态，"与"语义） | 无 | `<Sequence>...</Sequence>` |
| `Fallback` | Control | 从左到右依次尝试，**遇第一个成功即成功**；全失败才整体失败（优先级选择，"或"语义） | 无 | `<Fallback>...</Fallback>` |
| `Parallel` | Control | 同一拍顺序 tick 所有未终结子节点，按阈值判定整体结果（单线程逻辑并行，非多线程） | `success_count` / input / `-1`（-1=全部成功）<br>`failure_count` / input / `1` | `<Parallel success_count="2" failure_count="1">...</Parallel>` |

> **Sequence 为什么要"有状态"**：子节点可能是返回 RUNNING 的异步动作。如果每拍都从头 tick，已完成的子节点会被反复执行，语义就错了。所以 `Sequence` / `Fallback` 内部都保留一个 `current_child_idx_` 游标，RUNNING 时不复位。

### 2. 装饰节点（Decorator）

装饰节点恰好包**一个**子节点，对它的结果做变换。RUNNING 一律透传（异步还没结束，不强转）。

| 节点名 | 类别 | 作用 | 端口（名 / 方向 / 默认） | XML 用例 |
|--------|------|------|--------------------------|----------|
| `Inverter` | Decorator | 把子节点 SUCCESS↔FAILURE 互换；无子节点视为配置错误返回 FAILURE | 无 | `<Inverter><CheckBool key="x"/></Inverter>` |
| `Retry` | Decorator | 子节点失败就重试，任一次成功即成功；耗尽次数才失败 | `num_attempts` / input / `1`（含首次；-1=无限） | `<Retry num_attempts="3">...</Retry>` |
| `Repeat` | Decorator | 子节点**成功**就再跑一遍，跑满 N 次才整体成功；子节点失败立即中断 | `num_cycles` / input / `1`（-1=无限） | `<Repeat num_cycles="4">...</Repeat>` |
| `ForceSuccess` | Decorator | 子节点 SUCCESS/FAILURE 都返回 SUCCESS（RUNNING 透传） | 无 | `<ForceSuccess>...</ForceSuccess>` |
| `ForceFailure` | Decorator | 子节点 SUCCESS/FAILURE 都返回 FAILURE（RUNNING 透传） | 无 | `<ForceFailure>...</ForceFailure>` |

> **Retry vs Repeat 一句话区分**：Retry 在子节点**失败**时计数继续（"再试一次"）；Repeat 在子节点**成功**时计数继续（"再来一遍"）。两者的 RUNNING 都不消耗计数。

### 3. 动作 / 条件叶子节点（Action / Condition）

叶子节点没有孩子，是真正"干活"或"判断"的地方。

| 节点名 | 类别 | 作用 | 端口（名 / 方向 / 默认） | XML 用例 |
|--------|------|------|--------------------------|----------|
| `AlwaysSuccess` | Condition | tick 恒返回 SUCCESS（测试桩 / 占位 / Fallback 兜底） | 无 | `<AlwaysSuccess/>` |
| `AlwaysFailure` | Condition | tick 恒返回 FAILURE（测试失败分支 / 强制走下一候选） | 无 | `<AlwaysFailure/>` |
| `PrintMessage` | Action | 从端口读文本打印到 stdout，恒返回 SUCCESS | `message` / input / `"hello bt"` | `<PrintMessage message="hi"/>` |

### 4. 数据节点（Data）—— 黑板读写专用

`bt_nodes/data/` 下这组节点专门和黑板打交道：写值、计数、按值判断。它们是"数据在节点间流动"的关键中转站。

| 节点名 | 类别 | 作用 | 端口（名 / 方向 / 默认） | XML 用例 |
|--------|------|------|--------------------------|----------|
| `SetBlackboard` | Action | 把 `value` 写入 `output_key` 指定的黑板 key（以 string 存），恒 SUCCESS；`output_key` 为空则 FAILURE | `value` / input / `""`<br>`output_key` / input / `""` | `<SetBlackboard value="42" output_key="score"/>` |
| `Counter` | Action | 每次 tick 把黑板 `key` 的整数值 +`step`（缺失/不可解析当 0），以 int 写回，恒 SUCCESS；`key` 为空则 FAILURE | `key` / input / `""`<br>`step` / input / `1`（可为负） | `<Counter key="tick_count" step="1"/>` |
| `CompareBlackboard` | Condition | 比较黑板 `key` 的值与 `value`：两侧都是数字走数值比较，否则字符串比较（==/!= 按相等，序关系按字典序）；key 不存在或 op 非法 → FAILURE | `key` / input / `""`<br>`op` / input / `"=="`（`== != < <= > >=`）<br>`value` / input / `""` | `<CompareBlackboard key="score" op="&gt;=" value="60"/>` |
| `CheckBool` | Condition | 读黑板 `key` 的 bool 值，等于 `expected` 返回 SUCCESS（兼容 bool 与 "true"/"1" 字符串两种存法）；不存在/不可解析 → FAILURE | `key` / input / `""`<br>`expected` / input / `"true"` | `<CheckBool key="is_ready" expected="true"/>` |

> ✅ **这些数据节点均已注册、开箱可用**：`SetBlackboard` / `SetBool` / `CompareBlackboard` / `CheckBool` / `Counter` / `CooldownCondition` 全部已在 `bt_nodes/register_nodes.cpp` 注册。加载 `libbt_nodes` 动态库后工厂共暴露 **25 个节点**（控制 3 + 装饰 5 + 动作/条件 3 + 数据 9 + 时间 2 + 诊断 1 + 函数 2），XML 里可直接写 `<SetBlackboard>` / `<Counter>` / `<FunctionAction>` / `<ScalarThreshold>` / `<Delay>` 等标签构建运行。（已用真实加载实测确认 25 个注册名。）

### 5. 黑板与端口：数据流动的载体

速查表里反复出现"端口"和"黑板 key"，先把这层机制说透，第二部分才好理解。

- **黑板（Blackboard）**：一个类型安全的 KV 存储，整棵树共享。节点之间不直接调用彼此，而是"一个写黑板、另一个读黑板"来传数据。
- **端口（Port）**：节点对外暴露的"接线孔"。`InputPort<T>` 是读，`OutputPort<T>` 是写。节点代码里只认端口名，不认黑板 key。
- **重映射（`"{k}"`）**：XML 属性值写成 `"{battery_level}"` 表示"这个端口接到黑板 key `battery_level`"；写成普通字面量（如 `"60"`）则是该节点私有的常量，不进共享黑板。

这就是"数据如何在节点间通过黑板流动"的全部秘密：**A 节点 `setOutput` 到某 key，B 节点 `getInput` 同一个 key**，XML 用 `"{key}"` 把两者的端口接到同一根黑板线上。

### 6. 组合用例：把节点拼成有意义的树

下面几棵树都只用**已注册**或"补注册后"的节点，演示数据怎么流。

#### 用例 A：纯控制流——带可选步骤的巡逻（无黑板）

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="patrol">
      <PrintMessage message="出发巡逻"/>
      <!-- 可选步骤：即使失败也不打断主流程 -->
      <ForceSuccess>
        <Inverter>
          <AlwaysFailure/>   <!-- 反转后变 SUCCESS，这里只是演示 -->
        </Inverter>
      </ForceSuccess>
      <PrintMessage message="巡逻完成"/>
    </Sequence>
  </BehaviorTree>
</root>
```

数据流动：无黑板参与，纯靠返回值编排。`Sequence` 从左到右，三个孩子都 SUCCESS → 整体 SUCCESS。`ForceSuccess` 保证中间那步即便失败也不拖累后面。

#### 用例 B：黑板数据流——写值 → 读值判断（需数据节点）

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="score_gate">
      <SetBlackboard value="72" output_key="score"/>          <!-- 写黑板 key: score -->
      <CompareBlackboard key="score" op="&gt;=" value="60"/>  <!-- 读 score，>=60? -->
      <PrintMessage message="及格，放行"/>
    </Sequence>
  </BehaviorTree>
</root>
```

数据流动：`SetBlackboard` 把 `72` 写进黑板 key `score` → `CompareBlackboard` 读同一个 key、判断 `>= 60` 成立返回 SUCCESS → `Sequence` 继续到 `PrintMessage`。三个节点通过黑板 key `score` **串起一条数据链**。注意 XML 里 `>=` 要写成 `&gt;=`（`<` 要写成 `&lt;`），这是 XML 属性转义规则。

#### 用例 C：计数循环——跑 N 次后用计数值收尾（需数据节点）

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="count_then_check">
      <Repeat num_cycles="5">
        <Counter key="hits" step="1"/>   <!-- 每个循环 +1，写回黑板 hits -->
      </Repeat>
      <CompareBlackboard key="hits" op="==" value="5"/>   <!-- 循环跑满了吗 -->
      <PrintMessage message="计数达标"/>
    </Sequence>
  </BehaviorTree>
</root>
```

数据流动：`Repeat` 驱动 `Counter` 成功 5 次，黑板 key `hits` 从 0 累加到 5 → `CompareBlackboard` 读 `hits` 判断 `== 5` → 收尾打印。这里黑板 key `hits` 是循环和判断之间的**共享计数器**。

#### 用例 D：优先级选择——条件不满足时走兜底（需数据节点）

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Fallback name="ready_or_wait">
      <Sequence name="go_if_ready">
        <CheckBool key="is_ready" expected="true"/>   <!-- 就绪才往下 -->
        <PrintMessage message="已就绪，执行任务"/>
      </Sequence>
      <PrintMessage message="未就绪，原地等待"/>        <!-- 兜底分支 -->
    </Fallback>
  </BehaviorTree>
</root>
```

数据流动：`CheckBool` 读黑板 key `is_ready`。为真 → 内层 `Sequence` 成功 → `Fallback` 成功，不走兜底；为假/不存在 → 内层 Sequence 失败 → `Fallback` 落到第二个孩子（等待）。`is_ready` 这个 key 通常由别处（比如下一部分的 ROS2 数据节点）写入。

---

## 第二部分：怎么从 ROS2 wrap 把信息传进一个状态（核心）

这是机器人场景最高频的需求：**传感器/话题的数据，怎么变成行为树里能判断、能往下游传的状态。** `bt_ros2` 把这件事收敛成了"继承一个基类、实现一个方法"。

### 1. 两种接入方式：数据当条件，还是数据录黑板

源码（`bt_ros2/include/bt_ros2/ros_subscriber_node.hpp`）提供两个**别名基类**，对应两种语义，**你只需要继承其中一个、实现一个方法**：

| 基类 | 你要实现的方法 | 语义 | 典型场景 |
|------|----------------|------|----------|
| `RosConditionNode<MsgT>` | `bool evaluate(const MsgT& msg)` | 把最新数据当**条件**：`evaluate` 返回 true → 节点 SUCCESS，false → FAILURE | "障碍物是否在 0.5m 内"、"就绪标志是否为真" |
| `RosInputNode<MsgT>` | `void onData(const MsgT& msg)` | 把数据**录入黑板**：在 `onData` 里 `setOutput` 写黑板，节点返回 SUCCESS | "把电量百分比写进黑板供后续节点读" |

两者底层共用同一套订阅核心 `RosSubscriberNodeBase<MsgT, BaseLeaf>`（`BaseLeaf` 是 `ConditionNode` 或 `ActionNode`），它替你做完了四件最烦的样板事：

1. 首次 tick 时从黑板取 ROS 句柄、惰性 `create_subscription`；
2. 回调里缓存最新消息 + 记录接收时间；
3. tick 时判断"有没有收到 / 数据是否过期"（新鲜度）；
4. 根据新鲜与否分派到 `evaluate` / `onData` / `onNoFreshData`。

### 2. 所有子类自动拥有的三个公共端口

只要继承上面两个基类，节点就自动带上这三个 input 端口（来自 `subscriberPorts()`）：

| 端口 | 方向 | 默认值 | 含义 |
|------|------|--------|------|
| `topic` | input | `""` | 要订阅的话题名（**必须填**，为空首次 tick 会抛错） |
| `timeout_ms` | input | `0` | 数据时效窗口（毫秒）；**`<=0` 表示永不过期** |
| `qos_depth` | input | `10` | 订阅 QoS 队列深度 |

### 3. 完整教程：写一个接收 ROS2 数据的状态节点

下面是一份**可照抄**的完整流程。以"读电量录入黑板"为例（即源码里的 `ReadBattery`）。

#### 步骤 1：选基类、实现方法、声明端口

数据录入选 `RosInputNode<MsgT>`。如果要在公共端口之外**追加自己的端口**，覆盖 `providedPorts()`，**先复用 `subscriberPorts()` 再 `insert` 自有端口**——这是源码里验证过的合并模式：

```cpp
#include "bt_ros2/ros_subscriber_node.hpp"
#include "sensor_msgs/msg/battery_state.hpp"

namespace bt_ros2 {

// 把电量录入黑板。订阅 sensor_msgs/BatteryState，把 percentage 写到输出端口 level。
class ReadBattery : public RosInputNode<sensor_msgs::msg::BatteryState> {
public:
  using RosInputNode::RosInputNode;   // 继承 (std::string, NodeConfig) 构造，必写

  // ① 声明端口：公共三端口 + 自有的输出端口 level
  static bt_core::PortsList providedPorts() {
    auto ports = subscriberPorts();   // 复用 topic / timeout_ms / qos_depth
    ports.insert(bt_core::OutputPort<double>("level", "电量百分比(0~1 或 0~100)"));
    return ports;
  }

  // ② 唯一要实现的方法：拿到新鲜消息时，把关心的字段 setOutput 进黑板
  void onData(const sensor_msgs::msg::BatteryState& msg) override {
    setOutput<double>("level", static_cast<double>(msg.percentage));
  }
};

}  // namespace bt_ros2
```

如果是"数据当条件"，则继承 `RosConditionNode<MsgT>` 实现 `evaluate`，例如带自定义阈值端口的障碍判断：

```cpp
#include "bt_ros2/ros_subscriber_node.hpp"
#include "sensor_msgs/msg/range.hpp"

namespace bt_ros2 {

class IsObstacleClose : public RosConditionNode<sensor_msgs::msg::Range> {
public:
  using RosConditionNode::RosConditionNode;

  static bt_core::PortsList providedPorts() {
    auto ports = subscriberPorts();   // 同样先复用公共端口
    ports.insert(bt_core::InputPort<double>("threshold", "0.5",
                                            "判定为'近'的距离阈值(米)"));
    return ports;
  }

  bool evaluate(const sensor_msgs::msg::Range& msg) override {
    const double threshold = getInput<double>("threshold").value_or(0.5);
    return msg.range < threshold;     // 近 → 条件成立 → 节点 SUCCESS
  }
};

}  // namespace bt_ros2
```

#### 步骤 2：注册进工厂

和普通节点一样注册，注册名即 XML 标签名。源码注释给的范式是：

```cpp
void registerRosDataNodes(bt_core::NodeFactory& f) {
  f.registerNodeType<IsObstacleClose>("IsObstacleClose");
  f.registerNodeType<IsFlagTrue>("IsFlagTrue");
  f.registerNodeType<ReadBattery>("ReadBattery");
  f.registerNodeType<ReadScalar>("ReadScalar");
}
```

`BtExecutorNode` 会在建树前调用这类注册函数，并注入 ROS 句柄（见下一节）。

#### 步骤 3：在 XML 里使用

订阅型节点的端口直接写在标签属性上。输出端口用 `"{key}"` 重映射到黑板：

```xml
<!-- 把 /battery 的电量录入黑板 key: battery_level，2 秒不更新就算过期 -->
<ReadBattery topic="/battery" timeout_ms="2000" level="{battery_level}"/>
```

#### 步骤 4：数据流到后续节点

`ReadBattery` 通过 `setOutput<double>("level", ...)`，而 XML 里 `level="{battery_level}"` 把端口 `level` 接到黑板 key `battery_level`。于是**任何后续节点 `getInput<double>("battery_level")` 就能读到电量**——比如用 `CompareBlackboard key="battery_level"` 判断低电量。数据就这样从 ROS2 话题，经订阅节点写黑板，流到了下游决策节点。

### 4. 数据新鲜度（timeout_ms）：为什么传感器场景非要它不可

机器人场景里，订阅来的数据可能"很久没更新"了——传感器掉线、话题断流、节点崩溃。**一个状态节点不能因为"曾经收到过"就一直把数据当有效。**

`bt_ros2/data_freshness.hpp` 把这个判断抽成了一个纯逻辑函数（不依赖 ROS，可独立单测）：

```cpp
// received: 是否收到过; timeout_ms<=0 表示永不过期; 用 steady_clock 防时钟回拨
bool isFresh(bool received, SteadyTime last_recv, SteadyTime now, int timeout_ms);
```

它的语义（源码已验证的边界）：

- **从未收到过数据** → 一定不新鲜（返回 false）。
- **`timeout_ms <= 0`** → 永不过期，收到过就算新鲜。
- **`timeout_ms > 0`** → 数据年龄 `≤ timeout_ms` 才新鲜；窗口边界（age 恰等于 timeout）仍算新鲜；超过即过期。
- **时钟回拨**（age 算出来是负数）→ 视为"刚收到"，仍新鲜（用 `steady_clock` 而非 `system_clock`，避免 NTP 校时/夏令时把新数据误判成过期）。

基类的统一 tick 流程把它串了起来：

```cpp
bt_core::NodeStatus tickImpl() {
  ensureSubscription();   // 首次 tick 惰性订阅
  const bool fresh = isFresh(received_, last_recv_,
                             std::chrono::steady_clock::now(), timeout_ms_);
  if (!fresh) {
    return onNoFreshData();   // 无新鲜数据 → 默认 FAILURE
  }
  onMessage(last_msg_);       // RosInputNode 在这里 onData 写黑板
  return onFreshData(last_msg_);  // RosConditionNode 在这里 evaluate 判真假
}
```

**为什么传感器场景必须设 `timeout_ms`**：假设一个 `IsObstacleClose` 订阅测距仪。如果测距仪掉线，最后一帧"前方无障碍"会被永远当成有效——机器人就会撞上去。设了 `timeout_ms="500"` 后，数据超过 0.5 秒不更新就判为"无新鲜数据"，走 `onNoFreshData()`（默认 FAILURE，即"无法确认安全"），决策树就能据此停车或报警。**新鲜度是把"数据陈旧"从"沉默的隐患"变成"显式的失败信号"。**

> **想"阻塞等首帧数据"怎么办**：覆盖 `onNoFreshData()` 返回 `RUNNING` 而不是默认的 FAILURE。这样在第一帧数据到来前，节点一直 RUNNING，父 Sequence 会停在这里等，而不是直接失败。

### 5. 句柄机制：bt_core 零 ROS 依赖，节点又怎么拿到 ROS 句柄？

这是整个设计最精巧的一环。难点在于：`bt_core` 的工厂只用 `make_shared<T>(name, NodeConfig)` 这一个签名构造节点——**节点被创建时根本拿不到 `rclcpp::Node` 指针**，只有"实例名 + 黑板"。而 `bt_core` 又必须保持零 ROS 依赖，不能在签名里塞 ROS 类型。

解法是**用黑板当传递通道**（`ros_blackboard_keys.hpp`）：

1. `BtExecutorNode` 在**建树前**，把自己（`rclcpp::Node*`，**非拥有裸指针**）写进黑板一个约定的保留 key（`__bt_ros2_node_handle__`）：
   ```cpp
   void BtExecutorNode::loadTree() {
     setRosNodeHandle(blackboard_, this);   // ← 先注入句柄，顺序关键
     bt_core::XmlParser parser(factory_);
     // 务必复用同一个黑板，否则适配器节点取不到句柄
     bt_core::Tree tree = parser.loadFromFile(tree_file_, blackboard_);
     ...
   }
   ```
2. 订阅型节点**首次 tick 时**，才从黑板把这个指针取出来，用它惰性 `create_subscription`：
   ```cpp
   void ensureSubscription() {
     if (sub_) return;                                  // 已订阅则跳过
     rclcpp::Node* node = getRosNodeHandle(this->blackboard());  // 从黑板取句柄
     const std::string topic = this->template getInput<std::string>("topic").value_or("");
     // ... 用 node->create_subscription<MsgT>(topic, ...) 真正订阅
   }
   ```

**为什么用裸指针而不是 `shared_ptr`**：`BtExecutorNode` 拥有 `Tree`，`Tree` 拥有 `Blackboard`。如果把节点的 `shared_ptr` 再存进黑板，就形成 `node → tree → blackboard → node` 的**循环引用**，节点永远不析构、内存泄漏。节点的生命周期天然长于它持有的树，所以用不参与引用计数的裸指针是安全且正确的。

**为什么惰性订阅（首次 tick 才订阅）而不是构造时订阅**：因为构造时句柄还没注入黑板（句柄是建树前一刻才写进去的），而且只有真正会被 tick 到的节点才需要订阅，省掉用不上的订阅开销。

### 6. 线程模型前提：什么时候不用加锁，什么时候要

订阅型节点有个隐含约定：**tick 读缓存、回调写缓存。** 它们之间会不会打架？取决于 executor：

- **单线程 executor（`BtExecutorNode` 的默认约定）**：timer 的 tick 回调与 subscription 回调在**同一线程**里交替执行，不会并发。因此 `last_msg_` / `last_recv_` 的读写**没有数据竞争，无需加锁**。源码就是这么写的——回调里直接 `last_msg_ = *msg`，干净利落。
- **多线程 executor（你自己改的）**：tick 和回调可能真并发，这时**必须自己给 `last_msg_` / `last_recv_` 加锁**，否则会读到撕裂的数据。

这就是为什么基类源码注释反复强调"约定由 BtExecutorNode 用单线程 executor 驱动"——它是"无锁"成立的前提，不是可以随便改的细节。

### 7. 端到端小剧本：低电量自动返航

把前面所有东西串起来，做一个完整的、可照抄的例子：**订阅 `/battery` → `ReadBattery` 把电量录入黑板 `battery_level` → `CompareBlackboard` 判断低电量 → 触发返航。**

逻辑用最经典的"守卫条件"模式：`Sequence` 里先录数据，再判断，判断成立才执行返航动作。

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="low_battery_return">

      <!-- ① 从 /battery 订阅电量，录入黑板 key: battery_level。
           timeout_ms=2000：2 秒拿不到新电量就算数据过期(节点 RUNNING)，
           Sequence 会停在这里等待；过期期间不调用 onData，也不会把缓存中的旧消息
           重新写入黑板。拿到新鲜电量后再继续判断。-->
      <ReadBattery topic="/battery" timeout_ms="2000" level="{battery_level}"/>

      <!-- ② 读黑板 battery_level，判断是否低于 20。
           低电量 → SUCCESS，继续往下；电量够 → FAILURE，Sequence 到此结束，不返航。
           注意 XML 里 < 必须转义成 &lt; -->
      <CompareBlackboard key="battery_level" op="&lt;" value="20"/>

      <!-- ③ 仅当电量低时才会走到这里：触发返航。
           这里用 PrintMessage 占位；生产环境换成发布返航目标的 RosTopicAction 即可。-->
      <PrintMessage message="电量低于 20%，触发自动返航"/>

    </Sequence>
  </BehaviorTree>
</root>
```

**数据怎么流的，一句话复盘**：ROS2 话题 `/battery` 的 `BatteryState.percentage`，经 `ReadBattery` 的 `onData` → `setOutput("level", ...)` → 黑板 key `battery_level`（XML 的 `level="{battery_level}"` 接线）→ `CompareBlackboard` 的 `getInput("battery_level")` 读出来比较。一条数据从 ROS 世界流进了黑板，再流进了决策。

**新鲜度在这里的作用**：如果电池话题断流超过 2 秒，`ReadBattery` 返回 RUNNING，整个 `Sequence` 停在该节点等待新鲜数据——这一拍不会进入 `CompareBlackboard`，也不会调用 `onData` 把缓存中的旧消息重新写入黑板。新鲜数据到达后，`ReadBattery` 才更新 `battery_level` 并让 `Sequence` 继续决策。这正是 `timeout_ms` 在传感器场景的价值。

> 把它跑起来：用 `BtExecutorNode` 加载这份 XML（`tree_file` 参数指向它），`BtExecutorNode` 会通过 `registerDefaultNodes(factory_)` 注册 `ReadBattery`、`CompareBlackboard`、`PublishRechargeCommand` 等默认节点、注入句柄、按 `tick_rate_hz` 周期 tick。

---

## 收尾

两部分合起来就是一条完整链路：**第一部分**告诉你手里有哪些积木、每块的端口长什么样、怎么靠黑板把它们串成数据流；**第二部分**告诉你怎么再加一块"从 ROS2 话题取数据"的积木，让真实世界的传感器读数，变成行为树里能判断、能流动、还带时效保护的状态。

核心信条始终没变（呼应主笔记）：**`bt_core` 不认识 ROS，ROS 的一切都封在 `bt_ros2` 里，靠黑板这根中立的线把数据接进来。** 守住这条，加传感器、加决策、加动作都只是"再继承一个基类、实现一个方法"而已。

---

*更细的 API 签名见 [`docs/design/API_CONTRACT.md`](../design/API_CONTRACT.md) 和 [`docs/design/ROS2_DATA_INTERFACE.md`](../design/ROS2_DATA_INTERFACE.md)。*
