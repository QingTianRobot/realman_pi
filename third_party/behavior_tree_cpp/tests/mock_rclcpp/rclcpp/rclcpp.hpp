// ============================================================================
//  tests/mock_rclcpp/rclcpp/rclcpp.hpp
//  最小 mock rclcpp —— **仅供 tests/ 单元测试使用**，让 bt_ros2 的订阅/发布
//  基类模板可以在本机零 ROS2 环境下被实例化、被调用、被断言。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 增加可控订阅匹配计数，覆盖有界首包等待
//
//  覆盖范围 (按"被 ros_subscriber_node.hpp / ros_publisher_node.hpp 用到的
//  API 表面"裁剪):
//    rclcpp::QoS / rclcpp::KeepLast / rclcpp::SensorDataQoS 元数据
//    rclcpp::Node::create_subscription<MsgT>(topic, QoS, callback) -> Subscription::SharedPtr
//    rclcpp::Node::create_publisher<MsgT>(topic, QoS)              -> Publisher::SharedPtr
//    Subscription / Publisher 保留公开 topic 与 QoS；Publisher 记录 published
//    Node::subscription/publisher   按 topic + 消息类型返回最新的存活端点
//    Node::deliver(topic, ptr)      按 topic + 指针类型向全部存活匹配订阅扇出；
//                                   无匹配时抛异常
//    Node::deliver(ptr)             兼容旧测试：投递最后创建的存活订阅；
//                                   未创建或已过期时抛异常
//
//  生命周期契约：Node 的端点记录和派发闭包只弱引用订阅，测试/行为节点必须持有
//  返回的 SharedPtr。行为节点销毁后查找会跳过该订阅，投递不会调用悬空回调。
//  本 mock 只覆盖单线程单元测试，不模拟真实 executor/callback-group 的并发语义。
//
//  仅在 -Itests/mock_rclcpp 下生效;真实 ROS2 环境的测试不应包含本头文件。
// ============================================================================
#pragma once

#include <functional>
#include <memory>
#include <stdexcept>
#include <string>
#include <typeindex>
#include <vector>

#define RCLCPP_INFO(logger, ...) ((void)0)

namespace rclcpp {

struct KeepLast { size_t d; explicit KeepLast(size_t x) : d(x) {} };
struct QoS {
  KeepLast k;
  std::string profile{"default"};
  explicit QoS(KeepLast x) : k(x) {}
  explicit QoS(size_t depth) : k(KeepLast(depth)) {}
  QoS& keep_last(size_t depth) {
    k = KeepLast(depth);
    return *this;
  }
  size_t depth() const { return k.d; }
};
struct SensorDataQoS : public QoS {
  SensorDataQoS() : QoS(KeepLast(5)) { profile = "sensor_data"; }
};
struct Logger {};

template <typename MsgT>
struct Subscription {
  using SharedPtr = std::shared_ptr<Subscription<MsgT>>;
  std::string topic;
  QoS qos{KeepLast(10)};
  std::function<void(typename MsgT::SharedPtr)> cb;
};

template <typename MsgT>
struct Publisher {
  using SharedPtr = std::shared_ptr<Publisher<MsgT>>;
  std::string topic;
  QoS qos{KeepLast(10)};
  bool throw_on_publish{false};          ///< 测试钩子:模拟中间件发布异常
  size_t subscription_count{0};          ///< 测试钩子:模拟已匹配订阅数
  std::vector<MsgT> published;           ///< 测试钩子:记录所有 publish 调用
  size_t get_subscription_count() const { return subscription_count; }
  void publish(const MsgT& m) {
    if (throw_on_publish) {
      throw std::runtime_error("mock rclcpp publisher failure");
    }
    published.push_back(m);
  }
};

class Node {
public:
  Logger get_logger() const { return {}; }

  template <typename MsgT, typename CB>
  typename Subscription<MsgT>::SharedPtr create_subscription(
      const std::string& topic, QoS qos, CB cb) {
    auto s = std::make_shared<Subscription<MsgT>>();
    s->topic = topic;
    s->qos = qos;
    s->cb = cb;
    const std::weak_ptr<Subscription<MsgT>> weak_subscription = s;
    auto dispatch = [weak_subscription](void* p) {
      auto live_subscription = weak_subscription.lock();
      if (!live_subscription) return false;
      live_subscription->cb(*reinterpret_cast<typename MsgT::SharedPtr*>(p));
      return true;
    };
    last_dispatcher_ = dispatch;
    subscription_records_.push_back(
        {topic, std::type_index(typeid(MsgT)),
         std::type_index(typeid(typename MsgT::SharedPtr)),
         std::weak_ptr<void>(s), dispatch});
    return s;
  }

  template <typename MsgT>
  typename Publisher<MsgT>::SharedPtr create_publisher(
      const std::string& topic, QoS qos) {
    auto p = std::make_shared<Publisher<MsgT>>();
    p->topic = topic;
    p->qos = qos;
    publisher_records_.push_back(
        {topic, std::type_index(typeid(MsgT)),
         std::weak_ptr<void>(p)});
    last_publisher_ = std::static_pointer_cast<void>(p);
    last_topic_ = topic;
    return p;
  }

  template <typename MsgT>
  typename Publisher<MsgT>::SharedPtr publisher(const std::string& topic) const {
    const std::type_index message_type(typeid(MsgT));
    for (auto it = publisher_records_.crbegin();
         it != publisher_records_.crend(); ++it) {
      if (it->topic == topic && it->message_type == message_type) {
        auto handle = it->handle.lock();
        if (handle) {
          return std::static_pointer_cast<Publisher<MsgT>>(handle);
        }
      }
    }
    return nullptr;
  }

  template <typename MsgT>
  typename Subscription<MsgT>::SharedPtr subscription(
      const std::string& topic) const {
    const std::type_index message_type(typeid(MsgT));
    for (auto it = subscription_records_.crbegin();
         it != subscription_records_.crend(); ++it) {
      if (it->topic == topic && it->message_type == message_type) {
        auto handle = it->handle.lock();
        if (handle) {
          return std::static_pointer_cast<Subscription<MsgT>>(handle);
        }
      }
    }
    return nullptr;
  }

  /// @brief 测试钩子:按话题与消息指针类型派发给所有匹配的订阅。
  template <typename PtrT>
  void deliver(const std::string& topic, PtrT* message) {
    const std::type_index pointer_type(typeid(PtrT));
    auto record = subscription_records_.begin();
    while (record != subscription_records_.end()) {
      if (record->handle.expired()) {
        record = subscription_records_.erase(record);
        continue;
      }
      ++record;
    }

    // Snapshot dispatchers before callbacks run so a re-entrant create_subscription
    // cannot invalidate an iterator into subscription_records_.
    std::vector<std::function<bool(void*)>> matching_dispatchers;
    for (const auto& live_record : subscription_records_) {
      if (live_record.topic == topic &&
          live_record.pointer_type == pointer_type) {
        matching_dispatchers.push_back(live_record.dispatch);
      }
    }

    size_t delivered = 0;
    for (const auto& dispatch : matching_dispatchers) {
      if (dispatch(message)) ++delivered;
    }
    if (delivered == 0) {
      throw std::runtime_error(
          "mock rclcpp::Node has no live subscription for topic '" + topic +
          "' and message pointer type '" + pointer_type.name() + "'");
    }
  }

  /// @brief 测试钩子:把消息派发给"最后建立的订阅"(模拟收到一条 ROS 消息)。
  template <typename PtrT>
  void deliver(PtrT* p) {
    if (!last_dispatcher_) {
      throw std::runtime_error(
          "mock rclcpp::Node legacy delivery has no subscription");
    }
    if (!last_dispatcher_(p)) {
      throw std::runtime_error(
          "mock rclcpp::Node legacy delivery target has expired");
    }
  }

  // 测试侧可读字段
  std::shared_ptr<void> last_publisher_;
  std::string           last_topic_;

private:
  struct SubscriptionRecord {
    std::string topic;
    std::type_index message_type;
    std::type_index pointer_type;
    std::weak_ptr<void> handle;
    std::function<bool(void*)> dispatch;
  };

  struct PublisherRecord {
    std::string topic;
    std::type_index message_type;
    std::weak_ptr<void> handle;
  };

  std::function<bool(void*)>       last_dispatcher_;
  std::vector<SubscriptionRecord> subscription_records_;
  std::vector<PublisherRecord>    publisher_records_;
};

}  // namespace rclcpp
