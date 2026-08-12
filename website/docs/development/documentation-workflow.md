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
| `website/docs/development/index.md` | 开发者手册入口和完成标准 |
| `website/docs/development/*.md` | 各功能当前有效的契约、实现、配置与验证 |
| `website/docs/guide/` | 用户运行和操作流程 |
| `website/docs/troubleshooting.md` | 用户可执行的故障诊断与恢复 |
| `.agents/skills/document-feature-updates/SKILL.md` | AI 开发任务中的强制维护流程 |

功能增量优先更新已有页面。不要只追加提交日志，因为开发者需要从页面直接获得当前系统行为。

## 完成流程

1. 实现前阅读对应开发者页面，确认现有契约和边界。
2. 完成功能后更新用途、数据流、源文件、配置、命令、验证和已知限制。
3. 新增页面时同步更新 VitePress 导航和 `website/tests/site.spec.ts` 路由列表。
4. 配置变化同时应用 `project-config-layout` Skill，确保权威配置位于根目录 `config/` 并带有清晰注释。
5. 从 `website/` 运行构建；涉及页面行为、生成资源或导航时运行端到端测试。

```bash
cd website
npm run build
npm run test:e2e
```

最终工作说明应列出更新的开发者文档路径和验证结果。未能运行的检查必须明确说明原因，不能将缺少文档或验证的功能标记为完成。

## Skill 发现路径

Skill 存放在仓库 `.agents/skills/document-feature-updates/`，包含执行规则和 Codex UI 元数据。它与项目一起版本控制，使其他开发环境在检出仓库后可以使用相同的完成标准。
