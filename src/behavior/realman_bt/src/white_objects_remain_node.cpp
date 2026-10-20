#include "realman_bt/white_objects_remain_node.hpp"

#include <algorithm>
#include <stdexcept>
#include <vector>

#include "realman_bt/policy_task_blackboard.hpp"

namespace realman_bt {

std::size_t countWhiteCorePixels(const std::uint8_t* data, int width, int height, int step,
                                 int channels, const PolicyTaskConfig::ObjectDetection& params) {
  const int x0 = params.roi_xywh[0];
  const int y0 = params.roi_xywh[1];
  const int roi_w = params.roi_xywh[2];
  const int roi_h = params.roi_xywh[3];
  if (x0 < 0 || y0 < 0 || roi_w <= 0 || roi_h <= 0 || x0 + roi_w > width || y0 + roi_h > height) {
    throw std::invalid_argument("object_detection.roi_xywh does not fit in the " + std::to_string(width) +
                                "x" + std::to_string(height) + " image");
  }
  if (channels < 3 || step < width * channels) {
    throw std::invalid_argument("image rows are shorter than width x channels");
  }
  const int k = params.erode_px;
  if (k < 1 || k > roi_w || k > roi_h) return 0;

  // Integral image of the white mask over the ROI, one extra leading row and column of zeros.
  const int stride = roi_w + 1;
  std::vector<std::int32_t> integral(static_cast<std::size_t>(stride) * (roi_h + 1), 0);
  for (int y = 0; y < roi_h; ++y) {
    const std::uint8_t* row = data + static_cast<std::size_t>(y0 + y) * step + x0 * channels;
    std::int32_t row_sum = 0;
    for (int x = 0; x < roi_w; ++x) {
      const std::uint8_t* pixel = row + x * channels;
      const int lo = std::min({pixel[0], pixel[1], pixel[2]});
      const int hi = std::max({pixel[0], pixel[1], pixel[2]});
      row_sum += (lo >= params.min_channel && hi - lo <= params.max_chroma) ? 1 : 0;
      integral[static_cast<std::size_t>(y + 1) * stride + x + 1] =
          integral[static_cast<std::size_t>(y) * stride + x + 1] + row_sum;
    }
  }
  const std::int32_t full = k * k;
  std::size_t count = 0;
  for (int y = 0; y + k <= roi_h; ++y) {
    for (int x = 0; x + k <= roi_w; ++x) {
      const auto at = [&](int yy, int xx) {
        return integral[static_cast<std::size_t>(yy) * stride + xx];
      };
      if (at(y + k, x + k) - at(y, x + k) - at(y + k, x) + at(y, x) == full) ++count;
    }
  }
  return count;
}

int whiteDetectionChannels(const std::string& encoding) {
  if (encoding == "rgb8" || encoding == "bgr8") return 3;
  if (encoding == "rgba8" || encoding == "bgra8") return 4;
  return 0;
}

bt_core::PortsList WhiteObjectsRemainNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<bool>("dry_run", "true", "Report a clear table without reading the camera"),
      bt_core::OutputPort<bool>("table_clear", "true when the check saw no white object on the mat"));
}

bt_core::NodeStatus WhiteObjectsRemainNode::fail(const std::string& reason) {
  setFailureReason(reason);
  recordPolicyFailureReason(blackboard(), reason);
  recordPolicyEvent(blackboard(), "ERROR", name(), "detect", reason);
  if (ros_node_) RCLCPP_ERROR(ros_node_->get_logger(), "[%s] %s", name().c_str(), reason.c_str());
  return bt_core::NodeStatus::FAILURE;
}

bt_core::NodeStatus WhiteObjectsRemainNode::tick() {
  if (!started_) {
    try {
      config_ = &requirePolicyTaskConfig(blackboard());
      ros_node_ = &requireRosNode(blackboard());
    } catch (const std::exception& error) {
      setFailureReason(error.what());
      return bt_core::NodeStatus::FAILURE;
    }
    setOutput<bool>("table_clear", false);
    const auto dry_run_literal = config().port_values.find("dry_run");
    if (dry_run_literal != config().port_values.end() && dry_run_literal->second != "true" &&
        dry_run_literal->second != "false" && dry_run_literal->second != "1" &&
        dry_run_literal->second != "0") {
      return fail("dry_run must be true or false");
    }
    if (getInput<bool>("dry_run").value_or(true)) {
      recordPolicyEvent(blackboard(), "INFO", name(), "detect",
                        "dry-run: camera not read, table reported clear");
      setOutput<bool>("table_clear", true);
      return bt_core::NodeStatus::FAILURE;
    }
    started_ = true;
    started_at_ = Clock::now();
    const auto settle = std::chrono::duration_cast<Clock::duration>(
        std::chrono::duration<double>(config_->object_detection.settle_sec));
    subscription_ = ros_node_->create_subscription<sensor_msgs::msg::Image>(
        config_->object_detection.image_topic, rclcpp::SensorDataQoS(),
        [this, settle](sensor_msgs::msg::Image::ConstSharedPtr message) {
          const auto now = Clock::now();
          std::lock_guard<std::mutex> lock(mutex_);
          if (now - started_at_ < settle) return;
          image_ = std::move(message);
          image_at_ = now;
        });
    recordPolicyEvent(blackboard(), "INFO", name(), "detect",
                      "waiting for " + config_->object_detection.image_topic);
  }

  sensor_msgs::msg::Image::ConstSharedPtr image;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    image = image_;
  }
  const auto& params = config_->object_detection;
  if (!image) {
    const double waited = std::chrono::duration<double>(Clock::now() - started_at_).count();
    if (waited > params.settle_sec + params.timeout_sec) {
      return fail("no image on " + params.image_topic + " within " +
                  std::to_string(params.settle_sec + params.timeout_sec) + " s");
    }
    return bt_core::NodeStatus::RUNNING;
  }
  subscription_.reset();

  const int channels = whiteDetectionChannels(image->encoding);
  if (channels == 0) {
    return fail("unsupported image encoding '" + image->encoding + "' on " + params.image_topic);
  }
  if (image->data.size() < static_cast<std::size_t>(image->step) * image->height) {
    return fail("truncated image on " + params.image_topic);
  }
  std::size_t white = 0;
  try {
    white = countWhiteCorePixels(image->data.data(), static_cast<int>(image->width),
                                 static_cast<int>(image->height), static_cast<int>(image->step),
                                 channels, params);
  } catch (const std::exception& error) {
    return fail(error.what());
  }
  const bool present = white >= static_cast<std::size_t>(params.min_pixels);
  const std::string detail = std::to_string(white) + " white core pixels (objects at " +
                             std::to_string(params.min_pixels) + "): " +
                             (present ? "objects remain" : "table clear");
  recordPolicyEvent(blackboard(), "INFO", name(), "detect", detail);
  RCLCPP_INFO(ros_node_->get_logger(), "[%s] %s", name().c_str(), detail.c_str());
  setOutput<bool>("table_clear", !present);
  started_ = false;
  return present ? bt_core::NodeStatus::SUCCESS : bt_core::NodeStatus::FAILURE;
}

void WhiteObjectsRemainNode::reset() {
  subscription_.reset();
  {
    std::lock_guard<std::mutex> lock(mutex_);
    image_.reset();
  }
  started_ = false;
}

void WhiteObjectsRemainNode::onHalted() { reset(); }

}  // namespace realman_bt
