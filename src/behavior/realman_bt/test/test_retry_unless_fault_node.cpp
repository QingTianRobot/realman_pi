// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <algorithm>
#include <cassert>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "realman_bt/retry_unless_fault_node.hpp"

namespace {

using bt_core::NodeStatus;

constexpr const char* kFaultKey = "policy_fault";

// A child that plays back a script of statuses, one per tick, and repeats the last entry once the
// script runs out. `fault_on_tick` lists the (1-based) ticks on which it raises the fault flag the
// way a real leaf does before it returns FAILURE.
class ScriptedAction final : public bt_core::ActionNode {
 public:
  ScriptedAction(std::string name, bt_core::NodeConfig config,
                 std::vector<std::string>& events, std::vector<NodeStatus> script,
                 std::vector<int> fault_on_tick = {})
      : ActionNode(std::move(name), std::move(config)),
        events_(events),
        script_(std::move(script)),
        fault_on_tick_(std::move(fault_on_tick)) {}

  NodeStatus tick() override {
    ++ticks_;
    events_.push_back("tick");
    for (const int fault_tick : fault_on_tick_) {
      if (fault_tick == ticks_) {
        blackboard()->set<bool>(kFaultKey, true);
      }
    }
    const std::size_t index = std::min<std::size_t>(ticks_ - 1, script_.size() - 1);
    return script_[index];
  }

  void onHalted() override { events_.push_back("halt"); }

 private:
  std::vector<std::string>& events_;
  std::vector<NodeStatus> script_;
  std::vector<int> fault_on_tick_;
  int ticks_{0};
};

struct Fixture {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  std::shared_ptr<realman_bt::RetryUnlessFaultNode> retry;
  std::shared_ptr<ScriptedAction> child;

  Fixture(int attempts, std::vector<NodeStatus> script, std::vector<int> fault_on_tick = {}) {
    config.blackboard = bt_core::Blackboard::create();
    config.port_values["num_attempts"] = std::to_string(attempts);
    retry = std::make_shared<realman_bt::RetryUnlessFaultNode>("retry", config);
    child = std::make_shared<ScriptedAction>("child", config, events, std::move(script),
                                             std::move(fault_on_tick));
    retry->setChild(child);
  }

  bool faultSet() const { return config.blackboard->get<bool>(kFaultKey).value_or(false); }
};

using Events = std::vector<std::string>;

void testChildSuccessIsNotRetried() {
  Fixture f(3, {NodeStatus::SUCCESS});

  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
  assert(f.events == Events({"tick"}));
}

void testRetryableFailureIsRetriedUntilAttemptsRunOut() {
  Fixture f(3, {NodeStatus::FAILURE});

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  // The child is halted before every retry, so it restarts from a clean state, but not after the
  // last attempt: the parent decides what happens to a failed task.
  assert(f.events == Events({"tick", "halt", "tick", "halt", "tick"}));
}

void testSingleAttemptFailsImmediately() {
  Fixture f(1, {NodeStatus::FAILURE});

  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.events == Events({"tick"}));
}

void testRunningChildDoesNotConsumeAttempts() {
  Fixture f(2, {NodeStatus::RUNNING, NodeStatus::RUNNING, NodeStatus::RUNNING,
                NodeStatus::FAILURE});

  for (int i = 0; i < 3; ++i) {
    assert(f.retry->executeTick() == NodeStatus::RUNNING);
  }
  // First failure is attempt 1 of 2, so it is retried rather than reported.
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.events == Events({"tick", "tick", "tick", "tick", "halt"}));
}

void testSuccessAfterFailuresIsReported() {
  Fixture f(3, {NodeStatus::FAILURE, NodeStatus::FAILURE, NodeStatus::SUCCESS});

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
  assert(f.events == Events({"tick", "halt", "tick", "halt", "tick"}));
}

void testFaultStopsRetryingEvenWithAttemptsLeft() {
  // Tick 1 raises the fault and fails; 4 attempts remain but none may be used.
  Fixture f(5, {NodeStatus::FAILURE}, {1});

  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.events == Events({"tick"}));
  assert(f.faultSet());
}

void testFaultOnALaterAttemptStopsTheRetries() {
  Fixture f(5, {NodeStatus::FAILURE}, {2});

  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // plain failure: retry
  assert(f.retry->executeTick() == NodeStatus::FAILURE);  // fault: stop
  assert(f.events == Events({"tick", "halt", "tick"}));
}

void testStaleFaultFromAnEarlierRunDoesNotBlockTheFirstAttempt() {
  Fixture f(3, {NodeStatus::FAILURE, NodeStatus::SUCCESS});
  f.config.blackboard->set<bool>(kFaultKey, true);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
  assert(!f.faultSet());
}

void testNewRunAfterAFaultFailureIsNotBlockedByIt() {
  // Tick 1 raises the fault and fails; the child's later ticks fail without one.
  Fixture f(3, {NodeStatus::FAILURE}, {1});
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.faultSet());

  // No halt in between: a parent is free to tick the node again after it reported FAILURE. That
  // is a fresh run, so the leftover fault must not turn this plain failure into a stop.
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(!f.faultSet());
}

void testHaltResetsTheAttemptCounter() {
  Fixture f(2, {NodeStatus::FAILURE});

  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // attempt 1 of 2
  f.retry->halt();
  // After a halt the run starts over: the failure below is attempt 1 again, not attempt 2.
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
}

void testHaltClearsTheFaultFlag() {
  Fixture f(3, {NodeStatus::RUNNING});
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  f.config.blackboard->set<bool>(kFaultKey, true);

  f.retry->halt();

  assert(!f.faultSet());
}

void testHaltPropagatesToARunningChild() {
  Fixture f(3, {NodeStatus::RUNNING});
  assert(f.retry->executeTick() == NodeStatus::RUNNING);

  f.retry->halt();

  assert(f.events == Events({"tick", "halt"}));
}

void testNegativeAttemptsRetriesForever() {
  Fixture f(-1, {NodeStatus::FAILURE});

  for (int i = 0; i < 50; ++i) {
    assert(f.retry->executeTick() == NodeStatus::RUNNING);
  }
}

void testNegativeAttemptsStillStopsOnFault() {
  Fixture f(-1, {NodeStatus::FAILURE}, {3});

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
}

void testAttemptsPortDefaultsToOne() {
  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  std::vector<std::string> events;
  auto retry = std::make_shared<realman_bt::RetryUnlessFaultNode>("retry", config);
  retry->setChild(std::make_shared<ScriptedAction>(
      "child", config, events, std::vector<NodeStatus>{NodeStatus::FAILURE}));

  assert(retry->executeTick() == NodeStatus::FAILURE);
}

void testDeclaresTheAttemptsPort() {
  const auto ports = realman_bt::RetryUnlessFaultNode::providedPorts();

  assert(ports.size() == 1);
  assert(ports.count("num_attempts") == 1);
}

void testWithoutAChildItFails() {
  bt_core::NodeConfig config;
  realman_bt::RetryUnlessFaultNode retry("retry", config);

  assert(retry.executeTick() == NodeStatus::FAILURE);
}

}  // namespace

int main() {
  testChildSuccessIsNotRetried();
  testRetryableFailureIsRetriedUntilAttemptsRunOut();
  testSingleAttemptFailsImmediately();
  testRunningChildDoesNotConsumeAttempts();
  testSuccessAfterFailuresIsReported();
  testFaultStopsRetryingEvenWithAttemptsLeft();
  testFaultOnALaterAttemptStopsTheRetries();
  testStaleFaultFromAnEarlierRunDoesNotBlockTheFirstAttempt();
  testNewRunAfterAFaultFailureIsNotBlockedByIt();
  testHaltResetsTheAttemptCounter();
  testHaltClearsTheFaultFlag();
  testHaltPropagatesToARunningChild();
  testNegativeAttemptsRetriesForever();
  testNegativeAttemptsStillStopsOnFault();
  testAttemptsPortDefaultsToOne();
  testDeclaresTheAttemptsPort();
  testWithoutAChildItFails();
  return 0;
}
