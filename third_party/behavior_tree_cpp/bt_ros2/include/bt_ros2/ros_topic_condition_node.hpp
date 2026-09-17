// ============================================================================
//  bt_ros2/ros_topic_condition_node.hpp
//  RosTopicConditionNode —— 把“ROS2 topic 的最新值”桥接成 bt_core 条件节点。
//
//  职责：
//    订阅一个 std_msgs/msg/Bool topic，把它的最新值映射成行为树的条件结果：
//      - 最近一次收到的 data == true   → SUCCESS
//      - 最近一次收到的 data == false  → FAILURE
//      - 从未收到过消息                → 由端口 `default` 决定（默认 FAILURE）
//
//  设计要点（与 API_CONTRACT.md 对齐）：
//    - 继承 bt_core::ConditionNode：只返回 SUCCESS / FAILURE，绝不 RUNNING。
//    - 用 `using ConditionNode::ConditionNode` 继承 (std::string, NodeConfig) 构造。
//    - providedPorts() 声明端口，供编辑器枚举：
//        topic   (input)  要订阅的 topic 名
//        default (input)  尚无消息时的回退结果（"true"/"false"）
//    - 订阅在“首次 tick”惰性创建：因为工厂构造节点时拿不到 ROS 句柄，
//      句柄是在 BtExecutorNode 建树后才存进黑板的（见 ros_blackboard_keys.hpp）。
// ============================================================================
#ifndef BT_ROS2_ROS_TOPIC_CONDITION_NODE_HPP
#define BT_ROS2_ROS_TOPIC_CONDITION_NODE_HPP

#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "bt_core/node_status.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/bool.hpp"

namespace bt_ros2 {

/**
 * @brief 订阅 Bool topic 并据其最新值返回 SUCCESS/FAILURE 的条件节点。
 *
 * @code{.xml}
 *   <!-- 当 /robot/ready 最近一次为 true 时该条件成立 -->
 *   <RosTopicCondition topic="/robot/ready" default="false"/>
 * @endcode
 */
class RosTopicConditionNode : public bt_core::ConditionNode {
public:
  using bt_core::ConditionNode::ConditionNode;  // 继承 (std::string, NodeConfig) 构造

  /// @brief 声明端口（供 bt_server /nodes 枚举 + 编辑器渲染）。
  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("topic", "/bt/condition",
                                        "要订阅的 std_msgs/Bool topic 名"),
        bt_core::InputPort<std::string>("default", "false",
                                        "尚未收到任何消息时的回退结果(true/false)"));
  }

  /// @brief 条件判断：把最新 topic 值映射为 SUCCESS/FAILURE。
  bt_core::NodeStatus tick() override;

private:
  /// @brief 惰性初始化订阅（首次 tick 时调用，拿到 ROS 句柄后建立订阅）。
  void ensureSubscription();

  rclcpp::Subscription<std_msgs::msg::Bool>::SharedPtr sub_;  ///< topic 订阅
  bool        has_msg_{false};   ///< 是否至少收到过一条消息
  bool        last_value_{false};///< 最近一次收到的 data
  std::string resolved_topic_;   ///< 实际订阅的 topic 名（首次 tick 时解析）
};

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_TOPIC_CONDITION_NODE_HPP
