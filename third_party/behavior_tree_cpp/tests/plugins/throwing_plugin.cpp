#include <stdexcept>

#include "bt_core/leaf_node.hpp"
#include "bt_core/plugin_register.hpp"

namespace {

class PluginRuntimeTestNode final : public bt_core::ActionNode {
 public:
  using ActionNode::ActionNode;

  bt_core::NodeStatus tick() override { return bt_core::NodeStatus::SUCCESS; }
};

}  // namespace

BT_REGISTER_NODES(factory) {
  factory.registerNodeType<PluginRuntimeTestNode>("PluginRuntimeTestNode");

#if defined(BT_TEST_THROW_AFTER_REGISTER) && BT_TEST_THROW_AFTER_REGISTER
  throw std::runtime_error(
      "throwing plugin intentionally failed after registration");
#endif
}
