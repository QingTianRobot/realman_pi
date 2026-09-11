行为脚本风格
============

BehaviorTree.CPP-X 继续使用兼容 BehaviorTree.CPP/Groot 的 XML 作为执行格式。风格规范的目标是让脚本既能被编辑器稳定生成，也能被人工快速 review。

.. note::

   完整 Markdown 规范见 ``docs/design/TREE_SCRIPT_STYLE.md``。本页提供 Sphinx 文档站里的查询入口。

基本外壳
--------

.. code-block:: xml

   <root main_tree_to_execute="MainTree">
     <BehaviorTree ID="MainTree">
       <Sequence name="root_flow">
         <AlwaysSuccess name="precheck_ok"/>
       </Sequence>
     </BehaviorTree>
   </root>

约束：

* ``main_tree_to_execute`` 指向真实存在的 ``BehaviorTree ID``。
* 一个 ``BehaviorTree`` 内只放一个根节点。
* 复杂逻辑拆成多个 ``BehaviorTree ID``，主树用 ``<SubTree ID="..."/>`` 引用。
* 默认主树使用 ``MainTree``；业务示例可以使用 ``RechargeTree`` 这类明确名字。

命名
----

.. list-table::
   :header-rows: 1
   :widths: 25 35 40

   * - 对象
     - 推荐格式
     - 示例
   * - 节点 ``name``
     - 小写蛇形
     - ``battery_guard``、``send_recharge_command``
   * - 黑板 key
     - 小写蛇形
     - ``battery_level``、``needs_recharge``
   * - 子树 ``ID``
     - PascalCase
     - ``StartupChecks``、``RecoveryFlow``
   * - ROS topic
     - 保留系统原名
     - ``/battery_state``、``/robot/command``

端口值
------

.. code-block:: xml

   <PrintMessage message="hello"/>
   <PrintMessage message="{operator_message}"/>

第一行是字面量端口值，只属于当前节点。第二行是黑板重映射，运行时从 ``operator_message`` 读取。

建议：

* 需要跨节点共享的数据先写黑板，再用 ``{key}`` 读取。
* 一次性配置值直接写字面量，例如阈值 ``value="0.20"``。
* 布尔值写 ``true``/``false``，数值阈值写十进制字符串。
* XML 特殊字符必须转义：``<`` 写 ``&lt;``，``>`` 写 ``&gt;``，``&`` 写 ``&amp;``。

内置示例树
----------

.. list-table::
   :header-rows: 1
   :widths: 35 65

   * - 文件
     - 覆盖场景
   * - ``examples/trees/minimal_sequence_fallback.xml``
     - 最小 ``Sequence`` / ``Fallback`` 控制流。
   * - ``examples/trees/blackboard_data_flow.xml``
     - 黑板写入、数值比较、布尔判断。
   * - ``examples/trees/subtree_reuse.xml``
     - 多个 ``BehaviorTree ID`` 和 ``<SubTree/>`` 复用。

运行：

.. code-block:: bash

   ./build/bin/example_load_xml ./build/lib/libbt_nodes.dylib examples/trees/blackboard_data_flow.xml

Linux 下插件路径通常是 ``./build/lib/libbt_nodes.so``。

格式化稳定性
------------

``bt_server`` 的 ``/api/tree/format`` 和 ``/api/tree/export`` 都走 ``bt_core::XmlParser::writeToText``。验收标准是同一棵树多次 format 输出完全一致，且 ``load -> export -> load -> export`` 不改变 DFS 顺序、实例名、字面量端口和 ``{blackboard_key}`` 重映射。

``./scripts/test.sh`` 会运行新增示例，并在真实 server API 集成阶段检查 formatter 幂等。
