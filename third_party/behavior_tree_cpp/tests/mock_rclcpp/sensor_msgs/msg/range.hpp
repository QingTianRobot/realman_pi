#pragma once

#include <memory>

namespace sensor_msgs {
namespace msg {

struct Range {
  using SharedPtr = std::shared_ptr<Range>;
  float range{0.0F};
};

}  // namespace msg
}  // namespace sensor_msgs
