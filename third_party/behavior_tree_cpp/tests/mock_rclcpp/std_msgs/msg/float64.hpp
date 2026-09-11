#pragma once

#include <memory>

namespace std_msgs {
namespace msg {

struct Float64 {
  using SharedPtr = std::shared_ptr<Float64>;
  double data{0.0};
};

}  // namespace msg
}  // namespace std_msgs
