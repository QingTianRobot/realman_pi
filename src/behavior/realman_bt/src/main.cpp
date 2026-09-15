#include <memory>

#include "realman_bt/realman_bt_executor_node.hpp"
#include "rclcpp/rclcpp.hpp"

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  try {
    auto node = std::make_shared<realman_bt::RealmanBtExecutorNode>();
    rclcpp::spin(node);
  } catch (const std::exception& error) {
    RCLCPP_FATAL(rclcpp::get_logger("realman_bt_executor"), "startup failed: %s", error.what());
    rclcpp::shutdown();
    return 1;
  }
  rclcpp::shutdown();
  return 0;
}
