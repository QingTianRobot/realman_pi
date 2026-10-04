---
title: 功能文档同步
description: 使用项目级 Skill 保证每次功能完成后同步更新 Web 开发者手册。
---

# 功能文档同步

`document-feature-updates` 是项目级 Skill，用于把开发者文档纳入功能完成标准。新增、修改或删除功能时，代码、配置和 Web 手册必须在同一工作中保持一致。

## 触发范围

以下变化必须使用该流程：

- 功能、工作流或公开接口变化；
- ROS 节点图、命名空间、话题、参数或 TF 契约变化；
- 配置字段、容器行为、部署行为或运行命令变化；
- 修复缺陷后，系统对开发者或操作者呈现的行为发生变化。

仅修正文档错别字或不改变行为的内部重构，可以只更新受影响的既有说明和验证记录。

## 文档所有权

| 路径 | 职责 |
| --- | --- |
| `README.md` | 项目定位、最短启动路径和文档入口；不复制手册内容 |
| `website/docs/guide/` | 用户运行和操作流程（快速开始、相机、远程 RViz） |
| `website/docs/architecture/` | 系统总览、仓库结构、TF 树 |
| `website/docs/development/index.md` | 开发者手册入口、任务索引和完成标准 |
| `website/docs/development/*.md` | 各功能当前有效的契约、实现、配置与验证 |
| `website/docs/reference/` | 接口总表、配置文件总表、CLI 与环境变量（速查，指向专题页） |
| `website/docs/troubleshooting.md` | 用户可执行的故障诊断与恢复 |
| `config/website/vitepress.config.mts` | 导航与侧栏 |
| `.agents/skills/` | AI 开发任务中的强制维护流程和代码地图 |

功能增量优先更新已有页面。不要只追加提交日志，因为开发者需要从页面直接获得当前系统行为。

### 哪类改动要碰哪些页面

| 改动 | 至少更新 |
| --- | --- |
| 新增 / 修改 Action、Service、Topic、msg | `reference/ros-interfaces.md` + 所属专题页 |
| 新增 / 修改 `config/` 文件或字段 | 配置文件自身注释 + `reference/configuration.md`（新文件）+ 所属专题页 |
| 修改 `rm65`、Compose 服务、`.env` 变量 | `reference/cli-and-env.md`、`development/startup-entries.md`、`development/system-bringup.md` |
| 新增 / 删除 / 重命名包或目录 | `architecture/package.md`、`architecture/overview.md` |
| 修改限速、watchdog、周期 | 配置文件注释；驱动页的参数表；受影响的 router 页面（键盘、Pika） |
| 新增页面 | 侧栏、`development/index.md` 的任务索引、`website/tests/site.spec.ts` 的路由列表 |

## 完成流程

1. 实现前阅读对应开发者页面，确认现有契约和边界。
2. 完成功能后更新用途、数据流、源文件、配置、命令、验证和已知限制。
3. 新增页面时同步更新 VitePress 侧栏（`config/website/vitepress.config.mts`）、开发者手册入口的任务索引和 `website/tests/site.spec.ts` 路由列表。
4. 配置变化同时应用 `project-config-layout` Skill，确保权威配置位于根目录 `config/` 并带有清晰注释。
5. 从 `website/` 运行构建；涉及页面行为、生成资源或导航时运行端到端测试。

```bash
cd website
npm run build
npm run test:e2e
```

最终工作说明应列出更新的开发者文档路径和验证结果。未能运行的检查必须明确说明原因，不能将缺少文档或验证的功能标记为完成。

## Mermaid 图规范

站点用 ```` ```mermaid ```` 代码块渲染图，点击图会打开可缩放的查看器（`-`/`+`/`0`/`Esc`）。为避免排版问题：

- **一张图只讲一件事**，节点不超过约 12 个；更复杂的拆成多张图，或改用表格。
- **优先纵向**：流程图用 `flowchart TB`，不要 `LR` 串很多节点；宽图在窄屏上会被缩得看不清。时序图参与者不超过 5 个。
- **标签要短**，需要多行时用 `<br/>`；长说明放在图外的正文里。
- 图的内容必须对照代码核对（节点名、话题名、阈值），数值引用配置文件而不是凭记忆。
- 高于 `70vh` 的图会在框内滚动，不会撑长页面；新增图后在桌面和窄屏各看一眼（`npm run dev`），并跑 `npm run test:e2e`。

## Skill 发现路径

Skill 存放在仓库 `.agents/skills/document-feature-updates/`，包含执行规则和 Codex UI 元数据。它与项目一起版本控制，使其他开发环境在检出仓库后可以使用相同的完成标准。
