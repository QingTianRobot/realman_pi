// ============================================================================
//  examples/03_function_registry_recharge.cpp
//  示例 3：单例 + 工厂 + "生成器引用函数" 三种设计模式的完整回充演示。
//
//  这个示例回答一个非常具体的问题：
//    "我要做回充：从外部（ROS2 msg 形式）拿到电量数据，
//     然后怎么通过调用来完成回充？"
//
//  为了让示例在没有 ROS2 的机器上也能真实跑通、真实验证，这里用一个
//  普通 C++ 结构体 BatteryMsg 模拟 `sensor_msgs/BatteryState`，用一个
//  自由函数 pollBatteryFromRos() 模拟"从 ROS2 topic 回调里拿到最新一帧"。
//  在真实项目里，你只要把 pollBatteryFromRos() 换成 bt_ros2 的
//  RosInputNode（订阅 /battery_state 并 setOutput 到黑板）即可，业务
//  逻辑（本文件注册到 FunctionRegistry 的那些函数）完全不用改。
//
//  三种设计模式在这里的落点：
//    1. 单例   Singleton  : FunctionRegistry::instance() —— 全局唯一的业务
//                           函数注册表。程序启动时把函数登记进去，任何地方
//                           都能按名取用。
//    2. 工厂   Factory    : NodeFactory —— 按注册名创建节点实例，行为树的
//                           XML/编辑器/插件都通过它建树，节点实现与使用解耦。
//    3. 生成器引用函数
//       Generator + fn ref: 把"读电量""判断低电""发回充命令""通知完成"写成
//                           普通函数/lambda（生成器：可捕获状态、可复用），
//                           注册到单例表后，行为树 XML 只用函数名引用它们，
//                           不和任何具体节点类耦合。改业务只改函数，不动树。
//
//  只依赖 bt::core + bt_nodes 的头（FunctionRegistry 是 header-only）。
// ============================================================================
#include <iostream>
#include <string>

#include "bt_core/blackboard.hpp"
#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "bt_core/xml_parser.hpp"
#include "control/sequence_node.hpp"
#include "control/fallback_node.hpp"
#include "data/compare_blackboard_node.hpp"
#include "function/function_registry.hpp"

using namespace bt_core;
using bt_nodes::FunctionContext;
using bt_nodes::FunctionRegistry;

// ============================================================================
//  1) 模拟"外部 ROS2 数据源"
//
//  BatteryMsg 对应 sensor_msgs/BatteryState 里我们关心的字段。
//  pollBatteryFromRos() 模拟 ROS2 订阅回调缓存的"最新一帧电量"。真实项目
//  里这一步由 bt_ros2::ReadBattery（RosInputNode<BatteryState>）完成：它
//  订阅 /battery_state，在 onData 里把 percentage 写进黑板 key battery_level。
// ============================================================================
struct BatteryMsg {
  double percentage{1.0};  // 0.0 ~ 1.0
};

// 用一个可变的"最新帧"模拟 topic：外部世界改它，行为树来读它。
static BatteryMsg g_latest_battery{/*percentage=*/0.12};  // 默认 12%，低电量

BatteryMsg pollBatteryFromRos() { return g_latest_battery; }

// ============================================================================
//  2) 业务逻辑：写成普通函数（"生成器引用函数"）
//
//  它们的签名就是 FunctionRegistry 约定的 ActionFunction / ConditionFunction。
//  通过 ctx.blackboard 读写共享黑板，实现节点之间的数据流。
// ============================================================================

// 动作：读电量 → 写黑板 battery_level。等价于 ROS2 的 ReadBattery 节点。
NodeStatus readBatteryFn(const FunctionContext& ctx) {
  const BatteryMsg msg = pollBatteryFromRos();
  ctx.blackboard->set<double>("battery_level", msg.percentage);
  std::cout << "  [readBattery] 从(模拟)ROS2 /battery_state 读到电量="
            << msg.percentage * 100.0 << "%\n";
  return NodeStatus::SUCCESS;
}

// 条件：电量是否低于 20%（低电量需要回充）。
bool isLowBatteryFn(const FunctionContext& ctx) {
  const auto level = ctx.blackboard->get<double>("battery_level");
  const double v = level.value_or(1.0);
  const bool low = v < 0.20;
  std::cout << "  [isLowBattery] battery_level=" << v * 100.0 << "% -> "
            << (low ? "低电量, 需要回充" : "电量充足") << "\n";
  return low;
}

// 动作：发布回充命令。等价于 ROS2 的 PublishRechargeCommand 节点。
NodeStatus sendRechargeCommandFn(const FunctionContext& ctx) {
  const std::string target =
      ctx.blackboard->get<std::string>("dock_target").value_or("main_dock");
  std::cout << "  [sendRechargeCommand] 向(模拟)ROS2 /robot/command 发布: "
            << "start_recharge:" << target << "\n";
  ctx.blackboard->set<std::string>("last_command", "start_recharge:" + target);
  return NodeStatus::SUCCESS;
}

// 动作：上报任务完成。等价于 ROS2 的 TaskDoneNotifier 节点。
NodeStatus notifyDoneFn(const FunctionContext& ctx) {
  std::cout << "  [notifyDone] 向(模拟)ROS2 /bt/task_done 上报: "
            << "task_done:recharge\n";
  ctx.blackboard->set<bool>("recharge_done", true);
  return NodeStatus::SUCCESS;
}

// ============================================================================
//  行为树 XML：只引用函数名，不出现任何业务类
//
//  语义（Fallback 回充守卫）：
//    先走"电量充足"分支：读电量 → CompareBlackboard 判断 >= 0.20；
//    该分支失败（电量低）时，落到"回充"分支：读电量 → FunctionCondition
//    判低电 → 发回充命令 → 通知完成。
// ============================================================================
static const char* kRechargeTreeXml = R"(<root main_tree_to_execute="RechargeTree">
  <BehaviorTree ID="RechargeTree">
    <Fallback name="battery_guard">
      <Sequence name="battery_ok">
        <FunctionAction name="read_battery_ok" function="readBattery"/>
        <CompareBlackboard name="enough_power"
                           key="battery_level" op="&gt;=" value="0.20"/>
      </Sequence>
      <Sequence name="recharge_flow">
        <FunctionAction    name="read_battery_low"  function="readBattery"/>
        <FunctionCondition name="needs_recharge"    function="isLowBattery"/>
        <FunctionAction    name="send_command"      function="sendRechargeCommand"/>
        <FunctionAction    name="notify_done"       function="notifyDone"/>
      </Sequence>
    </Fallback>
  </BehaviorTree>
</root>)";

int main() {
  // --------------------------------------------------------------------------
  //  单例：把业务函数登记进全局唯一的 FunctionRegistry。
  //  只在程序启动时登记一次；此后任何 FunctionAction/FunctionCondition
  //  节点都能按名取用。这里用自由函数，也可以用捕获状态的 lambda。
  // --------------------------------------------------------------------------
  auto& registry = FunctionRegistry::instance();
  registry.registerAction("readBattery", readBatteryFn);
  registry.registerAction("sendRechargeCommand", sendRechargeCommandFn);
  registry.registerAction("notifyDone", notifyDoneFn);
  registry.registerCondition("isLowBattery", isLowBatteryFn);

  std::cout << "已注册业务函数: " << registry.actionNames().size()
            << " 个动作, " << registry.conditionNames().size() << " 个条件\n\n";

  // --------------------------------------------------------------------------
  //  工厂：注册要用到的节点类型（控制/数据/函数节点）。
  //  行为树 XML 就是靠工厂按注册名把标签变成节点实例。
  // --------------------------------------------------------------------------
  NodeFactory factory;
  factory.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  factory.registerNodeType<bt_nodes::FallbackNode>("Fallback");
  factory.registerNodeType<bt_nodes::CompareBlackboardNode>("CompareBlackboard");
  factory.registerNodeType<bt_nodes::FunctionActionNode>("FunctionAction");
  factory.registerNodeType<bt_nodes::FunctionConditionNode>("FunctionCondition");

  auto runOnce = [&](const char* title, double percentage) {
    g_latest_battery.percentage = percentage;  // 改"外部世界"的最新一帧
    auto bb = Blackboard::create();
    bb->set<std::string>("dock_target", "main_dock");

    XmlParser parser(factory);
    Tree tree = parser.loadFromText(kRechargeTreeXml, bb);

    std::cout << "=== " << title << " ===\n";
    const NodeStatus result = tree.tickWhileRunning();
    std::cout << "根结果: " << toStr(result)
              << " | recharge_done="
              << (bb->get<bool>("recharge_done").value_or(false) ? "true"
                                                                 : "false")
              << "\n\n";
  };

  // 场景 A：电量充足 → 直接走 battery_ok 分支，不回充。
  runOnce("场景 A：电量 80%（充足）", 0.80);

  // 场景 B：电量不足 → 落到 recharge_flow 分支，完成回充闭环。
  runOnce("场景 B：电量 12%（低电量，触发回充）", 0.12);

  return 0;
}
