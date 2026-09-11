// ============================================================================
//  bt_ros2/src/ros_topic_action_node.cpp
//  RosTopicActionNode 的实现。
// ============================================================================
#include "bt_ros2/ros_topic_action_node.hpp"

#include "bt_ros2/ros_blackboard_keys.hpp"

namespace bt_ros2 {

void RosTopicActionNode::ensurePublisher() {
  if (pub_) {
    return;
  }

  rclcpp::Node* ros_node = getRosNodeHandle(blackboard());

  resolved_topic_ = getInput<std::string>("topic").value_or("/bt/chatter");

  pub_ = ros_node->create_publisher<std_msgs::msg::String>(
      resolved_topic_, rclcpp::QoS(10));

  RCLCPP_INFO(ros_node->get_logger(),
              "[%s] 创建动作发布器 topic: %s", name().c_str(),
              resolved_topic_.c_str());
}

bt_core::NodeStatus RosTopicActionNode::tick() {
  ensurePublisher();

  // 读取要发布的消息内容；端口值可在 XML 里写字面量或 {key} 重映射到黑板。
  std_msgs::msg::String msg;
  msg.data = getInput<std::string>("message").value_or("hello");

  pub_->publish(msg);

  // 同步动作：发布即视为完成，单拍返回 SUCCESS（不返回 RUNNING）。
  return bt_core::NodeStatus::SUCCESS;
}

// ---------------------------------------------------------------------------
//  扩展提示：如何把这个同步动作改造成桥接 ROS2 Action 的异步动作
// ---------------------------------------------------------------------------
//  1. 首次 tick：用 rclcpp_action::Client 发送 goal，保存 goal future，返回 RUNNING。
//  2. 后续 tick：检查 future / 结果回调是否就绪；
//       - 未就绪          → 返回 RUNNING
//       - 成功            → 返回 SUCCESS
//       - 失败/被拒/取消  → 返回 FAILURE
//  3. 重写 onHalted()：调用 client 的 async_cancel_goal() 取消未完成的 goal。
//  这样就实现了“一个长耗时 ROS2 Action = 一个异步 BT Action 节点”的标准范式。
//  本文件保持最简同步发布范式，便于阅读；rclcpp_action 已在 package.xml 声明依赖。

}  // namespace bt_ros2
