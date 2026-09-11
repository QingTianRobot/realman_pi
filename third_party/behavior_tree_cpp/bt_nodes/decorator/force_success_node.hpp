// ============================================================================
//  bt_nodes/decorator/force_success_node.hpp
//  ForceSuccessNode —— 强制成功装饰节点。
// ============================================================================
#ifndef BT_NODES_DECORATOR_FORCE_SUCCESS_NODE_HPP
#define BT_NODES_DECORATOR_FORCE_SUCCESS_NODE_HPP

#include "bt_core/decorator_node.hpp"

namespace bt_nodes {

/**
 * @brief 强制成功节点：无论子节点 SUCCESS/FAILURE 都返回 SUCCESS，RUNNING 透传。
 *
 * 语义：
 *  - 子节点 RUNNING → 本节点 RUNNING（异步尚未结束，不强转）。
 *  - 子节点 SUCCESS/FAILURE/IDLE → 本节点 SUCCESS。
 *  - 无子节点 → SUCCESS（什么都不做也算成功）。
 *
 * @note 常用于“可选步骤”：即使该子树失败，也不影响父 Sequence 继续往下走。
 */
class ForceSuccessNode : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::SUCCESS;
    }
    if (child()->executeTick() == bt_core::NodeStatus::RUNNING) {
      return bt_core::NodeStatus::RUNNING;
    }
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DECORATOR_FORCE_SUCCESS_NODE_HPP
