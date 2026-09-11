// ============================================================================
//  bt_nodes/control/fallback_node.hpp
//  FallbackNode —— 选择控制节点（“或”语义）。
// ============================================================================
#ifndef BT_NODES_CONTROL_FALLBACK_NODE_HPP
#define BT_NODES_CONTROL_FALLBACK_NODE_HPP

#include "bt_core/control_node.hpp"

namespace bt_nodes {

/**
 * @brief 选择节点（Fallback / Selector）：从左到右依次尝试，**遇第一个成功即成功**。
 *
 * 语义（有状态实现，对称于 SequenceNode）：
 *  - 从游标开始依次 tick 子节点。
 *  - 子节点 SUCCESS：整体立即 SUCCESS，halt 其余并复位游标。
 *  - 子节点 FAILURE：游标前移，尝试下一个候选。
 *  - 子节点 RUNNING：整体 RUNNING，保留游标，下一拍续跑该子节点。
 *  - 所有子节点都 FAILURE：整体 FAILURE 并复位游标。
 *
 * @note 典型用途：实现“优先级行为选择”——先试最优方案，失败则退而求其次。
 */
class FallbackNode : public bt_core::ControlNode {
 public:
  using bt_core::ControlNode::ControlNode;

  bt_core::NodeStatus tick() override {
    // 无子节点的选择 = 没有任何可成功的候选 → FAILURE。
    if (childrenCount() == 0) {
      return bt_core::NodeStatus::FAILURE;
    }

    while (current_child_idx_ < children_.size()) {
      auto& child = children_[current_child_idx_];
      const bt_core::NodeStatus child_status = child->executeTick();

      switch (child_status) {
        case bt_core::NodeStatus::RUNNING:
          return bt_core::NodeStatus::RUNNING;

        case bt_core::NodeStatus::SUCCESS:
          // 找到第一个成功的候选 → 选择成功。
          haltChildren();
          current_child_idx_ = 0;
          return bt_core::NodeStatus::SUCCESS;

        case bt_core::NodeStatus::FAILURE:
          // 当前候选失败，尝试下一个。
          ++current_child_idx_;
          break;

        case bt_core::NodeStatus::IDLE:
          // tick 后停留 IDLE 视为异常 → 按当前候选失败继续尝试下一个。
          ++current_child_idx_;
          break;
      }
    }

    // 所有候选都失败 → 选择失败，复位游标。
    current_child_idx_ = 0;
    return bt_core::NodeStatus::FAILURE;
  }

  void halt() override {
    current_child_idx_ = 0;
    bt_core::ControlNode::halt();
  }

 private:
  size_t current_child_idx_{0};  ///< 当前尝试的候选子节点游标
};

}  // namespace bt_nodes

#endif  // BT_NODES_CONTROL_FALLBACK_NODE_HPP
