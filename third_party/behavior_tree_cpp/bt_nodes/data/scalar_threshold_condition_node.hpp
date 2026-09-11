// ============================================================================
//  bt_nodes/data/scalar_threshold_condition_node.hpp
//  ScalarThresholdCondition —— 把黑板数值读数与阈值比较的条件节点。
// ============================================================================
#ifndef BT_NODES_DATA_SCALAR_THRESHOLD_CONDITION_NODE_HPP
#define BT_NODES_DATA_SCALAR_THRESHOLD_CONDITION_NODE_HPP

#include <optional>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"
#include "data/blackboard_value_util.hpp"

namespace bt_nodes {

/**
 * @brief 标量阈值条件：把黑板 key 的数值读数与给定 value 按 op 比较，成立 SUCCESS 否则 FAILURE。
 *
 * 这是把“传感器/状态读数”变成“行为树判断”的通用条件节点。与 CompareBlackboard 的差别：
 *  - CompareBlackboard 是“数值优先、字符串回退”的通用比较（value 也是字符串端口）；
 *  - ScalarThreshold 语义更聚焦“数值阈值判断”：value 是强类型 double 端口，且黑板值必须能
 *    解析为数值，否则视为条件不成立（FAILURE）。适合“电量<0.2”“温度>=80”这类阈值门控，
 *    编辑器里 value 直接按浮点输入，意图更清晰。
 *
 * 读取：复用 data_util::readKeyAsString 以“类型未知”方式取出黑板值，再用 tryParseDouble 解析为
 * double（兼容写入方用 int/double/float/字符串数值存储的情况）。
 *
 * 端口：
 *  - key   (std::string, 输入)：要读取的黑板键名（其值应为可解析的数值）。
 *  - op    (std::string, 输入, 枚举)：运算符 > / >= / < / <= / == / !=，默认 ">="。
 *  - value (double, 输入)：参与比较的阈值（右操作数），默认 0.0。
 *
 * 边界（均返回 FAILURE，绝不抛异常打断树）：
 *  - key 为空 / key 不存在 / 黑板值无法解析为数值 / op 非法。
 *
 * @code{.xml}
 *   <ScalarThreshold key="battery_level" op="&lt;" value="0.2"/>   <!-- 电量低于 0.2 -->
 *   <ScalarThreshold key="temperature" op="&gt;=" value="80"/>     <!-- 温度不低于 80 -->
 * @endcode
 */
class ScalarThresholdConditionNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "要读取的黑板键名（数值）"),
        // op 是枚举端口：编辑器渲染下拉框，杜绝手抖打错。
        bt_core::InputPort<std::string>("op", ">=", "运算符",
                                        {">", ">=", "<", "<=", "==", "!="}),
        bt_core::InputPort<double>("value", "0", "参与比较的阈值（右操作数）"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    const std::string op = getInput<std::string>("op").value_or(">=");
    const double rhs = getInput<double>("value").value_or(0.0);
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    // 取黑板值（类型未知 → 字符串 → double）。缺失/不可解析 → FAILURE。
    const std::optional<std::string> lhs_str =
        data_util::readKeyAsString(blackboard(), key);
    if (!lhs_str) return bt_core::NodeStatus::FAILURE;
    const std::optional<double> lhs = data_util::tryParseDouble(*lhs_str);
    if (!lhs) return bt_core::NodeStatus::FAILURE;

    return applyNumeric(*lhs, op, rhs) ? bt_core::NodeStatus::SUCCESS
                                       : bt_core::NodeStatus::FAILURE;
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
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_SCALAR_THRESHOLD_CONDITION_NODE_HPP
