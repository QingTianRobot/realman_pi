# BehaviorTree.CPP-X 项目计划与深度分析

> 当前版本目标：把已有的 C++ 行为树核心、插件节点、HTTP 后端和 Web 编辑器，推进成一个可编辑、可排版、可测试、可读脚本、可一键启动的工程化工具链。

更新时间：2026-07-13

---

## 0. 需求口径

你这次提到的工作，我按下面 4 个可验收方向落地：

1. **后台支撑编辑与排版**：`bt_server` 不只负责 tick，还要稳定支撑编辑器的加载、导出、校验、结构查询、格式化、保存/打开树文件；视觉排版由 `bt_editor` 完成，脚本排版由 XML formatter 完成。
2. **功能必须通过测试**：核心逻辑、服务接口、前端 XML/连线工具、浏览器交互和一键脚本都要有自动化验证，不能只靠手点。
3. **项目形态工程化/一键化**：根目录提供统一的 `scripts/` 或 `make`/`just` 入口，一条命令能启动后端+前端，一条命令能跑完验证。
4. **行为脚本易读**：继续兼容 BehaviorTree.CPP/Groot XML，同时提供稳定缩进、命名规范、示例树、脚本预览和必要的子树拆分规则。

---

## 1. 当前事实基线

### 1.1 模块现状

| 模块 | 当前能力 | 结论 |
|---|---|---|
| `bt_core` | C++17 行为树核心：节点基类、黑板、端口、工厂、插件加载、树 tick、XML parser、SubTree 展开 | 已形成可用核心 |
| `bt_nodes` | 25 个内置插件节点：控制、装饰、动作/条件、数据、时间、诊断、函数节点 | 已可给编辑器动态枚举 |
| `bt_server` | `cpp-httplib` HTTP 服务，`TreeApiService` 承载树状态/API 逻辑；支持 health/nodes/load/validate/format/export/tick/run/structure/trees/open/save | 后端协议已能支撑编辑器核心闭环和 workspace 文件管理 |
| `bt_editor` | React + TypeScript + React Flow；稳定布局、类型化属性、XML 导入导出、Tick 上色、Vitest 4/13、6 个 mocked Playwright 和 1 个 live-backend 用例 | 编辑与浏览器闭环已验证 |
| `bt_ros2` | 可选 ROS2 wrapper、35 节点默认注册、八节点 `RechargeTask` 回充树、幂等 start/stop、mock 和 Humble DDS smoke | Humble 回充闭环已验证；Jazzy 未验证 |
| `tests` | GoogleTest 覆盖核心、严格 XML、数据/ROS mock、SubTree、插件回滚/生命周期；另有安装 consumer 和 HTTP smoke | Release 与 sanitizer gate 已接入统一脚本 |
| `docs` | 25 节点完整契约、函数手册、ROS2 教程、四张截图、Sphinx HTML/linkcheck | 查询手册与验证说明完整 |

### 1.2 本次实测证据

在项目根目录执行：

```bash
cmake --build build
ctest --test-dir build --output-on-failure
cd bt_editor && npm run build
cd bt_editor && npm test
npx playwright test
./scripts/build_docs.sh
```

结果：

- `cmake --build build` 通过，目标包括 `bt_core`、`bt_nodes`、`bt_server`、examples、6 个测试二进制。
- fresh Release `ctest`：当前配置发现的全部用例 100% 通过；不固化历史总数。
- `bt_editor/npm run build`：`tsc --noEmit && vite build` 通过。
- `bt_editor/npm test`：Vitest 4 个测试文件、13 个用例通过，覆盖 XML round-trip、DFS 前序 id、连线规则、导入布局、整理布局算法、端口控件推断。
- mocked Chromium 6/6 连续三轮；live-backend Chromium 1/1；临时截图用例 1/1 且四个 hash 互异。
- `./scripts/build_docs.sh`：Sphinx HTML 与 linkcheck 均以 warning-as-error 通过。
- 临时启动 `bt_server` 并加载当前平台的 `libbt_nodes.so` / `libbt_nodes.dylib` 后，接口 smoke 通过：
  - `/api/health` 返回 `ok=true`
  - `/api/nodes` 枚举到 25 个插件节点
  - `/api/tree/load` 加载 3 节点 XML 成功
  - `/api/tree/export` 能导出格式化 XML
  - `/api/tree/tick` 返回根状态 `SUCCESS`
  - `/api/tree/run` 返回完整状态变化序列
  - `/api/tree/structure` 返回父子结构
  - 未加载树时 export/tick/structure 返回 404，缺少或损坏 XML 时 load 返回 400，OPTIONS 返回 204。

### 1.3 当前缺口

| 缺口 | 影响 | 优先级 |
|---|---|---|
| 行为脚本仍主要是原始 XML | 兼容性好，但人工阅读和维护体验一般 | P1 |
| ROS2 Jazzy 尚未验证 | Humble 已通过，Jazzy 仍需目标环境补跑 | P2 |
| 缺少 owner 批准的根许可证和真实 maintainer 身份 | 工程可发布不等于取得对外商用分发授权 | Release blocker |

---

## 2. 产品化目标

### 2.1 后台编辑与排版能力

后台不是直接替代前端画布，而是提供可靠的编辑数据服务：

- `GET /api/nodes`：节点 manifest，供前端动态生成节点面板和属性控件。
- `POST /api/tree/load`：接收 XML，构建当前树。
- `GET /api/tree/export`：导出当前树 XML。
- `GET /api/tree/structure`：返回规范结构，供前端校验、回放、调试。
- `POST /api/tree/run`：返回完整状态变化序列，支撑运行过程回放。
- `POST /api/tree/validate`：只校验，不替换当前树，返回结构错误、未知节点、端口错误。
- `POST /api/tree/format`：输入 XML，输出稳定缩进后的可读 XML，不替换当前树。
- `POST /api/tree/save` / `GET /api/tree/open` / `GET /api/trees`：本地树文件管理，限制在 `BT_TREE_WORKSPACE` 或默认 `examples/trees` 内，拒绝绝对路径和 `../` 穿越。

### 2.2 编辑器排版能力

排版分成两层：

- **视觉排版**：画布节点自动整理成层级布局，支持按子树重新布局、fit view、节点对齐、稳定兄弟顺序。
- **脚本排版**：导出的 XML 有稳定缩进、稳定属性顺序、可读命名、子树拆分规则。

### 2.3 行为脚本可读性

默认仍使用 XML，原因是兼容 BehaviorTree.CPP/Groot，且现有 `XmlParser` 已验证。可读性通过约束提升：

- 根树统一 `MainTree`，复杂逻辑拆成 `<BehaviorTree ID="...">` + `<SubTree ID="..."/>`。
- 节点 `name` 必填或编辑器提示补全，显示业务含义，不只显示注册名。
- 端口值保持字面量和 `{blackboard_key}` 两种语义，不混用。
- 导出时保留视觉兄弟顺序：同一父节点下按 x 坐标从左到右输出。
- 后续可增加只读 DSL/Markdown 预览，但不替代 XML 作为执行格式。

---

## 3. 下一阶段 Spec DAG

### Phase 11 — 一键工程入口（P0）

- [x] 新增 `scripts/bootstrap.sh`：检查 CMake、Node/npm，配置 C++ build，安装前端依赖。
- [x] 新增 `scripts/dev.sh`：构建后端，启动 `bt_server` 并加载 `libbt_nodes`，启动 Vite，打印后端和前端 URL，退出时清理子进程。
- [x] 新增 `scripts/test.sh`：统一运行 C++ build、`ctest`、`npm run build`、server smoke。
- [x] 新增 `scripts/smoke_server.sh`：随机或指定端口启动后端，curl 验证 health/nodes/load/export/tick/run/structure。
- [x] README 更新成“一键启动”和“手动启动”两套路径。

验收证据：

```bash
./scripts/bootstrap.sh
./scripts/dev.sh
./scripts/test.sh
```

`scripts/test.sh` 必须在无 ROS2 环境下完成核心验证，并明确跳过 ROS2 真机项。

### Phase 12 — 后端编辑协议增强（P0）

- [x] 抽出 `bt_server` 可测试的服务/handler 层，避免所有逻辑都绑在 `main.cpp`。
- [x] 增加 `/api/tree/validate`，不污染当前树状态。
- [x] 增加 `/api/tree/format`，输出稳定、可读的 XML。
- [x] 增加本地 workspace 文件 API：列出、打开、保存树文件；必须限制路径，禁止任意文件读写。
- [x] 增加后端接口集成测试或 smoke 测试脚本断言。

验收证据：

```bash
cmake --build build
ctest --test-dir build --output-on-failure
./scripts/smoke_server.sh
```

### Phase 13 — 前端编辑与排版闭环（P0/P1）

- [x] 工具栏增加“整理布局”按钮，对当前树做层级排版。
- [x] 属性面板继续支持类型化编辑：bool、number、enum、text、`{blackboard_key}`。
- [x] 增加 XML/脚本预览面板，支持复制、格式化、校验错误定位。
- [x] 导入 XML 后使用稳定布局，避免大树节点重叠。
- [x] Tick 与 Run 回放分开：`Tick` 看单拍，`Run` 看完整状态变化序列。
- [x] 错误提示落到具体原因：无唯一根、叶子有子节点、装饰节点多子、成环、未知节点、端口非法。

验收证据：

```bash
cd bt_editor && npm run build
cd bt_editor && npm test
cd bt_editor && npm run test:e2e
```

Vitest 已覆盖 `xml.ts`、`connection.ts` 和端口控件推断；后续可继续扩展更多组件级测试。

### Phase 14 — 测试体系补齐（P0）

- [x] C++ 单测继续保持 `ctest` 全绿。
- [x] 后端 API smoke 纳入 `scripts/test.sh`。
- [x] 前端新增 Vitest，覆盖：
  - XML 导入导出 round-trip
  - DFS 前序 id 对齐
  - 连线规则
  - 自动布局算法
  - 端口控件推断
- [x] 新增 Playwright E2E smoke，覆盖：
  - 打开编辑器并拉取节点
  - 载入示例
  - 载入到服务器
  - Tick 状态反馈
  - XML 预览
  - 后端校验/格式化
  - Run 状态摘要
  - 整理布局按钮
- [x] 扩展 Playwright E2E，覆盖：
  - 拖拽节点、连线、编辑属性
  - Tick 上色
  - 导出/导入后结构一致
- [x] 增加 Playwright 文档截图生成入口：
  - `cd bt_editor && npm run screenshots`
  - 生成 `docs/blog/screenshots/01_editor_loaded.png`、`02_sample_tree.png`、`03_tick_colored.png`、`04_tick_highlight_fixed.png`
  - 发布 CI 把截图写入临时目录；Linux gate 与已提交文档图对比，不修改仓库图片
- [x] GitHub Actions 已在 macOS/Linux 运行完整 `scripts/test.sh` 非 ROS 发布 gate。

验收证据：

```bash
./scripts/test.sh
```

输出必须包含 Release CTest、sanitizer、安装 consumer、server smoke、前端 unit/build、mocked Playwright 6 个用例连续三轮、live Playwright 1 个用例、临时截图/hash 和 Sphinx HTML/linkcheck。

### Phase 15 — 行为脚本文档与范例（P1）

- [x] 增加 `docs/design/TREE_SCRIPT_STYLE.md`，定义可读 XML 写法、命名规范、黑板 key 规范、SubTree 拆分规则。
- [x] 增加 3 个真实示例树：
  - 最小 Sequence/Fallback
  - 黑板数据流
  - SubTree 复用
- [x] 编辑器导出 XML 与文档风格一致。
- [x] 增加脚本格式化测试：同一树多次导出文本稳定。

验收证据：

```bash
./scripts/test.sh
./build/bin/example_load_xml ./build/lib/libbt_nodes.so examples/trees/<new-example>.xml  # macOS 使用 .dylib
```

本阶段已纳入 `./scripts/test.sh`：

- `example_load_xml` 真实加载 `minimal_sequence_fallback.xml`、`blackboard_data_flow.xml`、`subtree_reuse.xml` 并返回 `SUCCESS`。
- `scripts/smoke_server.sh` 对 `/api/tree/format` 做二次格式化幂等断言。
- Sphinx 新增 `tree_script_style.rst` 查询页，Markdown 完整规范位于 `docs/design/TREE_SCRIPT_STYLE.md`。

### Phase 16 — ROS2 真环境验证（P2）

- [x] 在 ROS2 humble 环境执行 `colcon build`。
- [x] 跑 `bt_ros2/launch/bt_executor.launch.py` 回充 demo。
- [x] 验证 topic 条件/输入/输出节点的端到端行为。
- [x] 把 ROS2 环境验证步骤写入 `bt_ros2/README.md`。

验收证据：

```bash
./scripts/smoke_ros2.sh
```

Humble smoke 已覆盖 35 个注册、八节点安装树、幂等 start/stop、各一条 battery/command/dock/notifier 和最终 `SUCCESS`。Jazzy 状态：**unverified: ROS 2 Jazzy is not installed on this machine.**

### Phase 17 — SDK、插件生命周期与安装消费（P0）

- [x] `FunctionRegistry` 单例改为跨 DSO 共享实现，插件可调用宿主注册函数。
- [x] 插件注册异常原子回滚，树可安全晚于工厂析构。
- [x] 安装 `bt::core` / `bt::nodes`，外部 same-toolchain consumer 可加载安装插件。
- [x] ASan/UBSan `PluginRuntime` 与安装 smoke 纳入统一发布 gate。

### Phase 18 — 严格 XML 与状态化 ROS2 回充（P0）

- [x] 拒绝叶子子节点、装饰 arity、重复/空树 ID、未知端口和非法 SubTree shape。
- [x] 所有定义（含未引用定义）都校验，序列化端口按字典序稳定输出。
- [x] `RechargeTask` 每次尝试只发一条命令，支持 dock 等待、超时、锁存和 halt/retry。
- [x] Humble 真实 DDS smoke 验证八节点树和幂等 service；Jazzy 保持明确未验证。

### Phase 19 — 手册与浏览器证据（P0）

- [x] Sphinx 25 节点契约、严格 XML 迁移、ROS2 教程和函数手册完成。
- [x] mocked 浏览器错误路径、真实 `bt_server + libbt_nodes` 流程完成。
- [x] 四张 mocked 文档图来源如实标注并通过 hash/pixel gate。

### Phase 20 — 发布验证与法律审批（Release）

- [x] 统一非 ROS 发布 gate 在最终提交快照上通过 Release、sanitizer、安装/server、前端/browser/screenshots、Sphinx HTML/linkcheck。
- [x] 第三方依赖清单和商用发布检查表已建立。
- [ ] 产品 owner 批准根许可证文本并提交根 `LICENSE`。
- [ ] 产品 owner 提供真实 copyright/maintainer 名称与联系方式，替换 ROS package placeholder。
- [ ] 法务/产品 owner 审核第三方 notice bundle 和目标分发方式。

---

## 4. 推荐实施顺序

1. 先做 **Phase 11 一键脚本**：它会降低后续所有测试和联调成本。
2. 再做 **Phase 12 后端协议增强**：把验证、格式化、保存/打开这些编辑支撑能力补齐。
3. 同步做 **Phase 14 测试体系**：尤其是 server smoke、Vitest 和 Playwright。
4. 然后做 **Phase 13 编辑器排版**：有测试保护后再改画布交互。
5. 最后做 **Phase 15/16 文档与 ROS2 真环境验证**。

---

## 5. 完成标准

项目进入下一版可交付状态时，至少满足：

- 一条命令能启动：`./scripts/dev.sh`
- 一条命令能验证：`./scripts/test.sh`
- fresh Release CTest 100% 通过，以当前配置输出为准。
- 前端不只 build 通过，还要有 unit/E2E 覆盖核心编辑流程。
- 后端接口有自动 smoke 或集成测试。
- 编辑器能整理布局，导出的行为脚本稳定、可读、可复现。
- README 对新用户的启动路径不超过 3 步。
- 对外商用分发前，Phase 20 的三项 owner/legal gate 全部关闭。
