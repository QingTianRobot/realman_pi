// ============================================================================
//  bt_nodes/data/blackboard_value_util.hpp
//  黑板值读取辅助 —— 在“类型未知”的情况下，把黑板里某个 key 的值取成可比较的形式。
//
//  设计背景：
//    bt_core::Blackboard 用 std::any 做类型擦除，get<T>() 是“精确类型”读取：
//      - key 不存在            → 返回 std::nullopt
//      - key 存在但类型不匹配  → 抛出 std::runtime_error
//    数据类节点（CompareBlackboard / CheckBool）在比较时并不知道写入方用的具体
//    类型（可能是 std::string / double / int / bool 等），因此这里用“依次试探
//    常见类型 + 捕获异常”的方式，把值统一取成字符串或布尔，供上层做数值/字符串
//    比较。这是与精确类型黑板共存的必要妥协，逻辑集中在此以便复用与维护。
// ============================================================================
#ifndef BT_NODES_DATA_BLACKBOARD_VALUE_UTIL_HPP
#define BT_NODES_DATA_BLACKBOARD_VALUE_UTIL_HPP

#include <optional>
#include <sstream>
#include <string>

#include "bt_core/blackboard.hpp"

namespace bt_nodes {
namespace data_util {

/**
 * @brief 把 double 转成简洁字符串（去掉多余尾零），用于把数值型黑板值还原为文本。
 * @details 仅用于“取值成字符串”的展示/回退比较；数值比较仍走 double，不受格式影响。
 */
inline std::string doubleToString(double v) {
  std::ostringstream oss;
  oss << v;  // 默认格式：整数值不带小数点，浮点保留有效位
  return oss.str();
}

/**
 * @brief 尝试把字符串解析为 double。
 * @return 解析成功且“整串被消费”时返回数值；否则 std::nullopt。
 * @details 用 istringstream 解析并要求读完全部字符（避免 "12ab" 被当作 12）。
 */
inline std::optional<double> tryParseDouble(const std::string& s) {
  if (s.empty()) return std::nullopt;
  std::istringstream iss(s);
  double value{};
  iss >> value;
  if (iss.fail()) return std::nullopt;
  // 必须消费完整个字符串（忽略尾随空白），否则视为非纯数值。
  char leftover{};
  if (iss >> leftover) return std::nullopt;
  return value;
}

/**
 * @brief 以“类型未知”的方式，把黑板中 key 对应的值取成字符串。
 * @param bb  黑板（非空）
 * @param key 黑板键名
 * @return key 存在且为常见类型之一时返回其文本形式；key 不存在或类型不在支持
 *         列表内时返回 std::nullopt。
 * @details 依次试探 std::string / double / int / long / float / bool。
 *          get<T>() 在类型不匹配时抛 runtime_error，这里逐一捕获后继续试探下一个
 *          类型，因此不会产生误转换（std::any_cast 是精确类型匹配）。
 */
inline std::optional<std::string> readKeyAsString(
    const bt_core::Blackboard::Ptr& bb, const std::string& key) {
  if (!bb || !bb->contains(key)) return std::nullopt;

  try {
    if (auto v = bb->get<std::string>(key)) return *v;
  } catch (const std::exception&) { /* 类型不符，继续试探 */ }
  try {
    if (auto v = bb->get<double>(key)) return doubleToString(*v);
  } catch (const std::exception&) {}
  try {
    if (auto v = bb->get<int>(key)) return std::to_string(*v);
  } catch (const std::exception&) {}
  try {
    if (auto v = bb->get<long>(key)) return std::to_string(*v);
  } catch (const std::exception&) {}
  try {
    if (auto v = bb->get<float>(key)) return doubleToString(static_cast<double>(*v));
  } catch (const std::exception&) {}
  try {
    if (auto v = bb->get<bool>(key)) return *v ? "true" : "false";
  } catch (const std::exception&) {}

  return std::nullopt;  // 存在但类型不在支持列表内
}

/**
 * @brief 以“类型未知”的方式，把黑板中 key 对应的值取成 bool。
 * @details 先试 bool 精确读取；失败则取成字符串再按 "true"/"1" 解析（兼容写入方
 *          用字符串存布尔的情况）。key 不存在返回 std::nullopt。
 */
inline std::optional<bool> readKeyAsBool(
    const bt_core::Blackboard::Ptr& bb, const std::string& key) {
  if (!bb || !bb->contains(key)) return std::nullopt;

  try {
    if (auto v = bb->get<bool>(key)) return *v;
  } catch (const std::exception&) { /* 非 bool 存储，走字符串回退 */ }

  if (auto s = readKeyAsString(bb, key)) {
    return (*s == "true" || *s == "1");
  }
  return std::nullopt;
}

}  // namespace data_util
}  // namespace bt_nodes

#endif  // BT_NODES_DATA_BLACKBOARD_VALUE_UTIL_HPP
