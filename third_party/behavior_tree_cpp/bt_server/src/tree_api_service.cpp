#include "tree_api_service.hpp"

#include <fstream>
#include <sstream>
#include <stdexcept>
#include <vector>

#include "bt_core/control_node.hpp"
#include "bt_core/decorator_node.hpp"
#include "bt_core/node_status.hpp"
#include "bt_core/tree_node.hpp"
#include "bt_core/xml_parser.hpp"

#include "json_util.hpp"

namespace bt_server {
namespace fs = std::filesystem;

namespace {

std::string portToJson(const bt_core::PortInfo& p) {
  std::string out = "{";
  out += jsonKV("name", p.name) + ",";
  out += jsonKV("direction", bt_core::toStr(p.direction)) + ",";
  out += jsonKV("type_name", p.type_name) + ",";
  out += jsonKV("default_value", p.default_value) + ",";
  out += jsonKV("description", p.description) + ",";
  out += jsonString("enum_values") + ":[";
  for (size_t i = 0; i < p.enum_values.size(); ++i) {
    if (i) out += ",";
    out += jsonString(p.enum_values[i]);
  }
  out += "]}";
  return out;
}

std::string manifestToJson(const bt_core::NodeManifest& m) {
  std::string out = "{";
  out += jsonKV("registration_name", m.registration_name) + ",";
  out += jsonKV("type", bt_core::toStr(m.type)) + ",";
  out += jsonString("ports") + ":[";
  bool first = true;
  for (const auto& [name, info] : m.ports) {
    (void)name;
    if (!first) out += ",";
    out += portToJson(info);
    first = false;
  }
  out += "]}";
  return out;
}

std::string readFile(const fs::path& path) {
  std::ifstream in(path);
  if (!in) {
    throw std::runtime_error("无法打开文件: " + path.string());
  }
  std::stringstream ss;
  ss << in.rdbuf();
  return ss.str();
}

void writeFile(const fs::path& path, const std::string& content) {
  std::ofstream out(path);
  if (!out) {
    throw std::runtime_error("无法写入文件: " + path.string());
  }
  out << content;
}

}  // namespace

TreeApiService::TreeApiService(bt_core::NodeFactory& factory,
                               fs::path workspace)
    : factory_(factory), workspace_(std::move(workspace)) {
  if (workspace_.empty()) workspace_ = "examples/trees";
}

ApiResponse TreeApiService::error(int status, const std::string& message) const {
  ApiResponse res;
  res.status = status;
  std::string body = "{";
  body += jsonKVBool("ok", false) + ",";
  body += jsonKV("error", message);
  body += "}";
  res.body = body;
  return res;
}

ApiResponse TreeApiService::nodes() const {
  const auto manifests = factory_.manifests();
  std::string body = "[";
  bool first = true;
  for (const auto& m : manifests) {
    if (!first) body += ",";
    body += manifestToJson(m);
    first = false;
  }
  body += "]";
  return ApiResponse{200, body};
}

ApiResponse TreeApiService::loadTree(const std::string& body) {
  auto xml = jsonExtractString(body, "xml");
  if (!xml) {
    return error(400, "请求体缺少 \"xml\" 字段或 JSON 格式错误");
  }

  std::lock_guard<std::mutex> lock(tree_mutex_);
  try {
    bt_core::XmlParser parser(factory_);
    bt_core::Tree parsed = parser.loadFromText(*xml);
    const size_t node_count = parsed.nodes().size();
    tree_ = std::make_unique<bt_core::Tree>(std::move(parsed));

    std::string out = "{";
    out += jsonKVBool("ok", true) + ",";
    out += jsonKVNum("node_count", static_cast<long long>(node_count));
    out += "}";
    return ApiResponse{200, out};
  } catch (const std::exception& e) {
    return error(400, e.what());
  }
}

ApiResponse TreeApiService::parseOnly(const std::string& body,
                                      bool formatted) const {
  auto xml = jsonExtractString(body, "xml");
  if (!xml) {
    return error(400, "请求体缺少 \"xml\" 字段或 JSON 格式错误");
  }

  try {
    bt_core::XmlParser parser(factory_);
    bt_core::Tree parsed = parser.loadFromText(*xml);
    const size_t node_count = parsed.nodes().size();

    std::string out = "{";
    out += jsonKVBool("ok", true) + ",";
    out += jsonKVNum("node_count", static_cast<long long>(node_count));
    if (formatted) {
      out += ",";
      out += jsonKV("xml", parser.writeToText(parsed, "MainTree"));
    }
    out += "}";
    return ApiResponse{200, out};
  } catch (const std::exception& e) {
    return error(400, e.what());
  }
}

ApiResponse TreeApiService::validateTree(const std::string& body) const {
  return parseOnly(body, false);
}

ApiResponse TreeApiService::formatTree(const std::string& body) const {
  return parseOnly(body, true);
}

ApiResponse TreeApiService::exportTree() const {
  std::lock_guard<std::mutex> lock(tree_mutex_);
  if (!tree_ || !tree_->root()) {
    ApiResponse res;
    res.status = 404;
    std::string body = "{";
    body += jsonKV("xml", "") + ",";
    body += jsonKV("error", "当前没有已加载的树");
    body += "}";
    res.body = body;
    return res;
  }

  try {
    bt_core::XmlParser parser(factory_);
    return ApiResponse{200, "{" + jsonKV("xml", parser.writeToText(*tree_, "MainTree")) + "}"};
  } catch (const std::exception& e) {
    ApiResponse res = error(500, e.what());
    res.body = "{" + jsonKV("xml", "") + "," + jsonKV("error", e.what()) + "}";
    return res;
  }
}

ApiResponse TreeApiService::tickTree() {
  std::lock_guard<std::mutex> lock(tree_mutex_);
  if (!tree_ || !tree_->root()) {
    ApiResponse res;
    res.status = 404;
    std::string body = "{";
    body += jsonKV("status", "IDLE") + ",";
    body += jsonString("nodes") + ":[],";
    body += jsonKV("error", "当前没有已加载的树");
    body += "}";
    res.body = body;
    return res;
  }

  const bt_core::NodeStatus root_status = tree_->tickOnce();
  std::string body = "{";
  body += jsonKV("status", bt_core::toStr(root_status)) + ",";
  body += jsonString("nodes") + ":[";
  bool first = true;
  for (const auto& node : tree_->nodes()) {
    if (!first) body += ",";
    std::string item = "{";
    item += jsonKVNum("id", static_cast<long long>(node->id())) + ",";
    item += jsonKV("status", bt_core::toStr(node->status())) + ",";
    item += jsonKV("registration_name", node->registrationName()) + ",";
    item += jsonKV("name", node->name());
    item += "}";
    body += item;
    first = false;
  }
  body += "]}";
  return ApiResponse{200, body};
}

ApiResponse TreeApiService::runTree() {
  std::lock_guard<std::mutex> lock(tree_mutex_);
  if (!tree_ || !tree_->root()) {
    ApiResponse res;
    res.status = 404;
    std::string body = "{";
    body += jsonKV("final_status", "IDLE") + ",";
    body += jsonString("transitions") + ":[],";
    body += jsonKV("error", "当前没有已加载的树");
    body += "}";
    res.body = body;
    return res;
  }

  struct Transition {
    uint16_t node_id;
    bt_core::NodeStatus from;
    bt_core::NodeStatus to;
  };
  std::vector<Transition> transitions;
  transitions.reserve(64);

  tree_->halt();
  tree_->setStatusCallback(
      [&transitions](uint16_t id, bt_core::NodeStatus prev,
                     bt_core::NodeStatus next) {
        transitions.push_back(Transition{id, prev, next});
      });

  bt_core::NodeStatus final_status = bt_core::NodeStatus::IDLE;
  try {
    final_status = tree_->tickWhileRunning();
  } catch (...) {
    tree_->setStatusCallback(nullptr);
    throw;
  }
  tree_->setStatusCallback(nullptr);

  std::string body = "{";
  body += jsonKV("final_status", bt_core::toStr(final_status)) + ",";
  body += jsonString("transitions") + ":[";
  long long seq = 0;
  bool first = true;
  for (const auto& t : transitions) {
    if (!first) body += ",";
    std::string item = "{";
    item += jsonKVNum("node_id", static_cast<long long>(t.node_id)) + ",";
    item += jsonKV("from", bt_core::toStr(t.from)) + ",";
    item += jsonKV("to", bt_core::toStr(t.to)) + ",";
    item += jsonKVNum("seq", seq++);
    item += "}";
    body += item;
    first = false;
  }
  body += "]}";
  return ApiResponse{200, body};
}

ApiResponse TreeApiService::structure() const {
  std::lock_guard<std::mutex> lock(tree_mutex_);
  if (!tree_ || !tree_->root()) {
    ApiResponse res;
    res.status = 404;
    std::string body = "{";
    body += jsonString("nodes") + ":[],";
    body += jsonKV("error", "当前没有已加载的树");
    body += "}";
    res.body = body;
    return res;
  }

  std::string body = "{";
  body += jsonString("nodes") + ":[";
  bool first = true;
  for (const auto& node : tree_->nodes()) {
    if (!first) body += ",";
    std::string item = "{";
    item += jsonKVNum("id", static_cast<long long>(node->id())) + ",";
    item += jsonKV("registration_name", node->registrationName()) + ",";
    item += jsonKV("name", node->name()) + ",";
    item += jsonKV("type", bt_core::toStr(node->type())) + ",";
    item += jsonString("children") + ":[";
    bool child_first = true;
    if (auto* ctrl = dynamic_cast<bt_core::ControlNode*>(node.get())) {
      for (const auto& child : ctrl->children()) {
        if (!child_first) item += ",";
        item += std::to_string(static_cast<long long>(child->id()));
        child_first = false;
      }
    } else if (auto* deco = dynamic_cast<bt_core::DecoratorNode*>(node.get())) {
      if (deco->child()) {
        item += std::to_string(static_cast<long long>(deco->child()->id()));
      }
    }
    item += "]}";
    body += item;
    first = false;
  }
  body += "]}";
  return ApiResponse{200, body};
}

fs::path TreeApiService::resolveTreeName(const std::string& name) const {
  if (name.empty()) {
    throw std::runtime_error("树文件名不能为空");
  }
  fs::path rel(name);
  if (rel.is_absolute() || rel.has_parent_path() || rel.filename() != rel) {
    throw std::runtime_error("树文件名必须是 workspace 内的普通文件名");
  }
  if (rel.extension() != ".xml") {
    throw std::runtime_error("树文件名必须以 .xml 结尾");
  }
  return workspace_ / rel;
}

ApiResponse TreeApiService::listTrees() const {
  try {
    fs::create_directories(workspace_);
    std::string body = "{";
    body += jsonKV("workspace", workspace_.string()) + ",";
    body += jsonString("trees") + ":[";
    bool first = true;
    for (const auto& entry : fs::directory_iterator(workspace_)) {
      if (!entry.is_regular_file() || entry.path().extension() != ".xml") {
        continue;
      }
      if (!first) body += ",";
      std::string item = "{";
      item += jsonKV("name", entry.path().filename().string()) + ",";
      item += jsonKVNum("size", static_cast<long long>(entry.file_size()));
      item += "}";
      body += item;
      first = false;
    }
    body += "]}";
    return ApiResponse{200, body};
  } catch (const std::exception& e) {
    return error(500, e.what());
  }
}

ApiResponse TreeApiService::openTree(const std::string& name) const {
  try {
    const fs::path path = resolveTreeName(name);
    const std::string xml = readFile(path);
    std::string body = "{";
    body += jsonKVBool("ok", true) + ",";
    body += jsonKV("name", path.filename().string()) + ",";
    body += jsonKV("xml", xml);
    body += "}";
    return ApiResponse{200, body};
  } catch (const std::exception& e) {
    return error(400, e.what());
  }
}

ApiResponse TreeApiService::saveTree(const std::string& body) const {
  auto name = jsonExtractString(body, "name");
  auto xml = jsonExtractString(body, "xml");
  if (!name || !xml) {
    return error(400, "请求体缺少 \"name\" 或 \"xml\" 字段");
  }

  try {
    // 保存前先解析，避免 workspace 中沉积不可加载脚本。
    bt_core::XmlParser parser(factory_);
    parser.loadFromText(*xml);

    fs::create_directories(workspace_);
    const fs::path path = resolveTreeName(*name);
    writeFile(path, *xml);
    std::string out = "{";
    out += jsonKVBool("ok", true) + ",";
    out += jsonKV("name", path.filename().string()) + ",";
    out += jsonKVNum("bytes", static_cast<long long>(xml->size()));
    out += "}";
    return ApiResponse{200, out};
  } catch (const std::exception& e) {
    return error(400, e.what());
  }
}

}  // namespace bt_server
