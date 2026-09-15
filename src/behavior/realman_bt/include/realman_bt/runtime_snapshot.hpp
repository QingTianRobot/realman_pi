#ifndef REALMAN_BT_RUNTIME_SNAPSHOT_HPP_
#define REALMAN_BT_RUNTIME_SNAPSHOT_HPP_

#include <cstdint>
#include <filesystem>
#include <string>

#include "bt_core/tree.hpp"

namespace realman_bt {

/**
 * Writes the latest behavior-tree runtime state to a JSON file.
 *
 * The destination is replaced atomically through a sibling `.tmp` file so
 * readers never observe a partially written snapshot.
 */
class RuntimeSnapshotWriter {
 public:
  explicit RuntimeSnapshotWriter(std::filesystem::path output_path);

  void write(const bt_core::Tree& tree, std::string tree_id,
             std::uint64_t sequence);

 void writeIdle(std::string tree_id);

 private:
  void writeAtomically(const std::string& contents) const;

  std::filesystem::path output_path_;
};

}  // namespace realman_bt

#endif  // REALMAN_BT_RUNTIME_SNAPSHOT_HPP_
