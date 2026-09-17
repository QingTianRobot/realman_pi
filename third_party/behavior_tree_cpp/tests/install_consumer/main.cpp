#include <exception>
#include <iostream>

#include <bt_core/blackboard.hpp>
#include <bt_core/node_factory.hpp>
#include <bt_core/node_status.hpp>
#include <bt_core/xml_parser.hpp>
#include <bt_nodes/function/function_registry.hpp>

int main(int argc, char** argv) {
  if (argc != 2) {
    std::cerr << "usage: bt_install_consumer <bt_nodes-plugin>\n";
    return 2;
  }

  try {
    auto& registry = bt_nodes::FunctionRegistry::instance();
    registry.clear();
    registry.registerAction(
        "install.probe", [](const bt_nodes::FunctionContext&) {
          return bt_core::NodeStatus::SUCCESS;
        });

    bt_core::NodeFactory factory;
    factory.loadPlugin(argv[1]);

    bt_core::XmlParser parser(factory);
    auto tree = parser.loadFromText(
        R"(<root main_tree_to_execute="Main"><BehaviorTree ID="Main"><FunctionAction function="install.probe"/></BehaviorTree></root>)",
        bt_core::Blackboard::create());

    const auto status = tree.tickOnce();
    registry.clear();
    if (status != bt_core::NodeStatus::SUCCESS) {
      std::cerr << "[install-consumer] expected SUCCESS, got "
                << bt_core::toStr(status) << '\n';
      return 1;
    }

    std::cout << "[install-consumer] SUCCESS\n";
    return 0;
  } catch (const std::exception& error) {
    std::cerr << "[install-consumer] ERROR: " << error.what() << '\n';
    return 1;
  }
}
