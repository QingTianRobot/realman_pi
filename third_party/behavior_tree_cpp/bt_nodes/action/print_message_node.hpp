// ============================================================================
//  bt_nodes/action/print_message_node.hpp
//  PrintMessageNode —— 带输入端口的示例动作节点。
// ============================================================================
#ifndef BT_NODES_ACTION_PRINT_MESSAGE_NODE_HPP
#define BT_NODES_ACTION_PRINT_MESSAGE_NODE_HPP

#include <iostream>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"

namespace bt_nodes {

/**
 * @brief 打印消息节点：从输入端口读取文本并打印到标准输出，恒返回 SUCCESS。
 *
 * 这是“带端口的自定义 Action”的标准示例：演示 providedPorts() 声明端口 +
 * getInput<T>() 从黑板读取（支持 XML 里的字面量值与 "{key}" 重映射）。
 *
 * 端口：
 *  - message (std::string, 默认 "hello bt")：要打印的文本。
 *
 * @code{.xml}
 *   <PrintMessage message="hello"/>      <!-- 字面量 -->
 *   <PrintMessage message="{greeting}"/> <!-- 重映射到黑板 key greeting -->
 * @endcode
 */
class PrintMessageNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<std::string>(
        "message", "hello bt", "要打印到标准输出的文本"));
  }

  bt_core::NodeStatus tick() override {
    const std::string msg =
        getInput<std::string>("message").value_or("hello bt");
    std::cout << "[PrintMessage] " << msg << std::endl;
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_nodes

#endif  // BT_NODES_ACTION_PRINT_MESSAGE_NODE_HPP
