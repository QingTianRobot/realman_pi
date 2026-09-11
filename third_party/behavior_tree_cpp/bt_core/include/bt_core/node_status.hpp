// ============================================================================
//  bt_core/node_status.hpp
//  行为树节点状态枚举 —— 整个框架最底层的抽象。
//
//  设计说明：
//    行为树的每一次 tick(执行脉冲)都会让节点返回一个状态。父节点根据子节点
//    返回的状态决定下一步如何调度。状态机只有 4 种取值，语义清晰且封闭。
// ============================================================================
#ifndef BT_CORE_NODE_STATUS_HPP
#define BT_CORE_NODE_STATUS_HPP

#include <string>

namespace bt_core {

/**
 * @brief 节点执行状态。
 *
 * 状态转移约定：
 *  - IDLE    : 初始或被 halt() 复位后的状态，表示尚未开始/已停止。
 *  - RUNNING : 节点正在执行且尚未完成(典型于异步动作)，父节点应在下一拍继续 tick。
 *  - SUCCESS : 节点本轮执行成功结束。
 *  - FAILURE : 节点本轮执行失败结束。
 *
 * SUCCESS / FAILURE 统称“终结状态(terminal)”；IDLE / RUNNING 为“非终结状态”。
 */
enum class NodeStatus {
  IDLE = 0,   ///< 未执行 / 已复位
  RUNNING,    ///< 执行中(异步未完成)
  SUCCESS,    ///< 执行成功
  FAILURE     ///< 执行失败
};

/**
 * @brief 判断状态是否为终结状态(SUCCESS 或 FAILURE)。
 * @details 控制节点常用它判断子节点是否“尘埃落定”。
 */
inline bool isStatusCompleted(NodeStatus status) {
  return status == NodeStatus::SUCCESS || status == NodeStatus::FAILURE;
}

/**
 * @brief 状态转字符串，用于日志、序列化、可视化展示。
 */
inline std::string toStr(NodeStatus status) {
  switch (status) {
    case NodeStatus::IDLE:    return "IDLE";
    case NodeStatus::RUNNING: return "RUNNING";
    case NodeStatus::SUCCESS: return "SUCCESS";
    case NodeStatus::FAILURE: return "FAILURE";
  }
  return "UNKNOWN";  // 不可达，仅为消除编译器警告
}

/**
 * @brief 节点的类别。用于序列化与编辑器分类展示。
 */
enum class NodeType {
  UNDEFINED = 0,
  CONTROL,     ///< 控制节点(N 个子节点)：Sequence/Fallback/Parallel...
  DECORATOR,   ///< 装饰节点(1 个子节点)：Inverter/Retry/Repeat...
  ACTION,      ///< 动作叶子(0 子节点)：执行具体行为
  CONDITION    ///< 条件叶子(0 子节点)：返回 SUCCESS/FAILURE，不应返回 RUNNING
};

inline std::string toStr(NodeType type) {
  switch (type) {
    case NodeType::CONTROL:   return "Control";
    case NodeType::DECORATOR: return "Decorator";
    case NodeType::ACTION:    return "Action";
    case NodeType::CONDITION: return "Condition";
    case NodeType::UNDEFINED: return "Undefined";
  }
  return "Undefined";
}

}  // namespace bt_core

#endif  // BT_CORE_NODE_STATUS_HPP
