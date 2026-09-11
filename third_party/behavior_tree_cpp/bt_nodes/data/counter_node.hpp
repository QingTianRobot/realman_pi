// ============================================================================
//  bt_nodes/data/counter_node.hpp
//  CounterNode —— 每次 tick 对黑板某 key 计数累加的动作节点。
// ============================================================================
#ifndef BT_NODES_DATA_COUNTER_NODE_HPP
#define BT_NODES_DATA_COUNTER_NODE_HPP

#include <optional>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"
#include "data/blackboard_value_util.hpp"

namespace bt_nodes {

/**
 * @brief 计数器节点：每次 tick 把黑板 key 的整数值加上 step（默认 1），写回黑板，恒返回 SUCCESS。
 *
 * 用途：统计某分支被执行的次数、循环计数、节流计数等。计数以 int 形式存回黑板。
 *
 * 读取与回写采用“类型未知读取 + int 回写”：
 *  - 若 key 不存在：视当前值为 0，写入 step。
 *  - 若 key 已存在：用 readKeyAsString 取出后解析为整数（兼容写入方用 int / 字符串存的两种情况）；
 *    无法解析为数值时视当前值为 0，避免抛异常打断行为树。
 *
 * 端口：
 *  - key (std::string, 输入)：计数所在的黑板键名。
 *  - step (int, 输入)：每次累加的步长，默认 1（可为负实现递减）。
 *
 * @note 始终把结果以 int 写回（截断小数部分）。如需浮点累加可另建节点；计数器语义即整型。
 *
 * @code{.xml}
 *   <Counter key="tick_count"/>            <!-- 每拍 +1 -->
 *   <Counter key="score" step="10"/>       <!-- 每拍 +10 -->
 * @endcode
 */
class CounterNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "计数所在的黑板键名"),
        bt_core::InputPort<int>("step", "1", "每次累加的步长（默认 1，可为负）"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    const int step = getInput<int>("step").value_or(1);

    // 读当前值（类型未知 → 取字符串 → 解析为整数）。缺失/不可解析 → 0。
    int current = 0;
    if (auto s = data_util::readKeyAsString(blackboard(), key)) {
      if (auto num = data_util::tryParseDouble(*s)) {
        current = static_cast<int>(*num);
      }
    }

    const int next = current + step;
    blackboard()->set<int>(key, next);
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_COUNTER_NODE_HPP
