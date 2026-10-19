// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>
#include <stdexcept>
#include <string>
#include <vector>

#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_task_params.hpp"

namespace {

using realman_bt::PolicyTaskConfig;

PolicyTaskConfig load(std::vector<rclcpp::Parameter> overrides = {}) {
  static int counter = 0;
  rclcpp::NodeOptions options;
  options.parameter_overrides(std::move(overrides));
  rclcpp::Node node("policy_task_params_test_" + std::to_string(counter++), options);
  return realman_bt::declareAndLoadPolicyTaskConfig(node);
}

void testWithoutOverridesTheDefaultsAreUsed() {
  const PolicyTaskConfig loaded = load();
  const PolicyTaskConfig defaults;
  assert(loaded.cycles == defaults.cycles && loaded.attempts == defaults.attempts);
  assert(loaded.timeout_retry.attempts == 3 && loaded.timeout_retry.backoff_sec == 20.0);
  assert(loaded.arm == "r" && loaded.activation == "auto");
  assert(loaded.joint_lo == defaults.joint_lo && loaded.joint_hi == defaults.joint_hi);
  assert(loaded.gripper_for_arm == defaults.gripper_for_arm);
  assert(loaded.release.joint_below_deg == -35.0);
  assert(loaded.router_release_sec == 1.5);
  assert(loaded.command_namespace == "/pi05_policy");
}

void testOverridesReplaceTheDefaults() {
  const PolicyTaskConfig loaded = load({
      {"policy_task.cycles", 3},
      {"policy_task.attempts", 5},
      {"policy_task.timeout_retry.attempts", -1},
      {"policy_task.timeout_retry.backoff_sec", 5},
      {"policy_task.activation", "operator"},
      {"policy_task.max_attempt_sec", 30.0},
      {"policy_task.stall.sec", 4.5},
      {"policy_task.release.joint_index", 0},
      {"policy_task.release.joint_below_deg", -40.0},
      {"policy_task.verdict.empty_position_min", 7000.0},
      {"policy_task.gripper_ready.timeout_sec", 12.0},
      {"policy_task.gripper_for_arm.r", "gripper_alt"},
      {"policy_task.joint_envelope_deg.lo", std::vector<double>{-60, 5, -10, -20, 25, -100}},
      {"policy_task.joint_envelope_deg.hi", std::vector<double>{30, 100, 120, 60, 100, 40}},
  });
  assert(loaded.cycles == 3 && loaded.attempts == 5);
  assert(loaded.timeout_retry.attempts == -1 && loaded.timeout_retry.backoff_sec == 5.0);
  assert(loaded.activation == "operator");
  assert(loaded.max_attempt_sec == 30.0 && loaded.stall.sec == 4.5);
  assert(loaded.release.joint_below_deg == -40.0);
  assert(loaded.verdict.empty_position_min == 7000.0);
  assert(loaded.gripper_ready.timeout_sec == 12.0);
  assert(loaded.gripper_for_arm.at("r") == "gripper_alt");
  assert(loaded.gripper_for_arm.at("l") == "gripper_left");
  assert(loaded.joint_lo[4] == 25.0 && loaded.joint_hi[1] == 100.0);
}

void testWholeNumbersWrittenForDecimalsAreAccepted() {
  // YAML `service_wait_sec: 10` arrives as an integer; ROS parameter types are strict.
  const PolicyTaskConfig loaded = load({
      {"policy_task.service_wait_sec", 10},
      {"policy_task.stall.sec", 8},
      {"policy_task.joint_envelope_deg.lo", std::vector<int64_t>{-60, 5, -10, -20, 25, -100}},
  });
  assert(loaded.service_wait_sec == 10.0 && loaded.stall.sec == 8.0);
  assert(loaded.joint_lo[0] == -60.0);
}

void testAnInvalidValueStopsTheLoad() {
  try {
    load({{"policy_task.cycles", 0}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("policy_task.cycles") != std::string::npos);
  }
}

void testAnEnvelopeOfTheWrongLengthIsRejected() {
  try {
    load({{"policy_task.joint_envelope_deg.lo", std::vector<double>{1.0, 2.0}}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("joint_envelope_deg") != std::string::npos);
  }
}

void testAWrongTypeIsRejectedWithTheKeyName() {
  try {
    load({{"policy_task.activation", 3}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("policy_task.activation") != std::string::npos);
  }
}

void testTraceSettingsAreLoaded() {
  const PolicyTaskConfig loaded = load({
      {"policy_task.trace.enabled", false},
      {"policy_task.trace.dir", "/tmp/policy-traces"},
      {"policy_task.trace.period_sec", 0.2},
  });
  assert(!loaded.trace.enabled);
  assert(loaded.trace.dir == "/tmp/policy-traces");
  assert(loaded.trace.period_sec == 0.2);
  assert(load().trace.enabled);
}

void testTraceEnabledMustBeABoolean() {
  try {
    load({{"policy_task.trace.enabled", "yes"}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("policy_task.trace.enabled") != std::string::npos);
  }
}

// The file that ships with the package, read through ROS' own parameter-file machinery exactly as
// the launch file does: a wrong YAML type or a bad value would stop the executor at startup.
void testTheShippedYamlLoadsThroughRosAsALaunchFileWouldPassIt() {
  rclcpp::NodeOptions options;
  options.arguments({"--ros-args", "--params-file", POLICY_TASK_CONFIG_FILE});
  rclcpp::Node node("realman_bt_executor", options);

  const PolicyTaskConfig loaded = realman_bt::declareAndLoadPolicyTaskConfig(node);

  assert(loaded.cycles == 1 && loaded.attempts == 3);
  assert(loaded.activation == "auto" && loaded.arm == "r");
  assert(loaded.joint_lo[4] == 20.0 && loaded.joint_hi[4] == 108.2);
  assert(loaded.max_joint_speed_dps == 50.0);
  assert(loaded.release.joint_below_deg == -35.0);
  assert(loaded.gripper_for_arm.at("r") == "gripper_right");
  assert(loaded.tasks.size() == 2);
  assert(loaded.task("pick").prompt == "pick up the power adapter");
  assert(loaded.task("pick").completion == PolicyTaskConfig::Completion::kLiftAndHold);
  assert(loaded.task("place").completion == PolicyTaskConfig::Completion::kReleaseOverBin);
  assert(loaded.lift.joint_delta_deg == -10.0 && loaded.lift.hold_sec == 2.0);
  assert(loaded.prompt_topic == "/policy/prompt");
}

void testWithoutOverridesBothDefaultTasksExist() {
  const PolicyTaskConfig loaded = load();
  assert(loaded.tasks.size() == PolicyTaskConfig().tasks.size());
  assert(loaded.task("place").prompt == PolicyTaskConfig().task("place").prompt);
  assert(loaded.task("pick").completion == PolicyTaskConfig::Completion::kLiftAndHold);
}

void testANewTaskIsDeclaredThroughTaskNames() {
  const PolicyTaskConfig loaded = load({
      {"policy_task.task_names", std::vector<std::string>{"place", "lift_only"}},
      {"policy_task.tasks.lift_only.prompt", "lift the power adapter"},
      {"policy_task.tasks.lift_only.completion", "lift_and_hold"},
      {"policy_task.lift.joint_delta_deg", -15.0},
  });
  assert(loaded.tasks.size() == 2);  // pick is gone: only what task_names lists exists
  assert(loaded.tasks.count("pick") == 0);
  assert(loaded.task("lift_only").prompt == "lift the power adapter");
  assert(loaded.task("lift_only").completion == PolicyTaskConfig::Completion::kLiftAndHold);
  assert(loaded.task("place").prompt == "pick up the power adapter and put it in the blue bin");
  assert(loaded.lift.joint_delta_deg == -15.0);
}

void testANewTaskWithoutAPromptIsRejected() {
  try {
    load({{"policy_task.task_names", std::vector<std::string>{"place", "stack"}}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("tasks.stack.prompt") != std::string::npos);
  }
}

void testAnUnknownCompletionIsRejected() {
  try {
    load({{"policy_task.tasks.pick.completion", "hold"}});
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("lift_and_hold") != std::string::npos);
  }
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  testWithoutOverridesTheDefaultsAreUsed();
  testOverridesReplaceTheDefaults();
  testWholeNumbersWrittenForDecimalsAreAccepted();
  testAnInvalidValueStopsTheLoad();
  testAnEnvelopeOfTheWrongLengthIsRejected();
  testAWrongTypeIsRejectedWithTheKeyName();
  testTraceSettingsAreLoaded();
  testTraceEnabledMustBeABoolean();
  testTheShippedYamlLoadsThroughRosAsALaunchFileWouldPassIt();
  testWithoutOverridesBothDefaultTasksExist();
  testANewTaskIsDeclaredThroughTaskNames();
  testANewTaskWithoutAPromptIsRejected();
  testAnUnknownCompletionIsRejected();
  rclcpp::shutdown();
  return 0;
}
