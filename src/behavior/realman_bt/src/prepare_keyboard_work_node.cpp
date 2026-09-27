#include "realman_bt/prepare_keyboard_work_node.hpp"

#include <chrono>
#include <cstdint>
#include <stdexcept>

#include "realman_bt/input_mode_nodes.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "realman_msgs/action/cartesian_velocity.hpp"

namespace realman_bt {
namespace {

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  return static_cast<std::uint64_t>(
      std::chrono::duration_cast<std::chrono::milliseconds>(
          now.time_since_epoch())
          .count());
}

CoordinateReferenceRegistry* referenceRegistry(
    const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<CoordinateReferenceRegistry*>(
      kCoordinateReferenceRegistryBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error(
        "coordinate reference registry is missing from blackboard");
  }
  return value.value();
}

rclcpp::Node* rosNode(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error(
        "behavior tree ROS node handle is missing from blackboard");
  }
  return value.value();
}

InputModeCoordinator* inputModeCoordinator(
    const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<InputModeCoordinator*>(
      kInputModeCoordinatorBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error(
        "input mode coordinator is missing from blackboard");
  }
  return value.value();
}

RuntimeDiagnostics* diagnostics(const bt_core::Blackboard::Ptr& blackboard) {
  return blackboard->get<RuntimeDiagnostics*>(
      kRuntimeDiagnosticsBlackboardKey).value_or(nullptr);
}

}  // namespace

bt_core::PortsList PrepareKeyboardWorkNode::providedPorts() {
  return bt_core::makePorts(bt_core::InputPort<bool>(
      "dry_run", "true",
      "Validate keyboard WORK configuration without selecting controller frames"));
}

void PrepareKeyboardWorkNode::initialize() {
  if (initialized_) return;

  setFailureReason("");
  dry_run_ = getInput<bool>("dry_run").value_or(true);
  auto* references = referenceRegistry(blackboard());
  for (auto& arm : arms_) {
    const auto& reference = references->resolve(arm.id, "default_work");
    if (reference.type !=
        realman_msgs::action::CartesianVelocity::Goal::WORK) {
      throw std::invalid_argument(
          arm.id + " default WORK reference must have WORK type");
    }
    arm.expected_work = reference.controller_name;
  }

  initialized_ = true;
  if (dry_run_) return;

  ros_node_ = rosNode(blackboard());
  for (auto& arm : arms_) {
    arm.client = ros_node_->create_client<SelectFrame>(arm.service_name);
  }
}

void PrepareKeyboardWorkNode::recordEvent(
    const ArmState& arm, const std::string& phase, const std::string& detail,
    const std::string& severity) const {
  auto* sink = diagnostics(blackboard());
  if (sink != nullptr) {
    sink->recordEvent({timestampMilliseconds(), severity, "SERVICE",
                       arm.service_name, phase, detail});
  }
}

void PrepareKeyboardWorkNode::fail(const std::string& detail) {
  if (failed_) return;
  failed_ = true;
  setFailureReason(detail);
  try {
    inputModeCoordinator(blackboard())->fail(
        detail, InputModeCoordinator::Clock::now());
  } catch (const std::exception& error) {
    if (ros_node_ != nullptr) {
      RCLCPP_ERROR(ros_node_->get_logger(),
                   "failed to mark keyboard WORK preparation failure: %s",
                   error.what());
    }
  }
}

bool PrepareKeyboardWorkNode::pollArm(ArmState& arm) {
  if (arm.completed) return true;
  if (!arm.client->service_is_ready()) {
    if (!arm.wait_recorded) {
      recordEvent(arm, "wait_service",
                  "waiting to select default WORK " + arm.expected_work);
      RCLCPP_INFO(ros_node_->get_logger(),
                  "waiting for %s before keyboard activation",
                  arm.service_name.c_str());
      arm.wait_recorded = true;
    }
    return false;
  }

  if (!arm.request_sent) {
    auto request = std::make_shared<SelectFrame::Request>();
    request->name = arm.expected_work;
    try {
      arm.future = arm.client->async_send_request(request).future.share();
      arm.request_sent = true;
      recordEvent(arm, "request",
                  "select default WORK " + arm.expected_work);
    } catch (const std::exception& error) {
      const std::string detail = arm.id +
          " keyboard WORK request failed: " + error.what();
      recordEvent(arm, "response", detail, "ERROR");
      fail(detail);
    }
    return false;
  }

  if (!arm.future.valid() ||
      arm.future.wait_for(std::chrono::milliseconds(0)) !=
          std::future_status::ready) {
    return false;
  }

  SelectFrame::Response::SharedPtr response;
  try {
    response = arm.future.get();
  } catch (const std::exception& error) {
    const std::string detail = arm.id +
        " keyboard WORK response failed: " + error.what();
    recordEvent(arm, "response", detail, "ERROR");
    fail(detail);
    return false;
  }

  if (!response || !response->success) {
    const std::string response_detail =
        response && !response->message.empty()
            ? response->message
            : "coordinate service rejected the selection";
    const std::string detail = arm.id +
        " keyboard WORK selection failed: " + response_detail;
    recordEvent(arm, "response", detail, "ERROR");
    fail(detail);
    return false;
  }
  if (response->active_name != arm.expected_work) {
    const std::string detail =
        arm.id + " keyboard WORK verification expected " +
        arm.expected_work + " but driver reported " + response->active_name;
    recordEvent(arm, "response", detail, "ERROR");
    fail(detail);
    return false;
  }

  arm.completed = true;
  recordEvent(arm, "response",
              "selected and verified default WORK " + arm.expected_work);
  RCLCPP_INFO(ros_node_->get_logger(),
              "keyboard WORK ready for arm %s: %s", arm.id.c_str(),
              arm.expected_work.c_str());
  return true;
}

bt_core::NodeStatus PrepareKeyboardWorkNode::tick() {
  try {
    initialize();
  } catch (const std::exception& error) {
    fail(error.what());
    return bt_core::NodeStatus::FAILURE;
  }

  if (failed_) return bt_core::NodeStatus::FAILURE;
  if (completed_) return bt_core::NodeStatus::SUCCESS;
  if (dry_run_) {
    for (const auto& arm : arms_) {
      recordEvent(arm, "dry_run",
                  "validated default WORK " + arm.expected_work +
                      "; no selection request sent");
    }
    completed_ = true;
    return bt_core::NodeStatus::SUCCESS;
  }

  bool all_complete = true;
  for (auto& arm : arms_) {
    all_complete = pollArm(arm) && all_complete;
    if (failed_) return bt_core::NodeStatus::FAILURE;
  }
  if (!all_complete) return bt_core::NodeStatus::RUNNING;

  completed_ = true;
  return bt_core::NodeStatus::SUCCESS;
}

void PrepareKeyboardWorkNode::reset() {
  ros_node_ = nullptr;
  for (auto& arm : arms_) {
    arm.expected_work.clear();
    arm.client.reset();
    arm.future = {};
    arm.request_sent = false;
    arm.completed = false;
    arm.wait_recorded = false;
  }
  initialized_ = false;
  dry_run_ = true;
  completed_ = false;
  failed_ = false;
}

void PrepareKeyboardWorkNode::onHalted() { reset(); }

}  // namespace realman_bt
