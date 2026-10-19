# LeRobot Studio 风格回放工作区 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 `realman_recording` Web 中提供 LeRobot v3 数据集浏览、同步回放和 Canonical Robot Data 检视能力，不新增独立 ROS/Web 服务，也不把 Rerun 放入回放链路。

**Architecture:** 保留当前 aiohttp Web bridge 和只读 ROS 实时页；回放页通过独立的 `LeRobotReplayCatalog` 读取已 ADOPT 且导出成功的 episode。后端只返回经过校验的元数据、数字帧和按需 JPEG，前端采用 LeRobot Studio 风格的 episode 侧栏、同步 viewer、时间轴和字段面板。录制节点、MCAP writer 和预览 worker 不依赖回放模块。

**Tech Stack:** ROS 2 Humble, Python aiohttp, LeRobot v3 (`lerobot==0.4.4`), Vite/TypeScript, Three.js/URDFLoader, 原生 SVG/CSS 图表。

**Spec:** `src/recording/README.md` 的 Canonical Robot Dataset 与 LeRobot Web 回放章节；参考 `https://github.com/ioai-tech/lerobot-studio` 的 episode、视频、图表、raw feature 同步交互。

## Global Constraints

- 回放只读取 LeRobot v3，禁止回退到 MCAP/JPEG 原始录制物。
- 只允许 `manifest.decision=ADOPTED` 且 `manifest.export.state=SUCCEEDED` 的 session 出现在回放列表。
- dataset root 必须位于 `lerobot_export_dir` 下；session id、frame index、camera id 必须做路径/范围校验。
- 回放错误只能影响回放请求，不得阻塞 ROS 订阅、MCAP 写入或实时预览。
- Rerun 离线回放暂不实现；现有 `replay.py` 仅保留后续实验骨架。
- Canonical 字段优先展示：joint position/velocity、EE pose/velocity、gripper、Cartesian command、quality、timestamp、task/provenance。

## Review Focus

- 未采用、导出失败或路径越界的 session 不得出现在列表或被读取。
- 大 episode 不得一次性解码全部图片；列表/数字帧和图像请求必须分离。
- 缺失某个相机或字段时，其他帧和面板仍可回放并显示明确缺失状态。
- 浏览器断开、慢请求或 LeRobot 解码失败不能影响实时录制。
- 3D viewer 在回放状态下必须与当前 frame 的 joint position 同步，退出后恢复实时 ROS 状态。

### Task 1: 回放 API 元数据与安全边界

**Files:**
- Modify: `src/recording/realman_recording/realman_recording/lerobot_web_replay.py`
- Modify: `src/recording/realman_recording/realman_recording/web_server.py`
- Test: `src/recording/realman_recording/test/test_lerobot_web_replay.py`

- [x] 增加 dataset summary：feature 名称/shape、episode 帧数/FPS、task、schema fingerprint、quality 计数。
- [x] 保持数字帧与图像按需读取分离，超过 `max_frames` 返回明确业务错误。
- [x] 为缺失字段、缺失图片和错误 session 增加测试，验证不会泄漏绝对文件路径。

### Task 2: Studio 风格回放布局

**Files:**
- Modify: `src/recording/realman_recording/web/index.html`
- Modify: `src/recording/realman_recording/web/src/main.ts`
- Modify: `src/recording/realman_recording/web/src/styles.css`（若从内联样式拆出）

- [x] 左侧 episode/dataset 选择器显示 task、帧数、FPS、质量状态。
- [x] 中央区域同步四路相机、三臂 URDF 和当前 frame 信息。
- [x] 底部时间轴支持播放/暂停、逐帧、速度选择和键盘左右键。
- [x] 回放退出时清理定时器、图片 URL 和状态，恢复实时 ROS snapshot。

### Task 3: Canonical 字段和图表面板

**Files:**
- Modify: `src/recording/realman_recording/web/src/main.ts`
- Test: `src/recording/realman_recording/test/test_lerobot_web_replay.py`

- [x] 以字段选择器展示 joint、EE、gripper、action、quality 和 timing。
- [x] 使用轻量 SVG polyline 绘制选中字段的时间序列，避免新增大型图表依赖。
- [x] raw inspector 展示当前帧的字段值和 receipt 中允许公开的单位、shape、坐标系及 generator provenance。
- [x] 将 `quality.sync_error_ns` 分量映射为 receipt 中的相机/topic source ID，并在帧 API 提供纳秒精确的 `source_timestamps_ns` 字符串。

### Task 4: 构建、容器回归与文档

**Files:**
- Modify: `src/recording/README.md`
- Modify: `website/docs/development/recording-platform.md`
- Modify: `src/recording/lerobot-v3-pi05-plan.md`

- [x] 运行 `compileall`、纯逻辑测试、recording Web Vite build、VitePress build。
- [x] 在 `recording-test` 用 LeRobot 0.4.4 SDK 写入的视频 episode fixture 验证 dataset list、frames、JPEG、字段摘要和 HTTP API；真实硬件 session 的复验仍属于设备验收。
- [x] 更新工控机 `rm65-recording:test` 镜像：MCAP plugin 可见、`setuptools=79.0.1` 满足 Humble colcon 约束，recording 包 103 条测试通过；保留更新前镜像 tag。
- [x] 文档明确 LeRobot 回放已实现、Rerun 回放暂缓、实时采集不依赖回放。

## Execution Order

先执行 Task 1，再执行 Task 2–3，最后执行 Task 4。每个任务先测试再实现；不得为了 UI 回放把录制服务、MCAP writer 或 ROS action 接口改成有状态耦合。
