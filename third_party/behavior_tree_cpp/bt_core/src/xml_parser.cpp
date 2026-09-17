// ============================================================================
//  bt_core/src/xml_parser.cpp
//  XmlParser 实现 —— 基于 tinyxml2。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 构建前严格校验整份 XML，并按端口名稳定导出
//
//  反序列化流程：
//    root -> 找到 main_tree_to_execute 指定的 <BehaviorTree> -> 递归 build。
//    递归 build 一个 XML 元素：
//      1) 标签名 = 注册名，用 factory 建节点；
//      2) 属性 -> 端口：值形如 "{k}" 记为重映射 port->k；否则字面量写入黑板;
//      3) 子元素递归 build，按节点族(控制/装饰)挂接。
//
//  序列化流程：
//    深度优先把每个节点写成同名标签，端口重映射写回 "{k}" 形式属性。
// ============================================================================
#include "bt_core/xml_parser.hpp"

#include <algorithm>
#include <fstream>
#include <map>
#include <sstream>
#include <stdexcept>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "tinyxml2.h"

namespace bt_core {

using namespace tinyxml2;

namespace {

/// @brief 解析期上下文:子树定义索引 + 正在展开的 ID 栈(用于环检测)。
struct ParseContext {
  /// 子树 ID(<BehaviorTree ID="X">) → 该 BT 的第一个子元素(即子树根)。
  std::unordered_map<std::string, const XMLElement*> subtrees;
  /// 节点注册名 → manifest；一次复制后只做确定性的按名查询。
  std::unordered_map<std::string, NodeManifest> manifests;
  /// 当前递归路径上正在展开的子树 ID 集合,用于检测循环引用。
  std::unordered_set<std::string> expanding;
  /// 全文校验阶段的 DFS 灰集合；连未被主树引用的定义也必须合法。
  std::unordered_set<std::string> validating;
  /// 每个定义已校验过的最大入口深度；更深路径必须重验才能守住深度上限。
  std::unordered_map<std::string, int> validated_depth;
};

/// @brief 子树最大展开深度,防御逻辑错误导致的失控递归。
constexpr int kMaxSubTreeDepth = 32;

size_t childElementCount(const XMLElement* elem) {
  size_t count = 0;
  for (const XMLElement* child = elem->FirstChildElement(); child;
       child = child->NextSiblingElement()) {
    ++count;
  }
  return count;
}

std::string lineSuffix(const XMLElement* elem) {
  const int line = elem->GetLineNum();
  return line > 0 ? " (第 " + std::to_string(line) + " 行)" : "";
}

std::string nodeLabel(const XMLElement* elem) {
  std::string label = "节点 <" + std::string(elem->Name());
  if (const char* name = elem->Attribute("name"); name && *name) {
    label += " name=\"" + std::string(name) + "\"";
  }
  return label + ">" + lineSuffix(elem);
}

std::string behaviorTreeLabel(const XMLElement* elem,
                              const std::string& id) {
  return "<BehaviorTree ID=\"" + id + "\">" + lineSuffix(elem);
}

std::string sortedPortNames(const PortsList& ports) {
  std::vector<std::string> names;
  names.reserve(ports.size());
  for (const auto& entry : ports) names.push_back(entry.first);
  std::sort(names.begin(), names.end());

  if (names.empty()) return "（无声明端口）";
  std::ostringstream result;
  for (size_t i = 0; i < names.size(); ++i) {
    if (i > 0) result << ", ";
    result << names[i];
  }
  return result.str();
}

void validateTreeDefinition(const std::string& id, ParseContext& ctx,
                            int depth);

void validateNodeElement(const XMLElement* elem, ParseContext& ctx,
                         int depth) {
  const std::string reg_name = elem->Name();

  if (reg_name == "SubTree") {
    const char* id_attr = elem->Attribute("ID");
    if (!id_attr || !*id_attr) {
      throw std::runtime_error("<SubTree> 缺少 ID 属性" + lineSuffix(elem));
    }
    const std::string id = id_attr;
    for (const XMLAttribute* attr = elem->FirstAttribute(); attr;
         attr = attr->Next()) {
      if (std::string(attr->Name()) != "ID") {
        throw std::runtime_error(
            "<SubTree ID=\"" + id + "\">" + lineSuffix(elem) +
            " 包含不支持的属性 '" + attr->Name() +
            "'；当前内联子树仅支持 ID，不支持静默端口重映射");
      }
    }
    if (elem->FirstChildElement()) {
      throw std::runtime_error("<SubTree ID=\"" + id + "\">" +
                               lineSuffix(elem) + " 不能包含子节点");
    }
    if (ctx.subtrees.find(id) == ctx.subtrees.end()) {
      throw std::runtime_error("<SubTree ID=\"" + id +
                               "\"> 引用未定义的子树" + lineSuffix(elem));
    }
    if (depth + 1 > kMaxSubTreeDepth) {
      throw std::runtime_error("子树展开深度超过 " +
                               std::to_string(kMaxSubTreeDepth) +
                               " 层(疑似失控递归)");
    }
    validateTreeDefinition(id, ctx, depth + 1);
    return;
  }

  const auto manifest_it = ctx.manifests.find(reg_name);
  if (manifest_it == ctx.manifests.end()) {
    throw std::runtime_error(nodeLabel(elem) +
                             " 使用了未注册的节点类型 '" + reg_name + "'");
  }
  const NodeManifest& manifest = manifest_it->second;
  for (const XMLAttribute* attr = elem->FirstAttribute(); attr;
       attr = attr->Next()) {
    const std::string key = attr->Name();
    if (key == "name") continue;
    if (manifest.ports.find(key) == manifest.ports.end()) {
      throw std::runtime_error(
          nodeLabel(elem) + " 包含未声明端口 '" + key +
          "'；允许端口: " + sortedPortNames(manifest.ports));
    }
  }

  const size_t child_count = childElementCount(elem);
  if (manifest.type == NodeType::DECORATOR && child_count != 1) {
    throw std::runtime_error(nodeLabel(elem) +
                             " 是装饰节点，必须包含恰好一个子节点，实际为 " +
                             std::to_string(child_count));
  }
  if ((manifest.type == NodeType::ACTION ||
       manifest.type == NodeType::CONDITION ||
       manifest.type == NodeType::UNDEFINED) &&
      child_count != 0) {
    throw std::runtime_error("叶子节点 " + nodeLabel(elem) +
                             " 不能包含子节点");
  }

  for (const XMLElement* child = elem->FirstChildElement(); child;
       child = child->NextSiblingElement()) {
    validateNodeElement(child, ctx, depth);
  }
}

void validateTreeDefinition(const std::string& id, ParseContext& ctx,
                            int depth) {
  const auto validated = ctx.validated_depth.find(id);
  if (validated != ctx.validated_depth.end() && depth <= validated->second) {
    return;
  }
  if (ctx.validating.count(id)) {
    throw std::runtime_error("<SubTree ID=\"" + id +
                             "\"> 检测到循环引用");
  }

  const auto tree_it = ctx.subtrees.find(id);
  if (tree_it == ctx.subtrees.end()) {
    throw std::runtime_error("<SubTree ID=\"" + id +
                             "\"> 引用未定义的子树");
  }
  ctx.validating.insert(id);
  validateNodeElement(tree_it->second, ctx, depth);
  ctx.validating.erase(id);
  ctx.validated_depth[id] = depth;
}

// 从一个 XML 元素递归构建节点。
TreeNode::Ptr buildNode(const XMLElement* elem, NodeFactory& factory,
                        Blackboard::Ptr bb, ParseContext& ctx,
                        int depth = 0) {
  const std::string reg_name = elem->Name();

  // ── <SubTree ID="X"/> 引用:从索引找到目标 BT 的根,带环检测递归内联展开 ──
  if (reg_name == "SubTree") {
    const char* id_attr = elem->Attribute("ID");
    if (!id_attr || !*id_attr) {
      throw std::runtime_error("<SubTree> 缺少 ID 属性");
    }
    const std::string id = id_attr;
    auto it = ctx.subtrees.find(id);
    if (it == ctx.subtrees.end()) {
      throw std::runtime_error("<SubTree ID=\"" + id + "\"> 引用未定义的子树");
    }
    if (ctx.expanding.count(id)) {
      throw std::runtime_error("<SubTree ID=\"" + id + "\"> 检测到循环引用");
    }
    if (depth + 1 > kMaxSubTreeDepth) {
      throw std::runtime_error("子树展开深度超过 " +
                               std::to_string(kMaxSubTreeDepth) +
                               " 层(疑似失控递归)");
    }
    ctx.expanding.insert(id);
    TreeNode::Ptr expanded = buildNode(it->second, factory, bb, ctx, depth + 1);
    ctx.expanding.erase(id);
    return expanded;
  }

  // 实例名：可由 name 属性指定，否则用注册名。
  std::string inst_name = reg_name;
  if (const char* n = elem->Attribute("name")) {
    inst_name = n;
  }

  // 解析属性 -> 端口映射 / 字面量。
  NodeConfig cfg;
  cfg.blackboard = bb;
  for (const XMLAttribute* attr = elem->FirstAttribute(); attr;
       attr = attr->Next()) {
    const std::string key = attr->Name();
    if (key == "name") continue;  // name 是保留属性，非端口
    const std::string val = attr->Value();
    if (val.size() >= 2 && val.front() == '{' && val.back() == '}') {
      // "{bb_key}" -> 端口重映射到黑板 key
      cfg.port_remap[key] = val.substr(1, val.size() - 2);
    } else {
      // 字面量：仅存入节点本地 port_values(私有端口语义)。
      // 不写共享黑板——否则多个同名端口(如两个 PrintMessage 的 message)会互相
      // 覆盖。getInput<T>() 会优先读本地字面量。序列化时也从 port_values 还原。
      cfg.port_values[key] = val;
    }
  }

  TreeNode::Ptr node = factory.createNode(reg_name, inst_name, cfg);

  // 递归挂接子节点。
  if (auto* ctrl = dynamic_cast<ControlNode*>(node.get())) {
    for (const XMLElement* child = elem->FirstChildElement(); child;
         child = child->NextSiblingElement()) {
      ctrl->addChild(buildNode(child, factory, bb, ctx, depth));
    }
  } else if (auto* deco = dynamic_cast<DecoratorNode*>(node.get())) {
    const XMLElement* child = elem->FirstChildElement();
    if (!child) {
      throw std::runtime_error("装饰节点 '" + reg_name + "' 缺少子节点");
    }
    if (child->NextSiblingElement()) {
      throw std::runtime_error("装饰节点 '" + reg_name + "' 只能有一个子节点");
    }
    deco->setChild(buildNode(child, factory, bb, ctx, depth));
  } else if (elem->FirstChildElement()) {
    // validateNodeElement 已先拦截；这里保留防御式检查，避免未来绕过全文校验。
    throw std::runtime_error("叶子节点 " + nodeLabel(elem) +
                             " 不能包含子节点");
  }

  return node;
}

// 递归把节点写成 XML 元素。
void writeNode(const TreeNode::Ptr& node, XMLElement* parent,
               XMLDocument& doc) {
  // 标签名用注册名(无则退化为实例名)。
  const std::string tag = node->registrationName().empty()
                              ? node->name()
                              : node->registrationName();
  XMLElement* elem = doc.NewElement(tag.c_str());

  // 实例名与注册名不同才写 name 属性。
  if (!node->name().empty() && node->name() != tag) {
    elem->SetAttribute("name", node->name().c_str());
  }

  // 合并后按端口名排序，避免 unordered_map 的进程/平台相关迭代顺序。
  // 若调用方错误地把同一端口同时放进两张表，保留旧行为：字面量覆盖重映射。
  std::map<std::string, std::string> ordered_ports;
  for (const auto& [port, key] : node->config().port_remap) {
    ordered_ports[port] = "{" + key + "}";
  }
  for (const auto& [port, value] : node->config().port_values) {
    ordered_ports[port] = value;
  }
  for (const auto& [port, value] : ordered_ports) {
    elem->SetAttribute(port.c_str(), value.c_str());
  }

  parent->InsertEndChild(elem);

  // 递归子节点。
  if (auto* ctrl = dynamic_cast<ControlNode*>(node.get())) {
    for (const auto& c : ctrl->children()) writeNode(c, elem, doc);
  } else if (auto* deco = dynamic_cast<DecoratorNode*>(node.get())) {
    if (deco->child()) writeNode(deco->child(), elem, doc);
  }
}

}  // namespace

// ------------------------------ 反序列化 ------------------------------------

Tree XmlParser::loadFromText(const std::string& xml_text,
                             Blackboard::Ptr blackboard) {
  XMLDocument doc;
  if (doc.Parse(xml_text.c_str()) != XML_SUCCESS) {
    throw std::runtime_error(std::string("XML 解析失败: ") + doc.ErrorStr());
  }

  const XMLElement* root = doc.RootElement();
  if (!root || std::string(root->Name()) != "root") {
    throw std::runtime_error("XML 缺少 <root> 元素");
  }
  if (root->NextSiblingElement()) {
    throw std::runtime_error("XML 只能包含一个顶层 <root> 元素");
  }
  for (const XMLAttribute* attr = root->FirstAttribute(); attr;
       attr = attr->Next()) {
    const std::string key = attr->Name();
    if (key != "main_tree_to_execute" && key != "BTCPP_format") {
      throw std::runtime_error("<root> 包含不支持的属性 '" + key + "'");
    }
  }

  // 单遍扫描所有 <BehaviorTree>:
  //   ① 建子树索引 ctx.subtrees[ID] = 该 BT 的第一个子元素(根)
  //      → buildNode 遇到 <SubTree ID="X"/> 时用它内联展开。
  //   ② 同时挑出 main_tree_to_execute 指定的主树(未指定则取第一个)。
  const char* main_id_attr = root->Attribute("main_tree_to_execute");
  const bool main_id_explicit = main_id_attr != nullptr;
  if (main_id_attr && !*main_id_attr) {
    throw std::runtime_error("<root> 的 main_tree_to_execute 属性不能为空");
  }
  const XMLElement* main_bt = nullptr;
  std::string main_id = main_id_attr ? main_id_attr : "";
  ParseContext ctx;
  for (NodeManifest manifest : factory_.manifests()) {
    ctx.manifests.emplace(manifest.registration_name, std::move(manifest));
  }

  std::vector<std::string> definition_order;
  for (const XMLElement* e = root->FirstChildElement(); e;
       e = e->NextSiblingElement()) {
    const std::string wrapper_name = e->Name();
    if (wrapper_name == "TreeNodesModel") {
      continue;  // 兼容 Groot/BehaviorTree.CPP 的可选模型元数据。
    }
    if (wrapper_name != "BehaviorTree") {
      throw std::runtime_error("<root> 下不支持元素 <" + wrapper_name + ">" +
                               lineSuffix(e));
    }
    for (const XMLAttribute* attr = e->FirstAttribute(); attr;
         attr = attr->Next()) {
      if (std::string(attr->Name()) != "ID") {
        throw std::runtime_error("<BehaviorTree> 包含不支持的属性 '" +
                                 std::string(attr->Name()) + "'" +
                                 lineSuffix(e));
      }
    }
    const char* id_attr = e->Attribute("ID");
    if (!id_attr || !*id_attr) {
      throw std::runtime_error("<BehaviorTree> 缺少非空 ID 属性" +
                               lineSuffix(e));
    }
    const std::string id = id_attr;
    const size_t root_count = childElementCount(e);
    if (root_count != 1) {
      throw std::runtime_error(
          behaviorTreeLabel(e, id) +
          " 必须包含恰好一个根节点，实际为 " + std::to_string(root_count));
    }
    if (!ctx.subtrees.emplace(id, e->FirstChildElement()).second) {
      throw std::runtime_error("重复的 <BehaviorTree ID=\"" + id + "\">" +
                               lineSuffix(e));
    }
    definition_order.push_back(id);
    if (main_id.empty()) main_id = id;
    if (id == main_id) {
      main_bt = e;
    }
  }
  if (!main_id_explicit && definition_order.size() > 1) {
    throw std::runtime_error(
        "<root> 包含多个 <BehaviorTree> 时必须显式指定 main_tree_to_execute");
  }
  if (!main_bt) {
    if (definition_order.empty()) {
      throw std::runtime_error("找不到目标 <BehaviorTree>");
    }
    throw std::runtime_error("main_tree_to_execute='" + main_id +
                             "' 未找到对应 <BehaviorTree>");
  }

  // 在创建任何节点前按文档顺序校验全部定义，避免未引用子树隐藏错误。
  for (const std::string& id : definition_order) {
    validateTreeDefinition(id, ctx, 0);
  }

  const XMLElement* root_node_elem = main_bt->FirstChildElement();

  auto bb = blackboard ? blackboard : Blackboard::create();
  TreeNode::Ptr root_node = buildNode(root_node_elem, factory_, bb, ctx);
  return Tree(root_node, bb);
}

Tree XmlParser::loadFromFile(const std::string& file_path,
                             Blackboard::Ptr blackboard) {
  std::ifstream ifs(file_path);
  if (!ifs) {
    throw std::runtime_error("无法打开文件: " + file_path);
  }
  std::stringstream ss;
  ss << ifs.rdbuf();
  return loadFromText(ss.str(), blackboard);
}

// ------------------------------- 序列化 -------------------------------------

std::string XmlParser::writeToText(const Tree& tree,
                                   const std::string& main_tree_id) {
  XMLDocument doc;
  XMLElement* root = doc.NewElement("root");
  root->SetAttribute("main_tree_to_execute", main_tree_id.c_str());
  doc.InsertEndChild(root);

  XMLElement* bt = doc.NewElement("BehaviorTree");
  bt->SetAttribute("ID", main_tree_id.c_str());
  root->InsertEndChild(bt);

  if (tree.root()) {
    writeNode(tree.root(), bt, doc);
  }

  XMLPrinter printer;
  doc.Print(&printer);
  return printer.CStr();
}

void XmlParser::writeToFile(const Tree& tree, const std::string& file_path,
                            const std::string& main_tree_id) {
  std::ofstream ofs(file_path);
  if (!ofs) {
    throw std::runtime_error("无法写入文件: " + file_path);
  }
  ofs << writeToText(tree, main_tree_id);
}

}  // namespace bt_core
