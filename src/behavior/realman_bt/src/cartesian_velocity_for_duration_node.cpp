#include "realman_bt/cartesian_velocity_for_duration_node.hpp"

#include <cmath>
#include <sstream>
#include <stdexcept>
#include <utility>

namespace realman_bt {
namespace {

std::vector<std::string> split(const std::string& text, char delimiter) {
  std::vector<std::string> parts;
  std::stringstream stream(text);
  std::string part;
  while (std::getline(stream, part, delimiter)) parts.push_back(part);
  return parts;
}

std::array<double, 3> parseVector(const std::string& text,
                                  const std::string& field) {
  const auto parts = split(text, ',');
  if (parts.size() != 3) {
    throw std::invalid_argument(field + " must contain exactly three values");
  }
  std::array<double, 3> values{};
  for (std::size_t index = 0; index < values.size(); ++index) {
    if (parts[index].empty()) {
      throw std::invalid_argument(field + " must contain exactly three values");
    }
    std::size_t consumed = 0;
    values[index] = std::stod(parts[index], &consumed);
    if (consumed != parts[index].size() || !std::isfinite(values[index])) {
      throw std::invalid_argument(field + " must contain finite numbers");
    }
  }
  return values;
}

double norm(const std::array<double, 3>& value) {
  return std::sqrt(value[0] * value[0] + value[1] * value[1] +
                   value[2] * value[2]);
}

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  return static_cast<std::uint64_t>(
      std::chrono::duration_cast<std::chrono::milliseconds>(
          now.time_since_epoch()).count());
}

RuntimeDiagnostics* diagnostics(const bt_core::Blackboard::Ptr& blackboard) {
  return blackboard->get<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey)
      .value_or(nullptr);
}

rclcpp::Node* rosNode(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error(
        "behavior tree ROS node handle is missing from blackboard");
  }
  return value.value();
}

std::string resultCode(rclcpp_action::ResultCode code) {
  switch (code) {
    case rclcpp_action::ResultCode::SUCCEEDED: return "SUCCEEDED";
    case rclcpp_action::ResultCode::ABORTED: return "ABORTED";
    case rclcpp_action::ResultCode::CANCELED: return "CANCELED";
    case rclcpp_action::ResultCode::UNKNOWN: return "UNKNOWN";
  }
  return "UNKNOWN";
}

std::string registryKey(const std::string& arm_id,
                        const std::string& reference) {
  return arm_id + "|" + reference;
}

}  // namespace

CoordinateReferenceRegistry::CoordinateReferenceRegistry(
    const std::vector<std::string>& entries) {
  for (const auto& entry : entries) {
    const auto fields = split(entry, '|');
    if (fields.size() != 5 || fields[0].empty() || fields[1].empty() ||
        fields[3].empty() || fields[4].empty()) {
      throw std::invalid_argument("invalid coordinate reference registry entry: " + entry);
    }
    const int type = std::stoi(fields[2]);
    if (type < 0 || type > 2) {
      throw std::invalid_argument("coordinate reference type must be BASE, WORK, or TOOL");
    }
    const auto key = registryKey(fields[0], fields[1]);
    if (!entries_.emplace(key, CoordinateReference{
            static_cast<std::uint8_t>(type), fields[3], fields[4]}).second) {
      throw std::invalid_argument("duplicate coordinate reference: " + key);
    }
  }
}

const CoordinateReference& CoordinateReferenceRegistry::resolve(
    const std::string& arm_id, const std::string& reference) const {
  const auto key = registryKey(arm_id, reference);
  const auto found = entries_.find(key);
  if (found == entries_.end()) {
    throw std::invalid_argument("unknown coordinate reference '" + reference +
                                "' for arm " + arm_id);
  }
  return found->second;
}

CartesianVelocityProfileRegistry::CartesianVelocityProfileRegistry(
    const std::vector<std::string>& entries) {
  for (const auto& entry : entries) {
    const auto fields = split(entry, '|');
    if (fields.size() != 9 || fields[0].empty()) {
      throw std::invalid_argument("invalid Cartesian velocity profile entry: " + entry);
    }
    CartesianVelocityProfile profile;
    profile.control_period_ms = static_cast<std::uint32_t>(std::stoul(fields[1]));
    profile.watchdog_ms = static_cast<std::uint32_t>(std::stoul(fields[2]));
    profile.max_linear_speed_mps = std::stod(fields[3]);
    profile.max_angular_speed_radps = std::stod(fields[4]);
    profile.max_linear_accel_mps2 = std::stod(fields[5]);
    profile.max_angular_accel_radps2 = std::stod(fields[6]);
    profile.goal_timeout_sec = std::stod(fields[7]);
    profile.stop_timeout_sec = std::stod(fields[8]);
    if (profile.control_period_ms == 0 || profile.watchdog_ms == 0 ||
        !std::isfinite(profile.max_linear_speed_mps) ||
        !std::isfinite(profile.max_angular_speed_radps) ||
        !std::isfinite(profile.max_linear_accel_mps2) ||
        !std::isfinite(profile.max_angular_accel_radps2) ||
        !std::isfinite(profile.goal_timeout_sec) ||
        !std::isfinite(profile.stop_timeout_sec) ||
        profile.max_linear_speed_mps <= 0.0 ||
        profile.max_angular_speed_radps <= 0.0 ||
        profile.max_linear_accel_mps2 <= 0.0 ||
        profile.max_angular_accel_radps2 <= 0.0 ||
        profile.goal_timeout_sec <= 0.0 || profile.stop_timeout_sec <= 0.0) {
      throw std::invalid_argument("Cartesian velocity profile values must be positive");
    }
    if (!entries_.emplace(fields[0], profile).second) {
      throw std::invalid_argument("duplicate Cartesian velocity profile: " + fields[0]);
    }
  }
}

const CartesianVelocityProfile& CartesianVelocityProfileRegistry::resolve(
    const std::string& arm_id) const {
  const auto found = entries_.find(arm_id);
  if (found == entries_.end()) {
    throw std::invalid_argument("missing Cartesian velocity profile for arm " + arm_id);
  }
  return found->second;
}

CartesianVelocityCancellationDrain::CartesianVelocityCancellationDrain(
    Client::SharedPtr client,
    std::shared_future<GoalHandle::SharedPtr> goal_future,
    std::string action_name, RuntimeDiagnostics* diagnostics)
    : client_(std::move(client)), goal_future_(std::move(goal_future)),
      action_name_(std::move(action_name)), diagnostics_(diagnostics) {}

CartesianVelocityCancellationDrain::CartesianVelocityCancellationDrain(
    Client::SharedPtr client, GoalHandle::SharedPtr goal_handle,
    std::string action_name, RuntimeDiagnostics* diagnostics)
    : client_(std::move(client)), goal_handle_(std::move(goal_handle)),
      action_name_(std::move(action_name)), diagnostics_(diagnostics) {}

void CartesianVelocityCancellationDrain::recordEvent(
    const std::string& phase, const std::string& detail,
    const std::string& severity) const {
  if (!diagnostics_) return;
  diagnostics_->recordEvent({timestampMilliseconds(), severity, "ACTION",
                             action_name_, phase, detail});
}

bool CartesianVelocityCancellationDrain::drainOnce() {
  if (!client_) return true;
  if (!goal_handle_) {
    if (!goal_future_.valid()) return true;
    if (goal_future_.wait_for(std::chrono::milliseconds(0)) !=
        std::future_status::ready) return false;
    try {
      goal_handle_ = goal_future_.get();
    } catch (const std::exception& error) {
      recordEvent("goal_rejected", error.what(), "ERROR");
      return true;
    }
    if (!goal_handle_) {
      recordEvent("goal_rejected", "Cartesian velocity goal rejected", "ERROR");
      return true;
    }
    recordEvent("goal_accepted", "Cartesian velocity goal accepted after halt",
                "WARN");
  }
  try {
    (void)client_->async_cancel_goal(goal_handle_);
    recordEvent("cancel", "Cartesian velocity cancellation submitted after halt",
                "WARN");
    return true;
  } catch (const std::exception& error) {
    recordEvent("cancel", error.what(), "ERROR");
    return false;
  }
}

bt_core::PortsList CartesianVelocityForDurationNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "Arm namespace: l, m, or r"),
      bt_core::InputPort<bool>("dry_run", "true", "Validate without sending commands"),
      bt_core::InputPort<std::string>("reference", "base", "Logical coordinate reference"),
      bt_core::InputPort<std::string>("linear_velocity_mps", "0,0,0", "Tool/work/base XYZ velocity in m/s"),
      bt_core::InputPort<std::string>("angular_velocity_radps", "0,0,0", "Tool/work/base XYZ angular velocity in rad/s"),
      bt_core::InputPort<double>("duration_sec", "0.5", "Positive command duration in seconds"));
}

void CartesianVelocityForDurationNode::readCommand() {
  const auto arm_id = getInput<std::string>("arm_id").value_or("");
  if (arm_id != "l" && arm_id != "m" && arm_id != "r") {
    throw std::invalid_argument("arm_id must be l, m, or r");
  }
  const auto logical_reference = getInput<std::string>("reference").value_or("");
  if (logical_reference.empty()) {
    throw std::invalid_argument("reference must be set");
  }
  const auto reference_registry = blackboard()->get<CoordinateReferenceRegistry*>(
      kCoordinateReferenceRegistryBlackboardKey).value_or(nullptr);
  const auto profile_registry = blackboard()->get<CartesianVelocityProfileRegistry*>(
      kCartesianVelocityProfileRegistryBlackboardKey).value_or(nullptr);
  if (!reference_registry || !profile_registry) {
    throw std::runtime_error("coordinate reference registries are missing from blackboard");
  }
  reference_ = &reference_registry->resolve(arm_id, logical_reference);
  profile_ = &profile_registry->resolve(arm_id);

  const auto linear = parseVector(
      getInput<std::string>("linear_velocity_mps").value_or(""),
      "linear_velocity_mps");
  const auto angular = parseVector(
      getInput<std::string>("angular_velocity_radps").value_or(""),
      "angular_velocity_radps");
  duration_sec_ = getInput<double>("duration_sec").value_or(0.5);
  if (!std::isfinite(duration_sec_) || duration_sec_ <= 0.0) {
    throw std::invalid_argument("duration_sec must be positive");
  }
  if (norm(linear) > profile_->max_linear_speed_mps + 1.0e-12) {
    throw std::invalid_argument("linear velocity exceeds configured limit");
  }
  if (norm(angular) > profile_->max_angular_speed_radps + 1.0e-12) {
    throw std::invalid_argument("angular velocity exceeds configured limit");
  }
  if (norm(linear) == 0.0 && norm(angular) == 0.0) {
    throw std::invalid_argument("at least one velocity component must be non-zero");
  }

  goal_.reference_type = reference_->type;
  goal_.reference_name = reference_->controller_name;
  goal_.control_period_ms = profile_->control_period_ms;
  goal_.watchdog_ms = profile_->watchdog_ms;
  goal_.max_linear_accel_mps2 = profile_->max_linear_accel_mps2;
  goal_.max_angular_accel_radps2 = profile_->max_angular_accel_radps2;
  goal_.follow = true;
  goal_.trajectory_mode = 0;
  goal_.radio = 0;

  command_.header.frame_id = reference_->ros_frame_id;
  command_.twist.linear.x = linear[0];
  command_.twist.linear.y = linear[1];
  command_.twist.linear.z = linear[2];
  command_.twist.angular.x = angular[0];
  command_.twist.angular.y = angular[1];
  command_.twist.angular.z = angular[2];
  action_name_ = "/" + arm_id + "/cartesian_velocity";
  command_topic_ = action_name_ + "/command";
}

bool CartesianVelocityForDurationNode::initialize() {
  if (initialized_) return true;
  ros_node_ = rosNode(blackboard());
  readCommand();
  dry_run_ = getInput<bool>("dry_run").value_or(true);
  initialized_at_ = std::chrono::steady_clock::now();
  initialized_ = true;
  if (dry_run_) return true;
  client_ = rclcpp_action::create_client<Action>(
      ros_node_->get_node_base_interface(), ros_node_->get_node_graph_interface(),
      ros_node_->get_node_logging_interface(), ros_node_->get_node_waitables_interface(),
      action_name_);
  auto command_qos = rclcpp::QoS(rclcpp::KeepLast(1));
  command_qos.durability_volatile();
  command_qos.lifespan(rclcpp::Duration::from_nanoseconds(
      static_cast<std::int64_t>(profile_->watchdog_ms) * 1000000));
  publisher_ = ros_node_->create_publisher<geometry_msgs::msg::TwistStamped>(
      command_topic_, command_qos);
  return true;
}

void CartesianVelocityForDurationNode::recordEvent(
    const std::string& phase, const std::string& detail,
    const std::string& severity) const {
  auto* sink = diagnostics(blackboard());
  if (!sink) return;
  sink->recordEvent({timestampMilliseconds(), severity, "ACTION", action_name_,
                     phase, detail});
}

void CartesianVelocityForDurationNode::publishCommand(bool zero) {
  if (!publisher_ || !ros_node_) return;
  auto message = command_;
  message.header.stamp = ros_node_->get_clock()->now();
  if (zero) message.twist = geometry_msgs::msg::Twist{};
  publisher_->publish(message);
}

void CartesianVelocityForDurationNode::startCommandTimer() {
  motion_started_at_ = std::chrono::steady_clock::now();
  duration_elapsed_ = false;
  publishCommand(false);
  command_timer_ = ros_node_->create_wall_timer(
      std::chrono::milliseconds(profile_->control_period_ms), [this]() {
        if (duration_elapsed_) return;
        if (std::chrono::duration<double>(std::chrono::steady_clock::now() -
                                          motion_started_at_).count() >= duration_sec_) {
          publishCommand(true);
          duration_elapsed_ = true;
          if (command_timer_) command_timer_->cancel();
          return;
        }
        publishCommand(false);
      });
}

void CartesianVelocityForDurationNode::requestCancel(const std::string& detail) {
  if (cancel_requested_ || !client_ || !goal_handle_) return;
  try {
    (void)client_->async_cancel_goal(goal_handle_);
    cancel_requested_ = true;
    recordEvent("cancel", detail, "WARN");
  } catch (const std::exception& error) {
    recordEvent("cancel", error.what(), "ERROR");
  }
}

bool CartesianVelocityForDurationNode::hasInFlightGoal() const {
  if (!client_ || !goal_handle_ || completed_) return false;
  if (!result_future_.valid()) return true;
  return result_future_.wait_for(std::chrono::milliseconds(0)) !=
         std::future_status::ready;
}

bool CartesianVelocityForDurationNode::handoffPendingGoalResponse() {
  const auto sink = blackboard()->get<CartesianVelocityCancellationDrainSink>(
      kCartesianVelocityCancellationDrainSinkBlackboardKey);
  if (!sink.has_value() || !sink.value()) return false;
  sink.value()(std::make_shared<CartesianVelocityCancellationDrain>(
      std::move(client_), std::move(goal_future_), action_name_,
      diagnostics(blackboard())));
  return true;
}

bool CartesianVelocityForDurationNode::handoffInFlightGoal() {
  const auto sink = blackboard()->get<CartesianVelocityCancellationDrainSink>(
      kCartesianVelocityCancellationDrainSinkBlackboardKey);
  if (!sink.has_value() || !sink.value()) return false;
  sink.value()(std::make_shared<CartesianVelocityCancellationDrain>(
      std::move(client_), std::move(goal_handle_), action_name_,
      diagnostics(blackboard())));
  return true;
}

void CartesianVelocityForDurationNode::fail(const std::string& detail) {
  failed_ = true;
  setFailureReason(detail);
  recordEvent("result", detail, "ERROR");
}

bt_core::NodeStatus CartesianVelocityForDurationNode::tick() {
  try {
    if (!initialize()) return bt_core::NodeStatus::FAILURE;
  } catch (const std::exception& error) {
    fail(error.what());
    return bt_core::NodeStatus::FAILURE;
  }
  if (completed_) return bt_core::NodeStatus::SUCCESS;
  if (failed_) return bt_core::NodeStatus::FAILURE;
  if (dry_run_) {
    recordEvent("result", "dry-run validation completed; no goal or command sent");
    completed_ = true;
    return bt_core::NodeStatus::SUCCESS;
  }

  if (sent_ && !goal_handle_ && goal_future_.valid() &&
      goal_future_.wait_for(std::chrono::milliseconds(0)) ==
          std::future_status::ready) {
    try {
      goal_handle_ = goal_future_.get();
    } catch (const std::exception& error) {
      fail(error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    if (!goal_handle_) {
      fail("Cartesian velocity goal rejected by action server");
      return bt_core::NodeStatus::FAILURE;
    }
    recordEvent("goal_accepted", "Cartesian velocity goal accepted");
    try {
      result_future_ = client_->async_get_result(goal_handle_);
    } catch (const std::exception& error) {
      fail(error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    if (goal_response_timed_out_) {
      requestCancel("cancel requested after delayed goal acceptance");
      return bt_core::NodeStatus::RUNNING;
    }
    startCommandTimer();
  }

  if (goal_handle_ && result_future_.valid() &&
      result_future_.wait_for(std::chrono::milliseconds(0)) ==
          std::future_status::ready) {
    Client::WrappedResult wrapped;
    try {
      wrapped = result_future_.get();
    } catch (const std::exception& error) {
      fail(error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    const std::string detail = wrapped.result && !wrapped.result->message.empty()
                                   ? wrapped.result->message
                                   : resultCode(wrapped.code);
    if (goal_response_timed_out_ && cancel_requested_ &&
        wrapped.code == rclcpp_action::ResultCode::CANCELED && wrapped.result &&
        wrapped.result->terminal_state == Action::Result::CANCELED) {
      recordEvent("result", detail, "WARN");
      failed_ = true;
      return bt_core::NodeStatus::FAILURE;
    }
    if (cancel_requested_ && duration_elapsed_ &&
        wrapped.code == rclcpp_action::ResultCode::CANCELED && wrapped.result &&
        wrapped.result->terminal_state == Action::Result::CANCELED) {
      recordEvent("result", detail);
      completed_ = true;
      if (command_timer_) command_timer_->cancel();
      return bt_core::NodeStatus::SUCCESS;
    }
    fail(detail);
    return bt_core::NodeStatus::FAILURE;
  }

  if (duration_elapsed_) {
    requestCancel("duration elapsed; zero velocity published");
    if (cancel_requested_ &&
        std::chrono::duration<double>(std::chrono::steady_clock::now() -
                                      motion_started_at_).count() >
            duration_sec_ + profile_->stop_timeout_sec) {
      fail("Cartesian velocity session did not stop before timeout");
      return bt_core::NodeStatus::FAILURE;
    }
    return bt_core::NodeStatus::RUNNING;
  }

  if (!goal_handle_ && !goal_response_timed_out_ &&
      std::chrono::duration<double>(std::chrono::steady_clock::now() -
                                    initialized_at_).count() >
          profile_->goal_timeout_sec) {
    const std::string detail = "Cartesian velocity goal response timed out";
    recordEvent("timeout", detail, "ERROR");
    setFailureReason(detail);
    if (!sent_) {
      failed_ = true;
      return bt_core::NodeStatus::FAILURE;
    }
    goal_response_timed_out_ = true;
    return bt_core::NodeStatus::RUNNING;
  }

  if (goal_response_timed_out_) {
    if (goal_handle_ && !cancel_requested_) {
      requestCancel("retrying cancellation after delayed goal acceptance");
    }
    return bt_core::NodeStatus::RUNNING;
  }

  if (!client_->wait_for_action_server(std::chrono::milliseconds(0))) {
    if (!wait_server_recorded_) {
      recordEvent("wait_server", "waiting for action server");
      wait_server_recorded_ = true;
    }
    return bt_core::NodeStatus::RUNNING;
  }
  if (!sent_) {
    try {
      goal_future_ = client_->async_send_goal(goal_);
      sent_ = true;
      recordEvent("send_goal", "Cartesian velocity goal sent");
    } catch (const std::exception& error) {
      fail(error.what());
      return bt_core::NodeStatus::FAILURE;
    }
  }
  return bt_core::NodeStatus::RUNNING;
}

void CartesianVelocityForDurationNode::reset() {
  if (command_timer_) command_timer_->cancel();
  command_timer_.reset();
  publisher_.reset();
  result_future_ = {};
  goal_future_ = {};
  goal_handle_.reset();
  client_.reset();
  ros_node_ = nullptr;
  reference_ = nullptr;
  profile_ = nullptr;
  initialized_ = false;
  sent_ = false;
  cancel_requested_ = false;
  completed_ = false;
  failed_ = false;
  wait_server_recorded_ = false;
  goal_response_timed_out_ = false;
  duration_elapsed_ = false;
  setFailureReason("");
}

void CartesianVelocityForDurationNode::onHalted() {
  if (command_timer_) command_timer_->cancel();
  if (goal_handle_ && !duration_elapsed_) publishCommand(true);
  if (sent_ && !goal_handle_ && goal_future_.valid()) {
    if (handoffPendingGoalResponse()) reset();
    return;
  }
  if (hasInFlightGoal() && !cancel_requested_) {
    if (handoffInFlightGoal()) reset();
    return;
  }
  reset();
}

}  // namespace realman_bt
