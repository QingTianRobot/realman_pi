---
title: WebSocket 浏览器控制与 URDF 影子
description: realman_web_control 的 WebSocket 协议、Action 反馈、软件停止、URDF 预览和测试方法。
---

# WebSocket 浏览器控制与 URDF 影子

`realman_web_control` 是一个 ROS 2 功能包：它把浏览器同源 WebSocket 消息转换成现有的
`ExecuteMotion`、`CartesianVelocity` Action、速度命令和 `/stop` 服务。页面同一端口会同时
渲染三台机械臂的实时 URDF 和坐标状态，但控制指令始终只作用于当前选中的 arm。浏览器永远
不直接加载 RealMan SDK，也不绕过 `realman_robot_driver` 的 ownership、坐标 gate、
watchdog 或 lockout。

```text
笔记本浏览器
    │ http://工控机:8765/ + /ws
    ▼
realman_web_control (aiohttp 线程 + ROS 2 executor)
    │ ActionClient / Trigger client / TwistStamped publisher
    ▼
/l、/m、/r realman_robot_driver
    ▼
RealMan SDK / 三台控制器
```

## 启动

配置在 `config/ros/realman_web_control.yaml`。Web 服务默认监听 `0.0.0.0:8765`，所以
笔记本访问：

```bash
source functions.zsh
rm65_docker_web_control_start
rm65_web_control_url 192.168.30.10
```

`192.168.30.10` 应替换为工控机连接路由器的地址。也可以前台运行并观察日志：

```bash
rm65_docker_web_control
rm65_docker_web_control_logs -f
```

`realman_web_control` 是独立服务，加入与驱动相同的 `ROS_DOMAIN_ID`。它不会启动驱动；
如果要在一个 Compose 命令中同时启动驱动和 Web 控制，可设置：

```bash
export REALMAN_START_WEB_CONTROL=true
docker compose run --rm realman_bringup_remote
```

浏览器连接 `/ws` 后即可发送运动、取消和软件停止消息，不需要额外输入 token。该服务应
只部署在受信任、隔离的机器人局域网；它仍然经过既有 driver 的 ownership、坐标 gate、
watchdog 和 lockout，不会直接调用 SDK。

## WebSocket 协议

连接 `/ws` 后首先收到 `hello`，其中包含 `read_only=false`、`client_id` 和完整的 `layout`。

服务端会广播以下状态事件：

| 事件 | 关键字段 | 用途 |
| --- | --- | --- |
| `joint_state` | `arm`, `positions_rad`, `stamp_ns` | 各 arm 的实体 URDF 姿态和滑轨 |
| `connection` | `arm`, `connected` | 控制器在线状态 |
| `coordinate_state` | `arm`, `motion_allowed`, `preferred_reference`, `tool`, `work` | 各 arm 的激活坐标、可运动状态和默认参考系 |
| `action_state` | `action`, `request_id`, `state` | submitting/accepted/canceling |
| `action_feedback` | `feedback` | 原 Action feedback 的 JSON 映射 |
| `action_result` | `status`, `result` | 原 Action result 和 rclpy 状态 |
| `software_stop_result` | `success`, `message` | `/arm/stop` 的结果 |

### MOVEJ

目标关节使用 degree，和 `ExecuteMotion.action` 一致；Web 后端会从 URDF limit 再检查一次。
左侧三块 `L`、`M`、`R` 会同时显示三台机械臂的连接和坐标状态；点击其中一个块即可切换
当前控制对象，右侧滑条随之控制该 arm。页面会优先使用当前 `coordinate_state` 给出的默认参考系发送目标：
右侧关节面板标题会显示当前激活的 arm，便于确认选择是否已经切换。
在没有人工改动目标之前，右侧滑条会跟随该 arm 的实时 `joint_state`；一旦人工拖动滑条，该 arm
的目标值就会保持用户输入，直到再次切换或重置。

```json
{
  "type":"execute_motion", "request_id":"move-001", "arm":"l",
  "goal": {
    "command":0, "reference_type":1, "reference_name":"cell",
    "joint_degrees":[0,10,0,-20,0,0],
    "pose_position_m":[0,0,0], "pose_quaternion_wxyz":[1,0,0,0],
    "velocity_percent":30, "blend_radius_percent":0, "timeout_sec":10
  }
}
```

`action_feedback.feedback.current_joint_degrees` 到达时，网页只更新当前 arm 的实体模型；三台
机械臂的 live URDF 会保留在同一画布中，选中 arm 的滑轨编辑目标保持为橙色半透明影子，
不会被回读覆盖。点击“发送 MOVEJ”才提交影子目标。当前坐标面板会显示 tool/work 名称、
控制器回读值，以及工具坐标的位姿、payload 和重心。

### 末端六轴速度

先建立速度 Action，再以 20 ms 左右的周期发送 `vx, vy, vz, wx, wy, wz`。页面会默认选中
当前 `coordinate_state` 提供的参考系：

```json
{"type":"start_cartesian_velocity","request_id":"vel-001","arm":"l","goal":{
  "reference_type":1,"reference_name":"cell","control_period_ms":20,"watchdog_ms":100,
  "max_linear_accel_mps2":0.10,"max_angular_accel_radps2":0.50,
  "follow":false,"trajectory_mode":0,"radio":0}}
```

```json
{"type":"velocity_command","arm":"l","linear":[0.01,0,0],"angular":[0,0,0]}
```

参考系名称来自 `realman_coordinates.yaml`，不能由网页任意拼接。角速度是轴角速度，
不是 Euler 姿态；位姿 Action 的四元数仍使用 `[w,x,y,z]`，从而不会在浏览器控制面板中
引入万向锁。

## 取消与软件停止

“取消 Action”只对发起该 Action 的 WebSocket 客户端有效，调用 `cancel_goal_async()`，
驱动随后执行 slow-stop。网页红色“软件停止”按钮单独调用 `/{arm}/stop`，不先调用 cancel，
因此不会被 slow-stop 竞态拖慢。它是最快受控停止，不替代控制柜或现场物理急停。

客户端断开时，后端按以下顺序清理：速度通道发布零速度、请求速度 Action cancel、请求普通
Action cancel。浏览器刷新不会留下仍由网页拥有的速度命令。

## URDF 与影子模型

后端启动时读取：

- `config/ros/three_robots.yaml`：arm、model、world transform；
- `config/ros/realman_motion.yaml`：速度、加速度、watchdog 默认值；
- `config/ros/realman_coordinates.yaml`：BASE/WORK/TOOL 当前配置名称；
- `rm65_description/urdf/<model>.urdf`：六个关节的 lower/upper limit 和 mesh。

服务端只允许 `/models/urdf/<model>.urdf` 和 `/models/meshes/...` 解析到
`rm65_description` package 内，`..` 路径会被拒绝。前端为三台机械臂分别加载两份 URDF
实例：每台 arm 都有一个实体模型和一个影子模型。实体模型使用各自的
`joint_states.position`，影子模型只跟随当前选中 arm 的滑轨目标；不 clone 实例，避免
URDFLoader 的关节映射共享。切换 l/m/r 只会切换控制焦点，不会重建整个三臂视图。

## 测试和开发

Python 协议、URDF limit、路径穿越和消息 JSON 映射测试：

```bash
PYTHONPATH=src/driver/realman_web_control \
  python3 -m pytest -q src/driver/realman_web_control/test
```

前端源代码在 `src/driver/realman_web_control/web/src/`，配置在
`config/web-control/vite.config.mjs`。普通 ROS 镜像不依赖 Node，提交的 `static/` 是可复现
构建产物；源码变更后在仓库 `website/` 目录执行：

```bash
npm run build:web-control
npm run test:web-control
```

Playwright 测试应覆盖桌面和移动视口、canvas 非空、实体/影子同时存在、滑轨后画布改变、
feedback/result 实时更新、cancel 和 software stop 的协议消息。真机测试前先用 mock driver
启动同一 Web 服务验证 ownership 和断开清理，再在低速率和明确物理安全员在场时切换
到实际控制器。
