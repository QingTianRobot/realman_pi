---
title: 命令行训练全流程
description: 用 realman-train 命令行从 realman_ts 拉数据、质检清洗、建训练视图、norm、从已有模型继续训练、评估、登记的完整记录（2026-10-21 多任务 v2 实例）。
---

# 命令行训练全流程

这一页是一次真实训练的完整命令记录：2026-10-21 在 realman_ts 上新录了 112 条暗光下的 pick only（任务名 `pick_only_light-weak_1021`），在 10-16 的多任务模型 `m_multitask_b16_2gpu/29999` 基础上继续训练出 v2。各命令的参数和规则见 [训练控制平台（命令行）](./training-console.md)。

所有命令都在 server5090 上执行，数据在 `~/data/realman`，openpi 在 `~/organization/openpi`，checkpoint 在 `~/organization/openpi-docker-data/checkpoints`。下面用 `rt` 代表命令行入口：

```bash
# 已部署的控制平台容器里自带包和配置（数据目录以宿主机同名路径挂载，所以路径一律写绝对路径）
rt() { docker exec realman-training-realman_training-1 python -m realman_training "$@"; }
# 或者从源码树（例如尚未部署的新功能）：
rt() { (cd <仓库>/src/training/realman_training && ~/.local/bin/uv run -q --no-project \
  --with pyyaml --with numpy --with pyarrow python -m realman_training \
  --config ~/organization/realman_pi-console/config/training/training_console.yaml "$@"); }
D=/home/server5090/data/realman
```

每一步都是后台任务：日志在 `$D/_console/jobs/<任务 id>/log.txt`，网页 :8780 上同样能看到。

## 1. 拉取

```bash
rt pull          # → $D/raw_realman_ts_<时间>/realman__pi05-three-arm + pull.json
```

本次 `raw_realman_ts_20261021_152817`：342 条、142413 帧、5.2 GB，约 13 分钟（局域网 ssh）。

拉取会把录制平台的 Episode 标签一起写进 `<数据集>/episode_tags.json`（快照，每条按帧数和任务核对过）。
之后在 realman_ts 上改了标签，不用重拉，只更新标签：

```bash
realman-train tags status ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm   # 只读，看有没有变化
realman-train tags refresh ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm  # 重新读取并核对
```

清洗版和训练视图也能 `tags refresh`：按清洗记录的编号映射从来源推导，不连机器人（来源要先有标签）。
清洗版的清洗记录里如果 `source` 就是 realman_ts 的路径本身（如 10-13 的直接整理数据集），标签文件是手工标的，
对它们 `tags refresh` 会报错（来源在机器人上，无法推导）并保留原文件，不会覆盖。
手工标注的标签文件（`derived_from.via == "manual"`）永远不会被自动替换，除非显式传入 `realman-train tags refresh --force`。

## 2. 质检

```bash
rt inspect $D/raw_realman_ts_20261021_152817/realman__pi05-three-arm
```

输出每个任务的条数和逐条质检。本次：`pick_and_place` 122、`pick_only` 108、`pick_only_light-weak_1021` 112；建议剔除 14 条，其中 13 条与 10-16 人工剔除完全相同，新数据只有 #290（`regrasp`，两次闭合）。`start_partial` 等警告不剔除。

## 3. 清洗

```bash
rt clean $D/raw_realman_ts_20261021_152817/realman__pi05-three-arm --suggested \
  --dst $D/realman__multitask_v2_clean
```

结果 328 条、135370 帧；剔除清单和原因在 `realman__multitask_v2_clean.clean_manifest.json`。

按标签选数据用 `--where 标签=值1,值2`，可以写多个：不同标签之间是"且"，同一标签的多个值之间是"或"；
`task` 也能当条件。它可以和 `--suggested`、`--drop` 一起用（剔除取并集），不能和 `--keep` 一起用。

```bash
# 只要成功、正常光照的 pick_only 两类数据，同时剔除质检规则建议的
realman-train clean ~/data/realman/raw_realman_ts_<ts>/realman__pi05-three-arm \
  --suggested --where success=true --where lighting_level=2 \
  --where task=pick_only,pick_only_light-weak_1021
```

值按标签的类型解析：`true`/`false`、整数、`null`（匹配空值），其余按文字精确匹配。光照 `lighting_level`：1 较暗、2 正常、3 较亮。
剔除原因写成 `tag success=false (<failure_reason>)` 或 `tag lighting_level=1 not in {2}`；清洗记录多出 `where` 和
`tags_snapshot_at`，新数据集带上按新编号重写的 `episode_tags.json`。`realman-train inspect` 会打印每个标签的取值和来源（人工/默认/自动）分布。
注意：`success` 的默认值是 true，只有人工标过的才可信，看 inspect 里的来源计数。

## 4. 训练视图

新任务和 `pick_only` 是同一个动作，只是光照不同，所以用同一个 prompt；三个任务都要写进 `--task-prompt`（一个参数跟多个值，重复写参数只保留最后一个）：

```bash
rt view $D/realman__multitask_v2_clean --dst $D/realman_right_arm_multitask_v2_view \
  --task-prompt "pick_and_place=pick up the power adapter and put it in the blue bin" \
                "pick_only=pick up the power adapter" \
                "pick_only_light-weak_1021=pick up the power adapter"
```

prompt 必须与 policy_bridge 的 prompt 逐字相同。视图里 0..216 与 10-16 的训练视图逐帧相同（state/action 最大差 0），217..327 是新的暗光数据。

## 5. openpi 配置

openpi 的 norm、训练、评估都只认配置名，所以每个训练视图一个配置（`src/openpi/training/config.py`）。本次新增 `pi05_realman_multitask_v2_action_only`：

| 项 | 值 | 理由 |
|---|---|---|
| `repo_id` | `local/realman_right_arm_multitask_v2` | norm stats 的目录名 |
| 留出集 | `range(9, 328, 10)`（32 条） | 9..209 正好是 v1 的留出集，v1 从没见过它们；219..319 都是暗光数据 |
| 初始权重 | v1 的 `29999/params` | 继续训练 |
| 学习率 | warmup 1000，峰值 2.5e-5，余弦（100k 步）到 2.5e-6 | v1 从 pi05_base 训练用 5e-5；已收敛的模型用一半 |
| 步数 | 100000，batch 16 | 见下 |
| 保存 | 每 1000 步（供续训），保留 10000 的倍数和最后一步 | 留出集评估后选上线的 checkpoint |

**步数怎么定的。** 训练集约 122k 帧（去掉留出集），batch 16 时一个 epoch ≈ 7.6k 步。v1 从 pi05_base 训练 30k 步（≈ 5 epoch），开环 MAE 在 10k → 20k → 30k 是 0.107 → 0.098 → 0.096，20k 之后基本饱和。本次先按 15k 步（≈ 2 epoch）启动，后改为训练 100k 步（≈ 13 epoch），每 10k 留一个 checkpoint：训练 loss 只会一直下降，看不出过拟合，所以不预先猜步数，而是用留出集（含 v1 从没见过的 21 条和 11 条暗光）逐个评估，取误差最低处作为推理模型。100k 步单卡约 33 h，两卡约 21 h。

## 6. norm stats

```bash
rt norm pi05_realman_multitask_v2_action_only $D/realman_right_arm_multitask_v2_view
```

写到 `openpi-docker-data/assets/pi05_realman_multitask_v2_action_only/local/realman_right_arm_multitask_v2/norm_stats.json`，约 30 s，CPU 上算。

继续训练时用旧模型的 norm stats：新算出来的分位数与 v1 相比差在量程的 5 % 以内（单个维度 10 %），但初始权重是按 v1 的归一化学出来的，换掉会让起点偏一点。做法是把新算的改名留作备份，拷入 v1 的：

```bash
A=~/organization/openpi-docker-data/assets
N=$A/pi05_realman_multitask_v2_action_only/local/realman_right_arm_multitask_v2
mv $N/norm_stats.json $N/norm_stats.v2_computed.json
cp $A/pi05_realman_multitask_action_only/local/realman_right_arm_multitask/norm_stats.json $N/
```

## 7. 训练

先看 GPU：`nvidia-smi`。本次 GPU 1/3 被别人的进程各占约 16 GiB，GPU 2 上有我们自己的 openpi-serve（8.8 GiB）。训练期间不需要真机推理，所以先停掉服务（`docker stop openpi-serve-openpi-1`），用 GPU 0、2 两卡数据并行（多卡所需的 NCCL/XLA 环境由命令自动加上）。若要在服务旁边训练，可加 `--share-gpus`：它按剩余显存 ≥ 18000 MiB 判断，而不是"已占用 > 2000 MiB 就拒绝"。

```bash
rt train pi05_realman_multitask_v2_action_only $D/realman_right_arm_multitask_v2_view \
  --exp m2_100k_b16_2gpu --gpus 0,2 \
  --init-from pi05_realman_multitask_action_only/m_multitask_b16_2gpu/29999 --dry-run
# 看过命令后：
rt train ...（同上，去掉 --dry-run）... --yes --background
```

训练在容器 `openpi-console-train-m2_100k_b16_2gpu` 里跑，日志 `openpi-docker-data/wandb/m2_100k_b16_2gpu.log`：

```bash
grep -E "Step [0-9]+:" ~/organization/openpi-docker-data/wandb/m2_100k_b16_2gpu.log | tail -3
rt jobs                     # 任务状态；跟随进度：rt job <id> --log
rt train ... --attach       # 任务进程丢了而容器还在跑时，重新跟随
```

第 0 步 loss 0.0247（v1 从 pi05_base 起步是 0.084），说明权重确实是从 v1 加载的。

## 8. 评估

```bash
rt eval pi05_realman_multitask_v2_action_only m2_100k_b16_2gpu \
  --view $D/realman_right_arm_multitask_v2_view --gpu 0 --checkpoints 10000,20000,30000,40000,50000,60000,70000,80000,90000,99999
```

按任务拆分留出集，对每个 checkpoint 跑开环评估，再做 prompt 交换测试，结果在 `checkpoints/<配置>/<实验名>/eval/summary.json`。共用同一个 prompt 的任务按清洗版里的任务名分开统计，所以暗光数据单独有一项。

## 9. 登记

```bash
rt register pi05_realman_multitask_v2_action_only m2_100k_b16_2gpu --status "<状态>" \
  --method "pi0.5 action-only，从 m_multitask_b16_2gpu/29999 继续训练"
```

写 `MODEL_CARD.md`、`model_card.json` 和登记表 `checkpoints/MODELS.md` 的一行。上线用 `rt serve start --model pi05_realman_multitask_v2_action_only/m2_100k_b16_2gpu --checkpoint <步数>`，会动机器人侧的 policy_bridge，需先确认。
