// ============================================================================
//  examples/02_load_from_xml.cpp
//  示例 2：从 XML 文件加载行为树 + 运行时加载 bt_nodes 插件。
//
//  这是“可视化编辑器导出 XML → 程序加载执行”的完整闭环演示：
//    1) 运行时加载 bt_nodes 动态库插件(节点不在本程序里编译)；
//    2) 用 XmlParser 解析 examples/trees/patrol.xml 构建树；
//    3) 挂状态回调(模拟 bt_server 推送运行态)并执行。
//
//  用法：02_load_from_xml <plugin_path> <xml_path>
// ============================================================================
#include <iostream>

#include "bt_core/plugin_loader.hpp"
#include "bt_core/xml_parser.hpp"

using namespace bt_core;

int main(int argc, char** argv) {
  if (argc < 3) {
    std::cerr << "用法: " << argv[0] << " <bt_nodes插件路径> <树XML路径>\n";
    return 1;
  }
  const std::string plugin_path = argv[1];
  const std::string xml_path = argv[2];

  // 1) 加载插件(工厂自持句柄，析构顺序安全)。
  NodeFactory factory;
  try {
    factory.loadPlugin(plugin_path);
  } catch (const std::exception& e) {
    std::cerr << "加载插件失败: " << e.what() << "\n";
    return 1;
  }
  std::cout << "已加载插件，注册节点数: " << factory.size() << "\n";

  // 2) 从 XML 文件构建树。
  XmlParser parser(factory);
  Tree tree;
  try {
    tree = parser.loadFromFile(xml_path);
  } catch (const std::exception& e) {
    std::cerr << "解析树失败: " << e.what() << "\n";
    return 1;
  }
  std::cout << "树构建完成，节点数: " << tree.nodes().size() << "\n";

  // 3) 挂状态回调(演示 bt_server 推送运行态的机制)。
  tree.setStatusCallback(
      [](uint16_t id, NodeStatus prev, NodeStatus next) {
        std::cout << "    [状态变化] 节点#" << id << ": " << toStr(prev)
                  << " -> " << toStr(next) << "\n";
      });

  // 4) 执行。
  std::cout << "=== 执行行为树 ===\n";
  NodeStatus result = tree.tickWhileRunning();
  std::cout << "=== 根节点结果: " << toStr(result) << " ===\n";

  return 0;
}
