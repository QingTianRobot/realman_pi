# 训练控制平台（数据 → 训练 → 评估 → 部署，集中在一个网页里）

日期：2026-10-20。状态：设计已确认，待写实现计划。

## 问题

2026-10-13 到 10-19 训练并部署了两个 pi0.5 模型（`a_action_only_b16_4gpu`、`m_multitask_b16_2gpu`），每一步都是手工完成：在 server5090 上 `ssh` 回 realman_ts 拉数据、临时写脚本做质检、手动挑坏条目、调 `drop_episodes.py` 和 `make_realman_view.py`、改 openpi `config.py`、写启动脚本、在容器里算 norm stats 和评估、手写模型卡、手动改 compose 环境变量切换推理服务、手动测链路。问题：

- 步骤和判断只存在于会话记录里，下一次要重新推一遍；质检规则、阈值、坑（推理首包 JIT 26 s、Pika 定位器打满 Wi-Fi、realman_ts 拉不到 GitHub）都要靠记忆。
- 关键代码没有提交：openpi 的多任务 `make_realman_view.py`、`REALMAN_MULTITASK_*` 和训练配置只在 server5090 的工作区里。
- 看不到全局：有哪些数据集、各有多少条/什么任务/什么时间、哪个模型在服务、链路是否正常，只能临时查。

## 目标与非目标

目标：

1. 把第 2–9 步（拉取、检查、清洗、训练视图、norm、训练、评估、登记）做成可重复执行的 Python 包和命令行 `realman-train`，网页和命令行调用同一套函数。
2. 一个在 server5090 上运行的网页控制平台，风格沿用 :8765（`realman_web_control` 的 `theme.css`）：展示数据集信息（条数、帧数/时长、文件时间、格式、任务分布、特征、相机、编码、磁盘、质检），一键触发各步骤（需确认和令牌），展示训练进度、评估和模型登记。
3. 推理服务两端的启停：server5090 的 `openpi-serve` 和 realman_ts 的 `policy_bridge` 容器，带必要设置（端口、GPU、模型、prompt）；启动后自动预热并做数据链路检测。
4. openpi 侧改动单独提交到 openpi 仓库。

非目标：

- 不碰机器人生产栈：bringup 驱动、web_control、recording 容器、行为树都不由本平台启停（仍用 `./rm65`、`./scripts/bt.sh`）。
- 不从网页让机械臂运动：平台只启动桥接（不激活），运动仍由行为树和 `/policy/activate` 决定。
- 不删除数据：清洗只会生成新目录。
- 不做多用户权限、不做数据标注/视频编辑。

## 已定的选择（2026-10-20 与用户确认）

| 问题 | 选择 |
|---|---|
| 平台能做什么 | 查看 + 触发步骤；部署通过"服务"页启停推理服务 |
| 运行位置 | server5090，独立容器，端口 8780 |
| 坏条目处理 | 规则自动标注并预勾选，网页上确认（可增减）后才生成清洗版 |
| 技术方案 | aiohttp 后端 + Vite/TypeScript 前端，沿用 :8765 风格（方案 A） |
| 可启停的容器 | 两端：server5090 `openpi-serve` + realman_ts `policy_bridge`；不碰 bringup |
| 页面结构 | 分页式 5 页：总览 / 服务 / 数据（数据集+清洗）/ 训练（训练+评估）/ 模型；任务日志为全局底部抽屉 |

## 架构

```
浏览器 ──HTTP/WS──▶ realman_training 容器 (server5090:8780)
                       ├─ web_server.py  (aiohttp：读接口 + 触发接口 + 任务日志 WebSocket)
                       ├─ jobs.py        (后台任务：status.json + log.txt，重启可恢复)
                       ├─ datasets.py / quality.py   (只读 LeRobot v3，pyarrow，无 ROS)
                       ├─ steps/*.py     (pull, clean, view, norm, train, eval, register)
                       ├─ serving.py / linkcheck.py
                       │
                       ├─ docker.sock ──▶ openpi 训练/评估容器、openpi-serve
                       └─ ssh realman_local ──▶ realman_ts：录制目录、policy_bridge 容器、链路检测
```

代码位置：`src/training/realman_training/`（Python 包，含 `web/` 前端和 `test/`），命令行入口 `realman-train`。配置：`config/training/training_console.yaml`（遵守"配置都在根 `config/` 下"的约定）。镜像：`config/docker/` 下新增 `training-console.Dockerfile` 和 compose 服务 `realman_training`，只在 server5090 上运行。

### 单元

每个单元只做一件事，接口清楚、可单独测试。

| 单元 | 职责 | 依赖 |
|---|---|---|
| `datasets.py` | 读一个 LeRobot v3 目录，生成概况：条数、帧数、fps、时长、任务及条数、特征名与形状、相机、编码、磁盘占用、文件时间范围（最早/最新 episode 文件）、来源（`contract.json` / 清洗清单）、类型（原始 / 清洗版 / 训练视图） | pyarrow |
| `quality.py` | 逐条质检，输出 `{episode, task, verdict: ok/suggest_drop/warn, reasons[]}` | `datasets.py`、配置阈值 |
| `steps/pull.py` | 从 realman_ts 拉录制目录到新目录 `raw_realman_ts_<日期时间>` | ssh、tar |
| `steps/clean.py` | 按确认的剔除列表生成清洗版（`drop_episodes.py` 逻辑移入本包，视频硬链接，记录剔除清单与原因） | `datasets.py` |
| `steps/view.py` | 调 openpi 容器里的 `make_realman_view.py`（`--task-prompt`），生成后校验每条夹爪标签 | docker |
| `steps/norm.py`、`steps/train.py`、`steps/eval.py` | 在 openpi 容器里算 norm、训练、按任务开环评估 + prompt 交换测试 | docker |
| `steps/register.py` | 写 `MODEL_CARD.md`、`model_card.json`，更新 `checkpoints/MODELS.md` | 文件系统 |
| `jobs.py` | 后台任务：每个任务一个目录（`status.json`、`log.txt`、`params.json`），同类任务互斥，服务重启后重新接管仍在运行的进程、把已死的标记为中断 | 文件系统 |
| `serving.py` | 启停 `openpi-serve` 和远端 `policy_bridge`，预热，状态 | docker、ssh |
| `linkcheck.py` | 4 项数据链路检测 | ssh、websocket |
| `web_server.py` | aiohttp 路由；触发接口校验令牌 | 以上全部 |
| `web/` | Vite + TS 前端，5 页 + 日志抽屉，复制 :8765 的 `theme.css` | — |

`steps/*` 每个模块暴露一个函数 `run(params, log) -> result`，命令行和 `jobs.py` 都调用它；网页只通过 `jobs.py` 启动步骤。

## 数据流（一轮完整流程）

1. **拉取**：server5090 `ssh realman_local "docker exec <recording 容器> tar -C <录制根> -cf - <数据集>" | tar -xf -` 到新目录；目标已存在就拒绝（避免覆盖已清洗目录，10-13 的 README 警告）。拉取进度 = 已收字节 / 源目录大小。
2. **检查**：`datasets.py` + `quality.py` 生成概况和逐条结论，缓存到数据集目录下 `.console/summary.json`，数据文件的修改时间变化才重算。
3. **清洗**：网页上确认勾选后生成 `<名称>_clean_<时间>`；剔除清单（含原因、旧→新编号映射）写进新目录的 `clean_manifest.json`。
4. **训练视图**：选清洗版、手臂、每个任务的 prompt（默认取已有映射），生成 `<名称>_view`，再自动检查每条的夹爪标签（place：开→闭→开；pick：开→闭），有问题的条目列出来并标为失败。
5. **训练**：选视图、openpi 配置名、GPU、batch、步数、实验名。训练前自动算 norm（不存在时）。进度和 loss 读 `metrics.csv` 与训练日志。
6. **评估与登记**：对选定 checkpoint 按任务评估（留出集取配置的 `exclude_episode_indices`），做 prompt 交换测试，写模型卡和登记表。
7. **部署**：模型页"部署" → 跳到服务页并填入模型 → 启动 → 预热 → 链路检测。

## 质检规则

来自 10-13、10-16 两次人工清洗，阈值在 `training_console.yaml` 的 `quality` 段。

| 规则 | 判断 | 结论 |
|---|---|---|
| 开头已闭合 | 前 1 s 夹爪读数高于闭合阈值 | 建议剔除 |
| 重抓 | 闭合事件 ≥ 2 | 建议剔除 |
| 未夹紧 | 最大读数低于闭合阈值（从未完全闭合） | 建议剔除 |
| 夹空 | 结尾/松手前的闭合平台 ≥ `empty_position_min`（7800）且无力矩 | 建议剔除 |
| place 未松手 | 任务为 pick_and_place 但结尾仍闭合 | 建议剔除 |
| 单帧跳变 | 闭合区间被 ≤ 2 帧的张开打断 | 建议剔除 |
| 起始位姿偏差 | 首帧关节与训练起始位姿差 > 2° | 警告（不预勾选） |
| 起始微闭 | 首帧读数在张开阈值和闭合阈值之间 | 警告 |

验收：对 10-16 的原始数据，规则建议剔除的集合必须与当时人工剔除的 13 条一致（13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216）。

## 服务控制与链路检测

**启动**（需要令牌）：

1. 用所选模型（来自登记表）、GPU、端口启动 `openpi-serve`（沿用 `compose.serve.yaml` 和 `SERVE_CONFIG`/`SERVE_CHECKPOINT`/`SERVE_GPU`/`OPENPI_POLICY_PORT`），GPU 被他人占用（显存超过阈值）则拒绝。
2. 等端口监听，发 2 次预热推理（真实尺寸的假输入），记录每次耗时。
3. 在 realman_ts 启动 `policy_bridge`（`./rm65 up policy` 只会重建整个栈，所以直接 `docker compose up -d --no-deps policy_bridge`），环境中的服务地址和端口与本次设置一致；桥接以非激活状态启动。
4. 自动运行链路检测。

**关闭**：先停桥接，再停 `openpi-serve`。如果行为树当前模式是 `policy`，拒绝并说明。

**链路检测**（每项通过/失败 + 数值 + 阈值）：

1. Wi-Fi 干扰：机器人侧 ROS 图里有无 `pika_*` 节点；Wi-Fi 接口 5 s 流量（阈值来自 10-14：< 600 KB/s）。
2. 带宽与延迟：realman_ts → server5090 批量吞吐（≥ 2 MB/s）、ping。
3. 端到端推理：在 realman_ts 的桥接镜像里用 openpi 客户端发真实尺寸请求（两张 224×224 + 7 维状态 + prompt），往返 < 200 ms。
4. 桥接健康：`/policy/stats` 的 `prompt` 等于所选任务的 prompt、`paused=0`、推理错误计数。

**设置**：默认值在 `training_console.yaml` 的 `serving` 段（端口 18000、GPU、默认模型、阈值）；网页上改的值存到平台状态目录，不改仓库配置。prompt 只能从模型的 `contract.json` 里选。

## 页面

| 页 | 内容 |
|---|---|
| 总览 | 4 张状态卡（推理服务、链路、GPU 0–3 显存/占用者、当前训练进度）+ 最近数据集 + 最新模型 + 最近任务 |
| 服务 | 两端状态、设置表单、启动/关闭、链路检测 4 项结果与历史、桥接统计 |
| 数据 | 左：数据集列表（类型、条数、帧数、更新时间）；右：概况数字（条数、帧数/时长、时间范围、格式/fps、磁盘/编码）、任务分布、特征与相机、逐条质检表（含夹爪轨迹缩略，建议剔除预勾选）、"生成清洗版""生成训练视图" |
| 训练 | 新建训练表单 + 训练列表；选中训练：loss/grad-norm 曲线、GPU、各 checkpoint 按任务评估、prompt 交换结果、"评估""登记" |
| 模型 | 登记表（方法、时间、数据集、指标、状态）、模型卡详情、"部署到推理服务" |

顶栏：品牌、页签、推理服务和桥接状态胶囊、任务按钮（打开日志抽屉）、令牌输入。窄屏不横向滚动。

## 安全规则（后端强制）

- 所有写操作需要令牌（`REALMAN_TRAINING_TOKEN`，空 = 只读），沿用 :8765 约定；令牌只在 `.env` 里。
- 同一时间只允许一个训练任务；启动训练前检查所选 GPU 的显存，有他人进程则拒绝。
- 不提供删除数据；清洗、视图都写新目录，目标已存在就拒绝。
- 关闭推理服务前检查机器人侧行为树模式，`policy` 时拒绝。
- 不调用 `./rm65 up/down/build`，不碰 bringup/web/recording 容器和行为树。
- 配置、文档、日志里不写私有 IP、令牌（主机名用 ssh 别名，地址在 `.env`）。

## 错误处理

- 每个任务有状态、日志、退出码；失败时网页显示失败的步骤和日志末尾。服务重启后：进程仍在的任务重新接管，已死的标记为"中断"。
- realman_ts 不可达（ssh 超时）时，拉取和链路检测失败并给出原因，其余页面照常工作。
- openpi 容器启动失败（例如过期的 CDI 规格）时，显示 compose 的错误输出；容器一律用 `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`，不用 `gpus:`。

## 测试

- `datasets.py`、`quality.py`：pytest，用生成的小型 LeRobot v3 数据集（每种坏条目各一条）；另有一个可选测试读取 server5090 上 10-16 的真实原始数据，核对建议剔除集合等于人工结果。
- `steps/clean.py`：生成后条数、帧数、编号连续、视频硬链接、清单内容。
- `jobs.py`、`web_server.py`：pytest，步骤用假实现；覆盖令牌、互斥、重启接管、失败显示。
- `serving.py`、`linkcheck.py`：docker/ssh 调用打桩，检查命令顺序、拒绝条件（GPU 被占、行为树在 policy 模式）、阈值判断。
- 前端：Playwright，仿照 `config/web-control/` 的 e2e 配置，后端用固定数据的假服务。
- ruff 同 CI。

## openpi 仓库改动（单独 PR）

server5090 `~/organization/openpi` 未提交的改动：`scripts/make_realman_view.py` 的 `--task-prompt`（一个参数多个值）及测试、`config.py` 的 `REALMAN_MULTITASK_HOLDOUT_EPISODES` 与 `pi05_realman_multitask_action_only`、类型从 `Sequence` 改为 `tuple`、`lerobot_v3_dataset_test.py` 的补充测试。提交到 QingTianRobot/openpi 的新分支并开 PR；本平台通过训练容器调用这些脚本和配置，不复制代码。另外，新训练配置今后由平台生成参数（视图路径、留出集、实验名）传给 openpi，不再每次改 `config.py`；需要 openpi 支持从命令行覆盖 `data.repo_id`、`exclude_episode_indices`，实现计划里确认可行性，不可行则保留"每个视图一个配置"的做法。

## 交付顺序

1. openpi 改动提交 + PR。
2. `datasets.py`、`quality.py` + 命令行 `realman-train inspect`（含 10-16 数据核对）。
3. `jobs.py` + `steps/*` + 命令行其余子命令。
4. `serving.py`、`linkcheck.py`。
5. `web_server.py` + 前端 5 页。
6. 容器、compose、`training_console.yaml`、文档页（`website/docs/development/` 新页 + 路由测试）。
7. 在 server5090 上部署并用真实数据走一遍。
