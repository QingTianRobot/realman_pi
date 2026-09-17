// ============================================================================
//  bt_ros2/src/node_registration.cpp
//  默认节点注册器实现。
// ============================================================================
#include "bt_ros2/node_registration.hpp"

#include "bt_ros2/example_data_nodes.hpp"
#include "bt_ros2/recharge_task.hpp"
#include "bt_ros2/ros_topic_action_node.hpp"
#include "bt_ros2/ros_topic_condition_node.hpp"

#include "bt_nodes/action/always_failure_node.hpp"
#include "bt_nodes/action/always_success_node.hpp"
#include "bt_nodes/action/print_message_node.hpp"
#include "bt_nodes/control/fallback_node.hpp"
#include "bt_nodes/control/parallel_node.hpp"
#include "bt_nodes/control/sequence_node.hpp"
#include "bt_nodes/data/check_bool_node.hpp"
#include "bt_nodes/data/blackboard_exists_condition_node.hpp"
#include "bt_nodes/data/clear_blackboard_node.hpp"
#include "bt_nodes/data/compare_blackboard_node.hpp"
#include "bt_nodes/data/cooldown_condition_node.hpp"
#include "bt_nodes/data/counter_node.hpp"
#include "bt_nodes/data/scalar_threshold_condition_node.hpp"
#include "bt_nodes/data/set_blackboard_node.hpp"
#include "bt_nodes/data/set_bool_node.hpp"
#include "bt_nodes/decorator/force_failure_node.hpp"
#include "bt_nodes/decorator/force_success_node.hpp"
#include "bt_nodes/decorator/inverter_node.hpp"
#include "bt_nodes/decorator/repeat_node.hpp"
#include "bt_nodes/decorator/retry_node.hpp"
#include "bt_nodes/diagnostic/log_event_node.hpp"
#include "bt_nodes/function/function_registry.hpp"
#include "bt_nodes/timer/delay_node.hpp"
#include "bt_nodes/timer/wait_until_elapsed_condition_node.hpp"

namespace bt_ros2 {
namespace {

template <typename T>
void registerIfMissing(bt_core::NodeFactory& factory, const std::string& name) {
  if (!factory.isRegistered(name)) {
    factory.registerNodeType<T>(name);
  }
}

std::vector<NodeRegistrationFn> defaultRegistrations() {
  return {registerBtNodes, registerRosTopicNodes, registerRosDataNodes,
          registerRechargeNodes};
}

}  // namespace

void registerBtNodes(bt_core::NodeFactory& factory) {
  registerIfMissing<bt_nodes::SequenceNode>(factory, "Sequence");
  registerIfMissing<bt_nodes::FallbackNode>(factory, "Fallback");
  registerIfMissing<bt_nodes::ParallelNode>(factory, "Parallel");

  registerIfMissing<bt_nodes::InverterNode>(factory, "Inverter");
  registerIfMissing<bt_nodes::RetryNode>(factory, "Retry");
  registerIfMissing<bt_nodes::RepeatNode>(factory, "Repeat");
  registerIfMissing<bt_nodes::ForceSuccessNode>(factory, "ForceSuccess");
  registerIfMissing<bt_nodes::ForceFailureNode>(factory, "ForceFailure");

  registerIfMissing<bt_nodes::AlwaysSuccessNode>(factory, "AlwaysSuccess");
  registerIfMissing<bt_nodes::AlwaysFailureNode>(factory, "AlwaysFailure");
  registerIfMissing<bt_nodes::PrintMessageNode>(factory, "PrintMessage");

  registerIfMissing<bt_nodes::SetBlackboardNode>(factory, "SetBlackboard");
  registerIfMissing<bt_nodes::CompareBlackboardNode>(factory, "CompareBlackboard");
  registerIfMissing<bt_nodes::CheckBoolNode>(factory, "CheckBool");
  registerIfMissing<bt_nodes::CounterNode>(factory, "Counter");
  registerIfMissing<bt_nodes::CooldownConditionNode>(factory, "CooldownCondition");
  registerIfMissing<bt_nodes::SetBoolNode>(factory, "SetBool");
  registerIfMissing<bt_nodes::BlackboardExistsConditionNode>(
      factory, "BlackboardExists");
  registerIfMissing<bt_nodes::ClearBlackboardNode>(factory, "ClearBlackboard");
  registerIfMissing<bt_nodes::ScalarThresholdConditionNode>(
      factory, "ScalarThreshold");

  registerIfMissing<bt_nodes::DelayNode>(factory, "Delay");
  registerIfMissing<bt_nodes::WaitUntilElapsedConditionNode>(
      factory, "WaitUntilElapsed");

  registerIfMissing<bt_nodes::LogEventNode>(factory, "LogEvent");

  registerIfMissing<bt_nodes::FunctionActionNode>(factory, "FunctionAction");
  registerIfMissing<bt_nodes::FunctionConditionNode>(factory, "FunctionCondition");
}

void registerRosTopicNodes(bt_core::NodeFactory& factory) {
  registerIfMissing<RosTopicConditionNode>(factory, "RosTopicCondition");
  registerIfMissing<RosTopicActionNode>(factory, "RosTopicAction");
}

void registerRosDataNodes(bt_core::NodeFactory& factory) {
  registerIfMissing<IsObstacleClose>(factory, "IsObstacleClose");
  registerIfMissing<IsFlagTrue>(factory, "IsFlagTrue");
  registerIfMissing<ReadBattery>(factory, "ReadBattery");
  registerIfMissing<ReadScalar>(factory, "ReadScalar");
}

void registerRechargeNodes(bt_core::NodeFactory& factory) {
  registerIfMissing<IsDocked>(factory, "IsDocked");
  registerIfMissing<PublishRechargeCommand>(factory, "PublishRechargeCommand");
  registerIfMissing<TaskDoneNotifier>(factory, "TaskDoneNotifier");
  registerIfMissing<RechargeTask>(factory, "RechargeTask");
}

NodeRegistrationCatalog& NodeRegistrationCatalog::instance() {
  static NodeRegistrationCatalog catalog;
  return catalog;
}

NodeRegistrationCatalog::NodeRegistrationCatalog()
    : registrations_(defaultRegistrations()) {}

void NodeRegistrationCatalog::add(NodeRegistrationFn fn) {
  if (!fn) return;
  std::lock_guard<std::mutex> lock(mutex_);
  registrations_.push_back(fn);
}

std::vector<NodeRegistrationFn> NodeRegistrationCatalog::snapshot() const {
  std::lock_guard<std::mutex> lock(mutex_);
  return registrations_;
}

void NodeRegistrationCatalog::resetToDefaults() {
  std::lock_guard<std::mutex> lock(mutex_);
  registrations_ = defaultRegistrations();
}

void registerDefaultNodes(bt_core::NodeFactory& factory) {
  for (const auto fn : NodeRegistrationCatalog::instance().snapshot()) {
    fn(factory);
  }
}

}  // namespace bt_ros2
