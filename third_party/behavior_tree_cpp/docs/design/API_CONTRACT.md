# bt_core API 契约（已验证，fan-out agent 必读）

> 本文件是 bt_core 已编译验证通过的真实 API。下游模块(bt_nodes/bt_server/bt_ros2/examples)
> 必须严格基于这些签名实现，不要臆造。本文中的所有路径都相对项目根。

## 头文件一览（bt_core/include/bt_core/）
- `node_status.hpp` — `NodeStatus{IDLE,RUNNING,SUCCESS,FAILURE}`、`NodeType{CONTROL,DECORATOR,ACTION,CONDITION}`、`isStatusCompleted()`、`toStr()`
- `blackboard.hpp` — `Blackboard`（`set<T>/get<T>/contains/remove`）、`PortInfo`、`PortsList`、`InputPort<T>/OutputPort<T>/makePorts(...)`
- `tree_node.hpp` — `TreeNode` 基类、`NodeConfig{blackboard, port_remap, port_values}`、`StatusChangeCallback`
- `leaf_node.hpp` — `ActionNode`（可返回 RUNNING，有 `onHalted()`）、`ConditionNode`（只 SUCCESS/FAILURE）
- `control_node.hpp` — `ControlNode`（`addChild/children/childrenCount/haltChildren`）
- `decorator_node.hpp` — `DecoratorNode`（`setChild/child`）
- `node_factory.hpp` — `NodeFactory`、`NodeManifest{registration_name,type,ports}`
- `plugin_register.hpp` — `BT_REGISTER_NODES(factory)` 宏、`BT_PLUGIN_ENTRY_SYMBOL`
- `plugin_loader.hpp` — `PluginLoader`、`loadPluginLibrary()`
- `xml_parser.hpp` — `XmlParser`
- `tree.hpp` — `Tree`

## 写一个自定义节点（Action）
```cpp
#include "bt_core/leaf_node.hpp"
#include "bt_core/plugin_register.hpp"
using namespace bt_core;

class MyAction : public ActionNode {
 public:
  using ActionNode::ActionNode;                 // 继承构造 (std::string, NodeConfig)
  static PortsList providedPorts() {            // XML 可配置端口必须在这里声明
    return makePorts(InputPort<std::string>("msg", "默认值", "说明"));
  }
  NodeStatus tick() override {
    auto v = getInput<std::string>("msg").value_or("x");  // 通过端口读黑板
    setOutput<int>("result", 1);                          // 通过端口写黑板
    return NodeStatus::SUCCESS;
  }
};

BT_REGISTER_NODES(factory) {                    // 插件入口（编译成动态库）
  factory.registerNodeType<MyAction>("MyAction");
}
```

## 关键 API 签名
```cpp
// 工厂
factory.registerNodeType<T>("RegName");          // T 继承 TreeNode；重复注册抛 logic_error
factory.createNode("RegName","instName",cfg);    // 未注册抛 runtime_error；返回 TreeNode::Ptr
factory.loadPlugin("/path/to/bt_plugin");        // 推荐！实际文件后缀随平台；工厂自持句柄
factory.manifests();                             // vector<NodeManifest>，供 /nodes 接口
factory.isRegistered("RegName"); factory.size();

// 控制/装饰节点构建
auto seq = std::dynamic_pointer_cast<ControlNode>(factory.createNode("Sequence","s",cfg));
seq->addChild(child);                            // 控制节点加子节点
deco->setChild(child);                           // 装饰节点设唯一子节点（重复抛 logic_error）

// 树
Tree tree(rootNode, blackboard);
tree.tickOnce();                                 // 执行一拍
tree.tickWhileRunning(1000000);                  // 循环到非 RUNNING；参数为最大迭代数
tree.halt();
tree.setStatusCallback([](uint16_t id, NodeStatus prev, NodeStatus next){...}); // 运行态推送
tree.nodes();                                    // vector<TreeNode::Ptr>，已分配 id
tree.visitNodes([](const TreeNode::Ptr&, int depth){...});  // DFS 遍历

// XML
XmlParser parser(factory);
Tree t = parser.loadFromText(xmlStr);            // 或 loadFromFile(path)
std::string xml = parser.writeToText(t, "MainTree");  // 或 writeToFile(t, path)
```

## XML 格式（BehaviorTree.CPP / Groot 基础结构兼容的严格子集）
```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <Sequence name="root">
      <MyAction msg="hello"/>          <!-- 字面量端口值 -->
      <MoveTo target="{goal}"/>        <!-- {k} = 重映射到黑板 key goal -->
    </Sequence>
  </BehaviorTree>
</root>
```
- 标签名 = 节点注册名（factory 据此实例化）
- `name` 属性 = 实例名（保留属性，非端口）
- 属性值 `"{k}"` → 端口重映射到黑板 key；否则字面量只存入当前节点的 `port_values`，不写共享黑板。
- 严格 XML 校验会拒绝 manifest 中未声明的属性；除保留的 `name` 外，XML 可配置属性必须由节点的 `providedPorts()` 声明。没有 XML 属性的节点仍可省略该函数。
- 多个 `BehaviorTree` 定义必须提供唯一、非空 ID，并显式设置 `main_tree_to_execute`；每个定义都会校验，即使当前未被引用。

## 构建集成
- 顶层 CMake 用 option 控制：`BT_BUILD_NODES/SERVER/ROS2/EXAMPLES/TESTS`
- 下游 target 用 `bt::core` link（已设别名）
- 插件库用 `add_library(foo SHARED ...)`，link `bt::core`

## 已验证事实（exit=0）
1. 基类层 tick/halt/回调正确
2. 工厂注册 + 按名建树 + 黑板数据流
3. 运行时动态库插件 load→register→tick，且**正常退出无段错误**（析构顺序已修）
4. XML 解析+建树+tick+round-trip+字面量保真
5. 当前测试数量以发布验证的 fresh ``ctest`` 输出为准，不在契约文档固化历史计数

## bt_server HTTP API（当前实现）

`bt_server/src/tree_api_service.*` 承载树状态、XML 处理和 workspace 文件访问；`main.cpp` 只负责路由绑定和进程启动。

| Endpoint | 语义 |
|---|---|
| `GET /api/health` | 健康检查 |
| `GET /api/nodes` | 节点 manifest |
| `POST /api/tree/load` | 解析 XML 并替换当前树 |
| `POST /api/tree/validate` | 只解析校验 XML，不替换当前树 |
| `POST /api/tree/format` | 只解析并格式化 XML，不替换当前树 |
| `GET /api/tree/export` | 导出当前树 XML |
| `POST /api/tree/tick` | tick 一拍 |
| `POST /api/tree/run` | 跑到终态并返回状态变化序列 |
| `GET /api/tree/structure` | 返回父子结构 |
| `GET /api/trees` | 列出 workspace 内 `.xml` 树文件 |
| `GET /api/tree/open?name=x.xml` | 打开 workspace 内树文件 |
| `POST /api/tree/save` | 保存 `{name, xml}` 到 workspace，保存前先解析校验 |

文件 API 限制在 `BT_TREE_WORKSPACE` 或默认 `examples/trees`，只接受普通 `.xml` 文件名，拒绝绝对路径、子目录和 `../`。
