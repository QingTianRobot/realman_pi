#include "realman_bt/gripper_ready_node.hpp"

#include <utility>

#include "realman_bt/policy_task_blackboard.hpp"

namespace realman_bt {

bt_core::PortsList GripperReadyNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "Arm whose gripper has to be open"),
      bt_core::InputPort<bool>("dry_run", "true", "Validate without touching the gripper"));
}

void GripperReadyNode::initialize() {
  if (subscription_) return;
  config_ = &requirePolicyTaskConfig(blackboard());
  const std::string arm = getInput<std::string>("arm_id").value_or("r");
  const auto gripper = config_->gripper_for_arm.find(arm);
  if (gripper == config_->gripper_for_arm.end() || gripper->second.empty()) {
    throw std::runtime_error("policy_task.gripper_for_arm has no gripper for arm " + arm);
  }
  gripper_ = gripper->second;
  auto& ros_node = requireRosNode(blackboard());
  subscription_ = ros_node.create_subscription<std_msgs::msg::Float64>(
      "/" + gripper_ + "/position", rclcpp::QoS(10).best_effort(),
      [this](std_msgs::msg::Float64::ConstSharedPtr message) {
        std::lock_guard<std::mutex> lock(mutex_);
        position_ = message->data;
        position_at_ = Clock::now();
        have_position_ = true;
      });
  open_client_ = ros_node.create_client<std_srvs::srv::Trigger>("/" + gripper_ + "/open");
}

void GripperReadyNode::reset() {
  started_ = false;
  open_requested_ = false;
  open_call_.reset();  // a late reply to an abandoned request must not leak into the next run
  dry_run_logged_ = false;
}

bt_core::NodeStatus GripperReadyNode::fault(const std::string& reason) {
  raisePolicyFault(blackboard(), reason);
  setFailureReason(reason);
  recordPolicyEvent(blackboard(), "ERROR", name(), "fault", reason);
  reset();
  return bt_core::NodeStatus::FAILURE;
}

bt_core::NodeStatus GripperReadyNode::tick() {
  if (getInput<bool>("dry_run").value_or(true)) {
    if (!dry_run_logged_) {
      recordPolicyEvent(blackboard(), "INFO", name(), "dry_run",
                        "would check the gripper is open and call its open service if not");
      dry_run_logged_ = true;
    }
    return bt_core::NodeStatus::SUCCESS;
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
    fresh = have_position_ &&
            std::chrono::duration<double>(now - position_at_).count() <=
                config_->gripper_ready.position_stale_sec;
  }

  if (fresh && position <= config_->gripper_ready.open_position_max) {
    reset();
    return bt_core::NodeStatus::SUCCESS;
  }

  if (open_call_ && open_call_->done && !open_call_->success) {
    return fault("gripper open was refused: " + open_call_->message);
  }

  if (fresh && !open_requested_ && open_client_->service_is_ready()) {
    auto call = std::make_shared<OpenCall>();
    open_client_->async_send_request(
        std::make_shared<std_srvs::srv::Trigger::Request>(),
        [call](rclcpp::Client<std_srvs::srv::Trigger>::SharedFuture future) {
          const auto response = future.get();
          call->success = response->success;
          call->message = response->message;
          call->done = true;
        });
    open_call_ = std::move(call);
    open_requested_ = true;
    recordPolicyEvent(blackboard(), "INFO", name(), "open",
                      "gripper position " + std::to_string(position) + " is above " +
                          std::to_string(config_->gripper_ready.open_position_max) +
                          "; asked /" + gripper_ + "/open to open it");
  }

  const double elapsed = std::chrono::duration<double>(now - started_at_).count();
  if (elapsed > config_->gripper_ready.timeout_sec) {
    if (!fresh) {
      return fault("no gripper position on /" + gripper_ + "/position within " +
                   std::to_string(config_->gripper_ready.timeout_sec) + " s");
    }
    if (!open_requested_) {
      return fault("gripper open service /" + gripper_ + "/open is not available");
    }
    return fault("gripper did not open within " +
                 std::to_string(config_->gripper_ready.timeout_sec) + " s (position " +
                 std::to_string(position) + ")");
  }
  return bt_core::NodeStatus::RUNNING;
}

void GripperReadyNode::onHalted() { reset(); }

}  // namespace realman_bt
