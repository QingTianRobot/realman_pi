// ============================================================================
//  bt_ros2/example_data_nodes.hpp
//  "如何在一个状态里接收 ROS2 数据" 的开箱即用范例集。
//
//  这些是最常见的几类"数据录入"节点，直接基于 ros_subscriber_node.hpp 的可复用
//  基类写成 —— 每个节点的有效代码只有几行(一个 evaluate 或 onData)。把它们当
//  模板照抄改消息类型即可。需要真实 ROS2(rclcpp + 对应 msg 包)才能编译。
//
//  注册见 register_ros_nodes 范式(文件末尾注释)。
// ============================================================================
#ifndef BT_ROS2_EXAMPLE_DATA_NODES_HPP
#define BT_ROS2_EXAMPLE_DATA_NODES_HPP

#include "bt_ros2/ros_publisher_node.hpp"
#include "bt_ros2/ros_subscriber_node.hpp"

// 这些是 ROS2 常见标准消息；按需替换成你项目里的消息类型。
#include "sensor_msgs/msg/battery_state.hpp"
#include "sensor_msgs/msg/range.hpp"
#include "std_msgs/msg/bool.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_msgs/msg/string.hpp"

namespace bt_ros2 {

// ───────────────────────────── 用法 A：条件 ─────────────────────────────

/**
 * @brief 障碍物是否在阈值内。订阅 sensor_msgs/Range，range < threshold 则成立。
 *
 * 想加一个自定义端口(threshold)，就覆盖 providedPorts() 合并公共端口。
 *
 * @code{.xml}
 *   <IsObstacleClose topic="/ultrasonic" timeout_ms="500" threshold="0.5"/>
 * @endcode
 */
class IsObstacleClose : public RosConditionNode<sensor_msgs::msg::Range> {
public:
  using RosConditionNode::RosConditionNode;

  static bt_core::PortsList providedPorts() {
    auto ports = subscriberPorts();  // 复用 topic/timeout_ms/qos_depth
    ports.insert(bt_core::InputPort<double>("threshold", "0.5",
                                            "判定为'近'的距离阈值(米)"));
    return ports;
  }

  bool evaluate(const sensor_msgs::msg::Range& msg) override {
    const double threshold = getInput<double>("threshold").value_or(0.5);
    return msg.range < threshold;
  }
};

/**
 * @brief 订阅 std_msgs/Bool，最新值为 true 则条件成立。
 *        等价于手写版 RosTopicConditionNode，但代码只有一行 evaluate。
 *
 * @code{.xml}
 *   <IsFlagTrue topic="/robot/ready" timeout_ms="0"/>
 * @endcode
 */
class IsFlagTrue : public RosConditionNode<std_msgs::msg::Bool> {
public:
  using RosConditionNode::RosConditionNode;
  bool evaluate(const std_msgs::msg::Bool& msg) override { return msg.data; }
};

/**
 * @brief 机器人是否已经到达/占用充电桩。订阅 std_msgs/Bool，true 表示已对接。
 *
 * @code{.xml}
 *   <IsDocked topic="/dock/is_docked" timeout_ms="1000"/>
 * @endcode
 */
class IsDocked : public RosConditionNode<std_msgs::msg::Bool> {
public:
  using RosConditionNode::RosConditionNode;
  bool evaluate(const std_msgs::msg::Bool& msg) override { return msg.data; }
};

// ───────────────────────────── 用法 B：数据录入 ─────────────────────────

/**
 * @brief 读电量并录入黑板。订阅 sensor_msgs/BatteryState，把 percentage 写到
 *        输出端口 level(可在 XML 里重映射到任意黑板 key)。
 *        首帧尚未到达或数据过期时返回 RUNNING，且不调用 onData，
 *        因而不会把缓存中的旧消息重新写入黑板。
 *
 * @code{.xml}
 *   <!-- 把电量录入黑板 key: battery_level，供后续节点 getInput 读取 -->
 *   <ReadBattery topic="/battery" timeout_ms="2000" level="{battery_level}"/>
 * @endcode
 */
class ReadBattery : public RosInputNode<sensor_msgs::msg::BatteryState> {
public:
  using RosInputNode::RosInputNode;

  static bt_core::PortsList providedPorts() {
    auto ports = subscriberPorts();
    ports.insert(bt_core::OutputPort<double>("level", "电量百分比(0~1 或 0~100)"));
    return ports;
  }

  void onData(const sensor_msgs::msg::BatteryState& msg) override {
    setOutput<double>("level", static_cast<double>(msg.percentage));
  }

protected:
  bt_core::NodeStatus onNoFreshData() override {
    return bt_core::NodeStatus::RUNNING;
  }
};

/**
 * @brief 读一个标量并录入黑板。订阅 std_msgs/Float64，把 data 写到端口 value。
 *        通用"传感器读数 → 黑板"录入节点的最小范例。
 *
 * @code{.xml}
 *   <ReadScalar topic="/temperature" timeout_ms="1000" value="{temp}"/>
 * @endcode
 */
class ReadScalar : public RosInputNode<std_msgs::msg::Float64> {
public:
  using RosInputNode::RosInputNode;

  static bt_core::PortsList providedPorts() {
    auto ports = subscriberPorts();
    ports.insert(bt_core::OutputPort<double>("value", "录入黑板的标量值"));
    return ports;
  }

  void onData(const std_msgs::msg::Float64& msg) override {
    setOutput<double>("value", msg.data);
  }
};

// ───────────────────────────── 用法 C：回充动作发布 ───────────────────────

/**
 * @brief 发布回充命令。适合放在“低电量”分支里作为动作节点。
 *
 * 输出消息格式保持简单：`<command>:<target>`，例如
 * `start_recharge:main_dock`。实际项目可把 MsgT 替换成自己的任务消息。
 *
 * @code{.xml}
 *   <PublishRechargeCommand topic="/robot/command"
 *                           command="start_recharge"
 *                           target="main_dock"/>
 * @endcode
 */
class PublishRechargeCommand : public RosOutputNode<std_msgs::msg::String> {
public:
  using RosOutputNode::RosOutputNode;

  static bt_core::PortsList providedPorts() {
    auto ports = publisherPorts();
    ports.insert(bt_core::InputPort<std::string>(
        "command", "start_recharge", "要发布的回充命令"));
    ports.insert(bt_core::InputPort<std::string>(
        "target", "main_dock", "目标充电桩/站点名"));
    return ports;
  }

  bool buildMsg(std_msgs::msg::String& out) override {
    const std::string command =
        getInput<std::string>("command").value_or("start_recharge");
    const std::string target =
        getInput<std::string>("target").value_or("main_dock");
    out.data = command + ":" + target;
    return true;
  }
};

/**
 * @brief 发布任务完成通知。回充完成、巡逻完成等场景可复用。
 *
 * @code{.xml}
 *   <TaskDoneNotifier topic="/bt/task_done" task_name="recharge"/>
 * @endcode
 */
class TaskDoneNotifier : public RosOutputNode<std_msgs::msg::String> {
public:
  using RosOutputNode::RosOutputNode;

  static bt_core::PortsList providedPorts() {
    auto ports = publisherPorts();
    ports.insert(bt_core::InputPort<std::string>(
        "task_name", "recharge", "要上报完成的任务名"));
    return ports;
  }

  bool buildMsg(std_msgs::msg::String& out) override {
    const std::string task =
        getInput<std::string>("task_name").value_or("recharge");
    out.data = "task_done:" + task;
    return true;
  }
};

// ───────────────────────────── 注册范式 ────────────────────────────────
//
//  把这些节点注册进工厂(在你的 bt_ros2 可执行/插件里)：
//
//    void registerRosDataNodes(bt_core::NodeFactory& f) {
//      f.registerNodeType<IsObstacleClose>("IsObstacleClose");
//      f.registerNodeType<IsFlagTrue>("IsFlagTrue");
//      f.registerNodeType<ReadBattery>("ReadBattery");
//      f.registerNodeType<ReadScalar>("ReadScalar");
//      f.registerNodeType<IsDocked>("IsDocked");
//      f.registerNodeType<PublishRechargeCommand>("PublishRechargeCommand");
//      f.registerNodeType<TaskDoneNotifier>("TaskDoneNotifier");
//    }
//
//  BtExecutorNode 在建树前调用它 + setRosNodeHandle(bb, this)，
//  这些节点首次 tick 时就能自动订阅并接收数据。
// ============================================================================

}  // namespace bt_ros2

#endif  // BT_ROS2_EXAMPLE_DATA_NODES_HPP
