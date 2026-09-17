测试矩阵
========

统一自动验证
------------

``./scripts/test.sh`` 是用户和 CI 唯一需要调用的 mandatory non-ROS 发布入口。它使用
当前 Release 构建产物，不允许 ``BT_SKIP_E2E=1``。底层阶段由脚本内部编排，不作为
独立的用户命令。当前入口面向 Linux/macOS Bash；Windows 使用 WSL。原生
PowerShell/CMD 未验证。

.. list-table::
   :header-rows: 1
   :widths: 30 40 30

   * - 命令
     - 覆盖
     - 期望
   * - ``cmake --build build``
     - C++ 核心、插件、server、examples、测试二进制。
     - 通过。
   * - ``ctest --test-dir build --output-on-failure``
     - 核心、XML、数据节点、函数注册表、mock ROS2 基类。
     - 全绿。
   * - ASan/UBSan ``PluginRuntime`` focused CTest
     - 插件注册回滚、throwing plugin 回滚、树晚于工厂析构、宿主函数跨 DSO 可见。
     - 无 sanitizer 诊断，focused suite 全绿。
   * - SDK 安装消费阶段
     - 安装 ``bt::core`` / ``bt::nodes``，外部 same-toolchain consumer 加载安装插件并调用宿主函数。
     - 外部 consumer 成功运行。
   * - Server API 集成阶段
     - 真实 ``bt_server`` HTTP API 进程。
     - health/nodes/load/validate/format/export/tick/run/structure/trees/open/save 和错误契约全通过。
   * - ``cd bt_editor && npm run build``
     - TypeScript 和 Vite build。
     - 通过。
   * - ``cd bt_editor && npm test``
     - XML round-trip、DFS 前序 id、连线规则、导入布局、整理布局算法、端口控件推断。
     - 全绿。
   * - ``cd bt_editor && npx playwright test --project=chromium`` （连续三轮）
     - mocked 编辑器闭环，含 XML、Run、状态上色、离线/manifest 恢复、删除/重置/清空，以及 1280/768/390 响应式和触控添加。
     - 每轮 14/14，三轮均通过；CI retry-pass 仍按 flaky 失败。
   * - ``cd bt_editor && BT_SERVER_BIN=... BT_NODES_PLUGIN=... npm run test:e2e:live``
     - 生产 preview 代理到真实 ``bt_server + libbt_nodes``，验证 25 manifest、load/validate/tick、清空后导回、Run 和严格 XML 错误。
     - 1/1；调用方显式提供刚构建的 Release 产物。
   * - 临时目录 ``docs-screenshots.spec.ts`` + ``screenshots:check``
     - 固定 mocked 状态生成四张临时图片，验证 PNG/IHDR/尺寸和 SHA-256；Linux canonical gate 还会逐字节对比已提交文档图。
     - capture 1/1；四张非空、互异图片，Linux reference 一致。
   * - GitHub Actions ``playwright-*`` artifact
     - mocked 三轮、live、截图用例的独立 HTML 报告、trace、失败截图和生成图。
     - 成功或失败均上传并保留 14 天；无诊断文件时给出 warning。
   * - ``./scripts/build_docs.sh``
     - Sphinx toctree、RST 语法、图片路径、literalinclude。
     - HTML 与 linkcheck 均通过，warning 视为 error。
   * - ROS2 Humble 端到端验收
     - ``colcon build``、``ros2 launch``、``/battery_state`` 到 ``/robot/command``，以及 ``/dock/is_docked`` 到 ``/bt/task_done``。
     - 按 :doc:`ros2_recharge_tutorial` 执行；无 ROS2 环境时不作为默认 gate。

ROS2 真机验证
-------------

当前机器已在 ROS2 Humble 环境完成 35 个默认注册、八节点安装树、幂等 start/stop 和
单次 battery/command/dock/notifier 的端到端验证。可复制命令集中在
:doc:`ros2_recharge_tutorial`；按 observer-first 顺序启动观察者，不要用连续
``ros2 topic pub`` 代替 one-shot 事件流程。

默认 ``./scripts/test.sh`` 运行非 ROS gate、ROS2 mock、launch 语法和 XML 检查；无 ROS2
环境时不声称真实 DDS 路径通过。

Jazzy 环境状态：**unverified: ROS 2 Jazzy is not installed on this machine.**

商用边界
--------

工程 gate 全绿只证明当前源码的技术验证。根许可证、真实 maintainer/copyright 身份和
第三方 notice 的最终审批仍由产品 owner/法务完成；见 ``docs/COMMERCIAL_RELEASE_CHECKLIST.md``。
