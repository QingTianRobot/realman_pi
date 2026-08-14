# 官方示例、错误码与版本

## 1. Python Demo

官方开发站提供 12 个 Python 完整示例。建议先运行基础流程，再按硬件和业务选择其他示例：

| 示例 | 适用内容 |
| --- | --- |
| [基础流程](https://develop.realman-robotics.com/robot/demo/python/simpleProcess/) | 建立连接、查询状态和执行基础控制的起点。 |
| [坐标系](https://develop.realman-robotics.com/robot/demo/python/coordinateSystem/) | 工具坐标系和工作坐标系的设置、切换与使用。 |
| [多机械臂](https://develop.realman-robotics.com/robot/demo/python/doubleRoboticArm/) | 在一个 Python 程序中管理多个机械臂句柄。 |
| [力控](https://develop.realman-robotics.com/robot/demo/python/forceControl/) | 六维力读取和力控流程，要求对应传感器硬件。 |
| [夹爪](https://develop.realman-robotics.com/robot/demo/python/gripper/) | 夹爪释放、夹取、位置和状态查询。 |
| [IO 控制](https://develop.realman-robotics.com/robot/demo/python/IOControl/) | 控制器和工具端 IO 的配置与读写。 |
| [升降机构](https://develop.realman-robotics.com/robot/demo/python/lift/) | 升降速度、高度和状态控制。 |
| [Modbus RTU](https://develop.realman-robotics.com/robot/demo/python/modbusRTU/) | 配置 RTU 并读写外设寄存器。 |
| [MoveS](https://develop.realman-robotics.com/robot/demo/python/moves/) | 连续点样条轨迹。至少连续下发三个连接点。 |
| [CANFD 透传](https://develop.realman-robotics.com/robot/demo/python/movejCANFD/) | 高频关节角透传，要求稳定周期和预先规划的平滑轨迹。 |
| [在线编程](https://develop.realman-robotics.com/robot/demo/python/onlineProgram/) | 下发、查询和运行控制器在线编程文件。 |
| [算法接口](https://develop.realman-robotics.com/robot/demo/python/algoInterface/) | 正逆运动学、姿态转换和坐标变换等离线算法。 |

示例代码用于解释接口组合，不代表目标现场的安全参数。运行运动、力控或 IO 示例前，需要替换设备 IP、核对机械臂型号和末端硬件，并降低速度、清空工作区和准备急停。

## 2. API2 通用返回码

| 返回码 | 含义 | 建议处理 |
| --- | --- | --- |
| `0` | 成功。 | 继续处理返回数据。 |
| `1` | 控制器返回错误或拒绝该命令。 | 读取控制器/关节错误状态，检查参数和当前模式。 |
| `-1` | 数据发送失败。 | 检查连接、网络和句柄有效性。 |
| `-2` | 数据接收失败、超时或结果不完整。 | 检查超时、网络和控制器响应，谨慎确认命令是否已执行。 |
| `-3` | 返回数据解析失败。 | 记录原始上下文，核对 SDK 与固件版本。 |
| `-4` | 到位设备与预期不匹配。 | 检查当前规划设备和异步事件关联。 |
| `-5` | 单线程阻塞调用超时。 | 调整合理超时，并单独确认机械臂是否仍在运动。 |
| `-6` | 运动被外部停止。 | 检查停止源和安全状态，不要直接重复下发。 |

来源：[API2 错误代码](https://develop.realman-robotics.com/robot/apierrorList2/)。具体接口还可能返回自身定义的状态码或 `rm_err_t` 错误数组，不能只处理上表。

## 3. SDK、文档和固件版本

当前整理页面显示文档版本 `V1.7.13`，但快速开始页没有固定 `Robotic_Arm` PyPI 包版本。部署时至少记录：

- Python 和 `Robotic_Arm` 包版本。
- 机械臂产品型号和自由度。
- 控制层、规划层、算法库和动力学版本。
- 控制器固件、关节软件和末端接口板版本。
- 末端力传感器、夹爪、灵巧手或 RM Plus 设备版本。

升级前对照[版本变更说明](https://develop.realman-robotics.com/robot/releaseNotes/releaseNotes/)和[历史版本对应关系](https://develop.realman-robotics.com/robot/releaseNotes/versionComparisonTable/)。接口已出现在在线文档中，不等于当前控制器固件一定支持。

## 4. 高频问题检查表

- UDP 无数据：确认三线程模式、目标 IP、端口、上报使能和防火墙。
- 事件回调不可用：单线程模式不支持机械臂事件回调。
- RS485 无法控制机械臂：Modbus RTU 与该端口的机械臂控制模式互斥，先关闭 RTU 模式。
- 轨迹交融无效：`connect=1` 时交融半径才生效。
- MoveS 变成直线：至少连续下发三个 `connect=1` 的点。
- 透传抖动：检查发送周期、网络波动、轨迹连续性、关节限位和奇异位置。
- 电子围栏形状无效：电子围栏仅支持长方体和平面；虚拟墙仅支持长方体和球体，并受示教模式限制。
- RM Plus 接口无效：部分功能需要睿尔曼技术支持提供定制末端固件。
- 力控字段为空：确认机械臂是对应的一维力、六维力或一体化六维力硬件版本。
