#pragma once

#include <chrono>
#include <mutex>
#include <optional>
#include <string>

#include "bt_core/decorator_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "std_msgs/msg/float64.hpp"

namespace realman_bt {

// Runs its child (the motions that carry a grasped object away) only while the gripper still holds
// the object, and turns every way the carry can end into what RetryUnlessFault expects:
//
//   SUCCESS  the child succeeded with the object still held.
//   FAILURE  retryable: the gripper position stayed at or above verdict.empty_position_min (the
//            jaws met, the object is gone) for grasp_check.carry_lost_sec. The child is halted
//            first, so the motion stops where the object fell; the retry opens the gripper, goes
//            home and runs the policy again.
//   FAILURE  with policy_fault: the child failed (a MoveJ, the lift), or no gripper position
//            arrived for gripper_ready.position_stale_sec. Retrying cannot fix either, exactly as
//            when those motions ran outside the retry.
//
// The position is checked before the child is ticked, so a drop is seen even on the tick the
// child would have finished. dry_run=true ticks the child without looking at the gripper (a failed
// child is still a fault).
class WhileGraspHeldNode final : public bt_core::DecoratorNode {
 public:
  using bt_core::DecoratorNode::DecoratorNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void halt() override;

 private:
  using Clock = std::chrono::steady_clock;

  void initialize();
  void reset();
  bt_core::NodeStatus stopChild(bt_core::NodeStatus status);
  // Ticks the child; a child FAILURE that raised no flag of its own becomes a fault.
  bt_core::NodeStatus tickChild();

  const PolicyTaskConfig* config_{nullptr};
  std::string gripper_;
  rclcpp::Subscription<std_msgs::msg::Float64>::SharedPtr subscription_;

  std::mutex mutex_;
  double position_{0.0};
  Clock::time_point position_at_{};
  bool have_position_{false};

  bool started_{false};
  Clock::time_point started_at_{};
  std::optional<Clock::time_point> lost_since_;
  bool dry_run_logged_{false};
};

}  // namespace realman_bt
