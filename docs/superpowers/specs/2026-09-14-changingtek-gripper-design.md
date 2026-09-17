# Changingtek 夹爪驱动与 Web 控制设计

## 目标

以 `/home/administrator/repo/changingtek_rtu_sdk` 为底层行为参考，完善本仓库的 Changingtek Modbus RTU 夹爪驱动，同时保留现有 ROS 2 service 调用路径，并让 Web control 可以通过 ROS service 安全控制和观察夹爪。

## 分层

### 底层驱动

移植远程仓库的 `changingtek/rtu_psdk.py` 和 `src/gripper_driver.py` 的核心实现，不移植带有导入即连接副作用的示例脚本。`GripperBus` 每个物理串口只创建一个 SDK 实例，以总线锁保护 slave 地址切换和事务；`GripperDevice` 提供运动、批量反馈和参数缓存；`GripperManager` 管理多条总线、设备名称路由和自动重连。

### ROS 2 service façade

新增 manager 节点，从 `config/ros/gripper.yaml` 构建总线和设备。每个设备名称下提供 `/open`、`/close`、`/reset`、`/enable`、`/grasp_check`、`/percentage`、`/calibrate` 服务，并发布位置、速度、电流、力矩到达、报警和连接状态。默认设备名保持 `gripper_left`、`gripper_right`，兼容现有调用者。百分比使用配置的 `min_position`/`max_position`，不在启动时强制做危险的物理限位动作；`calibrate` 服务只在显式启用自动标定配置时执行。

### Web control

扩展现有 WebSocket 协议，增加经过字段校验的 `gripper_command` 消息和 `gripper_state`/`gripper_list` 事件。Web control 节点根据同一份夹爪 YAML 创建 service client 和状态订阅，异步转发命令并返回统一结果。前端增加夹爪选择、百分比滑块、开合/使能/复位按钮及连接、位置、力矩和报警显示；无夹爪配置时区域隐藏。

## 错误与生命周期

- 串口不存在或断开时总线进入 `connected=false`，保留节点和 service，后台按配置周期重连。
- ROS service 在设备未连接、未使能或运动异常时返回 `success=false` 和可读错误；不抛出未处理异常导致节点退出。
- 节点销毁按设备失能、复位、断开顺序清理；状态轮询和运动写入共享同一总线锁。
- Web 协议拒绝未知夹爪、越界百分比、未知命令和过长请求，返回稳定的 `error` 事件。

## 验证

- Fake SDK 单元测试覆盖共享总线、slave 地址切换、批量反馈解析、短写优化、掉线重连和命令路由。
- ROS 节点测试覆盖 YAML 拓扑、service 路径、百分比映射和未连接错误。
- Web 协议测试覆盖命令校验和状态事件转换；前端运行现有 TypeScript/Vite 构建。
- 最终运行 Python 测试、`python -m compileall`、相关 `colcon test`（若 ROS 环境可用）和 `npm run build`。
