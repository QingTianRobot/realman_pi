#include "realman_bt/move_j_node.hpp"

#include <cmath>
#include <sstream>
#include <stdexcept>


#include "realman_bt/realman_bt_executor_node.hpp"
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

}  // namespace

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

bt_core::NodeStatus MoveJNode::tick() {
  try {
    if (!initialize()) return bt_core::NodeStatus::FAILURE;
  } catch (const std::exception& error) {
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
    completed_ = true;
    return bt_core::NodeStatus::SUCCESS;
  }

  const auto now = std::chrono::steady_clock::now();
  if (std::chrono::duration<double>(now - started_at_).count() > timeout_sec_) {
    if (goal_handle_ && client_) {
      try { (void)client_->async_cancel_goal(goal_handle_); } catch (const std::exception&) {}
    }
    failed_ = true;
    RCLCPP_ERROR(ros_node_->get_logger(), "[%s] MoveJ timed out", name().c_str());
    return bt_core::NodeStatus::FAILURE;
  }
  if (!client_->wait_for_action_server(std::chrono::milliseconds(0))) {
    return bt_core::NodeStatus::RUNNING;
  }
  if (!sent_) {
    goal_future_ = client_->async_send_goal(goal_);
    sent_ = true;
    RCLCPP_INFO(ros_node_->get_logger(), "[%s] sent MoveJ goal to %s", name().c_str(), action_name_.c_str());
    return bt_core::NodeStatus::RUNNING;
  }
  if (!goal_handle_) {
    if (goal_future_.wait_for(std::chrono::milliseconds(0)) != std::future_status::ready) {
      return bt_core::NodeStatus::RUNNING;
    }
    goal_handle_ = goal_future_.get();
    if (!goal_handle_) {
      failed_ = true;
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] MoveJ goal rejected", name().c_str());
      return bt_core::NodeStatus::FAILURE;
    }
    try {
      result_future_ = client_->async_get_result(goal_handle_);
    } catch (const std::exception& error) {
      failed_ = true;
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot get MoveJ result: %s", name().c_str(), error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    return bt_core::NodeStatus::RUNNING;
  }
  if (result_future_.valid() && result_future_.wait_for(std::chrono::milliseconds(0)) == std::future_status::ready) {
    const auto wrapped = result_future_.get();
    completed_ = wrapped.code == rclcpp_action::ResultCode::SUCCEEDED && wrapped.result && wrapped.result->success;
    failed_ = !completed_;
    if (completed_) {
      RCLCPP_INFO(ros_node_->get_logger(), "[%s] MoveJ completed: %s", name().c_str(), wrapped.result->message.c_str());
      return bt_core::NodeStatus::SUCCESS;
    }
    RCLCPP_ERROR(ros_node_->get_logger(), "[%s] MoveJ failed", name().c_str());
    return bt_core::NodeStatus::FAILURE;
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
  dry_run_logged_ = false;
}

void MoveJNode::onHalted() {
  if (goal_handle_ && client_) {
    try { (void)client_->async_cancel_goal(goal_handle_); } catch (const std::exception&) {}
  }
  reset();
}

}  // namespace realman_bt
