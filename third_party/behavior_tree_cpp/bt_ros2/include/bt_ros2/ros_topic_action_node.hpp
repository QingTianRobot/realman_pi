// ============================================================================
//  bt_ros2/ros_topic_action_node.hpp
//  RosTopicActionNode —— 把“向 ROS2 topic 发布一条消息”桥接成 bt_core 动作节点。
//
//  职责：
//    tick 时向一个 std_msgs/msg/String topic 发布一条消息，发布成功返回 SUCCESS。
//    这是一个**同步动作**示例：单拍即完成，不返回 RUNNING。
//
//  设计要点：
//    - 继承 bt_core::ActionNode（动作可同步可异步；此处为最简单的同步发布）。
//    - providedPorts()：
//        topic   (input) 要发布到的 topic 名
//        message (input) 要发布的字符串内容（可被重映射到黑板 key，如 "{greeting}"）
//    - publisher 同样惰性创建（首次 tick 才能拿到 ROS 句柄）。
//
//  关于“异步动作”的说明（见 .cpp 末尾注释）：
//    若要桥接 ROS2 Action / 长耗时服务，应在首拍发起请求并返回 RUNNING，
//    后续拍轮询 future/回调结果，完成时返回 SUCCESS/FAILURE，并在 onHalted() 取消。
//    这里给出最常见的“发一条 topic 即成功”的范式，保持示例聚焦、易读。
// ============================================================================
#ifndef BT_ROS2_ROS_TOPIC_ACTION_NODE_HPP
#define BT_ROS2_ROS_TOPIC_ACTION_NODE_HPP

#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "bt_core/node_status.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

namespace bt_ros2 {

/**
 * @brief 向 String topic 发布一条消息的动作节点（同步，单拍完成）。
 *
 * @code{.xml}
 *   <RosTopicAction topic="/bt/chatter" message="hello from behavior tree"/>
 * @endcode
 */
class RosTopicActionNode : public bt_core::ActionNode {
public:
  using bt_core::ActionNode::ActionNode;  // 继承 (std::string, NodeConfig) 构造

  /// @brief 声明端口。
  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("topic", "/bt/chatter",
                                        "要发布到的 std_msgs/String topic 名"),
        bt_core::InputPort<std::string>("message", "hello",
                                        "要发布的消息内容(可用 {key} 从黑板取)"));
  }

  /// @brief 发布一条消息，成功即返回 SUCCESS。
  bt_core::NodeStatus tick() override;

private:
  /// @brief 惰性初始化发布器（首次 tick 时调用）。
  void ensurePublisher();

  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr pub_;  ///< topic 发布器
  std::string resolved_topic_;  ///< 实际发布的 topic 名（首次 tick 时解析）
};

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_TOPIC_ACTION_NODE_HPP
