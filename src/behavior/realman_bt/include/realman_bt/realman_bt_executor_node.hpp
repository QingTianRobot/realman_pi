#pragma once

#include <memory>
#include <cstdint>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rcl_interfaces/msg/log.hpp"
#include "std_msgs/msg/string.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace realman_bt {

class RealmanBtExecutorNode final : public rclcpp::Node {
 public:
  explicit RealmanBtExecutorNode(const rclcpp::NodeOptions& options = rclcpp::NodeOptions());
  ~RealmanBtExecutorNode() override;

 private:
  using Trigger = std_srvs::srv::Trigger;

  void start();
  void stop();
  void onTick();
  void handleStart(const std::shared_ptr<Trigger::Request>,
                   std::shared_ptr<Trigger::Response> response);
  void handleStop(const std::shared_ptr<Trigger::Request>,
                  std::shared_ptr<Trigger::Response> response);
  void recordEvent(std::string severity, std::string source,
                   std::string interface_name, std::string phase,
                   std::string detail);
  void handleRosout(const rcl_interfaces::msg::Log::SharedPtr message);

  bt_core::NodeFactory factory_;
  bt_core::Blackboard::Ptr blackboard_;
  std::unique_ptr<bt_core::Tree> tree_;
  RuntimeDiagnostics diagnostics_;
  std::unique_ptr<RuntimeSnapshotWriter> snapshot_writer_;
  std::string tree_id_;
  std::uint64_t snapshot_sequence_{0};
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr status_pub_;
  rclcpp::Service<Trigger>::SharedPtr start_service_;
  rclcpp::Service<Trigger>::SharedPtr stop_service_;
  rclcpp::Subscription<rcl_interfaces::msg::Log>::SharedPtr rosout_sub_;
  double tick_rate_hz_{10.0};
  bool autostart_{true};
  bool stop_on_terminal_{true};
};

}  // namespace realman_bt
