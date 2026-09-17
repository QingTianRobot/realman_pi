// ============================================================================
//  tests/test_bt_core.cpp
//  bt_core 核心库单元测试(GoogleTest)。
//  覆盖：NodeStatus / Blackboard / 三大族基类 / NodeFactory / Tree。
// ============================================================================
#include <gtest/gtest.h>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"

using namespace bt_core;

// --------------------------- 测试用具体节点 ---------------------------------

/// 可配置固定返回值的桩动作。
class StubAction : public ActionNode {
 public:
  StubAction(std::string n, NodeConfig c) : ActionNode(std::move(n), std::move(c)) {}
  static PortsList providedPorts() {
    return makePorts(InputPort<std::string>("ret", "SUCCESS", "返回值"));
  }
  NodeStatus tick() override {
    auto r = getInput<std::string>("ret").value_or("SUCCESS");
    if (r == "FAILURE") return NodeStatus::FAILURE;
    if (r == "RUNNING") return NodeStatus::RUNNING;
    return NodeStatus::SUCCESS;
  }
};

/// 最小 Sequence。
class MiniSequence : public ControlNode {
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

/// 最小 Inverter。
class MiniInverter : public DecoratorNode {
 public:
  using DecoratorNode::DecoratorNode;
  NodeStatus tick() override {
    auto s = child_->executeTick();
    if (s == NodeStatus::SUCCESS) return NodeStatus::FAILURE;
    if (s == NodeStatus::FAILURE) return NodeStatus::SUCCESS;
    return s;
  }
};

// ------------------------------- NodeStatus ---------------------------------

TEST(NodeStatus, CompletedAndToStr) {
  EXPECT_TRUE(isStatusCompleted(NodeStatus::SUCCESS));
  EXPECT_TRUE(isStatusCompleted(NodeStatus::FAILURE));
  EXPECT_FALSE(isStatusCompleted(NodeStatus::RUNNING));
  EXPECT_FALSE(isStatusCompleted(NodeStatus::IDLE));
  EXPECT_EQ(toStr(NodeStatus::RUNNING), "RUNNING");
  EXPECT_EQ(toStr(NodeType::CONTROL), "Control");
}

// ------------------------------- Blackboard ---------------------------------

TEST(Blackboard, SetGetAndTypeSafety) {
  auto bb = Blackboard::create();
  bb->set<std::string>("msg", "hello");
  bb->set<int>("n", 7);
  EXPECT_EQ(bb->get<std::string>("msg").value(), "hello");
  EXPECT_EQ(bb->get<int>("n").value(), 7);
  EXPECT_FALSE(bb->get<int>("missing").has_value());
  EXPECT_TRUE(bb->contains("msg"));
  EXPECT_THROW(bb->get<int>("msg"), std::runtime_error);  // 类型不匹配
}

TEST(Blackboard, Ports) {
  auto ports = makePorts(
      InputPort<std::string>("in", "def", "输入"),
      OutputPort<int>("out", "输出"));
  EXPECT_EQ(ports.size(), 2u);
  EXPECT_EQ(ports.at("in").direction, PortDirection::INPUT);
  EXPECT_EQ(ports.at("out").direction, PortDirection::OUTPUT);
}

// ------------------------------ 基类层逻辑 ----------------------------------

TEST(ControlNode, SequenceSuccessAndFailure) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}};

  auto seq = std::make_shared<MiniSequence>("seq", cfg);
  auto c1 = std::make_shared<StubAction>("c1", cfg);
  auto c2 = std::make_shared<StubAction>("c2", cfg);
  seq->addChild(c1);
  seq->addChild(c2);
  EXPECT_EQ(seq->type(), NodeType::CONTROL);
  EXPECT_EQ(seq->childrenCount(), 2u);
  EXPECT_EQ(seq->executeTick(), NodeStatus::SUCCESS);

  // 让 c1 失败 -> 整体失败
  bb->set<std::string>("ret", "FAILURE");
  EXPECT_EQ(seq->executeTick(), NodeStatus::FAILURE);
}

TEST(DecoratorNode, InverterAndSingleChildGuard) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}};

  auto inv = std::make_shared<MiniInverter>("inv", cfg);
  inv->setChild(std::make_shared<StubAction>("c", cfg));  // 默认返回 SUCCESS
  EXPECT_EQ(inv->type(), NodeType::DECORATOR);
  EXPECT_EQ(inv->executeTick(), NodeStatus::FAILURE);      // 反转

  // 重复 setChild 抛异常
  EXPECT_THROW(inv->setChild(std::make_shared<StubAction>("c2", cfg)),
               std::logic_error);
}

TEST(LeafNode, ActionTypeFixed) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}};
  StubAction a("a", cfg);
  EXPECT_EQ(a.type(), NodeType::ACTION);
}

// ------------------------------ NodeFactory ---------------------------------

TEST(NodeFactory, RegisterCreateAndManifest) {
  NodeFactory factory;
  factory.registerNodeType<MiniSequence>("Sequence");
  factory.registerNodeType<StubAction>("Stub");

  EXPECT_EQ(factory.size(), 2u);
  EXPECT_TRUE(factory.isRegistered("Sequence"));
  EXPECT_FALSE(factory.isRegistered("Nope"));
  EXPECT_THROW(factory.registerNodeType<StubAction>("Stub"), std::logic_error);

  bool found_stub = false;
  for (auto& m : factory.manifests()) {
    if (m.registration_name == "Stub") {
      found_stub = true;
      EXPECT_EQ(m.type, NodeType::ACTION);
      EXPECT_EQ(m.ports.count("ret"), 1u);
    }
  }
  EXPECT_TRUE(found_stub);

  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}};
  EXPECT_THROW(factory.createNode("Ghost", "x", cfg), std::runtime_error);
  auto node = factory.createNode("Stub", "x", cfg);
  EXPECT_EQ(node->registrationName(), "Stub");
}

// --------------------------------- Tree -------------------------------------

TEST(Tree, TickTraverseAndCallback) {
  NodeFactory factory;
  factory.registerNodeType<MiniSequence>("Sequence");
  factory.registerNodeType<StubAction>("Stub");

  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}};
  auto root = std::dynamic_pointer_cast<ControlNode>(
      factory.createNode("Sequence", "root", cfg));
  root->addChild(factory.createNode("Stub", "s1", cfg));
  root->addChild(factory.createNode("Stub", "s2", cfg));

  Tree tree(root, bb);
  EXPECT_EQ(tree.nodes().size(), 3u);
  for (auto& n : tree.nodes()) EXPECT_NE(n->id(), 0);

  int cb = 0;
  tree.setStatusCallback([&](uint16_t, NodeStatus, NodeStatus) { cb++; });
  EXPECT_EQ(tree.tickWhileRunning(), NodeStatus::SUCCESS);
  EXPECT_GT(cb, 0);

  int visited = 0, max_depth = 0;
  tree.visitNodes([&](const TreeNode::Ptr&, int d) {
    visited++;
    max_depth = std::max(max_depth, d);
  });
  EXPECT_EQ(visited, 3);
  EXPECT_EQ(max_depth, 1);
}
