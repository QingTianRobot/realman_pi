// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>
#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>

#include <unistd.h>

#include "realman_bt/policy_trace.hpp"

namespace {

namespace fs = std::filesystem;
using realman_bt::PolicyTraceWriter;
using realman_bt::SupervisorSnapshot;

fs::path scratchDir(const std::string& name) {
  const fs::path dir = fs::temp_directory_path() / ("policy_trace_test_" + name + "_" + std::to_string(::getpid()));
  fs::remove_all(dir);
  return dir;
}

std::vector<std::string> lines(const std::string& path) {
  std::ifstream in(path);
  std::vector<std::string> result;
  for (std::string line; std::getline(in, line);) result.push_back(line);
  return result;
}

std::vector<std::string> split(const std::string& line) {
  std::vector<std::string> fields;
  std::string field;
  for (char c : line) {
    if (c == ',') {
      fields.push_back(field);
      field.clear();
    } else {
      field += c;
    }
  }
  fields.push_back(field);
  return fields;
}

SupervisorSnapshot sample() {
  SupervisorSnapshot s;
  s.started = true;
  s.elapsed_sec = 12.345;
  s.arm_valid = true;
  s.arm = {-9.891, 18.046, 79.074, 15.505, 79.606, -6.194};
  s.drift_deg = {{"l", 0.031}, {"m", 0.004}};
  s.policy_gripper = 0.5;
  s.gripper_position = 5750.4;
  s.torque_reached = true;
  s.cmd_linear = 0.0834;
  s.cmd_angular = 0.25;
  s.stats_allow_publish = true;
  s.stats_paused = false;
  s.closed_total_sec = 3.21;
  s.currents_valid = true;
  s.currents_ma = {812.4, -2440.6, 1503.0, 95.0, -310.2, 12.0};
  return s;
}

const char* kHeader =
    "t_sec,phase,q1_deg,q2_deg,q3_deg,q4_deg,q5_deg,q6_deg,drift_l_deg,drift_m_deg,cmd_lin_mps,cmd_ang_radps,"
    "policy_gripper,gripper_position,torque_reached,closed_total_sec,allow_publish,paused,"
    "i1_ma,i2_ma,i3_ma,i4_ma,i5_ma,i6_ma";

void testOpenCreatesTheDirectoryAndWritesAHeader() {
  const fs::path dir = scratchDir("open") / "nested" / "attempts";
  PolicyTraceWriter trace;

  assert(trace.open(dir.string(), "r", "20261014_120000", {"envelope J1 -73.4..40.1"}));

  assert(trace.isOpen());
  assert(fs::exists(trace.path()));
  const auto content = lines(trace.path());
  assert(content.at(0) == "# policy attempt started 20261014_120000 arm=r");
  assert(content.at(1) == "# envelope J1 -73.4..40.1");
  assert(content.at(2) == kHeader);
  fs::remove_all(dir.parent_path().parent_path());
}

void testTheFileNameCarriesTheTimeAndTheArm() {
  const fs::path dir = scratchDir("name");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  assert(fs::path(trace.path()).filename() == "policy_attempt_20261014_120000_r.csv");
  fs::remove_all(dir);
}

void testTwoAttemptsInTheSameSecondDoNotOverwriteEachOther() {
  const fs::path dir = scratchDir("same_second");
  PolicyTraceWriter first;
  PolicyTraceWriter second;
  assert(first.open(dir.string(), "r", "20261014_120000", {}));
  assert(second.open(dir.string(), "r", "20261014_120000", {}));
  assert(first.path() != second.path());
  assert(fs::path(second.path()).filename() == "policy_attempt_20261014_120000_r_2.csv");
  fs::remove_all(dir);
}

void testARowIsOnDiskAsSoonAsItIsWritten() {
  const fs::path dir = scratchDir("flush");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));

  trace.writeRow("running", sample());

  // Read while the writer is still open: a killed process must not lose the rows.
  assert(lines(trace.path()).size() == 3);  // title, column header, the row
  fs::remove_all(dir);
}

void testARowHasTheDocumentedColumns() {
  const fs::path dir = scratchDir("row");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));

  trace.writeRow("running", sample());

  const auto fields = split(lines(trace.path()).at(2));
  assert((fields == std::vector<std::string>{"12.35", "running", "-9.89", "18.05", "79.07", "15.51", "79.61",
                                             "-6.19", "0.03", "0.00", "0.0834", "0.2500", "0.50", "5750", "1",
                                             "3.21", "1", "0", "812", "-2441", "1503", "95", "-310", "12"}));
  fs::remove_all(dir);
}

void testMissingReadingsAreLeftEmpty() {
  const fs::path dir = scratchDir("nan");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  SupervisorSnapshot empty;

  trace.writeRow("running", empty);

  const auto fields = split(lines(trace.path()).at(2));
  assert(fields.size() == 24);
  assert(fields[2].empty());   // q1: no arm reading
  assert(fields[10].empty());  // cmd_lin
  assert(fields[12].empty());  // policy_gripper
  assert(fields[13].empty());  // gripper_position
  for (std::size_t i = 18; i < 24; ++i) assert(fields[i].empty());  // no current reading
  fs::remove_all(dir);
}

void testTheFooterRecordsTheOutcome() {
  const fs::path dir = scratchDir("footer");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  trace.writeRow("running", sample());

  trace.close("fault", "", 43.8019, "joint J6 = 49.5 deg is outside\n[-125.1, 49.0]");

  const auto content = lines(trace.path());
  assert(content[content.size() - 4] == "# result=fault");
  assert(content[content.size() - 3] == "# grasp=n/a");
  assert(content[content.size() - 2] == "# seconds=43.80");
  assert(content[content.size() - 1] == "# reason=joint J6 = 49.5 deg is outside [-125.1, 49.0]");
  assert(!trace.isOpen());
  fs::remove_all(dir);
}

void testNothingIsWrittenAfterTheFooter() {
  const fs::path dir = scratchDir("after_close");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  trace.close("released_held", "held", 20.0, "");
  const auto before = lines(trace.path());

  trace.writeRow("running", sample());
  trace.close("fault", "", 1.0, "again");
  trace.closeHalted();

  assert(lines(trace.path()) == before);
  fs::remove_all(dir);
}

void testAHaltedAttemptSaysSo() {
  const fs::path dir = scratchDir("halted");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  trace.writeRow("running", sample());

  trace.closeHalted();

  assert(lines(trace.path()).back() == "# result=halted");
  assert(!trace.isOpen());
  fs::remove_all(dir);
}

void testAnUnwritableDirectoryIsNotAnError() {
  PolicyTraceWriter trace;

  assert(!trace.open("/proc/no_such_place/policy", "r", "20261014_120000", {}));

  assert(!trace.isOpen());
  trace.writeRow("running", sample());  // all of these are quietly ignored
  trace.close("fault", "", 1.0, "x");
  trace.closeHalted();
}

void testReopeningStartsANewFile() {
  const fs::path dir = scratchDir("reopen");
  PolicyTraceWriter trace;
  assert(trace.open(dir.string(), "r", "20261014_120000", {}));
  trace.close("released_held", "held", 1.0, "");
  const std::string first = trace.path();

  assert(trace.open(dir.string(), "r", "20261014_120100", {}));

  assert(trace.path() != first);
  assert(trace.isOpen());
  fs::remove_all(dir);
}

void testUtcStampFormat() {
  assert(realman_bt::utcStamp(std::chrono::system_clock::time_point{}) == "19700101_000000");
  const auto t = std::chrono::system_clock::time_point{} + std::chrono::seconds(1791968018);
  assert(realman_bt::utcStamp(t) == "20261014_085338");
}

}  // namespace

int main() {
  testOpenCreatesTheDirectoryAndWritesAHeader();
  testTheFileNameCarriesTheTimeAndTheArm();
  testTwoAttemptsInTheSameSecondDoNotOverwriteEachOther();
  testARowIsOnDiskAsSoonAsItIsWritten();
  testARowHasTheDocumentedColumns();
  testMissingReadingsAreLeftEmpty();
  testTheFooterRecordsTheOutcome();
  testNothingIsWrittenAfterTheFooter();
  testAHaltedAttemptSaysSo();
  testAnUnwritableDirectoryIsNotAnError();
  testReopeningStartsANewFile();
  testUtcStampFormat();
  return 0;
}
