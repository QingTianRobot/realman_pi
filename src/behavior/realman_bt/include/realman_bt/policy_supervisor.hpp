#pragma once

#include <array>
#include <cmath>
#include <deque>
#include <map>
#include <optional>
#include <string>
#include <utility>

#include "realman_bt/policy_task_config.hpp"

namespace realman_bt {

using Joints = std::array<double, 6>;  // RealMan degrees

enum class AttemptOutcome {
  kReleasedHeld,   // release_over_bin: let go over the bin with the object between the jaws: success
  kReleasedEmpty,  // release_over_bin: let go over the bin but nothing was held: retryable
  kLiftedHeld,     // lift_and_hold: lifted the object and kept holding it: success
  kDropped,        // lift_and_hold: held the object, then it slipped out of the closed jaws: retryable
  kWrongTask,      // lift_and_hold: turned to the bin side, i.e. ran the place task: not retryable
  kTimeout,        // no success in max_attempt_sec: retryable
  kStall,          // gripper closed and the policy stopped moving: retryable
  kFault,          // something unsafe or broken: not retryable
};

const char* outcomeName(AttemptOutcome outcome);
bool isSuccess(AttemptOutcome outcome);
// Outcomes that end the task instead of being retried.
bool isFault(AttemptOutcome outcome);

struct BridgeStats {
  bool allow_publish{false};
  bool mode_active{false};
  bool paused{false};
};

struct Verdict {
  bool finished{false};
  AttemptOutcome outcome{AttemptOutcome::kFault};
  bool succeeded{false};      // true exactly for the success outcomes (isSuccess)
  bool fault{false};          // true exactly for the outcomes nothing should retry (isFault)
  std::string reason;         // why the attempt did not succeed; empty on success
  std::string grasp_verdict;  // "held", "empty", "unknown", or empty when there was no release
  double attempt_sec{0.0};
};

// Everything the supervisor currently knows, for the trace. Readings that never arrived are NaN.
struct SupervisorSnapshot {
  bool started{false};
  bool finished{false};
  double elapsed_sec{0.0};  // since start(); 0 before it
  bool arm_valid{false};
  Joints arm{};
  std::map<std::string, double> drift_deg;  // each other arm: largest joint change since start()
  double policy_gripper{std::nan("")};
  double gripper_position{std::nan("")};
  bool torque_reached{false};
  double cmd_linear{std::nan("")};
  double cmd_angular{std::nan("")};
  bool stats_allow_publish{false};
  bool stats_paused{false};
  double closed_total_sec{0.0};
};

// The decisions of PolicyRun, with no ROS in it: it is fed the sensor readings as they arrive and
// asked for a verdict once per tick. All times are seconds on one monotonic clock.
//
// Faults (joint range, joint speed, the other arms drifting, lost joint states, a paused or silent
// bridge) are checked as each reading arrives, so a reading that is bad for one sample between two
// ticks is still caught, and the first one latches. Then, in this order of priority: fault, the
// task's completion (release settled, or wrong side / dropped / lifted and held), timeout, stall.
class PolicySupervisor {
 public:
  explicit PolicySupervisor(PolicyTaskConfig config);

  // Forgets everything about the current attempt; the latest sensor readings are kept.
  void reset();

  // `sample_time` is the time the reading describes (used for speed), `received_time` when it
  // arrived (used for staleness). `arm` is l, m or r; the configured arm is supervised, the others
  // must stay where they were when the attempt started.
  void onJoints(const std::string& arm, const Joints& degrees, double sample_time,
                double received_time);
  void onBridgeStats(const BridgeStats& stats, double received_time);
  void onPolicyGripperCommand(double value, double time);  // 0 = closed, 1 = open
  void onDriverCommand(double linear_mps, double angular_radps, double time);
  void onGripperReading(double position, bool torque_reached, double time);

  // Starts an attempt of task `task_name` (a key of config.tasks; throws std::invalid_argument for
  // an unknown one). The task decides how a successful attempt ends.
  void start(double now, const std::string& task_name = "place");
  const Verdict& evaluate(double now);

  // Read-only view of the latest readings and progress; never changes the verdict.
  SupervisorSnapshot snapshot(double now) const;

 private:
  struct ArmReading {
    bool valid{false};
    Joints degrees{};
    double sample_time{0.0};
    double received_time{0.0};
  };
  struct GripperSample {
    double time;
    double position;
    bool torque_reached;
  };

  void latchFault(std::string reason);
  void finishFault(double now, std::string reason);
  void finish(double now, AttemptOutcome outcome, std::string reason, std::string grasp);
  std::string judgeGrasp() const;
  void checkSpeed(const Joints& degrees, double sample_time);
  // The completion checks; each may finish the verdict. evaluateRelease returns true while the
  // release is settling (nothing else may end the attempt then).
  bool evaluateRelease(double now);
  void evaluateLift(double now, bool closed);

  PolicyTaskConfig config_;
  std::map<std::string, ArmReading> arms_;
  BridgeStats stats_;
  bool stats_valid_{false};
  double stats_received_{0.0};
  double policy_gripper_{1.0};
  bool policy_gripper_valid_{false};
  double cmd_linear_{0.0};
  double cmd_angular_{0.0};
  double cmd_time_{0.0};
  bool cmd_valid_{false};
  std::deque<GripperSample> gripper_samples_;  // this attempt only: the grasp verdict looks back over it
  double last_gripper_position_{std::nan("")};  // the latest reading, kept across reset() for the snapshot
  bool last_torque_reached_{false};

  bool started_{false};
  double start_time_{0.0};
  double last_eval_time_{0.0};
  double closed_total_{0.0};
  double last_closed_time_{-1.0};
  PolicyTaskConfig::Task task_;
  std::optional<double> release_time_;
  std::optional<double> lift_reference_deg_;  // lift.joint_index when the gripper first closed
  std::optional<double> lifted_since_;
  bool held_once_{false};  // lift_and_hold: the closed jaws held something at least once
  std::optional<double> stall_since_;
  std::optional<std::string> latched_fault_;
  std::string release_grasp_;
  std::map<std::string, Joints> reference_;
  std::deque<std::pair<double, Joints>> history_;
  Verdict verdict_;
};

}  // namespace realman_bt
