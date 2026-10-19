#pragma once

#include <array>
#include <map>
#include <string>

namespace realman_bt {

// Blackboard keys shared by the policy task leaves (GripperReady, PolicyRun) and the decorators
// and fail leaf around them. XML refers to them only through port remapping.
inline constexpr char kPolicyTaskConfigBlackboardKey[] = "__realman_bt_policy_task_config__";
inline constexpr char kPolicyFailureReasonKey[] = "policy_failure_reason";
inline constexpr char kPolicyAttemptResultKey[] = "policy_attempt_result";
inline constexpr char kPolicyGraspVerdictKey[] = "policy_grasp_verdict";
inline constexpr char kPolicyAttemptSecKey[] = "policy_attempt_sec";
inline constexpr char kPolicyArmedKey[] = "policy_armed";
inline constexpr char kPolicyCyclesKey[] = "policy_cycles";
inline constexpr char kPolicyAttemptsKey[] = "policy_attempts";

// Thresholds of the policy task. The values come from config/ros/policy_task.yaml (executor
// parameters under `policy_task.`); the defaults below are the same numbers so a missing file
// still gives the reviewed behaviour. Every number here has its source in the design doc
// docs/superpowers/specs/2026-10-14-policy-task-in-bt-design.md.
struct PolicyTaskConfig {
  struct Stall {
    double cmd_lin_mps_below{0.01};
    double cmd_ang_radps_below{0.04};
    double sec{8.0};
  };
  struct Release {
    double open_above{0.8};     // policy gripper command above this = "open"
    double closed_below{0.2};   // below this = "closed"; time spent here counts towards min_closed_sec
    double min_closed_sec{3.0};
    int joint_index{0};         // J1: the arm is over the bin when it is far negative
    double joint_below_deg{-35.0};
    double settle_sec{1.0};     // keep supervising this long so the gripper really opens
  };
  struct Verdict {
    double window_sec{3.0};
    double empty_position_min{7800.0};  // closed plateau at or above this = jaws met = nothing held
  };
  struct GripperReady {
    double open_position_max{500.0};
    double timeout_sec{20.0};
    double position_stale_sec{2.0};
  };

  // One CSV per attempt (see policy_trace.hpp): the right arm's joints, the other arms' drift, the
  // gripper and the commanded speeds, sampled every period_sec, with the outcome at the end.
  struct Trace {
    bool enabled{true};
    std::string dir{"/opt/rm65_ws/logs/policy-attempts"};  // the host's ~/realman_pi/logs/policy-attempts
    double period_sec{0.1};
  };

  int cycles{1};
  int attempts{3};
  std::string arm{"r"};
  // "auto": PolicyRun calls /policy/activate itself once it is safe. "operator": it waits for a
  // person to call /policy/activate and only supervises.
  std::string activation{"auto"};
  // Where the bridge publishes the policy's own commands (config/ros/policy_bridge.yaml
  // downlink.command_namespace); the gripper command topic is <namespace>/<arm>/gripper_percentage.
  std::string command_namespace{"/pi05_policy"};
  std::map<std::string, std::string> gripper_for_arm{
      {"l", "gripper_left"}, {"m", "gripper_mid"}, {"r", "gripper_right"}};
  // RealMan degrees. p1/p99 over all 130 demonstration episodes, each side widened by 10 degrees;
  // the J5 floor is 20 (demos reach 5.6, but that is too close to the wrist singularity to allow).
  std::array<double, 6> joint_lo{-73.4, 5.0, -16.2, -28.4, 20.0, -125.1};
  std::array<double, 6> joint_hi{40.1, 107.0, 124.3, 70.8, 108.2, 49.0};
  double max_joint_speed_dps{50.0};
  double lm_drift_limit_deg{1.0};
  double joint_state_stale_sec{1.0};
  double stats_stale_sec{5.0};
  double service_wait_sec{10.0};
  double service_call_timeout_sec{2.0};
  double max_attempt_sec{45.0};
  Stall stall;
  Release release;
  Verdict verdict;
  GripperReady gripper_ready;
  double router_release_sec{1.5};
  Trace trace;

  // Throws std::invalid_argument naming the offending key.
  void validate() const;
};

}  // namespace realman_bt
