#pragma once

#include <chrono>
#include <cstddef>
#include <cstdint>
#include <mutex>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "sensor_msgs/msg/image.hpp"

namespace realman_bt {

// Counts the pixels of the ROI that are white and whose whole erode_px x erode_px square (inside
// the ROI) is white too: a box erosion, so thin white lines such as cables vanish while solid
// blobs keep their core. channels is the bytes per pixel (3 or 4); the channel order does not
// matter because only the smallest and largest channel are used. Throws std::invalid_argument if
// the ROI does not fit in the image.
std::size_t countWhiteCorePixels(const std::uint8_t* data, int width, int height, int step,
                                 int channels, const PolicyTaskConfig::ObjectDetection& params);

// Bytes per pixel for the encodings the counter understands (rgb8/bgr8 = 3, rgba8/bgra8 = 4), or 0.
int whiteDetectionChannels(const std::string& encoding);

// Are white objects still on the mat? Looks at one global-camera image received at least
// object_detection.settle_sec after the check started (so it shows the parked arm), counts the
// white core pixels in the ROI and writes `table_clear`.
//
// SUCCESS: objects remain (table_clear=false), so the pick cycle goes on.
// FAILURE with table_clear=true: the table is clear; this ends the surrounding Repeat normally.
// FAILURE with table_clear=false: no usable image (none within timeout_sec, unknown encoding,
//   ROI outside the image); policy_failure_reason says why.
//
// dry_run=true touches no topic and reports a clear table, so a dry run does one cycle and ends.
class WhiteObjectsRemainNode final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  using Clock = std::chrono::steady_clock;

  bt_core::NodeStatus fail(const std::string& reason);
  void reset();

  const PolicyTaskConfig* config_{nullptr};
  rclcpp::Node* ros_node_{nullptr};
  rclcpp::Subscription<sensor_msgs::msg::Image>::SharedPtr subscription_;

  std::mutex mutex_;
  sensor_msgs::msg::Image::ConstSharedPtr image_;
  Clock::time_point image_at_{};

  bool started_{false};
  Clock::time_point started_at_{};
};

}  // namespace realman_bt
