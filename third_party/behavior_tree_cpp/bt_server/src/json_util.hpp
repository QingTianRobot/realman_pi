// ============================================================================
//  bt_server/src/json_util.hpp
//  轻量 JSON 序列化辅助 —— 仅用 std::string 拼接，零额外依赖。
//
//  设计说明：
//    本服务对外只产出结构固定的 JSON(节点 manifest / 树状态 / 简单状态对象)，
//    没必要为此引入 nlohmann/json 等重依赖(会和主构建的 include 路径、编译期开销
//    冲突)。这里只实现“字符串转义 + 几个拼装器”，够用且可控。
//
//    安全要点：所有进入 JSON 的字符串(端口名、错误信息、XML 文本等)都必须经过
//    jsonEscape() 转义，避免引号/反斜杠/控制字符破坏 JSON 结构(本质上也是一种
//    输出注入防护)。
// ============================================================================
#ifndef BT_SERVER_JSON_UTIL_HPP
#define BT_SERVER_JSON_UTIL_HPP

#include <optional>
#include <string>

namespace bt_server {

/**
 * @brief 把任意字符串转义为可安全嵌入 JSON 双引号串的内容(不含外层引号)。
 * @param in 原始字符串(可能含引号、反斜杠、换行、控制字符)。
 * @return 转义后的字符串。
 *
 * 处理范围：
 *   - 双引号 "  → \"
 *   - 反斜杠 \  → \\
 *   - 常见控制字符 \b \f \n \r \t 转义为对应转义序列
 *   - 其余 < 0x20 的控制字符 → \u00XX
 */
inline std::string jsonEscape(const std::string& in) {
  std::string out;
  out.reserve(in.size() + 16);
  for (unsigned char c : in) {
    switch (c) {
      case '"':  out += "\\\""; break;
      case '\\': out += "\\\\"; break;
      case '\b': out += "\\b";  break;
      case '\f': out += "\\f";  break;
      case '\n': out += "\\n";  break;
      case '\r': out += "\\r";  break;
      case '\t': out += "\\t";  break;
      default:
        if (c < 0x20) {
          // 其它控制字符用 \u00XX 形式
          static const char* hex = "0123456789abcdef";
          out += "\\u00";
          out += hex[(c >> 4) & 0xF];
          out += hex[c & 0xF];
        } else {
          out += static_cast<char>(c);
        }
    }
  }
  return out;
}

/// @brief 生成一个 JSON 字符串字面量(含外层双引号)。
inline std::string jsonString(const std::string& s) {
  return "\"" + jsonEscape(s) + "\"";
}

/// @brief 生成 `"key":"value"` 形式的键值对(value 为字符串)。
inline std::string jsonKV(const std::string& key, const std::string& value) {
  return jsonString(key) + ":" + jsonString(value);
}

/// @brief 生成 `"key":bool` 形式的键值对。
inline std::string jsonKVBool(const std::string& key, bool value) {
  return jsonString(key) + ":" + (value ? "true" : "false");
}

/// @brief 生成 `"key":number` 形式的键值对(value 为整数)。
inline std::string jsonKVNum(const std::string& key, long long value) {
  return jsonString(key) + ":" + std::to_string(value);
}

/**
 * @brief 从一段 JSON 文本中提取某个顶层字符串字段的值(极简解析)。
 * @param body  JSON 文本，例如 {"xml":"<root>...</root>"}。
 * @param key   要提取的字段名，例如 "xml"。
 * @return 解析成功返回反转义后的字符串值；找不到 / 格式异常返回 nullopt。
 *
 * 说明：本服务的请求体只有 {"xml":"..."} 这一种结构，无需完整 JSON 解析器。
 *   该函数做的事：
 *     1. 定位 "key" 子串；
 *     2. 跳过其后的冒号与空白，要求紧跟一个双引号；
 *     3. 逐字符读取字符串值，正确处理转义(\" \\ \n \t \r \b \f \uXXXX 等)，
 *        直到遇到未转义的结束双引号。
 *   这样即便 XML 内部含有转义引号也能正确还原。
 */
inline std::optional<std::string> jsonExtractString(const std::string& body,
                                                    const std::string& key) {
  const std::string needle = "\"" + key + "\"";
  size_t pos = body.find(needle);
  if (pos == std::string::npos) return std::nullopt;
  pos += needle.size();

  // 跳过空白，期望遇到冒号
  while (pos < body.size() &&
         (body[pos] == ' ' || body[pos] == '\t' || body[pos] == '\n' ||
          body[pos] == '\r')) {
    ++pos;
  }
  if (pos >= body.size() || body[pos] != ':') return std::nullopt;
  ++pos;  // 跳过冒号

  // 跳过空白，期望遇到起始双引号
  while (pos < body.size() &&
         (body[pos] == ' ' || body[pos] == '\t' || body[pos] == '\n' ||
          body[pos] == '\r')) {
    ++pos;
  }
  if (pos >= body.size() || body[pos] != '"') return std::nullopt;
  ++pos;  // 跳过起始双引号

  // 逐字符读取，处理转义，直到未转义的结束双引号
  std::string out;
  out.reserve(body.size() - pos);
  while (pos < body.size()) {
    char c = body[pos];
    if (c == '"') {
      return out;  // 字符串正常结束
    }
    if (c == '\\') {
      if (pos + 1 >= body.size()) break;  // 悬挂反斜杠，格式错误
      char esc = body[pos + 1];
      switch (esc) {
        case '"':  out += '"';  pos += 2; break;
        case '\\': out += '\\'; pos += 2; break;
        case '/':  out += '/';  pos += 2; break;
        case 'b':  out += '\b'; pos += 2; break;
        case 'f':  out += '\f'; pos += 2; break;
        case 'n':  out += '\n'; pos += 2; break;
        case 'r':  out += '\r'; pos += 2; break;
        case 't':  out += '\t'; pos += 2; break;
        case 'u': {
          // \uXXXX：仅处理 BMP 内字符，转成 UTF-8(够用)。
          if (pos + 5 >= body.size()) { out += esc; pos += 2; break; }
          auto hexVal = [](char h) -> int {
            if (h >= '0' && h <= '9') return h - '0';
            if (h >= 'a' && h <= 'f') return h - 'a' + 10;
            if (h >= 'A' && h <= 'F') return h - 'A' + 10;
            return -1;
          };
          int h0 = hexVal(body[pos + 2]), h1 = hexVal(body[pos + 3]),
              h2 = hexVal(body[pos + 4]), h3 = hexVal(body[pos + 5]);
          if (h0 < 0 || h1 < 0 || h2 < 0 || h3 < 0) { out += esc; pos += 2; break; }
          unsigned int cp = (h0 << 12) | (h1 << 8) | (h2 << 4) | h3;
          // 编码为 UTF-8
          if (cp < 0x80) {
            out += static_cast<char>(cp);
          } else if (cp < 0x800) {
            out += static_cast<char>(0xC0 | (cp >> 6));
            out += static_cast<char>(0x80 | (cp & 0x3F));
          } else {
            out += static_cast<char>(0xE0 | (cp >> 12));
            out += static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
            out += static_cast<char>(0x80 | (cp & 0x3F));
          }
          pos += 6;
          break;
        }
        default:
          // 未知转义，原样保留反斜杠后的字符
          out += esc;
          pos += 2;
          break;
      }
    } else {
      out += c;
      ++pos;
    }
  }
  return std::nullopt;  // 没找到结束引号，格式错误
}

}  // namespace bt_server

#endif  // BT_SERVER_JSON_UTIL_HPP
