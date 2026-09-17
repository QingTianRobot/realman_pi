// ============================================================================
//  bt_nodes/data/set_bool_node.hpp
//  SetBoolNode —— 向黑板写入一个 bool 值的动作节点。
// ============================================================================
#ifndef BT_NODES_DATA_SET_BOOL_NODE_HPP
#define BT_NODES_DATA_SET_BOOL_NODE_HPP

#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 写布尔节点：把布尔值 value 写入黑板 key，恒返回 SUCCESS。
 *
 * 与 SetBlackboard 的区别：本节点以**真正的 bool 类型**写入黑板（而非字符串），
 * 因此 CheckBool 可走精确 bool 读取路径。用于设置/复位标志位（如 is_ready=true）。
 *
 * 端口：
 *  - key (std::string, 输入)：目标黑板键名。
 *  - value (bool, 输入)：要写入的布尔值，默认 true。XML 里 "true"/"1" → true，其余 → false。
 *
 * @code{.xml}
 *   <SetBool key="is_ready" value="true"/>
 *   <SetBool key="has_error" value="false"/>
 * @endcode
 */
class SetBoolNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "目标黑板键名"),
        bt_core::InputPort<bool>("value", "true", "要写入的布尔值（默认 true）"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    const bool value = getInput<bool>("value").value_or(true);
    blackboard()->set<bool>(key, value);
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_SET_BOOL_NODE_HPP
