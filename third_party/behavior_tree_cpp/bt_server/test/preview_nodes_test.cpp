#include <gtest/gtest.h>

#include <algorithm>
#include <set>
#include <string>

#include "demo_nodes.hpp"

TEST(PreviewNodes, RegistersMoveJWithArmMoveXmlPorts) {
  bt_core::NodeFactory factory;

  bt_server::registerDemoNodes(factory);

  ASSERT_TRUE(factory.isRegistered("MoveJ"));

  const auto manifests = factory.manifests();
  const auto it = std::find_if(
      manifests.begin(), manifests.end(),
      [](const bt_core::NodeManifest& manifest) {
        return manifest.registration_name == "MoveJ";
      });
  ASSERT_NE(it, manifests.end());

  std::set<std::string> port_names;
  for (const auto& [name, port] : it->ports) {
    (void)port;
    port_names.insert(name);
  }
  EXPECT_EQ(port_names,
            (std::set<std::string>{"arm_id", "dry_run", "joint_degrees",
                                   "velocity_percent", "blend_radius_percent",
                                   "timeout_sec"}));
}

TEST(PreviewNodes, MoveJTickSucceedsWithoutExecutionEnvironment) {
  bt_core::NodeFactory factory;
  bt_server::registerDemoNodes(factory);

  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  config.port_values = {{"arm_id", "arm"},
                        {"dry_run", "true"},
                        {"joint_degrees", "0,-20,30,0,45,0"},
                        {"velocity_percent", "10"},
                        {"blend_radius_percent", "0"},
                        {"timeout_sec", "30"}};
  const auto node = factory.createNode("MoveJ", "preview_move", config);

  EXPECT_EQ(node->executeTick(), bt_core::NodeStatus::SUCCESS);
}
