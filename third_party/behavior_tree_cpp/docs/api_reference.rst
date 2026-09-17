API 参考
========

本页是查询入口，详细契约仍以源码和 ``docs/design/API_CONTRACT.md`` 为准。

NodeFactory
-----------

.. code-block:: cpp

   factory.registerNodeType<T>("RegName");
   factory.createNode("RegName", "instName", config);
   factory.loadPlugin("./build/lib/libbt_nodes.dylib");
   factory.manifests();
   factory.isRegistered("RegName");

Tree
----

.. code-block:: cpp

   bt_core::Tree tree(root, blackboard);
   tree.tickOnce();
   tree.tickWhileRunning();
   tree.halt();
   tree.setStatusCallback(callback);
   tree.nodes();

XML
---

.. code-block:: cpp

   bt_core::XmlParser parser(factory);
   auto tree = parser.loadFromText(xml);
   auto xml_out = parser.writeToText(tree, "MainTree");

HTTP
----

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Endpoint
     - 用途
   * - ``GET /api/health``
     - 健康检查。
   * - ``GET /api/nodes``
     - 获取节点 manifest。
   * - ``POST /api/tree/load``
     - 用 XML 加载当前树。
   * - ``POST /api/tree/validate``
     - 只校验 XML，不替换当前树；成功返回 ``ok`` 和 ``node_count``。
   * - ``POST /api/tree/format``
     - 只解析并格式化 XML，不替换当前树；成功返回 ``ok``、``node_count`` 和 ``xml``。
   * - ``GET /api/tree/export``
     - 导出当前树 XML。
   * - ``POST /api/tree/tick``
     - 执行一拍。
   * - ``POST /api/tree/run``
     - 跑到终态并返回状态变化序列。
   * - ``GET /api/tree/structure``
     - 返回父子结构。
   * - ``GET /api/trees``
     - 列出 workspace 内的 ``.xml`` 树文件。
   * - ``GET /api/tree/open?name=patrol.xml``
     - 读取 workspace 内指定树文件。
   * - ``POST /api/tree/save``
     - 保存 ``{\"name\":\"x.xml\",\"xml\":\"...\"}`` 到 workspace，保存前先解析校验。

文件 API 只接受 workspace 内普通 ``.xml`` 文件名，拒绝绝对路径、子目录和 ``../``。

脚本入口
--------

.. code-block:: bash

   ./scripts/bootstrap.sh
   ./scripts/dev.sh
   ./scripts/build_docs.sh
   ./scripts/build_pages.sh
   ./scripts/test.sh
