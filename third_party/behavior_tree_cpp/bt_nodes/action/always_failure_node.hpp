// ============================================================================
//  bt_nodes/action/always_failure_node.hpp
//  AlwaysFailureNode —— 恒失败条件节点。
// ============================================================================
#ifndef BT_NODES_ACTION_ALWAYS_FAILURE_NODE_HPP
#define BT_NODES_ACTION_ALWAYS_FAILURE_NODE_HPP

#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 恒失败节点：tick 一律返回 FAILURE。
 *
 * @note 继承 ConditionNode（瞬时判断，不返回 RUNNING）。
 *       常用于测试 Sequence 的失败分支、或强制走 Fallback 的下一候选。
 */
class AlwaysFailureNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  bt_core::NodeStatus tick() override {
    return bt_core::NodeStatus::FAILURE;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_ACTION_ALWAYS_FAILURE_NODE_HPP
