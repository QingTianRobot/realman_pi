#ifndef BT_SERVER_RUNTIME_SNAPSHOT_SERVICE_HPP
#define BT_SERVER_RUNTIME_SNAPSHOT_SERVICE_HPP

#include <cstddef>
#include <filesystem>

#include "tree_api_service.hpp"

namespace bt_server {

/** Serves the executor's atomically-written runtime snapshot without mutation. */
class RuntimeSnapshotService {
 public:
  static constexpr std::size_t kMaxSnapshotBytes = 1024 * 1024;

  explicit RuntimeSnapshotService(std::filesystem::path snapshot_path);

  ApiResponse runtime() const;
  static ApiResponse readOnlyMutation();

 private:
  ApiResponse error(const std::string& message) const;

  std::filesystem::path snapshot_path_;
};

}  // namespace bt_server

#endif  // BT_SERVER_RUNTIME_SNAPSHOT_SERVICE_HPP
