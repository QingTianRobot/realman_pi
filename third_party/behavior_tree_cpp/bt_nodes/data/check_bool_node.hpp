// ============================================================================
//  bt_nodes/data/check_bool_node.hpp
//  CheckBoolNode —— 读取黑板某 bool key 并与期望值比较的条件节点。
// ============================================================================
#ifndef BT_NODES_DATA_CHECK_BOOL_NODE_HPP
#define BT_NODES_DATA_CHECK_BOOL_NODE_HPP

#include <optional>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"
#include "data/blackboard_value_util.hpp"

namespace bt_nodes {

/**
 * @brief 检查布尔条件节点：读黑板 key 的 bool 值，等于 expected 时返回 SUCCESS 否则 FAILURE。
 *
 * 典型用于把“某标志位是否置位”作为行为树的分支条件（如 is_charged / door_open）。
 * 取值兼容两种写入：写入方用 bool 存（精确），或用字符串 "true"/"1" 存（回退解析）。
 *
 * 端口：
 *  - key (std::string, 输入)：bool 标志所在的黑板键名。
 *  - expected (bool, 输入)：期望的布尔值，默认 true（即默认判断“为真”）。
 *
 * 边界：
 *  - key 不存在 / 值无法解析为布尔：返回 FAILURE（条件不成立）。
 *
 * @code{.xml}
 *   <CheckBool key="is_ready"/>                 <!-- 默认 expected=true -->
 *   <CheckBool key="has_error" expected="false"/>
 * @endcode
 */
class CheckBoolNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "bool 标志所在的黑板键名"),
        bt_core::InputPort<bool>("expected", "true", "期望的布尔值（默认 true）"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    const bool expected = getInput<bool>("expected").value_or(true);

    const std::optional<bool> actual =
        data_util::readKeyAsBool(blackboard(), key);
    if (!actual) return bt_core::NodeStatus::FAILURE;  // 不存在/不可解析

    return (*actual == expected) ? bt_core::NodeStatus::SUCCESS
                                 : bt_core::NodeStatus::FAILURE;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_CHECK_BOOL_NODE_HPP
