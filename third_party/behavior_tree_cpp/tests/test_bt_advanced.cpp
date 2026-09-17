// ============================================================================
//  tests/test_bt_advanced.cpp
//  bt_core 进阶单元测试(GoogleTest)。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.2.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.2.0 (2026-07-13): 锁定严格 XML 结构、端口诊断与稳定属性顺序
//    - v1.1.0 (2026-07-13): 覆盖显式 halt 对终态控制/装饰子树的深度复位
//
//  覆盖 test_bt_core.cpp 之外的真实行为与边界:
//    1. 异步 RUNNING 语义(跨多拍完成 + 游标保留 + 不重启已完成子节点)
//    2. halt 中止(RUNNING 子树复位 IDLE + ActionNode::onHalted() 被调用)
//    3. 端口私有语义(同名字面量端口互不覆盖)
//    4. 端口重映射({key} 共享黑板 key)
//    5. XML round-trip 保真(load -> export -> load 幂等)
//    6. 错误路径(未注册节点 / 装饰节点子节点数非法 / XML 格式错误 / 类型不匹配)
//    7. 类型转换(convertFromString + getInput<T> 对 int/double/bool/string)
//
//  说明: bt_core 只提供基类层, 不含具体 Sequence/Fallback/Inverter(那些在
//  bt_nodes, 本次构建 OFF)。因此本文件在 ControlNode/DecoratorNode 之上自建
//  "有状态"的 Sequence/Fallback/Inverter, 用以验证基类层的异步调度机制
//  (状态跟踪 / haltChildren / onHalted / 端口解析)是否能正确支撑它们。
// ============================================================================
#include <gtest/gtest.h>

#include <cmath>
#include <memory>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "bt_core/xml_parser.hpp"

using namespace bt_core;

// ============================================================================
//  测试用具体节点
// ============================================================================

/// 跨多拍完成的异步动作: 前 running_ticks 拍返回 RUNNING, 第 running_ticks+1
/// 拍返回 SUCCESS。记录 tick 次数 / 完成次数 / 是否被 halt, 以观测调度行为。
class CountingAsyncAction : public ActionNode {
 public:
  using ActionNode::ActionNode;
  int  running_ticks = 1;   ///< 前置 RUNNING 的拍数(N)
  int  tick_count    = 0;   ///< tick() 被调用总次数
  int  success_count = 0;   ///< 返回 SUCCESS 的次数(应恰为 1, 证明未被重启)
  bool halted        = false;
  int  halt_count    = 0;

  NodeStatus tick() override {
    ++tick_count;
    if (tick_count <= running_ticks) return NodeStatus::RUNNING;
    ++success_count;
    return NodeStatus::SUCCESS;
  }
  void onHalted() override {
    halted = true;
    ++halt_count;
  }
};

/// 同步动作, 固定返回 SUCCESS, 记录被 tick 的次数(用于验证"已完成子节点不被重启")。
class SyncCountAction : public ActionNode {
 public:
  using ActionNode::ActionNode;
  int tick_count = 0;
  NodeStatus tick() override {
    ++tick_count;
    return NodeStatus::SUCCESS;
  }
};

/// 固定返回 FAILURE。
class AlwaysFailure : public ActionNode {
 public:
  using ActionNode::ActionNode;
  NodeStatus tick() override { return NodeStatus::FAILURE; }
};

/// 读取输入端口 "message" 并保存到 seen, 用于验证端口私有/重映射语义。
class ReadMessageAction : public ActionNode {
 public:
  using ActionNode::ActionNode;
  static PortsList providedPorts() {
    return makePorts(InputPort<std::string>("message", "", "要读取的文本"));
  }
  std::string seen = "<unset>";
  NodeStatus tick() override {
    seen = getInput<std::string>("message").value_or("<none>");
    return NodeStatus::SUCCESS;
  }
};

/// 通过输出端口 "out" 写一个固定字符串到黑板(经重映射可共享 key)。
class WriteAction : public ActionNode {
 public:
  using ActionNode::ActionNode;
  static PortsList providedPorts() {
    return makePorts(OutputPort<std::string>("out", "输出"));
  }
  std::string value_to_write = "shared_val";
  NodeStatus tick() override {
    setOutput<std::string>("out", value_to_write);
    return NodeStatus::SUCCESS;
  }
};

/// 多端口动作，用于验证 XML 导出属性顺序不依赖 unordered_map 迭代顺序。
class OrderedPortsAction : public ActionNode {
 public:
  using ActionNode::ActionNode;
  static PortsList providedPorts() {
    return makePorts(
        InputPort<std::string>("zeta", "", "末位端口"),
        InputPort<std::string>("alpha", "", "首位端口"),
        OutputPort<std::string>("middle", "中间端口"));
  }
  NodeStatus tick() override { return NodeStatus::SUCCESS; }
};

// --- 有状态控制/装饰节点(在基类之上自建, 实现正确的游标语义) ----------------

/// 有状态 Sequence: 子节点 RUNNING 时保留游标, 下一拍从该子节点继续,
/// 不重新 tick 已 SUCCESS 的前序子节点。任一子节点 FAILURE 立即整体 FAILURE。
class StatefulSequence : public ControlNode {
 public:
  using ControlNode::ControlNode;
  NodeStatus tick() override {
    while (cursor_ < children_.size()) {
      const NodeStatus s = children_[cursor_]->executeTick();
      if (s == NodeStatus::RUNNING) return NodeStatus::RUNNING;  // 保留游标
      if (s == NodeStatus::FAILURE) {
        haltChildren();
        cursor_ = 0;
        return NodeStatus::FAILURE;
      }
      ++cursor_;  // SUCCESS -> 前进
    }
    cursor_ = 0;  // 全部成功, 复位以备下次运行
    return NodeStatus::SUCCESS;
  }
  void halt() override {
    ControlNode::halt();
    cursor_ = 0;
  }

 private:
  size_t cursor_ = 0;
};

/// 有状态 Fallback: 子节点 RUNNING 时保留游标; 遇第一个 SUCCESS 即整体 SUCCESS;
/// 全部 FAILURE 才 FAILURE。
class StatefulFallback : public ControlNode {
 public:
  using ControlNode::ControlNode;
  NodeStatus tick() override {
    while (cursor_ < children_.size()) {
      const NodeStatus s = children_[cursor_]->executeTick();
      if (s == NodeStatus::RUNNING) return NodeStatus::RUNNING;  // 保留游标
      if (s == NodeStatus::SUCCESS) {
        haltChildren();
        cursor_ = 0;
        return NodeStatus::SUCCESS;
      }
      ++cursor_;  // FAILURE -> 尝试下一个
    }
    cursor_ = 0;
    return NodeStatus::FAILURE;
  }
  void halt() override {
    ControlNode::halt();
    cursor_ = 0;
  }

 private:
  size_t cursor_ = 0;
};

/// 简单 Inverter 装饰节点(用于 round-trip 的嵌套结构)。
class InverterNode : public DecoratorNode {
 public:
  using DecoratorNode::DecoratorNode;
  NodeStatus tick() override {
    if (!child_) return NodeStatus::FAILURE;
    const NodeStatus s = child_->executeTick();
    if (s == NodeStatus::SUCCESS) return NodeStatus::FAILURE;
    if (s == NodeStatus::FAILURE) return NodeStatus::SUCCESS;
    return s;
  }
};

namespace {

/// 在工厂注册本文件用到的全部节点类型。
void registerStdNodes(NodeFactory& f) {
  f.registerNodeType<StatefulSequence>("Sequence");
  f.registerNodeType<StatefulFallback>("Fallback");
  f.registerNodeType<InverterNode>("Inverter");
  f.registerNodeType<ReadMessageAction>("ReadMessageAction");
  f.registerNodeType<WriteAction>("WriteAction");
  f.registerNodeType<OrderedPortsAction>("OrderedPortsAction");
  f.registerNodeType<AlwaysFailure>("AlwaysFailure");
}

/// 在树里按实例名找到某具体类型的节点。
template <typename T>
std::shared_ptr<T> findByName(const Tree& tree, const std::string& name) {
  for (const auto& n : tree.nodes()) {
    if (n->name() == name) {
      if (auto p = std::dynamic_pointer_cast<T>(n)) return p;
    }
  }
  return nullptr;
}

/// 执行一次预期失败的解析并返回诊断文本，便于同时锁定异常与上下文。
std::string parseError(XmlParser& parser, const std::string& xml) {
  try {
    parser.loadFromText(xml);
  } catch (const std::runtime_error& error) {
    return error.what();
  }
  ADD_FAILURE() << "XML 解析本应失败";
  return {};
}

}  // namespace

// ============================================================================
//  1. 异步 RUNNING 语义: 游标保留 + 不重启已完成子节点
// ============================================================================

TEST(AsyncRunning, SequencePreservesCursorAndDoesNotRestartCompletedChild) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};

  auto seq = std::make_shared<StatefulSequence>("seq", cfg);
  auto c0  = std::make_shared<SyncCountAction>("c0", cfg);       // 同步 SUCCESS
  auto c1  = std::make_shared<CountingAsyncAction>("c1", cfg);   // 异步: 2 拍 RUNNING
  c1->running_ticks = 2;
  seq->addChild(c0);
  seq->addChild(c1);

  // 第 1 拍: c0 SUCCESS(游标前进), c1 第 1 次 RUNNING -> 整体 RUNNING
  EXPECT_EQ(seq->executeTick(), NodeStatus::RUNNING);
  EXPECT_EQ(c0->tick_count, 1);
  EXPECT_EQ(c1->tick_count, 1);

  // 第 2 拍: 游标停在 c1, c0 不应再被 tick; c1 第 2 次 RUNNING -> 整体 RUNNING
  EXPECT_EQ(seq->executeTick(), NodeStatus::RUNNING);
  EXPECT_EQ(c0->tick_count, 1);  // 关键: 已完成子节点未被重启
  EXPECT_EQ(c1->tick_count, 2);

  // 第 3 拍: c1 第 3 次 -> SUCCESS, 游标走完 -> 整体 SUCCESS
  EXPECT_EQ(seq->executeTick(), NodeStatus::SUCCESS);
  EXPECT_EQ(c0->tick_count, 1);     // 仍未被重启
  EXPECT_EQ(c1->tick_count, 3);
  EXPECT_EQ(c1->success_count, 1);  // 恰好完成一次
}

TEST(AsyncRunning, FallbackPreservesCursorOnRunningChild) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};

  auto fb = std::make_shared<StatefulFallback>("fb", cfg);
  auto c0 = std::make_shared<AlwaysFailure>("c0", cfg);          // 同步 FAILURE
  auto c1 = std::make_shared<CountingAsyncAction>("c1", cfg);    // 异步: 1 拍 RUNNING
  c1->running_ticks = 1;
  fb->addChild(c0);
  fb->addChild(c1);

  // 第 1 拍: c0 FAILURE(游标前进到 c1), c1 第 1 次 RUNNING -> 整体 RUNNING
  EXPECT_EQ(fb->executeTick(), NodeStatus::RUNNING);
  EXPECT_EQ(c1->tick_count, 1);

  // 第 2 拍: 游标停在 c1; c1 第 2 次 -> SUCCESS -> 整体 SUCCESS
  EXPECT_EQ(fb->executeTick(), NodeStatus::SUCCESS);
  EXPECT_EQ(c1->tick_count, 2);
  EXPECT_EQ(c1->success_count, 1);
}

// ============================================================================
//  2. halt 中止: RUNNING 子树复位 IDLE + ActionNode::onHalted() 被调用
// ============================================================================

TEST(Halt, RunningSubtreeResetsToIdleAndCallsOnHalted) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};

  auto seq = std::make_shared<StatefulSequence>("seq", cfg);
  auto c   = std::make_shared<CountingAsyncAction>("async", cfg);
  c->running_ticks = 5;  // 长时间 RUNNING
  seq->addChild(c);

  Tree tree(seq, bb);

  // 先 tick 一拍, 让异步子节点进入 RUNNING
  EXPECT_EQ(tree.tickOnce(), NodeStatus::RUNNING);
  EXPECT_EQ(c->status(), NodeStatus::RUNNING);
  EXPECT_FALSE(c->halted);

  // halt 整棵树
  tree.halt();
  EXPECT_TRUE(c->halted);                       // onHalted() 被调用
  EXPECT_EQ(c->status(), NodeStatus::IDLE);     // 子节点复位
  EXPECT_EQ(seq->status(), NodeStatus::IDLE);   // 控制节点复位
}

TEST(Halt, CompletedControlAndDecoratorDescendantsReceiveOnHalted) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};

  auto untouched_seq = std::make_shared<StatefulSequence>("untouched", cfg);
  auto untouched_child =
      std::make_shared<CountingAsyncAction>("untouched_child", cfg);
  untouched_seq->addChild(untouched_child);
  Tree untouched_tree(untouched_seq, bb);
  untouched_tree.halt();
  EXPECT_EQ(untouched_child->halt_count, 0);

  auto root_action =
      std::make_shared<CountingAsyncAction>("root_action", cfg);
  root_action->running_ticks = 0;
  Tree root_action_tree(root_action, bb);
  root_action_tree.halt();
  EXPECT_EQ(root_action->halt_count, 0);
  EXPECT_EQ(root_action_tree.tickOnce(), NodeStatus::SUCCESS);
  root_action_tree.halt();
  EXPECT_EQ(root_action->halt_count, 1);
  root_action_tree.halt();
  EXPECT_EQ(root_action->halt_count, 1);

  auto seq = std::make_shared<StatefulSequence>("seq", cfg);
  auto seq_child = std::make_shared<CountingAsyncAction>("seq_child", cfg);
  seq_child->running_ticks = 0;
  seq->addChild(seq_child);
  Tree sequence_tree(seq, bb);

  EXPECT_EQ(sequence_tree.tickOnce(), NodeStatus::SUCCESS);
  EXPECT_FALSE(seq_child->halted);
  sequence_tree.halt();
  EXPECT_TRUE(seq_child->halted);
  EXPECT_EQ(seq_child->halt_count, 1);
  EXPECT_EQ(seq_child->status(), NodeStatus::IDLE);
  sequence_tree.halt();
  EXPECT_EQ(seq_child->halt_count, 1);

  auto inverter = std::make_shared<InverterNode>("inverter", cfg);
  auto decorator_child =
      std::make_shared<CountingAsyncAction>("decorator_child", cfg);
  decorator_child->running_ticks = 0;
  inverter->setChild(decorator_child);
  Tree decorator_tree(inverter, bb);

  EXPECT_EQ(decorator_tree.tickOnce(), NodeStatus::FAILURE);
  EXPECT_FALSE(decorator_child->halted);
  decorator_tree.halt();
  EXPECT_TRUE(decorator_child->halted);
  EXPECT_EQ(decorator_child->halt_count, 1);
  EXPECT_EQ(decorator_child->status(), NodeStatus::IDLE);
  decorator_tree.halt();
  EXPECT_EQ(decorator_child->halt_count, 1);
}

// ============================================================================
//  3. 端口私有语义: 两个同名字面量端口互不覆盖(之前修复的关键 bug)
// ============================================================================

TEST(PortPrivacy, SameNamedLiteralPortsDoNotOverwriteEachOther) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);

  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Sequence name="root">
          <ReadMessageAction name="a" message="hello"/>
          <ReadMessageAction name="b" message="world"/>
        </Sequence>
      </BehaviorTree>
    </root>
  )";

  Tree tree = parser.loadFromText(xml);
  EXPECT_EQ(tree.tickWhileRunning(), NodeStatus::SUCCESS);

  auto a = findByName<ReadMessageAction>(tree, "a");
  auto b = findByName<ReadMessageAction>(tree, "b");
  ASSERT_NE(a, nullptr);
  ASSERT_NE(b, nullptr);

  // 字面量进入各自节点本地 port_values, 不入共享黑板 -> 互不覆盖。
  EXPECT_EQ(a->seen, "hello");
  EXPECT_EQ(b->seen, "world");

  // 验证字面量确实没有污染共享黑板 key "message"。
  EXPECT_FALSE(tree.blackboard()->contains("message"));
}

// ============================================================================
//  4. 端口重映射: {key} 重映射, 多节点通过同一黑板 key 共享数据
// ============================================================================

TEST(PortRemap, MultipleNodesShareSameBlackboardKey) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);

  // WriteAction.out 与 ReadMessageAction.message 都重映射到黑板 key "data"。
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Sequence name="root">
          <WriteAction name="writer" out="{data}"/>
          <ReadMessageAction name="reader" message="{data}"/>
        </Sequence>
      </BehaviorTree>
    </root>
  )";

  Tree tree = parser.loadFromText(xml);
  EXPECT_EQ(tree.tickWhileRunning(), NodeStatus::SUCCESS);

  // writer 写入 -> 共享 key "data"; reader 通过同一 key 读出。
  EXPECT_EQ(tree.blackboard()->get<std::string>("data").value(), "shared_val");
  auto reader = findByName<ReadMessageAction>(tree, "reader");
  ASSERT_NE(reader, nullptr);
  EXPECT_EQ(reader->seen, "shared_val");
}

// ============================================================================
//  5. XML round-trip 保真: load -> export -> load 幂等 + 结构与端口值一致
// ============================================================================

TEST(XmlRoundTrip, ComplexTreeIsStableAcrossLoadExportLoad) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);

  // 复杂树: 字面量端口 + 重映射端口 + 嵌套控制(Sequence/Fallback) + 装饰(Inverter)。
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Sequence name="root">
          <ReadMessageAction name="greet" message="hello"/>
          <Inverter>
            <AlwaysFailure name="boom"/>
          </Inverter>
          <Fallback name="fb">
            <ReadMessageAction name="r1" message="{shared}"/>
            <WriteAction name="w1" out="{shared}"/>
          </Fallback>
        </Sequence>
      </BehaviorTree>
    </root>
  )";

  Tree treeA = parser.loadFromText(xml);
  const std::string xmlA = parser.writeToText(treeA, "MainTree");

  Tree treeB = parser.loadFromText(xmlA);
  const std::string xmlB = parser.writeToText(treeB, "MainTree");

  // 幂等: 二次导出与一次导出完全一致。
  EXPECT_EQ(xmlA, xmlB);

  // 结构保真: DFS 注册名序列一致。
  std::vector<std::string> dfsA, dfsB;
  std::vector<int> depthA, depthB;
  treeA.visitNodes([&](const TreeNode::Ptr& n, int d) {
    dfsA.push_back(n->registrationName());
    depthA.push_back(d);
  });
  treeB.visitNodes([&](const TreeNode::Ptr& n, int d) {
    dfsB.push_back(n->registrationName());
    depthB.push_back(d);
  });
  const std::vector<std::string> expected_dfs = {
      "Sequence", "ReadMessageAction", "Inverter", "AlwaysFailure",
      "Fallback", "ReadMessageAction", "WriteAction"};
  EXPECT_EQ(dfsA, expected_dfs);
  EXPECT_EQ(dfsB, expected_dfs);
  EXPECT_EQ(depthA, depthB);

  // 端口值保真: 字面量端口与重映射端口都还原。
  auto greet = findByName<ReadMessageAction>(treeB, "greet");
  ASSERT_NE(greet, nullptr);
  EXPECT_EQ(greet->config().port_values.at("message"), "hello");

  auto r1 = findByName<ReadMessageAction>(treeB, "r1");
  ASSERT_NE(r1, nullptr);
  EXPECT_EQ(r1->config().port_remap.at("message"), "shared");

  // 重映射在运行后仍正确共享(语义保真, 非仅文本保真)。
  EXPECT_EQ(treeB.tickWhileRunning(), NodeStatus::SUCCESS);
}

TEST(XmlRoundTrip, ExportSortsPortAttributesByName) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);

  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <OrderedPortsAction zeta="z" middle="{m}" alpha="a"/>
      </BehaviorTree>
    </root>
  )";

  const std::string exported = parser.writeToText(
      parser.loadFromText(xml), "MainTree");
  const auto alpha = exported.find("alpha=\"a\"");
  const auto middle = exported.find("middle=\"{m}\"");
  const auto zeta = exported.find("zeta=\"z\"");
  ASSERT_NE(alpha, std::string::npos);
  ASSERT_NE(middle, std::string::npos);
  ASSERT_NE(zeta, std::string::npos);
  EXPECT_LT(alpha, middle);
  EXPECT_LT(middle, zeta);
}

// ============================================================================
//  6. 错误路径
// ============================================================================

TEST(ErrorPaths, UnregisteredNodeNameThrows) {
  NodeFactory factory;  // 故意不注册任何节点
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};
  // 直接工厂路径。
  EXPECT_THROW(factory.createNode("Ghost", "x", cfg), std::runtime_error);

  // XML 路径: 根节点是未注册标签。
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <NotRegisteredNode/>
      </BehaviorTree>
    </root>
  )";
  EXPECT_THROW(parser.loadFromText(xml), std::runtime_error);
}

TEST(ErrorPaths, DecoratorMissingChildThrows) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Inverter name="guard"/>
      </BehaviorTree>
    </root>
  )";
  const std::string error = parseError(parser, xml);
  EXPECT_NE(error.find("Inverter"), std::string::npos);
  EXPECT_NE(error.find("guard"), std::string::npos);
  EXPECT_NE(error.find("恰好一个子节点"), std::string::npos);
  EXPECT_NE(error.find("实际为 0"), std::string::npos);
}

TEST(ErrorPaths, DecoratorMultipleChildrenThrows) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Inverter name="guard">
          <AlwaysFailure name="a"/>
          <AlwaysFailure name="b"/>
        </Inverter>
      </BehaviorTree>
    </root>
  )";
  const std::string error = parseError(parser, xml);
  EXPECT_NE(error.find("Inverter"), std::string::npos);
  EXPECT_NE(error.find("guard"), std::string::npos);
  EXPECT_NE(error.find("恰好一个子节点"), std::string::npos);
  EXPECT_NE(error.find("实际为 2"), std::string::npos);
}

TEST(ErrorPaths, UnusedBehaviorTreeDefinitionIsStillValidated) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string error = parseError(parser, R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree"><AlwaysFailure/></BehaviorTree>
      <BehaviorTree ID="BrokenHelper">
        <AlwaysFailure/>
        <AlwaysFailure/>
      </BehaviorTree>
    </root>
  )");
  EXPECT_NE(error.find("BrokenHelper"), std::string::npos);
  EXPECT_NE(error.find("恰好一个根节点"), std::string::npos);
}

TEST(ErrorPaths, LeafChildReportsNodeContext) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string error = parseError(parser, R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <ReadMessageAction name="reader" message="hello">
          <AlwaysFailure/>
        </ReadMessageAction>
      </BehaviorTree>
    </root>
  )");
  EXPECT_NE(error.find("ReadMessageAction"), std::string::npos);
  EXPECT_NE(error.find("reader"), std::string::npos);
  EXPECT_NE(error.find("叶子节点"), std::string::npos);
  EXPECT_NE(error.find("子节点"), std::string::npos);
}

TEST(ErrorPaths, MultipleBehaviorTreeRootsReportTreeId) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string error = parseError(parser, R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <AlwaysFailure name="first"/>
        <AlwaysFailure name="second"/>
      </BehaviorTree>
    </root>
  )");
  EXPECT_NE(error.find("BehaviorTree"), std::string::npos);
  EXPECT_NE(error.find("MainTree"), std::string::npos);
  EXPECT_NE(error.find("恰好一个根节点"), std::string::npos);
}

TEST(ErrorPaths, UnknownPortReportsRegistrationAndInstanceNames) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string error = parseError(parser, R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <ReadMessageAction name="reader" messsage="typo"/>
      </BehaviorTree>
    </root>
  )");
  EXPECT_NE(error.find("ReadMessageAction"), std::string::npos);
  EXPECT_NE(error.find("reader"), std::string::npos);
  EXPECT_NE(error.find("messsage"), std::string::npos);
  EXPECT_NE(error.find("未声明端口"), std::string::npos);
}

TEST(ErrorPaths, DecoratorSetChildTwiceThrowsLogicError) {
  auto bb = Blackboard::create();
  NodeConfig cfg{bb, {}, {}};
  auto inv = std::make_shared<InverterNode>("inv", cfg);
  inv->setChild(std::make_shared<AlwaysFailure>("c1", cfg));
  EXPECT_THROW(inv->setChild(std::make_shared<AlwaysFailure>("c2", cfg)),
               std::logic_error);
}

TEST(ErrorPaths, MalformedXmlThrows) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  EXPECT_THROW(parser.loadFromText("this is <<< not xml >>>"),
               std::runtime_error);
}

TEST(ErrorPaths, MissingRootElementThrows) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  // 合法 XML 但没有 <root>。
  EXPECT_THROW(parser.loadFromText("<notroot/>"), std::runtime_error);
}

TEST(ErrorPaths, EmptyBehaviorTreeThrows) {
  NodeFactory factory;
  registerStdNodes(factory);
  XmlParser parser(factory);
  const std::string xml = R"(
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree"></BehaviorTree>
    </root>
  )";
  EXPECT_THROW(parser.loadFromText(xml), std::runtime_error);
}

TEST(ErrorPaths, BlackboardTypeMismatchThrows) {
  auto bb = Blackboard::create();
  bb->set<std::string>("key", "not_an_int");

  // 直接黑板路径。
  EXPECT_THROW(bb->get<int>("key"), std::runtime_error);

  // 通过端口重映射读取(getInput<int> -> 黑板类型不匹配)。
  NodeConfig cfg;
  cfg.blackboard = bb;
  cfg.port_remap["message"] = "key";  // 重映射到 string 类型的 key
  auto node = std::make_shared<ReadMessageAction>("n", cfg);
  EXPECT_THROW((node->getInput<int>("message")), std::runtime_error);
}

// ============================================================================
//  7. 类型转换: convertFromString + getInput<T>
// ============================================================================

TEST(TypeConversion, ConvertFromStringPrimitives) {
  EXPECT_EQ(convertFromString<std::string>("hello").value(), "hello");

  EXPECT_EQ(convertFromString<int>("42").value(), 42);
  EXPECT_EQ(convertFromString<int>("-7").value(), -7);

  EXPECT_NEAR(convertFromString<double>("3.14").value(), 3.14, 1e-9);

  EXPECT_TRUE(convertFromString<bool>("true").value());
  EXPECT_TRUE(convertFromString<bool>("1").value());
  EXPECT_FALSE(convertFromString<bool>("false").value());
  EXPECT_FALSE(convertFromString<bool>("0").value());

  // 非法数字字面量 -> nullopt。
  EXPECT_FALSE(convertFromString<int>("not_a_number").has_value());
}

TEST(TypeConversion, GetInputConvertsLiteralPortValues) {
  auto bb = Blackboard::create();
  NodeConfig cfg;
  cfg.blackboard = bb;
  cfg.port_values["i"] = "42";
  cfg.port_values["d"] = "2.5";
  cfg.port_values["b"] = "true";
  cfg.port_values["s"] = "literal";
  cfg.port_values["bad"] = "xyz";

  auto node = std::make_shared<ReadMessageAction>("n", cfg);

  EXPECT_EQ(node->getInput<int>("i").value(), 42);
  EXPECT_NEAR(node->getInput<double>("d").value(), 2.5, 1e-9);
  EXPECT_TRUE(node->getInput<bool>("b").value());
  EXPECT_EQ(node->getInput<std::string>("s").value(), "literal");

  // "xyz" 无法转 int -> nullopt。
  EXPECT_FALSE(node->getInput<int>("bad").has_value());
}

TEST(TypeConversion, GetInputResolutionPriority) {
  // 验证 getInput 的三级解析优先级: 重映射 > 本地字面量 > 按端口名读黑板。
  auto bb = Blackboard::create();

  // (3) 回退: 无重映射无字面量 -> 按端口名直接读黑板。
  {
    NodeConfig cfg;
    cfg.blackboard = bb;
    bb->set<std::string>("message", "from_blackboard");
    auto node = std::make_shared<ReadMessageAction>("n", cfg);
    EXPECT_EQ(node->getInput<std::string>("message").value(), "from_blackboard");
  }
  // (2) 本地字面量优先于按名读黑板。
  {
    NodeConfig cfg;
    cfg.blackboard = bb;
    cfg.port_values["message"] = "from_literal";
    auto node = std::make_shared<ReadMessageAction>("n", cfg);
    EXPECT_EQ(node->getInput<std::string>("message").value(), "from_literal");
  }
  // (1) 重映射优先级最高。
  {
    NodeConfig cfg;
    cfg.blackboard = bb;
    cfg.port_values["message"] = "ignored_literal";
    cfg.port_remap["message"]  = "remapped_key";
    bb->set<std::string>("remapped_key", "from_remap");
    auto node = std::make_shared<ReadMessageAction>("n", cfg);
    EXPECT_EQ(node->getInput<std::string>("message").value(), "from_remap");
  }
}
