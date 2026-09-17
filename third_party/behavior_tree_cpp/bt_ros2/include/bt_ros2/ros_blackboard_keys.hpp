// ============================================================================
//  bt_ros2/ros_blackboard_keys.hpp
//  ROS ↔ bt_core 的“桥接约定” —— 通过黑板传递 ROS 节点句柄。
//
//  为什么需要这个文件：
//    bt_core 的工厂只用 `make_shared<T>(name, NodeConfig)` 这一个签名构造节点
//   （见 node_factory.hpp 的 registerNodeType）。也就是说：
//      - 适配器节点（RosTopicConditionNode / RosTopicActionNode）在被工厂创建时
//        **拿不到** rclcpp::Node 的指针，只能拿到“实例名 + NodeConfig（含黑板）”。
//
//    解决办法（保持 bt_core 零 ROS 依赖的前提下解耦）：
//      BtExecutorNode 在加载行为树前，先把自己（rclcpp::Node*）以一个**非拥有
//      裸指针**的形式塞进共享黑板的一个约定 key。适配器节点在第一次 tick 时再
//      从黑板把这个指针取出来，用它去 create_subscription / create_publisher。
//
//  为什么用裸指针而不是 shared_ptr：
//    BtExecutorNode 拥有 Tree，Tree 拥有 Blackboard。如果再把节点的 shared_ptr
//    存进黑板，就会形成 node → tree → blackboard → node 的**循环引用**，导致节点
//    永远不析构（内存泄漏）。节点的生命周期天然长于它持有的树，所以这里用裸
//    指针（不参与引用计数）是安全且正确的。
// ============================================================================
#ifndef BT_ROS2_ROS_BLACKBOARD_KEYS_HPP
#define BT_ROS2_ROS_BLACKBOARD_KEYS_HPP

#include <stdexcept>
#include <string>

#include "bt_core/blackboard.hpp"

// 前置声明，避免本头文件强行 #include rclcpp（让纯逻辑代码也能轻量包含本头）。
namespace rclcpp {
class Node;
}

namespace bt_ros2 {

/// @brief 黑板里存放 rclcpp::Node* 的约定 key。下划线前缀表示“框架内部保留键”，
///        与用户端口名（如 "topic"/"message"）区分，避免命名冲突。
inline constexpr char kRosNodeBlackboardKey[] = "__bt_ros2_node_handle__";

/**
 * @brief 把 ROS 节点裸指针写入黑板（由 BtExecutorNode 在建树前调用一次）。
 * @param bb   共享黑板（必须与建树时传给 XmlParser 的是同一个）。
 * @param node ROS 节点裸指针（非拥有，不参与引用计数）。
 */
inline void setRosNodeHandle(const bt_core::Blackboard::Ptr& bb, rclcpp::Node* node) {
  bb->set<rclcpp::Node*>(kRosNodeBlackboardKey, node);
}

/**
 * @brief 从黑板取出 ROS 节点裸指针（由适配器节点在 tick 时调用）。
 * @throws std::runtime_error 若 key 不存在（说明该节点不是被 BtExecutorNode 装载，
 *         或建树时用了不同的黑板）—— 显式抛错比解空指针更利于排查。
 */
inline rclcpp::Node* getRosNodeHandle(const bt_core::Blackboard::Ptr& bb) {
  auto handle = bb->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!handle.has_value() || handle.value() == nullptr) {
    throw std::runtime_error(
        "bt_ros2: 黑板中未找到 ROS 节点句柄(key='" +
        std::string(kRosNodeBlackboardKey) +
        "')。ROS 适配器节点必须由 BtExecutorNode 装载，且建树时需复用同一个黑板。");
  }
  return handle.value();
}

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_BLACKBOARD_KEYS_HPP
