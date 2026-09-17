#pragma once

#include <cstddef>

namespace realman_bt {

class TerminalExitPolicy {
 public:
  explicit TerminalExitPolicy(bool enabled) : enabled_(enabled) {}

  void markTerminal(bool succeeded) {
    terminal_ = true;
    exit_code_ = succeeded ? 0 : 1;
  }

  bool shouldExit(std::size_t pending_cancellation_drains) const {
    return enabled_ && terminal_ && pending_cancellation_drains == 0;
  }

  bool enabled() const { return enabled_; }
  int exitCode() const { return exit_code_; }

 private:
  bool enabled_{false};
  bool terminal_{false};
  int exit_code_{0};
};

}  // namespace realman_bt
