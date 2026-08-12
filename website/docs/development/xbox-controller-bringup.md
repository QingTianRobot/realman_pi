---
title: Xbox 输入与统一 Bringup
description: Xbox Series 手柄输入、C++ 按键处理、系统启动编排和 ROS 2 Humble 远程调试契约。
---

# Xbox 输入与统一 Bringup

该功能把 Linux Xbox Series 手柄接入标准 ROS 2 `sensor_msgs/msg/Joy` 数据流，并由独立 C++ 节点记录按键状态变化。`realman_bringup` 是系统级启动入口，负责组合三臂、RViz 2、设备驱动和输入处理节点。

第一阶段只验证输入链路，不调用机器人 service 或 action。后续命令映射应在 `xbox_controller_driver` 内扩展，并继续使用标准 Joy 消息作为设备层边界。

## 包边界与数据流

| 模块 | 职责 |
| --- | --- |
| ROS 2 `joy` 包 | 通过 SDL 从 Linux `/dev/input/event*` 读取事件并发布 Joy 消息 |
| `xbox_controller_driver` | C++ 订阅者，检测按下/释放边沿并输出日志 |
| `realman_bringup` | 通过启动参数组合机器人、RViz、Joy 驱动与处理节点 |
| `rm65_description` | 提供 `l`、`m`、`r` 三臂描述和完整 TF 树 |

```text
/dev/input/event0
      │
      ▼
/input/joy_node (`game_controller_node`)
      │
      └── /input/joy [sensor_msgs/msg/Joy]
                    │
                    ▼
          /input/xbox_controller
                    │
                    └── button[index] name PRESSED/RELEASED
```

`xbox_controller_node` 使用 sensor-data QoS，只在布尔按键状态变化时记录事件，手柄保持按下时不会按 `autorepeat_rate` 重复刷屏。消息中的未知按钮仍会显示为 `button_<index>`。

## 权威配置

所有输入参数由根目录 [`config/ros/xbox_controller.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/xbox_controller.yaml) 管理：

| 参数 | 默认值 | 约束与含义 |
| --- | --- | --- |
| `/input/joy_node.device_id` | `0` | 选择容器内第一台 SDL game controller |
| `deadzone` | `0.10` | 摇杆死区，归一化范围 `[0, 1]` |
| `autorepeat_rate` | `20.0` | 状态重发频率，单位 Hz |
| `coalesce_interval_ms` | `1` | 轴事件合并窗口，单位毫秒 |
| `/input/xbox_controller.joy_topic` | `joy` | 相对命名解析为 `/input/joy` |
| `button_names` | Xbox 常见顺序 | 索引到可读名称的映射 |
| `log_releases` | `true` | 是否同时记录释放边沿 |

Bringup 使用 `game_controller_node`，由 SDL 映射库提供稳定索引。`0..10` 依次为 A、B、X、Y、View、Xbox、Menu、左右摇杆按键、左右肩键；`11..14` 是方向键。其余索引用于 Share、背键和触控板等可选按钮。控制器不在 SDL 数据库中时，可以通过 `SDL_GAMECONTROLLERCONFIG` 提供自定义映射。

Docker 把根 `config/` 只读挂载到 `/opt/rm65_ws/config`，并通过 `REALMAN_CONFIG_ROOT` 让 launch 读取它；修改配置后重启容器即可生效。本地安装则读取 `realman_bringup` 安装目录中的配置副本，需要重新构建包。

## Bringup 接口

```bash
ros2 launch realman_bringup system.launch.py \
  start_robots:=true \
  start_joy_driver:=true \
  start_controller:=true \
  use_gui:=false \
  use_rviz:=true
```

| 参数 | 默认值 | 行为 |
| --- | --- | --- |
| `start_robots` | `true` | 启动三臂描述、关节状态和完整 TF |
| `start_joy_driver` | `true` | 启动标准 `game_controller_node` 读取实体设备 |
| `start_controller` | `true` | 启动 C++ Xbox 输入处理节点 |
| `use_gui` | `false` | 为三台机械臂启动关节状态 GUI |
| `use_rviz` | `true` | 使用三臂配置启动 RViz 2 |

启动真实设备：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

Compose 默认把主机 `${REALMAN_JOY_DEVICE:-/dev/input/event0}` 映射为容器 `/dev/input/event0`。SDL 使用 event 接口，不能把 `js0` 当作等价替代。建议把 `REALMAN_JOY_DEVICE` 指向 `/dev/input/by-id/*-event-joystick` 稳定路径；运行 Docker 的用户必须具备对应 Linux input 权限。

## 远程与无设备调试

所有容器使用 host network、`ROS_LOCALHOST_ONLY=0` 和默认 `ROS_DOMAIN_ID=65`。在机器人端启动无 GUI、无本地手柄的目标：

```bash
ROS_DOMAIN_ID=65 docker compose run --rm realman_bringup_remote
```

另一台安装 ROS 2 Humble 的主机设置同一域后，可发布一次模拟按键：

```bash
export ROS_DOMAIN_ID=65
export ROS_LOCALHOST_ONLY=0
ros2 topic pub --once /input/joy sensor_msgs/msg/Joy \
  "{axes: [], buttons: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}"
ros2 topic pub --once /input/joy sensor_msgs/msg/Joy \
  "{axes: [], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}"
```

目标端应依次出现：

```text
button[0] a PRESSED
button[0] a RELEASED
```

如果无法发现话题，先确认两端都是 Humble、`ROS_DOMAIN_ID` 一致、`ROS_LOCALHOST_ONLY=0`，并检查路由、组播和主机防火墙是否允许 DDS UDP 流量。

## 构建与验证

从仓库根目录执行 Humble 构建和单元测试：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
colcon test --packages-select xbox_controller_driver
colcon test-result --verbose
```

`button_state_tracker_test` 覆盖按下/释放边沿、未知按钮命名，以及 Joy 按钮数组缩短时生成释放事件。端到端验证还应使用上述模拟消息观察实际 ROS 日志。

## 已知边界

- 当前节点只处理数字按钮数组，不记录摇杆和扳机轴。
- 当前节点只输出按键边沿，不调用 service、action 或机械臂控制接口。
- 未被 SDL 数据库识别的控制器需要提供 `SDL_GAMECONTROLLERCONFIG`，否则节点可能无法打开设备。
- ROS 2 自动发现依赖网络支持组播和 DDS UDP；host network 不会绕过防火墙策略。
- 文档网页展示配置和模型，不实时连接运行中的 ROS 图或手柄。
