#pragma once

#include <array>
#include <future>
#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/cartesian_velocity_for_duration_node.hpp"
#include "realman_msgs/srv/select_frame.hpp"

namespace realman_bt {

class PrepareKeyboardWorkNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;
  using SelectFrame = realman_msgs::srv::SelectFrame;
  using Client = rclcpp::Client<SelectFrame>;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  struct ArmState {
    std::string id;
    std::string service_name;
    std::string expected_work;
    Client::SharedPtr client;
    std::shared_future<SelectFrame::Response::SharedPtr> future;
    bool request_sent{false};
    bool completed{false};
    bool wait_recorded{false};
  };

  void initialize();
  bool pollArm(ArmState& arm);
  void fail(const std::string& detail);
  void recordEvent(const ArmState& arm, const std::string& phase,
                   const std::string& detail,
                   const std::string& severity = "INFO") const;
  void reset();

  rclcpp::Node* ros_node_{nullptr};
  std::array<ArmState, 2> arms_{{
      {"l", "/l/coordinates/select_work", "", nullptr, {}, false, false,
       false},
      {"r", "/r/coordinates/select_work", "", nullptr, {}, false, false,
       false},
  }};
  bool initialized_{false};
  bool dry_run_{true};
  bool completed_{false};
  bool failed_{false};
};

}  // namespace realman_bt
