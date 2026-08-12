---
title: Xbox 手柄输入
description: Xbox Series 手柄的 SDL 设备接入、Joy 消息、C++ 按键边沿处理和验证契约。
---

# Xbox 手柄输入

`xbox_controller_driver` 是独立的输入适配包。它把标准 ROS 2 `sensor_msgs/msg/Joy` 消息转换为可读的按键状态变化日志，不负责启动机械臂、RViz 2 或 TF，也不直接调用机器人 service/action。

系统如何组合该包与三臂环境，见[系统 Bringup](./system-bringup)。

## 模块边界

| 模块 | 职责 |
| --- | --- |
| ROS 2 `joy` 包 | 通过 SDL 从 Linux `/dev/input/event*` 读取手柄并发布 Joy 消息 |
| `xbox_controller_driver` | 订阅 Joy，检测按下/释放边沿并使用 ROS 2 官方日志接口输出 |
| `ButtonStateTracker` | 与 ROS 解耦的状态比较逻辑，供节点和单元测试复用 |

```text
/dev/input/*-event-joystick
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

## ROS 接口

| 完整节点名 | 可执行文件 | 接口 |
| --- | --- | --- |
| `/input/joy_node` | `joy/game_controller_node` | 发布 `/input/joy`，类型 `sensor_msgs/msg/Joy` |
| `/input/xbox_controller` | `xbox_controller_driver/xbox_controller_node` | 订阅 `/input/joy`，使用 sensor-data QoS |

当前没有 service、action 或动态按键命令映射接口。后续增加机器人命令时，应保持 `/input/joy` 为设备层边界，并在独立模块中实现 service/action 客户端。

## Joy 消息语义

`buttons` 中的非零值视为按下，零值视为释放。节点只比较当前消息和上一条消息的布尔状态：

| 状态变化 | 结果 |
| --- | --- |
| `0 -> 非零` | `button[index] name PRESSED` |
| `非零 -> 0` | `button[index] name RELEASED` |
| 状态不变 | 不输出按键日志 |
| 本条消息的数组比上一条短 | 缺失索引按释放处理 |

未知索引显示为 `button_<index>`。轴和扳机值由 `game_controller_node` 放在 `axes` 中，但当前 C++ 节点不会处理。

## 权威配置

输入配置统一位于根目录 [`config/ros/xbox_controller.yaml`](https://github.com/QingTianRobot/realman_pi/blob/main/config/ros/xbox_controller.yaml)：

| 参数 | 默认值 | 约束与含义 |
| --- | --- | --- |
| `/input/joy_node.device_id` | `0` | 选择容器内第一台 SDL game controller |
| `deadzone` | `0.10` | 摇杆死区，归一化范围 `[0, 1]` |
| `autorepeat_rate` | `20.0` | 状态重发频率，单位 Hz |
| `coalesce_interval_ms` | `1` | 轴事件合并窗口，单位毫秒 |
| `/input/xbox_controller.joy_topic` | `joy` | 相对命名解析为 `/input/joy` |
| `button_names` | SDL 标准顺序 | 索引到可读名称的映射 |
| `log_releases` | `true` | 是否记录释放边沿 |

`button_names` 中的字符串保持引号，因为 Humble 的 ROS YAML 解析器可能把 `y` 等裸值识别为布尔值。

## SDL 按钮映射

Bringup 使用 `game_controller_node`，由 SDL 映射库提供稳定索引：

| 索引 | 名称 | 索引 | 名称 |
| ---: | --- | ---: | --- |
| 0 | A | 1 | B |
| 2 | X | 3 | Y |
| 4 | View | 5 | Xbox/Guide |
| 6 | Menu | 7 | Left Stick |
| 8 | Right Stick | 9 | Left Bumper |
| 10 | Right Bumper | 11-14 | D-pad |
| 15 | Share | 16-19 | Paddle 1-4 |
| 20 | Touchpad |  |  |

控制器未被 SDL 数据库识别时，可通过 `SDL_GAMECONTROLLERCONFIG` 提供自定义映射。

## 实体设备

SDL 读取 Linux event 接口，不能把 `/dev/input/js0` 当作等价替代。先找到稳定设备路径：

```bash
ls -l /dev/input/by-id/*-event-joystick
```

通过完整系统服务启动：

```bash
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm realman_bringup
```

Compose 把主机 `/dev/input` 目录只读映射到容器，并允许 input event 字符设备被读取。
`wait_for_joy_device:=true` 会在设备不存在时持续轮询，设备出现后才启动
`game_controller_node`。运行 Docker 的用户必须有 input 设备访问权限。

## 独立实体手柄测试

`xbox_controller_test` 是不启动机械臂、TF 或 RViz 的专用测试服务。它只启动
`game_controller_node` 和 `xbox_controller_node`，用于确认实体设备能否发布
`/input/joy` 以及 C++ 节点能否输出按键边沿。

```bash
docker compose build xbox_controller_test
REALMAN_JOY_DEVICE=/dev/input/by-id/usb-Xbox_Controller-event-joystick \
  docker compose run --rm xbox_controller_test
```

没有 `DISPLAY` 或 `XAUTHORITY` 也可以运行。按下并释放 A 键时，终端应看到：

```text
button[0] a PRESSED
button[0] a RELEASED
```

检查手柄是否被 Joy 驱动识别：

```bash
ros2 topic echo /input/joy sensor_msgs/msg/Joy
```

该测试服务沿用 `config/ros/xbox_controller.yaml`，运行日志仍写入
`logs/YYYYMMDD_HHMMSS/`。设备不存在时会保持等待；测试结束使用 `Ctrl-C`，容器会随
`--rm` 删除。默认扫描 `/dev/input/by-id/*-event-joystick` 和
`/dev/input/by-path/*-event-joystick`；也可以用 `REALMAN_JOY_DEVICE` 指定路径或 glob。

## 无设备验证

启动只包含 C++ 输入处理节点的 headless 进程：

```bash
docker compose run --rm realman_bringup_remote \
  ros2 launch realman_bringup system.launch.py \
  start_robots:=false start_joy_driver:=false use_rviz:=false
```

从另一 Humble 终端依次发布按下和释放：

```bash
export ROS_DOMAIN_ID=65
export ROS_LOCALHOST_ONLY=0
ros2 topic pub --once /input/joy sensor_msgs/msg/Joy \
  "{axes: [], buttons: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}"
ros2 topic pub --once /input/joy sensor_msgs/msg/Joy \
  "{axes: [], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}"
```

预期日志：

```text
button[0] a PRESSED
button[0] a RELEASED
```

## 构建与测试

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select xbox_controller_driver
colcon test --packages-select xbox_controller_driver
colcon test-result --verbose
```

`button_state_tracker_test` 覆盖按下/释放边沿、未知索引命名和消息数组缩短。Docker 镜像构建也执行这些测试，成功结果应包含 `4 tests, 0 errors, 0 failures`。

## 故障速查

| 症状 | 优先检查 |
| --- | --- |
| `game_controller_node` 没有 Joy 消息 | 映射的是 `*-event-joystick` 而非 `js0`；运行 `ros2 run joy joy_enumerate_devices` |
| 日志显示 `button_<index>` | SDL 产生了配置表之外的索引；检查根配置或 `SDL_GAMECONTROLLERCONFIG` |
| 只有按下没有释放 | 发布端是否发送对应索引为 `0` 的释放消息 |
| `/input/xbox_controller` 没有收到消息 | 检查 `/input/joy` 名称、类型和 QoS；运行 `ros2 topic info /input/joy --verbose` |

## 当前限制

- 只处理数字按钮，不处理摇杆和扳机轴。
- 只输出按键边沿，不调用 service、action 或机械臂控制接口。
- 实体设备行为取决于 Linux input 权限和 SDL 映射数据库。
