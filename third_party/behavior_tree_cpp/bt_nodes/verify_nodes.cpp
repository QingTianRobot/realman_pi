// ============================================================================
//  bt_nodes/verify_nodes.cpp
//  独立验证程序：动态加载 libbt_nodes 插件，构建并 tick 多棵树，
//  断言 Sequence/Fallback/Parallel/Inverter/Retry/Repeat/ForceX 的语义正确。
//
//  关键点（见 API_CONTRACT 第3点）：用 factory.loadPlugin() 加载，使工厂自持
//  库句柄，保证 builders_/manifests_ 先于库卸载而析构 → 正常退出无段错误。
// ============================================================================

#include <cassert>
#include <iostream>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"

using namespace bt_core;

namespace {

int g_checks = 0;
int g_failed = 0;

void check(bool cond, const std::string& what) {
  ++g_checks;
  if (cond) {
    std::cout << "  [PASS] " << what << "\n";
  } else {
    ++g_failed;
    std::cout << "  [FAIL] " << what << "\n";
  }
}

/// @brief 便捷：用工厂建一个节点（默认配置 + 给定字面量端口值）。
TreeNode::Ptr make(NodeFactory& f, const std::string& reg,
                   const std::string& inst, const Blackboard::Ptr& bb,
                   std::unordered_map<std::string, std::string> port_values = {}) {
  NodeConfig cfg{bb, {}, std::move(port_values)};
  // 把字面量端口值写入黑板，模拟 XmlParser 的字面量处理（getInput 据此读取）。
  for (const auto& [k, v] : cfg.port_values) {
    // 端口类型为 int 的统一转 int 写入；message 走 string。
    if (k == "success_count" || k == "failure_count" ||
        k == "num_attempts" || k == "num_cycles") {
      bb->set<int>(k, std::stoi(v));
    } else {
      bb->set<std::string>(k, v);
    }
  }
  return f.createNode(reg, inst, cfg);
}

ControlNode* asCtrl(const TreeNode::Ptr& n) {
  return dynamic_cast<ControlNode*>(n.get());
}
DecoratorNode* asDeco(const TreeNode::Ptr& n) {
  return dynamic_cast<DecoratorNode*>(n.get());
}

}  // namespace

int main(int argc, char** argv) {
  if (argc < 2) {
    std::cerr << "用法: verify_nodes <libbt_nodes.dylib 路径>\n";
    return 2;
  }
  const std::string plugin_path = argv[1];

  NodeFactory factory;
  try {
    factory.loadPlugin(plugin_path);  // 推荐入口：工厂自持句柄，析构安全
  } catch (const std::exception& e) {
    std::cerr << "加载插件失败: " << e.what() << "\n";
    return 3;
  }

  std::cout << "插件已加载，注册节点数 = " << factory.size() << "\n";
  check(factory.size() == 25,
        "注册了 25 个内置节点（控制3+装饰5+动作3+数据9+时间2+诊断1+函数2）");
  for (const char* n : {"Sequence", "Fallback", "Parallel", "Inverter",
                        "Retry", "Repeat", "ForceSuccess", "ForceFailure",
                        "AlwaysSuccess", "AlwaysFailure", "PrintMessage",
                        "SetBlackboard", "CompareBlackboard", "CheckBool",
                        "Counter", "CooldownCondition", "SetBool",
                        "BlackboardExists", "ClearBlackboard", "ScalarThreshold",
                        "Delay", "WaitUntilElapsed", "LogEvent",
                        "FunctionAction", "FunctionCondition"}) {
    check(factory.isRegistered(n), std::string("已注册: ") + n);
  }

  // --------------------------------------------------------------------------
  // 1) Sequence：全成功 → SUCCESS（含任务要求的 Sequence+Inverter+叶子）
  //    树: Sequence[ PrintMessage, Inverter(AlwaysFailure), AlwaysSuccess ]
  //    Inverter(AlwaysFailure)=SUCCESS，故三者皆成功 → Sequence SUCCESS。
  // --------------------------------------------------------------------------
  std::cout << "\n[1] Sequence 全成功（含 Inverter 反转失败为成功）:\n";
  {
    auto bb = Blackboard::create();
    auto seq = make(factory, "Sequence", "root", bb);
    auto print =
        make(factory, "PrintMessage", "p", bb, {{"message", "tree-1 跑通"}});
    auto inv = make(factory, "Inverter", "inv", bb);
    auto fail_child = make(factory, "AlwaysFailure", "f", bb);
    asDeco(inv)->setChild(fail_child);
    auto ok = make(factory, "AlwaysSuccess", "s", bb);

    asCtrl(seq)->addChild(print);
    asCtrl(seq)->addChild(inv);
    asCtrl(seq)->addChild(ok);

    Tree tree(seq, bb);
    NodeStatus r = tree.tickWhileRunning();
    check(r == NodeStatus::SUCCESS, "Sequence 全成功 => SUCCESS");
    check(inv->status() == NodeStatus::SUCCESS,
          "Inverter(AlwaysFailure) 自身状态 => SUCCESS（失败被反转）");
  }

  // --------------------------------------------------------------------------
  // 2) Sequence：含一个失败子节点 → FAILURE
  // --------------------------------------------------------------------------
  std::cout << "\n[2] Sequence 含失败 => FAILURE:\n";
  {
    auto bb = Blackboard::create();
    auto seq = make(factory, "Sequence", "root", bb);
    asCtrl(seq)->addChild(make(factory, "AlwaysSuccess", "s1", bb));
    asCtrl(seq)->addChild(make(factory, "AlwaysFailure", "f1", bb));
    asCtrl(seq)->addChild(make(factory, "AlwaysSuccess", "s2", bb));
    Tree tree(seq, bb);
    check(tree.tickWhileRunning() == NodeStatus::FAILURE,
          "Sequence[OK,FAIL,OK] => FAILURE");
  }

  // --------------------------------------------------------------------------
  // 3) Fallback：遇第一个成功即成功
  // --------------------------------------------------------------------------
  std::cout << "\n[3] Fallback 第一个成功即成功:\n";
  {
    auto bb = Blackboard::create();
    auto fb = make(factory, "Fallback", "root", bb);
    asCtrl(fb)->addChild(make(factory, "AlwaysFailure", "f1", bb));
    asCtrl(fb)->addChild(make(factory, "AlwaysSuccess", "s1", bb));
    asCtrl(fb)->addChild(make(factory, "AlwaysFailure", "f2", bb));
    Tree tree(fb, bb);
    check(tree.tickWhileRunning() == NodeStatus::SUCCESS,
          "Fallback[FAIL,OK,FAIL] => SUCCESS");
  }
  std::cout << "\n[3b] Fallback 全失败 => FAILURE:\n";
  {
    auto bb = Blackboard::create();
    auto fb = make(factory, "Fallback", "root", bb);
    asCtrl(fb)->addChild(make(factory, "AlwaysFailure", "f1", bb));
    asCtrl(fb)->addChild(make(factory, "AlwaysFailure", "f2", bb));
    Tree tree(fb, bb);
    check(tree.tickWhileRunning() == NodeStatus::FAILURE,
          "Fallback[FAIL,FAIL] => FAILURE");
  }

  // --------------------------------------------------------------------------
  // 4) Parallel：阈值判定
  //    success_count=2 of 3，子节点 [OK, OK, FAIL] → 成功(2>=2)
  // --------------------------------------------------------------------------
  std::cout << "\n[4] Parallel 成功阈值=2/3:\n";
  {
    auto bb = Blackboard::create();
    auto par = make(factory, "Parallel", "root", bb,
                    {{"success_count", "2"}, {"failure_count", "3"}});
    asCtrl(par)->addChild(make(factory, "AlwaysSuccess", "s1", bb));
    asCtrl(par)->addChild(make(factory, "AlwaysSuccess", "s2", bb));
    asCtrl(par)->addChild(make(factory, "AlwaysFailure", "f1", bb));
    Tree tree(par, bb);
    check(tree.tickWhileRunning() == NodeStatus::SUCCESS,
          "Parallel(succ=2)[OK,OK,FAIL] => SUCCESS");
  }
  std::cout << "\n[4b] Parallel 失败阈值=1 触发 => FAILURE:\n";
  {
    auto bb = Blackboard::create();
    // success 要 3 个全成功，但 failure_count=1：一个失败即整体失败。
    auto par = make(factory, "Parallel", "root", bb,
                    {{"success_count", "3"}, {"failure_count", "1"}});
    asCtrl(par)->addChild(make(factory, "AlwaysSuccess", "s1", bb));
    asCtrl(par)->addChild(make(factory, "AlwaysFailure", "f1", bb));
    asCtrl(par)->addChild(make(factory, "AlwaysSuccess", "s2", bb));
    Tree tree(par, bb);
    check(tree.tickWhileRunning() == NodeStatus::FAILURE,
          "Parallel(succ=3,fail=1) 含失败 => FAILURE");
  }

  // --------------------------------------------------------------------------
  // 5) Retry：可计数的“失败动作”，重试到上限。
  //    用 CountingAction 注册不了（在插件内），改用黑板计数的方式间接验证：
  //    这里用 Retry 包 AlwaysFailure，num_attempts=3 → 最终 FAILURE，
  //    且子节点被 tick 了 3 次（通过状态回调计数）。
  // --------------------------------------------------------------------------
  std::cout << "\n[5] Retry(AlwaysFailure, num_attempts=3) => FAILURE 且尝试 3 次:\n";
  {
    auto bb = Blackboard::create();
    auto retry = make(factory, "Retry", "root", bb, {{"num_attempts", "3"}});
    auto child = make(factory, "AlwaysFailure", "f", bb);
    asDeco(retry)->setChild(child);
    Tree tree(retry, bb);

    // 统计子节点进入 FAILURE 的次数（每次失败尝试都会触发一次 ->FAILURE）。
    int fail_transitions = 0;
    const uint16_t child_id = child->id();
    tree.setStatusCallback(
        [&](uint16_t id, NodeStatus, NodeStatus next) {
          if (id == child_id && next == NodeStatus::FAILURE) ++fail_transitions;
        });

    NodeStatus r = tree.tickWhileRunning();
    check(r == NodeStatus::FAILURE, "Retry 耗尽次数 => FAILURE");
    check(fail_transitions == 3, "子节点共尝试失败 3 次（num_attempts=3）");
  }
  std::cout << "\n[5b] Retry(AlwaysSuccess) 首次即成功 => SUCCESS:\n";
  {
    auto bb = Blackboard::create();
    auto retry = make(factory, "Retry", "root", bb, {{"num_attempts", "5"}});
    asDeco(retry)->setChild(make(factory, "AlwaysSuccess", "s", bb));
    Tree tree(retry, bb);
    check(tree.tickWhileRunning() == NodeStatus::SUCCESS,
          "Retry(OK) => SUCCESS");
  }

  // --------------------------------------------------------------------------
  // 6) Repeat：成功重复 N 次 → SUCCESS，统计成功 transition 次数。
  // --------------------------------------------------------------------------
  std::cout << "\n[6] Repeat(AlwaysSuccess, num_cycles=4) => SUCCESS 且成功 4 次:\n";
  {
    auto bb = Blackboard::create();
    auto rep = make(factory, "Repeat", "root", bb, {{"num_cycles", "4"}});
    auto child = make(factory, "AlwaysSuccess", "s", bb);
    asDeco(rep)->setChild(child);
    Tree tree(rep, bb);

    int succ_transitions = 0;
    const uint16_t child_id = child->id();
    tree.setStatusCallback(
        [&](uint16_t id, NodeStatus, NodeStatus next) {
          if (id == child_id && next == NodeStatus::SUCCESS) ++succ_transitions;
        });
    NodeStatus r = tree.tickWhileRunning();
    check(r == NodeStatus::SUCCESS, "Repeat 跑满循环 => SUCCESS");
    check(succ_transitions == 4, "子节点成功完成 4 个循环（num_cycles=4）");
  }
  std::cout << "\n[6b] Repeat 子节点失败 => 立即 FAILURE:\n";
  {
    auto bb = Blackboard::create();
    auto rep = make(factory, "Repeat", "root", bb, {{"num_cycles", "4"}});
    asDeco(rep)->setChild(make(factory, "AlwaysFailure", "f", bb));
    Tree tree(rep, bb);
    check(tree.tickWhileRunning() == NodeStatus::FAILURE,
          "Repeat(FAIL) => FAILURE");
  }

  // --------------------------------------------------------------------------
  // 7) ForceSuccess / ForceFailure
  // --------------------------------------------------------------------------
  std::cout << "\n[7] ForceSuccess / ForceFailure:\n";
  {
    auto bb = Blackboard::create();
    auto fs = make(factory, "ForceSuccess", "fs", bb);
    asDeco(fs)->setChild(make(factory, "AlwaysFailure", "f", bb));
    Tree t1(fs, bb);
    check(t1.tickWhileRunning() == NodeStatus::SUCCESS,
          "ForceSuccess(AlwaysFailure) => SUCCESS");

    auto bb2 = Blackboard::create();
    auto ff = make(factory, "ForceFailure", "ff", bb2);
    asDeco(ff)->setChild(make(factory, "AlwaysSuccess", "s", bb2));
    Tree t2(ff, bb2);
    check(t2.tickWhileRunning() == NodeStatus::FAILURE,
          "ForceFailure(AlwaysSuccess) => FAILURE");
  }

  // --------------------------------------------------------------------------
  // 8) PrintMessage 端口数据流：字面量 + 重映射
  // --------------------------------------------------------------------------
  std::cout << "\n[8] PrintMessage 端口（字面量 + 重映射）:\n";
  {
    auto bb = Blackboard::create();
    // 字面量
    auto p1 = make(factory, "PrintMessage", "p1", bb,
                   {{"message", "字面量消息"}});
    check(p1->executeTick() == NodeStatus::SUCCESS, "PrintMessage 字面量 => SUCCESS");

    // 重映射: 端口 message -> 黑板 key greeting
    bb->set<std::string>("greeting", "重映射消息 from blackboard");
    NodeConfig cfg{bb, {{"message", "greeting"}}, {}};
    auto p2 = factory.createNode("PrintMessage", "p2", cfg);
    check(p2->executeTick() == NodeStatus::SUCCESS, "PrintMessage 重映射 => SUCCESS");
  }

  // --------------------------------------------------------------------------
  // 汇总
  // --------------------------------------------------------------------------
  std::cout << "\n=========================================\n";
  std::cout << "断言总数: " << g_checks << "  失败: " << g_failed << "\n";
  if (g_failed != 0) {
    std::cout << "结果: 有断言失败 ❌\n";
    return 1;
  }
  std::cout << "结果: 全部通过 ✅（即将正常析构 factory，验证析构顺序安全）\n";
  return 0;
}
