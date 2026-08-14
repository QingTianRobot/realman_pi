# API 类与方法索引

本索引覆盖官方 Python 文档中的 30 个功能类。方法签名按 2026-08-13 抓取的官方 `V1.7.13` 页面整理；参数含义、返回结构和型号限制应继续点击每节的官方页面核对。

## 通用约定

- 大部分命令返回整数，`0` 表示成功，非零值为 API2 错误码；查询接口通常返回 `(错误码, 数据)`。
- 位置通常使用 m，关节角使用度，欧拉角使用 rad；力和力矩分别使用 N、Nm。
- `block` 在多线程模式通常用 `0/1` 表示非阻塞/阻塞；在单线程模式非零值通常是超时秒数。
- `connect=1` 表示当前轨迹与下一条轨迹连接，此时交融参数才生效。
- UDP 回调需要 `RM_TRIPLE_MODE_E`，网络端口、目标 IP 和防火墙必须同时正确。
- 透传接口绕过常规轨迹规划或降低规划程度，发送周期和目标轨迹必须连续、稳定。

## 类目录

| 类页面 | 作用 |
| --- | --- |
| [algo](#algo) | 算法接口配置 algo |
| [armState](#armstate) | 机械臂状态查询 ArmState |
| [communicationConfig](#communicationconfig) | 通讯内容配置 CommunicationConfig |
| [controllerConfig](#controllerconfig) | 系统配置 ControllerConfig |
| [controllerIOConfig](#controllerioconfig) | 控制器IO配置及查询 controllerIOConfig |
| [dragTeach](#dragteach) | 拖动示教配置 DragTeach |
| [effectorIOConfig](#effectorioconfig) | 工具端IO配置及查询 effectorIOConfig |
| [electronicFenceConfig](#electronicfenceconfig) | 电子围栏和虚拟墙配置 ElectronicFenceConfig |
| [expandControl](#expandcontrol) | 通用扩展关节配置 ExpandControl |
| [force](#force) | 末端六维力配置 Force |
| [forcePositionControl](#forcepositioncontrol) | 透传力位混合控制补偿配置 ForcePositionControl |
| [globalWaypointManage](#globalwaypointmanage) | 全局路点管理 GlobalWaypointManage |
| [gripperControl](#grippercontrol) | 末端工具夹爪配置 GripperControl |
| [handControl](#handcontrol) | 五指灵巧手配置 HandControl |
| [installPos](#installpos) | 系统安装方式配置 InstallPos |
| [jointsConfig](#jointsconfig) | 关节配置 JointConfigSettings |
| [jointsConfigQuery](#jointsconfigquery) | 关节配置查询 JointConfigReader |
| [liftControl](#liftcontrol) | 升降机构配置 LiftControl |
| [modbusConfig](#modbusconfig) | Modbus 配置 ModbusConfig |
| [motionControl](#motioncontrol) | 机械臂运动状态控制 ArmMotionControl |
| [movePlan](#moveplan) | 机械臂轨迹控制 MovePlan |
| [projectManagement](#projectmanagement) | 在线编程文件管理 ProjectManagement |
| [rmPlus](#rmplus) | 末端生态协议配置 RmPlusConfig |
| [roboticArm](#roboticarm) | 机械臂连接控制 ArmRobotic |
| [selfCollision](#selfcollision) | 自碰撞安全检测接口配置 SelfCollision |
| [teachMove](#teachmove) | 机械臂示教及步进运动控制 ArmTeachMove |
| [tipVelocityParameters](#tipvelocityparameters) | 机械臂运动参数配置 ArmTipVelocityParameters |
| [toolCoordinateConfig](#toolcoordinateconfig) | 工具坐标系配置 ToolCoordinateConfig |
| [udpConfig](#udpconfig) | UDP 主动上报配置 UdpConfig |
| [workCoordinateConfig](#workcoordinateconfig) | 工作坐标系配置 WorkCoordinateConfig |

## algo

**算法接口配置 algo**

- 初始化算法依赖数据 __init__(): `__init__(self, arm_model: rm_robot_arm_model_e, force_type: rm_force_type_e):`
- 获取算法库版本 rm_algo_version(): `rm_algo_version(self)->str:`
- 设置安装角度 rm_algo_set_angle(): `rm_algo_set_angle(self, x:float, y:float, z:float)->None:`
- 获取安装角度 rm_algo_get_angle(): `rm_algo_get_angle(self)->tuple[float,float,float]:`
- 设置工作坐标系 rm_algo_set_workframe(): `rm_algo_set_workframe(self, frame: rm_frame_t)->None:`
- 获取当前工作坐标系 rm_algo_get_curr_workframe(): `rm_algo_get_curr_workframe(self)->dict[str,any]:`
- 设置工具坐标系 rm_algo_set_toolframe(): `rm_algo_set_toolframe(self, frame: rm_frame_t)->None:`
- 获取算法当前工具坐标系 rm_algo_get_curr_toolframe(): `rm_algo_get_curr_toolframe(self)->dict[str,any]:`
- 设置算法关节最大限位 rm_algo_set_joint_max_limit(): `rm_algo_set_joint_max_limit(self, joint_limit: list[float])->None:`
- 获取算法关节最大限位 rm_algo_get_joint_max_limit(): `rm_algo_get_joint_max_limit(self)->list[float]:`
- 设置算法关节最小限位 rm_algo_set_joint_min_limit(): `rm_algo_set_joint_min_limit(self, joint_limit: list[float])->None:`
- 获取算法关节最小限位 rm_algo_get_joint_min_limit(): `rm_algo_get_joint_min_limit(self)->list[float]:`
- 设置算法关节最大速度 rm_algo_set_joint_max_speed(): `rm_algo_set_joint_max_speed(self, joint_limit: list[float])->None:`
- 获取算法关节最大速度 rm_algo_get_joint_max_speed(): `rm_algo_get_joint_max_speed(self)->list[float]:`
- 设置算法关节最大加速度 rm_algo_set_joint_max_acc(): `rm_algo_set_joint_max_acc(self, joint_limit: list[float])->None:`
- 获取算法关节最大加速度 rm_algo_get_joint_max_acc(): `rm_algo_get_joint_max_acc(self)->list[float]:`
- 设置逆解求解模式 rm_algo_set_redundant_parameter_traversal_mode(): `rm_algo_set_redundant_parameter_traversal_mode(self, mode:bool)->None:`
- 逆解函数 rm_algo_inverse_kinematics(): `rm_algo_inverse_kinematics(self, params: rm_inverse_kinematics_params_t)->tuple[int, list[float]]:`
- 计算逆运动学全解(当前仅支持六自由度机器人) rm_algo_inverse_kinematics_all(): `rm_algo_inverse_kinematics_all(self, params: rm_inverse_kinematics_params_t)->rm_inverse_kinematics_all_solve_t:`
- 从多解中选取最优解（当前仅支持六自由度机器人） rm_algo_ikine_select_ik_solve(): `rm_algo_ikine_select_ik_solve(self, weight: list[float], params: rm_inverse_kinematics_all_solve_t)->int:`
- 检查逆解结果是否超出关节限位（当前仅支持六自由度机器人） rm_algo_ikine_check_joint_position_limit(): `rm_algo_ikine_check_joint_position_limit(self, q_solve_i:list[float])->int:`
- 检查逆解结果是否超出速度限位（当前仅支持六自由度机器人） rm_algo_ikine_check_joint_velocity_limit(): `rm_algo_ikine_check_joint_velocity_limit(self, dt:float, q_ref:list[float], q_solve_i:list[float])->int:`
- 根据参考位形计算臂角大小（仅支持RM75） rm_algo_calculate_arm_angle_from_config_rm75(): `rm_algo_calculate_arm_angle_from_config_rm75(self,q_ref:list[float])->tuple[int,float]:`
- 臂角法求解RM75逆运动学 rm_algo_inverse_kinematics_rm75_for_arm_angle(): `rm_algo_inverse_kinematics_rm75_for_arm_angle(self,params:rm_inverse_kinematics_params_t,arm_angle:float)->tuple[int,list[float]]:`
- 正解算法 rm_algo_forward_kinematics(): `rm_algo_forward_kinematics(self, joint: list[float], flag:int=1)->list[float]:`
- 欧拉角转四元数 rm_algo_euler2quaternion(): `rm_algo_euler2quaternion(self, eul: list[float])->list[float]:`
- 四元数转欧拉角 rm_algo_quaternion2euler(): `rm_algo_quaternion2euler(self, quat: list[float])->list[float]:`
- 欧拉角转旋转矩阵 rm_algo_euler2matrix(): `rm_algo_euler2matrix(self, eu: list[float])->rm_matrix_t:`
- 位姿转旋转矩阵 rm_algo_pos2matrix(): `rm_algo_pos2matrix(self, pose: list[float])->rm_matrix_t:`
- 旋转矩阵转位姿 rm_algo_matrix2pos(): `rm_algo_matrix2pos(self, matrix: rm_matrix_t, flag:int=1)->list[float]:`
- 基坐标系转工作坐标系 rm_algo_base2workframe(): `rm_algo_base2workframe(self, matrix: rm_matrix_t, pose_in_base: rm_pose_t, flag:int=1)->list[float]:`
- 工作坐标系转基坐标系 rm_algo_workframe2base(): `rm_algo_workframe2base(self, matrix: rm_matrix_t, pose_in_work: rm_pose_t, flag:int=1)->list[float]:`
- 末端位姿转成工具位姿 rm_algo_end2tool(): `rm_algo_end2tool(self, eu_end: rm_pose_t, flag:int=1)->list[float]:`
- 工具位姿转末端位姿 rm_algo_tool2end(): `rm_algo_tool2end(self, eu_tool: rm_pose_t, flag:int=1)->list[float]:`
- 计算环绕运动位姿 rm_algo_rotate_move(): `rm_algo_rotate_move(self, curr_joint: list[float], rotate_axis:int, rotate_angle:float, choose_axis: rm_pose_t, flag:int=1)->list[float]:`
- 计算沿工具坐标系运动位姿 rm_algo_cartesian_tool(): `rm_algo_cartesian_tool(self, curr_joint: list[float], move_lengthx:float, move_lengthy:float, move_lengthz:float, flag:int=1)->list[float]:`
- 计算Pos和Rot沿某坐标系有一定的位移和旋转角度后，所得到的位姿数据 rm_algo_pose_move(): `rm_algo_pose_move(self, poseCurrent: list[float], deltaPosAndRot: list[float], frameMode:int)->list[float]`
- 设置算法DH参数 rm_algo_set_dh(): `rm_algo_set_dh(self, dh_data: rm_dh_t)->None:`
- 获取算法DH参数 rm_algo_get_dh(): `rm_algo_get_dh(self)->rm_dh_t:`
- 数值法判断机器人是否处于奇异位形 rm_algo_universal_singularity_analyse(): `rm_algo_universal_singularity_analyse(self, q:list[float], singluar_value_limit:float)->int:`
- 设置自定义阈值(仅适用于解析法分析机器人奇异状态) rm_algo_kin_set_singularity_thresholds(): `rm_algo_kin_set_singularity_thresholds(self,limit_qe:float,limit_qw:float, limit_d:float)->None:`
- 恢复初始阈值(仅适用于解析法分析机器人奇异状态) rm_algo_kin_singularity_thresholds_init(): `rm_algo_kin_singularity_thresholds_init(self)->None:`
- 获取自定义阈值(仅适用于解析法分析机器人奇异状态) rm_algo_kin_get_singularity_thresholds(): `rm_algo_kin_get_singularity_thresholds(self)->tuple[float,float,float]:`
- 解析法判断机器人是否处于奇异位形（仅支持六自由度） rm_algo_kin_robot_singularity_analyse(): `rm_algo_kin_robot_singularity_analyse(self,q:list[float])->tuple[int,float]:`
- 设置工具包络球参数 rm_algo_set_tool_envelope(): `rm_algo_set_tool_envelope(self, toolSphere_i:int, data: rm_tool_sphere_t)->None:`
- 获取工具包络球参数 rm_algo_get_tool_envelope(): `rm_algo_get_tool_envelope(self, toolSphere_i:int)->rm_tool_sphere_t:`
- 自碰撞检测算法 rm_algo_safety_robot_self_collision_detection(): `rm_algo_safety_robot_self_collision_detection(self,joint_deg:list[float])->int:`
- 遥操作运动学结构体初始化遥操作运动学结构体 rm_algo_ik_remote_init: `rm_algo_ik_remote_init(self, dT:float, tool_or_work:int)->None:`
- 设置末端位姿误差权重 rm_algo_set_error_weight: `rm_algo_set_error_weight(self, weight: list[float])->None:`
- 设置关节速度权重 rm_algo_set_dq_weight: `rm_algo_set_dq_weight(self, dq_weight: list[float])->None:`
- 使能七轴机械臂肘部追踪功能 rm_algo_enable_q3_tracker: `rm_algo_enable_q3_tracker(self, is_open:int)->None:`
- 设置七轴机械臂肘部追踪等级 rm_algo_set_q3_tracker_velocity_level: `rm_algo_set_q3_tracker_velocity_level(self, level:float)->None:`
- 设置七轴机械臂肘部追踪下的关节3的追踪角度 rm_algo_set_7dof_q3_track_angle: `rm_algo_set_7dof_q3_track_angle(self, obj_angle:float)->int:`
- 统一的关节角度限位设置接口 rm_algo_set_joint_limit_angle: `rm_algo_set_joint_limit_angle(self, dof_type: rm_dofType_e, joint: rm_jointType_e, limit: rm_limitType_e, angle:float)->int:`
- 逆解函数 rm_algo_ik_remote: `defrm_algo_ik_remote(self, T06d: rm_Mat_t, q_in: list[float], q_out: POINTER(c_float)) ->int:`
- 设置限位保持功能接口 rm_algo_set_enable_limit_holdon: `rm_algo_set_enable_limit_holdon(self, enable:int)->None:`

关键限制：
- 1.建议客户在仿真模式下先验证自己下发的数据是否有异常后再开启真机使用。 2.机械臂肘关节限位防护：禁止关节4（7轴）/关节3（6轴）完全打直为0，否则边界奇异易引发机械臂震荡、回移困难等异常；需通过限位设置接口或示教器安全配置设置非0软限位（限位值可在仿真模式下调试确定）。 3.机械臂关节软限位防护：功能自带关节软限位效果，但应避免运动至软限位；若到位姿下发后关节仍需向限位外转动以满足位姿要求，易引发机械臂震荡等异常。

官方来源：[algo](https://develop.realman-robotics.com/robot/apipython/classes/algo/)。

## armState

**机械臂状态查询 ArmState**

- 获取机械臂当前状态 rm_get_current_arm_state(): `rm_get_current_arm_state(self)->tuple[int, dict[str,any]]:`
- 获取关节当前温度 rm_get_current_joint_temperature(): `rm_get_current_joint_temperature(self)->tuple[int, list[float]]:`
- 获取关节当前电流 rm_get_current_joint_current(): `rm_get_current_joint_current(self)->tuple[int, list[float]]:`
- 获取关节当前电压 rm_get_current_joint_voltage(): `rm_get_current_joint_voltage(self)->tuple[int, list[float]]:`
- 设置机械臂的初始位置角度 rm_set_init_pose(): `intrm_set_init_pose(self, joint: list[float])->int:`
- 获取机械臂初始位置角度 rm_get_init_pose(): `rm_get_init_pose(self)->tuple[int, list[float]]:`
- 获取当前关节角度 rm_get_joint_degree(): `rm_get_joint_degree(self)->tuple[int, list[float]]:`
- 获取机械臂所有状态信息 rm_get_arm_all_state(): `rm_get_arm_all_state(self)->tuple[int, dict[str,any]]:`
- 查询控制器RS485模式 rm_get_controller_rs485_mode(): `rm_get_controller_rs485_mode(self)->dict[str,any]:`
- 查询工具端 RS485 模式 rm_get_tool_rs485_mode(): `rm_get_tool_rs485_mode(self)->dict[str,any]:`

官方来源：[armState](https://develop.realman-robotics.com/robot/apipython/classes/armState/)。

## communicationConfig

**通讯内容配置 CommunicationConfig**

- 配置wifi AP模式 rm_set_wifi_ap(): `rm_set_wifi_ap(self, wifi_name:str, password:str)->int:`
- 配置WiFi STA模式 rm_set_wifi_sta(): `rm_set_wifi_sta(self, router_name:str, password:str)->int:`
- 控制器RS485波特率设置 rm_set_RS485(): `rm_set_RS485(self, baudrate:int)->int:`
- 获取有线网卡信息 rm_get_wired_net(): `rm_get_wired_net(self)->dict[str,any]:`
- 查询无线网卡网络信息 rm_get_wifi_net(): `rm_get_wifi_net(self)->tuple[int, dict[str,any]]:`
- 恢复网络出厂设置 rm_set_net_default(): `rm_set_net_default(self)->int:`
- 配置关闭 wifi 功能 rm_set_wifi_close(): `rm_set_wifi_close(self)->int:`

官方来源：[communicationConfig](https://develop.realman-robotics.com/robot/apipython/classes/communicationConfig/)。

## controllerConfig

**系统配置 ControllerConfig**

- 获取控制器状态 rm_get_controller_state(): `rm_get_controller_state(self)->dict[str,any]:`
- 设置机械臂电源 rm_set_arm_power(): `rm_set_arm_power(self, power:int)->int:`
- 读取机械臂电源状态 rm_get_arm_power_state(): `rm_get_arm_power_state(self)->tuple[int,int]:`
- 读取控制器的累计运行时间 rm_get_system_runtime(): `rm_get_system_runtime(self)->dict[str,any]:`
- 清零控制器的累计运行时间 rm_clear_system_runtime(): `rm_clear_system_runtime(self)->int:`
- 读取关节的累计转动角度 rm_get_joint_odom(): `rm_get_joint_odom(self)->tuple[int, list[float]]:`
- 清零关节累计转动的角度 rm_clear_joint_odom(): `intrm_clear_joint_odom(self)->int:`
- 读取机械臂软件信息 rm_get_arm_software_info(): `rm_get_arm_software_info(self)->tuple[int, dict[str,any]]:`
- 配置有线网口IP地址 rm_set_netip(): `rm_set_NetIP(self, ip:str, netmask:str, gw:str)->int:`
- 清除系统错误 rm_clear_system_err(): `rm_clear_system_err(self)->int:`

官方来源：[controllerConfig](https://develop.realman-robotics.com/robot/apipython/classes/controllerConfig/)。

## controllerIOConfig

**控制器IO配置及查询 controllerIOConfig**

- 配置IO模式 rm_set_io_mode(): `rm_set_io_mode(self, io_num:int, io_mode:int, io_speed:int=0, io_speed_mode:int=0)->int:`
- 设置数字IO输出 rm_set_do_state(): `rm_set_do_state(self, io_num:int, state:int)->int:`
- 获取数字 IO 状态 rm_get_io_state(): `rm_get_io_state(self, io_num:int)->dict[str,any]:`
- 获取所有 IO 输入状态 rm_get_io_input(): `rm_get_io_input(self)->tuple[int, list[int]]:`
- 获取所有 IO 输出状态 rm_get_io_output(): `rm_get_io_output(self)->tuple[int, list[int]]:`
- 设置控制器电源输出 rm_set_voltage(): `rm_set_voltage(self, voltage_type:int, start_enable:bool)->int:`
- 获取控制器电源输出类 rm_get_voltage(): `rm_get_voltage(self)->tuple[int,int]:`

官方来源：[controllerIOConfig](https://develop.realman-robotics.com/robot/apipython/classes/controllerIOConfig/)。

## dragTeach

**拖动示教配置 DragTeach**

- 拖动示教开始 rm_start_drag_teach(): `rm_start_drag_teach(self, trajectory_record:int)->int:`
- 拖动示教结束 rm_stop_drag_teach(): `rm_stop_drag_teach(self)->int:`
- 开始复合模式拖动示教 rm_start_multi_drag_teach(): `rm_start_multi_drag_teach(self, mode:int, singular_wall:int)->int:`
- 设置电流环拖动示教灵敏度 rm_set_drag_teach_sensitivity(): `rm_set_drag_teach_sensitivity(self, grade:int)->int:`
- 获取电流环拖动示教灵敏度 rm_get_drag_teach_sensitivity(): `rm_get_drag_teach_sensitivity(self)->int:`
- 运动到轨迹起点 rm_drag_trajectory_origin(): `rm_drag_trajectory_origin(self, block:int)->int:`
- 拖动示教复现 rm_run_drag_trajectory(): `rm_run_drag_trajectory(self, timeout:int)->int:`
- 控制轨迹复现过程中暂停 rm_pause_drag_trajectory(): `rm_pause_drag_trajectory(self)->int:`
- 控制轨迹复现过程的继续 rm_continue_drag_trajectory(): `rm_continue_drag_trajectory(self)->int:`
- 控制轨迹复现过程中的停止 rm_stop_drag_trajectory(): `rm_stop_drag_trajectory(self)->int:`
- 力位混合控制 rm_set_force_position(): `rm_set_force_position(self, sensor:int, mode:int, direction:int, force:float)->int:`
- 力位混合控制 rm_set_force_position_new(): `rm_set_force_position_new(self, param: rm_force_position_t)->int:`
- 结束力位混合控制 rm_stop_force_position(): `rm_stop_force_position(self)->int:`
- 保存拖动示教轨迹 rm_save_trajectory(): `rm_save_trajectory(self, file_path:str)->tuple[int,int]:`
- 设置六维力拖动示教模式 rm_set_force_drag_mode(): `rm_set_force_drag_mode(self, mode:int)->int:`
- 获取六维力拖动示教模式 rm_get_force_drag_mode(): `rm_get_force_drag_mode(self)->int:`

官方来源：[dragTeach](https://develop.realman-robotics.com/robot/apipython/classes/dragTeach/)。

## effectorIOConfig

**工具端IO配置及查询 effectorIOConfig**

- 设置工具端数字 IO 输出 rm_set_tool_do_state(): `rm_set_tool_do_state(self, io_num:int, state:int)->int:`
- 设置工具端数字 IO 模式 rm_set_tool_IO_mode(): `rm_set_tool_IO_mode(self, io_num:int, state:int)->int:`
- 获取工具端数字 IO 模式 rm_get_tool_io_state(): `rm_get_tool_io_state(self)->dict[str,any]:`
- 设置工具端电源输出 rm_set_tool_voltage(): `rm_set_tool_voltage(self, voltage_type:int)->int:`
- 获取工具端电源输出 rm_get_tool_voltage(): `rm_get_tool_voltage(self)->tuple[int,int]:`

官方来源：[effectorIOConfig](https://develop.realman-robotics.com/robot/apipython/classes/effectorIOConfig/)。

## electronicFenceConfig

**电子围栏和虚拟墙配置 ElectronicFenceConfig**

- 新增几何模型参数 rm_add_electronic_fence_config(): `rm_add_electronic_fence_config(self, electronic_fence: rm_fence_config_t)->int:`
- 更新几何模型参数 rm_update_electronic_fence_config(): `rm_update_electronic_fence_config(self, electronic_fence: rm_fence_config_t)->int:`
- 删除指定几何模型 rm_delete_electronic_fence_config(): `rm_delete_electronic_fence_config(self, name:str)->int:`
- 查询所有几何模型名称 rm_get_electronic_fence_list_names(): `rm_get_electronic_fence_list_names(self)->dict[str,any]:`
- 查询指定几何模型参数 rm_get_given_electronic_fence_config(): `rm_get_given_electronic_fence_config(self, name:str)->tuple[int, dict[str,any]]:`
- 查询所有几何模型参数 rm_get_electronic_fence_list_infos(): `rm_get_electronic_fence_list_infos(self)->dict[str,any]:`
- 设置电子围栏使能状态 rm_set_electronic_fence_enable(): `rm_set_electronic_fence_enable(self, electronic_fence_enable: rm_electronic_fence_enable_t)->int:`
- 获取电子围栏使能状态 rm_get_electronic_fence_enable(): `rm_get_electronic_fence_enable(self)->tuple[int, dict[str,any]]:`
- 设置当前电子围栏参数配置 rm_set_electronic_fence_config(): `rm_set_electronic_fence_config(self, electronic_fence: rm_fence_config_t)->int:`
- 获取当前电子围栏参数 rm_get_electronic_fence_config(): `rm_get_electronic_fence_config(self)->tuple[int, dict[str,any]]:`
- 设置虚拟墙使能状态 rm_set_virtual_wall_enable(): `rm_set_virtual_wall_enable(self, virtual_wall_enable: rm_electronic_fence_enable_t)->int:`
- 获取虚拟墙使能状态 rm_get_virtual_wall_enable(): `rm_get_virtual_wall_enable(self)->tuple[int, dict[str,any]]:`
- 设置当前虚拟墙参数 rm_set_virtual_wall_config(): `rm_set_virtual_wall_config(self, virtual_wall: rm_fence_config_t)->int:`
- 获取当前虚拟墙参数 rm_get_virtual_wall_config(): `rm_get_virtual_wall_config(self)->tuple[int, dict[str,any]]:`

关键限制：
- 电子围栏目前仅支持长方体和点面矢量平面这两种形状。
- 虚拟墙功能目前支持长方体和球体两种形状，并仅在上述两种示教模式下有效。在其他操作模式下，此功能将自动失效。因此，请确保在正确的操作模式 下使用虚拟墙功能，以充分发挥其限制拖动范围的作用。

官方来源：[electronicFenceConfig](https://develop.realman-robotics.com/robot/apipython/classes/electronicFenceConfig/)。

## expandControl

**通用扩展关节配置 ExpandControl**

- 扩展关节速度环控制 rm_set_expand_speed(): `rm_set_expand_speed(self, speed:int)->int:`
- 扩展关节位置环控制 rm_set_expand_pos(): `rm_set_expand_pos(self, speed:int, height:int, block:int)->int:`
- 获取扩展关节状态 rm_get_expand_state(): `rm_get_expand_state(self)->tuple[int, dict[str,any]]:`

官方来源：[expandControl](https://develop.realman-robotics.com/robot/apipython/classes/expandControl/)。

## force

**末端六维力配置 Force**

- 查询六维力传感器力信息 rm_get_force_data(): `rm_get_force_data(self)->tuple[int, dict[str,any]]:`
- 标定当前状态下的零位 rm_clear_force_data(): `rm_clear_force_data(self)->int:`
- 自动设置六维力重心参数 rm_set_force_sensor(): `rm_set_force_sensor(self, block:bool)->int:`
- 手动标定六维力数据 rm_manual_set_force(): `rm_manual_set_force(self, point_num:int, joint: list[float], block:bool)->int:`
- 停止标定力传感器重心 rm_stop_set_force_sensor(): `rm_stop_set_force_sensor(self)->int:`

关键限制：
- 上述4个位置必须按照顺序依次下发，当下发完位置4后，机械臂开始自动运行计算重心。

官方来源：[force](https://develop.realman-robotics.com/robot/apipython/classes/force/)。

## forcePositionControl

**透传力位混合控制补偿配置 ForcePositionControl**

- 开启透传力位混合控制补偿模式 rm_start_force_position_move(): `rm_start_force_position_move(self)->int:`
- 停止透传力位混合控制补偿模式 rm_stop_force_position_move(): `rm_stop_force_position_move(self)->int:`
- 透传力位混合角度补偿 rm_force_position_move_joint(): `rm_force_position_move_joint(self, joint: list[float], sensor:int, mode:int,dir:int, force:float, follow:bool)->int:`
- 透传力位混合位姿补偿 rm_force_position_move_pose(): `rm_force_position_move_pose(self, pose: list[float], sensor:int, mode:int,dir:int, force:float, follow:bool)->int:`
- 透传力位混合补偿 rm_force_position_move(): `rm_force_position_move(self, param:rm_force_position_move_t)->int:`

官方来源：[forcePositionControl](https://develop.realman-robotics.com/robot/apipython/classes/forcePositionControl/)。

## globalWaypointManage

**全局路点管理 GlobalWaypointManage**

- 新增全局路点 rm_add_global_waypoint(): `rm_add_global_waypoint(self, waypoint: rm_waypoint_t)->int:`
- 更新全局路点 rm_update_global_waypoint(): `rm_update_global_waypoint(self, waypoint: rm_waypoint_t)->int:`
- 删除全局路点 rm_delete_global_waypoint(): `rm_delete_global_waypoint(self, point_name:str)->int:`
- 查询指定全局路点 rm_get_given_global_waypoint(): `rm_get_given_global_waypoint(self, point_name:str)->tuple[int, dict[str,any]]:`
- 查询多个全局路点 rm_get_global_waypoints_list(): `rm_get_global_waypoints_list(self, page_num:int, page_size:int, vague_search:str)->tuple[int, dict[str,any]]:`

官方来源：[globalWaypointManage](https://develop.realman-robotics.com/robot/apipython/classes/globalWaypointManage/)。

## gripperControl

**末端工具夹爪配置 GripperControl**

- 设置夹爪行程 rm_set_gripper_route(): `rm_set_gripper_route(self, min_route:int, max_route:int)->int:`
- 松开夹爪 rm_set_gripper_release(): `rm_set_gripper_release(self, speed:int, block:bool, timeout:int)->int:`
- 夹爪力控夹取 rm_set_gripper_pick(): `rm_set_gripper_pick(self, speed:int, force:int, block:bool, timeout:int)->int:`
- 夹爪持续力控夹取 rm_set_gripper_pick_on(): `rm_set_gripper_pick_on(self, speed:int, force:int, block:bool, timeout:int)->int:`
- 设置夹爪达到指定位置 rm_set_gripper_position(): `rm_set_gripper_position(self, position:int, block:bool, timeout:int)->int:`
- 查询夹爪状态 rm_get_gripper_state(): `rm_get_gripper_state(self)->tuple[int, dict[str,any]]:`

官方来源：[gripperControl](https://develop.realman-robotics.com/robot/apipython/classes/gripperControl/)。

## handControl

**五指灵巧手配置 HandControl**

- 运行灵巧手目标手势序列号 rm_set_hand_posture(): `rm_set_hand_posture(self, posture_num:int, block:bool, timeout:int)->int:`
- 运行灵巧手动作序列号 rm_set_hand_seq(): `rm_set_hand_seq(self, seq_num:int, block:bool, timeout:int)->int:`
- 设置灵巧手各自由度角度 rm_set_hand_angle(): `rm_set_hand_angle(self, hand_angle: list[int], block:bool, timeout:int)->int:`
- 设置灵巧手速度 rm_set_hand_speed(): `rm_set_hand_speed(self, speed:int)->int:`
- 设置灵巧手力阈值 rm_set_hand_force(): `rm_set_hand_force(self, force:int)->int:`

官方来源：[handControl](https://develop.realman-robotics.com/robot/apipython/classes/handControl/)。

## installPos

**系统安装方式配置 InstallPos**

- 设置安装方式参数 rm_set_install_pose(): `rm_set_install_pose(self, x:float, y:float, z:float)->int:`
- 获取安装方式参数 rm_get_install_pose(): `rm_get_install_pose(self)->dict[str,any]:`
- 查询关节软件版本号 rm_get_joint_software_version(): `rm_get_joint_software_version(self)->tuple[int, dict[str,any]]:`
- 查询末端接口板软件版本号 rm_get_tool_software_version(): `rm_get_tool_software_version(self)->tuple[int,dict[str,any]]:`

官方来源：[installPos](https://develop.realman-robotics.com/robot/apipython/classes/installPos/)。

## jointsConfig

**关节配置 JointConfigSettings**

- 设置指定关节的最大速度 rm_set_joint_max_speed(): `rm_set_joint_max_speed(self, joint_num:int, speed:float)->int:`
- 设置关节最大加速度 rm_set_joint_max_acc(): `rm_set_joint_max_acc(self, joint_num:int, acc:float)->int:`
- 设置关节最小位置限位 rm_set_joint_min_pos(): `rm_set_joint_min_pos(self, joint_num:int, min_pos:float)->int:`
- 设置关节最大位置限位 rm_set_joint_max_pos(): `rm_set_joint_max_pos(self, joint_num:int, max_pos:float)->int:`
- 设置指定关节最大速度 rm_set_joint_drive_max_speed(): `rm_set_joint_drive_max_speed(self, joint_num:int, speed:float)->int:`
- 设置指定关节最大加速度 rm_set_joint_drive_max_acc(): `rm_set_joint_drive_max_acc(self, joint_num:int, acc:float)->int:`
- 设置指定关节最小限位(驱动器) rm_set_joint_drive_min_pos(): `rm_set_joint_drive_min_pos(self, joint_num:int, min_pos:float)->int:`
- 设置指定关节最大限位(驱动器) rm_set_joint_drive_max_pos(): `rm_set_joint_drive_max_pos(self, joint_num:int, max_pos:float)->int:`
- 设置指定关节使能状态 rm_set_joint_en_state(): `rm_set_joint_en_state(self, joint_num:int, en_state:int)->int:`
- 指定关节当前位置为零位 rm_set_joint_zero_pos(): `rm_set_joint_zero_pos(self, joint_num:int)->int:`
- 清除指定关节错误代码 rm_set_joint_clear_err(): `rm_set_joint_clear_err(self, joint_num:int)->int:`
- 一键设置关节限位 rm_auto_set_joint_limit(): `rm_auto_set_joint_limit(self, mode:int)->int:`

官方来源：[jointsConfig](https://develop.realman-robotics.com/robot/apipython/classes/jointsConfig/)。

## jointsConfigQuery

**关节配置查询 JointConfigReader**

- 查询关节最大速度 rm_get_joint_max_speed(): `rm_get_joint_max_speed(self)->tuple[int,list]:`
- 查询关节最大加速度 rm_get_joint_max_acc(): `rm_get_joint_max_acc(self)->tuple[int,list]:`
- 查询关节最小限位 rm_get_joint_min_pos(): `rm_get_joint_min_pos(self)->tuple[int,list]:`
- 查询关节最大限位 rm_get_joint_max_pos(): `rm_get_joint_max_pos(self)->tuple[int,list]:`
- 查询关节最大速度(驱动器) rm_get_joint_drive_max_speed(): `rm_get_joint_drive_max_speed(self)->tuple[int,list]:`
- 查询关节最大加速度(驱动器) rm_get_joint_drive_max_acc(): `rm_get_joint_drive_max_acc(self)->tuple[int,list]:`
- 查询关节最小限位(驱动器) rm_get_joint_drive_min_pos(): `rm_get_joint_drive_min_pos(self)->tuple[int,list]:`
- 查询关节最大限位(驱动器) rm_get_joint_drive_max_pos(): `rm_get_joint_drive_max_pos(self)->tuple[int,list]:`
- 获取关节使能状态 rm_get_joint_en_state(): `rm_get_joint_en_state(self)->tuple[int,list]:`
- 获取关节错误代码 rm_get_joint_err_flag(): `rm_get_joint_err_flag(self)->dict[str,any]:`

官方来源：[jointsConfigQuery](https://develop.realman-robotics.com/robot/apipython/classes/jointsConfigQuery/)。

## liftControl

**升降机构配置 LiftControl**

- 升降机构速度开环控制 rm_set_lift_speed(): `rm_set_lift_speed(self, speed:int)->int:`
- 升降机构位置闭环控制 rm_set_lift_height(): `rm_set_lift_height(self, speed:int, height:int, block:int)->int:`
- 获取升降机构状态 rm_get_lift_state(): `rm_get_lift_state(self)->tuple[int, dict[str,any]]:`

官方来源：[liftControl](https://develop.realman-robotics.com/robot/apipython/classes/liftControl/)。

## modbusConfig

**Modbus 配置 ModbusConfig**

- 配置通讯端口ModbusRTU模式 rm_set_modbus_mode(): `rm_set_modbus_mode(self, port:int, baudrate:int, timeout:int)->int:`
- 关闭通讯端口 Modbus RTU 模式 rm_close_modbus_mode(): `rm_close_modbus_mode(self, port:int)->int:`
- 配置连接 rm_set_modbustcp_mode(): `rm_set_modbustcp_mode(self, ip:str, port:int, timeout:int)->int:`
- 关闭通讯端口ModbusTCP模式 rm_close_modbustcp_mode(): `rm_close_modbustcp_mode(self)->int:`
- 读线圈 rm_read_coils(): `rm_read_coils(self, read_params: rm_peripheral_read_write_params_t)->tuple[int,int]:`
- 读离散量输入 rm_read_input_status(): `rm_read_input_status(self, read_params: rm_peripheral_read_write_params_t)->tuple[int,int]:`
- 读保持寄存器 rm_read_holding_registers(): `rm_read_holding_registers(self, read_params: rm_peripheral_read_write_params_t)->tuple[int,int]:`
- 读输入寄存器 rm_read_input_registers(): `rm_read_input_registers(self, read_params: rm_peripheral_read_write_params_t)->tuple[int,int]:`
- 写单圈数据 rm_write_single_coil(): `rm_write_single_coil(self, write_params: rm_peripheral_read_write_params_t, data:int)->int:`
- 写单个寄存器 rm_write_single_register(): `rm_write_single_register(self, write_params: rm_peripheral_read_write_params_t, data:int)->int:`
- 写多个寄存器 rm_write_registers(): `rm_write_registers(self, write_params: rm_peripheral_read_write_params_t, data: list[int])->int:`
- 写多圈数据 rm_write_coils(): `rm_write_coils(self, write_params: rm_peripheral_read_write_params_t, data: list[int])->int:`
- 读多圈数据 rm_read_multiple_coils(): `rm_read_multiple_coils(self, read_params: rm_peripheral_read_write_params_t)->tuple[int, list[int]]:`
- 读多个保存寄存器 rm_read_multiple_holding_registers(): `rm_read_multiple_holding_registers(self, read_params: rm_peripheral_read_write_params_t)->tuple[int, list[int]]:`
- 读多个输入寄存器 rm_read_multiple_input_registers(): `rm_read_multiple_input_registers(self, read_params: rm_peripheral_read_write_params_t)->tuple[int, list[int]]:`

关键限制：
- 控制器的RS485接口在未配置为Modbus RTU模式时，可用于直接控制机械臂。 Modbus RTU模式与机械臂控制模式不兼容。若需恢复机械臂控制模式，必须关闭该端口的Modbus RTU模式。 关闭Modbus RTU模式后，系统将自动切换回机械臂控制模式，使用波特率460800BPS，停止位1，数据位8，无校验。

官方来源：[modbusConfig](https://develop.realman-robotics.com/robot/apipython/classes/modbusConfig/)。

## motionControl

**机械臂运动状态控制 ArmMotionControl**

- 轨迹缓停 rm_set_arm_slow_stop(): `rm_set_arm_slow_stop(self)->int:`
- 轨迹停止 rm_set_arm_stop(): `rm_set_arm_stop(self)->int:`
- 轨迹暂停 rm_set_arm_pause(): `rm_set_arm_pause(self)->int:`
- 继续当前轨迹运动 rm_set_arm_continue(): `rm_set_arm_continue(self)->int:`
- 清除当前轨迹 rm_set_delete_current_trajectory(): `rm_set_delete_current_trajectory(self)->int:`
- 清除所有轨迹 rm_set_arm_delete_trajectory(): `rm_set_arm_delete_trajectory(self)->int:`
- 获取当前正在规划的轨迹信息 rm_get_arm_current_trajectory(): `rm_get_arm_current_trajectory(self)->dict[str,any]:`

关键限制：
- 关节最快速度停止，轨迹不可恢复。机械臂维持动力完成受控停止，停止后仍保持动力。

官方来源：[motionControl](https://develop.realman-robotics.com/robot/apipython/classes/motionControl/)。

## movePlan

**机械臂轨迹控制 MovePlan**

- 关节空间运动 rm_movej(): `rm_movej(self, joint: list[float], v:int, r:int, connect:int, block:int)->int:`
- 笛卡尔空间直线运动 rm_movel(): `rm_movel(self, pose: list[float], v:int, r:int, connect:int, block:int)->int:`
- 样条曲线运动 rm_moves(): `rm_moves(self, pose: list[float], v:int, r:int, connect:int, block:int)->int:`
- 笛卡尔空间圆弧运动 rm_movec(): `rm_movec(self, pose_via: list[float], pose_to: list[float], v:int, r:int, loop:int, connect:int, block:int)->int:`
- 关节空间运动到目标位姿 rm_movej_p(): `rm_movej_p(self, pose: list[float], v:int, r:int, connect:int, block:int)->int:`
- 角度透传（CANFD） rm_movej_canfd(): `rm_movej_canfd(self, joint: list[float], follow:bool, expand:float=0, trajectory_mode:int=0, radio:int=0)->int:`
- 位姿透传（CANFD） rm_movep_canfd(): `rm_movep_canfd(self, pose: list[float], follow:bool, trajectory_mode:int=0, radio:int=0)->int:`
- 关节空间跟随运动 rm_movej_follow(): `rm_movej_follow(self, joint: list[float])->int:`
- 笛卡尔空间跟随运动 rm_movep_follow(): `rm_movep_follow(self, pose: list[float])->int:`
- 笛卡尔速度透传初始化 rm_set_movev_canfd_init: `rm_set_movev_canfd_init(self, avoid_singularity_flag:int, frame_type:int, dt:int)->int:`
- 笛卡尔速度透传 rm_movev_canfd: `rm_movev_canfd(self, cartesian_velocity: list[float], follow:bool, trajectory_mode:int=0, radio:int=0)->int:`

关键限制：
- 使用单线程阻塞模式时，请设置超时时间确保轨迹在超时时间内运行结束返回。 trajectory_connect参数为1交融半径才生效，如果为0则交融半径不生效。
- 样条曲线运动需至少连续下发三个点位（connect设置为1），否则运动轨迹为直线。 使用单线程阻塞模式时，请设置超时时间确保轨迹在超时时间内运行结束返回。
- 使用单线程阻塞模式时，请设置超时时间确保轨迹在超时时间内运行结束返回。
- 角度不经规划，直接通过CANFD透传给机械臂。角度透传到 CANFD，若指令正确，机械臂立即执行。 透传效果受通信周期和轨迹平滑度影响，因此要求通信周期稳定，避免大幅波动。 用户在使用此功能时，建议进行良好的轨迹规划，以确保机械臂的稳定运行。 第三代控制器有线网口周期最快可达2ms，提供了更高的实时性。
- 当目标位姿被透传到机械臂控制器时，控制器首先尝试进行逆解计算。 若逆解成功且计算出的各关节角度与当前角度差异不大，则直接下发至关节执行，跳过额外的轨迹规划步骤。 这一特性适用于需要周期性调整位姿的场景，如视觉伺服等应用。 透传效果受通信周期和轨迹平滑度影响，因此要求通信周期稳定，避免大幅波动。 用户在使用此功能时，建议进行良好的轨迹规划，以确保机械臂的稳定运行。 第三代控制器有线网口周期最快可达2ms，提供了更高的实时性。

官方来源：[movePlan](https://develop.realman-robotics.com/robot/apipython/classes/movePlan/)。

## projectManagement

**在线编程文件管理 ProjectManagement**

- 文件下发 rm_send_project(): `rm_send_project(self, send_project: rm_send_project_t)->tuple[int,int]:`
- 规划过程中改变速度系数 rm_set_plan_speed(): `rm_set_plan_speed(self, speed:int)->int:`
- 获取在线编程列表 rm_get_program_trajectory_list(): `rm_get_program_trajectory_list(self, page_num:int, page_size:int, vague_search:str)->tuple[int, dict[str,any]]:`
- 开始运行指定编程文件 rm_set_program_id_run(): `rm_set_program_id_run(self, tra_id:int, speed:int, timeout:int)->int:`
- 查询在线编程运行状态 rm_get_program_run_state(): `rm_get_program_run_state(self)->tuple[int, dict[str,any]]:`
- 删除指定轨迹 rm_delete_program_trajectory(): `rm_delete_program_trajectory(self, tra_id:int)->int:`
- 修改指定轨迹信息 rm_update_program_trajectory(): `rm_update_program_trajectory(self, tra_id:int, speed:int, name:str)->int:`
- 设置IO默认运行编号 rm_set_default_run_program(): `rm_set_default_run_program(self, tra_id:int)->int:`
- 获取IO默认运行编号 rm_get_default_run_program(): `rm_get_default_run_program(self)->tuple[int,int]:`

官方来源：[projectManagement](https://develop.realman-robotics.com/robot/apipython/classes/projectManagement/)。

## rmPlus

**末端生态协议配置 RmPlusConfig**

- 设置末端生态协议模式 rm_set_rm_plus_mode(): `rm_set_rm_plus_mode(self, mode:int)->int:`
- 获取末端生态协议模式 rm_get_rm_plus_mode(): `rm_get_rm_plus_mode(self)->tuple[int,int]:`
- 设置触觉传感器模式(末端生态协议支持) rm_set_rm_plus_touch(): `rm_set_rm_plus_touch(self,mode:int)->int:`
- 获取触觉传感器模式(末端生态协议支持) rm_get_rm_plus_touch(): `rm_get_rm_plus_touch(self)->tuple[int,int]:`
- 读取末端设备基础信息(末端生态协议支持) rm_get_rm_plus_base_info(): `rm_get_rm_plus_base_info(self)->tuple[int,dict[str,any]]:`
- 读取末端设备实时信息(末端生态协议支持) rm_get_rm_plus_state_info(): `rm_get_rm_plus_state_info(self)->tuple[int, dict[str,any]]:`
- 读末端生态设备寄存器 rm_get_rm_plus_reg: `rm_get_rm_plus_reg(self, addr:int, length:int)->tuple[int, list[int]]:`
- 写末端生态设备寄存器 rm_set_rm_plus_reg: `rm_set_rm_plus_reg(self, addr:int, length:int, data: list[int])->int:`
- 设置末端工具角度跟随控制 rm_set_hand_follow_angle(): `rm_set_hand_follow_angle(self, hand_angle: list[int], block:bool)->int`
- 设置末端工具位置跟随控制 rm_set_hand_follow_pos(): `rm_set_hand_follow_pos(self, hand_pos: list[int], block:bool)->int`

关键限制：
- 如果要使用此功能，需要联系技术支持发送定制的末端工具（灵巧手/夹爪）固件升级包。

官方来源：[rmPlus](https://develop.realman-robotics.com/robot/apipython/classes/rmPlus/)。

## roboticArm

**机械臂连接控制 ArmRobotic**

- 初始化线程模式 __init__(): `__init__(self, mode:rm_thread_mode_e=None):`
- 创建机械臂连接控制句柄 rm_create_robot_arm(): `rm_create_robot_arm(self, ip:str, port:int, level:int=3, log_func:CFUNCTYPE=None)->rm_robot_handle:`
- 删除指定机械臂实例 rm_delete_robot_arm(): `rm_delete_robot_arm(self)->int:`
- 关闭所有机械臂连接 rm_destroy(): `rm_destroy(self)->int:`
- 保存日志到文件 rm_set_log_save(): `rm_set_log_save(self, path)->None:`
- 设置真实/仿真模式 rm_set_arm_run_mode(): `rm_set_arm_run_mode(self, mode:int)->int:`
- 获取真实/仿真模式 rm_get_arm_run_mode(): `rm_get_arm_run_mode(self)->tuple[int,int]:`
- 获取机械臂基本信息 rm_get_robot_info(): `rm_get_robot_info(self)->tuple[int, dict[str,any]]:`
- 注册机械臂事件回调函数 rm_get_arm_event_call_back(): `rm_get_arm_event_call_back(self, event_callback: rm_event_callback_ptr):`
- 设置全局超时时间 rm_set_timeout(): `rm_set_timeout(self,timeout:int)->None:`

关键限制：
- 单线程模式无法使用该回调函数。

官方来源：[roboticArm](https://develop.realman-robotics.com/robot/apipython/classes/roboticArm/)。

## selfCollision

**自碰撞安全检测接口配置 SelfCollision**

- 设置自碰撞安全检测使能 rm_set_self_collision_enable(): `rm_set_self_collision_enable(self, enable:bool)->int:`
- 获取自碰撞安全检测使能 rm_get_self_collision_enable(): `rm_get_self_collision_enable(self)->tuple[int,bool]:`
- 手动关闭碰撞解除模式指令 rm_set_collision_remove_enable: `rm_set_collision_remove_enable(self, set_enable:bool)->int:`
- 获取手动关闭碰撞解除使能状态 rm_get_collision_remove_enable: `rm_get_collision_remove_enable(self)->Tuple[int, Optional[bool]]:`

官方来源：[selfCollision](https://develop.realman-robotics.com/robot/apipython/classes/selfCollision/)。

## teachMove

**机械臂示教及步进运动控制 ArmTeachMove**

- 关节步进 rm_set_joint_step(): `rm_set_joint_step(self, num:int, step:float, v:int, block:int)->int:`
- 位置步进 rm_set_pos_step(): `rm_set_pos_step(self, teach_type: rm_pos_teach_type_e, step:float, v:int, block:int)->int:`
- 姿态步进 rm_set_ort_step(): `rm_set_ort_step(self, teach_type: rm_ort_teach_type_e, step:float, v:int, block:int)->int:`
- 关节示教 rm_set_joint_teach(): `rm_set_joint_teach(self, num:int, direction:int, v:int)->int:`
- 笛卡尔空间位置示教 rm_set_pos_teach(): `rm_set_pos_teach(self, teach_type: rm_pos_teach_type_e, direction:int, v:int)->int:`
- 笛卡尔空间姿态示教 rm_set_ort_teach(): `rm_set_ort_teach(self, teach_type: rm_ort_teach_type_e, direction:int, v:int)->int:`
- 示教停止 rm_set_stop_teach(): `rm_set_stop_teach(self)->int:`
- 切换示教运动坐标系 rm_set_teach_frame(): `rm_set_teach_frame(self, frame_type:int)->int:`
- 获取示教参考坐标系 rm_get_teach_frame(): `rm_get_teach_frame(self)->tuple[int,int]:`

官方来源：[teachMove](https://develop.realman-robotics.com/robot/apipython/classes/teachMove/)。

## tipVelocityParameters

**机械臂运动参数配置 ArmTipVelocityParameters**

- 设置机械臂末端最大线速度 rm_set_arm_max_line_speed(): `rm_set_arm_max_line_speed(self, speed:float)->int:`
- 设置机械臂末端最大线加速度 rm_set_arm_max_line_acc(): `rm_set_arm_max_line_acc(self, acc:float)->int:`
- 设置机械臂末端最大角速度 rm_set_arm_max_angular_speed(): `rm_set_arm_max_angular_speed(self, speed:float)->int:`
- 设置机械臂末端最大角加速度 rm_set_arm_max_angular_acc(): `rm_set_arm_max_angular_acc(self, acc:float)->int:`
- 设置机械臂末端参数为默认值 rm_set_arm_tcp_init(): `rm_set_arm_tcp_init(self)->int:`
- 设置静止状态碰撞检测开关 rm_set_collision_detection: `rm_set_collision_detection(self, mode:int)->int:`
- 设置碰撞防护等级 rm_set_collision_state(): `rm_set_collision_state(self, stage:int)->int:`
- 查询碰撞防护等级 rm_get_collision_stage(): `rm_get_collision_stage(self)->tuple[int,int]:`
- 查询静止状态碰撞检测开关 rm_get_collision_detection: `rm_get_collision_detection(self)->tuple[int,int]:`
- 获取机械臂末端最大线速度 rm_get_arm_max_line_speed(): `rm_get_arm_max_line_speed(self)->tuple[int,float]:`
- 获取机械臂末端最大线加速度 rm_get_arm_max_line_acc(): `rm_get_arm_max_line_acc(self)->tuple[int,float]:`
- 获取机械臂末端最大角速度 rm_get_arm_max_angular_speed(): `rm_get_arm_max_angular_speed(self)->tuple[int,float]:`
- 获取机械臂末端最大角加速度 rm_get_arm_max_angular_acc(): `rm_get_arm_max_angular_speed(self)->tuple[int,float]:`
- 设置机械臂DH参数 rm_set_DH_data(): `rm_set_DH_data(self, dh_data: rm_dh_t)->int:`
- 获取机械臂DH参数 rm_get_DH_data(): `rm_get_DH_data(self)->tuple[int, rm_dh_t]:`
- 恢复机械臂默认DH参数 rm_set_DH_data_default(): `rm_set_DH_data_default(self)->int:`
- 设置避奇异模式 rm_set_avoid_singularity_mode: `rm_set_avoid_singularity_mode(self, mode:int)->int:`
- 获取避奇异模式 rm_get_avoid_singularity_mode: `rm_get_avoid_singularity_mode(self)->tuple[int,int]:`

官方来源：[tipVelocityParameters](https://develop.realman-robotics.com/robot/apipython/classes/tipVelocityParameters/)。

## toolCoordinateConfig

**工具坐标系配置 ToolCoordinateConfig**

- 六点法自动设置工具坐标系 标记点位 rm_set_auto_tool_frame(): `rm_set_auto_tool_frame(self, point_num:int)->int:`
- 六点法自动设置工具坐标系 提交 rm_generate_auto_tool_frame(): `rm_generate_auto_tool_frame(self, tool_name:str, payload:float, x:float, y:float, z:float)->int:`
- 手动设置工具坐标系 rm_set_manual_tool_frame(): `rm_set_manual_tool_frame(self, frame: rm_frame_t)->int:`
- 切换当前工具坐标系 rm_change_tool_frame(): `rm_change_tool_frame(self, tool_name:str)->int:`
- 删除指定工具坐标系 rm_delete_tool_frame(): `rm_delete_tool_frame(self, tool_name:str)->int:`
- 修改指定工具坐标系 rm_update_tool_frame(): `rm_update_tool_frame(self, frame: rm_frame_t)->int:`
- 获取所有工具坐标系名称 rm_get_total_tool_frame(): `rm_get_total_tool_frame(self)->dict[str,any]:`
- 获取指定工具坐标系 rm_get_given_tool_frame(): `rm_get_given_tool_frame(self, tool_name:str)->tuple[int, dict[str,any]]:`
- 获取当前工具坐标系 rm_get_current_tool_frame(): `rm_get_current_tool_frame(self)->tuple[int, dict[str,any]]:`
- 设置工具坐标系的包络参数 rm_set_tool_envelope(): `rm_set_tool_envelope(self, envelope: rm_envelope_balls_list_t)->int:`
- 获取工具坐标系的包络参数 rm_get_tool_envelope(): `rm_get_tool_envelope(self, tool_name:str)->tuple[int, dict[str,any]]:`

官方来源：[toolCoordinateConfig](https://develop.realman-robotics.com/robot/apipython/classes/toolCoordinateConfig/)。

## udpConfig

**UDP 主动上报配置 UdpConfig**

- 设置UDP机械臂状态主动上报配置 rm_set_realtime_push(): `rm_set_realtime_push(self, config: rm_realtime_push_config_t)->int:`
- 查询UDP机械臂状态主动上报配置 rm_get_realtime_push(): `rm_get_realtime_push(self)->tuple[int, dict[str,any]]:`
- UDP注册机械臂实时状态 rm_realtime_arm_state_call_back(): `rm_realtime_arm_state_call_back(self, arm_state_callback):`

关键限制：
- 配置正确并开启三线程模式后，通过注册回调函数可接收并处理主动上报数据。
- 需确保打开三线程模式，仅在三线程模式会打开UDP接口接收数据；需确保广播端口号、上报目标IP、是否主动上报等 UDP 机械臂状态主动上报配置正确；需确保防火墙不会阻止数据的接收。

官方来源：[udpConfig](https://develop.realman-robotics.com/robot/apipython/classes/udpConfig/)。

## workCoordinateConfig

**工作坐标系配置 WorkCoordinateConfig**

- 三点法自动设置工作坐标系 rm_set_auto_work_frame(): `rm_set_auto_work_frame(self, name:str, point_num:int)->int:`
- 手动设置工作坐标系 rm_set_manual_work_frame(): `rm_set_manual_work_frame(self, name:str, pose:list)->int:`
- 切换当前工作坐标系 rm_change_work_frame(): `rm_change_work_frame(self, tool_name:str)->int:`
- 删除指定工作坐标系 rm_delete_work_frame(): `rm_delete_work_frame(self, tool_name:str)->int:`
- 修改指定工作坐标系 rm_update_work_frame(): `rm_update_work_frame(self, name:str, pose:list)->int:`
- 获取所有工作坐标系名称 rm_get_total_work_frame(): `rm_get_total_work_frame(self)->dict[str,any]:`
- 获取指定工作坐标系 rm_get_given_work_frame(): `rm_get_given_work_frame(self, name:str)->tuple[int, list[float]]:`
- 获取当前工作坐标系 rm_get_current_work_frame(): `rm_get_current_work_frame(self)->tuple[int, dict[str,any]]:`

官方来源：[workCoordinateConfig](https://develop.realman-robotics.com/robot/apipython/classes/workCoordinateConfig/)。
