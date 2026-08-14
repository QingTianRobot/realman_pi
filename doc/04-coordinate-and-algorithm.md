# 坐标系与算法

## 1. 姿态数据

常用类型关系如下：

```text
rm_pose_t
├── rm_position_t       # x, y, z，单位 m
├── rm_quat_t           # w, x, y, z
└── rm_euler_t          # rx, ry, rz，单位 rad
```

`rm_matrix_t` 是 4x4 浮点矩阵，`rm_frame_t` 还包含坐标系名称、位姿、负载重量和质心位置。官方接口同时支持姿态表示之间转换，使用时应固定一种内部约定，避免欧拉角/四元数顺序混用。

## 2. 工具坐标系与工作坐标系

`ToolCoordinateConfig` 提供六点法设置工具坐标系、手动设置、切换、删除、修改、列表查询、当前坐标系查询和包络参数配置。`WorkCoordinateConfig` 提供三点法设置工作坐标系、手动设置、切换、删除、修改、列表查询和当前坐标系查询。

典型流程是：先建立并回读工具坐标系，再建立工作坐标系，切换当前坐标系，最后用安全姿态验证运动。坐标系名称长度、负载与质心字段应遵循官方结构体限制。

## 3. 算法接口

`Algo` 是内容最多的接口类，涵盖：

- 算法库版本、安装角度、工作/工具坐标系和 DH 参数。
- 关节位置、速度、加速度限位的设置与读取。
- 正运动学、逆运动学、六自由度逆解全解和最优解选择。
- 基坐标系/工作坐标系、末端/工具位姿的互换。
- 欧拉角、四元数、旋转矩阵和位姿的相互转换。
- 环绕运动、工具坐标系运动和位姿增量计算。
- 奇异位形分析、自碰撞检测、工具包络球。
- 遥操作逆解、七轴肘部追踪、关节限位保持和权重配置。

逆运动学参数 `rm_inverse_kinematics_params_t` 使用上一时刻关节角 `q_in`、目标位姿 `q_pose` 和姿态格式 `flag`；`flag=0` 表示四元数，`flag=1` 表示欧拉角。六自由度全解结果可能有多组，需结合当前关节角和限位选择可执行解。目标四元数非法、输入关节为空、超限或无解都应作为失败处理。

## 4. 自碰撞

算法侧 `rm_algo_safety_robot_self_collision_detection()` 用于几何检测；`SelfCollision` 用于设置/查询控制器自碰撞检测使能和手动碰撞解除模式。算法检测和控制器保护属于两层机制，不能用关闭其中一层替代安全验证。

官方来源：[算法接口](https://develop.realman-robotics.com/robot/apipython/classes/algo/)、[工具坐标系](https://develop.realman-robotics.com/robot/apipython/classes/toolCoordinateConfig/)、[工作坐标系](https://develop.realman-robotics.com/robot/apipython/classes/workCoordinateConfig/)、[自碰撞](https://develop.realman-robotics.com/robot/apipython/classes/selfCollision/)。
