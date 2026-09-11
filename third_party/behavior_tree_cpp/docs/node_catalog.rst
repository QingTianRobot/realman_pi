节点目录
========

bt_nodes
--------

``bt_nodes`` 是开箱即用的动态插件，构建产物位于 ``build/lib/libbt_nodes.*``，
由 ``NodeFactory::loadPlugin`` 加载。``bt_nodes/register_nodes.cpp`` 当前注册 25 个
节点。下表中的端口均为 input；``无`` 表示节点没有端口。XML 片段需要放在
``<root><BehaviorTree>...</BehaviorTree></root>`` 中运行。

.. list-table:: 25 个内置节点完整契约
   :header-rows: 1
   :widths: 12 9 18 25 20 16

   * - 注册名
     - 类型
     - 端口（类型=默认）
     - 状态转换
     - 失败与边界
     - 最小 XML / 源码
   * - ``Sequence``
     - Control
     - 无
     - 空节点成功；子节点成功后推进，运行时保留游标；全部成功后复位并成功。
     - 任一子节点失败或 tick 后为 ``IDLE`` 时 halt 子树、复位并失败。
     - ``<Sequence><AlwaysSuccess/></Sequence>``

       ``bt_nodes/control/sequence_node.hpp``
   * - ``Fallback``
     - Control
     - 无
     - 从当前游标尝试；失败/``IDLE`` 后推进，运行时保留游标；首个成功时 halt、复位并成功。
     - 空节点或全部候选失败/``IDLE`` 时失败。
     - ``<Fallback><AlwaysFailure/><AlwaysSuccess/></Fallback>``

       ``bt_nodes/control/fallback_node.hpp``
   * - ``Parallel``
     - Control
     - ``success_count:int=-1``；``failure_count:int=1``
     - 每拍 tick 未终结子节点；先判断成功阈值，再判断失败阈值或剩余节点已无法满足成功阈值，否则运行。
     - 空节点成功；``IDLE`` 子节点保持未决。成功与失败阈值同时满足时成功优先。
     - ``<Parallel success_count="1" failure_count="1"><AlwaysSuccess/><AlwaysFailure/></Parallel>``

       ``bt_nodes/control/parallel_node.hpp``
   * - ``Inverter``
     - Decorator
     - 无
     - 子节点 ``SUCCESS→FAILURE``、``FAILURE→SUCCESS``、``RUNNING→RUNNING``。
     - 子节点为 ``IDLE`` 时失败；严格 XML 要求恰好一个子节点。
     - ``<Inverter><AlwaysFailure/></Inverter>``

       ``bt_nodes/decorator/inverter_node.hpp``
   * - ``Retry``
     - Decorator
     - ``num_attempts:int=1``
     - 成功时复位并成功；运行时透传；失败后未耗尽则 halt 子节点并运行，耗尽后复位并失败。
     - 无子节点、``IDLE`` 或尝试耗尽时失败；负数表示无限重试，``0`` 仍执行一次。
     - ``<Retry num_attempts="3"><AlwaysFailure/></Retry>``

       ``bt_nodes/decorator/retry_node.hpp``
   * - ``Repeat``
     - Decorator
     - ``num_cycles:int=1``
     - 子节点成功后计数；未达次数则 halt 并运行，达到次数后复位并成功；运行时透传。
     - 无子节点、失败或 ``IDLE`` 时失败；负数表示无限重复，``0`` 仍执行一次。
     - ``<Repeat num_cycles="2"><AlwaysSuccess/></Repeat>``

       ``bt_nodes/decorator/repeat_node.hpp``
   * - ``ForceSuccess``
     - Decorator
     - 无
     - 子节点运行时透传；其他状态转为成功。
     - 自身不产生失败；严格 XML 仍要求恰好一个子节点。
     - ``<ForceSuccess><AlwaysFailure/></ForceSuccess>``

       ``bt_nodes/decorator/force_success_node.hpp``
   * - ``ForceFailure``
     - Decorator
     - 无
     - 子节点运行时透传；其他状态转为失败。
     - 子节点终结或 ``IDLE`` 时失败；严格 XML 要求恰好一个子节点。
     - ``<ForceFailure><AlwaysSuccess/></ForceFailure>``

       ``bt_nodes/decorator/force_failure_node.hpp``
   * - ``AlwaysSuccess``
     - Condition
     - 无
     - 每拍直接成功，永不运行。
     - 无失败路径。
     - ``<AlwaysSuccess/>``

       ``bt_nodes/action/always_success_node.hpp``
   * - ``AlwaysFailure``
     - Condition
     - 无
     - 每拍直接失败，永不运行。
     - 恒失败。
     - ``<AlwaysFailure/>``

       ``bt_nodes/action/always_failure_node.hpp``
   * - ``PrintMessage``
     - Action
     - ``message:string="hello bt"``
     - 输出 ``[PrintMessage] <message>`` 后成功。
     - 无失败路径。
     - ``<PrintMessage message="hello"/>``

       ``bt_nodes/action/print_message_node.hpp``
   * - ``SetBlackboard``
     - Action
     - ``value:string=""``；``output_key:string=""``
     - 把字符串 ``value`` 写入 ``output_key`` 指定的黑板键后成功。
     - ``output_key`` 为空时失败。
     - ``<SetBlackboard value="42" output_key="score"/>``

       ``bt_nodes/data/set_blackboard_node.hpp``
   * - ``CompareBlackboard``
     - Condition
     - ``key:string=""``；``op:string="=="``；``value:string=""``
     - 双方都可转 ``double`` 时数值比较，否则字符串比较；成立成功。
     - 空 key、键缺失、类型或运算符不支持、比较不成立时失败。运算符：``== != < <= > >=``。
     - ``<CompareBlackboard key="score" op="&gt;=" value="60"/>``

       ``bt_nodes/data/compare_blackboard_node.hpp``
   * - ``CheckBool``
     - Condition
     - ``key:string=""``；``expected:bool=true``
     - 读取 bool；字符串仅 ``true``/``1`` 为真，实际值等于期望时成功。
     - 空 key、键缺失或不等于期望时失败；其他受支持值按假处理。
     - ``<CheckBool key="is_ready" expected="true"/>``

       ``bt_nodes/data/check_bool_node.hpp``
   * - ``Counter``
     - Action
     - ``key:string=""``；``step:int=1``
     - 当前值转为数值并截断为 int，加 ``step`` 后写回；缺失或不可解析时从 0 开始。
     - ``key`` 为空时失败。
     - ``<Counter key="tick_count" step="1"/>``

       ``bt_nodes/data/counter_node.hpp``
   * - ``CooldownCondition``
     - Condition
     - ``cooldown_ms:int=1000``
     - 首拍成功并记时；冷却期内失败；到期成功并刷新。``<=0`` 时恒成功。
     - 唯一正常失败是未到期；普通 halt 不清除内部时间戳。
     - ``<CooldownCondition cooldown_ms="500"/>``

       ``bt_nodes/data/cooldown_condition_node.hpp``
   * - ``SetBool``
     - Action
     - ``key:string=""``；``value:bool=true``
     - 把真正的 bool 写入指定黑板键后成功。
     - ``key`` 为空时失败。
     - ``<SetBool key="is_ready" value="true"/>``

       ``bt_nodes/data/set_bool_node.hpp``
   * - ``BlackboardExists``
     - Condition
     - ``key:string=""``
     - 只检查键存在性，不检查类型或值；存在时成功。
     - 空 key、黑板为空或键不存在时失败。
     - ``<BlackboardExists key="target_pose"/>``

       ``bt_nodes/data/blackboard_exists_condition_node.hpp``
   * - ``ClearBlackboard``
     - Action
     - ``key:string=""``
     - 删除指定键；键不存在也幂等成功。
     - 空 key 或黑板为空时失败。
     - ``<ClearBlackboard key="target_pose"/>``

       ``bt_nodes/data/clear_blackboard_node.hpp``
   * - ``ScalarThreshold``
     - Condition
     - ``key:string=""``；``op:string=">="``；``value:double=0``
     - 把黑板值解析为 double 并比较；成立时成功。
     - 空/缺失 key、值不可解析、类型或运算符不支持、比较不成立时失败。运算符：``> >= < <= == !=``。
     - ``<ScalarThreshold key="battery_level" op="&lt;" value="0.2"/>``

       ``bt_nodes/data/scalar_threshold_condition_node.hpp``
   * - ``Delay``
     - Action
     - ``delay_ms:int=1000``
     - 正数时首拍记时并运行，到期成功后复位；``<=0`` 首拍成功。halt 复位计时。
     - 无失败路径。
     - ``<Delay delay_ms="500"/>``

       ``bt_nodes/timer/delay_node.hpp``
   * - ``WaitUntilElapsed``
     - Condition
     - ``duration_ms:int=1000``
     - 首拍记录永久起点；到时前失败，到时后持续成功；``<=0`` 立即且持续成功。
     - 未到期时失败；普通 halt 不重置内部起点。
     - ``<WaitUntilElapsed duration_ms="2000"/>``

       ``bt_nodes/timer/wait_until_elapsed_condition_node.hpp``
   * - ``LogEvent``
     - Action
     - ``message:string=""``；``level:string="info"``
     - 输出 ``[INFO|WARN|ERROR] message``；error 走 stderr，其余走 stdout，随后成功。
     - 无失败路径；非法或空 level 回退为 info。枚举：``info warn error``。
     - ``<LogEvent message="battery low" level="warn"/>``

       ``bt_nodes/diagnostic/log_event_node.hpp``
   * - ``FunctionAction``
     - Action
     - ``function:string=""``；``input:string=""``；``output_key:string=""``
     - 调用单例注册表中的 Action 回调并原样返回其状态，包括 ``RUNNING``。
     - 空/未知函数或回调失败时失败；回调异常向外传播。
     - ``<FunctionAction function="robot.start" input="dock"/>``

       ``bt_nodes/function/function_registry.*``
   * - ``FunctionCondition``
     - Condition
     - ``function:string=""``；``input:string=""``；``output_key:string=""``
     - 调用 Condition 回调；true 映射为成功，false 映射为失败。
     - 空/未知函数、回调为 false 时失败；回调异常向外传播。
     - ``<FunctionCondition function="robot.ready"/>``

       ``bt_nodes/function/function_registry.*``

.. note::

   严格 XML 只接受节点 ``providedPorts()`` 中声明的属性；``name`` 是保留实例名。
   枚举 metadata 用于编辑器控件，运行时仍由节点实现处理非法值。字面量保存在节点
   自己的 ``port_values``，只有 ``{key}`` 重映射访问共享黑板。

bt_ros2
-------

ROS2 executor 默认注册 35 种节点：上述 bt_nodes 25 种、ROS topic 2 种、ROS data
4 种、recharge 4 种。完整清单以 ``bt_ros2/README.md`` 和
``bt_ros2/src/node_registration.cpp`` 为准。

.. list-table:: ROS2 数据与回充节点
   :header-rows: 1
   :widths: 24 30 46

   * - 节点
     - 消息类型
     - 作用
   * - ``ReadBattery``
     - ``sensor_msgs/msg/BatteryState``
     - 把 ``percentage`` 写入黑板；订阅支持 ``qos_profile``。
   * - ``ReadScalar``
     - ``std_msgs/msg/Float64``
     - 把 ``data`` 写入黑板。
   * - ``IsFlagTrue``
     - ``std_msgs/msg/Bool``
     - ``data=true`` 时成功。
   * - ``IsObstacleClose``
     - ``sensor_msgs/msg/Range``
     - ``range<threshold`` 时成功。
   * - ``RechargeTask``
     - ``std_msgs/msg/String`` + ``std_msgs/msg/Bool``
     - 每次尝试发布一条回充命令，跨 tick 等待 dock，支持超时、终态锁存和 halt/retry。
   * - ``TaskDoneNotifier``
     - ``std_msgs/msg/String``
     - 发布任务完成消息；可用 ``subscriber_wait_timeout_ms`` 等待观察者。
   * - ``IsDocked``
     - ``std_msgs/msg/Bool``
     - 旧 XML 兼容用对接条件。
   * - ``PublishRechargeCommand``
     - ``std_msgs/msg/String``
     - 旧 XML 兼容用一次性发布节点。

打包的 ``bt_ros2/trees/recharge.xml`` 使用完整 ``RechargeTask``，不再用
``CooldownCondition + PublishRechargeCommand + IsDocked`` 编排。详见
:doc:`ros2_recharge_tutorial`。
