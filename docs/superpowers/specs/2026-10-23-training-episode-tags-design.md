# 训练端按 Episode 标签选数据

日期：2026-10-23。状态：设计已确认，待写实现计划。

## 问题

录制平台（`src/recording`，main 8aec8a97）给每条 Session 打了标签：`success`、`arm`、`date`、`lighting_level`
（1 较暗 / 2 正常 / 3 较亮）和自定义键。人工值、Session 默认快照和自动日期合在一起，汇总在 realman_ts 录制根目录的
`episode_meta.json`。2026-10-23 已给全部 343 条补上 `arm` 和 `lighting_level`，并把清洗时剔除的 14 条标成
`success=false`，原因写在自定义键 `failure_reason` 里。

训练端（`src/training/realman_training`，命令行 `realman-train`，:8780 控制台）用不到这些标签：

- `pull` 只拷 `lerobot/realman__pi05-three-arm`，server5090 上没有任何标签。
- `clean` 只能按编号选（`--drop`、`--keep`），或用 `--suggested` 按夹爪读数规则挑。要按光照或成功与否选数据，只能手工抄编号，
  10-16、10-21、10-22 三次清洗都是这样做的。
- 清洗后 episode 会重新编号，即使有标签也会对错号。

## 目标与非目标

目标：

1. 标签跟着数据一起到 server5090，以后改了标签只更新标签，不重拷视频。
2. `clean` 能按标签条件写出子集，和 `--suggested`、`--drop` 一起用。清洗记录写明用了什么条件、哪份快照。
3. 清洗数据集和训练视图带上按新编号重写的标签，现有的清洗数据集和视图也能补上标签。
4. :8780 数据页显示标签，清洗表单可以按标签勾选并预览结果。

非目标：

- 训练时不动态筛选：openpi 数据加载器、norm、评估都不改，仍然在物化后的数据集上运行。
- 不在训练端改标签：标签只在录制平台（Recording Web）编辑，训练端只读。
- 不改录制平台和它导出的 Parquet（它的 README 明确规定不改写已导出的数据）。
- 不支持取反、范围和任意布尔表达式。

## 已定的选择（2026-10-23 与用户确认）

- 筛选放在 `clean`，写出重新编号的子集（不做训练时动态筛选）。
- 范围：命令行和 :8780 控制台都做。
- 语法：`--where key=v1,v2` 可以写多个。不同的键之间是"且"，同一个键的多个值之间是"或"。
- 标签传输用方案 A：pull 时快照，另加 `tags refresh`。不采用 clean 时实时读 realman_ts（机器人离线就没法清洗，结果也不可复现），
  也不采用写进 LeRobot Parquet。

## 设计

### 标签文件 `episode_tags.json`

放在数据集根目录，与 `meta/` 同级（例如 `raw_realman_ts_<ts>/realman__pi05-three-arm/episode_tags.json`）。

```json
{
  "schema_version": 1,
  "origin": "realman_local:realman_pi-realman_recording-1:/data/realman-recordings/episode_meta.json",
  "dataset_path": "lerobot/realman__pi05-three-arm",
  "snapshot_at": "2026-10-23T09:30:00+08:00",
  "remote_generated_at": "2026-10-23T01:09:02+00:00",
  "derived_from": null,
  "episodes": [
    {"episode_index": 0, "session_id": "20261012T074355Z-8706e3503f", "length": 412, "task": "pick_and_place",
     "tags": {"arm": "right", "date": "2026-10-12", "lighting_level": 2, "success": true},
     "tag_sources": {"arm": "manual", "date": "derived", "lighting_level": "manual", "success": "default"}}
  ]
}
```

- 只收录录制平台 README 规定给训练端用的记录：`decision == "ADOPTED"`、`export_state == "SUCCEEDED"`、
  `dataset_path` 等于本数据集，并且 `episode_index` 不为空。
- `length` 和 `task` 取自本地数据集（`lerobot_io.read_episodes` 和 `read_task_names`），不取自远端，用来校验对位。
- `derived_from`：推导出来的文件（清洗数据集、视图）在这里记来源数据集的路径、来源的 `snapshot_at`
  和编号映射所在的清洗记录。直接从远端读的文件这里为 `null`。

新模块 `realman_training/episode_tags.py` 负责：

- `load(root)`：读取标签文件，并对照数据集校验。每个 episode 都要在文件里，`length` 和 `task` 都要一致，否则抛出
  `TagsMismatch`，并列出冲突的编号。没有标签文件时返回 `None`。
- `from_remote(meta, dataset_path, local_episodes)`：从远端的 `episode_meta.json` 生成标签文件内容。远端编号超过本地最大编号的记录
  会忽略（拉取之后新录的）。本地有、远端没有的 episode，或者帧数、任务对不上的，都报错。
- `remap(tags, old_to_new)`：按清洗记录的编号映射生成新数据集的标签文件。
- `parse_where(items, tags)` 和 `select(tags, where)`：解析筛选条件，返回不满足条件的编号及原因。
- `summary(tags)`：统计每个键的取值分布和来源分布，给 inspect 和控制台用。

所有写入都先写到同目录的临时文件，再用 `os.replace` 替换。

### `--where` 语义

- 写法是 `key=v1[,v2...]`，可以重复写多个。不同的 key 之间是"且"，同一个 key 的多个值之间是"或"。
- 可以用的 key：标签文件里出现过的所有标签名，再加上 `task`。
- 值按这个 key 在文件里的实际类型解析：布尔类型只接受 `true`、`false`；整数类型接受十进制整数；`null` 匹配空值；
  其余类型按字符串精确匹配。一个值如果解析不成这个类型，就报错。
- 遇到未知的 key 时报错，并列出所有可用的 key。
- 某个值在所有 episode 里都没出现过：只在日志里给警告，不报错（例如误写成 `lighting_level=3`）。
- 一个 episode 没有某个自定义键时，按 `null` 处理。

### 命令行

- `realman-train pull`：数据拷完后，执行和 `tags refresh` 相同的远端读取，在 `.partial` 目录里写好 `episode_tags.json`，
  再和数据一起改名生效。标签读取失败时整个 pull 失败，和视频大小校验失败的处理一样。
- `realman-train tags refresh <dataset>`：
  - 原始数据集（目录里没有 `.clean_manifest.json`，也不是视图）：通过 ssh 在录制容器里执行
    `flock -s -w <lock_wait_sec> <tags_root>/.episode_tags.lock cat <tags_root>/episode_meta.json`，
    用 `from_remote` 生成标签文件后写入。这个锁和录制平台写标签时用的锁是同一个，录制平台用排他锁，这里用共享锁。
  - 清洗数据集：读取 `<dst>.clean_manifest.json` 里的 `source` 和 `old_to_new`，从来源数据集的标签文件推导。
    来源没有标签文件时报错，并提示先 refresh 来源。这一步不连机器人。
  - 视图：先读视图自己的记录，确认它和来源数据集的编号对应关系，再按同样的方法从来源推导。
    实现计划的第一步要先确认 openpi 的 `make_realman_view.py` 会不会重新编号；如果会，就按它输出的映射来推导。
  - 结果打印 episode 数、和旧文件相比哪些标签变了（每个键变化的条数），以及新的快照时间。
- `realman-train tags status <dataset>`：只读远端并比对，打印"N 个 episode 的标签已变化"和变化明细，不写文件。
  对清洗数据集和视图，就沿着来源链找到原始数据集再比对。
- `realman-train clean <src> --where k=v ...`：可以和 `--suggested`、`--drop` 一起用，最终剔除的是几种来源的并集。
  `--keep` 和 `--where` 不能同时用（两者都是正向选择，合在一起的语义不清楚）。
  每个被剔除的 episode 都写明原因，多个原因用 `; ` 连接：标签条件的原因写成 `tag success=false (<failure_reason>)`，
  或者 `tag lighting_level=1 not in {2}`。
  清洗记录里新增 `where`（原样记录用户给的条件）和 `tags_snapshot_at` 两个字段，新数据集写入按 `old_to_new` 映射后的标签文件。
  来源没有标签文件时：只用 `--suggested` 或 `--drop` 照常运行，并且不写标签文件；用了 `--where` 就报错，提示先执行
  `tags refresh`。
- `realman-train inspect <dataset>`：有标签文件时，额外打印快照时间、每个标签的取值分布和来源分布（例如 `success: true 329 (default 329), false 14 (manual 14)`）。
  加 `--json` 时，在每个 episode 下附上它的标签。
- `realman-train view`：如果源数据集有标签文件，就推导出视图的标签文件。

### 配置

`config/training/training_console.yaml` 的 `remote` 下新增 `tags_root: /data/realman-recordings`，表示录制容器里
`episode_meta.json` 所在的目录。默认值写在 `config.py` 里。

### 控制台（:8780）

- `/api/dataset` 的返回值新增 `tags` 字段：包括 `snapshot_at`、`derived_from`、`summary`，以及每个 episode 的 `tags` 和 `tag_sources`。
  没有标签文件时为 `null`；标签文件和数据集对不上时，返回 `{"error": ...}`，页面显示错误，不显示标签。
- 新增 `GET /api/dataset/tags-status?path=`：只读，内部调用 `tags status`，最多等 15 秒，连不上机器人时返回 `{"state": "unknown"}`。
- 新增 `GET /api/dataset/select?path=&where=...`：只读预览，返回会保留和会剔除的编号及原因，也可以同时带上 `suggested=1`。
- 新增任务类型 `tags_refresh`（`job_params.ALLOWED` 加 `{"path"}`），和其他任务一样需要令牌、走任务日志窗口。
  `clean` 的允许参数加上 `where`。
- 数据页：
  - episode 列表加上标签列。人工值和默认值用不同样式区分，`success=false` 的行标红，并在悬停提示里显示 `failure_reason`。
  - 页头显示快照时间，旁边有"检查更新"和"刷新标签"两个按钮。
  - 清洗表单加一个"按标签"区块，每个标签一组勾选框，选项是该标签的所有取值并附上数量，`task` 也是一组。
    勾选后调用 select 接口，实时显示"保留 N / 剔除 M"和剔除清单，再由用户确认提交。

## 出错处理

- 标签文件和数据集对不上（`TagsMismatch`）：clean、inspect 和控制台都拒绝使用这份标签，提示执行 `tags refresh`。
  如果 refresh 也对不上（远端数据和本地拷贝不一致），就列出冲突的编号，不写文件。
- ssh 或锁等待超时：`tags refresh` 失败，旧的标签文件保持不动；pull 整体失败，和现在拷贝失败的处理一样。
- 筛选后一个 episode 都不剩：报错，不写出数据集（沿用 `_selection` 现有的规则）。
- 远端的 `episode_meta.json` 里有 `errors`：只在日志里显示条数，不影响其他 episode。

## 兼容

- 已有的原始数据（10-16、10-20、10-21 三次 pull）：执行 `tags refresh` 就能补上标签。远端编号 0..341 和这几次 pull 的编号一致，
  10-23 已经用帧数逐个核对过。
- 已有的清洗数据集（`multitask_clean`、`multitask_v2_clean`、`pick_only_clean`、`pick_v2_clean` 等）和视图：
  对它们执行 `tags refresh`，会根据清洗记录从来源推导。如果来源目录已经不在了，就报错，并说明缺的是哪一层来源。
- 没有标签文件的数据集：除了 `--where` 之外，所有命令的行为都不变。

## 测试

- 单元测试（`src/training/realman_training/test/`）：
  - `load` 时 length 或 task 对不上；
  - `from_remote` 对远端记录的过滤和忽略；
  - `remap`；
  - `parse_where`：类型、`null`、未知 key、未出现过的值；
  - 和 `--suggested`、`--drop` 合并剔除及原因拼接；
  - clean 写出的清洗记录字段和新数据集的标签文件；
  - 用假 Runner 测 refresh（远端命令包含 `flock -s`、写入是原子的、失败时保留旧文件）；
  - 清洗数据集和视图沿来源链推导。
- 网页：`/api/dataset`、`select`、`tags-status` 的 API 测试；Playwright 端到端测试（`test/web_fake.py`）覆盖标签列、勾选条件后的预览数量、
  `tags_refresh` 任务。
- 真实数据验收（server5090，需要连得上 realman_ts）：
  1. 对 `raw_realman_ts_20261021_152817` 执行 `tags refresh`，应该得到 342 条，其中 `success=false` 14 条。
  2. `clean --where success=true` 剔除的应该正好是 13、28、44、61、69、78、120、121、130、181、189、209、216、290，
     保留的 328 个和 `realman__multitask_v2_clean` 的 `old_to_new` 完全一致。
  3. `clean --where success=true --where task=pick_only,pick_only_light-weak_1021` 的保留集合
     和 `realman__pick_v2_clean` 的 214 个一致。
  4. 对 `realman__multitask_v2_clean` 执行 `tags refresh`，推导出 328 条，全部 `success=true`。

## 文档

更新 `website/docs/development/training-cli-walkthrough.md`（`tags refresh/status`、`--where` 示例）、
`training-console-web.md`（数据页的标签列、按标签清洗），并在 `recording-platform.md` 里加一句训练端如何使用这些标签。

## 部署

分支 `feat/training-episode-tags` 基于 origin/main。部署前合入当时尚未合并的 #63（`feat/training-console-run-eta`），
再按 server5090 现行流程（git bundle → worktree `~/organization/realman_pi-console` 快进 → `./rm65_server up --build`）重新构建控制台。
部署前先查 `/api/jobs`，有 starting 或 running 的任务就先停手：重建容器会把正在跑的控制台任务标成 interrupted。
