// ============================================================================
//  bt_core/blackboard.hpp
//  黑板(Blackboard) —— 节点之间共享数据的类型安全 KV 存储。
//
//  设计说明：
//    行为树的节点本身应保持“无状态可复用”。节点之间、节点与外部世界之间需要
//    交换数据(例如：感知节点写入目标坐标，移动节点读取它)。黑板就是这个共享
//    内存：以字符串为 key，以类型擦除的 std::any 为 value，读写时做类型校验。
//
//    端口(Port)：节点声明自己需要哪些输入/输出端口，端口名在树文件里可被重
//    映射到不同的黑板 key，从而实现“同一个节点，连接不同数据”的复用。
// ============================================================================
#ifndef BT_CORE_BLACKBOARD_HPP
#define BT_CORE_BLACKBOARD_HPP

#include <any>
#include <memory>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <typeinfo>
#include <unordered_map>
#include <vector>

// demangle：把 typeid(T).name() 的编译器修饰名还原为可读类型名。
// GCC/Clang 提供 <cxxabi.h> 的 __cxa_demangle；MSVC 的 typeid name 本就可读。
#if defined(__GNUG__) || defined(__clang__)
  #include <cxxabi.h>
  #include <cstdlib>
#endif

namespace bt_core {

/**
 * @brief 把 typeid(T).name() 还原为人类可读类型名(供编辑器属性面板展示)。
 * @details GCC/Clang 下用 abi::__cxa_demangle；失败或 MSVC 下原样返回。
 *          例如 std::string 的修饰名 -> "std::__cxx11::basic_string<...>" 之类
 *          的可读形式，而非 "NSt3__112basic_string..."。
 */
inline std::string demangleTypeName(const char* mangled) {
#if defined(__GNUG__) || defined(__clang__)
  int status = 0;
  char* demangled = abi::__cxa_demangle(mangled, nullptr, nullptr, &status);
  if (status == 0 && demangled) {
    std::string result(demangled);
    std::free(demangled);
    return result;
  }
#endif
  return mangled;  // 失败或 MSVC：原样返回
}

/**
 * @brief 把字符串字面量转换为类型 T(用于 XML 字面量端口值 -> 端口类型)。
 * @details std::string 直接返回；算术类型用 istringstream 解析；其它类型
 *          若无法转换则返回 nullopt。这让 XML 里 msg="hi" / count="3" 这类
 *          字面量能按端口声明的类型被 getInput<T>() 读取。
 */
template <typename T>
inline std::optional<T> convertFromString(const std::string& str) {
  if constexpr (std::is_same_v<T, std::string>) {
    return str;
  } else if constexpr (std::is_same_v<T, bool>) {
    return (str == "true" || str == "1");
  } else if constexpr (std::is_arithmetic_v<T>) {
    std::istringstream iss(str);
    T value{};
    if (iss >> value) return value;
    return std::nullopt;
  } else {
    // 非内建类型：无法从字符串字面量转换(应通过黑板传递对象)。
    return std::nullopt;
  }
}

}  // namespace bt_core


namespace bt_core {

// ---------------------------------------------------------------------------
//  黑板本体
// ---------------------------------------------------------------------------
/**
 * @brief 类型安全的键值共享存储。
 *
 * 用 std::any 做类型擦除，set/get 时通过 std::any_cast 校验类型，
 * 类型不匹配会抛出 std::runtime_error，避免静默的数据错误。
 */
class Blackboard {
public:
  using Ptr = std::shared_ptr<Blackboard>;

  static Ptr create() { return std::make_shared<Blackboard>(); }

  /**
   * @brief 写入(或覆盖)一个键值。
   * @tparam T 值类型
   */
  template <typename T>
  void set(const std::string& key, T value) {
    storage_[key] = std::any(std::move(value));
  }

  /**
   * @brief 读取一个键值。
   * @return 若 key 存在且类型匹配返回值；否则返回 std::nullopt。
   * @throws std::runtime_error 当 key 存在但类型不匹配时。
   */
  template <typename T>
  std::optional<T> get(const std::string& key) const {
    auto it = storage_.find(key);
    if (it == storage_.end()) {
      return std::nullopt;
    }
    try {
      return std::any_cast<T>(it->second);
    } catch (const std::bad_any_cast&) {
      throw std::runtime_error(
          "Blackboard: key '" + key + "' 类型不匹配(请求类型 " +
          typeid(T).name() + ")");
    }
  }

  /// @brief key 是否存在。
  bool contains(const std::string& key) const {
    return storage_.find(key) != storage_.end();
  }

  /// @brief 删除一个 key。
  void remove(const std::string& key) { storage_.erase(key); }

  /// @brief 清空黑板。
  void clear() { storage_.clear(); }

private:
  std::unordered_map<std::string, std::any> storage_;
};

// ---------------------------------------------------------------------------
//  端口(Port)描述 —— 用于节点声明 + 编辑器枚举
// ---------------------------------------------------------------------------
/**
 * @brief 端口方向。
 */
enum class PortDirection {
  INPUT,    ///< 输入端口：节点从黑板读
  OUTPUT,   ///< 输出端口：节点向黑板写
  INOUT     ///< 双向
};

inline std::string toStr(PortDirection d) {
  switch (d) {
    case PortDirection::INPUT:  return "input";
    case PortDirection::OUTPUT: return "output";
    case PortDirection::INOUT:  return "inout";
  }
  return "input";
}

/**
 * @brief 单个端口的元信息。
 *
 * 这些信息会被 NodeFactory 收集进 manifest，经 bt_server 暴露给 Web 编辑器，
 * 让前端知道某节点有哪些可配置端口、类型、默认值。
 */
struct PortInfo {
  std::string   name;                 ///< 端口名
  PortDirection direction{PortDirection::INPUT};
  std::string   type_name;            ///< 值类型名(供展示，来自 typeid)
  std::string   default_value;        ///< 默认值(字符串形式)
  std::string   description;          ///< 说明文字
  std::vector<std::string> enum_values; ///< 枚举可选值(非空时编辑器属性面板渲染下拉框)
};

/// @brief 一个节点声明的端口列表：端口名 -> 端口信息。
using PortsList = std::unordered_map<std::string, PortInfo>;

// ---------------------------------------------------------------------------
//  端口声明辅助函数 —— 让节点 providedPorts() 写起来简洁
// ---------------------------------------------------------------------------

/**
 * @brief 声明一个输入端口。
 * @code
 *   static PortsList providedPorts() {
 *     return makePorts(InputPort<std::string>("message", "hello", "要打印的文本"));
 *   }
 * @endcode
 */
template <typename T>
inline std::pair<std::string, PortInfo> InputPort(
    const std::string& name,
    const std::string& default_value = "",
    const std::string& description = "") {
  return {name, PortInfo{name, PortDirection::INPUT, demangleTypeName(typeid(T).name()),
                         default_value, description, {}}};
}

/**
 * @brief 声明一个枚举型输入端口(编辑器属性面板会渲染下拉框,值仅限给定集合)。
 *
 * @code
 *   InputPort<std::string>("op", "==", "运算符",
 *                          {"==","!=","<","<=",">",">="});
 * @endcode
 */
template <typename T>
inline std::pair<std::string, PortInfo> InputPort(
    const std::string& name,
    const std::string& default_value,
    const std::string& description,
    std::vector<std::string> enum_values) {
  return {name, PortInfo{name, PortDirection::INPUT,
                         demangleTypeName(typeid(T).name()),
                         default_value, description,
                         std::move(enum_values)}};
}

/// @brief 声明一个输出端口。
template <typename T>
inline std::pair<std::string, PortInfo> OutputPort(
    const std::string& name,
    const std::string& description = "") {
  return {name, PortInfo{name, PortDirection::OUTPUT, demangleTypeName(typeid(T).name()),
                         "", description, {}}};
}

/// @brief 声明一个双向端口。
template <typename T>
inline std::pair<std::string, PortInfo> BidirectionalPort(
    const std::string& name,
    const std::string& description = "") {
  return {name, PortInfo{name, PortDirection::INOUT, demangleTypeName(typeid(T).name()),
                         "", description, {}}};
}

/**
 * @brief 把若干 Port 声明聚合成 PortsList。
 */
template <typename... Ports>
inline PortsList makePorts(Ports... ports) {
  PortsList list;
  (list.insert(ports), ...);  // C++17 折叠表达式
  return list;
}

}  // namespace bt_core

#endif  // BT_CORE_BLACKBOARD_HPP
