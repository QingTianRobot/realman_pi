#pragma once

#include <string>

#include "bt_core/leaf_node.hpp"
#include "realman_bt/input_mode.hpp"

namespace realman_bt {

inline constexpr char kInputModeRegistryBlackboardKey[] =
    "__realman_bt_input_mode_registry__";
inline constexpr char kInputModeCoordinatorBlackboardKey[] =
    "__realman_bt_input_mode_coordinator__";

class SelectInputModeNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
};

class InputModeGuardNode final : public bt_core::ConditionNode {
 public:
  InputModeGuardNode(std::string name, bt_core::NodeConfig config);

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;

 private:
  std::string mode_id_;
};

class ActivateInputModeNode final : public bt_core::ActionNode {
 public:
  ActivateInputModeNode(std::string name, bt_core::NodeConfig config);

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;

 private:
  std::string mode_id_;
};

class WebInputStubNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  bt_core::NodeStatus tick() override;
};

class PolicyInputStubNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  bool entry_recorded_{false};
};

class PikaInputStubNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  bool entry_recorded_{false};
};

class IdleInputNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  bt_core::NodeStatus tick() override;
};

}  // namespace realman_bt
