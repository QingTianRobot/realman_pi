// ============================================================================
//  bt_nodes/data/cooldown_condition_node.hpp
//  CooldownConditionNode —— 基于时间冷却的条件节点。
// ============================================================================
#ifndef BT_NODES_DATA_COOLDOWN_CONDITION_NODE_HPP
#define BT_NODES_DATA_COOLDOWN_CONDITION_NODE_HPP

#include <chrono>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 冷却条件节点：距上次成功不足 cooldown_ms 毫秒则 FAILURE，否则 SUCCESS 并刷新时间戳。
 *
 * 设计为 ConditionNode 而非 Decorator：
 *  - 它表达的是“现在是否过了冷却期”这一瞬时判断，结果只有 SUCCESS/FAILURE，无需包裹子节点。
 *  - 放在 Sequence 前置位即可起到“门控/节流”作用（冷却中则整条序列短路），比 Decorator 更通用、
 *    更易组合。若需要“冷却期内跳过子树”，用 Sequence[ Cooldown, 子树 ] 即可达到等效效果。
 *
 * 时间源：std::chrono::steady_clock（单调时钟，不受系统时间调整影响，适合度量间隔）。
 * 状态：上次成功时间戳存在节点实例内（last_success_），节点实例在树存活期间复用，故可跨 tick 记忆。
 *
 * 首次 tick：last_success_ 尚未设置（has_fired_=false）→ 视为“已过冷却” → SUCCESS 并记录时间。
 *
 * 端口：
 *  - cooldown_ms (int, 输入)：冷却时长（毫秒），默认 1000。<=0 表示无冷却（每次都 SUCCESS）。
 *
 * @code{.xml}
 *   <CooldownCondition cooldown_ms="500"/>  <!-- 每 500ms 最多放行一次 -->
 * @endcode
 */
class CooldownConditionNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "cooldown_ms", "1000", "冷却时长（毫秒），距上次成功不足此值则失败"));
  }

  bt_core::NodeStatus tick() override {
    const int cooldown_ms = getInput<int>("cooldown_ms").value_or(1000);
    const auto now = std::chrono::steady_clock::now();

    // 首次：无历史成功记录 → 直接放行并打点。
    if (!has_fired_) {
      has_fired_ = true;
      last_success_ = now;
      return bt_core::NodeStatus::SUCCESS;
    }

    const auto elapsed_ms =
        std::chrono::duration_cast<std::chrono::milliseconds>(now - last_success_)
            .count();

    if (elapsed_ms < cooldown_ms) {
      // 仍在冷却期内：失败，且不刷新时间戳（避免饥饿无法解除）。
      return bt_core::NodeStatus::FAILURE;
    }

    // 已过冷却：放行并刷新时间戳。
    last_success_ = now;
    return bt_core::NodeStatus::SUCCESS;
  }

 private:
  bool has_fired_{false};                          ///< 是否已有过一次成功（用于首拍放行）
  std::chrono::steady_clock::time_point last_success_{};  ///< 上次成功的时间点
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_COOLDOWN_CONDITION_NODE_HPP
