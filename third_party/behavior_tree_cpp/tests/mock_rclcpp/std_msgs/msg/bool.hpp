#pragma once

#include <memory>

namespace std_msgs {
namespace msg {

struct Bool {
  using SharedPtr = std::shared_ptr<Bool>;
  bool data{false};
};

}  // namespace msg
}  // namespace std_msgs
