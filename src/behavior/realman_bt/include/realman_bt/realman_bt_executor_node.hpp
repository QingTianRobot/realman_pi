#pragma once

#include <memory>
#include <cstdint>
#include <optional>
#include <string>
#include <vector>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "realman_bt/cartesian_velocity_for_duration_node.hpp"
#include "realman_bt/input_mode.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "realman_bt/terminal_exit_policy.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rcl_interfaces/msg/log.hpp"
#include "realman_msgs/msg/input_mode_state.hpp"
#include "realman_msgs/srv/list_input_modes.hpp"
#include "realman_msgs/srv/select_input_mode.hpp"
#include "std_msgs/msg/string.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace realman_bt {

class MoveJCancellationDrain;

class RealmanBtExecutorNode final : public rclcpp::Node {
 public:
  explicit RealmanBtExecutorNode(const rclcpp::NodeOptions& options = rclcpp::NodeOptions());
  ~RealmanBtExecutorNode() override;

  int exitCode() const { return terminal_exit_policy_.exitCode(); }

 private:
  using Trigger = std_srvs::srv::Trigger;
  using InputModeState = realman_msgs::msg::InputModeState;
  using ListInputModes = realman_msgs::srv::ListInputModes;
  using SelectInputMode = realman_msgs::srv::SelectInputMode;

  void start();
  void stop();
  void onTick();
  void flushSnapshot();
  void enqueueCancellationDrain(std::shared_ptr<MoveJCancellationDrain> drain);
  void enqueueCartesianVelocityCancellationDrain(
      std::shared_ptr<CartesianVelocityCancellationDrain> drain);
  void drainCancellationQueue();
  std::size_t pendingCancellationCount() const;
  void requestProcessExitIfReady();
  void handleStart(const std::shared_ptr<Trigger::Request>,
                   std::shared_ptr<Trigger::Response> response);
  void handleStop(const std::shared_ptr<Trigger::Request>,
                  std::shared_ptr<Trigger::Response> response);
  void publishInputModeState();
  void handleListInputModes(const std::shared_ptr<ListInputModes::Request>,
                           std::shared_ptr<ListInputModes::Response> response);
  void handleSelectInputMode(const std::shared_ptr<SelectInputMode::Request> request,
                            std::shared_ptr<SelectInputMode::Response> response);
  void recordEvent(std::string severity, std::string source,
                   std::string interface_name, std::string phase,
                   std::string detail);
  void handleRosout(const rcl_interfaces::msg::Log::SharedPtr message);

  bt_core::NodeFactory factory_;
  bt_core::Blackboard::Ptr blackboard_;
  InputModeRegistry input_mode_registry_;
  std::unique_ptr<InputModeCoordinator> input_mode_coordinator_;
  std::optional<InputModeSnapshot> last_published_input_mode_;
  std::unique_ptr<bt_core::Tree> tree_;
  RuntimeDiagnostics diagnostics_;
  CoordinateReferenceRegistry coordinate_reference_registry_;
  CartesianVelocityProfileRegistry cartesian_velocity_profile_registry_;
  std::unique_ptr<RuntimeSnapshotWriter> snapshot_writer_;
  std::string tree_id_;
  std::uint64_t snapshot_sequence_{0};
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr status_pub_;
  rclcpp::Publisher<InputModeState>::SharedPtr input_mode_state_pub_;
  rclcpp::Service<ListInputModes>::SharedPtr list_input_modes_service_;
  rclcpp::Service<SelectInputMode>::SharedPtr select_input_mode_service_;
  rclcpp::Service<Trigger>::SharedPtr start_service_;
  rclcpp::Service<Trigger>::SharedPtr stop_service_;
  rclcpp::Subscription<rcl_interfaces::msg::Log>::SharedPtr rosout_sub_;
  rclcpp::TimerBase::SharedPtr cancellation_drain_timer_;
  std::vector<std::shared_ptr<MoveJCancellationDrain>> cancellation_drains_;
  std::vector<std::shared_ptr<CartesianVelocityCancellationDrain>>
      cartesian_velocity_cancellation_drains_;
  double tick_rate_hz_{10.0};
  bool autostart_{true};
  bool stop_on_terminal_{true};
  TerminalExitPolicy terminal_exit_policy_{false};
};

}  // namespace realman_bt
