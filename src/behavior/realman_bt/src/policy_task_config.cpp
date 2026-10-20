#include "realman_bt/policy_task_config.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace realman_bt {
namespace {

void require(bool condition, const std::string& message) {
  if (!condition) throw std::invalid_argument(message);
}

bool positive(double value) { return std::isfinite(value) && value > 0.0; }

bool countOk(int count) { return count == -1 || count >= 1; }

}  // namespace

void PolicyTaskConfig::validate() const {
  require(countOk(cycles), "policy_task.cycles must be -1 (no limit) or at least 1");
  require(countOk(attempts), "policy_task.attempts must be -1 (no limit) or at least 1");
  require(countOk(timeout_retry.attempts),
          "policy_task.timeout_retry.attempts must be -1 (no limit) or at least 1");
  require(std::isfinite(timeout_retry.backoff_sec) && timeout_retry.backoff_sec >= 0.0,
          "policy_task.timeout_retry.backoff_sec must not be negative");
  require(arm == "l" || arm == "m" || arm == "r", "policy_task.arm must be l, m or r");
  require(activation == "auto" || activation == "operator",
          "policy_task.activation must be auto or operator");
  require(command_namespace.size() > 1 && command_namespace.front() == '/' &&
              command_namespace.back() != '/',
          "policy_task.command_namespace must start with / and not end with /");
  const auto gripper = gripper_for_arm.find(arm);
  require(gripper != gripper_for_arm.end() && !gripper->second.empty(),
          "policy_task.gripper_for_arm needs a gripper name for arm " + arm);

  for (std::size_t joint = 0; joint < joint_lo.size(); ++joint) {
    require(std::isfinite(joint_lo[joint]) && std::isfinite(joint_hi[joint]) &&
                joint_lo[joint] < joint_hi[joint],
            "policy_task.joint_envelope_deg lo must be below hi for J" + std::to_string(joint + 1));
  }
  require(positive(max_joint_speed_dps), "policy_task.max_joint_speed_dps must be positive");
  require(positive(lm_drift_limit_deg), "policy_task.lm_drift_limit_deg must be positive");
  require(positive(joint_state_stale_sec), "policy_task.joint_state_stale_sec must be positive");
  require(positive(stats_stale_sec), "policy_task.stats_stale_sec must be positive");
  require(positive(service_wait_sec), "policy_task.service_wait_sec must be positive");
  require(positive(service_call_timeout_sec),
          "policy_task.service_call_timeout_sec must be positive");
  require(positive(max_attempt_sec), "policy_task.max_attempt_sec must be positive");
  require(positive(stall.sec) && positive(stall.cmd_lin_mps_below) &&
              positive(stall.cmd_ang_radps_below),
          "policy_task.stall thresholds and sec must be positive");
  require(positive(gripper_ready.timeout_sec) && positive(gripper_ready.open_position_max) &&
              positive(gripper_ready.position_stale_sec),
          "policy_task.gripper_ready values must be positive");
  require(positive(verdict.window_sec) && positive(verdict.empty_position_min),
          "policy_task.verdict values must be positive");
  require(release.joint_index >= 0 && release.joint_index < 6,
          "policy_task.release.joint_index must be 0..5");
  require(release.open_above > 0.0 && release.open_above <= 1.0,
          "policy_task.release.open_above must be in (0, 1]");
  require(release.closed_below > 0.0 && release.closed_below < release.open_above,
          "policy_task.release.closed_below must be in (0, open_above)");
  require(std::isfinite(release.min_closed_sec) && release.min_closed_sec >= 0.0,
          "policy_task.release.min_closed_sec must not be negative");
  require(std::isfinite(release.settle_sec) && release.settle_sec >= 0.0,
          "policy_task.release.settle_sec must not be negative");
  require(std::isfinite(release.joint_below_deg), "policy_task.release.joint_below_deg must be finite");
  require(std::isfinite(lift.min_closed_sec) && lift.min_closed_sec >= 0.0,
          "policy_task.lift.min_closed_sec must not be negative");
  require(lift.joint_index >= 0 && lift.joint_index < 6, "policy_task.lift.joint_index must be 0..5");
  require(std::isfinite(lift.joint_delta_deg) && lift.joint_delta_deg != 0.0,
          "policy_task.lift.joint_delta_deg must be a non-zero number");
  require(std::isfinite(lift.hold_sec) && lift.hold_sec >= 0.0,
          "policy_task.lift.hold_sec must not be negative");
  require(lift.wrong_side_joint_index >= 0 && lift.wrong_side_joint_index < 6,
          "policy_task.lift.wrong_side_joint_index must be 0..5");
  require(std::isfinite(lift.wrong_side_below_deg), "policy_task.lift.wrong_side_below_deg must be finite");
  require(prompt_topic.size() > 1 && prompt_topic.front() == '/',
          "policy_task.prompt_topic must start with /");
  require(!tasks.empty(), "policy_task.tasks must name at least one task");
  for (const auto& [name, task] : tasks) {
    require(!name.empty(), "policy_task.task_names must not contain an empty name");
    require(!task.prompt.empty(), "policy_task.tasks." + name + ".prompt must not be empty");
    for (const auto& [other_name, other] : tasks) {
      require(other_name == name || other.prompt != task.prompt,
              "policy_task.tasks." + name + ".prompt is the same as tasks." + other_name + ".prompt");
    }
  }
  require(positive(trace.period_sec), "policy_task.trace.period_sec must be positive");
  require(!trace.enabled || !trace.dir.empty(), "policy_task.trace.dir must be set when the trace is enabled");
  require(std::isfinite(router_release_sec) && router_release_sec >= 0.0,
          "policy_task.router_release_sec must not be negative");
  for (const double degrees : pick_cycle.lift_joint_degrees) {
    require(std::isfinite(degrees), "policy_task.pick_cycle.lift_joint_degrees must be finite");
  }
  require(pick_cycle.release_joint >= 1 && pick_cycle.release_joint <= 6,
          "policy_task.pick_cycle.release_joint must be 1..6");
  require(std::isfinite(pick_cycle.release_joint_deg) && pick_cycle.release_joint_deg >= -360.0 &&
              pick_cycle.release_joint_deg <= 360.0,
          "policy_task.pick_cycle.release_joint_deg must be in [-360, 360]");
  const auto& detection = object_detection;
  require(detection.image_topic.size() > 1 && detection.image_topic.front() == '/',
          "policy_task.object_detection.image_topic must start with /");
  require(detection.roi_xywh[0] >= 0 && detection.roi_xywh[1] >= 0 && detection.roi_xywh[2] > 0 &&
              detection.roi_xywh[3] > 0,
          "policy_task.object_detection.roi_xywh needs x, y >= 0 and width, height > 0");
  require(detection.min_channel >= 0 && detection.min_channel <= 255,
          "policy_task.object_detection.min_channel must be 0..255");
  require(detection.max_chroma >= 0 && detection.max_chroma <= 255,
          "policy_task.object_detection.max_chroma must be 0..255");
  require(detection.erode_px >= 1 && detection.erode_px % 2 == 1 &&
              detection.erode_px <= std::min(detection.roi_xywh[2], detection.roi_xywh[3]),
          "policy_task.object_detection.erode_px must be odd, at least 1 and fit in the roi");
  require(detection.min_pixels >= 1, "policy_task.object_detection.min_pixels must be at least 1");
  require(std::isfinite(detection.settle_sec) && detection.settle_sec >= 0.0,
          "policy_task.object_detection.settle_sec must not be negative");
  require(positive(detection.timeout_sec), "policy_task.object_detection.timeout_sec must be positive");
}

const PolicyTaskConfig::Task& PolicyTaskConfig::task(const std::string& name) const {
  const auto found = tasks.find(name);
  if (found != tasks.end()) return found->second;
  std::string known;
  for (const auto& [task_name, _] : tasks) known += (known.empty() ? "" : ", ") + task_name;
  throw std::invalid_argument("unknown policy task '" + name + "' (policy_task.task_names: " + known + ")");
}

const char* completionName(PolicyTaskConfig::Completion completion) {
  switch (completion) {
    case PolicyTaskConfig::Completion::kReleaseOverBin:
      return "release_over_bin";
    case PolicyTaskConfig::Completion::kLiftAndHold:
      return "lift_and_hold";
  }
  return "release_over_bin";
}

PolicyTaskConfig::Completion parseCompletion(const std::string& text) {
  if (text == "release_over_bin") return PolicyTaskConfig::Completion::kReleaseOverBin;
  if (text == "lift_and_hold") return PolicyTaskConfig::Completion::kLiftAndHold;
  throw std::invalid_argument("completion must be release_over_bin or lift_and_hold, got '" + text + "'");
}

}  // namespace realman_bt
