# 状态控制配方：和 ROS2 联动的常见三件事

> 本文以三个**完整可照抄的配方**回答用户的三个核心问题:
> 1. 状态完成怎么发结果给 ROS2，让流程自动判断
> 2. ROS2 发命令切换状态，是不是每个状态都要在 `bt_nodes/` 里写一个 C++ 节点
> 3. 每个状态能不能独立订阅 topic + 自己判断 + 触发流程切换
>
> 答案先放在最前面：
> - **Q1**：用 `RosOutputNode<MsgT>` 基类，继承 + 实现一个 `buildMsg()` 即可。Sequence/Fallback 自动据 SUCCESS/FAILURE 走流程。
> - **Q2**：**不需要**给每个状态都写 C++ 节点。大部分场景靠**已有 25 个节点的 XML 组合** + 端口重映射就能实现"ROS2 命令切状态"，不写一行 C++。
> - **Q3**：**全部可以**。每个 ROS 节点实例可独立设 `topic` 端口订阅不同话题，独立的 `evaluate(msg)` 各自判断，返回的 SUCCESS/FAILURE 自动驱动控制节点切换分支。

---

## 配方 1：状态完成 → 发给 ROS2 + 流程自判（Q1）

### 完整代码（约 15 行）

```cpp
// my_pkg/include/my_pkg/task_done_notifier.hpp
#include "bt_ros2/ros_publisher_node.hpp"
#include "std_msgs/msg/string.hpp"

class TaskDoneNotifier : public bt_ros2::RosOutputNode<std_msgs::msg::String> {
 public:
  using RosOutputNode::RosOutputNode;
  static bt_core::PortsList providedPorts() {
    auto p = publisherPorts();                              // 复用 topic + qos_depth
    p.insert(bt_core::InputPort<std::string>("task_name", "unknown", "上报的任务名"));
    return p;
  }
  bool buildMsg(std_msgs::msg::String& msg) override {
    msg.data = "task_done:" + getInput<std::string>("task_name").value_or("?");
    return true;                                            // 发送 → SUCCESS
  }
};
```

### XML 用法（"状态自判流程"的精髓在控制节点本身）

```xml
<root main_tree_to_execute="Main">
  <BehaviorTree ID="Main">
    <Sequence name="巡逻流程">
      <!-- 步骤 1：开始巡逻 -->
      <PrintMessage message="开始巡逻"/>
      <!-- 步骤 2：巡逻动作（你自己的状态节点，返回 SUCCESS/FAILURE） -->
      <Patrol/>
      <!-- 步骤 3：完成后通知 ROS2 -->
      <TaskDoneNotifier topic="/bt/task_done" task_name="patrol"/>
    </Sequence>
  </BehaviorTree>
</root>
```

**流程怎么"自判"**：`Sequence` 是有状态顺序节点 —— 任一子节点返回 `FAILURE` 立即短路返回 `FAILURE`，全部 `SUCCESS` 才整体 `SUCCESS`。这意味着：
- 巡逻成功 → `TaskDoneNotifier` 才会执行，发出 `"task_done:patrol"`，整树 `SUCCESS`
- 巡逻失败 → 通知节点根本不会执行，整树立即 `FAILURE`（你也可以加一个 `Fallback` 兜底分支发"task_failed"）

**核心要点**：你不需要在状态节点里写任何 `if (status == SUCCESS) publish(...)` 的逻辑——把"通知"做成独立节点放在 `Sequence` 里，让控制节点的语义本身承担流程判断。这就是行为树相对于状态机的核心优势。

### 进阶：根据成败发不同消息

```xml
<Fallback>
  <Sequence>
    <Patrol/>
    <TaskDoneNotifier topic="/bt/task_status" task_name="patrol_ok"/>   <!-- 成功路径 -->
  </Sequence>
  <Sequence>
    <TaskDoneNotifier topic="/bt/task_status" task_name="patrol_fail"/> <!-- 失败兜底,Fallback 走到这 -->
    <AlwaysFailure/>                                                     <!-- 最终仍上报 FAILURE -->
  </Sequence>
</Fallback>
```

---

## 配方 2：ROS2 发命令切换状态（Q2，**完全不写 C++**）

**场景**：外部通过 ROS2 话题 `/bt/command` 发送字符串命令（"patrol" / "go_home" / "idle"），行为树切换到对应子树执行。

### 关键洞察

`bt_nodes/` 里已有 25 个节点，其中这几个是"控制流积木"：

| 已有节点 | 用途 |
|---|---|
| `Sequence` / `Fallback` | 顺序/选择控制流 |
| `CompareBlackboard` | 黑板值与字面量比较，相符 SUCCESS |
| `SetBlackboard` / `SetBool` | 写黑板 |
| `RosInputNode<String>`（自定义一个） | 把 `/bt/command` 录入黑板 |

把它们拼起来，"ROS2 命令切状态"就是**纯 XML**。

### 一个一次性写好的命令接收节点（共用）

只需在 `bt_ros2`（或你自己的包）里加**一个**节点 `CommandSubscriber`，它把 `/bt/command` 的 String 写到黑板键 `current_command`：

```cpp
class CommandSubscriber : public bt_ros2::RosInputNode<std_msgs::msg::String> {
 public:
  using RosInputNode::RosInputNode;
  static bt_core::PortsList providedPorts() {
    auto p = subscriberPorts();
    p.insert(bt_core::OutputPort<std::string>("out", "录入到黑板的命令字符串"));
    return p;
  }
  void onData(const std_msgs::msg::String& m) override {
    setOutput<std::string>("out", m.data);
  }
};
```

### 用 XML 把命令分发到不同子树（无需为每个命令写 C++ 节点）

```xml
<root main_tree_to_execute="Main">
  <BehaviorTree ID="Main">
    <Sequence>
      <!-- 第一步：每拍把最新 ROS 命令录入黑板 key: current_command -->
      <CommandSubscriber topic="/bt/command" timeout_ms="0" out="{current_command}"/>

      <!-- 第二步：Fallback 命令分发 —— 遇到第一个匹配的命令就执行其子树 -->
      <Fallback name="命令分发">

        <Sequence name="patrol_branch">
          <CompareBlackboard key="current_command" op="==" value="patrol"/>
          <!-- 这里是 patrol 的具体动作（也都用 XML 组合或现成节点） -->
          <PrintMessage message="执行巡逻"/>
        </Sequence>

        <Sequence name="go_home_branch">
          <CompareBlackboard key="current_command" op="==" value="go_home"/>
          <PrintMessage message="回家充电"/>
        </Sequence>

        <Sequence name="idle_branch">
          <CompareBlackboard key="current_command" op="==" value="idle"/>
          <PrintMessage message="待机"/>
        </Sequence>

        <!-- 兜底：未知命令 -->
        <AlwaysSuccess/>
      </Fallback>
    </Sequence>
  </BehaviorTree>
</root>
```

**这个 XML 完整实现了"ROS2 命令切换状态"，全程零 C++**。每个命令分支只是 `Sequence(CompareBlackboard, ...动作)` 的组合——加新命令只需复制一段并改 `value`。

### 何时确实要写一个新 C++ 节点

| 场景 | 该写 C++ 节点吗 |
|---|---|
| 切换不同 ROS 命令到不同行为 | ❌ XML 组合即可 |
| 加一个新条件（比如"电量是否够"）从已有黑板键判断 | ❌ `CompareBlackboard` 够用 |
| 接一个新 ROS 话题 | ✅ 继承 `RosConditionNode<MsgT>` 或 `RosInputNode<MsgT>`，写 1 个方法 |
| 写一段全新算法（A* 路径规划） | ✅ 继承 `ActionNode`，实现 `tick()` |
| 调用 ROS2 Action / Service 长耗时 | ✅ 继承 `ActionNode`，按异步模式实现（参考 `ros_topic_action_node.cpp` 末尾扩展提示） |

总结：**"全新行为"才写 C++，"组合编排"用 XML**。

---

## 配方 3：每个状态独立订阅 topic + 自判 + 数据流切换（Q3）

**全部能做到**，机制都已在框架里：

### 3.1 同一个 C++ 节点类，多个 XML 实例订阅不同话题

`topic` 是端口，不是 C++ 字段。同一个 `RosConditionNode<Range>` 类可以在 XML 里实例化 N 次订阅不同话题：

```xml
<Sequence>
  <!-- 三个 IsObstacleClose 实例，分别订阅前/左/右测距 -->
  <Inverter><IsObstacleClose topic="/range_front" threshold="0.5"/></Inverter>
  <Inverter><IsObstacleClose topic="/range_left"  threshold="0.3"/></Inverter>
  <Inverter><IsObstacleClose topic="/range_right" threshold="0.3"/></Inverter>
  <!-- 三个方向都不近 → 前进 -->
  <MoveForward/>
</Sequence>
```

每个实例独立持有自己的 subscription、独立缓存最新值、独立判断 `range < threshold`。

### 3.2 状态独立判断 → 自动驱动流程切换

`RosConditionNode::evaluate(msg)` 返回 `bool` → 节点返回 `SUCCESS`/`FAILURE` → 父 `Sequence`/`Fallback` 据此切流程。**这是行为树的核心机制**，不需要额外做任何事。

### 3.3 数据流切换：用黑板做"数据管道"

`RosInputNode<MsgT>` 把消息字段写进黑板，**任何后续节点都能通过端口重映射读它**。配合 `CompareBlackboard` 实现数据驱动分支：

```xml
<Sequence>
  <!-- 每拍读最新电量到黑板 key: battery_level -->
  <ReadBattery topic="/battery" timeout_ms="2000" level="{battery_level}"/>

  <Fallback>
    <!-- 低电量分支 -->
    <Sequence>
      <CompareBlackboard key="battery_level" op="&lt;" value="0.2"/>
      <PrintMessage message="低电量，回充电桩"/>
      <TaskDoneNotifier topic="/bt/task_done" task_name="recharge_started"/>
    </Sequence>
    <!-- 正常分支 -->
    <Sequence>
      <PrintMessage message="电量充足，继续巡逻"/>
      <!-- ... 巡逻动作 ... -->
    </Sequence>
  </Fallback>
</Sequence>
```

**"数据流切换"的本质** = ROS 话题数据 → 黑板键 → `CompareBlackboard` 判断 → `Fallback`/`Sequence` 走对应分支。整条链条只用现成节点 + 一个 `ReadBattery` 类型的录入节点（继承 `RosInputNode<MsgT>` 写一个方法即可）。

---

## 一棵完整的端到端机器人决策树

把上面三个配方拼成真实场景：**外部命令 → 切换巡逻/回家 → 巡逻时监测电量 → 完成上报 ROS2**。

```xml
<root main_tree_to_execute="Robot">
  <BehaviorTree ID="Robot">
    <Sequence>
      <CommandSubscriber topic="/bt/command" timeout_ms="0" out="{cmd}"/>
      <ReadBattery topic="/battery" timeout_ms="2000" level="{batt}"/>

      <Fallback>
        <!-- 命令 patrol 且电量够 → 巡逻并上报 -->
        <Sequence>
          <CompareBlackboard key="cmd"  op="==" value="patrol"/>
          <CompareBlackboard key="batt" op="&gt;=" value="0.2"/>
          <PrintMessage message="巡逻中"/>
          <TaskDoneNotifier topic="/bt/task_done" task_name="patrol"/>
        </Sequence>

        <!-- 命令 go_home 或电量低 → 回充电桩并上报 -->
        <Sequence>
          <Fallback>
            <CompareBlackboard key="cmd"  op="==" value="go_home"/>
            <CompareBlackboard key="batt" op="&lt;"  value="0.2"/>
          </Fallback>
          <PrintMessage message="返航"/>
          <TaskDoneNotifier topic="/bt/task_done" task_name="go_home"/>
        </Sequence>

        <!-- 兜底 -->
        <AlwaysSuccess/>
      </Fallback>
    </Sequence>
  </BehaviorTree>
</root>
```

这棵树**只有 3 个自定义 C++ 节点**（`CommandSubscriber` / `ReadBattery` / `TaskDoneNotifier`）——每个 10~15 行，每个都用模板基类，新加任何"决策分支"都是改 XML 不写 C++。

---

## 配方 4(进阶):把状态做成可复用子树 ── `<SubTree ID="..."/>`

之前文档说"不支持 SubTree,只能复制 XML 段落"——**现在已支持**。把一段树定义
成命名子树,任何地方用 `<SubTree ID="X"/>` 一行引用,解析时自动内联展开。

### 基本用法

```xml
<root main_tree_to_execute="Robot">
  <BehaviorTree ID="Robot">
    <Sequence>
      <SubTree ID="Patrol"/>
      <SubTree ID="GoHome"/>
    </Sequence>
  </BehaviorTree>

  <BehaviorTree ID="Patrol">
    <Sequence>
      <PrintMessage message="巡逻中"/>
      <TaskDoneNotifier topic="/bt/task_done" task_name="patrol"/>
    </Sequence>
  </BehaviorTree>

  <BehaviorTree ID="GoHome">
    <Sequence>
      <PrintMessage message="返航中"/>
      <TaskDoneNotifier topic="/bt/task_done" task_name="go_home"/>
    </Sequence>
  </BehaviorTree>
</root>
```

### 语义要点(本机 ctest 7 用例覆盖)

- **同一个子树可被引用多次**(`<SubTree ID="A"/>` 写几次就展开几次)。
- **子树可嵌套**(子树内部可再引用其它子树)。
- **循环引用自动检测并报错**(自环 `A→A` 或互引用 `A→B→A` 都抛 `std::runtime_error`)。
- **未定义 ID 报错**(`<SubTree ID="Ghost"/>` 但没有 `<BehaviorTree ID="Ghost">` 定义)。
- **缺 ID 属性报错**(`<SubTree/>` 没写 ID)。
- **嵌套深度上限 32** 层,防御失控递归。
- **完全向后兼容**:不写 `<SubTree>` 的旧 XML 行为不变。

这意味着上面那棵"端到端机器人决策树"现在可以拆成 5 个小子树
(命令分发 / Patrol / GoHome / 低电量返航 / 上报)分别写,Robot 主树只需用
`<SubTree>` 把它们拼起来——XML 不再有"复制粘贴的大段树形结构"。

---

## 仍存在的局限

- **ROS2 Action / Service** 这类长耗时操作需要异步动作节点,目前 `RosOutputNode<MsgT>` 是同步发送(话题发布本身就是同步操作,所以这是对的;Action 客户端需另写异步节点)。参考 `bt_ros2/src/ros_topic_action_node.cpp` 末尾的异步范式提示。

接口契约:`docs/design/ROS2_DATA_INTERFACE.md`
节点速查与基础教程:`docs/blog/NODES_AND_DATA.md`
