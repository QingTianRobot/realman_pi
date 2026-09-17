// ============================================================================
//  bt_nodes/diagnostic/log_event_node.hpp
//  LogEventNode —— 诊断/埋点日志动作节点。
// ============================================================================
#ifndef BT_NODES_DIAGNOSTIC_LOG_EVENT_NODE_HPP
#define BT_NODES_DIAGNOSTIC_LOG_EVENT_NODE_HPP

#include <iostream>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 日志事件节点：把一条带级别前缀的诊断消息打印到标准输出/标准错误，恒返回 SUCCESS。
 *
 * 用途：在行为树的关键分支埋点，输出可观测的诊断信息（进入某状态、达成某条件、异常兜底等），
 * 便于调试与运行态追踪。它不改变树的成败走向（恒 SUCCESS），可安全插在 Sequence 任意位置。
 *
 * 输出目标按级别选择：
 *  - info / warn → std::cout（正常诊断流）
 *  - error       → std::cerr（错误流，便于与正常日志分离/重定向）
 *
 * 前缀格式：`[LEVEL] message`，其中 LEVEL 为大写（INFO/WARN/ERROR）。
 * 非法或空的 level 一律回退为 info（防御式：不因日志级别拼写错误而中断树）。
 *
 * 端口：
 *  - message (std::string, 输入)：要打印的文本。允许为空（打印空消息，仍 SUCCESS）。
 *  - level   (std::string, 输入, 枚举)：日志级别 info/warn/error，默认 "info"。
 *
 * @note 恒 SUCCESS：日志是副作用，不代表判断结果。若需要“打印并失败”可与 ForceFailure 组合。
 *
 * @code{.xml}
 *   <LogEvent message="进入巡逻状态" level="info"/>
 *   <LogEvent message="电量偏低" level="warn"/>
 *   <LogEvent message="定位丢失，进入兜底" level="error"/>
 * @endcode
 */
class LogEventNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("message", "", "要打印的诊断文本"),
        // level 是枚举端口：编辑器渲染下拉框，限定合法级别。
        bt_core::InputPort<std::string>("level", "info", "日志级别",
                                        {"info", "warn", "error"}));
  }

  bt_core::NodeStatus tick() override {
    const std::string message = getInput<std::string>("message").value_or("");
    const std::string level = getInput<std::string>("level").value_or("info");

    if (level == "error") {
      std::cerr << "[ERROR] " << message << "\n";
    } else if (level == "warn") {
      std::cout << "[WARN] " << message << "\n";
    } else {
      // info 及任何非法/空级别一律走 info（防御式回退）。
      std::cout << "[INFO] " << message << "\n";
    }
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_DIAGNOSTIC_LOG_EVENT_NODE_HPP
