# 力控与安全

## 1. 六维力数据

`Force` 提供读取力传感器、清除当前零位、自动设置重心、手动标定和停止标定。`rm_force_data_t` 同时提供原始数据、系统外受力数据、工作坐标系数据和工具坐标系数据；力单位为 N，力矩单位为 Nm。

`rm_force_sensor_t` 还标明数据参考坐标系：传感器坐标系、当前工作坐标系或当前工具坐标系。处理数据前必须读取或记录坐标系，否则同一数值无法正确解释。

## 2. 力位混合控制

`ForcePositionControl` 支持开启/停止透传力位混合补偿，以及按关节角、位姿或完整参数发送补偿。`rm_force_position_t` 的六个方向顺序是 `Fx, Fy, Fz, Mx, My, Mz`；可选择基坐标系或工具坐标系、传感器类型和固定/浮动/弹簧/运动/力跟踪等模式。

力位混合配置的核心检查项：

- 传感器：一维力或六维力。
- 参考坐标系：基坐标系或工具坐标系。
- 每个方向的控制模式、目标力/力矩和速度限制。
- 透传跟随模式、轨迹模式和平滑/滤波参数。

官方枚举 `rm_force_position_mode_e` 使用 `RM_FP_BASE_COORDINATE_E` 和 `RM_FP_TOOL_COORDINATE_E`；方向枚举使用 `RM_FP_X_E` 到 `RM_FP_RZ_E`。模式 8“力跟踪+姿态自适应”有适用方向限制，应以目标控制器版本的页面说明为准。

## 3. 电子围栏与虚拟墙

`ElectronicFenceConfig` 可新增、更新、删除和查询几何模型，设置/读取电子围栏与虚拟墙使能及当前参数。几何模型包括长方体、三点定义的平面和球体；长方体字段使用世界坐标系的最小/最大边界，球体使用世界坐标系球心和半径。

电子围栏使能结构体还区分机器人内外侧，以及整臂区域或末端生效区域。创建模型后建议按“回读参数 -> 开启保护 -> 低速验证”的顺序操作。

## 4. 碰撞保护

末端速度参数类可设置碰撞检测开关和碰撞防护等级，自碰撞类提供独立的自碰撞使能和碰撞解除状态。安全相关接口不应通过“关闭保护”来绕过运动错误；需要解除保护时，应限制速度、清空工作区并保留人工急停。

官方来源：[六维力](https://develop.realman-robotics.com/robot/apipython/classes/force/)、[力位混合补偿](https://develop.realman-robotics.com/robot/apipython/classes/forcePositionControl/)、[电子围栏](https://develop.realman-robotics.com/robot/apipython/classes/electronicFenceConfig/)、[自碰撞](https://develop.realman-robotics.com/robot/apipython/classes/selfCollision/)。
