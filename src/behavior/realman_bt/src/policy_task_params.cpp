#include "realman_bt/policy_task_params.hpp"

#include <algorithm>
#include <array>
#include <stdexcept>
#include <string>
#include <vector>

#include "rcl_interfaces/msg/parameter_descriptor.hpp"

namespace realman_bt {
namespace {

// Parameters are declared dynamically typed so that `service_wait_sec: 10` in YAML (an integer)
// is accepted where a decimal is expected; the reader converts and rejects anything else.
class Reader {
 public:
  explicit Reader(rclcpp::Node& node) : node_(node) { descriptor_.dynamic_typing = true; }

  double number(const std::string& key, double fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(fallback));
    switch (value.get_type()) {
      case rclcpp::ParameterType::PARAMETER_DOUBLE:
        return value.get<double>();
      case rclcpp::ParameterType::PARAMETER_INTEGER:
        return static_cast<double>(value.get<int64_t>());
      default:
        throw std::invalid_argument(key + " must be a number");
    }
  }

  int integer(const std::string& key, int fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(static_cast<int64_t>(fallback)));
    if (value.get_type() != rclcpp::ParameterType::PARAMETER_INTEGER) {
      throw std::invalid_argument(key + " must be an integer");
    }
    return static_cast<int>(value.get<int64_t>());
  }

  bool boolean(const std::string& key, bool fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(fallback));
    if (value.get_type() != rclcpp::ParameterType::PARAMETER_BOOL) {
      throw std::invalid_argument(key + " must be true or false");
    }
    return value.get<bool>();
  }

  std::string text(const std::string& key, const std::string& fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(fallback));
    if (value.get_type() != rclcpp::ParameterType::PARAMETER_STRING) {
      throw std::invalid_argument(key + " must be a string");
    }
    return value.get<std::string>();
  }

  std::vector<std::string> textList(const std::string& key, const std::vector<std::string>& fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(fallback));
    if (value.get_type() != rclcpp::ParameterType::PARAMETER_STRING_ARRAY) {
      throw std::invalid_argument(key + " must be a list of strings");
    }
    return value.get<std::vector<std::string>>();
  }

  std::array<double, 6> sixNumbers(const std::string& key, const std::array<double, 6>& fallback) {
    const auto value = declare(key, rclcpp::ParameterValue(std::vector<double>(fallback.begin(), fallback.end())));
    std::vector<double> numbers;
    if (value.get_type() == rclcpp::ParameterType::PARAMETER_DOUBLE_ARRAY) {
      numbers = value.get<std::vector<double>>();
    } else if (value.get_type() == rclcpp::ParameterType::PARAMETER_INTEGER_ARRAY) {
      for (const auto item : value.get<std::vector<int64_t>>()) numbers.push_back(static_cast<double>(item));
    } else {
      throw std::invalid_argument(key + " must be a list of six numbers");
    }
    if (numbers.size() != 6) throw std::invalid_argument(key + " must contain exactly six numbers");
    std::array<double, 6> result{};
    std::copy(numbers.begin(), numbers.end(), result.begin());
    return result;
  }

 private:
  rclcpp::ParameterValue declare(const std::string& key, const rclcpp::ParameterValue& fallback) {
    if (!node_.has_parameter(key)) node_.declare_parameter(key, fallback, descriptor_);
    return node_.get_parameter(key).get_parameter_value();
  }

  rclcpp::Node& node_;
  rcl_interfaces::msg::ParameterDescriptor descriptor_;
};

}  // namespace

PolicyTaskConfig declareAndLoadPolicyTaskConfig(rclcpp::Node& node) {
  const PolicyTaskConfig defaults;
  PolicyTaskConfig config;
  Reader read(node);
  const std::string p = "policy_task.";

  config.cycles = read.integer(p + "cycles", defaults.cycles);
  config.attempts = read.integer(p + "attempts", defaults.attempts);
  config.timeout_retry.attempts =
      read.integer(p + "timeout_retry.attempts", defaults.timeout_retry.attempts);
  config.timeout_retry.backoff_sec =
      read.number(p + "timeout_retry.backoff_sec", defaults.timeout_retry.backoff_sec);
  config.arm = read.text(p + "arm", defaults.arm);
  config.activation = read.text(p + "activation", defaults.activation);
  config.command_namespace = read.text(p + "command_namespace", defaults.command_namespace);
  for (const auto& [arm, gripper] : defaults.gripper_for_arm) {
    config.gripper_for_arm[arm] = read.text(p + "gripper_for_arm." + arm, gripper);
  }
  config.joint_lo = read.sixNumbers(p + "joint_envelope_deg.lo", defaults.joint_lo);
  config.joint_hi = read.sixNumbers(p + "joint_envelope_deg.hi", defaults.joint_hi);
  config.max_joint_speed_dps = read.number(p + "max_joint_speed_dps", defaults.max_joint_speed_dps);
  config.lm_drift_limit_deg = read.number(p + "lm_drift_limit_deg", defaults.lm_drift_limit_deg);
  config.joint_state_stale_sec = read.number(p + "joint_state_stale_sec", defaults.joint_state_stale_sec);
  config.stats_stale_sec = read.number(p + "stats_stale_sec", defaults.stats_stale_sec);
  config.service_wait_sec = read.number(p + "service_wait_sec", defaults.service_wait_sec);
  config.service_call_timeout_sec =
      read.number(p + "service_call_timeout_sec", defaults.service_call_timeout_sec);
  config.max_attempt_sec = read.number(p + "max_attempt_sec", defaults.max_attempt_sec);
  config.stall.cmd_lin_mps_below =
      read.number(p + "stall.cmd_lin_mps_below", defaults.stall.cmd_lin_mps_below);
  config.stall.cmd_ang_radps_below =
      read.number(p + "stall.cmd_ang_radps_below", defaults.stall.cmd_ang_radps_below);
  config.stall.sec = read.number(p + "stall.sec", defaults.stall.sec);
  config.release.open_above = read.number(p + "release.open_above", defaults.release.open_above);
  config.release.closed_below = read.number(p + "release.closed_below", defaults.release.closed_below);
  config.release.min_closed_sec = read.number(p + "release.min_closed_sec", defaults.release.min_closed_sec);
  config.release.joint_index = read.integer(p + "release.joint_index", defaults.release.joint_index);
  config.release.joint_below_deg =
      read.number(p + "release.joint_below_deg", defaults.release.joint_below_deg);
  config.release.settle_sec = read.number(p + "release.settle_sec", defaults.release.settle_sec);
  config.lift.min_closed_sec = read.number(p + "lift.min_closed_sec", defaults.lift.min_closed_sec);
  config.lift.joint_index = read.integer(p + "lift.joint_index", defaults.lift.joint_index);
  config.lift.joint_delta_deg = read.number(p + "lift.joint_delta_deg", defaults.lift.joint_delta_deg);
  config.lift.hold_sec = read.number(p + "lift.hold_sec", defaults.lift.hold_sec);
  config.lift.wrong_side_joint_index =
      read.integer(p + "lift.wrong_side_joint_index", defaults.lift.wrong_side_joint_index);
  config.lift.wrong_side_below_deg =
      read.number(p + "lift.wrong_side_below_deg", defaults.lift.wrong_side_below_deg);
  config.prompt_topic = read.text(p + "prompt_topic", defaults.prompt_topic);
  // ROS parameters cannot list the keys under tasks., so the names come first; each name then has
  // tasks.<name>.prompt and tasks.<name>.completion. A name without a default entry needs both.
  std::vector<std::string> default_names;
  for (const auto& [name, _] : defaults.tasks) default_names.push_back(name);
  config.tasks.clear();
  for (const auto& name : read.textList(p + "task_names", default_names)) {
    const auto fallback = defaults.tasks.find(name);
    const PolicyTaskConfig::Task base =
        fallback != defaults.tasks.end() ? fallback->second : PolicyTaskConfig::Task{};
    PolicyTaskConfig::Task task;
    task.prompt = read.text(p + "tasks." + name + ".prompt", base.prompt);
    task.completion =
        parseCompletion(read.text(p + "tasks." + name + ".completion", completionName(base.completion)));
    config.tasks[name] = task;
  }
  config.verdict.window_sec = read.number(p + "verdict.window_sec", defaults.verdict.window_sec);
  config.verdict.empty_position_min =
      read.number(p + "verdict.empty_position_min", defaults.verdict.empty_position_min);
  config.gripper_ready.open_position_max =
      read.number(p + "gripper_ready.open_position_max", defaults.gripper_ready.open_position_max);
  config.gripper_ready.timeout_sec =
      read.number(p + "gripper_ready.timeout_sec", defaults.gripper_ready.timeout_sec);
  config.gripper_ready.position_stale_sec =
      read.number(p + "gripper_ready.position_stale_sec", defaults.gripper_ready.position_stale_sec);
  config.router_release_sec = read.number(p + "router_release_sec", defaults.router_release_sec);
  config.trace.enabled = read.boolean(p + "trace.enabled", defaults.trace.enabled);
  config.trace.dir = read.text(p + "trace.dir", defaults.trace.dir);
  config.trace.period_sec = read.number(p + "trace.period_sec", defaults.trace.period_sec);

  config.validate();
  return config;
}

}  // namespace realman_bt
