// ============================================================================
//  bt_server —— 基于 cpp-httplib 的行为树 HTTP 服务,供 Web 编辑器对接。
//
//  main.cpp 只负责进程启动、插件加载、CORS 和路由绑定；树状态、XML 处理、
//  workspace 文件访问由 TreeApiService 承担，便于后续单测/接口扩展。
// ============================================================================

#include <cstdlib>
#include <exception>
#include <filesystem>
#include <iostream>
#include <string>

#include "bt_core/node_factory.hpp"

#include "demo_nodes.hpp"
#include "json_util.hpp"
#include "tree_api_service.hpp"

#include "httplib.h"

namespace {

constexpr const char* kServerVersion = "0.1.0";

void sendJson(const bt_server::ApiResponse& api, httplib::Response& res) {
  res.status = api.status;
  res.set_content(api.body, api.content_type);
}

std::filesystem::path defaultWorkspace() {
  if (const char* env = std::getenv("BT_TREE_WORKSPACE")) {
    if (*env) return env;
  }
  return "examples/trees";
}

}  // namespace

int main(int argc, char** argv) {
  std::string host = "127.0.0.1";
  int port = 8080;
  if (argc >= 2) host = argv[1];
  if (argc >= 3) port = std::atoi(argv[2]);

  bt_core::NodeFactory factory;
  const bool has_plugins = (argc > 3);
  if (has_plugins) {
    for (int i = 3; i < argc; ++i) {
      try {
        factory.loadPlugin(argv[i]);
        std::cout << "[bt_server] 已加载插件: " << argv[i] << std::endl;
      } catch (const std::exception& e) {
        std::cerr << "[bt_server] 插件加载失败 " << argv[i] << ": " << e.what()
                  << std::endl;
      }
    }
  } else {
    bt_server::registerDemoNodes(factory);
    std::cout << "[bt_server] 未指定插件，已注册内置示例节点" << std::endl;
  }

  std::cout << "[bt_server] 已注册节点数: " << factory.size() << std::endl;

  bt_server::TreeApiService api(factory, defaultWorkspace());
  std::cout << "[bt_server] 树文件 workspace: " << api.workspace() << std::endl;

  httplib::Server svr;

  svr.set_post_routing_handler(
      [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
      });

  svr.Options(R"(/.*)", [](const httplib::Request&, httplib::Response& res) {
    res.status = 204;
  });

  svr.Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
    std::string body = "{";
    body += bt_server::jsonKVBool("ok", true) + ",";
    body += bt_server::jsonKV("version", kServerVersion);
    body += "}";
    res.set_content(body, "application/json");
  });

  svr.Get("/api/nodes", [&api](const httplib::Request&, httplib::Response& res) {
    sendJson(api.nodes(), res);
  });
  svr.Post("/api/tree/load", [&api](const httplib::Request& req,
                                    httplib::Response& res) {
    sendJson(api.loadTree(req.body), res);
  });
  svr.Post("/api/tree/validate", [&api](const httplib::Request& req,
                                        httplib::Response& res) {
    sendJson(api.validateTree(req.body), res);
  });
  svr.Post("/api/tree/format", [&api](const httplib::Request& req,
                                      httplib::Response& res) {
    sendJson(api.formatTree(req.body), res);
  });
  svr.Get("/api/tree/export", [&api](const httplib::Request&,
                                     httplib::Response& res) {
    sendJson(api.exportTree(), res);
  });
  svr.Post("/api/tree/tick", [&api](const httplib::Request&,
                                    httplib::Response& res) {
    sendJson(api.tickTree(), res);
  });
  svr.Post("/api/tree/run", [&api](const httplib::Request&,
                                   httplib::Response& res) {
    sendJson(api.runTree(), res);
  });
  svr.Get("/api/tree/structure", [&api](const httplib::Request&,
                                        httplib::Response& res) {
    sendJson(api.structure(), res);
  });
  svr.Get("/api/trees", [&api](const httplib::Request&, httplib::Response& res) {
    sendJson(api.listTrees(), res);
  });
  svr.Get("/api/tree/open", [&api](const httplib::Request& req,
                                   httplib::Response& res) {
    sendJson(api.openTree(req.get_param_value("name")), res);
  });
  svr.Post("/api/tree/save", [&api](const httplib::Request& req,
                                    httplib::Response& res) {
    sendJson(api.saveTree(req.body), res);
  });

  svr.set_exception_handler(
      [](const httplib::Request&, httplib::Response& res, std::exception_ptr ep) {
        std::string msg = "内部错误";
        try {
          if (ep) std::rethrow_exception(ep);
        } catch (const std::exception& e) {
          msg = e.what();
        } catch (...) {
        }
        std::string body = "{";
        body += bt_server::jsonKVBool("ok", false) + ",";
        body += bt_server::jsonKV("error", msg);
        body += "}";
        res.status = 500;
        res.set_content(body, "application/json");
      });

  std::cout << "[bt_server] 监听 http://" << host << ":" << port << std::endl;
  std::cout << "[bt_server] 接口: /api/health /api/nodes /api/tree/load "
               "/api/tree/validate /api/tree/format /api/tree/export "
               "/api/tree/tick /api/tree/run /api/tree/structure "
               "/api/trees /api/tree/open /api/tree/save"
            << std::endl;

  if (!svr.listen(host.c_str(), port)) {
    std::cerr << "[bt_server] 启动失败,无法监听 " << host << ":" << port
              << std::endl;
    return 1;
  }
  return 0;
}
