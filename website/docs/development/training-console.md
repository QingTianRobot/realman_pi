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
| `view` | 在 `openpi:dev` 镜像里跑 `make_realman_view.py --task-prompt`（prompt 取配置 `prompts` 段，可用 `--task-prompt task=prompt` 覆盖；夹爪目标按质检的同一组闭合阈值推导，见[宽抓取](#宽抓取)），再检查夹爪目标：`pick_and_place` 必须 开→闭→开，`pick_only` 开→闭 | `<清洗版>_view/` + `label_check.json`；有问题的条目让任务失败并列出 |
| `norm` | `opic-norm`（norm stats 已存在就跳过，`--force` 重算）；容器不分配 GPU，JAX 用 `JAX_PLATFORMS=cpu` 在 CPU 上算 | `openpi-docker-data/assets/<配置>/<asset_id>/norm_stats.json`（`asset_id` 取自配置，通常与 `repo_id` 相同） |
| `train` | 检查 GPU（被别人占用超过 2000 MiB 就拒绝）、缺 norm 就先算、在独立容器 `openpi-console-train-<实验名>` 里训练，多卡自动加 NCCL/XLA 环境；跟随 `Step N:` 日志显示进度；取消任务会停容器；`--attach` 重新跟随仍在跑的容器；训练结束后从整个（追加模式）日志文件解析 `metrics.csv`，所以重跑时历史步数也保留在 csv 里。`--init-from <配置>/<实验名>/<步数>` 用之前某个 run 的 checkpoint（`checkpoints/.../<步数>/params`，宿主机上必须存在）代替 `openpi.weights`（pi05_base）作为初始权重；`--share-gpus` 不按"已占用 > 2000 MiB"拒绝，改为检查每张卡剩余显存 ≥ `openpi.train_need_mib`（18000 MiB，action-only 训练峰值约 17.3 GiB），用于和 openpi-serve 共用一张卡。必须加 `--yes`（先用 `--dry-run` 看命令） | `openpi-docker-data/wandb/<实验名>.log`（追加，重跑保留历史日志）、`checkpoints/<配置>/<实验名>/metrics.csv`（从整个日志解析）、`console_train.json` |
| `eval` | 把配置的留出集按任务拆开，逐个 checkpoint 跑 `eval_open_loop.py`；多任务时再做 prompt 交换测试；共用同一个 prompt 的任务（如 `pick_only` 和 `pick_only_light-weak_1021`）按视图来源（清洗版）里的任务名分开统计；`--share-gpus` 和训练一样改为检查剩余显存 ≥ `openpi.eval_need_mib`（12000 MiB）；对同一 checkpoint/任务重跑会替换那项结果文件，`summary.json` 以合并方式更新（其他 checkpoint 的结果保留） | `checkpoints/<配置>/<实验名>/eval/`（每项结果 + `summary.json`） |
| `register` | 写模型卡和登记表一行（同一 run 再登记会替换那一行）；模型卡的任务和 `eval` 一样按视图来源里的任务名统计，共用同一个 prompt 的任务也分开列出；手写的 `MODEL_CARD.md` 或 `model_card.json`（无 `generated_by` 字段）要 `--force` 才替换，并留备份 | `MODEL_CARD.md`、`model_card.json`、`checkpoints/MODELS.md` |

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

## 计算主机（训练在另一台机器上）

控制平台可以跑在 SJDrealman 上，训练放到另一台 GPU 主机（计算主机，没有 docker，用 uv 环境跑 openpi）。配置 `compute.ssh_host` 为空时一切照旧（server5090 布局：步骤都在本机）；设了它之后：

| 在哪里跑 | 什么 |
|---|---|
| SJDrealman（控制平台容器） | 网页、命令行、后台任务记录；`pull`（从录制容器拉到本地，再推到计算主机） |
| 计算主机（经 ssh） | `clean`、`view`、`norm`、`train`、`eval`、`register`：每一步在那边以 `python -m realman_training _remote-step <种类> <token>` 运行，用同一份步骤代码和那边自己的配置（同一个 yaml，环境变量来自 `<workdir>/env.sh`） |

网页读的是 SJD 本地的元数据镜像：每步结束后用 rsync 把计算主机的 `data_root` 和 openpi 数据目录同步回来，但不含 `videos/`、`params/`、`train_state/`（视频和权重只在计算主机上）。长步骤（训练、评估）运行期间按 `compute.mirror_sync_sec` 定期刷新镜像，网页上的进度和 `metrics.csv` 随之更新。镜像里的 JSON（`console_train.json`、`model_card.json`、`contract.json`、清洗清单）写的是计算主机上的绝对路径（`<workdir>/data/realman/…`、`<workdir>/src/openpi/…`），控制平台读取时换算成本地的 `data_root` 和 openpi 数据目录，文件本身不改。

### 环境变量

计算主机的值和控制平台的其他主机值一样，放在仓库外的 env 文件里（`./rm65_server` 用 `docker compose --env-file` 传入，见[部署](./training-console-web.md#部署-server5090)），不写进仓库。compose 服务 `realman_training` 把这几个变量传进容器：

| 变量 | 含义 |
|---|---|
| `REALMAN_COMPUTE_SSH_HOST` | 计算主机的 ssh 别名；空 = 不用计算主机 |
| `REALMAN_COMPUTE_SSH_CONFIG` | ssh 配置文件；相对路径相对于存放所加载配置文件的仓库检出目录（容器里是 `TRAINING_REPO`） |
| `REALMAN_COMPUTE_WORKDIR` | 计算主机上的工作目录（绝对路径），`compute setup` 在下面建 `env.sh`、openpi、数据目录 |
| `REALMAN_RECORDING_SSH_HOST` | 录制容器所在主机的 ssh 别名；显式设为空 = 录制容器就在本机（SJD） |
| `REALMAN_TRAINING_DATA_ROOT` | 控制平台的 `data_root`；未设或为空都用默认值 |

示例（只有占位符，按实际填写）：

```text
REALMAN_COMPUTE_SSH_HOST=<compute-alias>
REALMAN_COMPUTE_SSH_CONFIG=Traning_area/.ssh/config
REALMAN_COMPUTE_WORKDIR=<absolute workdir on the compute host>
REALMAN_RECORDING_SSH_HOST=
TRAINING_HOME=/home/<user>
TRAINING_REPO=<repo checkout on SJD>
TRAINING_RUNTIME=runc
TRAINING_OPENPI_MOUNT=rw
```

`REALMAN_RECORDING_SSH_HOST=` 必须写成空值：compose 和 yaml 对它用 `${VAR-默认}`，只有未设置时才回落到 `realman_local`。路径类的键（`data_root`、`openpi.repo`、`openpi.docker_data`、`openpi.weights`）用 `${VAR:-默认}`，空值也回落到默认值，不会变成空路径。

- `TRAINING_RUNTIME=runc`：SJDrealman 的 docker 没有 nvidia 运行时；控制平台本身不用 GPU，GPU 面板读的是计算主机。有 nvidia 运行时的机器不写这一行（默认 `nvidia`）。
- `TRAINING_OPENPI_MOUNT=rw`：有计算主机时，`organization/openpi` 是控制平台自己写的镜像（训练配置列表），必须可写；server5090 上它是真正的 openpi 检出，保持默认的只读。
- 计算主机的 ssh 配置和私钥不进仓库，也不复制到别处：如果 `REALMAN_COMPUTE_SSH_CONFIG` 指向 `TRAINING_REPO` 以外的目录，用一个不入库的 compose 覆盖文件把那个目录按原路径只读挂进容器，例如：

```text
services:
  realman_training:
    volumes:
      - <directory holding the ssh config and key>:<same path>:ro
```

### 第一次使用

```bash
./rm65_server exec python -m realman_training compute setup   # 在计算主机上建 env.sh 和 openpi 的 uv 环境（可重复执行，不删东西）
./rm65_server exec python -m realman_training compute sync    # 把本包和 config/training 同步到计算主机
```

第一次 `./rm65_server up` 之前，先在 `TRAINING_HOME` 下自己建好 compose 挂载的数据目录 `data/realman`、`organization/openpi`、`organization/openpi-docker-data`，否则 docker 会以 root 身份创建它们，容器里的主机用户写不进去。

`compute setup` 可加 `--openpi-ref <分支或提交>`（默认 `main`）；所用的 openpi 版本必须包含 QingTianRobot/openpi#6（读 `OPENPI_REALMAN_DATASET_DIR`），否则 setup 直接报错退出。改了 `config/training` 后要再执行一次 `compute sync`。`compute sync` 发送的是控制平台镜像里的本包，所以改了本包的代码要先重新构建镜像并重启控制平台（`./rm65_server up --build`），再 `compute sync`。`compute sync` 最后会在计算主机上用 openpi 的环境试跑一次本包（`_gpus`），缺依赖或代码坏了会直接报错，成功时打印 `remote package ok`。pi05_base 权重不自动下载：`compute setup` 最后会打印它是否存在，缺的话在计算主机上手动下载到 `<workdir>/data/openpi/openpi-assets/checkpoints/pi05_base/params`（那条链路上要几个小时）。

### 断线与取消

- 训练期间 ssh 断了：任务失败，但训练在计算主机上继续跑；用同样的参数再启动一次 `train` 并加 `--attach` 重新跟随（`./rm65_server exec python -m realman_training train <配置名> <视图目录> --exp <实验名> --gpus <卡号> --attach`）。
- 取消任务会停掉计算主机上的那一步；取消来得太早、那边的步骤还没开始时，会留一个取消标记，步骤一启动就看到它并退出。
- `norm`、`train`、`eval` 在计算主机上以进程组运行，`<workdir>/src/openpi/console_run/<名字>.pid` 记录它；结束或取消后这个文件会被删掉。如果同名的运行被拒绝（提示 a run named … is recorded on the compute host），先在网页或命令行取消/停止那个任务，训练也可以用 `--attach` 重新跟随到结束。只有确认那边已经没有这个进程组时，才在计算主机上手动删掉它的 pid 文件（最后手段）：

```text
rm <workdir>/src/openpi/console_run/<名字>.pid
```

### 限制

- `tags refresh` 在 SJD 上运行（要读录制平台的标签索引），写完后把这个数据集的 `episode_tags.json` 复制到计算主机上的同一数据集；复制失败时任务失败（否则下一次镜像同步会用计算主机上的旧文件覆盖它），重新刷新一次即可；计算主机上没有这个数据集时只更新本地，不算失败。
- `pull` 先拉到本地再推到计算主机：推完之前 SJD 上要有和这份录制一样大的空闲磁盘。推完后删掉本地视频，只留元数据；推送失败或推送中取消任务时本地这份也删掉，需要重新 `pull`。
- 计算主机是共用的：训练和评估按剩余显存检查（`openpi.default_share_gpus`，相当于默认加 `--share-gpus`），用哪几张卡要人在网页的 GPU 面板（显示的是计算主机的 GPU）上看过再选。
- 控制平台跑在 SJD 上时，推理服务状态卡片和链路检测仍按“机器人在另一台主机上”的布局工作，在推理服务也搬到 SJD 之前（集成平台的阶段 ④）会显示错误，可以忽略。
- 在计算主机上删掉的数据集仍留在镜像里（同步不带 `--delete`），需要时在 SJD 上手动删镜像里的对应目录。

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
| `never_closed` | 剔除 | 读数从未超过闭合阈值（4275；整条最高读数不超过 4575 的按宽抓取用 3200） |
| `regrasp` | 剔除 | 闭合事件 ≥ 2 |
| `glitch` | 剔除 | 闭合中间夹着 ≤ 2 帧的张开读数 |
| `closed_on_nothing` | 剔除 | 最后一段闭合的平台（末 2 s 中位数）≥ 8300：两爪合拢，没夹住东西 |
| `no_release` | 剔除 | `pick_and_place` 结尾仍闭合（没在蓝箱上方松开） |
| `empty` | 剔除 | 这一条没有帧 |
| `start_partial` | 警告 | 首帧读数高于 300 但未闭合 |
| `start_pose` | 警告 | 首帧右臂关节离训练起始位姿超过 2° |

录制数据里没有力矩信号，所以"夹空"阈值用 8300，而不是行为树判定用的 7800（行为树还要求力矩）：10-16 保留的夹住平台最高到 7904，剔除的夹空在 8414–8550。

窗口取 2 s：10-16 的 #209 在最后约 2.5 s 才稳定在 8448，之前在 7400–7600 爬升，3 s 中位数只有 7802，会漏判；保留的条目里 2 s 中位数最高的是 #21（8244）。

在 10-16 的原始数据上，规则建议剔除的是当时人工剔除的 13 条（13、28、44、61、69、78、120、121、130、181、189、209、216）中除 #216 以外的 12 条，由 `test_real_data.py` 固定。#216 当时按"从未完全闭合（最高 3931）"剔除，其实是宽抓取（见下）。

### 宽抓取

夹爪横着夹住电源适配器机身时，读数停在 3600–4300，低于一般的闭合阈值 4275（正常夹住是 5000–7900）。10-16 的 #216 和 10-26 新录的 17 条都是这样：读数稳定、随后抬起 25–53° 一直夹到结尾，手腕相机上能看到适配器被提起。按 4275 判断，质检会把它们当成 `never_closed` 剔除，训练视图也会把它们的夹爪目标标成全程张开。

所以闭合阈值按条决定：整条最高读数不超过 `wide_grasp_max_raw`（4575）的条目按宽抓取处理，用 `wide_grasp_threshold_raw`（3200）判断开合；其余条目仍用 `closed_threshold_raw`（4275）。

- 不全局改成 3200，是因为判断重新张开和松开也用同一个阈值：#130 闭合到 6682 后只张开到约 3650 再夹，#39/#83/#119 录制在夹爪张开途中就结束（末尾约 3700）。全局 3200 会漏掉 #69/#130/#290 的重抓，新增 #39/#83/#119 的 `no_release` 和 #111 的 `regrasp`，多任务视图里 4 条 `pick_and_place` 的松开标签也会错。
- 4575 比 4275 高 300：10-26 的 #462 夹在 4262–4279，用 4275 会在闭合和张开之间来回跳。
- 在 10-16、10-21、10-26 三份原始数据上，按条规则相比只用 4275 的唯一变化是 #216 和这 17 条不再被剔除；用它重建的多任务 v2 视图与原视图逐帧相同，pick v3 视图 332 条都是 开→闭。

`view` 把这三个数作为 `--closed-threshold-raw`、`--wide-grasp-threshold-raw`、`--wide-grasp-max-raw` 传给 openpi 的 `make_realman_view.py`，所以 server5090 上的 openpi 需要有这几个参数（`feat/realman-multitask-v2` 分支 ddb2cd0 起）。
