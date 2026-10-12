# 手眼标定动画播放器设计

日期：2026-10-12。范围：开发者手册 `camera-calibration` 页新增一个"一图看懂手眼标定"播放器，并用同一场景导出 mp4。

## 目标

用真实 URDF 三臂解释三臂 ChArUco 手眼标定的原理和流程，让读者先看懂"为什么要这样采样、求解到底在求什么"，再读下面的 service 与配置说明。

## 形式

- 页内播放器：实时渲染，有播放/暂停、进度条、章节按钮、字幕、公式卡、相机画面（PiP）和全屏。
- mp4：用 Playwright 驱动同一个 `seek(t)` 逐帧截图，numpy 合成背景音乐，ffmpeg 合成。不带旁白，放在仓库根目录，**不入库**。
- 页内播放器不放大文件；仓库不新增二进制资源。

## 章节（总长约 104 秒）

| 章 | 时间 | 内容 |
| --- | --- | --- |
| 1 问题 | 0–12 s | 三臂各自在自己的基座系里，基座之间的相对位置未知，目标是 `T_base_l_base_m`。 |
| 2 眼在手上 | 12–26 s | 相机固定在 `link_6`，`T_tool_camera` 未知；ChArUco 板固定在桌面。 |
| 3 采样 | 26–52 s | 三臂同时摆出 30 个不同姿态，每次 capture 取 `T_base_tool`（TF）和 `T_camera_board`（PnP）；PiP 显示相机画面与角点。 |
| 4 求解 | 52–72 s | 先猜一个 `X`，每个样本推出的板位姿散开；`X` 调向正确值后收拢成一块。 |
| 5 闭合 | 72–86 s | `T_base_board = T_base_tool · T_tool_camera · T_camera_board`，三臂各算一遍，结果一致。 |
| 6 相对基座 | 86–104 s | `T_base_l_base_m = T_base_l_board · inverse(T_base_m_board)`，显示生产布局里中、右臂相对左臂的真实位姿。 |

## 数据与几何

- 数值来自配置：`sync-three-robots.mjs` 往 `docs-data.json` 增加 `calibration` 段（板尺寸、字典、arm→frame、`minimum_samples_per_arm`、`hand_eye_method`、各阈值），读自 `config/ros/camera_calibration.yaml`；三臂位置读 `three-robots.json`。
- 姿态由页内 look-at 阻尼最小二乘求解器生成（有限差分雅可比，关节限位截断，热启动），所有变换由 URDF 正运动学真实算出；`T_camera_board = inverse(T_world_camera) · T_world_board`，因此板位姿的收拢是几何后果，不是画出来的。
- 第 4 章：对每个样本取 `T_world_tool_i · X' · T_camera_board_i`，`X' = X · δ`，`δ` 从明显偏差平滑缩到单位阵；板的虚影随之从散开变成重合。
- 第 6 章的相对位姿 `inverse(T_world_l) · T_world_m` 直接由 `three_robots.yaml` 的生产布局算出。

## 简化与声明

- 30 个采样姿态和 `T_tool_camera` 的"真值"是示意，播放器标注"示意动画，非真实标定数据"。只有第 6 章的基座相对位姿是生产的真实结果。
- ChArUco 板用程序生成的棋盘贴图（尺寸取自配置），不是真实 marker 图案。
- 不在页内实现真正的手眼求解器；不改标定节点。

## 异常与测试

- WebGL 不可用或"减少动画"：播放器退化为静态首帧加章节文字，不留空白。
- IK 无法收敛的采样姿态被丢弃并重采样；最终不足 30 个时以实际数量显示，不伪造。
- e2e：`calibration` 段与 yaml 一致；播放器 ready，章节切换、拖动进度条、第 6 章数值与布局一致；手机宽度无横向溢出。另跑样式检查、构建与链接检查。
- 导出脚本和音乐生成器留在会话临时目录，完成后询问是否收进 `website/scripts/`。
