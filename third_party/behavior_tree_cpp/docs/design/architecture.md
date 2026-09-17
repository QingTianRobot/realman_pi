# 架构设计文档 — BehaviorTree.CPP-X

> 本文件描述框架的整体架构、核心抽象、模块边界与扩展机制。
> 阅读对象：框架贡献者、需要写自定义节点的使用者。

---

## 1. 设计目标

1. **零 ROS 依赖的核心** —— `bt_core` 只用 C++17 标准库 + 平台 dl API，可嵌入任何 C++ 程序；ROS2 能力以**独立可选包** `bt_ros2` 提供。
2. **插件化节点** —— 节点编译成动态库，运行时加载并自注册；新增/删除节点无需重编主程序。
3. **可视化编辑** —— Web 前端通过 HTTP/WS 与 `bt_server` 通信,枚举节点、编辑连线、导入导出 XML、监控运行态。
4. **易扩展、易维护** —— 清晰的基类层次 + 注册宏,写一个新节点最少只需继承基类 + 一行注册。

---

## 2. 分层架构

```
┌─────────────────────────────────────────────────────────┐
│  bt_editor (React + TS + React Flow)   ← 浏览器           │
└───────────────▲─────────────────────────────────────────┘
                │ HTTP / WebSocket (JSON 控制协议)
┌───────────────┴─────────────────────────────────────────┐
│  bt_server (cpp-httplib)                                  │
│   • GET  /nodes        枚举已注册节点 manifest            │
│   • POST /tree/load    导入 XML → 构建树                  │
│   • GET  /tree/export  导出当前树为 XML                   │
│   • WS   /tick         推送运行时每个节点的 NodeStatus    │
└───────────────▲─────────────────────────────────────────┘
                │ C++ API
┌───────────────┴─────────────────────────────────────────┐
│  bt_core (零 ROS 依赖)                                    │
│   TreeNode / ControlNode / DecoratorNode / LeafNode       │
│   Blackboard  NodeFactory  PluginLoader  Tree  XmlParser  │
└───────────────▲─────────────────────────────────────────┘
                │ 动态加载 (dlopen / LoadLibrary)
┌───────────────┴───────────────┐   ┌──────────────────────┐
│  bt_nodes (内置节点插件 .so)   │   │  bt_ros2 (可选包)     │
│  control/decorator/action     │   │  rclcpp 适配节点      │
└───────────────────────────────┘   └──────────────────────┘
```

**关键边界**：`bt_core` 向上不知道 `bt_server` 的存在,向下不知道具体节点实现,向旁不知道 ROS。所有耦合都通过工厂注册与抽象接口完成。

---

## 3. 核心抽象

### 3.1 NodeStatus —— 节点状态机
```
IDLE     初始/已重置,尚未 tick
RUNNING  正在执行,需要后续继续 tick
SUCCESS  执行成功
FAILURE  执行失败
```
状态转移规则：`tick()` 返回 RUNNING 表示异步未完成;父节点据此决定调度。`halt()` 用于中止正在 RUNNING 的子树并复位为 IDLE。

### 3.2 TreeNode —— 所有节点基类
- `tick()`：纯虚,子类实现具体逻辑,返回 `NodeStatus`。
- `halt()`：中止当前执行(默认复位为 IDLE,控制/装饰节点会递归 halt 子节点)。
- `name() / type()`：用于序列化与可视化展示。
- 持有 `Blackboard` 引用,通过**端口(port)** 读写共享数据。

### 3.3 节点三大族
| 族 | 基类 | 子节点数 | 典型成员 |
|----|------|---------|---------|
| 控制 (Control) | `ControlNode` | N | Sequence, Fallback, Parallel |
| 装饰 (Decorator) | `DecoratorNode` | 1 | Inverter, Retry, Repeat, Timeout |
| 叶子 (Leaf) | `LeafNode` | 0 | Action(动作), Condition(条件) |

> 你需求里的「每个状态以插件形式插入」对应的就是 **Leaf / Action 节点** —— 一个状态 = 一个 Action 节点插件。

### 3.4 Blackboard —— 节点间数据共享
- 类型安全的 KV 存储(`std::any` + 类型校验)。
- 节点通过**端口名**读写,端口名在 XML 里可重映射(port remapping),实现节点复用。

### 3.5 NodeFactory —— 注册与创建
- 维护 `节点名 → 构造函数` 映射。
- 维护 **节点 manifest**(节点名 + 端口描述 + 分类),供 `bt_server /nodes` 接口枚举,前端据此渲染可拖拽的节点面板。
- 提供注册宏 `BT_REGISTER_NODES(factory)`,插件库实现该入口完成自注册。

### 3.6 PluginLoader —— 跨平台动态加载
- 封装 `dlopen/dlsym/dlclose`(POSIX)与 `LoadLibrary/GetProcAddress`(Windows)。
- 加载 `.so/.dll/.dylib` → 查找约定符号 → 调用 `BT_REGISTER_NODES` 完成注册。

### 3.7 Tree —— 树容器
- 持有根节点 + 共享 Blackboard。
- `tickRoot()`：从根执行一轮;`tickWhileRunning()`：循环 tick 直到非 RUNNING。
- 可挂 **观察者(observer)** 回调,每个节点状态变化时通知 → `bt_server` 借此推送 WS 监控数据。

### 3.8 XmlParser —— 序列化
- XML ↔ 内存树双向转换,格式兼容 BehaviorTree.CPP。
- 反序列化时通过 `NodeFactory` 按节点名实例化。

---

## 4. 扩展机制：写一个自定义节点（关键流程）

```cpp
// my_nodes.cpp —— 编译成 libmy_nodes.so
#include "bt_core/leaf_node.hpp"
#include "bt_core/node_factory.hpp"

// 1. 继承 Action 基类
class SayHello : public bt_core::ActionNode {
public:
  using ActionNode::ActionNode;
  // 2. 声明端口（供编辑器枚举 + 黑板读写）
  static bt_core::PortsList providedPorts() {
    return { bt_core::InputPort<std::string>("message") };
  }
  // 3. 实现 tick 逻辑
  bt_core::NodeStatus tick() override {
    auto msg = getInput<std::string>("message").value_or("hello");
    std::cout << msg << std::endl;
    return bt_core::NodeStatus::SUCCESS;
  }
};

// 4. 一行注册（插件入口）
BT_REGISTER_NODES(factory) {
  factory.registerNodeType<SayHello>("SayHello");
}
```
编译为动态库 → `PluginLoader` 运行时加载 → 编辑器面板立即出现 `SayHello` 节点。**全程无需改动 bt_core 或主程序。**

---

## 5. 模块依赖与可选性

| 模块 | 依赖 | 可选 |
|------|------|------|
| `bt_core` | C++17 + tinyxml2 + 平台 dl | 必需 |
| `bt_nodes` | `bt_core` | 内置示例,可替换 |
| `bt_server` | `bt_core` + cpp-httplib | 可选(仅可视化需要) |
| `bt_editor` | Node.js / 浏览器 | 可选(独立前端) |
| `bt_ros2` | `bt_core` + rclcpp | 可选(仅 ROS2 场景) |

通过 CMake option 控制编译：`BT_BUILD_SERVER`、`BT_BUILD_ROS2`、`BT_BUILD_TESTS`。

---

## 6. 待实现顺序
见 `PROJECT_PLAN.md` 的 Phase 1–6。核心地基(Phase 1)优先,因为其余模块全部依赖它。
