# 数据结构与枚举

本页覆盖官方 Python API 的 61 个结构体页面和 15 组枚举。字段表是快速检索摘要；可选值、数组长度、固件要求和构造方法请点击对应官方来源确认。

## 单位约定

- 位置与尺寸通常为 m；升降高度通常为 mm。
- 关节角通常为度，欧拉角为 rad。
- 电流为 mA，电压为 V，温度为摄氏度。
- 力为 N，力矩为 Nm；少数末端设备使用自定义缩放单位，按字段说明处理。


## 基础位姿与坐标

### dh

**机械臂DH参数的结构体 rm_dh_t**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| d | List[float] | unit: m |
| a | List[float] | unit: m |
| alpha | List[float] | unit: ° |
| offset | List[float] | unit: ° |

官方来源：[dh](https://develop.realman-robotics.com/robot/apipython/struct/dh/)。

### euler

**表示欧拉角的结构体 rm_euler_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| rx | float | 绕X轴旋转的角度，单位：rad。 |
| ry | float | 绕Y轴旋转的角度，单位：rad。 |
| rz | float | 绕Z轴旋转的角度，单位：rad。 |

官方来源：[euler](https://develop.realman-robotics.com/robot/apipython/struct/euler/)。

### frame

**表示机械臂位置姿态的结构体 rm_frame_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| frame_name | bytes | 坐标系名称，不超过10个字符（包括结尾的null字节）。 |
| pose | rm_pose_t | 坐标系位姿，包含位置和姿态信息。 |
| payload | float | 坐标系末端负载重量，单位：kg。 |
| x | float | 坐标系末端负载质心位置x轴坐标。 |
| y | float | 坐标系末端负载质心位置y轴坐标。 |
| z | float | 坐标系末端负载质心位置z轴坐标。 |

官方来源：[frame](https://develop.realman-robotics.com/robot/apipython/struct/frame/)。

### frameName

**坐标系名称结构体 rm_frame_name_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| name | str | 坐标系名称，不超过10个字符。 |

官方来源：[frameName](https://develop.realman-robotics.com/robot/apipython/struct/frameName/)。

### matrix

**矩阵结构体 rm_matrix_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| irow | int | 矩阵的行数。 |
| iline | int | 矩阵的列数。 |
| data | List[float] | 矩阵的数据部分，大小为4x4的浮点数矩阵。 |

官方来源：[matrix](https://develop.realman-robotics.com/robot/apipython/struct/matrix/)。

### pose

**表示一个坐标系的结构体 rm_pose_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| position | rm_position_t | 位置，单位：m。 |
| quaternion | rm_quat_t | 四元数。 |
| euler | rm_euler_t | 欧拉角，单位：rad。 |

官方来源：[pose](https://develop.realman-robotics.com/robot/apipython/struct/pose/)。

### position

**位置结构体 rm_position_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| x | float | X轴坐标值，单位：m。 |
| y | float | Y轴坐标值，单位：m。 |
| z | float | Z轴坐标值，单位：m。 |

官方来源：[position](https://develop.realman-robotics.com/robot/apipython/struct/position/)。

### quat

**表示四元数的结构体 rm_quat_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| w | float | 四元数的实部（scalar part），通常用于表示旋转的角度和方向。 |
| x | float | 四元数的虚部中的第一个分量（vector part）。 |
| y | float | 四元数的虚部中的第二个分量。 |
| z | float | 四元数的虚部中的第三个分量。 |

官方来源：[quat](https://develop.realman-robotics.com/robot/apipython/struct/quat/)。


## 连接、型号与版本

### algorithmVersion

**算法库信息的结构体 rm_algorithm_version_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| version | bytes | 版本号。 |

官方来源：[algorithmVersion](https://develop.realman-robotics.com/robot/apipython/struct/algorithmVersion/)。

### armSoftwareVersion

**机械臂软件版本信息的结构体 rm_arm_software_version_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| product_version | bytes | 机械臂型号。 |
| algorithm_info | rm_algorithm_version_t | 算法库信息。 |
| ctrl_info | rm_software_build_info_t | ctrl 层软件信息。 |
| dynamic_info | rm_dynamic_version_t | 动力学版本。 |
| plan_info | rm_software_build_info_t | plan 层软件信息。 |

官方来源：[armSoftwareVersion](https://develop.realman-robotics.com/robot/apipython/struct/armSoftwareVersion/)。

### ctrlVersion

**表示控制器ctrl层软件信息的结构体 rm_ctrl_version_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| build_time | bytes | 编译时间。 |
| version | bytes | 版本号。 |

官方来源：[ctrlVersion](https://develop.realman-robotics.com/robot/apipython/struct/ctrlVersion/)。

### dynamicVersion

**动力学版本信息的结构体 rm_dynamic_version_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| model_version | bytes | 动力学模型版本号。 |

官方来源：[dynamicVersion](https://develop.realman-robotics.com/robot/apipython/struct/dynamicVersion/)。

### planinfo

**控制器plan 层软件信息的结构体 rm_planinfo_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| build_time | bytes | 编译时间。 |
| version | bytes | 版本号。 |

官方来源：[planinfo](https://develop.realman-robotics.com/robot/apipython/struct/planinfo/)。

### robotHandle

**机械臂句柄结构体 rm_robot_handle**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 机械臂的唯一标识符，通过 rm_create_robot_arm 接口可创建机械臂句柄，用于在程序中控制特定的机械臂。 |

官方来源：[robotHandle](https://develop.realman-robotics.com/robot/apipython/struct/robotHandle/)。

### robotInfo

**机械臂基本信息结构体 rm_robot_info_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| arm_dof | int | 机械臂的自由度数量。 |
| arm_model | int | 机械臂型号。 |
| force_type | int | 机械臂末端力控类型。 |

官方来源：[robotInfo](https://develop.realman-robotics.com/robot/apipython/struct/robotInfo/)。

### softwarinfo

**机械臂软件信息 rm_software_build_info_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| build_time | bytes | 编译时间。 |
| version | bytes | 版本号。 |

官方来源：[softwarinfo](https://develop.realman-robotics.com/robot/apipython/struct/softwarinfo/)。

### version

**查询关节软件版本号 rm_version_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| version | char | 关节软件版本号。 |

官方来源：[version](https://develop.realman-robotics.com/robot/apipython/struct/version/)。


## 机械臂与外设状态

### armAllState

**机械臂所有状态参数结构体 rm_arm_all_state_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| joint_current | List[float] | 关节电流，单位mA。 |
| joint_en_flag | List[int] | 关节使能状态。 |
| joint_temperature | List[float] | 关节温度,单位℃。 |
| joint_voltage | List[float] | 关节电压，单位V。 |
| joint_err_code | List[int] | 关节错误码。 |
| err | rm_err_t | 错误代码。 |

官方来源：[armAllState](https://develop.realman-robotics.com/robot/apipython/struct/armAllState/)。

### currentArmState

**机械臂当前状态的结构体 rm_current_arm_state_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| pose | rm_pose_t | 机械臂的当前位姿信息。 |
| joint | List[float] | 机械臂当前关节角度，单位：°。 |
| err | rm_err_t | 错误代码。 |

官方来源：[currentArmState](https://develop.realman-robotics.com/robot/apipython/struct/currentArmState/)。

### err

**错误代码结构体 rm_err_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| err_len | uint8_t | 错误代码个数。 |
| err | int | 错误代码数组,不超过 10 个字节，支持字母、数字、下划线。 |

官方来源：[err](https://develop.realman-robotics.com/robot/apipython/struct/err/)。

### eventPushData

**表示机械臂到位等事件信息的结构体 rm_event_push_data_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| handle_id | int | 机械臂连接id，用于标识特定的机械臂连接。 |
| event_type | rm_event_type_e | 事件类型枚举，表示具体的事件类型：0：无事件；1：当前规划轨迹到位；2：当前在线编程到位。 |
| trajectory_state | bool | 表示已到位规划轨迹的状态，true-成功，false-失败。 |
| device | int | 表示当前已到位规划的设备标识符，用于进一步区分不同类型的设备。0：关节；1：夹爪；2：灵巧手；3：升降机构；4：扩展关节；其他：保留。 |
| trajectory_connect | int | 表示当前已到位规划的轨迹是否连接下一条：0：代表全部到位；1：代表连接下一条轨迹。 |
| program_id | int | 当前到位的在线编程。 |

官方来源：[eventPushData](https://develop.realman-robotics.com/robot/apipython/struct/eventPushData/)。

### expandState

**表示扩展关节状态的结构体 rm_expand_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| pos | int | 扩展关节角度，单位度，精度 0.001°(若为升降机构高度，则s单位：mm，精度：1mm，范围：0 ~2300)。 |
| current | int | 驱动电流，单位：mA，精度：1mA。 |
| err_flag | int | 驱动错误代码，错误代码类型参考关节错误代码。 |
| mode | int | 当前工作状态： 0：空闲； 1：正方向速度运动； 2：正方向位置运动； 3：负方向速度运动； 4：负方向位置运动。 |

官方来源：[expandState](https://develop.realman-robotics.com/robot/apipython/struct/expandState/)。

### gripperState

**夹爪状态结构体 rm_gripper_state_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| enable_state | int | 夹爪使能标志，0表示未使能，1表示使能。 |
| status | int | 夹爪在线状态，0表示离线，1表示在线。 |
| error | int | 夹爪错误信息，低8位表示夹爪内部的错误信息bit5-7 保留bit4 内部通bit3 驱动器bit2 过流 bit1 过温bit0 堵转。 |
| mode | int | 当前工作状态：1 夹爪张开到最大且空闲，2 夹爪闭合到最小且空闲，3 夹爪停止且空闲，4 夹爪正在闭合，5 夹爪正在张开，6 夹爪闭合过程中遇到力控停止。 |
| current_force | int | 夹爪当前的压力，单位g。 |
| temperature | int | 当前温度，单位℃。 |
| actpos | int | 夹爪开口度。 |

官方来源：[gripperState](https://develop.realman-robotics.com/robot/apipython/struct/gripperState/)。

### jointStatus

**机械臂关节状态的结构体 rm_joint_status_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| joint_current | List[float] | 关节电流，单位mA，精度：0.001mA。 |
| joint_en_flag | List[bool] | 当前关节使能状态 ，1为上使能，0为掉使能。 |
| joint_err_code | List[uint16_t] | 当前关节错误码。 |
| joint_position | List[float] | 关节角度，单位°，精度：0.001°。 |
| joint_temperature | List[float] | 当前关节温度，精度0.001℃。 |
| joint_voltage | List[float] | 当前关节电压，精度0.001V。 |
| joint_speed | List[float] | 当前关节速度，精度0.01RPM。 |

官方来源：[jointStatus](https://develop.realman-robotics.com/robot/apipython/struct/jointStatus/)。

### wifiNet

**无线网络信息结构体 rm_wifi_net_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| channel | int | 如果是 AP 模式，则存在此字段，标识 wifi 热点的物理信道号。 |
| ip | str | IP 地址。 |
| mac | str | MAC 地址。 |
| mask | str | 子网掩码。 |
| mode | str | 'ap' 代表热点模式，'sta' 代表联网模式，'off' 代表未开启无线模式。 |
| password | str | 密码。 |
| ssid | str | 网络名称 (SSID)。 |

官方来源：[wifiNet](https://develop.realman-robotics.com/robot/apipython/struct/wifiNet/)。


## 算法与运动

### algoToolEnvelope

**算法包络参数结构体 rm_tool_sphere_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| radius | c_float | 球体半径（单位：m） |
| centrePoint | c_float * int(3) | 球体中心位置（单位：m，以法兰坐标系为参考坐标系） |

官方来源：[algoToolEnvelope](https://develop.realman-robotics.com/robot/apipython/struct/algoToolEnvelope/)。

### algorithmTargetEndEffectorPose

**算法目标末端位姿结构体 rm_Mat_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| row | int | 矩阵有效行数（≤18）。 |
| col | int | 矩阵有效列数（≤18）。 |
| data | float data[18][18] | 18x18浮点数组（存储矩阵数据，超出有效行列的部分默认0）。 |

官方来源：[algorithmTargetEndEffectorPose](https://develop.realman-robotics.com/robot/apipython/struct/algorithmTargetEndEffectorPose/)。

### cartesianvelocitytransparenttransmissionmode

**笛卡尔速度透传模式 rm_movev_canfd_mode_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| cartesian_velocity | float | 笛卡尔速度数组，单位：m/s，rad/s。（数组的前三个元素是线速度，后三个元素是角速度） |
| follow | bool | 是否跟随，表示驱动器的运动跟随效果，true-高跟随，false-低跟随。 |
| trajectory_mode | int | 高跟随模式下支持的模式，0-完全透传模式、1-曲线拟合模式、2-滤波模式。 |
| radio | int | 曲线拟合模式和滤波模式下的平滑系数，（数值越大效果越好），滤波模式下取值范围0~1000，曲线拟合模式下取值范围0~100。 |

官方来源：[cartesianvelocitytransparenttransmissionmode](https://develop.realman-robotics.com/robot/apipython/struct/cartesianvelocitytransparenttransmissionmode/)。

### inverseKinematicsAllSolve

**逆运动学全解参数结构体 rm_inverse_kinematics_all_solve_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| result | int | 逆解求解结果，0：成功，1：逆解失败，-1：上一时刻关节角度输入为空或超关节限位，-2：目标位姿四元数不合法。 |
| num | int | 目标位姿，根据flag的值，可以是位置+四元数或位置+欧拉角，默认为None。 |
| q_ref | List[float] | 参考关节角度，通常是当前关节角度, 单位 °。 |
| q_solve | List[List[float]] | 关节角全解, 8x8 数组, 单位 °。 |

官方来源：[inverseKinematicsAllSolve](https://develop.realman-robotics.com/robot/apipython/struct/inverseKinematicsAllSolve/)。

### inverseKinematicsParams

**逆运动学参数结构体 rm_inverse_kinematics_params_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| q_in | List[float] | 上一时刻关节角度，单位°。 |
| q_pose | List[float] | 目标位姿，根据 flag 的值，可以是位置+四元数或位置+欧拉角。 |
| flag | int | 标志位，0表示使用四元数，1表示使用欧拉角，默认为None。 |

官方来源：[inverseKinematicsParams](https://develop.realman-robotics.com/robot/apipython/struct/inverseKinematicsParams/)。

### multiDragTeach

**复合拖动示教参数结构体 rm_multi_drag_teach_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| free_axes | List[int] | 自由驱动方向[x,y,z,rx,ry,rz]，0-在参考坐标系对应方向轴上不可拖动，1-在参考坐标系对应方向轴上可拖动 |
| frame | int | 参考坐标系，0-工作坐标系 1-工具坐标系。 |
| singular_wall | int | 仅在六维力模式拖动示教中生效，用于指定是否开启拖动奇异墙，0表示关闭拖动奇异墙，1表示开启拖动奇异墙，若无配置参数，默认启动拖动奇异墙 |

官方来源：[multiDragTeach](https://develop.realman-robotics.com/robot/apipython/struct/multiDragTeach/)。


## 力控

### forceData

**六维力传感器数据结构体 rm_force_data_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| force_data | List[float] | 当前力传感器原始数据，力的单位为N；力矩单位为Nm。 |
| zero_force_data | List[float] | 当前力传感器系统外受力数据，力的单位为N；力矩单位为Nm。 |
| work_zero_force_data | List[float] | 当前工作坐标系下系统外受力数据，力的单位为N；力矩单位为Nm。 |
| tool_zero_force_data | List[float] | 当前工具坐标系下系统外受力数据，力的单位为N；力矩单位为Nm。 |

官方来源：[forceData](https://develop.realman-robotics.com/robot/apipython/struct/forceData/)。

### forcePosition

**力位混合控制参数结构体 rm_force_position_t**

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| mode | int | 0-工作坐标系力控，1-工具坐标系力控； |
| sensor | int | 传感器：0-一维力，1-六维力； |
| control_mode | int | 6个方向（Fx Fy Fz Mx My Mz）的模式 0-固定模式 1-浮动模式 2-弹簧模式 3-运动模式 4-力跟踪模式 8-力跟踪+姿态自适应模式（模式8只对工具坐标系的Fz方向有效）； |
| desired_force | int | 力控轴维持的期望力/力矩，力控轴的力控模式为力跟踪模式时，期望力/力矩设置才会生效 ，单位N/Nm。 |
| limit_vel | int | 力控轴的最大线速度和最大角速度限制，只对开启力控方向生效。（x、y、z）轴的最大线速度，单位为m/s，（rx、ry、rz）轴的最大角速度单位为°/s |

官方来源：[forcePosition](https://develop.realman-robotics.com/robot/apipython/struct/forcePosition/)。

### forcePositionMove

**透传力位混合补偿参数 rm_force_position_move_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| flag | int | 0-下发目标角度，1-下发目标位姿 |
| pose | rm_pose_t | 当前坐标系下的目标位姿，支持四元数/欧拉角表示姿态。位置精度：0.001mm，欧拉角表示姿态，姿态精度：0.001rad，四元数方式表示姿态，姿态精度：0.000001 |
| joint | List[float] | 目标关节角度，单位：°，精度：0.001° |
| sensor | int | 传感器，0-一维力；1-六维力 |
| mode | int | 0-基坐标系力控；1-工具坐标系力控； |
| follow | bool | 表示驱动器的运动跟随效果，true 为高跟随，false 为低跟随。 |
| control_mode | List[int] | 6个力控方向（Fx Fy Fz Mx My Mz）的模式 0-固定模式 1-浮动模式 2-弹簧模式 3-运动模式 4-力跟踪模式 8-力跟踪+姿态自适应模式 |
| desired_force | List[float] | 力控轴维持的期望力/力矩，力控轴的力控模式为力跟踪模式时，期望力/力矩设置才会生效 ，精度0.1N。 |
| limit_vel | List[float] | 力控轴的最大线速度和最大角速度限制，只对开启力控方向生效。 |
| trajectory_mode | int | 高跟随模式下，0-完全透传模式、1-曲线拟合模式、2-滤波模式 |
| radio | int | 曲线拟合模式时radio是平滑系数（0-100），滤波模式时radio是滤波参数（范围在0至1000之间） |

官方来源：[forcePositionMove](https://develop.realman-robotics.com/robot/apipython/struct/forcePositionMove/)。

### forceSensor

**力控数据结构体 rm_force_sensor_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| force | List[float] | 当前力传感器原始数据，力的单位为N；力矩单位为Nm。 |
| zero_force | List[float] | 当前力传感器系统外受力数据，力的单位为N；力矩单位为Nm。 |
| coordinate | int | 系统外受力数据的坐标系，0为传感器坐标系，1为当前工作坐标系，2为当前工具坐标系 |

官方来源：[forceSensor](https://develop.realman-robotics.com/robot/apipython/struct/forceSensor/)。


## 围栏与工具包络

### electronicFenceEnable

**电子围栏/虚拟墙使能状态结构体 rm_electronic_fence_enable_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| enable_state | bool, optional | 电子围栏/虚拟墙使能状态，true 代表使能，false 代表禁用。 |
| in_out_side | int, optional | 0-机器人在电子围栏/虚拟墙内部，1-机器人在电子围栏外部。 |
| effective_region | int, optional | 0-电子围栏针对整臂区域生效，1-虚拟墙针对末端生效。 |

官方来源：[electronicFenceEnable](https://develop.realman-robotics.com/robot/apipython/struct/electronicFenceEnable/)。

### envelopeBallsList

**工具坐标系包络参数 rm_envelope_balls_list_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| tool_name | str, optional | 工具的名称。 |
| balls | list, optional | 一个包含 rm_envelopes_ball_t 实例的列表，表示包络球。 |
| size | int, optional | 包络球的数量。 |

官方来源：[envelopeBallsList](https://develop.realman-robotics.com/robot/apipython/struct/envelopeBallsList/)。

### envelopesBall

**工具坐标系包络参数 rm_envelopes_ball_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| name | str, optional | 工具包络球体的名称，1-10 个字节，支持字母数字下划线。默认为 None。 |
| radius | float, optional | 工具包络球体的半径，单位 0.001m。默认为 None。 |
| x | float, optional | 工具包络球体球心基于末端法兰坐标系的 X 轴坐标，单位 m。默认为 None。 |
| y | float, optional | 工具包络球体球心基于末端法兰坐标系的 Y 轴坐标，单位 m。默认为 None。 |
| z | float, optional | 工具包络球体球心基于末端法兰坐标系的 Z 轴坐标，单位 m。默认为 None。 |

官方来源：[envelopesBall](https://develop.realman-robotics.com/robot/apipython/struct/envelopesBall/)。

### fenceConfig

**电子围栏参数结构体 rm_fence_config_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| form | int, optional | 形状，1 表示长方体，2 表示点面矢量平面，3 表示球体。默认为 None。 |
| name | str, optional | 电子围栏名称，不超过 10 个字节，支持字母、数字、下划线。默认为 None。 |
| cube | rm_fence_config_cube_t , optional | 长方体参数. Defaults to None. |
| plane | rm_fence_config_plane_t , optional | 点面矢量平面参数。默认为 None。 |
| sphere | rm_fence_config_sphere_t , optional | 球体参数。默认为 None |

官方来源：[fenceConfig](https://develop.realman-robotics.com/robot/apipython/struct/fenceConfig/)。

### fenceConfigCube

**几何模型长方体参数 rm_fence_config_cube_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| x_min | float, optional | 长方体基于世界坐标系 X 方向最小位置，单位 m。默认为 None。 |
| x_max | float, optional | 长方体基于世界坐标系 X 方向最大位置，单位 m。默认为 None。 |
| y_min | float, optional | 长方体基于世界坐标系 Y 方向最小位置，单位 m。默认为 None。 |
| y_max | float, optional | 长方体基于世界坐标系 Y 方向最大位置，单位 m。默认为 None。 |
| z_min | float, optional | 长方体基于世界坐标系 Z 方向最小位置，单位 m。默认为 None。 |
| z_max | float, optional | 长方体基于世界坐标系 Z 方向最大位置，单位 m。默认为 None。 |

官方来源：[fenceConfigCube](https://develop.realman-robotics.com/robot/apipython/struct/fenceConfigCube/)。

### fenceConfigList

**几何模型参数列表 rm_fence_config_list_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| config | rm_fence_config_t [] | 几何模型参数列表，不超过10个。 |

官方来源：[fenceConfigList](https://develop.realman-robotics.com/robot/apipython/struct/fenceConfigList/)。

### fenceConfigPlane

**几何模型点面矢量平面参数 rm_fence_config_plane_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| x1 | float, optional | 点面矢量平面三点法中的第一个点x坐标，单位 m。默认为 None。 |
| y1 | float, optional | 点面矢量平面三点法中的第一个点y坐标，单位 m。默认为 None。 |
| z1 | float, optional | 点面矢量平面三点法中的第一个点z坐标，单位 m。默认为 None。 |
| x2 | float, optional | 点面矢量平面三点法中的第二个点x坐标，单位 m。默认为 None。 |
| y2 | float, optional | 点面矢量平面三点法中的第二个点y坐标，单位 m。默认为 None。 |
| z2 | float, optional | 点面矢量平面三点法中的第二个点z坐标，单位 m。默认为 None。 |
| x3 | float, optional | 点面矢量平面三点法中的第三个点x坐标，单位 m。默认为 None。 |
| y3 | float, optional | 点面矢量平面三点法中的第三个点y坐标，单位 m。默认为 None。 |
| z3 | float, optional | 点面矢量平面三点法中的第三个点z坐标，单位 m。默认为 None。 |

官方来源：[fenceConfigPlane](https://develop.realman-robotics.com/robot/apipython/struct/fenceConfigPlane/)。

### fenceConfigSphere

**几何模型球体参数 rm_fence_config_sphere_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| x | float, optional | 表示球心在世界坐标系 X 轴的坐标，单位 m。默认为 None。 |
| y | float, optional | 表示球心在世界坐标系 Y 轴的坐标，单位 m。默认为 None。 |
| z | float, optional | 表示球心在世界坐标系 Z 轴的坐标，单位 m。默认为 None。 |
| radius | float, optional | 表示半径，单位 m. Defaults to None。 |

官方来源：[fenceConfigSphere](https://develop.realman-robotics.com/robot/apipython/struct/fenceConfigSphere/)。

### fenceNames

**几何模型名称结构体 rm_fence_names_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| name | bytes | 几何模型名称，不超过10个字符。 |

官方来源：[fenceNames](https://develop.realman-robotics.com/robot/apipython/struct/fenceNames/)。


## 程序与全局路点

### flowchartstate

**流程图程序运行状态 rm_flowchart_run_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| run_state | int | 运行状态 0 未开始 1运行中 2暂停中。 |
| id | int | 当前使能的文件id。 |
| name | str | 当前使能的文件名称。 |
| plan_speed | int | 当前使能的文件全局规划速度比例 1-100。 |
| step_mode | int | 单步模式，0为空，1为正常, 2为单步。 |
| modal_id | str | 运行到的流程图块的id。未运行则不返回。 |

官方来源：[flowchartstate](https://develop.realman-robotics.com/robot/apipython/struct/flowchartstate/)。

### programRunState

**机械臂程序运行状态结构体 rm_program_run_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| run_state | int | 运行状态： 0: 未开始 1: 运行中 2: 暂停中。 |
| id | int | 运行轨迹编号。 |
| edit_id | int | 上次编辑的在线编程编号 id。 |
| plan_num | int | 运行行数。 |
| total_loop | int | 循环指令数量。 |
| step_mode | int | 单步模式： 1: 单步模式 0: 非单步模式。 |
| plan_speed | int | 全局规划速度比例 1-100。 |
| loop_num | List[int] | 循环行数。 |
| loop_cont | List[int] | 对应循环次数 |

官方来源：[programRunState](https://develop.realman-robotics.com/robot/apipython/struct/programRunState/)。

### programTrajectorys

**查询在线编程列表 rm_program_trajectorys_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| page_num | int | 页码。 |
| page_size | int | 每页大小。 |
| list_size | int | 返回总数量。 |
| vague_search | bytes | 模糊搜索字符串。 |
| trajectory_list | list | 符合的在线编程列表（包含 rm_trajectory_data_t 结构体的数组）。 |

官方来源：[programTrajectorys](https://develop.realman-robotics.com/robot/apipython/struct/programTrajectorys/)。

### sendProject

**用于发送编程文件信息的结构体 rm_send_project_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| project_path | c_char * 300 | 下发文件路径文件路径及名称。 |
| project_path_len | int | 路径及名称长度。 |
| plan_speed | int | 规划速度比例系数。 |
| only_save | int | 0-运行文件，1-仅保存文件，不运行。 |
| save_id | int | 保存到控制器中的编号。 |
| step_flag | int | 设置单步运行方式模式，1-设置单步模式 0-设置正常运动模式。 |
| auto_start | int | 设置默认在线编程文件，1-设置默认 0-设置非默认 |
| project_type | int | 下发文件类型。0-在线编程文件，1-拖动示教轨迹文件 |

官方来源：[sendProject](https://develop.realman-robotics.com/robot/apipython/struct/sendProject/)。

### trajectoryData

**在线编程存储信息 rm_trajectory_data_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| id | int | 在线编程文件id。 |
| size | int | 文件大小。 |
| speed | int | 默认运行速度。 |
| trajectory_name | int | 文件名称。 |

官方来源：[trajectoryData](https://develop.realman-robotics.com/robot/apipython/struct/trajectoryData/)。

### waypoint

**机械臂全局路点结构体 rm_waypoint_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| point_name | str, optional | 路点名称，默认为None。 |
| joint | list[float], optional | 关节角度列表，长度为7，单位：°，默认为None。 |
| pose | list[float], optional | 位姿信息，包含位置和欧拉角，默认为None。该列表应为 [x, y, z, rx, ry, rz] 格式，其中 [x, y, z] 是位置，[rx, ry, rz] 是欧拉角。 |
| work_frame | str, optional | 工作坐标系名称，默认为None。 |
| tool_frame | str, optional | 工具坐标系名称，默认为None。 |
| time | str, optional | 路点新增或修改时间，默认为空字符串。 |

官方来源：[waypoint](https://develop.realman-robotics.com/robot/apipython/struct/waypoint/)。

### waypointList

**机械臂全局路点列表获取结构体 rm_waypoint_list_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| page_num | int | 页码。 |
| page_size | int | 每页大小（即每页包含的路径点数量）。 |
| total_size | int | 路点列表的总大小（即总路点数量）。 |
| vague_search | bytes | 模糊搜索字符串（用于搜索路径点时的关键字）。 |
| list_len | int | 返回符合的全局路点列表长度。 |
| points_list | rm_waypoint_t array[100] | 返回符合的全局路点列表。 |

官方来源：[waypointList](https://develop.realman-robotics.com/robot/apipython/struct/waypointList/)。


## UDP 实时上报

### realtimeArmJointState

**机械臂实时状态推送信息结构体 rm_realtime_arm_joint_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| errCode | int | 数据解析错误码，-3为数据解析错误，代表推送的数据不完整或格式不正确 |
| arm_ip | bytes | 推送数据的机械臂的IP地址 |
| arm_port | int | 机械臂的端口 |
| joint_status | rm_joint_status_t | 机械臂关节状态结构体 |
| force_sensor | rm_force_sensor_t | 力传感器数据结构体 |
| err | rm_err_t | 错误码 |
| waypoint | rm_pose_t | 当前位置姿态结构体 |
| liftState | rm_udp_lift_state_t | 升降关节数据 |
| expandState | rm_udp_expand_state_t | 扩展关节数据 |
| handState | rm_udp_hand_state_t | 灵巧手数据 |
| arm_current_status | rm_udp_arm_current_status_e | 机械臂当前状态 |
| aloha_state | rm_udp_aloha_state_t | aloha主臂状态 |
| rm_plus_state | int | 末端设备状态，0-设备在线，1-表示协议未开启，2-表示协议开启但是设备不在线 |
| plus_base_info | rm_plus_base_info_t | 末端设备基础信息 |
| plus_state_info | rm_plus_state_info_t | 末端设备实时信息 |

官方来源：[realtimeArmJointState](https://develop.realman-robotics.com/robot/apipython/struct/realtimeArmJointState/)。

### realtimePushConfig

**UDP机械臂状态主动上报接口配置 rm_realtime_push_config_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| cycle | int | 广播周期，5ms的倍数。 |
| enable | bool | 使能，是否主动上报。 |
| port | int | 广播的端口号。 |
| force_coordinate | int | 系统外受力数据的坐标系（力传感器版本支持）。 0：传感器坐标系；1：当前工作坐标系；2：当前工具坐标系。 |
| ip | bytes | 自定义的上报目标IP地址。 |
| custom_config | rm_udp_custom_config_t | 自定义上报项。 |

官方来源：[realtimePushConfig](https://develop.realman-robotics.com/robot/apipython/struct/realtimePushConfig/)。

### udpAlohaState

**udp推送的aloha主臂状态 rm_udp_aloha_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| io1_state | int | IO1状态（手柄光电检测），0为按键未触发，1为按键触发。 |
| io2_state | int | IO2状态（手柄光电检测），0为按键未触发，1为按键触发。 |

官方来源：[udpAlohaState](https://develop.realman-robotics.com/robot/apipython/struct/udpAlohaState/)。

### udpCustomConfig

**UDP主动上报自定义项 rm_udp_custom_config_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| joint_speed | int | 关节速度。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| lift_state | int | 升降关节信息。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| expand_state | int | 扩展关节信息（升降关节和扩展关节为二选一，优先显示升降关节）1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| arm_current_status | int | 机械臂当前状态。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| hand_state | int | 灵巧手状态。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| aloha_state | int | aloha主臂状态。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| plus_base | int | 末端设备基础信息。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |
| plus_state | int | 末端设备实时信息。1：上报；0：关闭上报；-1：不设置，保持之前的状态 |

官方来源：[udpCustomConfig](https://develop.realman-robotics.com/robot/apipython/struct/udpCustomConfig/)。

### udpExpandState

**udp推送的扩展关节状态 rm_udp_expand_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| pos | float | 当前角度 精度 0.001°，单位：° |
| current | int | 当前驱动电流，单位：mA，精度：1mA |
| err_flag | int | 驱动错误代码，错误代码类型参考关节错误代码 |
| en_flag | int | 当前关节使能状态 ，1 为上使能，0 为掉使能 |
| joint_id | int | 关节id号 |
| mode | int | 当前升降状态，0-空闲，1-正方向速度运动，2-正方向位置运动，3-负方向速度运动，4-负方向位置运动 |

官方来源：[udpExpandState](https://develop.realman-robotics.com/robot/apipython/struct/udpExpandState/)。

### udpHandState

**udp推送的灵巧手状态 rm_udp_hand_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| hand_pos | List[int] | 表示灵巧手位置 |
| hand_angle | List[int] | 表示灵巧手角度 |
| hand_force | List[int] | 表示灵巧手自由度力，单位mN |
| hand_state | List[int] | 表示灵巧手当前状态，由灵巧手厂商定义状态含义。 |
| hand_err | int | 表示灵巧手系统错误，由灵巧手厂商定义错误含义，例如因时错误码如下：1表示有错误，0表示无错误 |

官方来源：[udpHandState](https://develop.realman-robotics.com/robot/apipython/struct/udpHandState/)。

### udpLiftState

**udp推送的升降机构状态 rm_udp_lift_state_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| height | int | 当前升降机构高度，单位：mm，精度：1mm |
| pos | float | 当前角度 精度 0.001°，单位：° |
| current | int | 当前驱动电流，单位：mA，精度：1mA |
| err_flag | int | 驱动错误代码，错误代码类型参考关节错误代码 |
| en_flag | int | 当前关节使能状态 ，1 为上使能，0 为掉使能 |

官方来源：[udpLiftState](https://develop.realman-robotics.com/robot/apipython/struct/udpLiftState/)。


## 末端生态与通信

### peripheralReadWriteParams

**读写外设数据参数结构体 rm_peripheral_read_write_params_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| port | int | 通讯端口0-控制器RS485端口，1-末端接口板RS485接口，3-控制器ModbusTCP设备。 |
| address | int | 数据起始地址。 |
| device | int | 外设设备地址。 |
| num | int | 数据数量。 |

官方来源：[peripheralReadWriteParams](https://develop.realman-robotics.com/robot/apipython/struct/peripheralReadWriteParams/)。

### rmPlusBaseInfo

**末端设备基础信息 rm_plus_base_info_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| manu | c_char * 10 | 设备厂家 |
| type | c_int | 设备类型 |
| hv | c_char * int(10) | 硬件版本 |
| sv | c_char * int(10) | 软件版本 |
| bv | c_char * int(10) | boot版本 |
| id | c_int | 设备ID |
| dof | c_int | 自由度 |
| check | c_int | 自检开关 |
| bee | c_int | 蜂鸣器开关 |
| force | c_bool | 力控支持 |
| touch | c_bool | 触觉支持 |
| touch_num | c_int | 触觉个数 |
| touch_sw | c_int | 触觉开关 |
| hand | c_int | 手方向 |
| pos_up | c_int * 12 | 位置上限 |
| pos_low | c_int * 12 | 位置下限 |
| angle_up | c_int * 12 | 角度上限 |
| angle_low | c_int * 12 | 角度下限 |
| speed_up | c_int * 12 | 速度上限 |
| speed_low | c_int * 12 | 速度下限 |
| force_up | c_int * 12 | 力上限 |
| force_low | c_int * 12 | 力下限 |

官方来源：[rmPlusBaseInfo](https://develop.realman-robotics.com/robot/apipython/struct/rmPlusBaseInfo/)。

### rmPlusStateInfo

**末端设备实时信息 rm_plus_state_info_t**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| sys_state | int | 系统状态。 |
| dof_state | list[int] | 各自由度当前状态。 |
| dof_err | list[int] | 各自由度错误信息。 |
| pos | list[int] | 各自由度当前位置。 |
| speed | list[int] | 各自由度当前速度,闭合正，松开负，单位：无量纲。 |
| angle | list[int] | 各自由度当前角度。 |
| current | list[int] | 各自由度当前电流。 |
| normal_force | list[int] | 自由度触觉三维力的法向力。 |
| tangential_force | list[int] | 自由度触觉三维力的切向力。 |
| tangential_force_dir | list[int] | 自由度触觉三维力的切向力方向。 |
| tsa | list[int] | 自由度触觉自接近。 |
| tma | list[int] | 自由度触觉互接近。 |
| touch_data | list[int] | 触觉传感器原始数据。 |
| force | list[int] | 自由度力矩,闭合正，松开负，单位0.001N。 |

官方来源：[rmPlusStateInfo](https://develop.realman-robotics.com/robot/apipython/struct/rmPlusStateInfo/)。

## 枚举类型

### rm_thread_mode_e 线程模式

| 枚举值 | 说明 |
| --- | --- |
| RM_SINGLE_MODE_E | 单线程模式，单线程非阻塞等待数据返回。 |
| RM_DUAL_MODE_E | 双线程模式，增加接收线程监测队列中的数据。 |
| RM_TRIPLE_MODE_E | 三线程模式，在双线程模式基础上增加线程监测UDP接口数据。 |

### rm_event_type_e 事件类型

| 枚举值 | 说明 |
| --- | --- |
| RM_NONE_EVENT_E | 无事件。 |
| RM_CURRENT_TRAJECTORY_STATE_E | 当前轨迹到位。 |
| RM_PROGRAM_RUN_FINISH_E | 在线编程运行结束。 |

### rm_robot_arm_model_e 机械臂型号

| 枚举值 | 说明 |
| --- | --- |
| RM_MODEL_RM_65_E | RM_65 |
| RM_MODEL_RM_75_E | RM_75 |
| RM_MODEL_RM_63_II_E | RML_63_II |
| RM_MODEL_RM_63_III_E | RML_63_III |
| RM_MODEL_ECO_65_E | ECO_65 |
| RM_MODEL_ECO_62_E | ECO_62 |
| RM_MODEL_GEN_72_E | GEN_72 |
| RM_MODEL_ECO_63_E | ECO_63 |
| RM_MODEL_UNIVERSAL_E | 通用型，非标准机械臂型号 |

### rm_force_type_e 机械臂末端力传感器版本

| 枚举值 | 说明 |
| --- | --- |
| RM_MODEL_RM_B_E | 标准版。 |
| RM_MODEL_RM_ZF_E | 一维力版。 |
| RM_MODEL_RM_SF_E | 六维力版。 |
| RM_MODEL_RM_ISF_E | 一体化六维力版。 |
| RM_MODEL_RM_BV_E | 标准末端+视觉。 |
| RM_MODEL_RM_ISFV_E | 一体化六维力传感器(新版)+视觉。 |

### rm_arm_current_trajectory_e 机械臂当前规划类型

| 枚举值 | 说明 |
| --- | --- |
| RM_NO_PLANNING_E | 无规划。 |
| RM_JOINT_SPACE_PLANNING_E | 关节空间规划。 |
| RM_CARTESIAN_LINEAR_PLANNING_E | 笛卡尔空间直线规划。 |
| RM_CARTESIAN_ARC_PLANNING_E | 笛卡尔空间圆弧规划。 |
| RM_SPLINE_CURVE_MOTION_PLANNING_E | 样条曲线运动规划。 |
| RM_TRAJECTORY_REPLAY_PLANNING_E | 示教轨迹复现规划 |

### rm_pos_teach_type_e 位置示教方向

| 枚举值 | 说明 |
| --- | --- |
| RM_X_DIR_E | 位置示教，x轴方向。 |
| RM_Y_DIR_E | 位置示教，y轴方向。 |
| RM_Z_DIR_E | 位置示教，z轴方向。 |

### rm_ort_teach_type_e 姿态示教方向

| 枚举值 | 说明 |
| --- | --- |
| RM_RX_ROTATE_E | 姿态示教，绕x轴旋转。 |
| RM_RY_ROTATE_E | 姿态示教，绕y轴旋转。 |
| RM_RZ_ROTATE_E | 姿态示教，绕z轴旋转。 |

### rm_udp_arm_current_status_e UDP推送的机械臂当前状态枚举

| 枚举值 | 说明 |
| --- | --- |
| RM_IDLE_E | 使能但空闲状态 |
| RM_MOVE_L_E | move L运动中状态 |
| RM_MOVE_J_E | move J运动中状态 |
| RM_MOVE_C_E | move C运动中状态 |
| RM_MOVE_S_E | move S运动中状态 |
| RM_MOVE_THROUGH_JOINT_E | 角度透传状态 |
| RM_MOVE_THROUGH_POSE_E | 位姿透传状态 |
| RM_MOVE_THROUGH_FORCE_POSE_E | 力控透传状态 |
| RM_MOVE_THROUGH_CURRENT_E | 电流环透传状态 |
| RM_STOP_E | 急停状态 |
| RM_SLOW_STOP_E | 缓停状态 |
| RM_PAUSE_E | 暂停状态 |
| RM_CURRENT_DRAG_E | 电流环拖动状态 |
| RM_SENSOR_DRAG_E | 六维力拖动状态 |
| RM_TECH_DEMONSTRATION_E | 示教状态 |

### rm_force_position_sensor_e 力位混合控制传感器枚举

| 枚举值 | 说明 |
| --- | --- |
| RM_FP_0F_SENSOR_E | 一维力传感器 |
| RM_FP_SF_SENSOR_E | 六维力传感器 |

### rm_force_position_mode_e 力位混合控制模式枚举

| 枚举值 | 说明 |
| --- | --- |
| RM_FP_BASE_COORDINATE_E | 基坐标系力控 |
| RM_FP_TOOL_COORDINATE_E | 工具坐标系力控 |

### rm_force_position_dir_e 力位混合控制模式（单方向）力控方向枚举

| 枚举值 | 说明 |
| --- | --- |
| RM_FP_X_E | 沿x轴 |
| RM_FP_Y_E | 沿y轴 |
| RM_FP_Z_E | 沿z轴 |
| RM_FP_RX_E | 沿RX姿态方向 |
| RM_FP_RY_E | 沿RY姿态方向 |
| RM_FP_RZ_E | 沿RZ姿态方向 |

### rm_trajectory_connect_config_e 轨迹连接配置

| 枚举值 | 说明 |
| --- | --- |
| RM_TRAJECTORY_DISCONNECT_E | 立即执行规划并执行轨迹，不连接后续轨迹 |
| RM_TRAJECTORY_CONNECT_E | 将当前轨迹与下一条轨迹一起规划 |

### rm_dofType_e 接口限位自由度数量设置枚举

| 枚举值 | 说明 |
| --- | --- |
| DOF_TYPE_6 = 6 | 6自由度。 |
| DOF_TYPE_7 = 7 | 7自由度。 |

### rm_jointType_e 接口限位指定关节角度限位设置枚举

| 枚举值 | 说明 |
| --- | --- |
| JOINT_Q3 = 0 | 关节3。 |
| JOINT_Q4 = 1 | 肘部关节4。 |

### rm_limitType_e 接口关节角度限位设置枚举

| 枚举值 | 说明 |
| --- | --- |
| LIMIT_MAX = 0 | 最大角度限位。 |
| LIMIT_MIN = 1 | 最小角度限位。 |

官方来源：[Python 枚举类型说明](https://develop.realman-robotics.com/robot/apipython/type/)。
