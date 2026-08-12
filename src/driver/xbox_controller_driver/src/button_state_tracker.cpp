#include "xbox_controller_driver/button_state_tracker.hpp"

#include <algorithm>
#include <utility>

namespace xbox_controller_driver
{

ButtonStateTracker::ButtonStateTracker(std::vector<std::string> button_names)
: button_names_(std::move(button_names))
{
}

std::vector<ButtonEvent> ButtonStateTracker::update(const std::vector<std::int32_t> & buttons)
{
  std::vector<ButtonEvent> events;
  const auto button_count = std::max(buttons.size(), previous_buttons_.size());
  events.reserve(button_count);

  for (std::size_t index = 0; index < button_count; ++index) {
    const auto current = index < buttons.size() ? buttons[index] : 0;
    const auto previous = index < previous_buttons_.size() ? previous_buttons_[index] : 0;
    if ((current != 0) == (previous != 0)) {
      continue;
    }
    events.push_back(ButtonEvent{index, name_for(index), current != 0});
  }

  previous_buttons_ = buttons;
  return events;
}

std::string ButtonStateTracker::name_for(const std::size_t index) const
{
  if (index < button_names_.size() && !button_names_[index].empty()) {
    return button_names_[index];
  }
  return "button_" + std::to_string(index);
}

}  // namespace xbox_controller_driver
