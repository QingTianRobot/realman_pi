// ============================================================================
//  tests/test_data_nodes.cpp
//  数据层单元测试(GoogleTest)。
//
//  覆盖两块互相独立、均为 ROS-free 的纯逻辑：
//    A) bt_ros2/data_freshness.hpp —— isFresh / dataAgeMs 的时效判定纯函数
//       (只依赖 <chrono>，不依赖 rclcpp，可本机直接编译)。
//    B) bt_nodes/data/*.hpp —— 6 个 header-only 数据节点(依赖 bt_core)：
//       SetBlackboard / CompareBlackboard / CheckBool / Counter /
//       CooldownCondition / SetBool。
//    C) bt_nodes/function/*.hpp —— 单例函数注册表 + FunctionAction /
//       FunctionCondition，用普通 C++ 函数/lambda 承载高频业务能力。
//
//  说明：
//    - data_freshness 与 bt_nodes/data 均为 header-only，本测试只需 include 头
//      文件 + link bt::core，不需要 link bt_ros2 库(那个需要 ROS2)。
//    - 数据节点通过 NodeConfig.port_values 注入“字面量端口值”，再直接构造节点
//      实例 executeTick()，等价于 XML 字面量端口的运行路径。
// ============================================================================
#include <gtest/gtest.h>

#include <chrono>
#include <memory>
#include <string>
#include <thread>

#include "bt_core/blackboard.hpp"
#include "bt_core/node_factory.hpp"
#include "bt_core/node_status.hpp"
#include "bt_core/tree_node.hpp"

// 被测的纯逻辑头文件。
#include "bt_ros2/data_freshness.hpp"

// 被测的 6 个 header-only 数据节点。
#include "data/check_bool_node.hpp"
#include "data/compare_blackboard_node.hpp"
#include "data/cooldown_condition_node.hpp"
#include "data/counter_node.hpp"
#include "data/set_blackboard_node.hpp"
#include "data/set_bool_node.hpp"
// 新增：黑板存在性 / 清除 / 标量阈值 + 时间 / 诊断节点。
#include "data/blackboard_exists_condition_node.hpp"
#include "data/clear_blackboard_node.hpp"
#include "data/scalar_threshold_condition_node.hpp"
#include "timer/delay_node.hpp"
#include "timer/wait_until_elapsed_condition_node.hpp"
#include "diagnostic/log_event_node.hpp"
#include "function/function_registry.hpp"

using bt_core::Blackboard;
using bt_core::NodeConfig;
using bt_core::NodeStatus;

// ============================================================================
//  A) data_freshness 纯逻辑 —— isFresh / dataAgeMs
// ============================================================================

namespace {
using bt_ros2::SteadyTime;

/// 基准时刻 + 偏移(毫秒)，构造便于推理的 steady_clock 时间点。
SteadyTime base() { return SteadyTime{}; }
SteadyTime atMs(long ms) {
  return SteadyTime{} + std::chrono::milliseconds(ms);
}
}  // namespace

TEST(DataFreshness, NeverReceivedIsNotFresh) {
  // 从未收到过任何数据 → 无论窗口多大都不新鲜。
  EXPECT_FALSE(bt_ros2::isFresh(/*received=*/false, base(), atMs(0), 1000));
  EXPECT_FALSE(bt_ros2::isFresh(/*received=*/false, base(), atMs(0), 0));
  EXPECT_FALSE(bt_ros2::isFresh(/*received=*/false, base(), atMs(0), -5));
}

TEST(DataFreshness, NonPositiveTimeoutMeansNeverExpire) {
  // timeout <= 0 且收到过 → 永不过期，恒新鲜(即使数据已“很老”)。
  EXPECT_TRUE(bt_ros2::isFresh(/*received=*/true, atMs(0), atMs(1'000'000), 0));
  EXPECT_TRUE(bt_ros2::isFresh(/*received=*/true, atMs(0), atMs(1'000'000), -1));
}

TEST(DataFreshness, WithinWindowIsFresh) {
  // last_recv=100ms, now=600ms → age=500ms ≤ timeout=1000ms → 新鲜。
  EXPECT_TRUE(bt_ros2::isFresh(true, atMs(100), atMs(600), 1000));
}

TEST(DataFreshness, BoundaryAgeEqualsTimeoutIsFresh) {
  // age 恰等于 timeout(边界 age==timeout)→ 仍新鲜(判定为 age <= timeout)。
  EXPECT_TRUE(bt_ros2::isFresh(true, atMs(0), atMs(1000), 1000));
}

TEST(DataFreshness, OutsideWindowIsStale) {
  // age=1001ms > timeout=1000ms → 过期，不新鲜。
  EXPECT_FALSE(bt_ros2::isFresh(true, atMs(0), atMs(1001), 1000));
}

TEST(DataFreshness, ClockGoesBackwardStillFresh) {
  // 时钟回拨：now < last_recv → age<0 → 视为“刚收到”，仍新鲜。
  EXPECT_TRUE(bt_ros2::isFresh(true, atMs(1000), atMs(500), 100));
}

TEST(DataAgeMs, NeverReceivedReturnsMinusOne) {
  EXPECT_EQ(bt_ros2::dataAgeMs(/*received=*/false, base(), atMs(500)), -1);
}

TEST(DataAgeMs, NormalAge) {
  EXPECT_EQ(bt_ros2::dataAgeMs(true, atMs(200), atMs(950)), 750);
}

TEST(DataAgeMs, ClockGoesBackwardClampsToZero) {
  // now < last_recv → 负年龄被钳到 0。
  EXPECT_EQ(bt_ros2::dataAgeMs(true, atMs(1000), atMs(400)), 0);
}

// ============================================================================
//  B) 6 个数据节点
//
//  辅助：构造一个带指定字面量端口值的 NodeConfig。直接把字面量塞进
//  port_values，等价于 XML 里 <Node port="literal"/> 的运行路径。
// ============================================================================

namespace {

/// 用给定黑板与“端口名->字面量”映射构造 NodeConfig。
NodeConfig makeConfig(
    const Blackboard::Ptr& bb,
    std::initializer_list<std::pair<const std::string, std::string>> ports = {}) {
  NodeConfig cfg;
  cfg.blackboard = bb;
  for (const auto& kv : ports) cfg.port_values[kv.first] = kv.second;
  return cfg;
}

}  // namespace

// --------------------------- SetBlackboard ----------------------------------

TEST(SetBlackboard, WritesValueReadableFromBlackboard) {
  auto bb = Blackboard::create();
  bt_nodes::SetBlackboardNode node(
      "set", makeConfig(bb, {{"value", "42"}, {"output_key", "score"}}));

  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  // 值以字符串形式落到黑板的 "score" key。
  ASSERT_TRUE(bb->contains("score"));
  EXPECT_EQ(bb->get<std::string>("score").value(), "42");
}

TEST(SetBlackboard, EmptyOutputKeyFails) {
  // 没有目标 key → 无法写入 → FAILURE(避免静默无效)。
  auto bb = Blackboard::create();
  bt_nodes::SetBlackboardNode node("set", makeConfig(bb, {{"value", "x"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

// --------------------------- CompareBlackboard ------------------------------
//  数值路径：六种运算符。黑板写入数值字符串 "10"。

namespace {
/// 便捷：建一个比较 key="n"(值=lhs) op value=rhs 的节点并 tick，返回结果。
NodeStatus compareNumeric(const std::string& lhs, const std::string& op,
                          const std::string& rhs) {
  auto bb = Blackboard::create();
  bb->set<std::string>("n", lhs);
  bt_nodes::CompareBlackboardNode node(
      "cmp", makeConfig(bb, {{"key", "n"}, {"op", op}, {"value", rhs}}));
  return node.executeTick();
}
}  // namespace

TEST(CompareBlackboard, NumericAllSixOperators) {
  // lhs=10, rhs=10 / 20 覆盖每个运算符的真与假。
  EXPECT_EQ(compareNumeric("10", "==", "10"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", "==", "20"), NodeStatus::FAILURE);

  EXPECT_EQ(compareNumeric("10", "!=", "20"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", "!=", "10"), NodeStatus::FAILURE);

  EXPECT_EQ(compareNumeric("10", "<", "20"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", "<", "10"), NodeStatus::FAILURE);

  EXPECT_EQ(compareNumeric("10", "<=", "10"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", "<=", "5"), NodeStatus::FAILURE);

  EXPECT_EQ(compareNumeric("10", ">", "5"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", ">", "10"), NodeStatus::FAILURE);

  EXPECT_EQ(compareNumeric("10", ">=", "10"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareNumeric("10", ">=", "20"), NodeStatus::FAILURE);
}

namespace {
/// 字符串路径：lhs/rhs 至少一方非数值 → 字典序比较。
NodeStatus compareString(const std::string& lhs, const std::string& op,
                         const std::string& rhs) {
  auto bb = Blackboard::create();
  bb->set<std::string>("s", lhs);
  bt_nodes::CompareBlackboardNode node(
      "cmp", makeConfig(bb, {{"key", "s"}, {"op", op}, {"value", rhs}}));
  return node.executeTick();
}
}  // namespace

TEST(CompareBlackboard, StringAllSixOperators) {
  // "apple" vs "apple"/"banana"：字典序 apple < banana。
  EXPECT_EQ(compareString("apple", "==", "apple"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("apple", "==", "banana"), NodeStatus::FAILURE);

  EXPECT_EQ(compareString("apple", "!=", "banana"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("apple", "!=", "apple"), NodeStatus::FAILURE);

  EXPECT_EQ(compareString("apple", "<", "banana"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("banana", "<", "apple"), NodeStatus::FAILURE);

  EXPECT_EQ(compareString("apple", "<=", "apple"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("banana", "<=", "apple"), NodeStatus::FAILURE);

  EXPECT_EQ(compareString("banana", ">", "apple"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("apple", ">", "banana"), NodeStatus::FAILURE);

  EXPECT_EQ(compareString("apple", ">=", "apple"), NodeStatus::SUCCESS);
  EXPECT_EQ(compareString("apple", ">=", "banana"), NodeStatus::FAILURE);
}

TEST(CompareBlackboard, MissingKeyFails) {
  // key 不存在于黑板 → FAILURE(条件不成立)。
  auto bb = Blackboard::create();
  bt_nodes::CompareBlackboardNode node(
      "cmp", makeConfig(bb, {{"key", "absent"}, {"op", "=="}, {"value", "1"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(CompareBlackboard, IllegalOperatorFails) {
  // op 非法 → 数值路径与字符串路径都返回 false → FAILURE。
  EXPECT_EQ(compareNumeric("10", "<>", "10"), NodeStatus::FAILURE);
  EXPECT_EQ(compareString("apple", "~=", "apple"), NodeStatus::FAILURE);
}

// --------------------------- CheckBool --------------------------------------

TEST(CheckBool, TrueBoolStorageExpectedTrue) {
  // 真正的 bool 存储 + expected=true(默认)。
  auto bb = Blackboard::create();
  bb->set<bool>("flag", true);
  bt_nodes::CheckBoolNode node("chk", makeConfig(bb, {{"key", "flag"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(CheckBool, BoolStorageExpectedFalseMismatch) {
  // bool=true 但 expected=false → 不相符 → FAILURE。
  auto bb = Blackboard::create();
  bb->set<bool>("flag", true);
  bt_nodes::CheckBoolNode node(
      "chk", makeConfig(bb, {{"key", "flag"}, {"expected", "false"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(CheckBool, StringTrueStorageExpectedTrue) {
  // 字符串 "true" 存储 → 回退解析为 true。
  auto bb = Blackboard::create();
  bb->set<std::string>("flag", "true");
  bt_nodes::CheckBoolNode node("chk", makeConfig(bb, {{"key", "flag"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(CheckBool, StringOneStorageExpectedTrue) {
  // 字符串 "1" 存储 → 回退解析为 true。
  auto bb = Blackboard::create();
  bb->set<std::string>("flag", "1");
  bt_nodes::CheckBoolNode node("chk", makeConfig(bb, {{"key", "flag"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(CheckBool, StringFalseStorageExpectedFalse) {
  // 字符串 "false" → 解析为 false；expected=false → 相符 → SUCCESS。
  auto bb = Blackboard::create();
  bb->set<std::string>("flag", "false");
  bt_nodes::CheckBoolNode node(
      "chk", makeConfig(bb, {{"key", "flag"}, {"expected", "false"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(CheckBool, MissingKeyFails) {
  auto bb = Blackboard::create();
  bt_nodes::CheckBoolNode node("chk", makeConfig(bb, {{"key", "absent"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

// --------------------------- Counter ----------------------------------------

TEST(Counter, NewKeyStartsFromZeroWithDefaultStep) {
  // 新 key：视当前值为 0，默认 step=1 → 写入 1。
  auto bb = Blackboard::create();
  bt_nodes::CounterNode node("cnt", makeConfig(bb, {{"key", "c"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  ASSERT_TRUE(bb->contains("c"));
  EXPECT_EQ(bb->get<int>("c").value(), 1);
}

TEST(Counter, AccumulatesAcrossTicks) {
  // 连续 tick 累加：1 → 2 → 3。
  auto bb = Blackboard::create();
  bt_nodes::CounterNode node("cnt", makeConfig(bb, {{"key", "c"}}));
  node.executeTick();
  node.executeTick();
  node.executeTick();
  EXPECT_EQ(bb->get<int>("c").value(), 3);
}

TEST(Counter, CustomPositiveStep) {
  // step=10 → 每拍 +10。
  auto bb = Blackboard::create();
  bt_nodes::CounterNode node("cnt",
                             makeConfig(bb, {{"key", "c"}, {"step", "10"}}));
  node.executeTick();
  node.executeTick();
  EXPECT_EQ(bb->get<int>("c").value(), 20);
}

TEST(Counter, NegativeStepDecrements) {
  // step=-3，已有值 10 → 10-3=7。
  auto bb = Blackboard::create();
  bb->set<int>("c", 10);
  bt_nodes::CounterNode node("cnt",
                             makeConfig(bb, {{"key", "c"}, {"step", "-3"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  EXPECT_EQ(bb->get<int>("c").value(), 7);
}

// --------------------------- CooldownCondition ------------------------------

TEST(CooldownCondition, FirstTickPassesThenCoolsDownThenPasses) {
  auto bb = Blackboard::create();
  // cooldown 设小(50ms)，便于 sleep 跨过。
  bt_nodes::CooldownConditionNode node(
      "cd", makeConfig(bb, {{"cooldown_ms", "50"}}));

  // 首拍：无历史成功记录 → 放行。
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);

  // 紧接着第二拍：仍在冷却期内 → FAILURE。
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);

  // 睡过冷却期(50ms + 余量) → 再次放行。
  std::this_thread::sleep_for(std::chrono::milliseconds(80));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

// --------------------------- SetBool + CheckBool 联动 -----------------------

TEST(SetBool, WritesRealBoolReadableByCheckBool) {
  auto bb = Blackboard::create();
  // SetBool 写入真正的 bool=true。
  bt_nodes::SetBoolNode setter(
      "set", makeConfig(bb, {{"key", "is_ready"}, {"value", "true"}}));
  EXPECT_EQ(setter.executeTick(), NodeStatus::SUCCESS);

  // 黑板里确实是 bool 类型(精确读取不抛异常)。
  ASSERT_TRUE(bb->contains("is_ready"));
  EXPECT_TRUE(bb->get<bool>("is_ready").value());

  // CheckBool 走精确 bool 读取路径 → expected=true → SUCCESS。
  bt_nodes::CheckBoolNode checker("chk",
                                  makeConfig(bb, {{"key", "is_ready"}}));
  EXPECT_EQ(checker.executeTick(), NodeStatus::SUCCESS);
}

TEST(SetBool, WritesFalseReadableByCheckBool) {
  auto bb = Blackboard::create();
  bt_nodes::SetBoolNode setter(
      "set", makeConfig(bb, {{"key", "has_error"}, {"value", "false"}}));
  EXPECT_EQ(setter.executeTick(), NodeStatus::SUCCESS);
  EXPECT_FALSE(bb->get<bool>("has_error").value());

  // CheckBool expected=false → 相符 → SUCCESS。
  bt_nodes::CheckBoolNode checker(
      "chk", makeConfig(bb, {{"key", "has_error"}, {"expected", "false"}}));
  EXPECT_EQ(checker.executeTick(), NodeStatus::SUCCESS);
}

// --------------------------- FunctionRegistry ------------------------------

TEST(FunctionRegistry, ActionNodeInvokesRegisteredFunctionAndWritesBlackboard) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();

  registry.registerAction(
      "robot.recharge.command",
      [](const bt_nodes::FunctionContext& ctx) {
        if (ctx.output_key.empty()) return NodeStatus::FAILURE;
        const std::string input = ctx.input.value_or("start_recharge");
        ctx.blackboard->set<std::string>(ctx.output_key, "cmd:" + input);
        return NodeStatus::SUCCESS;
      });

  bt_core::NodeFactory factory;
  factory.registerNodeType<bt_nodes::FunctionActionNode>("FunctionAction");

  auto bb = Blackboard::create();
  auto node = factory.createNode(
      "FunctionAction", "request_recharge",
      makeConfig(bb, {{"function", "robot.recharge.command"},
                      {"input", "start_recharge"},
                      {"output_key", "last_command"}}));

  EXPECT_EQ(node->executeTick(), NodeStatus::SUCCESS);
  ASSERT_TRUE(bb->contains("last_command"));
  EXPECT_EQ(bb->get<std::string>("last_command").value(),
            "cmd:start_recharge");
  registry.clear();
}

TEST(FunctionRegistry, ConditionNodeInvokesRegisteredFunction) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();

  registry.registerCondition(
      "robot.battery.needs_recharge",
      [](const bt_nodes::FunctionContext& ctx) {
        const double threshold = std::stod(ctx.input.value_or("0.2"));
        return ctx.blackboard->get<double>("battery_level").value_or(1.0) <
               threshold;
      });

  auto bb = Blackboard::create();
  bb->set<double>("battery_level", 0.12);

  bt_nodes::FunctionConditionNode low(
      "low", makeConfig(bb, {{"function", "robot.battery.needs_recharge"},
                             {"input", "0.20"}}));
  EXPECT_EQ(low.executeTick(), NodeStatus::SUCCESS);

  bb->set<double>("battery_level", 0.88);
  bt_nodes::FunctionConditionNode ok(
      "ok", makeConfig(bb, {{"function", "robot.battery.needs_recharge"},
                            {"input", "0.20"}}));
  EXPECT_EQ(ok.executeTick(), NodeStatus::FAILURE);
  registry.clear();
}

TEST(FunctionRegistry, MissingFunctionReturnsFailure) {
  auto& registry = bt_nodes::FunctionRegistry::instance();
  registry.clear();

  auto bb = Blackboard::create();
  bt_nodes::FunctionActionNode action(
      "missing_action", makeConfig(bb, {{"function", "missing.action"}}));
  EXPECT_EQ(action.executeTick(), NodeStatus::FAILURE);

  bt_nodes::FunctionConditionNode condition(
      "missing_condition",
      makeConfig(bb, {{"function", "missing.condition"}}));
  EXPECT_EQ(condition.executeTick(), NodeStatus::FAILURE);
}

// ============================================================================
//  D) 新增节点：BlackboardExists / ClearBlackboard / ScalarThreshold /
//     Delay / WaitUntilElapsed / LogEvent
// ============================================================================

// --------------------------- BlackboardExists -------------------------------

TEST(BlackboardExists, PresentKeyReturnsSuccess) {
  auto bb = Blackboard::create();
  bb->set<std::string>("target", "pose");
  bt_nodes::BlackboardExistsConditionNode node(
      "exists", makeConfig(bb, {{"key", "target"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(BlackboardExists, AbsentKeyReturnsFailure) {
  auto bb = Blackboard::create();
  bt_nodes::BlackboardExistsConditionNode node(
      "exists", makeConfig(bb, {{"key", "missing"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(BlackboardExists, EmptyKeyFails) {
  // 缺参（key 为空）→ FAILURE。
  auto bb = Blackboard::create();
  bt_nodes::BlackboardExistsConditionNode node("exists", makeConfig(bb, {}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(BlackboardExists, DetectsAnyValueType) {
  // contains 只看键是否存在，与类型无关：int 值也算存在。
  auto bb = Blackboard::create();
  bb->set<int>("count", 0);
  bt_nodes::BlackboardExistsConditionNode node(
      "exists", makeConfig(bb, {{"key", "count"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

// --------------------------- ClearBlackboard --------------------------------

TEST(ClearBlackboard, RemovesExistingKey) {
  auto bb = Blackboard::create();
  bb->set<std::string>("tmp", "x");
  ASSERT_TRUE(bb->contains("tmp"));
  bt_nodes::ClearBlackboardNode node("clear", makeConfig(bb, {{"key", "tmp"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  EXPECT_FALSE(bb->contains("tmp"));  // 真删除
}

TEST(ClearBlackboard, AbsentKeyIsIdempotentSuccess) {
  // 清除不存在的 key：幂等 no-op，仍 SUCCESS（调用后保证不存在）。
  auto bb = Blackboard::create();
  bt_nodes::ClearBlackboardNode node("clear",
                                     makeConfig(bb, {{"key", "nope"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  EXPECT_FALSE(bb->contains("nope"));
}

TEST(ClearBlackboard, EmptyKeyFails) {
  auto bb = Blackboard::create();
  bt_nodes::ClearBlackboardNode node("clear", makeConfig(bb, {}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

// --------------------------- ScalarThreshold --------------------------------

namespace {
/// 便捷：建一个读取 key="s"(值=lhs) op value=rhs 的阈值节点并 tick。
NodeStatus scalarThreshold(const std::string& lhs, const std::string& op,
                           const std::string& rhs) {
  auto bb = Blackboard::create();
  bb->set<double>("s", std::stod(lhs));
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"key", "s"}, {"op", op}, {"value", rhs}}));
  return node.executeTick();
}
}  // namespace

TEST(ScalarThreshold, AllSixOperators) {
  EXPECT_EQ(scalarThreshold("10", "==", "10"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("10", "==", "20"), NodeStatus::FAILURE);
  EXPECT_EQ(scalarThreshold("10", "!=", "20"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("10", "!=", "10"), NodeStatus::FAILURE);
  EXPECT_EQ(scalarThreshold("10", "<", "20"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("10", "<", "10"), NodeStatus::FAILURE);
  EXPECT_EQ(scalarThreshold("10", "<=", "10"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("10", ">", "5"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("10", ">", "10"), NodeStatus::FAILURE);
  EXPECT_EQ(scalarThreshold("10", ">=", "10"), NodeStatus::SUCCESS);
}

TEST(ScalarThreshold, BoundaryEquality) {
  // 边界：恰好相等时 >= / <= 成立，> / < 不成立。
  EXPECT_EQ(scalarThreshold("0.2", ">=", "0.2"), NodeStatus::SUCCESS);
  EXPECT_EQ(scalarThreshold("0.2", ">", "0.2"), NodeStatus::FAILURE);
}

TEST(ScalarThreshold, ReadsIntStoredValue) {
  // 黑板存 int，仍能被解析为数值比较。
  auto bb = Blackboard::create();
  bb->set<int>("temp", 85);
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"key", "temp"}, {"op", ">="}, {"value", "80"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(ScalarThreshold, MissingKeyFails) {
  auto bb = Blackboard::create();
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"key", "absent"}, {"op", ">"}, {"value", "0"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(ScalarThreshold, EmptyKeyFails) {
  auto bb = Blackboard::create();
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"op", ">"}, {"value", "0"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(ScalarThreshold, NonNumericValueFails) {
  // 黑板值不可解析为数值 → FAILURE（不抛异常）。
  auto bb = Blackboard::create();
  bb->set<std::string>("s", "not_a_number");
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"key", "s"}, {"op", ">"}, {"value", "0"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

TEST(ScalarThreshold, IllegalOperatorFails) {
  // 枚举非法值：applyNumeric 未命中任何合法 op → false → FAILURE。
  auto bb = Blackboard::create();
  bb->set<double>("s", 5.0);
  bt_nodes::ScalarThresholdConditionNode node(
      "th", makeConfig(bb, {{"key", "s"}, {"op", "=~"}, {"value", "5"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

// --------------------------- Delay (RUNNING 语义) ---------------------------

TEST(Delay, ReturnsRunningThenSuccess) {
  // 首拍 RUNNING；睡过延时后再 tick → SUCCESS。
  auto bb = Blackboard::create();
  bt_nodes::DelayNode node("delay", makeConfig(bb, {{"delay_ms", "40"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);  // 首拍立即返回 RUNNING
  std::this_thread::sleep_for(std::chrono::milliseconds(60));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);  // 已到时
}

TEST(Delay, StaysRunningBeforeElapsed) {
  // 未到时的中间拍仍 RUNNING。
  auto bb = Blackboard::create();
  bt_nodes::DelayNode node("delay", makeConfig(bb, {{"delay_ms", "10000"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);  // 远未到 10s
}

TEST(Delay, NonPositiveDelayImmediateSuccess) {
  // delay_ms<=0：首拍即 SUCCESS（边界）。
  auto bb = Blackboard::create();
  bt_nodes::DelayNode node("delay", makeConfig(bb, {{"delay_ms", "0"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(Delay, HaltResetsTiming) {
  // onHalted 后重新计时：halt→再 tick 应回到首拍 RUNNING。
  auto bb = Blackboard::create();
  bt_nodes::DelayNode node("delay", makeConfig(bb, {{"delay_ms", "10000"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);
  node.halt();  // 触发 onHalted → 复位
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);  // 重新首拍
}

TEST(Delay, DefaultDelayUsedWhenMissing) {
  // 缺参：使用默认 1000ms，首拍 RUNNING（不会立即 SUCCESS）。
  auto bb = Blackboard::create();
  bt_nodes::DelayNode node("delay", makeConfig(bb, {}));
  EXPECT_EQ(node.executeTick(), NodeStatus::RUNNING);
}

// --------------------------- WaitUntilElapsed -------------------------------

TEST(WaitUntilElapsed, FailsBeforeSucceedsAfter) {
  auto bb = Blackboard::create();
  bt_nodes::WaitUntilElapsedConditionNode node(
      "wait", makeConfig(bb, {{"duration_ms", "40"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);  // 首拍未到时
  std::this_thread::sleep_for(std::chrono::milliseconds(60));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);  // 到时
}

TEST(WaitUntilElapsed, StaysSuccessAfterElapsed) {
  // 单调语义：到时后持续 SUCCESS（不刷新起点）。
  // 注意：起点在首拍记录，故先 tick 一次确立起点，再睡过时长。
  auto bb = Blackboard::create();
  bt_nodes::WaitUntilElapsedConditionNode node(
      "wait", makeConfig(bb, {{"duration_ms", "20"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);  // 首拍确立起点，未到时
  std::this_thread::sleep_for(std::chrono::milliseconds(40));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);  // 持续 SUCCESS
}

TEST(WaitUntilElapsed, NonPositiveDurationImmediateSuccess) {
  auto bb = Blackboard::create();
  bt_nodes::WaitUntilElapsedConditionNode node(
      "wait", makeConfig(bb, {{"duration_ms", "0"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(WaitUntilElapsed, DefaultDurationFailsFirstTick) {
  // 缺参：默认 1000ms，首拍应 FAILURE（远未到时）。
  auto bb = Blackboard::create();
  bt_nodes::WaitUntilElapsedConditionNode node("wait", makeConfig(bb, {}));
  EXPECT_EQ(node.executeTick(), NodeStatus::FAILURE);
}

// --------------------------- LogEvent ---------------------------------------

TEST(LogEvent, InfoLevelSucceeds) {
  auto bb = Blackboard::create();
  bt_nodes::LogEventNode node(
      "log", makeConfig(bb, {{"message", "hello"}, {"level", "info"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(LogEvent, WarnAndErrorLevelsSucceed) {
  auto bb = Blackboard::create();
  bt_nodes::LogEventNode warn(
      "log_w", makeConfig(bb, {{"message", "careful"}, {"level", "warn"}}));
  EXPECT_EQ(warn.executeTick(), NodeStatus::SUCCESS);
  bt_nodes::LogEventNode err(
      "log_e", makeConfig(bb, {{"message", "boom"}, {"level", "error"}}));
  EXPECT_EQ(err.executeTick(), NodeStatus::SUCCESS);
}

TEST(LogEvent, EmptyMessageStillSucceeds) {
  // 缺参（message 空）：仍 SUCCESS（打印空消息，日志是副作用）。
  auto bb = Blackboard::create();
  bt_nodes::LogEventNode node("log", makeConfig(bb, {}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}

TEST(LogEvent, IllegalLevelFallsBackToInfo) {
  // 枚举非法值：回退 info，不中断树，仍 SUCCESS。
  auto bb = Blackboard::create();
  bt_nodes::LogEventNode node(
      "log", makeConfig(bb, {{"message", "x"}, {"level", "verbose"}}));
  EXPECT_EQ(node.executeTick(), NodeStatus::SUCCESS);
}
