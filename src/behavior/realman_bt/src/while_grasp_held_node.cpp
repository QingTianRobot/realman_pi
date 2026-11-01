#include "realman_bt/while_grasp_held_node.hpp"

#include <cstdio>
#include <stdexcept>

#include "realman_bt/policy_task_blackboard.hpp"

namespace realman_bt {
namespace {

std::string number(double value, int decimals) {
  char buffer[48];
  std::snprintf(buffer, sizeof(buffer), "%.*f", decimals, value);
  return buffer;
}

}  // namespace

bt_core::PortsList WhileGraspHeldNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "Arm whose gripper carries the object"),
      bt_core::InputPort<bool>("dry_run", "true", "Tick the child without watching the gripper"));
}

void WhileGraspHeldNode::initialize() {
  if (subscription_) return;
  config_ = &requirePolicyTaskConfig(blackboard());
  const std::string arm = getInput<std::string>("arm_id").value_or("r");
  const auto gripper = config_->gripper_for_arm.find(arm);
  if (gripper == config_->gripper_for_arm.end() || gripper->second.empty()) {
    throw std::runtime_error("policy_task.gripper_for_arm has no gripper for arm " + arm);
  }
  gripper_ = gripper->second;
  subscription_ = requireRosNode(blackboard()).create_subscription<std_msgs::msg::Float64>(
      "/" + gripper_ + "/position", rclcpp::QoS(10).best_effort(),
      [this](std_msgs::msg::Float64::ConstSharedPtr message) {
        std::lock_guard<std::mutex> lock(mutex_);
        position_ = message->data;
        position_at_ = Clock::now();
        have_position_ = true;
      });
}

void WhileGraspHeldNode::reset() {
  started_ = false;
  lost_since_.reset();
  dry_run_logged_ = false;
}

bt_core::NodeStatus WhileGraspHeldNode::stopChild(bt_core::NodeStatus status) {
  if (child() && child()->needsHalt()) child()->halt();
  if (child()) child()->setStatus(bt_core::NodeStatus::IDLE);
  reset();
  return status;
}

bt_core::NodeStatus WhileGraspHeldNode::tick() {
  if (!child()) return bt_core::NodeStatus::FAILURE;
  if (getInput<bool>("dry_run").value_or(true)) {
    if (!dry_run_logged_) {
      recordPolicyEvent(blackboard(), "INFO", name(), "dry_run",
                        "would stop the carry and retry the pick if the object drops");
      dry_run_logged_ = true;
    }
    return tickChild();
  }

  initialize();
  const auto now = Clock::now();
  if (!started_) {
    started_ = true;
    started_at_ = now;
  }

  double position = 0.0;
  bool fresh = false;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    position = position_;
    fresh = have_position_ && std::chrono::duration<double>(now - position_at_).count() <=
                                  config_->gripper_ready.position_stale_sec;
  }
  if (!fresh) {
    lost_since_.reset();
    if (std::chrono::duration<double>(now - started_at_).count() > config_->gripper_ready.position_stale_sec) {
      const std::string reason = "no gripper position on /" + gripper_ + "/position while carrying the object";
      raisePolicyFault(blackboard(), reason);
      setFailureReason(reason);
      recordPolicyEvent(blackboard(), "ERROR", name(), "fault", reason);
      return stopChild(bt_core::NodeStatus::FAILURE);
    }
  } else if (position >= config_->verdict.empty_position_min) {
    if (!lost_since_) lost_since_ = now;
    if (std::chrono::duration<double>(now - *lost_since_).count() >=
        config_->grasp_check.carry_lost_sec - 1e-9) {
      const std::string reason = "the object dropped while carrying it (gripper position " +
                                 number(position, 0) + " at or above " +
                                 number(config_->verdict.empty_position_min, 0) + ")";
      recordPolicyFailureReason(blackboard(), reason);
      setFailureReason(reason);
      recordPolicyEvent(blackboard(), "WARN", name(), "dropped", reason + "; stopping the carry");
      return stopChild(bt_core::NodeStatus::FAILURE);
    }
  } else {
    lost_since_.reset();
  }

  return tickChild();
}

bt_core::NodeStatus WhileGraspHeldNode::tickChild() {
  const auto status = child()->executeTick();
  if (status == bt_core::NodeStatus::RUNNING) return status;
  if (status == bt_core::NodeStatus::FAILURE &&
      !blackboard()->get<bool>(kPolicyFaultKey).value_or(false)) {
    const std::string detail = child()->failureReason();
    const std::string reason =
        "carrying the object failed in " + child()->name() + (detail.empty() ? "" : ": " + detail);
    raisePolicyFault(blackboard(), reason);
    setFailureReason(reason);
    recordPolicyEvent(blackboard(), "ERROR", name(), "fault", reason);
  }
  reset();
  return status;
}

void WhileGraspHeldNode::halt() {
  reset();
  bt_core::DecoratorNode::halt();
}

}  // namespace realman_bt
