# LeRobot Studio 回放重构 Phase 1 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended, parallel) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把回放 tab 重构成 LeRobot Studio 风格的核心体验：episode 侧栏（搜索/过滤/隐藏/恢复）、多相机 MP4 视频同步回放、动作/状态叠加图、Health 面板，并根除「图片不动」的逐帧解码瓶颈。

**Architecture:** 后端 web bridge 直接 `FileResponse` 服务每 episode 自带的 `.mp4`（aiohttp 3.8.1 无 Range，需手写 Range 响应）；前端用 HTML5 `<video>` 按 `frame_index/fps` 定位。软删除=翻转 manifest `decision`（`ADOPTED`↔`DELETED`）。前端拆成独立模块（sidebar/video/charts/health）以便并行搭建。

**Tech Stack:** Python 3.10 (aiohttp 3.8.1, pyarrow, rclpy), TypeScript + Vite + Three.js, pytest, Playwright（website e2e）。

**Spec:** `docs/superpowers/specs/2026-10-10-lerobot-studio-replay-design.md`

## Global Constraints

- web bridge 默认只读；软删除是唯一写路径，经 `SessionStore` 原子写，仅翻转 `decision`，绝不删文件。
- `manifest.json` 是 `decision`/`export.state` 的唯一真相源；不引入第二份状态。
- 视频路径由 `lerobot-v3.json` 的 `dataset_root` + `episode_index` 推导：`<dataset_root>/videos/observation.images.<camera_id>/chunk-000/file-{episode_index:03d}.mp4`（当前 exporter 每 episode 一 mp4，`file_index == episode_index`，已核实）。路径校验必须防穿越。
- 视频是 **AV1** 编码：Chrome/Firefox/Edge 可播，Safari 不能。本阶段按 Chrome 目标实现，Safari 兼容属独立数据改动（改 exporter 编码 h264）。
- 前端测试以 `cd website && npm run build:recording` 编译通过 + 手动验证为准（无单测基础设施）；后端以 pytest 为准。
- 现有 `/api/lerobot/{session}/frames/...` JPEG 逐帧接口保留（feature inspector 的相机缩略可继续用），但主播放改用视频端点。

## Review Focus

1. 视频端点对不存在的 camera_id / 越界 episode_index / 路径穿越必须 404，不崩整个服务。
2. Range 请求必须返回 206 + `Content-Range`，否则浏览器无法 seek（`<video>` 播放会退化为从头顺序播放）。
3. 隐藏一个 session 后，`/api/lerobot` 列表必须立即不含它；恢复后必须重新出现。
4. 对未 SUCCEEDED 的 session 调 hide/restore 必须 4xx 拒绝，不写坏 manifest。
5. 两个 `<video>` 元素（不同 camera）必须与进度条/3D 姿态同步定位到同一帧。

## File Structure

- Modify `src/recording/realman_recording/realman_recording/lerobot_web_replay.py` — 加 `video_path()` 与 episode 元数据 helper。
- Modify `src/recording/realman_recording/realman_recording/session_store.py` — 加 `hide_final_session()` / `restore_final_session()`。
- Modify `src/recording/realman_recording/realman_recording/web_server.py` — 加视频端点（Range）、hide/restore 端点、episode 列表增强。
- Create `src/recording/realman_recording/web/src/replay/sidebar.ts` — episode 侧栏。
- Create `src/recording/realman_recording/web/src/replay/video.ts` — 多相机视频同步回放。
- Create `src/recording/realman_recording/web/src/replay/charts.ts` — 动作/状态叠加图 + Health。
- Modify `src/recording/realman_recording/web/src/main.ts` — 接线模块、移除旧 JPEG 相机卡。
- Modify `src/recording/realman_recording/web/index.html` + `web/src/styles.css` — 新布局。
- Test `src/recording/realman_recording/test/test_video_endpoint.py`, `test_session_store_hide.py`, `test_web_queue_endpoint.py`（扩展）。

---

### Task 1: `video_path()` — episode → mp4 路径解析（ROS-free）

**Files:**
- Modify: `lerobot_web_replay.py`（在 `LeRobotReplayCatalog` 上新增方法）
- Test: `test/test_video_endpoint.py`

**Interfaces:**
- Produces: `LeRobotReplayCatalog.video_path(session_id: str, camera_id: str) -> Path` —— 校验 camera_id 存在、episode_index 非负，返回该 episode 该相机 mp4 的绝对路径；不存在/非法则 `ValueError`。

- [ ] **Step 1: 写失败测试**（用 tmp_path 造一个最小 dataset 目录 + lerobot-v3.json）

```python
# test_video_endpoint.py
import json
import pytest
from pathlib import Path
from realman_recording.lerobot_web_replay import LeRobotReplayCatalog


def _make_session(root: Path, session: str, episode: int, cameras: list[str]) -> None:
    sdir = root / session
    (sdir / "export").mkdir(parents=True)
    (sdir / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": "ADOPTED",
        "export": {"state": "SUCCEEDED", "result": str(root / "ds")},
        "metadata": {"task": "t"},
    }))
    (sdir / "export" / "lerobot-v3.json").write_text(json.dumps({
        "dataset_root": str(root / "ds"),
        "episode_index": episode, "first_walltime_ns": 0, "fps": 15.0,
        "repo_id": "x", "schema_fingerprint": "s",
    }))
    for cam in cameras:
        vdir = root / "ds" / "videos" / f"observation.images.{cam}" / "chunk-000"
        vdir.mkdir(parents=True)
        (vdir / f"file-{episode:03d}.mp4").write_bytes(b"mp4")


def test_video_path_resolves_episode_mp4(tmp_path):
    root = tmp_path / "rec"
    root.mkdir()
    _make_session(root, "s1", 2, ["orbbec-left"])
    catalog = LeRobotReplayCatalog(root, root / "ds")
    path = catalog.video_path("s1", "orbbec-left")
    assert path.name == "file-002.mp4"
    assert path.is_file()


def test_video_path_rejects_unknown_camera(tmp_path):
    root = tmp_path / "rec"; root.mkdir()
    _make_session(root, "s1", 0, ["orbbec-left"])
    catalog = LeRobotReplayCatalog(root, root / "ds")
    with pytest.raises(ValueError):
        catalog.video_path("s1", "nonexistent")
```

- [ ] **Step 2: 跑测试确认失败** — `ImportError`/`AttributeError: no attribute video_path`
- [ ] **Step 3: 实现**

```python
def video_path(self, session_id: str, camera_id: str) -> Path:
    reference = self._reference(session_id)
    key = f"observation.images.{camera_id}"
    # camera 必须在数据集 features 里出现过；_reference 已保证 dataset_root 在导出目录内。
    if camera_id not in reference.sync_source_ids and not camera_id:
        raise ValueError("camera is not present in the selected episode")
    candidate = (
        reference.dataset_root / "videos" / key / "chunk-000"
        / f"file-{reference.episode_index:03d}.mp4"
    )
    # 防穿越：必须在 dataset_root 内。
    if reference.dataset_root not in candidate.parents or not candidate.is_file():
        raise ValueError("episode video file does not exist")
    return candidate
```

（注：`_reference` 现有签名返回 `ReplayDatasetRef`，其中已有 `dataset_root`/`episode_index`；camera 校验改为读数据集 features，见 Step 3 修正——若 `sync_source_ids` 不含相机，则改为打开数据集读 `features` 键。）

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): resolve episode video file path for replay`

---

### Task 2: Range 视频端点

**Files:**
- Modify: `web_server.py`（注册 `GET /api/lerobot/{session_id}/video/{camera_id}`，含 Range）
- Test: `test/test_video_endpoint.py`

**Interfaces:**
- Produces: `GET /api/lerobot/{session_id}/video/{camera_id}` 返回该 episode 相机的 mp4；支持 `Range: bytes=start-end` → 206 + `Content-Range` + `Accept-Ranges: bytes`。

- [ ] **Step 1: 写失败测试**（用 aiohttp test util 或直接测 helper `_parse_range` + 测 handler 用 `aiohttp.web` test client）

```python
def test_parse_range_full_and_partial():
    from realman_recording.web_server import _parse_range
    assert _parse_range("bytes=0-", 1000) == (0, 999)
    assert _parse_range("bytes=100-199", 1000) == (100, 199)
    assert _parse_range("bytes=-100", 1000) == (900, 999)
    assert _parse_range(None, 1000) is None
```

- [ ] **Step 2: 跑测试确认失败** — `ImportError: _parse_range`
- [ ] **Step 3: 实现**（web_server.py 加模块级 `_parse_range` + handler `_lerobot_video`，用 `web.StreamResponse` 或手动分片读文件返回 206；`chunk_size` 用 `FileResponse` 的 256KiB）

```python
def _parse_range(header: str | None, size: int) -> tuple[int, int] | None:
    if not header or not header.startswith("bytes="):
        return None
    spec = header[len("bytes="):].split(",", 1)[0]
    start_s, _, end_s = spec.partition("-")
    if start_s == "":
        suffix = int(end_s); start = max(0, size - suffix); end = size - 1
    else:
        start = int(start_s)
        end = int(end_s) if end_s else size - 1
    if start >= size or start > end:
        return None
    return start, min(end, size - 1)

async def _lerobot_video(self, request: Any) -> Any:
    from aiohttp import web
    camera_id = request.match_info["camera_id"]
    try:
        path = await asyncio.to_thread(self._replay.video_path, request.match_info["session_id"], camera_id)
    except ValueError as error:
        raise web.HTTPNotFound(text=str(error)) from error
    size = path.stat().st_size
    rng = _parse_range(request.headers.get("Range"), size)
    if rng is None:
        return web.FileResponse(path)  # 无 Range 时整文件
    start, end = rng
    resp = web.StreamResponse(status=206, headers={
        "Content-Type": "video/mp4",
        "Content-Range": f"bytes {start}-{end}/{size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
    })
    await resp.prepare(request)
    with path.open("rb") as f:
        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = f.read(min(256 * 1024, remaining))
            if not chunk:
                break
            await resp.write(chunk)
            remaining -= len(chunk)
    return resp
```

- [ ] **Step 4: 跑测试确认通过**（`_parse_range` 测试；handler 用 aiohttp test client + 真实 tmp mp4）
- [ ] **Step 5: 提交** `feat(recording): serve episode video with HTTP range`

---

### Task 3: 软删除 / 恢复

**Files:**
- Modify: `session_store.py`（`hide_final_session` / `restore_final_session`）
- Modify: `web_server.py`（`POST /api/lerobot/{session_id}/delete`、`POST /api/lerobot/{session_id}/restore`）
- Test: `test/test_session_store_hide.py`

**Interfaces:**
- Produces: `SessionStore.hide_final_session(directory)` 把 `decision=ADOPTED`+`export.state=SUCCEEDED` 翻成 `DELETED`；`restore_final_session(directory)` 反向翻回 `ADOPTED`；非 SUCCEEDED 拒绝。

- [ ] **Step 1: 写失败测试**

```python
# test_session_store_hide.py
import json
import pytest
from realman_recording.session_store import SessionStore


def _manifest(directory, decision="ADOPTED", export_state="SUCCEEDED"):
    directory.mkdir()
    (directory / "manifest.json").write_text(json.dumps({
        "state": "READY", "decision": decision,
        "export": {"state": export_state},
        "summary": {"write_errors": 0, "camera_write_errors": 0},
    }))


def test_hide_then_restore(tmp_path):
    d = tmp_path / "s"
    _manifest(d)
    SessionStore.hide_final_session(d)
    assert json.loads((d / "manifest.json").read_text())["decision"] == "DELETED"
    SessionStore.restore_final_session(d)
    assert json.loads((d / "manifest.json").read_text())["decision"] == "ADOPTED"


def test_hide_rejects_not_succeeded(tmp_path):
    d = tmp_path / "s"
    _manifest(d, export_state="RUNNING")
    with pytest.raises(RuntimeError):
        SessionStore.hide_final_session(d)
```

- [ ] **Step 2: 跑测试确认失败** — `AttributeError: no hide_final_session`
- [ ] **Step 3: 实现**（`session_store.py`）

```python
@staticmethod
def hide_final_session(directory, *, hidden_realtime_ns=None):
    return SessionStore._set_decision(directory, "DELETED", "hidden_realtime_ns", hidden_realtime_ns)

@staticmethod
def restore_final_session(directory):
    return SessionStore._set_decision(directory, "ADOPTED", None, None)

@staticmethod
def _set_decision(directory, decision, ts_field, ts_value):
    final = Path(directory).resolve() / "manifest.json"
    if not final.is_file():
        raise ValueError("recording session has no finalized manifest.json")
    payload = json.loads(final.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or payload.get("state") != "READY":
        raise RuntimeError("only READY recording sessions can be hidden/restored")
    export = payload.get("export") or {}
    if export.get("state") != "SUCCEEDED":
        raise RuntimeError("only successfully exported sessions can be hidden/restored")
    payload["decision"] = decision
    if ts_field:
        payload[ts_field] = _timestamp_or_now(ts_value, name=ts_field)
    atomic_json_write(final, payload)
    return payload
```

- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): hide/restore an exported episode without deleting files`

---

### Task 4: hide/restore 端点

**Files:**
- Modify: `web_server.py`（两个 POST 端点，`_session_directory` 校验 + `SessionStore.hide/restore`）

**Interfaces:**
- Produces: `POST /api/lerobot/{session_id}/delete` → `{"ok": true}`；`POST /api/lerobot/{session_id}/restore` → `{"ok": true}`；非法 session 404、非 SUCCEEDED 409。

- [ ] **Step 1: 写失败测试**（aiohttp test client + tmp session）

```python
def test_delete_endpoint_hides_session(tmp_path):
    # 造 session + aiohttp test client，POST delete，断言 manifest decision==DELETED 且响应 ok
    ...
```

- [ ] **Step 2: 跑测试确认失败**
- [ ] **Step 3: 实现**（handler 复用 `_session_directory` 防穿越，异常映射 404/409）
- [ ] **Step 4: 跑测试确认通过**
- [ ] **Step 5: 提交** `feat(recording): expose hide/restore over the web API`

---

### Task 5: 前端 episode 侧栏（搜索/过滤/隐藏/恢复）

**Files:**
- Create: `web/src/replay/sidebar.ts`
- Modify: `web/index.html`（侧栏容器）、`web/src/styles.css`、`web/src/main.ts`（import + init）

**Interfaces:**
- Produces: `initSidebar({ onSelect, onChanged }: { onSelect(sessionId: string): void; onChanged(): void })` —— 拉 `/api/lerobot` 渲染搜索框 + 过滤 + 列表；每项带「隐藏/恢复」按钮调 `/delete`/`/restore` 后 `onChanged()` 刷新；点击项 `onSelect(sessionId)`。

- [ ] **Step 1: 写 HTML 容器 + 模块骨架**（`sidebar.ts` 导出 `initSidebar`，先渲染空列表）
- [ ] **Step 2: 实现搜索/过滤/列表/隐藏恢复**（`fetch` + `escapeHtml` + 按钮事件）
- [ ] **Step 3: main.ts 接线**（替换旧 `loadReplayDatasets` 的列表部分为 `initSidebar`）
- [ ] **Step 4: 构建** `cd website && npm run build:recording` 通过
- [ ] **Step 5: 提交** `feat(web): episode sidebar with search/filter/hide/restore`

---

### Task 6: 前端多相机视频同步回放

**Files:**
- Create: `web/src/replay/video.ts`
- Modify: `web/index.html`（视频容器 + 播放控制）、`web/src/styles.css`、`web/src/main.ts`

**Interfaces:**
- Produces: `initVideo({ getSession, onFrameChange })` —— 选中 episode 后为每个 camera 建 `<video>`，`src=/api/lerobot/{session}/video/{camera}`；播放/暂停/逐帧/拖进度/倍速 + 键盘（空格、←/→）；`video.currentTime = frameIndex / fps` 定位；`onFrameChange(frameIndex)` 通知 3D/图表同步。

- [ ] **Step 1: HTML 容器（`<div id="replay-videos">` + 控制条）+ 模块骨架**
- [ ] **Step 2: 实现视频加载/播放/seek/同步**（核心：`frameIndex → currentTime` 映射）
- [ ] **Step 3: main.ts 接线**（替换旧 `renderReplayFrame` 的相机卡为 `initVideo`）
- [ ] **Step 4: 构建通过 + 手动验证「图片能实时动 + 两相机同步」**
- [ ] **Step 5: 提交** `feat(web): synchronized multi-camera video playback`

---

### Task 7: 前端动作/状态叠加图 + Health 面板

**Files:**
- Create: `web/src/replay/charts.ts`
- Modify: `web/index.html`、`web/src/styles.css`、`web/src/main.ts`

**Interfaces:**
- Produces: `initCharts()` —— 动作（虚线）vs 状态（实线）叠加时序图（复用现有 canonical inspector 数据）；`renderHealth(sessionMeta)` 渲染 valid/invalid/同步误差统计。

- [ ] **Step 1: HTML 容器（图表 + health 面板）+ 模块骨架**
- [ ] **Step 2: 实现动作/状态叠加 SVG 图 + health 统计渲染**
- [ ] **Step 3: main.ts 接线**（替换/增强现有 `renderFeatureInspector` 为 LeRobot Studio 风格叠加图）
- [ ] **Step 4: 构建通过 + 手动验证**
- [ ] **Step 5: 提交** `feat(web): action-vs-state charts and health panel`

---

### Task 8: 集成清理 + 构建 + e2e

**Files:**
- Modify: `web/src/main.ts`（移除旧 JPEG 相机卡死代码）、`website/tests/site.spec.ts`（新增回放路由用例）

- [ ] **Step 1: 移除 main.ts 里旧的 `camera-card` JPEG 逐帧路径，确保无悬空引用**
- [ ] **Step 2: `cd website && npm run build:recording` 全量通过**
- [ ] **Step 3: 加一条 Playwright 冒烟用例（打开回放 tab 不报错）**
- [ ] **Step 4: 提交** `chore(web): remove legacy per-frame JPEG path; smoke-test replay tab`

---

## Self-Review Notes

- Spec 覆盖：视频直出（Task 1/2）、软删除恢复（Task 3/4）、侧栏（Task 5）、视频回放（Task 6）、图表/健康（Task 7）、清理（Task 8）。Review Focus #1→Task 1/2，#2→Task 2 `_parse_range`，#3/#4→Task 3/4，#5→Task 6。
- 后端 Task 1-4 可并行（各自文件/测试独立）；前端 Task 5-7 分属独立模块文件，可并行，Task 8 最后串行收口。
- Task 1 的 camera 校验若 `sync_source_ids` 不可靠，改为打开数据集读 `features` 键（实现时按数据定）。
