// ============================================================================
//  bt_server/src/demo_nodes.hpp
//  内置示例节点 —— 仅供 bt_server 自给自足地演示 /api/nodes、/api/tree/* 接口。
//
//  设计说明：
//    任务要求“注册几个内置示例节点进 factory 即可，不依赖 bt_nodes 插件”。
//    因此这里直接在服务进程内定义几个最小节点：
//      - Sequence / Fallback : 复用核心库语义的控制节点(用于 XML 建树演示)。
//      - SaySomething        : 带输入端口的 Action，演示端口 manifest。
//      - AlwaysSuccess /
//        AlwaysFailure       : 无端口的 Action，演示最简单的叶子。
//      - CheckBattery        : Condition，演示条件节点。
//
//    这些节点只为打通“枚举 → 建树 → tick → 导出”链路，逻辑刻意保持简单。
//    真实部署时应改为 factory.loadPlugin() 加载 bt_nodes 产出的动态库。
// ============================================================================
#ifndef BT_SERVER_DEMO_NODES_HPP
#define BT_SERVER_DEMO_NODES_HPP

#include <iostream>
#include <string>

#include "bt_core/control_node.hpp"
#include "bt_core/leaf_node.hpp"
#include "bt_core/node_factory.hpp"

namespace bt_server {

// ---------------------------------------------------------------------------
//  控制节点：Sequence —— 依次 tick 子节点，全 SUCCESS 才 SUCCESS。
// ---------------------------------------------------------------------------
class SequenceNode : public bt_core::ControlNode {
public:
  using ControlNode::ControlNode;
  bt_core::NodeStatus tick() override {
    for (const auto& child : children()) {
      const bt_core::NodeStatus st = child->executeTick();
      if (st == bt_core::NodeStatus::RUNNING) return bt_core::NodeStatus::RUNNING;
      if (st == bt_core::NodeStatus::FAILURE) return bt_core::NodeStatus::FAILURE;
    }
    return bt_core::NodeStatus::SUCCESS;
  }
};

// ---------------------------------------------------------------------------
//  控制节点：Fallback —— 依次 tick 子节点，遇第一个 SUCCESS 即 SUCCESS。
// ---------------------------------------------------------------------------
class FallbackNode : public bt_core::ControlNode {
public:
  using ControlNode::ControlNode;
  bt_core::NodeStatus tick() override {
    for (const auto& child : children()) {
      const bt_core::NodeStatus st = child->executeTick();
      if (st == bt_core::NodeStatus::RUNNING) return bt_core::NodeStatus::RUNNING;
      if (st == bt_core::NodeStatus::SUCCESS) return bt_core::NodeStatus::SUCCESS;
    }
    return bt_core::NodeStatus::FAILURE;
  }
};

// ---------------------------------------------------------------------------
//  动作节点：SaySomething —— 打印一句话，演示带输入端口的 Action。
// ---------------------------------------------------------------------------
class SaySomethingNode : public bt_core::ActionNode {
public:
  using ActionNode::ActionNode;
  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<std::string>(
        "message", "hello", "要打印到标准输出的文本"));
  }
  bt_core::NodeStatus tick() override {
    const std::string msg = getInput<std::string>("message").value_or("hello");
    std::cout << "[SaySomething] " << msg << std::endl;
    return bt_core::NodeStatus::SUCCESS;
  }
};

// ---------------------------------------------------------------------------
//  动作节点：AlwaysSuccess —— 永远成功，无端口。
// ---------------------------------------------------------------------------
class AlwaysSuccessNode : public bt_core::ActionNode {
public:
  using ActionNode::ActionNode;
  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::SUCCESS; }
};

// ---------------------------------------------------------------------------
//  动作节点：AlwaysFailure —— 永远失败，无端口。
// ---------------------------------------------------------------------------
class AlwaysFailureNode : public bt_core::ActionNode {
public:
  using ActionNode::ActionNode;
  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::FAILURE; }
};

// ---------------------------------------------------------------------------
//  条件节点：CheckBattery —— 读取阈值端口，演示 Condition + 输入端口。
// ---------------------------------------------------------------------------
class CheckBatteryNode : public bt_core::ConditionNode {
public:
  using ConditionNode::ConditionNode;
  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<std::string>(
        "min_level", "20", "电量低于该阈值则返回 FAILURE(此处为演示，恒成功)"));
  }
  bt_core::NodeStatus tick() override {
    // 演示用：恒返回 SUCCESS。真实条件应读取传感器并比较 min_level。
    return bt_core::NodeStatus::SUCCESS;
  }
};

/**
 * @brief 把上面所有示例节点注册进给定工厂。
 * @param factory 目标工厂(服务启动时调用一次)。
 *
 * 注：registerNodeType 重复注册会抛 std::logic_error，故只应调用一次。
 */
inline void registerDemoNodes(bt_core::NodeFactory& factory) {
  factory.registerNodeType<SequenceNode>("Sequence");
  factory.registerNodeType<FallbackNode>("Fallback");
  factory.registerNodeType<SaySomethingNode>("SaySomething");
  factory.registerNodeType<AlwaysSuccessNode>("AlwaysSuccess");
  factory.registerNodeType<AlwaysFailureNode>("AlwaysFailure");
  factory.registerNodeType<CheckBatteryNode>("CheckBattery");
}

}  // namespace bt_server

#endif  // BT_SERVER_DEMO_NODES_HPP
