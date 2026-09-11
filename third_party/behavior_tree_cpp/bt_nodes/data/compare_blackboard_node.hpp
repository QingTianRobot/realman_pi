// ============================================================================
//  bt_nodes/data/compare_blackboard_node.hpp
//  CompareBlackboardNode —— 比较黑板某 key 的值与给定值的条件节点。
// ============================================================================
#ifndef BT_NODES_DATA_COMPARE_BLACKBOARD_NODE_HPP
#define BT_NODES_DATA_COMPARE_BLACKBOARD_NODE_HPP

#include <optional>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"
#include "data/blackboard_value_util.hpp"

namespace bt_nodes {

/**
 * @brief 比较黑板值条件节点：比较黑板 key 的值与给定 value，相符返回 SUCCESS 否则 FAILURE。
 *
 * 比较策略（双路）：
 *  1) 数值优先：若“黑板值”与“给定值”都能解析为 double，则按 double 做 ==/!=/</<=/>/>= 比较。
 *  2) 字符串回退：任一方无法解析为数值时，按字符串比较。字符串只支持 ==/!= 有明确语义；
 *     对 </<=/>/>= 则用字典序（std::string::compare）给出结果，便于对字符串做有序判断。
 *
 * 端口：
 *  - key (std::string, 输入)：要比较的黑板键名（键名本身，运行期取该 key 的值）。
 *  - op  (std::string, 输入)：运算符之一 == / != / < / <= / > / >=，默认 "=="。
 *  - value (std::string, 输入)：参与比较的右操作数（字面量或 "{k}" 重映射）。
 *
 * 边界：
 *  - key 不存在于黑板：无法比较，返回 FAILURE（视为“条件不成立”）。
 *  - op 非法：返回 FAILURE。
 *
 * @code{.xml}
 *   <CompareBlackboard key="score" op=">=" value="60"/>     <!-- 数值比较 -->
 *   <CompareBlackboard key="state" op="==" value="ready"/>  <!-- 字符串比较 -->
 * @endcode
 */
class CompareBlackboardNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "要比较的黑板键名"),
        // op 是枚举型端口:编辑器据 enum_values 渲染下拉框,杜绝手抖打错。
        bt_core::InputPort<std::string>("op", "==", "运算符",
                                        {"==", "!=", "<", "<=", ">", ">="}),
        bt_core::InputPort<std::string>("value", "", "参与比较的右操作数"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    const std::string op = getInput<std::string>("op").value_or("==");
    const std::string rhs = getInput<std::string>("value").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    // 取黑板值（类型未知 → 统一取成字符串）。key 不存在 → FAILURE。
    const std::optional<std::string> lhs_opt =
        data_util::readKeyAsString(blackboard(), key);
    if (!lhs_opt) return bt_core::NodeStatus::FAILURE;
    const std::string& lhs = *lhs_opt;

    // 数值优先：两侧都能解析为 double 时走数值比较。
    const std::optional<double> lnum = data_util::tryParseDouble(lhs);
    const std::optional<double> rnum = data_util::tryParseDouble(rhs);

    bool result = false;
    if (lnum && rnum) {
      result = applyNumeric(*lnum, op, *rnum);
    } else {
      // 字符串回退：== / != 按相等，序关系按字典序。
      const int cmp = lhs.compare(rhs);  // <0 / 0 / >0
      result = applyOrdering(cmp, op);
    }
    return result ? bt_core::NodeStatus::SUCCESS : bt_core::NodeStatus::FAILURE;
  }

 private:
  /// @brief 数值比较：按 op 返回 a <op> b。op 非法返回 false。
  static bool applyNumeric(double a, const std::string& op, double b) {
    if (op == "==") return a == b;
    if (op == "!=") return a != b;
    if (op == "<")  return a < b;
    if (op == "<=") return a <= b;
    if (op == ">")  return a > b;
    if (op == ">=") return a >= b;
    return false;
  }

  /// @brief 字符串比较：cmp 为 lhs.compare(rhs) 的结果，按 op 折算成 bool。op 非法返回 false。
  static bool applyOrdering(int cmp, const std::string& op) {
    if (op == "==") return cmp == 0;
    if (op == "!=") return cmp != 0;
    if (op == "<")  return cmp < 0;
    if (op == "<=") return cmp <= 0;
    if (op == ">")  return cmp > 0;
    if (op == ">=") return cmp >= 0;
    return false;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_COMPARE_BLACKBOARD_NODE_HPP
