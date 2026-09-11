#ifndef BT_ROS2_ROS_QOS_HPP
#define BT_ROS2_ROS_QOS_HPP

#include <cstddef>
#include <stdexcept>
#include <string>

#include "rclcpp/rclcpp.hpp"

namespace bt_ros2 {

inline rclcpp::QoS makeSubscriptionQos(int depth,
                                       const std::string& profile) {
  if (depth <= 0) {
    throw std::runtime_error(
        "Subscription QoS depth must be greater than zero, got " +
        std::to_string(depth));
  }

  const auto queue_depth = static_cast<std::size_t>(depth);
  if (profile == "default") {
    return rclcpp::QoS(rclcpp::KeepLast(queue_depth));
  }
  if (profile == "sensor_data") {
    rclcpp::SensorDataQoS qos;
    qos.keep_last(queue_depth);
    return qos;
  }

  throw std::runtime_error(
      "Unknown subscription QoS profile '" + profile +
      "'; expected 'default' or 'sensor_data'");
}

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_QOS_HPP
