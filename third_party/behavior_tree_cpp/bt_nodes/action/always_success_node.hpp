// ============================================================================
//  bt_nodes/action/always_success_node.hpp
//  AlwaysSuccessNode —— 恒成功条件节点。
// ============================================================================
#ifndef BT_NODES_ACTION_ALWAYS_SUCCESS_NODE_HPP
#define BT_NODES_ACTION_ALWAYS_SUCCESS_NODE_HPP

#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 恒成功节点：tick 一律返回 SUCCESS。
 *
 * @note 继承 ConditionNode（瞬时判断，不返回 RUNNING）。
 *       常用于测试桩、占位、或作为 Fallback 的兜底成功分支。
 */
class AlwaysSuccessNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  bt_core::NodeStatus tick() override {
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_ACTION_ALWAYS_SUCCESS_NODE_HPP
