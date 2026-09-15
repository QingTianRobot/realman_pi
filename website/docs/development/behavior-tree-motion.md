---
title: 行为树机械臂移动 Demo
description: 使用 vendored BehaviorTree.CPP-X 行为树执行一次 RealMan MoveJ。
---

# 行为树机械臂移动 Demo

realman_bt 提供一个独立的 ROS 2 C++ 执行器，用于从 XML 加载最小行为树并执行一次关节移动。它参考
third_party/behavior_tree_cpp 的 NodeFactory -> XmlParser -> Tree::tickOnce() 链路，当前只注册
Sequence 和 MoveJ，不替换生产 ./rm65 up 编排，也不会自动启动机械臂驱动。

## 数据流

    arm_move.launch.py
      -> realman_bt_executor
           -> arm_move.xml: Sequence -> MoveJ
           -> /<arm_id>/execute_motion (realman_msgs/action/ExecuteMotion)

MoveJ 使用 command=MOVEJ、reference_type=BASE，joint_degrees 为六个角度（单位：度），
velocity_percent 和 blend_radius_percent 的范围分别为 1..100 和 0..100。示例目标是
0,-20,30,0,45,0，速度为 10%；请按实际 RM65 安装姿态和工作空间重新确认目标。

权威树文件为 config/behavior-trees/arm_move.xml，其中 arm_id 和 dry_run 通过黑板重映射，能被
launch 参数覆盖。

## 构建

在 ROS 2 Humble 工作区根目录执行：

    source /opt/ros/humble/setup.bash
    colcon build --symlink-install --packages-select realman_msgs realman_bt
    source install/setup.bash

## 最小启动

默认 dry_run=true，只解析 XML、校验关节目标和参数，不发送 Action goal：

ros2 launch realman_bt arm_move.launch.py \
      arm_id:=r \
      dry_run:=true

## 驱动测试与可视化

先在一个终端启动行为树之外的生产项目：

    ./rm65 up

再在第二个终端启动行为树执行器、预览后端和编辑器：

    ./rm65 bt

编辑器地址为 `http://127.0.0.1:5173/?tree=arm_move.xml`，预览后端为
`http://127.0.0.1:8080`。编辑器中的 Tick/Run 只调用 bt_server 的 preview-only
`MoveJ`，不会连接 ROS Action，也不会移动真实机械臂。按 `Ctrl-C` 会清理这三个行为树进程。

`./rm65 bt` 默认等价于 `dry_run=true`。只有在已清空工作区、低速运行、急停可达并人工确认
目标关节后，才允许显式开启真机执行：

    REALMAN_BT_DRY_RUN=false ./rm65 bt r

此模式仍需确保生产驱动已经由 `./rm65 up` 启动；执行器会向 `/r/execute_motion` 发送真实
`ExecuteMotion` goal。可用 `REALMAN_BT_ARM_ID=l|m|r`、`BT_SERVER_PORT` 和 `BT_EDITOR_PORT`
覆盖默认参数。编辑器保存的是临时 workspace 副本，不会覆盖 `config/behavior-trees/arm_move.xml`。

执行器发布根节点状态：

    /realman_bt_executor/bt_status  (std_msgs/msg/String)

并提供手动控制服务：

    ros2 service call /realman_bt_executor/start std_srvs/srv/Trigger '{}'
    ros2 service call /realman_bt_executor/stop std_srvs/srv/Trigger '{}'

launch 每次运行都会在 REALMAN_LOG_ROOT（未设置时为当前目录下的 logs/）创建
YYYYMMDD_HHMMSS/，并启用彩色 ROS 2 日志。设置 REALMAN_CONFIG_ROOT 后，若其中存在
behavior-trees/arm_move.xml，launch 会优先使用该配置。

## 真机执行

先确保工作区清空、急停可达、速度和目标关节均已人工确认。先完成一次 dry-run，再分别启动驱动和行为树：

终端 1：

    source /opt/ros/humble/setup.bash
    source install/setup.bash
    ros2 launch realman_robot_driver realman_driver.launch.py namespace:=r

终端 2：

    source /opt/ros/humble/setup.bash
    source install/setup.bash
    ros2 launch realman_bt arm_move.launch.py \
      arm_id:=r \
      dry_run:=false \
      tick_rate_hz:=10.0

dry_run=false 会向 /r/execute_motion 发送真实 MoveJ goal。可用以下命令确认 Action 图和执行状态：

    ros2 action info /r/execute_motion
    ros2 topic echo /realman_bt_executor/bt_status

## 参数与限制

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| tree_file | 安装后的 behavior-trees/arm_move.xml | XML 绝对路径 |
| arm_id | r | 只能是 l、m 或 r |
| dry_run | true | true 只校验；false 发真实 goal |
| tick_rate_hz | 10.0 | 行为树 tick 频率（Hz） |
| autostart | true | 节点加载后立即 tick |
| stop_on_terminal | true | SUCCESS/FAILURE 后停止 timer |

当前实现只支持一个 MoveJ 示例节点，不支持 control_mode.xml 中的控制权节点，也不自动注册生产
任务树里的 SelectControlMode、ControlLeaseGuard 等自定义节点。需要扩展树时，应在执行器中显式
注册对应节点，并同步更新 XML 契约测试。
