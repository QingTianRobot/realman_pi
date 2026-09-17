#include "realman_bt/terminal_exit_policy.hpp"

int main() {
  realman_bt::TerminalExitPolicy disabled(false);
  disabled.markTerminal(true);
  if (disabled.enabled()) return 1;
  if (disabled.shouldExit(0)) return 2;
  if (disabled.exitCode() != 0) return 3;

  realman_bt::TerminalExitPolicy successful(true);
  if (!successful.enabled()) return 4;
  if (successful.shouldExit(0)) return 5;
  successful.markTerminal(true);
  if (successful.shouldExit(1)) return 6;
  if (!successful.shouldExit(0)) return 7;
  if (successful.exitCode() != 0) return 8;

  realman_bt::TerminalExitPolicy failed(true);
  failed.markTerminal(false);
  if (failed.shouldExit(2)) return 9;
  if (!failed.shouldExit(0)) return 10;
  if (failed.exitCode() != 1) return 11;

  return 0;
}
