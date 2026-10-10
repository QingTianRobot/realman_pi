# LeRobot Studio 回放 Phase 2a — 实现计划（restore 端点 + task 编辑）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use `- [ ]` checkbox syntax.

**Goal:** 补齐 Phase 1 的 restore 对称性（后端 `/api/lerobot/trash` 列出 DELETED 会话，前端不再依赖 localStorage），并支持 episode task 内联编辑（manifest 级）。

**Architecture:** 后端加 `LeRobotReplayCatalog.list_hidden()`（扫 `decision == DELETED` 的 manifest）→ `GET /api/lerobot/trash`；`SessionStore.update_task()` 原子改 `manifest.metadata.task` → `POST /api/lerobot/{session_id}/task`。前端 sidebar 用 `/trash` 替换 localStorage 隐藏注册表，task 可内联编辑。

**Tech Stack:** Python 3.10 (aiohttp, pyarrow), TypeScript + Vite, pytest。

**Spec:** `docs/superpowers/specs/2026-10-10-lerobot-studio-replay-phase2-design.md`

## Global Constraints

- 软删除只翻 `decision`，绝不删文件；`manifest.json` 是唯一真相源。
- `/trash` 只返回 `decision == "DELETED"` 的会话；`restore` 后必须从 `/trash` 消失、回到 `/api/lerobot`。
- task 编辑只改 `manifest.metadata.task`（web 列表/摘要立即生效）；数据集 parquet 里的旧 task 更新属 Phase 2c（再导出），本阶段不做。
- 写操作经 `SessionStore` 原子写（`atomic_json_write`）；web bridge 仍只读（这两个端点是软删除/元数据例外）。
- 前端验证 = `cd website && npm run build:recording` 编译通过 + 重建 `static/`（tracked，Docker `COPY src` 直发）。
- aiohttp 本机无（仅 Docker 有）：端点测试 `pytest.importorskip("aiohttp")`，Docker `colcon test` 里跑。

## Review Focus

1. `/trash` 对不存在的会话目录/损坏 manifest 必须跳过，不 500 整个列表。
2. restore 后会话必须同时出现在 `/api/lerobot` 且从 `/trash` 消失（对称）。
3. task 编辑对非 READY/SUCCEEDED 会话必须 4xx 拒绝，不写坏 manifest。
4. 前端隐藏/恢复后列表状态必须与服务端一致（不再有 localStorage 与服务端漂移）。
5. task 为空字符串或超长时必须拒绝（不写空 task）。

## File Structure

- Modify `src/recording/realman_recording/realman_recording/lerobot_web_replay.py` — 加 `list_hidden()`。
- Modify `src/recording/realman_recording/realman_recording/session_store.py` — 加 `update_task()`。
- Modify `src/recording/realman_recording/realman_recording/web_server.py` — 加 `/trash`、`/task` 端点。
- Modify `src/recording/realman_recording/web/src/replay/sidebar.ts` — 用 `/trash` 替换 localStorage、task 内联编辑。
- Modify `src/recording/realman_recording/web/src/main.ts` + `web/index.html` + `web/src/styles.css`（接线 + task 编辑 UI）。
- Test `src/recording/realman_recording/test/test_web_trash_task.py`。

---

### Task 1: `list_hidden()` — 列出 DELETED 会话

**Files:** Modify `lerobot_web_replay.py`；Test `test/test_web_trash_task.py`

**Interfaces:**
- Produces: `LeRobotReplayCatalog.list_hidden() -> list[dict]`，返回 `[{"session_id","task","frames","fps"}]`，仅 `decision == "DELETED"` 的会话。

- [ ] **Step 1: 写失败测试**（tmp_path 造一个 DELETED 会话 + 一个 ADOPTED 会话）

```python
def test_list_hidden_returns_only_deleted(tmp_path):
    root = tmp_path / "rec"; root.mkdir()
    # 造一个 ADOPTED（可见）和一个 DELETED（隐藏）会话，复用 test_video_endpoint._make_session 的写法
    ...
    catalog = LeRobotReplayCatalog(root, root / "ds")
    hidden = catalog.list_hidden()
    assert [h["session_id"] for h in hidden] == ["deleted-session"]
```

- [ ] **Step 2: 跑测试确认失败** — `AttributeError: no list_hidden`
- [ ] **Step 3: 实现** —— 镜像 `list_datasets` 但用「接受 DELETED 的 reference」变体：扫 `recording_root/*/manifest.json`，`decision == "DELETED"` 且 `export.state == "SUCCEEDED"` 才返回；frames 从 receipt/`summary` 取，取不到就 0。跳过损坏/缺失 manifest。
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): list hidden episodes for restore`

---

### Task 2: `SessionStore.update_task()` — 原子改 task

**Files:** Modify `session_store.py`；Test 同上

**Interfaces:**
- Produces: `SessionStore.update_task(directory, task: str) -> dict`：校验 READY + `export.state == "SUCCEEDED"`，`task` 非空，写 `metadata.task`，返回 payload。

- [ ] **Step 1: 写失败测试**（`test_update_task_updates_manifest` + `test_update_task_rejects_empty`）
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（读 manifest → 校验 state/export/task 非空 → `payload.setdefault("metadata", {})["task"] = task` → `atomic_json_write`）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): atomically update episode task`

---

### Task 3: `/trash` + `/task` 端点

**Files:** Modify `web_server.py`；Test 同上

**Interfaces:**
- Produces: `GET /api/lerobot/trash` → `{"sessions":[...]}`；`POST /api/lerobot/{session_id}/task`（body `{"task": str}`）→ `{"ok": true}`；非法 session 404、非 SUCCEEDED 或空 task 409/400。

- [ ] **Step 1: 写失败测试**（aiohttp test client，`pytest.importorskip("aiohttp")`）
- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（复用 `_session_directory` 防穿越 + `asyncio.to_thread`；`/trash` 调 `self._replay.list_hidden`；`/task` 读 JSON body 调 `SessionStore.update_task`）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): expose trash listing and task edit endpoints`

---

### Task 4: 前端 restore 用 `/trash` + task 内联编辑

**Files:** Modify `sidebar.ts` + `main.ts` + `index.html` + `styles.css`

- [ ] **Step 1: sidebar 的 `refresh()` 同时拉 `/api/lerobot`（visible）和 `/api/lerobot/trash`（hidden），去掉 `HIDDEN_KEY`/localStorage**
- [ ] **Step 2: task 内联编辑**（每个 episode 行一个编辑入口 → `prompt`/内联 input → `POST /task` → 刷新）
- [ ] **Step 3: 构建** `cd website && npm run build:recording` 通过，提交重建 `static/`
- [ ] **Step 4: 提交** `feat(web): restore from /trash endpoint and inline task edit`

---

## Self-Review Notes

- Spec 覆盖：restore 端点（Task 1/3）、task 编辑（Task 2/3）、前端对称（Task 4）。Review Focus #1→Task 1，#2→Task 1/3/4，#3→Task 2/3，#4→Task 4，#5→Task 2。
- 后端 Task 1-3 独立文件可并行；Task 4 前端依赖 1/3 端点，串行收口。
- 数据集 parquet 的 task 更新（Phase 2c）本阶段不做，已在 Global Constraints 说明。
