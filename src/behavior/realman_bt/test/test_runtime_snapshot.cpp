#include <cassert>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "bt_core/tree.hpp"
#include "bt_nodes/control/sequence_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"

namespace {

class FixedNode final : public bt_core::ConditionNode {
 public:
  using bt_core::ConditionNode::ConditionNode;

  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::SUCCESS; }
};

std::string readFile(const std::filesystem::path& path) {
  std::ifstream input(path);
  std::ostringstream contents;
  contents << input.rdbuf();
  return contents.str();
}

void assertContains(const std::string& text, const std::string& value) {
  assert(text.find(value) != std::string::npos);
}

void testIdleSnapshot() {
  const auto path = std::filesystem::temp_directory_path() /
                    "realman-bt-runtime-snapshot-idle.json";
  std::error_code error;
  std::filesystem::remove(path, error);
  std::filesystem::remove(path.string() + ".tmp", error);

  realman_bt::RuntimeSnapshotWriter writer(path);
  writer.writeIdle("idle-tree");

  const std::string json = readFile(path);
  assertContains(json, R"("schema_version":1)");
  assertContains(json, R"("tree_id":"idle-tree")");
  assertContains(json, R"("sequence":0)");
  assertContains(json, R"("root_status":"IDLE")");
  assertContains(json, R"("nodes":[])");
  assert(!std::filesystem::exists(path.string() + ".tmp"));
  std::filesystem::remove(path, error);
}

void testTreeSnapshotUsesStableDfsKeysAndStatuses() {
  const auto path = std::filesystem::temp_directory_path() /
                    "realman-bt-runtime-snapshot-tree.json";
  std::error_code error;
  std::filesystem::remove(path, error);

  bt_core::NodeConfig config;
  auto root = std::make_shared<bt_nodes::SequenceNode>("root", config);
  auto first = std::make_shared<FixedNode>("first", config);
  auto second = std::make_shared<FixedNode>("second", config);
  root->setRegistrationName("Sequence");
  first->setRegistrationName("AlwaysSuccess");
  second->setRegistrationName("AlwaysRunning");
  root->addChild(first);
  root->addChild(second);
  bt_core::Tree tree(root, config.blackboard);
  root->setStatus(bt_core::NodeStatus::RUNNING);
  first->setStatus(bt_core::NodeStatus::SUCCESS);
  second->setStatus(bt_core::NodeStatus::RUNNING);

  realman_bt::RuntimeSnapshotWriter writer(path);
  writer.write(tree, "arm\\r", 42);

  const std::string json = readFile(path);
  assertContains(json, R"("schema_version":1)");
  assertContains(json, R"("tree_id":"arm\\r")");
  assertContains(json, R"("sequence":42)");
  assertContains(json, R"("root_status":"RUNNING")");
  assertContains(json, R"("key":"n0")");
  assertContains(json, R"("key":"n1")");
  assertContains(json, R"("key":"n2")");
  assertContains(json, R"("path":"0")");
  assertContains(json, R"("path":"0/0")");
  assertContains(json, R"("path":"0/1")");
  assertContains(json, R"("kind":"Control")");
  assertContains(json, R"("kind":"Condition")");
  assertContains(json, R"("status":"SUCCESS")");
  assertContains(json, R"("status":"RUNNING")");
  assert(!std::filesystem::exists(path.string() + ".tmp"));
  std::filesystem::remove(path, error);
}

void testJsonEscapingAndAtomicReplacement() {
  const auto path = std::filesystem::temp_directory_path() /
                    "realman-bt-runtime-snapshot-escaping.json";
  std::error_code error;
  std::filesystem::remove(path, error);
  std::filesystem::remove(path.string() + ".tmp", error);

  bt_core::NodeConfig config;
  auto node = std::make_shared<FixedNode>("name\"\\\n", config);
  node->setRegistrationName("Type\"\\\t");
  bt_core::Tree tree(node, config.blackboard);

  realman_bt::RuntimeSnapshotWriter writer(path);
  writer.write(tree, "tree\"\\\n", 7);
  const std::string first = readFile(path);
  assertContains(first, R"("tree_id":"tree\"\\\n")");
  assertContains(first, R"("name":"name\"\\\n")");
  assertContains(first, R"("registration_name":"Type\"\\\t")");

  writer.write(tree, "replacement", 8);
  const std::string replacement = readFile(path);
  assertContains(replacement, R"("tree_id":"replacement")");
  assertContains(replacement, R"("sequence":8)");
  assert(!std::filesystem::exists(path.string() + ".tmp"));
  std::filesystem::remove(path, error);
}

}  // namespace

int main() {
  testIdleSnapshot();
  testTreeSnapshotUsesStableDfsKeysAndStatuses();
  testJsonEscapingAndAtomicReplacement();
  return 0;
}
