# 末端执行器与扩展机构

## 1. 夹爪

`GripperControl` 覆盖夹爪行程设置、释放、普通力控夹取、持续力控夹取、到指定位置和状态查询。`rm_gripper_state_t` 可查询使能、在线状态、错误位、工作模式、当前压力、温度和开口位置。执行夹取后不要只等待固定时间，应结合状态和错误字段确认结果。

## 2. 五指灵巧手

`HandControl` 可按目标手势序列号或动作序列号运行，也可设置各自由度角度、速度和力阈值。手指数量、自由度范围和动作编号依赖具体灵巧手厂商，接入前应从 `RmPlus` 读取设备基础信息和能力。

## 3. 升降与扩展关节

`LiftControl` 支持升降机构速度开环、位置闭环和状态查询；高度通常以 mm 表示，官方结构体给出的范围为 0--2300 mm。`ExpandControl` 支持扩展关节速度环、位置环和状态查询。扩展状态会区分空闲、正/负方向速度运动和正/负方向位置运动。

## 4. 末端生态协议

`RmPlusConfig` 用于设置/查询末端生态协议和触觉传感器模式，读取设备基础/实时信息，读写末端设备寄存器，以及提供灵巧手角度/位置跟随。基础信息包括厂家、设备类型、软硬件版本、自由度、能力开关、位置/角度/速度/力上下限等；实时信息包含系统状态、自由度状态、位置、速度、电流、触觉和力矩。

## 5. 典型接入顺序

1. 查询末端在线状态和基础能力。
2. 确认协议模式、设备类型、自由度和单位。
3. 设置安全的速度/力阈值。
4. 发送一个小范围动作并回读状态。
5. 处理错误位后再进入连续控制。

官方来源：[夹爪](https://develop.realman-robotics.com/robot/apipython/classes/gripperControl/)、[灵巧手](https://develop.realman-robotics.com/robot/apipython/classes/handControl/)、[升降机构](https://develop.realman-robotics.com/robot/apipython/classes/liftControl/)、[扩展关节](https://develop.realman-robotics.com/robot/apipython/classes/expandControl/)、[末端生态协议](https://develop.realman-robotics.com/robot/apipython/classes/rmPlus/)。
