#include <functional>
#include <memory>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/joy.hpp"
#include "xbox_controller_driver/button_state_tracker.hpp"

namespace xbox_controller_driver
{

class XboxControllerNode : public rclcpp::Node
{
public:
  XboxControllerNode()
  : Node("xbox_controller"),
    button_names_(declare_parameter<std::vector<std::string>>(
        "button_names",
        {"a", "b", "x", "y", "view", "xbox", "menu", "left_stick", "right_stick",
          "left_bumper", "right_bumper", "dpad_up", "dpad_down", "dpad_left", "dpad_right",
          "share", "paddle_1", "paddle_2", "paddle_3", "paddle_4", "touchpad"})),
    tracker_(button_names_),
    log_releases_(declare_parameter<bool>("log_releases", true))
  {
    const auto joy_topic = declare_parameter<std::string>("joy_topic", "joy");
    subscription_ = create_subscription<sensor_msgs::msg::Joy>(
      joy_topic,
      rclcpp::SensorDataQoS(),
      std::bind(&XboxControllerNode::on_joy, this, std::placeholders::_1));

    std::ostringstream names;
    for (std::size_t index = 0; index < button_names_.size(); ++index) {
      if (index > 0) {
        names << ", ";
      }
      names << index << '=' << button_names_[index];
    }
    RCLCPP_INFO(
      get_logger(), "Xbox controller input ready on '%s'. Buttons: %s",
      subscription_->get_topic_name(), names.str().c_str());
  }

private:
  void on_joy(const sensor_msgs::msg::Joy::SharedPtr message)
  {
    for (const auto & event : tracker_.update(message->buttons)) {
      if (!event.pressed && !log_releases_) {
        continue;
      }
      RCLCPP_INFO(
        get_logger(), "button[%zu] %s %s", event.index, event.name.c_str(),
        event.pressed ? "PRESSED" : "RELEASED");
    }
  }

  std::vector<std::string> button_names_;
  ButtonStateTracker tracker_;
  bool log_releases_;
  rclcpp::Subscription<sensor_msgs::msg::Joy>::SharedPtr subscription_;
};

}  // namespace xbox_controller_driver

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<xbox_controller_driver::XboxControllerNode>());
  rclcpp::shutdown();
  return 0;
}
