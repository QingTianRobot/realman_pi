# 状态查询与系统配置

## 1. 机械臂状态

`ArmState` 提供当前位姿和关节角、单关节温度/电流/电压、完整状态、初始位姿以及控制器/工具端 RS485 模式查询。常用接口包括：

```text
rm_get_current_arm_state()
rm_get_joint_degree()
rm_get_arm_all_state()
rm_get_current_joint_temperature()
rm_get_current_joint_current()
rm_get_current_joint_voltage()
rm_set_init_pose() / rm_get_init_pose()
rm_get_controller_rs485_mode() / rm_get_tool_rs485_mode()
```

`rm_current_arm_state_t` 由 `pose`、`joint` 和 `err` 组成；`rm_arm_all_state_t` 包含关节电流、使能、温度、电压和错误码数组。关节角单位为度，电流为 mA，温度为摄氏度，电压为 V。

## 2. 控制器配置

`ControllerConfig` 可查询控制器状态、开关机械臂电源、读写系统累计运行时间、读写关节累计转动角度、获取软件信息、设置有线网口 IP 以及清除系统错误。设置网络 IP 后通常需要重新确认连接地址，不能继续假设旧 IP 有效。

`InstallPos` 用于设置/查询安装方式参数，也可读取关节和末端接口板软件版本。安装姿态会影响算法和安全判断，改动后要重新核对坐标系和限位。

## 3. 关节参数

`JointConfigSettings` 负责写入关节速度、加速度、位置限位、驱动器限位、使能、零位和错误清除；`JointConfigReader` 提供对应的读取接口。两组接口应成对使用：修改后立即回读并保存返回值，以确认控制器接受了参数。

API 同时提供通用限位接口 `rm_auto_set_joint_limit()`，以及算法侧的关节最大/最小限位和速度/加速度设置。涉及真实硬件时，限位值不能只根据软件默认值推断，应以具体型号和机械安装条件为准。

## 4. 网络与系统 IO

`CommunicationConfig` 覆盖 WiFi AP/STA/关闭、控制器 RS485 波特率、有线/无线网卡查询和网络恢复出厂设置。网络恢复操作会影响当前连接，应在维护窗口执行。

`ControllerIOConfig` 覆盖控制器 IO 模式、数字输出、单路/全部输入输出查询和电源输出；`EffectorIOConfig` 覆盖工具端数字 IO 模式/输出和工具端电源输出。控制器 IO 与工具端 IO 是不同物理位置，调用前先确认端口和电平含义。

## 5. 运动参数与碰撞保护

`ArmTipVelocityParameters` 可以设置/查询末端线速度、线加速度、角速度和角加速度，恢复 TCP 默认参数，设置碰撞检测和碰撞防护等级，以及设置/查询 DH 参数和避奇异模式。速度上限、碰撞等级和 DH 参数属于运动安全配置，修改后要重新验证。

官方来源：[机械臂状态](https://develop.realman-robotics.com/robot/apipython/classes/armState/)、[系统配置](https://develop.realman-robotics.com/robot/apipython/classes/controllerConfig/)、[关节配置](https://develop.realman-robotics.com/robot/apipython/classes/jointsConfig/)、[关节配置查询](https://develop.realman-robotics.com/robot/apipython/classes/jointsConfigQuery/)、[通讯配置](https://develop.realman-robotics.com/robot/apipython/classes/communicationConfig/)、[控制器 IO](https://develop.realman-robotics.com/robot/apipython/classes/controllerIOConfig/)、[工具端 IO](https://develop.realman-robotics.com/robot/apipython/classes/effectorIOConfig/)、[安装方式](https://develop.realman-robotics.com/robot/apipython/classes/installPos/)、[末端速度参数](https://develop.realman-robotics.com/robot/apipython/classes/tipVelocityParameters/)。
