// ============================================================================
//  bt_nodes/decorator/force_failure_node.hpp
//  ForceFailureNode —— 强制失败装饰节点。
// ============================================================================
#ifndef BT_NODES_DECORATOR_FORCE_FAILURE_NODE_HPP
#define BT_NODES_DECORATOR_FORCE_FAILURE_NODE_HPP

#include "bt_core/decorator_node.hpp"

namespace bt_nodes {

/**
 * @brief 强制失败节点：无论子节点 SUCCESS/FAILURE 都返回 FAILURE，RUNNING 透传。
 *
 * 语义：
 *  - 子节点 RUNNING → 本节点 RUNNING（异步尚未结束，不强转）。
 *  - 子节点 SUCCESS/FAILURE/IDLE → 本节点 FAILURE。
 *  - 无子节点 → FAILURE。
 *
 * @note 与 ForceSuccessNode 对称，常用于在 Fallback 中“占位但不让其提前成功”。
 */
class ForceFailureNode : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    if (child()->executeTick() == bt_core::NodeStatus::RUNNING) {
      return bt_core::NodeStatus::RUNNING;
    }
    return bt_core::NodeStatus::FAILURE;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DECORATOR_FORCE_FAILURE_NODE_HPP
