---
title: 训练控制平台（命令行）
description: realman-train 命令行：数据检查、拉取、清洗、训练视图、norm、训练、评估、登记，全部作为后台任务运行。
---

# 训练控制平台（命令行）

训练流程（拉取 → 检查 → 清洗 → 训练视图 → norm → 训练 → 评估 → 登记 → 部署）已做成 `realman_training` 包，命令行 `realman-train` 覆盖全流程；设计见 [`2026-10-20-training-console-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-20-training-console-design.md)。

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
PYTHONPATH=. python -m realman_training eval <openpi 配置名> <实验名> --view <视图目录> --gpu 2
PYTHONPATH=. python -m realman_training register <openpi 配置名> <实验名>
```

| 步骤 | 做什么 | 写到哪里 |
|---|---|---|
| `pull` | 经 `ssh realman_local` 在录制容器里 `tar`：先在录制锁（`.<数据集>.lock`，`flock -s`）下拷 `meta`、`data`，再拷视频；拷完校验每条的视频都在 | 新目录 `raw_realman_ts_<时间>/<数据集>/` + `pull.json`（来源、条数、字节数）；目标已存在就拒绝 |
| `clean` | 剔除条目、重新编号、视频硬链接、按 LeRobot 方法重算 `stats.json`；没写原因的条目用质检结论当原因 | 新目录 + `<目录>.clean_manifest.json`（剔除清单、原因、旧→新编号） |
| `view` | 在 `openpi:dev` 镜像里跑 `make_realman_view.py --task-prompt`（prompt 取配置 `prompts` 段，可用 `--task-prompt task=prompt` 覆盖），再检查夹爪目标：`pick_and_place` 必须 开→闭→开，`pick_only` 开→闭 | `<清洗版>_view/` + `label_check.json`；有问题的条目让任务失败并列出 |
| `norm` | `opic-norm`（norm stats 已存在就跳过，`--force` 重算） | `openpi-docker-data/assets/<配置>/<asset_id>/norm_stats.json`（`asset_id` 取自配置，通常与 `repo_id` 相同） |
| `train` | 检查 GPU（被别人占用超过 2000 MiB 就拒绝）、缺 norm 就先算、在独立容器 `openpi-console-train-<实验名>` 里训练，多卡自动加 NCCL/XLA 环境；跟随 `Step N:` 日志显示进度；取消任务会停容器；`--attach` 重新跟随仍在跑的容器；训练结束后从整个（追加模式）日志文件解析 `metrics.csv`，所以重跑时历史步数也保留在 csv 里。必须加 `--yes`（先用 `--dry-run` 看命令） | `openpi-docker-data/wandb/<实验名>.log`（追加，重跑保留历史日志）、`checkpoints/<配置>/<实验名>/metrics.csv`（从整个日志解析）、`console_train.json` |
| `eval` | 把配置的留出集按任务拆开，逐个 checkpoint 跑 `eval_open_loop.py`；多任务时再做 prompt 交换测试；对同一 checkpoint/任务重跑会替换那项结果文件，`summary.json` 以合并方式更新（其他 checkpoint 的结果保留） | `checkpoints/<配置>/<实验名>/eval/`（每项结果 + `summary.json`） |
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

## 安全规则

- 拉取、清洗、视图都写新目录，目标已存在就拒绝；只会删除本任务自己没写完的 `<目标>.partial`。
- 只读录制容器（`docker exec … tar/du/cat`），不碰 bringup、web、录制容器的启停和行为树。
- 训练和评估拒绝被别人占用的 GPU；容器用 `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`（服务器上的 CDI 规格过期，`gpus:` 会失败）。
- 配置在 `config/training/training_console.yaml`（`remote`、`openpi`、`prompts` 段）和 `config/training/openpi-console.compose.yaml`；主机只写 ssh 别名。

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
