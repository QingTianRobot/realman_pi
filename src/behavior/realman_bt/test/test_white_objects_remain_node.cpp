#undef NDEBUG
#include <cassert>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "rclcpp/rclcpp.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "realman_bt/white_objects_remain_node.hpp"
#include "sensor_msgs/msg/image.hpp"

namespace {

using realman_bt::PolicyTaskConfig;

// A 640x480 image of the green mat (8, 32, 24) with optional white rectangles.
struct Rect {
  int x, y, w, h;
};

sensor_msgs::msg::Image makeImage(const std::vector<Rect>& white, const std::string& encoding = "rgb8",
                                  int padding = 0) {
  sensor_msgs::msg::Image image;
  image.width = 640;
  image.height = 480;
  image.encoding = encoding;
  const int channels = realman_bt::whiteDetectionChannels(encoding);
  const int bytes = channels == 0 ? 1 : channels;
  image.step = image.width * bytes + padding;
  image.data.assign(static_cast<std::size_t>(image.step) * image.height, 0);
  for (std::uint32_t y = 0; y < image.height; ++y) {
    for (std::uint32_t x = 0; x < image.width; ++x) {
      std::uint8_t* pixel = &image.data[y * image.step + x * bytes];
      bool is_white = false;
      for (const auto& rect : white) {
        is_white |= static_cast<int>(x) >= rect.x && static_cast<int>(x) < rect.x + rect.w &&
                    static_cast<int>(y) >= rect.y && static_cast<int>(y) < rect.y + rect.h;
      }
      const std::uint8_t color[4] = {
          static_cast<std::uint8_t>(is_white ? 150 : 8), static_cast<std::uint8_t>(is_white ? 160 : 32),
          static_cast<std::uint8_t>(is_white ? 155 : 24), 255};
      for (int c = 0; c < bytes; ++c) pixel[c] = color[c];
    }
  }
  return image;
}

std::size_t count(const sensor_msgs::msg::Image& image, const PolicyTaskConfig::ObjectDetection& params) {
  return realman_bt::countWhiteCorePixels(image.data.data(), static_cast<int>(image.width),
                                          static_cast<int>(image.height), static_cast<int>(image.step),
                                          realman_bt::whiteDetectionChannels(image.encoding), params);
}

struct Harness {
  PolicyTaskConfig config;
  realman_bt::RuntimeDiagnostics diagnostics;
  bt_core::Blackboard::Ptr blackboard = bt_core::Blackboard::create();

  bt_core::NodeConfig nodeConfig(rclcpp::Node* node, bool dry_run) {
    blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, node);
    blackboard->set<const PolicyTaskConfig*>(realman_bt::kPolicyTaskConfigBlackboardKey, &config);
    blackboard->set<realman_bt::RuntimeDiagnostics*>(realman_bt::kRuntimeDiagnosticsBlackboardKey,
                                                     &diagnostics);
    bt_core::NodeConfig result;
    result.blackboard = blackboard;
    result.port_values = {{"dry_run", dry_run ? "true" : "false"}};
    result.port_remap = {{"table_clear", "pick_table_clear"}};
    return result;
  }
};

// Ticks while a publisher thread keeps sending `image`, until the node is no longer RUNNING.
bt_core::NodeStatus runWithImage(realman_bt::WhiteObjectsRemainNode& node,
                                 rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr publisher,
                                 const sensor_msgs::msg::Image* image, std::chrono::seconds limit) {
  std::atomic<bool> done{false};
  std::thread sender([&]() {
    while (!done) {
      if (image) publisher->publish(*image);
      std::this_thread::sleep_for(std::chrono::milliseconds(30));
    }
  });
  const auto deadline = std::chrono::steady_clock::now() + limit;
  auto status = bt_core::NodeStatus::RUNNING;
  while (status == bt_core::NodeStatus::RUNNING && std::chrono::steady_clock::now() < deadline) {
    status = node.executeTick();
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }
  done = true;
  sender.join();
  return status;
}

}  // namespace

int main(int argc, char** argv) {
  PolicyTaskConfig::ObjectDetection params;  // ROI 235,125 250x230, erode 9
  params.exclude_xywh = {};

  // A solid 30x20 blob keeps (30-8) x (20-8) core pixels; a 3 px wide cable keeps none.
  assert(count(makeImage({{300, 200, 30, 20}}), params) == 22u * 12u);
  assert(count(makeImage({{300, 200, 120, 3}, {260, 150, 3, 150}}), params) == 0u);
  assert(count(makeImage({}), params) == 0u);
  // Only the part inside the ROI counts: a blob straddling its left edge keeps 10 - 8 + 1 columns.
  assert(count(makeImage({{225, 200, 20, 20}}), params) == 2u * 12u);
  // Floor-white outside the ROI is ignored.
  assert(count(makeImage({{20, 20, 100, 100}}), params) == 0u);
  // Channel order and a fourth channel or row padding do not matter.
  assert(count(makeImage({{300, 200, 30, 20}}, "bgra8", 16), params) == 22u * 12u);
  // A coloured blob (too much spread between channels) is not white.
  {
    auto image = makeImage({{300, 200, 30, 20}});
    for (std::size_t i = 0; i < image.data.size(); i += 3) {
      if (image.data[i] == 150) image.data[i + 1] = 230;
    }
    assert(count(image, params) == 0u);
  }
  // An ROI that does not fit in the image is an error, not an empty table.
  {
    auto wide = params;
    wide.roi_xywh = {500, 125, 250, 230};
    bool threw = false;
    try {
      (void)count(makeImage({}), wide);
    } catch (const std::invalid_argument&) {
      threw = true;
    }
    assert(threw);
  }
  // An excluded rectangle (the light's reflection) hides what is inside it, and only that.
  {
    auto masked = params;
    masked.exclude_xywh = {290, 190, 60, 40};
    assert(count(makeImage({{300, 200, 30, 20}}), masked) == 0u);
    assert(count(makeImage({{300, 200, 30, 20}, {400, 280, 30, 20}}), masked) == 22u * 12u);
    // A blob half inside keeps only the part outside, eroded: x 350..359 is 10 wide, 2 core columns.
    assert(count(makeImage({{340, 200, 20, 20}}), masked) == 2u * 12u);
    masked.exclude_xywh = {};
    assert(count(makeImage({{300, 200, 30, 20}}), masked) == 22u * 12u);
  }
  assert(realman_bt::whiteDetectionChannels("mono8") == 0);
  assert(realman_bt::whiteDetectionChannels("rgb8") == 3);

  rclcpp::init(argc, argv);
  auto ros_node = std::make_shared<rclcpp::Node>("white_objects_remain_test");
  auto publisher_node = std::make_shared<rclcpp::Node>("white_objects_remain_camera");
  const std::string topic = PolicyTaskConfig{}.object_detection.image_topic;
  auto publisher = publisher_node->create_publisher<sensor_msgs::msg::Image>(topic, rclcpp::SensorDataQoS());
  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(ros_node);
  executor.add_node(publisher_node);
  std::thread spin([&executor]() { executor.spin(); });

  const auto blob = makeImage({{300, 200, 30, 20}});
  const auto empty = makeImage({{300, 200, 120, 3}});

  // dry_run: no topic, the table is reported clear, so the Repeat around it ends after one cycle.
  {
    Harness harness;
    realman_bt::WhiteObjectsRemainNode node("dry", harness.nodeConfig(ros_node.get(), true));
    assert(node.executeTick() == bt_core::NodeStatus::FAILURE);
    assert(harness.blackboard->get<bool>("pick_table_clear").value_or(false));
    assert(ros_node->count_subscribers(topic) == 0);
  }

  // Objects on the mat: SUCCESS, table_clear=false.
  {
    Harness harness;
    harness.config.object_detection.settle_sec = 0.2;
    realman_bt::WhiteObjectsRemainNode node("objects", harness.nodeConfig(ros_node.get(), false));
    assert(runWithImage(node, publisher, &blob, std::chrono::seconds(5)) == bt_core::NodeStatus::SUCCESS);
    assert(!harness.blackboard->get<bool>("pick_table_clear").value_or(true));
  }

  // Only cables left: FAILURE with table_clear=true and no failure reason (a normal end).
  {
    Harness harness;
    harness.config.object_detection.settle_sec = 0.2;
    realman_bt::WhiteObjectsRemainNode node("clear", harness.nodeConfig(ros_node.get(), false));
    assert(runWithImage(node, publisher, &empty, std::chrono::seconds(5)) == bt_core::NodeStatus::FAILURE);
    assert(harness.blackboard->get<bool>("pick_table_clear").value_or(false));
    assert(!harness.blackboard->get<std::string>(realman_bt::kPolicyFailureReasonKey).has_value());
  }

  // Images received before settle_sec are not used: with a long settle the node is still waiting.
  {
    Harness harness;
    harness.config.object_detection.settle_sec = 30.0;
    realman_bt::WhiteObjectsRemainNode node("settling", harness.nodeConfig(ros_node.get(), false));
    assert(runWithImage(node, publisher, &blob, std::chrono::seconds(1)) == bt_core::NodeStatus::RUNNING);
    node.halt();
  }

  // No image at all: FAILURE, table_clear=false and a reason for FailInputMode.
  {
    Harness harness;
    harness.config.object_detection.image_topic = "/no_camera/image_raw";
    harness.config.object_detection.settle_sec = 0.0;
    harness.config.object_detection.timeout_sec = 0.5;
    realman_bt::WhiteObjectsRemainNode node("silent", harness.nodeConfig(ros_node.get(), false));
    assert(runWithImage(node, publisher, nullptr, std::chrono::seconds(5)) == bt_core::NodeStatus::FAILURE);
    assert(!harness.blackboard->get<bool>("pick_table_clear").value_or(true));
    const auto reason = harness.blackboard->get<std::string>(realman_bt::kPolicyFailureReasonKey);
    assert(reason.has_value() && reason->find("no image") != std::string::npos);
  }

  // An encoding the counter does not understand fails instead of guessing.
  {
    Harness harness;
    harness.config.object_detection.settle_sec = 0.0;
    realman_bt::WhiteObjectsRemainNode node("mono", harness.nodeConfig(ros_node.get(), false));
    const auto mono = makeImage({}, "mono8");
    assert(runWithImage(node, publisher, &mono, std::chrono::seconds(5)) == bt_core::NodeStatus::FAILURE);
    assert(!harness.blackboard->get<bool>("pick_table_clear").value_or(true));
    assert(node.failureReason().find("mono8") != std::string::npos);
  }

  // An unknown dry_run literal fails rather than becoming a live read.
  {
    Harness harness;
    auto config = harness.nodeConfig(ros_node.get(), true);
    config.port_values["dry_run"] = "maybe";
    realman_bt::WhiteObjectsRemainNode node("bad_literal", config);
    assert(node.executeTick() == bt_core::NodeStatus::FAILURE);
    assert(!harness.blackboard->get<bool>("pick_table_clear").value_or(true));
  }

  executor.cancel();
  spin.join();
  rclcpp::shutdown();
  return 0;
}
