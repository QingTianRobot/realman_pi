#pragma once

#include <array>
#include <chrono>
#include <future>
#include <memory>
#include <stdexcept>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_msgs/srv/get_current_pose.hpp"

namespace realman_bt {

// Pure target computation, exposed for tests.  joint is 1-based (J1..J6);
// counterclockwise (right-hand rule about the joint +Z axis) adds the angle,
// clockwise subtracts it.
std::array<double, 6> rotateJointTarget(const std::array<double, 6>& current,
                                        int joint, bool clockwise,
                                        double angle_degrees);

// Moves one joint of one arm and keeps the other five where they are. The
// current joints come from /<arm>/get_current_pose; the motion itself is an
// ordinary MoveJ, so timeout, cancellation and halt drains are exactly
// MoveJ's. Subclasses only say which ports they have and where the joint goes.
class SingleJointMoveNode : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  using GetCurrentPose = realman_msgs::srv::GetCurrentPose;
  using PoseClient = rclcpp::Client<GetCurrentPose>;

  bt_core::NodeStatus tick() override;
  void onHalted() override;

 protected:
  // Ports shared by every single-joint move.
  static bt_core::PortsList commonPorts();
  // Reads and validates the subclass's own ports; throws std::invalid_argument.
  virtual void readTargetPorts() = 0;
  // The full six-joint target given the current joints; only joint() changes.
  virtual std::array<double, 6> target(const std::array<double, 6>& current) const = 0;
  // "J6 ccw 10 deg" / "J1 to -135 deg", for logs and diagnostics.
  virtual std::string describe() const = 0;

  int joint() const { return joint_; }

  // Unset ports take the default; a value that is set but does not parse
  // fails instead of silently falling back to it.
  template <typename T>
  T portOr(const std::string& port, T fallback) const {
    const auto value = getInput<T>(port);
    if (value.has_value()) return value.value();
    if (config().port_values.count(port) > 0 || config().port_remap.count(port) > 0) {
      throw std::invalid_argument(port + " is malformed");
    }
    return fallback;
  }

 private:
  void readPorts();
  bt_core::NodeStatus fail(const std::string& reason);
  bt_core::NodeStatus pollCurrentJoints();
  void startMove(const std::array<double, 6>& current);
  void recordEvent(const std::string& phase, const std::string& detail,
                   const std::string& severity = "INFO") const;
  void reset();

  rclcpp::Node* ros_node_{nullptr};
  PoseClient::SharedPtr pose_client_;
  std::shared_future<GetCurrentPose::Response::SharedPtr> pose_future_;
  std::unique_ptr<MoveJNode> move_;
  std::chrono::steady_clock::time_point started_at_{};
  std::string arm_id_;
  std::string service_name_;
  int joint_{6};
  int velocity_percent_{10};
  double timeout_sec_{30.0};
  bool initialized_{false};
  bool dry_run_{true};
  bool completed_{false};
  bool failed_{false};
  bool pose_requested_{false};
  bool wait_service_recorded_{false};
};

// Relative MoveJ: rotate joint JX clockwise or counterclockwise from its
// current angle.
class RotateJointNode final : public SingleJointMoveNode {
 public:
  using SingleJointMoveNode::SingleJointMoveNode;
  static bt_core::PortsList providedPorts();

 protected:
  void readTargetPorts() override;
  std::array<double, 6> target(const std::array<double, 6>& current) const override;
  std::string describe() const override;

 private:
  bool clockwise_{false};
  double angle_degrees_{0.0};
};

// Absolute MoveJ of one joint: joint JX goes to target_degrees, the other
// joints stay at their current angles.
class MoveJointToNode final : public SingleJointMoveNode {
 public:
  using SingleJointMoveNode::SingleJointMoveNode;
  static bt_core::PortsList providedPorts();

 protected:
  void readTargetPorts() override;
  std::array<double, 6> target(const std::array<double, 6>& current) const override;
  std::string describe() const override;

 private:
  double target_degrees_{0.0};
};

}  // namespace realman_bt
