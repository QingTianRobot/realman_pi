// ============================================================================
//  bt_nodes/decorator/repeat_node.hpp
//  RepeatNode —— 重复执行装饰节点。
// ============================================================================
#ifndef BT_NODES_DECORATOR_REPEAT_NODE_HPP
#define BT_NODES_DECORATOR_REPEAT_NODE_HPP

#include "bt_core/blackboard.hpp"
#include "bt_core/decorator_node.hpp"

namespace bt_nodes {

/**
 * @brief 重复节点：成功地重复执行子节点 N 次。
 *
 * 语义：
 *  - 子节点 SUCCESS → 完成计数 +1；若未达 N 则 halt 子节点、下一拍再跑一遍，
 *    本节点返回 RUNNING；达到 N 则返回 SUCCESS。
 *  - 子节点 FAILURE → 立即返回 FAILURE（重复被打断），并复位计数。
 *  - 子节点 RUNNING → 透传 RUNNING（本遍尚未结束，不计入完成次数）。
 *
 * 端口：
 *  - num_cycles (int, 默认 1)：需要成功完成的循环次数。-1 表示无限重复
 *        （此时只要子节点不失败就一直 RUNNING）。
 *
 * @note 与 RetryNode 的区别：Repeat 在子节点**成功**时计数并继续；
 *       Retry 在子节点**失败**时计数并继续。
 */
class RepeatNode : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "num_cycles", "1", "需要成功完成的循环次数；-1 表示无限重复"));
  }

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    const int num_cycles = getInput<int>("num_cycles").value_or(1);

    switch (child()->executeTick()) {
      case bt_core::NodeStatus::SUCCESS: {
        ++cycles_done_;
        // 无限重复（-1）或仍未跑够 → 复位子节点，下一拍再来一遍。
        if (num_cycles < 0 || cycles_done_ < num_cycles) {
          child()->halt();
          return bt_core::NodeStatus::RUNNING;
        }
        // 跑够 N 遍 → 成功，复位计数。
        cycles_done_ = 0;
        return bt_core::NodeStatus::SUCCESS;
      }

      case bt_core::NodeStatus::RUNNING:
        return bt_core::NodeStatus::RUNNING;

      case bt_core::NodeStatus::FAILURE:
        // 子节点失败 → 重复中断，整体失败。
        cycles_done_ = 0;
        return bt_core::NodeStatus::FAILURE;

      case bt_core::NodeStatus::IDLE:
      default:
        return bt_core::NodeStatus::FAILURE;
    }
  }

  void halt() override {
    cycles_done_ = 0;
    bt_core::DecoratorNode::halt();
  }

 private:
  int cycles_done_{0};  ///< 已成功完成的循环次数（有状态）
};

}  // namespace bt_nodes

#endif  // BT_NODES_DECORATOR_REPEAT_NODE_HPP
