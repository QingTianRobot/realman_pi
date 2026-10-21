---
title: 训练控制平台（网页）
description: server5090:8780 上的训练控制平台网页：数据集与质检、清洗与训练视图、训练与评估、模型登记、推理链路启停与链路检测，写操作需要令牌。
---

# 训练控制平台（网页）

`realman_training` 包（[命令行](./training-console.md)）的网页界面，运行在 server5090 的容器 `realman_training` 里，端口 8780，风格沿用机器人 :8765 控制台。网页和命令行调用同一套步骤函数，所有步骤都作为后台任务运行，任务日志在顶栏"任务"打开的底部抽屉里实时显示。

## 页面

| 页 | 内容 |
|---|---|
| 总览 | 推理服务、数据链路、GPU 0–3（显存和占用者）、当前训练进度四张状态卡；最近数据集、最新模型、最近任务 |
| 服务 | server5090 `openpi-serve` 和 realman_ts `policy_bridge` 两端状态；设置（模型、checkpoint、任务 prompt、GPU、端口）；启动 / 关闭；链路检测四项结果和历史；桥接统计 |
| 数据 | 数据集列表（最新的在前，各类型最新一份标"最新"；同名的多次拉取用所在目录作标题）；条数、帧数 / 时长、时间范围、格式 / fps、磁盘 / 编码；任务分布；特征与相机；逐条质检表（含夹爪轨迹缩略图，建议剔除已预勾选）；"生成清洗版""生成训练视图"；训练视图有"用这个视图新建训练"，跳到训练页并选好数据集 |
| 训练 | 新建训练（"训练数据集"下拉列出全部数据集：训练视图可选，原始 / 清洗版灰显，要先在数据页生成训练视图；选中后显示路径、条数、时间、任务和来源；openpi 配置候选来自 openpi 仓库 `config.py` 里含 realman 的配置名和已有 checkpoint 目录）；训练列表；loss / grad norm 曲线；GPU；各 checkpoint 按任务的开环评估和 prompt 交换结果；"评估""登记" |
| 模型 | 登记表、模型卡、`MODELS.md`；"部署到推理服务"跳到服务页并填好模型 |

数据集概况和质检结果缓存在各数据集目录下的 `.console/summary.json`，数据文件或质检阈值变化才重算；第一次打开数据页要等每个数据集算一遍。

## 安全规则

- 所有写操作需要令牌：服务器端 `REALMAN_TRAINING_TOKEN`（仓库外的 env 文件，见下），网页顶栏输入，只存在浏览器本页会话里；没有设置令牌时平台是只读的。
- 每个启动任务的按钮都先弹出确认框，列出会发生什么。同一类任务同一时间只能有一个；训练前检查所选 GPU，有他人进程就拒绝。
- 不提供删除；清洗版、训练视图写新目录，目标已存在就拒绝。
- 关闭或启动推理链路前检查行为树模式，`policy` 时拒绝；平台只启停桥接，不激活，机械臂运动仍由行为树和 `/policy/activate` 决定。
- 平台不调用 `./rm65`，不碰 bringup、web_control、录制容器和行为树。

## 部署（server5090）

容器定义在 `config/docker/compose.yaml` 的 `realman_training` 服务（profile `training`，机器人侧任何命令都不会构建或启动它），镜像 `config/docker/training-console.Dockerfile`，配置 `config/training/training_console.yaml` 的 `web` 段。平台要把主机路径交给主机的 docker（openpi 容器）和 ssh（`realman_local`），所以这些路径在容器里挂载到同样的绝对路径，容器以主机用户身份运行。

仓库根的 `.env` 是受版本管理的模板，令牌不能写进去。在仓库外建一个只有自己可读的 env 文件，例如 `~/.config/realman-training/console.env`（目录 700、文件 600）：

```bash
REALMAN_TRAINING_TOKEN=<随机令牌，例如 python3 -c "import secrets; print(secrets.token_urlsafe(24))">
TRAINING_HOME=/home/<用户>
TRAINING_REPO=<部署工作区的绝对路径>
TRAINING_DOCKER_GID=<getent group docker 的 gid>
TRAINING_UID=<id -u 的值>
TRAINING_GID=<id -g 的值>
# 可选：绑定地址（默认 0.0.0.0；读操作含 WebSocket 日志不需要令牌，建议绑到受信任网段）
# TRAINING_BIND=127.0.0.1
# 可选：PyPI 镜像（中国大陆加速）
# TRAINING_PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple
# 可选：APT 镜像
# TRAINING_APT_MIRROR=mirrors.aliyun.com
```

然后在部署工作区里（`E=~/.config/realman-training/console.env`）：

```bash
docker compose -p realman-training --env-file .env --env-file "$E" --profile training build realman_training
docker compose -p realman-training --env-file .env --env-file "$E" --profile training up -d realman_training
docker compose -p realman-training --env-file .env --env-file "$E" --profile training logs --tail=50 realman_training
```

浏览器打开 `http://server5090:8780`（或 `ssh -N -L 8780:127.0.0.1:8780 server5090` 后打开 `http://127.0.0.1:8780`）。重启容器会中断它启动的任务：任务被标记为"中断"；训练容器本身不受影响，用以下命令接管：

```bash
docker compose -p realman-training --env-file .env --env-file "$E" --profile training exec realman_training python -m realman_training train <config_name> <view> --exp <exp> --gpus <gpus> --attach
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
