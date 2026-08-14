# 睿尔曼 Python 开发文档整理

本目录是对睿尔曼官方 Python API 文档的中文整理，面向需要用 Python 连接、控制和监控睿尔曼机械臂的开发者。内容按开发任务重新编排，保留官方 API 名称、数据单位、重要范围和使用限制；它不是官方页面的逐字复制。

## 文档范围

- 快速开始：运行环境、安装、导入、连接和资源释放。
- 运动与示教：关节/笛卡尔运动、透传、跟随、暂停停止和示教。
- 状态与配置：机械臂、关节、控制器、网络、安装方式和 IO。
- 坐标与算法：姿态表示、坐标系、正逆运动学、限位和自碰撞。
- 力控与安全：六维力、力位混合控制、电子围栏、虚拟墙和碰撞保护。
- 末端与扩展：夹爪、灵巧手、升降机构、扩展关节和末端生态协议。
- IO 与协议：控制器/工具端 IO、RS485、Modbus RTU/TCP 和 UDP 主动上报。
- 工程管理：在线编程文件、全局路点和完整 API 类型索引。

## 阅读顺序

1. [快速开始](01-getting-started.md)
2. 按任务阅读 [运动与示教](02-motion-and-teaching.md)、[状态与配置](03-state-and-configuration.md) 或 [坐标与算法](04-coordinate-and-algorithm.md)。
3. 涉及接触、碰撞或真实机械臂时，先阅读 [力控与安全](05-force-and-safety.md)。
4. 需要查具体函数时，使用 [API 类与方法索引](10-api-index.md)；需要查返回对象或枚举时，使用 [结构体与枚举](09-types-and-structures.md)。
5. 运行完整示例或定位返回码时，使用 [官方示例、错误码与版本](11-examples-errors-and-versions.md)。

## 官方版本与来源

- 官方文档入口：[机械臂 Python API 快速开始](https://develop.realman-robotics.com/robot/apipython/getStarted/)
- 官方 API 版本：页面显示 `V1.7.13`。
- 调研快照：2026-08-13。
- Python API 安装包与示例仓库：[RealManRobot/RM_API2](https://github.com/RealManRobot/RM_API2)
- 官方 Python 页面根路径：[https://develop.realman-robotics.com/robot/apipython/](https://develop.realman-robotics.com/robot/apipython/)
- 覆盖统计：1 个快速开始页面、30 个功能类（298 个方法章节）、61 个结构体页面和 1 个枚举页面（15 组枚举）。

官方文档和机械臂控制器固件是最终依据。不同机械臂型号、末端硬件、控制器版本可能导致接口可用性和字段略有差异；接入真实设备前应核对对应型号页面和错误码。

`rm_dh_t` 的[结构体页面](https://develop.realman-robotics.com/robot/apipython/struct/dh/)存在于官方 sitemap，但没有出现在当前 Python API 侧栏；本整理已将其补入类型索引。

## 与本项目的关系

本目录只记录睿尔曼 Python 二次开发资料，不改变本项目的 ROS 2 Humble URDF、三臂 TF 或 Docker bringup。若需要在本项目中接入真实 RM65，应将 Python SDK 运行环境、机械臂 IP、端口和安全策略单独配置，并通过 ROS 2 节点桥接业务接口。
