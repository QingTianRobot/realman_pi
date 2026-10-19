#include "realman_bt/policy_run_node.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <utility>

#include "realman_bt/policy_task_blackboard.hpp"

namespace realman_bt {
namespace {

constexpr double kRadToDeg = 57.29577951308232;

}  // namespace

bt_core::PortsList PolicyRunNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "Arm the policy drives"),
      bt_core::InputPort<bool>("dry_run", "true",
                               "Validate and record only; no topics, no service calls"));
}

double PolicyRunNode::nowSec() const {
  return std::chrono::duration<double>(Clock::now().time_since_epoch()).count();
}

void PolicyRunNode::initialize() {
  if (supervisor_) return;
  config_ = &requirePolicyTaskConfig(blackboard());
  arm_ = getInput<std::string>("arm_id").value_or("r");
  const auto gripper = config_->gripper_for_arm.find(arm_);
  if (gripper == config_->gripper_for_arm.end() || gripper->second.empty()) {
    throw std::runtime_error("policy_task.gripper_for_arm has no gripper for arm " + arm_);
  }
  gripper_ = gripper->second;
  ros_node_ = &requireRosNode(blackboard());

  PolicyTaskConfig supervised = *config_;
  supervised.arm = arm_;
  supervised.validate();
  supervisor_ = std::make_unique<PolicySupervisor>(supervised);

  // Best effort accepts both reliable and best-effort publishers, so a QoS difference can never
  // make a safety input silently disappear.
  const auto sensor_qos = rclcpp::QoS(10).best_effort();
  for (const char* name : {"l", "m", "r"}) {
    const std::string joint_arm = name;
    subscriptions_.push_back(ros_node_->create_subscription<sensor_msgs::msg::JointState>(
        "/" + joint_arm + "/joint_states", sensor_qos,
        [this, joint_arm](sensor_msgs::msg::JointState::ConstSharedPtr message) {
          if (message->position.size() < 6) return;
          Joints degrees{};
          for (std::size_t i = 0; i < 6; ++i) degrees[i] = message->position[i] * kRadToDeg;
          const double stamp = message->header.stamp.sec + message->header.stamp.nanosec * 1e-9;
          const double received = nowSec();
          std::lock_guard<std::mutex> lock(mutex_);
          supervisor_->onJoints(joint_arm, degrees, stamp > 0.0 ? stamp : received, received);
          joints_at_[joint_arm] = Clock::now();
        }));
  }
  subscriptions_.push_back(
      ros_node_->create_subscription<diagnostic_msgs::msg::DiagnosticArray>(
          "/policy/stats", sensor_qos,
          [this](diagnostic_msgs::msg::DiagnosticArray::ConstSharedPtr message) {
            if (message->status.empty()) return;
            BridgeStats stats;
            for (const auto& value : message->status.front().values) {
              const bool on = std::atof(value.value.c_str()) != 0.0;
              if (value.key == "allow_publish") stats.allow_publish = on;
              if (value.key == "mode_active") stats.mode_active = on;
              if (value.key == "paused") stats.paused = on;
            }
            std::lock_guard<std::mutex> lock(mutex_);
            stats_ = stats;
            stats_valid_ = true;
            stats_at_ = Clock::now();
            supervisor_->onBridgeStats(stats, nowSec());
          }));
  subscriptions_.push_back(ros_node_->create_subscription<std_msgs::msg::Float32>(
      config_->command_namespace + "/" + arm_ + "/gripper_percentage", sensor_qos,
      [this](std_msgs::msg::Float32::ConstSharedPtr message) {
        std::lock_guard<std::mutex> lock(mutex_);
        supervisor_->onPolicyGripperCommand(message->data, nowSec());
      }));
  subscriptions_.push_back(ros_node_->create_subscription<geometry_msgs::msg::TwistStamped>(
      "/" + arm_ + "/cartesian_velocity/command", sensor_qos,
      [this](geometry_msgs::msg::TwistStamped::ConstSharedPtr message) {
        const auto& linear = message->twist.linear;
        const auto& angular = message->twist.angular;
        std::lock_guard<std::mutex> lock(mutex_);
        supervisor_->onDriverCommand(
            std::sqrt(linear.x * linear.x + linear.y * linear.y + linear.z * linear.z),
            std::sqrt(angular.x * angular.x + angular.y * angular.y + angular.z * angular.z),
            nowSec());
      }));
  subscriptions_.push_back(ros_node_->create_subscription<std_msgs::msg::Bool>(
      "/" + gripper_ + "/torque_reached", sensor_qos,
      [this](std_msgs::msg::Bool::ConstSharedPtr message) {
        std::lock_guard<std::mutex> lock(mutex_);
        torque_reached_ = message->data;
      }));
  subscriptions_.push_back(ros_node_->create_subscription<std_msgs::msg::Float64>(
      "/" + gripper_ + "/position", sensor_qos,
      [this](std_msgs::msg::Float64::ConstSharedPtr message) {
        std::lock_guard<std::mutex> lock(mutex_);
        supervisor_->onGripperReading(message->data, torque_reached_, nowSec());
        gripper_at_ = Clock::now();
        gripper_valid_ = true;
      }));

  activate_ = ros_node_->create_client<SetBool>("/policy/activate");
  deactivate_ = ros_node_->create_client<SetBool>("/policy/deactivate");
  bridge_estop_ = ros_node_->create_client<Trigger>("/policy/emergency_stop");
  router_estop_ = ros_node_->create_client<Trigger>("/policy_router/emergency_stop");
}

void PolicyRunNode::resetAttempt() {
  phase_ = Phase::kIdle;
  stop_needed_ = false;
  activate_call_.reset();
  stop_call_.reset();
  stop_step_ = 0;
  pending_ = Verdict();
  dry_run_logged_ = false;
  blackboard()->set<bool>(kPolicyArmedKey, false);
}

std::string PolicyRunNode::missingForStart(Clock::time_point now) const {
  std::vector<std::string> missing;
  const auto age = [&](Clock::time_point at) { return std::chrono::duration<double>(now - at).count(); };
  if (!activate_->service_is_ready()) missing.push_back("/policy/activate");
  if (!deactivate_->service_is_ready()) missing.push_back("/policy/deactivate");
  if (!bridge_estop_->service_is_ready()) missing.push_back("/policy/emergency_stop");
  if (!router_estop_->service_is_ready()) missing.push_back("/policy_router/emergency_stop");
  {
    std::lock_guard<std::mutex> lock(mutex_);
    for (const char* name : {"l", "m", "r"}) {
      const auto at = joints_at_.find(name);
      if (at == joints_at_.end() || age(at->second) > config_->joint_state_stale_sec) {
        missing.push_back(std::string(name) + " joint_states");
      }
    }
    if (!gripper_valid_ || age(gripper_at_) > config_->gripper_ready.position_stale_sec) {
      missing.push_back("/" + gripper_ + "/position");
    }
    if (!stats_valid_ || age(stats_at_) > config_->stats_stale_sec) {
      missing.push_back("/policy/stats");
    } else if (!stats_.mode_active) {
      missing.push_back("policy bridge is not in policy mode (mode_active=0)");
    } else if (stats_.paused) {
      missing.push_back("policy bridge is paused");
    }
  }
  std::string joined;
  for (const auto& item : missing) joined += (joined.empty() ? "" : ", ") + item;
  return joined;
}

void PolicyRunNode::openTrace() {
  if (!config_->trace.enabled) return;
  char envelope[160];
  std::snprintf(envelope, sizeof(envelope),
                "joint envelope lo=%.1f,%.1f,%.1f,%.1f,%.1f,%.1f hi=%.1f,%.1f,%.1f,%.1f,%.1f,%.1f deg; "
                "max joint speed %.0f deg/s; max attempt %.0f s",
                config_->joint_lo[0], config_->joint_lo[1], config_->joint_lo[2], config_->joint_lo[3],
                config_->joint_lo[4], config_->joint_lo[5], config_->joint_hi[0], config_->joint_hi[1],
                config_->joint_hi[2], config_->joint_hi[3], config_->joint_hi[4], config_->joint_hi[5],
                config_->max_joint_speed_dps, config_->max_attempt_sec);
  const std::vector<std::string> notes{
      "activation=" + config_->activation + " cycles=" + std::to_string(config_->cycles) +
          " attempts=" + std::to_string(config_->attempts),
      envelope};
  if (!trace_.open(config_->trace.dir, arm_, utcStamp(std::chrono::system_clock::now()), notes)) {
    recordPolicyEvent(blackboard(), "WARN", name(), "trace",
                      "could not write the attempt trace under " + config_->trace.dir);
  }
  trace_row_at_ = Clock::time_point{};
}

void PolicyRunNode::writeTraceRow(const char* phase, Clock::time_point now, bool force) {
  if (!trace_.isOpen()) return;
  if (!force && std::chrono::duration<double>(now - trace_row_at_).count() < config_->trace.period_sec) {
    return;
  }
  trace_row_at_ = now;
  SupervisorSnapshot snapshot;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    snapshot = supervisor_->snapshot(nowSec());
  }
  trace_.writeRow(phase, snapshot);
}

bt_core::NodeStatus PolicyRunNode::tick() {
  if (getInput<bool>("dry_run").value_or(true)) {
    if (!dry_run_logged_) {
      recordPolicyEvent(blackboard(), "INFO", name(), "dry_run",
                        "would activate the bridge and supervise the attempt: joint range, speed, "
                        "other arms, bridge health, timeout, stall, release over the bin");
      blackboard()->set<std::string>(kPolicyAttemptResultKey, "dry_run");
      dry_run_logged_ = true;
    }
    return bt_core::NodeStatus::SUCCESS;
  }

  initialize();
  const auto now = Clock::now();
  if (phase_ == Phase::kIdle) {
    phase_ = Phase::kPreflight;
    phase_started_ = now;
    stop_needed_ = false;
    {
      std::lock_guard<std::mutex> lock(mutex_);
      supervisor_->reset();
    }
    blackboard()->set<bool>(kPolicyArmedKey, false);
    openTrace();
  }
  switch (phase_) {
    case Phase::kPreflight:
      return tickPreflight(now);
    case Phase::kArming:
      return tickArming(now);
    case Phase::kRunning:
      return tickRunning(now);
    case Phase::kStopping:
      return tickStopping(now);
    case Phase::kIdle:
      break;
  }
  return bt_core::NodeStatus::RUNNING;
}

bt_core::NodeStatus PolicyRunNode::tickPreflight(Clock::time_point now) {
  const std::string missing = missingForStart(now);
  if (missing.empty()) {
    phase_ = Phase::kArming;
    phase_started_ = now;
    return tickArming(now);
  }
  if (std::chrono::duration<double>(now - phase_started_).count() > config_->service_wait_sec) {
    return failWithoutStopping("policy is not ready to start after " +
                               std::to_string(config_->service_wait_sec) + " s: " + missing);
  }
  return bt_core::NodeStatus::RUNNING;
}

bt_core::NodeStatus PolicyRunNode::tickArming(Clock::time_point now) {
  if (config_->activation == "operator") {
    bool allowed = false;
    {
      std::lock_guard<std::mutex> lock(mutex_);
      allowed = stats_valid_ && stats_.allow_publish;
    }
    if (!allowed) return bt_core::NodeStatus::RUNNING;  // waiting for a person; nothing moves
    stop_needed_ = true;
    arm(now);
    return bt_core::NodeStatus::RUNNING;
  }

  if (!activate_call_) {
    stop_needed_ = true;  // from here on the bridge may publish
    activate_call_ = sendSetBool(activate_, true);
    activate_sent_at_ = now;
    recordPolicyEvent(blackboard(), "INFO", name(), "activate", "asked /policy/activate to start the policy");
    return bt_core::NodeStatus::RUNNING;
  }
  if (activate_call_->done) {
    if (activate_call_->success) {
      arm(now);
      return bt_core::NodeStatus::RUNNING;
    }
    Verdict fault;
    fault.finished = true;
    fault.outcome = AttemptOutcome::kFault;
    fault.fault = true;
    fault.reason = "/policy/activate was refused: " + activate_call_->message;
    beginStopping(fault);
    return bt_core::NodeStatus::RUNNING;
  }
  if (std::chrono::duration<double>(now - activate_sent_at_).count() >
      config_->service_call_timeout_sec) {
    Verdict fault;
    fault.finished = true;
    fault.outcome = AttemptOutcome::kFault;
    fault.fault = true;
    fault.reason = "no reply from /policy/activate within " +
                   std::to_string(config_->service_call_timeout_sec) + " s";
    beginStopping(fault);
  }
  return bt_core::NodeStatus::RUNNING;
}

void PolicyRunNode::arm(Clock::time_point now) {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    supervisor_->start(nowSec());
  }
  phase_ = Phase::kRunning;
  phase_started_ = now;
  blackboard()->set<bool>(kPolicyArmedKey, true);
  writeTraceRow("running", now, true);
  recordPolicyEvent(blackboard(), "INFO", name(), "armed", "the policy is running; supervising the attempt");
}

bt_core::NodeStatus PolicyRunNode::tickRunning(Clock::time_point now) {
  Verdict verdict;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    verdict = supervisor_->evaluate(nowSec());
  }
  if (verdict.finished) {
    beginStopping(verdict);
  } else {
    writeTraceRow("running", now, false);
  }
  return bt_core::NodeStatus::RUNNING;
}

void PolicyRunNode::beginStopping(const Verdict& verdict) {
  pending_ = verdict;
  phase_ = Phase::kStopping;
  stop_step_ = 0;
  stop_call_.reset();
  writeTraceRow("stopping", Clock::now(), true);
  recordPolicyEvent(blackboard(), verdict.fault ? "ERROR" : "INFO", name(), "stopping",
                    std::string("attempt ended: ") + outcomeName(verdict.outcome) +
                        (verdict.reason.empty() ? "" : " (" + verdict.reason + ")"));
}

std::shared_ptr<PolicyRunNode::CallState> PolicyRunNode::sendSetBool(
    const rclcpp::Client<SetBool>::SharedPtr& client, bool data) {
  auto state = std::make_shared<CallState>();
  auto request = std::make_shared<SetBool::Request>();
  request->data = data;
  client->async_send_request(request, [state](rclcpp::Client<SetBool>::SharedFuture future) {
    const auto response = future.get();
    state->message = response->message;
    state->success = response->success;
    state->done = true;
  });
  return state;
}

std::shared_ptr<PolicyRunNode::CallState> PolicyRunNode::sendTrigger(
    const rclcpp::Client<Trigger>::SharedPtr& client) {
  auto state = std::make_shared<CallState>();
  client->async_send_request(std::make_shared<Trigger::Request>(),
                             [state](rclcpp::Client<Trigger>::SharedFuture future) {
                               const auto response = future.get();
                               state->message = response->message;
                               state->success = response->success;
                               state->done = true;
                             });
  return state;
}

bt_core::NodeStatus PolicyRunNode::tickStopping(Clock::time_point now) {
  writeTraceRow("stopping", now, false);
  // deactivate -> bridge emergency stop -> router emergency stop, each confirmed (or timed out)
  // before the next; then wait for the router to release the velocity session.
  while (stop_step_ < 3) {
    if (!stop_call_) {
      stop_sent_at_ = now;
      switch (stop_step_) {
        case 0:
          // data=true deactivates; data=false would ACTIVATE the bridge.
          stop_call_ = deactivate_->service_is_ready() ? sendSetBool(deactivate_, true) : nullptr;
          break;
        case 1:
          stop_call_ = bridge_estop_->service_is_ready() ? sendTrigger(bridge_estop_) : nullptr;
          break;
        default:
          stop_call_ = router_estop_->service_is_ready() ? sendTrigger(router_estop_) : nullptr;
          break;
      }
      if (!stop_call_) {
        recordPolicyEvent(blackboard(), "ERROR", name(), "stop",
                          "a stop service is not available (step " + std::to_string(stop_step_) + ")");
        ++stop_step_;
        continue;
      }
    }
    const bool timed_out = std::chrono::duration<double>(now - stop_sent_at_).count() >
                           config_->service_call_timeout_sec;
    if (stop_call_->done || timed_out) {
      if (!stop_call_->done) {
        recordPolicyEvent(blackboard(), "ERROR", name(), "stop",
                          "no reply to stop step " + std::to_string(stop_step_));
      }
      stop_call_.reset();
      ++stop_step_;
      if (stop_step_ == 3) release_started_ = now;
      continue;
    }
    return bt_core::NodeStatus::RUNNING;
  }
  if (std::chrono::duration<double>(now - release_started_).count() < config_->router_release_sec) {
    return bt_core::NodeStatus::RUNNING;
  }
  return finalize();
}

bt_core::NodeStatus PolicyRunNode::finalize() {
  const Verdict verdict = pending_;
  blackboard()->set<std::string>(kPolicyAttemptResultKey, outcomeName(verdict.outcome));
  blackboard()->set<std::string>(kPolicyGraspVerdictKey, verdict.grasp_verdict);
  blackboard()->set<double>(kPolicyAttemptSecKey, verdict.attempt_sec);
  trace_.close(outcomeName(verdict.outcome), verdict.grasp_verdict, verdict.attempt_sec, verdict.reason);
  recordPolicyEvent(blackboard(), verdict.fault ? "ERROR" : "INFO", name(), "attempt_end",
                    std::string("result=") + outcomeName(verdict.outcome) +
                        " grasp=" + (verdict.grasp_verdict.empty() ? "n/a" : verdict.grasp_verdict) +
                        " seconds=" + std::to_string(verdict.attempt_sec));
  resetAttempt();
  if (verdict.outcome == AttemptOutcome::kReleasedHeld) {
    setFailureReason("");
    return bt_core::NodeStatus::SUCCESS;
  }
  if (verdict.fault) {
    raisePolicyFault(blackboard(), verdict.reason);
  } else {
    recordPolicyFailureReason(blackboard(), verdict.reason);
  }
  setFailureReason(verdict.reason);
  return bt_core::NodeStatus::FAILURE;
}

bt_core::NodeStatus PolicyRunNode::failWithoutStopping(const std::string& reason) {
  // Nothing was started, so there is nothing to stop.
  pending_ = Verdict();
  pending_.finished = true;
  pending_.outcome = AttemptOutcome::kFault;
  pending_.fault = true;
  pending_.reason = reason;
  return finalize();
}

void PolicyRunNode::sendStopsWithoutWaiting() {
  if (deactivate_ && deactivate_->service_is_ready()) sendSetBool(deactivate_, true);
  if (bridge_estop_ && bridge_estop_->service_is_ready()) sendTrigger(bridge_estop_);
  if (router_estop_ && router_estop_->service_is_ready()) sendTrigger(router_estop_);
}

void PolicyRunNode::onHalted() {
  if (!supervisor_) return;  // never ran
  trace_.closeHalted();
  bool bridge_may_publish = stop_needed_;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    // A person may have activated the bridge a moment ago; never leave that running.
    if (phase_ == Phase::kArming && stats_valid_ && stats_.allow_publish) bridge_may_publish = true;
  }
  if (bridge_may_publish) {
    sendStopsWithoutWaiting();
    recordPolicyEvent(blackboard(), "WARN", name(), "halted",
                      "halted while the policy could be running; stop requests sent");
  }
  resetAttempt();
}

}  // namespace realman_bt
