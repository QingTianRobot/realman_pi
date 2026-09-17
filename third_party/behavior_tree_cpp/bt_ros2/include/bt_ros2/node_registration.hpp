// ============================================================================
//  bt_ros2/node_registration.hpp
//  ROS2 执行器默认节点注册器 —— public header 只暴露注册入口，不泄漏 bt_nodes
//  内部头文件依赖。具体节点类型在 src/node_registration.cpp 中注册。
// ============================================================================
#ifndef BT_ROS2_NODE_REGISTRATION_HPP
#define BT_ROS2_NODE_REGISTRATION_HPP

#include <mutex>
#include <vector>

#include "bt_core/node_factory.hpp"

namespace bt_ros2 {

using NodeRegistrationFn = void (*)(bt_core::NodeFactory&);

void registerBtNodes(bt_core::NodeFactory& factory);
void registerRosTopicNodes(bt_core::NodeFactory& factory);
void registerRosDataNodes(bt_core::NodeFactory& factory);
void registerRechargeNodes(bt_core::NodeFactory& factory);
void registerDefaultNodes(bt_core::NodeFactory& factory);

class NodeRegistrationCatalog {
 public:
  static NodeRegistrationCatalog& instance();

  NodeRegistrationCatalog(const NodeRegistrationCatalog&) = delete;
  NodeRegistrationCatalog& operator=(const NodeRegistrationCatalog&) = delete;

  void add(NodeRegistrationFn fn);
  std::vector<NodeRegistrationFn> snapshot() const;
  void resetToDefaults();

 private:
  NodeRegistrationCatalog();

  mutable std::mutex mutex_;
  std::vector<NodeRegistrationFn> registrations_;
};

}  // namespace bt_ros2

#endif  // BT_ROS2_NODE_REGISTRATION_HPP
