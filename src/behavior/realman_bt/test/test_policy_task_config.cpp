// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>
#include <functional>
#include <stdexcept>
#include <string>

#include "realman_bt/policy_task_config.hpp"

namespace {

using realman_bt::PolicyTaskConfig;

void assertRejected(const std::function<void(PolicyTaskConfig&)>& mutate,
                    const std::string& expected_fragment) {
  PolicyTaskConfig config;
  mutate(config);
  try {
    config.validate();
    assert(false && "invalid configuration was accepted");
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find(expected_fragment) != std::string::npos);
  }
}

void testDefaultsAreTheReviewedDesignValues() {
  const PolicyTaskConfig config;

  assert(config.cycles == 1);
  assert(config.attempts == 3);
  assert(config.timeout_retry.attempts == 3 && config.timeout_retry.backoff_sec == 20.0);
  assert(config.arm == "r");
  assert(config.activation == "auto");
  assert(config.gripper_for_arm.at("r") == "gripper_right");
  assert(config.gripper_for_arm.at("l") == "gripper_left");
  assert(config.gripper_for_arm.at("m") == "gripper_mid");
  // Demonstration p1/p99 widened by 10 degrees, J5 included (floored at 20, then 15, until 2026-10-23).
  assert(config.joint_lo[4] == 3.5 && config.joint_hi[4] == 108.2);
  assert(config.joint_lo[0] == -73.4 && config.joint_hi[0] == 40.1);
  assert(config.max_joint_speed_dps == 50.0);
  assert(config.lm_drift_limit_deg == 1.0);
  assert(config.max_attempt_sec == 45.0);
  assert(config.release.open_above == 0.8);
  assert(config.release.min_closed_sec == 3.0);
  assert(config.release.joint_index == 0 && config.release.joint_below_deg == -35.0);
  assert(config.verdict.empty_position_min == 7800.0);
  assert(config.gripper_ready.open_position_max == 500.0);
  assert(config.router_release_sec == 1.5);
}

void testDefaultsValidate() {
  PolicyTaskConfig config;
  config.validate();
}

void testUnlimitedCyclesAndAttemptsAreAllowed() {
  PolicyTaskConfig config;
  config.cycles = -1;
  config.attempts = -1;
  config.timeout_retry.attempts = -1;
  config.validate();
}

void testCountsMustBePositiveOrMinusOne() {
  assertRejected([](PolicyTaskConfig& c) { c.cycles = 0; }, "cycles");
  assertRejected([](PolicyTaskConfig& c) { c.attempts = -2; }, "attempts");
  assertRejected([](PolicyTaskConfig& c) { c.timeout_retry.attempts = 0; }, "timeout_retry.attempts");
}

void testTheTimeoutBackoffMustNotBeNegative() {
  assertRejected([](PolicyTaskConfig& c) { c.timeout_retry.backoff_sec = -1.0; },
                 "timeout_retry.backoff_sec");
  PolicyTaskConfig config;
  config.timeout_retry.backoff_sec = 0.0;  // retry at once
  config.validate();
}

void testArmMustBeOneOfTheThree() {
  assertRejected([](PolicyTaskConfig& c) { c.arm = "x"; }, "arm");
}

void testActivationMustBeAutoOrOperator() {
  PolicyTaskConfig config;
  config.activation = "operator";
  config.validate();
  assertRejected([](PolicyTaskConfig& c) { c.activation = "manual"; }, "activation");
}

void testCommandNamespaceMustLookLikeATopicPrefix() {
  PolicyTaskConfig config;
  assert(config.command_namespace == "/pi05_policy");
  assertRejected([](PolicyTaskConfig& c) { c.command_namespace = "pi05_policy"; }, "command_namespace");
  assertRejected([](PolicyTaskConfig& c) { c.command_namespace = "/pi05_policy/"; }, "command_namespace");
  assertRejected([](PolicyTaskConfig& c) { c.command_namespace = ""; }, "command_namespace");
}

void testTheConfiguredArmNeedsAGripper() {
  assertRejected([](PolicyTaskConfig& c) { c.gripper_for_arm.erase("r"); }, "gripper");
  assertRejected([](PolicyTaskConfig& c) { c.gripper_for_arm["r"] = ""; }, "gripper");
}

void testEnvelopeMustBeOrderedForEveryJoint() {
  assertRejected([](PolicyTaskConfig& c) { c.joint_lo[2] = c.joint_hi[2]; }, "joint_envelope");
  assertRejected([](PolicyTaskConfig& c) { c.joint_lo[5] = 90.0; }, "joint_envelope");
}

void testLimitsMustBePositive() {
  assertRejected([](PolicyTaskConfig& c) { c.max_joint_speed_dps = 0.0; }, "max_joint_speed_dps");
  assertRejected([](PolicyTaskConfig& c) { c.lm_drift_limit_deg = -1.0; }, "lm_drift_limit_deg");
  assertRejected([](PolicyTaskConfig& c) { c.joint_state_stale_sec = 0.0; }, "joint_state_stale_sec");
  assertRejected([](PolicyTaskConfig& c) { c.max_attempt_sec = 0.0; }, "max_attempt_sec");
  assertRejected([](PolicyTaskConfig& c) { c.service_wait_sec = -1.0; }, "service_wait_sec");
  assertRejected([](PolicyTaskConfig& c) { c.stall.sec = 0.0; }, "stall");
  assertRejected([](PolicyTaskConfig& c) { c.current_guard.limits_ma[3] = 0.0; }, "current_guard.limits_ma");
  assertRejected([](PolicyTaskConfig& c) { c.current_guard.sustain_sec = -1.0; }, "current_guard.sustain_sec");
  assertRejected([](PolicyTaskConfig& c) { c.gripper_ready.timeout_sec = 0.0; }, "gripper_ready");
  assertRejected([](PolicyTaskConfig& c) { c.verdict.window_sec = 0.0; }, "verdict");
}

void testReleaseThresholdsMustBeConsistent() {
  assertRejected([](PolicyTaskConfig& c) { c.release.joint_index = 6; }, "release.joint_index");
  assertRejected([](PolicyTaskConfig& c) { c.release.joint_index = -1; }, "release.joint_index");
  assertRejected([](PolicyTaskConfig& c) { c.release.open_above = 1.2; }, "release.open_above");
  // "Closed" has to sit below "open", otherwise one command value would count as both.
  assertRejected([](PolicyTaskConfig& c) { c.release.closed_below = c.release.open_above; },
                 "release.closed_below");
  assertRejected([](PolicyTaskConfig& c) { c.release.min_closed_sec = -1.0; },
                 "release.min_closed_sec");
}

void testTheTraceIsOnByDefaultAndGoesToTheLogDirectory() {
  const PolicyTaskConfig config;
  assert(config.trace.enabled);
  assert(config.trace.dir == "/opt/rm65_ws/logs/policy-attempts");
  assert(config.trace.period_sec == 0.1);
}

void testTheTraceNeedsASamplePeriodAndWhenOnADirectory() {
  assertRejected([](PolicyTaskConfig& c) { c.trace.period_sec = 0.0; }, "trace.period_sec");
  assertRejected([](PolicyTaskConfig& c) { c.trace.dir = ""; }, "trace.dir");
  PolicyTaskConfig off;
  off.trace.enabled = false;
  off.trace.dir = "";  // nothing is written, so no directory is needed
  off.validate();
}

void testTheDefaultTasksAreTheTwoPromptsOfTheMultitaskModel() {
  const PolicyTaskConfig config;
  assert(config.tasks.size() == 2);
  assert(config.task("place").prompt == "pick up the power adapter and put it in the blue bin");
  assert(config.task("place").completion == PolicyTaskConfig::Completion::kReleaseOverBin);
  assert(config.task("pick").prompt == "pick up the power adapter");
  assert(config.task("pick").completion == PolicyTaskConfig::Completion::kLiftAndHold);
  assert(config.prompt_topic == "/policy/prompt");
  assert(config.lift.joint_index == 1 && config.lift.joint_delta_deg == -10.0);
  assert(config.lift.hold_sec == 2.0 && config.lift.min_closed_sec == 3.0);
  assert(config.lift.wrong_side_joint_index == 0 && config.lift.wrong_side_below_deg == -25.0);
}

void testAnUnknownTaskNamesTheKnownOnes() {
  const PolicyTaskConfig config;
  try {
    config.task("stack");
    assert(false);
  } catch (const std::invalid_argument& error) {
    const std::string message = error.what();
    assert(message.find("stack") != std::string::npos);
    assert(message.find("pick") != std::string::npos && message.find("place") != std::string::npos);
  }
}

void testCompletionNamesRoundTrip() {
  using realman_bt::completionName;
  using realman_bt::parseCompletion;
  for (auto completion : {PolicyTaskConfig::Completion::kReleaseOverBin, PolicyTaskConfig::Completion::kLiftAndHold}) {
    assert(parseCompletion(completionName(completion)) == completion);
  }
  assert(std::string(completionName(PolicyTaskConfig::Completion::kLiftAndHold)) == "lift_and_hold");
  try {
    parseCompletion("release");
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("release_over_bin or lift_and_hold") != std::string::npos);
  }
}

void testTasksNeedDistinctNonEmptyPrompts() {
  assertRejected([](PolicyTaskConfig& c) { c.tasks.clear(); }, "policy_task.tasks");
  assertRejected([](PolicyTaskConfig& c) { c.tasks["pick"].prompt = ""; }, "tasks.pick.prompt");
  // Two tasks with one prompt would run the same policy behaviour under two completions.
  assertRejected([](PolicyTaskConfig& c) { c.tasks["pick"].prompt = c.tasks["place"].prompt; }, "is the same as");
  assertRejected([](PolicyTaskConfig& c) { c.prompt_topic = "policy/prompt"; }, "prompt_topic");
}

void testLiftThresholdsMustBeUsable() {
  assertRejected([](PolicyTaskConfig& c) { c.lift.joint_index = 6; }, "lift.joint_index");
  assertRejected([](PolicyTaskConfig& c) { c.lift.joint_delta_deg = 0.0; }, "lift.joint_delta_deg");
  assertRejected([](PolicyTaskConfig& c) { c.lift.hold_sec = -1.0; }, "lift.hold_sec");
  assertRejected([](PolicyTaskConfig& c) { c.lift.min_closed_sec = -1.0; }, "lift.min_closed_sec");
  assertRejected([](PolicyTaskConfig& c) { c.lift.wrong_side_joint_index = -1; }, "lift.wrong_side_joint_index");
  PolicyTaskConfig upward;
  upward.lift.joint_delta_deg = 10.0;  // a joint that increases while lifting is fine
  upward.validate();
}

void testRouterReleaseMayBeZeroButNotNegative() {
  PolicyTaskConfig config;
  config.router_release_sec = 0.0;
  config.validate();
  assertRejected([](PolicyTaskConfig& c) { c.router_release_sec = -0.1; }, "router_release_sec");
}

}  // namespace

int main() {
  testDefaultsAreTheReviewedDesignValues();
  testDefaultsValidate();
  testUnlimitedCyclesAndAttemptsAreAllowed();
  testCountsMustBePositiveOrMinusOne();
  testTheTimeoutBackoffMustNotBeNegative();
  testArmMustBeOneOfTheThree();
  testActivationMustBeAutoOrOperator();
  testCommandNamespaceMustLookLikeATopicPrefix();
  testTheConfiguredArmNeedsAGripper();
  testEnvelopeMustBeOrderedForEveryJoint();
  testLimitsMustBePositive();
  testReleaseThresholdsMustBeConsistent();
  testTheTraceIsOnByDefaultAndGoesToTheLogDirectory();
  testTheTraceNeedsASamplePeriodAndWhenOnADirectory();
  testRouterReleaseMayBeZeroButNotNegative();
  testTheDefaultTasksAreTheTwoPromptsOfTheMultitaskModel();
  testAnUnknownTaskNamesTheKnownOnes();
  testCompletionNamesRoundTrip();
  testTasksNeedDistinctNonEmptyPrompts();
  testLiftThresholdsMustBeUsable();
  return 0;
}
