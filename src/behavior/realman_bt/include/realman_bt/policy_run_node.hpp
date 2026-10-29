#pragma once

#include <atomic>
#include <chrono>
#include <map>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "diagnostic_msgs/msg/diagnostic_array.hpp"
#include "geometry_msgs/msg/twist_stamped.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_supervisor.hpp"
#include "realman_bt/policy_trace.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "realman_recording_msgs/msg/attempt_event.hpp"
#include "sensor_msgs/msg/joint_state.hpp"
#include "std_msgs/msg/bool.hpp"
#include "std_msgs/msg/float32.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_msgs/msg/string.hpp"
#include "std_srvs/srv/set_bool.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace realman_bt {

// Runs and supervises one attempt of one policy task: checks that everything it needs is there,
// switches the bridge to the task's prompt and waits until /policy/stats reports it, starts the
// bridge (activation: auto) or waits for an operator to (activation: operator), judges the attempt
// with PolicySupervisor using the task's completion, and always stops the bridge in the same order
// before it returns: /policy/deactivate, /policy/emergency_stop, /policy_router/emergency_stop,
// then it waits for the router to release the velocity session so the next step cannot fight it.
// `task` names an entry of policy_task.tasks (config/ros/policy_task.yaml).
//
//   SUCCESS  release_over_bin: the object was released over the bin; lift_and_hold: it was lifted
//            and is still held (the gripper stays closed on it).
//   FAILURE  with policy_fault unset: a retryable failure (empty grasp, dropped, timeout, stall).
//   FAILURE  with policy_timeout set: the policy server or its bridge timed out (the bridge paused
//            itself after its inference requests timed out, went silent, did not get ready within
//            service_wait_sec, or /policy/activate did not answer); RetryUnlessFault retries it on
//            the timeout budget after a wait.
//   FAILURE  with policy_fault set: nothing should retry (unsafe, broken, or the wrong task).
//
// It writes policy_attempt_result, policy_grasp_verdict, policy_attempt_sec, policy_armed and, on
// FAILURE, policy_failure_reason. halt() sends the stop calls without waiting, so nothing keeps
// driving when the router switches away from the policy branch. dry_run=true only records what
// would be supervised: no subscriptions, no service calls.
//
// Each attempt is announced on /recording/attempt for the recorder: START once the preflight has
// passed (the id is the attempt's trace file name), then exactly one RESULT when it ends or is
// halted. A dry run or a failed preflight announces nothing.
class PolicyRunNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  using Clock = std::chrono::steady_clock;
  using SetBool = std_srvs::srv::SetBool;
  using Trigger = std_srvs::srv::Trigger;

  enum class Phase { kIdle, kPreflight, kArming, kRunning, kStopping };

  // What the preflight still waits for; bridge_only when every item is the policy bridge itself.
  struct Missing {
    std::string text;
    bool bridge_only{true};
  };

  struct CallState {
    std::atomic<bool> done{false};
    std::atomic<bool> success{false};
    std::string message;  // written before `done` is set
  };

  void initialize();
  void resetAttempt();
  double nowSec() const;
  Missing missingForStart(Clock::time_point now) const;
  bt_core::NodeStatus tickPreflight(Clock::time_point now);
  bt_core::NodeStatus tickArming(Clock::time_point now);
  bt_core::NodeStatus tickRunning(Clock::time_point now);
  bt_core::NodeStatus tickStopping(Clock::time_point now);
  void arm(Clock::time_point now);
  void beginStopping(const Verdict& verdict);
  bt_core::NodeStatus finalize();
  void openTrace();
  void writeTraceRow(const char* phase, Clock::time_point now, bool force);
  bt_core::NodeStatus failWithoutStopping(AttemptOutcome outcome, const std::string& reason);
  std::shared_ptr<CallState> sendSetBool(
      const rclcpp::Client<SetBool>::SharedPtr& client, bool data);
  std::shared_ptr<CallState> sendTrigger(const rclcpp::Client<Trigger>::SharedPtr& client);
  void sendStopsWithoutWaiting();
  void publishPrompt(Clock::time_point now);
  void publishAttemptStart();
  void publishAttemptResult(const std::string& outcome, bool succeeded, const std::string& reason);

  const PolicyTaskConfig* config_{nullptr};
  std::string arm_;
  std::string task_name_;
  PolicyTaskConfig::Task task_;
  std::string gripper_;
  rclcpp::Node* ros_node_{nullptr};

  std::vector<rclcpp::SubscriptionBase::SharedPtr> subscriptions_;
  rclcpp::Client<SetBool>::SharedPtr activate_;
  rclcpp::Client<SetBool>::SharedPtr deactivate_;
  rclcpp::Client<Trigger>::SharedPtr bridge_estop_;
  rclcpp::Client<Trigger>::SharedPtr router_estop_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr prompt_pub_;
  Clock::time_point prompt_sent_at_{};
  rclcpp::Publisher<realman_recording_msgs::msg::AttemptEvent>::SharedPtr attempt_pub_;
  std::string attempt_id_;
  bool attempt_announced_{false};  // a START went out and its RESULT has not

  mutable std::mutex mutex_;  // supervisor_, stats_, bridge_prompt_, torque_ and the arrival times
  std::unique_ptr<PolicySupervisor> supervisor_;
  BridgeStats stats_;
  bool stats_valid_{false};
  bool bridge_prompt_valid_{false};  // the bridge's stats carry a "prompt" value
  std::string bridge_prompt_;
  Clock::time_point stats_at_{};
  std::map<std::string, Clock::time_point> joints_at_;
  Clock::time_point gripper_at_{};
  bool gripper_valid_{false};
  bool torque_reached_{false};

  Phase phase_{Phase::kIdle};
  Clock::time_point phase_started_{};
  bool stop_needed_{false};
  std::shared_ptr<CallState> activate_call_;
  Clock::time_point activate_sent_at_{};
  Verdict pending_;
  int stop_step_{0};
  std::shared_ptr<CallState> stop_call_;
  Clock::time_point stop_sent_at_{};
  Clock::time_point release_started_{};
  bool dry_run_logged_{false};

  PolicyTraceWriter trace_;
  Clock::time_point trace_row_at_{};
};

}  // namespace realman_bt
