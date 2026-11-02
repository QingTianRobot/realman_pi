#pragma once

#include <exception>
#include <optional>
#include <string>
#include <utility>

#include "bt_core/blackboard.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_task_blackboard.hpp"
#include "realman_recording_msgs/msg/attempt_event.hpp"

namespace realman_bt {

// Policy attempts announced on /recording/attempt for the recorder: one START, then one RESULT.
// A grasp_check attempt that ends held is not over for the recorder: the tree then carries the
// object (WhileGraspHeld), and whether it arrives decides the attempt. PolicyRun leaves that
// attempt's RESULT on the blackboard under kPolicyCarriedAttemptKey and WhileGraspHeld sends it
// when the carry ends. An empty attempt_id there means no attempt is being carried.
inline constexpr char kAttemptTopic[] = "/recording/attempt";
inline constexpr char kPolicyCarriedAttemptKey[] = "__realman_bt_policy_carried_attempt__";

using AttemptEvent = realman_recording_msgs::msg::AttemptEvent;
using AttemptPublisher = rclcpp::Publisher<AttemptEvent>::SharedPtr;

inline AttemptPublisher createAttemptPublisher(rclcpp::Node& node) {
  // Reliable so the recorder never misses the START/RESULT pair of an attempt.
  return node.create_publisher<AttemptEvent>(kAttemptTopic, rclcpp::QoS(10).reliable());
}

// Stamps and publishes one event; a failure is only logged, the attempt goes on.
inline void publishAttemptEvent(const AttemptPublisher& publisher, AttemptEvent event,
                                const bt_core::Blackboard::Ptr& blackboard,
                                const std::string& node_name) {
  event.stamp = rclcpp::Clock(RCL_SYSTEM_TIME).now();
  try {
    publisher->publish(event);
  } catch (const std::exception& error) {
    recordPolicyEvent(blackboard, "WARN", node_name, "attempt_event", error.what());
  }
}

inline void handOverCarriedAttempt(const bt_core::Blackboard::Ptr& blackboard, AttemptEvent result) {
  blackboard->set<AttemptEvent>(kPolicyCarriedAttemptKey, std::move(result));
}

// The carried attempt's pending RESULT, removed from the blackboard; nullopt when none waits.
inline std::optional<AttemptEvent> takeCarriedAttempt(const bt_core::Blackboard::Ptr& blackboard) {
  auto event = blackboard->get<AttemptEvent>(kPolicyCarriedAttemptKey);
  if (!event.has_value() || event->attempt_id.empty()) return std::nullopt;
  blackboard->set<AttemptEvent>(kPolicyCarriedAttemptKey, AttemptEvent());
  return event;
}

}  // namespace realman_bt
