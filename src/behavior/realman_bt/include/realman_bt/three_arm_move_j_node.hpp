#pragma once

#include <array>
#include <chrono>
#include <future>
#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "realman_msgs/action/execute_motion.hpp"
#include "realman_bt/move_j_node.hpp"

namespace realman_bt {

/**
 * Starts one MoveJ goal for l, m, and r in the same tree tick and completes
 * only after all three action results report success.
 */
class ThreeArmMoveJNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  using Action = realman_msgs::action::ExecuteMotion;
  using Client = rclcpp_action::Client<Action>;
  using GoalHandle = Client::GoalHandle;

  static bt_core::PortsList providedPorts();

  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  struct ArmState {
    const char* id{nullptr};
    Action::Goal goal{};
    Client::SharedPtr client;
    GoalHandle::SharedPtr goal_handle;
    std::shared_future<GoalHandle::SharedPtr> goal_future;
    std::shared_future<Client::WrappedResult> result_future;
    bool sent{false};
    bool completed{false};
    bool failed{false};
    bool cancel_requested{false};
    bool handed_off{false};
  };

  bool initialize();
  bool readGoals();
  bool allActionServersReady() const;
  bool processGoals();
  bool processResults();
  void requestCancel(ArmState& arm, const std::string& detail);
  bool handoff(ArmState& arm);
  void recordEvent(const ArmState& arm, const std::string& phase,
                   const std::string& detail,
                   const std::string& severity = "INFO") const;
  void fail(const std::string& reason);
  void reset();

  rclcpp::Node* ros_node_{nullptr};
  std::array<ArmState, 3> arms_{{ArmState{"l"}, ArmState{"m"}, ArmState{"r"}}};
  std::chrono::steady_clock::time_point started_at_{};
  double timeout_sec_{120.0};
  bool initialized_{false};
  bool dry_run_{true};
  bool dry_run_logged_{false};
  bool failed_{false};
  bool completed_{false};
};

}  // namespace realman_bt
