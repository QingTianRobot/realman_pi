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

## 节点与接口契约

| 完整节点名 | 可执行文件 | 输入/输出 | 启动条件 |
| --- | --- | --- | --- |
| `/input/joy_node` | `joy/game_controller_node` | 发布 `/input/joy`，类型 `sensor_msgs/msg/Joy` | `start_joy_driver=true` |
| `/input/xbox_controller` | `xbox_controller_driver/xbox_controller_node` | 订阅 `/input/joy`，输出 ROS 日志 | `start_controller=true` |
| `/<id>/robot_state_publisher` | `robot_state_publisher/robot_state_publisher` | 发布 `/<id>/robot_description`、`/tf`、`/tf_static` | `start_robots=true` |
| `/<id>/joint_state_publisher` | `joint_state_publisher/joint_state_publisher` | 发布 `/<id>/joint_states` | `start_robots=true` |
| `/<id>/world_transform` | `tf2_ros/static_transform_publisher` | 发布 `world -> <id>/world` | `start_robots=true` |

其中 `<id>` 只能是 `l`、`m` 或 `r`。输入节点目前没有 service、action 或参数动态映射接口；`joy_topic` 是唯一的设备层到 C++ 层连接点。后续增加命令映射时，应保持 `/input/joy` 的标准消息边界，并在独立模块中定义 service/action 客户端。

### Joy 消息语义

`buttons` 中的非零值都视为按下，零值视为释放。C++ 节点只比较当前消息和上一条消息的布尔状态，因此会产生以下事件：

| 状态变化 | 日志 |
| --- | --- |
| `0 -> 非零` | `button[index] name PRESSED` |
| `非零 -> 0` | `button[index] name RELEASED` |
| 状态不变 | 不输出按键日志 |
| 上一条消息存在但本条数组变短 | 缺失索引按释放处理 |

轴和扳机值会由 `game_controller_node` 发布到 `axes`，但当前 C++ 节点不会处理它们。

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

## ROS 2 日志

Bringup 使用 ROS 2 官方日志接口和 rcutils 环境变量：

| 环境变量 | 行为 |
| --- | --- |
| `RCUTILS_COLORIZED_OUTPUT=1` | 为终端日志启用官方彩色输出，不在业务代码中手写 ANSI 颜色码 |
| `ROS_LOG_DIR` | 指向本次运行的时间目录 |
| `REALMAN_LOG_ROOT` | 指定时间目录的根路径，Docker 默认为 `/opt/rm65_ws/logs` |

每次启动 `realman_bringup` 都创建 `logs/YYYYMMDD_HHMMSS/`。ROS 2/rcutils 在其中生成官方节点日志，例如 `xbox_controller_node_<pid>_<timestamp>.log`。文件名包含节点名、进程号和生成时间，避免三臂中同名节点互相覆盖。Docker 将宿主机 `./logs` 挂载到容器日志根目录；`realman_bringup_remote` 也保留该挂载。

ROS 节点的打印必须使用 `RCLCPP_*` 或 ROS 2 官方 Python/launch 日志接口。禁止使用 `printf`、`std::cout`、`std::cerr` 或 shell 重定向伪造节点日志。

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

启动参数只控制节点是否创建，不会改变 `config/ros/three_robots.yaml` 中的 TF 位姿。典型组合如下：

| 用途 | `start_robots` | `start_joy_driver` | `start_controller` | `use_rviz` |
| --- | --- | --- | --- | --- |
| 完整本地操作 | `true` | `true` | `true` | `true` |
| 只测输入处理 | `false` | `false` | `true` | `false` |
| 远程 headless | `true` | `false` | `true` | `false` |
| 只看三臂模型 | `true` | `false` | `false` | `true` |

启动真实设备：

```bash
docker compose build realman_bringup
docker compose run --rm realman_bringup
```

Compose 默认把主机 `${REALMAN_JOY_DEVICE:-/dev/input/event0}` 映射为容器 `/dev/input/event0`。SDL 使用 event 接口，不能把 `js0` 当作等价替代。建议把 `REALMAN_JOY_DEVICE` 指向 `/dev/input/by-id/*-event-joystick` 稳定路径；运行 Docker 的用户必须具备对应 Linux input 权限。

## 远程与无设备调试

所有容器使用 host network、`ROS_LOCALHOST_ONLY=0` 和默认 `ROS_DOMAIN_ID=65`。在机器人端启动无 GUI、无本地手柄的目标；该服务不需要设置 `DISPLAY` 或 `XAUTHORITY`：

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

远程发布端不需要启动 `joy_node`。可以先确认图发现和话题类型：

```bash
ros2 topic list | rg '^/input/joy$'
ros2 topic info /input/joy --verbose
ros2 node list | rg 'input|robot_state_publisher|joint_state_publisher'
```

`realman_bringup_remote` 使用 host network，但 DDS 自动发现仍依赖网络组播和 UDP。跨网段环境不能只依赖 `ROS_DOMAIN_ID`，还需要配置 DDS 的发现机制或在同一二层网络中测试。

## 构建与验证

从仓库根目录执行 Humble 构建和单元测试：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-up-to realman_bringup
colcon test --packages-select xbox_controller_driver
colcon test-result --verbose
```

`button_state_tracker_test` 覆盖按下/释放边沿、未知按钮命名，以及 Joy 按钮数组缩短时生成释放事件。端到端验证还应使用上述模拟消息观察实际 ROS 日志。

Dockerfile 在构建阶段执行同一套测试：

```bash
docker compose build realman_bringup_remote
```

构建成功时应看到 `Summary: 4 tests, 0 errors, 0 failures`。实体手柄测试还需要主机存在 SDL 可识别的 `/dev/input/event*` 设备，容器用户有对应 input 权限。

日志验证命令：

```bash
find logs -maxdepth 2 -type f -name '*.log' -print
```

## 已知边界

- 当前节点只处理数字按钮数组，不记录摇杆和扳机轴。
- 当前节点只输出按键边沿，不调用 service、action 或机械臂控制接口。
- 未被 SDL 数据库识别的控制器需要提供 `SDL_GAMECONTROLLERCONFIG`，否则节点可能无法打开设备。
- ROS 2 自动发现依赖网络支持组播和 DDS UDP；host network 不会绕过防火墙策略。
- 文档网页展示配置和模型，不实时连接运行中的 ROS 图或手柄。

## 失败症状速查

| 症状 | 优先检查 |
| --- | --- |
| `game_controller_node` 启动但没有 Joy 消息 | `REALMAN_JOY_DEVICE` 是否指向 `*-event-joystick`，不要映射 `js0`；检查 `ros2 run joy joy_enumerate_devices` |
| 节点输出 `button_<index>` | SDL 映射产生了配置表之外的索引，检查 `config/ros/xbox_controller.yaml` 或设置 `SDL_GAMECONTROLLERCONFIG` |
| 只有按下没有释放 | 发布端是否持续发布释放状态；检查 `buttons` 数组是否在释放消息中包含对应索引 |
| 远程端看不到 `/input/joy` | 两端的 `ROS_DOMAIN_ID`、`ROS_LOCALHOST_ONLY`、DDS UDP 和防火墙 |
| 日志没有落在项目目录 | 是否由 `realman_bringup` 启动、`REALMAN_LOG_ROOT` 是否可写、宿主 `logs/` 是否挂载 |
| RViz/GUI 退出并提示 Qt/X11 | 图形服务需要有效 `DISPLAY`、`XAUTHORITY` 和 `/tmp/.X11-unix`；无桌面请使用 remote 服务 |
