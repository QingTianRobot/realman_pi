#include "realman_bt/move_j_node.hpp"

#include <cstdint>
#include <cmath>
#include <sstream>
#include <stdexcept>
#include <utility>

#include "realman_bt/realman_bt_executor_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
namespace realman_bt {
namespace {

std::array<double, 6> parseJoints(const std::string& text) {
  std::array<double, 6> result{};
  std::stringstream stream(text);
  std::string item;
  size_t index = 0;
  while (std::getline(stream, item, ',')) {
    if (index >= result.size() || item.empty()) {
      throw std::invalid_argument("joint_degrees must contain exactly six values");
    }
    result[index] = std::stod(item);
    if (!std::isfinite(result[index])) {
      throw std::invalid_argument("joint_degrees must contain finite values");
    }
    ++index;
  }
  if (index != result.size()) {
    throw std::invalid_argument("joint_degrees must contain exactly six values");
  }
  return result;
}

rclcpp::Node* getNode(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error("behavior tree ROS node handle is missing from blackboard");
  }
  return value.value();
}

RuntimeDiagnostics* getDiagnostics(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<RuntimeDiagnostics*>(
      kRuntimeDiagnosticsBlackboardKey);
  return value.value_or(nullptr);
}

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  const auto milliseconds =
      std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
  return static_cast<std::uint64_t>(milliseconds.count());
}

std::string actionResultCode(rclcpp_action::ResultCode code) {
  switch (code) {
    case rclcpp_action::ResultCode::SUCCEEDED:
      return "SUCCEEDED";
    case rclcpp_action::ResultCode::ABORTED:
      return "ABORTED";
    case rclcpp_action::ResultCode::CANCELED:
      return "CANCELED";
    case rclcpp_action::ResultCode::UNKNOWN:
      return "UNKNOWN";
  }
  return "UNKNOWN";
}

}  // namespace

MoveJCancellationDrain::MoveJCancellationDrain(
    Client::SharedPtr client, std::shared_future<GoalHandle::SharedPtr> goal_future,
    std::string action_name, RuntimeDiagnostics* diagnostics)
    : client_(std::move(client)), goal_future_(std::move(goal_future)),
      action_name_(std::move(action_name)), diagnostics_(diagnostics) {}

MoveJCancellationDrain::MoveJCancellationDrain(
    Client::SharedPtr client, GoalHandle::SharedPtr goal_handle,
    std::string action_name, RuntimeDiagnostics* diagnostics)
    : client_(std::move(client)), goal_handle_(std::move(goal_handle)),
      action_name_(std::move(action_name)), diagnostics_(diagnostics) {}

void MoveJCancellationDrain::recordEvent(const std::string& phase,
                                         const std::string& detail,
                                         const std::string& severity) const {
  if (!diagnostics_) return;
  diagnostics_->recordEvent({timestampMilliseconds(), severity, "ACTION", action_name_,
                             phase, detail});
}

bool MoveJCancellationDrain::drainOnce() {
  if (!client_) return true;
  if (!goal_handle_) {
    if (!goal_future_.valid()) return true;
    if (goal_future_.wait_for(std::chrono::milliseconds(0)) !=
        std::future_status::ready) {
      return false;
    }
    try {
      goal_handle_ = goal_future_.get();
    } catch (const std::exception& error) {
      recordEvent("goal_rejected", error.what(), "ERROR");
      return true;
    }
    if (!goal_handle_) {
      recordEvent("goal_rejected", "MoveJ goal rejected by action server", "ERROR");
      return true;
    }
    recordEvent("goal_accepted", "MoveJ goal accepted after halt", "WARN");
  }
  try {
    (void)client_->async_cancel_goal(goal_handle_);
    recordEvent("cancel", "cancel requested after halt", "WARN");
    return true;
  } catch (const std::exception& error) {
    recordEvent("cancel", error.what(), "ERROR");
    return false;
  }
}

bt_core::PortsList MoveJNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "RealMan arm namespace: l, m, or r"),
      bt_core::InputPort<bool>("dry_run", "true", "Validate without sending a motion goal"),
      bt_core::InputPort<std::string>("joint_degrees", "0,0,0,0,0,0", "Six joint angles in degrees"),
      bt_core::InputPort<int>("velocity_percent", "10", "MoveJ velocity ratio [1, 100]"),
      bt_core::InputPort<int>("blend_radius_percent", "0", "Blend radius ratio [0, 100]"),
      bt_core::InputPort<double>("timeout_sec", "30", "Action timeout in seconds"));
}

bool MoveJNode::readGoal(Action::Goal* goal) {
  if (goal == nullptr) return false;
  const std::string arm_id = getInput<std::string>("arm_id").value_or("");
  if (arm_id != "l" && arm_id != "m" && arm_id != "r") {
    throw std::invalid_argument("arm_id must be l, m, or r");
  }
  const auto joints = parseJoints(getInput<std::string>("joint_degrees").value_or(""));
  const int velocity = getInput<int>("velocity_percent").value_or(10);
  const int blend = getInput<int>("blend_radius_percent").value_or(0);
  timeout_sec_ = getInput<double>("timeout_sec").value_or(30.0);
  if (velocity < 1 || velocity > 100) {
    throw std::invalid_argument("velocity_percent must be in [1, 100]");
  }
  if (blend < 0 || blend > 100) {
    throw std::invalid_argument("blend_radius_percent must be in [0, 100]");
  }
  if (!std::isfinite(timeout_sec_) || timeout_sec_ <= 0.0) {
    throw std::invalid_argument("timeout_sec must be positive");
  }

  goal->command = Action::Goal::MOVEJ;
  goal->reference_type = Action::Goal::BASE;
  goal->reference_name = "base";
  goal->joint_degrees = joints;
  goal->velocity_percent = static_cast<uint32_t>(velocity);
  goal->blend_radius_percent = static_cast<uint32_t>(blend);
  goal->connect = false;
  goal->timeout_sec = static_cast<float>(timeout_sec_);
  action_name_ = "/" + arm_id + "/execute_motion";
  return true;
}

bool MoveJNode::initialize() {
  if (initialized_) return true;
  ros_node_ = getNode(blackboard());
  if (!readGoal(&goal_)) return false;
  dry_run_ = getInput<bool>("dry_run").value_or(true);
  initialized_ = true;
  started_at_ = std::chrono::steady_clock::now();
  if (dry_run_) return true;
  client_ = rclcpp_action::create_client<Action>(
      ros_node_->get_node_base_interface(), ros_node_->get_node_graph_interface(),
      ros_node_->get_node_logging_interface(), ros_node_->get_node_waitables_interface(),
      action_name_);
  return true;
}

void MoveJNode::recordActionEvent(const std::string& phase,
                                  const std::string& detail,
                                  const std::string& severity) const {
  RuntimeDiagnostics* diagnostics = getDiagnostics(blackboard());
  if (!diagnostics) return;
  diagnostics->recordEvent({timestampMilliseconds(), severity, "ACTION", action_name_,
                            phase, detail});
}

bool MoveJNode::handoffPendingGoalResponse() {
  const auto sink = blackboard()->get<MoveJCancellationDrainSink>(
      kMoveJCancellationDrainSinkBlackboardKey);
  if (!sink.has_value() || !sink.value()) return false;
  sink.value()(std::make_shared<MoveJCancellationDrain>(
      std::move(client_), std::move(goal_future_), action_name_,
      getDiagnostics(blackboard())));
  return true;
}

bool MoveJNode::handoffInFlightGoal() {
  const auto sink = blackboard()->get<MoveJCancellationDrainSink>(
      kMoveJCancellationDrainSinkBlackboardKey);
  if (!sink.has_value() || !sink.value()) return false;
  sink.value()(std::make_shared<MoveJCancellationDrain>(
      std::move(client_), std::move(goal_handle_), action_name_,
      getDiagnostics(blackboard())));
  return true;
}

bool MoveJNode::hasInFlightGoal() const {
  return goal_handle_ && client_ && result_future_.valid() && !completed_ &&
         !failed_ && !cancel_requested_ &&
         result_future_.wait_for(std::chrono::milliseconds(0)) !=
             std::future_status::ready;
}

void MoveJNode::requestCancel(const std::string& detail) {
  if (cancel_requested_) return;
  if (!goal_handle_ || !client_) return;
  if (result_future_.valid() &&
      result_future_.wait_for(std::chrono::milliseconds(0)) ==
          std::future_status::ready) {
    return;
  }
  try {
    (void)client_->async_cancel_goal(goal_handle_);
    cancel_requested_ = true;
    timeout_state_ = TimeoutState::kCancelPending;
    recordActionEvent("cancel", detail, "WARN");
  } catch (const std::exception& error) {
    recordActionEvent("cancel", error.what(), "ERROR");
  }
}

bt_core::NodeStatus MoveJNode::tick() {
  try {
    if (!initialize()) return bt_core::NodeStatus::FAILURE;
  } catch (const std::exception& error) {
    setFailureReason(error.what());
    if (ros_node_) RCLCPP_ERROR(ros_node_->get_logger(), "[%s] invalid MoveJ goal: %s", name().c_str(), error.what());
    return bt_core::NodeStatus::FAILURE;
  }
  if (completed_) return bt_core::NodeStatus::SUCCESS;
  if (failed_) return bt_core::NodeStatus::FAILURE;
  if (dry_run_) {
    if (!dry_run_logged_) {
      RCLCPP_INFO(ros_node_->get_logger(), "[%s] dry-run validated MoveJ for %s; no goal sent", name().c_str(), action_name_.c_str());
      dry_run_logged_ = true;
    }
    recordActionEvent("result", "dry-run validation completed; no goal sent");
    completed_ = true;
    return bt_core::NodeStatus::SUCCESS;
  }

  const auto now = std::chrono::steady_clock::now();
  const bool deadline_expired =
      std::chrono::duration<double>(now - started_at_).count() > timeout_sec_;

  if (sent_ && !goal_handle_ &&
      goal_future_.wait_for(std::chrono::milliseconds(0)) == std::future_status::ready) {
    try {
      goal_handle_ = goal_future_.get();
    } catch (const std::exception& error) {
      failed_ = true;
      setFailureReason(error.what());
      recordActionEvent("goal_rejected", failureReason(), "ERROR");
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot receive MoveJ goal response: %s",
                   name().c_str(), failureReason().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    if (!goal_handle_) {
      failed_ = true;
      setFailureReason("MoveJ goal rejected by action server");
      recordActionEvent("goal_rejected", failureReason(), "ERROR");
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] %s", name().c_str(),
                   failureReason().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    recordActionEvent("goal_accepted", "MoveJ goal accepted");
    try {
      result_future_ = client_->async_get_result(goal_handle_);
    } catch (const std::exception& error) {
      failed_ = true;
      setFailureReason(error.what());
      recordActionEvent("result", failureReason(), "ERROR");
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot get MoveJ result: %s",
                   name().c_str(), error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    if (timeout_state_ == TimeoutState::kAwaitingGoalResponse) {
      timeout_state_ = TimeoutState::kCancellationRetry;
    }
    if (timeout_state_ == TimeoutState::kCancellationRetry && hasInFlightGoal()) {
      requestCancel("cancel requested after delayed goal acceptance");
      return bt_core::NodeStatus::RUNNING;
    }
  }

  if (goal_handle_ && result_future_.valid() &&
      result_future_.wait_for(std::chrono::milliseconds(0)) == std::future_status::ready) {
    Client::WrappedResult wrapped;
    try {
      wrapped = result_future_.get();
    } catch (const std::exception& error) {
      failed_ = true;
      setFailureReason(error.what());
      recordActionEvent("result", failureReason(), "ERROR");
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot receive MoveJ result: %s",
                   name().c_str(), failureReason().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    const std::string result_detail =
        (wrapped.result && !wrapped.result->message.empty())
            ? wrapped.result->message
            : actionResultCode(wrapped.code);
    recordActionEvent("result", result_detail,
                      wrapped.code == rclcpp_action::ResultCode::SUCCEEDED &&
                              wrapped.result && wrapped.result->success &&
                              timeout_state_ == TimeoutState::kActive
                          ? "INFO"
                          : "ERROR");
    completed_ = timeout_state_ == TimeoutState::kActive &&
                 wrapped.code == rclcpp_action::ResultCode::SUCCEEDED &&
                 wrapped.result && wrapped.result->success;
    failed_ = !completed_;
    if (completed_) {
      RCLCPP_INFO(ros_node_->get_logger(), "[%s] MoveJ completed: %s",
                  name().c_str(), wrapped.result->message.c_str());
      return bt_core::NodeStatus::SUCCESS;
    }
    if (failureReason().empty()) {
      setFailureReason((wrapped.result && !wrapped.result->message.empty())
                           ? wrapped.result->message
                           : "MoveJ action " + actionResultCode(wrapped.code));
    }
    RCLCPP_ERROR(ros_node_->get_logger(), "[%s] MoveJ failed: %s", name().c_str(),
                 failureReason().c_str());
    return bt_core::NodeStatus::FAILURE;
  }

  if (deadline_expired && timeout_state_ == TimeoutState::kActive) {
    recordActionEvent("timeout", "MoveJ action timed out", "ERROR");
    setFailureReason("MoveJ timed out after " + std::to_string(timeout_sec_) +
                     " seconds");
    if (!sent_) {
      failed_ = true;
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] %s", name().c_str(),
                   failureReason().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    if (!goal_handle_) {
      timeout_state_ = TimeoutState::kAwaitingGoalResponse;
      return bt_core::NodeStatus::RUNNING;
    }
    timeout_state_ = TimeoutState::kCancellationRetry;
    requestCancel("cancel requested after timeout");
    return bt_core::NodeStatus::RUNNING;
  }

  if (timeout_state_ == TimeoutState::kAwaitingGoalResponse) {
    return bt_core::NodeStatus::RUNNING;
  }
  if (timeout_state_ == TimeoutState::kCancellationRetry) {
    if (hasInFlightGoal()) requestCancel("retrying MoveJ cancellation after timeout");
    return bt_core::NodeStatus::RUNNING;
  }
  if (timeout_state_ == TimeoutState::kCancelPending) return bt_core::NodeStatus::RUNNING;

  if (!client_->wait_for_action_server(std::chrono::milliseconds(0))) {
    if (!wait_server_recorded_) {
      recordActionEvent("wait_server", "waiting for action server");
      wait_server_recorded_ = true;
    }
    return bt_core::NodeStatus::RUNNING;
  }
  if (!sent_) {
    try {
      goal_future_ = client_->async_send_goal(goal_);
    } catch (const std::exception& error) {
      failed_ = true;
      setFailureReason(error.what());
      recordActionEvent("send_goal", failureReason(), "ERROR");
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot send MoveJ goal: %s",
                   name().c_str(), failureReason().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    sent_ = true;
    recordActionEvent("send_goal", "MoveJ goal sent");
    RCLCPP_INFO(ros_node_->get_logger(), "[%s] sent MoveJ goal to %s", name().c_str(), action_name_.c_str());
    return bt_core::NodeStatus::RUNNING;
  }
  return bt_core::NodeStatus::RUNNING;
}

void MoveJNode::reset() {
  goal_future_ = {};
  result_future_ = {};
  goal_handle_.reset();
  client_.reset();
  ros_node_ = nullptr;
  initialized_ = false;
  sent_ = false;
  completed_ = false;
  failed_ = false;
  setFailureReason("");
  dry_run_logged_ = false;
  wait_server_recorded_ = false;
  cancel_requested_ = false;
  timeout_state_ = TimeoutState::kActive;
}

void MoveJNode::onHalted() {
  if (sent_ && !goal_handle_ && goal_future_.valid()) {
    if (handoffPendingGoalResponse()) {
      reset();
      return;
    }
    RCLCPP_ERROR(ros_node_->get_logger(),
                 "[%s] cannot hand off pending MoveJ goal response during halt",
                 name().c_str());
    return;
  }
  if (hasInFlightGoal()) {
    if (handoffInFlightGoal()) {
      reset();
      return;
    }
    RCLCPP_ERROR(ros_node_->get_logger(),
                 "[%s] cannot hand off in-flight MoveJ goal during halt",
                 name().c_str());
    return;
  }
  reset();
}

}  // namespace realman_bt
