# LeRobot Studio 回放重构 — 设计文档

> 状态：待审阅。本 spec 是「把录制回放页按 LeRobot Studio 基本复刻」的架构与组件设计。审阅通过后由 writing-plans 产出可并行执行的实现计划。

**目标：** 把 `realman_recording` 的回放 tab 重构成与 LeRobot Studio（[lerobot.studio](https://lerobot.studio)）一致的体验：左侧 episode 侧栏（搜索/过滤/隐藏删除）、多相机 MP4 视频同步回放、动作/状态叠加图表、原始字段查看、Dataset Health、以及 episode 的移除/恢复管理。同时根除当前「回放图片不动」的取帧瓶颈。

**参考：** [LeRobot Studio README](https://raw.githubusercontent.com/ioai-tech/lerobot-studio/refs/heads/main/README.md)、[Quick Start](https://raw.githubusercontent.com/ioai-tech/lerobot-studio/refs/heads/main/docs/quick-start.md)、[HF leLab](https://github.com/huggingface/leLab)、[lerobot-dataset-visualizer](https://github.com/huggingface/lerobot-dataset-visualizer)。

## 现状与问题

- 回放 tab 已有：episode 下拉 + 列表、逐帧相机卡、进度条、Canonical 字段 inspector。
- **瓶颈（「图片不动」根因）**：每帧相机画面走 `GET /api/lerobot/{session}/frames/{i}/cameras/{cam}`，服务端从 MP4 现解码一张 JPEG（~60ms），且 `LeRobotReplayCatalog._dataset` 用一把 `RLock` 把同一 session 的所有读取串行化。15fps × 3 相机 ≈ 45 张/秒，串行只能喂 ~16 张/秒 → 播放时图片跟不上。
- 数据与 `/frames`/图片接口本身正确（frame_index 逐帧递增、不同帧字节不同）。

## 架构决策

1. **视频直出（核心修复）**：web bridge 直接 `FileResponse`（带 HTTP Range）服务数据集里的 `.mp4`，前端用 HTML5 `<video>` 按 `frame_index / fps` 定位。不再逐帧解 JPEG。这是 LeRobot Studio 的取帧方式，也消除串行解码瓶颈。
2. **软删除/恢复（用户选的 A）**：episode「隐藏」= 把 session 的 `manifest.json` 里 `decision` 从 `ADOPTED` 翻成 `DELETED`，文件不删、可恢复（翻回 `ADOPTED`）。`list_datasets`/`queue_from_manifests` 已按 `ADOPTED` 过滤，翻完自动从列表消失。
3. **复用只读 web bridge 的写边界**：软删除是元数据翻转（幂等、可逆、不碰录制生命周期），经 `SessionStore`（与 recorder 同一套原子写）在 web 端点直接写，作为 bridge 的「视图层软删除例外」——用户已确认方案 A。

## 数据模型

- `recording_root/<session_id>/manifest.json`：`decision ∈ {PENDING, ADOPTED, DISCARDED, DELETED}`、`export.state`、`metadata.task`、`summary`。**权威真相源**。
- 共享数据集根：`lerobot_export_dir/realman__pi05-three-arm/`，结构：
  - `meta/info.json`（fps、features、视频元数据）
  - `meta/episodes/chunk-000/*.parquet`（每 episode 的 `episode_index`/`length`/各视频的 `chunk_index`+`video_frame_index` 全局偏移）
  - `videos/observation.images.<camera_id>/chunk-000/file-NNN.mp4`（每 chunk ~1000 帧）
  - `data/chunk-000/*.parquet`（帧数据）
- 每个 session = 共享数据集里的一个 episode；`episode_index` 在 `session 目录/export/lerobot-v3.json` 里记录。

## 后端改动（`realman_recording`）

- **视频端点**：`GET /api/lerobot/{session_id}/video/{camera_id}`（或按 chunk）→ 解析该 episode 在 `meta/episodes` 里的视频 chunk + 帧偏移，`FileResponse` 返回对应 `.mp4`（Range 支持由 aiohttp `FileResponse` 提供）。路径校验防穿越（复用 `_reference` 的 `dataset_root` 校验）。
- **episode 元数据端点**：扩展 `summary`/新增 `episode_meta`，返回 episode 的帧数/fps/视频文件列表/健康统计，供前端建播放器与健康面板。
- **软删除/恢复**：
  - `SessionStore.hide_final_session(directory)` / `SessionStore.restore_final_session(directory)`（`decision` ↔ `ADOPTED`/`DELETED`，仅对已 SUCCEEDED 会话；原子写）。
  - `POST /api/lerobot/{session_id}/delete`（→ 隐藏）、`POST /api/lerobot/{session_id}/restore`（→ 恢复）。
- **健康数据**：`queue_from_manifests`/`summary` 已含 `quality`（valid/invalid/sync_error）；补一个聚合端点或复用现有。

## 前端改动（LeRobot Studio 布局）

- **左侧 episode 侧栏**：搜索框 + 过滤（task / 健康状态）+ episode 列表（session_id、task、帧数、fps、健康标记）。每项带「隐藏/恢复」动作（`confirm()` 后调 delete/restore 端点再刷新）。
- **中央多相机视频**：N 个 `<video>` 同步播放/定位（按 `frame_index/fps` seek），替代逐帧 JPEG 卡。
- **播放控制**：播放/暂停/逐帧/拖进度条/倍速 + 键盘快捷键（空格播放暂停、←/→ 逐帧）。
- **动作 vs 状态叠加图**：指令动作（虚线）与实测状态（实线）同一张时序图（对齐 LeRobot Studio 的 dashed/solid 约定）。
- **原始字段 inspector**：选中字段的原始 JSON/数值（保留现有 canonical inspector，扩为 LeRobot Studio 风格）。
- **Dataset Health 面板**：valid/invalid 帧、同步误差、缺字段等统计。

## 阶段划分（便于并行 agent）

- **Phase 1（核心回放，修图 + 主要体验）**：视频直出端点 + 视频元数据解析；前端 episode 侧栏（搜索/过滤/隐藏删除/恢复）+ 多相机 `<video>` 同步回放 + 播放控制 + 动作/状态叠加图 + Health 面板。**此阶段即可交付「图片能实时动 + 可隐藏删除 + 基本复刻」**。
- **Phase 2（标注 + 编辑/导出）**：subtask_index 区间与 Q/R 标签标注 UI（v3.0）、episode task 编辑、移除/恢复后的数据集再导出（v2.1/v3.0）。工作量更大，作为独立阶段。

## 非目标（本 spec 不覆盖）

- 像素级 1:1 复刻 LeRobot Studio 的 CSS（做到结构/交互一致，视觉近似）。
- 从浏览器加载任意本地文件夹/远程 archive 的「数据入口」——本系统数据集在服务端已就绪，不需要上传/加载入口。
- 多数据集（repo）切换——当前只有一个 `realman/pi05-three-arm`，保留单数据集。

## 已确认

1. 阶段节奏：先交付 Phase 1，验收后再排 Phase 2。
2. 隐藏后在同一 UI 提供「恢复」入口（remove/restore 对称）。
