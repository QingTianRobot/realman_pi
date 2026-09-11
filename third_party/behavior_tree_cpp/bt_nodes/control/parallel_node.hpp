// ============================================================================
//  bt_nodes/control/parallel_node.hpp
//  ParallelNode —— 并行控制节点（可配置成功阈值）。
// ============================================================================
#ifndef BT_NODES_CONTROL_PARALLEL_NODE_HPP
#define BT_NODES_CONTROL_PARALLEL_NODE_HPP

#include <set>

#include "bt_core/blackboard.hpp"
#include "bt_core/control_node.hpp"

namespace bt_nodes {

/**
 * @brief 并行节点：逻辑上“同时”推进所有子节点，按阈值判定整体结果。
 *
 * 语义：
 *  - 每一拍，对所有“尚未终结”的子节点各 tick 一次。
 *  - 成功阈值 success_threshold：成功子节点数 >= 阈值 → 整体 SUCCESS。
 *  - 失败阈值 failure_threshold：失败子节点数 > (N - failure_threshold)
 *    使得已不可能再达到成功阈值时 → 整体 FAILURE。
 *  - 否则（仍有子节点 RUNNING 且胜负未定）→ 整体 RUNNING。
 *  - 一旦整体终结，halt 其余仍在 RUNNING 的子节点并复位。
 *
 * 端口：
 *  - success_count (int, 默认 -1)：需要多少个子节点成功才算整体成功。
 *        -1 表示“全部成功”（等价于 N）。
 *  - failure_count (int, 默认 1) ：多少个子节点失败即判整体失败，默认 1。
 *
 * @note 这里的“并行”是单线程逻辑并行：同一拍顺序 tick 每个子节点，
 *       不涉及真正的多线程。这是行为树并行节点的标准做法。
 */
class ParallelNode : public bt_core::ControlNode {
 public:
  using bt_core::ControlNode::ControlNode;

  /// @brief 声明可配置端口，供编辑器枚举与 XML 配置。
  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<int>("success_count", "-1",
                                "需要成功的子节点数；-1 表示全部"),
        bt_core::InputPort<int>("failure_count", "1",
                                "判定整体失败所需的失败子节点数"));
  }

  bt_core::NodeStatus tick() override {
    const size_t n = childrenCount();
    if (n == 0) {
      return bt_core::NodeStatus::SUCCESS;  // 无子节点的并行视为成功
    }

    // 解析阈值（端口读取一次即可，缺省走默认值）。
    int success_threshold = getInput<int>("success_count").value_or(-1);
    const int failure_threshold = getInput<int>("failure_count").value_or(1);
    if (success_threshold < 0 || success_threshold > static_cast<int>(n)) {
      success_threshold = static_cast<int>(n);  // -1 或越界 → 全部成功
    }

    // 对所有尚未记入终结集合的子节点各 tick 一次。
    for (size_t i = 0; i < n; ++i) {
      if (completed_.count(i)) {
        continue;  // 已终结的子节点本拍不再 tick
      }
      const bt_core::NodeStatus s = children_[i]->executeTick();
      if (s == bt_core::NodeStatus::SUCCESS) {
        ++success_count_;
        completed_.insert(i);
      } else if (s == bt_core::NodeStatus::FAILURE) {
        ++failure_count_;
        completed_.insert(i);
      }
      // RUNNING / IDLE：保持未终结，下一拍继续。
    }

    // 判定整体成功。
    if (success_count_ >= success_threshold) {
      haltChildren();
      reset();
      return bt_core::NodeStatus::SUCCESS;
    }

    // 判定整体失败：达到失败阈值，或剩余未决也不足以凑齐成功阈值。
    const int remaining = static_cast<int>(n) - success_count_ - failure_count_;
    if (failure_count_ >= failure_threshold ||
        success_count_ + remaining < success_threshold) {
      haltChildren();
      reset();
      return bt_core::NodeStatus::FAILURE;
    }

    // 胜负未定 → 继续运行。
    return bt_core::NodeStatus::RUNNING;
  }

  void halt() override {
    reset();
    bt_core::ControlNode::halt();
  }

 private:
  void reset() {
    success_count_ = 0;
    failure_count_ = 0;
    completed_.clear();
  }

  int success_count_{0};      ///< 本轮已成功的子节点计数
  int failure_count_{0};      ///< 本轮已失败的子节点计数
  std::set<size_t> completed_;  ///< 已终结（不再 tick）的子节点下标集合
};

}  // namespace bt_nodes

#endif  // BT_NODES_CONTROL_PARALLEL_NODE_HPP
