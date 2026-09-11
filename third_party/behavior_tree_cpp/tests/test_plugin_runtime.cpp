#include <gtest/gtest.h>

#include <algorithm>
#include <chrono>
#include <future>
#include <memory>
#include <mutex>
#include <optional>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "bt_core/blackboard.hpp"
#include "bt_core/leaf_node.hpp"
#include "bt_core/node_factory.hpp"
#include "bt_core/node_status.hpp"
#include "bt_core/tree.hpp"
#include "bt_core/xml_parser.hpp"
#include "bt_nodes/function/function_registry.hpp"

namespace {

using namespace std::chrono_literals;

class HostSuccessNode final : public bt_core::ActionNode {
 public:
  using ActionNode::ActionNode;

  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::SUCCESS; }
};

class ThrowingProvidedPortsNode final : public bt_core::ActionNode {
 public:
  using ActionNode::ActionNode;

  static bt_core::PortsList providedPorts() {
    throw std::runtime_error("providedPorts failed for plugin runtime test");
  }

  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::SUCCESS; }
};

std::vector<std::string> manifestSignatures(
    const bt_core::NodeFactory& factory) {
  std::vector<std::string> signatures;
  for (const auto& manifest : factory.manifests()) {
    std::vector<std::string> port_names;
    port_names.reserve(manifest.ports.size());
    for (const auto& [port_name, port] : manifest.ports) {
      static_cast<void>(port);
      port_names.push_back(port_name);
    }
    std::sort(port_names.begin(), port_names.end());

    std::string signature = manifest.registration_name + ":" +
                            std::to_string(static_cast<int>(manifest.type));
    for (const auto& port_name : port_names) {
      signature += ":" + port_name;
    }
    signatures.push_back(std::move(signature));
  }
  std::sort(signatures.begin(), signatures.end());
  return signatures;
}

class BlockingDestructorProbe {
 public:
  BlockingDestructorProbe(std::promise<void>& destructor_started,
                          std::mutex& gate)
      : destructor_started_(destructor_started), gate_(gate) {}

  ~BlockingDestructorProbe() {
    destructor_started_.set_value();
    std::lock_guard<std::mutex> lock(gate_);
  }

 private:
  std::promise<void>& destructor_started_;
  std::mutex& gate_;
};

template <typename Mutation>
void expectRegistryUnlockedWhileCallbackDestructorBlocks(Mutation mutation) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();

  std::mutex destructor_gate;
  std::unique_lock<std::mutex> gate_lock(destructor_gate);
  std::promise<void> destructor_started;
  auto destructor_started_future = destructor_started.get_future();

  auto probe = std::make_shared<BlockingDestructorProbe>(destructor_started,
                                                          destructor_gate);
  registry.registerAction(
      "blocking.destructor",
      [probe = std::move(probe)](const bt_nodes::FunctionContext&) {
        return bt_core::NodeStatus::SUCCESS;
      });

  std::thread mutation_thread([&] { mutation(registry); });
  const bool destructor_was_observed =
      destructor_started_future.wait_for(2s) == std::future_status::ready;

  bool query_completed_while_destructor_blocked = false;
  std::promise<void> query_completed;
  auto query_completed_future = query_completed.get_future();
  std::thread query_thread;
  if (destructor_was_observed) {
    query_thread = std::thread([&] {
      static_cast<void>(registry.hasAction("blocking.destructor"));
      query_completed.set_value();
    });
    query_completed_while_destructor_blocked =
        query_completed_future.wait_for(500ms) == std::future_status::ready;
  }

  gate_lock.unlock();
  mutation_thread.join();
  if (query_thread.joinable()) {
    query_thread.join();
  }
  registry.clear();

  EXPECT_TRUE(destructor_was_observed);
  EXPECT_TRUE(query_completed_while_destructor_blocked)
      << "FunctionRegistry mutex remained locked during callback destruction";
}

}  // namespace

TEST(FunctionRegistryPublicApi, NamesAreSorted) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();

  const auto action = [](const bt_nodes::FunctionContext&) {
    return bt_core::NodeStatus::SUCCESS;
  };
  registry.registerAction("zeta", action);
  registry.registerAction("alpha", action);
  registry.registerAction("middle", action);

  const auto condition = [](const bt_nodes::FunctionContext&) { return true; };
  registry.registerCondition("yellow", condition);
  registry.registerCondition("blue", condition);

  EXPECT_EQ(registry.actionNames(),
            (std::vector<std::string>{"alpha", "middle", "zeta"}));
  EXPECT_EQ(registry.conditionNames(),
            (std::vector<std::string>{"blue", "yellow"}));
  registry.clear();
}

TEST(FunctionRegistryPublicApi, RegisteredFunctionsCanBeRemoved) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();
  registry.registerAction(
      "action", [](const bt_nodes::FunctionContext&) {
        return bt_core::NodeStatus::SUCCESS;
      });
  registry.registerCondition(
      "condition", [](const bt_nodes::FunctionContext&) { return true; });

  EXPECT_TRUE(registry.unregisterAction("action"));
  EXPECT_TRUE(registry.unregisterCondition("condition"));
  EXPECT_FALSE(registry.hasAction("action"));
  EXPECT_FALSE(registry.hasCondition("condition"));
  EXPECT_FALSE(registry.unregisterAction("action"));
  EXPECT_FALSE(registry.unregisterCondition("condition"));
}

TEST(FunctionRegistryPublicApi, ReplacementDestroysOldCallbackAfterUnlock) {
  expectRegistryUnlockedWhileCallbackDestructorBlocks(
      [](bt_nodes::FunctionRegistry& registry) {
        registry.registerAction(
            "blocking.destructor", [](const bt_nodes::FunctionContext&) {
              return bt_core::NodeStatus::SUCCESS;
            });
      });
}

TEST(FunctionRegistryPublicApi, UnregisterDestroysCallbackAfterUnlock) {
  expectRegistryUnlockedWhileCallbackDestructorBlocks(
      [](bt_nodes::FunctionRegistry& registry) {
        static_cast<void>(registry.unregisterAction("blocking.destructor"));
      });
}

TEST(FunctionRegistryPublicApi, ClearDestroysCallbacksAfterUnlock) {
  expectRegistryUnlockedWhileCallbackDestructorBlocks(
      [](bt_nodes::FunctionRegistry& registry) { registry.clear(); });
}

TEST(PluginRuntime, HostFunctionIsVisibleToPluginFunctionAction) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();
  registry.registerAction(
      "dso.probe", [](const bt_nodes::FunctionContext&) {
        return bt_core::NodeStatus::SUCCESS;
      });

  bt_core::NodeFactory factory;
  factory.loadPlugin(BT_NODES_PLUGIN_PATH);

  bt_core::XmlParser parser(factory);
  auto tree = parser.loadFromText(
      R"(<root main_tree_to_execute="Main"><BehaviorTree ID="Main"><FunctionAction function="dso.probe"/></BehaviorTree></root>)",
      bt_core::Blackboard::create());

  EXPECT_EQ(tree.tickOnce(), bt_core::NodeStatus::SUCCESS);
  registry.clear();
}

TEST(PluginRuntime, RegisterNodeTypeRollsBackWhenProvidedPortsThrows) {
  bt_core::NodeFactory factory;
  factory.registerNodeType<HostSuccessNode>("HostSuccess");

  const auto size_before = factory.size();
  const auto manifests_before = manifestSignatures(factory);

  EXPECT_THROW(factory.registerNodeType<ThrowingProvidedPortsNode>(
                   "ThrowingProvidedPorts"),
               std::runtime_error);

  EXPECT_EQ(factory.size(), size_before);
  EXPECT_EQ(manifestSignatures(factory), manifests_before);
  EXPECT_TRUE(factory.isRegistered("HostSuccess"));
  EXPECT_FALSE(factory.isRegistered("ThrowingProvidedPorts"));
}

TEST(PluginRuntime, ThrowingPluginRollsBackRegistrations) {
  bt_core::NodeFactory factory;
  factory.registerNodeType<HostSuccessNode>("HostSuccess");

  const auto size_before = factory.size();
  const auto manifests_before = manifestSignatures(factory);

  try {
    factory.loadPlugin(BT_THROWING_PLUGIN_PATH);
    FAIL() << "Expected the test plugin to throw after registration";
  } catch (const std::runtime_error& error) {
    EXPECT_EQ(std::string(error.what()),
              "throwing plugin intentionally failed after registration");
  }

  EXPECT_EQ(factory.size(), size_before);
  EXPECT_EQ(manifestSignatures(factory), manifests_before);
  EXPECT_TRUE(factory.isRegistered("HostSuccess"));
  EXPECT_FALSE(factory.isRegistered("PluginRuntimeTestNode"));

  auto host_node = factory.createNode("HostSuccess", "host", {});
  EXPECT_EQ(host_node->executeTick(), bt_core::NodeStatus::SUCCESS);
}

TEST(PluginRuntime, PluginTreeRetainsLibraryAfterFactoryDestruction) {
  std::optional<bt_core::Tree> tree;

  {
    bt_core::NodeFactory factory;
    factory.loadPlugin(BT_LIFETIME_PLUGIN_PATH);

    bt_core::XmlParser parser(factory);
    tree.emplace(parser.loadFromText(
        R"(<root main_tree_to_execute="Main"><BehaviorTree ID="Main"><PluginRuntimeTestNode/></BehaviorTree></root>)",
        bt_core::Blackboard::create()));
  }

  EXPECT_EQ(tree->tickOnce(), bt_core::NodeStatus::SUCCESS);
  tree.reset();
}
