// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <algorithm>
#include <cassert>
#include <chrono>
#include <memory>
#include <string>
#include <thread>
#include <utility>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "realman_bt/retry_unless_fault_node.hpp"

namespace {

using bt_core::NodeStatus;

constexpr const char* kFaultKey = "policy_fault";
constexpr const char* kTimeoutKey = "policy_timeout";
constexpr const char* kReasonKey = "policy_failure_reason";

// A child that plays back a script of statuses, one per tick, and repeats the last entry once the
// script runs out. `fault_on_tick` lists the (1-based) ticks on which it raises the fault flag the
// way a real leaf does before it returns FAILURE; `timeout_on_tick` likewise raises the
// policy-server timeout flag and writes a reason naming the tick.
class ScriptedAction final : public bt_core::ActionNode {
 public:
  ScriptedAction(std::string name, bt_core::NodeConfig config,
                 std::vector<std::string>& events, std::vector<NodeStatus> script,
                 std::vector<int> fault_on_tick = {}, std::vector<int> timeout_on_tick = {})
      : ActionNode(std::move(name), std::move(config)),
        events_(events),
        script_(std::move(script)),
        fault_on_tick_(std::move(fault_on_tick)),
        timeout_on_tick_(std::move(timeout_on_tick)) {}

  NodeStatus tick() override {
    ++ticks_;
    events_.push_back("tick");
    for (const int fault_tick : fault_on_tick_) {
      if (fault_tick == ticks_) {
        blackboard()->set<bool>(kFaultKey, true);
      }
    }
    for (const int timeout_tick : timeout_on_tick_) {
      if (timeout_tick == ticks_) {
        blackboard()->set<bool>(kTimeoutKey, true);
        blackboard()->set<std::string>(kReasonKey, "bridge paused on tick " + std::to_string(ticks_));
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
  std::vector<int> timeout_on_tick_;
  int ticks_{0};
};

struct Fixture {
  bt_core::NodeConfig config;
  std::vector<std::string> events;
  std::shared_ptr<realman_bt::RetryUnlessFaultNode> retry;
  std::shared_ptr<ScriptedAction> child;

  Fixture(int attempts, std::vector<NodeStatus> script, std::vector<int> fault_on_tick = {},
          std::vector<int> timeout_on_tick = {}, int timeout_attempts = 0,
          double timeout_backoff_sec = 0.0) {
    config.blackboard = bt_core::Blackboard::create();
    config.port_values["num_attempts"] = std::to_string(attempts);
    config.port_values["timeout_attempts"] = std::to_string(timeout_attempts);
    config.port_values["timeout_backoff_sec"] = std::to_string(timeout_backoff_sec);
    retry = std::make_shared<realman_bt::RetryUnlessFaultNode>("retry", config);
    child = std::make_shared<ScriptedAction>("child", config, events, std::move(script),
                                             std::move(fault_on_tick), std::move(timeout_on_tick));
    retry->setChild(child);
  }

  bool faultSet() const { return config.blackboard->get<bool>(kFaultKey).value_or(false); }
  bool timeoutSet() const { return config.blackboard->get<bool>(kTimeoutKey).value_or(false); }
  std::string reason() const {
    return config.blackboard->get<std::string>(kReasonKey).value_or("");
  }
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

void testDeclaresTheAttemptAndTimeoutPorts() {
  const auto ports = realman_bt::RetryUnlessFaultNode::providedPorts();

  assert(ports.size() == 3);
  assert(ports.count("num_attempts") == 1);
  assert(ports.count("timeout_attempts") == 1);
  assert(ports.count("timeout_backoff_sec") == 1);
}

// ---- policy-server timeouts ---------------------------------------------------------------------

void testTimeoutsDoNotUseUpTheAttempts() {
  // One ordinary attempt, but three timeouts allowed: two timeouts are retried, then it succeeds.
  Fixture f(1, {NodeStatus::FAILURE, NodeStatus::FAILURE, NodeStatus::SUCCESS}, {}, {1, 2}, 3);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(!f.timeoutSet());  // cleared before the retry, so the next attempt starts clean
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
  assert(f.events == Events({"tick", "halt", "tick", "halt", "tick"}));
}

void testTheTimeoutBudgetEndsTheRunWithTheCountInTheReason() {
  Fixture f(5, {NodeStatus::FAILURE}, {}, {1, 2, 3}, 3);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.events == Events({"tick", "halt", "tick", "halt", "tick"}));
  assert(f.timeoutSet());  // left for the parent, like the fault flag
  assert(f.reason() == "policy server timed out 3 times; last: bridge paused on tick 3");
}

void testASingleAllowedTimeoutEndsTheRunAtOnce() {
  Fixture f(5, {NodeStatus::FAILURE}, {}, {1}, 1);

  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.reason() == "policy server timed out 1 time; last: bridge paused on tick 1");
}

void testOrdinaryFailuresStillCountAgainstTheAttempts() {
  // A timeout, then two plain failures: the timeout is free, the plain failures use up both attempts.
  Fixture f(2, {NodeStatus::FAILURE}, {}, {1}, 3);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // timeout 1 of 3
  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // attempt 1 of 2
  assert(f.retry->executeTick() == NodeStatus::FAILURE);  // attempt 2 of 2
  assert(!f.timeoutSet());
}

void testWithoutATimeoutBudgetATimeoutIsAnOrdinaryAttempt() {
  // timeout_attempts 0 (the default): the timeout uses up an attempt, and there is no wait.
  Fixture f(2, {NodeStatus::FAILURE}, {}, {1, 2}, 0, 10.0);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.events == Events({"tick", "halt", "tick"}));
  // No count prefix: the timeout budget did not end the run.
  assert(f.reason() == "bridge paused on tick 2");
}

void testUnlimitedTimeoutsKeepRetrying() {
  std::vector<int> every_tick;
  for (int i = 1; i <= 40; ++i) every_tick.push_back(i);
  Fixture f(1, {NodeStatus::FAILURE}, {}, every_tick, -1);

  for (int i = 0; i < 40; ++i) {
    assert(f.retry->executeTick() == NodeStatus::RUNNING);
  }
}

void testAFaultBeatsATimeout() {
  // The same failure raised both flags: the fault wins, nothing is retried.
  Fixture f(3, {NodeStatus::FAILURE}, {1}, {1}, 3);

  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.events == Events({"tick"}));
}

void testATimeoutWaitsTheBackoffBeforeTheNextAttempt() {
  Fixture f(1, {NodeStatus::FAILURE, NodeStatus::SUCCESS}, {}, {1}, 3, 0.15);
  const auto start = std::chrono::steady_clock::now();

  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // timeout; backoff starts
  // While it waits the child is not ticked again.
  while (std::chrono::steady_clock::now() - start < std::chrono::milliseconds(100)) {
    assert(f.retry->executeTick() == NodeStatus::RUNNING);
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }
  assert(f.events == Events({"tick", "halt"}));

  std::this_thread::sleep_for(std::chrono::milliseconds(80));
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
  assert(f.events == Events({"tick", "halt", "tick"}));
}

void testOrdinaryRetriesDoNotWait() {
  Fixture f(3, {NodeStatus::FAILURE, NodeStatus::SUCCESS}, {}, {}, 3, 10.0);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
}

void testHaltDuringTheBackoffStartsAFreshRun() {
  Fixture f(1, {NodeStatus::FAILURE, NodeStatus::SUCCESS}, {}, {1}, 2, 10.0);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // timeout 1 of 2, waiting 10 s

  f.retry->halt();

  // A new run neither waits for the old backoff nor remembers the old timeout.
  assert(f.retry->executeTick() == NodeStatus::SUCCESS);
}

void testTheTimeoutCountStartsOverInEveryRun() {
  // Run 1 ends on its second timeout; run 2 (a new Repeat cycle) gets two timeouts again.
  Fixture f(1, {NodeStatus::FAILURE}, {}, {1, 2, 3}, 2);
  assert(f.retry->executeTick() == NodeStatus::RUNNING);
  assert(f.retry->executeTick() == NodeStatus::FAILURE);

  assert(f.retry->executeTick() == NodeStatus::RUNNING);  // timeout 1 of 2 of the new run
  assert(!f.timeoutSet());
}

void testStaleTimeoutFlagFromAnEarlierRunIsIgnored() {
  Fixture f(1, {NodeStatus::FAILURE}, {}, {}, 3);
  f.config.blackboard->set<bool>(kTimeoutKey, true);

  // The plain failure of the new run is an ordinary attempt, not a timeout.
  assert(f.retry->executeTick() == NodeStatus::FAILURE);
  assert(f.reason().empty());
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
  testDeclaresTheAttemptAndTimeoutPorts();
  testTimeoutsDoNotUseUpTheAttempts();
  testTheTimeoutBudgetEndsTheRunWithTheCountInTheReason();
  testASingleAllowedTimeoutEndsTheRunAtOnce();
  testOrdinaryFailuresStillCountAgainstTheAttempts();
  testWithoutATimeoutBudgetATimeoutIsAnOrdinaryAttempt();
  testUnlimitedTimeoutsKeepRetrying();
  testAFaultBeatsATimeout();
  testATimeoutWaitsTheBackoffBeforeTheNextAttempt();
  testOrdinaryRetriesDoNotWait();
  testHaltDuringTheBackoffStartsAFreshRun();
  testTheTimeoutCountStartsOverInEveryRun();
  testStaleTimeoutFlagFromAnEarlierRunIsIgnored();
  testWithoutAChildItFails();
  return 0;
}
