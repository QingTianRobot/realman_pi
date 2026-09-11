编辑器与 Playwright
===================

验证拓扑
--------

``bt_editor`` 使用 React、TypeScript 和 React Flow。浏览器测试分成两条互补路径：

.. list-table::
   :header-rows: 1
   :widths: 22 33 45

   * - 路径
     - 后端
     - 用途
   * - 默认 ``editor.spec.ts`` + ``responsive.spec.ts``
     - Playwright route mock
     - 稳定覆盖 UI 全流程、恢复/错误路径和桌面/窄屏几何，不依赖 C++ 进程。
   * - opt-in ``live-backend.spec.ts``
     - 真实 ``bt_server`` + ``libbt_nodes``
     - 覆盖生产 Vite preview 代理、25 个真实 manifest、严格 XML、load/validate/tick。

两条路径都在生产构建后的 Vite preview 上运行。开发服务器和 preview 共用
``BT_BACKEND_URL`` 代理契约，默认指向 ``http://localhost:8080``；live 项目使用
``http://127.0.0.1:18080``。

.. image:: _static/editor_e2e_flow.svg
   :alt: Playwright 编辑器测试流程
   :width: 100%

默认 mocked E2E
----------------

``bt_editor/e2e/editor.spec.ts`` 覆盖：

* 页面加载、健康状态和动态 manifest 面板。
* 载入八节点示例、发送 ``/api/tree/load``、Tick 状态上色和 Run 摘要。
* 后端 XML 校验、格式化和服务器 XML 导入。
* 节点拖拽、父子连线、层级布局和 DFS 前序状态映射。
* 实例名/端口编辑后 XML 预览同步。
* ``/api/tree/tick`` 返回 HTTP 500 时，通过 ``role=alert`` 呈现可访问错误信息。
* 后端离线时保留本地编辑，手工重连后恢复后端按钮；manifest 拉取失败后可刷新恢复。
* Tick 上色后重置为 IDLE、删除连线节点、清空并回到空状态的完整生命周期。
* 1280×720、768×1024、390×844 下无横向溢出、画布不坍缩、工具栏不越界，
  React Flow 浮层不遮挡节点；触控视口可点击节点条目直接添加。

运行：

.. code-block:: bash

   cd bt_editor
   npm run test:e2e

真实后端 E2E
------------

以下 Linux 命令在独立 Release 目录构建真实 server/plugin，然后由 Playwright 管理两个
短生命周期进程。调用方必须显式传入产物路径，避免误连陈旧或未加载插件的 server。

.. code-block:: bash

   cmake -S . -B /tmp/btx-docs-live-build \
     -DCMAKE_BUILD_TYPE=Release \
     -DBT_BUILD_SERVER=ON -DBT_BUILD_NODES=ON \
     -DBT_BUILD_TESTS=OFF -DBT_BUILD_EXAMPLES=OFF
   cmake --build /tmp/btx-docs-live-build \
     --target bt_server bt_nodes --parallel
   cd bt_editor
   BT_SERVER_BIN=/tmp/btx-docs-live-build/bin/bt_server \
   BT_NODES_PLUGIN=/tmp/btx-docs-live-build/lib/libbt_nodes.so \
     npm run test:e2e:live

live 用例会断言真实 manifest 恰好 25 个、``AlwaysSuccess`` / ``AlwaysFailure`` 是
Condition、``PrintMessage.message`` 默认 ``hello bt``，然后执行示例 load、validate、
tick。它再清空浏览器画布，从 server 导回八节点树并执行 Run，证明生产 preview、编辑器
状态和真实 C++ 树形成闭环。最后直接请求严格校验接口，确认 ``messsage`` 这类未声明属性
返回 HTTP 400 和带节点上下文的错误。

截图资料
--------

以下四张图片由固定 viewport、固定 mocked API 响应生成，目的不是冒充真实 server，
而是提供稳定、可重现的文档视觉基线。真实后端闭环由上一节的独立 live 用例证明。
1200 像素文档画布会隐藏 MiniMap/运行态浮层，避免辅助浮层遮挡可编辑节点；1280、768、
390 像素的几何回归由 ``responsive.spec.ts`` 单独证明。

.. image:: blog/screenshots/01_editor_loaded.png
   :alt: 编辑器和分类正确的 mocked 节点面板加载完成
   :width: 100%

.. image:: blog/screenshots/02_sample_tree.png
   :alt: 八节点示例树及实时 XML 预览
   :width: 100%

.. image:: blog/screenshots/03_tick_colored.png
   :alt: Tick 后节点按 SUCCESS FAILURE RUNNING 状态上色
   :width: 100%

.. image:: blog/screenshots/04_tick_highlight_fixed.png
   :alt: 选中 PrintMessage 后编辑实例名和 message 并同步 XML
   :width: 100%

重新生成并验证：

.. code-block:: bash

   cd bt_editor
   npm run screenshots

``npm run screenshots`` 先运行生产构建，再写入四张 PNG，最后调用
``screenshots:check``。hash gate 会拒绝缺失、过小或内容重复的图片；默认 E2E 不会
改写文档截图。

稳定性与边界
------------

发布前应让默认 Chromium 用例连续通过三次：

.. code-block:: bash

   cd bt_editor
   npm run build
   for run in 1 2 3; do npx playwright test --project=chromium || exit 1; done

当前默认集合每轮 14 个用例。CI 允许 retry 仅用于收集诊断，但 ``failOnFlakyTests`` 会让
retry-pass 仍然失败；每一轮使用独立输出目录，HTML 报告、trace、失败截图和生成的文档图
由 GitHub Actions 保留 14 天。preview 使用 ``--strictPort``，4173 被占用时立即失败，
不会静默切到其他端口并误测另一进程。

Vitest 负责 XML round-trip、DFS id、连线规则、导入/整理布局和端口控件推断；
统一发布 gate 中的 server API 集成阶段负责更宽的 HTTP 错误契约；Playwright 负责真实
浏览器交互。三层验证互补，不能用其中一项代替另外两项。
