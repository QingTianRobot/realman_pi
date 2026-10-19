#pragma once

#include <algorithm>
#include <array>
#include <cmath>
#include <optional>

namespace realman_bt {

// How long one arm has stayed in the same pose, with no ROS in it: it is fed the arm's joint
// readings as they arrive and asked once per tick. All times are seconds on one monotonic clock.
//
// The first reading after reset() becomes the anchor pose. A reading with any joint more than
// tolerance_deg away from the anchor moves the anchor there and restarts the clock, so the arm is
// "still" while every reading stays inside a box of +-tolerance_deg around one pose. A gap in the
// readings longer than stale_sec also restarts the clock at the next reading: stillness that
// nobody observed is never counted.
class DwellTracker {
 public:
  using Joints = std::array<double, 6>;  // degrees

  DwellTracker(double dwell_sec, double tolerance_deg, double stale_sec)
      : dwell_sec_(dwell_sec), tolerance_deg_(tolerance_deg), stale_sec_(stale_sec) {}

  // Forgets the anchor; the next reading starts a new window.
  void reset() {
    anchor_.reset();
    has_sample_ = false;
  }

  void onSample(const Joints& degrees, double time) {
    const bool gap = has_sample_ && time - last_sample_time_ > stale_sec_;
    has_sample_ = true;
    last_sample_time_ = time;
    if (!anchor_ || gap || farFromAnchor(degrees)) {
      anchor_ = degrees;
      anchor_time_ = time;
    }
  }

  // Seconds the arm has been still up to `now`; 0 without an anchor or while the readings are stale.
  double stillSec(double now) const {
    if (!anchor_ || stale(now)) return 0.0;
    return std::max(0.0, now - anchor_time_);
  }

  bool dwelled(double now) const { return anchor_ && !stale(now) && now - anchor_time_ >= dwell_sec_; }

  // No reading yet in this window, or the latest is older than stale_sec.
  bool stale(double now) const { return !has_sample_ || now - last_sample_time_ > stale_sec_; }

  const std::optional<Joints>& anchor() const { return anchor_; }
  double dwellSec() const { return dwell_sec_; }
  double toleranceDeg() const { return tolerance_deg_; }

 private:
  bool farFromAnchor(const Joints& degrees) const {
    for (std::size_t joint = 0; joint < degrees.size(); ++joint) {
      if (std::fabs(degrees[joint] - (*anchor_)[joint]) > tolerance_deg_) return true;
    }
    return false;
  }

  double dwell_sec_;
  double tolerance_deg_;
  double stale_sec_;
  std::optional<Joints> anchor_;
  double anchor_time_{0.0};
  bool has_sample_{false};
  double last_sample_time_{0.0};
};

}  // namespace realman_bt
