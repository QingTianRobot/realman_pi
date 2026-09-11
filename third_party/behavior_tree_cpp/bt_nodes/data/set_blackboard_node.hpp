// ============================================================================
//  bt_nodes/data/set_blackboard_node.hpp
//  SetBlackboardNode —— 把一个字面量值写入黑板指定 key 的动作节点。
// ============================================================================
#ifndef BT_NODES_DATA_SET_BLACKBOARD_NODE_HPP
#define BT_NODES_DATA_SET_BLACKBOARD_NODE_HPP

#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 写黑板节点：把输入端口 value 的值写入由 output_key 指定的黑板 key，恒返回 SUCCESS。
 *
 * 这是“数据录入”最基础的一块：把一个常量/上游传来的值固化到黑板，供后续节点读取与决策。
 * 值以 std::string 形式写入黑板（最通用、可被 CompareBlackboard 数值/字符串两路比较）。
 *
 * 端口：
 *  - value (std::string, 输入)：要写入的值（XML 里可为字面量或 "{key}" 重映射）。
 *  - output_key (std::string, 输入)：目标黑板键名。注意这里 output_key 表示“键的名字”
 *    本身，而非端口重映射；因此读它用 getInput，再用 blackboard()->set 直接落到该 key。
 *
 * @note 为什么不用 setOutput<>("value", ...)：setOutput 会把数据写到“端口 value 解析出的
 *       key”，而本节点的语义是“写到 output_key 指定的那个 key”，目标 key 是运行期数据而非
 *       端口名，故直接操作 blackboard()。
 *
 * @code{.xml}
 *   <SetBlackboard value="42" output_key="score"/>            <!-- 写字面量 -->
 *   <SetBlackboard value="{incoming}" output_key="cached"/>   <!-- 写重映射来的值 -->
 * @endcode
 */
class SetBlackboardNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("value", "", "要写入黑板的值（字符串形式）"),
        bt_core::InputPort<std::string>("output_key", "", "目标黑板键名"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("output_key").value_or("");
    if (key.empty()) {
      // 没有目标 key 无法完成写入：按“数据录入失败”返回 FAILURE，避免静默无效。
      return bt_core::NodeStatus::FAILURE;
    }
    const std::string value = getInput<std::string>("value").value_or("");
    blackboard()->set<std::string>(key, value);
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_SET_BLACKBOARD_NODE_HPP
