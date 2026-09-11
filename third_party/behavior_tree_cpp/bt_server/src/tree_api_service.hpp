#ifndef BT_SERVER_TREE_API_SERVICE_HPP
#define BT_SERVER_TREE_API_SERVICE_HPP

#include <filesystem>
#include <memory>
#include <mutex>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"

namespace bt_server {

struct ApiResponse {
  int status = 200;
  std::string body;
  std::string content_type = "application/json";
};

class TreeApiService {
 public:
  TreeApiService(bt_core::NodeFactory& factory,
                 std::filesystem::path workspace);

  ApiResponse nodes() const;
  ApiResponse loadTree(const std::string& body);
  ApiResponse validateTree(const std::string& body) const;
  ApiResponse formatTree(const std::string& body) const;
  ApiResponse exportTree() const;
  ApiResponse tickTree();
  ApiResponse runTree();
  ApiResponse structure() const;
  ApiResponse listTrees() const;
  ApiResponse openTree(const std::string& name) const;
  ApiResponse saveTree(const std::string& body) const;

  const std::filesystem::path& workspace() const { return workspace_; }

 private:
  ApiResponse parseOnly(const std::string& body, bool formatted) const;
  std::filesystem::path resolveTreeName(const std::string& name) const;
  ApiResponse error(int status, const std::string& message) const;

  bt_core::NodeFactory& factory_;
  std::filesystem::path workspace_;
  mutable std::mutex tree_mutex_;
  std::unique_ptr<bt_core::Tree> tree_;
};

}  // namespace bt_server

#endif  // BT_SERVER_TREE_API_SERVICE_HPP
