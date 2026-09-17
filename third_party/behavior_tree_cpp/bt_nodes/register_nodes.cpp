// ============================================================================
//  bt_nodes/register_nodes.cpp
//  内置标准节点插件的注册入口（唯一编译单元）。
//
//  说明：
//    本文件是 bt_nodes 动态库（libbt_nodes.dylib/.so/.dll）的唯一 .cpp。
//    所有节点都以头文件形式提供（纯虚函数实现 + 模板），这里集中 include 并
//    在 BT_REGISTER_NODES 入口里把它们全部注册进工厂。PluginLoader 运行时
//    加载本库 → dlsym 找到 BT_RegisterNodes 符号 → 调用 → 完成自注册。
// ============================================================================

#include "bt_core/plugin_register.hpp"

// -- 控制节点 ---------------------------------------------------------------
#include "control/sequence_node.hpp"
#include "control/fallback_node.hpp"
#include "control/parallel_node.hpp"

// -- 装饰节点 ---------------------------------------------------------------
#include "decorator/inverter_node.hpp"
#include "decorator/retry_node.hpp"
#include "decorator/repeat_node.hpp"
#include "decorator/force_success_node.hpp"
#include "decorator/force_failure_node.hpp"

// -- 动作/条件节点 ----------------------------------------------------------
#include "action/always_success_node.hpp"
#include "action/always_failure_node.hpp"
#include "action/print_message_node.hpp"

// -- 数据节点（黑板读写/比较/计数/冷却） ------------------------------------
#include "data/set_blackboard_node.hpp"
#include "data/compare_blackboard_node.hpp"
#include "data/check_bool_node.hpp"
#include "data/counter_node.hpp"
#include "data/cooldown_condition_node.hpp"
#include "data/set_bool_node.hpp"
#include "data/blackboard_exists_condition_node.hpp"
#include "data/clear_blackboard_node.hpp"
#include "data/scalar_threshold_condition_node.hpp"

// -- 时间节点（延时/到时） --------------------------------------------------
#include "timer/delay_node.hpp"
#include "timer/wait_until_elapsed_condition_node.hpp"

// -- 诊断节点（日志/埋点） --------------------------------------------------
#include "diagnostic/log_event_node.hpp"

// -- 函数节点（单例函数注册表 + XML 调用） ----------------------------------
#include "function/function_registry.hpp"

/**
 * @brief 插件注册入口：把全部内置标准节点注册进给定工厂。
 * @details 注册名即 XML 标签名 / 编辑器显示名，沿用 BehaviorTree.CPP 习惯命名。
 */
BT_REGISTER_NODES(factory) {
  // 控制节点
  factory.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  factory.registerNodeType<bt_nodes::FallbackNode>("Fallback");
  factory.registerNodeType<bt_nodes::ParallelNode>("Parallel");

  // 装饰节点
  factory.registerNodeType<bt_nodes::InverterNode>("Inverter");
  factory.registerNodeType<bt_nodes::RetryNode>("Retry");
  factory.registerNodeType<bt_nodes::RepeatNode>("Repeat");
  factory.registerNodeType<bt_nodes::ForceSuccessNode>("ForceSuccess");
  factory.registerNodeType<bt_nodes::ForceFailureNode>("ForceFailure");

  // 动作 / 条件节点
  factory.registerNodeType<bt_nodes::AlwaysSuccessNode>("AlwaysSuccess");
  factory.registerNodeType<bt_nodes::AlwaysFailureNode>("AlwaysFailure");
  factory.registerNodeType<bt_nodes::PrintMessageNode>("PrintMessage");

  // 数据节点（黑板读写 / 比较 / 计数 / 冷却）
  factory.registerNodeType<bt_nodes::SetBlackboardNode>("SetBlackboard");
  factory.registerNodeType<bt_nodes::CompareBlackboardNode>("CompareBlackboard");
  factory.registerNodeType<bt_nodes::CheckBoolNode>("CheckBool");
  factory.registerNodeType<bt_nodes::CounterNode>("Counter");
  factory.registerNodeType<bt_nodes::CooldownConditionNode>("CooldownCondition");
  factory.registerNodeType<bt_nodes::SetBoolNode>("SetBool");
  factory.registerNodeType<bt_nodes::BlackboardExistsConditionNode>("BlackboardExists");
  factory.registerNodeType<bt_nodes::ClearBlackboardNode>("ClearBlackboard");
  factory.registerNodeType<bt_nodes::ScalarThresholdConditionNode>("ScalarThreshold");

  // 时间节点（延时 / 到时）
  factory.registerNodeType<bt_nodes::DelayNode>("Delay");
  factory.registerNodeType<bt_nodes::WaitUntilElapsedConditionNode>("WaitUntilElapsed");

  // 诊断节点（日志 / 埋点）
  factory.registerNodeType<bt_nodes::LogEventNode>("LogEvent");

  // 函数节点（把常用 C++ 函数/lambda 注册到单例表后，通过 XML 调用）
  factory.registerNodeType<bt_nodes::FunctionActionNode>("FunctionAction");
  factory.registerNodeType<bt_nodes::FunctionConditionNode>("FunctionCondition");
}
