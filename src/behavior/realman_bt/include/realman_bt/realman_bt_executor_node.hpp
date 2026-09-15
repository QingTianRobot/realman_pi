#pragma once

#include <memory>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "rclcpp/rclcpp.hpp"
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

  bt_core::NodeFactory factory_;
  bt_core::Blackboard::Ptr blackboard_;
  std::unique_ptr<bt_core::Tree> tree_;
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr status_pub_;
  rclcpp::Service<Trigger>::SharedPtr start_service_;
  rclcpp::Service<Trigger>::SharedPtr stop_service_;
  double tick_rate_hz_{10.0};
  bool autostart_{true};
  bool stop_on_terminal_{true};
};

}  // namespace realman_bt
