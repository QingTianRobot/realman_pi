开发流程
========

新增普通业务功能
----------------

1. 先写普通 C++ 函数，注册到 ``FunctionRegistry``。
2. 用 ``FunctionAction`` 或 ``FunctionCondition`` 在 XML 里串流程。
3. 加非 ROS 单测，验证黑板输入输出。
4. 如果函数稳定复用，再沉淀为专用节点类，并补 ``providedPorts()``。
5. 跑 ``./scripts/test.sh``。

新增 ROS2 数据节点
------------------

1. 选择基类：输入数据用 ``RosInputNode<MsgT>``，条件判断用 ``RosConditionNode<MsgT>``，发布命令用 ``RosOutputNode<MsgT>``。
2. 声明端口，复用 ``subscriberPorts()`` 或 ``publisherPorts()``。
3. 在 ``node_registration.cpp`` 里用 ``registerIfMissing`` 注册。
4. 写 mock rclcpp 单测覆盖端口、黑板和发布输出。
5. 在 ROS2 Humble 环境按 :doc:`ros2_recharge_tutorial` 验证真实消息闭环；没有 Jazzy 时明确记录 ``unverified: ROS 2 Jazzy is not installed on this machine.``

新增编辑器能力
--------------

1. 先改 ``src/utils`` 里的纯逻辑。
2. 再接入 React 组件。
3. 对浏览器行为补 Playwright。
4. 对纯算法补 Vitest。

当前编辑器已经具备：

* ``整理布局``：按树层级重新排版当前画布。
* ``XML 脚本预览``：实时显示当前画布导出的 XML。
* ``后端校验`` / ``后端格式化``：调用 ``/api/tree/validate`` 和 ``/api/tree/format``。
* ``Tick`` / ``Run``：单拍执行和跑到终态分开。

提交前检查
----------

.. code-block:: bash

   ./scripts/test.sh
   git diff --check

如果只改文档，也至少运行：

.. code-block:: bash

   ./scripts/build_docs.sh
