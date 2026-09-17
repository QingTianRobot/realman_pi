// ============================================================================
//  bt_ros2/data_freshness.hpp
//  数据新鲜度判定 —— ROS-free 纯逻辑(可独立单元测试，无需 rclcpp)。
//
//  为什么单独成文件：
//    机器人场景里，订阅来的数据可能"很久没更新"了(传感器掉线、话题断流)。
//    一个接收 ROS2 数据的状态节点，不能因为"曾经收到过"就一直当数据有效——
//    必须判断"最近一次收到的数据是否仍在可接受的时效窗口内"。
//    这个判定是纯时间运算，不依赖 ROS，因此抽出来单独测试，保证逻辑正确；
//    真正的 rclcpp 订阅胶水(见 ros_subscriber_node.hpp)只管把"上次接收时间"
//    喂进来。这样核心逻辑 100% 被本机单测覆盖，胶水层薄到一眼能看对。
// ============================================================================
#ifndef BT_ROS2_DATA_FRESHNESS_HPP
#define BT_ROS2_DATA_FRESHNESS_HPP

#include <chrono>

namespace bt_ros2 {

/// @brief 单调时钟时间点别名(用 steady_clock，不受系统时间跳变影响)。
using SteadyTime = std::chrono::steady_clock::time_point;

/**
 * @brief 判断"最近一次收到的数据"在给定时刻是否仍然新鲜。
 *
 * @param received  是否至少收到过一次数据(从未收到时新鲜度无从谈起)。
 * @param last_recv 最近一次收到数据的时刻。
 * @param now       当前判定时刻。
 * @param timeout_ms 时效窗口(毫秒)。
 *        - > 0  ：数据年龄 ≤ timeout_ms 才算新鲜；超过即过期。
 *        - ≤ 0  ：表示"永不过期"——只要收到过(received==true)就算新鲜。
 * @return 数据是否可用(新鲜)。
 *
 * @note 用 steady_clock 而非 system_clock：避免 NTP 校时/夏令时导致的时间回拨
 *       把新数据误判成过期(或反之)。
 */
inline bool isFresh(bool received, SteadyTime last_recv, SteadyTime now,
                    int timeout_ms) {
  if (!received) {
    return false;  // 从未收到任何数据 → 一定不新鲜
  }
  if (timeout_ms <= 0) {
    return true;  // 永不过期：收到过就算数
  }
  const auto age =
      std::chrono::duration_cast<std::chrono::milliseconds>(now - last_recv)
          .count();
  // 防御时钟回拨：age 为负时视为"刚收到"，仍新鲜。
  if (age < 0) {
    return true;
  }
  return age <= timeout_ms;
}

/**
 * @brief 返回数据年龄(毫秒)。从未收到时返回 -1。用于日志/调试展示。
 */
inline long dataAgeMs(bool received, SteadyTime last_recv, SteadyTime now) {
  if (!received) {
    return -1;
  }
  const auto age =
      std::chrono::duration_cast<std::chrono::milliseconds>(now - last_recv)
          .count();
  return age < 0 ? 0 : static_cast<long>(age);
}

}  // namespace bt_ros2

#endif  // BT_ROS2_DATA_FRESHNESS_HPP
