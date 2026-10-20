#include "realman_bt/policy_trace.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <ctime>
#include <filesystem>
#include <system_error>

namespace realman_bt {
namespace {

std::string fixed(double value, int decimals) {
  if (std::isnan(value)) return "";
  char buffer[48];
  std::snprintf(buffer, sizeof(buffer), "%.*f", decimals, value);
  return buffer;
}

std::string oneLine(std::string text) {
  std::replace(text.begin(), text.end(), '\n', ' ');
  std::replace(text.begin(), text.end(), '\r', ' ');
  return text;
}

}  // namespace

std::string utcStamp(std::chrono::system_clock::time_point time) {
  const std::time_t seconds = std::chrono::system_clock::to_time_t(time);
  std::tm parts{};
  gmtime_r(&seconds, &parts);
  char buffer[32];
  std::strftime(buffer, sizeof(buffer), "%Y%m%d_%H%M%S", &parts);
  return buffer;
}

bool PolicyTraceWriter::open(const std::string& dir, const std::string& arm, const std::string& stamp,
                             const std::vector<std::string>& notes) {
  if (out_.is_open()) out_.close();
  namespace fs = std::filesystem;
  std::error_code error;
  fs::create_directories(dir, error);
  if (error) return false;

  const std::string base = "policy_attempt_" + stamp + "_" + arm;
  fs::path path = fs::path(dir) / (base + ".csv");
  for (int suffix = 2; fs::exists(path, error) && suffix < 1000; ++suffix) {
    path = fs::path(dir) / (base + "_" + std::to_string(suffix) + ".csv");
  }
  out_.open(path);
  if (!out_.is_open()) return false;
  path_ = path.string();

  other_arms_.clear();
  for (const char* other : {"l", "m", "r"}) {
    if (arm != other) other_arms_.push_back(other);
  }
  out_ << "# policy attempt started " << stamp << " arm=" << arm << "\n";
  for (const auto& note : notes) out_ << "# " << oneLine(note) << "\n";
  out_ << "t_sec,phase,q1_deg,q2_deg,q3_deg,q4_deg,q5_deg,q6_deg";
  for (const auto& other : other_arms_) out_ << ",drift_" << other << "_deg";
  out_ << ",cmd_lin_mps,cmd_ang_radps,policy_gripper,gripper_position,torque_reached,closed_total_sec,"
          "allow_publish,paused,i1_ma,i2_ma,i3_ma,i4_ma,i5_ma,i6_ma\n";
  out_.flush();
  return true;
}

void PolicyTraceWriter::writeRow(const std::string& phase, const SupervisorSnapshot& snapshot) {
  if (!out_.is_open()) return;
  out_ << fixed(snapshot.elapsed_sec, 2) << "," << phase;
  for (std::size_t joint = 0; joint < 6; ++joint) {
    out_ << "," << (snapshot.arm_valid ? fixed(snapshot.arm[joint], 2) : std::string());
  }
  for (const auto& other : other_arms_) {
    const auto drift = snapshot.drift_deg.find(other);
    out_ << "," << (drift != snapshot.drift_deg.end() ? fixed(drift->second, 2) : std::string());
  }
  out_ << "," << fixed(snapshot.cmd_linear, 4) << "," << fixed(snapshot.cmd_angular, 4) << ","
       << fixed(snapshot.policy_gripper, 2) << "," << fixed(snapshot.gripper_position, 0) << ","
       << (snapshot.torque_reached ? 1 : 0) << "," << fixed(snapshot.closed_total_sec, 2) << ","
       << (snapshot.stats_allow_publish ? 1 : 0) << "," << (snapshot.stats_paused ? 1 : 0);
  for (std::size_t joint = 0; joint < 6; ++joint) {
    out_ << "," << (snapshot.currents_valid ? fixed(snapshot.currents_ma[joint], 0) : std::string());
  }
  out_ << "\n";
  out_.flush();
}

void PolicyTraceWriter::close(const std::string& result, const std::string& grasp, double seconds,
                              const std::string& reason) {
  if (!out_.is_open()) return;
  out_ << "# result=" << result << "\n"
       << "# grasp=" << (grasp.empty() ? "n/a" : grasp) << "\n"
       << "# seconds=" << fixed(seconds, 2) << "\n"
       << "# reason=" << oneLine(reason) << "\n";
  out_.close();
}

void PolicyTraceWriter::closeHalted() {
  if (!out_.is_open()) return;
  out_ << "# result=halted\n";
  out_.close();
}

}  // namespace realman_bt
