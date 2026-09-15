#include <gtest/gtest.h>

#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <string>

#include "runtime_snapshot_service.hpp"

namespace {

class RuntimeSnapshotServiceTest : public ::testing::Test {
 protected:
  void SetUp() override {
    // CTest may launch discovered cases concurrently; each owns its directory.
    std::string pattern = (std::filesystem::temp_directory_path() /
                           "bt-runtime-test-XXXXXX").string();
    ASSERT_NE(::mkdtemp(pattern.data()), nullptr);
    path_ = std::filesystem::path(pattern) / "runtime.json";
  }

  void TearDown() override {
    if (path_.empty()) return;
    std::error_code error;
    std::filesystem::remove(path_, error);
    std::filesystem::remove(path_.parent_path(), error);
  }

  std::filesystem::path path_;
};

TEST_F(RuntimeSnapshotServiceTest, ServesValidSnapshotAsJson) {
  std::ofstream(path_) << R"({"schema_version":1,"tree_id":"arm_move","sequence":3,"root_status":"SUCCESS","nodes":[]})";

  const auto response = bt_server::RuntimeSnapshotService(path_).runtime();

  EXPECT_EQ(response.status, 200);
  EXPECT_EQ(response.content_type, "application/json");
  EXPECT_NE(response.body.find(R"("tree_id":"arm_move")"), std::string::npos);
  EXPECT_NE(response.body.find(R"("sequence":3)"), std::string::npos);
}

TEST_F(RuntimeSnapshotServiceTest, MissingSnapshotReturnsIdleState) {
  const auto response = bt_server::RuntimeSnapshotService(path_).runtime();

  EXPECT_EQ(response.status, 200);
  EXPECT_NE(response.body.find(R"("state":"IDLE")"), std::string::npos);
  EXPECT_NE(response.body.find(R"("root_status":"IDLE")"), std::string::npos);
}

TEST_F(RuntimeSnapshotServiceTest, AcceptsJsonWhitespace) {
  std::ofstream(path_) << " \n\t{\"root_status\":\"RUNNING\",\"nodes\":[]}\r\n";
  EXPECT_EQ(bt_server::RuntimeSnapshotService(path_).runtime().status, 200);
}

TEST_F(RuntimeSnapshotServiceTest, RejectsExcessiveNesting) {
  std::ofstream(path_) << "{\"nodes\":" << std::string(256, '[')
                       << "0" << std::string(256, ']') << "}";
  EXPECT_EQ(bt_server::RuntimeSnapshotService(path_).runtime().status, 503);
}

TEST_F(RuntimeSnapshotServiceTest, RejectsNonJsonWhitespace) {
  std::ofstream(path_) << "{\"nodes\":\v[]}";
  EXPECT_EQ(bt_server::RuntimeSnapshotService(path_).runtime().status, 503);
}

TEST_F(RuntimeSnapshotServiceTest, MalformedSnapshotReturnsServiceUnavailable) {
  std::ofstream(path_) << R"({"schema_version":1,"nodes":[})";

  const auto response = bt_server::RuntimeSnapshotService(path_).runtime();

  EXPECT_EQ(response.status, 503);
  EXPECT_EQ(response.content_type, "application/json");
  EXPECT_NE(response.body.find(R"("ok":false)"), std::string::npos);
}

TEST_F(RuntimeSnapshotServiceTest, OversizedSnapshotReturnsServiceUnavailable) {
  std::ofstream output(path_);
  output << '{' << '"' << "padding" << '"' << ':' << '"'
         << std::string(bt_server::RuntimeSnapshotService::kMaxSnapshotBytes, 'x')
         << "\"}";
  output.close();

  const auto response = bt_server::RuntimeSnapshotService(path_).runtime();

  EXPECT_EQ(response.status, 503);
  EXPECT_NE(response.body.find(R"("ok":false)"), std::string::npos);
}

TEST(ReadOnlyRuntime, MutationResponseUsesMethodNotAllowedContract) {
  const auto response = bt_server::RuntimeSnapshotService::readOnlyMutation();

  EXPECT_EQ(response.status, 405);
  EXPECT_EQ(response.body,
            R"({"ok":false,"error":"read-only runtime monitor"})");
}

}  // namespace
