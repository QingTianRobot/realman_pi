#pragma once

#include "rclcpp/node.hpp"
#include "realman_bt/policy_task_config.hpp"

namespace realman_bt {

// Declares every `policy_task.*` parameter on the node (defaults are PolicyTaskConfig's), reads
// them, and validates the result. Throws std::invalid_argument naming the offending key. The
// values normally come from config/ros/policy_task.yaml through the executor's launch file.
PolicyTaskConfig declareAndLoadPolicyTaskConfig(rclcpp::Node& node);

}  // namespace realman_bt
