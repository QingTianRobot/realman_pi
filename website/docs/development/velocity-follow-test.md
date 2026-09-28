---
title: 笛卡尔速度跟随测试
description: 纯 Python 键盘工具，直接调用睿尔曼 SDK 测量机械臂对速度指令的跟随质量。
---

# 笛卡尔速度跟随测试

`tools/velocity_follow` 用来回答一个问题：**按住键盘发出的笛卡尔速度指令，机械臂到底跟没跟上。**

它是一个**独立的纯 Python 工具，不依赖 ROS**，直接通过睿尔曼 Python SDK 连机械臂。装了 SDK 就能跑，
不需要启动 bringup、不需要容器、不需要 ROS 图。

::: warning 默认不动机械臂
不加 `--execute` 时，工具会连上控制器、采样位姿、记录它*本来会发出*的指令流，但一条指令都不下发。
确认无误后再加 `--execute`。
:::

## 为什么不走 ROS

驱动侧的 `/<arm>/cartesian_velocity/state` 遥测由驱动状态定时器产生，速率受 `state_publish_rate`
（默认 10 Hz）限制，滞后和上升时间的分辨率不会优于 100 ms。本工具自己开采样线程直接读
`rm_get_joint_degree` + `rm_algo_forward_kinematics`，采样率只受控制器응答速度限制，因此能看到
ROS 链路看不到的时序细节。

## 数据流

```text
终端按键（raw 模式，与 Web 页面同一套按键）
  └─ KeyHoldTracker：按住=自动重复刷新，松开=超时归零
       └─ limits.shape_command：速度钳位 → 加速度限幅（与 ROS 驱动同一套算法）
            └─ rm_movev_canfd（控制线程，固定周期）
                 │
   rm_get_joint_degree + rm_algo_forward_kinematics（采样线程，独立速率）
                 └─ 位姿差分 → measured
                      └─ CSV（每周期一行）→ 指标 → 报告
```

两条线程分开是关键：状态读取的网络往返不会拖慢指令周期。

## 模块

| 模块 | 职责 |
| --- | --- |
| `velocity_follow/arm.py` | 唯一知道 SDK 存在的地方；含离线 `MockArm` |
| `velocity_follow/runner.py` | 固定周期控制循环 + 后台位姿采样线程 |
| `velocity_follow/limits.py` | 速度钳位与加速度限幅，与 ROS 驱动逐行对应 |
| `velocity_follow/terminal_keyboard.py` | 终端 raw 模式按键与 hold-to-run 状态 |
| `velocity_follow/key_bindings.py` | 复用 `config/ros/keyboard_control.yaml`，并内置同一份兜底 |
| `velocity_follow/profiles.py` | 可复现波形（step/square/sine/chirp/ramp/hold） |
| `velocity_follow/metrics.py` | 纯函数指标：增益、滞后、上升时间、串轴泄漏、位移一致性 |
| `velocity_follow/report.py` | 文本报告与 JSON 摘要，也可离线分析已有 CSV |
| `velocity_follow/cli.py` | 命令行入口与安全门 |

## 运行

```bash
cd tools/velocity_follow

# 先在任意机器上试手感，不需要 SDK、不需要真机
python3 -m velocity_follow --mock --execute

# 工控机上空跑：连真机、采样、记录，但不动
python3 -m velocity_follow --arm l

# 真实测量
python3 -m velocity_follow --arm l --execute
```

远程必须带 `ssh -t`，否则没有 TTY 读不到按键：

```bash
ssh -t administrator@<host> 'cd realman_pi/tools/velocity_follow && python3 -m velocity_follow --arm l --execute'
```

按键沿用 Web 控制页面布局，启动时会打印当前臂的按键表。按住移动、松开停止、`Esc` 或 `Ctrl-C` 结束（`q` 是左臂 wx+ 旋转键，不是退出键）。

### 可复现波形

键盘手感不可复现。要对比两种配置（最典型的是 `--follow` 开与关）时用 `--profile`：

```bash
python3 -m velocity_follow --arm l --execute \
  --profile 'vx|step|0.02|4.0|0|2.0|x-step' \
  --profile 'vx|sine|0.02|10.0|0.25|2.0|x-sine'
```

格式是 `axis|waveform|amplitude|duration_sec|frequency_hz|settle_sec|label`，波形取值
`hold`、`step`、`ramp`、`square`、`sine`、`chirp`（从 0.1 Hz 扫到 `frequency_hz`）。
线性轴单位 m/s，角速度轴单位 rad/s。

## 关键参数

默认值对齐 `config/ros/realman_motion.yaml`，这样测的是生产行为而不是私有配置。

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `--period-ms` | 10 | 指令周期；默认对齐 l/r 的 `velocity_control_period_ms`（高跟随下限） |
| `--sample-hz` | 100 | 位姿采样率；决定滞后与上升时间的分辨率 |
| `--max-linear-speed` / `--max-angular-speed` | 0.05 / 0.25 | 速度上限；波形幅值超过它会被钳位，表现为"增益偏低" |
| `--max-linear-accel` / `--max-angular-accel` | 0.10 / 0.50 | 加速度限幅；决定上升时间的物理下限 |
| `--follow` | 关 | 关=低跟随模式，开=高跟随模式。跟随发滞时最值得 A/B 的开关 |
| `--frame` | work | 速度所在坐标系，`work` 或 `tool` |
| `--work-frame` | 空 | 流控前先切到指定控制器工作坐标系 |
| `--key-linear-speed` | 0.02 | 一个按键对应的速度，与 Web 键盘控制相同（`keyboard_control.yaml` 派生的 `0.02 m/s`） |
| `--key-hold-ms` | 250 | 终端不上报抬键；某轴在最后一次自动重复后这么久停下 |
| `--baseline-sec` | 1.0 | 开跑前静止采样多久，标定测量噪声底；0 跳过 |
| `--velocity-window-ms` | 100 | 速度最小二乘拟合窗口；越小越跟得上快变化，越大越抗量化噪声 |
| `--max-run-sec` | 300 | 单次运行硬上限 |

## 输出与指标

`logs/velocity-follow/<arm>_<name>.csv` 每个指令周期一行：`cmd_*`（键盘/波形要求的）、
`acc_*`（速度钳位后）、`lim_*`（加速度限幅后真正下发的）、`mea_*`（位姿差分回读）。
每行即时 flush，Ctrl-C 后仍可分析。同名 `.json` 是机器可读摘要。

| 指标 | 回答什么 | 备注 |
| --- | --- | --- |
| `steady-state gain` | 速度对不对 | 只对单边指令（`hold`/`step`/按住不放）有意义 |
| `amplitude gain` | 速度对不对 | RMS 比值，`square`/`sine` 用它 |
| `lag vs command` | 慢多少 | 归一化互相关；指令恒定时无时间信息，返回 `n/a` |
| `lag vs limited cmd` | 扣掉加速度斜坡后还慢多少 | 与上一项差得大说明瓶颈是限幅而非控制器 |
| `rise time to 90%` | 多快到位 | 相对**实际达到**的速度，不含增益缺口 |
| `uncommanded motion` | 方向有没有偏 | 未被指令的轴上的平均速度 |
| `displacement check` | 整段走的距离对不对 | 指令积分与实测位移比较，不受采样率影响；但起步亏损和松键滑行会互相抵消，见下 |
| `measurement noise` | 上面那条"跑偏"是真的还是噪声 | 开跑前静止采样标定，见下 |

判据阈值在 `report.py`：增益偏差 20%、滞后 300 ms、串轴泄漏 20%。用来区分"大致跟得上"和
"跟不上"，不是调参指标。退出码 `0` 跟得上、`1` 跟不上、`2` 无可分析数据。

## 按键 / 松键响应

对键盘操作来说，"跟不跟得上"主要不是稳态速度，而是按下和松开这两个瞬间。工具对每一次按键
（任一轴上指令从 0 变非 0，到再回到 0）单独测量：

| 指标 | 含义 |
| --- | --- |
| `press -> first motion` | 按下到机械臂开始动 |
| `press -> 90% of command` | 按下到达到指令速度的 90%；括号里是加速度斜坡本身需要的时间 |
| `travelled while held` | 按住期间实际走了多少、比指令积分少多少 |
| `release -> stopped` | 松开到停稳 |
| `coast after release` | 松开之后还滑了多远 |

整段位移校验会掩盖这些：起步少走的距离，会被松开后的滑行补回来，于是总位移看起来几乎完美。

判据在 `report.py`：到速时间超出加速度斜坡 300 ms 以上、或松键后滑行超过 5 mm，判为 `SLOW`。
进程退出码同时考虑稳态和瞬态，任一不过即为 `1`。

### 真机实测（左臂，低跟随模式，20 mm/s 沿 x 阶跃 4 秒）

| | |
| --- | --- |
| 稳态增益 | **0.995**（速度本身是准的） |
| 按下 → 开始动 | **160 ms** |
| 按下 → 90% 速度 | **1012 ms**（加速度斜坡本身只需 160 ms） |
| 按住期间 | 走了 67.0 / 79.9 mm，**松开时落后 12.9 mm** |
| 松开 → 停稳 | **1781 ms** |
| 松开后滑行 | **11.9 mm** |
| 整段位移 | 79.0 / 80.3 mm，比值 0.987 —— 起步亏的被滑行补回 |
| 串轴漂移 | ≈0.02 mm/s，方向误差 0.1°，无跑偏 |

也就是说：速度准、方向准，但**两头都慢**——起步约 1 秒才到速，松手后还要约 1.8 秒、12 mm 才停。
加速度斜坡只解释了其中 160 ms，其余来自控制器低跟随模式的平滑。这很可能就是键盘操作时感觉到的
"跟不上 / 偏移"。下一步最值得对比的是 `--follow`（高跟随）与 `--period-ms 10`。

## 测量噪声底

每次运行开始前会静止采样 `--baseline-sec`（默认 1 秒）标定测量噪声，打印在报告头部并写入 JSON。
串轴漂移只有同时超过 20% 阈值**和** 3σ 噪声才判为"跑偏"。

速度由位姿对时间在 `--velocity-window-ms`（默认 100 ms）滑动窗口内做最小二乘拟合得到，而不是相邻两帧
差分。真机上两帧差分会把关节编码器量化放大成约 **1 mm/s（1σ）** 的假速度；窗口拟合后静止噪声降到
约 **0.11 mm/s**。代价是窗口会把快于约 100 ms 的变化抹平，这对 1 秒量级的起步和停止无碍。

## 安全边界
## 安全边界

- 不加 `--execute` 不下发任何指令。
- 无论正常结束、`Esc`、Ctrl-C 还是异常，退出路径都会先连发零速度再 `rm_set_arm_slow_stop()`。
- `--key-linear-speed` 高于 `--max-linear-speed` 会在启动前直接报错，避免"每次按键都被钳位"
  被误读成跟随增益差。
- `--max-run-sec` 给无人值守的运行兜底。

## 已知限制

- **测量时间戳必须取自实际读数。** 采样线程与控制线程共用一个 SDK 句柄锁。早期版本在"想读"时打时间戳、
  而不是在真正读到关节时，流控期间锁等待可达数十毫秒，于是位移除以错误的间隔，静止时出现 ±50 mm/s
  的假速度。现在时间戳取控制器往返的中点，`test_the_stamp_describes_the_read_not_the_wait_for_the_lock`
  覆盖此回归。

- **角速度是 RPY 变化率，不是刚体角速度。** 大角度姿态运动下 `mea_w*` 与指令不可直接比较。
- **指令在工作坐标系，位移校验在基座系 FK。** 只有该工作坐标系是单位阵时两者重合；不确定时
  报告会打印提示，用 `--work-frame` 固定一个已知坐标系。
- **采样率是请求值。** 实际达到的速率受控制器往返和与控制线程共用 SDK 句柄的影响，报告打印实测值。
  真机实测：单次 `rm_get_joint_degree` 往返约 7 ms，20 ms 指令周期下采样约 50 Hz，比 ROS 遥测的
  10 Hz 细 5 倍。
- **Python 不是硬实时。** 报告会打印指令周期的 jitter 和最差间隔，解释结果前先看这两个数。

## 验证

```bash
cd tools/velocity_follow
PYTHONPATH=. python3 -m pytest tests -q
python3 -m velocity_follow --mock --execute --quiet --profile 'vx|step|0.02|2.0|0|1.0|smoke'
```

全部用例不碰硬件，也不需要 SDK。

相关页面：[睿尔曼三臂驱动与运动控制](./realman-driver-scaffold)、
[睿尔曼 Action 开发与测试](./realman-action-development)、
[WebSocket 浏览器控制与 URDF 影子](./realman-web-control)。
