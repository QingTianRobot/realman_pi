#pragma once

#include <chrono>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/decorator_node.hpp"
#include "realman_bt/policy_task_config.hpp"

namespace realman_bt {

/// Blackboard key a leaf sets (to true) to say "this failure is not worth retrying".
inline constexpr const char* kPolicyFaultKey = "policy_fault";
/// Blackboard key a leaf sets (to true) to say "this failure was a policy-server timeout".
inline constexpr const char* kPolicyTimeoutKey = "policy_timeout";

/// Retry decorator that gives up at once when the failed child raised the fault flag, and retries
/// policy-server timeouts on a budget of their own after a wait.
///
/// Behaves like the vendored `Retry`: a child FAILURE is retried up to `num_attempts` times in
/// total (-1 = no limit), the child is halted before each retry, and a RUNNING child does not use
/// up an attempt. The differences are two blackboard flags:
///
/// - `policy_fault`: when a failing child has set it, the failure is final and is returned without
///   spending the remaining attempts. A fault (joint out of range, missing joint states) sets it.
/// - `policy_timeout`: the policy server or its bridge timed out (inference requests timed out
///   until the bridge paused itself, it never got ready, it went silent). With `timeout_attempts`
///   at 1 or more (or -1 = no limit) such a failure does not use up `num_attempts`: it is retried
///   until `timeout_attempts` timeouts have happened in this run, and each retry first waits
///   `timeout_backoff_sec` (RUNNING, the child is not ticked) so a warming-up server or a congested
///   link can recover. The default 0 counts a timeout as an ordinary failed attempt, no wait.
///   When the timeout budget runs out, `policy_failure_reason` is prefixed with the count.
///
/// The flags belong to one run of this node. They are cleared when a run starts and by `halt()`,
/// so a flag left over from an earlier run never blocks the first attempt of a new one, and the
/// timeout flag is also cleared before each retry. After a run ends in FAILURE the flags stay set
/// so the parent can still read them.
class RetryUnlessFaultNode final : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<int>("num_attempts", "1",
                                "Maximum attempts including the first; -1 retries without limit"),
        bt_core::InputPort<int>("timeout_attempts", "0",
                                "Policy-server timeouts allowed per run on their own budget; "
                                "-1 = no limit, 0 = count them as ordinary attempts"),
        bt_core::InputPort<double>("timeout_backoff_sec", "0",
                                   "Wait before retrying after a policy-server timeout"));
  }

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    if (!run_active_) {
      run_active_ = true;
      attempts_done_ = 0;
      timeouts_done_ = 0;
      backing_off_ = false;
      blackboard()->remove(kPolicyFaultKey);
      blackboard()->remove(kPolicyTimeoutKey);
    }
    if (backing_off_) {
      if (Clock::now() < backoff_until_) return bt_core::NodeStatus::RUNNING;
      backing_off_ = false;
    }
    const int max_attempts = getInput<int>("num_attempts").value_or(1);
    const int max_timeouts = getInput<int>("timeout_attempts").value_or(0);

    switch (child()->executeTick()) {
      case bt_core::NodeStatus::SUCCESS:
        endRun();
        return bt_core::NodeStatus::SUCCESS;

      case bt_core::NodeStatus::RUNNING:
        return bt_core::NodeStatus::RUNNING;

      case bt_core::NodeStatus::FAILURE:
        if (faultRaised()) {
          endRun();
          return bt_core::NodeStatus::FAILURE;
        }
        if (timeoutRaised() && max_timeouts != 0) {
          ++timeouts_done_;
          if (max_timeouts > 0 && timeouts_done_ >= max_timeouts) {
            prefixFailureReason("policy server timed out " + std::to_string(timeouts_done_) +
                                (timeouts_done_ == 1 ? " time" : " times") + "; last: ");
            endRun();
            return bt_core::NodeStatus::FAILURE;
          }
          blackboard()->remove(kPolicyTimeoutKey);
          child()->halt();
          const double backoff = getInput<double>("timeout_backoff_sec").value_or(0.0);
          if (backoff > 0.0) {
            backing_off_ = true;
            backoff_until_ = Clock::now() + std::chrono::duration_cast<Clock::duration>(
                                                std::chrono::duration<double>(backoff));
          }
          return bt_core::NodeStatus::RUNNING;
        }
        ++attempts_done_;
        if (max_attempts < 0 || attempts_done_ < max_attempts) {
          blackboard()->remove(kPolicyTimeoutKey);
          child()->halt();
          return bt_core::NodeStatus::RUNNING;
        }
        endRun();
        return bt_core::NodeStatus::FAILURE;

      case bt_core::NodeStatus::IDLE:
      default:
        endRun();
        return bt_core::NodeStatus::FAILURE;
    }
  }

  void halt() override {
    endRun();
    blackboard()->remove(kPolicyFaultKey);
    blackboard()->remove(kPolicyTimeoutKey);
    bt_core::DecoratorNode::halt();
  }

 private:
  using Clock = std::chrono::steady_clock;

  bool faultRaised() const {
    return blackboard()->get<bool>(kPolicyFaultKey).value_or(false);
  }

  bool timeoutRaised() const {
    return blackboard()->get<bool>(kPolicyTimeoutKey).value_or(false);
  }

  void prefixFailureReason(const std::string& prefix) {
    const std::string reason =
        blackboard()->get<std::string>(kPolicyFailureReasonKey).value_or("");
    blackboard()->set<std::string>(kPolicyFailureReasonKey, prefix + reason);
  }

  void endRun() {
    run_active_ = false;
    attempts_done_ = 0;
    timeouts_done_ = 0;
    backing_off_ = false;
  }

  bool run_active_{false};
  int attempts_done_{0};
  int timeouts_done_{0};
  bool backing_off_{false};
  Clock::time_point backoff_until_{};
};

}  // namespace realman_bt
