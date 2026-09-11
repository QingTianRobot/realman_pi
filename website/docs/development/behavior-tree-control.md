---
title: 行为树控制权与 Mock 测试
description: RealMan 控制模式切换、工业任务树和隔离 mock 验证。
---

# 行为树控制权与 Mock 测试

行为树运行时位于 `realman_bt`，底层仍使用 RealMan Action 和
`motion_coordinator`。控制权由 `none`、`web`、`policy`、`teleop` 四种模式组成；
切换先停止当前运动、取消 Action、确认安全，再激活新 owner。每次成功切换递增
`epoch`，旧 owner 或旧 epoch 的命令会被仲裁层拒绝。

示例树位于 `config/behavior-trees/`：`control_mode.xml` 演示模式 Sequence，
`pick_task.xml` 演示 SubTree、Fallback、多角度策略和有限 Retry。

## 独立测试

```bash
./rm65 bt-test all       # 无 ROS 依赖的 XML 与 mock 契约
./rm65 bt-test build     # 构建 realman_msgs/realman_bt/realman_bt_mock
./rm65 bt-test mock      # 启动 /realman/mock/* 隔离 ROS 图
./rm65 bt-test web       # 启动 Compose 行为树调试服务
```

mock 节点不会连接 SDK/CAN，也不会发布生产控制命令。可通过 ROS 参数注入模式、owner
和后端健康状态；命令记录器可将 mock 输出写为 JSONL。

## 网页调试

参考 `behavior_tree_cpp` 的 `bt_server + bt_editor`，调试页面应加载 XML、校验、格式化、
单拍 tick、连续 run，并显示活动节点、Action feedback、控制模式、owner、epoch 和失败原因。
生产 Web 控制页面只请求模式，不绕过仲裁层发送动作。

相关配置：[`config/ros/behavior_tree.yaml`](../../../config/ros/behavior_tree.yaml)。
