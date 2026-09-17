#include <cassert>
#include <chrono>
#include <memory>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "bt_core/node_factory.hpp"
#include "bt_nodes/control/reactive_fallback_node.hpp"
#include "bt_nodes/control/reactive_sequence_node.hpp"
#include "realman_bt/input_mode.hpp"
#include "realman_bt/input_mode_nodes.hpp"
#include "realman_bt/runtime_snapshot.hpp"

namespace {

using realman_bt::ActivateInputModeNode;
using realman_bt::IdleInputNode;
using realman_bt::InputModeCoordinator;
using realman_bt::InputModeGuardNode;
using realman_bt::InputModeRegistry;
using realman_bt::PikaInputStubNode;
using realman_bt::PolicyInputStubNode;
using realman_bt::SelectInputModeNode;
using realman_bt::WebInputStubNode;

template <typename Callable>
void assertInvalidArgument(Callable&& callable) {
  try {
    callable();
    assert(false);
  } catch (const std::invalid_argument&) {
  }
}

bt_core::NodeConfig configWithRegistry(InputModeRegistry* registry) {
  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  config.blackboard->set<InputModeRegistry*>(
      realman_bt::kInputModeRegistryBlackboardKey, registry);
  return config;
}

bt_core::NodeConfig guardConfig(const bt_core::Blackboard::Ptr& blackboard,
                                std::string mode, std::string label,
                                bool selectable) {
  bt_core::NodeConfig config;
  config.blackboard = blackboard;
  config.port_values = {{"mode", std::move(mode)},
                        {"label", std::move(label)},
                        {"selectable", selectable ? "true" : "false"}};
  config.port_remap = {{"selected_mode", "selected_mode"}};
  return config;
}

bt_core::NodeConfig activationConfig(
    const bt_core::Blackboard::Ptr& blackboard, std::string mode) {
  bt_core::NodeConfig config;
  config.blackboard = blackboard;
  config.port_values = {{"mode", std::move(mode)}};
  return config;
}

class RecordingAction final : public bt_core::ActionNode {
 public:
  RecordingAction(std::string name, bt_core::NodeConfig config,
                  std::vector<std::string>& events, std::string event)
      : ActionNode(std::move(name), std::move(config)),
        events_(events),
        event_(std::move(event)) {}

  bt_core::NodeStatus tick() override {
    events_.push_back(event_);
    return bt_core::NodeStatus::RUNNING;
  }

 private:
  std::vector<std::string>& events_;
  std::string event_;
};

void testFactoryProbesDoNotRequireBusinessBlackboardEntries() {
  bt_core::NodeFactory factory;
  factory.registerNodeType<SelectInputModeNode>("SelectInputMode");
  factory.registerNodeType<InputModeGuardNode>("InputModeGuard");
  factory.registerNodeType<ActivateInputModeNode>("ActivateInputMode");
  factory.registerNodeType<WebInputStubNode>("WebInputStub");
  factory.registerNodeType<PolicyInputStubNode>("PolicyInputStub");
  factory.registerNodeType<PikaInputStubNode>("PikaInputStub");
  factory.registerNodeType<IdleInputNode>("IdleInput");

  assert(factory.size() == 7);
}

void testGuardRejectsRemappedRegistrationMetadataIndependently() {
  for (const std::string& remapped_port : {"mode", "label", "selectable"}) {
    InputModeRegistry registry;
    auto config = configWithRegistry(&registry);
    config.port_values = {
        {"mode", "policy"}, {"label", "Policy"}, {"selectable", "true"}};
    config.port_remap[remapped_port] = remapped_port;

    assertInvalidArgument([&] {
      InputModeGuardNode guard("guard", config);
    });
  }
}

void testGuardRequiresEveryLiteralRegistrationValue() {
  for (const std::string& missing_port : {"mode", "label", "selectable"}) {
    InputModeRegistry registry;
    auto config = configWithRegistry(&registry);
    config.port_values = {
        {"mode", "policy"}, {"label", "Policy"}, {"selectable", "true"}};
    config.port_values.erase(missing_port);

    assertInvalidArgument([&] {
      InputModeGuardNode guard("guard", config);
    });
  }
}

void testGuardRegistersLiteralMetadataOnceAndMatchesSelection() {
  InputModeRegistry registry;
  auto config = configWithRegistry(&registry);
  config.port_values = {
      {"mode", "policy"}, {"label", "Policy"}, {"selectable", "true"}};
  config.port_remap = {{"selected_mode", "selection"}};

  InputModeGuardNode first("first", config);
  InputModeGuardNode duplicate("duplicate", config);
  assert(registry.definitions().size() == 1);
  assert(registry.definitions()[0].id == "policy");
  assert(registry.definitions()[0].label == "Policy");
  assert(registry.definitions()[0].selectable);

  config.blackboard->set<std::string>("selection", "policy");
  assert(first.executeTick() == bt_core::NodeStatus::SUCCESS);
  assert(registry.definitions().size() == 1);
  config.blackboard->set<std::string>("selection", "web");
  assert(first.executeTick() == bt_core::NodeStatus::FAILURE);
  assert(registry.definitions().size() == 1);
}

void testSelectInputModeWritesItsOutputEveryTick() {
  InputModeRegistry registry;
  registry.registerMode("web", "Web", false);
  registry.registerMode("policy", "Policy", true);
  registry.registerMode("pika", "Pika", true);
  registry.registerMode("none", "无输入", true);
  InputModeCoordinator coordinator(
      registry, std::chrono::seconds(1), "none", {});
  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  config.blackboard->set<InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, &coordinator);
  config.port_remap = {{"selected_mode", "selection"}};
  SelectInputModeNode selector("selector", config);

  config.blackboard->set<std::string>("selection", "stale");
  assert(selector.executeTick() == bt_core::NodeStatus::SUCCESS);
  assert(config.blackboard->get<std::string>("selection").value() == "none");

  const auto now = InputModeCoordinator::Clock::now();
  assert(coordinator.request("policy", "browser", now).accepted);
  coordinator.activate("none", now);
  config.blackboard->set<std::string>("selection", "stale-again");
  assert(selector.executeTick() == bt_core::NodeStatus::SUCCESS);
  assert(config.blackboard->get<std::string>("selection").value() == "policy");
}

void testActivationObserverRunsBeforeTheInputLeaf() {
  InputModeRegistry registry;
  registry.registerMode("web", "Web", false);
  registry.registerMode("policy", "Policy", true);
  registry.registerMode("pika", "Pika", true);
  registry.registerMode("none", "无输入", true);
  std::vector<std::string> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::seconds(1), "none",
      [&](const realman_bt::InputModeSnapshot& snapshot) {
        events.push_back("state:" + snapshot.active_mode);
      });
  const auto now = InputModeCoordinator::Clock::now();
  assert(coordinator.request("web", "web-control", now).accepted);
  coordinator.activate("none", now);
  assert(coordinator.selectForTick(now) == "web");
  events.clear();

  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  config.blackboard->set<InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, &coordinator);
  auto sequence =
      std::make_shared<bt_nodes::ReactiveSequenceNode>("web_branch", config);
  sequence->addChild(std::make_shared<ActivateInputModeNode>(
      "activate_web", activationConfig(config.blackboard, "web")));
  sequence->addChild(std::make_shared<RecordingAction>(
      "web_stub", config, events, "tick:web_stub"));

  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(events == std::vector<std::string>({"state:web", "tick:web_stub"}));
}

void testActivationRejectsARequestForTheUnselectedBranch() {
  InputModeRegistry registry;
  registry.registerMode("web", "Web", false);
  registry.registerMode("policy", "Policy", true);
  registry.registerMode("pika", "Pika", true);
  registry.registerMode("none", "无输入", true);
  InputModeCoordinator coordinator(
      registry, std::chrono::seconds(1), "none", {});
  auto blackboard = bt_core::Blackboard::create();
  blackboard->set<InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, &coordinator);
  ActivateInputModeNode activation(
      "activate_policy", activationConfig(blackboard, "policy"));

  assert(activation.executeTick() == bt_core::NodeStatus::FAILURE);
  assert(activation.failureReason() ==
         "cannot activate unselected input mode: policy");
}

void testActivationRequiresALiteralModeForARealInstance() {
  InputModeRegistry registry;
  InputModeCoordinator coordinator(
      registry, std::chrono::seconds(1), "none", {});
  bt_core::NodeConfig missing;
  missing.blackboard = bt_core::Blackboard::create();
  missing.blackboard->set<InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, &coordinator);
  assertInvalidArgument([&] {
    ActivateInputModeNode activation("missing", missing);
  });

  bt_core::NodeConfig remapped = missing;
  remapped.port_remap = {{"mode", "selected_mode"}};
  assertInvalidArgument([&] {
    ActivateInputModeNode activation("remapped", remapped);
  });
}

void testPlaceholderLeavesRunWithoutRosOrActionDependencies() {
  static_assert(std::is_constructible_v<WebInputStubNode, std::string,
                                        bt_core::NodeConfig>);
  static_assert(std::is_constructible_v<PolicyInputStubNode, std::string,
                                        bt_core::NodeConfig>);
  static_assert(std::is_constructible_v<PikaInputStubNode, std::string,
                                        bt_core::NodeConfig>);
  static_assert(std::is_constructible_v<IdleInputNode, std::string,
                                        bt_core::NodeConfig>);

  bt_core::NodeConfig plain_config;
  plain_config.blackboard = bt_core::Blackboard::create();
  WebInputStubNode web("web", plain_config);
  IdleInputNode idle("idle", plain_config);
  assert(web.executeTick() == bt_core::NodeStatus::RUNNING);
  assert(idle.executeTick() == bt_core::NodeStatus::RUNNING);

  realman_bt::RuntimeDiagnostics diagnostics;
  bt_core::NodeConfig diagnostic_config;
  diagnostic_config.blackboard = bt_core::Blackboard::create();
  diagnostic_config.blackboard->set<realman_bt::RuntimeDiagnostics*>(
      realman_bt::kRuntimeDiagnosticsBlackboardKey, &diagnostics);
  PolicyInputStubNode policy("policy", diagnostic_config);
  PikaInputStubNode pika("pika", diagnostic_config);
  assert(policy.executeTick() == bt_core::NodeStatus::RUNNING);
  assert(policy.executeTick() == bt_core::NodeStatus::RUNNING);
  assert(pika.executeTick() == bt_core::NodeStatus::RUNNING);
  auto snapshot = diagnostics.snapshot();
  assert(snapshot.events.size() == 2);
  assert(snapshot.events[0].source == "EXECUTOR");
  assert(snapshot.events[0].phase == "placeholder");
  assert(snapshot.events[0].detail ==
         "Policy input is a placeholder; no command emitted");
  assert(snapshot.events[1].detail ==
         "Pika input is a placeholder; no command emitted");

  policy.halt();
  assert(policy.executeTick() == bt_core::NodeStatus::RUNNING);
  snapshot = diagnostics.snapshot();
  assert(snapshot.events.size() == 3);
}

void testPostNeutralTickReplacesIdleWithRecoveredHigherPriorityBranch() {
  InputModeRegistry registry;
  auto blackboard = bt_core::Blackboard::create();
  blackboard->set<InputModeRegistry*>(
      realman_bt::kInputModeRegistryBlackboardKey, &registry);
  auto web_guard = std::make_shared<InputModeGuardNode>(
      "web_guard", guardConfig(blackboard, "web", "Web", false));
  auto policy_guard = std::make_shared<InputModeGuardNode>(
      "policy_guard", guardConfig(blackboard, "policy", "Policy", true));
  auto pika_guard = std::make_shared<InputModeGuardNode>(
      "pika_guard", guardConfig(blackboard, "pika", "Pika", true));
  auto none_guard = std::make_shared<InputModeGuardNode>(
      "none_guard", guardConfig(blackboard, "none", "无输入", true));
  InputModeCoordinator coordinator(
      registry, std::chrono::seconds(1), "none", {});
  blackboard->set<InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, &coordinator);

  bt_core::NodeConfig config;
  config.blackboard = blackboard;
  bt_core::NodeConfig select_config = config;
  select_config.port_remap = {{"selected_mode", "selected_mode"}};
  auto root = std::make_shared<bt_nodes::ReactiveSequenceNode>("root", config);
  auto router =
      std::make_shared<bt_nodes::ReactiveFallbackNode>("router", config);
  root->addChild(
      std::make_shared<SelectInputModeNode>("selector", select_config));
  root->addChild(router);

  auto make_branch = [&](const std::string& name,
                         const std::shared_ptr<InputModeGuardNode>& guard,
                         const std::string& mode,
                         const bt_core::TreeNode::Ptr& leaf) {
    auto branch =
        std::make_shared<bt_nodes::ReactiveSequenceNode>(name, config);
    branch->addChild(guard);
    branch->addChild(std::make_shared<ActivateInputModeNode>(
        "activate_" + mode, activationConfig(blackboard, mode)));
    branch->addChild(leaf);
    router->addChild(branch);
  };
  auto web = std::make_shared<WebInputStubNode>("web", config);
  auto policy = std::make_shared<PolicyInputStubNode>("policy", config);
  auto pika = std::make_shared<PikaInputStubNode>("pika", config);
  auto idle = std::make_shared<IdleInputNode>("idle", config);
  make_branch("web_branch", web_guard, "web", web);
  make_branch("policy_branch", policy_guard, "policy", policy);
  make_branch("pika_branch", pika_guard, "pika", pika);
  make_branch("none_branch", none_guard, "none", idle);

  const auto now = InputModeCoordinator::Clock::now();
  assert(coordinator.request("policy", "browser", now).accepted);
  assert(root->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(idle->status() == bt_core::NodeStatus::RUNNING);
  assert(policy->status() == bt_core::NodeStatus::IDLE);

  assert(root->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(coordinator.snapshot().active_mode == "policy");
  assert(policy->status() == bt_core::NodeStatus::RUNNING);
  assert(idle->status() == bt_core::NodeStatus::IDLE);
}

}  // namespace

int main() {
  testFactoryProbesDoNotRequireBusinessBlackboardEntries();
  testGuardRejectsRemappedRegistrationMetadataIndependently();
  testGuardRequiresEveryLiteralRegistrationValue();
  testGuardRegistersLiteralMetadataOnceAndMatchesSelection();
  testSelectInputModeWritesItsOutputEveryTick();
  testActivationObserverRunsBeforeTheInputLeaf();
  testActivationRejectsARequestForTheUnselectedBranch();
  testActivationRequiresALiteralModeForARealInstance();
  testPlaceholderLeavesRunWithoutRosOrActionDependencies();
  testPostNeutralTickReplacesIdleWithRecoveredHigherPriorityBranch();
  return 0;
}
