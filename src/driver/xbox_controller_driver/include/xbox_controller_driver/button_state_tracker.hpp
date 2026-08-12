#ifndef XBOX_CONTROLLER_DRIVER__BUTTON_STATE_TRACKER_HPP_
#define XBOX_CONTROLLER_DRIVER__BUTTON_STATE_TRACKER_HPP_

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace xbox_controller_driver
{

struct ButtonEvent
{
  std::size_t index;
  std::string name;
  bool pressed;
};

class ButtonStateTracker
{
public:
  explicit ButtonStateTracker(std::vector<std::string> button_names);

  std::vector<ButtonEvent> update(const std::vector<std::int32_t> & buttons);

private:
  std::string name_for(std::size_t index) const;

  std::vector<std::string> button_names_;
  std::vector<std::int32_t> previous_buttons_;
};

}  // namespace xbox_controller_driver

#endif  // XBOX_CONTROLLER_DRIVER__BUTTON_STATE_TRACKER_HPP_
