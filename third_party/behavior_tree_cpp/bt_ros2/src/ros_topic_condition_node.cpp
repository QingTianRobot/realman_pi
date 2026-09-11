// ============================================================================
//  bt_ros2/src/ros_topic_condition_node.cpp
//  RosTopicConditionNode 的实现。
// ============================================================================
#include "bt_ros2/ros_topic_condition_node.hpp"

#include "bt_ros2/ros_blackboard_keys.hpp"

namespace bt_ros2 {

void RosTopicConditionNode::ensureSubscription() {
  // 已建立订阅则直接返回（只在首次 tick 创建一次）。
  if (sub_) {
    return;
  }

  // 从黑板取出 BtExecutorNode 注入的 ROS 句柄（缺失会抛出明确错误）。
  rclcpp::Node* ros_node = getRosNodeHandle(blackboard());

  // 读取端口 "topic"；未配置时用端口默认值。
  resolved_topic_ = getInput<std::string>("topic").value_or("/bt/condition");

  // 创建订阅：回调里只缓存最新值，tick 时再消费（解耦 ROS 回调与树调度）。
  sub_ = ros_node->create_subscription<std_msgs::msg::Bool>(
      resolved_topic_, rclcpp::QoS(10),
      [this](const std_msgs::msg::Bool::SharedPtr msg) {
        has_msg_    = true;
        last_value_ = msg->data;
      });

  RCLCPP_INFO(ros_node->get_logger(),
              "[%s] 订阅条件 topic: %s", name().c_str(),
              resolved_topic_.c_str());
}

bt_core::NodeStatus RosTopicConditionNode::tick() {
  ensureSubscription();

  // 尚未收到任何消息：用 "default" 端口决定回退结果。
  if (!has_msg_) {
    const std::string fallback =
        getInput<std::string>("default").value_or("false");
    return (fallback == "true" || fallback == "1")
               ? bt_core::NodeStatus::SUCCESS
               : bt_core::NodeStatus::FAILURE;
  }

  // 已有最新值：true → 条件成立(SUCCESS)，false → 不成立(FAILURE)。
  return last_value_ ? bt_core::NodeStatus::SUCCESS
                     : bt_core::NodeStatus::FAILURE;
}

}  // namespace bt_ros2
