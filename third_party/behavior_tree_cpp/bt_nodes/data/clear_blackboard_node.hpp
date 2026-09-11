// ============================================================================
//  bt_nodes/data/clear_blackboard_node.hpp
//  ClearBlackboardNode —— 从黑板删除某 key 的动作节点。
// ============================================================================
#ifndef BT_NODES_DATA_CLEAR_BLACKBOARD_NODE_HPP
#define BT_NODES_DATA_CLEAR_BLACKBOARD_NODE_HPP

#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 清除黑板键节点：从黑板删除指定 key，恒返回 SUCCESS。
 *
 * 用途：显式失效某缓存数据（如一次交互后清理临时目标）、复位状态标志、
 * 让后续的 BlackboardExists 判定重新变为“不存在”。
 *
 * 实现：bt_core::Blackboard 提供 remove(key)（内部 storage_.erase），本节点直接调用它做“真删除”。
 * erase 对不存在的 key 是无害 no-op，故“清除一个本就不存在的 key”同样返回 SUCCESS
 * （幂等语义：调用后保证该 key 不存在，符合预期）。
 *
 * 端口：
 *  - key (std::string, 输入)：要删除的黑板键名。
 *
 * 边界：
 *  - key 为空：没有可删除的目标键，返回 FAILURE（避免静默无效操作）。
 *
 * @code{.xml}
 *   <ClearBlackboard key="target_pose"/>   <!-- 用完后清理目标缓存 -->
 * @endcode
 */
class ClearBlackboardNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "要从黑板删除的键名"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    const auto bb = blackboard();
    if (!bb) return bt_core::NodeStatus::FAILURE;

    bb->remove(key);  // erase：不存在则 no-op，调用后保证 key 不存在（幂等）
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_CLEAR_BLACKBOARD_NODE_HPP
