#pragma once

#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <future>
#include <functional>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "geometry_msgs/msg/twist_stamped.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "realman_msgs/action/cartesian_velocity.hpp"

namespace realman_bt {

struct CoordinateReference {
  std::uint8_t type{0};
  std::string controller_name;
  std::string ros_frame_id;
};

class CoordinateReferenceRegistry {
 public:
  CoordinateReferenceRegistry() = default;
  explicit CoordinateReferenceRegistry(const std::vector<std::string>& entries);

  const CoordinateReference& resolve(const std::string& arm_id,
                                     const std::string& reference) const;

 private:
  std::unordered_map<std::string, CoordinateReference> entries_;
};

struct CartesianVelocityProfile {
  std::uint32_t control_period_ms{20};
  std::uint32_t watchdog_ms{100};
  double max_linear_speed_mps{0.05};
  double max_angular_speed_radps{0.25};
  double max_linear_accel_mps2{0.10};
  double max_angular_accel_radps2{0.50};
  double goal_timeout_sec{10.0};
  double stop_timeout_sec{2.0};
};

class CartesianVelocityProfileRegistry {
 public:
  CartesianVelocityProfileRegistry() = default;
  explicit CartesianVelocityProfileRegistry(const std::vector<std::string>& entries);

  const CartesianVelocityProfile& resolve(const std::string& arm_id) const;

 private:
  std::unordered_map<std::string, CartesianVelocityProfile> entries_;
};

inline constexpr char kCoordinateReferenceRegistryBlackboardKey[] =
    "__realman_bt_coordinate_reference_registry__";
inline constexpr char kCartesianVelocityProfileRegistryBlackboardKey[] =
    "__realman_bt_cartesian_velocity_profile_registry__";

class CartesianVelocityCancellationDrain {
 public:
  using Action = realman_msgs::action::CartesianVelocity;
  using Client = rclcpp_action::Client<Action>;
  using GoalHandle = Client::GoalHandle;

  CartesianVelocityCancellationDrain(
      Client::SharedPtr client,
      std::shared_future<GoalHandle::SharedPtr> goal_future,
      std::string action_name, RuntimeDiagnostics* diagnostics);
  CartesianVelocityCancellationDrain(
      Client::SharedPtr client, GoalHandle::SharedPtr goal_handle,
      std::string action_name, RuntimeDiagnostics* diagnostics);

  bool drainOnce();

 private:
  void recordEvent(const std::string& phase, const std::string& detail,
                   const std::string& severity) const;

  Client::SharedPtr client_;
  std::shared_future<GoalHandle::SharedPtr> goal_future_;
  GoalHandle::SharedPtr goal_handle_;
  std::string action_name_;
  RuntimeDiagnostics* diagnostics_{nullptr};
};

using CartesianVelocityCancellationDrainSink =
    std::function<void(std::shared_ptr<CartesianVelocityCancellationDrain>)>;
inline constexpr char kCartesianVelocityCancellationDrainSinkBlackboardKey[] =
    "__realman_bt_cartesian_velocity_cancellation_drain_sink__";

class CartesianVelocityForDurationNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  using Action = realman_msgs::action::CartesianVelocity;
  using Client = rclcpp_action::Client<Action>;
  using GoalHandle = Client::GoalHandle;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  bool initialize();
  void readCommand();
  void startCommandTimer();
  void publishCommand(bool zero);
  void requestCancel(const std::string& detail);
  bool handoffPendingGoalResponse();
  bool handoffInFlightGoal();
  bool hasInFlightGoal() const;
  void recordEvent(const std::string& phase, const std::string& detail,
                   const std::string& severity = "INFO") const;
  void fail(const std::string& detail);
  void reset();

  rclcpp::Node* ros_node_{nullptr};
  const CoordinateReference* reference_{nullptr};
  const CartesianVelocityProfile* profile_{nullptr};
  Action::Goal goal_{};
  geometry_msgs::msg::TwistStamped command_{};
  Client::SharedPtr client_;
  GoalHandle::SharedPtr goal_handle_;
  std::shared_future<GoalHandle::SharedPtr> goal_future_;
  std::shared_future<Client::WrappedResult> result_future_;
  rclcpp::Publisher<geometry_msgs::msg::TwistStamped>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr command_timer_;
  std::string action_name_;
  std::string command_topic_;
  std::chrono::steady_clock::time_point initialized_at_{};
  std::chrono::steady_clock::time_point motion_started_at_{};
  double duration_sec_{0.0};
  bool initialized_{false};
  bool dry_run_{true};
  bool sent_{false};
  bool cancel_requested_{false};
  bool completed_{false};
  bool failed_{false};
  bool wait_server_recorded_{false};
  bool goal_response_timed_out_{false};
  std::atomic_bool duration_elapsed_{false};
};

}  // namespace realman_bt
