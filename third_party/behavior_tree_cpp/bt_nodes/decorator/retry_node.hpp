// ============================================================================
//  bt_nodes/decorator/retry_node.hpp
//  RetryNode —— 失败重试装饰节点。
// ============================================================================
#ifndef BT_NODES_DECORATOR_RETRY_NODE_HPP
#define BT_NODES_DECORATOR_RETRY_NODE_HPP

#include "bt_core/blackboard.hpp"
#include "bt_core/decorator_node.hpp"

namespace bt_nodes {

/**
 * @brief 重试节点：子节点失败时最多重试 N 次，任一次成功即成功。
 *
 * 语义：
 *  - 子节点 SUCCESS → 本节点 SUCCESS（并复位重试计数）。
 *  - 子节点 FAILURE → 重试计数 +1；若未达上限则 halt 子节点后下一拍重跑，
 *    本节点返回 RUNNING；若已达上限则返回 FAILURE。
 *  - 子节点 RUNNING → 透传 RUNNING（本次尝试尚未结束，不计入重试）。
 *
 * 端口：
 *  - num_attempts (int, 默认 1)：最大尝试次数（含首次）。
 *        例如 3 表示首次 + 失败后最多再试 2 次。-1 表示无限重试。
 *
 * @note “尝试次数”按“失败的完整尝试”计数；RUNNING 不消耗次数。
 */
class RetryNode : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "num_attempts", "1", "最大尝试次数（含首次）；-1 表示无限重试"));
  }

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    const int max_attempts = getInput<int>("num_attempts").value_or(1);

    switch (child()->executeTick()) {
      case bt_core::NodeStatus::SUCCESS:
        attempts_done_ = 0;
        return bt_core::NodeStatus::SUCCESS;

      case bt_core::NodeStatus::RUNNING:
        return bt_core::NodeStatus::RUNNING;

      case bt_core::NodeStatus::FAILURE: {
        ++attempts_done_;
        // 无限重试（-1）或仍有剩余次数 → 复位子节点，下一拍再试。
        if (max_attempts < 0 || attempts_done_ < max_attempts) {
          child()->halt();
          return bt_core::NodeStatus::RUNNING;
        }
        // 次数耗尽 → 最终失败。
        attempts_done_ = 0;
        return bt_core::NodeStatus::FAILURE;
      }

      case bt_core::NodeStatus::IDLE:
      default:
        return bt_core::NodeStatus::FAILURE;
    }
  }

  void halt() override {
    attempts_done_ = 0;
    bt_core::DecoratorNode::halt();
  }

 private:
  int attempts_done_{0};  ///< 已经失败的尝试次数（有状态）
};

}  // namespace bt_nodes

#endif  // BT_NODES_DECORATOR_RETRY_NODE_HPP
