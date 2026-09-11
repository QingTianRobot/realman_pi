// ============================================================================
//  bt_core/leaf_node.hpp
//  叶子节点 —— 没有子节点的“执行单元”。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): ActionNode halt 完成后清除待复位标记
//
//  设计说明：
//    LeafNode 是行为树的“实际干活的地方”，分两类：
//      - ActionNode    : 执行具体动作，可返回 RUNNING(异步动作，跨多拍完成)。
//                        ← 你需求里“每个状态以插件形式插入”对应的就是它。
//      - ConditionNode : 检查某个条件，只应返回 SUCCESS/FAILURE，不应 RUNNING。
//
//    用户写自定义节点 99% 的情况都是继承 ActionNode 或 ConditionNode。
// ============================================================================
#ifndef BT_CORE_LEAF_NODE_HPP
#define BT_CORE_LEAF_NODE_HPP

#include <string>

#include "bt_core/tree_node.hpp"

namespace bt_core {

/**
 * @brief 叶子节点基类：固定没有子节点。
 */
class LeafNode : public TreeNode {
public:
  using TreeNode::TreeNode;  // 继承构造函数
};

/**
 * @brief 动作节点基类。
 *
 * 子类实现 tick()：
 *   - 同步动作：直接返回 SUCCESS / FAILURE。
 *   - 异步动作：首拍返回 RUNNING，后续拍继续推进，完成时返回 SUCCESS/FAILURE。
 *     若被父节点 halt()，应在 onHalted() 里释放资源 / 取消异步操作。
 *
 * @code
 *   class MoveTo : public ActionNode {
 *    public:
 *     using ActionNode::ActionNode;
 *     static PortsList providedPorts() {
 *       return makePorts(InputPort<std::string>("goal"));
 *     }
 *     NodeStatus tick() override {
 *       auto goal = getInput<std::string>("goal");
 *       // ... 推进移动 ...
 *       return NodeStatus::SUCCESS;
 *     }
 *   };
 * @endcode
 */
class ActionNode : public LeafNode {
public:
  using LeafNode::LeafNode;

  NodeType type() const override final { return NodeType::ACTION; }

  /// @brief 异步动作被中止时的钩子，默认空实现。
  virtual void onHalted() {}

  void halt() override {
    onHalted();
    markHalted();
    setStatus(NodeStatus::IDLE);
  }
};

/**
 * @brief 条件节点基类。
 *
 * 约定：只返回 SUCCESS 或 FAILURE，不返回 RUNNING(条件是瞬时判断)。
 * 若子类错误地返回了 RUNNING，executeTick 之外不做强制纠正，但语义上视为违规。
 */
class ConditionNode : public LeafNode {
public:
  using LeafNode::LeafNode;

  NodeType type() const override final { return NodeType::CONDITION; }

  // 条件节点没有需要中止的异步状态，halt 用基类默认实现即可。
};

}  // namespace bt_core

#endif  // BT_CORE_LEAF_NODE_HPP
