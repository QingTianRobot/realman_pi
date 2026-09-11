#pragma once

#include <memory>
#include <string>

namespace std_msgs {
namespace msg {

struct String {
  using SharedPtr = std::shared_ptr<String>;
  std::string data;
};

}  // namespace msg
}  // namespace std_msgs
