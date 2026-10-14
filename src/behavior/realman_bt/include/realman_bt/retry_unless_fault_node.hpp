#pragma once

#include "bt_core/blackboard.hpp"
#include "bt_core/decorator_node.hpp"

namespace realman_bt {

/// Blackboard key a leaf sets (to true) to say "this failure is not worth retrying".
inline constexpr const char* kPolicyFaultKey = "policy_fault";

/// Retry decorator that gives up at once when the failed child raised the fault flag.
///
/// Behaves like the vendored `Retry`: a child FAILURE is retried up to `num_attempts` times in
/// total (-1 = no limit), the child is halted before each retry, and a RUNNING child does not use
/// up an attempt. The difference is the blackboard flag `policy_fault`: when a failing child has
/// set it, the failure is final and is returned without spending the remaining attempts. A
/// retryable failure (timeout, empty grasp) leaves the flag alone; a fault (joint out of range,
/// missing service) sets it.
///
/// The flag belongs to one run of this node. It is cleared when a run starts and by `halt()`, so a
/// fault left over from an earlier run never blocks the first attempt of a new one. After a run
/// ends in FAILURE the flag stays set so the parent can still read it.
class RetryUnlessFaultNode final : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts() {
    return bt_core::makePorts(bt_core::InputPort<int>(
        "num_attempts", "1", "Maximum attempts including the first; -1 retries without limit"));
  }

  bt_core::NodeStatus tick() override {
    if (!child()) {
      return bt_core::NodeStatus::FAILURE;
    }
    if (!run_active_) {
      run_active_ = true;
      attempts_done_ = 0;
      blackboard()->remove(kPolicyFaultKey);
    }
    const int max_attempts = getInput<int>("num_attempts").value_or(1);

    switch (child()->executeTick()) {
      case bt_core::NodeStatus::SUCCESS:
        endRun();
        return bt_core::NodeStatus::SUCCESS;

      case bt_core::NodeStatus::RUNNING:
        return bt_core::NodeStatus::RUNNING;

      case bt_core::NodeStatus::FAILURE:
        ++attempts_done_;
        if (!faultRaised() && (max_attempts < 0 || attempts_done_ < max_attempts)) {
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
    bt_core::DecoratorNode::halt();
  }

 private:
  bool faultRaised() const {
    return blackboard()->get<bool>(kPolicyFaultKey).value_or(false);
  }

  void endRun() {
    run_active_ = false;
    attempts_done_ = 0;
  }

  bool run_active_{false};
  int attempts_done_{0};
};

}  // namespace realman_bt
