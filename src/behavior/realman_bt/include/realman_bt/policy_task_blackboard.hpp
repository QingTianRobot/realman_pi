#pragma once

#include <chrono>
#include <cstdint>
#include <stdexcept>
#include <string>

#include "bt_core/blackboard.hpp"
#include "rclcpp/node.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "realman_bt/retry_unless_fault_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"

namespace realman_bt {

inline const PolicyTaskConfig& requirePolicyTaskConfig(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<const PolicyTaskConfig*>(kPolicyTaskConfigBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error("policy task configuration is missing from blackboard");
  }
  return *value.value();
}

inline rclcpp::Node& requireRosNode(const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<rclcpp::Node*>(kRosNodeBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error("behavior tree ROS node handle is missing from blackboard");
  }
  return *value.value();
}

// Records why the last attempt failed. A retryable failure only needs this; a fault also sets
// policy_fault so RetryUnlessFault stops retrying.
inline void recordPolicyFailureReason(const bt_core::Blackboard::Ptr& blackboard,
                                      const std::string& reason) {
  blackboard->set<std::string>(kPolicyFailureReasonKey, reason);
}

inline void raisePolicyFault(const bt_core::Blackboard::Ptr& blackboard,
                             const std::string& reason) {
  recordPolicyFailureReason(blackboard, reason);
  blackboard->set<bool>(kPolicyFaultKey, true);
}

inline void recordPolicyEvent(const bt_core::Blackboard::Ptr& blackboard,
                              const std::string& severity, const std::string& interface_name,
                              const std::string& phase, const std::string& detail) {
  const auto diagnostics =
      blackboard->get<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey);
  if (!diagnostics.has_value() || diagnostics.value() == nullptr) return;
  const auto now = std::chrono::system_clock::now().time_since_epoch();
  diagnostics.value()->recordEvent(
      {static_cast<std::uint64_t>(
           std::chrono::duration_cast<std::chrono::milliseconds>(now).count()),
       severity, "EXECUTOR", interface_name, phase, detail});
}

}  // namespace realman_bt
