---
name: ros2-logging-conventions
description: Enforce ROS 2 official logging interfaces, colored rcutils output, timestamped bringup log directories, and node-specific ROS log files. Use when adding or changing ROS 2 nodes, launch files, Docker bringup, runtime logging, or operator diagnostics in realman_pi.
---

# ROS 2 日志规范

## 运行时规则

- C++ 节点只能使用 `RCLCPP_DEBUG`、`RCLCPP_INFO`、`RCLCPP_WARN`、`RCLCPP_ERROR` 或 `RCLCPP_FATAL`。
- Python ROS 节点和 launch 逻辑使用 ROS 2/launch 官方日志接口；禁止 `printf`、`std::cout`、`std::cerr` 或自定义文件重定向作为运行日志。
- 通过 `RCUTILS_COLORIZED_OUTPUT=1` 开启官方彩色终端输出，不手写 ANSI 颜色码。
- 每次 bringup 创建 `logs/YYYYMMDD_HHMMSS/` 运行目录，并将其设置为 `ROS_LOG_DIR`。
- 让 ROS 2/rcutils 根据节点名生成官方日志文件；不要用 shell 重定向替代 ROS 日志。
- Docker 必须把宿主机 `logs/` 挂载到容器的日志根目录，远程 headless 服务也必须保留该挂载。

## 配置位置

日志相关环境变量、挂载和运行参数属于项目配置，放在根目录 `config/` 下；入口脚本只能保留 ROS 运行时必需的环境初始化。

## 验证

1. 使用 `rg` 检查 ROS 运行代码没有 `printf`、`std::cout` 或 `std::cerr`。
2. 在 Humble 容器中启动 bringup，确认终端包含 ANSI 彩色输出。
3. 确认 `logs/<timestamp>/` 存在，并包含 ROS 2 官方生成的节点日志文件。
4. 验证不同命名空间的同名节点不会覆盖日志文件。
5. 运行 `git diff --check`、`docker compose config`、Humble `colcon build/test`。

## 文档要求

完成日志行为改造后，更新 Web 开发者手册，记录环境变量、目录结构、节点文件命名、Docker 挂载、已知限制和验证命令。
