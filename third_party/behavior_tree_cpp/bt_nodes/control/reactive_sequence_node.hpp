// ============================================================================
//  bt_nodes/control/reactive_sequence_node.hpp
//  ReactiveSequenceNode —— 每拍从第一个子节点重新评估的顺序控制节点。
// ============================================================================
#ifndef BT_NODES_CONTROL_REACTIVE_SEQUENCE_NODE_HPP
#define BT_NODES_CONTROL_REACTIVE_SEQUENCE_NODE_HPP

#include <optional>

#include "bt_core/control_node.hpp"

namespace bt_nodes {

/**
 * @brief 每拍重新评估前置条件的顺序节点。
 *
 * 与有状态的 SequenceNode 不同，ReactiveSequenceNode 每一拍都从第一个
 * 子节点开始。前置条件失效时，后续正在运行的子节点会在返回 FAILURE 前被
 * halt；若新的较前子节点开始运行，原先正在运行的较后子节点会被 halt。
 */
class ReactiveSequenceNode : public bt_core::ControlNode {
 public:
  using bt_core::ControlNode::ControlNode;

  bt_core::NodeStatus tick() override {
    for (size_t index = 0; index < children_.size(); ++index) {
      const bt_core::NodeStatus child_status = children_[index]->executeTick();
      switch (child_status) {
        case bt_core::NodeStatus::SUCCESS:
          continue;

        case bt_core::NodeStatus::RUNNING:
          haltPreviousRunningChild(index);
          running_child_index_ = index;
          return bt_core::NodeStatus::RUNNING;

        case bt_core::NodeStatus::FAILURE:
        case bt_core::NodeStatus::IDLE:
          haltChildren(index + 1);
          running_child_index_.reset();
          return bt_core::NodeStatus::FAILURE;
      }
    }

    running_child_index_.reset();
    return bt_core::NodeStatus::SUCCESS;
  }

  void halt() override {
    running_child_index_.reset();
    bt_core::ControlNode::halt();
  }

 private:
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

#endif  // BT_NODES_CONTROL_REACTIVE_SEQUENCE_NODE_HPP
