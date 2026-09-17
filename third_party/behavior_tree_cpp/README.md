# BehaviorTree.CPP-X

一个插件化、ROS 解耦的 C++17 行为树框架，包含内置节点插件、HTTP 后端、React 可视化编辑器和可选 ROS2 wrapper。

## 文档站

GitHub Pages 目标地址：**<https://lovelyyoshino.github.io/behavior_tree_cpp/>**

- `main` 分支维护源码与文档源（`docs/*.rst`）。
- HTML 站点由 GitHub Actions 从 `docs/_build/pages` 发布；`Settings -> Pages` 的 Source 选择 `GitHub Actions`，且 `github-pages` Environment 必须允许 `main` 部署。源码和 `gh-pages` 分支都不是当前自动发布源。详见 [GitHub Pages 发布说明](docs/pages_deployment.rst)。
- 本地预览：`./scripts/build_docs.sh && open docs/_build/html/index.html`。

如果目标地址尚未更新，而 Pages workflow 的构建阶段已经成功，请先修复
`github-pages` Environment 的分支规则，再重跑失败的部署 job；这不是文档构建失败。

站点包含 25 个内置节点的完整契约、函数注册表手册、严格 XML 迁移说明、真实/模拟 Playwright 验证，以及基于状态化 `RechargeTask` 的 ROS2 回充教程。

## 内置节点与示例

- **25 个内置节点**：控制/装饰/动作/数据/时间/诊断/函数七类。新增 `Delay`（异步 RUNNING 演示）、`WaitUntilElapsed`（单调到时）、`BlackboardExists`、`ClearBlackboard`、`ScalarThreshold`（数值阈值门控）、`LogEvent`（分级日志）。端口详见 [节点目录](docs/node_catalog.rst)。
- **示例 3 `example_function_recharge`**：用单例 `FunctionRegistry` + 工厂 `NodeFactory` + 函数引用演示同步业务调用链，本机无需 ROS2 即可运行。真实机器人回充使用 `RechargeTask` 处理“发布一次、跨 tick 等 dock、超时、halt/retry”。

## 前置条件

- CMake 3.16+ 和支持 C++17 的编译器。
- Python 3 和 `curl`。
- Node.js/npm，用于 `bt_editor`。
- Sphinx，用于本地文档站；可用 `python3 -m pip install -r docs/requirements.txt` 安装。
- Playwright Chromium；`./scripts/bootstrap.sh` 会自动执行 `npx playwright install chromium`。
- 发布 gate 使用 POSIX Bash，支持 Linux/macOS；Windows 请在 WSL 的 Linux 工具链中运行。原生 PowerShell/CMD 未验证。

## 快速开始

```bash
./scripts/bootstrap.sh
./scripts/test.sh
```

运行最小示例：

```bash
./build/bin/example_embedded
./build/bin/example_load_xml ./build/lib/libbt_nodes.so examples/trees/patrol.xml
./build/bin/example_load_xml ./build/lib/libbt_nodes.so examples/trees/blackboard_data_flow.xml
./build/bin/example_function_recharge
```

Linux 下插件路径通常是 `./build/lib/libbt_nodes.so`，macOS 是 `.dylib`；多配置构建还可能位于 `Release/` 子目录。

## 一键启动编辑器

```bash
./scripts/dev.sh
```

脚本会构建 `bt_server` 和 `bt_nodes`，启动后端 `http://127.0.0.1:8080`，再启动 Vite 编辑器 `http://127.0.0.1:5173`。按 `Ctrl-C` 会清理两个子进程。

## 手动启动编辑器

终端 1：启动 C++ 后端并加载内置节点插件。

```bash
./build/bin/bt_server 127.0.0.1 8080 ./build/lib/libbt_nodes.dylib
```

终端 2：启动前端。

```bash
cd bt_editor
npm install
npm run dev
```

浏览器打开 Vite 输出的地址。前端会通过 `/api/health` 和 `/api/nodes` 连接后端。

## 验证命令

```bash
./scripts/test.sh
```

`scripts/test.sh` 是强制的非 ROS 发布 gate，按当前源码构建并验证：

- Release 全量 CTest、五棵 XML 示例和函数注册表示例。
- ASan/UBSan 下的 `PluginRuntime` 回滚与跨工厂生命周期测试。
- 安装后的 SDK 外部 consumer，以及真实 `bt_server` 正/负 HTTP 契约。
- ROS2 launch 语法与包/树 XML；真实 Humble 数据流按下方回充教程验收。
- Vitest、生产前端 build、已提交截图 hash、桌面/平板/手机 mocked Chromium 连续三次、真实后端 Chromium、临时目录截图生成/hash。
- Sphinx HTML 和 linkcheck，二者均把 warning 当 error。

发布 gate 不允许 `BT_SKIP_E2E=1`，避免把浏览器缺口误报为完整通过。

默认 Playwright 用 mocked API 验证浏览器主流程、离线恢复、manifest 重试、编辑生命周期、HTTP 500 告警和 1280/768/390 宽度下的可达性；触控视口可点击节点条目创建节点，不依赖 HTML5 drag。live 项目把生产 preview 代理到本次 Release 构建的 `bt_server + libbt_nodes`，验证 25 个真实 manifest、load/validate/tick、清空后导回、Run 和严格 XML 错误。

预期成功标记包括：

- fresh Release CTest 显示 100% 通过；以本次配置输出为准，不固化历史总数。
- 真实 server API 的成功/错误契约全部通过，`/api/nodes` 枚举到 25 个内置节点。
- Vitest 输出 `4 passed` / `13 passed`。
- 前端 `npm run build` 通过。
- mocked Chromium 每轮 `14 passed`，连续三轮；live-backend Chromium `1 passed`。
- 临时截图用例 `1 passed`，四张 PNG 的签名、尺寸和 SHA-256 通过；Linux gate 还要求与已提交文档图逐字节一致。
- CI 中任何 retry-pass 都按 flaky 失败；HTML 报告、trace、失败截图和临时文档截图作为矩阵平台 artifact 保留 14 天。
- Sphinx 输出 HTML built 和 `linkcheck passed`。
- 无 ROS2 环境时明确记录未运行真实 `colcon/ros2 launch`，不把环境缺失当作通过。

常用环境变量：

- `BT_BUILD_DIR=/path/to/build`：切换 C++ 构建目录。
- `BT_BUILD_CONFIG=Release`：多配置生成器的配置名；发布 gate 只接受 `Release`。
- `BT_SANITIZER_BUILD_DIR=/path/to/build-asan`：切换 ASan/UBSan 专用构建目录。
- `BT_BACKEND_URL=http://127.0.0.1:18080`：让编辑器 dev/preview 代理到指定后端。
- `BT_E2E_REUSE_SERVER=1`：仅手工调试时允许复用 4173 上的 preview；发布 gate 始终设为 `0`。
- `BT_TREE_WORKSPACE=/path/to/trees`：限制 `/api/trees`、`/api/tree/open`、`/api/tree/save` 的读写目录，默认 `examples/trees`。

本地文档站：

```bash
./scripts/build_docs.sh
open docs/_build/html/index.html
```

生成 GitHub Pages 干净发布目录：

```bash
./scripts/build_pages.sh
```

上传 `docs/_build/pages/` 目录内的内容即可。该目录会自动包含 `.nojekyll`，并排除 Sphinx 构建缓存、源码副本和 inventory 文件。详细说明见 [GitHub Pages 发布说明](docs/pages_deployment.rst)。

刷新文档截图：

```bash
cd bt_editor
npm run screenshots
```

截图会写入 `docs/blog/screenshots/`，供 Sphinx 和 blog 文档引用；该命令不在默认 CI 中运行，避免普通测试修改图片文件。

## ROS2 回充示例

默认注册目录合计 35 种节点：25 个 `bt_nodes`、2 个 ROS topic、4 个 ROS data 和 4 个 recharge 节点。安装的 `recharge.xml` 固定为八节点：1 个 Fallback、2 个 Sequence、1 个 ReadBattery、2 个 CompareBlackboard、1 个 RechargeTask、1 个 TaskDoneNotifier。

代码入口：

- `bt_ros2/include/bt_ros2/recharge_task.hpp`：状态化 `RechargeTask` 七端口公开契约。
- `bt_ros2/include/bt_ros2/example_data_nodes.hpp`：`ReadBattery`、`TaskDoneNotifier` 以及旧 XML 兼容节点。
- `bt_ros2/include/bt_ros2/node_registration.hpp`：默认注册器，集中注册 bt_nodes、ROS topic 节点、数据节点和回充节点。
- `bt_ros2/trees/recharge.xml`：外部电量消息驱动回充的完整 XML。
- `docs/tutorial/ROS2_RECHARGE_TUTORIAL.md`：逐步教程。

真实 ROS2 环境运行：

```bash
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --packages-select bt_ros2
source install/setup.bash
ros2 launch bt_ros2 bt_executor.launch.py \
  tree_file:=$(ros2 pkg prefix bt_ros2)/share/bt_ros2/trees/recharge.xml \
  autostart:=false \
  stop_on_terminal:=true
```

请按 [observer-first 完整教程](docs/tutorial/ROS2_RECHARGE_TUTORIAL.md) 先启动 command/notifier/status 观察者，再调用 `/bt_executor/start`，并各发布一条 battery 和 dock 消息。

当前已在 ROS2 Humble 环境按教程完成端到端验证：构建 `bt_ros2`、启动
`bt_executor.launch.py`、加载 `recharge.xml`，发布一条低电量消息并确认
`/robot/command` 收到 `start_recharge:main_dock`，再发布 `dock=true` 并确认
`/bt/task_done` 收到 `task_done:recharge`。可复制命令全部集中在
[ROS2 回充教程](docs/tutorial/ROS2_RECHARGE_TUTORIAL.md)。

Jazzy 环境状态：**unverified: ROS 2 Jazzy is not installed on this machine.**

## 商用发布边界

Engineering can make the repository release-ready, but project licensing is a legal/product-owner decision. The package currently claims Apache-2.0 without a root license file. A commercial-release claim remains conditional on the owner supplying the approved root license and maintainer identity.

发布前必须完成 [商用发布检查表](docs/COMMERCIAL_RELEASE_CHECKLIST.md)，并审核 [第三方依赖清单](THIRD_PARTY_NOTICES.md)。当前工程验证完成不等于已获得对外分发授权。

## 手册与文档

- [文档导航](docs/README.md)
- [函数手册：节点、端口、工厂与 ROS2 数据流](docs/manual/FUNCTION_MANUAL.md)
- [行为树脚本风格规范](docs/design/TREE_SCRIPT_STYLE.md)
- [Sphinx 文档站源码](docs/index.rst)
- [ROS2 回充教程](docs/tutorial/ROS2_RECHARGE_TUTORIAL.md)
- [架构设计](docs/design/architecture.md)
- [API 契约](docs/design/API_CONTRACT.md)
- [ROS2 数据接口契约](docs/design/ROS2_DATA_INTERFACE.md)
- [完整工程笔记](docs/blog/README.md)
- [项目计划](PROJECT_PLAN.md)

## 目录

```text
bt_core/    核心库，零 ROS 依赖
bt_nodes/   内置节点插件，含数据节点和 FunctionRegistry 函数节点
bt_server/  cpp-httplib HTTP 后端
bt_editor/  React + React Flow 可视化编辑器，含 Playwright E2E
bt_ros2/    可选 ROS2 wrapper、数据节点和回充示例
docs/       手册、教程、设计文档
examples/   C++ 示例程序和可运行 XML 示例树
tests/      GoogleTest + mock rclcpp 非 ROS 测试
```
