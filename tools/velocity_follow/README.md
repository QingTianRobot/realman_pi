# velocity_follow

键盘驱动的睿尔曼机械臂笛卡尔速度跟随测试。**纯 Python，不依赖 ROS。**

回答一个问题：按住方向键的时候，机械臂到底有没有跟上发出去的速度指令。

## 依赖

- Python 3.8+，标准库
- 真机运行时需要睿尔曼 `Robotic_Arm` SDK（`pip install` 官方包）
- `PyYAML` 可选：装了就读 `config/ros/keyboard_control.yaml` 的按键布局，没装就用内置的同一份

`--mock` 模式两者都不需要，可以在任意机器上先试手感。

## 快速开始

```bash
cd tools/velocity_follow
python3 -m velocity_follow --mock --execute
```

按住键移动，松开停止，`Esc` 或 `Ctrl-C` 结束并出报告（`q` 是左臂 wx+，不是退出键）。

真机（**默认不动**，加 `--execute` 才会动）：

```bash
python3 -m velocity_follow --arm l                      # 空跑：只记录，不动机械臂
python3 -m velocity_follow --arm l --execute            # 真实运动
```

远程跑必须带 `ssh -t`，否则没有 TTY 读不到按键：

```bash
ssh -t administrator@<host> 'cd realman_pi/tools/velocity_follow && python3 -m velocity_follow --arm l --execute'
```

## 按键

默认复用 Web 控制页面的布局（`config/ros/keyboard_control.yaml`）：

| 轴 | 左臂 `l` | 右臂 `r` |
| --- | --- | --- |
| vx ±  | `w` / `s` | `i` / `k` |
| vy ±  | `a` / `d` | `j` / `l` |
| vz ±  | `r` / `f` | `u` / `o` |
| wx ±  | `q` / `e` | `y` / `p` |
| wy ±  | `z` / `c` | `n` / `m` |
| wz ±  | `x` / `v` | `b` / `g` |

终端不上报抬键，"按住"实际是系统自动重复。某个轴在最后一次重复后 `--key-hold-ms`（默认 250 ms）
停下。这本身会给指令流带来抖动，报告里的 `command publish rate` jitter 反映的就是它。

## 常用选项

```
--execute              真的动机械臂（默认只记录不动）
--arm l|m|r            选臂，同时决定默认 IP 和按键集
--ip / --port          覆盖控制器地址
--mock                 离线模拟臂，不需要 SDK 也不需要真机
--period-ms 10         指令周期，默认对齐 realman_motion.yaml 中 l/r 的周期（高跟随下限）
--sample-hz 100        位姿采样率，决定滞后/上升时间的分辨率
--follow               换成 SDK 高跟随模式（默认低跟随）
--frame work|tool      速度所在坐标系
--work-frame cell      流控前先切到指定工作坐标系
--max-linear-speed     速度上限，默认对齐 config/ros/realman_motion.yaml
--max-linear-accel     加速度限幅，决定上升时间的物理下限
--key-linear-speed     一个按键对应的速度，默认 0.02 m/s
--baseline-sec 1.0     开跑前静止采样多久，用来标定测量噪声底；0 跳过
--velocity-window-ms   速度拟合窗口，默认 100 ms
--profile 'vx|step|0.02|4.0|0|2.0|x-step'   用可复现波形代替键盘（可重复传）
```

`--profile` 的波形有 `hold`、`step`、`ramp`、`square`、`sine`、`chirp`。键盘手感不可复现，
需要对比两次配置（比如 `--follow` 开与关）时用它。

## 输出

`logs/velocity-follow/<arm>_<name>.csv`：每个指令周期一行，列含 `cmd_*`（键盘/波形要的）、
`acc_*`（钳位后）、`lim_*`（加速度限幅后真正下发的）、`mea_*`（位姿差分回读）。
同名 `.json` 是机器可读摘要。退出码：`0` 稳态和按键响应都过，`1` 任一不过，`2` 没有可分析的数据。

离线重新分析（同样不需要 ROS）：

```bash
python3 -c 'from velocity_follow.report import main; raise SystemExit(main())' run.csv --control-period-ms 10
```

## 指标怎么读

| 指标 | 回答什么 |
| --- | --- |
| `steady-state gain` / `amplitude gain` | 速度对不对。单边指令看前者，方波/正弦看后者 |
| `lag vs command` | 慢多少 |
| `lag vs limited cmd` | 扣掉加速度斜坡之后还慢多少。两者差得大说明瓶颈是限幅不是控制器 |
| `rise time to 90%` | 多快到位，相对**实际达到**的速度，不含增益缺口 |
| `uncommanded motion` | 没被指令的轴在动多少，即操作者感知的"跑偏" |
| `displacement check` | 整段走的距离对不对，**不受采样率影响**，最可靠的一条 |
| `measurement noise` | 静止时的测量噪声底，用来判断上面那条"跑偏"是真的还是噪声 |
| `press / release` | 按下多久到速、松开滑行多远——键盘操作最直接的手感 |

## 按键 / 松键响应

对键盘操作，"跟不跟得上"主要看按下和松开两个瞬间。报告对每次按键单独给出：按下到开始动、
按下到 90% 速度（附加速度斜坡本身需要的时间）、按住期间落后多少、松开到停稳、松开后滑行多远。

整段位移校验会掩盖这些：起步亏的距离会被松开后的滑行补回来。

真机实测（左臂、低跟随、20 mm/s 阶跃 4 秒）：稳态增益 0.995，但**按下 1012 ms 才到速**
（斜坡只需 160 ms），**松开后还滑 11.9 mm、1.8 秒才停**。速度准、方向准，两头慢。

## 测量噪声底

速度用 `--velocity-window-ms`（默认 100 ms）窗口内的最小二乘拟合，而不是相邻两帧差分——
两帧差分在真机上会把编码器量化放大成约 1 mm/s 的假速度，窗口拟合后静止噪声约 0.11 mm/s。
开跑前静止采样 `--baseline-sec` 标定噪声，串轴漂移超过 3σ 才判跑偏。

## 已知限制

- **角速度是 RPY 变化率，不是刚体角速度。** 大姿态运动下 `mea_w*` 不能直接和指令比。
- **指令在工作坐标系，位移校验在基座系。** 只有工作坐标系是单位阵时两者重合；用 `--work-frame`
  固定一个已知的坐标系，报告也会在不确定时打印提示。
- **采样率受控制器响应限制。** `--sample-hz 100` 是请求值，报告里打印的是实际达到的速率。
- **Python 不是硬实时。** 报告会打印指令周期的实际 jitter 和最差间隔；解释结果时先看这两个数。

## 测试

```bash
cd tools/velocity_follow && PYTHONPATH=. python3 -m pytest tests -q
```

全部用例不碰硬件，也不需要 SDK。
