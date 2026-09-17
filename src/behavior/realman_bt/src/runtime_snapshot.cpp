#include "realman_bt/runtime_snapshot.hpp"

#include <chrono>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <system_error>
#include <utility>
#include <vector>

#include "bt_core/node_status.hpp"

namespace realman_bt {
namespace {

std::string escapeJson(const std::string& value) {
  static constexpr char kHex[] = "0123456789ABCDEF";
  std::string escaped;
  escaped.reserve(value.size());
  for (unsigned char character : value) {
    switch (character) {
      case '"': escaped += "\\\""; break;
      case '\\': escaped += "\\\\"; break;
      case '\b': escaped += "\\b"; break;
      case '\f': escaped += "\\f"; break;
      case '\n': escaped += "\\n"; break;
      case '\r': escaped += "\\r"; break;
      case '\t': escaped += "\\t"; break;
      default:
        if (character < 0x20) {
          escaped += "\\u00";
          escaped.push_back(kHex[(character >> 4) & 0x0F]);
          escaped.push_back(kHex[character & 0x0F]);
        } else {
          escaped.push_back(static_cast<char>(character));
        }
    }
  }
  return escaped;
}

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  const auto milliseconds =
      std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
  return static_cast<std::uint64_t>(milliseconds.count());
}

void appendStringField(std::ostringstream& json, const char* name,
                       const std::string& value, bool trailing_comma = true) {
  json << "\"" << name << "\":\"" << escapeJson(value) << "\"";
  if (trailing_comma) json << ",";
}

void appendDiagnostics(std::ostringstream& json,
                       const RuntimeDiagnostics* diagnostics) {
  const RuntimeDiagnosticsSnapshot snapshot =
      diagnostics ? diagnostics->snapshot() : RuntimeDiagnosticsSnapshot{};
  json << ",\"tick_stats\":{\"running\":" << snapshot.tick_stats.running
       << ",\"success\":" << snapshot.tick_stats.success
       << ",\"failure\":" << snapshot.tick_stats.failure
       << ",\"total\":" << snapshot.tick_stats.total << "},\"events\":[";
  bool first = true;
  for (const RuntimeEvent& event : snapshot.events) {
    if (!first) json << ",";
    first = false;
    json << "{\"timestamp_ms\":" << event.timestamp_ms << ",";
    appendStringField(json, "severity", event.severity);
    appendStringField(json, "source", event.source);
    appendStringField(json, "interface_name", event.interface_name);
    appendStringField(json, "phase", event.phase);
    appendStringField(json, "detail", event.detail, false);
    json << "}";
  }
  json << "]";
}

}  // namespace

void RuntimeDiagnostics::recordTick(bt_core::NodeStatus status) {
  std::lock_guard<std::mutex> lock(mutex_);
  ++tick_stats_.total;
  switch (status) {
    case bt_core::NodeStatus::RUNNING:
      ++tick_stats_.running;
      break;
    case bt_core::NodeStatus::SUCCESS:
      ++tick_stats_.success;
      break;
    case bt_core::NodeStatus::FAILURE:
      ++tick_stats_.failure;
      break;
    case bt_core::NodeStatus::IDLE:
      break;
  }
}

void RuntimeDiagnostics::recordEvent(RuntimeEvent event) {
  std::lock_guard<std::mutex> lock(mutex_);
  events_.push_back(std::move(event));
  if (events_.size() > kMaxEvents) events_.pop_front();
}

RuntimeDiagnosticsSnapshot RuntimeDiagnostics::snapshot() const {
  std::lock_guard<std::mutex> lock(mutex_);
  return {tick_stats_, {events_.begin(), events_.end()}};
}

RuntimeSnapshotWriter::RuntimeSnapshotWriter(std::filesystem::path output_path)
    : output_path_(std::move(output_path)) {}

void RuntimeSnapshotWriter::writeIdle(std::string tree_id) {
  writeIdle(std::move(tree_id), nullptr);
}

void RuntimeSnapshotWriter::writeIdle(std::string tree_id,
                                      const RuntimeDiagnostics* diagnostics) {
  std::ostringstream json;
  json << "{\"schema_version\":2,";
  appendStringField(json, "tree_id", tree_id);
  json << "\"sequence\":0,\"timestamp_ms\":" << timestampMilliseconds()
       << ",\"root_status\":\"IDLE\"";
  appendDiagnostics(json, diagnostics);
  json << ",\"nodes\":[]}";
  writeAtomically(json.str());
}

void RuntimeSnapshotWriter::write(const bt_core::Tree& tree, std::string tree_id,
                                  std::uint64_t sequence) {
  write(tree, std::move(tree_id), sequence, nullptr);
}

void RuntimeSnapshotWriter::write(const bt_core::Tree& tree, std::string tree_id,
                                  std::uint64_t sequence,
                                  const RuntimeDiagnostics* diagnostics) {
  std::string root_failure_reason;
  tree.visitNodes([&](const bt_core::TreeNode::Ptr& node, int) {
    if (root_failure_reason.empty() && node->status() == bt_core::NodeStatus::FAILURE &&
        !node->failureReason().empty()) {
      root_failure_reason = node->failureReason();
    }
  });
  std::ostringstream json;
  json << "{\"schema_version\":2,";
  appendStringField(json, "tree_id", tree_id);
  json << "\"sequence\":" << sequence
       << ",\"timestamp_ms\":" << timestampMilliseconds()
       << ",\"root_status\":\""
       << escapeJson(tree.root() ? bt_core::toStr(tree.root()->status()) : "IDLE")
       << "\"";

  if (!root_failure_reason.empty()) {
    json << ",\"failure_reason\":\"" << escapeJson(root_failure_reason) << "\"";
  }
  appendDiagnostics(json, diagnostics);
  json << ",\"nodes\":[";

  bool first = true;
  std::size_t node_index = 0;
  std::vector<std::string> paths;
  std::vector<std::size_t> next_child_indices;
  tree.visitNodes([&](const bt_core::TreeNode::Ptr& node, int depth) {
    if (depth < 0) depth = 0;
    const auto level = static_cast<std::size_t>(depth);
    if (paths.size() > level) paths.resize(level);
    if (next_child_indices.size() > level) next_child_indices.resize(level);

    std::string path;
    if (level == 0) {
      path = "0";
    } else {
      if (paths.size() < level) paths.resize(level);
      const std::size_t child_index = next_child_indices[level - 1]++;
      path = paths[level - 1] + "/" + std::to_string(child_index);
    }
    paths.push_back(path);
    next_child_indices.push_back(0);

    if (!first) json << ",";
    first = false;
    json << "{";
    appendStringField(json, "key", "n" + std::to_string(node_index++));
    appendStringField(json, "name", node->name());
    appendStringField(json, "registration_name", node->registrationName());
    appendStringField(json, "kind", bt_core::toStr(node->type()));
    appendStringField(json, "path", path);
    appendStringField(json, "status", bt_core::toStr(node->status()),
                      !node->failureReason().empty());
    if (!node->failureReason().empty()) {
      appendStringField(json, "failure_reason", node->failureReason(), false);
    }
    json << "}";
  });

  json << "]}";
  writeAtomically(json.str());
}

void RuntimeSnapshotWriter::writeAtomically(const std::string& contents) const {
  const auto parent = output_path_.parent_path();
  if (!parent.empty()) {
    std::error_code mkdir_error;
    std::filesystem::create_directories(parent, mkdir_error);
    if (mkdir_error) {
      throw std::runtime_error("failed to create snapshot directory '" +
                               parent.string() + "': " + mkdir_error.message());
    }
  }

  auto temporary_path = output_path_;
  temporary_path += ".tmp";
  {
    std::ofstream output(temporary_path,
                         std::ios::binary | std::ios::out | std::ios::trunc);
    if (!output) {
      throw std::runtime_error("failed to open snapshot temporary file '" +
                               temporary_path.string() + "'");
    }
    output << contents;
    output.flush();
    if (!output) {
      std::error_code remove_error;
      std::filesystem::remove(temporary_path, remove_error);
      throw std::runtime_error("failed to write snapshot temporary file '" +
                               temporary_path.string() + "'");
    }
  }

  std::error_code rename_error;
  std::filesystem::rename(temporary_path, output_path_, rename_error);
  if (rename_error) {
    std::error_code remove_error;
    std::filesystem::remove(temporary_path, remove_error);
    throw std::runtime_error("failed to replace snapshot '" +
                             output_path_.string() + "': " +
                             rename_error.message());
  }
}

}  // namespace realman_bt
