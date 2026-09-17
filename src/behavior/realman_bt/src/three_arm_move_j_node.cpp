#include "realman_bt/three_arm_move_j_node.hpp"

#include <cmath>
#include <sstream>
#include <stdexcept>

#include "realman_bt/runtime_snapshot.hpp"

namespace realman_bt {
namespace {

std::array<double, 6> parseJoints(const std::string& text) {
  std::array<double, 6> result{};
  std::stringstream stream(text);
  std::string item;
  std::size_t index = 0;
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

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(
      now.time_since_epoch()).count());
}

RuntimeDiagnostics* diagnostics(const bt_core::Blackboard::Ptr& blackboard) {
  return blackboard->get<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey)
      .value_or(nullptr);
}

rclcpp::Node* rosNode(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error("behavior tree ROS node handle is missing from blackboard");
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

}  // namespace

bt_core::PortsList ThreeArmMoveJNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<bool>("dry_run", "true", "Validate without sending motion goals"),
      bt_core::InputPort<std::string>("l_joint_degrees", "0,0,0,0,0,0", "L arm joint angles in degrees"),
      bt_core::InputPort<std::string>("m_joint_degrees", "0,0,0,0,0,0", "M arm joint angles in degrees"),
      bt_core::InputPort<std::string>("r_joint_degrees", "0,0,0,0,0,0", "R arm joint angles in degrees"),
      bt_core::InputPort<int>("velocity_percent", "10", "MoveJ velocity ratio [1, 100]"),
      bt_core::InputPort<int>("blend_radius_percent", "0", "Blend radius ratio [0, 100]"),
      bt_core::InputPort<double>("timeout_sec", "120", "Timeout in seconds"));
}

bool ThreeArmMoveJNode::readGoals() {
  const std::array<const char*, 3> ports{{"l_joint_degrees", "m_joint_degrees", "r_joint_degrees"}};
  const int velocity = getInput<int>("velocity_percent").value_or(10);
  const int blend = getInput<int>("blend_radius_percent").value_or(0);
  timeout_sec_ = getInput<double>("timeout_sec").value_or(120.0);
  if (velocity < 1 || velocity > 100) {
    throw std::invalid_argument("velocity_percent must be in [1, 100]");
  }
  if (blend < 0 || blend > 100) {
    throw std::invalid_argument("blend_radius_percent must be in [0, 100]");
  }
  if (!std::isfinite(timeout_sec_) || timeout_sec_ <= 0.0) {
    throw std::invalid_argument("timeout_sec must be positive");
  }
  for (std::size_t index = 0; index < arms_.size(); ++index) {
    arms_[index].goal.command = Action::Goal::MOVEJ;
    arms_[index].goal.reference_type = Action::Goal::BASE;
    arms_[index].goal.reference_name = "base";
    arms_[index].goal.joint_degrees = parseJoints(getInput<std::string>(ports[index]).value_or(""));
    arms_[index].goal.velocity_percent = static_cast<std::uint32_t>(velocity);
    arms_[index].goal.blend_radius_percent = static_cast<std::uint32_t>(blend);
    arms_[index].goal.connect = false;
    arms_[index].goal.timeout_sec = static_cast<float>(timeout_sec_);
  }
  return true;
}

bool ThreeArmMoveJNode::initialize() {
  if (initialized_) return true;
  ros_node_ = rosNode(blackboard());
  if (!readGoals()) return false;
  dry_run_ = getInput<bool>("dry_run").value_or(true);
  started_at_ = std::chrono::steady_clock::now();
  initialized_ = true;
  if (!dry_run_) {
    for (auto& arm : arms_) {
      arm.client = rclcpp_action::create_client<Action>(
          ros_node_->get_node_base_interface(), ros_node_->get_node_graph_interface(),
          ros_node_->get_node_logging_interface(), ros_node_->get_node_waitables_interface(),
          std::string("/") + arm.id + "/execute_motion");
    }
  }
  return true;
}

void ThreeArmMoveJNode::recordEvent(const ArmState& arm, const std::string& phase,
                                    const std::string& detail,
                                    const std::string& severity) const {
  auto* sink = diagnostics(blackboard());
  if (!sink) return;
  sink->recordEvent({timestampMilliseconds(), severity, "ACTION",
                     std::string("/") + arm.id + "/execute_motion", phase, detail});
}

bool ThreeArmMoveJNode::allActionServersReady() const {
  for (const auto& arm : arms_) {
    if (!arm.client || !arm.client->wait_for_action_server(std::chrono::milliseconds(0))) {
      return false;
    }
  }
  return true;
}

void ThreeArmMoveJNode::fail(const std::string& reason) {
  if (!failed_) setFailureReason(reason);
  failed_ = true;
  for (auto& arm : arms_) {
    if (!arm.sent || arm.completed || arm.cancel_requested || arm.handed_off) {
      continue;
    }
    // Failure can happen while another arm is still waiting for its goal
    // response. Transfer both pending responses and accepted handles to the
    // executor-owned drain so no request is abandoned when this leaf fails.
    if (!handoff(arm) && arm.goal_handle) {
      requestCancel(arm, reason);
    }
  }
}

void ThreeArmMoveJNode::requestCancel(ArmState& arm, const std::string& detail) {
  if (!arm.client || !arm.goal_handle || arm.cancel_requested) return;
  try {
    (void)arm.client->async_cancel_goal(arm.goal_handle);
    arm.cancel_requested = true;
    recordEvent(arm, "cancel", detail, "WARN");
  } catch (const std::exception& error) {
    recordEvent(arm, "cancel", error.what(), "ERROR");
  }
}

bool ThreeArmMoveJNode::processGoals() {
  for (auto& arm : arms_) {
    if (!arm.sent || arm.goal_handle || !arm.goal_future.valid() ||
        arm.goal_future.wait_for(std::chrono::milliseconds(0)) != std::future_status::ready) {
      continue;
    }
    try {
      arm.goal_handle = arm.goal_future.get();
    } catch (const std::exception& error) {
      recordEvent(arm, "goal_rejected", error.what(), "ERROR");
      fail(error.what());
      return false;
    }
    if (!arm.goal_handle) {
      recordEvent(arm, "goal_rejected", "MoveJ goal rejected by action server", "ERROR");
      fail(std::string("/") + arm.id + " MoveJ goal rejected");
      return false;
    }
    recordEvent(arm, "goal_accepted", "MoveJ goal accepted");
    try {
      arm.result_future = arm.client->async_get_result(arm.goal_handle);
    } catch (const std::exception& error) {
      recordEvent(arm, "result", error.what(), "ERROR");
      fail(error.what());
      return false;
    }
  }
  return true;
}

bool ThreeArmMoveJNode::processResults() {
  for (auto& arm : arms_) {
    if (arm.completed || arm.failed) continue;
    if (!arm.goal_handle || !arm.result_future.valid() ||
        arm.result_future.wait_for(std::chrono::milliseconds(0)) != std::future_status::ready) {
      continue;
    }
    Client::WrappedResult wrapped;
    try {
      wrapped = arm.result_future.get();
    } catch (const std::exception& error) {
      recordEvent(arm, "result", error.what(), "ERROR");
      fail(error.what());
      return false;
    }
    const std::string detail = wrapped.result && !wrapped.result->message.empty()
                                   ? wrapped.result->message : resultCode(wrapped.code);
    const bool success = wrapped.code == rclcpp_action::ResultCode::SUCCEEDED &&
                         wrapped.result && wrapped.result->success;
    recordEvent(arm, "result", detail, success ? "INFO" : "ERROR");
    // A terminal result is complete even when unsuccessful; never cancel a
    // goal after its result future has become ready.
    arm.completed = true;
    arm.failed = !success;
    if (!success) {
      fail(std::string("/") + arm.id + "/execute_motion: " + detail);
      return false;
    }
  }
  return true;
}

bt_core::NodeStatus ThreeArmMoveJNode::tick() {
  try {
    if (!initialize()) return bt_core::NodeStatus::FAILURE;
  } catch (const std::exception& error) {
    setFailureReason(error.what());
    return bt_core::NodeStatus::FAILURE;
  }
  if (completed_) return bt_core::NodeStatus::SUCCESS;
  if (dry_run_) {
    if (!dry_run_logged_) {
      for (const auto& arm : arms_) {
        recordEvent(arm, "result", "dry-run validation completed; no goal sent");
      }
      dry_run_logged_ = true;
    }
    completed_ = true;
    return bt_core::NodeStatus::SUCCESS;
  }
  if (failed_) return bt_core::NodeStatus::FAILURE;
  if (std::chrono::duration<double>(std::chrono::steady_clock::now() - started_at_).count() > timeout_sec_) {
    fail("ThreeArmMoveJ timed out after " + std::to_string(timeout_sec_) + " seconds");
    return bt_core::NodeStatus::FAILURE;
  }
  if (!arms_[0].sent && !allActionServersReady()) {
    for (const auto& arm : arms_) recordEvent(arm, "wait_server", "waiting for action server");
    return bt_core::NodeStatus::RUNNING;
  }
  if (!arms_[0].sent) {
    try {
      for (auto& arm : arms_) {
        arm.goal_future = arm.client->async_send_goal(arm.goal);
        arm.sent = true;
        recordEvent(arm, "send_goal", "MoveJ goal sent");
      }
      RCLCPP_INFO(ros_node_->get_logger(),
                  "[%s] sent synchronized MoveJ goals to l, m, and r",
                  name().c_str());
    } catch (const std::exception& error) {
      fail(error.what());
      RCLCPP_ERROR(ros_node_->get_logger(), "[%s] cannot send all MoveJ goals: %s",
                   name().c_str(), error.what());
      return bt_core::NodeStatus::FAILURE;
    }
  }
  if (!processGoals() || !processResults()) return bt_core::NodeStatus::FAILURE;
  for (const auto& arm : arms_) {
    if (!arm.completed) return bt_core::NodeStatus::RUNNING;
  }
  completed_ = true;
  RCLCPP_INFO(ros_node_->get_logger(), "[%s] all three MoveJ goals completed",
              name().c_str());
  return bt_core::NodeStatus::SUCCESS;
}

bool ThreeArmMoveJNode::handoff(ArmState& arm) {
  if (arm.handed_off) return true;
  const auto sink = blackboard()->get<MoveJCancellationDrainSink>(
      kMoveJCancellationDrainSinkBlackboardKey);
  if (!sink.has_value() || !sink.value() || !arm.client) return false;
  if (arm.cancel_requested) return true;
  if (!arm.goal_handle && arm.goal_future.valid()) {
    sink.value()(std::make_shared<MoveJCancellationDrain>(
        std::move(arm.client), std::move(arm.goal_future),
        std::string("/") + arm.id + "/execute_motion", diagnostics(blackboard())));
    arm.handed_off = true;
    return true;
  }
  if (arm.goal_handle && !arm.completed) {
    sink.value()(std::make_shared<MoveJCancellationDrain>(
        std::move(arm.client), std::move(arm.goal_handle),
        std::string("/") + arm.id + "/execute_motion", diagnostics(blackboard())));
    arm.handed_off = true;
    return true;
  }
  return true;
}

void ThreeArmMoveJNode::onHalted() {
  bool handed_off = true;
  for (auto& arm : arms_) {
    if (arm.sent && !arm.completed && !arm.handed_off) {
      handed_off = handoff(arm) && handed_off;
    }
  }
  if (handed_off) reset();
}

void ThreeArmMoveJNode::reset() {
  for (auto& arm : arms_) {
    arm = ArmState{arm.id};
  }
  ros_node_ = nullptr;
  initialized_ = false;
  dry_run_logged_ = false;
  failed_ = false;
  completed_ = false;
  setFailureReason("");
}

}  // namespace realman_bt
