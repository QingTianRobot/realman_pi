# RealMan 行为树控制权与工业任务编排设计

## 1. 目标与范围

本设计把行为树引入 `realman_pi`，用于：

1. 在 Web、policy server、遥操设备之间安全切换机械臂控制权；
2. 通过 XML `Sequence` / `Fallback` / `Retry` / `SubTree` 编排工业任务；
3. 在不连接真机的情况下，用确定性的 ROS2 mock 节点单独验证行为树；
4. 在 Docker 中提供参考 `behavior_tree_cpp` 的核心库、节点库、ROS2 wrapper、HTTP server 和网页编辑器。

第一阶段不替换现有 RealMan 驱动和 `motion_coordinator`。行为树及仲裁层通过现有 ROS2 Action/Topic/Service 接口调用底层能力。

## 2. 已确认的关键决策

- 支持机械臂运行中的动态控制模式切换。
- 切换采用“请求即进入切换流程，先安全停权，再激活新后端”的抢占式策略；不允许直接替换正在执行的运动命令源。
- 行为树负责任务编排和控制权流程；急停、碰撞保护、驱动 lockout 仍由底层安全/驱动层负责。
- 控制模式使用固定枚举：`none`、`web`、`policy`、`teleop`。
- 所有模式和动作后端通过统一的控制权仲裁层接入，旧 owner 的命令在切换后失效。
- XML 是执行格式；网页编辑器负责加载、校验、布局、tick/run 和节点状态回放。

## 3. 目标架构

```text
Web / Policy Server / Teleop Device
              │  request mode + lease
              ▼
      control_mode_arbiter
              │ 唯一 active owner/epoch
              ▼
      motion_coordinator / RealMan Action
              ▲
              │ Action/Topic adapter
       realman_bt_executor
       ├─ ControlModeSupervisor
       ├─ Task SubTrees
       └─ industrial action nodes

bt_editor ──HTTP/WS── bt_server ──C++ API── bt_core/bt_nodes
```

### 3.1 包与源码边界

| 包/目录 | 责任 |
| --- | --- |
| `third_party/behavior_tree_cpp` | 参考项目的可复现源码快照；至少包含 `bt_core`、`bt_nodes`、`bt_ros2`、`bt_server` 依赖和编辑器构建所需资源 |
| `src/behavior/realman_bt` | RealMan 专属行为树节点、执行器 launch、树 XML、控制权 ROS 接口适配 |
| `src/behavior/realman_bt_mock` | 仅测试/仿真的 mock world、mock backend、mock action server、命令记录器 |
| `src/driver/realman_msgs` | 控制模式、控制权状态、切换 Action/Service 等类型化 ROS 接口 |
| `src/realman_bringup` | 生产启动编排；通过参数决定是否启动行为树和仲裁层 |
| `config/ros/behavior_tree.yaml` | 权威行为树路径、tick 频率、切换超时、lease、mock 场景参数 |
| `config/docker/ros2-humble-rviz.Dockerfile` | 构建行为树依赖和工作区包 |
| `config/docker/compose.yaml` | 行为树执行、mock 测试、HTTP server/editor 的服务入口 |

`bt_core` 保持零 ROS 依赖；RealMan 节点只在 `realman_bt` 中实现；mock 包不进入生产启动图，也不拥有真实运动命令写权限。

## 4. 控制权契约

### 4.1 模式与 owner

新增类型化接口（放入 `realman_msgs`）：

- `ControlMode.msg`：模式枚举、`owner_id`、`epoch`、时间戳；
- `ControlModeRequest.msg`：请求模式、请求 owner、原因、超时；
- `ControlModeState.msg`：当前/目标模式、切换阶段、owner、epoch、健康状态、失败原因；
- `SwitchControlMode.action`：异步切换的 goal/result/feedback；
- `RequestControlMode.srv`：面向 Web 或脚本的简化请求入口。

模式切换阶段固定为：

```text
REQUESTED → STOPPING_CURRENT → CANCELING_MOTION → VERIFYING_SAFE
          → ACTIVATING_BACKEND → CONFIRMING_LEASE → ACTIVE
```

失败进入 `FAILED`，并回退到 `none` 或配置的安全模式。每次成功切换 `epoch` 递增；运动命令必须携带当前 epoch，仲裁层拒绝旧 epoch 和非 owner 命令。

### 4.2 行为树节点

第一阶段实现以下节点，全部使用参考库的 manifest/port 机制：

- `SelectControlMode`：读取请求并校验固定枚举，写入黑板；未知模式立即 `FAILURE`；
- `SwitchControlMode`：调用切换 Action，首拍发送 goal，后续 tick 等 feedback/result，`halt()` 取消 goal；
- `ControlLeaseGuard`：确认当前 owner、epoch 和 lease 未过期；
- `ExecuteMotion`：调用现有 `ExecuteMotion` Action，支持 timeout、cancel、结果映射；
- `ExecuteTrajectory`：调用现有 `ExecuteTrajectory` Action，支持 waypoint 策略和结果映射；
- `CheckSafetyState`：读取驱动/安全状态，只做准入判断，不替代底层保护；
- `RecordTaskFailure`：把结构化 `failure_code`、`stage`、`attempt`、`retryable` 写入黑板并发布诊断事件。

控制模式入口树：

```xml
<Sequence name="control_mode_sequence">
  <SelectControlMode requested_mode="{requested_mode}"
                     selected_mode="{selected_mode}"/>
  <SwitchControlMode mode="{selected_mode}"
                     owner_id="{requested_owner}"
                     timeout_ms="{switch_timeout_ms}"/>
  <ControlLeaseGuard mode="{selected_mode}"/>
</Sequence>
```

模式运行期间由 `ControlModeSupervisor` 监督请求变化；收到新请求时 halt 当前任务子树，执行安全切换，再重新进入目标子树。不能依赖普通 `Sequence` 自动重新执行第一个叶节点。

## 5. 工业任务编排契约

复杂任务拆分为可复用 `SubTree`：

- `PickTask`：准入、接近、抓取、验证、失败恢复；
- `ApproachAndGrasp`：多角度/多姿态候选策略；
- `PlaceTask`：放置、释放、结果确认；
- `RecoveryTask`：退回安全位、重新扫描、清理黑板、释放控制权。

推荐模式：

```xml
<Fallback name="grasp_strategies">
  <Sequence name="top_view">
    <SetBlackboard key="viewpoint" value="top"/>
    <ExecuteMotion name="move_to_view"/>
    <DetectObject/>
    <ExecuteGrasp/>
    <VerifyGrasp/>
  </Sequence>
  <Sequence name="side_view">
    <SetBlackboard key="viewpoint" value="side"/>
    <ExecuteMotion name="move_to_view"/>
    <DetectObject/>
    <ExecuteGrasp/>
    <VerifyGrasp/>
  </Sequence>
</Fallback>
```

重试必须区分：

- 可重试失败：目标丢失、抓取未闭合、置信度不足；
- 换策略失败：改变 viewpoint、末端姿态、速度或扫描策略；
- 不可重试失败：急停、碰撞、越限、通信中断、驱动 lockout。

所有长耗时节点必须：首拍启动 Action 并返回 `RUNNING`；后续 tick 读取反馈；超时取消；`halt()` 取消未完成 goal；终态锁存；在黑板写入结构化失败信息。非幂等物理动作不得被无条件重试。

## 6. Mock 节点与隔离规则

`realman_bt_mock` 参考 `golf-course-robot` 的 mock world/action server 组织，但所有资源使用 `/realman/mock/*` 命名空间，避免与生产 owner 冲突。

### 6.1 MockControlModeSourceNode

- 发布或服务设置待切换模式、owner、epoch 场景；
- 支持 `web`、`policy`、`teleop`、`none`；
- 支持在运动执行中注入模式切换请求；
- 提供原子 mock-facts service，非法模式/owner/超时值保持旧状态；
- 不发布生产控制命令。

### 6.2 MockControlBackendNode

- 模拟三个后端的 `start/update/stop/health` 生命周期；
- 参数控制启动延迟、lease 过期、健康失败、切换拒绝；
- 仅发布 mock namespace 下的状态和事件。

### 6.3 MockMotionActionServerNode

- 提供与 `ExecuteMotion`、`ExecuteTrajectory` 相同 IDL 的 Action server；
- 支持 `success`、`reject`、`timeout`、`blocked`、`safety_blocked`、`cancel`；
- 发布确定性 feedback 和结果，不写 RealMan SDK/CAN。

### 6.4 MotionCommandRecorderNode

- 只订阅行为树/仲裁层输出；
- 记录 owner、epoch、mode、动作类型、序号、时间和结果到 JSONL；
- 用于断言旧 owner 命令被拒绝、切换只产生一个有效 owner，以及重试没有重复发送非幂等动作。

### 6.5 Mock launch

新增 `realman_bt_mock/launch/behavior_tree_mock.launch.py`，默认启动：

```text
MockControlModeSourceNode
MockControlBackendNode
MockMotionActionServerNode
realman_bt_executor
control_mode_arbiter
MotionCommandRecorderNode
bt_server（可选）
```

参数包括 `tree_file`、`action_result_mode`、`motion_duration_sec`、`switch_result_mode`、`record_file`、`ros_domain_id`。

## 7. 独立行为树测试方法

提供不依赖真机的四级测试入口：

1. **纯核心测试**：`bt_core`/节点状态机/失败分类/重试策略，使用 GoogleTest，不需要 ROS2。
2. **ROS mock 单树测试**：启动 mock launch，使用 `ros2 service/topic/action` 注入模式、切换和动作结果，断言树状态、lease 和 JSONL 记录。
3. **HTTP 可视化测试**：启动 `bt_server` 和 `bt_editor`，加载同一 XML，执行 validate/format/tick/run，观察节点颜色和时间线。
4. **集成回归测试**：按场景矩阵自动启动隔离 ROS domain，逐一验证 happy path、动态切换、动作取消、抓取多角度 fallback、可重试失败、不可重试失败、lease 过期和安全锁定。

推荐命令：

```bash
# 仅构建并测试行为树相关包
./rm65 bt-test build

# 启动隔离 mock 图
./rm65 bt-test mock

# 启动网页调试入口
./rm65 bt-test web

# 执行完整 mock 回归矩阵
./rm65 bt-test all
```

每个场景都必须断言：

- 根节点终态和活动节点；
- 当前 mode、owner、epoch；
- 是否调用 cancel/stop；
- Action feedback/result 映射；
- failure code、attempt 和 retryable；
- 记录文件中是否存在越权或重复物理动作。

## 8. Docker 与配置

- 将参考库以 `third_party/behavior_tree_cpp` 的源码快照纳入仓库，并记录上游 commit、许可证和同步方式；不依赖宿主机 `/home/.../Downloads` 路径。
- Docker 构建阶段先构建/安装 `bt_core`、`bt_nodes`、`bt_ros2`，再构建 `realman_bt`、`realman_bt_mock` 和现有驱动包。
- Compose 生产服务只启动 `realman_bt_executor`/仲裁层；mock 服务必须是独立 profile 或独立 service，不进入 `realman_bringup_remote` 默认图。
- 行为树 XML、行为树配置和调试 workspace 均挂载到 `/opt/rm65_ws/config` 或专用只读树目录；ROS 日志继续挂载到宿主 `logs/`。
- 所有新增配置位于根 `config/`，包含模式枚举、默认 tree、tick 频率、切换超时、lease 和 mock 参数注释。

## 9. 可观测性与网页调试

行为树执行器发布：

- 根状态和活动节点；
- 每个节点的状态变化和 tick 序号；
- 当前 mode、owner、epoch、lease 剩余时间；
- 当前 Action phase、progress、API 状态码；
- 最近一次切换/任务失败原因。

`bt_server + bt_editor` 复用参考项目的 HTTP/WS 契约，并在编辑器侧增加控制权和 RealMan Action 面板。网页端的树编辑/调试只影响 mock 或显式指定的执行器，不默认连接生产真机。

## 10. 验收标准

- Humble Docker 镜像能够从干净工作区构建行为树依赖和本项目包；
- 无真机时，mock launch 能运行控制模式 Sequence 和至少一棵抓取重试示例树；
- 动态切换测试证明旧 owner/epoch 命令被拒绝，当前动作被取消且新 owner 激活；
- 抓取失败测试证明 viewpoint fallback、有限重试、不可重试故障 fail-closed；
- `bt_server`/`bt_editor` 能加载 XML、显示节点状态、执行 tick/run 并导出诊断；
- 相关 C++/Python/launch 测试通过，`docker compose config`、`bash -n rm65`、`zsh -n functions.zsh` 和 `website` 构建通过；
- Web 开发者手册新增行为树页面，记录配置、ROS 接口、Docker 服务、mock 场景和独立测试命令。

## 11. 非目标与后续阶段

- 第一阶段不把 policy server 或遥操设备协议直接写入行为树核心；
- 第一阶段不让行为树替代 RealMan 驱动内部安全状态机；
- 第一阶段不在生产环境启用网页任意写树或任意 tick 真机；
- 后续阶段再增加视觉节点、抓取规划、轨迹候选生成、任务 checkpoint、断点恢复和 SROS2 publisher ACL。
