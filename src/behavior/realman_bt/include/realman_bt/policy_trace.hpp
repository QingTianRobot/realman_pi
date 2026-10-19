#pragma once

#include <chrono>
#include <fstream>
#include <string>
#include <vector>

#include "realman_bt/policy_supervisor.hpp"

namespace realman_bt {

// UTC time as YYYYMMDD_HHMMSS, the same form the run log directories use.
std::string utcStamp(std::chrono::system_clock::time_point time);

// One CSV per policy attempt: a few `#` comment lines, a column header, one row per sample, and
// `#` footer lines with the outcome. Every row is flushed as it is written so a killed process
// still leaves the trajectory up to that moment. Writing a trace must never get in the way of the
// attempt, so nothing here throws: if the file cannot be opened or written, it just stays closed.
class PolicyTraceWriter {
 public:
  // Creates `dir` if needed and opens <dir>/policy_attempt_<stamp>_<arm>.csv (a numeric suffix is
  // added when that name exists). `notes` become `#` lines under the title. Returns false on failure.
  bool open(const std::string& dir, const std::string& arm, const std::string& stamp,
            const std::vector<std::string>& notes);
  bool isOpen() const { return out_.is_open(); }
  const std::string& path() const { return path_; }

  void writeRow(const std::string& phase, const SupervisorSnapshot& snapshot);

  // Footer lines and close. Ignored when nothing is open.
  void close(const std::string& result, const std::string& grasp, double seconds,
             const std::string& reason);
  void closeHalted();

 private:
  std::ofstream out_;
  std::string path_;
  std::vector<std::string> other_arms_;
};

}  // namespace realman_bt
