#pragma once

#include <chrono>
#include <mutex>
#include <string>

#include "bt_core/decorator_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/dwell_tracker.hpp"
#include "sensor_msgs/msg/joint_state.hpp"

namespace realman_bt {

// Defaults of MotionDwellMonitor, from config/ros/motion_monitor.yaml (executor parameters under
// `motion_monitor.`). The executor puts them on the blackboard under these keys; a port written
// in the XML wins over them.
inline constexpr char kMotionDwellSecKey[] = "motion_dwell_sec";
inline constexpr char kMotionDwellToleranceDegKey[] = "motion_dwell_tolerance_deg";
inline constexpr char kMotionDwellStaleSecKey[] = "motion_dwell_stale_sec";
// Written by MotionDwellMonitor: true (and a reason) when it ended its child because the arm stood
// still for too long. Cleared when a run of the monitor starts.
inline constexpr char kMotionDwellKey[] = "motion_dwell";
inline constexpr char kMotionDwellReasonKey[] = "motion_dwell_reason";

struct MotionMonitorConfig {
  double dwell_sec{30.0};
  double tolerance_deg{0.5};
  double joint_state_stale_sec{1.0};

  // Throws std::invalid_argument naming the offending key.
  void validate() const;
};

MotionMonitorConfig declareAndLoadMotionMonitorConfig(rclcpp::Node& node);

// Watches one arm while its child runs. When the arm has stayed in one pose (every joint within
// tolerance_deg) for dwell_sec, it halts the child and returns on_dwell (FAILURE by default), so
// an enclosing Fallback can switch to another branch: re-home, open the gripper, hand over to
// another input. Otherwise it returns whatever the child returns.
//
// The window starts when a run of the monitor starts (the first tick after it was idle, halted or
// finished); a gap in /<arm>/joint_states longer than the stale time restarts it. Without joint
// states it never fires. It only reads: no dry_run port, nothing is commanded.
class MotionDwellMonitorNode final : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void halt() override;

 private:
  using Clock = std::chrono::steady_clock;

  void initialize();
  double setting(const char* port, const char* blackboard_key, double fallback) const;
  void endRun();

  std::string arm_;
  rclcpp::Subscription<sensor_msgs::msg::JointState>::SharedPtr subscription_;
  std::mutex mutex_;  // tracker_
  DwellTracker tracker_{30.0, 0.5, 1.0};
  bool run_active_{false};
  bt_core::NodeStatus on_dwell_{bt_core::NodeStatus::FAILURE};
};

}  // namespace realman_bt
