---
title: 训练控制平台（数据检查）
description: realman-train 命令行：列出训练数据集，查看条数、帧数、时长、文件时间、格式、任务分布、相机与磁盘占用，并按规则逐条质检、给出建议剔除。
---

# 训练控制平台（数据检查）

训练流程（拉取 → 检查 → 清洗 → 训练视图 → norm → 训练 → 评估 → 登记 → 部署）正在做成 `realman_training` 包和网页控制平台，设计见 [`2026-10-20-training-console-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-20-training-console-design.md)。第一部分已可用：命令行 `realman-train` 列出数据集、查看概况、逐条质检。

## 用法

在 server5090 上（数据在 `~/data/realman`）：

```bash
cd src/training/realman_training && PYTHONPATH=. python -m realman_training list
PYTHONPATH=. python -m realman_training inspect ~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm
PYTHONPATH=. python -m realman_training inspect <数据集目录> --json
```

`list` 列出 `data_root` 下所有 LeRobot v3 数据集及类型：`raw`（从 realman_ts 拉来的原始录制）、`clean`（剔除过坏条目，旁边有 `<目录>.clean_manifest.json`）、`view`（训练视图，带 `contract.json` 和 prompt）。

`inspect` 显示：条数、帧数、时长、fps、格式版本、机器人类型、数据文件的最早/最新时间、磁盘占用、每个任务的条数和帧数、相机及编码、来源和已剔除条数、训练视图的 prompt，以及逐条质检结果和建议剔除列表。训练视图没有原始夹爪读数，质检要看它的清洗版来源。

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
| `start_partial` | 警告 | 首帧读数高于 300 但未闭合 |
| `start_pose` | 警告 | 首帧右臂关节离训练起始位姿超过 2° |

录制数据里没有力矩信号，所以"夹空"阈值用 8300，而不是行为树判定用的 7800（行为树还要求力矩）：10-16 保留的夹住平台最高到 7904，剔除的夹空在 8414–8550。

窗口取 2 s：10-16 的 #209 在最后约 2.5 s 才稳定在 8448，之前在 7400–7600 爬升，3 s 中位数只有 7802，会漏判；保留的条目里 2 s 中位数最高的是 #21（8244）。

在 10-16 的原始数据上，规则建议剔除的正好是当时人工剔除的 13 条（13、28、44、61、69、78、120、121、130、181、189、209、216），由 `test_real_data.py` 固定。
