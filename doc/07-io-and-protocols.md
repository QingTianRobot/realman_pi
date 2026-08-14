# IO 与通信协议

## 1. 控制器和工具端 IO

控制器 IO 由 `ControllerIOConfig` 管理：设置 IO 模式、数字输出、查询单路或全部输入/输出，以及控制器电源输出。工具端 IO 由 `EffectorIOConfig` 管理：设置工具端数字输出和 IO 模式、查询模式、设置/读取工具端电源输出。

控制器端口和工具端口不是同一组 IO。初始化时先确认物理端口、输入/输出方向、电压等级和外设共地方式；写输出后回读状态。

## 2. RS485 与 Modbus

`ModbusConfig` 支持：

- 控制器/工具端等通讯端口切换到 Modbus RTU 或关闭 RTU。
- 配置和关闭 Modbus TCP。
- 读线圈、离散量输入、保持寄存器和输入寄存器。
- 写单圈、单寄存器、多寄存器和多圈数据。
- 读取多个线圈、保持寄存器和输入寄存器。

接口参数通常包含端口、设备地址、起始地址和数量，可对应 `rm_peripheral_read_write_params_t`。读写前要确认设备使用的功能码、寄存器地址偏移、字节序和数据缩放规则；这些属于外部设备协议，不应由 SDK 返回值推断。

## 3. UDP 主动上报

`UdpConfig` 提供设置/查询实时推送配置和注册实时状态回调。`rm_realtime_push_config_t` 包含广播周期、目标 IP、端口、是否使能、受力数据坐标系和自定义上报项。周期必须是 5 ms 的倍数。

自定义项 `rm_udp_custom_config_t` 可以分别开关关节速度、升降/扩展状态、机械臂当前状态、灵巧手、Aloha 主臂以及末端生态设备信息；`-1` 表示保持原设置。扩展关节和升降机构上报存在二选一优先级，配置时要确认实际硬件。

回调数据 `rm_realtime_arm_joint_state_t` 包含 IP/端口、关节状态、力传感器、当前位姿、扩展状态、机械臂当前规划状态和末端信息。回调中应尽量快速复制数据，避免执行阻塞业务。

## 4. 网络变更注意事项

设置 WiFi、有线 IP 或恢复网络默认值会影响连接。生产应用应把网络配置作为独立维护操作，成功后重新发现设备并重新建立句柄；不要在运动线程中直接修改网络。

官方来源：[控制器 IO](https://develop.realman-robotics.com/robot/apipython/classes/controllerIOConfig/)、[工具端 IO](https://develop.realman-robotics.com/robot/apipython/classes/effectorIOConfig/)、[Modbus](https://develop.realman-robotics.com/robot/apipython/classes/modbusConfig/)、[UDP](https://develop.realman-robotics.com/robot/apipython/classes/udpConfig/)、[通讯配置](https://develop.realman-robotics.com/robot/apipython/classes/communicationConfig/)。
