#include "bt_nodes/function/function_registry.hpp"

#include <algorithm>
#include <stdexcept>
#include <utility>

namespace bt_nodes {

FunctionRegistry& FunctionRegistry::instance() {
  static FunctionRegistry registry;
  return registry;
}

FunctionRegistry::FunctionRegistry() = default;

FunctionRegistry::~FunctionRegistry() = default;

void FunctionRegistry::registerAction(std::string name, ActionFunction fn) {
  if (name.empty()) {
    throw std::invalid_argument("FunctionRegistry: action name is empty");
  }
  if (!fn) {
    throw std::invalid_argument("FunctionRegistry: action callback is empty");
  }
  ActionFunction replaced;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = actions_.find(name);
    if (it == actions_.end()) {
      actions_.emplace(std::move(name), std::move(fn));
    } else {
      replaced.swap(it->second);
      it->second = std::move(fn);
    }
  }
}

void FunctionRegistry::registerCondition(std::string name,
                                         ConditionFunction fn) {
  if (name.empty()) {
    throw std::invalid_argument("FunctionRegistry: condition name is empty");
  }
  if (!fn) {
    throw std::invalid_argument(
        "FunctionRegistry: condition callback is empty");
  }
  ConditionFunction replaced;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = conditions_.find(name);
    if (it == conditions_.end()) {
      conditions_.emplace(std::move(name), std::move(fn));
    } else {
      replaced.swap(it->second);
      it->second = std::move(fn);
    }
  }
}

bool FunctionRegistry::unregisterAction(const std::string& name) {
  ActionFunction removed;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = actions_.find(name);
    if (it == actions_.end()) {
      return false;
    }
    removed.swap(it->second);
    actions_.erase(it);
  }
  return true;
}

bool FunctionRegistry::unregisterCondition(const std::string& name) {
  ConditionFunction removed;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = conditions_.find(name);
    if (it == conditions_.end()) {
      return false;
    }
    removed.swap(it->second);
    conditions_.erase(it);
  }
  return true;
}

bool FunctionRegistry::hasAction(const std::string& name) const {
  std::lock_guard<std::mutex> lock(mutex_);
  return actions_.count(name) != 0;
}

bool FunctionRegistry::hasCondition(const std::string& name) const {
  std::lock_guard<std::mutex> lock(mutex_);
  return conditions_.count(name) != 0;
}

bt_core::NodeStatus FunctionRegistry::invokeAction(
    const std::string& name, const FunctionContext& ctx) const {
  ActionFunction fn;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = actions_.find(name);
    if (it == actions_.end()) {
      return bt_core::NodeStatus::FAILURE;
    }
    fn = it->second;
  }
  return fn(ctx);
}

bool FunctionRegistry::evaluateCondition(const std::string& name,
                                         const FunctionContext& ctx) const {
  ConditionFunction fn;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = conditions_.find(name);
    if (it == conditions_.end()) {
      return false;
    }
    fn = it->second;
  }
  return fn(ctx);
}

std::vector<std::string> FunctionRegistry::actionNames() const {
  std::vector<std::string> names;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    names.reserve(actions_.size());
    for (const auto& item : actions_) {
      names.push_back(item.first);
    }
  }
  std::sort(names.begin(), names.end());
  return names;
}

std::vector<std::string> FunctionRegistry::conditionNames() const {
  std::vector<std::string> names;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    names.reserve(conditions_.size());
    for (const auto& item : conditions_) {
      names.push_back(item.first);
    }
  }
  std::sort(names.begin(), names.end());
  return names;
}

void FunctionRegistry::clear() {
  decltype(actions_) removed_actions;
  decltype(conditions_) removed_conditions;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    removed_actions.swap(actions_);
    removed_conditions.swap(conditions_);
  }
}

}  // namespace bt_nodes
