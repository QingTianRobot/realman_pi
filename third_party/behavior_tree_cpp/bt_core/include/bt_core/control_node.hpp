// ============================================================================
//  bt_core/control_node.hpp
//  控制节点基类 —— 拥有 N 个子节点，决定子节点的执行顺序与组合逻辑。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 显式 halt 深度复位全部子树，和拍内分支清理分离
//
//  设计说明：
//    控制节点是行为树的“流程控制”。它本身不干活，而是按某种策略调度子节点：
//      - Sequence : 依次执行子节点，全部 SUCCESS 才 SUCCESS；遇 FAILURE 立即 FAILURE。
//      - Fallback : 依次尝试子节点，遇第一个 SUCCESS 即 SUCCESS；全 FAILURE 才 FAILURE。
//      - Parallel : 并发(逻辑上)tick 所有子节点，按阈值判定成功/失败。
//    具体策略由子类实现，本基类只负责持有子节点 + 提供递归 halt。
// ============================================================================
#ifndef BT_CORE_CONTROL_NODE_HPP
#define BT_CORE_CONTROL_NODE_HPP

#include <vector>

#include "bt_core/tree_node.hpp"

namespace bt_core {

/**
 * @brief 控制节点基类：管理一个有序的子节点列表。
 */
class ControlNode : public TreeNode {
public:
  using TreeNode::TreeNode;

  NodeType type() const override final { return NodeType::CONTROL; }

  /// @brief 追加一个子节点(构建树时调用)。
  void addChild(TreeNode::Ptr child) { children_.push_back(std::move(child)); }

  /// @brief 子节点数量。
  size_t childrenCount() const { return children_.size(); }

  /// @brief 只读访问子节点列表(序列化/可视化遍历用)。
  const std::vector<TreeNode::Ptr>& children() const { return children_; }

  /**
   * @brief 递归中止所有子节点并复位自身。
   * @details 显式 halt 是整轮复位边界；needsHalt() 不依赖公开状态，因此能
   *          穿过被父节点标成 IDLE 的包装节点，又不会触达从未执行的叶节点。
   */
  void halt() override {
    for (auto& child : children_) {
      if (child->needsHalt()) {
        child->halt();
      }
      child->setStatus(NodeStatus::IDLE);
    }
    markHalted();
    setStatus(NodeStatus::IDLE);
  }

  /// @brief 拍内清理 [start, end)：中止 RUNNING，终态只复位公开状态。
  void haltChildren(size_t start = 0) {
    for (size_t i = start; i < children_.size(); ++i) {
      if (children_[i]->status() == NodeStatus::RUNNING) {
        children_[i]->halt();
      }
      children_[i]->setStatus(NodeStatus::IDLE);
    }
  }

protected:
  std::vector<TreeNode::Ptr> children_;
};

}  // namespace bt_core

#endif  // BT_CORE_CONTROL_NODE_HPP
