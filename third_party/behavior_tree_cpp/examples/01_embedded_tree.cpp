// ============================================================================
//  examples/01_embedded_tree.cpp
//  示例 1：把行为树直接嵌入你自己的 C++ 程序(零插件、零网络、零 ROS)。
//
//  场景：一个巡逻机器人的简化决策 —— 先检查电量，电量不足就回充电桩，
//        否则继续巡逻。展示如何用代码直接构建并执行一棵行为树。
//
//  编译运行见 examples/CMakeLists.txt；它只依赖 bt::core。
// ============================================================================
#include <iostream>

#include "bt_core/control_node.hpp"
#include "bt_core/leaf_node.hpp"
#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"

using namespace bt_core;

// --------------------- 1) 定义业务节点(继承基类) ---------------------------

/// 条件：电量是否充足(从黑板读 battery 阈值判断)。
class BatteryOK : public ConditionNode {
 public:
  using ConditionNode::ConditionNode;
  static PortsList providedPorts() {
    return makePorts(InputPort<int>("level", "100", "当前电量百分比"));
  }
  NodeStatus tick() override {
    int level = 0;
    // 端口值在本例由黑板直接提供(见 main)，这里读黑板 key "battery"。
    if (auto v = blackboard()->get<int>("battery")) level = *v;
    std::cout << "  [BatteryOK] 当前电量=" << level << "% -> "
              << (level >= 20 ? "充足" : "不足") << "\n";
    return level >= 20 ? NodeStatus::SUCCESS : NodeStatus::FAILURE;
  }
};

/// 动作：巡逻(本例为同步动作，直接成功)。
class Patrol : public ActionNode {
 public:
  using ActionNode::ActionNode;
  NodeStatus tick() override {
    std::cout << "  [Patrol] 正在巡逻...\n";
    return NodeStatus::SUCCESS;
  }
};

/// 动作：返回充电桩。
class GoCharge : public ActionNode {
 public:
  using ActionNode::ActionNode;
  NodeStatus tick() override {
    std::cout << "  [GoCharge] 电量不足，返回充电桩充电\n";
    return NodeStatus::SUCCESS;
  }
};

// 一个最简 Fallback：依次尝试子节点，第一个 SUCCESS 即成功。
class Fallback : public ControlNode {
 public:
  using ControlNode::ControlNode;
  NodeStatus tick() override {
    for (auto& c : children_) {
      if (c->executeTick() == NodeStatus::SUCCESS) return NodeStatus::SUCCESS;
    }
    return NodeStatus::FAILURE;
  }
};

// 一个最简 Sequence：全部 SUCCESS 才成功。
class Sequence : public ControlNode {
 public:
  using ControlNode::ControlNode;
  NodeStatus tick() override {
    for (auto& c : children_) {
      auto s = c->executeTick();
      if (s != NodeStatus::SUCCESS) return s;
    }
    return NodeStatus::SUCCESS;
  }
};

// 一个最简 Inverter。
class Inverter : public DecoratorNode {
 public:
  using DecoratorNode::DecoratorNode;
  NodeStatus tick() override {
    auto s = child_->executeTick();
    if (s == NodeStatus::SUCCESS) return NodeStatus::FAILURE;
    if (s == NodeStatus::FAILURE) return NodeStatus::SUCCESS;
    return s;
  }
};

int main() {
  // --------------------- 2) 注册节点到工厂 ---------------------------------
  NodeFactory factory;
  factory.registerNodeType<BatteryOK>("BatteryOK");
  factory.registerNodeType<Patrol>("Patrol");
  factory.registerNodeType<GoCharge>("GoCharge");
  factory.registerNodeType<Fallback>("Fallback");
  factory.registerNodeType<Sequence>("Sequence");
  factory.registerNodeType<Inverter>("Inverter");

  // --------------------- 3) 用代码构建树 -----------------------------------
  //   Fallback
  //   ├── Sequence
  //   │   ├── BatteryOK
  //   │   └── Patrol
  //   └── GoCharge
  //   语义：电量足 -> 巡逻；否则 -> 充电。
  auto bb = Blackboard::create();
  NodeConfig cfg;
  cfg.blackboard = bb;

  auto root = std::dynamic_pointer_cast<ControlNode>(
      factory.createNode("Fallback", "root", cfg));
  auto seq = std::dynamic_pointer_cast<ControlNode>(
      factory.createNode("Sequence", "patrol_seq", cfg));
  seq->addChild(factory.createNode("BatteryOK", "check", cfg));
  seq->addChild(factory.createNode("Patrol", "patrol", cfg));
  root->addChild(seq);
  root->addChild(factory.createNode("GoCharge", "charge", cfg));

  Tree tree(root, bb);

  // --------------------- 4) 执行 -------------------------------------------
  std::cout << "=== 场景 A：电量充足(80%) ===\n";
  bb->set<int>("battery", 80);
  std::cout << "结果: " << toStr(tree.tickWhileRunning()) << "\n\n";

  std::cout << "=== 场景 B：电量不足(10%) ===\n";
  bb->set<int>("battery", 10);
  std::cout << "结果: " << toStr(tree.tickWhileRunning()) << "\n";

  return 0;
}
