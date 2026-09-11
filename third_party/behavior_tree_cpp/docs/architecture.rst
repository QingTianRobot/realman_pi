架构总览
========

.. image:: _static/architecture.svg
   :alt: BehaviorTree.CPP-X 架构图
   :width: 100%

模块边界
--------

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - 模块
     - 职责
     - 依赖边界
   * - ``bt_core``
     - 行为树核心、黑板、端口、工厂、XML、插件加载。
     - 零 ROS 依赖。
   * - ``bt_nodes``
     - 内置控制/装饰/动作/条件/数据节点。
     - 只依赖 ``bt_core``。
   * - ``bt_server``
     - HTTP API，给 Web 编辑器加载节点、加载树、导出、tick、run 和查询结构。
     - 运行时加载 ``bt_nodes`` 插件。
   * - ``bt_editor``
     - React 可视化编辑器。
     - 通过 ``/api`` 与 ``bt_server`` 通信。
   * - ``bt_ros2``
     - ROS2 wrapper、topic 输入输出基类、回充示例。
     - 可选构建，核心库不反向依赖 ROS2。
   * - ``tests``
     - GoogleTest 和 mock rclcpp 覆盖非 ROS 行为。
     - 真 ROS2 验证在外部环境执行。

设计原则
--------

* 行为树执行格式保持 XML，兼容 BehaviorTree.CPP/Groot 生态。
* 高频业务优先用函数注册表快速复用，稳定后再沉淀节点类。
* ROS2 消息先进入黑板，决策逻辑尽量保持普通行为树节点。
* 编辑器不硬编码节点端口，而是依赖 ``NodeFactory`` manifest。

HTTP API
--------

当前真实接口：

.. code-block:: text

   GET  /api/health
   GET  /api/nodes
   POST /api/tree/load
   POST /api/tree/validate
   POST /api/tree/format
   GET  /api/tree/export
   POST /api/tree/tick
   POST /api/tree/run
   GET  /api/tree/structure
   GET  /api/trees
   GET  /api/tree/open?name=patrol.xml
   POST /api/tree/save

``/api/trees``、``/api/tree/open`` 和 ``/api/tree/save`` 只能访问 ``BT_TREE_WORKSPACE`` 指向的目录；默认是 ``examples/trees``。服务端拒绝绝对路径、父目录路径和非 ``.xml`` 文件名。
