// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

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

// Returns the scripted status and, when that is FAILURE, the given failure reason, the way a real
// leaf (PolicyRun) explains its FAILURE.
class ReasonAction final : public bt_core::ActionNode {
 public:
  ReasonAction(std::string name, bt_core::NodeConfig config, bt_core::NodeStatus& next_status,
               std::string reason)
      : ActionNode(std::move(name), std::move(config)),
        next_status_(next_status),
        reason_(std::move(reason)) {}

  bt_core::NodeStatus tick() override {
    if (next_status_ == bt_core::NodeStatus::FAILURE) setFailureReason(reason_);
    return next_status_;
  }

 private:
  bt_core::NodeStatus& next_status_;
  std::string reason_;
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

// The input router leaves a branch whose task failed: the failed leaf must not keep its old
// reason, or switching back to that branch shows the previous error again.
void testLeavingABranchClearsItsFailedLeafReason() {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  bt_core::NodeStatus guard_status = bt_core::NodeStatus::SUCCESS;
  bt_core::NodeStatus task_status = bt_core::NodeStatus::FAILURE;
  bt_core::NodeStatus reporter_status = bt_core::NodeStatus::RUNNING;
  bt_core::NodeStatus none_status = bt_core::NodeStatus::RUNNING;
  auto task = std::make_shared<ReasonAction>("task", config, task_status, "joint J5 out of range");
  auto attempt = std::make_shared<bt_nodes::SequenceNode>("attempt", config);
  attempt->addChild(task);
  auto handler = std::make_shared<bt_nodes::FallbackNode>("handler", config);
  handler->addChild(attempt);
  handler->addChild(std::make_shared<RecordingAction>("reporter", config, events, reporter_status));
  auto branch = std::make_shared<bt_nodes::ReactiveSequenceNode>("branch", config);
  branch->addChild(std::make_shared<RecordingAction>("guard", config, events, guard_status));
  branch->addChild(handler);
  auto router = std::make_shared<bt_nodes::ReactiveFallbackNode>("router", config);
  router->addChild(branch);
  router->addChild(std::make_shared<RecordingAction>("none", config, events, none_status));

  assert(router->executeTick() == bt_core::NodeStatus::RUNNING);
  // Right after the failure the leaf is reset to IDLE by its Sequence but still explains it.
  assert(task->status() == bt_core::NodeStatus::IDLE);
  assert(task->failureReason() == "joint J5 out of range");

  guard_status = bt_core::NodeStatus::FAILURE;
  assert(router->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(task->failureReason().empty());

  guard_status = bt_core::NodeStatus::SUCCESS;
  task_status = bt_core::NodeStatus::RUNNING;
  assert(router->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(task->status() == bt_core::NodeStatus::RUNNING);
  assert(task->failureReason().empty());
}

// A leaf reset to IDLE without a halt (its Sequence failed) loses the old reason as soon as it
// starts a new execution, so a retry never runs under the previous attempt's error.
void testANewExecutionStartsWithoutTheOldReason() {
  bt_core::NodeConfig config;
  bt_core::NodeStatus task_status = bt_core::NodeStatus::FAILURE;
  auto task = std::make_shared<ReasonAction>("task", config, task_status, "grasp missed");
  auto attempt = std::make_shared<bt_nodes::SequenceNode>("attempt", config);
  attempt->addChild(task);

  assert(attempt->executeTick() == bt_core::NodeStatus::FAILURE);
  assert(task->failureReason() == "grasp missed");

  task_status = bt_core::NodeStatus::RUNNING;
  assert(attempt->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(task->failureReason().empty());
}

// A RUNNING node keeps a reason it set while running (only a new execution clears it).
void testARunningNodeKeepsItsReasonBetweenTicks() {
  bt_core::NodeConfig config;
  bt_core::NodeStatus task_status = bt_core::NodeStatus::RUNNING;
  auto task = std::make_shared<ReasonAction>("task", config, task_status, "unused");

  assert(task->executeTick() == bt_core::NodeStatus::RUNNING);
  task->setFailureReason("goal rejected, stopping");
  assert(task->executeTick() == bt_core::NodeStatus::RUNNING);
  assert(task->failureReason() == "goal rejected, stopping");
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
  testLeavingABranchClearsItsFailedLeafReason();
  testANewExecutionStartsWithoutTheOldReason();
  testARunningNodeKeepsItsReasonBetweenTicks();
  return 0;
}
