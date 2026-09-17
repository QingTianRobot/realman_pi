// ============================================================================
//  tests/test_subtree.cpp
//  XmlParser 的 <SubTree ID="..."/> 引用支持单元测试。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 覆盖重复/缺失树 ID 与 SubTree 非法结构
//
//  覆盖:
//    - 基本子树引用:Main 引用 Patrol,展开后正常 tick
//    - 多引用 + 嵌套(SubTree 内再引 SubTree)
//    - 循环引用检测(Main 引 Main / A引B,B引A 都应抛错)
//    - 未定义 ID 报错
//    - <SubTree> 缺 ID 属性报错
//    - 嵌套深度超限报错(用大量层级触发,边界场景可选验证)
//
//  风格与 test_data_nodes.cpp 一致:直接 include bt_nodes 节点头文件,
//  在测试里 NodeFactory 手动注册,无需依赖外部 .dylib 插件。
// ============================================================================
#include <gtest/gtest.h>

#include <algorithm>
#include <sstream>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/xml_parser.hpp"

#include "control/sequence_node.hpp"
#include "action/always_success_node.hpp"
#include "action/always_failure_node.hpp"

using namespace bt_core;

namespace {

/// 注册 SubTree 测试所需的最小节点集合。
void registerCore(NodeFactory& f) {
  f.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  f.registerNodeType<bt_nodes::AlwaysSuccessNode>("AlwaysSuccess");
  f.registerNodeType<bt_nodes::AlwaysFailureNode>("AlwaysFailure");
}

/// 生成 Main -> T1 -> ... -> TN 的线性引用链，最后以成功叶子收束。
std::string subtreeChain(size_t references) {
  std::ostringstream xml;
  xml << "<root main_tree_to_execute=\"Main\">";
  for (size_t i = 0; i <= references; ++i) {
    const std::string id = i == 0 ? "Main" : "T" + std::to_string(i);
    xml << "<BehaviorTree ID=\"" << id << "\">";
    if (i < references) {
      xml << "<SubTree ID=\"T" << (i + 1) << "\"/>";
    } else {
      xml << "<AlwaysSuccess/>";
    }
    xml << "</BehaviorTree>";
  }
  xml << "</root>";
  return xml.str();
}

}  // namespace

// ---------------------------- 基本引用 -------------------------------------

TEST(SubTree, BasicReferenceExpandsAndTicks) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main">
      <Sequence><SubTree ID="Helper"/></Sequence>
    </BehaviorTree>
    <BehaviorTree ID="Helper">
      <Sequence><AlwaysSuccess/><AlwaysSuccess/></Sequence>
    </BehaviorTree>
  </root>)";
  Tree t = p.loadFromText(xml);
  EXPECT_EQ(t.tickWhileRunning(), NodeStatus::SUCCESS);
  // 展开后节点总数 = Main的Sequence + Helper的Sequence + 2 个 AlwaysSuccess = 4
  EXPECT_EQ(t.nodes().size(), 4u);
}

// ---------------------------- 多引用 + 嵌套 ---------------------------------

TEST(SubTree, MultipleReferencesAndNestedSubtrees) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  // Main 调 A 两次 + 调 B(B 内部又调 A)
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main">
      <Sequence><SubTree ID="A"/><SubTree ID="A"/><SubTree ID="B"/></Sequence>
    </BehaviorTree>
    <BehaviorTree ID="A"><AlwaysSuccess/></BehaviorTree>
    <BehaviorTree ID="B">
      <Sequence><SubTree ID="A"/><AlwaysSuccess/></Sequence>
    </BehaviorTree>
  </root>)";
  Tree t = p.loadFromText(xml);
  EXPECT_EQ(t.tickWhileRunning(), NodeStatus::SUCCESS);
  EXPECT_GE(t.nodes().size(), 5u);  // 至少 5 个展开节点
}

// ---------------------------- 循环引用 -------------------------------------

TEST(SubTree, SelfCycleIsDetected) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree ID="Main"/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(xml), std::runtime_error);
}

TEST(SubTree, MutualCycleIsDetected) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  // A → B → A 互相引用
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree ID="A"/></BehaviorTree>
    <BehaviorTree ID="A"><SubTree ID="B"/></BehaviorTree>
    <BehaviorTree ID="B"><SubTree ID="A"/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(xml), std::runtime_error);
}

// ---------------------------- 错误路径 -------------------------------------

TEST(SubTree, UndefinedIdThrows) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree ID="Ghost"/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(xml), std::runtime_error);
}

TEST(SubTree, MissingIdAttributeThrows) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* xml = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(xml), std::runtime_error);
}

TEST(SubTree, BehaviorTreeIdMustBePresentAndUnique) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* missing_id = R"(<root>
    <BehaviorTree><AlwaysSuccess/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(missing_id), std::runtime_error);

  const char* duplicate_id = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><AlwaysSuccess/></BehaviorTree>
    <BehaviorTree ID="Main"><AlwaysFailure/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(duplicate_id), std::runtime_error);
}

TEST(SubTree, OmittedMainIsAllowedOnlyForOneDefinition) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* one_definition = R"(<root>
    <BehaviorTree ID="Only"><AlwaysSuccess/></BehaviorTree>
  </root>)";
  EXPECT_EQ(p.loadFromText(one_definition).tickOnce(), NodeStatus::SUCCESS);

  const char* ambiguous = R"(<root>
    <BehaviorTree ID="First"><AlwaysSuccess/></BehaviorTree>
    <BehaviorTree ID="Second"><AlwaysFailure/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(ambiguous), std::runtime_error);
}

TEST(SubTree, UnknownExplicitMainReportsRequestedId) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* xml = R"(<root main_tree_to_execute="Ghost">
    <BehaviorTree ID="Main"><AlwaysSuccess/></BehaviorTree>
  </root>)";
  try {
    p.loadFromText(xml);
    FAIL() << "未知主树本应被拒绝";
  } catch (const std::runtime_error& error) {
    EXPECT_NE(std::string(error.what()).find("Ghost"), std::string::npos);
  }
}

TEST(SubTree, ReferenceMustBeEmptyAndUseOnlyIdAttribute) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  const char* child = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree ID="Helper"><AlwaysSuccess/></SubTree></BehaviorTree>
    <BehaviorTree ID="Helper"><AlwaysSuccess/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(child), std::runtime_error);

  const char* unsupported_remap = R"(<root main_tree_to_execute="Main">
    <BehaviorTree ID="Main"><SubTree ID="Helper" input="{value}"/></BehaviorTree>
    <BehaviorTree ID="Helper"><AlwaysSuccess/></BehaviorTree>
  </root>)";
  EXPECT_THROW(p.loadFromText(unsupported_remap), std::runtime_error);
}

TEST(SubTree, ExpansionDepthBoundaryIsEnforcedIndependentOfDefinitionOrder) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  EXPECT_EQ(p.loadFromText(subtreeChain(32)).tickOnce(), NodeStatus::SUCCESS);
  EXPECT_THROW(p.loadFromText(subtreeChain(33)), std::runtime_error);

  // 叶子定义先出现时也必须重验更深入口，不能被“已校验”缓存绕过。
  std::string reversed = subtreeChain(33);
  const std::string opening = "<root main_tree_to_execute=\"Main\">";
  const std::string closing = "</root>";
  std::vector<std::string> definitions;
  size_t cursor = opening.size();
  while (cursor < reversed.size() - closing.size()) {
    const size_t end = reversed.find("</BehaviorTree>", cursor);
    ASSERT_NE(end, std::string::npos);
    definitions.push_back(
        reversed.substr(cursor, end + std::string("</BehaviorTree>").size() - cursor));
    cursor = end + std::string("</BehaviorTree>").size();
  }
  std::reverse(definitions.begin(), definitions.end());
  std::ostringstream reordered;
  reordered << opening;
  for (const auto& definition : definitions) reordered << definition;
  reordered << closing;
  EXPECT_THROW(p.loadFromText(reordered.str()), std::runtime_error);
}

// ---------------------------- 不影响旧 XML 兼容 -----------------------------

TEST(SubTree, BackwardCompatibilityWithoutSubTree) {
  NodeFactory f; registerCore(f);
  XmlParser p(f);
  // 不含 <SubTree> 的旧 XML 必须仍正常工作(回归)
  const char* xml = R"(<root main_tree_to_execute="M">
    <BehaviorTree ID="M">
      <Sequence><AlwaysSuccess/><AlwaysSuccess/></Sequence>
    </BehaviorTree>
  </root>)";
  Tree t = p.loadFromText(xml);
  EXPECT_EQ(t.tickWhileRunning(), NodeStatus::SUCCESS);
  EXPECT_EQ(t.nodes().size(), 3u);
}
