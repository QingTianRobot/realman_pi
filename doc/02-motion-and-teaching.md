# 运动规划与示教

## 1. 轨迹控制

`MovePlan` 提供五类常用运动和三类透传/跟随接口：

- `rm_movej()`：关节空间运动，目标为关节角列表。
- `rm_movel()`：笛卡尔空间直线运动，目标为位姿。
- `rm_moves()`：样条曲线运动。
- `rm_movec()`：笛卡尔空间圆弧运动。
- `rm_movej_p()`：根据目标位姿进行关节空间运动。
- `rm_movej_canfd()`、`rm_movep_canfd()`：通过 CANFD 透传关节角或位姿。
- `rm_movej_follow()`、`rm_movep_follow()`：关节或笛卡尔跟随运动。
- `rm_set_movev_canfd_init()`、`rm_movev_canfd()`：初始化并发送笛卡尔速度透传。

## 2. 关节运动示例

```python
ret = robot.rm_movej(
    joint=[0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    v=20,
    r=0,
    connect=0,
    block=1,
)
if ret != 0:
    print("movej failed:", ret)
```

官方原型为 `rm_movej(self, joint, v, r, connect, block) -> int`。关节角单位为度；`v` 是 1--100 的速度比例；`r` 是 0--100 的交融半径百分比；`connect=0` 立即执行，`connect=1` 与下一条轨迹一起规划。多线程模式下 `block=0` 为非阻塞、`block=1` 为阻塞；单线程模式下非零值表示阻塞超时秒数。返回 `0` 表示成功，其他值是 API2 错误码。

位姿相关接口使用 `rm_pose_t`，位置单位是米，姿态可以使用欧拉角（弧度）或四元数。务必确认目标位姿与当前工作坐标系、工具坐标系一致。

## 3. 运动状态控制

`ArmMotionControl` 用于处理当前轨迹：

- `rm_set_arm_slow_stop()`：轨迹缓停。
- `rm_set_arm_stop()`：停止轨迹。
- `rm_set_arm_pause()` / `rm_set_arm_continue()`：暂停和继续。
- `rm_set_delete_current_trajectory()`：清除当前轨迹。
- `rm_set_arm_delete_trajectory()`：清除所有轨迹。
- `rm_get_arm_current_trajectory()`：读取当前规划类型。

控制逻辑应把“暂停”“缓停”“停止”和“清除轨迹”区分开，并在每个返回码处做检查。

## 4. 示教与拖动

`ArmTeachMove` 支持关节、位置和姿态步进/示教，并可切换参考坐标系：`rm_set_joint_step()`、`rm_set_pos_step()`、`rm_set_ort_step()`、`rm_set_joint_teach()`、`rm_set_pos_teach()`、`rm_set_ort_teach()`、`rm_set_stop_teach()`、`rm_set_teach_frame()` 和 `rm_get_teach_frame()`。

`DragTeach` 支持开始/结束拖动、复合拖动、灵敏度、电流环与六维力拖动、轨迹保存和复现。复现过程可暂停、继续或停止；在保存或复现前应确认轨迹文件和当前工具/工作坐标系仍然有效。

步进方向枚举包括 `RM_X_DIR_E`、`RM_Y_DIR_E`、`RM_Z_DIR_E` 以及绕轴旋转的 `RM_RX_ROTATE_E`、`RM_RY_ROTATE_E`、`RM_RZ_ROTATE_E`。

官方来源：[轨迹控制](https://develop.realman-robotics.com/robot/apipython/classes/movePlan/)、[运动状态控制](https://develop.realman-robotics.com/robot/apipython/classes/motionControl/)、[示教运动](https://develop.realman-robotics.com/robot/apipython/classes/teachMove/)、[拖动示教](https://develop.realman-robotics.com/robot/apipython/classes/dragTeach/)。
