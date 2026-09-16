#include <cassert>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "bt_nodes/control/fallback_node.hpp"
#include "bt_nodes/control/reactive_fallback_node.hpp"
#include "bt_nodes/control/reactive_sequence_node.hpp"
#include "bt_nodes/control/sequence_node.hpp"

namespace {

class RecordingAction final : public bt_core::ActionNode {
 public:
  RecordingAction(std::string name, bt_core::NodeConfig config,
                  std::vector<std::string>& events,
                  bt_core::NodeStatus& next_status)
      : ActionNode(std::move(name), std::move(config)),
        events_(events),
        next_status_(next_status) {}

  bt_core::NodeStatus tick() override {
    events_.push_back("tick:" + name());
    return next_status_;
  }

  void onHalted() override { events_.push_back("halt:" + name()); }

 private:
  std::vector<std::string>& events_;
  bt_core::NodeStatus& next_status_;
};

void testReactiveSequenceReticksItsSelector() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus selector_status = bt_core::NodeStatus::SUCCESS;
  bt_core::NodeStatus worker_status = bt_core::NodeStatus::RUNNING;
  auto sequence = std::make_shared<bt_nodes::ReactiveSequenceNode>("sequence", config);
  sequence->addChild(std::make_shared<RecordingAction>(
      "selector", config, events, selector_status));
  sequence->addChild(std::make_shared<RecordingAction>(
      "worker", config, events, worker_status));

  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);

  assert(events == std::vector<std::string>({
      "tick:selector", "tick:worker", "tick:selector", "tick:worker"}));
}

void testReactiveFallbackReconsidersCandidateZero() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus candidate_zero_status = bt_core::NodeStatus::FAILURE;
  bt_core::NodeStatus candidate_one_status = bt_core::NodeStatus::RUNNING;
  auto fallback = std::make_shared<bt_nodes::ReactiveFallbackNode>("fallback", config);
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_zero", config, events, candidate_zero_status));
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_one", config, events, candidate_one_status));

  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);

  assert(events == std::vector<std::string>({
      "tick:candidate_zero", "tick:candidate_one",
      "tick:candidate_zero", "tick:candidate_one"}));
}

void testStatefulSequenceRetainsItsRunningChild() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus selector_status = bt_core::NodeStatus::SUCCESS;
  bt_core::NodeStatus worker_status = bt_core::NodeStatus::RUNNING;
  auto sequence = std::make_shared<bt_nodes::SequenceNode>("sequence", config);
  sequence->addChild(std::make_shared<RecordingAction>(
      "selector", config, events, selector_status));
  sequence->addChild(std::make_shared<RecordingAction>(
      "worker", config, events, worker_status));

  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);

  assert(events == std::vector<std::string>({
      "tick:selector", "tick:worker", "tick:worker"}));
}

void testStatefulFallbackRetainsItsRunningChild() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus candidate_zero_status = bt_core::NodeStatus::FAILURE;
  bt_core::NodeStatus candidate_one_status = bt_core::NodeStatus::RUNNING;
  auto fallback = std::make_shared<bt_nodes::FallbackNode>("fallback", config);
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_zero", config, events, candidate_zero_status));
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_one", config, events, candidate_one_status));

  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);

  assert(events == std::vector<std::string>({
      "tick:candidate_zero", "tick:candidate_one", "tick:candidate_one"}));
}

void testFalseGuardHaltsOldWorkerBeforeFallbackTicksNone() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus guard_status = bt_core::NodeStatus::SUCCESS;
  bt_core::NodeStatus worker_status = bt_core::NodeStatus::RUNNING;
  bt_core::NodeStatus none_status = bt_core::NodeStatus::RUNNING;
  auto old_branch = std::make_shared<bt_nodes::ReactiveSequenceNode>("old_branch", config);
  old_branch->addChild(std::make_shared<RecordingAction>(
      "guard", config, events, guard_status));
  old_branch->addChild(std::make_shared<RecordingAction>(
      "worker", config, events, worker_status));
  auto none_branch = std::make_shared<RecordingAction>(
      "none", config, events, none_status);
  auto router = std::make_shared<bt_nodes::ReactiveFallbackNode>("router", config);
  router->addChild(old_branch);
  router->addChild(none_branch);

  assert(router->executeTick() == bt_core::NodeStatus::RUNNING);
  events.clear();
  guard_status = bt_core::NodeStatus::FAILURE;

  assert(router->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(events == std::vector<std::string>({
      "tick:guard", "halt:worker", "halt:guard", "tick:none"}));
}

void testExplicitHaltClearsReactiveSequenceRunningChild() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus selector_status = bt_core::NodeStatus::SUCCESS;
  bt_core::NodeStatus worker_status = bt_core::NodeStatus::RUNNING;
  auto sequence = std::make_shared<bt_nodes::ReactiveSequenceNode>("sequence", config);
  sequence->addChild(std::make_shared<RecordingAction>(
      "selector", config, events, selector_status));
  sequence->addChild(std::make_shared<RecordingAction>(
      "worker", config, events, worker_status));

  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);
  sequence->halt();
  events.clear();
  selector_status = bt_core::NodeStatus::RUNNING;

  assert(sequence->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(events == std::vector<std::string>({"tick:selector"}));
}

void testExplicitHaltClearsReactiveFallbackRunningChild() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus candidate_zero_status = bt_core::NodeStatus::FAILURE;
  bt_core::NodeStatus candidate_one_status = bt_core::NodeStatus::RUNNING;
  auto fallback = std::make_shared<bt_nodes::ReactiveFallbackNode>("fallback", config);
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_zero", config, events, candidate_zero_status));
  fallback->addChild(std::make_shared<RecordingAction>(
      "candidate_one", config, events, candidate_one_status));

  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);
  fallback->halt();
  events.clear();
  candidate_zero_status = bt_core::NodeStatus::RUNNING;

  assert(fallback->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(events == std::vector<std::string>({"tick:candidate_zero"}));
}

}  // namespace

int main() {
  testReactiveSequenceReticksItsSelector();
  testReactiveFallbackReconsidersCandidateZero();
  testStatefulSequenceRetainsItsRunningChild();
  testStatefulFallbackRetainsItsRunningChild();
  testFalseGuardHaltsOldWorkerBeforeFallbackTicksNone();
  testExplicitHaltClearsReactiveSequenceRunningChild();
  testExplicitHaltClearsReactiveFallbackRunningChild();
  return 0;
}
