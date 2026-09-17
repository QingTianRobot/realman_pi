#include <memory>

#include "realman_bt/realman_bt_executor_node.hpp"
#include "rclcpp/rclcpp.hpp"

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  int exit_code = 0;
  try {
    auto node = std::make_shared<realman_bt::RealmanBtExecutorNode>();
    rclcpp::spin(node);
    exit_code = node->exitCode();
  } catch (const std::exception& error) {
    RCLCPP_FATAL(rclcpp::get_logger("realman_bt_executor"), "startup failed: %s", error.what());
    exit_code = 1;
  }
  if (rclcpp::ok()) rclcpp::shutdown();
  return exit_code;
}
