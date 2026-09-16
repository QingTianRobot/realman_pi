#pragma once

#include <array>
#include <chrono>
#include <future>
#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "realman_msgs/action/execute_motion.hpp"

namespace realman_bt {

inline constexpr char kRosNodeBlackboardKey[] = "__realman_bt_ros_node__";
inline constexpr char kRuntimeDiagnosticsBlackboardKey[] =
    "__realman_bt_runtime_diagnostics__";

class RuntimeDiagnostics;

class MoveJNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  using Action = realman_msgs::action::ExecuteMotion;
  using Client = rclcpp_action::Client<Action>;
  using GoalHandle = Client::GoalHandle;

  static bt_core::PortsList providedPorts();

  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  bool initialize();
  bool readGoal(Action::Goal* goal);
  void recordActionEvent(const std::string& phase, const std::string& detail,
                         const std::string& severity = "INFO") const;
  void reset();

  rclcpp::Node* ros_node_{nullptr};
  Client::SharedPtr client_;
  Action::Goal goal_{};
  GoalHandle::SharedPtr goal_handle_;
  std::shared_future<GoalHandle::SharedPtr> goal_future_;
  std::shared_future<Client::WrappedResult> result_future_;
  std::chrono::steady_clock::time_point started_at_{};
  std::string action_name_;
  double timeout_sec_{30.0};
  bool initialized_{false};
  bool dry_run_{true};
  bool sent_{false};
  bool completed_{false};
  bool failed_{false};
  bool dry_run_logged_{false};
  bool wait_server_recorded_{false};
};

}  // namespace realman_bt
