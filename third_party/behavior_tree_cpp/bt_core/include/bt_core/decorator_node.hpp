// ============================================================================
//  bt_core/decorator_node.hpp
//  装饰节点基类 —— 恰好包裹 1 个子节点，修改/过滤其行为或返回值。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 显式 halt 无条件向子节点传播，清除跨轮锁存状态
//
//  设计说明：
//    装饰节点用来“给子节点加一层包装”，常见用途：
//      - Inverter : 反转子节点结果(SUCCESS<->FAILURE)。
//      - Retry    : 子节点失败时重试 N 次。
//      - Repeat   : 重复执行子节点 N 次。
//      - Timeout  : 限定子节点执行时间。
//    本基类只负责持有唯一子节点 + 递归 halt，具体逻辑由子类实现。
// ============================================================================
#ifndef BT_CORE_DECORATOR_NODE_HPP
#define BT_CORE_DECORATOR_NODE_HPP

#include <stdexcept>

#include "bt_core/tree_node.hpp"

namespace bt_core {

/**
 * @brief 装饰节点基类：管理唯一的子节点。
 */
class DecoratorNode : public TreeNode {
public:
  using TreeNode::TreeNode;

  NodeType type() const override final { return NodeType::DECORATOR; }

  /**
   * @brief 设置(唯一)子节点。
   * @throws std::logic_error 若重复设置子节点。
   */
  void setChild(TreeNode::Ptr child) {
    if (child_) {
      throw std::logic_error("DecoratorNode '" + name() +
                             "' 只能有一个子节点");
    }
    child_ = std::move(child);
  }

  /// @brief 访问子节点(可能为空)。
  const TreeNode::Ptr& child() const { return child_; }

  /// @brief 递归中止子节点并复位自身。
  void halt() override {
    if (child_ && child_->needsHalt()) {
      child_->halt();
    }
    if (child_) {
      child_->setStatus(NodeStatus::IDLE);
    }
    markHalted();
    setStatus(NodeStatus::IDLE);
  }

protected:
  TreeNode::Ptr child_;
};

}  // namespace bt_core

#endif  // BT_CORE_DECORATOR_NODE_HPP
