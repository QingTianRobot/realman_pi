#include "realman_bt/policy_supervisor.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>

namespace realman_bt {
namespace {

// Speed is taken between samples at least this far apart, so two readings that arrive back to back
// (queueing jitter on a 10 Hz topic) cannot turn a slow motion into a fast one.
constexpr double kMinSpeedWindowSec = 0.08;
// A driver command older than this no longer counts as "the policy is commanding motion".
constexpr double kCommandFreshSec = 0.3;
constexpr std::size_t kMaxGripperSamples = 4000;

std::string number(double value, int decimals) {
  char buffer[48];
  std::snprintf(buffer, sizeof(buffer), "%.*f", decimals, value);
  return buffer;
}

double median(std::vector<double> values) {
  std::sort(values.begin(), values.end());
  const std::size_t n = values.size();
  return n % 2 == 1 ? values[n / 2] : 0.5 * (values[n / 2 - 1] + values[n / 2]);
}

}  // namespace

const char* outcomeName(AttemptOutcome outcome) {
  switch (outcome) {
    case AttemptOutcome::kReleasedHeld:
      return "released_held";
    case AttemptOutcome::kReleasedEmpty:
      return "released_empty";
    case AttemptOutcome::kTimeout:
      return "timeout";
    case AttemptOutcome::kStall:
      return "stall";
    case AttemptOutcome::kFault:
      return "fault";
  }
  return "fault";
}

PolicySupervisor::PolicySupervisor(PolicyTaskConfig config) : config_(std::move(config)) {}

void PolicySupervisor::reset() {
  started_ = false;
  start_time_ = 0.0;
  last_eval_time_ = 0.0;
  closed_total_ = 0.0;
  last_closed_time_ = -1.0;
  release_time_.reset();
  stall_since_.reset();
  latched_fault_.reset();
  release_grasp_.clear();
  reference_.clear();
  history_.clear();
  gripper_samples_.clear();
  verdict_ = Verdict();
}

void PolicySupervisor::latchFault(std::string reason) {
  if (!latched_fault_) latched_fault_ = std::move(reason);
}

void PolicySupervisor::onJoints(const std::string& arm, const Joints& degrees, double sample_time,
                                double received_time) {
  ArmReading& reading = arms_[arm];
  reading.valid = true;
  reading.degrees = degrees;
  reading.sample_time = sample_time;
  reading.received_time = received_time;
  if (!started_ || verdict_.finished || latched_fault_) return;

  if (arm == config_.arm) {
    for (std::size_t joint = 0; joint < degrees.size(); ++joint) {
      if (degrees[joint] < config_.joint_lo[joint] || degrees[joint] > config_.joint_hi[joint]) {
        latchFault("joint J" + std::to_string(joint + 1) + " = " + number(degrees[joint], 1) +
                   " deg is outside [" + number(config_.joint_lo[joint], 1) + ", " +
                   number(config_.joint_hi[joint], 1) + "]");
        return;
      }
    }
    checkSpeed(degrees, sample_time);
    return;
  }

  const auto reference = reference_.find(arm);
  if (reference == reference_.end()) return;
  double drift = 0.0;
  for (std::size_t joint = 0; joint < degrees.size(); ++joint) {
    drift = std::max(drift, std::fabs(degrees[joint] - reference->second[joint]));
  }
  if (drift > config_.lm_drift_limit_deg) {
    latchFault("arm " + arm + " moved " + number(drift, 2) + " deg since the attempt started (limit " +
               number(config_.lm_drift_limit_deg, 2) + ")");
  }
}

void PolicySupervisor::checkSpeed(const Joints& degrees, double sample_time) {
  history_.emplace_back(sample_time, degrees);
  // Newest earlier sample that is far enough back to give a trustworthy rate.
  int reference_index = -1;
  for (int i = static_cast<int>(history_.size()) - 2; i >= 0; --i) {
    if (sample_time - history_[i].first >= kMinSpeedWindowSec - 1e-9) {
      reference_index = i;
      break;
    }
  }
  if (reference_index < 0) return;
  const auto& earlier = history_[reference_index];
  const double dt = sample_time - earlier.first;
  double fastest = 0.0;
  for (std::size_t joint = 0; joint < degrees.size(); ++joint) {
    fastest = std::max(fastest, std::fabs(degrees[joint] - earlier.second[joint]) / dt);
  }
  history_.erase(history_.begin(), history_.begin() + reference_index);
  if (fastest > config_.max_joint_speed_dps) {
    latchFault("joint speed " + number(fastest, 0) + " deg/s exceeds " +
               number(config_.max_joint_speed_dps, 0) + " deg/s");
  }
}

void PolicySupervisor::onBridgeStats(const BridgeStats& stats, double received_time) {
  stats_ = stats;
  stats_valid_ = true;
  stats_received_ = received_time;
}

void PolicySupervisor::onPolicyGripperCommand(double value, double) {
  policy_gripper_ = value;
  policy_gripper_valid_ = true;
}

void PolicySupervisor::onDriverCommand(double linear_mps, double angular_radps, double time) {
  cmd_linear_ = linear_mps;
  cmd_angular_ = angular_radps;
  cmd_time_ = time;
  cmd_valid_ = true;
}

void PolicySupervisor::onGripperReading(double position, bool torque_reached, double time) {
  last_gripper_position_ = position;
  last_torque_reached_ = torque_reached;
  gripper_samples_.push_back({time, position, torque_reached});
  while (!gripper_samples_.empty() && (time - gripper_samples_.front().time > 60.0 ||
                                       gripper_samples_.size() > kMaxGripperSamples)) {
    gripper_samples_.pop_front();
  }
}

void PolicySupervisor::start(double now) {
  reset();
  started_ = true;
  start_time_ = now;
  last_eval_time_ = now;
  for (const char* arm : {"l", "m", "r"}) {
    const auto reading = arms_.find(arm);
    if (reading == arms_.end() || !reading->second.valid) continue;
    if (arm == config_.arm) {
      history_.emplace_back(reading->second.sample_time, reading->second.degrees);
    } else {
      reference_[arm] = reading->second.degrees;
    }
  }
}

void PolicySupervisor::finish(double now, AttemptOutcome outcome, std::string reason,
                              std::string grasp) {
  verdict_.finished = true;
  verdict_.outcome = outcome;
  verdict_.fault = outcome == AttemptOutcome::kFault;
  verdict_.reason = std::move(reason);
  verdict_.grasp_verdict = std::move(grasp);
  verdict_.attempt_sec = now - start_time_;
}

void PolicySupervisor::finishFault(double now, std::string reason) {
  finish(now, AttemptOutcome::kFault, std::move(reason), release_grasp_);
}

std::string PolicySupervisor::judgeGrasp() const {
  const double window_end = last_closed_time_;
  const double window_start = window_end - config_.verdict.window_sec;
  std::vector<double> positions;
  bool torque = false;
  for (const auto& sample : gripper_samples_) {
    if (sample.time < window_start || sample.time > window_end) continue;
    positions.push_back(sample.position);
    torque = torque || sample.torque_reached;
  }
  if (positions.empty()) return "unknown";
  const bool held = median(positions) < config_.verdict.empty_position_min && torque;
  return held ? "held" : "empty";
}

SupervisorSnapshot PolicySupervisor::snapshot(double now) const {
  SupervisorSnapshot out;
  out.started = started_;
  out.finished = verdict_.finished;
  out.elapsed_sec = started_ ? now - start_time_ : 0.0;
  const auto supervised = arms_.find(config_.arm);
  if (supervised != arms_.end() && supervised->second.valid) {
    out.arm_valid = true;
    out.arm = supervised->second.degrees;
  }
  for (const char* arm : {"l", "m", "r"}) {
    if (arm == config_.arm) continue;
    double drift = 0.0;
    const auto reading = arms_.find(arm);
    const auto reference = reference_.find(arm);
    if (started_ && reading != arms_.end() && reading->second.valid && reference != reference_.end()) {
      for (std::size_t joint = 0; joint < 6; ++joint) {
        drift = std::max(drift, std::fabs(reading->second.degrees[joint] - reference->second[joint]));
      }
    }
    out.drift_deg[arm] = drift;
  }
  if (policy_gripper_valid_) out.policy_gripper = policy_gripper_;
  out.gripper_position = last_gripper_position_;
  out.torque_reached = last_torque_reached_;
  if (cmd_valid_) {
    out.cmd_linear = cmd_linear_;
    out.cmd_angular = cmd_angular_;
  }
  out.stats_allow_publish = stats_.allow_publish;
  out.stats_paused = stats_.paused;
  out.closed_total_sec = closed_total_;
  return out;
}

const Verdict& PolicySupervisor::evaluate(double now) {
  if (!started_ || verdict_.finished) return verdict_;

  if (latched_fault_) {
    finishFault(now, *latched_fault_);
    return verdict_;
  }

  for (const char* arm : {"l", "m", "r"}) {
    const auto reading = arms_.find(arm);
    const double last = reading != arms_.end() && reading->second.valid
                            ? std::max(reading->second.received_time, start_time_)
                            : start_time_;
    if (now - last > config_.joint_state_stale_sec) {
      finishFault(now, "no " + std::string(arm) + " joint_states for " + number(now - last, 1) + " s");
      return verdict_;
    }
  }

  if (stats_valid_ && stats_.paused) {
    finishFault(now, "the policy bridge paused itself (inference is failing)");
    return verdict_;
  }
  const double stats_age = now - std::max(stats_valid_ ? stats_received_ : start_time_, start_time_);
  if (stats_age > config_.stats_stale_sec) {
    finishFault(now, "no policy bridge stats for " + number(stats_age, 1) + " s");
    return verdict_;
  }

  const double dt = std::max(0.0, now - last_eval_time_);
  last_eval_time_ = now;
  const bool closed = policy_gripper_valid_ && policy_gripper_ < config_.release.closed_below;
  if (closed) {
    closed_total_ += dt;
    last_closed_time_ = now;
  }

  const auto supervised = arms_.find(config_.arm);
  if (!release_time_ && policy_gripper_valid_ && policy_gripper_ > config_.release.open_above &&
      closed_total_ >= config_.release.min_closed_sec && supervised != arms_.end() &&
      supervised->second.degrees[config_.release.joint_index] < config_.release.joint_below_deg) {
    release_time_ = now;
    release_grasp_ = judgeGrasp();
  }

  if (release_time_) {
    if (now - *release_time_ >= config_.release.settle_sec) {
      if (release_grasp_ == "held") {
        finish(now, AttemptOutcome::kReleasedHeld, "", release_grasp_);
      } else if (release_grasp_ == "empty") {
        finish(now, AttemptOutcome::kReleasedEmpty,
               "released over the bin but the jaws closed on nothing", release_grasp_);
      } else {
        finish(now, AttemptOutcome::kReleasedEmpty,
               "released over the bin but there were no gripper readings to judge the grasp",
               release_grasp_);
      }
    }
    return verdict_;
  }

  if (now - start_time_ > config_.max_attempt_sec) {
    finish(now, AttemptOutcome::kTimeout,
           "no release within " + number(config_.max_attempt_sec, 0) + " s", "");
    return verdict_;
  }

  const bool commanding = cmd_valid_ && now - cmd_time_ <= kCommandFreshSec &&
                          (cmd_linear_ >= config_.stall.cmd_lin_mps_below ||
                           cmd_angular_ >= config_.stall.cmd_ang_radps_below);
  if (closed && !commanding) {
    if (!stall_since_) stall_since_ = now;
    if (now - *stall_since_ >= config_.stall.sec) {
      finish(now, AttemptOutcome::kStall,
             "the gripper is closed and the policy has not moved for " +
                 number(config_.stall.sec, 0) + " s",
             "");
    }
  } else {
    stall_since_.reset();
  }
  return verdict_;
}

}  // namespace realman_bt
