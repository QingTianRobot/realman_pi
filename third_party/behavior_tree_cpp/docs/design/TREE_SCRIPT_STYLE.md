# 行为树脚本风格规范

这份规范约束 BehaviorTree.CPP-X 的 XML 写法。目标不是发明新 DSL，而是在兼容 BehaviorTree.CPP/Groot 的前提下，让脚本能被编辑器、后端 formatter、示例程序和人工 review 稳定使用。

## 1. 文件结构

每个可执行 XML 都保持这个外壳：

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <!-- one root node here -->
  </BehaviorTree>
</root>
```

规则：

- `main_tree_to_execute` 必须指向真实存在的 `BehaviorTree ID`。
- 一个 `BehaviorTree` 内只放一个根节点。
- 复杂逻辑拆成多个 `BehaviorTree ID`，主树用 `<SubTree ID="..."/>` 引用。
- 默认主树建议叫 `MainTree`；业务示例可以使用更明确的名字，例如 `RechargeTree`。

## 2. 命名规范

节点实例名用 `name` 表达业务意图，避免只保留注册名。

推荐：

```xml
<Sequence name="recharge_flow">
  <CompareBlackboard name="needs_recharge" key="battery_level" op="&lt;" value="0.20"/>
  <PrintMessage name="send_recharge_log" message="battery low"/>
</Sequence>
```

避免：

```xml
<Sequence>
  <CompareBlackboard/>
  <PrintMessage/>
</Sequence>
```

命名规则：

- `name` 使用小写蛇形：`battery_guard`、`send_recharge_command`。
- 黑板 key 使用小写蛇形：`battery_level`、`needs_recharge`。
- 子树 ID 使用 PascalCase：`StartupChecks`、`RechargeFlow`。
- topic 和外部接口名称保持系统原名，不强行改大小写。

## 3. 端口和值

XML 属性分两类：

```xml
<PrintMessage message="hello"/>
<PrintMessage message="{operator_message}"/>
```

- 字面量：`message="hello"`，值只属于当前节点端口。
- 黑板重映射：`message="{operator_message}"`，运行时从黑板 key `operator_message` 读取。

建议：

- 需要跨节点共享的数据写入黑板，再用 `{key}` 读取。
- 一次性配置值直接写字面量，例如阈值 `value="0.20"`。
- 布尔值写 `true`/`false`，数值阈值写十进制字符串。
- XML 特殊字符必须转义：`<` 写 `&lt;`，`>` 写 `&gt;`，`&` 写 `&amp;`。

## 4. 控制流组织

- `Sequence` 用于“必须全部成功”的主路径。
- `Fallback` 用于“优先尝试，失败后降级”的选择逻辑。
- `Decorator` 节点只允许一个子节点。
- 叶子节点不要放子节点；这会被解析器或编辑器连线规则拦截。
- 大树按阶段拆子树：`StartupChecks`、`MissionLoop`、`RecoveryFlow`、`ShutdownNotify`。

## 5. 示例树

仓库内置三个可直接运行的脚本：

- `examples/trees/minimal_sequence_fallback.xml`：最小 Sequence/Fallback 控制流。
- `examples/trees/blackboard_data_flow.xml`：黑板写入、数值比较、布尔判断。
- `examples/trees/subtree_reuse.xml`：多个 `BehaviorTree ID` 和 `<SubTree/>` 复用。

运行方式：

```bash
./build/bin/example_load_xml ./build/lib/libbt_nodes.dylib examples/trees/blackboard_data_flow.xml
```

Linux 下插件路径通常是 `./build/lib/libbt_nodes.so`。

## 6. 格式化稳定性

`bt_server` 的 `/api/tree/format` 和 `/api/tree/export` 都走 `bt_core::XmlParser::writeToText`。验收标准：

- 同一棵树多次 `format` 输出应完全一致。
- `load -> export -> load -> export` 不应改变节点 DFS 顺序、实例名、字面量端口和 `{blackboard_key}` 重映射。
- 编辑器导出同一父节点的子节点时，按画布从左到右的稳定顺序输出。

`./scripts/test.sh` 会运行新增示例并在真实 server API 集成阶段检查 formatter 幂等。
