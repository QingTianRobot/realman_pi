#include "realman_bt/rotate_joint_node.hpp"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <utility>

#include "realman_bt/runtime_snapshot.hpp"

namespace realman_bt {
namespace {

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

std::string formatJoints(const std::array<double, 6>& joints) {
  std::ostringstream stream;
  stream << std::setprecision(12);
  for (std::size_t index = 0; index < joints.size(); ++index) {
    if (index > 0) stream << ',';
    stream << joints[index];
  }
  return stream.str();
}

}  // namespace

std::array<double, 6> rotateJointTarget(const std::array<double, 6>& current,
                                        int joint, bool clockwise,
                                        double angle_degrees) {
  if (joint < 1 || joint > 6) {
    throw std::invalid_argument("joint must be in [1, 6]");
  }
  std::array<double, 6> target = current;
  target[static_cast<std::size_t>(joint - 1)] +=
      clockwise ? -angle_degrees : angle_degrees;
  return target;
}

bt_core::PortsList SingleJointMoveNode::commonPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "RealMan arm namespace: l, m, or r"),
      bt_core::InputPort<bool>("dry_run", "true", "Validate without reading joints or sending a motion goal"),
      bt_core::InputPort<int>("joint", "6", "Joint to move: 1-6 for J1-J6"),
      bt_core::InputPort<int>("velocity_percent", "10", "MoveJ velocity ratio [1, 100]"),
      bt_core::InputPort<double>("timeout_sec", "30", "Timeout in seconds for the joint read and for the MoveJ"));
}

bt_core::PortsList RotateJointNode::providedPorts() {
  auto ports = SingleJointMoveNode::commonPorts();
  ports.merge(bt_core::makePorts(
      bt_core::InputPort<std::string>("direction", "ccw",
                                      "cw (clockwise, angle decreases) or ccw (counterclockwise, angle increases), right-hand rule about the joint +Z axis"),
      bt_core::InputPort<double>("angle_degrees", "10", "Rotation magnitude in degrees, (0, 180]")));
  return ports;
}

void RotateJointNode::readTargetPorts() {
  const std::string direction = portOr<std::string>("direction", "ccw");
  if (direction != "cw" && direction != "ccw") {
    throw std::invalid_argument("direction must be cw or ccw");
  }
  clockwise_ = direction == "cw";
  angle_degrees_ = portOr<double>("angle_degrees", 10.0);
  if (!std::isfinite(angle_degrees_) || angle_degrees_ <= 0.0 ||
      angle_degrees_ > 180.0) {
    throw std::invalid_argument("angle_degrees must be in (0, 180]");
  }
}

std::array<double, 6> RotateJointNode::target(const std::array<double, 6>& current) const {
  return rotateJointTarget(current, joint(), clockwise_, angle_degrees_);
}

std::string RotateJointNode::describe() const {
  std::ostringstream stream;
  stream << std::setprecision(12) << 'J' << joint() << ' ' << (clockwise_ ? "cw" : "ccw")
         << ' ' << angle_degrees_ << " deg";
  return stream.str();
}

bt_core::PortsList MoveJointToNode::providedPorts() {
  auto ports = SingleJointMoveNode::commonPorts();
  ports.merge(bt_core::makePorts(bt_core::InputPort<double>(
      "target_degrees", "0", "Absolute angle for the joint in RealMan degrees, [-360, 360]")));
  return ports;
}

void MoveJointToNode::readTargetPorts() {
  target_degrees_ = portOr<double>("target_degrees", 0.0);
  if (!std::isfinite(target_degrees_) || target_degrees_ < -360.0 ||
      target_degrees_ > 360.0) {
    throw std::invalid_argument("target_degrees must be in [-360, 360]");
  }
}

std::array<double, 6> MoveJointToNode::target(const std::array<double, 6>& current) const {
  std::array<double, 6> result = current;
  result[static_cast<std::size_t>(joint() - 1)] = target_degrees_;
  return result;
}

std::string MoveJointToNode::describe() const {
  std::ostringstream stream;
  stream << std::setprecision(12) << 'J' << joint() << " to " << target_degrees_ << " deg";
  return stream.str();
}

void SingleJointMoveNode::readPorts() {
  arm_id_ = portOr<std::string>("arm_id", "r");
  if (arm_id_ != "l" && arm_id_ != "m" && arm_id_ != "r") {
    throw std::invalid_argument("arm_id must be l, m, or r");
  }
  joint_ = portOr<int>("joint", 6);
  if (joint_ < 1 || joint_ > 6) {
    throw std::invalid_argument("joint must be in [1, 6]");
  }
  readTargetPorts();
  velocity_percent_ = portOr<int>("velocity_percent", 10);
  if (velocity_percent_ < 1 || velocity_percent_ > 100) {
    throw std::invalid_argument("velocity_percent must be in [1, 100]");
  }
  timeout_sec_ = portOr<double>("timeout_sec", 30.0);
  if (!std::isfinite(timeout_sec_) || timeout_sec_ <= 0.0) {
    throw std::invalid_argument("timeout_sec must be positive");
  }
  // bt_core reads any literal other than "true"/"1" as false; an unknown
  // literal must not turn into real motion.
  const auto dry_run_literal = config().port_values.find("dry_run");
  if (dry_run_literal != config().port_values.end() &&
      dry_run_literal->second != "true" && dry_run_literal->second != "false" &&
      dry_run_literal->second != "1" && dry_run_literal->second != "0") {
    throw std::invalid_argument("dry_run must be true or false");
  }
  dry_run_ = portOr<bool>("dry_run", true);
  service_name_ = "/" + arm_id_ + "/get_current_pose";
}

void SingleJointMoveNode::recordEvent(const std::string& phase,
                                      const std::string& detail,
                                      const std::string& severity) const {
  RuntimeDiagnostics* diagnostics = getDiagnostics(blackboard());
  if (!diagnostics) return;
  diagnostics->recordEvent({timestampMilliseconds(), severity, "SERVICE",
                            service_name_, phase, detail});
}

bt_core::NodeStatus SingleJointMoveNode::fail(const std::string& reason) {
  failed_ = true;
  setFailureReason(reason);
  recordEvent("result", reason, "ERROR");
  if (ros_node_) {
    RCLCPP_ERROR(ros_node_->get_logger(), "[%s] joint move failed: %s",
                 name().c_str(), reason.c_str());
  }
  return bt_core::NodeStatus::FAILURE;
}

void SingleJointMoveNode::startMove(const std::array<double, 6>& current) {
  const auto target_joints = target(current);
  bt_core::NodeConfig move_config;
  move_config.blackboard = blackboard();
  move_config.port_values = {
      {"arm_id", arm_id_},
      {"dry_run", "false"},
      {"joint_degrees", formatJoints(target_joints)},
      {"velocity_percent", std::to_string(velocity_percent_)},
      {"blend_radius_percent", "0"},
      {"timeout_sec", std::to_string(timeout_sec_)},
  };
  move_ = std::make_unique<MoveJNode>(name(), std::move(move_config));
  const std::string detail =
      describe() + ": [" + formatJoints(current) + "] -> [" + formatJoints(target_joints) + "]";
  recordEvent("target", detail);
  RCLCPP_INFO(ros_node_->get_logger(), "[%s] %s", name().c_str(),
              detail.c_str());
}

bt_core::NodeStatus SingleJointMoveNode::pollCurrentJoints() {
  const bool expired =
      std::chrono::duration<double>(std::chrono::steady_clock::now() - started_at_)
          .count() > timeout_sec_;
  if (!pose_requested_) {
    if (!pose_client_->service_is_ready()) {
      if (expired) return fail(service_name_ + " unavailable before timeout");
      if (!wait_service_recorded_) {
        recordEvent("wait_server", "waiting for current-joint service");
        wait_service_recorded_ = true;
      }
      return bt_core::NodeStatus::RUNNING;
    }
    auto request = std::make_shared<GetCurrentPose::Request>();
    request->reference_type = GetCurrentPose::Request::BASE;
    request->reference_name = "base";
    pose_future_ = pose_client_->async_send_request(request).future.share();
    pose_requested_ = true;
    recordEvent("send_request", "current-joint read requested");
    return bt_core::NodeStatus::RUNNING;
  }
  if (pose_future_.wait_for(std::chrono::milliseconds(0)) !=
      std::future_status::ready) {
    if (expired) return fail("current-joint read timed out");
    return bt_core::NodeStatus::RUNNING;
  }
  GetCurrentPose::Response::SharedPtr response;
  try {
    response = pose_future_.get();
  } catch (const std::exception& error) {
    return fail(std::string("current-joint read failed: ") + error.what());
  }
  if (!response || !response->success) {
    return fail("current-joint read failed: " +
                (response && !response->message.empty() ? response->message
                                                        : std::string("no joints")));
  }
  std::array<double, 6> current{};
  std::copy(response->current_joint_degrees.begin(),
            response->current_joint_degrees.end(), current.begin());
  if (!std::all_of(current.begin(), current.end(),
                   [](double value) { return std::isfinite(value); })) {
    return fail("current-joint read returned non-finite joints");
  }
  startMove(current);
  return bt_core::NodeStatus::RUNNING;
}

bt_core::NodeStatus SingleJointMoveNode::tick() {
  if (completed_) return bt_core::NodeStatus::SUCCESS;
  if (failed_) return bt_core::NodeStatus::FAILURE;
  if (!initialized_) {
    try {
      ros_node_ = getNode(blackboard());
      readPorts();
    } catch (const std::exception& error) {
      failed_ = true;
      setFailureReason(error.what());
      if (ros_node_) {
        RCLCPP_ERROR(ros_node_->get_logger(), "[%s] invalid joint move: %s",
                     name().c_str(), error.what());
      }
      return bt_core::NodeStatus::FAILURE;
    }
    initialized_ = true;
    started_at_ = std::chrono::steady_clock::now();
    if (dry_run_) {
      RCLCPP_INFO(ros_node_->get_logger(),
                  "[%s] dry-run validated %s on %s; no joints read, no goal sent",
                  name().c_str(), describe().c_str(), arm_id_.c_str());
      recordEvent("result", "dry-run validation completed; no request or goal sent");
      completed_ = true;
      return bt_core::NodeStatus::SUCCESS;
    }
    pose_client_ = ros_node_->create_client<GetCurrentPose>(service_name_);
  }

  if (!move_) {
    const auto status = pollCurrentJoints();
    if (status != bt_core::NodeStatus::RUNNING || !move_) return status;
  }

  const auto status = move_->executeTick();
  if (status == bt_core::NodeStatus::SUCCESS) {
    completed_ = true;
  } else if (status == bt_core::NodeStatus::FAILURE) {
    failed_ = true;
    setFailureReason(move_->failureReason());
  }
  return status;
}

void SingleJointMoveNode::reset() {
  move_.reset();
  pose_future_ = {};
  pose_client_.reset();
  ros_node_ = nullptr;
  initialized_ = false;
  completed_ = false;
  failed_ = false;
  pose_requested_ = false;
  wait_service_recorded_ = false;
  setFailureReason("");
}

void SingleJointMoveNode::onHalted() {
  // MoveJ hands any pending or in-flight goal to the executor's cancellation
  // drain before it is released; an outstanding joint read is a plain query.
  if (move_) move_->halt();
  reset();
}

}  // namespace realman_bt
