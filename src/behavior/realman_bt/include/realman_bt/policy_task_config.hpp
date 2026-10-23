#pragma once

#include <array>
#include <map>
#include <string>
#include <vector>

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
inline constexpr char kPolicyTimeoutAttemptsKey[] = "policy_timeout_attempts";
inline constexpr char kPolicyTimeoutBackoffSecKey[] = "policy_timeout_backoff_sec";
// Pick-and-clear cycle (config/behavior-trees/control_pick.xml): the lift pose as six comma-separated
// degrees for MoveJ, the joint that turns to the release side and its target angle.
inline constexpr char kPickLiftJointDegreesKey[] = "pick_lift_joint_degrees";
inline constexpr char kPickReleaseJointKey[] = "pick_release_joint";
inline constexpr char kPickReleaseJointDegKey[] = "pick_release_joint_deg";

// Thresholds of the policy task. The values come from config/ros/policy_task.yaml (executor
// parameters under `policy_task.`); the defaults below are the same numbers so a missing file
// still gives the reviewed behaviour. Every number here has its source in the design doc
// docs/superpowers/specs/2026-10-14-policy-task-in-bt-design.md.
struct PolicyTaskConfig {
  // How an attempt of a task ends successfully. The thresholds of each live in their own block
  // below (`release`, `lift`), shared by every task that uses that completion.
  enum class Completion {
    kReleaseOverBin,  // pick and place: the policy lets go over the bin with the object held
    kLiftAndHold,     // pick only: the policy lifts the grasped object and keeps holding it
  };
  // One task the policy was trained on. `prompt` selects it at inference time and must equal the
  // training view's task text verbatim (one character off puts the model out of distribution).
  struct Task {
    std::string prompt;
    Completion completion{Completion::kReleaseOverBin};
  };
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
  // lift_and_hold: once the gripper holds the object (position below verdict.empty_position_min
  // with torque) and joint `joint_index` has moved `joint_delta_deg` from where it was when the
  // gripper closed (negative = the joint value decreases; J2 decreases as the RM65 lifts), the
  // attempt succeeds after `hold_sec` more of holding. Turning to the bin side (joint
  // `wrong_side_joint_index` below `wrong_side_below_deg`) after closing means the policy is doing
  // the place task instead: a fault, retrying will not help. Measured on 2026-10-19: the pick runs
  // lift J2 by ~11-40 deg and keep J1 near +8, the place runs turn J1 to about -60.
  struct Lift {
    double min_closed_sec{3.0};
    int joint_index{1};
    double joint_delta_deg{-10.0};
    double hold_sec{2.0};
    int wrong_side_joint_index{0};
    double wrong_side_below_deg{-25.0};
  };
  struct Verdict {
    double window_sec{3.0};
    double empty_position_min{7800.0};  // closed plateau at or above this = jaws met = nothing held
  };
  // control_pick.xml: after a pick attempt lifts the object, the arm goes to lift_joint_degrees,
  // turns joint release_joint (1-based) to release_joint_deg and opens the gripper there. The lift
  // pose is the right arm's start pose (pika_config.yaml) until a dedicated one is measured.
  struct PickCycle {
    std::array<double, 6> lift_joint_degrees{-9.89, 18.046, 79.074, 15.505, 79.606, -6.194};
    int release_joint{1};
    double release_joint_deg{-135.0};
  };
  // WhiteObjectsRemain: are there still white objects (the power adapters) on the mat? Pixels of
  // the ROI whose smallest RGB channel is at least min_channel and whose channel spread is at most
  // max_chroma count as white; only those whose whole erode_px x erode_px square is white survive
  // (this drops the thin white cables), and min_pixels survivors mean an object is left. The image
  // is the first one received settle_sec after the check starts, so it shows the parked arm.
  // Measured 2026-10-20 on D435 frames: adapters 110-170 per channel, the green mat below 40,
  // one adapter keeps 245-500 pixels after a 9 px erosion, the cables at most 73 (live, 2026-10-20).
  // exclude_xywh lists rectangles (x, y, width, height, flattened) inside which no pixel counts as
  // white: the ceiling light's reflection on the glossy mat is as white as an adapter. An object
  // lying in an excluded rectangle is not seen, so the loop can end with it still there.
  struct ObjectDetection {
    std::string image_topic{"/camera_global/d435/color/image_raw"};
    std::array<int, 4> roi_xywh{235, 125, 250, 230};
    std::vector<int> exclude_xywh{392, 170, 75, 185};
    int min_channel{90};
    int max_chroma{40};
    int erode_px{9};
    int min_pixels{150};
    double settle_sec{1.0};
    double timeout_sec{5.0};
  };
  // Pressing into the table: the supervised arm's joint current (|mA| from /<arm>/joint_currents)
  // above limits_ma[joint] in every reading for sustain_sec ends the attempt as a retryable
  // `overcurrent`, so the retry opens the gripper, goes home and grasps again. Measured on the 67
  // pick/place attempts of 2026-10-20..23: normal approaches and grasps stay below 1.6/3.7/4.5/2.4/
  // 2.7/1.1 A held for 0.5 s; pressing on the table saturates J2 at ~10 A (J3 16, J4/J5 9) for
  // seconds, and twice (2026-10-23 16:28 and 16:42) the controller tripped ~6 s after J2 passed 7 A.
  struct CurrentGuard {
    bool enabled{true};
    std::array<double, 6> limits_ma{4000.0, 7000.0, 8000.0, 6000.0, 7500.0, 3000.0};
    double sustain_sec{0.5};
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

  // Policy-server timeouts (the bridge paused itself after its inference requests timed out, the
  // bridge did not get ready or went silent, /policy/activate did not answer) are retried on their
  // own budget, after a wait that gives a warming-up server or a congested link time to recover.
  // They do not use up `attempts`, which counts the policy's own failures (empty grasp, timeout,
  // stall). attempts: timeouts allowed per cycle, the first counts; -1 = no limit.
  struct TimeoutRetry {
    int attempts{3};
    double backoff_sec{20.0};
  };

  int cycles{1};
  int attempts{3};
  TimeoutRetry timeout_retry;
  std::string arm{"r"};
  // "auto": PolicyRun calls /policy/activate itself once it is safe. "operator": it waits for a
  // person to call /policy/activate and only supervises.
  std::string activation{"auto"};
  // Where the bridge publishes the policy's own commands (config/ros/policy_bridge.yaml
  // downlink.command_namespace); the gripper command topic is <namespace>/<arm>/gripper_percentage.
  std::string command_namespace{"/pi05_policy"};
  // The bridge's prompt topic (config/ros/policy_bridge.yaml prompt.topic). PolicyRun publishes the
  // task's prompt there and only starts once /policy/stats reports that the bridge uses it.
  std::string prompt_topic{"/policy/prompt"};
  // Tasks by name; PolicyRun's `task` port picks one. The defaults are the two tasks of the
  // multitask model m_multitask_b16_2gpu (2026-10-16).
  std::map<std::string, Task> tasks{
      {"place", {"pick up the power adapter and put it in the blue bin", Completion::kReleaseOverBin}},
      {"pick", {"pick up the power adapter", Completion::kLiftAndHold}}};
  std::map<std::string, std::string> gripper_for_arm{
      {"l", "gripper_left"}, {"m", "gripper_mid"}, {"r", "gripper_right"}};
  // RealMan degrees. p1/p99 over all 130 demonstration episodes, each side widened by 10 degrees;
  // J5 by the same rule (p1 13.5 - 10 = 3.5), still above the wrist singularity at 0.
  std::array<double, 6> joint_lo{-73.4, 5.0, -16.2, -28.4, 3.5, -125.1};
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
  Lift lift;
  Verdict verdict;
  CurrentGuard current_guard;
  GripperReady gripper_ready;
  PickCycle pick_cycle;
  ObjectDetection object_detection;
  double router_release_sec{1.5};
  Trace trace;

  // Throws std::invalid_argument naming the offending key.
  void validate() const;
  // The task called `name`; throws std::invalid_argument listing the known names if there is none.
  const Task& task(const std::string& name) const;
};

// "release_over_bin" / "lift_and_hold"; parseCompletion throws std::invalid_argument otherwise.
const char* completionName(PolicyTaskConfig::Completion completion);
PolicyTaskConfig::Completion parseCompletion(const std::string& text);

}  // namespace realman_bt
