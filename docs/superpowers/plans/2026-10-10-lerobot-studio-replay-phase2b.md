# LeRobot Studio 回放 Phase 2b — 实现计划（subtask 标注）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use `- [ ]` checkbox syntax.

**Goal:** 按 LeRobot Studio v3.0 实现 subtask 标注：回放时间轴上 Q/R 划段 + 强制文本标签，导出为 `subtask_index`（int64 逐帧）+ `meta/subtasks.parquet`，全覆写校验（无 -1）。

**Architecture:** 标注期间真相源存 `manifest.json` 新 `subtasks: [{index, label, start_frame, end_frame}]`；后端 `SessionStore.update_subtasks()` 原子写 + `POST/GET /api/lerobot/{session_id}/subtasks` 端点。exporter 读 `manifest.subtasks` 把每帧映射成 `subtask_index`（未覆盖帧 = -1），并手写 `meta/subtasks.parquet`（`subtask` 字符串索引 ↔ `subtask_index`）。前端在回放时间轴加标注模式（Q 起点 / R 终点 + 文本标签）。

**Tech Stack:** Python 3.10 (aiohttp, pyarrow), TypeScript + Vite, pytest。

**Spec:** `docs/superpowers/specs/2026-10-10-lerobot-studio-replay-phase2-design.md`

## Global Constraints

- 标注真相源是 `manifest.subtasks`；数据集只在导出时落 `subtask_index` + `meta/subtasks.parquet`。
- `subtask_index` 未覆盖帧 = `-1`；「Include subtasks」导出要求全帧覆盖（无 -1）且每段标签非空，否则报错。
- 段必须不重叠、`0 <= start_frame <= end_frame < frames`，`index` 递增。
- 不迁移已有 session（无 subtasks → 导出仍写全 -1，或跳过 subtask 列）。
- 前端验证 = `cd website && npm run build:recording` + 重建 `static/`（tracked）。
- aiohttp 本机无：端点测试 `pytest.importorskip("aiohttp")`。

## Review Focus

1. 越界/重叠/乱序的 subtask 段必须在写入时拒绝（不写坏 manifest）。
2. 帧→subtask_index 映射边界正确（段首/段尾/段外 -1）。
3. `meta/subtasks.parquet` 的 `subtask` 索引与 `subtask_index` 一一对应、无重复 index。
4. 全覆写校验：任何帧 -1 或空标签时导出必须失败，不产出半成品数据集。
5. 标注 UI 划段后保存，重新进入能看到已标注的段（持久化到 manifest）。

## File Structure

- Modify `src/recording/realman_recording/realman_recording/lerobot_schema.py` — `features()` 加 `subtask_index`。
- Modify `src/recording/realman_recording/realman_recording/lerobot_exporter.py` — 帧 materialize `subtask_index` + 写 `meta/subtasks.parquet` + 全覆写校验。
- Modify `src/recording/realman_recording/realman_recording/session_store.py` — `update_subtasks()`。
- Modify `src/recording/realman_recording/realman_recording/web_server.py` — `GET/POST /api/lerobot/{session_id}/subtasks`。
- Modify `src/recording/realman_recording/web/src/replay/` — 标注 UI（时间轴 Q/R + 标签）。
- Test `src/recording/realman_recording/test/test_subtask_annotation.py`。

---

### Task 1: schema 加 `subtask_index` feature

**Files:** Modify `lerobot_schema.py`；Test 同上

- [ ] **Step 1: 写失败测试** —— `schema.features({})` 返回的 dict 含 `"subtask_index": {"dtype": "int64", "shape": (1,)}`
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现** —— 在 `features()` 里加 `"subtask_index": {"dtype": "int64", "shape": (1,)}`
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): declare subtask_index in v3 schema`

---

### Task 2: `SessionStore.update_subtasks()` — 原子写标注

**Files:** Modify `session_store.py`；Test 同上

**Interfaces:** `SessionStore.update_subtasks(directory, subtasks: list[dict]) -> dict`：校验 READY + SUCCEEDED + 段合法（不重叠、index 递增、label 非空、frame 界内），写 `manifest.subtasks`。

- [ ] **Step 1: 写失败测试**（合法段写成功；重叠段/空标签/越界 → ValueError/RuntimeError）
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（读 manifest → 校验 → 排序校验重叠 → `payload["subtasks"] = subtasks` → `atomic_json_write`）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): atomically store subtask annotation`

---

### Task 3: exporter 写 `subtask_index` + `meta/subtasks.parquet`

**Files:** Modify `lerobot_exporter.py`；Test 同上

**Interfaces:** exporter 从 `manifest.subtasks` 生成逐帧 `subtask_index`（未覆盖 -1）；写 `meta/subtasks.parquet`（`subtask` 字符串索引 ↔ `subtask_index`）；`include_subtasks=True` 时全帧覆盖 + 标签非空校验。

- [ ] **Step 1: 写失败测试**（纯函数 `_frame_subtask_index(subtasks, frame_count)` 的边界：段内/段外/段尾；全覆写校验函数 `_validate_subtask_coverage`）
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（帧 payload 加 `subtask_index`；`save_episode` 后写 `meta/subtasks.parquet`；校验全覆写）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): export subtask_index and subtask label table`

---

### Task 4: `GET/POST /api/lerobot/{session_id}/subtasks` 端点

**Files:** Modify `web_server.py`；Test 同上

- [ ] **Step 1: 写失败测试**（GET 返回当前 subtasks；POST 写并返回 ok；非法段 4xx）
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（复用 `_session_directory` + `asyncio.to_thread` + `SessionStore.update_subtasks`）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): expose subtask annotation endpoints`

---

### Task 5: 前端标注 UI（时间轴 Q/R + 标签）

**Files:** Modify `web/src/replay/`（新 `annotation.ts` 或扩展 `video.ts`/`charts.ts`）+ `index.html` + `styles.css` + `main.ts`

- [ ] **Step 1: 标注模式开关**（回放时间轴加「标注」按钮，进入后 Q/R 划段、文本标签、段列表展示）
- [ ] **Step 2: 保存/加载**（POST/GET `/subtasks`，划段后保存到 manifest，重新进入能看到已标注段）
- [ ] **Step 3: 构建** `cd website && npm run build:recording` 通过，提交重建 `static/`
- [ ] **Step 4: 提交** `feat(web): subtask annotation on the replay timeline`

---

## Self-Review Notes

- Spec 覆盖：schema（Task 1）、标注存储（Task 2）、导出（Task 3）、端点（Task 4）、UI（Task 5）。Review Focus #1→Task 2，#2/#3/#4→Task 3，#5→Task 5。
- Task 1-4 后端独立文件可并行；Task 5 前端依赖端点，串行收口。
- `meta/subtasks.parquet` 由 exporter 手写（lerobot 0.4.4 无原生 subtask）；字段名 `subtask`（索引）+ `subtask_index`（int64）按 io-ai v3.0。
