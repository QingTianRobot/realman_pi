// ============================================================================
//  bt_nodes/timer/wait_until_elapsed_condition_node.hpp
//  WaitUntilElapsedCondition —— 一次性到时条件节点。
// ============================================================================
#ifndef BT_NODES_TIMER_WAIT_UNTIL_ELAPSED_CONDITION_NODE_HPP
#define BT_NODES_TIMER_WAIT_UNTIL_ELAPSED_CONDITION_NODE_HPP

#include <chrono>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 一次性到时条件：节点实例首拍记录起点，此后距起点已达 duration_ms 则 SUCCESS，否则 FAILURE。
 *
 * 与 CooldownCondition 的区别（本节点是“单调到时”，Cooldown 是“周期性放行”）：
 *  - Cooldown：每次成功都会刷新时间戳，形成“每 N 毫秒放行一次”的节流。
 *  - WaitUntilElapsed：起点只记一次、永不刷新；一旦到时后将持续返回 SUCCESS，
 *    表达“自某时刻起已经过去了至少 duration_ms”这一单调时间条件（如启动后宽限期已过）。
 *
 * 设计为 ConditionNode：只返回 SUCCESS/FAILURE，无 RUNNING（瞬时判断），便于放在 Sequence 前置做门控。
 *
 * 时间源：std::chrono::steady_clock（单调时钟）。
 * 状态：起点时间戳存节点实例内，跨 tick 记忆。
 *
 * 端口：
 *  - duration_ms (int, 输入)：需经过的时长（毫秒），默认 1000。<=0 表示立即满足（恒 SUCCESS）。
 *
 * 首拍：记录起点。若 duration_ms<=0 则首拍即 SUCCESS；否则首拍通常 FAILURE（除非 duration_ms=0）。
 *
 * @code{.xml}
 *   <WaitUntilElapsed duration_ms="2000"/>  <!-- 自首次评估起 2s 后才放行 -->
 * @endcode
 */
class WaitUntilElapsedConditionNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "duration_ms", "1000",
        "需经过的时长（毫秒），自首拍起计时；到时返回 SUCCESS"));
  }

  bt_core::NodeStatus tick() override {
    const int duration_ms = getInput<int>("duration_ms").value_or(1000);
    const auto now = std::chrono::steady_clock::now();

    // 首拍：记录起点（只记一次，永不刷新）。
    if (!started_) {
      started_ = true;
      start_ = now;
    }

    // 非正时长：立即满足。
    if (duration_ms <= 0) return bt_core::NodeStatus::SUCCESS;

    const auto elapsed_ms =
        std::chrono::duration_cast<std::chrono::milliseconds>(now - start_)
            .count();

    return elapsed_ms >= duration_ms ? bt_core::NodeStatus::SUCCESS
                                     : bt_core::NodeStatus::FAILURE;
  }

 private:
  bool started_{false};                              ///< 是否已记录起点
  std::chrono::steady_clock::time_point start_{};    ///< 计时起点（只记一次）
};

}  // namespace bt_nodes

#endif  // BT_NODES_TIMER_WAIT_UNTIL_ELAPSED_CONDITION_NODE_HPP
