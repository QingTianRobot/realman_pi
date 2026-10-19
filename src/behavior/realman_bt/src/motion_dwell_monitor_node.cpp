#include "realman_bt/motion_dwell_monitor_node.hpp"

#include <cmath>
#include <cstdio>
#include <stdexcept>

#include "realman_bt/policy_task_blackboard.hpp"

namespace realman_bt {
namespace {

constexpr double kRadToDeg = 57.29577951308232;

double seconds(std::chrono::steady_clock::time_point at) {
  return std::chrono::duration<double>(at.time_since_epoch()).count();
}

std::string number(double value, int decimals) {
  char buffer[48];
  std::snprintf(buffer, sizeof(buffer), "%.*f", decimals, value);
  return buffer;
}

bool positive(double value) { return std::isfinite(value) && value > 0.0; }

}  // namespace

void MotionMonitorConfig::validate() const {
  if (!positive(dwell_sec)) throw std::invalid_argument("motion_monitor.dwell_sec must be positive");
  if (!positive(tolerance_deg)) {
    throw std::invalid_argument("motion_monitor.tolerance_deg must be positive");
  }
  if (!positive(joint_state_stale_sec)) {
    throw std::invalid_argument("motion_monitor.joint_state_stale_sec must be positive");
  }
}

MotionMonitorConfig declareAndLoadMotionMonitorConfig(rclcpp::Node& node) {
  MotionMonitorConfig config;
  // Dynamically typed so that `dwell_sec: 30` (an integer in YAML) is accepted as well.
  rcl_interfaces::msg::ParameterDescriptor descriptor;
  descriptor.dynamic_typing = true;
  const auto read = [&](const std::string& key, double fallback) {
    if (!node.has_parameter(key)) node.declare_parameter(key, rclcpp::ParameterValue(fallback), descriptor);
    const auto value = node.get_parameter(key).get_parameter_value();
    if (value.get_type() == rclcpp::ParameterType::PARAMETER_DOUBLE) return value.get<double>();
    if (value.get_type() == rclcpp::ParameterType::PARAMETER_INTEGER) {
      return static_cast<double>(value.get<int64_t>());
    }
    throw std::invalid_argument(key + " must be a number");
  };
  config.dwell_sec = read("motion_monitor.dwell_sec", config.dwell_sec);
  config.tolerance_deg = read("motion_monitor.tolerance_deg", config.tolerance_deg);
  config.joint_state_stale_sec = read("motion_monitor.joint_state_stale_sec", config.joint_state_stale_sec);
  config.validate();
  return config;
}

bt_core::PortsList MotionDwellMonitorNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("arm_id", "r", "Arm to watch: l, m or r"),
      bt_core::InputPort<double>("dwell_sec", "motion_monitor.dwell_sec",
                                 "Seconds the arm may stay in one pose before the child is ended"),
      bt_core::InputPort<double>("tolerance_deg", "motion_monitor.tolerance_deg",
                                 "A joint moving more than this from the pose counts as motion"),
      bt_core::InputPort<std::string>("on_dwell", "failure",
                                      "What to return when it fires: failure or success"));
}

double MotionDwellMonitorNode::setting(const char* port, const char* blackboard_key,
                                       double fallback) const {
  if (const auto value = getInput<double>(port)) return *value;
  return blackboard()->get<double>(blackboard_key).value_or(fallback);
}

void MotionDwellMonitorNode::initialize() {
  if (subscription_) return;
  arm_ = getInput<std::string>("arm_id").value_or("r");
  if (arm_ != "l" && arm_ != "m" && arm_ != "r") {
    throw std::runtime_error("MotionDwellMonitor arm_id must be l, m or r, got '" + arm_ + "'");
  }
  auto& ros_node = requireRosNode(blackboard());
  // Best effort accepts both reliable and best-effort publishers.
  subscription_ = ros_node.create_subscription<sensor_msgs::msg::JointState>(
      "/" + arm_ + "/joint_states", rclcpp::QoS(10).best_effort(),
      [this](sensor_msgs::msg::JointState::ConstSharedPtr message) {
        if (message->position.size() < 6) return;
        DwellTracker::Joints degrees{};
        for (std::size_t i = 0; i < 6; ++i) degrees[i] = message->position[i] * kRadToDeg;
        std::lock_guard<std::mutex> lock(mutex_);
        tracker_.onSample(degrees, seconds(Clock::now()));
      });
}

bt_core::NodeStatus MotionDwellMonitorNode::tick() {
  if (!child()) return bt_core::NodeStatus::FAILURE;
  initialize();
  if (!run_active_) {
    const double dwell = setting("dwell_sec", kMotionDwellSecKey, MotionMonitorConfig{}.dwell_sec);
    const double tolerance =
        setting("tolerance_deg", kMotionDwellToleranceDegKey, MotionMonitorConfig{}.tolerance_deg);
    const double stale = blackboard()->get<double>(kMotionDwellStaleSecKey)
                             .value_or(MotionMonitorConfig{}.joint_state_stale_sec);
    MotionMonitorConfig{dwell, tolerance, stale}.validate();
    const std::string on_dwell = getInput<std::string>("on_dwell").value_or("failure");
    if (on_dwell != "failure" && on_dwell != "success") {
      throw std::runtime_error("MotionDwellMonitor on_dwell must be failure or success, got '" + on_dwell + "'");
    }
    on_dwell_ = on_dwell == "success" ? bt_core::NodeStatus::SUCCESS : bt_core::NodeStatus::FAILURE;
    {
      std::lock_guard<std::mutex> lock(mutex_);
      tracker_ = DwellTracker(dwell, tolerance, stale);
    }
    blackboard()->set<bool>(kMotionDwellKey, false);
    blackboard()->remove(kMotionDwellReasonKey);
    run_active_ = true;
  }

  const bt_core::NodeStatus status = child()->executeTick();
  if (status != bt_core::NodeStatus::RUNNING) {
    endRun();
    return status;
  }

  bool dwelled = false;
  double still = 0.0;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const double now = seconds(Clock::now());
    dwelled = tracker_.dwelled(now);
    still = tracker_.stillSec(now);
  }
  if (!dwelled) return bt_core::NodeStatus::RUNNING;

  const std::string reason = "arm " + arm_ + " stayed within " + number(tracker_.toleranceDeg(), 2) +
                             " deg of one pose for " + number(still, 1) + " s (limit " +
                             number(tracker_.dwellSec(), 1) + " s)";
  child()->halt();
  endRun();
  blackboard()->set<bool>(kMotionDwellKey, true);
  blackboard()->set<std::string>(kMotionDwellReasonKey, reason);
  if (on_dwell_ == bt_core::NodeStatus::FAILURE) setFailureReason(reason);
  recordPolicyEvent(blackboard(), "WARN", name(), "dwell", reason);
  return on_dwell_;
}

void MotionDwellMonitorNode::endRun() {
  run_active_ = false;
  std::lock_guard<std::mutex> lock(mutex_);
  tracker_.reset();
}

void MotionDwellMonitorNode::halt() {
  endRun();
  bt_core::DecoratorNode::halt();
}

}  // namespace realman_bt
