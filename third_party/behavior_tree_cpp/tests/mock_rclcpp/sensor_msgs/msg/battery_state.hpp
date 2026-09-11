#pragma once

#include <memory>

namespace sensor_msgs {
namespace msg {

struct BatteryState {
  using SharedPtr = std::shared_ptr<BatteryState>;
  float percentage{0.0F};
};

}  // namespace msg
}  // namespace sensor_msgs
