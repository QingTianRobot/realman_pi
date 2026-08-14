# 在线编程与全局路点

## 1. 在线编程文件

`ProjectManagement` 管理控制器中的在线编程/轨迹文件：

- `rm_send_project()`：下发在线编程或拖动示教文件，可选择只保存或立即运行。
- `rm_set_plan_speed()`：规划过程中改变速度系数。
- `rm_get_program_trajectory_list()`：分页查询文件列表。
- `rm_set_program_id_run()`：运行指定文件。
- `rm_get_program_run_state()`：查询运行状态。
- `rm_delete_program_trajectory()`：删除文件。
- `rm_update_program_trajectory()`：修改文件信息。
- `rm_set_default_run_program()` / `rm_get_default_run_program()`：设置/读取 IO 默认运行编号。

`rm_send_project_t` 包含路径、路径长度、规划速度、保存/运行标志、控制器编号、单步标志、默认文件标志和文件类型。下发前检查路径长度和文件类型，运行前核对规划速度与单步模式。

## 2. 全局路点

`GlobalWaypointManage` 支持新增、更新、删除、查询指定路点和分页查询路点列表。`rm_waypoint_t` 包含名称、关节角、位姿、工作坐标系、工具坐标系和时间。位姿列表使用 `[x, y, z, rx, ry, rz]` 时，位置单位是 m，欧拉角单位是 rad；关节角单位是度。

路点是“数据”，不是自动安全的运动目标。使用路点运动前应验证：

1. 当前工具/工作坐标系是否与保存时一致。
2. 当前机械臂型号和自由度是否兼容。
3. 关节角、位姿、速度和安全区域是否满足当前设备限制。
4. 目标点之间是否需要先规划过渡点。

## 3. 分页查询

`rm_waypoint_list_t` 包含页码、页大小、总数量、模糊搜索字符串、返回长度和路点数组；在线编程列表使用 `rm_program_trajectorys_t`，包含页码、页大小、总数、搜索串和轨迹数组。分页读取时应根据返回的总数持续请求，而不是只取第一页。

官方来源：[在线编程文件管理](https://develop.realman-robotics.com/robot/apipython/classes/projectManagement/)、[全局路点](https://develop.realman-robotics.com/robot/apipython/classes/globalWaypointManage/)。
