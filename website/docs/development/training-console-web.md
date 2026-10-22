---
title: 训练控制平台（网页）
description: server5090:8780 上的训练控制平台网页：数据集与质检、清洗与训练视图、训练与评估、模型登记、推理链路启停与链路检测，写操作需要令牌。
---

# 训练控制平台（网页）

`realman_training` 包（[命令行](./training-console.md)）的网页界面，运行在 server5090 的容器 `realman_training` 里，端口 8780，风格沿用机器人 :8765 控制台。网页和命令行调用同一套步骤函数，所有步骤都作为后台任务运行，任务日志在一个浮动小窗里实时显示：拖标题栏移动，"放大/缩小"在任务列表和列表+日志两档间切换，右下角可拖动调整大小，"隐藏"或 Esc 收成右下角的"任务日志"按钮（进行中的任务数显示在按钮上）；位置、大小和是否打开记在本浏览器里。手机上它固定在底部。

## 页面

顶栏导航先是"总览"，然后按工作顺序排成流水线"数据 → 训练 → 模型 → 服务"；每一步下面有一行实时状态（最新数据集的条数和日期、训练次数或正在训练的进度、已登记模型数、推理服务是否运行），窄屏时隐藏。每页顶部是页标题、一句用途说明和主要操作（数据页"从 realman_ts 拉取"、训练页"新建训练"、服务页"刷新状态"）。

| 页 | 内容 |
|---|---|
| 总览 | 三张等高状态卡：推理链路（服务状态、模型、GPU · 端口、任务、桥接，下面是最近一次链路检测：只列未通过的项，其余计数）、GPU 0–3（2×2 排列，显存和占用者，底部列出空闲的卡）、当前训练进度；第二行最近数据集（占两列）和最新模型；最近任务（表格，点一行打开日志） |
| 服务 | 第一行三张卡：server5090 `openpi-serve`、realman_ts `policy_bridge`、桥接统计；第二行设置（模型、checkpoint、任务 prompt、GPU、端口；启动 / 关闭）和链路检测（四项结果，下面是历史） |
| 数据 | 数据集列表（最新的在前，各类型最新一份标"最新"；同名的多次拉取用所在目录作标题）；条数、帧数 / 时长、时间范围、格式 / fps、磁盘 / 编码；下面并排的来源、任务分布、特征与相机（同一张卡）；逐条质检表（含夹爪轨迹缩略图，建议剔除已预勾选）；"生成清洗版""生成训练视图"；训练视图有"用这个视图新建训练"，跳到训练页并选好数据集 |
| 训练 | 新建训练（默认折叠，点"新建训练"展开；从数据页"用这个视图新建训练"过来或还没有训练时自动展开；"训练数据集"下拉列出全部数据集：训练视图可选，原始 / 清洗版灰显，要先在数据页生成训练视图；选中后显示路径、条数、时间、任务和来源；openpi 配置候选来自 openpi 仓库 `config.py` 里含 realman 的配置名和已有 checkpoint 目录）；训练列表；选中训练的 step、loss、batch · GPU、时间、checkpoints 概要；"训练曲线"卡（loss 和 grad norm 上下排）；"评估与登记"栏（GPU、评估、登记）；各 checkpoint 按任务的开环评估和 prompt 交换结果；"评估""登记" |
| 模型 | 登记表、模型卡（每个任务的条数和 episode 范围）、`MODEL_CARD.md` 全文（折叠）、`MODELS.md`，两者都按 Markdown 渲染（表格、标题、代码；卡片里的 HTML 注释不显示，其他原始 HTML 只当文字显示，单个 `~` 不当删除线）；"部署到推理服务"跳到服务页并填好模型 |

数据集概况和质检结果缓存在各数据集目录下的 `.console/summary.json`，数据文件或质检阈值变化才重算；第一次打开数据页要等每个数据集算一遍。

## 安全规则

- 所有写操作需要令牌：服务器端 `REALMAN_TRAINING_TOKEN`（仓库外的 env 文件，见下），网页顶栏输入，只存在浏览器本页会话里；没有设置令牌时平台是只读的。
- 每个启动任务的按钮都先弹出确认框，列出会发生什么。同一类任务同一时间只能有一个；训练前检查所选 GPU，有他人进程就拒绝。
- 不提供删除；清洗版、训练视图写新目录，目标已存在就拒绝。
- 关闭或启动推理链路前检查行为树模式，`policy` 时拒绝；平台只启停桥接，不激活，机械臂运动仍由行为树和 `/policy/activate` 决定。
- 平台不调用 `./rm65`，不碰 bringup、web_control、录制容器和行为树。

## 部署（server5090）

容器定义在 `config/docker/compose.yaml` 的 `realman_training` 服务（profile `training`，机器人侧任何命令都不会构建或启动它），镜像 `config/docker/training-console.Dockerfile`，配置 `config/training/training_console.yaml` 的 `web` 段。平台要把主机路径交给主机的 docker（openpi 容器）和 ssh（`realman_local`），所以这些路径在容器里挂载到同样的绝对路径，容器以主机用户身份运行。

仓库根的 `.env` 是受版本管理的模板，令牌不能写进去。容器的令牌、路径和构建镜像源放在仓库外一个只有自己可读的 env 文件里，默认 `~/.config/realman-training/console.env`（目录 700、文件 600，可用环境变量 `RM65_SERVER_ENV` 指定别的位置）。

在 server5090 的部署工作区里，用仓库根的 `./rm65_server` 一键操作（它只管这个容器，不碰机器人的服务）：

```bash
./rm65_server init-env     # 第一次：生成 env 文件（随机令牌、TRAINING_HOME/REPO/UID/GID、docker 组、阿里云镜像源），已存在就不动
./rm65_server up --build   # 构建镜像并启动；以后只启动用 ./rm65_server up
./rm65_server status       # 容器状态和 /api/health
./rm65_server logs -f      # 跟随日志
./rm65_server restart
./rm65_server down
```

`up` 会等到 `/api/health` 有回应，并打印是否只读。env 文件的内容：

```bash
REALMAN_TRAINING_TOKEN=<随机令牌>
TRAINING_HOME=/home/<用户>
TRAINING_REPO=<部署工作区的绝对路径>
TRAINING_UID=<id -u 的值>
TRAINING_GID=<id -g 的值>
TRAINING_DOCKER_GID=<getent group docker 的 gid>
TRAINING_APT_MIRROR=mirrors.aliyun.com                    # 服务器连不上 deb.debian.org 时需要
TRAINING_PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple
# TRAINING_BIND=127.0.0.1   # 读操作（含 WebSocket 日志）不需要令牌，建议绑到受信任网段
```

令牌：`grep REALMAN_TRAINING_TOKEN ~/.config/realman-training/console.env`，填进网页右上角的“令牌”框。

浏览器打开 `http://server5090:8780`（或 `ssh -N -L 8780:127.0.0.1:8780 server5090` 后打开 `http://127.0.0.1:8780`）。重启或停止容器会中断它启动的任务：任务被标记为"中断"，`./rm65_server down`/`restart` 前会提示有几个任务在运行；训练容器本身不受影响，用以下命令接管：

```bash
./rm65_server exec python -m realman_training train <config_name> <view> --exp <exp> --gpus <gpus> --attach
```

## 开发

```bash
cd website
npm ci
python ../src/training/realman_training/test/web_fake.py --port 4180   # 真实后端 + 测试数据 + 假步骤，令牌 e2e-token
npm run dev:training                                                   # http://127.0.0.1:4176，/api 代理到 :4180
npm run build:training                                                 # 打包到 realman_training/static（提交到仓库）
npm run test:training                                                  # Playwright：桌面全流程 + 手机布局
```

后端测试：`cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test`（`test_web_server.py`、`test_job_params.py`、`test_catalog.py`、`test_summary_cache.py`、`test_gpus.py`、`test_container.py`）。接口约定见实现计划 `docs/superpowers/plans/2026-10-21-training-console-4-web-api-container.md`。
