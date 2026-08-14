---
title: 睿尔曼关节状态驱动
description: RealMan Python SDK 的 ROS 2 Humble 驱动边界、三臂接口、配置和安全验证方法。
---

# 睿尔曼关节状态驱动

`realman_robot_driver` 是 `src/driver/` 下的 ROS 2 Humble Python 包。第一个可用功能是通过睿尔曼 Python SDK 周期性读取当前关节角度，并发布为 ROS 2 `sensor_msgs/msg/JointState`，供 `robot_state_publisher` 和 RViz 2 实时显示。

真实配置默认连接三台 RM65-B 控制器，但驱动只执行连接和只读状态回读，不发送运动命令。离线测试使用独立的 mock 配置文件。

## 模块边界

```text
config/ros/realman_driver.yaml
                │
                ▼
     /l|m|r/realman_driver
        │             │
        │             ├── /l|m|r/joint_states
        ▼
RealManSdkAdapter
        │
        ├── mock_mode=true: 内存状态，不导入厂商 SDK
        └── mock_mode=false: Robotic_Arm.rm_robot_interface
                                  │
                                  ▼
                         robot_state_publisher -> TF -> RViz 2
```

| 路径 | 职责 |
| --- | --- |
| `realman_robot_driver/realman_driver_node.py` | 参数、ROS topic/service、日志、单位转换和节点清理 |
| `realman_robot_driver/realman_sdk_adapter.py` | SDK 导入、句柄、连接、状态读取、停止和释放 |
| `launch/realman_driver.launch.py` | 启动一台 namespaced 驱动 |
| `launch/three_realman_drivers.launch.py` | 启动 `l`、`m`、`r` 三台驱动 |
| `config/ros/realman_driver.yaml` | 三台实例的权威连接与运行参数 |
| `config/ros/realman_driver_mock.yaml` | 不连接真机的自动化测试参数 |
| `config/python/realman-sdk-requirements.txt` | Docker 使用的 SDK 版本锁定 |

SDK 适配器保留厂商返回码。SDK 未安装且关闭 mock 时，连接返回驱动内部状态 `-100`；该值不是睿尔曼 API2 官方错误码，用于明确区分本地依赖缺失。

## ROS 图

三臂 launch 创建：

```text
/l/realman_driver
├── /l/joint_states       sensor_msgs/msg/JointState
├── /l/connected          std_msgs/msg/Bool
├── /l/connect            std_srvs/srv/Trigger
├── /l/disconnect         std_srvs/srv/Trigger
├── /l/stop               std_srvs/srv/Trigger
└── /l/status             std_srvs/srv/Trigger

/m/realman_driver         # 相同的 namespaced 接口
/r/realman_driver         # 相同的 namespaced 接口
```

`joint_states.position` 遵守 ROS 约定使用弧度。适配器从 `rm_get_joint_degree()` 读取厂商的度数，节点只在发布边界转换一次。RM65-B 的六个名称固定为 `joint_1` 到 `joint_6`，由配置中的 `joint_names` 显式声明。

未连接或 SDK 状态查询失败时不发布不可用的关节状态；mock 连接后发布六轴零位。通信错误 `-1/-2` 会将当前连接标记为失效，节点按 `reconnect_interval` 自动重连。`connected` 表示连接生命周期，调用方还应检查 `/status` 返回的 `last_error`。

`stop` 当前映射到官方 `rm_set_arm_stop()`，表示最快关节速度受控停止且轨迹不可恢复。它不是断电急停，也不替代现场安全回路。

## 参数

权威配置是 `config/ros/realman_driver.yaml`，包含 `/l/realman_driver`、`/m/realman_driver` 和 `/r/realman_driver` 三个完整节点名。

| 参数 | 默认策略 | 约束 |
| --- | --- | --- |
| `robot_model` | `RM65-B` | 必须与控制器和 URDF 型号一致 |
| `robot_ip` | `l=192.168.30.123`、`m=192.168.30.124`、`r=192.168.30.125` | 必须与现场控制器网络一致 |
| `robot_port` | `8080` | 有效 TCP/SDK 端口范围 `1..65535` |
| `thread_mode` | `RM_TRIPLE_MODE_E` | 单/双/三线程官方枚举名；UDP 后续功能需要三线程 |
| `mock_mode` | `false` | `true` 时不导入 SDK，不访问任何控制器 |
| `auto_connect` | `true` | 启动时连接并开始回读；设为 `false` 可手动调用 `connect` |
| `reconnect_interval` | `5.0` 秒 | 连接失败或断线后的重连周期；`0.0` 禁用 |
| `state_publish_rate` | `10.0` Hz | 必须大于零；后续应按网络和控制器能力测定 |
| `joint_names` | `joint_1` 到 `joint_6` | 数量必须与 SDK 返回的自由度一致 |

真机地址只能在根目录 `config/ros/realman_driver.yaml` 修改。不要把 IP、端口或型号散落到 launch 文件、Dockerfile 或源代码中。

SDK 依赖由根目录 `config/python/realman-sdk-requirements.txt` 锁定为 `Robotic_Arm==1.1.6`，Docker 构建时安装。

## 独立启动

Docker mock 测试，不会访问 `192.168.30.*`：

```bash
docker compose build realman_driver_test
docker compose run --rm realman_driver_test
```

也可以加载 Zsh 函数后运行：

```zsh
source ./functions.zsh
rm65_docker_driver_test
```

独立启动真实三臂驱动：

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install --packages-select realman_robot_driver
source install/setup.bash
ros2 launch realman_robot_driver three_realman_drivers.launch.py \
  config_file:=/path/to/realman_pi/config/ros/realman_driver.yaml
```

真机回读话题：

```bash
ros2 topic echo /l/joint_states
ros2 topic echo /m/joint_states
ros2 topic echo /r/joint_states
ros2 service call /r/status std_srvs/srv/Trigger {}
```

`joint_states.position` 是弧度，不是睿尔曼 SDK 的角度制。三台驱动使用独立 SDK 句柄，分别对应 `l/m/r` 和上面的三个 IP。

`auto_connect` 对真实和 mock 模式都生效。mock 模式启动后立即建立内存连接并以
`state_publish_rate` 发布六轴零位，因此可以在没有控制器的情况下验证 ROS 图、单位转换和
TF 消费关系。

真实状态直接驱动 RViz 2：

```bash
docker compose build realman_driver_rviz
docker compose run --rm realman_driver_rviz
```

该服务启动三台驱动、三棵带前缀的 `robot_state_publisher` TF 树和 RViz 2，不启动手柄节点。RViz 的三个 RobotModel 分别使用 `/l/robot_description`、`/m/robot_description` 和 `/r/robot_description`，固定坐标系为 `world`。

离线验证完整数据链路：

```bash
docker compose run --rm -e ROS_DOMAIN_ID=168 realman_driver_test bash -lc '
  ros2 launch realman_bringup system.launch.py \
    start_driver:=true \
    driver_config_file:=/opt/rm65_ws/config/ros/realman_driver_mock.yaml \
    start_joy_driver:=false start_controller:=false \
    use_gui:=false use_rviz:=false
'
```

在另一个同一容器或同一 ROS domain 的终端检查：

```bash
ros2 node list
ros2 topic info /l/joint_states --verbose
ros2 topic info /m/joint_states --verbose
ros2 topic info /r/joint_states --verbose
ros2 run tf2_ros tf2_echo world l/link_6
ros2 run tf2_ros tf2_echo world m/link_6
ros2 run tf2_ros tf2_echo world r/link_6
```

预期每个 `joint_states` 只有对应 `realman_driver` 一个发布者，并由对应的
`robot_state_publisher` 订阅；`world -> l/m/r/link_6` 均可持续查询。节点列表中不应出现
`joint_state_publisher`，否则说明假关节状态源没有被驱动模式禁用。

## 与描述 Bringup 的关系

`rm65_description/three_robots.launch.py` 支持两种互斥的关节状态源：

- 模型查看：默认使用 `joint_state_publisher` 的假状态；
- 真机运行：使用 `use_driver_joint_states:=true`，禁用假状态，接收 `realman_robot_driver` 发布的真实状态。

统一 `realman_bringup/system.launch.py` 默认启用第二种模式，并透传 `start_driver` 控制驱动和关节状态源。

## 日志

节点只使用 `rclpy` 官方日志接口。独立 launch 设置 `RCUTILS_COLORIZED_OUTPUT=1`，并在 `REALMAN_LOG_ROOT` 下创建 `YYYYMMDD_HHMMSS` 目录作为 `ROS_LOG_DIR`。launch 通过 namespace 设置进程 argv0，因此 Docker 继承的项目根目录 `logs/` 中会生成 `l_realman_driver_<pid>_<timestamp>.log`、`m_realman_driver_<pid>_<timestamp>.log` 和 `r_realman_driver_<pid>_<timestamp>.log`。

状态轮询错误只在错误码变化时打印，避免每个定时周期刷屏。连接失败日志保留 API2 状态和 SDK 异常详情，但不记录密码或凭据。

收到 launch 的 `SIGINT` 或 ROS context 外部关闭时，节点先释放 SDK 连接，再销毁 ROS
资源；重复关闭不会再次调用无效 context。正常 Ctrl-C 的三个驱动进程都应显示
`process has finished cleanly`，不应出现 Python traceback。

## 真机运行门槛

首次连接真机前完成以下检查：

1. 在目标 Humble/Python 环境安装并固定 `Robotic_Arm` 版本；Docker 使用项目锁定文件自动安装。
2. 使用官方基础示例只连接并查询型号、控制层、规划层、算法和动力学版本。
3. 核对 IP、端口、RM65 型号、力传感器版本和控制器固件对应关系。
4. 先验证 `status`、`connect`、只读状态、`stop`、超时、断线和关闭清理。
5. 清空工作区、限制速度并保证现场急停可触达。

接口和版本依据见[睿尔曼 Python 驱动查询 Skill](./realman-python-driver)。后续每增加一个运动、力控或 IO 接口，都要同时补适配器测试、ROS 接口测试、失败路径和本页契约。

## 当前限制

- SDK 版本由 `config/python/realman-sdk-requirements.txt` 锁定；真实控制器、网络连通性和固件兼容性仍需现场确认。
- 连接和状态读取当前在 ROS executor 线程中同步执行；生产实现需要避免网络阻塞占用关键回调线程。
- 已实现基础连接重试；尚未实现状态陈旧检测、诊断消息和 QoS 专项配置。
- 未实现轨迹 action、速度命令、力控、IO、Modbus、UDP 和末端设备接口。
- 未验证真实 RM65 控制器；所有真机参数和固件兼容性仍需现场确认。
