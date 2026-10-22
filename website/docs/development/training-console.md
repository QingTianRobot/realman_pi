---
title: 训练控制平台（命令行）
description: realman-train 命令行：数据检查、拉取、清洗、训练视图、norm、训练、评估、登记，推理服务启停与链路检测，全部作为后台任务运行。
---

# 训练控制平台（命令行）

训练流程（拉取 → 检查 → 清洗 → 训练视图 → norm → 训练 → 评估 → 登记 → 部署）已做成 `realman_training` 包，命令行 `realman-train` 覆盖全流程；设计见 [`2026-10-20-training-console-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-20-training-console-design.md)。

网页界面（server5090:8780）见 [训练控制平台（网页）](./training-console-web.md)；一次真实的从已有模型继续训练的完整命令记录见 [命令行训练全流程](./training-cli-walkthrough.md)。

## 用法

`realman_training` 包从源码树使用，默认配置路径相对于仓库根目录解析；运行前在 `src/training/realman_training` 目录下设置 `PYTHONPATH=.`，或在仓库根目录执行 `pip install -e src/training/realman_training`。

在 server5090 上（数据在 `~/data/realman`）：

```bash
cd src/training/realman_training && PYTHONPATH=. python -m realman_training list
PYTHONPATH=. python -m realman_training inspect ~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm
PYTHONPATH=. python -m realman_training inspect <数据集目录> --json
```

`list` 列出 `data_root` 下所有 LeRobot v3 数据集及类型：`raw`（从 realman_ts 拉来的原始录制）、`clean`（剔除过坏条目，旁边有 `<目录>.clean_manifest.json`）、`view`（训练视图，带 `contract.json` 和 prompt）。

`inspect` 显示：条数、帧数、时长、fps、格式版本、机器人类型、数据文件的最早/最新时间、磁盘占用、每个任务的条数和帧数、相机及编码、来源和已剔除条数、训练视图的 prompt，以及逐条质检结果和建议剔除列表。训练视图没有原始夹爪读数，质检要看它的清洗版来源。

## 流水线

每一步都是 `realman_training.steps` 里的一个函数，命令行把它作为后台任务启动并在前台跟随日志（Ctrl-C 取消任务）；加 `--background` 只返回任务 id。在 server5090 上：

```bash
cd src/training/realman_training
PYTHONPATH=. python -m realman_training pull                                   # realman_ts → ~/data/realman/raw_realman_ts_<时间>/
PYTHONPATH=. python -m realman_training clean <原始目录> --suggested           # 按质检建议剔除 → <名称>_clean_<时间>
PYTHONPATH=. python -m realman_training clean <原始目录> --drop 13,28 --reasons reasons.json
PYTHONPATH=. python -m realman_training view <清洗版目录>                      # → <清洗版>_view，并检查夹爪标签
PYTHONPATH=. python -m realman_training norm <openpi 配置名> <视图目录>
PYTHONPATH=. python -m realman_training train <openpi 配置名> <视图目录> --exp <实验名> --gpus 1,2 --batch 16 --dry-run
PYTHONPATH=. python -m realman_training train <openpi 配置名> <视图目录> --exp <实验名> --gpus 2 --share-gpus \
  --init-from <旧配置>/<旧实验名>/<步数> --dry-run                                # 从已有模型继续训练
PYTHONPATH=. python -m realman_training eval <openpi 配置名> <实验名> --view <视图目录> --gpu 2
PYTHONPATH=. python -m realman_training register <openpi 配置名> <实验名>
```

| 步骤 | 做什么 | 写到哪里 |
|---|---|---|
| `pull` | 经 `ssh realman_local` 在录制容器里 `tar`：先在录制锁（`.<数据集>.lock`，`flock -s`）下拷 `meta`、`data`，再拷视频；拷完校验每条的视频都在 | 新目录 `raw_realman_ts_<时间>/<数据集>/` + `pull.json`（来源、条数、字节数）；目标已存在就拒绝 |
| `clean` | 剔除条目、重新编号、视频硬链接、按 LeRobot 方法重算 `stats.json`；没写原因的条目用质检结论当原因 | 新目录 + `<目录>.clean_manifest.json`（剔除清单、原因、旧→新编号） |
| `view` | 在 `openpi:dev` 镜像里跑 `make_realman_view.py --task-prompt`（prompt 取配置 `prompts` 段，可用 `--task-prompt task=prompt` 覆盖），再检查夹爪目标：`pick_and_place` 必须 开→闭→开，`pick_only` 开→闭 | `<清洗版>_view/` + `label_check.json`；有问题的条目让任务失败并列出 |
| `norm` | `opic-norm`（norm stats 已存在就跳过，`--force` 重算）；容器不分配 GPU，JAX 用 `JAX_PLATFORMS=cpu` 在 CPU 上算 | `openpi-docker-data/assets/<配置>/<asset_id>/norm_stats.json`（`asset_id` 取自配置，通常与 `repo_id` 相同） |
| `train` | 检查 GPU（被别人占用超过 2000 MiB 就拒绝）、缺 norm 就先算、在独立容器 `openpi-console-train-<实验名>` 里训练，多卡自动加 NCCL/XLA 环境；跟随 `Step N:` 日志显示进度；取消任务会停容器；`--attach` 重新跟随仍在跑的容器；训练结束后从整个（追加模式）日志文件解析 `metrics.csv`，所以重跑时历史步数也保留在 csv 里。`--init-from <配置>/<实验名>/<步数>` 用之前某个 run 的 checkpoint（`checkpoints/.../<步数>/params`，宿主机上必须存在）代替 `openpi.weights`（pi05_base）作为初始权重；`--share-gpus` 不按"已占用 > 2000 MiB"拒绝，改为检查每张卡剩余显存 ≥ `openpi.train_need_mib`（18000 MiB，action-only 训练峰值约 17.3 GiB），用于和 openpi-serve 共用一张卡。必须加 `--yes`（先用 `--dry-run` 看命令） | `openpi-docker-data/wandb/<实验名>.log`（追加，重跑保留历史日志）、`checkpoints/<配置>/<实验名>/metrics.csv`（从整个日志解析）、`console_train.json` |
| `eval` | 把配置的留出集按任务拆开，逐个 checkpoint 跑 `eval_open_loop.py`；多任务时再做 prompt 交换测试；共用同一个 prompt 的任务（如 `pick_only` 和 `pick_only_light-weak_1021`）按视图来源（清洗版）里的任务名分开统计；`--share-gpus` 和训练一样改为检查剩余显存 ≥ `openpi.eval_need_mib`（12000 MiB）；对同一 checkpoint/任务重跑会替换那项结果文件，`summary.json` 以合并方式更新（其他 checkpoint 的结果保留） | `checkpoints/<配置>/<实验名>/eval/`（每项结果 + `summary.json`） |
| `register` | 写模型卡和登记表一行（同一 run 再登记会替换那一行）；手写的 `MODEL_CARD.md` 或 `model_card.json`（无 `generated_by` 字段）要 `--force` 才替换，并留备份 | `MODEL_CARD.md`、`model_card.json`、`checkpoints/MODELS.md` |

openpi 的 norm 和评估脚本只接受配置名，所以仍然是"每个训练视图一个 openpi 配置"：命令里给配置名和视图目录，视图挂载到容器的 `/datasets/lerobot_realman`，配置的 `repo_id`、留出集、batch、步数在容器里读出来；配置的留出集不在视图里时拒绝（视图选错了）。

`config_name` 和 `exp` 只能用字母、数字、`_`、`-`、`.`，且必须以字母或数字开头；其他名称会被拒绝。

## 后台任务

任务目录在 `<data_root>/_console/jobs/<任务 id>/`（`params.json`、`status.json`、`log.txt`）。同一种任务同一时间只能有一个（每种任务一把文件锁，任务进程活多久就持有多久，进程崩了锁自动释放）。命令行或网页重启后：任务进程还活着的继续显示为运行中，已经死掉的标记为"中断"。

```bash
PYTHONPATH=. python -m realman_training jobs            # 最近的任务
PYTHONPATH=. python -m realman_training job <id> --log  # 某个任务的日志
PYTHONPATH=. python -m realman_training cancel <id>
```

如果同一种任务已在运行，再次启动会报 `JobConflict`；锁由刚结束的任务持有时，最多等 5 秒再报错。`cancel` 对正在启动的任务同样有效；取消 `train` 任务会停止对应容器 `openpi-console-train-<实验名>`。

## 推理服务与链路检测

推理链路两端：server5090 上的 `openpi-serve`（compose 项目 `openpi-serve`，`~/organization/openpi/compose.yaml` + `~/data/realman/compose.serve.yaml`）和 realman_ts 上的 `policy_bridge` 容器。在 server5090 上：

```bash
PYTHONPATH=. python -m realman_training serve status
PYTHONPATH=. python -m realman_training serve start --dry-run                  # 只做检查、打印命令
PYTHONPATH=. python -m realman_training serve start --task pick_only --yes     # 默认模型、GPU 2、端口 18000
PYTHONPATH=. python -m realman_training serve stop --yes
PYTHONPATH=. python -m realman_training linkcheck [--only pika,link,inference,bridge] [--json]
```

`serve start`（后台任务，种类 `serve`，与 `stop` 互斥）：

1. 检查：行为树的 `requested/selected/active_mode` 是 `policy` 就拒绝；`openpi-serve` 已在运行、端口已被占用、GPU 显存超过 `openpi.gpu_busy_mib`（2000 MiB）、端口与机器人 `config/ros/policy_bridge.yaml` 的 `network.server_port` 不同（桥接的端口只能在那里改）都拒绝；模型必须有任务 prompt（`model_card.json` 的 `tasks`，否则训练视图的 `contract.json`），`--task` 只能选模型训练过的任务。
2. 用 `SERVE_CONFIG`/`SERVE_CHECKPOINT`/`SERVE_GPU`/`OPENPI_POLICY_PORT` 执行 `docker compose up -d`（`runtime: nvidia`，不用 `gpus:`），等端口监听（加载 checkpoint，最多 `start_timeout_sec`）。
3. 在服务容器里发 2 次真实尺寸的推理预热：重启后第一次推理要 JIT 编译约 26 s，会让桥接的 1.5 s 请求超时、连续 5 次失败后暂停。
4. 在 realman_ts 的 `~/realman_pi` 执行 `POLICY_WS_HOST=<server5090 地址> docker compose up -d --no-deps --no-build policy_bridge`（地址取 realman_ts 看到的 `$SSH_CLIENT`，不写进配置）；不调用 `./rm65`，不碰 bringup、web、录制容器和行为树。
5. 等 `/policy/stats` 出现，在 `/policy/prompt` 发所选任务的 prompt 并等桥接确认；桥接必须是非激活状态（`allow_publish=0`）。机械臂运动仍然只由行为树和 `/policy/activate` 决定。
6. 运行链路检测；检测失败不让启动失败，但会在日志里标出来。

启动记录在 `<data_root>/_console/serving.json`（模型、checkpoint、GPU、端口、任务、prompt、预热耗时）。`serve stop`（需要 realman_ts 可达以检查行为树模式）：同样在 `policy` 模式下拒绝，先停桥接（`docker compose stop policy_bridge`），再停并删除 `openpi-serve-openpi-1`。`serve status`：两端容器、镜像、启动时间、GPU 显存、模型、桥接 prompt/paused/allow_publish、行为树模式；realman_ts 不可达时只报告原因。

| 检测项 | 判断 | 阈值（`linkcheck` 段） |
|---|---|---|
| `pika_nodes` | 机器人 ROS 图里的 `pika_*` 节点：Pika 定位器在 Wi-Fi 上发大量小 DDS 包（2026-10-14 实测 ~2.6 MB/s、>18000 包/s），批量 TCP 会掉到 0.1 MB/s 而 ping 正常 | 0 个 |
| `wifi_load` | realman_ts 的 Wi-Fi 接口 5 s 收发字节 | < 600 KB/s |
| `bulk_throughput` | realman_ts → server5090 经 ssh 传 16 MiB，从收到第一块开始计时 | ≥ 2 MB/s |
| `ping` | 1400 字节的 ping（小包在链路塌掉时也能通） | 平均 ≤ 50 ms，丢包 ≤ 5 % |
| `inference_round_trip` | 在桥接容器里向它实际使用的地址和端口发 1 + 5 次请求（两张 224×224 + 7 维状态 + prompt），第一次不计 | 中位数 < 200 ms |
| `bridge_prompt` / `bridge_paused` / `bridge_errors` | `/policy/stats`：prompt 等于所服务任务的 prompt（没有启动记录时等于配置里任一 prompt）、`paused=0`、没有 error/fail 计数 | 见左 |

每次检测写一份 `<data_root>/_console/linkcheck/<时间>.json`；某项无法执行（如 realman_ts 不可达）时该项判失败并给出原因，其余项照常执行。

## 安全规则

- 拉取、清洗、视图都写新目录，目标已存在就拒绝；只会删除本任务自己没写完的 `<目标>.partial`。
- 只读录制容器（`docker exec … tar/du/cat`），不碰 bringup、web、录制容器的启停和行为树。
- 训练和评估拒绝被别人占用的 GPU；容器用 `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`（服务器上的 CDI 规格过期，`gpus:` 会失败）。
- 推理服务：启停都在行为树为 `policy` 模式时拒绝；机器人侧只执行 `docker compose up -d --no-deps --no-build policy_bridge`、`docker compose stop policy_bridge` 和发布 prompt，从不调用 `./rm65`、不改行为树模式、不调用 `/policy/activate`。
- 配置在 `config/training/training_console.yaml`（`remote`、`openpi`、`serving`、`linkcheck`、`prompts` 段）和 `config/training/openpi-console.compose.yaml`；主机只写 ssh 别名。

## 质检规则

阈值在 `config/training/training_console.yaml` 的 `quality` 段，数值来自 2026-10-13 和 10-16 两次人工清洗。"剔除"只是建议，平台上由人确认后才会生成清洗版。

| 代码 | 级别 | 判断 |
|---|---|---|
| `start_closed` | 剔除 | 开头 1 s 内夹爪处于闭合 |
| `never_closed` | 剔除 | 读数从未超过闭合阈值 4275 |
| `regrasp` | 剔除 | 闭合事件 ≥ 2 |
| `glitch` | 剔除 | 闭合中间夹着 ≤ 2 帧的张开读数 |
| `closed_on_nothing` | 剔除 | 最后一段闭合的平台（末 2 s 中位数）≥ 8300：两爪合拢，没夹住东西 |
| `no_release` | 剔除 | `pick_and_place` 结尾仍闭合（没在蓝箱上方松开） |
| `empty` | 剔除 | 这一条没有帧 |
| `start_partial` | 警告 | 首帧读数高于 300 但未闭合 |
| `start_pose` | 警告 | 首帧右臂关节离训练起始位姿超过 2° |

录制数据里没有力矩信号，所以"夹空"阈值用 8300，而不是行为树判定用的 7800（行为树还要求力矩）：10-16 保留的夹住平台最高到 7904，剔除的夹空在 8414–8550。

窗口取 2 s：10-16 的 #209 在最后约 2.5 s 才稳定在 8448，之前在 7400–7600 爬升，3 s 中位数只有 7802，会漏判；保留的条目里 2 s 中位数最高的是 #21（8244）。

在 10-16 的原始数据上，规则建议剔除的正好是当时人工剔除的 13 条（13、28、44、61、69、78、120、121、130、181、189、209、216），由 `test_real_data.py` 固定。
