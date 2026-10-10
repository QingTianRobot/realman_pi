# LeRobot Studio 回放 Phase 2 — 设计文档

> 状态：待审阅。Phase 1 已交付（视频直出 + 软删除 + LeRobot Studio 回放布局）。本 spec 覆盖 Phase 2：restore 后端端点、subtask 标注（对齐 LeRobot Studio v3.0）、episode 编辑、再导出。

**目标：** 补齐 Phase 1 遗留的 restore 对称性，并按 LeRobot Studio v3.0 实现 subtask 标注（subtask_index + 标签表）、episode task 编辑、以及「移除/编辑后」的再导出。

**参考：** [LeRobot Studio data-formats](https://raw.githubusercontent.com/ioai-tech/lerobot-studio/refs/heads/main/docs/data-formats.md)、[annotation guide](https://io-ai.tech/platform/guides/Pipeline/Annotation/)、[v2/v3 差异](https://io-ai.tech/platform/guides/Pipeline/LeRobot/LeRobotV2V3Format/)。

## 现状（Phase 1 之后）

- 软删除 = 翻 `manifest.json` 的 `decision`（`ADOPTED`↔`DELETED`），文件不删、可恢复，但**前端恢复依赖 localStorage**（`/api/lerobot` 只返回 ADOPTED 会话）。
- exporter（`lerobot_exporter.py`）只写一个 `task` 字符串（`manifest.metadata.task`），**无 `subtask_index`、无 `meta/subtasks.parquet`**。
- 共享数据集 `realman/pi05-three-arm`：每 session = 一个 episode，append-only。

## 架构

### 1. Restore 后端端点（补齐对称性）

- `LeRobotReplayCatalog.list_hidden()`：扫描 `recording_root/*/manifest.json`，返回 `decision == "DELETED"` 的会话（session_id + task + frames + fps，复用 `_reference` 的路径校验但跳过 ADOPTED 过滤）。
- `GET /api/lerobot/trash` → `{"sessions": [...]}`。
- 前端 `sidebar.ts` 用该端点替换 localStorage 隐藏注册表（`hidden` 列表从 `/trash` 拉取，`restore` 后刷新）。

### 2. Subtask 标注（对齐 LeRobot Studio v3.0）

数据 schema（官方 v3.0）：
- 逐帧列 `subtask_index`：`int64`，`shape [1]`，`-1` = 未标注。
- `meta/subtasks.parquet`：`subtask`（字符串索引）↔ `subtask_index`（int64）的标签表。
- 读时 `subtask_index = -1` 视为未标注；导出勾选「Include subtasks」时要求**全帧覆盖、绝不写 -1**。

本系统实现：
- **标注存储**：subtask 标签存在 session 的 `manifest.json`（新 `subtasks` 字段：`[{index, label, start_frame, end_frame}]`），不改共享数据集。导出时由 exporter 落成 `subtask_index` 列 + `meta/subtasks.parquet`。
- **标注 UI**（回放时间轴）：编辑模式下，**Q** 标记当前帧为段起点、**R** 标记段终点，段内指定文本标签；未覆盖帧保持 `-1`。与 LeRobot Studio 的 Q/R 快捷键一致。
- **exporter 扩展**：`lerobot_exporter.py` 写 `subtask_index`（默认 -1）+ `meta/subtasks.parquet`（从 manifest.subtasks 生成）；「Include subtasks」导出时校验全帧覆盖（无 -1），否则报错或降级。

### 3. Episode 编辑

- `POST /api/lerobot/{session_id}/task`（body `{task: str}`）更新 `manifest.metadata.task`（原子写）。
- 前端侧栏每个 episode 的 task 可内联编辑。

### 4. 再导出（移除/编辑后）

- 移除（隐藏）后：数据集里的 episode 保留（软删除不删文件），但 `list_datasets` 已按 ADOPTED 过滤。若需「从数据集移除 episode」，走 v3.0 再导出（重写 meta + data parquet，排除隐藏 episode）——**标记为 Phase 2b**，先不做。
- task 编辑后：exporter 重跑该 session，更新 episode 的 `task`。
- subtask 标注后：exporter 重跑该 session，写入 `subtask_index` + `meta/subtasks.parquet`。

## 数据模型

- `manifest.json` 新增可选 `subtasks: [{index:int, label:str, start_frame:int, end_frame:int}]`（标注期间真相源）。
- 数据集（导出后）：`subtask_index` 列 + `meta/subtasks.parquet`（`subtask` 索引 ↔ `subtask_index`）。

## 组件

- 后端：`lerobot_web_replay.py`（`list_hidden`）、`web_server.py`（`/trash`、`/task` 端点）、`session_store.py`（task 编辑的原子写）、`lerobot_exporter.py`（subtask 写入）。
- 前端：`sidebar.ts`（用 `/trash` 替换 localStorage、task 内联编辑）、新增 `annotation.ts`（时间轴 Q/R 标注）。

## 阶段划分

- **Phase 2a（restore + 编辑）**：restore 端点 + `/trash` + 前端替换 localStorage + task 内联编辑 + 再导出更新 task。小、独立、可先交付。
- **Phase 2b（subtask 标注）**：exporter 写 subtask_index + meta/subtasks.parquet、manifest.subtasks 存储、时间轴 Q/R 标注 UI、全覆写导出校验。大、需要 exporter + UI。
- **Phase 2c（从数据集移除 episode 的再导出）**：v3.0 再导出排除隐藏 episode。较大，可延后。

## 非目标

- 不迁移已有 9 个 session 的 subtask（它们无 subtask_index，保持 -1，读时显示「无 subtask 标签」）。
- 不做 v3.1 语言标注（Q=question/R=response 那套），只做 v3.0 subtask_index + 标签表。

## 待确认

1. 阶段节奏：先 Phase 2a（restore+编辑）再 2b（subtask），还是 2a+2b 一起排。
2. subtask 标签是否要每段强制一个文本标签（label 非空），还是允许仅 index 无 label（回退 "Subtask N"）。
