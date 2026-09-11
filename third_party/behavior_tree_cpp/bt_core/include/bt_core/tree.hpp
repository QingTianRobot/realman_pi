// ============================================================================
//  bt_core/tree.hpp
//  Tree —— 行为树容器，持有根节点 + 共享黑板，提供统一的 tick 调度入口。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): halt 仅触达本轮执行过的根节点，保证空树与重复停止幂等
//
//  设计说明：
//    Tree 是“一棵可执行的行为树”的运行期载体：
//      - 持有 root_ 根节点与共享 blackboard_。
//      - tickOnce()        : 从根执行一拍。
//      - tickWhileRunning(): 循环 tick 直到根返回非 RUNNING(同步场景便捷入口)。
//      - 给所有节点统一分配 id 并挂状态回调，便于 bt_server 推送运行态。
//      - visitNodes()      : 深度优先遍历，用于序列化与可视化。
// ============================================================================
#ifndef BT_CORE_TREE_HPP
#define BT_CORE_TREE_HPP

#include <cstdint>
#include <functional>
#include <memory>
#include <vector>

#include "bt_core/control_node.hpp"
#include "bt_core/decorator_node.hpp"
#include "bt_core/tree_node.hpp"

namespace bt_core {

class Tree {
public:
  Tree() = default;

  /**
   * @param root 根节点
   * @param blackboard 共享黑板(通常与构建节点时用的是同一个)
   */
  Tree(TreeNode::Ptr root, Blackboard::Ptr blackboard)
      : root_(std::move(root)), blackboard_(std::move(blackboard)) {
    assignIdsAndCollect();
  }

  /// @brief 根节点(可能为空)。
  const TreeNode::Ptr& root() const { return root_; }

  /// @brief 共享黑板。
  Blackboard::Ptr blackboard() const { return blackboard_; }

  /**
   * @brief 从根执行一拍。
   * @return 根节点状态；树为空时返回 IDLE。
   */
  NodeStatus tickOnce() {
    if (!root_) return NodeStatus::IDLE;
    return root_->executeTick();
  }

  /**
   * @brief 循环 tick 直到根返回非 RUNNING(SUCCESS / FAILURE)。
   * @param max_iterations 安全上限，防止异步节点逻辑错误导致死循环。
   * @return 终结状态；超过上限仍 RUNNING 时返回 RUNNING。
   */
  NodeStatus tickWhileRunning(int max_iterations = 1000000) {
    if (!root_) return NodeStatus::IDLE;
    NodeStatus status = NodeStatus::IDLE;
    for (int i = 0; i < max_iterations; ++i) {
      status = root_->executeTick();
      if (status != NodeStatus::RUNNING) {
        return status;
      }
    }
    return status;
  }

  /// @brief 中止整棵树(递归 halt 根)。
  void halt() {
    if (root_ && root_->needsHalt()) {
      root_->halt();
    }
  }

  /**
   * @brief 给所有节点统一设置状态变化回调(bt_server 用它推送运行态)。
   */
  void setStatusCallback(StatusChangeCallback cb) {
    for (auto& node : nodes_) {
      node->setStatusCallback(cb);
    }
  }

  /// @brief 扁平化的全部节点列表(已按遍历顺序分配 id)。
  const std::vector<TreeNode::Ptr>& nodes() const { return nodes_; }

  /**
   * @brief 深度优先遍历整棵树。
   * @param visitor 回调(node, depth)
   */
  void visitNodes(
      const std::function<void(const TreeNode::Ptr&, int depth)>& visitor) const {
    if (root_) visitRecursive(root_, 0, visitor);
  }

private:
  /// @brief 遍历分配 id + 收集扁平节点列表。
  void assignIdsAndCollect() {
    nodes_.clear();
    uint16_t next_id = 1;
    visitNodes([&](const TreeNode::Ptr& node, int) {
      node->setId(next_id++);
      nodes_.push_back(node);
    });
  }

  static void visitRecursive(
      const TreeNode::Ptr& node, int depth,
      const std::function<void(const TreeNode::Ptr&, int)>& visitor) {
    visitor(node, depth);
    // 控制节点：遍历全部子节点
    if (auto* ctrl = dynamic_cast<ControlNode*>(node.get())) {
      for (const auto& child : ctrl->children()) {
        visitRecursive(child, depth + 1, visitor);
      }
    } else if (auto* deco = dynamic_cast<DecoratorNode*>(node.get())) {
      // 装饰节点：遍历唯一子节点
      if (deco->child()) {
        visitRecursive(deco->child(), depth + 1, visitor);
      }
    }
    // 叶子节点：无子节点，递归终止
  }

  TreeNode::Ptr              root_;
  Blackboard::Ptr            blackboard_;
  std::vector<TreeNode::Ptr> nodes_;
};

}  // namespace bt_core

#endif  // BT_CORE_TREE_HPP
