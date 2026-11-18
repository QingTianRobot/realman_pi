# SJDrealman 采/训/推集成平台：控制台在 SJD，训练在 EI，推理在本机 4080

日期：2026-11-18 · 状态：设计待确认

## 目标

在一个控制台 `:8780`（`realman_training`，部署在 SJDrealman）里走完一条模型的全过程：

1. **采**：`:8770` 录好的 LeRobot 数据（SJD 本机，已有）。
2. **训**：清洗、视图、norm、训练、开环评估都在校园服务器 **EI** 上跑（8× RTX 5880 Ada 48 GB，无 docker，uv 环境）。
3. **推**：选中的 checkpoint 拉回 SJD，在本机 RTX 4080 上起 openpi-serve，`policy_bridge` 连 `127.0.0.1:18000`（`config/ros/policy_bridge.yaml` 已是这个默认值）。
4. **跑**：行为树 `PolicyRun` 不变。

三个网页 `:8765`/`:8770`/`:8780` 共用一条导航条。

## 背景与约束

- **SJD 不能训练**：4080 只有 16 GB，pi05 训练峰值约 17.3 GiB；推理约 9 GB 可以。训练和推理不能同时占这张卡。
- **SJD 磁盘紧**：单块 476 GB NVMe，其余空间属于别人的项目。11-18 上午清理后有 24 GB 空闲，当天两次部署后只剩 4.7 GB（构建缓存 72.8 GB，其中 30 GB 可回收）。因此 SJD 上**不放**训练数据的视频和 checkpoint 训练状态。
- **SJD 网络**：可以访问 GitHub，访问不了 PyPI 和 GCS。SJD→EI 约 9 MB/s。EI 只能从 SJD 用 `ssh -F Traning_area/.ssh/config EI` 进入，反方向不通。
- **EI 使用规则**（`Traning_area/SSH连接说明.md`）：
  - 只在指定工作目录内工作，代码、数据、环境、缓存、日志都放在里面。
  - 不用 sudo，不改系统配置，不打扰其他用户，不默认占满 8 张卡。
  - 11-18 下午起，另一位用户的任务占着全部 8 张卡（每张 8–11 GB，利用率 20–30%），因此“GPU 空闲”不能作为前提。
- **EI 环境（阶段 ② 已验证）**：
  - openpi（QingTianRobot/openpi main）装在 uv venv（Python 3.11）里。lerobot 用 codeload tarball 安装（uv 的 git clone 会断）。
  - 需要设置 `JE_ARROW_MALLOC_CONF=background_thread:false`，否则 pyarrow 自带的 jemalloc 会段错误。
  - openpi 的 norm 和 eval 脚本只接受 config 名，数据路径要靠包装脚本覆盖（`norm_override.py` 已验证）。
- **仓库约定**：配置放 `config/`。IP、私钥、他人账号路径等主机相关值只放未跟踪的 `.env`。

## 方案

保留现有 `realman_training` 的步骤代码和网页，**控制台进程跑在 SJD，计算步骤整体搬到 EI 上执行**。SJD 保留一份“元数据镜像”，网页读这份镜像，所以不用改网页。

被否决的方案：

- **控制台整个跑在 EI，用端口转发给 SJD**：pull 需要 EI 反向连 SJD（不通，开反向隧道等于给校园服务器开机器人主机的口子）；而且在共享服务器上常驻一个 web 服务也不符合“只用于计算”的规则。
- **控制台在 SJD，每个文件操作都 ssh 到 EI**：`catalog`、`steps/*` 里几十处读本地 `Path`，全部改成远程文件操作，改动面最大。
- **在 SJD 上训练**：显存不够（见上）。

## 架构

```text
SJDrealman                                              EI（工作目录 $W）
┌──────────────────────────────────────────┐           ┌──────────────────────────────────┐
│ :8770 recording（已有）                  │           │ $W/src/realman_pi（只 checkout   │
│   /data/realman-recordings/lerobot       │──pull────►│   realman_training 包）          │
│                                          │ tar|ssh   │ $W/data/realman/raw_*, clean_*,  │
│ :8780 realman_training（控制台）         │           │   view_*（含视频）               │
│   jobs/web 不变                          │──ssh─────►│ realman-train _remote-step <kind>│
│   compute.ssh_host = EI                  │ 日志流回  │   clean/view/norm/train/eval/    │
│   data_root = 元数据镜像                 │◄─rsync────│   register，openpi.backend = uv   │
│     （不含 videos/、params/、            │  元数据   │ $W/checkpoints/<cfg>/<exp>/<step>│
│      train_state/）                      │           │                                  │
│                                          │◄─rsync────│   只拉 params/ + assets/         │
│ ~/realman-models/<cfg>/<exp>/<step>      │ checkpoint│                                  │
│ openpi-serve（uv venv，4080，:18000）    │           └──────────────────────────────────┘
│ policy_bridge → 127.0.0.1:18000          │
│ :8765 BT PolicyRun（不变）               │
└──────────────────────────────────────────┘
```

### 1. 计算主机（新 `compute.py`）

配置新增一段 `compute`。主机相关的值从 `.env` 读，yaml 里只放默认值：

```yaml
compute:
  ssh_host: ""            # "" = 步骤在本机执行（server5090 的旧布局）；SJD 上由 .env 设为 EI
  ssh_config: ""          # 相对仓库根，例如 Traning_area/.ssh/config（未跟踪）
  workdir: ""             # EI 工作目录，来自 .env
  env_file: env.sh        # 相对 workdir，uv/缓存/jemalloc 环境
  mirror_excludes: [videos/, params/, train_state/, "*.mp4"]
```

`compute.py` 提供三个函数：

- `remote_step(kind, params, log)`：执行 `ssh EI 'source $W/env.sh && realman-train _remote-step <kind>'`。参数 JSON 走 stdin，步骤日志逐行流回 `log`，最后一行是结果 JSON。
  - 参数里的路径一律写成 **data_root 相对路径**，两边各自展开。
  - 步骤成功后调用 `sync_mirror()`。
- `sync_mirror(paths)`：`rsync -a --partial` 把 EI 上相关的数据集目录、run 目录和训练日志同步到 SJD 的 data_root，按 `mirror_excludes` 排除大文件。
  - 镜像保留了 parquet、meta、manifest、`console_train.json`、`eval/summary.json`、`model_card.json`、`metrics.csv` 和空的 step 目录，网页的 `catalog` 照常读这些文件。
- `gpus()`：在 EI 上执行 `nvidia-smi` 和 `ps -o user=,comm=`，替代 `gpus.py` 里依赖本机 `/proc` 的部分。

`jobs.py` 的 `_job-run` 子进程仍在 SJD 上运行（flock、status、log 不变）。如果 `compute.ssh_host` 非空，`clean/view/norm/train/eval/register` 改为调用 `remote_step`；`pull` 和 `serve` 仍在本机运行。

### 2. openpi 执行后端（`openpi.py`）

`openpi.backend: docker | uv`，默认 `docker`，保证 server5090 的旧行为不变。

`uv` 后端实现与 `Compose` 相同的三件事：

| `Compose`（docker） | `UvOpenpi`（uv，在 EI 本机执行） |
|---|---|
| `run(cmd)` → `docker compose run` | `cd repo && .venv/bin/python …`，带 `CUDA_VISIBLE_DEVICES` |
| 挂载视图到 `/datasets/lerobot_realman` | 训练传 `--data.dataset-root <view>`；norm/eval 用 `openpi_scripts/` 下的包装脚本，替换 config 的 `dataset_root`/`assets_base_dir`（阶段 ② 的 `norm_override.py` 收进包里） |
| 后台容器 `-d --name`，用 `inspect`/`stop`/`rm` 管理 | `setsid` 启动，`$W/run/<name>.pid` 记进程组，`<name>.exit` 记退出码；`kill -0` 判断是否在跑，`kill -TERM -<pgid>` 停止 |

训练本来就是“分离启动 + 跟随日志”，`attach` 参数也已存在。因此 SJD↔EI 的 ssh 断开时，EI 上的训练继续跑，SJD 的 job 以 `attach` 重新跟随即可。

**GPU 选择**：EI 上默认 `share_gpus=true`，只检查显存够不够（`train_need_mib`，单卡 batch 8 约 18 GB），不再要求空卡；按“可用显存最多”自动选卡。

### 3. pull：本机录制 → EI

沿用 `steps/pull.py` 的 `runner.pipe(producer, consumer)`：

- 生产端：在 SJD 本机执行 `docker exec realman_pi-realman_recording-1 flock -s … tar -c`，不再经过 ssh。
- 消费端：`ssh EI tar -x -C $W/data/realman/<target>.partial`。

“`.partial` 目录 + 完成后改名”和“不覆盖已有目录”这两条规则不变。传完后同步镜像。

### 4. 推理：checkpoint 回 SJD，本机 openpi-serve（阶段 ④）

- **拉模型**：选中 `<cfg>/<exp>/<step>` 后，用 `rsync --partial` 把 EI 上该 step 的 `params/` 和 `assets/` 拉到 SJD 的 `~/realman-models/<cfg>/<exp>/<step>`，大小一致才算完成。
  - 单个 checkpoint 按 pi05_base 估计约 12 GB，按 9 MB/s 约 25 分钟。作为 serve 前的独立 job，可续传。
  - SJD 上只保留当前服务的模型和上一个，用于回滚。
- **运行环境**：SJD 访问不了 PyPI，所以把 EI 上已验证的 venv 和 uv 托管的 Python（共约 8 GB）用 rsync 复制到 SJD 的 `~/realman-serve`。两边都是 x86_64，uv 用 copy 模式。
  - 驱动：SJD 是 595，EI 是 570，JAX 的 CUDA 12 wheel 都兼容。
- **serve 进程**：用 systemd user unit `openpi-serve.service` 运行，`ExecStart` 读取 `~/realman-serve/current.env`（`SERVE_CONFIG`、`SERVE_CHECKPOINT`、`PORT=18000`）。
  - `serving.py` 新增 `serving.backend: docker | systemd-user`。
  - 机器人侧命令（`policy_bridge` 重建、ROS 探测）的执行方式由“ssh 到 realman_ts”改为“本机执行”，即 `serving.robot_host: local`。
- **policy_bridge**：已默认连 `127.0.0.1:18000`，不需要改配置。“启动后保持不激活”“policy 模式下拒绝 start/stop”等规则不变。

**SJD 磁盘前提**：服务环境 8 GB，加两个 checkpoint 24 GB，再留 5 GB 余量，共需约 37 GB。现在只有 4.7 GB，开工 ④ 之前要先腾出空间（见“待决定”）。

### 5. 共用导航（阶段 ⑤）

`:8765` 已经有 link strip（PR #110/#113）。把 `:8780` 加进去，并给 `:8770`、`:8780` 加上同样的导航条。

链接用“当前页面的 hostname + 固定端口”拼出来，仓库里不写 IP。

## EI 环境脚本化

把阶段 ② 手工完成的步骤收进 `src/training/realman_training/realman_training/remote_scripts/setup_uv_host.sh`。脚本幂等，所有路径都由 `$W` 推出：

1. 写 `env.sh`：uv 缓存、Python 安装目录、`OPENPI_DATA_HOME`、`HF_HOME`、`JE_ARROW_MALLOC_CONF`。
2. 安装 openpi：clone 后执行 `uv sync --frozen --no-install-package lerobot`（带重试）；lerobot 用 codeload tarball 加 `uv pip install --no-deps`。
3. 把 `realman_training` 包同步到 `$W/src/realman_pi`，安装到同一个 venv。
4. tokenizer 从 SJD 复制；pi05_base 用分块下载器 `gcs_chunked_get.py`（同样收进 `remote_scripts/`）。

SJD 上的 `realman-train setup-compute` 负责把脚本推到 EI 并执行。

## 错误处理

- **ssh 失败或超时**：job 以失败结束，日志写明是“连接 EI 失败”还是“步骤失败”。训练这类长任务按 `attach` 恢复，不自动重启训练。
- **镜像同步失败**：步骤的结果仍以 EI 上为准，网页显示“镜像过期”；下次同步时自动补齐。
- **checkpoint 拉取中断**：`--partial` 续传。大小不一致时，`serve start` 拒绝启动。
- **EI 上的进程被他人或系统杀掉**：根据 `.exit` 文件是否存在区分“正常退出”和“丢失”。丢失时 job 标为 interrupted。

## 测试

- **单元测试**（Mac，pytest，沿用 `fake_runner`）：
  - `compute.remote_step` 和 `sync_mirror` 生成的 ssh/rsync 参数。
  - 路径的相对化与展开。
  - `UvOpenpi` 的启动、停止、`attach` 命令和退出码判定。
  - pull 的本机生产端加远端消费端。
  - `serving` 的 systemd-user 后端和 local 机器人模式。
  - 旧的 docker 配置下现有测试全部保持通过。
- **EI 实测**：3 条 episode 的 smoke 视图，经 SJD 控制台依次跑 view → norm → train（20 步）→ eval → register，网页上能看到 run 和指标。
- **SJD 实测**：把 smoke checkpoint 拉回，起 serve，执行 `linkcheck` 的推理项（中位数 < 200 ms），bridge 保持不激活。**不让机械臂动**；真机运行另行安排。

## 实施顺序

1. EI 环境脚本化，并完成阶段 ② 的 smoke 训练（pi05_base 下载中）。
2. `compute.py` + uv 后端 + `_remote-step` + 镜像同步，在 EI 上跑通 view → norm → train → eval → register。
3. pull 改为本机 → EI。
4. 在 SJD 部署控制台（`.env` 设 compute），网页实测。
5. 腾出 SJD 磁盘 → 复制 serve 环境 → 拉 checkpoint → systemd-user serve → bridge 联调（不激活）。
6. 导航条。

## 待决定

- **SJD 腾空间**（阶段 ④ 之前必须做，需要你拍板，因为涉及别人的回滚标签和构建缓存）：
  - `docker builder prune --filter until=24h`（约 30 GB，代价是下次重建镜像变慢）；
  - 或删除 11-17 及更早的 `pre-deploy-*`/`pre-rebuild-*` 回滚标签。
- **EI 上单次训练默认用卡数**：建议 1 张，最多 2 张。
