// ============================================================================
//  bt_nodes/decorator/inverter_node.hpp
//  InverterNode —— 反转装饰节点。
// ============================================================================
#ifndef BT_NODES_DECORATOR_INVERTER_NODE_HPP
#define BT_NODES_DECORATOR_INVERTER_NODE_HPP

#include "bt_core/decorator_node.hpp"

namespace bt_nodes {

/**
 * @brief 反转节点：把子节点的 SUCCESS/FAILURE 互换，RUNNING 透传。
 *
 * 语义：
 *  - 子节点 SUCCESS → 本节点 FAILURE。
 *  - 子节点 FAILURE → 本节点 SUCCESS。
 *  - 子节点 RUNNING → 本节点 RUNNING（异步透传，不反转）。
 *  - 无子节点 → 视为配置错误，返回 FAILURE。
 *
 * @note 常用于“条件取反”：把一个返回真的条件包成返回假。
 */
class InverterNode : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    switch (child()->executeTick()) {
      case bt_core::NodeStatus::SUCCESS:
        return bt_core::NodeStatus::FAILURE;
      case bt_core::NodeStatus::FAILURE:
        return bt_core::NodeStatus::SUCCESS;
      case bt_core::NodeStatus::RUNNING:
        return bt_core::NodeStatus::RUNNING;
      case bt_core::NodeStatus::IDLE:
      default:
        return bt_core::NodeStatus::FAILURE;
    }
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DECORATOR_INVERTER_NODE_HPP
