// ============================================================================
//  bt_nodes/data/blackboard_exists_condition_node.hpp
//  BlackboardExistsCondition —— 判断黑板某 key 是否存在的条件节点。
// ============================================================================
#ifndef BT_NODES_DATA_BLACKBOARD_EXISTS_CONDITION_NODE_HPP
#define BT_NODES_DATA_BLACKBOARD_EXISTS_CONDITION_NODE_HPP

#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 黑板存在性条件：黑板中存在 key 则返回 SUCCESS，否则 FAILURE。
 *
 * 用途：在读取某数据前先“探测其是否已被写入”，避免读取缺失键。典型如：感知节点尚未
 * 产生目标坐标时先跳过移动分支；配置项存在时才走可选流程等。
 *
 * 判定仅看“键是否存在”（Blackboard::contains），不关心其类型与取值。
 *
 * 端口：
 *  - key (std::string, 输入)：要探测的黑板键名。
 *
 * 边界：
 *  - key 为空：无有效键可探测，返回 FAILURE。
 *  - 黑板不存在（理论上不会，TreeNode 构造时保证有黑板）：安全返回 FAILURE。
 *
 * @code{.xml}
 *   <BlackboardExists key="target_pose"/>   <!-- 目标已写入才继续 -->
 * @endcode
 */
class BlackboardExistsConditionNode : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("key", "", "要探测存在性的黑板键名"));
  }

  bt_core::NodeStatus tick() override {
    const std::string key = getInput<std::string>("key").value_or("");
    if (key.empty()) return bt_core::NodeStatus::FAILURE;

    const auto bb = blackboard();
    if (bb && bb->contains(key)) return bt_core::NodeStatus::SUCCESS;
    return bt_core::NodeStatus::FAILURE;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DATA_BLACKBOARD_EXISTS_CONDITION_NODE_HPP
