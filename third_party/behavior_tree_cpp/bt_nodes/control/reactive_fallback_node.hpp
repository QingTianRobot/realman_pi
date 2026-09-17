// ============================================================================
//  bt_nodes/control/reactive_fallback_node.hpp
//  ReactiveFallbackNode —— 每拍从第一个子节点重新评估的选择控制节点。
// ============================================================================
#ifndef BT_NODES_CONTROL_REACTIVE_FALLBACK_NODE_HPP
#define BT_NODES_CONTROL_REACTIVE_FALLBACK_NODE_HPP

#include <optional>

#include "bt_core/control_node.hpp"

namespace bt_nodes {

/**
 * @brief 每拍重新评估优先级的选择节点。
 *
 * 失败的候选会让遍历继续到下一个候选；RUNNING 或 SUCCESS 立即选中当前
 * 候选。已运行候选不会仅因重新探测较高优先级候选而提前 halt；一旦它自己
 * 返回 FAILURE，便在尝试后续候选前 halt。
 */
class ReactiveFallbackNode : public bt_core::ControlNode {
 public:
  using bt_core::ControlNode::ControlNode;

  bt_core::NodeStatus tick() override {
    for (size_t index = 0; index < children_.size(); ++index) {
      const bt_core::NodeStatus child_status = children_[index]->executeTick();
      switch (child_status) {
        case bt_core::NodeStatus::FAILURE:
        case bt_core::NodeStatus::IDLE:
          haltPreviouslyRunningFailure(index);
          continue;

        case bt_core::NodeStatus::RUNNING:
          haltPreviousRunningChild(index);
          running_child_index_ = index;
          return bt_core::NodeStatus::RUNNING;

        case bt_core::NodeStatus::SUCCESS:
          haltChildren();
          running_child_index_.reset();
          return bt_core::NodeStatus::SUCCESS;
      }
    }

    running_child_index_.reset();
    return bt_core::NodeStatus::FAILURE;
  }

  void halt() override {
    running_child_index_.reset();
    bt_core::ControlNode::halt();
  }

 private:
  void haltPreviouslyRunningFailure(size_t failed_index) {
    if (!running_child_index_ || *running_child_index_ != failed_index) {
      return;
    }
    auto& failed_child = children_[failed_index];
    failed_child->halt();
    failed_child->setStatus(bt_core::NodeStatus::IDLE);
    running_child_index_.reset();
  }

  void haltPreviousRunningChild(size_t replacement_index) {
    if (!running_child_index_ || *running_child_index_ == replacement_index) {
      return;
    }
    auto& previous_child = children_[*running_child_index_];
    previous_child->halt();
    previous_child->setStatus(bt_core::NodeStatus::IDLE);
  }

  std::optional<size_t> running_child_index_;
};

}  // namespace bt_nodes

#endif  // BT_NODES_CONTROL_REACTIVE_FALLBACK_NODE_HPP
