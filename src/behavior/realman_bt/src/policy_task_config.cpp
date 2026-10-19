#include "realman_bt/policy_task_config.hpp"

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
  require(positive(trace.period_sec), "policy_task.trace.period_sec must be positive");
  require(!trace.enabled || !trace.dir.empty(), "policy_task.trace.dir must be set when the trace is enabled");
  require(std::isfinite(router_release_sec) && router_release_sec >= 0.0,
          "policy_task.router_release_sec must not be negative");
}

}  // namespace realman_bt
