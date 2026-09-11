// ============================================================================
//  bt_nodes/control/sequence_node.hpp
//  SequenceNode —— 顺序控制节点（“与”语义）。
// ============================================================================
#ifndef BT_NODES_CONTROL_SEQUENCE_NODE_HPP
#define BT_NODES_CONTROL_SEQUENCE_NODE_HPP

#include "bt_core/control_node.hpp"

namespace bt_nodes {

/**
 * @brief 顺序节点：从左到右依次执行子节点，**全部成功才成功**。
 *
 * 语义（与 BehaviorTree.CPP 的有状态 Sequence 一致）：
 *  - 从当前游标 current_child_idx_ 开始，依次 executeTick 子节点。
 *  - 子节点返回 SUCCESS：游标前移，继续 tick 下一个。
 *  - 子节点返回 FAILURE：整体立即返回 FAILURE，并 halt 其余子节点、复位游标。
 *  - 子节点返回 RUNNING：整体返回 RUNNING，**保留游标**，下一拍从该子节点续跑
 *    （这正是“有状态”的关键：异步子节点不会每拍都从头重启）。
 *  - 所有子节点都 SUCCESS：整体返回 SUCCESS 并复位游标。
 *
 * @note 之所以用有状态实现，是因为子节点可能是异步 Action（返回 RUNNING）。
 *       若每拍从头重 tick，已完成的子节点会被反复执行，语义错误。
 */
class SequenceNode : public bt_core::ControlNode {
 public:
  using bt_core::ControlNode::ControlNode;  // 继承构造 (std::string, NodeConfig)

  bt_core::NodeStatus tick() override {
    // 空节点视为直接成功（无子节点的顺序 = 真）。
    if (childrenCount() == 0) {
      return bt_core::NodeStatus::SUCCESS;
    }

    // 从游标位置继续推进；children_ 是基类受保护成员。
    while (current_child_idx_ < children_.size()) {
      auto& child = children_[current_child_idx_];
      const bt_core::NodeStatus child_status = child->executeTick();

      switch (child_status) {
        case bt_core::NodeStatus::RUNNING:
          // 异步子节点未完成：保留游标，整体 RUNNING。
          return bt_core::NodeStatus::RUNNING;

        case bt_core::NodeStatus::FAILURE:
          // 任一子节点失败 → 顺序失败。中止其余并复位。
          haltChildren();
          current_child_idx_ = 0;
          return bt_core::NodeStatus::FAILURE;

        case bt_core::NodeStatus::SUCCESS:
          // 当前子节点成功，推进到下一个。
          ++current_child_idx_;
          break;

        case bt_core::NodeStatus::IDLE:
          // 子节点 tick 后不应停留在 IDLE，视为逻辑错误 → 当失败处理。
          haltChildren();
          current_child_idx_ = 0;
          return bt_core::NodeStatus::FAILURE;
      }
    }

    // 跑完所有子节点且无失败 → 顺序成功，复位游标供下次重跑。
    current_child_idx_ = 0;
    return bt_core::NodeStatus::SUCCESS;
  }

  /// @brief 中止：复位游标后递归 halt 子节点（复用基类逻辑）。
  void halt() override {
    current_child_idx_ = 0;
    bt_core::ControlNode::halt();
  }

 private:
  size_t current_child_idx_{0};  ///< 当前正在执行的子节点游标（有状态）
};

}  // namespace bt_nodes

#endif  // BT_NODES_CONTROL_SEQUENCE_NODE_HPP
