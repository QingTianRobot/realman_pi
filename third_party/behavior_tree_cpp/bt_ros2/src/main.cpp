// ============================================================================
//  bt_ros2/src/main.cpp
//  bt_executor 可执行入口 —— 初始化 rclcpp，spin 一个 BtExecutorNode。
// ============================================================================
#include <memory>

#include "bt_ros2/bt_executor_node.hpp"
#include "rclcpp/rclcpp.hpp"

int main(int argc, char** argv) {
  // 1. 初始化 ROS2 客户端库（解析 --ros-args 等）。
  rclcpp::init(argc, argv);

  // 2. 构造执行器节点。构造期间会读取参数、注册节点、加载树并(默认)启动定时器。
  //    若 tree_file 缺失或 XML 非法，构造函数会抛异常——捕获后打印日志并退出，
  //    避免进程带着半初始化状态继续 spin。
  try {
    auto node = std::make_shared<bt_ros2::BtExecutorNode>();
    // 3. 单线程 spin：定时器回调(onTick) + topic 订阅回调都在此处被驱动。
    rclcpp::spin(node);
  } catch (const std::exception& e) {
    RCLCPP_FATAL(rclcpp::get_logger("bt_executor"),
                 "BtExecutorNode 启动失败: %s", e.what());
    rclcpp::shutdown();
    return 1;
  }

  // 4. 优雅关闭。
  rclcpp::shutdown();
  return 0;
}
