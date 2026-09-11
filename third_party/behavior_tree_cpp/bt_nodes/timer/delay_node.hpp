// ============================================================================
//  bt_nodes/timer/delay_node.hpp
//  DelayNode —— 异步延时动作节点（演示 RUNNING 语义的关键节点）。
// ============================================================================
#ifndef BT_NODES_TIMER_DELAY_NODE_HPP
#define BT_NODES_TIMER_DELAY_NODE_HPP

#include <chrono>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 延时动作节点：从首拍起计时，未到 delay_ms 毫秒持续返回 RUNNING，到时返回 SUCCESS。
 *
 * 这是框架里演示“异步动作 / RUNNING 语义”的关键示例节点：
 *  - 首拍（尚未计时）：记录 steady_clock 起点，返回 RUNNING（若 delay_ms<=0 则立即 SUCCESS）。
 *  - 后续拍：距起点未满 delay_ms → 继续 RUNNING；已满 → SUCCESS 并复位（可被再次调度）。
 *  - onHalted()：父节点 halt 时复位计时状态，下次 tick 重新从头计时。
 *
 * 与 CooldownCondition 的区别：
 *  - Cooldown 是“瞬时条件”（只返回 SUCCESS/FAILURE，用于节流门控）；
 *  - Delay 是“跨拍动作”（返回 RUNNING 占用时间轴），常用于“等待 N 毫秒后再继续序列”。
 *
 * 时间源：std::chrono::steady_clock（单调时钟，不受系统时间调整影响）。
 * 状态：起点时间戳存节点实例内，节点实例在树存活期间复用，故可跨 tick 记忆。
 *
 * 端口：
 *  - delay_ms (int, 输入)：延时时长（毫秒），默认 1000。<=0 表示不延时（首拍即 SUCCESS）。
 *
 * @note 属于 ActionNode，可返回 RUNNING；放入 Sequence 时会阻塞后续节点直至到时。
 *
 * @code{.xml}
 *   <Delay delay_ms="500"/>   <!-- 等待 500ms 后返回 SUCCESS -->
 * @endcode
 */
class DelayNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "delay_ms", "1000", "延时时长（毫秒），从首拍起计时；<=0 表示不延时"));
  }

  bt_core::NodeStatus tick() override {
    const int delay_ms = getInput<int>("delay_ms").value_or(1000);

    // 非正延时：语义上无需等待，首拍即完成。
    if (delay_ms <= 0) {
      started_ = false;  // 保持可复用
      return bt_core::NodeStatus::SUCCESS;
    }

    const auto now = std::chrono::steady_clock::now();

    // 首拍：记录起点并进入 RUNNING。
    if (!started_) {
      started_ = true;
      start_ = now;
      return bt_core::NodeStatus::RUNNING;
    }

    const auto elapsed_ms =
        std::chrono::duration_cast<std::chrono::milliseconds>(now - start_)
            .count();

    if (elapsed_ms >= delay_ms) {
      started_ = false;  // 复位，允许节点被再次调度
      return bt_core::NodeStatus::SUCCESS;
    }
    return bt_core::NodeStatus::RUNNING;
  }

  /// @brief 被父节点中止时复位计时，下次 tick 重新计时。
  void onHalted() override { started_ = false; }

 private:
  bool started_{false};                              ///< 是否已开始计时
  std::chrono::steady_clock::time_point start_{};    ///< 计时起点
};

}  // namespace bt_nodes

#endif  // BT_NODES_TIMER_DELAY_NODE_HPP
