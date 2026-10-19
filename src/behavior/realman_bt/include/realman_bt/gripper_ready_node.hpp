#pragma once

#include <chrono>
#include <memory>
#include <mutex>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace realman_bt {

// Makes sure the arm's gripper is open before an attempt starts. A closed or half-closed gripper
// at the start makes the policy carry-and-release straight away, so every attempt begins here.
//
// SUCCESS as soon as a fresh position reading is at or below gripper_ready.open_position_max.
// Otherwise it calls /<gripper>/open once and stays RUNNING until the reading gets there. A
// missing service, missing data, a refused open or a timeout is a fault (policy_fault plus
// policy_failure_reason): retrying cannot fix a gripper that will not open.
//
// dry_run=true only records what would be checked; it touches no topic or service.
class GripperReadyNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  using Clock = std::chrono::steady_clock;

  struct OpenCall {
    bool done{false};
    bool success{false};
    std::string message;
  };

  void initialize();
  void reset();
  bt_core::NodeStatus fault(const std::string& reason);

  const PolicyTaskConfig* config_{nullptr};
  std::string gripper_;
  rclcpp::Subscription<std_msgs::msg::Float64>::SharedPtr subscription_;
  rclcpp::Client<std_srvs::srv::Trigger>::SharedPtr open_client_;

  std::mutex mutex_;
  double position_{0.0};
  Clock::time_point position_at_{};
  bool have_position_{false};

  bool started_{false};
  Clock::time_point started_at_{};
  bool open_requested_{false};
  std::shared_ptr<OpenCall> open_call_;
  bool dry_run_logged_{false};
};

}  // namespace realman_bt
