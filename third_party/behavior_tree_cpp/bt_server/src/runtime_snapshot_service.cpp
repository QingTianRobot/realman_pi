#include "runtime_snapshot_service.hpp"

#include <cctype>
#include <fstream>
#include <string>

#include "json_util.hpp"

namespace bt_server {
namespace {

class JsonValidator {
 public:
  explicit JsonValidator(const std::string& input) : input_(input) {}

  bool valid() {
    skipWhitespace();
    if (position_ == input_.size() || input_[position_] != '{') return false;
    if (!parseValue()) return false;
    skipWhitespace();
    return position_ == input_.size();
  }

 private:
  void skipWhitespace() {
    while (position_ < input_.size() &&
           (input_[position_] == ' ' || input_[position_] == '\t' ||
            input_[position_] == '\r' || input_[position_] == '\n')) {
      ++position_;
    }
  }

  bool parseValue() {
    skipWhitespace();
    if (position_ >= input_.size()) return false;
    switch (input_[position_]) {
      case '{':
      case '[': {
        // Reject pathological nesting before recursive parsing exhausts a
        // worker thread's stack. Real executor snapshots are shallow.
        if (depth_ >= 128) return false;
        ++depth_;
        const bool valid = input_[position_] == '{' ? parseObject() : parseArray();
        --depth_;
        return valid;
      }
      case '"': return parseString();
      case 't': return parseLiteral("true");
      case 'f': return parseLiteral("false");
      case 'n': return parseLiteral("null");
      default: return parseNumber();
    }
  }

  bool parseObject() {
    ++position_;
    skipWhitespace();
    if (position_ < input_.size() && input_[position_] == '}') {
      ++position_;
      return true;
    }
    while (position_ < input_.size()) {
      if (!parseString()) return false;
      skipWhitespace();
      if (position_ >= input_.size() || input_[position_] != ':') return false;
      ++position_;
      if (!parseValue()) return false;
      skipWhitespace();
      if (position_ >= input_.size()) return false;
      if (input_[position_] == '}') {
        ++position_;
        return true;
      }
      if (input_[position_] != ',') return false;
      ++position_;
      skipWhitespace();
    }
    return false;
  }

  bool parseArray() {
    ++position_;
    skipWhitespace();
    if (position_ < input_.size() && input_[position_] == ']') {
      ++position_;
      return true;
    }
    while (position_ < input_.size()) {
      if (!parseValue()) return false;
      skipWhitespace();
      if (position_ >= input_.size()) return false;
      if (input_[position_] == ']') {
        ++position_;
        return true;
      }
      if (input_[position_] != ',') return false;
      ++position_;
      skipWhitespace();
    }
    return false;
  }

  bool parseString() {
    if (position_ >= input_.size() || input_[position_] != '"') return false;
    ++position_;
    while (position_ < input_.size()) {
      const unsigned char character =
          static_cast<unsigned char>(input_[position_++]);
      if (character == '"') return true;
      if (character < 0x20) return false;
      if (character != '\\') continue;
      if (position_ >= input_.size()) return false;
      const char escaped = input_[position_++];
      if (escaped == 'u') {
        if (position_ + 4 > input_.size()) return false;
        for (int i = 0; i < 4; ++i) {
          if (!std::isxdigit(static_cast<unsigned char>(input_[position_++]))) {
            return false;
          }
        }
      } else if (escaped != '"' && escaped != '\\' && escaped != '/' &&
                 escaped != 'b' && escaped != 'f' && escaped != 'n' &&
                 escaped != 'r' && escaped != 't') {
        return false;
      }
    }
    return false;
  }

  bool parseLiteral(const char* literal) {
    const std::string value(literal);
    if (input_.compare(position_, value.size(), value) != 0) return false;
    position_ += value.size();
    return true;
  }

  bool parseNumber() {
    const std::size_t start = position_;
    if (position_ < input_.size() && input_[position_] == '-') ++position_;
    if (position_ >= input_.size()) return false;
    if (input_[position_] == '0') {
      ++position_;
    } else {
      if (input_[position_] < '1' || input_[position_] > '9') return false;
      while (position_ < input_.size() && std::isdigit(
                 static_cast<unsigned char>(input_[position_]))) {
        ++position_;
      }
    }
    if (position_ < input_.size() && input_[position_] == '.') {
      ++position_;
      const std::size_t fraction_start = position_;
      while (position_ < input_.size() && std::isdigit(
                 static_cast<unsigned char>(input_[position_]))) {
        ++position_;
      }
      if (fraction_start == position_) return false;
    }
    if (position_ < input_.size() &&
        (input_[position_] == 'e' || input_[position_] == 'E')) {
      ++position_;
      if (position_ < input_.size() &&
          (input_[position_] == '+' || input_[position_] == '-')) {
        ++position_;
      }
      const std::size_t exponent_start = position_;
      while (position_ < input_.size() && std::isdigit(
                 static_cast<unsigned char>(input_[position_]))) {
        ++position_;
      }
      if (exponent_start == position_) return false;
    }
    return start != position_;
  }

  const std::string& input_;
  std::size_t position_{0};
  std::size_t depth_{0};
};

}  // namespace

RuntimeSnapshotService::RuntimeSnapshotService(std::filesystem::path snapshot_path)
    : snapshot_path_(std::move(snapshot_path)) {}

ApiResponse RuntimeSnapshotService::error(const std::string& message) const {
  return ApiResponse{503,
                     "{" + jsonKVBool("ok", false) + "," +
                         jsonKV("error", message) + "}"};
}

ApiResponse RuntimeSnapshotService::runtime() const {
  std::error_code status_error;
  if (!std::filesystem::exists(snapshot_path_, status_error)) {
    if (status_error) return error("无法读取运行态快照: " + status_error.message());
    return ApiResponse{200,
                       "{" + jsonKV("state", "IDLE") + "," +
                           jsonKV("root_status", "IDLE") +
                           ",\"sequence\":0,\"nodes\":[]}"};
  }

  const bool regular = std::filesystem::is_regular_file(snapshot_path_, status_error);
  if (status_error) return error("无法读取运行态快照: " + status_error.message());
  if (!regular) return error("运行态快照不是普通文件");

  // Size and contents must refer to the same opened inode: the executor
  // atomically replaces this pathname after each tick.
  std::ifstream input(snapshot_path_, std::ios::binary | std::ios::ate);
  if (!input) return error("无法打开运行态快照");
  const auto size = input.tellg();
  if (size < 0) return error("无法读取运行态快照");
  if (static_cast<std::size_t>(size) > kMaxSnapshotBytes) {
    return error("运行态快照超过大小限制");
  }
  input.seekg(0);
  std::string contents(static_cast<std::size_t>(size), '\0');
  input.read(contents.data(), static_cast<std::streamsize>(contents.size()));
  if (input.gcount() != size || input.bad() || input.peek() != EOF) {
    return error("无法读取完整运行态快照");
  }
  if (!JsonValidator(contents).valid()) {
    return error("运行态快照 JSON 格式错误");
  }
  return ApiResponse{200, std::move(contents)};
}

ApiResponse RuntimeSnapshotService::readOnlyMutation() {
  return ApiResponse{405,
                     R"({"ok":false,"error":"read-only runtime monitor"})"};
}

}  // namespace bt_server
