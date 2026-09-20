#ifndef REALMAN_BT_RUNTIME_SNAPSHOT_HPP_
#define REALMAN_BT_RUNTIME_SNAPSHOT_HPP_

#include <cstddef>
#include <cstdint>
#include <deque>
#include <filesystem>
#include <mutex>
#include <string>
#include <vector>

#include "bt_core/node_status.hpp"
#include "bt_core/tree.hpp"

namespace realman_bt {

inline constexpr char kRuntimeDiagnosticsBlackboardKey[] =
    "__realman_bt_runtime_diagnostics__";

struct RuntimeEvent {
  std::uint64_t timestamp_ms;
  std::string severity;
  std::string source;
  std::string interface_name;
  std::string phase;
  std::string detail;
};

struct TickStats {
  std::uint64_t running{0};
  std::uint64_t success{0};
  std::uint64_t failure{0};
  std::uint64_t total{0};
};

struct RuntimeDiagnosticsSnapshot {
  TickStats tick_stats;
  std::vector<RuntimeEvent> events;
};

class RuntimeDiagnostics {
 public:
  void recordTick(bt_core::NodeStatus status);
  void recordEvent(RuntimeEvent event);
  RuntimeDiagnosticsSnapshot snapshot() const;

 private:
  static constexpr std::size_t kMaxEvents = 200;

  TickStats tick_stats_;
  std::deque<RuntimeEvent> events_;
  mutable std::mutex mutex_;
};

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
  void write(const bt_core::Tree& tree, std::string tree_id,
             std::uint64_t sequence, const RuntimeDiagnostics* diagnostics);
  void write(const bt_core::Tree& tree, std::string tree_id,
             std::uint64_t sequence, const RuntimeDiagnostics* diagnostics,
             std::size_t pending_cancellations);

  void writeIdle(std::string tree_id);
  void writeIdle(std::string tree_id,
                 const RuntimeDiagnostics* diagnostics);

 private:
  void writeAtomically(const std::string& contents) const;

  std::filesystem::path output_path_;
};

}  // namespace realman_bt

#endif  // REALMAN_BT_RUNTIME_SNAPSHOT_HPP_
